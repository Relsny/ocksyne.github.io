Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Anti-spam & anti-raid

Sur le serveur où le bot est invité : limite de messages, limite de mentions, suppression des invitations (et des autres liens si on l’active), exclusion de 10 minutes du membre concerné. Si trop de comptes arrivent d’un coup, le bot monte le niveau de vérification, expulse seulement ces arrivées (20 maximum, jamais le propriétaire ni le staff) et prévient un salon.

La protection est **coupée tant que** `/antiraid activer` n’a pas été utilisé.

## Commandes

- `/antiraid activer` / `desactiver`
- `/antiraid spam messages: secondes: mentions:`
- `/antiraid liens invitations: autres:`
- `/antiraid raid seuil: fenetre: duree:`
- `/antiraid alerte salon:`
- `/antiraid voir`

Les membres qui peuvent gérer les messages ne sont pas concernés.

## Permissions du bot

Exclure temporairement, Gérer les messages, Expulser, Gérer le serveur (pour le niveau de vérification).

## Intents

`Guilds`, `GuildMembers` (privilégié), `GuildMessages`, `MessageContent` (privilégié, nécessaire pour lire les liens).
