<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/autoload.php';

use App\Frontend\Router;

// Define the base path for the frontend
//usa la ruta actual 
$basePath = dirname($_SERVER['PHP_SELF']);
//$basePath = '/frontend';

// Cargar las definiciones de rutas
$routes = require_once __DIR__ . '/routes.php';

$router = new Router($routes, $basePath);
$router->dispatch();
