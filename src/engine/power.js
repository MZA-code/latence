// Allumage et extinction du tube : l'image s'écrase en trait, puis en point, qui s'éteint.
// Pilote la transformation CSS du conteneur du canvas et les uniformes flash / gain.

const ease = t => 1 - Math.pow(1 - Math.min(1, Math.max(0, t)), 3);

export class Power {
  /**
   * @param {{ wrap: HTMLElement, screenEl: HTMLElement, params: object, reduced: boolean }} o
   */
  constructor({ wrap, screenEl, params, reduced }) {
    this.wrap = wrap;
    this.screenEl = screenEl;
    this.P = params;
    this.reduced = reduced;
    this.kind = null;
    this.t0 = 0;
    this.done = null;
  }

  get busy() { return this.kind !== null; }

  off(done) { this.kind = 'off'; this.t0 = performance.now(); this.done = done; }

  on() {
    this.wrap.style.transform = 'scale(1, 0.01)';
    this.wrap.style.opacity = 1;
    this.kind = 'on';
    this.t0 = performance.now();
  }

  tick(now) {
    if (!this.kind) return;
    const t = now - this.t0;
    let sx = 1, sy = 1, flash = 0, gain = 1, op = 1, dot = false;
    if (this.kind === 'off') {
      if (this.reduced) { op = Math.max(0, 1 - t / 300); if (t >= 300) return this.finishOff(); }
      else if (t < 170) { const k = ease(t / 170); sy = 1 - k * 0.992; flash = k * 0.85; }
      else if (t < 430) { const k = ease((t - 170) / 260); sy = 0.008; sx = 1 - k * 0.985; flash = 0.85 + k * 0.15; dot = true; }
      else if (t < 1150) { sy = 0.008; sx = 0.015; flash = 1; op = 1 - (t - 430) / 720; dot = true; }
      else return this.finishOff();
    } else {
      if (this.reduced) { op = Math.min(1, t / 300); if (t >= 300) { this.kind = null; op = 1; } }
      else if (t < 240) { const k = ease(t / 240); sy = 0.01 + 0.99 * k; flash = 1 - k * 0.6; }
      else if (t < 950) { const k = (t - 240) / 710; flash = 0.4 * (1 - k); gain = 0.5 + 0.5 * k; }
      else this.kind = null;
    }
    this.wrap.style.transform = `scale(${sx}, ${sy})`;
    this.wrap.style.opacity = op;
    this.screenEl.style.filter = dot ? 'drop-shadow(0 0 5px rgb(var(--signal-rgb) / .9))' : '';
    this.P.flash = flash;
    this.P.gain = gain;
  }

  finishOff() {
    this.kind = null;
    this.wrap.style.transform = 'scale(1, 0.008)';
    this.wrap.style.opacity = 0;
    this.screenEl.style.filter = '';
    this.P.flash = 0;
    this.P.gain = 1;
    if (this.done) this.done();
  }
}
