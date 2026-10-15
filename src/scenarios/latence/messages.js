// LATENCE : la messagerie du Contrôle (docs/latence/textes.md, section 5).
// Le faux Contrôle, c'est Irène : elle écrit ses heures « 15h45 ». Ne jamais les corriger.
import { DISTANCES, MISSION } from './data.js';
import { delai, duree } from './enigmes.js';
import { nombre, aLaMain } from './page.js';

const FENETRE = aLaMain(MISSION.fenetre);

/** Messages du Contrôle. Déclencheurs : docs/latence/scenario.md, « Les messages du Contrôle ». */
export const CONTROLE = {
  C01: `Bonjour Vernier. Ici le Contrôle. Le Martinet est à ${nombre(DISTANCES.l7)} km de L7. Votre antenne longue portée est en panne depuis ce matin : nous passons par le canal de service du relais, qui fonctionne encore en mode dégradé. Connectez-vous au serveur de bord. Fenêtre de retour à ${FENETRE}. CTL`,
  C02: 'Bien reçu. La procédure P-12 exige une liaison confirmée avec la Terre avant la jonction. Réparez l\'antenne longue portée. Le manuel est bien fait, pour une fois. CTL',
  C03: 'Nous voyons l\'origine de la coupure : L7. En mode dégradé, un relais envoie parfois des commandes absurdes. Une raison de plus de le remettre en état. Synchronisez le récepteur. CTL',
  C04: 'Liaison confirmée. Approche finale autorisée. Zone de jonction dans deux minutes. CTL',
  C05: 'Vous êtes dans la zone de jonction. Le réservoir de manœuvre est presque vide : huit impulsions, pas une de plus. Prenez votre temps. Enfin, celui qui vous reste. CTL',
  C06: 'Jonction réussie. Bienvenue sur L7. Branchez le V40 sur le serveur du relais avec la touche CONNEXION/FIN. Le code de maintenance ne transite jamais par la Ligne : appliquez la règle apprise en formation. CTL',
  C07: 'Vous êtes dans le relais. L\'émetteur principal est à l\'arrêt et le plan de fréquences a été effacé. Refaites le plan : le manuel du relais donne les règles. CTL',
  C08: 'Plan accepté. Il manque la clé\u00a02 : elle a disparu du panneau. Du temps des gardes, on la rangeait dans les quartiers de garde. Le code de leur porte est la date du dernier ravitaillement. Les archives vous la donneront. CTL',
  C08I: 'Plan accepté. La clé\u00a02, c\'est moi qui l\'ai. PLT',
  C09: 'Les messages que vous captez en direct de la Terre sont des échos parasites : du trafic ancien, renvoyé par les panneaux du relais. Ignorez-les. CTL',
  C10: 'Bonjour Alix. Oui, c\'est moi qui t\'écris depuis ce matin. Il n\'y a jamais eu personne à Toulouse au bout de ta ligne. Je suis désolée. Entre. PLT',
};

/**
 * Les questions du joueur, dans l'ordre de la liste. Chacune ne part qu'une fois ; when dit quand
 * elle apparaît, delay fixe le délai de sa réponse (sinon 15 à 40 secondes).
 */
export const QUESTIONS = [
  { id: 'Q1', texte: 'Confirmez-vous la mission ?', reply: 'R1' },
  { id: 'Q2', texte: 'Quel est le délai de transmission actuel ?', reply: 'R2', delay: 20 },
  { id: 'Q3', texte: 'Signaler une anomalie : l\'antenne a été coupée depuis L7.', reply: 'R3', when: g => !!g.s.flags.e2 },
  { id: 'Q4', texte: 'Qui était Irène Vasseur ?', reply: 'R4', when: g => !!g.s.seen.rapport },
  { id: 'Q5', texte: 'La Terre dit ne rien m\'avoir envoyé.', reply: 'R5', when: g => !!g.s.flags.f2 && g.s.received('C09') },
  {
    id: 'Q6', texte: 'Qui êtes-vous ?', reply: 'R6', delay: 30,
    when: g => !!g.s.flags.e6 && g.s.received('R2') && (!!g.s.flags.f2 || g.s.received('R4')),
  },
];

/** Les réponses du faux Contrôle. R4 est signée PLT ; R6 tutoie Alix, c'est la seule fois avant la révélation. */
export const REPONSES = {
  R1: `Confirmé. Remettez L7 en service et rentrez avant ${FENETRE}. CTL`,
  R2: `Environ ${duree(delai())} dans chaque sens. Comptez onze minutes pour une question et sa réponse. CTL`,
  R3: 'Anomalie notée. Mode dégradé. Continuez. CTL',
  R4: 'Une technicienne remarquable. Elle connaissait L7 mieux que personne. Morte en service en 2095. Nous n\'en dirons pas plus. PLT',
  R5: 'Échos parasites. Nous vous l\'avons dit. CTL',
  R6: 'Viens aux quartiers de garde. Le code, tu le trouveras. PLT',
};

/** Le texte d'un message de la messagerie, reçu ou envoyé. */
export function texteMessage(id) {
  const q = QUESTIONS.find(x => x.id === id);
  return CONTROLE[id] || REPONSES[id] || (q ? q.texte : '');
}
