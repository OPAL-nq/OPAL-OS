# 🎨 Spécification : Trading Cards & Proof-of-Trade Generator (Moteur Viral)

> **Statut :** Planifié pour développement  
> **Priorité :** Moyenne-Haute (Viralité organique, Fierté élève & Partage communautaire)  
> **Coût API / Récurrent :** **0 € (Génération 100% côté client via Canvas HTML5 / html-to-image)**

---

## 🎯 1. Contexte & Problème Résolu

### Le problème :
Les traders adorent partager leurs réussites (bons trades, bilans hebdomadaires, validation de Prop Firms) sur Twitter/X, Instagram Stories, TikTok et Discord. Actuellement, ils font des captures d'écran brutes souvent moches ou incomplètes sur TradingView/NinjaTrader, sans valoriser l'écosystème OPAL.

### La solution apportée par OPAL OS :
Un générateur instantané de **« Trading Cards » haute définition**, ultra-stylisées, personnalisables et brandées OPAL OS, prêtes à être partagées en 1 clic.

---

## 🚀 2. Fonctionnalités Clés

### A. Génération en 1 Clic depuis le Journal de Trading
Sur chaque fiche de trade dans `/trading/journal/[tradeId]` :
- Bouton : **« Exporter la Trading Card » ⚡**
- Ouvre un studio de prévisualisation interactif en temps réel.

---

### B. Données Automatiquement Remplies
- **En-tête :** Logo OPAL OS + Badge de l'élève (`OPAL Intensive` ou `OPAL OS`).
- **Métriques du Trade :**
  - Actif (`NQ Futures` / `ES Futures`).
  - Direction (`LONG` 🟢 ou `SHORT` 🔴).
  - Multiple R réalisé (`+3.8R` / `+2.4R`).
  - PnL en points / ticks ou monétaire (optionnel : floutage possible du montant en $ pour ne garder que le R:R).
  - Setup utilisé (ex: *Liquidity Sweep + 1m FVG*, *NY Open Judas Swing*).
  - Durée du trade et heure d'exécution.
- **Visuel du Chart :** Capture intégrée du graphique annoté.
- **Signature :** Pseudo du trader + *« Executed via OPAL OS »*.

---

### C. Studio de Personnalisation & Thèmes
L'élève peut choisir parmi 3 thèmes esthétiques exclusifs :
1. **Cyber Stealth (Défaut OPAL) :** Fond noir carbone `#0A0A0A`, reflets verre sombre, accents néon vert `#39FF14`.
2. **Midnight Indigo :** Teintes bleu nuit institutionnel, reflets cyan `#00F0FF`.
3. **Gold Titan :** Édition prestigieuse avec liserés dorés `#FFD700` pour les gros R (ex: trades > 5R ou validation Prop Firm).

- **Formats d'exportation disponibles :**
  - 📱 **Format Story / Vertical (9:16 - 1080x1920)** : Pour Instagram Stories, TikTok, Reels.
  - 🖥️ **Format Carré / Post (1:1 - 1080x1080)** : Pour Twitter/X, Discord, Salons Communauté OPAL.

---

### D. Export Instantané & Partage Direct
- **Télécharger l'image PNG HD** (génération instantanée dans le navigateur).
- **Copier l'image dans le presse-papier** (pour coller directement dans Discord / Telegram).
- **Bouton « Partager dans la Communauté OPAL »** (publie automatiquement la carte dans le salon `#trades-du-jour`).

---

## 🎨 3. Stack Technique & Exécution Zéro Coût

- **Librairie recommandée :** `html-to-image` ou Canvas natif HTML5 (léger, rapide, 100% offline).
- **Performance :** Moins de 200 ms pour générer le rendu HD.
- **Sécurité & Confidentialité :** Aucune donnée sensible n'est transmise à un serveur tiers, tout reste dans le navigateur du membre.

---

## 📅 4. Étapes d'Implémentation
1. Création du composant template visuel `TradingCardPreview.tsx`.
2. Intégration du modal d'export sur la page `/trading/journal/[tradeId]`.
3. Implémentation du sélecteur de format (Story 9:16 vs Post 1:1) et de thèmes.
4. Boutons d'export (Téléchargement PNG + Copie presse-papier).
