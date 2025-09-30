<?php

namespace App\Backend\Controllers;

use App\Backend\Models\TutorialModel;

class TutorialController
{
    private $tutorialModel;

    public function __construct()
    {
        $this->tutorialModel = new TutorialModel();
    }

    public function GetTutorialById()
    {
        $id = $_GET['id'] ?? null;
        if (!$id) {
            return $this->sendJsonResponse(['error' => 'ID is required'], 400);
        }

        $tutorial = $this->tutorialModel->GetTutorialById($id);
        if (!$tutorial) {
            return $this->sendJsonResponse(['error' => 'Tutorial not found'], 404);
        }

        $this->sendJsonResponse($tutorial);
    }

    public function GetTutorials()
    {
        $tutorials = $this->tutorialModel->GetTutorials();
        $this->sendJsonResponse($tutorials);
    }

    public function createTutorial()
    {
        $data = $_POST;
        if (empty($data)) {
            return $this->sendJsonResponse(['error' => 'No data received'], 400);
        }
        $success = $this->tutorialModel->createTutorial($data);
        if ($success) {
            $this->sendJsonResponse(['message' => 'Tutorial created successfully']);
        } 
        else {
            $this->sendJsonResponse(['error' => 'Failed to create tutorial'], 500);
        }
    }
    
    public function UpdateTutorial()
    {
        $data = $_POST;
        if (empty($data) || !isset($data['id'])) {
            return $this->sendJsonResponse(['error' => 'Missing ID'], 400);
        }
        
        $success = $this->tutorialModel->UpdateTutorial($data);
        
        if ($success) {
            $this->sendJsonResponse(['message' => 'Tutorial updated successfully']);
        } 
        else {
            $this->sendJsonResponse(['error' => 'Failed to update tutorial'], 500);
        }
    }

    private function sendJsonResponse($data, $statusCode = 200)
    {
        http_response_code($statusCode);
        header('Content-Type: application/json');
        echo json_encode($data);
        exit;
    }
    public function deleteTutorial()
    {
        $data = $_POST;

        $id = $data['id'] ?? null;

        if (!$id) {
            return $this->sendJsonResponse(['error' => 'ID is required'], 400);
        }

        $tutorial = $this->tutorialModel->GetTutorialById($id);
        if (!$tutorial) {
            return $this->sendJsonResponse(['error' => 'Tutorial not found'], 404);
        }

        $success = $this->tutorialModel->deleteTutorial($id);
        if ($success) {
            $this->sendJsonResponse(['message' => 'Tutorial deleted successfully']);
        } else {
            $this->sendJsonResponse(['error' => 'Failed to delete tutorial'], 500);
        }
    }
}