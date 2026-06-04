# 05 — Frontend

## Páginas y Vistas

El frontend usa PHP solo como enrutador de vistas. Toda la lógica de datos se maneja con **JavaScript vanilla** haciendo llamadas `fetch` a la API backend.

---

## Vista: Página Principal (`/frontend/` o `/frontend/index`)

**Archivo:** `frontend/views/index.php`  
**Script:** `frontend/public/js/index.js`

### Funcionalidades

- Listado de publicaciones en formato tarjetas (cards)
- Filtro por categoría (Todas, Programación, Diseño, Gastronomía, Tutorial, Marketing)
- Buscador de texto libre (busca en título, descripción y etiquetas)
- Filtro por etiqueta al hacer clic sobre una etiqueta
- Modal para **crear** nueva publicación (solo admins y editores)
- Modal para **editar** publicación existente (solo admins y editores)
- Menú dropdown por tarjeta para editar o eliminar (solo admins y editores)
- Paginación de resultados

### Función principal: `fetchPublications()`

Llama a `GET tutorial/getAll`, obtiene todas las publicaciones y las renderiza como tarjetas HTML con `createPublicationCard(pub)`.

### Función: `submitUpload()`

Recoge todos los datos del modal de creación, valida campos obligatorios y hace `POST tutorial/create` con un `FormData`.

**Campos del formulario de creación:**
- Título (obligatorio)
- Descripción (obligatorio)
- Imagen de portada
- Contenido (obligatorio) — *Aquí se deben pegar los links de YouTube u otros enlaces externos; el sistema los detecta automáticamente*
- Área / Categoría (obligatorio)
- Etiquetas
- Archivo(s) adjunto(s)

### Función: `submitEdit()`

Igual que `submitUpload()` pero hace `POST tutorial/update`. Precarga el formulario con los datos de la publicación seleccionada.

### Función: `openEditModal(id)`

Busca la publicación en el array local por `id` y rellena todos los campos del modal de edición con los datos existentes.

### Función: `deletePublication(id)`

Muestra una confirmación y, si el usuario acepta, hace `POST tutorial/delete`.

---

## Vista: Detalle de Publicación (`/frontend/detail?id={id}`)

**Archivo:** `frontend/views/detail.php`  
**Script:** `frontend/public/js/detail.js`

### Funcionamiento

1. Al cargar la página, el script lee el parámetro `?id=` de la URL.
2. Hace `GET tutorial/get?id={id}` a la API.
3. Rellena dinámicamente todos los elementos del DOM.

### Secciones del Detalle

| Sección | ID en el DOM | Descripción |
|---|---|---|
| Imagen de portada | `publicationImage` | Fondo `background-image` |
| Categoría | `publicationCategory` | Badge de categoría |
| Fecha | `publicationDate` | Formateada en español |
| Título | `publicationTitle` | Etiqueta `<h1>` |
| Descripción | `publicationDescription` | Con links clicables |
| Contenido principal | `content-section` | Con links clicables automáticos |
| Videos YouTube | (creado dinámicamente) | Iframes incrustados |
| Etiquetas | `tagsContainer` | Pills de etiquetas |
| Archivos adjuntos | `attachmentsSection` / `attachmentsList` | Oculto si no hay archivos |
| Enlace relacionado | `externalLinkSection` / `externalLink` | Oculto si no hay enlace |

### Función: `linkverify(text)`

Convierte cualquier URL `http://` o `https://` dentro de un texto en un enlace HTML `<a href>` clicable. Esto aplica a la descripción y al contenido.

### Función: `extractYouTubeVideos(text)`

Extrae todos los IDs de video de URLs de YouTube presentes en un texto y retorna un `Set` de IDs únicos.

**Patrones reconocidos:**
- `youtube.com/watch?v=ID`
- `youtu.be/ID`
- `youtube.com/embed/ID`

### Lógica de "Enlace Relacionado"

La sección de enlace relacionado (`externalLinkSection`) se muestra usando esta prioridad:

1. **Campo `external_link` de la BD** — si la publicación tiene un enlace guardado explícitamente en la columna `external_link`.
2. **Primera URL del `content`** — si no hay `external_link`, busca la primera URL en el campo `content`.
3. **Primera URL del `description`** — si tampoco hay en content, busca en description.
4. **Oculto** — si no se encuentra ningún enlace, la sección permanece oculta.

---

## Archivos JavaScript

### `index.js`
Script principal de la página de inicio. Contiene todo el CRUD de publicaciones, los modales, los filtros y la búsqueda.

### `detail.js`
Script de la página de detalle. Carga y renderiza la publicación completa con contenido, videos y enlaces.

### `login.js`
Maneja el formulario de login. Al hacer submit hace `POST auth/login` y si es exitoso guarda el token en la cookie y redirige al inicio.

### `verifyloguin.js`
Se incluye en todas las páginas protegidas. Lee la cookie `token`, la decodifica y redirige al login si está expirada o ausente. También expone `currentUserRole` globalmente para los controles de permisos.

### `wiki-kreative-feedback.js`
Biblioteca de utilidades de UI compartida. Provee:
- `showSuccess(msg)` — Toast de éxito
- `showError(msg)` — Toast de error
- `showConfirm(msg)` — Modal de confirmación asíncrona (devuelve Promise)
- `WKFeedback.validateRequired(fields)` — Valida campos requeridos mostrando bordes rojos
- `WKFeedback.withButtonLock(btn, fn, opts)` — Bloquea un botón durante una operación asíncrona

### `forgot-password.js`
Maneja el flujo de recuperación de contraseña.

---

## Variables Globales del Frontend

Definidas en `verifyloguin.js` o al inicio de cada script principal:

| Variable | Descripción |
|---|---|
| `API_BASE_URL` | URL base de la API. Se detecta automáticamente según si está en local o producción |
| `PROJECT_ROOT` | Ruta raíz del proyecto. En local: `/wiki-kreative-gen15.5`, en producción: `` (vacío) |
| `currentUserRole` | Rol del usuario autenticado (leído del JWT) |

---

## Detección Automática de Entorno (Local vs Producción)

El frontend detecta si está corriendo en localhost o en producción para construir las rutas correctamente:

```javascript
const isLocal = window.location.hostname === 'localhost' 
                || window.location.hostname === '127.0.0.1';
const PROJECT_ROOT = isLocal ? '/wiki-kreative-gen15.5' : '';
const API_BASE_URL = PROJECT_ROOT + '/backend/public/api';
```
