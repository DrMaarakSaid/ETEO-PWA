// js/ui/AvatarUpload.js

export class AvatarUpload {
    
    /**
     * @param {AvatarService} avatarService - Service de gestion des avatars
     * @param {Function} showToast - Fonction d'affichage des notifications
     * @param {Function} onUpdate - Callback après mise à jour
     */
    constructor(avatarService, showToast, onUpdate) {
        this.avatarService = avatarService;
        this.showToast = showToast;
        this.onUpdate = onUpdate || (() => {});
        this.avatarInput = null;
        this.avatarContainer = null;
    }

    /**
     * Initialise le composant
     * @param {string} containerId - ID du conteneur de l'avatar
     * @param {string} inputId - ID de l'input file
     */
    init(containerId, inputId) {
        this.avatarContainer = document.getElementById(containerId);
        this.avatarInput = document.getElementById(inputId);

        if (!this.avatarContainer) {
            console.warn('⚠️ Conteneur avatar non trouvé');
            return;
        }

        if (!this.avatarInput) {
            console.warn('⚠️ Input avatar non trouvé');
            return;
        }

        // Écouteur d'upload
        this.avatarInput.addEventListener('change', (event) => {
            this.handleUpload(event);
        });

        // Mise à jour initiale
        this.updateDisplay();
    }

    /**
     * Gère l'upload d'un fichier
     */
    async handleUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Valider le fichier
        const validation = this.avatarService.validateFile(file);
        if (!validation.valid) {
            if (this.showToast) {
                this.showToast(`❌ ${validation.error}`, 3000);
            }
            this.resetInput();
            return;
        }

        try {
            // Convertir en base64
            const imageData = await this.avatarService.fileToBase64(file);
            
            // Sauvegarder
            this.avatarService.saveAvatar(imageData);
            
            // Mettre à jour l'affichage
            this.updateDisplay();
            
            if (this.showToast) {
                this.showToast('✅ Photo de profil mise à jour !', 2000);
            }
            
            // Callback
            this.onUpdate(imageData);
            
        } catch (error) {
            console.error('❌ Erreur upload avatar:', error);
            if (this.showToast) {
                this.showToast('❌ Erreur lors de l\'upload', 3000);
            }
        }

        this.resetInput();
    }

    /**
     * Met à jour l'affichage de l'avatar
     */
    updateDisplay() {
        if (!this.avatarContainer) return;

        const avatar = this.avatarService.getAvatar();
        const initials = this.avatarService.getInitials();

        if (avatar) {
            this.avatarContainer.innerHTML = `
                <img src="${avatar}" alt="Photo de profil">
                <div class="avatar-upload-overlay">
                    <label for="avatarInput" class="avatar-upload-label">
                        <span class="icon">📷</span> Modifier
                    </label>
                    <input type="file" id="avatarInput" accept="image/*" style="display:none;">
                </div>
            `;
        } else {
            this.avatarContainer.innerHTML = `
                <span class="avatar-initials">${initials}</span>
                <div class="avatar-upload-overlay">
                    <label for="avatarInput" class="avatar-upload-label">
                        <span class="icon">📷</span> Ajouter
                    </label>
                    <input type="file" id="avatarInput" accept="image/*" style="display:none;">
                </div>
            `;
        }

        // Réattacher l'événement
        const newInput = document.getElementById('avatarInput');
        if (newInput) {
            newInput.addEventListener('change', (event) => {
                this.handleUpload(event);
            });
        }

        // Mettre à jour la référence
        this.avatarInput = document.getElementById('avatarInput');
    }

    /**
     * Réinitialise l'input file
     */
    resetInput() {
        if (this.avatarInput) {
            this.avatarInput.value = '';
        }
    }

    /**
     * Supprime l'avatar
     */
    deleteAvatar() {
        this.avatarService.deleteAvatar();
        this.updateDisplay();
        if (this.showToast) {
            this.showToast('🗑️ Photo de profil supprimée', 2000);
        }
        this.onUpdate(null);
    }
}

export default AvatarUpload;