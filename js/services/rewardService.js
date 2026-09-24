// ============================================================
// REWARD SERVICE - Gestion des récompenses de la roulette
// ============================================================

import { getFirestore, doc, getDoc, updateDoc, increment, arrayUnion } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export class RewardService {
    
    constructor() {
        this.db = getFirestore();
        this.auth = getAuth();
        this.MAX_DAILY_QUIZZES = 3;
        this.POINTS_PER_CORRECT = 10;
        this.POINTS_PER_WRONG = 0;
        this.BONUS_STREAK = 5;
    }

    // ============================================================
    // MÉTHODES PUBLIQUES
    // ============================================================

    /**
     * Récupère l'utilisateur actuel
     * @returns {Promise<Object>} Données de l'utilisateur
     */
    async getCurrentUser() {
        const user = this.auth.currentUser;
        if (!user) throw new Error('Utilisateur non connecté');
        
        const userRef = doc(this.db, 'users_ios', user.uid);  // ✅ Corrigé
        const snapshot = await getDoc(userRef);
        
        if (!snapshot.exists()) {
            throw new Error('Utilisateur non trouvé');
        }
        
        return { uid: user.uid, data: snapshot.data() };
    }

    /**
     * Ajoute des points à l'utilisateur
     * @param {string} userId - UID de l'utilisateur
     * @param {number} points - Points à ajouter
     * @param {string} reason - Raison de l'ajout
     * @returns {Promise<Object>} Nouveau total de points
     */
    async addPoints(userId, points, reason = 'Quiz du Jour') {
        try {
            const userRef = doc(this.db, 'users_ios', userId);  // ✅ Corrigé
            const snapshot = await getDoc(userRef);
            
            if (!snapshot.exists()) {
                throw new Error('Utilisateur non trouvé');
            }
            
            // Récupérer les points actuels
            const currentData = snapshot.data();
            const currentPoints = currentData.rewardPoints || 0;
            const newTotal = currentPoints + points;
            
            // Mettre à jour
            await updateDoc(userRef, {
                rewardPoints: newTotal,
                lastReward: new Date().toISOString(),
                rewardHistory: arrayUnion({
                    points: points,
                    reason: reason,
                    date: new Date().toISOString()
                })
            });
            
            return {
                pointsAdded: points,
                newTotal: newTotal,
                reason: reason
            };
            
        } catch (error) {
            console.error('❌ Erreur ajout points:', error);
            throw error;
        }
    }

    /**
     * Vérifie et débloque les badges
     * @param {string} userId - UID de l'utilisateur
     * @param {Object} quizResult - Résultat du quiz
     * @returns {Promise<Array>} Liste des badges débloqués
     */
    async checkBadges(userId, quizResult) {
        const unlockedBadges = [];
        
        try {
            const userRef = doc(this.db, 'users_ios', userId);  // ✅ Corrigé
            const snapshot = await getDoc(userRef);
            
            if (!snapshot.exists()) {
                return [];
            }
            
            const userData = snapshot.data();
            const currentBadges = userData.badges || [];
            const currentPoints = userData.rewardPoints || 0;
            
            // 1. Badge "Premier quiz"
            if (!currentBadges.includes('first_quiz') && userData.totalQuizzes > 0) {
                unlockedBadges.push('first_quiz');
            }
            
            // 2. Badge "Série de 3"
            if (!currentBadges.includes('streak_3') && userData.quizStreak >= 3) {
                unlockedBadges.push('streak_3');
            }
            
            // 3. Badge "Rapide" (bonne réponse en moins de 5 secondes)
            if (!currentBadges.includes('rapide') && quizResult.timeSpent < 5 && quizResult.isCorrect) {
                unlockedBadges.push('rapide');
            }
            
            // 4. Badge "Parfait" (100% sur un quiz)
            if (!currentBadges.includes('parfait') && quizResult.score === 100) {
                unlockedBadges.push('parfait');
            }
            
            // 5. Badge "Collectionneur" (10 quiz)
            if (!currentBadges.includes('collectionneur') && userData.totalQuizzes >= 10) {
                unlockedBadges.push('collectionneur');
            }
            
            // 6. Badge "Légende" (100 points)
            if (!currentBadges.includes('legende') && currentPoints >= 100) {
                unlockedBadges.push('legende');
            }
            
            // Sauvegarder les badges débloqués
            if (unlockedBadges.length > 0) {
                await updateDoc(userRef, {
                    badges: arrayUnion(...unlockedBadges)
                });
            }
            
            return unlockedBadges;
            
        } catch (error) {
            console.error('❌ Erreur vérification badges:', error);
            return [];
        }
    }

    /**
     * Enregistre un résultat de quiz
     * @param {string} userId - UID de l'utilisateur
     * @param {Object} quizResult - Résultat du quiz
     * @returns {Promise<Object>} Résumé des récompenses
     */
    async recordQuizResult(userId, quizResult) {
        const rewards = {
            pointsAdded: 0,
            newTotal: 0,
            unlockedBadges: [],
            message: ''
        };
        
        try {
            const userRef = doc(this.db, 'users_ios', userId);  // ✅ Corrigé
            const snapshot = await getDoc(userRef);
            
            if (!snapshot.exists()) {
                throw new Error('Utilisateur non trouvé');
            }
            
            const userData = snapshot.data();
            const currentPoints = userData.rewardPoints || 0;
            const currentQuizzes = userData.totalQuizzes || 0;
            const currentStreak = userData.quizStreak || 0;
            
            // Mettre à jour le nombre de quiz
            const newTotalQuizzes = currentQuizzes + 1;
            
            // Mettre à jour la série
            let newStreak = currentStreak + 1;
            if (!quizResult.isCorrect) {
                newStreak = 0;
            }
            
            // Ajouter des points si bonne réponse
            let pointsAdded = 0;
            if (quizResult.isCorrect) {
                pointsAdded = this.POINTS_PER_CORRECT;
                // Bonus si série > 5
                if (newStreak >= 5) {
                    pointsAdded += this.BONUS_STREAK;
                }
            }
            
            const newTotal = currentPoints + pointsAdded;
            
            // Sauvegarder
            await updateDoc(userRef, {
                rewardPoints: newTotal,
                totalQuizzes: newTotalQuizzes,
                quizStreak: newStreak,
                lastQuizDate: new Date().toISOString(),
                rewardHistory: arrayUnion({
                    points: pointsAdded,
                    isCorrect: quizResult.isCorrect,
                    specialty: quizResult.specialty,
                    level: quizResult.level,
                    timeSpent: quizResult.timeSpent,
                    date: new Date().toISOString()
                })
            });
            
            // Vérifier les badges
            const unlockedBadges = await this.checkBadges(userId, {
                ...quizResult,
                score: quizResult.isCorrect ? 100 : 0
            });
            
            rewards.pointsAdded = pointsAdded;
            rewards.newTotal = newTotal;
            rewards.unlockedBadges = unlockedBadges;
            rewards.message = this.getRewardMessage(pointsAdded, unlockedBadges);
            
            return rewards;
            
        } catch (error) {
            console.error('❌ Erreur enregistrement quiz:', error);
            return rewards;
        }
    }

    /**
     * Récupère les statistiques de l'utilisateur
     * @param {string} userId - UID de l'utilisateur
     * @returns {Promise<Object>} Statistiques
     */
    async getUserStats(userId) {
        try {
            const userRef = doc(this.db, 'users_ios', userId);  // ✅ Corrigé
            const snapshot = await getDoc(userRef);
            
            if (!snapshot.exists()) {
                return null;
            }
            
            const data = snapshot.data();
            return {
                points: data.rewardPoints || 0,
                totalQuizzes: data.totalQuizzes || 0,
                streak: data.quizStreak || 0,
                badges: data.badges || [],
                lastQuizDate: data.lastQuizDate || null
            };
            
        } catch (error) {
            console.error('❌ Erreur récupération stats:', error);
            return null;
        }
    }

    // ============================================================
    // MÉTHODES PRIVÉES
    // ============================================================

    /**
     * Génère un message de récompense
     */
    getRewardMessage(pointsAdded, unlockedBadges) {
        let messages = [];
        
        if (pointsAdded > 0) {
            messages.push(`🎯 +${pointsAdded} points`);
        }
        
        if (unlockedBadges.length > 0) {
            const badgeNames = {
                'first_quiz': '🏅 Premier quiz',
                'streak_3': '🔥 Série de 3',
                'rapide': '⚡ Rapide',
                'parfait': '💯 Parfait',
                'collectionneur': '📚 Collectionneur',
                'legende': '🌟 Légende'
            };
            
            unlockedBadges.forEach(badgeId => {
                messages.push(`🏆 ${badgeNames[badgeId] || badgeId} débloqué !`);
            });
        }
        
        return messages.join(' • ') || '✅ Quiz terminé !';
    }
}

export default RewardService;