// Outils des tests du moteur de jeu : un terminal sans tube, une horloge pilotée, un stockage en mémoire.
import { Minitel } from '../src/engine/minitel.js';
import { Screen } from '../src/engine/screen.js';
import { Decoder } from '../src/engine/decoder.js';
import { Line } from '../src/engine/line.js';
import { Game } from '../src/game/game.js';

/** Heure du jeu en secondes depuis minuit : T(14, 0, 20) pour 14:00:20. */
export const T = (h, m, s = 0) => h * 3600 + m * 60 + s;

/**
 * Le vrai terminal (mémoire de page, décodeur, ligne), sans canvas ni allumage :
 * les méthodes viennent de Minitel, la ligne est instantanée.
 */
export function terminal() {
  const m = Object.create(Minitel.prototype);
  m.screen = new Screen();
  m.decoder = new Decoder(m.screen, { bell: () => m.onBell() });
  m.line = new Line(b => m.decoder.feed(b));
  m.line.baud = 0;
  m.onBell = () => {};
  m.onTick = null;
  m.prime = () => {};
  return m;
}

/** Son muet qui compte les bips, note les sons joués (par nom) et l'ambiance demandée. */
export function mute() {
  return {
    bells: 0,
    played: [],
    current: undefined,
    bell() { this.bells++; },
    modem() {},
    unlock() {},
    click() {},
    play(recipe) { this.played.push(recipe.name); },
    ambiance(id) { this.current = id; },
  };
}

/**
 * Un jeu sur un terminal de test. run(s) fait passer s secondes réelles, image par image
 * (250 ms), comme la boucle de rendu : la ligne d'abord, puis l'horloge du jeu.
 */
export function harness(scenario, options = {}) {
  const m = terminal();
  const audio = mute();
  m.onBell = () => audio.bell();          // comme src/main.js : le code BEL fait biper
  const g = new Game({ minitel: m, audio, scenario, ...options });
  let now = 1000;
  g.tick(now);
  return {
    g, m, audio,
    run(seconds, step = 250) {
      for (let t = 0; t < seconds * 1000; t += step) {
        now += step;
        m.line.tick(step);
        g.tick(now);
      }
      m.line.tick(0);
    },
    row: r => m.screen.rowText(r),
  };
}

/**
 * Surveille les débordements : un caractère écrit juste après un passage automatique à la rangée
 * suivante (texte qui dépasse la colonne 40), sans positionnement entre les deux. Renvoie la liste,
 * qui se remplit au fil de l'affichage : une rangée par débordement.
 */
export function watchOverflow(m) {
  const dec = m.decoder, found = [];
  const write = dec.write.bind(dec), us = dec.us.bind(dec);
  let wrapped = false;
  dec.write = (...args) => {
    if (wrapped) found.push(dec.r);
    const r = dec.r;
    write(...args);
    wrapped = dec.c === 1 && dec.r !== r;
  };
  dec.us = (a, b) => { wrapped = false; us(a, b); };
  return found;
}

/**
 * Un faux AudioContext : assez de Web Audio pour jouer les sons sans haut-parleur (Node n'en a pas).
 * Il note les nœuds démarrés et arrêtés.
 */
export class FakeAudioContext {
  constructor() {
    this.currentTime = 0;
    this.sampleRate = 8000;
    this.state = 'running';
    this.started = [];
    this.stopped = [];
    this.gains = [];
    this.destination = this.node();
  }

  param(value = 0) {
    const p = { value };
    for (const k of ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime', 'cancelScheduledValues']) {
      p[k] = () => p;
    }
    return p;
  }

  node(extra = {}) {
    const ctx = this;
    return {
      connect: n => n,
      disconnect() {},
      start() { ctx.started.push(this); },
      stop() { ctx.stopped.push(this); },
      ...extra,
    };
  }

  createGain() {
    const g = this.node({ gain: this.param(1) });   // comme Web Audio : un gain vaut 1 au départ
    this.gains.push(g);
    return g;
  }
  createOscillator() { return this.node({ type: 'sine', frequency: this.param(440) }); }
  createBiquadFilter() { return this.node({ type: 'lowpass', frequency: this.param(350), Q: this.param(1) }); }
  createBufferSource() { return this.node({ buffer: null, loop: false, playbackRate: this.param(1) }); }
  createBuffer(channels, length, rate) {
    const data = new Float32Array(length);
    return { length, sampleRate: rate, getChannelData: () => data };
  }
  resume() { return Promise.resolve(); }
}

/** Stockage du navigateur, en mémoire (Node n'a pas de localStorage). */
export function memoryStorage() {
  const map = new Map();
  return {
    getItem: k => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => { map.set(k, String(v)); },
    removeItem: k => { map.delete(k); },
    clear: () => map.clear(),
  };
}
