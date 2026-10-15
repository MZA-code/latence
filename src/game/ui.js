// Mise en page des écrans du jeu : titres, paragraphes justifiés à gauche, pied de page des touches.
import { vlen } from '../engine/index.js';

/**
 * Typographie française : espace insécable avant « : ; ! ? », guillemets collés au texte
 * (le Minitel n'a pas de guillemets français : l'encodeur les remplace par ").
 */
export function typo(text) {
  return text
    .replace(/« /g, '«').replace(/ »/g, '»')
    .replace(/ ([:;!?])/g, '\u00a0$1');
}

/**
 * Accords du personnage : « seul{|e} », « {technicien|technicienne} ». La première forme sert
 * au masculin, et tant que le personnage n'est pas choisi ; la seconde au féminin.
 * À réserver aux textes : en G0, les caractères { | } dessinent aussi des filets.
 */
export function accord(text, gender) {
  return text.replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m, f) => (gender === 'f' ? f : m));
}

/** Coupe un texte en lignes de largeur maximale (en colonnes Minitel), sur les espaces ordinaires. */
export function wrap(text, width) {
  const lines = [];
  let line = '';
  for (const word of typo(text).split(/ +/).filter(Boolean)) {
    const next = line ? line + ' ' + word : word;
    if (vlen(next) <= width) line = next;
    else { if (line) lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * Écrit un paragraphe à partir de la rangée r. Renvoie la rangée suivante, après `gap` rangées vides.
 * @param {import('../engine/vdt.js').Vdt} p
 */
export function para(p, r, text, { c = 2, width = 38, fg = 7, gap = 1 } = {}) {
  for (const l of wrap(text, width)) {
    p.at(r, c);
    if (fg !== 7) p.fg(fg);
    p.text(l);
    r++;
  }
  return r + gap;
}

/** Plusieurs paragraphes collés ; une chaîne vide insère une rangée vide. */
export function paras(p, r, list, opts = {}) {
  for (const t of list) {
    if (t === '') r++;
    else r = para(p, r, t, { ...opts, gap: 0 });
  }
  return r;
}

/** Titre en double hauteur (occupe la rangée r − 1 et la rangée r). */
export function title(p, text, r = 3, c = 2) {
  p.at(r, c).size(1).text(text);
}

/** Petite étiquette en haut à droite (rangée 1), ex. « 1/3 ». */
export function tag(p, text) {
  p.at(1, 41 - vlen(text)).fg(4).text(text);
}

/**
 * Pied de page en rangée 23 : touches en vidéo inverse suivies de leur effet.
 * @param {Array<[string, string]>} items
 */
export function footer(p, items) {
  let c = 2;
  for (const [k, label] of items) {
    const w = vlen(k) + 2 + 1 + vlen(label);
    if (c + w - 1 > 40) break;
    p.at(23, c).inv().text(' ' + k + ' ').inv(false).fg(6).text(' ' + label);
    c += w + 2;
  }
}

/** Filet horizontal (caractère 0x60 du Minitel, filet médian). */
export function rule(p, r, c = 1, len = 40) {
  p.at(r, c).fg(4).text('`'.repeat(len));
}

/** Ligne de menu : numéro en vidéo inverse, libellé, état discret à droite. */
export function menuLine(p, r, n, label, state = '') {
  p.at(r, 3).inv().text(' ' + n + ' ').inv(false);
  p.at(r, 7).text(label);
  if (state) p.at(r, 39 - vlen(state)).fg(4).text(state);
}

/** Libellé de champ de choix standard « Votre choix : . puis ENVOI ». Renvoie le champ. */
export function choicePrompt(p, r, len = 1) {
  p.at(r, 3).text('Votre choix :');
  p.at(r, 18 + len).text('puis ').inv().text(' ENVOI ');
  return { r, c: 17, len, kind: 'digits' };
}
