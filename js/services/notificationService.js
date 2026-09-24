// js/services/notificationService.js

import { SoundService } from './soundService.js';

export class NotificationService {
    
    constructor(storage, showToast) {
        this.storage = storage;
        this.showToast = showToast;
        this.soundService = new SoundService();
        this.isNotifying = false;
    }

    /**
     * Vérifie les badges nouvellement débloqués
     */
    checkNewBadges(previousBadges, currentBadges, badgeStatus) {
        const newBadges = currentBadges.filter(
            badgeId => !previousBadges.includes(badgeId)
        );
        
        if (newBadges.length > 0 && !this.isNotifying) {
            const newBadgeObjects = newBadges.map(id => badgeStatus.find(b => b.id === id));
            newBadgeObjects.forEach(badge => {
                this.showBadgeCelebration(badge);
            });
        }
        
        return newBadges;
    }

    /**
     * Célébration complète pour un badge débloqué
     */
    showBadgeCelebration(badge) {
        if (this.isNotifying) return;
        this.isNotifying = true;
        
        const settings = this.storage.getSettings() || {};
        const userName = settings.user?.fullName || 'Docteur';
        
        // 1. 🔔 Afficher une notification toast
        this.showToast(`🏅 ${userName}, vous avez débloqué le badge "${badge.name}" ! ${badge.description}`, 4000);
        
        // 2. 🔊 Jouer le son de victoire (après 200ms)
        setTimeout(() => {
            try {
                this.soundService.playVictorySound();
            } catch (e) {
                console.warn('⚠️ Son non disponible');
            }
        }, 200);
        
        // 3. 🎊 Lancer les confettis (après 400ms)
        setTimeout(() => {
            this.showConfetti();
        }, 400);
        
        // 4. 📢 Afficher une modale après les confettis (après 1200ms)
        setTimeout(() => {
            this.showBadgeUnlockModal(badge, userName);
            this.isNotifying = false;
        }, 1500);
    }

    /**
     * Affiche la modale de badge débloqué
     */
    showBadgeUnlockModal(badge, userName) {
        const existing = document.getElementById('badgeUnlockModalOverlay');
        if (existing) existing.remove();
        
        const modalHTML = `
            <div class="badge-unlock-overlay" id="badgeUnlockModalOverlay">
                <div class="badge-unlock-modal">
                    <div class="badge-unlock-icon">🎉</div>
                    <h2>FÉLICITATIONS ${userName} !</h2>
                    <p>Vous venez de débloquer un nouveau badge !</p>
                    <div class="badge-unlock-badge">
                        <span class="badge-emoji">${badge.emoji}</span>
                        <span class="badge-name">${badge.name}</span>
                    </div>
                    <p class="badge-desc">${badge.description}</p>
                    <button class="badge-unlock-btn" onclick="document.getElementById('badgeUnlockModalOverlay').remove()">
                        🚀 Continuer
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        document.getElementById('badgeUnlockModalOverlay').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.remove();
            }
        });
    }

    /**
     * Animation de confettis
     */
    showConfetti() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF9F43', '#F368E0'];
        const emojis = ['🎉', '✨', '⭐', '🌟', '🎊', '💫', '🌈', '🔥'];
        
        const container = document.createElement('div');
        container.id = 'confettiContainer';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
            overflow: hidden;
        `;
        
        for (let i = 0; i < 80; i++) {
            const confetti = document.createElement('div');
            
            if (Math.random() > 0.5) {
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                confetti.textContent = emoji;
                confetti.style.fontSize = `${18 + Math.random() * 30}px`;
            } else {
                confetti.style.width = `${8 + Math.random() * 15}px`;
                confetti.style.height = `${8 + Math.random() * 15}px`;
                confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            }
            
            const startX = Math.random() * 100;
            const duration = 2 + Math.random() * 2.5;
            const delay = Math.random() * 0.8;
            const size = 20 + Math.random() * 30;
            
            confetti.style.cssText = `
                position: absolute;
                left: ${startX}%;
                top: -${size}px;
                font-size: ${size}px;
                width: ${size * 0.6}px;
                height: ${size * 0.6}px;
                opacity: 0.9;
                animation: confettiFall ${duration}s ease-in ${delay}s forwards;
                transform: rotate(${Math.random() * 360}deg);
            `;
            
            container.appendChild(confetti);
        }
        
        document.body.appendChild(container);
        
        const styleId = 'confettiStyle';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        top: -20px;
                        opacity: 1;
                        transform: translateX(0) rotate(0deg) scale(1);
                    }
                    25% {
                        transform: translateX(${Math.random() > 0.5 ? '' : '-'}30px) rotate(180deg) scale(1.1);
                    }
                    75% {
                        transform: translateX(${Math.random() > 0.5 ? '' : '-'}20px) rotate(360deg) scale(0.9);
                    }
                    100% {
                        top: 110%;
                        opacity: 0.2;
                        transform: translateX(${Math.random() > 0.5 ? '' : '-'}40px) rotate(720deg) scale(0.5);
                    }
                }
            `;
            document.head.appendChild(style);
        }
        
        setTimeout(() => {
            container.remove();
        }, 5000);
    }
}

export default NotificationService;