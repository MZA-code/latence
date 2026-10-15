// LATENCE : les règles des énigmes. Des fonctions pures qui jugent une saisie à partir de data.js ;
// les écrans et les tests s'en servent, pour que la solution n'existe qu'à un endroit.
import { GREY, COLOR_NAMES } from '../../engine/index.js';
import {
  ALIX, MISSION, CABLES, CHAINE, DISTANCES, LUMIERE, BAUDOT, TERRE, JONCTION, REFUS,
  REACTION, RELAIS, CANAUX, LIAISONS, BROUILLAGE, RAVITAILLEMENTS, CAPSULES, MARTINET, VIE, IRENE, POUSSEE,
} from './data.js';

// ---------------------------------------------------------------- E1

/** Le jour et le mois d'une date JJ/MM/AAAA : 11/09/2097 donne 1109. */
export const codeAcces = date => date.slice(0, 2) + date.slice(3, 5);

export const jugeE1 = (identifiant, code) => identifiant === ALIX.identifiant && code === codeAcces(MISSION.depart);

// ---------------------------------------------------------------- E2

/** Ce que mesure le testeur : le gris de chaque câble dessiné, en %, d'après les gris du moteur. */
export function luminances() {
  const out = {};
  for (const [n, couleur] of Object.entries(CABLES)) out[n] = Math.round(GREY[COLOR_NAMES.indexOf(couleur)] * 100);
  return out;
}

/** Le câble à brancher sur chaque entrée : celui qui a la couleur demandée par la chaîne. */
export function cablage() {
  const out = {};
  for (const [entree, { couleur }] of Object.entries(CHAINE)) {
    out[entree] = Object.keys(CABLES).find(n => CABLES[n] === couleur);
  }
  return out;
}

/** saisie : { A, B, C, D }, le numéro de câble tapé pour chaque entrée. */
export const jugeE2 = saisie => Object.entries(cablage()).every(([entree, n]) => saisie[entree] === n);

// ---------------------------------------------------------------- E3

/** Délai de propagation Terre-Martinet en secondes : distance / vitesse, arrondi à l'inférieur. */
export const delai = () => Math.floor(DISTANCES.terre / LUMIERE);

/** Une durée en secondes, écrite comme sur le récepteur : 5 min 33 s, 11 min 06 s. */
export const duree = s => Math.floor(s / 60) + ' min ' + String(s % 60).padStart(2, '0') + ' s';

export const jugeE3 = saisie => saisie === String(delai());

// ---------------------------------------------------------------- E4

/** La bande perforée d'un texte : une ligne de cinq trous par caractère. */
export const bande = texte => [...texte].map(ch => BAUDOT[ch]);

/** Relit une bande avec la table ; un motif inconnu donne « ? ». */
export function decode(lignes) {
  const lettres = {};
  for (const [lettre, motif] of Object.entries(BAUDOT)) lettres[motif] = lettre;
  return lignes.map(m => lettres[m] || '?').join('');
}

/** Le mot de contrôle d'un message de service : le mot qui suit CODE. */
export function motDeControle(texte) {
  const mots = texte.split(' ');
  return mots[mots.indexOf('CODE') + 1];
}

export const jugeE4 = saisie => saisie === motDeControle(TERRE.F1.texte);

// ---------------------------------------------------------------- E5

const PAS = { H: [-1, 0], B: [1, 0], G: [0, -1], D: [0, 1] };

/** Case d'un repère de la grille (M ou J) : [rangée, colonne]. */
export function repere(ch) {
  const r = JONCTION.grille.findIndex(l => l.includes(ch));
  return [r, JONCTION.grille[r].indexOf(ch)];
}

/**
 * Rejoue des impulsions sur la grille. Renvoie les cases parcourues (départ compris) et l'issue :
 * anneau, contact (structure), sortie (de la zone), reservoir (huit impulsions sans atteindre
 * l'anneau) ou court (moins de huit), avec le numéro de l'impulsion qui décide.
 */
export function trajet(saisie) {
  const g = JONCTION.grille;
  let [r, c] = repere('M');
  const chemin = [[r, c]];
  for (let i = 0; i < saisie.length; i++) {
    const [dr, dc] = PAS[saisie[i]];
    r += dr;
    c += dc;
    if (r < 0 || r >= g.length || c < 0 || c >= g[0].length) return { issue: 'sortie', n: i + 1, chemin };
    if (g[r][c] === '#') return { issue: 'contact', n: i + 1, chemin };
    chemin.push([r, c]);
    if (g[r][c] === 'J') return { issue: 'anneau', n: i + 1, chemin };
  }
  return { issue: saisie.length >= JONCTION.impulsions ? 'reservoir' : 'court', n: saisie.length, chemin };
}

export const jugeE5 = saisie => trajet(saisie).issue === 'anneau';

/** Le plus court chemin de M à J, par un parcours en largeur : la solution de la jonction. */
export function cheminE5() {
  const g = JONCTION.grille, [jr, jc] = repere('J');
  const file = [[...repere('M'), '']];
  const vu = new Set([file[0].slice(0, 2).join()]);
  while (file.length) {
    const [r, c, chemin] = file.shift();
    if (r === jr && c === jc) return chemin;
    for (const [k, [dr, dc]] of Object.entries(PAS)) {
      const R = r + dr, C = c + dc;
      if (R < 0 || R >= g.length || C < 0 || C >= g[0].length || g[R][C] === '#' || vu.has(R + ',' + C)) continue;
      vu.add(R + ',' + C);
      file.push([R, C, chemin + k]);
    }
  }
  return null;
}

const ordinal = n => (n === 1 ? '1re' : n + 'e');

/** Le message de refus d'une jonction manquée. */
export function refusE5(saisie) {
  const t = trajet(saisie);
  return REFUS.E5[t.issue](ordinal(t.n));
}

// ---------------------------------------------------------------- F2

/** F2 arrive après l'aller du journal (5 min 33 s), la minute de réaction de Nadia et le retour : 726 s. */
export const delaiF2 = () => 2 * delai() + REACTION;

// ---------------------------------------------------------------- E6

/** La règle du carnet : le numéro du relais, l'année de mise en service à l'envers, le nombre de modules. */
export const codeMaintenance = ({ numero, miseEnService, modules }) =>
  `${numero}${[...String(miseEnService)].reverse().join('')}${modules}`;

export const jugeE6 = code => code === codeMaintenance(RELAIS);

// ---------------------------------------------------------------- E7

const voisins = (a, b) => Math.abs(a - b) === 1;
const PLANETES = ['Terre', 'Mars'];
const liaison = (planete, montante) => LIAISONS.find(l => l.planete === planete && l.montante === montante).code;

/** Les six règles de compatibilité, dans l'ordre du manuel. plan : { TM, TD, MM, MD, RP }, des canaux 1 à 5. */
const REGLES_E7 = [
  plan => new Set(LIAISONS.map(l => plan[l.code])).size === LIAISONS.length,
  plan => PLANETES.every(pl => !voisins(plan[liaison(pl, true)], plan[liaison(pl, false)])),
  plan => PLANETES.every(pl => plan[liaison(pl, true)] > plan[liaison(pl, false)]),
  plan => plan.RP === 1 || plan.RP === CANAUX,
  plan => LIAISONS.filter(l => l.montante).every(l => !voisins(plan.RP, plan[l.code])),
  plan => LIAISONS.filter(l => l.planete === BROUILLAGE.planete).every(l => plan[l.code] !== BROUILLAGE.canal),
];

/** Le numéro de la première règle que le plan ne respecte pas (sauf celle qu'on écarte), ou 0. */
export function regleViolee(plan, sauf = 0) {
  for (let k = 0; k < REGLES_E7.length; k++) if (k + 1 !== sauf && !REGLES_E7[k](plan)) return k + 1;
  return 0;
}

export const jugeE7 = plan => regleViolee(plan) === 0;

/** Le seul plan qui respecte les six règles, cherché parmi toutes les saisies. */
export function planE7() {
  for (let i = 0; i < CANAUX ** LIAISONS.length; i++) {
    const plan = {};
    LIAISONS.forEach((l, k) => { plan[l.code] = Math.floor(i / CANAUX ** k) % CANAUX + 1; });
    if (jugeE7(plan)) return plan;
  }
  return null;
}

// ---------------------------------------------------------------- E8

const jour = date => date.split('/').reverse().join('');   // JJ/MM/AAAA → AAAAMMJJ, comparable

/**
 * Le vrai dernier ravitaillement du relais : les capsules « perdues » sont venues jusqu'à L7, et le
 * code de la porte s'est mis à jour à chacune. La plus récente date du 26/08/2097.
 */
export function dernierRavitaillement() {
  return [RAVITAILLEMENTS.dernier, ...CAPSULES.map(c => c.date)].sort((a, b) => jour(a).localeCompare(jour(b))).pop();
}

export const jugeE8 = code => code === codeAcces(dernierRavitaillement());

/** Le refus de la porte : le code du dernier ravitaillement officiel a son message à lui. */
export const refusE8 = code => (code === codeAcces(RAVITAILLEMENTS.dernier) ? REFUS.E8.remplace : REFUS.E8.ferme);

// ---------------------------------------------------------------- E9

/** Oxygène du retour pour n personnes, en kg : personnes × jours de voyage × consommation. */
export const oxygeneRetour = personnes => personnes * MARTINET.retour * MARTINET.consommation;

/** Les bouteilles du relais à embarquer : juste de quoi compléter la réserve du Martinet pour deux. */
export function bouteillesE9() {
  const manque = oxygeneRetour(2) - MARTINET.oxygene;
  return Math.ceil(Math.round(manque / VIE.oxygeneBouteille * 1000) / 1000);
}

/**
 * Masse au départ (manuel, Calcul du retour) : le Martinet, plus Irène, plus les bouteilles, moins le
 * matériel « à rapporter : NON » laissé sur L7. Irène pèse 54 kg aujourd'hui ; le rapport de 2095 dit 61.
 */
export function masseE9(masseIrene = IRENE.masse, bouteilles = bouteillesE9()) {
  const laisse = MARTINET.soute.filter(o => !o.rapporter).reduce((t, o) => t + o.masse, 0);
  return MARTINET.masse + masseIrene + bouteilles * VIE.masseBouteille - laisse;
}

/** La durée de poussée que donne la table du manuel, ou null si le retour est impossible. */
export function pousseeE9(masse) {
  const ligne = POUSSEE.find(l => (l.min === undefined || masse >= l.min) && (l.max === undefined || masse <= l.max));
  return ligne.duree;
}

/** Le refus d'un calcul de retour (bouteilles, puis poussée en minutes et secondes), ou null s'il est juste. */
export function refusE9(bouteilles, minutes, secondes) {
  const b = bouteillesE9();
  if (bouteilles === '' || +bouteilles < b) return REFUS.E9.oxygene;
  if (+bouteilles > b) return REFUS.E9.bouteille;
  const [m, s] = pousseeE9(masseE9()).match(/\d+/g);
  if (minutes !== m || secondes !== s) return REFUS.E9.poussee;
  return null;
}

export const jugeE9 = (bouteilles, minutes, secondes) => refusE9(bouteilles, minutes, secondes) === null;

// ---------------------------------------------------------------- les dates

/** Nombre de jours entre deux dates JJ/MM/AAAA. */
export function jours(de, a) {
  const t = d => Date.UTC(+d.slice(6), +d.slice(3, 5) - 1, +d.slice(0, 2));
  return Math.round((t(a) - t(de)) / 86400000);
}
