#!/usr/bin/env node
// LATENCE : convertit une silhouette noir et blanc (PNG) en dessin en pavés, à retoucher à la main.
//
//   npm run mosaique -- sources/mosaique/martinet.png --colonnes 12 --rangees 5 [--seuil 0.5] [--nom MARTINET]
//
// Le dessin sort comme un tableau de chaînes, une par rangée de pavés (2 pavés par colonne de l'écran,
// 3 par rangée) : # pavé allumé, . éteint. Il se colle dans src/scenarios/latence/art.js.
// Sans dépendance : le PNG est décodé avec node:zlib (8 bits, non entrelacé).
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import { basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CELL_W, CELL_H, MOS_Y0, MOS_H } from '../src/engine/constants.js';

const SIGNATURE = '89504e470d0a1a0a';
/** Octets par pixel selon le type de couleur PNG, en 8 bits. */
const OCTETS = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

function paeth(a, b, c) {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

/** Défait le filtre d'une rangée (aucun, Sub, Up, Average, Paeth) ; prec est la rangée du dessus. */
function defiltre(filtre, src, out, prec, bpp) {
  for (let i = 0; i < src.length; i++) {
    const a = i >= bpp ? out[i - bpp] : 0, b = prec[i], c = i >= bpp ? prec[i - bpp] : 0;
    let pred = 0;
    if (filtre === 1) pred = a;
    else if (filtre === 2) pred = b;
    else if (filtre === 3) pred = (a + b) >> 1;
    else if (filtre === 4) pred = paeth(a, b, c);
    out[i] = (src[i] + pred) & 0xff;
  }
}

/**
 * Décode un PNG 8 bits non entrelacé : niveaux de gris, RGB, palette, avec ou sans alpha.
 * Renvoie { width, height, rgb(x, y) → [r, g, b], alpha(x, y) → 0 à 255 }.
 */
export function decodePng(buf) {
  if (buf.subarray(0, 8).toString('hex') !== SIGNATURE) throw new Error('Ce fichier n\'est pas un PNG.');
  let pos = 8, ihdr = null, palette = null, transparence = null;
  const idat = [];
  while (pos + 8 <= buf.length) {
    const n = buf.readUInt32BE(pos), type = buf.toString('latin1', pos + 4, pos + 8);
    const corps = buf.subarray(pos + 8, pos + 8 + n);
    if (type === 'IHDR') {
      ihdr = { width: corps.readUInt32BE(0), height: corps.readUInt32BE(4), depth: corps[8], color: corps[9], interlace: corps[12] };
    } else if (type === 'PLTE') palette = corps;
    else if (type === 'tRNS') transparence = corps;
    else if (type === 'IDAT') idat.push(corps);
    else if (type === 'IEND') break;
    pos += 12 + n;
  }
  const { width, height, depth, color, interlace } = ihdr;
  if (depth !== 8 || interlace || !(color in OCTETS)) {
    throw new Error(`PNG non pris en charge (${depth} bits, type ${color}, entrelacé ${interlace}) : exporter en 8 bits, non entrelacé.`);
  }
  const bpp = OCTETS[color], largeur = width * bpp;
  const brut = inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(largeur * height);
  const vide = Buffer.alloc(largeur);
  for (let y = 0; y < height; y++) {
    const debut = y * (largeur + 1);
    defiltre(brut[debut], brut.subarray(debut + 1, debut + 1 + largeur), px.subarray(y * largeur, (y + 1) * largeur),
      y ? px.subarray((y - 1) * largeur, y * largeur) : vide, bpp);
  }
  const k = (x, y) => (y * width + x) * bpp;
  return {
    width,
    height,
    rgb(x, y) {
      const i = k(x, y);
      if (color === 0 || color === 4) return [px[i], px[i], px[i]];
      if (color === 3) return [palette[px[i] * 3], palette[px[i] * 3 + 1], palette[px[i] * 3 + 2]];
      return [px[i], px[i + 1], px[i + 2]];
    },
    alpha(x, y) {
      const i = k(x, y);
      if (color === 4) return px[i + 1];
      if (color === 6) return px[i + 3];
      if (color === 3 && transparence && px[i] < transparence.length) return transparence[px[i]];
      return 255;
    },
  };
}

/** Noirceur d'un pixel : 0 blanc, 1 noir. La transparence compte pour du blanc. */
function noirceur(img, x, y) {
  const [r, g, b] = img.rgb(x, y);
  return (1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255) * (img.alpha(x, y) / 255);
}

/**
 * Réduit une image en pavés. La zone fait colonnes × rangées cases de l'écran (8 × 10 pixels de trame
 * chacune) ; l'image s'y centre en gardant ses proportions. Un pavé s'allume quand sa part de noir
 * atteint le seuil. Renvoie une chaîne par rangée de pavés.
 */
export function versPaves(img, colonnes, rangees, seuil = 0.5) {
  const W = colonnes * CELL_W, H = rangees * CELL_H;
  const k = Math.min(W / img.width, H / img.height);
  const x0 = (W - img.width * k) / 2, y0 = (H - img.height * k) / 2;
  const N = 4;                                   // échantillons par côté de pavé
  const lignes = [];
  for (let r = 0; r < rangees; r++) {
    for (let sub = 0; sub < 3; sub++) {
      let ligne = '';
      for (let bx = 0; bx < colonnes * 2; bx++) {
        let noir = 0;
        for (let j = 0; j < N; j++) {
          for (let i = 0; i < N; i++) {
            const x = bx * (CELL_W / 2) + (i + 0.5) * (CELL_W / 2) / N;
            const y = r * CELL_H + MOS_Y0[sub] + (j + 0.5) * MOS_H[sub] / N;
            const ix = Math.floor((x - x0) / k), iy = Math.floor((y - y0) / k);
            if (ix >= 0 && iy >= 0 && ix < img.width && iy < img.height) noir += noirceur(img, ix, iy);
          }
        }
        ligne += noir / (N * N) >= seuil ? '#' : '.';
      }
      lignes.push(ligne);
    }
  }
  return lignes;
}

/** Le dessin, prêt à coller dans art.js. */
export function enModule(nom, lignes, source) {
  return `// Silhouette tirée de ${source}, à retoucher à la main : # pavé allumé, . éteint.\n`
    + `// ${lignes[0].length / 2} colonnes × ${lignes.length / 3} rangées de l'écran.\n`
    + `export const ${nom} = [\n${lignes.map(l => `  '${l}',`).join('\n')}\n];\n`;
}

// ---------------------------------------------------------------- en ligne de commande

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const args = process.argv.slice(2);
  const option = (nom, defaut) => {
    const i = args.indexOf('--' + nom);
    return i >= 0 ? args[i + 1] : defaut;
  };
  const fichier = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
  if (!fichier) {
    console.error('Usage : npm run mosaique -- image.png --colonnes 12 --rangees 5 [--seuil 0.5] [--nom NOM]');
    process.exit(1);
  }
  const colonnes = Number(option('colonnes', 10)), rangees = Number(option('rangees', 5));
  const seuil = Number(option('seuil', 0.5));
  const nom = option('nom', basename(fichier).replace(/\.png$/i, '').toUpperCase().replace(/[^A-Z0-9]+/g, '_'));
  const lignes = versPaves(decodePng(readFileSync(fichier)), colonnes, rangees, seuil);
  process.stdout.write(enModule(nom, lignes, basename(fichier)));
}
