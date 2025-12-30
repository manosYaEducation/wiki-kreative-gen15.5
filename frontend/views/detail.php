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
<body class="detail-page">
    <?php require_once("components/header.php"); ?>
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


    <!-- Main Content -->
    <main class="main-content">
        <!-- Publication Header -->
        <div class="publication-header">
            <div class="publication-image" id="publicationImage">
                <!-- Image will be loaded by JavaScript -->
            </div>
            <div class="publication-meta">
                <div class="publication-category" id="publicationCategory">
                    <!-- Category will be loaded by JavaScript -->
                </div>
                <div class="publication-date" id="publicationDate">
                    <!-- Date will be loaded by JavaScript -->
                </div>
            </div>
            <h1 class="publication-title" id="publicationTitle">
                <!-- Title will be loaded by JavaScript -->
            </h1>
            <p class="publication-description" id="publicationDescription">
                <!-- Description will be loaded by JavaScript -->
            </p>
        </div>

        <!-- Publication Content -->
        <div class="publication-content">
            <div class="content-section" id="content-section">
                <h2>Contenido Principal</h2>
        </div>

        <!-- Tags Section -->
        <div class="tags-section">
            <h2 class="tags-title">Etiquetas</h2>
            <div class="tags-container" id="tagsContainer">
                <!-- Tags will be loaded by JavaScript -->
            </div>
        </div>

        <!-- Attachments Section -->
        <div class="attachments-section" id="attachmentsSection" style="display: none;">
            <h2 class="attachments-title">Archivos Adjuntos</h2>
            <div class="attachment-item">
                <div class="attachment-icon">📄</div>
                <div class="attachment-info">
                    <div class="attachment-name">Documento de referencia.pdf</div>
                    <div class="attachment-size">2.5 MB</div>
                </div>
                <a href="#" class="download-btn">Descargar</a>
            </div>
            <div class="attachment-item">
                <div class="attachment-icon">💾</div>
                <div class="attachment-info">
                    <div class="attachment-name">Código fuente.zip</div>
                    <div class="attachment-size">1.2 MB</div>
                </div>
                <a href="#" class="download-btn">Descargar</a>
            </div>
        </div>

        <!-- External Link Section -->
        <div class="external-link" id="externalLinkSection" style="display: none;">
            <h2 class="link-title">Enlaces Relacionados</h2>
            <a href="#" class="link-item" id="externalLink">
                <div class="link-icon">🔗</div>
                <div class="link-info">
                    <div class="link-name">Recurso externo</div>
                    <div class="link-url" id="linkUrl"><!-- URL will be loaded by JavaScript --></div>
                </div>
            </a>
        </div>
    </main>

	<script src="public/js/detail.js"></script>
</body>
</html>