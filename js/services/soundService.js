// js/services/soundService.js

export class SoundService {
    
    constructor() {
        this.audioContext = null;
        this.initialized = false;
    }

    /**
     * Initialise le contexte audio (nécessite une interaction utilisateur)
     */
    init() {
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                console.warn('⚠️ Web Audio API non supportée');
                return;
            }
        }
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.initialized = true;
    }

    /**
     * Joue un son de victoire (triomphe)
     */
    playVictorySound() {
        try {
            this.init();
            
            if (!this.audioContext) return;
            
            const ctx = this.audioContext;
            const now = ctx.currentTime;
            
            // 🎵 NOTES : Do - Mi - Sol (accord parfait majeur)
            const notes = [
                { freq: 523.25, duration: 0.2, start: 0.0 },   // Do
                { freq: 659.25, duration: 0.2, start: 0.15 },  // Mi
                { freq: 783.99, duration: 0.3, start: 0.35 },  // Sol
                { freq: 1046.50, duration: 0.5, start: 0.7 }   // Do (octave supérieure)
            ];
            
            notes.forEach(note => {
                const osc = ctx.createOscillator();
                osc.type = 'sine';
                osc.frequency.value = note.freq;
                
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.3, now + note.start);
                gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.duration);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(now + note.start);
                osc.stop(now + note.start + note.duration + 0.1);
            });
            
            // 🎵 Ajouter une harmonique (arpège ascendant)
            const arpeggio = [
                { freq: 523.25, delay: 0.0 },   // Do
                { freq: 659.25, delay: 0.1 },   // Mi
                { freq: 783.99, delay: 0.2 },   // Sol
                { freq: 1046.50, delay: 0.3 }   // Do
            ];
            
            arpeggio.forEach(note => {
                const osc = ctx.createOscillator();
                osc.type = 'triangle';
                osc.frequency.value = note.freq;
                
                const gain = ctx.createGain();
                gain.gain.setValueAtTime(0.15, now + note.delay);
                gain.gain.exponentialRampToValueAtTime(0.001, now + note.delay + 0.25);
                
                osc.connect(gain);
                gain.connect(ctx.destination);
                
                osc.start(now + note.delay);
                osc.stop(now + note.delay + 0.3);
            });
            
        } catch (error) {
            console.warn('⚠️ Erreur de lecture du son:', error);
        }
    }
}

export default SoundService;