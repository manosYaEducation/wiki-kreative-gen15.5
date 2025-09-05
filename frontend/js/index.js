let currentPage = 1;
let currentFilter = 'todas';
let currentSearchTerm = '';
let currentTagFilter = '';
let editingPublicationId = null;
const itemsPerPage = 9;

// Sample publications data
let publications = [
    {
        id: 1,
        title: "Introducción a React Hooks",
        description: "Aprende los conceptos básicos de React Hooks y cómo utilizarlos en tus proyectos.",
        category: "programacion",
        tags: ["React", "JavaScript", "Frontend", "Hooks"],
        image: "💻",
        link: "https://example.com",
        file: null
    },
    {
        id: 2,
        title: "Diseño de Interfaces Modernas",
        description: "Principios fundamentales del diseño UI/UX para crear interfaces atractivas y funcionales.",
        category: "diseño",
        tags: ["UI", "UX", "Diseño", "Figma"],
        image: "🎨",
        link: null,
        file: null
    },
    {
        id: 3,
        title: "Receta de Pasta Italiana",
        description: "Una deliciosa receta tradicional italiana paso a paso para preparar en casa.",
        category: "gastronomia",
        tags: ["Cocina", "Italia", "Pasta", "Receta"],
        image: "🍝",
        link: null,
        file: null
    },
    {
        id: 4,
        title: "Tutorial de Git y GitHub",
        description: "Guía completa para dominar el control de versiones con Git y colaborar en GitHub.",
        category: "tutorial",
        tags: ["Git", "GitHub", "Control de versiones", "Desarrollo"],
        image: "📚",
        link: "https://github.com",
        file: null
    },
    {
        id: 5,
        title: "Estrategias de Marketing Digital",
        description: "Técnicas efectivas para promocionar tu negocio en el mundo digital actual.",
        category: "marketing",
        tags: ["Marketing", "Digital", "SEO", "Redes sociales"],
        image: "📈",
        link: null,
        file: null
    },
    {
        id: 6,
        title: "Desarrollo con Node.js",
        description: "Construye aplicaciones backend robustas utilizando Node.js y Express.",
        category: "programacion",
        tags: ["Node.js", "Backend", "JavaScript", "Express"],
        image: "⚡",
        link: null,
        file: null
    },
    {
        id: 7,
        title: "Principios de Tipografía",
        description: "Cómo elegir y combinar fuentes para crear diseños visualmente atractivos.",
        category: "diseño",
        tags: ["Tipografía", "Fuentes", "Diseño gráfico"],
        image: "✍️",
        link: null,
        file: null
    },
    {
        id: 8,
        title: "Cocina Vegana Saludable",
        description: "Recetas nutritivas y deliciosas para una alimentación vegana equilibrada.",
        category: "gastronomia",
        tags: ["Vegano", "Saludable", "Nutrición", "Recetas"],
        image: "🥗",
        link: null,
        file: null
    },
    {
        id: 9,
        title: "CSS Grid y Flexbox",
        description: "Domina los sistemas de layout modernos de CSS para crear diseños responsivos.",
        category: "tutorial",
        tags: ["CSS", "Grid", "Flexbox", "Layout"],
        image: "🎯",
        link: null,
        file: null
    },
    {
        id: 10,
        title: "Branding Personal",
        description: "Construye una marca personal sólida en el mundo profesional y digital.",
        category: "marketing",
        tags: ["Branding", "Personal", "Profesional", "Identidad"],
        image: "🎭",
        link: null,
        file: null
    }
];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    renderPublications();
    updateTagsSection();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    // Search on Enter key
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeUploadModal();
            closeEditModal();
        }
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.card-dropdown')) {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
            });
        }
    });

    // Tag input functionality for upload modal
    setupTagInput('upload');
    setupTagInput('edit');

    // Image upload functionality
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
    card.innerHTML = `
        <div class="card-dropdown">
            <button class="dropdown-button" onclick="toggleDropdown(event, ${pub.id})">⋮</button>
            <div class="dropdown-menu" id="dropdown-${pub.id}">
                <div class="dropdown-item edit" onclick="openEditModal(${pub.id})">✏️ Editar</div>
                <div class="dropdown-item delete" onclick="deletePublication(${pub.id})">🗑️ Eliminar</div>
            </div>
        </div>
        <div class="card-image">${pub.image}</div>
        <div class="card-content">
            <div class="card-category">${getCategoryName(pub.category)}</div>
            <h3 class="card-title">${pub.title}</h3>
            <p class="card-description">${pub.description}</p>
            <div class="card-footer">
                <div class="card-tags">
                    ${pub.tags.slice(0, 2).map(tag => `<span class="card-tag">${tag}</span>`).join('')}
                    ${pub.tags.length > 2 ? `<span class="card-tag">+${pub.tags.length - 2}</span>` : ''}
                </div>
                <a href="detail.html?id=${pub.id}" class="view-more-button">Ver más</a>
            </div>
        </div>
    `;
    return card;
}

// Get category display name
function getCategoryName(category) {
    const names = {
        'programacion': 'Programación',
        'diseño': 'Diseño',
        'gastronomia': 'Gastronomía',
        'tutorial': 'Tutorial',
        'marketing': 'Marketing'
    };
    return names[category] || category;
}

// Get filtered publications
function getFilteredPublications() {
    return publications.filter(pub => {
        const matchesCategory = currentFilter === 'todas' || pub.category === currentFilter;
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
    // Update active filter
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
    // Update active tag
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
        const matchesCategory = currentFilter === 'todas' || pub.category === currentFilter;
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
    
    // Update buttons
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
    
    // Update page numbers
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
    
    // Close all other dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu.id !== `dropdown-${publicationId}`) {
            menu.classList.remove('show');
        }
    });
    
    // Toggle current dropdown
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
    
    // Populate form with existing data
    document.getElementById('editTitle').value = publication.title;
    document.getElementById('editDescription').value = publication.description;
    document.getElementById('editCategory').value = publication.category;
    document.getElementById('editLink').value = publication.link || '';
    
    // Populate tags
    const tagsDisplay = document.getElementById('editTagsDisplay');
    tagsDisplay.innerHTML = '';
    publication.tags.forEach(tag => {
        addTagToDisplay(tag, 'edit');
    });
    
    document.getElementById('editModal').classList.add('show');
    document.body.style.overflow = 'hidden';
    
    // Close dropdown
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
function submitUpload() {
    const title = document.getElementById('uploadTitle').value;
    const description = document.getElementById('uploadDescription').value;
    const category = document.getElementById('uploadCategory').value;
    const link = document.getElementById('uploadLink').value;
    
    if (!title || !description || !category) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }
    
    const tags = Array.from(document.querySelectorAll('#uploadTagsDisplay .tag-chip'))
        .map(chip => chip.textContent.replace('×', '').trim());
    
    const newPublication = {
        id: Date.now(),
        title,
        description,
        category,
        tags,
        image: getRandomEmoji(),
        link: link || null,
        file: null
    };
    
    publications.unshift(newPublication);
    closeUploadModal();
    renderPublications();
    updateTagsSection();
}

function submitEdit() {
    const title = document.getElementById('editTitle').value;
    const description = document.getElementById('editDescription').value;
    const category = document.getElementById('editCategory').value;
    const link = document.getElementById('editLink').value;
    
    if (!title || !description || !category) {
        alert('Por favor completa todos los campos obligatorios.');
        return;
    }
    
    const tags = Array.from(document.querySelectorAll('#editTagsDisplay .tag-chip'))
        .map(chip => chip.textContent.replace('×', '').trim());
    
    const publicationIndex = publications.findIndex(p => p.id === editingPublicationId);
    if (publicationIndex !== -1) {
        publications[publicationIndex] = {
            ...publications[publicationIndex],
            title,
            description,
            category,
            tags,
            link: link || null
        };
    }
    
    closeEditModal();
    renderPublications();
    updateTagsSection();
}

// Delete publication
function deletePublication(publicationId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
        publications = publications.filter(p => p.id !== publicationId);
        renderPublications();
        updateTagsSection();
    }
    
    // Close dropdown
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('show');
    });
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
    
    // Check if tag already exists
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

// Utility functions
function getRandomEmoji() {
    const emojis = ['💻', '🎨', '🍝', '📚', '📈', '⚡', '✍️', '🥗', '🎯', '🎭', '🚀', '💡', '🔧', '📱', '🌟'];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

document.addEventListener('DOMContentLoaded', () => {
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-mode', currentTheme === 'dark');

    // Update logo based on initial theme
    const logo = document.querySelector('.icon');
    if (logo) {
        logo.src = currentTheme === 'dark' ? '../assets/img/kreative_white_logo.png' : '../assets/img/kreativenofondo.png';
    }

    // Update theme toggle button text based on initial theme
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    });
});

// Theme toggle function
function toggleTheme() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    
    // Update logo based on theme
    const logo = document.querySelector('.icon');
    if (logo) {
        logo.src = isDarkMode ? '../assets/img/kreative_white_logo.png' : '../assets/img/kreativenofondo.png';
    }

    // Update theme toggle button text
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.textContent = isDarkMode ? '☀️' : '🌙';
    });

    // Save theme preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}