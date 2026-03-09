<?php

namespace App\Backend\Controllers;

/**
 * 1. CARGA DE CONFIGURACIÓN "POR DETRÁS"
 * Cargamos el archivo que lee el .env de la raíz.
 */
 // Cargamos las librerías de Composer (Firebase JWT)
require_once __DIR__ . '/../../vendor/autoload.php'; 

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;
use PDO;

class AuthController
{
    private $key;
    private $expiry;

    public function __construct() {
        /**
         * Usamos constant() para evitar que el editor marque error de "Undefined constant".
         * Se obtienen los valores del .env cargados por env_loader.php
         */
        $this->key = defined('JWT_SECRET') ? constant('JWT_SECRET') : "WikiSecretKey_Gen15_Version2_2026_Secure";
        $this->expiry = defined('JWT_EXPIRY') ? (int)constant('JWT_EXPIRY') : 3600;
    }

    /**
     * MÉTODO DE LOGIN
     * Valida contra la base de datos real y genera el token con el ROL.
     */
    public function login()
    {
        
        if (ob_get_length()) ob_clean();
        header('Content-Type: application/json');

        try {
            $username = trim($_POST['username'] ?? '');
            $password = trim($_POST['password'] ?? '');

            if (empty($username) || empty($password)) {
                throw new Exception("Usuario y contraseña requeridos.");
            }

            // Conexión a la base de datos local
            $pdo = new PDO("mysql:host=localhost;dbname=alphadocere_wiki;charset=utf8mb4", "root", "");
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            $stmt = $pdo->prepare("SELECT id, username, password, role FROM users WHERE username = ? LIMIT 1");
            $stmt->execute([$username]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            /**
             * VALIDACIÓN: Solo permitimos el acceso si el hash coincide.
             * (El bypass de nicolas ha sido eliminado exitosamente).
             */
            if ($user && password_verify($password, $user['password'])) {
                
                $payload = [
                    'iat'  => time(),
                    'exp'  => time() + $this->expiry,
                    'data' => [
                        'id'       => $user['id'],
                        'username' => $user['username'],
                        'role'     => $user['role'] ?? 'lector'
                    ]
                ];

                $jwt = \Firebase\JWT\JWT::encode($payload, $this->key, 'HS256');
                // Establecemos la cookie de forma segura
                setcookie('token', $jwt, [
                    'expires' => time() + $this->expiry,
                    'path' => '/',
                    'httponly' => false, 
                    'samesite' => 'Lax'
                ]);

                echo json_encode([
                    'success' => true, 
                    'message' => '¡LOGIN SEGURO ACTIVADO!',
                    'token'   => $jwt,
                    'user'    => [
                        'username' => $user['username'],
                        'role'     => $user['role'] ?? 'lector'
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
            }

        } catch (Exception $e) {
            http_response_code(500);
            // Cambia la línea de abajo para ver el error real:
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
    }

    /**
     * MÉTODO DE LOGOUT
     */
    public function logout()
    {
        setcookie('token', '', time() - 3600, '/');
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Sesión cerrada']);
        exit;
    }
}