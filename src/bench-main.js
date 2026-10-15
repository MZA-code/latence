// Page du banc d'essai : le jeu tourne dans l'écran, avec la photo, le calage et les réglages du tube.
import './styles/bench.css';
import { Minitel, MinitelAudio } from './engine/index.js';
import { Game } from './game/game.js';
import { loadSettings, bindSettings } from './bench/settings.js';
import { createStage } from './bench/stage.js';
import { bindKeyboard } from './ui/keyboard.js';
import { createReadouts } from './bench/readouts.js';
import scenario from './scenarios/index.js';

const $ = id => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const settings = loadSettings();
const minitel = new Minitel({ canvas: $('crt'), wrap: $('crtWrap'), screenEl: $('screen'), reduced });
const audio = new MinitelAudio(() => settings.sound);
minitel.onBell = () => audio.bell();

let readouts = null;
let settingsUI = null;
const game = new Game({ minitel, audio, scenario, onChange: () => readouts && readouts.refreshHint() });

let toastTimer = 0;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.textContent = ''; }, 3200);
}

const stage = createStage({
  minitel,
  settings,
  toast,
  onVdt: (bytes, name) => game.playVdt(bytes, name),
  onChange: () => {
    if (settingsUI) { settingsUI.sync(); settingsUI.save(); }
    updatePhotoPanel();
    if (readouts) readouts.refreshHint();
  },
});

settingsUI = bindSettings({ settings, minitel, audio, onBlend: () => stage.applyBlend() });
readouts = createReadouts({ game, minitel, settings, isCalibrating: () => stage.calibOn });
bindKeyboard({ service: game, audio, isCalibrating: () => stage.calibOn });

function updatePhotoPanel() {
  const p = stage.photo;
  $('photoInfo').textContent = p ? `${p.w} × ${p.h} px` : 'aucune';
  $('bRemove').disabled = !p;
  $('bCalib').setAttribute('aria-pressed', String(stage.calibOn));
  $('bCalib').textContent = stage.calibOn ? 'Terminer le calage' : 'Caler les coins';
  $('coords').innerHTML = stage.corners
    .map(k => `<span>${k.name} <b>${(k.u * 100).toFixed(2)}</b> · <b>${(k.v * 100).toFixed(2)}</b></span>`)
    .join('');
}

// Panneaux « Photo » et « Pages »
$('bPhoto').addEventListener('click', () => $('fPhoto').click());
$('fPhoto').addEventListener('change', e => { const f = e.target.files[0]; if (f) stage.takeFile(f); e.target.value = ''; });
$('bVdt').addEventListener('click', () => $('fVdt').click());
$('fVdt').addEventListener('change', e => { const f = e.target.files[0]; if (f) stage.takeFile(f); e.target.value = ''; });
$('bCalib').addEventListener('click', () => stage.setCalib(!stage.calibOn));
$('bRecenter').addEventListener('click', () => stage.recenter());
$('bRemove').addEventListener('click', () => stage.removePhoto());
$('bCopy').addEventListener('click', () => {
  const ta = $('tExport');
  ta.value = stage.exportCalage();
  ta.hidden = false;
  const fallback = () => { ta.focus(); ta.select(); toast('Texte sélectionné : copie-le avec Ctrl+C.'); };
  try {
    navigator.clipboard.writeText(ta.value).then(() => toast('Calage copié au format JSON.'), fallback);
  } catch (e) {
    fallback();
  }
});
$('bPower').addEventListener('click', () => {
  audio.unlock();
  if (game.mode === 'off') { if (!minitel.power.busy) game.powerOn(); }
  else game.powerOff();
});

// Démarrage
settingsUI.sync();
game.boot();
stage.layout();
updatePhotoPanel();
readouts.refreshHint();
readouts.refresh();
stage.restore();
minitel.start();
