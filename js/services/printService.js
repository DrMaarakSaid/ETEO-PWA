// ============================================================
// PRINT SERVICE - Impression des certificats (Version iOS)
// ============================================================

import { CertificateGenerator } from './CertificateGenerator.js';

export class PrintService {
    
    constructor() {
        this.isPrinting = false;
        this.generator = new CertificateGenerator();
        console.log('🖨️ PrintService iOS initialisé');
    }

    /**
     * Imprime un certificat (utilise le template image)
     * @param {Object} certificate - Données du certificat
     * @param {string} format - 'pdf' ou 'html' (par défaut 'pdf')
     * @returns {Promise<boolean>} Succès ou échec
     */
    async printCertificate(certificate, format = 'pdf') {
        try {
            if (this.isPrinting) {
                console.warn('🖨️ Une impression est déjà en cours');
                return false;
            }

            if (!certificate) {
                console.error('❌ Certificat non fourni');
                return false;
            }

            this.isPrinting = true;

            // ✅ Si format === 'pdf', utiliser le CertificateGenerator (image template)
            if (format === 'pdf') {
                await this.printPDFWithImage(certificate);
            } else {
                // Fallback HTML
                const html = this.generateCertificateHTML(certificate);
                await this.printHTML(html);
            }

            this.isPrinting = false;
            return true;

        } catch (error) {
            console.error('❌ Erreur impression:', error);
            this.isPrinting = false;
            // Fallback : impression HTML
            try {
                const html = this.generateCertificateHTML(certificate);
                await this.printHTML(html);
            } catch (e) {
                console.error('❌ Erreur fallback:', e);
            }
            return false;
        }
    }

    /**
     * Impression PDF avec image template
     * @param {Object} certificate - Données du certificat
     * @returns {Promise<void>}
     */
    async printPDFWithImage(certificate) {
        return new Promise(async (resolve, reject) => {
            try {
                // ✅ Générer le PDF avec l'image template
                const userName = certificate.userName || 'Docteur';
                const specialty = certificate.specialty || certificate.volet || 'ETEO';
                const score = certificate.score || 0;
                const total = certificate.total || 50;
                const percentage = certificate.percentage || Math.round((score / total) * 100);
                const date = new Date(certificate.date || Date.now());
                const formattedDate = date.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric'
                });
                const certificateId = this.generator.generateCertificateId();

                const blob = await this.generator.generateCertificate({
                    userName: userName,
                    specialty: specialty,
                    score: score,
                    total: total,
                    percentage: percentage,
                    date: formattedDate,
                    certificateId: certificateId
                });

                // Créer un lien temporaire pour le PDF
                const url = URL.createObjectURL(blob);
                const win = window.open(url, '_blank', 'width=800,height=600');

                if (!win) {
                    // Fallback : télécharger le PDF directement
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `Certificat_ETEO_${specialty}_${new Date().toISOString().slice(0,10)}.pdf`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    resolve();
                } else {
                    // La fenêtre s'ouvre avec le PDF, l'utilisateur peut l'imprimer
                    // On ne peut pas forcer l'impression depuis le PDF
                    win.onload = function() {
                        // Suggérer l'impression
                        win.print();
                    };
                    // On considère que c'est réussi
                    resolve();
                }

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Impression HTML standard (fallback)
     * @param {string} html - HTML du certificat
     * @returns {Promise<void>}
     */
    async printHTML(html) {
        return new Promise((resolve, reject) => {
            try {
                const win = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
                
                if (!win) {
                    this.printFallback(html);
                    resolve();
                    return;
                }

                win.document.write(html);
                win.document.close();

                win.onload = function() {
                    win.print();
                    win.onafterprint = function() {
                        win.close();
                        resolve();
                    };
                };

                win.onerror = function(error) {
                    reject(error);
                };

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Méthode de secours si le popup est bloqué
     * @param {string} html - HTML du certificat
     */
    printFallback(html) {
        try {
            const container = document.createElement('div');
            container.id = 'printFallbackContainer';
            container.innerHTML = html;
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: white;
                z-index: 99999;
                padding: 40px;
                overflow: auto;
            `;
            document.body.appendChild(container);

            setTimeout(() => {
                window.print();
                window.onafterprint = function() {
                    const el = document.getElementById('printFallbackContainer');
                    if (el) el.remove();
                };
            }, 300);

        } catch (error) {
            console.error('❌ Erreur fallback:', error);
            window.print();
        }
    }

    /**
     * Génère le HTML du certificat (fallback)
     * @param {Object} certificate - Données du certificat
     * @returns {string} HTML du certificat
     */
    generateCertificateHTML(certificate) {
        const date = new Date(certificate.date || Date.now());
        const formattedDate = date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });

        let title = 'CERTIFICAT D\'EXCELLENCE';
        let subtitle = '';
        let details = '';

        switch (certificate.type) {
            case 'specialty':
                title = 'CERTIFICAT DE SPÉCIALITÉ';
                subtitle = `Spécialité : ${certificate.specialty || ''}`;
                details = `Score obtenu : ${certificate.score || 0}% • ${certificate.totalLevels || 0} niveaux validés`;
                break;
            case 'volet':
                title = 'CERTIFICAT DU VOLET';
                subtitle = `Volet : ${certificate.volet || ''}`;
                details = `Score moyen : ${certificate.score || 0}% • ${certificate.specialties?.length || 0} spécialités`;
                break;
            case 'full':
                title = 'CERTIFICAT COMPLET ETEO';
                subtitle = 'Toutes les spécialités validées !';
                details = `Score global : ${certificate.score || 0}% • ${certificate.totalLevels || 0}/216 niveaux`;
                break;
            default:
                title = 'CERTIFICAT ETEO';
                subtitle = 'Validation réussie !';
                details = '';
        }

        const userName = certificate.userName || 'Docteur';

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Certificat ETEO - ${userName}</title>
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
                        margin: 0;
                    }
                    .certificate {
                        width: 800px;
                        min-height: 600px;
                        padding: 40px;
                        border: 8px solid #667eea;
                        border-radius: 20px;
                        background: linear-gradient(135deg, #f8f9ff, #ffffff);
                        text-align: center;
                        position: relative;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
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
                    .certificate .logo { font-size: 2.5rem; margin-bottom: 10px; display: block; }
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
                        text-transform: uppercase;
                        letter-spacing: 2px;
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
                    .certificate .footer .signature { font-size: 0.85rem; color: #2c3e50; text-align: right; }
                    .certificate .footer .signature strong { color: #667eea; }
                    .certificate .footer .signature .sub { font-size: 0.7rem; color: #888; font-weight: normal; }
                    @media print {
                        body { padding: 0; background: white; }
                        .certificate { box-shadow: none; border: 8px solid #667eea; page-break-inside: avoid; }
                        .certificate .border-decoration { border-color: rgba(102, 126, 234, 0.2); }
                    }
                    @media (max-width: 850px) {
                        .certificate { width: 100%; padding: 30px 20px; min-height: 400px; }
                        .certificate .name { font-size: 1.8rem; }
                        .certificate .title { font-size: 1.5rem; }
                    }
                    @media (max-width: 520px) {
                        .certificate { padding: 20px 15px; min-height: 350px; }
                        .certificate .name { font-size: 1.4rem; }
                        .certificate .title { font-size: 1.2rem; }
                        .certificate .footer { flex-direction: column; gap: 10px; text-align: center; }
                        .certificate .footer .signature { text-align: center; }
                    }
                </style>
            </head>
            <body>
                <div class="certificate" id="certificateContainer">
                    <div class="border-decoration"></div>
                    <div class="logo">🌟</div>
                    <div class="title">${title}</div>
                    <div class="subtitle">${subtitle}</div>
                    <div class="divider"></div>
                    <div class="awarded-to">Décerné à</div>
                    <div class="name">${userName}</div>
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
                            <br><span class="sub">Fondateur d'ETEO</span>
                        </span>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    /**
     * Vérifie si l'impression est supportée
     * @returns {boolean}
     */
    isSupported() {
        return typeof window.print === 'function';
    }

    /**
     * Obtient les informations sur l'imprimante (si disponible)
     * @returns {Promise<Object>}
     */
    async getPrinterInfo() {
        return {
            supported: this.isSupported(),
            canPrint: true
        };
    }
}

export default PrintService;