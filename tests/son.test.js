// Tests du son (src/engine/audio.js) : rien avant le premier geste ni quand le son est coupé,
// une seule ambiance à la fois. Web Audio est remplacé par un faux AudioContext.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MinitelAudio } from '../src/engine/audio.js';
import { FakeAudioContext } from './helpers.js';

let allume, audio;

beforeEach(() => {
  vi.stubGlobal('window', { AudioContext: FakeAudioContext });
  allume = true;
  audio = new MinitelAudio(() => allume);
});
afterEach(() => { vi.unstubAllGlobals(); });

/** Une ambiance d'essai qui compte ses démarrages et ses arrêts. */
function ambiance() {
  const a = { starts: 0, stops: [] };
  a.start = () => {
    a.starts++;
    return fondu => { a.stops.push(fondu); };
  };
  return a;
}

describe('le son', () => {
  it('ne joue rien avant le premier geste du joueur', () => {
    const recette = vi.fn();
    audio.play(recette);
    expect(recette).not.toHaveBeenCalled();
  });

  it('joue une recette après le premier geste, et plus rien quand le son est coupé', () => {
    const recette = vi.fn();
    audio.unlock();
    audio.play(recette, 3);
    expect(recette).toHaveBeenCalledWith(audio, 3);
    allume = false;
    audio.play(recette);
    expect(recette).toHaveBeenCalledTimes(1);
  });

  it("une recette qui échoue ne casse pas la partie", () => {
    audio.unlock();
    expect(() => audio.play(() => { throw new Error('Web Audio'); })).not.toThrow();
  });
});

describe('les ambiances', () => {
  it('une ambiance attend le premier geste, puis démarre une seule fois', () => {
    const vent = ambiance();
    audio.ambiance('vent', vent);
    expect(vent.starts).toBe(0);
    audio.unlock();
    for (let i = 0; i < 5; i++) audio.ambiance('vent', vent);
    expect(vent.starts).toBe(1);
  });

  it("une nouvelle ambiance remplace l'ancienne, qui s'efface en fondu", () => {
    const vent = ambiance(), cuve = ambiance();
    audio.unlock();
    audio.ambiance('vent', vent);
    audio.ambiance('cuve', cuve);
    expect(vent.stops).toEqual([1.5]);
    expect(cuve.starts).toBe(1);
  });

  it("le son coupé arrête l'ambiance ; rallumé, elle reprend", () => {
    const vent = ambiance();
    audio.unlock();
    audio.ambiance('vent', vent);
    allume = false;
    audio.ambiance('vent', vent);
    expect(vent.stops.length).toBe(1);
    allume = true;
    audio.ambiance('vent', vent);
    expect(vent.starts).toBe(2);
  });

  it('le silence demandé arrête l’ambiance en cours', () => {
    const vent = ambiance();
    audio.unlock();
    audio.ambiance('vent', vent);
    audio.ambiance(null, null);
    expect(vent.stops.length).toBe(1);
  });
});

describe('les outils de synthèse', () => {
  it('notes, bruits, nappes et clic se jouent sans erreur', () => {
    const ctx = audio.unlock();
    expect(() => {
      audio.tone(880, audio.now, 0.09, 0.03);
      audio.tone(60, audio.now, 0.3, 0.06, { to: 35, type: 'triangle' });
      audio.noise(audio.now, 0.15, 0.03, { type: 'bandpass', frequency: 2000, Q: 0.7 });
      audio.noise(audio.now, 0.2, 0.02, null, 'brun');
      const arret = audio.bed(0.02, { color: 'brun', filter: { type: 'lowpass', frequency: 300 }, lfo: 0.2 });
      arret(1.5);
      audio.click();
      audio.bell();
      audio.modem();
    }).not.toThrow();
    expect(ctx.started.length).toBeGreaterThan(5);
  });
});

describe('pas de claquement', () => {
  // Un gain vaut 1 jusqu'à son premier événement : si la source démarre un échantillon plus tôt
  // (arrondi de l'heure), son premier échantillon de bruit passe à pleine puissance.
  it("un son bref et une nappe démarrent à volume nul, avant même leur premier événement", () => {
    const ctx = audio.unlock();
    audio.noise(0.5700000000000001, 0.012, 0.05, { type: 'highpass', frequency: 1500 });
    audio.tone(880, 0.02, 0.09, 0.03);
    audio.bed(0.012, { delay: 4.5 });
    const gains = ctx.gains.slice(1);            // la sortie générale reste à 1
    expect(gains.length).toBeGreaterThanOrEqual(3);
    for (const g of gains) expect(g.gain.value).toBe(0);
  });
});

describe('les sons de LATENCE', () => {
  it('chaque son et chaque ambiance se jouent sans erreur', async () => {
    const { sons, ambiances } = await import('../src/scenarios/latence/sons.js');
    vi.useFakeTimers();
    audio.unlock();
    for (const [nom, recette] of Object.entries(sons)) {
      expect(() => recette(audio, 2), nom).not.toThrow();
    }
    for (const [nom, recette] of Object.entries(ambiances)) {
      let arret;
      expect(() => { arret = recette.start(audio); }, nom).not.toThrow();
      vi.advanceTimersByTime(8000);
      expect(() => arret(1.5), nom).not.toThrow();
    }
    vi.useRealTimers();
  });
});
