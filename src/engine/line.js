// Ligne téléphonique : délivre les octets au décodeur au débit choisi.
// 1200 bit/s en 7 bits + parité + start + stop = 10 bits par caractère, soit 120 caractères par seconde.

export class Line {
  /** @param {(byte: number) => void} sink */
  constructor(sink) {
    this.sink = sink;
    this.q = [];
    this.baud = 1200;   // 0 = instantané
    this.budget = 0;
    this.rx = 0;        // octets reçus depuis le démarrage
  }

  /**
   * Met des octets en file ; done est appelé quand le dernier est affiché. marks : [{ at, fn }],
   * des repères appelés quand la ligne a transmis les at premiers octets.
   */
  send(bytes, done, marks = []) { this.q.push({ b: bytes, i: 0, done, marks, m: 0 }); }

  /** Appelle les repères atteints par l'élément en cours. */
  fire(it) {
    while (it.m < it.marks.length && it.marks[it.m].at <= it.i) it.marks[it.m++].fn();
  }

  /** Vide la file (les callbacks en attente sont abandonnés). */
  clear() { this.q.length = 0; this.budget = 0; }

  pending() {
    let n = 0;
    for (const it of this.q) n += it.b.length - it.i;
    return n;
  }

  get busy() { return this.q.length > 0; }

  tick(dt) {
    if (!this.q.length) { this.budget = 0; return; }
    let n;
    if (!this.baud) n = Infinity;
    else {
      this.budget += dt * this.baud / 10000;
      n = Math.floor(this.budget);
      this.budget -= n;
    }
    while (n > 0 && this.q.length) {
      const it = this.q[0];
      this.fire(it);
      while (n > 0 && it.i < it.b.length && this.q[0] === it) {
        this.sink(it.b[it.i++]);
        n--;
        this.rx++;
        this.fire(it);
      }
      if (this.q[0] !== it) continue;     // un repère a vidé la file
      if (it.i >= it.b.length) { this.q.shift(); if (it.done) it.done(); }
    }
  }
}
