// Le décor de la page (src/ui/decor.js) : le calage du banc. LATENCE n'a pas de décor pour l'instant,
// l'écran garde son tube dessiné (docs/latence/interface.md, « La page »).
import { describe, it, expect } from 'vitest';
import { cornersFromCalage } from '../src/ui/placement.js';

describe('le calage du banc', () => {
  it("passe des coins nommés, en % de la photo, aux coins de placeScreen : fractions, dans l'ordre HG HD BD BG", () => {
    const calage = {
      coins: { unite: '% de la photo', basDroit: [87.5, 87], hautGauche: [12.5, 15], basGauche: [12.5, 87], hautDroit: [87.5, 15] },
    };
    expect(cornersFromCalage(calage)).toEqual([[0.125, 0.15], [0.875, 0.15], [0.875, 0.87], [0.125, 0.87]]);
  });
});
