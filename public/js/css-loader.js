// js/css-loader.js
(function() {
    'use strict';
    
    function loadCSS(href, id) {
        return new Promise((resolve, reject) => {
            // Rimuovi CSS duplicati con lo stesso ID
            const existing = document.getElementById(id);
            if (existing) existing.remove();
            
            // Crea nuovo link
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = href;
            link.type = 'text/css';
            
            link.onload = () => {
                console.log(`CSS caricato: ${href}`);
                resolve(link);
            };
            
            link.onerror = (error) => {
                console.error(`Errore caricamento CSS: ${href}`, error);
                reject(error);
            };
            
            // Aggiungi alla head
            document.head.appendChild(link);
        });
    }
    
    function waitForCSS(selector, property, expectedValue, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            function check() {
                const element = document.querySelector(selector);
                if (element) {
                    const computed = getComputedStyle(element)[property];
                    if (computed === expectedValue) {
                        resolve(true);
                        return;
                    }
                }
                
                if (Date.now() - startTime > timeout) {
                    reject(new Error(`Timeout: ${property} non è diventato ${expectedValue}`));
                    return;
                }
                
                setTimeout(check, 100);
            }
            
            check();
        });
    }
    
    // Carica i CSS
    window.loadAppCSS = async function() {
        try {
            console.log('Inizio caricamento CSS...');
            
            // Carica il CSS principale
            await loadCSS('styles/styles.css', 'main-styles');
            
            // Attendi che sia applicato
            await waitForCSS('body', 'fontFamily', '"Segoe UI", system-ui, -apple-system, sans-serif');
            
            // Crea un elemento di test
            const testEl = document.createElement('div');
            testEl.className = 'css-test-element';
            testEl.style.cssText = 'position:absolute;left:-9999px;';
            testEl.textContent = 'Test CSS';
            document.body.appendChild(testEl);
            
            // Verifica che il CSS sia applicato
            const style = getComputedStyle(testEl);
            console.log('CSS verificato:', {
                fontFamily: style.fontFamily,
                display: style.display
            });
            
            // Mostra notifica
            showCSSNotification('CSS caricato correttamente', 'success');
            
        } catch (error) {
            console.error('Errore caricamento CSS:', error);
            showCSSNotification('Errore caricamento CSS', 'error');
            
            // Fallback: carica CSS alternativo
            loadFallbackCSS();
        }
    };
    
    function showCSSNotification(message, type) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#38a169' : '#e53e3e'};
            color: white;
            border-radius: 6px;
            z-index: 10000;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    function loadFallbackCSS() {
        const fallbackCSS = `
            body { font-family: 'Segoe UI', sans-serif; background: #f8f9fa; }
            .page-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .status-badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
            .status-in-progress { background: #bee3f8; color: #2c5282; }
        `;
        
        const style = document.createElement('style');
        style.textContent = fallbackCSS;
        style.id = 'fallback-styles';
        document.head.appendChild(style);
    }
    
    // Avvia il caricamento quando il DOM è pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', window.loadAppCSS);
    } else {
        window.loadAppCSS();
    }
})();