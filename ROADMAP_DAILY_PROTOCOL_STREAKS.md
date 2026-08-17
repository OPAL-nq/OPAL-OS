# 🔥 Spécification : Protocole Quotidien & Système de "Streaks" (Gamification de la Discipline)

> **Statut :** Planifié pour développement  
> **Priorité :** Moyenne-Haute (Rétention quotidienne, Rigueur & Cohésion de groupe)  
> **Coût API / Récurrent :** **0 € (100% logique interne Supabase & Client)**

---

## 🎯 1. Contexte & Problème Résolu

### Le problème :
La rentabilité en trading est le résultat direct de la **régularité d'une routine stricte**. Cependant, beaucoup d'élèves se connectent uniquement les jours où ils tradent, bâclent leur préparation pré-marché ou oublient de journaliser leurs trades après la clôture de session.

### La solution apportée par OPAL OS :
Un **Protocole Quotidien Interactif** structuré avec un **compteur de séries consécutives (Streaks)** et des badges de rigueur qui récompensent la discipline plutôt que le résultat financier aléatoire d'un seul jour.

---

## 🚀 2. Fonctionnalités Clés

### A. Le « Daily Protocol » en 4 Étapes Rapides
Chaque jour de bourse (Lundi au Vendredi), l'élève a une barre de progression interactive :

1. **🌅 1. Routine Pré-Marché (avant 15h30)** :
   - [ ] Vérification du calendrier économique (ForexFactory / High impact news).
   - [ ] Niveaux clés institutionnels tracés (PDH/PDL, PMH/PML).
   - [ ] Max Loss de la journée fixée.
2. **⚡ 2. Session de Trading (15h30 - 17h30)** :
   - [ ] Respect strict du nombre max de trades autorisés (ex: Max 2 trades).
   - [ ] Pas de revenge trading.
3. **📖 3. Debrief & Journalisation (après 17h30)** :
   - [ ] Trades saisis ou importés dans le Journal OPAL.
   - [ ] Émotion et respect du plan renseignés.
4. **🧘 4. Clôture Mentale** :
   - [ ] Écran fermé et validation de la fin de journée.

---

### B. Système de Séries Consécutives (« Discipline Streaks » 🔥)
- **Le concept :** Si l'élève complète son protocole quotidien et respecte sa Max Daily Loss, sa série augmente de +1 jour.
- **Flamme active :** Affichage d'un badge dynamique dans la TopBar et la Sidebar (ex: `🔥 14 jours de discipline`).
- **Protection de Streak (Weekend Freeze) :** La série ne se brise pas le samedi/dimanche ni les jours fériés CME.
- **Règle d'or :** Un jour où le marché n'offre aucun setup valide et où l'élève choisit de **ne pas trader** valide quand même son protocole avec mention spéciale *« Perfect Patience Day »*.

---

### C. Badges & Niveaux de Maîtrise Déblocables
Des distinctions visuelles prestigieuses affichées sur le profil de l'élève :
- 🛡️ **Iron Shield** : 5 jours consécutifs sans jamais dépasser sa Max Loss.
- 🎯 **Sniper Execution** : 10 trades d'affilée avec respect à 100% du Ruleset.
- 🔥 **Discipline Titan (30 Days)** : 30 jours de protocole quotidien validés.
- 🧘 **Zen Master** : 0 épisode de Revenge Trading détecté sur un mois complet.

---

### D. Classement de Rigueur dans la Communauté (Discipline Leaderboard)
- Dans l'espace Communauté / Leaderboard :
  - **Ce n'est PAS un classement de PnL en euros** (ce qui pousse au sur-risque).
  - C'est un classement de **Régularité & Respect des Règles** (qui valorise les meilleurs comportements professionnels).

---

## 🎨 3. Composants & UI/UX

- **Emplacement :** Widget interactif sur le Dashboard principal (`/dashboard`), onglet dédié `/trading/protocol` et widget streak dans la barre supérieure.
- **Style Visuel :**
  - Carte néon avec checkboxes interactives animées (micro-animations haptiques/sonores discrètes).
  - Flamme animée en CSS pur avec compteur de jours.

---

## 💾 4. Structure de Données (Supabase)

```sql
create table public.daily_protocols (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  protocol_date date not null,
  pre_market_done boolean default false,
  rules_respected boolean default false,
  journaling_done boolean default false,
  no_overtrading boolean default false,
  is_completed boolean default false,
  created_at timestamptz default now(),
  unique(user_id, protocol_date)
);

create table public.user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_completed_date date,
  updated_at timestamptz default now()
);
```
