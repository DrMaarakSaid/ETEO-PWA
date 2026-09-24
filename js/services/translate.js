// Service de traduction centralisé
import { Logger } from '../logger.js';
import { CONFIG } from '../config.js';

export class TranslateService {
    constructor() {
        this.currentLang = CONFIG.DEFAULT_LANG;
        this.translations = {};
        this.isLoaded = false;
        Logger.info('TranslateService initialisé');
    }

    async loadLanguage(lang = this.currentLang) {
        try {
            const response = await fetch(`../lang/${lang}.json`);
            if (!response.ok) {
                throw new Error(`Impossible de charger ${lang}.json`);
            }
            this.translations = await response.json();
            this.currentLang = lang;
            this.isLoaded = true;
            Logger.info(`Langue chargée: ${lang}`);
            return true;
        } catch (e) {
            Logger.error('Erreur lors du chargement de la langue', e);
            // Fallback vers le français
            if (lang !== 'fr') {
                Logger.warn('Fallback vers le français');
                return this.loadLanguage('fr');
            }
            return false;
        }
    }

    get(key, params = {}) {
        if (!this.isLoaded) {
            Logger.warn('Traduction non chargée');
            return key;
        }

        const keys = key.split('.');
        let value = this.translations;
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                Logger.warn(`Traduction manquante: ${key}`);
                return key;
            }
        }

        if (typeof value === 'string') {
            // Remplacer les paramètres du type {param}
            return value.replace(/\{(\w+)\}/g, (match, p1) => {
                return params[p1] !== undefined ? params[p1] : match;
            });
        }

        return value;
    }

    getCurrentLang() {
        return this.currentLang;
    }

    getAvailableLanguages() {
        return CONFIG.LANGUAGES;
    }

    isLoaded() {
        return this.isLoaded;
    }
}

export default TranslateService;