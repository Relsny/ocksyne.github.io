Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Annonces Twitch / YouTube

Le bot vérifie toutes les deux minutes. Un live Twitch qui commence, ou une nouvelle vidéo YouTube, est annoncé dans le salon choisi, avec un rôle optionnel.

YouTube utilise le flux RSS public (identifiant de chaîne `UC…`), sans clé. Twitch a besoin de `TWITCH_CLIENT_ID` et `TWITCH_CLIENT_SECRET` dans le fichier du token (application sur https://dev.twitch.tv/console/apps).

La vidéo déjà en ligne au moment où la chaîne est ajoutée n’est pas annoncée.

## Commandes

- `/stream twitch chaine: salon: role:`
- `/stream youtube id: salon: role:`
- `/stream retirer nom:`
- `/stream liste`

## Permissions du bot

Envoyer des messages, Intégrer des liens, Mentionner des rôles.

## Intents

`Guilds`. Aucun intent privilégié.
