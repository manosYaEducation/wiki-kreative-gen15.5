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

    $imagePath = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $imagePath = $this->handleImageUpload($_FILES['image']);
        if (!$imagePath) {
            return $this->sendJsonResponse(['error' => 'Failed to upload image'], 400);
        }
    }

    $data['image'] = $imagePath;

    if (isset($data['tags'])) {
        $data['tags'] = json_decode($data['tags'], true) ?? $data['tags'];
    }

    $success = $this->tutorialModel->createTutorial($data);
    if ($success) {
        $this->sendJsonResponse(['message' => 'Tutorial created successfully']);
    } else {
        if ($imagePath && file_exists($imagePath)) {
            unlink($imagePath);
        }
        $this->sendJsonResponse(['error' => 'Failed to create tutorial'], 500);
    }
}

private function handleImageUpload($file)
{
    $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/wiki-kreative-gen15.5/public/uploads/';
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    $maxFileSize = 5 * 1024 * 1024; // 5MB

    if (!in_array($file['type'], $allowedTypes)) {
        return false;
    }

    if ($file['size'] > $maxFileSize) {
        return false;
    }

    // Generar nombre de la imagen
    $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $fileName = uniqid('img_') . '.' . $fileExtension;
    $destination = $uploadDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $destination)) {
            return '/wiki-kreative-gen15.5/public/uploads/' . $fileName;
    }

    return false;
}
    
public function UpdateTutorial()
{
    $data = $_POST;
    if (empty($data) || !isset($data['id'])) {
        return $this->sendJsonResponse(['error' => 'Missing ID'], 400);
    }

    // Obtener el tutorial actual
    $tutorial = $this->tutorialModel->GetTutorialById($data['id']);
    if (!$tutorial) {
        return $this->sendJsonResponse(['error' => 'Tutorial not found'], 404);
    }

    $imagePath = $tutorial['image']; // Imagen actual

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $newImagePath = $this->handleImageUpload($_FILES['image']);
        if (!$newImagePath) {
            return $this->sendJsonResponse(['error' => 'Failed to upload new image'], 400);
        }

        // Borrar la imagen anterior del servidor
        if (!empty($imagePath)) {
            $fullOldImagePath = $_SERVER['DOCUMENT_ROOT'] . $imagePath;
            if (file_exists($fullOldImagePath)) {
                unlink($fullOldImagePath);
            }
        }

        // Actualizar la ruta de la imagen
        $imagePath = $newImagePath;
    }

    $data['image'] = $imagePath;

    if (isset($data['tags'])) {
        $data['tags'] = json_decode($data['tags'], true) ?? $data['tags'];
    }

    $success = $this->tutorialModel->UpdateTutorial($data);
    if ($success) {
        $this->sendJsonResponse(['message' => 'Tutorial updated successfully']);
    } else {
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

    // Intentar eliminar la imagen si existe
    if (!empty($tutorial['image'])) {
        $imagePath = $_SERVER['DOCUMENT_ROOT'] . $tutorial['image'];
        if (file_exists($imagePath)) {
            unlink($imagePath);
        }
    }

    $success = $this->tutorialModel->deleteTutorial($id);
    if ($success) {
        $this->sendJsonResponse(['message' => 'Tutorial deleted successfully']);
    } else {
        $this->sendJsonResponse(['error' => 'Failed to delete tutorial'], 500);
    }
}
}