// ============================================================
// BADGE SERVICE - Gestion des badges
// ============================================================

import { BADGES_CONFIG, GIFT_MESSAGES } from '../config.js';

export class BadgeService {
    
    /**
     * @param {StorageService} storage - Instance du service de stockage
     */
    constructor(storage) {
        this.storage = storage;
    }

    // ============================================================
    // MÉTHODES PUBLIQUES
    // ============================================================

    /**
     * Récupère le statut de tous les badges
     * @param {Object} scores - Scores des spécialités
     * @param {Array} specialties - Liste des spécialités
     * @param {Object} settings - Paramètres utilisateur
     * @returns {Array} Liste des badges avec leur statut
     */
    getBadgeStatus(scores, specialties, settings) {
        const stats = this.calculateStats(scores, specialties, settings);
        
        return BADGES_CONFIG.map(badge => ({
            ...badge,
            unlocked: this.checkCondition(badge.condition, stats)
        }));
    }

    /**
     * Compte les badges débloqués
     * @param {Array} badgeStatus - Liste des badges avec statut
     * @returns {number} Nombre de badges débloqués
     */
    getUnlockedCount(badgeStatus) {
        return badgeStatus.filter(b => b.unlocked).length;
    }

    /**
     * Génère le message de cadeau de fin
     * @param {Array} badgeStatus - Liste des badges avec statut
     * @returns {string} Message personnalisé
     */
    getGiftMessage(badgeStatus) {
        const total = badgeStatus.length;
        const unlocked = this.getUnlockedCount(badgeStatus);
        
        if (unlocked === total) {
            return GIFT_MESSAGES.all_unlocked;
        }
        return GIFT_MESSAGES.partial(total - unlocked);
    }

    /**
     * Vérifie si un badge spécifique est débloqué
     * @param {string} badgeId - ID du badge
     * @param {Object} scores - Scores des spécialités
     * @param {Array} specialties - Liste des spécialités
     * @param {Object} settings - Paramètres utilisateur
     * @returns {boolean} true si débloqué
     */
    isBadgeUnlocked(badgeId, scores, specialties, settings) {
        const badge = BADGES_CONFIG.find(b => b.id === badgeId);
        if (!badge) return false;
        
        const stats = this.calculateStats(scores, specialties, settings);
        return this.checkCondition(badge.condition, stats);
    }

    // ============================================================
    // MÉTHODES PRIVÉES
    // ============================================================

    /**
     * Calcule les statistiques nécessaires pour les badges
     * @param {Object} scores - Scores des spécialités
     * @param {Array} specialties - Liste des spécialités
     * @param {Object} settings - Paramètres utilisateur
     * @returns {Object} Statistiques calculées
     */
    calculateStats(scores, specialties, settings) {
        let completedCount = 0;
        let categoriesCompleted = new Set();
        let hasRetrySuccess = false;
        let hasPerfectScore = false;
        let currentStreak = settings.dashboard?.currentStreak || 0;

        specialties.forEach(spec => {
            const specialtyScores = scores[spec.id] || {};
            let hasCompleted = false;
            let specFailures = 0;
            let specAttempts = 0;

            // Niveaux à vérifier
            const levels = ['debutant1', 'debutant2', 'intermediaire1', 'intermediaire2', 'expert1', 'expert2'];
            
            levels.forEach(level => {
                const levelScore = specialtyScores[level];
                if (levelScore) {
                    specAttempts++;
                    const isSuccess = levelScore.percentage >= 60;
                    
                    if (isSuccess) {
                        hasCompleted = true;
                        // Vérifier si score parfait
                        if (levelScore.score === levelScore.total && levelScore.total > 0) {
                            hasPerfectScore = true;
                        }
                    } else {
                        specFailures++;
                    }
                }
            });

            // Vérifier "réussir après un échec"
            if (specFailures > 0 && specAttempts > 0) {
                const hasSuccess = specialtyScores[Object.keys(specialtyScores).find(l => 
                    specialtyScores[l]?.percentage >= 60
                )];
                if (hasSuccess) {
                    hasRetrySuccess = true;
                }
            }

            if (hasCompleted) {
                completedCount++;
                categoriesCompleted.add(spec.category);
            }
        });

        return {
            completedCount,
            categoriesCompleted,
            hasRetrySuccess,
            hasPerfectScore,
            currentStreak
        };
    }

    /**
     * Vérifie une condition spécifique de badge
     * @param {string} condition - Condition à vérifier
     * @param {Object} stats - Statistiques calculées
     * @returns {boolean} true si condition remplie
     */
    checkCondition(condition, stats) {
        const { completedCount, categoriesCompleted, hasPerfectScore, hasRetrySuccess, currentStreak } = stats;
        
        switch (condition) {
            case 'first_completed':
                return completedCount >= 1;
                
            case 'streak_3':
                return currentStreak >= 3 || completedCount >= 3;
                
            case 'categories_3':
                return categoriesCompleted.size >= 3;
                
            case 'fast_completion':
                return hasPerfectScore;
                
            case 'retry_success':
                return hasRetrySuccess;
                
            case 'top_10':
                return completedCount >= 10;
                
            default:
                return false;
        }
    }

    /**
     * Récupère les astuces pour un badge
     * @param {string} badgeId - ID du badge
     * @returns {string|null} Astuce ou null
     */
    getBadgeTip(badgeId) {
        const badge = BADGES_CONFIG.find(b => b.id === badgeId);
        return badge ? badge.tip : null;
    }

    /**
     * Récupère la description d'un badge
     * @param {string} badgeId - ID du badge
     * @returns {string|null} Description ou null
     */
    getBadgeDescription(badgeId) {
        const badge = BADGES_CONFIG.find(b => b.id === badgeId);
        return badge ? badge.description : null;
    }
}

export default BadgeService;