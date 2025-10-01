const API_BASE_URL = '/wiki-kreative-gen15.5/backend/public';
let currentPage = 1;
let currentFilter = 'todas';
let currentSearchTerm = '';
let currentTagFilter = '';
let editingPublicationId = null;
const itemsPerPage = 9;


// Utility function for API calls
async function makeApiCall(url, method = 'GET', body = null, includeFiles = false) {
    const headers = {
        'Accept': 'application/json',
    };
    const options = { method, headers };
    
    if (body) {
        if (includeFiles) {
            options.body = body; // FormData for file uploads
        } else {
            headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
    }

    try {
        const response = await fetch(`${API_BASE_URL}/${url}`, options);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || `Error del servidor: ${response.status}`);
        }
        return data;
    } catch (error) {
        showError(error.message);
        throw error;
    }
}

// Fetch all publications
async function fetchPublications() {
    try {
        publications = await makeApiCall('tutorial/getAll');
        publications = publications.map(pub => ({
            ...pub,
            tags: Array.isArray(pub.tags) ? pub.tags : (pub.tags ? JSON.parse(pub.tags) : [])
        }));
        renderPublications();
        updateTagsSection();
    } catch (error) {
        console.error('Error fetching publications:', error);
        showError('Error al cargar las publicaciones');
    }
}


// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    // Theme handling
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');
    const logo = document.querySelector('.icon');
    if (logo) {
        logo.src = currentTheme === 'dark' ? '../assets/img/kreative_white_logo.png' : '../assets/img/kreativenofondo.png';
    }
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    });

    await fetchPublications();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeUploadModal();
            closeEditModal();
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
    // Ensure tags is an array, default to empty array if null or undefined
    const tags = Array.isArray(pub.tags) ? pub.tags : [];
    card.innerHTML = `
        <div class="card-dropdown">
            <button class="dropdown-button" onclick="toggleDropdown(event, ${pub.id})">⋮</button>
            <div class="dropdown-menu" id="dropdown-${pub.id}">
                <div class="dropdown-item edit" onclick="openEditModal(${pub.id})">✏️ Editar</div>
                <div class="dropdown-item delete" onclick="deletePublication(${pub.id})">🗑️ Eliminar</div>
            </div>
        </div>
        <div class="card-image"><img src="${pub.image || '/path/to/default-image.png'}" alt="${pub.title}"></div>
        <div class="card-content">
            <div class="card-category">${getCategoryName(pub.area)}</div>
            <h3 class="card-title">${pub.title}</h3>
            <p class="card-description">${pub.description}</p>
            <div class="card-footer">
                <div class="card-tags">
                    ${tags.slice(0, 2).map(tag => `<span class="card-tag">${tag}</span>`).join('')}
                    ${tags.length > 2 ? `<span class="card-tag">+${tags.length - 2}</span>` : ''}
                </div>
                <a href="detail?id=${pub.id}" class="view-more-button">Ver más</a>
            </div>
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
        const matchesCategory = currentFilter === 'todas' || pub.area === currentFilter;
        const matchesSearch = currentSearchTerm === '' ||
            pub.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            pub.description.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            pub.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm.toLowerCase()));
        const matchesTag = currentTagFilter === '' || pub.tags.includes(currentTagFilter);
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
}

// Update tags section
function updateTagsSection() {
    const filteredPublications = publications.filter(pub => {
        const matchesCategory = currentFilter === 'todas' || pub.area === currentFilter;
        const matchesSearch = currentSearchTerm === '' ||
            pub.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            pub.description.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            pub.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });
    const allTags = [...new Set(filteredPublications.flatMap(pub => pub.tags))].sort();
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
    const publication = publications.find(p => p.id === publicationId);
    if (!publication) return;
    editingPublicationId = publicationId;
    document.getElementById('editTitle').value = publication.title;
    document.getElementById('editDescription').value = publication.description;
    document.getElementById('editArea').value = publication.area;
    document.getElementById('editContent').value = publication.content || '';
    const tagsDisplay = document.getElementById('editTagsDisplay');
    tagsDisplay.innerHTML = '';
    publication.tags.forEach(tag => {
        addTagToDisplay(tag, 'edit');
    });
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
    const title = document.getElementById('uploadTitle').value;
    const description = document.getElementById('uploadDescription').value;
    const area = document.getElementById('uploadArea').value;
    const content = document.getElementById('uploadContent').value;
    const imageInput = document.getElementById('uploadImage');
    const tags = Array.from(document.querySelectorAll('#uploadTagsDisplay .tag-chip'))
        .map(chip => chip.textContent.replace('×', '').trim());

    if (!title || !description || !area || !content) {
        showError('Por favor completa todos los campos obligatorios.');
        return;
    }

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

    try {
        await makeApiCall('tutorial/create', 'POST', formData, true);
        showSuccess('Tutorial creado exitosamente');
        closeUploadModal();
        await fetchPublications();
    } catch (error) {
        console.error('Error creating tutorial:', error);
    }
}

async function submitEdit() {
    const title = document.getElementById('editTitle').value;
    const description = document.getElementById('editDescription').value;
    const area = document.getElementById('editArea').value;
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
    if (imageInput.files[0]) {
        formData.append('image', imageInput.files[0]);
    }

    try {
        await makeApiCall('tutorial/update', 'POST', formData, true);
        showSuccess('Tutorial actualizado exitosamente');
        closeEditModal();
        await fetchPublications();
    } catch (error) {
        console.error('Error updating tutorial:', error);
    }
}

async function deletePublication(publicationId) {
    const confirmed = await showConfirm('¿Estás seguro de que quieres eliminar esta publicación?');
    if (!confirmed) return;

    try {
        await makeApiCall('tutorial/delete', 'POST', { id: publicationId });
        showSuccess('Tutorial eliminado exitosamente');
        await fetchPublications();
    } catch (error) {
        console.error('Error deleting tutorial:', error);
    }
}

// Tag input functionality
function setupTagInput(modalType) {
    const tagInput = document.getElementById(`${modalType}TagInput`);
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
    const imageInput = document.getElementById(`${modalType}Image`);
    const imagePreview = document.getElementById(`${modalType}ImagePreview`);
    imageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
}

// Reset forms
function resetUploadForm() {
    document.getElementById('uploadForm').reset();
    document.getElementById('uploadTagsDisplay').innerHTML = '';
    document.getElementById('uploadImagePreview').style.display = 'none';
}

function resetEditForm() {
    document.getElementById('editForm').reset();
    document.getElementById('editTagsDisplay').innerHTML = '';
    document.getElementById('editImagePreview').style.display = 'none';
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
        const confirmModal = document.createElement('div');
        confirmModal.className = 'modal confirm-modal';
        confirmModal.innerHTML = `
            <div class="modal-content">
                <p>${message}</p>
                <button class="confirm-yes">Sí</button>
                <button class="confirm-no">No</button>
            </div>
        `;
        document.body.appendChild(confirmModal);
        confirmModal.querySelector('.confirm-yes').onclick = () => {
            confirmModal.remove();
            resolve(true);
        };
        confirmModal.querySelector('.confirm-no').onclick = () => {
            confirmModal.remove();
            resolve(false);
        };
    });
}

// Theme toggle function
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    const logo = document.querySelector('.icon');
    if (logo) {
        logo.src = isDarkMode ? '../assets/img/kreative_white_logo.png' : '../assets/img/kreativenofondo.png';
    }
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.textContent = isDarkMode ? '☀️' : '🌙';
    });
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}