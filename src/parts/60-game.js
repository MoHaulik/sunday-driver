
// ═══════════════════════════ YOUR HANDS: 25 tracked joints each. They drive the wheel, pull the handbrake, press the button, and are cut out of the cockpit so you see your real ones ═══════════════════════════
const JN = ['wrist', 'thumb-metacarpal', 'thumb-phalanx-proximal', 'thumb-phalanx-distal', 'thumb-tip', ...['index', 'middle', 'ring', 'pinky'].flatMap(f => ['metacarpal', 'phalanx-proximal', 'phalanx-intermediate', 'phalanx-distal', 'tip'].map(s => `${f}-finger-${s}`))];
const SCRP = new V(.385, -.272, -.55), HANDSRC = {}, OCC = new THREE.MeshBasicMaterial({ colorWrite: false }), DBG = {}; // OCC: depth only. Drawn first, it stops the cockpit and the world being drawn over your hands
const handInst = hd => { const root = skClone(HANDSRC[hd]), sk = root.getObjectByProperty('type', 'SkinnedMesh'); sk.material = OCC; sk.frustumCulled = false; sk.renderOrder = RO.hand; scene.add(root); return { root, bones: JN.map(n => root.getObjectByName(n)) }; };
const PH = [0, 1].map(i => { const h = { i, xh: renderer.xr.getHand(i), ctrl: renderer.xr.getController(i), grip: renderer.xr.getControllerGrip(i), src: null, hd: i ? 'left' : 'right', ok: false, p: new V(), tips: [new V(), new V(), new V()], on: false, g: 0, phi: 0, hb: false, sel: false, occ: {} };
  scene.add(h.xh, h.ctrl, h.grip); h.ctrl.addEventListener('connected', e => { h.src = e.data; if (e.data && (e.data.handedness === 'left' || e.data.handedness === 'right')) h.hd = e.data.handedness; });
  h.ctrl.addEventListener('disconnected', () => { h.src = null; }); h.ctrl.addEventListener('selectstart', () => { h.sel = true; }); return h; });
const IN = { steer: 0, thr: 0, brake: 0, hb: 0, auto: true, press: false, hands: 0, everHeld: false }, KEY = {};
function updHands(dt) {
  const xr = renderer.xr.isPresenting, WC = CFG.WHEEL; let sum = 0, n = 0, press = false, tune = false, hbHand = null; IN.honk = false;
  for (const h of PH) { let ok = false; const J = h.xh.joints, w = J && J.wrist;
    for (const k in h.occ) h.occ[k].root.visible = false;
    if (DBG.hand) { const d = DBG.hand(h.i); if (d) { ok = true; h.p.copy(d.p); h.tips.forEach(t => t.copy(d.tip || d.p)); } }
    else if (xr && h.src && h.src.hand && w && w.visible && J['middle-finger-phalanx-proximal']) { ok = true; rig.worldToLocal(h.p.copy(w.position).add(J['middle-finger-phalanx-proximal'].position).multiplyScalar(.5));
      ['thumb-tip', 'index-finger-tip', 'middle-finger-tip'].forEach((nm, k) => rig.worldToLocal(h.tips[k].copy(J[nm].position)));
      if (HANDSRC[h.hd]) { const oc = h.occ[h.hd] || (h.occ[h.hd] = handInst(h.hd)); oc.root.visible = true; for (let k = 0; k < 25; k++) { const j = J[JN[k]]; if (j) { oc.bones[k].position.copy(j.position); oc.bones[k].quaternion.copy(j.quaternion); } } } }
    else if (xr && h.src && h.grip.visible) { ok = true; rig.worldToLocal(h.p.copy(h.grip.position)); h.tips.forEach(t => rig.worldToLocal(t.copy(h.ctrl.position))); if (h.sel) press = true; } // controllers work too: hold them like the rim, trigger = the button
    h.sel = false; h.ok = ok; if (!ok) { h.on = h.hb = false; continue; }
    // the wheel: where is this hand round the rim, and how far from it
    const rel = _v.subVectors(h.p, WH.c), ax = rel.dot(WH.a), ru = rel.dot(WH.u), rv = rel.dot(WH.v), rr = Math.hypot(ru, rv), near = Math.abs(ax) < .15 && rr < WC.R + .14 && rr > .05; h.phi = Math.atan2(rv, ru); // generous: a hand anywhere on or near the wheel is holding it
    if (!h.on && !h.hb && near) { h.on = true; h.g = h.phi - WH.rot; if (T > (h.gT || 0)) sfx('grab'); IN.everHeld = true; } if (h.on) h.gT = T + 1.5; else if (h.on && (Math.abs(ax) > .24 || rr > WC.R + .24)) h.on = false;
    if (h.on) { sum += WH.rot + wrapPi(h.phi - h.g - WH.rot); n++; }
    // the handbrake: take the lever and lift
    const dh = h.p.distanceTo(HB.p); if (!h.on && !h.hb && dh < CFG.HB.grab && HB.hold < 0) { h.hb = true; HB.hold = h.i; sfx('grab'); } else if (h.hb && dh > CFG.HB.drop) { h.hb = false; HB.hold = -1; }
    if (h.hb) hbHand = h;
    for (const t of h.tips) { if (t.distanceTo(startG.position) < .04) { press = true; h.on = false; } /* START always answers, even from a hand that was on the wheel */ if (!h.on && t.distanceTo(SCRP) < .07) tune = true; const r = _v2.subVectors(t, WH.c), a = r.dot(WH.a); if (Math.abs(a) < .06 && Math.sqrt(Math.max(0, r.lengthSq() - a * a)) < .062) IN.honk = true; }
    { const r = _v2.subVectors(h.p, WH.c), a = r.dot(WH.a); if (!h.on && Math.abs(a) < .08 && Math.sqrt(Math.max(0, r.lengthSq() - a * a)) < .07) IN.honk = true; } } // or slam the middle with your palm
  if (HB.hold >= 0 && !PH[HB.hold].hb) HB.hold = -1;
  if (SIM && !DBG.hand) { // keys: arrows or WASD to steer, space = handbrake, enter = the start button, H = horn
    const l = KEY.arrowleft || KEY.a, r = KEY.arrowright || KEY.d, t = (r ? -1 : 0) + (l ? 1 : 0); WH.rot += (t * WC.full - WH.rot) * damp(dt, t ? .22 : .12); n = KEY.arrowdown || KEY.s ? 0 : 1; sum = WH.rot; HB.pull += ((KEY[' '] ? 1 : 0) - HB.pull) * damp(dt, .06); press = !!KEY.enter; IN.honk = !!KEY.h; tune = !!KEY.r; KEY.enter = false; if (l || r) IN.everHeld = true; }
  else { if (n) { const tgt = sum / n; WH.rot += (clamp(tgt, -WC.lock, WC.lock) - WH.rot) * damp(dt, .035); if (Math.abs(tgt) > WC.lock) for (const h of PH) if (h.on) h.g = h.phi - WH.rot; } else WH.rot += -WH.rot * damp(dt, .16); // let go and it centres itself
    let pull = 0; if (hbHand) { const r = _v.subVectors(hbHand.p, hbG.position); pull = clamp((Math.atan2(r.y, -r.z) - .12) / .55, 0, 1); } const p0 = HB.pull; HB.pull += (pull - HB.pull) * damp(dt, hbHand ? .03 : .08); if ((p0 * 5 | 0) !== (HB.pull * 5 | 0) && hbHand) sfx('ratchet'); }
  wheelS.rotation.z = WH.rot; hbG.rotation.x = .12 + HB.pull * .62; HB.p.set(0, 0, -.185).applyAxisAngle(XA, hbG.rotation.x).add(hbG.position);
  IN.hands = n; IN.pressT = press ? (IN.pressT || 0) + dt : 0; const pr = SIM ? press : IN.pressT > .08; IN.press = pr && !IN.pressHeld; IN.pressHeld = pr;
  if (!IN.auto) { IN.steer = clamp(-WH.rot / WC.full, -1, 1); IN.thr = n ? 1 : 0; IN.brake = n ? 0 : .38; IN.hb = HB.pull > .3 ? HB.pull : 0; }
  if (tune && T > RADIO.cool && RADIO.on) { RADIO.cool = T + .9; RADIO.st = (RADIO.st + 1) % STATIONS.length; sfx('click'); say('♪ ' + STATIONS[RADIO.st].name, 1.6); } // touch the middle screen: next station
  if (IN.honk && T > WH.horn) { WH.horn = T + (has('horn') ? 1 : .7); sfxAt(has('horn') ? 'jingle' : 'horn', rig.localToWorld(_v4.set(CFG.CX, -.45, -1.7))); for (const r of RIV) { const d = r.prog - P.prog; if (d > 0 && d < 34) r.honk = 2.2; } }
}

// ═══════════════════════════ THE CAR: a point with a heading and a velocity. Grip pulls the velocity round to the heading; the handbrake lets go of it ═══════════════════════════
const P = { name: 'YOU', hex: '#ff2d8a', x: 0, y: 0, z: 0, psi: 0, vx: 0, vz: 0, vf: 0, v: 0, yaw: 0, i: 0, s: 0, lat: 0, prog: 0, slip: 0, off: false, boost: 0, charge: 0, gear: 1, rpm: 0, ax: 0, ay: 0, shake: 0, draft: 0, stuck: 0, clean: 0, lapT: 0, best: 0, done: 0, hitT: 0, o: {} };
function locate(o, wide) { let bi = o.i, bd = 1e12; const R = wide ? N >> 1 : 14; for (let k = -R; k <= R; k++) { const j = ix(o.i + k), dx = o.x - SX[j], dz = o.z - SZ[j], d = dx * dx + dz * dz; if (d < bd) { bd = d; bi = j; } }
  const dx = o.x - SX[bi], dz = o.z - SZ[bi], s0 = o.s; o.i = bi; o.lat = -dx * TZ[bi] + dz * TX[bi]; o.s = ((bi * DS + dx * TX[bi] + dz * TZ[bi]) % TL + TL) % TL; return wrapS(o.s - s0); }
const GEARS = [0, 9, 17, 25, 33, 41, 70];
function drive(dt) {
  const fx = Math.sin(P.psi), fz = -Math.cos(P.psi), rx = -fz, rz = fx; let vf = P.vx * fx + P.vz * fz, vr = P.vx * rx + P.vz * rz;
  const wet = UW.uWet.value, off = Math.abs(P.lat) > W + .35, mu = (off ? .6 : 1) * (1 - .2 * wet), drift = IN.hb > .3 && vf > 9, vmax = (off ? 19 : CFG.VMAX) + (P.boost > 0 ? 9 : 0) + P.draft * 5 + Math.min(P.clean / 14, 1) * 7; P.clean = off ? 0 : P.clean + dt; if (P.clean > 14 && P.clean - dt <= 14 && !IN.auto) { say('CLEAN RUN · FASTER', 1.6); sfx('boost'); } // touch nothing and the car keeps finding more speed
  let a = IN.thr * CFG.ACC * (P.boost > 0 ? 1.8 : 1) * (1 - vf / vmax) - (IN.thr ? .2 : 2.4) - IN.brake * 9 - IN.hb * 6;
  if (!drift && !IN.auto) { const over = vf - VP[ix(P.i + 2)]; if (over > 0) a -= Math.min(10, over * 1.6 + 2) * CFG.ASSIST; }                 // it brakes itself into corners, most of the way
  const ymax = Math.min(vf * .32, CFG.GRIP * mu / Math.max(vf, 5)), want = IN.steer * 1.25 * (drift ? 1.6 : 1);
  if (!drift && vf > 12) a -= clamp((Math.abs(want) - 1) / .25, 0, 1) * 7;                                                                  // more lock than the tyres can use scrubs speed off
  P.yaw += (clamp(want, drift ? -1.9 : -1, drift ? 1.9 : 1) * ymax - P.yaw) * damp(dt, drift ? .12 : .07); P.psi += P.yaw * dt;
  vf = Math.max(0, vf + a * dt); vr *= Math.exp(-(drift ? 1.5 : 7.5) * mu * dt);
  P.vx = fx * vf + rx * vr; P.vz = fz * vf + rz * vr; P.x += P.vx * dt; P.z += P.vz * dt; P.vf = P.v = vf; P.slip = Math.abs(vr); P.off = off; P.ax += (a - P.ax) * damp(dt, .15); P.ay += (vf * P.yaw - P.ay) * damp(dt, .12);
  P.prog += locate(P);
  const i = P.i, nx = -TZ[i], nz = TX[i], over = P.lat > LR[i] ? P.lat - LR[i] : P.lat < -LL[i] ? P.lat + LL[i] : 0;
  if (over) { P.x -= nx * over; P.z -= nz * over; P.lat -= over; const vn = P.vx * nx + P.vz * nz; if (vn * over > 0) { const hit = Math.abs(vn), k = 1 - clamp(hit * .03, .01, .28); P.vx = (P.vx - nx * vn * 1.2) * k; P.vz = (P.vz - nz * vn * 1.2) * k; // a wall: slide along it, lose some speed, and the nose comes round
      P.psi += wrapPi(Math.atan2(TX[i], -TZ[i]) - P.psi) * clamp(hit * .05, .02, .45); P.yaw *= .5; P.clean = 0; if (T > P.hitT) { P.hitT = T + .16; P.shake = Math.min(1, P.shake + hit * .12); sfx(hit > 4 ? 'bump' : 'scrape', clamp(hit * .15, .3, 1)); if (hit > 2.2) mirrorBreak(over > 0 ? 1 : 0); wallHit(hit, Math.sign(over), nx, nz);
        for (let q = 0; q < 6 + hit; q++) parts.emit(_v.set(P.x + nx * Math.sign(over) * .9 + rand(-.6, .6) * fx, P.y + rand(.2, .6), P.z + nz * Math.sign(over) * .9 + rand(-.6, .6) * fz), _v2.set(P.vx * .6 + rand(-2, 2), rand(1, 4), P.vz * .6 + rand(-2, 2)), _c.set('#ffc46b'), { life: rand(.2, .5), size: .035, glow: 1 }); } } }
  if (drift && P.slip > 1.5) { P.charge = Math.min(2, P.charge + dt); if (Math.random() < dt * 30) parts.emit(_v.set(P.x - fx * 1.6 + rand(-.7, .7) * rx, P.y + .15, P.z - fz * 1.6 + rand(-.7, .7) * rz), _v2.set(rand(-1, 1), rand(.5, 1.5), rand(-1, 1)), _c.set('#e9e6ee'), { life: rand(.5, .9), size: .5, grav: -1, a: .5 }); }
  else if (!drift && P.charge > 0) { if (P.charge > .45) { P.boost = .7 + P.charge * .7; sfx('boost'); say('DRIFT BOOST', 1.4); } P.charge = 0; } P.boost = Math.max(0, P.boost - dt);
  let g = 1; while (vf > GEARS[g]) g++; if (g !== P.gear) { P.gear = g; if (!IN.auto) sfx('shift'); } P.rpm = .25 + .75 * (vf - GEARS[g - 1]) / (GEARS[g] - GEARS[g - 1]);
  if (off) P.shake = Math.max(P.shake, clamp(vf / 30, 0, .35));
  for (const p of PUD) { const ds = wrapS(P.s - p.s); if (Math.abs(ds) < p.a * .7 && Math.abs(P.lat - p.lat) < p.b * .7 + .7 && vf > 12 && T > (p.t || 0)) { p.t = T + 1.5; splash(.75); break; } } // through a puddle: it comes up over the glass
}
function splash(k) { UG.uSplash.value = Math.max(UG.uSplash.value, k); WS.want = Math.max(WS.want, 2); sfx('splash'); for (let q = 0; q < 14; q++) parts.emit(_v.set(P.x + rand(-1, 1), P.y + .2, P.z + rand(-1, 1)), _v2.set(P.vx * .5 + rand(-4, 4), rand(2, 6), P.vz * .5 + rand(-4, 4)), _c.set('#dff1ff'), { life: rand(.4, .8), size: .22, a: .6 }); }
function autopilot(k) { const la = ix(P.i + 5 + (P.vf * .42 | 0)), tx = SX[la], tz = SZ[la], d = wrapPi(Math.atan2(tx - P.x, -(tz - P.z)) - P.psi), vt = VM[ix(P.i + 3)] * k; IN.steer = clamp(d * 2.6, -1, 1); IN.thr = P.vf < vt ? 1 : 0; IN.brake = P.vf > vt + 3 ? .8 : 0; IN.hb = 0; }

// ═══════════════════════════ SIX RIVALS: each follows the circuit at the speed the corners allow, takes the inside line, and goes round whoever is in the way ═══════════════════════════
function updRivals(dt, racing) {
  const all = [P, ...RIV]; let draft = 0; A.near = [];
  for (const r of RIV) { const i = ix(Math.floor(((r.prog % TL) + TL) % TL / DS)), gap = r.prog - P.prog; let band = 1; if (racing) band = gap > 90 ? .88 : gap > 35 ? .95 : gap < -70 ? 1.08 : gap < -25 ? 1.04 : 1; // the pack waits a little for you, and chases a little too
    let vt = racing ? VM[i] * r.skill * band : 0, lt = clamp(K[ix(i + 7)] * 105, -1, 1) * 2.5 + r.bias; if (r.honk > 0) { r.honk -= dt; lt = r.lat + (r.lat > P.lat ? 3 : -3); }
    for (const o of all) { if (o === r) continue; const d = o.prog - r.prog, dl = o.lat - r.lat; if (d > 0 && d < 8 + r.v * .28 && Math.abs(dl) < 2.15) { lt = o.lat + (dl > 0 ? -2.7 : 2.7); if (Math.abs(lt) > W - 1.4) lt = o.lat + (dl > 0 ? 2.7 : -2.7); if (d < 6.5) vt = Math.min(vt, o.v + .5); }
      if (o !== P && Math.abs(d) < 4.3 && Math.abs(dl) < 1.85) r.lat -= Math.sign(dl || 1) * dt * 2; }
    r.lt = clamp(lt, -W + 1.3, W - 1.3); r.lat += clamp(r.lt - r.lat, -3.4 * dt, 3.4 * dt); r.v += clamp(vt - r.v, -13 * dt, CFG.AI.acc * dt); r.v = Math.max(0, r.v); r.prog += r.v * dt;
    // you and it
    const d = r.prog - P.prog, dl = r.lat - P.lat; if (Math.abs(d) < 4.1 && Math.abs(dl) < 1.8) { const px = 4.1 - Math.abs(d), pl = 1.8 - Math.abs(dl), rxv = -TZ[P.i], rzv = TX[P.i], sg = Math.sign(dl || 1), imp = Math.abs(P.vf - r.v) + (pl / 1.8 < px / 4.1 ? 2.5 + Math.abs(P.yaw) * 4 : 0);
      if (pl / 1.8 < px / 4.1) { if (Math.abs(d) < 2.8) { mirrorBreak(dl > 0 ? 1 : 0); rivMirror(r, dl > 0 ? 0 : 1); } r.lat += sg * pl * .6; P.x -= rxv * sg * pl * .4; P.z -= rzv * sg * pl * .4; P.vx -= rxv * sg * 1.2; P.vz -= rzv * sg * 1.2; } else if (d > 0) { const dv = P.vf - r.v; if (dv > 0) { const k = (r.v + .5) / Math.max(P.vf, 1); P.vx *= k; P.vz *= k; r.v += dv * .5; } r.prog += px * .5; } else { r.v = Math.min(r.v, P.vf - .5); r.prog -= px * .5; }
      if (T > P.hitT) carHit(r, imp, sg); }
    if (d > 2 && d < 20 && Math.abs(dl) < 1.5 && P.vf > 20) draft = 1;
    const o = trackAt(r.prog, r.lat, r.o); r.g.position.set(o.x, o.y, o.z); r.g.rotation.set(Math.atan(o.slope), -o.psi - (r.lt - r.lat) * .035, 0); r.s = r.prog;
    if (WX.rain > .3 && r.v > 15 && Math.abs(d) < 60 && Math.random() < dt * 25) parts.emit(_v.set(o.x + rand(-.8, .8), o.y + .2, o.z + rand(-.8, .8)), _v2.set(rand(-1, 1), rand(1, 2.5), rand(-1, 1)), _c.set('#cfdde8'), { life: rand(.5, 1), size: .7, grav: 1, a: .35 });
    A.near.push([Math.hypot(o.x - P.x, o.z - P.z), r]); }
  P.draft += (draft - P.draft) * damp(dt, draft ? .5 : .25); A.near.sort((a, b) => a[0] - b[0]);
}
function grid() { // the start: six cars in two files ahead of you, and you at the back
  prizeReset();
  RIV.forEach((r, k) => { r.prog = -CFG.GRID * (k + 1); r.lat = r.lt = k % 2 ? 1.9 : -1.9; r.v = 0; r.done = 0; r.honk = 0; });
  const o = trackAt(-CFG.GRID * 7, -1.9, P.o); Object.assign(P, { x: o.x, z: o.z, psi: o.psi, vx: 0, vz: 0, vf: 0, v: 0, yaw: 0, prog: -CFG.GRID * 7, i: o.i, s: 0, boost: 0, charge: 0, draft: 0, lapT: 0, best: 0, done: 0, shake: 0, stuck: 0, clean: 0 }); locate(P, true); P.prog = -CFG.GRID * 7; updRivals(0, false); }

// ═══════════════════════════ THE RACE: phases, laps, weather, and the three screens ═══════════════════════════
const G = { level: 1, slow: 0, earn: { laps: 0 }, shown: 0, phase: 'poster', t: 0, pt: 0, time: 0, lights: 0, go: 0, fin: [], place: 0, pos: 7, lap: 1, msg: '', msgT: 0, engine: 0, reveal: false, clipZ: 99, hudT: 0, miniT: 0, tipHB: false, again: false, pause: 0, pauseT: 0 };
function setPhase(p) { G.phase = p; G.t = G.pt = 0; }
function startCount() { setPhase('count'); G.lights = 0; G.go = 5.4 + rand(.6, 1.5); }
const hit = a => G.pt < a && G.t >= a, say = (m, d = 2) => { G.msg = m; G.msgT = T + d; }, fmt = t => `${t / 60 | 0}:${(t % 60).toFixed(1).padStart(4, '0')}`;
function openGlass(now) { UG.uSw.value.set(now ? WP.a1 : WP.a0 - .06, now ? 1 : 0, 0); UG.uRoll.value = now ? 1 : 0; UG.uDust.value = now ? 0 : 1; UG.uSplash.value = 0; G.reveal = !now; }
function updWipers(dt) { const w = WS, auto = WX.rain > .1 && G.phase !== 'ready' && G.phase !== 'boot';
  if (!w.on && (w.want > 0 || auto)) { w.on = true; w.dir = 1; sfx('wipe', 1); }
  if (w.on) { w.a += w.dir * (WP.a1 - WP.a0) / WP.stroke * dt; if (w.a >= WP.a1) { w.a = WP.a1; w.dir = -1; sfx('wipe', -1); } else if (w.a <= WP.a0) { w.a = WP.a0; w.dir = 1; if (w.want > 0) w.want--; if (w.want <= 0 && !auto) { w.on = false; w.pause = 0; } else sfx('wipe', 1); }
    UG.uSplash.value = Math.max(0, UG.uSplash.value - dt * .8); } else w.pause += dt;
  WIP[0].rotation.z = WIP[1].rotation.z = w.a; UG.uBl.value.set((w.a - WP.a0) / (WP.a1 - WP.a0), w.dir, WP.stroke, w.on ? 0 : w.pause);
  if (G.reveal && w.on) UG.uSw.value.x = Math.max(UG.uSw.value.x, w.a); UG.uRain.value = WX.rain; } // the first sweep is the one that opens the other world
const standings = () => [P, ...RIV].sort((a, b) => (a.done || 99) - (b.done || 99) || b.prog - a.prog);
function flow(dt) {
  if (G.pause) { G.pauseT += dt; const t = G.pauseT; IN.auto = true; IN.steer = IN.thr = 0; P.rpm = .2; // paused: the glass is dusty again and it is just your room. The button brings the wipers, and the world, back
    if (G.pause === 1) { if (IN.press && t > .5) { G.pause = 2; G.pauseT = 0; WS.want = 2; G.reveal = true; sfx('click'); } }
    else { UG.uSw.value.y = s01((t - .8) / 1); UG.uDust.value = 1 - s01((t - .8) / 1.2); UG.uRoll.value = s01((t - 1) / 1); if (t > 2.3) { openGlass(true); G.pause = 0; } } return; }
  if ((G.phase === 'race' || G.phase === 'count') && IN.press) { G.pause = 1; G.pauseT = 0; sfx('click'); sfx('whirr'); UG.uSw.value.set(WP.a0 - .06, 0, 0); UG.uRoll.value = 0; UG.uDust.value = 1; G.reveal = false; return; }
  G.pt = G.t; G.t += dt; const ph = G.phase, racing = ph === 'race' || ph === 'finish'; IN.auto = ph !== 'race';
  if (ph === 'poster') { IN.auto = true; autopilot(.72); drive(dt); updRivals(dt, true); G.engine = 1; WX.t = T % 90 < 50 ? [1, 0, 0] : [0, 0, 1]; } // the landing page: the car drives itself, lap after lap, and the evening comes and goes
  else if (ph === 'place') { if (G.t > .9) { camera.getWorldPosition(_v); camera.getWorldDirection(_v2).setY(0); if (_v2.lengthSq() > .01) { seat(_v, _v2.normalize()); setPhase('boot'); sfx('arrive'); } } }
  else if (ph === 'boot') { G.clipZ = lerp(-2.4, .8, s01(G.t / 1.8)); UG.uDust.value = s01((G.t - .5) / 1.2); if (G.t > 2.2) { G.clipZ = 99; setPhase('ready'); } }
  else if (ph === 'ready') { if (renderer.xr.isPresenting && G.t > 1) { camera.getWorldPosition(_v); if (rig.worldToLocal(_v4.copy(_v)).length() > .45) { camera.getWorldDirection(_v2).setY(0); seat(_v, _v2.normalize()); } } // moved? the car follows you until you start it
    if (IN.press) KEYS.auto = KEYS.auto || T; } // the key does it now; the button (or a controller trigger) turns it for you
  else if (ph === 'crank') { // the cinematic: starter, needles, engine, and then the wipers
    if (G.t < 1.9) { const k = Math.sin(clamp(G.t / 1.8, 0, 1) * Math.PI); setNeedle(needleR, k); setNeedle(needleS, k); } startCap.position.z *= .9;
    if (hit(1.1)) { G.engine = 1; sfx('catch'); P.shake = .5; ignitionFx(); } if (hit(1.9)) { WS.want = 1; G.reveal = true; }
    if (hit(3.2)) { WS.want = 1; sfx('washer'); } if (G.t > 3.25) UG.uSw.value.y = s01((G.t - 3.25) / 1.1); if (G.t > 3.4) UG.uDust.value = 1 - s01((G.t - 3.4) / 1.4);
    if (hit(4.3)) sfx('whirr'); if (G.t > 4.3) UG.uRoll.value = s01((G.t - 4.3) / 1.15); if (G.t > 5.7) { openGlass(true); if (RADIO.on) startCount(); else { setPhase('cd'); cdOpen(); } } }
  else if (ph === 'cd') { if (CDS.state === 'done' && CDS.t > 1.6) startCount(); }
  else if (ph === 'count') { const n = clamp(Math.floor((G.t - .6) / 1) + 1, 0, 5); if (G.t > .6 && n > G.lights && G.t < G.go) { G.lights = n; sfx('beep', 440); }
    if (G.t >= G.go) { G.lights = -1; sfx('beep', 880, .7); say('GO!', 1.5); setPhase('race'); G.time = 0; IN.auto = false; } }
  else if (ph === 'race') { G.time += dt; P.lapT += dt; drive(dt); updRivals(dt, true); if (G.t > 2) G.lights = 0;
    const lap = clamp(Math.floor(P.prog / TL) + 1, 1, CFG.LAPS);
    if (lap !== G.lap) { G.lap = lap; if (!P.best || P.lapT < P.best) P.best = P.lapT; P.lapT = 0; sfx('lap'); const lc = 15 + (8 - G.pos) * 5; SAVE.coins += lc; G.earn.laps += lc; save(); sfx('coin', 1, 0); say(`${lap === CFG.LAPS ? 'FINAL LAP' : 'LAP ' + lap} · +${lc}¢`, 2.2); }
    const lf = P.prog / TL; if (G.level === 2) { const k = s01((lf - .55) / .7); WX.sink = s01(lf / .9); WX.t = [0, 0, 1 - k, k]; if (lf > .55 && lf < .56 && T > G.msgT) say('NIGHT FALLS · LIGHTS ON', 2.4); WX.storm = s01((lf - 1.55) / .45); WX.rainX = s01((lf - 1.97) / .15); if (lf > 2 && lf < 2.01 && T > G.msgT) say('STORM', 2); } // and the last lap is a thunderstorm in the dark // level two: lap one the sun goes down, then it is night
    else { WX.sink = 0; WX.rainX = 0; WX.storm = lf < 1.04 ? s01((lf - .72) / .32) * .55 : lf < 1.86 ? 1 : 1 - s01((lf - 1.86) / .15); WX.t = lf > 1.04 && lf < 1.86 ? [0, 1, 0] : lf >= 1.86 ? [0, 0, 1] : [1, 0, 0]; if (hit(0.001) || (lf > 1.04 && lf < 1.045 && T > G.msgT)) lf > 1 && say('RAIN', 2); } // lap two: it rains. lap three: the sun comes back low and gold
    if (!IN.everHeld && G.t > 2.5 && T > G.msgT) say('GRAB THE WHEEL', 1.5);
    if (!G.tipHB && P.prog > 0 && md(P.i, atTPc[10]) < 6) { G.tipHB = true; say('HAIRPIN · PULL THE HANDBRAKE', 3); } HB.btn.material.emissiveIntensity = G.tipHB && T < G.msgT + 2 && !G.usedHB ? 1.5 + Math.sin(T * 9) : 0; if (IN.hb) G.usedHB = true;
    if (P.draft > .6 && T > G.msgT) say('SLIPSTREAM', .4);
    const wrong = Math.sin(P.psi) * TX[P.i] - Math.cos(P.psi) * TZ[P.i] < -.2; P.stuck = (wrong || (P.vf < 2.5 && IN.thr && G.t > 3)) ? P.stuck + dt : 0; if (wrong && T > G.msgT) say('WRONG WAY', .5);
    if (P.stuck > 2.4) { const o = trackAt(P.s, clamp(P.lat, -3, 3), P.o); Object.assign(P, { x: o.x, z: o.z, psi: o.psi, vx: Math.sin(o.psi) * 9, vz: -Math.cos(o.psi) * 9, yaw: 0, stuck: 0 }); UG.uSplash.value = 1; WS.want = 2; sfx('whoosh', 1); } // lost? a wipe of the blades and you are back on the road
    for (const r of RIV) if (!r.done && r.prog >= CFG.LAPS * TL) r.done = G.fin.push(r);
    if (P.prog >= CFG.LAPS * TL) { P.done = G.fin.push(P); G.place = P.done; setPhase('finish'); IN.auto = true; ceremonyStart(); if (!P.best || P.lapT < P.best) P.best = P.lapT; WX.t = G.level === 2 ? [0, 0, 0, 1] : [0, 0, 1]; G.again = false; } }
  else if (ph === 'finish') { autopilot(.55); drive(dt); updRivals(dt, true); for (const r of RIV) if (!r.done && r.prog >= CFG.LAPS * TL) r.done = G.fin.push(r);
    if (G.place <= 3 && G.t < 5 && Math.random() < dt * 60) parts.emit(_v.set(P.x + Math.sin(P.psi) * rand(6, 22) + rand(-5, 5), P.y + rand(3, 6), P.z - Math.cos(P.psi) * rand(6, 22) + rand(-5, 5)), _v2.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)), _c.set(pick(['#ff3b2f', '#ffd23f', '#35cfa8', '#3f7bff', '#ffffff'])), { life: rand(1.5, 2.5), size: .16, grav: 1.5 });
    ceremony(); if (G.t > 6.3) G.again = true; if (G.again && IN.press) restart(); }
  if (!['poster', 'race', 'finish', 'place'].includes(G.phase)) { IN.auto = true; IN.steer = IN.thr = IN.hb = 0; IN.brake = 1; drive(dt); updRivals(dt, false); }
  if (G.engine && !racing && ph !== 'poster') { P.rpm = .2; P.gear = 0; }
  const all = standings(); G.pos = all.indexOf(P) + 1;
}
const atTPc = TP.map((p, k) => atTP(k));
function restart() { sfx('click'); WX.storm = WX.rainX = 0; G.level = G.level === 1 ? 2 : 1; WX.sink = 0; say(G.level === 2 ? 'LEVEL 2 · NIGHT DRIVE' : 'LEVEL 1 · SUNDAY', 3); G.fin.length = 0; G.place = 0; G.lap = 1; G.tipHB = G.usedHB = false; WX.t = [1, 0, 0]; grid(); openGlass(false); UG.uDust.value = 1; WS.a = WP.a0; setPhase('crank'); G.t = G.pt = 1.2; G.engine = 1; }
function seat(hp, fwd) { rig.position.set(hp.x, hp.y - .015, hp.z); rig.rotation.y = Math.atan2(-fwd.x, -fwd.z); rig.updateMatrixWorld(true); } // the cockpit goes where you are: your eyes are its origin

// ── put the world where it belongs. The car never moves in your room; everything else does
function setWorld(dt) {
  const fx = Math.sin(P.psi), fz = -Math.cos(P.psi), rx = -fz, rz = fx, o = trackAt(P.s, 0, P.o), sl = o.slope * (fx * TX[P.i] + fz * TZ[P.i]); P.y = o.y; P.shake *= Math.exp(-dt / .25);
  const bob = (Math.sin(T * 31) * .5 + Math.sin(T * 47.3) * .5) * (P.shake * .012 + (G.engine ? .0006 : 0) + P.vf * .00004), ex = P.x - rx * CFG.CX, ez = P.z - rz * CFG.CX, ey = P.y + CFG.EYE + bob;
  world.rotation.y = P.psi; world.position.set(-ex, -ey, -ez).applyAxisAngle(YA, P.psi);
  tilt.rotation.x = -Math.atan(sl) - clamp(P.ax, -12, 12) * .0014 + Math.sin(T * 39) * P.shake * .004; tilt.rotation.z = -clamp(P.ay, -22, 22) * .0011 + Math.sin(T * 43) * P.shake * .005;
  rig.updateMatrixWorld(true); camera.getWorldPosition(_v); world.worldToLocal(UW.uEye.value.copy(_v)); skyDome.position.copy(UW.uEye.value); MILLS.forEach((m, k) => { m.rotation.z = T * (.5 + k * .07); });
  // the tree on the mirror feels every corner
  const jit = P.vf * .012 + P.shake * 2.2; for (const p of PEND) { const w = 9.81 / p.L; for (let k = 0; k < 2; k++) { const h = dt / 2; // a corner swings them out, braking swings them forward, and the road keeps them trembling
      p.vz += (-w * Math.sin(p.az) - P.ay / p.L * Math.cos(p.az) * .55 - p.damp * p.vz + rand(-1, 1) * jit) * h; p.az = clamp(p.az + p.vz * h, -1.3, 1.3); p.vx += (-w * Math.sin(p.ax) - P.ax / p.L * Math.cos(p.ax) * .55 - p.damp * p.vx + rand(-1, 1) * jit) * h; p.ax = clamp(p.ax + p.vx * h, -1.3, 1.3); }
    p.g.rotation.set(p.ax, p.yaw + p.az * .3, p.az, 'ZXY'); }
  if (G.clipZ > 50) CLIP.constant = 1e4; else { _v2.set(0, 0, -1).transformDirection(rig.matrixWorld); CLIP.normal.copy(_v2); CLIP.constant = -_v2.dot(rig.localToWorld(_v3.set(0, 0, G.clipZ))); }
  LAMPS.forEach((l, k) => l.material.color.set(G.lights < 0 ? '#3dff7a' : k < G.lights ? '#ff2a1f' : '#1b1d22'));
}

// ── three screens: the cluster display, the head-up line on the glass, the map in the middle. And a mirror
const MAPP = (() => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (let i = 0; i < N; i++) { x0 = Math.min(x0, SX[i]); x1 = Math.max(x1, SX[i]); z0 = Math.min(z0, SZ[i]); z1 = Math.max(z1, SZ[i]); } const k = Math.min(232 / (x1 - x0), 232 / (z1 - z0)); return (x, z) => [144 + (x - (x0 + x1) / 2) * k, 144 + (z - (z0 + z1) / 2) * k]; })();
function screens() { const ph0 = G.phase;
  setNeedle(needleR, G.engine ? P.rpm * .82 + (ph0 === 'race' ? 0 : Math.sin(T * 20) * .004) : 0); setNeedle(needleS, P.vf * 4.3 / 240); if (ph0 === 'crank' && G.t < 1.9) { const k = Math.sin(clamp(G.t / 1.8, 0, 1) * Math.PI); setNeedle(needleR, k); setNeedle(needleS, k); }
  startCap.cap.material.color.setScalar(1).multiply(_c.set('#ff3b2f')).multiplyScalar(G.again || G.pause === 1 ? (Math.sin(T * 9) > 0 ? 1.6 : .2) : .5); startRing.material.opacity = G.again || G.pause === 1 ? .5 + .5 * Math.sin(T * 9) : 0; startRing.scale.setScalar(1 + .25 * (T * 1.5 % 1));
  if (T < G.hudT) { if (T >= G.miniT) mini(); return; } G.hudT = T + .09; const c = HUDC.ctx, ph = G.phase, kmh = Math.round(P.vf * 4.3), msg = T < G.msgT ? G.msg : '', F = (w, s, i) => `${i ? 'italic ' : ''}${w} ${s}px "Chakra Petch",sans-serif`;
  c.fillStyle = '#04060a'; c.fillRect(0, 0, 512, 256); c.fillStyle = '#000'; c.fillRect(0, 256, 512, 256); c.textBaseline = 'middle';
  if (G.pause) { c.textAlign = 'center'; c.fillStyle = '#f3f1ea'; c.font = F(700, 70, 1); c.fillText('PAUSED', 256, 104); c.fillStyle = `rgba(255,59,47,${.55 + .45 * Math.sin(T * 5)})`; c.font = F(500, 28); c.fillText('press START to drive on', 256, 178); }
  else if (ph === 'ready' || (ph === 'boot')) { c.textAlign = 'center'; c.fillStyle = `rgba(255,59,47,${.55 + .45 * Math.sin(T * 5)})`; c.font = F(700, 62, 1); c.fillText(KEYS.state === 'in' ? 'TURN THE KEY' : 'TAKE THE KEY', 256, 108); c.fillStyle = '#c9b8ff'; c.font = F(500, 26); c.fillText(KEYS.state === 'in' ? 'pinch it and twist your wrist' : 'pinch it, put it in the ignition', 256, 178); }
  else if (ph === 'cd') { c.textAlign = 'center'; c.fillStyle = `rgba(95,243,255,${.6 + .4 * Math.sin(T * 5)})`; c.font = F(700, 58, 1); c.fillText('PICK A CD', 256, 108); c.fillStyle = '#c9b8ff'; c.font = F(500, 26); c.fillText('swipe, grab, feed the player', 256, 178); }
  else if (ph === 'crank' && G.t < 2.4) { c.textAlign = 'center'; c.fillStyle = '#f3f1ea'; c.font = 'italic 800 76px Unbounded,sans-serif'; c.fillText('NXT', 256, 112); c.fillStyle = '#ff3b2f'; c.fillRect(120, 176, 272 * clamp(G.t / 2.3, 0, 1), 8); }
  else if (ph === 'finish') { c.textAlign = 'center'; c.fillStyle = G.place === 1 ? '#ffd23f' : '#f3f1ea'; c.font = F(700, 110, 1); c.fillText(`P${G.place}`, 256, 84); c.font = F(700, 34, 1); c.fillStyle = '#f3f1ea'; c.fillText(G.place === 1 ? 'WINNER' : G.place <= 3 ? 'PODIUM' : 'FINISHED', 256, 160);
    c.font = F(500, 24); c.fillStyle = G.again && Math.sin(T * 5) > -.3 ? '#ff3b2f' : '#8b909a'; c.fillText(G.again ? 'START = RACE AGAIN' : `${fmt(G.time)}  ·  BEST LAP ${fmt(P.best)}`, 256, 216); }
  else { c.textAlign = 'left'; c.fillStyle = '#8b909a'; c.font = F(500, 22); c.fillText('LAP', 22, 30); c.fillText('POS', 396, 30); c.fillStyle = '#f3f1ea'; c.font = F(700, 52, 1); c.fillText(`${G.lap}/${CFG.LAPS}`, 20, 76); c.fillText(`${G.pos}/7`, 394, 76);
    c.textAlign = 'center'; c.font = F(700, 104, 1); c.fillText(ph === 'race' ? kmh : 0, 256, 112); c.fillStyle = '#8b909a'; c.font = F(500, 22); c.fillText('km/h', 256, 174); c.fillStyle = '#35cfa8'; c.font = F(700, 40, 1); c.fillText(ph === 'race' ? P.gear : 'N', 256, 34);
    c.fillStyle = '#f3f1ea'; c.font = F(500, 30); c.textAlign = 'left'; c.fillText(fmt(G.time), 22, 222); c.textAlign = 'right'; c.fillStyle = '#8b909a'; c.fillText(P.best ? `BEST ${fmt(P.best)}` : '', 490, 222); c.textAlign = 'center'; c.fillStyle = '#ffd23f'; c.font = F(700, 26, 1); c.fillText(SAVE.coins + '¢', 256, 222);
    if (P.charge > 0 || P.boost > 0) { c.fillStyle = P.boost > 0 ? '#ffd23f' : '#4fd2ff'; c.fillRect(156, 194, 200 * clamp(P.boost > 0 ? P.boost / 2 : P.charge / 2, 0, 1), 8); } }
  // head-up (additive: black is clear glass)
  if (ph === 'race' || ph === 'count' || ph === 'finish') { const hc = '#c9f6ff'; c.textAlign = 'left'; c.fillStyle = hc; c.font = F(700, 78, 1); c.fillText(`P${ph === 'finish' ? G.place : G.pos}`, 14, 322); c.textAlign = 'right'; c.font = F(700, 40, 1); c.fillText(`LAP ${G.lap}/${CFG.LAPS}`, 500, 300); c.font = F(500, 30); c.fillText(fmt(G.time), 500, 348);
    c.textAlign = 'center'; if (G.lights > 0) for (let k = 0; k < 5; k++) { c.fillStyle = k < G.lights ? '#ff3b2f' : '#30343c'; c.beginPath(); c.arc(176 + k * 40, 320, 15, 0, 7); c.fill(); }
    else if (msg) { c.fillStyle = msg === 'GO!' ? '#5dff8f' : msg === 'WRONG WAY' ? '#ff3b2f' : '#ffe27a'; c.font = F(700, msg.length > 10 ? 30 : 52, 1); c.fillText(msg, 232, 322, 215); } else if (ph === 'race') { c.fillStyle = hc; c.font = F(700, 74, 1); c.fillText(kmh, 262, 318); } }
  HUDC.tex.needsUpdate = true; hud.material.opacity += (((ph === 'race' || ph === 'count' || ph === 'finish') && !G.pause ? .95 : 0) - hud.material.opacity) * .2;
  if (T >= G.miniT) mini();
}
function mini() { G.miniT = T + .22; const m = MINI.ctx, all = standings(); if (!miniBoot(m) && !miniPrize(m, all)) { m.fillStyle = '#160e36'; m.fillRect(0, 0, 512, 288); m.strokeStyle = '#ff4fa3'; m.lineWidth = 9; m.lineJoin = 'round'; m.beginPath(); for (let i = 0; i <= N; i += 4) { const [x, y] = MAPP(SX[i % N], SZ[i % N]); i ? m.lineTo(x, y) : m.moveTo(x, y); } m.closePath(); m.stroke(); m.strokeStyle = '#ffd6ea'; m.lineWidth = 2; m.stroke();
  for (const r of [...RIV, P]) { const o = r === P ? P : r.o, [x, y] = MAPP(o.x, o.z); m.fillStyle = r.hex; m.beginPath(); m.arc(x, y, r === P ? 9 : 6, 0, 7); m.fill(); if (r === P) { m.strokeStyle = '#fff'; m.lineWidth = 3; m.stroke(); } }
  m.textBaseline = 'middle'; all.forEach((r, k) => { const y = 30 + k * 30; if (r === P) { m.fillStyle = 'rgba(255,255,255,.1)'; m.fillRect(296, y - 14, 208, 28); } m.fillStyle = '#8b909a'; m.font = '500 20px "Chakra Petch",sans-serif'; m.textAlign = 'left'; m.fillText(k + 1, 304, y); m.fillStyle = r.hex; m.fillRect(328, y - 9, 8, 18); m.fillStyle = r === P ? '#fff' : '#c9ccd3'; m.font = `${r === P ? 700 : 500} 21px "Chakra Petch",sans-serif`; m.fillText(r.name, 346, y);
    if (k && racingNow()) { m.textAlign = 'right'; m.fillStyle = '#6f7480'; m.font = '500 17px "Chakra Petch",sans-serif'; m.fillText(r.done ? 'FIN' : `+${Math.max(0, (all[0].prog - r.prog) / 30).toFixed(1)}`, 500, y); } });
  m.fillStyle = '#4fd2ff'; m.font = '500 18px "Chakra Petch",sans-serif'; m.textAlign = 'left'; m.fillText(RADIO.on ? '♪ ' + STATIONS[RADIO.st].name + '  · tap' : 'NXT FM', 304, 266); } MINI.tex.needsUpdate = true;

}
const racingNow = () => G.phase === 'race' || G.phase === 'finish' || G.phase === 'poster';
function updAudio(dt) { if (!A.ctx) return; const on = G.engine && G.phase !== 'poster', f = 38 + 132 * P.rpm + (P.boost > 0 ? 14 : 0), load = IN.thr ? 1 : .25;
  [1, .5, 1.503].forEach((k, i) => aset(A.engO[i].frequency, f * k, .05)); aset(A.engF.frequency, 240 + 2300 * P.rpm * (.35 + .65 * load), .08); aset(A.engG.gain, on ? .05 + .07 * load + .03 * P.rpm : 0, .08); aset(A.lumpG.gain, on && P.vf < 2 ? .02 : 0, .2);
  const v = on && !G.pause ? P.vf / CFG.VMAX : 0; aset(A.windG.gain, clamp(v * v * .075 * (1 - .4 * P.draft), 0, .1), .2); aset(A.windF.frequency, 380 + 900 * v, .2); aset(A.sqG.gain, on ? clamp((P.slip - 2.2) / 9, 0, 1) * .07 * (1 - .5 * WX.rain) : 0, .05); aset(A.sqF.frequency, 1250 + P.slip * 45, .05);
  aset(A.rainG.gain, on ? WX.rain * .05 + UG.uSplash.value * .03 : 0, .3); aset(A.roofG.gain, on ? WX.rain * .06 : 0, .3); aset(A.radG.gain, RADIO.on && on && STATIONS[RADIO.st].ch ? .5 * (RADIO.vol ?? 1) * (RADIO.mute ? 0 : 1) : 0, .12); radio();
  A.riv.forEach((vv, k) => { const e = A.near && A.near[k]; if (!e || !on || e[0] > 70) { aset(vv.g.gain, 0, .1); return; } const r = e[1], fr = (34 + r.v * 3.1) * (1 + clamp((r.v - P.vf) * (r.prog > P.prog ? -1 : 1) * .004, -.08, .08)); aset(vv.o.frequency, fr, .08); aset(vv.o2.frequency, fr / 2, .08); aset(vv.g.gain, .09 * (1 - e[0] / 70), .1); setPan(vv.p, r.g.getWorldPosition(_v)); });
  setPan(A.radP, rig.localToWorld(_v.set(CFG.CX, -.3, -.6))); updateListener(); }
