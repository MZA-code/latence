# LATENCE : l'interface et les sons

## La page

Une seule page, `index.html`. Le joueur ne voit que le terminal et ses touches.

### Pour l'instant : l'écran seul, sans image
- **L'écran.** Le tube dessiné en CSS, au centre, aussi grand que la hauteur le permet (74 % de la fenêtre).
- **Les touches.** Les neuf touches de fonction en HTML sous l'écran. Sur téléphone (moins de 600 px de large), elles passent sur trois rangées, et le clavier du téléphone s'ouvre par le champ invisible `#sink`.
- **L'en-tête.** Le mot LATENCE, puis deux boutons : Son, et Réglages.
- **Le volet des réglages.** Caché à droite, il s'ouvre par le bouton Réglages et glisse par-dessus la page, sans masquer le texte de l'écran sur un grand écran : on règle le tube en le regardant. Il contient le phosphore (blanc P4 ou vert P1), la courbure du verre, les lignes de balayage, le halo et la rémanence, et « Valeurs d'origine ». Les réglages s'appliquent en direct et se gardent avec les préférences (`minitel-escape:preferences`). Échap ou « Fermer » le referment ; tant qu'il a le focus, ses touches ne vont pas au jeu. Pas de nuancier des gris : il donnerait hors de l'écran la clé de l'énigme des câbles.
- **La légende** des raccourcis clavier, sous les touches.

### Plus tard : la photo et les écussons
La photo du terminal autour de l'écran et les écussons de part et d'autre sont mis de côté, en attendant de meilleures images. Le code reste prêt : le décor se déclare dans le scénario (`decor`, voir `docs/moteur.md`, « Le décor de la page »), `npm run images` prépare les fichiers à partir de `sources/images/`, et le banc d'essai fait le calage. Ce qu'on a appris avec les images provisoires :
- la photo entière plaçait l'écran à 38 % de sa largeur, et le texte devenait trop petit : il faut un gros plan, l'écran sur les trois quarts de la largeur (prompt 7 de `marques.md`) ;
- avec une photo, l'incrustation « opaque » fait dessiner au tube son propre verre, qui couvre les reflets de la photo sous le texte ;
- sur le fond sombre de la page, BAUDOT se lit sur un autocollant clair et LIGNE TERRE-MARS en version claire ; MARTINET garde sa plaque.

Déjà fait : l'en-tête LATENCE ; le mot « Minitel » retiré de tout ce que le joueur peut lire ou entendre (titres, descriptions, `aria-label`, banc d'essai), où l'on dit « le terminal » ; le paragraphe technique du pied de page retiré ; l'horloge à la seconde dans la rangée 00. Les noms internes du code (`Minitel`, `minitel.js`, les clés de stockage `minitel-escape:…`) restent.

## L'introduction d'ouverture

Seule exception à « tout sur l'écran du terminal » : une page noire avant que le tube s'allume, le temps de poser l'uchronie (texte : `textes.md`, § 0).

- **Seuil** (première visite) : un curseur qui clignote, « Entrer avec le son » ou « sans le son ». Ce geste débloque le son du navigateur et règle le bouton Son.
- **Dialogue** : Martian Mono, couleur du phosphore, halo et lignes de balayage en CSS. Les questions `>` se tapent à vitesse humaine (clic par touche), les réponses au téléscripteur (tic discret, bip à la fin de chaque réponse). Fond : un souffle grave et de lointains bips de données.
- **La frise** : les neuf relais s'allument un par un (une note qui monte), L7 clignote puis s'éteint (une note qui tombe), la ligne se coupe autour de lui.
- **Le compteur** de l'interruption tourne à la seconde.
- **Allumer le terminal** : la porteuse du modem, puis le tube s'allume sur l'écran titre. Le clavier du terminal n'est branché qu'après.
- Entrée, Échap ou « Passer » montrent tout ; rien ne s'anime avec `prefers-reduced-motion`. Déroulée en entier à la première visite seulement (`latence:intro-vue` dans `localStorage`), ensuite seul le bouton reste, avec « Revoir l'introduction ». Sautée avec `?instantane`.

## Les touches

Les touches suivent le code couleur du clavier d'époque, texte blanc : touches de fonction marron, Connexion/Fin noire, Envoi verte. Elles sont en relief doux (neumorphisme) sur un panneau mat, et s'y enfoncent quand on appuie. Chaque touche porte son raccourci clavier en petit sous son nom (masqué sur écran tactile). Sous l'écran, sur deux rangées basses : Sommaire, Annulation, Retour, Répétition, Guide ; puis Correction, Suite, Envoi (double largeur), Connexion/Fin. Le raccourci se met à côté du nom. Sur téléphone, trois colonnes.

## L'écran

### Les rangées
| Rangée | Contenu |
|---|---|
| 00 | Le lieu (voir `scenario.md`), l'heure `14:23:05`, l'indicateur F ou C |
| 01 | Une étiquette à droite, par exemple `2/3` |
| 02-03 | Le titre, en double hauteur |
| 05-21 | Le contenu |
| 23 | Les touches utiles sur cette page |
| 24 | Les notifications et les refus |

La rangée 00 fait 36 caractères utiles : une espace, le libellé sur 27 caractères, l'heure sur 8.

### Les dessins en pavés
Tous les dessins passent par les caractères semi-graphiques (2 × 3 pavés par case, 80 × 72 pavés sur les rangées 01 à 24, huit gris, deux gris par case). Un trait doit faire au moins deux pavés de large pour rester lisible à travers le tube.

| Dessin | Où | Détails |
|---|---|---|
| La Ligne | Écran titre | Un disque pour la Terre, neuf petits carrés pour les relais, un disque pour Mars. Le septième clignote. |
| Le martinet | Accueil du serveur du Martinet, en haut à droite (16 colonnes, rangées 01 à 07) | La silhouette de l'oiseau, ailes en faucille, en gris 70 %. Le menu commence en rangée 08. En dessous de 7 rangées, la silhouette ne se lit plus : une cloche à 5, un avion à 6 |
| Le relais L7 | Accueil du serveur du relais, en haut à droite (12 colonnes, rangées 01 à 06) | Un pylône, des paraboles, deux panneaux solaires, en gris 70 %. Rien qui ressemble à une tour à feu. Le menu commence en rangée 07 et le choix est en rangée 21, au-dessus du pied de page |
| Les câbles | Répartiteur (E2) | Quatre câbles, chacun dans sa couleur de la norme : câble 1 en rouge, 2 en jaune, 3 en vert, 4 en bleu. Le gris affiché vient donc du moteur. |
| La grille de jonction | Jonction (E5) | 9 × 7 cases de 3 colonnes sur 2 rangées. Structure en gris 40 %, Martinet en blanc, anneau de jonction en cadre. Rejeu case par case des impulsions. |
| La bande Baudot | Récepteur (E4, F2) | Une ligne par caractère, numérotée, cinq positions. Trou : pavé plein sur les deux tiers hauts de la case, pour que deux trous voisins ne se collent pas. Pas de trou : un point. Trois colonnes de 12 lignes par page, rangées 06 à 17 ; la table compacte en page 2 ; le champ du mot de contrôle en rangée 19 sur les deux pages. |
| L'écusson de la mission | Ordre de mission, puis fin « Deux étoiles » | Simplifié : une étoile dans l'ordre de mission, deux dans la fin « Deux étoiles ». Pour l'instant, les étoiles seules, dessinées pavé par pavé : à sa place (9 colonnes sur 5 rangées), un blason et un relais ne se liraient pas. Avec la silhouette, il faudra une place d'au moins 10 colonnes sur 8 rangées ; les étoiles resteront dessinées par le jeu dans le haut du blason |

Pour les silhouettes (martinet, relais, écusson), partir d'une image noir et blanc générée exprès (voir `marques.md`), la ranger dans `sources/mosaique/` et la convertir en pavés avec l'outil `tools/mosaique.mjs` :

```bash
npm run mosaique -- sources/mosaique/martinet.png --colonnes 12 --rangees 5 --nom MARTINET
```

Il lit le PNG et produit le dessin en chaînes, une par rangée de pavés (`#` allumé, `.` éteint), à coller dans `src/scenarios/latence/art.js`, où `dessin(p, r, c, lignes)` le pose. Retoucher le résultat à la main si besoin ; `--seuil` (0,5 par défaut) règle la part de noir qui allume un pavé.

## Les images

| Fichier | Contenu | Source | État |
|---|---|---|---|
| `public/latence/terminal-<largeur>.webp` (+ `.avif`) | Photo du V40, écran éteint, recadrée sur le verre et son cadre | Gemini, prompt 7 de `marques.md`, puis `npm run images` | mise de côté : à refaire en gros plan et haute résolution |
| `src/scenarios/latence/calage.json` | Les quatre coins de l'écran sur la photo | `banc.html`, « Copier le calage » | après la photo |
| `public/latence/ecussons/baudot.webp` | Logo de la Compagnie, en autocollant | Gemini, prompt 1, puis `npm run images` (bande repercée au motif exact) | mis de côté |
| `public/latence/ecussons/martinet.webp` | Emblème du Martinet, détouré | Gemini, prompt 3, puis `npm run images` | mis de côté |
| `public/latence/ecussons/ligne.webp` | Emblème de la Ligne Terre-Mars, pour fond sombre | Gemini, prompt 2, puis `npm run images` | mis de côté |
| `sources/mosaique/*.png` | Silhouettes noir et blanc à convertir en pavés : martinet, relais (l'écusson de la mission viendra plus tard) | Gemini, prompt 8, à partir des images des prompts 3, 4 et 6 | provisoires : découpées dans les logos 3 et 4 |
| `public/latence/partage.png` | Image de partage (titre LATENCE) | image existante de l'auteur | prête, à déposer |

Les images brutes de Gemini se rangent dans `sources/images/` (voir `marques.md`, « Après Gemini ») ; les fichiers du site en sont tirés. Aujourd'hui, la page n'en publie aucune : seules les silhouettes servent, converties en pavés dans `art.js`.

Budgets : la photo en AVIF ou WebP, moins de 200 ko, avec `srcset` ; chaque écusson moins de 30 ko, fond transparent.

## Les sons

Tous synthétisés avec Web Audio, sans fichier, et tous faits. Les recettes de LATENCE sont dans `src/scenarios/latence/sons.js` ; le clic, le bip, le modem et les outils de synthèse dans `src/engine/audio.js` (voir `docs/moteur.md`, « Le son »). Les sons qui accompagnent un affichage (la bande, le rejeu de la jonction, la remise en service) suivent la ligne à 1200 bauds, par des repères posés dans la page.

| Son | Quand | Recette | Niveau |
|---|---|---|---|
| Réveil | Écran du réveil, au prologue | Trois notes : 523, 659 puis 784 Hz | bas |
| Ventilation du Martinet | En continu, jusqu'à la révélation | Bruit brun, passe-bas à 300 Hz, lente modulation à 0,2 Hz | très bas |
| Cuve de spiruline | En continu, après la révélation | Petites bulles : impulsions graves et douces, au hasard, sur un bruit très filtré | très bas |
| Clic de touche | Chaque caractère et chaque touche de fonction | Bruit blanc de 8 ms, passe-haut à 2 kHz | bas |
| Bip | Refus (existant) | Sinus à 1 000 Hz, 120 ms | bas |
| Modem | Connexion au serveur du relais (existant) | Tonalités à 2 100 et 1 300 Hz | moyen |
| Message du Contrôle | Réception | Deux notes de 90 ms, 880 puis 1 320 Hz | bas |
| Message de la Terre | Pendant l'affichage de la bande | Grésillement (bruit passe-bande 1-3 kHz) et un « tac » par ligne | bas |
| Impulsion | Rejeu de la jonction | Souffle bref de 150 ms par impulsion | bas |
| Jonction | Réussite de E5 | Choc sourd (sinus à 60 Hz qui décroît en 300 ms), puis deux clics de verrouillage | moyen |
| Alarme | 15:35:00, puis un bip par minute | Trois bips graves à 440 Hz | moyen |
| Révélation | Entrée dans les quartiers | La ventilation du Martinet s'efface en 1,5 s, trois secondes de silence, puis la cuve de spiruline | silence |
| Remise en service | Rallumage de L7 | Une note qui monte, puis une pluie de clics : les 3 112 messages qui s'écoulent | moyen |
| Départ | Écran de départ | Grondement grave, pendant la durée de poussée accélérée | moyen |

Règles :
- **Aucune information uniquement sonore.** Tout ce qu'un son signale est aussi écrit à l'écran.
- Le son ne démarre qu'après un premier geste du joueur, et le bouton Son coupe tout.
- Rien de fort, rien de strident.

## Accessibilité

- Tout se joue au clavier (correspondances dans `src/ui/keyboard.js`). Un bouton focalisé à la souris ne capture pas Entrée.
- L'énigme des gris a un testeur qui donne des valeurs en chiffres : aucune énigme ne dépend de la finesse de la vue.
- Aucune épreuve de réflexe : tout ce qui est minuté se compte en minutes.
- Le mode sans chrono, sur l'écran titre.
- `prefers-reduced-motion` : pas de grain ni de scintillement, rejeu de la jonction instantané.
- Le canvas porte un `aria-label` mis à jour à chaque scène ; `screen.rowText(r)` permettra une lecture par lecteur d'écran.

## Réglages et sauvegarde

- Préférences (son, phosphore) : `minitel-escape:preferences`, comme aujourd'hui.
- Partie : `latence:partie:v1`. On y range aussi le choix du personnage, le mode sans chrono, les messages envoyés et reçus, les réponses en attente, les messages de la Terre décodés et la clé 2. L'état est sauvegardé en entier (voir `docs/moteur.md`).
- Succès : `latence:succes`, une clé à part, que `newGame()` ne doit pas effacer.
- Changer de suffixe de version dès que le format de la partie change.

## Performance

- Moins de 60 ko gzip de JavaScript pour la page du jeu. Aujourd'hui, le jeu complet, sons compris, pèse environ 42 ko.
- Si les textes alourdissent trop le fichier, charger l'acte III avec `import()`.
- Polices auto-hébergées et découpées par `unicode-range`, comme aujourd'hui.
