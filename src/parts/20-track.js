
// ═══════════════════════════ THE CIRCUIT: a closed spline, sampled every two metres. Everything else (road, AI, laps, walls) reads these arrays ═══════════════════════════
// x east, z south. Main street → right down to the sea → coast road west → hairpin → up through the old town → over the hill → back down onto main street. Clockwise, 1.7 km.
const TP = [[0, 0], [110, 0], [225, 2], [305, 30], [345, 100], [335, 185], [280, 240], [190, 258], [90, 246], [-10, 262], [-110, 282], [-185, 275], [-218, 232], [-190, 192], [-125, 180], [-72, 140], [-62, 85], [-95, 45], [-150, 40], [-190, 5], [-175, -40], [-120, -52], [-70, -20]];
const curve = new THREE.CatmullRomCurve3(TP.map(p => new V(p[0], 0, p[1])), true, 'centripetal'); curve.arcLengthDivisions = 3000;
const TL = curve.getLength(), N = Math.round(TL / 2), DS = TL / N, W = CFG.W;
const F = () => new Float32Array(N), SX = F(), SZ = F(), SY = F(), TX = F(), TZ = F(), K = F(), VM = F(), VP = F(), LL = F(), LR = F(), KH = F(), ZONE = new Uint8Array(N); // ZONE: 0 country, 1 town, 2 coast
const wrapS = d => d - TL * Math.round(d / TL), md = (i, j) => { const d = Math.abs(i - j); return Math.min(d, N - d); }, ix = i => ((i % N) + N) % N;
const hill = (x, z) => { const n = 9 + 6 * Math.sin(x * .011 + .9) * Math.cos(z * .013 - .5) + 3.5 * Math.sin((x * .7 + z) * .019 + 2.1), k = s01((z - 70) / 150); let h = lerp(n, 3.2, k); if (z > 292) h -= (z - 292) * .16; return h; };
for (let i = 0; i < N; i++) { const p = curve.getPointAt(i / N), t = curve.getTangentAt(i / N), l = Math.hypot(t.x, t.z); SX[i] = p.x; SZ[i] = p.z; TX[i] = t.x / l; TZ[i] = t.z / l; SY[i] = Math.max(2.6, hill(p.x, p.z)); }
for (let it = 0; it < 3; it++) { const a = SY.slice(); for (let i = 0; i < N; i++) { let s = 0; for (let k = -12; k <= 12; k++) s += a[ix(i + k)]; SY[i] = s / 25; } } // the road cuts and fills: no bumps, just long grades
{ const raw = F(); for (let i = 0; i < N; i++) { const a = ix(i - 2), b = ix(i + 2); raw[i] = (TX[a] * TZ[b] - TZ[a] * TX[b]) / (4 * DS); } for (let i = 0; i < N; i++) { let s = 0; for (let k = -3; k <= 3; k++) s += raw[ix(i + k)]; K[i] = s / 7; } } // curvature, + = right-hander
function nearest(x, z) { let bi = 0, bd = 1e12; for (let i = 0; i < N; i++) { const dx = x - SX[i], dz = z - SZ[i], d = dx * dx + dz * dz; if (d < bd) { bd = d; bi = i; } } return { i: bi, d: Math.sqrt(bd) }; }
const atTP = k => nearest(TP[k][0], TP[k][1]).i;
{ const span = (a, b, z) => { for (let i = a; i !== b; i = ix(i + 1)) ZONE[i] = z; }; span(ix(atTP(22) + 8), ix(atTP(3) + 6), 1); span(ix(atTP(6) + 10), ix(atTP(11) - 4), 2); span(ix(atTP(13) + 14), ix(atTP(18) + 4), 1); }
for (let i = 0; i < N; i++) { const z = ZONE[i]; LL[i] = z === 1 ? W - .58 : z === 2 ? W + .35 : W + 2.25; LR[i] = z === 1 ? W - .58 : W + 2.25; let s = 0; for (let k = -3; k <= 3; k++) s += ZONE[ix(i + k)] === 1 ? 1 : 0; KH[i] = .13 * s / 7; } // how far the car's centre may stray left/right, and the kerb height
function profile(out, grip, vmax, brake, acc) { // the speed a car can carry at every sample: corner limit, then a backward pass for braking and a forward pass for traction
  for (let i = 0; i < N; i++) out[i] = Math.min(vmax, Math.sqrt(grip / Math.max(Math.abs(K[i]), 1e-4)));
  for (let r = 0; r < 2; r++) { for (let i = N - 1; i >= 0; i--) out[i] = Math.min(out[i], Math.sqrt(out[ix(i + 1)] ** 2 + 2 * brake * DS)); for (let i = 0; i < N; i++) out[i] = Math.min(out[i], Math.sqrt(out[ix(i - 1)] ** 2 + 2 * acc * DS)); } }
profile(VM, CFG.AI.grip, CFG.AI.vmax, CFG.AI.brake, CFG.AI.acc); profile(VP, CFG.GRIP * .92, 99, 9, 99);
function trackAt(s, lat, out) { const f = ((s % TL) + TL) % TL / DS, i = Math.floor(f) % N, j = (i + 1) % N, k = f - Math.floor(f), tx = lerp(TX[i], TX[j], k), tz = lerp(TZ[i], TZ[j], k);
  out.x = lerp(SX[i], SX[j], k) - tz * lat; out.z = lerp(SZ[i], SZ[j], k) + tx * lat; out.y = lerp(SY[i], SY[j], k); out.psi = Math.atan2(tx, -tz); out.i = i; out.slope = (SY[j] - SY[i]) / DS; return out; }
