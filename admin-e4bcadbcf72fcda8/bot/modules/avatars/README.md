Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Avatars interdits

Dès que tu lances le bot, l’analyse démarre et les sanctions s’appliquent : il n’y a pas de retour en arrière.

Il n’y a pas de panneau. Au lancement, le bot lit le dossier des images interdites, parcourt les membres, puis surveille les arrivées et les changements d’avatar.

## Sanction

Ce n’est pas un bannissement. Le membre reçoit un message privé, il est exclu, puis ses messages des dernières 24 heures sont retirés des salons accessibles. Le propriétaire, les bots, et les membres qui peuvent exclure ou gérer le serveur ne sont pas touchés.

Deux cas : aucun avatar personnel (l’avatar Discord par défaut), ou une photo trop proche d’une image du dossier.

## Images

Ajoute, retire ou remplace les fichiers jpg, png, webp ou gif dans le dossier « IMAGES INTERDITES ». Le bot relit ce dossier pendant qu’il tourne.

## Logs

Dans token.txt, la ligne est `LOG_CHANNEL_ID = Facultatif`. Remplace « Facultatif » par l’identifiant du salon (mode développeur, clic droit, Copier l’identifiant) pour recevoir les logs. Laisse-le tel quel pour ne pas en recevoir.

## Si sharp ou l’OCR manque

Sans sharp, seule une image strictement identique est reconnue. Le message est écrit dans la console, le bot continue. L’OCR n’est pas obligatoire : s’il manque, la comparaison d’images continue.
