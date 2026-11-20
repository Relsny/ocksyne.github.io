Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Suivi des invitations

Le bot identifie quelle invitation a servi lorsqu’un membre arrive, tient les compteurs de chaque personne et publie un journal des arrivées et des départs. Les arrivées qui ont eu lieu pendant que le bot était éteint ne sont pas attribuées au hasard : au démarrage, le cache est simplement resynchronisé. Si plusieurs invitations ont bougé en même temps, l’inviteur reste inconnu.

## Mise en place

1. Dans le portail Discord, onglet Bot, activez l’intent **Server Members** (Privileged Gateway Intents).
2. Accordez au bot la permission **Gérer le serveur**, nécessaire pour lire les invitations, ainsi que l’accès au salon du journal (voir, envoyer, intégrer des liens).
3. Un membre qui peut gérer le serveur tape `/invites configurer`.
4. Il choisit le salon du journal.
5. Le panneau de configuration s’ouvre (visible seulement par lui) : messages d’arrivée et de départ, activation, couleur, embed ou texte simple, seuil des faux comptes, changement de salon.

## Panneau

Vous pouvez personnaliser les textes avec les variables `{membre}`, `{mention}`, `{inviteur}`, `{mention_inviteur}`, `{code}`, `{utilisations}`, `{invitations_inviteur}`, `{serveur}`, `{compte_cree}`, `{age_compte}`, `{reguliers}`, `{partis}`, `{faux}`, `{bonus}`.

Un compte plus jeune que le seuil (7 jours par défaut, réglable) est compté comme faux. Les départs sont retranchés à l’inviteur d’origine.

## Commandes

- `/invites configurer` — salon du journal et panneau (permission Gérer le serveur)
- `/invites membre` — compteurs d’un membre, ou les vôtres : total, réguliers, partis, faux, bonus
- `/invites classement` — meilleur total du serveur
- `/invites bonus` — ajouter ou retirer des invitations bonus (Gérer le serveur)
- `/invites reset` — remettre à zéro un membre, ou tout le serveur, après confirmation (Gérer le serveur)

## Journal

Les arrivées et les départs sont publiés dans le salon choisi, avec avatar, mentions et horodatages Discord. Une arrivée par lien personnalisé (vanity), par une invitation inconnue ou expirée, ou via une application (OAuth) est indiquée clairement.

## Permissions

Gérer le serveur, Voir le salon, Envoyer des messages, Intégrer des liens, Voir les anciens messages.

## Intents

`Guilds`, `GuildMembers` (privilégié : Server Members, à activer dans le portail), `GuildInvites`.
