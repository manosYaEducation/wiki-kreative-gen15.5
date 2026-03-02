<?php

use App\Backend\Controllers\TutorialController;
// 1. IMPORTANTE: Le decimos a PHP que vamos a usar tu nuevo controlador
use App\Backend\Controllers\AuthController;

return [

    // Rutas para Tutoriales (Las que ya tenías)
    'tutorial/get' => ['controller' => TutorialController::class, 'method' => 'GetTutorialById', 'httpMethod' => 'GET'],
    'tutorial/getAll' => ['controller' => TutorialController::class, 'method' => 'GetTutorials', 'httpMethod' => 'GET'],
    'tutorial/create' => ['controller' => TutorialController::class, 'method' => 'createTutorial', 'httpMethod' => 'POST'],
    'tutorial/update' => ['controller' => TutorialController::class, 'method' => 'UpdateTutorial', 'httpMethod' => 'POST'],
    'tutorial/delete' => ['controller' => TutorialController::class, 'method' => 'deleteTutorial', 'httpMethod' => 'POST'],

    // 2. TU NUEVA RUTA DE SEGURIDAD (Misión 3)
    // Cuando alguien llame a 'auth/login', el sistema ejecutará 'login' en tu 'AuthController'
    'auth/login' => [
        'controller' => AuthController::class, 
        'method' => 'login', 
        'httpMethod' => 'POST'
    ]
];