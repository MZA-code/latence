// Tests du moteur d'escape game (src/game/) : horloge, événements, indices, messagerie, sauvegarde, fins.
// Le scénario d'essai ne raconte rien : il donne juste des scènes et une horloge de 14:00 à 15:45.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { accord } from '../src/game/ui.js';
import { harness, memoryStorage, T } from './helpers.js';

function scenario(extra = {}) {
  return {
    title: 'ESSAI',
    storageKey: 'essai:partie',
    clock: { start: 14 * 60, end: 15 * 60 + 45, realMinutes: 105, seconds: true },
    scenes: {
      titre: { frozen: true, render() {} },
      bord: { render() {} },
      saisie: { render() {}, fields: () => [{ r: 5, c: 10, len: 8, kind: 'upper' }] },
      zone: { render() {}, notice: 20, fields: () => [{ r: 5, c: 10, len: 8, kind: 'upper' }] },
      fin: { render() {} },
    },
    start: 'titre',
    newGame(g) { g.go('bord', { push: false }); },
    resume(g) { g.go('bord', { push: false }); },
    home: () => 'bord',
    row0: () => 'MARTINET VMR-07',
    ...extra,
  };
}

describe('horloge', () => {
  it("affiche l'heure à la seconde en rangée 00 : 27 colonnes de libellé, 8 pour l'heure", () => {
    const { g, run, row } = harness(scenario());
    g.newGame();
    run(83);
    expect(row(0).slice(0, 36)).toBe(' MARTINET VMR-07' + ' '.repeat(12) + '14:01:23');
  });

  it("sans les secondes, garde 28 colonnes de libellé et 7 pour l'heure", () => {
    const { g, run, row } = harness(scenario({ clock: { start: 840, end: 945, realMinutes: 105 } }));
    g.newGame();
    run(83);
    expect(row(0).slice(0, 36)).toBe(' MARTINET VMR-07' + ' '.repeat(15) + '14:01');
  });

  it('appelle events() à chaque nouvelle seconde affichée, la première comprise', () => {
    let calls = 0;
    const { g, run } = harness(scenario({ events() { calls++; } }));
    g.newGame();
    run(3);
    expect(calls).toBe(4);   // 14:00:00, 14:00:01, 14:00:02, 14:00:03
  });
});

describe('événements horodatés', () => {
  /** Scénario qui note chaque événement déclenché, avec l'heure du jeu vue par le gestionnaire. */
  function agenda(plan, on = {}) {
    const log = [];
    const note = id => g => log.push([id, g.now]);
    const sc = scenario({
      newGame(g) { g.go('bord', { push: false }); plan(g); },
      on: { a: note('a'), b: note('b'), c09: note('c09'), fin: note('fin'), ...on },
    });
    return { log, ...harness(sc) };
  }

  it("part au premier instant où l'horloge atteint son heure, et une seule fois", () => {
    const { g, run, log } = agenda(g => g.schedule('a', T(14, 0, 20)));
    g.newGame();
    run(19.75);
    expect(log).toEqual([]);
    run(0.5);
    expect(log).toEqual([['a', T(14, 0, 20)]]);
    run(60);
    expect(log.length).toBe(1);
  });

  it('après un saut, déclenche les événements dépassés dans l’ordre, chacun à son heure', () => {
    const { g, run, log } = agenda(g => {
      g.schedule('b', T(14, 12, 30));
      g.schedule('a', T(14, 11, 0));
    });
    g.newGame();
    g.s.elapsedMs = 10 * 60000;
    run(0.25);
    g.s.penalty += 3;           // 14:10:00 → 14:13:00
    run(0.25);
    expect(log).toEqual([['a', T(14, 11, 0)], ['b', T(14, 12, 30)]]);
  });

  it("un délai programmé pendant un événement se compte depuis l'heure de cet événement", () => {
    const { g, run, log } = agenda(g => g.schedule('f2', T(14, 20, 0)), { f2: g => g.after('c09', 60) });
    g.newGame();
    g.s.elapsedMs = 19 * 60000;
    run(0.25);
    g.s.penalty += 3;           // 14:19:00 → 14:22:00 : F2 (14:20:00) et C09 (14:21:00) sont dépassés
    run(0.25);
    expect(log).toEqual([['c09', T(14, 21, 0)]]);
  });

  it("hors d'un événement, un délai se compte depuis l'heure du jeu", () => {
    const { g, run, log } = agenda(() => {});
    g.newGame();
    run(30);
    g.after('a', 20);
    run(19.75);
    expect(log).toEqual([]);
    run(0.5);
    expect(log).toEqual([['a', T(14, 0, 50)]]);
  });

  it('la fin de 15:45:00 se déclenche même quand un indice fait dépasser l’heure', () => {
    const { g, run, log } = agenda(g => g.schedule('fin', T(15, 45, 0)));
    g.newGame();
    g.s.elapsedMs = 103 * 60000;
    run(0.25);
    g.s.penalty += 3;           // 15:43:00 → 15:46:00, plafonné à 15:45:00
    run(0.25);
    expect(log).toEqual([['fin', T(15, 45, 0)]]);
  });

  it("events() est encore appelé quand l'horloge atteint la fin", () => {
    let over = false;
    const { g, run } = harness(scenario({ events(g) { if (g.s.over) over = true; } }));
    g.newGame();
    g.s.elapsedMs = 103 * 60000;
    run(0.25);
    g.s.penalty += 3;
    run(0.25);
    expect(over).toBe(true);
  });

  it('cancel() retire un événement en attente', () => {
    const { g, run, log } = agenda(g => g.schedule('a', T(14, 0, 10)));
    g.newGame();
    g.cancel('a');
    run(20);
    expect(log).toEqual([]);
  });

  it('cancel() avec un filtre ne retire que les événements dont les données lui répondent oui', () => {
    const { g } = agenda(() => {});
    g.newGame();
    g.post('R5', 20);
    g.post('C07', 25);
    g.cancel('message', d => d.id[0] === 'R');
    expect(g.s.agenda.map(e => e.data.id)).toEqual(['C07']);
  });

  it('programmer un événement sans gestionnaire est une erreur', () => {
    const { g } = agenda(() => {});
    g.newGame();
    expect(() => g.schedule('inconnu', T(14, 1, 0))).toThrow('Événement sans gestionnaire : inconnu');
  });
});

describe('indices et mode sans chrono', () => {
  /** Partie lancée, horloge à 14:10:00. */
  function at1410(setup) {
    const h = harness(scenario({ hintPenalty: 3 }));
    h.g.newGame(setup);
    h.g.s.elapsedMs = 10 * 60000;
    return h;
  }

  it("un indice avance l'horloge de la pénalité du scénario", () => {
    const { g } = at1410();
    expect(g.takeHint('O1')).toBe(1);
    expect(g.s.clockText()).toBe('14:13:00');
  });

  it("trois indices par objectif au plus : le quatrième n'est pas donné et ne coûte rien", () => {
    const { g } = at1410();
    g.takeHint('O1');
    g.takeHint('O1');
    g.takeHint('O1');
    expect(g.takeHint('O1')).toBe(0);
    expect(g.hintLevel('O1')).toBe(3);
    expect(g.s.clockText()).toBe('14:19:00');
  });

  it('sans chrono, les indices ne coûtent rien', () => {
    const { g } = at1410({ timed: false });
    expect(g.takeHint('O1')).toBe(1);
    expect(g.s.clockText()).toBe('14:10:00');
  });

  it("sans chrono, l'horloge dépasse la fin et la partie continue", () => {
    const { g, run } = at1410({ timed: false });
    g.s.elapsedMs = 110 * 60000;
    run(0.25);
    expect(g.s.clockText()).toBe('15:50:00');
    expect(g.s.over).toBe(false);
  });

  it('le réglage passé à newGame() est en place quand le scénario prépare la partie', () => {
    let timed;
    const { g } = harness(scenario({ newGame(g) { timed = g.s.timed; g.go('bord', { push: false }); } }));
    g.newGame({ timed: false });
    expect(timed).toBe(false);
  });
});

describe('sauvegarde', () => {
  beforeEach(() => { vi.stubGlobal('localStorage', memoryStorage()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("unlock() note l'heure du jeu où l'étape est franchie", () => {
    const { g, run } = harness(scenario());
    g.newGame();
    run(70);
    g.unlock('e2');
    expect(g.s.flags.e2).toBe(true);
    expect(g.s.times.e2).toBe(T(14, 1, 10));
  });

  it("la partie sauvegardée garde le personnage, le mode, l'agenda, les étapes et les données", () => {
    const { g, run } = harness(scenario({ on: { rep() {} } }));
    g.newGame({ timed: false });
    g.s.gender = 'f';
    run(10);
    g.unlock('e1');
    g.after('rep', 25, { id: 'R2' });
    g.s.data.antenne = 'ok';
    g.save();
    const s = g.savedState();
    expect(s.timed).toBe(false);
    expect(s.gender).toBe('f');
    expect(s.flags).toEqual({ e1: true });
    expect(s.times).toEqual({ e1: T(14, 0, 10) });
    expect(s.agenda).toEqual([{ at: T(14, 0, 35), id: 'rep', data: { id: 'R2' } }]);
    expect(s.data).toEqual({ antenne: 'ok' });
  });

  it('une partie reprise déclenche ses événements en attente à leur heure', () => {
    const log = [];
    const sc = () => scenario({ on: { rep: g => log.push(g.now) } });
    const first = harness(sc());
    first.g.newGame();
    first.run(10);
    first.g.after('rep', 25);
    first.g.save();

    const { g, run } = harness(sc());
    g.resume(g.savedState());
    run(24.75);
    expect(log).toEqual([]);
    run(0.5);
    expect(log).toEqual([T(14, 0, 35)]);
  });
});

describe('journal de partie', () => {
  beforeEach(() => { vi.stubGlobal('localStorage', memoryStorage()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("note les scènes, les étapes, les indices, les refus et la fin, à l'heure du jeu et au temps réel joué", () => {
    const { g, run } = harness(scenario({ hintPenalty: 3 }));
    g.newGame();
    run(10);
    g.unlock('e1');
    g.takeHint('O2');          // pris à 14:00:10 ; l'horloge saute ensuite de 3 minutes
    g.go('saisie');
    g.go('saisie', { page: 1 });
    g.reject('Non.');
    run(5);
    g.finish('sortie', 'fin');
    expect(g.s.journal).toEqual([
      { e: 'scene', s: 'bord', t: T(14, 0, 0), r: 0 },
      { e: 'etape', f: 'e1', t: T(14, 0, 10), r: 10 },
      { e: 'indice', o: 'O2', n: 1, t: T(14, 0, 10), r: 10 },
      { e: 'scene', s: 'saisie', t: T(14, 3, 10), r: 10 },
      { e: 'refus', s: 'saisie', t: T(14, 3, 10), r: 10 },
      { e: 'fin', f: 'sortie', t: T(14, 3, 15), r: 15 },
      { e: 'scene', s: 'fin', t: T(14, 3, 15), r: 15 },
    ]);
  });

  it("ne note rien avant le début de la partie, et se garde avec elle", () => {
    const { g, run } = harness(scenario());
    g.go('saisie');
    expect(g.s.journal).toEqual([]);
    g.newGame();
    run(2);
    g.unlock('e1');
    g.save();
    expect(g.savedState().journal.map(e => e.e)).toEqual(['scene', 'etape']);
  });
});

describe('accords du personnage', () => {
  it.each([
    ['Vous partez seul{|e}.', 'm', 'Vous partez seul.'],
    ['Vous partez seul{|e}.', 'f', 'Vous partez seule.'],
    ['{technicien|technicienne} de ligne', 'f', 'technicienne de ligne'],
    ['tu étais {mon meilleur élève|ma meilleure élève}.', 'f', 'tu étais ma meilleure élève.'],
    ['{Il|Elle} est {prêt|prête}.', 'f', 'Elle est prête.'],
    ['Rentrez seul{|e}.', null, 'Rentrez seul.'],
    ['Rien à accorder.', 'f', 'Rien à accorder.'],
  ])('accord(%j, %j) donne %j', (text, gender, out) => {
    expect(accord(text, gender)).toBe(out);
  });

  it('g.accord() suit le personnage choisi', () => {
    const { g } = harness(scenario());
    g.newGame();
    g.s.gender = 'f';
    expect(g.accord('Rentrez seul{|e}.')).toBe('Rentrez seule.');
  });
});

describe('messagerie', () => {
  const Q2 = { id: 'Q2', reply: 'R2', delay: 20 };

  it("une question part à l'heure du jeu, sa réponse arrive après son délai, non lue", () => {
    const { g, run } = harness(scenario());
    g.newGame();
    run(30);
    g.ask(Q2);
    expect(g.s.mail).toEqual([{ id: 'Q2', at: T(14, 0, 30), out: true }]);
    run(19.75);
    expect(g.s.received('R2')).toBe(false);
    run(0.5);
    expect(g.s.mail[1]).toEqual({ id: 'R2', at: T(14, 0, 50), read: false });
  });

  it("une question ne part qu'une fois", () => {
    const { g } = harness(scenario());
    g.newGame();
    g.ask(Q2);
    expect(g.ask(Q2)).toBe(null);
    expect(g.s.mail.length).toBe(1);
    expect(g.s.agenda.length).toBe(1);
  });

  it.each([[0, 15], [0.5, 28], [0.999, 40]])(
    'un délai [15, 40] tiré au hasard, bornes comprises : %s donne %s s',
    (r, seconds) => {
      const { g } = harness(scenario(), { random: () => r });
      g.newGame();
      g.post('C02', [15, 40]);
      expect(g.s.agenda[0].at).toBe(T(14, 0, 0) + seconds);
    },
  );

  it('questions() garde les questions débloquées qui ne sont pas encore parties', () => {
    const list = [
      { id: 'Q1', reply: 'R1' },
      { id: 'Q2', reply: 'R2' },
      { id: 'Q4', reply: 'R4', when: g => g.s.flags.rapport },
    ];
    const { g } = harness(scenario());
    g.newGame();
    g.ask(list[0]);
    expect(g.questions(list).map(q => q.id)).toEqual(['Q2']);
    g.unlock('rapport');
    expect(g.questions(list).map(q => q.id)).toEqual(['Q2', 'Q4']);
  });

  it('un message reçu prévient le scénario et reste non lu jusqu’à markRead()', () => {
    const arrived = [];
    const { g, run } = harness(scenario({ onMessage: (g, m) => arrived.push(m.id) }));
    g.newGame();
    g.schedule('message', T(14, 0, 20), { id: 'C01' });
    run(21);
    expect(arrived).toEqual(['C01']);
    expect(g.s.unread()).toBe(1);
    g.markRead('C01');
    expect(g.s.unread()).toBe(0);
  });

  it("les messages restent rangés par heure, même quand une réponse arrive après un saut", () => {
    const { g, run } = harness(scenario({ hintPenalty: 3 }));
    g.newGame();
    g.ask(Q2);                  // 14:00:00, réponse prévue à 14:00:20
    g.takeHint('O1');           // 14:03:00
    g.write('Q3');              // écrite avant que la réponse soit livrée
    run(0.25);
    expect(g.s.mail.map(m => m.id)).toEqual(['Q2', 'R2', 'Q3']);
  });
});

describe('fins et succès', () => {
  beforeEach(() => { vi.stubGlobal('localStorage', memoryStorage()); });
  afterEach(() => { vi.unstubAllGlobals(); });

  it("finish() affiche la fin, arrête l'horloge et abandonne les événements en attente", () => {
    const { g, run } = harness(scenario());
    g.newGame();
    g.ask({ id: 'Q2', reply: 'R2', delay: 20 });
    run(5);
    g.finish('silence', 'fin');
    expect(g.scene.id).toBe('fin');
    expect(g.s.ending).toBe('silence');
    run(60);
    expect(g.s.clockText()).toBe('14:00:05');
    expect(g.s.received('R2')).toBe(false);
  });

  it("events() n'est plus appelé une fois la partie terminée par un événement", () => {
    let late = 0;
    const { g, run } = harness(scenario({
      on: { fin: g => g.finish('hors-delai', 'fin') },
      events(g) { if (g.s.ending) late++; },
    }));
    g.newGame();
    g.schedule('fin', T(14, 0, 10));
    run(20);
    expect(g.s.ending).toBe('hors-delai');
    expect(late).toBe(0);
  });

  it("une partie finie ne se quitte pas par SOMMAIRE, GUIDE ni CONNEXION/FIN", () => {
    const { g, audio } = harness(scenario({ hintScene: 'bord', server: { name: 'L7', loginScene: 'bord' } }));
    g.newGame();
    g.finish('silence', 'fin');
    for (const k of ['sommaire', 'guide', 'connexion', 'retour']) {
      g.key(k);
      expect(g.scene.id, k).toBe('fin');
    }
    expect(audio.bells).toBe(4);
  });

  it('une partie finie ne se reprend pas', () => {
    const { g } = harness(scenario());
    g.newGame();
    g.save();
    expect(g.savedState()).not.toBe(null);
    g.finish('silence', 'fin');
    expect(g.savedState()).toBe(null);
  });

  it('les succès survivent aux nouvelles parties, ceux de la partie repartent de zéro', () => {
    const sc = () => scenario({ achievementsKey: 'essai:succes' });
    const { g } = harness(sc());
    g.newGame();
    g.achieve('oreille');
    expect(g.s.achieved).toEqual(['oreille']);
    g.newGame();
    expect(g.s.achieved).toEqual([]);
    expect(g.achievements.has('oreille')).toBe(true);
    expect(harness(sc()).g.achievements.has('oreille')).toBe(true);   // page rechargée
  });
});

describe('refus', () => {
  const LONG = 'Identifiant ou code inconnu. Le Martinet vous regarde sans vous reconnaître.';

  it('le bip d’un refus passe par la ligne : il sonne après la page en cours d’affichage', () => {
    const { g, m, audio, run } = harness(scenario());
    g.newGame();
    g.go('saisie');
    run(0.25);
    m.line.baud = 1200;
    m.send(new Uint8Array(240));        // deux secondes de bourrage à 120 caractères par seconde
    g.reject('Non.');
    run(1);
    expect(audio.bells).toBe(0);
    run(1.5);
    expect(audio.bells).toBe(1);
  });

  it('sans zone, le refus s’écrit en rangée 24', () => {
    const { g, run, row } = harness(scenario());
    g.newGame();
    g.go('saisie');
    g.reject('Code refusé.');
    run(0.25);
    expect(row(24).trimEnd()).toBe(' Code refusé.'.replace('é', 'e'));
  });

  it('un refus long s’écrit sur les trois rangées de la zone de la scène', () => {
    const { g, run, row } = harness(scenario());
    g.newGame();
    g.go('zone');
    g.reject(LONG);
    run(0.25);
    expect([20, 21, 22, 24].map(r => row(r).trimEnd())).toEqual([
      ' Identifiant ou code inconnu. Le',
      ' Martinet vous regarde sans vous',
      ' reconnaitre.',
      '',
    ]);
  });

  it('un nouveau refus efface le précédent dans la zone', () => {
    const { g, run, row } = harness(scenario());
    g.newGame();
    g.go('zone');
    g.reject(LONG);
    g.reject('Non.');
    run(0.25);
    expect([20, 21, 22].map(r => row(r).trimEnd())).toEqual([' Non.', '', '']);
  });
});

describe('repères de page', () => {
  it('un repère posé dans une page part quand la ligne atteint sa place', () => {
    const sc = scenario();
    let vus = 0;
    sc.scenes.bande = {
      render(g, p) {
        p.at(5, 1).text('xy'.repeat(30));   // 60 octets : pas de suite que REP compresserait
        p.mark(() => { vus++; });
      },
    };
    const { g, m, run } = harness(sc);
    g.newGame();
    m.line.baud = 1200;
    g.go('bande');
    run(0.25);
    expect(vus).toBe(0);
    run(1);
    expect(vus).toBe(1);
  });

  it('une page effacée avant la fin de sa transmission abandonne ses repères', () => {
    const sc = scenario();
    let vus = 0;
    sc.scenes.bande = {
      render(g, p) {
        p.at(5, 1).text('xy'.repeat(30));   // 60 octets : pas de suite que REP compresserait
        p.mark(() => { vus++; });
      },
    };
    const { g, m, run } = harness(sc);
    g.newGame();
    m.line.baud = 1200;
    g.go('bande');
    run(0.25);
    g.go('bord');
    run(2);
    expect(vus).toBe(0);
  });
});

describe('sons', () => {
  it("g.sound() joue le son du scénario qui porte ce nom", () => {
    const sons = { message(audio, n) { audio.joue = n; } };
    const { g, audio } = harness(scenario({ sons }));
    g.newGame();
    g.sound('message', 2);
    expect(audio.played).toEqual(['message']);
  });

  it("l'ambiance voulue par le scénario est demandée au son à chaque image ; terminal éteint, silence", () => {
    const sc = scenario({ ambiance: g => (g.s.started ? 'ventilation' : null), ambiances: { ventilation: {} } });
    const { g, audio, run } = harness(sc);
    run(0.25);
    expect(audio.current).toBe(null);
    g.newGame();
    run(0.25);
    expect(audio.current).toBe('ventilation');
    g.mode = 'off';
    run(0.25);
    expect(audio.current).toBe(null);
  });
});

describe('serveur', () => {
  const serveur = available => ({
    server: { name: 'L7', loginScene: 'saisie', available },
  });

  it("CONNEXION bipe et ne compose rien tant que le serveur n'est pas à portée", () => {
    const { g, audio } = harness(scenario(serveur(() => false)));
    g.newGame();
    g.key('connexion');
    expect(audio.bells).toBe(1);
    expect(g.mode).toBe('local');
  });

  it('CONNEXION compose le numéro quand le serveur est à portée', () => {
    const { g, audio } = harness(scenario(serveur(() => true)));
    g.newGame();
    g.key('connexion');
    expect(audio.bells).toBe(0);
    expect(g.mode).toBe('dial');
  });
});

describe('menus', () => {
  it("ENVOI sur une page à menu qui n'a pas de champ : un bip, pas de « Choix inconnu »", () => {
    const sc = scenario();
    sc.scenes.liste = { render() {}, menu: () => ({ 1: 'bord' }), fields: () => [] };
    const { g, audio, run, row } = harness(sc);
    g.newGame();
    g.go('liste');
    g.key('envoi');
    run(0.25);
    expect(audio.bells).toBe(1);
    expect(row(24).trim()).toBe('');
    expect(g.scene.id).toBe('liste');
  });
});

describe('saisie', () => {
  it('replie les minuscules accentuées en majuscules sans accent', () => {
    const { g } = harness(scenario());
    g.newGame();
    g.go('saisie');
    g.typeChar('é');
    g.typeChar('ç');
    expect(g.field.val).toBe('EC');
  });
});
