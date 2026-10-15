// LATENCE : les documents. Le manuel du Martinet, et le dossier : ordre de mission, carnet de
// formation, messages de la Terre décodés.
import { title, para, paras, footer, choicePrompt, tag } from '../../../game/ui.js';
import { hm, hms } from '../../../game/state.js';
import { GRIS, CHAINE, LUMIERE, MARTINET, POUSSEE, BAUDOT, JONCTION, TERRE, EXEMPLE_CODE } from '../data.js';
import { codeMaintenance } from '../enigmes.js';
import { ORDRE } from '../recit.js';
import { tableBaudot } from '../art.js';
import { nombre, choix, item, heureNotee } from '../page.js';
import { ordreDeMission } from './prologue.js';

const pc = n => n + '\u00a0%';

// ---------------------------------------------------------------- le manuel du Martinet

/** Une page de texte d'un manuel. */
export const texte = lignes => p => paras(p, 5, lignes);

/** La table des gris : deux colonnes de quatre couleurs. */
function tableGris(p) {
  const r = paras(p, 5, ['Le V40 est monochrome. Les huit couleurs de la norme s\'y affichent en gris :']) + 1;
  Object.entries(GRIS).forEach(([nom, v], i) => {
    const c = i < 4 ? 4 : 23;
    p.at(r + (i % 4), c).text(nom);
    p.at(r + (i % 4), c + 8).text(pc(v).padStart(5, ' '));
  });
  paras(p, r + 5, ['Un bon technicien reconnaît un câble rouge les yeux fermés. Un excellent technicien utilise le testeur.']);
}

/** La table de durée de poussée : masse au départ, durée. */
function tablePoussee(p) {
  p.at(5, 2).fg(6).text('Masse au départ');
  p.at(5, 22).fg(6).text('Poussée');
  POUSSEE.forEach(({ min, max, duree }, i) => {
    const r = 7 + i;
    if (!duree) {
      p.at(r, 2).text(`${nombre(min)} kg et plus`);
      p.at(r, 22).text('retour impossible');
      p.at(r + 1, 22).text('dans la fenêtre');
      return;
    }
    p.at(r, 2).text(min === undefined ? `moins de ${nombre(max + 1)} kg` : `${nombre(min)} à ${nombre(max)} kg`);
    p.at(r, 22).text(duree);
  });
}

const MANUEL = [
  { id: 'gris', label: 'Table des gris du V40', titre: 'TABLE DES GRIS', pages: [tableGris] },
  {
    id: 'chaine', label: 'Chaîne de réception longue portée', titre: 'CHAINE DE RECEPTION',
    pages: [texte(Object.entries(CHAINE).map(([e, { element, couleur }]) => `Entrée ${e}, ${element} : câble ${couleur}.`))],
  },
  {
    id: 'delai', label: 'Délai de propagation', titre: 'DELAI DE PROPAGATION',
    pages: [texte([
      `Un signal voyage à la vitesse de la lumière : ${nombre(LUMIERE)} km par seconde.`,
      '',
      `Délai en secondes = distance en km divisée par ${nombre(LUMIERE)}, arrondi à la seconde inférieure.`,
      '',
      'Le récepteur doit connaître ce délai pour se synchroniser.',
    ])],
  },
  {
    id: 'baudot', label: 'Code Baudot', titre: 'CODE BAUDOT',
    pages: [
      texte([
        'Les messages de service de la Terre passent en mode télégraphique, plus résistant aux liaisons faibles.',
        '',
        'Chaque caractère est une ligne de cinq trous, numérotés de 1 à 5 de gauche à droite.',
        '',
        'La table est en page suivante, et en page 2 de chaque message reçu.',
      ]),
      p => {
        p.at(4, 2).text('Pavé plein : trou. Point : pas de trou.');
        tableBaudot(p, BAUDOT, 6);
      },
    ],
  },
  {
    id: 'p12', label: 'Procédure P-12', titre: 'PROCEDURE P-12',
    pages: [texte([
      'Aucune jonction sans liaison confirmée avec la Terre. Pour confirmer, renvoyer le mot de contrôle d\'un message de service.',
      '',
      'Cette procédure n\'est pas facultative. Elle a été écrite après un incident que la Compagnie préfère ne pas détailler.',
    ])],
  },
  {
    id: 'jonction', label: 'Jonction manuelle', titre: 'JONCTION MANUELLE',
    pages: [texte([
      'Chaque impulsion déplace le Martinet d\'une case : H haut, B bas, G gauche, D droite.',
      '',
      `Le réservoir de manœuvre permet ${JONCTION.impulsions === 8 ? 'huit' : JONCTION.impulsions} impulsions.`,
      '',
      'Tout contact avec la structure interrompt la manœuvre, comme toute sortie de la zone de jonction.',
    ])],
  },
  {
    id: 'oxygene', label: 'Consommation d\'oxygène', titre: 'OXYGENE',
    pages: [texte([
      `Une personne au repos consomme ${nombre(MARTINET.consommation, 2)} kg d'oxygène par jour.`,
      '',
      'Un technicien qui s\'énerve, davantage.',
    ])],
  },
  {
    id: 'retour', label: 'Calcul du retour', titre: 'CALCUL DU RETOUR',
    pages: [
      texte([
        'Masse au départ = masse du Martinet + passagers + chargement ajouté − matériel laissé sur L7.',
        '',
        'Pour alléger le Martinet, ne laisser que le matériel marqué « à rapporter : NON ». N\'embarquer que l\'oxygène nécessaire au retour : chaque bouteille compte dans la masse.',
        '',
        'La poussée de départ place le Martinet sur sa trajectoire ; la propulsion de croisière fait le reste.',
      ]),
      tablePoussee,
    ],
  },
];

const manuel = {
  render(g, p) {
    title(p, 'MANUEL DU MARTINET');
    MANUEL.forEach((e, i) => item(p, 5 + 2 * i, i + 1, e.label));
    choicePrompt(p, 21);
  },
  fields: () => [choix(21)],
  menu: () => Object.fromEntries(MANUEL.map((e, i) => [i + 1, 'manuel-' + e.id])),
};

/** Une scène par sujet d'un manuel : e = { titre, pages }. RETOUR revient au sommaire (parent). */
export function pageDuManuel(e, parent = 'manuel') {
  const n = e.pages.length;
  return {
    parent,
    pages: n,
    render(g, p, page) {
      tag(p, n > 1 ? `${page + 1}/${n}` : 'MANUEL');
      title(p, e.titre);
      e.pages[page](p, g);
      if (page + 1 < n) footer(p, [['SUITE', 'page suivante'], ['RETOUR', 'le sommaire']]);
      else footer(p, [['RETOUR', n > 1 ? 'page précédente' : 'le sommaire']]);
    },
  };
}

// ---------------------------------------------------------------- le dossier

/** Un message de la Terre décodé, au dossier : son heure de réception, son texte en clair. */
function messageClair(id) {
  return {
    label: g => `Message de la Terre (${hm(g.s.data[id.toLowerCase()])})`,
    ouvre: g => {
      g.vars.clair = id;
      g.go('terre-clair');
    },
  };
}

/** Les documents que le dossier peut contenir, dans l'ordre où Alix les trouve. */
const DOCUMENTS = {
  ordre: { label: () => 'Ordre de mission', ouvre: 'dossier-ordre' },
  carnet: { label: () => 'Carnet de formation', ouvre: 'carnet' },
  F1: messageClair('F1'),
  F2: messageClair('F2'),
  F3: messageClair('F3'),
};

const dossier = {
  render(g, p) {
    title(p, 'DOSSIER');
    g.s.docs.forEach((id, i) => item(p, 6 + 2 * i, i + 1, DOCUMENTS[id].label(g)));
    choicePrompt(p, 20);
  },
  fields: () => [choix(20)],
  menu: g => Object.fromEntries(g.s.docs.map((id, i) => [i + 1, DOCUMENTS[id].ouvre])),
};

const dossierOrdre = {
  pages: 2,
  render(g, p, page) {
    ordreDeMission(g, p, page);
    footer(p, page === 0 ? [['SUITE', 'page suivante'], ['RETOUR', 'revenir']] : [['RETOUR', 'page précédente']]);
  },
};

/** Le carnet de formation d'Alix : les cours d'Irène Vasseur. Ses heures à elle s'écrivent 8h30. */
const CARNET = [
  ['CARNET DE FORMATION', [
    'Alix Vernier',
    'École de la Ligne, promotion 2089',
    'Cours de I.\u00a0Vasseur',
    '',
    'Emploi du temps (écrit de sa main au tableau) :',
    'lundi 8h30, les délais',
    'mardi 8h30, les codes',
    'jeudi 14h00, les relais gardés',
    '',
    'Elle signe ses corrections PLT : « patience et longueur de temps ». C\'est de La Fontaine. Elle dit que c\'est la seule fable utile à un technicien.',
  ]],
  ['LES DELAIS', [
    'Sur la Ligne, rien n\'arrive tout de suite. Une question vers la Terre et sa réponse prennent plusieurs minutes, parfois plus de vingt.',
    '',
    '« Une réponse qui arrive trop vite doit vous inquiéter plus qu\'une réponse qui n\'arrive pas. » (I.V., souligné deux fois)',
  ]],
  ['LES CODES DE MAINTENANCE', [
    'Ils ne transitent jamais par la Ligne. On les calcule sur place :',
    'le numéro du relais,',
    'puis l\'année de sa mise en service écrite à l\'envers,',
    'puis son nombre de modules.',
    '',
    `Exemple : L${EXEMPLE_CODE.numero}, mis en service en ${EXEMPLE_CODE.miseEnService}, ${EXEMPLE_CODE.modules} modules : ${codeMaintenance(EXEMPLE_CODE)}.`,
    '',
    'En marge : « Apprenez-la. Un jour, personne ne pourra vous la donner. PLT »',
  ]],
];

const carnet = {
  pages: CARNET.length,
  render(g, p, page) {
    const [titre, lignes] = CARNET[page];
    tag(p, `${page + 1}/${CARNET.length}`);
    title(p, titre);
    paras(p, 5, lignes);
    footer(p, page + 1 < CARNET.length ? [['SUITE', 'page suivante'], ['RETOUR', 'revenir']] : [['RETOUR', 'page précédente']]);
  },
};

const terreClair = {
  render(g, p) {
    const id = g.vars.clair || 'F1';
    const recu = heureNotee(g.s.data[id.toLowerCase()]);
    title(p, 'MESSAGE DE LA TERRE');
    if (id === 'F3') {
      // L'ordre de la direction arrive en clair, par la Ligne rétablie
      const r = paras(p, 5, [`Reçu à ${recu}, en clair.`, '', `DE : ${ORDRE.de}`]);
      const s = para(p, r + 1, g.accord(ORDRE.texte), { fg: 3 });
      p.at(s, 2).fg(3).text(ORDRE.signature);
    } else {
      const r = paras(p, 5, [`Reçu à ${recu}, en code télégraphique Baudot.`, '', 'Décodé :']);
      para(p, r + 1, TERRE[id].texte, { fg: 3 });
    }
    footer(p, [['RETOUR', 'le dossier']]);
  },
};

const scenes = { manuel, dossier, 'dossier-ordre': dossierOrdre, carnet, 'terre-clair': terreClair };
for (const e of MANUEL) scenes['manuel-' + e.id] = pageDuManuel(e);

export default scenes;
