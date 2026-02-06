//const API_BASE_URL = '/backend/public';
//verifica si el proyecto esta en Local o Subido

let BASE_PATH = window.location.origin;
if (window.location.pathname.startsWith('/wiki-kreative')) {
    BASE_PATH='/wiki-kreative-gen15.5/backend/public';
} else {
    BASE_PATH='/backend';
}
const API_BASE_URL = BASE_PATH;

// Reusable API call function with improved error handling
async function makeApiCall(url, method = 'GET', body = null, includeFiles = false) {
    const headers = {
        'Accept': 'application/json',
    };
    const options = { method, headers };

    if (body) {
        if (includeFiles) {
            options.body = body;
        } else {
            headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${url}`, options);
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Respuesta del servidor no es JSON');
        }
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `Error del servidor: ${response.status}`);
        }
        return data;
    } catch (error) {
        console.error('API call error:', error);
        showError(error.message || 'Error en la comunicación con el servidor');
        throw error;
    }
}

let publication = null;

// Fetch publication by ID
async function fetchPublications() {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        
        if (!id) {
            throw new Error('ID de publicación no proporcionado');
        }

        publication = await makeApiCall(`tutorial/get?id=${id}`);
        // Validate publication data
        if (!publication) {
            throw new Error('No se encontró la publicación');
        }
        
        // Load details after successful fetch
        loadPublicationDetails();
    } catch (error) {
        console.error('Error fetching publications:', error);
        showError('Error al cargar las publicaciones');
    }
}

// Load publication details into DOM
function loadPublicationDetails() {
    // Exit early if no publication data
    if (!publication) {
        console.error('No publication data available');
        showError('No hay datos de publicación disponibles');
        return;
    }

    // Set image
    const imageElement = document.getElementById('publicationImage');
    if (imageElement) {
        const basePath = window.location.pathname.startsWith('/wiki-kreative')
            ? '/wiki-kreative-gen15.5'
            : '';
        const imageUrl = publication.image || `${basePath}/assets/img/kreativenofondo.png`;
        imageElement.style.backgroundImage = `url('${imageUrl}')`;
        imageElement.style.backgroundSize = 'cover';
        imageElement.style.backgroundPosition = 'center';
    }

    // Set category
    const categoryElement = document.getElementById('publicationCategory');
    if (categoryElement) {
        categoryElement.textContent = publication.area || 'Sin categoría';
    }

    // Set date with error handling
    const dateElement = document.getElementById('publicationDate');
    if (dateElement) {
        try {
            const date = new Date(publication.created_at);
            dateElement.textContent = isNaN(date.getTime()) 
                ? 'Fecha no disponible'
                : date.toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
        } catch {
            dateElement.textContent = 'Fecha no disponible';
        }
    }

    // Set title
    const titleElement = document.getElementById('publicationTitle');
    if (titleElement) {
        titleElement.textContent = publication.title || 'Sin título';
    }

   

    // Set description
    const descriptionElement = document.getElementById('publicationDescription');
    if (descriptionElement) {
        const description = publication.description || 'Sin descripción';
        descriptionElement.innerHTML = linkverify(description);//verifica si hay links y los convierte en enlaces clickeables
    }


    // Set content
    const contentElement = document.getElementById('content-section');
    if (contentElement) {
        const content = publication.content || 'Sin contenido';
        contentElement.innerHTML = linkverify(content);//verifica si hay links y los convierte en enlaces clickeables
       
    }

   
    //Sección de videos de YouTube 
    const youtubeVideos = new Set();
    // Extraer videos de descripción y contenido
    if (publication.description) {
        extractYouTubeVideos(publication.description).forEach(id => youtubeVideos.add(id));
    }
    if (publication.content) {
        extractYouTubeVideos(publication.content).forEach(id => youtubeVideos.add(id));
    }
    
    // Mostrar videos si hay
    if (youtubeVideos.size > 0) {
        const videosSection = document.createElement('div');
        videosSection.className = 'videos-section';
        videosSection.innerHTML = '<h2>Sección de Videos</h2><div class="videos-container" id="videosContainer"></div>';
        
        const videosContainer = videosSection.querySelector('#videosContainer');
        youtubeVideos.forEach(videoId => {
            const iframe = document.createElement('iframe');
            iframe.width = '100%';
            iframe.height = '400';
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            iframe.frameborder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            
            const videoWrapper = document.createElement('div');
            videoWrapper.className = 'video-item';
            videoWrapper.appendChild(iframe);
            videosContainer.appendChild(videoWrapper);
        });
        
        // Insertar antes de las etiquetas
            const publicationContent = document.querySelector('.publication-content');
            if (publicationContent) {
                publicationContent.appendChild(videosSection);
            }
    }

    // Load tags
    const tagsContainer = document.getElementById('tagsContainer');
    if (tagsContainer) {
        let tags = publication.tags;
        // Si es string, intenta parsearlo
        if (typeof tags === 'string') {
            try {
                tags = JSON.parse(tags);
            }
            catch (e) {
                console.error('Error al parsear tags:', e);
                tags = [];
            }
        }

        tagsContainer.innerHTML = Array.isArray(tags) && tags.length > 0
            ? tags.map(tag => `<div class="tag">${tag}</div>`).join('')
            : '<div class="tag">Sin etiquetas</div>';
    }

    // ============================================================
    // [NUEVO] ADJUNTOS: mostrar links desde publication.files (JSON)
    // ============================================================

    const attachmentsSection = document.getElementById('attachmentsSection');
    const attachmentsList = document.getElementById('attachmentsList'); 

    let files = [];
    try {
        if (publication.files) {
            files = (typeof publication.files === 'string')
                ? JSON.parse(publication.files)
                : publication.files; // 
        }
    } catch (e) {
        console.error('Error al parsear publication.files:', e);
        files = [];
    }

    // Mostrar/ocultar sección
    if (attachmentsSection) {
        attachmentsSection.style.display = (Array.isArray(files) && files.length > 0) ? 'block' : 'none';
    }

    // Renderizar links
    if (attachmentsList) {
        attachmentsList.innerHTML = '';

        if (Array.isArray(files) && files.length > 0) {
            files.forEach((path) => {
                const a = document.createElement('a');
                a.href = path;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';

                // Mostrar solo el nombre del archivo (mantiene el mismo comportamiento al hacer clic)
                const fileName = String(path).split('/').pop() || String(path);
                a.textContent = fileName;

                const row = document.createElement('div'); // o <li> si usas <ul>
                row.className = 'attachment-item'; // opcional, para CSS
                row.appendChild(a);

                attachmentsList.appendChild(row);
            });
        } else {
            // (sin cambios) si no hay archivos, no renderiza nada
        }
    }
    
    // ============================================================

    // Handle external link section
    const externalLinkSection = document.getElementById('externalLinkSection');
    if (externalLinkSection && publication.externalLink) {
        externalLinkSection.style.display = 'block';
        const externalLink = document.getElementById('externalLink');
        const linkUrl = document.getElementById('linkUrl');
        if (externalLink && linkUrl) {
            externalLink.href = publication.externalLink;
            linkUrl.textContent = publication.externalLink;
        }
    }

    // Update page title with fallback
    document.title = publication.title 
        ? `${publication.title} - Wiki KREATIVE`
        : 'Publicación - Wiki KREATIVE';
}

// Extrae el ID de video de YouTube de una URL
function getYouTubeVideoId(url) {
    const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
}

// Verifica si una URL es de YouTube
function isYouTubeUrl(url) {
    return /(?:youtube\.com|youtu\.be)/.test(url);
}

// Extrae todos los videos de YouTube del texto
function extractYouTubeVideos(text) {
    if (!text) return [];
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const videos = [];
    let match;
    while ((match = urlRegex.exec(text)) !== null) {
        const url = match[0];
        if (isYouTubeUrl(url)) {
            const videoId = getYouTubeVideoId(url);
            if (videoId) videos.push(videoId);
        }
    }
    return videos;
}

//verifica si hay un link en el texto y lo convierte en un enlace clickeable
function linkverify(text) {
    if (!text) return '';
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, url => {
        // No mostrar links de YouTube como texto, se mostrarán embebidos al final
        if (isYouTubeUrl(url)) {
            return '';
        }
        const maxLength = 35;
        const displayUrl = url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
        return `<a href="${url}" target="_blank" rel="noopener noreferrer">${displayUrl}</a>`;
    });
}




// Theme toggle function
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    
    // Update logo
    const logo = document.querySelector('.icon');
    if (logo) {
        logo.src = isDarkMode 
            ? '../assets/img/kreative_white_logo.png' 
            : '../assets/img/kreativenofondo.png';
        logo.alt = 'Wiki KREATIVE Logo';
    }

    // Update theme toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.textContent = isDarkMode ? '☀️' : '🌙';
    });

    // Save theme preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Set initial theme
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');

    // Update logo based on initial theme
    const logo = document.querySelector('.icon');
    if (logo) {
        logo.src = currentTheme === 'dark' 
            ? '../assets/img/kreative_white_logo.png' 
            : '../assets/img/kreativenofondo.png';
        logo.alt = 'Wiki KREATIVE Logo';
    }

    // Update theme toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    });

    // Fetch publication data
    fetchPublications();
});

function showError(message) {
    console.error('Error:', message);
}
