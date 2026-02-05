// js/debug.js
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DEBUG MODE ATTIVATO ===');
    
    // 1. Controlla se il CSS è collegato
    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    console.log('CSS trovati:', cssLinks.length);
    cssLinks.forEach(link => {
        console.log('  -', link.href);
        
        // Verifica se il file esiste
        fetch(link.href)
            .then(response => {
                if (response.ok) {
                    console.log(`    ✓ ${link.href} - OK (${response.status})`);
                } else {
                    console.log(`    ✗ ${link.href} - Errore (${response.status})`);
                }
            })
            .catch(error => {
                console.log(`    ✗ ${link.href} - ${error.message}`);
            });
    });
    
    // 2. Controlla se il CSS è applicato
    setTimeout(() => {
        const bodyStyle = getComputedStyle(document.body);
        console.log('\nStili applicati al body:');
        console.log('  - Background:', bodyStyle.backgroundColor);
        console.log('  - Font-family:', bodyStyle.fontFamily);
        console.log('  - Font-size:', bodyStyle.fontSize);
        
        // 3. Testa una classe specifica
        const testDiv = document.createElement('div');
        testDiv.className = 'status-badge status-in-progress';
        testDiv.textContent = 'Test CSS';
        testDiv.style.position = 'fixed';
        testDiv.style.top = '10px';
        testDiv.style.right = '10px';
        testDiv.style.zIndex = '9999';
        document.body.appendChild(testDiv);
        
        const testStyle = getComputedStyle(testDiv);
        console.log('\nTest classe .status-badge:');
        console.log('  - Display:', testStyle.display);
        console.log('  - Background:', testStyle.backgroundColor);
        console.log('  - Color:', testStyle.color);
        
        // 4. Forza il reload del CSS se non viene applicato
        if (testStyle.display !== 'inline-flex') {
            console.warn('⚠ CSS non applicato correttamente. Forzando reload...');
            reloadCSS();
        }
    }, 1000);
    
    // Funzione per forzare il reload del CSS
    function reloadCSS() {
        cssLinks.forEach(link => {
            if (link.href.includes('styles.css')) {
                const newHref = link.href.replace(/(\?v=)[^\?]+/, '$1' + Date.now());
                link.href = newHref;
                console.log('CSS ricaricato con nuovo timestamp');
            }
        });
    }
});