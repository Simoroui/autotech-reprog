// Fonction pour créer l'effet matrice
function createMatrixEffect() {
    const matrixContainer = document.querySelector('.matrix-bg');
    if (!matrixContainer) return;
    
    // Vider le conteneur
    matrixContainer.innerHTML = '';
    
    // Caractères pour la matrice
    const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+<>?{}[]~`|";
    
    // Créer les colonnes de la matrice
    const columnCount = Math.floor(window.innerWidth / 20); // Une colonne tous les ~20px
    
    for (let i = 0; i < columnCount; i++) {
        const column = document.createElement('div');
        column.className = 'matrix-column';
        
        // Position aléatoire horizontale
        column.style.left = (i * 20 + Math.random() * 10) + 'px';
        
        // Vitesse aléatoire pour la chute
        const fallDuration = (Math.random() * 5 + 5) + 's'; // Entre 5 et 10 secondes
        column.style.setProperty('--fall-duration', fallDuration);
        
        // Délai aléatoire pour le début de l'animation
        column.style.animationDelay = (Math.random() * 5) + 's';
        
        // Nombre aléatoire de caractères dans la colonne
        const charCount = Math.floor(Math.random() * 20 + 10); // Entre 10 et 30 caractères
        
        // Créer les caractères de la colonne
        for (let j = 0; j < charCount; j++) {
            const charSpan = document.createElement('span');
            const randomChar = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
            charSpan.textContent = randomChar;
            
            // Animation d'opacité indépendante pour chaque caractère
            const glowDuration = (Math.random() * 2 + 1) + 's';
            const glowDelay = (Math.random() * 2) + 's';
            
            charSpan.style.setProperty('--glow-duration', glowDuration);
            charSpan.style.setProperty('--glow-delay', glowDelay);
            
            column.appendChild(charSpan);
        }
        
        matrixContainer.appendChild(column);
    }
    
    // Changer les caractères périodiquement pour l'effet "vivant"
    setInterval(() => {
        const spans = document.querySelectorAll('.matrix-column span');
        const randomIndex = Math.floor(Math.random() * spans.length);
        if (spans[randomIndex]) {
            const randomChar = matrixChars.charAt(Math.floor(Math.random() * matrixChars.length));
            spans[randomIndex].textContent = randomChar;
        }
    }, 100);
}

// Fonction pour animer la ligne de scan
function createScanLine() {
    const scanLine = document.querySelector('.scan-line');
    if (!scanLine) return;
    
    // Réinitialiser l'animation régulièrement pour éviter les bugs
    setInterval(() => {
        scanLine.style.animation = 'none';
        scanLine.offsetHeight; // Force reflow
        scanLine.style.animation = 'scan 3s linear infinite';
    }, 3000);
}

// Fonction pour gérer l'écran de démarrage (splash screen)
function initializeSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    const loadingBar = document.querySelector('.loading-bar');
    const pageWrapper = document.querySelector('.page-wrapper');
    
    if (!splashScreen || !loadingBar || !pageWrapper) {
        console.error('Éléments du splash screen non trouvés');
        return;
    }
    
    // Créer l'effet matrice
    createMatrixEffect();
    
    // Créer l'effet de scan
    createScanLine();
    
    // Gestion du redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        // Recréer la matrice pour qu'elle s'adapte à la nouvelle taille
        createMatrixEffect();
    });
    
    // Masquer la page principale pendant le chargement
    pageWrapper.style.visibility = 'hidden';
    
    // Liste des éléments à précharger
    const imagesToLoad = [
        'images/logo-min.png',
        'images/Logo-H.png',
        'images/apropos.jpg',
        'images-optimized/hero-bg.jpg'
    ];
    
    // Liste des ressources CSS et JS
    const resourcesToLoad = [
        'css/style.css',
        'css/header.css',
        'css/footer.css',
        'js/header.js',
        'js/vehicle-selector.js',
        'js/slideshow.js'
    ];
    
    // Combiner toutes les ressources
    const allResources = [...imagesToLoad, ...resourcesToLoad];
    let loadedCount = 0;
    
    // Fonction pour mettre à jour la barre de progression
    function updateProgressBar() {
        const progress = (loadedCount / allResources.length) * 100;
        loadingBar.style.width = `${progress}%`;
        
        if (loadedCount === allResources.length) {
            // Toutes les ressources sont chargées
            setTimeout(() => {
                // Afficher la page principale
                pageWrapper.style.visibility = 'visible';
                
                // Masquer le splash screen avec une transition
                splashScreen.classList.add('hidden');
                
                // Retirer complètement le splash screen après la transition
                setTimeout(() => {
                    splashScreen.style.display = 'none';
                }, 500);
            }, 800); // Petit délai pour voir la barre à 100%
        }
    }
    
    // Précharger les images
    imagesToLoad.forEach(src => {
        const img = new Image();
        img.onload = () => {
            loadedCount++;
            updateProgressBar();
        };
        img.onerror = () => {
            console.error(`Erreur de chargement de l'image: ${src}`);
            loadedCount++;
            updateProgressBar();
        };
        img.src = src;
    });
    
    // Simuler le chargement des autres ressources
    resourcesToLoad.forEach(resource => {
        // Simuler différents temps de chargement pour les ressources
        setTimeout(() => {
            loadedCount++;
            updateProgressBar();
        }, Math.random() * 1500 + 500);
    });
    
    // Si toutes les ressources ne se chargent pas dans un délai raisonnable,
    // forcer l'affichage du site après 8 secondes
    setTimeout(() => {
        if (loadedCount < allResources.length) {
            console.warn('Chargement forcé après délai d\'attente');
            loadedCount = allResources.length;
            updateProgressBar();
        }
    }, 8000);
}

// Fonction pour le diaporama dans la section À propos
function initializeSlideshow() {
    console.log('Initialisation du diaporama...');
    const slides = document.querySelectorAll('.slideshow-slide .about-image');
    console.log('Nombre de slides trouvées:', slides.length);
    
    if (slides.length === 0) {
        console.log('Aucune slide trouvée');
        return;
    }
    
    let currentSlide = 0;
    
    function showNextSlide() {
        // Masquer la slide active actuelle
        slides[currentSlide].classList.remove('active');
        
        // Passer à la slide suivante (ou revenir à la première)
        currentSlide = (currentSlide + 1) % slides.length;
        
        // Afficher la nouvelle slide active
        slides[currentSlide].classList.add('active');
        console.log('Changement vers la slide', currentSlide);
    }
    
    // Changer de slide toutes les 5 secondes
    setInterval(showNextSlide, 5000);
}

// Exécuter les fonctions une fois que le DOM est chargé
document.addEventListener('DOMContentLoaded', function() {
    // Initialiser le splash screen en premier
    initializeSplashScreen();
    
    // Initialiser le diaporama (sera exécuté même pendant que le splash screen est affiché)
    initializeSlideshow();
    
    // ... autres fonctions d'initialisation existantes ...
}); 