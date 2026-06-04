# 06 — Autenticación y Roles

## Resumen del Sistema de Autenticación

La Wiki KREATIVE **no tiene un sistema propio de usuarios**. Se conecta al **Sistema Auth central de Alpha Docere** (`alphadocere_auth_system`) para validar credenciales y obtener el rol del usuario en el proyecto Wiki.

---

## Flujo de Login

```
1. Usuario ingresa email + contraseña en /frontend/login.html
2. login.js hace POST auth/login con los datos
3. AuthController (backend) conecta a alphadocere_auth_system
4. Busca el usuario por email en la tabla `clients`
5. Verifica la contraseña con password_verify() (bcrypt)
6. Verifica que la cuenta esté activa (status = 'active')
7. Busca el rol del usuario en la tabla `usuarios_roles_proyectos`
   donde proyecto_id = WIKI_PROYECTO_ID (por defecto: 3)
8. Si no tiene rol en la Wiki → acceso denegado (403)
9. Si tiene rol → genera un token JWT con id, nombre, email y rol
10. El token se guarda como cookie 'token' y se retorna en la respuesta
11. El frontend guarda también en localStorage y redirige al inicio
```

---

## Token JWT

### Estructura del payload

```json
{
  "iat": 1716000000,
  "exp": 1716003600,
  "data": {
    "id": 42,
    "username": "Vicente Sagredo",
    "email": "vsagredo@example.com",
    "role": "editor"
  }
}
```

| Campo | Descripción |
|---|---|
| `iat` | Timestamp de emisión del token |
| `exp` | Timestamp de expiración (iat + 3600 segundos por defecto) |
| `data.id` | ID del usuario en la tabla `clients` |
| `data.username` | Nombre completo del usuario |
| `data.email` | Correo electrónico |
| `data.role` | Rol del usuario en la Wiki |

### Configuración del token

| Variable `.env` | Descripción | Por defecto |
|---|---|---|
| `JWT_SECRET` | Llave secreta para firmar el token | `WikiSecretKey_Gen15_Version2_2026_Secure` |
| `JWT_EXPIRY` | Duración en segundos | `3600` (1 hora) |

> ⚠️ **Seguridad:** La `JWT_SECRET` debe ser la misma en todos los entornos (dev y prod). No cambiarla entre despliegues o todos los tokens existentes quedarán inválidos.

---

## Control de Acceso por Rol

### En el Backend

El `Router.php` verifica el JWT y el rol del usuario antes de ejecutar los controladores de rutas protegidas.

Si el rol del usuario **no está en la lista de roles permitidos** para la ruta, el servidor responde con `403 Forbidden`.

| Ruta | Roles requeridos |
|---|---|
| `GET tutorial/get` | Público (sin token) |
| `GET tutorial/getAll` | Público (sin token) |
| `POST tutorial/create` | `admin`, `editor`, `admin_wiki`, `editor_wiki` |
| `POST tutorial/update` | `admin`, `editor`, `admin_wiki`, `editor_wiki` |
| `POST tutorial/delete` | `admin`, `editor`, `admin_wiki`, `editor_wiki` |
| `POST auth/login` | Público (sin token) |
| `POST auth/logout` | Cualquier usuario autenticado |

### En el Frontend

El script `verifyloguin.js` lee la cookie `token` y expone la variable global `currentUserRole`.

En `index.js`, la función `createPublicationCard()` usa este rol para decidir si muestra o no el menú de edición/eliminación en cada tarjeta:

```javascript
const role = (currentUserRole || "").toLowerCase();
const canEdit = role.includes('admin') || role.includes('editor');
```

Si `canEdit` es `false`, el menú de tres puntos (⋮) no se renderiza en ninguna tarjeta.

---

## Logout

Al cerrar sesión:
1. El frontend llama a `POST auth/logout` (opcional).
2. El servidor elimina la cookie `token` sobrescribiéndola con fecha de expiración pasada.
3. El frontend elimina el token de `localStorage` y redirige a la página de login.

---

## Recuperación de Contraseña

La página `forgot-password.html` y su script `forgot-password.js` proveen el flujo de recuperación. Este flujo depende del Sistema Auth central y no es gestionado directamente por la Wiki.

---

## WIKI_PROYECTO_ID

El `WIKI_PROYECTO_ID` define qué proyecto dentro del Sistema Auth corresponde a esta Wiki. Se configura en el `.env`:

```
WIKI_PROYECTO_ID=3
```

Si el `proyecto_id` de la Wiki en la BD Auth no es `3`, se debe actualizar este valor en el `.env` de producción. Consultar con el líder del equipo si hay dudas.
