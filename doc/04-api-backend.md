# 04 — API REST Backend

## URL Base

- **Local (XAMPP):** `http://localhost/wiki-kreative-gen15.5/backend/public/api/`
- **Producción:** `https://wiki.alphadocere.cl/backend/public/api/`

---

## Autenticación

Las rutas protegidas requieren un **token JWT** enviado como cookie llamada `token`.

El token se genera al hacer login exitoso y expira en `3600` segundos (1 hora) por defecto.

Para verificar si un usuario está autenticado, el frontend lee la cookie `token` y la decodifica en el navegador para obtener:
- `data.username` — Nombre del usuario
- `data.email` — Correo del usuario
- `data.role` — Rol del usuario en la Wiki

---

## Endpoints

### 🔓 Rutas Públicas (sin autenticación)

---

#### `GET tutorial/get`

Obtiene una publicación por su ID.

**Parámetros (query string):**

| Parámetro | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | integer | ✅ | ID de la publicación |

**Respuesta exitosa (200):**
```json
{
  "id": 79,
  "title": "Cierre de práctica | Vicente Sagredo",
  "description": "Descripción de la publicación",
  "content": "https://www.youtube.com/watch?v=...",
  "image": "/public/uploads/img_abc123.jpg",
  "area": "programacion",
  "tags": "[\"Gen17\", \"Cierre\"]",
  "files": "[]",
  "external_link": null,
  "lastEditor": "user123",
  "creator": "user123",
  "created_at": "2026-05-10 14:30:00",
  "updated_at": "2026-05-18 20:00:00"
}
```

**Respuesta error (404):**
```json
{ "error": "Tutorial not found" }
```

---

#### `GET tutorial/getAll`

Obtiene todas las publicaciones ordenadas por fecha de creación descendente.

**Sin parámetros.**

**Respuesta exitosa (200):**
```json
[
  { "id": 80, "title": "...", ... },
  { "id": 79, "title": "...", ... }
]
```

---

#### `POST auth/login`

Autentica al usuario y genera un token JWT.

**Body (multipart/form-data o application/x-www-form-urlencoded):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `email` | string | ✅ | Correo del usuario |
| `password` | string | ✅ | Contraseña del usuario |

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "¡Bienvenido/a a la Wiki Kreative!",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "Vicente Sagredo",
    "email": "vsagredo@example.com",
    "role": "editor"
  }
}
```

**Respuestas de error:**

| Código | Motivo |
|---|---|
| 401 | Credenciales incorrectas |
| 403 | Cuenta inactiva o sin rol asignado en la Wiki |
| 500 | Error interno del servidor |

---

### 🔒 Rutas Protegidas (requieren JWT — roles `admin` o `editor`)

---

#### `POST tutorial/create`

Crea una nueva publicación.

**Body (multipart/form-data):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `title` | string | ✅ | Título de la publicación |
| `description` | string | ✅ | Descripción corta |
| `content` | string | ✅ | Contenido principal. Puede incluir URLs y links de YouTube |
| `area` | string | ✅ | Categoría (`programacion`, `diseño`, `gastronomia`, `tutorial`, `marketing`) |
| `tags` | JSON string | ✅ | Array de etiquetas. Ej: `["tag1","tag2"]` |
| `creator` | string | ✅ | Nombre del creador |
| `lastEditor` | string | ✅ | Nombre del editor |
| `image` | file | ❌ | Imagen de portada (JPG, PNG, GIF, WEBP, AVIF, SVG — máx 10MB) |
| `files[]` | file[] | ❌ | Archivos adjuntos (uno o múltiples) |

**Respuesta exitosa (200):**
```json
{ "message": "Tutorial created successfully" }
```

---

#### `POST tutorial/update`

Actualiza una publicación existente.

**Body (multipart/form-data):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | integer | ✅ | ID de la publicación a actualizar |
| `title` | string | ✅ | Título |
| `description` | string | ✅ | Descripción |
| `content` | string | ✅ | Contenido principal |
| `area` | string | ✅ | Categoría |
| `tags` | JSON string | ✅ | Array de etiquetas |
| `lastEditor` | string | ✅ | Nombre del editor |
| `deleteImage` | string | ❌ | `"1"` para eliminar la imagen actual |
| `deleteFiles` | JSON string | ❌ | Array de rutas de archivos a eliminar |
| `image` | file | ❌ | Nueva imagen de portada (reemplaza la existente) |
| `files[]` | file[] | ❌ | Nuevos archivos adjuntos (se agregan a los existentes) |

**Respuesta exitosa (200):**
```json
{ "message": "Tutorial updated successfully" }
```

---

#### `POST tutorial/delete`

Elimina una publicación y sus archivos asociados.

**Body (multipart/form-data):**

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | integer | ✅ | ID de la publicación a eliminar |

**Respuesta exitosa (200):**
```json
{ "message": "Tutorial deleted successfully" }
```

---

#### `POST auth/logout`

Cierra la sesión del usuario eliminando la cookie JWT.

**Sin parámetros.**

**Respuesta exitosa (200):**
```json
{ "success": true, "message": "Sesión cerrada" }
```
