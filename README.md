# Miete vs. Kauf Rechner mit Cashflow-Parität

Ein moderner Web-Rechner für den fairen Vergleich zwischen Immobilienkauf und Mieten mit automatischer Reinvestition der Überschüsse.

🌐 **Live Demo:** [kauf-oder-miete.dr-ebbing.de](http://kauf-oder-miete.dr-ebbing.de/)

## ✨ Besonderheiten

Dieser Rechner unterscheidet sich von herkömmlichen Kauf-vs-Miete-Rechnern durch:

- **Cashflow-Parität:** Beide Szenarien werden mit dem gleichen monatlichen Gesamtaufwand verglichen
- **Automatische Reinvestition:** Mietüberschüsse fließen automatisch in drei konfigurierbare Anlagetöpfe
- **Optionaler Eigentümer-Ausgleich:** Nach vollständiger Tilgung kann der Eigentümer die Mietdifferenz automatisiert in die Depotstruktur investieren
- **Realistische Modellierung:** Inflation, Steuern, TER-Kosten und Hausgeld-Steigerungen werden berücksichtigt
- **Live-Berechnung:** Ergebnisse werden in Echtzeit beim Ändern der Parameter aktualisiert
- **Sensitivitätsanalyse:** Prüfung der Robustheit bei ±1% Rendite-/Wertsteigerungsänderungen

## 🎯 Funktionen

### Eingabeparameter
- **Objekt & Markt:** Wohnfläche, Kaufpreis, Nebenkosten, Miete, Inflation
- **Finanzierung:** Eigenkapital, Zinssatz, Tilgung, Zinsbindung, Sondertilgungen
- **Kosten & Wertentwicklung:** Instandhaltung, Hausgeld, Wertsteigerung
- **Anlagen & Steuern:** Drei Anlageklassen mit individuellen Renditen und Steuerbehandlung

### Visualisierung
- **Nettovermögen-Verlauf:** Interaktive Charts mit Chart.js
- **Jahresübersichten:** Balkendiagramme der jährlichen Cashflows
- **Anlageklassen:** Portfolioverteilung als Donut-Chart
- **Detailtabellen:** Monatliche und jährliche Aufschlüsselung aller Werte

### Export-Funktionen
- CSV-Export der Berechnungsergebnisse
- JSON-Export/Import der Eingabeparameter

## 🛠 Technische Architektur

```
├── public/                 # Web-Root
│   ├── index.php          # Hauptrechner-Interface
│   ├── about.php          # Methodikerklärung
│   ├── calc-engine.php    # PHP-Backend für Berechnungen
│   ├── assets/
│   │   ├── css/           # Tailwind CSS Styling
│   │   ├── js/            # Frontend JavaScript
│   │   └── img/           # Logo und Grafiken
│   └── export/
│       └── export.php     # CSV/XLSX Export-Handler
├── src/
│   ├── Calc/
│   │   └── Engine.js      # JavaScript Berechnungslogik
│   └── Php/
│       ├── CsvExporter.php    # CSV Export-Klasse
│       └── XlsxExporter.php   # XLSX Export-Klasse
└── partials/              # PHP Template-Partials
```

### Frontend
- **Vanilla JavaScript:** Keine Framework-Abhängigkeiten
- **Chart.js:** Für interaktive Diagramme
- **Tailwind CSS:** Utility-First CSS Framework
- **Responsive Design:** Mobile-first Ansatz

### Backend
- **PHP 8+:** Serverseitige Logik und Export-Funktionen
- **PhpSpreadsheet:** XLSX-Generierung (optional)
- **No Database:** Alle Berechnungen client-seitig, keine Datenspeicherung

## 📊 Berechnungsmethodik

### Cashflow-Parität
Das Kernkonzept: Beide Szenarien werden mit identischen monatlichen Gesamtkosten verglichen.

**Eigentümer-Szenario:**
- Annuität (Zins + Tilgung)
- Hausgeld und Rücklagen
- Instandhaltungskosten

**Mieter-Szenario:**
- Kaltmiete + anteilige Nebenkosten
- **Differenz wird automatisch investiert** in konfigurierbare Anlagemixe

### Optionaler Ausgleich nach Tilgung
- Aktivierbar über die Checkbox <em>„Eigentümer spart nach kompletter Tilgung weiter in die Depotstruktur“</em>.
- Sobald die Restschuld auf 0 fällt, wird die Differenz aus Warmmiete und laufenden Eigentümerkosten (Hausgeld + Instandhaltung) automatisch in dieselbe Depotstruktur investiert.
- Die Einzahlungen werden mit denselben Renditen, Steuern und TER-Annahmen behandelt wie das Mieterdepot.
- Beispiel: Liegt die Warmmiete nach Tilgung bei 1.500 € und der laufende Eigentümeraufwand bei 350 €, werden 1.150 € monatlich investiert. Bei 5 % Rendite p.a. wächst dieses Eigentümerdepot nach 10 Jahren auf rund 178.000 € (vereinfachter Mittelwert, reale Entwicklung siehe Simulation).

### Simulation
- Monatliche Berechnungsschritte über 5-50 Jahre
- Inflation wirkt auf Miete, Hausgeld und Instandhaltung
- Anlageerträge werden monatlich kapitalisiert
- Steuern wahlweise sofort oder bei Entnahme

## 🚀 Installation & Setup

### Voraussetzungen
- PHP 8.0+ mit Standard-Modulen
- Webserver (Apache/Nginx)
- Optional: Composer für PhpSpreadsheet (XLSX-Export)

### Lokale Entwicklung
```bash
# Repository klonen
git clone https://github.com/3bbing/kaufenmieten.git
cd kaufenmieten

# PHP Development Server starten
php -S localhost:8000 -t public

# Oder mit Apache/Nginx auf public/ Verzeichnis zeigen
```

### XLSX-Export (optional)
```bash
# PhpSpreadsheet via Composer installieren
composer require phpoffice/phpspreadsheet

# In src/Php/XlsxExporter.php aktivieren
```

## 🎨 Anpassung

### Presets
Drei vorkonfigurierte Szenarien in `assets/js/app.js`:
- **Konservativ:** Niedrige Renditen, moderate Wertsteigerung
- **Realistisch:** Ausgewogene Annahmen
- **Optimistisch:** Höhere Renditen und Wertsteigerungen

### Styling
- Tailwind CSS Konfiguration in `assets/css/tailwind.css`
- Custom CSS in `assets/css/app.css`
- Dark Mode Support eingebaut

## 📈 Verwendung

1. **Parameter eingeben:** Alle Eingabefelder sind mit sinnvollen Defaults vorbelegt
2. **Live-Updates:** Ergebnisse ändern sich sofort bei Parametern-Änderung
3. **Szenarien vergleichen:** Nutze die Preset-Buttons für schnelle Vergleiche
4. **Sensitivität prüfen:** Klappe die Sensitivitätsanalyse auf
5. **Daten exportieren:** CSV/XLSX für weitere Analysen



## 🤝 Beitragen

Issues und Pull Requests sind willkommen! Bei größeren Änderungen bitte vorher ein Issue öffnen.

## ⚠️ Haftungsausschluss

Dieser Rechner dient nur zur groben Orientierung und ersetzt keine individuelle Finanzberatung. Alle Berechnungen erfolgen ohne Gewähr.

