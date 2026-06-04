# 02 — Arquitectura del Sistema

## Estructura de Carpetas

```
wiki-kreative-gen15.5/
│
├── .env                        # Variables de entorno (NO subir a Git)
├── .env.example                # Plantilla de variables de entorno
├── .htaccess                   # Reglas de reescritura de URL para Apache
├── index.php                   # Punto de entrada raíz del proyecto
├── composer.json               # Dependencias PHP
│
├── backend/                    # Lógica del servidor (API REST)
│   ├── public/
│   │   └── index.php           # Punto de entrada de la API
│   ├── config/
│   │   └── env_loader.php      # Carga las variables del .env
│   └── app/
│       ├── Router.php          # Enrutador de la API
│       ├── Controllers/
│       │   ├── AuthController.php      # Login / Logout
│       │   └── TutorialController.php  # CRUD de tutoriales
│       ├── Models/
│       │   ├── Database.php    # Conexión PDO (Singleton)
│       │   └── TutorialModel.php       # Queries de tutoriales
│       ├── Middleware/         # Middleware JWT de autenticación
│       ├── Helpers/
│       │   └── JwtHelper.php   # Codificación/decodificación JWT
│       └── Routes/
│           └── api.php         # Definición de todas las rutas de la API
│
├── frontend/                   # Interfaz de usuario
│   ├── .htaccess               # Reglas frontend para Apache
│   ├── index.php               # Entrada del frontend (enruta vistas)
│   ├── routes.php              # Mapa de rutas frontend → vistas PHP
│   ├── Router.php              # Enrutador del frontend
│   ├── views/
│   │   ├── index.php           # Vista principal (listado de publicaciones)
│   │   ├── detail.php          # Vista de detalle de una publicación
│   │   ├── login.html          # Página de inicio de sesión
│   │   ├── forgot-password.html
│   │   └── components/         # Componentes reutilizables (header, footer, etc.)
│   └── public/
│       ├── css/                # Hojas de estilo
│       └── js/
│           ├── index.js            # Lógica de la página principal
│           ├── detail.js           # Lógica de la página de detalle
│           ├── login.js            # Lógica del login
│           ├── forgot-password.js  # Lógica de recuperación de contraseña
│           ├── verifyloguin.js     # Verificación de sesión activa
│           └── wiki-kreative-feedback.js  # Sistema de feedback (toasts, confirmaciones)
│
├── database/
│   └── schema.sql              # Script SQL para crear la base de datos desde cero
│
├── assets/
│   └── img/                    # Imágenes estáticas del proyecto (logos)
│
└── public/
    └── uploads/                # Archivos subidos por los usuarios
        ├── img_*.jpg           # Imágenes de portada de publicaciones
        └── files/              # Archivos adjuntos de publicaciones
```

---

## Flujo de una Petición (Backend)

```
Navegador / JS Fetch
      │
      ▼
Apache (.htaccess)
      │  Redirige todo a backend/public/index.php
      ▼
backend/public/index.php
      │  Carga el .env y el autoloader
      ▼
backend/app/Router.php
      │  Lee la URL → busca la ruta en Routes/api.php
      │  Verifica autenticación JWT (si la ruta lo requiere)
      ▼
Controller (AuthController / TutorialController)
      │  Procesa la petición, llama al modelo
      ▼
Model (TutorialModel / Database)
      │  Ejecuta la query SQL con PDO
      ▼
Respuesta JSON al navegador
```

---

## Flujo de una Página (Frontend)

```
Navegador → URL (ej: /frontend/detail?id=79)
      │
      ▼
Apache → frontend/index.php
      │
      ▼
frontend/Router.php → Lee routes.php
      │  Carga la vista correspondiente: views/detail.php
      ▼
views/detail.php
      │  HTML estático con contenedores vacíos
      │  Carga detail.js al final
      ▼
detail.js (JavaScript)
      │  Lee el ?id= de la URL
      │  Hace fetch a la API: /backend/public/api/tutorial/get?id=79
      │  Recibe JSON con los datos de la publicación
      │  Rellena el DOM con título, descripción, contenido, tags, adjuntos, videos
```

---

## Dos Bases de Datos

El sistema usa **dos bases de datos** distintas:

| BD | Nombre | Uso |
|---|---|---|
| **Wiki** | `alphadocere_wiki` | Almacena las publicaciones (tutoriales) |
| **Auth** | `alphadocere_auth_system` | Almacena usuarios, roles y proyectos (sistema central compartido) |

La base de datos Auth es **compartida con todos los sistemas de Alpha Docere**. La Wiki solo la consulta para validar credenciales y buscar el rol del usuario en el `proyecto_id` de la Wiki.
