// LATENCE : l'introduction d'ouverture, avant que le terminal s'allume (docs/latence/textes.md, § 0).
// Un opérateur interroge les archives de Baudot ; elles répondent en majuscules sans accents, comme la
// norme. Elle pose l'uchronie de docs/latence/univers.md et ne contient aucun indice.
import { MISSION } from './data.js';
import { sonsIntro } from './sons.js';

export default {
  cle: 'latence:intro-vue',
  seuil: {
    avecSon: 'Entrer avec le son',
    note: 'Casque conseillé.',
    sansSon: 'Entrer sans le son',
  },
  entete: ['COMPAGNIE BAUDOT - ARCHIVES DU RESEAU', 'CONNEXION ETABLIE. 1200 BAUDS.'],
  echanges: [
    {
      question: 'HISTORIQUE DU RESEAU',
      reponse: [
        { date: '1984.', texte: 'LA FRANCE OUVRE SON RESEAU VIDEOTEX AU GRAND PUBLIC. LES TERMINAUX SONT DISTRIBUES GRATUITEMENT.' },
        { date: '1986.', texte: 'LE VIDEOTEX FRANCAIS DEVIENT LA NORME MONDIALE. L\'ORDINATEUR PERSONNEL, LUI, NE SORT JAMAIS DES LABORATOIRES.' },
        { date: '2000.', texte: 'LA PLANETE COMPTE UN TERMINAL PAR FOYER.' },
      ],
    },
    {
      question: 'HISTORIQUE DE L\'ESPACE',
      reponse: [
        { date: '2041.', texte: 'PREMIERE BASE PERMANENTE SUR LA LUNE.' },
        { date: '2063.', texte: 'PREMIERE COLONIE SUR MARS. VAISSEAUX ET COLONIES EMBARQUENT LE MEME TERMINAL : ROBUSTE, REPARABLE, ECONOME.' },
        { date: '2079.', texte: 'OUVERTURE DE LA LIGNE TERRE-MARS, EXPLOITEE PAR LA COMPAGNIE BAUDOT. NEUF RELAIS EN ORBITE ENTRE LES DEUX PLANETES : CHACUN RECOIT LES PAGES D\'UN COTE ET LES REEMET DE L\'AUTRE.' },
        { texte: 'RIEN NE VA PLUS VITE QUE LA LUMIERE. UN MESSAGE MET DES MINUTES A ARRIVER : SUR LA LIGNE, UNE QUESTION ET SA REPONSE NE SE SUIVENT JAMAIS DE PRES.' },
      ],
    },
    {
      question: 'ETAT DE LA LIGNE TERRE-MARS',
      ligne: { relais: 9, muet: 7 },        // les relais s'allument un par un ; le septième s'éteint
      apres: [
        { texte: 'LE SEPTIEME RELAIS S\'EST TU.' },
        { texte: 'RELAIS L7, DIT « LA MUETTE ». AUTOMATISE DEPUIS 2089, PERSONNE A BORD.' },
        { texte: `AUCUNE EMISSION DEPUIS LE ${MISSION.silence} A ${MISSION.heureSilence}.` },
        { texte: 'QUAND UN SEUL RELAIS SE TAIT, MARS EST COUPEE DE LA TERRE.' },
      ],
    },
    {
      question: 'DUREE DE L\'INTERRUPTION',
      compteur: true,                       // du silence de L7 au début du jeu, puis il tourne
    },
  ],
  silence: [MISSION.silence, MISSION.heureSilence],
  arrivee: [MISSION.arrivee, MISSION.heureArrivee],
  bouton: 'Allumer le terminal',
  sons: sonsIntro,
};
