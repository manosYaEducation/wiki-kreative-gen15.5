const publications = [
    {
        id: 1,
        title: "Guía completa de React Hooks",
        description: "Aprende a usar los hooks de React de manera efectiva con ejemplos prácticos y casos de uso reales.",
        area: "programacion",
        image: "💻",
        date: "2024-01-15",
        tags: ["React", "JavaScript", "Frontend"],
        hasAttachments: true,
        externalLink: "https://reactjs.org/docs/hooks-intro.html"
    },
    {
        id: 2,
        title: "Principios de diseño UX/UI",
        description: "Descubre los fundamentos del diseño de experiencia de usuario y interfaz para crear productos digitales exitosos.",
        area: "diseño",
        image: "🎨",
        date: "2024-01-14",
        tags: ["UX", "UI", "Diseño"],
        hasAttachments: false,
        externalLink: "https://www.nngroup.com/articles/ten-usability-heuristics/"
    },
    {
        id: 3,
        title: "Recetas de cocina molecular",
        description: "Explora técnicas avanzadas de gastronomía molecular para crear platos innovadores y sorprendentes.",
        area: "gastronomia",
        image: "🧪",
        date: "2024-01-13",
        tags: ["Cocina", "Molecular", "Innovación"],
        hasAttachments: true,
        externalLink: null
    },
    {
        id: 4,
        title: "Tutorial: Git y GitHub",
        description: "Domina el control de versiones con Git y aprende a colaborar efectivamente usando GitHub.",
        area: "tutorial",
        image: "📚",
        date: "2024-01-12",
        tags: ["Git", "GitHub", "Control de versiones"],
        hasAttachments: true,
        externalLink: "https://git-scm.com/doc"
    },
    {
        id: 5,
        title: "Estrategias de marketing digital",
        description: "Conoce las mejores prácticas para crear campañas de marketing digital efectivas en 2024.",
        area: "marketing",
        image: "📈",
        date: "2024-01-11",
        tags: ["Marketing", "Digital", "Estrategia"],
        hasAttachments: false,
        externalLink: "https://blog.hubspot.com/marketing"
    }
];

function getPublicationById(id) {
    return publications.find(pub => pub.id === parseInt(id));
}

function loadPublicationDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const publicationId = urlParams.get('id');
    
    if (!publicationId) {
        console.error('No publication ID provided in URL');
        window.location.href = 'index.html';
        return;
    }

    const publication = getPublicationById(publicationId);
    
    if (!publication) {
        console.error(`Publication with ID ${publicationId} not found`);
        window.location.href = 'index.html';
        return;
    }

    console.log('Loading publication:', publication);

    // Load publication data
    const imageElement = document.getElementById('publicationImage');
    imageElement.textContent = publication.image || '📷';
    document.getElementById('publicationCategory').textContent = publication.area;
    document.getElementById('publicationDate').textContent = new Date(publication.date).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('publicationTitle').textContent = publication.title;
    document.getElementById('publicationDescription').textContent = publication.description;

    // Load tags
    const tagsContainer = document.getElementById('tagsContainer');
    tagsContainer.innerHTML = publication.tags.map(tag => `
        <div class="tag">${tag}</div>
    `).join('');

    // Show/hide attachments section
    if (publication.hasAttachments) {
        document.getElementById('attachmentsSection').style.display = 'block';
    }

    // Show/hide external link section
    if (publication.externalLink) {
        document.getElementById('externalLinkSection').style.display = 'block';
        document.getElementById('externalLink').href = publication.externalLink;
        document.getElementById('linkUrl').textContent = publication.externalLink;
    }

    // Update page title
    document.title = `${publication.title} - Wiki KREATIVE`;
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadPublicationDetails();
});