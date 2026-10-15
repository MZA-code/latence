// Tests de l'outil tools/mosaique.mjs : une silhouette noir et blanc (PNG) devient un dessin en pavés.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { decodePng, versPaves, enModule } from '../tools/mosaique.mjs';

const fixture = nom => readFileSync(new URL('./fixtures/' + nom, import.meta.url));

describe('le décodeur PNG', () => {
  it("lit l'image faite par Chrome (RGBA 8 bits) : dégradés et carré noir à leurs valeurs", () => {
    const img = decodePng(fixture('essai.png'));
    expect([img.width, img.height]).toEqual([40, 30]);
    expect(img.rgb(5, 3)).toEqual([30, 30, 30]);        // rangées 0 à 9 : gris = 6 × x
    expect(img.rgb(17, 12)).toEqual([96, 96, 96]);      // rangées 10 à 19 : gris = 8 × y
    expect(img.rgb(5, 25)).toEqual([255, 255, 255]);    // rangées 20 à 29 : fond blanc…
    expect(img.rgb(15, 25)).toEqual([0, 0, 0]);         // …et carré noir de x = 10 à 29
    expect(img.alpha(15, 25)).toBe(255);
  });

  it('défait les cinq filtres de rangée (aucun, Sub, Up, Average, Paeth), en RGB', () => {
    const img = decodePng(fixture('filtres.png'));
    const pixel = (x, y) => [(x * 10 + y * 7) % 256, (x * 3 + 40) % 256, (255 - y * 12) % 256];
    for (let y = 0; y < 15; y++) for (let x = 0; x < 24; x++) expect(img.rgb(x, y), `(${x}, ${y})`).toEqual(pixel(x, y));
  });

  it("refuse ce qui n'est pas un PNG", () => {
    expect(() => decodePng(Buffer.from('GIF89a'))).toThrow('PNG');
  });
});

describe('la conversion en pavés', () => {
  /** Une image en mémoire : noir là où dans(x, y) est vrai, blanc ailleurs, opaque. */
  const image = (width, height, dans, alpha = 255) => ({
    width, height,
    rgb: (x, y) => (dans(x, y) ? [0, 0, 0] : [255, 255, 255]),
    alpha: () => alpha,
  });

  it('une moitié gauche noire allume la moitié gauche des pavés', () => {
    // 2 colonnes × 2 rangées = 16 × 20 pixels de trame : un pixel d'image par pixel de trame
    expect(versPaves(image(16, 20, x => x < 8), 2, 2)).toEqual(['##..', '##..', '##..', '##..', '##..', '##..']);
  });

  it("garde les proportions : l'image se centre, avec du blanc autour", () => {
    // 16 × 10 tout noir, dans 4 colonnes × 1 rangée (32 × 10 pixels) : de x = 8 à 24, les pavés 2 à 5
    expect(versPaves(image(16, 10, () => true), 4, 1)).toEqual(['..####..', '..####..', '..####..']);
  });

  it("le seuil décide d'un pavé à moitié couvert", () => {
    // Noir de x = 0 à 6 : le deuxième pavé (x = 4 à 8) est noir à moitié
    const img = image(16, 10, x => x < 6);
    expect(versPaves(img, 2, 1, 0.5)).toEqual(['##..', '##..', '##..']);
    expect(versPaves(img, 2, 1, 0.6)).toEqual(['#...', '#...', '#...']);
  });

  it('la transparence compte pour du blanc', () => {
    expect(versPaves(image(16, 10, () => true, 0), 2, 1)).toEqual(['....', '....', '....']);
  });
});

describe('le module produit', () => {
  it('donne un tableau de chaînes à coller dans art.js, avec sa source', () => {
    const js = enModule('MARTINET', ['#.', '.#'], 'martinet.png');
    expect(js).toContain('martinet.png');
    expect(js).toContain("export const MARTINET = [\n  '#.',\n  '.#',\n];");
  });
});
