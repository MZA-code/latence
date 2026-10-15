// Tests de l'outil tools/images.mjs : le traitement des pixels qui prépare les écussons du site
// (détourage, recadrage, réduction, bande perforée de BAUDOT). Les lectures et écritures de fichiers
// passent par ffmpeg et ne sont pas testées ici.
import { describe, it, expect } from 'vitest';
import {
  creer, pixel, peindre, detourer, rogner, poser, reduire, eclaircir, trouverBande, percer, codesBaudot,
  ECRU as PALETTE_ECRU, ENCRE as PALETTE_ENCRE,
} from '../tools/images.mjs';
import { BAUDOT } from '../src/scenarios/latence/data.js';

const BLANC = [255, 255, 255, 255];
const ENCRE = [...PALETTE_ENCRE, 255];
const ECRU = [...PALETTE_ECRU, 255];

/** Remplit un rectangle d'une couleur. */
function rect(img, x0, y0, w, h, c) {
  for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) peindre(img, x, y, c);
}

describe('le détourage du fond blanc', () => {
  it('rend le blanc transparent et garde opaques les couleurs franches, écru compris', () => {
    const img = creer(3, 1, BLANC);
    peindre(img, 1, 0, ENCRE);
    peindre(img, 2, 0, ECRU);
    detourer(img);
    expect(pixel(img, 0, 0)[3]).toBe(0);
    expect(pixel(img, 1, 0)).toEqual(ENCRE);
    expect(pixel(img, 2, 0)).toEqual(ECRU);
  });

  it("un bord lissé devient semi-transparent, débarrassé du blanc qu'il contenait", () => {
    // Un pixel de bord : 70 % de blanc, 30 % d'encre, à une distance au blanc entre net et plein
    const img = creer(1, 1, [215, 216, 218, 255]);
    detourer(img, { net: 12, plein: 120 });
    const [r, g, b, a] = pixel(img, 0, 0);
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(255);
    expect(r).toBeLessThan(215);      // la couleur gardée est plus foncée que le mélange
    expect(b).toBeLessThan(218);
    void g;
  });

  it("avec exterieur, seul le blanc relié au bord de l'image part : un blanc enfermé reste", () => {
    // Un cadre d'encre de 5 × 5 au milieu d'une image blanche de 9 × 9, blanc à l'intérieur
    const img = creer(9, 9, BLANC);
    rect(img, 2, 2, 5, 5, ENCRE);
    rect(img, 3, 3, 3, 3, BLANC);
    detourer(img, { exterieur: true });
    expect(pixel(img, 0, 0)[3]).toBe(0);          // dehors : transparent
    expect(pixel(img, 4, 4)).toEqual(BLANC);      // dedans : le blanc reste
    expect(pixel(img, 2, 2)).toEqual(ENCRE);
  });
});

describe('le recadrage, la pose sur un fond et la réduction', () => {
  it('rogner garde ce qui est visible, plus la marge demandée', () => {
    const img = creer(10, 8, [0, 0, 0, 0]);
    rect(img, 3, 2, 4, 3, ENCRE);
    const r = rogner(img, 1);
    expect([r.width, r.height]).toEqual([6, 5]);
    expect(pixel(r, 1, 1)).toEqual(ENCRE);
    expect(pixel(r, 0, 0)[3]).toBe(0);
  });

  it('poser rend opaque en mêlant chaque pixel au fond selon sa transparence', () => {
    const img = creer(2, 1, [0, 0, 0, 0]);
    peindre(img, 1, 0, [0, 0, 0, 128]);
    const p = poser(img, [200, 100, 50]);
    expect(pixel(p, 0, 0)).toEqual([200, 100, 50, 255]);
    expect(pixel(p, 1, 0)).toEqual([100, 50, 25, 255]);
  });

  it('reduire moyenne les pixels sans que le transparent noircisse les bords', () => {
    // 4 × 2 : à gauche deux pixels écru opaques et deux transparents (noirs) ; à droite de l'encre
    const img = creer(4, 2, [0, 0, 0, 0]);
    peindre(img, 0, 0, ECRU);
    peindre(img, 1, 1, ECRU);
    rect(img, 2, 0, 2, 2, ENCRE);
    const r = reduire(img, 2);
    expect([r.width, r.height]).toEqual([2, 1]);
    expect(pixel(r, 0, 0)).toEqual([...PALETTE_ECRU, 128]);   // la couleur reste écru, à moitié opaque
    expect(pixel(r, 1, 0)).toEqual(ENCRE);
  });

  it("eclaircir fait passer l'encre en écru, sans toucher aux couleurs ni à la transparence", () => {
    const img = creer(4, 1, [0, 0, 0, 0]);
    peindre(img, 0, 0, [30, 35, 40, 200]);
    peindre(img, 1, 0, [160, 64, 45, 255]);    // rouge Mars
    peindre(img, 2, 0, [52, 80, 106, 255]);    // bleu Baudot : foncé, mais coloré
    const r = eclaircir(img, PALETTE_ECRU);
    expect(pixel(r, 0, 0)).toEqual([...PALETTE_ECRU, 200]);
    expect(pixel(r, 1, 0)).toEqual([160, 64, 45, 255]);
    expect(pixel(r, 2, 0)).toEqual([52, 80, 106, 255]);
    expect(pixel(r, 3, 0)[3]).toBe(0);
  });
});

describe('la bande perforée de BAUDOT', () => {
  /** Un logo d'essai : une bande écru bordée d'encre à gauche, griffonnée de faux trous, et du texte à droite. */
  function logo() {
    const img = creer(120, 80, BLANC);
    rect(img, 8, 10, 3, 60, ENCRE);
    rect(img, 41, 10, 3, 60, ENCRE);
    rect(img, 11, 10, 30, 60, ECRU);
    for (let k = 0; k < 12; k++) rect(img, 13 + (k * 7) % 25, 14 + k * 4, 3, 3, ENCRE);   // les chiffres de Gemini
    rect(img, 60, 30, 40, 12, [52, 80, 106, 255]);                                       // le mot, en bleu
    return img;
  }

  it("trouve la bande : l'écru à gauche du logo", () => {
    expect(trouverBande(logo())).toEqual({ x: 11, y: 10, w: 30, h: 60 });
  });

  it("des pixels isolés couleur de bande (le bord lissé d'une lettre) ne l'agrandissent pas", () => {
    const img = logo();
    peindre(img, 48, 20, ECRU);
    peindre(img, 50, 74, ECRU);
    peindre(img, 52, 75, ECRU);
    expect(trouverBande(img)).toEqual({ x: 11, y: 10, w: 30, h: 60 });
  });

  it('les codes de BAUDOT viennent de la table du jeu', () => {
    expect(codesBaudot('BAUDOT', BAUDOT)).toEqual(['10011', '11000', '11100', '10010', '00011', '00001']);
  });

  it('repercée, la bande écrit BAUDOT : une ligne par lettre, un trou au centre de chaque case à 1', () => {
    const img = logo(), cadre = trouverBande(img);
    const codes = codesBaudot('BAUDOT', BAUDOT);
    percer(img, cadre, codes);
    // Une grille de 5 colonnes sur 6 lignes couvre la bande ; on lit le centre de chaque case
    const lu = codes.map((_, j) => [0, 1, 2, 3, 4].map(i => {
      const x = Math.floor(cadre.x + (i + 0.5) * cadre.w / 5), y = Math.floor(cadre.y + (j + 0.5) * cadre.h / codes.length);
      const [r] = pixel(img, x, y);
      return r < 100 ? '1' : '0';
    }).join(''));
    expect(lu).toEqual(codes);
    // Les faux trous ont disparu : entre les cases, la bande est écru
    expect(pixel(img, cadre.x + 1, cadre.y + 1)).toEqual(ECRU);
    // Le reste du logo n'a pas bougé
    expect(pixel(img, 70, 35)).toEqual([52, 80, 106, 255]);
    expect(pixel(img, 9, 40)).toEqual(ENCRE);
  });
});
