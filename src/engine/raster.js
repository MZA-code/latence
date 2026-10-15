// Tramage : mémoire de page → 320 × 250 luminances, puis rémanence du phosphore.
// Les attributs de zone (fond, soulignement, masquage) sont résolus rangée par rangée,
// de gauche à droite, comme le fait le processeur de visualisation.
import { W, H, ROWS, COLS, GREY, MOS_BITS, MOS_Y0 } from './constants.js';
import { glyph } from './font.js';
import { T_MOSAIC, T_DELIM, F_BLINK, F_INVERSE, F_LINE, F_MASK } from './screen.js';

export class Raster {
  /** @param {import('./screen.js').Screen} screen */
  constructor(screen) {
    this.s = screen;
    this.lum = new Float32Array(W * H);   // image instantanée
    this.glow = new Float32Array(W * H);  // image avec rémanence
    this.tex = new Uint8Array(W * H);     // envoyée au shader
  }

  fillCell(x0, y0, L) {
    const lum = this.lum;
    for (let y = 0; y < 10; y++) {
      const o = (y0 + y) * W + x0;
      for (let x = 0; x < 8; x++) lum[o + x] = L;
    }
  }

  drawMosaic(x0, y0, code, sep, fgL, bgL) {
    const lum = this.lum;
    for (let y = 0; y < 10; y++) {
      const br = y < 3 ? 0 : (y < 7 ? 1 : 2);
      const gapY = sep && y === MOS_Y0[br];          // disjoint : 3 barres horizontales
      const o = (y0 + y) * W + x0;
      for (let x = 0; x < 8; x++) {
        const on = !gapY && !(sep && (x & 3) === 0) && (code & MOS_BITS[br * 2 + (x >> 2)]);
        lum[o + x] = on ? fgL : bgL;
      }
    }
  }

  drawAlpha(x0, y0, g, part, fgL, bgL, underline) {
    const lum = this.lum;
    const dw = part & 3, dh = (part >> 2) & 3;
    for (let y = 0; y < 10; y++) {
      const row = g[dh ? (y >> 1) + (dh === 2 ? 5 : 0) : y];
      const under = underline && y === 9 && dh !== 1;  // soulignement toujours en simple hauteur
      const o = (y0 + y) * W + x0;
      for (let x = 0; x < 8; x++) {
        const gx = dw ? (x >> 1) + (dw === 2 ? 4 : 0) : x;
        lum[o + x] = (under || (row & (0x80 >> gx))) ? fgL : bgL;
      }
    }
  }

  /**
   * @param {number} now horloge en ms (clignotements)
   * @param {{ on: boolean, r: number, c: number }} cursor
   */
  draw(now, cursor) {
    const s = this.s;
    const blinkPhase = ((now / 1000) | 0) % 2 === 0;                 // clignotement à 0,5 Hz
    const curOn = cursor.on && ((now / 420) | 0) % 2 === 0;            // pavé clignotant
    const curI = cursor.r * 40 + cursor.c - 1;
    for (let r = 0; r < ROWS; r++) {
      let zBg = 0, zUl = false, zMask = false;                        // attributs de zone
      for (let c = 0; c < COLS; c++) {
        const i = r * 40 + c, t = s.t[i], fl = s.fl[i];
        const x0 = c * 8, y0 = r * 10, isCur = curOn && i === curI;
        if (t === T_DELIM) {
          zBg = s.b[i]; zUl = (fl & F_LINE) !== 0; zMask = (fl & F_MASK) !== 0;
          let col = (fl & F_INVERSE) ? s.f[i] : zBg;
          if (isCur) col = 7 - col;                                   // couleur complémentaire
          this.fillCell(x0, y0, GREY[col]);
        } else if (t === T_MOSAIC) {
          zBg = s.b[i]; zUl = false;
          let f = s.f[i], b = s.b[i];
          if (isCur) { f = 7 - f; b = 7 - b; }
          const vis = !(fl & F_BLINK) || blinkPhase;
          this.drawMosaic(x0, y0, s.c[i], (fl & F_LINE) !== 0, vis ? GREY[f] : GREY[b], GREY[b]);
        } else {
          let f = s.f[i], b = zBg;
          const inv = (fl & F_INVERSE) !== 0;
          if (inv) { const k = f; f = b; b = k; }
          if (isCur) { f = 7 - f; b = 7 - b; }
          const code = s.c[i];
          const masked = zMask && !s.reveal;
          // en fond inversé, la phase du clignotement est inversée ; l'espace ne clignote pas
          const blinkVis = (fl & F_BLINK) && code !== 0x20 ? (blinkPhase !== inv) : true;
          this.drawAlpha(x0, y0, glyph(s.s[i], code, s.a[i]), s.p[i],
            (!masked && blinkVis) ? GREY[f] : GREY[b], GREY[b], zUl && !masked);
        }
      }
    }
  }

  /** Rémanence : chaque point décroît avec la constante de temps tau (ms). */
  persist(dt, tau) {
    const k = tau > 1 ? Math.exp(-dt / tau) : 0;
    const { lum, glow, tex } = this;
    for (let i = 0; i < W * H; i++) {
      const v = lum[i], p = glow[i] * k, o = v > p ? v : p;
      glow[i] = o;
      tex[i] = (o * 255 + 0.5) | 0;
    }
  }

  /** Recopie l'image instantanée sans fondu (démarrage). */
  prime() { this.glow.set(this.lum); }

  clearGlow() { this.glow.fill(0); }
}
