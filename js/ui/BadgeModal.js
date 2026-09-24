// ============================================================
// BADGE MODAL - Composant UI pour les badges
// ============================================================

import { TranslateService } from '../services/translate.js';

export class BadgeModal {
    
    constructor(badgeService, tts, showToast, getUserName) {
        this.badgeService = badgeService;
        this.tts = tts;
        this.showToast = showToast;
        this.getUserName = getUserName || (() => 'Doctor');
        this.overlay = null;
        this.isSpeaking = false;
        this.badgeStatus = [];
        this.unlockedCount = 0;
        this.totalBadges = 0;
        this.giftMessage = '';
        
        // ✅ INITIALISER LE SERVICE DE TRADUCTION
        this.translate = new TranslateService();
        
        // ✅ DÉTECTER LA LANGUE DEPUIS L'URL
        const path = window.location.pathname;
        let lang = 'en'; // fallback par défaut
        
        if (path.includes('/fr/')) lang = 'fr';
        else if (path.includes('/en/')) lang = 'en';
        else if (path.includes('/es/')) lang = 'es';
        else if (path.includes('/ru/')) lang = 'ru';
        
        this.translate.loadLanguage(lang);
        console.log(`🌐 BadgeModal: Langue chargée: ${lang}`);
    }

    open(scores, specialties, settings) {
        if (this.overlay) {
            this.overlay.classList.add('active');
            return;
        }

        this.badgeStatus = this.getTranslatedBadges(scores, specialties, settings);
        this.unlockedCount = this.badgeService.getUnlockedCount(this.badgeStatus);
        this.totalBadges = this.badgeStatus.length;
        this.giftMessage = this.badgeService.getGiftMessage(this.badgeStatus);

        this.buildModal();
        this.attachEvents();
    }

    getTranslatedBadges(scores, specialties, settings) {
        const badgeStatus = this.badgeService.getBadgeStatus(scores, specialties, settings);
        
        return badgeStatus.map(badge => {
            const translation = this.translate.get(`badges.${badge.id}`);
            return {
                ...badge,
                name: translation?.name || badge.name,
                description: translation?.description || badge.description,
                tip: translation?.tip || ''
            };
        });
    }

    close() {
        if (this.tts && this.tts.isSpeakingNow()) {
            this.tts.stop();
        }
        
        if (this.overlay) {
            this.overlay.classList.remove('active');
            setTimeout(() => {
                if (this.overlay) {
                    this.overlay.remove();
                    this.overlay = null;
                }
            }, 300);
        }
    }

    buildModal() {
        const title = this.translate.get('badge_modal.title');
        const unlockedText = this.translate.get('badge_modal.unlocked');
        const lockedText = this.translate.get('badge_modal.locked');
        const listenBtn = this.translate.get('badge_modal.listen_button');
        const closeBtn = this.translate.get('badge_modal.close_button');
        const allUnlocked = this.translate.get('badge_modal.all_unlocked') || '🎉 TOUS DÉBLOQUÉS ! Vous êtes une légende !';
        const remainingMsg = this.translate.get('badge_modal.remaining') || 'Encore {count} badge(s) à débloquer pour tout gagner !';
        const tipPrefix = this.translate.get('badge_modal.tip_prefix') || 'Astuce';
        const closeLabel = this.translate.get('common.close') || 'Fermer';
        
        const remaining = this.totalBadges - this.unlockedCount;
        const statusMessage = this.unlockedCount === this.totalBadges 
            ? allUnlocked 
            : remainingMsg.replace('{count}', remaining);

        const html = `
            <div class="badge-modal-overlay active" id="badgeModalOverlay">
                <div class="badge-modal">
                    <div class="badge-modal-header">
                        <div class="badge-modal-title">
                            ${title}
                            <span style="font-size: 0.8rem; -webkit-text-fill-color: #888;">
                                (${this.unlockedCount}/${this.totalBadges} ${unlockedText.toLowerCase()})
                            </span>
                        </div>
                        <button class="badge-modal-close" id="badgeModalClose" aria-label="${closeLabel}">✕</button>
                    </div>
                    
                    <div style="margin-bottom: 20px; padding: 12px 16px; background: linear-gradient(135deg, #e8f5e9, #c8e6c9); border-radius: 12px;">
                        <p style="margin: 0; font-size: 0.95rem; color: #2e7d32; display: flex; align-items: center; gap: 10px;">
                            🎯 <strong>${statusMessage}</strong>
                        </p>
                    </div>
                    
                    ${this.badgeStatus.map(badge => `
                        <div class="badge-instruction-card ${badge.unlocked ? 'unlocked' : 'locked'}">
                            <div class="badge-instruction-icon">${badge.emoji}</div>
                            <div class="badge-instruction-content">
                                <div class="badge-instruction-name">
                                    ${badge.name}
                                    <span class="badge-instruction-status ${badge.unlocked ? 'unlocked' : 'locked'}">
                                        ${badge.unlocked ? '✅ ' + unlockedText : '🔒 ' + lockedText}
                                    </span>
                                </div>
                                <div class="badge-instruction-desc">${badge.description}</div>
                                <div class="badge-instruction-tip">💡 ${tipPrefix} : ${badge.tip}</div>
                            </div>
                        </div>
                    `).join('')}
                    
                    <div class="badge-modal-listen">
                        <button class="badge-modal-listen-btn" id="badgeModalListenBtn">
                            🔊 ${listenBtn}
                        </button>
                        <button class="badge-modal-listen-btn" style="background: linear-gradient(135deg, #4caf50, #43a047);" id="badgeModalCloseBtn">
                            ✅ ${closeBtn}
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', html);
        this.overlay = document.getElementById('badgeModalOverlay');
    }

    attachEvents() {
        const overlay = this.overlay;
        const closeModal = () => this.close();

        document.getElementById('badgeModalClose').addEventListener('click', closeModal);
        document.getElementById('badgeModalCloseBtn').addEventListener('click', closeModal);
        
        overlay.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.close();
            }
        });

        document.getElementById('badgeModalListenBtn').addEventListener('click', (e) => {
            this.handleListen(e.currentTarget);
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay && this.overlay.classList.contains('active')) {
                this.close();
            }
        });
    }

    handleListen(button) {
        if (!this.tts) {
            if (this.showToast) {
                this.showToast(this.translate.get('errors.tts_unavailable') || '❌ TTS non disponible', 3000);
            }
            return;
        }

        if (this.tts.isSpeakingNow()) {
            this.tts.stop();
            button.textContent = '🔊 ' + this.translate.get('badge_modal.listen_button');
            button.classList.remove('listening');
            return;
        }

        const text = this.buildSpeechText();

        if (!text || text.trim() === '') {
            if (this.showToast) {
                this.showToast(this.translate.get('badge_modal.no_instructions') || '❌ Aucune instruction à lire', 3000);
            }
            return;
        }

        button.textContent = '⏹️ ' + this.translate.get('buttons.stop');
        button.classList.add('listening');

        const lang = this.translate.getCurrentLang();

        this.tts.speak(
            text,
            lang,
            0.9,
            1.0,
            () => {
                button.textContent = '🔊 ' + this.translate.get('badge_modal.listen_button');
                button.classList.remove('listening');
            },
            (error) => {
                console.error('❌ Erreur TTS:', error);
                button.textContent = '🔊 ' + this.translate.get('badge_modal.listen_button');
                button.classList.remove('listening');
                if (this.showToast) {
                    this.showToast(this.translate.get('errors.tts_error') || '❌ Erreur de lecture vocale', 3000);
                }
            }
        );
    }

    buildSpeechText() {
        const userName = this.getUserName() || 'Doctor';
        
        const hello = this.translate.get('ai_summary.hello') || 'Hello {name}!';
        const welcome = this.translate.get('badge_modal.welcome_guide') || 'Welcome to the ETEO badge guide.';
        const congratulations = this.translate.get('badge_modal.all_unlocked') || 'Congratulations! You have unlocked all badges!';
        const legend = this.translate.get('badge_modal.legend') || 'You are a true legend!';
        const unlockedCountText = this.translate.get('badge_modal.unlocked_count') || 'You currently have {count} badge(s) unlocked out of {total}.';
        const remainingText = this.translate.get('badge_modal.remaining_instruction') || 'You have {count} badge(s) left to unlock.';
        const unlockedBadge = this.translate.get('badge_modal.unlocked_badge') || 'You have unlocked the badge {name}: {description}. Congratulations!';
        const lockedBadge = this.translate.get('badge_modal.locked_badge') || 'For the badge {name}, you need {description}. {tip}';
        const almostThere = this.translate.get('badge_modal.almost_there') || 'Come on {name}, you are almost there!';
        const goodLuck = this.translate.get('messages.good_luck') || 'Good luck!';
        
        let text = hello.replace('{name}', userName) + ' ' + welcome + ' ';
        
        const remaining = this.totalBadges - this.unlockedCount;
        if (this.unlockedCount === this.totalBadges) {
            text += congratulations + ' ' + legend + ' ';
        } else {
            text += unlockedCountText.replace('{count}', this.unlockedCount).replace('{total}', this.totalBadges) + ' ';
            text += remainingText.replace('{count}', remaining) + ' ';
        }
        
        this.badgeStatus.forEach(badge => {
            const name = this.cleanText(badge.name);
            const desc = this.cleanText(badge.description);
            const tip = this.cleanText(badge.tip);
            
            if (badge.unlocked) {
                text += unlockedBadge.replace('{name}', name).replace('{description}', desc) + ' ';
            } else {
                text += lockedBadge.replace('{name}', name).replace('{description}', desc).replace('{tip}', tip) + ' ';
            }
        });
        
        if (this.unlockedCount === this.totalBadges) {
            text += this.translate.get('badge_modal.keep_inspiring') || 'Keep inspiring others. ';
        } else {
            text += almostThere.replace('{name}', userName) + ' ' + goodLuck + ' ';
        }
        
        return text;
    }

    cleanText(text) {
        if (!text) return '';
        
        let cleaned = text.replace(/[\u{1F000}-\u{1FFFF}]/gu, '');
        cleaned = cleaned.replace(/[⭐🌟🔥💎🎯🎉💪🧠📚📖🔊✅❌⏰🎰🦷🔪✨🔩👄👶💉🖨️📸📷🧼🔧🏥📊📋💰🏛️📈💻🛡️🌍👩‍⚕️📜🤝⚖️🎓📇👴🧪🎡👆🏅🎁❓🔒🔓💡]/g, '');
        cleaned = cleaned.replace(/[✅🔒❌⏳🎯💡]/g, '');
        cleaned = cleaned.replace(/\s+/g, ' ').trim();
        
        return cleaned;
    }
}

export default BadgeModal;