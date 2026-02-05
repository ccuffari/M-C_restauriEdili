// loadSidebar.js
// Script per caricare dinamicamente la sidebar

async function loadSidebar() {
    try {
        // Carica il contenuto della sidebar
        const response = await fetch('sidebar.html');
        if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status}`);
        }
        
        const sidebarHTML = await response.text();
        
        // Trova il contenitore principale
        const mainContainer = document.querySelector('.main-container');
        if (mainContainer) {
            // Inserisci la sidebar all'inizio del main container
            mainContainer.insertAdjacentHTML('afterbegin', sidebarHTML);
            console.log('Sidebar caricata con successo');
            
            // Inizializza la sidebar
            initializeSidebar();
        }
    } catch (error) {
        console.error('Errore nel caricamento della sidebar:', error);
        
        // Fallback: crea una sidebar di base
        createFallbackSidebar();
    }
}

function createFallbackSidebar() {
    const mainContainer = document.querySelector('.main-container');
    if (!mainContainer) return;
    
    const fallbackSidebar = `
        <div class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <h3><i class="fas fa-hard-hat"></i> Menu</h3>
            </div>
            <div class="sidebar-menu">
                <div class="menu-section">
                    <h4><i class="fas fa-home"></i> Navigazione</h4>
                    <a href="index.html" class="menu-item">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </a>
                    <a href="cantieri.html" class="menu-item active">
                        <i class="fas fa-hard-hat"></i>
                        <span>Cantieri</span>
                    </a>
                    <a href="lavoro.html" class="menu-item">
                        <i class="fas fa-calendar-alt"></i>
                        <span>Lavori</span>
                    </a>
                </div>
                <div class="sidebar-footer">
                    <p class="small-text">
                        <i class="fas fa-info-circle"></i>
                        <span>Sidebar fallback</span>
                    </p>
                </div>
            </div>
        </div>
        <div class="sidebar-overlay" id="sidebarOverlay"></div>
    `;
    
    mainContainer.insertAdjacentHTML('afterbegin', fallbackSidebar);
    initializeSidebar();
}

function initializeSidebar() {
    // La logica di inizializzazione è ora nel file sidebar.html
    // Questa funzione è mantenuta per compatibilità
    console.log('Sidebar inizializzata');
}

// Carica la sidebar quando il DOM è pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSidebar);
} else {
    loadSidebar();
}