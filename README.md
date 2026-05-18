# 📚 Wiki KREATIVE — Generación 15.5

> Plataforma interna de gestión y difusión de conocimiento para los equipos del programa **Alpha Docere**.

![PHP](https://img.shields.io/badge/PHP-8.0+-777BB4?style=flat-square&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Apache](https://img.shields.io/badge/Apache-2.4-D22128?style=flat-square&logo=apache&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat-square&logo=javascript&logoColor=black)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)

---

## 🌐 URL de Producción

```
https://wiki.alphadocere.cl/frontend/
```

---

## ✨ Funcionalidades

| Función | Descripción |
|---|---|
| 📋 **Listado de publicaciones** | Cards con filtros por categoría, búsqueda por texto y etiquetas |
| 🔍 **Vista de detalle** | Contenido completo, videos de YouTube incrustados y archivos adjuntos |
| ✏️ **Crear y editar** | Modales completos con imagen de portada, etiquetas y archivos |
| 🗑️ **Eliminar** | Con confirmación y limpieza automática de archivos del servidor |
| 🔗 **Detección de enlaces** | URLs en el contenido se convierten en enlaces clicables automáticamente |
| 🎥 **Reproductor de YouTube** | Links de YouTube en el contenido se incrustan como video player |
| 🔒 **Control de acceso** | Roles `admin` y `editor` para escritura; resto solo lectura |
| 🪪 **Autenticación JWT** | Login integrado con el Sistema Auth central de Alpha Docere |

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| Servidor | Apache (cPanel / XAMPP) |
| Backend | PHP 8+ — Arquitectura MVC propia |
| Frontend | HTML + CSS + JavaScript Vanilla |
| Base de datos Wiki | MySQL — `alphadocere_wiki` |
| Base de datos Auth | MySQL — `alphadocere_auth_system` (sistema central) |
| Autenticación | JWT firmado con HS256 |
| Gestión de paquetes | Composer |

---

## 🚀 Instalación Local (XAMPP)

### Prerrequisitos
- XAMPP con Apache + MySQL
- PHP 8.0+
- Composer

### Pasos

```bash
# 1. Clonar el repositorio en la carpeta htdocs de XAMPP
#    Ruta: C:\xampp\htdocs\wiki-kreative-gen15.5\

# 2. Instalar dependencias PHP (raíz y backend)
composer install
cd backend && composer install

# 3. Configurar las variables de entorno
cp .env.example .env
# → Editar .env y establecer ENVIRONMENT=dev
# → Las credenciales por defecto son root sin contraseña

# 4. Crear la base de datos
# → Abrir phpMyAdmin en http://localhost/phpmyadmin
# → Importar el archivo database/schema.sql

# 5. Crear usuario de prueba local
crear_usuario_local.bat  # Windows

# 6. Acceder a la Wiki
# → http://localhost/wiki-kreative-gen15.5/frontend/
```

> 📖 Ver la guía completa en **[GUIA_LEVANTAMIENTO.md](GUIA_LEVANTAMIENTO.md)**

---

## 📁 Estructura del Proyecto

```
wiki-kreative-gen15.5/
├── backend/                    # API REST (PHP MVC)
│   ├── app/
│   │   ├── Controllers/        # AuthController, TutorialController
│   │   ├── Models/             # TutorialModel, Database (PDO Singleton)
│   │   ├── Routes/api.php      # Definición de rutas de la API
│   │   ├── Middleware/         # Verificación JWT
│   │   └── Helpers/            # JwtHelper
│   └── config/env_loader.php   # Carga del archivo .env
├── frontend/                   # Interfaz de usuario
│   ├── views/                  # Vistas PHP (index, detail, login)
│   └── public/
│       ├── css/                # Hojas de estilo
│       └── js/                 # Scripts (index.js, detail.js, login.js...)
├── database/
│   └── schema.sql              # Script de creación de la BD Wiki
├── public/uploads/             # Archivos subidos por usuarios
├── assets/                     # Imágenes y recursos estáticos
├── doc/                        # 📚 Documentación técnica completa
├── .env.example                # Plantilla de variables de entorno
├── .htaccess                   # Reglas de reescritura de URL
└── composer.json               # Dependencias PHP
```

---

## 🔐 Variables de Entorno

Copiar `.env.example` a `.env` y completar los valores:

```ini
ENVIRONMENT=dev               # 'dev' para local, 'prod' para producción

DEV_DB_HOST=localhost
DEV_DB_NAME=alphadocere_wiki
DEV_DB_USER=root
DEV_DB_PASS=

PROD_DB_HOST=localhost
PROD_DB_NAME=nombre_bd_cpanel
PROD_DB_USER=usuario_bd
PROD_DB_PASS=contraseña_bd

WIKI_PROYECTO_ID=3            # ID de la Wiki en el Sistema Auth
JWT_SECRET=tu_clave_secreta
JWT_EXPIRY=3600
```

> ⚠️ El archivo `.env` está en `.gitignore` — **nunca subir credenciales reales a Git**.

---

## 📡 API REST — Resumen de Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/tutorial/getAll` | ❌ Público | Listar todas las publicaciones |
| `GET` | `/api/tutorial/get?id=N` | ❌ Público | Obtener una publicación por ID |
| `POST` | `/api/tutorial/create` | ✅ admin/editor | Crear publicación |
| `POST` | `/api/tutorial/update` | ✅ admin/editor | Editar publicación |
| `POST` | `/api/tutorial/delete` | ✅ admin/editor | Eliminar publicación |
| `POST` | `/api/auth/login` | ❌ Público | Iniciar sesión |
| `POST` | `/api/auth/logout` | ✅ Autenticado | Cerrar sesión |

---

## 👥 Roles y Permisos

| Rol | Ver | Crear | Editar | Eliminar |
|---|---|---|---|---|
| `admin` / `admin_wiki` | ✅ | ✅ | ✅ | ✅ |
| `editor` / `editor_wiki` | ✅ | ✅ | ✅ | ❌ |
| Cualquier otro rol | ✅ | ❌ | ❌ | ❌ |

Los roles son gestionados por el **Sistema Auth central** de Alpha Docere (`alphadocere_auth_system`).

---

## 📚 Documentación

La documentación técnica completa está en la carpeta [`doc/`](doc/):

| Documento | Contenido |
|---|---|
| [01 — Descripción del Proyecto](doc/01-descripcion-proyecto.md) | Objetivos, funcionalidades y stack |
| [02 — Arquitectura](doc/02-arquitectura.md) | Estructura de carpetas y flujo de peticiones |
| [03 — Base de Datos](doc/03-base-de-datos.md) | Tablas, columnas y esquema SQL |
| [04 — API Backend](doc/04-api-backend.md) | Endpoints, parámetros y respuestas |
| [05 — Frontend](doc/05-frontend.md) | Vistas, scripts JS y funciones clave |
| [06 — Autenticación y Roles](doc/06-autenticacion-roles.md) | Flujo JWT y control de acceso |
| [07 — Configuración y Despliegue](doc/07-configuracion-despliegue.md) | .env, local y cPanel |
| [08 — Guía de Contribución](doc/08-guia-contribucion.md) | Convenciones y troubleshooting |
| [09 — Diagramas del Sistema](doc/09-diagramas.html) | 9 diagramas visuales (abrir en navegador) |

---

## 🤝 Contribución

1. Hacer los cambios en local y probar en `http://localhost/wiki-kreative-gen15.5/frontend/`
2. Empaquetar los archivos modificados con su estructura de carpetas
3. Subir el ZIP a cPanel y extraerlo respetando las rutas
4. Verificar en producción y hacer **Ctrl + Shift + R** para forzar recarga de caché

> 📖 Ver guía detallada en [doc/08-guia-contribucion.md](doc/08-guia-contribucion.md)

---

<p align="center">
  Desarrollado por el equipo <strong>KREATIVE</strong> — Generación 15.5 · Alpha Docere
</p>
