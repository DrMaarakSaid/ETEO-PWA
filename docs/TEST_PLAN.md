# PLAN DE TEST - ETEO V2
**Version :** 1.0  
**Date :** 2026-08-04  
**Auteur :** Dr MAARAK  
**Statut :** À valider

---

## 1. OBJECTIFS

Valider que l'application ETEO V2 fonctionne conformément aux spécifications :
- ✅ Moteur de quiz 100% opérationnel
- ✅ Gestion des données JSON V2
- ✅ Traductions dynamiques (fr/en/es/ru)
- ✅ Timer, Score, Progression
- ✅ Stockage local (localStorage)
- ✅ Interface responsive

---

## 2. PRÉREQUIS

### 2.1 Environnement
- Navigateur : Chrome 90+, Firefox 88+, Edge 90+
- Résolution : 320px à 1920px
- Connexion Internet : Non requise (hors Firebase)

### 2.2 Données de test
- ✅ data/chirurgie/debutant1.json (migré V2)
- ⏳ data/chirurgie/debutant2.json (à migrer)

### 2.3 Fichiers requis
- ✅ quiz.html
- ✅ css/style.css
- ✅ js/config.js
- ✅ js/logger.js
- ✅ js/validator.js
- ✅ js/services/storage.js
- ✅ js/services/translate.js
- ✅ js/core/quiz.js
- ✅ js/core/timer.js
- ✅ js/core/score.js
- ✅ js/core/progress.js
- ⏳ js/ui/renderer.js (à créer)
- ⏳ js/ui/notifications.js (à créer)
- ✅ lang/fr.json, en.json, es.json, ru.json

---

## 3. TESTS UNITAIRES

### 3.1 Validator.js
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| V-01 | Valider debutant1.json V2 | ✅ true | ⬜ |
| V-02 | Valider JSON invalide (champ manquant) | ❌ false + erreur | ⬜ |
| V-03 | Valider JSON version 1 (ancien format) | ❌ false + migration requise | ⬜ |
| V-04 | Valider structure spécialités | ✅ true | ⬜ |

### 3.2 Storage.js
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| S-01 | Sauvegarder une session | ✅ localStorage.setItem() | ⬜ |
| S-02 | Récupérer une session | ✅ objet identique | ⬜ |
| S-03 | Supprimer une session | ✅ null | ⬜ |
| S-04 | Sauvegarder avec quota dépassé | ❌ erreur gérée | ⬜ |

### 3.3 Translate.js
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| T-01 | Traduction FR → "Bienvenue" | "Bienvenue" | ⬜ |
| T-02 | Traduction EN → "Welcome" | "Welcome" | ⬜ |
| T-03 | Traduction ES → "Bienvenido" | "Bienvenido" | ⬜ |
| T-04 | Traduction RU → "Добро пожаловать" | "Добро пожаловать" | ⬜ |
| T-05 | Clé inexistante | "Clé non trouvée" | ⬜ |
| T-06 | Changement de langue dynamique | ✅ interface mise à jour | ⬜ |

### 3.4 Quiz.js
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| Q-01 | Initialiser un quiz | ✅ objet Quiz créé | ⬜ |
| Q-02 | Charger 10 questions | ✅ 10 questions affichées | ⬜ |
| Q-03 | Navigation question suivante | ✅ index +1 | ⬜ |
| Q-04 | Navigation question précédente | ✅ index -1 | ⬜ |
| Q-05 | Répondre à une question | ✅ réponse enregistrée | ⬜ |
| Q-06 | Répondre avec clic sur option | ✅ option sélectionnée | ⬜ |
| Q-07 | Vérifier réponse correcte | ✅ booléen | ⬜ |
| Q-08 | Terminer le quiz | ✅ écran final | ⬜ |

### 3.5 Timer.js
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| TM-01 | Démarrer timer 60s | ✅ décompte actif | ⬜ |
| TM-02 | Pause timer | ✅ compteur arrêté | ⬜ |
| TM-03 | Reprise timer | ✅ compteur reprend | ⬜ |
| TM-04 | Timer à 0 | ✅ événement TIME_UP | ⬜ |
| TM-05 | Timer + Score simultané | ✅ les deux fonctionnent | ⬜ |

### 3.6 Score.js
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| SC-01 | Calculer score 8/10 | 80% | ⬜ |
| SC-02 | Calculer score 0/10 | 0% | ⬜ |
| SC-03 | Calculer score 10/10 | 100% | ⬜ |
| SC-04 | Score avec réponses vides | 0% | ⬜ |
| SC-05 | Sauvegarder score dans session | ✅ objet complet | ⬜ |

### 3.7 Progress.js
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| P-01 | Sauvegarder progression | ✅ localStorage | ⬜ |
| P-02 | Charger progression | ✅ objet restauré | ⬜ |
| P-03 | Réinitialiser progression | ✅ toutes données effacées | ⬜ |
| P-04 | Progression multi-spécialités | ✅ chaque spécialité suivie | ⬜ |

---

## 4. TESTS D'INTÉGRATION

### 4.1 Chargement des données
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| I-01 | Charger debutant1.json | ✅ questions affichées | ⬜ |
| I-02 | Charger JSON corrompu | ❌ notification erreur | ⬜ |
| I-03 | Charger JSON version 1 | ❌ notification migration | ⬜ |
| I-04 | Charger avec Validator.js | ✅ validation automatique | ⬜ |

### 4.2 Affichage dynamique
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| I-05 | Afficher question + options | ✅ texte + 4 boutons | ⬜ |
| I-06 | Mettre à jour progress bar | ✅ barre avance | ⬜ |
| I-07 | Afficher numéro question | "Question 3/10" | ⬜ |
| I-08 | Afficher timer | "⏱️ 45s" | ⬜ |
| I-09 | Afficher score en direct | "✅ 6/8" | ⬜ |

### 4.3 Navigation
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| I-10 | Suivant → question +1 | ✅ UI mise à jour | ⬜ |
| I-11 | Précédent → question -1 | ✅ UI mise à jour | ⬜ |
| I-12 | Dernière question → bouton "Terminer" | ✅ visible | ⬜ |
| I-13 | Réponse automatique au timeout | ✅ question suivante | ⬜ |

### 4.4 Timer + Score + Progression
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| I-14 | Timer et Score simultanés | ✅ les deux mis à jour | ⬜ |
| I-15 | Progression après réponse | ✅ sauvegardée | ⬜ |
| I-16 | Reprise après rafraîchissement | ✅ session restaurée | ⬜ |

---

## 5. TESTS FONCTIONNELS

### 5.1 Parcours complet
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| F-01 | Lancer quiz chirurgie débutant | ✅ 1ère question affichée | ⬜ |
| F-02 | Répondre à toutes les questions | ✅ 10 réponses | ⬜ |
| F-03 | Voir écran final | ✅ score + feedback | ⬜ |
| F-04 | Voir historique des réponses | ✅ chaque question + réponse | ⬜ |
| F-05 | Recommencer | ✅ quiz réinitialisé | ⬜ |

### 5.2 Changement de langue
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| F-06 | FR → EN en cours de quiz | ✅ labels traduits | ⬜ |
| F-07 | EN → ES en cours de quiz | ✅ labels traduits | ⬜ |
| F-08 | ES → RU en cours de quiz | ✅ labels traduits | ⬜ |
| F-09 | Mémorisation langue | ✅ localStorage | ⬜ |

### 5.3 Notifications
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| F-10 | Notification succès | ✅ verte + message | ⬜ |
| F-11 | Notification erreur | ✅ rouge + message | ⬜ |
| F-12 | Notification info | ✅ bleue + message | ⬜ |
| F-13 | Notification warning | ✅ orange + message | ⬜ |
| F-14 | Disparition auto (3s) | ✅ notification disparaît | ⬜ |

### 5.4 Responsive
| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| F-15 | Mobile (320px) | ✅ interface adaptée | ⬜ |
| F-16 | Tablette (768px) | ✅ interface adaptée | ⬜ |
| F-17 | Desktop (1920px) | ✅ interface adaptée | ⬜ |
| F-18 | Rotation mobile | ✅ interface adaptée | ⬜ |

---

## 6. TESTS DE RÉGRESSION

| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| R-01 | Migration debutant1.json V2 | ✅ structure validée | ⬜ |
| R-02 | Ancienne version V1 rejetée | ❌ notification | ⬜ |
| R-03 | Compatibilité Chrome/Firefox/Edge | ✅ fonctionne partout | ⬜ |
| R-04 | Performance avec 50 questions | ✅ < 2s chargement | ⬜ |

---

## 7. TESTS DE PERFORMANCE

| ID | Test | Seuil | Statut |
|----|------|-------|--------|
| P-01 | Chargement initial | < 2s | ⬜ |
| P-02 | Affichage question suivante | < 200ms | ⬜ |
| P-03 | Timer décompte | 60s exact | ⬜ |
| P-04 | Animations CSS | 60 fps | ⬜ |
| P-05 | Mémoire (localStorage) | < 5MB | ⬜ |

---

## 8. TESTS DE SÉCURITÉ

| ID | Test | Résultat attendu | Statut |
|----|------|------------------|--------|
| SEC-01 | XSS dans les données JSON | ✅ échappement | ⬜ |
| SEC-02 | Injection dans localStorage | ✅ validation | ⬜ |
| SEC-03 | Falsification des scores | ✅ validation côté client | ⬜ |

---

## 9. PLAN D'EXÉCUTION

### Phase 1 : Tests unitaires (Jour 11)
- [ ] Validator.js (V-01 à V-04)
- [ ] Storage.js (S-01 à S-04)
- [ ] Translate.js (T-01 à T-06)
- [ ] Quiz.js (Q-01 à Q-08)
- [ ] Timer.js (TM-01 à TM-05)
- [ ] Score.js (SC-01 à SC-05)
- [ ] Progress.js (P-01 à P-04)

### Phase 2 : Tests d'intégration (Jour 12)
- [ ] Chargement données (I-01 à I-04)
- [ ] Affichage (I-05 à I-09)
- [ ] Navigation (I-10 à I-13)
- [ ] Timer + Score (I-14 à I-16)

### Phase 3 : Tests fonctionnels (Jour 13)
- [ ] Parcours complet (F-01 à F-05)
- [ ] Changement langue (F-06 à F-09)
- [ ] Notifications (F-10 à F-14)
- [ ] Responsive (F-15 à F-18)

### Phase 4 : Tests régression & performance (Jour 14)
- [ ] Régression (R-01 à R-04)
- [ ] Performance (P-01 à P-05)
- [ ] Sécurité (SEC-01 à SEC-03)

---

## 10. CRITÈRES D'ACCEPTATION

✅ **100% des tests unitaires passent**  
✅ **100% des tests d'intégration passent**  
✅ **100% des tests fonctionnels passent**  
✅ **100% des tests de régression passent**  
✅ **100% des tests de performance passent**  
✅ **Aucune anomalie critique détectée**

---

## 11. RAPPORT DE TEST

| Phase | Statut | Taux réussite | Anomalies |
|-------|--------|---------------|-----------|
| Unitaire | ⬜ | - | - |
| Intégration | ⬜ | - | - |
| Fonctionnel | ⬜ | - | - |
| Régression | ⬜ | - | - |
| Performance | ⬜ | - | - |

**Statut global :** ⬜ NON VALIDÉ

---

## 12. SIGNATURES

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| Développeur | | | ⬜ |
| Testeur | | | ⬜ |
| Validateur | Dr MAARAK | 2026-08-04 | ⬜ |

---

**FIN DU PLAN DE TEST**