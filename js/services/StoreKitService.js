// js/services/StoreKitService.js - VERSION AVEC ACHAT

// ✅ Cette version ajoute la méthode purchase() sans casser le quiz

import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

// 🔍 Détection Capacitor
const isNative = typeof window !== 'undefined' && 
                 window.Capacitor && 
                 typeof window.Capacitor.isNativePlatform === 'function' &&
                 window.Capacitor.isNativePlatform();

console.log(`🔧 StoreKitService: ${isNative ? 'iOS (actif)' : 'Web (désactivé)'}`);

let NativePurchases = null;

// Chargement natif UNIQUEMENT sur iOS
if (isNative) {
    try {
        const module = await import('@capgo/native-purchases');
        NativePurchases = module.NativePurchases;
        console.log('✅ NativePurchases chargé');
    } catch (e) {
        console.warn('⚠️ Plugin non disponible:', e.message);
    }
}

class StoreKitService {
    constructor() {
        this.isNative = isNative && NativePurchases !== null;
        this.products = [];
        this.isReady = false;
        this.auth = getAuth();
        this.db = getFirestore();
        this.functions = getFunctions();
        
        console.log(`📦 StoreKit: ${this.isNative ? 'NATIF ✅' : 'WEB (désactivé)'}`);
    }

    // Initialisation
    async init() {
        if (!this.isNative) {
            this.isReady = true;
            return true;
        }
        
        try {
            await NativePurchases.configure({
                appUserID: this.auth.currentUser?.uid || 'anonymous'
            });
            this.isReady = true;
            console.log('✅ StoreKit natif initialisé');
            return true;
        } catch (e) {
            console.error('❌ Erreur init StoreKit:', e);
            this.isReady = true;
            return false;
        }
    }

    // Chargement des produits
    async loadProducts() {
        if (!this.isNative) return [];
        
        try {
            // Charger les abonnements
            const subs = await NativePurchases.getProducts({
                productIdentifiers: [
                    'eteo.quiz.monthly',
                    'eteo.quiz.annual',
                    'eteo.roulette.annual'
                ],
                type: 'subs'
            });

            // Charger les achats uniques
            const inapps = await NativePurchases.getProducts({
                productIdentifiers: [
                    'eteo.certificate'
                ],
                type: 'inapp'
            });

            this.products = [...(subs.products || []), ...(inapps.products || [])];
            console.log('✅ Produits chargés:', this.products.length);
            return this.products;
        } catch (e) {
            console.error('❌ Erreur loadProducts:', e);
            return [];
        }
    }

    // ✅ ACHAT D'UN PRODUIT
    async purchase(productId, specialty = null) {
        // ❌ Pas d'achat en mode web
        if (!this.isNative) {
            return { 
                success: false, 
                error: 'Les achats ne sont disponibles que dans l\'application iOS' 
            };
        }

        try {
            const user = this.auth.currentUser;
            if (!user) {
                return { success: false, error: 'Veuillez vous connecter' };
            }

            // Déterminer le type (abonnement ou achat unique)
            const isSubscription = ['eteo.quiz.monthly', 'eteo.quiz.annual', 'eteo.roulette.annual'].includes(productId);
            const type = isSubscription ? 'subs' : 'inapp';

            // 1. Lancer l'achat
            const result = await NativePurchases.purchaseProduct({
                productIdentifier: productId,
                type: type
            });

            if (!result || !result.productIdentifier) {
                return { success: false, error: 'Achat annulé' };
            }

            // 2. Valider avec Firebase
            const validateFn = httpsCallable(this.functions, 'validateIAP');
            const validation = await validateFn({
                productId: productId,
                transactionId: result.transactionId || result.productIdentifier,
                specialty: specialty
            });

            if (validation.data.success) {
                return { success: true, transaction: result };
            } else {
                return { success: false, error: 'Validation serveur échouée' };
            }

        } catch (error) {
            console.error('❌ Erreur purchase:', error);
            return { success: false, error: error.message };
        }
    }

    // ✅ RESTAURATION DES ACHATS
    async restorePurchases() {
        if (!this.isNative) {
            return { success: false, error: 'Non disponible en mode web' };
        }

        try {
            const result = await NativePurchases.restorePurchases();
            for (const purchase of result.purchases || []) {
                await this.validatePurchase(purchase);
            }
            return { success: true, purchases: result.purchases };
        } catch (error) {
            console.error('❌ Erreur restore:', error);
            return { success: false, error: error.message };
        }
    }

    // Validation interne (pour restauration)
    async validatePurchase(purchase) {
        try {
            const user = this.auth.currentUser;
            if (!user) return;

            const productId = purchase.productIdentifier;
            const now = new Date();
            const endDate = new Date(now);
            const userRef = doc(this.db, 'users_ios', user.uid);

            if (productId === 'eteo.quiz.monthly' || productId === 'eteo.quiz.annual') {
                if (productId === 'eteo.quiz.monthly') {
                    endDate.setMonth(endDate.getMonth() + 1);
                } else {
                    endDate.setFullYear(endDate.getFullYear() + 1);
                }
                await setDoc(userRef, {
                    'subscriptions.quiz': {
                        active: true,
                        startDate: now.toISOString(),
                        endDate: endDate.toISOString(),
                        productId: productId,
                        transactionId: purchase.transactionId || 'restored'
                    }
                }, { merge: true });
            } else if (productId === 'eteo.roulette.annual') {
                endDate.setFullYear(endDate.getFullYear() + 1);
                await setDoc(userRef, {
                    'roulette': {
                        active: true,
                        startDate: now.toISOString(),
                        endDate: endDate.toISOString(),
                        productId: productId,
                        transactionId: purchase.transactionId || 'restored'
                    }
                }, { merge: true });
            } else if (productId === 'eteo.certificate') {
                const specialty = purchase.specialty || 'general';
                await setDoc(userRef, {
                    [`certificates.${specialty}`]: {
                        purchased: true,
                        date: now.toISOString(),
                        productId: productId,
                        transactionId: purchase.transactionId || 'restored'
                    }
                }, { merge: true });
            }
        } catch (error) {
            console.error('❌ Erreur validatePurchase:', error);
        }
    }

    // Vérifier si un produit est disponible
    isProductAvailable(productId) {
        return this.products.some(p => p.productIdentifier === productId);
    }

    // Récupérer le prix formaté
    getProductPrice(productId) {
        const product = this.products.find(p => p.productIdentifier === productId);
        if (product) {
            return `${product.price} ${product.currency}`;
        }
        return null;
    }
}

export default new StoreKitService();