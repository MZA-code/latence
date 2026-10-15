// Un volet latéral, caché à droite de la page (réglages de l'écran, rapport d'essai). Un bouton l'ouvre
// et le ferme ; Échap et son bouton « Fermer » le ferment, et le focus revient au bouton. Un seul volet
// est ouvert à la fois. Le volet porte data-garde-touches : tant qu'il a le focus, ses touches ne vont
// pas au jeu (voir src/ui/keyboard.js).

let ouvertMaintenant = null;

/**
 * @param {{ bouton: HTMLElement, volet: HTMLElement, focus?: () => HTMLElement, onOpen?: () => void }} o
 *   focus : l'élément qui reçoit le focus à l'ouverture (le volet lui-même par défaut)
 * @returns {{ basculer: (etat: boolean) => void }}
 */
export function voletLateral({ bouton, volet, focus = () => volet, onOpen = () => {} }) {
  let ouvert = false;
  const ce = {
    basculer(etat) {
      if (etat === ouvert) return;
      ouvert = etat;
      if (etat) {
        if (ouvertMaintenant) ouvertMaintenant.basculer(false);
        ouvertMaintenant = ce;
        onOpen();
      } else if (ouvertMaintenant === ce) {
        ouvertMaintenant = null;
      }
      volet.classList.toggle('is-open', etat);
      bouton.setAttribute('aria-expanded', String(etat));
      if (etat) (focus() || volet).focus();
      else if (volet.contains(document.activeElement)) bouton.focus();
    },
  };
  volet.querySelector('[data-volet="fermer"]').addEventListener('click', () => ce.basculer(false));
  bouton.addEventListener('click', () => ce.basculer(!ouvert));
  // Échap ferme le volet avant que le jeu ne le reçoive (ANNULATION)
  window.addEventListener('keydown', e => {
    if (!ouvert || e.key !== 'Escape') return;
    e.preventDefault();
    e.stopPropagation();
    ce.basculer(false);
  }, true);
  return ce;
}
