Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Tableau d’absences staff

Le staff signale une absence depuis un tableau publié dans le salon choisi. Le tableau s’intitule « 🗓️ REGISTRE DES ABSENCES » et décrit comment signaler, consulter ou retirer une absence. Un bloc « ÉTAT ACTUEL » se met à jour tout seul : staff disponible, ou le nombre d’absences en cours, une courte liste et le prochain retour, puis la dernière mise à jour. Un bouton Logs montre les absences en cours et l’historique personnel (visible seulement par la personne qui clique), et un salon de logs facultatif reçoit le détail puis un message vert au retour.

Vous pouvez publier plusieurs tableaux, un par salon : ils partagent les mêmes absences et le même profil, et restent tous à jour.

## Mise en place

1. Un membre qui peut gérer le serveur tape `/tableau`.
2. Il choisit le salon du tableau.
3. Il choisit un salon de logs, ou clique sur **Passer (sans logs)**. Ce salon n’est pas obligatoire.
4. Le tableau apparaît avec les boutons, dont **⚙️ Réglages**.

Relancez `/tableau` dans un autre salon pour en ajouter un. Dans un salon qui a déjà un tableau, l’ancien message est retiré et un nouveau est publié. Sans salon de logs, tout le reste fonctionne.

Au lancement, le lanceur réenregistre les commandes slash (`/tableau`, `/settings`, `/help`). Si `/settings` n’apparaît pas, remplissez `DISCORD_GUILD_ID` dans token.txt puis relancez. Sur un client en français, la commande peut aussi s’afficher sous le nom `/reglages`.

## Boutons

- **📝 Signaler mon absence** — ouvre un formulaire : motif, description, départ et retour au format `JJ/MM/AAAA HH:MM` (heure de Paris). Le départ peut être dans le passé ou dans le futur. La date de retour doit être postérieure au départ et ne doit pas être déjà passée. Il n’y a pas d’autre limite de durée. Une seule absence à la fois : pour en déclarer une nouvelle, il faut d’abord supprimer l’ancienne.
- **📋 Logs** — montre d’abord les absences en cours du staff (avatar, mention, motif, description, horaires), puis la section « Mon historique » avec vos absences passées et celle en cours. Seule la personne qui clique voit cette réponse.
- **🗑️ Supprimer mon absence** — retire sa propre absence après confirmation.
- **⚙️ Réglages** — réservé à ceux qui peuvent gérer le serveur : profil (titre et texte), couleur, bannière (envoi d’une photo ou d’un GIF), salon de logs. Un bouton rouge **Retirer la bannière** apparaît seulement si une bannière est déjà en place, avec une confirmation.

## Réglages

`/settings` (ou `/reglages`) permet de changer :

- `profil` — titre et texte de présentation, ou `reinitialiser` pour le texte par défaut. Le bloc « ÉTAT ACTUEL » et la dernière mise à jour restent toujours ajoutés et à jour, même avec un texte personnalisé.
- `couleur` — code hexadécimal (`#F0B232`) ou nom (or, blurple, vert, rouge, violet, rose, orange, cyan, gris, noir)
- `banniere` — envoyez une image ou un GIF avec l’option `fichier` (8 Mo maximum, les GIF restent animés). L’option `retirer` enlève la bannière de tous les tableaux. Les liens ne sont plus demandés : le fichier est enregistré sur le bot pour ne pas dépendre d’une URL qui expire.
- `logs` — définir, changer ou retirer le salon de logs (facultatif)

Tous les tableaux du serveur se mettent à jour tout de suite.

## Retour automatique

À l’heure de retour, l’absence est retirée et tous les tableaux sont mis à jour. Si un salon de logs est défini, un embed vert « De retour » y est publié. Le contrôle reprend après un redémarrage, y compris pour une absence de plus de 24 jours.

## Permissions

Voir le salon, Envoyer des messages, Intégrer des liens, Voir les anciens messages, Joindre des fichiers.

## Intents

`Guilds`. Aucun intent privilégié.
