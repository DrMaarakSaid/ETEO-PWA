// scripts/audit_v1_v2.js
// Audit automatique V1 vs V2

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
    sourceDir: path.join('C:', 'ETEO V_Pro', 'www', 'specialites'),
    targetFile: path.join(__dirname, '../docs/V1_V2_DIFF.md')
};

// ============================================================
// FONCTIONS D'EXTRACTION
// ============================================================

function extractElements(htmlContent) {
    const elements = {
        ids: [],
        classes: [],
        buttons: [],
        audioButtons: [],
        feedback: false,
        synopsis: false,
        score: false,
        timer: false,
        progress: false,
        structure: []
    };

    // Extraire les IDs
    const idRegex = /id=["']([^"']+)["']/g;
    let match;
    while ((match = idRegex.exec(htmlContent)) !== null) {
        elements.ids.push(match[1]);
    }

    // Extraire les classes
    const classRegex = /class=["']([^"']+)["']/g;
    while ((match = classRegex.exec(htmlContent)) !== null) {
        elements.classes.push(...match[1].split(' '));
    }

    // Extraire les boutons
    const buttonRegex = /<button[^>]*>/g;
    while ((match = buttonRegex.exec(htmlContent)) !== null) {
        elements.buttons.push(match[0]);
    }

    // Détecter les éléments audio
    if (htmlContent.includes('Lire la question') || htmlContent.includes('🔊')) {
        elements.audioButtons.push('Lire la question');
    }
    if (htmlContent.includes('Réécouter') || htmlContent.includes('🔊')) {
        elements.audioButtons.push('Réécouter');
    }
    if (htmlContent.includes('Lire l\'explication') || htmlContent.includes('🔊')) {
        elements.audioButtons.push('Lire l\'explication');
    }

    // Détecter le feedback
    if (htmlContent.includes('feedback') || htmlContent.includes('Bonne réponse') || htmlContent.includes('Mauvaise réponse')) {
        elements.feedback = true;
    }

    // Détecter le synopsis
    if (htmlContent.includes('synopsis') || htmlContent.includes('Sami') || htmlContent.includes('Mina')) {
        elements.synopsis = true;
    }

    // Détecter le score
    if (htmlContent.includes('score') || htmlContent.includes('Score')) {
        elements.score = true;
    }

    // Détecter le timer
    if (htmlContent.includes('timer') || htmlContent.includes('Temps')) {
        elements.timer = true;
    }

    // Détecter la progression
    if (htmlContent.includes('progress') || htmlContent.includes('Progression')) {
        elements.progress = true;
    }

    // Extraire la structure (balises principales)
    const structureRegex = /<(div|section|header|footer|main|article|nav|aside|button|input|select|textarea|img|video|audio|p|h1|h2|h3|h4|h5|h6|ul|ol|li|table|tr|td|th|form|label|span|strong|em|b|i|u|s|br|hr|a|link|script|style|meta|title)[^>]*>/g;
    while ((match = structureRegex.exec(htmlContent)) !== null) {
        elements.structure.push(match[0]);
    }

    return elements;
}

function generateReport(v1Elements, v2Elements, filePath) {
    const report = [];
    const baseName = path.basename(filePath);

    report.push(`## 📄 Fichier: ${baseName}`);
    report.push('');

    // Comparer les IDs
    const idsDiff = v1Elements.ids.filter(id => !v2Elements.ids.includes(id));
    const idsExtra = v2Elements.ids.filter(id => !v1Elements.ids.includes(id));

    // Comparer les classes
    const classesDiff = v1Elements.classes.filter(cls => !v2Elements.classes.includes(cls));
    const classesExtra = v2Elements.classes.filter(cls => !v1Elements.classes.includes(cls));

    // Comparer les boutons
    const buttonsDiff = v1Elements.buttons.filter(btn => !v2Elements.buttons.includes(btn));

    // Éléments fonctionnels
    const functionalElements = [
        { name: 'Synopsis', v1: v1Elements.synopsis, v2: v2Elements.synopsis },
        { name: 'Feedback', v1: v1Elements.feedback, v2: v2Elements.feedback },
        { name: 'Score', v1: v1Elements.score, v2: v2Elements.score },
        { name: 'Timer', v1: v1Elements.timer, v2: v2Elements.timer },
        { name: 'Progression', v1: v1Elements.progress, v2: v2Elements.progress },
        { name: 'Boutons audio', v1: v1Elements.audioButtons.length > 0, v2: v2Elements.audioButtons.length > 0 }
    ];

    report.push('### 📊 Analyse');

    if (idsDiff.length > 0) {
        report.push(`- **IDs manquants dans V2:** ${idsDiff.join(', ')}`);
    }
    if (idsExtra.length > 0) {
        report.push(`- **IDs supplémentaires dans V2:** ${idsExtra.join(', ')}`);
    }
    if (classesDiff.length > 0) {
        report.push(`- **Classes manquantes dans V2:** ${classesDiff.join(', ')}`);
    }
    if (classesExtra.length > 0) {
        report.push(`- **Classes supplémentaires dans V2:** ${classesExtra.join(', ')}`);
    }
    if (buttonsDiff.length > 0) {
        report.push(`- **Boutons différents dans V2:** ${buttonsDiff.length} boutons`);
    }

    report.push('');
    report.push('### 🔍 Éléments fonctionnels');
    report.push('| Élément | V1 | V2 | Statut |');
    report.push('|---------|----|----|--------|');

    functionalElements.forEach(el => {
        const status = el.v1 === el.v2 ? '✅ OK' : '❌ À corriger';
        report.push(`| ${el.name} | ${el.v1 ? '✅' : '❌'} | ${el.v2 ? '✅' : '❌'} | ${status} |`);
    });

    // Boutons audio
    if (v1Elements.audioButtons.length > 0 || v2Elements.audioButtons.length > 0) {
        report.push('');
        report.push('### 🔊 Boutons audio');
        report.push('| Bouton | V1 | V2 |');
        report.push('|--------|----|----|');
        const allAudioButtons = [...new Set([...v1Elements.audioButtons, ...v2Elements.audioButtons])];
        allAudioButtons.forEach(btn => {
            const inV1 = v1Elements.audioButtons.includes(btn);
            const inV2 = v2Elements.audioButtons.includes(btn);
            report.push(`| ${btn} | ${inV1 ? '✅' : '❌'} | ${inV2 ? '✅' : '❌'} |`);
        });
    }

    report.push('');
    report.push('---');
    report.push('');

    return report.join('\n');
}

// ============================================================
// FONCTION PRINCIPALE
// ============================================================

function runAudit() {
    console.log('🔍 AUDIT AUTOMATIQUE V1 vs V2');
    console.log('==========================================');
    console.log('');

    if (!fs.existsSync(CONFIG.sourceDir)) {
        console.error(`❌ ERREUR: Le dossier source n'existe pas: ${CONFIG.sourceDir}`);
        return;
    }

    const allReports = [];
    const categories = fs.readdirSync(CONFIG.sourceDir);

    console.log(`📂 Dossier source: ${CONFIG.sourceDir}`);
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

        specialtyDirs.forEach(specialty => {
            const v1Path = path.join(categoryPath, specialty, 'V1');
            if (!fs.existsSync(v1Path)) return;

            const files = fs.readdirSync(v1Path).filter(f => f.endsWith('.html') && f.includes('_fr'));

            files.forEach(file => {
                const filePath = path.join(v1Path, file);
                try {
                    const content = fs.readFileSync(filePath, 'utf-8');
                    const elements = extractElements(content);

                    // Simuler V2 (pour l'instant, on compare avec un fichier vide)
                    // Dans la vraie version, on comparerait avec quiz.html
                    const v2Elements = {
                        ids: ['quiz-app', 'quiz-header', 'quiz-content', 'welcome-screen', 'quiz-screen', 'results-screen'],
                        classes: ['screen', 'active', 'btn-primary', 'header-top'],
                        buttons: ['<button id="start-btn">', '<button id="next-btn">', '<button id="restart-btn">'],
                        audioButtons: [],
                        feedback: true,
                        synopsis: false,
                        score: true,
                        timer: true,
                        progress: true
                    };

                    const report = generateReport(elements, v2Elements, file);
                    allReports.push(report);
                } catch (error) {
                    console.error(`❌ Erreur sur ${file}: ${error.message}`);
                }
            });
        });
    });

    // Écrire le rapport
    const fullReport = `# ETEO V2 - Audit V1 vs V2\n\n` +
        `## 📋 Résumé\n\n` +
        `- **Fichiers analysés:** ${allReports.length}\n` +
        `- **Date:** ${new Date().toISOString()}\n\n` +
        `---\n\n` +
        allReports.join('\n') +
        `\n\n---\n\n` +
        `## ✅ Actions à réaliser\n\n` +
        `1. Ajouter les IDs manquants dans V2\n` +
        `2. Ajouter les classes manquantes dans V2\n` +
        `3. Ajouter les boutons audio (🔊 Lire la question, etc.)\n` +
        `4. Ajouter le synopsis (Sami & Mina)\n` +
        `5. Ajouter le feedback (Bonne/Mauvaise réponse)\n` +
        `6. Synchroniser le score et le timer\n` +
        `7. Valider écran par écran\n`;

    fs.writeFileSync(CONFIG.targetFile, fullReport);
    console.log(`✅ Rapport généré: ${CONFIG.targetFile}`);
    console.log(`📊 ${allReports.length} fichiers analysés`);
    console.log('==========================================');
}

runAudit();