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

        // [NUEVO] Procesamiento de adjuntos "files" (uno o múltiples)
        $uploadedFilesPaths = [];
        if (isset($_FILES['files'])) {
            $uploadedFilesPaths = $this->handleFilesUpload($_FILES['files']);
            if ($uploadedFilesPaths === false) {
                // Si falla adjuntos, limpiamos imagen subida (si aplica) para no dejar basura.
                if (!empty($imagePath)) {
                    $fullImage = $_SERVER['DOCUMENT_ROOT'] . $imagePath;
                    if (file_exists($fullImage)) {
                        unlink($fullImage);
                    }
                }
                return $this->sendJsonResponse(['error' => 'Failed to upload attached files'], 400);
            }
        }
        $data['files'] = $uploadedFilesPaths; // El Model ya hace json_encode($files)

        if (isset($data['tags'])) {
            $data['tags'] = json_decode($data['tags'], true) ?? $data['tags'];
        }

        $success = $this->tutorialModel->createTutorial($data);

        if ($success) {
            $this->sendJsonResponse(['message' => 'Tutorial created successfully']);
        } else {
            // Limpieza en caso de error (no dejar archivos huérfanos)
            if (!empty($imagePath)) {
                $fullImage = $_SERVER['DOCUMENT_ROOT'] . $imagePath;
                if (file_exists($fullImage)) {
                    unlink($fullImage);
                }
            }

            // [NUEVO] Limpieza de adjuntos si el INSERT falla
            $this->cleanupUploadedFiles($uploadedFilesPaths);

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

    // =====================================================================
    // [NUEVO] CARGA MODULAR DE ADJUNTOS (files) - SOPORTA UNO O MÚLTIPLES
    // =====================================================================
    private function handleFilesUpload($filesInput)
    {
        // Guardamos adjuntos en subcarpeta separada para orden y permisos.
        $uploadDir = $_SERVER['DOCUMENT_ROOT'] . '/wiki-kreative-gen15.5/public/uploads/files/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }

        // Permitir adjuntos comunes. Ajusta según tu necesidad.
        $allowedMimeTypes = [
            'application/pdf',
            'application/zip',
            'application/x-zip-compressed',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif',
        ];

        $maxFileSize = 15 * 1024 * 1024; // 15MB por archivo

        // Normalizamos para soportar:
        // - <input name="files"> (un archivo)
        // - <input name="files[]" multiple> (varios)
        $names = $filesInput['name'] ?? null;
        $tmps  = $filesInput['tmp_name'] ?? null;
        $errs  = $filesInput['error'] ?? null;
        $sizes = $filesInput['size'] ?? null;
        $types = $filesInput['type'] ?? null;

        if ($names === null) {
            return []; // no hay nada que subir
        }

        $paths = [];

        // Caso 1: un solo archivo (name es string)
        if (!is_array($names)) {
            if ($errs !== UPLOAD_ERR_OK) {
                return []; // si no es OK, no subimos nada; no es “fatal”
            }

            if (!empty($types) && !in_array($types, $allowedMimeTypes)) {
                return false;
            }

            if (!empty($sizes) && $sizes > $maxFileSize) {
                return false;
            }

            $fileExtension = pathinfo($names, PATHINFO_EXTENSION);
            $safeName = uniqid('file_') . ($fileExtension ? '.' . $fileExtension : '');
            $destination = $uploadDir . $safeName;

            if (!move_uploaded_file($tmps, $destination)) {
                return false;
            }

            $paths[] = '/wiki-kreative-gen15.5/public/uploads/files/' . $safeName;
            return $paths;
        }

        // Caso 2: múltiples archivos (name es array)
        for ($i = 0; $i < count($names); $i++) {
            if (!isset($errs[$i]) || $errs[$i] !== UPLOAD_ERR_OK) {
                continue; // saltar el que venga malo
            }

            // Validación MIME y tamaño (si viene)
            $mime = $types[$i] ?? null;
            if ($mime && !in_array($mime, $allowedMimeTypes)) {
                // Si quieres permitir “cualquier tipo”, cambia esto por continue en vez de false
                return false;
            }

            $size = $sizes[$i] ?? 0;
            if ($size > $maxFileSize) {
                return false;
            }

            $originalName = $names[$i];
            $tmpName = $tmps[$i];

            $fileExtension = pathinfo($originalName, PATHINFO_EXTENSION);
            $safeName = uniqid('file_') . ($fileExtension ? '.' . $fileExtension : '');
            $destination = $uploadDir . $safeName;

            if (!move_uploaded_file($tmpName, $destination)) {
                return false;
            }

            $paths[] = '/wiki-kreative-gen15.5/public/uploads/files/' . $safeName;
        }

        return $paths;
    }

    // [NUEVO] Limpieza modular de archivos subidos (por si falla el INSERT/UPDATE)
    private function cleanupUploadedFiles($paths)
    {
        if (!is_array($paths)) {
            return;
        }

        foreach ($paths as $webPath) {
            if (empty($webPath) || !is_string($webPath)) {
                continue;
            }
            $fullPath = $_SERVER['DOCUMENT_ROOT'] . $webPath;
            if (file_exists($fullPath)) {
                unlink($fullPath);
            }
        }
    }
    // =====================================================================

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

        // Verifica si se debe eliminar la imagen actual
        if (!empty($data['deleteImage']) && $data['deleteImage'] === '1') {
            if (!empty($imagePath)) {
                $fullOldImagePath = $_SERVER['DOCUMENT_ROOT'] . $imagePath;
                if (file_exists($fullOldImagePath)) {
                    unlink($fullOldImagePath);
                }
            }
            $imagePath = null; // Establecer a null para indicar que no hay imagen
        }

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

        
        //Si subes nuevos adjuntos, se agregan a los existentes (merge).
        //Si no subes nada, se conserva lo existente.
        //Si eliminas archivos, se remueven de la lista.
        $existingFiles = [];
        if (!empty($tutorial['files'])) {
            $decoded = json_decode($tutorial['files'], true);
            if (is_array($decoded)) {
                $existingFiles = $decoded;
            }
        }

        // Procesar eliminación de archivos
        $filesToDelete = [];
        if (!empty($data['deleteFiles'])) {
            $filesToDelete = json_decode($data['deleteFiles'], true) ?? [];
        }
        
        // Eliminar archivos del servidor y de la lista
        foreach ($filesToDelete as $filePath) {
            $fullFilePath = $_SERVER['DOCUMENT_ROOT'] . $filePath;
            if (file_exists($fullFilePath)) {
                unlink($fullFilePath);
            }
            // Remover del array de archivos existentes
            $existingFiles = array_values(array_filter($existingFiles, function($f) use ($filePath) {
                return $f !== $filePath;
            }));
        }

        $newFiles = [];
        if (isset($_FILES['files'])) {
            $newFiles = $this->handleFilesUpload($_FILES['files']);
            if ($newFiles === false) {
                return $this->sendJsonResponse(['error' => 'Failed to upload attached files'], 400);
            }
        }

        // Merge sin duplicados
        $merged = array_values(array_unique(array_merge($existingFiles, $newFiles)));
        $data['files'] = $merged;

        $success = $this->tutorialModel->UpdateTutorial($data);

        if ($success) {
            $this->sendJsonResponse(['message' => 'Tutorial updated successfully']);
        } else {
            // Si falla, se limpia solo los archivos nuevos que se subieron ahora
            $this->cleanupUploadedFiles($newFiles);

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

        // [OPCIONAL, PERO RECOMENDADO] eliminar adjuntos también (no rompe nada si no hay)
        if (!empty($tutorial['files'])) {
            $decoded = json_decode($tutorial['files'], true);
            if (is_array($decoded)) {
                $this->cleanupUploadedFiles($decoded);
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
