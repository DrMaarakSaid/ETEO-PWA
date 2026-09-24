// ============================================================
// ROULETTE - ANIMATION DE LA ROUE
// ============================================================

import { Logger } from '../logger.js';

export class Roulette {
    constructor(canvasId, segments, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            Logger.error(`❌ Canvas #${canvasId} non trouvé`);
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.segments = segments;
        this.currentAngle = 0;
        this.isSpinning = false;
        this.onResult = options.onResult || null;
        this.onSpinStart = options.onSpinStart || null;
        this.onSpinEnd = options.onSpinEnd || null;
        this.colors = options.colors || this.generateColors(segments.length);
        
        // Dimensions
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = Math.min(this.canvas.width, this.canvas.height) / 2 - 20;
        
        // État
        this.resultIndex = -1;
        this.animationId = null;
        
        Logger.info(`🎡 Roulette initialisée avec ${segments.length} segments`);
        this.draw();
    }

    /**
     * Génère des couleurs alternées
     */
    generateColors(count) {
        const palette = [
            '#e94560', '#533483', '#0f3460', '#16213e',
            '#e94560', '#533483', '#0f3460', '#16213e',
            '#e94560', '#533483', '#0f3460', '#16213e',
            '#e94560', '#533483', '#0f3460', '#16213e',
            '#e94560', '#533483', '#0f3460', '#16213e',
            '#e94560', '#533483', '#0f3460', '#16213e',
            '#e94560', '#533483', '#0f3460', '#16213e',
            '#e94560', '#533483', '#0f3460', '#16213e'
        ];
        return palette.slice(0, count);
    }

    /**
     * Dessine la roue
     */
    draw() {
        const ctx = this.ctx;
        const centerX = this.centerX;
        const centerY = this.centerY;
        const radius = this.radius;
        const segmentAngle = (2 * Math.PI) / this.segments.length;
        
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dessiner chaque segment
        for (let i = 0; i < this.segments.length; i++) {
            const startAngle = this.currentAngle + i * segmentAngle;
            const endAngle = startAngle + segmentAngle;
            
            // Segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            
            ctx.fillStyle = this.colors[i % this.colors.length];
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Texte
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + segmentAngle / 2);
            ctx.textAlign = 'right';
            ctx.fillStyle = 'white';
            ctx.font = '13px Arial';
            
            const text = this.segments[i].emoji + ' ' + this.segments[i].name;
            ctx.fillText(text, radius - 15, 5);
            ctx.restore();
        }
        
        // Cercle central
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Texte central
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🎯', centerX, centerY);
    }

    /**
     * Lance la roue
     */
    spin() {
        if (this.isSpinning) return;
        
        this.isSpinning = true;
        
        if (this.onSpinStart) {
            this.onSpinStart();
        }
        
        // Calculer l'angle de rotation (au moins 5 tours)
        const extraSpins = 5 + Math.random() * 5;
        const targetAngle = this.currentAngle + extraSpins * 2 * Math.PI;
        
        const duration = 3000 + Math.random() * 1500;
        const startTime = Date.now();
        const startAngle = this.currentAngle;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Effet de ralentissement (ease-out)
            const easeOut = 1 - Math.pow(1 - progress, 3);
            this.currentAngle = startAngle + (targetAngle - startAngle) * easeOut;
            
            this.draw();
            
            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.currentAngle = targetAngle;
                this.draw();
                this.isSpinning = false;
                
                // Déterminer le segment gagnant
                const segmentAngle = (2 * Math.PI) / this.segments.length;
                const normalizedAngle = ((this.currentAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
                // La flèche est en haut (270° ou -90°)
                const pointerAngle = 3 * Math.PI / 2;
                const resultAngle = (pointerAngle - normalizedAngle + 2 * Math.PI) % (2 * Math.PI);
                const index = Math.floor(resultAngle / segmentAngle) % this.segments.length;
                
                this.resultIndex = index;
                
                if (this.onResult) {
                    this.onResult(this.segments[index], index);
                }
                
                if (this.onSpinEnd) {
                    this.onSpinEnd();
                }
                
                Logger.info(`🎡 Résultat: ${this.segments[index].name} (${index + 1}/${this.segments.length})`);
            }
        };
        
        animate();
    }

    /**
     * Arrête la roue (urgent)
     */
    stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.isSpinning = false;
    }

    /**
     * Redimensionne la roue
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.radius = Math.min(this.canvas.width, this.canvas.height) / 2 - 20;
        this.draw();
    }

    /**
     * Détruit la roue
     */
    destroy() {
        this.stop();
        this.onResult = null;
        this.onSpinStart = null;
        this.onSpinEnd = null;
        Logger.info('🎡 Roulette détruite');
    }
}

export default Roulette;