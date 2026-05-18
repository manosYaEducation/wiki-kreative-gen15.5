// Detectamos la raíz del proyecto de forma dinámica
const PROJECT_ROOT = window.location.pathname.split('/frontend')[0];
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalhost ? window.location.origin + PROJECT_ROOT + '/backend/public' : '/backend';

// --- ROL DEL USUARIO (leído del JWT en cookie) ---
let currentUserRole = null;

function getUserRoleFromCookie() {
    const cookie = document.cookie.split(';').find(c => c.trim().startsWith('token='));
    if (!cookie) return null;
    try {
        const token = cookie.trim().split('=').slice(1).join('=');
        const base64Payload = token.split('.')[1];
        const payload = JSON.parse(atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/')));
        return payload?.data?.role ?? null;
    } catch (e) {
        return null;
    }
}
// --------------------------------------------------

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
        let imageUrl = PROJECT_ROOT + '/assets/img/kreativenofondo.png';
        if (publication.image && publication.image.trim() !== '') {
            const imageName = publication.image.split(/[\\/]/).pop();
            imageUrl = PROJECT_ROOT + `/public/uploads/${imageName}`;
        }
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
                // Mostrar solo el nombre del archivo
                const fileName = String(path).split('/').pop() || String(path);
                a.href = PROJECT_ROOT + `/public/uploads/files/${fileName}`;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
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
    // Prioridad: columna external_link → primera URL no-YouTube del content → primera URL no-YouTube de description
    let externalLinkValue = publication.external_link || publication.externalLink || '';

    if (!externalLinkValue) {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const sources = [publication.content, publication.description];
        for (const src of sources) {
            if (!src) continue;
            const matches = src.match(urlRegex);
            if (matches && matches.length > 0) {
                externalLinkValue = matches[0];
                break;
            }
        }
    }

    const externalLinkSection = document.getElementById('externalLinkSection');
    if (externalLinkSection && externalLinkValue) {
        externalLinkSection.style.display = 'block';
        const externalLink = document.getElementById('externalLink');
        const linkUrl = document.getElementById('linkUrl');
        if (externalLink && linkUrl) {
            externalLink.href = externalLinkValue;
            linkUrl.textContent = externalLinkValue;
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
            ? PROJECT_ROOT + '/assets/img/kreative_white_logo.png' 
            : PROJECT_ROOT + '/assets/img/kreativenofondo.png';
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
            ? PROJECT_ROOT + '/assets/img/kreative_white_logo.png' 
            : PROJECT_ROOT + '/assets/img/kreativenofondo.png';
        logo.alt = 'Wiki KREATIVE Logo';
    }

    // Update theme toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    });

    // Leer el rol del usuario desde el JWT
    currentUserRole = getUserRoleFromCookie();
    checkSessionStatus();

    // Fetch publication data
    fetchPublications();
});

function showError(message) {
    console.error('Error:', message);
}

// ========================
// NAVBAR — Menú de usuario (Sincronizado con index.js)
// ========================

const ROLE_ICONS = {
    'admin':       '👑',
    'admin_wiki':  '👑',
    'editor':      '✏️',
    'editor_wiki': '✏️',
    'lector':      '👤',
    'lector_wiki': '👤',
};

function buildUserDropdown(role) {
    const dropdown = document.getElementById('userDropdown');
    if (!dropdown) return;
    dropdown.innerHTML = '';

    const roleLower = (role || "").toLowerCase();
    if (roleLower.includes('admin') || roleLower.includes('editor')) {
        const adminItems = [
            { icon: 'fa-solid fa-table-columns', label: 'Dashboard',        url: 'enlace.php?destino=dashboard' },
            { icon: 'fa-brands fa-trello',       label: 'Workspace Trello', url: 'enlace.php?destino=trello' },
            { icon: 'fa-brands fa-wordpress',    label: 'WordPress',        url: 'enlace.php?destino=wordpress' },
        ];
        adminItems.forEach(item => {
            dropdown.innerHTML += `
                <a href="${item.url}" target="_blank" class="user-dropdown-item">
                    <i class="${item.icon}"></i> ${item.label}
                </a>`;
        });
        dropdown.innerHTML += `<div class="user-dropdown-divider"></div>`;
    }

    dropdown.innerHTML += `
        <div class="user-dropdown-divider"></div>
        <div class="user-dropdown-item logout-item" onclick="handleLogout()">
            <i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
        </div>`;
}

function checkSessionStatus() {
    const isLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true' ||
                       localStorage.getItem('userLoggedIn') === 'true' ||
                       sessionStorage.getItem('userId') ||
                       localStorage.getItem('userId');

    const role    = sessionStorage.getItem('userRole') || localStorage.getItem('userRole') || 'lector';
    const name    = sessionStorage.getItem('userName') || localStorage.getItem('userName') || 'Usuario';

    const loginBtn    = document.getElementById('loginBtn');
    const userTrigger = document.getElementById('userTrigger');
    const roleIcon    = document.getElementById('userRoleIcon');
    const nameDisplay = document.getElementById('userNameDisplay');

    if (isLoggedIn) {
        if (loginBtn)    loginBtn.style.display    = 'none';
        if (userTrigger) userTrigger.style.display = 'flex';
        if (roleIcon)    roleIcon.textContent       = ROLE_ICONS[role] || '👤';
        if (nameDisplay) nameDisplay.textContent    = name;
        buildUserDropdown(role);
    } else {
        if (loginBtn)    loginBtn.style.display    = 'flex';
        if (userTrigger) userTrigger.style.display = 'none';
    }
}

function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    const trigger  = document.getElementById('userTrigger');
    if (!dropdown) return;
    dropdown.classList.toggle('show');
    trigger?.classList.toggle('open');
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.user-menu')) {
        document.getElementById('userDropdown')?.classList.remove('show');
        document.getElementById('userTrigger')?.classList.remove('open');
    }
});

function toggleMobileMenu() {
    document.getElementById('mobileMenu')?.classList.toggle('open');
    document.getElementById('hamburger')?.classList.toggle('open');
}

function handleLogout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    sessionStorage.clear();
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    window.location.href = PROJECT_ROOT + '/frontend/index.php';
}

