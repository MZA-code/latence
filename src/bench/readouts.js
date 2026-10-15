// Ligne d'état du banc d'essai (connexion, heure du jeu, débit, octets) et consigne.

const $ = id => document.getElementById(id);
const STATES = { off: 'Éteint', local: 'Hors connexion', dial: 'Connexion…', online: 'Connecté' };
const escapeHTML = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/**
 * @param {{ game: import('../game/game.js').Game, minitel: import('../engine/minitel.js').Minitel,
 *           isCalibrating: () => boolean, settings: object }} o
 */
export function createReadouts({ game, minitel, isCalibrating, settings }) {
  const hintEl = $('hint'), led = $('led');

  function hint() {
    if (isCalibrating()) {
      return 'Glisse les quatre coins sur les bords de l’image du tube. Les flèches du clavier affinent au pixel près, <kbd>Maj</kbd> + flèche par pas de 1 %.';
    }
    if (game.mode === 'off') return 'Le terminal est éteint. Appuie sur <b>Allumer</b> pour relancer le tube.';
    if (game.scene && game.scene.id === 'vdt') {
      return `Lecture de <b>${escapeHTML(game.scene.name)}</b> au débit choisi. <span class="mk">Sommaire</span> revient au jeu.`;
    }
    return 'Le scénario tourne dans l’écran : on y joue comme sur la page du jeu. Les réglages ne servent qu’à caler la photo et le tube.';
  }

  function refreshHint() {
    hintEl.innerHTML = hint();
    minitel.canvas.setAttribute('aria-label', 'Écran du terminal : ' + game.label);
  }

  function refresh() {
    led.className = 'led' + (game.connected ? ' is-on' : (game.mode === 'dial' ? ' is-wait' : ''));
    $('roState').textContent = (STATES[game.mode] || '') + (game.session ? ' · ' + game.session : '');
    $('roTime').textContent = game.s.started ? game.s.clockText() : '--:--';
    $('roBaud').textContent = settings.baud ? settings.baud + ' bit/s' : 'instantané';
    $('roRx').textContent = minitel.line.rx.toLocaleString('fr-FR') + ' o';
    $('roQueue').textContent = minitel.line.pending().toLocaleString('fr-FR') + ' o';
    $('bPower').textContent = game.mode === 'off' ? 'Allumer' : 'Éteindre';
  }

  setInterval(refresh, 250);
  return { refresh, refreshHint };
}
