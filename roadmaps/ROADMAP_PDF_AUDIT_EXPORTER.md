# 📄 Spécification : Générateur de Rapport d'Audit Institutionnel (Export PDF HD)

> **Statut :** Planifié pour développement  
> **Priorité :** Haute (Prestige, Certification Intensive & Relation Investisseurs)  
> **Coût API / Récurrent :** **0 € (Génération PDF 100% côté client via jsPDF / html2canvas)**

---

## 🎯 1. Contexte & Problème Résolu

### Le problème :
Dans l'accompagnement **OPAL Intensive** (1 998 €), les élèves veulent pouvoir prouver leurs progrès, archiver leurs bilans mensuels ou présenter un dossier sérieux à des prop firms ou investisseurs privés. Un simple tableau sur un écran n'a pas le même impact qu'un document d'audit officiel.

### La solution apportée par OPAL OS :
Un générateur de **Rapport d'Audit PDF Institutionnel** de 3 à 5 pages, avec design premium de Hedge Fund, graphiques vectoriels nets, statistiques d'exécution détaillées et encart de validation du coach Maxym.

---

## 🚀 2. Contenu du Rapport PDF

### 1. Page de Garde Prestige
- Logo officiel OPAL OS & Label **« OPAL Intensive — Institutional Trading Audit »**.
- Nom / Pseudo de l'élève, période auditée (ex: *Juillet 2026* ou *Trimestre Q3*).
- Numéro d'audit unique généré automatiquement (ex: `OPAL-AUDIT-2026-0841`).

### 2. Synthèse Exécutive (Key Performance Indicators)
- **PnL Total & Performance en R** (ex: `+28.4R`).
- **Profit Factor** (ex: `2.45`).
- **Winrate Global & Winrate par Setup**.
- **Max Drawdown historique** en R et en %.
- **Ratio Gain Moyen / Perte Moyenne (Risk-to-Reward réalisé)**.

### 3. Courbe d'Équité & Analyse du Drawdown
- Graphique haute résolution de l'évolution du capital trade par trade.
- Diagramme en chandeliers ou barres montrant les gains/pertes quotidiens.

### 4. Matrice de Rigueur & Respect du Ruleset
- Taux de conformité au Ruleset OPAL (ex: *94% des trades conformes au plan*).
- Répartition horaire des performances (Session NY AM vs PM).
- Analyse de la gestion du risque (absence d'overleveraging).

### 5. Signature & Validation Mentor
- Encart officiel de validation : *« Audit validé par Maxym — Fondateur OPAL »*.
- Zone de commentaires et objectifs pour le mois suivant.

---

## 🎨 3. Personnalisation & Paramètres d'Export

Avant de générer le PDF, l'élève / le coach peut configurer :
- **Période :** 7 derniers jours / Mois en cours / Tout l'historique / Plage de dates sur-mesure.
- **Masquage des montants ($/€)** : Possibilité d'afficher uniquement les Multiples R et pourcentages pour garder la confidentialité financière.
- **Sélection des comptes** : Filtrer sur un compte Prop Firm ou un compte personnel spécifique.

---

## 💾 4. Stack Technique & Exécution Zéro Coût

- **Librairie :** `jspdf` + `jspdf-autotable` ou `@react-pdf/renderer`.
- **Rendu :** 100% exécuté dans le navigateur du client, téléchargement instantané du fichier `.pdf`.
