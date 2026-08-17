# ⏱️ Spécification : Head-Up Display (HUD) CME & Compte à Rebours Macro

> **Statut :** Planifié pour développement  
> **Priorité :** Haute (Outil live & Cockpit de trading)  
> **Coût API / Récurrent :** **0 € (Calculs horaires JavaScript & flux économique local/statique)**

---

## 🎯 1. Contexte & Problème Résolu

### Le problème :
Pendant leur session de trading NQ/ES, les élèves basculent constamment entre leur plateforme d'exécution, ForexFactory (pour vérifier l'heure des news), et une horloge US (pour vérifier les Killzones CME 9:30, 10:00, 11:30, etc.). Ce manque de centralisation entraîne des erreurs bêtes : se faire surprendre par un chiffre CPI/FOMC à 14h30 ou 16h00, ou trader pendant le creux de liquidité du lunch (12h00 - 13h30).

### La solution apportée par OPAL OS :
Un **HUD (Head-Up Display) en temps réel**, rétractable ou détachable, affichant en permanence le temps restant avant les Killzones clés et les alertes macro-économiques majeures.

---

## 🚀 2. Fonctionnalités Clés

### A. Horloges Synchronisées Multi-Fuseaux
- **New York (EST)** : L'heure de référence pour les Futures CME.
- **Londres (GMT/BST)** : Pour le suivi de la session européenne.
- **Paris (CET)** : Heure locale de l'élève.
- Calcul précis en JavaScript avec prise en compte automatique des décalages d'heure d'été/hiver (DST US vs Europe).

---

### B. Compte à Rebours Dynamique des Killzones NQ/ES
Indicateur de statut en direct avec barre de progression temporelle :
- 🌅 **Pre-Market US (8:00 - 9:30 NY)** : *« Ouverture US dans 24m 12s »* (Zone de cadrage des niveaux).
- ⚡ **NY Open & Silver Bullet AM (9:30 - 11:30 NY)** : *« Session Active : Volume & Volatilité maximale »*.
- 🥪 **NY Lunch (12:00 - 13:30 NY)** : *« ⚠️ Attention : Zone de Chop / Faible Liquidité »*.
- 🚀 **NY PM Session (13:30 - 16:00 NY)** : *« Session Après-midi en cours »*.
- 🛑 **Market Close (16:00 - 17:00 NY)** : *« Marché CME fermé »*.

---

### C. Alertes Macro-Économiques High-Impact
- Calendrier des annonces majeures (CPI, NFP, PPI, FOMC, Fed Rate Decision, Initial Jobless Claims).
- **Système d'Alerte Visuelle :**
  - **30 min avant :** Badge Jaune ⚠️ (*« CPI à 14h30 — Attention à la volatilité »*).
  - **10 min avant :** Badge Rouge Clignotant 🔴 (*« Clôture des positions fortement recommandée »*).
- **Alerte Sonore Discrète (optionnelle)** : Bip sonore activable à 15h25 (5 min avant NY Open) et 5 min avant les news High Impact.

---

### D. Mode Mini-Cockpit / PiP (Picture-in-Picture)
- Le trader peut réduire le HUD sous forme de **bandeau compact discret** épinglable en haut de son écran ou le détacher dans une petite fenêtre pop-up pour la placer au-dessus de NinjaTrader / TradingView.

---

## 🎨 3. Composants & UI/UX

- **Emplacement :** Header global d'OPAL OS (widget compact cliquable) + Page dédiée `/trading/hud`.
- **Style Visuel :**
  - Design Glassmorphism sombre néon `#39FF14`.
  - Badges d'état animés (pulsation verte pendant la session active, pulsation rouge avant news).

---

## 💾 4. Données & Logique Technique

- **100% Client-Side :** `setInterval` React avec hooks optimisés (`useCmeTime()`, `useEconomicEvents()`).
- **Données Économiques :** Fichier JSON local hebdomadaire ou scraping d'un flux ICS open-source 0 € de ForexFactory/Investing.
