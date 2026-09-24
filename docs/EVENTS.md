# ÉVÉNEMENTS MÉTIER - ETEO V2

**Version :** 1.0  
**Date :** 04/08/2026  
**Auteur :** Dr SAID MAARAK  
**Statut :** À valider

---

## 📌 PRINCIPE

Les événements permettent une communication **découplée** entre les modules.

**Règle :** Le renderer n'écoute PAS directement les événements. C'est le Core qui pilote le renderer.

---

## 📋 LISTE DES ÉVÉNEMENTS

### 1. QUIZ_STARTED
**Émetteur :** `quiz.js`  
**Contenu :** `{ totalQuestions, timestamp }`  
**Action :** Le Core appelle `renderer.renderQuestion(question)`

---

### 2. QUESTION_CHANGED
**Émetteur :** `quiz.js`  
**Contenu :** `{ questionId, questionText, options, currentIndex, totalQuestions }`  
**Action :** Le Core appelle `renderer.renderQuestion(questionData)`

---

### 3. ANSWER_SELECTED
**Émetteur :** `quiz.js`  
**Contenu :** `{ questionId, selectedIndex, isCorrect, explanation }`  
**Action :** Le Core appelle `renderer.renderExplanation(explanation)`

---

### 4. TIMER_TICK
**Émetteur :** `timer.js`  
**Contenu :** `{ remaining, progress }`  
**Action :** Le Core appelle `renderer.renderTimer(remaining)`

---

### 5. TIME_UP
**Émetteur :** `timer.js`  
**Contenu :** `{ questionId }`  
**Action :** Le Core appelle `renderer.renderError("Temps écoulé")`

---

### 6. QUIZ_FINISHED
**Émetteur :** `quiz.js`  
**Contenu :** `{ total, correct, incorrect, timeout, percentage }`  
**Action :** Le Core appelle `renderer.renderFinalScore(result)`

---

### 7. PROGRESS_UPDATED
**Émetteur :** `progress.js`  
**Contenu :** `{ current, total, percentage }`  
**Action :** Le Core appelle `renderer.renderProgress(percentage)`

---

### 8. SCORE_UPDATED
**Émetteur :** `score.js`  
**Contenu :** `{ correct, total, percentage }`  
**Action :** Le Core appelle `renderer.renderScore(scoreData)`

---

### 9. ERROR_OCCURRED
**Émetteur :** N'importe quel module  
**Contenu :** `{ code, message, details }`  
**Action :** Le Core appelle `renderer.renderError(message)`

---

### 10. NETWORK_OFFLINE
**Émetteur :** `firebase.js` ou `storage.js`  
**Contenu :** `{ message }`  
**Action :** Le Core appelle `renderer.renderOffline()`

---

## 🏗️ FLUX DE COMMUNICATION
