// LATENCE : les données du jeu, écrites une seule fois. Les écrans et les tests les lisent ici.
// Source : docs/latence/enigmes.md, « Données de référence » et fiches des énigmes.

/** Heure du jeu en secondes depuis minuit : heure('14:00:20') vaut 50 420. */
export function heure(hms) {
  const [h, m, s = 0] = hms.split(':').map(Number);
  return h * 3600 + m * 60 + s;
}

/** Le jour du jeu : mardi 17 septembre 2097, de 14:00:00 à 15:45:00. */
export const JOUR = {
  date: '17/09/2097',
  debut: heure('14:00:00'),
  c01: heure('14:00:20'),
  alarme: heure('15:35:00'),
  fin: heure('15:45:00'),
};

/** Le faux Contrôle répond en 15 à 40 secondes de jeu, tirées au hasard. */
export const DELAI = [15, 40];

/** Le personnage du joueur. */
export const ALIX = { prenom: 'Alix', nom: 'Vernier', identifiant: 'VERNIER', matricule: 'TL-4471' };

/** L'ordre de mission : affiché au prologue, puis relisible depuis la connexion et le dossier. */
export const MISSION = {
  numero: '2097-0912',
  designation: '30/08/2097',
  remplace: 'T.\u00a0Ndiaye',
  vehicule: 'VMR-07 Martinet',
  depart: '11/09/2097',
  heureDepart: '06:00',
  silence: '29/08/2097',
  heureSilence: '03:17',
  arrivee: '17/09/2097',
  heureArrivee: '14:00',
  fenetre: '15:45',
};

// ---------------------------------------------------------------- E2 : le répartiteur de l'antenne

/** Table des gris du V40, telle que le manuel l'imprime, en % : ce sont les gris de la norme. */
export const GRIS = { noir: 0, bleu: 40, rouge: 50, magenta: 60, vert: 70, cyan: 80, jaune: 90, blanc: 100 };

/** Les quatre câbles du répartiteur, dessinés chacun dans sa couleur de la norme. */
export const CABLES = { 1: 'rouge', 2: 'jaune', 3: 'vert', 4: 'bleu' };

/** Chaîne de réception longue portée (manuel) : entrée → élément, couleur du câble qui s'y branche. */
export const CHAINE = {
  A: { element: 'antenne', couleur: 'rouge' },
  B: { element: 'amplificateur', couleur: 'vert' },
  C: { element: 'filtre', couleur: 'bleu' },
  D: { element: 'modem', couleur: 'jaune' },
};

/** Journal de l'antenne : la coupure du matin. Journal officiel, l'heure s'écrit 09:12:04. */
export const COUPURE = {
  date: '17/09/2097',
  heure: '09:12:04',
  texte: 'RECONFIGURATION A DISTANCE - ORIGINE : L7/SERVICE',
};

// ---------------------------------------------------------------- E3 : le délai de propagation

/** Distances du Martinet, en km : à la Terre, et à L7 au début de la partie. */
export const DISTANCES = { terre: 100000000, l7: 1200 };

/** Vitesse de la lumière (manuel), en km par seconde. */
export const LUMIERE = 300000;

// ---------------------------------------------------------------- E4 : les messages de la Terre

/** Code Baudot (ITA2, lettres) : trous 1 à 5 de gauche à droite, 1 = trou. */
export const BAUDOT = {
  A: '11000', B: '10011', C: '01110', D: '10010', E: '10000', F: '10110', G: '01011',
  H: '00101', I: '01100', J: '11010', K: '11110', L: '01001', M: '00111', N: '00110',
  O: '00011', P: '01101', Q: '11101', R: '01010', S: '10100', T: '00001', U: '11100',
  V: '01111', W: '11001', X: '10111', Y: '10101', Z: '10001', ' ': '00100',
};

/** Messages de la Terre en code Baudot. Le mot de contrôle suit le mot CODE. */
export const TERRE = {
  F1: { texte: 'ICI NADIA BON VOL ALIX CODE LUCIOLE' },
  F2: { texte: 'LE CONTROLE NE VOUS A RIEN ENVOYE MEFIANCE CODE SILENCE' },
};

/** Nadia émet le message de service à chaque dizaine de minutes pleine : toutes les 600 s. */
export const EMISSION = 600;

// ---------------------------------------------------------------- E5 : la jonction manuelle

/** Grille de la zone de jonction : M le Martinet, J l'anneau de jonction, # la structure du relais. */
export const JONCTION = {
  grille: [
    '.........',
    '###...###',
    '..#.J.#..',
    '..#.#.#..',
    '....#....',
    '.####.##.',
    'M........',
  ],
  impulsions: 8,
};

/** L'approche finale dure deux minutes après le renvoi du mot de contrôle. */
export const APPROCHE = 120;

// ---------------------------------------------------------------- F2 : le second message de la Terre

/** Nadia réagit au journal du Martinet en une minute : F2 arrive 2 × 333 s + 60 s après LUCIOLE. */
export const REACTION = 60;

/** Une minute après F2, le faux Contrôle le qualifie d'« échos parasites » (C09). */
export const ECHOS = 60;

// ---------------------------------------------------------------- le relais L7

/** La plaque du relais, et l'exemple du carnet de formation pour la règle des codes de maintenance. */
export const RELAIS = { numero: 7, miseEnService: 2081, modules: 12 };
export const EXEMPLE_CODE = { numero: 3, miseEnService: 2080, modules: 9 };

/** L'émetteur de secours de L7 a émis pour la dernière fois le jour où la désignation d'Alix a changé. */
export const SECOURS = { date: '30/08/2097', heure: '10:20' };

/** Les systèmes de vie du relais, qui tournent pour une personne. */
export const VIE = { temperature: 24, bouteilles: 4, oxygeneBouteille: 2.5, masseBouteille: 18 };

// ---------------------------------------------------------------- E7 : le plan de fréquences

export const CANAUX = 5;

/** Les cinq liaisons du relais, dans l'ordre de l'écran. */
export const LIAISONS = [
  { code: 'TM', nom: 'Terre, montante', planete: 'Terre', montante: true },
  { code: 'TD', nom: 'Terre, descendante', planete: 'Terre', montante: false },
  { code: 'MM', nom: 'Mars, montante', planete: 'Mars', montante: true },
  { code: 'MD', nom: 'Mars, descendante', planete: 'Mars', montante: false },
  { code: 'RP', nom: 'Signal de repère', planete: null, montante: false },
];

/** L'état des canaux, en bas de l'écran du plan. */
export const BROUILLAGE = { canal: 4, planete: 'Mars' };

/** Les règles de compatibilité (manuel du relais), dans l'ordre où le refus les cite. */
export const REGLES = [
  'Un canal ne porte qu\'une seule liaison.',
  'Les deux liaisons d\'une même planète ne sont jamais sur des canaux voisins.',
  'Pour chaque planète, la liaison montante est sur un canal plus élevé que la liaison descendante.',
  'Le signal de repère occupe un canal extrême : 1 ou 5.',
  'Le signal de repère n\'est jamais voisin d\'une liaison montante.',
  'Aucune liaison ne va sur un canal signalé brouillé pour sa planète.',
];

// ---------------------------------------------------------------- E8 : les quartiers de garde

/** Les ravitaillements officiels : le 2 juin et le 2 décembre, du 02/12/2081 au 02/06/2089. */
export const RAVITAILLEMENTS = { premier: '02/12/2081', dernier: '02/06/2089' };

/** L'accident du Loriot : Irène Vasseur est déclarée morte. */
export const ACCIDENT = { date: '03/09/2095', vehicule: 'VMR-04 Loriot' };

export const IRENE = { nom: 'I.\u00a0Vasseur', matricule: 'TL-2203', masse2095: 61, masse: 54 };

/** Les capsules de fret « perdues » dans le secteur de L7 (archives du relais). */
export const CAPSULES = [
  { id: 'C-114', date: '12/11/2095', distance: 310, chargement: 'vivres, eau' },
  { id: 'C-122', date: '20/01/2096', distance: 280, chargement: 'pièces détachées' },
  { id: 'C-131', date: '03/04/2096', distance: 450, chargement: 'vivres, oxygène' },
  { id: 'C-139', date: '30/06/2096', distance: 120, chargement: 'eau, semences' },
  { id: 'C-147', date: '15/09/2096', distance: 390, chargement: 'vivres' },
  { id: 'C-152', date: '02/12/2096', distance: 205, chargement: 'oxygène, médicaments' },
  { id: 'C-160', date: '18/02/2097', distance: 330, chargement: 'vivres, eau' },
  { id: 'C-171', date: '09/05/2097', distance: 260, chargement: 'pièces détachées, vivres' },
  { id: 'C-180', date: '21/07/2097', distance: 140, chargement: 'oxygène' },
  { id: 'C-188', date: '26/08/2097', distance: 95, chargement: 'vivres, eau, oxygène' },
];

// ---------------------------------------------------------------- l'acte III

/** La remise en service : les messages en attente qui s'écoulent, et l'ordre de la direction (F3) 12 min après. */
export const REMISE = { messages: 3112, ordre: 720 };

/** La note de Gérard Lenglet qui classe les appels d'Irène. */
export const NOTE = { date: '19/09/2095', cout: '2,3' };

// ---------------------------------------------------------------- le Martinet

export const MARTINET = {
  immatriculation: 'VMR-07',
  retour: 6,              // jours de voyage jusqu'à la Terre
  oxygene: 6.0,           // kg d'oxygène à bord
  consommation: 0.84,     // kg d'oxygène par personne et par jour, au repos
  masse: 4100,            // kg au départ, pilote et soute compris
  soute: [
    { objet: 'Module émetteur de rechange', masse: 85, rapporter: false },
    { objet: 'Caisse à outils', masse: 32, rapporter: true },
    { objet: 'Échantillons', masse: 4, rapporter: true },
  ],
};

/** Calcul du retour (manuel) : durée de poussée selon la masse au départ, en kg. */
export const POUSSEE = [
  { max: 4039, duree: '5 min 55 s' },
  { min: 4040, max: 4049, duree: '6 min 00 s' },
  { min: 4050, max: 4059, duree: '6 min 05 s' },
  { min: 4060, max: 4069, duree: '6 min 10 s' },
  { min: 4070, max: 4079, duree: '6 min 15 s' },
  { min: 4080, max: 4089, duree: '6 min 20 s' },
  { min: 4090, max: 4099, duree: '6 min 25 s' },
  { min: 4100, max: 4109, duree: '6 min 30 s' },
  { min: 4110, max: 4119, duree: '6 min 35 s' },
  { min: 4120, max: 4129, duree: '6 min 40 s' },
  { min: 4130, duree: null },
];

// ---------------------------------------------------------------- les refus

/** Les messages de refus des énigmes : jamais un simple « Erreur ». */
export const REFUS = {
  E1: 'Identifiant ou code inconnu. Le Martinet vous regarde sans vous reconnaître.',
  E2: 'Pas de signal. Les affectations ne correspondent pas à la chaîne de réception.',
  E3: 'Synchronisation impossible. Ce délai ne correspond pas à la distance.',
  E4: 'Mot de contrôle incorrect. La liaison avec la Terre n\'est pas confirmée.',
  E5: {
    contact: n => `Contact avec la structure à la ${n} impulsion. Le Martinet revient en position d'attente.`,
    sortie: n => `Sortie de la zone de jonction à la ${n} impulsion. Le Martinet revient en position d'attente.`,
    reservoir: () => 'Réservoir vide avant l\'anneau de jonction.',
    // Texte provisoire, à valider par l'auteur : moins de huit impulsions, sans rien toucher
    court: () => 'Le Martinet s\'arrête avant l\'anneau de jonction. Il revient en position d\'attente.',
  },
  E6: 'Code refusé. Les relais ne pardonnent rien, mais ils ne comptent pas les essais.',
  E7: n => `Plan refusé : la règle ${n} n'est pas respectée.`,
  // Texte provisoire, à valider par l'auteur : un canal hors de 1 à 5, ou une liaison sans canal
  E7canaux: `Plan refusé : placez chaque liaison sur un canal de 1 à ${CANAUX}.`,
  E8: {
    remplace: `Code refusé. Ce code a été remplacé depuis ${RAVITAILLEMENTS.dernier.slice(6)}.`,
    ferme: 'Code refusé. La porte reste fermée.',
  },
  // Texte provisoire, à valider par l'auteur : la liaison est déjà confirmée, F2 est facultatif
  F2: 'Mot de contrôle incorrect.',
  E9: {
    oxygene: 'Oxygène insuffisant pour deux personnes pendant six jours.',
    bouteille: 'Une bouteille de trop : n\'embarquez que l\'oxygène nécessaire.',
    poussee: 'Trajectoire refusée. La poussée ne correspond pas à la masse.',
  },
};
