# 01 — Descripción del Proyecto

## ¿Qué es Wiki KREATIVE?

**Wiki KREATIVE** es una plataforma web interna de gestión de conocimiento para los equipos y generaciones del programa Alpha Docere. Permite a los estudiantes publicar, consultar y compartir tutoriales, guías y recursos en diferentes áreas como programación, diseño, gastronomía, marketing y más.

La versión actual es la **Generación 15.5**.

---

## Objetivos del Sistema

- **Centralizar el conocimiento:** Un único lugar donde publicar recursos y tutoriales.
- **Facilitar el acceso:** Búsqueda por categoría, etiqueta o texto libre.
- **Control de acceso por roles:** Solo los usuarios autorizados pueden crear o editar contenido.
- **Integración con el Auth central:** Los usuarios se autentican con la misma cuenta que usan en los demás sistemas de Alpha Docere.

---

## Funcionalidades Principales

| Función | Descripción |
|---|---|
| **Listar publicaciones** | Vista de tarjetas con filtros por categoría, búsqueda por texto y por etiqueta |
| **Ver detalle** | Página completa de una publicación con contenido, etiquetas, archivos adjuntos y enlaces relacionados |
| **Crear publicación** | Modal de creación con título, descripción, contenido, imagen, categoría, etiquetas y archivos |
| **Editar publicación** | Modal de edición con precarga de datos existentes |
| **Eliminar publicación** | Eliminación con confirmación, borra imagen y archivos del servidor |
| **Subir imágenes y archivos** | Portada de imagen y múltiples archivos adjuntos |
| **Detección de enlaces y videos** | URLs pegadas en el contenido son convertidas en enlaces clicables; YouTube se incrusta como reproductor |
| **Autenticación JWT** | Login con email/contraseña, token guardado en cookie |
| **Control por roles** | Solo `admin` y `editor` pueden crear, editar y eliminar publicaciones |

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Servidor Web** | Apache (cPanel en producción / XAMPP en local) |
| **Backend** | PHP 8+ con arquitectura MVC casera (sin framework) |
| **Base de Datos Wiki** | MySQL (`alphadocere_wiki`) |
| **Base de Datos Auth** | MySQL (`alphadocere_auth_system`) — sistema centralizado externo |
| **Frontend** | HTML, CSS, JavaScript vanilla (sin frameworks) |
| **Autenticación** | JWT (JSON Web Tokens) firmados con HS256 |
| **Gestión de dependencias** | Composer (backend PHP) |

---

## URL de Producción

```
https://wiki.alphadocere.cl/
```

Rutas principales:
- `/frontend/` — Página principal con listado de publicaciones
- `/frontend/detail?id={id}` — Página de detalle de una publicación
- `/frontend/login.html` — Página de inicio de sesión
