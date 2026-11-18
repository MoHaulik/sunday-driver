
// ═══════════════════════════ THE GARAGE: between races the car rolls into a workshop. Windows go dark, the lights clunk on, and the crew fits what you buy — you hear it, you see the sparks. Only through your windows; your room stays your room ═══════════════════════════
const GG = new THREE.Group(), GY = -CFG.EYE, GA = { want: false, on: false, bo: 0, t: 0, busy: false, q: [], amb: 0 }; GG.visible = false; tilt.add(GG);

// ── the set. One merged mesh, one ink hull, a handful of signs. Shading is done once in one shader: cinder block, corrugated sheet, epoxy checker floor with bay lines, roller-door slats, hazard paint,
// lit by three fluorescent tubes (line lights), toon bands with soft edges, a sky-ish ambient, contact shadows under everything that stands, and darkening into the corners
const X0 = -3.2, X1 = 4, Z0 = -6, Z1 = 4.4, H = 4, XM = (X0 + X1) / 2, ZM = (Z0 + Z1) / 2, INKC = '#1d1233', TI = .013;
const MX = (x, y, z, rx = 0, ry = 0, rz = 0) => new THREE.Matrix4().compose(new V(x, y, z), new Qn().setFromEuler(new THREE.Euler(rx, ry, rz, 'YXZ')), new V(1, 1, 1));
class GB { constructor() { this.l = []; } add(g, m, hex, mt = 0) { g = g.index ? g.toNonIndexed() : g; g.applyMatrix4(m); const n = g.attributes.position.count, c = col(hex), a = new Float32Array(n * 4); for (let i = 0; i < n; i++) a.set([c.r, c.g, c.b, mt], i * 4); this.l.push([g.attributes.position.array, g.attributes.normal.array, a]); }
  geo() { let N = 0; this.l.forEach(e => N += e[0].length); const P = new Float32Array(N), Nn = new Float32Array(N), C = new Float32Array(N / 3 * 4); let o = 0, o4 = 0; this.l.forEach(([p, n, c]) => { P.set(p, o); Nn.set(n, o); C.set(c, o4); o += p.length; o4 += c.length; });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.BufferAttribute(Nn, 3)); g.setAttribute('aC', new THREE.BufferAttribute(C, 4)); return g; } }
const SB = new GB(), KB = new GB(), SH = [];
const bx = (x, y, z, w, h, d, hex, mt = 0, ry = 0, ink = true) => { SB.add(new THREE.BoxGeometry(w, h, d), MX(x, y + h / 2, z, 0, ry), hex, mt); if (ink) KB.add(new THREE.BoxGeometry(w + TI * 2, h + TI * 2, d + TI * 2), MX(x, y + h / 2, z, 0, ry), INKC); };
const cy = (m, r, h, hex, mt = 0, seg = 22, r2 = r, ink = true) => { SB.add(new THREE.CylinderGeometry(r2, r, h, seg).translate(0, h / 2, 0), m, hex, mt); if (ink) KB.add(new THREE.CylinderGeometry(r2 + TI, r + TI, h + TI * 2, seg).translate(0, h / 2, 0), m, INKC); };
const tr = (m, R, r, hex, mt = 0) => { SB.add(new THREE.TorusGeometry(R, r, 12, 32), m, hex, mt); KB.add(new THREE.TorusGeometry(R, r + TI, 12, 32), m, INKC); };
const shadow = (x, z, rx, rz) => SH.push(new THREE.Vector4(x, z, rx, rz));
{ // the room
  bx(XM, GY - .1, ZM, X1 - X0, .1, Z1 - Z0, '#ffffff', 1, 0, false); bx(XM, GY + H, ZM, X1 - X0, .1, Z1 - Z0, '#3b3160', 0, 0, false);
  for (const [x, s] of [[X0 - .05, 1], [X1 + .05, -1]]) { bx(x, GY, ZM, .1, 1.15, Z1 - Z0, '#8fd3ff', 2, 0, false); bx(x, GY + 1.15, ZM, .1, H - 1.15, Z1 - Z0, '#d9bdff', 3, 0, false); bx(x + s * .07, GY + 1.12, ZM, .04, .07, Z1 - Z0, '#ff6fb5'); bx(x + s * .07, GY, ZM, .05, .12, Z1 - Z0, '#3a2a5c'); }
  bx(XM, GY, Z1 + .05, X1 - X0, 1.15, .1, '#8fd3ff', 2, 0, false); bx(XM, GY + 1.15, Z1 + .05, X1 - X0, H - 1.15, .1, '#d9bdff', 3, 0, false); bx(XM, GY + 1.12, Z1 - .02, X1 - X0, .07, .04, '#ff6fb5');
  const D0 = CX - 1.8, D1 = CX + 1.8, DH = 3.05; for (const [a, b] of [[X0, D0], [D1, X1]]) { bx((a + b) / 2, GY, Z0 - .05, b - a, 1.15, .1, '#8fd3ff', 2, 0, false); bx((a + b) / 2, GY + 1.15, Z0 - .05, b - a, H - 1.15, .1, '#d9bdff', 3, 0, false); bx((a + b) / 2, GY + 1.12, Z0 + .02, b - a, .07, .04, '#ff6fb5'); }
  bx(CX, GY + DH, Z0 - .05, D1 - D0, H - DH, .1, '#d9bdff', 3, 0, false); bx(CX, GY, Z0 + .01, D1 - D0, DH, .05, '#ff8cc6', 4, 0, false); bx(CX, GY + .22, Z0 + .07, .7, .06, .06, '#d8dbe8'); // the roller door and its handle
  for (const x of [D0 - .1, D1 + .1]) bx(x, GY, Z0 + .07, .2, DH + .2, .14, '#ffd23f', 5); bx(CX, GY + DH, Z0 + .07, D1 - D0 + .4, .2, .14, '#ffd23f', 5); // hazard-painted frame
  bx(CX, GY + 3.22, Z0 + .01, 2.75, .66, .04, '#2a1d4a'); // the board behind the neon
  for (let z = Z0 + .8; z < Z1; z += 1.65) { bx(XM, GY + H - .3, z, X1 - X0, .3, .1, '#5b4d8f'); bx(XM, GY + H - .32, z, X1 - X0, .04, .26, '#5b4d8f'); } // I-beams
  for (let x = X0 + .6; x < X1; x += 1.9) cy(MX(x, GY + H - .02, ZM, Math.PI / 2), .05, Z1 - Z0, '#8a7fb8', 0, 10, .05, false); } // conduit
const TUBES = [[CX - 1.15, -3.7, -1.5], [CX + 1.25, -3.7, -1.5], [CX + .05, .6, 2.9]].map(([x, z0, z1]) => { const y = GY + H - .55, zc = (z0 + z1) / 2, len = z1 - z0; bx(x, y + .02, zc, .26, .07, len + .1, '#f3eefc');
  for (const z of [z0 + .1, z1 - .1]) cy(MX(x, y + .09, z), .006, H - .65, '#3a2a5c', 0, 5, .006, false); return { a: new V(x, y - .03, z0), b: new V(x, y - .03, z1), c: new V(x, y, zc), len, x, y, zc }; }); // fixtures on chains
{ // the lift: two posts either side of you, a crossbar over the roof, arms under the sills
  for (const s of [-1, 1]) { const px = CX + s * 1.62, pz = -.35; bx(px, GY, pz, .58, .035, .58, '#3a2a5c'); bx(px, GY + .035, pz, .26, 3.15, .32, '#ffd23f'); bx(px, GY + .035, pz, .275, .42, .335, '#ffd23f', 5, 0, false); bx(px - s * .17, GY + .5, pz, .05, 2.4, .1, '#c8ccdc');
    bx(px - s * .02, GY + .18, pz, .32, .34, .4, '#3a2a5c'); for (const dz of [-1, 1]) { const m = MX(px - s * .55, GY + .2, pz + dz * .42, 0, s * dz * .55); SB.add(new THREE.BoxGeometry(.95, .07, .1).translate(0, .035, 0), m, '#ffd23f'); KB.add(new THREE.BoxGeometry(.95 + TI * 2, .07 + TI * 2, .1 + TI * 2).translate(0, .035, 0), m, INKC);
      _v.set(-.45 * s, 0, 0).applyAxisAngle(YA, s * dz * .55); cy(MX(px - s * .55 + _v.x, GY + .27, pz + dz * .42 + _v.z), .07, .05, '#2a2238', 0, 16); }
    bx(px + s * .18, GY + 1.1, pz + .2, .12, .2, .1, '#ffffff'); cy(MX(px + s * .245, GY + 1.25, pz + .2, 0, 0, s * Math.PI / 2), .022, .02, '#ff3b4f', 0, 12); shadow(px, pz, .42, .42); }
  bx(CX, GY + 3.18, -.35, 3.5, .16, .22, '#ffd23f'); bx(CX, GY + 3.34, -.35, 3.2, .04, .05, '#3a2a5c'); }
{ // the red roll cab and its top chest, drawers with chrome pulls, tools left on top
  const x = X1 - .33, z = -2.55; bx(x, GY + .09, z, .52, .86, .98, '#ff3b4f'); for (const [dx, dz] of [[-.2, -.4], [.2, -.4], [-.2, .4], [.2, .4]]) cy(MX(x + dx, GY, z + dz), .045, .09, '#2a2238', 0, 12);
  for (let i = 0; i < 5; i++) { bx(x - .27, GY + .14 + i * .155, z, .025, .13, .9, '#ff5a6c'); cy(MX(x - .3, GY + .2 + i * .155, z - .28, Math.PI / 2), .011, .56, '#e9ecf6', 0, 8); }
  bx(x, GY + .95, z, .48, .36, .94, '#ff3b4f'); for (let i = 0; i < 3; i++) bx(x - .25, GY + .99 + i * .1, z, .02, .08, .86, '#ff5a6c'); bx(x, GY + 1.31, z, .5, .05, .96, '#e8323f');
  bx(x - .05, GY + 1.36, z - .2, .22, .025, .05, '#c8ccdc', 0, .4); bx(x + .05, GY + 1.36, z + .15, .05, .06, .26, '#7fd0ff'); cy(MX(x - .08, GY + 1.36, z + .3), .05, .12, '#ffd23f', 0, 14); shadow(x, z, .42, .62); }
{ // the bench: butcher-block top, shelf, a blue vise, a CRT showing the race
  const x = X1 - .4; bx(x, GY + .86, 1.35, .72, .06, 2.3, '#d6a06b'); for (const z of [.3, 2.4]) for (const dx of [-.3, .3]) bx(x + dx, GY, z, .06, .86, .06, '#7a5236'); bx(x, GY + .26, 1.35, .66, .04, 2.2, '#b07a4c');
  bx(x - .22, GY + .92, .55, .16, .12, .14, '#4f7cff'); bx(x - .32, GY + .92, .55, .04, .1, .2, '#4f7cff'); bx(x, GY + .92, 2.05, .46, .38, .44, '#efe8fa'); bx(x + .02, GY + .99, 2.05, .3, .26, .36, '#d7cfe8'); cy(MX(x, GY + 1.3, 2.05, 0, 0, .4), .004, .3, '#3a2a5c', 0, 5, .004, false); cy(MX(x, GY + 1.3, 2.05, 0, 0, -.5), .004, .3, '#3a2a5c', 0, 5, .004, false);
  for (let i = 0; i < 3; i++) cy(MX(x + .1, GY + .3, .6 + i * .3), .1, .22, ['#4fd1b0', '#ff6fb5', '#ffd23f'][i], 0, 16); shadow(x, 1.35, .45, 1.25); }
for (const [x, z, n] of [[X0 + .55, -4.75, 4], [X0 + .55, -3.85, 3], [X1 - .55, 3.6, 4], [X0 + 1.35, -4.85, 2]]) { for (let i = 0; i < n; i++) { const y = GY + .14 + i * .27; tr(MX(x, y, z, Math.PI / 2), .29, .135, '#2b2338'); cy(MX(x, y - .1, z), .19, .2, '#ff9fd0', 0, 20); cy(MX(x, y - .095, z), .06, .19, '#e9ecf6', 0, 10); } shadow(x, z, .48, .48); } // tyres on their sides, pink rims
for (const [x, z, c] of [[X0 + .42, 2.4, '#4fd1b0'], [X0 + .42, 3.15, '#ff6fb5'], [X0 + 1.08, 3.75, '#ffd23f']]) { cy(MX(x, GY, z), .29, .9, c); for (const y of [.3, .6]) tr(MX(x, GY + y, z, Math.PI / 2), .292, .02, c); cy(MX(x, GY + .9, z), .26, .015, '#3a2a5c', 0, 22, .26, false); cy(MX(x + .14, GY + .9, z), .035, .03, '#c8ccdc', 0, 10); shadow(x, z, .36, .36); } // oil drums
for (const [x, z] of [[CX - 2.3, -4.5], [CX + 2.45, -4.7], [CX + 2.2, 2.9]]) { bx(x, GY, z, .34, .03, .34, '#ff7a2f'); cy(MX(x, GY + .03, z), .16, .5, '#ff7a2f', 0, 18, .025); cy(MX(x, GY + .2, z), .118, .09, '#ffffff', 0, 18, .098, false); shadow(x, z, .22, .22); } // cones
bx(X0 + .38, GY, 1.4, .2, .42, .34, '#ff3b4f'); bx(X0 + .38, GY + .42, 1.32, .04, .06, .08, '#ffd23f'); shadow(X0 + .38, 1.4, .2, .25); // a jerry can
tr(MX(X0 + .09, GY + 1.75, -1.4, 0, Math.PI / 2), .26, .035, '#ffd23f'); cy(MX(X0 + .06, GY + 1.75, -1.4, 0, 0, Math.PI / 2), .07, .1, '#3a2a5c', 0, 14); // an air hose reel on the wall
for (let k = 0; k < 4; k++) bx(X0 + .2, GY + .1 + k * .015, -.6 + k * .06, .7, .015, .5, ['#ff9fd0', '#7fd0ff', '#ffd23f', '#ffffff'][k], 0, k * .2, false); // rags on the floor by the wall
shadow(CX, -.25, 1.05, 2.25); // your car sits on the floor too
const GU = { uT: u(TUBES.flatMap(t => [t.a, t.b])), uI: u([0, 0, 0]), uS: u(SH.slice(0, 16).concat([...Array(Math.max(0, 16 - SH.length))].map(() => new THREE.Vector4(0, 0, 0, 0)))) };
{ const m = new THREE.Mesh(SB.geo(), new THREE.ShaderMaterial({ uniforms: GU, ...STEN,
    vertexShader: `attribute vec4 aC;varying vec4 vC;varying vec3 vN,vP;void main(){vC=aC;vN=normal;vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `uniform vec3 uT[6];uniform float uI[3];uniform vec4 uS[16];varying vec4 vC;varying vec3 vN,vP;float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
    void main(){vec3 n=normalize(vN),c=vC.rgb;float m=vC.a,fl=step(.5,m)*step(m,1.5);
      if(fl>.5){vec2 q=floor(vP.xz/.5),f=abs(fract(vP.xz/.5)-.5);c=mix(vec3(1.,.7,.86),vec3(.99,.97,1.),mod(q.x+q.y,2.));c*=1.-.14*smoothstep(.46,.49,max(f.x,f.y));
        float bx=abs(abs(vP.x-${CX.toFixed(2)})-1.95);c=mix(c,vec3(1.,.82,.18),step(bx,.045)*step(vP.z,2.4)*step(-4.4,vP.z));
        vec2 o=(vP.xz-vec2(${(CX + .35).toFixed(2)},-1.7))*vec2(1.,.75);c*=1.-.3*smoothstep(.75,.0,length(o)+.15*hs(floor(vP.xz*6.)));}
      else if(m<2.5&&m>1.5){vec2 u=vec2(vP.x+vP.z,vP.y)/vec2(.4,.2);u.x+=step(1.,mod(floor(u.y),2.))*.5;vec2 f=abs(fract(u)-.5);c*=(1.-.3*smoothstep(.45,.49,max(f.x*.5+.25,f.y)))*(.94+.06*hs(floor(u)));}
      else if(m<3.5&&m>2.5){c*=.9+.1*sin((vP.x+vP.z)*42.);}
      else if(m<4.5&&m>3.5){float f=fract(vP.y/.17);c*=.8+.2*smoothstep(.0,.35,f)*smoothstep(1.,.65,f);}
      else if(m<5.5&&m>4.5){c=mix(vec3(1.,.82,.15),vec3(.13,.08,.22),step(.5,fract((vP.x+vP.y+vP.z)*2.6)));}
      vec3 L=vec3(0.);for(int i=0;i<3;i++){vec3 a=uT[i*2],ab=uT[i*2+1]-a;float t=clamp(dot(vP-a,ab)/dot(ab,ab),0.,1.);vec3 d=a+ab*t-vP;float r2=max(dot(d,d),.04),nl=max(dot(n,d*inversesqrt(r2)),0.);L+=uI[i]*(nl*.8+.2)*2.6/(1.+r2*.32);}
      float lu=dot(L,vec3(.33));vec3 li=mix(vec3(.26,.2,.4),vec3(.4,.36,.52),n.y*.5+.5)+vec3(1.,.97,.92)*(lu*.42+smoothstep(.3,.42,lu)*.2+smoothstep(.85,1.,lu)*.14);
      float ao=mix(.62,1.,smoothstep(.0,.55,vP.y-(${GY.toFixed(2)})));float e=min(min(vP.x-(${X0.toFixed(1)}),${X1.toFixed(1)}-vP.x),min(vP.z-(${Z0.toFixed(1)}),${Z1.toFixed(1)}-vP.z));ao*=mix(.72,1.,smoothstep(.0,.5,e));ao*=mix(.75,1.,smoothstep(0.,.6,${(GY + H).toFixed(2)}-vP.y));
      if(fl>.5){ao=mix(.7,1.,smoothstep(0.,.7,e));for(int i=0;i<16;i++){vec4 s=uS[i];if(s.z<=0.)continue;vec2 q=(vP.xz-s.xy)/s.zw;ao*=1.-.42*smoothstep(1.25,.35,length(q));}}
      gl_FragColor=vec4(c*li*ao,1.);}` })); m.renderOrder = RO.world; GG.add(m);
  const k = new THREE.Mesh(KB.geo(), new THREE.MeshBasicMaterial({ color: INKC, side: THREE.BackSide, ...STEN })); k.renderOrder = RO.world; GG.add(k); }
TUBES.forEach(t => { t.col = col('#fff6e6'); t.m = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, t.len, 10).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#221a33', toneMapped: false, ...STEN })); t.m.position.set(t.x, t.y - .035, t.zc); t.m.renderOrder = RO.world; GG.add(t.m); });
const gplane = (w, h, tex, x, y, z, ry = 0, add) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false, depthWrite: !add, ...(add ? { blending: THREE.AdditiveBlending } : {}), ...STEN })); p.position.set(x, y, z); p.rotation.y = ry; p.renderOrder = RO.world + (add ? 2 : 1); GG.add(p); return p; };
GA.sign = gplane(2.5, .6, artTex(1024, 244, c => { c.lineJoin = 'round'; c.font = 'italic 800 132px Unbounded,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 16; c.strokeStyle = '#ff2d8a'; c.strokeText('NXT GARAGE', 512, 128, 960); c.fillStyle = '#fff2fa'; c.fillText('NXT GARAGE', 512, 128, 960); }), CX, GY + 3.55, Z0 + .03);
GA.glow = gplane(3.3, 1.2, artTex(512, 192, c => { const g = c.createRadialGradient(256, 96, 10, 256, 96, 250); g.addColorStop(0, 'rgba(255,60,160,.9)'); g.addColorStop(1, 'rgba(255,60,160,0)'); c.fillStyle = g; c.fillRect(0, 0, 512, 192); }), CX, GY + 3.55, Z0 + .04, 0, true);
gplane(2.2, 1.2, artTex(1024, 560, c => { c.fillStyle = '#f1cf9c'; c.fillRect(0, 0, 1024, 560); c.fillStyle = 'rgba(90,55,25,.55)'; for (let y = 20; y < 560; y += 40) for (let x = 20; x < 1024; x += 40) { c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill(); } c.strokeStyle = '#1d1233'; c.lineWidth = 10; c.strokeRect(5, 5, 1014, 550);
  const tool = (x, y, a, fill, f) => { c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = 'rgba(29,18,51,.25)'; c.save(); c.translate(10, 10); f(); c.restore(); c.fillStyle = fill; c.lineWidth = 8; c.strokeStyle = '#1d1233'; c.lineJoin = 'round'; f(); c.stroke(); c.restore(); }; // each tool with its painted shadow
  tool(150, 280, .25, '#ff4fa3', () => { c.beginPath(); c.roundRect(-16, -120, 32, 230, 12); c.moveTo(48, -170); c.arc(0, -160, 50, -.2, 3.34, true); c.fill(); });
  tool(400, 290, -.15, '#7fd0ff', () => { c.beginPath(); c.roundRect(-13, -50, 26, 210, 9); c.roundRect(-80, -115, 160, 66, 14); c.fill(); });
  tool(630, 270, .05, '#ffd23f', () => { c.beginPath(); c.roundRect(-28, 10, 56, 170, 20); c.roundRect(-7, -180, 14, 196, 4); c.fill(); });
  tool(850, 270, -.35, '#86e05a', () => { c.beginPath(); c.moveTo(-40, -170); c.lineTo(40, -170); c.lineTo(18, 150); c.lineTo(-18, 150); c.closePath(); c.fill(); }); }), X1 - .02, GY + 1.75, 1.35, -Math.PI / 2);
gplane(.36, .27, artTex(256, 192, c => { c.fillStyle = '#16123a'; c.fillRect(0, 0, 256, 192); c.fillStyle = '#ff4fa3'; c.font = 'italic 800 34px Unbounded,sans-serif'; c.textAlign = 'center'; c.fillText('SUNDAY', 128, 84); c.fillStyle = '#7fd0ff'; c.fillText('DRIVER', 128, 124); c.fillStyle = 'rgba(255,255,255,.07)'; for (let y = 0; y < 192; y += 4) c.fillRect(0, y, 256, 2); }), X1 - .4 - .225, GY + 1.12, 2.05, -Math.PI / 2);
[['SUNDAY DRIVER', '#ff2d8a', '#fff'], ['OIL CHANGE ♥ 9.99¢', '#7fd0ff', '#1d1233'], ['NO CRYING IN THE PIT', '#ffd23f', '#1d1233'], ['TOWNSVILLE SPEEDWAY', '#86e05a', '#1d1233']].forEach(([t, bg, fg], k) => { const [x, z, ry] = [[X0 + .03, 1.4, Math.PI / 2], [X1 - .03, -1.1, -Math.PI / 2], [X0 + .03, -2.9, Math.PI / 2], [CX - 2.1, Z1 - .03, Math.PI]][k];
  gplane(.78, 1.08, artTex(256, 352, c => { c.fillStyle = bg; c.fillRect(0, 0, 256, 352); c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.arc(200, 70, 90, 0, 7); c.fill(); c.strokeStyle = '#1d1233'; c.lineWidth = 14; c.strokeRect(7, 7, 242, 338); c.fillStyle = fg; c.font = 'italic 800 40px Unbounded,sans-serif'; c.textAlign = 'center'; t.split(' ').forEach((w, i, a) => c.fillText(w, 128, 186 + (i - (a.length - 1) / 2) * 50, 228)); }), x, GY + 2.15, z, ry); });

// ── the robot: an industrial six-axis arm in NXT pink, with hoses along its limbs, a hazard band on the turret and a little screen face on the wrist. Inverse kinematics put the tool exactly on the job
const ARM = { g: grp(GG, CX + 1.15, GY, -2.75), tg: new V(-.6, 1.5, .6), done: -9 }, L1 = 1.02, L2 = .9, TLN = .32;
const FACE = ['open', 'shut', 'work'].map(k => artTex(128, 80, c => { c.fillStyle = '#120d24'; c.fillRect(0, 0, 128, 80); c.fillStyle = k === 'work' ? '#ffd23f' : '#5fe3ff'; c.shadowColor = c.fillStyle; c.shadowBlur = 10;
  if (k === 'shut') { c.fillRect(26, 40, 26, 6); c.fillRect(76, 40, 26, 6); } else if (k === 'work') { c.beginPath(); c.moveTo(26, 30); c.lineTo(50, 40); c.lineTo(26, 50); c.fill(); c.beginPath(); c.moveTo(102, 30); c.lineTo(78, 40); c.lineTo(102, 50); c.fill(); } else { c.beginPath(); c.roundRect(28, 24, 22, 32, 8); c.roundRect(78, 24, 22, 32, 8); c.fill(); c.fillStyle = '#ff6fb5'; c.fillRect(56, 60, 16, 4); } }));
{ const T2 = (h) => new THREE.MeshToonMaterial({ color: h, gradientMap: TOON, ...STEN }), pk = T2('#ff6fb5'), dk = T2('#3a2a5c'), ch = T2('#e4e7f3'), yl = T2('#ffd23f'), OL = new THREE.MeshBasicMaterial({ color: INKC, side: THREE.BackSide, ...STEN });
  const part = (geo, ink, mat, p, x = 0, y = 0, z = 0, rx = 0, rz = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); m.renderOrder = RO.world; p.add(m); if (ink) { const o = new THREE.Mesh(ink, OL); o.renderOrder = RO.world; m.add(o); } return m; };
  const C2 = (r, h, s = 20, r2 = r) => [new THREE.CylinderGeometry(r2, r, h, s), new THREE.CylinderGeometry(r2 + TI, r + TI, h + TI * 2, s)], B2 = (w, h, d) => [new THREE.BoxGeometry(w, h, d), new THREE.BoxGeometry(w + TI * 2, h + TI * 2, d + TI * 2)];
  const strip = artTex(256, 32, c => { for (let i = -2; i < 20; i++) { c.fillStyle = i % 2 ? '#1d1233' : '#ffd23f'; c.beginPath(); c.moveTo(i * 16, 32); c.lineTo(i * 16 + 16, 32); c.lineTo(i * 16 + 32, 0); c.lineTo(i * 16 + 16, 0); c.fill(); } }); strip.wrapS = THREE.RepeatWrapping; strip.repeat.x = 3;
  part(...C2(.36, .05, 28), dk, ARM.g, 0, .025); for (let i = 0; i < 8; i++) part(...C2(.02, .03, 8), ch, ARM.g, Math.cos(i * .785) * .3, .06, Math.sin(i * .785) * .3); // the floor plate and its bolts
  ARM.tur = grp(ARM.g, 0, .05, 0); part(...C2(.25, .3, 28, .22), pk, ARM.tur, 0, .15); part(new THREE.CylinderGeometry(.255, .255, .07, 28, 1, true), null, new THREE.MeshBasicMaterial({ map: strip, ...STEN }), ARM.tur, 0, .07);
  part(...B2(.36, .2, .34), dk, ARM.tur, 0, .38); for (const s of [-1, 1]) { part(...C2(.17, .1, 24), pk, ARM.tur, s * .23, .44, 0, 0, Math.PI / 2); part(...C2(.07, .11, 16), ch, ARM.tur, s * .235, .44, 0, 0, Math.PI / 2); } // the shoulder motors
  ARM.s = grp(ARM.tur, 0, .44, 0); part(...C2(.13, L1, 4, .095), pk, ARM.s, 0, L1 / 2, 0).rotation.y = Math.PI / 4; part(...C2(.022, L1 * .85, 8), dk, ARM.s, .1, L1 * .5, -.06); for (const y of [.25, .6, .85]) part(...C2(.03, .03, 8), ch, ARM.s, .1, y * L1, -.06);
  part(new THREE.PlaneGeometry(.12, .28), null, new THREE.MeshBasicMaterial({ map: artTex(64, 160, c => { c.fillStyle = '#fff'; c.font = 'italic 800 34px Unbounded,sans-serif'; c.textAlign = 'center'; c.save(); c.translate(36, 80); c.rotate(-Math.PI / 2); c.fillText('NXT', 0, 12); c.restore(); }), transparent: true, ...STEN }), ARM.s, 0, L1 * .48, .118);
  ARM.e = grp(ARM.s, 0, L1, 0); part(...C2(.12, .3, 22), dk, ARM.e, -.15, 0, 0, 0, Math.PI / 2); for (const s of [-1, 1]) part(...C2(.125, .03, 22), pk, ARM.e, s * .16, 0, 0, 0, Math.PI / 2);
  part(...C2(.085, L2, 4, .06), pk, ARM.e, 0, L2 / 2, 0).rotation.y = Math.PI / 4; part(...C2(.018, L2 * .8, 8), dk, ARM.e, -.075, L2 * .5, -.05);
  ARM.w = grp(ARM.e, 0, L2, 0); part(...C2(.07, .16, 18), ch, ARM.w, -.08, 0, 0, 0, Math.PI / 2); part(...B2(.17, .13, .15), dk, ARM.w, 0, .08, 0);
  ARM.face = part(new THREE.PlaneGeometry(.13, .08), null, new THREE.MeshBasicMaterial({ map: FACE[0], toneMapped: false, ...STEN }), ARM.w, 0, .147, .015, -Math.PI / 2);
  ARM.wr = grp(ARM.w, 0, 0, -.1); part(...C2(.04, .17, 16), yl, ARM.wr, 0, .03); part(...B2(.05, .12, .05), dk, ARM.wr, 0, -.02, -.05); ARM.sock = part(...C2(.022, .1, 6), ch, ARM.wr, 0, .2); // the impact wrench and its socket
  ARM.can = grp(ARM.w, 0, 0, -.1); part(...C2(.04, .17, 16), T2('#7fd0ff'), ARM.can, 0, .03); part(...C2(.012, .03, 8), ch, ARM.can, 0, .2); ARM.can.visible = false; // the spray gun for paint jobs
  ARM.tip = grp(ARM.w, 0, .3, -.1); }
function armPose(t) { const r = Math.hypot(t.x, t.z), h = t.y - .49; ARM.tur.rotation.y = Math.atan2(t.x, t.z); // turn to face it, then two-bone IK in that plane, then the wrist lines the tool up with the target
  const D = Math.hypot(r, h), phi = Math.atan2(r, h), d = clamp(D - TLN, .4, L1 + L2 - .02), a1 = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1)), e = Math.acos(clamp((L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2), -1, 1));
  ARM.s.rotation.x = phi - a1; ARM.e.rotation.x = Math.PI - e; ARM.w.rotation.x = phi - (phi - a1) - (Math.PI - e); }
shadow(CX + 1.15, -2.75, .48, .48); GU.uS.value = SH.slice(0, 16).concat([...Array(Math.max(0, 16 - SH.length))].map(() => new THREE.Vector4(0, 0, 0, 0)));

// sparks: one set in your cabin (no stencil: they fly in your room), one in the garage (behind the glass)
const DOT = artTex(32, 32, c => { const g = c.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, '#fff'); g.addColorStop(.35, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, 32, 32); });
function sparkSys(parent, sten, n = 160) { const pos = new Float32Array(n * 3), cl = new Float32Array(n * 3), vel = [...Array(n)].map(() => new V()), life = new Float32Array(n), g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(cl, 3)); let k = 0;
  const m = new THREE.Points(g, new THREE.PointsMaterial({ map: DOT, size: sten ? .035 : .008, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, ...(sten ? STEN : {}) })); m.frustumCulled = false; m.renderOrder = RO.fx; parent.add(m);
  return { emit(p, v, c, l = .5) { const i = k++ % n; pos.set([p.x, p.y, p.z], i * 3); vel[i].copy(v); cl.set([c.r, c.g, c.b], i * 3); life[i] = l; },
    update(dt, grav) { for (let i = 0; i < n; i++) { if (life[i] <= 0) continue; life[i] -= dt; vel[i].y -= grav * dt; pos[i * 3] += vel[i].x * dt; pos[i * 3 + 1] += vel[i].y * dt; pos[i * 3 + 2] += vel[i].z * dt; if (life[i] <= 0) pos[i * 3 + 1] = -99; else { const f = Math.min(1, life[i] * 3); cl[i * 3] *= .985; cl[i * 3 + 1] *= .97; cl[i * 3 + 2] *= .96; } } g.attributes.position.needsUpdate = g.attributes.color.needsUpdate = true; } }; }
const CSP = sparkSys(cab, false), GSP = sparkSys(GG, true), SPC = col('#ffcf6b');
function mist(hex, n) { const c = col(hex); for (let i = 0; i < n; i++) CSP.emit(_v.set(rand(-.3, 1), rand(-.22, -.05), rand(-.6, -.92)), _v2.set(rand(-.05, .05), rand(.02, .1), rand(-.05, .05)), c, rand(.8, 1.6)); } // a puff of paint over the dash
function work(p, kind, done) { GA.busy = true; GA.wp = p; GA.kind = kind; const t0 = T, S = kind === 'paint' ? [[0, 'rattle'], [.6, 'spray', 1.3], [1.3, 'hiss'], [2.1, 'clank']] : [[0, 'impact'], [.6, 'ratchet'], [.95, 'clank'], [1.25, 'drill', .6], [1.9, 'impact', .5]];
  GA.q = S.map(([t, sf, x]) => ({ t: t0 + t, f: () => { sfxAt(sf, rig.localToWorld(p.clone()), x || 1); if (kind === 'paint' && sf === 'spray') mist(THEMES.find(q => q.id === SAVE.theme).c[0], 90); } })); GA.q.push({ t: t0 + (kind === 'paint' ? 2.4 : 2.3), f: () => { GA.busy = false; done(); } }); }
function garageIn() { GA.want = true; } function garageOut() { GA.want = false; }
function garage(dt) { const want = GA.want && G.phase === 'finish'; // windows fade to black, the swap happens in the dark, then the tubes flicker on one by one
  if (want !== GA.on) { GA.bo = Math.min(1, GA.bo + dt * 2.2); if (GA.bo >= 1) { GA.on = want; GG.visible = want; world.visible = !want; GA.t = 0; GU.uI.value.fill(0); if (want) sfx('hiss', .6); } }
  else GA.bo = Math.max(0, GA.bo - dt * (GA.on ? .9 : 2)); BLK.material.opacity = GA.bo; BLK.visible = GA.bo > .005;
  hud.visible = show.visible = !GA.on; if (!GA.on) return; GA.t += dt; const t = GA.t; P.vx = P.vz = P.vf = 0; // parked
  TUBES.forEach((tb, i) => { const t0 = .3 + i * .42, on = t > t0, st = t - t0; let f = 0; if (on) f = st < .55 ? ((Math.sin(st * 70 + i) > .3) || (st > .32 && st < .4) ? 1 : .08) * (st < .2 ? .6 : 1) : 1; // a fluorescent tube: ping, stutter, on
    if (on && !tb.pinged) { tb.pinged = 1; sfxAt('tick', GG.localToWorld(tb.c.clone()), .7); } if (st > .55 && !tb.clunk) { tb.clunk = 1; sfxAt('clunk', GG.localToWorld(tb.c.clone()), .5); }
    if (!on) tb.pinged = tb.clunk = 0; GU.uI.value[i] = f; tb.m.material.color.copy(tb.col).multiplyScalar(.15 + f * .85); });
  GA.sign.material.opacity = GA.glow.material.opacity = t > 1.7 ? (t < 2.1 && Math.sin(t * 60) < 0 ? .25 : 1) : 0; GA.glow.material.opacity *= .55 + .05 * Math.sin(T * 9); // and the neon buzzes on last
  while (GA.q.length && T >= GA.q[0].t) GA.q.shift().f(); // the job list
  // the robot: idles looking at you, reaches for the part when there is a job, works it, comes back and nods
  const busy = GA.busy; if (busy) { GG.worldToLocal(rig.localToWorld(_v.copy(GA.wp))); _v.z = Math.min(_v.z, -1.04); _v.y = clamp(_v.y, -.32, .25); _v.x = clamp(_v.x, CX - .7, CX + .75); _v.sub(ARM.g.position); _v.x += rand(-1, 1) * .006; _v.y += rand(-1, 1) * .006; ARM.done = T; }
  else { const nod = T - (ARM.done || -9) < .8 ? Math.sin((T - ARM.done) * 16) * .05 : 0; _v.set(-.5 + Math.sin(T * .45) * .12, 1.78 + Math.sin(T * .7) * .05 + nod, .75 + Math.sin(T * .31) * .1); if (Math.sin(T * .13) > .8) _v.x += .45; } // now and then it looks at the toolbox
  ARM.tg.lerp(_v, damp(dt, busy ? .09 : .3)); armPose(ARM.tg); ARM.sock.rotation.y += busy && GA.kind !== 'paint' ? dt * 60 : 0; ARM.can.visible = busy && GA.kind === 'paint'; ARM.wr.visible = !ARM.can.visible;
  ARM.blink = T % 3.7 < .12; ARM.face.material.map = ARM.blink ? FACE[1] : busy ? FACE[2] : FACE[0];
  if (busy) { ARM.tip.getWorldPosition(_v); GG.worldToLocal(_v); if (GA.kind === 'paint') { for (let i = 0; i < 3; i++) GSP.emit(_v, _v2.set(rand(-.3, .3), rand(-.3, .2), rand(.2, 1.2)).applyQuaternion(ARM.tip.getWorldQuaternion(_q)), _c.set(THEMES.find(q => q.id === (SHOP.pv || SAVE.theme)).c[0]), rand(.3, .6)); }
    else { if (Math.random() < dt * 45) GSP.emit(_v, _v2.set(rand(-1.5, 1.5), rand(.5, 3), rand(-1.5, 1.5)), SPC, rand(.3, .7)); if (Math.random() < dt * 30) CSP.emit(GA.wp, _v2.set(rand(-.4, .4), rand(.1, .6), rand(-.4, .4)), SPC, rand(.2, .45)); } }
  if (T > GA.amb) { GA.amb = T + rand(5, 11); sfxAt(pick(['clank', 'ratchet', 'hiss']), GG.localToWorld(_v.set(rand(-3, 4), 0, rand(-5, 4))), .25); } } // the shop is never quiet
const BLK = new THREE.Mesh(new THREE.SphereGeometry(40, 16, 10), new THREE.MeshBasicMaterial({ color: '#05030c', side: THREE.BackSide, transparent: true, opacity: 0, depthTest: false, depthWrite: false, ...STEN })); BLK.renderOrder = RO.fx + 3; BLK.visible = false; rig.add(BLK);
function sparks(dt) { CSP.update(dt, 4); GSP.update(dt, 6); garage(dt); }

// ── the key moment: until the key is in, the cabin sinks into shadow and a warm spot picks out the key, so your eye goes straight to it
const KSPOT = new THREE.PointLight('#ffe1a8', 0, .5, 1.5); cab.add(KSPOT); const KHALO = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT, color: '#ffd27a', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })); KHALO.scale.setScalar(.12); cab.add(KHALO);
function keyDim(dt) { const want = ['ready', 'boot', 'place'].includes(G.phase) && KEYS.state !== 'in' && !KEYS.auto ? 1 : 0; KEYS.dim = (KEYS.dim || 0) + (want - (KEYS.dim || 0)) * damp(dt, want ? .25 : .12); const d = KEYS.dim;
  hemiL.intensity *= 1 - d * .78; sunL.intensity *= 1 - d * .85; KSPOT.position.copy(KG.position).add(_v.set(0, .08, .05)); KSPOT.intensity = d * 1.6; KHALO.position.copy(KG.position); KHALO.material.opacity = d * (.45 + .2 * Math.sin(T * 3)); }
