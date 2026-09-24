// scripts/extract-stories.js (VERSION FINALE)
// Script pour importer les histoires de V1 vers V2

const fs = require('fs');
const path = require('path');

const SOURCE_DIR = 'C:/ETEO V_Pro/www/specialites/';
const DEST_DIR = './data/';

// ============================================================
// FONCTION : Extraire une histoire
// ============================================================

function extractStory(htmlContent) {
    const result = {
        title: '',
        subtitle: '',
        synopsis: '',
        characters: [],
        chapters: {}
    };

    // 1. Extraire le titre (depuis popup-title)
    const titleMatch = htmlContent.match(/<div class="popup-title">([\s\S]*?)<\/div>/);
    if (titleMatch) {
        result.title = titleMatch[1].trim();
    }

    // 2. Extraire le sous-titre (depuis popup-subtitle)
    const subtitleMatch = htmlContent.match(/<div class="popup-subtitle">([\s\S]*?)<\/div>/);
    if (subtitleMatch) {
        result.subtitle = subtitleMatch[1].trim();
    }

    // 3. Extraire le synopsis (depuis popup-text)
    let storyText = '';
    const storyMatch = htmlContent.match(/<div class="popup-text"[^>]*id="popupStoryText"[^>]*>([\s\S]*?)<\/div>/);
    if (storyMatch) {
        storyText = storyMatch[1]
            .replace(/<br\s*\/?>/g, '\n')      // <br> → saut de ligne
            .replace(/<strong>/g, '')          // Supprimer <strong>
            .replace(/<\/strong>/g, '')        // Supprimer </strong>
            .replace(/<em>/g, '')              // Supprimer <em>
            .replace(/<\/em>/g, '')            // Supprimer </em>
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/<[^>]*>/g, '')           // Supprimer toutes les autres balises
            .trim();
    }

    // 4. Si pas de popup-text, chercher une autre classe
    if (!storyText || storyText.length < 20) {
        const altMatch = htmlContent.match(/<div class="popup-text">([\s\S]*?)<\/div>/);
        if (altMatch) {
            storyText = altMatch[1]
                .replace(/<br\s*\/?>/g, '\n')
                .replace(/<[^>]*>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .trim();
        }
    }

    // 5. Extraire les personnages (Dr X, Dr Y)
    const namePattern = /Dr\s+([A-Z][a-z]+)/g;
    const matches = [...htmlContent.matchAll(namePattern)];
    const uniqueNames = [...new Set(matches.map(m => m[0]))];
    if (uniqueNames.length > 0) {
        result.characters = uniqueNames.map(name => ({
            name: name,
            role: 'Personnage',
            emoji: '👨‍⚕️'
        }));
    }

    // 6. Si toujours pas d'histoire, utiliser un fallback
    if (!storyText || storyText.length < 20) {
        const displayName = htmlContent.match(/<h1>([\s\S]*?)<\/h1>/);
        const name = displayName ? displayName[1].trim() : 'Spécialité';
        storyText = `Bienvenue dans la spécialité ${name}. Sélectionnez un niveau pour commencer.`;
    }

    result.synopsis = storyText;

    // 7. Créer les chapitres
    const words = result.synopsis.split(' ');
    if (words.length > 20) {
        const chunkSize = Math.floor(words.length / 6);
        const levels = ['debutant1', 'debutant2', 'intermediaire1', 'intermediaire2', 'expert1', 'expert2'];
        levels.forEach((level, index) => {
            const start = index * chunkSize;
            const end = (index + 1) * chunkSize;
            const chunk = words.slice(start, end).join(' ');
            result.chapters[level] = chunk + '...';
        });
    } else {
        const levels = ['debutant1', 'debutant2', 'intermediaire1', 'intermediaire2', 'expert1', 'expert2'];
        levels.forEach(level => {
            result.chapters[level] = result.synopsis;
        });
    }

    return result;
}

// ============================================================
// FONCTION : Trouver le nom de la spécialité
// ============================================================

function getSpecialtyName(filePath) {
    const parts = filePath.split(path.sep);
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] === 'V1' && i > 0) {
            return parts[i - 1];
        }
    }
    return path.basename(path.dirname(filePath));
}

// ============================================================
// FONCTION : Nettoyer un nom
// ============================================================

function cleanFolderName(name) {
    return name
        .replace(/[&]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/[éèêë]/g, 'e')
        .replace(/[àâä]/g, 'a')
        .replace(/[ôö]/g, 'o')
        .replace(/[ûü]/g, 'u')
        .replace(/[ïî]/g, 'i')
        .replace(/[ç]/g, 'c')
        .replace(/[^a-zA-Z0-9_-]/g, '');
}

// ============================================================
// FONCTION PRINCIPALE
// ============================================================

function main() {
    console.log('🚀 IMPORT DES HISTOIRES V1 → V2 (VERSION FINALE)');
    console.log('=====================================');
    console.log(`📁 Source: ${SOURCE_DIR}`);
    console.log(`📁 Destination: ${DEST_DIR}`);
    console.log('');

    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`❌ Erreur: Dossier source non trouvé`);
        return;
    }

    if (!fs.existsSync(DEST_DIR)) {
        fs.mkdirSync(DEST_DIR, { recursive: true });
    }

    let successCount = 0;
    let errorCount = 0;

    function walkDir(dir) {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory()) {
                walkDir(fullPath);
            } else if (file === 'menu_fr.html') {
                try {
                    const html = fs.readFileSync(fullPath, 'utf-8');
                    const story = extractStory(html);
                    const specialtyName = getSpecialtyName(fullPath);
                    const cleanName = cleanFolderName(specialtyName);

                    if (!story.synopsis || story.synopsis.length < 10) {
                        console.log(`⚠️  Histoire vide pour: ${specialtyName}`);
                        return;
                    }

                    const specialtyDir = path.join(DEST_DIR, cleanName, 'stories');
                    if (!fs.existsSync(specialtyDir)) {
                        fs.mkdirSync(specialtyDir, { recursive: true });
                    }

                    const jsonData = {
                        version: 'v1',
                        date: new Date().toISOString(),
                        specialty: cleanName,
                        originalName: specialtyName,
                        title: story.title || `Spécialité ${specialtyName}`,
                        subtitle: story.subtitle || '',
                        synopsis: story.synopsis,
                        characters: story.characters,
                        chapters: story.chapters
                    };

                    const jsonPath = path.join(specialtyDir, 'story_v1.json');
                    fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), 'utf-8');
                    
                    console.log(`✅ ${specialtyName} → ${jsonPath}`);
                    successCount++;
                    
                } catch (error) {
                    console.error(`❌ Erreur:`, error.message);
                    errorCount++;
                }
            }
        }
    }

    walkDir(SOURCE_DIR);

    console.log('');
    console.log('=====================================');
    console.log(`✅ Succès: ${successCount} histoires importées`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log('🎯 Import terminé !');
}

main();