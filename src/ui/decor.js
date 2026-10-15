// Décor de la page sur grand écran : la photo du terminal autour de l'écran, des écussons de part et
// d'autre. Le scénario le décrit (scenario.decor) ; sur téléphone, ou sans photo, l'écran garde son tube
// dessiné en CSS. Tout est décoratif (alt vide, aria-hidden) : rien de ce qui sert au jeu n'est ici.
import { TUBE_CORNERS, cornersFromCalage } from './placement.js';

/** La photo n'apparaît qu'à partir de cette largeur d'écran (même seuil dans src/styles/game.css). */
export const WIDE = '(min-width: 600px)';

/** Hauteur maximale de la scène, en vh (voir .game .stage-wrap dans src/styles/game.css). */
const HAUTEUR = 74;

/** Les écussons d'un côté : une colonne, masquée par CSS quand la marge est trop étroite. */
function colonne(cote, liste) {
  const col = document.createElement('div');
  col.className = 'cote cote--' + cote;
  col.setAttribute('aria-hidden', 'true');
  for (const e of liste) {
    const img = document.createElement('img');
    img.className = 'ecusson';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.width = Math.round(e.largeur / 2);     // les fichiers sont au double de l'affichage
    img.height = Math.round(e.hauteur / 2);
    img.src = e.fichier;
    col.append(img);
  }
  return col;
}

/** La photo, en AVIF ou en WebP selon le navigateur, à la taille qui convient. */
function image(photo) {
  const pic = document.createElement('picture');
  const srcset = ext => photo.tailles.map(l => `${photo.fichier}-${l}.${ext} ${l}w`).join(', ');
  const sizes = Math.round(HAUTEUR * photo.largeur / photo.hauteur) + 'vh';
  const avif = document.createElement('source');
  avif.type = 'image/avif';
  avif.srcset = srcset('avif');
  avif.sizes = sizes;
  const img = document.createElement('img');
  img.className = 'photo';
  img.alt = '';
  img.decoding = 'async';
  img.sizes = sizes;
  img.srcset = srcset('webp');
  img.src = `${photo.fichier}-${photo.largeur}.webp`;
  pic.append(avif, img);
  return { pic, img };
}

/**
 * @param {{ decor?: { photo?: object, ecussons?: { gauche?: object[], droite?: object[] } },
 *           wrap: HTMLElement, stage: HTMLElement, screenEl: HTMLElement,
 *           minitel: import('../engine/minitel.js').Minitel, placement: { setCorners: (c: number[][]) => void } }} o
 */
export function mountDecor({ decor, wrap, stage, screenEl, minitel, placement }) {
  if (!decor) return;
  const large = matchMedia(WIDE);

  // Les écussons : créés au premier passage sur grand écran, pour qu'un téléphone ne les charge pas
  let ecussons = false;
  function poserEcussons() {
    if (ecussons || !large.matches) return;
    ecussons = true;
    const { gauche = [], droite = [] } = decor.ecussons || {};
    if (gauche.length) wrap.prepend(colonne('gauche', gauche));
    if (droite.length) wrap.append(colonne('droite', droite));
  }
  large.addEventListener('change', poserEcussons);
  poserEcussons();

  const photo = decor.photo;
  if (!photo) return;
  const coins = cornersFromCalage(photo.calage);
  const rendu = photo.calage.rendu || {};
  let charge = null;

  function poser(avecPhoto) {
    stage.classList.toggle('avec-photo', avecPhoto);
    if (avecPhoto) wrap.style.setProperty('--ar', (photo.largeur / photo.hauteur).toFixed(5));
    else wrap.style.removeProperty('--ar');
    // Du rendu du banc, la photo ne prend que l'incrustation : le reste du tube suit les réglages du joueur
    const opaque = avecPhoto && rendu.incrustation === 'opaque';
    screenEl.classList.toggle('is-opaque', opaque);
    minitel.params.opaque = opaque ? 1 : 0;
    placement.setCorners(avecPhoto ? coins : TUBE_CORNERS);
  }

  // La photo ne se charge que sur grand écran, et ne remplace le tube qu'une fois chargée
  function suivre() {
    if (!large.matches) { poser(false); return; }
    if (!charge) {
      const { pic, img } = image(photo);
      charge = new Promise(fini => {
        img.addEventListener('load', () => fini(true), { once: true });
        img.addEventListener('error', () => fini(false), { once: true });
      });
      stage.prepend(pic);
    }
    charge.then(ok => { if (ok && large.matches) poser(true); });
  }

  large.addEventListener('change', suivre);
  suivre();
}
