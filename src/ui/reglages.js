// Réglages de l'écran sur la page du jeu : un volet caché à droite (phosphore, courbure du verre,
// balayage, halo, rémanence). Ils s'appliquent en direct au tube et se gardent avec les préférences.
// Rien qui touche au jeu : pas de nuancier des gris, qui donnerait hors de l'écran la clé d'une énigme.
import { voletLateral } from './volet.js';

/** Les curseurs du tube et leurs bornes, comme dans le banc d'essai. */
export const CURSEURS = {
  curv: { min: 0, max: 0.3 },
  scan: { min: 0, max: 1 },
  bloom: { min: 0, max: 1 },
  persist: { min: 0, max: 1 },
};
const PHOSPHORES = ['blanc', 'vert'];

/**
 * Des réglages sûrs à partir de ce que le navigateur a gardé : une valeur absente, d'un mauvais type
 * ou un phosphore inconnu reprend sa valeur d'origine, une valeur hors bornes la borne la plus proche.
 */
export function reglagesValides(gardes, origine) {
  const g = gardes || {};
  const r = { phos: PHOSPHORES.includes(g.phos) ? g.phos : origine.phos };
  for (const [cle, { min, max }] of Object.entries(CURSEURS)) {
    const v = g[cle];
    r[cle] = typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : origine[cle];
  }
  return r;
}

/** Applique les réglages au terminal. */
export function appliquer(minitel, r) {
  minitel.setPhosphor(r.phos);
  minitel.params.curv = r.curv;
  minitel.params.bloom = r.bloom;
  minitel.scan = r.scan;
  minitel.persistence = r.persist;
}

/** Les réglages d'un terminal neuf : ses valeurs d'origine, avant toute préférence. */
export function reglagesDuTerminal(minitel) {
  return { phos: minitel.phosphor, curv: minitel.params.curv, scan: minitel.scan, bloom: minitel.params.bloom, persist: minitel.persistence };
}

/**
 * Le volet des réglages (voir src/ui/volet.js) : le phosphore, puis un curseur par réglage du tube.
 * @param {{ bouton: HTMLElement, volet: HTMLElement, reglages: object, origine: object,
 *           onChange: (reglages: object) => void }} o
 */
export function bindVolet({ bouton, volet, reglages, origine, onChange }) {
  const $ = sel => volet.querySelector(sel);
  const radios = [...volet.querySelectorAll('[data-phos]')];
  const curseurs = Object.keys(CURSEURS).map(cle => ({ cle, input: $(`[data-reglage="${cle}"]`), sortie: $(`[data-sortie="${cle}"]`) }));

  function afficher() {
    for (const r of radios) {
      const choisi = r.dataset.phos === reglages.phos;
      r.setAttribute('aria-checked', String(choisi));
      r.tabIndex = choisi ? 0 : -1;
    }
    for (const { cle, input, sortie } of curseurs) {
      input.value = reglages[cle];
      sortie.textContent = Number(reglages[cle]).toFixed(2);
    }
  }

  function changer(cle, valeur) {
    reglages[cle] = valeur;
    afficher();
    onChange(reglages);
  }

  for (const { cle, input } of curseurs) {
    Object.assign(input, { min: CURSEURS[cle].min, max: CURSEURS[cle].max, step: 0.01 });
    input.addEventListener('input', () => changer(cle, parseFloat(input.value)));
  }
  // Le phosphore : un groupe de deux boutons radio, que les flèches parcourent
  radios.forEach((r, i) => {
    r.addEventListener('click', () => changer('phos', r.dataset.phos));
    r.addEventListener('keydown', e => {
      if (!e.key.startsWith('Arrow')) return;
      e.preventDefault();
      const suivant = radios[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? radios.length - 1 : 1)) % radios.length];
      changer('phos', suivant.dataset.phos);
      suivant.focus();
    });
  });
  $('[data-volet="origine"]').addEventListener('click', () => {
    Object.assign(reglages, origine);
    afficher();
    onChange(reglages);
  });
  voletLateral({ bouton, volet, focus: () => radios.find(r => r.tabIndex === 0) });
  afficher();
}
