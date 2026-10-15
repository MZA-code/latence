// Rendu du tube en WebGL 1 : une texture de luminance 320 × 250, un triangle plein écran, un shader.
import { W, H, MARGIN } from '../constants.js';
import VERT from './crt.vert.glsl?raw';
import FRAG from './crt.frag.glsl?raw';

const UNIFORMS = ['uTex', 'uRes', 'uMargin', 'uCurv', 'uScan', 'uBloom', 'uGain', 'uFlash',
  'uTime', 'uNoise', 'uRoll', 'uOpaque', 'uTint', 'uHot', 'uGlass'];

export class CrtGL {
  /** @param {HTMLCanvasElement} canvas */
  constructor(canvas) {
    const gl = canvas.getContext('webgl', {
      alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false,
    });
    if (!gl) throw new Error('WebGL indisponible');
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, W, H, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.u = {};
    for (const n of UNIFORMS) this.u[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(this.u.uTex, 0);
    gl.clearColor(0, 0, 0, 0);
    this.gl = gl;
    this.lost = false;
    canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); this.lost = true; });
  }

  /**
   * @param {Uint8Array} data trame 320 × 250
   * @param {object} P paramètres de rendu (voir Minitel.params)
   */
  draw(data, P) {
    const { gl, u } = this;
    if (this.lost) return;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, W, H, gl.LUMINANCE, gl.UNSIGNED_BYTE, data);
    gl.uniform2f(u.uRes, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.uniform1f(u.uMargin, MARGIN);
    gl.uniform1f(u.uCurv, P.curv);
    gl.uniform1f(u.uScan, P.scan);
    gl.uniform1f(u.uBloom, P.bloom);
    gl.uniform1f(u.uGain, P.gain);
    gl.uniform1f(u.uFlash, P.flash);
    gl.uniform1f(u.uTime, P.time);
    gl.uniform1f(u.uNoise, P.noise);
    gl.uniform1f(u.uRoll, P.roll);
    gl.uniform1f(u.uOpaque, P.opaque);
    gl.uniform3fv(u.uTint, P.tint);
    gl.uniform3fv(u.uHot, P.hot);
    gl.uniform3fv(u.uGlass, P.glass);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
