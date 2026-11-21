Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Vérification anti-bot

Les nouveaux membres cliquent sur un bouton, lisent un code sur une image (captcha déformé, fabriqué par le bot sans service extérieur) et le recopient dans une fenêtre avant d’accéder au serveur. Fini les comptes robots.

## Mise en place

1. Dans le portail Discord, onglet Bot, activez l’intent **Server Members** : sans lui, le bot ne voit pas les arrivées.
2. Placez le rôle du bot **au-dessus** du rôle « Vérifié » et du rôle « non vérifié » (Paramètres du serveur, Rôles). Donnez-lui **Gérer les rôles**, et **Expulser membres** et/ou **Bannir membres** selon la sanction choisie.
3. Un membre qui peut gérer le serveur tape `/verification configurer`, choisit le salon, puis règle le panneau (visible seulement par lui).
4. Réglez le rôle « Vérifié », cliquez sur **Vérifier**, **Publier le panneau**, puis **Activer**.
5. Rendez le salon de vérification visible pour les nouveaux membres et masquez le reste du serveur tant que le rôle « Vérifié » n’est pas donné. Le bot ne modifie jamais les permissions des salons.

## Ce que voit le membre

1. Il clique sur **Me vérifier** : une image avec un code lui est envoyée, visible de lui seul.
2. Il clique sur **Saisir le code** et le recopie (majuscules ou minuscules, peu importe). **Nouveau code** change l’image sans perdre d’essai.
3. Bon code : il reçoit le rôle « Vérifié », et le rôle « non vérifié » lui est retiré.
4. Mauvais code : un essai est consommé et une nouvelle image est proposée. Un code qui a expiré (5 minutes) ne coûte aucun essai.

## Réglages du staff

- **Panneau public** : titre, description, couleur (menu ou code hexadécimal), image (photo ou GIF, 8 Mo maximum, enregistrée dans `data/verif-images/` et jointe à chaque publication), bouton rouge **Retirer l’image** avec confirmation. **Publier / Mettre à jour** modifie le message sur place, et le déplace si le salon change. **Aperçu** ne publie rien.
- **Rôles** : « Vérifié » (obligatoire) et « non vérifié » (facultatif : donné à l’arrivée, retiré à la réussite). Les deux doivent être différents.
- **Essais autorisés** : de **1 à 6**.
- **Si les essais sont épuisés** : expulsion ou bannissement.
- **Délai** : en minutes (1 à 1440), 0 pour ne jamais sanctionner la lenteur. **Si le délai est dépassé** : expulsion ou bannissement, choix séparé du précédent. Les échéances sont enregistrées dans `data/verification.json` et survivent à un redémarrage. Après un arrêt du bot, les retards bénéficient de 5 minutes de grâce pour ne sanctionner personne injustement.
- **Message privé** : avant toute expulsion ou tout bannissement, le bot envoie au membre un message expliquant la raison (essais épuisés ou délai dépassé), le nom du serveur et si un retour est possible. Un texte personnalisé peut y être ajouté. Si les messages privés sont fermés, la sanction est appliquée quand même et le journal le précise.
- **Journal** : un salon où sont notés les arrivées, vérifications réussies, échecs, expulsions, bannissements et erreurs.
- **Activer / Désactiver** et **Vérifier** : le contrôle explique en français chaque problème (rôle plus haut que le bot, permission Gérer les rôles, Expulser ou Bannir manquante, salon sans droit d’écriture, intent).

Le bot ne sanctionne jamais le propriétaire, un administrateur, un bot ou un membre déjà vérifié à la main par le staff. Quand une sanction est impossible (rôle du membre plus haut que celui du bot, permission manquante), il le dit au membre et l’explique dans le journal.

## Commande

- `/verification configurer` — salon, puis panneau de configuration (permission Gérer le serveur)

## Permissions du bot

Gérer les rôles, Expulser des membres, Bannir des membres, Voir le salon, Envoyer des messages, Intégrer des liens, Joindre des fichiers, Voir les anciens messages.

## Intents

`Guilds`, `GuildMembers` (privilégié : Server Members). Partial `GuildMember`.

## Données

La configuration, les membres en cours de vérification et leurs échéances sont dans `data/verification.json`, les images dans `data/verif-images/`. Une configuration de l’ancien module (`data/verif.json`, commande `/verif`) est reprise automatiquement ; les anciens boutons déjà publiés continuent de fonctionner.
