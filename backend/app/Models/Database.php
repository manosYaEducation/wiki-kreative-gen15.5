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
        $db   = $_ENV[$prefix . 'NAME'] ?? 'alphadocere_wiki';
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
    
    public static function testConnection(): array
    {
        try {
            $db = self::getInstance();
            $conn = $db->getConnection();
            $stmt = $conn->query("SELECT 1");
            return ['success' => true, 'message' => 'Conexión exitosa'];
        } catch (PDOException $e) {
            return ['success' => false, 'message' => $e->getMessage()];
        }
    }

    /**
     * Retorna una conexión PDO a la base de datos del Sistema Auth central.
     * Usa las variables AUTH_DB_* del .env según el entorno activo.
     */
    public static function getAuthConnection(): PDO
    {
        $environment = $_ENV['ENVIRONMENT'] ?? 'development';
        $prefix = strtoupper($environment) . '_AUTH_DB_';

        $host    = defined($prefix . 'HOST') ? constant($prefix . 'HOST') : ($_ENV[$prefix . 'HOST'] ?? 'localhost');
        $db      = defined($prefix . 'NAME') ? constant($prefix . 'NAME') : ($_ENV[$prefix . 'NAME'] ?? 'alphadocere_auth_system');
        $user    = defined($prefix . 'USER') ? constant($prefix . 'USER') : ($_ENV[$prefix . 'USER'] ?? 'root');
        $pass    = defined($prefix . 'PASS') ? constant($prefix . 'PASS') : ($_ENV[$prefix . 'PASS'] ?? '');
        $port    = defined($prefix . 'PORT') ? constant($prefix . 'PORT') : ($_ENV[$prefix . 'PORT'] ?? '3306');
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;port=$port;dbname=$db;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        return new PDO($dsn, $user, $pass, $options);
    }
}
