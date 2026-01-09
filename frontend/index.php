<?php

require_once __DIR__ . '/autoload.php';

use App\Frontend\Router;

// Define the base path for the frontend
$basePath = '/frontend';
// $basePath = '';

// Cargar las definiciones de rutas
$routes = require_once __DIR__ . '/routes.php';

$router = new Router($routes, $basePath);
$router->dispatch();
