# ⚡ Spécification : Importateur Universel de Trades CSV (NinjaTrader, Tradovate, TopstepX, Quantower)

> **Statut :** Planifié pour développement  
> **Priorité :** Très Haute (Supprime la friction de saisie du Journal)  
> **Coût API / Récurrent :** **0 € (Parser 100% JavaScript côté client via PapaParse)**

---

## 🎯 1. Contexte & Problème Résolu

### Le problème :
Remplir manuellement chaque trade dans un journal prend 2 à 3 minutes par position (prix d'entrée, de sortie, heure, nombre de contrats, points/ticks, PnL). Beaucoup de traders abandonnent leur journal après quelques jours à cause de cette lourdeur administrative.

### La solution apportée par OPAL OS :
Un **importateur universel par Glisser-Déposer**. En 2 secondes, l'élève dépose le fichier CSV exporté depuis sa plateforme de trading, et tous les trades de la session sont automatiquement reconstitués, enrichis et enregistrés dans le Journal OPAL.

---

## 🚀 2. Fonctionnalités Clés

### A. Auto-Détection du Format & Plateformes Supportées
Le parser identifie automatiquement la structure du fichier CSV :
1. **NinjaTrader 8** (Account Executions / Trade Performance CSV).
2. **Tradovate / NinjaTrader Web** (Orders / Fills CSV).
3. **TopstepX** (Trade Log export).
4. **Quantower / Rithmic** (Order History CSV).
5. **TradingView** (Paper trading / Broker log export).

---

### B. Algorithme de Reconstitution FIFO / Netting
- Regroupement automatique des ordres d'achat (Buy) et de vente (Sell) correspondants.
- Calcul précis :
  - Instrument (`NQ`, `MNQ`, `ES`, `MES`).
  - Direction (`Long` / `Short`).
  - Prix moyen d'entrée & Prix moyen de sortie.
  - Heure exacte d'ouverture & de clôture (durée du trade en minutes/secondes).
  - PnL brut et net.
  - Multiple R (si le Stop Loss initial est renseigné ou calculé selon le risque standard).

---

### C. Écran de Validation & Attribution Rapide des Setups
Avant l'enregistrement final, l'élève voit un tableau récapitulatif où il peut en 1 clic :
- Cocher les trades à importer.
- Assigner d'un clic le setup OPAL utilisé (*Sweep de Liquidité*, *Silver Bullet*, *FVG Continuation*).
- Ajouter son ressenti psychologique (Zen, Fomo, etc.).
- Valider l'importation en masse.

---

## 🎨 3. Composants & UI/UX

- **Emplacement :** `/trading/journal/import` et bouton rapide sur `/trading/journal`.
- **Interface :**
  - Zone de Drag & Drop stylisée aux couleurs d'OPAL avec icônes de plateformes reconnues.
  - Prévisualisation instantanée avec badges de gains (vert) et pertes (rouge).

---

## 💾 4. Architecture Technique

- **Librairie :** `papaparse` (léger, ultra-rapide, exécution dans le navigateur).
- **Insertion Supabase :** Appel unique de batch insert `supabase.from('trades').insert(parsedTrades)`.
