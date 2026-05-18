# 08 — Guía de Contribución

## Flujo de Trabajo General

1. Hacer los cambios en el entorno local (XAMPP)
2. Probar que todo funciona correctamente en `http://localhost/wiki-kreative-gen15.5/frontend/`
3. Empaquetar los archivos modificados
4. Subir al servidor de producción cPanel
5. Verificar en `https://wiki.alphadocere.cl/`

---

## Estructura de Cambios Comunes

### Modificar estilos (CSS)

- Los estilos están en `frontend/public/css/`
- Subir únicamente el archivo `.css` modificado a la misma ruta en el servidor.
- Hacer **Ctrl + Shift + R** para forzar recarga de estilos en el navegador.

### Modificar lógica del frontend (JS)

- Los scripts están en `frontend/public/js/`
- Subir únicamente el archivo `.js` modificado.
- Hacer **Ctrl + Shift + R** para forzar recarga del script en el navegador.

### Modificar una vista (PHP)

- Las vistas están en `frontend/views/`
- Subir únicamente el archivo `.php` modificado.

### Modificar el backend (PHP)

- Controllers: `backend/app/Controllers/`
- Models: `backend/app/Models/`
- Routes: `backend/app/Routes/api.php`
- Subir únicamente los archivos `.php` modificados.

### Modificar la base de datos

- Crear un script SQL con el `ALTER TABLE` o la migración necesaria.
- Ejecutarlo en **phpMyAdmin** del servidor de producción.
- Guardar el script en `backend/sql/` para mantener el historial de migraciones.

---

## Convenciones de Código

### PHP (Backend)

- Usar **namespaces** según la estructura: `App\Backend\Controllers`, `App\Backend\Models`.
- Usar **PDO con prepared statements** para todas las queries. Nunca concatenar variables en SQL.
- Usar `error_log()` para registrar errores, no `echo` o `var_dump` en producción.
- Responder siempre con `sendJsonResponse(['key' => 'value'], statusCode)`.

### JavaScript (Frontend)

- Usar **`async/await`** para todas las llamadas a la API, nunca `.then()` anidados.
- Usar siempre la función `makeApiCall(url, method, body, isFormData)` en lugar de `fetch` directo.
- Usar `showSuccess()` / `showError()` de `wiki-kreative-feedback.js` para notificaciones al usuario. Nunca usar `alert()`.
- Usar `showConfirm()` para confirmaciones destructivas (eliminar, sobreescribir).

### HTML / CSS

- Mantener los `id` únicos y descriptivos (ej: `publicationTitle`, `tagsContainer`).
- No usar estilos `inline` para estados que pueden ser controlados con CSS.

---

## Cómo Agregar una Nueva Categoría

1. **Backend (sin cambios):** El campo `area` es un `VARCHAR` libre, no una enumeración.

2. **Frontend — modal de creación (`frontend/views/index.php`):**
   ```html
   <option value="nueva_categoria">Nueva Categoría</option>
   ```
   Agregar en ambos selects: el del modal de creación (`uploadCategory`) y el de edición (`editCategory`).

3. **Frontend — función de nombre (`frontend/public/js/index.js`):**
   ```javascript
   function getCategoryName(area) {
       const names = {
           // ... existentes ...
           'nueva_categoria': 'Nueva Categoría'  // ← agregar aquí
       };
       return names[area] || area;
   }
   ```

4. **Frontend — filtros de categoría:** Agregar el botón de filtro en el HTML de `index.php`.

---

## Cómo Agregar un Nuevo Campo a las Publicaciones

Ejemplo: agregar un campo `author` (autor).

1. **Base de datos:**
   ```sql
   ALTER TABLE `tutorials`
   ADD COLUMN `author` VARCHAR(200) NULL DEFAULT NULL AFTER `creator`;
   ```

2. **Model (`backend/app/Models/TutorialModel.php`):**
   - Agregar `:author` en el `INSERT` de `createTutorial()`.
   - Agregar `author = :author` en el `UPDATE` de `UpdateTutorial()`.
   - Agregar `':author' => $data['author'] ?? null` en ambos arrays `execute()`.

3. **Controller (`backend/app/Controllers/TutorialController.php`):**
   - El controlador pasa `$data` completo al modelo, generalmente no necesita cambios.

4. **Frontend — formulario (`frontend/views/index.php`):**
   ```html
   <div class="form-group">
       <label class="form-label">Autor</label>
       <input type="text" class="form-input" id="uploadAuthor">
   </div>
   ```

5. **Frontend — JS (`frontend/public/js/index.js`):**
   ```javascript
   // En submitUpload():
   formData.append('author', document.getElementById('uploadAuthor').value);
   
   // En openEditModal():
   document.getElementById('uploadAuthor').value = publication.author || '';
   
   // En submitEdit():
   formData.append('author', document.getElementById('editAuthor').value);
   ```

6. **Frontend — detalle (`frontend/views/detail.php` y `detail.js`):**
   - Agregar el elemento HTML donde se mostrará.
   - En `detail.js`, dentro de `loadPublicationDetails()`, asignar el valor al DOM.

---

## Historial de Migraciones

| Fecha | Script | Descripción |
|---|---|---|
| 2026-05 | `backend/sql/add_external_link_column.sql` | Agrega columna `external_link VARCHAR(2048)` a la tabla `tutorials` |

---

## Solución de Problemas Frecuentes

### "Los cambios no se ven en producción"

1. Confirmar que el archivo fue subido a la ruta correcta en cPanel (con estructura de carpetas).
2. Hacer **Ctrl + Shift + R** en el navegador para forzar recarga sin caché.
3. Verificar en las herramientas de desarrollador (F12 → Network) que el servidor está retornando el archivo nuevo y no una versión cacheada (revisar el encabezado `Last-Modified`).

### "Error 500 en el backend"

1. Revisar los logs de error de PHP en cPanel → Logs de errores.
2. Verificar que el `.env` está configurado correctamente con las credenciales de producción.
3. Verificar que las dependencias de Composer están instaladas (`vendor/` existe).

### "No puedo iniciar sesión"

1. Verificar que el usuario existe en la BD `alphadocere_auth_system` y tiene `status = 'active'`.
2. Verificar que el usuario tiene un rol asignado en `usuarios_roles_proyectos` con el `proyecto_id` correcto (valor en `WIKI_PROYECTO_ID`).
3. Verificar en la consola del navegador si la petición a `auth/login` retorna un error específico.

### "Los archivos adjuntos no se suben"

1. Verificar que la carpeta `public/uploads/files/` existe en el servidor.
2. Verificar que tiene permisos de escritura (755 o 775).
3. Verificar el límite de tamaño de archivos en la configuración de PHP del servidor (`upload_max_filesize`, `post_max_size`).

### "El video de YouTube no aparece en el detalle"

1. Verificar que el link de YouTube está directamente en el campo **Contenido** de la publicación (no en Descripción).
2. Verificar que el link tiene el formato estándar: `https://www.youtube.com/watch?v=ID` o `https://youtu.be/ID`.
3. Abrir la consola del navegador (F12) y revisar si hay errores de JavaScript en `detail.js`.
