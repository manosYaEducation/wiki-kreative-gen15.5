-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 05-05-2026 a las 17:13:23
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `alphadocere_wiki`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tutorials`
--

CREATE TABLE `tutorials` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `content` text DEFAULT NULL,
  `image` varchar(2083) DEFAULT NULL,
  `area` varchar(100) DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`tags`)),
  `files` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`files`)),
  `lastEditor` varchar(100) DEFAULT NULL,
  `creator` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `tutorials`
--

INSERT INTO `tutorials` (`id`, `title`, `description`, `content`, `image`, `area`, `tags`, `files`, `lastEditor`, `creator`, `created_at`, `updated_at`) VALUES
(1, 'Introducción al Diseño Gráfico', 'Una guía básica para comenzar en el diseño gráfico.', 'Este tutorial cubre los fundamentos del diseño gráfico, incluyendo composición, tipografía y teoría del color.', NULL, 'diseño', '[\"diseño\", \"gráfico\", \"tipografía\", \"teoría del color\"]', NULL, 'Laura Ruiz', 'Carlos Medina', '2026-05-04 18:27:42', '2026-05-04 18:27:42'),
(2, 'Aprende Python desde cero', 'Tutorial paso a paso para aprender Python, uno de los lenguajes más populares.', 'Comenzaremos con variables, estructuras de control, funciones y manejo de archivos.', NULL, 'programacion', '[\"python\", \"programación\", \"principiantes\"]', NULL, 'Andrés Gómez', 'María Torres', '2026-05-04 18:27:42', '2026-05-04 18:27:42'),
(3, 'Receta de lasaña clásica italiana', 'Aprende a preparar una deliciosa lasaña con carne y bechamel.', 'Este tutorial detalla paso a paso los ingredientes, la preparación de la salsa y el armado de la lasaña.', NULL, 'gastronomia', '[\"lasaña\", \"recetas\", \"italiana\", \"cocina casera\"]', NULL, 'Luis Ramírez', 'Ana Martínez', '2026-05-04 18:27:42', '2026-05-04 18:27:42'),
(4, 'Cómo organizar tu tiempo de estudio', 'Consejos prácticos para una mejor organización y rendimiento académico.', 'Explora métodos como Pomodoro, uso de calendarios y eliminación de distracciones.', NULL, 'tutorial', '[\"organización\", \"estudio\", \"productividad\"]', NULL, 'Beatriz León', 'Juan Ríos', '2026-05-04 18:27:43', '2026-05-04 18:27:43'),
(5, 'Estrategias de marketing digital para 2025', 'Guía actualizada con las tendencias y herramientas más efectivas.', 'Descubre cómo usar SEO, redes sociales, email marketing y automatización para mejorar tus campañas.', NULL, 'marketing', '[\"marketing\", \"digital\", \"seo\", \"redes sociales\", \"automatización\"]', NULL, 'Mónica Vega', 'Ricardo Soto', '2026-05-04 18:27:43', '2026-05-04 18:27:43');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','editor','lector') NOT NULL DEFAULT 'lector',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'prueba', 'prueba@test.com', '$2a$12$yzac9.Lp2z7/UiN.ObrAKOu9huKf79ENYPxn2c4SzrML52skLI5OO', 'admin', '2026-05-04 18:07:02');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `tutorials`
--
ALTER TABLE `tutorials`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `tutorials`
--
ALTER TABLE `tutorials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
