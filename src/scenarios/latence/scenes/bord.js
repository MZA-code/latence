// LATENCE : le serveur de bord du Martinet (acte I) : connexion (E1), menu de bord, systèmes et
// répartiteur de l'antenne (E2), trajectoire et jonction manuelle (E5).
import { Vdt } from '../../../engine/index.js';
import { title, para, paras, footer, choicePrompt } from '../../../game/ui.js';
import { JOUR, DELAI, MARTINET, CABLES, COUPURE, DISTANCES, JONCTION, APPROCHE, MISSION, REFUS, IRENE } from '../data.js';
import { jugeE1, jugeE2, luminances, trajet, refusE5, repere, refusE9 } from '../enigmes.js';
import { depart } from './fins.js';
import { cables, grilleJonction, caseJonction, dessin, DESSIN_MARTINET } from '../art.js';
import { nombre, choix, item, heureNotee } from '../page.js';

// ---------------------------------------------------------------- E1 : la connexion

const connexion = {
  notice: 15,
  redirect: g => (g.s.flags.e1 ? 'bord' : null),
  render(g, p) {
    title(p, 'SERVEUR DE BORD');
    p.at(5, 2).fg(6).text('MARTINET ' + MARTINET.immatriculation);
    p.at(10, 3).text('IDENTIFIANT :');
    p.at(12, 3).text('CODE D\'ACCES :');
    footer(p, [['SUITE', 'relire l\'ordre de mission']]);
  },
  fields: () => [
    { r: 10, c: 18, len: 10, kind: 'letters' },
    { r: 12, c: 18, len: 4, kind: 'digits', mask: true },
  ],
  submit(g, [identifiant, code]) {
    if (!jugeE1(identifiant, code)) {
      g.reject(REFUS.E1);
      return;
    }
    g.unlock('e1');
    g.post('C02', DELAI);
    g.history = [];
    g.go('bord', { push: false });
  },
  next: () => 'dossier-ordre',
};

// ---------------------------------------------------------------- le menu de bord

const etatRecepteur = g => (!g.s.flags.e2 ? 'hors service' : !g.s.flags.e3 ? 'à synchroniser' : 'synchronisé');

const bord = {
  render(g, p) {
    title(p, 'MENU DE BORD');
    dessin(p, 1, 23, DESSIN_MARTINET, { couleur: 2 });     // gris 70 % : l'ambiance, sous le texte
    const n = g.s.unread();
    item(p, 8, 1, 'Messagerie du Contrôle', n ? `${n} non lu${n > 1 ? 's' : ''}` : '');
    item(p, 10, 2, 'Récepteur longue portée', etatRecepteur(g));
    item(p, 12, 3, 'Trajectoire');
    item(p, 14, 4, 'Systèmes');
    item(p, 16, 5, 'Manuel du Martinet');
    item(p, 18, 6, 'Dossier');
    if (g.s.flags.e5) item(p, 20, 7, 'Partir');
    choicePrompt(p, 22);
  },
  fields: () => [choix(22)],
  menu: g => ({
    1: 'messagerie', 2: 'recepteur', 3: 'trajectoire', 4: 'systemes', 5: 'manuel', 6: 'dossier',
    ...(g.s.flags.e5 ? { 7: 'partir' } : {}),
  }),
};

// ---------------------------------------------------------------- les systèmes et l'antenne (E2)

const systemes = {
  render(g, p) {
    title(p, 'SYSTEMES');
    item(p, 6, 1, 'Antenne longue portée', g.s.flags.e2 ? 'en service' : 'hors service');
    item(p, 9, 2, 'Oxygène');
    item(p, 11, 3, 'Masse et soute');
    choicePrompt(p, 15);
  },
  fields: () => [choix(15)],
  menu: () => ({ 1: 'antenne', 2: 'oxygene', 3: 'masse' }),
};

const antenne = {
  redirect: g => (g.s.flags.e2 ? 'antenne-ok' : 'antenne-hs'),
  render() {},
};

const antenneHS = {
  render(g, p) {
    title(p, 'ANTENNE');
    const r = para(p, 6, 'Antenne longue portée : HORS SERVICE.');
    para(p, r, 'Cause : le répartiteur commuté a été réaffecté. Chaîne de réception coupée.');
    item(p, 12, 1, 'Répartiteur');
    item(p, 14, 2, 'Testeur');
    choicePrompt(p, 18);
  },
  fields: () => [choix(18)],
  menu: () => ({ 1: 'repartiteur', 2: 'testeur' }),
};

/** Une entrée du journal de l'antenne : la date et l'heure officielles, puis l'événement. */
function journal(p, r, quand, texte) {
  p.at(r, 2).fg(6).text(quand);
  return para(p, r + 1, texte);
}

const antenneOK = {
  render(g, p) {
    title(p, 'ANTENNE');
    para(p, 6, 'Antenne longue portée : EN SERVICE.');
    p.at(8, 2).text('Journal :');
    const r = journal(p, 10, `${COUPURE.date} ${COUPURE.heure}`, COUPURE.texte);
    journal(p, r, `${JOUR.date} ${heureNotee(g.s.times.e2)}`, 'AFFECTATIONS RETABLIES - VERNIER');
  },
};

/** Les entrées du répartiteur : A à D, sur la rangée 18, un chiffre chacune. */
const ENTREES = [['Entrée A :', 3, 14], ['B :', 18, 22], ['C :', 26, 30], ['D :', 34, 38]];

const repartiteur = {
  notice: 20,
  redirect: g => (g.s.flags.e2 ? 'antenne-ok' : null),
  render(g, p) {
    title(p, 'REPARTITEUR');
    para(p, 5, 'Affectez chaque câble à son entrée.');
    para(p, 6, 'A antenne, B amplificateur, C filtre, D modem.', { fg: 6 });
    cables(p, 9, CABLES);
    for (const [label, c] of ENTREES) p.at(18, c).text(label);
    footer(p, [['ENVOI', 'affecter'], ['RETOUR', 'l\'antenne']]);
  },
  fields: () => ENTREES.map(([, , c]) => ({ r: 18, c, len: 1, kind: 'digits' })),
  submit(g, [A, B, C, D]) {
    if (!jugeE2({ A, B, C, D })) {
      g.reject(REFUS.E2);
      return;
    }
    g.unlock('e2');
    g.post('C03', DELAI);
    g.go('antenne-ok', { push: false });
  },
};

const testeur = {
  render(g, p) {
    title(p, 'TESTEUR');
    p.at(6, 2).text('Luminance des câbles :');
    Object.entries(luminances()).forEach(([n, v], i) => p.at(8 + i, 4).text(`Câble ${n} : ${v} %`));
  },
};

const oxygene = {
  render(g, p) {
    title(p, 'OXYGENE');
    let r = para(p, 6, `Réserve du Martinet : ${nombre(MARTINET.oxygene, 1)}\u00a0kg`, { gap: 0 });
    r = para(p, r, `Consommation actuelle : ${nombre(MARTINET.consommation, 2)}\u00a0kg par jour, pour 1\u00a0personne`, { gap: 0 });
    para(p, r, `Autonomie : ${Math.floor(MARTINET.oxygene / MARTINET.consommation)}\u00a0jours`);
  },
};

const masse = {
  render(g, p) {
    title(p, 'MASSE ET SOUTE');
    let r = para(p, 6, `Masse au départ : ${nombre(MARTINET.masse)}\u00a0kg, pilote et soute compris`);
    p.at(r, 2).text('Soute :');
    r += 2;
    for (const { objet, masse: kg, rapporter } of MARTINET.soute) {
      p.at(r, 3).text(objet);
      p.at(r + 1, 5).fg(6).text(`${kg} kg, à rapporter : ${rapporter ? 'OUI' : 'NON'}`);
      r += 3;
    }
  },
};

// ---------------------------------------------------------------- la trajectoire et la jonction (E5)

/** Ce qu'affiche « Distance à L7 » : elle baisse pendant l'approche, puis affiche JONCTION. */
function distanceL7(g) {
  if (g.s.flags.e5) return 'JONCTION';
  if (g.s.flags.zone) return 'zone de jonction';
  if (!g.s.flags.e4) return nombre(DISTANCES.l7) + '\u00a0km';
  const reste = 1 - (g.now - g.s.times.e4) / APPROCHE;
  return nombre(Math.max(1, Math.round(DISTANCES.l7 * reste))) + '\u00a0km';
}

function approche(g) {
  if (g.s.flags.e5) return 'terminée.';
  if (g.s.flags.zone) return 'terminée. Le Martinet est dans la zone de jonction.';
  if (!g.s.flags.e4) return 'en attente de la confirmation de liaison (procédure P-12)';
  const minutes = Math.max(1, Math.ceil((g.s.times.e4 + APPROCHE - g.now) / 60));
  return `autorisée. Arrivée dans la zone de jonction dans ${minutes} min.`;
}

/** La page de trajectoire ; renvoie la rangée qui suit. */
function rendTrajectoire(g, p) {
  title(p, 'TRAJECTOIRE');
  let r = para(p, 6, `Distance à la Terre : ${nombre(DISTANCES.terre)}\u00a0km`);
  r = para(p, r, `Distance à L7 : ${distanceL7(g)}`);
  r = para(p, r, 'Approche finale : ' + approche(g));
  r = para(p, r, `Durée du retour vers la Terre : ${MARTINET.retour}\u00a0jours`);
  return para(p, r, `Fenêtre de retour : fermeture à ${MISSION.fenetre}`);
}

const trajectoire = {
  redirect: g => (g.s.flags.zone && !g.s.flags.e5 ? 'trajectoire-zone' : 'trajectoire-info'),
  render() {},
};

const trajectoireInfo = {
  render(g, p) { rendTrajectoire(g, p); },
};

const trajectoireZone = {
  render(g, p) {
    item(p, rendTrajectoire(g, p), 1, 'Jonction manuelle');
    choicePrompt(p, 21);
  },
  fields: () => [choix(21)],
  menu: () => ({ 1: 'jonction' }),
};

/** Rejoue les impulsions case par case, puis réussit la jonction ou ramène le Martinet au départ. */
function manoeuvre(g, saisie) {
  if (!saisie) {
    g.bell();
    return;
  }
  const t = trajet(saisie), grille = JONCTION.grille, lent = !g.m.reduced;
  const p = new Vdt().coff();
  for (let k = 1; k < t.chemin.length; k++) {
    if (lent) p.pad(30);                        // un quart de seconde par impulsion, à 1200 bauds
    p.mark(() => g.sound('impulsion'));
    caseJonction(p, grille, t.chemin[k - 1], t.chemin[k]);
    caseJonction(p, grille, t.chemin[k], t.chemin[k]);
  }
  if (t.issue === 'anneau') {
    g.unlock('e5');
    g.post('C06', DELAI);
    if (lent) p.pad(60);
    g.m.send(p.bytes(), () => {
      g.sound('jonction');
      g.go('jonction-faite', { push: false });
    }, p.marks);
    return;
  }
  g.m.send(p.bytes(), null, p.marks);
  g.reject(refusE5(saisie));
  // Le Martinet revient en position d'attente
  const q = new Vdt().coff();
  if (lent) q.pad(120);
  const [depart, fin] = [t.chemin[0], t.chemin[t.chemin.length - 1]];
  caseJonction(q, grille, fin, depart);
  caseJonction(q, grille, depart, depart);
  g.cursorTo(q, g.field);
  g.m.send(q.bytes());
}

const jonction = {
  notice: 20,
  redirect: g => (g.s.flags.e5 ? 'jonction-faite' : null),
  render(g, p) {
    title(p, 'JONCTION MANUELLE');
    p.at(4, 2).text(`Réservoir de manœuvre : ${JONCTION.impulsions} impulsions.`);
    p.at(5, 2).fg(6).text('H haut, B bas, G gauche, D droite.');
    grilleJonction(p, JONCTION.grille, repere('M'));
    p.at(9, 31).text('IMPULSIONS');
    footer(p, [['ENVOI', 'manœuvrer'], ['RETOUR', 'trajectoire']]);
  },
  fields: () => [{ r: 10, c: 31, len: JONCTION.impulsions, kind: 'dirs' }],
  submit(g, [saisie]) { manoeuvre(g, saisie); },
};

const jonctionFaite = {
  render(g, p) {
    title(p, 'JONCTION');
    para(p, 6, 'Contact. Verrouillage. Le Martinet et L7 ne font plus qu\'un. Personne ne vous applaudit, c\'est normal.');
    footer(p, [['ENVOI', 'menu de bord']]);
  },
  next: () => 'bord',
};

// ---------------------------------------------------------------- le départ et E9

/**
 * Le menu PARTIR, disponible dès la jonction. Avant la révélation, il ne nomme pas Irène :
 * ce serait trahir le retournement.
 */
const partir = {
  redirect: g => (g.s.flags.e5 ? null : 'bord'),
  render(g, p) {
    title(p, 'PARTIR');
    para(p, 5, 'Partir maintenant ?');
    if (g.s.flags.revelation) {
      item(p, 8, 1, 'Partir sans Irène Vasseur');
      item(p, 10, 2, 'Partir avec Irène Vasseur');
    } else {
      // Texte provisoire, à valider par l'auteur : la seule option avant la révélation
      item(p, 8, 1, 'Partir vers la Terre');
    }
    choicePrompt(p, 14);
  },
  fields: () => [choix(14)],
  menu: g => ({
    1: gg => {
      gg.vars.avecIrene = false;
      gg.go('confirmation');
    },
    ...(g.s.flags.revelation ? {
      2: gg => {
        gg.s.data.avecIrene = true;
        gg.save();
        gg.go('calcul');
      },
    } : {}),
  }),
};

/** E9 : le pilote automatique refuse une passagère enregistrée comme morte. Calcul à la main. */
const calcul = {
  notice: 18,
  redirect: g => (g.s.flags.revelation ? null : 'partir'),
  render(g, p) {
    title(p, 'PARTIR');
    paras(p, 5, [
      'Pilote automatique : passagère inconnue.',
      `${IRENE.nom.toUpperCase()}, ${IRENE.matricule} : statut DECEDEE.`,
      'Calcul manuel requis.',
    ]);
    p.at(11, 3).text('BOUTEILLES D\'OXYGENE A EMBARQUER :');
    p.at(14, 3).text('DUREE DE POUSSEE :');
    p.at(14, 24).text('min');
    p.at(14, 31).text('s');
    footer(p, [['ENVOI', 'calculer'], ['RETOUR', 'partir']]);
  },
  fields: () => [
    { r: 11, c: 38, len: 1, kind: 'digits' },
    { r: 14, c: 22, len: 1, kind: 'digits' },
    { r: 14, c: 28, len: 2, kind: 'digits' },
  ],
  submit(g, [bouteilles, minutes, secondes]) {
    const refus = refusE9(bouteilles, minutes, secondes);
    if (refus) {
      g.reject(refus);
      return;
    }
    g.unlock('e9');
    g.vars.avecIrene = true;
    g.go('confirmation');
  },
};

const confirmation = {
  render(g, p) {
    title(p, 'PARTIR');
    para(p, 6, 'Le départ est définitif. ENVOI pour confirmer, RETOUR pour attendre.');
  },
  key(g, k) {
    if (k !== 'envoi') return false;
    depart(g, !!g.vars.avecIrene);
    return true;
  },
};

export default {
  connexion,
  bord,
  systemes,
  antenne,
  'antenne-hs': antenneHS,
  'antenne-ok': antenneOK,
  repartiteur,
  testeur,
  oxygene,
  masse,
  trajectoire,
  'trajectoire-info': trajectoireInfo,
  'trajectoire-zone': trajectoireZone,
  jonction,
  'jonction-faite': jonctionFaite,
  partir,
  calcul,
  confirmation,
};
