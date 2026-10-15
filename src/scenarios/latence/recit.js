// LATENCE : les textes de l'acte III (docs/latence/textes.md, sections 6, 8 et 10) : la main courante,
// la note de Lenglet, le dialogue avec Irène, l'ordre de la direction (F3) et les cinq fins.
// Irène écrit ses heures « 16h40 » : ne jamais les corriger.
import { JOUR, MISSION, COUPURE, SECOURS, ACCIDENT, IRENE, CAPSULES, NOTE } from './data.js';
import { delai, duree, jours } from './enigmes.js';
import { aLaMain } from './page.js';
import { hm } from '../../game/state.js';

const NB = ' ';
const derniere = CAPSULES[CAPSULES.length - 1];

/** Depuis l'accident, la session d'Irène est ouverte sur le terminal des quartiers : 745 jours. */
export const SESSION = jours(ACCIDENT.date, JOUR.date);
const FERMETURE = hm(JOUR.fin);

/** La main courante d'Irène : une entrée par page, dans l'ordre. Les dates officielles viennent des données. */
export const MAIN_COURANTE = [
  [ACCIDENT.date, '16h40', `Le Loriot est parti sans moi. La pince a cédé pendant que j'étais dans le module technique. J'ai rouvert les quartiers de garde. J'ai appelé la Terre. Délai : ${duree(delai()).replace(/ /g, NB)}. J'attends.`],
  ['06/09/2095', '9h05', 'Trois jours. Pas de réponse. Je rappelle toutes les heures. Je connais le délai par cœur, et pourtant je regarde l\'écran toutes les minutes.'],
  ['20/09/2095', '22h10', 'Une note interne de Baudot est passée par le relais ce soir. Je l\'ai gardée. « Échos parasites. Ne pas donner suite. » Je suis un écho parasite.'],
  ['02/10/2095', '18h00', 'Mes obsèques ont eu lieu ce matin à Toulouse. Le compte rendu est passé dans le trafic. Il y avait du monde. Alix était là.'],
  [CAPSULES[0].date, '3h30', `J'ai changé le point d'arrivée de la capsule ${CAPSULES[0].id} : ses corrections de trajectoire passent par le relais. Elle est venue se coller à L7 comme un chien perdu. Vivres et eau. Baudot la déclarera perdue. PLT`],
  ['15/03/2096', '7h15', 'La spiruline repart. Les lentilles aussi. Je parle aux lentilles. Elles écoutent mieux que certains élèves.'],
  ['18/02/2097', '12h00', 'Fin de la réserve des gardes. Il reste la serre et les capsules.'],
  [derniere.date, '21h45', `Dernière capsule, la ${derniere.id}. De quoi tenir jusqu'à l'arrivée de quelqu'un. S'il vient quelqu'un.`],
  [MISSION.silence, aLaMain(MISSION.heureSilence), 'J\'ai retiré la clé\u00a02 et effacé le plan de fréquences. La Muette se tait pour de bon. Pardon à Mars. Maintenant, ils sont obligés de venir.'],
  [SECOURS.date, aLaMain(SECOURS.heure), 'J\'ai fait désigner Alix à la place de Ndiaye, en me faisant passer pour le Contrôle. Une seule émission de secours a suffi. C\'est mal. C\'est la seule personne à qui je fais confiance.'],
  ['16/09/2097', '20h30', `Le Martinet arrive demain. Pesée ce matin : ${IRENE.masse}${NB}kg. J'ai rangé les quartiers. J'ai peur qu'Alix ne me pardonne pas. PLT`],
  [JOUR.date, aLaMain(COUPURE.heure.slice(0, 5)), 'J\'ai coupé l\'antenne du Martinet. La Terre ne doit pas lui parler avant moi. À partir de maintenant, je suis le Contrôle.'],
];

/** La note de Gérard Lenglet, gardée par Irène avec sa main courante. */
export const NOTE_LENGLET = [
  `Objet : signaux reçus de L7 depuis le ${ACCIDENT.date}.`,
  '',
  `Des messages signés ${IRENE.nom} sont reçus depuis L7. Une mission de secours coûterait l'équivalent de ${NOTE.cout} années d'exploitation de la Ligne, pour une survie très improbable.`,
  '',
  'Ces signaux sont classés comme échos parasites. Ne pas donner suite. Ne pas informer les équipes.',
  '',
  'G. Lenglet, directeur des opérations',
];

/** Le dialogue : trois questions dans l'ordre qu'on veut, puis « Et maintenant ? », qui donne la clé\u00a02. */
export const DIALOGUE = [
  {
    question: 'Pourquoi m\'avoir menti depuis ce matin ?',
    reponse: 'Si tu avais su que j\'étais vivante, le vrai Contrôle t\'aurait ordonné de faire demi-tour avant la jonction. Et tu aurais obéi. Tu as toujours obéi : c\'est pour ça que tu étais {mon meilleur élève|ma meilleure élève}. Je voulais que tu voies tout de tes yeux avant qu\'ils puissent te parler.',
  },
  {
    question: 'Comment avez-vous tenu deux ans ?',
    reponse: 'La réserve des gardes, la serre, la spiruline. Et dix capsules de fret. Leurs corrections de trajectoire passent par L7 : je leur ai donné un autre point d\'arrivée, le relais. Baudot les a comptées comme des pertes. Je n\'en suis pas fière. Je n\'en ai pas honte non plus.',
  },
  {
    question: 'Pourquoi moi ?',
    reponse: 'J\'ai fait changer la désignation le 30 août, en me faisant passer pour le Contrôle : une seule émission de secours a suffi. Ndiaye aurait suivi la procédure. Toi, tu lis les petites lignes. Et tu étais à mon enterrement : j\'ai vu ton nom passer dans le trafic.',
  },
  {
    question: 'Et maintenant ?',
    reponse: 'Maintenant, tu décides. Voilà la clé\u00a02. Avec elle, tu peux rallumer L7 : Mars attend depuis dix-neuf jours, et ce n\'est pas sa faute. Ensuite, tu pars avec moi ou sans moi. Je ne t\'en voudrai pas. Enfin, j\'essaierai.',
  },
];

/** F3, l'ordre de la direction, en clair par la Ligne rétablie. */
export const ORDRE = {
  de: 'DIRECTION DES OPERATIONS',
  texte: 'Votre télémétrie nous est parvenue. Une personne non identifiée se trouve sur L7. Ne l\'embarquez pas. Rentrez seul{|e}. Une équipe adaptée sera envoyée.',
  signature: 'G.L.',
};

/** Les cinq fins. Silence radio et Hors délai changent selon qu'Alix a vu Irène (révélation) ou non. */
export const FINS = {
  'toujours-en-ligne': {
    titre: 'TOUJOURS EN LIGNE',
    texte: () => [
      'Le Martinet s\'éloigne de L7. Derrière vous, le signal de repère bat de nouveau. Mars est reconnectée.',
      'Six jours plus tard, la Compagnie Baudot vous félicite pour votre autonomie.',
      'Trois semaines plus tard, une note interne classe le dossier L7. Elle est signée G.L.',
      'Sur la Ligne, une réponse qui n\'arrive pas ne doit pas vous inquiéter. Elle a simplement été classée.',
    ],
  },
  'silence-radio': {
    titre: 'SILENCE RADIO',
    texte: vue => (vue
      ? [
        'Vous partez seul{|e}. L7 reste muet, et Mars reste coupée de la Terre.',
        'Dans les quartiers de garde, Irène Vasseur retourne à ses lentilles.',
        'À votre retour, Baudot vous reproche l\'échec de la mission. Vous ne dites rien. Patience et longueur de temps.',
      ]
      : [
        'Mission interrompue. Le Martinet s\'éloigne de L7.',
        `Dans les quartiers de garde, quelqu'un le regarde partir. Sur le terminal des quartiers, une session est ouverte depuis ${SESSION} jours : ${IRENE.nom.toUpperCase()}.`,
        'Sur votre terminal, un dernier message arrive, en trente secondes : « Je comprends. PLT »',
      ]),
  },
  'la-muette': {
    titre: 'LA MUETTE',
    texte: () => [
      'Irène Vasseur s\'assoit à côté de vous, sa main courante sur les genoux. Pendant une heure, elle ne dit rien. Puis : « Tu aurais pu rallumer L7. »',
      'Mars reste coupée quatre mois, le temps qu\'une autre équipe arrive.',
      'À votre retour, la main courante est publiée sur tous les services d\'information. Gérard Lenglet démissionne. Baudot vous licencie. Mars ne vous remercie pas.',
    ],
  },
  'deux-etoiles': {
    titre: 'DEUX ETOILES',
    etoiles: 2,
    texte: () => [
      'Le Martinet s\'éloigne de L7. Derrière vous, le signal de repère bat de nouveau. Mars est reconnectée.',
      'Irène regarde la Muette rapetisser dans l\'écran de visée, jusqu\'à ce qu\'elle disparaisse. « Patience et longueur de temps, dit-elle. Mais pas trop longtemps quand même. »',
      'Six jours plus tard, la main courante est publiée sur tous les services d\'information. Gérard Lenglet démissionne. Nadia Ferhat vous attend à la sortie.',
      'Sur l\'écusson de la mission, il y a maintenant deux étoiles.',
    ],
  },
  'hors-delai': {
    titre: 'HORS DELAI',
    texte: vue => (vue
      ? [
        `${FERMETURE}. La fenêtre se ferme. Le prochain départ possible est dans quatre mois.`,
        'Irène sort deux tasses. « Tu verras, la spiruline, on s\'y fait. »',
        'Sur la Ligne, rien n\'arrive tout de suite. Vous êtes deux à attendre, maintenant.',
      ]
      : [
        `${FERMETURE}. La fenêtre se ferme. Le Martinet ne pourra pas repartir avant quatre mois.`,
        'Sur votre terminal, un message arrive, en trente secondes : « Ne t\'inquiète pas. Il y a de quoi manger pour deux. Je suis dans les quartiers de garde. PLT »',
      ]),
  },
};

/** Le nom des succès, pour l'écran de fin. */
export const SUCCES = { oreille: 'Oreille fine', 'deux-etoiles': 'Deux étoiles', 'sans-filet': 'Sans filet' };
