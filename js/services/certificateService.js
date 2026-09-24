// ============================================================
// CERTIFICATE SERVICE - Version iOS (users_ios)
// Génération de certificats PDF avec image template
// ============================================================

import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { CertificateGenerator } from './CertificateGenerator.js';

export class CertificateService {
    
    constructor() {
        this.db = getFirestore();
        this.auth = getAuth();
        this.generator = new CertificateGenerator();
    }

    // ============================================================
    // MÉTHODES PUBLIQUES
    // ============================================================

    /**
     * Génère un certificat pour une spécialité
     * @param {string} userId - UID de l'utilisateur
     * @param {string} specialtyId - ID de la spécialité
     * @param {number} score - Score obtenu (sur 50)
     * @param {string} specialtyName - Nom de la spécialité
     * @returns {Promise<Object>} Données du certificat
     */
    async generateSpecialtyCertificate(userId, specialtyId, score, specialtyName) {
        try {
            const userData = await this.getUserData(userId);
            if (!userData) throw new Error('Utilisateur non trouvé');

            const certificate = {
                type: 'specialty',
                id: `${specialtyId}_${userId}`,
                userId: userId,
                userName: userData.displayName || userData.fullName || 'Docteur',
                specialty: specialtyName,
                specialtyId: specialtyId,
                score: score,
                total: 50,
                percentage: Math.round((score / 50) * 100),
                date: new Date().toISOString(),
                template: 'specialty'
            };

            return certificate;

        } catch (error) {
            console.error('❌ Erreur génération certificat spécialité:', error);
            throw error;
        }
    }

    /**
     * Génère un certificat pour un volet
     * @param {string} userId - UID de l'utilisateur
     * @param {string} voletName - Nom du volet
     * @param {Array} specialties - Spécialités du volet
     * @param {number} avgScore - Score moyen du volet
     * @returns {Promise<Object>} Données du certificat
     */
    async generateVoletCertificate(userId, voletName, specialties, avgScore) {
        try {
            const userData = await this.getUserData(userId);
            if (!userData) throw new Error('Utilisateur non trouvé');

            const certificate = {
                type: 'volet',
                id: `${voletName}_${userId}`,
                userId: userId,
                userName: userData.displayName || userData.fullName || 'Docteur',
                volet: voletName,
                specialties: specialties,
                score: avgScore,
                total: 100,
                percentage: Math.round(avgScore),
                date: new Date().toISOString(),
                template: 'volet'
            };

            return certificate;

        } catch (error) {
            console.error('❌ Erreur génération certificat volet:', error);
            throw error;
        }
    }

    /**
     * Génère le certificat complet ETEO
     * @param {string} userId - UID de l'utilisateur
     * @param {number} totalScore - Score global
     * @param {number} totalLevels - Niveaux complétés
     * @returns {Promise<Object>} Données du certificat
     */
    async generateFullCertificate(userId, totalScore, totalLevels) {
        try {
            const userData = await this.getUserData(userId);
            if (!userData) throw new Error('Utilisateur non trouvé');

            const certificate = {
                type: 'full',
                id: `full_${userId}`,
                userId: userId,
                userName: userData.displayName || userData.fullName || 'Docteur',
                score: totalScore,
                totalLevels: totalLevels,
                date: new Date().toISOString(),
                template: 'full'
            };

            return certificate;

        } catch (error) {
            console.error('❌ Erreur génération certificat complet:', error);
            throw error;
        }
    }

    /**
     * Génère le PDF du certificat avec l'image template
     * @param {Object} data - Données du certificat
     * @param {string} data.userName - Nom du lauréat
     * @param {string} data.specialty - Spécialité
     * @param {number} data.score - Score
     * @param {number} data.total - Total (50)
     * @param {number} data.percentage - Pourcentage
     * @param {string} data.date - Date formatée
     * @param {string} data.certificateId - Code unique
     * @returns {Promise<Blob>} PDF en blob
     */
    async generateCertificatePDF(data) {
        try {
            // Utiliser le CertificateGenerator avec l'image template
            const blob = await this.generator.generateCertificate({
                userName: data.userName || 'Docteur',
                specialty: data.specialty || 'Spécialité',
                score: data.score || 0,
                total: data.total || 50,
                percentage: data.percentage || 0,
                date: data.date || new Date().toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                }),
                certificateId: data.certificateId || this.generator.generateCertificateId()
            });
            return blob;
        } catch (error) {
            console.error('❌ Erreur génération PDF certificat:', error);
            throw error;
        }
    }

    /**
     * Génère le HTML du certificat (fallback si image template non disponible)
     * @param {Object} certificate - Données du certificat
     * @returns {string} HTML du certificat
     */
    generateCertificateHTML(certificate) {
        const date = new Date(certificate.date);
        const formattedDate = date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        let title = '';
        let subtitle = '';
        let details = '';

        switch (certificate.type) {
            case 'specialty':
                title = 'CERTIFICAT D\'EXCELLENCE';
                subtitle = `Spécialité : ${certificate.specialty}`;
                details = `Score obtenu : ${certificate.percentage || certificate.score}%`;
                break;
            case 'volet':
                title = 'CERTIFICAT DU VOLET';
                subtitle = `Volet : ${certificate.volet}`;
                details = `Score moyen : ${certificate.percentage || certificate.score}% • ${certificate.specialties?.length || 0} spécialités`;
                break;
            case 'full':
                title = 'CERTIFICAT COMPLET ETEO';
                subtitle = 'Toutes les spécialités validées !';
                details = `Score global : ${certificate.percentage || certificate.score}% • ${certificate.totalLevels || 0}/216 niveaux`;
                break;
            default:
                title = 'CERTIFICAT ETEO';
                subtitle = 'Validation réussie !';
                details = '';
        }

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: 'Georgia', 'Times New Roman', serif;
                        background: white;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        padding: 20px;
                    }
                    .certificate {
                        width: 800px;
                        min-height: 600px;
                        padding: 40px;
                        border: 8px solid #667eea;
                        border-radius: 20px;
                        background: linear-gradient(135deg, #f8f9ff, #ffffff);
                        position: relative;
                        text-align: center;
                    }
                    .certificate .border-decoration {
                        position: absolute;
                        top: 15px;
                        left: 15px;
                        right: 15px;
                        bottom: 15px;
                        border: 2px solid rgba(102, 126, 234, 0.3);
                        border-radius: 12px;
                        pointer-events: none;
                    }
                    .certificate .logo { font-size: 2.5rem; margin-bottom: 10px; }
                    .certificate .title {
                        font-size: 2rem;
                        font-weight: 800;
                        color: #2c3e50;
                        letter-spacing: 3px;
                        margin-bottom: 5px;
                    }
                    .certificate .subtitle {
                        font-size: 1.2rem;
                        color: #667eea;
                        font-weight: 600;
                        margin-bottom: 20px;
                    }
                    .certificate .divider {
                        width: 60%;
                        height: 2px;
                        background: linear-gradient(90deg, transparent, #667eea, transparent);
                        margin: 15px auto;
                    }
                    .certificate .awarded-to {
                        font-size: 0.9rem;
                        color: #888;
                        margin-top: 20px;
                    }
                    .certificate .name {
                        font-size: 2.5rem;
                        font-weight: 700;
                        color: #2c3e50;
                        margin: 10px 0;
                        padding: 10px 20px;
                        border-bottom: 3px solid #667eea;
                        display: inline-block;
                    }
                    .certificate .message {
                        font-size: 1rem;
                        color: #555;
                        margin: 15px 0;
                        line-height: 1.6;
                    }
                    .certificate .details {
                        font-size: 0.95rem;
                        color: #667eea;
                        font-weight: 600;
                        margin: 10px 0;
                    }
                    .certificate .footer {
                        margin-top: 30px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding-top: 20px;
                        border-top: 1px solid #e0e0e0;
                    }
                    .certificate .footer .date { font-size: 0.85rem; color: #888; }
                    .certificate .footer .signature { font-size: 0.85rem; color: #2c3e50; }
                    .certificate .footer .signature strong { color: #667eea; }
                    @media print {
                        body { padding: 0; }
                        .certificate { box-shadow: none; border: 8px solid #667eea; }
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    <div class="border-decoration"></div>
                    <div class="logo">🌟</div>
                    <div class="title">${title}</div>
                    <div class="subtitle">${subtitle}</div>
                    <div class="divider"></div>
                    <div class="awarded-to">Décerné à</div>
                    <div class="name">${certificate.userName}</div>
                    <div class="message">
                        Pour avoir démontré une excellence exceptionnelle
                        <br>dans le cadre de la formation ETEO.
                    </div>
                    <div class="details">${details}</div>
                    <div class="divider"></div>
                    <div class="footer">
                        <span class="date">📅 ${formattedDate}</span>
                        <span class="signature">
                            ✍️ Dr. <strong>SAID MAARAK</strong>
                            <br><span style="font-size:0.7rem;color:#888;">Fondateur d'ETEO</span>
                        </span>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Télécharge le certificat en PDF (utilise l'image template)
     * @param {Object} certificate - Données du certificat
     */
    async downloadCertificate(certificate) {
        try {
            // ✅ Utiliser l'image template
            const blob = await this.generateCertificatePDF({
                userName: certificate.userName,
                specialty: certificate.specialty || certificate.volet || 'ETEO',
                score: certificate.score,
                total: certificate.total || 50,
                percentage: certificate.percentage || Math.round(certificate.score),
                date: new Date(certificate.date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                }),
                certificateId: this.generator.generateCertificateId()
            });

            // Télécharger le blob
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificat_ETEO_${certificate.specialty || certificate.volet || 'complet'}_${new Date().toISOString().slice(0,10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

        } catch (error) {
            console.error('❌ Erreur téléchargement certificat:', error);
            throw error;
        }
    }

    // ============================================================
    // MÉTHODES PRIVÉES
    // ============================================================

    /**
     * Récupère les données d'un utilisateur (iOS version)
     */
    async getUserData(userId) {
        try {
            // ✅ iOS : users_ios
            const userRef = doc(this.db, 'users_ios', userId);
            const snapshot = await getDoc(userRef);
            if (snapshot.exists()) {
                return snapshot.data();
            }
            return null;
        } catch (error) {
            console.error('❌ Erreur récupération utilisateur:', error);
            return null;
        }
    }
}

export default CertificateService;