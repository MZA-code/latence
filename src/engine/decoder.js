// Décodeur Vidéotex : interprète le flux 7 bits reçu du modem et écrit dans la mémoire de page.
// Règles d'après la STUM 1B : jeux G0 / G1 / G2, attributs parallèles (caractère) et série (zone),
// séparateurs US / RS / FF, répétition, rangée de service 00, CSI, séquences protocole ignorées.
import { GLYPH_G2, ACC_OK } from './font.js';
import { T_ALPHA, T_MOSAIC, T_DELIM, F_BLINK, F_INVERSE, F_LINE, F_MASK } from './screen.js';

// États de l'analyseur
const S_NONE = 0, S_ESC = 1, S_US = 2, S_REP = 3, S_SS2 = 4, S_ACCENT = 5,
  S_SKIP = 6, S_CSI = 7, S_MASKSCREEN = 8, S_ISO2022 = 9, S_PRO2 = 11;

export class Decoder {
  /**
   * @param {import('./screen.js').Screen} screen
   * @param {{ bell?: () => void }} hooks
   */
  constructor(screen, hooks = {}) {
    this.s = screen;
    this.hooks = hooks;
    this.power();
  }

  /** État à la mise sous tension : rangée 01 colonne 01, curseur éteint, mode page. */
  power() {
    this.r = 1; this.c = 1; this.cursor = false; this.scroll = false;
    this.state = S_NONE; this.seq = []; this.skip = 0; this.csi = '';
    this.last = null; this.saved = null; this.transp = false; this.tb = [];
    this.attrsDefault();
  }

  /** Blanc sur noir, jeu G0, simple taille, fixe, non ligné, non masqué. */
  attrsDefault() {
    this.g1 = false; this.fg = 7; this.blink = false; this.inv = false; this.size = 0; this.sep = false;
    this.lBg = 0; this.lUl = false; this.lMask = false; this.pend = false; this.acc = 0;
  }

  snapshot() {
    const { r, c, g1, fg, blink, inv, size, sep, lBg, lUl, lMask, pend } = this;
    return { r, c, g1, fg, blink, inv, size, sep, lBg, lUl, lMask, pend };
  }

  feed(b) {
    b &= 0x7F;
    if (this.transp) {                                        // transparence écran (ESC 0x25)
      const t = this.tb; t.push(b); if (t.length > 3) t.shift();
      if (t.length === 3 && t[0] === 0x1B && ((t[1] === 0x25 && t[2] === 0x40) || (t[1] === 0x2F && t[2] === 0x3F))) {
        this.transp = false; this.tb = [];
      }
      return;
    }
    if (b === 0x00) return;                                   // NUL : caractère de bourrage
    if (this.state) {
      if (b < 0x20) { this.state = S_NONE; this.acc = 0; }    // resynchronisation sur un code C0
      else return this.inSeq(b);
    }
    if (b < 0x20) return this.ctrl(b);
    if (this.g1) this.putG1(b); else this.putG0(b, 0);
  }

  inSeq(b) {
    switch (this.state) {
      case S_ESC: this.state = S_NONE; return this.esc(b);
      case S_US:
        this.seq.push(b);
        if (this.seq.length === 2) { this.state = S_NONE; this.us(this.seq[0], this.seq[1]); }
        return;
      case S_REP: this.state = S_NONE; return this.rep(b & 0x3F);
      case S_SS2: this.state = S_NONE; return this.ss2(b);
      case S_ACCENT: this.state = S_NONE; return this.accented(b);
      case S_SKIP: if (--this.skip <= 0) this.state = S_NONE; return;
      case S_CSI: return this.csiByte(b);
      case S_MASKSCREEN:
        this.seq.push(b);
        if (this.seq.length === 2) {
          this.state = S_NONE;
          if (this.seq[0] === 0x20) {
            if (this.seq[1] === 0x58) this.s.reveal = false;
            else if (this.seq[1] === 0x5F) this.s.reveal = true;
          }
        }
        return;
      case S_ISO2022: if (b >= 0x30) this.state = S_NONE; return;
      case S_PRO2:
        this.seq.push(b);
        if (this.seq.length === 2) {
          this.state = S_NONE;
          if (this.seq[1] === 0x43) {                         // mode rouleau
            if (this.seq[0] === 0x69) this.scroll = true;
            else if (this.seq[0] === 0x6A) this.scroll = false;
          }
        }
        return;
    }
    this.state = S_NONE;
  }

  ctrl(b) {
    switch (b) {
      case 0x07: if (this.hooks.bell) this.hooks.bell(); return;                 // BEL
      case 0x08: return this.bs();                                                // BS
      case 0x09: return this.ht();                                                // HT
      case 0x0A: return this.lf();                                                // LF
      case 0x0B: return this.vt();                                                // VT
      case 0x0C:                                                                  // FF
        this.s.clearRows(1, 24); this.r = 1; this.c = 1; this.saved = null; this.attrsDefault(); return;
      case 0x0D: this.c = 1; return;                                              // CR
      case 0x0E: this.g1 = true; this.size = 0; this.inv = false; this.lUl = false; return; // SO
      case 0x0F: this.g1 = false; this.sep = false; return;                       // SI
      case 0x11: this.cursor = true; return;                                      // CON
      case 0x12: this.state = S_REP; return;                                      // REP
      case 0x13: this.state = S_SKIP; this.skip = 1; return;                      // SEP
      case 0x14: this.cursor = false; return;                                     // COFF
      case 0x18: return this.can();                                               // CAN
      case 0x19: if (!this.g1) this.state = S_SS2; return;                        // SS2
      case 0x1A: return this.putBlock();                                          // SUB
      case 0x1B: this.state = S_ESC; return;                                      // ESC
      case 0x1D: this.state = S_SKIP; this.skip = 1; return;                      // SS3
      case 0x1E: this.r = 1; this.c = 1; this.saved = null; this.attrsDefault(); return; // RS
      case 0x1F: this.state = S_US; this.seq = []; return;                        // US
    }
  }

  esc(b) {
    if (b >= 0x40 && b <= 0x47) { this.fg = b - 0x40; return; }                  // couleur de caractère
    if (b >= 0x50 && b <= 0x57) { this.lBg = b - 0x50; this.pend = true; return; } // couleur de fond (série)
    switch (b) {
      case 0x48: this.blink = true; return;
      case 0x49: this.blink = false; return;
      case 0x4C: if (!this.g1) this.size = 0; return;
      case 0x4D: case 0x4E: case 0x4F:
        if (this.g1) return;
        if (b !== 0x4E && this.r < 2) return;   // pas de double hauteur en rangées 00 et 01
        this.size = b - 0x4C; return;
      case 0x58: this.lMask = true; this.pend = true; return;
      case 0x5F: this.lMask = false; this.pend = true; return;
      case 0x59: if (this.g1) this.sep = false; else { this.lUl = false; this.pend = true; } return;
      case 0x5A: if (this.g1) this.sep = true; else { this.lUl = true; this.pend = true; } return;
      case 0x5C: if (!this.g1) this.inv = false; return;
      case 0x5D: if (!this.g1) this.inv = true; return;
      case 0x5B: this.state = S_CSI; this.csi = ''; return;                      // CSI
      case 0x39: this.state = S_SKIP; this.skip = 1; return;                     // PRO1
      case 0x3A: this.state = S_PRO2; this.seq = []; return;                     // PRO2
      case 0x3B: this.state = S_SKIP; this.skip = 3; return;                     // PRO3
      case 0x35: case 0x36: case 0x37: this.state = S_SKIP; this.skip = 1; return;
      case 0x23: this.state = S_MASKSCREEN; this.seq = []; return;               // masquage plein écran
      case 0x25: this.transp = true; this.tb = []; return;                       // transparence écran
    }
    if (b >= 0x20 && b <= 0x2F) this.state = S_ISO2022;
  }

  us(a, b) {
    let r, c;
    if (a >= 0x40 && b >= 0x40) {
      r = a - 0x40; c = b - 0x40;
      if (r > 24 || c < 1 || c > 40) return;
    } else if (a >= 0x30 && a <= 0x32 && b >= 0x30 && b <= 0x39) {
      r = (a - 0x30) * 10 + (b - 0x30); c = 1;
      if (r < 1 || r > 24) return;
    } else return;
    if (r === 0) { if (this.r !== 0) this.saved = this.snapshot(); }   // LF y ramènera
    else this.saved = null;
    this.r = r; this.c = c;
    this.attrsDefault();
  }

  bs() {
    if (this.r === 0) { if (this.c > 1) this.c--; return; }
    if (--this.c < 1) { this.c = 40; if (--this.r < 1) this.r = 24; }
  }

  ht() {
    if (this.r === 0) { if (this.c < 40) this.c++; return; }
    if (++this.c > 40) { this.c = 1; if (++this.r > 24) this.r = 1; }
  }

  lf() {
    if (this.r === 0) {
      if (this.saved) { Object.assign(this, this.saved); this.saved = null; } else this.r = 1;
      return;
    }
    if (this.r === 24) { if (this.scroll) this.s.scroll(1); else this.r = 1; } else this.r++;
  }

  vt() {
    if (this.r === 0) return;
    if (this.r === 1) { if (this.scroll) this.s.scroll(-1); else this.r = 24; } else this.r--;
  }

  can() {
    const base = this.r * 40;
    for (let c = this.c; c <= 40; c++) {
      const i = base + c - 1;
      if (this.g1) this.s.set(i, T_MOSAIC, 0x20, 0, 0, this.fg, this.lBg, this.sep ? F_LINE : 0, 0);
      else this.s.set(i, T_ALPHA, 0x20, 0, 0, this.fg, 0, this.inv ? F_INVERSE : 0, 0);
    }
  }

  rep(n) {
    const d = this.last;
    if (!d) return;
    for (let k = 0; k < n; k++) {
      if (d.k === 0) this.putG0(d.code, d.acc);
      else if (d.k === 1) this.putG1(d.code);
      else if (d.k === 2) this.putG2(d.code);
      else this.putBlock();
    }
  }

  ss2(b) {
    if (b >= 0x41 && b <= 0x4F) { this.acc = b; this.state = S_ACCENT; return; }
    this.putG2(b);
  }

  accented(b) {
    const acc = this.acc;
    this.acc = 0;
    const ok = ACC_OK[acc] && ACC_OK[acc].indexOf(String.fromCharCode(b)) >= 0;
    this.putG0(b, ok ? acc : 0);
  }

  putG0(code, acc) {
    if (code === 0x7F) return this.putBlock();
    if (code === 0x20) {
      if (this.pend) {   // premier espace après un attribut série : délimiteur de zone
        this.pend = false;
        this.write(T_DELIM, 0x20, 0, 0, this.fg, this.lBg,
          (this.inv ? F_INVERSE : 0) | (this.lUl ? F_LINE : 0) | (this.lMask ? F_MASK : 0));
      } else {
        this.write(T_ALPHA, 0x20, 0, 0, this.fg, 0, this.inv ? F_INVERSE : 0);
      }
      this.last = { k: 0, code: 0x20, acc: 0 };
      return;
    }
    this.write(T_ALPHA, code, 0, acc, this.fg, 0, (this.blink ? F_BLINK : 0) | (this.inv ? F_INVERSE : 0));
    this.last = { k: 0, code, acc };
  }

  putG1(code) {
    if (code >= 0x40 && code <= 0x5E) {
      this.write(T_ALPHA, code, 0, 0, this.fg, 0, this.blink ? F_BLINK : 0);
    } else {
      if (code === 0x5F) code = 0x7F;
      if (code === 0x20 && this.pend) {
        this.pend = false;
        this.write(T_DELIM, 0x20, 0, 0, this.fg, this.lBg, this.lMask ? F_MASK : 0);
      } else {
        this.write(T_MOSAIC, code, 0, 0, this.fg, this.lBg, (this.blink ? F_BLINK : 0) | (this.sep ? F_LINE : 0));
      }
    }
    this.last = { k: 1, code };
  }

  putG2(code) {
    const ok = GLYPH_G2[code] !== undefined;
    // symbole absent du répertoire : barre horizontale basse
    this.write(T_ALPHA, ok ? code : 0x5F, ok ? 1 : 0, 0, this.fg, 0, (this.blink ? F_BLINK : 0) | (this.inv ? F_INVERSE : 0));
    this.last = { k: 2, code };
  }

  /** Pavé plein : DEL (0x7F), SUB (0x1A) ou caractère erroné. */
  putBlock() {
    if (this.g1) this.write(T_MOSAIC, 0x7F, 0, 0, this.fg, this.lBg, (this.blink ? F_BLINK : 0) | (this.sep ? F_LINE : 0));
    else this.write(T_ALPHA, 0x7F, 0, 0, this.fg, 0, (this.blink ? F_BLINK : 0) | (this.inv ? F_INVERSE : 0));
    this.last = { k: 3 };
  }

  write(t, code, set, acc, fg, bg, fl) {
    const r = this.r, c = this.c;
    const sz = (t === T_MOSAIC || this.g1) ? 0 : this.size;
    let w = (sz & 2) ? 2 : 1, h = (sz & 1) ? 2 : 1;
    if (r === 0) { w = 1; h = 1; }
    if (h === 2 && r < 2) h = 1;
    if (w === 2 && c === 40) w = 1;
    // Les caractères agrandis sont engendrés à partir du bas gauche.
    for (let y = 0; y < h; y++) {
      const rr = r - (h - 1) + y;
      for (let x = 0; x < w; x++) {
        const part = (w === 2 ? (x ? 2 : 1) : 0) | ((h === 2 ? (y ? 2 : 1) : 0) << 2);
        this.s.set(rr * 40 + c - 1 + x, t, code, set, acc, fg, bg, fl, part);
      }
    }
    this.c += w;
    if (this.c > 40) {                     // débordement
      if (r === 0) { this.c = 40; return; }
      this.c = 1;
      this.r += h;
      if (this.r > 24) {
        if (this.scroll) { this.s.scroll(1); if (h === 2) this.s.scroll(1); this.r = 24; }
        else this.r = h === 2 ? 2 : 1;
      }
    }
  }

  csiByte(b) {
    if (b >= 0x30 && b <= 0x3F) {
      this.csi += String.fromCharCode(b);
      if (this.csi.length > 12) this.state = S_NONE;
      return;
    }
    if (b >= 0x20 && b <= 0x2F) return;
    this.state = S_NONE;
    if (this.r === 0) return;                            // pas de CSI en rangée 00
    const s = this.s;
    const ps = this.csi.split(';').map(x => parseInt(x, 10) || 0);
    const n = Math.max(1, ps[0] || 0), row = this.r, base = row * 40, cur = base + this.c - 1;
    switch (b) {
      case 0x41: this.r = Math.max(1, this.r - n); return;
      case 0x42: this.r = Math.min(24, this.r + n); return;
      case 0x43: this.c = Math.min(40, this.c + n); return;
      case 0x44: this.c = Math.max(1, this.c - n); return;
      case 0x48:
        this.r = Math.min(24, Math.max(1, ps[0] || 1));
        this.c = Math.min(40, Math.max(1, ps[1] || 1));
        return;
      case 0x4A: {
        const m = ps[0] || 0;
        const a = m === 0 ? cur : 40, z = m === 1 ? cur : 999;
        for (let i = a; i <= z; i++) s.black(i);
        return;
      }
      case 0x4B: {
        const m = ps[0] || 0;
        const a = m === 0 ? cur : base, z = m === 1 ? cur : base + 39;
        for (let i = a; i <= z; i++) s.black(i);
        return;
      }
      case 0x50: {
        const c0 = this.c - 1, k = Math.min(n, 40 - c0);
        for (let c = c0; c < 40; c++) { if (c + k < 40) s.copyCell(base + c + k, base + c); else s.black(base + c); }
        return;
      }
      case 0x40: {
        const c0 = this.c - 1, k = Math.min(n, 40 - c0);
        for (let c = 39; c >= c0; c--) { if (c - k >= c0) s.copyCell(base + c - k, base + c); else s.black(base + c); }
        return;
      }
      case 0x4D: for (let k = 0; k < n; k++) s.deleteRow(row); return;
      case 0x4C: for (let k = 0; k < n; k++) s.insertRow(row); return;
    }
  }
}
