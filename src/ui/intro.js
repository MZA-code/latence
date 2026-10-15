// Introduction d'ouverture : un calque noir devant le terminal éteint. Un seuil fait choisir le son (le
// navigateur ne joue rien avant un geste) ; puis un opérateur interroge les archives, qui répondent au
// téléscripteur ; la Ligne se dessine ; le compteur de l'interruption tourne ; un bouton allume le terminal.
// Après la première visite, seul le bouton reste, avec un lien pour revoir le dialogue.
// Le texte et les sons viennent du scénario (scenario.intro) : ce module ne connaît aucune histoire.

/** Le dialogue entier n'est montré qu'à la première visite. */
export const introEntiere = (store, cle) => !store.get(cle);
export const introVue = (store, cle) => store.set(cle, true);

/** Secondes entre deux instants ['JJ/MM/AAAA', 'HH:MM']. */
export function secondesEntre([d1, h1], [d2, h2]) {
  const t = (d, h) => {
    const [j, m, a] = d.split('/').map(Number);
    const [hh, mm] = h.split(':').map(Number);
    return Date.UTC(a, m - 1, j, hh, mm) / 1000;
  };
  return t(d2, h2) - t(d1, h1);
}

/** 1 675 380 s → « 19 J 10 H 43 MIN 00 S ». */
export function duree(s) {
  const deux = n => String(n).padStart(2, '0');
  const j = Math.floor(s / 86400), h = Math.floor(s / 3600) % 24, m = Math.floor(s / 60) % 60;
  return `${j} J ${deux(h)} H ${deux(m)} MIN ${deux(s % 60)} S`;
}

// Rythme, en millisecondes
const FRAPPE = [70, 140];      // une touche de l'opérateur
const CARACTERE = 22;          // un caractère des archives
const RESPIRE = 650;           // entre deux lignes de réponse
const REFLEXION = 900;         // entre une question et sa réponse

const el = (tag, cls, texte) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (texte) e.textContent = texte;
  return e;
};

/**
 * @param {{ calque: HTMLElement, intro: object, store: { get: Function, set: Function }, reduced: boolean,
 *           audio: import('../engine/audio.js').MinitelAudio, choisirSon: (oui: boolean) => void,
 *           onAllumer: () => void }} o
 */
export function monterIntro({ calque, intro, store, reduced, audio, choisirSon, onAllumer }) {
  const S = intro.sons || {};
  const jouer = (nom, ...args) => { if (S[nom]) audio.play(S[nom], ...args); };

  // ------------------------------------------------------------ le calque
  const seuil = el('div', 'intro-seuil');
  const avec = el('button', 'intro-bouton', intro.seuil.avecSon);
  const note = el('p', 'intro-note', intro.seuil.note);
  const sans = el('button', 'intro-lien', intro.seuil.sansSon);
  avec.type = sans.type = 'button';
  seuil.append(el('span', 'intro-curseur'), avec, note, sans);

  const ecran = el('div', 'intro-ecran');
  const console_ = el('div', 'intro-console');
  const actions = el('div', 'intro-actions');
  const bouton = el('button', 'intro-bouton', intro.bouton);
  const passer = el('button', 'intro-lien', 'Passer');
  const revoir = el('button', 'intro-lien', 'Revoir l\'introduction');
  bouton.type = passer.type = revoir.type = 'button';
  actions.append(bouton, passer, revoir);
  ecran.append(console_, actions);
  calque.append(seuil, ecran);

  const curseur = el('span', 'intro-curseur');
  let etapes = [], i = 0, minuteur = null, compteur = null, nappe = null;

  const montrer = (...els) => els.forEach(e => { e.hidden = false; });
  const cacher = (...els) => els.forEach(e => { e.hidden = true; });

  // ------------------------------------------------------------ le script, en petites étapes
  // Chaque étape agit, puis renvoie le délai avant la suivante ; vite : tout d'un coup, sans son.
  const pause = ms => etapes.push(() => ms);

  function taper(ligne, texte, { question = false } = {}) {
    const cible = el('span');
    etapes.push(() => { ligne.append(cible, curseur); return 0; });
    for (const ch of texte) {
      etapes.push(vite => {
        cible.textContent += ch;
        if (vite || ch === ' ') return question ? 40 : CARACTERE;
        if (question) { jouer('frappe'); return FRAPPE[0] + Math.random() * (FRAPPE[1] - FRAPPE[0]); }
        if (cible.textContent.length % 2) jouer('tic');
        return CARACTERE;
      });
    }
  }

  // Le dialogue descend : la dernière ligne reste en vue
  const suivre = () => { calque.scrollTop = calque.scrollHeight; };

  function ligne(cls) {
    const p = el('p', cls);
    etapes.push(() => { console_.append(p); suivre(); return 0; });
    return p;
  }

  function question(texte) {
    const p = ligne('intro-question');
    etapes.push(() => { p.append(el('span', 'intro-invite', '> ')); return 0; });
    taper(p, texte, { question: true });
    pause(REFLEXION);
  }

  function reponse(items) {
    for (const r of items) {
      const p = ligne('intro-reponse');
      const date = el('span', 'intro-date');
      const texte = el('span', 'intro-texte');
      etapes.push(() => { p.append(date, texte); return 0; });
      if (r.date) taper(date, r.date);
      taper(texte, r.texte);
      pause(RESPIRE);
    }
    etapes.push(vite => { if (!vite) jouer('bip'); return 500; });
  }

  function frise({ relais, muet }) {
    const f = el('div', 'intro-ligne');
    f.setAttribute('aria-hidden', 'true');
    const points = [];
    f.append(el('span', 'intro-astre', 'TERRE'), el('span', 'intro-point'));
    for (let n = 1; n <= relais; n++) {
      const r = el('span', 'intro-relais');
      r.dataset.nom = 'L' + n;
      f.append(el('span', 'intro-seg'), r);
      points.push(r);
    }
    f.append(el('span', 'intro-seg'), el('span', 'intro-point'), el('span', 'intro-astre', 'MARS'));
    etapes.push(() => { console_.append(f); suivre(); return 400; });
    // Chaque relais s'allume avec le segment qui le relie au précédent ; le dernier segment rejoint Mars
    points.forEach((r, n) => etapes.push(vite => {
      r.classList.add('is-on');
      r.previousElementSibling.classList.add('is-on');
      if (n === points.length - 1) r.nextElementSibling.classList.add('is-on');
      if (!vite) jouer('relais', n);
      return 230;
    }));
    const l = points[muet - 1];
    etapes.push(() => { l.classList.add('is-alerte'); return 2200; });
    etapes.push(vite => {
      l.classList.remove('is-alerte', 'is-on');
      l.classList.add('is-muet');
      l.previousElementSibling.classList.add('is-coupe');
      l.nextElementSibling.classList.add('is-coupe');
      if (!vite) jouer('extinction');
      return 1100;
    });
  }

  function chrono() {
    const p = ligne('intro-compteur');
    const base = secondesEntre(intro.silence, intro.arrivee);
    etapes.push(() => {
      const t0 = Date.now();
      const maj = () => { p.textContent = duree(base + Math.floor((Date.now() - t0) / 1000)); };
      maj();
      clearInterval(compteur);
      compteur = setInterval(maj, 1000);
      return 2400;
    });
  }

  function ecrire() {
    etapes = [];
    i = 0;
    for (const t of intro.entete) { taper(ligne('intro-entete'), t); pause(250); }
    pause(700);
    for (const e of intro.echanges) {
      question(e.question);
      if (e.reponse) reponse(e.reponse);
      if (e.ligne) frise(e.ligne);
      if (e.apres) reponse(e.apres);
      if (e.compteur) chrono();
    }
    etapes.push(() => { finir(); return 0; });
  }

  // ------------------------------------------------------------ déroulé
  function suivant() {
    if (i >= etapes.length) return;
    const d = etapes[i++](false);
    minuteur = setTimeout(suivant, d);
  }

  function toutAfficher() {
    clearTimeout(minuteur);
    while (i < etapes.length) etapes[i++](true);
  }

  function finir() {
    clearTimeout(minuteur);
    curseur.remove();
    console_.removeAttribute('aria-busy');
    cacher(passer, revoir);
    montrer(bouton);
    bouton.focus({ preventScroll: true });
    suivre();
  }

  function derouler() {
    console_.textContent = '';
    clearInterval(compteur);
    cacher(seuil, bouton, revoir);
    montrer(ecran, passer);
    console_.setAttribute('aria-busy', 'true');
    if (!nappe && audio.ready && S.nappe) {
      try { nappe = S.nappe(audio); } catch (e) { /* un son raté ne bloque pas l'introduction */ }
    }
    ecrire();
    if (reduced) toutAfficher(); else suivant();
  }

  function entrer(son) {
    choisirSon(son);
    audio.unlock();
    derouler();
  }

  function allumer() {
    clearTimeout(minuteur);
    clearInterval(compteur);
    introVue(store, intro.cle);
    document.removeEventListener('keydown', touche, true);
    if (nappe) { nappe(1.2); nappe = null; }
    audio.unlock();
    audio.modem();                          // la porteuse, puis le tube s'allume
    calque.classList.add('is-parti');
    document.body.classList.remove('intro-ouverte');
    setTimeout(() => { calque.hidden = true; }, reduced ? 0 : 700);
    setTimeout(onAllumer, audio.ready ? 1900 : 300);
  }

  // Entrée, Échap ou Espace pendant le dialogue : tout d'un coup
  function touche(e) {
    if (e.key !== 'Enter' && e.key !== 'Escape' && e.key !== ' ') return;
    if (!seuil.hidden || !bouton.hidden) return;   // les boutons reçoivent Entrée eux-mêmes
    e.preventDefault();
    toutAfficher();
  }

  avec.addEventListener('click', () => entrer(true));
  sans.addEventListener('click', () => entrer(false));
  passer.addEventListener('click', toutAfficher);
  revoir.addEventListener('click', () => { audio.unlock(); derouler(); });
  bouton.addEventListener('click', allumer);
  document.addEventListener('keydown', touche, true);

  calque.hidden = false;
  document.body.classList.add('intro-ouverte');   // la page derrière ne défile pas
  if (introEntiere(store, intro.cle)) {
    cacher(ecran);
    avec.focus({ preventScroll: true });
  } else {
    cacher(seuil, passer);
    montrer(ecran, bouton, revoir);
    bouton.focus({ preventScroll: true });
  }
}
