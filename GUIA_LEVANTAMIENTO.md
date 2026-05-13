# 🚀 Guía de Levantamiento Local — Wiki Kreative Gen 15.5

Guía rápida para levantar la Wiki en tu computador con XAMPP.

---

## 📋 Requisitos

- **XAMPP** (PHP 8.0+) → [descargar](https://www.apachefriends.org/)
- **Composer** → [descargar](https://getcomposer.org/)
- **Git** → [descargar](https://git-scm.com/)

---

## 1. Clonar el Proyecto

```bash
cd C:\xampp\htdocs
git clone <URL_DEL_REPOSITORIO> wiki-kreative-gen15.5
```

---

## 2. Instalar Dependencias

Abre una terminal y ejecuta estos dos comandos:

```bash
cd C:\xampp\htdocs\wiki-kreative-gen15.5
composer install
```

```bash
cd backend
composer install
```

---

## 3. Crear la Base de Datos

1. Abre XAMPP e inicia **Apache** y **MySQL**.
2. Ve a `http://localhost/phpmyadmin`.
3. Haz clic en **Importar** y selecciona el archivo `database/schema.sql` del proyecto.
4. Dale a **Continuar**.

---

## 4. Crear un Usuario de Prueba (Auth Local)

Para poder iniciar sesión localmente sin conectar al System Auth de producción, hemos preparado un script interactivo que levanta la base de datos de Auth localmente y te permite crear tu propio usuario.

1. Ve a la carpeta raíz del proyecto (`C:\xampp\htdocs\wiki-kreative-gen15.5`).
2. Haz doble clic en el archivo **`crear_usuario_local.bat`**.
3. Se abrirá una consola pidiéndote:
   - Nombre de usuario
   - Correo electrónico
   - Contraseña
   - El Rol que quieres asignarle (Admin, Editor o Lector)
4. Sigue las instrucciones en pantalla. ¡Listo! Ya tienes un usuario para ingresar.

---

## 5. Configurar el .env

1. Copia el archivo `.env.example` y renómbralo a `.env`.
2. Ábrelo y configúralo así:

```env
ENVIRONMENT=dev

# Wiki (local, tu XAMPP)
DEV_DB_HOST=localhost
DEV_DB_NAME=alphadocere_wiki
DEV_DB_USER=root
DEV_DB_PASS=
DEV_DB_PORT=3306

# Auth (local, la que creaste con el script .bat)
DEV_AUTH_DB_HOST=localhost
DEV_AUTH_DB_NAME=alphadocere_auth_system
DEV_AUTH_DB_USER=root
DEV_AUTH_DB_PASS=
DEV_AUTH_DB_PORT=3306

WIKI_PROYECTO_ID=3
JWT_SECRET=WikiSecretKey_Gen15_Version2_2026_Secure
JWT_EXPIRY=3600
```

> ✅ **Listo.** Ya no necesitas pedir credenciales remotas, usarás los usuarios de prueba.

---

## 6. Probar

Abre tu navegador y entra a:

```
http://localhost/wiki-kreative-gen15.5/frontend/index.php
```

✅ Si ves la Wiki con publicaciones, ¡está funcionando!

Para probar el login, utiliza el **correo y contraseña que creaste** en el paso del archivo `.bat`.

---

## 🔧 Problemas Comunes

| Error | Solución |
|---|---|
| `vendor/autoload.php not found` | Ejecuta `composer install` en la raíz y en `backend/` |
| `Access denied for user 'root'` | Revisa las credenciales en tu `.env` |
| Las imágenes no cargan | Crea la carpeta `public/uploads/` en la raíz del proyecto |
| El rol no aparece bien después de login | Cierra sesión, presiona `CTRL+SHIFT+R` y vuelve a entrar |

---

> **Última actualización:** Mayo 2026
