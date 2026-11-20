Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Bienvenue & départ

Quand un membre arrive, le bot publie un embed d’accueil soigné dans le salon que vous avez choisi, avec le numéro du membre, une miniature de l’avatar et une bannière facultative. Un message de départ et un message privé de bienvenue peuvent être activés, chacun de leur côté.

## Mise en place

1. Dans le portail Discord, onglet Bot, activez l’intent **Server Members** (Privileged Gateway Intents).
2. Accordez au bot l’accès au salon d’accueil (voir, envoyer des messages, intégrer des liens, joindre des fichiers).
3. Un membre qui peut gérer le serveur tape `/bienvenue configurer`.
4. Il choisit le salon des arrivées.
5. Le panneau de configuration s’ouvre (visible seulement par lui) : titres et textes, couleurs séparées, bannières, mention hors embed, prise en compte des bots, départ optionnel, message privé optionnel, test et changement de salon.

## Panneau

Vous pouvez personnaliser les titres et les textes avec les variables `{mention}`, `{membre}`, `{membre_id}`, `{serveur}`, `{numero}`, `{effectif}`, `{compte_cree}`. `{numero}` s’écrit avec le suffixe ordinal français (1ᵉʳ, 2ᵉ, 1 248ᵉ). `{effectif}` est le nombre de membres, sans suffixe.

La couleur d’accueil et la couleur de départ se choisissent dans un menu, ou par un code hexadécimal personnel. Les bannières (photo ou GIF, 8 Mo maximum) s’envoient depuis les boutons **Image d’accueil** et **Image de départ**. Les GIF restent animés. Le fichier est enregistré par le bot et rattaché à chaque publication (`attachment://`). Un lien CDN ne serait pas conservé, il finirait par expirer. Pour enlever une bannière, choisissez **Retirer la bannière d’accueil** ou **Retirer la bannière de départ** dans le menu des couleurs, puis confirmez.

La mention hors embed (activée par défaut) envoie `{mention}` dans le contenu du message, afin que la personne soit bien notifiée. Les bots sont ignorés par défaut ; vous pouvez les inclure.

Le message de départ est optionnel. Il peut utiliser le même salon que l’accueil, ou un salon distinct (bouton **Salon de départ**). Le message privé de bienvenue est également optionnel. S’il est refusé (MP fermés), l’accueil public est tout de même publié, sans erreur visible.

**Tester / aperçu** vous montre les messages concernés, sans les publier et sans envoyer de MP.

## Commandes

- `/bienvenue configurer` — salon d’accueil et panneau (permission Gérer le serveur)

## Permissions

Gérer le serveur, Voir le salon, Envoyer des messages, Intégrer des liens, Joindre des fichiers, Voir les anciens messages.

## Intents

`Guilds`, `GuildMembers` (privilégié : Server Members, à activer dans le portail). Partial `GuildMember` (pour les départs).
