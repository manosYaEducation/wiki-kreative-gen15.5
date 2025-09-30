<?php

use App\Backend\Controllers\TutorialController;

return [

    // Rutas para Tutoriales
    'tutorial/get' => ['controller' => TutorialController::class, 'method' => 'GetTutorialById', 'httpMethod' => 'GET'],
    'tutorial/getAll' => ['controller' => TutorialController::class, 'method' => 'GetTutorials', 'httpMethod' => 'GET'],
    'tutorial/create' => ['controller' => TutorialController::class, 'method' => 'createTutorial', 'httpMethod' => 'POST'],
    'tutorial/update' => ['controller' => TutorialController::class, 'method' => 'UpdateTutorial', 'httpMethod' => 'POST'],
    'tutorial/delete' => ['controller' => TutorialController::class, 'method' => 'deleteTutorial', 'httpMethod' => 'POST']
];
