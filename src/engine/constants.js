// Géométrie et palette de l'écran Vidéotex (STUM 1B, mode 40 colonnes).

export const COLS = 40;
export const ROWS = 25;          // rangée 00 (service) + rangées 01 à 24
export const CELL_W = 8;
export const CELL_H = 10;
export const W = COLS * CELL_W;  // 320 px
export const H = ROWS * CELL_H;  // 250 px
export const N = COLS * ROWS;

/** Couleurs Vidéotex dans l'ordre des codes (ESC 0x40 à 0x47). */
export const COLOR_NAMES = ['noir', 'rouge', 'vert', 'jaune', 'bleu', 'magenta', 'cyan', 'blanc'];

/**
 * Niveaux de gris des 8 couleurs sur un Minitel monochrome (STUM 1B) :
 * noir 0 %, bleu 40, rouge 50, magenta 60, vert 70, cyan 80, jaune 90, blanc 100.
 * Indexés par code couleur.
 */
export const GREY = [0, 0.5, 0.7, 0.9, 0.4, 0.6, 0.8, 1];

/**
 * Semi-graphiques 2 × 3 : un bit par pavé.
 * b0 haut-gauche, b1 haut-droit, b2 milieu-gauche, b3 milieu-droit, b4 bas-gauche, b6 bas-droit.
 * Le bit 5 (0x20) vaut toujours 1 dans les codes des colonnes 2, 3, 6 et 7.
 */
export const MOS_BITS = [0x01, 0x02, 0x04, 0x08, 0x10, 0x40];
/** Découpage vertical de la matrice de 10 lignes en trois pavés de 3, 4 et 3 lignes. */
export const MOS_Y0 = [0, 3, 7];
export const MOS_H = [3, 4, 3];

/** Marge du canvas autour de la trame, pour le halo et la courbure (fraction de la trame). */
export const MARGIN = 0.08;
