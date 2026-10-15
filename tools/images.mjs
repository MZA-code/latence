#!/usr/bin/env node
// LATENCE : prépare les images du site à partir des images brutes de sources/images/ (voir
// docs/latence/marques.md, « Après Gemini »).
//
//   npm run images
//
// La photo du terminal est recadrée sur l'écran et son cadre, puis écrite en AVIF et en WebP. Les
// écussons sont détourés, réduits et écrits en WebP ; la bande perforée de BAUDOT est repercée au motif
// exact. La fiche des images (fichiers, tailles) va dans src/scenarios/latence/images.json. Les fichiers
// passent par ffmpeg (avec libwebp et libaom) ; les pixels sont traités ici, sans dépendance.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { BAUDOT } from '../src/scenarios/latence/data.js';

/** La palette de docs/latence/marques.md. */
export const ECRU = [232, 225, 208];
export const ENCRE = [30, 35, 40];
/** Le papier des autocollants : plus clair que l'écru, pour que la bande de BAUDOT s'en détache. */
const PAPIER = [243, 240, 231];

/**
 * La photo : recadrée sur le verre et le cadre bleu, vis comprises (la photo provisoire place l'écran
 * à 38 % de sa largeur, trop petit pour lire). Elle est écrite à plusieurs largeurs pour srcset, sans
 * jamais dépasser sa définition. Recaler l'écran dans banc.html après tout changement de recadrage.
 */
const PHOTO = { source: 'terminal.jpeg', recadrage: { x: 366, y: 120, l: 646, h: 530 }, largeurs: [800, 1200, 1600] };

/**
 * Les écussons posés à côté de l'écran, sur le fond sombre de la page. largeur : en pixels, le double
 * de l'affichage. autocollant : posé sur du papier clair ; clair : l'encre et ses gris passent en écru
 * (version pour fond sombre) ; exterieur : seul le blanc autour de la plaque devient transparent.
 */
const ECUSSONS = {
  baudot: { source: 'baudot.jpeg', largeur: 340, bande: true, autocollant: true },
  ligne: { source: 'ligne.jpeg', largeur: 360, clair: true },
  martinet: { source: 'martinet.jpeg', largeur: 300, exterieur: true },
};

// ---------------------------------------------------------------- les pixels

/** Une image RGBA en mémoire, d'une seule couleur : { width, height, data }. */
export function creer(width, height, couleur = [255, 255, 255, 255]) {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < data.length; i += 4) data.set(couleur, i);
  return { width, height, data };
}

export function pixel(img, x, y) {
  const i = (y * img.width + x) * 4;
  return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]];
}

export function peindre(img, x, y, [r, g, b, a = 255]) {
  if (x < 0 || y < 0 || x >= img.width || y >= img.height) return;
  img.data.set([r, g, b, a], (y * img.width + x) * 4);
}

/** Mêle une couleur opaque au pixel, dans la proportion t. */
function meler(img, x, y, [r, g, b], t) {
  if (x < 0 || y < 0 || x >= img.width || y >= img.height) return;
  const i = (y * img.width + x) * 4, d = img.data;
  d[i] = Math.round(d[i] + (r - d[i]) * t);
  d[i + 1] = Math.round(d[i + 1] + (g - d[i + 1]) * t);
  d[i + 2] = Math.round(d[i + 2] + (b - d[i + 2]) * t);
  d[i + 3] = Math.round(d[i + 3] + (255 - d[i + 3]) * t);
}

/**
 * Rend transparent le fond blanc. Un pixel à moins de `net` du blanc devient transparent, au-delà de
 * `plein` il reste opaque ; entre les deux (un bord lissé), il garde la part de sa couleur qui n'est pas
 * du blanc. Avec exterieur, seul le fond relié au bord de l'image est touché : un blanc enfermé reste.
 * Modifie l'image et la renvoie.
 */
export function detourer(img, { exterieur = false, net = 10, plein = 50 } = {}) {
  const { width: W, height: H, data: d } = img;
  const auBlanc = k => Math.hypot(255 - d[k * 4], 255 - d[k * 4 + 1], 255 - d[k * 4 + 2]);
  let fond = null;
  if (exterieur) {
    fond = new Uint8Array(W * H);
    const pile = [];
    const voir = (x, y) => {
      const k = y * W + x;
      if (!fond[k] && auBlanc(k) < plein) { fond[k] = 1; pile.push(k); }
    };
    for (let x = 0; x < W; x++) { voir(x, 0); voir(x, H - 1); }
    for (let y = 0; y < H; y++) { voir(0, y); voir(W - 1, y); }
    while (pile.length) {
      const k = pile.pop(), x = k % W, y = (k - x) / W;
      if (x > 0) voir(x - 1, y);
      if (x < W - 1) voir(x + 1, y);
      if (y > 0) voir(x, y - 1);
      if (y < H - 1) voir(x, y + 1);
    }
  }
  for (let k = 0; k < W * H; k++) {
    if (fond && !fond[k]) continue;
    const a = Math.min(1, Math.max(0, (auBlanc(k) - net) / (plein - net)));
    if (a >= 1) continue;
    const i = k * 4;
    for (let c = 0; c < 3; c++) d[i + c] = a > 0 ? Math.round((d[i + c] - (1 - a) * 255) / a) : 255;
    d[i + 3] = Math.round(d[i + 3] * a);
  }
  return img;
}

/** Recadre sur ce qui est visible, avec une marge en pixels. Renvoie une nouvelle image. */
export function rogner(img, marge = 0) {
  let x0 = img.width, y0 = img.height, x1 = -1, y1 = -1;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      if (img.data[(y * img.width + x) * 4 + 3] <= 16) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  x0 -= marge; y0 -= marge; x1 += marge; y1 += marge;
  const out = creer(x1 - x0 + 1, y1 - y0 + 1, [0, 0, 0, 0]);
  for (let y = 0; y < out.height; y++) {
    for (let x = 0; x < out.width; x++) {
      const sx = x + x0, sy = y + y0;
      if (sx >= 0 && sy >= 0 && sx < img.width && sy < img.height) peindre(out, x, y, pixel(img, sx, sy));
    }
  }
  return out;
}

/** Pose l'image sur un fond uni : le résultat est opaque. Renvoie une nouvelle image. */
export function poser(img, [r, g, b]) {
  const out = creer(img.width, img.height, [r, g, b, 255]);
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const p = pixel(img, x, y);
      if (p[3]) meler(out, x, y, p, p[3] / 255);
    }
  }
  return out;
}

/**
 * Réduit l'image à une largeur donnée, en moyennant les pixels qu'elle recouvre. Les couleurs sont
 * pondérées par leur opacité : un pixel transparent ne noircit pas le bord de ses voisins.
 */
export function reduire(img, largeur) {
  const hauteur = Math.max(1, Math.round(img.height * largeur / img.width));
  const sx = img.width / largeur, sy = img.height / hauteur;
  const out = creer(largeur, hauteur, [0, 0, 0, 0]);
  for (let oy = 0; oy < hauteur; oy++) {
    const ya = oy * sy, yb = ya + sy;
    for (let ox = 0; ox < largeur; ox++) {
      const xa = ox * sx, xb = xa + sx;
      let poids = 0, a = 0, r = 0, g = 0, b = 0;
      for (let y = Math.floor(ya); y < Math.ceil(yb); y++) {
        const wy = Math.min(yb, y + 1) - Math.max(ya, y);
        for (let x = Math.floor(xa); x < Math.ceil(xb); x++) {
          const w = wy * (Math.min(xb, x + 1) - Math.max(xa, x)), i = (y * img.width + x) * 4;
          const pa = img.data[i + 3] / 255 * w;
          poids += w;
          a += pa;
          r += img.data[i] * pa;
          g += img.data[i + 1] * pa;
          b += img.data[i + 2] * pa;
        }
      }
      if (a > 0) peindre(out, ox, oy, [Math.round(r / a), Math.round(g / a), Math.round(b / a), Math.round(a / poids * 255)]);
    }
  }
  return out;
}

/**
 * Version pour fond sombre : les couleurs foncées et neutres (l'encre) prennent la couleur donnée, en
 * gardant leur opacité. Les couleurs franches, même foncées, ne bougent pas. Modifie l'image et la renvoie.
 */
export function eclaircir(img, [r, g, b], { seuil = 90, gris = 40 } = {}) {
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
    const ecart = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]);
    if (d[i + 3] && lum < seuil && ecart < gris) { d[i] = r; d[i + 1] = g; d[i + 2] = b; }
  }
  return img;
}

/**
 * La bande perforée du logo BAUDOT : le rectangle écru dans la partie gauche de l'image. On garde les
 * colonnes, puis les rangées, où l'écru est dense : un pixel isolé de la même couleur (le bord lissé
 * d'une lettre) ne l'agrandit pas.
 */
export function trouverBande(img, { tolerance = 18, densite = 0.25 } = {}) {
  const limite = Math.floor(img.width * 0.45);
  const ecru = (x, y) => {
    const [r, g, b] = pixel(img, x, y);
    return Math.abs(r - ECRU[0]) <= tolerance && Math.abs(g - ECRU[1]) <= tolerance && Math.abs(b - ECRU[2]) <= tolerance;
  };
  /** Le premier et le dernier indice dont le compte atteint la densité voulue du plus grand. */
  const etendue = comptes => {
    const seuil = densite * Math.max(...comptes);
    return [comptes.findIndex(n => n >= seuil), comptes.findLastIndex(n => n >= seuil)];
  };
  const colonnes = Array.from({ length: limite }, (_, x) => {
    let n = 0;
    for (let y = 0; y < img.height; y++) n += ecru(x, y);
    return n;
  });
  const [x0, x1] = etendue(colonnes);
  const rangees = Array.from({ length: img.height }, (_, y) => {
    let n = 0;
    for (let x = x0; x <= x1; x++) n += ecru(x, y);
    return n;
  });
  const [y0, y1] = etendue(rangees);
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/** Les codes Baudot d'un mot, une ligne par lettre, trous 1 à 5 de gauche à droite (1 = trou). */
export function codesBaudot(mot, table) {
  return [...mot].map(l => table[l]);
}

/** Un disque plein, au bord lissé (4 × 4 échantillons par pixel). */
function disque(img, cx, cy, rayon, couleur) {
  for (let y = Math.floor(cy - rayon - 1); y <= Math.ceil(cy + rayon + 1); y++) {
    for (let x = Math.floor(cx - rayon - 1); x <= Math.ceil(cx + rayon + 1); x++) {
      let n = 0;
      for (let j = 0; j < 4; j++) {
        for (let i = 0; i < 4; i++) {
          if ((x + (i + 0.5) / 4 - cx) ** 2 + (y + (j + 0.5) / 4 - cy) ** 2 <= rayon * rayon) n++;
        }
      }
      if (n) meler(img, x, y, couleur, n / 16);
    }
  }
}

/**
 * Repeint la bande et la reperce : une grille de 5 colonnes sur une ligne par code couvre le cadre,
 * et chaque case à 1 reçoit un trou en son centre. Modifie l'image et la renvoie.
 */
export function percer(img, { x, y, w, h }, codes, { fond = ECRU, trou = ENCRE } = {}) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) peindre(img, i, j, fond);
  const cw = w / 5, ch = h / codes.length, rayon = 0.28 * Math.min(cw, ch);
  codes.forEach((code, j) => [...code].forEach((bit, i) => {
    if (bit === '1') disque(img, x + (i + 0.5) * cw, y + (j + 0.5) * ch, rayon, trou);
  }));
  return img;
}

// ---------------------------------------------------------------- les fichiers, par ffmpeg

const RACINE = fileURLToPath(new URL('..', import.meta.url));
const SOURCES = RACINE + 'sources/images/';
const SITE = RACINE + 'public/latence/';

function ffmpeg(args, input) {
  return execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { input, maxBuffer: 1 << 28 });
}

function dimensions(fichier) {
  const sortie = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
    '-of', 'csv=p=0:s=x', fichier]).toString().trim();
  const [width, height] = sortie.split('x').map(Number);
  return { width, height };
}

/** Lit une image (JPEG, PNG, WebP…) en RGBA. */
export function lire(fichier) {
  const { width, height } = dimensions(fichier);
  return { width, height, data: Uint8ClampedArray.from(ffmpeg(['-i', fichier, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'])) };
}

/** Écrit une image RGBA en WebP, avec sa transparence si elle en a. */
function ecrireWebp(img, fichier, qualite = 90) {
  let alpha = false;
  for (let i = 3; i < img.data.length && !alpha; i += 4) alpha = img.data[i] < 255;
  ffmpeg(['-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${img.width}x${img.height}`, '-i', '-',
    '-c:v', 'libwebp', '-pix_fmt', alpha ? 'yuva420p' : 'yuv420p', '-quality', String(qualite), '-compression_level', '6', fichier],
  Buffer.from(img.data.buffer, img.data.byteOffset, img.data.length));
}

/** La photo du terminal : recadrée, puis écrite en AVIF et en WebP à chaque largeur. Renvoie sa fiche. */
function photo() {
  const { source, recadrage: c, largeurs } = PHOTO;
  const tailles = [...largeurs.filter(l => l < c.l), Math.min(c.l, Math.max(...largeurs))];
  for (const f of readdirSync(SITE)) if (/^terminal-\d+\.(avif|webp)$/.test(f)) rmSync(SITE + f);
  for (const l of tailles) {
    const filtre = `crop=${c.l}:${c.h}:${c.x}:${c.y},scale=${l}:-2:flags=lanczos`;
    ffmpeg(['-i', SOURCES + source, '-vf', filtre, '-c:v', 'libwebp', '-quality', '88', '-compression_level', '6', `${SITE}terminal-${l}.webp`]);
    ffmpeg(['-i', SOURCES + source, '-vf', filtre + ',format=yuv420p', '-c:v', 'libaom-av1', '-still-picture', '1', '-crf', '22',
      '-b:v', '0', '-cpu-used', '4', `${SITE}terminal-${l}.avif`]);
  }
  const h = Math.round(c.h * tailles[tailles.length - 1] / c.l / 2) * 2;
  return { fichier: 'latence/terminal', largeur: tailles[tailles.length - 1], hauteur: h, tailles };
}

/** Un écusson : détouré, recadré, réduit, puis écrit en WebP. Renvoie sa fiche. */
function ecusson(nom, { source, largeur, bande, autocollant, clair, exterieur }) {
  let img = lire(SOURCES + source);
  if (bande) percer(img, trouverBande(img), codesBaudot('BAUDOT', BAUDOT));
  detourer(img, { exterieur });
  if (clair) eclaircir(img, ECRU, { seuil: 200 });
  img = rogner(img, autocollant ? Math.round(img.width * 0.03) : 2);
  if (autocollant) img = poser(img, PAPIER);
  img = reduire(img, largeur);
  ecrireWebp(img, `${SITE}ecussons/${nom}.webp`);
  return { fichier: `latence/ecussons/${nom}.webp`, largeur: img.width, hauteur: img.height };
}

// ---------------------------------------------------------------- en ligne de commande

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  mkdirSync(SITE + 'ecussons', { recursive: true });
  const fiche = { photo: photo(), ecussons: {} };
  console.log(`photo : ${fiche.photo.tailles.map(l => `terminal-${l}`).join(', ')} (${fiche.photo.largeur} × ${fiche.photo.hauteur})`);
  for (const [nom, reglage] of Object.entries(ECUSSONS)) {
    const e = fiche.ecussons[nom] = ecusson(nom, reglage);
    console.log(`écusson : ${e.fichier} (${e.largeur} × ${e.hauteur})`);
  }
  writeFileSync(RACINE + 'src/scenarios/latence/images.json', JSON.stringify(fiche, null, 2) + '\n');
}
