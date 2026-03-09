<?php

namespace App\Backend\Middleware;

// 1. CARGA DE CONFIGURACIÓN Y LIBRERÍAS
// Esto busca el archivo subiendo los niveles correctos
require_once dirname(__DIR__, 2) . '/config/env_loader.php'; 
require_once __DIR__ . '/../../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class AuthMiddleware
{
    private $key;

    public function __construct() {
        /**
         * Sincronizamos la llave maestra con la del AuthController.
         * Usamos constant() para evitar errores visuales en el editor.
         */
        $this->key = defined('JWT_SECRET') ? constant('JWT_SECRET') : "WikiSecretKey_Gen15_Version2_2026_Secure";
    }

    /**
     * Verifica si el token existe, es válido y no ha expirado.
     */
    public function checkToken()
    {
        // Intentamos obtener el token de la cookie
        $jwt = $_COOKIE['token'] ?? null;

        if (!$jwt) {
            http_response_code(401);
            echo json_encode([
                "success" => false, 
                "message" => "Acceso denegado. Debes iniciar sesión."
            ]);
            exit;
        }

        try {
            /**
             * DECODIFICACIÓN SEGURA
             * Ahora usamos la llave cargada desde el archivo .env
             */
            $decoded = JWT::decode($jwt, new Key($this->key, 'HS256'));
            
            // Retorna un objeto con id, username y role real de la base de datos
            return $decoded->data;

        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode([
                "success" => false, 
                "message" => "Sesión inválida o expirada."
                // No mostramos el mensaje de error técnico para que nada quede expuesto
            ]);
            exit;
        }
    }
}