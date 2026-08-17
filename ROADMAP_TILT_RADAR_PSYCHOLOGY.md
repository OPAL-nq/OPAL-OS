# 🧠 Spécification : Tilt Radar & Analyseur Psychologique de Performance

> **Statut :** Planifié pour développement  
> **Priorité :** Haute (Amélioration continue & Mentorat Intensive)  
> **Coût API / Récurrent :** **0 € (100% logique statistique mathématique sur base Supabase)**

---

## 🎯 1. Contexte & Problème Résolu

### Le problème :
95% des pertes catastrophiques en trading ne proviennent pas d'une lacune technique, mais de **biais psychologiques destructeurs** :
1. **Revenge Trading** : Ré-entrer immédiatement après une perte pour « se refaire ».
2. **Fatigue & Overtrading** : Continuer à cliquer après 2h d'écran alors que la lucidité a chuté.
3. **Peur & Clôture Prématurée** : Couper un trade gagnant à +0.5R par anxiété et laisser courir un trade perdant à -2R.
4. **Effet Vendredi / Fin de Session** : Rendre tous les gains de la semaine sur la dernière heure.

### La solution apportée par OPAL OS :
Un algorithme interne d'analyse comportementale qui scanne les données du Journal de Trading et alerte l'élève sur ses patterns toxiques avec un **Score de Discipline Hebdomadaire**.

---

## 🚀 2. Fonctionnalités Clés

### A. Tagging Psychologique Rapide à la Clôture de Trade (3 secondes)
Lors de l'enregistrement ou de la validation d'un trade dans le journal :
- **État d'esprit** : 🧘 Calme / Confiant | ⚡ Impatient / FOMO | 😡 Frustré / Vengeance | 🥱 Fatigué.
- **Respect du Ruleset** : 🟢 100% conforme au plan | 🟡 Déviation mineure | 🔴 Trade impulsif hors plan.
- **Gestion du Stop** : ✅ Intact | ⚠️ Déplacé prématurément | ❌ Élargi / Supprimé.

---

### B. Moteur d'Insights Statistiques (« The Harsh Truth »)
L'algorithme croise automatiquement les données temporelles, émotionnelles et financières pour générer des vérités statistiques concrètes :

- **🕒 Analyse par Tranche Horaire & Session :**
  - *« Tu as un Winrate de 76% entre 15h30 et 16h45, mais il s'effondre à 29% après 17h15. »*
- **🔄 Détection du Revenge Trading :**
  - *« Tes trades pris moins de 3 minutes après une perte ont une espérance de gain négative (-1.8R moyen). »*
- **💥 Coût des Déviations de Plan :**
  - *« Ce mois-ci, tes trades 100% conformes au plan génèrent +14.2R. Tes trades hors plan t'ont coûté -9.8R. »*
- **📅 Biais du Jour de la Semaine :**
  - *« Le mardi et le jeudi sont tes jours les plus rentables. Le vendredi après-midi concentre 60% de tes pertes. »*

---

### C. Jauge « Tilt Risk Radar » en Temps Réel
Pendant la session de trading, une jauge dynamique évalue le niveau de risque psychologique :
- **Facteurs analysés** : Nombre de pertes consécutives du jour + Durée passée devant l'écran + Heure de la journée + Écarts au plan récents.
- **Statut :**
  - 🟢 **Zen & Focus** : Conditions optimales.
  - 🟡 **Vigilance Émotionnelle** : 2 pertes consécutives détectées $\rightarrow$ Pause recommandée de 15 minutes.
  - 🔴 **Zone Rouge (High Tilt Risk)** : Alerte bloquante invitant à fermer la plateforme pour la journée.

---

### D. Score de Discipline Hebdomadaire (0 à 100)
- Calculé sur la base de la rigueur d'exécution (respect du Stop, respect du Max Daily Loss, absence de Revenge trading).
- Permet à Maxym (dans le cockpit Intensive) de voir immédiatement si un élève progresse mentalement, indépendamment de la variance du marché.

---

## 🎨 3. Composants & UI/UX

- **Emplacement :** Onglet dédié dans `/trading/psychology` et rapport synthétique dans le Cockpit Intensive (`/intensive/reports`).
- **Style Visuel :**
  - Cartes d'insights avec indicateurs d'impact financier chiffrés en Multiple R.
  - Graphique radar des émotions et heatmap des heures de rentabilité.

---

## 💾 4. Données Exploité (Schéma Supabase existant + Extensions)

```sql
-- Enrichissement de la table trades pour le tracking psychologique
alter table public.trades 
add column if not exists emotional_state text check (emotional_state in ('calm', 'fomo', 'revenge', 'fatigued')),
add column if not exists plan_compliance text check (plan_compliance in ('full', 'minor_deviation', 'off_plan')),
add column if not exists stop_discipline text check (stop_discipline in ('respected', 'moved_early', 'widened_or_removed'));
```
