// ============================================================
// CLASSEMENT MANAGER - Affichage du classement mondial (iOS)
// VERSION CORRIGÉE - Avec intégration du système de traduction
// ============================================================

import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { TranslateService } from '../services/translate.js';

export class ClassementManager {
    
    /**
     * @param {RankingService} rankingService - Service de classement
     * @param {Function} showToast - Fonction d'affichage des notifications
     */
    constructor(rankingService, showToast) {
        this.rankingService = rankingService;
        this.showToast = showToast;
        this.db = getFirestore();
        this.currentPage = 1;
        this.pageSize = 20;
        this.users = [];
        this.filteredUsers = [];
        this.searchTerm = '';
        this.totalUsers = 0;
        this.currentUid = null;
        this.container = null;
        this.translator = new TranslateService();
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
            await this.translator.loadLanguage('fr');
            this.translationsLoaded = true;
        }
    }

    // ============================================================
    // MÉTHODES PUBLIQUES
    // ============================================================

    /**
     * Charge et affiche le classement
     * @param {HTMLElement} container - Conteneur HTML
     */
    async loadRanking(container) {
        if (!container) {
            console.error('❌ Conteneur classement non trouvé');
            return;
        }

        this.container = container;
        
        // ✅ CHARGER LES TRADUCTIONS AVANT TOUT
        await this.loadTranslations();
        
        this.showLoading();

        try {
            // ✅ iOS : users_ios
            const usersRef = collection(this.db, 'users_ios');
            const snapshot = await getDocs(usersRef);
            
            this.users = [];
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                // ✅ displayName pour iOS (avec fallback)
                const fullName = data.displayName || data.fullName || 'Anonyme';
                const score = data.globalScore || 0;
                const totalLevels = data.totalLevels || 0;
                const country = data.country || 'Non renseigné';
                const badges = data.badges || [];
                
                // Calcul du rang
                const rank = this.users.length + 1;
                
                this.users.push({
                    uid: doc.id,
                    fullName: fullName,
                    country: country,
                    score: score,
                    totalLevels: totalLevels,
                    badges: badges,
                    rank: rank,
                    medal: this.getMedal(rank)
                });
            });
            
            // Trier par score (décroissant)
            this.users.sort((a, b) => b.score - a.score);
            
            // Recalculer les rangs après tri
            this.users.forEach((user, index) => {
                user.rank = index + 1;
                user.medal = this.getMedal(user.rank);
            });
            
            this.filteredUsers = [...this.users];
            this.totalUsers = this.users.length;

            // Afficher
            this.render();
            this.setupEventListeners();

            // ✅ AFFICHER LES TOP PAYS
            await this.renderTopCountries();
            await this.renderTopCountriesByTopUsers();

        } catch (error) {
            console.error('❌ Erreur chargement classement:', error);
            if (this.showToast) {
                const errorMsg = this.translator.get('ranking.error_load') || 'Erreur de chargement du classement';
                this.showToast('❌ ' + errorMsg, 3000);
            }
            this.showError();
        }
    }

    /**
     * Filtre le classement par recherche
     * @param {string} searchTerm - Terme de recherche
     */
    filter(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase().trim();
        
        if (!this.searchTerm) {
            this.filteredUsers = [...this.users];
        } else {
            this.filteredUsers = this.users.filter(user =>
                user.fullName.toLowerCase().includes(this.searchTerm) ||
                user.country.toLowerCase().includes(this.searchTerm) ||
                user.uid.includes(this.searchTerm)
            );
        }
        
        this.currentPage = 1;
        this.renderTable();
        this.updatePagination();
    }

    /**
     * Change de page
     * @param {number} page - Numéro de page
     */
    goToPage(page) {
        const totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;
        this.renderTable();
        this.updatePagination();
    }

    /**
     * Définit l'UID de l'utilisateur courant
     * @param {string} uid 
     */
    setCurrentUser(uid) {
        this.currentUid = uid;
        this.render();
    }

    // ============================================================
    // MÉTHODES DE RENDU
    // ============================================================

    showLoading() {
        const t = this.translator;
        if (this.container) {
            this.container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px;">
                    <div style="font-size: 3rem;">🏆</div>
                    <div style="font-size: 1.2rem; margin-top: 20px;">${t.get('ranking.loading') || 'Chargement du classement...'}</div>
                    <div style="margin-top: 10px; color: #888;">${t.get('ranking.please_wait') || 'Veuillez patienter'}</div>
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
                    <div style="font-size: 1.2rem; margin-top: 20px;">${t.get('ranking.error_load') || 'Erreur de chargement'}</div>
                    <div style="margin-top: 10px; color: #888;">${t.get('ranking.error_message') || 'Impossible de charger le classement'}</div>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 30px; border: none; border-radius: 30px; background: #667eea; color: white; cursor: pointer; font-weight: 600;">
                        ${t.get('ranking.retry') || '🔄 Réessayer'}
                    </button>
                </div>
            `;
        }
    }

    render() {
        if (!this.container) return;

        const t = this.translator;
        const totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageUsers = this.filteredUsers.slice(start, end);

        this.container.innerHTML = `
            <!-- STATISTIQUES -->
            <div class="ranking-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
                <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e8e8e8;">
                    <span style="font-size: 1.5rem; font-weight: 800; color: #2c3e50;">${this.totalUsers}</span>
                    <span style="font-size: 0.8rem; color: #888; display: block; margin-top: 4px;">${t.get('ranking.users') || '👥 Utilisateurs'}</span>
                </div>
                <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e8e8e8;">
                    <span style="font-size: 1.5rem; font-weight: 800; color: #2c3e50;">${this.users.length}</span>
                    <span style="font-size: 0.8rem; color: #888; display: block; margin-top: 4px;">${t.get('ranking.ranked') || '🏅 Classés'}</span>
                </div>
                <div style="background: white; border-radius: 12px; padding: 16px; text-align: center; border: 1px solid #e8e8e8;">
                    <span style="font-size: 1.5rem; font-weight: 800; color: #2c3e50;">${this.filteredUsers.length}</span>
                    <span style="font-size: 0.8rem; color: #888; display: block; margin-top: 4px;">${t.get('ranking.displayed') || '🔍 Affichés'}</span>
                </div>
            </div>

            <!-- RECHERCHE -->
            <div style="margin-bottom: 15px;">
                <input type="text" id="rankingSearchInput" placeholder="${t.get('ranking.search_placeholder') || '🔍 Rechercher un utilisateur...'}" 
                       style="width: 100%; padding: 12px 16px; border: 2px solid #e0e0e0; border-radius: 30px; font-size: 1rem; outline: none; transition: border-color 0.3s;">
            </div>

            <!-- TABLEAU -->
            <div style="overflow-x: auto; margin-bottom: 20px;">
                <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem;">
                    <thead>
                        <tr style="background: #f8f9fa; border-bottom: 2px solid #e0e0e0;">
                            <th style="padding: 12px 8px; text-align: left; width: 50px;">#</th>
                            <th style="padding: 12px 8px; text-align: left; width: 50px;">🏅</th>
                            <th style="padding: 12px 8px; text-align: left;">${t.get('ranking.user') || 'Utilisateur'}</th>
                            <th style="padding: 12px 8px; text-align: left;">${t.get('ranking.country') || 'Pays'}</th>
                            <th style="padding: 12px 8px; text-align: center;">${t.get('ranking.levels') || 'Niveaux'}</th>
                            <th style="padding: 12px 8px; text-align: center;">${t.get('ranking.score') || 'Score'}</th>
                            <th style="padding: 12px 8px; text-align: center;">${t.get('ranking.badges') || 'Badges'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageUsers.length === 0 ? `
                            <tr>
                                <td colspan="7" style="text-align: center; padding: 40px; color: #888;">
                                    ${this.searchTerm ? (t.get('ranking.no_user_found') || '🔍 Aucun utilisateur trouvé') : (t.get('ranking.no_users') || '🏆 Aucun utilisateur')}
                                </td>
                            </tr>
                        ` : pageUsers.map(user => `
                            <tr style="${user.uid === this.currentUid ? 'background: #e8f0fe;' : ''} border-bottom: 1px solid #f0f0f0;">
                                <td style="padding: 10px 8px;">#${user.rank}</td>
                                <td style="padding: 10px 8px;">${user.medal || ''}</td>
                                <td style="padding: 10px 8px; font-weight: ${user.uid === this.currentUid ? '700' : '400'};">
                                    ${user.fullName}
                                    ${user.uid === this.currentUid ? ' <span style="background: #667eea; color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600;">' + (t.get('ranking.you') || '👤 Vous') + '</span>' : ''}
                                </td>
                                <td style="padding: 10px 8px;">${user.country}</td>
                                <td style="padding: 10px 8px; text-align: center;">${user.totalLevels}/216</td>
                                <td style="padding: 10px 8px; text-align: center;">
                                    <span style="font-weight: 700; color: ${user.score >= 80 ? '#4caf50' : user.score >= 50 ? '#ff9800' : '#e74c3c'}">
                                        ${user.score}%
                                    </span>
                                </td>
                                <td style="padding: 10px 8px; text-align: center;">
                                    ${user.badges.length > 0 ? '🏅 ' + user.badges.length : '—'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <!-- PAGINATION -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
                <button id="prevPage" class="pagination-btn" style="padding: 8px 20px; border: 1px solid #ddd; border-radius: 20px; background: white; cursor: pointer; font-weight: 600; ${this.currentPage <= 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                    ${t.get('ranking.previous') || '← Précédent'}
                </button>
                <span style="color: #888; font-size: 0.9rem;">
                    ${(t.get('ranking.page') || 'Page {current} sur {total}').replace('{current}', this.currentPage).replace('{total}', totalPages || 1)}
                </span>
                <button id="nextPage" class="pagination-btn" style="padding: 8px 20px; border: 1px solid #ddd; border-radius: 20px; background: white; cursor: pointer; font-weight: 600; ${this.currentPage >= totalPages || totalPages === 0 ? 'opacity: 0.5; cursor: not-allowed;' : ''}">
                    ${t.get('ranking.next') || 'Suivant →'}
                </button>
            </div>
        `;

        this.attachEvents();
    }

    renderTable() {
        const t = this.translator;
        const totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        const pageUsers = this.filteredUsers.slice(start, end);

        const tbody = this.container.querySelector('tbody');
        if (!tbody) return;

        tbody.innerHTML = pageUsers.length === 0 ? `
            <tr>
                <td colspan="7" style="text-align: center; padding: 40px; color: #888;">
                    ${this.searchTerm ? (t.get('ranking.no_user_found') || '🔍 Aucun utilisateur trouvé') : (t.get('ranking.no_users') || '🏆 Aucun utilisateur')}
                </td>
            </tr>
        ` : pageUsers.map(user => `
            <tr style="${user.uid === this.currentUid ? 'background: #e8f0fe;' : ''} border-bottom: 1px solid #f0f0f0;">
                <td style="padding: 10px 8px;">#${user.rank}</td>
                <td style="padding: 10px 8px;">${user.medal || ''}</td>
                <td style="padding: 10px 8px; font-weight: ${user.uid === this.currentUid ? '700' : '400'};">
                    ${user.fullName}
                    ${user.uid === this.currentUid ? ' <span style="background: #667eea; color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600;">' + (t.get('ranking.you') || '👤 Vous') + '</span>' : ''}
                </td>
                <td style="padding: 10px 8px;">${user.country}</td>
                <td style="padding: 10px 8px; text-align: center;">${user.totalLevels}/216</td>
                <td style="padding: 10px 8px; text-align: center;">
                    <span style="font-weight: 700; color: ${user.score >= 80 ? '#4caf50' : user.score >= 50 ? '#ff9800' : '#e74c3c'}">
                        ${user.score}%
                    </span>
                </td>
                <td style="padding: 10px 8px; text-align: center;">
                    ${user.badges.length > 0 ? '🏅 ' + user.badges.length : '—'}
                </td>
            </tr>
        `).join('');
    }

    updatePagination() {
        const t = this.translator;
        const totalPages = Math.ceil(this.filteredUsers.length / this.pageSize);
        const info = this.container.querySelector('span[style*="color: #888; font-size: 0.9rem;"]');
        const prevBtn = this.container.querySelector('#prevPage');
        const nextBtn = this.container.querySelector('#nextPage');

        if (info) {
            info.textContent = (t.get('ranking.page') || 'Page {current} sur {total}').replace('{current}', this.currentPage).replace('{total}', totalPages || 1);
        }
        if (prevBtn) {
            prevBtn.style.opacity = this.currentPage <= 1 ? '0.5' : '1';
            prevBtn.style.cursor = this.currentPage <= 1 ? 'not-allowed' : 'pointer';
        }
        if (nextBtn) {
            nextBtn.style.opacity = this.currentPage >= totalPages || totalPages === 0 ? '0.5' : '1';
            nextBtn.style.cursor = this.currentPage >= totalPages || totalPages === 0 ? 'not-allowed' : 'pointer';
        }
    }

    // ============================================================
    // TOP PAYS
    // ============================================================

    async renderTopCountries() {
        const t = this.translator;
        const container = document.getElementById('topCountriesContainer');
        if (!container) return;

        try {
            // ✅ iOS : users_ios
            const usersRef = collection(this.db, 'users_ios');
            const snapshot = await getDocs(usersRef);
            
            const countryMap = new Map();
            snapshot.forEach((doc) => {
                const data = doc.data();
                const country = data.country || 'Non renseigné';
                if (countryMap.has(country)) {
                    countryMap.set(country, countryMap.get(country) + 1);
                } else {
                    countryMap.set(country, 1);
                }
            });

            const topCountries = Array.from(countryMap.entries())
                .map(([country, count]) => ({ country, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            if (topCountries.length === 0) {
                container.innerHTML = `<div style="text-align: center; padding: 20px; color: #888;">${t.get('ranking.top_countries_empty') || '🌍 Aucun pays enregistré'}</div>`;
                return;
            }

            const medals = ['🥇', '🥈', '🥉'];
            container.innerHTML = `
                <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e8e8e8; margin-top: 20px;">
                    <h3 style="color: #2c3e50; margin: 0 0 10px 0;">${t.get('ranking.top_countries_title') || '🌍 Top 10 des pays'}</h3>
                    ${topCountries.map((item, index) => `
                        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f5;">
                            <span>${medals[index] || `#${index + 1}`} <strong>${item.country}</strong></span>
                            <span style="color: #888;">${item.count} ${t.get('ranking.users')?.replace('👥 ', '') || 'utilisateur' + (item.count > 1 ? 's' : '')}</span>
                        </div>
                    `).join('')}
                </div>
            `;

        } catch (error) {
            console.error('❌ Erreur renderTopCountries:', error);
            container.innerHTML = `<div style="text-align: center; padding: 20px; color: #888;">${t.get('ranking.top_countries_error') || '⚠️ Erreur de chargement'}</div>`;
        }
    }

    async renderTopCountriesByTopUsers() {
        const t = this.translator;
        const container = document.getElementById('topCountriesMonthContainer');
        if (!container) return;

        try {
            // ✅ iOS : users_ios
            const usersRef = collection(this.db, 'users_ios');
            const snapshot = await getDocs(usersRef);
            
            const users = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                users.push({
                    country: data.country || 'Non renseigné',
                    score: data.globalScore || 0
                });
            });

            users.sort((a, b) => b.score - a.score);
            const top10 = users.slice(0, 10);

            const countryMap = new Map();
            top10.forEach((user) => {
                const country = user.country;
                if (countryMap.has(country)) {
                    countryMap.set(country, countryMap.get(country) + 1);
                } else {
                    countryMap.set(country, 1);
                }
            });

            const topCountries = Array.from(countryMap.entries())
                .map(([country, count]) => ({ country, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);

            if (topCountries.length === 0) {
                container.innerHTML = `<div style="text-align: center; padding: 20px; color: #888;">${t.get('ranking.top_countries_month_empty') || '🏆 Aucun pays enregistré'}</div>`;
                return;
            }

            const medals = ['🥇', '🥈', '🥉'];
            container.innerHTML = `
                <div style="background: white; border-radius: 12px; padding: 16px; border: 1px solid #e8e8e8; margin-top: 20px;">
                    <h3 style="color: #2c3e50; margin: 0 0 5px 0;">${t.get('ranking.top_countries_month_title') || '🏆 Top pays du mois'}</h3>
                    <p style="font-size: 0.85rem; color: #888; margin: 0 0 10px 0;">${t.get('ranking.top_countries_month_sub') || 'Basé sur les 10 meilleurs utilisateurs'}</p>
                    ${topCountries.map((item, index) => `
                        <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f5f5f5;">
                            <span>${medals[index] || `#${index + 1}`} <strong>${item.country}</strong></span>
                            <span style="color: #888;">${item.count} ${t.get('ranking.top_countries_month_count') || 'dans le top 10'}</span>
                        </div>
                    `).join('')}
                </div>
            `;

        } catch (error) {
            console.error('❌ Erreur renderTopCountriesByTopUsers:', error);
            container.innerHTML = `<div style="text-align: center; padding: 20px; color: #888;">${t.get('ranking.top_countries_error') || '⚠️ Erreur de chargement'}</div>`;
        }
    }

    // ============================================================
    // UTILITAIRES
    // ============================================================

    getMedal(rank) {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return '';
    }

    // ============================================================
    // SETUP EVENT LISTENERS
    // ============================================================

    setupEventListeners() {
        // Recherche
        const searchInput = this.container.querySelector('#rankingSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filter(e.target.value);
            });
        }

        // Pagination
        const prevBtn = this.container.querySelector('#prevPage');
        const nextBtn = this.container.querySelector('#nextPage');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        }
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        }
    }

    // ============================================================
    // ATTACH EVENTS
    // ============================================================

    attachEvents() {
        const searchInput = document.getElementById('rankingSearchInput');
        if (searchInput) {
            const newSearch = searchInput.cloneNode(true);
            searchInput.parentNode.replaceChild(newSearch, searchInput);
            newSearch.addEventListener('input', (e) => {
                this.filter(e.target.value);
            });
        }

        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        if (prevBtn) {
            const newPrev = prevBtn.cloneNode(true);
            prevBtn.parentNode.replaceChild(newPrev, prevBtn);
            newPrev.addEventListener('click', () => this.goToPage(this.currentPage - 1));
        }
        if (nextBtn) {
            const newNext = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newNext, nextBtn);
            newNext.addEventListener('click', () => this.goToPage(this.currentPage + 1));
        }
    }
}

export default ClassementManager;