Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Démarrage automatique avec le PC

Ces scripts lancent le bot DCAS lorsque Windows ou macOS ouvre votre session. **Ce n’est pas un hébergement.** DCAS ne fait pas tourner le bot à votre place. Si l’ordinateur s’éteint, se met en veille ou n’a plus Internet, le bot s’arrête.

Les scripts n’ouvrent pas votre jeton et ne l’affichent jamais. Remplissez `token.txt` et lancez une première fois le bot avec le fichier « LANCER LE BOT », pour installer les composants et enregistrer les commandes.

## En trois étapes

1. Installez Node.js (version LTS) si ce n’est pas déjà fait, remplissez le jeton, puis lancez une fois le bot avec « LANCER LE BOT » (Mac ou Windows).
2. Ouvrez le dossier **Démarrage automatique** et double-cliquez sur **ACTIVER le démarrage automatique**, pour votre système. Les scripts trouvent en général tout seuls le dossier du bot (celui qui contient `package.json`, souvent « fichiers-du-bot »). Sinon, glissez ce dossier dans la fenêtre, ou choisissez-le.
3. Fermez le bot lancé à la main. Dès la prochaine ouverture de session, il démarrera tout seul, en arrière-plan. Pour vérifier, ouvrez **ETAT du bot**. Pour annuler, ouvrez **DESACTIVER le démarrage automatique**.

Sur Mac, les fichiers `.command` s’ouvrent dans le Terminal : c’est normal, c’est le moment où vous activez ou consultez l’état. Ensuite, le bot tourne sans fenêtre (agent launchd). Sur Windows, le bot démarre sans fenêtre visible.

## macOS

- **ACTIVER le démarrage automatique (Mac).command** crée `~/Library/LaunchAgents/fr.dcas.bot.plist` (lancement à l’ouverture de session, redémarrage en cas d’arrêt inattendu, pas après une fermeture normale), avec le chemin absolu de Node.js (Homebrew, `/usr/local`, nvm…) et le journal `logs/dcas-autostart.log` dans le dossier du bot.
- **DESACTIVER le démarrage automatique (Mac).command** arrête l’agent et supprime le fichier.
- **ETAT du bot (Mac).command** indique si l’agent est actif, affiche les dernières lignes du journal, et permet d’arrêter ou de relancer le bot tout de suite.

Si macOS refuse d’exécuter le fichier (« vous ne disposez pas des privilèges d’accès nécessaires »), ouvrez le Terminal, tapez `chmod +x` puis une espace, glissez le fichier `.command`, validez, puis ouvrez-le avec un clic droit, Ouvrir.

## Windows

- **ACTIVER le démarrage automatique (Windows).bat** place dans le dossier Démarrage de votre session (`shell:startup`) un lanceur `.vbs` sans fenêtre visible, qui exécute le bot dans son dossier et écrit le journal `logs/dcas-autostart.log`. Les chemins avec espaces ou accents sont pris en charge.
- **DESACTIVER le démarrage automatique (Windows).bat** arrête le bot s’il tourne et retire ces fichiers.
- **ETAT du bot (Windows).bat** indique si le lanceur est en place, montre le journal, et permet d’arrêter ou de relancer le bot tout de suite.

## Journal

Les messages du bot automatiquement lancé se trouvent dans `logs/dcas-autostart.log`, à l’intérieur du dossier du bot.
