// ============================================================
// CONFIGURATION CENTRALE ETEO V2
// ============================================================

export const CONFIG = {
    VERSION: '2.0.0',
    TIME_PER_QUESTION: 50, // secondes
    MAX_QUESTIONS: 10,
    LANGUAGES: ['fr', 'en', 'es', 'ru', 'it', 'pt', 'zh', 'de', 'hi'],
    DEFAULT_LANG: 'fr',
    
    // Firebase (placeholders)
    FIREBASE: {
        apiKey: null,
        authDomain: null,
        projectId: null,
        storageBucket: null,
        messagingSenderId: null,
        appId: null
    },
    
    // Stripe (placeholders)
    STRIPE: {
        publicKey: null
    },
    
    // Clés de stockage
    STORAGE_KEYS: {
        SCORE: 'eteo_score',
        PROGRESS: 'eteo_progress',
        SETTINGS: 'eteo_settings',
        QUIZ_DAY: 'eteo_quiz_day',
        CHALLENGE: 'eteo_challenge'
    }
};

// ============================================================
// CONFIGURATION DES LANGUES (AJOUT)
// ============================================================

export const LANGUAGES = {
    fr: {
        code: 'fr',
        name: 'Français',
        flag: '🇫🇷',
        levels: ['debutant1', 'debutant2', 'intermediaire1', 'intermediaire2', 'expert1', 'expert2'],
        levelLabels: ['Débutant 1', 'Débutant 2', 'Intermédiaire 1', 'Intermédiaire 2', 'Expert 1', 'Expert 2'],
        dir: 'ltr',
        levelsDisplay: {
            'debutant1': 'Débutant 1',
            'debutant2': 'Débutant 2',
            'intermediaire1': 'Intermédiaire 1',
            'intermediaire2': 'Intermédiaire 2',
            'expert1': 'Expert 1',
            'expert2': 'Expert 2'
        }
    },
    en: {
        code: 'en',
        name: 'English',
        flag: '🇬🇧',
        levels: ['beginner1', 'beginner2', 'intermediate1', 'intermediate2', 'expert1', 'expert2'],
        levelLabels: ['Beginner 1', 'Beginner 2', 'Intermediate 1', 'Intermediate 2', 'Expert 1', 'Expert 2'],
        dir: 'ltr',
        levelsDisplay: {
            'beginner1': 'Beginner 1',
            'beginner2': 'Beginner 2',
            'intermediate1': 'Intermediate 1',
            'intermediate2': 'Intermediate 2',
            'expert1': 'Expert 1',
            'expert2': 'Expert 2'
        }
    },
    es: {
        code: 'es',
        name: 'Español',
        flag: '🇪🇸',
        levels: ['principiante1', 'principiante2', 'intermedio1', 'intermedio2', 'experto1', 'experto2'],
        levelLabels: ['Principiante 1', 'Principiante 2', 'Intermedio 1', 'Intermedio 2', 'Experto 1', 'Experto 2'],
        dir: 'ltr',
        levelsDisplay: {
            'principiante1': 'Principiante 1',
            'principiante2': 'Principiante 2',
            'intermedio1': 'Intermedio 1',
            'intermedio2': 'Intermedio 2',
            'experto1': 'Experto 1',
            'experto2': 'Experto 2'
        }
    },
    ru: {
        code: 'ru',
        name: 'Русский',
        flag: '🇷🇺',
        levels: ['nachinayushchiy1', 'nachinayushchiy2', 'sredniy1', 'sredniy2', 'ekspert1', 'ekspert2'],
        levelLabels: ['Начинающий 1', 'Начинающий 2', 'Средний 1', 'Средний 2', 'Эксперт 1', 'Эксперт 2'],
        dir: 'ltr',
        levelsDisplay: {
            'nachinayushchiy1': 'Начинающий 1',
            'nachinayushchiy2': 'Начинающий 2',
            'sredniy1': 'Средний 1',
            'sredniy2': 'Средний 2',
            'ekspert1': 'Эксперт 1',
            'ekspert2': 'Эксперт 2'
        }
    },
    it: {
        code: 'it',
        name: 'Italiano',
        flag: '🇮🇹',
        levels: ['principiante1', 'principiante2', 'intermedio1', 'intermedio2', 'esperto1', 'esperto2'],
        levelLabels: ['Principiante 1', 'Principiante 2', 'Intermedio 1', 'Intermedio 2', 'Esperto 1', 'Esperto 2'],
        dir: 'ltr',
        levelsDisplay: {
            'principiante1': 'Principiante 1',
            'principiante2': 'Principiante 2',
            'intermedio1': 'Intermedio 1',
            'intermedio2': 'Intermedio 2',
            'esperto1': 'Esperto 1',
            'esperto2': 'Esperto 2'
        }
    },
    pt: {
        code: 'pt',
        name: 'Português',
        flag: '🇵🇹',
        levels: ['iniciante1', 'iniciante2', 'intermediario1', 'intermediario2', 'especialista1', 'especialista2'],
        levelLabels: ['Iniciante 1', 'Iniciante 2', 'Intermediário 1', 'Intermediário 2', 'Especialista 1', 'Especialista 2'],
        dir: 'ltr',
        levelsDisplay: {
            'iniciante1': 'Iniciante 1',
            'iniciante2': 'Iniciante 2',
            'intermediario1': 'Intermediário 1',
            'intermediario2': 'Intermediário 2',
            'especialista1': 'Especialista 1',
            'especialista2': 'Especialista 2'
        }
    },
    zh: {
        code: 'zh',
        name: '中文',
        flag: '🇨🇳',
        levels: ['chuji1', 'chuji2', 'zhongji1', 'zhongji2', 'gaoji1', 'gaoji2'],
        levelLabels: ['初级 1', '初级 2', '中级 1', '中级 2', '高级 1', '高级 2'],
        dir: 'ltr',
        levelsDisplay: {
            'chuji1': '初级 1',
            'chuji2': '初级 2',
            'zhongji1': '中级 1',
            'zhongji2': '中级 2',
            'gaoji1': '高级 1',
            'gaoji2': '高级 2'
        }
    },
    de: {
        code: 'de',
        name: 'Deutsch',
        flag: '🇩🇪',
        levels: ['anfaenger1', 'anfaenger2', 'mittelstufe1', 'mittelstufe2', 'experte1', 'experte2'],
        levelLabels: ['Anfänger 1', 'Anfänger 2', 'Mittelstufe 1', 'Mittelstufe 2', 'Experte 1', 'Experte 2'],
        dir: 'ltr',
        levelsDisplay: {
            'anfaenger1': 'Anfänger 1',
            'anfaenger2': 'Anfänger 2',
            'mittelstufe1': 'Mittelstufe 1',
            'mittelstufe2': 'Mittelstufe 2',
            'experte1': 'Experte 1',
            'experte2': 'Experte 2'
        }
    },
    hi: {
        code: 'hi',
        name: 'हिन्दी',
        flag: '🇮🇳',
        levels: ['shuruvat1', 'shuruvat2', 'madhyam1', 'madhyam2', 'vishagya1', 'vishagya2'],
        levelLabels: ['शुरुवात 1', 'शुरुवात 2', 'मध्यम 1', 'मध्यम 2', 'विशाग्य 1', 'विशाग्य 2'],
        dir: 'ltr',
        levelsDisplay: {
            'shuruvat1': 'शुरुवात 1',
            'shuruvat2': 'शुरुवात 2',
            'madhyam1': 'मध्यम 1',
            'madhyam2': 'मध्यम 2',
            'vishagya1': 'विशाग्य 1',
            'vishagya2': 'विशाग्य 2'
        }
    }
};

// ============================================================
// FONCTIONS DE CHEMINS MULTILINGUES (AJOUT)
// ============================================================

/**
 * Retourne le chemin vers un fichier JSON de niveau
 * @param {string} language - Code de langue (fr, en, es, etc.)
 * @param {string} specialtyId - ID de la spécialité
 * @param {string} level - ID du niveau (ex: beginner1)
 * @returns {string} Chemin complet vers le fichier
 */
export const getDataPath = (language = 'fr', specialtyId, level) => {
    return `data/${language}/${specialtyId}/${level}.json`;
};

/**
 * Retourne le chemin vers le fichier story d'une spécialité
 * @param {string} language - Code de langue (fr, en, es, etc.)
 * @param {string} specialtyId - ID de la spécialité
 * @returns {string} Chemin complet vers le fichier story
 */
export const getStoryPath = (language = 'fr', specialtyId) => {
    return `data/${language}/${specialtyId}/stories/story_v1.json`;
};

/**
 * Retourne le chemin vers un fichier audio
 * @param {string} language - Code de langue (fr, en, es, etc.)
 * @param {string} specialtyId - ID de la spécialité
 * @param {string} filename - Nom du fichier audio
 * @returns {string} Chemin complet vers le fichier audio
 */
export const getAudioPath = (language = 'fr', specialtyId, filename = 'story_v1.mp3') => {
    return `audio/${language}/${specialtyId}/${filename}`;
};

// ============================================================
// FONCTIONS DE RÉCUPÉRATION DES CONFIGURATIONS (AJOUT)
// ============================================================

/**
 * Récupère la configuration complète d'une langue
 * @param {string} langCode - Code de langue (fr, en, es, etc.)
 * @returns {object} Configuration de la langue
 */
export const getLanguageConfig = (langCode) => {
    return LANGUAGES[langCode] || LANGUAGES.fr;
};

/**
 * Récupère les niveaux disponibles pour une langue
 * @param {string} langCode - Code de langue (fr, en, es, etc.)
 * @returns {array} Liste des niveaux avec id et label
 */
export const getLevelsForLanguage = (langCode) => {
    const config = getLanguageConfig(langCode);
    return config.levels.map((level, index) => ({
        id: level,
        label: config.levelLabels[index] || level
    }));
};

/**
 * Récupère le label d'un niveau pour une langue donnée
 * @param {string} langCode - Code de langue
 * @param {string} levelId - ID du niveau (ex: beginner1)
 * @returns {string} Label du niveau dans la langue
 */
export const getLevelLabel = (langCode, levelId) => {
    const config = getLanguageConfig(langCode);
    return config.levelsDisplay?.[levelId] || levelId;
};

/**
 * Vérifie si une langue est supportée
 * @param {string} langCode - Code de langue à vérifier
 * @returns {boolean} Vrai si la langue est supportée
 */
export const isLanguageSupported = (langCode) => {
    return !!LANGUAGES[langCode];
};

/**
 * Retourne la liste des langues supportées
 * @returns {array} Liste des codes de langue
 */
export const getSupportedLanguages = () => {
    return Object.keys(LANGUAGES);
};

// ============================================================
// CONFIGURATION DES SPÉCIALITÉS (36) - INCHANGÉ
// ============================================================

export const SPECIALTIES = [
    // CLINIQUE (11)
    { id: 'chirurgie', name: 'Chirurgie', emoji: '🔪', category: 'clinique' },
    { id: 'endo', name: 'Endodontie', emoji: '🦷', category: 'clinique' },
    { id: 'esthetique', name: 'Esthétique', emoji: '✨', category: 'clinique' },
    { id: 'implantologie', name: 'Implantologie', emoji: '🔩', category: 'clinique' },
    { id: 'Médecine_buccale', name: 'Médecine buccale', emoji: '👄', category: 'clinique' },
    { id: 'orthodontie', name: 'Orthodontie', emoji: '🦷', category: 'clinique' },
    { id: 'parodontologie', name: 'Parodontologie', emoji: '🦷', category: 'clinique' },
    { id: 'pedodontie', name: 'Pédodontie', emoji: '👶', category: 'clinique' },
    { id: 'prothese', name: 'Prothèse', emoji: '🦷', category: 'clinique' },
    { id: 'Relationnel&Psychomotricité', name: 'Relationnel & Psychomotricité', emoji: '🧠', category: 'clinique' },
    { id: 'Soins_conservateurs', name: 'Soins conservateurs', emoji: '🦷', category: 'clinique' },
    
    // TECHNIQUE (5)
    { id: 'anesthesiologie', name: 'Anesthésiologie', emoji: '💉', category: 'technique' },
    { id: 'cfao_impression3d', name: 'CFAO & Impression 3D', emoji: '🖨️', category: 'technique' },
    { id: 'photographie', name: 'Photographie', emoji: '📸', category: 'technique' },
    { id: 'radiologie', name: 'Radiologie', emoji: '📷', category: 'technique' },
    { id: 'sterilisation', name: 'Stérilisation', emoji: '🧼', category: 'technique' },
    
    // GESTION (10)
    { id: 'aides_installation', name: 'Aides à l\'installation', emoji: '🔧', category: 'gestion' },
    { id: 'amenagement_cabinet', name: 'Aménagement du cabinet', emoji: '🏥', category: 'gestion' },
    { id: 'comptabilite_fiscalite', name: 'Comptabilité & Fiscalité', emoji: '📊', category: 'gestion' },
    { id: 'conventionnement_amo', name: 'Conventionnement & AMO', emoji: '📋', category: 'gestion' },
    { id: 'fiscalite_dentiste', name: 'Fiscalité du dentiste', emoji: '💰', category: 'gestion' },
    { id: 'formes_juridiques', name: 'Formes juridiques', emoji: '🏛️', category: 'gestion' },
    { id: 'gestion_cabinet', name: 'Gestion du cabinet', emoji: '📈', category: 'gestion' },
    { id: 'Informatique Logiciels dentaires', name: 'Informatique & Logiciels', emoji: '💻', category: 'gestion' },
    { id: 'mutuelles_prises_en_charge', name: 'Mutuelles & Prise en charge', emoji: '🛡️', category: 'gestion' },
    { id: 'sante_publique', name: 'Santé publique', emoji: '🌍', category: 'gestion' },
    
    // RH (8)
    { id: 'assistantes_dentaires', name: 'Assistantes dentaires', emoji: '👩‍⚕️', category: 'rh' },
    { id: 'code_deontologie', name: 'Code de déontologie', emoji: '📜', category: 'rh' },
    { id: 'conflits_médiation', name: 'Conflits & Médiation', emoji: '🤝', category: 'rh' },
    { id: 'ethique_deontologie', name: 'Éthique & Déontologie', emoji: '⚖️', category: 'rh' },
    { id: 'Femmes_dentistes', name: 'Femmes dentistes', emoji: '👩‍⚕️', category: 'rh' },
    { id: 'futur_docteur', name: 'Futur docteur', emoji: '🎓', category: 'rh' },
    { id: 'ONMD_CRS_CRN', name: 'ONMD / CRS / CRN', emoji: '📇', category: 'rh' },
    { id: 'seniors', name: 'Seniors', emoji: '👴', category: 'rh' },
    { id: 'syndicat', name: 'Syndicat', emoji: '🤝', category: 'rh' },
    
    // SCIENCES (1)
    { id: 'materiaux_dentaires', name: 'Matériaux dentaires', emoji: '🧪', category: 'sciences' }
];

// ============================================================
// CATÉGORIES LABELS - INCHANGÉ
// ============================================================

export const CATEGORY_LABELS = {
    clinique: '🏥 Clinique',
    technique: '🔬 Technique',
    gestion: '📊 Gestion',
    rh: '👥 RH',
    sciences: '🧬 Sciences'
};

// ============================================================
// CONFIGURATION DES RANGS - INCHANGÉ
// ============================================================

export const RANKS = [
    { id: 'apprenti', label: 'Apprenti', emoji: '🥉', minSpecialties: 0, color: '#8bc34a' },
    { id: 'praticien', label: 'Praticien', emoji: '🥈', minSpecialties: 3, color: '#2196F3' },
    { id: 'expert', label: 'Expert', emoji: '🥇', minSpecialties: 6, color: '#9C27B0' },
    { id: 'maitre', label: 'Maître', emoji: '💎', minSpecialties: 10, color: '#f44336' },
    { id: 'legende', label: 'Légende', emoji: '👑', minSpecialties: 15, color: '#FF9800' },
    { id: 'mythe', label: 'Mythe', emoji: '🌟', minSpecialties: 20, color: '#FFD700' }
];

// ============================================================
// CONFIGURATION DES BADGES - INCHANGÉ
// ============================================================

export const BADGES_CONFIG = [
    {
        id: 'first_step',
        name: 'Premier pas',
        emoji: '🎯',
        condition: 'first_completed',
        description: 'Compléter 1 spécialité',
        tip: 'Commencez par n\'importe quelle spécialité. La première est toujours la plus mémorable !'
    },
    {
        id: 'streak',
        name: 'Série',
        emoji: '🔥',
        condition: 'streak_3',
        description: 'Série de 3 jours',
        tip: 'Connectez-vous 3 jours de suite. Même 5 minutes par jour suffisent !'
    },
    {
        id: 'polyvalent',
        name: 'Polyvalent',
        emoji: '🧠',
        condition: 'categories_3',
        description: 'Explorer 3 catégories',
        tip: 'Essayez des spécialités dans 3 domaines différents : Clinique, Gestion, RH, Technique ou Sciences.'
    },
    {
        id: 'rapide',
        name: 'Rapide',
        emoji: '⚡',
        condition: 'fast_completion',
        description: 'Score parfait sur une spécialité',
        tip: 'Concentrez-vous sur une spécialité et révisez jusqu\'à obtenir 100% à tous les niveaux.'
    },
    {
        id: 'perseverant',
        name: 'Persévérant',
        emoji: '💪',
        condition: 'retry_success',
        description: 'Réussir après un échec',
        tip: 'N\'ayez pas peur d\'échouer ! Échouez puis retentez votre chance jusqu\'à réussir.'
    },
    {
        id: 'champion',
        name: 'Champion',
        emoji: '🏆',
        condition: 'top_10',
        description: 'Compléter 10 spécialités',
        tip: 'La persévérance paie ! Continuez à compléter des spécialités, une par une.'
    }
];

// ============================================================
// NIVEAUX DISPONIBLES (6 niveaux) - INCHANGÉ
// ============================================================

export const LEVELS = [
    { id: 'debutant1', label: 'Débutant 1', badge: '🌱', type: 'free' },
    { id: 'debutant2', label: 'Débutant 2', badge: '🌿', type: 'free' },
    { id: 'intermediaire1', label: 'Intermédiaire 1', badge: '⭐', type: 'locked' },
    { id: 'intermediaire2', label: 'Intermédiaire 2', badge: '⭐⭐', type: 'locked' },
    { id: 'expert1', label: 'Expert 1', badge: '🏆', type: 'locked' },
    { id: 'expert2', label: 'Expert 2', badge: '🏆🏆', type: 'locked' }
];

// ============================================================
// MESSAGES POUR LES CADEAUX - INCHANGÉ
// ============================================================

export const GIFT_MESSAGES = {
    all_unlocked: '🎉 FÉLICITATIONS ! Tous les badges débloqués ! Certificat d\'excellence ETEO + Accès VIP aux contenus premium ! 🏆',
    partial: (remaining) => `Débloquez les ${remaining} badge${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''} pour recevoir un 🎁 certificat d'excellence ETEO et un accès anticipé aux futures spécialités !`
};

// ============================================================
// DÉFIS DU JOUR - INCHANGÉ
// ============================================================

export const CHALLENGES = [
    'Complétez une spécialité aujourd\'hui !',
    'Obtenez 80% à une spécialité !',
    'Complétez 2 spécialités aujourd\'hui !',
    'Améliorez votre score de 10% !',
    'Essayez une nouvelle spécialité !'
];

// ============================================================
// ✅ UN SEUL EXPORT DEFAULT
// ============================================================

export default CONFIG;