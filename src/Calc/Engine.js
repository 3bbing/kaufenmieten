/**
 * Pure calculation engine for the Miete vs. Kauf comparison.
 * The module exposes deterministic helpers without touching the DOM.
 */

export function pmt(ratePerPeriod, numberOfPayments, principal) {
    if (ratePerPeriod === 0) {
        return numberOfPayments === 0 ? 0 : principal / numberOfPayments;
    }
    const factor = Math.pow(1 + ratePerPeriod, numberOfPayments);
    return (principal * ratePerPeriod * factor) / (factor - 1);
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function toDecimal(value) {
    return typeof value === 'number' ? value : Number(value ?? 0);
}

function calcEffectiveTax(kest, soli, church) {
    const base = clamp(kest, 0, 1);
    const add = clamp(soli, 0, 1) + clamp(church, 0, 1);
    return base * (1 + add);
}

function computeMonthlyRate(params) {
    const months = Math.max(Math.round(params.laufzeit_jahre * 12), 1);
    const monthlyInterest = params.zins_eff_pa / 12;
    const annuityByPmt = pmt(monthlyInterest, months, params.kreditbetrag);
    const annuityByTilgung = params.kreditbetrag * (params.zins_eff_pa + params.tilgung_anfang_pa) / 12;
    // prefer explicit tilgung setting when provided, otherwise use PMT result
    if (params.tilgung_anfang_pa > 0) {
        return Math.max(annuityByTilgung, annuityByPmt);
    }
    return annuityByPmt;
}

export function simulate(input, options = {}) {
    const params = { ...input };
    const months = Math.max(Math.round(params.laufzeit_jahre * 12), 1);

    params.qm = toDecimal(params.qm);
    params.kaufpreis_pro_qm = toDecimal(params.kaufpreis_pro_qm);
    params.kaufnebenkosten_prozent = toDecimal(params.kaufnebenkosten_prozent);
    params.renovierungskosten_pro_qm = toDecimal(params.renovierungskosten_pro_qm);
    params.ruecklage_hausgeld_pro_qm_monat = toDecimal(params.ruecklage_hausgeld_pro_qm_monat);
    params.kaltmiete_pro_qm = toDecimal(params.kaltmiete_pro_qm);
    params.mietsteigerung_pa = toDecimal(params.mietsteigerung_pa);
    params.inflation_pa = toDecimal(params.inflation_pa);
    params.ek = toDecimal(params.ek);
    params.zins_eff_pa = toDecimal(params.zins_eff_pa);
    params.tilgung_anfang_pa = toDecimal(params.tilgung_anfang_pa);
    params.zinsbindung_jahre = toDecimal(params.zinsbindung_jahre ?? 0);
    params.laufzeit_jahre = toDecimal(params.laufzeit_jahre);
    params.sondertilgung_pa = toDecimal(params.sondertilgung_pa ?? 0);
    params.instandhaltung_eur_pro_qm_pa = toDecimal(params.instandhaltung_eur_pro_qm_pa);
    params.hausgeld_steigerung_pa = toDecimal(params.hausgeld_steigerung_pa);
    params.instandhaltung_steigerung_pa = toDecimal(params.instandhaltung_steigerung_pa ?? params.inflation_pa);
    params.wertsteigerung_immo_pa = toDecimal(params.wertsteigerung_immo_pa);
    params.anlage1_anteil = toDecimal(params.anlage1_anteil);
    params.anlage2_anteil = toDecimal(params.anlage2_anteil);
    params.anlage3_anteil = toDecimal(params.anlage3_anteil);
    params.anlage1_rendite_pa = toDecimal(params.anlage1_rendite_pa);
    params.anlage2_rendite_pa = toDecimal(params.anlage2_rendite_pa);
    params.anlage3_rendite_pa = toDecimal(params.anlage3_rendite_pa);
    params.anlage_ter_pa = toDecimal(params.anlage_ter_pa ?? 0);
    params.kapitalertragsteuer = toDecimal(params.kapitalertragsteuer ?? 0.25);
    params.soli = toDecimal(params.soli ?? 0);
    params.kirchensteuer = toDecimal(params.kirchensteuer ?? 0);
    params.cashflow_paritaet = Boolean(params.cashflow_paritaet);
    params.experten_abs_diff = Boolean(params.experten_abs_diff);
    params.steuer_bei_entnahme = Boolean(params.steuer_bei_entnahme);
    params.eigentuemer_sparen_nach_tilgung = Boolean(params.eigentuemer_sparen_nach_tilgung);

    const kaufpreis = params.kaufpreis_pro_qm * params.qm;
    const kaufnebenkosten = kaufpreis * params.kaufnebenkosten_prozent;
    const renovierung = params.renovierungskosten_pro_qm * params.qm;
    const totalInvest = kaufpreis + kaufnebenkosten + renovierung;
    const kreditbetrag = Math.max(totalInvest - params.ek, 0);
    const kaltmiete0 = params.kaltmiete_pro_qm * params.qm;
    const hausgeld0 = params.ruecklage_hausgeld_pro_qm_monat * params.qm;
    const nebenkosten0 = Number.isFinite(params.nebenkosten_monat) ? params.nebenkosten_monat : hausgeld0;
    const warmmiete0 = kaltmiete0 + nebenkosten0;
    const instandhaltung0 = (params.instandhaltung_eur_pro_qm_pa * params.qm) / 12;
    const monthlyInterest = params.zins_eff_pa / 12;
    const sondertilgungMonat = kreditbetrag * params.sondertilgung_pa / 12;
    const effectiveTax = calcEffectiveTax(params.kapitalertragsteuer, params.soli, params.kirchensteuer);

    const rate = kreditbetrag > 0 ? computeMonthlyRate({ ...params, kreditbetrag }) : 0;
    const ownerMonthlyStart = rate + sondertilgungMonat + hausgeld0 + instandhaltung0;
    const tilgungInitial = kreditbetrag > 0 ? Math.max(rate - kreditbetrag * monthlyInterest, 0) : 0;

    const initialDepotTotal = params.ek;
    const initialDepotA = initialDepotTotal * params.anlage1_anteil;
    const initialDepotB = initialDepotTotal * params.anlage2_anteil;
    const initialDepotC = initialDepotTotal * params.anlage3_anteil;
    const initialDepotSum = initialDepotA + initialDepotB + initialDepotC;

    let rest = kreditbetrag;
    let immo = kaufpreis;
    let depotA = initialDepotA;
    let depotB = initialDepotB;
    let depotC = initialDepotC;
    let depotAContrib = params.steuer_bei_entnahme ? initialDepotA : 0;
    let depotBContrib = params.steuer_bei_entnahme ? initialDepotB : 0;
    let depotCContrib = params.steuer_bei_entnahme ? initialDepotC : 0;
    let contribA = initialDepotA;
    let contribB = initialDepotB;
    let contribC = initialDepotC;
    let growthA = 0;
    let growthB = 0;
    let growthC = 0;
    let ownerDepotA = 0;
    let ownerDepotB = 0;
    let ownerDepotC = 0;
    let ownerContribA = 0;
    let ownerContribB = 0;
    let ownerContribC = 0;
    let ownerGrowthA = 0;
    let ownerGrowthB = 0;
    let ownerGrowthC = 0;
    let ownerDepotAContrib = 0;
    let ownerDepotBContrib = 0;
    let ownerDepotCContrib = 0;
    let breakEvenMonth = null;
    let payoffMonth = null;
    let firstMonthSnapshot = null;
    const monthlySeriesMieter = options.summaryOnly ? null : [];
    const monthlySeriesEigentuemer = options.summaryOnly ? null : [];

    const annual = [{
        year: 0,
        restschuld: rest,
        nettoImmo: immo - rest,
        depotSum: initialDepotSum,
        differenz: initialDepotSum - (immo - rest),
        zins: 0,
        tilg: 0,
        sonder: 0,
        hausgeld: 0,
        instandhaltung: 0,
        sparrate: 0,
        ownerSparrate: 0,
        miete: 0,
        ownerTotal: 0,
        ownerMonthlyAvg: ownerMonthlyStart,
        rentMonthlyAvg: warmmiete0,
        sparrateMonthlyAvg: 0,
        depotA: initialDepotA,
        depotB: initialDepotB,
        depotC: initialDepotC,
        investmentReturn: 0,
        ownerDepotSum: 0,
        ownerInvestmentReturn: 0,
        ownerSparrateMonthlyAvg: 0,
    }];
    let acc = {
        year: 1,
        months: 0,
        miete: 0,
        sparrate: 0,
        ownerTotal: 0,
        zins: 0,
        tilg: 0,
        sonder: 0,
        hausgeld: 0,
        instandhaltung: 0,
        investReturn: 0,
        ownerInvestReturn: 0,
        ownerSparrate: 0,
    };

    for (let t = 1; t <= months; t++) {
        const yearProgress = t / 12;
        const miete_kalt_t = kaltmiete0 * Math.pow(1 + params.mietsteigerung_pa, yearProgress);
        const hausgeld_t = hausgeld0 * Math.pow(1 + params.hausgeld_steigerung_pa, yearProgress);
        const nebenkosten_t = nebenkosten0 * Math.pow(1 + params.hausgeld_steigerung_pa, yearProgress);
        const miete_t = miete_kalt_t + nebenkosten_t;
        const instandhaltung_t = instandhaltung0 * Math.pow(1 + params.instandhaltung_steigerung_pa, yearProgress);
        immo = immo * Math.pow(1 + params.wertsteigerung_immo_pa, 1 / 12);

        const currentRate = rest > 0 ? rate : 0;
        const zins = rest > 0 ? rest * monthlyInterest : 0;
        const tilgPotential = Math.max(currentRate - zins, 0);
        const sonder = rest > 0 ? Math.min(sondertilgungMonat, rest) : 0;
        const tilg = Math.min(tilgPotential, rest - sonder);
        rest = Math.max(rest - tilg - sonder, 0);

        const ownerBase = currentRate + sonder + hausgeld_t + instandhaltung_t;
        let ownerSparrate = 0;
        if (params.eigentuemer_sparen_nach_tilgung && rest <= 0) {
            ownerSparrate = Math.max(miete_t - ownerBase, 0);
        }
        const owner_total = ownerBase + ownerSparrate;
        const diff = owner_total - miete_t;
        let sparrate = 0;
        if (rest > 0 && params.cashflow_paritaet) {
            sparrate = params.experten_abs_diff ? diff : Math.max(diff, 0);
        }

        const anteilA = params.anlage1_anteil;
        const anteilB = params.anlage2_anteil;
        const anteilC = params.anlage3_anteil;
        const sparA = sparrate * anteilA;
        const sparB = sparrate * anteilB;
        const sparC = sparrate * anteilC;
        const ownerSparA = ownerSparrate * anteilA;
        const ownerSparB = ownerSparrate * anteilB;
        const ownerSparC = ownerSparrate * anteilC;

        const ter = params.anlage_ter_pa;
        const renditeA = params.anlage1_rendite_pa - ter;
        const renditeB = params.anlage2_rendite_pa - ter;
        const renditeC = params.anlage3_rendite_pa - ter;
        const monthlyFactor = params.steuer_bei_entnahme ? 1 : (1 - effectiveTax);

        const rA_m = renditeA / 12 * (params.steuer_bei_entnahme ? 1 : monthlyFactor);
        const rB_m = renditeB / 12 * (params.steuer_bei_entnahme ? 1 : monthlyFactor);
        const rC_m = renditeC / 12 * (params.steuer_bei_entnahme ? 1 : monthlyFactor);

        const prevA = depotA;
        const prevB = depotB;
        const prevC = depotC;
        const gainA = prevA * rA_m;
        const gainB = prevB * rB_m;
        const gainC = prevC * rC_m;
        const ownerPrevA = ownerDepotA;
        const ownerPrevB = ownerDepotB;
        const ownerPrevC = ownerDepotC;
        const ownerGainA = ownerPrevA * rA_m;
        const ownerGainB = ownerPrevB * rB_m;
        const ownerGainC = ownerPrevC * rC_m;

        depotA = prevA + gainA + sparA;
        depotB = prevB + gainB + sparB;
        depotC = prevC + gainC + sparC;
        ownerDepotA = ownerPrevA + ownerGainA + ownerSparA;
        ownerDepotB = ownerPrevB + ownerGainB + ownerSparB;
        ownerDepotC = ownerPrevC + ownerGainC + ownerSparC;

        contribA += sparA;
        contribB += sparB;
        contribC += sparC;
        growthA += gainA;
        growthB += gainB;
        growthC += gainC;
        ownerContribA += ownerSparA;
        ownerContribB += ownerSparB;
        ownerContribC += ownerSparC;
        ownerGrowthA += ownerGainA;
        ownerGrowthB += ownerGainB;
        ownerGrowthC += ownerGainC;

        if (params.steuer_bei_entnahme) {
            depotAContrib += sparA;
            depotBContrib += sparB;
            depotCContrib += sparC;
            ownerDepotAContrib += ownerSparA;
            ownerDepotBContrib += ownerSparB;
            ownerDepotCContrib += ownerSparC;
        }

        const depotSum = depotA + depotB + depotC;
        const nettoImmo = immo - rest;
        const ownerDepotSum = ownerDepotA + ownerDepotB + ownerDepotC;

        if (breakEvenMonth === null && depotSum >= nettoImmo) {
            breakEvenMonth = t;
        }

        if (rest <= 0 && payoffMonth === null) {
            payoffMonth = t;
        }

        if (t === 1) {
            firstMonthSnapshot = {
                ownerTotal: owner_total,
                miete: miete_t,
                sparrate,
                ownerSparrate,
                zins,
                tilg: tilg + sonder,
                hausgeld: hausgeld_t,
                instandhaltung: instandhaltung_t,
                rate: currentRate,
                restschuld: rest,
                depotSum,
                ownerDepotSum,
            };
        }

        if (!options.summaryOnly) {
            monthlySeriesMieter.push({
                month: t,
                miete: miete_t,
                sparrate,
                depotA,
                depotB,
                depotC,
                depotSum,
                investmentReturn: gainA + gainB + gainC,
                ownerTotal: owner_total,
            });
            monthlySeriesEigentuemer.push({
                month: t,
                zins,
                tilg,
                sonder,
                hausgeld: hausgeld_t,
                instandhaltung: instandhaltung_t,
                gesamteRate: currentRate + sonder,
                restschuld: rest,
                immoWert: immo,
                nettoImmo,
                ownerTotal: owner_total,
                ownerSparrate,
                ownerDepotSum,
                ownerInvestmentReturn: ownerGainA + ownerGainB + ownerGainC,
            });
        }

        acc.months += 1;
        acc.miete += miete_t;
        acc.sparrate += sparrate;
        acc.ownerTotal += owner_total;
        acc.zins += zins;
        acc.tilg += tilg;
        acc.sonder += sonder;
        acc.hausgeld += hausgeld_t;
        acc.instandhaltung += instandhaltung_t;
        acc.investReturn += gainA + gainB + gainC;
        acc.ownerInvestReturn += ownerGainA + ownerGainB + ownerGainC;
        acc.ownerSparrate += ownerSparrate;

        if (t % 12 === 0 || t === months) {
            const monthsInPeriod = acc.months;
            const ownerMonthlyAvg = monthsInPeriod > 0 ? acc.ownerTotal / monthsInPeriod : 0;
            const rentMonthlyAvg = monthsInPeriod > 0 ? acc.miete / monthsInPeriod : 0;
            const sparrateMonthlyAvg = monthsInPeriod > 0 ? acc.sparrate / monthsInPeriod : 0;
            const ownerSparrateMonthlyAvg = monthsInPeriod > 0 ? acc.ownerSparrate / monthsInPeriod : 0;

            annual.push({
                year: Math.ceil(t / 12),
                miete: acc.miete,
                sparrate: acc.sparrate,
                ownerTotal: acc.ownerTotal,
                zins: acc.zins,
                tilg: acc.tilg,
                sonder: acc.sonder,
                hausgeld: acc.hausgeld,
                instandhaltung: acc.instandhaltung,
                depotSum,
                ownerDepotSum,
                nettoImmo,
                restschuld: rest,
                differenz: depotSum - nettoImmo,
                ownerMonthlyAvg,
                rentMonthlyAvg,
                sparrateMonthlyAvg,
                ownerSparrate: acc.ownerSparrate,
                ownerSparrateMonthlyAvg,
                investmentReturn: acc.investReturn,
                ownerInvestmentReturn: acc.ownerInvestReturn,
                depotA,
                depotB,
                depotC,
            });
            acc = {
                year: Math.ceil(t / 12) + 1,
                months: 0,
                miete: 0,
                sparrate: 0,
                ownerTotal: 0,
                zins: 0,
                tilg: 0,
                sonder: 0,
                hausgeld: 0,
                instandhaltung: 0,
                investReturn: 0,
                ownerInvestReturn: 0,
                ownerSparrate: 0,
            };
        }
    }

    let depotSumFinal = depotA + depotB + depotC;
    let totalGrowth = growthA + growthB + growthC;
    let totalContrib = contribA + contribB + contribC;
    let ownerDepotSumFinal = ownerDepotA + ownerDepotB + ownerDepotC;
    let ownerTotalGrowth = ownerGrowthA + ownerGrowthB + ownerGrowthC;
    let ownerTotalContrib = ownerContribA + ownerContribB + ownerContribC;
    if (params.steuer_bei_entnahme) {
        const taxBaseA = Math.max(depotA - depotAContrib, 0);
        const taxBaseB = Math.max(depotB - depotBContrib, 0);
        const taxBaseC = Math.max(depotC - depotCContrib, 0);
        const taxDue = (taxBaseA + taxBaseB + taxBaseC) * effectiveTax;
        depotSumFinal = depotSumFinal - taxDue;
        totalGrowth -= taxDue;

        const ownerTaxBaseA = Math.max(ownerDepotA - ownerDepotAContrib, 0);
        const ownerTaxBaseB = Math.max(ownerDepotB - ownerDepotBContrib, 0);
        const ownerTaxBaseC = Math.max(ownerDepotC - ownerDepotCContrib, 0);
        const ownerTaxDue = (ownerTaxBaseA + ownerTaxBaseB + ownerTaxBaseC) * effectiveTax;
        ownerDepotSumFinal -= ownerTaxDue;
        ownerTotalGrowth -= ownerTaxDue;
    }

    const nettoImmoFinal = Math.max(immo - rest, 0);
    const diff = depotSumFinal - nettoImmoFinal;

    const netRateA = params.anlage1_rendite_pa - params.anlage_ter_pa;
    const netRateB = params.anlage2_rendite_pa - params.anlage_ter_pa;
    const netRateC = params.anlage3_rendite_pa - params.anlage_ter_pa;
    const weightedRate = (params.anlage1_anteil * netRateA) + (params.anlage2_anteil * netRateB) + (params.anlage3_anteil * netRateC);

    return {
        metadata: {
            kaufpreis,
            kaufnebenkosten,
            renovierung,
            totalInvest,
            kreditbetrag,
            warmmiete: warmmiete0,
            kaltmieteStart: kaltmiete0,
            warmmieteStart: warmmiete0,
            hausgeld0,
            instandhaltung0,
            rate,
            sondertilgungMonat,
            months,
            ownerMonthlyStart,
            renterMonthlyStart: warmmiete0,
            tilgungInitial: tilgungInitial + sondertilgungMonat,
            sparrateStart: firstMonthSnapshot ? firstMonthSnapshot.sparrate : (params.cashflow_paritaet ? Math.max(ownerMonthlyStart - warmmiete0, 0) : 0),
            equityTotal: params.ek,
            equityCosts: Math.min(params.ek, kaufnebenkosten + renovierung),
            equityProperty: Math.max(params.ek - (kaufnebenkosten + renovierung), 0),
            equityDepotStart: initialDepotSum,
            nebenkosten_monat: nebenkosten0,
            depotContribution: totalContrib,
            depotReturn: totalGrowth,
            depotBreakdown: {
                a: { value: depotA, contribution: contribA, growth: growthA, rate: netRateA, share: params.anlage1_anteil },
                b: { value: depotB, contribution: contribB, growth: growthB, rate: netRateB, share: params.anlage2_anteil },
                c: { value: depotC, contribution: contribC, growth: growthC, rate: netRateC, share: params.anlage3_anteil },
                weightedRate,
            },
            immoGrowth: params.wertsteigerung_immo_pa,
            ownerPostPayoffInvestActive: params.eigentuemer_sparen_nach_tilgung,
            ownerDepotSumFinal,
            ownerDepotContribution: ownerTotalContrib,
            ownerDepotReturn: ownerTotalGrowth,
            ownerDepotBreakdown: {
                a: { value: ownerDepotA, contribution: ownerContribA, growth: ownerGrowthA, rate: netRateA, share: params.anlage1_anteil },
                b: { value: ownerDepotB, contribution: ownerContribB, growth: ownerGrowthB, rate: netRateB, share: params.anlage2_anteil },
                c: { value: ownerDepotC, contribution: ownerContribC, growth: ownerGrowthC, rate: netRateC, share: params.anlage3_anteil },
                weightedRate,
            },
        },
        monthly: options.summaryOnly ? null : {
            mieter: monthlySeriesMieter,
            eigentuemer: monthlySeriesEigentuemer,
        },
        annual,
        totals: {
            mieterDepot: depotSumFinal,
            kaufNetto: nettoImmoFinal,
            differenz: diff,
            restschuld: rest,
            eigentuemerDepot: ownerDepotSumFinal,
        },
        breakEven: breakEvenMonth !== null ? {
            month: breakEvenMonth,
            year: Math.ceil(breakEvenMonth / 12),
        } : null,
        payoff: payoffMonth !== null ? {
            month: payoffMonth,
            year: Math.ceil(payoffMonth / 12),
        } : null,
        firstMonth: firstMonthSnapshot,
    };
}

export function validateAnlageSplit(a, b, c) {
    const sum = a + b + c;
    const withinTolerance = Math.abs(sum - 1) < 0.001;
    return { valid: withinTolerance, sum };
}

export function buildSensitivity(baseParams) {
    const shifts = [-0.01, 0, 0.01];
    const rows = [];
    for (const renditeShift of shifts) {
        for (const immoShift of shifts) {
            const adjusted = {
                ...baseParams,
                anlage1_rendite_pa: baseParams.anlage1_rendite_pa + renditeShift,
                anlage2_rendite_pa: baseParams.anlage2_rendite_pa + renditeShift,
                anlage3_rendite_pa: baseParams.anlage3_rendite_pa + renditeShift,
                wertsteigerung_immo_pa: baseParams.wertsteigerung_immo_pa + immoShift,
            };
            const result = simulate(adjusted, { summaryOnly: true });
            const firstYear = result.annual.find(entry => entry.year === 1);
            rows.push({
                renditeShift,
                immoShift,
                nettoMiete: result.totals.mieterDepot,
                nettoKauf: result.totals.kaufNetto,
                differenz: result.totals.differenz,
                avgSparrate: firstYear ? firstYear.sparrateMonthlyAvg : 0,
            });
        }
    }
    return rows;
}
