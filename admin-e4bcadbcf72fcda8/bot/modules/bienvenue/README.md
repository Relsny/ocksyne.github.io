Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Bienvenue & départ

Message d’accueil en embed (couleur, texte, image), numéro du membre, message de départ optionnel et message privé optionnel.

## Commandes

- `/bienvenue salon` — salon des arrivées
- `/bienvenue message` — texte. Variables : `{user}` `{username}` `{server}` `{membercount}`
- `/bienvenue couleur` — couleur hexadécimale de l’embed
- `/bienvenue image` — bannière https, ou vide pour la retirer
- `/bienvenue depart` — active ou coupe le message de départ
- `/bienvenue mp` — active ou coupe le message privé
- `/bienvenue activer` / `desactiver` / `apercu`

## Permissions du bot

Voir les salons, Envoyer des messages, Intégrer des liens. Le message privé exige que le membre autorise les MP du serveur.

## Intents

`Guilds`, `GuildMembers` (intent privilégié **Server Members**, à activer sur le portail Discord). Partial `GuildMember`.

Les réglages sont dans `data/bienvenue.json`.
