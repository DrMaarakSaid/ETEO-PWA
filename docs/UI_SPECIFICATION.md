# SPÉCIFICATION DE L'INTERFACE UTILISATEUR - ETEO V2

**Version :** 1.1  
**Date :** 04/08/2026  
**Auteur :** Dr SAID MAARAK  
**Statut :** À valider

---

## 1. RÔLE DE `renderer.js`

`renderer.js` est le **seul module responsable de l'affichage** dans l'application ETEO V2.

Il reçoit des données des modules Core (`quiz.js`, `timer.js`, `score.js`, `progress.js`) et les affiche dans le DOM.

**Principe fondamental :** Le renderer est **PASSIF**. Il ne décide de rien. Il affiche ce qu'on lui donne.

---

## 2. CE QUE `renderer.js` FAIT

| Fonctionnalité | Description |
|----------------|-------------|
| **Afficher une question** | Affiche le texte de la question et les options (SANS la bonne réponse) |
| **Afficher le numéro de question** | Affiche "Question 3/10" |
| **Afficher la barre de progression** | Met à jour la barre de progression |
| **Afficher le timer** | Affiche le temps restant (format mm:ss) |
| **Afficher le score** | Affiche le score en temps réel (objet scoreData) |
| **Afficher l'explication** | Affiche l'explication après une réponse (reçue du Core) |
| **Afficher l'écran final** | Affiche le score final et les résultats (objet result) |
| **Afficher les notifications** | Utilise `notifications.js` pour afficher les messages |
| **Afficher l'écran de chargement** | Affiche un spinner pendant le chargement |
| **Afficher l'écran de bienvenue** | Affiche le message de bienvenue |
| **Afficher une erreur** | Affiche un message d'erreur clair |
| **Afficher le mode hors ligne** | Affiche un message "Mode hors ligne" |
| **Afficher une erreur fatale** | Affiche un écran d'erreur bloquant |

---

## 3. CE QUE `renderer.js` NE FAIT PAS

| Interdiction | Pourquoi |
|--------------|----------|
| ❌ Ne calcule jamais le score | C'est le rôle de `score.js` |
| ❌ Ne démarre jamais le timer | C'est le rôle de `timer.js` |
| ❌ Ne lit jamais Firebase | C'est le rôle de `services/firebase.js` |
| ❌ Ne modifie jamais localStorage | C'est le rôle de `services/storage.js` |
| ❌ Ne traite pas les données JSON | C'est le rôle de `validator.js` |
| ❌ Ne gère pas les traductions | Le Core envoie les textes déjà traduits |
| ❌ Ne s'abonne pas aux événements | Le Core pilote le renderer |
| ❌ Ne crée pas de HTML complexe | Utilise des templates prédéfinis |
| ❌ Ne connaît jamais la bonne réponse | Pour éviter toute triche |

---

## 4. MÉTHODES PUBLIQUES DE `renderer.js`

| Méthode | Paramètres | Description |
|---------|------------|-------------|
| `renderQuestion(questionData)` | `{ id, text, options }` | Affiche la question et les options (SANS correct) |
| `renderQuestionNumber(current, total)` | `current` (number), `total` (number) | Affiche "Question 3/10" |
| `renderProgress(percentage)` | `percentage` (number) | Met à jour la barre de progression |
| `renderTimer(remaining)` | `remaining` (number) | Affiche le temps restant |
| `renderScore(scoreData)` | `{ correct, total, percentage }` | Affiche le score |
| `renderExplanation(explanation)` | `explanation` (string) | Affiche l'explication |
| `renderFinalScore(result)` | `{ total, correct, incorrect, timeout, percentage }` | Affiche l'écran final |
| `renderWelcome()` | Aucun | Affiche l'écran de bienvenue |
| `renderLoading()` | Aucun | Affiche l'écran de chargement |
| `renderError(message)` | `message` (string) | Affiche une erreur |
| `renderOffline()` | Aucun | Affiche le mode hors ligne |
| `renderFatalError(message)` | `message` (string) | Affiche une erreur fatale |
| `clearScreen()` | Aucun | Efface l'écran |
| `showScreen(screenId)` | `screenId` (string) | Affiche un écran spécifique |
| `resetUI()` | Aucun | Réinitialise l'interface utilisateur |

---

## 5. DOM IDS OFFICIELS

| ID | Utilisation |
|----|-------------|
| `#question` | Texte de la question |
| `#options` | Conteneur des options |
| `#timer` | Affichage du timer |
| `#progress` | Barre de progression |
| `#score` | Affichage du score |
| `#explanation` | Explication de la réponse |
| `#question-number` | Numéro de la question |
| `#results` | Écran des résultats |

---

## 6. RÈGLES DE GARDE

1. **Renderer ne stocke pas d'état** → Il reçoit les données à afficher
2. **Renderer ne modifie pas les données** → Il les affiche uniquement
3. **Renderer ne connaît pas la bonne réponse** → Pour éviter la triche
4. **Renderer n'accède pas directement aux données** → Il reçoit les données en paramètres
5. **Renderer utilise des templates** → Pas de `innerHTML` direct
6. **Renderer est passif** → Le Core le pilote, il ne s'abonne pas aux événements

---

## 7. VALIDATION

| Critère | Statut |
|---------|--------|
| API définie | ⬜ |
| Responsabilités claires | ⬜ |
| Pas de dépendance inverse | ⬜ |
| Renderer ne connaît pas correct | ⬜ |
| Méthodes avec objets | ⬜ |

---

**Document créé le :** 04/08/2026
**Dernière mise à jour :** 04/08/2026
**Auteur :** Dr SAID MAARAK - CTO ETEO V2