# 09 — Diagramas del Sistema

Colección de diagramas técnicos y de flujo del proyecto **Wiki KREATIVE Gen 15.5**.

---

## 1. Diagrama de Arquitectura General

Vista general de las capas del sistema y cómo se comunican entre sí.

```mermaid
graph TB
    subgraph Cliente["🌐 Navegador (Cliente)"]
        B[login.html]
        C[index.php - Listado]
        D[detail.php - Detalle]
        E[verifyloguin.js]
        F[wiki-kreative-feedback.js]
    end

    subgraph FrontendServer["⚙️ Frontend Server - Apache"]
        G[frontend/index.php]
        H[frontend/Router.php]
        I[frontend/routes.php]
    end

    subgraph BackendAPI["🔧 Backend API - Apache + PHP"]
        J[backend/public/index.php]
        K[backend/app/Router.php]
        L[AuthController.php]
        M[TutorialController.php]
        N[TutorialModel.php]
        O[Database.php - PDO Singleton]
    end

    subgraph Databases["🗄️ Bases de Datos - MySQL"]
        P[(alphadocere_wiki)]
        Q[(alphadocere_auth_system)]
    end

    subgraph Storage["📁 Almacenamiento"]
        R[public/uploads/]
    end

    Cliente -->|"HTTP Request"| FrontendServer
    FrontendServer --> G --> H --> I
    Cliente -->|"fetch / XHR a /api/"| BackendAPI
    J --> K --> L
    K --> M --> N --> O
    O --> P
    L --> O
    O --> Q
    M -->|"Subida de archivos"| R
```

---

## 2. Diagrama Entidad-Relación (Base de Datos)

```mermaid
erDiagram
    TUTORIALS {
        int id PK
        varchar title
        text description
        longtext content
        varchar image
        varchar area
        json tags
        json files
        varchar external_link
        varchar lastEditor
        varchar creator
        timestamp created_at
        timestamp updated_at
    }

    CLIENTS {
        int id PK
        varchar email
        varchar password
        varchar nombre
        varchar status
    }

    ROLES {
        int id_rol PK
        varchar nombre_rol
    }

    USUARIOS_ROLES_PROYECTOS {
        int usuario_id FK
        int rol_id FK
        int proyecto_id
    }

    PROYECTOS {
        int id PK
        varchar nombre
    }

    CLIENTS ||--o{ USUARIOS_ROLES_PROYECTOS : "tiene roles en"
    ROLES ||--o{ USUARIOS_ROLES_PROYECTOS : "asignado a"
    PROYECTOS ||--o{ USUARIOS_ROLES_PROYECTOS : "contiene"
    CLIENTS ||--o{ TUTORIALS : "crea/edita"
```

> **Nota:** Las tablas `CLIENTS`, `ROLES`, `USUARIOS_ROLES_PROYECTOS` y `PROYECTOS` pertenecen a la BD `alphadocere_auth_system`. La tabla `TUTORIALS` pertenece a la BD `alphadocere_wiki`.

---

## 3. Diagrama de Flujo — Autenticación (Login)

```mermaid
sequenceDiagram
    actor Usuario
    participant Browser as Navegador
    participant Auth as AuthController (PHP)
    participant AuthDB as alphadocere_auth_system
    participant Wiki as alphadocere_wiki

    Usuario->>Browser: Ingresa email + contraseña
    Browser->>Auth: POST /api/auth/login
    Auth->>AuthDB: SELECT id, email, password, nombre, status WHERE email = ?
    AuthDB-->>Auth: Datos del usuario

    alt Usuario no encontrado
        Auth-->>Browser: 401 Credenciales incorrectas
    else Contraseña incorrecta
        Auth-->>Browser: 401 Credenciales incorrectas
    else Cuenta inactiva
        Auth-->>Browser: 403 Cuenta no activa
    else OK
        Auth->>AuthDB: SELECT rol WHERE usuario_id = ? AND proyecto_id = WIKI_ID
        AuthDB-->>Auth: Rol del usuario

        alt Sin rol en la Wiki
            Auth-->>Browser: 403 Sin acceso a la Wiki
        else Con rol asignado
            Auth->>Auth: Genera token JWT firmado con JWT_SECRET
            Auth-->>Browser: 200 token + datos usuario
            Browser->>Browser: Guarda cookie 'token'
            Browser->>Browser: Redirige a /frontend/
        end
    end
```

---

## 4. Diagrama de Flujo — Crear Publicación

```mermaid
sequenceDiagram
    actor Editor
    participant Browser as Navegador (index.js)
    participant Middleware as Router + JWT Middleware
    participant Controller as TutorialController
    participant Model as TutorialModel
    participant DB as alphadocere_wiki
    participant FS as Servidor de Archivos

    Editor->>Browser: Completa formulario y hace clic en "Publicar"
    Browser->>Browser: Valida campos obligatorios (título, desc, área, contenido)
    Browser->>Middleware: POST /api/tutorial/create (FormData + Cookie token)
    Middleware->>Middleware: Decodifica JWT, verifica rol (admin/editor)

    alt Token inválido o rol no permitido
        Middleware-->>Browser: 401 / 403
    else Autorizado
        Middleware->>Controller: createTutorial()
        opt Hay imagen
            Controller->>FS: Mueve imagen a public/uploads/
            FS-->>Controller: Ruta de la imagen
        end
        opt Hay archivos adjuntos
            Controller->>FS: Mueve archivos a public/uploads/files/
            FS-->>Controller: Rutas de los archivos
        end
        Controller->>Model: createTutorial($data)
        Model->>DB: INSERT INTO tutorials (...)
        DB-->>Model: OK / Error
        Model-->>Controller: true / false
        alt Error en INSERT
            Controller->>FS: Elimina archivos subidos (rollback)
            Controller-->>Browser: 500 Error
        else Éxito
            Controller-->>Browser: 200 Tutorial created successfully
            Browser->>Browser: Cierra modal, recarga listado
        end
    end
```

---

## 5. Diagrama de Flujo — Ver Detalle de Publicación

```mermaid
sequenceDiagram
    actor Visitante
    participant Browser as Navegador (detail.js)
    participant API as Backend API
    participant DB as alphadocere_wiki

    Visitante->>Browser: Navega a /frontend/detail?id=79
    Browser->>Browser: Lee parámetro ?id= de la URL
    Browser->>API: GET /api/tutorial/get?id=79
    API->>DB: SELECT * FROM tutorials WHERE id = 79
    DB-->>API: Datos de la publicación
    API-->>Browser: JSON con la publicación

    Browser->>Browser: Rellena DOM (título, descripción, imagen, categoría, fecha)
    Browser->>Browser: linkverify(content) → convierte URLs en enlaces clicables
    Browser->>Browser: extractYouTubeVideos(content) → incrusta iframe de YouTube
    Browser->>Browser: Renderiza tags como pills
    opt Hay archivos adjuntos
        Browser->>Browser: Renderiza lista de archivos descargables
    end
    opt Hay enlace externo o URL en el contenido
        Browser->>Browser: Muestra tarjeta "Enlace Relacionado"
    end
```

---

## 6. Diagrama de Componentes Frontend

```mermaid
graph LR
    subgraph Páginas["📄 Páginas"]
        A[index.php\nListado]
        B[detail.php\nDetalle]
        C[login.html]
    end

    subgraph Scripts["📜 Scripts JavaScript"]
        D[index.js]
        E[detail.js]
        F[login.js]
        G[verifyloguin.js]
        H[wiki-kreative-feedback.js]
    end

    subgraph Componentes["🧩 Componentes PHP"]
        I[header.php]
        J[footer-index.php]
        K[footer.php]
    end

    A -->|"usa"| D
    A -->|"usa"| G
    A -->|"usa"| H
    A -->|"incluye"| I
    A -->|"incluye"| J

    B -->|"usa"| E
    B -->|"incluye"| I
    B -->|"incluye"| K

    C -->|"usa"| F

    D -->|"importa"| H
    E -->|"llama API"| API[(API Backend)]
    D -->|"llama API"| API
    F -->|"llama API"| API
```

---

## 7. Diagrama de Roles y Permisos

```mermaid
graph TD
    subgraph Roles["👥 Roles"]
        A[admin / admin_wiki]
        B[editor / editor_wiki]
        C[viewer / cualquier otro]
        D[Sin sesión / No logueado]
    end

    subgraph Permisos["🔐 Permisos"]
        P1[✅ Ver publicaciones]
        P2[✅ Ver detalle completo]
        P3[✅ Crear publicaciones]
        P4[✅ Editar publicaciones]
        P5[✅ Eliminar publicaciones]
        P6[❌ Sin acceso a formularios]
    end

    A --> P1
    A --> P2
    A --> P3
    A --> P4
    A --> P5

    B --> P1
    B --> P2
    B --> P3
    B --> P4

    C --> P1
    C --> P2
    C --> P6

    D -->|"Redirige a login"| Login[🔑 login.html]
```

---

## 8. Diagrama de Despliegue

```mermaid
graph TB
    subgraph Local["💻 Entorno Local (Desarrollador)"]
        L1[XAMPP - Apache + PHP]
        L2[MySQL Local]
        L3[Carpeta htdocs/wiki-kreative-gen15.5/]
    end

    subgraph Produccion["🌐 Producción (cPanel - wiki.alphadocere.cl)"]
        P1[Apache + PHP]
        P2[(MySQL - alphadocere_wiki)]
        P3[(MySQL - alphadocere_auth_system)]
        P4[public/uploads/]
    end

    subgraph DeployProcess["📦 Proceso de Despliegue"]
        D1[Modificar archivos en local]
        D2[Probar en localhost]
        D3[Crear ZIP con estructura de carpetas]
        D4[Subir ZIP a cPanel File Manager]
        D5[Extract en cPanel]
        D6[Ctrl+Shift+R en el navegador]
    end

    Local -->|"tar / zip"| DeployProcess
    DeployProcess -->|"FTP / cPanel"| Produccion

    L1 --- L2
    L1 --- L3

    P1 --- P2
    P1 --- P3
    P1 --- P4

    D1 --> D2 --> D3 --> D4 --> D5 --> D6
```

---

## 9. Diagrama de Secuencia — Eliminar Publicación

```mermaid
sequenceDiagram
    actor Admin
    participant Browser as Navegador (index.js)
    participant API as Backend API
    participant FS as Sistema de Archivos
    participant DB as alphadocere_wiki

    Admin->>Browser: Clic en "Eliminar" en el menú de la tarjeta
    Browser->>Browser: showConfirm("¿Estás seguro?")

    alt Usuario cancela
        Browser->>Browser: Cancela, no hace nada
    else Usuario confirma
        Browser->>API: POST /api/tutorial/delete {id: 79}
        API->>API: Verifica JWT y rol (admin/editor)
        API->>DB: SELECT * FROM tutorials WHERE id = 79
        DB-->>API: Datos de la publicación (imagen, archivos)

        opt Tiene imagen
            API->>FS: unlink(public/uploads/img_*.jpg)
        end
        opt Tiene archivos adjuntos
            API->>FS: unlink(public/uploads/files/*)
        end

        API->>DB: DELETE FROM tutorials WHERE id = 79
        DB-->>API: OK
        API-->>Browser: 200 Tutorial deleted successfully
        Browser->>Browser: showSuccess("Tutorial eliminado")
        Browser->>Browser: Recarga el listado de publicaciones
    end
```
