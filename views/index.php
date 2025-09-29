<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin Equipo Profesional Gen10 Alpha Docere</title>
    <link rel="icon" href="../assets/img/letra-k (1).png" type="image/x-icon">
    <link href="../frontend/css/admin/index-admin.css" rel="stylesheet" />
    <link rel="stylesheet" href="public/css/admin/index-admin.css">
	<link rel="stylesheet" href="public/css/wiki-kreative/wiki-kreative.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="icon" href="./assets/img/letra-k (1).png" type="image/x-icon">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
        rel="stylesheet">
</head>
<body>
    <header class="header">
        <nav>
            <div class="nav-left">
                <a href="index" class="back-to-site">
                    <i class="fas fa-arrow-left"></i> Volver al sitio
                </a>
                <img src="../assets/img/kreativenofondo.png" alt="Icono" class="icon">
            </div>
            <div class="navbar" id="navbar">
                <ul class="headernav">
                    <li><a class="button-53" href="../frontend/ordenes-servicios.html">Ordenes Servicios</a></li>
                    <li><a class="button-53" href="../frontend/proyectos-admin.html">Proyectos</a></li>
                    <li><a class="button-53" href="../frontend/index-admin.html">Panel de Administración</a></li>
                </ul>
            </div>
            <div class="hamburger" id="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
		<button class="theme-toggle" onclick="toggleTheme()">🌙</button>
    </header>
    <section class="ambientes-section" id="enlaces">
       
            <div class="enlaces">
                <ul class="link-buttons">
                    <li><a class="button-social" href="enlace.php?destino=discord" target="_blank"><i class="fab fa-discord"></i> Discord</a></li>
                    <li><a class="button-social" href="enlace.php?destino=dashboard" target="_blank"><i class="fa-solid fa-table"></i> Dashboard</a></li>
                    <li><a class="button-social" href="enlace.php?destino=trello" target="_blank"><i class="fa-brands fa-trello"></i> Workspace Trello</a></li>
                    <li><a class="button-social" href="enlace.php?destino=whatsapp" target="_blank"><i class="fa-brands fa-whatsapp"></i> Whatsapp</a></li>
                    <li><a class="button-social" href="enlace.php?destino=wordpress" target="_blank"><i class="fa-brands fa-wordpress"></i> Wordpress</a></li>
                    <li><a class="button-social" href="enlace.php?destino=tienda" target="_blank"><i class="fa-solid fa-shop"></i> Tienda</a></li>
                </ul>
            </div>
    </section>

    <section class="search-section">
        <div class="search-container">
            <input type="text" class="search-input" placeholder="Buscar publicaciones..." id="searchInput">
            <button class="search-button" onclick="performSearch()">🔍</button>
        </div>
    </section>

    <main class="main-content">
        <aside class="sidebar">
            <div class="filter-section">
                <div class="filter-header">Filtrar por área</div>
                <div class="filter-item active" onclick="filterByCategory('todas')">Todas las áreas</div>
                <div class="filter-item" onclick="filterByCategory('programacion')">Programación</div>
                <div class="filter-item" onclick="filterByCategory('diseño')">Diseño</div>
                <div class="filter-item" onclick="filterByCategory('gastronomia')">Gastronomía</div>
                <div class="filter-item" onclick="filterByCategory('tutorial')">Tutorial</div>
                <div class="filter-item" onclick="filterByCategory('marketing')">Marketing</div>
            </div>

            <div class="tags-section">
                <div class="tags-header">Etiquetas</div>
                <div class="tags-container" id="tagsContainer">
                     Tags will be populated dynamically 
                </div>
            </div>
        </aside>

        <div class="content-area">
            <div class="content-header">
                <h1 style="font-size: 28px; font-weight: 700; color: #1f2937;">Wiki KREATIVE</h1>
       
                <button class="upload-button" onclick="openUploadModal()">
                    <span>📝</span>
                    Subir Publicación
                </button>
            </div>
            
            <div class="card-grid" id="cardGrid">
                 Cards will be populated by JavaScript 
            </div>

            <div class="pagination">
                <button class="pagination-button" onclick="previousPage()" id="prevBtn">← Anterior</button>
                <div class="pagination-numbers" id="paginationNumbers">
                     Page numbers will be populated dynamically 
                </div>
                <button class="pagination-button" onclick="nextPage()" id="nextBtn">Siguiente →</button>
            </div>
        </div>
    </main>

    <div id="uploadModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Subir Nueva Publicación</h2>
                <button class="close-button" onclick="closeUploadModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="uploadForm">
                    <div class="form-group">
                        <label class="form-label">Título *</label>
                        <input type="text" class="form-input" id="uploadTitle" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Imagen de portada</label>
                        <div class="image-upload-area" onclick="document.getElementById('uploadImage').click()">
                            <div class="upload-icon">📷</div>
                            <div class="upload-text">Haz clic para subir una imagen</div>
                            <div class="upload-subtext">O arrastra y suelta aquí</div>
                            <input type="file" id="uploadImage" accept="image/*" style="display: none;">
                            <img id="uploadImagePreview" class="image-preview" style="display: none;">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Descripción *</label>
                        <textarea class="form-textarea" id="uploadDescription" required></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Área *</label>
                        <select class="form-select" id="uploadCategory" required>
                            <option value="">Selecciona un área</option>
                            <option value="programacion">Programación</option>
                            <option value="diseño">Diseño</option>
                            <option value="gastronomia">Gastronomía</option>
                            <option value="tutorial">Tutorial</option>
                            <option value="marketing">Marketing</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Etiquetas</label>
                        <div class="tags-input-container" onclick="document.getElementById('uploadTagInput').focus()">
                            <div id="uploadTagsDisplay"></div>
                            <input type="text" class="tag-input" id="uploadTagInput" placeholder="Agregar etiqueta...">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Archivo adjunto</label>
                        <input type="file" class="form-input" id="uploadFile">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Enlace externo</label>
                        <input type="url" class="form-input" id="uploadLink" placeholder="https://...">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeUploadModal()">Cancelar</button>
                <button type="button" class="btn btn-primary" onclick="submitUpload()">Publicar</button>
            </div>
        </div>
    </div>

    <div id="editModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Editar Publicación</h2>
                <button class="close-button" onclick="closeEditModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="editForm">
                    <div class="form-group">
                        <label class="form-label">Título *</label>
                        <input type="text" class="form-input" id="editTitle" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Imagen de portada</label>
                        <div class="image-upload-area" onclick="document.getElementById('editImage').click()">
                            <div class="upload-icon">📷</div>
                            <div class="upload-text">Haz clic para cambiar imagen</div>
                            <div class="upload-subtext">O arrastra y suelta aquí</div>
                            <input type="file" id="editImage" accept="image/*" style="display: none;">
                            <img id="editImagePreview" class="image-preview" style="display: none;">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Descripción *</label>
                        <textarea class="form-textarea" id="editDescription" required></textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Área *</label>
                        <select class="form-select" id="editCategory" required>
                            <option value="">Selecciona un área</option>
                            <option value="programacion">Programación</option>
                            <option value="diseño">Diseño</option>
                            <option value="gastronomia">Gastronomía</option>
                            <option value="tutorial">Tutorial</option>
                            <option value="marketing">Marketing</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Etiquetas</label>
                        <div class="tags-input-container" onclick="document.getElementById('editTagInput').focus()">
                            <div id="editTagsDisplay"></div>
                            <input type="text" class="tag-input" id="editTagInput" placeholder="Agregar etiqueta...">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Archivo adjunto (opcional)</label>
                        <input type="file" class="form-input" id="editFile">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Enlace externo (opcional)</label>
                        <input type="url" class="form-input" id="editLink" placeholder="https://...">
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancelar</button>
                <button type="button" class="btn btn-primary" onclick="submitEdit()">Guardar Cambios</button>
            </div>
        </div>
    </div>
	<script src="public/js/index.js"></script>
</body>
</html>
