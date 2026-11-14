
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

// ── Townsville: a skyline painted once, wrapped round the north side of the bay. Haze takes it, and at golden hour its windows come on
const SKYL = (() => { const W2 = 2048, H2 = 512, A = ctex(W2, H2), B = ctex(W2, H2, false), c = A.ctx, m = B.ctx, ink = '#1d1233', COLS = ['#ff9fd0', '#9fe0ff', '#b9f08a', '#d8b8ff', '#ffe08a', '#ffffff', '#ffb3a8'];
  c.clearRect(0, 0, W2, H2); m.fillStyle = '#000'; m.fillRect(0, 0, W2, H2); let x = 0, k = 0;
  const tower = (x, w, h, f, dome) => { const y = H2 - h; c.fillStyle = f; c.fillRect(x, y, w, h); c.fillStyle = 'rgba(80,40,140,.18)'; c.fillRect(x + w * .72, y, w * .28, h); // a lit face and a shadow face
    if (dome) { c.beginPath(); c.arc(x + w / 2, y, w * .42, Math.PI, 0); c.fill(); c.strokeStyle = ink; c.lineWidth = 7; c.stroke(); c.fillStyle = ink; c.fillRect(x + w / 2 - 3, y - w * .42 - 46, 6, 46); c.fillStyle = '#ff2d8a'; c.beginPath(); c.arc(x + w / 2, y - w * .42 - 50, 9, 0, 7); c.fill(); }
    else if (h > 230 && k % 3 === 0) { c.fillStyle = ink; c.fillRect(x + w * .3, y - 34, 5, 34); }
    const cw = w > 90 ? 18 : 14, gx = Math.floor((w - 16) / (cw + 10)), ox = x + (w - gx * (cw + 10) + 10) / 2; for (let yy = y + 22; yy < H2 - 26; yy += 30) for (let i = 0; i < gx; i++) { const wx = ox + i * (cw + 10); c.fillStyle = '#4f5fb8'; c.fillRect(wx, yy, cw, 16); if (Math.random() < .55) { m.fillStyle = `rgb(${190 + Math.random() * 65 | 0},0,0)`; m.fillRect(wx, yy, cw, 16); } }
    c.strokeStyle = ink; c.lineWidth = 7; c.strokeRect(x, y, w, h); };
  while (x < W2 - 40) { const w = 60 + Math.random() * 90, h = 110 + Math.random() * 230 + (k % 5 === 2 ? 90 : 0); tower(x, Math.min(w, W2 - x), h, COLS[k % COLS.length], k === 9 || k === 22); x += w - 4 + Math.random() * 12; k++; }
  A.tex.wrapS = B.tex.wrapS = THREE.RepeatWrapping; A.tex.needsUpdate = B.tex.needsUpdate = true;
  const R = 830, cx = 60, cz = 120, a0 = -1.75, a1 = 1.75, g = new THREE.CylinderGeometry(R, R, 210, 64, 1, true, Math.PI + a0, a1 - a0).translate(cx, 95, cz), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * 3);
  const o = wmesh(g, new THREE.ShaderMaterial({ uniforms: { ...UW, map: u(A.tex), lit: u(B.tex), uGlow: u(0) }, side: THREE.BackSide, ...STEN,
    vertexShader: `varying vec2 vUv;varying float vD;void main(){vUv=uv;vec4 mv=modelViewMatrix*vec4(position,1.);vD=length(mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform sampler2D map,lit;uniform vec3 uFogC,uSunC;uniform float uFog,uGlow;varying vec2 vUv;varying float vD;void main(){vec4 t=texture2D(map,vUv);if(t.a<.5)discard;
      vec3 c=t.rgb*mix(vec3(1.),uSunC,.35);c=mix(c,vec3(1.,.86,.45),texture2D(lit,vUv).r*uGlow);gl_FragColor=vec4(mix(uFogC,c,.8*exp(-vD*uFog*.35)+.15*uGlow),1.);}` }));
  o.frustumCulled = false; return o; })();

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
  const s = WX.w[0] + WX.w[1] + WX.w[2]; SKYL.material.uniforms.uGlow.value = WX.w[2] / s;
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
