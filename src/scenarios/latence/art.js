// LATENCE : les dessins en pavés (docs/latence/interface.md). Tout passe par les semi-graphiques,
// et un trait fait au moins deux pavés de large pour rester lisible à travers le tube.
import { mosaicArt, sampler, COLOR_NAMES } from '../../engine/index.js';

const couleur = nom => COLOR_NAMES.indexOf(nom);
const BLANC = 7;
const CLIGNOTE = 16;

/** La Ligne Terre-Mars sur quatre rangées : la Terre, neuf relais, Mars. Le septième relais clignote. */
export function ligne(p, r0) {
  const yc = r0 * 10 + 20;                 // milieu de la bande, en pixels de trame
  const terre = 24, mars = 296, pas = (mars - terre) / 10;
  const shape = (x, y) => {
    if ((x - terre) ** 2 + (y - yc) ** 2 <= 12 * 12) return couleur('bleu');
    if ((x - mars) ** 2 + (y - yc) ** 2 <= 9 * 9) return couleur('rouge');
    for (let i = 1; i <= 9; i++) {
      if (Math.abs(x - (terre + i * pas)) <= 6 && Math.abs(y - yc) <= 6) return BLANC + (i === 7 ? CLIGNOTE : 0);
    }
    return x > terre && x < mars && Math.abs(y - yc) <= 3.5 ? BLANC : -1;
  };
  mosaicArt(p, r0, 1, 40, 4, sampler(r0, 1, shape));
}

/**
 * L'écusson de la mission, réduit à ses étoiles : une par membre d'équipage, sur 9 colonnes et
 * 6 rangées. Pas de blason pour l'instant : à cette résolution, deux étoiles dans un contour arrondi
 * dessinent un visage. La silhouette complète viendra de l'image, à l'étape 5.
 */
export function ecusson(p, r0, c0, etoiles = 1) {
  // Sur 18 pavés de large : une étoile au milieu, ou deux côte à côte
  const motif = etoiles === 1 ? ETOILE.map(l => `.....${l}.....`) : ETOILE.map(l => `${l}..${l}`);
  dessin(p, r0, c0, motif, { dy: 3 });
}

/**
 * Un dessin en pavés écrit en chaînes, à la main ou sorti de tools/mosaique.mjs : une chaîne par
 * rangée de pavés (2 par colonne de l'écran, 3 par rangée), # allumé, . éteint. Posé à la case
 * (r0, c0), décalé de dx et dy pavés.
 */
export function dessin(p, r0, c0, lignes, { dx = 0, dy = 0, couleur = BLANC } = {}) {
  const largeur = Math.ceil((lignes[0].length + dx) / 2), hauteur = Math.ceil((lignes.length + dy) / 3);
  mosaicArt(p, r0, c0, largeur, hauteur, (bx, by) => {
    const ligne = lignes[by - dy];
    return ligne && ligne[bx - dx] === '#' ? couleur : -1;
  });
}

/** Complète un dessin par sa moitié gauche, en miroir : chaque chaîne suivie de son reflet. */
export function symetrique(moities) {
  return moities.map(l => l + [...l].reverse().join(''));
}

/**
 * Le martinet vu de dessous, ailes en faucille, sur 16 colonnes et 7 rangées (accueil du serveur de
 * bord). Tiré de sources/mosaique/martinet.png par npm run mosaique, puis retouché : la pointe des ailes
 * et de la queue ramenée à deux pavés. Plus petit, il perd ses faucilles : à 6 rangées, ses ailes
 * raidies font un avion ; à 5, une cloche.
 */
export const DESSIN_MARTINET = symetrique([
  '................',
  '...............#',
  '..............##',
  '..............##',
  '..............##',
  '..........######',
  '.........#######',
  '.......#########',
  '......##########',
  '.....###########',
  '....############',
  '...#######...###',
  '..######......##',
  '.#####........##',
  '.###..........##',
  '.##...........##',
  '..............##',
  '..............##',
  '.............###',
  '.............##.',
  '................',
]);

/**
 * Le relais L7, sur 12 colonnes et 6 rangées (accueil du serveur du relais) : l'antenne et une
 * parabole en haut, les deux panneaux de part et d'autre du mât, les paraboles du bas. Tiré de
 * sources/mosaique/relais.png par npm run mosaique, retouché pour qu'aucun trait n'ait un seul pavé.
 */
export const DESSIN_RELAIS = [
  '.............##.........',
  '.............##.........',
  '...........#####........',
  '...........#####........',
  '...........#####........',
  '...........##.##........',
  '.#####.....##.....#####.',
  '.#########.##.#########.',
  '.######################.',
  '.######################.',
  '.#########.##.#########.',
  '.########..##..########.',
  '........##.##.##........',
  '........########........',
  '........########........',
  '........#######.........',
  '.........##..##.........',
  '........................',
];

/** Une étoile à quatre pointes, pavé par pavé : 8 de large, 12 de haut, des bras de deux pavés. */
const ETOILE = [
  '...##...',
  '...##...',
  '...##...',
  '..####..',
  '.######.',
  '########',
  '########',
  '.######.',
  '..####..',
  '...##...',
  '...##...',
  '...##...',
];

/** Les câbles du répartiteur : une bande par câble, dans sa couleur, numérotée à gauche, une rangée sur deux. */
export function cables(p, r0, liste) {
  Object.entries(liste).forEach(([n, nom], i) => {
    const r = r0 + 2 * i;
    p.at(r, 3).text(n);
    mosaicArt(p, r, 6, 30, 1, (bx, by) => (by >= 1 ? couleur(nom) : -1));
  });
}

/** Place de la grille de jonction : 9 × 7 cases de 3 colonnes sur 2 rangées. */
export const GRILLE = { r0: 6, c0: 2 };

/** Pavés d'une case (6 × 6) : structure pleine en gris 40 %, anneau en cadre, Martinet, point vide. */
function pave(contenu, lx, ly) {
  switch (contenu) {
    case '#': return couleur('bleu');
    case 'J': return lx < 2 || lx > 3 || ly < 2 || ly > 3 ? BLANC : -1;
    case 'M': return lx >= 1 && lx <= 4 && ly >= 1 && ly <= 4 ? BLANC : -1;
    default: return lx >= 2 && lx <= 3 && ly >= 2 && ly <= 3 ? couleur('bleu') : -1;
  }
}

/** Contenu d'une case : le Martinet s'il y est ; sa case de départ, une fois quittée, est vide. */
function contenu(grille, [r, c], martinet) {
  if (r === martinet[0] && c === martinet[1]) return 'M';
  return grille[r][c] === 'M' ? '.' : grille[r][c];
}

/** La grille de jonction entière, avec le Martinet à la case donnée. */
export function grilleJonction(p, grille, martinet) {
  mosaicArt(p, GRILLE.r0, GRILLE.c0, 27, 14, (bx, by) =>
    pave(contenu(grille, [Math.floor(by / 6), Math.floor(bx / 6)], martinet), bx % 6, by % 6));
}

/** Redessine une case. On l'efface d'abord : mosaicArt n'écrit pas les cases vides. */
export function caseJonction(p, grille, rc, martinet) {
  const r = GRILLE.r0 + 2 * rc[0], c = GRILLE.c0 + 3 * rc[1];
  for (let k = 0; k < 2; k++) p.at(r + k, c).g1().raw(0x20, 0x20, 0x20);
  mosaicArt(p, r, c, 3, 2, (bx, by) => pave(contenu(grille, rc, martinet), bx, by));
}

/**
 * Un trou de bande : un pavé plein sur les deux tiers hauts de la case (semi-graphique 0x2F).
 * La rangée de pavés du bas reste noire, pour que les trous de deux lignes voisines ne se collent pas.
 */
export const TROU = 0x2F;

/** Une ligne de bande : cinq positions, trou 1 à gauche. Un trou est un pavé plein, une position vide un point. */
export function trous(p, motif) {
  [...motif].forEach((t, k) => {
    if (k) p.text(' ');
    if (t === '1') p.g1().raw(TROU).g0();
    else p.text('.');
  });
}

/**
 * Une page de bande Baudot : trois colonnes de 12 lignes numérotées, rangées 06 à 17.
 * apresLigne, s'il est donné, part quand chaque ligne s'affiche (un repère de la page).
 */
export function bande(p, motifs, premier, apresLigne = null) {
  motifs.forEach((motif, i) => {
    const r = 6 + (i % 12), c = 2 + Math.floor(i / 12) * 13;
    p.at(r, c).fg(6).text(String(premier + i + 1).padStart(2, '0')).fg(7).text(' ');
    trous(p, motif);
    if (apresLigne) p.mark(apresLigne);
  });
}

/** La table Baudot compacte : les lettres sur trois colonnes à partir de la rangée r0, puis l'espace. */
export function tableBaudot(p, table, r0) {
  const lettres = Object.keys(table).filter(l => l !== ' ');
  lettres.forEach((l, i) => {
    const r = r0 + (i % 9), c = 2 + Math.floor(i / 9) * 13;
    p.at(r, c).fg(6).text(l).fg(7).text(' ');
    trous(p, table[l]);
  });
  p.at(r0 + 10, 2).fg(6).text('Espace').fg(7).text(' ');
  trous(p, table[' ']);
}

/**
 * Une seule couleur par case : la case prend la couleur de la majorité de ses pavés allumés.
 * Sans cela, mosaicArt garde la couleur du dernier pavé, et les bords de la Terre s'effilochent.
 */
function parCase(pix) {
  let cle = '', dominante = -1;
  return (bx, by) => {
    const v = pix(bx, by);
    if (v < 0) return v;
    const cx = bx >> 1, cy = (by / 3) | 0;
    if (cle !== `${cx},${cy}`) {
      cle = `${cx},${cy}`;
      const n = {};
      for (let k = 0; k < 6; k++) {
        const w = pix(cx * 2 + (k & 1), cy * 3 + (k >> 1));
        if (w >= 0) n[w] = (n[w] || 0) + 1;
      }
      dominante = +Object.keys(n).reduce((a, b) => (n[b] > n[a] ? b : a));
    }
    return dominante;
  };
}

/** Un hasard fixe par case, pour semer les étoiles toujours au même endroit. */
const hasard = (x, y) => {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

/** La Terre vue de loin : océans en gris 40 %, continents en gris 70 %, quelques nuages blancs. */
function terre(x, y, cx, cy, rayon) {
  const dx = x - cx, dy = y - cy;
  if (dx * dx + dy * dy > rayon * rayon) return -1;
  if (Math.sin(y / 5 + x / 37) > 0.94) return BLANC;
  const relief = Math.sin(x / 17) + 1.1 * Math.sin(y / 13 + x / 29) + Math.cos((x + y) / 23);
  return relief > 0.9 ? couleur('vert') : couleur('bleu');
}

/**
 * L'image de la page FIN, sur toute la largeur et h rangées à partir de r0 : un ciel d'étoiles et la
 * Terre. Avec le Martinet, la Terre est grande et le Martinet vole vers elle, le bec tourné à droite ;
 * sans lui (Hors délai), elle n'est qu'un point au loin.
 */
export function retourTerre(p, r0, h, { martinet = true } = {}) {
  const hauteur = h * 10;
  const [cx, cy, rayon] = martinet ? [262, hauteur / 2, hauteur * 0.42] : [250, hauteur * 0.35, 9];
  // Le martinet, tourné d'un quart de tour : 21 pavés de large, 32 de haut, centré en hauteur
  const ox = 14, oy = Math.floor((h * 3 - DESSIN_MARTINET[0].length) / 2);
  const oiseau = (bx, by) => {
    const u = by - oy, v = DESSIN_MARTINET.length - 1 - (bx - ox);
    return DESSIN_MARTINET[v] && DESSIN_MARTINET[v][u] === '#';
  };
  mosaicArt(p, r0, 1, 40, h, parCase((bx, by) => {
    const x = bx * 4 + 2, y = by * 10 / 3 + 1.7;
    if (martinet && oiseau(bx, by)) return BLANC;
    const t = terre(x, y, cx, cy, rayon);
    if (t >= 0) return t;
    // Les étoiles : deux pavés côte à côte, en haut d'une case sur vingt, loin de la Terre et de l'oiseau
    const ccx = bx >> 1, ccy = (by / 3) | 0;
    if (by % 3 || hasard(ccx, ccy) > 0.05) return -1;
    if ((x - cx) ** 2 + (y - cy) ** 2 < (rayon + 10) ** 2) return -1;
    if (martinet && bx >= ox - 2 && bx < ox + DESSIN_MARTINET.length + 2) return -1;
    return couleur('vert');
  }));
}
