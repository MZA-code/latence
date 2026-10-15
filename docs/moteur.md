# Le moteur d'escape game

Ce document décrit comment écrire un scénario. Le moteur ne contient aucune histoire : il affiche des scènes, gère les champs de saisie, les cadenas, le serveur, l'horloge et son agenda, la messagerie, les indices, les fins, les succès et la sauvegarde. Tout le contenu vient d'un scénario.

## Les couches

```
src/engine/      le terminal : décodeur vidéotex, tube, ligne à 1200 bauds, son
src/game/        le moteur de jeu : Game (scènes, saisie, touches, serveur, horloge), GameState, mise en page
src/scenarios/   les histoires : données, scènes, dessins
src/main.js      la page du jeu : assemble le terminal + Game + scénario + clavier
```

Le scénario joué est choisi à un seul endroit, `src/scenarios/index.js` :

```js
export { default } from './latence/index.js';
```

Pour essayer une autre histoire, créer `src/scenarios/<nom>/index.js` et changer cette ligne. La page du jeu et le banc d'essai suivent.

## Le scénario

Un scénario est un objet exporté par défaut :

| Champ | Rôle |
|---|---|
| `title` | Nom du jeu |
| `storageKey` | Clé de sauvegarde dans le navigateur. Ajouter un suffixe de version (`:v2`) dès que le format de l'état change, sinon une vieille partie se recharge mal. |
| `clock` | `{ start, end, realMinutes, seconds }`. `start` et `end` en minutes depuis minuit du premier jour (14 h 00 = 840, 15 h 45 = 945 ; une nuit de 22 h 00 à 6 h 00 donnerait 1320 et 1800) ; `realMinutes` est la durée réelle de la partie sans indice. LATENCE se joue en temps réel : `realMinutes` vaut `end - start`. `seconds: true` affiche l'heure à la seconde (`14:23:05`). |
| `hintPenalty` | Minutes ajoutées à l'horloge par indice (3 dans LATENCE). Rien en mode sans chrono. |
| `replyDelay` | Délai par défaut des réponses aux questions de la messagerie, en secondes, ou `[min, max]` tiré au hasard. |
| `achievementsKey` | Clé de stockage des succès, à part de la partie : `newGame()` ne les efface pas. |
| `scenes` | `{ id: scène }`. Le moteur recopie la clé dans `scene.id`. |
| `start` | Scène de l'écran titre, affichée au démarrage. |
| `hintScene` | Scène ouverte par la touche GUIDE. |
| `newGame(g)` | Prépare une nouvelle partie (documents de départ…) et va à la première scène. |
| `resume(g)` | Reprend une partie sauvegardée : remettre la connexion à zéro, aller au lieu de départ. |
| `home(g)` | Renvoie l'id de la scène de SOMMAIRE selon l'état (hors connexion, connecté, identifié). |
| `server` | Facultatif. `{ name, loginScene, available(g), onLogin(g, user), onLogout(g) }`. Sans serveur, la touche CONNEXION/FIN ne fait que biper ; elle bipe aussi tant que `available(g)` est faux (serveur hors de portée). |
| `row0(g)` | Libellé de la rangée 00 (le lieu), 28 caractères au plus, 27 si l'heure affiche les secondes. L'heure s'affiche à droite. |
| `on` | `{ id: (g, data) => … }` : les gestionnaires des événements de l'agenda (voir « L'horloge et l'agenda »). |
| `onMessage(g, message)` | Facultatif. Appelé à l'arrivée de chaque message dans la messagerie : notification, découverte… |
| `events(g)` | Facultatif. Appelé à chaque nouvelle heure affichée (chaque seconde avec `seconds`, sinon chaque minute), la première comprise, y compris quand l'horloge a atteint sa fin ; plus jamais après `g.finish()`. Pour un événement à heure fixe, l'agenda est plus sûr. Le moteur ne décide pas de ce qui se passe à `end` : le scénario programme sa fin dans l'agenda, ou teste `g.s.over` ici. |
| `sons` | Facultatif. `{ nom: recette(audio, ...args) }` : les sons brefs, joués par `g.sound(nom)`. Voir « Le son ». |
| `ambiances` | Facultatif. `{ id: { start(audio) } }` : les fonds sonores en boucle. `start` lance l'ambiance et renvoie son arrêt, `(fondu) => …`. |
| `ambiance(g)` | Facultatif. L'id de l'ambiance voulue pour l'état présent, ou `null` pour le silence. Appelé à chaque image. |
| `decor` | Facultatif. Le décor de la page sur grand écran : `{ photo, ecussons: { gauche, droite } }`. Voir « Le décor de la page ». |
| `rapport(g)` | Facultatif. Le rapport d'essai, en texte, tiré du journal de la partie (`g.s.journal`) : la page l'affiche avec `?essai`. |

## Les scènes

Une scène est un objet. Seul `render` est obligatoire.

| Crochet | Rôle |
|---|---|
| `render(g, p, page)` | Dessine la page dans `p` (un `Vdt`, déjà effacé, curseur caché). |
| `fields(g, page)` | Liste des champs de saisie : `{ r, c, len, kind, mask?, auto? }`. Le moteur affiche les points de saisie et place le curseur sur le premier. |
| `menu(g)` | Table `{ valeur du premier champ: id de scène ou fonction(g) }`. Une valeur absente de la table refuse la saisie (« Choix inconnu. »). |
| `submit(g, values)` | Reçoit les valeurs de tous les champs quand on appuie sur ENVOI. |
| `next(g)` | Scène suivante, pour ENVOI ou SUITE sur la dernière page. |
| `key(g, k)` | Intercepte une touche avant le moteur. Renvoyer `true` pour la consommer. |
| `enter(g)` | Appelé à chaque arrivée sur la scène, avant `render` (pas aux changements de page). |
| `redirect(g)` | Renvoie l'id d'une autre scène à afficher à la place, ou `null`. Sert aux cadenas déjà ouverts. |
| `parent` | Scène atteinte par RETOUR quand l'historique est vide. |
| `pages` | Nombre de pages (nombre ou fonction de `g`). SUITE et RETOUR les parcourent. |
| `frozen` | `true` arrête l'horloge sur cette scène (écran titre, lecture d'un long document d'introduction, fin). |
| `notice` | Première rangée de la zone de refus : `g.reject()` y écrit son message sur trois rangées au plus, coupé aux mots. Sans zone, le refus va en rangée 24 et doit tenir sur une ligne. |

### Types de champ

| `kind` | Caractères acceptés |
|---|---|
| `digits` | 0 à 9 |
| `upper` (par défaut) | A à Z, 0 à 9, espace, point, tiret, apostrophe. Les minuscules et les accents sont repliés en majuscules sans accent. |
| `letters` | A à Z |
| `dirs` | H, B, G, D (cadenas directionnel) |

`mask: true` affiche des étoiles (mot de passe). Un champ plein passe au suivant, sauf avec `auto: false`.

### Ce que fait chaque touche

| Touche | Clavier | Effet |
|---|---|---|
| ENVOI | Entrée | Champ suivant s'il en reste, sinon `menu` (si la page a un champ de choix), sinon `submit`, sinon `next`, sinon bip |
| CORRECTION | Retour arrière | Efface le dernier caractère (revient au champ précédent s'il est vide) |
| ANNULATION | Échap | Vide tous les champs |
| SUITE / RETOUR | → / ← (ou Page suivante / précédente) | Page suivante ou précédente ; au bout, `next` ou l'historique puis `parent` |
| SOMMAIRE | Début | Vide l'historique et va à `home(g)` |
| GUIDE | F1 | Va à `hintScene` |
| RÉPÉTITION | F2 | Réaffiche la page |
| CONNEXION/FIN | Fin | Appelle le serveur (2 s de sifflement) ou raccroche |

## Ce qu'une scène peut appeler

| Appel | Effet |
|---|---|
| `g.go(id, { page, push, instant })` | Affiche une scène. `push: false` n'empile pas la scène courante dans l'historique. |
| `g.back()`, `g.home()`, `g.draw()` | Retour, sommaire, réaffichage |
| `g.reject(msg)` | La mauvaise réponse : bip, champs vidés, message dans la zone `notice` de la scène, sinon en rangée 24. Le bip est un code BEL envoyé sur la ligne : il sonne après ce qui est en cours d'affichage, par exemple à la fin d'un rejeu |
| `g.flash(msg)` | Message en rangée 24 sans toucher aux champs : une notification |
| `g.bell()` | Bip |
| `g.sound(nom, ...args)` | Joue `scenario.sons[nom]`. Rien avant le premier geste du joueur, ni avec le son coupé |
| `g.unlock(flag)` | Marque une étape franchie (`g.s.flags[flag] = true`), note son heure (`g.s.times[flag]`) et sauvegarde |
| `g.login(user)` | Ouvre une session sur le serveur, appelle `server.onLogin` |
| `g.schedule(id, heure, data)`, `g.after(id, secondes, data)`, `g.cancel(id)` | L'agenda : voir plus bas |
| `g.receive(id)`, `g.post(id, délai)`, `g.write(id)`, `g.ask(question)`, `g.questions(liste)`, `g.markRead(id)` | La messagerie : voir plus bas |
| `g.takeHint(objectif)` | Donne l'indice suivant et renvoie son niveau (0 s'il n'y en a plus, trois par défaut) ; l'horloge avance de `hintPenalty` minutes, sauf sans chrono |
| `g.hintLevel(objectif)` | Nombre d'indices déjà obtenus : ils se relisent gratuitement |
| `g.accord(texte)` | Accorde le texte au personnage (`g.s.gender`) : `seul{\|e}`, `{technicien\|technicienne}` |
| `g.finish(fin, scène)` | Termine la partie sur une fin (`g.s.ending`) et affiche sa scène : horloge arrêtée, agenda vidé, partie qui ne se reprend plus |
| `g.log(type, données)` | Note un événement au journal de la partie (voir « L'état »). Le moteur y note déjà les scènes, les étapes, les indices, les refus et la fin |
| `g.achieve(id)` | Succès obtenu : noté pour la partie (`g.s.achieved`) et rangé à part pour toutes les parties (`g.achievements.has(id)`) |
| `g.later(fn, ms)` | Minuterie du navigateur, pour l'interface seulement (sifflement du modem), annulée si le terminal s'éteint. Les délais de l'histoire passent par `g.after()` |
| `g.newGame(réglage)`, `g.resume(état)`, `g.savedState()` | Parties. `réglage` s'applique à l'état avant `scenario.newGame`, ex. `{ timed: false }` pour le mode sans chrono. `savedState()` ne renvoie pas une partie terminée |
| `g.m` | Le terminal lui-même, l'objet `Minitel` du moteur (`statusChar`, `row0Text`, `send`…) |

### L'état

- `g.s` est sauvegardé en entier : `timed` (faux en mode sans chrono), `gender` (`'m'` ou `'f'`), `flags` et `times` (étapes franchies et leur heure), `docs` (documents du dossier, dans l'ordre de découverte), `hints` (niveau d'indice par objectif), `seen` (ce que le joueur a vu), `penalty` (minutes ajoutées), `elapsedMs`, `agenda`, `mail`, `data` (données propres au scénario), `achieved` (succès de la partie), `ending` (fin atteinte), `journal` (ce qui s'est passé, pour les essais : `{ e, t, r, … }` avec `e` le type (`scene`, `etape`, `indice`, `refus`, `fin`), `t` l'heure du jeu et `r` le temps réel joué, en secondes ; 2 000 entrées au plus). Méthodes : `time()`, `minutes()`, `clockText()`, `over`, `addDoc(id)`, `hintsUsed()`, `sent(id)`, `received(id)`, `unread()`.
- Changer le suffixe de `storageKey` dès que le sens d'un champ change ; un champ ajouté prend sa valeur par défaut dans une vieille sauvegarde.
- `g.vars` n'est pas sauvegardé : lettre ouverte, fiche consultée, objectif affiché par le guide.
- `g.notified` garde les événements déjà déclenchés pendant la séance.
- `g.mode` vaut `local`, `dial`, `online` ou `off` ; `g.session` est l'utilisateur connecté.

## L'horloge et l'agenda

- L'heure du jeu se compte en secondes depuis minuit du premier jour : `g.now` (14:00:20 vaut 50 420). `hms(t)` et `hm(t)`, dans `src/game/state.js`, l'écrivent `14:00:20` et `14:00`.
- L'horloge tourne en temps réel, sauf sur une scène `frozen`, quand l'onglet est caché et après `g.finish()`. En mode chronométré, elle s'arrête à `end` et `g.s.over` devient vrai ; sans chrono, elle continue et `over` reste faux.
- `g.schedule(id, heure, data)` programme un événement, `g.after(id, secondes, data)` le programme dans un délai, `g.cancel(id, filtre)` retire ceux qui portent cet identifiant et dont les données passent le filtre (tous, sans filtre).
- Un événement part **au premier instant où l'horloge atteint ou dépasse son heure**, même quand un indice l'a fait sauter de plusieurs minutes, et même quand l'horloge a atteint sa fin. Les événements dépassés partent dans l'ordre chronologique. Le moteur appelle alors `scenario.on[id](g, data)`.
- Pendant ce gestionnaire, `g.now` vaut l'heure prévue de l'événement, pas l'heure affichée : un `g.after()` s'y compte depuis l'événement, et `g.unlock()`, `g.receive()` ou `g.write()` notent cette heure. Le message C09 de LATENCE, une minute après F2, reste donc une minute après F2 même si un indice a fait sauter l'horloge entre les deux.
- L'agenda est sauvegardé avec la partie : `data` doit tenir en JSON, sans fonction. Programmer un événement sans gestionnaire est une erreur.
- L'identifiant `message` est réservé : il livre un message de la messagerie.

## La messagerie

- `g.s.mail` range les messages par heure : `{ id, at, out: true }` pour un message envoyé par le joueur, `{ id, at, read }` pour un message reçu. Le texte vit dans le scénario ; l'état ne garde que l'identifiant et l'heure.
- `g.receive(id)` : un message arrive maintenant, non lu, et `scenario.onMessage` est appelé. `g.post(id, délai)` : il arrivera dans `délai` secondes, un nombre ou `[min, max]`. `g.write(id)` : le joueur envoie un message.
- `g.ask(question)` pose une question `{ id, reply, delay, when }` : elle part tout de suite, et sa réponse `reply` arrive après `delay` (par défaut `scenario.replyDelay`). Une question ne part qu'une fois : la seconde fois, `ask` renvoie `null`.
- `g.questions(liste)` garde les questions débloquées (`when(g)` vrai, ou pas de `when`) qui ne sont pas encore parties.
- `g.markRead(id)` marque un message lu ; `g.s.unread()` compte les messages non lus, `g.s.sent(id)` et `g.s.received(id)` disent si un message est parti ou arrivé.
- Le hasard des délais vient de l'option `random` du constructeur de `Game` (`Math.random` par défaut) : les tests la fixent.

## Le son

Tout est synthétisé avec Web Audio par `src/engine/audio.js`, sans fichier. Rien ne sonne avant le premier geste du joueur (une touche, un clic), et le bouton Son coupe tout, ambiances comprises. Un son raté ne casse jamais la partie. Aucune information n'est uniquement sonore : ce qu'un son signale est aussi écrit à l'écran.

- **Les sons brefs.** `scenario.sons` range des recettes, `(audio, ...args) => { … }`. Une scène en joue une avec `g.sound(nom, ...args)`.
- **Les ambiances.** `scenario.ambiances` range des fonds en boucle, `{ start(audio) }`. À chaque image, le moteur demande `scenario.ambiance(g)` : tant que l'id ne change pas, rien ne se passe ; quand il change, l'ancienne ambiance s'efface en 1,5 s et la nouvelle démarre. `null`, le terminal éteint et le son coupé valent le silence.
- **Le son au rythme de la ligne.** `p.mark(fn)` pose un repère dans la page, à l'endroit où l'on en est des octets : la ligne appelle `fn` quand elle a affiché tout ce qui le précède. Les repères d'une page affichée d'un coup (`?instantane`, retour à l'écran titre) partent tous aussitôt ; ceux d'une page remplacée avant la fin de son affichage ne partent pas.

Les outils pour écrire une recette :

| Outil | Rôle |
|---|---|
| `audio.now` | L'heure du contexte audio, en secondes : l'origine des sons à programmer |
| `audio.tone(fréquence, t, durée, volume, { type, to })` | Une note, sinusoïdale par défaut, qui glisse jusqu'à la fréquence `to` si on la donne |
| `audio.noise(t, durée, volume, filtre, couleur)` | Un bruit bref, `'blanc'` ou `'brun'`, passé dans un filtre `{ type, frequency, Q }` s'il y en a un |
| `audio.bed(volume, { color, filter, lfo, delay, fadeIn })` | Une nappe de bruit en boucle, pour les ambiances : lente modulation du volume à `lfo` Hz, départ retardé de `delay` s, montée en fondu. Renvoie l'arrêt |
| `audio.every(min, max, fn, délai)` | Appelle `fn(heure)` au hasard, toutes les `min` à `max` secondes, après `délai`. Renvoie l'arrêt |

Volumes : 0,01 pour une ambiance, 0,03 pour un son bas, 0,05 pour un son moyen. Les gains partent de zéro : aucun claquement au départ d'un son.

## Le décor de la page

La page du jeu (`src/main.js`) pose le décor du scénario avec `mountDecor()` (`src/ui/decor.js`). Il n'existe que sur grand écran, à partir de 600 px de large (`WIDE`) ; en dessous, l'écran garde son tube dessiné en CSS et rien n'est chargé. Tout y est décoratif (`alt` vide, `aria-hidden`) : aucun indice n'est hors de l'écran du terminal.

- **La photo** : `{ fichier, largeur, hauteur, tailles, calage }`. Les fichiers sont `<fichier>-<taille>.avif` et `.webp` dans `public/`, une taille par largeur. La photo ne remplace le tube qu'une fois chargée.
- **Le calage** est l'export du banc d'essai (`banc.html`, « Copier le calage »), copié tel quel : coins nommés en % de la photo, que `cornersFromCalage()` (`src/ui/placement.js`) remet dans l'ordre de `placeScreen`. De sa partie `rendu`, seule l'incrustation compte : `incrustation: 'opaque'` fait dessiner au tube son propre verre sombre, qui couvre les reflets de la photo. Le reste du tube suit les réglages du joueur (le volet des réglages, `src/ui/reglages.js`).
- **Les écussons** : `{ fichier, largeur, hauteur }`, rangés dans une colonne de chaque côté de l'écran. Les fichiers sont au double de leur taille d'affichage. Une colonne plus étroite que 120 px les masque.

## Mise en page : `src/game/ui.js`

Convention d'écran : rangée 00 pour le lieu et l'heure, rangée 01 pour une étiquette (`tag`, ex. « 2/3 »), rangées 02 et 03 pour le titre en double hauteur, rangées 05 à 21 pour le contenu, rangée 23 pour les touches utiles, rangée 24 pour les messages.

| Fonction | Rôle |
|---|---|
| `title(p, texte, r = 3)` | Titre en double hauteur |
| `para(p, r, texte, { c, width, fg, gap })` | Paragraphe coupé aux mots ; renvoie la rangée suivante |
| `paras(p, r, liste, options)` | Paragraphes collés ; `''` insère une rangée vide |
| `menuLine(p, r, n, libellé, état)` | Ligne de menu numérotée, état discret à droite |
| `choicePrompt(p, r)` | « Votre choix : . puis ENVOI » ; renvoie le champ correspondant |
| `footer(p, [[touche, effet], …])` | Rangée 23 ; ce qui ne tient pas est abandonné, mettre l'essentiel en premier |
| `rule(p, r)`, `tag(p, texte)` | Filet horizontal, étiquette en haut à droite |
| `typo(texte)`, `wrap(texte, largeur)` | Espaces insécables avant « : ; ! ? », coupure en lignes |
| `accord(texte, genre)` | `seul{\|e}` donne « seul » (`'m'`, ou personnage pas encore choisi) ou « seule » (`'f'`). À réserver aux textes : en G0, `{ \| }` dessinent aussi des filets |

Couleurs (`fg`) sur le tube monochrome : 7 blanc (100 %), 3 jaune (90 %), 6 cyan (80 %), 2 vert (70 %), 5 magenta (60 %), 1 rouge (50 %), 4 bleu (40 %). En pratique : 7 pour le texte, 6 pour les consignes, 2 pour l'ambiance, 4 pour le discret.

## Concevoir une énigme

1. **Tout est à l'écran.** Aucun texte caché dans le HTML ou le CSS, rien à révéler par une sélection, le code source, la console ou les outils de développement. Un indice s'affiche en clair ; la difficulté vient du raisonnement, du déchiffrement et des recoupements.
2. **Un cadenas visible dès le début.** Le joueur sait ce qu'il cherche (trois nombres, huit directions, un mot de passe) avant de savoir où chercher.
3. **Deux sources au moins.** Une bonne réponse naît d'un recoupement : un document donne la méthode, un autre la clé.
4. **Une seule solution, prouvée par un test.** Les données de l'énigme vivent dans `data.js` ; un test de `tests/` vérifie que la solution se déduit des documents affichés et qu'elle est unique.
5. **Trois indices par objectif**, du plus vague au plus précis, chacun contre quelques minutes (3 dans LATENCE). Un indice déjà obtenu se relit gratuitement.
6. **Papier et crayon** : annoncés dès l'écran titre, jamais indispensables pour plus de quelques minutes d'affilée.
7. **Un message de refus qui a du caractère** (« Pas de signal. Le câblage ne correspond pas à la chaîne de réception. »), jamais un simple « Erreur ».

## Outils de développement

- `?instantane` : les pages s'affichent sans attendre la ligne à 1200 bauds.
- `?essai` : un bouton « Rapport d'essai » affiche `scenario.rapport(g)`, à copier ou à télécharger (voir `docs/latence/essais.md`).
- `?debug` : le jeu est exposé dans la console sous `window.jeu`. Exemples : `jeu.s.elapsedMs += 30 * 60000` avance l'horloge de 30 minutes réelles ; `jeu.unlock('antenne')` marque une étape franchie ; `jeu.go('bord')` saute à une scène ; `jeu.s.agenda` montre les événements à venir.
- `tests/helpers.js` fait tourner le vrai moteur dans Node, sans tube : `harness(scénario)` donne le jeu, `run(secondes)` fait passer le temps image par image, `row(r)` lit une rangée de l'écran. Le son y est muet : `audio.played` liste les sons joués, par nom de recette, et `audio.current` donne l'ambiance demandée. `FakeAudioContext` fait tourner les vraies recettes sans haut-parleur.
- `npm run images` prépare les images du site (`tools/images.mjs`, ffmpeg requis) à partir des images brutes de `sources/images/` : la photo recadrée en AVIF et en WebP, les écussons détourés en WebP, et leur fiche dans le scénario (`images.json`). Après un nouveau recadrage de la photo, recaler l'écran dans le banc avec la photo publiée.
- `npm run mosaique -- image.png --colonnes 12 --rangees 5` convertit une silhouette noir et blanc en dessin en pavés (`tools/mosaique.mjs`). L'image se centre dans la zone en gardant ses proportions ; un pavé s'allume quand sa part de noir atteint `--seuil` (0,5 par défaut). Le résultat est un tableau de chaînes, une par rangée de pavés (`#` allumé, `.` éteint), à coller dans le scénario et à retoucher à la main ; LATENCE le pose avec `dessin(p, r, c, lignes)` (`src/scenarios/latence/art.js`). Le PNG doit être en 8 bits, non entrelacé.
- `banc.html` : le jeu tourne dans l'écran avec la photo, le calage des coins et les réglages du tube.

## Pistes techniques

- Les réponses sont comparées dans le navigateur, donc lisibles dans le JavaScript par un curieux. Pour le scénario définitif, stocker une empreinte (SHA-256 via `crypto.subtle`) plutôt que la réponse en clair.
- Charger les chapitres avec `import()` quand le scénario grossira, pour garder la coquille légère.
