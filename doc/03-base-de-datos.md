# 03 — Base de Datos

## Base de Datos Principal: `alphadocere_wiki`

Esta es la base de datos exclusiva de la Wiki. Contiene las publicaciones (tutoriales) y sus datos asociados.

---

## Tabla `tutorials`

Tabla principal y única de la Wiki. Almacena todas las publicaciones.

### Columnas

| Columna | Tipo | Nulo | Por defecto | Descripción |
|---|---|---|---|---|
| `id` | `INT` AUTO_INCREMENT | NO | — | Clave primaria única |
| `title` | `VARCHAR(255)` | NO | — | Título de la publicación |
| `description` | `TEXT` | SÍ | NULL | Descripción corta / resumen |
| `content` | `LONGTEXT` | SÍ | NULL | Contenido principal. Puede contener texto, URLs, links de YouTube |
| `image` | `VARCHAR(500)` | SÍ | NULL | Ruta relativa de la imagen de portada (ej: `/public/uploads/img_abc.jpg`) |
| `area` | `VARCHAR(100)` | NO | — | Categoría de la publicación (ver valores válidos abajo) |
| `tags` | `JSON` | SÍ | NULL | Array JSON de etiquetas. Ej: `["PHP", "MySQL"]` |
| `files` | `JSON` | SÍ | NULL | Array JSON de rutas de archivos adjuntos |
| `external_link` | `VARCHAR(2048)` | SÍ | NULL | Enlace externo asociado a la publicación (nuevo campo) |
| `lastEditor` | `VARCHAR(150)` | SÍ | NULL | Nombre del último usuario que editó |
| `creator` | `VARCHAR(150)` | SÍ | NULL | Nombre del usuario que creó la publicación |
| `created_at` | `TIMESTAMP` | NO | `CURRENT_TIMESTAMP` | Fecha y hora de creación |
| `updated_at` | `TIMESTAMP` | NO | `CURRENT_TIMESTAMP ON UPDATE` | Fecha y hora de última actualización |

### Valores válidos para `area`

| Valor en BD | Nombre mostrado |
|---|---|
| `programacion` | Programación |
| `diseño` | Diseño |
| `gastronomia` | Gastronomía |
| `tutorial` | Tutorial |
| `marketing` | Marketing |

### Ejemplo de registro

```json
{
  "id": 79,
  "title": "Cierre de práctica | Vicente Sagredo - Generación 17",
  "description": "Resumen del cierre de práctica de Vicente Sagredo.",
  "content": "https://www.youtube.com/watch?v=mjb9Nk17Duc&t=1041s",
  "image": "/public/uploads/img_abc123.jpg",
  "area": "programacion",
  "tags": "[\"Cierre practica\", \"Gen17\"]",
  "files": "[]",
  "external_link": null,
  "lastEditor": "user123",
  "creator": "user123",
  "created_at": "2026-05-10 14:30:00",
  "updated_at": "2026-05-18 20:00:00"
}
```

---

## Script de Creación

El archivo de creación de la base de datos se encuentra en:

```
database/schema.sql
```

Para crear la base de datos desde cero, importar este archivo en **phpMyAdmin** o ejecutar en terminal:

```bash
mysql -u root -p < database/schema.sql
```

---

## Migración: Columna `external_link`

Esta columna fue añadida en producción como migración posterior al schema inicial. Si la BD ya existe, ejecutar:

```sql
ALTER TABLE `tutorials`
ADD COLUMN `external_link` VARCHAR(2048) NULL DEFAULT NULL
AFTER `files`;
```

Script disponible en: `backend/sql/add_external_link_column.sql`

---

## Base de Datos de Autenticación: `alphadocere_auth_system`

Esta base de datos es **externa y compartida** con otros sistemas de Alpha Docere. La Wiki solo la consulta para **login y verificación de roles**. No se modifica desde la Wiki.

### Tablas consultadas (solo lectura)

#### `clients`
| Columna | Descripción |
|---|---|
| `id` | ID único del usuario |
| `email` | Correo electrónico (usado para login) |
| `password` | Hash bcrypt de la contraseña |
| `nombre` | Nombre completo del usuario |
| `status` | Estado de la cuenta (`active` o `inactive`) |

#### `usuarios_roles_proyectos`
| Columna | Descripción |
|---|---|
| `usuario_id` | FK hacia `clients.id` |
| `proyecto_id` | ID del proyecto (Wiki = `3` por defecto) |
| `rol_id` | FK hacia `roles.id_rol` |

#### `roles`
| Columna | Descripción |
|---|---|
| `id_rol` | ID del rol |
| `nombre_rol` | Nombre del rol (ej: `admin`, `editor`, `viewer`) |

### Roles válidos en la Wiki

| Rol | Permisos |
|---|---|
| `admin` / `admin_wiki` | Ver, crear, editar y eliminar publicaciones |
| `editor` / `editor_wiki` | Ver, crear y editar publicaciones |
| Cualquier otro rol | Solo ver publicaciones (modo lectura) |
