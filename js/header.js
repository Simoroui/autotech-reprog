document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const navContainer = document.querySelector('.nav-container');
    const body = document.body;
    
    hamburger.addEventListener('click', () => {
        navContainer.classList.toggle('active');
        body.classList.toggle('menu-open');
    });

    // Fermer le menu au clic sur un lien
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navContainer.classList.remove('active');
            body.classList.remove('menu-open');
        });
    });

    // Fermer le menu au clic en dehors
    document.addEventListener('click', (e) => {
        if (!navContainer.contains(e.target) && 
            !hamburger.contains(e.target) && 
            navContainer.classList.contains('active')) {
            navContainer.classList.remove('active');
            body.classList.remove('menu-open');
        }
    });
}); 