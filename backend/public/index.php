<?php

require_once __DIR__ . '/../../vendor/autoload.php';

(Dotenv\Dotenv::createImmutable(__DIR__ . '/../..'))->load();

use App\Backend\Router;

// Headers para CORS (puedes ajustar según sea necesario) para deployar: https://wiki.alphadocere.cl en lugar de localhost

//ESTA PARA LOCAL
//header("Access-Control-Allow-Origin: localhost"); // Permitir solo frontend

//ESTA PARA DEPLOYAR
//header("Access-Control-Allow-Origin: https://wiki.alphadocere.cl"); 




if (str_contains($_SERVER['HTTP_HOST'], 'localhost') || str_contains($_SERVER['HTTP_HOST'], '127.0.0.1')) {
    header("Access-Control-Allow-Origin: http://localhost");
} else {
    header("Access-Control-Allow-Origin: https://wiki.alphadocere.cl");
}
//header("Access-Control-Allow-Origin: *"); // Permitir solo frontend


header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Manejar solicitudes preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}


if (str_contains($_SERVER['HTTP_HOST'], 'localhost') || str_contains($_SERVER['HTTP_HOST'], '127.0.0.1')) {
    $basePath = '/wiki-kreative-gen15.5/backend/public';
} else {
    $basePath = '/backend';
}

//$basePath = '/backend';


// La base del path para la API
//$basePath = '/wiki-kreative-gen15.5/backend/public';

// 1. Cargar las definiciones de rutas
$routes = require_once __DIR__ . '/../app/Routes/api.php';

$router = new Router($routes, $basePath);

// 2. OBTENER LA RUTA ACTUAL PARA EL GUARDIA
// Esto sirve para saber a qué dirección intenta entrar el usuario
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$route = str_replace($basePath, '', $requestUri);
$route = trim($route, '/');

// 3. LA TAREA DE SEGURIDAD (Misión 4)
// Si la ruta NO es 'auth/login', el guardia debe revisar la cookie
if ($route !== 'auth/login') {
    \App\Backend\Middleware\AuthMiddleware::check();
}

// 4. Si el guardia lo dejó pasar, despachamos la ruta
$router->dispatch();