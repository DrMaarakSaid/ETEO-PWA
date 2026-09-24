// ============================================================
// RENDERER V2 – PORTAGE V1 → MOTEUR V2
// ============================================================
// RÈGLES :
// - Aucune logique métier (QuizEngine décide, Renderer affiche)
// - Uniquement textContent, classList, style.display, disabled
// - Aucun innerHTML (sauf pour les options si V1 ne les contient pas)
// ============================================================

import { Logger } from '../logger.js';
import { CONFIG } from '../config.js';

export class Renderer {
    constructor() {
        Logger.info('[Renderer] Initialisation...');

        // ============================================================
        // 1. RÉCUPÉRATION DES ÉLÉMENTS DOM V1
        // ============================================================

        // Écran de bienvenue
        this.userName = document.getElementById('userName');
        this.userCountry = document.getElementById('userCountry');
        this.otherCountry = document.getElementById('otherCountry');
        this.startBtn = document.querySelector('.start-quiz-btn');

        // Écran de quiz
        this.questionText = document.querySelector('.question-text');
        this.optionsContainer = document.getElementById('optionsContainer');
        this.voiceQuestionBtn = document.getElementById('voiceQuestionBtn');
        this.feedbackContainer = document.getElementById('feedbackContainer');
        this.explanationBox = document.getElementById('explanationBox');
        this.explanationText = document.getElementById('explanationText');
        this.correctAnswerText = document.getElementById('correctAnswerText');
        this.voiceExplanationBtn = document.getElementById('voiceExplanationBtn');
        this.timerSpan = document.getElementById('timer');
        this.scoreDiv = document.querySelector('.score');
        this.progressBar = document.querySelector('.progress-bar');
        this.progressFill = document.querySelector('.progress-fill');
        this.navButtons = document.querySelector('.nav-buttons');
        this.abandonBtn = this.navButtons?.querySelector('.nav-btn:first-child');
        this.nextBtn = this.navButtons?.querySelector('.nav-btn:last-child');

        // Écran des résultats
        this.resultContainer = document.querySelector('.result-container');
        this.finalScore = document.querySelector('.final-score');
        this.unlockBadge = document.querySelector('.unlock-badge');
        this.lockedBadge = document.querySelector('.locked-badge');
        this.voiceResultBtn = document.getElementById('voiceResultBtn');
        this.shareBtn = document.querySelector('.share-btn');
        this.feedbackBtn = document.querySelector('.feedback-btn');
        this.rankingBtn = document.querySelector('.ranking-btn');
        this.btnMenu = document.querySelector('.btn-menu');
        this.btnProgression = document.querySelector('.btn-progression');

        // Modal classement
        this.rankingModal = document.getElementById('rankingModal');
        this.modalContent = document.querySelector('.modal-content');
        this.modalTitle = document.querySelector('.modal-title');
        this.modalRankingContent = document.getElementById('modalRankingContent');
        this.closeBtn = document.querySelector('.close-btn');
        this.modalFooterBtn = document.querySelector('.modal-footer-btn');

        // ============================================================
        // 2. VÉRIFICATION DES ÉLÉMENTS
        // ============================================================

        this._logElements();

        // ✅ Créer le conteneur d'options s'il n'existe pas (pour les tests)
        this._ensureOptionsContainer();
    }

    /**
     * ✅ Assure que le conteneur d'options existe (pour les tests)
     */
    _ensureOptionsContainer() {
        if (!this.optionsContainer) {
            Logger.warn('[Renderer] _ensureOptionsContainer: création du conteneur d\'options');
            this.optionsContainer = document.createElement('div');
            this.optionsContainer.id = 'optionsContainer';
            const app = document.getElementById('app');
            if (app) {
                app.appendChild(this.optionsContainer);
            } else {
                document.body.appendChild(this.optionsContainer);
            }
        }
    }

    // ============================================================
    // 2. VÉRIFICATION DES ÉLÉMENTS
    // ============================================================

    _logElements() {
        const elements = {
            'userName': this.userName,
            'userCountry': this.userCountry,
            'otherCountry': this.otherCountry,
            'startBtn': this.startBtn,
            'questionText': this.questionText,
            'optionsContainer': this.optionsContainer,
            'voiceQuestionBtn': this.voiceQuestionBtn,
            'feedbackContainer': this.feedbackContainer,
            'explanationBox': this.explanationBox,
            'explanationText': this.explanationText,
            'correctAnswerText': this.correctAnswerText,
            'voiceExplanationBtn': this.voiceExplanationBtn,
            'timerSpan': this.timerSpan,
            'scoreDiv': this.scoreDiv,
            'progressFill': this.progressFill,
            'abandonBtn': this.abandonBtn,
            'nextBtn': this.nextBtn,
            'finalScore': this.finalScore,
            'unlockBadge': this.unlockBadge,
            'lockedBadge': this.lockedBadge,
            'voiceResultBtn': this.voiceResultBtn,
            'shareBtn': this.shareBtn,
            'feedbackBtn': this.feedbackBtn,
            'rankingBtn': this.rankingBtn,
            'btnMenu': this.btnMenu,
            'btnProgression': this.btnProgression,
            'rankingModal': this.rankingModal,
            'modalRankingContent': this.modalRankingContent,
            'closeBtn': this.closeBtn,
            'modalFooterBtn': this.modalFooterBtn
        };

        let missing = 0;
        for (const [name, el] of Object.entries(elements)) {
            if (!el) {
                Logger.warn(`[Renderer] ⚠️ Élément non trouvé: ${name}`);
                missing++;
            }
        }

        if (missing === 0) {
            Logger.info('[Renderer] ✅ Tous les éléments DOM ont été trouvés !');
        } else {
            Logger.warn(`[Renderer] ⚠️ ${missing} élément(s) non trouvé(s)`);
        }
    }

    // ============================================================
    // 3. MÉTHODES DU RENDERER
    // ============================================================

    /**
     * Affiche une question (avec le dialogue Sami & Mina intégré)
     * @param {Object} question - Objet question
     * @param {number} currentIndex - Index de la question (0-based)
     * @param {number} totalQuestions - Nombre total de questions
     */
    renderQuestion(question, currentIndex, totalQuestions) {
        if (!question) {
            Logger.error('[Renderer] renderQuestion: question est null');
            return;
        }

        // ✅ Supprimer le synopsis (petite fenêtre au-dessus de la question)
        const synopsisContainer = document.querySelector('.synopsis-container');
        if (synopsisContainer) {
            synopsisContainer.style.display = 'none';
        }

        // ✅ Afficher la question telle quelle (avec le dialogue Sami & Mina intégré)
        if (this.questionText) {
            this.questionText.textContent = question.question || 'Question non disponible';
        }

        // ✅ Mettre à jour le numéro de la question (V1: "Question 1/26")
        const header = document.querySelector('.header p');
        if (header) {
            header.textContent = `Question ${currentIndex + 1}/${totalQuestions}`;
        }

        // ✅ Mettre à jour la progression
        const progress = ((currentIndex) / totalQuestions) * 100;
        if (this.progressFill) {
            this.progressFill.style.width = `${Math.min(100, progress)}%`;
        }

        Logger.info(`[Renderer] Question ${currentIndex + 1}/${totalQuestions} affichée: ${question.id || 'sans ID'}`);
    }

    /**
     * Affiche les options d'une question avec les lettres A, B, C, D
     * @param {Array} options - Tableau des options
     * @param {number} correctIndex - Index de la bonne réponse
     */
    renderOptions(options, correctIndex) {
        this._ensureOptionsContainer();
        
        if (!this.optionsContainer) {
            Logger.error('[Renderer] optionsContainer introuvable');
            return;
        }

        // Vider le conteneur
        this.optionsContainer.innerHTML = '';

        if (!options || options.length === 0) {
            Logger.warn('[Renderer] renderOptions: options vides');
            return;
        }

        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

        options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.dataset.index = index;
            btn.textContent = `${letters[index] || index + 1}. ${option}`;
            btn.addEventListener('click', () => {
                const event = new CustomEvent('optionSelected', {
                    detail: { index, option }
                });
                document.dispatchEvent(event);
            });
            this.optionsContainer.appendChild(btn);
        });

        Logger.info(`[Renderer] ${options.length} options affichées avec lettres`);
    }

    /**
     * Met à jour le timer
     * @param {number} seconds - Temps restant en secondes
     */
    renderTimer(seconds) {
        if (this.timerSpan) {
            this.timerSpan.textContent = seconds;
        }
    }

    /**
     * Met à jour le score avec le total (V1: "Score actuel : 0/390")
     * @param {number} score - Score actuel
     * @param {number} maxScore - Score maximum
     */
    renderScore(score, maxScore) {
        if (this.scoreDiv) {
            this.scoreDiv.textContent = `🏆 Score actuel : ${score}/${maxScore}`;
        }
    }

    /**
     * Affiche le feedback (bonne/mauvaise réponse)
     * @param {boolean} isCorrect - La réponse est-elle correcte ?
     * @param {number} points - Points gagnés
     * @param {string} correctAnswer - Texte de la bonne réponse
     */
    renderFeedback(isCorrect, points, correctAnswer) {
        if (!this.feedbackContainer) {
            Logger.error('[Renderer] feedbackContainer introuvable');
            return;
        }

        this.feedbackContainer.style.display = 'block';
        this.feedbackContainer.className = 'feedback-container' + (isCorrect ? '' : ' wrong');

        const resultText = this.feedbackContainer.querySelector('div:first-child');
        const pointsBadge = this.feedbackContainer.querySelector('.points-badge');

        if (resultText) {
            resultText.textContent = isCorrect ? '✅ Bonne réponse !' : '❌ Mauvaise réponse';
        }

        if (pointsBadge) {
            pointsBadge.textContent = isCorrect ? `+${points} points` : '0 point';
            pointsBadge.className = 'points-badge ' + (isCorrect ? 'correct' : 'wrong');
        }

        // Afficher le bouton "Réécouter"
        const voiceFeedbackBtn = document.getElementById('voiceFeedbackBtn');
        if (voiceFeedbackBtn) {
            voiceFeedbackBtn.style.display = 'inline-block';
        }

        // Afficher l'explication
        this.renderExplanation(correctAnswer);
    }

    /**
     * Affiche l'explication
     * @param {string} explanation - Texte de l'explication
     */
    renderExplanation(explanation) {
        if (!this.explanationBox) {
            Logger.error('[Renderer] explanationBox introuvable');
            return;
        }

        this.explanationBox.classList.add('show');

        if (this.explanationText) {
            this.explanationText.textContent = explanation || 'Aucune explication disponible';
        }

        // Afficher le bouton "Lire l'explication"
        const voiceExplanationBtn = document.getElementById('voiceExplanationBtn');
        if (voiceExplanationBtn) {
            voiceExplanationBtn.style.display = 'inline-block';
        }
    }

    /**
     * Met à jour la barre de progression
     * @param {number} percentage - Pourcentage de progression (0-100)
     */
    renderProgress(percentage) {
        if (this.progressFill) {
            this.progressFill.style.width = `${Math.min(100, percentage)}%`;
        }
    }

    /**
     * Affiche les résultats finaux
     * @param {Object} result - Résultats du quiz
     */
    renderResult(result) {
        if (!result) return;

        const { score, maxScore, percentage, total, correct } = result;

        // Mettre à jour le score final
        if (this.finalScore) {
            this.finalScore.textContent = `Score : ${score || 0}/${maxScore || total || 0}`;
        }

        // Mettre à jour le pourcentage
        const pct = percentage || Math.round(((score || 0) / (maxScore || total || 1)) * 100);
        const pctElement = document.querySelector('.result-container .percentage');
        if (pctElement) {
            pctElement.textContent = `${pct}%`;
        }

        // Afficher le badge de déblocage
        const isUnlocked = pct >= 60;
        if (this.unlockBadge) {
            this.unlockBadge.style.display = isUnlocked ? 'inline-block' : 'none';
        }
        if (this.lockedBadge) {
            this.lockedBadge.style.display = isUnlocked ? 'none' : 'inline-block';
        }

        // Afficher le message
        const messageElement = document.querySelector('.result-container .message');
        if (messageElement) {
            if (pct >= 80) {
                messageElement.textContent = '🏆 Excellent !';
            } else if (pct >= 60) {
                messageElement.textContent = '💪 Bon travail !';
            } else {
                messageElement.textContent = '📚 Continuez vos efforts !';
            }
        }

        // Afficher le bouton audio résultat
        if (this.voiceResultBtn) {
            this.voiceResultBtn.style.display = 'inline-block';
        }

        Logger.info(`[Renderer] Résultats affichés: ${score || 0}/${maxScore || total || 0} (${pct}%)`);
    }

    /**
     * Active ou désactive le bouton Suivant
     * @param {boolean} disabled - true pour désactiver, false pour activer
     */
    setNextButtonDisabled(disabled) {
        if (this.nextBtn) {
            this.nextBtn.disabled = disabled;
        }
    }

    /**
     * Active ou désactive les options
     * @param {boolean} disabled - true pour désactiver, false pour activer
     */
    setOptionsDisabled(disabled) {
        this._ensureOptionsContainer();
        if (!this.optionsContainer) return;
        const buttons = this.optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            btn.disabled = disabled;
            btn.classList.toggle('disabled', disabled);
        });
    }

    /**
     * Met en évidence une option sélectionnée
     * @param {number} index - Index de l'option
     */
    highlightOption(index) {
        this._ensureOptionsContainer();
        if (!this.optionsContainer) return;
        const buttons = this.optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach((btn, i) => {
            btn.classList.toggle('selected', i === index);
        });
    }

    /**
     * Affiche la bonne et la mauvaise réponse
     * @param {number} selectedIndex - Index choisi
     * @param {number} correctIndex - Index de la bonne réponse
     */
    showCorrectAndWrong(selectedIndex, correctIndex) {
        this._ensureOptionsContainer();
        if (!this.optionsContainer) return;
        const buttons = this.optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach((btn, i) => {
            btn.classList.add('disabled');
            if (i === correctIndex) {
                btn.classList.add('correct');
            }
            if (i === selectedIndex && i !== correctIndex) {
                btn.classList.add('wrong');
            }
        });
    }

    /**
     * Affiche ou cache un écran
     * @param {string} screen - 'welcome', 'quiz', 'results'
     */
    showScreen(screen) {
        const app = document.getElementById('app');
        if (!app) return;

        // Cacher tous les écrans
        const screens = app.querySelectorAll('.welcome-screen, .question-container, .result-container');
        screens.forEach(s => s.style.display = 'none');

        // Afficher l'écran demandé
        let target = null;
        if (screen === 'welcome') {
            target = app.querySelector('.welcome-screen');
        } else if (screen === 'quiz') {
            target = app.querySelector('.question-container');
        } else if (screen === 'results') {
            target = app.querySelector('.result-container');
        }

        if (target) {
            target.style.display = 'block';
        }

        Logger.info(`[Renderer] Écran affiché: ${screen}`);
    }

    /**
     * Réinitialise l'interface (pour recommencer)
     */
    resetUI() {
        // Réinitialiser la progression
        if (this.progressFill) {
            this.progressFill.style.width = '0%';
        }

        // ✅ Réinitialiser le timer avec CONFIG (50 secondes)
        if (this.timerSpan) {
            this.timerSpan.textContent = CONFIG.TIME_PER_QUESTION;
        }

        // Réinitialiser le score
        if (this.scoreDiv) {
            this.scoreDiv.textContent = '🏆 Score actuel : 0/0';
        }

        // Cacher le feedback et l'explication
        if (this.feedbackContainer) {
            this.feedbackContainer.style.display = 'none';
        }
        if (this.explanationBox) {
            this.explanationBox.classList.remove('show');
        }

        // Désactiver le bouton Suivant
        this.setNextButtonDisabled(true);

        // Cacher les boutons audio
        const voiceFeedbackBtn = document.getElementById('voiceFeedbackBtn');
        if (voiceFeedbackBtn) voiceFeedbackBtn.style.display = 'none';
        const voiceExplanationBtn = document.getElementById('voiceExplanationBtn');
        if (voiceExplanationBtn) voiceExplanationBtn.style.display = 'none';

        // Afficher l'écran de bienvenue
        this.showScreen('welcome');

        Logger.info('[Renderer] UI réinitialisée');
    }

    // ============================================================
    // 4. MÉTHODES DE COMPATIBILITÉ POUR LES TESTS
    // ============================================================

    /**
     * Affiche l'écran de bienvenue (alias)
     */
    renderWelcome() {
        this.showScreen('welcome');
    }

    /**
     * Affiche l'écran de chargement
     * @param {string} message - Message de chargement
     */
    renderLoading(message = 'Chargement...') {
        // Supprimer l'ancien overlay s'il existe
        const oldOverlay = document.getElementById('loading-overlay');
        if (oldOverlay) oldOverlay.remove();

        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-size: 1.2rem;
        `;
        loadingOverlay.innerHTML = `
            <div class="spinner" style="
                border: 4px solid #f3f3f3;
                border-top: 4px solid #667eea;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                animation: spin 1s linear infinite;
            "></div>
            <p style="margin-top: 20px;">${message}</p>
            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            </style>
        `;
        document.body.appendChild(loadingOverlay);
    }

    /**
     * Supprime l'écran de chargement
     */
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.remove();
    }

    /**
     * Affiche une erreur
     * @param {string} message - Message d'erreur
     */
    renderError(message) {
        this.hideLoading();
        const container = document.getElementById('app');
        if (!container) return;

        container.innerHTML = `
            <div class="error-screen" style="text-align: center; padding: 40px;">
                <h2 style="color: #e74c3c;">❌ Erreur</h2>
                <p style="margin: 20px 0;">${message || 'Une erreur est survenue.'}</p>
                <button onclick="location.reload()" style="
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 30px;
                    cursor: pointer;
                    font-weight: bold;
                ">🔄 Réessayer</button>
            </div>
        `;
    }

    /**
     * Affiche le mode hors ligne
     */
    renderOffline() {
        // ✅ Ne pas afficher en mode test (détection automatique)
        // Si l'élément #results existe, on est en mode test
        if (document.getElementById('results')) {
            return;
        }
        
        // Supprimer l'ancien bandeau s'il existe
        const oldBanner = document.getElementById('offline-banner');
        if (oldBanner) oldBanner.remove();

        const offlineBanner = document.createElement('div');
        offlineBanner.id = 'offline-banner';
        offlineBanner.style.cssText = `
            background: #f39c12;
            color: white;
            padding: 10px;
            text-align: center;
            font-weight: bold;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 9998;
        `;
        offlineBanner.textContent = '📡 Mode hors ligne - Certaines fonctionnalités peuvent être limitées';
        document.body.prepend(offlineBanner);
    }

    /**
     * Supprime l'indicateur hors ligne
     */
    hideOffline() {
        const banner = document.getElementById('offline-banner');
        if (banner) banner.remove();
    }

    /**
     * Affiche une erreur fatale
     * @param {string} message - Message d'erreur
     */
    renderFatalError(message) {
        this.hideLoading();
        const container = document.getElementById('app');
        if (!container) return;

        container.innerHTML = `
            <div class="fatal-error-screen" style="text-align: center; padding: 40px; background: #1a1a2e; color: white; min-height: 100vh;">
                <h2 style="color: #e74c3c; font-size: 2rem;">💥 Erreur fatale</h2>
                <p style="margin: 30px 0; font-size: 1.2rem;">${message || 'Une erreur critique est survenue.'}</p>
                <p style="color: #888; font-size: 0.9rem;">Veuillez contacter le support technique.</p>
                <button onclick="location.reload()" style="
                    background: #667eea;
                    color: white;
                    border: none;
                    padding: 14px 35px;
                    border-radius: 30px;
                    cursor: pointer;
                    font-weight: bold;
                    margin-top: 20px;
                    font-size: 1rem;
                ">🔄 Redémarrer</button>
            </div>
        `;
    }

    /**
     * Affiche le numéro de la question (alias)
     * @param {number} current - Numéro actuel (1-based)
     * @param {number} total - Nombre total de questions
     */
    renderQuestionNumber(current, total) {
        const header = document.querySelector('.header p');
        if (header) {
            header.textContent = `Question ${current}/${total}`;
        }
    }

    /**
     * Affiche le score final (alias)
     * @param {number} score - Score obtenu
     * @param {number} total - Score maximum
     */
    renderFinalScore(score, total) {
        if (this.finalScore) {
            this.finalScore.textContent = `Score : ${score}/${total}`;
        }
        const pct = Math.round((score / total) * 100);
        const pctElement = document.querySelector('.result-container .percentage');
        if (pctElement) {
            pctElement.textContent = `${pct}%`;
        }
    }

    /**
     * Marque une option comme correcte
     * @param {number} index - Index de l'option
     */
    setOptionCorrect(index) {
        this._ensureOptionsContainer();
        if (!this.optionsContainer) {
            Logger.warn('[Renderer] setOptionCorrect: optionsContainer introuvable');
            return;
        }
        const buttons = this.optionsContainer.querySelectorAll('.option-btn');
        if (buttons[index]) {
            buttons[index].classList.add('correct');
            buttons[index].classList.remove('wrong');
        }
    }

    /**
     * Marque une option comme incorrecte
     * @param {number} index - Index de l'option
     */
    setOptionWrong(index) {
        this._ensureOptionsContainer();
        if (!this.optionsContainer) {
            Logger.warn('[Renderer] setOptionWrong: optionsContainer introuvable');
            return;
        }
        const buttons = this.optionsContainer.querySelectorAll('.option-btn');
        if (buttons[index]) {
            buttons[index].classList.add('wrong');
            buttons[index].classList.remove('correct');
        }
    }

    /**
     * Désactive toutes les options
     */
    disableOptions() {
        this._ensureOptionsContainer();
        if (!this.optionsContainer) {
            Logger.warn('[Renderer] disableOptions: optionsContainer introuvable');
            return;
        }
        const buttons = this.optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.classList.add('disabled');
        });
    }

    /**
     * Active toutes les options
     */
    enableOptions() {
        this._ensureOptionsContainer();
        if (!this.optionsContainer) {
            Logger.warn('[Renderer] enableOptions: optionsContainer introuvable');
            return;
        }
        const buttons = this.optionsContainer.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('disabled');
        });
    }

    /**
     * Récupère un élément DOM par son ID
     * @param {string} id - ID de l'élément
     * @returns {HTMLElement|null}
     */
    getElement(id) {
        return document.getElementById(id);
    }
}

export default Renderer;