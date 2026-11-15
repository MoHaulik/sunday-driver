
// ═══════════════════════════ THE ART DIRECTION LAYER: Townsville across the bay, hero streaks, a heart drawn in the sky when you make the podium, and trinkets you can flick ═══════════════════════════
// ── a ribbon: the Powerpuff flight trail. Flat colour, a lighter core, a fat ink edge, tapering to nothing at the tail. Offset along a fixed normal, so it costs nothing to build.
const RIBV = `attribute float aT;varying vec2 vU;void main(){vU=vec2(aT,uv.y);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const RIBF = `uniform vec3 uC;uniform float uA;varying vec2 vU;void main(){float e=abs(vU.y-.5)*2.,k=1.-vU.x;if(k<.02)discard;vec3 c=mix(uC,vec3(1.),smoothstep(.34,.12,e)*.55);c=mix(c,vec3(.11,.07,.2),smoothstep(.7,.78,e));gl_FragColor=vec4(c,uA*smoothstep(.0,.25,k));}`;
class Ribbon { constructor(n, hex, parent, w, tp = 1) { this.n = n; this.w = w; this.tp = tp; this.pts = []; const g = new THREE.BufferGeometry(), t = new Float32Array(n * 2), uv = new Float32Array(n * 4), idx = [];
    for (let i = 0; i < n; i++) { t[i * 2] = t[i * 2 + 1] = i / (n - 1); uv[i * 4 + 1] = 0; uv[i * 4 + 3] = 1; if (i < n - 1) idx.push(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 1, i * 2 + 3, i * 2 + 2); }
    this.pos = new Float32Array(n * 6); g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3)); g.setAttribute('aT', new THREE.BufferAttribute(t, 1)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.setDrawRange(0, 0);
    this.m = new THREE.Mesh(g, new THREE.ShaderMaterial({ uniforms: { uC: u(col(hex)), uA: u(0) }, vertexShader: RIBV, fragmentShader: RIBF, transparent: true, depthWrite: false, side: THREE.DoubleSide, ...STEN })); this.m.renderOrder = RO.fx; this.m.frustumCulled = false; parent.add(this.m); }
  push(p, md = 0) { if (md && this.pts.length && this.pts[0].distanceTo(p) < md) return; this.pts.unshift(p.clone()); if (this.pts.length > this.n) this.pts.pop(); }
  build(nrm, mid = 0) { const P = this.pts, L = P.length; for (let i = 0; i < L; i++) { const a = P[Math.max(i - 1, 0)], b = P[Math.min(i + 1, L - 1)], h = this.w * (1 - this.tp * i / this.n) * .5 + .001; // nrm null: across the path, in its plane (the heart); a vector: a vertical band (the cars)
      if (nrm) _v.copy(nrm); else _v.subVectors(b, a).cross(ZA).normalize(); for (const [s, o] of [[-1, 0], [1, 3]]) { this.pos[i * 6 + o] = P[i].x + _v.x * h * s; this.pos[i * 6 + o + 1] = P[i].y + mid + _v.y * h * s; this.pos[i * 6 + o + 2] = P[i].z + _v.z * h * s; } }
    this.m.geometry.attributes.position.needsUpdate = true; this.m.geometry.setDrawRange(0, Math.max(0, L - 1) * 6); } }

// ── clouds in 3D: real puffs out in the world, so they slide past each other as you drive and turn your head. Cel-shaded against the sun, a silver rim, a fat ink outline (the puffs again, inside out).
// Three kinds, like the painted ones were: a classic puff, a tall tower, a long bank. At nightfall every puff shrinks to nothing and leaves the stars.
const CLOUDS = (() => { const P2 = [], g = new THREE.Group(); g.position.set(60, 0, 120); world.add(g); let sd = 5; const r = (a = 0, b = 1) => { sd = sd * 16807 % 2147483647; return a + sd / 2147483647 * (b - a); };
  const KIND = [[[-1.5, .2, .55], [-.75, .25, .68], [0, .2, .75], [.8, .22, .65], [1.5, .18, .5], [-.95, .75, .62], [-.15, .95, .78], [.65, .85, .62], [.1, 1.45, .55]], [[-1, .2, .6], [-.3, .2, .68], [.45, .22, .62], [1, .2, .52], [-.6, .85, .62], [.15, .95, .7], [.65, .85, .5], [-.2, 1.6, .58], [.3, 1.7, .55], [0, 2.3, .52]],
    [...Array(10)].map((_, j) => j < 7 ? [(j - 3) * .55, .15, .38 + (j * 37 % 5) * .04] : [(j - 8) * .75, .55, .5 + (j % 2) * .1])];
  const BASE = []; for (let k = 0; k < 22; k++) { const a = k / 22 * 6.283 + r(-.12, .12), R = r(200, 520), S = r(17, 30), h = r(70, 150), yaw = r(0, 6.28), kind = [0, 2, 1, 0, 0, 2, 1, 0, 2][k % 9], c = new V(Math.cos(a) * R, h, Math.sin(a) * R);
    for (const [x, y, sz] of KIND[kind]) { const o = new V(x * S * 1.2, y * S, r(-.3, .3) * S).applyAxisAngle(YA, yaw); P2.push(new THREE.Matrix4().compose(o.add(c), new Qn().setFromEuler(new THREE.Euler(0, r(0, 6), 0)), new V(1, .9, 1).multiplyScalar(sz * S * r(.92, 1.08)))); BASE.push([h, S]); } }
  const geo = new THREE.SphereGeometry(1, 14, 9), VS = (inflate) => `uniform float uNight,uStorm;varying vec3 vN,vW;varying float vD,vH;void main(){float gone=uNight*(1.-uStorm);vec3 p=position*(1.-gone*.985)${inflate ? '+normal*(1.-gone)*.07' : ''};vec4 l=instanceMatrix*vec4(p,1.);vH=(l.y-instanceColor.r*200.)/(instanceColor.g*40.);vec4 w=modelMatrix*l;vW=w.xyz;vN=normalize(mat3(modelMatrix)*mat3(instanceMatrix)*normal);vD=distance(cameraPosition,w.xyz);gl_Position=projectionMatrix*viewMatrix*w;}`;
  const mk = (fs, side, inflate) => { const m = new THREE.InstancedMesh(geo, new THREE.ShaderMaterial({ uniforms: UW, vertexShader: VS(inflate), fragmentShader: fs, side, ...STEN }), P2.length); P2.forEach((q, i) => { m.setMatrixAt(i, q); m.setColorAt(i, _c.setRGB(BASE[i][0] / 200, BASE[i][1] / 40, 0)); }); m.frustumCulled = false; m.renderOrder = RO.world; g.add(m); return m; };
  mk(`uniform vec3 uSun,uSunC,uCl,uCs,uFogC,uHor;uniform float uFog;varying vec3 vN,vW;varying float vD,vH;void main(){vec3 n=normalize(vN),v=normalize(cameraPosition-vW);float d=dot(n,uSun),b=smoothstep(-.12,-.06,d);
    vec3 c=mix(mix(uCs,uCl,.5),uCl,b*.7+.3*smoothstep(.1,.9,vH)); // one shadow line per puff, and the whole cloud's belly goes lavender
    c+=mix(uHor,uSunC,.5)*pow(1.-max(dot(n,v),0.),3.)*.35*smoothstep(-.3,.3,d);gl_FragColor=vec4(mix(uFogC,c,exp(-vD*uFog*.45)),1.);}`, THREE.FrontSide); // cel-shaded with a silver lining
  mk(`uniform vec3 uFogC,uCs;uniform float uFog;varying vec3 vN,vW;varying float vD,vH;void main(){gl_FragColor=vec4(mix(uFogC,mix(uCs,vec3(.11,.07,.2),.75),exp(-vD*uFog*.45)),1.);}`, THREE.BackSide, true); // the ink
  return g; })();
// ── Townsville across the bay. Not random boxes: seven kinds of building (deco setbacks, a Y2K capsule with a ring, glass slabs, a domed hall, a water-tower walk-up,
// a billboard block and the NXT needle), each with a lit face, a shadow side, a highlight edge and a fat ink line. Two rows for depth, downtown clusters where it gets tall,
// a hazy far city behind for parallax. At golden hour the windows come on.
function townsville(W2, H2, far) { const A = ctex(W2, H2), B = ctex(W2 / 2, H2 / 2, false), c = A.ctx, m = B.ctx, ink = '#1d1233', glass = '#4252ad', S = 3; let sd = far ? 77 : 7; const r = (a = 0, b = 1) => { sd = sd * 16807 % 2147483647; return a + sd / 2147483647 * (b - a); };
  const PAL = far ? ['#c9b8f0', '#d9c6f6', '#bfb0ec'] : ['#ff8fc7', '#7fd0ff', '#a4e36b', '#c9a6ff', '#ffd86b', '#ffffff', '#ff9e8a', '#8ff0d8'];
  c.clearRect(0, 0, W2, H2); m.fillStyle = '#000'; m.fillRect(0, 0, W2, H2 / 2); m.scale(.5, .5); c.lineJoin = m.lineJoin = 'round';
  const shade = h => '#' + new C(h).lerp(new C('#5b3fa8'), .38).getHexString(), lite = h => '#' + new C(h).lerp(new C('#ffffff'), .45).getHexString();
  const win = (x, y, w, h, round) => { c.fillStyle = glass; if (round) { c.beginPath(); c.arc(x + w / 2, y + h / 2, w / 2, 0, 7); c.fill(); } else c.fillRect(x, y, w, h); c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(x, y, w * .35, h); if (r() < .5) { m.fillStyle = `rgb(${200 + r() * 55 | 0},0,0)`; m.fillRect(x, y, w, h); } };
  const block = (x, y, w, h, f, kind, cap = true) => { const sw = Math.max(6, w * .2), sh = shade(f); // front face, then the shadow side as a slanted face, then windows, then ink
    c.fillStyle = sh; c.beginPath(); c.moveTo(x + w, y); c.lineTo(x + w + sw, y + sw * .4); c.lineTo(x + w + sw, H2); c.lineTo(x + w, H2); c.fill(); c.fillStyle = f; c.fillRect(x, y, w, H2 - y);
    if (!far) { const g = c.createLinearGradient(0, y, 0, H2); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(1, 'rgba(91,63,168,.22)'); c.fillStyle = g; c.fillRect(x, y, w, H2 - y); }
    const pad = far ? 6 : 10; if (far) { c.fillStyle = 'rgba(255,255,255,.55)'; for (let yy = y + 10; yy < H2 - 8; yy += 14) for (let xx = x + 6; xx < x + w - 6; xx += 10) if (r() < .55) c.fillRect(xx, yy, 4, 6); }
    else if (kind === 'strip') for (let xx = x + pad; xx < x + w - pad - 6; xx += 16) { win(xx, y + 14, 9, H2 - y - 30); }
    else if (kind === 'band') for (let yy = y + 14; yy < H2 - 20; yy += 26) win(x + pad, yy, w - pad * 2, 11);
    else if (kind === 'port') for (let yy = y + 18; yy < H2 - 20; yy += 24) for (let xx = x + pad; xx < x + w - pad - 10; xx += 20) win(xx, yy, 12, 12, true);
    else for (let yy = y + 14; yy < H2 - 20; yy += 24) for (let xx = x + pad; xx < x + w - pad - 10; xx += 18) win(xx, yy, 11, 14);
    if (!far) { c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(x + 4, y + 4, 3, H2 - y); c.strokeStyle = ink; c.lineWidth = 6; c.beginPath(); c.moveTo(x, H2); c.lineTo(x, y); c.lineTo(x + w, y); c.lineTo(x + w + sw, y + sw * .4); c.lineTo(x + w + sw, H2); c.stroke(); c.lineWidth = 3; c.beginPath(); c.moveTo(x + w, y); c.lineTo(x + w, H2); c.stroke(); }
    return sw; };
  const prop = (x, y, w, f) => { if (far) return; c.strokeStyle = ink; c.lineWidth = 4; const t = r(); // rooftop life
    if (t < .3) { c.beginPath(); c.moveTo(x + w * .7, y); c.lineTo(x + w * .7, y - 34); c.stroke(); c.fillStyle = '#ff4f9a'; c.beginPath(); c.arc(x + w * .7, y - 36, 5, 0, 7); c.fill(); }
    else if (t < .55) { c.fillStyle = '#e8e4f4'; c.fillRect(x + w * .15, y - 12, w * .25, 12); c.strokeRect(x + w * .15, y - 12, w * .25, 12); }
    else if (t < .75) { const cx = x + w * .6; c.beginPath(); c.moveTo(cx - 12, y); c.lineTo(cx - 9, y - 18); c.moveTo(cx + 12, y); c.lineTo(cx + 9, y - 18); c.stroke(); c.fillStyle = '#d98b5a'; c.beginPath(); c.roundRect(cx - 14, y - 40, 28, 24, 4); c.fill(); c.stroke(); c.fillStyle = '#b8683e'; c.beginPath(); c.moveTo(cx - 16, y - 40); c.lineTo(cx, y - 52); c.lineTo(cx + 16, y - 40); c.fill(); c.stroke(); } // a water tower
    else { const bw = Math.min(w * .8, 90); c.fillStyle = '#fff'; c.fillRect(x + 6, y - 40, bw, 32); c.strokeRect(x + 6, y - 40, bw, 32); c.beginPath(); c.moveTo(x + 14, y - 8); c.lineTo(x + 14, y); c.moveTo(x + bw - 2, y - 8); c.lineTo(x + bw - 2, y); c.stroke();
      c.fillStyle = r() < .5 ? '#ff4f9a' : '#19c3ff'; c.font = 'italic 800 18px Unbounded,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(r() < .5 ? 'NXT' : '♥', x + 6 + bw / 2, y - 23, bw - 8); } };
  const B7 = { // each returns nothing; draws itself standing on the ground at x with width w and roof height y
    slab: (x, w, y, f) => { block(x, y, w, H2, f, r() < .5 ? 'band' : 'grid'); prop(x, y, w, f); },
    deco: (x, w, y, f) => { block(x, y + 70, w, H2, f, 'strip'); block(x + w * .14, y + 30, w * .72, H2, lite(f), 'strip'); block(x + w * .3, y, w * .4, H2, f, 'strip'); if (!far) { c.strokeStyle = ink; c.lineWidth = 4; c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y - 46); c.stroke(); } },
    capsule: (x, w, y, f) => { block(x, y + w / 2, w, H2, f, 'port'); c.fillStyle = f; c.beginPath(); c.arc(x + w / 2, y + w / 2, w / 2, Math.PI, 0); c.fill(); if (!far) { c.strokeStyle = ink; c.lineWidth = 6; c.stroke();
      c.lineWidth = 5; c.strokeStyle = '#fff'; c.beginPath(); c.ellipse(x + w / 2, y + w * .75, w * .82, w * .18, 0, 0, 7); c.stroke(); c.strokeStyle = ink; c.lineWidth = 3; c.beginPath(); c.ellipse(x + w / 2, y + w * .75, w * .82, w * .18, 0, 0, 7); c.stroke(); } }, // the Y2K one: a pill with a Saturn ring
    dome: (x, w, y, f) => { block(x, y + w * .45, w, H2, '#fff4e0', 'strip'); c.fillStyle = f; c.beginPath(); c.arc(x + w / 2, y + w * .45, w * .36, Math.PI, 0); c.fill(); if (!far) { c.strokeStyle = ink; c.lineWidth = 6; c.stroke(); c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(x + w / 2, y + w * .09 - 6, 7, 0, 7); c.fill(); c.lineWidth = 3; c.stroke(); } },
    hero: (x, w, y) => { const cx = x + w / 2; block(cx - 9, y + 80, 18, H2, '#fff', 'band'); c.fillStyle = '#ff8fc7'; c.beginPath(); c.ellipse(cx, y + 70, 40, 16, 0, 0, 7); c.fill(); // the NXT needle: a pod, a heart on the spire
      if (!far) { c.strokeStyle = ink; c.lineWidth = 6; c.stroke(); c.fillStyle = glass; c.fillRect(cx - 30, y + 66, 60, 7); for (let k = 0; k < 6; k++) { m.fillStyle = 'rgb(255,0,0)'; m.fillRect(cx - 30 + k * 10, y + 66, 7, 7); } c.lineWidth = 4; c.beginPath(); c.moveTo(cx, y + 54); c.lineTo(cx, y + 18); c.stroke(); }
      c.fillStyle = '#ff4f9a'; c.beginPath(); c.moveTo(cx, y + 20); c.bezierCurveTo(cx - 22, y + 4, cx - 12, y - 14, cx, y - 2); c.bezierCurveTo(cx + 12, y - 14, cx + 22, y + 4, cx, y + 20); c.fill(); if (!far) { c.lineWidth = 4; c.stroke(); } } };
  const env = x => { const u = x / W2; return .35 + .65 * Math.max(Math.exp(-(((u - .28) / .13) ** 2)), Math.exp(-(((u - .74) / .11) ** 2))); }; // two downtowns per tile
  const each = (x, w, f) => { f(x); if (x + w * 1.3 > W2) f(x - W2); }; // it tiles: whatever runs off the right edge comes back on the left
  for (const row of far ? [0] : [0, 1]) { let x = row ? 20 : -10; while (x < W2) { const front = row === 1, w = front ? r(60, 120) : r(70, 150), hgt = (front ? r(.25, .5) : r(.45, 1)) * env(x + w / 2) * (H2 - 60), y = H2 - Math.max(70, hgt), f = PAL[r() * PAL.length | 0];
      const kind = !front && !far && Math.abs(x - W2 * .28) < 50 ? 'hero' : r() < .14 ? 'capsule' : r() < .2 ? 'deco' : r() < .14 && front ? 'dome' : 'slab'; each(x, w, xx => B7[kind](xx, w, kind === 'hero' ? 40 : y, f)); x += w * (front ? r(1.4, 2.6) : r(.82, 1.05)); } }
  for (const t of [A.tex, B.tex]) { t.wrapS = THREE.RepeatWrapping; t.needsUpdate = true; } return [A.tex, B.tex]; }
const SKYL = [[830, 210, 95, 1.5, .82], [990, 230, 105, 2, .5]].map(([R, H, Y, rep, k], far) => { const [map, lit] = townsville(far ? 2048 : 4096, 512, far), cx = 60, cz = 120, a0 = -1.75, a1 = 1.75, g = new THREE.CylinderGeometry(R, R, H, 64, 1, true, Math.PI + a0, a1 - a0).translate(cx, Y, cz), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * rep);
  const o = wmesh(g, new THREE.ShaderMaterial({ uniforms: { ...UW, map: u(map), lit: u(lit), uGlow: u(0), uK: u(k) }, side: THREE.BackSide, ...STEN,
    vertexShader: `varying vec2 vUv;varying float vD;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vD=length(mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform sampler2D map,lit;uniform vec3 uFogC,uSunC;uniform float uFog,uGlow,uK,uNight;varying vec2 vUv;varying float vD;void main(){vec4 t=texture2D(map,vUv);if(t.a<.5)discard;
      vec3 c=t.rgb*mix(vec3(1.),uSunC,.3);c=mix(c,t.rgb*vec3(.3,.28,.55),uNight*.85);c=mix(c,vec3(1.,.84,.5),texture2D(lit,vUv).r*min(uGlow,1.)*.85);gl_FragColor=vec4(mix(uFogC,c,uK*exp(-vD*uFog*.35)+.15*uGlow*uK),1.);}` }));
  o.renderOrder = RO.world - 1 + far * -.5; o.frustumCulled = false; return o; });

// ── hero streaks behind the rivals when they are flat out, and speed lines past your own windows when you boost
const RTR = RIV.map(r => ({ rb: new Ribbon(26, r.hex, world, .95), acc: 0 }));
const SPN = 90, speed = (() => { const pos = new Float32Array(SPN * 12), cl = new Float32Array(SPN * 12), S = [], H = ['#ff5fb0', '#5fd0ff', '#86e05a', '#ffffff'], g = new THREE.BufferGeometry(), idx = [];
  for (let i = 0; i < SPN; i++) { const a = rand(0, 6.283), r = rand(2.4, 7); S.push({ x: Math.cos(a) * r + CX, y: Math.sin(a) * r * .55 + .4, z: rand(-40, 2), a, l: rand(2, 6), c: col(pick(H)) }); idx.push(i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3); }
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(cl, 3)); g.setIndex(idx);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, ...STEN })); m.renderOrder = RO.fx; m.frustumCulled = false; rig.add(m); return { S, pos, cl, g, m }; })();

// ── the win: two streaks draw a heart in the sky ahead, a third shoots up through it and bursts. Lives in the cockpit's space, so it waits for you while the car rolls on
const HEART = (t, out) => out.set(16 * Math.sin(t) ** 3, 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t), 0);
const show = grp(rig, CX, 21, -65); show.scale.setScalar(1.45); const FLY = ['#ff4fa3', '#4fc6ff', '#7ed321'].map(h => ({ rb: new Ribbon(220, h, show, 1.9, 0), c: col(h) }));
const PPG = { win: -1, last: '', prevTip: PH.map(h => h.tips.map(t => t.clone())), poke: 0 };
function heartShow() { PPG.win = 0; FLY.forEach(f => { f.rb.pts.length = 0; f.rb.m.material.uniforms.uA.value = 1; }); sfx('whoosh'); }

function ppg(dt, sdt) {
  // the sky's mood paints the city: lit windows at golden hour, the sunburst stronger as the sun drops
  const s = WX.w.reduce((a, b) => a + b, 0) || 1; CLOUDS.rotation.y = T * .004; SKYL.forEach(o => o.material.uniforms.uGlow.value = (WX.w[2] + (WX.w[3] || 0) * 1.3) / s);
  // streaks behind rivals going flat out
  for (const [k, r] of RIV.entries()) { const t = RTR[k], fast = s01((r.v - 33) / 9) * (G.phase === 'race' || G.phase === 'finish' || G.phase === 'poster' ? 1 : 0); t.acc += sdt; if (t.acc > .045) { t.acc = 0; t.rb.push(_v.copy(r.g.position)); }
    t.rb.m.material.uniforms.uA.value += (fast * .9 - t.rb.m.material.uniforms.uA.value) * damp(dt, .25); t.rb.m.visible = t.rb.m.material.uniforms.uA.value > .01; if (t.rb.m.visible) t.rb.build(YA, .78); }
  // speed lines: boost is full blast, a clean run at speed is a whisper of it
  const want = P.boost > 0 ? 1 : Math.min(P.clean / 14, 1) * s01((P.vf - 30) / 12) * .45, M2 = speed.m.material; M2.opacity += (want - M2.opacity) * damp(dt, .15); speed.m.visible = M2.opacity > .01;
  if (speed.m.visible) speed.S.forEach((q, i) => { q.z += P.vf * 1.6 * sdt; if (q.z > 3) { q.z = rand(-45, -25); q.a = rand(0, 6.283); const r = rand(2.4, 7); q.x = Math.cos(q.a) * r + CX; q.y = Math.sin(q.a) * r * .55 + .4; }
    const w = .04, nx = -Math.sin(q.a) * w, ny = Math.cos(q.a) * w * .55, P4 = [[q.x - nx, q.y - ny, q.z], [q.x + nx, q.y + ny, q.z], [q.x + nx, q.y + ny, q.z - q.l], [q.x - nx, q.y - ny, q.z - q.l]];
    P4.forEach((p, j) => { speed.pos.set(p, i * 12 + j * 3); speed.cl.set([q.c.r, q.c.g, q.c.b], i * 12 + j * 3); }); });
  if (speed.m.visible) speed.g.attributes.position.needsUpdate = speed.g.attributes.color.needsUpdate = true;
  // the heart: podium or better
  const ph = G.phase; if (ph === 'finish' && PPG.last !== 'finish' && G.place <= 3) heartShow(); PPG.last = ph;
  if (PPG.win >= 0) { PPG.win += dt; const w = PPG.win, d = s01(w / 2.6);
    [[0, 1], [0, -1]].forEach(([, sg], k) => { const f = FLY[k], t = d * Math.PI * sg; HEART(t, _v); if (w < 2.8) { f.rb.push(_v, .3); if (k === 0 && Math.random() < .5) emitStar(_v, f.c); } f.rb.build(null); });
    const g = FLY[2], gu = clamp((w - 2.3) / .8, 0, 1); if (w > 2.3 && w < 3.3) { g.rb.push(_v.set(Math.sin(gu * 9) * 1.2 * (1 - gu), -22 + gu * 19, 0), .3); g.rb.build(null); }
    if (w > 3.1 && PPG.burst !== 1) { PPG.burst = 1; sfx('firework'); for (let i = 0; i < 70; i++) emitStar(_v.set(0, -3, 0), pick(FLY).c, 1); }
    if (w > 7) FLY.forEach(f => { f.rb.m.material.uniforms.uA.value = Math.max(0, 1 - (w - 7) / 1.4); }); if (w > 8.5) { PPG.win = -1; PPG.burst = 0; FLY.forEach(f => f.rb.m.geometry.setDrawRange(0, 0)); } }
  // poke the trinkets: a fingertip that meets a dangling thing gives it the push your hand had
  for (const h of PH) { if (!h.ok) continue; h.tips.forEach((t, k) => { const pv = PPG.prevTip[h.i][k]; _v3.subVectors(t, pv).divideScalar(Math.max(dt, .008)); pv.copy(t);
    for (const p of PEND) { p.g.localToWorld(_v4.set(0, -p.L * .9, 0)); rig.worldToLocal(_v4); if (_v4.distanceTo(t) < .035 && _v3.length() > .15) { p.vz += clamp(_v3.x, -3, 3) / p.L * .5; p.vx -= clamp(_v3.z, -3, 3) / p.L * .5; if (T > PPG.poke) { PPG.poke = T + .25; sfx('tick'); } } } }); } }
function emitStar(p, c, big) { show.localToWorld(_v2.copy(p)); world.worldToLocal(_v2); _v3.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).multiplyScalar(big ? 14 : 1.5); parts.emit(_v2, _v3, c, { life: big ? 1.6 : .9, size: big ? 2.6 : 1.3, grav: big ? 3 : 0, glow: 1 }); }

// ═══════════════════════════ A WORLD THAT ANSWERS BACK: trees shed leaves as you blast past and shake when you hit the wall; hits come in three weights ═══════════════════════════
const LEAF = ['#7be04a', '#a8f25c', '#3fc98a', '#ffd23f', '#ff9fd0'], TSH = new Map(), TCD = new Float32Array(TREES.length), TBUCK = [...Array(N)].map(() => []), EU = new THREE.Euler();
TREES.forEach((t, k) => { const n = nearest(t[0], t[2]); if (n.d < W + 10) TBUCK[n.i].push(k); }); // the roadside trees, filed by where along the road they stand
function shed(k, n, push) { const t = TREES[k]; for (let q = 0; q < n; q++) parts.emit(_v.set(t[0] + rand(-1.7, 1.7) * t[3], t[1] + rand(3, 5) * t[3], t[2] + rand(-1.7, 1.7) * t[3]), _v2.set(rand(-1.5, 1.5) + push.x, rand(-.3, 1.2), rand(-1.5, 1.5) + push.z), _c.set(pick(LEAF)), { life: rand(1.8, 3.2), size: rand(.11, .19), grav: rand(.6, 1.4) }); }
const treesNear = (r, f) => { for (let d = -6; d <= 6; d++) for (const k of TBUCK[ix(P.i + d)]) { const t = TREES[k], dist = Math.hypot(t[0] - P.x, t[2] - P.z); if (dist < r) f(k, dist); } };
// a comic hit: a starburst with a word on it, popped up where the cars met
function comicTex(w, fill, txt = '#fff') { const t = ctex(256, 256), c = t.ctx; c.clearRect(0, 0, 256, 256); c.beginPath(); for (let i = 0; i < 28; i++) { const a = i / 28 * 6.283, R = i % 2 ? 78 : 118 + (i * 37 % 5) * 3; c.lineTo(128 + Math.cos(a) * R, 128 + Math.sin(a) * R * .82); } c.closePath();
  c.fillStyle = fill; c.fill(); c.lineJoin = 'round'; c.lineWidth = 10; c.strokeStyle = '#1d1233'; c.stroke(); c.translate(128, 132); c.rotate(-.14); c.font = 'italic 800 54px Unbounded,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 12; c.strokeText(w, 0, 0, 200); c.fillStyle = txt; c.fillText(w, 0, 0, 200); t.tex.needsUpdate = true; return t.tex; }
const POWT = ['POW!', 'BAM!', 'BONK!', 'WHAM!', 'KRAK!'].map((w, k) => comicTex(w, ['#ffe14d', '#ff5fb0', '#5fd0ff', '#86e05a', '#ffffff'][k], k === 4 ? '#ff2d8a' : '#fff'));
const POW = [0, 1, 2].map(() => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: POWT[0], transparent: true, depthTest: false, depthWrite: false, toneMapped: false, ...STEN })); s.renderOrder = RO.fx + 2; s.visible = false; world.add(s); return { s, t: 9, size: 1 }; }); let powK = 0;
function pow(p, size, map) { const o = POW[powK++ % 3]; o.s.material.map = map || pick(POWT); o.s.material.rotation = rand(-.25, .25); o.s.position.copy(p); o.t = 0; o.size = size; o.s.visible = true; }
function chips(p, hex, n, spd) { for (let q = 0; q < n; q++) parts.emit(_v3.copy(p).add(_v4.set(rand(-.4, .4), rand(-.2, .3), rand(-.4, .4))), _v4.set(P.vx * .5 + rand(-spd, spd), rand(1, spd + 1), P.vz * .5 + rand(-spd, spd)), _c.set(hex), { life: rand(.5, 1.1), size: rand(.04, .08), grav: 9 }); }
const kick = a => PEND.forEach(p => { p.vz += rand(-a, a) * 9; p.vx += rand(-a, a) * 9; }), spark = (p, n) => { for (let q = 0; q < n; q++) parts.emit(_v3.copy(p), _v4.set(P.vx * .6 + rand(-3, 3), rand(1, 5), P.vz * .6 + rand(-3, 3)), _c.set('#ffc46b'), { life: rand(.2, .5), size: .035, glow: 1 }); };
function carHit(r, imp, side) { const tier = imp < 4 ? 0 : imp < 10 ? 1 : 2, o = r.g.position, p = _v.set((P.x + o.x) / 2, (P.y + o.y) / 2 + .7, (P.z + o.z) / 2).clone(); // a nudge, a hit, or a wreck-the-moment hit
  P.hitT = T + .35; P.clean = 0; P.shake = Math.min(1, P.shake + [.25, .6, 1][tier]); sfxAt(tier ? 'bump' : 'squeak', world.localToWorld(p.clone()), [.4, .85, 1][tier]); r.sq = [.35, .7, 1][tier]; r.wob = [.05, .12, .2][tier] * side;
  chips(p, r.hex, [3, 10, 26][tier], [1.5, 3, 5][tier]); chips(p, P.hex, [2, 6, 14][tier], [1.5, 3, 5][tier]); spark(p, [3, 12, 30][tier]); if (tier) kick(tier * .7);
  if (tier === 1) pow(p, 1.4); if (tier === 2) { pow(p.add(_v2.set(0, .5, 0)), 2.3); r.spin = 1.4; r.v *= .45; G.slow = T + .22; sfx('crack'); say(`${r.name} SPUN OUT`, 1.4); } }
function wallHit(hit, side, nx, nz) { const tier = hit < 4 ? 0 : hit < 9 ? 1 : 2, p = _v.set(P.x + nx * side * 1.1, P.y + .8, P.z + nz * side * 1.1).clone(); if (tier) kick(tier * .6); if (tier === 2) { pow(p, 1.8); G.slow = T + .15; }
  treesNear(16, (k, d) => { TSH.set(k, Math.max(TSH.get(k) || 0, (.1 + tier * .06) * (1 - d / 20))); shed(k, 6 + tier * 9, _v2.set(0, 0, 0)); TCD[k] = T + 3; }); }
function world2(dt) {
  if (P.vf > 22 && G.phase !== 'poster') treesNear(9, k => { if (TCD[k] > T) return; TCD[k] = T + 5; shed(k, 2 + (P.vf / 12 | 0), _v4.set(P.vx * .3, 0, P.vz * .3)); TSH.set(k, Math.max(TSH.get(k) || 0, .035)); }); // the wake of a fast car
  TSH.forEach((a, k) => { const t = TREES[k]; a *= Math.exp(-dt * 2.4); if (a < .003) { TSH.delete(k); a = 0; } else TSH.set(k, a); const w = Math.sin(T * 13 + k) * a;
    TREEM.setMatrixAt(k, _m.compose(_v.set(t[0], t[1], t[2]), _q.setFromEuler(EU.set(w, t[4], w * .6)), _v2.set(t[3], t[3] * t[5], t[3]))); TREEM.instanceMatrix.needsUpdate = true; });
  for (const r of RIV) { r.sq = (r.sq || 0) * Math.exp(-dt * 7); r.wob = (r.wob || 0) * Math.exp(-dt * 3.5); r.spin = Math.max(0, (r.spin || 0) - dt); // squash, wobble, spin: cartoon physics on top of the real thing
    r.g.rotation.y += r.spin > 0 ? 6.283 * s01(1 - r.spin / 1.4) : 0; r.g.rotation.z += r.wob * Math.sin(T * 24); const q = r.sq * Math.abs(Math.cos(T * 30)); r.g.scale.set(1 + .12 * q, 1 - .2 * q, 1 + .05 * q); }
  for (const o of POW) { if (!o.s.visible) continue; o.t += dt; const t = o.t, k = t < .1 ? t / .1 * 1.3 : 1.3 - .3 * Math.min(1, (t - .1) / .12); o.s.scale.setScalar(o.size * k); o.s.material.opacity = 1 - s01((t - .45) / .25); if (t > .7) o.s.visible = false; } }
