# 🕹️ Spécification : Playbook Interactive Chart Simulator (Entraînement Sans API)

> **Statut :** Planifié pour développement  
> **Priorité :** Haute (Pédagogie active & Rétention de l'Academy)  
> **Coût API / Récurrent :** **0 € (Utilisation de TradingView Lightweight Charts - Open Source & Données locales JSON)**

---

## 🎯 1. Contexte & Problème Résolu

### Le problème :
Regarder des vidéos de cours dans l'Academy est passif. Les élèves ont l'impression de comprendre les concepts (FVG, sweeps de liquidité, order blocks), mais bloquent dès qu'ils se retrouvent seuls devant un graphique live qui défile.

### La solution apportée par OPAL OS :
Un module d'entraînement interactif **« Bar-by-Bar Replay »** où l'élève s'entraîne sur des cas réels enregistrés par Maxym. Le graphique avance bougie par bougie : l'élève doit identifier le setup, placer son entrée / Stop Loss / Take Profit, et exécuter la décision.

---

## 🚀 2. Fonctionnalités Clés

### A. Moteur Graphique Open Source (TradingView Lightweight Charts)
- Intégration de la librairie officielle open-source et 100% gratuite `lightweight-charts`.
- Fluidité maximale (60 FPS), zoom, pan, chandeliers japonais NQ / ES.
- Mode Dark Glassmorphism conforme au design system OPAL.

---

### B. Mode Exercice Étape par Étape (Quiz Interactif de Chart)
1. **Étape 1 : Analyse de Contexte (HTF)**
   - L'élève observe le graphique figé à 15h25 (avant l'ouverture US).
   - Question interactive : *« Quel est le biais institutionnel de la session ? (Bullish / Bearish / Range) »*.
2. **Étape 2 : Avance Bougie par Bougie (Touche Espace ou Bouton Suivant)**
   - Le graphique dévoile les bougies 1 minute par 1 minute.
3. **Étape 3 : Prise de Décision (Boutons d'Action)**
   - Boutons clairs : `🟢 BUY MARKET` | `🔴 SELL MARKET` | `⏳ NE RIEN FAIRE`.
   - Si l'élève clique sur Entrée, il positionne visuellement son Stop Loss et son Target R:R sur le graphique.
4. **Étape 4 : Déroulement & Débriefing Immédiat**
   - Le reste de la session se déroule automatiquement jusqu'au TP ou SL.
   - **Rapport de correction immédiat :**
     - Note de conformité avec la méthode OPAL (ex: *« Excellent timing d'entrée sur le FVG 1m après sweep du PMH »* ou *« Erreur : Entrée prématurée sans confirmation de shift de structure »*).
     - R:R obtenu.

---

### C. Bibliothèque de Scénarios Classés par Setups
Les scénarios sont stockés sous forme de simples fichiers JSON (historiques de chandeliers OHLCV d'une session de 2h sur NQ/ES) créés ou validés par Maxym :
- **Pack 1 :** Les Sweeps de Liquidité à l'Open NY (9h30).
- **Pack 2 :** Les Reversals sur Killzone Silver Bullet (10h00 - 11h00).
- **Pack 3 :** Traiter les pièges de Range et News High-Impact.

---

### D. Scoring & Classement d'Entraînement
- **Précision d'exécution** (% de setups correctement identifiés).
- **Multiple R cumulé sur le simulateur**.
- Déblocage de certificats de maîtrise des setups OPAL.

---

## 🎨 3. Stack Technique & Zéro Coût Serveur

- **Librairie Graphique :** `lightweight-charts` (0 ko de coût API, 0 abonnement).
- **Stockage des Données :** Table Supabase `chart_scenarios` contenant les tableaux OHLCV compressés ou fichiers JSON statiques dans le dossier public.

---

## 💾 4. Structure de Données (Supabase)

```sql
create table public.chart_scenarios (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  difficulty text check (difficulty in ('beginner', 'intermediate', 'advanced')),
  setup_type text not null, -- 'liquidity_sweep', 'silver_bullet', 'trend_continuation'
  candle_data jsonb not null, -- Array of { time, open, high, low, close, volume }
  correct_entry_time bigint,
  correct_direction text check (correct_direction in ('long', 'short', 'no_trade')),
  ideal_sl numeric,
  ideal_tp numeric,
  explanation_notes text,
  created_at timestamptz default now()
);
```
