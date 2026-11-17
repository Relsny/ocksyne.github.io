Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Vérification anti-bot

Les nouveaux cliquent sur un bouton, recopient un code de 4 caractères, puis reçoivent le rôle « Vérifié ». Sans rôle au bout du délai, le bot les expulse.

## Commandes

- `/verif salon` — salon visible par les nouveaux
- `/verif role` — rôle donné après le code
- `/verif delai` — minutes avant expulsion (1 à 120)
- `/verif activer` / `desactiver`
- `/verif panneau` — publie le bouton

## Mise en place

Laisse le salon de vérification visible par `@everyone`. Cache les autres salons, et autorise-les au rôle vérifié. Le bot ne réécrit pas les permissions des salons tout seul.

## Permissions du bot

Gérer les rôles, Expulser des membres, Envoyer des messages. Son rôle doit être au-dessus du rôle vérifié.

## Intents

`Guilds`, `GuildMembers` (intent privilégié **Server Members**).

Les codes et les délais en cours sont dans `data/verif.json`.
