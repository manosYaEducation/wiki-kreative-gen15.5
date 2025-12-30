const API_BASE_URL = '/wiki-kreative-gen15.5/backend/public';

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
        imageElement.src = publication.image || 'path/to/placeholder-image.png';
        imageElement.alt = publication.title || 'Publication image';
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
        descriptionElement.textContent = publication.description || 'Sin descripción';
    }

    // Set content
    const contentElement = document.getElementById('content-section');
    if (contentElement) {
        contentElement.textContent = publication.content || 'Sin contenido';
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
    // Handle attachments section
    const attachmentsSection = document.getElementById('attachmentsSection');
    if (attachmentsSection) {
        attachmentsSection.style.display = publication.hasAttachments ? 'block' : 'none';
    }

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