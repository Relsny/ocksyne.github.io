Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Avertissements

`/warn ajouter` enregistre la raison et l’auteur. Au seuil choisi, le bot exclut temporairement ou expulse, et prévient le membre en message privé.

## Commandes

- `/warn ajouter membre: raison:`
- `/warn liste membre:` — historique
- `/warn retirer membre:` — retire le dernier
- `/warn config seuil: sanction: minutes:` — timeout ou expulsion

Le seuil par défaut est 3, puis une exclusion d’une heure.

## Permissions du bot

Exclure temporairement des membres, Expulser des membres.

## Intents

`Guilds`, `GuildMembers` (intent privilégié **Server Members**).

L’historique est dans `data/warns.json`.
