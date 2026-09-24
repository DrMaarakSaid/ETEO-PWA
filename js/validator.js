// Validation des données
import { Logger } from './logger.js';

export class Validator {
    /**
     * Valider une question
     * Compatible avec ancien format (text) et nouveau format (question)
     */
    static validateQuestion(question) {
        // ✅ Accepter 'question' ou 'text' (compatibilité ascendante)
        const questionText = question.question || question.text;
        
        // Vérifier les champs obligatoires
        if (question.id === undefined) {
            throw new Error('Champ manquant: id');
        }
        if (!questionText || questionText.trim() === '') {
            throw new Error('Champ manquant: question');
        }
        if (!Array.isArray(question.options) || question.options.length < 2) {
            throw new Error('options doit être un tableau avec au moins 2 éléments');
        }
        if (question.correct === undefined || question.correct === null) {
            throw new Error('Champ manquant: correct');
        }
        if (question.correct < 0 || question.correct >= question.options.length) {
            throw new Error('correct index invalide');
        }
        
        // ✅ Nouveau champ : type (optionnel)
        if (question.type && !['single-choice', 'multiple-choice', 'true-false', 'ordering', 'matching', 'image-hotspot', 'case-study'].includes(question.type)) {
            throw new Error(`type invalide: ${question.type}`);
        }
        
        // ✅ Nouveau champ : difficulty (optionnel)
        if (question.difficulty && !['facile', 'moyen', 'difficile', 'easy', 'medium', 'hard'].includes(question.difficulty)) {
            throw new Error(`difficulty invalide: ${question.difficulty}`);
        }
        
        return true;
    }

    static validateQuizData(data) {
        if (!data || typeof data !== 'object') {
            throw new Error('Données invalides');
        }
        if (!data.questions || !Array.isArray(data.questions)) {
            throw new Error('questions doit être un tableau');
        }
        // ✅ LIMITE PORTÉE À 50 QUESTIONS (pour les quiz V2)
        if (data.questions.length === 0 || data.questions.length > 50) {
            throw new Error('Le quiz doit contenir entre 1 et 50 questions');
        }
        
        // ✅ Vérifier schemaVersion (optionnel)
        if (data.schemaVersion) {
            Logger.info(`Schéma version: ${data.schemaVersion}`);
        }
        
        // ✅ Vérifier metadata (optionnel)
        if (data.metadata) {
            Logger.info(`Quiz: ${data.metadata.title || 'Sans titre'}`);
        }
        
        data.questions.forEach((q, index) => {
            try {
                this.validateQuestion(q);
            } catch (e) {
                throw new Error(`Question ${index + 1}: ${e.message}`);
            }
        });
        
        return true;
    }
}

export default Validator;