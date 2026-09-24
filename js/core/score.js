// Gestion du score
import { Logger } from '../logger.js';

export class Score {
    constructor() {
        this.correct = 0;
        this.incorrect = 0;
        this.total = 0;
        this.history = [];
        Logger.info('Score initialisé');
    }

    // Ajouter une réponse correcte
    addCorrect() {
        this.correct++;
        this.total++;
        this.history.push({ type: 'correct', timestamp: Date.now() });
        Logger.debug(`Score: +1 correct (${this.correct}/${this.total})`);
        return this.correct;
    }

    // Ajouter une réponse incorrecte
    addIncorrect() {
        this.incorrect++;
        this.total++;
        this.history.push({ type: 'incorrect', timestamp: Date.now() });
        Logger.debug(`Score: +1 incorrect (${this.incorrect}/${this.total})`);
        return this.incorrect;
    }

    // Ajouter un timeout
    addTimeout() {
        this.total++;
        this.history.push({ type: 'timeout', timestamp: Date.now() });
        Logger.debug(`Score: +1 timeout (${this.total})`);
        return this.total;
    }

    // Obtenir le nombre de réponses correctes
    getCorrect() {
        return this.correct;
    }

    // Obtenir le nombre de réponses incorrectes
    getIncorrect() {
        return this.incorrect;
    }

    // Obtenir le nombre total de réponses
    getTotal() {
        return this.total;
    }

    // Obtenir le nombre de timeouts
    getTimeouts() {
        return this.history.filter(h => h.type === 'timeout').length;
    }

    // Obtenir le pourcentage de réussite
    getPercentage(totalQuestions) {
        if (totalQuestions === 0) return 0;
        return Math.round((this.correct / totalQuestions) * 100);
    }

    // Obtenir le pourcentage de réussite basé sur le total répondu
    getPercentageAnswered() {
        if (this.total === 0) return 0;
        return Math.round((this.correct / this.total) * 100);
    }

    // Obtenir le score formaté (ex: "5/10")
    getFormattedScore(totalQuestions) {
        return `${this.correct}/${totalQuestions}`;
    }

    // Obtenir le score formaté avec pourcentage
    getFormattedScoreWithPercentage(totalQuestions) {
        return `${this.getFormattedScore(totalQuestions)} (${this.getPercentage(totalQuestions)}%)`;
    }

    // Obtenir l'historique complet
    getHistory() {
        return this.history;
    }

    // Obtenir le résumé du score
    getSummary(totalQuestions) {
        return {
            correct: this.correct,
            incorrect: this.incorrect,
            total: this.total,
            timeouts: this.getTimeouts(),
            percentage: this.getPercentage(totalQuestions),
            percentageAnswered: this.getPercentageAnswered(),
            formatted: this.getFormattedScore(totalQuestions),
            history: this.history
        };
    }

    // Vérifier si le score est parfait
    isPerfect(totalQuestions) {
        return this.correct === totalQuestions && totalQuestions > 0;
    }

    // Vérifier si le score est en dessous de la moyenne
    isBelowAverage(totalQuestions) {
        return this.getPercentage(totalQuestions) < 50;
    }

    // Réinitialiser le score
    reset() {
        this.correct = 0;
        this.incorrect = 0;
        this.total = 0;
        this.history = [];
        Logger.info('Score réinitialisé');
        return this;
    }

    // Sauvegarder le score dans le localStorage
    saveToStorage(key = 'eteo_score') {
        try {
            const data = {
                correct: this.correct,
                incorrect: this.incorrect,
                total: this.total,
                history: this.history,
                timestamp: new Date().toISOString()
            };
            localStorage.setItem(key, JSON.stringify(data));
            Logger.debug('Score sauvegardé dans le localStorage');
            return true;
        } catch (e) {
            Logger.error('Erreur lors de la sauvegarde du score', e);
            return false;
        }
    }

    // Charger le score depuis le localStorage
    loadFromStorage(key = 'eteo_score') {
        try {
            const data = localStorage.getItem(key);
            if (!data) return false;
            
            const parsed = JSON.parse(data);
            this.correct = parsed.correct || 0;
            this.incorrect = parsed.incorrect || 0;
            this.total = parsed.total || 0;
            this.history = parsed.history || [];
            Logger.info('Score chargé depuis le localStorage');
            return true;
        } catch (e) {
            Logger.error('Erreur lors du chargement du score', e);
            return false;
        }
    }

    // Effacer le score du localStorage
    clearFromStorage(key = 'eteo_score') {
        try {
            localStorage.removeItem(key);
            Logger.info('Score effacé du localStorage');
            return true;
        } catch (e) {
            Logger.error('Erreur lors de l\'effacement du score', e);
            return false;
        }
    }

    // Obtenir une représentation textuelle du score
    toString(totalQuestions) {
        return this.getFormattedScoreWithPercentage(totalQuestions);
    }
}

export default Score;