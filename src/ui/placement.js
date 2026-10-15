// Pose l'écran (trame + marge) sur un quadrilatère de la scène, par homographie.
// Les coins sont en fraction de la scène : [[x, y] haut gauche, haut droit, bas droit, bas gauche].
import { MARGIN } from '../engine/index.js';
import { homography, dist } from './homography.js';

/** Coins de la trame dans le cadre neutre (sans photo). */
export const TUBE_CORNERS = [[0.12, 0.11], [0.88, 0.11], [0.88, 0.89], [0.12, 0.89]];

/** Coins de la trame quand l'écran remplit toute la scène, sans boîtier (téléphone) : la trame touche presque
 *  les bords ; la marge noire du tube déborde de la scène, qui la rogne. */
export const PLEIN_CORNERS = [[0.012, 0.012], [0.988, 0.012], [0.988, 0.988], [0.012, 0.988]];

/** Les coins dans le calage exporté par le banc (« Copier le calage »), dans l'ordre de placeScreen. */
const CALAGE = ['hautGauche', 'hautDroit', 'basDroit', 'basGauche'];

/** Coins d'un calage du banc, nommés et en % de la photo, en fractions pour placeScreen. */
export function cornersFromCalage(calage) {
  return CALAGE.map(nom => calage.coins[nom].map(p => p / 100));
}

/**
 * @param {{ stage: HTMLElement, screenEl: HTMLElement, canvas: HTMLCanvasElement, corners?: number[][],
 *           tube?: HTMLElement }} o
 *   tube : le cadre neutre, qui peut être plus large que 4:3 ; les coins se lisent alors dans un 4:3 centré
 *   sur le tube. Masqué (avec la photo), il ne compte plus et les coins se lisent dans la scène.
 */
export function placeScreen({ stage, screenEl, canvas, corners = TUBE_CORNERS, tube = null }) {
  let current = corners;

  function layout() {
    const rect = stage.getBoundingClientRect();
    let SW = Math.max(1, rect.width), SH = Math.max(1, rect.height), x0 = 0, y0 = 0;
    if (tube && tube.offsetWidth) {
      const t = tube.getBoundingClientRect();
      SW = Math.min(t.width, t.height * 4 / 3);
      SH = Math.min(t.height, t.width * 3 / 4);
      x0 = t.left - rect.left + (t.width - SW) / 2;
      y0 = t.top - rect.top + (t.height - SH) / 2;
    }
    const P = current.map(([u, v]) => [x0 + u * SW, y0 + v * SH]);
    const rw = Math.max(32, (dist(P[0], P[1]) + dist(P[3], P[2])) / 2);
    const rh = Math.max(24, (dist(P[0], P[3]) + dist(P[1], P[2])) / 2);
    const m = MARGIN, ew = rw * (1 + 2 * m), eh = rh * (1 + 2 * m);
    screenEl.style.width = ew + 'px';
    screenEl.style.height = eh + 'px';
    const src = [[m * rw, m * rh], [m * rw + rw, m * rh], [m * rw + rw, m * rh + rh], [m * rw, m * rh + rh]];
    const M = homography(src, P);
    if (M) screenEl.style.transform = 'matrix3d(' + M.map(n => n.toFixed(9)).join(',') + ')';
    // Canvas à la taille affichée, plafonné pour ménager le GPU
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cw = Math.round(ew * dpr), ch = Math.round(eh * dpr);
    const k = Math.sqrt(Math.min(1, 3.2e6 / (cw * ch)));
    cw = Math.max(64, Math.round(cw * k));
    ch = Math.max(50, Math.round(ch * k));
    if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
  }

  const ro = new ResizeObserver(layout);
  ro.observe(stage);
  if (tube) ro.observe(tube);
  layout();
  return {
    layout,
    setCorners(c) { current = c; layout(); },
  };
}
