// État d'une partie : horloge et agenda, cadenas ouverts, documents trouvés, indices, messagerie, fin.
// Générique : l'horloge et la clé de sauvegarde viennent du scénario.

const pad = n => String(n).padStart(2, '0');

/** Heure du jeu (secondes depuis minuit du premier jour) au format 14:23:05. */
export function hms(t) {
  const s = Math.floor(t) % 86400;
  return pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
}

/** Heure du jeu au format 14:23. */
export const hm = t => hms(t).slice(0, 5);

/** Range un élément { at, … } dans une liste triée par heure, après ceux de même heure. */
export function insertByTime(list, item) {
  let i = list.length;
  while (i > 0 && list[i - 1].at > item.at) i--;
  list.splice(i, 0, item);
}

export class GameState {
  /**
   * @param {{ start: number, end: number, realMinutes: number, seconds?: boolean }} clock
   *   start et end en minutes depuis minuit du premier jour (22 h 00 = 1320, 6 h 00 le lendemain = 1800) ;
   *   seconds : l'heure affichée porte les secondes
   * @param {string} storageKey clé de sauvegarde dans le navigateur
   */
  constructor(clock, storageKey) {
    this.clock = clock;
    this.storageKey = storageKey;
    this.reset();
  }

  reset() {
    this.started = false;
    this.timed = true;      // false : mode sans chrono (la fin ne vient jamais, indices gratuits)
    this.gender = null;     // personnage : 'm' ou 'f', pour les accords
    this.elapsedMs = 0;     // temps réel joué
    this.penalty = 0;       // minutes ajoutées par les indices
    this.flags = {};        // cadenas ouverts, étapes franchies
    this.times = {};        // étape → heure du jeu (secondes) où elle a été franchie
    this.docs = [];         // documents du dossier, dans l'ordre de découverte
    this.hints = {};        // objectif → niveau d'indice obtenu
    this.seen = {};         // ce que le joueur a vu (documents lus…)
    this.agenda = [];       // événements à venir { at, id, data }, triés par heure du jeu
    this.mail = [];         // messagerie, triée par heure : { id, at, out: true } envoyé, { id, at, read } reçu
    this.data = {};         // données propres au scénario
    this.achieved = [];     // succès obtenus pendant cette partie
    this.ending = null;     // fin atteinte : la partie est terminée
    this.journal = [];      // ce qui s'est passé, pour les essais : { e, t (heure du jeu), r (temps réel joué), … }
  }

  /** Heure du jeu, en secondes depuis minuit du premier jour, plafonnée à la fin sauf sans chrono. */
  time() {
    const { start, end, realMinutes } = this.clock;
    const speed = (end - start) / realMinutes;
    const t = start * 60 + (this.elapsedMs / 1000) * speed + this.penalty * 60;
    return this.timed ? Math.min(end * 60, t) : t;
  }

  /** Heure du jeu, en minutes depuis minuit du premier jour. */
  minutes() { return this.time() / 60; }

  /** Heure affichée : 14:23:05, ou 14:23 si l'horloge du scénario n'a pas de secondes. */
  clockText(t = this.time()) { return this.clock.seconds ? hms(t) : hm(t); }

  get over() { return this.timed && this.time() >= this.clock.end * 60; }

  addDoc(id) { if (!this.docs.includes(id)) this.docs.push(id); }

  hintsUsed() { return Object.values(this.hints).reduce((a, b) => a + b, 0); }

  /** Le joueur a-t-il envoyé ce message ? */
  sent(id) { return this.mail.some(m => m.out && m.id === id); }

  /** Ce message est-il arrivé ? */
  received(id) { return this.mail.some(m => !m.out && m.id === id); }

  /** Nombre de messages reçus non lus. */
  unread() { return this.mail.filter(m => !m.out && !m.read).length; }

  /** Tout l'état est sauvegardé, sauf ce qui vient du scénario (horloge, clé). */
  toJSON() {
    const { clock, storageKey, ...saved } = this;
    return saved;
  }

  save() {
    try { localStorage.setItem(this.storageKey, JSON.stringify(this)); } catch (e) { /* stockage indisponible */ }
  }

  /** Partie en cours enregistrée dans ce navigateur, ou null (aucune, ou terminée). */
  static load(clock, storageKey) {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return null;
      const s = Object.assign(new GameState(clock, storageKey), JSON.parse(raw));
      return s.started && !s.ending ? s : null;
    } catch (e) {
      return null;
    }
  }

  static clear(storageKey) {
    try { localStorage.removeItem(storageKey); } catch (e) { /* rien */ }
  }
}
