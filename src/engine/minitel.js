// Façade du moteur : mémoire de page + décodeur + ligne + tramage + tube + allumage.
// Le contenu (services, pages, jeu) ne parle qu'à cette classe.
import { H, MARGIN } from './constants.js';
import { Screen, T_ALPHA, F_INVERSE } from './screen.js';
import { Decoder } from './decoder.js';
import { Raster } from './raster.js';
import { Line } from './line.js';
import { Power } from './power.js';
import { CrtGL } from './crt/crt-gl.js';
import { Crt2D } from './crt/crt-2d.js';

/** Phosphores : P4 blanc (Minitel 1) et P1 vert. */
export const PHOSPHORS = {
  blanc: { tint: [0.84, 0.9, 1], hot: [0.3, 0.28, 0.22], ui: [217, 230, 255], label: 'phosphore P4', persist: 0.8 },
  vert: { tint: [0.2, 1, 0.42], hot: [0.55, 0.3, 0.45], ui: [124, 245, 165], label: 'phosphore P1', persist: 1.6 },
};

export class Minitel {
  /**
   * @param {{ canvas: HTMLCanvasElement, wrap: HTMLElement, screenEl: HTMLElement, reduced?: boolean }} o
   */
  constructor({ canvas, wrap, screenEl, reduced = false }) {
    this.canvas = canvas;
    this.reduced = reduced;
    this.screen = new Screen();
    this.decoder = new Decoder(this.screen, { bell: () => this.onBell() });
    this.line = new Line(b => this.decoder.feed(b));
    this.raster = new Raster(this.screen);
    /** Paramètres du shader. */
    this.params = {
      curv: 0.1, scan: 0.55, bloom: 0.45, gain: 1, flash: 0, time: 0, noise: reduced ? 0 : 1, roll: reduced ? 0 : 1,
      opaque: 0, tint: PHOSPHORS.blanc.tint, hot: PHOSPHORS.blanc.hot, glass: [0.02, 0.023, 0.022],
    };
    this.scan = 0.55;          // réglage demandé, atténué selon la taille d'affichage
    this.persistence = 0.35;   // 0 à 1
    this.phosphor = 'blanc';
    this.powered = true;
    this.onBell = () => {};
    this.onTick = null;        // (now) => void, appelé à chaque image
    try {
      this.crt = new CrtGL(canvas);
      this.webgl = true;
    } catch (e) {
      screenEl.classList.add('no-gl');
      this.crt = new Crt2D(canvas);
      this.webgl = false;
    }
    this.power = new Power({ wrap, screenEl, params: this.params, reduced });
    this.lastT = 0;
  }

  setPhosphor(name) {
    const ph = PHOSPHORS[name] || PHOSPHORS.blanc;
    this.phosphor = PHOSPHORS[name] ? name : 'blanc';
    this.params.tint = ph.tint;
    this.params.hot = ph.hot;
    this.params.glass = [0.016 + ph.tint[0] * 0.01, 0.019 + ph.tint[1] * 0.01, 0.018 + ph.tint[2] * 0.01];
  }

  /** Envoie des octets au débit de la ligne ; marks : repères appelés en cours de route (voir Line). */
  send(bytes, done, marks) { this.line.send(bytes, done, marks); }

  /** Affiche des octets immédiatement (sans passer par la ligne). */
  instant(bytes) { for (const b of bytes) this.decoder.feed(b); }

  /** Remise à zéro complète de l'écran et du décodeur. */
  reset() {
    this.line.clear();
    this.decoder.power();
    this.screen.clearRows(0, 24);
  }

  /** Indicateur d'état du terminal : rangée 00, colonne 39, fond inversé (F, C…). */
  statusChar(ch) {
    this.screen.set(38, T_ALPHA, ch.charCodeAt(0), 0, 0, 7, 0, F_INVERSE, 0);
    this.screen.set(39, T_ALPHA, 0x20, 0, 0, 7, 0, 0, 0);
  }

  /** Zone 1 de la rangée de service (colonnes 1 à 36). */
  row0Text(str, fg = 6) {
    for (let c = 0; c < 36; c++) {
      const ch = str.charCodeAt(c);
      this.screen.set(c, T_ALPHA, ch >= 0x20 && ch < 0x7F ? ch : 0x20, 0, 0, fg, 0, 0, 0);
    }
  }

  powerOff(done) {
    this.powered = false;
    this.line.clear();
    this.power.off(() => {
      this.screen.clearRows(0, 24);
      this.decoder.power();
      this.raster.clearGlow();
      if (done) done();
    });
  }

  powerOn() {
    this.decoder.power();
    this.screen.clearRows(0, 24);
    this.powered = true;
    this.power.on();
  }

  /** Premier rendu sans fondu de rémanence. */
  prime(now = 0) {
    this.raster.draw(now, { on: false, r: 1, c: 1 });
    this.raster.prime();
  }

  frame(now) {
    const dt = Math.min(100, Math.max(0, now - this.lastT));
    this.lastT = now;
    this.line.tick(dt);
    if (this.onTick) this.onTick(now);
    this.power.tick(now);
    const d = this.decoder;
    this.raster.draw(now, { on: d.cursor && this.powered, r: d.r, c: d.c });
    const tau = (8 + this.persistence * this.persistence * 240) * PHOSPHORS[this.phosphor].persist;
    this.raster.persist(dt, tau);
    // Les lignes de balayage s'estompent quand une ligne de trame fait moins de 2 pixels (moiré)
    const pxPerLine = this.canvas.height / (1 + 2 * MARGIN) / H;
    const k = Math.min(1, Math.max(0, (pxPerLine - 1.25) / 1.35));
    this.params.scan = this.scan * k * k * (3 - 2 * k);
    this.params.time = now / 1000;
    if (!this.reduced && !this.power.busy) this.params.gain = 1 + Math.sin(now * 0.037) * 0.006;
    this.crt.draw(this.raster.tex, this.params);
  }

  start() {
    this.lastT = performance.now();
    const loop = now => { this.frame(now); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }
}
