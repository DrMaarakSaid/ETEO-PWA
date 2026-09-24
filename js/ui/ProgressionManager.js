// ============================================================
// PROGRESSION MANAGER - Affichage de la progression utilisateur
// VERSION CORRIGÉE - Avec intégration du système de traduction
// ============================================================

import { ProgressionService } from '../services/progressionService.js';
import { TranslateService } from '../services/translate.js';
import { SPECIALTIES, LEVELS } from '../config.js';

export class ProgressionManager {
    
    constructor(progressionService, showToast) {
        this.progressionService = progressionService;
        this.showToast = showToast;
        this.data = null;
        this.uid = null;
        this.translator = new TranslateService(); // ✅ Service de traduction
        this.translationsLoaded = false;
    }

    // ============================================================
    // CHARGER LES TRADUCTIONS
    // ============================================================
    
    async loadTranslations() {
        if (this.translationsLoaded) return;
        
        try {
            // ✅ Utiliser la langue de la page HTML, pas localStorage
            const lang = document.documentElement.lang || 'fr';
            await this.translator.loadLanguage(lang);
            this.translationsLoaded = true;
            console.log(`✅ Traductions chargées pour: ${lang} (depuis la page)`);
        } catch (error) {
            console.error('❌ Erreur chargement traductions:', error);
            // Fallback vers le français
            await this.translator.loadLanguage('fr');
            this.translationsLoaded = true;
        }
    }

    // ============================================================
    // MÉTHODES PUBLIQUES
    // ============================================================

    async loadProgression(container, uid) {
        if (!container) {
            console.error('❌ Conteneur progression non trouvé');
            return;
        }

        this.container = container;
        this.uid = uid;

        // ✅ CHARGER LES TRADUCTIONS AVANT TOUT
        await this.loadTranslations();

        this.showLoading();

        try {
            this.data = await this.progressionService.getUserProgression(uid);
            this.render();
        } catch (error) {
            console.error('❌ Erreur chargement progression:', error);
            if (this.showToast) {
                const errorMsg = this.translator.get('errors.load_failed');
                this.showToast(`❌ ${errorMsg}`, 3000);
            }
            this.showError();
        }
    }

    // ============================================================
    // MÉTHODES DE RENDU
    // ============================================================

    showLoading() {
        const t = this.translator;
        if (this.container) {
            this.container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 3rem;">📊</div>
                    <div style="font-size: 1.2rem; margin-top: 20px;">${t.get('common.loading')}</div>
                    <div style="margin-top: 10px; color: #888;">${t.get('common.please_wait') || 'Veuillez patienter'}</div>
                </div>
            `;
        }
    }

    showError() {
        const t = this.translator;
        if (this.container) {
            this.container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 3rem;">⚠️</div>
                    <div style="font-size: 1.2rem; margin-top: 20px;">${t.get('errors.load_failed')}</div>
                    <div style="margin-top: 10px; color: #888;">${t.get('errors.load_failed')}</div>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 30px; border: none; border-radius: 30px; background: #667eea; color: white; cursor: pointer; font-weight: 600;">
                        🔄 ${t.get('buttons.retry')}
                    </button>
                </div>
            `;
        }
    }

    // ============================================================
    // REND LA PROGRESSION COMPLÈTE (QUIZ + ROULETTE)
    // ============================================================

    render() {
        if (!this.container || !this.data) return;

        const t = this.translator;
        const { quizScores, totalLevels, avgScore, globalScore, badges, certificates } = this.data;
        
        // ✅ Récupérer les statistiques de la Roulette
        const rouletteStats = this.data.rouletteStats || { 
            total: 0, 
            success: 0, 
            successRate: 0, 
            bestSpecialty: t.get('roulette.stats.best_specialty'), 
            bestSpecialtyRate: 0, 
            specialtyStats: {} 
        };
        
        // Calculer les statistiques des QUIZ
        const stats = this.progressionService.calculateStats(quizScores);
        const completionRate = stats.completionRate || 0;
        const completedLevels = stats.completedLevels || 0;

        // ✅ RENDU COMPLET AVEC TRADUCTIONS
        this.container.innerHTML = `
            <!-- ========================================================== -->
            <!-- STATISTIQUES DES QUIZ (cases vertes) -->
            <!-- ========================================================== -->
            <div style="background: #f8faff; border-radius: 16px; padding: 16px; margin-bottom: 16px; border: 1px solid #e0e8f5;">
                <h3 style="color: #2c3e50; font-size: 1rem; margin-bottom: 10px;">📚 ${t.get('progression.title')}</h3>
                
                <div class="progression-stats">
                    <div class="stat-item">
                        <span class="number">${stats.totalLevels || 0}</span>
                        <span class="label">📚 ${t.get('progression.levels') || 'Niveaux'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="number">${completedLevels || 0}/216</span>
                        <span class="label">✅ ${t.get('progression.status.completed') || 'Niveaux validés'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="number">${stats.avgScore || 0}%</span>
                        <span class="label">🎯 ${t.get('statistics.average_score') || 'Score moyen'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="number">${stats.globalScore || 0}%</span>
                        <span class="label">🏆 ${t.get('statistics.score') || 'Score global'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="number">${badges?.length || 0}</span>
                        <span class="label">🏅 ${t.get('profile.badges_unlocked').replace('{count}', '') || 'Badges'}</span>
                    </div>
                    <div class="stat-item">
                        <span class="number">${certificates?.length || 0}</span>
                        <span class="label">📜 ${t.get('certificates.title') || 'Certificats'}</span>
                    </div>
                </div>

                <!-- BARRE DE PROGRESSION GLOBALE -->
                <div class="progression-global-bar">
                    <div class="progress-header">
                        <span class="title">📊 ${t.get('statistics.global_progress') || 'Progression globale'}</span>
                        <span class="percent">${completionRate}%</span>
                    </div>
                    <div class="progress-track">
                        <div class="progress-fill" style="width: ${Math.min(completionRate, 100)}%;"></div>
                    </div>
                    <div class="progress-details">
                        <span>${completedLevels} ${t.get('progression.status.completed') || 'niveaux validés'} sur 216</span>
                        <span>${Math.round((completedLevels / 216) * 100)}%</span>
                    </div>
                </div>

                <!-- TABLEAU DES SPÉCIALITÉS -->
                <div class="progression-table-container" style="margin-top: 12px;">
                    <table class="progression-table">
                        <thead>
                            <tr>
                                <th class="volet-col">${t.get('progression.overview') || 'VOLET'}</th>
                                <th class="spec-col">${t.get('statistics.total_specialties') || 'SPÉCIALITÉ'}</th>
                                <th>D1</th>
                                <th>D2</th>
                                <th>I1</th>
                                <th>I2</th>
                                <th>E1</th>
                                <th>E2</th>
                                <th>${t.get('quiz.examen') || 'EXAMEN'}</th>
                                <th>${t.get('certificates.title') || 'CERT'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderSpecialties(quizScores || {})}
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- ========================================================== -->
            <!-- SECTION ROULETTE DE L'INFO (STATS SÉPARÉES) -->
            <!-- ========================================================== -->
            <div class="roulette-section" style="background: #fff8f0; border-radius: 16px; padding: 16px; border: 1px solid #ffd699;">
                <h3 style="color: #2c3e50; font-size: 1rem; margin-bottom: 10px;">🎰 ${t.get('roulette.title')} - ${t.get('statistics.title')}</h3>
                
                <div class="roulette-stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    <div class="roulette-stat-item" style="background: white; border-radius: 12px; padding: 12px 10px; text-align: center; border: 1px solid #e8e8e8;">
                        <span class="number" style="font-size: 1.5rem; font-weight: 800; color: #2c3e50;">${rouletteStats.total || 0}</span>
                        <span class="label" style="font-size: 0.7rem; color: #888; display: block; margin-top: 4px;">${t.get('roulette.stats.total_quizzes')}</span>
                    </div>
                    <div class="roulette-stat-item" style="background: white; border-radius: 12px; padding: 12px 10px; text-align: center; border: 1px solid #e8e8e8;">
                        <span class="number" style="font-size: 1.5rem; font-weight: 800; color: #2c3e50;">${rouletteStats.successRate || 0}%</span>
                        <span class="label" style="font-size: 0.7rem; color: #888; display: block; margin-top: 4px;">${t.get('roulette.stats.success_rate')}</span>
                    </div>
                    <div class="roulette-stat-item" style="background: white; border-radius: 12px; padding: 12px 10px; text-align: center; border: 1px solid #e8e8e8;">
                        <span class="number" style="font-size: 1.5rem; font-weight: 800; color: #2c3e50;">${rouletteStats.success || 0}/${rouletteStats.total || 0}</span>
                        <span class="label" style="font-size: 0.7rem; color: #888; display: block; margin-top: 4px;">${t.get('roulette.stats.correct_answers')}</span>
                    </div>
                    <div class="roulette-stat-item" style="background: white; border-radius: 12px; padding: 12px 10px; text-align: center; border: 1px solid #e8e8e8;">
                        <span class="number" style="font-size: 0.9rem; font-weight: 800; color: #2c3e50;">${rouletteStats.bestSpecialty || t.get('roulette.stats.best_specialty')} ${rouletteStats.bestSpecialtyRate > 0 ? `(${rouletteStats.bestSpecialtyRate}%)` : ''}</span>
                        <span class="label" style="font-size: 0.7rem; color: #888; display: block; margin-top: 4px;">${t.get('roulette.stats.best_specialty')}</span>
                    </div>
                </div>
                
                <!-- Détail par spécialité (si plus de 2 quiz) -->
                ${rouletteStats.total >= 2 ? `
                    <div style="margin-top: 10px; font-size: 0.8rem; color: #666;">
                        <div style="font-weight: 600; margin-bottom: 4px;">📊 ${t.get('statistics.scores_by_category')} :</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                            ${Object.entries(rouletteStats.specialtyStats || {}).map(([spec, stats]) => `
                                <span style="background: white; padding: 3px 12px; border-radius: 16px; border: 1px solid #e0e0e0; font-size: 0.75rem;">
                                    ${spec} : ${stats.success}/${stats.total} (${Math.round((stats.success/stats.total)*100)}%)
                                </span>
                            `).join('')}
                        </div>
                    </div>
                ` : `
                    <div style="margin-top: 8px; font-size: 0.8rem; color: #999; text-align: center;">
                        ${t.get('roulette.stats.message')}
                    </div>
                `}
            </div>
        `;
    }

    // ============================================================
    // REND LES SPÉCIALITÉS DANS LE TABLEAU
    // ============================================================

    renderSpecialties(scores) {
        const groupedSpecialties = this.groupSpecialtiesByCategory();
        let html = '';

        for (const [category, specialties] of Object.entries(groupedSpecialties)) {
            let isFirst = true;
            const categoryName = this.getCategoryLabel(category);

            for (const spec of specialties) {
                const status = this.progressionService.getSpecialtyStatus(scores, spec.id, LEVELS);
                const allCompleted = status.every(s => s.completed);

                html += `
                    <tr>
                        ${isFirst ? `<td class="volet-name" rowspan="${specialties.length}">${categoryName}</td>` : ''}
                        <td class="spec-name">${spec.emoji} ${spec.name}</td>
                        ${status.map(level => `
                            <td>
                                <span class="level-status ${this.getLevelStatusClass(level)}">
                                    ${this.getLevelStatusIcon(level)}
                                </span>
                            </td>
                        `).join('')}
                        <td>
                            ${this.renderExamenButton(spec.id, allCompleted)}
                        </td>
                        <td>
                            ${this.renderCertificateButton(spec.id, allCompleted)}
                        </td>
                    </tr>
                `;

                isFirst = false;
            }
        }

        return html;
    }

    // ============================================================
    // MÉTHODES UTILITAIRES
    // ============================================================

    groupSpecialtiesByCategory() {
        const grouped = {};
        for (const spec of SPECIALTIES) {
            if (!grouped[spec.category]) {
                grouped[spec.category] = [];
            }
            grouped[spec.category].push(spec);
        }
        return grouped;
    }

    getCategoryLabel(category) {
        const labels = {
            'clinique': '🏥 Clinique',
            'technique': '🔬 Technique',
            'gestion': '📊 Gestion',
            'rh': '👥 RH',
            'sciences': '🧬 Sciences'
        };
        return labels[category] || category;
    }

    getLevelStatusClass(level) {
        if (level.completed) return 'completed';
        if (level.locked) return 'locked';
        return 'pending';
    }

    getLevelStatusIcon(level) {
        if (level.completed) return '✅';
        if (level.locked) return '🔒';
        return '☐';
    }

    renderExamenButton(specialtyId, allCompleted) {
        const t = this.translator;
        if (allCompleted) {
            return `<button class="examen-btn available" onclick="window.location.href='roulette_certificat.html?specialty=${specialtyId}'">📝</button>`;
        }
        return `<button class="examen-btn disabled" disabled>🔒</button>`;
    }

    renderCertificateButton(specialtyId, allCompleted) {
        const t = this.translator;
        if (allCompleted) {
            return `<button class="certificate-btn gold" onclick="alert('📜 ${t.get('certificates.title')} pour "${specialtyId}"')">🏅</button>`;
        }
        return `<button class="certificate-btn disabled" disabled>🔒</button>`;
    }
}

export default ProgressionManager;