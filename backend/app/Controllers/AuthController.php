<?php

namespace App\Backend\Controllers;

use App\Backend\Helpers\JwtHelper;
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
     * Autentica al usuario contra la BD del Sistema Auth (alphadocere_auth_system).
     * Busca el rol del usuario en la Wiki usando WIKI_PROYECTO_ID del .env.
     * Si el usuario no tiene un rol asignado en la Wiki, se le niega el acceso.
     */
    public function login()
    {
        if (ob_get_length()) ob_clean();
        header('Content-Type: application/json');

        try {
            $email    = trim($_POST['email'] ?? '');
            $password = trim($_POST['password'] ?? '');

            if (empty($email) || empty($password)) {
                throw new Exception("Email y contraseña requeridos.");
            }

            // --- PASO 1: Conexión a la BD del Sistema Auth ---
            $pdo = \App\Backend\Models\Database::getAuthConnection();

            // --- PASO 2: Buscar al usuario por email en la tabla clients ---
            $stmt = $pdo->prepare("
                SELECT id, email, password, nombre, status 
                FROM clients 
                WHERE email = ? 
                LIMIT 1
            ");
            $stmt->execute([$email]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            // --- PASO 3: Verificar que el usuario existe y tiene contraseña correcta ---
            if (!$user || !password_verify($password, $user['password'])) {
                http_response_code(401);
                echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas']);
                return;
            }

            // --- PASO 4: Verificar que la cuenta está activa ---
            if ($user['status'] !== 'active') {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'Tu cuenta no está activa. Verifica tu correo electrónico.']);
                return;
            }

            // --- PASO 5: Buscar el rol del usuario en el proyecto Wiki ---
            $wikiProyectoId = defined('WIKI_PROYECTO_ID') ? (int)constant('WIKI_PROYECTO_ID') : 3;

            $stmtRol = $pdo->prepare("
                SELECT r.nombre_rol
                FROM usuarios_roles_proyectos urp
                JOIN roles r ON urp.rol_id = r.id_rol
                WHERE urp.usuario_id = ? AND urp.proyecto_id = ?
                LIMIT 1
            ");
            $stmtRol->execute([$user['id'], $wikiProyectoId]);
            $rolData = $stmtRol->fetch(PDO::FETCH_ASSOC);

            // --- PASO 6: Si no tiene rol en la Wiki → acceso denegado ---
            if (!$rolData) {
                http_response_code(403);
                echo json_encode(['success' => false, 'message' => 'No tienes acceso a la Wiki Kreative. Contacta al administrador.']);
                return;
            }

            $role = $rolData['nombre_rol'];

            // --- PASO 7: Generar JWT con id, email (como username) y rol ---
            $payload = [
                'iat'  => time(),
                'exp'  => time() + $this->expiry,
                'data' => [
                    'id'       => $user['id'],
                    'username' => $user['nombre'],
                    'email'    => $user['email'],
                    'role'     => $role
                ]
            ];

            $jwt = JwtHelper::encode($payload, $this->key, 'HS256');

            // Establecemos la cookie de forma segura
            setcookie('token', $jwt, [
                'expires'  => time() + $this->expiry,
                'path'     => '/',
                'httponly' => false,
                'samesite' => 'Lax'
            ]);

            echo json_encode([
                'success' => true,
                'message' => '¡Bienvenido/a a la Wiki Kreative!',
                'token'   => $jwt,
                'user'    => [
                    'username' => $user['nombre'],
                    'email'    => $user['email'],
                    'role'     => $role
                ]
            ]);

        } catch (Exception $e) {
            http_response_code(500);
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