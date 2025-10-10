import { simulate, buildSensitivity, validateAnlageSplit } from '/calc-engine.php';

const form = document.getElementById('inputs-form');
const kpiGrid = document.getElementById('kpi-grid');
const sensitivityBody = document.getElementById('sensitivity-body');
const anlageValidEl = document.getElementById('anlage-valid');
const presetButtons = document.querySelectorAll('.preset-btn');
const exportCsvBtn = document.getElementById('export-csv');
const exportSettingsBtn = document.getElementById('export-settings');
const importSettingsBtn = document.getElementById('import-settings');
const importFileInput = document.getElementById('import-file');
const annualTableBody = document.getElementById('annual-table-body');
const monthlyTableBody = document.getElementById('monthly-table-body');
const detailsView = document.getElementById('details-view');
const sensitivityView = document.getElementById('sensitivity-view');
const breakdownEl = document.getElementById('equity-breakdown');
const allocationSummaryEl = document.getElementById('allocation-summary');
const finalSummaryEl = document.getElementById('final-summary');
const warmRentNoteEl = document.getElementById('warm-rent-note');
const interpretationNoteEl = document.getElementById('interpretation-note');
const postPayoffNoteEl = document.getElementById('post-payoff-note');

let wealthChart;
let annualChart;
let allocationChart;
let latestResult;

const numberFormatter = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const currencyFormatter = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat('de-DE', { style: 'percent', maximumFractionDigits: 1 });

function parseNumber(value, fallback = 0) {
    const num = Number(String(value).replace(',', '.'));
    return Number.isFinite(num) ? num : fallback;
}

function gatherParams() {
    const data = new FormData(form);
    const num = (name, fallback = 0) => parseNumber(data.get(name), fallback);
    const bool = (name) => !!data.get(name);

    const qm = num('qm', 1);
    const kaufpreis_pro_qm = num('kaufpreis_pro_qm', 0);
    const kaufnebenkosten = num('kaufnebenkosten_prozent', 10) / 100;
    const renovierung_pro_qm = num('renovierungskosten_pro_qm', 0);
    const ruecklage = num('ruecklage_hausgeld_pro_qm_monat', 0);
    const kaltmiete = num('kaltmiete_pro_qm', 0);
    const mietsteigerung = num('mietsteigerung_pa', 0) / 100;
    const inflation = num('inflation_pa', 0) / 100;

    const ek = num('ek', 0);
    const zins = num('zins_eff_pa', 0) / 100;
    const tilgungRaw = parseNumber(data.get('tilgung_anfang_pa'), 0);
    const zinsbindung = num('zinsbindung_jahre', 0);
    const laufzeit = num('laufzeit_jahre', 20);
    const sondertilgung = num('sondertilgung_pa', 0) / 100;

    const instandhaltung = num('instandhaltung_eur_pro_qm_pa', 0);
    const hausgeldRaw = data.get('hausgeld_steigerung_pa');
    const instandhaltungRaw = data.get('instandhaltung_steigerung_pa');
    const hausgeldSteigerung = hausgeldRaw === null || hausgeldRaw === '' ? NaN : parseNumber(hausgeldRaw) / 100;
    const instandhaltungSteigerung = instandhaltungRaw === null || instandhaltungRaw === '' ? NaN : parseNumber(instandhaltungRaw) / 100;
    const wertsteigerung = num('wertsteigerung_immo_pa', 0) / 100;

    const anlage1Anteil = num('anlage1_anteil', 0) / 100;
    const anlage2Anteil = num('anlage2_anteil', 0) / 100;
    const anlage3Anteil = num('anlage3_anteil', 0) / 100;

    const anlage1Rendite = num('anlage1_rendite_pa', 0) / 100;
    const anlage2Rendite = num('anlage2_rendite_pa', 0) / 100;
    const anlage3Rendite = num('anlage3_rendite_pa', 0) / 100;
    const anlageTer = num('anlage_ter_pa', 0) / 100;

    const kest = num('kapitalertragsteuer', 25) / 100;
    const soli = num('soli', 0) / 100;
    const kirchensteuer = num('kirchensteuer', 0) / 100;

    const kaufpreis = kaufpreis_pro_qm * qm;
    const kaufnebenkostenAbs = kaufpreis * kaufnebenkosten;
    const renovierung = renovierung_pro_qm * qm;
    const kreditbetrag = Math.max(kaufpreis + kaufnebenkostenAbs + renovierung - ek, 0);
    const nebkostenMonat = ruecklage * qm;

    let tilgung = tilgungRaw / 100;
    let tilgungMonat = null;
    if (tilgungRaw > 20) {
        tilgungMonat = tilgungRaw;
        const derived = kreditbetrag > 0 ? (tilgungMonat * 12) / kreditbetrag : 0;
        tilgung = Number.isFinite(derived) ? derived : 0;
    }

    return {
        qm,
        kaufpreis_pro_qm,
        kaufnebenkosten_prozent: kaufnebenkosten,
        renovierungskosten_pro_qm: renovierung_pro_qm,
        ruecklage_hausgeld_pro_qm_monat: ruecklage,
        kaltmiete_pro_qm: kaltmiete,
        mietsteigerung_pa: mietsteigerung,
        inflation_pa: inflation,
        nebenkosten_monat: nebkostenMonat,
        ek,
        zins_eff_pa: zins,
        tilgung_anfang_pa: tilgung,
        tilgung_user_monat: tilgungMonat,
        zinsbindung_jahre: zinsbindung,
        laufzeit_jahre: laufzeit,
        sondertilgung_pa: sondertilgung,
        tilgungssatzwechsel_erlaubt: bool('tilgungssatzwechsel_erlaubt'),
        instandhaltung_eur_pro_qm_pa: instandhaltung,
        hausgeld_steigerung_pa: Number.isFinite(hausgeldSteigerung) ? hausgeldSteigerung : inflation,
        instandhaltung_steigerung_pa: Number.isFinite(instandhaltungSteigerung) ? instandhaltungSteigerung : inflation,
        wertsteigerung_immo_pa: wertsteigerung,
        anlage1_anteil: anlage1Anteil,
        anlage2_anteil: anlage2Anteil,
        anlage3_anteil: anlage3Anteil,
        anlage1_rendite_pa: anlage1Rendite,
        anlage2_rendite_pa: anlage2Rendite,
        anlage3_rendite_pa: anlage3Rendite,
        anlage_ter_pa: anlageTer,
        kapitalertragsteuer: kest,
        soli,
        kirchensteuer,
        cashflow_paritaet: bool('cashflow_paritaet'),
        experten_abs_diff: bool('experten_abs_diff'),
        steuer_bei_entnahme: bool('steuer_bei_entnahme'),
        eigentuemer_sparen_nach_tilgung: bool('eigentuemer_sparen_nach_tilgung'),
    };
}

function formatCurrency(value) {
    const num = Number.isFinite(value) ? value : 0;
    return currencyFormatter.format(Math.round(num));
}

function formatNumber(value) {
    const num = Number.isFinite(value) ? value : 0;
    return numberFormatter.format(Math.round(num));
}

function renderKpis(result) {
    const depot = result.totals.mieterDepot;
    const kauf = result.totals.kaufNetto;
    const diff = result.totals.differenz;
    const restschuld = result.totals.restschuld;
    const breakEven = result.breakEven;
    const payoff = result.payoff;
    const ownerMonthlyStart = result.metadata.ownerMonthlyStart;
    const renterMonthlyStart = result.metadata.renterMonthlyStart;
    const sparrateStart = result.metadata.sparrateStart;
    const annuitaetStart = result.metadata.rate + result.metadata.sondertilgungMonat;
    const firstYear = result.annual.find(row => row.year === 1);
    const avgSparrateYearOne = firstYear ? firstYear.sparrateMonthlyAvg : sparrateStart;
    const contributionSum = formatCurrency(result.metadata.depotContribution ?? 0);
    const returnSum = formatCurrency(result.metadata.depotReturn ?? 0);
    const ownerDepotSum = result.metadata.ownerDepotSumFinal ?? 0;
    const ownerContributionSum = formatCurrency(result.metadata.ownerDepotContribution ?? 0);
    const ownerReturnSum = formatCurrency(result.metadata.ownerDepotReturn ?? 0);

    const cards = [
        {
            title: 'Nettovermögen Miete + Anlage',
            value: formatCurrency(depot),
            hint: `Depot gesamt nach ${result.metadata.months / 12} Jahren`,
            info: `Zuwachs: Sparbeträge ${contributionSum}, Rendite ${returnSum}`,
        },
        {
            title: 'Nettovermögen Eigentum',
            value: formatCurrency(kauf),
            hint: `Immobilienwert minus Restschuld (${formatCurrency(restschuld)})`,
        },
        {
            title: diff >= 0 ? 'Vorsprung Miete' : 'Vorsprung Kauf',
            value: formatCurrency(Math.abs(diff)),
            hint: breakEven ? `Break-even ca. Jahr ${breakEven.year}` : 'Kein Break-even im Zeitraum',
        },
        {
            title: 'Monatliche Eigentümerbelastung (Start)',
            value: formatCurrency(ownerMonthlyStart),
            hint: `Annuität ${formatCurrency(annuitaetStart)} + Hausgeld ${formatCurrency(result.metadata.hausgeld0)} + Instandhaltung ${formatCurrency(result.metadata.instandhaltung0)}`,
        },
        {
            title: 'Annuität (Start, ohne Nebenkosten)',
            value: formatCurrency(annuitaetStart),
            hint: 'Rate aus Zins, Tilgung und Sondertilgung',
        },
        {
            title: 'Warmmiete (Start)',
            value: formatCurrency(renterMonthlyStart),
            hint: `Parität-Sparrate zu Beginn: ${formatCurrency(sparrateStart)}`,
        },
        {
            title: 'Ø Sparrate Jahr 1',
            value: formatCurrency(avgSparrateYearOne),
            hint: 'Durchschnittliche monatliche Parität-Sparrate im ersten Jahr',
        },
        {
            title: 'Darlehen getilgt',
            value: payoff ? `Jahr ${payoff.year}` : 'Nicht im Zeitraum',
            hint: payoff ? `Restschuld nach Monat ${payoff.month} = 0` : `Restschuld Ende: ${formatCurrency(restschuld)}`,
        },
    ];

    if (result.metadata.ownerPostPayoffInvestActive) {
        cards.push({
            title: 'Depot Eigentümer nach Tilgung',
            value: formatCurrency(ownerDepotSum),
            hint: `Beiträge ${ownerContributionSum}, Rendite ${ownerReturnSum}`,
        });
    }

    kpiGrid.innerHTML = cards.map(card => `
        <div>
            <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">${card.title}${card.info ? `<span class="info-icon" title="${card.info}">ℹ︎</span>` : ''}</p>
            <p class="text-2xl font-semibold mt-2">${card.value}</p>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${card.hint}</p>
        </div>
    `).join('');
}

function renderCharts(result) {
    const ctxWealth = document.getElementById('wealth-chart').getContext('2d');
    const ctxAnnual = document.getElementById('annual-chart').getContext('2d');
    const ctxAlloc = document.getElementById('allocation-chart').getContext('2d');

    const labels = result.annual.map(item => `Jahr ${item.year}`);
    const sanitize = (value) => Number.isFinite(value) ? Math.round(value) : 0;
    const depotSeries = result.annual.map(item => sanitize(item.depotSum));
    const immoSeries = result.annual.map(item => sanitize(item.nettoImmo));

    if (wealthChart) {
        wealthChart.data.labels = labels;
        wealthChart.data.datasets[0].data = depotSeries;
        wealthChart.data.datasets[1].data = immoSeries;
        wealthChart.update();
    } else {
        wealthChart = new Chart(ctxWealth, {
            type: 'line',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Miete + Anlage',
                        data: depotSeries,
                        borderColor: '#2563eb',
                        tension: 0.35,
                        fill: false,
                    },
                    {
                        label: 'Kauf (Netto)',
                        data: immoSeries,
                        borderColor: '#f97316',
                        tension: 0.35,
                        fill: false,
                    }
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    y: { ticks: { callback: value => numberFormatter.format(value) + ' €' } },
                },
            }
        });
    }

    const annualOwner = result.annual.map(item => sanitize(item.ownerTotal));
    const annualRent = result.annual.map(item => sanitize(item.miete));
    const annualSparrate = result.annual.map(item => sanitize(item.sparrate));

    if (annualChart) {
        annualChart.data.labels = labels;
        annualChart.data.datasets[0].data = annualRent;
        annualChart.data.datasets[1].data = annualOwner;
        annualChart.data.datasets[2].data = annualSparrate;
        annualChart.update();
    } else {
        annualChart = new Chart(ctxAnnual, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Gezahlte Miete',
                        data: annualRent,
                        backgroundColor: 'rgba(37, 99, 235, 0.6)',
                    },
                    {
                        label: 'Eigentümer-Aufwand',
                        data: annualOwner,
                        backgroundColor: 'rgba(249, 115, 22, 0.6)',
                    },
                    {
                        label: 'Investiert (Summe Sparrate)',
                        data: annualSparrate,
                        type: 'line',
                        borderColor: '#22c55e',
                        backgroundColor: 'rgba(34,197,94,0.15)',
                        tension: 0.3,
                        yAxisID: 'y',
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { stacked: false, ticks: { callback: value => numberFormatter.format(value) + ' €' } },
                },
            }
        });
    }

    const breakdown = result.metadata?.depotBreakdown;
    const dataA = sanitize(breakdown?.a?.value ?? 0);
    const dataB = sanitize(breakdown?.b?.value ?? 0);
    const dataC = sanitize(breakdown?.c?.value ?? 0);
    const labelA = `Anlage A (${((breakdown?.a?.rate ?? 0) * 100).toFixed(1)} % p.a.)`;
    const labelB = `Anlage B (${((breakdown?.b?.rate ?? 0) * 100).toFixed(1)} % p.a.)`;
    const labelC = `Anlage C (${((breakdown?.c?.rate ?? 0) * 100).toFixed(1)} % p.a.)`;

    if (allocationSummaryEl && breakdown) {
        const fmtRate = (value = 0) => `${(value * 100).toFixed(2)} %`;
        const fmtShare = (value = 0) => `${Math.round(value * 100)} %`;
        allocationSummaryEl.innerHTML = [
            `Ø Rendite (gewichtet): ${fmtRate(breakdown.weightedRate ?? 0)}`,
            `A ${fmtShare(breakdown.a?.share ?? 0)} @ ${fmtRate(breakdown.a?.rate ?? 0)}`,
            `B ${fmtShare(breakdown.b?.share ?? 0)} @ ${fmtRate(breakdown.b?.rate ?? 0)}`,
            `C ${fmtShare(breakdown.c?.share ?? 0)} @ ${fmtRate(breakdown.c?.rate ?? 0)}`,
        ].join('<br>');
    } else if (allocationSummaryEl) {
        allocationSummaryEl.innerHTML = '';
    }

    if (allocationChart) {
        allocationChart.data.labels = [labelA, labelB, labelC];
        allocationChart.data.datasets[0].data = [dataA, dataB, dataC];
        allocationChart.update();
    } else {
        allocationChart = new Chart(ctxAlloc, {
            type: 'doughnut',
            data: {
                labels: [labelA, labelB, labelC],
                datasets: [
                    {
                        data: [dataA, dataB, dataC],
                        backgroundColor: ['#2563eb', '#10b981', '#f59e0b'],
                    }
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
            }
        });
    }
}

function renderSensitivityTable(baseParams) {
    if (!sensitivityBody) return;
    const rows = buildSensitivity(baseParams);
    sensitivityBody.innerHTML = rows.map(row => `
        <tr>
            <td class="py-2 pr-4">${percentFormatter.format(row.renditeShift)}</td>
            <td class="py-2 pr-4">${percentFormatter.format(row.immoShift)}</td>
            <td class="py-2 pr-4">${formatCurrency(row.nettoMiete)}</td>
            <td class="py-2 pr-4">${formatCurrency(row.nettoKauf)}</td>
            <td class="py-2 pr-4 font-semibold ${row.differenz >= 0 ? 'text-emerald-500' : 'text-rose-500'}">${formatCurrency(row.differenz)}</td>
            <td class="py-2 pr-4">${formatCurrency(row.avgSparrate)}</td>
        </tr>
    `).join('');
}

function renderBreakdown(result) {
    if (!breakdownEl) return;
    const meta = result.metadata;
    const items = [
        { label: 'Eigenkapital gesamt', value: meta.equityTotal },
        { label: 'Davon Kaufnebenkosten & Renovierung', value: meta.equityCosts },
        { label: 'Eigenkapital im Objekt (Start)', value: meta.equityProperty },
        { label: 'Start-Depot Miet-Szenario', value: meta.equityDepotStart },
        { label: 'Gesamtinvest (Kaufpreis + Kosten)', value: meta.totalInvest },
    ];
    if (meta.ownerPostPayoffInvestActive) {
        items.push({ label: 'Depot Eigentümer nach Tilgung', value: meta.ownerDepotSumFinal });
    }
    breakdownEl.innerHTML = items.map(item => `
        <div>
            <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">${item.label}</p>
            <p class="font-semibold">${formatCurrency(item.value)}</p>
        </div>
    `).join('');
}

function renderFinalSummary(result) {
    if (!finalSummaryEl) return;
    const annual = result.annual;
    if (!annual || annual.length === 0) {
        finalSummaryEl.innerHTML = '';
        return;
    }
    const last = annual[annual.length - 1];
    const entries = [
        { label: 'Jahr', value: String(last.year), format: 'text' },
        { label: 'Restschuld (Ende)', value: last.restschuld },
        { label: 'Immobilienvermögen', value: last.nettoImmo },
        { label: 'Depot gesamt', value: last.depotSum },
        { label: 'Depot Eigentümer', value: last.ownerDepotSum },
        { label: 'Vorsprung', value: last.differenz },
        { label: 'Zinslast', value: last.zins },
        { label: 'Tilgung', value: (last.tilg ?? 0) + (last.sonder ?? 0) },
        { label: 'Hausgeld', value: last.hausgeld },
        { label: 'Instandhaltung', value: last.instandhaltung },
        { label: 'Sparrate', value: last.sparrate },
        { label: 'Eig.-Sparrate nach Tilgung', value: last.ownerSparrate ?? 0 },
        { label: 'Zinsertrag Anlage', value: last.investmentReturn },
        { label: 'Zinsertrag Eigentümer', value: last.ownerInvestmentReturn ?? 0 },
        { label: 'Miete', value: last.miete },
        { label: 'Ø Eigentümer/Monat', value: last.ownerMonthlyAvg },
        { label: 'Ø Miete/Monat', value: last.rentMonthlyAvg },
    ];
    finalSummaryEl.innerHTML = entries.map(entry => `
        <div>
            <dl>
                <dt>${entry.label}</dt>
                <dd>${entry.format === 'text' ? entry.value : formatCurrency(entry.value)}</dd>
            </dl>
        </div>
    `).join('');
}

function renderWarmRentNote(result) {
    if (!warmRentNoteEl) return;
    const meta = result?.metadata;
    if (!meta) {
        warmRentNoteEl.textContent = 'Hinweis: Eigenkapital deckt Kaufnebenkosten und reduziert die Restschuld. Das ausgewiesene Immobilienvermögen entspricht Marktwert minus verbleibendem Darlehen.';
        return;
    }
    const kalt = formatCurrency(meta.kaltmieteStart ?? 0);
    const warm = formatCurrency(meta.warmmieteStart ?? 0);
    const nk = formatCurrency(meta.nebenkosten_monat ?? 0);
    const ownerNote = meta.ownerPostPayoffInvestActive
        ? ' Nach vollständiger Tilgung wird die Differenz zur Miete gemäß deiner Depotkonfiguration weiter investiert.'
        : ' Nach vollständiger Tilgung endet die Paritätssparrate.';
    warmRentNoteEl.textContent = `Die Kaltmiete von ${kalt} wird zur Warmmiete von ${warm} ergänzt (inkl. ${nk} Nebenkosten ohne Heizung). Diese Nebenkosten werden als Referenz sowohl beim Eigentümer (Hausgeld/Rücklage) als auch beim Mieter berücksichtigt, damit die Cashflow-Parität stimmt.${ownerNote}`;
}

function renderPostPayoffNote(result) {
    if (!postPayoffNoteEl) return;
    const active = result?.metadata?.ownerPostPayoffInvestActive;
    if (active) {
        const depot = formatCurrency(result?.metadata?.ownerDepotSumFinal ?? 0);
        postPayoffNoteEl.textContent = `Aktivierter Ausgleich: Nach vollständiger Tilgung spart der Eigentümer die Mietdifferenz weiter und erreicht ein Depot von ${depot}.`;
    } else {
        postPayoffNoteEl.textContent = 'Nach vollständiger Tilgung der Immobilie werden keine weiteren Sparraten mehr investiert.';
    }
}

function renderInterpretation(result) {
    if (!interpretationNoteEl) return;
    const meta = result?.metadata;
    if (!meta) {
        interpretationNoteEl.textContent = '';
        return;
    }
    const immoGrowth = (meta.immoGrowth ?? 0) * 100;
    const depotRate = ((meta.depotBreakdown?.weightedRate) ?? 0) * 100;
    const formatPercent = (value) => `${value.toFixed(2)} %`;
    const fall1 = depotRate > immoGrowth;
    const conclusion = fall1
        ? 'Es wird einen Punkt geben, an dem das Depot langfristig aufholt und überholt.'
        : 'Kein Kipppunkt: Immobilienwert wächst mindestens so stark wie das Depot, Kaufen bleibt vorn.';
    interpretationNoteEl.textContent = `Wenn die erwartete ETF-Rendite höher ist als die Immobilienwertsteigerung, wächst das Depot langfristig schneller. Dann gibt es selbst bei zeitweisem Vorsprung des Immobilienkaufs einen „Kipppunkt“, ab dem Mieten+Investieren mehr Vermögen erzeugt als Kaufen. Wenn die Immobilienwertsteigerung mindestens so hoch ist wie die ETF-Rendite, bleibt Kaufen dauerhaft im Vorteil – es kommt zu keinem Umschwung. In deinem Szenario (Immobilienwachstum ${formatPercent(immoGrowth)} p.a. vs. Depotrendite ${formatPercent(depotRate)} p.a.) bedeutet das: ${conclusion}`;
}

function collectRawForm() {
    const values = {};
    if (!form) return values;
    Array.from(form.elements).forEach((el) => {
        if (!el.name) return;
        if (el.type === 'checkbox') {
            values[el.name] = el.checked;
        } else {
            values[el.name] = el.value;
        }
    });
    return values;
}

function applyRawForm(values = {}) {
    if (!form) return;
    Array.from(form.elements).forEach((el) => {
        const name = el.name;
        if (!name || !(name in values)) return;
        if (el.type === 'checkbox') {
            el.checked = Boolean(values[name]);
        } else {
            el.value = values[name];
        }
    });
}

function exportSettings() {
    const payload = {
        version: 1,
        generatedAt: new Date().toISOString(),
        values: collectRawForm(),
    };
    const content = JSON.stringify(payload, null, 2);
    downloadBlob(content, 'miete-vs-kauf-settings.json', 'application/json');
}

function importSettings(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const payload = JSON.parse(event.target.result);
            if (!payload || typeof payload !== 'object' || typeof payload.values !== 'object') {
                throw new Error('Ungültiges Format');
            }
            applyRawForm(payload.values);
            triggerUpdate();
        } catch (error) {
            alert('Datei konnte nicht geladen werden: ' + error.message);
        } finally {
            if (importFileInput) {
                importFileInput.value = '';
            }
        }
    };
    reader.readAsText(file);
}

function renderDetailTables(result) {
    if (annualTableBody) {
        annualTableBody.innerHTML = result.annual.map(row => `
            <tr>
                <td>${row.year}</td>
                <td>${formatCurrency(row.restschuld ?? 0)}</td>
                <td>${formatCurrency(row.nettoImmo ?? 0)}</td>
                <td>${formatCurrency(row.depotSum ?? 0)}</td>
                <td class="${(row.differenz ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}">${formatCurrency(row.differenz ?? 0)}</td>
                <td>${formatCurrency(row.zins ?? 0)}</td>
                <td>${formatCurrency((row.tilg ?? 0) + (row.sonder ?? 0))}</td>
                <td>${formatCurrency(row.hausgeld ?? 0)}</td>
                <td>${formatCurrency(row.instandhaltung ?? 0)}</td>
                <td>${formatCurrency(row.sparrate ?? 0)}</td>
                <td>${formatCurrency(row.ownerSparrate ?? 0)}</td>
                <td>${formatCurrency(row.investmentReturn ?? 0)}</td>
                <td>${formatCurrency(row.ownerInvestmentReturn ?? 0)}</td>
                <td>${formatCurrency(row.ownerDepotSum ?? 0)}</td>
                <td>${formatCurrency(row.miete ?? 0)}</td>
                <td>${formatCurrency(row.ownerMonthlyAvg ?? 0)}</td>
                <td>${formatCurrency(row.rentMonthlyAvg ?? 0)}</td>
            </tr>
        `).join('');
    }

    if (monthlyTableBody && result.monthly) {
        const months = result.monthly.eigentuemer.slice(0, 12);
        monthlyTableBody.innerHTML = months.map((row, index) => {
            const mieterRow = result.monthly.mieter[index];
            return `
                <tr>
                    <td>${row.month}</td>
                    <td>${formatCurrency(row.restschuld ?? 0)}</td>
                    <td>${formatCurrency(row.zins ?? 0)}</td>
                    <td>${formatCurrency((row.tilg ?? 0) + (row.sonder ?? 0))}</td>
                    <td>${formatCurrency(row.ownerTotal ?? (row.gesamteRate ?? 0) + (row.hausgeld ?? 0) + (row.instandhaltung ?? 0))}</td>
                    <td>${formatCurrency(row.ownerSparrate ?? 0)}</td>
                    <td>${formatCurrency(row.ownerDepotSum ?? 0)}</td>
                    <td>${formatCurrency(mieterRow?.miete ?? 0)}</td>
                    <td>${formatCurrency(mieterRow?.sparrate ?? 0)}</td>
                    <td>${formatCurrency(mieterRow?.depotSum ?? 0)}</td>
                    <td>${formatCurrency(mieterRow?.investmentReturn ?? 0)}</td>
                    <td>${formatCurrency(row.ownerInvestmentReturn ?? 0)}</td>
                </tr>
            `;
        }).join('');
    }
}

function updateAnlageValidation(params) {
    const { valid, sum } = validateAnlageSplit(params.anlage1_anteil, params.anlage2_anteil, params.anlage3_anteil);
    if (valid) {
        anlageValidEl.textContent = 'Anteile ok (' + percentFormatter.format(sum) + ')';
        anlageValidEl.classList.remove('text-rose-500');
        anlageValidEl.classList.add('text-emerald-500');
    } else {
        anlageValidEl.textContent = 'Summe Anteile = ' + percentFormatter.format(sum) + ' → bitte auf 100 % anpassen';
        anlageValidEl.classList.add('text-rose-500');
        anlageValidEl.classList.remove('text-emerald-500');
    }
    return valid;
}

function ensurePresets(button) {
    const preset = button.dataset.preset;
    if (!preset) return;
    const presets = {
        conservative: {
            anlage1_rendite_pa: 0.04,
            anlage2_rendite_pa: 0.015,
            anlage3_rendite_pa: 0.01,
            wertsteigerung_immo_pa: 0.005,
            mietsteigerung_pa: 0.01,
        },
        realistic: {
            anlage1_rendite_pa: 0.06,
            anlage2_rendite_pa: 0.02,
            anlage3_rendite_pa: 0.01,
            wertsteigerung_immo_pa: 0.015,
            mietsteigerung_pa: 0.015,
        },
        optimistic: {
            anlage1_rendite_pa: 0.07,
            anlage2_rendite_pa: 0.03,
            anlage3_rendite_pa: 0.015,
            wertsteigerung_immo_pa: 0.02,
            mietsteigerung_pa: 0.02,
        },
    };
    const values = presets[preset];
    if (!values) return;
    const setPercentValue = (name, value) => {
        const input = form.querySelector(`[name="${name}"]`);
        if (!input) return;
        input.value = (value * 100).toFixed(2);
    };
    setPercentValue('anlage1_rendite_pa', values.anlage1_rendite_pa);
    setPercentValue('anlage2_rendite_pa', values.anlage2_rendite_pa);
    setPercentValue('anlage3_rendite_pa', values.anlage3_rendite_pa);
    setPercentValue('wertsteigerung_immo_pa', values.wertsteigerung_immo_pa);
    setPercentValue('mietsteigerung_pa', values.mietsteigerung_pa);
    triggerUpdate();
}

function buildCsv(result) {
    const lines = [];
    lines.push('"Jahr";"Restschuld Ende";"Immobilienvermögen";"Depot gesamt";"Depot Eigentümer";"Vorsprung";"Zinslast";"Tilgung";"Hausgeld";"Instandhaltung";"Sparrate";"Eig.-Sparrate";"Zinsertrag Anlage";"Zinsertrag Eigentümer";"Miete";"Ø Eigentümer/Monat";"Ø Miete/Monat"');
    result.annual.forEach(row => {
        lines.push([
            row.year,
            Number(row.restschuld ?? 0).toFixed(2),
            Number(row.nettoImmo ?? 0).toFixed(2),
            Number(row.depotSum ?? 0).toFixed(2),
            Number(row.ownerDepotSum ?? 0).toFixed(2),
            Number(row.differenz ?? 0).toFixed(2),
            Number(row.zins ?? 0).toFixed(2),
            Number((row.tilg ?? 0) + (row.sonder ?? 0)).toFixed(2),
            Number(row.hausgeld ?? 0).toFixed(2),
            Number(row.instandhaltung ?? 0).toFixed(2),
            Number(row.sparrate ?? 0).toFixed(2),
            Number(row.ownerSparrate ?? 0).toFixed(2),
            Number(row.investmentReturn ?? 0).toFixed(2),
            Number(row.ownerInvestmentReturn ?? 0).toFixed(2),
            Number(row.miete ?? 0).toFixed(2),
            Number(row.ownerMonthlyAvg ?? 0).toFixed(2),
            Number(row.rentMonthlyAvg ?? 0).toFixed(2),
        ].join(';'));
    });

    lines.push('');
    lines.push('"Monat";"Restschuld";"Zins";"Tilgung";"Sonder";"Hausgeld";"Instandhaltung";"Gesamt Eigentümer";"Eig.-Sparrate";"Depot Eigentümer";"Miete";"Sparrate";"Depot gesamt";"Zinsertrag Anlage";"Zinsertrag Eigentümer"');
    result.monthly.eigentuemer.forEach((row, index) => {
        const renter = result.monthly.mieter[index];
        lines.push([
            row.month,
            Number(row.restschuld ?? 0).toFixed(2),
            Number(row.zins ?? 0).toFixed(2),
            Number(row.tilg ?? 0).toFixed(2),
            Number(row.sonder ?? 0).toFixed(2),
            Number(row.hausgeld ?? 0).toFixed(2),
            Number(row.instandhaltung ?? 0).toFixed(2),
            Number(row.ownerTotal ?? (row.gesamteRate ?? 0) + (row.hausgeld ?? 0) + (row.instandhaltung ?? 0)).toFixed(2),
            Number(row.ownerSparrate ?? 0).toFixed(2),
            Number(row.ownerDepotSum ?? 0).toFixed(2),
            Number(renter?.miete ?? 0).toFixed(2),
            Number(renter?.sparrate ?? 0).toFixed(2),
            Number(renter?.depotSum ?? 0).toFixed(2),
            Number(renter?.investmentReturn ?? 0).toFixed(2),
            Number(row.ownerInvestmentReturn ?? 0).toFixed(2),
        ].join(';'));
    });

    return lines.join('\n');
}

function downloadBlob(content, fileName, type = 'text/csv') {
    const blob = content instanceof Blob ? content : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    requestAnimationFrame(() => {
        URL.revokeObjectURL(url);
        link.remove();
    });
}

function computeAndRender() {
    const params = gatherParams();
    const valid = updateAnlageValidation(params);
    if (!valid) {
        kpiGrid.innerHTML = '<p class="text-sm text-rose-500">Bitte Anlageanteile auf 100 % anpassen.</p>';
        if (annualTableBody) annualTableBody.innerHTML = '';
        if (monthlyTableBody) monthlyTableBody.innerHTML = '';
        if (sensitivityBody) sensitivityBody.innerHTML = '';
        if (breakdownEl) breakdownEl.innerHTML = '';
        if (finalSummaryEl) finalSummaryEl.innerHTML = '';
        if (warmRentNoteEl) warmRentNoteEl.textContent = 'Bitte Anlageanteile auf 100 % anpassen.';
        if (postPayoffNoteEl) postPayoffNoteEl.textContent = 'Nach vollständiger Tilgung der Immobilie werden keine weiteren Sparraten mehr investiert.';
        if (interpretationNoteEl) interpretationNoteEl.textContent = '';
        return { params, result: null, valid };
    }
    const result = simulate(params);
    latestResult = result;
    renderKpis(result);
    renderCharts(result);
    renderSensitivityTable(params);
    renderBreakdown(result);
    renderDetailTables(result);
    renderFinalSummary(result);
    renderWarmRentNote(result);
    renderPostPayoffNote(result);
    renderInterpretation(result);
    return { params, result, valid };
}

let updateScheduled = false;

function triggerUpdate() {
    if (updateScheduled) return;
    updateScheduled = true;
    requestAnimationFrame(() => {
        updateScheduled = false;
        computeAndRender();
    });
}

function init() {
    if (!form) return;
    form.addEventListener('input', triggerUpdate);
    form.addEventListener('change', triggerUpdate);
    form.addEventListener('reset', () => {
        setTimeout(() => triggerUpdate(), 10);
    });

    const presetDescriptions = {
        conservative: 'Annahme: Rendite 4/1,5/1 %, Immobilienwert 0,5 %, Mietsteigerung 1 %',
        realistic: 'Annahme: Rendite 6/2/1 %, Immobilienwert 1,5 %, Mietsteigerung 1,5 %',
        optimistic: 'Annahme: Rendite 7/3/1,5 %, Immobilienwert 2 %, Mietsteigerung 2 %',
    };
    presetButtons.forEach(button => {
        const preset = button.dataset.preset;
        if (preset && presetDescriptions[preset]) {
            button.title = presetDescriptions[preset];
        }
        button.addEventListener('click', () => ensurePresets(button));
    });

    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', () => {
            const { result, valid } = computeAndRender();
            if (!valid || !result) return;
            const csv = buildCsv(result);
            downloadBlob(csv, 'miete-vs-kauf.csv');
        });
    }

    if (exportSettingsBtn) {
        exportSettingsBtn.addEventListener('click', () => {
            exportSettings();
        });
    }

    if (importSettingsBtn && importFileInput) {
        importSettingsBtn.addEventListener('click', () => {
            importFileInput.click();
        });
        importFileInput.addEventListener('change', () => {
            const file = importFileInput.files?.[0];
            if (file) {
                importSettings(file);
            }
        });
    }

    const updateIndicator = (detailsEl) => {
        if (!detailsEl) return;
        const indicator = detailsEl.querySelector('.summary-indicator');
        if (indicator) {
            indicator.textContent = detailsEl.open ? '−' : '+';
        }
    };

    if (detailsView) {
        updateIndicator(detailsView);
        detailsView.addEventListener('toggle', () => updateIndicator(detailsView));
    }

    if (sensitivityView) {
        updateIndicator(sensitivityView);
        sensitivityView.addEventListener('toggle', () => updateIndicator(sensitivityView));
    }

    triggerUpdate();
}

document.addEventListener('DOMContentLoaded', init);
