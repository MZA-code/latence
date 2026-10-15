// Page du jeu : le Minitel, son clavier, et le scénario en cours.
import './styles/game.css';
import { Minitel, MinitelAudio } from './engine/index.js';
import { Game } from './game/game.js';
import { bindKeyboard } from './ui/keyboard.js';
import { placeScreen, TUBE_CORNERS, PLEIN_CORNERS } from './ui/placement.js';
import { mountDecor } from './ui/decor.js';
import { store } from './ui/storage.js';
import { reglagesValides, reglagesDuTerminal, appliquer, bindVolet } from './ui/reglages.js';
import { monterEssai } from './ui/essai.js';
import { monterIntro } from './ui/intro.js';
import scenario from './scenarios/index.js';

const $ = id => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const minitel = new Minitel({ canvas: $('crt'), wrap: $('crtWrap'), screenEl: $('screen'), reduced });

// Préférences du joueur : le son, et les réglages de l'écran (volet caché à droite)
const PREFS_KEY = 'minitel-escape:preferences';
const gardes = store.get(PREFS_KEY) || {};
const origine = reglagesDuTerminal(minitel);
const reglages = reglagesValides(gardes, origine);
let son = gardes.sound !== false;

const audio = new MinitelAudio(() => son);
minitel.onBell = () => audio.bell();
minitel.line.baud = 1200;

const game = new Game({
  minitel,
  audio,
  scenario,
  onChange: () => $('crt').setAttribute('aria-label', 'Écran du terminal : ' + game.label),
});

const placement = placeScreen({ stage: $('stage'), screenEl: $('screen'), canvas: $('crt'), tube: $('tube') });
// Téléphone : l'écran en pleine largeur, sans boîtier (même seuil que game.css)
const plein = matchMedia('(max-width: 599px)');
const cadrer = () => placement.setCorners(plein.matches ? PLEIN_CORNERS : TUBE_CORNERS);
plein.addEventListener('change', cadrer);
cadrer();
// Sur grand écran, la photo du terminal et les écussons du scénario
mountDecor({ decor: scenario.decor, wrap: $('stageWrap'), stage: $('stage'), screenEl: $('screen'), minitel, placement });

function syncPrefs() {
  appliquer(minitel, reglages);
  document.body.dataset.phos = reglages.phos;
  $('tSound').setAttribute('aria-pressed', String(son));
  $('tSound').textContent = son ? 'Son : oui' : 'Son : non';
  store.set(PREFS_KEY, { sound: son, ...reglages });
}
$('tSound').addEventListener('click', () => { son = !son; if (son) audio.unlock(); syncPrefs(); });
bindVolet({ bouton: $('tReglages'), volet: $('volet'), reglages, origine, onChange: syncPrefs });

// Outils de développement : ?instantane affiche les pages sans attendre la ligne à 1200 bauds,
// ?debug expose le jeu dans la console (window.jeu) pour avancer l'horloge ou forcer un état,
// ?essai ajoute le rapport d'essai de la partie (docs/latence/essais.md).
const params = new URLSearchParams(location.search);
if (params.has('instantane')) minitel.line.baud = 0;
if (params.has('debug')) window.jeu = game;
if (params.has('essai') && scenario.rapport) monterEssai({ outils: document.querySelector('.game-tools'), rapport: () => scenario.rapport(game) });

// La partie se sauvegarde aussi quand on quitte la page, pas seulement toutes les 5 secondes
addEventListener('pagehide', () => game.save());

syncPrefs();
minitel.start();

// Le terminal s'allume sur l'écran titre ; le clavier ne part au jeu qu'à partir de là
function allumer() {
  audio.unlock();
  minitel.powerOn();
  game.boot();
  bindKeyboard({ service: game, audio });
}

// L'introduction d'ouverture : le terminal reste éteint derrière elle jusqu'au bouton
if (scenario.intro && !params.has('instantane')) {
  $('crtWrap').style.opacity = 0;
  minitel.powered = false;
  monterIntro({
    calque: $('intro'), intro: scenario.intro, store, reduced, audio, onAllumer: allumer,
    choisirSon: oui => { son = oui; syncPrefs(); },
  });
} else {
  game.boot();
  bindKeyboard({ service: game, audio });
}
