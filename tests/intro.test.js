// L'introduction d'ouverture (src/scenarios/latence/intro.js, src/ui/intro.js) : le dialogue avec les archives
// de Baudot, montré en entier à la première visite seulement, avant que le terminal s'allume.
import { describe, it, expect } from 'vitest';
import scenario from '../src/scenarios/latence/index.js';
import { MISSION } from '../src/scenarios/latence/data.js';
import { introEntiere, introVue, secondesEntre, duree } from '../src/ui/intro.js';

const intro = scenario.intro;

/** Tout ce que l'introduction écrit, bouton et seuil compris. */
function textes() {
  const t = [...intro.entete, intro.bouton, ...Object.values(intro.seuil)];
  for (const e of intro.echanges) {
    t.push(e.question);
    for (const r of e.reponse || []) t.push(r.date || '', r.texte);
    for (const r of e.apres || []) t.push(r.texte);
  }
  return t;
}
const dialogue = () => [...intro.entete, ...intro.echanges.flatMap(e => [e.question,
  ...[...(e.reponse || []), ...(e.apres || [])].map(r => r.texte)])].join(' ');

describe("le dialogue de l'introduction", () => {
  it("raconte le réseau, l'espace, la Ligne, puis la durée de l'interruption", () => {
    expect(intro.echanges.map(e => e.question)).toEqual([
      'HISTORIQUE DU RESEAU', 'HISTORIQUE DE L\'ESPACE', 'ETAT DE LA LIGNE TERRE-MARS',
      'DUREE DE L\'INTERRUPTION',
    ]);
    expect(dialogue()).toContain('1200 BAUDS');
    expect(intro.echanges[2].ligne).toEqual({ relais: 9, muet: 7 });
    expect(intro.echanges[3].compteur).toBe(true);
  });

  it('écrit en majuscules sans accents, comme la norme', () => {
    expect(dialogue()).toBe(dialogue().toUpperCase());
    expect(dialogue()).not.toMatch(/[À-ÖØ-öø-ÿ]/);
  });

  it('reprend la date et l\'heure du silence de L7 dans data.js', () => {
    expect(dialogue()).toContain(`${MISSION.silence} A ${MISSION.heureSilence}`);
  });

  it("ne contient aucun mot interdit de l'univers", () => {
    // « ordinateur » y figure exprès : l'introduction dit qu'il n'a jamais quitté les laboratoires
    const interdits = /\b(minitel|phare|port|ports|navire|quai|coque|pont|cale|ancre|accostage|amarrage|marseille|provence|guerre|militaire|sovietique|soviétique|internet|smartphone)\b/i;
    for (const t of textes()) expect(t).not.toMatch(interdits);
  });

  it('met une espace insécable avant « : ; ! ? »', () => {
    for (const t of textes()) expect(t).not.toMatch(/ [:;!?]/);
  });
});

describe("la durée de l'interruption", () => {
  it('compte 19 j 10 h 43 min entre le silence de L7 et le début du jeu', () => {
    const s = secondesEntre(intro.silence, intro.arrivee);
    expect(s).toBe(((19 * 24 + 10) * 60 + 43) * 60);
    expect(duree(s)).toBe('19 J 10 H 43 MIN 00 S');
    expect(duree(s + 7)).toBe('19 J 10 H 43 MIN 07 S');
  });
});

describe('la première visite', () => {
  const memoire = () => {
    const m = {};
    return { get: k => (k in m ? m[k] : null), set: (k, v) => { m[k] = v; } };
  };

  it("montre l'introduction entière, puis seulement le bouton", () => {
    const store = memoire();
    expect(introEntiere(store, intro.cle)).toBe(true);
    introVue(store, intro.cle);
    expect(introEntiere(store, intro.cle)).toBe(false);
  });

  it('montre tout quand le stockage est indisponible', () => {
    expect(introEntiere({ get: () => null, set: () => {} }, intro.cle)).toBe(true);
  });
});
