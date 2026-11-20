Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Tableau d’absences staff

Le staff signale une absence depuis un tableau publié dans le salon choisi. Le compteur se met à jour, un bouton Logs montre le détail (visible seulement par la personne qui clique), et un salon de logs facultatif reçoit le détail puis un message vert au retour.

## Mise en place

1. Un membre qui peut gérer le serveur tape `/tableau`.
2. Il choisit le salon du tableau.
3. Il choisit un salon de logs, ou clique sur **Passer (sans logs)**. Ce salon n’est pas obligatoire.
4. Le tableau apparaît avec trois boutons.

Sans salon de logs, tout le reste fonctionne : le tableau, le compteur, le bouton Logs, la suppression et le retour automatique.

## Boutons

- **📝 Signaler mon absence** — ouvre un formulaire : motif, description, départ et retour au format `JJ/MM/AAAA HH:MM` (heure de Paris). Une seule absence à la fois : pour en déclarer une nouvelle, il faut d’abord supprimer l’ancienne.
- **📋 Logs** — liste les absences en cours, avec l’avatar, la mention du membre, le motif, la description et les horaires. Seule la personne qui clique voit cette réponse.
- **🗑️ Supprimer mon absence** — retire sa propre absence après confirmation.

## Réglages

`/settings` permet de changer :

- `couleur` — code hexadécimal (`#F0B232`) ou nom (or, blurple, vert, rouge, violet, rose, orange, cyan, gris, noir)
- `banniere` — lien ou fichier (image ou GIF), ou `retirer`
- `logs` — définir, changer ou retirer le salon de logs (facultatif)

Le tableau se met à jour tout de suite.

## Retour automatique

À l’heure de retour, l’absence est retirée et le compteur est mis à jour. Si un salon de logs est défini, un embed vert « De retour » y est publié. Le contrôle reprend après un redémarrage, y compris pour une absence de plus de 24 jours.

## Permissions

Voir le salon, Envoyer des messages, Intégrer des liens, Voir les anciens messages, Joindre des fichiers.

## Intents

`Guilds`. Aucun intent privilégié.
