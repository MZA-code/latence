// Succès : rangés à part de la partie (clé scenario.achievementsKey), ils survivent aux nouvelles parties.

export class Achievements {
  /** @param {string} [key] clé de stockage ; sans clé, les succès ne durent que le temps de la page */
  constructor(key) {
    this.key = key;
    this.list = [];
    try {
      const saved = key ? JSON.parse(localStorage.getItem(key)) : null;
      if (Array.isArray(saved)) this.list = saved;
    } catch (e) { /* stockage indisponible ou illisible */ }
  }

  has(id) { return this.list.includes(id); }

  add(id) {
    if (this.has(id)) return;
    this.list.push(id);
    try {
      if (this.key) localStorage.setItem(this.key, JSON.stringify(this.list));
    } catch (e) { /* stockage indisponible */ }
  }
}
