Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Anti-doublons — module phare

Surveille des salons ou des catégories entières. Le message le plus récent est celui qui part. Les images et les GIF comptent par empreinte SHA-256 du fichier, pas par ressemblance. Les liens sont normalisés (hôte, paramètres de suivi, barre finale).

## Commandes

- `/antidoublons panel` — ouvre un panneau web sur `127.0.0.1`, avec un jeton à usage unique dans l’adresse. La réponse est éphémère.
- `/antidoublons etat`
- `/help` — le pas à pas, si la commande de base est dans le bot

## Panneau

Choix des salons et des catégories, sans plafond. Textes, liens et images. Les sites grand public sont des tuiles avec leur icône. La section Mature (18+) est repliée : e621, Rule34.xxx, RealBooru, paheal, Pornhub, avec un badge texte.

Rule34.xxx affiche « (nécessite RULE34_API_KEY + RULE34_USER_ID) ». Cocher la tuile ouvre une fenêtre : la clé (champ masqué) et l’identifiant. La clé se génère sur [la page Options du compte](https://rule34.xxx/index.php?page=account&s=options). Enregistrer les écrit dans `data/antidoublons.json`, sur la machine du bot, et nulle part ailleurs. Annuler laisse la tuile décochée. Modifier et Effacer restent disponibles. Ces deux valeurs ne sont pas dans `token.txt`.

Deux modes d’image : Exact (empreinte identique) ou Puissant (ressemblance, si `sharp` est installé). Le bouton Activer demande : « Êtes-vous sûr de vouloir activer le système d'anti-doublons ? Lorsque le bot détecte un doublon, le plus récent sera supprimé. » Puis un tableau suit l’analyse. STOP, en rouge, interrompt.

Les messages de moins de 14 jours sont supprimés en lot. Les plus anciens partent un par un, avec une pause, à cause des limites de Discord.

## Après l’analyse

Chaque nouveau doublon déclenche un embed « Doublon détecté » avec le lien de l’original, puis la suppression.

Au redémarrage, si le module est encore activé, le bot reprend l’analyse des salons choisis.

## Permissions du bot

Gérer les messages, Voir l’historique, Envoyer des messages, Intégrer des liens.

## Intents

`Guilds`, `GuildMessages`, `MessageContent` (privilégié).

La configuration, les empreintes et, si tu les as saisies, `RULE34_API_KEY` et `RULE34_USER_ID` sont dans `data/antidoublons.json`. Ce fichier reste sur l’ordinateur qui lance le bot.
