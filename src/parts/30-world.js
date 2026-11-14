
// ═══════════════════════════ THE WORLD BEHIND THE GLASS: a seaside town on a bright day, painted flat like an animation background ═══════════════════════════
// Colours here are display colours (no tone mapping): what is written is what you see. Two tones of light, a sun colour and a shadow colour, and distance fades to the horizon.
class MB { // a mesh builder: quads, boxes and whole geometries poured into one buffer, so the entire town is a single draw call
  constructor() { this.p = []; this.n = []; this.c = []; this.u = []; }
  v(p, n, c, a, b) { this.p.push(p.x, p.y, p.z); this.n.push(n.x, n.y, n.z); this.c.push(c.r, c.g, c.b); this.u.push(a, b); }
  quad(a, b, c, d, cl, uv) { const n = new V().subVectors(b, a).cross(new V().subVectors(d, a)).normalize(), U = uv ? [[uv[0], uv[1]], [uv[2], uv[1]], [uv[2], uv[3]], [uv[0], uv[3]]] : 0, q = [a, b, c, d]; for (const k of [0, 1, 2, 0, 2, 3]) this.v(q[k], n, cl, U ? U[k][0] : -1, U ? U[k][1] : -1); return this; }
  box(m, w, h, d, cl, o = {}) { const x = w / 2, z = d / 2, P = (a, b, c) => new V(a, b, c).applyMatrix4(m), s = o.side || cl;
    this.quad(P(-x, 0, z), P(x, 0, z), P(x, h, z), P(-x, h, z), o.front ? WHITE : cl, o.front); this.quad(P(x, 0, -z), P(-x, 0, -z), P(-x, h, -z), P(x, h, -z), s);
    this.quad(P(x, 0, z), P(x, 0, -z), P(x, h, -z), P(x, h, z), o.suv ? SIDEC : s, o.suv); this.quad(P(-x, 0, -z), P(-x, 0, z), P(-x, h, z), P(-x, h, -z), o.suv ? SIDEC : s, o.suv); this.quad(P(-x, h, z), P(x, h, z), P(x, h, -z), P(-x, h, -z), o.top || cl); return this; }
  add(g, m, cl) { g = g.index ? g.toNonIndexed() : g; const p = g.attributes.position, n = g.attributes.normal, nm = new THREE.Matrix3().getNormalMatrix(m); for (let i = 0; i < p.count; i++) this.v(_v.fromBufferAttribute(p, i).applyMatrix4(m), _v2.fromBufferAttribute(n, i).applyMatrix3(nm).normalize(), cl, -1, -1); return this; }
  geo() { const g = new THREE.BufferGeometry(), A = (a, k) => new THREE.Float32BufferAttribute(a, k); g.setAttribute('position', A(this.p, 3)); g.setAttribute('normal', A(this.n, 3)); g.setAttribute('color', A(this.c, 3)); g.setAttribute('uv', A(this.u, 2)); return g; } }
const WHITE = col('#ffffff'), SIDEC = col('#e9e4f2'), M4 = (x, y, z, ry = 0, s = 1, sy = s) => new THREE.Matrix4().compose(new V(x, y, z), new Qn().setFromAxisAngle(YA, ry), new V(s, sy, s));

// ── the atlas: sixteen 512px tiles painted once. 0-7 two-storey fronts, 8-11 one-storey, 12-13 three-storey, 14 signs and machines, 15 the banner
const ATL = ctex(2048, 2048, false), TILE = [], T2 = [0, 1, 2, 3, 4, 5, 6, 7], T1 = [8, 9, 10, 11], T3 = [12, 13];
const tileUV = (i, x0 = 0, y0 = 0, x1 = 1, y1 = 1) => { const tx = i % 4, ty = i >> 2, e = 3 / 2048; return [(tx + x0) / 4 + e, 1 - (ty + y1) / 4 + e, (tx + x1) / 4 - e, 1 - (ty + y0) / 4 - e]; };
{ const c = ATL.ctx, S = 512, ink = '#1d1233', WALLS = ['#ffb6dc', '#a9e7ff', '#c9f6a2', '#fff4a3', '#dabaff', '#ffd2ab', '#ffffff', '#ff9fc6'], AWN = ['#ff2d8a', '#19c3ff', '#6fcf1f', '#ffb400', '#a45cff', '#00cdb0'], WORDS = ['CAFE', 'BOOKS', 'RAMEN', 'BAKERY', 'FLOWERS', 'CYCLES', 'NXT', 'TEA', 'RECORDS', 'GARAGE', 'SODA', 'LAUNDRY', 'HOTEL', 'KIOSK'];
  const win = (x, y, w, h, o = {}) => { // a window the way they are painted: sky in the glass, one white glint, a frame and a sill
    c.fillStyle = '#fbfaf4'; c.fillRect(x - 5, y - 5, w + 10, h + 10); const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, o.dark ? '#3c5f9a' : '#5eaaea'); g.addColorStop(1, o.dark ? '#7fa6d6' : '#cdeeff'); c.fillStyle = g; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(x + w * .12, y + h); c.lineTo(x + w * .46, y); c.lineTo(x + w * .64, y); c.lineTo(x + w * .3, y + h); c.fill();
    c.strokeStyle = ink; c.lineWidth = 6; c.strokeRect(x - 5, y - 5, w + 10, h + 10); c.beginPath(); if (o.bars) { c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + h); } if (o.bars > 1) { c.moveTo(x, y + h * .45); c.lineTo(x + w, y + h * .45); } c.stroke();
    if (o.sill) { c.fillStyle = '#fbfaf4'; c.fillRect(x - 11, y + h + 5, w + 22, 8); c.strokeRect(x - 11, y + h + 5, w + 22, 8); }
    if (o.box) { c.fillStyle = '#9c6b47'; c.fillRect(x - 6, y + h - 4, w + 12, 16); c.strokeRect(x - 6, y + h - 4, w + 12, 16); for (let k = 0; k < 9; k++) { c.fillStyle = k % 3 ? '#4fae4a' : pick(['#ff6f91', '#ffd23f', '#ffffff']); c.beginPath(); c.arc(x + (k + .5) * w / 9, y + h - 7 + (k % 2) * 3, 9, 0, 7); c.fill(); } } };
  const spark = (x, y, r, f) => { c.fillStyle = f; c.beginPath(); c.moveTo(x, y - r); c.quadraticCurveTo(x, y, x + r, y); c.quadraticCurveTo(x, y, x, y + r); c.quadraticCurveTo(x, y, x - r, y); c.quadraticCurveTo(x, y, x, y - r); c.fill(); c.strokeStyle = ink; c.lineWidth = 3; c.stroke(); }; // a Y2K four-point sparkle
  const heart = (x, y, r, f) => { c.fillStyle = f; c.beginPath(); c.moveTo(x, y + r * .9); c.bezierCurveTo(x - r * 1.4, y - r * .1, x - r * .7, y - r * 1.2, x, y - r * .45); c.bezierCurveTo(x + r * .7, y - r * 1.2, x + r * 1.4, y - r * .1, x, y + r * .9); c.fill(); c.strokeStyle = ink; c.lineWidth = 3; c.stroke(); };
  for (let i = 0; i < 14; i++) { const fl = i < 8 ? 2 : i < 12 ? 1 : 3, wall = WALLS[i % 8], aw = AWN[i % 6], shop = i < 12 && i % 4 !== 3, fh = S / fl, gy = S - fh; TILE[i] = { wall: col(wall).multiplyScalar(.97), awn: shop ? col(aw) : null };
    c.save(); c.translate((i % 4) * S, (i >> 2) * S); c.beginPath(); c.rect(0, 0, S, S); c.clip(); c.fillStyle = wall; c.fillRect(0, 0, S, S);
    const g = c.createLinearGradient(0, 0, 0, S); g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(96,74,128,.16)'); c.fillStyle = g; c.fillRect(0, 0, S, S);
    for (let k = 0; k < 5; k++) { c.fillStyle = 'rgba(96,74,128,.05)'; c.beginPath(); c.ellipse(rand(0, S), rand(0, S), rand(40, 120), rand(14, 40), rand(0, 3), 0, 7); c.fill(); }
    if (i % 3 === 0) { c.fillStyle = 'rgba(255,255,255,.3)'; for (let y = 20; y < S; y += 36) for (let x = (y / 36 % 2) * 18 + 10; x < S; x += 36) { c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); } } // wallpaper: polka dots or candy stripes
    else if (i % 3 === 1) { c.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 8; x < S; x += 40) c.fillRect(x, 0, 14, S); }
    for (let f = 0; f < fl - 1; f++) { const y = f * fh, n = i % 3 === 0 ? 2 : 3, ww = n === 2 ? 130 : 92, hh = fh * .5; // upper floors
      for (let k = 0; k < n; k++) win(S * (k + .5) / n - ww / 2, y + fh * .24, ww, hh, { bars: 1 + (i % 2), sill: 1, box: (i + k + f) % 3 === 0 });
      if (i % 4 === 1) { c.strokeStyle = ink; c.lineWidth = 4; c.strokeRect(26, y + fh * .58, S - 52, fh * .24); for (let x = 40; x < S - 30; x += 22) { c.beginPath(); c.moveTo(x, y + fh * .58); c.lineTo(x, y + fh * .82); c.stroke(); } } // a balcony rail
      c.fillStyle = 'rgba(96,74,128,.22)'; c.fillRect(0, y + fh - 7, S, 7); }
    if (shop) { const word = WORDS[i % WORDS.length]; // ground floor: signboard, striped awning with a scalloped edge, a big pane and a door
      c.fillStyle = '#fbfaf4'; c.beginPath(); c.roundRect(40, gy + fh * .035, S - 80, fh * .17, fh * .085); c.fill(); c.strokeStyle = ink; c.lineWidth = 8; c.stroke();
      c.font = `italic 800 ${fh * .11}px Unbounded,system-ui,sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 9; c.strokeStyle = ink; c.strokeText(word, S / 2, gy + fh * .125, S - 170); c.fillStyle = aw; c.fillText(word, S / 2, gy + fh * .125, S - 170);
      spark(68, gy + fh * .12, 15, '#ffd23f'); spark(S - 68, gy + fh * .12, 15, i % 2 ? '#ffffff' : '#ff9fd0');
      const ay = gy + fh * .24, ah = fh * .15; for (let x = 0; x < S; x += 40) { c.fillStyle = (x / 40) % 2 ? '#fbfaf4' : aw; c.fillRect(x, ay, 40, ah); c.beginPath(); c.arc(x + 20, ay + ah, 20, 0, Math.PI); c.fill(); } c.fillStyle = 'rgba(60,40,90,.28)'; c.fillRect(0, ay + ah + 18, S, 16);
      win(36, gy + fh * .5, 270, fh * .34, { bars: i % 2, dark: i % 5 === 0 }); i % 2 ? heart(270, gy + fh * .58, 16, '#ff4f8b') : spark(272, gy + fh * .58, 18, '#fff'); c.fillStyle = i % 2 ? '#7a5234' : aw; c.fillRect(352, gy + fh * .5, 112, fh * .5); c.strokeRect(352, gy + fh * .5, 112, fh * .5); win(370, gy + fh * .55, 76, fh * .2, {}); c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(366, gy + fh * .82, 5, 0, 7); c.fill(); }
    else if (i % 8 === 3) { c.fillStyle = '#d9dde3'; c.fillRect(40, gy + fh * .3, 300, fh * .7); c.strokeStyle = ink; c.lineWidth = 6; c.strokeRect(40, gy + fh * .3, 300, fh * .7); for (let y = gy + fh * .36; y < S; y += 16) { c.beginPath(); c.moveTo(40, y); c.lineTo(340, y); c.stroke(); } win(380, gy + fh * .34, 92, fh * .3, { bars: 2, sill: 1 }); } // a garage door
    else { c.fillStyle = '#7a5234'; c.fillRect(212, gy + fh * .42, 96, fh * .58); c.strokeStyle = ink; c.lineWidth = 6; c.strokeRect(212, gy + fh * .42, 96, fh * .58); win(46, gy + fh * .32, 120, fh * .36, { bars: 2, sill: 1, box: 1 }); win(348, gy + fh * .32, 120, fh * .36, { bars: 2, sill: 1 }); }
    { const cc = shop ? aw : AWN[(i + 2) % 6]; c.fillStyle = cc; c.fillRect(0, 0, S, 22); for (let x = 0; x < S; x += 32) { c.beginPath(); c.arc(x + 16, 22, 16, 0, Math.PI); c.fill(); } c.strokeStyle = ink; c.lineWidth = 5; c.beginPath(); for (let x = 0; x < S; x += 32) c.arc(x + 16, 22, 16, Math.PI, 0, true); c.stroke(); c.fillStyle = '#fff'; for (let x = 16; x < S; x += 64) { c.beginPath(); c.arc(x, 12, 4, 0, 7); c.fill(); } }
    c.fillStyle = 'rgba(96,60,150,.3)'; c.fillRect(0, S - 20, S, 20); c.strokeStyle = ink; c.lineWidth = 14; c.strokeRect(0, 0, S, S); c.restore(); } // every front gets a fat ink outline: flat candy colour, black line
  { c.save(); c.translate(2 * S, 3 * S); // tile 14: two drinks machines, a corner chevron, and a poster
    [['#e23b34', 0], ['#2d7fe0', 128]].forEach(([m, x]) => { c.fillStyle = m; c.fillRect(x, 0, 128, 256); c.fillStyle = '#eef6ff'; c.fillRect(x + 12, 14, 104, 128); for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) { c.fillStyle = pick(['#ff9f1c', '#2ec4b6', '#e71d36', '#ffffff', '#7b2cbf', '#80ed99']); c.fillRect(x + 18 + k * 19.5, 22 + r * 40, 13, 28); } c.fillStyle = '#16181d'; c.fillRect(x + 22, 196, 84, 30); c.fillStyle = '#fff'; c.fillRect(x + 84, 156, 22, 26); c.strokeStyle = ink; c.lineWidth = 4; c.strokeRect(x + 2, 2, 124, 252); });
    c.fillStyle = '#f7f4ec'; c.fillRect(256, 0, 256, 128); c.fillStyle = '#e02a22'; for (let k = 0; k < 3; k++) { const x = 276 + k * 78; c.beginPath(); c.moveTo(x, 12); c.lineTo(x + 34, 12); c.lineTo(x + 70, 64); c.lineTo(x + 34, 116); c.lineTo(x, 116); c.lineTo(x + 36, 64); c.fill(); }
    const g = c.createLinearGradient(0, 256, 0, 512); g.addColorStop(0, '#2a7be8'); g.addColorStop(1, '#bfe8ff'); c.fillStyle = g; c.fillRect(0, 256, 512, 256); c.fillStyle = '#fff'; c.beginPath(); c.arc(400, 330, 46, 0, 7); c.arc(450, 350, 34, 0, 7); c.arc(350, 352, 30, 0, 7); c.fill();
    c.font = 'italic 800 74px Unbounded,system-ui,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = '#fff'; c.fillText('SUNDAY', 24, 404); c.fillStyle = '#ff3b2f'; c.fillText('DRIVER', 24, 478); c.fillStyle = '#fff'; c.font = '500 22px "Chakra Petch",sans-serif'; c.fillText('NXTWEBXR.COM', 28, 300); c.restore(); }
  { c.save(); c.translate(3 * S, 3 * S); c.fillStyle = '#ff2d8a'; c.fillRect(0, 0, 512, 72); for (let x = 0; x < 512; x += 12) for (let y = 0; y < 2; y++) { c.fillStyle = ((x / 12) + y) % 2 ? '#fff' : '#1d1233'; c.fillRect(x, y * 6, 12, 6); c.fillRect(x, 60 + y * 6, 12, 6); } // tile 15: the banner over the line
    c.font = 'italic 800 30px Unbounded,system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 7; c.strokeStyle = ink; c.strokeText('NXT/WEBXR GRAND PRIX', 256, 37, 420); c.fillStyle = '#fff'; c.fillText('NXT/WEBXR GRAND PRIX', 256, 37, 420);
    for (const [x, f] of [[22, '#ffe14d'], [490, '#ffe14d']]) { c.fillStyle = f; c.beginPath(); c.moveTo(x, 23); c.quadraticCurveTo(x, 37, x + 13, 37); c.quadraticCurveTo(x, 37, x, 51); c.quadraticCurveTo(x, 37, x - 13, 37); c.quadraticCurveTo(x, 37, x, 23); c.fill(); } c.restore(); }
  ATL.tex.needsUpdate = true; }

// ── materials
const WVS = `varying vec3 vC,vN,vW;varying vec2 vUv;varying float vD;void main(){vec4 p=vec4(position,1.);vec3 n=normal;vC=color;
#ifdef USE_INSTANCING
p=instanceMatrix*p;n=mat3(instanceMatrix)*n;
#endif
#ifdef USE_INSTANCING_COLOR
vC*=instanceColor;
#endif
vN=mat3(modelMatrix)*n;vUv=uv;vW=(modelMatrix*p).xyz;vec4 mv=modelViewMatrix*p;vD=length(mv.xyz);gl_Position=projectionMatrix*mv;}`;
const WFS = `${LIT}uniform sampler2D map;uniform vec3 uSun,uSunC,uShC,uFogC;uniform float uFog,uNight;varying vec3 vC,vN,vW;varying vec2 vUv;varying float vD;
void main(){vec3 a=vC,tx=vec3(0.);if(vUv.x>=0.){tx=texture2D(map,vUv).rgb;a*=tx;}float wg=step(.4,tx.b-tx.r)*step(.45,fract(sin(dot(floor(vUv*40.),vec2(12.9898,78.233)))*43758.5453))*uNight; // at night, about half the windows are lit (and the blue neon on the signs)
vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;float d=dot(n,uSun),l=smoothstep(.0,.03,d);
gl_FragColor=vec4(mix(uFogC,a*(mix(uShC,uSunC,l)+nightLight(vW,n)*uNight)+vec3(1.,.78,.42)*wg,exp(-vD*uFog)),1.);}`;
const wmat = (o = {}) => new THREE.ShaderMaterial({ uniforms: { ...UW, map: u(ATL.tex) }, vertexShader: WVS, fragmentShader: WFS, vertexColors: true, ...STEN, ...o });
const WM = wmat(), WM2 = wmat({ side: THREE.DoubleSide });
const wmesh = (g, m = WM, p = world) => { const o = new THREE.Mesh(g, m); o.renderOrder = RO.world; p.add(o); return o; };

// ── the town, built along the samples
let TREEM; // the trees, so a hit can shake them
const stat = new MB(), SHADE = [], TREES = [], POLES = [], sdir = new V(-SUND[0].x, 0, -SUND[0].z).normalize(), ROOFS = ['#ff5fa8', '#35b8ff', '#8a5cff', '#2fd6a0', '#ff8a3c', '#3a2a5c'];
function building(x, y, z, ry, w, d, fl) { const t = rpick(fl === 1 ? T1 : fl === 2 ? T2 : T3), h = fl * 3.25 + .5, m = M4(x, y, z, ry), wall = TILE[t].wall, rc = col(rpick(ROOFS)), P = (a, b, c) => new V(a, b, c).applyMatrix4(m);
  stat.box(M4(x, y - 4, z, ry), w, 4, d, wall); stat.box(m, w, h, d, wall, { front: tileUV(t), suv: tileUV(t, .02, 0, .3, 1), top: col('#b9b4ad') });
  if (rnd() < .65) { const rh = d * .26, ex = w / 2 + .35, ez = d / 2 + .45; stat.quad(P(-ex, h, ez), P(ex, h, ez), P(ex, h + rh, 0), P(-ex, h + rh, 0), rc).quad(P(ex, h, -ez), P(-ex, h, -ez), P(-ex, h + rh, 0), P(ex, h + rh, 0), rc); const x2 = w / 2, z2 = d / 2; stat.quad(P(-x2, h, -z2), P(-x2, h, z2), P(-x2, h + rh, 0), P(-x2, h + rh, 0), wall).quad(P(x2, h, z2), P(x2, h, -z2), P(x2, h + rh, 0), P(x2, h + rh, 0), wall); }
  else { stat.box(M4(0, h, 0).premultiply(m), w + .3, .35, d + .3, wall.clone().multiplyScalar(.9)); stat.box(M4(rnd(-w * .25, w * .25), h + .35, rnd(-1, 1)).premultiply(m), 1.6, rnd(.9, 1.6), 1.3, col('#aeb6c2')); }
  if (TILE[t].awn) stat.quad(P(-w * .46, 2.25, d / 2 + 1.05), P(w * .46, 2.25, d / 2 + 1.05), P(w * .46, 2.85, d / 2), P(-w * .46, 2.85, d / 2), TILE[t].awn); // the awning stands out from the wall
  if (rnd() < .3) { const k = rnd() < .5 ? 0 : .25; stat.box(M4(w / 2 - .9, 0, d / 2 + .5).premultiply(m), .95, 1.9, .75, col(k ? '#2d7fe0' : '#e23b34'), { front: tileUV(14, k, 0, k + .25, .5) }); }
  SHADE.push([x + sdir.x * (d / 2 + 2.5), z + sdir.z * (d / 2 + 2.5), w * .62]); }
for (const side of [-1, 1]) { let gap = 0;
  for (let i = 0; i < N; i++) { gap -= DS; if (ZONE[i] !== 1 || gap > 0) continue;
    const fl = rpick([1, 2, 2, 2, 2, 3]), w = fl === 1 ? rnd(7, 10) : rnd(8.5, 13), d = rnd(7, 10), j = ix(i + Math.round(w / 2 / DS)), off = W + 3.75 + d / 2;
    if (ZONE[j] !== 1 || K[j] * side > .011) { gap = 4; continue; }
    const x = SX[j] - TZ[j] * side * off, z = SZ[j] + TX[j] * side * off; let ok = true; for (let k = 0; k < N; k += 2) if (md(k, j) > 45 && (SX[k] - x) ** 2 + (SZ[k] - z) ** 2 < (off + W + 5) ** 2) { ok = false; break; }
    if (!ok) { gap = 6; continue; } building(x, SY[j], z, Math.atan2(TZ[j] * side, -TX[j] * side), w, d, fl); gap = w + rnd(0, .08); } }
// trees: avenues along the country road, and woods on the hills. Kept clear of the billboards and the telegraph poles
const BB = [[atTP(8), 1], [atTP(20), -1], [atTP(5), -1]].map(([k, side]) => { const o = (W + 7) * side; return [k, side, SX[k] - TZ[k] * o, SZ[k] + TX[k] * o]; });
{ const tree = (x, z, s) => BB.some(b => Math.hypot(x - b[2], z - b[3]) < 9 + s * 2) || TREES.push([x, hill2(x, z) - .25, z, s, rnd(0, 6.3), rnd(.86, 1.06), rnd(.92, 1.08), rnd(.8, 1)]);
  for (const side of [-1, 1]) for (let i = 0; i < N; i += 5) { if (ZONE[i] && Math.abs(((i - 4) % 16 + 16) % 16 - 8) > 4) continue; if (ZONE[i] === 1 || (ZONE[i] === 2 && side < 0) || rnd() < .35) continue; const o = (W + rnd(5.2, 7.5)) * side; tree(SX[i] - TZ[i] * o, SZ[i] + TX[i] * o, rnd(.9, 1.5)); }
  for (let k = 0; k < 1500 && TREES.length < 430; k++) { const x = rnd(-400, 520), z = rnd(-240, 300), n = nearest(x, z); if (n.d < W + 9 || n.d > 190 || (ZONE[n.i] === 1 && n.d < 30) || hill(x, z) < 1.8 || (z > 268 && ZONE[n.i] === 2)) continue; tree(x, z, rnd(.9, 1.9)); } }
function hill2(x, z) { const n = nearest(x, z), flat = ZONE[n.i] === 1 ? 26 : W + 13; return lerp(SY[n.i] - .3, hill(x, z), s01((n.d - flat) / 45)); } // the land as built: level beside the road, the hill's own shape further out
// poles and their wires, the guard rails, the sea wall, the chevrons
for (let i = 4; i < N; i += 16) { const z = ZONE[i]; if (!z) continue; const side = z === 2 ? 1 : -1, o = (W + 1.55) * side, x = SX[i] - TZ[i] * o, zz = SZ[i] + TX[i] * o, ry = Math.atan2(TX[i], TZ[i]) + Math.PI / 2, m = M4(x, SY[i] + .1, zz, ry), pc = col('#3a2a5c');
  stat.box(m, .24, 8.6, .24, pc).box(M4(0, 7.5, 0).premultiply(m), .16, .16, 2.3, pc).box(M4(0, 6.8, 0).premultiply(m), .14, .14, 1.5, pc); if (i % 32 < 16) stat.add(new THREE.CylinderGeometry(.3, .3, .8, 8), M4(.35, 6.1, 0).premultiply(m), col('#b9bcc4'));
  stat.box(M4(0, 6.2, side * .9).premultiply(m), .1, .1, 1.9, pc).box(M4(0, 6.02, side * 1.8).premultiply(m), .26, .14, .5, col('#f4f1e6')); POLES.push({ i, m }); } // (the pole's z axis points across the road, away from it on the left)
{ const rc = col('#f2f0ea'), rd = col('#c8c6d0'), wc = col('#e6e0d2'), pt = (i, o, y) => new V(SX[i] - TZ[i] * o, SY[i] + y, SZ[i] + TX[i] * o);
  for (let i = 0; i < N; i += 2) { const j = ix(i + 2); for (const side of [-1, 1]) { if (ZONE[i] === 1 || ZONE[j] === 1) continue;
      if (ZONE[i] === 2 && side < 0) { const a = W + 1.2, b = W + 1.75; stat.quad(pt(j, -a, 0), pt(i, -a, 0), pt(i, -a, .85), pt(j, -a, .85), wc).quad(pt(j, -a, .85), pt(i, -a, .85), pt(i, -b, .85), pt(j, -b, .85), col('#f4f0e6')).quad(pt(i, -b, -2), pt(j, -b, -2), pt(j, -b, .85), pt(i, -b, .85), wc); continue; }
      const o = (W + 3.1) * side; side > 0 ? stat.quad(pt(i, o, .42), pt(j, o, .42), pt(j, o, .76), pt(i, o, .76), rc) : stat.quad(pt(j, o, .42), pt(i, o, .42), pt(i, o, .76), pt(j, o, .76), rc);
      if (i % 4 === 0) { const a = pt(i, o + .06 * side, 0), b = pt(i, o + .06 * side, .5), t = new V(TX[i], 0, TZ[i]).multiplyScalar(.07 * side); stat.quad(a.clone().sub(t), a.clone().add(t), b.clone().add(t), b.clone().sub(t), rd); } } }
  for (let i = 0; i < N; i += 5) { if (Math.abs(K[i]) < .017) continue; const side = -Math.sign(K[i]), o = (W + (ZONE[i] === 1 ? 1.1 : 2.4)) * side, p = pt(i, o, 0), ry = Math.atan2(-TX[i], -TZ[i]) + side * .5, uv = tileUV(14, .5, 0, 1, .25); if (K[i] < 0) { const t = uv[0]; uv[0] = uv[2]; uv[2] = t; }
    stat.box(M4(p.x, p.y, p.z, ry), .1, 1.2, .1, col('#8c8f98')).box(M4(p.x, p.y + 1.1, p.z, ry), 2.3, 1.15, .08, col('#e9e6dd'), { front: uv }); } }
// the line: a gantry with five lamps, and a poster or two
const LAMPS = [];
{ const i = 0, m = M4(SX[i], SY[i], SZ[i], Math.atan2(-TX[i], -TZ[i])), gc = col('#2a2d35'); for (const s of [-1, 1]) stat.box(M4(s * (W + 1.1), 0, 0).premultiply(m), .5, 7.6, .5, gc);
  stat.box(M4(0, 6.2, 0).premultiply(m), W * 2 + 2.8, 1.5, .5, gc, { front: tileUV(15, 0, 0, 1, .14) });
  for (let k = 0; k < 5; k++) { const l = new THREE.Mesh(new THREE.SphereGeometry(.3, 12, 8), new THREE.MeshBasicMaterial({ color: '#1b1d22', ...STEN })); l.position.set(-2.4 + k * 1.2, 5.75, .5).applyMatrix4(m); l.renderOrder = RO.world; world.add(l); LAMPS.push(l); stat.box(M4(-2.4 + k * 1.2, 5.3, .3).premultiply(m), .9, .9, .2, col('#101115')); }
  for (const [k, side, x, z] of BB) { const mm = M4(x, hill2(x, z), z, Math.atan2(-TX[k], -TZ[k]) + side * .45); for (const s of [-1, 1]) stat.box(M4(s * 3, 0, 0).premultiply(mm), .25, 4, .25, gc); stat.box(M4(0, 3.6, 0).premultiply(mm), 9, 4.5, .2, col('#e9e6dd'), { front: tileUV(14, 0, .5, 1, 1) }); } }
// out at sea: a lighthouse on its rock, sails, and islands that the haze turns blue
{ const lx = 60, lz = 372; stat.add(new THREE.IcosahedronGeometry(10, 0), new THREE.Matrix4().compose(new V(lx, -1, lz), new Qn(), new V(1.5, .45, 1.2)), col('#9d9aa3'));
  for (let k = 0; k < 5; k++) stat.add(new THREE.CylinderGeometry(1.5 + (4 - k) * .16, 1.66 + (4 - k) * .16, 3.4, 12), M4(lx, 3.8 + k * 3.4, lz), col(k % 2 ? '#e3372e' : '#fbfaf5'));
  stat.add(new THREE.CylinderGeometry(1.25, 1.25, 1.8, 10), M4(lx, 21.4, lz), col('#22303f')).add(new THREE.ConeGeometry(1.7, 1.6, 10), M4(lx, 23.1, lz), col('#e3372e'));
  for (const [x, z, s, h] of [[-90, 420, 1, '#ffffff'], [150, 470, 1.3, '#ffd23f'], [330, 400, .9, '#ffffff'], [-260, 520, 1.5, '#ff8fa3'], [470, 560, 1.4, '#ffffff']]) { const m = M4(x, 0, z, rnd(0, 6), s); stat.box(m, 1.9, .9, 6, col('#f6f3ea')); const P = (a, b, c) => new V(a, b, c).applyMatrix4(m); stat.quad(P(0, 1, 2.2), P(0, 1, -2), P(0, 8.5, -.6), P(0, 8.5, -.6), col(h)); }
  for (const [x, z, s] of [[-420, 900, 1], [260, 1050, 1.5], [820, 700, 1.2], [-900, 520, 1.3]]) stat.add(new THREE.ConeGeometry(150, 62, 7), M4(x, 20, z, x, s), col('#6fb07c')); }
wmesh(stat.geo(), WM2).frustumCulled = false;
{ const pts = [], Y = [7.58, 7.58, 6.88]; for (let k = 0; k < POLES.length; k++) { const a = POLES[k], b = POLES[(k + 1) % POLES.length]; if (md(a.i, b.i) > 17) continue; // three wires, pole to pole, hanging a little
    [-1.05, 1.05, .65].forEach((z, w) => { const A = new V(0, Y[w], z).applyMatrix4(a.m), B = new V(0, Y[w], z).applyMatrix4(b.m); for (let s = 0; s < 6; s++) for (const t of [s / 6, (s + 1) / 6]) pts.push(lerp(A.x, B.x, t), lerp(A.y, B.y, t) - Math.sin(t * Math.PI) * .55, lerp(A.z, B.z, t)); }); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: '#1d1233', ...STEN })); l.renderOrder = RO.world; l.frustumCulled = false; world.add(l); }
{ const b = new MB(), g1 = col('#7be04a'), g2 = col('#a8f25c'), g3 = col('#3fc98a'); // one tree, drawn four hundred times
  b.add(new THREE.CylinderGeometry(.16, .26, 2.8, 5, 1, true), M4(0, 1.4, 0), col('#6a3fa0')).add(new THREE.IcosahedronGeometry(1.9, 1), M4(0, 3.9, 0), g1).add(new THREE.IcosahedronGeometry(1.3, 0), M4(1.2, 3.1, .4), g3).add(new THREE.IcosahedronGeometry(1.35, 0), M4(-.9, 3.3, -.6), g2).add(new THREE.IcosahedronGeometry(1.1, 0), M4(.2, 5.1, .3), g2);
  const im = new THREE.InstancedMesh(b.geo(), WM, TREES.length); TREEM = im; TREES.forEach((t, k) => { im.setMatrixAt(k, M4(t[0], t[1], t[2], t[4], t[3], t[3] * t[5])); im.setColorAt(k, _c.setRGB(t[7], t[6], t[7] * .9)); if (nearest(t[0], t[2]).d < W + 11) SHADE.push([t[0] + sdir.x * 3.5, t[2] + sdir.z * 3.5, 2.6 * t[3] + 2.2]); });
  im.renderOrder = RO.world; im.frustumCulled = false; world.add(im); }
const MILLS = [[-262, -78], [-300, -8], [-236, -150]].map(([x, z], k) => { const y = hill(x, z), b = new MB(), g = new THREE.Group(); stat2add(x, y, z); for (let a = 0; a < 3; a++) b.add(new THREE.BoxGeometry(.7, 13, .18), new THREE.Matrix4().makeRotationZ(a * 2.094).multiply(new THREE.Matrix4().makeTranslation(0, 6.8, 0)), WHITE); g.add(wmesh(b.geo(), WM, g)); g.position.set(x, y + 27, z + 1.4); world.add(g); return g; });
function stat2add(x, y, z) { const b = new MB(); b.add(new THREE.CylinderGeometry(.5, 1.1, 27, 8), M4(x, y + 13.5, z), WHITE).add(new THREE.BoxGeometry(1.2, 1.2, 3), M4(x, y + 27, z), WHITE); wmesh(b.geo()); }

// ── the land: a grid that is flat beside the road and hill further out
{ const x0 = -460, z0 = -300, cs = 8, nx = 130, nz = 98, pos = [], cl = [], uv = [], idx = [], ga = col('#8ee85a'), gb = col('#6fdc6a'), gc = col('#c8f570'), sand = col('#ffe9a8'), plaza = col('#f6d8ec'), c = new C();
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) { const x = x0 + i * cs, z = z0 + j * cs, n = nearest(x, z), town = ZONE[n.i] === 1, flat = town ? 26 : W + 13, h0 = hill(x, z), h = lerp(SY[n.i] - .3, h0, s01((n.d - flat) / 45)), r = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453, f = r - Math.floor(r);
    c.copy(ga).lerp(gb, f).lerp(gc, clamp((h - 9) / 9, 0, 1)); if (h < 2.2) c.lerp(sand, s01((2.2 - h) / .9)); if (town) c.lerp(plaza, 1 - s01((n.d - 20) / 12)); pos.push(x, h, z); cl.push(c.r, c.g, c.b); uv.push(-1, -1); }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, d = a + nx + 1, e = d + 1; idx.push(a, d, b, b, d, e); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(cl, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  wmesh(g, wmat({ polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 6 })).frustumCulled = false; }

// ── the road: one ribbon, seventeen vertices across. The shader paints asphalt, lines, kerbs, paving, verge, leaf shadow and the puddles
const PUD = [...Array(34)].map(() => ({ s: rnd(70, TL - 20), lat: rnd(-W + 1.6, W - 1.6), a: rnd(3, 7.5), b: rnd(1.3, 2.7) }));
{ const cols = [[-(W + 3.9), -.7], [-(W + 3.4), 1], [-(W + .3), 1], [-(W + .22), 0]]; for (let k = 0; k <= 8; k++) cols.push([-W + k * W / 4, 0]); cols.push([W + .22, 0], [W + .3, 1], [W + 3.4, 1], [W + 3.9, -.7]);
  const nc = cols.length, pos = [], aD = [], aE = [], idx = [];
  for (let r = 0; r <= N; r++) { const i = r % N, s = r * DS; for (const [lat, kh] of cols) { const x = SX[i] - TZ[i] * lat, z = SZ[i] + TX[i] * lat, side = Math.sign(lat), paved = ZONE[i] === 1 || (ZONE[i] === 2 && side < 0) ? 1 : 0;
      let pd = 0, sh = 0; for (const p of PUD) { const ds = wrapS(s - p.s); if (Math.abs(ds) < p.a) pd = Math.max(pd, 1 - Math.hypot(ds / p.a, (lat - p.lat) / p.b)); } for (const b of SHADE) { const d = Math.hypot(x - b[0], z - b[1]); if (d < b[2] * 1.6) sh = Math.max(sh, 1 - d / (b[2] * 1.6)); }
      pos.push(x, SY[i] + (kh < 0 ? kh : kh * KH[i]), z); aD.push(lat, s, pd, sh); aE.push(paved, K[i]); } }
  for (let r = 0; r < N; r++) for (let k = 0; k < nc - 1; k++) { const a = r * nc + k, b = a + 1, d = a + nc, e = d + 1; idx.push(a, b, d, b, e, d); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('aD', new THREE.Float32BufferAttribute(aD, 4)); g.setAttribute('aE', new THREE.Float32BufferAttribute(aE, 2)); g.setIndex(idx);
  wmesh(g, new THREE.ShaderMaterial({ uniforms: UW, ...STEN,
    vertexShader: `attribute vec4 aD;attribute vec2 aE;varying vec4 vA;varying vec2 vE;varying vec3 vP,vW;varying float vD;void main(){vA=aD;vE=aE;vP=position;vW=(modelMatrix*vec4(position,1.)).xyz;vec4 mv=modelViewMatrix*vec4(position,1.);vD=length(mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `${NOISE}${SKY}${LIT}uniform vec3 uShC,uEye;uniform float uFog,uWet;varying vec4 vA;varying vec2 vE;varying vec3 vP,vW;varying float vD;
    void main(){float lat=vA.x,s=vA.y,al=abs(lat),W=${W.toFixed(2)},TL=${TL.toFixed(3)};vec3 c;float n1=vn(vP.xz*.33),n2=vn(vP.xz*2.7);
      float leaf=vn(vP.xz*.5)*.6+vn(vP.xz*1.6+5.)*.4,sh=smoothstep(0.,.07,vA.w*1.2-leaf)*min(uSunI,1.); // shade under trees and beside houses, dappled
      if(al<W+.24){c=mix(vec3(.79,.73,.88),vec3(.70,.64,.82),step(.5,n1*.7+n2*.3));
        float edge=smoothstep(.1,.07,abs(al-(W-.5))),dash=smoothstep(.09,.06,al)*step(.5,fract(s/9.));c=mix(c,vec3(.98,.97,.94),max(edge,dash)*.92);
        float kb=smoothstep(W-.34,W-.3,al)*step(.0105,abs(vE.y));c=mix(c,mix(vec3(.98),vec3(1.,.18,.54),step(.5,fract(s/2.4))),kb);
        float ds=min(s,TL-s);if(ds<.9){vec2 q=floor(vec2(lat,s<TL*.5?s:s-TL)/.6);c=mix(vec3(.09),vec3(.97),mod(q.x+q.y,2.));}
        float pd=max(vA.z,uWet*vn(vP.xz*.11+9.)*1.25-.22)+(vn(vP.xz*.8)-.5)*.42,pm=smoothstep(.44,.5,pd);
        if(pm>0.||uWet>0.){vec3 v=normalize(vP-uEye),r=reflect(v,vec3(0.,1.,0.));r.xz+=uWet*(vn(vP.xz*6.+uTime*3.)-.5)*.07;vec3 rs=sky(normalize(r),0);float fr=.55+.45*pow(1.-max(-v.y,0.),3.);
          c=mix(c,c*.8,smoothstep(.36,.44,pd)*(1.-pm));c=mix(c,c*.6+rs*.3,uWet*.75*(1.-pm));c=mix(c,mix(c*.45,rs,fr),pm);sh*=1.-pm*.75;}}
      else{vec3 pave=vec3(.99,.87,.94)*(.94+.06*n2);vec2 g=abs(fract(vec2(s,al-W)/1.1)-.5);pave*=1.-.1*smoothstep(.44,.48,max(g.x,g.y));pave=mix(pave,vec3(.95,.94,.9),smoothstep(W+.6,W+.34,al));
        c=mix(mix(vec3(.56,.91,.35),vec3(.44,.86,.42),step(.5,n1*.6+n2*.4)),pave,vE.x);}
      c*=mix(uSunC,uShC,sh)+nightLight(vW,vec3(0.,1.,0.))*uNight;gl_FragColor=vec4(mix(uFogC,c,exp(-vD*uFog)),1.);}` })).frustumCulled = false; }

// ── sea and sky
wmesh(new THREE.PlaneGeometry(4200, 4200).rotateX(-Math.PI / 2), new THREE.ShaderMaterial({ uniforms: UW, ...STEN,
  vertexShader: `varying vec3 vP;varying float vD;void main(){vP=position;vec4 mv=modelViewMatrix*vec4(position,1.);vD=length(mv.xyz);gl_Position=projectionMatrix*mv;}`,
  fragmentShader: `${NOISE}${SKY}uniform vec3 uEye,uSeaA,uSeaB;uniform float uFog;varying vec3 vP;varying float vD;
  void main(){vec3 v=normalize(vP-uEye),r=reflect(v,vec3(0.,1.,0.));r.xz+=(vec2(vn(vP.xz*.09+uTime*.25),vn(vP.xz*.09-uTime*.2+4.))-.5)*.07;float fr=.2+.8*pow(1.-max(-v.y,0.),4.);
    vec3 c=mix(mix(uSeaA,uSeaB,smoothstep(30.,420.,vD)),sky(normalize(r),0),fr*.7);float sp=vn(vP.xz*vec2(.8,.22)+vec2(uTime*.5,0.))*vn(vP.xz*.06-uTime*.04+3.);c+=uSunC*smoothstep(.5,.56,sp)*.45*uSunI;
    gl_FragColor=vec4(mix(uFogC,c,exp(-vD*uFog*.8)),1.);}` })).frustumCulled = false;
const skyDome = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({ uniforms: UW, side: THREE.BackSide, depthWrite: false, ...STEN,
  vertexShader: `varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`, fragmentShader: `${NOISE}${SKY}varying vec3 vP;void main(){gl_FragColor=vec4(sky(normalize(vP),1),1.);}` }));
skyDome.renderOrder = RO.sky; skyDome.frustumCulled = false; world.add(skyDome);

// ── cars: one little hatchback, six colours
function carGeo(hex) { const b = new MB(), c = col(hex), dk = col('#17181d'), gl = col('#2b3854'), Tm = (x, y, z, rz = 0) => new THREE.Matrix4().compose(new V(x, y, z), new Qn().setFromAxisAngle(ZA, rz), new V(1, 1, 1));
  const taper = (g, sx, sz) => { const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) { p.setX(i, p.getX(i) * sx); p.setZ(i, p.getZ(i) * sz); } g.computeVertexNormals(); return g; };
  b.add(taper(new THREE.BoxGeometry(1.66, .5, 3.9), .93, .96), Tm(0, .55, 0), c).add(new THREE.BoxGeometry(1.7, .17, 3.96), Tm(0, .3, 0), dk).add(taper(new THREE.BoxGeometry(1.5, .48, 2.05), .8, .68), Tm(0, 1.03, .32), gl).add(new THREE.BoxGeometry(1.2, .05, 1.38), Tm(0, 1.285, .32), c);
  b.add(new THREE.BoxGeometry(1.36, .04, .3), Tm(0, 1.0, 1.84), c).add(new THREE.BoxGeometry(.4, .012, 1.2), Tm(0, .795, -1.25), WHITE).add(new THREE.BoxGeometry(.4, .012, 1.3), Tm(0, 1.31, .32), WHITE);
  for (const s of [-1, 1]) { for (const z of [-1.25, 1.25]) b.add(new THREE.CylinderGeometry(.31, .31, .24, 14), Tm(s * .78, .31, z, Math.PI / 2), dk).add(new THREE.CylinderGeometry(.17, .17, .26, 8), Tm(s * .78, .31, z, Math.PI / 2), col('#dcdee3'));
    b.add(new THREE.BoxGeometry(.36, .13, .06), Tm(s * .55, .63, -1.93), col('#fff6c9')).add(new THREE.BoxGeometry(.42, .11, .06), Tm(s * .53, .65, 1.93), col('#ff2b2b')).add(new THREE.BoxGeometry(.05, .16, 1.36), Tm(s * .62, 1.03, .32), c); }
  return b.geo(); }
const blobTex = (() => { const { ctx, tex } = ctex(64, 64, false), g = ctx.createRadialGradient(32, 32, 4, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.6, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, 64, 64); return tex; })();
const OUTM = new THREE.MeshBasicMaterial({ color: '#1d1233', side: THREE.BackSide, ...STEN }); // the ink line round every car: the same car again, a little bigger, inside out
const RCOL = ['#ffe14d', '#19c3ff', '#7ed321', '#ff8a3c', '#a45cff', '#ffffff'], RNAME = ['SOL', 'MIKAN', 'MINT', 'AO', 'MOMO', 'YUKI'];
const RIV = RCOL.map((hex, k) => { const g = new THREE.Group(); g.rotation.order = 'YXZ'; const cg = carGeo(hex); wmesh(cg, WM, g); const ol = new THREE.Mesh(cg, OUTM); ol.scale.set(1.05, 1.04, 1.03); ol.position.y = -.02; ol.renderOrder = RO.world; g.add(ol); const sh = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 5).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blobTex, color: '#1c2148', transparent: true, opacity: .5, depthWrite: false, ...STEN })); sh.position.y = .05; sh.renderOrder = RO.world + 1; g.add(sh); world.add(g);
  const mb = new MB(); mb.box(M4(-.07, 0, 0), .14, .045, .05, col(hex)).box(M4(-.24, -.07, 0), .2, .15, .11, col(hex)).box(M4(-.24, -.055, .056), .17, .12, .004, col('#d4f1ff')).box(M4(-.24, -.072, 0), .21, .02, .12, col('#1d1233')); const mg = mb.geo(); // door mirrors: they can come off
  const mir = [-1, 1].map(s => { const o = wmesh(mg, WM2, g); o.position.set(s * .8, .8, -.52); o.scale.x = -s; return { o, on: true, p: o.position.clone(), q: o.quaternion.clone(), s: o.scale.clone() }; });
  return { k, g, hex, mir, name: RNAME[k], s: 0, prog: 0, lat: 0, lt: 0, v: 0, skill: 1 - k * .018, bias: (k % 2 ? 1 : -1) * (.5 + k * .22), honk: 0, o: {} }; });

// ── particles (track space): sparks off a wall, spray off a wet road, tyre smoke, confetti. One Points object, one pool
const PN = 420, parts = (() => { const pos = new Float32Array(PN * 3), cl = new Float32Array(PN * 4), sz = new Float32Array(PN), vel = new Float32Array(PN * 3), life = new Float32Array(PN), max = new Float32Array(PN), grav = new Float32Array(PN), glow = new Float32Array(PN), g = new THREE.BufferGeometry(); let k = 0;
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aC', new THREE.BufferAttribute(cl, 4)); g.setAttribute('aS', new THREE.BufferAttribute(sz, 1));
  const m = new THREE.Points(g, new THREE.ShaderMaterial({ ...PRE, ...STEN, vertexShader: `attribute vec4 aC;attribute float aS;varying vec4 vC;void main(){vC=aC;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=aS*900./max(-mv.z,.3);}`,
    fragmentShader: `varying vec4 vC;void main(){float d=length(gl_PointCoord-.5);float a=smoothstep(.5,.2,d)*abs(vC.a);gl_FragColor=vec4(vC.rgb*a,vC.a<0.?0.:a);}` })); m.frustumCulled = false; m.renderOrder = RO.fx; world.add(m);
  return { emit(p, v, c, o = {}) { const i = k++ % PN; pos[i * 3] = p.x; pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.z; vel[i * 3] = v.x; vel[i * 3 + 1] = v.y; vel[i * 3 + 2] = v.z; cl[i * 4] = c.r; cl[i * 4 + 1] = c.g; cl[i * 4 + 2] = c.b; max[i] = life[i] = o.life || .6; sz[i] = o.size || .05; grav[i] = o.grav ?? 9; glow[i] = o.glow ? -1 : 1; cl[i * 4 + 3] = glow[i] * (o.a || 1); },
    update(dt) { for (let i = 0; i < PN; i++) { if (life[i] <= 0) continue; life[i] -= dt; const j = i * 3; vel[j + 1] -= grav[i] * dt; pos[j] += vel[j] * dt; pos[j + 1] += vel[j + 1] * dt; pos[j + 2] += vel[j + 2] * dt; if (life[i] <= 0) { sz[i] = 0; pos[j + 1] = -99; } else cl[i * 4 + 3] = glow[i] * Math.min(1, life[i] / max[i] * 2) * (glow[i] < 0 ? 1 : .7); } g.attributes.position.needsUpdate = g.attributes.aC.needsUpdate = g.attributes.aS.needsUpdate = true; } }; })();
// rain in the air: short streaks in car space, slanted by your speed
const RAINN = 260, rainP = new Float32Array(RAINN * 6), rainS = [...Array(RAINN)].map(() => new V(rand(-4, 5), rand(-1.2, 3), rand(-16, -1.3))), rainM = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#dfe9f2', transparent: true, opacity: 0, depthWrite: false, ...STEN }));
rainM.geometry.setAttribute('position', new THREE.BufferAttribute(rainP, 3)); rainM.frustumCulled = false; rainM.renderOrder = RO.fx; rig.add(rainM);
function updRain(dt, v) { rainM.visible = WX.rain > .02; if (!rainM.visible) return; rainM.material.opacity = WX.rain * .42; const vz = v * .8, k = .035;
  for (let i = 0; i < RAINN; i++) { const p = rainS[i]; p.y -= 11 * dt; p.z += vz * dt; if (p.y < -1.3 || p.z > -1.2) { p.set(rand(-4, 5), p.y < -1.3 ? 3 : rand(-1.2, 3), p.z > -1.2 ? -16 : rand(-16, -1.3)); } const j = i * 6; rainP[j] = p.x; rainP[j + 1] = p.y; rainP[j + 2] = p.z; rainP[j + 3] = p.x; rainP[j + 4] = p.y + 11 * k; rainP[j + 5] = p.z - vz * k; } rainM.geometry.attributes.position.needsUpdate = true; }
