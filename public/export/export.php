<?php
declare(strict_types=1);

use App\Php\CsvExporter;
use App\Php\XlsxExporter;

$autoload = __DIR__ . '/../../vendor/autoload.php';
if (is_readable($autoload)) {
    require_once $autoload;
}

require_once __DIR__ . '/../../src/Php/CsvExporter.php';
require_once __DIR__ . '/../../src/Php/XlsxExporter.php';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Ungültige Nutzlast']);
    exit;
}

$payload = [
    'params' => $data['params'] ?? [],
    'result' => $data['result'] ?? [],
];

try {
    $exporter = new XlsxExporter();
    $xlsx = $exporter->export($payload);
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="miete-vs-kauf.xlsx"');
    header('Content-Length: ' . strlen($xlsx));
    echo $xlsx;
    exit;
} catch (Throwable $e) {
    $csv = CsvExporter::build($payload);
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="miete-vs-kauf.csv"');
    echo $csv;
    exit;
}
