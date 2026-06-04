# 07 — Configuración y Despliegue

## Variables de Entorno

El proyecto usa un archivo `.env` para gestionar toda la configuración sensible. El archivo `.env` **nunca** debe subirse a Git (ya está en `.gitignore`).

Para comenzar, copia el archivo de ejemplo:

```bash
cp .env.example .env
```

### Variables Disponibles

```ini
# Entorno activo: 'dev' (local XAMPP) o 'prod' (cPanel)
ENVIRONMENT=dev

# ── BASE DE DATOS WIKI (LOCAL) ─────────────────────────────
DEV_DB_HOST=localhost
DEV_DB_NAME=alphadocere_wiki
DEV_DB_USER=root
DEV_DB_PASS=
DEV_DB_PORT=3306

# ── BASE DE DATOS WIKI (PRODUCCIÓN) ───────────────────────
PROD_DB_HOST=localhost
PROD_DB_NAME=nombre_bd_cpanel
PROD_DB_USER=usuario_cpanel
PROD_DB_PASS=contraseña_cpanel
PROD_DB_PORT=3306

# ── BASE DE DATOS AUTH (LOCAL) ─────────────────────────────
DEV_AUTH_DB_HOST=localhost
DEV_AUTH_DB_NAME=alphadocere_auth_system
DEV_AUTH_DB_USER=root
DEV_AUTH_DB_PASS=
DEV_AUTH_DB_PORT=3306

# ── BASE DE DATOS AUTH (PRODUCCIÓN) ───────────────────────
PROD_AUTH_DB_HOST=localhost
PROD_AUTH_DB_NAME=nombre_auth_cpanel
PROD_AUTH_DB_USER=usuario_cpanel
PROD_AUTH_DB_PASS=contraseña_cpanel
PROD_AUTH_DB_PORT=3306

# ── ID DEL PROYECTO WIKI EN EL SISTEMA AUTH ───────────────
WIKI_PROYECTO_ID=3

# ── SEGURIDAD JWT ──────────────────────────────────────────
JWT_SECRET=WikiSecretKey_Gen15_Version2_2026_Secure
JWT_EXPIRY=3600
```

---

## Instalación Local (XAMPP)

### Requisitos

- XAMPP con Apache + MySQL
- PHP 8.0 o superior
- Composer

### Pasos

1. **Clonar o copiar el proyecto** en la carpeta `htdocs` de XAMPP:
   ```
   C:\xampp\htdocs\wiki-kreative-gen15.5\
   ```

2. **Instalar dependencias PHP** con Composer:
   ```bash
   composer install
   ```
   También instalar las dependencias del backend:
   ```bash
   cd backend
   composer install
   ```

3. **Configurar el archivo `.env`:**
   ```bash
   cp .env.example .env
   ```
   Editar `.env` y establecer `ENVIRONMENT=dev`. Las credenciales de la BD Wiki local por defecto son `root` sin contraseña.

4. **Crear la base de datos Wiki:**
   - Abrir phpMyAdmin: `http://localhost/phpmyadmin`
   - Importar el archivo `database/schema.sql`
   - Esto crea la base de datos `alphadocere_wiki` con la tabla `tutorials`

5. **Crear la base de datos Auth local (mock):**
   - Ejecutar el script `crear_usuario_local.bat` (Windows) o `create_local_user.php` para crear una copia local de la BD Auth con un usuario de prueba.

6. **Acceder a la Wiki:**
   ```
   http://localhost/wiki-kreative-gen15.5/frontend/
   ```

7. **Credenciales de prueba (local):**
   - Email: definido en el script `crear_usuario_local.bat`
   - Password: definido en el mismo script

---

## Despliegue en Producción (cPanel)

### Requisitos del servidor

- Apache con módulo `mod_rewrite` habilitado
- PHP 8.0+
- MySQL / MariaDB
- Acceso a phpMyAdmin y Administrador de Archivos

### Pasos

#### 1. Subir los archivos

Usando el **Administrador de Archivos de cPanel**:

- Comprimir el proyecto en un `.zip` (excluyendo `.git/`, `vendor/`, `.env`)
- Subir el ZIP al directorio raíz del hosting
- Hacer clic derecho → **Extract** para descomprimirlo

#### 2. Instalar dependencias en el servidor

Si el servidor tiene acceso SSH:
```bash
composer install --no-dev --optimize-autoloader
cd backend && composer install --no-dev --optimize-autoloader
```

Si no hay acceso SSH, subir manualmente las carpetas `vendor/` generadas en local.

#### 3. Configurar el `.env` de producción

Crear un archivo `.env` en la raíz del proyecto en el servidor con `ENVIRONMENT=prod` y las credenciales reales de las BDs.

```ini
ENVIRONMENT=prod

PROD_DB_HOST=localhost
PROD_DB_NAME=alphadocere_wiki
PROD_DB_USER=usuario_bd
PROD_DB_PASS=contraseña_bd

PROD_AUTH_DB_HOST=localhost
PROD_AUTH_DB_NAME=alphadocere_auth_system
PROD_AUTH_DB_USER=usuario_auth
PROD_AUTH_DB_PASS=contraseña_auth

WIKI_PROYECTO_ID=3
JWT_SECRET=WikiSecretKey_Gen15_Version2_2026_Secure
JWT_EXPIRY=3600
```

#### 4. Crear la base de datos Wiki

En **phpMyAdmin de cPanel**:
- Crear la base de datos `alphadocere_wiki` (o el nombre configurado en `PROD_DB_NAME`)
- Importar `database/schema.sql`

#### 5. Ejecutar migraciones pendientes

Si ya existía la BD pero sin la columna `external_link`:

```sql
ALTER TABLE `tutorials`
ADD COLUMN `external_link` VARCHAR(2048) NULL DEFAULT NULL
AFTER `files`;
```

#### 6. Verificar permisos de carpetas

La carpeta de uploads debe tener permisos de escritura:
```
public/uploads/ → permisos 755 o 775
public/uploads/files/ → permisos 755 o 775
```

Desde cPanel → Administrador de Archivos → clic derecho en la carpeta → *Change Permissions*.

---

## Subir Actualizaciones de Código a Producción

Cuando se modifica código en local, hay dos formas de actualizarlo en producción:

### Método 1: ZIP con estructura de carpetas

1. En local, crear un ZIP con la estructura de carpetas completa:
   ```powershell
   # Ejemplo con PowerShell (Windows)
   tar -a -cf actualizacion.zip -C "ruta\del\proyecto" frontend backend
   ```
2. Subir el ZIP al servidor en cPanel.
3. Hacer clic derecho → **Extract**. Esto reemplaza los archivos existentes respetando las carpetas.

### Método 2: Subir archivos individualmente

1. En cPanel → Administrador de Archivos, navegar a la carpeta del archivo a reemplazar.
2. Subir el archivo nuevo (se sobreescribe el existente).

> ⚠️ **Importante:** Siempre hacer **Ctrl + Shift + R** en el navegador después de actualizar archivos JS o CSS para forzar la recarga desde el servidor y no desde la caché del navegador.

---

## Estructura de Archivos Clave para Despliegue

| Archivo / Carpeta | ¿Subir a producción? | Nota |
|---|---|---|
| `frontend/` | ✅ Sí | Vistas y JS del frontend |
| `backend/` | ✅ Sí | API y lógica del servidor |
| `database/schema.sql` | Solo la primera vez | Para crear la BD |
| `assets/` | ✅ Sí | Imágenes estáticas |
| `public/uploads/` | ❌ No sobreescribir | Archivos subidos por usuarios |
| `.env` | ❌ Nunca en Git | Configurar manualmente en el servidor |
| `.htaccess` | ✅ Sí | Reglas de URL de Apache |
| `vendor/` | ✅ Sí (o instalar con Composer) | Dependencias PHP |
| `.git/` | ❌ Nunca | Solo para control de versiones local |
