// LATENCE : le serveur du relais L7 (acte II), par la touche CONNEXION/FIN après la jonction.
// Code de maintenance (E6), état du relais, plan de fréquences (E7), systèmes de vie, archives,
// mise en service, quartiers de garde (E8) et manuel du relais.
import { title, para, paras, footer, choicePrompt, tag } from '../../../game/ui.js';
import { hms } from '../../../game/state.js';
import {
  ALIX, DELAI, MISSION, MARTINET, RELAIS, SECOURS, VIE, CANAUX, LIAISONS, BROUILLAGE, REGLES,
  RAVITAILLEMENTS, ACCIDENT, IRENE, CAPSULES, COUPURE, REFUS, REMISE,
} from '../data.js';
import { jugeE6, regleViolee, jugeE8, refusE8 } from '../enigmes.js';
import { nombre, choix, item } from '../page.js';
import { dessin, DESSIN_RELAIS } from '../art.js';
import { pageDuManuel, texte } from './documents.js';

const NB = ' ';
const raccrocher = ['CONNEXION/FIN', 'raccrocher'];

// ---------------------------------------------------------------- E6 : la connexion

const connexion = {
  notice: 14,
  redirect: g => (g.s.flags.e6 ? 'relais' : null),
  render(g, p) {
    title(p, 'SERVEUR DU RELAIS');
    paras(p, 5, [
      `RELAIS L${RELAIS.numero} - LIGNE TERRE-MARS`,
      `Mis en service en ${RELAIS.miseEnService} - ${RELAIS.modules} modules`,
      'Compagnie Baudot',
    ], { fg: 6 });
    p.at(10, 3).text('CODE DE MAINTENANCE :');
    footer(p, [raccrocher]);
  },
  fields: () => [{ r: 10, c: 25, len: 7, kind: 'digits' }],
  submit(g, [code]) {
    if (!jugeE6(code)) {
      g.reject(REFUS.E6);
      return;
    }
    g.unlock('e6');
    g.login(ALIX.identifiant);
    g.post('C07', DELAI);
    g.history = [];
    g.go('relais', { push: false });
  },
};

// ---------------------------------------------------------------- le menu du relais

const relais = {
  // Une fois le code trouvé, le relais reconnaît le V40 à chaque appel
  enter(g) { if (!g.session) g.login(ALIX.identifiant); },
  render(g, p) {
    title(p, `RELAIS L${RELAIS.numero}`);
    dessin(p, 1, 27, DESSIN_RELAIS, { couleur: 2 });       // gris 70 % : l'ambiance, sous le texte
    item(p, 7, 1, 'État du relais');
    item(p, 9, 2, 'Plan de fréquences', g.s.flags.e7 ? 'validé' : 'effacé');
    item(p, 11, 3, 'Systèmes de vie');
    item(p, 13, 4, 'Archives');
    item(p, 15, 5, 'Mise en service');
    item(p, 17, 6, 'Quartiers de garde', g.s.flags.e8 ? 'ouverts' : 'scellés');
    item(p, 19, 7, 'Manuel du relais');
    choicePrompt(p, 21);
    footer(p, [raccrocher]);
  },
  fields: () => [choix(21)],
  menu: () => ({
    1: 'etat', 2: 'plan', 3: 'vie', 4: 'archives', 5: 'mise-en-service', 6: 'quartiers', 7: 'relais-manuel',
  }),
};

// ---------------------------------------------------------------- l'état du relais

/** Les douze modules : nom, état, et parfois une précision qui trahit la main de quelqu'un. */
const modules = g => [
  ['Alimentation solaire', 'normal'],
  ['Batteries', 'normal'],
  ['Horloge de référence', 'normal'],
  ['Récepteur Terre', 'normal'],
  ['Récepteur Mars', 'normal'],
  ['Émetteur principal', g.s.flags.service ? 'en service' : 'ARRET MANUEL'],
  ['Émetteur de secours', 'veille', `(dernière émission le ${SECOURS.date}${NB}à${NB}${SECOURS.heure})`],
  ['Signal de repère', g.s.flags.service ? 'en service' : 'ARRET', g.s.flags.e7 ? '' : '(plan de fréquences effacé)'],
  ['Antenne Terre', 'normale'],
  ['Antenne Mars', 'normale'],
  ['Serveur de commutation', 'normal'],
  ['Systèmes de vie', 'ACTIF'],
];

const plan = g => (g.s.flags.e7 ? 'VALIDE' : 'EFFACE');

const etat = {
  pages: 2,
  render(g, p, page) {
    tag(p, `${page + 1}/2`);
    title(p, 'ETAT DU RELAIS');
    if (page === 0) {
      p.at(5, 2).text('Modules :');
      let r = 6;
      for (const [nom, valeur, precision] of modules(g)) {
        p.at(r, 3).text(nom);
        p.at(r, 26).fg(6).text(valeur);
        r = precision ? para(p, r + 1, precision, { c: 5, width: 34, fg: 4, gap: 0 }) : r + 1;
      }
      footer(p, [['SUITE', 'les clés'], ['RETOUR', 'le relais']]);
      return;
    }
    paras(p, 6, [
      'Clé 1 : en place',
      g.s.flags.service ? 'Clé 2 : en place' : `Clé 2 : RETIREE le ${MISSION.silence}${NB}à${NB}${MISSION.heureSilence}`,
      `Plan de fréquences : ${plan(g)}`,
    ]);
    footer(p, [['RETOUR', 'les modules']]);
  },
};

// ---------------------------------------------------------------- E7 : le plan de fréquences

const planFrequences = {
  notice: 18,
  redirect: g => (g.s.flags.e7 ? 'plan-ok' : null),
  render(g, p) {
    title(p, 'PLAN DE FREQUENCES');
    para(p, 5, `Placez chaque liaison sur un canal${NB}de${NB}1${NB}à${NB}${CANAUX}.`);
    LIAISONS.forEach((l, i) => p.at(8 + i, 3).fg(6).text(l.code).fg(7).text(` ${l.nom} :`));
    para(p, 14, `État des canaux : canal ${BROUILLAGE.canal} brouillé côté ${BROUILLAGE.planete}.`);
    footer(p, [['ENVOI', 'valider'], ['RETOUR', 'le relais']]);
  },
  fields: () => LIAISONS.map((l, i) => ({ r: 8 + i, c: 27, len: 1, kind: 'digits' })),
  submit(g, valeurs) {
    if (valeurs.some(v => !v || +v < 1 || +v > CANAUX)) {
      g.reject(REFUS.E7canaux);
      return;
    }
    const choisi = Object.fromEntries(LIAISONS.map((l, i) => [l.code, +valeurs[i]]));
    const n = regleViolee(choisi);
    if (n) {
      g.reject(REFUS.E7(n));
      return;
    }
    g.s.data.plan = choisi;
    g.unlock('e7');
    g.after('c08', g.delay(DELAI));
    g.go('plan-ok', { push: false });
  },
};

const planOK = {
  render(g, p) {
    title(p, 'PLAN DE FREQUENCES');
    para(p, 5, 'Plan accepté. Aucune interférence.');
    const choisi = g.s.data.plan || {};
    LIAISONS.forEach((l, i) => p.at(8 + i, 3).fg(6).text(l.code).fg(7).text(` ${l.nom} : canal ${choisi[l.code] || '-'}`));
    footer(p, [['RETOUR', 'le relais']]);
  },
};

// ---------------------------------------------------------------- les systèmes de vie

const vie = {
  render(g, p) {
    title(p, 'SYSTEMES DE VIE');
    paras(p, 5, [
      'Ventilation : ACTIVE (zone : quartiers de garde)',
      `Consommation d'oxygène : ${nombre(MARTINET.consommation, 2)}${NB}kg par jour`,
      `Température des quartiers de garde : ${VIE.temperature}${NB}°C`,
      'Serre : ACTIVE',
      'Cuve de spiruline : ACTIVE',
      `Bouteilles d'oxygène de secours : ${VIE.bouteilles}`,
      `(${nombre(VIE.oxygeneBouteille, 1)}${NB}kg d'oxygène chacune, ${VIE.masseBouteille}${NB}kg pleine)`,
    ]);
  },
};

// ---------------------------------------------------------------- les archives

const archives = {
  render(g, p) {
    title(p, 'ARCHIVES');
    item(p, 5, 1, `Ravitaillements de L${RELAIS.numero}`);
    item(p, 7, 2, 'Capsules de fret perdues');
    p.at(8, 7).text(`dans le secteur de L${RELAIS.numero}`);
    item(p, 10, 3, `Rapport d'incident du ${ACCIDENT.date}`);
    item(p, 12, 4, 'Trafic du relais');
    choicePrompt(p, 16);
  },
  fields: () => [choix(16)],
  menu: () => ({ 1: 'ravitaillements', 2: 'capsules', 3: 'rapport', 4: 'trafic' }),
};

const ravitaillements = {
  render(g, p) {
    title(p, 'RAVITAILLEMENTS');
    paras(p, 5, [
      `Un ravitaillement le 2 juin et le 2 décembre de chaque année, du ${RAVITAILLEMENTS.premier} au ${RAVITAILLEMENTS.dernier}.`,
      '',
      `Dernier : ${RAVITAILLEMENTS.dernier}, ravitaillement de fin de garde.`,
      '',
      'Depuis l\'automatisation : aucun ravitaillement prévu.',
    ]);
  },
};

const PAR_PAGE = 5;

const capsules = {
  pages: Math.ceil(CAPSULES.length / PAR_PAGE),
  render(g, p, page) {
    const n = Math.ceil(CAPSULES.length / PAR_PAGE);
    tag(p, `${page + 1}/${n}`);
    title(p, 'CAPSULES DE FRET');
    p.at(4, 2).fg(6).text(`Perdues dans le secteur de L${RELAIS.numero}.`);
    p.at(6, 2).fg(4).text('Capsule  Perte        Distance');
    CAPSULES.slice(page * PAR_PAGE, (page + 1) * PAR_PAGE).forEach((c, i) => {
      const r = 7 + 2 * i;
      p.at(r, 2).text(c.id);
      p.at(r, 11).text(c.date);
      p.at(r, 24).text(`${c.distance}${NB}km`);
      p.at(r + 1, 11).fg(6).text(c.chargement);
    });
    if (page + 1 < n) {
      footer(p, [['SUITE', 'la suite'], ['RETOUR', 'les archives']]);
      return;
    }
    paras(p, 18, [
      `Aucune perte dans ce secteur de ${RELAIS.miseEnService} à ${ACCIDENT.date.slice(6)}.`,
      'Classement : aléas de trajectoire.',
    ]);
    footer(p, [['RETOUR', 'page précédente']]);
  },
};

const rapport = {
  // Q4 « Qui était Irène Vasseur ? » apparaît une fois ce rapport lu
  enter(g) {
    g.s.seen.rapport = true;
    g.save();
  },
  render(g, p) {
    title(p, 'RAPPORT D\'INCIDENT');
    p.at(5, 2).fg(6).text(`${ACCIDENT.vehicule} - ${ACCIDENT.date}`);
    paras(p, 7, [
      `Rupture d'une pince de jonction pendant une mission de maintenance sur L${RELAIS.numero}. Le Loriot s'éloigne hors de portée et ne répond plus.`,
      `Technicienne : ${IRENE.nom}, ${IRENE.matricule}, masse déclarée ${IRENE.masse2095}${NB}kg, présumée à bord.`,
      'Recherches : non engagées (distance).',
      'Statut de la technicienne : DECEDEE.',
      '',
      'Direction des opérations, G.L.',
    ]);
  },
};

const trafic = {
  render(g, p) {
    title(p, 'TRAFIC DU RELAIS');
    const n = g.s.mail.filter(m => !m.out).length;
    paras(p, 5, [
      `Messages reçus de la Terre depuis le ${MISSION.silence} : 0`,
      'Messages relayés de la Terre vers Mars : 0',
      'Messages relayés de Mars vers la Terre : 0',
      '',
      `Canal de service, courte portée : ${n} message${n > 1 ? 's' : ''} émis vers VMR-07 depuis ${COUPURE.heure.slice(0, 5)}.`,
      'Origine de ces messages : locale (console du relais).',
    ]);
  },
};

// ---------------------------------------------------------------- la mise en service

/** Les deux clés en place et le plan validé : Alix peut tourner les clés. */
const pret = g => !!g.s.flags.cle2 && !!g.s.flags.e7 && !g.s.flags.service;

function consigne(g) {
  if (pret(g)) return 'ENVOI : tourner les deux clés ensemble.';
  if (!g.s.flags.cle2) return 'La mise en service exige les deux clés.';
  // Texte provisoire, à valider par l'auteur : la clé 2 en main, mais pas de plan de fréquences
  return 'La mise en service exige un plan de fréquences validé.';
}

const miseEnService = {
  redirect: g => (g.s.flags.service ? 'rallumage' : null),
  render(g, p) {
    title(p, 'MISE EN SERVICE');
    paras(p, 6, [
      'Clé 1 : EN PLACE',
      `Clé 2 : ${g.s.flags.cle2 ? 'EN PLACE' : 'ABSENTE'}`,
      `Plan de fréquences : ${plan(g)}`,
      '',
      consigne(g),
    ]);
  },
  key(g, k) {
    if (k !== 'envoi' || !pret(g)) return false;
    // Les deux clés ensemble : L7 se rallume, et l'ordre de la direction partira de la Terre
    g.unlock('service');
    g.after('f3', REMISE.ordre);
    g.go('rallumage', { push: false });
    return true;
  },
};

/** La remise en service, ligne par ligne, au rythme de la ligne. */
const rallumage = {
  render(g, p) {
    title(p, 'MISE EN SERVICE');
    [
      'Horloge de référence... synchronisée.',
      'Récepteurs... à l\'écoute.',
      'Émetteur principal... en service.',
      'Trafic Terre-Mars... rétabli.',
      `${nombre(REMISE.messages)} messages en attente s'écoulent.`,
      `Mars est reconnectée à ${hms(g.s.times.service || g.now)}.`,
    ].forEach((t, i) => {
      if (i === 0) p.mark(() => g.sound('remise'));
      if (i === 4) p.mark(() => g.sound('messages'));
      if (!g.m.reduced) p.pad(120);              // une seconde par ligne
      p.at(6 + 2 * i, 2).text(t);
    });
  },
};

// ---------------------------------------------------------------- E8 : les quartiers de garde

const quartiers = {
  notice: 12,
  redirect: g => (!g.s.flags.e8 ? null : g.s.flags.revelation ? 'quartiers-menu' : 'porte'),
  render(g, p) {
    title(p, 'QUARTIERS DE GARDE');
    para(p, 6, `Porte scellée le ${RAVITAILLEMENTS.dernier}.`);
    p.at(9, 3).text('CODE (JJMM) :');
    footer(p, [['ENVOI', 'ouvrir'], ['RETOUR', 'le relais']]);
  },
  fields: () => [{ r: 9, c: 17, len: 4, kind: 'digits' }],
  submit(g, [code]) {
    if (!jugeE8(code)) {
      g.reject(refusE8(code));
      return;
    }
    g.unlock('e8');
    // La révélation : plus rien du faux Contrôle en route, seulement C10, qui tutoie Alix
    for (const id of ['message', 'c08', 'c09']) g.cancel(id);
    g.receive('C10');
    g.go('porte', { push: false });
  },
};

// ---------------------------------------------------------------- le manuel du relais

const MANUEL = [
  {
    id: 'regles', label: 'Règles de compatibilité', titre: 'COMPATIBILITE',
    pages: [p => {
      let r = 5;
      REGLES.forEach((regle, i) => {
        p.at(r, 2).text(i + 1 + '.');
        r = para(p, r, regle, { c: 5, width: 35, gap: 0 });
      });
    }],
  },
  {
    id: 'quartiers', label: 'Quartiers de garde', titre: 'QUARTIERS DE GARDE',
    pages: [texte([
      'Le code de la porte est le jour et le mois du dernier ravitaillement reçu par le relais (JJMM). Il se met à jour automatiquement à chaque ravitaillement.',
      '',
      'Les quartiers sont scellés depuis l\'automatisation. Merci de ne pas y entrer sans raison.',
    ])],
  },
  {
    id: 'cles', label: 'Clés de mise en service', titre: 'CLES DE MISE EN SERVICE',
    pages: [texte([
      'Héritage des relais gardés : deux clés à tourner ensemble, à l\'origine une par technicien de garde.',
      '',
      'Depuis l\'automatisation, les deux clés restent à demeure dans le panneau.',
    ])],
  },
];

const manuel = {
  render(g, p) {
    title(p, 'MANUEL DU RELAIS');
    MANUEL.forEach((e, i) => item(p, 5 + 2 * i, i + 1, e.label));
    choicePrompt(p, 13);
  },
  fields: () => [choix(13)],
  menu: () => Object.fromEntries(MANUEL.map((e, i) => [i + 1, 'relais-manuel-' + e.id])),
};

const scenes = {
  'relais-connexion': connexion,
  relais,
  etat,
  plan: planFrequences,
  'plan-ok': planOK,
  vie,
  archives,
  ravitaillements,
  capsules,
  rapport,
  trafic,
  'mise-en-service': miseEnService,
  rallumage,
  quartiers,
  'relais-manuel': manuel,
};
for (const e of MANUEL) scenes['relais-manuel-' + e.id] = pageDuManuel(e, 'relais-manuel');

export default scenes;
