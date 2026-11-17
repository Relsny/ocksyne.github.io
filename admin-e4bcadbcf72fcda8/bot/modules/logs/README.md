Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Logs du serveur

Trois journaux séparés : messages supprimés ou modifiés, arrivées / départs / pseudos, sanctions (ban, unban, kick, timeout).

## Commandes

- `/logs messages salon:`
- `/logs membres salon:`
- `/logs sanctions salon:`
- `/logs voir`

## Permissions du bot

Voir les salons, Envoyer des messages, Intégrer des liens, Voir les logs du serveur.

## Intents

`Guilds`, `GuildMessages`, `GuildMembers` (privilégié), `GuildModeration`, `MessageContent` (privilégié, sinon le texte des messages supprimés reste vide). Partials `Message` et `GuildMember`.

Rien n’est écrit sur le disque : les journaux partent directement dans les salons choisis.
