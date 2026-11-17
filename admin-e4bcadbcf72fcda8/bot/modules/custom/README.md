Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Commandes personnalisées (×5)

Cinq commandes par serveur. Chacune répond par un texte ou un embed. Elles marchent tout de suite sous la forme `!nom` (par exemple `!regles`). La forme slash `/nom` est publiée sur le serveur dès que le token est renseigné.

Un nom déjà utilisé par le bot (`/ban`, `/ping`…) est refusé.

## Commandes

- `/custom ajouter nom: reponse: embed: description:`
- `/custom retirer nom:`
- `/custom liste`

## Permissions du bot

Envoyer des messages.

## Intents

`Guilds`, `GuildMessages`, `MessageContent` (intent privilégié, obligatoire pour reconnaître `!nom`).

Les textes sont dans `data/custom.json`.
