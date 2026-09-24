// Notifications - Gestion des messages utilisateur
import { Logger } from '../logger.js';

export class Notifications {
    constructor() {
        this.container = null;
        this.defaultDuration = 3000; // 3 secondes
        this.queue = [];
        this.isShowing = false;
        this.position = 'top-right';
        
        // Initialiser le conteneur
        this.initContainer();
        
        Logger.info('Notifications initialisé');
    }

    // ============================================================
    // 1. INITIALISATION
    // ============================================================

    initContainer() {
        // Créer le conteneur s'il n'existe pas
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                width: 100%;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }
        this.container = container;
    }

    // ============================================================
    // 2. MÉTHODES PRINCIPALES
    // ============================================================

    show(message, type = 'info', duration = this.defaultDuration) {
        // Ajouter à la file d'attente
        this.queue.push({ message, type, duration });
        
        // Traiter la file d'attente
        this.processQueue();
    }

    success(message, duration = this.defaultDuration) {
        this.show(message, 'success', duration);
    }

    error(message, duration = this.defaultDuration) {
        this.show(message, 'error', duration);
    }

    warning(message, duration = this.defaultDuration) {
        this.show(message, 'warning', duration);
    }

    info(message, duration = this.defaultDuration) {
        this.show(message, 'info', duration);
    }

    // ============================================================
    // 3. TRAITEMENT DE LA FILE D'ATTENTE
    // ============================================================

    processQueue() {
        if (this.isShowing || this.queue.length === 0) return;
        
        const item = this.queue.shift();
        this.isShowing = true;
        this.renderNotification(item);
    }

    renderNotification(item) {
        const { message, type, duration } = item;

        // Créer la notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        // Styles de base
        const colors = {
            success: { bg: '#d5f5e3', border: '#2ecc71', icon: '✅', text: '#1a7a42' },
            error: { bg: '#fadbd8', border: '#e74c3c', icon: '❌', text: '#922b21' },
            warning: { bg: '#fef9e7', border: '#f39c12', icon: '⚠️', text: '#7d6608' },
            info: { bg: '#d4e6f1', border: '#3498db', icon: 'ℹ️', text: '#1a5276' }
        };

        const style = colors[type] || colors.info;

        notification.style.cssText = `
            background: ${style.bg};
            border-left: 4px solid ${style.border};
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            gap: 12px;
            pointer-events: auto;
            cursor: pointer;
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateX(20px);
            animation: slideIn 0.3s ease forwards;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            color: ${style.text};
        `;

        // Ajouter l'icône et le message
        notification.innerHTML = `
            <span style="font-size:20px;">${style.icon}</span>
            <span style="flex:1;">${message}</span>
            <span style="cursor:pointer;font-size:18px;opacity:0.6;">✕</span>
        `;

        // Fermeture manuelle
        const closeBtn = notification.querySelector('span:last-child');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.hideNotification(notification);
        });

        notification.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        // Ajouter au conteneur
        this.container.appendChild(notification);

        // Afficher avec animation
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        // Auto-fermeture
        if (duration > 0) {
            setTimeout(() => {
                this.hideNotification(notification);
            }, duration);
        }

        Logger.debug(`Notification affichée: ${type} - ${message}`);
    }

    // ============================================================
    // 4. FERMETURE DES NOTIFICATIONS
    // ============================================================

    hideNotification(notification) {
        if (!notification || !notification.parentNode) return;

        // Animation de sortie
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.isShowing = false;
            
            // Traiter la notification suivante
            setTimeout(() => {
                this.processQueue();
            }, 100);
        }, 300);
    }

    clearAll() {
        // Supprimer toutes les notifications
        const notifications = this.container.querySelectorAll('.notification');
        notifications.forEach(notification => {
            this.hideNotification(notification);
        });
        Logger.debug('Toutes les notifications effacées');
    }

    // ============================================================
    // 5. CONFIGURATION
    // ============================================================

    setPosition(position) {
        const validPositions = ['top-right', 'top-left', 'bottom-right', 'bottom-left'];
        if (!validPositions.includes(position)) {
            Logger.warn(`Position invalide: ${position}, utilisation de top-right`);
            return;
        }

        this.position = position;
        
        // Mettre à jour la position du conteneur
        const styles = {
            'top-right': { top: '20px', right: '20px', bottom: 'auto', left: 'auto' },
            'top-left': { top: '20px', left: '20px', bottom: 'auto', right: 'auto' },
            'bottom-right': { bottom: '20px', right: '20px', top: 'auto', left: 'auto' },
            'bottom-left': { bottom: '20px', left: '20px', top: 'auto', right: 'auto' }
        };

        const style = styles[position];
        Object.assign(this.container.style, style);
        
        Logger.debug(`Position des notifications: ${position}`);
    }

    setDuration(duration) {
        this.defaultDuration = duration;
        Logger.debug(`Durée par défaut: ${duration}ms`);
    }

    // ============================================================
    // 6. UTILITAIRES
    // ============================================================

    getQueueLength() {
        return this.queue.length;
    }

    isQueueEmpty() {
        return this.queue.length === 0;
    }

    // ============================================================
    // 7. NETTOYAGE
    // ============================================================

    destroy() {
        this.clearAll();
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        this.container = null;
        this.queue = [];
        this.isShowing = false;
        Logger.info('Notifications détruites');
    }
}

export default Notifications;