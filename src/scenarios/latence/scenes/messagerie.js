// LATENCE : la messagerie du Contrôle. Chaque message porte son heure ; les réponses arrivent trop vite.
import { title, para, footer, menuLine, choicePrompt, tag, rule } from '../../../game/ui.js';
import { hms } from '../../../game/state.js';
import { QUESTIONS, texteMessage } from '../messages.js';
import { choix, debut, item } from '../page.js';

const PAR_PAGE = 10;

/** Une ligne de la liste : numéro, heure, * non lu ou > envoyé, début du texte. */
function ligne(p, r, n, m) {
  p.at(r, 2).inv().text(String(n).padStart(2) + ' ').inv(false);
  p.at(r, 6).fg(6).text(hms(m.at));
  p.at(r, 15).text(m.out ? '>' : m.read ? ' ' : '*');
  p.at(r, 17).text(debut(texteMessage(m.id), 23));
}

/** Le menu de la liste : 0 pour écrire, puis un numéro par message (1 ou 01). */
function choixMessages(g) {
  const menu = { 0: 'ecrire', '00': 'ecrire' };
  g.s.mail.forEach((m, i) => {
    const lire = gg => {
      gg.vars.lu = i;
      gg.go('message');
    };
    menu[i + 1] = lire;
    menu[String(i + 1).padStart(2, '0')] = lire;
  });
  return menu;
}

const messagerie = {
  pages: g => Math.max(1, Math.ceil(g.s.mail.length / PAR_PAGE)),
  render(g, p, page) {
    title(p, 'MESSAGERIE');
    const n = Math.max(1, Math.ceil(g.s.mail.length / PAR_PAGE));
    if (n > 1) tag(p, `${page + 1}/${n}`);
    p.at(5, 2).fg(4).text('* non lu   > envoyé par vous');
    if (!g.s.mail.length) para(p, 7, 'Aucun message.');
    g.s.mail.slice(page * PAR_PAGE, (page + 1) * PAR_PAGE)
      .forEach((m, i) => ligne(p, 7 + i, page * PAR_PAGE + i + 1, m));
    item(p, 18, 0, 'Écrire au Contrôle');
    choicePrompt(p, 20, 2);
    footer(p, n > 1 ? [['SUITE', 'messages suivants'], ['RETOUR', 'précédents']] : [['ENVOI', 'lire ou écrire']]);
  },
  fields: () => [choix(20, 2)],
  menu: choixMessages,
};

const message = {
  enter(g) {
    const m = g.s.mail[g.vars.lu];
    if (m && !m.out && !m.read) g.markRead(m.id);
  },
  render(g, p) {
    const m = g.s.mail[g.vars.lu] || g.s.mail[0];
    title(p, 'MESSAGE');
    if (!m) return;
    const tete = m.out
      ? ['A : CONTROLE DE LA LIGNE', 'ENVOYE A ' + hms(m.at)]
      : ['DE : CONTROLE DE LA LIGNE', 'CANAL DE SERVICE - COURTE PORTEE', 'RECU A ' + hms(m.at)];
    tete.forEach((t, i) => p.at(5 + i, 2).fg(6).text(t));
    rule(p, 9);
    para(p, 11, g.accord(texteMessage(m.id)));
    footer(p, [['RETOUR', 'la messagerie']]);
  },
};

/** Envoie une question au Contrôle et revient à la liste. */
function envoie(g, q) {
  g.ask(q);
  g.back();
  g.flash('Message envoyé.');
}

/** Les questions qu'on peut encore poser ; plus aucune une fois Irène démasquée. */
const aPoser = g => (g.s.flags.demasquee ? [] : g.questions(QUESTIONS));

const ecrire = {
  render(g, p) {
    title(p, 'ECRIRE AU CONTROLE');
    if (g.s.flags.demasquee) {
      para(p, 6, 'Irène vous attend dans les quartiers de garde.');
      return;
    }
    const qs = aPoser(g);
    if (!qs.length) {
      para(p, 6, 'Aucune question à poser pour le moment.');
      return;
    }
    let r = para(p, 5, 'Choisissez une question :', { fg: 6 });
    qs.forEach((q, i) => {
      menuLine(p, r, i + 1, '');
      r = para(p, r, q.texte, { c: 7, width: 33 });
    });
    choicePrompt(p, 21);
  },
  fields: g => (aPoser(g).length ? [choix(21)] : []),
  menu: g => Object.fromEntries(aPoser(g).map((q, i) => [i + 1, gg => envoie(gg, q)])),
};

export default { messagerie, message, ecrire };
