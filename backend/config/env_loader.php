<?php
// backend/config/env_loader.php

function loadEnv() {
    // Subimos un nivel para llegar a la raíz donde está el .env
    $path = __DIR__ . '/../../.env';

    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Ignorar comentarios
        if (strpos(trim($line), '#') === 0) continue;

        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);

            // Quitar comillas si existen
            $value = trim($value, "\"'");

            if (!defined($name)) {
                define($name, $value);
            }
        }
    }
}

// Ejecutamos la carga automáticamente
loadEnv();