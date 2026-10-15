// LATENCE : les quartiers de garde (acte III). La porte s'ouvre et C10 arrive, Alix entre, Irène se
// lève ; puis le menu des quartiers : parler à Irène, lire la main courante, lire la note de Lenglet.
import { title, para, paras, footer, choicePrompt, menuLine, tag } from '../../../game/ui.js';
import { hms } from '../../../game/state.js';
import { IRENE, NOTE } from '../data.js';
import { CONTROLE } from '../messages.js';
import { MAIN_COURANTE, NOTE_LENGLET, DIALOGUE, SESSION } from '../recit.js';
import { choix, item } from '../page.js';

const suite = [['ENVOI', 'la suite']];

/** La porte s'ouvre ; un temps, puis le V40 reçoit C10. Pour la première fois, le message tutoie Alix. */
const porte = {
  render(g, p) {
    title(p, 'QUARTIERS DE GARDE');
    const r = para(p, 5, 'La porte glisse. Une bouffée d\'air chaud et humide, qui sent la terre mouillée.');
    if (!g.m.reduced) p.pad(240);                // deux secondes à 1200 bauds
    const c10 = g.s.mail.find(m => m.id === 'C10');
    ['DE : CONTROLE DE LA LIGNE', 'CANAL DE SERVICE - COURTE PORTEE', 'RECU A ' + hms(c10 ? c10.at : g.now)]
      .forEach((t, i) => p.at(r + i, 2).fg(6).text(t));
    para(p, r + 4, CONTROLE.C10);
    footer(p, [['ENVOI', 'entrer']]);
  },
  next: () => 'entree',
};

const entree = {
  enter(g) { if (!g.s.flags.revelation) g.unlock('revelation'); },
  render(g, p) {
    title(p, 'QUARTIERS DE GARDE');
    let r = para(p, 5, `Deux couchettes, dont une défaite. Des bacs de lentilles sous une lampe violette. Une cuve verte qui bouillonne doucement. Au mur, un calendrier fait main : ${SESSION} traits, groupés par cinq.`);
    r = para(p, r, `Sur le terminal des quartiers, une session est ouverte depuis ${SESSION} jours :`, { gap: 0 });
    p.at(r, 4).fg(3).text(IRENE.nom.toUpperCase());
    footer(p, suite);
  },
  next: () => 'irene',
};

const irene = {
  render(g, p) {
    title(p, 'QUARTIERS DE GARDE');
    paras(p, 5, [
      'Quelqu\'un se lève derrière la cuve de spiruline. Les cheveux plus courts et plus gris que dans votre souvenir.',
      '',
      'Irène Vasseur vous regarde comme on regarde une réponse qui arrive enfin.',
    ]);
    footer(p, suite);
  },
  next: () => 'quartiers-menu',
};

const quartiersMenu = {
  parent: 'relais',
  render(g, p) {
    title(p, 'QUARTIERS DE GARDE');
    item(p, 6, 1, 'Parler à Irène');
    item(p, 8, 2, 'Lire la main courante');
    item(p, 10, 3, 'Lire la note de Lenglet');
    choicePrompt(p, 14);
  },
  fields: () => [choix(14)],
  menu: () => ({ 1: 'parler', 2: 'main-courante', 3: 'note-lenglet' }),
};

/** La main courante : une entrée par page, l'heure telle qu'Irène l'a écrite. */
const mainCourante = {
  pages: MAIN_COURANTE.length,
  render(g, p, page) {
    const [date, heure, texte] = MAIN_COURANTE[page];
    tag(p, `${page + 1}/${MAIN_COURANTE.length}`);
    title(p, 'MAIN COURANTE');
    p.at(5, 2).fg(6).text(`${date}, ${heure}.`);
    para(p, 7, texte);
    const retour = ['RETOUR', page ? 'entrée précédente' : 'les quartiers'];
    footer(p, page + 1 < MAIN_COURANTE.length ? [['SUITE', 'entrée suivante'], retour] : [retour]);
  },
};

const noteLenglet = {
  render(g, p) {
    title(p, 'NOTE INTERNE');
    p.at(4, 2).fg(6).text('DIRECTION DES OPERATIONS');
    p.at(5, 2).fg(6).text(NOTE.date);
    paras(p, 7, NOTE_LENGLET);
  },
};

// ---------------------------------------------------------------- le dialogue

const posees = g => g.s.data.dialogue || [];
/** « Et maintenant ? » n'apparaît qu'une fois les trois premières questions posées. */
const ouvertes = g => ([0, 1, 2].every(i => posees(g)[i]) ? DIALOGUE : DIALOGUE.slice(0, 3));

const parler = {
  render(g, p) {
    title(p, 'PARLER A IRENE');
    para(p, 5, 'Irène est en face de vous. Vous lui demandez :', { fg: 6 });
    let r = 7;
    ouvertes(g).forEach((d, i) => {
      menuLine(p, r, i + 1, '');
      r = para(p, r, d.question, { c: 7, width: 33, fg: posees(g)[i] ? 4 : 7 });
    });
    choicePrompt(p, 21);
  },
  fields: () => [choix(21)],
  menu: g => Object.fromEntries(ouvertes(g).map((d, i) => [i + 1, gg => {
    gg.vars.question = i;
    gg.go('reponse');
  }])),
};

const reponse = {
  enter(g) {
    const i = g.vars.question;
    if (i === undefined) return;
    const dites = posees(g).slice();
    dites[i] = true;
    g.s.data.dialogue = dites;
    if (i === 3 && !g.s.flags.cle2) g.unlock('cle2');   // « Voilà la clé 2. »
    g.save();
  },
  render(g, p) {
    const i = g.vars.question || 0;
    const d = DIALOGUE[i];
    title(p, 'PARLER A IRENE');
    // De vive voix, pas par le terminal : la question d'Alix, puis la réponse d'Irène entre guillemets
    const r = para(p, 5, `Vous : « ${d.question} »`, { fg: 6 });
    para(p, r, `Irène : « ${g.accord(d.reponse)} »`);
    if (i === 3) p.at(24, 2).fg(6).text('Vous avez la clé 2.');
    footer(p, [['RETOUR', 'les questions']]);
  },
};

export default {
  porte,
  entree,
  irene,
  'quartiers-menu': quartiersMenu,
  'main-courante': mainCourante,
  'note-lenglet': noteLenglet,
  parler,
  reponse,
};
