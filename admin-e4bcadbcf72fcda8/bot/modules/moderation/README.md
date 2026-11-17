Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Modération

`/ban`, `/kick`, `/timeout` et `/clear`. La raison est obligatoire pour les trois sanctions. Chaque action demande un bouton de confirmation, puis le bot écrit au membre en message privé avant d’appliquer la sanction.

## Commandes

- `/ban membre: raison: jours:` — `jours` efface les messages des 0 à 7 derniers jours
- `/kick membre: raison:`
- `/timeout membre: minutes: raison:` — 1 minute à 28 jours
- `/clear nombre: membre: raison:` — messages de moins de 14 jours, limite Discord

Le staff ne peut pas sanctionner le propriétaire, ni un membre placé au-dessus de lui. Le bot refuse aussi si son propre rôle est trop bas.

## Permissions du bot

Bannir, Expulser, Exclure temporairement des membres, Gérer les messages.

## Intents

`Guilds`, `GuildMembers` (intent privilégié **Server Members**, pour comparer les rôles).
