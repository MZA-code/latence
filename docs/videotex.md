# Mémo Vidéotex : ce que le moteur implémente

Référence : **STUM 1B**, spécifications techniques d'utilisation du Minitel 1B, dont une version web existe sur <https://jbellue.github.io/stum1b/>. Ce mémo résume les règles codées dans `src/engine/`. Les tests de `tests/decoder.test.js` les vérifient.

## Écran

| Élément | Valeur |
|---|---|
| Grille | 40 colonnes × 25 rangées |
| Rangée 00 | Rangée de service. Colonnes 1 à 36 pour les messages, 37 à 40 pour l'état du terminal (« F » ou « C » en fond inversé, colonne 39) |
| Matrice | 8 × 10 points par emplacement, caractère dessiné en 5 × 7 |
| Trame | 320 × 250 points |
| Semi-graphiques | 2 × 3 pavés par emplacement, hauteurs 3, 4 et 3 lignes |
| Couleurs | 8 couleurs, affichées en gris sur Minitel monochrome |
| Clignotement | 0,5 Hz |
| Curseur | Pavé clignotant en couleur complémentaire, visible même sur un texte noir sur noir |

### Couleurs et niveaux de gris

| Code | ESC caractère | ESC fond | Couleur | Gris |
|---|---|---|---|---|
| 0 | `1B 40` | `1B 50` | noir | 0 % |
| 1 | `1B 41` | `1B 51` | rouge | 50 % |
| 2 | `1B 42` | `1B 52` | vert | 70 % |
| 3 | `1B 43` | `1B 53` | jaune | 90 % |
| 4 | `1B 44` | `1B 54` | bleu | 40 % |
| 5 | `1B 45` | `1B 55` | magenta | 60 % |
| 6 | `1B 46` | `1B 56` | cyan | 80 % |
| 7 | `1B 47` | `1B 57` | blanc | 100 % |

## Codes de commande (C0)

| Code | Nom | Effet |
|---|---|---|
| `00` | NUL | Bourrage : ignoré partout, mais il occupe la ligne. Sert à ralentir un affichage. |
| `07` | BEL | Bip |
| `08` `09` `0A` `0B` | BS HT LF VT | Déplacements. Débordement d'une rangée sur l'autre, bouclage 24 ↔ 1 en mode page. |
| `0C` | FF | Efface les rangées 01 à 24 (pavés noirs), curseur en 01/01, attributs par défaut. La rangée 00 reste intacte. |
| `0D` | CR | Début de rangée |
| `0E` `0F` | SO SI | Passage en semi-graphique (G1) ou en alphanumérique (G0) |
| `11` `14` | CON COFF | Curseur visible ou caché |
| `12 n` | REP | Répète le dernier caractère (n − 0x40) fois |
| `18` | CAN | Remplit d'espaces jusqu'à la fin de la rangée |
| `19` | SS2 | Caractère du jeu G2 : accent ou symbole |
| `1A` | SUB | Pavé d'erreur |
| `1E` | RS | Curseur en 01/01, attributs par défaut |
| `1F r c` | US | Positionnement en rangée r − 0x40, colonne c − 0x40. Réinitialise les attributs. `US 40 xx` accède à la rangée 00 ; LF y ramène ensuite. |

## Attributs (ESC + code)

- **Attributs de caractère** : couleur de caractère, clignotement (`48`/`49`), taille (`4C` normale, `4D` double hauteur, `4E` double largeur, `4F` double taille), inversion (`5D`/`5C`). Ils suivent le curseur.
- **Attributs de zone (série)** : couleur de fond (`5x`), soulignement (`5A`/`59`) et masquage (`58`/`5F`). Ils restent latents jusqu'au prochain **délimiteur**. Le délimiteur est un espace en G0 ; en G1, tout semi-graphique valide aussi la couleur de fond. La zone s'étend jusqu'au délimiteur suivant ou jusqu'à la fin de la rangée.
- En G1, `5A` rend les pavés **disjoints** ; la taille et l'inversion y sont ignorées.
- Un caractère en double hauteur occupe la rangée courante et celle du dessus. La double hauteur est refusée en rangées 00 et 01.
- Masquage plein écran : `1B 23 20 58` masque, `1B 23 20 5F` révèle les zones masquées.

## Jeu G2 (SS2 + code)

- **Accents** : `41` grave, `42` aigu, `43` circonflexe, `48` tréma, `4B` cédille, suivis de la lettre. Seules les minuscules à â ä é è ê ë î ï ö ô ù û ü ç s'affichent accentuées. Il n'existe **aucune majuscule accentuée**.
- **Symboles** : `23` £, `24` $, `26` #, `27` §, `2C` ←, `2D` ↑, `2E` →, `2F` ↓, `30` °, `31` ±, `38` ÷, `3C` ¼, `3D` ½, `3E` ¾, `6A` Œ, `7A` œ, `7B` ß.

## Particularités du jeu G0

Sur Minitel, plusieurs caractères ASCII servent de flèche ou de filet :

| Code | Affichage |
|---|---|
| `5E` (^) | ↑ |
| `5F` (_) | filet bas |
| `60` (`) | filet médian |
| `7B` `7C` `7D` ({ \| }) | filets verticaux gauche, milieu, droite |
| `7E` (~) | filet haut |
| `2F` et `5C` (/ \\) | diagonales pleine case |

## Protocole et séquences ignorées

- PRO1, PRO2 et PRO3 (`1B 39`, `1B 3A`, `1B 3B`) sont sautés. Seuls PRO2 `69 43` (début du mode rouleau) et `6A 43` (fin) sont interprétés.
- Les séquences CSI (`1B 5B …`) gèrent les déplacements, l'effacement, ainsi que l'insertion et la suppression de caractères et de rangées.
- `ESC 25` ouvre la transparence écran jusqu'à `ESC 25 40` ou `ESC 2F 3F`.

## Débit

1200 bit/s au format 7 bits, parité, start et stop, soit 10 bits par caractère : **120 caractères par seconde**. Une page pleine de 1000 octets met donc environ 8 secondes à s'afficher. `Line` reproduit ce débit ; `Vdt.pad(n)` ajoute des NUL pour ralentir volontairement une page.

## Limites connues

- Pas de mode 80 colonnes (mode Mixte / téléinformatique).
- La couleur vraie des Minitel couleur n'est pas gérée, seulement les phosphores blanc (P4) et vert (P1).
- La demande de position curseur (`ESC 61`) est ignorée, puisque aucun serveur ne l'écoute.
- En G1, les codes 0x40 à 0x5E s'affichent comme des majuscules G0. La table de la STUM les laisse vides : ce comportement est à vérifier sur un vrai terminal.
