# LATENCE : consignes pour Claude Code

## Le projet

LATENCE est un escape game d'environ 1 h 30, joué entièrement sur un terminal vidéotex recréé pixel par pixel dans le navigateur. Le site s'adresse aux joueurs : il ne contient aucune information personnelle sur son auteur.

**L'histoire est écrite.** Tout est dans `docs/latence/` : l'univers, le scénario, les énigmes et leurs solutions, les textes, l'interface, les sons et les marques. Commencer par `docs/latence/README.md`, qui donne l'ordre de lecture et la feuille de route.

- **Le moteur est prêt** : le terminal (décodeur vidéotex, tube, ligne à 1200 bauds) et le moteur d'escape game (scènes, champs, serveur, horloge, indices, sauvegarde). Son API est décrite dans `docs/moteur.md`.
- **Le scénario `src/scenarios/latence/` contient tout le jeu**, du prologue aux cinq fins, avec ses sons. La page n'affiche pas d'image pour l'instant : l'écran, ses touches, et les réglages du tube dans un volet caché à droite.
- **L'auteur valide l'histoire.** Ne pas inventer de rebondissement, de personnage ou de fin qui ne figure pas dans `docs/latence/`. En cas de doute, demander. Les textes de `textes.md` sont une version de travail : les reprendre sans en changer le sens.

## Règles du jeu, non négociables

- **Tout se passe sur l'écran du terminal.** Objets, documents, cadenas et fins s'affichent dans l'écran. Hors de l'écran, seulement les touches de fonction, le son, le phosphore, des écussons décoratifs, et l'introduction d'ouverture (une page noire avant l'allumage, qui pose l'uchronie, sans aucun indice : `textes.md`, § 0).
- **Aucun indice caché.** Pas de texte masqué dans le HTML ou le CSS, rien à révéler par une sélection, le code source, la console ou les outils de développement.
- **Chaque énigme a une seule solution, prouvée par un test** (`tests/latence.test.js`, à partir de `src/scenarios/latence/data.js`).
- **Trois indices par objectif**, du plus vague au plus précis, chacun contre 3 minutes.
- **Aucune information uniquement sonore.**
- **Papier et crayon** sont annoncés sur l'écran titre.

## Les interdits de l'univers

- **Rien de marin ni de nautique** : pas de phare, de port, de navire, de quai, de coque, de pont, d'ancre. On dit « jonction », jamais « accostage » ni « amarrage ».
- **Rien sur Marseille ni la Provence.**
- **Pas de guerre, pas de militaires, rien sur la période soviétique.**
- **Pas d'internet, d'ordinateur personnel ni de smartphone** dans le monde du jeu. Tout passe par des terminaux et des serveurs.
- **Jamais le mot « Minitel »**, ni dans le jeu, ni dans l'interface, ni dans les `aria-label`. C'est une marque. On dit « le vidéotex » et « le terminal ».
- **Pas de marque ni de personne réelle**, à part l'hommage à Émile Baudot et la citation de La Fontaine.

## Commandes

```bash
npm install
npm run dev      # serveur de développement (http://localhost:5173)
npm test         # tests du décodeur, du moteur de jeu et des énigmes (Vitest)
npm run build    # build de production dans dist/ (jeu + banc d'essai)
npm run preview  # sert dist/ en local
npm run mosaique -- image.png --colonnes 12 --rangees 5   # silhouette noir et blanc → dessin en pavés
npm run images   # images du site (photo, écussons) depuis sources/images/ (ffmpeg)
```

- `index.html?instantane` affiche les pages sans attendre la ligne à 1200 bauds, et saute l'introduction.
- `index.html?debug` expose le jeu dans la console sous `window.jeu`.
- `index.html?essai` ajoute le rapport d'essai de la partie, pour les séances avec des joueurs (`docs/latence/essais.md`).
- `banc.html` fait tourner le jeu avec la photo, le calage des coins et les réglages du tube.

Lancer `npm test` après toute modification de `src/engine/`, de `src/game/` ou des données du scénario.

## Architecture

```
index.html              page du jeu
banc.html               banc d'essai : photo, calage 4 coins, réglages du tube, lecture .vdt
src/main.js             assemblage de la page du jeu : terminal + Game + scénario + clavier
src/bench-main.js       assemblage du banc d'essai
src/engine/             le terminal, sans aucun contenu
  constants.js          géométrie, niveaux de gris (GREY), pavés
  font-data.js          police 8 × 10 dessinée en ASCII art, modifiable à la main
  font.js               conversion en octets, composition des accents
  screen.js             mémoire de page 25 × 40
  decoder.js            décodeur vidéotex (C0, ESC, US, REP, SS2, CSI, attributs série)
  raster.js             mémoire de page → trame 320 × 250, rémanence
  crt/                  shader du tube (WebGL 1) et repli 2D
  line.js               débit de la ligne (1200 bit/s = 120 caractères par seconde)
  vdt.js                construction de pages : Vdt (repères mark), encodeText, mosaicArt, sampler
  power.js              allumage du tube
  audio.js              son Web Audio : clic, bip, modem, ambiances, outils de synthèse
  minitel.js            façade : le seul objet que le jeu utilise
src/game/               le moteur d'escape game, sans aucune histoire
  game.js               scènes, saisie, touches, serveur, horloge, agenda, messagerie, indices, fins
  state.js              état sauvegardé d'une partie, heures du jeu (hms, hm)
  achievements.js       succès, rangés à part de la partie
  ui.js                 mise en page : titres, paragraphes, menus, pied de page, accords
src/scenarios/index.js  le scénario joué (une ligne)
src/scenarios/latence/  LATENCE
  index.js              le scénario : scènes, début de partie, reprise, événements de l'agenda
  data.js               les données du jeu, une seule fois : dates, énigmes, refus
  enigmes.js            les règles des énigmes, en fonctions pures (écrans et tests)
  messages.js           la messagerie du Contrôle : messages, questions, réponses
  recit.js              l'acte III : main courante, note de Lenglet, dialogue, F3, fins
  indices.js            les objectifs et leurs trois indices
  intro.js              l'introduction d'ouverture, avant l'allumage du terminal
  art.js, page.js       les dessins en pavés (dessin, ecusson…) ; la mise en page commune
  sons.js               les sons brefs et les deux ambiances
  essai.js              le rapport d'essai (?essai), tiré du journal de la partie
  scenes/               prologue, bord (Martinet), recepteur, messagerie, documents, relais,
                        quartiers, fins, guide
src/ui/                 clavier, introduction d'ouverture, placement de l'écran, volets (réglages, rapport d'essai), décor (photo,
                        écussons ; en sommeil), stockage, homographie
src/bench/              panneaux du banc d'essai
src/styles/             CSS découpées (jetons, base, scène, touches, panneau, jeu)
tests/                  décodeur vidéotex, moteur de jeu (helpers.js), son, réglages, énigmes et déroulé de
                        LATENCE (rapport d'essai compris), décor, outils d'images (fixtures/ : deux PNG de référence)
tools/mosaique.mjs      silhouette PNG → dessin en pavés, sans dépendance
tools/images.mjs        images brutes → photo recadrée (AVIF, WebP) et écussons détourés, par ffmpeg
sources/                images brutes de Gemini (images/) et silhouettes (mosaique/), hors du site
docs/latence/           le dossier de conception du jeu
docs/moteur.md          API des scénarios et des scènes
docs/videotex.md        mémo du protocole
```

### Principes
- **Le moteur ne connaît aucune histoire.** Tout le contenu vient du scénario. Les extensions nécessaires au jeu (horloge à la seconde, messagerie, accords…) restent génériques et vont dans `src/game/`.
- **La mémoire de page fait foi.** On ne dessine jamais de texte dans le canvas avec une police système : tout passe par le décodeur, puis le tramage, puis le shader.
- **Fidélité à la STUM 1B.** Toute règle nouvelle ou corrigée du décodeur s'accompagne d'un test dans `tests/decoder.test.js`.
- **Les données des énigmes vivent dans `data.js`**, une seule fois. Les écrans et les tests les lisent au même endroit.
- **Pas de framework.** Du JavaScript en modules ES et Vite. Aucune dépendance sans vraie nécessité.

## Écrire une page

```js
// src/scenarios/latence/scenes/martinet.js
import { title, para, footer } from '../../../game/ui.js';

render(g, p) {                                     // p est un Vdt déjà effacé
  title(p, 'Répartiteur');                         // double hauteur : rangées 2 et 3
  para(p, 5, 'Branchez chaque câble sur son entrée.');
  p.at(14, 3).fg(6).text('Entrée A :');
  footer(p, [['ENVOI', 'essayer'], ['RETOUR', 'les systèmes']]);
}
```

- 40 colonnes, rangées 01 à 24. La rangée 00 est la ligne de service : lieu, heure, indicateur F ou C.
- `at()` émet un US, qui **réinitialise les attributs** : redonner la couleur après chaque positionnement.
- Les minuscules accentuées passent, **pas les majuscules accentuées** : l'encodeur écrit « ETES » pour « ÊTES ».
- Utiliser `vlen()` et `center()` pour les largeurs : un caractère accentué occupe une seule colonne.
- La couleur de fond est un attribut série : elle ne s'applique qu'à partir de l'espace suivant.
- Les dessins passent par `mosaicArt(p, rangée, colonne, largeur, hauteur, pix)` et `sampler()`. `pix` renvoie -1 ou une couleur, + 8 pour des pavés disjoints, + 16 pour qu'ils clignotent. Un trait doit faire au moins deux pavés de large. Une silhouette se convertit avec `npm run mosaique` et se pose avec `dessin()` (`art.js`), en gris 70 % (couleur 2) pour un dessin d'ambiance.
- Un son qui accompagne l'affichage se pose dans la page : `p.mark(() => g.sound('tac'))` part quand la ligne atteint ce point. Aucune information uniquement sonore : ce que le son signale est aussi écrit.
- Une page qui refuse des saisies déclare sa zone de refus, `notice: 20` : les refus de `data.js` font souvent deux ou trois lignes, et la rangée 24 n'en tient qu'une.
- Passer les textes par `para()` ou `typo()` : espaces insécables avant « : ; ! ? ».
- Les heures officielles s'écrivent `14:32`. Seule Irène écrit `14h32` : ne jamais corriger ses heures, c'est un indice.

## Ton et langue

- Le code, les commentaires et l'interface sont en **français**.
- Le narrateur vouvoie le joueur. Irène tutoie Alix dès qu'elle se démasque (réponse à Q6 ou message C10), jamais avant.
- L'humour est précis, sec et riche en vocabulaire, sans vulgarité.
- Services, sociétés et personnes sont fictifs.

## Performance

- Moins de **60 ko gzip de JavaScript** pour la page du jeu. Au-delà, charger l'acte III avec `import()`.
- Polices auto-hébergées (`@fontsource`), découpées par `unicode-range`.
- Photo du terminal en AVIF ou WebP, moins de 200 ko, avec `srcset`.
- La boucle de rendu tourne à chaque image : garder `raster.draw` sans allocation.
- Respecter `prefers-reduced-motion`.

## Accessibilité

- Tout se joue au clavier (`src/ui/keyboard.js`). Un bouton focalisé à la souris ne capture pas Entrée.
- Sur mobile, un champ invisible (`#sink`) ouvre le clavier du téléphone.
- Le canvas porte un `aria-label` mis à jour ; `screen.rowText(r)` donne le texte d'une rangée.

## À ne pas faire

- Casser un test pour faire passer une page : corriger la page.
- Utiliser `localStorage` ou IndexedDB sans `try/catch`.
- Cacher un indice ailleurs que sur l'écran du terminal.
- Ajouter des informations personnelles sur l'auteur.
