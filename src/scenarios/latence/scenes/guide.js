// LATENCE : le guide (touche GUIDE). Trois indices par objectif, du plus vague au plus précis, chacun
// contre 3 minutes ; un indice obtenu se relit gratuitement.
import { title, para, footer } from '../../../game/ui.js';
import { objectifEnCours } from '../indices.js';

const guide = {
  render(g, p) {
    title(p, 'GUIDE');
    const o = objectifEnCours(g);
    if (!o) {
      para(p, 6, 'Plus aucun objectif.');
      footer(p, [['RETOUR', 'revenir']]);
      return;
    }
    let r = para(p, 5, `Objectif : ${o.titre}.`, { fg: 6 });
    const n = g.hintLevel(o.id);
    for (let i = 0; i < n; i++) r = para(p, r, `${i + 1}. ${g.accord(o.indices[i])}`);
    if (n < 3) {
      const prix = g.s.timed
        ? `Chaque indice avance l'horloge de ${g.sc.hintPenalty} minutes.`
        : 'Mode sans chrono : les indices sont gratuits.';
      para(p, 20, prix, { fg: 4 });
      footer(p, [['ENVOI', n ? 'un autre indice' : 'un indice'], ['RETOUR', 'revenir']]);
    } else {
      para(p, 20, 'Vous avez les trois indices de cet objectif.', { fg: 4 });
      footer(p, [['RETOUR', 'revenir']]);
    }
  },
  key(g, k) {
    if (k !== 'envoi') return false;
    const o = objectifEnCours(g);
    if (o && g.takeHint(o.id)) g.draw();
    else g.bell();
    return true;
  },
};

export default { guide };
