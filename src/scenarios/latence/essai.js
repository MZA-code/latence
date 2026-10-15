// LATENCE : le rapport d'essai (docs/latence/essais.md). Il met en forme le journal de la partie, tenu
// par le moteur : la durée de chaque acte, chaque étape avec le temps réel passé avant elle, les refus et
// les indices de cet intervalle, et les scènes où le joueur s'attarde. Il ne s'affiche qu'avec ?essai.
import { hms } from '../../game/state.js';
import { FINS } from './recit.js';

/** Le nom de chaque étape du journal. */
const ETAPES = {
  e1: 'Connexion au serveur de bord (E1)',
  e2: 'Antenne rebranchée (E2)',
  e3: 'Récepteur synchronisé (E3)',
  e4: 'Liaison avec la Terre confirmée (E4)',
  zone: 'Arrivée dans la zone de jonction',
  e5: 'Jonction réussie (E5)',
  e6: 'Serveur du relais ouvert (E6)',
  e7: 'Plan de fréquences validé (E7)',
  f2: 'Mot de contrôle de F2 renvoyé',
  demasquee: 'Irène démasquée',
  e8: 'Quartiers de garde ouverts (E8)',
  revelation: 'Révélation : entrée dans les quartiers',
  cle2: 'Clé 2 remise par Irène',
  service: 'L7 remis en service',
  e9: 'Retour à deux calculé (E9)',
  depart: 'Départ',
};

/** Les actes : l'étape qui les ouvre (aucune : le début de la partie) et celle qui les ferme (aucune : la fin). */
const ACTES = [
  ['Acte I   l\'approche', null, 'e5'],
  ['Acte II  le relais', 'e5', 'revelation'],
  ['Acte III la Muette', 'revelation', null],
];

/** Une durée en secondes, arrondie : « 45 s », « 1 min 30 s », « 1 h 02 min ». */
export function duree(secondes) {
  const s = Math.max(0, Math.round(secondes));
  if (s < 60) return `${s} s`;
  if (s < 3600) return `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`;
  return `${Math.floor(s / 3600)} h ${String(Math.floor((s % 3600) / 60)).padStart(2, '0')} min`;
}

/** Des indices par objectif : « O2 ×2, O4 ». */
function parObjectif(objectifs) {
  const n = {};
  for (const o of objectifs) n[o] = (n[o] || 0) + 1;
  return Object.entries(n).map(([o, k]) => (k > 1 ? `${o} ×${k}` : o)).join(', ');
}

/** Le rapport d'essai de la partie en cours ou terminée, en texte. */
export function rapport(g) {
  const s = g.s, journal = s.journal;
  const maintenant = Math.round(s.elapsedMs / 1000);
  const fin = journal.find(e => e.e === 'fin');
  const finR = fin ? fin.r : maintenant;
  const etape = flag => journal.find(e => e.e === 'etape' && e.f === flag);
  const refus = journal.filter(e => e.e === 'refus').length;
  const personnage = { m: 'technicien', f: 'technicienne' }[s.gender] || 'personnage non choisi';
  const l = [
    'LATENCE : rapport d\'essai',
    `Partie ${s.timed ? 'chronométrée' : 'sans chrono'}, ${personnage}.`,
    fin ? `Fin : ${FINS[fin.f] ? FINS[fin.f].titre : fin.f}, à ${hms(fin.t)}.` : `Partie en cours, à ${hms(s.time())}.`,
    `Temps réel joué : ${duree(finR)}. Indices : ${s.hintsUsed()}${s.timed ? ` (${s.penalty} min)` : ''}. Refus : ${refus}.`,
  ];

  l.push('', 'Les actes, en temps réel joué');
  for (const [nom, ouverture, fermeture] of ACTES) {
    const a = ouverture ? etape(ouverture) : { r: 0, t: s.clock.start * 60 };
    if (!a) {
      l.push(`${nom.padEnd(22)}pas commencé`);
      continue;
    }
    const b = (fermeture && etape(fermeture)) || fin;
    l.push(`${nom.padEnd(22)}${hms(a.t)} → ${b ? hms(b.t) : '…'}   ${b ? duree(b.r - a.r) : `en cours, depuis ${duree(maintenant - a.r)}`}`);
  }

  l.push('', 'Les étapes : heure du jeu, temps réel depuis l\'étape précédente, refus et indices entre les deux');
  let precedent = 0, refusIci = [], indicesIci = [];
  const ligne = (t, r, nom) => {
    const details = [];
    if (refusIci.length) details.push(`refus : ${refusIci.length} (${[...new Set(refusIci)].join(', ')})`);
    if (indicesIci.length) details.push(`indices : ${parObjectif(indicesIci)}`);
    l.push(`${hms(t)}  ${('+' + duree(r - precedent)).padEnd(13)}${nom}${details.length ? '   ' + details.join(', ') : ''}`);
    precedent = r;
    refusIci = [];
    indicesIci = [];
  };
  for (const e of journal) {
    if (e.e === 'refus') refusIci.push(e.s);
    else if (e.e === 'indice') indicesIci.push(e.o);
    else if (e.e === 'etape') ligne(e.t, e.r, ETAPES[e.f] || e.f);
    else if (e.e === 'fin') ligne(e.t, e.r, `Fin : ${FINS[e.f] ? FINS[e.f].titre : e.f}`);
  }
  if (!fin) ligne(s.time(), maintenant, '(en cours)');

  l.push('', 'Les scènes où le joueur est resté le plus longtemps, en temps réel');
  const scenes = journal.filter(e => e.e === 'scene'), temps = {};
  scenes.forEach((e, i) => {
    temps[e.s] = (temps[e.s] || 0) + ((scenes[i + 1] ? scenes[i + 1].r : finR) - e.r);
  });
  Object.entries(temps).filter(([, d]) => d > 0).sort((a, b) => b[1] - a[1]).slice(0, 8)
    .forEach(([id, d]) => l.push(`${id.padEnd(22)}${duree(d)}`));
  return l.join('\n');
}
