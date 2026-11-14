
// ═══════════════════════════ STARTING THE CAR: a key you hold, push in and twist; a car that jumps awake; and a stack of burned CDs floating in the air for you to flip through and feed to the player ═══════════════════════════
PH.forEach(h => { h.ctrl.addEventListener('selectstart', () => { h.held = true; }); h.ctrl.addEventListener('selectend', () => { h.held = false; }); h.tw = new V(1, 0, 0); h.pp = new V(); });
const toCab = (o, v) => cab.worldToLocal(o.localToWorld(v)), rigToCab = v => cab.worldToLocal(rig.localToWorld(v));
function handState(h) { const ctl = h.src && !h.src.hand, d = h.tips[0].distanceTo(h.tips[1]); h.pinch = ctl ? !!h.held : h.pinch ? d < .045 : d < .026; h.pp.addVectors(h.tips[0], h.tips[1]).multiplyScalar(.5); rigToCab(h.pp);
  if (ctl) { h.grip.updateMatrixWorld(); h.tw.set(1, 0, 0).transformDirection(h.grip.matrixWorld).applyQuaternion(_q.copy(rig.quaternion).invert()); } else h.tw.subVectors(h.tips[1], h.tips[0]); // the twist: thumb-to-index turns as the wrist turns
  h.pinchDown = h.pinch && !h.pinch0; h.pinchUp = !h.pinch && h.pinch0; h.pinch0 = h.pinch; }

// ── the screens sleep until the key wakes them
const SCR = []; cab.traverse(o => { const m = o.material; if (m && m.map && m.map === MIRC.tex) SCR.push(m); }); // the mirror sleeps; the middle screen stays lit to tell you what to do
let POWER = 1; const setPower = p => { POWER = p; SCR.forEach(m => m.color.setScalar(p)); };

// ── the key: pink plastic head, a notched blade, and the fob on its ring
const KN = new V(0, Math.sin(.38), Math.cos(.38)), KQ0 = new Qn().setFromUnitVectors(ZA, KN), KEYS = { state: 'float', ang: 0, auto: 0, g: grp(cab), hand: null, ref: 0, maxA: 0 };
{ const g = KEYS.g, pink = cm('#ff4fa3', .4); mesh([at(box(.0085, .0026, .032), 0, 0, -.016), at(box(.003, .0028, .006), .0035, 0, -.008), at(box(.003, .0028, .005), -.0035, 0, -.017), at(box(.003, .0028, .004), .0035, 0, -.025)], M.alu, g);
  mesh([at(cyl(.015, .015, .007, 24), 0, 0, .012), at(box(.012, .007, .008), 0, 0, .002)], pink, g); mesh(at(cyl(.008, .008, .0074, 20), 0, 0, .012), lit({ color: '#ffd6ea' }), g); mesh(at(tor(.006, .0013, 12, 6), 0, 0, .029, Math.PI / 2), M.alu, g);
  const t = ctx2(64, 64, c => { c.fillStyle = '#ff4fa3'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#fff'; c.font = 'italic 800 30px Unbounded,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('♥', 32, 34); });
  mesh(new THREE.CircleGeometry(.0075, 20).rotateX(-Math.PI / 2).translate(0, .0038, .012), lit({ map: t.tex }), g);
  KEYS.ring = grp(g, 0, 0, .031); KEYS.ring.add(FOB); FOB.position.set(0, -.004, 0); KEYS.home = new V(.3, -.11, -.4); }
const KG = KEYS.g, keyTip = () => _v3.set(0, 0, -.032).applyQuaternion(KG.quaternion).add(KG.position);
function keyInPose(a) { KG.position.copy(IGN).addScaledVector(KN, .004); KG.quaternion.copy(KQ0).multiply(_q.setFromAxisAngle(ZA, -a)); }
function keyReset() { KEYS.state = 'float'; KEYS.ang = KEYS.maxA = 0; KEYS.auto = 0; KEYS.hand = null; KG.position.copy(KEYS.home); setPower(.04); }
function updKey(dt) { const ph = G.phase;
  if (ph !== 'ready' && ph !== 'boot' && ph !== 'place') { if (KEYS.state !== 'in') { KEYS.state = 'in'; } keyInPose(KEYS.ang += (.75 * (ph === 'crank' && G.t < 1.1 ? 1.5 : 1) - KEYS.ang) * damp(dt, .08)); }
  else if (KEYS.auto) { const t = T - KEYS.auto; if (KEYS.state !== 'in') { KG.position.lerp(_v.copy(IGN).addScaledVector(KN, .004), 1 - Math.exp(-dt * 10)); KG.quaternion.slerp(KQ0, 1 - Math.exp(-dt * 10)); if (t > .45) { KEYS.state = 'in'; sfx('keyin'); KEYS.at = T; } } else keyTurn(clamp((T - KEYS.at - .3) / .7, 0, 1) * 1.1); }
  else if (KEYS.state === 'float') { KG.position.set(KEYS.home.x, KEYS.home.y + Math.sin(T * 2) * .008, KEYS.home.z); KG.quaternion.setFromEuler(_e.set(-.5, T * 1.2, .25)); if (T % 1.2 < dt) burst(KG.position.clone(), 2, .4);
    for (const h of PH) if (h.ok && h.pinchDown && h.pp.distanceTo(KG.position) < .07) { KEYS.state = 'held'; KEYS.hand = h; sfx('grab'); break; } }
  else if (KEYS.state === 'held') { const h = KEYS.hand; if (!h.ok || !h.pinch) { KEYS.state = 'float'; KEYS.hand = null; sfx('pop'); return; }
    _q.setFromUnitVectors(ZA, _v.copy(h.pp).sub(IGN).normalize()); KG.quaternion.slerp(_q, 1 - Math.exp(-dt * 12)); KG.position.copy(h.pp).sub(_v.set(0, 0, .012).applyQuaternion(KG.quaternion)); // it points itself at the ignition as you bring it close
    if (keyTip().distanceTo(IGN) < .045) { KEYS.state = 'in'; KEYS.hand = null; sfx('keyin'); KEYS.at = T; P.shake = .15; } }
  else if (KEYS.state === 'in') { let h = KEYS.hand; if (!h) { for (const q of PH) if (q.ok && q.pinchDown && q.pp.distanceTo(KG.position) < .07) { h = KEYS.hand = q; KEYS.ref = twistAng(q); KEYS.base = KEYS.ang; } }
    else if (!h.ok || !h.pinch) KEYS.hand = h = null; let a = h ? clamp(KEYS.base + Math.abs(wrapPi(twistAng(h) - KEYS.ref)), 0, 1.15) : KEYS.ang * Math.exp(-dt * 3); keyTurn(a); } }
function _ring() { KEYS.ring.quaternion.copy(KG.quaternion).invert(); } // the fob hangs straight down whatever the key does
function twistAng(h) { const v = _v.copy(h.tw), n = _v2.copy(KN); v.addScaledVector(n, -v.dot(n)); const u = _v3.set(1, 0, 0).applyQuaternion(KQ0), w = _v4.crossVectors(n, u); return Math.atan2(v.dot(w), v.dot(u)); }
function keyTurn(a) { const p = KEYS.ang; KEYS.ang = a; keyInPose(a); KEYS.maxA = Math.max(KEYS.maxA, a);
  if (p < .35 && a >= .35) { sfx('detent', 1); setPower(.35); } if (p < .7 && a >= .7) { sfx('detent', 1.3); setPower(1); sfx('beep2'); } // ACC: the screens glow. ON: everything wakes, beep-beep
  if (a >= 1.05 && G.phase === 'ready') { setPhase('crank'); sfx('starter'); KEYS.hand = null; } }

// ── the car jumps awake: a hop, a backfire, the neon flashes, sparkles out of the vents
const HOP = { y: 0, v: 0, r: 0, vr: 0 };
function ignitionFx() { HOP.v = .55; HOP.vr = -1.6; sfx('backfire'); setPower(1); for (const x of [.6, .93]) burst(new V(x, -.268, -.545), 14, 1.4); burst(new V(CX, -.2, -.7), 10, 2.2); NEONF = 1; }
let NEONF = 0;
function updHop(dt) { HOP.v += (-260 * HOP.y - 7 * HOP.v) * dt; HOP.y += HOP.v * dt; HOP.vr += (-200 * HOP.r - 6 * HOP.vr) * dt; HOP.r += HOP.vr * dt; 
  const fu = (215 - 100 * (.78 + Math.sin(T * .3) * .01)) * Math.PI / 180, te = (215 - 100 * (G.engine ? Math.min(.55, .2 + (T % 600) * .01) : 0)) * Math.PI / 180; subN[0].rotation.z = fu; subN[1].rotation.z += (te - subN[1].rotation.z) * .02; // fuel and temperature
  const bl = Math.sin(T * 9) > 0, st = IN.steer || 0; TELL[0].material.color.set('#7dff9a').multiplyScalar(st > .45 && bl ? 1 : .12); TELL[1].material.color.set('#7dff9a').multiplyScalar(st < -.45 && bl ? 1 : .12); TELL[2].material.color.set('#ff4fa3').multiplyScalar(SMIR.some(q => !q.on) && bl ? 1 : .12); // blinkers when you lean on the wheel; a warning lamp when a mirror is gone
  cab.position.y = HOP.y; tilt.position.y = HOP.y; cab.rotation.x = HOP.r * .05; tilt.rotation.x += HOP.r * .05; NEONF = Math.max(0, NEONF - dt * 1.5); if (NEONF > 0 && !has('neon')) M.neon.color.set('#ff5fb8').lerp(_c.set('#ffffff'), NEONF); }

// ── the CDs. Burned discs, marker on the label side, rainbow on the back, and the light running across them as you move your head
const CDV = `varying vec2 vUv;varying vec3 vN,vP,vR;void main(){vUv=uv;vN=normalize(mat3(modelMatrix)*normal);vec4 w=modelMatrix*vec4(position,1.);vP=w.xyz;vR=normalize(mat3(modelMatrix)*vec3(position.xy,0.)+1e-6);gl_Position=projectionMatrix*viewMatrix*w;}`;
const CDF = `uniform sampler2D map;uniform float uGlow;varying vec2 vUv;varying vec3 vN,vP,vR;
vec3 hue(float h){return clamp(abs(mod(h*6.+vec3(0.,4.,2.),6.)-3.)-1.,0.,1.);}
void main(){float r=length(vUv-.5)*2.;if(r<.125)discard;vec3 N=normalize(vN);if(!gl_FrontFacing)N=-N;vec3 V=normalize(cameraPosition-vP),R=normalize(vR),Tn=normalize(cross(N,R));
  vec3 rf=reflect(-V,N),L1=normalize(vec3(.4,1.,.6)),L2=normalize(vec3(-.7,.3,.5));float fr=pow(1.-max(dot(N,V),0.),3.);
  vec3 env=mix(vec3(.42,.36,.6),vec3(1.,.95,1.),smoothstep(-.3,.7,rf.y))+vec3(1.,.85,.95)*pow(max(dot(rf,L1),0.),60.)*1.5; // the room and a light, smeared over the mirror
  float s1=pow(1.-abs(dot(Tn,normalize(V+L1))),18.),s2=pow(1.-abs(dot(Tn,normalize(V+L2))),18.);vec3 rb=hue(fract(dot(normalize(V+L1),R)*2.5+r*1.7))*s1+hue(fract(dot(normalize(V+L2),R)*2.5+r*1.7+.33))*s2; // diffraction: rainbow streaks that follow your eye
  vec3 c;if(gl_FrontFacing){c=vec3(.9,.92,.98)*env*1.05+rb*.6+fr*.3;vec4 m=texture2D(map,vUv);c=mix(c,m.rgb,m.a*.95);}else c=vec3(.2,.13,.45)*env*.8+rb*1.1+vec3(.3,.2,.6)*fr+hue(fract(r*3.+dot(V,R)))*.12;
  if(r<.3)c=mix(vec3(.66,.7,.8)*env*.7,c,smoothstep(.285,.3,r));if(r<.19)c=vec3(.75,.8,.9)*(.55+.45*env.r);c*=r>.985?.65:1.;c+=vec3(1.,.4,.8)*uGlow*(.25+.25*sin(r*40.));gl_FragColor=vec4(c,1.);}`;
const CDL = [['sunday drive', 'mix for the car ♥', '#111'], ['night shift', 'kyst radio rips', '#111'], ['SUGAR RUSH!!', 'do not scratch', '#111'], ["beach tape '03", 'summer w/ the girls', '#111'], ['turbo hearts', 'FAST songs only', '#111']];
const cdLabel = k => ctx2(512, 512, c => { const [a, b] = CDL[k]; c.clearRect(0, 0, 512, 512); c.save(); c.translate(256, 256); c.rotate((k - 2) * .12); c.fillStyle = '#16121e'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.font = `700 ${a.length > 12 ? 62 : 74}px ${HAND}`; c.fillText(a, 0, -130, 400); c.font = `600 40px ${HAND}`; c.fillText(b, 0, -72, 380);
  c.lineWidth = 3.5; c.strokeStyle = '#16121e'; c.lineCap = 'round'; for (let i = 0; i < 4; i++) { const y = 96 + i * 30; c.font = `600 26px ${HAND}`; c.textAlign = 'left'; c.fillText((i + 1) + '.', -150, y); c.beginPath(); c.moveTo(-118, y); for (let x = 0; x < 200 + (i * 37) % 80; x += 10) c.lineTo(-118 + x, y + Math.sin(x * .25 + i * 2 + k) * 4); c.stroke(); }
  c.lineWidth = 4; if (k % 2) { c.beginPath(); c.moveTo(150, -10); c.bezierCurveTo(120, -40, 160, -60, 150, -38); c.bezierCurveTo(140, -60, 180, -40, 150, -10); c.stroke(); } else { c.beginPath(); for (let i = 0; i < 10; i++) { const a2 = i / 10 * 6.283 - Math.PI / 2, r = i % 2 ? 9 : 22; c.lineTo(160 + Math.cos(a2) * r, -20 + Math.sin(a2) * r); } c.closePath(); c.stroke(); }
  c.fillStyle = 'rgba(40,40,60,.35)'; c.font = '600 15px "Chakra Petch",sans-serif'; c.textAlign = 'center'; c.fillText('CD-R  ·  700MB  ·  80 MIN', 0, 200); c.restore(); });
const CDGEO = new THREE.CircleGeometry(.06, 72), CDEDGE = new THREE.CylinderGeometry(.06, .06, .0012, 72, 1, true).rotateX(Math.PI / 2);
const CDS = { g: grp(cab, .1, .035, -.43), items: [], sel: 2, vel: 0, state: 'off', t: 0, held: null, hand: null, drag: null }; look(CDS.g); CDS.g.visible = false;
for (let k = 0; k < CDL.length; k++) { const o = new THREE.Group(), mat = new THREE.ShaderMaterial({ uniforms: { map: { value: cdLabel(k).tex }, uGlow: { value: 0 } }, vertexShader: CDV, fragmentShader: CDF, side: THREE.DoubleSide });
  o.add(new THREE.Mesh(CDGEO, mat), new THREE.Mesh(CDEDGE, cm('#d8dcea', .3, 1))); CDS.g.add(o); CDS.items.push({ k, o, mat, x: 0, gone: 0 }); }
// the player: an aftermarket deck sitting on the console, chrome bezel, blue LED, a slot that wants a disc
const LED = ctex(256, 56), PL = grp(cab, .385, -.4, -.59); PL.rotation.x = -.55; PL.scale.setScalar(1.2);
{ mesh(at(box(.19, .052, .12), 0, 0, -.06), M.black, PL); mesh([at(box(.194, .004, .006), 0, .026, .002), at(box(.194, .004, .006), 0, -.026, .002), at(box(.004, .052, .006), -.097, 0, .002), at(box(.004, .052, .006), .097, 0, .002)], M.alu, PL);
  mesh(at(box(.13, .005, .004), 0, .014, .002), M.gloss, PL); PL.slotGlow = mesh(at(box(.13, .0015, .001), 0, .0105, .0045), lit({ color: '#ff4fa3' }), PL); mesh(new THREE.PlaneGeometry(.1, .022).translate(-.02, -.008, .0042), lit({ map: LED.tex }), PL);
  mesh([0, 1, 2].map(i => at(cyl(.0045, .0045, .004, 14), .052 + i * .013, -.011, .004, Math.PI / 2)), cm('#ff4fa3', .4), PL); mesh(at(cyl(.009, .009, .008, 20), .078, .007, .005, Math.PI / 2), M.alu, PL);
  const t = ctx2(256, 32, c => { c.fillStyle = '#d8dcea'; c.font = 'italic 800 20px Unbounded,sans-serif'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('NXT SOUND', 4, 16); c.font = '600 14px "Chakra Petch",sans-serif'; c.fillStyle = '#ff9fd0'; c.fillText('CD · MP3 · 4×50W', 150, 17); });
  mesh(new THREE.PlaneGeometry(.075, .0094).translate(-.055, -.0205, .0042), lit({ map: t.tex, transparent: true }), PL); }
const SLOT = () => toCab(PL, _v4.set(0, .014, .02));
let ledMsg = 'NO DISC', ledT = 0;
function drawLED() { const c = LED.ctx; c.fillStyle = '#04101a'; c.fillRect(0, 0, 256, 56); c.font = '700 30px "Chakra Petch",monospace'; c.textBaseline = 'middle'; c.shadowColor = '#5ff3ff'; c.shadowBlur = 10; c.fillStyle = POWER > .2 ? '#7ff6ff' : '#0c2a33';
  const w = c.measureText(ledMsg).width, x = w > 170 ? 6 - ((T * 60) % (w + 40)) : 6; c.textAlign = 'left'; c.save(); c.beginPath(); c.rect(0, 0, 182, 56); c.clip(); c.fillText(ledMsg, x, 29); if (w > 170) c.fillText(ledMsg, x + w + 40, 29); c.restore();
  if (RADIO.on && POWER > .2) { c.shadowColor = '#ff4fa3'; c.fillStyle = '#ff6fbf'; for (let i = 0; i < 7; i++) { const h = 6 + Math.abs(Math.sin(T * (5 + i * 1.7) + i)) * 34; c.fillRect(188 + i * 9, 50 - h, 6, h); } } c.shadowBlur = 0; LED.tex.needsUpdate = true; }

function cdOpen() { CDS.state = 'in'; CDS.t = 0; CDS.g.visible = true; CDS.sel = 2; CDS.vel = 0; CDS.items.forEach(it => { it.gone = 0; it.o.visible = true; it.o.parent !== CDS.g && CDS.g.attach(it.o); }); sfx('whirr'); say('PICK A CD', 2.5); }
function cdLayout(it, dt, k) { const o = it.k - CDS.sel, ao = Math.abs(o), s = Math.sign(o), m = Math.min(ao, 1); // Cover Flow: the one in front faces you, the rest stand on edge, stacked tight
  _v.set(s * (m * .085 + Math.max(ao - 1, 0) * .03), Math.sin(T * 1.6 + it.k) * .004, -m * .055 - Math.max(ao - 1, 0) * .01); _q.setFromEuler(_e.set(Math.sin(T * .9 + it.k) * .05, -s * m * 1.2, 0));
  const intro = clamp((CDS.t - it.k * .07) / .5, 0, 1); if (intro < 1) { _v.y -= (1 - intro) ** 2 * .35; _q.multiply(_q2.setFromAxisAngle(XA, (1 - intro) * 4)); }
  it.o.position.lerp(_v, 1 - Math.exp(-dt * k)); it.o.quaternion.slerp(_q, 1 - Math.exp(-dt * k)); it.o.scale.setScalar(Math.max(.001, (1 - m * .12) * clamp(1.2 - ao * .25, 0, 1) * (1 - it.gone))); }
const _e = new THREE.Euler();
function updCD(dt) { CDS.t += dt; drawLEDmaybe(); if (CDS.state === 'off') return;
  if (CDS.state === 'in' && CDS.t > .9) CDS.state = 'browse';
  if (CDS.state === 'in' || CDS.state === 'browse') { const n = CDS.items.length, s0 = Math.round(CDS.sel); let dragging = false;
    if (CDS.state === 'browse') for (const h of PH) { if (!h.ok) continue; const lp = CDS.g.worldToLocal(cab.localToWorld(_v2.copy(h.pp)));
      if (!CDS.held && h.pinchDown) { let best = null, bd = .065; for (const it of CDS.items) { const d = it.o.position.distanceTo(lp); if (d < bd) { bd = d; best = it; } } if (best) { CDS.held = best; CDS.hand = h; sfx('grab'); continue; } }
      if (CDS.held || h.pinch) continue; const tp = CDS.g.worldToLocal(cab.localToWorld(rigToCab(_v3.copy(h.tips[1]))));
      if (Math.abs(tp.y) < .09 && Math.abs(tp.z) < .08 && Math.abs(tp.x) < .28) { if (h.lx !== undefined && CDS.drag === h) { const dx = tp.x - h.lx; CDS.sel -= dx / .07; CDS.vel = lerp(CDS.vel, -dx / .07 / Math.max(dt, .008), .4); dragging = true; } CDS.drag = h; h.lx = tp.x; } else if (CDS.drag === h) CDS.drag = null; }
    if (SIM) { if (KEY.arrowleft || KEY.a) { KEY.arrowleft = KEY.a = false; CDS.vel = -9; } if (KEY.arrowright || KEY.d) { KEY.arrowright = KEY.d = false; CDS.vel = 9; } }
    if (!dragging) { CDS.sel += CDS.vel * dt; CDS.vel *= Math.exp(-dt * 3.2); if (Math.abs(CDS.vel) < 2.5) { CDS.vel += (Math.round(CDS.sel) - CDS.sel) * 60 * dt; CDS.vel *= Math.exp(-dt * 5); } } // flick and it glides; slow down and it settles on a disc
    CDS.sel = clamp(CDS.sel, -.45, n - .55); const s1 = Math.round(CDS.sel); if (s1 !== s0) { sfx('tick', 1 + s1 * .05); ledMsg = '♪ ' + STATIONS[clamp(s1, 0, n - 1)].name; }
    if (IN.press && !CDS.held) { CDS.held = CDS.items[clamp(s1, 0, n - 1)]; CDS.hand = null; CDS.autoT = 0; } // a button or a trigger: it carries the front one in for you
    for (const it of CDS.items) { it.mat.uniforms.uGlow.value = 0; if (it !== CDS.held) cdLayout(it, dt, 9); } }
  const it = CDS.held; if (it && CDS.state === 'browse') { const h = CDS.hand, mouth = SLOT(); PL.slotGlow.material.color.set('#ff4fa3').multiplyScalar(1 + Math.sin(T * 12));
    if (h) { if (!h.ok || !h.pinch) { CDS.held = null; sfx('pop'); return; } const lp = CDS.g.worldToLocal(cab.localToWorld(_v2.copy(h.pp))); it.o.position.lerp(lp, 1 - Math.exp(-dt * 25)); it.o.quaternion.slerp(_q.identity(), 1 - Math.exp(-dt * 8)); it.o.scale.setScalar(1); }
    else { CDS.autoT += dt; const lp = CDS.g.worldToLocal(cab.localToWorld(_v2.copy(mouth))); it.o.position.lerp(lp, 1 - Math.exp(-dt * 6)); it.o.scale.setScalar(1); }
    it.mat.uniforms.uGlow.value = .6; it.o.getWorldPosition(_v3); cab.worldToLocal(_v3); const d = _v3.distanceTo(mouth); if (d < .11) ledMsg = 'INSERT ▶ ' + STATIONS[it.k].name; if (d < .075) cdEat(it); } // close enough and the player takes it out of your fingers
  if (CDS.state === 'eat') { const e = CDS.eat, t = CDS.t - e.t0, k1 = s01(t / .28), k2 = s01((t - .28) / .5); e.it.o.position.lerpVectors(e.p0, _v.set(0, .014, .03 - k2 * .13), k1); e.it.o.quaternion.slerpQuaternions(e.q0, e.q1, k1); // it lines up with the slot, then gets pulled in
    for (const o of CDS.items) if (o !== e.it) { o.gone = Math.min(1, o.gone + dt * 2.5); cdLayout(o, dt, 4); }
    if (t > .78 && e.it.o.visible) { e.it.o.visible = false; sfx('click'); ledMsg = 'READING...'; } if (t > 1.5 && !RADIO.on) { RADIO.on = true; RADIO.st = e.it.k; RADIO.next = 0; RADIO.step = 0; ledMsg = STATIONS[e.it.k].name + '  ·  TRK 01'; sfx('beep2'); say('♪ ' + STATIONS[e.it.k].name, 2); burst(SLOT().clone(), 16, 1.2); }
    if (t > 1.6) { CDS.state = 'done'; CDS.t = 0; CDS.g.visible = false; } } }
function cdEat(it) { CDS.state = 'eat'; CDS.held = null; CDS.eat = { it, t0: CDS.t }; PL.attach(it.o); CDS.eat.p0 = it.o.position.clone(); CDS.eat.q0 = it.o.quaternion.clone(); CDS.eat.q1 = new Qn().setFromAxisAngle(XA, -Math.PI / 2); sfx('eat'); P.shake = .1; it.mat.uniforms.uGlow.value = 0; }
function drawLEDmaybe() { if (T > ledT) { ledT = T + .05; if (RADIO.on && CDS.state !== 'eat') ledMsg = STATIONS[RADIO.st].name + '  ·  TRK 0' + (1 + (RADIO.step >> 7) % 9); if (!RADIO.on && CDS.state === 'off') ledMsg = POWER > .5 ? 'NO DISC' : ''; drawLED(); } }

// ── the middle screen while the car wakes up
function miniBoot(m) { const ph = G.phase; if (!(ph === 'ready' || ph === 'boot' || (ph === 'crank' && G.t < 2.8) || ph === 'cd')) return false; G.miniT = T + .05;
  m.fillStyle = '#160e36'; m.fillRect(0, 0, 512, 288); m.textAlign = 'center'; m.textBaseline = 'middle';
  if (ph === 'crank') { const k = s01(G.t / 2.2); m.fillStyle = '#ff2d8a'; m.fillRect(0, 0, 512, 288); m.font = 'italic 800 54px Unbounded,sans-serif'; m.lineWidth = 10; m.strokeStyle = '#1d1233'; m.lineJoin = 'round'; m.strokeText('SUNDAY', 256, 104); m.fillStyle = '#fff3a6'; m.fillText('SUNDAY', 256, 104); m.strokeText('DRIVER', 256, 166); m.fillStyle = '#fff'; m.fillText('DRIVER', 256, 166);
    m.fillStyle = '#1d1233'; m.fillRect(106, 222, 300, 16); m.fillStyle = '#5ff3ff'; m.fillRect(110, 226, 292 * k, 8); }
  else if (ph === 'cd') { m.fillStyle = '#5ff3ff'; m.font = 'italic 700 40px "Chakra Petch",sans-serif'; m.fillText('PICK A CD', 256, 100); m.fillStyle = '#c9b8ff'; m.font = '500 22px "Chakra Petch",sans-serif'; m.fillText('swipe through them · pinch one · feed the player', 256, 150); m.font = '700 40px "Chakra Petch",sans-serif'; m.fillStyle = '#ff4fa3'; m.fillText('◀   ' + (Math.round(CDS.sel) + 1) + ' / ' + CDS.items.length + '   ▶', 256, 210); }
  else { const inn = KEYS.state === 'in'; m.fillStyle = `rgba(255,79,163,${.75 + .25 * Math.sin(T * 5)})`; m.font = 'italic 800 46px Unbounded,sans-serif'; m.fillText(inn ? 'TURN THE KEY' : 'TAKE THE KEY', 256, 116); m.fillStyle = '#c9b8ff'; m.font = '500 24px "Chakra Petch",sans-serif'; m.fillText(inn ? 'pinch it and twist your wrist' : 'pinch it and put it in the ignition', 256, 176); }
  return true; }
function startFx(dt) { for (const h of PH) if (h.ok) handState(h); updKey(dt); _ring(); updCD(dt); updHop(dt); }
function startReset() { keyReset(); CDS.state = 'off'; CDS.g.visible = false; RADIO.on = false; ledMsg = ''; }
