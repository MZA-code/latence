// LATENCE : mise en page commune aux écrans du jeu (rangées : docs/latence/interface.md).
import { vlen } from '../../engine/index.js';
import { menuLine } from '../../game/ui.js';
import { hms } from '../../game/state.js';

/** Un nombre à la française : 4 100, 0,84, 100 000 000 (espaces insécables entre les milliers). */
export function nombre(n, decimales = 0) {
  const [entier, dec] = n.toFixed(decimales).split('.');
  const milliers = entier.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
  return dec ? milliers + ',' + dec : milliers;
}

/** Une heure officielle écrite comme Irène l'écrit à la main : 08:30 donne 8h30, 15:45 donne 15h45. */
export const aLaMain = hhmm => hhmm.replace(/^0?(\d+):(\d\d)$/, '$1h$2');

/** Une heure notée par la partie (14:03:27), ou des tirets si ce n'est pas encore arrivé. */
export const heureNotee = t => (t === undefined ? '--:--:--' : hms(t));

/** Champ du choix d'un menu, tel que choicePrompt() le dessine à la rangée r. */
export const choix = (r, len = 1) => ({ r, c: 17, len, kind: 'digits' });

/** Ligne de menu : l'état va à droite s'il tient sur la rangée, sinon sur la rangée suivante. */
export function item(p, r, n, label, etat = '') {
  if (etat && 7 + vlen(label) + 1 + vlen(etat) > 39) {
    menuLine(p, r, n, label);
    p.at(r + 1, 7).fg(4).text(etat);
  } else {
    menuLine(p, r, n, label, etat);
  }
}

/** Une touche en vidéo inverse suivie de son effet, comme au pied de page, à une place donnée. */
export function touche(p, r, c, k, effet) {
  p.at(r, c).inv().text(' ' + k + ' ').inv(false).fg(6).text(' ' + effet);
}

/** Le début d'un texte qui tient dans la largeur donnée (en colonnes), coupé au dernier mot entier. */
export function debut(texte, largeur) {
  if (vlen(texte) <= largeur) return texte;
  let out = '';
  for (const mot of texte.split(' ')) {
    const suite = out ? out + ' ' + mot : mot;
    if (vlen(suite) > largeur) break;
    out = suite;
  }
  return out;
}

/** Un groupe de mots qui ne se coupe pas en fin de ligne : « 11 min 06 s ». */
export const insecable = s => s.replace(/ /g, '\u00a0');
