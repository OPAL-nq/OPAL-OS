# 📜 Spécification : Charte d'Engagement & Contrat de Trading Professionnel

> **Statut :** Planifié pour développement  
> **Priorité :** Moyenne-Haute (Psychologie, Rigueur & Suivi Mentorat Intensive)  
> **Coût API / Récurrent :** **0 € (Formulaire interactif, signature Canvas & base Supabase)**

---

## 🎯 1. Contexte & Problème Résolu

### Le problème :
Dans le trading, la plupart des erreurs proviennent du fait que le trader n'a pas de supérieur hiérarchique pour lui dire « stop ». Les règles restent vagues et théoriques, et finissent par voler en éclats dès la première frustration.

### La solution apportée par OPAL OS :
Un **Contrat d'Exécution Officiel (Trader Operating Agreement)** formalisé dans l'application, signé numériquement par l'élève et co-signé par Maxym dans le cadre du mentorat OPAL Intensive.

---

## 🚀 2. Fonctionnalités Clés

### A. Constructeur de Contrat Interactif (Step-by-Step)
L'élève définit ses 5 commandements infranchissables :
1. **Risque Maximum Autorisé :** Perte max par jour ($ ou R) et perte max par trade.
2. **Nombre de Trades Max par Session :** (ex: 2 trades max sur la session NY AM).
3. **Périmètre d'Instruments & Horaires :** Uniquement NQ/MNQ entre 15h30 et 17h30.
4. **Setups Autorisés :** Sélection parmi les setups validés du catalogue OPAL Systems.
5. **Protocole en cas de Perte :** Obligation de fermer la plateforme après 2 pertes consécutives.

---

### B. Signature Électronique Intégrée (Canvas)
- L'élève signe directement à la souris ou au doigt sur son écran.
- Le coach Maxym valide et co-signe le contrat dans l'espace Admin.
- Génération d'une **version officielle scellée** horodatée avec statut *« Contrat Actif »*.

---

### C. Surveillance Automatique du Contrat & Système de Breaches
Quand l'élève enregistre ses trades dans son Journal :
- Le système vérifie la conformité avec le contrat signé.
- En cas de violation flagrante (ex: 4 trades pris au lieu de 2, ou perte journalière dépassée) :
  - Le contrat passe en statut **« ⚠️ Breach Détecté »**.
  - Déclenche automatiquement un formulaire d'auto-analyse obligatoire avant de pouvoir reprendre le trading.
  - Notification visible dans le Cockpit Intensive de Maxym pour en discuter lors du prochain coaching.

---

## 🎨 3. Composants & UI/UX

- **Emplacement :** `/intensive/contract` (pour les élèves Intensive) et `/trading/contract`.
- **Visuel :** Rendu parchemin moderne / certificat institutionnel sombre avec sceau doré ou néon OPAL.

---

## 💾 4. Structure de Données (Supabase)

```sql
create table public.trader_contracts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  max_daily_loss numeric not null,
  max_trades_per_day integer not null,
  allowed_instruments text[] not null,
  allowed_setups text[] not null,
  trading_hours_start time not null,
  trading_hours_end time not null,
  signature_data_url text, -- Base64 SVG/PNG de la signature
  coach_signature_data_url text,
  is_active boolean default true,
  signed_at timestamptz default now()
);
```
