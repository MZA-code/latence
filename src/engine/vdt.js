// Composition de pages Vidéotex : texte français → codes Minitel, attributs, semi-graphiques.
import { MOS_BITS, MOS_Y0, MOS_H } from './constants.js';

/** Minuscules accentuées : SS2 + diacritique + lettre. */
const ACC_MAP = {
  'à': [0x41, 0x61], 'â': [0x43, 0x61], 'ä': [0x48, 0x61], 'è': [0x41, 0x65], 'é': [0x42, 0x65],
  'ê': [0x43, 0x65], 'ë': [0x48, 0x65], 'î': [0x43, 0x69], 'ï': [0x48, 0x69], 'ô': [0x43, 0x6F],
  'ö': [0x48, 0x6F], 'ù': [0x41, 0x75], 'û': [0x43, 0x75], 'ü': [0x48, 0x75], 'ç': [0x4B, 0x63],
};
/** Symboles du jeu G2. */
const G2_MAP = {
  '£': 0x23, '§': 0x27, '←': 0x2C, '↑': 0x2D, '→': 0x2E, '↓': 0x2F, '°': 0x30, '±': 0x31,
  '÷': 0x38, '¼': 0x3C, '½': 0x3D, '¾': 0x3E, 'Œ': 0x6A, 'œ': 0x7A, 'ß': 0x7B,
};
/** Replis : pas de majuscules accentuées sur Minitel, typographie ramenée à l'ASCII. */
export const FOLD = {
  'À': 'A', 'Â': 'A', 'Ä': 'A', 'É': 'E', 'È': 'E', 'Ê': 'E', 'Ë': 'E', 'Î': 'I', 'Ï': 'I',
  'Ô': 'O', 'Ö': 'O', 'Ù': 'U', 'Û': 'U', 'Ü': 'U', 'Ç': 'C', '’': "'", '‘': "'", '“': '"',
  '”': '"', '«': '"', '»': '"', '–': '-', '—': '-', '−': '-', '…': '...', ' ': ' ', ' ': ' ',
  '·': '.', '×': 'x',
};

/**
 * Encode un texte en octets Minitel. Les suites de 4 caractères identiques ou plus
 * sont compressées avec REP (0x12), comme le faisaient les serveurs.
 * @returns {{ bytes: number[], units: number }} units = nombre d'emplacements occupés
 */
export function encodeText(str) {
  const chars = [];
  for (const ch of str) {
    const f = FOLD[ch];
    if (f !== undefined) chars.push(...f); else chars.push(ch);
  }
  const out = [];
  let units = 0, i = 0;
  while (i < chars.length) {
    const ch = chars[i];
    if (ACC_MAP[ch]) { out.push(0x19, ACC_MAP[ch][0], ACC_MAP[ch][1]); units++; i++; continue; }
    if (G2_MAP[ch] !== undefined) { out.push(0x19, G2_MAP[ch]); units++; i++; continue; }
    let code = ch.charCodeAt(0);
    if (code < 0x20 || code > 0x7E) code = 0x3F;
    let j = i + 1;
    while (j < chars.length && chars[j] === ch) j++;
    const run = j - i;
    if (run >= 4) {
      out.push(code);
      let rest = run - 1;
      while (rest > 0) { const k = Math.min(rest, 63); out.push(0x12, 0x40 + k); rest -= k; }
    } else {
      for (let k = 0; k < run; k++) out.push(code);
    }
    units += run;
    i = j;
  }
  return { bytes: out, units };
}

/** Largeur affichée d'un texte, en colonnes. */
export const vlen = s => encodeText(s).units;
/** Colonne de départ pour centrer un texte sur 40 colonnes. */
export const center = s => Math.max(1, Math.floor((40 - vlen(s)) / 2) + 1);

/** Constructeur de page : chaque méthode ajoute des octets et renvoie this. */
export class Vdt {
  constructor() { this.b = []; this.marks = []; }
  raw(...xs) { for (const x of xs) this.b.push(x); return this; }
  /** Repère : fn est appelée quand la ligne a transmis tout ce qui précède (un son calé sur l'affichage). */
  mark(fn) { this.marks.push({ at: this.b.length, fn }); return this; }
  /** Efface l'écran (rangées 01 à 24) et remet le curseur en haut. */
  ff() { return this.raw(0x0C); }
  con() { return this.raw(0x11); }
  coff() { return this.raw(0x14); }
  /** Positionne en rangée r (0 à 24), colonne c (1 à 40) ; réinitialise les attributs. */
  at(r, c) { return this.raw(0x1F, 0x40 + r, 0x40 + c); }
  fg(n) { return this.raw(0x1B, 0x40 + n); }
  /** Couleur de fond : attribut série, validé par l'espace suivant. */
  bg(n) { return this.raw(0x1B, 0x50 + n); }
  /** 0 normale, 1 double hauteur, 2 double largeur, 3 double taille. */
  size(n) { return this.raw(0x1B, 0x4C + n); }
  blink(on = true) { return this.raw(0x1B, on ? 0x48 : 0x49); }
  inv(on = true) { return this.raw(0x1B, on ? 0x5D : 0x5C); }
  /** Soulignement en G0, semi-graphiques disjoints en G1. */
  line(on = true) { return this.raw(0x1B, on ? 0x5A : 0x59); }
  mask(on = true) { return this.raw(0x1B, on ? 0x58 : 0x5F); }
  g1() { return this.raw(0x0E); }
  g0() { return this.raw(0x0F); }
  rep(n) { while (n > 0) { const k = Math.min(n, 63); this.raw(0x12, 0x40 + k); n -= k; } return this; }
  /** Octets de bourrage : ralentissent l'affichage sans rien écrire. */
  pad(n) { for (let i = 0; i < n; i++) this.raw(0x00); return this; }
  text(s) { return this.raw(...encodeText(s).bytes); }
  bytes() { return Uint8Array.from(this.b); }
}

/**
 * Dessin en semi-graphiques. pix(bx, by) reçoit les coordonnées de pavé (2 par colonne,
 * 3 par rangée) et renvoie -1 (éteint) ou une couleur 0-7, + 8 pour un pavé disjoint,
 * + 16 pour un pavé clignotant. Disjonction et clignotement valent pour toute la case.
 */
export function mosaicArt(p, r0, c0, wc, hc, pix) {
  for (let cr = 0; cr < hc; cr++) {
    const cells = [];
    for (let cc = 0; cc < wc; cc++) {
      let bits = 0, fg = 7, sep = false, blink = false;
      for (let k = 0; k < 6; k++) {
        const v = pix(cc * 2 + (k & 1), cr * 3 + (k >> 1));
        if (v >= 0) { bits |= MOS_BITS[k]; fg = v & 7; sep = (v & 8) !== 0; blink = (v & 16) !== 0; }
      }
      cells.push({ code: 0x20 | bits, fg, sep, blink, empty: bits === 0 });
    }
    let a = 0, z = wc - 1;
    while (a <= z && cells[a].empty) a++;
    while (z >= a && cells[z].empty) z--;
    if (a > z) continue;
    p.at(r0 + cr, c0 + a).g1();
    let curFg = 7, curSep = false, curBlink = false, prev = -1, run = 0;
    const flush = () => { if (run) { p.rep(run); run = 0; } };
    for (let cc = a; cc <= z; cc++) {
      const cell = cells[cc];
      if (!cell.empty) {
        if (cell.fg !== curFg) { flush(); p.fg(cell.fg); curFg = cell.fg; prev = -1; }
        if (cell.sep !== curSep) { flush(); p.line(cell.sep); curSep = cell.sep; prev = -1; }
        if (cell.blink !== curBlink) { flush(); p.blink(cell.blink); curBlink = cell.blink; prev = -1; }
      }
      if (cell.code === prev) run++;
      else { flush(); p.raw(cell.code); prev = cell.code; }
    }
    flush();
  }
}

/**
 * Adapte une forme décrite en pixels de trame (320 × 250) aux pavés 2 × 3 :
 * chaque pavé est suréchantillonné 3 × 3 et s'allume à la majorité.
 * shape(px, py) renvoie -1 ou une couleur.
 */
export function sampler(r0, c0, shape) {
  return (bx, by) => {
    const cellRow = (by / 3) | 0, sub = by % 3;
    const x = (c0 - 1) * 8 + bx * 4, y = (r0 + cellRow) * 10 + MOS_Y0[sub], h = MOS_H[sub];
    let n = 0, col = -1;
    for (let j = 0; j < 3; j++) {
      for (let i = 0; i < 3; i++) {
        const v = shape(x + (i + 0.5) * 4 / 3, y + (j + 0.5) * h / 3);
        if (v >= 0) { n++; col = v; }
      }
    }
    return n >= 5 ? col : -1;
  };
}
