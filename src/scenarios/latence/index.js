// LATENCE : le scénario. Mardi 17 septembre 2097, de 14:00:00 à 15:45:00, sur le terminal du Martinet.
// Le dossier de conception est dans docs/latence/ (commencer par README.md).
import { JOUR, DELAI, EMISSION, ECHOS, ALIX, RELAIS } from './data.js';
import prologue from './scenes/prologue.js';
import bord from './scenes/bord.js';
import recepteur from './scenes/recepteur.js';
import messagerie from './scenes/messagerie.js';
import documents from './scenes/documents.js';
import relais from './scenes/relais.js';
import quartiers from './scenes/quartiers.js';
import fins, { terminer } from './scenes/fins.js';
import guide from './scenes/guide.js';
import { sons, ambiances } from './sons.js';
import { rapport } from './essai.js';
import intro from './intro.js';

/**
 * Irène se démasque, par sa réponse à Q6 ou par C10 : elle tutoiera Alix et signera PLT. Les
 * réponses de faux Contrôle qu'elle avait encore en route ne partent plus.
 */
function demasque(g) {
  if (g.s.flags.demasquee) return;
  g.unlock('demasquee');
  g.cancel('message', d => d.id[0] === 'R');
}

export default {
  title: 'LATENCE',
  storageKey: 'latence:partie:v1',
  achievementsKey: 'latence:succes',
  // Temps réel, de 14:00:00 à 15:45:00, affiché à la seconde
  clock: { start: JOUR.debut / 60, end: JOUR.fin / 60, realMinutes: (JOUR.fin - JOUR.debut) / 60, seconds: true },
  hintPenalty: 3,            // minutes par indice
  replyDelay: DELAI,         // le faux Contrôle répond en 15 à 40 secondes
  scenes: { ...prologue, ...bord, ...recepteur, ...messagerie, ...documents, ...relais, ...quartiers, ...fins, ...guide },
  start: 'titre',
  hintScene: 'guide',
  sons,
  ambiances,
  rapport,                   // le rapport d'essai (?essai), tiré du journal de la partie
  intro,                     // l'introduction d'ouverture, avant que le terminal s'allume

  /** La ventilation du Martinet, puis la cuve de spiruline après la révélation ; le silence hors de la partie. */
  ambiance(g) {
    if (!g.s.started || g.s.ending || !g.scene || g.scene.frozen) return null;
    return g.s.flags.revelation ? 'cuve' : 'ventilation';
  },

  /** Le serveur du relais : le V40 s'y branche par câble, une fois la jonction faite. */
  server: {
    name: `L${RELAIS.numero}`,
    loginScene: 'relais-connexion',
    available: g => !!g.s.flags.e5,
  },

  newGame(g) {
    g.s.addDoc('ordre');
    g.s.addDoc('carnet');
    g.schedule('message', JOUR.c01, { id: 'C01' });
    if (g.s.timed) {
      g.schedule('alarme', JOUR.alarme);
      g.schedule('fin', JOUR.fin);
    }
    g.go('personnage', { push: false });
  },

  /** Reprise : au choix du personnage s'il manque, à la connexion tant que E1 n'est pas réussie, sinon au menu. */
  resume(g) {
    g.go(!g.s.gender ? 'personnage' : !g.s.flags.e1 ? 'connexion' : 'bord', { push: false });
  },

  home(g) {
    if (!g.s.started) return 'titre';
    if (g.connected) return g.s.flags.e6 ? 'relais' : 'relais-connexion';
    return g.s.flags.e1 ? 'bord' : 'connexion';
  },

  row0(g) {
    if (g.scene && g.scene.prologue) return 'LATENCE';
    if (!g.connected) return 'MARTINET VMR-07';
    return `RELAIS L${RELAIS.numero} - ${g.s.flags.revelation ? 'LA MUETTE' : ALIX.identifiant}`;
  },

  on: {
    /** Message de service de la Terre : il arrive à chaque dizaine de minutes pleine, jusqu'à LUCIOLE. */
    f1(g) {
      if (g.s.flags.e4) return;
      g.s.data.f1 = g.now;
      g.save();
      g.flash('Message de la Terre reçu.');
      g.after('f1', EMISSION);
    },
    /** Fin de l'approche : le Martinet entre dans la zone de jonction, le Contrôle le remarque. */
    zone(g) {
      g.unlock('zone');
      g.post('C05', DELAI);
    },
    /** F2 : Nadia a lu le journal du Martinet. Le Contrôle n'a rien envoyé. */
    f2(g) {
      g.s.data.f2 = g.now;
      g.save();
      g.flash('Message de la Terre reçu.');
      g.after('c09', ECHOS);
    },
    /** Le plan accepté : C08, ou C08-I, signé PLT, si Irène est déjà démasquée quand il part. */
    c08(g) {
      g.receive(g.s.flags.demasquee ? 'C08I' : 'C08');
    },
    /** « Échos parasites » : seulement tant qu'Irène joue encore le Contrôle. */
    c09(g) {
      if (!g.s.flags.demasquee) g.receive('C09');
    },
    /** F3 : l'ordre de la direction, douze minutes après la remise en service, si le Martinet est encore là. */
    f3(g) {
      if (g.s.flags.depart) return;
      g.s.data.f3 = g.now;
      g.s.addDoc('F3');
      g.save();
      g.flash('Message de la Terre reçu.');
    },
    /** 15:35:00 : plus que dix minutes. Puis un bip par minute jusqu'à la fermeture. */
    alarme(g) {
      // Texte de textes.md raccourci pour tenir sur la rangée 24, à valider par l'auteur
      g.flash('Plus que 10 minutes avant la fermeture.');
      g.sound('alarme');
      g.after('bip', 60);
    },
    bip(g) {
      g.sound('bip');
      if (g.now + 60 < JOUR.fin) g.after('bip', 60);
    },
    /** 15:45:00 : la fenêtre de retour se ferme. */
    fin(g) {
      if (!g.s.flags.depart) terminer(g, 'hors-delai');
    },
  },

  onMessage(g, m) {
    g.flash('Nouveau message du Contrôle.');
    g.sound('message');
    if (m.id === 'R6') {
      demasque(g);
      g.achieve('oreille');
    }
    if (m.id === 'C10') demasque(g);
  },
};
