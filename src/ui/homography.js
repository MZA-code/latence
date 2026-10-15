// Homographie 4 points → matrix3d CSS, pour poser l'écran rectangulaire sur un quadrilatère.

function solve(A, b) {
  const n = b.length;
  const M = A.map((row, i) => row.concat(b[i]));
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    if (Math.abs(M[piv][col]) < 1e-12) return null;
    [M[col], M[piv]] = [M[piv], M[col]];
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / M[col][col];
      for (let k = col; k <= n; k++) M[r][k] -= f * M[col][k];
    }
  }
  return M.map((row, i) => row[n] / row[i]);
}

/**
 * Matrice 4 × 4 (ordre colonne, format matrix3d) qui envoie les 4 points src sur les 4 points dst.
 * @param {number[][]} src [[x, y] × 4]
 * @param {number[][]} dst [[x, y] × 4]
 * @returns {number[] | null}
 */
export function homography(src, dst) {
  const A = [], B = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i], [X, Y] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]); B.push(X);
    A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]); B.push(Y);
  }
  const h = solve(A, B);
  if (!h) return null;
  return [h[0], h[3], 0, h[6], h[1], h[4], 0, h[7], 0, 0, 1, 0, h[2], h[5], 0, 1];
}

export const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
