Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Auto-rôle

Donne un ou plusieurs rôles aux nouveaux membres, avec des listes séparées pour les humains et les bots, un délai, et un journal.

## Commandes

- `/autorole ajouter pour: role:` — ajoute un rôle pour les humains ou les bots
- `/autorole retirer role:`
- `/autorole delai secondes:` — 0 à 600 secondes
- `/autorole log salon:` — salon du journal, ou vide pour le couper
- `/autorole liste`

## Permissions du bot

Gérer les rôles. Le rôle du bot doit être **au-dessus** des rôles qu’il attribue.

## Intents

`Guilds`, `GuildMembers` (intent privilégié **Server Members**).

Le délai survit à un redémarrage : les attributions en attente sont dans `data/autorole.json`.
