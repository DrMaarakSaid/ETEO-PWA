// Système de logging centralisé
export class Logger {
    static levels = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        FATAL: 4
    };

    static currentLevel = this.levels.INFO;

    static setLevel(level) {
        if (level in this.levels) {
            this.currentLevel = this.levels[level];
        }
    }

    static debug(...args) {
        if (this.currentLevel <= this.levels.DEBUG) {
            console.debug('[ETEO:DEBUG]', ...args);
        }
    }

    static info(...args) {
        if (this.currentLevel <= this.levels.INFO) {
            console.log('[ETEO:INFO]', ...args);
        }
    }

    static warn(...args) {
        if (this.currentLevel <= this.levels.WARN) {
            console.warn('[ETEO:WARN]', ...args);
        }
    }

    static error(...args) {
        if (this.currentLevel <= this.levels.ERROR) {
            console.error('[ETEO:ERROR]', ...args);
        }
    }

    static fatal(...args) {
        if (this.currentLevel <= this.levels.FATAL) {
            console.error('[ETEO:FATAL]', ...args);
        }
    }
}

export default Logger;