# 🧮 Spécification : Simulateur Monte-Carlo & Scaling Plan de Capital

> **Statut :** Planifié pour développement  
> **Priorité :** Moyenne-Haute (Psychologie, Espérance mathématique & Projection)  
> **Coût API / Récurrent :** **0 € (1 000 itérations mathématiques pures en JavaScript côté client)**

---

## 🎯 1. Contexte & Problème Résolu

### Le problème :
Beaucoup d'élèves tombent dans le piège de l'impatience : après 3 jours de pertes, ils doutent de leur stratégie ; après 3 jours de gains, ils doublent leurs lots de manière inconsidérée. Ils n'ont pas une compréhension statistique des séries de pertes aléatoires (variance) inhérentes au trading de Futures.

### La solution apportée par OPAL OS :
Un **simulateur statistique de Monte-Carlo** qui exécute 1 000 scénarios futurs aléatoires basés sur les vraies statistiques du trader (Winrate, R:R moyen, nombre de trades/mois), couplé à un **Plan de Scaling de Contrats (Paliers de Lots)** pour passer progressivement des Micro MNQ aux Mini NQ sans exploser son risque.

---

## 🚀 2. Fonctionnalités Clés

### A. Moteur de Simulation Monte-Carlo (1 000 Simulations en 100 ms)
- **Données d'entrée (auto-remplies depuis le Journal ou saisie libre) :**
  - Capital de départ (ex: 50 000 $).
  - Winrate historique (ex: 55%).
  - Gain moyen par trade gagnant (ex: +2.2R).
  - Perte moyenne par trade perdant (ex: -1.0R).
  - Nombre de trades projetés (ex: 100 prochains trades).
- **Sortie statistique visuelle :**
  - **Faisceau de 1 000 courbes d'équité superposées**.
  - **Pire série de pertes consécutives estimée à 95% de confiance** (ex: *« Tu dois t'attendre à subir statistiquement une série de 6 pertes d'affilée à un moment donné »*).
  - **Espérance de gain à terme** (Médiane, 90e percentile, 10e percentile).

---

### B. Planificateur de Scaling de Contrats (Paliers de Lots NQ/ES)
- Définition d'un risque fixe par trade (ex: 1% du capital ou 250 $ max).
- **Tableau de progression mathématique automatique :**
  - *Étape 1 (0 $ à 2 500 $ de buffer) :* 2 Micro contrats MNQ.
  - *Étape 2 (2 500 $ à 5 000 $ de buffer) :* 5 Micro contrats MNQ.
  - *Étape 3 (5 000 $ à 10 000 $ de buffer) :* 1 Mini contrat NQ.
  - *Étape 4 (> 10 000 $ de buffer) :* 2 Mini contrats NQ.
- **Règle de désescalade automatique (De-scaling) :**
  - Indique précisément le niveau de repli où repasser aux Micros si le capital recule, évitant ainsi la destruction du compte en phase de drawdown.

---

## 🎨 3. Composants & UI/UX

- **Emplacement :** `/trading/scaling-planner`.
- **Graphiques :** Rendu Canvas / Recharts ultra-fluide avec curseur interactif.

---

## 💾 4. Architecture Technique

- 100% logique mathématique en TypeScript (`monteCarloEngine.ts`). Aucun serveur, zéro temps de latence, zéro coût.
