Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Démarrage automatique avec le PC

DCAS n’héberge pas le bot. Cette option fait seulement démarrer le programme quand **ton** ordinateur ouvre une session. S’il est éteint, en veille, ou sans internet, le bot s’arrête. Ce n’est pas un hébergement 24 h/24.

Prix catalogue proposé : 5 €, à confirmer (aucun prix n’était fixé dans le brouillon).

Le fichier du token doit déjà être rempli, et `npm install` déjà fait dans le dossier du bot.

## Windows

1. Ouvre `windows/demarrer-dcas.bat` une fois pour vérifier que le bot se connecte.
2. Raccourci au démarrage : touche Windows + R, tape `shell:startup`, Entrée. Glisse un raccourci du fichier `.bat` dans ce dossier.
3. Ou une tâche : Outil de planification des tâches → Créer une tâche → Déclencheur « À la connexion » → Action « Démarrer un programme » → le fichier `.bat`. Coche « Exécuter même si l’utilisateur n’est pas connecté » seulement si tu sais ce que ça change.

## macOS

1. Copie `macos/fr.dcas.bot.plist` dans `~/Library/LaunchAgents/`.
2. Remplace `/CHEMIN/VERS/dcas-bot` par le vrai dossier, et le chemin de `node` (`which node` dans le Terminal).
3. Charge-le :

```bash
launchctl load ~/Library/LaunchAgents/fr.dcas.bot.plist
```

4. Pour l’arrêter : `launchctl unload ~/Library/LaunchAgents/fr.dcas.bot.plist`.

Le journal s’écrit dans `/tmp/dcas-bot.log`.
