<?php
header('Content-Type: application/javascript; charset=utf-8');
$path = __DIR__ . '/../src/Calc/Engine.js';
if (!is_readable($path)) {
    http_response_code(404);
    echo "export function simulate(){ throw new Error('Engine not found'); }";
    exit;
}
echo file_get_contents($path);
