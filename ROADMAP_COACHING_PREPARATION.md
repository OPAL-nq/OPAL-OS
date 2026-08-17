# 📋 Spécification & Roadmap : Module « Préparer mon Coaching » & Refonte Espace Trading

> **Statut :** Planifié pour développement futur  
> **Priorité :** Élevée (Expérience Intensive & Alignement Coach/Élève)

---

## 🎯 1. Contexte & Problématique Actuelle

### Problème identifié :
1. **Liaison incohérente dans le Dashboard Intensive :**  
   Lorsqu'un coaching 1-on-1 est programmé par Maxym depuis l'espace Admin (`/admin/intensive/`), l'élève voit sa prochaine session avec un bouton intitulé **« Préparer ma session »**. Actuellement, ce bouton redirige l'élève vers `/trading/workspace/new` (l'outil de préparation de session de trading dans l'espace Trading), ce qui est hors-sujet pour préparer un call de mentorat.
2. **Outil « Préparer ma session » dans l'Espace Trading :**  
   L'outil actuel de préparation de session dans l'espace Trading n'apporte pas suffisamment de valeur et doit être complètement repensé / remplacé.

---

## 🚀 2. Nouveau Module : « Préparer mon Coaching » (Espace OPAL Intensive)

### 🧑‍💻 A. Côté Élève (`/intensive/coaching/prepare/[sessionId]` ou modal dédiée)
Quand une session de coaching 1-on-1 est planifiée (date & heure confirmées) :
- Le bouton sur la carte de coaching devient : **« Préparer mon coaching »** (avec badge d'état : *Non rempli*, *Brouillon*, *Prêt pour le call*).
- Accès à une feuille de préparation interactive et structurée :
  1. **Points & Questions à aborder :** Liste libre des questions clés et interrogations techniques de l'élève pour le call.
  2. **Difficultés rencontrées cette semaine :**
     - Psychologie (overtrading, peur d'entrer, respect des stops, clôture prématurée).
     - Technique & Exécution (identification des zones, lecture du carnet / footprint, sessions NY AM / PM).
     - Gestion du risque & Drawdown (notamment sur comptes Prop Firms).
  3. **Trades & Graphiques à auditer :**
     - Sélection de trades enregistrés dans le Journal OPAL.
     - Upload ou collage de liens de captures d'écran (TradingView / charts CME).
     - Précision du setup et du contexte du trade.
  4. **Objectifs du call :** Ce que l'élève veut avoir résolu ou maîtrisé à la fin des 45 min de coaching.
- **Envoi / Sauvegarde :** Sauvegarde automatique en temps réel avec confirmation de réception.

---

### 👨‍🏫 B. Côté Mentor / Admin (`/admin/intensive/[clientId]`)
Dans le cockpit d'administration de Maxym :
- Visualisation directe de la **Fiche de préparation** de l'élève avant le démarrage du call.
- Points d'attention surlignés (difficultés récurrentes, trades audités).
- Possibilité d'ajouter des notes privées de préparation côté coach.
- Intégration fluide avec le compte-rendu post-session envoyé à l'élève.

---

## 🛠️ 3. Refonte de l'Outil dans l'Espace Trading (`/trading`)

### Objectif :
- Déconnecter complètement l'espace Trading de la préparation de coaching.
- Remplacer l'outil actuel « Préparer ma session » par une fonctionnalité trading à haute valeur ajoutée (ex: Checklist d'exécution pré-marché NQ/ES, matrice de biais quotidien institutionnel, ou calcul automatique des zones de liquidité clés).

---

## 💾 4. Schéma de Données Prévu (Supabase)

```sql
-- Table dédiée aux préparations de coaching
create table public.coaching_preparations (
  id uuid primary key default gen_random_uuid(),
  coaching_session_id uuid references public.coaching_sessions(id) on delete cascade,
  client_id uuid references auth.users(id) on delete cascade,
  questions text,
  difficulties text[],
  trades_to_review text[], -- URLs ou IDs de trades
  key_goals text,
  status text check (status in ('draft', 'submitted', 'reviewed')) default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

---

## 📅 5. Étapes d'Implémentation Futures
1. Création de la table `coaching_preparations` dans Supabase.
2. Création de la page/modal de préparation de coaching dans `/intensive/coaching/`.
3. Mise à jour de la carte `next-coaching-card.tsx` pour pointer vers cette préparation.
4. Ajout de la vue de consultation de la fiche de préparation dans l'espace Admin (`/admin/intensive/[clientId]`).
5. Conception et remplacement de la vue « Préparer ma session » dans `/trading`.
