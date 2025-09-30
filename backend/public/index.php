<?php

require_once __DIR__ . '/../../vendor/autoload.php';

(Dotenv\Dotenv::createImmutable(__DIR__ . '/../..'))->load();

use App\Backend\Router;

// Headers para CORS (puedes ajustar según sea necesario)
header("Access-Control-Allow-Origin: http://localhost"); // Permitir solo frontend
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Manejar solicitudes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// La base del path para la API
$basePath = '/wiki-kreative-gen15.5/backend/public';

// Cargar las definiciones de rutas
$routes = require_once __DIR__ . '/../app/Routes/api.php';

$router = new Router($routes, $basePath);
$router->dispatch();
