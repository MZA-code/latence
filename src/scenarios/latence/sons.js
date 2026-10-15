// LATENCE : les sons du jeu (docs/latence/interface.md, « Les sons »). Tout est synthétisé avec les
// outils de src/engine/audio.js. Aucune information n'est uniquement sonore : chaque son double une
// chose écrite à l'écran. Niveaux : très bas 0,012, bas 0,03, moyen 0,05 ; rien de fort ni de strident.

const passeHaut = frequency => ({ type: 'highpass', frequency });

/** Les sons brefs, joués par g.sound(nom). */
export const sons = {
  /** Le réveil : « le Martinet vous réveille avec trois notes polies ». */
  reveil(a) {
    const t = a.now + 0.05;
    [523, 659, 784].forEach((f, i) => a.tone(f, t + i * 0.22, 0.2, 0.03));
  },

  /** Un message du Contrôle : deux notes de 90 ms, 880 puis 1 320 Hz. */
  message(a) {
    const t = a.now + 0.02;
    a.tone(880, t, 0.09, 0.03);
    a.tone(1320, t + 0.11, 0.09, 0.03);
  },

  /** La bande de la Terre : un grésillement (bruit passe-bande, 1 à 3 kHz) le temps de l'affichage. */
  bande(a, duree) {
    a.noise(a.now, duree, 0.012, { type: 'bandpass', frequency: 1800, Q: 0.6 });
  },

  /** Le « tac » d'une ligne de bande qui s'affiche. */
  tac(a) {
    a.noise(a.now, 0.015, 0.03, passeHaut(1200));
  },

  /** Une impulsion de manœuvre, au rejeu de la jonction : un souffle bref de 150 ms. */
  impulsion(a) {
    a.noise(a.now, 0.15, 0.03, { type: 'lowpass', frequency: 800 });
  },

  /** La jonction : un choc sourd (60 Hz qui décroît en 300 ms), puis deux clics de verrouillage. */
  jonction(a) {
    const t = a.now + 0.02;
    a.tone(60, t, 0.3, 0.06, { to: 30 });
    a.noise(t + 0.4, 0.012, 0.05, passeHaut(1500));
    a.noise(t + 0.55, 0.012, 0.05, passeHaut(1500));
  },

  /** L'alarme de 15:35 : trois bips graves à 440 Hz. */
  alarme(a) {
    const t = a.now + 0.02;
    for (let i = 0; i < 3; i++) a.tone(440, t + i * 0.3, 0.18, 0.05);
  },

  /** Le bip de chaque minute, après l'alarme. */
  bip(a) {
    a.tone(440, a.now + 0.02, 0.18, 0.04);
  },

  /** La remise en service : une note qui monte. */
  remise(a) {
    a.tone(110, a.now + 0.02, 2.2, 0.05, { to: 880, type: 'triangle' });
  },

  /** Les 3 112 messages en attente qui s'écoulent : une pluie de clics. */
  messages(a) {
    const t = a.now;
    for (let i = 0; i < 90; i++) a.noise(t + Math.random() * 2.5, 0.006, 0.02, passeHaut(2500));
  },

  /** Le départ : un grondement grave, le temps de la poussée, en accéléré. */
  depart(a) {
    const t = a.now + 0.05;
    a.noise(t, 4, 0.06, { type: 'lowpass', frequency: 140 }, 'brun');
    a.tone(42, t, 4, 0.04, { to: 38 });
  },
};

/** Les ambiances, en boucle, une à la fois : le scénario choisit laquelle (ambiance(g)). */
export const ambiances = {
  /** La ventilation du Martinet : bruit brun, passe-bas à 300 Hz, lente modulation à 0,2 Hz. */
  ventilation: {
    start: a => a.bed(0.012, { color: 'brun', filter: { type: 'lowpass', frequency: 300 }, lfo: 0.2 }),
  },

  /**
   * La cuve de spiruline : de petites bulles graves et douces, au hasard, sur un bruit très filtré.
   * À la révélation, la ventilation s'efface en 1,5 s, puis trois secondes de silence : la cuve
   * n'arrive qu'au bout de 4,5 s.
   */
  cuve: {
    start(a) {
      const attente = 4.5;
      const fond = a.bed(0.006, { color: 'brun', filter: { type: 'lowpass', frequency: 180 }, delay: attente });
      const bulles = a.every(0.25, 1.6, t => {
        const f = 180 + Math.random() * 220;
        a.tone(f, t, 0.06 + Math.random() * 0.05, 0.012 + Math.random() * 0.01, { to: f * 1.8 });
      }, attente);
      return fondu => {
        fond(fondu);
        bulles();
      };
    },
  },
};

/**
 * L'introduction d'ouverture, avant le terminal : l'opérateur tape, les archives répondent au téléscripteur.
 * Chaque son double un texte qui s'écrit à l'écran.
 */
export const sonsIntro = {
  /** Une touche de l'opérateur : un clic sec, un peu plus grave que celui du terminal. */
  frappe(a) {
    a.noise(a.now, 0.012, 0.03, { type: 'bandpass', frequency: 1600 + Math.random() * 500, Q: 0.8 });
  },

  /** Un caractère de la réponse : un tic très bref et très bas. */
  tic(a) {
    a.noise(a.now, 0.006, 0.014, passeHaut(2600 + Math.random() * 800));
  },

  /** Fin d'une réponse : un bip court à 1 000 Hz, comme le BEL du terminal. */
  bip(a) {
    a.tone(1000, a.now + 0.01, 0.1, 0.03);
  },

  /** Un relais qui s'allume sur la frise : une note brève qui monte avec le numéro du relais. */
  relais(a, n) {
    a.tone(440 * Math.pow(2, n / 12), a.now + 0.01, 0.07, 0.016);
  },

  /** Le septième relais qui s'éteint : une note qui tombe. */
  extinction(a) {
    a.tone(660, a.now + 0.01, 0.6, 0.025, { to: 110 });
  },

  /**
   * Le fond : un souffle grave qui respire, et de loin en loin deux notes de données, très bas.
   * Renvoie l'arrêt, arret(fondu).
   */
  nappe(a) {
    const fond = a.bed(0.016, { color: 'brun', filter: { type: 'lowpass', frequency: 220 }, lfo: 0.12, fadeIn: 3 });
    const donnees = a.every(3, 7, t => {
      a.tone(1760, t, 0.04, 0.005);
      a.tone(2100, t + 0.07, 0.04, 0.004);
    }, 2);
    return fondu => {
      fond(fondu);
      donnees();
    };
  },
};
