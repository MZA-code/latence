// Repli sans WebGL : trame teintée agrandie au plus proche voisin.
// Les lignes de balayage sont alors dessinées en CSS (classe .no-gl sur l'écran).
import { W, H, MARGIN } from '../constants.js';

export class Crt2D {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.off = document.createElement('canvas');
    this.off.width = W;
    this.off.height = H;
    this.octx = this.off.getContext('2d');
    this.img = this.octx.createImageData(W, H);
  }

  draw(data, P) {
    const d = this.img.data, t = P.tint;
    for (let i = 0, j = 0; i < W * H; i++, j += 4) {
      const f = Math.min(1, (data[i] / 255) * P.gain + P.flash);
      d[j] = Math.min(255, t[0] * f * 255);
      d[j + 1] = Math.min(255, t[1] * f * 255);
      d[j + 2] = Math.min(255, t[2] * f * 255);
      d[j + 3] = 255;
    }
    this.octx.putImageData(this.img, 0, 0);
    const cw = this.cv.width, ch = this.cv.height;
    const rw = cw / (1 + 2 * MARGIN), rh = ch / (1 + 2 * MARGIN);
    const ctx = this.ctx;
    ctx.clearRect(0, 0, cw, ch);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(this.off, MARGIN * rw, MARGIN * rh, rw, rh);
  }
}
