// Tube cathodique : faisceau (lignes de balayage), halo, courbure, vignettage, grain.
// La texture uTex contient la trame 320 × 250 en luminance (rémanence déjà appliquée).
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

varying vec2 v;
uniform sampler2D uTex;
uniform vec2 uRes;                 // taille du canvas en pixels
uniform float uMargin;             // marge autour de la trame
uniform float uCurv;               // courbure du verre
uniform float uScan;               // intensité des lignes de balayage
uniform float uBloom;              // halo
uniform float uGain;               // luminosité (allumage)
uniform float uFlash;              // blanchiment (allumage, extinction)
uniform float uTime;
uniform float uNoise;              // grain
uniform float uRoll;               // barre de balayage qui descend lentement (0 : aucune)
uniform float uOpaque;             // 1 : verre opaque (incrustation normale)
uniform vec3 uTint;                // couleur du phosphore
uniform vec3 uHot;                 // blanchiment des points très lumineux
uniform vec3 uGlass;               // couleur du verre éteint

const vec2 SRC = vec2(320.0, 250.0);

float tx(vec2 t) { return texture2D(uTex, (t + 0.5) / SRC).r; }

float rbox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 uv = v * (1.0 + 2.0 * uMargin) - uMargin;
  vec2 c = uv - 0.5;
  float r2 = dot(c, c);
  vec2 q = 0.5 + c * (1.0 + uCurv * r2);
  vec2 e = (1.0 + 2.0 * uMargin) / uRes * 1.2;
  float inside = smoothstep(0.0, e.x, q.x) * smoothstep(0.0, e.x, 1.0 - q.x)
               * smoothstep(0.0, e.y, q.y) * smoothstep(0.0, e.y, 1.0 - q.y);

  // Faisceau : interpolation horizontale serrée, profil gaussien vertical plus large sur les points clairs
  vec2 p = q * SRC - 0.5;
  float x0 = floor(p.x);
  float fx = clamp((p.x - x0 - 0.5) * 2.4 + 0.5, 0.0, 1.0);
  float y0 = floor(p.y + 0.5);
  float dy = p.y - y0;
  float yn = y0 + (dy >= 0.0 ? 1.0 : -1.0);
  float lc = mix(tx(vec2(x0, y0)), tx(vec2(x0 + 1.0, y0)), fx);
  float ln = mix(tx(vec2(x0, yn)), tx(vec2(x0 + 1.0, yn)), fx);
  float sc = mix(0.25, 0.40, lc);
  float sn = mix(0.25, 0.40, ln);
  float dn = 1.0 - abs(dy);
  float beam = lc * exp(-dy * dy / (2.0 * sc * sc)) + ln * exp(-dn * dn / (2.0 * sn * sn));
  float I = mix(lc, beam * 1.28, uScan) * inside;
  // Interligne : le faisceau large ne creuse presque pas l'espace entre deux lignes ; un masque le marque
  I *= 1.0 - uScan * 0.55 * (0.5 - 0.5 * cos(6.2831853 * p.y));

  // Halo : deux couronnes de 12 échantillons
  float bl = 0.0;
  vec2 pc = q * SRC;
  for (int i = 0; i < 12; i++) {
    float a = float(i) * 0.5235988 + 0.26;
    vec2 o = vec2(cos(a), sin(a));
    bl += texture2D(uTex, (pc + o * 2.0) / SRC).r;
    bl += 0.55 * texture2D(uTex, (pc + o * 4.6) / SRC).r;
  }
  bl /= 18.6;
  float bm = smoothstep(-0.05, 0.0, q.x) * smoothstep(-0.05, 0.0, 1.0 - q.x)
           * smoothstep(-0.05, 0.0, q.y) * smoothstep(-0.05, 0.0, 1.0 - q.y);

  float vig = 1.0 - 0.32 * pow(clamp(r2 * 2.0, 0.0, 1.0), 1.6);
  float lum = (I + bl * uBloom * 0.9 * bm) * vig * uGain;
  // Barre de balayage : une bande douce qui descend en 9 s, éclaire un peu le verre et ravive le phosphore
  float by = fract(uTime / 9.0) * 1.5 - 0.25;
  float band = exp(-pow((q.y - by) / 0.07, 2.0)) * smoothstep(0.0, 0.12, q.x) * smoothstep(0.0, 0.12, 1.0 - q.x) * inside;
  lum += uRoll * band * (0.035 + 0.22 * I) * uGain;
  lum *= 1.0 + uNoise * (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) * 0.07;
  vec3 col = uTint * lum + uHot * pow(max(lum - 0.62, 0.0), 1.5) * 0.85;

  // Verre (mode opaque) et blanchiment d'allumage
  float gm = 1.0 - smoothstep(-0.004, 0.004, rbox(q - 0.5, vec2(0.525, 0.53), 0.045));
  col += uGlass * gm * uOpaque;
  col = mix(col, uTint * 1.35 + 0.25, uFlash * max(inside, gm * uOpaque));
  col = clamp(col, 0.0, 1.0);

  // Alpha prémultiplié : le noir est transparent (incrustation en mode « screen »)
  float a = max(max(col.r, col.g), col.b);
  a = max(a, uOpaque * gm);
  gl_FragColor = vec4(col, a);
}
