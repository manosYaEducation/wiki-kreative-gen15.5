// Detectamos la raíz del proyecto de forma dinámica
// Si estamos en un subdominio que apunta a la raíz, window.location.pathname.split('/frontend')[0] será vacío
const PROJECT_ROOT = window.location.pathname.split('/frontend')[0];
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocalhost ? window.location.origin + PROJECT_ROOT + '/backend/public' : '/backend';

// --- ROL DEL USUARIO (leído del JWT en cookie) ---
let currentUserRole = null;

/**
 * Decodifica el payload del token JWT de la cookie 'token'
 * y devuelve el rol del usuario, o null si no hay sesión.
 */
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

let currentPage = 1;
let currentFilter = 'todas';
let currentSearchTerm = '';
let currentTagFilter = '';
let editingPublicationId = null;
let deleteImageOnUpdate = false;
let filesToDeleteOnUpdate = [];
const itemsPerPage = 9;

// Utility function to remove accents
function removeAccents(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// Utility function for API calls
async function makeApiCall(url, method = 'GET', body = null, includeFiles = false) {
    const headers = {
        'Accept': 'application/json',
    };
    const options = { 
        method, 
        headers,
        credentials: 'include' 
    };
    
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
        
        // --- PASO 1: SILENCIAR EL ERROR 401 ---
        if (response.status === 401) {
            console.warn("Acceso no autorizado o sesión expirada (401).");
            // Devolvemos un objeto vacío para que el código no se rompa,
            // pero NO lanzamos el "throw new Error" que activa el cartel rosa.
            return { success: false, data: [] }; 
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `Error del servidor: ${response.status}`);
        }
        return data;

    } catch (error) {
        // --- PASO 2: FILTRAR EL CARTEL ROSA ---
        // Solo mostramos el error visual si NO es un error de autorización (401)
        if (!error.message.includes('401')) {
            showError(error.message);
        }
        throw error;
    }
}

// Fetch all publications
async function fetchPublications() {
    try {
        const result = await makeApiCall('tutorial/getAll');
        
        // AGREGAR ESTA VALIDACIÓN:
        // Si result no existe o no es una lista (Array), nos detenemos silenciosamente
        if (!result || !Array.isArray(result)) {
            console.warn('No se recibieron publicaciones o la sesión expiró.');
            return; 
        }

        publications = result.map(pub => ({
            ...pub,
            tags: Array.isArray(pub.tags) ? pub.tags : (pub.tags ? JSON.parse(pub.tags) : [])
        }));
        renderPublications();
        updateTagsSection();
    } catch (error) {
        // El error ya se maneja en makeApiCall o se silencia allí
    }
}


// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    // Theme handling
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');
    const logo = document.querySelector('.icon');
    if (logo) {
        logo.src = currentTheme === 'dark' ? PROJECT_ROOT + '/assets/img/kreative_white_logo.png' 
        : PROJECT_ROOT + '/assets/img/kreativenofondo.png';;
    }
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    });

    // Leer el rol del usuario desde el JWT
    currentUserRole = getUserRoleFromCookie();

    checkSessionStatus();

    await fetchPublications();
    setupEventListeners();

    // Ocultar botón de nueva publicación si el usuario es lector o no está logueado
    const role = (currentUserRole || "").toLowerCase();
    const canEdit = role.includes('admin') || role.includes('editor');
    
    const uploadBtn = document.getElementById('uploadButton');
    if (uploadBtn && !canEdit) {
        uploadBtn.style.display = 'none';
    }
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', function(e) {
        performSearch();
    });

    window.addEventListener('click', async function(e) {
        if (!e.target.classList.contains('modal')) return;

        const uploadModal = document.getElementById('uploadModal');
        const editModal   = document.getElementById('editModal');

        if (uploadModal && uploadModal.classList.contains('show') && e.target === uploadModal) {
            const confirmed = await showConfirm('¿Deseas cancelar la publicación? Se perderá todo lo que hayas escrito o subido.');
            if (confirmed) closeUploadModal();
            return;
        }

        if (editModal && editModal.classList.contains('show') && e.target === editModal) {
            const confirmed = await showConfirm('¿Deseas cancelar la edición? Se perderán los cambios realizados.');
            if (confirmed) closeEditModal();
        }
    });

    document.addEventListener('click', function(e) {
        if (!e.target.closest('.card-dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    setupTagInput('upload');
    setupTagInput('edit');
    setupImageUpload('upload');
    setupImageUpload('edit');
}

// Render publications
function renderPublications() {
    const filteredPublications = getFilteredPublications();
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pagePublications = filteredPublications.slice(startIndex, endIndex);
    const cardGrid = document.getElementById('cardGrid');
    cardGrid.innerHTML = '';
    pagePublications.forEach(pub => {
        const card = createPublicationCard(pub);
        cardGrid.appendChild(card);
    });
    updatePagination(filteredPublications.length);
}

// Create publication card
function createPublicationCard(pub) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.id = pub.id;
    
    // Ensure tags is an array
    const tags = Array.isArray(pub.tags) ? pub.tags : [];

    // 1. Detectamos la raíz del proyecto (ya definida como PROJECT_ROOT)
    const projectRoot = PROJECT_ROOT;

    // 2. Extraemos el nombre limpio de la imagen (soporta \ y /)
    const imageName = pub.image ? pub.image.split(/[\\/]/).pop() : '';
    const cacheBuster = `?t=${Date.now()}`;

    // 3. CONSTRUCCIÓN DE RUTA (Ajustada a tu XAMPP)
    // En local: /wiki-kreative-gen15.5/public/uploads/nombre.jpg
    // En producción: /public/uploads/nombre.jpg
    const imageUrl = (imageName && imageName.trim() !== '') 
    ? PROJECT_ROOT + `/public/uploads/${imageName}${cacheBuster}` 
    : PROJECT_ROOT + `/assets/img/kreativenofondo.png`;

    
    // Solo admin y editor pueden editar/eliminar publicaciones
    const role = (currentUserRole || "").toLowerCase();
    const canEdit = role.includes('admin') || role.includes('editor');
    
    const dropdownMenu = canEdit ? `
        <div class="card-dropdown">
            <button class="dropdown-button" onclick="toggleDropdown(event, ${pub.id})">⋮</button>
            <div class="dropdown-menu" id="dropdown-${pub.id}">
                <div class="dropdown-item edit" onclick="openEditModal(${pub.id})">✏️ Editar</div>
                <div class="dropdown-item delete" onclick="deletePublication(${pub.id})">🗑️ Eliminar</div>
            </div>
        </div>
    ` : '';

    // Construcción del HTML de la tarjeta
    card.innerHTML = `
        ${dropdownMenu}
        
        <div class="card-image">
            <img src="${imageUrl}" 
                 alt="${pub.title}" 
                 onerror="this.src='${projectRoot}/assets/img/kreativenofondo.png'">
            <span class="card-badge">${getCategoryName(pub.area)}</span>
        </div>

        <div class="card-body">
            <h3 class="card-title">${pub.title}</h3>
            <p class="card-description">${pub.description}</p>

            <div class="card-footer">
                <div class="card-tags">
                    ${tags.slice(0, 3).map(tag => `<span class="card-tag">${tag}</span>`).join('')}
                    ${tags.length > 3 ? `<span class="card-tag">+${tags.length - 3}</span>` : ''}
                </div>
            </div>
            <br>
            <a href="detail?id=${pub.id}" class="view-more-button">Ver más</a>
        </div>
    `;

    return card;
}

// Get category display name
function getCategoryName(area) {
    const names = {
        'programacion': 'Programación',
        'diseño': 'Diseño',
        'gastronomia': 'Gastronomía',
        'tutorial': 'Tutorial',
        'marketing': 'Marketing'
    };
    return names[area] || area;
}

// Get filtered publications
function getFilteredPublications() {
    return publications.filter(pub => {
        // Se asegura que pub.tags sea array
        const tags = Array.isArray(pub.tags)
            ? pub.tags
            : (typeof pub.tags === 'string' && pub.tags.trim().startsWith('[')
                ? JSON.parse(pub.tags)
                : []);

        const matchesCategory = currentFilter === 'todas' || pub.area === currentFilter;
        const searchTermNormalized = removeAccents(currentSearchTerm.toLowerCase());
        const matchesSearch = currentSearchTerm === '' ||
            //remueven los acentos para comparar
            removeAccents(pub.title.toLowerCase()).includes(searchTermNormalized) ||
            removeAccents(pub.description.toLowerCase()).includes(searchTermNormalized) ||
            tags.some(tag => removeAccents(tag.toLowerCase()).includes(searchTermNormalized));
        const matchesTag = currentTagFilter === '' || tags.includes(currentTagFilter);

        return matchesCategory && matchesSearch && matchesTag;
    });
}
// Search functionality
function performSearch() {
    currentSearchTerm = document.getElementById('searchInput').value;
    currentPage = 1;
    renderPublications();
    updateTagsSection();
}

// Filter by category
function filterByCategory(category) {
    document.querySelectorAll('.filter-item').forEach(item => {
        item.classList.remove('active');
    });

    event.target.classList.add('active');
    currentFilter = category;
    currentTagFilter = '';
    document.querySelectorAll('.tag-item').forEach(item => {
        item.classList.remove('active');
    });

    currentPage = 1;
    renderPublications();
    updateTagsSection();
}

// Filter by tag
function filterByTag(tag) {
    document.querySelectorAll('.tag-item').forEach(item => {
        item.classList.remove('active');
    });
    event.target.classList.add('active');
    currentTagFilter = currentTagFilter === tag ? '' : tag;
    if (currentTagFilter === '') {
        event.target.classList.remove('active');
    }
    currentPage = 1;
    renderPublications();
    updateTagsSection();
}

// Update tags section
function updateTagsSection() {
    const filteredPublications = getFilteredPublications();
    const allTags = [...new Set(
        filteredPublications
            .flatMap(pub => Array.isArray(pub.tags) ? pub.tags : [])
            .filter(tag => tag && tag.trim() !== '')
    )].sort();

    const tagsContainer = document.getElementById('tagsContainer');
    tagsContainer.innerHTML = '';

    allTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = `tag-item ${currentTagFilter === tag ? 'active' : ''}`;
        tagElement.textContent = tag;
        tagElement.onclick = () => filterByTag(tag);
        tagsContainer.appendChild(tagElement);
    });
}

// Pagination
function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
    const paginationNumbers = document.getElementById('paginationNumbers');
    paginationNumbers.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const pageNumber = document.createElement('span');
        pageNumber.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageNumber.textContent = i;
        pageNumber.onclick = () => goToPage(i);
        paginationNumbers.appendChild(pageNumber);
    }
}

function goToPage(page) {
    currentPage = page;
    renderPublications();
}

function previousPage() {
    if (currentPage > 1) {
        goToPage(currentPage - 1);
    }
}

function nextPage() {
    const filteredPublications = getFilteredPublications();
    const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);
    if (currentPage < totalPages) {
        goToPage(currentPage + 1);
    }
}

// Dropdown functionality
function toggleDropdown(event, publicationId) {
    event.stopPropagation();
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu.id !== `dropdown-${publicationId}`) {
            menu.classList.remove('show');
        }
    });
    const dropdown = document.getElementById(`dropdown-${publicationId}`);
    dropdown.classList.toggle('show');
}

// Modal functions
function openUploadModal() {
    document.getElementById('uploadModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeUploadModal() {
    document.getElementById('uploadModal').classList.remove('show');
    document.body.style.overflow = 'auto';
    resetUploadForm();
}

function openEditModal(publicationId) {
    //const publication = publications.find(p => p.id === publicationId);
    const publication = publications.find(p => String(p.id) === String(publicationId));
    
    if (!publication) return;
    editingPublicationId = publicationId;
    deleteImageOnUpdate = false;
    filesToDeleteOnUpdate = [];
    document.getElementById('editTitle').value = publication.title;
    document.getElementById('editDescription').value = publication.description;
    document.getElementById('editCategory').value = publication.area;
    document.getElementById('editContent').value = publication.content || '';
    const tagsDisplay = document.getElementById('editTagsDisplay');
    tagsDisplay.innerHTML = '';
    const tags = Array.isArray(publication.tags) ? publication.tags : [];
    tags.forEach(tag => {
        addTagToDisplay(tag, 'edit');
    });
    
    // Mostrar botón de eliminar imagen si existe una imagen actual
    const deleteImageButton = document.getElementById('deleteImageButton');
    const editImagePreview = document.getElementById('editImagePreview'); // <--- Asegúrate de tener este ID

    if (publication.image) {
        deleteImageButton.style.display = 'block';

        if (editImagePreview) {
            const imageName = publication.image.split(/[\\/]/).pop();
            const projectRoot = PROJECT_ROOT;
            editImagePreview.src = `${projectRoot}/public/uploads/${imageName}?t=${Date.now()}`;
            editImagePreview.style.display = 'block';

            // Activar modo "con imagen" en el área de edición
            const editUploadArea = editImagePreview.closest('.image-upload-area');
            if (editUploadArea) {
                editUploadArea.classList.add('has-image');
                editUploadArea.querySelector('.upload-icon')  && (editUploadArea.querySelector('.upload-icon').style.display  = 'none');
                editUploadArea.querySelector('.upload-text')  && (editUploadArea.querySelector('.upload-text').style.display  = 'none');
                editUploadArea.querySelector('.upload-subtext') && (editUploadArea.querySelector('.upload-subtext').style.display = 'none');
            }
        }
    } else {
        deleteImageButton.style.display = 'none';
        if (editImagePreview) editImagePreview.style.display = 'none';
    }
    
    // Mostrar archivos existentes
    displayExistingFiles(publication.files);
    
    document.getElementById('editModal').classList.add('show');
    document.body.style.overflow = 'hidden';
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('show');
    document.body.style.overflow = 'auto';
    resetEditForm();
    editingPublicationId = null;
}

// Form submission
async function submitUpload() {
    const btn = document.getElementById('uploadSubmitBtn');

    return WKFeedback.withButtonLock(btn, async () => {
        // Validación bonita (toast + borde rojo)
        const ok = WKFeedback.validateRequired([
            { id: 'uploadTitle', label: 'Título' },
            { id: 'uploadDescription', label: 'Descripción' },
            { id: 'uploadCategory', label: 'Área' },
            { id: 'uploadContent', label: 'Contenido' },
        ]);
        if (!ok) return;

           // ========== CONFIRMACIÓN ANTES DE CREAR ==========
        const confirmed = await showConfirm('¿Estás seguro de que quieres crear esta publicación?');
        if (!confirmed) {
            console.log('Creación cancelada por el usuario.');
            return;
        }
        // =================================================

        const title = document.getElementById('uploadTitle').value;
        const description = document.getElementById('uploadDescription').value;
        const area = document.getElementById('uploadCategory').value;
        const content = document.getElementById('uploadContent').value;
        const imageInput = document.getElementById('uploadImage');

        const tags = Array.from(document.querySelectorAll('#uploadTagsDisplay .tag-chip'))
            .map(chip => chip.textContent.replace('×', '').trim());

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        formData.append('area', area);
        formData.append('content', content);
        formData.append('tags', JSON.stringify(tags));
        formData.append('lastEditor', 'user123');
        formData.append('creator', 'user123');

        if (imageInput.files[0]) {
            formData.append('image', imageInput.files[0]);
        }

        const filesInput = document.getElementById('uploadFiles');
        if (filesInput && filesInput.files && filesInput.files.length > 0) {
            for (const file of filesInput.files) {
                formData.append('files[]', file);
            }
        }

        try {
            await makeApiCall('tutorial/create', 'POST', formData, true);
            showSuccess('Tutorial creado exitosamente');
            closeUploadModal();
            await fetchPublications();
        } catch (error) {
            console.error('Error creating tutorial:', error);
            showError(error?.message || 'No se pudo crear el tutorial');
        }
    }, { loadingText: "Publicando..." });
}



async function submitEdit() {
    const btn = document.getElementById('editSubmitBtn');

    return WKFeedback.withButtonLock(btn, async () => {
        const ok = WKFeedback.validateRequired([
            { id: 'editTitle', label: 'Título' },
            { id: 'editDescription', label: 'Descripción' },
            { id: 'editCategory', label: 'Área' },
            { id: 'editContent', label: 'Contenido' },
        ]);
        if (!ok) return;

        const title = document.getElementById('editTitle').value;
        const description = document.getElementById('editDescription').value;
        const area = document.getElementById('editCategory').value;
        const content = document.getElementById('editContent').value;
        const imageInput = document.getElementById('editImage');

        const tags = Array.from(document.querySelectorAll('#editTagsDisplay .tag-chip'))
            .map(chip => chip.textContent.replace('×', '').trim());

    if (!title || !description || !area || !content) {
        showError('Por favor completa todos los campos obligatorios.');
        return;
    }

    const formData = new FormData();
    formData.append('id', editingPublicationId);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('area', area);
    formData.append('content', content);
    formData.append('tags', JSON.stringify(tags));
    formData.append('lastEditor', 'user123');
    formData.append('deleteImage', deleteImageOnUpdate ? '1' : '0');
    formData.append('deleteFiles', JSON.stringify(filesToDeleteOnUpdate));

        if (imageInput.files[0]) {
            formData.append('image', imageInput.files[0]);
        }

        const filesInput = document.getElementById('editFiles');
        if (filesInput && filesInput.files && filesInput.files.length > 0) {
            for (const file of filesInput.files) {
                formData.append('files[]', file);
            }
        }

        try {
            await makeApiCall('tutorial/update', 'POST', formData, true);
            showSuccess('Tutorial actualizado exitosamente');
            closeEditModal();
            await fetchPublications();
        } catch (error) {
            console.error('Error updating tutorial:', error);
            showError(error?.message || 'No se pudo actualizar el tutorial');
        }
    }, { loadingText: "Guardando..." });
}



async function deletePublication(publicationId) {
    if (!publicationId || isNaN(publicationId)) {
        console.error('Invalid publicationId:', publicationId);
        showError('Error: ID de publicación no válido');
        return;
    }

    const confirmed = await showConfirm('¿Estás seguro de que quieres eliminar esta publicación?');
    if (!confirmed) {
        console.log('Eliminación cancelada por el usuario.');
        return;
    }

    try {
        console.log('Enviando petición de eliminación al backend con ID:', publicationId);
        const formData = new FormData();
        formData.append('id', publicationId);
        await makeApiCall('tutorial/delete', 'POST', formData, true);
        console.log('Publicación eliminada.');
        showSuccess('Tutorial eliminado exitosamente');
        await fetchPublications();
    } catch (error) {
        console.error('Error deleting tutorial:', error);
        // Error ya mostrado por makeApiCall()
    } finally {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('show');
        });
    }
}

// Tag input functionality
function setupTagInput(modalType) {
    const tagInput = document.getElementById(`${modalType}TagInput`);
    tagInput.placeholder = "Enter para guardar";
    tagInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && this.value.trim()) {
            e.preventDefault();
            addTagToDisplay(this.value.trim(), modalType);
            this.value = '';
        }
    });
}

function addTagToDisplay(tagText, modalType) {
    const tagsDisplay = document.getElementById(`${modalType}TagsDisplay`);
    const existingTags = Array.from(tagsDisplay.querySelectorAll('.tag-chip'))
        .map(chip => chip.textContent.replace('×', '').trim());
    if (existingTags.includes(tagText)) {
        return;
    }
    const tagChip = document.createElement('div');
    tagChip.className = 'tag-chip';
    tagChip.innerHTML = `
        ${tagText}
        <button type="button" class="tag-remove" onclick="this.parentElement.remove()">×</button>
    `;
    tagsDisplay.appendChild(tagChip);
}

// Image upload functionality
function setupImageUpload(modalType) {
    const imageInput   = document.getElementById(`${modalType}Image`);
    const imagePreview = document.getElementById(`${modalType}ImagePreview`);
    // El área contenedora (el div clickeable)
    const uploadArea   = imageInput?.closest('.image-upload-area');

    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';

                // Modo "con imagen": ocultamos placeholder y activamos el marco lleno
                if (uploadArea) {
                    uploadArea.classList.add('has-image');
                    uploadArea.querySelector('.upload-icon')?.style && (uploadArea.querySelector('.upload-icon').style.display = 'none');
                    uploadArea.querySelector('.upload-text')?.style && (uploadArea.querySelector('.upload-text').style.display = 'none');
                    uploadArea.querySelector('.upload-subtext')?.style && (uploadArea.querySelector('.upload-subtext').style.display = 'none');
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

/** Restaura el área de upload a su estado vacío (sin imagen) */
function resetImageUploadArea(modalType) {
    const imageInput   = document.getElementById(`${modalType}Image`);
    const imagePreview = document.getElementById(`${modalType}ImagePreview`);
    const uploadArea   = imageInput?.closest('.image-upload-area');

    if (imagePreview) { imagePreview.src = ''; imagePreview.style.display = 'none'; }
    if (uploadArea) {
        uploadArea.classList.remove('has-image');
        uploadArea.querySelector('.upload-icon')  && (uploadArea.querySelector('.upload-icon').style.display  = '');
        uploadArea.querySelector('.upload-text')  && (uploadArea.querySelector('.upload-text').style.display  = '');
        uploadArea.querySelector('.upload-subtext') && (uploadArea.querySelector('.upload-subtext').style.display = '');
    }
}


//Display de archivos existentes en el modal de edición
function displayExistingFiles(filesData) {
    const container = document.getElementById('editExistingFiles');
    container.innerHTML = '';
    
    if (!filesData) {
        return;
    }
    
    let files = [];
    if (typeof filesData === 'string') {
        try {
            files = JSON.parse(filesData);
        } catch (e) {
            files = [];
        }
    } else if (Array.isArray(filesData)) {
        files = filesData;
    }
    
    if (!files || files.length === 0) {
        return;
    }
    
    const filesList = document.createElement('div');
    filesList.className = 'existing-files-list';
    
    
    const title = document.createElement('p');
    
    title.style.fontWeight = 'bold';
    title.style.margin = '0 0 10px 0';
    filesList.appendChild(title);
    
    files.forEach((filePath, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.style.display = 'flex';
        fileItem.style.justifyContent = 'space-between';
        fileItem.style.alignItems = 'center';
        fileItem.style.padding = '8px';
        fileItem.style.backgroundColor = 'white';
        fileItem.style.marginBottom = '5px';
        fileItem.style.borderRadius = '3px';
        fileItem.style.borderLeft = '3px solid #007bff';
        
        const nameSpan = document.createElement('span');
        const fileName = filePath.split('/').pop();
        nameSpan.textContent = fileName;
        nameSpan.style.flex = '1';
        nameSpan.style.wordBreak = 'break-word';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'btn btn-sm btn-danger';
        deleteBtn.textContent = 'Eliminar';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.style.padding = '4px 8px';
        deleteBtn.style.fontSize = '12px';
        deleteBtn.onclick = (e) => {
            e.preventDefault();
            deleteExistingFile(filePath, index);
        };
        
        fileItem.appendChild(nameSpan);
        fileItem.appendChild(deleteBtn);
        filesList.appendChild(fileItem);
    });
    
    container.appendChild(filesList);
}

//Eliminar archivo existente
function deleteExistingFile(filePath, index) {
    if (!filesToDeleteOnUpdate.includes(filePath)) {
        filesToDeleteOnUpdate.push(filePath);
    }
    
    const fileItems = document.querySelectorAll('.file-item');
    if (fileItems[index]) {
        fileItems[index].style.opacity = '0.5';
        fileItems[index].style.textDecoration = 'line-through';
    }
    
    showSuccess('Archivo marcado para eliminar');
}


function deleteCurrentImage() {
    deleteImageOnUpdate = true;
    document.getElementById('editImagePreview').style.display = 'none';
    document.getElementById('deleteImageButton').style.display = 'none';
    showSuccess('Imagen marcada para eliminar');
}

function resetUploadForm() {
    document.getElementById('uploadForm').reset();
    document.getElementById('uploadTagsDisplay').innerHTML = '';
    resetImageUploadArea('upload');
}

function resetEditForm() {
    document.getElementById('editForm').reset();
    document.getElementById('editTagsDisplay').innerHTML = '';
    resetImageUploadArea('edit');
    document.getElementById('editExistingFiles').innerHTML = '';
    deleteImageOnUpdate = false;
    filesToDeleteOnUpdate = [];
}

// User feedback functions
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

async function showConfirm(message) {
    return new Promise(resolve => {
        // Create the modal
        const confirmModal = document.createElement('div');
        confirmModal.className = 'modal confirm-modal show'; // Add 'show' class immediately
        confirmModal.innerHTML = `
            <div class="modal-content">
                <p class="confirm-modal-text">${message}</p>
                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button class="btn btn-primary confirm-yes">Sí</button>
                    <button class="btn btn-secondary confirm-no">No</button>
                </div>
            </div>
        `;
        
        // Append to body
        document.body.appendChild(confirmModal);

        // Ensure modal is visible
        confirmModal.style.display = 'flex';

        // Add event listeners
        const yesButton = confirmModal.querySelector('.confirm-yes');
        const noButton = confirmModal.querySelector('.confirm-no');

        yesButton.onclick = () => {
            confirmModal.remove();
            resolve(true);
        };
        noButton.onclick = () => {
            confirmModal.remove();
            resolve(false);
        };

        // Allow closing modal by clicking outside
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) {
                confirmModal.remove();
                resolve(false);
            }
        });
    });
}

// Theme toggle function
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    const logo = document.querySelector('.icon');
    if (logo) {
        logo.src = isDarkMode ? PROJECT_ROOT + '/assets/img/kreative_white_logo.png' 
        : PROJECT_ROOT + '/assets/img/kreativenofondo.png';
    }
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.textContent = isDarkMode ? '☀️' : '🌙';
    });
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}


// ========================
// NAVBAR — Menú de usuario
// ========================

// Íconos por rol
const ROLE_ICONS = {
    'admin':       '👑',
    'admin_wiki':  '👑',
    'editor':      '✏️',
    'editor_wiki': '✏️',
    'lector':      '👤',
    'lector_wiki': '👤',
};

// Opciones del dropdown según rol
function buildUserDropdown(role) {
    const dropdown = document.getElementById('userDropdown');
    if (!dropdown) return;
    dropdown.innerHTML = '';

    // Opciones exclusivas para admin y editor
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
        // Divisor
        dropdown.innerHTML += `<div class="user-dropdown-divider"></div>`;
    }


    // Divisor + Cerrar sesión
    dropdown.innerHTML += `
        <div class="user-dropdown-divider"></div>
        <div class="user-dropdown-item logout-item" onclick="handleLogout()">
            <i class="fa-solid fa-right-from-bracket"></i> Cerrar Sesión
        </div>`;
}

// Check si el usuario está logueado y actualiza la navbar
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

    updateUploadButton(isLoggedIn);
}

// Abrir/cerrar el dropdown del usuario
function toggleUserMenu() {
    const dropdown = document.getElementById('userDropdown');
    const trigger  = document.getElementById('userTrigger');
    if (!dropdown) return;
    dropdown.classList.toggle('show');
    trigger?.classList.toggle('open');
}

// Cerrar dropdown al hacer click fuera
document.addEventListener('click', function(e) {
    if (!e.target.closest('.user-menu')) {
        document.getElementById('userDropdown')?.classList.remove('show');
        document.getElementById('userTrigger')?.classList.remove('open');
    }
});

// Hamburger móvil
function toggleMobileMenu() {
    document.getElementById('mobileMenu')?.classList.toggle('open');
    document.getElementById('hamburger')?.classList.toggle('open');
}

// Update upload button — solo visible si hay sesión
function updateUploadButton(isLoggedIn) {
    const uploadButton = document.getElementById('uploadButton');
    if (!uploadButton) return;

    if (isLoggedIn) {
        uploadButton.style.removeProperty('display');
    } else {
        uploadButton.style.display = 'none';
    }
}

function handleUploadButtonClick() {
    const isLoggedIn = sessionStorage.getItem('userLoggedIn') === 'true' ||
                        localStorage.getItem('userLoggedIn') === 'true' ||
                        sessionStorage.getItem('userId') ||
                        localStorage.getItem('userId');
    
    if (isLoggedIn) {
        openUploadModal();
    } else {
        window.location.href = 'views/login.html';
    }
}

// Monitor session changes (useful when user logs in from another tab/window)
window.addEventListener('storage', function(e) {
    if (e.key === 'userLoggedIn' || e.key === 'userId') {
        checkSessionStatus();
    }
});

// Función para cerrar la sesión automáticamente
function handleLogout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    sessionStorage.clear();
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    console.log("Cerrando sesión...");
    window.location.href = PROJECT_ROOT + '/frontend/index.php';
}