// Mode essai (?essai) : un bouton « Rapport d'essai » dans l'en-tête ouvre un volet avec le rapport de la
// partie (scenario.rapport), à copier ou à télécharger pour l'auteur (docs/latence/essais.md). Il vit hors
// de l'écran du terminal et n'existe qu'en mode essai, comme ?debug : il dévoile toute l'histoire.
import { voletLateral } from './volet.js';

/** Un élément, ses attributs et son contenu (texte ou éléments) : tout passe par le DOM, jamais par du HTML. */
function el(nom, attributs = {}, ...enfants) {
  const e = document.createElement(nom);
  for (const [k, v] of Object.entries(attributs)) e.setAttribute(k, v);
  e.append(...enfants);
  return e;
}

/**
 * @param {{ outils: HTMLElement, rapport: () => string }} o
 *   outils : la place du bouton dans l'en-tête ; rapport : le texte du rapport, relu à chaque ouverture
 */
export function monterEssai({ outils, rapport }) {
  outils.append(el('button', { type: 'button', class: 'tool', id: 'tEssai', 'aria-controls': 'voletEssai', 'aria-expanded': 'false' },
    'Rapport d\'essai'));
  document.body.append(el('aside', { class: 'volet volet--large', id: 'voletEssai', 'aria-labelledby': 'essaiTitre', tabindex: '-1', 'data-garde-touches': '' },
    el('div', { class: 'volet-tete' },
      el('h2', { class: 'volet-titre', id: 'essaiTitre' }, 'Rapport d\'essai'),
      el('button', { type: 'button', class: 'tool', 'data-volet': 'fermer' }, 'Fermer')),
    el('section', { class: 'block' },
      el('div', { class: 'row' },
        el('button', { type: 'button', class: 'btn', 'data-essai': 'copier' }, 'Copier'),
        el('button', { type: 'button', class: 'btn btn--quiet', 'data-essai': 'telecharger' }, 'Télécharger')),
      el('pre', { class: 'rapport', tabindex: '0' }))));
  const volet = document.getElementById('voletEssai');
  const texte = volet.querySelector('.rapport');
  const copier = volet.querySelector('[data-essai="copier"]');

  voletLateral({
    bouton: document.getElementById('tEssai'),
    volet,
    focus: () => copier,
    onOpen: () => { texte.textContent = rapport(); },
  });

  copier.addEventListener('click', async () => {
    texte.textContent = rapport();
    try {
      await navigator.clipboard.writeText(texte.textContent);
      copier.textContent = 'Copié';
    } catch (e) {
      // Sans presse-papiers (page non sécurisée…) : le texte est sélectionné, à copier à la main
      const plage = document.createRange();
      plage.selectNodeContents(texte);
      getSelection().removeAllRanges();
      getSelection().addRange(plage);
      copier.textContent = 'Sélectionné';
    }
    setTimeout(() => { copier.textContent = 'Copier'; }, 2000);
  });

  volet.querySelector('[data-essai="telecharger"]').addEventListener('click', () => {
    texte.textContent = rapport();
    const url = URL.createObjectURL(new Blob([texte.textContent + '\n'], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `latence-essai-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}
