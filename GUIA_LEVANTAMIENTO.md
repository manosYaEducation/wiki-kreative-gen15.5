# Guía de Levantamiento - Wiki Kreative Gen 15.5

Esta guía detalla los pasos necesarios para configurar y ejecutar el proyecto **Wiki Kreative** en un entorno local utilizando XAMPP.

## 1. Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:
- **XAMPP** (con PHP 8.0 o superior).
- **Composer** (gestor de dependencias de PHP).
- **Git** (opcional, para clonar el repositorio).

---

## 2. Pasos de Instalación

### 2.1. Clonar o Descargar el Proyecto
Ubica el proyecto dentro de la carpeta `htdocs` de tu instalación de XAMPP:
`C:\xampp\htdocs\wiki-kreative-gen15.5`

### 2.2. Instalación de Dependencias (Composer)
El proyecto cuenta con dos archivos `composer.json` que deben ser procesados:

1.  **Dependencias de la Raíz / Frontend:**
    Abre una terminal en la raíz del proyecto y ejecuta:
    ```bash
    composer install
    ```
    *Esto generará la carpeta `vendor` en la raíz, necesaria para el autoloading y las variables de entorno.*

2.  **Dependencias del Backend:**
    Navega a la carpeta `backend` y ejecuta nuevamente:
    ```bash
    cd backend
    composer install
    ```

---

## 3. Configuración de Base de Datos

1.  Inicia **Apache** y **MySQL** desde el Panel de Control de XAMPP.
2.  Accede a `http://localhost/phpmyadmin`.
3.  Crea una nueva base de datos llamada `alphadocere_wiki`.
4.  Importa el archivo SQL que se encuentra en la raíz del proyecto:
    `alphadocere_wiki.sql`

---

## 4. Variables de Entorno (.env)

El proyecto utiliza un archivo `.env` para la configuración de la base de datos y seguridad JWT.

1.  Asegúrate de que exista el archivo `.env` en la raíz.
2.  Si no existe, copia el contenido de `.env.example` a un nuevo archivo `.env`.
3.  Verifica que las credenciales coincidan con tu configuración de XAMPP:
    ```env
    DEV_DB_HOST=localhost
    DEV_DB_NAME=alphadocere_wiki
    DEV_DB_USER=root
    DEV_DB_PASS=
    ```

---

## 5. Acceso a la Aplicación

Una vez configurado todo, puedes acceder a las diferentes partes del sistema:

- **Frontend:** `http://localhost/wiki-kreative-gen15.5/frontend/index.php`
- **Backend/API:** `http://localhost/wiki-kreative-gen15.5/backend/`

---

## 6. Solución de Problemas Comunes

### Error: "Failed to open stream: No such file or directory in .../vendor/autoload.php"
Este error ocurre cuando las dependencias de Composer no se han instalado correctamente.
**Solución:** Ejecuta `composer install` en la raíz del proyecto.

### Error de Conexión a la Base de Datos
Asegúrate de que el servicio MySQL esté corriendo y que el nombre de la base de datos en el archivo `.env` sea exactamente `alphadocere_wiki`.

### Error 404 en Rutas
El proyecto utiliza archivos `.htaccess` para el manejo de rutas. Asegúrate de que el módulo `mod_rewrite` de Apache esté habilitado en tu configuración de XAMPP.
