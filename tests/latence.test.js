// Tests de LATENCE : chaque énigme a une seule solution, et elle se déduit des documents affichés.
// Les données viennent de src/scenarios/latence/data.js, comme les écrans. Les solutions attendues
// sont écrites en clair, d'après docs/latence/enigmes.md.
import { describe, it, expect } from 'vitest';
import { GREY, COLOR_NAMES } from '../src/engine/index.js';
import * as D from '../src/scenarios/latence/data.js';
import * as E from '../src/scenarios/latence/enigmes.js';
import { OBJECTIFS } from '../src/scenarios/latence/indices.js';

/** Toutes les saisies de n chiffres : '000' à '999' pour n = 3. */
const digits = n => Array.from({ length: 10 ** n }, (_, i) => String(i).padStart(n, '0'));

describe('E1 : la connexion au serveur de bord', () => {
  it("le code d'accès est le jour et le mois du départ du Martinet, lu dans l'ordre de mission", () => {
    expect(D.MISSION.depart).toBe('11/09/2097');
    expect(E.codeAcces(D.MISSION.depart)).toBe('1109');
  });

  it('seuls VERNIER et 1109 ouvrent le serveur de bord', () => {
    expect(digits(4).filter(code => E.jugeE1('VERNIER', code))).toEqual(['1109']);
    for (const id of ['ALIX', 'ALIXVERNIER', 'TL4471', 'VERNIE', '']) expect(E.jugeE1(id, '1109')).toBe(false);
  });
});

describe('E2 : le répartiteur de l’antenne', () => {
  it('la table des gris du manuel reprend les gris du moteur', () => {
    for (const [nom, pct] of Object.entries(D.GRIS)) {
      expect(Math.round(GREY[COLOR_NAMES.indexOf(nom)] * 100)).toBe(pct);
    }
  });

  it('le testeur mesure le gris de chaque câble dessiné : 50, 90, 70 et 40 %', () => {
    expect(E.luminances()).toEqual({ 1: 50, 2: 90, 3: 70, 4: 40 });
  });

  it('chaque luminance désigne une seule couleur de la table', () => {
    for (const v of Object.values(E.luminances())) {
      expect(Object.values(D.GRIS).filter(x => x === v)).toHaveLength(1);
    }
  });

  it('la chaîne de réception donne 1-3-4-2, seule saisie acceptée', () => {
    const ok = [];
    for (const s of digits(4)) if (E.jugeE2({ A: s[0], B: s[1], C: s[2], D: s[3] })) ok.push(s);
    expect(ok).toEqual(['1342']);
  });
});

describe('E3 : le délai de propagation', () => {
  it('distance divisée par la vitesse de la lumière : 333 s, soit 5 min 33 s', () => {
    expect(D.DISTANCES.terre).toBe(100000000);
    expect(D.LUMIERE).toBe(300000);
    expect(E.delai()).toBe(333);
    expect(E.duree(E.delai())).toBe('5 min 33 s');
  });

  it('l’aller-retour avec la Terre dure 666 s, soit 11 min 06 s', () => {
    expect(E.duree(2 * E.delai())).toBe('11 min 06 s');
  });

  it('seul 333 synchronise le récepteur', () => {
    expect(digits(3).filter(E.jugeE3)).toEqual(['333']);
  });
});

describe('E4 : le message de service de la Terre', () => {
  it("la table Baudot donne cinq trous à chaque lettre, sans motif en double", () => {
    const motifs = Object.values(D.BAUDOT);
    expect(Object.keys(D.BAUDOT).sort().join('')).toBe(' ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    for (const m of motifs) expect(m).toMatch(/^[01]{5}$/);
    expect(new Set(motifs).size).toBe(motifs.length);
  });

  it('ICI donne 01100 01110 01100, comme l’exemple du dossier', () => {
    expect(E.bande('ICI')).toEqual(['01100', '01110', '01100']);
  });

  it('chaque bande se relit avec la table', () => {
    for (const { texte } of Object.values(D.TERRE)) expect(E.decode(E.bande(texte))).toBe(texte);
  });

  it('F1 fait 35 caractères et son mot de contrôle, après CODE, est LUCIOLE', () => {
    expect(D.TERRE.F1.texte).toHaveLength(35);
    expect(E.motDeControle(D.TERRE.F1.texte)).toBe('LUCIOLE');
  });

  it('F2 fait 55 caractères et son mot de contrôle est SILENCE', () => {
    expect(D.TERRE.F2.texte).toHaveLength(55);
    expect(E.motDeControle(D.TERRE.F2.texte)).toBe('SILENCE');
  });

  it('seul LUCIOLE confirme la liaison', () => {
    expect(E.jugeE4('LUCIOLE')).toBe(true);
    for (const mot of ['CODE', 'LUCIOL', 'LUCIOLES', 'SILENCE', 'NADIA', '']) expect(E.jugeE4(mot)).toBe(false);
  });
});

describe('E5 : la jonction manuelle', () => {
  const MOVES = { H: [-1, 0], B: [1, 0], G: [0, -1], D: [0, 1] };

  /** Parcours en largeur sur la grille du dossier : tous les plus courts chemins de M à J. */
  function shortestPaths(grid) {
    const find = ch => { const r = grid.findIndex(l => l.includes(ch)); return [r, grid[r].indexOf(ch)]; };
    const [sr, sc] = find('M'), [jr, jc] = find('J');
    let layer = [[sr, sc, '']];
    const seen = new Set([sr + ',' + sc]);
    while (layer.length) {
      const done = layer.filter(([r, c]) => r === jr && c === jc).map(([, , path]) => path);
      if (done.length) return done;
      const next = [];
      const reached = new Set();
      for (const [r, c, path] of layer) {
        for (const [k, [dr, dc]] of Object.entries(MOVES)) {
          const R = r + dr, C = c + dc, key = R + ',' + C;
          if (R < 0 || R >= grid.length || C < 0 || C >= grid[0].length || grid[R][C] === '#' || seen.has(key)) continue;
          next.push([R, C, path + k]);
          reached.add(key);
        }
      }
      reached.forEach(k => seen.add(k));
      layer = next;
    }
    return [];
  }

  it('un seul plus court chemin de M à J, en huit impulsions', () => {
    expect(shortestPaths(D.JONCTION.grille)).toEqual(['HHDDDHHD']);
    expect(D.JONCTION.impulsions).toBe(8);
  });

  it('le jeu trouve le même chemin, celui que donne le troisième indice', () => {
    expect(E.cheminE5()).toBe('HHDDDHHD');
    expect(OBJECTIFS.find(o => o.id === 'O5').indices[2]).toBe('H H D D D H H D.');
  });

  it("la jonction n'accepte que HHDDDHHD, sur toutes les saisies d'une à huit impulsions", () => {
    const ok = [];
    const walk = s => {
      if (s && E.jugeE5(s)) ok.push(s);
      if (s.length < 8) for (const k of 'HBGD') walk(s + k);
    };
    walk('');
    expect(ok).toEqual(['HHDDDHHD']);
  });

  it.each([
    ['DHHHHHHH', 'contact', 2],
    ['HHDDDHHG', 'contact', 8],
    ['GHHHHHHH', 'sortie', 1],
    ['BBBBBBBB', 'sortie', 1],
    ['DDDDDDDD', 'reservoir', 8],
    ['HHDDD', 'court', 5],
    ['HHDDDHHD', 'anneau', 8],
  ])('%s : %s à la %se impulsion', (saisie, issue, n) => {
    const t = E.trajet(saisie);
    expect([t.issue, t.n]).toEqual([issue, n]);
  });

  it('le refus nomme l’impulsion fautive : 1re, 2e…', () => {
    expect(E.refusE5('GHHHHHHH')).toContain('1re impulsion');
    expect(E.refusE5('DHHHHHHH')).toContain('2e impulsion');
  });
});

describe('E6 : le code de maintenance du relais', () => {
  it('la règle du carnet donne 308029 pour L3, comme son exemple, et 7180212 pour L7', () => {
    expect(E.codeMaintenance(D.EXEMPLE_CODE)).toBe('308029');
    expect(E.codeMaintenance(D.RELAIS)).toBe('7180212');
  });

  it('la plaque du relais donne les valeurs : L7, mis en service en 2081, 12 modules', () => {
    expect(D.RELAIS).toMatchObject({ numero: 7, miseEnService: 2081, modules: 12 });
  });

  it('seul 7180212 ouvre le serveur du relais', () => {
    expect(E.jugeE6('7180212')).toBe(true);
    for (const code of ['7208112', '7180213', '718021', '3080290', '1802127', '']) expect(E.jugeE6(code)).toBe(false);
  });
});

describe('E7 : le plan de fréquences', () => {
  /** Les 3 125 saisies possibles : un canal de 1 à 5 pour chacune des cinq liaisons. */
  const plans = () => Array.from({ length: 3125 }, (_, i) => {
    const v = i.toString(5).padStart(5, '0');
    return { TM: +v[0] + 1, TD: +v[1] + 1, MM: +v[2] + 1, MD: +v[3] + 1, RP: +v[4] + 1 };
  });

  it('une seule saisie sur 3 125 respecte les six règles : TM 4, TD 2, MM 5, MD 3, RP 1', () => {
    expect(plans().filter(p => E.regleViolee(p) === 0)).toEqual([{ TM: 4, TD: 2, MM: 5, MD: 3, RP: 1 }]);
  });

  it('chaque règle est nécessaire : sans elle, il y a plusieurs solutions', () => {
    for (let k = 1; k <= 6; k++) expect(plans().filter(p => E.regleViolee(p, k) === 0).length).toBeGreaterThan(1);
  });

  it('le refus nomme la première règle violée', () => {
    expect(E.regleViolee({ TM: 4, TD: 2, MM: 5, MD: 3, RP: 3 })).toBe(1);
    expect(E.regleViolee({ TM: 2, TD: 4, MM: 5, MD: 3, RP: 1 })).toBe(3);
    expect(E.regleViolee({ TM: 4, TD: 2, MM: 3, MD: 1, RP: 5 })).toBe(5);
  });

  it("l'état des canaux signale le canal 4 brouillé côté Mars", () => {
    expect(D.BROUILLAGE).toEqual({ canal: 4, planete: 'Mars' });
  });
});

describe('E8 : la porte des quartiers de garde', () => {
  const jour = s => s.split('/').reverse().join('');   // JJ/MM/AAAA → AAAAMMJJ, comparable

  it('le dernier ravitaillement officiel date de 2089, et son code 0206 a été remplacé', () => {
    expect(D.RAVITAILLEMENTS.dernier).toBe('02/06/2089');
    expect(E.refusE8('0206')).toBe('Code refusé. Ce code a été remplacé depuis 2089.');
    expect(E.refusE8('1234')).toBe('Code refusé. La porte reste fermée.');
  });

  it('dix capsules perdues près de L7, toutes après le 03/09/2095', () => {
    expect(D.CAPSULES).toHaveLength(10);
    for (const c of D.CAPSULES) {
      expect(jour(c.date) > jour(D.ACCIDENT.date)).toBe(true);
      expect(c.distance).toBeLessThan(500);
    }
  });

  it('la dernière capsule « perdue » date du 26/08/2097 : seul 2608 ouvre la porte', () => {
    expect(E.dernierRavitaillement()).toBe('26/08/2097');
    expect(digits(4).filter(E.jugeE8)).toEqual(['2608']);
  });
});

describe('F2 : le second message de la Terre', () => {
  it('arrive 12 min 06 s après LUCIOLE : 5 min 33 s, une minute de réaction, 5 min 33 s', () => {
    expect(E.delaiF2()).toBe(726);
    expect(E.duree(E.delaiF2())).toBe('12 min 06 s');
  });
});

describe("les indices de l'acte II", () => {
  const indice = id => OBJECTIFS.find(o => o.id === id).indices[2];

  it('les troisièmes indices de E6, E7 et E8 donnent les solutions du dossier', () => {
    expect(indice('O6')).toBe('7, puis 2081 à l\'envers, 1802, puis 12 : 7180212.');
    expect(indice('O7')).toBe('TM 4, TD 2, MM 5, MD 3, RP 1.');
    expect(indice('O8')).toBe('La dernière capsule « perdue » date du 26/08/2097. Le code est 2608.');
  });
});

describe('E9 : le retour à deux', () => {
  it("l'oxygène pour deux pendant six jours : 10,08 kg ; il en manque 4,08, soit deux bouteilles", () => {
    expect(E.oxygeneRetour(2)).toBeCloseTo(10.08, 6);
    expect(E.bouteillesE9()).toBe(2);
  });

  it('la masse au départ : 4 100 + 54 + 36 − 85 = 4 105 kg, soit 6 min 30 s', () => {
    expect(E.masseE9()).toBe(4105);
    expect(E.pousseeE9(4105)).toBe('6 min 30 s');
  });

  it("avec le poids de 2095, 61 kg, on trouve 4 112 kg et 6 min 35 s : c'est le piège", () => {
    expect(E.masseE9(61)).toBe(4112);
    expect(E.pousseeE9(4112)).toBe('6 min 35 s');
  });

  it('sans laisser le module de rechange, la masse dépasse 4 130 kg : retour impossible', () => {
    expect(E.pousseeE9(4100 + 54 + 36)).toBe(null);
  });

  it('une seule combinaison acceptée : 2 bouteilles, 6 min 30 s', () => {
    const ok = [];
    for (const b of '0123456789') for (const m of '0123456789') for (const s of digits(2)) {
      if (E.jugeE9(b, m, s)) ok.push(`${b} ${m} ${s}`);
    }
    expect(ok).toEqual(['2 6 30']);
    expect(E.jugeE9('2', '6', '3')).toBe(false);
  });

  it.each([
    ['1', '6', '30', 'Oxygène insuffisant pour deux personnes pendant six jours.'],
    ['3', '6', '40', 'Une bouteille de trop : n\'embarquez que l\'oxygène nécessaire.'],
    ['2', '6', '35', 'Trajectoire refusée. La poussée ne correspond pas à la masse.'],
  ])('%s bouteille(s), %s min %s s : « %s »', (b, m, s, refus) => {
    expect(E.refusE9(b, m, s)).toBe(refus);
  });
});

describe('les dates de la révélation', () => {
  it("la session d'Irène est ouverte depuis 745 jours : du 03/09/2095 au 17/09/2097", () => {
    expect(E.jours(D.ACCIDENT.date, D.JOUR.date)).toBe(745);
  });

  it('L7 se tait depuis dix-neuf jours : du 29/08/2097 au 17/09/2097', () => {
    expect(E.jours(D.MISSION.silence, D.JOUR.date)).toBe(19);
  });
});

describe('les dessins en pavés', () => {
  it('un dessin écrit en chaînes allume les pavés marqués #, à leur place', async () => {
    const { dessin } = await import('../src/scenarios/latence/art.js');
    const { Vdt } = await import('../src/engine/vdt.js');
    const { Screen, T_MOSAIC } = await import('../src/engine/screen.js');
    const { Decoder } = await import('../src/engine/decoder.js');
    const screen = new Screen(), dec = new Decoder(screen);
    const p = new Vdt();
    // Deux cases : la première a ses deux pavés du haut allumés, la seconde son pavé du bas à droite
    dessin(p, 5, 1, ['##..', '....', '...#']);
    for (const b of p.bytes()) dec.feed(b);
    expect(screen.t[5 * 40]).toBe(T_MOSAIC);
    expect(screen.c[5 * 40]).toBe(0x20 | 0x01 | 0x02);
    expect(screen.c[5 * 40 + 1]).toBe(0x20 | 0x40);
  });

  it('symetrique complète un dessin par sa moitié gauche, en miroir', async () => {
    const { symetrique } = await import('../src/scenarios/latence/art.js');
    expect(symetrique(['#..', '.#.'])).toEqual(['#....#', '.#..#.']);
  });

  it("le martinet et le relais tiennent dans leur place, sans aucun trait d'un seul pavé", async () => {
    const { DESSIN_MARTINET, DESSIN_RELAIS } = await import('../src/scenarios/latence/art.js');
    for (const [nom, d, colonnes, rangees] of [['martinet', DESSIN_MARTINET, 16, 7], ['relais', DESSIN_RELAIS, 12, 6]]) {
      expect(d.length, nom).toBe(rangees * 3);
      for (const ligne of d) expect(ligne.length, nom).toBe(colonnes * 2);
      // Un trait d'au moins deux pavés de large : chaque pavé allumé a un voisin allumé dans sa
      // rangée et un dans sa colonne
      const allume = (x, y) => !!d[y] && d[y][x] === '#';
      for (let y = 0; y < d.length; y++) {
        for (let x = 0; x < d[y].length; x++) {
          if (!allume(x, y)) continue;
          expect(allume(x - 1, y) || allume(x + 1, y), `${nom} (${x}, ${y}) : un pavé de large`).toBe(true);
          expect(allume(x, y - 1) || allume(x, y + 1), `${nom} (${x}, ${y}) : un pavé de haut`).toBe(true);
        }
      }
    }
  });
});
