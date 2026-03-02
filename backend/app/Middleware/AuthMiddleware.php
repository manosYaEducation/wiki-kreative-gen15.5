<?php

namespace App\Backend\Middleware;

class AuthMiddleware
{
    /**
     * Este es el guardia que verifica la cookie
     */
    public static function check()
    {
        // 1. Buscamos la cookie que creamos en el paso anterior
        $token = $_COOKIE['token'] ?? null;

        // 2. Si no existe la cookie, frenamos todo
        if (!$token) {
            http_response_code(401); // 401 significa "No autorizado"
            echo json_encode([
                'success' => false, 
                'message' => 'Acceso denegado: No tienes una sesión activa.'
            ]);
            exit; // Cortamos la ejecución aquí mismo
        }

        // Si la cookie existe, no hacemos nada y dejamos que el código siga
        return true;
    }
}