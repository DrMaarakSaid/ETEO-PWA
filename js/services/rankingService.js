// ============================================================
// RANKING SERVICE - Optimisé et Sécurisé (Anti-Quotas)
// ============================================================

import { getFirestore, collection, getDocs, getCountFromServer } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export class RankingService {
    
    constructor() {
        this.db = getFirestore();
        this.auth = getAuth();
        this.TOTAL_LEVELS = 216; // 36 spécialités × 6 niveaux
        this.LEVELS = ['debutant1', 'debutant2', 'intermediaire1', 'intermediaire2', 'expert1', 'expert2'];
        this.TOTAL_SPECIALTIES = 36;
        
        // 🛡️ SYSTÈME DE CACHE ANTI-QUOTA (Mémoire temporaire de 5 minutes)
        this.cachedUsers = null;
        this.cacheTimestamp = 0;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes
    }

    /**
     * Récupère les utilisateurs avec mise en cache pour ne pas saturer Firebase
     */
    async getCachedUsersSnapshot() {
        const now = Date.now();
        // Si on a déjà les données en mémoire depuis moins de 5 minutes, on les réutilise (0 lecture !)
        if (this.cachedUsers && (now - this.cacheTimestamp < this.CACHE_DURATION)) {
            return this.cachedUsers;
        }

        try {
            const usersRef = collection(this.db, 'users_ios');
            const snapshot = await getDocs(usersRef);
            
            // On met en cache
            this.cachedUsers = snapshot;
            this.cacheTimestamp = now;
            return snapshot;
        } catch (error) {
            console.error('❌ Erreur chargement users_ios:', error);
            return null;
        }
    }

    /**
     * Récupère le nombre total d'utilisateurs (Optimisé : 1 seule lecture grâce au serveur)
     */
    async getTotalUsers() {
        try {
            const usersRef = collection(this.db, 'users_ios');
            const snapshot = await getCountFromServer(usersRef);
            return snapshot.data().count || 0;
        } catch (error) {
            console.error('❌ Erreur comptage utilisateurs:', error);
            return 0;
        }
    }

    /**
     * Récupère le classement global (Utilise le cache)
     */
    async getGlobalRanking(limitCount = 100) {
        try {
            const snapshot = await this.getCachedUsersSnapshot();
            if (!snapshot || snapshot.empty) {
                return [];
            }

            const users = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                const uid = doc.id;
                
                const score = this.calculateUserScore(data.scores || {});
                const totalLevels = this.countCompletedLevels(data.scores || {});
                
                users.push({
                    uid: uid,
                    fullName: data.displayName || data.fullName || 'Anonyme',
                    email: data.email || '',
                    country: data.country || 'Non renseigné',
                    score: score,
                    totalLevels: totalLevels,
                    badges: data.badges || [],
                    rank: 0,
                    medal: ''
                });
            });

            users.sort((a, b) => b.score - a.score);
            users.forEach((user, index) => {
                user.rank = index + 1;
                user.medal = this.getMedal(user.rank);
            });

            return users.slice(0, limitCount);

        } catch (error) {
            console.error('❌ Erreur récupération classement:', error);
            return [];
        }
    }

    /**
     * Récupère le classement d'un utilisateur spécifique
     */
    async getUserRank(uid) {
        try {
            const users = await this.getGlobalRanking(1000); // Utilise le cache global
            const currentUser = users.find(u => u.uid === uid);
            
            if (!currentUser) {
                return { rank: 0, total: users.length, user: null, medal: '' };
            }

            return {
                rank: currentUser.rank,
                total: users.length,
                user: currentUser,
                medal: currentUser.medal
            };

        } catch (error) {
            console.error('❌ Erreur getUserRank:', error);
            return { rank: 0, total: 0, user: null, medal: '' };
        }
    }

    /**
     * Récupère le classement d'un utilisateur avec le détail du score
     */
    async getUserRankDetails(uid) {
        try {
            const snapshot = await this.getCachedUsersSnapshot();
            if (!snapshot || snapshot.empty) {
                return { rank: 0, total: 0, user: null, medal: '', details: null };
            }

            const users = [];
            let currentUser = null;
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                const userId = doc.id;
                const scores = data.scores || {};
                
                const scoreResult = this.calculateUserScoreDetails(scores);
                
                const userData = {
                    uid: userId,
                    fullName: data.displayName || data.fullName || 'Anonyme',
                    email: data.email || '',
                    country: data.country || 'Non renseigné',
                    score: scoreResult.finalScore,
                    totalLevels: this.countCompletedLevels(scores),
                    badges: data.badges || [],
                    details: scoreResult
                };
                
                users.push(userData);
                if (userId === uid) {
                    currentUser = userData;
                }
            });

            if (!currentUser) {
                return { rank: 0, total: users.length, user: null, medal: '', details: null };
            }

            users.sort((a, b) => b.score - a.score);
            const rank = users.findIndex(u => u.uid === uid) + 1;
            const medal = this.getMedal(rank);

            return {
                rank: rank,
                total: users.length,
                user: currentUser,
                medal: medal,
                details: currentUser.details
            };

        } catch (error) {
            console.error('❌ Erreur getUserRankDetails:', error);
            return { rank: 0, total: 0, user: null, medal: '', details: null };
        }
    }

    /**
     * Récupère le top 10 des pays par nombre d'utilisateurs
     */
    async getTopCountries() {
        try {
            const snapshot = await this.getCachedUsersSnapshot();
            if (!snapshot || snapshot.empty) {
                return [];
            }

            const countryMap = new Map();
            snapshot.forEach((doc) => {
                const data = doc.data();
                const country = data.country || 'Non renseigné';
                countryMap.set(country, (countryMap.get(country) || 0) + 1);
            });

            return Array.from(countryMap.entries())
                .map(([country, count]) => ({ country, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

        } catch (error) {
            console.error('❌ Erreur getTopCountries:', error);
            return [];
        }
    }

    /**
     * Récupère les pays des 10 meilleurs utilisateurs
     */
    async getTopCountriesByTopUsers() {
        try {
            const users = await this.getGlobalRanking(10);
            const countryMap = new Map();
            
            users.forEach((user) => {
                const country = user.country;
                countryMap.set(country, (countryMap.get(country) || 0) + 1);
            });

            return Array.from(countryMap.entries())
                .map(([country, count]) => ({ country, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

        } catch (error) {
            console.error('❌ Erreur getTopCountriesByTopUsers:', error);
            return [];
        }
    }

    // ============================================================
    // MÉTHODES DE CALCUL (Inchangées pour garantir 0 bug)
    // ============================================================

    calculateUserScore(scores) {
        const result = this.calculateUserScoreDetails(scores);
        return result.finalScore;
    }

    calculateUserScoreDetails(scores) {
        let totalPercentage = 0;
        let completedCount = 0;
        
        for (const [specialty, levels] of Object.entries(scores)) {
            if (typeof levels === 'object' && levels !== null) {
                for (const [level, data] of Object.entries(levels)) {
                    if (data && data.percentage && data.percentage >= 60) {
                        totalPercentage += data.percentage;
                        completedCount++;
                    }
                }
            }
        }
        
        const qualityScore = completedCount > 0 ? Math.round(totalPercentage / completedCount) : 0;
        const completedSpecialties = this.countCompletedSpecialties(scores);
        const completionScore = Math.round((completedSpecialties / this.TOTAL_SPECIALTIES) * 100);
        const finalScore = Math.round((qualityScore * 0.7) + (completionScore * 0.3));
        
        return {
            qualityScore: qualityScore,
            completionScore: completionScore,
            finalScore: finalScore,
            completedCount: completedSpecialties,
            totalSpecialties: this.TOTAL_SPECIALTIES
        };
    }

    countCompletedSpecialties(scores) {
        let count = 0;
        for (const [specialty, levels] of Object.entries(scores)) {
            if (typeof levels === 'object' && levels !== null) {
                let hasCompleted = false;
                for (const [level, data] of Object.entries(levels)) {
                    if (data && data.percentage && data.percentage >= 60) {
                        hasCompleted = true;
                        break;
                    }
                }
                if (hasCompleted) count++;
            }
        }
        return count;
    }

    countCompletedLevels(scores) {
        let count = 0;
        for (const [specialty, levels] of Object.entries(scores)) {
            if (typeof levels === 'object' && levels !== null) {
                for (const [level, data] of Object.entries(levels)) {
                    if (data && data.percentage && data.percentage >= 60) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    getMedal(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    }
}

export default RankingService;