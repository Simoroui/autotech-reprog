// Test simple pour vérifier que le script est chargé
console.log('Script chargé');

// Fonction pour tester le chargement du fichier
async function testFileAccess() {
    try {
        const response = await fetch('data/marques.csv');
        console.log('Statut de la réponse:', response.status);
        const text = await response.text();
        console.log('Contenu du fichier (premiers 100 caractères):', text.substring(0, 100));
        return text;
    } catch (error) {
        console.error('Erreur d\'accès au fichier:', error);
        return null;
    }
}

// Fonction pour parser le contenu
function parseCSV(text) {
    const lines = text.split('\n');
    console.log('Nombre de lignes:', lines.length);
    
    // Afficher les 3 premières lignes pour vérification
    console.log('Premières lignes:');
    lines.slice(0, 3).forEach((line, index) => {
        console.log(`Ligne ${index}:`, line);
    });
    
    return lines;
}

// Fonction pour extraire les marques
function extractBrands(lines) {
    const brands = {
        cars: new Set(),
        motorcycles: new Set(),
        jetski: new Set(),
        quad: new Set(),
        trucks: new Set(),
        agricultural: new Set()
    };
    
    // Mapping des types avec majuscules
    const typeMapping = {
        'VOITURE': 'cars',
        'Voiture': 'cars',
        'MOTO': 'motorcycles',
        'Moto': 'motorcycles',
        'JETSKI': 'jetski',
        'Jetski': 'jetski',
        'QUAD': 'quad',
        'Quad': 'quad',
        'CAMION': 'trucks',
        'Camion': 'trucks',
        'AGRICOLE & ENGIN': 'agricultural',
        'Agricole & Engin': 'agricultural',
        'agricole & engin': 'agricultural'
    };
    
    // Ignorer la première ligne (en-tête)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',');
        const brand = columns[0].trim();
        const rawType = columns[columns.length - 1].trim(); // Ne pas convertir en minuscules
        
        console.log('------------------------');
        console.log(`Ligne ${i}:`);
        console.log(`Marque: "${brand}"`);
        console.log(`Type brut: "${rawType}"`);
        
        const type = typeMapping[rawType];
        if (type && brands[type]) {
            brands[type].add(brand);
            console.log(`✅ Ajout de ${brand} aux ${type}`);
        } else {
            console.warn(`⚠️ Type de véhicule non reconnu: "${rawType}" pour ${brand}`);
        }
    }
    
    // Log du contenu final des Sets
    Object.entries(brands).forEach(([key, set]) => {
        console.log(`${key}: ${Array.from(set).join(', ')}`);
    });
    
    // Convertir les Sets en Arrays avec les chemins de logos
    const result = {};
    Object.entries(brands).forEach(([key, set]) => {
        result[key] = Array.from(set).map(name => ({
            name: name,
            logo: `images/logos/${name}.png`
        }));
    });
    
    return result;
}

// Fonction pour obtenir le bon chemin des logos selon l'environnement
function getLogoPath(brand) {
    const isGitHubPages = window.location.hostname === 'simoroui.github.io';
    return isGitHubPages 
        ? `/autotech-reprog/images/logos/${brand}.png`
        : `images/logos/${brand}.png`;
}

// Fonction pour afficher les marques
function displayBrands(brands, type) {
    const grid = document.getElementById(`${type}-grid`);
    if (!grid) {
        console.error('Grid non trouvée:', type);
        return;
    }
    
    grid.innerHTML = '';
    if (brands[type]) {
        brands[type].forEach((brand, index) => {
            const div = document.createElement('div');
            div.className = 'brand-item';
            div.style.setProperty('--item-index', index);
            
            div.addEventListener('click', () => handleBrandSelection(brand.name, type));
            
            const img = document.createElement('img');
            img.src = getLogoPath(brand.name);
            img.alt = brand.name;
            img.className = 'brand-logo';
            img.loading = 'lazy';
            img.decoding = 'async';
            img.sizes = '(max-width: 768px) 100px, 150px';
            img.style.padding = '3px';
            img.style.borderRadius = '2px';
            
            img.onerror = function() {
                console.error(`❌ Erreur de chargement pour ${brand.name}:`, this.src);
                this.style.display = 'none';
            };
            
            img.onload = function() {
                console.log(`✅ Logo chargé avec succès pour ${brand.name}`);
                this.style.display = 'block';
            };
            
            const span = document.createElement('span');
            span.className = 'brand-name';
            span.textContent = brand.name;
            
            div.appendChild(img);
            div.appendChild(span);
            grid.appendChild(div);
        });
    }
}

// Fonction pour afficher toutes les marques
function displayAllBrands(brands) {
    displayBrands(brands, 'cars');
    displayBrands(brands, 'motorcycles');
    displayBrands(brands, 'jetski');
    displayBrands(brands, 'quad');
    displayBrands(brands, 'trucks');
    displayBrands(brands, 'agricultural');
}

// Fonction pour gérer le changement d'onglet
function handleTabClick(event, brands) {
    const type = event.target.closest('.tab-button').dataset.type;
    
    // Mettre à jour les classes active des onglets
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.closest('.tab-button').classList.add('active');
    
    // Cacher toutes les grilles
    document.querySelectorAll('.brands-grid').forEach(grid => {
        grid.classList.remove('active');
    });
    
    // Afficher la grille correspondante et ses marques
    const targetGrid = document.getElementById(`${type}-grid`);
    if (targetGrid) {
        targetGrid.classList.add('active');
        // Afficher les marques uniquement pour le type sélectionné
        displayBrands(brands, type);

        // Calculer la position de défilement
        const vehicleTabs = document.querySelector('.vehicle-tabs');
        const tabsHeight = vehicleTabs.offsetHeight;
        const tabsOffset = vehicleTabs.getBoundingClientRect().top + window.pageYOffset;
        const scrollTo = tabsOffset - tabsHeight - 20; // 20px de marge

        // Défilement fluide
        window.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
        });
    }
}

// Ajouter au début du fichier
function updateBreadcrumb(selections = {}) {
    let breadcrumb = document.querySelector('.selection-breadcrumb');
    if (!breadcrumb) {
        breadcrumb = document.createElement('div');
        breadcrumb.className = 'selection-breadcrumb';
        document.querySelector('.section-container').insertBefore(breadcrumb, document.querySelector('.vehicle-tabs'));
    }

    const items = [];
    if (selections.type) items.push(selections.type);
    if (selections.brand) items.push(selections.brand);
    if (selections.model) items.push(selections.model);
    if (selections.version) items.push(selections.version);
    if (selections.engine) items.push(selections.engine);

    breadcrumb.innerHTML = items.map((item, index) => `
        <span class="breadcrumb-item">${item}</span>
        ${index < items.length - 1 ? '<span class="breadcrumb-separator">></span>' : ''}
    `).join('');
}

// Ajouter une variable pour suivre l'état de la sélection
let currentSelection = {
    brand: null,
    model: null,
    version: null,
    type: null
};

// Modifier la fonction handleBrandSelection pour sauvegarder l'état
function handleBrandSelection(brand, type) {
    currentSelection = {
        brand: brand,
        model: null,
        version: null,
        type: type
    };

    // Mettre à jour le breadcrumb
    updateBreadcrumb({ type, brand });

    // Cacher toutes les grilles de marques
    document.querySelectorAll('.brands-grid').forEach(grid => {
        grid.style.display = 'none';
        grid.classList.remove('active');
    });
    
    // Cacher les onglets
    document.querySelector('.vehicle-tabs').style.display = 'none';
    
    // Récupérer tous les modèles pour cette marque
    const models = new Set();
    const lines = parseCSV(csvContent);
    
    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns[0].trim() === brand) {
            models.add(columns[1].trim());
        }
    }

    // Créer ou mettre à jour la section des détails
    let detailsSection = document.querySelector('.vehicle-details');
    if (!detailsSection) {
        detailsSection = document.createElement('div');
        detailsSection.className = 'vehicle-details';
        document.querySelector('.section-container').appendChild(detailsSection);
    }

    // S'assurer que la section des détails est visible
    detailsSection.style.display = 'block';

    // Mettre à jour le contenu
    detailsSection.innerHTML = `
        <button class="back-button">Retour</button>
        <div class="selection-steps">
            <div class="step active">
                <div class="step-title">Marque sélectionnée</div>
                <div class="step-content">
                    <div class="selection-item selected" data-scroll-to="model">
                        <img src="${getLogoPath(brand)}" alt="${brand}" class="brand-logo" 
                             onerror="this.onerror=null; this.style.display='none';"
                             onload="this.style.display='block';">
                        <span class="brand-name">${brand}</span>
                    </div>
                </div>
            </div>
            <div class="step active" id="model-step">
                <div class="step-title">Modèle</div>
                <div class="step-content">
                    ${Array.from(models).map(model => `
                        <div class="selection-item" data-model="${model}">${model}</div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Ajouter les écouteurs d'événements
    addEventListeners(detailsSection, brand, type, models);

    // Scroll vers le haut de la section des détails
    setTimeout(() => {
        const headerHeight = document.querySelector('.header').offsetHeight || 0;
        const detailsTop = detailsSection.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
            top: detailsTop - headerHeight - 20, // 20px de marge
            behavior: 'smooth'
        });
    }, 100);
}

// Fonction séparée pour ajouter les écouteurs d'événements
function addEventListeners(detailsSection, brand, type, models) {
    // Écouteur pour le scroll
    const selectedBrand = detailsSection.querySelector('.selection-item.selected');
    selectedBrand.addEventListener('click', () => {
        const modelStep = document.getElementById('model-step');
        const headerHeight = document.querySelector('.header').offsetHeight;
        
        const windowHeight = window.innerHeight;
        const modelStepHeight = modelStep.offsetHeight;
        const modelStepTop = modelStep.getBoundingClientRect().top + window.pageYOffset;
        
        const scrollPosition = modelStepTop - (windowHeight - modelStepHeight) / 2;
        
        window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    });

    // Écouteur pour le bouton retour
    detailsSection.querySelector('.back-button').addEventListener('click', () => {
        document.querySelectorAll('.brands-grid').forEach(grid => {
            grid.style.display = '';
            grid.classList.add('active');
        });
        document.querySelector('.vehicle-tabs').style.display = '';
        detailsSection.style.display = 'none';
    });

    // Écouteurs pour les modèles
    detailsSection.querySelectorAll('.selection-item[data-model]').forEach(item => {
        item.addEventListener('click', () => handleModelSelection(brand, type, item.dataset.model));
    });
}

// Fonction utilitaire pour le défilement mobile
function scrollToNextStepOnMobile(stepElement) {
    // Vérifier si on est sur mobile (largeur < 768px)
    if (window.innerWidth <= 768) {
        const windowHeight = window.innerHeight;
        const elementHeight = stepElement.offsetHeight;
        const elementTop = stepElement.getBoundingClientRect().top + window.pageYOffset;
        
        // Calculer la position pour centrer l'élément
        const scrollTo = elementTop - (windowHeight - elementHeight) / 2;
        
        window.scrollTo({
            top: scrollTo,
            behavior: 'smooth'
        });
    }
}

// Modifier la fonction handleModelSelection
function handleModelSelection(brand, type, model) {
    currentSelection.model = model;
    
    // Mettre à jour le style de l'élément du modèle sélectionné
    document.querySelectorAll('.selection-item[data-model]').forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.model === model) {
            item.classList.add('selected');
        }
    });

    // Récupérer toutes les années/versions pour ce modèle
    const versions = new Set();
    const lines = parseCSV(csvContent);
    
    // Collecter toutes les versions pour ce modèle
    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns[0].trim() === brand && columns[1].trim() === model) {
            versions.add(columns[2].trim());
        }
    }

    // Créer ou mettre à jour la colonne des versions
    let versionStep = document.querySelector('.step[data-step="version"]');
    if (!versionStep) {
        versionStep = document.createElement('div');
        versionStep.className = 'step active';
        versionStep.setAttribute('data-step', 'version');
        document.querySelector('.selection-steps').appendChild(versionStep);
    }

    // Mettre à jour le contenu de la colonne des versions
    versionStep.innerHTML = `
        <div class="step-title">Version</div>
        <div class="step-content">
            ${Array.from(versions).map(version => `
                <div class="selection-item" data-version="${version}">${version}</div>
            `).join('')}
        </div>
    `;

    // Ajouter les écouteurs pour les versions
    versionStep.querySelectorAll('.selection-item[data-version]').forEach(item => {
        item.addEventListener('click', () => {
            handleVersionSelection(brand, type, model, item.dataset.version);
        });
    });

    // Ajouter le défilement sur mobile
    scrollToNextStepOnMobile(versionStep);

    // Mettre à jour l'URL et le breadcrumb
    const url = `/reprogrammation/${type}/${brand.toLowerCase().replace(/\s+/g, '-')}/${model.toLowerCase().replace(/\s+/g, '-')}`;
    window.history.pushState({ type, brand, model }, '', url);
    updateBreadcrumb({ type, brand, model });
}

// Modifier la fonction handleVersionSelection
function handleVersionSelection(brand, type, model, version) {
    currentSelection.version = version;
    
    // Mettre à jour le style de la version sélectionnée
    document.querySelectorAll('.selection-item[data-version]').forEach(item => {
        item.classList.remove('selected');
        if (item.dataset.version === version) {
            item.classList.add('selected');
        }
    });

    // Revenir à l'ancienne version de l'URL
    const url = `/autotech-reprog/reprogrammation/${type}/${brand.toLowerCase().replace(/\s+/g, '-')}/${model.toLowerCase().replace(/\s+/g, '-')}/${version.toLowerCase().replace(/\s+/g, '-')}`;
    
    window.history.pushState({ type, brand, model, version }, '', url);
    updateBreadcrumb({ type, brand, model, version });

    // Récupérer les motorisations disponibles
    const engines = [];
    const lines = parseCSV(csvContent);
    
    for (let i = 1; i < lines.length; i++) {
        const columns = lines[i].split(',');
        if (columns[0]?.trim() === brand && 
            columns[1]?.trim() === model && 
            columns[2]?.trim() === version) {
            
            const engine = {
                brand,
                model,
                version,
                type: columns[3]?.trim() || 'N/A',
                energy: columns[4]?.trim() || 'N/A',
                powerOriginal: columns[5]?.trim() || 'N/A',
                torqueOriginal: columns[6]?.trim() || 'N/A',
                powerStage1: columns[7]?.trim() || 'N/A',
                torqueStage1: columns[8]?.trim() || 'N/A',
                engineCode: columns[9]?.trim() || 'N/A',
                displacement: columns[10]?.trim() || 'N/A',
                engineInfo: columns[13]?.trim() || ''
            };

            // Calculer les gains
            const powerGain = parseInt(engine.powerStage1) - parseInt(engine.powerOriginal);
            const torqueGain = parseInt(engine.torqueStage1) - parseInt(engine.torqueOriginal);
            engine.powerGain = powerGain;
            engine.torqueGain = torqueGain;

            if (!engines.some(e => e.type === engine.type)) {
                engines.push(engine);
            }
        }
    }

    // Créer ou mettre à jour la colonne des motorisations
    let engineStep = document.querySelector('.step[data-step="engine"]');
    if (!engineStep) {
        engineStep = document.createElement('div');
        engineStep.className = 'step active';
        engineStep.setAttribute('data-step', 'engine');
        document.querySelector('.selection-steps').appendChild(engineStep);
    }

    // Mettre à jour le contenu avec les motorisations trouvées
    engineStep.innerHTML = `
        <div class="step-title">Motorisation</div>
        <div class="step-content">
            ${engines.map(engine => `
                <div class="selection-item engine-item" data-engine='${JSON.stringify(engine)}'>
                        <div class="engine-info">
                            <div class="engine-type">${engine.type}</div>
                            <div class="engine-details">
                                <div class="detail-item">
                                <span class="detail-label">Puissance:</span>
                                <span class="detail-value">${engine.powerOriginal}</span>
                                </div>
                                <div class="detail-item">
                                <span class="detail-label">Cylindrée:</span>
                                    <span class="detail-value">${engine.displacement}</span>
                                </div>
                            <div class="detail-item">
                                <span class="detail-label">Energie:</span>
                                <span class="detail-value">${engine.energy}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Code moteur:</span>
                                <span class="detail-value ${engine.engineInfo ? 'tooltip' : ''}" 
                                    ${engine.engineInfo ? `data-tooltip="ECU: ${engine.engineInfo}"` : ''}>
                                    ${engine.engineCode}
                                </span>
                        </div>
                    </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Ajouter les écouteurs pour les motorisations
    engineStep.querySelectorAll('.selection-item[data-engine]').forEach(item => {
        item.addEventListener('click', () => {
            try {
                const engineData = JSON.parse(item.dataset.engine);
                handleEngineSelection(brand, type, model, version, engineData);
            } catch (error) {
                console.error('Erreur lors de la sélection du moteur:', error);
            }
        });
    });

    // Ajouter le défilement sur mobile
    scrollToNextStepOnMobile(engineStep);
}

function handleEngineSelection(brand, type, model, version, engineData) {
    // Stocker toutes les données du moteur dans currentSelection
    currentSelection = {
        brand: brand,
        model: model,
        version: version,
        type: type,
        engine: engineData.type,
        powerOriginal: engineData.powerOriginal,
        powerStage1: engineData.powerStage1,
        torqueOriginal: engineData.torqueOriginal,
        torqueStage1: engineData.torqueStage1
    };

    // Mettre à jour le breadcrumb
    updateBreadcrumb(currentSelection);

    // Afficher la page de résultats avec toutes les données
    showResultPage({
        brand,
        model,
        version,
        engineType: engineData.type,
        powerOriginal: engineData.powerOriginal,
        powerStage1: engineData.powerStage1,
        torqueOriginal: engineData.torqueOriginal,
        torqueStage1: engineData.torqueStage1
    });

    // Ajouter le bouton de réservation
    const reserveButton = document.createElement('button');
    reserveButton.className = 'reserve-btn';
    reserveButton.textContent = 'Réserver maintenant';
    reserveButton.onclick = () => {
        const prefilledMessage = `Demande de reprogrammation pour :
Marque : ${brand}
Modèle : ${model}
Version : ${version}
Motorisation : ${engineData.type}`;

        localStorage.setItem('prefilledMessage', prefilledMessage);
        window.location.href = '/autotech-reprog/#contact';
    };

    // Ajouter le bouton après le tableau
    const resultsTable = document.querySelector('.results-table');
    if (resultsTable) {
        resultsTable.insertAdjacentElement('afterend', reserveButton);
    }
}

// Ajouter la fonction de nettoyage des noms
function cleanFolderName(name) {
    return name
        .replace(/[<>:"\/\\|?*\.]/g, '')
        .replace(/\s*->\s*/g, '-')
        .replace(/\s+/g, '_')
        .replace(/_{2,}/g, '_')
        .replace(/^-+|-+$/g, '')
        .replace(/-+$/, '')
        .replace(/_+$/, '')
        .trim();
}

// Fonction pour vérifier l'existence d'une image
function checkImageExists(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            console.log('Image chargée avec succès:', url);
            resolve(true);
        };
        img.onerror = () => {
            console.log('Erreur de chargement de l\'image:', url);
            resolve(false);
        };
        img.src = url;
    });
}

// Fonction pour obtenir le chemin des images selon l'environnement
function getImagePath(brand, model, version) {
    const isGitHubPages = window.location.hostname === 'simoroui.github.io';
    const cleanBrand = cleanFolderName(brand.toLowerCase());
    const cleanModel = cleanFolderName(model.toLowerCase());
    const cleanVersion = cleanFolderName(version.toLowerCase());
    
    return isGitHubPages 
        ? `https://simoroui.github.io/autotech-reprog/images/slideshow/${cleanBrand}/${cleanModel}/${cleanVersion}`
        : `/images/slideshow/${cleanBrand}/${cleanModel}/${cleanVersion}`;
}

// Fonction pour vérifier les images
async function checkForImages(brand, model, version) {
    const basePath = getImagePath(brand, model, version);
    console.log('Chemin de base:', basePath);
    
    const imageFiles = ['1.jpg', '2.jpg', '3.jpg'];  // Réduit à 3 images
    const existingImages = [];

    for (const file of imageFiles) {
        const imageUrl = `${basePath}/${file}`;
        console.log('Tentative de chargement:', imageUrl);
        try {
            const response = await fetch(imageUrl, { 
                method: 'HEAD',
                cache: 'no-cache'
            });
            if (response.ok) {
                existingImages.push(imageUrl);
                console.log('Image trouvée:', imageUrl);
            }
        } catch (error) {
            console.log('Erreur de chargement:', error);
        }
    }

    return existingImages;
}

async function createSlideshow(brand, model, version) {
    const slideshowContainer = document.createElement('div');
    slideshowContainer.className = 'slideshow-container';

    // Détecter si nous sommes en local ou sur GitHub Pages
    const isGitHubPages = window.location.hostname === 'simoroui.github.io';
    
    // Choisir le bon chemin selon l'environnement
    const basePath = isGitHubPages 
        ? `https://simoroui.github.io/autotech-reprog/images/slideshow/${brand.toLowerCase()}/${model.toLowerCase()}/${version.toLowerCase()}`
        : `/images/slideshow/${brand.toLowerCase()}/${model.toLowerCase()}/${version.toLowerCase()}`;

    // Tableau pour stocker les images existantes
    const existingImages = [];

    // Vérifier chaque image avant de l'ajouter
    for (let i = 1; i <= 3; i++) {
        const imageUrl = `${basePath}/${i}.jpg`;
        try {
            const response = await fetch(imageUrl, {
                method: 'HEAD',
                cache: 'no-cache' // Désactiver le cache pour le débogage
            });
            
            if (response.ok) {
                existingImages.push(imageUrl);
                console.log('Image trouvée:', imageUrl);
            } else {
                console.log('Image non trouvée (status):', response.status);
            }
        } catch (error) {
            console.log('Erreur de chargement:', error);
        }
    }

    // Créer les slides uniquement pour les images existantes
    existingImages.forEach((src, index) => {
        const slide = document.createElement('div');
        slide.className = 'slide fade';
        if (index === 0) slide.style.opacity = '1';

        const img = document.createElement('img');
        img.src = src;
        img.alt = `${brand} ${model} ${version} image ${index + 1}`;

        slide.appendChild(img);
        slideshowContainer.appendChild(slide);
    });

    // N'ajouter les contrôles que s'il y a des images
    if (existingImages.length > 0) {
        // Ajouter les boutons de navigation
        const prevButton = document.createElement('button');
        prevButton.className = 'prev';
        prevButton.innerHTML = '&#10094;';
        
        const nextButton = document.createElement('button');
        nextButton.className = 'next';
        nextButton.innerHTML = '&#10095;';

        slideshowContainer.appendChild(prevButton);
        slideshowContainer.appendChild(nextButton);

        // Ajouter les points de navigation
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'dots-container';
        
        existingImages.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.className = 'dot';
            if (index === 0) dot.style.background = 'white';
            dotsContainer.appendChild(dot);
        });

        slideshowContainer.appendChild(dotsContainer);
    }

    return slideshowContainer;
}

function showResultPage(vehicleData) {
    const { brand, model, version, engineType, powerOriginal, powerStage1, torqueOriginal, torqueStage1 } = vehicleData;

    // Créer le conteneur principal
    const container = document.createElement('div');
    container.className = 'results-page';

    // Ajouter le diaporama
    createSlideshow(brand, model, version).then(slideshow => {
        container.appendChild(slideshow);
        initializeSlideshow(); // Initialiser le diaporama après l'avoir ajouté
    });

    // Ajouter le reste du contenu
    container.innerHTML += `
        <div class="results-container">
            <button class="back-button" onclick="handleBack()">Retour</button>
            
            <h1 class="vehicle-title">${brand} ${model} ${version}</h1>
            <h2 class="engine-type">${engineType}</h2>

            <div class="stage-selector">
                <button class="stage-btn active" data-stage="1">Stage 1</button>
                <button class="stage-btn" data-stage="2">Stage 2</button>
            </div>

            <div class="stage-info" style="text-align: center; margin: 15px 0; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                <div class="stage1-info" style="display: block;">
                    <span style="color: #fff; font-size: 0.9rem;">
                        ℹ️ Le Stage 1 est un simple débridage électronique, aucune modification mécanique n'est nécessaire
                    </span>
                </div>
                <div class="stage2-info" style="display: none;">
                    <span style="color: #fff; font-size: 0.9rem;">
                        ⚠️ Le Stage 2 nécessite une préparation mécanique : système d'échappement et/ou système d'admission et/ou injection
                    </span>
                </div>
            </div>

            <div class="results-table">
                <div class="table-header">
                    <div></div>
                    <div class="stage-column">ORIGINE</div>
                    <div class="stage-column">STAGE1</div>
                    <div>DIFFÉRENCE</div>
                </div>
                <div class="table-content">
                    <div class="table-row">
                        <div class="label">Puissance</div>
                        <div class="value">${powerOriginal}</div>
                        <div class="value stage-value">${powerStage1}</div>
                        <div class="diff power-diff"><span>+${parseInt(powerStage1) - parseInt(powerOriginal)} Hp</span></div>
                    </div>
                    <div class="table-row">
                        <div class="label">Couple</div>
                        <div class="value">${torqueOriginal}</div>
                        <div class="value stage-value">${torqueStage1}</div>
                        <div class="diff torque-diff"><span>+${parseInt(torqueStage1) - parseInt(torqueOriginal)} Nm</span></div>
                    </div>
            </div>
            </div>

            <div class="performance-graph">
                <canvas id="performanceChart"></canvas>
            </div>

            <!-- Autres sections de la page de résultats -->
            <div class="advantages-list">
                <div class="advantage-item">
                    Reprog sur banc de puissance (dyno)
            </div>
                <div class="advantage-item">
                    Reprog sur fichier d'origine
                    </div>
                <div class="advantage-item">
                    Log des valeurs (avant et après reprog)
                </div>
                <div class="advantage-item">
                    Diagnostic détaillé (avant et après reprog)
                </div>
                <div class="advantage-item">
                    Garantie Logiciel 5ans
                </div>
                <div class="advantage-item">
                    Reprogrammation en respectant les tolérances du constructeur
                </div>
                <div class="advantage-item">
                    Normes Antipollution respectées
                </div>
                <div class="advantage-item">
                    Possibilité de réinstaller le programme d'origine à tout moment
            </div>
                <div class="advantage-item">
                    Reprogrammation par la prise OBD, sans ouverture du calculateur
                    </div>
                <div class="advantage-item">
                    Aucun code défaut ni témoins allumés
                </div>
            </div>

            <div class="pricing-grid">
                <div class="price-info">
                    <span class="stage-label">Stage 1 : </span>
                    <span class="price-amount">700 DT</span>
                    <span class="price-tax">HT</span>
                    </div>
                <button class="reserve-btn" onclick="handleReservation('${brand}', '${model}', '${version}', '${engineType}')">
                    Réserver maintenant
                </button>
                </div>
            </div>
    `;

    // Remplacer le contenu existant
    const mainContent = document.querySelector('.section-container');
    mainContent.innerHTML = '';
    mainContent.appendChild(container);

    // Initialiser le graphique
    const ctx = document.getElementById('performanceChart').getContext('2d');

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Puissance', 'Couple'],
            datasets: [{
                label: 'Origine',
                data: [
                    parseInt(powerOriginal),
                    parseInt(torqueOriginal)
                ],
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderColor: 'rgba(255, 255, 255, 0.8)',
                borderWidth: 1,
                barPercentage: 0.8
            }, {
                label: 'Stage 1',
                data: [
                    parseInt(powerStage1),
                    parseInt(torqueStage1)
                ],
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    
                    if (!chartArea) {
                        return 'rgba(227, 6, 19, 0.4)';
                    }

                    // Créer un dégradé horizontal pour l'effet laser
                    const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                    
                    // Animation basée sur le temps
                    const time = Date.now() * 0.001;
                    const position = (Math.sin(time * 2) + 1) / 2; // Animation plus rapide

                    // Effet laser plus intense
                    gradient.addColorStop(0, 'rgba(227, 6, 19, 0.4)');
                    gradient.addColorStop(Math.max(0, position - 0.1), 'rgba(227, 6, 19, 0.4)');
                    gradient.addColorStop(position, 'rgba(255, 255, 255, 0.9)');
                    gradient.addColorStop(Math.min(1, position + 0.1), 'rgba(227, 6, 19, 0.4)');
                    gradient.addColorStop(1, 'rgba(227, 6, 19, 0.4)');

                    return gradient;
                },
                borderColor: 'rgba(227, 6, 19, 0.8)',
                borderWidth: 2,
                barPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            animation: {
                duration: 800,
                easing: 'easeInOutQuart'
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'white',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    enabled: false
                },
                customLabels: {
                    enabled: true,
                    color: 'white',
                    font: { size: 12 }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: { 
                        color: 'white',
                        callback: function(value) {
                            return value;
                        }
                    },
                    min: 0,
                    max: Math.max(
                        parseInt(powerOriginal),
                        parseInt(powerStage1),
                        parseInt(torqueOriginal),
                        parseInt(torqueStage1)
                    ) + 50
                },
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: { color: 'white' }
                }
            }
        },
        plugins: [{
            id: 'customLabels',
            afterDatasetsDraw(chart, args, options) {
                const { ctx } = chart;
                ctx.save();
                
                chart.data.datasets.forEach((dataset, datasetIndex) => {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    
                    meta.data.forEach((bar, index) => {
                        const value = dataset.data[index];
                        const unit = chart.data.labels[index] === 'Puissance' ? ' Hp' : ' Nm';
                        
                        ctx.fillStyle = 'white';
                        ctx.font = '12px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        
                        // Position du texte au centre de la barre
                        const x = bar.x + (datasetIndex === 0 ? 30 : -30); // Décalage pour éviter le chevauchement
                        const y = bar.y;
                        
                        ctx.fillText(value + unit, x, y);
                    });
                });
                
                ctx.restore();
            }
        }]
    });

    // Ajouter les écouteurs pour les boutons Stage AVANT le return
    const stageButtons = container.querySelectorAll('.stage-btn');
    stageButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Mettre à jour les classes active
            stageButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Mettre à jour les valeurs selon le stage
            const stageColumns = container.querySelectorAll('.stage-column');
            const stageValues = container.querySelectorAll('.stage-value');
            const powerDiff = container.querySelector('.power-diff span');
            const torqueDiff = container.querySelector('.torque-diff span');

            if (button.dataset.stage === '2') {
                // Mise à jour du tableau
                stageColumns[1].textContent = 'STAGE2';
                stageValues[0].textContent = `${parseInt(powerStage1) + 10} Hp`;
                stageValues[1].textContent = `${parseInt(torqueStage1) + 20} Nm`;
                powerDiff.textContent = `+${parseInt(powerStage1) - parseInt(powerOriginal)} Hp`;
                torqueDiff.textContent = `+${parseInt(torqueStage1) - parseInt(torqueOriginal)} Nm`;

                // Mise à jour du graphique avec animation
                chart.data.datasets[1].label = 'Stage 2';
                chart.data.datasets[1].data = [
                    parseInt(powerStage1) + 10,
                    parseInt(torqueStage1) + 20
                ];
                chart.update('active');

                // Afficher/masquer les informations appropriées
                const stage1Info = container.querySelector('.stage1-info');
                const stage2Info = container.querySelector('.stage2-info');
                stage1Info.style.display = 'none';
                stage2Info.style.display = 'block';
            } else {
                // Mise à jour du tableau
                stageColumns[1].textContent = 'STAGE1';
                stageValues[0].textContent = powerStage1;
                stageValues[1].textContent = torqueStage1;
                powerDiff.textContent = `+${parseInt(powerStage1) - parseInt(powerOriginal)} Hp`;
                torqueDiff.textContent = `+${parseInt(torqueStage1) - parseInt(torqueOriginal)} Nm`;

                // Mise à jour du graphique avec animation
                chart.data.datasets[1].label = 'Stage 1';
                chart.data.datasets[1].data = [
                    parseInt(powerStage1),
                    parseInt(torqueStage1)
                ];
                chart.update('active');

                // Afficher/masquer les informations appropriées
                const stage1Info = container.querySelector('.stage1-info');
                const stage2Info = container.querySelector('.stage2-info');
                stage1Info.style.display = 'block';
                stage2Info.style.display = 'none';
            }
        });
    });

    // Animation continue
    function animate() {
        chart.update('none');
        requestAnimationFrame(animate);
    }
    animate();

    // Vérifier et ajouter le diaporama après l'initialisation du graphique
    checkForImages(brand, model, version)
        .then(images => {
            if (images && images.length > 0) {
                const slideshowHTML = `
                    <div class="results-table">
                        <div class="vehicle-slideshow">
                            <h3 style="
                                text-align: center; 
                                margin: 10px 0;
                                padding: 10px;
                                font-size: 1.2rem;
                                color: white;
                                position: relative;
                                overflow: hidden;
                                text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
                            ">
                                Photos prises dans notre atelier
                                <div style="
                                    position: absolute;
                                    top: 0;
                                    left: -100%;
                                    width: 100%;
                                    height: 100%;
                                    background: linear-gradient(
                                        90deg,
                                        transparent,
                                        rgba(227, 6, 19, 0.8),
                                        transparent
                                    );
                                    animation: laserScan 2s linear infinite;
                                "></div>
                            </h3>
                            <style>
                                @keyframes laserScan {
                                    0% { left: -100%; }
                                    100% { left: 200%; }
                                }
                            </style>
                            <div class="slideshow-container" style="
                                position: relative;
                                width: 100%;
                                height: 400px;
                                background: rgba(0, 0, 0, 0.2);
                                border-radius: 8px;
                                overflow: hidden;
                            ">
                                ${images.map((img, index) => `
                                    <div class="slide" style="
                                        position: absolute;
                                        top: 0;
                                        left: 0;
                                        width: 100%;
                                        height: 100%;
                                        opacity: ${index === 0 ? '1' : '0'};
                                        transition: all 0.3s ease;
                                        padding: 20px;
                                    ">
                                        <img src="${img}" 
                                             alt="${brand} ${model}" 
                                             style="
                                                width: 100%;
                                                height: 100%;
                                                object-fit: contain;
                                                border-radius: 4px;
                                             ">
                </div>
                                `).join('')}
                                
                                <button class="slide-nav prev" style="
                                    position: absolute;
                                    left: 20px;
                                    top: 50%;
                                    transform: translateY(-50%);
                                    z-index: 10;
                                    background: rgba(227, 6, 19, 0.8);
                                    color: white;
                                    border: none;
                                    width: 40px;
                                    height: 40px;
                                    border-radius: 50%;
                                    cursor: pointer;
                                    font-size: 20px;
                                ">❮</button>
                                
                                <button class="slide-nav next" style="
                                    position: absolute;
                                    right: 20px;
                                    top: 50%;
                                    transform: translateY(-50%);
                                    z-index: 10;
                                    background: rgba(227, 6, 19, 0.8);
                                    color: white;
                                    border: none;
                                    width: 40px;
                                    height: 40px;
                                    border-radius: 50%;
                                    cursor: pointer;
                                    font-size: 20px;
                                ">❯</button>
                                
                                <div class="slide-dots" style="
                                    position: absolute;
                                    bottom: 20px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    display: flex;
                                    gap: 10px;
                                    z-index: 10;
                                ">
                                    ${images.map((_, index) => `
                                        <button class="dot" style="
                                            width: 12px;
                                            height: 12px;
                                            border-radius: 50%;
                                            border: none;
                                            background: ${index === 0 ? 'white' : 'rgba(255, 255, 255, 0.5)'};
                                            cursor: pointer;
                                            padding: 0;
                                        " data-index="${index}"></button>
                                    `).join('')}
                                </div>
                            </div>
            </div>
        </div>
    `;

                const resultsTable = document.querySelector('.results-table');
                if (resultsTable) {
                    resultsTable.insertAdjacentHTML('afterend', slideshowHTML);
                    initializeSlideshow();
                }
            } else {
                console.log('Aucune image trouvée pour:', brand, model, version);
            }
        })
        .catch(error => {
            console.error("Erreur lors de la vérification des images:", error);
        });

    // Retourner la fonction de nettoyage
    return () => {
        chart.destroy();
    };
}

// Nouvelle version de la fonction initializeSlideshow
function initializeSlideshow() {
    const slideshow = document.querySelector('.vehicle-slideshow');
    if (!slideshow) return;

    const slides = Array.from(slideshow.querySelectorAll('.slide'));
    const dots = Array.from(slideshow.querySelectorAll('.dot'));
    const prevBtn = slideshow.querySelector('.prev');
    const nextBtn = slideshow.querySelector('.next');
    let currentIndex = 0;

    function updateSlides(newIndex) {
        slides.forEach((slide, index) => {
            slide.style.opacity = index === newIndex ? '1' : '0';
            slide.style.zIndex = index === newIndex ? '1' : '0';
        });

        dots.forEach((dot, index) => {
            dot.style.background = index === newIndex ? 'white' : 'rgba(255, 255, 255, 0.5)';
        });

        currentIndex = newIndex;
    }

    if (prevBtn) {
        prevBtn.onclick = () => {
            const newIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlides(newIndex);
        };
    }

    if (nextBtn) {
        nextBtn.onclick = () => {
            const newIndex = (currentIndex + 1) % slides.length;
            updateSlides(newIndex);
        };
    }

    dots.forEach((dot, index) => {
        dot.onclick = () => updateSlides(index);
    });

    // Initialiser avec la première slide
    updateSlides(0);
}

// Fonction séparée pour gérer le retour
function handleBack() {
    // Rediriger vers la section #boost de la page d'accueil
    window.location.href = '/autotech-reprog/#boost';
}

// Modifier l'écouteur popstate
window.addEventListener('popstate', (event) => {
    // Vérifier si on est sur une page de résultats (URL contient /reprogrammation/ suivi du type)
    if (window.location.pathname.match(/\/reprogrammation\/(cars|motorcycles|jetski|quad|trucks|agricultural)\//)) {
        // Rediriger vers la section #boost de la page d'accueil
        window.location.href = '/autotech-reprog/#boost';
    }
});

// Variable globale pour stocker le contenu CSV
let csvContent = '';

// Mise en cache des données
let csvCache = null;

async function loadAndCacheCSV() {
    if (csvCache) {
        return csvCache;
    }

    try {
        const response = await fetch('data/marques.csv');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        csvCache = await response.text();
        return csvCache;
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        return null;
    }
}

// Modifier l'initialisation
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Page chargée, début du chargement des données');
    
    try {
        const response = await fetch('data/marques.csv');
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        csvContent = await response.text();
        
        const lines = parseCSV(csvContent);
        const brands = extractBrands(lines);
        
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (event) => {
                handleTabClick(event, brands);
            });
        });
        
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
});

// Améliorer la mise en cache
const CACHE_VERSION = 'v1';
const CACHE_NAME = `autotech-${CACHE_VERSION}`;

async function cacheResources() {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([
        '/css/style.css',
        '/css/results.css',
        '/images/logos/*',
        'data/marques.csv'
    ]);
}

// Mise en cache des données fréquemment utilisées
async function cacheData(key, data) {
    try {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(key, new Response(JSON.stringify(data)));
    } catch (error) {
        console.error('Erreur de cache:', error);
    }
}

// Ajouter après la table de performances
function addPerformanceGraph(data) {
    return `
        <div class="performance-graph">
            <canvas id="powerGraph"></canvas>
            <div class="graph-legend">
                <div class="legend-item original">
                    <span class="line"></span>
                    <span>Origine</span>
                </div>
                <div class="legend-item stage1">
                    <span class="line"></span>
                    <span>Stage 1</span>
                </div>
            </div>
        </div>
    `
}

// Modifier les styles CSS
const styles = `
.performance-graph {
    background: linear-gradient(145deg, #222, #111);
    border-radius: 12px;
    padding: 2rem;
    margin: 2rem 0;
    min-height: 300px;
    position: relative;
}
`;

// Ajouter au début du fichier ou dans un fichier séparé
document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.querySelector('.hamburger-menu');
    const navContainer = document.querySelector('.nav-container');
    
    hamburger.addEventListener('click', () => {
        navContainer.classList.toggle('active');
    });
});

function displayVehicleResults(brand, model, version) {
    // ... code existant ...

    // Chercher cette partie et la corriger
    const vehicleImages = {
        path: `/autotech-reprog/images/slideshow/${brand.toLowerCase()}/${model.toLowerCase()}/${version.toLowerCase()}`
    };

    // ... reste du code ...
}

// Fonction pour gérer le scroll vers la section boost
function scrollToBoost() {
    const isMobile = window.innerWidth <= 768;
    const vehicleTabs = document.querySelector('.vehicle-tabs');
    const headerHeight = document.querySelector('.header').offsetHeight;
    const boostTitle = document.querySelector('#boost h2'); // Sélectionne le titre
    
    if (isMobile) {
        // Position du titre par rapport au haut de la page
        const targetPosition = boostTitle.offsetTop - headerHeight - 20; // 20px de marge
        
        setTimeout(() => {
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }, 100);
    } else {
        // Comportement desktop inchangé
        document.querySelector('#boost').scrollIntoView({ behavior: 'smooth' });
    }
}

// Ajouter l'écouteur d'événement au bouton
document.addEventListener('DOMContentLoaded', () => {
    const boostButton = document.querySelector('.boost-button');
    if (boostButton) {
        boostButton.addEventListener('click', scrollToBoost);
    }
});

// Ajouter cette nouvelle fonction
function handleReservation(brand, model, version, engineType) {
    // Créer le message pré-rempli
    const prefilledMessage = `Demande de reprogrammation pour :
Marque : ${brand}
Modèle : ${model}
Version : ${version}
Motorisation : ${engineType}`;

    // Stocker le message dans localStorage
    localStorage.setItem('prefilledMessage', prefilledMessage);

    // Rediriger vers la section contact de la page d'accueil
    window.location.href = '/autotech-reprog/#contact';
}

// Ajouter dans le fichier contact-form.js ou au début du script
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier s'il y a un message pré-rempli
    const prefilledMessage = localStorage.getItem('prefilledMessage');
    if (prefilledMessage) {
        // Remplir le champ message du formulaire
        const messageField = document.querySelector('#message');
        if (messageField) {
            messageField.value = prefilledMessage;
            // Nettoyer le localStorage après utilisation
            localStorage.removeItem('prefilledMessage');
        }
    }
});

// Dans la fonction qui gère le bouton retour
function handleBackButton() {
    const backButton = document.createElement('button');
    backButton.className = 'back-button';
    backButton.textContent = 'Retour';
    backButton.addEventListener('click', () => {
        // Modifier le lien de retour pour GitHub Pages
        window.location.href = '/autotech-reprog/#boost';
    });
    return backButton;
}

// Ajouter une fonction pour lire les paramètres d'URL
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        brand: params.get('brand'),
        model: params.get('model'),
        version: params.get('version'),
        type: params.get('type')
    };
}

// Modifier l'initialisation pour gérer le chargement direct
document.addEventListener('DOMContentLoaded', async () => {
    // Si on est sur la page results.html, charger les données depuis l'URL
    if (window.location.pathname.includes('results.html')) {
        const params = getUrlParams();
        if (params.brand && params.model && params.version) {
            // Charger les résultats directement
            showResultPage({
                brand: params.brand,
                model: params.model,
                version: params.version,
                type: params.type
            });
        }
    }
    // ... reste du code d'initialisation ...
});

// Ajouter l'initialisation du formulaire de contact
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si on est sur la page d'accueil et s'il y a un message pré-rempli
    if (window.location.hash === '#contact') {
        const prefilledMessage = localStorage.getItem('prefilledMessage');
        if (prefilledMessage) {
            // Attendre que le formulaire soit chargé
            setTimeout(() => {
                const messageField = document.querySelector('#message');
                if (messageField) {
                    messageField.value = prefilledMessage;
                    // Nettoyer le localStorage
                    localStorage.removeItem('prefilledMessage');
                    
                    // Scroll vers le formulaire
                    const contactSection = document.querySelector('#contact');
                    if (contactSection) {
                        contactSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }, 500);
        }
    }
});