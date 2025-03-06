// Gestion du diaporama
document.addEventListener('DOMContentLoaded', () => {
    const slideshowContainers = document.querySelectorAll('.slideshow-container');
    
    slideshowContainers.forEach(container => {
        const slides = container.querySelectorAll('.slide');
        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');
        
        if (slides.length === 0) return;
        
        let slideIndex = 0;
        let slideTimer;
        
        // Fonction pour afficher une diapositive spécifique
        function showSlide(index) {
            // Masquer toutes les diapositives
            slides.forEach(slide => {
                slide.style.opacity = '0';
            });
            
            // Gérer l'index circulaire
            if (index >= slides.length) {
                slideIndex = 0;
            } else if (index < 0) {
                slideIndex = slides.length - 1;
            } else {
                slideIndex = index;
            }
            
            // Afficher la diapositive actuelle
            slides[slideIndex].style.opacity = '1';
        }
        
        // Fonction pour passer à la diapositive suivante
        function nextSlide() {
            showSlide(slideIndex + 1);
            resetTimer();
        }
        
        // Fonction pour passer à la diapositive précédente
        function prevSlide() {
            showSlide(slideIndex - 1);
            resetTimer();
        }
        
        // Fonction pour réinitialiser le minuteur
        function resetTimer() {
            clearTimeout(slideTimer);
            slideTimer = setTimeout(nextSlide, 5000); // Changer de diapositive toutes les 5 secondes
        }
        
        // Ajouter des écouteurs d'événements pour les boutons
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }
        
        // Démarrer le diaporama
        showSlide(slideIndex);
        resetTimer();
    });
}); 