// Conversion de la police dessinée (font-data.js) en octets, et composition des accents.
import { G0, G2, ACCENTS, DOTLESS_I } from './font-data.js';

function toBytes(rows) {
  const out = new Uint8Array(10);
  rows.forEach((row, y) => {
    let v = 0;
    for (let x = 0; x < 8; x++) if (row[x] === '#') v |= 0x80 >> x;
    out[y] = v;
  });
  return out;
}

/** Glyphes G0 indexés par code (0x20 à 0x7F). */
export const GLYPH_G0 = [];
for (const ch in G0) GLYPH_G0[ch.charCodeAt(0)] = toBytes(G0[ch]);

/** Symboles G2 indexés par code 7 bits (après SS2). */
export const GLYPH_G2 = {};
for (const k in G2) GLYPH_G2[Number(k)] = toBytes(G2[k]);

const GLYPH_ACC = {};
for (const k in ACCENTS) GLYPH_ACC[Number(k)] = toBytes(ACCENTS[k]);
const GLYPH_DOTLESS_I = toBytes(DOTLESS_I);

/**
 * Lettres qui acceptent chaque diacritique (composant VGP5) :
 * à â ä é è ê ë î ï ö ô ù û ü ç. Aucune majuscule accentuée sur Minitel.
 */
export const ACC_OK = { 0x41: 'aeu', 0x42: 'e', 0x43: 'aeiou', 0x48: 'aeiou', 0x4B: 'c' };

const cache = new Map();

/**
 * Glyphe 8 × 10 prêt à tramer.
 * @param {number} set 0 = G0, 1 = symbole G2
 * @param {number} code code 7 bits
 * @param {number} acc diacritique G2 (0x41 à 0x4B) ou 0
 */
export function glyph(set, code, acc) {
  const key = (set << 16) | (acc << 8) | code;
  let g = cache.get(key);
  if (g) return g;
  if (set === 1) {
    g = GLYPH_G2[code] || GLYPH_G0[0x5F];
  } else {
    const base = acc && code === 0x69 ? GLYPH_DOTLESS_I : (GLYPH_G0[code] || GLYPH_G0[0x20]);
    const a = acc ? GLYPH_ACC[acc] : null;
    if (a) {
      g = new Uint8Array(base);
      if (acc === 0x4B) { g[8] |= a[0]; g[9] |= a[1]; }   // cédille sous la lettre
      else { g[0] |= a[0]; g[1] |= a[1]; }
    } else {
      g = base;
    }
  }
  cache.set(key, g);
  return g;
}
