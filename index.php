<?php

require_once __DIR__ . '/autoload.php';
require_once __DIR__ . '/Router.php';

// Define the base path for the frontend
$basePath = '/wiki-kreative-gen15.5';
// $basePath = '';

// Cargar las definiciones de rutas
$routes = require_once __DIR__ . '/routes.php';

$router = new \App\Frontend\Router($routes, $basePath);
$router->dispatch();
