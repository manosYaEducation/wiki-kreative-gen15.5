-- Create the database
CREATE DATABASE IF NOT EXISTS wiki_kreative CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE wiki_kreative;

-- Create the main table
CREATE TABLE IF NOT EXISTS tutorials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    image VARCHAR(2083),
    area VARCHAR(100),
    tags JSON,
    files JSON,
    lastEditor VARCHAR(100),
    creator VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO tutorials (title, description, content, area, tags, lastEditor, creator)
VALUES (
    'Introducción al Diseño Gráfico',
    'Una guía básica para comenzar en el diseño gráfico.',
    'Este tutorial cubre los fundamentos del diseño gráfico, incluyendo composición, tipografía y teoría del color.',
    'diseño',
    '["diseño", "gráfico", "tipografía", "teoría del color"]',
    'Laura Ruiz',
    'Carlos Medina'
);


INSERT INTO tutorials (title, description, content, area, tags, lastEditor, creator)
VALUES (
    'Aprende Python desde cero',
    'Tutorial paso a paso para aprender Python, uno de los lenguajes más populares.',
    'Comenzaremos con variables, estructuras de control, funciones y manejo de archivos.',
    'programacion',
    '["python", "programación", "principiantes"]',
    'Andrés Gómez',
    'María Torres'
);

INSERT INTO tutorials (title, description, content, area, tags, lastEditor, creator)
VALUES (
    'Receta de lasaña clásica italiana',
    'Aprende a preparar una deliciosa lasaña con carne y bechamel.',
    'Este tutorial detalla paso a paso los ingredientes, la preparación de la salsa y el armado de la lasaña.',
    'gastronomia',
    '["lasaña", "recetas", "italiana", "cocina casera"]',
    'Luis Ramírez',
    'Ana Martínez'
);

INSERT INTO tutorials (title, description, content, area, tags, lastEditor, creator)
VALUES (
    'Cómo organizar tu tiempo de estudio',
    'Consejos prácticos para una mejor organización y rendimiento académico.',
    'Explora métodos como Pomodoro, uso de calendarios y eliminación de distracciones.',
    'tutorial',
    '["organización", "estudio", "productividad"]',
    'Beatriz León',
    'Juan Ríos'
);

INSERT INTO tutorials (title, description, content, area, tags, lastEditor, creator)
VALUES (
    'Estrategias de marketing digital para 2025',
    'Guía actualizada con las tendencias y herramientas más efectivas.',
    'Descubre cómo usar SEO, redes sociales, email marketing y automatización para mejorar tus campañas.',
    'marketing',
    '["marketing", "digital", "seo", "redes sociales", "automatización"]',
    'Mónica Vega',
    'Ricardo Soto'
);
