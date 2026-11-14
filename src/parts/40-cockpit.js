
// ═══════════════════════════ THE COCKPIT: the only thing in your room. Dashboard, wheel, pillars, three panes of glass. No roof, no floor, no seats: those are yours ═══════════════════════════
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d), cyl = (a, b, h, s = 20) => new THREE.CylinderGeometry(a, b, h, s), sph = (r, w = 20, h = 14) => new THREE.SphereGeometry(r, w, h), tor = (R, r, s = 32, t = 10) => new THREE.TorusGeometry(R, r, t, s);
const at = (g, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) => g.applyMatrix4(new THREE.Matrix4().compose(new V(x, y, z), new Qn().setFromEuler(new THREE.Euler(rx, ry, rz)), new V(1, 1, 1)));
const cab = new THREE.Group(); rig.add(cab);
const CLIP = new THREE.Plane(new V(0, 0, -1), 1e4), CM = []; // the cockpit arrives front to back: a clipping plane sweeps through it
const cm = (color, rough = .7, metal = 0, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, envMapIntensity: .22, clippingPlanes: [CLIP], ...o }); CM.push(m); return m; };
const lit = (o = {}) => new THREE.MeshBasicMaterial({ toneMapped: false, clippingPlanes: [CLIP], ...o }); // things that glow by themselves: screens, needles, the start button
const mesh = (geos, mat, parent = cab) => { const m = new THREE.Mesh(Array.isArray(geos) ? mergeBufferGeometries(geos) : geos, mat); parent.add(m); return m; };
const grp = (parent, x = 0, y = 0, z = 0) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };
const bar = (a, b, t, d = t) => { const g = box(t, d, a.distanceTo(b)); g.applyQuaternion(new Qn().setFromUnitVectors(ZA, new V().subVectors(b, a).normalize())); return g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2); };
const uvRect = (g, u0, v0, u1, v1) => { const a = g.attributes.uv; for (let i = 0; i < a.count; i++) a.setXY(i, lerp(u0, u1, a.getX(i)), lerp(v0, v1, a.getY(i))); return g; };
scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
const M = { dash: cm('#17191d', .84, 0, { side: THREE.DoubleSide }), soft: cm('#23262c', .72), leather: cm('#1a1b1f', .5), alu: cm('#aeb4bc', .3, 1), black: cm('#0b0c0e', .4), gloss: cm('#040405', .06), rubber: cm('#0c0c0e', .92), tan: cm('#c0905c', .6), frame: cm('#1c1e23', .62), yellow: cm('#ffd21f', .5), red: cm('#d9281f', .35) };
const CX = CFG.CX, mir = x => 2 * CX - x; // the car's centre line, and a point mirrored across it

// ── dashboard: one profile swept door to door
{ const P = [[-1.02, -.235], [-.9, -.212], [-.72, -.198], [-.63, -.196], [-.59, -.203], [-.568, -.226], [-.56, -.27], [-.566, -.33], [-.59, -.366], [-.66, -.39], [-.8, -.4], [-1.02, -.4]], x0 = -.345, x1 = mir(-.345), pos = [], uv = [], idx = [];
  P.forEach(([z, y], i) => { pos.push(x0, y, z, x1, y, z); uv.push(0, i / P.length, 1, i / P.length); if (i < P.length - 1) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const cap = x => new THREE.ShapeGeometry(new THREE.Shape(P.map(p => new THREE.Vector2(p[0], p[1])))).rotateY(-Math.PI / 2).translate(x, 0, 0); mesh([g, cap(x0), cap(x1)], M.dash);
  const w = x1 - x0 - .03; mesh(at(box(w, .0035, .005), CX, -.1945, -.612), M.tan); mesh(at(box(w, .007, .004), CX, -.334, -.5635), M.alu); // a stitched seam along the brow, a metal strip along the face
  mesh(at(box(w, .0035, .004), CX, -.3415, -.5645), lit({ color: '#4fd2ff' }));                                                         // and a line of cabin light under it
  mesh([at(box(.5, .003, .018), CX - .3, -.2135, -.9), at(box(.5, .003, .018), CX + .3, -.2135, -.9), at(box(.3, .002, .002), .82, -.292, -.5605), at(box(.002, .05, .002), .67, -.317, -.563), at(box(.002, .05, .002), .97, -.317, -.563)], M.black); // demister slots, glovebox seams
  const vent = x => { mesh(at(tor(.034, .0055, 28), x, -.268, -.561, -.1), M.alu); mesh(at(cyl(.031, .031, .004, 24), x, -.268, -.565, Math.PI / 2 - .1), M.black); mesh([-.014, 0, .014].map(y => at(box(.058, .0035, .01), x, -.268 + y, -.56, -.45)), M.soft); };
  vent(-.25); vent(.6); vent(.93); mesh(at(sph(.018, 16, 8), CX, -.2, -.82), M.gloss); }
// ── pillars, header, door tops. Mirrored left to right
{ const L = [bar(new V(-.345, -.225, -.99), new V(-.285, .335, -.415), .075, .05), bar(new V(-.285, .335, -.415), new V(-.318, .385, .25), .05), bar(new V(-.34, -.24, .25), new V(-.318, .4, .25), .06, .07), at(box(.065, .05, 1.24), -.352, -.238, -.36)];
  const R = L.map(g => g.clone().applyMatrix4(new THREE.Matrix4().makeScale(-1, 1, 1)).translate(2 * CX, 0, 0)); R.forEach(g => { const i = g.index.array; for (let k = 0; k < i.length; k += 3) { const t = i[k]; i[k] = i[k + 1]; i[k + 1] = t; } });
  mesh([...L, ...R, at(box(1.33, .05, .1), CX, .348, -.4)], M.frame); mesh([at(box(.04, .012, .09), -.35, -.208, -.25), at(cyl(.006, .006, .03, 8), -.352, -.2, .12)], M.alu); }

// ── instruments. Two dials painted once, needles that are real, and a screen between them
const HUDC = ctex(512, 512), MINI = ctex(512, 288), MIRC = ctex(256, 64);
const cluster = grp(cab, 0, -.268, -.548); cluster.rotation.x = -CFG.WHEEL.tilt;
const needle = (x, c) => { const g = grp(cluster, x, -.012, .004); mesh(at(box(.052, .0034, .002), .021, 0, 0), lit({ color: c }), g); mesh(at(cyl(.009, .009, .004, 16), 0, 0, .002, Math.PI / 2), M.black, g); return g; };
{ const { ctx: c, tex } = ctex(1024, 376); c.fillStyle = '#07080a'; c.fillRect(0, 0, 1024, 376);
  const dial = (cx, max, step, lab, red, unit) => { const cy = 224, R = 157, ang = v => (225 - 270 * v / max) * Math.PI / 180;
    const g = c.createRadialGradient(cx, cy, 20, cx, cy, R + 14); g.addColorStop(0, '#15171c'); g.addColorStop(.85, '#0c0d10'); g.addColorStop(1, '#2b2e35'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R + 14, 0, 7); c.fill();
    c.lineCap = 'butt'; for (let v = 0; v <= max + .001; v += step / 2) { const a = ang(v), big = Math.abs(v / step - Math.round(v / step)) < .01, r0 = R - (big ? 24 : 12); c.strokeStyle = v >= red ? '#ff3b2f' : '#f3f1ea'; c.lineWidth = big ? 5 : 2.5; c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy - Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * R, cy - Math.sin(a) * R); c.stroke();
      if (big && Math.round(v / step) % lab === 0) { c.fillStyle = v >= red ? '#ff3b2f' : '#f3f1ea'; c.font = 'italic 700 27px "Chakra Petch",sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(String(Math.round(v)), cx + Math.cos(a) * (R - 46), cy - Math.sin(a) * (R - 46)); } }
    c.strokeStyle = '#ff3b2f'; c.lineWidth = 5; c.beginPath(); c.arc(cx, cy, R + 5, -ang(red), -ang(max)); c.stroke(); c.fillStyle = '#8b909a'; c.font = '500 19px "Chakra Petch",sans-serif'; c.fillText(unit, cx, cy + 74); };
  dial(187, 8, 1, 1, 6.5, 'x1000 rpm'); dial(837, 240, 20, 2, 999, 'km/h');
  mesh([at(box(.37, .15, .05), 0, 0, -.03), at(new THREE.CylinderGeometry(.192, .2, .13, 32, 1, true, Math.PI / 2, Math.PI).rotateX(Math.PI / 2).scale(1, .74, 1), 0, -.058, .03)], M.dash, cluster);
  mesh(new THREE.PlaneGeometry(.34, .125), lit({ map: tex }), cluster); mesh(uvRect(new THREE.PlaneGeometry(.118, .059), 0, .5, 1, 1).translate(0, -.006, .0015), lit({ map: HUDC.tex }), cluster); }
const needleR = needle(-.108, '#ff5a1f'), needleS = needle(.108, '#ff5a1f'), setNeedle = (n, v) => { n.rotation.z = (225 - 270 * clamp(v, 0, 1.03)) * Math.PI / 180; };

// ── the wheel. wheelS spins; the column and stalks do not
const WH = { rot: 0, c: new V(0, CFG.WHEEL.y, CFG.WHEEL.z), u: new V(1, 0, 0), v: new V(0, Math.cos(CFG.WHEEL.tilt), -Math.sin(CFG.WHEEL.tilt)), a: new V(0, Math.sin(CFG.WHEEL.tilt), Math.cos(CFG.WHEEL.tilt)), horn: 0 };
const wheelG = grp(cab, WH.c.x, WH.c.y, WH.c.z); wheelG.rotation.x = -CFG.WHEEL.tilt; const wheelS = grp(wheelG);
{ const R = CFG.WHEEL.R, { ctx: c, tex } = ctex(256, 256); c.fillStyle = '#16171a'; c.fillRect(0, 0, 256, 256); c.strokeStyle = '#8d939c'; c.lineWidth = 5; c.beginPath(); c.arc(128, 128, 104, 0, 7); c.stroke(); c.fillStyle = '#e9eaee'; c.font = 'italic 800 54px Unbounded,system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('NXT', 128, 122); c.fillStyle = '#ff3b2f'; c.fillRect(70, 160, 116, 7);
  mesh(tor(R, .0165, 64, 14), M.leather, wheelS); mesh(new THREE.TorusGeometry(R, .0173, 10, 8, .14).rotateZ(Math.PI / 2 - .07), M.yellow, wheelS); // twelve o'clock, so you can see how far you have turned it
  mesh([new THREE.TorusGeometry(R, .019, 10, 10, .5).rotateZ(-.25), new THREE.TorusGeometry(R, .019, 10, 10, .5).rotateZ(Math.PI - .25)], M.soft, wheelS); // grips at three and nine
  mesh([at(box(.13, .032, .012), -.115, -.004, -.008), at(box(.13, .032, .012), .115, -.004, -.008), at(box(.032, .125, .012), 0, -.115, -.008)], M.alu, wheelS);
  mesh(at(cyl(.058, .064, .04, 32), 0, 0, -.014, Math.PI / 2), M.black, wheelS); mesh(new THREE.CircleGeometry(.052, 32).translate(0, 0, .0065), cm('#ffffff', .55, 0, { map: tex }), wheelS);
  mesh(at(cyl(.03, .038, .25, 18), 0, 0, -.155, Math.PI / 2), M.dash, wheelG); mesh([at(cyl(.0065, .0065, .14, 8), -.1, .012, -.085, 0, 0, Math.PI / 2 - .2), at(cyl(.0065, .0065, .14, 8), .1, .012, -.085, 0, 0, Math.PI / 2 + .2), at(cyl(.009, .009, .03, 8), -.165, .026, -.085, 0, 0, Math.PI / 2 - .2), at(cyl(.009, .009, .03, 8), .165, .026, -.085, 0, 0, Math.PI / 2 + .2)], M.black, wheelG); }

// ── start button, centre screen, console with shifter and handbrake, mirror, and something hanging from it
const startG = grp(cab, CFG.START.x, CFG.START.y, CFG.START.z); startG.rotation.x = -.1; mesh(tor(.027, .0045, 32), M.alu, startG);
const startCap = (() => { const { ctx: c, tex } = ctex(128, 128); c.fillStyle = '#fff'; c.beginPath(); c.arc(64, 64, 64, 0, 7); c.fill(); c.fillStyle = '#16060a'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '700 17px "Chakra Petch",sans-serif'; c.fillText('ENGINE', 64, 36); c.font = 'italic 700 31px "Chakra Petch",sans-serif'; c.fillText('START', 64, 66); c.font = '700 17px "Chakra Petch",sans-serif'; c.fillText('STOP', 64, 95);
  const g = grp(startG); mesh(at(cyl(.0225, .0225, .01, 28), 0, 0, 0, Math.PI / 2), M.black, g); g.cap = mesh(new THREE.CircleGeometry(.0215, 28).translate(0, 0, .0055), lit({ map: tex, color: '#ff3b2f' }), g); return g; })();
{ const g = grp(cab, .385, -.272, -.55); g.rotation.x = -.12; mesh(at(box(.275, .168, .016), 0, 0, -.006), M.gloss, g); mesh(new THREE.PlaneGeometry(.25, .14).translate(0, 0, .003), lit({ map: MINI.tex }), g); }
const HB = { pull: 0, hold: -1, p: new V() }, hbG = grp(cab, CFG.HB.x, CFG.HB.y, CFG.HB.z);
{ mesh(bar(new V(.385, -.47, -.6), new V(.385, -.545, .08), .175, .09), M.soft); const top = z => -.425 - (z + .6) * .1136;
  mesh([at(cyl(.012, .034, .05, 16), .365, top(-.36) + .025, -.36), at(sph(.024), .365, top(-.36) + .135, -.36)], M.leather); mesh([at(cyl(.006, .006, .1, 8), .365, top(-.36) + .085, -.36), at(tor(.0245, .003, 20, 6), .365, top(-.36) + .123, -.36, Math.PI / 2)], M.alu);
  mesh([-.2, -.105].map(z => at(tor(.037, .004, 24, 6), .385, top(z) + .001, z, Math.PI / 2 + .113)), M.alu); mesh([-.2, -.105].map(z => at(cyl(.034, .034, .002, 20), .385, top(z), z, .113)), M.black);
  mesh(at(cyl(.0095, .0095, .13, 10), 0, 0, -.065, Math.PI / 2), M.alu, hbG); mesh(at(cyl(.0175, .0175, .105, 14), 0, 0, -.183, Math.PI / 2), M.leather, hbG); HB.btn = mesh(at(cyl(.0095, .0095, .016, 10), 0, 0, -.24, Math.PI / 2), M.red, hbG); HB.btn.material = cm('#d9281f', .35, 0, { emissive: '#ff3b2f', emissiveIntensity: 0 }); }
const mirrorG = grp(cab, CX, .262, -.5); mirrorG.rotation.set(.3, -.62, 0, 'YXZ'); mesh(at(box(.225, .07, .022), 0, 0, -.012), M.black, mirrorG); mesh(new THREE.PlaneGeometry(.21, .056), lit({ map: MIRC.tex }), mirrorG); mesh(bar(new V(CX, .262, -.515), new V(CX, .33, -.44), .014), M.black);
const fresh = grp(cab, CX, .222, -.512); // the little tree: a pendulum that swings with every corner
{ const { ctx: c, tex } = ctex(128, 192); c.clearRect(0, 0, 128, 192); c.fillStyle = '#35cfa8'; c.beginPath(); for (const [a, b, d] of [[64, 6, 26], [64, 46, 40], [64, 92, 54]]) { c.moveTo(a, b); c.lineTo(a + d, b + 62); c.lineTo(a - d, b + 62); } c.fill(); c.fillRect(54, 150, 20, 34); c.fillStyle = '#fff'; c.font = '800 22px Unbounded,sans-serif'; c.textAlign = 'center'; c.fillText('NXT', 64, 142);
  mesh(at(cyl(.0006, .0006, .06, 4), 0, -.03, 0), M.black, fresh); mesh(new THREE.PlaneGeometry(.05, .075).translate(0, -.095, 0), cm('#ffffff', .8, 0, { map: tex, alphaTest: .5, side: THREE.DoubleSide }), fresh); }
// things that hang: each is a real pendulum (its own length, so its own rhythm), pushed by the car's cornering and braking and shivered by the road
const PEND = [], hang = (g, L, yaw = 0, damp = 1.6) => { PEND.push({ g, L, yaw, damp, az: 0, ax: 0, vz: 0, vx: 0 }); return g; }; hang(fresh, .095, .5);
{ const dice = grp(cab, CX + .012, .222, -.512), { ctx: c, tex } = ctex(64, 64); c.fillStyle = '#f6f3ea'; c.fillRect(0, 0, 64, 64); c.fillStyle = '#d9281f'; for (const [x, y] of [[16, 16], [48, 48], [32, 32], [16, 48], [48, 16]]) { c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); }
  const dm = cm('#ffffff', .9, 0, { map: tex }); mesh([at(cyl(.0006, .0006, .07, 4), -.006, -.035, 0, 0, 0, -.12), at(cyl(.0006, .0006, .05, 4), .007, -.025, 0, 0, 0, .2)], M.black, dice); mesh([at(box(.021, .021, .021), -.011, -.078, 0, .3, .5, .1), at(box(.021, .021, .021), .013, -.058, .004, .2, -.4, .3)], dm, dice); hang(dice, .07, -.3, 1.2);
  // the key in the ignition, right of the column, with a ring, a leather fob and a brass tag
  const kx = .082, ky = -.338, kz = -.497; mesh([at(box(.022, .03, .006), kx, ky, kz + .012, -.38), at(tor(.011, .0012, 16, 6), kx, ky - .02, kz + .017, 0, Math.PI / 2)], M.alu); mesh(at(cyl(.013, .013, .006, 16), kx, ky, kz, Math.PI / 2 - .38), M.black);
  const fob = grp(cab, kx, ky - .03, kz + .017); mesh(at(box(.016, .055, .004), 0, -.03, 0), M.tan, fob); mesh(at(box(.017, .012, .005), 0, -.008, 0), M.alu, fob); hang(fob, .055, .2, 1.4);
  const tag = grp(cab, kx, ky - .03, kz + .017); mesh(at(cyl(.0005, .0005, .03, 4), 0, -.015, 0), M.alu, tag); mesh(at(cyl(.011, .011, .002, 16), 0, -.04, 0, Math.PI / 2), cm('#d8a64a', .3, 1), tag); hang(tag, .04, -.6, 1); }

// ── GLASS. The windscreen is a plane with its own (u,v) in metres; the masks and the dirt share one description of where the blades have been
const SHD = CFG.SHIELD, SU = new V(1, 0, 0), SV = new V(0, SHD.vy, SHD.vz).normalize(), SN = new V().crossVectors(SU, SV), SHH = Math.hypot(SHD.vy, SHD.vz), SQ = new Qn().setFromRotationMatrix(new THREE.Matrix4().makeBasis(SU, SV, SN));
const shieldPt = (a, b, off = 0, out = new V()) => out.set(SHD.x, SHD.y, SHD.z).addScaledVector(SU, a).addScaledVector(SV, b).addScaledVector(SN, off); // off > 0 is inside the car
const WP = CFG.WIPER, UG = { uSw: u(new V(WP.a0 - .06, 0, 0)), uBl: u(new THREE.Vector4(0, 1, WP.stroke, 99)), uWp: u(WP.p.map(p => new THREE.Vector2(p[0], p[1]))), uDust: u(1), uRain: u(0), uSplash: u(0), uRoll: u(0), uTime: UW.uTime };
const f3 = x => x.toFixed(3), GFN = `uniform vec3 uSw;uniform vec4 uBl;uniform vec2 uWp[2];
float wiped(vec2 p){float m=0.,g=uSw.y*1.7;for(int i=0;i<2;i++){vec2 d=p-uWp[i];float r=length(d),a=atan(d.y,d.x);
  m=max(m,smoothstep(${f3(WP.r0)}-g-.012,${f3(WP.r0)}-g,r)*(1.-smoothstep(${f3(WP.r1)}+g,${f3(WP.r1)}+g+.012,r))*smoothstep(${f3(WP.a0)}-.03-g*4.,${f3(WP.a0)}-g*4.,a)*(1.-smoothstep(uSw.x+g*4.,uSw.x+.03+g*4.,a)));}return m;}
float age(vec2 p){float t=99.;for(int i=0;i<2;i++){vec2 d=p-uWp[i];float r=length(d),a=(atan(d.y,d.x)-${f3(WP.a0)})/${f3(WP.a1 - WP.a0)},b=uBl.x;
  if(r>${f3(WP.r0)}&&r<${f3(WP.r1)}&&a>0.&&a<1.)t=min(t,uBl.y>0.?(a<b?(b-a)*uBl.z:(a+b)*uBl.z+uBl.w):(a>b?(a-b)*uBl.z:(2.-a-b)*uBl.z));}return t;}`; // seconds since a blade last passed this spot
const GVS = `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
const maskMat = fs => new THREE.ShaderMaterial({ uniforms: UG, vertexShader: GVS, fragmentShader: fs, colorWrite: false, depthWrite: false, stencilWrite: true, stencilRef: 1, stencilFunc: THREE.AlwaysStencilFunc, stencilZPass: THREE.ReplaceStencilOp });
const glassMat = fs => new THREE.ShaderMaterial({ uniforms: UG, vertexShader: GVS, fragmentShader: fs, ...PRE, side: THREE.DoubleSide });
const pane = (pts, uvs) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts.flatMap(p => [p.x, p.y, p.z]), 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs.flat(), 2)); g.setIndex([0, 1, 2, 0, 2, 3]); return g; };
const glass = grp(cab);
{ const q = [[0, 0], [SHD.w, 0], [SHD.w - SHD.top, SHH], [SHD.top, SHH]], g = pane(q.map(p => shieldPt(p[0], p[1])), q);
  const m = mesh(g, maskMat(`${GFN}varying vec2 vUv;void main(){if(wiped(vUv)<.5)discard;gl_FragColor=vec4(0.);}`), glass); m.renderOrder = RO.mask; m.material.side = THREE.DoubleSide;
  const d = mesh(g, glassMat(`${NOISE}${GFN}uniform float uDust,uRain,uSplash,uTime;varying vec2 vUv;
    void main(){vec2 p=vUv;float w=wiped(p),n=vn(p*13.)*.5+vn(p*41.)*.3+vn(p*120.)*.2,da=(1.-w)*uDust*(.5+.34*n)+w*(1.-w)*uDust*1.3;vec3 c=vec3(.66,.62,.56)*da;float a=da; // dust, and the ridge a blade leaves at the edge of its sweep
      float ag=age(p),film=max(uRain,uSplash)*(1.-exp(-ag*.4));
      if(film>.01)for(int k=0;k<2;k++){vec2 g=p*(k==0?74.:27.)+float(k)*13.7,id=floor(g),f=fract(g)-.5,o=(vec2(h1(id+3.1),h1(id+7.7))-.5)*.5;float rad=.11+.25*h1(id+1.3),on=step(h1(id),film*(k==0?.85:.5)),dr=(1.-smoothstep(rad*.7,rad,length(f-o)))*on;
        float hi=1.-smoothstep(rad*.15,rad*.75,length(f-o-vec2(-.28,.32)*rad));c+=vec3(.86,.94,1.)*dr*(.07+.5*hi)+vec3(.7,.85,1.)*dr*.16*(1.-smoothstep(-rad,0.,(f-o).y));a+=dr*.2;} // every drop a tiny lens: a glint up top, the sky upside down at the bottom
      float sp=uSplash*(1.-exp(-ag*4.))*(.55+.45*vn(p*8.+vec2(0.,uTime*1.5)));c+=vec3(.74,.8,.84)*sp*.3;a+=sp*.42;
      c+=vec3(.05,.048,.046)*(1.-smoothstep(0.,.3,p.y))*w;gl_FragColor=vec4(c,a);}`), glass); d.renderOrder = RO.glass; }
const sideFS = [`uniform float uRoll;varying vec2 vUv;void main(){if(vUv.y<1.-uRoll)discard;gl_FragColor=vec4(0.);}`, // the side glass is dusty too, until it winds down into the door
  `${NOISE}uniform float uRoll,uDust;varying vec2 vUv;void main(){float e=1.-uRoll;if(vUv.y>e+.012||uRoll>.995)discard;float n=vn(vUv*vec2(11.,6.))*.5+vn(vUv*vec2(37.,21.))*.5,a=uDust*(.5+.34*n);vec3 c=vec3(.66,.62,.56)*a;float l=smoothstep(e-.012,e,vUv.y);gl_FragColor=vec4(c+vec3(.8,.9,1.)*l*.5,max(a,l*.4));}`];
for (const x of [-.338, mir(-.338)]) { const g = pane([new V(x, -.212, -.9), new V(x, -.212, .222), new V(x, .356, .222), new V(x, .33, -.375)], [[0, 0], [1.1, 0], [1.1, 1], [.5, .96]]);
  const m = mesh(g, maskMat(sideFS[0]), glass); m.renderOrder = RO.mask; m.material.side = THREE.DoubleSide; mesh(g, glassMat(sideFS[1]), glass).renderOrder = RO.glass; }
// wipers: outside the glass, pivoting just under its bottom edge
const WIP = WP.p.map(p => { const g = grp(cab); shieldPt(p[0], p[1], -.016, g.position); g.quaternion.copy(SQ); const arm = grp(g);
  mesh([at(box(.42, .011, .008), .21, 0, -.004), at(cyl(.014, .014, .012, 12), 0, 0, 0, Math.PI / 2), at(box(.03, .02, .012), .41, 0, 0)], M.black, arm); mesh(at(box(WP.r1 - WP.r0, .016, .012), (WP.r0 + WP.r1) / 2, 0, .006), M.rubber, arm); return arm; });
const WS = { a: WP.a0, dir: 1, on: false, pause: 99, strokes: 0, want: 0 };
// the head-up display: light thrown onto the glass just over the bonnet line
const hud = mesh(uvRect(new THREE.PlaneGeometry(.56, .14), 0, .25, 1, .5), new THREE.MeshBasicMaterial({ map: HUDC.tex, toneMapped: false, ...ADD, opacity: 0 }), glass); shieldPt(.33, .215, .014, hud.position); hud.quaternion.copy(SQ); hud.renderOrder = RO.hud;
// ── what you see of your own car through the glass: the bonnet and the door mirrors. These are 'world' (they only exist where a window shows them) but ride with the cockpit
{ const nx = 10, nz = 7, surf = (x, z) => { const t = (-z - 1) / 1.15, k = (x - CX) / .78; return -.262 - .115 * t * t - .05 * k * k; };
  const grid = (xa, xb, lift, cl) => { const pos = [], c = [], uv = [], idx = []; for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) { const x = lerp(xa, xb, i / nx), z = lerp(-.99, -2.15, j / nz); pos.push(x, surf(x, z) + lift, z); c.push(cl.r, cl.g, cl.b); uv.push(-1, -1); }
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { const a = j * (nx + 1) + i, b = a + 1, d = a + nx + 1; idx.push(a, b, d, b, d + 1, d); } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; };
  const red = col('#e6322c'); wmesh(mergeBufferGeometries([grid(CX - .78, CX + .78, 0, red), grid(CX - .21, CX - .07, .003, WHITE), grid(CX + .07, CX + .21, .003, WHITE)]), WM2, cab);
  const b = new MB(); for (const x of [-.48, mir(-.48)]) b.box(M4(x, -.215, -.84), .15, .085, .06, red, { front: null }).box(M4(x, -.208, -.808), .13, .07, .004, col('#9fc4e8')); wmesh(b.geo(), WM2, cab); }
