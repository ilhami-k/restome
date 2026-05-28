# RestoMe

RestoMe est une application mobile React Native développée avec Expo pour la commande à table en restaurant.

Les clients scannent un QR code de table, consultent le menu, ajoutent des articles au panier, envoient une commande et suivent l'état des articles en temps réel. Le personnel cuisine accède à l'application via un QR code staff caché, se connecte, gère la file de commandes, met à jour les statuts, envoie des messages aux clients et gère le menu.

## Prérequis

- Node.js 20.19.4 ou version plus récente
- npm
- Expo Go sur un appareil physique, ou un émulateur Android via Android Studio
- Un projet Supabase configuré

## Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Le fichier `.env` est requis pour connecter l'application à Supabase. Il est ignoré par Git. Les valeurs réelles ainsi que les identifiants de démonstration cuisine sont fournis dans le dossier de remise (`[React Native] Remise de Projet - Ilhami Kandemir.pdf`), section 7.

## Installation et lancement

```bash
npm install
npm run start
```

Scanner ensuite le QR code Expo avec Expo Go sur un appareil physique.

Si le téléphone ne parvient pas à joindre le serveur de développement, utiliser le mode tunnel :

```bash
npm run start:tunnel
```

Si le tunnel échoue, c'est généralement parce qu'une instance ngrok est déjà ouverte ailleurs (autre terminal, autre session). ngrok n'autorise qu'une seule connexion simultanée par compte gratuit. Pour résoudre le problème, fermer tous les terminaux ouverts et relancer la commande. Si cela ne suffit pas, redémarrer l'ordinateur.

En dernier recours, utiliser Android Studio :

1. Démarrer un émulateur Android.
2. Exécuter `npm run start`.
3. Appuyer sur `a` dans le terminal Expo pour ouvrir l'application sur l'émulateur.

Cette méthode ne dépend ni du réseau local ni du tunnel et est la plus fiable pour tester l'application.

## QR Codes

Les QR codes client sont disponibles dans `src/qr-codes/`. Ils peuvent aussi être saisis manuellement depuis l'écran d'accueil.

Codes de table disponibles :

```
TABLE_001  TABLE_002  TABLE_003
TABLE_004  TABLE_005  TABLE_006
```

L'accès cuisine est caché de l'interface client. Pour entrer en mode cuisine, scanner `src/qr-codes/kitchen.svg` ou taper :

```
KITCHEN_001
```

Les identifiants de connexion cuisine sont fournis dans le dossier de remise, section 7.1.

## Flux de démonstration

1. Lancer l'application avec `npm run start`.
2. Scanner ou taper `TABLE_001`.
3. Aller dans les paramètres pour configurer ses allergènes et filtrer automatiquement les plats, ou changer de thème.
4. Ajouter un article du menu au panier.
5. Envoyer la commande.
6. Cliquer sur « Mes commandes » pour suivre le statut de la commande en temps réel.
7. Sur un deuxième téléphone (pour mieux visualiser le temps réel), scanner ou taper `KITCHEN_001`.
8. Se connecter avec le compte cuisine de démonstration.
9. Ouvrir la file de commandes en direct.
10. Interagir avec les commandes d'une table.
11. Changer le statut de l'article : `pending` → `preparing` → `ready`.
12. Aller dans « Mon menu ».
13. Interagir avec les différents composants : créer un allergène, créer un produit, uploader une image, activer ou désactiver un produit.

## Scripts

| Commande | Description |
|---|---|
| `npm run start` | Lance le serveur de développement Expo |
| `npm run start:tunnel` | Lance Expo en mode tunnel (ngrok) |
| `npm run ts:check` | Vérifie les types TypeScript |
| `npm test` | Exécute la suite de tests |

## Limitations connues

- L'application nécessite une connexion internet active.
- Pas de file de commandes hors-ligne.
- Le client ne peut pas modifier ou annuler une commande déjà envoyée.
- La demande d'addition reste un retour d'interface local, non persisté dans Supabase.
