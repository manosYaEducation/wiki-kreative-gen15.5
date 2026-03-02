<?php

namespace App\Backend\Controllers;

// Importamos la clase Database para usarla más adelante
use App\Backend\Models\Database;

class AuthController
{
    /**
     * Esta función se encarga de recibir el usuario y contraseña
     * y de enviar la Cookie blindada al navegador.
     */
    public function login()
    {
        // 1. Capturamos lo que el usuario escribió en el login.html
        $username = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        // 2. Validación de prueba (Paso a paso: luego lo conectaremos a la DB)
        if ($username === 'admin' && $password === '1234') {
            
            // Este es un token de ejemplo, luego generaremos uno real con JWT
            $tokenSimulado = "TOKEN_SEGURO_WIKI_KREATIVE_123";

            // 3. LA TAREA CLAVE: Seteamos la Cookie HttpOnly
            // Esto es lo que Mauro te pidió para proteger el sistema
            setcookie('token', $tokenSimulado, [
                'expires' => time() + 3600,  // La sesión dura 1 hora
                'path' => '/',               // Funciona en toda la web
                'domain' => '',             // En local se deja vacío
                'secure' => false,           // Cambiar a true solo cuando uses HTTPS
                'httponly' => true,          // <--- ¡BLOQUEO XSS! JavaScript no puede ver esto
                'samesite' => 'Lax'          // Protección básica contra ataques de otros sitios
            ]);

            // Respondemos al frontend que todo salió bien
            echo json_encode([
                'success' => true, 
                'message' => 'Login correcto. Cookie de seguridad enviada.'
            ]);
        } else {
            // Esto nos va a decir qué recibió PHP exactamente
            $recibidoUser = $_POST['username'] ?? 'VACÍO';
            $recibidoPass = $_POST['password'] ?? 'VACÍO';

            http_response_code(401);
            echo json_encode([
                'success' => false, 
                'message' => "Credenciales incorrectas.",
                'debug' => [
                    'usuario_recibido' => $recibidoUser,
                    'password_recibido' => $recibidoPass
                ]
            ]);
        }
    }
}