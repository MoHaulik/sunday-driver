
// ═══════════════════════════ WHAT YOU WIN: coins, a trophy that rises out of the dash, confetti that lands on your real floor, and a prize shop that makes the cabin more yours every race ═══════════════════════════
const SAVE = Object.assign({ coins: 0, own: [], cups: [], medal: 7 }, (() => { try { return JSON.parse(localStorage.getItem('sd.save')) || {}; } catch (e) { return {}; } })());
const save = () => { try { localStorage.setItem('sd.save', JSON.stringify(SAVE)); } catch (e) { } }, has = id => SAVE.own.includes(id);
const look = (g, pitch = 1, yaw = 0) => { const d = _v.copy(g.position).negate().normalize(); g.rotation.set(-Math.asin(d.y) * pitch, Math.atan2(d.x, d.z) + yaw, 0, 'YXZ'); return g; }; // turn something in the cabin to face your eyes
const ANIM = [], DEB = [], CER = { g: null }, SHOP = { open: 0, slots: [] };
const ctx2 = (w, h, f) => { const t = ctex(w, h); f(t.ctx); t.tex.needsUpdate = true; return t; }, ink = '#1d1233';

// ── door mirrors you can see through the side windows. Hit a wall or a car and they come off and tumble down the road behind you
const SMC = [ctex(128, 80), ctex(128, 80)];
const SMIR = [-1, 1].map((s, k) => { const X = x => s < 0 ? x : mir(x), g = grp(cab, X(-.35), -.205, -.89), hc = new V(X(-.5) - g.position.x, .06, .12), hs = grp(g, hc.x, hc.y, hc.z); // mounted at the front corner of the window, so the stalk hides behind the housing
  g.updateMatrixWorld(true); const d = _v.copy(g.position).add(hc).negate().normalize(); hs.rotation.set(-Math.asin(d.y) * .6, Math.atan2(d.x, d.z) + s * .15, 0, 'YXZ');
  const pink = col('#ff2d8a'), dk = col('#3a2a5c'), a = new MB(); a.add(new THREE.CylinderGeometry(.008, .011, hc.length(), 10).translate(0, hc.length() / 2, 0).applyQuaternion(new Qn().setFromUnitVectors(YA, hc.clone().normalize())), new THREE.Matrix4(), dk)
    .add(new THREE.CylinderGeometry(.03, .036, .016, 3).rotateZ(Math.PI / 2).scale(1, 1.3, 1.6), M4(0, 0, 0), dk); wmesh(a.geo(), WM2, g); // a slim stalk and a little triangular sail on the door
  const h = new MB(); h.add(new THREE.SphereGeometry(1, 24, 14).scale(.088, .056, .05).translate(0, 0, -.032), new THREE.Matrix4(), pink).add(new THREE.TorusGeometry(1, .07, 6, 36).scale(.078, .05, .08).translate(0, 0, .022), new THREE.Matrix4(), col(ink)); wmesh(h.geo(), WM2, hs);
  const gl = new THREE.Mesh(new THREE.CircleGeometry(1, 36).scale(.075, .047, 1).translate(0, 0, .0215), new THREE.MeshBasicMaterial({ map: SMC[k].tex, toneMapped: false, ...STEN })); gl.renderOrder = RO.world + 1; hs.add(gl);
  return { o: g, on: true, p: g.position.clone(), q: g.quaternion.clone(), s: g.scale.clone(), c: SMC[k] }; });
function fling(m, v, gy) { if (!m.on) return false; m.on = false; world.attach(m.o); DEB.push({ m, v: v.clone(), w: new V(rand(-14, 14), rand(-14, 14), rand(-14, 14)), gy }); m.o.getWorldPosition(_v3); world.worldToLocal(_v3);
  for (let q = 0; q < 16; q++) parts.emit(_v3, _v2.set(v.x + rand(-3, 3), rand(1, 4), v.z + rand(-3, 3)), _c.set(pick(['#d4f1ff', '#ffffff', '#ff2d8a'])), { life: rand(.3, .7), size: .03, glow: 1 }); return true; }
function mirrorBreak(k) { const fx = Math.sin(P.psi), fz = -Math.cos(P.psi), s = k ? 1 : -1; if (!fling(SMIR[k], _v4.set(P.vx * .7 - fz * s * 3, 2.6, P.vz * .7 + fx * s * 3), P.y + .07)) return;
  sfx('crack'); P.shake = Math.min(1, P.shake + .4); if (G.phase === 'race') say(k ? 'RIGHT MIRROR GONE' : 'LEFT MIRROR GONE', 1.6); }
function rivMirror(r, k) { const o = trackAt(r.prog, r.lat, {}), fx = Math.sin(o.psi), fz = -Math.cos(o.psi), s = k ? 1 : -1; if (fling(r.mir[k], _v4.set(fx * r.v * .7 - fz * s * 3, 2.6, fz * r.v * .7 + fx * s * 3), o.y + .07)) sfx('crack', .6); }

// ── confetti in YOUR room: paper that flutters down, settles on the dash and on your real floor, and stays a while
const CFN = 240, CF = new THREE.InstancedMesh(new THREE.PlaneGeometry(.011, .019), new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }), CFN), CFP = [...Array(CFN)].map(() => ({ on: 0, p: new V(), v: new V(), r: new THREE.Euler(), w: new V(), life: 0, land: 0 })); let CFk = 0;
CF.frustumCulled = false; rig.add(CF); for (let i = 0; i < CFN; i++) { CF.setMatrixAt(i, _m.makeScale(0, 0, 0)); CF.setColorAt(i, _c.set('#fff')); }
const CFC = ['#ff2d8a', '#ffd23f', '#19c3ff', '#7ed321', '#ffffff', '#a45cff', '#ff8a3c'];
function burst(p, n, up = 2.4) { for (let q = 0; q < n; q++) { const i = CFk++ % CFN, f = CFP[i]; f.on = 1; f.land = 0; f.life = 22; f.p.copy(p).add(_v.set(rand(-.03, .03), rand(0, .03), rand(-.03, .03))); f.v.set(rand(-1, 1), rand(.4, 1) * up, rand(-1, 1) * .8); f.r.set(rand(0, 6), rand(0, 6), rand(0, 6)); f.w.set(rand(-14, 14), rand(-14, 14), rand(-14, 14)); CF.setColorAt(i, _c.set(pick(CFC))); } CF.instanceColor.needsUpdate = true; }
function updConfetti(dt) { const floor = -rig.position.y + .003; let any = 0;
  for (let i = 0; i < CFN; i++) { const f = CFP[i]; if (!f.on) continue; any = 1;
    if (!f.land) { f.v.y -= 5 * dt; f.v.multiplyScalar(Math.exp(-2.6 * dt)); f.v.x += Math.sin(T * 6 + i) * dt * .9; f.p.addScaledVector(f.v, dt); f.r.x += f.w.x * dt; f.r.y += f.w.y * dt; f.r.z += f.w.z * dt;
      const dash = f.p.x > -.34 && f.p.x < 1.06 && f.p.z < -.6 && f.p.z > -1 && f.p.y < -.197 && f.p.y > -.23; if (dash || f.p.y < floor) { f.land = 1; f.p.y = dash ? -.196 : floor; f.r.set(-Math.PI / 2 + rand(-.15, .15), 0, rand(0, 6)); } }
    else if ((f.life -= dt) <= 0) f.on = 0;
    CF.setMatrixAt(i, _m.compose(f.p, _q.setFromEuler(f.r), _v.setScalar(f.on ? Math.min(1, f.life) : 0))); }
  if (any) CF.instanceMatrix.needsUpdate = true; }

// ── trophies: gold, silver and bronze cups; a rosette for 4th to 6th; and for last place, a wooden spoon
function buildPrize(p) { const g = new THREE.Group();
  if (p <= 3) { const mt = cm(['#ffcd3c', '#e2e7ef', '#dd8f4c'][p - 1], .22, 1, { side: THREE.DoubleSide }), pts = [[.004, 0], [.016, 0], [.016, .004], [.005, .008], [.0035, .026], [.01, .032], [.022, .05], [.026, .072], [.023, .072], [.019, .052], [0, .046]];
    mesh(at(box(.042, .014, .042), 0, .007, 0), cm('#2a2d35', .5), g); mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y + .014)), 28), mt, g);
    mesh([new THREE.TorusGeometry(.011, .0022, 6, 16, Math.PI).rotateZ(-Math.PI / 2).translate(.024, .066, 0), new THREE.TorusGeometry(.011, .0022, 6, 16, Math.PI).rotateZ(Math.PI / 2).translate(-.024, .066, 0)], mt, g);
    const t = ctx2(128, 40, c => { c.fillStyle = '#16181d'; c.fillRect(0, 0, 128, 40); c.fillStyle = ['#ffd23f', '#e2e7ef', '#e09a58'][p - 1]; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'italic 800 24px Unbounded,sans-serif'; c.fillText(['', '1ST', '2ND', '3RD'][p], 64, 21); });
    mesh(new THREE.PlaneGeometry(.032, .01).translate(0, .007, .0212), lit({ map: t.tex }), g); }
  else if (p < 7) { const cl = ['#2d7fe0', '#a45cff', '#35cfa8'][p - 4], r = grp(g, 0, .062, 0), t = ctx2(64, 64, c => { c.fillStyle = '#fff6fb'; c.fillRect(0, 0, 64, 64); c.fillStyle = cl; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'italic 800 24px Unbounded,sans-serif'; c.fillText(p + 'TH', 32, 34); });
    mesh(at(cyl(.0018, .0018, .05), 0, .025, -.004), M.alu, g); mesh(at(cyl(.012, .014, .004, 16), 0, .002, -.004), M.black, g); mesh(new THREE.CircleGeometry(.024, 24), cm(cl, .8, 0, { side: THREE.DoubleSide }), r); mesh(tor(.024, .005, 24, 6), cm('#ffffff', .9), r);
    mesh(new THREE.CircleGeometry(.014, 24).translate(0, 0, .002), cm('#ffffff', .8, 0, { map: t.tex }), r); mesh([at(box(.011, .036, .002), -.008, -.032, -.002, 0, 0, -.25), at(box(.011, .036, .002), .008, -.032, -.002, 0, 0, .25)], cm(cl, .8), r); }
  else { const s = grp(g, 0, .004, 0), wood = cm('#c99a5f', .85); s.rotation.x = -1.15; mesh([at(sph(.016).scale(1, .35, 1.4), 0, 0, 0), at(cyl(.0028, .0042, .1), 0, .002, .07, Math.PI / 2)], wood, s); }
  return g; }
const CUPS = grp(cab), shelfPos = k => new V(.66 + k * .088, -.198, -.69);
function buildShelf() { CUPS.clear(); SAVE.cups.forEach((p, k) => { const c = buildPrize(p); c.position.copy(shelfPos(k)); look(c, 0); CUPS.add(c); }); }

// ── the ceremony
function ceremonyStart() { const p = G.place, pay = [0, 250, 180, 140, 100, 80, 60, 40][p], mir = SMIR.filter(m => m.on).length * 30;
  G.bank0 = SAVE.coins - G.earn.laps; G.earn.race = pay; G.earn.mir = mir; SAVE.coins += pay + mir; G.newMedal = p < SAVE.medal; if (G.newMedal) SAVE.medal = p; if (p <= 3) SAVE.cups = [...SAVE.cups, p].slice(-5); save();
  G.slow = T + 1.3; G.fw = .2; G.tick = 0; CER.g = buildPrize(p); CER.g.position.set(.3, -.42, -.68); CER.g.scale.setScalar(1.8); cab.add(CER.g); CER.from = null;
  sfx(p === 7 ? 'sad' : 'fanfare'); say(p === 1 ? 'YOU WIN!' : p <= 3 ? 'PODIUM!' : p === 7 ? 'DEAD LAST' : `P${p} · NOT BAD`, 4); }
function firework() { const fx = Math.sin(P.psi), fz = -Math.cos(P.psi), d = rand(50, 90), sx = rand(-30, 30), c = _c.set(pick(['#ff2d8a', '#ffd23f', '#19c3ff', '#7ed321', '#ffffff'])).clone(), o = _v3.set(P.x + fx * d - fz * sx, P.y + rand(22, 34), P.z + fz * d + fx * sx);
  for (let q = 0; q < 54; q++) { _v2.set(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(rand(7, 10)); parts.emit(o, _v2, q % 9 ? c : _c.set('#ffffff'), { life: rand(1.1, 1.7), size: 1.3, grav: 2.5, glow: 1 }); } sfx('firework'); }
function ceremony() { const t = G.t, p = G.place, g = CER.g;
  if (p <= 3 && t < 8 && t > G.fw) { G.fw = t + rand(.25, .55); firework(); }
  G.shown = Math.round(lerp(G.bank0, SAVE.coins, s01((t - 2.2) / 2))); if (t > 2.2 && t < 4.3 && T > G.tick) { G.tick = T + .075; sfx('coin', 1 + (t - 2.2) * .12); }
  if (hit(5.9) && G.newMedal) { paintMedal(SAVE.medal); sfx('pop'); const pe = PEND.find(q => q.g === MEDALG); if (pe) pe.vz += 9; burst(MEDALG.position.clone().add(_v.set(0, -.07, 0)), 26, 1.2); say(`NEW MEDAL · ${['', '1ST', '2ND', '3RD', '4TH', '5TH', '6TH'][SAVE.medal]}`, 2.5); }
  if (!g) return;
  if (t < 4.6) { g.position.y = lerp(-.42, -.06, s01((t - .9) / 1.2)); g.rotation.y = T * 1.6; if (hit(1.6)) { burst(g.position.clone().setY(-.02), p <= 3 ? 150 - p * 25 : p === 7 ? 5 : 45); sfx('pop'); } }
  else { const k = s01((t - 4.6) / 1), dst = p <= 3 ? shelfPos(SAVE.cups.length - 1) : null; if (!CER.from) CER.from = g.position.clone();
    if (dst) { g.position.lerpVectors(CER.from, dst, k); g.position.y += Math.sin(k * Math.PI) * .09; g.scale.setScalar(lerp(1.8, 1, k)); } else { g.position.y = CER.from.y + k * .1; g.scale.setScalar(1.8 * (1 - k) + .001); }
    if (k >= 1) { cab.remove(g); CER.g = null; if (dst) { buildShelf(); burst(dst.clone().setY(-.12), 18, 1); sfx('click'); } } } }

// ── the prize shop: three things float over the dash. Tap one to buy it; it goes straight into the car
const D = (x, z, y = -.198) => [x, y, z];
const bob = (o, k = 1) => { const s = { a: 0, b: 0, va: 0, vb: 0 }; ANIM.push(dt => { const j = P.vf * .35 + P.shake * 40; s.va += (-240 * s.a - 3.2 * s.va + P.ay * 1.6 * k + rand(-1, 1) * j) * dt; s.vb += (-240 * s.b - 3.2 * s.vb + P.ax * 1.2 * k + rand(-1, 1) * j) * dt; s.a += s.va * dt; s.b += s.vb * dt; o.rotation.z = s.a; o.rotation.x = s.b; }); return s; };
const tapAt = (o, f) => { let cool = 0; ANIM.push(() => { if (T < cool) return; for (const h of PH) if (h.ok && !h.on) for (const t of h.tips) if (t.distanceTo(o.position) < .035) { cool = T + .5; f(); return; } }); };
const W1 = () => cm('#fbf7ef', .8), GOLD = () => cm('#ffc93c', .25, 1);
const ITEMS = {
  flag: { n: 'CHEQUERED FLAG', p: 40, at: D(.06, -.88), b: g => { const t = ctx2(64, 48, c => { for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) { c.fillStyle = (i + j) % 2 ? '#16181d' : '#fff'; c.fillRect(i * 8, j * 8, 8, 8); } });
    mesh([at(cyl(.0012, .0012, .075, 6), 0, .037, 0), at(sph(.003, 8, 6), 0, .076, 0)], M.alu, g); mesh(at(cyl(.008, .009, .004, 12), 0, .002, 0), M.black, g); g.fl = grp(g, 0, .062, 0); mesh(new THREE.PlaneGeometry(.04, .028).translate(.02, -.002, 0), cm('#fff', .8, 0, { map: t.tex, side: THREE.DoubleSide }), g.fl); },
    f: g => ANIM.push(() => { g.fl.rotation.y = Math.sin(T * 9) * .25 - clamp(P.vf * .03, 0, 1.2); }) },
  duck: { n: 'RUBBER DUCK', p: 50, at: D(.22, -.79), b: g => { const y = cm('#ffd51f', .32); mesh([at(sph(.018).scale(1, .8, 1.35), 0, .014, 0), at(sph(.011), 0, .033, .011), at(new THREE.ConeGeometry(.006, .013, 6), 0, .024, -.025, -1)], y, g); mesh(at(box(.011, .004, .011), 0, .031, .024), cm('#ff7a1f', .5), g); mesh([at(sph(.002, 6, 4), -.006, .036, .02), at(sph(.002, 6, 4), .006, .036, .02)], M.black, g); },
    f: g => { look(g, 0, .5); tapAt(g, () => { sfx('squeak'); g.scale.set(1.15, .75, 1.15); }); ANIM.push(dt => g.scale.lerp(_v.setScalar(1), 1 - Math.exp(-dt * 8))); } },
  heart: { n: 'PLUSH HEART', p: 70, at: HP(-.05), dy: .09, b: g => { const r = cm('#ff4f8b', .95), t = ctx2(64, 32, c => { c.fillStyle = '#f7f4ec'; c.fillRect(0, 0, 64, 32); c.fillStyle = '#3a3d44'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = 'italic 500 13px "Chakra Petch",sans-serif'; c.fillText('from mom', 32, 16); });
    mesh(at(cyl(.0006, .0006, .05, 4), 0, -.025, 0), M.black, g); mesh([at(sph(.011), -.008, -.058, 0), at(sph(.011), .008, -.058, 0), at(new THREE.ConeGeometry(.0155, .02, 16), 0, -.07, 0, Math.PI)], r, g); mesh(new THREE.PlaneGeometry(.022, .011).translate(.012, -.085, .006), cm('#fff', .8, 0, { map: t.tex, side: THREE.DoubleSide }), g); },
    f: g => hang(g, .07, .4, 1) },
  horn: { n: 'JINGLE HORN', p: 80, pv: () => { const g = grp(cab, -.12, -.25, -.47); ITEMS.horn.d(g); return g; }, d: g => { const m = GOLD(); mesh([at(new THREE.ConeGeometry(.014, .03, 16, 1, true), .012, .02, 0, 0, 0, Math.PI / 2), at(cyl(.003, .003, .036), -.016, .02, 0, 0, 0, Math.PI / 2), at(sph(.005, 10, 8), -.034, .02, 0)], m, g); } },
  fuzz: { n: 'FUZZY DICE', p: 90, at: HP(.066), dy: .1, b: g => { const t = ctx2(64, 64, c => { c.fillStyle = '#ff6fb5'; c.fillRect(0, 0, 64, 64); for (let k = 0; k < 400; k++) { c.fillStyle = `rgba(255,255,255,${Math.random() * .25})`; c.fillRect(Math.random() * 64, Math.random() * 64, 2, 2); } c.fillStyle = '#fff'; for (const [x, y] of [[16, 16], [48, 48], [32, 32], [16, 48], [48, 16]]) { c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); } }), m = cm('#ffffff', 1, 0, { map: t.tex });
    mesh([at(cyl(.0007, .0007, .07, 4), -.008, -.035, 0, 0, 0, -.12), at(cyl(.0007, .0007, .05, 4), .009, -.025, 0, 0, 0, .2)], M.black, g); mesh([at(box(.03, .03, .03), -.014, -.084, 0, .3, .5, .1), at(box(.03, .03, .03), .017, -.062, .004, .2, -.4, .3)], m, g); },
    f: g => { hang(g, .08, -.3, 1.1); DICE.visible = false; } },
  goat: { n: 'GOAT BOBBLEHEAD', p: 120, at: D(-.2, -.7), b: g => { const w = W1(), hn = cm('#e8c98f', .6); mesh(at(cyl(.02, .022, .005, 20), 0, .0025, 0), cm('#ff2d8a', .5), g);
    mesh([at(box(.02, .022, .036), 0, .03, 0), ...[-1, 1].flatMap(s => [at(box(.006, .02, .006), s * .006, .013, .012), at(box(.006, .02, .006), s * .006, .013, -.012)])], w, g); mesh(at(cyl(.0015, .0015, .012, 6), 0, .046, .014), M.alu, g);
    const h = g.head = grp(g, 0, .054, .016); mesh([at(box(.017, .016, .02), 0, 0, .004), at(box(.012, .009, .01), 0, -.004, .016), at(box(.012, .003, .005), -.012, .004, 0, 0, 0, -.3), at(box(.012, .003, .005), .012, .004, 0, 0, 0, .3)], w, h);
    mesh([at(new THREE.ConeGeometry(.0025, .016, 6), -.005, .014, -.002, -.5), at(new THREE.ConeGeometry(.0025, .016, 6), .005, .014, -.002, -.5)], hn, h); mesh([at(sph(.0022, 8, 6), -.0075, .003, .013), at(sph(.0022, 8, 6), .0075, .003, .013)], M.black, h); mesh(at(box(.004, .009, .004), 0, -.012, .019), cm('#d8d0c4', .9), h); },
    f: g => { look(g, 0, .6); const s = bob(g.head); tapAt(g, () => { s.va += 14; s.vb += 8; sfx('grab'); }); } },
  cat: { n: 'LUCKY CAT', p: 150, at: D(.44, -.72), b: g => { const w = W1(); mesh([at(sph(.02).scale(1, 1.1, .85), 0, .02, 0), at(sph(.016), 0, .05, 0), at(new THREE.ConeGeometry(.006, .011, 4), -.009, .064, 0), at(new THREE.ConeGeometry(.006, .011, 4), .009, .064, 0)], w, g);
    mesh(at(tor(.0125, .0022, 20, 6), 0, .035, 0, Math.PI / 2), cm('#e3372e', .5), g); mesh([at(sph(.0032, 8, 6), 0, .031, .015), at(box(.016, .022, .002), -.006, .018, .019)], GOLD(), g); mesh([at(box(.006, .0013, .002), -.006, .052, .0155), at(box(.006, .0013, .002), .006, .052, .0155)], M.black, g);
    g.paw = grp(g, .016, .04, .006); mesh(at(box(.008, .02, .008), 0, .01, 0), w, g.paw); }, f: g => { look(g, 0); ANIM.push(() => { g.paw.rotation.z = -.2 + Math.sin(T * 5) * .45; }); } },
  neon: { n: 'NEON KIT', p: 180, pv: () => { const g = grp(cab); mesh([at(box(1.36, .006, .006), CX, -.405, -.8), at(box(.006, .006, .9), -.322, -.21, -.4), at(box(.006, .006, .9), mir(-.322), -.21, -.4)], M.neon, g); return g; }, d: g => { mesh([at(tor(.022, .003, 28, 6), 0, .03, 0), at(box(.05, .004, .004), 0, .004, 0)], M.neon, g); },
    x: () => { mesh([at(box(1.36, .006, .006), CX, -.405, -.8), at(box(.006, .006, .9), -.322, -.21, -.4), at(box(.006, .006, .9), mir(-.322), -.21, -.4)], M.neon); ANIM.push(() => M.neon.color.setHSL(T * .12 % 1, 1, .62)); } },
  disco: { n: 'DISCO BALL', p: 200, at: HP(.024), dy: .09, b: g => { mesh(at(cyl(.0006, .0006, .05, 4), 0, -.025, 0), M.black, g); g.ball = mesh(at(new THREE.IcosahedronGeometry(.018, 1), 0, 0, 0), cm('#e9ecf2', .12, 1, { flatShading: true }), g); g.ball.position.y = -.066; },
    f: g => { hang(g, .066, 0, 1.2); ANIM.push(() => { g.ball.rotation.y = T * 1.4; }); } },
  turbo: { n: 'TURBO · +SPEED', p: 220, at: [-.25, -.165, -.69], b: g => { const t = ctx2(128, 128, c => { c.fillStyle = '#07080a'; c.fillRect(0, 0, 128, 128); c.strokeStyle = '#ff2d8a'; c.lineWidth = 6; c.beginPath(); c.arc(64, 70, 46, Math.PI * .8, Math.PI * 2.2); c.stroke(); c.fillStyle = '#f3f1ea'; c.textAlign = 'center'; c.font = 'italic 700 20px "Chakra Petch",sans-serif'; c.fillText('BOOST', 64, 104); });
    mesh(at(cyl(.024, .026, .028, 24), 0, 0, -.014, Math.PI / 2), M.black, g); mesh(tor(.024, .003, 28, 6), M.alu, g); mesh(new THREE.CircleGeometry(.022, 24).translate(0, 0, .001), lit({ map: t.tex }), g); mesh(at(cyl(.003, .003, .035), 0, -.03, -.01), M.black, g);
    g.nd = grp(g, 0, -.002, .003); mesh(at(box(.019, .0018, .001), .008, 0, 0), lit({ color: '#ff5a1f' }), g.nd); },
    f: g => { look(g); let a = 0; ANIM.push(dt => { a += ((P.boost > 0 ? 1 : P.vf / CFG.VMAX * .7) - a) * (1 - Math.exp(-dt * 6)); g.nd.rotation.z = 3.6 - a * 4.3; }); }, x: () => { CFG.VMAX += 3; } },
  gold: { n: 'GOLD WHEEL', p: 300, pv: () => { const g = grp(wheelS); mesh(tor(CFG.WHEEL.R, .019, 64, 10), GOLD(), g); return g; }, d: g => { const m = GOLD(); mesh([at(tor(.025, .0045, 32, 8), 0, .03, 0), at(box(.05, .004, .004), 0, .03, 0), at(box(.004, .025, .004), 0, .018, 0)], m, g); },
    x: () => { M.rim.color.set('#ffc93c'); M.rim.metalness = 1; M.rim.roughness = .26; } },
  // ── real interior upgrades: they go where they belong, and they change how the cabin feels
  star: { n: 'STARLIGHT ROOF', p: 260, host: () => grp(cab), b: g => { const lin = new THREE.Mesh(new THREE.PlaneGeometry(1.36, .8).rotateX(Math.PI / 2).translate(CX, .41, -.04), new THREE.MeshBasicMaterial({ color: '#130b2e', side: THREE.DoubleSide })); g.add(lin); // a velvet headliner over your head, and two hundred fibre-optic stars in it
    const n = 220, pos = new Float32Array(n * 3), rr = new Float32Array(n); for (let i = 0; i < n; i++) { const x = rand(-.3, 1.02); pos.set([x, .405 - (x - CX) ** 2 * .04, rand(-.42, .34)], i * 3); rr[i] = Math.random(); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('aR', new THREE.BufferAttribute(rr, 1));
    const pts = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms: { uTime: UW.uTime, uNight: UW.uNight }, ...ADD, vertexShader: `attribute float aR;varying float vR;void main(){vR=aR;vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;gl_PointSize=(2.+aR*3.)*1.6/max(-mv.z,.2);}`,
      fragmentShader: `uniform float uTime,uNight;varying float vR;void main(){float d=length(gl_PointCoord-.5)*2.,tw=.55+.45*sin(uTime*(1.+vR*3.)+vR*40.);gl_FragColor=vec4(mix(vec3(1.,.8,.95),vec3(.75,.85,1.),vR)*smoothstep(1.,0.,d)*tw*(.55+.7*uNight),0.);}` })); pts.frustumCulled = false; g.add(pts); } },
  fur: { n: 'FUR WHEEL', p: 180, host: () => grp(wheelS), b: g => { const geo = new THREE.TorusGeometry(CFG.WHEEL.R, .026, 18, 140), p = geo.attributes.position, n = geo.attributes.normal; for (let i = 0; i < p.count; i++) { const k = .002 + Math.random() * .006; p.setXYZ(i, p.getX(i) + n.getX(i) * k, p.getY(i) + n.getY(i) * k, p.getZ(i) + n.getZ(i) * k); } geo.computeVertexNormals(); mesh(geo, cm('#ff9fd0', .95), g); } }, // shaggy, pink, ridiculous
  chrome: { n: 'CHROME GAUGES', p: 140, host: () => grp(cluster), b: g => { const m = cm('#f4f6ff', .1, 1); for (const s of [-1, 1]) mesh(at(tor(DIALR + .008, .0048, 56, 10), s * DIALX, -.006, .017), m, g); } },
  mat: { n: 'LEOPARD DASH MAT', p: 150, host: () => { const g = grp(cab, CX + .1, -.2, -.79); g.rotation.x = .07; return g; }, b: g => { const t = artTex(512, 160, c => { c.fillStyle = '#ffb3d9'; c.fillRect(0, 0, 512, 160); for (let k = 0; k < 90; k++) { const x = rand(0, 512), y = rand(0, 160), r = rand(5, 11); c.fillStyle = '#ff7fbf'; c.beginPath(); c.ellipse(x, y, r * 1.3, r, rand(0, 3), 0, 7); c.fill(); c.strokeStyle = '#3a1240'; c.lineWidth = rand(2.5, 4); c.beginPath(); c.arc(x, y, r * 1.2, rand(0, 3), rand(3.5, 6)); c.stroke(); } });
    mesh(at(box(.84, .004, .23), 0, 0, 0), cm('#ffffff', .95, 0, { map: t }), g); } },
  lava: { n: 'LAVA LAMP', p: 160, host: () => grp(cab, .8, -.205, -.71), b: g => { mesh([at(new THREE.CylinderGeometry(.008, .018, .028, 20), 0, .014, 0), at(new THREE.CylinderGeometry(.014, .008, .018, 20), 0, .1, 0)], cm('#c8ccdc', .2, 1), g);
    const gl = new THREE.Mesh(sph(1, 20, 14).scale(.016, .036, .016).translate(0, .064, 0), new THREE.MeshBasicMaterial({ color: '#ff4fa3', transparent: true, opacity: .45, depthWrite: false })); g.add(gl); g.bl = [0, 1, 2].map(k => mesh(sph(.006 + k * .0015, 12, 8), lit({ color: '#ffd23f' }), g)); },
    f: g => ANIM.push(() => g.bl.forEach((b, k) => { b.position.set(Math.sin(T * .5 + k) * .003, .064 + Math.sin(T * (.45 + k * .13) + k * 2.1) * .025, 0); b.scale.setScalar(1 + Math.sin(T * 1.3 + k) * .2); })) }, // the blobs rise and sink, forever
};
function install(id) { const it = ITEMS[id]; let g = null; if (it.host) { g = it.host(); it.b(g); if (it.f) it.f(g); } else if (it.at) { g = grp(cab, ...it.at); it.b(g); if (it.f) it.f(g); } if (it.x) it.x(); return g; }
// ── the shop, VR first: every upgrade you don't own yet appears as a hologram exactly where it would go. Tap it and it's real. Paint comes as a fan of swatches: tap to try the colours on your whole cabin, tap again to buy
const HOLO = new THREE.ShaderMaterial({ uniforms: { uTime: UW.uTime }, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
  vertexShader: `varying vec3 vN,vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
  fragmentShader: `uniform float uTime;varying vec3 vN,vV;void main(){float f=pow(1.-abs(dot(normalize(vN),vV)),2.),s=.65+.35*step(.5,fract(gl_FragCoord.y*.2-uTime*3.));gl_FragColor=vec4(mix(vec3(1.,.3,.7),vec3(.4,.9,1.),f)*(.18+.75*f)*s*(.85+.15*sin(uTime*23.)),1.);}` }); // see-through, scanlined, a little unstable
const THEMES = [{ id: 'lav', n: 'LAVENDER', p: 0, c: ['#6a52cc', '#8b6ff0', '#3a2a6c', '#ff4fa3', '#3d2c72', '#ff8cc6'] }, { id: 'gum', n: 'BUBBLEGUM', p: 120, c: ['#ff7cbd', '#ff4f9e', '#5b2a86', '#ffffff', '#7a2456', '#ffd1e8'] },
  { id: 'mint', n: 'MINT CHIP', p: 120, c: ['#4fd1b0', '#8ff0d8', '#1f5a5a', '#ff6fb5', '#21494a', '#fff2b0'] }, { id: 'blue', n: 'BLUEBERRY', p: 140, c: ['#4f7cff', '#7fd0ff', '#1d2a6e', '#ffe14d', '#1b2252', '#ff9fd0'] },
  { id: 'lemon', n: 'LEMON', p: 140, c: ['#ffd84f', '#fff1a0', '#6a4a12', '#ff4fa3', '#5a3a10', '#7fd0ff'] }, { id: 'night', n: 'MIDNIGHT', p: 180, c: ['#2a1d4a', '#4a2f86', '#120c26', '#ff2d8a', '#1a1030', '#4fe0ff'] }], TKEYS = ['dash', 'soft', 'frame', 'rim', 'leather', 'tan'], TGT = {};
const ownTheme = id => id === 'lav' || has('theme:' + id);
function setTheme(id) { const th = THEMES.find(t => t.id === id) || THEMES[0]; TKEYS.forEach((k, i) => { TGT[k] = col(k === 'rim' && has('gold') ? '#ffc93c' : th.c[i]); }); }
ANIM.push(dt => TKEYS.forEach(k => TGT[k] && M[k].color.lerp(TGT[k], 1 - Math.exp(-dt * 5)))); // the paint washes over the cabin
const tagTex = (a, b, hot) => artTex(256, 96, c => { c.fillStyle = hot ? '#ff2d8a' : '#fff6fb'; c.beginPath(); c.roundRect(4, 4, 248, 88, 18); c.fill(); c.strokeStyle = ink; c.lineWidth = 6; c.stroke(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = hot ? '#fff' : ink; c.font = `700 ${a.length > 14 ? 21 : 25}px "Chakra Petch",sans-serif`; c.fillText(a, 128, 32, 236); c.fillStyle = hot ? '#fff' : '#ff2d8a'; c.font = 'italic 800 30px Unbounded,sans-serif'; c.fillText(b, 128, 66, 236); });
function shopOpen() { SHOP.open = 1; SHOP.t = T; SHOP.slots = []; SHOP.pv = null; const box3 = new THREE.Box3();
  for (const id of Object.keys(ITEMS).filter(k => !has(k))) { const it = ITEMS[id]; let g; if (it.pv) g = it.pv(); else if (it.host) { g = it.host(); it.b(g); } else if (it.at && it.b) { g = grp(cab, ...it.at); it.b(g); } else continue;
    g.traverse(o => { if (o.isMesh) { if (o.material === INK || (o.material && o.material.side === THREE.BackSide && o.parent && o.parent.isMesh)) o.visible = false; else o.material = HOLO; } });
    g.updateWorldMatrix(true, true); box3.setFromObject(g); const c = rig.worldToLocal(box3.getCenter(new V())), tag = mesh(new THREE.PlaneGeometry(.11, .041), lit({ map: tagTex(it.n, it.p + '¢'), transparent: true }), cab); tag.position.copy(c).add(_v.set(0, .06, .035)); look(tag);
    SHOP.slots.push({ id, g, c, tag, cool: 0 }); }
  SHOP.fan = grp(cab, .72, -.1, -.42); look(SHOP.fan, .6); SHOP.cards = THEMES.map((th, k) => { const pv = grp(SHOP.fan), a = (k - 2.5) * .3; pv.rotation.z = -a; const card = mesh(new THREE.PlaneGeometry(.045, .07).translate(0, .085, 0), lit({ map: null, transparent: true }), pv); card.position.z = k * .0008; return { th, pv, card }; }); paintCards();
  sfx('arrive'); say('TAP A HOLOGRAM TO BUY · TAP A SWATCH TO PAINT', 3); }
function paintCards() { SHOP.cards.forEach(({ th, card }) => { const own = ownTheme(th.id), cur = (SHOP.pv || SAVE.theme || 'lav') === th.id;
  card.material.map = artTex(128, 200, c => { c.fillStyle = '#fffaf2'; c.beginPath(); c.roundRect(3, 3, 122, 194, 12); c.fill(); c.strokeStyle = cur ? '#ff2d8a' : ink; c.lineWidth = cur ? 9 : 5; c.stroke(); th.c.slice(0, 4).forEach((h, i) => { c.fillStyle = h; c.fillRect(14, 14 + i * 26, 100, 26); }); c.strokeStyle = ink; c.lineWidth = 3; c.strokeRect(14, 14, 100, 104);
    c.fillStyle = ink; c.textAlign = 'center'; c.font = '700 19px "Chakra Petch",sans-serif'; c.fillText(th.n, 64, 146, 116); c.fillStyle = own ? '#2fbf8f' : '#ff2d8a'; c.font = 'italic 800 22px Unbounded,sans-serif'; c.fillText(own ? (cur ? '✓ ON' : 'OWNED') : SHOP.pv === th.id ? 'TAP = BUY' : th.p + '¢', 64, 180, 116); }); card.material.needsUpdate = true; }); }
function shopClose() { if (!SHOP.open) return; SHOP.slots.forEach(s => { s.g.parent && s.g.parent.remove(s.g); cab.remove(s.tag); }); if (SHOP.fan) cab.remove(SHOP.fan); SHOP.slots = []; SHOP.cards = []; SHOP.open = 0; SHOP.pv = null; setTheme(SAVE.theme); }
function buy(k) { const s = SHOP.slots[k]; if (!s || T < s.cool) return; s.cool = T + .8; const it = ITEMS[s.id];
  if (SAVE.coins < it.p) { sfx('nope'); say(`NEED ${it.p - SAVE.coins}¢ MORE`, 1.6); return; }
  SAVE.coins -= it.p; SAVE.own.push(s.id); save(); s.g.parent && s.g.parent.remove(s.g); cab.remove(s.tag); SHOP.slots.splice(k, 1); sfx('buy'); burst(s.c.clone(), 40, 1.6); install(s.id); if (s.id === 'gold') setTheme(SAVE.theme); say(it.n, 2); }
function swatch(th) { if (ownTheme(th.id)) { SAVE.theme = th.id; SHOP.pv = null; save(); setTheme(th.id); sfx('click'); }
  else if (SHOP.pv === th.id) { if (SAVE.coins < th.p) { sfx('nope'); say(`NEED ${th.p - SAVE.coins}¢ MORE`, 1.6); return; } SAVE.coins -= th.p; SAVE.own.push('theme:' + th.id); SAVE.theme = th.id; SHOP.pv = null; save(); sfx('buy'); burst(SHOP.fan.position.clone(), 30, 1.4); say(th.n + ' INTERIOR', 2); }
  else { SHOP.pv = th.id; setTheme(th.id); sfx('whoosh', .4); } paintCards(); }
function updShop(dt) { const want = (G.phase === 'finish' && G.t > 6.3) || (G.pause === 1 && G.pauseT > .7); if (want && !SHOP.open) shopOpen(); else if (!want && SHOP.open) shopClose(); if (!SHOP.open) return;
  const pop = s01((T - SHOP.t) / .5); SHOP.slots.forEach((s, k) => { s.tag.scale.setScalar(.001 + pop); for (const h of PH) if (h.ok && !h.on) for (const t of h.tips) if (t.distanceTo(s.c) < .05) buy(k); if (SIM && KEY[String(k + 1)]) { KEY[String(k + 1)] = false; buy(k); } });
  SHOP.fan.scale.setScalar(.001 + pop * 1.7); SHOP.cards.forEach((cd, k) => { cd.card.getWorldPosition(_v4); rig.worldToLocal(_v4).add(_v3.set(0, .085, 0).applyQuaternion(cd.pv.getWorldQuaternion(_q))); for (const h of PH) if (h.ok && !h.on && T > (cd.cool || 0)) for (const t of h.tips) if (t.distanceTo(_v4) < .03) { cd.cool = T + .6; swatch(cd.th); break; } }); }

// ── the centre screen during the ceremony and the shop
function miniPrize(m, all) { if (!(G.phase === 'finish' || G.pause === 1)) return false; G.miniT = T + .06; m.fillStyle = '#160e36'; m.fillRect(0, 0, 512, 288); m.textBaseline = 'middle';
  all.forEach((r, k) => { const y = 26 + k * 33; if (r === P) { m.fillStyle = 'rgba(255,45,138,.22)'; m.fillRect(10, y - 15, 250, 30); } m.fillStyle = k < 3 ? ['#ffd23f', '#e2e7ef', '#e09a58'][k] : '#6f7480'; m.font = 'italic 700 22px "Chakra Petch",sans-serif'; m.textAlign = 'left'; m.fillText(k + 1, 20, y); m.fillStyle = r.hex; m.fillRect(46, y - 9, 8, 18); m.fillStyle = r === P ? '#fff' : '#c9ccd3'; m.font = `${r === P ? 700 : 500} 21px "Chakra Petch",sans-serif`; m.fillText(r.name, 64, y); });
  m.textAlign = 'left'; const L = (s, y, cl = '#c9ccd3', f = '500 20px') => { m.fillStyle = cl; m.font = `${f} "Chakra Petch",sans-serif`; m.fillText(s, 290, y); };
  if (SHOP.open) { L('UPGRADES', 30, '#ff2d8a', 'italic 700 30px'); L('tap a hologram · swatches paint', 76); L(G.pause ? 'START = drive on' : 'START = race again', 106); }
  else if (G.phase === 'finish') { L('PRIZE MONEY', 30, '#ffd23f', 'italic 700 30px'); const e = G.earn; [[`RACE · P${G.place}`, e.race], ['LAPS', e.laps], [`MIRRORS · ${SMIR.filter(q => q.on).length}/2`, e.mir]].forEach(([a, b], k) => { if (G.t > 1.6 + k * .35) { L(a, 76 + k * 30); m.textAlign = 'right'; m.fillStyle = '#fff'; m.fillText('+' + b, 496, 76 + k * 30); m.textAlign = 'left'; } }); }
  m.fillStyle = '#ffd23f'; m.font = 'italic 800 46px Unbounded,sans-serif'; m.textAlign = 'right'; m.fillText((G.phase === 'finish' && G.t < 4.4 ? G.shown : SAVE.coins) + '¢', 496, 238); return true; }

function prizeReset() { G.earn = { laps: 0, race: 0, mir: 0 }; G.slow = 0; G.newMedal = false; shopClose(); if (CER.g) { cab.remove(CER.g); CER.g = null; }
  DEB.length = 0; SMIR.forEach(m => { cab.add(m.o); m.o.position.copy(m.p); m.o.quaternion.copy(m.q); m.on = true; }); RIV.forEach(r => r.mir.forEach(m => { r.g.add(m.o); m.o.position.copy(m.p); m.o.quaternion.copy(m.q); m.o.scale.copy(m.s); m.on = true; })); }
function prizes(dt, sdt) { for (const d of DEB) { if (d.rest) continue; const o = d.m.o; d.v.y -= 9.8 * sdt; o.position.addScaledVector(d.v, sdt); o.rotation.x += d.w.x * sdt; o.rotation.y += d.w.y * sdt; o.rotation.z += d.w.z * sdt;
    if (o.position.y < d.gy) { o.position.y = d.gy; d.v.y *= -.32; d.v.x *= .55; d.v.z *= .55; d.w.multiplyScalar(.5); if (d.v.length() < .4) d.rest = 1; } }
  for (const f of ANIM) f(sdt); updConfetti(dt); updShop(dt); }
SAVE.own = SAVE.own.filter(k => ITEMS[k] || k.startsWith('theme:')); SAVE.own.filter(k => ITEMS[k]).forEach(install); setTheme(SAVE.theme || 'lav'); TKEYS.forEach(k => M[k].color.copy(TGT[k])); paintMedal(SAVE.medal); buildShelf();
