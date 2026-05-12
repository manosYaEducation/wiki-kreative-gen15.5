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

## 4. Configurar el .env

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

# Auth (remoto, pedir credenciales al líder)
DEV_AUTH_DB_HOST=___PEDIR_AL_LIDER___
DEV_AUTH_DB_NAME=___PEDIR_AL_LIDER___
DEV_AUTH_DB_USER=___PEDIR_AL_LIDER___
DEV_AUTH_DB_PASS=___PEDIR_AL_LIDER___
DEV_AUTH_DB_PORT=3306

WIKI_PROYECTO_ID=3
JWT_SECRET=WikiSecretKey_Gen15_Version2_2026_Secure
JWT_EXPIRY=3600
```

> ⚠️ **Las credenciales de Auth son privadas.** Pídelas al líder del proyecto directamente.

---

## 5. Probar

Abre tu navegador y entra a:

```
http://localhost/wiki-kreative-gen15.5/frontend/index.php
```

✅ Si ves la Wiki con publicaciones, ¡está funcionando!

Para probar el login, usa las mismas credenciales del sistema de autenticación del proyecto.

---

## 🔧 Problemas Comunes

| Error | Solución |
|---|---|
| `vendor/autoload.php not found` | Ejecuta `composer install` en la raíz y en `backend/` |
| `Access denied for user 'root'` | Revisa las credenciales en tu `.env` |
| `Connection refused` al hacer login | Pide al líder que habilite el acceso remoto a MySQL para tu IP |
| Las imágenes no cargan | Crea la carpeta `public/uploads/` en la raíz del proyecto |
| El rol no aparece bien después de login | Cierra sesión, presiona `CTRL+SHIFT+R` y vuelve a entrar |

---

> **Última actualización:** Mayo 2026
