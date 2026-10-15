// Les réglages de l'écran sur la page du jeu (src/ui/reglages.js) : ce que le navigateur a gardé
// redevient un réglage sûr, et les réglages s'appliquent au terminal.
import { describe, it, expect } from 'vitest';
import { reglagesValides, appliquer, CURSEURS } from '../src/ui/reglages.js';

const ORIGINE = { phos: 'blanc', curv: 0.1, scan: 0.55, bloom: 0.45, persist: 0.35 };

describe('les réglages gardés', () => {
  it('reprennent les valeurs gardées quand elles sont bonnes', () => {
    const gardes = { phos: 'vert', curv: 0.2, scan: 0.3, bloom: 0.8, persist: 0 };
    expect(reglagesValides(gardes, ORIGINE)).toEqual(gardes);
  });

  it("reprennent la valeur d'origine pour un réglage absent, d'un mauvais type ou un phosphore inconnu", () => {
    expect(reglagesValides({ phos: 'ambre', curv: '0.2', scan: NaN, bloom: null }, ORIGINE)).toEqual(ORIGINE);
    expect(reglagesValides(null, ORIGINE)).toEqual(ORIGINE);
  });

  it('ramènent une valeur hors bornes à la borne la plus proche', () => {
    const r = reglagesValides({ curv: 2, scan: -1 }, ORIGINE);
    expect(r.curv).toBe(CURSEURS.curv.max);
    expect(r.scan).toBe(CURSEURS.scan.min);
  });

  it('ignorent ce qui ne règle pas le tube (le son reste ailleurs)', () => {
    expect(reglagesValides({ sound: false, autre: 1 }, ORIGINE)).toEqual(ORIGINE);
  });
});

describe('les réglages appliqués', () => {
  it('passent au terminal : phosphore, courbure, halo, balayage et rémanence', () => {
    const terminal = { params: {}, phosphor: null, setPhosphor(nom) { this.phosphor = nom; } };
    appliquer(terminal, { phos: 'vert', curv: 0.2, scan: 0.3, bloom: 0.8, persist: 0.1 });
    expect(terminal.phosphor).toBe('vert');
    expect(terminal.params).toEqual({ curv: 0.2, bloom: 0.8 });
    expect(terminal.scan).toBe(0.3);
    expect(terminal.persistence).toBe(0.1);
  });
});
