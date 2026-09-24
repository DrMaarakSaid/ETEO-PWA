// ============================================================
// SHARE SERVICE - Partage des résultats sur les réseaux sociaux
// ============================================================

export class ShareService {
    
    constructor() {
        this.isMobile = window.hasOwnProperty('capacitor');
        console.log('📤 ShareService initialisé - Mode mobile :', this.isMobile);
    }

    /**
     * Partage un message sur les réseaux sociaux
     * @param {Object} options - Options de partage
     * @param {string} options.title - Titre du partage
     * @param {string} options.text - Texte à partager
     * @param {string} options.url - URL à partager
     * @param {string} options.dialogTitle - Titre de la boîte de dialogue (mobile)
     * @returns {Promise<boolean>} Succès ou échec
     */
    async share(options) {
        try {
            // ✅ APK (Capacitor)
            if (this.isMobile && window.Share) {
                console.log('📤 Partage via Capacitor Share...');
                await window.Share.share({
                    title: options.title || 'Partage ETEO',
                    text: options.text || '',
                    url: options.url || '',
                    dialogTitle: options.dialogTitle || 'Partager'
                });
                console.log('📤 Partage réussi sur mobile');
                return true;
            }
            
            // ✅ Navigateur Web (Web Share API)
            if (navigator.share) {
                console.log('📤 Partage via Web Share API...');
                await navigator.share({
                    title: options.title || 'Partage ETEO',
                    text: options.text || '',
                    url: options.url || ''
                });
                console.log('📤 Partage réussi sur navigateur');
                return true;
            }
            
            // ✅ Fallback : Copie dans le presse-papier
            if (navigator.clipboard) {
                console.log('📤 Copie via Presse-papier...');
                const fullText = `${options.text}\n\n${options.url}`;
                await navigator.clipboard.writeText(fullText);
                console.log('📤 Copie réussie');
                return true;
            }
            
            // ✅ Fallback ultime : prompt
            console.log('📤 Fallback ultime : prompt...');
            const fullText = `${options.text}\n\n${options.url}`;
            prompt("Copiez ce message à partager :", fullText);
            return true;
            
        } catch (error) {
            console.error('❌ Erreur de partage:', error);
            if (error.message && error.message.includes('cancel')) {
                console.log('📤 Partage annulé par l\'utilisateur');
                return false;
            }
            throw error;
        }
    }

    /**
     * Génère un message de partage pour les résultats de quiz
     * @param {Object} result - Résultat du quiz
     * @param {string} result.userName - Nom de l'utilisateur
     * @param {string} result.specialty - Spécialité
     * @param {string} result.level - Niveau
     * @param {number} result.score - Score en pourcentage
     * @param {number} result.points - Points gagnés
     * @param {number} result.totalPoints - Points totaux
     * @param {Array} result.badges - Badges débloqués
     * @param {number} result.streak - Série en cours
     * @param {boolean} result.isCorrect - Réponse correcte
     * @param {string} result.url - URL du site
     * @returns {Object} { title, text, url }
     */
    generateQuizShareMessage(result) {
        const {
            userName = 'Docteur',
            specialty = 'Inconnue',
            level = 'Débutant 1',
            score = 0,
            points = 0,
            totalPoints = 0,
            badges = [],
            streak = 0,
            isCorrect = true,
            url = 'https://www.eteo-dental.com'
        } = result;

        const emoji = isCorrect ? '🎉' : '💪';
        const status = isCorrect ? 'réussi' : 'terminé';
        const badgeText = badges.length > 0 
            ? `\n🏆 ${badges.length} badge${badges.length > 1 ? 's' : ''} débloqué${badges.length > 1 ? 's' : ''} !`
            : '';

        const text = 
`${emoji} ${userName} a ${status} le Quiz du Jour sur ETEO !

📚 Spécialité : ${specialty}
📊 Niveau : ${level}
🎯 Score : ${score}%
🏅 Points : +${points} (Total : ${totalPoints} points)
${badgeText}
${streak > 0 ? `🔥 Série : ${streak} jour${streak > 1 ? 's' : ''}` : ''}

🌐 Rejoignez ETEO : ${url}
#ETEO #Dentisterie #FormationContinue #QuizDuJour`;

        return {
            title: `🏆 ${userName} - Quiz du Jour ETEO`,
            text: text,
            url: url
        };
    }

    /**
     * Génère un message de partage pour un certificat
     * @param {Object} certificate - Données du certificat
     * @returns {Object} { title, text, url }
     */
    generateCertificateShareMessage(certificate) {
        const {
            userName = 'Docteur',
            specialty = 'Inconnue',
            type = 'specialty',
            score = 0,
            date = new Date().toISOString(),
            url = 'https://www.eteo-dental.com'
        } = certificate;

        const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        let title = '';
        let text = '';

        if (type === 'specialty') {
            title = `🏅 Certificat ETEO - ${specialty}`;
            text = 
`🎓 Félicitations ${userName} !

Vous avez obtenu le certificat "${specialty}" sur ETEO !
📊 Score : ${score}%
📅 ${formattedDate}

🌐 www.eteo-dental.com
#ETEO #Certificat #Dentisterie #Excellence`;
        } else if (type === 'full') {
            title = `🏆 Certificat Complet ETEO !`;
            text = 
`🌟 Félicitations ${userName} !

Vous avez obtenu le CERTIFICAT COMPLET ETEO !
Toutes les spécialités validées avec succès.
📊 Score global : ${score}%
📅 ${formattedDate}

🌐 www.eteo-dental.com
#ETEO #CertificatComplet #Dentisterie #Excellence`;
        } else {
            title = `📜 Certificat ETEO - ${specialty}`;
            text = 
`🎓 ${userName} a obtenu un certificat sur ETEO !

📚 ${specialty}
📊 Score : ${score}%
📅 ${formattedDate}

🌐 www.eteo-dental.com
#ETEO #Certificat #Dentisterie`;
        }

        return {
            title: title,
            text: text,
            url: url
        };
    }
}

export default ShareService;