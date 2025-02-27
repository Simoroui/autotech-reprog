// Message initial pour confirmer que le script est chargé
console.log('%c=== Initialisation du Menu Hamburger ===', 'background: #222; color: #bada55; padding: 5px;');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Menu mobile - Initialisation...');
    
    const hamburger = document.querySelector('.hamburger-menu');
    const navContainer = document.querySelector('.nav-container');
    const body = document.body;
    const reprogLink = document.querySelector('.has-submenu > a[href="#boost"]');
    const headerSocial = document.querySelector('.header-social');

    // Fonction pour fermer le menu
    const closeMenu = () => {
        hamburger.classList.remove('active');
        navContainer.classList.remove('active');
        body.classList.remove('menu-open');
        if (headerSocial) headerSocial.style.display = 'flex';
        console.log('Menu fermé');
    };

    // Fonction pour mettre à jour le lien actif
    const updateActiveLink = () => {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links > li > a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === 'index.html' && href === '#')) {
                link.parentElement.classList.add('current-page');
            } else {
                link.parentElement.classList.remove('current-page');
            }
        });
    };

    if (hamburger && navContainer) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navContainer.classList.toggle('active');
            body.classList.toggle('menu-open');

            const isMenuOpen = navContainer.classList.contains('active');
            console.log(isMenuOpen ? 'Menu ouvert' : 'Menu fermé');
        });

        // Gestionnaire pour tous les liens du menu principal
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    const isSubmenuToggle = link.parentElement.classList.contains('has-submenu');
                    const href = link.getAttribute('href');
                    const isCurrentPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
                    const isAnchorLink = href.includes('#');
                    
                    if (isSubmenuToggle) {
                        e.preventDefault();
                        const parent = link.parentElement;
                        parent.classList.toggle('active');
                        
                        // Changer le texte du lien Reprogrammation
                        if (link === reprogLink) {
                            link.textContent = parent.classList.contains('active') ? 'Reprog.' : 'Reprogrammation';
                            // Gérer l'affichage des icônes sociales
                            if (headerSocial) {
                                headerSocial.style.display = parent.classList.contains('active') ? 'none' : 'flex';
                            }
                        }
                    } else if (isCurrentPage && isAnchorLink) {
                        // Si on est sur index.html et que c'est un lien d'ancrage, fermer le menu
                        closeMenu();
                    } else if (!isAnchorLink || !isCurrentPage) {
                        // Si ce n'est pas un lien d'ancrage ou si on n'est pas sur la page d'accueil
                        closeMenu();
                    }
                }
            });
        });

        // Gestionnaire spécifique pour les liens du sous-menu
        document.querySelectorAll('.submenu a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    closeMenu();
                }
            });
        });
    }

    // Mettre à jour le lien actif au chargement
    updateActiveLink();

    // Mettre à jour le lien du logo
    const logoLink = document.querySelector('.logo a');
    if (logoLink) {
        const isGitHubPages = window.location.hostname === 'simoroui.github.io';
        logoLink.href = isGitHubPages 
            ? 'https://simoroui.github.io/autotech-reprog/'
            : '/';
    }

    console.log('[Menu] Initialisation terminée');
}); 