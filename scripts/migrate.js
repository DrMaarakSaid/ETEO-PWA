// scripts/migrate.js
// Script de migration automatique V1 → JSON V2

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
    // ✅ CHEMIN CORRIGÉ VERS VOS FICHIERS V1
    sourceDir: path.join('C:', 'ETEO V_Pro', 'www', 'specialites'),
    targetDir: path.join(__dirname, '../data'),
    timeLimit: 50,
    difficulty: 'facile',
    version: '2.0',
    author: 'Dr. SAID MAARAK',
    schemaVersion: '2.1',
    maxQuestions: 50
};

// ============================================================
// VALIDATEUR INTÉGRÉ
// ============================================================

function validateQuestion(question, index) {
    const errors = [];
    
    if (!question.question || question.question.trim() === '') {
        errors.push(`Question ${index + 1}: texte manquant`);
    }
    if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
        errors.push(`Question ${index + 1}: options invalides (minimum 2)`);
    }
    if (question.correct === undefined || question.correct === null) {
        errors.push(`Question ${index + 1}: correct manquant`);
    }
    if (question.correct < 0 || question.correct >= question.options.length) {
        errors.push(`Question ${index + 1}: index correct invalide`);
    }
    if (!question.explanation || question.explanation.trim() === '') {
        errors.push(`Question ${index + 1}: explication manquante`);
    }
    
    return errors;
}

function validateQuizData(data) {
    const errors = [];
    
    if (!data || typeof data !== 'object') {
        errors.push('Données invalides');
        return errors;
    }
    if (!data.questions || !Array.isArray(data.questions)) {
        errors.push('questions doit être un tableau');
        return errors;
    }
    if (data.questions.length === 0 || data.questions.length > CONFIG.maxQuestions) {
        errors.push(`Le quiz doit contenir entre 1 et ${CONFIG.maxQuestions} questions (actuellement: ${data.questions.length})`);
        return errors;
    }
    
    data.questions.forEach((q, index) => {
        const qErrors = validateQuestion(q, index);
        errors.push(...qErrors);
    });
    
    return errors;
}

// ============================================================
// FONCTIONS D'EXTRACTION
// ============================================================

function extractQuestionsFromHTML(htmlContent) {
    const regex = /const questions = \[([\s\S]*?)\];/;
    const match = htmlContent.match(regex);
    
    if (!match) {
        return [];
    }

    const questionsArray = match[1];
    
    const questionRegex = /\{\s*question:\s*["']([\s\S]*?)["'],\s*options:\s*\[([\s\S]*?)\],\s*correct:\s*(\d+),\s*explanation:\s*["']([\s\S]*?)["']\s*\}/g;
    
    const questions = [];
    let qMatch;
    
    while ((qMatch = questionRegex.exec(questionsArray)) !== null) {
        const questionText = qMatch[1].trim();
        const optionsRaw = qMatch[2];
        const correctIndex = parseInt(qMatch[3], 10);
        const explanation = qMatch[4].trim();
        
        const options = optionsRaw
            .split(/,\s*(?=["'])/)
            .map(opt => opt.trim().replace(/^["']|["']$/g, ''))
            .filter(opt => opt.length > 0);
        
        questions.push({
            question: questionText,
            options: options,
            correct: correctIndex,
            explanation: explanation
        });
    }
    
    return questions;
}

function generateId(specialty, level, index) {
    const specialtyCode = specialty.substring(0, 4).toUpperCase();
    const levelMap = {
        'debutant1': 'D1',
        'debutant2': 'D2',
        'intermediaire1': 'I1',
        'intermediaire2': 'I2',
        'expert1': 'E1',
        'expert2': 'E2'
    };
    const levelCode = levelMap[level] || 'XX';
    const num = String(index + 1).padStart(2, '0');
    return `${specialtyCode}_${levelCode}_Q${num}`;
}

function generateJSON(specialty, level, questions) {
    const specialtyName = specialty.charAt(0).toUpperCase() + specialty.slice(1);
    const levelMap = {
        'debutant1': 'Débutant 1',
        'debutant2': 'Débutant 2',
        'intermediaire1': 'Intermédiaire 1',
        'intermediaire2': 'Intermédiaire 2',
        'expert1': 'Expert 1',
        'expert2': 'Expert 2'
    };
    const levelName = levelMap[level] || level;
    
    const totalTime = questions.length * CONFIG.timeLimit;
    
    return {
        schemaVersion: CONFIG.schemaVersion,
        metadata: {
            id: `${specialty}_${level}_001`,
            title: `${specialtyName} - ${levelName}`,
            specialty: specialty.substring(0, 4).toUpperCase(),
            language: 'fr',
            version: CONFIG.version,
            author: CONFIG.author,
            status: 'published',
            estimatedDuration: totalTime
        },
        questions: questions.map((q, index) => ({
            id: generateId(specialty, level, index),
            type: 'single-choice',
            question: q.question,
            media: [],
            options: q.options,
            correct: q.correct,
            explanation: q.explanation,
            difficulty: CONFIG.difficulty,
            category: '',
            timeLimit: CONFIG.timeLimit,
            shuffleOptions: false,
            tts: true,
            tags: [],
            references: []
        }))
    };
}

// ============================================================
// FONCTION PRINCIPALE
// ============================================================

function runMigration(dryRun = false) {
    console.log('🚀 ' + (dryRun ? 'ANALYSE' : 'MIGRATION') + ' AUTOMATIQUE');
    console.log('==========================================');
    if (dryRun) {
        console.log('🔍 MODE DRY-RUN : Aucun fichier ne sera créé');
    }
    console.log('');
    
    if (!fs.existsSync(CONFIG.sourceDir)) {
        console.error(`❌ ERREUR: Le dossier source n'existe pas:`);
        console.error(`   ${CONFIG.sourceDir}`);
        console.error(`   Veuillez vérifier le chemin dans la configuration.`);
        return;
    }
    
    const categories = fs.readdirSync(CONFIG.sourceDir);
    const report = [];
    let totalFiles = 0;
    let totalQuestions = 0;
    let totalErrors = 0;
    
    console.log(`📂 Dossier source: ${CONFIG.sourceDir}`);
    console.log(`📁 ${categories.length} dossiers trouvés`);
    console.log('');
    
    categories.forEach(category => {
        const categoryPath = path.join(CONFIG.sourceDir, category);
        
        if (!fs.statSync(categoryPath).isDirectory()) return;
        
        const items = fs.readdirSync(categoryPath);
        const specialtyDirs = items.filter(item => {
            const itemPath = path.join(categoryPath, item);
            if (!fs.statSync(itemPath).isDirectory()) return false;
            const v1Path = path.join(itemPath, 'V1');
            return fs.existsSync(v1Path);
        });
        
        if (specialtyDirs.length === 0) return;
        
        console.log(`📂 Catégorie: ${category}`);
        
        specialtyDirs.forEach(specialty => {
            const v1Path = path.join(categoryPath, specialty, 'V1');
            
            if (!fs.existsSync(v1Path)) return;
            
            const files = fs.readdirSync(v1Path).filter(f => f.endsWith('.html') && f.includes('_fr'));
            
            if (files.length === 0) {
                console.log(`   ⚠️ ${specialty}: Aucun fichier trouvé`);
                return;
            }
            
            console.log(`   📂 ${specialty}`);
            
            files.forEach(file => {
                const level = file.replace('_fr.html', '');
                const filePath = path.join(v1Path, file);
                const fileReport = { file, level, questions: 0, status: 'OK', errors: [] };
                
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const questions = extractQuestionsFromHTML(content);
                    
                    if (questions.length === 0) {
                        fileReport.status = '❌';
                        fileReport.errors.push('Aucune question extraite');
                        totalErrors++;
                    } else {
                        fileReport.questions = questions.length;
                        totalQuestions += questions.length;
                        
                        const jsonData = generateJSON(specialty, level, questions);
                        const validationErrors = validateQuizData(jsonData);
                        
                        if (validationErrors.length > 0) {
                            fileReport.status = '❌';
                            fileReport.errors.push(...validationErrors);
                            totalErrors++;
                        } else {
                            if (!dryRun) {
                                const targetFile = path.join(CONFIG.targetDir, specialty, `${level}.json`);
                                const targetDir = path.dirname(targetFile);
                                if (!fs.existsSync(targetDir)) {
                                    fs.mkdirSync(targetDir, { recursive: true });
                                }
                                fs.writeFileSync(targetFile, JSON.stringify(jsonData, null, 2));
                            }
                            fileReport.status = '✅';
                        }
                    }
                } catch (error) {
                    fileReport.status = '❌';
                    fileReport.errors.push(error.message);
                    totalErrors++;
                }
                
                totalFiles++;
                report.push(fileReport);
            });
        });
    });
    
    console.log('\n==========================================');
    console.log('📊 RAPPORT FINAL');
    console.log('==========================================');
    
    report.forEach(file => {
        const status = file.status === '✅' ? '✅' : '❌';
        const q = file.questions > 0 ? `${file.questions} questions` : '⚠️';
        console.log(`   ${status} ${file.file} → ${q}`);
        if (file.errors.length > 0) {
            file.errors.forEach(err => {
                console.log(`      ⚠️ ${err}`);
            });
        }
    });
    
    console.log('\n==========================================');
    console.log('📊 STATISTIQUES');
    console.log(`   📄 Fichiers traités: ${totalFiles}`);
    console.log(`   ❓ Questions extraites: ${totalQuestions}`);
    console.log(`   ✅ Succès: ${totalFiles - totalErrors}`);
    console.log(`   ❌ Erreurs: ${totalErrors}`);
    if (dryRun) {
        console.log('   🔍 Mode DRY-RUN : Aucun fichier écrit');
    } else {
        console.log(`   📁 Fichiers JSON générés dans: ${CONFIG.targetDir}`);
    }
    console.log('==========================================');
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run') || args.includes('-n');

runMigration(dryRun);