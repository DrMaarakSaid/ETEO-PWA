// ============================================================
// SUBSCRIPTION SERVICE - AVEC GESTION DU TEMPS RÉEL
// ============================================================

import { Logger } from '../logger.js';
import { StorageService } from './storage.js';

const FREE_QUIZ_LIMIT = 30;

export class SubscriptionService {
    constructor() {
        this.storage = new StorageService();
        Logger.info('📦 SubscriptionService initialisé');
    }

    getStatus() {
        const settings = this.storage.getSettings() || {};
        
        if (!settings.quizDuJour) {
            settings.quizDuJour = {
                freeQuizzesUsed: 0,
                totalQuizzesPlayed: 0,
                subscription: null,
                history: [],
                lastPlayed: null
            };
            this.storage.saveSettings(settings);
        }
        
        return settings.quizDuJour;
    }

    getRemainingFreeQuizzes() {
        const status = this.getStatus();
        return Math.max(0, FREE_QUIZ_LIMIT - status.freeQuizzesUsed);
    }

    hasFreeQuizzesRemaining() {
        return this.getRemainingFreeQuizzes() > 0;
    }

    hasActiveSubscription() {
        const status = this.getStatus();
        if (!status.subscription) return false;
        const now = new Date();
        const endDate = new Date(status.subscription.endDate);
        return now < endDate;
    }

    canPlay() {
        return this.hasFreeQuizzesRemaining() || this.hasActiveSubscription();
    }

    incrementFreeQuizzesUsed() {
        const settings = this.storage.getSettings() || {};
        if (!settings.quizDuJour) {
            settings.quizDuJour = { freeQuizzesUsed: 0, totalQuizzesPlayed: 0, history: [] };
        }
        settings.quizDuJour.freeQuizzesUsed++;
        settings.quizDuJour.totalQuizzesPlayed++;
        settings.quizDuJour.lastPlayed = new Date().toISOString();
        this.storage.saveSettings(settings);
        Logger.info(`🎰 Quiz gratuit utilisé : ${settings.quizDuJour.freeQuizzesUsed}/${FREE_QUIZ_LIMIT}`);
    }

    // ============================================================
    // 🔥 RECORD RESULT - AVEC TEMPS RÉEL
    // ============================================================
    
    recordResult(specialty, level, questionId, isCorrect, timeSpent) {
        const settings = this.storage.getSettings() || {};
        
        // Initialiser la structure des scores
        if (!settings.scores) settings.scores = {};
        if (!settings.scores[specialty]) settings.scores[specialty] = {};
        if (!settings.scores[specialty][level]) {
            settings.scores[specialty][level] = {
                score: 0,
                total: 0,
                percentage: 0,
                timeSpent: 0,      // ✅ TEMPS RÉEL EN SECONDES
                attempts: 0,
                lastAttempt: null
            };
        }
        
        const levelData = settings.scores[specialty][level];
        
        // Mettre à jour le score
        if (isCorrect) {
            levelData.score = (levelData.score || 0) + 1;
        }
        levelData.total = (levelData.total || 0) + 1;
        levelData.percentage = Math.round((levelData.score / levelData.total) * 100);
        levelData.attempts = (levelData.attempts || 0) + 1;
        levelData.lastAttempt = new Date().toISOString();
        
        // ✅ AJOUTER LE TEMPS RÉEL
        if (timeSpent && timeSpent > 0) {
            levelData.timeSpent = (levelData.timeSpent || 0) + timeSpent;
        }
        
        this.storage.saveSettings(settings);
        
        // ✅ LOG POUR VÉRIFICATION
        Logger.info(`📊 Résultat: ${specialty} - ${level} - ${isCorrect ? '✅' : '❌'} - ${timeSpent || 0}s - Total: ${levelData.timeSpent}s`);
        
        // Historique Quiz du Jour (si applicable)
        if (settings.quizDuJour) {
            if (!settings.quizDuJour.history) settings.quizDuJour.history = [];
            settings.quizDuJour.history.push({
                date: new Date().toISOString(),
                specialty: specialty,
                level: level,
                questionId: questionId,
                isCorrect: isCorrect,
                timeSpent: timeSpent || 0
            });
            if (settings.quizDuJour.history.length > 200) {
                settings.quizDuJour.history = settings.quizDuJour.history.slice(-200);
            }
            this.storage.saveSettings(settings);
        }
    }

    // ============================================================
    // GET TOTAL TIME SPENT (POUR LE DASHBOARD)
    // ============================================================
    
    getTotalTimeSpent() {
        const settings = this.storage.getSettings() || {};
        const scores = settings.scores || {};
        let totalSeconds = 0;
        
        Object.keys(scores).forEach(specialty => {
            const specialtyScores = scores[specialty] || {};
            Object.keys(specialtyScores).forEach(level => {
                const levelData = specialtyScores[level];
                if (levelData && levelData.timeSpent) {
                    totalSeconds += levelData.timeSpent;
                }
            });
        });
        
        return totalSeconds;
    }

    // ============================================================
    // GET COMPLETED SPECIALTIES (AVEC TEMPS)
    // ============================================================
    
    getCompletedSpecialties() {
        const settings = this.storage.getSettings() || {};
        const scores = settings.scores || {};
        const completed = [];
        
        Object.keys(scores).forEach(specialty => {
            const specialtyScores = scores[specialty] || {};
            let allLevelsCompleted = true;
            let totalScore = 0;
            let totalQuestions = 0;
            let totalTime = 0;
            
            ['debutant1', 'debutant2', 'intermediaire1', 'intermediaire2', 'expert1', 'expert2'].forEach(level => {
                const levelData = specialtyScores[level];
                if (levelData) {
                    if (levelData.percentage < 60) {
                        allLevelsCompleted = false;
                    }
                    totalScore += levelData.score || 0;
                    totalQuestions += levelData.total || 0;
                    totalTime += levelData.timeSpent || 0;
                } else {
                    allLevelsCompleted = false;
                }
            });
            
            if (allLevelsCompleted && totalQuestions > 0) {
                completed.push({
                    specialty: specialty,
                    score: totalScore,
                    total: totalQuestions,
                    percentage: Math.round((totalScore / totalQuestions) * 100),
                    timeSpent: totalTime
                });
            }
        });
        
        return completed;
    }

    createSubscription(type) {
        const durations = {
            mensuel: { months: 1, price: 4.99, label: 'Mensuel' },
            trimestriel: { months: 3, price: 12.99, label: 'Trimestriel' },
            semestriel: { months: 6, price: 22.99, label: 'Semestriel' },
            annuel: { months: 12, price: 39.99, label: 'Annuel' }
        };
        
        const duration = durations[type];
        if (!duration) {
            Logger.error(`❌ Type d'abonnement invalide: ${type}`);
            return false;
        }
        
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + duration.months);
        
        const settings = this.storage.getSettings() || {};
        if (!settings.quizDuJour) {
            settings.quizDuJour = { freeQuizzesUsed: 0, totalQuizzesPlayed: 0, history: [] };
        }
        
        settings.quizDuJour.subscription = {
            type: type,
            label: duration.label,
            startDate: now.toISOString(),
            endDate: endDate.toISOString(),
            price: duration.price,
            active: true
        };
        
        this.storage.saveSettings(settings);
        Logger.info(`✅ Abonnement ${type} créé jusqu'au ${endDate.toLocaleDateString()}`);
        return true;
    }

    getSubscriptionInfo() {
        const status = this.getStatus();
        if (!status.subscription) return null;
        const now = new Date();
        const endDate = new Date(status.subscription.endDate);
        const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
        return {
            ...status.subscription,
            daysRemaining: daysRemaining,
            isActive: now < endDate,
            isExpired: now >= endDate
        };
    }

    getStats() {
        const status = this.getStatus();
        const history = status.history || [];
        const total = history.length;
        const correct = history.filter(h => h.isCorrect).length;
        const streak = this.calculateStreak(history);
        return {
            total: total,
            correct: correct,
            percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
            streak: streak,
            freeQuizzesUsed: status.freeQuizzesUsed || 0,
            freeQuizzesRemaining: this.getRemainingFreeQuizzes(),
            hasSubscription: this.hasActiveSubscription(),
            lastPlayed: status.lastPlayed || null
        };
    }

    calculateStreak(history) {
        if (!history || history.length === 0) return 0;
        let streak = 0;
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].isCorrect) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    hasPlayedToday() {
        const status = this.getStatus();
        if (!status.lastPlayed) return false;
        const lastDate = new Date(status.lastPlayed);
        const today = new Date();
        return lastDate.getDate() === today.getDate() &&
               lastDate.getMonth() === today.getMonth() &&
               lastDate.getFullYear() === today.getFullYear();
    }

    getWelcomeMessage(userName) {
        const remaining = this.getRemainingFreeQuizzes();
        const hasSub = this.hasActiveSubscription();
        if (hasSub) {
            const info = this.getSubscriptionInfo();
            return `👋 Bonjour ${userName} ! Vous avez un abonnement ${info.label} actif (${info.daysRemaining} jours restants). Profitez du Quiz du Jour à l'infini ! 🎰`;
        } else if (remaining > 0) {
            return `👋 Bonjour ${userName} ! Il vous reste ${remaining} quiz gratuit${remaining > 1 ? 's' : ''}. Profitez-en ! 🎯`;
        } else {
            return `👋 Bonjour ${userName} ! Vous avez utilisé vos 3 quiz gratuits. Abonnez-vous pour continuer ! 💎`;
        }
    }

    reset() {
        const settings = this.storage.getSettings() || {};
        settings.quizDuJour = {
            freeQuizzesUsed: 0,
            totalQuizzesPlayed: 0,
            subscription: null,
            history: [],
            lastPlayed: null
        };
        this.storage.saveSettings(settings);
        Logger.info('🔄 Quiz du Jour réinitialisé');
    }
}

export default SubscriptionService;