<?php

namespace App\Php;

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use RuntimeException;

class XlsxExporter
{
    public function export(array $payload): string
    {
        if (!class_exists(Spreadsheet::class)) {
            throw new RuntimeException('PhpSpreadsheet ist nicht installiert.');
        }

        $params = $payload['params'] ?? [];
        $result = $payload['result'] ?? [];

        $spreadsheet = new Spreadsheet();
        $spreadsheet->removeSheetByIndex(0);

        $this->buildParameterSheet($spreadsheet, $params, $result['metadata'] ?? []);
        $this->buildMieterSheet($spreadsheet, $result);
        $this->buildEigentuemerSheet($spreadsheet, $result);
        $this->buildSummarySheet($spreadsheet, $result);

        $writer = new Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        return (string) ob_get_clean();
    }

    private function buildParameterSheet(Spreadsheet $spreadsheet, array $params, array $meta): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Parameter');

        $rows = [
            ['Kennzahl', 'Wert'],
            ['Wohnfläche (m²)', $params['qm'] ?? ''],
            ['Kaufpreis/m²', $params['kaufpreis_pro_qm'] ?? ''],
            ['Kaufpreis gesamt', $meta['kaufpreis'] ?? ''],
            ['Kaufnebenkosten', ($meta['kaufnebenkosten'] ?? 0)],
            ['Renovierung', $meta['renovierung'] ?? 0],
            ['Eigenkapital', $params['ek'] ?? 0],
            ['Kreditbetrag', $meta['kreditbetrag'] ?? 0],
            ['Zins eff. p.a.', $params['zins_eff_pa'] ?? 0],
            ['Tilgung p.a.', $params['tilgung_anfang_pa'] ?? 0],
            ['Sondertilgung p.a.', $params['sondertilgung_pa'] ?? 0],
            ['Laufzeit (Jahre)', $params['laufzeit_jahre'] ?? 0],
            ['Wertzuwachs Immo', $params['wertsteigerung_immo_pa'] ?? 0],
            ['Mietsteigerung', $params['mietsteigerung_pa'] ?? 0],
            ['Inflation', $params['inflation_pa'] ?? 0],
        ];

        $rowIndex = 1;
        foreach ($rows as $row) {
            $colIndex = 'A';
            foreach ($row as $value) {
                $sheet->setCellValue($colIndex . $rowIndex, $value);
                $colIndex++;
            }
            $rowIndex++;
        }
    }

    private function buildMieterSheet(Spreadsheet $spreadsheet, array $result): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Mieter');
        $headers = ['Monat', 'Miete', 'Sparrate', 'Depot Summe', 'Depot A', 'Depot B', 'Depot C'];
        foreach ($headers as $index => $header) {
            $sheet->setCellValueByColumnAndRow($index + 1, 1, $header);
        }
        $rows = $result['monthly']['mieter'] ?? [];
        $rowIndex = 2;
        foreach ($rows as $row) {
            $sheet->setCellValueByColumnAndRow(1, $rowIndex, $row['month'] ?? '');
            $sheet->setCellValueByColumnAndRow(2, $rowIndex, $row['miete'] ?? 0);
            $sheet->setCellValueByColumnAndRow(3, $rowIndex, $row['sparrate'] ?? 0);
            $sheet->setCellValueByColumnAndRow(4, $rowIndex, $row['depotSum'] ?? 0);
            $sheet->setCellValueByColumnAndRow(5, $rowIndex, $row['depotA'] ?? 0);
            $sheet->setCellValueByColumnAndRow(6, $rowIndex, $row['depotB'] ?? 0);
            $sheet->setCellValueByColumnAndRow(7, $rowIndex, $row['depotC'] ?? 0);
            $rowIndex++;
        }
    }

    private function buildEigentuemerSheet(Spreadsheet $spreadsheet, array $result): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Eigentümer');
        $headers = ['Monat', 'Zins', 'Tilgung', 'Sonder', 'Hausgeld', 'Instandhaltung', 'Rate', 'Restschuld', 'Immo', 'Netto'];
        foreach ($headers as $index => $header) {
            $sheet->setCellValueByColumnAndRow($index + 1, 1, $header);
        }
        $rows = $result['monthly']['eigentuemer'] ?? [];
        $rowIndex = 2;
        foreach ($rows as $row) {
            $sheet->setCellValueByColumnAndRow(1, $rowIndex, $row['month'] ?? '');
            $sheet->setCellValueByColumnAndRow(2, $rowIndex, $row['zins'] ?? 0);
            $sheet->setCellValueByColumnAndRow(3, $rowIndex, $row['tilg'] ?? 0);
            $sheet->setCellValueByColumnAndRow(4, $rowIndex, $row['sonder'] ?? 0);
            $sheet->setCellValueByColumnAndRow(5, $rowIndex, $row['hausgeld'] ?? 0);
            $sheet->setCellValueByColumnAndRow(6, $rowIndex, $row['instandhaltung'] ?? 0);
            $sheet->setCellValueByColumnAndRow(7, $rowIndex, $row['gesamteRate'] ?? 0);
            $sheet->setCellValueByColumnAndRow(8, $rowIndex, $row['restschuld'] ?? 0);
            $sheet->setCellValueByColumnAndRow(9, $rowIndex, $row['immoWert'] ?? 0);
            $sheet->setCellValueByColumnAndRow(10, $rowIndex, $row['nettoImmo'] ?? 0);
            $rowIndex++;
        }
    }

    private function buildSummarySheet(Spreadsheet $spreadsheet, array $result): void
    {
        $sheet = $spreadsheet->createSheet();
        $sheet->setTitle('Summary');

        $totals = $result['totals'] ?? [];
        $breakEven = $result['breakEven'] ?? null;

        $rows = [
            ['Kennzahl', 'Wert'],
            ['Nettovermögen Miete', $totals['mieterDepot'] ?? 0],
            ['Nettovermögen Kauf', $totals['kaufNetto'] ?? 0],
            ['Differenz', $totals['differenz'] ?? 0],
            ['Restschuld', $totals['restschuld'] ?? 0],
            ['Break-even Monat', $breakEven['month'] ?? 'n/a'],
            ['Break-even Jahr', $breakEven['year'] ?? 'n/a'],
        ];

        $rowIndex = 1;
        foreach ($rows as $row) {
            foreach ($row as $colIndex => $value) {
                $sheet->setCellValueByColumnAndRow($colIndex + 1, $rowIndex, $value);
            }
            $rowIndex++;
        }
    }
}
