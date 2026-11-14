
// ═══════════════════════════ VR FIRST: mirrors that are mirrors, and a cabin full of things your hands want to touch ═══════════════════════════
// ── every mirror renders the world from YOUR eye reflected in its glass, through exactly its own outline (an off-axis frustum). Lean, and the view changes, like the real thing
const MIRR = [], _eyeM = new V(), _eyeR = new V(), _mc = new V(), _mx = new V(), _my = new V(), _mn = new V(), _mm = new THREE.Matrix4(); let mirF = 0;
function mirrorOf(mesh, w, h, rw, rh, every, live = () => true) { const rt = new THREE.WebGLRenderTarget(rw, rh, { stencilBuffer: true }); rt.texture.repeat.x = -1; rt.texture.offset.x = 1;
  const m = mesh.material; m.map = rt.texture; m.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <encodings_fragment>', ''); }; m.needsUpdate = true; // the world writes display colours: pass them straight through
  const cam = new THREE.PerspectiveCamera(); cam.matrixAutoUpdate = cam.matrixWorldAutoUpdate = false; MIRR.push({ mesh, w, h, rt, cam, every, live, k: MIRR.length }); }
{ let rear; mirrorG.traverse(o => { if (o.material && o.material.map === MIRC.tex) rear = o; }); mirrorOf(rear, .208, .056, 416, 112, 2);
  SMIR.forEach(s => s.o.traverse(o => { if (o.material && o.material.map === s.c.tex) mirrorOf(o, .15, .094, 176, 110, 3, () => s.on); })); }
function mirrors() { mirF++; const eye = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera; _eyeM.setFromMatrixPosition(eye.matrixWorld);
  const rt0 = renderer.getRenderTarget(), xe = renderer.xr.enabled, st = renderer.state.buffers.stencil; let any = false;
  for (const m of MIRR) { if ((mirF + m.k) % m.every || !m.live()) continue; m.mesh.updateWorldMatrix(true, false); const M = m.mesh.matrixWorld;
    _mc.setFromMatrixPosition(M); _mx.setFromMatrixColumn(M, 0); _my.setFromMatrixColumn(M, 1); _mn.setFromMatrixColumn(M, 2).normalize(); const hw = m.w / 2 * _mx.length(), hh = m.h / 2 * _my.length(); _mx.normalize(); _my.normalize();
    const d = _v.subVectors(_eyeM, _mc).dot(_mn); if (d < .005) continue; _eyeR.copy(_eyeM).addScaledVector(_mn, -2 * d); // your eye, reflected through the glass
    _mm.makeBasis(_v2.copy(_mx).negate(), _my, _v3.copy(_mn).negate()).setPosition(_eyeR); m.cam.matrixWorld.copy(_mm); m.cam.matrixWorldInverse.copy(_mm).invert();
    _v.subVectors(_mc, _eyeR); const px = -_v.dot(_mx), py = _v.dot(_my); m.cam.projectionMatrix.makePerspective(px - hw, px + hw, py + hh, py - hh, d, 1600); m.cam.projectionMatrixInverse.copy(m.cam.projectionMatrix).invert();
    if (!any) { any = true; renderer.xr.enabled = false; st.setClear(1); } renderer.setRenderTarget(m.rt); renderer.clear(); renderer.render(world, m.cam); } // the world only draws where the stencil is 1, so the mirror clears it to 1
  if (any) { st.setClear(0); renderer.xr.enabled = xe; renderer.setRenderTarget(rt0); } }

// ── hands: pinch, and how fast the pinch is moving (for throws), in cockpit space
const HV = PH.map(() => ({ pin: false, prev: new V(), v: new V(), mid: new V(), hist: [], near: {} }));
const tapped = (s, key, p, r, h) => { const was = s.near[key]; let now = false; for (const t of h.tips) if (t.distanceTo(p) < r) now = true; s.near[key] = now; return now && !was; }; // a fingertip arriving, not resting

// ── the rearview mirror: pinch it and set it. The things hanging under it come along
const MADJ = { base: (() => { const n = _v.copy(mirrorG.position).negate().normalize().add(_v2.set(0, -.03, 1).normalize()).normalize(); return new THREE.Euler(-Math.asin(n.y), Math.atan2(n.x, n.z), 0, 'YXZ'); })(), /* aimed like a real one: from your eye, straight out the back */ yaw: 0, pit: 0, by: null, g0: new V(), y0: 0, p0: 0, step: 0, hang: PEND.filter(p => p.g.position.distanceTo(mirrorG.position) < .16).map(p => ({ p, l: p.g.position.clone().applyMatrix4(new THREE.Matrix4().copy(mirrorG.matrix).invert()) })) };
// ── the sun visor: tap it down and there is a polaroid, and the list. Names get crossed out as you beat them
const VIS = { g: grp(cab), a: -1.45, v: 0, down: false, beat: new Set() }; shieldPt(.33, SHH - .02, .045, VIS.g.position);
const LIST = ctex(256, 300); function paintList() { const c = LIST.ctx; c.fillStyle = '#fffbe8'; c.fillRect(0, 0, 256, 300); c.strokeStyle = 'rgba(80,120,220,.35)'; c.lineWidth = 2; for (let y = 66; y < 300; y += 34) { c.beginPath(); c.moveTo(0, y); c.lineTo(256, y); c.stroke(); }
  c.fillStyle = '#e8173f'; c.font = '700 44px Caveat,cursive'; c.textAlign = 'left'; c.fillText('THE LIST', 22, 46); c.font = '700 34px Caveat,cursive';
  RNAME.forEach((n, k) => { const y = 92 + k * 34; c.fillStyle = '#1d1233'; c.fillText(`${k + 1}. ${n}`, 26, y); if (VIS.beat.has(n)) { c.strokeStyle = '#e8173f'; c.lineWidth = 5; c.beginPath(); c.moveTo(20, y - 10); c.lineTo(36 + n.length * 17, y - 14); c.stroke(); } }); LIST.tex.needsUpdate = true; }
{ const g = VIS.g; g.quaternion.setFromAxisAngle(XA, 0); mesh(at(box(.3, .13, .014), 0, -.068, 0), cm('#ff9fd0', .85), g); mesh(at(cyl(.006, .006, .31, 8), 0, 0, 0, 0, 0, Math.PI / 2), M.alu, g);
  const photo = artTex(256, 300, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); const gr = c.createLinearGradient(0, 16, 0, 236); gr.addColorStop(0, '#7fd0ff'); gr.addColorStop(1, '#ffc0e0'); c.fillStyle = gr; c.fillRect(16, 16, 224, 220);
    c.fillStyle = '#fff'; [[70, 70, 26], [100, 60, 30], [130, 72, 22]].forEach(([x, y, r]) => { c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }); c.fillStyle = '#8ee85a'; c.fillRect(16, 180, 224, 56); // a summer day, a pink car, two people you can't quite see
    c.fillStyle = '#ff4fa3'; c.beginPath(); c.roundRect(62, 150, 132, 40, 12); c.fill(); c.beginPath(); c.roundRect(88, 124, 76, 34, 10); c.fill(); c.fillStyle = '#9fe0ff'; c.fillRect(98, 131, 24, 20); c.fillRect(130, 131, 24, 20); c.fillStyle = '#1d1233'; [86, 170].forEach(x => { c.beginPath(); c.arc(x, 192, 13, 0, 7); c.fill(); });
    c.fillStyle = '#1d1233'; c.font = '700 34px Caveat,cursive'; c.textAlign = 'center'; c.fillText('first sunday ♥', 128, 276); });
  const ph = mesh(new THREE.PlaneGeometry(.068, .08), cm('#ffffff', .6, 0, { map: photo }), g); ph.position.set(.07, -.07, .0075); ph.rotation.z = -.08; tape(g, .07, -.031, .008, .2);
  paintList(); const ls = mesh(new THREE.PlaneGeometry(.062, .073), cm('#ffffff', .7, 0, { map: LIST.tex }), g); ls.position.set(-.07, -.068, .0075); ls.rotation.z = .05; tape(g, -.07, -.033, .008, -.15); }
// ── a bobblehead on the dash: every corner, every bump, every boop
const BOB = { g: grp(cab, .6, -.204, -.8), bx: 0, bz: 0, vx: 0, vz: 0, cd: 0 };
{ const g = BOB.g; mesh(at(cyl(.017, .02, .01, 18), 0, .005, 0), M.black, g); mesh(at(sph(.015, 16, 12), 0, .024, 0), cm('#7fd0ff', .6), g); mesh(at(cyl(.0025, .0025, .02, 6), 0, .042, 0), M.alu, g);
  const hd = BOB.h = grp(g, 0, .05, 0), pk = cm('#ff8fc7', .55), bk = cm('#1d1233', .3), wt = cm('#ffffff', .3); mesh(sph(.03, 20, 16).scale(1.18, 1, 1).translate(0, .025, 0), pk, hd);
  for (const s of [-1, 1]) { mesh(sph(.0105, 14, 10).scale(.85, 1.1, .45).translate(s * .0125, .028, .025), bk, hd); mesh(sph(.0032, 8, 6).translate(s * .0125 + .003, .033, .0295), wt, hd); mesh(sph(.009, 10, 8).translate(s * .011, .057, -.004), cm('#ff2d6f', .4), hd); } } // an original: a pink bean with big Y2K eyes and a bow
// ── a rubber duck. Pinch it, throw it: at the dash, onto your real floor, or out of an open window onto the road. Cars that hit it send it flying
const DUCK = { g: grp(cab, .92, -.205, -.74), home: new V(.92, -.205, -.74), v: new V(), w: new V(), st: 'dash', by: null, mats: [], ph: '', cd: 0 };
const QUACK = comicTex('QUACK!', '#ffe14d'), HONK = comicTex('HONK!', '#ff5fb0');
{ const g = DUCK.g, y = cm('#ffd23f', .55), o = cm('#ff8a3c', .5), k = cm('#1d1233', .3); mesh(sph(.028, 18, 12).scale(1.2, .85, 1.05).translate(0, .024, 0), y, g); mesh(sph(.018, 16, 12).translate(0, .052, .012), y, g);
  mesh(new THREE.ConeGeometry(.008, .016, 10).rotateX(Math.PI / 2).scale(1.3, .6, 1).translate(0, .049, .034), o, g); mesh(new THREE.ConeGeometry(.012, .02, 8).rotateX(-2.2).translate(0, .036, -.03), y, g); for (const s of [-1, 1]) mesh(sph(.0035, 8, 6).translate(s * .009, .058, .026), k, g);
  const ink = INK.clone(); ink.onBeforeCompile = INK.onBeforeCompile; g.traverse(o => { if (o.material === INK) o.material = ink; if (o.material && !DUCK.mats.includes(o.material)) DUCK.mats.push(o.material); }); } // its own ink, so it can be stencilled once it is out in the world
const duckSten = on => DUCK.mats.forEach(m => { m.stencilWrite = on; m.stencilFunc = THREE.EqualStencilFunc; m.stencilRef = 1; }) || DUCK.g.traverse(o => { o.renderOrder = on ? RO.world + 1 : 0; });
function duckHome() { cab.add(DUCK.g); DUCK.g.position.copy(DUCK.home); DUCK.g.rotation.set(0, 0, 0); DUCK.v.set(0, 0, 0); DUCK.w.set(0, 0, 0); DUCK.st = 'dash'; DUCK.by = null; duckSten(false); }
// ── the indicator stalk: flick it up for right, down for left. It ticks, it blinks, and it cancels itself when the wheel comes back
const STK = { g: grp(wheelG, -.055, -.015, -.1), on: 0, a: 0, t0: 0, peak: 0, tk: 0 }; mesh(at(cyl(.0045, .0045, .085, 8), -.0425, 0, 0, 0, 0, Math.PI / 2), M.black, STK.g); mesh(at(cyl(.0075, .0065, .024, 12), -.092, 0, 0, 0, 0, Math.PI / 2), M.alu, STK.g);
const HUB = []; wheelS.children.forEach(o => { const pr = o.geometry && o.geometry.parameters; if (pr && (pr.radiusTop === .058 || (o.geometry.type === 'CircleGeometry' && pr.radius === .052))) HUB.push([o, o.position.z]); }); let hubP = 0, honkT = 0;

function vr(dt) {
  PH.forEach((h, i) => { const s = HV[i]; if (!h.ok) { s.pin = false; return; } const d = h.tips[0].distanceTo(h.tips[1]); s.pin = s.pin ? d < .045 : d < .026; s.mid.addVectors(h.tips[0], h.tips[1]).multiplyScalar(.5); s.v.subVectors(s.mid, s.prev).divideScalar(Math.max(dt, .008)); s.prev.copy(s.mid); s.hist.push(s.v.clone()); if (s.hist.length > 5) s.hist.shift(); });
  // the horn: the middle of the wheel presses in, and the road ahead hears it
  hubP += ((IN.honk ? .009 : 0) - hubP) * damp(dt, .03); HUB.forEach(([o, z]) => { o.position.z = z - hubP; });
  if (IN.honk && T > honkT && ['race', 'finish', 'count', 'ready'].includes(G.phase)) { honkT = T + 1.2; pow(_v.set(P.x + Math.sin(P.psi) * 9, P.y + 2.4, P.z - Math.cos(P.psi) * 9), 1.7, HONK); }
  // the rearview mirror
  PH.forEach((h, i) => { const s = HV[i]; if (!MADJ.by && s.pin && !h.on && DUCK.by !== s && s.mid.distanceTo(mirrorG.position) < .13) { MADJ.by = s; MADJ.g0.copy(s.mid); MADJ.y0 = MADJ.yaw; MADJ.p0 = MADJ.pit; sfx('grab'); } });
  if (MADJ.by) { if (!MADJ.by.pin) MADJ.by = null; else { _v.subVectors(MADJ.by.mid, MADJ.g0); MADJ.yaw = clamp(MADJ.y0 - _v.x * 4, -.4, .4); MADJ.pit = clamp(MADJ.p0 - _v.y * 4, -.3, .3); const stp = Math.round((MADJ.yaw + MADJ.pit) * 25); if (stp !== MADJ.step) { MADJ.step = stp; sfx('detent', .25); } } }
  mirrorG.rotation.set(MADJ.base.x + MADJ.pit, MADJ.base.y + MADJ.yaw, 0, 'YXZ'); mirrorG.updateMatrix(); MADJ.hang.forEach(({ p, l }) => p.g.position.copy(l).applyMatrix4(mirrorG.matrix));
  // the visor
  const edge = VIS.g.localToWorld(_v4.set(0, -.12, .01)); rig.worldToLocal(edge); PH.forEach((h, i) => { if (h.ok && !h.on && tapped(HV[i], 'vis', edge, .055, h)) { VIS.down = !VIS.down; sfx('detent'); sfx('whoosh', .25); } });
  VIS.v += ((VIS.down ? 0 : -1.45) - VIS.a) * 160 * dt - VIS.v * 11 * dt; VIS.a += VIS.v * dt; VIS.g.rotation.x = VIS.a;
  if (G.phase === 'finish' && G.place) { let ch = false; for (const r of RIV) if ((!r.done || r.done > G.place) && !VIS.beat.has(r.name)) { VIS.beat.add(r.name); ch = true; } if (ch) paintList(); }
  // the bobblehead
  const bh = BOB.g.localToWorld(_v4.set(0, .075, 0)); rig.worldToLocal(bh); PH.forEach((h, i) => { if (h.ok && tapped(HV[i], 'bob', bh, .045, h)) { const v = HV[i].v; BOB.vz -= clamp(v.x, -2, 2) * 22 + rand(-3, 3); BOB.vx += clamp(v.z, -2, 2) * 22 + rand(-3, 3); if (T > BOB.cd) { BOB.cd = T + .3; sfx('squeak', .6); } } });
  const jb = P.vf * .02 + P.shake * 3; BOB.vz += (-90 * BOB.bz - 2.6 * BOB.vz + P.ay * .9 + rand(-1, 1) * jb) * dt; BOB.vx += (-90 * BOB.bx - 2.6 * BOB.vx - P.ax * .9 + rand(-1, 1) * jb) * dt;
  BOB.bz = clamp(BOB.bz + BOB.vz * dt, -.8, .8); BOB.bx = clamp(BOB.bx + BOB.vx * dt, -.8, .8); BOB.h.rotation.set(BOB.bx, 0, BOB.bz);
  // the indicator
  const tip = STK.g.localToWorld(_v4.set(-.095, 0, 0)); rig.worldToLocal(tip); PH.forEach((h, i) => { if (h.ok && tapped(HV[i], 'stk', tip, .04, h)) { const up = HV[i].v.y > 0 ? 1 : -1; STK.on = STK.on === up ? 0 : up; STK.t0 = T; STK.peak = 0; sfx('detent'); } });
  if (STK.on) { const st = IN.steer || 0; STK.peak = Math.max(STK.peak, -st * STK.on); if ((STK.peak > .5 && -st * STK.on < .12) || T - STK.t0 > 15) { STK.on = 0; sfx('detent', .5); } } // turn and straighten: it clicks off by itself
  STK.a += (STK.on * .2 - STK.a) * damp(dt, .04); STK.g.rotation.z = STK.a;
  if (STK.on) { const b = (T - STK.t0) * 1.7 % 1 < .5; if (b !== STK.tk) { STK.tk = b; sfx('tick', b ? .5 : .35); } TELL[STK.on > 0 ? 1 : 0].material.color.set('#7dff9a').multiplyScalar(b ? 1 : .12); }
  windows(dt); deck(dt); skylife(dt);
  // the duck
  if (G.phase !== DUCK.ph) { if (['boot', 'place', 'crank', 'poster'].includes(G.phase)) duckHome(); DUCK.ph = G.phase; }
  PH.forEach((h, i) => { const s = HV[i]; if (s.pin && !DUCK.by && MADJ.by !== s && DUCK.st !== 'world' && DUCK.g.parent && s.mid.distanceTo(DUCK.g.position) < .08) { rig.attach(DUCK.g); DUCK.by = s; DUCK.st = 'held'; sfx('squeak'); } });
  if (DUCK.by) { const s = DUCK.by; if (s.pin) { DUCK.g.position.lerp(_v.copy(s.mid).add(_v2.set(0, -.03, 0)), damp(dt, .02)); } else { DUCK.v.set(0, 0, 0); s.hist.forEach(q => DUCK.v.addScaledVector(q, 1 / s.hist.length)); DUCK.v.multiplyScalar(1.2); DUCK.w.set(rand(-9, 9), rand(-9, 9), rand(-9, 9)); DUCK.by = null; DUCK.st = 'fly'; } }
  else if (DUCK.st === 'fly' || DUCK.st === 'rest') duckCab(dt); else if (DUCK.st === 'world') duckWorld(dt);
  if (DUCK.st === 'fly' || DUCK.st === 'world') { DUCK.g.rotateX(DUCK.w.x * dt); DUCK.g.rotateY(DUCK.w.y * dt); DUCK.g.rotateZ(DUCK.w.z * dt); }
}
const SH0 = new V(SHD.x, SHD.y, SHD.z), dashY = z => -.196 - Math.max(0, -.63 - z) * .1;
function duckCab(dt) { const p = DUCK.g.position, v = DUCK.v, fl = -rig.position.y + .02; if (DUCK.st === 'rest') return; v.y -= 9.8 * dt; const py = p.y; p.addScaledVector(v, dt);
  const bump = (n, k = .45) => { const vn = v.dot(n); if (vn < 0) { v.addScaledVector(n, -(1 + k) * vn); v.multiplyScalar(.85); DUCK.w.multiplyScalar(.6); if (-vn > 1.2 && T > DUCK.cd) { DUCK.cd = T + .15; sfx('squeak', clamp(-vn * .15, .2, .7)); } } };
  const ds = _v.subVectors(p, SH0).dot(SN); if (ds < .03 && p.x > SHD.x && p.x < SHD.x + SHD.w && p.y > SHD.y - .02) { p.addScaledVector(SN, .03 - ds); bump(SN); } // the windscreen
  if (p.y > .33) { p.y = .33; bump(_v.set(0, -1, 0)); }
  if (p.z < -.57 && p.z > -1 && p.x > -.345 && p.x < 1.065) { const dy = dashY(p.z); if (p.y < dy && py >= dy - .01) { p.y = dy; bump(_v.set(0, 1, 0), .35); if (Math.abs(v.y) < .25 && v.length() < .4) { DUCK.st = 'rest'; DUCK.g.rotation.set(0, DUCK.g.rotation.y, 0); return; } } else if (p.y < dy && p.y > -.42 && p.z > -.62) { p.z = -.56; bump(_v.set(0, 0, 1)); } }
  for (const [x, n] of [[-.4, 1], [mir(-.4), -1]]) if ((p.x - x) * n < 0 && p.z < .3 && p.z > -.95) { if (p.y > -.24 && WIN[n > 0 ? 0 : 1].u.value > .5) { duckOut(); return; } p.x = x; bump(_v.set(n, 0, 0)); } // the doors, or the open window
  if (p.y < fl) { p.y = fl; bump(_v.set(0, 1, 0), .35); if (Math.abs(v.y) < .3) { v.set(0, 0, 0); DUCK.st = 'rest'; DUCK.g.rotation.set(0, DUCK.g.rotation.y, 0); } } } // your real floor
function duckOut() { world.attach(DUCK.g); rig.getWorldQuaternion(_q); world.getWorldQuaternion(_q2); DUCK.v.applyQuaternion(_q).applyQuaternion(_q2.invert()).add(_v.set(P.vx, 0, P.vz)); DUCK.st = 'world'; duckSten(true); sfx('whoosh', .4); }
function duckWorld(dt) { const p = DUCK.g.position, v = DUCK.v; v.y -= 9.8 * dt; p.addScaledVector(v, dt); const n = nearest(p.x, p.z), gy = (n.d < W + 3.5 ? SY[n.i] : hill2(p.x, p.z)) + .02;
  if (p.y < gy) { p.y = gy; if (v.y < -1.5 && T > DUCK.cd) { DUCK.cd = T + .2; sfx('squeak', .4); } v.y = Math.abs(v.y) * .35; v.x *= .7; v.z *= .7; DUCK.w.multiplyScalar(.5); if (v.y < .5) v.y = 0; }
  for (const c of [P, ...RIV]) { const o = c === P ? P : c.o, sp = c === P ? P.vf : c.v; if (sp > 3 && Math.hypot(o.x - p.x, o.z - p.z) < 1.5 && p.y - (o.y || gy) < 1.4 && T > DUCK.cd) { const ps = c === P ? P.psi : o.psi; DUCK.cd = T + .5; v.set(Math.sin(ps) * sp * 1.15 + rand(-2, 2), 4 + sp * .2, -Math.cos(ps) * sp * 1.15 + rand(-2, 2)); DUCK.w.set(rand(-20, 20), rand(-20, 20), rand(-20, 20)); sfx('squeak'); pow(_v.copy(p).add(_v2.set(0, 1.2, 0)), 1.3, QUACK); chips(p, '#ffd23f', 10, 2); } } // QUACK
  if (p.y < -60) duckHome(); }

// ── power windows, two buttons on your door: tap and the glass runs all the way, hold and it creeps. Glass up is your own room; glass down is the other world
const WIN = [0, 1].map(k => ({ k, r: 1, u: u(0), dir: 0, mode: null, pt: 0, moving: false, p: new V(-.312, -.2, k ? -.2 : -.28) }));
glass.children.forEach(o => { const m = o.material; if (!m || !m.fragmentShader || (m.fragmentShader !== sideFS[0] && m.fragmentShader !== sideFS[1])) return; const k = o.geometry.attributes.position.getX(0) < CX ? 0 : 1; m.uniforms = { ...UG, uRoll: WIN[k].u }; });
{ const pl = grp(cab, -.312, -.212, -.24); mesh(at(box(.05, .012, .16), 0, 0, 0), M.black, pl); WIN.forEach(w => { const b = grp(cab, w.p.x, w.p.y, w.p.z); w.b = b; mesh(at(box(.03, .008, .045), 0, 0, 0), cm('#ff4fa3', .4), b);
  const t = artTex(64, 96, c => { c.fillStyle = '#fff'; c.font = '800 34px Unbounded,sans-serif'; c.textAlign = 'center'; c.fillText(w.k ? 'R' : 'L', 32, 40); c.beginPath(); c.moveTo(32, 50); c.lineTo(48, 70); c.lineTo(16, 70); c.fill(); c.beginPath(); c.moveTo(32, 92); c.lineTo(48, 74); c.lineTo(16, 74); c.fill(); });
  mesh(new THREE.PlaneGeometry(.022, .034).rotateX(-Math.PI / 2).translate(0, .0042, 0), lit({ map: t, transparent: true }), b); }); }
function windows(dt) { PH.forEach((h, i) => { if (!h.ok) return; WIN.forEach(w => { const key = 'w' + w.k; if (tapped(HV[i], key, w.p, .028, h)) { w.pt = T; w.dir = w.moving ? -w.dir : w.r > .5 ? -1 : 1; w.mode = 'press'; w.moving = true; w.hand = i; sfx('click'); sfx('whirr', .6); } }); });
  WIN.forEach(w => { const held = w.mode && HV[w.hand] && HV[w.hand].near['w' + w.k]; if (w.mode === 'press' && !held) w.mode = T - w.pt < .3 ? 'auto' : null; if (w.mode === 'press' && T - w.pt > .3) w.mode = 'hold'; if (w.mode === 'hold' && !held) { w.mode = null; w.moving = false; }
    if (w.moving) { w.r += w.dir * (w.mode === 'hold' ? .3 : 1.3) * dt; if (w.r <= 0 || w.r >= 1) { w.r = clamp(w.r, 0, 1); w.moving = false; w.mode = null; sfx('detent', .6); } }
    w.b.position.y = w.p.y - (w.mode ? .003 : 0); w.u.value = UG.uRoll.value * w.r; }); }

// ── the CD deck: a real volume dial (pinch it and twist), and three buttons: previous, mute, next
RADIO.vol = 1; const VOLK = PL.children.find(o => o.geometry && o.geometry.parameters && o.geometry.parameters.radiusTop === .009); VOLK.geometry.translate(-.078, -.007, -.005); VOLK.position.set(.078, .007, .005); mesh(at(box(.0016, .005, .001), 0, .005, .0045), lit({ color: '#ffffff' }), VOLK);
mesh(new THREE.PlaneGeometry(.046, .0075).translate(.065, -.0205, .0042), lit({ map: artTex(256, 42, c => { c.fillStyle = '#ff9fd0'; c.font = '700 28px "Chakra Petch",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('◀◀', 40, 22); c.fillText('♪/✕', 128, 22); c.fillText('▶▶', 216, 22); }), transparent: true }), PL);
const VD = { by: null, a0: 0, v0: 1, cd: 0 }, knobAng = h => { const n = toCab(PL, _v.set(0, 0, 1)).sub(toCab(PL, _v2.set(0, 0, 0))).normalize(), v = _v3.copy(h.tw || _v4.set(1, 0, 0)); v.addScaledVector(n, -v.dot(n)); const x = _v4.set(1, 0, 0).addScaledVector(n, -n.x).normalize(); return Math.atan2(_v2.crossVectors(x, v).dot(n), v.dot(x)); };
function deck(dt) { if (!RADIO.on) return; const kp = toCab(PL, _v.set(.078, .007, .008)).clone();
  PH.forEach((h, i) => { const s = HV[i]; if (!VD.by && s.pin && !h.on && s.mid.distanceTo(kp) < .035) { VD.by = h; VD.s = s; VD.a0 = knobAng(h); VD.v0 = RADIO.vol; sfx('grab'); }
    for (let b = 0; b < 3; b++) { const bp = toCab(PL, _v2.set(.052 + b * .013, -.011, .007)).clone(); if (h.ok && !h.on && tapped(HV[i], 'cd' + b, bp, .011, h) && T > VD.cd) { VD.cd = T + .35; sfx('click');
      if (b === 1) { RADIO.mute = !RADIO.mute; ledMsg = RADIO.mute ? 'MUTE' : 'VOL ' + Math.round(RADIO.vol * 10); } else { RADIO.st = (RADIO.st + (b ? 1 : STATIONS.length - 1)) % STATIONS.length; RADIO.next = 0; ledMsg = STATIONS[RADIO.st].name.toUpperCase(); say('♪ ' + STATIONS[RADIO.st].name, 1.4); } ledT = T + 2; } } });
  if (VD.by) { if (!VD.s.pin) VD.by = null; else { const d = wrapPi(knobAng(VD.by) - VD.a0), v = clamp(VD.v0 + d * .6, 0, 1.6), st = Math.round(v * 10); if (st !== Math.round(RADIO.vol * 10)) sfx('tick', .3); RADIO.vol = v; RADIO.mute = false; ledMsg = 'VOL ' + '▮'.repeat(st) ; ledT = T + 1.5; } }
  VOLK.rotation.z += (-(RADIO.vol - .8) * 2.4 - VOLK.rotation.z) * damp(dt, .05); }

// ── the sky is alive: hot-air balloons over the hills, a blimp with a banner circling the circuit, and flocks of birds that scatter when you blast past or honk
const SKYLIFE = (() => { const outl = (geo, g, s = 1.04) => { const o = new THREE.Mesh(geo, OUTM); o.scale.setScalar(s); o.renderOrder = RO.world; g.add(o); };
  const balloon = (cols) => { const b = new MB(); for (let i = 0; i < 10; i++) b.add(new THREE.SphereGeometry(6, 4, 14, i / 10 * 6.283, .6283).scale(1, 1.2, 1), M4(0, 12, 0), col(cols[i % cols.length])); b.add(new THREE.ConeGeometry(4.2, 5, 10, 1, true).rotateX(Math.PI), M4(0, 4.4, 0), col(cols[0]));
    b.add(new THREE.BoxGeometry(1.6, 1.2, 1.6), M4(0, .6, 0), col('#9c6b47')); for (const [x, z] of [[-.7, -.7], [.7, -.7], [-.7, .7], [.7, .7]]) b.add(new THREE.BoxGeometry(.08, 3, .08), M4(x * 1.4, 2.5, z * 1.4), col('#3a2a5c')); const geo = b.geo(), g = new THREE.Group(); wmesh(geo, WM2, g); outl(geo, g); world.add(g); return g; };
  const BAL = [[['#ff4fa3', '#ffffff'], -220, 60, -140], [['#5fd0ff', '#ffe14d'], 380, 75, 40], [['#86e05a', '#ff8fc7', '#ffffff'], -60, 95, -260]].map(([c, x, y, z], k) => ({ g: balloon(c), x, y, z, k }));
  const BN = ctex(1024, 128); { const c = BN.ctx; c.fillStyle = '#fff'; c.fillRect(0, 0, 1024, 128); c.strokeStyle = '#1d1233'; c.lineWidth = 12; c.strokeRect(6, 6, 1012, 116); c.font = 'italic 800 64px Unbounded,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round'; c.lineWidth = 10; c.strokeText('NXT/WEBXR ♥ SUNDAY DRIVER', 512, 68, 960); c.fillStyle = '#ff2d8a'; c.fillText('NXT/WEBXR ♥ SUNDAY DRIVER', 512, 68, 960); BN.tex.needsUpdate = true; }
  const blimp = new THREE.Group(); { const b = new MB(); b.add(new THREE.SphereGeometry(1, 28, 16).scale(14, 4, 4), M4(0, 0, 0), col('#e9e4f6')); for (const r of [0, 1.5708, 3.1416, 4.712]) b.add(new THREE.BoxGeometry(.3, 3.6, 4).translate(0, 2.4, 0), new THREE.Matrix4().makeTranslation(-12, 0, 0).multiply(new THREE.Matrix4().makeRotationX(r)), col('#ff4fa3'));
    b.add(new THREE.BoxGeometry(3.4, 1.2, 1.4), M4(1, -4.2, 0), col('#5fd0ff')); const geo = b.geo(); wmesh(geo, WM2, blimp); outl(geo, blimp, 1.025);
    for (const s of [-1, 1]) { const m = new THREE.Mesh(new THREE.PlaneGeometry(18, 2.25), new THREE.MeshBasicMaterial({ map: BN.tex, toneMapped: false, ...STEN })); m.position.set(0, -.6, s * 4.05); if (s < 0) m.rotation.y = Math.PI; m.renderOrder = RO.world + 1; blimp.add(m); } world.add(blimp); }
  const BIRDN = 30, bp = new Float32Array(BIRDN * 12), birds = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: '#1d1233', ...STEN })); birds.geometry.setAttribute('position', new THREE.BufferAttribute(bp, 3)); birds.frustumCulled = false; birds.renderOrder = RO.world; world.add(birds);
  const FLOCK = [atTP(1), atTP(9), atTP(15)].map((i, f) => ({ c: new V(SX[i] - TZ[i] * 22, SY[i] + 9, SZ[i] + TX[i] * 22), scat: 0, dir: new V(), b: [...Array(10)].map((_, j) => ({ a: j / 10 * 6.283, r: 4 + rnd() * 5, h: rnd() * 3, ph: rnd() * 7, sp: .5 + rnd() * .4 })) }));
  return { BAL, blimp, birds, bp, FLOCK }; })();
function skylife(dt) { const S = SKYLIFE;
  S.BAL.forEach(b => { b.g.position.set(b.x + Math.sin(T * .03 + b.k) * 30, b.y + Math.sin(T * .4 + b.k * 2) * 2.5, b.z + Math.cos(T * .025 + b.k) * 25); b.g.rotation.y = T * .05 + b.k; });
  const ba = T * .022; S.blimp.position.set(60 + Math.cos(ba) * 280, 85 + Math.sin(T * .3) * 2, 120 + Math.sin(ba) * 240); S.blimp.rotation.set(0, -ba - Math.PI / 2, Math.sin(T * .5) * .03); // nose along its circle
  let n = 0; for (const f of S.FLOCK) { const d = Math.hypot(f.c.x - P.x, f.c.z - P.z); if (f.scat <= 0 && (d < 28 && P.vf > 8 || d < 60 && IN.honk)) { f.scat = 9; f.dir.set(f.c.x - P.x, 0, f.c.z - P.z).normalize(); sfx('whoosh', .3); } if (f.scat > 0) f.scat -= dt; const k = f.scat > 0 ? s01((9 - f.scat) / 1.5) * (f.scat > 2 ? 1 : f.scat / 2) : 0;
    for (const b of f.b) { b.a += dt * b.sp * (1 + k * 2); const fl = Math.sin(T * (11 + k * 8) + b.ph) * .35, x = f.c.x + Math.cos(b.a) * b.r + f.dir.x * k * 60, y = f.c.y + b.h + Math.sin(b.a * 2) + k * 30, z = f.c.z + Math.sin(b.a) * b.r + f.dir.z * k * 60, tx = -Math.sin(b.a) * .5, tz = Math.cos(b.a) * .5;
      const j = n++ * 12; S.bp.set([x - tz * 1.4, y + fl, z + tx * 1.4, x, y, z, x, y, z, x + tz * 1.4, y + fl, z - tx * 1.4], j); } } S.birds.geometry.attributes.position.needsUpdate = true; }
