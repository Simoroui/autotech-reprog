// Validation du formulaire de contact
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Récupérer les champs du formulaire
            const nameInput = this.querySelector('input[name="name"]');
            const emailInput = this.querySelector('input[name="email"]');
            const phoneInput = this.querySelector('input[name="phone"]');
            const subjectSelect = this.querySelector('select[name="subject"]');
            const messageTextarea = this.querySelector('textarea[name="message"]');
            
            // Valider les champs
            let isValid = true;
            
            // Validation du nom
            if (!nameInput.value.trim()) {
                showError(nameInput, 'Veuillez entrer votre nom');
                isValid = false;
            } else {
                clearError(nameInput);
            }
            
            // Validation de l'email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim())) {
                showError(emailInput, 'Veuillez entrer une adresse email valide');
                isValid = false;
            } else {
                clearError(emailInput);
            }
            
            // Validation du téléphone (optionnel)
            if (phoneInput.value.trim() && !/^[0-9+\s-]{8,15}$/.test(phoneInput.value.trim())) {
                showError(phoneInput, 'Veuillez entrer un numéro de téléphone valide');
                isValid = false;
            } else {
                clearError(phoneInput);
            }
            
            // Validation du sujet
            if (subjectSelect.value === '') {
                showError(subjectSelect, 'Veuillez sélectionner un sujet');
                isValid = false;
            } else {
                clearError(subjectSelect);
            }
            
            // Validation du message
            if (!messageTextarea.value.trim()) {
                showError(messageTextarea, 'Veuillez entrer votre message');
                isValid = false;
            } else {
                clearError(messageTextarea);
            }
            
            // Si le formulaire est valide, simuler l'envoi
            if (isValid) {
                // Désactiver le bouton d'envoi
                const submitButton = this.querySelector('.submit-button');
                submitButton.disabled = true;
                submitButton.textContent = 'Envoi en cours...';
                
                // Simuler un délai d'envoi
                setTimeout(() => {
                    // Réinitialiser le formulaire
                    this.reset();
                    
                    // Afficher un message de succès
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.textContent = 'Votre message a été envoyé avec succès !';
                    
                    // Insérer le message après le formulaire
                    this.parentNode.insertBefore(successMessage, this.nextSibling);
                    
                    // Réactiver le bouton d'envoi
                    submitButton.disabled = false;
                    submitButton.textContent = 'Envoyer';
                    
                    // Supprimer le message après 5 secondes
                    setTimeout(() => {
                        successMessage.remove();
                    }, 5000);
                }, 1500);
            }
        });
        
        // Fonction pour afficher une erreur
        function showError(input, message) {
            // Supprimer l'erreur existante
            clearError(input);
            
            // Créer un élément d'erreur
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.textContent = message;
            
            // Insérer l'erreur après l'input
            input.parentNode.insertBefore(errorElement, input.nextSibling);
            
            // Ajouter une classe d'erreur à l'input
            input.classList.add('error');
        }
        
        // Fonction pour supprimer une erreur
        function clearError(input) {
            // Supprimer la classe d'erreur
            input.classList.remove('error');
            
            // Supprimer le message d'erreur
            const errorElement = input.parentNode.querySelector('.error-message');
            if (errorElement) {
                errorElement.remove();
            }
        }
    }
}); 