Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Niveaux & XP

Chaque message donne entre 15 et 25 XP, avec une minute de pause entre deux gains. `/rank` montre la barre, `/top` le classement. Un rôle peut être lié à un niveau, et certains salons peuvent être exclus.

Le niveau se calcule ainsi : il faut `5×n² + 50×n` XP pour atteindre le niveau n.

## Commandes

- `/rank membre:`
- `/top`
- `/xp ignorer actif:` — ce salon
- `/xp annonce salon:`
- `/xp recompense niveau: role:`

## Permissions du bot

Envoyer des messages, Intégrer des liens, Gérer les rôles (pour les récompenses).

## Intents

`Guilds`, `GuildMessages`. Le contenu des messages n’est pas lu : l’intent Message Content n’est pas nécessaire.

Les scores sont dans `data/xp.json`.
