// ============================================================
// FIREBASE SERVICE - Initialisation de Firebase
// ============================================================

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// ============================================================
// CONFIGURATION FIREBASE (VOTRE PROJET)
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyDcIvbmmnqiEqWbjNqTUwx1JGWkj6dxK-DE",
    authDomain: "eteo-endo-to-every-one.firebaseapp.com",
    databaseURL: "https://eteo-endo-to-every-one-default-rtdb.firebaseio.com",
    projectId: "eteo-endo-to-every-one",
    storageBucket: "eteo-endo-to-every-one.firebasestorage.app",
    messagingSenderId: "511524282020",
    appId: "1:511524282020:web:5a25c021fd84f026969031"
};

// ============================================================
// INITIALISATION
// ============================================================

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Exporter les services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Exporter l'application pour utilisation éventuelle
export default app;

// ============================================================
// VÉRIFICATION (à supprimer après test)
// ============================================================

console.log('🔥 Firebase initialisé avec succès !');
console.log('📁 Project ID:', firebaseConfig.projectId);
console.log('🔑 API Key:', firebaseConfig.apiKey.substring(0, 15) + '...');