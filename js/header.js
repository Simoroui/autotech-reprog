// Message initial pour confirmer que le script est chargé
console.log('%c=== Initialisation du Menu Hamburger ===', 'background: #222; color: #bada55; padding: 5px;');

document.addEventListener('DOMContentLoaded', () => {
    console.log('Menu mobile - Initialisation...');
    
    const hamburger = document.querySelector('.hamburger-menu');
    const navContainer = document.querySelector('.nav-container');
    const body = document.body;
    const headerSocial = document.querySelector('.header-social');

    // Fonction pour fermer le menu
    const closeMenu = () => {
        hamburger.classList.remove('active');
        navContainer.classList.remove('active');
        body.classList.remove('menu-open');
        if (headerSocial) headerSocial.style.display = 'flex';
        console.log('Menu fermé');
    };

    // Fonction pour vérifier si nous sommes sur la page d'accueil
    const isHomePage = () => {
        const path = window.location.pathname;
        return path.endsWith('index.html') || 
               path.endsWith('/') || 
               path.endsWith('/autotech-reprog/') || 
               path.endsWith('/autotech-reprog/index.html');
    };

    // Fonction pour mettre à jour le lien actif
    const updateActiveLink = () => {
        const path = window.location.pathname;
        const currentPage = path.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links > li > a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (isHomePage() && href === '#')) {
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
            if (headerSocial) {
                headerSocial.style.display = isMenuOpen ? 'flex' : 'none';
            }
            console.log(isMenuOpen ? 'Menu ouvert' : 'Menu fermé');
        });

        // Gestionnaire pour tous les liens du menu
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (window.innerWidth <= 768) {
                    const href = link.getAttribute('href');
                    const isAnchorLink = href.includes('#');
                    
                    if (isHomePage() && isAnchorLink) {
                        // Si on est sur la page d'accueil et que c'est un lien d'ancrage
                        closeMenu();
                        // Ajouter un petit délai pour le défilement
                        setTimeout(() => {
                            const targetId = href.split('#')[1];
                            const targetElement = document.getElementById(targetId);
                            if (targetElement) {
                                const headerHeight = document.querySelector('.header').offsetHeight;
                                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                                window.scrollTo({
                                    top: targetPosition,
                                    behavior: 'smooth'
                                });
                            }
                        }, 300);
                    } else if (!isAnchorLink || !isHomePage()) {
                        // Si ce n'est pas un lien d'ancrage ou si on n'est pas sur la page d'accueil
                        closeMenu();
                    }
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