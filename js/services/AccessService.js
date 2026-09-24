// ============================================================
// ACCESS SERVICE - Version iOS (users_ios)
// ============================================================

import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export class AccessService {
    
    constructor() {
        this.db = getFirestore();
        this.auth = getAuth();
        this.user = null;
        this.userData = null;
        this.initialized = false;
    }

    // ============================================================
    // INITIALISATION - Charger les données utilisateur
    // ============================================================

    async init() {
        const user = this.auth.currentUser;
        if (!user) {
            console.warn('⚠️ AccessService: Utilisateur non connecté');
            this.initialized = true;
            return;
        }

        this.user = user;
        await this.loadUserData();
        this.initialized = true;
        console.log('✅ AccessService iOS initialisé pour:', user.uid);
    }

    async loadUserData() {
        try {
            // ✅ iOS : users_ios
            const userRef = doc(this.db, 'users_ios', this.user.uid);
            const snapshot = await getDoc(userRef);
            if (snapshot.exists()) {
                this.userData = snapshot.data();
                console.log('✅ Données iOS chargées');
            } else {
                console.warn('⚠️ Aucune donnée iOS trouvée');
                this.userData = {};
            }
        } catch (error) {
            console.error('❌ Erreur chargement données:', error);
            this.userData = {};
        }
    }

    // ============================================================
    // MÉTHODES PUBLIQUES - AXE 1 : Quiz / Spécialité
    // ============================================================

    canAccessLevel(specialty, level) {
        // 🔓 Niveaux gratuits : Débutant 1 & 2 → TOUJOURS ACCESSIBLES
        if (level === 'debutant1' || level === 'debutant2') {
            return true;
        }

        // 🔒 Niveaux payants : Intermédiaire 1 → Expert 2
        // ✅ RÈGLE : Absence d'abonnement = REFUS
        const entitlement = this.getSpecialtyEntitlement(specialty);
        
        if (!entitlement || !entitlement.active) {
            return false;
        }

        // Vérifier la date d'expiration
        if (entitlement.endDate) {
            const endDate = new Date(entitlement.endDate);
            if (endDate < new Date()) {
                return false; // Abonnement expiré
            }
        }

        return true;
    }

    getSpecialtyEntitlement(specialty) {
        if (!this.userData || !this.userData.entitlements) {
            return null;
        }
        return this.userData.entitlements.specialties?.[specialty] || null;
    }

    getRouletteEntitlement() {
        if (!this.userData || !this.userData.entitlements) {
            return null;
        }
        return this.userData.entitlements.roulette || null;
    }

    getSubscriptionStatus(specialty) {
        const entitlement = this.getSpecialtyEntitlement(specialty);
        if (!entitlement || !entitlement.active) {
            return {
                active: false,
                type: null,
                remainingDays: 0,
                isExpired: true
            };
        }

        const endDate = new Date(entitlement.endDate);
        const now = new Date();
        const remainingDays = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

        return {
            active: true,
            type: entitlement.type,
            startDate: entitlement.startDate,
            endDate: entitlement.endDate,
            remainingDays: remainingDays,
            isExpired: remainingDays === 0,
            provider: entitlement.provider
        };
    }

    // ============================================================
    // MÉTHODES PUBLIQUES - AXE 2 : Roulette de l'Info
    // ============================================================

    canUseRoulette() {
        // 🔓 10 quiz gratuits
        const stats = this.getRouletteStats();
        if (stats && stats.freeQuizzesUsed < 10) {
            return true;
        }

        // 🔒 Abonnement global
        const rouletteEntitlement = this.getRouletteEntitlement();
        if (rouletteEntitlement && rouletteEntitlement.active) {
            if (rouletteEntitlement.endDate) {
                const endDate = new Date(rouletteEntitlement.endDate);
                if (endDate < new Date()) {
                    return false;
                }
            }
            return true;
        }

        return false;
    }

    getRemainingFreeQuizzes() {
        const stats = this.getRouletteStats();
        if (!stats) return 10;
        return Math.max(0, 10 - (stats.freeQuizzesUsed || 0));
    }

    getRouletteStats() {
        if (!this.userData) return null;
        return this.userData.rouletteStats || null;
    }

    // ============================================================
    // MÉTHODES PUBLIQUES - CERTIFICAT
    // ============================================================

    canTakeCertificateExam(specialty) {
        const certificate = this.getCertificateDetails(specialty);
        if (!certificate) return false;

        if (certificate.certificateIssued) {
            return false;
        }

        const attempts = certificate.attempts || 0;

        if (attempts === 0) {
            return true;
        }

        if (attempts === 1 && certificate.freeRetryAvailable) {
            return true;
        }

        if (attempts >= 2 && certificate.paidAttempts > 0) {
            return true;
        }

        return false;
    }

    canDownloadCertificate(specialty) {
        const certificate = this.getCertificateDetails(specialty);
        if (!certificate) return false;
        return certificate.certificateIssued === true;
    }

    // ✅ NOUVELLE MÉTHODE : Vérifie si le certificat a été PAYÉ
    hasCertificateAccess(specialty) {
        if (!this.userData || !this.userData.certificates) {
            return false;
        }
        const cert = this.userData.certificates[specialty];
        return cert?.purchased === true;
    }

    getCertificateDetails(specialty) {
        if (!this.userData || !this.userData.certificateDetails) {
            return null;
        }
        return this.userData.certificateDetails[specialty] || null;
    }

    getCertificateAttemptsInfo(specialty) {
        const certificate = this.getCertificateDetails(specialty);
        if (!certificate) {
            return {
                attempts: 0,
                remainingAttempts: 0,
                canRetry: false,
                freeRetryAvailable: false,
                isPaid: false
            };
        }

        const attempts = certificate.attempts || 0;
        const freeRetryAvailable = certificate.freeRetryAvailable || false;
        const paidAttempts = certificate.paidAttempts || 0;

        let canRetry = false;
        let remainingAttempts = 0;

        if (attempts === 0) {
            canRetry = true;
            remainingAttempts = 1;
        } else if (attempts === 1 && freeRetryAvailable) {
            canRetry = true;
            remainingAttempts = 1;
        } else if (attempts >= 2 && paidAttempts > 0) {
            canRetry = true;
            remainingAttempts = 1;
        }

        return {
            attempts: attempts,
            remainingAttempts: remainingAttempts,
            canRetry: canRetry,
            freeRetryAvailable: freeRetryAvailable,
            isPaid: paidAttempts > 0,
            certificateIssued: certificate.certificateIssued || false,
            status: certificate.status || 'not_started'
        };
    }

    // ============================================================
    // MÉTHODES PUBLIQUES - INFORMATIONS GÉNÉRALES
    // ============================================================

    getUserData() {
        return this.userData;
    }

    isAuthenticated() {
        return this.user !== null;
    }

    isInitialized() {
        return this.initialized;
    }
}

export default AccessService;