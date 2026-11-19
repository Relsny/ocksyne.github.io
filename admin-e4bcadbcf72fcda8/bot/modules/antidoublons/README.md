Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Anti-doublons — module phare

Surveille des salons ou des catégories entières. Le message le plus récent est celui qui part. Les images et les GIF comptent par empreinte SHA-256 du fichier, pas par ressemblance. Les liens sont normalisés (hôte, paramètres de suivi, barre finale).

## Commandes

- `/antidoublons panel` — ouvre un panneau web sur `127.0.0.1`, avec un jeton à usage unique dans l’adresse. La réponse est éphémère.
- `/antidoublons etat`
- `/help` — le pas à pas, si la commande de base est dans le bot

## Panneau

Choix des salons et des catégories, sans plafond. Textes, liens et images. Les sites grand public sont des tuiles avec leur icône. La section Mature (18+) est repliée : e621, Rule34.xxx, RealBooru et Pornhub, avec leur favicon. Le choix des salons reprend la barre latérale de Discord.

Rule34.xxx affiche « (nécessite RULE34_API_KEY + RULE34_USER_ID) ». Cocher la tuile déplie, juste en dessous, la clé (champ masqué, avec un œil pour l’afficher) et l’identifiant. Décocher referme le bloc. La clé se génère sur [la page Options du compte](https://rule34.xxx/index.php?page=account&s=options). Enregistrer les écrit dans `data/antidoublons.json`, sur la machine du bot, et nulle part ailleurs. Le badge « configuré ✓ » apparaît alors, avec Modifier et Effacer. Ces deux valeurs ne sont pas dans `token.txt`.

Deux modes d’image : Exact (empreinte identique) ou Avancé (ressemblance, si `sharp` est installé). Le bouton Activer ouvre une double confirmation : tout l’historique sera analysé et les doublons supprimés (le plus ancien est gardé), puis un second avis que les messages supprimés ne pourront pas être récupérés. L’analyse démarre tout de suite ; le tableau et l’historique suivent les suppressions. À la fin, la surveillance en direct s’active. STOP, en rouge, interrompt.

Les messages de moins de 14 jours sont supprimés en lot. Les plus anciens partent un par un, avec une pause, à cause des limites de Discord.

## Après l’analyse

Chaque nouveau doublon déclenche un embed « Doublon détecté » avec le lien de l’original, puis la suppression.

Au redémarrage, si le module est encore activé, le bot reprend l’analyse des salons choisis.

## Permissions du bot

Gérer les messages, Voir l’historique, Envoyer des messages, Intégrer des liens.

## Intents

`Guilds`, `GuildMessages`, `MessageContent` (privilégié).

La configuration, les empreintes et, si tu les as saisies, `RULE34_API_KEY` et `RULE34_USER_ID` sont dans `data/antidoublons.json`. Ce fichier reste sur l’ordinateur qui lance le bot.
