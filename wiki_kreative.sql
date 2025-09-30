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