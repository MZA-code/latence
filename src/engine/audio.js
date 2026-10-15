// Son du terminal (Web Audio), et outils pour les sons du scénario. Tout est synthétisé, sans fichier.
// Le contexte n'est créé qu'après un geste du joueur ; le bouton Son coupe tout, ambiances comprises.

const FONDU = 1.5;   // secondes : une ambiance qui s'en va s'efface en fondu

export class MinitelAudio {
  /** @param {() => boolean} enabled le bouton Son */
  constructor(enabled) {
    this.enabled = enabled;
    this.ctx = null;
    this.out = null;                     // sortie générale
    this.amb = { id: null, stop: null }; // ambiance en cours
    this.buffers = {};
  }

  /** À appeler dans un gestionnaire de clic ou de touche. Renvoie le contexte, ou null. */
  unlock() {
    try {
      if (!this.ctx) {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.out = this.ctx.createGain();
        this.out.connect(this.ctx.destination);
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch (e) {
      this.ctx = null;
    }
    return this.ctx;
  }

  /** Le son peut-il jouer ? Il faut un geste du joueur et le bouton Son à oui. */
  get ready() { return !!this.ctx && this.enabled(); }

  /** L'heure du contexte audio, en secondes. */
  get now() { return this.ctx ? this.ctx.currentTime : 0; }

  /** Joue une recette du scénario : recipe(audio, ...args). Rien avant le premier geste, ni son coupé. */
  play(recipe, ...args) {
    if (!this.ready) return;
    try {
      recipe(this, ...args);
    } catch (e) { /* un son raté ne doit pas casser la partie */ }
  }

  /**
   * L'ambiance en boucle : une seule à la fois. recipe = { start(audio) } renvoie l'arrêt, arret(fondu).
   * Appelée à chaque image : rien ne change tant que l'id reste le même ; son coupé vaut silence.
   */
  ambiance(id, recipe) {
    const voulue = this.ready && recipe ? id : null;
    if (voulue === this.amb.id) return;
    if (this.amb.stop) {
      try {
        this.amb.stop(FONDU);
      } catch (e) { /* rien */ }
    }
    this.amb = { id: voulue, stop: null };
    if (!voulue) return;
    try {
      this.amb.stop = recipe.start(this);
    } catch (e) { /* l'ambiance ne démarre pas, la partie continue */ }
  }

  // ---------------------------------------------------------------- outils de synthèse

  /** Un tampon de bruit de deux secondes, blanc ou brun, gardé pour resservir. */
  buffer(color = 'blanc') {
    if (this.buffers[color]) return this.buffers[color];
    const a = this.ctx, n = a.sampleRate * 2;
    const buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    let brun = 0;
    for (let i = 0; i < n; i++) {
      const blanc = Math.random() * 2 - 1;
      brun = (brun + 0.02 * blanc) / 1.02;
      d[i] = color === 'brun' ? brun * 3.5 : blanc;
    }
    this.buffers[color] = buf;
    return buf;
  }

  /**
   * Enveloppe d'un son bref : montée, palier, descente. Le gain part de 0 dès sa création : sinon il
   * vaut 1 jusqu'au premier événement, et une source qui démarre un échantillon plus tôt (arrondi de
   * l'heure) laisse passer un claquement.
   */
  envelope(g, t, dur, vol, attaque) {
    g.gain.value = 0;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + attaque);
    g.gain.setValueAtTime(vol, Math.max(t + attaque, t + dur - 0.03));
    g.gain.linearRampToValueAtTime(0, t + dur);
  }

  /** Branche un filtre { type, frequency, Q } après un nœud ; renvoie le dernier nœud de la chaîne. */
  filtre(node, filter) {
    if (!filter) return node;
    const f = this.ctx.createBiquadFilter();
    f.type = filter.type;
    f.frequency.value = filter.frequency;
    if (filter.Q) f.Q.value = filter.Q;
    return node.connect(f);
  }

  /** Une note : sinus par défaut ; elle glisse jusqu'à la fréquence `to` si on la donne. */
  tone(freq, t, dur, vol, { type = 'sine', to } = {}) {
    const a = this.ctx, o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    this.envelope(g, t, dur, vol, Math.min(0.02, dur / 4));
    o.connect(g).connect(this.out);
    o.start(t);
    o.stop(t + dur + 0.02);
  }

  /** Un bruit bref, blanc ou brun, passé dans un filtre s'il y en a un. */
  noise(t, dur, vol, filter = null, color = 'blanc') {
    const a = this.ctx, src = a.createBufferSource(), g = a.createGain();
    src.buffer = this.buffer(color);
    this.envelope(g, t, dur, vol, Math.min(0.005, dur / 4));
    this.filtre(src, filter).connect(g).connect(this.out);
    src.start(t, Math.random() * 1.5);
    src.stop(t + dur + 0.02);
  }

  /**
   * Une nappe de bruit en boucle, pour les ambiances : volume, couleur, filtre, lente modulation du
   * volume (lfo, en Hz), départ retardé (delay, en secondes). Elle monte en fondu ; renvoie l'arrêt.
   */
  bed(vol, { color = 'brun', filter = null, lfo = 0, delay = 0, fadeIn = FONDU } = {}) {
    const a = this.ctx, t = a.currentTime + delay;
    const src = a.createBufferSource(), g = a.createGain();
    src.buffer = this.buffer(color);
    src.loop = true;
    g.gain.value = 0;                    // voir envelope() : pas de claquement au départ
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + fadeIn);
    this.filtre(src, filter).connect(g).connect(this.out);
    let mod = null;
    if (lfo) {
      mod = a.createOscillator();
      const profondeur = a.createGain();
      mod.frequency.value = lfo;
      profondeur.gain.value = vol * 0.35;
      mod.connect(profondeur).connect(g.gain);
      mod.start(t);
    }
    src.start(t);
    return (fondu = FONDU) => {
      const s = a.currentTime;
      g.gain.cancelScheduledValues(s);
      g.gain.setValueAtTime(g.gain.value, s);
      g.gain.linearRampToValueAtTime(0, s + fondu);
      src.stop(s + fondu + 0.05);
      if (mod) mod.stop(s + fondu + 0.05);
    };
  }

  /** Répète fn(heure) au hasard, toutes les min à max secondes, à partir de `delay` ; renvoie l'arrêt. */
  every(min, max, fn, delay = 0) {
    let timer = 0, actif = true;
    const suivant = attente => {
      timer = setTimeout(() => {
        if (!actif) return;
        if (this.ready) fn(this.now);
        suivant(min + Math.random() * (max - min));
      }, attente * 1000);
    };
    suivant(delay + min + Math.random() * (max - min));
    return () => {
      actif = false;
      clearTimeout(timer);
    };
  }

  // ---------------------------------------------------------------- les sons du terminal

  /** Clic de touche : un bruit blanc de 8 ms, passe-haut à 2 kHz. */
  click() {
    if (!this.ready) return;
    this.noise(this.now, 0.008, 0.02, { type: 'highpass', frequency: 2000 });
  }

  /** Sifflement de connexion : tonalité de réponse, porteuse, puis salve de données. */
  modem() {
    if (!this.enabled() || !this.unlock()) return;
    const a = this.ctx, t = a.currentTime + 0.05;
    this.tone(2100, t, 1.15, 0.05);
    this.tone(1300, t + 1.2, 0.45, 0.045);
    const o = a.createOscillator(), g = a.createGain();
    let tt = t + 1.68;
    o.type = 'sine';
    for (let i = 0; i < 44; i++) { o.frequency.setValueAtTime(Math.random() < 0.5 ? 1300 : 2100, tt); tt += 0.0083; }
    g.gain.value = 0;
    g.gain.setValueAtTime(0, t + 1.68);
    g.gain.linearRampToValueAtTime(0.04, t + 1.7);
    g.gain.setValueAtTime(0.04, tt - 0.02);
    g.gain.linearRampToValueAtTime(0, tt);
    o.connect(g).connect(this.out);
    o.start(t + 1.68);
    o.stop(tt + 0.05);
  }

  /** Bip (code BEL ou touche refusée). Silencieux tant qu'aucun geste n'a débloqué l'audio. */
  bell() {
    if (!this.ready) return;
    this.unlock();
    this.tone(1000, this.ctx.currentTime + 0.01, 0.12, 0.035);
  }
}
