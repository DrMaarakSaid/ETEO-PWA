// Moteur unique du quiz
import { Logger } from '../logger.js';
import { Validator } from '../validator.js';
import { CONFIG } from '../config.js';
import { Timer } from './timer.js';
import { Score } from './score.js';
import { Progress } from './progress.js';
import { StorageService } from '../services/storage.js';
import { TranslateService } from '../services/translate.js';

export class QuizEngine {
    constructor() {
        this.questions = [];
        this.currentIndex = 0;
        this.answers = [];
        this.isComplete = false;
        this.isStarted = false;
        this.selectedOption = null;
        this.timer = null;
        this.score = null;
        this.progress = null;
        this.storage = null;
        this.translate = null;
        this.onQuestionChange = null;
        this.onComplete = null;
        this.onTimerTick = null;
        this.onTimerEnd = null;
        this.onOptionSelected = null;
        
        Logger.info('QuizEngine initialisé');
    }

    init(storage, translate) {
        this.storage = storage;
        this.translate = translate;
        this.score = new Score();
        this.progress = new Progress();
        Logger.info('QuizEngine prêt');
        return this;
    }

    loadQuestions(data) {
        try {
            Validator.validateQuizData(data);
            this.questions = data.questions;
            this.currentIndex = 0;
            this.answers = [];
            this.isComplete = false;
            this.isStarted = false;
            this.selectedOption = null;
            
            if (this.score) this.score.reset();
            if (this.progress) this.progress.reset();
            
            Logger.info(`${this.questions.length} questions chargées`);
            return true;
        } catch (e) {
            Logger.error('Erreur de chargement', e);
            return false;
        }
    }

    start() {
        if (this.questions.length === 0) {
            Logger.error('Aucune question à démarrer');
            return false;
        }
        
        if (!this.score) {
            this.score = new Score();
        }
        this.score.reset();
        
        if (!this.progress) {
            this.progress = new Progress();
        }
        this.progress.init(this.questions.length);
        
        this.isStarted = true;
        this.currentIndex = 0;
        this.isComplete = false;
        this.selectedOption = null;
        
        this.startTimer();
        
        Logger.info('Quiz démarré');
        return true;
    }

    startTimer() {
        if (this.timer) {
            this.timer.stop();
            this.timer = null;
        }
        
        this.timer = new Timer(CONFIG.TIME_PER_QUESTION);
        this.timer.onTick = (remaining) => {
            if (this.onTimerTick) {
                this.onTimerTick(remaining);
            }
        };
        this.timer.onComplete = () => {
            Logger.warn('⏱️ Temps écoulé !');
            
            // Soumettre la réponse sans arrêter le timer ici
            this.submitAnswer(-1);
            
            // Appeler le callback pour passer à la suite
            if (this.onTimerEnd) {
                this.onTimerEnd();
            }
            
            // Nettoyer le timer
            if (this.timer) {
                this.timer.destroy();
                this.timer = null;
            }
        };
        this.timer.start();
    }

    getCurrentQuestion() {
        if (this.currentIndex >= this.questions.length) {
            return null;
        }
        return this.questions[this.currentIndex];
    }

    selectOption(index) {
        if (this.isComplete) return;
        if (this.selectedOption !== null) return;
        
        const question = this.getCurrentQuestion();
        if (!question) return;
        
        if (index < 0 || index >= question.options.length) {
            Logger.warn('Index d\'option invalide');
            return;
        }
        
        this.selectedOption = index;
        
        if (this.onOptionSelected) {
            this.onOptionSelected(index);
        }
        
        Logger.debug(`Option ${index} sélectionnée`);
    }

    submitAnswer(selectedIndex) {
        if (this.isComplete) return;
        
        const question = this.getCurrentQuestion();
        if (!question) return;
        
        // ✅ Ne pas arrêter le timer si c'est un timeout (-1)
        if (selectedIndex !== -1 && this.timer) {
            this.timer.stop();
            this.timer = null;
        }
        
        const isCorrect = selectedIndex === question.correct;
        const answer = {
            questionId: question.id,
            selected: selectedIndex,
            correct: isCorrect,
            isTimeout: selectedIndex === -1
        };
        
        this.answers[this.currentIndex] = answer;
        
        if (this.score) {
            this.score.reset();
            this.answers.forEach(a => {
                if (a && a.correct === true) {
                    this.score.addCorrect();
                } else if (a && a.correct === false) {
                    this.score.addIncorrect();
                }
            });
        }
        
        if (this.progress) {
            this.progress.saveAnswer(this.currentIndex, answer);
        }
        
        if (this.storage && this.score) {
            this.storage.saveScore(this.score.getCorrect(), this.questions.length);
        }
        
        if (this.currentIndex >= this.questions.length - 1) {
            this.complete();
        }
        
        Logger.debug(`Réponse: ${isCorrect ? '✅' : '❌'}`);
        return isCorrect;
    }

    nextQuestion() {
        if (this.isComplete) return false;
        
        if (this.currentIndex < this.questions.length - 1) {
            this.currentIndex++;
            this.selectedOption = null;
            
            const answer = this.answers[this.currentIndex];
            if (answer) {
                this.selectedOption = answer.selected;
            }
            
            if (this.progress) {
                this.progress.next();
            }
            
            this.startTimer();
            
            if (this.onQuestionChange) {
                this.onQuestionChange(this.getCurrentQuestion());
            }
            
            Logger.debug(`Question ${this.currentIndex + 1}`);
            return true;
        }
        
        this.complete();
        return false;
    }

    previousQuestion() {
        if (this.isComplete) return false;
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.selectedOption = null;
            
            const answer = this.answers[this.currentIndex];
            if (answer) {
                this.selectedOption = answer.selected;
            }
            
            if (this.progress) {
                this.progress.previous();
            }
            
            this.startTimer();
            
            if (this.onQuestionChange) {
                this.onQuestionChange(this.getCurrentQuestion());
            }
            
            Logger.debug(`Retour à la question ${this.currentIndex + 1}`);
            return true;
        }
        return false;
    }

    hasCurrentAnswer() {
        if (this.currentIndex >= this.answers.length) {
            return false;
        }
        return this.answers[this.currentIndex] !== undefined;
    }

    getCurrentAnswer() {
        if (this.currentIndex >= this.answers.length) {
            return null;
        }
        return this.answers[this.currentIndex] || null;
    }

    saveState() {
        if (!this.storage) return false;
        
        const state = {
            questions: this.questions,
            currentIndex: this.currentIndex,
            answers: this.answers,
            isComplete: this.isComplete,
            isStarted: this.isStarted,
            timestamp: new Date().toISOString()
        };
        
        try {
            localStorage.setItem('eteo_quiz_state', JSON.stringify(state));
            Logger.debug('État du quiz sauvegardé');
            return true;
        } catch (e) {
            Logger.error('Erreur lors de la sauvegarde de l\'état', e);
            return false;
        }
    }

    loadState() {
        try {
            const data = localStorage.getItem('eteo_quiz_state');
            if (!data) return false;
            
            const state = JSON.parse(data);
            this.questions = state.questions;
            this.currentIndex = state.currentIndex;
            this.answers = state.answers;
            this.isComplete = state.isComplete;
            this.isStarted = state.isStarted;
            
            Logger.info(`État chargé - Question ${this.currentIndex + 1}/${this.questions.length}`);
            return true;
        } catch (e) {
            Logger.error('Erreur lors du chargement de l\'état', e);
            return false;
        }
    }

    goToQuestion(index) {
        if (this.isComplete) return false;
        if (index < 0 || index >= this.questions.length) return false;
        if (index === this.currentIndex) return true;
        
        for (let i = 0; i < index; i++) {
            if (!this.answers[i]) {
                Logger.warn(`Question ${i + 1} non répondue, impossible d'avancer`);
                return false;
            }
        }
        
        this.currentIndex = index;
        this.selectedOption = null;
        
        const answer = this.answers[index];
        if (answer) {
            this.selectedOption = answer.selected;
        }
        
        if (this.progress) {
            this.progress.goTo(index);
        }
        
        this.startTimer();
        
        if (this.onQuestionChange) {
            this.onQuestionChange(this.getCurrentQuestion());
        }
        
        Logger.debug(`Allé à la question ${index + 1}`);
        return true;
    }

    complete() {
        if (this.isComplete) return;
        
        this.isComplete = true;
        this.isStarted = false;
        
        if (this.timer) {
            this.timer.stop();
            this.timer = null;
        }
        
        if (this.progress) {
            this.progress.complete();
        }
        
        if (this.storage && this.score) {
            this.storage.saveScore(this.score.getCorrect(), this.questions.length);
        }
        
        Logger.info('Quiz terminé');
        
        if (this.onComplete) {
            this.onComplete(this.getResults());
        }
    }

    getResults() {
        return {
            total: this.questions.length,
            answered: this.answers.filter(a => a !== undefined).length,
            correct: this.score ? this.score.getCorrect() : 0,
            incorrect: this.answers.filter(a => a && a.correct === false && !a.isTimeout).length,
            timeout: this.answers.filter(a => a && a.isTimeout).length,
            percentage: this.score ? this.score.getPercentage(this.questions.length) : 0,
            answers: this.answers
        };
    }

    getCorrectCount() {
        if (!this.score) return 0;
        return this.score.getCorrect();
    }

    getIncorrectCount() {
        return this.answers.filter(a => a && a.correct === false && !a.isTimeout).length;
    }

    getTimeoutCount() {
        return this.answers.filter(a => a && a.isTimeout).length;
    }

    isFullyAnswered() {
        return this.answers.filter(a => a !== undefined).length === this.questions.length;
    }

    getUnansweredQuestions() {
        const unanswered = [];
        for (let i = 0; i < this.questions.length; i++) {
            if (!this.answers[i]) {
                unanswered.push(i);
            }
        }
        return unanswered;
    }

    getProgressPercentage() {
        if (this.questions.length === 0) return 0;
        if (this.isComplete) return 100;
        
        const answered = this.answers.filter(a => a !== undefined).length;
        const total = this.questions.length;
        return Math.round((answered / total) * 100);
    }

    reset() {
        this.questions = [];
        this.currentIndex = 0;
        this.answers = [];
        this.isComplete = false;
        this.isStarted = false;
        this.selectedOption = null;
        
        if (this.timer) {
            this.timer.stop();
            this.timer = null;
        }
        
        if (this.score) this.score.reset();
        if (this.progress) this.progress.reset();
        
        localStorage.removeItem('eteo_quiz_state');
        Logger.info('Quiz réinitialisé');
    }

    isQuizComplete() {
        return this.isComplete;
    }

    getTotalQuestions() {
        return this.questions.length;
    }

    getCurrentIndex() {
        return this.currentIndex;
    }
}

export default QuizEngine;