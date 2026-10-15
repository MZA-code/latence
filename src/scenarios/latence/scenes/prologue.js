// LATENCE : l'écran titre et le prologue, horloge arrêtée, puis le réveil, où l'horloge démarre.
import { Vdt, center } from '../../../engine/index.js';
import { title, para, paras, footer, menuLine, choicePrompt, tag } from '../../../game/ui.js';
import { hm } from '../../../game/state.js';
import { JOUR, ALIX, MISSION, DISTANCES } from '../data.js';
import { ligne, ecusson } from '../art.js';
import { nombre, choix, touche } from '../page.js';

/** Pendant le prologue, ni guide ni sommaire : la partie n'a pas encore commencé pour Alix. */
function prologueSeul(g, k) {
  if (k !== 'guide' && k !== 'sommaire') return false;
  g.bell();
  return true;
}

/** Une ligne centrée. */
const centre = (p, r, texte, fg = 7) => p.at(r, center(texte)).fg(fg).text(texte);

/** La ligne du mode sans chrono, que GUIDE bascule sur l'écran titre. */
const ligneChrono = (p, g) => touche(p, 19, 4, 'GUIDE', 'mode sans chrono : ' + (g.vars.sansChrono ? 'oui' : 'non'));

const titre = {
  frozen: true,
  prologue: true,
  enter(g) { g.vars.remplacer = false; },
  render(g, p) {
    ligne(p, 2);
    p.at(9, 14).size(3).text('LATENCE');
    centre(p, 11, 'Ligne Terre-Mars, 17 septembre 2097', 6);
    centre(p, 13, 'Un escape game sur terminal vidéotex.');
    centre(p, 14, 'Prévoyez du papier et un crayon.', 3);
    touche(p, 17, 4, 'ENVOI', 'nouvelle partie');
    const partie = g.savedState();
    if (partie) touche(p, 18, 4, 'SUITE', `reprendre la partie (${hm(partie.time())})`);
    ligneChrono(p, g);
    centre(p, 23, 'Personnages et sociétés fictifs.', 4);
  },
  key(g, k) {
    const partie = g.savedState();
    if (k !== 'envoi') g.vars.remplacer = false;
    if (k === 'envoi') {
      // Une partie en cours ne s'efface pas sur un seul appui
      if (partie && !g.vars.remplacer) {
        g.vars.remplacer = true;
        g.flash('Partie en cours : ENVOI pour l\'effacer.');
      } else {
        g.newGame({ timed: !g.vars.sansChrono });
      }
      return true;
    }
    if (k === 'suite') {
      if (partie) g.resume(partie); else g.bell();
      return true;
    }
    if (k === 'guide') {
      g.vars.sansChrono = !g.vars.sansChrono;
      const p = new Vdt();
      ligneChrono(p, g);
      g.m.send(p.raw(0x18).bytes());
      return true;
    }
    return false;
  },
};

function choisir(g, genre) {
  g.s.gender = genre;
  g.save();
  g.go('ordre', { push: false });
}

const personnage = {
  frozen: true,
  prologue: true,
  render(g, p) {
    title(p, 'LE PERSONNAGE');
    para(p, 6, 'Alix Vernier, technicien de ligne. Ou technicienne : c\'est à vous de le dire.');
    menuLine(p, 10, 1, 'Alix est un homme');
    menuLine(p, 12, 2, 'Alix est une femme');
    para(p, 15, 'Ce choix ne change que les accords.', { fg: 6 });
    choicePrompt(p, 18);
  },
  fields: () => [choix(18)],
  menu: () => ({ 1: g => choisir(g, 'm'), 2: g => choisir(g, 'f') }),
  key: prologueSeul,
};

/** L'ordre de mission, deux pages : au prologue, puis relu depuis la connexion ou le dossier. */
export function ordreDeMission(g, p, page) {
  tag(p, `${page + 1}/2`);
  if (page === 0) {
    p.at(2, 2).fg(6).text('COMPAGNIE BAUDOT');
    p.at(3, 2).fg(4).text('Toujours en ligne.');
    title(p, 'ORDRE DE MISSION', 5);
    p.at(6, 2).text('n° ' + MISSION.numero);
    ecusson(p, 3, 31, 1);
    paras(p, 9, [
      g.accord(`Destinataire : ${ALIX.prenom} ${ALIX.nom}, {technicien|technicienne} de ligne, matricule\u00a0${ALIX.matricule}.`),
      `Désignation : ${MISSION.designation}, à la demande du Contrôle, en remplacement de ${MISSION.remplace}.`,
      `Véhicule : ${MISSION.vehicule}.`,
      `Départ du Martinet : ${MISSION.depart}\u00a0à\u00a0${MISSION.heureDepart}.`,
      '',
      `Objet : le relais L7 est silencieux depuis le ${MISSION.silence}\u00a0à\u00a0${MISSION.heureSilence}. Mars est coupée de la Terre.`,
    ]);
    return;
  }
  let r = para(p, 2, 'Mission :', { gap: 0 });
  [
    `Rejoindre L7. Arrivée prévue le ${MISSION.arrivee} vers ${MISSION.heureArrivee}.`,
    'Confirmer la liaison avec la Terre avant toute jonction (procédure P-12).',
    'Remettre L7 en service.',
    `Repartir avant la fermeture de la fenêtre de retour, à ${MISSION.fenetre}.`,
  ].forEach((t, i) => {
    p.at(r, 2).text(i + 1 + '.');
    r = para(p, r, t, { c: 5, width: 35, gap: 0 });
  });
  paras(p, r + 1, [
    'Accès au serveur de bord :',
    'Identifiant : votre nom.',
    'Code d\'accès : le jour et le mois du départ du Martinet (JJMM).',
    '',
    'Depuis 2091, les missions de maintenance sont confiées à un seul technicien. La Compagnie vous remercie de votre autonomie.',
    '',
    'Le Contrôle de la Ligne, Toulouse. CTL',
  ]);
}

const ordre = {
  frozen: true,
  prologue: true,
  pages: 2,
  render(g, p, page) {
    ordreDeMission(g, p, page);
    footer(p, [['SUITE', page === 0 ? 'page suivante' : 'continuer']]);
  },
  next: () => 'reveil',
  key: prologueSeul,
};

const reveil = {
  prologue: true,
  enter(g) {
    g.history = [];   // on ne revient plus dans le prologue : l'horloge tourne
    g.sound('reveil');
  },
  render(g, p) {
    paras(p, 6, [
      `${hm(JOUR.debut)}. Le Martinet vous réveille avec trois notes polies.`,
      '',
      `Dans l'écran de visée, le Soleil, tout petit, et rien d'autre. Quelque part devant vous, à ${nombre(DISTANCES.l7)} km, le relais L7. Les techniciens l'appellent la Muette.`,
      '',
      'Le terminal s\'allume. Il attend votre identifiant.',
    ]);
    footer(p, [['ENVOI', 'continuer']]);
  },
  next: () => 'connexion',
};

export default { titre, personnage, ordre, reveil };
