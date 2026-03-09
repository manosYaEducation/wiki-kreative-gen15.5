<?php

use App\Backend\Controllers\TutorialController;
use App\Backend\Controllers\AuthController;

return [
    // --- RUTAS PÚBLICAS (Cualquiera las puede ver) ---
    'tutorial/get' => [
        'controller' => TutorialController::class, 
        'method' => 'GetTutorialById', 
        'httpMethod' => 'GET',
        'auth' => false // Público
    ],
    'tutorial/getAll' => [
        'controller' => TutorialController::class, 
        'method' => 'GetTutorials', 
        'httpMethod' => 'GET',
        'auth' => false // Público
    ],

    // --- RUTAS PROTEGIDAS (Solo con Token JWT / Admin) ---
    'tutorial/create' => [
        'controller' => TutorialController::class, 
        'method' => 'createTutorial', 
        'httpMethod' => 'POST',
        'auth' => true  // 🔒 Requiere Login
    ],
    'tutorial/update' => [
        'controller' => TutorialController::class, 
        'method' => 'UpdateTutorial', 
        'httpMethod' => 'POST',
        'auth' => true  // 🔒 Requiere Login
    ],
    'tutorial/delete' => [
        'controller' => TutorialController::class, 
        'method' => 'deleteTutorial', 
        'httpMethod' => 'POST',
        'auth' => true  // 🔒 Requiere Login
    ],

    // --- AUTENTICACIÓN ---
    'auth/login' => [
        'controller' => AuthController::class, 
        'method' => 'login', 
        'httpMethod' => 'POST',
        'auth' => false // Debe ser público para poder entrar
    ],
    'auth/logout' => [
        'controller' => AuthController::class, 
        'method' => 'logout', 
        'httpMethod' => 'POST',
        'auth' => true  // Solo alguien logueado puede desloguearse
    ]
];