<?php

namespace App\Backend\Helpers;

/**
 * JwtHelper - Implementación nativa de JWT en PHP puro
 * Reemplaza firebase/php-jwt para evitar bloqueos de seguridad del servidor
 * Soporta: HS256 (HMAC-SHA256)
 */
class JwtHelper
{
    /**
     * Codifica un payload en un JWT firmado con HS256
     */
    public static function encode(array $payload, string $secret, string $algo = 'HS256'): string
    {
        $header = self::base64UrlEncode(json_encode([
            'typ' => 'JWT',
            'alg' => $algo,
        ]));

        $payload = self::base64UrlEncode(json_encode($payload));

        $signature = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", $secret, true)
        );

        return "$header.$payload.$signature";
    }

    /**
     * Decodifica y verifica un JWT
     * Lanza una excepción si el token es inválido o ha expirado
     */
    public static function decode(string $jwt, string $secret): object
    {
        $parts = explode('.', $jwt);

        if (count($parts) !== 3) {
            throw new \Exception('Token JWT inválido: formato incorrecto');
        }

        [$header, $payload, $signature] = $parts;

        // Verificar firma
        $expectedSig = self::base64UrlEncode(
            hash_hmac('sha256', "$header.$payload", $secret, true)
        );

        if (!hash_equals($expectedSig, $signature)) {
            throw new \Exception('Token JWT inválido: firma incorrecta');
        }

        // Decodificar payload
        $data = json_decode(self::base64UrlDecode($payload));

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Token JWT inválido: payload no es JSON válido');
        }

        // Verificar expiración
        if (isset($data->exp) && $data->exp < time()) {
            throw new \Exception('Token JWT expirado');
        }

        // Verificar que no sea usado antes de su tiempo de inicio
        if (isset($data->nbf) && $data->nbf > time()) {
            throw new \Exception('Token JWT aún no es válido');
        }

        return $data;
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        return base64_decode(strtr($data, '-_', '+/') . str_repeat('=', (4 - strlen($data) % 4) % 4));
    }
}
