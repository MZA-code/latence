# LATENCE : le dossier de conception

LATENCE est un escape game d'environ 1 h 30, joué entièrement sur l'écran d'un terminal vidéotex recréé dans le navigateur.

> Mardi 17 septembre 2097. Le relais L7, au milieu de la Ligne qui relie la Terre à Mars, ne répond plus depuis 19 jours. Vous êtes Alix Vernier, technicien ou technicienne de ligne, et la seule personne à bord du Martinet, un petit vaisseau de maintenance. Il faut réparer le relais avant 15:45. Le Contrôle vous guide pas à pas. Mais ses réponses arrivent trop vite.

## Les documents

| Fichier | Contenu | Spoilers |
|---|---|---|
| `univers.md` | Le monde, la chronologie, la Compagnie Baudot, la Ligne, les personnages, ce qui s'est vraiment passé | oui, en fin de fichier |
| `scenario.md` | Les règles de jeu, le déroulé acte par acte, la messagerie, les choix et les cinq fins | oui |
| `enigmes.md` | Les neuf énigmes : données, réponses, refus, indices, tests | oui |
| `textes.md` | Tous les textes du jeu, en version de travail | oui |
| `interface.md` | La page, l'écran, les dessins en pavés, les images, les sons, l'accessibilité | non |
| `marques.md` | Les marques de l'univers, la palette, les prompts Gemini, le merch | non |
| `essais.md` | Les essais avec des joueurs : le rapport d'essai, le déroulé d'une séance, ce qu'on règle ensuite | oui, dans le rapport |

Ordre de lecture pour Claude Code : `CLAUDE.md` à la racine, `docs/moteur.md`, puis ce dossier dans l'ordre du tableau.

## Décisions prises par défaut

L'auteur peut revenir sur chacune avant ou pendant le développement.

- Irène Vasseur est l'ancienne formatrice d'Alix.
- Le joueur choisit si Alix est un homme ou une femme ; seuls les accords changent.
- Les noms : Compagnie Baudot, la Ligne Terre-Mars, le relais L7 « la Muette », le Martinet VMR-07, le terminal V40, Nadia Ferhat, Gérard Lenglet.
- La partie dure 1 h 45 au maximum (14:00 à 15:45, en temps réel). Un indice coûte 3 minutes. À ajuster après les premiers essais.
- Le mot « Minitel » n'apparaît pas dans le jeu.
- Cinq fins, dont une seule complète : « Deux étoiles ».

## Feuille de route pour Claude Code

### Étape 1 : préparer le moteur (faite)
Le moteur (`src/engine/`, `src/game/`) a reçu ce qui lui manquait. L'API est décrite dans `docs/moteur.md`, et vérifiée par `tests/game.test.js` :
- l'horloge à la seconde, affichée en rangée 00 (`14:23:05`) ;
- un agenda : chaque événement part au premier instant où l'horloge atteint ou dépasse son heure, même quand un indice la fait sauter de 3 minutes, et même à 15:45:00 ;
- des délais comptés sur l'horloge du jeu et sauvegardés avec la partie (`g.after()`) ; `g.later()` ne sert plus qu'à l'interface ;
- le choix du personnage (`g.s.gender`) et les accords `{masculin|féminin}` (`g.accord()`) ;
- la pénalité d'indice réglable (`hintPenalty`, 3 minutes) et le mode sans chrono (`g.newGame({ timed: false })`). Restent au scénario la liste des objectifs, l'objectif en cours et le texte des indices ;
- la messagerie : messages horodatés, questions débloquées par des découvertes, réponses différées de 15 à 40 secondes ;
- un état de partie sauvegardé en entier ;
- plusieurs fins (`g.finish()`), et des succès rangés à part, que `newGame()` n'efface pas.

### Étape 2 : le prologue et l'acte I (faite)
Écran titre, choix du personnage, ordre de mission, réveil, serveur du Martinet, puis E1 à E5, avec leurs tests. On joue jusqu'à la jonction. Les tests sont dans `tests/latence.test.js` (une seule solution par énigme) et `tests/latence-partie.test.js` (le déroulé, la mise en page, les mots interdits).

À valider par l'auteur :
- le refus de E5 quand le joueur tape moins de huit impulsions sans rien toucher, absent du dossier : « Le Martinet s'arrête avant l'anneau de jonction. Il revient en position d'attente. » ;
- trois textes d'interface ajoutés : « Partie en cours : ENVOI pour l'effacer. » sur l'écran titre (une partie en cours ne s'efface pas sur un seul appui), « Message envoyé. » dans la messagerie, et les phrases du guide ;
- les trous de la bande Baudot, dessinés sur les deux tiers hauts de la case pour ne pas se coller d'une ligne à l'autre ;
- l'écusson de l'ordre de mission, dessiné simplement en attendant la silhouette de l'étape 5.

### Étape 3 : l'acte II (faite)
Le serveur du relais (CONNEXION/FIN), puis E6 à E8, les archives, le message F2 et le démasquage, avec leurs tests. On joue jusqu'à l'ouverture des quartiers de garde ; la révélation qui suit est à l'étape 4.

À valider par l'auteur :
- une fois E6 réussie, le relais reconnaît le V40 : les appels suivants ne redemandent pas le code de maintenance ;
- deux refus absents du dossier : « Plan refusé : placez chaque liaison sur un canal de 1 à 5. » (un canal hors de 1 à 5) et « Mot de contrôle incorrect. » pour F2, puisque la liaison est déjà confirmée ;
- au démasquage (réponse à Q6), les réponses du faux Contrôle encore en route ne partent plus ; C08 et C09 se décident à leur arrivée, pour qu'aucun message signé CTL n'arrive après.

### Étape 4 : l'acte III et les fins (faite)
La révélation, la main courante, le dialogue, la remise en service, le message F3, le départ, E9 et les cinq fins. Le jeu se joue en entier, de l'écran titre à chacune des cinq fins, avec l'alarme de 15:35 et la fermeture de 15:45.

À valider par l'auteur :
- avant la révélation, le menu PARTIR ne nomme pas Irène, ce qui trahirait le retournement : sa seule ligne est « Partir vers la Terre » ;
- l'alarme raccourcie pour tenir sur la rangée 24 : « Plus que 10 minutes avant la fermeture. » ;
- un refus ajouté : « La mise en service exige un plan de fréquences validé. » (la clé 2 en main, sans plan) ;
- C10 arrive dès l'ouverture de la porte et s'affiche sous elle, après deux secondes ; la révélation, qui choisit les variantes de « Silence radio » et de « Hors délai » et passe la rangée 00 à « LA MUETTE », compte à partir de l'entrée dans les quartiers ;
- le succès « Sans filet » vaut pour toute fin atteinte sans indice en mode chronométré, « Hors délai » comprise ;
- ENVOI, sur un écran de fin, relance aussitôt une partie (choix du personnage), dans le même mode ; une fin trop longue pour une page continue en page 2, avec le bilan en bas de chaque page ;
- l'écusson se réduit pour l'instant à ses étoiles (une, puis deux) : dans un blason arrondi, à cette résolution, deux étoiles dessinent un visage. La silhouette complète viendra de l'image à l'étape 5.

### Étape 5 : l'interface et les sons (faite, sans image)
La photo du terminal et son calage, les écussons, le renommage en LATENCE, les dessins en pavés, puis les sons.

Fait :
- le renommage en LATENCE ;
- tous les sons du tableau de `interface.md`, avec les deux ambiances (la ventilation du Martinet, puis la cuve après la révélation) et les sons qui suivent l'affichage à 1200 bauds ;
- la page : l'écran seul et ses touches, sans image, et les réglages du tube dans un volet caché à droite ; sous 600 px, les touches sur trois rangées ;
- le martinet et le relais en pavés, sur l'accueil de chaque serveur ;
- les outils `npm run images` (photo et écussons) et `npm run mosaique` (silhouettes en pavés).

Mis de côté, en attendant de meilleures images : la photo du terminal et les trois écussons. Un essai avec des images provisoires a montré ce qu'il faut (voir `interface.md`, « Plus tard : la photo et les écussons ») ; le code reste prêt.

Reste :
- les images définitives, si l'on revient à la photo : gros plan en haute résolution (prompt 7 revu), écussons, silhouettes du prompt 8 ;
- l'écusson de mission en pavés : un blason et un relais ne tiennent pas dans sa place actuelle (9 colonnes sur 5 rangées) ;
- l'image de partage, `public/latence/partage.png`.

À valider par l'auteur :
- un son ajouté au tableau : le réveil, trois notes montantes, puisque le texte du réveil les annonce (« trois notes polies ») ;
- les accueils des serveurs : le dessin en haut à droite, le menu descendu d'une ou deux rangées ; le martinet retouché à la main, car à la taille de l'écran la silhouette brute faisait une cloche ;
- le volet des réglages : phosphore, courbure, balayage, halo et rémanence. Le bouton Phosphore de l'en-tête y est passé.

### Étape 6 : les essais (prête : reste à faire jouer)
Faire jouer des gens qui ne connaissent pas l'histoire. Mesurer le temps de chaque acte, noter où ils bloquent, et régler la fenêtre de retour, les indices et les textes.

Prêt :
- le journal de la partie, tenu par le moteur : scènes, étapes, indices, refus et fin, à l'heure du jeu et au temps réel joué ;
- le rapport d'essai, avec `?essai` : la durée des actes, chaque étape avec le temps passé avant elle, ses refus et ses indices, les scènes où le joueur s'attarde ; à copier ou à télécharger ;
- le protocole des séances, la grille d'observation, les questions, les réglages et un registre : `essais.md` ;
- une mesure du chemin le plus court : la jonction ne peut pas venir avant 14:12, et plus rien n'oblige à attendre ensuite.

Reste : les séances elles-mêmes, puis les réglages qu'elles décideront.

## Avant la sortie

- Chaque énigme a son test, et `npm test` passe.
- Une partie complète se joue au clavier seul, puis sur téléphone.
- Aucune information n'est uniquement sonore.
- Aucun indice n'est caché hors de l'écran.
- Aucune référence marine, marseillaise ou militaire, et jamais le mot « Minitel ».
- Les noms des marques ont été vérifiés à l'INPI.
