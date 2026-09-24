// js/services/avatarService.js

export class AvatarService {
    
    constructor(storage) {
        this.storage = storage;
        this.maxSize = 2 * 1024 * 1024; // 2MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    }

    /**
     * Récupère l'avatar de l'utilisateur
     * @returns {string|null} - Données de l'image ou null
     */
    getAvatar() {
        const settings = this.storage.getSettings() || {};
        return settings.user?.avatar || null;
    }

    /**
     * Récupère les initiales de l'utilisateur
     * @returns {string}
     */
    getInitials() {
        const settings = this.storage.getSettings() || {};
        const name = settings.user?.fullName || 'Docteur';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    /**
     * Sauvegarde l'avatar
     * @param {string} imageData - Données de l'image (base64)
     */
    saveAvatar(imageData) {
        const settings = this.storage.getSettings() || {};
        if (!settings.user) settings.user = {};
        settings.user.avatar = imageData;
        this.storage.saveSettings(settings);
    }

    /**
     * Supprime l'avatar
     */
    deleteAvatar() {
        const settings = this.storage.getSettings() || {};
        if (settings.user) {
            delete settings.user.avatar;
            this.storage.saveSettings(settings);
        }
    }

    /**
     * Valide le fichier image
     * @param {File} file - Fichier à valider
     * @returns {Object} - { valid: boolean, error: string }
     */
    validateFile(file) {
        if (!file) {
            return { valid: false, error: 'Aucun fichier sélectionné' };
        }

        if (!this.allowedTypes.includes(file.type)) {
            return { valid: false, error: 'Format non supporté (JPEG, PNG, GIF, WEBP uniquement)' };
        }

        if (file.size > this.maxSize) {
            return { valid: false, error: 'Image trop grande (max 2MB)' };
        }

        return { valid: true, error: null };
    }

    /**
     * Convertit un fichier en base64
     * @param {File} file - Fichier à convertir
     * @returns {Promise<string>} - Données base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(file);
        });
    }
}

export default AvatarService;