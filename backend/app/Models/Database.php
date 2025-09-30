<?php

namespace App\Backend\Models;

use PDO;
use PDOException;

class Database
{
    private static $instance = null;
    private $conn;

    private function __construct()
    {
        $environment = $_ENV['ENVIRONMENT'] ?? 'development';
        $prefix = strtoupper($environment) . '_DB_';

        $host = $_ENV[$prefix . 'HOST'] ?? 'localhost';
        $db   = $_ENV[$prefix . 'NAME'] ?? 'wiki_kreative';
        $user = $_ENV[$prefix . 'USER'] ?? 'root';
        $pass = $_ENV[$prefix . 'PASS'] ?? '';
        $port = $_ENV[$prefix . 'PORT'] ?? '3306';
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->conn = new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {
            throw new PDOException($e->getMessage(), (int)$e->getCode());
        }
    }

    public static function getInstance(): self
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function getConnection(): PDO
    {
        return $this->conn;
    }
}
