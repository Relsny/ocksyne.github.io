Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Bot DCAS

Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé. Voir `LICENSE` et `AI_NOTICE.md`.

Bot Discord en **discord.js v14**, découpé en modules. Ce dossier contient ceux qui ont été choisis. DCAS n’héberge pas le bot : tu le lances toi-même (`npm start`, ou le dossier `modules/autostart` si tu l’as pris).

Chaque module vit dans `modules/<nom>/` avec ses commandes, ses événements et un court mode d’emploi.

Le fichier `enabled.json` liste les modules que le chargeur démarre. Les autres dossiers, s’il y en a, sont ignorés.

## Préparer le bot

1. Installe [Node.js 18.17](https://nodejs.org/) ou plus récent.
2. Ouvre **`👉 METS TON TOKEN ICI 👈.txt`** et colle le jeton, l’identifiant de l’application, et les clés des modules qui en ont besoin (osu!, Twitch).
3. Sur le [portail développeur Discord](https://discord.com/developers/applications) :
   - crée une application, onglet **Bot**, copie le token ;
   - active les intents privilégiés demandés par tes modules (le README de chaque module les nomme). Le plus souvent : **Server Members Intent**. Ajoute **Message Content Intent** si tu as les logs, l’anti-spam ou les commandes `!nom`.
4. Dans ce dossier :

```bash
npm install
npm run deploy
npm start
```

`npm run deploy` enregistre les commandes slash. Avec `DISCORD_GUILD_ID`, c’est immédiat sur ce serveur. Sans lui, le déploiement est global et peut prendre une heure.

Invitation (remplace `APP_ID` par l’identifiant d’application) :

```
https://discord.com/oauth2/authorize?client_id=APP_ID&permissions=1099511627766&scope=bot%20applications.commands
```

Le rôle du bot doit être placé au-dessus des rôles qu’il attribue, expulse ou exclut.

## Vérifier sans token

```bash
npm run smoke
```

Ce contrôle charge tous les modules présents, sans se connecter à Discord.

## Données

Les réglages de chaque serveur sont des fichiers JSON dans `data/`, créés au premier usage. Ils ne sont pas versionnés. Les clés Rule34 de l’anti-doublons, si tu les saisis dans le panneau, sont dans `data/antidoublons.json` et pas dans le fichier du jeton.
