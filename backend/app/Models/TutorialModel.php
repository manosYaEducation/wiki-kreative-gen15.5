<?php

namespace App\Backend\Models;

use PDO;
use App\Backend\Models\Database;

class TutorialModel
{
    private $conn;

    public function __construct()
    {
        $this->conn = Database::getInstance()->getConnection();
    }

    public function GetTutorialById($id)
    {
        $stmt = $this->conn->prepare("SELECT * FROM tutorials WHERE id = :id");
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function GetTutorials()
    {
        $stmt = $this->conn->query("SELECT * FROM tutorials ORDER BY created_at DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function createTutorial($data)
    {
        $stmt = $this->conn->prepare("
            INSERT INTO tutorials (id, title, description, content, image, area, tags, files, lastEditor, creator)
            VALUES (:id, :title, :description, :content, :image, :area, :tags, :files, :lastEditor, :creator)
        ");
        return $stmt->execute([
            ':id' => $data['id'],
            ':title' => $data['title'],
            ':description' => $data['description'],
            ':content' => $data['content'],
            ':image' => $data['image'],
            ':area' => $data['area'],
            ':tags' => json_encode($data['tags']),
            ':files' => json_encode($data['files']),
            ':lastEditor' => $data['lastEditor'],
            ':creator' => $data['creator']
        ]);
    }

    public function UpdateTutorial($data)
    {
        $stmt = $this->conn->prepare("
            UPDATE tutorials SET
                title = :title,
                description = :description,
                content = :content,
                image = :image,
                area = :area,
                tags = :tags,
                files = :files,
                lastEditor = :lastEditor
            WHERE id = :id
        ");
        return $stmt->execute([
            ':title' => $data['title'],
            ':description' => $data['description'],
            ':content' => $data['content'],
            ':image' => $data['image'],
            ':area' => $data['area'],
            ':tags' => json_encode($data['tags']),
            ':files' => json_encode($data['files']),
            ':lastEditor' => $data['lastEditor'],
            ':id' => $data['id']
        ]);
    }

public function deleteTutorial($id)
{
    $stmt = $this->conn->prepare("DELETE FROM tutorials WHERE id = :id");
    $stmt->bindParam(':id', $id, PDO::PARAM_STR);
    return $stmt->execute();
}

}
