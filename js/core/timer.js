// Timer de 50 secondes
import { Logger } from '../logger.js';
import { CONFIG } from '../config.js';

export class Timer {
    constructor(duration = CONFIG.TIME_PER_QUESTION) {
        this.duration = duration;
        this.remaining = duration;
        this.interval = null;
        this.isRunning = false;
        this.onTick = null;
        this.onComplete = null;
        Logger.info(`Timer initialisé avec ${duration}s`);
    }

    // Démarrer le timer
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.remaining = this.duration;
        
        this.interval = setInterval(() => {
            this.remaining--;
            Logger.debug(`⏱️ ${this.remaining}s`);
            
            if (this.onTick) {
                this.onTick(this.remaining);
            }
            
            if (this.remaining <= 0) {
                this.stop();
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        }, 1000);
        
        Logger.info('Timer démarré');
    }

    // Arrêter le timer
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.isRunning = false;
        Logger.debug('Timer arrêté');
    }

    // Mettre en pause le timer
    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        Logger.debug('Timer en pause');
    }

    // Reprendre le timer
    resume() {
        if (this.isRunning) return;
        if (this.remaining <= 0) {
            Logger.warn('Timer déjà terminé');
            return;
        }
        
        this.isRunning = true;
        this.interval = setInterval(() => {
            this.remaining--;
            Logger.debug(`⏱️ ${this.remaining}s`);
            
            if (this.onTick) {
                this.onTick(this.remaining);
            }
            
            if (this.remaining <= 0) {
                this.stop();
                if (this.onComplete) {
                    this.onComplete();
                }
            }
        }, 1000);
        
        Logger.debug('Timer repris');
    }

    // Réinitialiser le timer
    reset() {
        this.stop();
        this.remaining = this.duration;
        this.isRunning = false;
        Logger.debug('Timer réinitialisé');
    }

    // Redémarrer le timer
    restart() {
        this.reset();
        this.start();
        Logger.debug('Timer redémarré');
    }

    // Obtenir le temps restant
    getRemaining() {
        return this.remaining;
    }

    // Obtenir la progression (0 à 1)
    getProgress() {
        return (this.duration - this.remaining) / this.duration;
    }

    // Obtenir la progression en pourcentage
    getProgressPercentage() {
        return Math.round(this.getProgress() * 100);
    }

    // Vérifier si le timer est terminé
    isComplete() {
        return this.remaining <= 0;
    }

    // Vérifier si le timer est en cours
    isRunning() {
        return this.isRunning;
    }

    // Vérifier si le timer est en pause
    isPaused() {
        return !this.isRunning && this.remaining > 0 && this.remaining < this.duration;
    }

    // Ajouter du temps (en secondes)
    addTime(seconds) {
        if (this.remaining + seconds > this.duration) {
            this.remaining = this.duration;
        } else {
            this.remaining += seconds;
        }
        Logger.debug(`Temps ajouté: +${seconds}s (${this.remaining}s)`);
        return this.remaining;
    }

    // Soustraire du temps (en secondes)
    subtractTime(seconds) {
        if (this.remaining - seconds < 0) {
            this.remaining = 0;
        } else {
            this.remaining -= seconds;
        }
        Logger.debug(`Temps soustrait: -${seconds}s (${this.remaining}s)`);
        return this.remaining;
    }

    // Obtenir le temps écoulé
    getElapsed() {
        return this.duration - this.remaining;
    }

    // Obtenir une représentation formatée (mm:ss)
    getFormattedTime() {
        const minutes = Math.floor(this.remaining / 60);
        const seconds = this.remaining % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Obtenir une représentation formatée courte (Xs)
    getFormattedShort() {
        return `${this.remaining}s`;
    }

    // Obtenir une représentation textuelle du timer
    toString() {
        return this.getFormattedTime();
    }

    // ============================================================
    // ✅ AJOUT : Détruire le timer et libérer les ressources
    // ============================================================
    destroy() {
        Logger.debug('Timer détruit');
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        this.onTick = null;
        this.onComplete = null;
        this.isRunning = false;
        this.remaining = 0;
    }
}

export default Timer;