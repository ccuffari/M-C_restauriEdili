/**
 * Carica e gestisce la sidebar condivisa
 */

// Funzione per caricare la sidebar
async function loadSidebar() {
    try {
        const response = await fetch('sidebar.html');
        if (!response.ok) throw new Error('Network response was not ok');
        const sidebarHtml = await response.text();
        
        // Inserisci la sidebar
        const sidebarContainer = document.createElement('div');
        sidebarContainer.id = 'sidebar-container';
        sidebarContainer.innerHTML = sidebarHtml;
        
        // Trova la posizione corretta (dopo .main-container se esiste, altrimenti crea)
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            mainContainer.insertBefore(sidebarContainer, mainContainer.firstChild);
        }
        
        // Inizializza la sidebar
        initializeSidebar();
    } catch (error) {
        console.error('Error loading sidebar:', error);
        // Fallback: crea una sidebar di base
        createFallbackSidebar();
    }
}

// Crea sidebar di fallback in caso di errore
function createFallbackSidebar() {
    const fallbackHTML = `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h3><i class="fas fa-sitemap"></i> Menu Principale</h3>
            </div>
            <div class="sidebar-menu">
                <div class="menu-section">
                    <h4><i class="fas fa-user"></i> Gestione Personale</h4>
                    <a href="index.html" class="menu-item">
                        <i class="fas fa-user-circle"></i>
                        <span>Profilo</span>
                    </a>
                </div>
                <div class="menu-section">
                    <h4><i class="fas fa-cogs"></i> Amministrazione</h4>
                    <a href="index.html#settings" class="menu-item">
                        <i class="fas fa-cog"></i>
                        <span>Impostazioni</span>
                    </a>
                    <a href="index.html#users" class="menu-item">
                        <i class="fas fa-users-cog"></i>
                        <span>Utenti</span>
                    </a>
                    <a href="index.html#roles" class="menu-item">
                        <i class="fas fa-user-tag"></i>
                        <span>Ruoli</span>
                    </a>
                    </div>
                    <div class="menu-section">
                    <h4><i class="fas fa-cogs"></i> Operatività</h4>                    
                    <a href="cantieri.html" class="menu-item">
                        <i class="fas fa-hard-hat"></i>
                        <span>Cantieri</span>
                    </a>
                    <a href="lavoro.html" class="menu-item" id="lavoroLink">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Giornate Lavorative</span>
                    </a>     
                    <a href="fatture.html" class="menu-item" id="fattureLink">
                        <i class="fas fa-file-invoice"></i>
                        <span>Fatture</span>
                    </a>
                    <a href="preventivi.html" class="menu-item" id="preventiviLink">
                        <i class="fas fa-file-contract"></i>
                        <span>Preventivi</span>
                    </a>               
                    <a href="fornitori.html" class="menu-item" id="fornitori-link">
                        <i class="fas fa-truck"></i>
                        <span>Fornitori</span>
                    </a>    
                </div>
            </div>
        </aside>
    `;
    
    const container = document.createElement('div');
    container.id = 'sidebar-container';
    container.innerHTML = fallbackHTML;
    
    const mainContainer = document.querySelector('.main-container');
    if (mainContainer) {
        mainContainer.insertBefore(container, mainContainer.firstChild);
    }
    
    initializeSidebar();
}

// Inizializza la sidebar dopo il caricamento
function initializeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    
    // Gestione toggle menu su mobile
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('show');
        });
    }
    
    // Chiudi sidebar su mobile quando si clicca fuori
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 992 && sidebar && !sidebar.contains(e.target) && 
            menuToggle && !menuToggle.contains(e.target) && sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
        }
    });
    
    // Highlight del menu attivo
    highlightActiveMenuItem();
    
    // Gestione hash nella URL (per index.html)
    if (window.location.pathname.includes('index.html')) {
        setupIndexHashNavigation();
    }
}

// Evidenzia il menu item attivo in base alla pagina corrente
function highlightActiveMenuItem() {
    const currentPage = window.location.pathname;
    const currentHash = window.location.hash;
    
    // Rimuovi tutti gli active
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Per cantieri.html
    if (currentPage.includes('cantieri.html')) {
        const cantieriLink = document.getElementById('cantieriLink');
        if (cantieriLink) cantieriLink.classList.add('active');
        return;
    }
    
    // Per index.html con hash
    if (currentPage.includes('index.html') || currentPage === '' || currentPage.endsWith('/')) {
        let activeLink = document.getElementById('profileLink'); // default
        
        if (currentHash) {
            switch(currentHash) {
                case '#settings':
                    activeLink = document.getElementById('settingsLink');
                    break;
                case '#users':
                    activeLink = document.getElementById('usersLink');
                    break;
                case '#roles':
                    activeLink = document.getElementById('rolesLink');
                    break;
            }
        }
        
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
}

// Setup navigazione con hash per index.html
function setupIndexHashNavigation() {
    // Gestione click sui link hash
    document.querySelectorAll('.menu-item[href*="#"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const hash = link.getAttribute('href').split('#')[1];
            if (hash) {
                window.location.hash = hash;
                highlightActiveMenuItem();
                scrollToSection(hash);
            }
        });
    });
    
    // Gestione cambio hash
    window.addEventListener('hashchange', () => {
        highlightActiveMenuItem();
        scrollToSection(window.location.hash.substring(1));
    });
    
    // Scroll alla sezione iniziale se presente hash
    if (window.location.hash) {
        setTimeout(() => {
            const sectionId = window.location.hash.substring(1);
            scrollToSection(sectionId);
        }, 100);
    }
}

// Scroll alla sezione specifica
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Carica la sidebar quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSidebar);
} else {
    loadSidebar();
}