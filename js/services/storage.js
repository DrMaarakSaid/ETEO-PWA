// Gestion du stockage local
import { Logger } from '../logger.js';
import { CONFIG } from '../config.js';

export class StorageService {
    constructor() {
        this.keys = CONFIG.STORAGE_KEYS;
        Logger.info('StorageService initialisé');
    }

    saveScore(score, total) {
        try {
            const data = {
                score,
                total,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(this.keys.SCORE, JSON.stringify(data));
            Logger.debug('Score sauvegardé', data);
            return true;
        } catch (e) {
            Logger.error('Erreur lors de la sauvegarde du score', e);
            return false;
        }
    }

    getScore() {
        try {
            const data = localStorage.getItem(this.keys.SCORE);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            Logger.error('Erreur lors de la lecture du score', e);
            return null;
        }
    }

    saveProgress(questionIndex, answers) {
        try {
            const data = {
                questionIndex,
                answers,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(this.keys.PROGRESS, JSON.stringify(data));
            Logger.debug('Progression sauvegardée', data);
            return true;
        } catch (e) {
            Logger.error('Erreur lors de la sauvegarde de la progression', e);
            return false;
        }
    }

    getProgress() {
        try {
            const data = localStorage.getItem(this.keys.PROGRESS);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            Logger.error('Erreur lors de la lecture de la progression', e);
            return null;
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem(this.keys.SETTINGS, JSON.stringify(settings));
            Logger.debug('Paramètres sauvegardés', settings);
            return true;
        } catch (e) {
            Logger.error('Erreur lors de la sauvegarde des paramètres', e);
            return false;
        }
    }

    getSettings() {
        try {
            const data = localStorage.getItem(this.keys.SETTINGS);
            if (!data) return null;
            return JSON.parse(data);
        } catch (e) {
            Logger.error('Erreur lors de la lecture des paramètres', e);
            return null;
        }
    }

    clearAll() {
        try {
            localStorage.removeItem(this.keys.SCORE);
            localStorage.removeItem(this.keys.PROGRESS);
            localStorage.removeItem(this.keys.SETTINGS);
            Logger.info('Toutes les données ont été effacées');
            return true;
        } catch (e) {
            Logger.error('Erreur lors du nettoyage', e);
            return false;
        }
    }

    // ============================================================
    // GESTION DE LA LANGUE (AJOUT)
    // ============================================================

    /**
     * Récupère la langue de l'utilisateur
     * @returns {string} Code de langue (fr, en, es, etc.)
     */
    getLanguage() {
        try {
            const settings = this.getSettings();
            if (settings && settings.language) {
                return settings.language;
            }
            // Fallback : langue par défaut depuis CONFIG
            return CONFIG.DEFAULT_LANG || 'fr';
        } catch (e) {
            Logger.error('Erreur lors de la lecture de la langue', e);
            return 'fr';
        }
    }

    /**
     * Définit la langue de l'utilisateur
     * @param {string} language - Code de langue (fr, en, es, etc.)
     * @returns {boolean} Succès ou échec
     */
    setLanguage(language) {
        try {
            const settings = this.getSettings() || {};
            settings.language = language;
            return this.saveSettings(settings);
        } catch (e) {
            Logger.error('Erreur lors de la sauvegarde de la langue', e);
            return false;
        }
    }

    /**
     * Vérifie si une langue est disponible
     * @param {string} language - Code de langue à vérifier
     * @returns {boolean} Vrai si la langue est supportée
     */
    isLanguageAvailable(language) {
        try {
            return CONFIG.LANGUAGES && CONFIG.LANGUAGES.includes(language);
        } catch (e) {
            Logger.error('Erreur lors de la vérification de la langue', e);
            return false;
        }
    }

    /**
     * Récupère la langue avec fallback si non disponible
     * @returns {string} Code de langue valide
     */
    getValidLanguage() {
        const lang = this.getLanguage();
        // Vérifier si la langue est supportée
        if (CONFIG.LANGUAGES && CONFIG.LANGUAGES.includes(lang)) {
            return lang;
        }
        // Fallback vers la langue par défaut
        return CONFIG.DEFAULT_LANG || 'fr';
    }

    /**
     * Sauvegarde la langue et retourne le résultat
     * @param {string} language - Code de langue
     * @returns {object} { success: boolean, language: string }
     */
    switchLanguage(language) {
        const success = this.setLanguage(language);
        return {
            success,
            language: success ? language : this.getLanguage()
        };
    }
}

export default StorageService;