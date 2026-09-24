// ============================================================
// PROGRESSION SERVICE - Gestion de la progression utilisateur
// VERSION CORRIGÉE - Source unique : rewardHistory + rouletteHistory
// ============================================================

import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export class ProgressionService {
    
    constructor() {
        this.db = getFirestore();
        this.auth = getAuth();
        this.TOTAL_LEVELS = 216;
        this.TOTAL_SPECIALTIES = 36;
    }

    // ============================================================
    // MÉTHODES PUBLIQUES
    // ============================================================

    async getUserProgression(uid) {
        try {
            if (!uid) {
                console.warn('⚠️ Aucun UID fourni');
                return this.getDefaultProgression();
            }

            const userRef = doc(this.db, 'users_ios', uid);  // ✅ Corrigé
            const snapshot = await getDoc(userRef);

            if (!snapshot.exists()) {
                console.warn('⚠️ Utilisateur non trouvé:', uid);
                return this.getDefaultProgression();
            }

            const data = snapshot.data();
            
            // ✅ SCORES DES QUIZ (pour les cases vertes)
            const quizScores = this.extractScoresFromRewardHistory(data.rewardHistory || []);
            
            // ✅ STATS DE LA ROULETTE (pour la section séparée)
            const rouletteStats = this.extractRouletteStats(data.rouletteHistory || []);
            
            // ✅ Calculer les statistiques des QUIZ
            const stats = this.calculateStats(quizScores);
            
            console.log(`📊 Progression chargée: ${stats.totalLevels} niveaux (quiz), ${rouletteStats.total} quiz roulette`);
            
            return {
                uid: uid,
                fullName: data.fullName || 'Anonyme',
                email: data.email || '',
                country: data.country || '🌍',
                quizScores: quizScores,           // ← Pour les cases vertes
                rouletteStats: rouletteStats,     // ← Pour la section Roulette
                totalLevels: stats.totalLevels || 0,
                avgScore: stats.avgScore || 0,
                globalScore: stats.globalScore || 0,
                badges: data.badges || [],
                certificates: data.certificates || [],
                rank: data.rank || 0,
                registeredAt: data.registeredAt || new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Erreur récupération progression:', error);
            return this.getDefaultProgression();
        }
    }

    // ============================================================
    // ✅ EXTRACTION DES SCORES DEPUIS rewardHistory (QUIZ)
    // ============================================================

    extractScoresFromRewardHistory(rewardHistory) {
        const scores = {};
        
        if (!rewardHistory || !Array.isArray(rewardHistory)) {
            console.warn('⚠️ rewardHistory non trouvé');
            return scores;
        }
        
        console.log(`📊 Extraction depuis ${rewardHistory.length} entrées rewardHistory`);
        
        for (const entry of rewardHistory) {
            const specialty = entry.specialty;
            const level = entry.level;
            const isCorrect = entry.isCorrect === true;
            
            if (!specialty || !level) continue;
            
            const cleanSpecialty = this.cleanSpecialtyName(specialty);
            const cleanLevel = this.cleanLevelName(level);
            
            const key = `${cleanSpecialty}_${cleanLevel}`;
            const score = isCorrect ? 100 : 0;
            
            if (!scores[key] || scores[key] < score) {
                scores[key] = score;
            }
        }
        
        console.log(`📊 ${Object.keys(scores).length} scores uniques extraits de rewardHistory`);
        return scores;
    }

    // ============================================================
    // ✅ NOUVELLE MÉTHODE : STATS DE LA ROULETTE
    // ============================================================

    extractRouletteStats(rouletteHistory) {
        if (!rouletteHistory || !Array.isArray(rouletteHistory) || rouletteHistory.length === 0) {
            return {
                total: 0,
                success: 0,
                successRate: 0,
                bestSpecialty: 'Aucune',
                bestSpecialtyRate: 0,
                specialtyStats: {}
            };
        }
        
        const total = rouletteHistory.length;
        const success = rouletteHistory.filter(h => h.isCorrect === true).length;
        const successRate = Math.round((success / total) * 100);
        
        // Statistiques par spécialité
        const specialtyStats = {};
        rouletteHistory.forEach(h => {
            const key = h.specialty || 'Inconnue';
            if (!specialtyStats[key]) {
                specialtyStats[key] = { total: 0, success: 0 };
            }
            specialtyStats[key].total++;
            if (h.isCorrect === true) {
                specialtyStats[key].success++;
            }
        });
        
        // Trouver la meilleure spécialité (minimum 2 tentatives)
        let bestSpecialty = 'Aucune';
        let bestSpecialtyRate = 0;
        for (const [spec, stats] of Object.entries(specialtyStats)) {
            if (stats.total >= 2) {
                const rate = Math.round((stats.success / stats.total) * 100);
                if (rate > bestSpecialtyRate) {
                    bestSpecialtyRate = rate;
                    bestSpecialty = spec;
                }
            }
        }
        
        // Si aucune spécialité n'a 2 tentatives, prendre celle avec le meilleur taux
        if (bestSpecialty === 'Aucune' && Object.keys(specialtyStats).length > 0) {
            for (const [spec, stats] of Object.entries(specialtyStats)) {
                const rate = Math.round((stats.success / stats.total) * 100);
                if (rate > bestSpecialtyRate) {
                    bestSpecialtyRate = rate;
                    bestSpecialty = spec;
                }
            }
        }
        
        return {
            total,
            success,
            successRate,
            bestSpecialty,
            bestSpecialtyRate,
            specialtyStats
        };
    }

    // ============================================================
    // NETTOYAGE DES NOMS
    // ============================================================

    cleanSpecialtyName(name) {
        if (!name) return '';
        
        let cleaned = name.toLowerCase()
            .replace(/\s+/g, '_')
            .replace(/[^a-z0-9_]/g, '')
            .replace(/__+/g, '_');
        
        const mapping = {
            'anesthesiologie': 'anesthesiologie',
            'endodontie': 'endo',
            'esthetique': 'esthetique',
            'sante_publique': 'sante_publique',
            'seniors': 'seniors',
            'syndicat': 'syndicat',
            'orthodontie': 'orthodontie',
            'assistantes_dentaires': 'assistantes_dentaires',
            'femmes_dentistes': 'Femmes_dentistes',
            'onmd_crs_crn': 'ONMD_CRS_CRN',
            'fiscalite_du_dentiste': 'fiscalite_dentiste',
            'code_de_deontologie': 'code_deontologie',
            'amenagement_du_cabinet': 'amenagement_cabinet',
            'relationnel_psychomotricite': 'Relationnel_Psychomotricite',
            'cfao_impression_3d': 'cfao_impression3d',
            'conflits_mediation': 'conflits_médiation',
            'ethique_deontologie': 'ethique_deontologie',
            'futur_docteur': 'futur_docteur',
            'mutuelles_prises_en_charge': 'mutuelles_prises_en_charge',
            'soins_conservateurs': 'Soins_conservateurs',
            'informatique_logiciels_dentaires': 'Informatique_Logiciels_dentaires',
            'comptabilite_fiscalite': 'comptabilite_fiscalite',
            'conventionnement_amo': 'conventionnement_amo',
            'formes_juridiques': 'formes_juridiques',
            'gestion_cabinet': 'gestion_cabinet',
            'aides_installation': 'aides_installation',
            'medecine_buccale': 'medecine_buccale',
            'parodontologie': 'parodontologie',
            'pedodontie': 'pedodontie',
            'prothese': 'prothese',
            'implantologie': 'implantologie',
            'chirurgie': 'chirurgie',
            'photographie': 'photographie',
            'radiologie': 'radiologie',
            'sterilisation': 'sterilisation',
            'materiaux_dentaires': 'materiaux_dentaires'
        };
        
        return mapping[cleaned] || cleaned;
    }

    cleanLevelName(name) {
        if (!name) return '';
        const mapping = {
            'debutant1': 'debutant1',
            'debutant2': 'debutant2',
            'intermediaire1': 'intermediaire1',
            'intermediaire2': 'intermediaire2',
            'expert1': 'expert1',
            'expert2': 'expert2'
        };
        return mapping[name] || name;
    }

    // ============================================================
    // CALCUL DES STATISTIQUES (QUIZ SEULEMENT)
    // ============================================================

    calculateStats(scores) {
        if (!scores || typeof scores !== 'object' || Object.keys(scores).length === 0) {
            return {
                totalLevels: 0,
                completedLevels: 0,
                avgScore: 0,
                globalScore: 0,
                completionRate: 0
            };
        }
        
        let totalScore = 0;
        let completedLevels = 0;
        let totalLevels = 0;

        for (const [key, value] of Object.entries(scores)) {
            if (typeof value === 'number') {
                totalLevels++;
                totalScore += value;
                if (value >= 60) {
                    completedLevels++;
                }
            }
        }

        const avgScore = totalLevels > 0 ? Math.round(totalScore / totalLevels) : 0;
        const completionBonus = this.TOTAL_LEVELS > 0 ? (completedLevels / this.TOTAL_LEVELS) * 100 : 0;
        const globalScore = Math.round((completionBonus * 0.7) + (avgScore * 0.3));

        console.log(`📊 STATS QUIZ: totalLevels=${totalLevels}, completedLevels=${completedLevels}, avgScore=${avgScore}%`);

        return {
            totalLevels: totalLevels,
            completedLevels: completedLevels,
            avgScore: avgScore,
            globalScore: globalScore,
            completionRate: this.TOTAL_LEVELS > 0 ? Math.round((completedLevels / this.TOTAL_LEVELS) * 100) : 0
        };
    }

    // ============================================================
    // AUTRES MÉTHODES (inchangées)
    // ============================================================

    getSpecialtyStatus(scores, specialtyKey, levels) {
        return levels.map(level => {
            const levelKey = `${specialtyKey}_${level.id}`;
            const score = scores[levelKey] || 0;
            
            return {
                levelId: level.id,
                levelKey: levelKey,
                score: score,
                completed: score >= 60,
                locked: level.type === 'locked' && score < 60
            };
        });
    }

    countValidLevels(scores) {
        if (!scores || typeof scores !== 'object') return 0;
        let count = 0;
        for (const [key, value] of Object.entries(scores)) {
            if (typeof value === 'number' && value > 0) {
                count++;
            }
        }
        return count;
    }

    async updateLevelScore(uid, levelKey, score) {
        try {
            if (!uid || !levelKey) {
                throw new Error('UID et levelKey requis');
            }

            const userRef = doc(this.db, 'users_ios', uid);  // ✅ Corrigé
            const snapshot = await getDoc(userRef);

            if (!snapshot.exists()) {
                throw new Error('Utilisateur non trouvé');
            }

            const data = snapshot.data();
            const scores = data.scores || {};

            scores[levelKey] = Math.min(100, Math.max(0, score));

            const stats = this.calculateStats(scores);

            await updateDoc(userRef, {
                scores: scores,
                totalLevels: stats.totalLevels,
                avgScore: stats.avgScore,
                globalScore: stats.globalScore,
                lastUpdated: new Date().toISOString()
            });

            return {
                uid: uid,
                scores: scores,
                totalLevels: stats.totalLevels,
                avgScore: stats.avgScore,
                globalScore: stats.globalScore,
                levelUpdated: levelKey,
                newScore: score
            };

        } catch (error) {
            console.error('❌ Erreur mise à jour score:', error);
            throw error;
        }
    }

    async addBadge(uid, badgeId) {
        try {
            if (!uid || !badgeId) {
                throw new Error('UID et badgeId requis');
            }

            const userRef = doc(this.db, 'users_ios', uid);  // ✅ Corrigé
            const snapshot = await getDoc(userRef);

            if (!snapshot.exists()) {
                throw new Error('Utilisateur non trouvé');
            }

            const data = snapshot.data();
            const badges = data.badges || [];

            if (badges.includes(badgeId)) {
                return badges;
            }

            badges.push(badgeId);

            await updateDoc(userRef, {
                badges: badges
            });

            return badges;

        } catch (error) {
            console.error('❌ Erreur ajout badge:', error);
            throw error;
        }
    }

    async addCertificate(uid, certificateId) {
        try {
            if (!uid || !certificateId) {
                throw new Error('UID et certificateId requis');
            }

            const userRef = doc(this.db, 'users_ios', uid);  // ✅ Corrigé
            const snapshot = await getDoc(userRef);

            if (!snapshot.exists()) {
                throw new Error('Utilisateur non trouvé');
            }

            const data = snapshot.data();
            const certificates = data.certificates || [];

            if (certificates.includes(certificateId)) {
                return certificates;
            }

            certificates.push(certificateId);

            await updateDoc(userRef, {
                certificates: certificates
            });

            return certificates;

        } catch (error) {
            console.error('❌ Erreur ajout certificat:', error);
            throw error;
        }
    }

    isLevelCompleted(scores, levelKey, threshold = 60) {
        return (scores[levelKey] || 0) >= threshold;
    }

    getDefaultProgression() {
        return {
            uid: null,
            fullName: 'Anonyme',
            email: '',
            country: '🌍',
            quizScores: {},
            rouletteStats: { total: 0, success: 0, successRate: 0, bestSpecialty: 'Aucune', bestSpecialtyRate: 0, specialtyStats: {} },
            totalLevels: 0,
            avgScore: 0,
            globalScore: 0,
            badges: [],
            certificates: [],
            rank: 0,
            registeredAt: new Date().toISOString()
        };
    }
}

export default ProgressionService;