-- ============================================================
-- SCHEMA: alphadocere_wiki
-- Wiki Kreative Gen 15.5
-- ============================================================
-- Este archivo crea la tabla necesaria para el funcionamiento
-- de la Wiki. Importar en phpMyAdmin o ejecutar desde terminal.
-- ============================================================

CREATE DATABASE IF NOT EXISTS `alphadocere_wiki`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `alphadocere_wiki`;

-- Tabla principal de tutoriales/publicaciones
CREATE TABLE IF NOT EXISTS `tutorials` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `content` LONGTEXT,
  `image` VARCHAR(500) DEFAULT NULL,
  `area` VARCHAR(100) NOT NULL COMMENT 'Categoría: programacion, diseño, gastronomia, tutorial, marketing',
  `tags` JSON DEFAULT NULL COMMENT 'Array JSON de etiquetas',
  `files` JSON DEFAULT NULL COMMENT 'Array JSON de rutas de archivos adjuntos',
  `lastEditor` VARCHAR(150) DEFAULT NULL,
  `creator` VARCHAR(150) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos de ejemplo (opcional)
INSERT INTO `tutorials` (`title`, `description`, `content`, `area`, `tags`, `creator`, `lastEditor`) VALUES
('Publicación de Prueba', 'Esta es una publicación de ejemplo para verificar que el sistema funciona correctamente.', 'Contenido de prueba. Si puedes ver esto, tu instalación local de la Wiki está funcionando. ¡Felicidades!', 'tutorial', '["prueba", "ejemplo"]', 'sistema', 'sistema');
