// Scène : photo de fond, écran posé par homographie, calage des 4 coins, loupe, dépôt de fichiers.
import { MARGIN } from '../engine/index.js';
import { homography, dist } from '../ui/homography.js';
import { store, files } from '../ui/storage.js';

/** Coins de la trame dans le cadre neutre (sans photo), en fraction de la scène. */
const TUBE_CORNERS = [[0.12, 0.11], [0.88, 0.11], [0.88, 0.89], [0.12, 0.89]];
const CORNER_NAMES = ['HG', 'HD', 'BD', 'BG'];
const $ = id => document.getElementById(id);

/**
 * @param {{ minitel: import('../engine/minitel.js').Minitel, settings: object,
 *           onVdt: (bytes: Uint8Array, name: string) => void, onChange: () => void,
 *           toast: (msg: string) => void }} o
 */
export function createStage({ minitel, settings, onVdt, onChange, toast }) {
  const stage = $('stage'), photoImg = $('photo'), tube = $('tube'), glare = $('glare');
  const screenEl = $('screen'), calibEl = $('calib'), quad = $('quad'), loupe = $('loupe');
  const dropEl = $('drop'), stageNote = $('stageNote');
  const handles = [...calibEl.querySelectorAll('.handle')];
  const canvas = minitel.canvas;

  let corners = TUBE_CORNERS.map(p => p.slice());
  let photo = null, photoURL = null, calibOn = false, drag = null;
  let SW = 1, SH = 1;

  function applyTransform(resize) {
    const P = corners.map(([u, v]) => [u * SW, v * SH]);
    const rw = Math.max(32, (dist(P[0], P[1]) + dist(P[3], P[2])) / 2);
    const rh = Math.max(24, (dist(P[0], P[3]) + dist(P[1], P[2])) / 2);
    const m = MARGIN, ew = rw * (1 + 2 * m), eh = rh * (1 + 2 * m);
    screenEl.style.width = ew + 'px';
    screenEl.style.height = eh + 'px';
    const src = [[m * rw, m * rh], [m * rw + rw, m * rh], [m * rw + rw, m * rh + rh], [m * rw, m * rh + rh]];
    const M = homography(src, P);
    if (M) screenEl.style.transform = 'matrix3d(' + M.map(n => n.toFixed(9)).join(',') + ')';
    if (resize) {
      // Le canvas suit la taille affichée (plafonnée) pour rester net sans gaspiller le GPU
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      let cw = Math.round(ew * dpr), ch = Math.round(eh * dpr);
      const k = Math.sqrt(Math.min(1, 3.2e6 / (cw * ch)));
      cw = Math.max(64, Math.round(cw * k));
      ch = Math.max(50, Math.round(ch * k));
      if (canvas.width !== cw || canvas.height !== ch) { canvas.width = cw; canvas.height = ch; }
    }
  }

  function placeHandles() {
    handles.forEach((h, k) => {
      h.style.left = corners[k][0] * SW + 'px';
      h.style.top = corners[k][1] * SH + 'px';
    });
    quad.setAttribute('points', corners.map(([u, v]) => (u * SW).toFixed(1) + ',' + (v * SH).toFixed(1)).join(' '));
  }

  function layout() {
    const rect = stage.getBoundingClientRect();
    SW = Math.max(1, rect.width);
    SH = Math.max(1, rect.height);
    applyTransform(true);
    placeHandles();
  }

  function saveCorners() {
    if (photo) store.set('minitel-escape:calage', { corners, name: photo.name });
    onChange();
  }

  function setCalib(on) {
    calibOn = on;
    calibEl.hidden = !on;
    if (on) placeHandles();
    onChange();
  }

  function guessCorners(ar) {
    const wf = 0.44, hf = Math.min(0.7, wf * ar / 1.28), cx = 0.5, cy = 0.43;
    return [[cx - wf / 2, cy - hf / 2], [cx + wf / 2, cy - hf / 2], [cx + wf / 2, cy + hf / 2], [cx - wf / 2, cy + hf / 2]];
  }

  function applyBlend() {
    const opaque = !!photo && settings.blend === 'normal';
    screenEl.classList.toggle('is-opaque', opaque);
    minitel.params.opaque = opaque ? 1 : 0;
  }

  function setPhoto(blob, fresh, name) {
    const nm = name || blob.name || 'photo';
    if (photoURL) URL.revokeObjectURL(photoURL);
    photoURL = URL.createObjectURL(blob);
    photoImg.onload = () => {
      const w = photoImg.naturalWidth, h = photoImg.naturalHeight;
      photo = { name: nm, w, h };
      stage.style.setProperty('--ar', (w / h).toFixed(5));
      photoImg.hidden = false;
      tube.hidden = true;
      glare.hidden = true;
      stageNote.hidden = true;
      if (fresh) {
        corners = guessCorners(w / h);
        settings.blend = 'screen';
        setCalib(true);
      } else {
        const saved = store.get('minitel-escape:calage');
        if (saved && Array.isArray(saved.corners) && saved.corners.length === 4) corners = saved.corners;
      }
      applyBlend();
      requestAnimationFrame(() => { layout(); saveCorners(); });
    };
    photoImg.src = photoURL;
    if (fresh) {
      files.put('photo', blob);
      store.set('minitel-escape:photo', { name: nm });
    }
  }

  function removePhoto() {
    if (photoURL) URL.revokeObjectURL(photoURL);
    photoURL = null;
    photo = null;
    photoImg.hidden = true;
    photoImg.removeAttribute('src');
    tube.hidden = false;
    glare.hidden = false;
    stageNote.hidden = false;
    stage.style.setProperty('--ar', '1.3333');
    corners = TUBE_CORNERS.map(p => p.slice());
    files.del('photo');
    store.set('minitel-escape:calage', null);
    setCalib(false);
    applyBlend();
    requestAnimationFrame(layout);
  }

  function recenter() {
    corners = photo ? guessCorners(photo.w / photo.h) : TUBE_CORNERS.map(p => p.slice());
    layout();
    saveCorners();
    if (photo && !calibOn) setCalib(true);
  }

  function exportCalage() {
    const pc = ([u, v]) => [+(u * 100).toFixed(3), +(v * 100).toFixed(3)];
    return JSON.stringify({
      photo: photo ? { fichier: photo.name, largeur: photo.w, hauteur: photo.h } : null,
      trame: { largeur: 320, hauteur: 250, marge: MARGIN },
      coins: {
        unite: '% de la photo',
        hautGauche: pc(corners[0]), hautDroit: pc(corners[1]), basDroit: pc(corners[2]), basGauche: pc(corners[3]),
      },
      rendu: {
        phosphore: settings.phos, courbure: settings.curv, balayage: settings.scan, halo: settings.bloom,
        remanence: settings.persist, incrustation: settings.blend === 'normal' ? 'opaque' : 'screen',
      },
    }, null, 2);
  }

  function moveLoupe(k) {
    if (!photoURL) { loupe.hidden = true; return; }
    const Z = 3, L = 136, x = corners[k][0] * SW, y = corners[k][1] * SH;
    loupe.hidden = false;
    loupe.style.backgroundImage = `url("${photoURL}")`;
    loupe.style.backgroundSize = `${SW * Z}px ${SH * Z}px`;
    loupe.style.backgroundPosition = `${-(x * Z - L / 2)}px ${-(y * Z - L / 2)}px`;
    const lx = x > SW / 2 ? x - L - 26 : x + 26, ly = y > SH / 2 ? y - L - 26 : y + 26;
    loupe.style.left = Math.max(4, Math.min(SW - L - 4, lx)) + 'px';
    loupe.style.top = Math.max(4, Math.min(SH - L - 4, ly)) + 'px';
  }

  // Poignées : glisser à la souris ou au doigt, flèches du clavier pour affiner
  handles.forEach((h, k) => {
    h.addEventListener('pointerdown', e => {
      e.preventDefault();
      h.setPointerCapture(e.pointerId);
      drag = { k, id: e.pointerId };
      h.classList.add('is-drag');
      moveLoupe(k);
    });
    h.addEventListener('pointermove', e => {
      if (!drag || drag.id !== e.pointerId) return;
      const rect = stage.getBoundingClientRect();
      corners[k] = [
        Math.min(1.1, Math.max(-0.1, (e.clientX - rect.left) / rect.width)),
        Math.min(1.1, Math.max(-0.1, (e.clientY - rect.top) / rect.height)),
      ];
      placeHandles();
      applyTransform(false);
      moveLoupe(k);
    });
    const end = () => {
      if (!drag) return;
      drag = null;
      h.classList.remove('is-drag');
      loupe.hidden = true;
      applyTransform(true);
      saveCorners();
    };
    h.addEventListener('pointerup', end);
    h.addEventListener('pointercancel', end);
    h.addEventListener('keydown', e => {
      const step = e.shiftKey ? 0.01 : 0.001;
      let [u, v] = corners[k];
      if (e.key === 'ArrowLeft') u -= step;
      else if (e.key === 'ArrowRight') u += step;
      else if (e.key === 'ArrowUp') v -= step;
      else if (e.key === 'ArrowDown') v += step;
      else return;
      e.preventDefault();
      corners[k] = [u, v];
      placeHandles();
      applyTransform(true);
      saveCorners();
    });
  });

  // Dépôt d'une photo ou d'un fichier .vdt sur l'écran
  let depth = 0;
  stage.addEventListener('dragenter', e => { e.preventDefault(); depth++; dropEl.hidden = false; });
  stage.addEventListener('dragover', e => e.preventDefault());
  stage.addEventListener('dragleave', () => { if (--depth <= 0) { depth = 0; dropEl.hidden = true; } });
  stage.addEventListener('drop', e => {
    e.preventDefault();
    depth = 0;
    dropEl.hidden = true;
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) takeFile(f);
  });

  async function takeFile(file) {
    if (/^image\//.test(file.type) || /\.(jpe?g|png|webp|gif|avif|heic)$/i.test(file.name)) {
      setPhoto(file, true, file.name);
      return;
    }
    try {
      onVdt(new Uint8Array(await file.arrayBuffer()), file.name);
    } catch (e) {
      toast('Lecture impossible : ' + file.name);
    }
  }

  new ResizeObserver(() => layout()).observe(stage);

  /** Recharge la photo et le calage de la visite précédente. */
  async function restore() {
    const blob = await files.get('photo');
    if (blob instanceof Blob) {
      const meta = store.get('minitel-escape:photo');
      setPhoto(blob, false, meta && meta.name);
    }
  }

  return {
    layout, setCalib, removePhoto, recenter, applyBlend, exportCalage, takeFile, restore,
    get calibOn() { return calibOn; },
    get photo() { return photo; },
    get corners() { return corners.map(([u, v], k) => ({ name: CORNER_NAMES[k], u, v })); },
  };
}
