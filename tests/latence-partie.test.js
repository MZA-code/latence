// Tests du déroulé de LATENCE : les vraies scènes, jouées au clavier, en faisant passer le temps.
// Prologue et acte I, de l'écran titre à la jonction (docs/latence/scenario.md et textes.md).
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { harness, memoryStorage, watchOverflow, T } from './helpers.js';
import { wrap } from '../src/game/ui.js';
import { T_ALPHA, T_MOSAIC } from '../src/engine/screen.js';
import { hms } from '../src/game/state.js';
import scenario from '../src/scenarios/latence/index.js';
import { TERRE, BAUDOT, REFUS, CAPSULES } from '../src/scenarios/latence/data.js';
import { refusE5 } from '../src/scenarios/latence/enigmes.js';
import { CONTROLE, REPONSES, QUESTIONS } from '../src/scenarios/latence/messages.js';
import { OBJECTIFS } from '../src/scenarios/latence/indices.js';

/**
 * Un texte comme rowText le montre : sans accents, espaces insécables ordinaires, blancs réduits,
 * et les guillemets « » devenus " collés au texte, comme le font typo() et l'encodeur.
 */
const plain = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\u00a0\u202f]/g, ' ')
  .replace(/«\s*/g, '"').replace(/\s*»/g, '"').replace(/\s+/g, ' ').trim();

/** Une partie de LATENCE sur le terminal de test. Le hasard des délais vaut 0 : 15 secondes. */
function partie() {
  const h = harness(scenario, { random: () => 0 });
  const screen = () => plain(Array.from({ length: 24 }, (_, i) => h.row(i + 1)).join(' '));
  return {
    ...h,
    screen,
    sees: text => expect(screen()).toContain(plain(text)),
    misses: text => expect(screen()).not.toContain(plain(text)),
    type(s) { for (const ch of s) h.g.typeChar(ch); h.run(0); },
    press(...keys) { for (const k of keys) { h.g.key(k); h.run(0); } },
    choose(n) { this.type(String(n)); this.press('envoi'); },
    /** Avance l'horloge jusqu'à l'heure t, au quart de seconde près, et laisse partir ce qui est dû. */
    until(t) {
      h.g.s.elapsedMs = (t - T(14, 0, 0) - h.g.s.penalty * 60) * 1000 - 250;
      h.run(0.5);
    },
  };
}

// Étapes du déroulé, chacune à partir de la précédente
const prologue = (h, genre = 2) => { h.g.boot(); h.run(0); h.press('envoi'); h.choose(genre); h.press('suite', 'suite'); };
const connecte = h => { prologue(h); h.press('envoi'); h.type('VERNIER'); h.press('envoi'); h.type('1109'); h.press('envoi'); };
const antenne = h => { connecte(h); h.choose(4); h.choose(1); h.choose(1); h.type('1342'); h.press('envoi'); };
const synchro = h => { antenne(h); h.press('sommaire'); h.choose(2); h.type('333'); h.press('envoi'); };
const message = h => { synchro(h); h.until(T(14, 10, 0)); h.press('repetition'); h.choose(1); };
const liaison = h => { message(h); h.type('LUCIOLE'); h.press('envoi'); };
const jonction = h => {
  liaison(h);
  h.until(h.g.s.times.e4 + 120);
  h.press('sommaire');
  h.choose(3);
  h.choose(1);
  h.type('HHDDDHHD');
  h.press('envoi');
  h.run(0);
};
/** CONNEXION/FIN : le modem siffle 2,1 s (minuterie du navigateur), puis le relais répond. */
const appelle = h => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  h.press('connexion');
  vi.advanceTimersByTime(2100);
  vi.useRealTimers();
  h.run(0);
};
const relais = h => { jonction(h); appelle(h); h.type('7180212'); h.press('envoi'); };
/** Plan validé, porte ouverte, entrée dans les quartiers : on arrive au menu des quartiers. */
const revele = h => {
  relais(h);
  h.choose(2);
  h.type('42531');
  h.press('envoi');
  h.press('sommaire');
  h.choose(6);
  h.type('2608');
  h.press('envoi');
  h.press('envoi', 'envoi', 'envoi');
};
/** Les trois questions à Irène, dans l'ordre 3, 1, 2, puis « Et maintenant ? » : la clé 2. */
const cle = h => {
  revele(h);
  h.choose(1);
  for (const n of [3, 1, 2]) {
    h.choose(n);
    h.press('retour');
  }
  h.choose(4);
};
/** La clé 2 en main, le plan validé : Alix tourne les deux clés. */
const allume = h => {
  cle(h);
  h.press('sommaire');
  h.choose(5);
  h.press('envoi');
  h.run(0);
};
/** FIN, puis le menu PARTIR du Martinet. */
const partir = h => {
  h.press('connexion');
  h.choose(7);
};
/** Partir avec Irène et faire le calcul du retour juste, puis confirmer. */
const partAvecIrene = h => {
  partir(h);
  h.choose(2);
  h.type('2630');
  h.press('envoi');
  h.press('envoi');
};

/** Q2 posée, F2 décodé, jonction faite, serveur du relais ouvert : Q6 peut apparaître. */
const demasquable = h => {
  liaison(h);
  h.press('sommaire');
  h.choose(1);
  h.choose(0);
  h.choose(2);
  h.until(h.g.s.times.e4 + 726);
  h.press('sommaire');
  h.choose(2);
  h.choose(1);
  h.type('SILENCE');
  h.press('envoi');
  h.press('sommaire');
  h.choose(3);
  h.choose(1);
  h.type('HHDDDHHD');
  h.press('envoi');
  h.run(0);
  appelle(h);
  h.type('7180212');
  h.press('envoi');
};

/**
 * La bande Baudot telle qu'elle est à l'écran : trois colonnes de 12 lignes, rangées 06 à 17.
 * Un trou est un semi-graphique aux quatre pavés du haut allumés, une position vide un point.
 */
function readTape(m, count) {
  const out = [];
  for (let i = 0; i < count; i++) {
    const r = 6 + (i % 12), c = 2 + Math.floor(i / 12) * 13;
    let motif = '';
    for (let k = 0; k < 5; k++) {
      const cell = r * 40 + c + 2 + 2 * k;
      const trou = m.screen.t[cell] === T_MOSAIC && m.screen.c[cell] === 0x2F;
      const point = m.screen.t[cell] === T_ALPHA && m.screen.c[cell] === 0x2E;
      motif += trou ? '1' : point ? '0' : '?';
    }
    out.push(motif);
  }
  return out;
}

describe('le prologue', () => {
  it("l'écran titre annonce le papier et le crayon, et propose le mode sans chrono", () => {
    const h = partie();
    h.g.boot();
    h.run(0);
    h.sees('Prévoyez du papier et un crayon.');
    h.sees('ENVOI nouvelle partie');
    h.sees('GUIDE mode sans chrono : non');
    h.sees('Personnages et sociétés fictifs.');
    h.misses('reprendre la partie');
  });

  it('GUIDE bascule le mode sans chrono, et la partie le garde', () => {
    const h = partie();
    h.g.boot();
    h.run(0);
    h.press('guide');
    h.sees('mode sans chrono : oui');
    h.press('envoi');
    expect(h.g.s.timed).toBe(false);
  });

  it("le choix du personnage accorde l'ordre de mission", () => {
    const h = partie();
    h.g.boot();
    h.run(0);
    h.press('envoi');
    h.sees('Alix est une femme');
    h.choose(2);
    expect(h.g.s.gender).toBe('f');
    h.sees('technicienne de ligne');
    h.sees('Désignation : 30/08/2097, à la demande du Contrôle, en remplacement de T. Ndiaye.');
    h.sees('Départ du Martinet : 11/09/2097 à 06:00.');
  });

  it("l'horloge reste à 14:00:00 pendant l'ordre de mission, puis démarre au réveil", () => {
    const h = partie();
    h.g.boot();
    h.run(0);
    h.press('envoi');
    h.choose(1);
    h.run(30);
    expect(h.g.s.clockText()).toBe('14:00:00');
    h.press('suite');
    h.sees("Code d'accès : le jour et le mois du départ du Martinet (JJMM).");
    h.press('suite');
    h.sees('Il attend votre identifiant.');
    h.run(5);
    expect(h.g.s.clockText()).toBe('14:00:05');
  });

  it('le message C01 arrive à 14:00:20, avec sa notification', () => {
    const h = partie();
    prologue(h);
    h.run(19.75);
    expect(h.g.s.received('C01')).toBe(false);
    h.run(0.5);
    expect(h.g.s.mail).toEqual([{ id: 'C01', at: T(14, 0, 20), read: false }]);
    expect(h.row(24)).toContain('Nouveau message du Controle.');
  });
});

describe('E1 : la connexion au serveur de bord', () => {
  it('un mauvais code est refusé, avec son message', () => {
    const h = partie();
    prologue(h);
    h.press('envoi');
    expect(h.row(0)).toContain('MARTINET VMR-07');
    h.type('ALIX');
    h.press('envoi');
    h.type('0000');
    h.press('envoi');
    expect(h.audio.bells).toBe(1);
    expect(h.g.s.flags.e1).toBeUndefined();
    h.sees(REFUS.E1);
  });

  it("SUITE relit l'ordre de mission, RETOUR revient à la connexion", () => {
    const h = partie();
    prologue(h);
    h.press('envoi');
    h.press('suite');
    h.sees('ORDRE DE MISSION');
    h.press('retour');
    h.sees('IDENTIFIANT');
  });

  it("VERNIER et 1109 ouvrent le menu de bord, et le Contrôle répond 15 s plus tard", () => {
    const h = partie();
    connecte(h);
    expect(h.g.s.flags.e1).toBe(true);
    expect(h.g.scene.id).toBe('bord');
    h.sees('Messagerie du Contrôle');
    h.sees('hors service');
    const t = h.g.s.times.e1;
    h.until(t + 14.5);
    expect(h.g.s.received('C02')).toBe(false);
    h.until(t + 15);
    expect(h.g.s.mail.find(m => m.id === 'C02').at).toBe(t + 15);
  });
});

describe("E2 : le répartiteur de l'antenne", () => {
  it('le testeur affiche la luminance de chaque câble', () => {
    const h = partie();
    connecte(h);
    h.choose(4);
    h.choose(1);
    h.sees('Cause : le répartiteur commuté a été réaffecté.');
    h.choose(2);
    h.sees('Câble 1 : 50 %');
    h.sees('Câble 2 : 90 %');
    h.sees('Câble 3 : 70 %');
    h.sees('Câble 4 : 40 %');
  });

  it('un mauvais câblage est refusé', () => {
    const h = partie();
    connecte(h);
    h.choose(4);
    h.choose(1);
    h.choose(1);
    h.type('1234');
    h.press('envoi');
    h.sees(REFUS.E2);
    expect(h.g.s.flags.e2).toBeUndefined();
  });

  it("1-3-4-2 rétablit l'antenne et montre le journal de la coupure", () => {
    const h = partie();
    antenne(h);
    expect(h.g.s.flags.e2).toBe(true);
    h.sees('Antenne longue portée : EN SERVICE.');
    h.sees('17/09/2097 09:12:04');
    h.sees('RECONFIGURATION A DISTANCE - ORIGINE : L7/SERVICE');
    h.sees(`17/09/2097 ${hms(h.g.s.times.e2)}`);
    h.sees('AFFECTATIONS RETABLIES - VERNIER');
  });
});

describe('E3 et E4 : le récepteur et le message de la Terre', () => {
  it("avant l'antenne, le récepteur n'a rien à recevoir", () => {
    const h = partie();
    connecte(h);
    h.choose(2);
    h.sees('Antenne hors service. Rien à recevoir.');
  });

  it('333 synchronise le récepteur et donne l’aller-retour', () => {
    const h = partie();
    antenne(h);
    h.press('sommaire');
    h.choose(2);
    h.sees('NON SYNCHRONISE');
    h.type('300');
    h.press('envoi');
    h.sees(REFUS.E3);
    h.type('333');
    h.press('envoi');
    h.sees('Aller-retour avec la Terre : 666 s (11 min 06 s).');
    h.sees('En attente du prochain message de service.');
  });

  it("le premier message de service arrive à la dizaine de minutes pleine suivante", () => {
    const h = partie();
    synchro(h);
    h.until(T(14, 9, 59));
    expect(h.g.s.data.f1).toBeUndefined();
    h.until(T(14, 10, 0));
    expect(h.g.s.data.f1).toBe(T(14, 10, 0));
    expect(h.row(24)).toContain('Message de la Terre recu.');
  });

  it('tant que LUCIOLE n’est pas renvoyé, chaque émission remplace l’heure de réception', () => {
    const h = partie();
    synchro(h);
    h.until(T(14, 30, 0));
    expect(h.g.s.data.f1).toBe(T(14, 30, 0));
  });

  it('la bande affichée se décode en ICI NADIA BON VOL ALIX CODE LUCIOLE', () => {
    const h = partie();
    message(h);
    h.sees('Message reçu à 14:10:00. 35 caractères.');
    const lettres = Object.fromEntries(Object.entries(BAUDOT).map(([l, motif]) => [motif, l]));
    expect(readTape(h.m, 35).map(m => lettres[m]).join('')).toBe(TERRE.F1.texte);
    h.press('suite');
    h.sees('Trous 1 à 5, de gauche à droite.');
  });

  it('un mauvais mot de contrôle est refusé', () => {
    const h = partie();
    message(h);
    h.type('NADIA');
    h.press('envoi');
    h.sees(REFUS.E4);
    expect(h.g.s.flags.e4).toBeUndefined();
  });

  it('LUCIOLE confirme la liaison : message au dossier, plus de message de service', () => {
    const h = partie();
    liaison(h);
    expect(h.g.s.flags.e4).toBe(true);
    h.sees('Liaison avec la Terre confirmée. Procédure P-12 respectée.');
    expect(h.g.s.docs).toContain('F1');
    expect(h.g.s.agenda.some(e => e.id === 'f1')).toBe(false);
  });

  it("C04 arrive 15 s après LUCIOLE, la zone de jonction 2 min après, et C05 15 s plus tard", () => {
    const h = partie();
    liaison(h);
    const t = h.g.s.times.e4;
    h.until(t + 15);
    expect(h.g.s.received('C04')).toBe(true);
    h.until(t + 119);
    expect(h.g.s.flags.zone).toBeUndefined();
    h.until(t + 120);
    expect(h.g.s.flags.zone).toBe(true);
    h.until(t + 135);
    expect(h.g.s.mail.find(m => m.id === 'C05').at).toBe(t + 135);
  });
});

describe('E5 : la jonction manuelle', () => {
  it("pendant l'approche, la trajectoire annonce la zone de jonction", () => {
    const h = partie();
    liaison(h);
    h.press('sommaire');
    h.choose(3);
    h.sees('Approche finale : autorisée. Arrivée dans la zone de jonction dans 2 min.');
    h.misses('Jonction manuelle');
  });

  it('dans la zone, une mauvaise manœuvre est refusée et rejouée', () => {
    const h = partie();
    liaison(h);
    h.until(h.g.s.times.e4 + 120);
    h.press('sommaire');
    h.choose(3);
    h.choose(1);
    h.type('DHHHHHHH');
    h.press('envoi');
    h.sees(refusE5('DHHHHHHH'));
    expect(h.g.s.flags.e5).toBeUndefined();
  });

  it('HHDDDHHD réussit la jonction, et C06 arrive 15 s plus tard', () => {
    const h = partie();
    liaison(h);
    h.until(h.g.s.times.e4 + 120);
    h.press('sommaire');
    h.choose(3);
    h.choose(1);
    h.type('HHDDDHHD');
    h.press('envoi');
    h.run(0);
    expect(h.g.s.flags.e5).toBe(true);
    h.sees("Contact. Verrouillage. Le Martinet et L7 ne font plus qu'un.");
    const t = h.g.s.times.e5;
    h.until(t + 15);
    expect(h.g.s.received('C06')).toBe(true);
  });
});

describe("le rapport d'essai", () => {
  /** La ligne du rapport qui contient ce texte. */
  const ligne = (texte, debut) => texte.split('\n').find(l => l.includes(debut)) || '';

  it('écrit les durées en minutes et secondes, ou en heures et minutes', async () => {
    const { duree } = await import('../src/scenarios/latence/essai.js');
    expect([duree(45), duree(90), duree(600), duree(3725)]).toEqual(['45 s', '1 min 30 s', '10 min 00 s', '1 h 02 min']);
  });

  it('en cours de partie : chaque étape, le temps réel passé avant elle, ses refus et ses indices', async () => {
    const { rapport } = await import('../src/scenarios/latence/essai.js');
    const h = partie();
    connecte(h);
    h.run(60);
    h.g.takeHint('O2');
    h.choose(4);
    h.choose(1);
    h.choose(1);
    h.type('9999');
    h.press('envoi');
    h.run(30);
    h.type('1342');
    h.press('envoi');
    expect(h.g.s.flags.e2).toBe(true);
    const texte = rapport(h.g);
    const e2 = ligne(texte, 'Antenne rebranchée (E2)');
    expect(e2).toContain('14:04:30');          // 1 min 30 s jouée, plus 3 minutes d'indice
    expect(e2).toContain('1 min 30 s');
    expect(e2).toContain('refus : 1');
    expect(e2).toContain('indices : O2');
    expect(ligne(texte, 'Acte I ')).toContain('en cours');
    expect(texte).toContain('Indices : 1 (3 min)');
    expect(texte).toContain('Refus : 1');
  });

  it('en fin de partie : la fin atteinte et la durée des trois actes', async () => {
    const { rapport } = await import('../src/scenarios/latence/essai.js');
    const h = partie();
    allume(h);
    partAvecIrene(h);
    expect(h.g.s.ending).toBe('deux-etoiles');
    const texte = rapport(h.g);
    expect(texte).toContain('Fin : DEUX ETOILES');
    for (const acte of ['Acte I ', 'Acte II ', 'Acte III ']) expect(ligne(texte, acte), acte).not.toContain('en cours');
    for (const etape of ['Jonction réussie (E5)', 'Révélation', 'L7 remis en service', 'Retour à deux calculé (E9)', 'Départ']) {
      expect(ligne(texte, etape), etape).not.toBe('');
    }
  });
});

describe('les dessins des accueils', () => {
  /** Nombre de cases de la zone (rangées r0 à r1, colonnes c0 à c1) qui allument au moins un pavé. */
  const paves = (h, r0, r1, c0, c1) => {
    let n = 0;
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        const i = r * 40 + c;
        if (h.m.screen.t[i] === T_MOSAIC && (h.m.screen.c[i] & 0x5f)) n++;
      }
    }
    return n;
  };

  it('le menu de bord porte le martinet en haut à droite, sans toucher au titre ni au menu', () => {
    const h = partie();
    connecte(h);
    expect(h.g.scene.id).toBe('bord');
    expect(paves(h, 1, 7, 23, 38)).toBeGreaterThan(25);
    expect(h.row(2)).toContain('MENU DE BORD');
    expect(h.row(8)).toContain('Messagerie du Controle');
    expect(h.row(22)).toContain('Votre choix');
  });

  it('le menu du relais porte le relais en haut à droite, au-dessus du menu et de son pied de page', () => {
    const h = partie();
    relais(h);
    expect(h.g.scene.id).toBe('relais');
    expect(paves(h, 1, 6, 27, 38)).toBeGreaterThan(25);
    expect(h.row(2)).toContain('RELAIS L7');
    expect(h.row(7)).toContain('Etat du relais');
    expect(h.row(19)).toContain('Manuel du relais');
    expect(h.row(21)).toContain('Votre choix');
  });
});

describe('le serveur du relais', () => {
  it('avant la jonction, CONNEXION bipe : le relais est hors de portée', () => {
    const h = partie();
    liaison(h);
    const bips = h.audio.bells;
    h.press('connexion');
    expect(h.audio.bells).toBe(bips + 1);
    expect(h.g.mode).toBe('local');
  });

  it('après la jonction, CONNEXION appelle le relais : indicateur C et plaque du relais', () => {
    const h = partie();
    jonction(h);
    appelle(h);
    expect(h.g.mode).toBe('online');
    expect(h.row(0)).toContain('RELAIS L7 - VERNIER');
    expect(h.row(0)[38]).toBe('C');
    h.sees('Mis en service en 2081 - 12 modules');
  });

  it('un mauvais code de maintenance est refusé', () => {
    const h = partie();
    jonction(h);
    appelle(h);
    h.type('7208112');
    h.press('envoi');
    h.sees(REFUS.E6);
    expect(h.g.s.flags.e6).toBeUndefined();
  });

  it('7180212 ouvre le serveur du relais, et C07 arrive 15 s plus tard', () => {
    const h = partie();
    relais(h);
    expect(h.g.s.flags.e6).toBe(true);
    h.sees('État du relais');
    h.until(h.g.s.times.e6 + 15);
    expect(h.g.s.received('C07')).toBe(true);
  });

  it('FIN revient au Martinet ; le relais reconnaît ensuite le V40 sans redemander le code', () => {
    const h = partie();
    relais(h);
    h.press('connexion');
    expect(h.g.mode).toBe('local');
    expect(h.row(0)).toContain('MARTINET VMR-07');
    expect(h.g.scene.id).toBe('bord');
    appelle(h);
    expect(h.g.scene.id).toBe('relais');
  });

  it("l'état du relais : arrêt manuel, dernière émission de secours, clé 2 retirée", () => {
    const h = partie();
    relais(h);
    h.choose(1);
    h.sees('ARRET MANUEL');
    h.sees('dernière émission le 30/08/2097 à 10:20');
    h.press('suite');
    h.sees('Clé 2 : RETIREE le 29/08/2097 à 03:17');
    h.sees('Plan de fréquences : EFFACE');
  });
});

describe('E7 : le plan de fréquences', () => {
  it('un plan qui viole la règle 3 est refusé en la citant', () => {
    const h = partie();
    relais(h);
    h.choose(2);
    h.sees('canal 4 brouillé côté Mars');
    h.type('24531');
    h.press('envoi');
    h.sees("Plan refusé : la règle 3 n'est pas respectée.");
  });

  it('un canal hors de 1 à 5 est refusé', () => {
    const h = partie();
    relais(h);
    h.choose(2);
    h.type('42536');
    h.press('envoi');
    h.sees(REFUS.E7canaux);
  });

  it('TM 4, TD 2, MM 5, MD 3, RP 1 est accepté, et C08 arrive 15 s plus tard', () => {
    const h = partie();
    relais(h);
    h.choose(2);
    h.type('42531');
    h.press('envoi');
    expect(h.g.s.flags.e7).toBe(true);
    h.sees('Plan accepté. Aucune interférence.');
    h.until(h.g.s.times.e7 + 15);
    expect(h.g.s.received('C08')).toBe(true);
  });
});

describe('les systèmes de vie et les archives du relais', () => {
  it('les systèmes de vie tournent pour une personne', () => {
    const h = partie();
    relais(h);
    h.choose(3);
    h.sees("Consommation d'oxygène : 0,84 kg par jour");
    h.sees('Serre : ACTIVE');
    h.sees('Bouteilles d\'oxygène de secours : 4');
  });

  it('les capsules perdues : dix, de C-114 à C-188, la dernière le 26/08/2097', () => {
    const h = partie();
    relais(h);
    h.choose(4);
    h.choose(2);
    h.sees('C-114');
    h.press('suite');
    h.sees('C-188');
    h.sees('26/08/2097');
    h.sees('Aucune perte dans ce secteur de 2081 à 2095.');
    expect(CAPSULES).toHaveLength(10);
  });

  it("le rapport d'incident de 2095 débloque la question Q4", () => {
    const h = partie();
    relais(h);
    h.choose(4);
    h.choose(3);
    h.sees('masse déclarée 61 kg, présumée à bord');
    h.press('connexion');
    h.choose(1);
    h.choose(0);
    h.sees(QUESTIONS[3].texte);
  });

  it('le trafic compte les messages du Contrôle reçus, venus de la console du relais', () => {
    const h = partie();
    relais(h);
    h.choose(4);
    h.choose(4);
    const n = h.g.s.mail.filter(m => !m.out).length;
    h.sees(`Canal de service, courte portée : ${n} messages émis vers VMR-07 depuis 09:12.`);
    h.sees('Origine de ces messages : locale (console du relais).');
    h.sees('Messages reçus de la Terre depuis le 29/08/2097 : 0');
  });
});

describe('E8 : la porte des quartiers de garde', () => {
  it('0206 est refusé : ce code a été remplacé depuis 2089', () => {
    const h = partie();
    relais(h);
    h.choose(6);
    h.sees('Porte scellée le 02/06/2089.');
    h.type('0206');
    h.press('envoi');
    h.sees('Code refusé. Ce code a été remplacé depuis 2089.');
  });

  it('2608 ouvre la porte', () => {
    const h = partie();
    relais(h);
    h.choose(6);
    h.type('2608');
    h.press('envoi');
    expect(h.g.s.flags.e8).toBe(true);
    h.sees("La porte glisse. Une bouffée d'air chaud et humide, qui sent la terre mouillée.");
  });
});

describe('F2 et le démasquage', () => {
  it('F2 arrive 12 min 06 s après LUCIOLE, avec sa notification, et C09 une minute plus tard', () => {
    const h = partie();
    liaison(h);
    const t = h.g.s.times.e4;
    h.until(t + 725);
    expect(h.g.s.data.f2).toBeUndefined();
    h.until(t + 726);
    expect(h.g.s.data.f2).toBe(t + 726);
    expect(h.row(24)).toContain('Message de la Terre recu.');
    h.until(t + 786);
    expect(h.g.s.mail.find(m => m.id === 'C09').at).toBe(t + 786);
  });

  it('la bande de F2 tient sur deux pages et se décode en son texte', () => {
    const h = partie();
    liaison(h);
    h.until(h.g.s.times.e4 + 726);
    h.press('sommaire');
    h.choose(2);
    h.choose(1);
    h.sees('55 caractères');
    const lettres = Object.fromEntries(Object.entries(BAUDOT).map(([l, motif]) => [motif, l]));
    const page1 = readTape(h.m, 36);
    h.press('suite');
    const page2 = readTape(h.m, 19);
    expect([...page1, ...page2].map(m => lettres[m]).join('')).toBe(TERRE.F2.texte);
  });

  it('SILENCE met F2 au dossier ; après C09, la question Q5 apparaît', () => {
    const h = partie();
    liaison(h);
    h.until(h.g.s.times.e4 + 726);
    h.press('sommaire');
    h.choose(2);
    h.choose(1);
    h.type('SILENCE');
    h.press('envoi');
    expect(h.g.s.flags.f2).toBe(true);
    expect(h.g.s.docs).toContain('F2');
    h.until(h.g.s.times.e4 + 786);
    h.press('sommaire');
    h.choose(1);
    h.choose(0);
    h.sees(QUESTIONS[4].texte);
  });

  it('Q6 démasque Irène : sa réponse tutoie Alix, Oreille fine, plus de questions', () => {
    vi.stubGlobal('localStorage', memoryStorage());
    const h = partie();
    demasquable(h);
    h.press('connexion');
    h.choose(1);
    h.choose(0);
    h.sees(QUESTIONS[5].texte);
    h.choose(h.g.questions(QUESTIONS).findIndex(q => q.id === 'Q6') + 1);
    const envoi = h.g.s.mail.find(m => m.id === 'Q6').at;
    h.until(envoi + 29);
    expect(h.g.s.received('R6')).toBe(false);
    h.until(envoi + 30);
    expect(h.g.s.flags.demasquee).toBe(true);
    expect(h.g.achievements.has('oreille')).toBe(true);
    expect(REPONSES.R6).toContain('tu le trouveras');
    h.press('sommaire');
    h.choose(1);
    h.choose(0);
    h.sees('Irène vous attend dans les quartiers de garde.');
    vi.unstubAllGlobals();
  });

  it('Irène démasquée, le plan accepté amène C08-I, signé PLT, et non C08', () => {
    const h = partie();
    relais(h);
    h.g.unlock('demasquee');
    h.choose(2);
    h.type('42531');
    h.press('envoi');
    h.until(h.g.s.times.e7 + 15);
    expect(h.g.s.received('C08I')).toBe(true);
    expect(h.g.s.received('C08')).toBe(false);
  });

  it("C09 n'arrive pas si Irène est déjà démasquée", () => {
    const h = partie();
    liaison(h);
    h.g.unlock('demasquee');
    h.until(h.g.s.times.e4 + 800);
    expect(h.g.s.data.f2).toBe(h.g.s.times.e4 + 726);
    expect(h.g.s.received('C09')).toBe(false);
  });

  it('au démasquage, les réponses du faux Contrôle encore en route sont annulées', () => {
    const h = partie();
    connecte(h);
    h.g.ask(QUESTIONS[0]);
    h.g.receive('R6');
    h.until(h.g.now + 60);
    expect(h.g.s.received('R1')).toBe(false);
  });
});

describe('la révélation', () => {
  it("2608 ouvre la porte, et C10 arrive aussitôt : Irène tutoie Alix", () => {
    const h = partie();
    relais(h);
    h.choose(6);
    h.type('2608');
    h.press('envoi');
    h.sees("La porte glisse.");
    h.sees("Oui, c'est moi qui t'écris depuis ce matin.");
    expect(h.g.s.received('C10')).toBe(true);
    expect(h.g.s.flags.demasquee).toBe(true);
  });

  it("en entrant : la session ouverte depuis 745 jours, et la rangée 00 devient « la Muette »", () => {
    const h = partie();
    relais(h);
    h.choose(6);
    h.type('2608');
    h.press('envoi', 'envoi');
    h.sees('745 traits');
    h.sees('une session est ouverte depuis 745 jours');
    h.sees('I. VASSEUR');
    expect(h.row(0)).toContain('RELAIS L7 - LA MUETTE');
    h.press('envoi');
    h.sees('Quelqu\'un se lève derrière la cuve de spiruline.');
  });

  it('le dialogue se tient de vive voix, et chaque réponse tient sa page', () => {
    for (const genre of ['m', 'f']) {
      const h = partie();
      revele(h);
      h.g.s.gender = genre;
      h.g.s.data.dialogue = [true, true, true];
      const overflow = watchOverflow(h.m);
      h.g.go('parler');
      h.run(0);
      h.sees('Irène est en face de vous.');
      expect(overflow).toEqual([]);
      for (let i = 0; i < 4; i++) {
        h.g.vars.question = i;
        h.g.go('reponse');
        h.run(0);
        h.sees('Vous : «');
        h.sees('Irène : «');
        expect(overflow, `réponse ${i + 1}`).toEqual([]);
        expect(h.row(22).trim()).toBe('');
      }
    }
  });

  it("après la révélation, plus rien d'Irène dans la messagerie", () => {
    const h = partie();
    relais(h);
    h.g.ask(QUESTIONS[0]);
    h.choose(2);
    h.type('42531');
    h.press('envoi');
    h.press('sommaire');
    h.choose(6);
    h.type('2608');
    h.press('envoi');
    h.until(h.g.now + 60);
    expect(h.g.s.received('R1')).toBe(false);
    expect(h.g.s.received('C08')).toBe(false);
  });
});

describe('les quartiers de garde', () => {
  it("la main courante : douze entrées, aux heures écrites de la main d'Irène", () => {
    const h = partie();
    revele(h);
    h.choose(2);
    expect(h.g.pages()).toBe(12);
    h.sees('03/09/2095, 16h40');
    for (let i = 0; i < 8; i++) h.press('suite');
    h.sees('29/08/2097, 3h17');
    h.press('suite', 'suite');
    h.sees('Pesée ce matin : 54 kg.');
    h.press('suite');
    h.sees('17/09/2097, 9h12');
  });

  it('la note de Lenglet : échos parasites, ne pas donner suite', () => {
    const h = partie();
    revele(h);
    h.choose(3);
    h.sees('NOTE INTERNE');
    h.sees('Ces signaux sont classés comme échos parasites. Ne pas donner suite.');
    h.sees('G. Lenglet, directeur des opérations');
  });

  it("trois questions dans l'ordre qu'on veut, puis « Et maintenant ? », qui donne la clé 2", () => {
    const h = partie();
    revele(h);
    h.choose(1);
    h.misses('Et maintenant ?');
    for (const n of [2, 3]) {
      h.choose(n);
      h.press('retour');
    }
    h.misses('Et maintenant ?');
    h.choose(1);
    h.sees('{mon meilleur élève|ma meilleure élève}'.replace(/\{.*\|(.*)\}/, '$1'));
    h.press('retour');
    h.sees('Et maintenant ?');
    h.choose(4);
    expect(h.g.s.flags.cle2).toBe(true);
    expect(h.row(24)).toContain('Vous avez la cle 2.');
  });
});

describe('la remise en service', () => {
  it('sans la clé 2, la mise en service attend', () => {
    const h = partie();
    relais(h);
    h.choose(5);
    h.sees('Clé 2 : ABSENTE');
    h.sees('La mise en service exige les deux clés.');
  });

  it('avec la clé 2 et le plan validé, ENVOI tourne les deux clés : Mars est reconnectée', () => {
    const h = partie();
    allume(h);
    expect(h.g.s.flags.service).toBe(true);
    h.sees('Trafic Terre-Mars... rétabli.');
    h.sees('3 112 messages en attente s\'écoulent.');
    h.sees(`Mars est reconnectée à ${hms(h.g.s.times.service)}.`);
  });

  it("F3 arrive douze minutes plus tard, en clair : « Rentrez seule. »", () => {
    const h = partie();
    allume(h);
    const t = h.g.s.times.service;
    h.until(t + 719);
    expect(h.g.s.data.f3).toBeUndefined();
    h.until(t + 720);
    expect(h.g.s.data.f3).toBe(t + 720);
    expect(h.row(24)).toContain('Message de la Terre recu.');
    h.press('connexion');
    h.choose(6);
    h.choose(h.g.s.docs.indexOf('F3') + 1);
    h.sees('DIRECTION DES OPERATIONS');
    h.sees('Ne l\'embarquez pas. Rentrez seule.');
  });
});

describe('le départ et les fins', () => {
  beforeEach(() => { vi.stubGlobal('localStorage', memoryStorage()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("PARTIR n'apparaît au menu de bord qu'après la jonction", () => {
    const h = partie();
    liaison(h);
    h.press('sommaire');
    h.misses('Partir');
    h.until(h.g.s.times.e4 + 120);
    h.choose(3);
    h.choose(1);
    h.type('HHDDDHHD');
    h.press('envoi');
    h.run(0);
    h.press('sommaire');
    h.sees('Partir');
  });

  it("avant la révélation, PARTIR ne nomme pas Irène : ce serait trahir le retournement", () => {
    const h = partie();
    relais(h);
    partir(h);
    h.sees('Partir vers la Terre');
    h.misses('Irène');
  });

  it('après la révélation, PARTIR propose de partir sans Irène ou avec elle', () => {
    const h = partie();
    revele(h);
    partir(h);
    h.sees('Partir sans Irène Vasseur');
    h.sees('Partir avec Irène Vasseur');
  });

  it("RETOUR sur la confirmation : on attend, rien n'est décidé", () => {
    const h = partie();
    relais(h);
    partir(h);
    h.choose(1);
    h.sees('Le départ est définitif. ENVOI pour confirmer, RETOUR pour attendre.');
    h.press('retour');
    expect(h.g.s.ending).toBe(null);
  });

  it('partir sans Irène avant la révélation : Silence radio, et quelqu\'un regarde partir le Martinet', () => {
    const h = partie();
    relais(h);
    partir(h);
    h.choose(1);
    h.press('envoi');
    expect(h.g.s.ending).toBe('silence-radio');
    h.sees('Dans les quartiers de garde, quelqu\'un le regarde partir.');
    h.sees('« Je comprends. PLT »');
    expect(h.g.savedState()).toBe(null);
    const t = h.g.s.time();
    h.run(5);
    expect(h.g.s.time()).toBe(t);
  });

  it('partir sans Irène après la révélation, L7 muet : Silence radio, Irène retourne à ses lentilles', () => {
    const h = partie();
    revele(h);
    partir(h);
    h.choose(1);
    h.press('envoi');
    expect(h.g.s.ending).toBe('silence-radio');
    h.sees('Vous partez seule.');
    h.sees('Irène Vasseur retourne à ses lentilles.');
  });

  it('partir sans Irène, L7 remis en service : Toujours en ligne', () => {
    const h = partie();
    allume(h);
    partir(h);
    h.choose(1);
    h.press('envoi');
    expect(h.g.s.ending).toBe('toujours-en-ligne');
    h.sees('Elle est signée G.L.');
  });

  it("avec Irène, le pilote automatique la croit morte, et un calcul faux est refusé", () => {
    const h = partie();
    revele(h);
    partir(h);
    h.choose(2);
    h.sees('I. VASSEUR, TL-2203 : statut DECEDEE.');
    h.type('2635');
    h.press('envoi');
    h.sees(REFUS.E9.poussee);
    h.type('3640');
    h.press('envoi');
    h.sees(REFUS.E9.bouteille);
    expect(h.g.s.flags.e9).toBeUndefined();
  });

  it('avec Irène, calcul juste, L7 muet : La Muette', () => {
    const h = partie();
    revele(h);
    partAvecIrene(h);
    expect(h.g.s.ending).toBe('la-muette');
    h.sees('« Tu aurais pu rallumer L7. »');
  });

  it('avec Irène, calcul juste, L7 remis en service : Deux étoiles, et son succès', () => {
    const h = partie();
    allume(h);
    partAvecIrene(h);
    expect(h.g.s.ending).toBe('deux-etoiles');
    while (h.g.page < h.g.pages() - 2) h.press('suite');
    h.sees('Sur l\'écusson de la mission, il y a maintenant deux étoiles.');
    expect(h.g.achievements.has('deux-etoiles')).toBe(true);
    h.press('suite');
    h.sees('Succès : Deux étoiles');
  });

  it('une fin sans indice, en mode chronométré : Sans filet', () => {
    const h = partie();
    relais(h);
    partir(h);
    h.choose(1);
    h.press('envoi');
    expect(h.g.achievements.has('sans-filet')).toBe(true);
  });

  it("l'écran FIN donne l'heure de départ et les indices ; recommencer demande deux ENVOI", () => {
    const h = partie();
    relais(h);
    h.g.takeHint('O7');
    partir(h);
    h.choose(1);
    h.press('envoi');
    expect(h.g.page).toBe(0);
    // ENVOI tourne les pages du récit, jusqu'à la page FIN
    while (h.g.page < h.g.pages() - 1) h.press('envoi');
    expect(h.row(16)).toContain('FFIINN');
    h.sees('Retour vers la Terre.');
    h.sees(`Départ à ${hms(h.g.s.times.depart)}`);
    h.sees('Indices utilisés : 1');
    expect(h.g.achievements.has('sans-filet')).toBe(false);
    h.press('envoi');
    expect(h.g.scene.id).toBe('fin');
    expect(h.row(24)).toContain('ENVOI encore');
    h.press('envoi');
    expect(h.g.scene.id).toBe('personnage');
    expect(h.g.s.ending).toBe(null);
  });

  it("de l'écran de fin, aucune touche ne ramène dans la partie terminée", () => {
    const h = partie();
    relais(h);
    partir(h);
    h.choose(1);
    h.press('envoi');
    for (const k of ['retour', 'sommaire', 'guide', 'connexion', 'retour', 'suite', 'retour', 'annulation']) {
      h.press(k);
      expect(h.g.scene.id, k).toBe('fin');
      expect(h.g.s.ending).toBe('silence-radio');
    }
    // Une autre touche entre les deux ENVOI annule la demande
    while (h.g.page < h.g.pages() - 1) h.press('suite');
    h.press('envoi', 'retour', 'suite', 'envoi');
    expect(h.g.scene.id).toBe('fin');
  });

  it('Hors délai : la page FIN ne montre pas de retour vers la Terre', () => {
    const h = partie();
    connecte(h);
    h.until(T(15, 45, 0));
    while (h.g.page < h.g.pages() - 1) h.press('suite');
    expect(h.row(16)).toContain('FFIINN');
    h.misses('Retour vers la Terre.');
    h.sees('Fenêtre fermée à 15:45:00');
  });
});

describe("l'horloge de la fin", () => {
  it('à 15:35:00, l\'alarme : une notification et trois bips graves, puis un bip par minute', () => {
    const h = partie();
    connecte(h);
    h.until(T(15, 34, 59));
    expect(h.audio.played).not.toContain('alarme');
    h.until(T(15, 35, 0));
    expect(h.row(24)).toContain('Plus que 10 minutes avant la fermeture.');
    expect(h.audio.played).toContain('alarme');
    h.until(T(15, 36, 0));
    expect(h.audio.played.filter(n => n === 'bip')).toHaveLength(1);
  });

  it("à 15:45:00 sans départ : Hors délai, et la dernière page révèle Irène", () => {
    const h = partie();
    connecte(h);
    h.until(T(15, 45, 0));
    expect(h.g.s.ending).toBe('hors-delai');
    h.sees('15:45. La fenêtre se ferme.');
    h.sees('Je suis dans les quartiers de garde. PLT');
  });

  it('Hors délai après la révélation : Alix et Irène attendent ensemble', () => {
    const h = partie();
    revele(h);
    h.until(T(15, 45, 0));
    expect(h.g.s.ending).toBe('hors-delai');
    h.sees('Irène sort deux tasses.');
  });

  it("sans chrono, ni alarme ni fin à 15:45", () => {
    const h = partie();
    h.g.boot();
    h.run(0);
    h.press('guide', 'envoi');
    h.choose(2);
    h.press('suite', 'suite', 'envoi');
    h.until(T(15, 50, 0));
    expect(h.g.s.ending).toBe(null);
    expect(h.row(24)).not.toContain('Plus que 10 minutes');
  });
});

describe('les sons', () => {
  it("à bord, la ventilation ; dans les quartiers, la cuve ; sur l'écran titre, au prologue et aux fins, le silence", () => {
    const h = partie();
    h.g.boot();
    h.run(0.25);
    expect(h.audio.current).toBe(null);
    h.press('envoi');
    h.choose(2);
    h.run(0.25);
    expect(h.audio.current).toBe(null);
    h.press('suite', 'suite');
    h.run(0.25);
    expect(h.audio.current).toBe('ventilation');
    const k = partie();
    revele(k);
    k.run(0.25);
    expect(k.audio.current).toBe('cuve');
    partir(k);
    k.choose(1);
    k.press('envoi');
    k.run(0.25);
    expect(k.audio.current).toBe(null);
  });

  it('le réveil : trois notes polies', () => {
    const h = partie();
    prologue(h);
    expect(h.audio.played).toContain('reveil');
  });

  it('un message du Contrôle sonne à son arrivée', () => {
    const h = partie();
    prologue(h);
    h.run(21);
    expect(h.audio.played).toContain('message');
  });

  it('la bande de la Terre grésille pendant son affichage, avec un tac par ligne', () => {
    const h = partie();
    synchro(h);
    h.until(T(14, 10, 0));
    h.press('repetition');
    h.m.line.baud = 1200;
    h.choose(1);
    h.run(12);
    expect(h.audio.played).toContain('bande');
    expect(h.audio.played.filter(n => n === 'tac')).toHaveLength(35);
  });

  it('la jonction : un souffle par impulsion du rejeu, puis le choc du verrouillage', () => {
    const h = partie();
    jonction(h);
    const sons = h.audio.played.filter(n => n === 'impulsion' || n === 'jonction');
    expect(sons).toEqual([...Array(8).fill('impulsion'), 'jonction']);
  });

  it('la remise en service : la note qui monte, puis la pluie des messages', () => {
    const h = partie();
    allume(h);
    const i = h.audio.played.indexOf('remise');
    expect(i).toBeGreaterThan(-1);
    expect(h.audio.played.indexOf('messages')).toBeGreaterThan(i);
  });

  it('le départ gronde, et seulement lui', () => {
    const h = partie();
    relais(h);
    partir(h);
    h.choose(1);
    h.press('envoi');
    expect(h.audio.played).toContain('depart');
    const k = partie();
    connecte(k);
    k.until(T(15, 45, 0));
    expect(k.g.s.ending).toBe('hors-delai');
    expect(k.audio.played).not.toContain('depart');
  });
});

describe('la reprise', () => {
  beforeEach(() => { vi.stubGlobal('localStorage', memoryStorage()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("SUITE reprend à la connexion si E1 n'est pas réussie, horloge comprise", () => {
    const first = partie();
    prologue(first);
    first.run(30);
    first.g.save();
    const h = partie();
    h.g.boot();
    h.run(0);
    h.sees('SUITE reprendre la partie (14:00)');
    h.press('suite');
    expect(h.g.scene.id).toBe('connexion');
    expect(h.g.s.clockText()).toBe('14:00:30');
  });

  it('SUITE reprend au menu de bord une fois E1 réussie', () => {
    const first = partie();
    connecte(first);
    first.g.save();
    const h = partie();
    h.g.boot();
    h.run(0);
    h.press('suite');
    expect(h.g.scene.id).toBe('bord');
  });

  it("une nouvelle partie par-dessus une partie en cours demande ENVOI une seconde fois", () => {
    const first = partie();
    connecte(first);
    first.g.save();
    const h = partie();
    h.g.boot();
    h.run(0);
    h.press('envoi');
    expect(h.g.scene.id).toBe('titre');
    expect(h.row(24)).toContain("Partie en cours : ENVOI pour l'effacer.");
    h.press('envoi');
    expect(h.g.scene.id).toBe('personnage');
    expect(h.g.s.flags.e1).toBeUndefined();
  });
});

describe('le guide', () => {
  it("donne les indices de l'objectif en cours, chacun contre 3 minutes", () => {
    const h = partie();
    prologue(h);
    h.press('envoi');
    h.press('guide');
    h.sees('Objectif : Se connecter au serveur de bord.');
    h.misses(OBJECTIFS[0].indices[0]);
    const avant = h.g.s.time();
    h.press('envoi');
    h.sees(OBJECTIFS[0].indices[0]);
    expect(h.g.s.time() - avant).toBe(180);
  });

  it('après les trois indices, ENVOI ne coûte plus rien', () => {
    const h = partie();
    prologue(h);
    h.press('envoi', 'guide', 'envoi', 'envoi', 'envoi');
    h.sees('Identifiant VERNIER, code 1109.');
    const avant = h.g.s.time();
    h.press('envoi');
    expect(h.g.s.time()).toBe(avant);
  });

  it("passe à l'objectif suivant quand le précédent est atteint", () => {
    const h = partie();
    connecte(h);
    h.press('guide');
    h.sees("Objectif : Rebrancher l'antenne.");
  });

  it('chaque objectif a trois indices', () => {
    for (const o of OBJECTIFS) expect(o.indices).toHaveLength(3);
  });
});

describe('la messagerie du Contrôle', () => {
  it('liste les messages ; un message lu donne son canal et son heure', () => {
    const h = partie();
    prologue(h);
    h.run(21);
    h.press('envoi');
    h.type('VERNIER');
    h.press('envoi');
    h.type('1109');
    h.press('envoi');
    h.sees('1 non lu');
    h.choose(1);
    h.sees('14:00:20');
    h.choose(1);
    h.sees('DE : CONTROLE DE LA LIGNE');
    h.sees('CANAL DE SERVICE - COURTE PORTEE');
    h.sees('RECU A 14:00:20');
    h.sees('Fenêtre de retour à 15h45. CTL');
    expect(h.g.s.unread()).toBe(0);
  });

  it("propose Q1 et Q2, puis Q3 une fois l'antenne rétablie", () => {
    const h = partie();
    connecte(h);
    h.choose(1);
    h.choose(0);
    h.sees(QUESTIONS[0].texte);
    h.sees(QUESTIONS[1].texte);
    h.misses(QUESTIONS[2].texte);
    const k = partie();
    antenne(k);
    k.press('sommaire');
    k.choose(1);
    k.choose(0);
    k.sees(QUESTIONS[2].texte);
  });

  it('la réponse à Q2 arrive au bout de 20 s et donne le vrai délai', () => {
    const h = partie();
    connecte(h);
    h.choose(1);
    h.choose(0);
    h.choose(2);
    const envoi = h.g.s.mail.find(m => m.id === 'Q2');
    expect(envoi.out).toBe(true);
    expect(h.row(24)).toContain('Message envoye.');
    h.until(envoi.at + 20);
    expect(h.g.s.received('R2')).toBe(true);
    expect(REPONSES.R2).toContain('5 min 33 s dans chaque sens');
  });
});

describe('les textes et la mise en page', () => {
  // Une partie sauvegardée : l'écran titre affiche aussi sa ligne « SUITE reprendre la partie »
  beforeEach(() => { vi.stubGlobal('localStorage', memoryStorage()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  /** Une partie avancée jusqu'à la jonction, avec quelques messages, pour rendre toutes les pages. */
  function avancee(genre) {
    const h = partie();
    h.g.newGame();
    Object.assign(h.g.s, { gender: genre });
    for (const f of ['e1', 'e2', 'e3', 'e4', 'zone', 'e5']) h.g.unlock(f);
    h.g.s.data.f1 = T(14, 10, 0);
    h.g.s.addDoc('F1');
    for (const id of ['C01', 'C02', 'C03', 'C04', 'C05', 'C06']) h.g.receive(id);
    h.g.write('Q2');
    h.g.receive('R2');
    Object.assign(h.g.vars, { lu: 0, terre: 'F1', clair: 'F1' });
    return h;
  }

  /** Rend chaque page de chaque scène ; renvoie les débordements et le texte des pages. */
  function renderAll(h) {
    const overflow = watchOverflow(h.m);
    const pages = [];
    for (const id of Object.keys(scenario.scenes)) {
      h.g.go(id, { push: false });
      const n = h.g.pages();
      for (let page = 0; page < n; page++) {
        h.g.page = page;
        h.g.draw();
        h.run(0);
        if (overflow.length) throw new Error(`Débordement : ${h.g.scene.id}, page ${page + 1}, rangée ${overflow[0]}`);
        pages.push({ id: h.g.scene.id, text: Array.from({ length: 24 }, (_, i) => h.row(i + 1)).join('\n') });
      }
    }
    return pages;
  }

  const states = () => [partie(), avancee('m'), avancee('f')].map(h => {
    if (!h.g.s.started) { h.g.newGame(); h.g.s.gender = 'f'; }
    return h;
  });

  it('aucune page ne dépasse ses 40 colonnes', () => {
    for (const h of states()) renderAll(h);
  });

  it("aucun mot interdit de l'univers, à l'écran ni dans les messages", () => {
    const interdits = /\b(minitel|phare|port|ports|navire|quai|coque|pont|cale|ancre|accostage|amarrage|marseille|provence|guerre|militaire|sovietique|internet|ordinateur|smartphone)\b/i;
    const texts = states().flatMap(h => renderAll(h).map(p => p.text));
    texts.push(...Object.values(CONTROLE), ...Object.values(REPONSES), ...QUESTIONS.map(q => q.texte));
    for (const t of texts) expect(plain(t)).not.toMatch(interdits);
  });

  it('le faux Contrôle écrit ses heures « 15h45 », jamais « 15:45 »', () => {
    for (const t of [...Object.values(CONTROLE), ...Object.values(REPONSES)]) expect(t).not.toMatch(/\d:\d\d/);
    expect(CONTROLE.C01).toContain('15h45');
    expect(REPONSES.R1).toContain('15h45');
  });

  it('les écrans officiels écrivent leurs heures « 14:32 », jamais « 14h32 »', () => {
    // Seule Irène écrit ses heures « 8h30 » : son emploi du temps au carnet, ses messages, sa main courante
    const pages = renderAll(avancee('f')).filter(p => !['carnet', 'message', 'main-courante'].includes(p.id));
    for (const p of pages) expect(p.text).not.toMatch(/\b\d{1,2}h\d\d\b/);
  });

  it('les cinq fins, dans leurs variantes, tiennent leurs pages sans mot interdit', () => {
    const interdits = /\b(minitel|phare|port|ports|navire|quai|coque|pont|cale|ancre|accostage|amarrage|marseille|provence|guerre|militaire|sovietique)\b/i;
    for (const genre of ['m', 'f']) {
      for (const vue of [false, true]) {
        for (const fin of ['toujours-en-ligne', 'silence-radio', 'la-muette', 'deux-etoiles', 'hors-delai']) {
          const h = partie();
          h.g.newGame();
          h.g.s.gender = genre;
          if (vue) h.g.unlock('revelation');
          if (fin !== 'hors-delai') h.g.unlock('depart');
          const overflow = watchOverflow(h.m);
          h.g.finish(fin, 'fin');
          for (let page = 0; page < h.g.pages(); page++) {
            h.g.page = page;
            h.g.draw();
            h.run(0);
            expect(overflow, `${fin}, page ${page + 1}`).toEqual([]);
            expect(plain(Array.from({ length: 24 }, (_, i) => h.row(i + 1)).join(' '))).not.toMatch(interdits);
            if (page < h.g.pages() - 1) expect(h.row(22).trim(), `${fin} : le récit déborde sur les touches`).toBe('');
          }
        }
      }
    }
  });

  it('chaque refus tient dans la zone de trois rangées', () => {
    const refus = [REFUS.E1, REFUS.E2, REFUS.E3, REFUS.E4, ...['DHHHHHHH', 'GHHHHHHH', 'DDDDDDDD', 'HHD'].map(refusE5)];
    for (const r of refus) expect(wrap(r, 38).length).toBeLessThanOrEqual(3);
  });

  it('chaque menu, chaque suite et chaque redirection mènent à une scène qui existe', () => {
    const h = avancee('f');
    for (const [id, sc] of Object.entries(scenario.scenes)) {
      const targets = [
        ...(sc.menu ? Object.values(sc.menu(h.g)).filter(t => typeof t === 'string') : []),
        sc.next ? sc.next(h.g) : null,
        sc.redirect ? sc.redirect(h.g) : null,
        sc.parent || null,
      ].filter(Boolean);
      for (const t of targets) expect(scenario.scenes[t], `${id} → ${t}`).toBeDefined();
    }
  });
});
