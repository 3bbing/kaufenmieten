<?php

namespace App\Php;

class CsvExporter
{
    public static function build(array $payload): string
    {
        $result = $payload['result'] ?? [];
        $annual = $result['annual'] ?? [];
        $monthlyMieter = $result['monthly']['mieter'] ?? [];
        $monthlyOwner = $result['monthly']['eigentuemer'] ?? [];

        $lines = [];
        $lines[] = 'Jahr;Restschuld Ende;Immobilienvermögen;Depot gesamt;Depot Eigentümer;Vorsprung;Zinslast;Tilgung;Hausgeld;Instandhaltung;Sparrate;Eig.-Sparrate;Zinsertrag Anlage;Zinsertrag Eigentümer;Miete;Ø Eigentümer/Monat;Ø Miete/Monat';
        foreach ($annual as $row) {
            $lines[] = implode(';', [
                self::format($row['year'] ?? ''),
                self::format($row['restschuld'] ?? 0, 2),
                self::format($row['nettoImmo'] ?? 0, 2),
                self::format($row['depotSum'] ?? 0, 2),
                self::format($row['ownerDepotSum'] ?? 0, 2),
                self::format($row['differenz'] ?? 0, 2),
                self::format($row['zins'] ?? 0, 2),
                self::format(($row['tilg'] ?? 0) + ($row['sonder'] ?? 0), 2),
                self::format($row['hausgeld'] ?? 0, 2),
                self::format($row['instandhaltung'] ?? 0, 2),
                self::format($row['sparrate'] ?? 0, 2),
                self::format($row['ownerSparrate'] ?? 0, 2),
                self::format($row['investmentReturn'] ?? 0, 2),
                self::format($row['ownerInvestmentReturn'] ?? 0, 2),
                self::format($row['miete'] ?? 0, 2),
                self::format($row['ownerMonthlyAvg'] ?? 0, 2),
                self::format($row['rentMonthlyAvg'] ?? 0, 2),
            ]);
        }

        $lines[] = '';
        $lines[] = 'Monat;Restschuld;Zins;Tilgung;Sonder;Hausgeld;Instandhaltung;Gesamt Eigentümer;Eig.-Sparrate;Depot Eigentümer;Miete;Sparrate;Depot gesamt;Zinsertrag Anlage;Zinsertrag Eigentümer';
        foreach ($monthlyOwner as $index => $row) {
            $mieter = $monthlyMieter[$index] ?? [];
            $lines[] = implode(';', [
                self::format($row['month'] ?? ''),
                self::format($row['restschuld'] ?? 0, 2),
                self::format($row['zins'] ?? 0, 2),
                self::format($row['tilg'] ?? 0, 2),
                self::format($row['sonder'] ?? 0, 2),
                self::format($row['hausgeld'] ?? 0, 2),
                self::format($row['instandhaltung'] ?? 0, 2),
                self::format($row['ownerTotal'] ?? (($row['gesamteRate'] ?? 0) + ($row['hausgeld'] ?? 0) + ($row['instandhaltung'] ?? 0)), 2),
                self::format($row['ownerSparrate'] ?? 0, 2),
                self::format($row['ownerDepotSum'] ?? 0, 2),
                self::format($mieter['miete'] ?? 0, 2),
                self::format($mieter['sparrate'] ?? 0, 2),
                self::format($mieter['depotSum'] ?? 0, 2),
                self::format($mieter['investmentReturn'] ?? 0, 2),
                self::format($row['ownerInvestmentReturn'] ?? 0, 2),
            ]);
        }

        return implode("\n", $lines);
    }

    private static function format($value, int $decimals = 0): string
    {
        if ($value === '' || $value === null) {
            return '';
        }
        if (!is_numeric($value)) {
            return (string) $value;
        }
        return number_format((float) $value, $decimals, ',', '');
    }
}
