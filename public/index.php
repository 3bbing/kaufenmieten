<?php include __DIR__ . '/partials/header.php'; ?>
        <section class="space-y-6" aria-labelledby="intro-heading">
            <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 id="intro-heading" class="text-3xl font-semibold tracking-tight">Miete vs. Kauf mit Cashflow-Parität</h1>
                    <p class="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">Vergleiche Eigentum und Mieten fair, reinvestiere Überschüsse automatisch und berücksichtige Inflation, Steuern sowie drei Anlagetöpfe. Passe alle Parameter an und sieh die Ergebnisse live. Es werden keine Daten gespeichert. Die Berechungen sind ohne Gewähr.</p>
                </div>
                <div class="flex flex-wrap gap-3" role="group" aria-label="Szenario-Presets">
                    <button class="preset-btn" type="button" data-preset="conservative">Konservativ</button>
                    <button class="preset-btn" type="button" data-preset="realistic">Realistisch</button>
                    <button class="preset-btn" type="button" data-preset="optimistic">Optimistisch</button>
                </div>
            </div>
        </section>

        <section class="grid gap-6 lg:grid-cols-[minmax(320px,1fr)_minmax(0,2fr)]" aria-labelledby="form-heading">
            <form id="inputs-form" class="space-y-6" novalidate>
                <div class="section-card">
                    <div class="section-header">
                        <h2 id="form-heading" class="section-title">Objekt &amp; Markt</h2>
                        <p class="section-subtitle">Basisdaten zu Kaufobjekt und Mietmarkt.</p>
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2">
                        <label class="form-field">Wohnfläche (m²)
                            <input name="qm" type="number" min="10" step="1" value="115" required>
                        </label>
                        <label class="form-field">Kaufpreis je m² (€)
                            <input name="kaufpreis_pro_qm" type="number" min="500" step="50" value="5500" required>
                        </label>
                        <label class="form-field">Kaufnebenkosten (%)
                            <input name="kaufnebenkosten_prozent" type="number" min="0" max="20" step="0.1" value="11">
                        </label>
                        <label class="form-field">Renovierungskosten je m² (€)
                            <input name="renovierungskosten_pro_qm" type="number" min="0" step="50" value="0">
                        </label>
                        <label class="form-field">Hausgeld/Rücklage/NK je m² (€/Monat)
                            <input name="ruecklage_hausgeld_pro_qm_monat" type="number" min="0" step="0.5" value="5">
                            <span class="text-xs text-slate-500 dark:text-slate-400">Wird auch bei der Miete als Referenz für Nebenkosten ohne Heizung berücksichtigt.</span>
                        </label>
                        <label class="form-field">Kaltmiete je m² (€)
                            <input name="kaltmiete_pro_qm" type="number" min="5" step="0.5" value="14">
                        </label>
                        <label class="form-field">Mietsteigerung (% p.a.)
                            <input name="mietsteigerung_pa" type="number" step="0.1" value="1.5">
                        </label>
                        <label class="form-field">Inflation (% p.a.)
                            <input name="inflation_pa" type="number" step="0.1" value="2.0">
                        </label>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">Finanzierung</h2>
                        <p class="section-subtitle">Finanzierungsstruktur und Tilgungsparamater.</p>
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2">
                        <label class="form-field">Eigenkapital (€)
                            <input name="ek" type="number" min="0" step="1000" value="100000">
                        </label>
                        <label class="form-field">Zins effektiv (% p.a.)
                            <input name="zins_eff_pa" type="number" min="0" step="0.01" value="4.0">
                        </label>
                        <label class="form-field">Tilgung (Angabe % p.a. oder €/Monat)
                            <input name="tilgung_anfang_pa" type="number" min="0" step="0.1" value="2000">
                            <span class="text-xs text-slate-500 dark:text-slate-400">≤ 20 → Tilgung in % p.a., größere Werte → Tilgung in € pro Monat.</span>
                        </label>
                        <label class="form-field">Zinsbindung (Jahre)
                            <input name="zinsbindung_jahre" type="number" min="1" step="1" value="10">
                        </label>
                        <label class="form-field">Laufzeit Simulation (Jahre)
                            <input name="laufzeit_jahre" type="number" min="5" max="50" step="1" value="25">
                        </label>
                        <label class="form-field">Sondertilgung (% p.a.)
                            <input name="sondertilgung_pa" type="number" min="0" step="0.1" value="0">
                        </label>
                        <label class="form-field">Tilgungssatzwechsel erlaubt
                            <input name="tilgungssatzwechsel_erlaubt" type="checkbox">
                        </label>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">Kosten Eigentum &amp; Wertentwicklung</h2>
                        <p class="section-subtitle">Regelmäßige Aufwendungen und Annahmen.</p>
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2">
                        <label class="form-field">Instandhaltung (€/m²·a)
                            <input name="instandhaltung_eur_pro_qm_pa" type="number" min="0" step="1" value="12">
                        </label>
                        <label class="form-field">Hausgeld-Steigerung (% p.a.)
                            <input name="hausgeld_steigerung_pa" type="number" step="0.1" value="2.0">
                        </label>
                        <label class="form-field">Instandhaltung-Steigerung (% p.a.)
                            <input name="instandhaltung_steigerung_pa" type="number" step="0.1" value="2.0">
                        </label>
                        <label class="form-field">Wertzuwachs Immobilie (% p.a. real)
                            <input name="wertsteigerung_immo_pa" type="number" step="0.1" value="3.0">
                            <span class="text-xs text-slate-500 dark:text-slate-400">„Real“ = nach Inflation: tatsächlicher Wertzuwachs zusätzlich zur Inflation.</span>
                        </label>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">Anlagen &amp; Steuern</h2>
                        <p class="section-subtitle">Anteile, Renditen und Steuerannahmen.</p>
                    </div>
                    <div class="grid gap-4 sm:grid-cols-2">
                        <label class="form-field">Anlage A Anteil (%)
                            <input name="anlage1_anteil" type="number" min="0" max="100" step="1" value="60">
                        </label>
                        <label class="form-field">Anlage A Rendite (% p.a.)
                            <input name="anlage1_rendite_pa" type="number" step="0.1" value="5.0">
                        </label>
                        <label class="form-field">Anlage B Anteil (%)
                            <input name="anlage2_anteil" type="number" min="0" max="100" step="1" value="30">
                        </label>
                        <label class="form-field">Anlage B Rendite (% p.a.)
                            <input name="anlage2_rendite_pa" type="number" step="0.1" value="9.0">
                        </label>
                        <label class="form-field">Anlage C Anteil (%)
                            <input name="anlage3_anteil" type="number" min="0" max="100" step="1" value="10">
                        </label>
                        <label class="form-field">Anlage C Rendite (% p.a.)
                            <input name="anlage3_rendite_pa" type="number" step="0.1" value="2.0">
                        </label>
                        <label class="form-field">ETF-Kosten TER (% p.a.)
                            <input name="anlage_ter_pa" type="number" min="0" step="0.01" value="0.2">
                        </label>
                        <label class="form-field">Kapitalertragsteuer (%)
                            <input name="kapitalertragsteuer" type="number" min="0" step="0.5" value="25">
                        </label>
                        <label class="form-field">Solidaritätszuschlag (%)
                            <input name="soli" type="number" min="0" step="0.1" value="5.5">
                        </label>
                        <label class="form-field">Kirchensteuer (%)
                            <input name="kirchensteuer" type="number" min="0" step="0.1" value="0">
                        </label>
                        <label class="form-field flex items-center gap-2">
                            <input name="steuer_bei_entnahme" type="checkbox">
                            <span>Steuer erst bei Entnahme (vereinfachend)</span>
                        </label>
                    </div>
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">Cashflow-Parität</h2>
                        <p class="section-subtitle">Vergleichslogik und Expertenoption.</p>
                    </div>
                    <div class="space-y-4">
                        <label class="flex items-center gap-3 text-sm font-medium">
                            <input name="cashflow_paritaet" type="checkbox" checked>
                            <span>Cashflow-Parität aktivieren (Empfohlen)</span>
                        </label>
                        <label class="flex items-start gap-3 text-sm">
                            <input name="eigentuemer_sparen_nach_tilgung" type="checkbox">
                            <span>
                                Eigentümer spart nach kompletter Tilgung weiter in die Depotstruktur
                                <span class="block text-xs text-slate-500 dark:text-slate-400">Optionaler Ausgleich: Nach Abzahlung wird die Mietdifferenz automatisiert mit den gleichen Rendite-Annahmen reinvestiert.</span>
                            </span>
                        </label>
                        <label class="flex items-center gap-3 text-sm">
                            <input name="experten_abs_diff" type="checkbox">
                            <span>Experten-Modus: Auch negative Differenzen berücksichtigen</span>
                        </label>
                    </div>
                </div>

                <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div class="text-sm text-slate-500 dark:text-slate-400">Summe der Anlageanteile muss 100&nbsp;% ergeben. Felder mit * sind Pflicht.</div>
                    <div class="flex flex-wrap gap-3">
                        <button type="reset" class="btn-secondary">Zurücksetzen</button>
                        <button type="button" id="export-csv" class="btn-primary">Export CSV</button>
                        <button type="button" id="export-settings" class="btn-secondary">Eingaben speichern</button>
                        <button type="button" id="import-settings" class="btn-secondary">Eingaben laden</button>
                        <input type="file" id="import-file" class="hidden" accept="application/json,text/plain">
                    </div>
                </div>
            </form>

            <section class="space-y-6" aria-labelledby="results-heading">
                <div class="section-card">
                    <div class="section-header">
                        <h2 id="results-heading" class="section-title">Ergebnisse</h2>
                        <p class="section-subtitle">Live aktualisierte Kennzahlen und Verlauf.</p>
                    </div>
                    <div class="grid gap-4 md:grid-cols-3" id="kpi-grid" role="status" aria-live="polite">
                        <!-- KPIs via JS -->
                    </div>
                    <p id="warm-rent-note" class="mt-4 text-sm text-slate-500 dark:text-slate-400">Hinweis: Eigenkapital deckt Kaufnebenkosten und reduziert die Restschuld. Das ausgewiesene Immobilienvermögen entspricht Marktwert minus verbleibendem Darlehen.</p>
                    <div id="equity-breakdown" class="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-slate-600 dark:text-slate-300">
                        <!-- Filled via JS -->
                    </div>
                </div>
                <div class="section-card">
                    <div class="section-header">
                        <h2 class="section-title">Verlauf Nettovermögen</h2>
                    </div>
                    <div class="chart-wrapper">
                        <canvas id="wealth-chart" role="img" aria-label="Linienchart des Nettovermögens"></canvas>
                    </div>
                    <p id="interpretation-note" class="mt-4 text-sm text-slate-600 dark:text-slate-300"></p>
                </div>
                        <div class="grid gap-6 md:grid-cols-2">
                            <div class="section-card">
                                <div class="section-header">
                                    <h2 class="section-title">Jahressummen</h2>
                                </div>
                                <div class="chart-wrapper chart-wrapper--short">
                                    <canvas id="annual-chart" role="img" aria-label="Balkendiagramm Jahressummen"></canvas>
                                </div>
                            </div>
                            <div class="section-card">
                                <div class="section-header flex items-center justify-between">
                                    <div>
                                        <h2 class="section-title">Anlageklassen</h2>
                                        <p class="section-subtitle">Verteilung des Depotwerts.</p>
                                    </div>
                                    <div class="text-xs text-slate-500 dark:text-slate-400 space-y-1 text-right">
                                        <div id="allocation-summary"></div>
                                        <div id="anlage-valid"></div>
                                    </div>
                                </div>
                                <div class="chart-wrapper chart-wrapper--short">
                                    <canvas id="allocation-chart" role="img" aria-label="Anteile Anlageklassen"></canvas>
                                </div>
                            </div>
                        </div>
                <details class="summary-card" id="sensitivity-view">
                    <summary>
                        <span>Sensitivitäts-Check anzeigen</span>
                        <span class="summary-indicator" aria-hidden="true">+</span>
                    </summary>
                    <div class="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                        <p>Wir variieren Renditen und Immobilienwertsteigerung jeweils um ±1 Prozentpunkt und berechnen Depot, Immobilienvermögen und Vorsprung neu. Positive Differenz bedeutet Vorteil für den Mietpfad.</p>
                        <div class="table-scroll">
                            <table class="data-table" id="sensitivity-table">
                                <thead>
                                    <tr>
                                        <th>Rendite-Shift</th>
                                        <th>Immo-Shift</th>
                                        <th>Depot gesamt</th>
                                        <th>Immobilienvermögen</th>
                                        <th>Vorsprung</th>
                                        <th>Ø Sparrate/Monat</th>
                                    </tr>
                                </thead>
                                <tbody id="sensitivity-body">
                                    <!-- Rows via JS -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </details>

                <details class="summary-card" id="details-view">
                    <summary>
                        <span>Detailtabellen anzeigen</span>
                        <span class="summary-indicator" aria-hidden="true">+</span>
                    </summary>
                    <div class="mt-6 space-y-8">
                        <div>
                            <h3 class="text-lg font-semibold mb-2">Jährliche Übersicht</h3>
                            <div class="table-scroll">
                                <table class="data-table" id="annual-table">
                                    <thead>
                                        <tr>
                                            <th>Jahr</th>
                                            <th>Restschuld (Ende)</th>
                                            <th>Immobilienvermögen (Wert – Kredit)</th>
                                            <th>Depot gesamt</th>
                                            <th>Vorsprung</th>
                                            <th>Zinslast</th>
                                            <th>Tilgung</th>
                                            <th>Hausgeld</th>
                                            <th>Instandhaltung</th>
                                            <th>Sparrate</th>
                                            <th>Eig.-Sparrate nach Tilgung</th>
                                            <th>Zinsertrag Anlage</th>
                                            <th>Zinsertrag Eigentümer</th>
                                            <th>Depot Eigentümer</th>
                                            <th>Miete</th>
                                            <th>Ø Eigentümerbelastung/Monat</th>
                                            <th>Ø Mietbelastung/Monat</th>
                                    </tr>
                                </thead>
                                    <tbody id="annual-table-body">
                                        <!-- Rows via JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div>
                            <h3 class="text-lg font-semibold mb-2">Erstes Jahr – Monatswerte</h3>
                            <div class="table-scroll">
                                <table class="data-table" id="monthly-table">
                                    <thead>
                                        <tr>
                                            <th>Monat</th>
                                            <th>Restschuld</th>
                                            <th>Zins</th>
                                            <th>Tilgung</th>
                                            <th>Gesamt Eigentümer</th>
                                            <th>Eig.-Sparrate</th>
                                            <th>Depot Eigentümer</th>
                                            <th>Miete</th>
                                            <th>Sparrate</th>
                                            <th>Depot gesamt</th>
                                            <th>Zinsertrag Anlage</th>
                                            <th>Zinsertrag Eigentümer</th>
                                        </tr>
                                    </thead>
                                    <tbody id="monthly-table-body">
                                        <!-- Rows via JS -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </details>
                <div id="final-summary" class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm text-slate-600 dark:text-slate-300"></div>
                <p id="post-payoff-note" class="text-xs text-slate-500 dark:text-slate-400">Nach vollständiger Tilgung der Immobilie werden keine weiteren Sparraten mehr investiert.</p>
            </section>
        </section>
<?php include __DIR__ . '/partials/footer.php'; ?>
