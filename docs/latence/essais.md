# LATENCE : les essais

Faire jouer des gens qui ne connaissent pas l'histoire. Mesurer le temps de chaque acte, noter où ils bloquent, puis régler la fenêtre de retour, les indices et les textes. C'est l'étape 6 de la feuille de route.

## Ce que le jeu mesure seul

- **Le journal de la partie.** Le moteur note chaque changement de scène, chaque étape franchie, chaque indice et chaque refus, et la fin, à l'heure du jeu et au temps réel joué (`g.s.journal`, voir `docs/moteur.md`). Le journal se garde avec la partie, dans le navigateur seulement : rien n'est envoyé nulle part.
- **Le rapport d'essai.** Ouvrir le jeu avec `?essai` : un bouton « Rapport d'essai » apparaît dans l'en-tête. Le rapport donne la durée des trois actes, chaque étape avec le temps réel passé avant elle et les refus et indices de cet intervalle, puis les scènes où le joueur s'est attardé. « Copier » et « Télécharger » (un fichier `.txt`) le gardent.
- Le rapport dévoile toute l'histoire : ne l'ouvrir qu'après la partie, hors de la vue du joueur.

## Les repères

- **La fenêtre** va de 14:00 à 15:45, soit 1 h 45 ; la partie vise 1 h 30. Le scénario prévoit trois actes d'environ 35 minutes (`scenario.md`) : l'approche jusqu'à 14:35, le relais jusqu'à 15:10, la Muette jusqu'à 15:45.
- **Le chemin le plus court**, joué sans aucun temps de réflexion, réussit la jonction à 14:12 : le message F1 n'arrive qu'à 14:10, puis l'approche prend deux minutes. Ensuite, plus rien n'oblige à attendre. La durée d'une partie vient donc presque entièrement de la lecture et de la réflexion : seuls les essais la mesurent.
- **L'affichage à 1200 bauds** pèse peu : le chemin le plus court affiche 17 ko, soit 2 min 20 s ; lire chaque page une fois en affiche 25 ko, soit 3 min 30 s.
- **Les indices** : trois par objectif, 3 minutes chacun.

## Une séance

### Avant
- Un joueur qui ne sait rien de l'histoire. Seul ou à deux devant l'écran : le noter.
- Un ordinateur avec un clavier, le son, du papier et un crayon.
- Le jeu ouvert sur `index.html?essai`, une partie neuve, en mode chronométré. Pas de `?instantane` : la ligne à 1200 bauds fait partie de l'expérience.
- L'observateur s'assoit à côté, avec la grille ci-dessous.
- Ce qu'on dit au joueur : « Joue comme chez toi, et pense à voix haute si tu peux. Je ne t'aiderai pas : le jeu a ses indices, sur la touche GUIDE. »

### Pendant
- Ne pas aider, ne pas réagir.
- Noter l'heure du jeu (rangée 00) et ce qui se passe : les hésitations, les fausses pistes, les retours au manuel, ce qui part sur le papier, l'agacement, les rires, les « ah ! ».
- Noter surtout le moment où le joueur se méfie du Contrôle, et celui où il comprend qui est Irène : tout le retournement repose sur eux.
- Un joueur bloqué plus de dix minutes sans prendre d'indice : le noter. N'intervenir que si la séance s'effondre, et noter l'intervention.

### Après
- Télécharger le rapport d'essai avant de fermer l'onglet.
- Dix minutes de questions (ci-dessous).
- Reporter la séance dans le registre.

## La grille d'observation

| Heure du jeu | Écran | Ce que fait ou dit le joueur | Remarque |
|---|---|---|---|
| 14:06 | Répartiteur | Branche les câbles au hasard, trois refus | Pas encore lu le manuel |
| | | | |

## Les questions après la partie

1. En une phrase, que s'est-il passé ?
2. À quel moment avez-vous douté du Contrôle ? Qu'est-ce qui vous a mis la puce à l'oreille ?
3. Qui est Irène, et qu'avez-vous compris de la fin ?
4. Le moment le plus satisfaisant ? Le plus frustrant ?
5. Une énigme trop dure, trop facile, injuste ?
6. Les indices : clairs ? trop chers ?
7. Les textes : trop longs, trop courts, des mots inconnus ?
8. Le terminal : lisible ? L'affichage lent, agaçant ou plaisant ? Le son ?
9. Le temps : stressant, juste, trop large ?
10. À qui conseilleriez-vous ce jeu ?

## Ce qu'on peut régler

| Réglage | Aujourd'hui | Où |
|---|---|---|
| La fermeture de la fenêtre de retour | 15:45:00 | `JOUR.fin`, `src/scenarios/latence/data.js` |
| L'alarme | 15:35:00 | `JOUR.alarme`, même fichier |
| Le prix d'un indice | 3 minutes | `hintPenalty`, `src/scenarios/latence/index.js` |
| Le texte des indices | trois par objectif | `src/scenarios/latence/indices.js` |
| Le délai des réponses du faux Contrôle | 15 à 40 secondes | `DELAI`, `data.js` : trop court, l'indice « réponse trop rapide » saute aux yeux ; trop long, il disparaît |
| La cadence du message F1 | toutes les 10 minutes | `EMISSION`, `data.js` : elle fixe l'attente la plus longue de l'acte I |
| Les messages de refus | un par énigme | `REFUS`, `data.js` |
| Les textes | version de travail | `textes.md`, puis les scènes |

Tout changement de durée se vérifie avec `npm test` : les tests du déroulé suivent les heures de `data.js`.

## Quand revoir

Des seuils pour lancer la discussion, à ajuster avec l'expérience :
- un acte qui dépasse 45 minutes chez la plupart des joueurs ;
- une énigme où la plupart des joueurs prennent le troisième indice ;
- plus de cinq refus de suite sur une même énigme : le message de refus doit mieux orienter ;
- moins de la moitié des joueurs qui se méfient du Contrôle avant la révélation : renforcer les indices du retournement (les réponses trop rapides, la signature PLT, les « échos parasites ») ;
- plus de la moitié des parties chronométrées qui finissent hors délai.

## Le registre

Une ligne par séance. Pas de nom : une initiale, ou rien.

| N° | Date | Joueur | Seul ou à deux | Fin | Temps réel | Acte I | Acte II | Acte III | Indices | Refus | Méfiance envers le Contrôle (heure) | Remarques |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | | | | | | | | | | | | |
