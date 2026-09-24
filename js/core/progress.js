// Gestion de la progression
import { Logger } from '../logger.js';

export class Progress {
    constructor() {
        this.currentQuestion = 0;      // Index (0 → total-1)
        this.totalQuestions = 0;
        this.answers = [];
        this.startTime = null;
        this.endTime = null;
        this.elapsedTime = 0;
        this.completed = false;
        Logger.info('Progress initialisé');
    }

    // Initialiser la progression
    init(totalQuestions) {
        this.totalQuestions = Math.max(0, totalQuestions);  // ✅ CORRECTION : valeurs négatives → 0
        this.currentQuestion = 0;
        this.answers = [];
        this.startTime = Date.now();
        this.endTime = null;
        this.elapsedTime = 0;
        this.completed = false;
        Logger.info(`Progress initialisé pour ${this.totalQuestions} questions`);
        return this;
    }

    // Avancer d'une question
    next() {
        if (this.completed) return false;
        if (this.currentQuestion < this.totalQuestions - 1) {
            this.currentQuestion++;
            Logger.debug(`Question ${this.currentQuestion + 1}/${this.totalQuestions}`);
            return true;
        }
        return false;
    }

    // Reculer d'une question
    previous() {
        if (this.completed) return false;
        if (this.currentQuestion > 0) {
            this.currentQuestion--;
            Logger.debug(`Question ${this.currentQuestion + 1}/${this.totalQuestions}`);
            return true;
        }
        return false;
    }

    // Aller à une question spécifique
    goTo(index) {
        if (this.completed) return false;
        if (index >= 0 && index < this.totalQuestions) {
            this.currentQuestion = index;
            Logger.debug(`Allé à la question ${index + 1}/${this.totalQuestions}`);
            return true;
        }
        return false;
    }

    // Enregistrer une réponse
    saveAnswer(questionIndex, answer) {
        if (this.completed) return this;
        this.answers[questionIndex] = answer;
        Logger.debug(`Réponse enregistrée pour la question ${questionIndex + 1}`);
        return this;
    }

    // Obtenir une réponse
    getAnswer(questionIndex) {
        return this.answers[questionIndex] || null;
    }

    // Vérifier si une question a une réponse
    hasAnswer(questionIndex) {
        return this.answers[questionIndex] !== undefined;
    }

    // Obtenir toutes les réponses
    getAllAnswers() {
        return this.answers;
    }

    // Obtenir le nombre de réponses
    getAnswerCount() {
        return this.answers.filter(a => a !== undefined).length;
    }

    // Vérifier si la progression est terminée
    isComplete() {
        return this.completed;
    }

    // Marquer comme terminé
    complete() {
        if (this.completed) return this;
        this.completed = true;
        this.endTime = Date.now();
        this.elapsedTime = this.endTime - this.startTime;
        Logger.info(`Progression terminée en ${this.getFormattedElapsedTime()}`);
        return this;
    }

    // Obtenir la progression en pourcentage
    getPercentage() {
        if (this.completed) return 100;
        if (this.totalQuestions === 0) return 0;
        return Math.round((this.currentQuestion / this.totalQuestions) * 100);
    }

    // Obtenir le pourcentage de réponses
    getAnswerPercentage() {
        if (this.completed) return 100;
        if (this.totalQuestions === 0) return 0;
        return Math.round((this.getAnswerCount() / this.totalQuestions) * 100);
    }

    // Obtenir le temps écoulé en millisecondes
    getElapsedTime() {
        if (this.endTime) {
            return this.elapsedTime;
        }
        return Date.now() - this.startTime;
    }

    // Obtenir le temps écoulé formaté (mm:ss)
    getFormattedElapsedTime() {
        const ms = this.getElapsedTime();
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Obtenir une représentation textuelle de la progression
    getProgressText() {
        return `${this.currentQuestion + 1}/${this.totalQuestions}`;
    }

    // Obtenir le résumé de la progression
    getSummary() {
        return {
            currentQuestion: this.currentQuestion,
            totalQuestions: this.totalQuestions,
            answers: this.answers,
            answerCount: this.getAnswerCount(),
            isComplete: this.completed,
            startTime: this.startTime,
            endTime: this.endTime,
            elapsedTime: this.getElapsedTime(),
            formattedElapsedTime: this.getFormattedElapsedTime(),
            percentage: this.getPercentage(),
            answerPercentage: this.getAnswerPercentage(),
            progressText: this.getProgressText()
        };
    }

    // Sauvegarder la progression dans le localStorage
    saveToStorage(key = 'eteo_progress') {
        try {
            const data = {
                currentQuestion: this.currentQuestion,
                totalQuestions: this.totalQuestions,
                answers: this.answers,
                startTime: this.startTime,
                endTime: this.endTime,
                elapsedTime: this.elapsedTime,
                completed: this.completed,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(key, JSON.stringify(data));
            Logger.debug('Progression sauvegardée dans le localStorage');
            return true;
        } catch (e) {
            Logger.error('Erreur lors de la sauvegarde de la progression', e);
            return false;
        }
    }

    // Charger la progression depuis le localStorage
    loadFromStorage(key = 'eteo_progress') {
        try {
            const data = localStorage.getItem(key);
            if (!data) return false;
            
            const parsed = JSON.parse(data);
            this.currentQuestion = parsed.currentQuestion || 0;
            this.totalQuestions = parsed.totalQuestions || 0;
            this.answers = parsed.answers || [];
            this.startTime = parsed.startTime || null;
            this.endTime = parsed.endTime || null;
            this.elapsedTime = parsed.elapsedTime || 0;
            this.completed = parsed.completed || false;
            Logger.info('Progression chargée depuis le localStorage');
            return true;
        } catch (e) {
            Logger.error('Erreur lors du chargement de la progression', e);
            return false;
        }
    }

    // Effacer la progression du localStorage
    clearFromStorage(key = 'eteo_progress') {
        try {
            localStorage.removeItem(key);
            Logger.info('Progression effacée du localStorage');
            return true;
        } catch (e) {
            Logger.error('Erreur lors de l\'effacement de la progression', e);
            return false;
        }
    }

    // Réinitialiser la progression
    reset() {
        this.currentQuestion = 0;
        this.totalQuestions = 0;
        this.answers = [];
        this.startTime = null;
        this.endTime = null;
        this.elapsedTime = 0;
        this.completed = false;
        Logger.info('Progression réinitialisée');
        return this;
    }

    // Vérifier si la progression a commencé
    hasStarted() {
        return this.startTime !== null;
    }

    // Vérifier si la progression est en cours
    isInProgress() {
        return this.hasStarted() && !this.completed;
    }

    // Obtenir la question actuelle (index)
    getCurrentQuestion() {
        return this.currentQuestion;
    }

    // Obtenir le nombre total de questions
    getTotalQuestions() {
        return this.totalQuestions;
    }

    // Obtenir la représentation textuelle de la progression (ex: "Question 3/10")
    toString() {
        return `Question ${this.currentQuestion + 1}/${this.totalQuestions}`;
    }
}

export default Progress;