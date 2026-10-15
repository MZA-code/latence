// Mémoire de page : 25 rangées × 40 colonnes, un « mot » par emplacement de caractère.
import { N } from './constants.js';

/** Types d'emplacement. */
export const T_ALPHA = 0;   // caractère alphanumérique (G0 ou symbole G2)
export const T_MOSAIC = 1;  // semi-graphique (G1)
export const T_DELIM = 2;   // délimiteur de zone (espace portant les attributs série)

/** Drapeaux d'attributs. */
export const F_BLINK = 1;
export const F_INVERSE = 2;
export const F_LINE = 4;    // soulignement (alpha, porté par le délimiteur) ou disjoint (mosaïque)
export const F_MASK = 8;

const FIELDS = ['t', 'c', 's', 'a', 'f', 'b', 'fl', 'p'];

export class Screen {
  constructor() {
    this.t = new Uint8Array(N);   // type
    this.c = new Uint8Array(N);   // code
    this.s = new Uint8Array(N);   // jeu : 0 G0, 1 symbole G2
    this.a = new Uint8Array(N);   // diacritique
    this.f = new Uint8Array(N);   // couleur de caractère
    this.b = new Uint8Array(N);   // couleur de fond (mosaïque, délimiteur)
    this.fl = new Uint8Array(N);  // drapeaux F_*
    this.p = new Uint8Array(N);   // moitié de caractère agrandi : bits 0-1 largeur, bits 2-3 hauteur
    this.reveal = false;          // démasquage plein écran (ESC 0x23 0x20 0x5F)
    this.clearRows(0, 24);
  }

  set(i, t, code, set, acc, fg, bg, fl, part) {
    this.t[i] = t; this.c[i] = code; this.s[i] = set; this.a[i] = acc;
    this.f[i] = fg; this.b[i] = bg; this.fl[i] = fl; this.p[i] = part;
  }

  /** Effacement : pavés semi-graphiques noirs, comme le logiciel du Minitel (pas de fond qui « bave »). */
  black(i) { this.set(i, T_MOSAIC, 0x20, 0, 0, 7, 0, 0, 0); }

  clearRows(r0, r1) { for (let i = r0 * 40; i < (r1 + 1) * 40; i++) this.black(i); }

  copyCell(from, to) { for (const k of FIELDS) this[k][to] = this[k][from]; }

  /** Défilement des rangées 01 à 24 (mode rouleau). dir > 0 : vers le haut. */
  scroll(dir) {
    if (dir > 0) { for (const k of FIELDS) this[k].copyWithin(40, 80, N); this.clearRows(24, 24); }
    else { for (const k of FIELDS) this[k].copyWithin(80, 40, N - 40); this.clearRows(1, 1); }
  }

  deleteRow(r) {
    for (let rr = r; rr < 24; rr++) for (let c = 0; c < 40; c++) this.copyCell((rr + 1) * 40 + c, rr * 40 + c);
    this.clearRows(24, 24);
  }

  insertRow(r) {
    for (let rr = 24; rr > r; rr--) for (let c = 0; c < 40; c++) this.copyCell((rr - 1) * 40 + c, rr * 40 + c);
    this.clearRows(r, r);
  }

  /** Texte brut d'une rangée (utile pour les tests et l'accessibilité). */
  rowText(r) {
    let out = '';
    for (let c = 0; c < 40; c++) {
      const i = r * 40 + c;
      out += this.t[i] === T_ALPHA && this.s[i] === 0 ? String.fromCharCode(this.c[i]) : ' ';
    }
    return out;
  }
}
