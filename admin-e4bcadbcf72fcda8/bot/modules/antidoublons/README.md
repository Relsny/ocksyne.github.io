Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Anti-doublons — module phare

Surveille des salons ou des catégories entières. Le message le plus récent est celui qui part. Les images, les GIF et les vidéos sont comparés par leur contenu (voir « Détection par le contenu » plus bas), pas seulement par leur lien. Les liens sont normalisés (hôte, paramètres de suivi, barre finale).

## Commandes

- `/antidoublons panel` — ouvre un panneau web sur `127.0.0.1`, avec un jeton à usage unique dans l’adresse. La réponse est éphémère.
- `/antidoublons etat`
- `/help` — le pas à pas, si la commande de base est dans le bot

## Panneau

Choix des salons et des catégories, sans plafond. Textes, liens et images. Les sites grand public sont des tuiles avec leur icône. La section Mature (18+) est repliée : e621, Rule34.xxx, RealBooru et Pornhub, avec leur favicon. Le choix des salons reprend la barre latérale de Discord.

Rule34.xxx affiche « (nécessite RULE34_API_KEY + RULE34_USER_ID) ». Cocher la tuile déplie, juste en dessous, la clé (champ masqué, avec un œil pour l’afficher) et l’identifiant. Décocher referme le bloc. La clé se génère sur [la page Options du compte](https://rule34.xxx/index.php?page=account&s=options). Enregistrer les écrit dans `data/antidoublons.json`, sur la machine du bot, et nulle part ailleurs. Le badge « configuré ✓ » apparaît alors, avec Modifier et Effacer. Ces deux valeurs ne sont pas dans `token.txt`.

Deux modes d’image, utilisés seulement si la détection par le contenu est désactivée : Exact (empreinte identique) ou Avancé (ressemblance, si `sharp` est installé). Le bouton Activer ouvre une double confirmation : tout l’historique sera analysé et les doublons supprimés (le plus ancien est gardé), puis un second avis que les messages supprimés ne pourront pas être récupérés. L’analyse démarre tout de suite ; le tableau et l’historique suivent les suppressions. À la fin, la surveillance en direct s’active. STOP, en rouge, interrompt.

Les messages de moins de 14 jours sont supprimés en lot. Les plus anciens partent un par un, avec une pause, à cause des limites de Discord.

## Supplément (apparence du panneau)

Le bouton **Supplément**, à côté du titre, ouvre trois onglets :

- **Couleur** : couleur d’accent (sélecteur, code HTML, RVB, couleurs prêtes) et intensité. Sous l’intensité, le **mode RGB** (éteint par défaut) fait défiler toutes les couleurs en boucle : interrupteur, curseur de vitesse et direction du dégradé (droite, gauche, bas, haut, ou haut et bas en même temps depuis le centre). Il s’applique aux éléments d’accent (boutons, bordures, curseurs, pastille Supplément…) et remplace la couleur d’accent tant qu’il est actif.
- **Ambiance** : Aucun, **Mon fond**, Pluie, Gouttes, Nuit, Flou, Hacker, Synthwave, Constellation. Chaque effet est un vrai fond animé en plein écran (canvas, 60 images par seconde, pause quand l’onglet est caché, image fixe si le système demande de réduire les animations) et les tuiles sont des aperçus animés. Pluie : averse sur quatre plans avec vent, nuages, éclaboussures et éclairs. Gouttes : condensation sur une vitre, des gouttelettes naissent, grossissent, fusionnent et glissent, sans reflet coloré ni relief. Nuit : étoiles qui scintillent, étoiles filantes, halo de lune, aurore. Flou : taches de couleur qui dérivent et se déforment. Hacker : pluie de code façon Matrix. Les curseurs d’intensité, de transparence du fond et de flou du verre agissent sur tous les effets et sur **Mon fond**. **Mon fond** accepte une image PNG, JPG ou WEBP, ou un GIF (5 Mo maximum), choisie depuis l’ordinateur, avec aperçu, remplacement et retrait. Pour ce fond, le curseur d’intensité règle la luminosité.
- **Son** : aucun son par défaut. Un fichier **.mp3** (3 Mo maximum) est joué à chaque clic sur un bouton du panneau, avec interrupteur, volume, bouton Tester et retrait.

Le panneau écoute sur un port différent à chaque lancement, le navigateur ne peut donc rien retenir : le bot garde lui-même les réglages, le fond et le son dans `data/antidoublons-ui/` (ce dossier reste sur l’ordinateur, jamais dans token.txt). Dans la carte **Liens supprimés**, un clic sur un lien ouvre la page d’origine dans un nouvel onglet.

## Après l’analyse

Chaque nouveau doublon déclenche un embed « Doublon détecté » avec le lien de l’original, puis la suppression.

Au redémarrage, si le module est encore activé, le bot reprend l’analyse des salons choisis.

## Permissions du bot

Gérer les messages, Voir l’historique, Envoyer des messages, Intégrer des liens.

## Intents

`Guilds`, `GuildMessages`, `MessageContent` (privilégié).

La configuration, les empreintes et, si tu les as saisies, `RULE34_API_KEY` et `RULE34_USER_ID` sont dans `data/antidoublons.json`. Ce fichier reste sur l’ordinateur qui lance le bot.

## Détection par le contenu

Activée par défaut (carte « Règles », sous « Images et GIF »). Elle compare les fichiers eux-mêmes, pas leur adresse : deux images, GIF ou vidéos identiques sont repérés même si leurs liens ou leurs noms de fichier diffèrent. Le plus ancien est conservé, le plus récent est supprimé.

- **Ce qui est examiné** : fichiers joints, aperçus intégrés de Discord (GIF Tenor/Giphy, images), liens directs vers un fichier (`.png`, `.jpg`, `.gif`, `.webp`, `.mp4`, `.webm`, `.mov`…, y compris `cdn.discordapp.com`), et pages Tenor, Giphy, Imgur et Streamable (le fichier est lu dans la page). Les émojis, autocollants et avatars Discord sont ignorés. Au plus 6 médias par message.
- **Empreintes** : SHA-256 et MD5 du fichier (identique à l’octet près), dHash et pHash 64 bits pour la ressemblance visuelle (copies recompressées ou redimensionnées), et pour les vidéos et GIF animés 5 images échantillonnées de 10 % à 90 % de la durée (ffmpeg). Les images presque unies (fond noir, fond uni) ne comptent que si le fichier est identique. Les empreintes sont enregistrées dans `data/link-antiduplicate.json`.
- **Sensibilité** : Stricte (copies quasi identiques), Équilibrée (par défaut : copies, tailles ou compressions différentes, petites retouches), Large (images retouchées, risque plus élevé de confondre deux images voisines).
- **Vidéos** : interrupteur à part. Fichiers jusqu’à 64 Mo téléchargés (empreinte exacte + images) ; au-delà, les images sont lues directement depuis l’adresse. `ffmpeg-static` est installé avec le bot ; à défaut, ffmpeg du système est utilisé ; sans aucun ffmpeg, seules les images et l’empreinte exacte des vidéos fonctionnent. `sharp` accélère les images, mais ffmpeg le remplace s’il manque.
- **Limites** : les vidéos YouTube, TikTok, Instagram ou X ne sont pas téléchargeables : elles restent comparées par leur lien (et les images d’aperçu quand le mode Avancé est actif). Une image retournée ou très recadrée n’est pas reconnue. Le bot ne télécharge jamais d’adresse du réseau local. Une adresse inaccessible (lien expiré, site qui bloque) est ignorée sans erreur.
- **Anciens médias** : cliquez sur Activer pour que l’historique soit analysé de nouveau avec cette détection.
- Réglages enregistrés dans les règles : `contentMatch` (oui/non), `contentSensitivity` (`strict`, `balanced`, `loose`), `contentVideos`.

## Réinitialiser l’historique

Le bouton discret « Réinitialiser l’historique », fixé en bas à gauche du panneau, remet tout à zéro pour le serveur après une confirmation : liens et empreintes d’images et de vidéos enregistrés, liste des liens supprimés, historique des doublons et compteurs affichés. C’est irréversible et le bot en cours d’exécution utilise tout de suite l’état vidé. Les réglages (salons, règles, clés) et l’apparence du panneau ne sont pas touchés. Le bouton est refusé pendant une analyse en cours. Les messages déjà supprimés sur Discord ne reviennent évidemment pas.
