Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Message de boost

Quand un membre booste le serveur, le bot publie un embed de remerciement dans le salon que vous avez choisi. Le titre, le texte, la couleur et une image facultative se règlent depuis un panneau. Au premier lancement, les personnes qui boostent déjà le serveur sont simplement mémorisées, sans message. Un boost reçu pendant que le bot était éteint est annoncé une seule fois au redémarrage.

## Mise en place

1. Dans le portail Discord, onglet Bot, activez l’intent **Server Members** (Privileged Gateway Intents).
2. Accordez au bot l’accès au salon du remerciement (voir, envoyer des messages, intégrer des liens, joindre des fichiers).
3. Un membre qui peut gérer le serveur tape `/boost configurer`.
4. Il choisit le salon où le remerciement sera publié.
5. Le panneau de configuration s’ouvre (visible seulement par lui) : titre et texte, couleur, image, miniature de l’avatar, activation, test et changement de salon.

## Panneau

Vous pouvez personnaliser le titre et le texte avec les variables `{mention}`, `{membre}`, `{membre_id}`, `{serveur}`, `{boosts}`, `{niveau}`, `{compte_cree}`.

La couleur se choisit dans un menu (rose, blurple, violet, or…) ou par un code hexadécimal personnel. L’image (photo ou GIF, 8 Mo maximum) s’envoie depuis le bouton **Image du message** : le fichier est enregistré par le bot et rattaché à chaque publication (`attachment://`). Un lien CDN ne serait pas conservé, il finirait par expirer. Les GIF restent animés. Pour l’enlever, utilisez le bouton rouge **Retirer l’image**, affiché seulement si une image est déjà en place, puis confirmez.

**Tester / aperçu** vous montre le message sans le publier dans le salon et sans le compter comme déjà annoncé.

## Commandes

- `/boost configurer` — salon du remerciement et panneau (permission Gérer le serveur)

## Annonces

Le bot réagit à l’instant où un membre commence à booster (mise à jour du membre et/ou message système de boost). Si les deux arrivent, un seul message est publié. Un nouveau boost après un arrêt du boost est annoncé de nouveau.

Au redémarrage, seuls les boosts dont la date est postérieure au dernier arrêt connu sont rattrapés, une seule fois. Le tout premier lancement n’envoie aucun remerciement aux boosters déjà présents.

## Permissions

Gérer le serveur, Voir le salon, Envoyer des messages, Intégrer des liens, Joindre des fichiers, Voir les anciens messages.

## Intents

`Guilds`, `GuildMembers` (privilégié : Server Members, à activer dans le portail), `GuildMessages` (pour les messages système de boost).
