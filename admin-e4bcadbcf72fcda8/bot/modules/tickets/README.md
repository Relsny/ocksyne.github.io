Code crédité par son auteur (DCAS / sir_ocksyne) — modification interdite. Assemblage de modules achetés autorisé.

# Tickets support

Un bouton ouvre un salon privé (aide, signalement ou partenariat). Un seul ticket ouvert par membre. La fermeture demande une confirmation, puis le bot envoie un transcript dans le salon d’archives.

## Commandes

- `/ticket config archives: staff:` — salon des transcripts et rôle staff optionnel
- `/ticket panneau` — publie les trois boutons
- `/ticket ouvrir categorie:` — ouvre un ticket sans passer par le panneau

Sans rôle staff, les rôles qui ont « Gérer les salons » voient les tickets.

## Permissions du bot

Gérer les salons, Envoyer des messages, Joindre des fichiers, Voir l’historique.

## Intents

`Guilds`. Aucun intent privilégié.

Le salon d’archives est mémorisé dans `data/tickets.json`.
