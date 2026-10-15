// Réglages du banc d'essai : phosphore, tube, débit, son, incrustation.
import { GREY, COLOR_NAMES, PHOSPHORS } from '../engine/index.js';
import { store } from '../ui/storage.js';

const KEY = 'minitel-escape:reglages';
export const DEFAULTS = { phos: 'blanc', curv: 0.1, scan: 0.55, bloom: 0.45, persist: 0.35, baud: 1200, sound: true, blend: 'screen' };

export function loadSettings() {
  return Object.assign({}, DEFAULTS, store.get(KEY) || {});
}

const $ = id => document.getElementById(id);
const SLIDERS = [['Curv', 'curv'], ['Scan', 'scan'], ['Bloom', 'bloom'], ['Persist', 'persist']];

/**
 * @param {{ settings: object, minitel: import('../engine/minitel.js').Minitel,
 *           audio: import('../engine/audio.js').MinitelAudio, onBlend: () => void }} o
 */
export function bindSettings({ settings: S, minitel, audio, onBlend }) {
  const save = () => store.set(KEY, S);

  function sync() {
    const ph = PHOSPHORS[S.phos] || PHOSPHORS.blanc;
    document.body.dataset.phos = S.phos;
    $('phosBlanc').setAttribute('aria-checked', String(S.phos === 'blanc'));
    $('phosVert').setAttribute('aria-checked', String(S.phos === 'vert'));
    $('tubeInfo').textContent = ph.label;
    for (const [id, key] of SLIDERS) {
      $('r' + id).value = S[key];
      $('o' + id).textContent = Number(S[key]).toFixed(2);
    }
    $('baud1200').setAttribute('aria-checked', String(S.baud === 1200));
    $('baud4800').setAttribute('aria-checked', String(S.baud === 4800));
    $('baudInst').setAttribute('aria-checked', String(S.baud === 0));
    $('cSound').checked = !!S.sound;
    $('blendScreen').setAttribute('aria-checked', String(S.blend !== 'normal'));
    $('blendOpaque').setAttribute('aria-checked', String(S.blend === 'normal'));

    minitel.setPhosphor(S.phos);
    minitel.params.curv = S.curv;
    minitel.params.bloom = S.bloom;
    minitel.scan = S.scan;
    minitel.persistence = S.persist;
    minitel.line.baud = S.baud;

    // Nuancier : les 8 couleurs Vidéotex rangées par niveau de gris
    const order = [0, 4, 1, 5, 2, 6, 3, 7];
    $('swatches').innerHTML = order.map(c => {
      const g = GREY[c], rgb = ph.ui.map(x => Math.round(x * g)).join(',');
      return `<span class="sw" title="${COLOR_NAMES[c]} : ${Math.round(g * 100)} %"><i style="background:rgb(${rgb})"></i><b>${COLOR_NAMES[c]}</b>${Math.round(g * 100)}</span>`;
    }).join('');
    onBlend();
  }

  const seg = (ids, attr, key, parse) => ids.forEach(id => $(id).addEventListener('click', e => {
    S[key] = parse(e.currentTarget.dataset[attr]);
    save();
    sync();
  }));
  seg(['phosBlanc', 'phosVert'], 'phos', 'phos', v => v);
  seg(['baud1200', 'baud4800', 'baudInst'], 'baud', 'baud', v => parseInt(v, 10));
  seg(['blendScreen', 'blendOpaque'], 'blend', 'blend', v => v);
  for (const [id, key] of SLIDERS) {
    $('r' + id).addEventListener('input', e => { S[key] = parseFloat(e.target.value); sync(); });
    $('r' + id).addEventListener('change', save);
  }
  $('cSound').addEventListener('change', e => {
    S.sound = e.target.checked;
    save();
    if (S.sound) audio.unlock();
  });

  return { sync, save };
}
