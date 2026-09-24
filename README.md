http://localhost:5500/roulette_certificat.html?specialty=endo


####################################################à

// ============================================================
// TEST COMPLET DU CERTIFICAT AVEC CODE D'AUTHENTIFICATION
// ============================================================

(async function testCertificat() {
    console.log('🎯 GÉNÉRATION DU CERTIFICAT...');
    
    const { jsPDF } = await import('https://cdn.skypack.dev/jspdf@2.5.1');
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const w = 297;
    const h = 210;
    
    // 1. Charger le template
    console.log('📄 Chargement du template...');
    const imgResponse = await fetch('/images/certificat.jpg');
    const imgBlob = await imgResponse.blob();
    const imgBase64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(imgBlob);
    });
    doc.addImage(imgBase64, 'JPEG', 0, 0, w, h);
    console.log('✅ Template chargé');
    
    // 2. Données du certificat
    const data = {
        userName: 'Dr. Karim CHAFIK',
        specialty: 'Relationnel & Psychomotricité',
        score: 42,
        date: '16 août 2026',
        certificateId: 'X7F2-K9M3-P4L8'
    };
    
    // 3. Positions (ajustez codeY si nécessaire)
    const config = {
        nameY: 90,
        specialtyY: 124,
        scoreY: 137,
        dateY: 165,
        dateX: 225,
        codeY: 248,
        fontSizeName: 40,
        fontSizeSpecialty: 22,
        fontSizeScore: 20,
        fontSizeDate: 14,
        fontSizeCode: 12
    };
    
    const romanticFont = 'Times-Roman';
    
    console.log('📝 Ajout des textes...');
    
    // 4. NOM
    doc.setFont(romanticFont, 'bold');
    doc.setFontSize(config.fontSizeName);
    doc.setTextColor(26, 26, 46);
    doc.text(data.userName, w/2, config.nameY, { align: 'center' });
    
    // 5. SPÉCIALITÉ
    doc.setFont(romanticFont, 'bold');
    doc.setFontSize(config.fontSizeSpecialty);
    doc.setTextColor(212, 175, 55);
    doc.text(data.specialty, w/2, config.specialtyY, { align: 'center' });
    
    // 6. SCORE
    doc.setFont(romanticFont, 'bold');
    doc.setFontSize(config.fontSizeScore);
    doc.setTextColor(76, 175, 80);
    doc.text(`${data.score}`, w/2, config.scoreY, { align: 'center' });
    
    // 7. DATE
    doc.setFont(romanticFont, 'normal');
    doc.setFontSize(config.fontSizeDate);
    doc.setTextColor(80, 80, 80);
    doc.text(data.date, config.dateX, config.dateY, { align: 'center' });
    
    // 8. CODE D'AUTHENTIFICATION
    doc.setFont(romanticFont, 'normal');
    doc.setFontSize(config.fontSizeCode);
    doc.setTextColor(80, 80, 80);
    doc.text(`Code d'authentification : ${data.certificateId}`, w/2, config.codeY, { align: 'center' });
    
    // 9. NOTE EXPLICATIVE
    doc.setFont(romanticFont, 'italic');
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text('Ce code permet de vérifier l\'authenticité de votre certificat', w/2, config.codeY + 6, { align: 'center' });
    
    // 10. Générer et télécharger
    console.log('📥 Téléchargement du PDF...');
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    window.open(url, '_blank');
    
    console.log('✅ Certificat généré avec succès !');
    console.log('📌 Code :', data.certificateId);
    console.log('📌 Position codeY :', config.codeY);
})();


###########################################################


📋 PLAN FINAL - FREEMIUM ETEO
(Version définitive approuvée)

🎯 OBJECTIF GLOBAL
Intégrer une stratégie Freemium dans ETEO pour :

Monétiser l'application sur PWA et Google Play

Fidéliser les utilisateurs avec un système de progression clair

Maximiser les conversions avec un paywall intelligent

Centraliser les droits d'accès avec AccessService

Sécuriser les paiements avec Stripe (PWA) et Google Play Billing (Android)

🧠 PRINCIPES FONDAMENTAUX (FIGÉS)
#	Principe	Explication
1️⃣	Un seul dossier ETEO	PWA et Android partagent le même code
2️⃣	Firebase Auth = identité	L'UID utilisateur est la clé unique
3️⃣	Firestore = autorité	Les droits sont stockés dans Firestore
4️⃣	localStorage = cache UX	Jamais une preuve de paiement
5️⃣	AccessService = central	Toutes les décisions d'accès passent par lui
6️⃣	Paiement séparé	Stripe (PWA) / Google Play Billing (Android)
7️⃣	Entitlements = droits réels	Structure claire des droits utilisateur
💰 STRATÉGIE FREEMIUM (FIGÉE)
AXE 1 : Quiz / Spécialité
Niveaux	Statut	Prix
Débutant 1 & 2	🔓 GRATUIT	0 €
Intermédiaire 1 → Expert 2	🔒 ABONNEMENT	3,99 / 9,99 / 17,99 / 29,99 € (par spécialité)
AXE 2 : Roulette de l'Info
Statut	Détail
10 quiz gratuits	🔓 GRATUIT
Après 10 quiz	🔒 ABONNEMENT GLOBAL (14,99 € / 39,99 € / 69,99 € / 99,99 €)
Certificat
Tentative	Prix
1ère tentative	20,00 €
2ème (après échec)	GRATUITE
3ème	20,00 €
🏗️ ARCHITECTURE TECHNIQUE
Structure des fichiers
text
ETEO_V2/
├── index.html
├── quiz.html
├── dashboard.html
├── progression_fr.html
├── roulette_de_l_info_fr.html
├── roulette_certificat.html
├── choix_specialites_fr.html
├── manifest.json
├── service-worker.js
│
├── js/
│   ├── config.js
│   │
│   ├── core/
│   │   ├── quiz.js
│   │   ├── timer.js
│   │   ├── score.js
│   │   └── progress.js
│   │
│   ├── services/
│   │   ├── storage.js                 ← À enrichir
│   │   ├── subscription.js            ← À modifier
│   │   ├── progressionService.js      ← À enrichir
│   │   ├── accessService.js           ← NOUVEAU ⭐
│   │   ├── paymentService.js          ← NOUVEAU ⭐
│   │   ├── stripe.js                  ← NOUVEAU (PWA)
│   │   ├── googlePlayBilling.js       ← NOUVEAU (Android)
│   │   └── entitlementService.js      ← NOUVEAU ⭐
│   │
│   └── ui/
│       ├── ProgressionManager.js
│       ├── CertificateManager.js
│       └── ...
│
├── images/
│   └── certificat.jpg
│
└── data/
    └── (36 spécialités)
🗄️ STRUCTURE DES DONNÉES (FIRESTORE)
Collection : users
javascript
{
  uid: "firebase_uid",
  fullName: "Dr. Karim CHAFIK",
  email: "karim@email.com",
  country: "Maroc",
  profession: "Docteur",
  registeredAt: "2026-08-18T10:00:00Z",

  // ================================
  // SCORES
  // ================================
  scores: {
    "chirurgie_debutant1": 85,
    "chirurgie_debutant2": 78,
    "chirurgie_intermediaire1": 92
  },

  // ================================
  // ENTITLEMENTS (DROITS RÉELS)
  // ================================
  entitlements: {
    // Spécialités débloquées
    specialties: {
      "endo": {
        active: true,
        type: "annual",
        startDate: "2026-08-18T10:00:00Z",
        endDate: "2027-08-18T10:00:00Z",
        provider: "stripe", // ou "googlePlay"
        paymentId: "pi_xxx"
      },
      "chirurgie": {
        active: false,
        type: null,
        startDate: null,
        endDate: null,
        provider: null,
        paymentId: null
      }
    },
    
    // Roulette de l'Info (global)
    roulette: {
      active: false,
      type: null,
      startDate: null,
      endDate: null,
      provider: null,
      paymentId: null
    }
  },

  // ================================
  // CERTIFICATS
  // ================================
  certificates: {
    "endo": {
      status: "not_started", // not_started | in_progress | paid | issued
      attempts: 0,
      freeRetryAvailable: false,
      paidAttempts: 0,
      certificateIssued: false,
      certificateNumber: null,
      score: null,
      lastAttemptAt: null,
      lastPaymentAt: null,
      paymentProvider: null,
      paymentId: null
    }
  },

  // ================================
  // BADGES
  // ================================
  badges: ["first_quiz", "streak_3"],

  // ================================
  // STATISTIQUES
  // ================================
  totalLevels: 3,
  avgScore: 85,
  globalScore: 78,
  rank: 42
}
🔧 DÉTAIL DES SERVICES
1. AccessService (⭐ NOUVEAU)
javascript
// js/services/accessService.js

export class AccessService {
    
    constructor() {
        this.uid = this.getCurrentUserId();
    }

    // ================================
    // AXE 1 : Quiz / Spécialité
    // ================================

    canAccessLevel(specialty, level) {
        // Niveaux gratuits
        if (level === 'debutant1' || level === 'debutant2') {
            return true;
        }
        
        // Niveaux payants
        const entitlement = this.getEntitlement(specialty);
        if (!entitlement || !entitlement.active) {
            return false;
        }
        
        // Vérifier la date d'expiration
        if (new Date(entitlement.endDate) < new Date()) {
            return false;
        }
        
        return true;
    }

    // ================================
    // AXE 2 : Roulette de l'Info
    // ================================

    canUseRoulette() {
        // Vérifier les 10 quiz gratuits
        const freeQuizzesUsed = this.getFreeQuizzesUsed();
        if (freeQuizzesUsed < 10) {
            return true;
        }
        
        // Vérifier l'abonnement global
        const rouletteEntitlement = this.getRouletteEntitlement();
        if (rouletteEntitlement && rouletteEntitlement.active) {
            return true;
        }
        
        return false;
    }

    // ================================
    // CERTIFICAT
    // ================================

    canTakeCertificateExam(specialty) {
        const certificate = this.getCertificate(specialty);
        
        // Vérifier les tentatives
        if (certificate.attempts === 0) {
            return true; // 1ère tentative (payante)
        }
        
        if (certificate.attempts === 1 && certificate.freeRetryAvailable) {
            return true; // 2ème tentative (gratuite)
        }
        
        if (certificate.attempts >= 2 && certificate.paidAttempts > 0) {
            return true; // 3ème tentative (payante)
        }
        
        return false;
    }

    canDownloadCertificate(specialty) {
        const certificate = this.getCertificate(specialty);
        return certificate.certificateIssued === true;
    }

    // ================================
    // ENTITLEMENTS
    // ================================

    getEntitlement(specialty) {
        const entitlements = this.getUserEntitlements();
        return entitlements.specialties?.[specialty] || null;
    }

    getRouletteEntitlement() {
        const entitlements = this.getUserEntitlements();
        return entitlements.roulette || null;
    }

    getCertificate(specialty) {
        const user = this.getUser();
        return user.certificates?.[specialty] || null;
    }

    getFreeQuizzesUsed() {
        const user = this.getUser();
        return user.rouletteStats?.freeQuizzesUsed || 0;
    }

    // ================================
    // MÉTHODES PRIVÉES
    // ================================

    getUser() {
        // Récupérer depuis Firestore (ou cache)
        return firestoreService.getUser(this.uid);
    }

    getUserEntitlements() {
        const user = this.getUser();
        return user.entitlements || { specialties: {}, roulette: null };
    }

    getCurrentUserId() {
        return firebase.auth().currentUser?.uid || null;
    }
}
2. PaymentService (⭐ NOUVEAU)
javascript
// js/services/paymentService.js

export class PaymentService {
    
    constructor() {
        this.isAndroid = this.detectAndroid();
    }

    detectAndroid() {
        return navigator.userAgent.includes('ETEO_APP') || 
               window.ETEO_APP === true ||
               window.navigator?.userAgent?.includes('Android');
    }

    async subscribeSpecialty(specialty, plan) {
        if (this.isAndroid) {
            // Google Play Billing
            return this.googlePlaySubscribe(specialty, plan);
        } else {
            // Stripe (PWA)
            return this.stripeSubscribe(specialty, plan);
        }
    }

    async subscribeRoulette(plan) {
        if (this.isAndroid) {
            return this.googlePlaySubscribeRoulette(plan);
        } else {
            return this.stripeSubscribeRoulette(plan);
        }
    }

    async payCertificate(specialty) {
        if (this.isAndroid) {
            return this.googlePlayPayCertificate(specialty);
        } else {
            return this.stripePayCertificate(specialty);
        }
    }
}
📋 ORDRE DE TRAVAIL (PHASES)
Phase	Description	Durée
Phase 0	Figer les règles commerciales	✅ DÉJÀ FAIT
Phase 1	Définir la structure Firestore (Entitlements, Certificates)	1 jour
Phase 2	Créer AccessService	1 jour
Phase 3	Créer EntitlementService	1 jour
Phase 4	Enrichir StorageService	1 jour
Phase 5	Modifier SubscriptionService	1 jour
Phase 6	Modifier ProgressionService	1 jour
Phase 7	Modifier quiz.html (paywall intelligent)	1 jour
Phase 8	Modifier dashboard.html (statut abonnement)	1 jour
Phase 9	Modifier progression_fr.html (badges)	1 jour
Phase 10	Modifier roulette_certificat.html (paiement)	2 jours
Phase 11	Créer PaymentService	1 jour
Phase 12	Créer stripe.js (PWA)	2 jours
Phase 13	Créer googlePlayBilling.js (Android)	2 jours
Phase 14	Tester toutes les fonctionnalités	3 jours
Phase 15	Déployer sur PWA et Google Play	2 jours
✅ CRITÈRES DE RÉUSSITE
#	Critère
1️⃣	Toutes les fonctionnalités Freemium fonctionnent
2️⃣	AccessService centralise toutes les décisions d'accès
3️⃣	Firebase est l'autorité (pas localStorage)
4️⃣	Les paiements sont sécurisés (Stripe + Google Play)
5️⃣	PWA et Android partagent le même code
6️⃣	Les droits sont synchronisés entre PWA et Android
7️⃣	L'architecture existante n'est pas cassée
8️⃣	Les tests passent (119/119)
🚀 PROCHAINE ÉTAPE
Maintenant que le plan final est validé, nous pouvons commencer la Phase 1.

Êtes-vous prêt à démarrer ? 🎯


############################################################


code pour se deconnecter de ETEO et cree  un nouveau utilisateur :

localStorage.clear();
window.location.href = 'inscription_fr.html';



@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

📜 SCRIPT MAGIQUE POUR EXTRAIRE UNE SPÉCIALITÉ ENTIÈRE
javascript
// ============================================================
// SCRIPT MAGIQUE POUR EXTRAIRE TOUS LES FICHIERS JSON D'UNE SPÉCIALITÉ
// ============================================================

(async function extractSpecialtyFiles() {
    const specialty = prompt('📂 Entrez le nom de la spécialité (ex: anesthesiologie) :');
    if (!specialty) return;

    const levels = ['debutant1', 'debutant2', 'intermediaire1', 'intermediaire2', 'expert1', 'expert2'];
    const files = {};

    // 1. Charger l'histoire
    try {
        const storyPath = `/data/fr/${specialty}/stories/story_v1.json`;
        const response = await fetch(storyPath);
        if (response.ok) {
            files['story_v1.json'] = await response.json();
            console.log(`✅ story_v1.json chargé`);
        } else {
            console.warn(`⚠️ story_v1.json non trouvé`);
        }
    } catch (e) {
        console.warn(`⚠️ Erreur story: ${e.message}`);
    }

    // 2. Charger tous les niveaux
    for (const level of levels) {
        try {
            const path = `/data/fr/${specialty}/${level}.json`;
            const response = await fetch(path);
            if (response.ok) {
                files[`${level}.json`] = await response.json();
                console.log(`✅ ${level}.json chargé`);
            } else {
                console.warn(`⚠️ ${level}.json non trouvé`);
            }
        } catch (e) {
            console.warn(`⚠️ Erreur ${level}: ${e.message}`);
        }
    }

    // 3. Afficher le résultat
    console.log(`\n📂 Spécialité: ${specialty}`);
    console.log(`📊 ${Object.keys(files).length} fichiers chargés`);

    // 4. Créer un bloc de texte formaté pour le chat
    let output = `📂 SPÉCIALITÉ: ${specialty}\n`;
    output += `📊 ${Object.keys(files).length} fichiers chargés\n`;
    output += `═══════════════════════════════════════════════════════\n\n`;
    
    for (const [filename, content] of Object.entries(files)) {
        output += `=== ${filename} ===\n`;
        output += JSON.stringify(content, null, 2);
        output += `\n\n`;
    }

    // 5. Copier dans le presse-papier
    try {
        await navigator.clipboard.writeText(output);
        console.log('✅ TOUT LE CONTENU A ÉTÉ COPIÉ DANS LE PRESSE-PAPIER !');
        console.log('📋 Collez-le directement dans le chat pour que je le traduise.');
        console.log(`📁 ${Object.keys(files).length} fichiers prêts à être traduits.`);
    } catch (e) {
        console.warn('⚠️ Impossible de copier automatiquement. Copiez manuellement le texte ci-dessous :');
        console.log(output);
    }

    // 6. Afficher un résumé
    console.log('\n📋 RÉSUMÉ DES FICHIERS:');
    Object.keys(files).forEach(f => console.log(`  ✅ ${f}`));

    return files;
})();


@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@



📋 PLAN D'EXÉCUTION COMPLET - ETEO iOS MONÉTISATION
🔵 PHASE 0 : VÉRIFICATION DES PRÉREQUIS
0.1 - Environnement de développement
□ Xcode installé (version 14+)
□ CocoaPods installé
□ Node.js installé (version 18+)
□ Firebase CLI installé
□ Compte Apple Developer actif
□ Compte App Store Connect accessible
0.2 - Projet Capacitor prêt
□ Projet ETEO iOS ouvert dans Xcode
□ Capacitor v6+ installé
□ Build 8 déjà soumis (✅ confirmé)
□ Fichier ios/App/App/Info.plist accessible
🔵 PHASE 1 : APP STORE CONNECT - CONFIGURATION DES PRODUITS IAP
1.1 - Création des produits In-App Purchase
□ Aller sur App Store Connect → Mes apps → ETEO
□ Aller dans Fonctionnalités → In-App Purchases → Créer
1.2 - Produit 1 : Abonnement Quiz Mensuel
Champ	Valeur
Type	Abonnement renouvelable
Référence	eteo.quiz.monthly
Version de l'API	V2
Nom (affiché)	ETEO Quiz - Mensuel
Description	Accès illimité à tous les quiz ETEO
Prix	3,99 €
Durée	1 mois
Période d'essai	Aucune
□ Produit créé et en attente de révision
□ ID eteo.quiz.monthly noté
1.3 - Produit 2 : Abonnement Quiz Annuel
Champ	Valeur
Type	Abonnement renouvelable
Référence	eteo.quiz.annual
Version de l'API	V2
Nom (affiché)	ETEO Quiz - Annuel
Description	Accès illimité à tous les quiz ETEO
Prix	29,99 €
Durée	1 an
Période d'essai	Aucune
□ Produit créé et en attente de révision
□ ID eteo.quiz.annual noté
1.4 - Produit 3 : Abonnement Roulette
Champ	Valeur
Type	Abonnement renouvelable
Référence	eteo.roulette.annual
Version de l'API	V2
Nom (affiché)	ETEO Roulette - Annuel
Description	Tours illimités à la Roulette de l'Info
Prix	14,99 €
Durée	1 an
Période d'essai	Aucune
□ Produit créé et en attente de révision
□ ID eteo.roulette.annual noté
1.5 - Produit 4 : Certificat
Champ	Valeur
Type	Non-renouvelable
Référence	eteo.certificate
Version de l'API	V2
Nom (affiché)	Certificat ETEO
Description	Certificat officiel de réussite ETEO
Prix	20,00 €
□ Produit créé et en attente de révision
□ ID eteo.certificate noté
1.6 - Configuration des notifications
□ Aller dans App Store Connect → Mon app → Notifications
□ Activer App Store Server Notifications V2
□ URL du serveur : https://ton-backend.com/api/apple-webhook
□ Version : V2
1.7 - Récupération des identifiants
□ Aller dans App Store Connect → API → Clés
□ Créer une clé d'API (si pas déjà fait)
□ Récupérer le Shared Secret :
Aller dans Mon app → Fonctionnalités → In-App Purchases

Cliquer sur Générer un secret partagé

Copier le secret

□ Secret noté dans un endroit sécurisé
□ Storefront configuré pour la France
1.8 - Comptes Sandbox
□ Aller dans App Store Connect → Utilisateurs et accès → Sandbox
□ Créer un compte test :
□ Email : test-ios@eteo.com
□ Mot de passe : Test123!
□ Pays : France
□ Compte Sandbox validé
✅ PHASE 1 - RÉSUMÉ
Élément	Statut
Produit eteo.quiz.monthly	⬜
Produit eteo.quiz.annual	⬜
Produit eteo.roulette.annual	⬜
Produit eteo.certificate	⬜
Notifications V2 activées	⬜
Shared Secret récupéré	⬜
Compte Sandbox créé	⬜
🔵 PHASE 2 : BACKEND FIREBASE
2.1 - Firebase Project
□ Projet Firebase déjà existant : eteo-endo-to-every-one
□ Vérifier que le projet est lié à un compte Blaze (nécessaire pour les fonctions)
□ Activer Firestore (si pas déjà fait)
2.2 - Structure Firestore
□ Créer la collection users_ios
□ Schéma défini :
javascript
users_ios/{userId}
{
    displayName: string,
    email: string,
    createdAt: timestamp,
    lastLogin: timestamp,
    subscriptions: {
        quiz: {
            active: boolean,
            startDate: timestamp,
            endDate: timestamp,
            productId: string,
            transactionId: string,
            autoRenew: boolean
        }
    },
    roulette: {
        active: boolean,
        startDate: timestamp,
        endDate: timestamp,
        productId: string,
        transactionId: string
    },
    certificates: {
        [specialty]: {
            purchased: boolean,
            date: timestamp,
            productId: string,
            transactionId: string,
            score: number,
            total: number,
            percentage: number,
            certificateId: string
        }
    },
    scores: {
        [specialty]: {
            [level]: {
                score: number,
                total: number,
                percentage: number,
                date: timestamp
            }
        }
    }
}
□ Structure validée
□ Index Firestore créés (si nécessaire)
2.3 - Règles de sécurité Firestore
□ Créer fichier firestore.rules :
javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Collection users_ios
    match /users_ios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Sous-collections
      match /subscriptions/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /certificates/{specialty} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
      match /scores/{specialty} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Collection publique pour la vérification des certificats
    match /public_certificates/{certificateId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
□ Règles déployées
2.4 - Firebase Functions - Validation IAP
□ Initialiser Firebase Functions
bash
cd backend/functions
npm install
□ Créer fonction validateIAP :
javascript
// functions/src/validateIAP.js
exports.validateIAP = functions.https.onCall(async (data, context) => {
    // Vérifier authentification
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Non connecté');
    }
    
    const { productId, transactionId, specialty } = data;
    const userId = context.auth.uid;
    
    // 1. Valider la transaction avec Apple
    const isValid = await verifyAppleTransaction(transactionId, productId);
    if (!isValid) {
        throw new functions.https.HttpsError('failed-precondition', 'Transaction invalide');
    }
    
    // 2. Mettre à jour Firestore
    const userRef = admin.firestore().doc(`users_ios/${userId}`);
    const now = new Date();
    const endDate = new Date(now);
    
    if (productId === 'eteo.quiz.monthly') {
        endDate.setMonth(endDate.getMonth() + 1);
        await userRef.set({
            'subscriptions.quiz': {
                active: true,
                startDate: now.toISOString(),
                endDate: endDate.toISOString(),
                productId: productId,
                transactionId: transactionId,
                autoRenew: true
            }
        }, { merge: true });
    } else if (productId === 'eteo.quiz.annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
        await userRef.set({
            'subscriptions.quiz': {
                active: true,
                startDate: now.toISOString(),
                endDate: endDate.toISOString(),
                productId: productId,
                transactionId: transactionId,
                autoRenew: true
            }
        }, { merge: true });
    } else if (productId === 'eteo.roulette.annual') {
        endDate.setFullYear(endDate.getFullYear() + 1);
        await userRef.set({
            'roulette': {
                active: true,
                startDate: now.toISOString(),
                endDate: endDate.toISOString(),
                productId: productId,
                transactionId: transactionId
            }
        }, { merge: true });
    } else if (productId === 'eteo.certificate') {
        await userRef.set({
            [`certificates.${specialty}`]: {
                purchased: true,
                date: now.toISOString(),
                productId: productId,
                transactionId: transactionId
            }
        }, { merge: true });
    }
    
    return { success: true };
});

// 2.5 - Fonction de vérification Apple avec App Store Server API V2
async function verifyAppleTransaction(transactionId, productId) {
    // Utiliser App Store Server API V2
    const url = `https://api.storekit.itunes.apple.com/inApps/v1/transactions/${transactionId}`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${await getAppleJWT()}`
        }
    });
    
    const data = await response.json();
    return data.status === 'ACTIVE' || data.status === 'EXPIRED';
}

// 2.6 - Génération du JWT Apple
async function getAppleJWT() {
    // Utiliser la clé API Apple
    const privateKey = functions.config().apple.private_key;
    const keyId = functions.config().apple.key_id;
    const issuerId = functions.config().apple.issuer_id;
    
    // Générer JWT avec algorithm ES256
    // ...
}
□ Fonction créée
□ Variables d'environnement configurées
2.7 - Webhook App Store Server Notifications V2
javascript
// functions/src/apple-webhook.js
exports.appleWebhook = functions.https.onRequest(async (req, res) => {
    // 1. Vérifier la signature JWS
    const signedPayload = req.body.signedPayload;
    if (!signedPayload) {
        return res.status(400).json({ error: 'Missing signedPayload' });
    }
    
    // 2. Décoder le JWS
    const payload = decodeJWS(signedPayload);
    const notificationType = payload.notificationType;
    const data = payload.data;
    
    // 3. Traiter selon le type
    switch(notificationType) {
        case 'SUBSCRIBED':
        case 'DID_RENEW':
            // Renouvellement réussi
            await updateSubscription(data.userId, data.productId, true);
            break;
            
        case 'EXPIRED':
        case 'DID_FAIL_TO_RENEW':
        case 'CANCEL':
            // Abonnement expiré/annulé
            await updateSubscription(data.userId, data.productId, false);
            break;
            
        case 'REFUND':
            // Remboursement
            await handleRefund(data.userId, data.productId, data.transactionId);
            break;
    }
    
    res.json({ received: true });
});
□ Webhook créé
□ Endpoint déployé : https://ton-backend.com/api/apple-webhook
✅ PHASE 2 - RÉSUMÉ
Élément	Statut
Collection users_ios créée	⬜
Schéma Firestore défini	⬜
Règles de sécurité écrites	⬜
Règles déployées	⬜
Fonction validateIAP créée	⬜
Fonction verifyAppleTransaction créée	⬜
Webhook Apple créé	⬜
Webhook déployé	⬜
Variables d'environnement configurées	⬜
🔵 PHASE 3 : STOREKIT - CÔTÉ APPLICATION
3.1 - Installation du plugin
bash
# Dans le dossier du projet Capacitor
npm install @capacitor-community/storekit
npx cap sync
□ Plugin installé
□ Pods installés (iOS)
3.2 - Configuration du plugin
xml
<!-- ios/App/App/Info.plist -->
<key>NSUserTrackingUsageDescription</key>
<string>ETEO utilise des identifiants pour gérer vos achats.</string>
□ Info.plist mis à jour
3.3 - Service StoreKit
Créer le fichier js/services/StoreKitService.js :

javascript
// js/services/StoreKitService.js
import { StoreKit } from '@capacitor-community/storekit';
import { getAuth } from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';

class StoreKitService {
    constructor() {
        this.products = [];
        this.isReady = false;
        this.auth = getAuth();
        this.functions = getFunctions();
    }

    // 3.4 - Initialisation
    async init() {
        try {
            await StoreKit.init({
                productIds: [
                    'eteo.quiz.monthly',
                    'eteo.quiz.annual',
                    'eteo.roulette.annual',
                    'eteo.certificate'
                ]
            });
            this.isReady = true;
            console.log('✅ StoreKit initialisé');
            return true;
        } catch (error) {
            console.error('❌ Erreur StoreKit init:', error);
            return false;
        }
    }

    // 3.5 - Récupération des produits
    async getProducts() {
        try {
            const result = await StoreKit.getProducts({
                productIds: [
                    'eteo.quiz.monthly',
                    'eteo.quiz.annual',
                    'eteo.roulette.annual',
                    'eteo.certificate'
                ]
            });
            this.products = result.products || [];
            return this.products;
        } catch (error) {
            console.error('❌ Erreur getProducts:', error);
            return [];
        }
    }

    // 3.6 - Achat d'un produit
    async purchase(productId, specialty = null) {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                return { success: false, error: 'Non connecté' };
            }

            // 1. Faire l'achat
            const result = await StoreKit.purchaseProduct({
                productId: productId
            });

            // 2. Vérifier le statut
            if (result.state !== 'purchased' && result.state !== 'verified') {
                return { success: false, state: result.state };
            }

            // 3. Valider avec Firebase
            const validateFn = httpsCallable(this.functions, 'validateIAP');
            const validation = await validateFn({
                productId: productId,
                transactionId: result.transaction.id,
                specialty: specialty
            });

            if (validation.data.success) {
                return { success: true, transaction: result.transaction };
            } else {
                return { success: false, error: 'Validation serveur échouée' };
            }

        } catch (error) {
            console.error('❌ Erreur purchase:', error);
            return { success: false, error: error.message };
        }
    }

    // 3.7 - Restauration des achats
    async restorePurchases() {
        try {
            const user = this.auth.currentUser;
            if (!user) {
                return { success: false, error: 'Non connecté' };
            }

            const result = await StoreKit.restorePurchases();

            // Valider chaque transaction restaurée
            const validateFn = httpsCallable(this.functions, 'validateIAP');
            const results = [];

            for (const transaction of result.transactions) {
                try {
                    await validateFn({
                        productId: transaction.productId,
                        transactionId: transaction.id,
                        specialty: null
                    });
                    results.push({ success: true, transaction });
                } catch (e) {
                    results.push({ success: false, transaction, error: e.message });
                }
            }

            return { success: true, results };

        } catch (error) {
            console.error('❌ Erreur restore:', error);
            return { success: false, error: error.message };
        }
    }

    // 3.8 - Vérification du statut d'abonnement
    async getSubscriptionStatus(productId) {
        try {
            const status = await StoreKit.getSubscriptionStatus({
                productId: productId
            });
            return status;
        } catch (error) {
            console.error('❌ Erreur getSubscriptionStatus:', error);
            return null;
        }
    }

    // 3.9 - Vérification si un produit est disponible
    isProductAvailable(productId) {
        return this.products.some(p => p.productId === productId);
    }

    // 3.10 - Récupérer le prix formaté d'un produit
    getProductPrice(productId) {
        const product = this.products.find(p => p.productId === productId);
        if (product) {
            return `${product.price} ${product.currencyCode}`;
        }
        return null;
    }
}

export default new StoreKitService();
□ StoreKitService.js créé
□ Fonctions implémentées
✅ PHASE 3 - RÉSUMÉ
Élément	Statut
Plugin StoreKit installé	⬜
Info.plist configuré	⬜
StoreKitService créé	⬜
Méthode init()	⬜
Méthode getProducts()	⬜
Méthode purchase()	⬜
Méthode restorePurchases()	⬜
Méthode getSubscriptionStatus()	⬜
🔵 PHASE 4 : INTÉGRATION DANS LES PAGES
4.1 - Intégration dans App.js / index.js
javascript
// App.js ou index.js
import StoreKitService from './js/services/StoreKitService.js';

// Initialiser StoreKit au démarrage
async function initApp() {
    // ... Firebase init ...
    // ... Auth init ...
    
    // ✅ Initialiser StoreKit
    await StoreKitService.init();
    await StoreKitService.getProducts();
    
    // Vérifier les droits actuels
    const user = auth.currentUser;
    if (user) {
        await loadUserSubscriptions(user.uid);
    }
}
□ App.js modifié
□ StoreKit initialisé au démarrage
4.2 - Service AccessService (pour vérifier les droits)
javascript
// js/services/AccessService.js
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

class AccessService {
    constructor() {
        this.auth = getAuth();
        this.db = getFirestore();
        this.userData = null;
    }

    // Charger les données utilisateur
    async loadUserData(userId) {
        const userRef = doc(this.db, 'users_ios', userId);
        const snap = await getDoc(userRef);
        this.userData = snap.data() || {};
        return this.userData;
    }

    // 4.3 - Vérifier l'accès au quiz
    hasQuizAccess() {
        const sub = this.userData?.subscriptions?.quiz;
        if (!sub || !sub.active) return false;
        return new Date(sub.endDate) > new Date();
    }

    // 4.4 - Vérifier l'accès à la roulette
    hasRouletteAccess() {
        const roulette = this.userData?.roulette;
        if (!roulette || !roulette.active) return false;
        return new Date(roulette.endDate) > new Date();
    }

    // 4.5 - Vérifier l'accès au certificat
    hasCertificateAccess(specialty) {
        const cert = this.userData?.certificates?.[specialty];
        return cert?.purchased === true;
    }

    // 4.6 - Vérifier les niveaux gratuits
    isLevelFree(levelId) {
        return levelId === 'debutant1' || levelId === 'debutant2';
    }
}

export default new AccessService();
□ AccessService.js créé
□ Méthodes implémentées
4.7 - Modifier quiz.html
javascript
// Dans quiz.html
import AccessService from '../js/services/AccessService.js';
import StoreKitService from '../js/services/StoreKitService.js';

// Vérifier l'accès à un niveau
function canAccessLevel(levelId) {
    // Niveaux 1-2 : GRATUITS
    if (AccessService.isLevelFree(levelId)) {
        return true;
    }
    
    // Niveaux 3-6 : VÉRIFIER ABONNEMENT
    return AccessService.hasQuizAccess();
}

// Popup d'abonnement
function showSubscriptionPopup(levelId) {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'inscription_fr.html';
        return;
    }
    
    // Afficher overlay avec offres
    showIAPPopup([
        { id: 'eteo.quiz.monthly', label: 'Mensuel 3,99€', emoji: '📆' },
        { id: 'eteo.quiz.annual', label: 'Annuel 29,99€', emoji: '🌟' }
    ]);
}

async function showIAPPopup(products) {
    // Créer overlay...
    // Pour chaque produit, bouton qui appelle StoreKitService.purchase()
}
□ quiz.html modifié
□ Fonction canAccessLevel() utilisée
□ Popup d'abonnement fonctionnelle
4.8 - Modifier roulette.html
javascript
// Dans roulette.html
import AccessService from '../js/services/AccessService.js';
import StoreKitService from '../js/services/StoreKitService.js';

// Vérifier l'accès à la roulette
function canAccessRoulette() {
    return AccessService.hasRouletteAccess();
}

// Bouton "Tours illimités"
document.getElementById('unlimitedBtn').addEventListener('click', async function() {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'inscription_fr.html';
        return;
    }
    
    const result = await StoreKitService.purchase('eteo.roulette.annual');
    
    if (result.success) {
        showToast('✅ Roulette illimitée débloquée !');
        location.reload();
    } else {
        showToast(`❌ Erreur: ${result.error}`);
    }
});
□ roulette.html modifié
□ Bouton "Tours illimités" connecté
4.9 - Modifier examen-certificat.html
javascript
// Dans examen-certificat.html
import AccessService from '../js/services/AccessService.js';
import StoreKitService from '../js/services/StoreKitService.js';

// Vérifier si le certificat est déjà acheté
function canDownloadCertificate(specialty) {
    return AccessService.hasCertificateAccess(specialty);
}

// Fonction de paiement du certificat
async function purchaseCertificate(specialty) {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = 'inscription_fr.html';
        return;
    }
    
    const result = await StoreKitService.purchase('eteo.certificate', specialty);
    
    if (result.success) {
        showToast('✅ Certificat débloqué !');
        // Relancer le téléchargement
        await downloadCertificate();
    } else {
        showToast(`❌ Erreur: ${result.error}`);
    }
}
□ examen-certificat.html modifié
□ Fonction canDownloadCertificate() utilisée
□ Paiement 20€ connecté
4.10 - Modifier abonnement-quiz.html
javascript
// Dans abonnement-quiz.html
import StoreKitService from '../js/services/StoreKitService.js';
import { getAuth } from 'firebase/auth';

const auth = getAuth();

document.querySelectorAll('.subscribe-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const plan = this.dataset.plan;
        const user = auth.currentUser;
        
        if (!user) {
            window.location.href = 'inscription_fr.html';
            return;
        }
        
        const productMap = {
            mensuel: 'eteo.quiz.monthly',
            annuel: 'eteo.quiz.annual'
        };
        
        const productId = productMap[plan];
        if (!productId) {
            showToast('❌ Plan invalide');
            return;
        }
        
        const result = await StoreKitService.purchase(productId);
        
        if (result.success) {
            showToast('✅ Abonnement activé !');
            setTimeout(() => {
                window.location.href = 'quiz.html';
            }, 1500);
        } else {
            showToast(`❌ Erreur: ${result.error}`);
        }
    });
});
□ abonnement-quiz.html modifié
□ Boutons d'abonnement connectés
4.11 - Ajouter un bouton "Restaurer les achats"
html
<!-- Dans chaque page ou dans le menu -->
<button id="restorePurchasesBtn">🔄 Restaurer mes achats</button>

<script>
document.getElementById('restorePurchasesBtn').addEventListener('click', async function() {
    const result = await StoreKitService.restorePurchases();
    if (result.success) {
        showToast('✅ Achats restaurés !');
        location.reload();
    } else {
        showToast(`❌ Erreur: ${result.error}`);
    }
});
</script>
□ Bouton "Restaurer" ajouté dans le menu principal
□ Fonctionnalité testée
✅ PHASE 4 - RÉSUMÉ
Élément	Statut
App.js modifié	⬜
AccessService créé	⬜
quiz.html modifié	⬜
roulette.html modifié	⬜
examen-certificat.html modifié	⬜
abonnement-quiz.html modifié	⬜
Bouton "Restaurer" ajouté	⬜
🔵 PHASE 5 : TESTS
5.1 - Configuration du sandbox
□ Xcode → Signing & Capabilities → Compte sandbox
□ Utiliser le compte sandbox créé en Phase 1.8
5.2 - Test : Quiz gratuit (Niveaux 1-2)
□ Ouvrir ETEO sur simulateur/iPhone
□ Se connecter avec compte sandbox
□ Accéder à Débutant 1 → ✅ Accessible
□ Accéder à Débutant 2 → ✅ Accessible
□ Accéder à Intermédiaire 1 → 🔒 Bloqué
5.3 - Test : Achat Quiz Mensuel
□ Cliquer sur "Débloquer" sur Intermédiaire 1
□ Popup affichée avec offres
□ Choisir "Mensuel 3,99€"
□ Valider l'achat sandbox
□ ✅ Transaction réussie
□ Vérifier Firestore : subscriptions.quiz.active = true
□ Revenir à la page → Niveaux 3-6 ✅ Accessibles
5.4 - Test : Achat Quiz Annuel
□ Même test avec "Annuel 29,99€"
□ ✅ Transaction réussie
□ Vérifier Firestore : endDate +1 an
5.5 - Test : Roulette
□ Aller à la Roulette
□ 10 tours gratuits ✅ Disponibles
□ Après 10 tours → 🔒 Bloqué
□ Cliquer "Tours illimités"
□ Acheter 14,99€/an
□ ✅ Tours illimités débloqués
□ Vérifier Firestore : roulette.active = true
5.6 - Test : Certificat
□ Terminer une spécialité (tous niveaux)
□ Passer l'examen → Score ≥ 70%
□ Cliquer "Télécharger le certificat"
□ Popup "Payer 20€"
□ Acheter 20€
□ ✅ Certificat disponible
□ Vérifier Firestore : certificates.endo.purchased = true
□ Télécharger le PDF ✅
5.7 - Test : Restauration
□ Supprimer l'app du simulateur
□ Réinstaller
□ Se connecter
□ Cliquer "Restaurer mes achats"
□ ✅ Tous les achats restaurés
5.8 - Test : Expiration d'abonnement (simulé)
□ Modifier manuellement la date endDate dans Firestore (passé)
□ Recharger l'app
□ Niveaux 3-6 🔒 Bloqués
✅ PHASE 5 - RÉSUMÉ
Test	Statut
Quiz gratuit (Niveaux 1-2)	⬜
Achat Quiz Mensuel	⬜
Achat Quiz Annuel	⬜
Roulette (10 tours gratuits)	⬜
Achat Roulette	⬜
Examen + Certificat	⬜
Restauration des achats	⬜
Expiration d'abonnement	⬜
🔵 PHASE 6 : SOUMISSION APP STORE
6.1 - Préparation du Build 9
bash
# 1. Commiter les modifications
git add .
git commit -m "Intégration Apple IAP - StoreKit + Firebase"

# 2. Build iOS
npx cap copy
npx cap open ios
6.2 - Dans Xcode
□ Vérifier la configuration :
□ Signing & Capabilities → Compte valide
□ Bundle ID : com.eteo.endo.v2
□ Version : 4.1
□ Build : 9
□ Vérifier les entitlement :
□ In-App Purchase activé
6.3 - Archive et Upload
□ Product → Archive
□ Valider l'archive
□ Uploader sur App Store Connect
6.4 - App Store Connect
□ Build 9 apparu dans "Pré-production"
□ Vérifier les métadonnées :
□ Version 4.1
□ Notes de version : "Ajout des abonnements In-App Purchase"
□ Captures d'écran (déjà 7/10)
6.5 - Soumission
□ Soumettre pour révision
□ Délai : 24-48h
✅ PHASE 6 - RÉSUMÉ
Élément	Statut
Code commité	⬜
Build 9 créé	⬜
Entitlements vérifiés	⬜
Upload App Store Connect	⬜
Version 4.1 configurée	⬜
Soumission envoyée	⬜
🔵 PHASE 7 : POST-SOUMISSION
7.1 - Suivi de la révision
□ Vérifier l'état dans App Store Connect
□ Si rejet : analyser et corriger
□ Si accepté : configurer la mise en production
7.2 - Mise en production
□ Version 4.1 disponible sur l'App Store
□ Vérifier les IAP fonctionnent en production
□ Surveiller les premiers achats
7.3 - Dashboard de suivi
□ Configurer un dashboard Firebase :
□ Nombre d'abonnements actifs
□ Revenus mensuels
□ Taux de conversion
□ Certificats délivrés
7.4 - Documentation
□ Documenter l'architecture pour l'équipe
□ Documenter les processus de maintenance :
□ Comment ajouter un produit IAP
□ Comment gérer les remboursements
□ Comment gérer les expirations
✅ PHASE 7 - RÉSUMÉ
Élément	Statut
Version 4.1 en production	⬜
IAP vérifiés en production	⬜
Dashboard configuré	⬜
Documentation écrite	⬜
📊 RÉCAPITULATIF GLOBAL
Phase	Tâches	Statut
PHASE 0	Prérequis	⬜
PHASE 1	App Store Connect (IAP)	⬜
PHASE 2	Backend Firebase	⬜
PHASE 3	StoreKit	⬜
PHASE 4	Intégration pages	⬜
PHASE 5	Tests	⬜
PHASE 6	Soumission	⬜
PHASE 7	Post-soumission	⬜
🚀 PROCHAINES ÉTAPES POUR TOI
Maintenant :
Créer les 4 produits IAP dans App Store Connect (Phase 1)

Dis-moi quand c'est fait

Ensuite je te fournis :
✅ Le code Firebase complet (validation V2 + webhook JWS)

✅ Le code StoreKitService

✅ Les pages HTML modifiées

✅ Les instructions de déploiement

Prêt à commencer la Phase 1 ? Crée les produits IAP ! 🍎💎🚀

This response is AI-generated, for reference only.


@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@########################################@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@


Pour reinitialiser les inscription dans localstorage dans F12  on tape ceci :  



// ✅ VIDER LE LOCALSTORAGE
localStorage.clear();

// ✅ AFFICHER UN MESSAGE
console.log('✅ LocalStorage vidé !');
console.log('🔄 Rechargez la page et créez votre compte admin.');


@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@

// ============================================================
// RÉINITIALISATION COMPLÈTE - AVEC DÉCONNEXION FIREBASE
// ============================================================

(async function() {
    try {
        // 1. Récupérer Firebase Auth
        const { getAuth, signOut } = await import('firebase/auth');
        const auth = getAuth();
        
        // 2. Déconnecter l'utilisateur de Firebase Auth
        await signOut(auth);
        console.log('✅ Déconnecté de Firebase Auth');
        
        // 3. Vider le localStorage
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ Stockage local vidé');
        
        // 4. Message
        console.log('✅ RÉINITIALISATION COMPLÈTE TERMINÉE !');
        console.log('📝 Rechargement de la page...');
        
        // 5. Recharger
        location.reload(true);
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        console.log('💡 Si ça ne marche pas, utilisez la navigation privée.');
    }
})();