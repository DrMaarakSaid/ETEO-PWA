// js/services/tts.js
/**
 * Service TTS (Text-To-Speech) modulaire
 * Gère la synthèse vocale pour toutes les langues supportées d'ETEO
 * Compatible : Navigateur, iOS (speechSynthesis) et Android (plugin natif Capacitor)
 * Singleton - Une seule instance pour toute l'application
 */

class TTSService {
    constructor() {
        // Détection de la plateforme
        this.synthesis = window.speechSynthesis || null;
        this.isNativeAndroid = !!(window.Capacitor && 
                                   window.Capacitor.Plugins && 
                                   window.Capacitor.Plugins.TextToSpeech);
        
        // Supporté si : soit le navigateur (speechSynthesis), soit le plugin natif Android
        this.isSupported = ('speechSynthesis' in window) || this.isNativeAndroid;
        
        // État actuel
        this.currentUtterance = null;
        this.isSpeaking = false;
        
        // Mapping complet des langues vers les codes TTS
        this.languageMap = {
            'fr': 'fr-FR',
            'en': 'en-US',
            'es': 'es-ES',
            'de': 'de-DE',
            'it': 'it-IT',
            'zh': 'zh-CN',
            'ru': 'ru-RU'
        };
        
        // Cache des voix disponibles (navigateur uniquement)
        this.voiceMap = {};
        
        // Charger les voix disponibles (navigateur uniquement)
        if (this.synthesis) {
            this.loadVoices();
            this.synthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
    }

    /**
     * Charge les voix disponibles par langue (navigateur uniquement)
     */
    loadVoices() {
        if (!this.synthesis) return;
        
        const voices = this.synthesis.getVoices();
        
        for (const [lang, code] of Object.entries(this.languageMap)) {
            const voice = voices.find(v => v.lang.toLowerCase() === code.toLowerCase()) ||
                          voices.find(v => v.lang.toLowerCase().startsWith(code.split('-')[0]));
            if (voice) {
                this.voiceMap[lang] = voice;
            }
        }
    }

    /**
     * Lit un texte avec synthèse vocale
     * Choisit automatiquement entre le plugin natif (Android) et speechSynthesis (navigateur/iOS)
     */
    speak(text, language = 'fr', rate = 0.9, pitch = 1, onEnd = null, onError = null) {
        // Vérifier si le TTS est supporté
        if (!this.isSupported) {
            console.warn('⚠️ TTS non supporté par ce navigateur');
            if (onError) onError('TTS non supporté');
            return null;
        }

        // Vérifier si le texte est valide
        if (!text || text.trim() === '') {
            console.warn('⚠️ Texte vide, lecture annulée');
            return null;
        }

        // === CAS 1 : ANDROID (plugin natif Capacitor) ===
        if (this.isNativeAndroid) {
            return this._speakNative(text, language, rate, pitch, onEnd, onError);
        }

        // === CAS 2 : NAVIGATEUR / iOS (speechSynthesis) ===
        return this._speakWeb(text, language, rate, pitch, onEnd, onError);
    }

    /**
     * Lecture via le plugin natif Android
     */
    _speakNative(text, language, rate, pitch, onEnd, onError) {
        const plugin = window.Capacitor.Plugins.TextToSpeech;
        const langCode = this.languageMap[language] || 'fr-FR';
        
        this.isSpeaking = true;
        
        plugin.speak({
            text: text,
            lang: langCode,
            rate: rate,
            pitch: pitch,
            volume: 1.0,
            category: 'ambient'
        }).then(() => {
            this.isSpeaking = false;
            if (onEnd) onEnd();
        }).catch((err) => {
            this.isSpeaking = false;
            console.error('❌ Erreur TTS natif:', err);
            if (onError) onError(err.message || 'Erreur TTS natif');
        });
        
        return null;
    }

    /**
     * Lecture via speechSynthesis (navigateur / iOS)
     */
    _speakWeb(text, language, rate, pitch, onEnd, onError) {
        // Arrêter la lecture en cours
        this.stop();

        // Créer l'utterance (la parole)
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Configurer la langue
        utterance.lang = this.languageMap[language] || 'fr-FR';
        
        // Configurer la vitesse et la hauteur
        utterance.rate = Math.max(0.5, Math.min(2, rate));
        utterance.pitch = Math.max(0.5, Math.min(2, pitch));
        utterance.volume = 1;

        // Utiliser une voix spécifique si disponible
        if (this.voiceMap[language]) {
            utterance.voice = this.voiceMap[language];
        }

        // Callback : début de la lecture
        utterance.onstart = () => {
            this.isSpeaking = true;
        };

        // Callback : fin de la lecture
        utterance.onend = () => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            if (onEnd) onEnd();
        };

        // Callback : erreur
        utterance.onerror = (event) => {
            this.isSpeaking = false;
            this.currentUtterance = null;
            console.error('❌ Erreur TTS:', event.error);
            if (onError) onError(event.error);
        };

        // Lancer la lecture
        this.currentUtterance = utterance;
        this.synthesis.speak(utterance);

        return utterance;
    }

    /**
     * Arrête la lecture en cours
     */
    stop() {
        // Arrêter le plugin natif si on est sur Android
        if (this.isNativeAndroid) {
            try {
                window.Capacitor.Plugins.TextToSpeech.stop();
            } catch (e) {}
        }
        
        // Arrêter speechSynthesis si disponible
        if (this.synthesis) {
            this.synthesis.cancel();
        }
        
        this.isSpeaking = false;
        this.currentUtterance = null;
    }

    /**
     * Vérifie si une lecture est en cours
     */
    isSpeakingNow() {
        return this.isSpeaking || (this.synthesis && this.synthesis.speaking);
    }

    /**
     * Bascule entre lecture et arrêt (pour les boutons)
     */
    togglePlay(text, language, button, rate = 0.9, pitch = 1) {
        if (this.isSpeakingNow()) {
            this.stop();
            if (button) {
                button.textContent = '🔊';
                button.classList.remove('playing');
            }
            return;
        }

        if (button) {
            button.textContent = '⏹️';
            button.classList.add('playing');
        }

        this.speak(text, language, rate, pitch,
            () => {
                if (button) {
                    button.textContent = '🔊';
                    button.classList.remove('playing');
                }
            },
            () => {
                if (button) {
                    button.textContent = '🔊';
                    button.classList.remove('playing');
                }
            }
        );
    }

    /**
     * Récupère la liste des langues supportées
     */
    getAvailableLanguages() {
        return Object.keys(this.languageMap);
    }

    /**
     * Vérifie si une langue est supportée
     */
    isLanguageSupported(language) {
        return language in this.languageMap;
    }
}

// Créer une instance unique (singleton)
const tts = new TTSService();

// Exporter pour les modules ES6
export default tts;

// Exposer globalement pour les scripts inline (onclick, etc.)
if (typeof window !== 'undefined') {
    window.tts = tts;
}