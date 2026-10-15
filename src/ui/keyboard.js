// Clavier : touches de fonction à l'écran, clavier physique, saisie sur téléphone.

/** Correspondance clavier d'ordinateur → touches Minitel. */
export const KEYMAP = {
  Enter: 'envoi', Backspace: 'correction', Escape: 'annulation', Home: 'sommaire', End: 'connexion',
  PageDown: 'suite', ArrowRight: 'suite', PageUp: 'retour', ArrowLeft: 'retour', F1: 'guide', F2: 'repetition',
};

/**
 * @param {{ service: { key: (k: string) => void, typeChar: (ch: string) => void, mode: string, field: object | null },
 *           audio: import('../engine/audio.js').MinitelAudio, isCalibrating?: () => boolean }} o
 *   service : le jeu (src/game/game.js) ou tout objet qui réagit aux touches
 */
export function bindKeyboard({ service, audio, isCalibrating = () => false }) {
  const sink = document.getElementById('sink');
  const stage = document.getElementById('stage');

  function press(k) {
    const el = document.querySelector(`.key[data-key="${k}"]`);
    if (el) {
      el.classList.add('is-down');
      setTimeout(() => el.classList.remove('is-down'), 110);
    }
    audio.unlock();
    if (audio.click) audio.click();
    service.key(k);
  }

  document.querySelectorAll('.key').forEach(el => {
    el.addEventListener('mousedown', e => e.preventDefault());   // le clic ne vole pas le focus
    el.addEventListener('click', () => press(el.dataset.key));
  });

  // Un bouton focalisé au clavier garde Entrée et les flèches ; focalisé à la souris, il les laisse au Minitel.
  let lastPointerDown = -1e9;
  window.addEventListener('pointerdown', () => { lastPointerDown = performance.now(); }, true);
  document.addEventListener('focusin', e => {
    if (e.target && e.target.dataset) e.target.dataset.pf = performance.now() - lastPointerDown < 800 ? '1' : '';
  });

  window.addEventListener('keydown', e => {
    const t = e.target, tag = t && t.tagName;
    const inSink = t === sink;
    if (!inSink && (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t.classList && t.classList.contains('handle')))) return;
    // Un panneau qui garde ses touches (le volet des réglages) : rien ne part au jeu
    if (t && t.closest && t.closest('[data-garde-touches]')) return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const kbFocus = tag === 'BUTTON' && t.dataset.pf !== '1';
    const k = KEYMAP[e.key];
    if (k) {
      if (kbFocus && (e.key === 'Enter' || e.key.startsWith('Arrow'))) return;
      e.preventDefault();
      press(k);
      return;
    }
    if (e.key.length === 1 && service.mode !== 'off') {
      if (kbFocus && e.key === ' ') return;
      e.preventDefault();
      audio.unlock();
      if (audio.click) audio.click();
      service.typeChar(e.key);
    }
  });

  // Téléphone : un champ invisible reçoit le clavier virtuel
  sink.addEventListener('beforeinput', e => {
    if (e.inputType === 'deleteContentBackward') { e.preventDefault(); press('correction'); }
  });
  sink.addEventListener('input', () => {
    const v = sink.value;
    sink.value = '';
    for (const ch of v) {
      if (service.mode === 'off') continue;
      if (audio.click) audio.click();
      service.typeChar(ch);
    }
  });
  stage.addEventListener('pointerup', e => {
    if (e.pointerType === 'touch' && !isCalibrating() && service.field) {
      try { sink.focus({ preventScroll: true }); } catch (err) { /* rien */ }
    }
  });
}
