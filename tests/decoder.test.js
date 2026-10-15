// Tests du décodeur Vidéotex : chaque cas vérifie une règle de la STUM 1B.
import { describe, it, expect, beforeEach } from 'vitest';
import { Screen, T_ALPHA, T_MOSAIC, T_DELIM, F_INVERSE, F_BLINK, F_LINE } from '../src/engine/screen.js';
import { Decoder } from '../src/engine/decoder.js';
import { Vdt, encodeText, mosaicArt } from '../src/engine/vdt.js';

let screen, dec;
const feed = bytes => { for (const b of bytes) dec.feed(b); };
const cell = (r, c) => r * 40 + c - 1;

beforeEach(() => {
  screen = new Screen();
  dec = new Decoder(screen);
});

describe('positionnement et texte', () => {
  it('US place le curseur en rangée/colonne et écrit le texte', () => {
    feed(new Vdt().at(5, 25).text('A').bytes());
    expect(screen.c[cell(5, 25)]).toBe(0x41);
    expect(screen.t[cell(5, 25)]).toBe(T_ALPHA);
  });

  it('le 41e caractère déborde sur la rangée suivante', () => {
    feed(new Vdt().at(3, 40).text('XY').bytes());
    expect(screen.c[cell(3, 40)]).toBe(0x58);
    expect(screen.c[cell(4, 1)]).toBe(0x59);
  });

  it('en rangée 00, les caractères après la colonne 40 restent en colonne 40', () => {
    feed(new Vdt().at(0, 40).text('XY').bytes());
    expect(screen.c[cell(0, 40)]).toBe(0x59);
    expect(dec.r).toBe(0);
  });

  it('LF en rangée 00 ramène à la position et aux attributs précédents', () => {
    feed(new Vdt().at(7, 3).fg(1).bytes());
    feed(new Vdt().at(0, 1).text('info').bytes());
    feed([0x0A]);
    expect([dec.r, dec.c, dec.fg]).toEqual([7, 3, 1]);
  });
});

describe('répétition et accents', () => {
  it('REP répète le dernier caractère n fois (le caractère lui-même non compris)', () => {
    feed([0x1F, 0x41, 0x41, 0x2D, 0x12, 0x4A]);   // « - » puis REP 10
    expect(screen.rowText(1).slice(0, 12)).toBe('-'.repeat(11) + ' ');
  });

  it('SS2 + accent aigu + e compose un é', () => {
    feed(new Vdt().at(1, 1).text('é').bytes());
    expect(screen.c[cell(1, 1)]).toBe(0x65);
    expect(screen.a[cell(1, 1)]).toBe(0x42);
  });

  it("l'encodeur replie les majuscules accentuées et compresse les suites", () => {
    expect(encodeText('É').bytes).toEqual([0x45]);
    expect(encodeText('.....').bytes).toEqual([0x2E, 0x12, 0x44]);
  });

  it('le signe moins typographique devient un tiret', () => {
    expect(encodeText('a − b').bytes).toEqual([0x61, 0x20, 0x2D, 0x20, 0x62]);
  });
});

describe('attributs', () => {
  it("la couleur de fond est un attribut série validé par l'espace suivant", () => {
    feed(new Vdt().at(2, 1).bg(4).text('A B').bytes());
    expect(screen.t[cell(2, 1)]).toBe(T_ALPHA);   // « A » garde le fond courant
    expect(screen.t[cell(2, 2)]).toBe(T_DELIM);   // l'espace devient délimiteur
    expect(screen.b[cell(2, 2)]).toBe(4);
  });

  it('la double hauteur occupe la rangée courante et celle du dessus', () => {
    feed(new Vdt().at(6, 1).size(1).text('H').bytes());
    expect(screen.c[cell(5, 1)]).toBe(0x48);
    expect(screen.c[cell(6, 1)]).toBe(0x48);
    expect((screen.p[cell(5, 1)] >> 2) & 3).toBe(1);   // moitié haute
    expect((screen.p[cell(6, 1)] >> 2) & 3).toBe(2);   // moitié basse
  });

  it('pas de double hauteur en rangée 01', () => {
    feed(new Vdt().at(1, 1).size(1).text('H').bytes());
    expect(screen.p[cell(1, 1)]).toBe(0);
  });

  it("l'inversion est un attribut de caractère", () => {
    feed(new Vdt().at(9, 1).inv().text('X').bytes());
    expect(screen.fl[cell(9, 1)] & F_INVERSE).toBe(F_INVERSE);
  });

  it('US réinitialise les attributs (blanc sur noir, G0)', () => {
    feed(new Vdt().at(1, 1).fg(2).g1().at(2, 1).bytes());
    expect([dec.fg, dec.g1]).toEqual([7, false]);
  });
});

describe('dessins en pavés', () => {
  it('mosaicArt : une couleur + 16 clignote, sans rendre le pavé disjoint', () => {
    const p = new Vdt();
    mosaicArt(p, 3, 1, 1, 1, () => 7 + 16);
    feed(p.bytes());
    expect(screen.t[cell(3, 1)]).toBe(T_MOSAIC);
    expect(screen.fl[cell(3, 1)] & F_BLINK).toBe(F_BLINK);
    expect(screen.fl[cell(3, 1)] & F_LINE).toBe(0);
  });

  it('mosaicArt : une couleur + 8 donne des pavés disjoints, fixes', () => {
    const p = new Vdt();
    mosaicArt(p, 3, 1, 1, 1, () => 7 + 8);
    feed(p.bytes());
    expect(screen.fl[cell(3, 1)] & F_LINE).toBe(F_LINE);
    expect(screen.fl[cell(3, 1)] & F_BLINK).toBe(0);
  });
});

describe('semi-graphiques et effacement', () => {
  it('SO passe en G1 : 0x7F est un pavé plein', () => {
    feed(new Vdt().at(4, 1).g1().raw(0x7F).bytes());
    expect(screen.t[cell(4, 1)]).toBe(T_MOSAIC);
    expect(screen.c[cell(4, 1)]).toBe(0x7F);
  });

  it("FF efface les rangées 01 à 24 mais pas la rangée 00", () => {
    feed(new Vdt().at(0, 1).text('Z').at(10, 1).text('Q').bytes());
    feed([0x0C]);
    expect(screen.c[cell(0, 1)]).toBe(0x5A);
    expect(screen.t[cell(10, 1)]).toBe(T_MOSAIC);
    expect([dec.r, dec.c]).toEqual([1, 1]);
  });

  it('un code de commande resynchronise une séquence interrompue', () => {
    feed([0x1B]);          // ESC seul
    feed([0x0C]);          // FF doit quand même effacer
    feed(new Vdt().at(1, 1).text('ok').bytes());
    expect(screen.rowText(1).slice(0, 2)).toBe('ok');
  });
});
