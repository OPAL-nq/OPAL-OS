# 🛡️ Spécification : Prop Firm Drawdown Guardian & Simulateur de Survie

> **Statut :** Planifié pour développement  
> **Priorité :** Très Haute (Sécurité des comptes & Rétention des élèves)  
> **Coût API / Récurrent :** **0 € (100% calculs côté client et logique interne)**

---

## 🎯 1. Contexte & Problème Résolu

### Le problème :
90% des traders de Futures (NQ/ES) échouent leurs évaluations de comptes financés (Apex Trader Funding, Topstep, MyFundedFutures, Bulenox, TradeDay) ou perdent leurs comptes financés (PA / Funded) non pas à cause de leur stratégie, mais à cause de :
1. **La méconnaissance des règles de Trailing Drawdown** (Trailing intra-bar vs End-of-Day / EOD).
2. **Le sur-dimensionnement de position (Overleveraging)** : Prendre trop de contrats (ex: 2 Mini NQ au lieu de 4 Micro MNQ) sur un compte à 50k, ce qui liquéfie le compte en 2 mauvais trades.
3. **La violation des règles de cohérence (Consistency Rule)** : Faire 50% de son profit sur un seul trade et voir son paiement refusé.

### La solution apportée par OPAL OS :
Un outil interactif dédié dans l'Espace Trading qui calcule au tick près la survie du compte, génère des alertes de risque en temps réel et recommande la taille exacte de position (MNQ vs NQ / MES vs ES).

---

## 🚀 2. Fonctionnalités Clés

### A. Sélecteur de Prop Firm & Profil de Compte
- **Templates préconfigurés intégrés** :
  - **Topstep** (50k, 100k, 150k — Trailing EOD, Max Loss 1000$/2000$/3000$, Daily Loss Limit).
  - **Apex Trader Funding** (25k, 50k, 100k, 150k, 300k — Trailing intraday en temps réel).
  - **MyFundedFutures (MFFU)** (Starter / Expert — Trailing EOD & Pas de Daily Loss sur certains plans).
  - **TradeDay / Bulenox / Compte Personnel (Capitaux Propres)**.
- **Mode personnalisé** : Possibilité d'entrer manuellement son solde de départ, son seuil de liquidation (Threshold), son Daily Loss Limit et sa règle de consistance.

---

### B. Calculateur Dynamique de Taille de Position (Micro vs Mini)
- **Champs d'entrée utilisateur** :
  - Instrument : `NQ` (Mini - 20$/pt / 5$/tick), `MNQ` (Micro - 2$/pt / 0.50$/tick), `ES` (Mini - 50$/pt / 12.50$/tick), `MES` (Micro - 5$/pt / 1.25$/tick).
  - Distance du Stop Loss en ticks ou en points (ex: 20 points NQ = 80 ticks).
  - Risque souhaité par trade (% du buffer restant ou montant fixe en €/$).
- **Sortie instantanée** :
  - Nombre exact de contrats recommandés.
  - Perte monétaire exacte en cas de Stop Loss (incluant les frais de commissions CME estimées).
  - R:R projeté par rapport au Take Profit.

---

### C. Jauge « Drawdown Runway » (Simulateur de Résilience)
- **Indicateur visuel interactif** :
  - **Buffer actuel disponible** avant liquidation (ex: Solde actuel: 51 200 $ | Seuil: 50 100 $ $\rightarrow$ Buffer = 1 100 $).
  - **Nombre de Stop Loss consécutifs tolérables** (ex: *« À 250 $ de risque par trade, ton compte survit à 4.4 trades perdants consécutifs »*).
  - **Zones de statut dynamique** :
    - 🟢 **Zone Sécurisée** (Buffer > 4R) : Trading normal autorisé.
    - 🟡 **Zone de Vigilance** (Buffer entre 2R et 4R) : Passage conseillé sur Micros (MNQ).
    - 🔴 **Zone Critique** (Buffer < 2R) : Alerte rouge clignotante avec recommandation stricte de réduction drastique de taille.

---

### D. Simulateur de Règle de Cohérence (Consistency Rule)
- Pour les Prop Firms exigeant qu'aucun jour ne représente plus de 30% ou 40% du gain total :
  - Calcule automatiquement le PnL maximum autorisé aujourd'hui pour valider l'évaluation ou le payout sans bloquer la règle de cohérence.

---

## 🎨 3. Composants & UI/UX

- **Emplacement :** `/trading/prop-firm-guardian` (avec widget résumé dans le Dashboard de trading).
- **Style Visuel :**
  - Cockpit sombre néon `#39FF14` avec jauges circulaires SVG.
  - Alertes visuelles instantanées (badges sonores/visuels en cas de danger de drawdown).
  - Bouton rapide *« Copier la taille de position »* ou *« Enregistrer dans le Journal »*.

---

## 💾 4. Structure de Données (Supabase)

```sql
create table public.prop_firm_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  firm_name text not null, -- 'topstep', 'apex', 'mffu', 'custom'
  account_tier text not null, -- '50k', '100k', '150k'
  starting_balance numeric not null,
  current_balance numeric not null,
  drawdown_limit numeric not null,
  max_daily_loss numeric,
  is_trailing_eod boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```
