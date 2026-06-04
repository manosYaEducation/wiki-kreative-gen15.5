<?php
// Script interactivo para crear usuarios en la base de datos local de Auth
// Ejecutar desde la línea de comandos (CLI)

if (php_sapi_name() !== 'cli') {
    die("Este script solo puede ejecutarse desde la linea de comandos.");
}

echo "========================================================\n";
echo "  CREADOR DE USUARIOS LOCALES (WIKI KREATIVE - AUTH)\n";
echo "========================================================\n\n";

// Conectar a la base de datos local
$host = 'localhost';
$dbname = 'alphadocere_auth_system';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;port=3306;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (Exception $e) {
    die("ERROR: No se pudo conectar a MySQL en localhost. ¿Esta XAMPP corriendo?\nDetalles: " . $e->getMessage() . "\n");
}

// 1. Asegurar que la base de datos y las tablas existan
$pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
$pdo->exec("USE `$dbname`");

$pdo->exec("
    CREATE TABLE IF NOT EXISTS `clients` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `nombre` VARCHAR(255) NOT NULL,
      `email` VARCHAR(255) NOT NULL,
      `password` VARCHAR(255) NOT NULL,
      `status` ENUM('active', 'inactive') DEFAULT 'active'
    )
");

$pdo->exec("
    CREATE TABLE IF NOT EXISTS `roles` (
      `id_rol` INT AUTO_INCREMENT PRIMARY KEY,
      `nombre_rol` VARCHAR(100) NOT NULL
    )
");

$pdo->exec("
    CREATE TABLE IF NOT EXISTS `proyectos` (
      `id_proyecto` INT AUTO_INCREMENT PRIMARY KEY,
      `nombre_proyecto` VARCHAR(100) NOT NULL
    )
");

$pdo->exec("
    CREATE TABLE IF NOT EXISTS `usuarios_roles_proyectos` (
      `id_relacion` INT AUTO_INCREMENT PRIMARY KEY,
      `usuario_id` INT NOT NULL,
      `rol_id` INT NOT NULL,
      `proyecto_id` INT NOT NULL
    )
");

// Insertar datos básicos si no existen
$pdo->exec("INSERT IGNORE INTO `roles` (`id_rol`, `nombre_rol`) VALUES (9, 'admin_wiki'), (10, 'editor_wiki'), (11, 'lector_wiki')");
$pdo->exec("INSERT IGNORE INTO `proyectos` (`id_proyecto`, `nombre_proyecto`) VALUES (3, 'Wiki Kreative')");

// 2. Pedir datos al usuario
echo "Ingresa el nombre del usuario: ";
$nombre = trim(fgets(STDIN));

echo "Ingresa el correo electronico: ";
$email = trim(fgets(STDIN));

echo "Ingresa la contrasena: ";
$password = trim(fgets(STDIN));

echo "\nSelecciona el Rol para la Wiki:\n";
echo "  [1] Admin Wiki (admin_wiki)\n";
echo "  [2] Editor Wiki (editor_wiki)\n";
echo "  [3] Lector Wiki (lector_wiki)\n";
echo "Opcion (1/2/3): ";
$opcionRol = trim(fgets(STDIN));

$rolId = 11; // Lector por defecto
if ($opcionRol === '1') $rolId = 9;
elseif ($opcionRol === '2') $rolId = 10;

// 3. Crear el usuario
$hash = password_hash($password, PASSWORD_BCRYPT);

try {
    // Insertar en clients
    $stmt = $pdo->prepare("INSERT INTO clients (nombre, email, password, status) VALUES (?, ?, ?, 'active')");
    $stmt->execute([$nombre, $email, $hash]);
    $userId = $pdo->lastInsertId();

    // Insertar en usuarios_roles_proyectos
    $stmtRol = $pdo->prepare("INSERT INTO usuarios_roles_proyectos (usuario_id, rol_id, proyecto_id) VALUES (?, ?, 3)");
    $stmtRol->execute([$userId, $rolId]);

    echo "\n[EXITO] Usuario '$nombre' creado correctamente.\n";
    echo "Ya puedes iniciar sesion localmente con el correo '$email'.\n";

} catch (Exception $e) {
    echo "\n[ERROR] Hubo un problema al crear el usuario.\nDetalles: " . $e->getMessage() . "\n";
}
