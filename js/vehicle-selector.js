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
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(',');
        const brand = columns[0].trim();
        const rawType = columns[columns.length - 1].trim();
        
        const type = typeMapping[rawType];
        if (type && brands[type]) {
            brands[type].add(brand);
        }
    }
    
    const result = {};
    Object.entries(brands).forEach(([key, set]) => {
        result[key] = Array.from(set).map(name => ({
            name: name,
            logo: getLogoPath(name)
        }));
    });
    
    return result;
}

// Fonction pour obtenir le chemin du logo
function getLogoPath(brand) {
    const isGitHubPages = window.location.hostname === 'simoroui.github.io';
    const basePath = isGitHubPages ? '/autotech-reprog/images/logos' : 'images/logos';
    
    const cleanBrand = brand
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('-');
    
    return `${basePath}/${cleanBrand}.png`;
}

// Fonction pour afficher les marques
function displayBrands(brands, type) {
    const grid = document.getElementById(`${type}-grid`);
    if (!grid) return;
    
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
            img.style.display = 'none';
            
            img.onload = function() {
                this.style.display = 'block';
            };
            
            img.onerror = function() {
                this.style.display = 'none';
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

// Renommons la fonction pour refléter son nouveau comportement
function scrollToStepCenter(stepElement) {
    if (!stepElement) return;

    // Attendre que le DOM soit mis à jour
    setTimeout(() => {
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const windowHeight = window.innerHeight;
        const elementHeight = stepElement.offsetHeight;
        
        // Calculer la position pour centrer l'élément
        const elementTop = stepElement.getBoundingClientRect().top + window.scrollY;
        const targetScroll = elementTop - (windowHeight - elementHeight) / 2;

        // Scroll avec animation
        window.scrollTo({
            top: Math.max(0, targetScroll - headerHeight),
            behavior: 'smooth'
        });
    }, 100);
}

// Modifier handleBrandSelection pour utiliser la nouvelle fonction
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
                             onerror="this.onerror=null; this.src='images/logos/default.png';"
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

    // Scroll vers le modèle step après l'affichage
    const modelStep = document.getElementById('model-step');
    if (modelStep) {
        scrollToStepCenter(modelStep);
    }
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
        const modelStepTop = modelStep.getBoundingClientRect().top + window.pageOffset;
        
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

// Modifier handleModelSelection pour centrer la sélection de version
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
    const existingVersionStep = document.querySelector('.step[data-step="version"]');
    let versionStep;

    if (!existingVersionStep) {
        versionStep = document.createElement('div');
        versionStep.className = 'step active';
        versionStep.setAttribute('data-step', 'version');
        document.querySelector('.selection-steps').appendChild(versionStep);
    } else {
        versionStep = existingVersionStep;
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

    // Scroll vers le version step
    scrollToStepCenter(versionStep);

    // Mettre à jour l'URL et le breadcrumb
    const url = `/reprogrammation/${type}/${brand.toLowerCase().replace(/\s+/g, '-')}/${model.toLowerCase().replace(/\s+/g, '-')}`;
    window.history.pushState({ type, brand, model }, '', url);
    updateBreadcrumb({ type, brand, model });
}

// Modifier handleVersionSelection pour centrer la sélection de motorisation
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
    const existingEngineStep = document.querySelector('.step[data-step="engine"]');
    let engineStep;

    if (!existingEngineStep) {
        engineStep = document.createElement('div');
        engineStep.className = 'step active';
        engineStep.setAttribute('data-step', 'engine');
        document.querySelector('.selection-steps').appendChild(engineStep);
    } else {
        engineStep = existingEngineStep;
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

    // Scroll vers le engine step
    scrollToStepCenter(engineStep);
}

function handleEngineSelection(brand, type, model, version, engineData) {
    // Mettre à jour la sélection courante
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

    // Créer et afficher la page de résultats
    const container = showResultPage({
        brand,
        model,
        version,
        engineType: engineData.type,
        powerOriginal: engineData.powerOriginal,
        powerStage1: engineData.powerStage1,
        torqueOriginal: engineData.torqueOriginal,
        torqueStage1: engineData.torqueStage1
    });

    // Remplacer le contenu existant
    const mainContent = document.querySelector('.section-container');
    if (mainContent) {
        mainContent.innerHTML = '';
        mainContent.appendChild(container);
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

// Fonction pour créer le diaporama
async function createSlideshow(brand, model, version) {
    // Nettoyer les noms pour les chemins
    const cleanBrand = cleanFolderName(brand.toLowerCase());
    const cleanModel = cleanFolderName(model.toLowerCase());
    const cleanVersion = cleanFolderName(version.toLowerCase());

    // Construire le chemin de base
    const basePath = window.location.hostname === 'simoroui.github.io'
        ? `/autotech-reprog/images/slideshow/${cleanBrand}/${cleanModel}/${cleanVersion}`
        : `images/slideshow/${cleanBrand}/${cleanModel}/${cleanVersion}`;

    // Vérifier quelles images existent
    const images = await checkForImages(brand, model, version);
    
    // Si aucune image n'existe, retourner null
    if (images.length === 0) {
        console.log('Aucune image trouvée pour:', brand, model, version);
        return null;
    }

    // Créer l'élément du diaporama seulement si des images existent
    const slideshow = document.createElement('div');
    slideshow.className = 'vehicle-slideshow';
    slideshow.innerHTML = `
        <h3 style="
            color: white;
            text-align: center;
            margin-bottom: 15px;
            font-size: 1.2rem;
        ">Photos prises dans notre atelier</h3>
        <div class="slideshow-container" style="
            position: relative;
            width: 100%;
            height: 400px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            overflow: hidden;
            margin: 20px 0;
        ">
            ${images.map((imageUrl, index) => `
                <div class="slide" style="
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    opacity: ${index === 0 ? '1' : '0'};
                ">
                    <img src="${imageUrl}" alt="${brand} ${model}" style="
                        width: 100%;
                        height: 100%;
                        object-fit: contain;
                        background: rgba(0, 0, 0, 0.5);
                    ">
                </div>
            `).join('')}

            ${images.length > 1 ? `
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
                
                <div class="slide-dots">
                    ${images.map((_, index) => `
                        <button class="dot" data-index="${index}" style="
                            width: 12px;
                            height: 12px;
                            border-radius: 50%;
                            background: ${index === 0 ? 'white' : 'rgba(255, 255, 255, 0.5)'};
                            border: none;
                            cursor: pointer;
                        "></button>
                    `).join('')}
            </div>
            ` : ''}
        </div>
    `;

    return slideshow;
}

// Variables globales pour stocker les valeurs initiales
let initialValues = {
    powerOriginal: 0,
    torqueOriginal: 0,
    powerStage1: 0,
    torqueStage1: 0
};

// Dans showResultPage, stockons les valeurs
function showResultPage(vehicleData) {
    const { brand, model, version, engineType, powerOriginal, powerStage1, torqueOriginal, torqueStage1 } = vehicleData;

    // Stocker les valeurs initiales
    initialValues = {
        powerOriginal: parseInt(powerOriginal),
        torqueOriginal: parseInt(torqueOriginal),
        powerStage1: parseInt(powerStage1),
        torqueStage1: parseInt(torqueStage1)
    };

    // Créer le conteneur
    const container = document.createElement('div');
    container.className = 'results-container';
    
    // Ajouter le contenu HTML
    container.innerHTML = `
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
                    <div class="label"></div>
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
                <div class="price-info">
                    <span class="stage-label">Stage 2 : </span>
                    <span class="price-amount">Sur devis</span>
                    <span class="price-tax">!</span>
                </div>
                <button class="reserve-btn" onclick="handleReservation('${brand}', '${model}', '${version}', '${engineType}')">
                    Réserver maintenant
                </button>
                </div>
            </div>
        </div>
    `;

    // Ajouter au DOM
    document.querySelector('.section-container').appendChild(container);

    // Initialiser le graphique
    setTimeout(() => {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        if (ctx) {
            const chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Puissance', 'Couple'],
                    datasets: [{
                        label: 'Origine',
                        data: [initialValues.powerOriginal, initialValues.torqueOriginal],
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        borderColor: 'rgba(255, 255, 255, 0.8)',
                        borderWidth: 1,
                        barPercentage: 0.8
                    }, {
                        label: 'Stage 1',
                        data: [initialValues.powerStage1, initialValues.torqueStage1],
                        backgroundColor: function(context) {
                            const chart = context.chart;
                            const {ctx, chartArea} = chart;
                            
                            if (!chartArea) {
                                return 'rgba(227, 6, 19, 0.4)';
                            }

                            const gradient = ctx.createLinearGradient(chartArea.left, 0, chartArea.right, 0);
                            const time = Date.now() * 0.001;
                            const position = (Math.sin(time * 2) + 1) / 2;

                            gradient.addColorStop(0, 'rgba(227, 6, 19, 0.4)');
                            gradient.addColorStop(Math.max(0, position - 0.1), 'rgba(227, 6, 19, 0.4)');
                            gradient.addColorStop(position, 'rgba(255, 255, 255, 0.9)');
                            gradient.addColorStop(Math.min(1, position + 0.1), 'rgba(227, 6, 19, 0.4)');
                            gradient.addColorStop(1, 'rgba(227, 6, 19, 0.4)');

                            requestAnimationFrame(() => chart.draw());

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
                        duration: 1
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
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(255, 255, 255, 0.1)'
                            },
                            ticks: { color: 'white' }
                        }
                    }
                }
            });

            // Fonction d'animation
            function animate() {
                chart.update('none');
                requestAnimationFrame(animate);
            }

            // Démarrer l'animation
            animate();
        }
    }, 100);

    // Centrer le tableau des résultats
    setTimeout(() => {
        const resultsTable = container.querySelector('.results-table');
        if (resultsTable) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const windowHeight = window.innerHeight;
            const tableHeight = resultsTable.offsetHeight;
            
            // Calculer la position pour centrer le tableau
            const targetScroll = resultsTable.getBoundingClientRect().top + window.scrollY - 
                               (windowHeight - tableHeight) / 2 - headerHeight;

            // Scroll avec animation
            window.scrollTo({
                top: Math.max(0, targetScroll),
                behavior: 'smooth'
            });
        }
    }, 100);

    // Ajouter le diaporama
    const resultsTable = container.querySelector('.results-table');
    if (resultsTable) {
        createSlideshow(brand, model, version).then(slideshow => {
            resultsTable.insertAdjacentElement('afterend', slideshow);
            initializeSlideshow();
        });
    }

    // Ajouter les écouteurs d'événements pour les boutons de stage
    const stageButtons = container.querySelectorAll('.stage-btn');
    const stage1Info = container.querySelector('.stage1-info');
    const stage2Info = container.querySelector('.stage2-info');

    stageButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Mettre à jour les classes actives
            stageButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Afficher/masquer les infos correspondantes
            if (button.dataset.stage === '1') {
                stage1Info.style.display = 'block';
                stage2Info.style.display = 'none';
            } else {
                stage1Info.style.display = 'none';
                stage2Info.style.display = 'block';
            }

            // Mettre à jour le tableau et le graphique selon le stage
            const isStage2 = button.dataset.stage === '2';
            updatePerformanceData(isStage2);
        });
    });

    return container;
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

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('data/marques.csv');
        if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
        
        csvContent = await response.text();
        const lines = parseCSV(csvContent);
        const brands = extractBrands(lines);
        
        const defaultTab = document.querySelector('.tab-button.active');
        if (defaultTab) {
            const defaultType = defaultTab.dataset.type;
            displayBrands(brands, defaultType);
        }
        
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (event) => {
                handleTabClick(event, brands);
            });
        });
        
    } catch (error) {
        // Gérer l'erreur silencieusement
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
    const prefilledMessage = `Demande de reprogrammation pour :
Marque : ${brand}
Modèle : ${model}
Version : ${version}
Motorisation : ${engineType}`;

    localStorage.setItem('prefilledMessage', prefilledMessage);
    window.location.href = '/autotech-reprog/#contact';
}

// Ajouter cette fonction à la fin du fichier
function updatePerformanceData(isStage2) {
    // Récupérer les éléments
    const powerStageCell = document.querySelector('.table-row:first-child .stage-value');
    const torqueStageCell = document.querySelector('.table-row:last-child .stage-value');
    const powerDiffCell = document.querySelector('.power-diff span');
    const torqueDiffCell = document.querySelector('.torque-diff span');
    const stageColumn = document.querySelector('.stage-column:nth-child(3)');

    if (isStage2) {
        // Calculer les valeurs Stage 2
        const powerStage2 = initialValues.powerStage1 + 10;  // +10 Hp
        const torqueStage2 = initialValues.torqueStage1 + 20;  // +20 Nm

        // Mettre à jour le titre
        stageColumn.textContent = 'STAGE2';

        // Mettre à jour les valeurs
        powerStageCell.textContent = `${powerStage2} Hp`;
        torqueStageCell.textContent = `${torqueStage2} Nm`;
        powerDiffCell.textContent = `+${powerStage2 - initialValues.powerOriginal} Hp`;
        torqueDiffCell.textContent = `+${torqueStage2 - initialValues.torqueOriginal} Nm`;

        // Mettre à jour le graphique
        const chart = Chart.getChart('performanceChart');
        if (chart) {
            chart.data.datasets[1].data = [powerStage2, torqueStage2];
            chart.data.datasets[1].label = 'Stage 2';
            chart.update();
        }
    } else {
        // Restaurer Stage 1
        stageColumn.textContent = 'STAGE1';
        powerStageCell.textContent = `${initialValues.powerStage1} Hp`;
        torqueStageCell.textContent = `${initialValues.torqueStage1} Nm`;
        powerDiffCell.textContent = `+${initialValues.powerStage1 - initialValues.powerOriginal} Hp`;
        torqueDiffCell.textContent = `+${initialValues.torqueStage1 - initialValues.torqueOriginal} Nm`;

        // Restaurer le graphique
        const chart = Chart.getChart('performanceChart');
        if (chart) {
            chart.data.datasets[1].data = [initialValues.powerStage1, initialValues.torqueStage1];
            chart.data.datasets[1].label = 'Stage 1';
            chart.update();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const vehicleTabs = document.querySelectorAll('.vehicle-tabs button');
    const brandsGrids = document.querySelectorAll('.brands-grid');

    // Gestion des onglets
    vehicleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            vehicleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            brandsGrids.forEach(grid => grid.classList.remove('active'));
            const targetGrid = document.getElementById(`${tab.dataset.type}-grid`);
            if (targetGrid) {
                targetGrid.classList.add('active');
            }
        });
    });

    // Charger et traiter les données CSV
    fetch('data/marques.csv')
        .then(response => response.text())
        .then(data => {
            const lines = data.split('\n');
            const cars = new Set();
            const motorcycles = new Set();
            const jetski = new Set();
            const quad = new Set();
            const trucks = new Set();
            const agricultural = new Set();

            lines.forEach(line => {
                const [marque, type] = line.split(',').map(item => item.trim());
                if (!marque || !type) return;

                switch (type.toLowerCase()) {
                    case 'voiture': cars.add(marque); break;
                    case 'moto': motorcycles.add(marque); break;
                    case 'jetski': jetski.add(marque); break;
                    case 'quad': quad.add(marque); break;
                    case 'camion': trucks.add(marque); break;
                    case 'agricole': agricultural.add(marque); break;
                }
            });

            const createBrandElements = (brands, gridId) => {
                const grid = document.getElementById(gridId);
                if (!grid) return;

                Array.from(brands).sort().forEach(brand => {
                    const brandElement = document.createElement('div');
                    brandElement.className = 'brand-item';
                    
                    const link = document.createElement('a');
                    link.href = 'enconstruction.html';
                    link.className = 'brand-link';
                    
                    const logo = document.createElement('div');
                    logo.className = 'brand-logo';
                    const img = document.createElement('img');
                    img.src = `images/logos/${brand.toLowerCase().replace(/\s+/g, '-')}.png`;
                    img.alt = `${brand} logo`;
                    img.loading = 'lazy';
                    
                    const name = document.createElement('div');
                    name.className = 'brand-name';
                    name.textContent = brand;
                    
                    logo.appendChild(img);
                    link.appendChild(logo);
                    link.appendChild(name);
                    brandElement.appendChild(link);
                    grid.appendChild(brandElement);
                });
            };

            createBrandElements(cars, 'cars-grid');
            createBrandElements(motorcycles, 'motorcycles-grid');
            createBrandElements(jetski, 'jetski-grid');
            createBrandElements(quad, 'quad-grid');
            createBrandElements(trucks, 'trucks-grid');
            createBrandElements(agricultural, 'agricultural-grid');
        })
        .catch(error => {
            console.error('Erreur lors du chargement des marques:', error);
        });
});