Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Rôles à boutons (avec Auto-rôle)

Un panneau propre où vos membres choisissent leurs rôles en un clic (jeux, notifications, couleurs…), en boutons ou en menu déroulant, en choix unique ou multiple, jusqu’à 25 rôles par panneau. Le même module donne aussi, automatiquement, un ou plusieurs rôles aux nouveaux membres (auto-rôle).

## Mise en place

1. Placez le rôle du bot **au-dessus** de tous les rôles qu’il doit distribuer (Paramètres du serveur, Rôles). C’est la règle de Discord : un bot ne peut pas donner un rôle plus haut que le sien.
2. Pour l’auto-rôle uniquement : dans le portail Discord, onglet Bot, activez l’intent **Server Members**. Les panneaux de rôles fonctionnent sans cet intent.
3. Un membre qui peut gérer les rôles tape `/roles configurer`, choisit le salon, puis règle le panneau (visible seulement par lui).

## Panneaux de rôles

- **Titre, description, couleur** : menu de couleurs ou code hexadécimal personnel. Un titre ou une description laissés vides reviennent au texte par défaut.
- **Image** (photo ou GIF, 8 Mo maximum) : le fichier est enregistré par le bot et rattaché à chaque publication (`attachment://`). Un lien Discord ne serait pas conservé, il finirait par expirer. Bouton rouge **Retirer l’image** (affiché seulement si une image est en place), avec confirmation.
- **Affichage** : boutons (5 par ligne) ou menu déroulant.
- **Choix** : *multiple* (on cumule les rôles ; un bouton prend ou retire le rôle) ou *unique* (prendre un rôle retire les autres rôles du même panneau). Avec le menu, la sélection devient l’état exact des rôles du panneau ; valider un menu vide retire tous les rôles du panneau.
- **Rôles** : **Ajouter un rôle** (choix du rôle, puis texte facultatif de 45 caractères maximum et emoji facultatif, Unicode ou emoji du serveur), **Retirer un rôle** (plusieurs à la fois). Rajouter un rôle déjà présent modifie son texte et son emoji. Les rôles du serveur ne sont jamais supprimés.
- **Publier / Mettre à jour** : le panneau est publié dans le salon choisi. Un panneau déjà publié est modifié sur place ; si vous changez de salon, il est déplacé. Rien n’apparaît sur Discord avant la publication, et les modifications demandent une mise à jour.
- **Aperçu** : le panneau tel que vos membres le verront, boutons inactifs, sans rien publier.
- Plusieurs panneaux par serveur (25 maximum) : **Mes panneaux**, **Nouveau panneau**, **Supprimer le panneau** (le message publié est effacé).

### Vérifications et erreurs

Le bot refuse, avec une explication en français : un rôle plus haut ou égal à celui du bot, un rôle géré par une intégration, @everyone, un rôle qui donne les droits administrateur, un rôle plus haut que le vôtre (sauf propriétaire et administrateurs), un bot sans permission **Gérer les rôles**, un salon où il lui manque une permission, une 26ᵉ entrée. Si une règle change après coup (rôle déplacé ou supprimé), le membre reçoit un message clair et le staff le voit à la publication suivante.

## Auto-rôle

`/roles auto` ouvre le panneau :

- **Rôles des humains** et **rôles des bots** : listes séparées (jusqu’à 25 rôles chacune).
- **Délai** : 0 (immédiat), ou 30 (secondes), 10m, 2h… jusqu’à 24 h. Les attributions en attente survivent à un redémarrage : elles sont dans `data/roles-boutons.json`. Un membre parti pendant le délai est oublié.
- **Journal** : un salon où chaque attribution est notée (membre, type, rôles donnés, délai, problèmes éventuels).
- **Activer / Désactiver** et **Vérifier** (contrôle de chaque rôle, des permissions du journal et rappel de l’intent).

Une configuration de l’ancien module Auto-rôle (`data/autorole.json`) est reprise automatiquement.

## Commandes

- `/roles configurer` — salon, puis panneaux de rôles (permission Gérer les rôles)
- `/roles auto` — rôles automatiques des nouveaux membres (permission Gérer les rôles)

## Permissions du bot

Gérer les rôles, Voir le salon, Envoyer des messages, Intégrer des liens, Joindre des fichiers, Voir les anciens messages.

## Intents

`Guilds`, `GuildMembers` (privilégié : Server Members, nécessaire à l’auto-rôle). Partial `GuildMember`.

Les panneaux sont mémorisés dans `data/roles-boutons.json` et les images dans `data/roles-images/`.
