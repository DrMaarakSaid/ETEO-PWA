// ============================================================
// CERTIFICATE MANAGER - Interface des certificats (iOS)
// ============================================================

import { CertificateService } from '../services/certificateService.js';
import { ProgressionService } from '../services/progressionService.js';
import { PrintService } from '../services/printService.js';
import { SPECIALTIES, CATEGORY_LABELS } from '../config.js';
import { TranslateService } from '../services/translate.js';

export class CertificateManager {
    
    /**
     * @param {CertificateService} certificateService - Service de certificats
     * @param {ProgressionService} progressionService - Service de progression
     * @param {Function} showToast - Fonction d'affichage des notifications
     */
    constructor(certificateService, progressionService, showToast) {
        this.certificateService = certificateService;
        this.progressionService = progressionService;
        this.showToast = showToast;
        this.printService = new PrintService();
        this.uid = null;
        this.data = null;
        
        // ✅ INITIALISER LE SERVICE DE TRADUCTION
        this.translate = new TranslateService();
    }

    // ============================================================
    // MÉTHODES PUBLIQUES
    // ============================================================

    /**
     * Charge et affiche les certificats
     * @param {HTMLElement} container - Conteneur HTML
     * @param {string} uid - UID de l'utilisateur
     */
    async loadCertificates(container, uid) {
        if (!container) {
            console.error('❌ Conteneur certificats non trouvé');
            return;
        }

        this.container = container;
        this.uid = uid;

        try {
            this.data = await this.progressionService.getUserProgression(uid);
            console.log('📜 Données certificats chargées:', this.data);
            this.render();
        } catch (error) {
            console.error('❌ Erreur chargement certificats:', error);
            if (this.showToast) {
                this.showToast(this.translate.get('certificates.load_error') || '❌ Error loading certificates', 3000);
            }
        }
    }

    /**
     * Rend les certificats
     */
    render() {
        if (!this.container || !this.data) return;

        const scores = this.data.quizScores || this.data.scores || {};
        const certificates = this.data.certificates || [];
        
        const specialtyCertificates = this.getSpecialtyCertificates(scores);
        const voletCertificates = this.getVoletCertificates(scores);
        const fullCertificate = this.getFullCertificate(scores);
        const certificateCount = certificates.length;

        // ✅ RÉCUPÉRER TOUTES LES TRADUCTIONS AVEC FALLBACKS
        const t = {
            certificates_obtained: this.translate.get('certificates.certificates_obtained') || '📜 Certificates obtained',
            specialties_certified: this.translate.get('certificates.specialties_certified') || '🏅 Certified specialties',
            folders_certified: this.translate.get('certificates.folders_certified') || '📁 Certified folders',
            eteo_complete: this.translate.get('certificates.eteo_complete') || '🏆 ETEO Complete',
            unlocked: this.translate.get('badge_modal.unlocked') || 'Unlocked',
            locked: this.translate.get('badge_modal.locked') || 'Locked',
            score: this.translate.get('statistics.score') || 'Score',
            specialty_certificates: this.translate.get('certificates.specialty_certificates') || '🏅 Specialty Certificates',
            folder_certificates: this.translate.get('certificates.folder_certificates') || '📁 Folder Certificates',
            print: this.translate.get('buttons.print') || '🖨️ Print',
            download: this.translate.get('certificates.download') || '📥 Download',
            full_certificate: this.translate.get('certificates.full_certificate') || '🏆 ETEO Complete Certificate',
            global_score: this.translate.get('certificates.global_score') || 'Global score',
            levels: this.translate.get('certificates.levels') || 'levels',
            unlock_full: this.translate.get('certificates.unlock_full') || 'Complete all specialties to unlock this ultimate certificate'
        };

        this.container.innerHTML = `
            <!-- STATISTIQUES -->
            <div class="certificate-stats" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 20px;">
                <div class="stat-item" style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e8e8e8;">
                    <span class="number" style="font-size: 1.8rem; font-weight: 800; color: #2c3e50;">${certificateCount}</span>
                    <span class="label" style="font-size: 0.8rem; color: #888; display: block; margin-top: 4px;">${t.certificates_obtained}</span>
                </div>
                <div class="stat-item" style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e8e8e8;">
                    <span class="number" style="font-size: 1.8rem; font-weight: 800; color: #2c3e50;">${specialtyCertificates.filter(s => s.unlocked).length}</span>
                    <span class="label" style="font-size: 0.8rem; color: #888; display: block; margin-top: 4px;">${t.specialties_certified}</span>
                </div>
                <div class="stat-item" style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e8e8e8;">
                    <span class="number" style="font-size: 1.8rem; font-weight: 800; color: #2c3e50;">${voletCertificates.filter(v => v.unlocked).length}</span>
                    <span class="label" style="font-size: 0.8rem; color: #888; display: block; margin-top: 4px;">${t.folders_certified}</span>
                </div>
                <div class="stat-item" style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e8e8e8;">
                    <span class="number" style="font-size: 1.8rem; font-weight: 800; color: ${fullCertificate.unlocked ? '#4caf50' : '#888'};">${fullCertificate.unlocked ? '✅' : '🔒'}</span>
                    <span class="label" style="font-size: 0.8rem; color: #888; display: block; margin-top: 4px;">${t.eteo_complete}</span>
                </div>
            </div>

            <!-- CERTIFICATS SPÉCIALITÉS -->
            <div class="certificate-section" style="margin-bottom: 20px;">
                <h3 class="section-title" style="color: #2c3e50; font-size: 1.1rem; margin-bottom: 12px;">${t.specialty_certificates}</h3>
                <div class="certificate-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
                    ${specialtyCertificates.map(spec => `
                        <div class="certificate-card ${spec.unlocked ? 'unlocked' : 'locked'}" 
                             style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid ${spec.unlocked ? '#4caf50' : '#e8e8e8'}; box-shadow: ${spec.unlocked ? '0 4px 15px rgba(76, 175, 80, 0.15)' : 'none'};">
                            <div class="card-icon" style="font-size: 2rem;">${spec.emoji}</div>
                            <div class="card-name" style="font-weight: 600; color: #2c3e50; margin: 6px 0; font-size: 0.85rem;">${spec.name}</div>
                            <div class="card-status" style="font-size: 0.75rem; color: ${spec.unlocked ? '#4caf50' : '#888'};">
                                ${spec.unlocked ? '✅ ' + t.unlocked : '🔒 ' + spec.progress + '%'}
                            </div>
                            ${spec.unlocked ? `
                                <div class="card-score" style="font-size: 0.8rem; color: #667eea; font-weight: 600; margin: 4px 0;">${t.score} : ${spec.score}%</div>
                                <div class="card-actions" style="display: flex; gap: 6px; justify-content: center; margin-top: 8px;">
                                    <button class="cert-print-btn" data-specialty="${spec.id}" style="padding: 4px 12px; border: none; border-radius: 16px; background: #667eea; color: white; font-size: 0.7rem; cursor: pointer;">${t.print}</button>
                                    <button class="cert-download-btn" data-specialty="${spec.id}" style="padding: 4px 12px; border: none; border-radius: 16px; background: #ffd700; color: #2c3e50; font-size: 0.7rem; cursor: pointer;">${t.download}</button>
                                </div>
                            ` : `
                                <div class="card-progress" style="height: 4px; background: #e8e8e8; border-radius: 2px; margin-top: 8px; overflow: hidden;">
                                    <div style="width: ${spec.progress}%; height: 100%; background: #667eea; border-radius: 2px;"></div>
                                </div>
                            `}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- CERTIFICATS VOLETS -->
            <div class="certificate-section" style="margin-bottom: 20px;">
                <h3 class="section-title" style="color: #2c3e50; font-size: 1.1rem; margin-bottom: 12px;">${t.folder_certificates}</h3>
                <div class="certificate-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
                    ${voletCertificates.map(volet => `
                        <div class="certificate-card ${volet.unlocked ? 'unlocked' : 'locked'}" 
                             style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid ${volet.unlocked ? '#4caf50' : '#e8e8e8'}; box-shadow: ${volet.unlocked ? '0 4px 15px rgba(76, 175, 80, 0.15)' : 'none'};">
                            <div class="card-icon" style="font-size: 2rem;">${volet.icon}</div>
                            <div class="card-name" style="font-weight: 600; color: #2c3e50; margin: 6px 0; font-size: 0.85rem;">${volet.name}</div>
                            <div class="card-status" style="font-size: 0.75rem; color: ${volet.unlocked ? '#4caf50' : '#888'};">
                                ${volet.unlocked ? '✅ ' + t.unlocked : '🔒 ' + volet.progress + '%'}
                            </div>
                            ${volet.unlocked ? `
                                <div class="card-score" style="font-size: 0.8rem; color: #667eea; font-weight: 600; margin: 4px 0;">${t.score} : ${volet.score}%</div>
                                <div class="card-actions" style="display: flex; gap: 6px; justify-content: center; margin-top: 8px;">
                                    <button class="cert-print-btn" data-volet="${volet.id}" style="padding: 4px 12px; border: none; border-radius: 16px; background: #667eea; color: white; font-size: 0.7rem; cursor: pointer;">${t.print}</button>
                                    <button class="cert-download-btn" data-volet="${volet.id}" style="padding: 4px 12px; border: none; border-radius: 16px; background: #ffd700; color: #2c3e50; font-size: 0.7rem; cursor: pointer;">${t.download}</button>
                                </div>
                            ` : `
                                <div class="card-progress" style="height: 4px; background: #e8e8e8; border-radius: 2px; margin-top: 8px; overflow: hidden;">
                                    <div style="width: ${volet.progress}%; height: 100%; background: #667eea; border-radius: 2px;"></div>
                                </div>
                            `}
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- CERTIFICAT COMPLET -->
            <div class="certificate-section full-section">
                <h3 class="section-title" style="color: #2c3e50; font-size: 1.1rem; margin-bottom: 12px;">${t.full_certificate}</h3>
                <div class="certificate-card full-card ${fullCertificate.unlocked ? 'unlocked' : 'locked'}" 
                     style="background: white; border-radius: 12px; padding: 20px; text-align: center; border: 2px solid ${fullCertificate.unlocked ? '#ffd700' : '#e8e8e8'}; box-shadow: ${fullCertificate.unlocked ? '0 4px 20px rgba(255, 215, 0, 0.2)' : 'none'}; max-width: 400px; margin: 0 auto;">
                    <div class="card-icon" style="font-size: 3rem;">${fullCertificate.unlocked ? '🌟' : '🔒'}</div>
                    <div class="card-name" style="font-weight: 700; color: #2c3e50; margin: 8px 0; font-size: 1.2rem;">${t.eteo_complete}</div>
                    <div class="card-status" style="font-size: 0.9rem; color: ${fullCertificate.unlocked ? '#4caf50' : '#888'};">
                        ${fullCertificate.unlocked ? '✅ ' + t.unlocked : '🔒 ' + t.locked}
                    </div>
                    ${fullCertificate.unlocked ? `
                        <div class="card-score" style="font-size: 1rem; color: #667eea; font-weight: 600; margin: 8px 0;">${t.global_score} : ${fullCertificate.score}%</div>
                        <div class="card-detail" style="font-size: 0.85rem; color: #888;">${fullCertificate.totalLevels}/216 ${t.levels}</div>
                        <div class="card-actions" style="display: flex; gap: 10px; justify-content: center; margin-top: 12px;">
                            <button class="cert-print-btn" id="fullCertPrintBtn" style="padding: 8px 20px; border: none; border-radius: 20px; background: #667eea; color: white; font-size: 0.85rem; cursor: pointer;">${t.print}</button>
                            <button class="cert-download-btn" id="fullCertBtn" style="padding: 8px 20px; border: none; border-radius: 20px; background: #ffd700; color: #2c3e50; font-size: 0.85rem; cursor: pointer;">${t.download}</button>
                        </div>
                    ` : `
                        <div class="card-progress" style="font-size: 0.85rem; color: #888; margin-top: 8px;">${t.unlock_full}</div>
                    `}
                </div>
            </div>
        `;

        this.attachEvents();
    }

    // ============================================================
    // MÉTHODES DE CALCUL (INCHANGÉES)
    // ============================================================

    getSpecialtyCertificates(scores) {
        const LEVELS = ['debutant1', 'debutant2', 'intermediaire1', 'intermediaire2', 'expert1', 'expert2'];
        
        return SPECIALTIES.map(spec => {
            let totalScore = 0;
            let totalLevels = 0;
            let completedLevels = 0;

            LEVELS.forEach(level => {
                let score = 0;
                const key = `${spec.id}_${level}`;
                if (scores[key] && typeof scores[key] === 'number') {
                    score = scores[key];
                }
                if (scores[spec.id] && scores[spec.id][level]) {
                    const levelData = scores[spec.id][level];
                    if (typeof levelData === 'number') {
                        score = levelData;
                    } else if (levelData.percentage) {
                        score = levelData.percentage;
                    } else if (levelData.score) {
                        score = levelData.score;
                    }
                }
                if (scores[spec.id] && scores[spec.id].score !== undefined) {
                    const examScore = scores[spec.id].score;
                    if (examScore > 0) {
                        score = examScore;
                    }
                }
                if (score > 0) {
                    totalLevels++;
                    totalScore += score;
                    if (score >= 60) {
                        completedLevels++;
                    }
                }
            });

            const hasCertificate = this.data?.certificates?.includes(spec.id) || false;
            const unlocked = (completedLevels === LEVELS.length && totalLevels > 0) || hasCertificate;
            const avgScore = totalLevels > 0 ? Math.round(totalScore / totalLevels) : 0;
            const progress = Math.round((completedLevels / LEVELS.length) * 100);

            return {
                ...spec,
                score: avgScore,
                unlocked: unlocked,
                progress: progress,
                hasCertificate: hasCertificate
            };
        });
    }

    getVoletCertificates(scores) {
        const voletMap = {};
        SPECIALTIES.forEach(spec => {
            if (!voletMap[spec.category]) {
                voletMap[spec.category] = [];
            }
            voletMap[spec.category].push(spec);
        });

        const voletLabels = {
            clinique: '🏥 Clinique',
            technique: '🔬 Technique',
            gestion: '📊 Gestion',
            rh: '👥 RH',
            sciences: '🧬 Sciences'
        };

        const voletIcons = {
            clinique: '🏥',
            technique: '🔬',
            gestion: '📊',
            rh: '👥',
            sciences: '🧬'
        };

        return Object.keys(voletMap).map(category => {
            const specialties = voletMap[category];
            const specialtyStatus = specialties.map(spec => {
                const LEVELS = ['debutant1', 'debutant2', 'intermediaire1', 'intermediaire2', 'expert1', 'expert2'];
                let totalScore = 0;
                let totalLevels = 0;
                let completedLevels = 0;

                LEVELS.forEach(level => {
                    let score = 0;
                    const key = `${spec.id}_${level}`;
                    if (scores[key] && typeof scores[key] === 'number') {
                        score = scores[key];
                    }
                    if (scores[spec.id] && scores[spec.id][level]) {
                        const levelData = scores[spec.id][level];
                        if (typeof levelData === 'number') {
                            score = levelData;
                        } else if (levelData.percentage) {
                            score = levelData.percentage;
                        } else if (levelData.score) {
                            score = levelData.score;
                        }
                    }
                    if (score > 0) {
                        totalLevels++;
                        totalScore += score;
                        if (score >= 60) completedLevels++;
                    }
                });

                const hasCertificate = this.data?.certificates?.includes(spec.id) || false;
                const isCompleted = (completedLevels === LEVELS.length && totalLevels > 0) || hasCertificate;
                const avgScore = totalLevels > 0 ? Math.round(totalScore / totalLevels) : 0;

                return {
                    ...spec,
                    completed: isCompleted,
                    avgScore: avgScore
                };
            });

            const allCompleted = specialtyStatus.every(s => s.completed);
            const avgScore = specialtyStatus.length > 0 ? 
                Math.round(specialtyStatus.reduce((sum, s) => sum + s.avgScore, 0) / specialtyStatus.length) : 0;
            const completedCount = specialtyStatus.filter(s => s.completed).length;
            const totalCount = specialtyStatus.length;
            const progress = Math.round((completedCount / totalCount) * 100);
            const unlocked = allCompleted && specialtyStatus.length > 0;

            return {
                id: category,
                name: voletLabels[category] || category,
                icon: voletIcons[category] || '📁',
                unlocked: unlocked,
                score: avgScore,
                progress: progress,
                specialties: specialtyStatus
            };
        });
    }

    getFullCertificate(scores) {
        const LEVELS = ['debutant1', 'debutant2', 'intermediaire1', 'intermediaire2', 'expert1', 'expert2'];
        let totalScore = 0;
        let totalLevels = 0;
        let completedLevels = 0;

        SPECIALTIES.forEach(spec => {
            LEVELS.forEach(level => {
                let score = 0;
                const key = `${spec.id}_${level}`;
                if (scores[key] && typeof scores[key] === 'number') {
                    score = scores[key];
                }
                if (scores[spec.id] && scores[spec.id][level]) {
                    const levelData = scores[spec.id][level];
                    if (typeof levelData === 'number') {
                        score = levelData;
                    } else if (levelData.percentage) {
                        score = levelData.percentage;
                    } else if (levelData.score) {
                        score = levelData.score;
                    }
                }
                if (score > 0) {
                    totalLevels++;
                    totalScore += score;
                    if (score >= 60) completedLevels++;
                }
            });
        });

        const totalSpecialties = SPECIALTIES.length;
        const certificatesObtained = this.data?.certificates?.length || 0;
        const unlocked = (completedLevels === 216 && totalLevels > 0) || (certificatesObtained === totalSpecialties);
        const avgScore = totalLevels > 0 ? Math.round(totalScore / totalLevels) : 0;

        return {
            unlocked: unlocked,
            score: avgScore,
            totalLevels: totalLevels,
            completedLevels: completedLevels
        };
    }

    // ============================================================
    // ÉVÉNEMENTS
    // ============================================================

    attachEvents() {
        document.querySelectorAll('.cert-print-btn[data-specialty]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const specialtyId = btn.dataset.specialty;
                await this.printSpecialtyCertificate(specialtyId);
            });
        });

        document.querySelectorAll('.cert-download-btn[data-specialty]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const specialtyId = btn.dataset.specialty;
                await this.downloadSpecialtyCertificate(specialtyId);
            });
        });

        document.querySelectorAll('.cert-print-btn[data-volet]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const voletId = btn.dataset.volet;
                await this.printVoletCertificate(voletId);
            });
        });

        document.querySelectorAll('.cert-download-btn[data-volet]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const voletId = btn.dataset.volet;
                await this.downloadVoletCertificate(voletId);
            });
        });

        const fullPrintBtn = document.getElementById('fullCertPrintBtn');
        if (fullPrintBtn) {
            fullPrintBtn.addEventListener('click', async () => {
                await this.printFullCertificate();
            });
        }

        const fullBtn = document.getElementById('fullCertBtn');
        if (fullBtn) {
            fullBtn.addEventListener('click', async () => {
                await this.downloadFullCertificate();
            });
        }
    }

    // ============================================================
    // TÉLÉCHARGEMENT AVEC TRADUCTIONS
    // ============================================================

    async downloadSpecialtyCertificate(specialtyId) {
        try {
            const specialty = SPECIALTIES.find(s => s.id === specialtyId);
            if (!specialty) {
                if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.specialty_not_found') || 'Specialty not found'), 3000);
                return;
            }

            const scores = this.data.quizScores || this.data.scores || {};
            const LEVELS = ['debutant1', 'debutant2', 'intermediaire1', 'intermediaire2', 'expert1', 'expert2'];
            let totalScore = 0;
            let totalLevels = 0;

            LEVELS.forEach(level => {
                let score = 0;
                const key = `${specialtyId}_${level}`;
                if (scores[key] && typeof scores[key] === 'number') {
                    score = scores[key];
                }
                if (scores[specialtyId] && scores[specialtyId][level]) {
                    const levelData = scores[specialtyId][level];
                    if (typeof levelData === 'number') {
                        score = levelData;
                    } else if (levelData.percentage) {
                        score = levelData.percentage;
                    } else if (levelData.score) {
                        score = levelData.score;
                    }
                }
                if (score > 0) {
                    totalLevels++;
                    totalScore += score;
                }
            });

            const hasCertificate = this.data?.certificates?.includes(specialtyId) || false;
            if (totalLevels < LEVELS.length && !hasCertificate) {
                if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.levels_required') || 'All levels must be completed'), 3000);
                return;
            }

            const avgScore = totalLevels > 0 ? Math.round(totalScore / totalLevels) : 0;
            const certDetails = this.data?.certificateDetails?.[specialtyId];
            const finalScore = certDetails?.score || avgScore;

            const certificate = await this.certificateService.generateSpecialtyCertificate(
                this.uid,
                specialtyId,
                finalScore,
                specialty.name
            );

            await this.certificateService.downloadCertificate(certificate, 'pdf');

            if (this.showToast) {
                this.showToast('✅ ' + (this.translate.get('certificates.download_success') || 'Certificate downloaded!'), 3000);
            }

        } catch (error) {
            console.error('❌ Erreur téléchargement certificat spécialité:', error);
            if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.download_error') || 'Download error'), 3000);
        }
    }

    async downloadVoletCertificate(voletId) {
        try {
            const voletCertificates = this.getVoletCertificates(this.data.quizScores || this.data.scores || {});
            const volet = voletCertificates.find(v => v.id === voletId);

            if (!volet || !volet.unlocked) {
                if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.folder_not_completed') || 'Folder not completed'), 3000);
                return;
            }

            const certificate = await this.certificateService.generateVoletCertificate(
                this.uid,
                volet.name,
                volet.specialties.map(s => s.name),
                volet.score
            );

            await this.certificateService.downloadCertificate(certificate, 'pdf');

            if (this.showToast) {
                this.showToast('✅ ' + (this.translate.get('certificates.download_success') || 'Certificate downloaded!'), 3000);
            }

        } catch (error) {
            console.error('❌ Erreur téléchargement certificat volet:', error);
            if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.download_error') || 'Download error'), 3000);
        }
    }

    async downloadFullCertificate() {
        try {
            const fullCert = this.getFullCertificate(this.data.quizScores || this.data.scores || {});
            if (!fullCert.unlocked) {
                if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.full_not_available') || 'Full certificate not available'), 3000);
                return;
            }

            const certificate = await this.certificateService.generateFullCertificate(
                this.uid,
                fullCert.score,
                fullCert.totalLevels
            );

            await this.certificateService.downloadCertificate(certificate, 'pdf');

            if (this.showToast) {
                this.showToast('✅ ' + (this.translate.get('certificates.download_success') || 'Certificate downloaded!'), 3000);
            }

        } catch (error) {
            console.error('❌ Erreur téléchargement certificat complet:', error);
            if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.download_error') || 'Download error'), 3000);
        }
    }

    // ============================================================
    // IMPRESSION AVEC TRADUCTIONS
    // ============================================================

    async printSpecialtyCertificate(specialtyId) {
        try {
            const specialty = SPECIALTIES.find(s => s.id === specialtyId);
            if (!specialty) {
                if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.specialty_not_found') || 'Specialty not found'), 3000);
                return;
            }

            const scores = this.data.quizScores || this.data.scores || {};
            const LEVELS = ['debutant1', 'debutant2', 'intermediaire1', 'intermediaire2', 'expert1', 'expert2'];
            let totalScore = 0;
            let totalLevels = 0;

            LEVELS.forEach(level => {
                let score = 0;
                const key = `${specialtyId}_${level}`;
                if (scores[key] && typeof scores[key] === 'number') {
                    score = scores[key];
                }
                if (scores[specialtyId] && scores[specialtyId][level]) {
                    const levelData = scores[specialtyId][level];
                    if (typeof levelData === 'number') {
                        score = levelData;
                    } else if (levelData.percentage) {
                        score = levelData.percentage;
                    } else if (levelData.score) {
                        score = levelData.score;
                    }
                }
                if (score > 0) {
                    totalLevels++;
                    totalScore += score;
                }
            });

            const hasCertificate = this.data?.certificates?.includes(specialtyId) || false;
            if (totalLevels < LEVELS.length && !hasCertificate) {
                if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.levels_required') || 'All levels must be completed'), 3000);
                return;
            }

            const avgScore = totalLevels > 0 ? Math.round(totalScore / totalLevels) : 0;
            const certDetails = this.data?.certificateDetails?.[specialtyId];
            const finalScore = certDetails?.score || avgScore;

            const certificate = {
                type: 'specialty',
                specialty: specialty.name,
                score: finalScore,
                totalLevels: totalLevels,
                userName: this.data.displayName || this.data.fullName || 'Doctor',
                date: new Date().toISOString()
            };

            await this.printService.printCertificate(certificate);
            if (this.showToast) this.showToast('🖨️ ' + (this.translate.get('certificates.print_started') || 'Print started!'), 2000);

        } catch (error) {
            console.error('❌ Erreur impression certificat spécialité:', error);
            if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.print_error') || 'Print error'), 3000);
        }
    }

    async printVoletCertificate(voletId) {
        try {
            const voletCertificates = this.getVoletCertificates(this.data.quizScores || this.data.scores || {});
            const volet = voletCertificates.find(v => v.id === voletId);

            if (!volet || !volet.unlocked) {
                if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.folder_not_completed') || 'Folder not completed'), 3000);
                return;
            }

            const certificate = {
                type: 'volet',
                volet: volet.name,
                score: volet.score,
                specialties: volet.specialties.map(s => s.name),
                userName: this.data.displayName || this.data.fullName || 'Doctor',
                date: new Date().toISOString()
            };

            await this.printService.printCertificate(certificate);
            if (this.showToast) this.showToast('🖨️ ' + (this.translate.get('certificates.print_started') || 'Print started!'), 2000);

        } catch (error) {
            console.error('❌ Erreur impression certificat volet:', error);
            if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.print_error') || 'Print error'), 3000);
        }
    }

    async printFullCertificate() {
        try {
            const fullCert = this.getFullCertificate(this.data.quizScores || this.data.scores || {});
            if (!fullCert.unlocked) {
                if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.full_not_available') || 'Full certificate not available'), 3000);
                return;
            }

            const certificate = {
                type: 'full',
                score: fullCert.score,
                totalLevels: fullCert.totalLevels,
                userName: this.data.displayName || this.data.fullName || 'Doctor',
                date: new Date().toISOString()
            };

            await this.printService.printCertificate(certificate);
            if (this.showToast) this.showToast('🖨️ ' + (this.translate.get('certificates.print_started') || 'Print started!'), 2000);

        } catch (error) {
            console.error('❌ Erreur impression certificat complet:', error);
            if (this.showToast) this.showToast('❌ ' + (this.translate.get('certificates.print_error') || 'Print error'), 3000);
        }
    }
}

export default CertificateManager;