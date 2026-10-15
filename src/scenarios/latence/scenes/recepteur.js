// LATENCE : le récepteur longue portée : synchronisation (E3) et messages de la Terre en code Baudot (E4).
import { title, para, paras, footer, choicePrompt, tag } from '../../../game/ui.js';
import { DELAI, TERRE, BAUDOT, EMISSION, APPROCHE, REFUS } from '../data.js';
import { jugeE3, jugeE4, delai, duree, bande, motDeControle, delaiF2 } from '../enigmes.js';
import { bande as dessineBande, tableBaudot } from '../art.js';
import { choix, item, heureNotee, insecable } from '../page.js';

/** Nadia émet à chaque dizaine de minutes pleine : la prochaine émission après l'heure t. */
export const prochaineEmission = t => (Math.floor(t / EMISSION) + 1) * EMISSION;

const recepteur = {
  redirect: g => (!g.s.flags.e2 ? 'recepteur-hs' : !g.s.flags.e3 ? 'synchro' : 'recepteur-ok'),
  render() {},
};

const recepteurHS = {
  render(g, p) {
    title(p, 'RECEPTEUR');
    para(p, 6, 'Antenne hors service. Rien à recevoir.');
  },
};

// ---------------------------------------------------------------- E3 : la synchronisation

const synchro = {
  notice: 14,
  redirect: g => (g.s.flags.e3 ? 'recepteur-ok' : null),
  render(g, p) {
    title(p, 'RECEPTEUR');
    para(p, 6, 'Récepteur longue portée : NON\u00a0SYNCHRONISE.');
    p.at(9, 2).text('Délai de propagation Terre-Martinet,');
    p.at(10, 2).text('en secondes :');
    footer(p, [['ENVOI', 'synchroniser']]);
  },
  fields: () => [{ r: 10, c: 16, len: 3, kind: 'digits' }],
  submit(g, [saisie]) {
    if (!jugeE3(saisie)) {
      g.reject(REFUS.E3);
      return;
    }
    g.unlock('e3');
    g.schedule('f1', prochaineEmission(g.now));
    g.go('recepteur-ok', { push: false });
  },
};

/** Heure de réception d'un message de la Terre : data.f1, data.f2 (undefined tant qu'il n'est pas arrivé). */
const recu = (g, id) => g.s.data[id.toLowerCase()];

/**
 * Les messages de la Terre à lire sur le récepteur : F1 tant que LUCIOLE n'est pas renvoyé, F2 tant
 * que son mot de contrôle (facultatif) n'est pas validé, et F3, en clair, une fois arrivé.
 */
function aLire(g) {
  const liste = [];
  if (!g.s.flags.e4 && recu(g, 'F1') !== undefined) liste.push('F1');
  if (g.s.flags.e4 && recu(g, 'F2') !== undefined && !g.s.flags.f2) liste.push('F2');
  if (recu(g, 'F3') !== undefined) liste.push('F3');
  return liste;
}

/** Ouvre un message de la Terre : la bande Baudot, ou le texte en clair pour F3. */
function ouvre(g, id) {
  if (id === 'F3') {
    g.vars.clair = 'F3';
    g.go('terre-clair');
  } else {
    g.vars.terre = id;
    g.go('terre');
  }
}

const recepteurOK = {
  render(g, p) {
    title(p, 'RECEPTEUR');
    const d = delai();
    const r = paras(p, 6, [
      'Récepteur longue portée : SYNCHRONISE.',
      `Délai : ${d}\u00a0s (${insecable(duree(d))}).`,
      `Aller-retour avec la Terre : ${2 * d}\u00a0s (${insecable(duree(2 * d))}).`,
    ]) + 1;
    let suite = r;
    if (g.s.flags.e4) suite = para(p, r, 'Liaison avec la Terre confirmée. Procédure P-12 respectée.');
    const liste = aLire(g);
    liste.forEach((id, i) => item(p, suite + 2 * i, i + 1, `Message reçu à ${heureNotee(recu(g, id))}`));
    if (liste.length) choicePrompt(p, 20);
    else if (!g.s.flags.e4) para(p, r, 'En attente du prochain message de service.');
  },
  fields: g => (aLire(g).length ? [choix(20)] : []),
  menu: g => Object.fromEntries(aLire(g).map((id, i) => [i + 1, gg => ouvre(gg, id)])),
};

// ---------------------------------------------------------------- E4 : la bande Baudot

/** Ce qu'il advient quand le mot de contrôle d'un message de la Terre est le bon. */
const VALIDE = {
  F1: {
    juge: jugeE4,
    refus: REFUS.E4,
    ok(g) {
      g.unlock('e4');
      g.s.addDoc('F1');
      g.cancel('f1');
      g.post('C04', DELAI);
      g.after('zone', APPROCHE);
      // LUCIOLE part vers la Terre avec le journal de bord : Nadia y lira des messages « du Contrôle »
      g.after('f2', delaiF2());
      g.go('recepteur-ok', { push: false });
    },
  },
  F2: {
    juge: mot => mot === motDeControle(TERRE.F2.texte),
    refus: REFUS.F2,
    ok(g) {
      g.unlock('f2');
      g.s.addDoc('F2');
      g.go('recepteur-ok', { push: false });
    },
  },
};

const PAR_PAGE = 36;   // trois colonnes de 12 lignes
const message = g => g.vars.terre || 'F1';
const pagesDeBande = g => Math.ceil(TERRE[message(g)].texte.length / PAR_PAGE);

const terre = {
  notice: 20,
  pages: g => pagesDeBande(g) + 1,
  render(g, p, page) {
    const id = message(g), texte = TERRE[id].texte, n = pagesDeBande(g);
    tag(p, `${page + 1}/${n + 1}`);
    if (page < n) {
      title(p, 'MESSAGE DE LA TERRE');
      p.at(4, 2).text(`Message reçu à ${heureNotee(recu(g, id))}. ${texte.length} caractères.`);
      p.at(5, 2).text('Code télégraphique Baudot.');
      dessineBande(p, bande(texte).slice(page * PAR_PAGE, (page + 1) * PAR_PAGE), page * PAR_PAGE, () => g.sound('tac'));
      footer(p, [['SUITE', page + 1 < n ? 'la suite de la bande' : 'la table Baudot']]);
    } else {
      title(p, 'TABLE BAUDOT');
      p.at(4, 2).text('Trous 1 à 5, de gauche à droite.');
      p.at(5, 2).text('Pavé plein : trou. Point : pas de trou.');
      tableBaudot(p, BAUDOT, 6);
      footer(p, [['RETOUR', 'la bande']]);
    }
    p.at(19, 3).text('MOT DE CONTROLE :');
    // Le grésillement dure le temps que la ligne met à afficher la page
    const cps = g.m.line.baud / 10;
    if (page < n && cps) g.sound('bande', p.b.length / cps);
  },
  fields: () => [{ r: 19, c: 21, len: 8, kind: 'letters' }],
  submit(g, [mot]) {
    const v = VALIDE[message(g)];
    if (!v.juge(mot)) {
      g.reject(v.refus);
      return;
    }
    v.ok(g);
  },
};

export default {
  recepteur,
  'recepteur-hs': recepteurHS,
  synchro,
  'recepteur-ok': recepteurOK,
  terre,
};
