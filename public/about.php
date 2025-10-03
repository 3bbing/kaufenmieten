<?php include __DIR__ . '/partials/header.php'; ?>
        <article class="prose dark:prose-invert max-w-none" aria-labelledby="about-heading">
            <header class="mb-8">
                <p class="text-sm font-semibold uppercase tracking-wide text-primary">Warum dieser Rechner anders ist</p>
                <h1 id="about-heading" class="text-3xl font-bold mt-2 mb-4">Cashflow-Parität statt Äpfel-vs-Birnen</h1>
                <p class="text-lg text-slate-600 dark:text-slate-300">Viele Kauf-vs-Miete-Rechner vergleichen Äpfel mit Birnen: Sie setzen die volle Eigentümerbelastung dem reinen Mietaufwand gegenüber und vergessen, dass Mieter die Differenz investieren können. Unser Ansatz rechnet beides sauber durch – monatlich, inflationsbereinigt und mit drei Anlageklassen.</p>
            </header>

            <section class="space-y-4">
                <h2 class="text-2xl font-semibold">Das Problem mit klassischen Rechnern</h2>
                <p>"Miete ist rausgeworfenes Geld" – dieser Satz hält sich hartnäckig, weil viele Vergleichsrechner Tilgung als Vermögensaufbau verbuchen, ohne zu berücksichtigen, dass Mieter:innen den gleichen Cashflow ebenfalls investieren könnten. Dadurch entsteht ein systematischer Bias zugunsten des Kaufs.</p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>Tilgung wird als Sparrate gezählt, Mietüberschüsse aber nicht.</li>
                    <li>Inflation, Instandhaltung und Hausgeld steigen nicht oder zu langsam.</li>
                    <li>Anlageerträge werden oft als lineare Renditen ohne Steuern modelliert.</li>
                </ul>
            </section>

            <section class="space-y-4">
                <h2 class="text-2xl font-semibold">Unsere Methodik</h2>
                <p>Wir setzen beide Pfade gleich auf: derselbe monatliche Aufwand, monatliche Simulation, realistische Nebenkosten. Überschüsse der Mieter:innen fließen automatisch und gewichtet in drei Anlagetöpfe, Erträge werden monatlich verzinst und Steuern direkt berücksichtigt. Inflation wirkt auf Miete, Hausgeld und Instandhaltung – wer real rechnen möchte, braucht reale Annahmen.</p>
                <div class="grid gap-6 md:grid-cols-2">
                    <div class="p-6 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 class="text-lg font-semibold mb-2">Simulation</h3>
                        <p class="text-sm">Monatlich laufende Cashflows: Zins, Tilgung, Restschuld, Hausgeld, Instandhaltung, Mietzahlungen.</p>
                    </div>
                    <div class="p-6 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <h3 class="text-lg font-semibold mb-2">Anlage &amp; Steuern</h3>
                        <p class="text-sm">Drei Anlagetöpfe mit individuellen Renditen, TER, Steuerannahmen und optionaler Steuerstundung bis zur Entnahme.</p>
                    </div>
                </div>
            </section>

            <section class="space-y-4">
                <h2 class="text-2xl font-semibold">Cashflow-Parität erklärt</h2>
                <p>Cashflow-Parität bedeutet: Wir setzen denselben monatlichen Gesamtaufwand an. Wer kauft, zahlt Annuität (Zins &amp; Tilgung), Hausgeld und Instandhaltung. Wer mietet, zahlt Miete und investiert die Differenz. Ist das Eigentum günstiger, entsteht eine negative Differenz – optional kann diese aus dem Depot entnommen werden (Expertenmodus).</p>
                <p>Dadurch wird die Entscheidung zur Frage, welcher Pfad langfristig mehr Nettovermögen erzeugt – nicht, welcher kurzfristig die höhere Monatsrate hat.</p>
            </section>

            <section class="space-y-4">
                <h2 class="text-2xl font-semibold">Sensitivität &amp; Transparenz</h2>
                <p>Unsere Sensitivitätsmatrix zeigt, wie empfindlich das Ergebnis auf +/- 1 Prozentpunkt Rendite oder Immobilienwertsteigerung reagiert. So erkennst du, wie robust dein Szenario ist und welche Stellschrauben kritisch sind.</p>
                <p>Alle Daten bleiben im Browser, es werden keine Cookies gesetzt, und du kannst deine Eingaben als CSV oder XLSX exportieren, um weiterzurechnen.</p>
            </section>

            <section class="space-y-4">
                <h2 class="text-2xl font-semibold">Hinweis</h2>
                <p>Der Rechner ersetzt keine individuelle Beratung. Ergebnisse hängen stark von Disziplin, Marktentwicklung und persönlichen Rahmenbedingungen ab. Nutze verschiedene Szenarien, teste Stressfälle und prüfe, wie sich Zinsänderungen oder unerwartete Kosten auf dein Vermögen auswirken.</p>
            </section>
        </article>
<?php include __DIR__ . '/partials/footer.php'; ?>
