OPAL — Product & Technical Context

1. Vision du projet

OPAL est une plateforme propriétaire destinée aux traders.

L'objectif n'est pas de créer simplement une plateforme de formation, mais un Trading OS qui centralise progressivement :

* la formation OPAL
* la préparation et le suivi du trading
* le journal de trading
* les outils OPAL
* la communauté
* les lives et leurs replays
* l'accompagnement OPAL Intensive

OPAL doit devenir le point central de l'expérience utilisateur.

L'utilisateur ne doit progressivement plus avoir besoin de Discord, Whop ou d'autres plateformes externes pour utiliser OPAL.

La plateforme doit être :

* premium
* moderne
* rapide
* simple
* sombre
* professionnelle
* centrée sur l'expérience utilisateur
* facilement administrable
* scalable

⸻

2. Philosophie produit

Le principe fondamental :

Ne pas construire une usine à gaz.

OPAL V1 doit être volontairement simple.

Chaque fonctionnalité doit répondre à un besoin réel du trader.

Nous ne voulons PAS construire au départ :

* IA
* AI Coach
* agents
* workflows IA
* automatisations complexes
* n8n
* Make
* Zapier
* microservices inutiles
* gamification complexe
* fonctionnalités gadgets

Le projet doit privilégier :

simplicité → fiabilité → expérience utilisateur → évolutivité

avant la sophistication.

⸻

3. Offres OPAL

OPAL Community

Prix : 59 €/mois

Offre autonome et scalable.

Elle donne accès à :

* OPAL Academy
* OPAL Trading
* OPAL Systems
* OPAL Community
* OPAL Live
* coaching collectif / masterclasses
* ressources OPAL

Le membre Community n'a pas accès à l'espace personnel OPAL Intensive.

Il voit cependant la catégorie OPAL Intensive dans la navigation avec un cadenas.

⸻

OPAL Intensive

Prix : 1 998 €

L'offre Intensive comprend tout OPAL Community avec une couche supplémentaire d'accompagnement individuel.

Inclus :

* tout OPAL Community
* 2 coachings privés par semaine
* calendrier des coachings
* suivi personnalisé
* objectifs personnalisés
* comptes-rendus de coaching
* ressources personnalisées
* historique de l'accompagnement

À terme, le système doit permettre d'attribuer un client Intensive à un coach.

Exemple :

User
├── plan: intensive
└── coach_id: coach_02

Cela permettra de scaler l'accompagnement avec plusieurs coachs.

⸻

4. Navigation utilisateur

La navigation principale doit rester très simple.

OPAL
├── Dashboard
├── Academy
├── Trading
├── Systems
├── Community
├── Live
└── Intensive

Il n'y a PAS de catégorie News.

Il n'y a PAS de catégorie IA.

⸻

5. Dashboard

Le Dashboard est la page d'accueil après connexion.

Il doit répondre rapidement à trois questions :

1. Où j'en suis ?
2. Qu'est-ce que je dois faire maintenant ?
3. Qu'est-ce qui arrive ?

Le Dashboard peut afficher :

* progression Academy
* état de la préparation Trading
* statistiques rapides du Journal
* prochain Live
* prochaine Masterclass
* pour Intensive : prochain coaching
* pour Intensive : résumé du suivi actuel

Le Dashboard doit rester visuellement simple.

Il ne doit pas devenir un tableau de bord surchargé.

⸻

6. Academy

Academy est le centre de formation OPAL.

Structure :

Academy
│
├── Module 0
│   ├── Lesson
│   ├── Lesson
│   └── Lesson
│
├── Module 1
│   ├── Lesson
│   ├── Lesson
│   └── Resources
│
├── Module 2
│   └── ...
│
└── Case Lab

Chaque lesson peut contenir :

* titre
* description
* vidéo
* miniature
* ressources
* fichiers
* ordre
* statut publié / brouillon

Vidéos V1

Les vidéos seront hébergées sur YouTube en non répertorié.

OPAL ne stocke donc pas les fichiers vidéo.

La base stocke simplement :

title
description
thumbnail_url
video_url
module_id
position
published

La plateforme affiche une miniature de la vidéo et permet à l'utilisateur de cliquer pour regarder.

Important :

YouTube non répertorié n'est pas une protection absolue. Toute personne possédant l'URL peut potentiellement partager la vidéo.

Cette solution est volontairement choisie pour le MVP afin de ne pas payer d'infrastructure vidéo.

À terme, le système doit être suffisamment abstrait pour pouvoir remplacer YouTube par Vimeo, Mux ou une autre solution sans reconstruire l'Academy.

⸻

7. Trading

Trading regroupe également le Journal.

Structure :

Trading
│
├── Workspace
├── Journal
├── Mes trades
└── Statistiques

Workspace

Le Workspace permet de préparer une session de trading selon le framework OPAL.

Le framework OPAL repose notamment sur :

* Volume Profile
* VWAP
* structure
* liquidité
* EPA / IPA
* displacement
* iFVG
* BPR
* scénarios
* gestion du risque
* décision

L'objectif n'est PAS de créer un système automatique de signaux.

Le but est de digitaliser le processus de décision.

Le trader doit pouvoir arriver à une décision :

EXECUTE
WAIT
ABSTAIN

⸻

8. Journal

Le Journal permet d'enregistrer les trades.

Un trade peut contenir :

instrument
direction
entry
stop
target
risk
result
R_multiple
screenshot
context
entry_reason
plan_followed
emotion
notes
created_at

Les statistiques doivent être calculées automatiquement.

Exemples :

* nombre de trades
* win rate
* P&L
* R moyen
* drawdown
* performance par instrument
* performance par session
* performance par jour

Pas d'analyse IA en V1.

⸻

9. Systems

Systems est la toolbox OPAL.

Elle peut contenir :

Risk Calculator
Position Size Calculator
R:R Calculator
Prop Firm Calculator
Risk Policy
Templates
Resources

Les outils doivent être simples, rapides et cohérents visuellement avec le reste de la plateforme.

⸻

10. Community

Community est la communauté intégrée à OPAL.

Elle doit progressivement permettre de remplacer Discord.

Sections possibles :

General
Market Analysis
NQ
ES
Questions
Journal
Wins
Announcements

Le système doit rester simple.

OPAL n'a pas pour objectif de devenir un réseau social généraliste.

La communauté doit rester centrée sur le trading et la progression des membres.

⸻

11. Live

Live est l'espace dédié aux :

* live trading
* masterclasses
* sessions collectives
* replays

Live streaming

Les lives doivent pouvoir être regardés directement depuis OPAL.

L'utilisateur ne doit idéalement pas être obligé de quitter OPAL pour regarder un live.

Architecture souhaitée :

OPAL
  ↓
Live Video Provider
  ↓
Live Stream
  ↓
Recording
  ↓
Replay

Un service spécialisé pourra être utilisé pour le streaming et l'enregistrement.

Exemple possible : Mux.

Pour le MVP, une solution encore plus simple comme YouTube Live peut éventuellement être utilisée si nécessaire.

Replay

Une fois le live terminé :

LIVE
 ↓
RECORDING
 ↓
REPLAY

Le replay doit ensuite apparaître dans :

Live
└── Replays

L'objectif est de minimiser au maximum les manipulations manuelles.

⸻

12. OPAL Intensive

Cette section dépend des permissions utilisateur.

Community

La catégorie est visible mais verrouillée :

🔒 OPAL Intensive

En cliquant dessus, l'utilisateur arrive sur une page présentant :

* l'accompagnement individuel
* 2 coachings privés par semaine
* suivi personnalisé
* objectifs
* comptes-rendus
* calendrier de coaching

CTA :

CONTACTER MAXYM

Cette page doit être informative et élégante, pas agressive.

⸻

Intensive

Pour les utilisateurs Intensive, la section est débloquée.

OPAL Intensive
├── Coaching
├── Mon suivi
├── Mes objectifs
└── Comptes-rendus

Coaching

Afficher :

* prochains coachings
* date
* heure
* type de coaching
* historique

Exemple :

Lundi 17 août
19:00
Coaching privé
Jeudi 20 août
19:00
Coaching privé

Mon suivi

Contenu modifiable par l'Admin :

* objectif actuel
* points travaillés
* erreurs à corriger
* progression
* prochaine étape

Comptes-rendus

Après chaque coaching :

* notes
* points importants
* travail à effectuer
* prochaine étape

⸻

13. Système de comptes

Chaque utilisateur possède un seul compte OPAL.

Exemple :

User
├── id
├── name
├── email
├── plan
├── status
├── created_at
└── ...

Plans :

community
intensive

Statuts :

active
inactive
cancelled

L'interface et les permissions doivent dépendre du plan.

⸻

14. Permissions

Community :

Dashboard       YES
Academy         YES
Trading         YES
Systems         YES
Community       YES
Live            YES
Intensive       LOCKED

Intensive :

Dashboard       YES
Academy         YES
Trading         YES
Systems         YES
Community       YES
Live            YES
Intensive       YES

Les permissions importantes doivent être vérifiées côté serveur / backend.

Ne jamais faire confiance uniquement au frontend pour sécuriser l'accès aux données.

Un utilisateur Community ne doit jamais pouvoir accéder directement aux données privées d'un utilisateur Intensive simplement en modifiant une URL.

⸻

15. Admin

Il existe une interface Admin séparée.

OPAL ADMIN
├── Dashboard
├── Academy
├── Users
├── Live
├── Intensive
└── Settings

Academy Admin

L'Admin peut :

* créer des modules
* créer des lessons
* ajouter une vidéo
* ajouter une URL YouTube
* ajouter une miniature
* ajouter une description
* ajouter des ressources
* modifier l'ordre
* publier
* dépublier

L'objectif est de pouvoir gérer l'Academy sans modifier le code.

⸻

16. Users Admin

L'Admin peut voir :

Name
Email
Plan
Status
Academy Progress
Last Login

En cliquant sur un utilisateur :

* profil
* plan
* statut
* progression
* données pertinentes

L'Admin doit pouvoir gérer les accès selon les permissions prévues.

⸻

17. Intensive Admin

L'Admin doit pouvoir :

* voir les clients Intensive
* attribuer un coach
* programmer un coaching
* modifier un coaching
* écrire un compte-rendu
* définir un objectif
* modifier le suivi
* ajouter des ressources

Architecture future :

Client
 ↓
Coach
 ↓
Coaching Sessions
 ↓
Notes / Follow-up

Cette architecture doit permettre à OPAL de passer de Maxym seul à plusieurs coachs sans reconstruire tout le système.

⸻

18. Live Admin

L'Admin doit pouvoir :

Créer un Live
Modifier un Live
Programmer un Live
Démarrer / gérer un Live
Ajouter un Replay
Publier / dépublier

Exemple :

Title
Date
Time
Description
Stream ID / URL
Replay
Status

⸻

19. Architecture technique souhaitée

Stack volontairement simple :

Frontend / Application
↓
Next.js
React
TypeScript
UI
↓
Tailwind CSS
shadcn/ui
Backend / Database
↓
Supabase
Authentication
↓
Supabase Auth
Database
↓
Supabase PostgreSQL
Storage
↓
Supabase Storage
Payments
↓
Stripe
Video Academy
↓
YouTube unlisted
Live Video
↓
Mux or equivalent
(YouTube Live possible for MVP)
Code
↓
GitHub
Hosting
↓
Vercel
Development
↓
Google Antigravity

⸻

20. Architecture générale

                           OPAL
                            │
              ┌─────────────┴─────────────┐
              │                           │
          USER APP                     ADMIN
              │                           │
              ▼                           ▼
        Next.js App                 Admin Interface
              │                           │
              └─────────────┬─────────────┘
                            │
                            ▼
                         SUPABASE
                    ┌───────┼────────┐
                    │       │        │
                    ▼       ▼        ▼
                   Auth   Database  Storage
                    │       │
                    │       ├── Users
                    │       ├── Courses
                    │       ├── Lessons
                    │       ├── Trades
                    │       ├── Coaching
                    │       ├── Community
                    │       └── Lives
                    │
                    ▼
                 Permissions
                    │
           ┌────────┴─────────┐
           ▼                  ▼
       Community           Intensive

⸻

21. Paiements

Stripe sera utilisé pour gérer les paiements.

Community :

59 €/month

Intensive :

1 998 €

Le système doit être capable de relier l'état du paiement au plan OPAL.

Exemple :

Stripe
 ↓
Payment / Subscription
 ↓
OPAL User
 ↓
plan
 ↓
permissions

Ne jamais construire un système de paiement maison.

⸻

22. Design system

L'interface doit être premium, sombre et minimaliste.

Couleurs principales :

Background:
#0A0A0A
Secondary background:
#141414
Accent:
Neon Green
Text:
White / Light Gray
Borders:
Subtle dark gray

Style :

* dark mode
* premium SaaS
* glassmorphism léger
* cards propres
* bordures fines
* espaces généreux
* typographie moderne
* animations très discrètes
* aucun effet inutile

L'expérience doit évoquer :

Trading software professionnel + premium SaaS

et non :

plateforme de formation générique.

⸻

23. Scalabilité

L'architecture doit pouvoir évoluer progressivement.

Objectif :

V1
0–500 Community
0–20 Intensive
↓
V2
500–2,000 Community
20–50 Intensive
↓
V3
2,000–5,000 Community
50–100 Intensive
↓
Future
5,000–10,000+ Community
100+ Intensive

Le système Intensive doit pouvoir supporter plusieurs coachs.

La plateforme doit être conçue pour que la croissance ne nécessite pas une réécriture complète.

⸻

24. Application desktop future

La première version doit être une web app.

Ne pas construire une application desktop séparée au début.

Architecture :

OPAL Web App
    ↓
Next.js
    ↓
Vercel

Plus tard, la web app pourra être empaquetée dans une application desktop Mac / Windows avec une technologie comme Tauri.

Objectif futur :

OPAL
├── Web
├── Desktop
└── Mobile

Tous les clients utilisent le même compte et les mêmes données.

⸻

25. Règles importantes pour le développement

Règle 1

Ne pas sur-architecturer.

Construire uniquement ce qui est nécessaire.

Règle 2

Ne pas ajouter d'IA.

Règle 3

Ne pas ajouter d'automatisation complexe.

Règle 4

Ne pas créer de microservices sans raison.

Règle 5

Utiliser des services existants lorsqu'ils résolvent déjà le problème.

Exemples :

* Supabase pour Auth + Database
* Stripe pour Payments
* YouTube pour les vidéos V1
* Mux pour Live si nécessaire
* Vercel pour Hosting

Règle 6

L'Admin doit permettre de gérer le contenu sans modifier le code.

Règle 7

Les permissions doivent être sécurisées côté backend.

Règle 8

Chaque fonctionnalité doit avoir une vraie utilité utilisateur.

Règle 9

Ne pas construire toute la plateforme avant de tester les premiers modules.

Règle 10

Toujours privilégier une architecture simple qui pourra être améliorée progressivement.

⸻

26. Ordre de développement recommandé

Ne pas développer tout en même temps.

Phase 1 — Foundation

1. Projet Next.js
2. Design system
3. Layout
4. Sidebar
5. Login
6. Supabase
7. User profiles
8. Permissions Community / Intensive

Phase 2 — Core Platform

9. Dashboard
10. Academy
11. Admin Academy
12. YouTube video integration

Phase 3 — Trading

13. Trading Workspace
14. Journal
15. Trades
16. Statistics
17. Systems

Phase 4 — Community / Live

18. Community
19. Live
20. Replays
21. Live Admin

Phase 5 — Intensive

22. Intensive UI
23. Coaching calendar
24. Follow-up
25. Objectives
26. Coaching notes
27. Intensive Admin

Phase 6 — Payments

28. Stripe
29. Subscription management
30. Access synchronization
31. Account status management

Phase 7 — Polish

32. Responsive design
33. Performance
34. Security review
35. Error handling
36. UX improvements

⸻

27. Priorité absolue du MVP

Si le développement doit être réduit au strict minimum, le MVP doit permettre :

LOGIN
 ↓
DASHBOARD
 ↓
ACADEMY
 ↓
TRADING
 ↓
SYSTEMS
 ↓
COMMUNITY
 ↓
LIVE
 ↓
INTENSIVE

avec :

* comptes utilisateurs
* Community / Intensive permissions
* Academy administrable
* vidéos YouTube
* Trading Journal
* Admin
* données sécurisées

Le reste peut être ajouté progressivement.

⸻

28. Vision finale

OPAL doit devenir :

The Trading Operating System

Un environnement unique où un trader peut :

Learn → Prepare → Trade → Journal → Connect → Improve

Et où Maxym peut piloter l'ensemble du business depuis l'Admin :

* utilisateurs
* abonnements
* contenu
* Academy
* lives
* replays
* Community
* clients Intensive
* coachings
* suivi

L'objectif final n'est pas seulement de vendre une formation.

L'objectif est de construire un produit logiciel propriétaire autour du framework OPAL.

La priorité absolue reste cependant :

Construire simple. Lancer. Faire utiliser. Observer. Améliorer.

Ne jamais ajouter de complexité simplement parce que la technologie permet de le faire.
