// LATENCE : les cinq fins. Chacune s'affiche horloge arrêtée : le récit, puis la page FIN, avec son image,
// l'heure de départ, le nombre d'indices utilisés et les succès obtenus. On ne quitte la fin qu'en
// demandant une nouvelle partie, par deux ENVOI de suite sur la page FIN.
import { center } from '../../../engine/index.js';
import { title, para, footer, tag, wrap } from '../../../game/ui.js';
import { hms } from '../../../game/state.js';
import { JOUR } from '../data.js';
import { FINS, SUCCES } from '../recit.js';
import { ecusson, retourTerre } from '../art.js';

/** Termine la partie : les succès d'abord, pour que l'écran de fin les montre. */
export function terminer(g, fin) {
  if (fin === 'deux-etoiles') g.achieve('deux-etoiles');
  if (g.s.timed && g.s.hintsUsed() === 0) g.achieve('sans-filet');
  g.finish(fin, 'fin');
}

/** Le départ, définitif : avec ou sans Irène, L7 remis en service ou toujours muet. */
export function depart(g, avecIrene) {
  g.unlock('depart');
  const service = !!g.s.flags.service;
  if (avecIrene) terminer(g, service ? 'deux-etoiles' : 'la-muette');
  else terminer(g, service ? 'toujours-en-ligne' : 'silence-radio');
}

const HAUT = 5, BAS = 21;   // le récit ; dessous, les touches (23)
const SOUS_ECUSSON = 9;      // première rangée du récit sous l'écusson

/** Place des paragraphes à partir de la rangée r : [[rangée, lignes], …]. */
function place(blocs, r) {
  return blocs.map(lignes => {
    const bloc = [r, lignes];
    r += lignes.length + 1;
    return bloc;
  });
}

/** La dernière rangée occupée par des paragraphes placés. */
const derniereRangee = blocs => { const [r, lignes] = blocs[blocs.length - 1]; return r + lignes.length - 1; };

/**
 * Le récit de la fin, réparti en pages : [[rangée, lignes], …] par page. L'écusson, s'il y en a un,
 * va sur la dernière page, à côté de la dernière phrase.
 */
function pagesDeFin(g) {
  const f = FINS[g.s.ending];
  const pages = [[]];
  for (const t of f.texte(!!g.s.flags.revelation)) {
    const lignes = wrap(g.accord(t), 38);
    const page = pages[pages.length - 1];
    if (page.length && derniereRangee(place([...page, lignes], HAUT)) > BAS) pages.push([lignes]);
    else page.push(lignes);
  }
  if (f.etoiles) {
    const derniere = pages[pages.length - 1];
    if (derniereRangee(place(derniere, SOUS_ECUSSON)) > BAS && derniere.length > 1) pages.push([derniere.pop()]);
  }
  return pages.map((blocs, i) => place(blocs, f.etoiles && i === pages.length - 1 ? SOUS_ECUSSON : HAUT));
}

/** La page FIN : l'image (rangées 2 à 12), sa légende, FIN en grand, le bilan, les touches. */
function pageFin(g, p) {
  const depart = !!g.s.flags.depart;
  retourTerre(p, 2, 11, { martinet: depart });
  if (depart) p.at(13, center('Retour vers la Terre.')).fg(6).text('Retour vers la Terre.');
  p.at(16, 18).size(3).text('FIN');
  const quand = depart ? `Départ à ${hms(g.s.times.depart)}.` : `Fenêtre fermée à ${hms(JOUR.fin)}.`;
  p.at(18, 2).fg(6).text(quand);
  p.at(19, 2).fg(6).text(`Indices utilisés : ${g.s.hintsUsed()}.`);
  const succes = g.s.achieved.map(id => SUCCES[id]).join(', ') || 'aucun';
  para(p, 20, `Succès : ${succes}.`, { fg: 6, gap: 0 });
  footer(p, [['ENVOI', 'nouvelle partie'], ['RETOUR', 'récit']]);
}

const fin = {
  frozen: true,
  enter(g) {
    g.vars.recommencer = false;
    if (g.s.flags.depart) g.sound('depart');
  },
  /** Le récit, puis la page FIN. */
  pages: g => (FINS[g.s.ending] ? pagesDeFin(g).length + 1 : 1),
  render(g, p, page) {
    const f = FINS[g.s.ending];
    if (!f) return;
    const pages = pagesDeFin(g);
    if (page === pages.length) { pageFin(g, p); return; }
    if (pages.length > 1) tag(p, `${page + 1}/${pages.length}`);
    title(p, f.titre);
    if (page === pages.length - 1 && f.etoiles) ecusson(p, 2, 31, f.etoiles);
    for (const [r, lignes] of pages[page]) lignes.forEach((l, i) => p.at(r + i, 2).text(l));
    footer(p, page ? [['SUITE', 'la suite'], ['RETOUR', 'page précédente']] : [['SUITE', 'la suite']]);
  },
  /** ENVOI tourne les pages du récit ; sur la page FIN, il faut l'appuyer deux fois pour recommencer. */
  key(g, k) {
    const demande = g.vars.recommencer;
    g.vars.recommencer = false;
    if (k !== 'envoi') return false;
    if (g.page < g.pages() - 1) {
      g.page++;
      g.draw();
    } else if (demande) {
      g.newGame({ timed: g.s.timed });
    } else {
      g.vars.recommencer = true;
      g.flash('ENVOI encore une fois : nouvelle partie.');
    }
    return true;
  },
};

export default { fin };
