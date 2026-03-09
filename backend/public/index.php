<?php
/**
 * ARCHIVO: backend/public/index.php
 * SISTEMA: Caja Negra (JWT + CORS)
 */

// 1. CONFIGURACIÓN DE CORS (Debe ir antes de cualquier salida de texto)
// Detectamos el origen de la petición para permitir localhost o la URL real
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'http://localhost';

header("Access-Control-Allow-Origin: $origin");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Manejo de peticiones preflight (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. CARGA DE DEPENDENCIAS Y VARIABLES DE ENTORNO
require_once __DIR__ . '/../../vendor/autoload.php';

// Cargamos el .env desde la raíz del backend
$dotenvPath = __DIR__ . '/../..';
if (file_exists($dotenvPath . '/.env')) {
    $dotenv = Dotenv\Dotenv::createImmutable($dotenvPath);
    $dotenv->load();
}

use App\Backend\Router;

// 3. CONFIGURACIÓN DEL PATH BASE DINÁMICO
// Esto asegura que funcione en tu XAMPP local independientemente de la carpeta
if (str_contains($_SERVER['HTTP_HOST'], 'localhost') || str_contains($_SERVER['HTTP_HOST'], '127.0.0.1')) {
    $basePath = '/wiki-kreative-gen15.5/backend/public';
} else {
    $basePath = '/backend'; // Ajuste para el servidor de producción
}

// 4. DESPACHO DE RUTAS
// Cargamos el archivo de rutas que ya tienes configurado
$routesFile = __DIR__ . '/../app/Routes/api.php';

if (file_exists($routesFile)) {
    $routes = require_once $routesFile;
    
    // Instanciamos el Router con las rutas y el path base detectado
    $router = new Router($routes, $basePath);
    
    // El Router se encargará de ejecutar el AuthController y pasar por el Middleware
    $router->dispatch();
} else {
    echo json_encode([
        "success" => false, 
        "error" => "Archivo de rutas no encontrado en el sistema."
    ]);
}