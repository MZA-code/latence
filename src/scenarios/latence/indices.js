// LATENCE : les objectifs et leurs trois indices, du plus vague au plus précis (docs/latence/enigmes.md).
// La touche GUIDE porte sur le premier objectif non terminé. Les indices ne révèlent jamais le
// retournement avant que le joueur l'ait découvert. Les solutions viennent des règles des énigmes.
import { ALIX, MISSION, DISTANCES, LUMIERE, TERRE, RELAIS, LIAISONS, RAVITAILLEMENTS } from './data.js';
import {
  codeAcces, cablage, delai, motDeControle, cheminE5, codeMaintenance, planE7, dernierRavitaillement,
} from './enigmes.js';
import { nombre } from './page.js';

const c = cablage();
const annee = String(RELAIS.miseEnService);
const plan = planE7();
const finDesGardes = RAVITAILLEMENTS.dernier.slice(6);
const derniere = dernierRavitaillement();

export const OBJECTIFS = [
  {
    id: 'O1', titre: 'Se connecter au serveur de bord', fait: g => !!g.s.flags.e1,
    indices: [
      'L\'ordre de mission explique comment composer le code. SUITE le réaffiche.',
      'Le code est une date : le jour et le mois du départ du Martinet.',
      `Identifiant ${ALIX.identifiant}, code ${codeAcces(MISSION.depart)}.`,
    ],
  },
  {
    id: 'O2', titre: 'Rebrancher l\'antenne', fait: g => !!g.s.flags.e2,
    indices: [
      'Le V40 est monochrome : les couleurs des câbles sont devenues des gris. Le manuel donne la table.',
      'Le testeur mesure le gris de chaque câble. 50 %, c\'est le rouge.',
      `A : ${c.A}, B : ${c.B}, C : ${c.C}, D : ${c.D}.`,
    ],
  },
  {
    id: 'O3', titre: 'Synchroniser le récepteur', fait: g => !!g.s.flags.e3,
    indices: [
      'La page « Délai de propagation » du manuel donne la formule.',
      'Divisez la distance à la Terre par la vitesse de la lumière.',
      `${nombre(DISTANCES.terre)} divisé par ${nombre(LUMIERE)} : ${delai()}.`,
    ],
  },
  {
    id: 'O4', titre: 'Confirmer la liaison avec la Terre', fait: g => !!g.s.flags.e4,
    indices: [
      'Chaque ligne de trous est une lettre. La table est en page 2.',
      'Lisez chaque ligne de gauche à droite et cherchez le motif dans la table. Le mot de contrôle est le dernier mot, après CODE.',
      `Le message dit : ${TERRE.F1.texte}. Le mot de contrôle est ${motDeControle(TERRE.F1.texte)}.`,
    ],
  },
  {
    id: 'O5', titre: 'Réussir la jonction', fait: g => !!g.s.flags.e5,
    indices: [
      'Recopiez la grille sur papier et cherchez un chemin de huit cases.',
      'Commencez par monter deux fois le long du bord gauche.',
      [...cheminE5()].join(' ') + '.',
    ],
  },
  {
    id: 'O6', titre: 'Entrer dans le serveur du relais', fait: g => !!g.s.flags.e6,
    indices: [
      'Le Contrôle parle d\'une règle apprise en formation. Votre dossier contient votre carnet.',
      'Le carnet donne la règle, la plaque du relais donne les valeurs.',
      `${RELAIS.numero}, puis ${annee} à l'envers, ${[...annee].reverse().join('')}, puis ${RELAIS.modules} : ${codeMaintenance(RELAIS)}.`,
    ],
  },
  {
    id: 'O7', titre: 'Refaire le plan de fréquences', fait: g => !!g.s.flags.e7,
    indices: [
      'Commencez par le signal de repère : il n\'a que deux places possibles.',
      'Sur le canal 5, le repère serait forcément voisin d\'une liaison montante. Il est donc sur le canal 1.',
      LIAISONS.map(l => `${l.code} ${plan[l.code]}`).join(', ') + '.',
    ],
  },
  {
    id: 'O8', titre: 'Ouvrir les quartiers de garde', fait: g => !!g.s.flags.e8,
    indices: [
      `Le code a changé depuis ${finDesGardes}. Quelque chose a donc ravitaillé le relais depuis.`,
      'Les archives listent des capsules de fret perdues près de L7. Perdues pour qui ?',
      `La dernière capsule « perdue » date du ${derniere}. Le code est ${codeAcces(derniere)}.`,
    ],
  },
  {
    id: 'O9', titre: 'Décider', fait: g => !!g.s.flags.depart || !!g.s.data.avecIrene,
    indices: [
      'Pour remettre L7 en service, il faut les deux clés. Irène a la seconde.',
      'Le menu PARTIR du Martinet propose de partir sans Irène ou avec elle.',
      'Pour tout réussir : remettre L7 en service, puis partir avec Irène et faire le calcul du retour.',
    ],
  },
  {
    id: 'O10', titre: 'Calculer le retour à deux', existe: g => !!g.s.data.avecIrene, fait: g => !!g.s.flags.e9,
    indices: [
      'Deux calculs : l\'oxygène pour deux pendant le retour, puis la masse au départ.',
      'La masse, c\'est le Martinet, plus Irène, plus les bouteilles, moins ce que vous laissez sur L7. Irène a maigri : sa main courante donne son poids d\'aujourd\'hui.',
      '2 bouteilles. 4 100 + 54 + 36 − 85 = 4 105 kg : 6 min 30 s.',
    ],
  },
];

/** L'objectif en cours : le premier qui existe et n'est pas terminé, ou null. */
export const objectifEnCours = g => OBJECTIFS.find(o => (!o.existe || o.existe(g)) && !o.fait(g)) || null;
