// Moteur d'escape game sur Minitel : scènes, champs de saisie, cadenas, serveur, horloge, indices.
// Il ne contient aucune histoire : tout le contenu vient d'un scénario (src/scenarios/…).
//
// Un scénario fournit :
//   title, storageKey, clock { start, end, realMinutes, seconds? }
//   scenes          { id: Scene }            (voir docs/moteur.md)
//   start           scène de l'écran titre
//   newGame(game)   prépare une nouvelle partie et va à la première scène
//   resume(game)    reprend une partie sauvegardée
//   home(game)      scène de SOMMAIRE selon l'état (hors connexion, connecté)
//   server          { name, loginScene, available(game), onLogin(game, user), onLogout(game) }
//   row0(game)      libellé de la rangée 00 (lieu)
//   on              { id: (game, data) => … } gestionnaires des événements de l'agenda
//   events(game)    appelé à chaque nouvelle heure affichée (seconde ou minute)
//   onMessage(game, message)  arrivée d'un message dans la messagerie
//   hintScene, hintPenalty    scène de la touche GUIDE, minutes ajoutées par indice
//   replyDelay      délai des réponses aux questions, en secondes ou [min, max]
//   achievementsKey clé de stockage des succès, à part de la partie
import { Vdt, FOLD } from '../engine/index.js';
import { GameState, insertByTime } from './state.js';
import { Achievements } from './achievements.js';
import { accord, wrap } from './ui.js';

/** Caractères acceptés selon le type de champ. */
const KINDS = {
  digits: /^[0-9]$/,
  upper: /^[A-Z0-9 .\-']$/,
  dirs: /^[HBGD]$/,
  letters: /^[A-Z]$/,
};

/** Événements fournis par le moteur. « message » livre un message programmé par post(). */
const BUILTIN = {
  message: (g, data) => g.receive(data.id),
};

export class Game {
  /**
   * @param {{ minitel: import('../engine/minitel.js').Minitel, audio: import('../engine/audio.js').MinitelAudio,
   *           scenario: object, onChange?: () => void, random?: () => number }} o
   *   random : tirage des délais au hasard (Math.random par défaut)
   */
  constructor({ minitel, audio, scenario, onChange = () => {}, random = Math.random }) {
    this.m = minitel;
    this.audio = audio;
    this.sc = scenario;
    this.onChange = onChange;
    this.random = random;
    this.achievements = new Achievements(scenario.achievementsKey);
    this.s = this.freshState();
    this.mode = 'local';       // local | dial | online | off
    this.session = null;       // utilisateur connecté au serveur
    this.scene = null;
    this.page = 0;
    this.history = [];
    this.fields = [];
    this.fi = 0;
    this.timers = [];
    this.lastNow = 0;
    this.lastClock = '';       // heure affichée en rangée 00
    this.lastPolled = '';      // heure du dernier appel à scenario.events()
    this.eventAt = null;       // heure prévue de l'événement en cours de déclenchement
    this.lastSave = 0;
    this.notified = {};
    this.vars = {};            // état transitoire des scènes (lettre ouverte, fiche consultée…)
    for (const id in scenario.scenes) scenario.scenes[id].id = id;
    minitel.onTick = now => this.tick(now);
  }

  freshState() { return new GameState(this.sc.clock, this.sc.storageKey); }
  savedState() { return GameState.load(this.sc.clock, this.sc.storageKey); }

  /** Champ actif (utilisé par le clavier tactile). */
  get field() { return this.fields[this.fi] || null; }
  get connected() { return this.mode === 'online'; }
  get label() { return this.scene ? this.scene.id : ''; }
  /** L'horloge tourne-t-elle ? */
  get running() {
    return this.s.started && !this.s.ending && !this.s.over && this.scene && !this.scene.frozen && this.mode !== 'off';
  }

  bell() { this.audio.bell(); }

  /** Joue un son du scénario (scenario.sons[name]) : rien si le son est coupé ou pas encore permis. */
  sound(name, ...args) {
    const recipe = this.sc.sons && this.sc.sons[name];
    if (recipe && this.audio.play) this.audio.play(recipe, ...args);
  }

  /** Demande au son l'ambiance que le scénario veut pour l'état présent (scenario.ambiance), ou le silence. */
  ambiance() {
    if (!this.audio.ambiance) return;
    const id = this.mode === 'off' || !this.sc.ambiance ? null : this.sc.ambiance(this);
    this.audio.ambiance(id, id ? this.sc.ambiances[id] : null);
  }
  /** Minuterie du navigateur, pour l'interface seulement : les délais de l'histoire passent par after(). */
  later(fn, ms) { this.timers.push(setTimeout(fn, ms)); }
  /** Texte accordé au personnage choisi : « seul{|e} ». */
  accord(text) { return accord(text, this.s.gender); }

  // ------------------------------------------------------------------ parties

  boot() {
    this.m.reset();
    this.m.statusChar('F');
    this.go(this.sc.start, { push: false, instant: true });
    this.m.prime();
  }

  /** Nouvelle partie. setup règle l'état avant que le scénario la prépare, ex. { timed: false }. */
  newGame(setup = {}) {
    GameState.clear(this.sc.storageKey);
    this.s = this.freshState();
    Object.assign(this.s, setup);
    this.s.started = true;
    this.mode = 'local';
    this.session = null;
    this.m.statusChar('F');
    this.history = [];
    this.notified = {};
    this.lastPolled = '';
    this.sc.newGame(this);
    this.save();
  }

  resume(state) {
    this.s = state;
    this.history = [];
    this.notified = {};
    this.lastPolled = '';
    this.sc.resume(this);
  }

  save() { if (this.s.started) this.s.save(); }

  /**
   * Termine la partie sur une fin et affiche sa scène : l'horloge s'arrête, les événements
   * en attente sont abandonnés, et la partie ne se reprendra plus.
   */
  finish(ending, scene = ending) {
    this.log('fin', { f: ending });
    this.s.ending = ending;
    this.s.agenda = [];
    this.save();
    this.history = [];
    this.go(scene, { push: false });
  }

  /** Succès obtenu : noté pour cette partie et rangé à part, pour toutes les parties. */
  achieve(id) {
    if (!this.s.achieved.includes(id)) this.s.achieved.push(id);
    this.achievements.add(id);
    this.save();
  }

  // ------------------------------------------------------------------ scènes

  go(id, { page = 0, push = true, instant = false } = {}) {
    let sc = this.sc.scenes[id];
    if (!sc) throw new Error('Scène inconnue : ' + id);
    if (push && this.scene && this.scene.id !== id) this.history.push({ id: this.scene.id, page: this.page });
    // Une scène peut rediriger vers une autre à l'entrée (ex. coffre déjà ouvert)
    const redirect = sc.redirect ? sc.redirect(this) : null;
    if (redirect) sc = this.sc.scenes[redirect];
    if (!this.scene || this.scene.id !== sc.id) this.log('scene', { s: sc.id });
    this.scene = sc;
    this.page = page;
    if (sc.enter) sc.enter(this);
    this.draw(instant);
  }

  pages() {
    const n = this.scene.pages;
    return typeof n === 'function' ? n(this) : (n || 1);
  }

  draw(instant = false) {
    const sc = this.scene;
    const p = new Vdt().ff().coff();
    sc.render(this, p, this.page);
    this.fields = (sc.fields ? sc.fields(this, this.page) : []).map(f => ({ ...f, val: '' }));
    this.fi = 0;
    for (const f of this.fields) p.at(f.r, f.c).fg(4).text('.'.repeat(f.len));
    if (this.fields.length) p.at(this.fields[0].r, this.fields[0].c).con();
    this.m.line.clear();
    if (instant) {
      this.m.instant(p.bytes());
      p.marks.forEach(mk => mk.fn());
    } else {
      this.m.send(p.bytes(), null, p.marks);
    }
    this.row0();
    this.onChange();
  }

  back() {
    const prev = this.history.pop();
    if (prev) this.go(prev.id, { page: prev.page, push: false });
    else if (this.scene.parent) this.go(this.scene.parent, { push: false });
    else this.bell();
  }

  home() {
    this.history = [];
    this.go(this.sc.home(this), { push: false });
  }

  // ------------------------------------------------------------------ saisie

  cursorTo(p, f) { p.at(f.r, Math.min(f.c + Math.min(f.val.length, f.len - 1), 40)).con(); }

  typeChar(ch) {
    if (this.mode === 'dial' || this.mode === 'off') return;
    const f = this.field;
    if (!f) { this.bell(); return; }
    // Majuscules d'abord : « é » devient « É », que le repli ramène à « E »
    let u = ch.toUpperCase();
    if (FOLD[u] !== undefined) u = FOLD[u];
    if (u.length !== 1 || !(KINDS[f.kind] || KINDS.upper).test(u)) { this.bell(); return; }
    if (f.val.length >= f.len) { this.bell(); return; }
    f.val += u;
    const p = new Vdt();
    p.at(f.r, f.c + f.val.length - 1).text(f.mask ? '*' : u);
    if (f.val.length === f.len && this.fi < this.fields.length - 1 && f.auto !== false) {
      this.fi++;
      this.cursorTo(p, this.field);
    } else this.cursorTo(p, f);
    this.m.send(p.bytes());
    this.onChange();
  }

  correction() {
    let f = this.field;
    if (f && !f.val && this.fi > 0) { this.fi--; f = this.field; }
    if (!f || !f.val) { this.bell(); return; }
    f.val = f.val.slice(0, -1);
    const p = new Vdt();
    p.at(f.r, f.c + f.val.length).fg(4).text('.');
    this.cursorTo(p, f);
    this.m.send(p.bytes());
  }

  annulation() {
    if (!this.fields.length) { this.bell(); return; }
    const p = new Vdt();
    for (const f of this.fields) { f.val = ''; p.at(f.r, f.c).fg(4).text('.'.repeat(f.len)); }
    this.fi = 0;
    this.cursorTo(p, this.fields[0]);
    this.m.send(p.bytes());
  }

  /**
   * Refuse une saisie : bip, champs vidés, message. Le bip passe par la ligne (code BEL) : il sonne
   * après ce qui est en cours d'affichage. Le message va dans la zone de la scène (scene.notice :
   * première de trois rangées, texte coupé aux mots), ou en rangée 24 si la scène n'en a pas.
   */
  reject(msg) {
    this.log('refus', { s: this.scene.id });
    const p = new Vdt().raw(0x07);
    for (const f of this.fields) { f.val = ''; p.at(f.r, f.c).fg(4).text('.'.repeat(f.len)); }
    this.fi = 0;
    const r0 = this.scene && this.scene.notice;
    if (!r0) {
      this.m.send(p.bytes());
      this.flash(msg);
      return;
    }
    const lines = wrap(msg, 38);
    for (let k = 0; k < 3; k++) {
      p.at(r0 + k, 1).raw(0x18);
      if (lines[k]) p.at(r0 + k, 2).fg(6).text(lines[k]);
    }
    if (this.field) this.cursorTo(p, this.field);
    this.m.send(p.bytes());
  }

  /** Message en rangée 24, puis retour du curseur au champ actif. */
  flash(msg) {
    const p = new Vdt().at(24, 1).raw(0x18);
    p.at(24, 2).fg(6).text(msg);
    if (this.field) this.cursorTo(p, this.field);
    this.m.send(p.bytes());
  }

  envoi() {
    const sc = this.scene;
    if (this.fields.length > 1 && this.fi < this.fields.length - 1) {
      this.fi++;
      const p = new Vdt();
      this.cursorTo(p, this.field);
      this.m.send(p.bytes());
      return;
    }
    if (sc.menu && this.fields.length) {
      const target = sc.menu(this)[this.fields[0].val];
      if (typeof target === 'function') target(this);
      else if (target) this.go(target);
      else this.reject('Choix inconnu.');
      return;
    }
    if (sc.submit) { sc.submit(this, this.fields.map(f => f.val)); return; }
    if (sc.next) { this.go(sc.next(this)); return; }
    this.bell();
  }

  // ------------------------------------------------------------------ touches

  key(k) {
    if (this.mode === 'off' || this.mode === 'dial') return;
    const sc = this.scene;
    if (sc && sc.key && sc.key(this, k)) return;
    // Une partie finie ne se rouvre pas : on ne quitte la fin qu'en demandant une nouvelle partie
    if (this.s.ending && ['sommaire', 'guide', 'connexion'].includes(k)) { this.bell(); return; }
    switch (k) {
      case 'envoi': this.envoi(); return;
      case 'correction': this.correction(); return;
      case 'annulation': this.annulation(); return;
      case 'repetition': this.draw(); return;
      case 'suite':
        if (this.page < this.pages() - 1) { this.page++; this.draw(); }
        else if (sc.next) this.go(sc.next(this));
        else this.bell();
        return;
      case 'retour':
        if (this.page > 0) { this.page--; this.draw(); } else this.back();
        return;
      case 'sommaire': if (this.s.started) this.home(); else this.bell(); return;
      case 'guide': if (this.s.started && this.sc.hintScene) this.go(this.sc.hintScene); else this.bell(); return;
      case 'connexion': {
        const srv = this.sc.server;
        if (!this.s.started || !srv) { this.bell(); return; }
        if (this.mode === 'online') this.disconnect();
        else if (srv.available && !srv.available(this)) this.bell();   // serveur hors de portée
        else this.connect();
        return;
      }
    }
  }

  // ------------------------------------------------------------------ serveur

  connect() {
    this.mode = 'dial';
    this.audio.modem();
    this.flash('Appel du serveur ' + this.sc.server.name + '...');
    this.onChange();
    this.later(() => {
      if (this.mode !== 'dial') return;
      this.mode = 'online';
      this.session = null;
      this.m.statusChar('C');
      this.history = [];
      this.go(this.sc.server.loginScene, { push: false });
    }, 2100);
  }

  disconnect() {
    this.mode = 'local';
    this.session = null;
    this.m.statusChar('F');
    if (this.sc.server.onLogout) this.sc.server.onLogout(this);
    this.home();
  }

  login(user) {
    this.session = user;
    if (this.sc.server.onLogin) this.sc.server.onLogin(this, user);
    this.save();
  }

  /** Marque une étape franchie, note son heure (g.now) et sauvegarde. */
  unlock(flag) {
    this.s.flags[flag] = true;
    this.s.times[flag] = this.now;
    this.log('etape', { f: flag });
    this.save();
  }

  /**
   * Note un événement au journal de la partie, pour les essais : l'heure du jeu (t) et le temps réel
   * joué (r), en secondes. Rien avant le début de la partie, et 2 000 entrées au plus.
   */
  log(e, data) {
    if (!this.s.started || this.s.journal.length >= 2000) return;
    this.s.journal.push({ e, ...data, t: Math.round(this.now), r: Math.round(this.s.elapsedMs / 1000) });
  }

  // ------------------------------------------------------------------ messagerie

  /** Message reçu à l'heure g.now, non lu ; le scénario en est prévenu par onMessage(game, message). */
  receive(id) {
    const msg = { id, at: this.now, read: false };
    insertByTime(this.s.mail, msg);
    this.save();
    if (this.sc.onMessage) this.sc.onMessage(this, msg);
    return msg;
  }

  /** Message envoyé par le joueur, à l'heure g.now. */
  write(id) {
    const msg = { id, at: this.now, out: true };
    insertByTime(this.s.mail, msg);
    this.save();
    return msg;
  }

  /** Programme l'arrivée d'un message dans `delay` secondes (nombre ou [min, max]). */
  post(id, delay) { this.after('message', this.delay(delay), { id }); }

  /**
   * Pose une question { id, reply, delay?, when? } : elle part tout de suite, sa réponse arrive
   * après son délai (scenario.replyDelay par défaut). Une question ne part qu'une fois : renvoie null.
   */
  ask(q) {
    if (this.s.sent(q.id)) return null;
    const msg = this.write(q.id);
    this.post(q.reply, q.delay !== undefined ? q.delay : this.sc.replyDelay);
    return msg;
  }

  /** Questions qu'on peut poser : débloquées (when) et pas encore envoyées. */
  questions(list) { return list.filter(q => !this.s.sent(q.id) && (!q.when || q.when(this))); }

  /** Marque un message reçu comme lu. */
  markRead(id) {
    for (const m of this.s.mail) if (!m.out && m.id === id) m.read = true;
    this.save();
  }

  // ------------------------------------------------------------------ indices

  /** Nombre d'indices déjà obtenus pour un objectif : ils se relisent gratuitement. */
  hintLevel(objective) { return this.s.hints[objective] || 0; }

  /**
   * Donne l'indice suivant d'un objectif et avance l'horloge de scenario.hintPenalty minutes
   * (rien sans chrono). Renvoie le niveau atteint, ou 0 s'il n'y a plus d'indice.
   */
  takeHint(objective, max = 3) {
    const level = this.hintLevel(objective);
    if (level >= max) return 0;
    this.log('indice', { o: objective, n: level + 1 });
    this.s.hints[objective] = level + 1;
    if (this.s.timed) this.s.penalty += this.sc.hintPenalty || 0;
    this.save();
    return level + 1;
  }

  // ------------------------------------------------------------------ horloge

  /** Rangée 00 : une espace, le lieu, l'heure (8 colonnes avec les secondes, 7 sans), soit 36 colonnes. */
  row0() {
    const w = this.sc.clock.seconds ? 8 : 7;
    const label = this.sc.row0(this);
    const clock = this.s.started ? this.s.clockText() : '';
    this.m.row0Text(' ' + label.padEnd(35 - w).slice(0, 35 - w) + clock.padStart(w));
    this.lastClock = clock;
  }

  /**
   * Appelé à chaque image. L'horloge n'avance que si elle tourne, mais l'agenda et events()
   * passent quand même : un indice qui fait dépasser la fin doit encore déclencher la fin.
   * Une partie terminée ne reçoit plus rien.
   */
  tick(now) {
    const dt = this.lastNow ? Math.min(1000, now - this.lastNow) : 0;
    this.lastNow = now;
    this.ambiance();
    if (!this.s.started || this.s.ending || this.mode === 'off') return;
    if (this.running) this.s.elapsedMs += dt;
    this.runAgenda();
    if (this.s.ending) return;
    const clock = this.s.clockText();
    if (clock !== this.lastClock) this.row0();
    if (clock !== this.lastPolled) {
      this.lastPolled = clock;
      if (this.sc.events) this.sc.events(this);
    }
    if (now - this.lastSave > 5000) { this.lastSave = now; this.save(); }
  }

  // ------------------------------------------------------------------ agenda

  /** Heure du jeu en secondes ; pendant un événement, l'heure prévue de cet événement. */
  get now() { return this.eventAt !== null ? this.eventAt : this.s.time(); }

  handler(id) { return BUILTIN[id] || (this.sc.on && this.sc.on[id]) || null; }

  /** Délai en secondes : un nombre, ou [min, max] tiré au hasard, bornes comprises. */
  delay(d) {
    if (Array.isArray(d)) return d[0] + Math.floor(this.random() * (d[1] - d[0] + 1));
    return d || 0;
  }

  /**
   * Programme un événement à une heure du jeu (secondes depuis minuit du premier jour).
   * Il part au premier instant où l'horloge atteint ou dépasse cette heure, même après un saut,
   * et appelle scenario.on[id](game, data). L'agenda est sauvegardé avec la partie.
   */
  schedule(id, at, data = null) {
    if (!this.handler(id)) throw new Error('Événement sans gestionnaire : ' + id);
    insertByTime(this.s.agenda, { at, id, data });
    this.save();
  }

  /** Programme un événement dans `seconds` secondes de jeu, comptées depuis g.now. */
  after(id, seconds, data = null) { this.schedule(id, this.now + seconds, data); }

  /** Annule les événements en attente qui portent cet identifiant, et dont les données passent le filtre. */
  cancel(id, filtre = () => true) {
    this.s.agenda = this.s.agenda.filter(e => e.id !== id || !filtre(e.data));
    this.save();
  }

  /** Déclenche, dans l'ordre, les événements dont l'heure est atteinte. */
  runAgenda() {
    while (this.s.agenda.length && this.s.agenda[0].at <= this.s.time()) {
      const e = this.s.agenda.shift();
      this.eventAt = e.at;
      try {
        this.handler(e.id)(this, e.data);
      } finally {
        this.eventAt = null;
      }
      this.save();
    }
  }

  // ------------------------------------------------------------------ alimentation

  powerOff() {
    if (this.mode === 'off') return;
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.save();
    this.mode = 'off';
    this.session = null;
    this.fields = [];
    this.m.powerOff(() => this.onChange());
    this.onChange();
  }

  powerOn() {
    this.m.powerOn();
    this.m.statusChar('F');
    this.mode = 'local';
    this.history = [];
    this.go(this.s.started ? this.sc.home(this) : this.sc.start, { push: false, instant: true });
  }

  // ------------------------------------------------------------------ banc d'essai

  /** Joue un fichier Vidéotex brut (banc d'essai). */
  playVdt(bytes, name) {
    this.m.line.clear();
    this.fields = [];
    this.scene = { id: 'vdt', frozen: true, render() {}, name };
    this.m.send(bytes);
    this.onChange();
  }
}
