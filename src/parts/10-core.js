import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as skClone } from 'three/addons/utils/SkeletonUtils.js';
import { mergeBufferGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

await Promise.race([Promise.all(['800 30px Unbounded', '700 30px "Chakra Petch"', 'italic 700 30px "Chakra Petch"', '500 30px "Chakra Petch"', '700 30px Caveat'].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 3000))]).catch(() => { }); // the dials, the screens and the shop signs are painted with these

// ═══════════════════════════ CONFIG ═══════════════════════════
const SIM = /[?&]sim/.test(location.search); // desktop preview: arrow keys drive (see the SIM block at the bottom)
const C = THREE.Color, V = THREE.Vector3, Qn = THREE.Quaternion, MU = THREE.MathUtils;
const clamp = MU.clamp, lerp = MU.lerp, rand = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.random() * a.length | 0];
const s01 = p => { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); }, damp = (dt, tc) => 1 - Math.exp(-dt / tc), wrapPi = a => Math.atan2(Math.sin(a), Math.cos(a));
const _v = new V(), _v2 = new V(), _v3 = new V(), _v4 = new V(), _q = new Qn(), _q2 = new Qn(), _m = new THREE.Matrix4(), _c = new C();
const XA = new V(1, 0, 0), YA = new V(0, 1, 0), ZA = new V(0, 0, 1);
let seed = 11; const rnd = (a = 0, b = 1) => { seed = seed * 16807 % 2147483647; return a + seed / 2147483647 * (b - a); }, rpick = a => a[rnd() * a.length | 0]; // the town is the same town every time

// Two spaces. RIG space is the cockpit: origin = your eyes when you sit down, -z ahead, metres. TRACK space is the world behind the glass.
const CFG = {
  W: 5.5, EYE: 1.14, CX: .36, LAPS: 3,                     // half road width; eye height over the road; the car's centre line is this far to your right (left-hand drive)
  VMAX: 46, ACC: 11, GRIP: 22, ASSIST: .7,                 // m/s, m/s², lateral m/s² of grip; how much the car brakes itself into corners (0 = you are on your own)
  WHEEL: { y: -.30, z: -.42, tilt: .38, R: .185, full: 1.5, lock: 2.05, grab: .085, drop: .16 }, // full: wheel angle (rad) for full steering
  HB: { x: .455, y: -.5, z: .03, len: .22, grab: .09, drop: .2 }, START: { x: -.252, y: -.266, z: -.556 },
  SHIELD: { x: -.33, y: -.215, z: -.98, w: 1.38, top: .06, vy: .545, vz: .56 }, // windscreen: bottom-left corner, bottom width, how far the top corners come in, and the rise/run of the rake
  WIPER: { p: [[.10, -.02], [.76, -.02]], r0: .13, r1: .57, a0: .07, a1: 1.62, stroke: .52 },
  GRID: 7.5, AI: { grip: 15.5, vmax: 43.5, brake: 12, acc: 7.5 },
};

// ═══════════════════════════ CORE ═══════════════════════════
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(SIM ? 74 : 36, innerWidth / innerHeight, .04, 1500); scene.add(camera);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, stencil: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x000000, 0); renderer.xr.enabled = true; renderer.xr.setReferenceSpaceType('local-floor');
renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1; renderer.localClippingEnabled = true;
document.body.prepend(renderer.domElement);
const $ = id => document.getElementById(id);
const ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
// Premultiplied blending: rgb ADDS light, alpha DIMS what is behind (passthrough included). Dust, rain and shadows use it.
const PRE = { transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneMinusSrcAlphaFactor };
// THE PORTAL. The windows write 1 into the stencil buffer (only where the wipers have been); everything in the world is drawn only where the stencil is 1.
// Order: hands (depth only) → cockpit → window masks → sky → world → glass. So a pillar, the wheel or your own hand in front of a window still covers the world.
const STEN = { stencilWrite: true, stencilFunc: THREE.EqualStencilFunc, stencilRef: 1, stencilFail: THREE.KeepStencilOp, stencilZFail: THREE.KeepStencilOp, stencilZPass: THREE.KeepStencilOp };
const RO = { hand: -200, mask: 10, sky: 19, world: 20, fx: 24, glass: 30, hud: 40 };
let T = 0; const clock = new THREE.Clock();
const rig = new THREE.Group(), tilt = new THREE.Group(), world = new THREE.Group(); scene.add(rig); rig.add(tilt); tilt.add(world);
function ctex(w, h, srgb = true) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const tex = new THREE.CanvasTexture(cv); if (srgb) tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4; return { cv, ctx: cv.getContext('2d'), tex }; }

// ═══════════════════════════ LIGHT AND WEATHER: one set of uniforms for the whole world, blended between three looks (one per lap) ═══════════════════════════
const NOISE = `float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}
float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float vn3(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}`;
// The sky is one function of a direction, so puddles and the sea reflect the very same clouds. Y2K cartoon sky: a clean gradient, a flat sun with an ink ring, a sunburst, a few sparkles,
// and fourteen hand-shaped clouds of three kinds (a classic puff, a tall tower, a long low bank). Each is a union of round lobes cut flat underneath, cel-shaded against the sun,
// with a fat ink outline and short ink creases where two bumps meet. Cheap: whole clouds are skipped unless you look at them.
const CLD = (() => { const h = k => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }, C = [], L = [], NL = 12, dir = (a, e) => new V(Math.cos(e) * Math.sin(a), Math.sin(e), -Math.cos(e) * Math.cos(a)); let n = 0;
  const KIND = [ // lobes as [across, up from the flat bottom, radius], in units of the cloud's size
    k => [[-1.5, .3, .5], [-.8, .35, .62], [0, .3, .7], [.85, .32, .6], [1.5, .28, .45], [-1.05, .8, .55], [-.25, 1, .72], [.6, .95, .6], [.15, 1.55, .5], [-.55, 1.45, .38], [1.1, .7, .4], [-1.9, .2, .3]],
    k => [[-1.1, .3, .55], [-.35, .3, .62], [.4, .32, .6], [1.05, .3, .5], [-.7, .95, .55], [.1, 1.05, .62], [.75, .9, .48], [-.35, 1.65, .52], [.35, 1.75, .5], [0, 2.35, .5], [-.2, 2.8, .36], [.45, 2.6, .32]],
    k => [...Array(NL)].map((_, j) => j < 8 ? [(j - 3.5) * .52 + (h(k * 31 + j) - .5) * .2, .18 + h(k * 17 + j) * .22, .3 + h(k * 5 + j) * .2] : [(j - 9.5) * .62 + (h(k * 41 + j) - .5) * .4, .62 + h(k * 23 + j) * .4, .4 + h(k * 11 + j) * .22])];
  for (let k = 0; k < 14; k++) { const az = (k + h(k) * .6) / 14 * 6.283 + .4, kind = [0, 2, 1, 0, 2, 0, 1, 2, 0, 0, 2, 1, 0, 2][k], e0 = (kind === 2 ? .05 : .1) + h(k + 50) * (kind === 1 ? .16 : .3), R = (kind === 1 ? .07 : .075) + h(k + 90) * .045, sx = .85 + h(k + 7) * .4, flip = h(k + 3) < .5 ? -1 : 1;
    const lob = KIND[kind](k).map(([a, b, r], j) => [dir(az + a * flip * R * sx / Math.cos(e0), e0 + b * R), r * R * (.9 + h(k * 9 + j) * .2)]);
    const cen = lob.reduce((s, [d]) => s.add(d), new V()).normalize(), rad = Math.max(...lob.map(([d, r]) => Math.acos(Math.min(1, d.dot(cen))) + r));
    C.push([cen.x, cen.y, cen.z, Math.cos(rad * 1.25 + .01)], [Math.sin(e0), 0, R, 0]); lob.forEach(([d, r]) => L.push([d.x, d.y, d.z, r])); n++; }
  const f = a => a.map(v => `vec4(${v.map(x => x.toFixed(4)).join(',')})`).join(','); return `const int NC=${n},NL=${NL};const vec4 CC[${n * 2}]=vec4[${n * 2}](${f(C)});const vec4 CL[${n * NL}]=vec4[${n * NL}](${f(L)});`; })();
const SKY = `uniform vec3 uSunT,uSunC,uZen,uHor,uCl,uCs,uFogC;uniform float uCov,uSunI,uTime,uNight;${CLD}
vec2 cg(int i,vec3 e,float k){float a=-1.,b=-1.;for(int j=0;j<NL;j++){vec4 l=CL[i*NL+j];float r=l.w*k,g=(r*r-2.*(1.-dot(e,l.xyz)))/(2.*r);b=max(b,min(a,g));a=max(a,g);}return vec2(a,b);} // the biggest and second-biggest lobe: >0 inside, in radians from the edge
vec3 sky(vec3 d,int o){float h=max(d.y,0.),ca=cos(uTime*.004),sa=sin(uTime*.004);vec3 c=mix(uHor,uZen,smoothstep(0.,.62,pow(h,.75)));c=mix(c,uHor*1.06+.04,(1.-smoothstep(0.,.07,h))*.6); // a bright band on the horizon
  float sd=dot(d,uSunT),r0=mix(.99905,.9958,uNight),sun=smoothstep(r0,r0+.00015+.0003*uNight,sd),mi=max(uSunI,uNight);c+=uSunC*(pow(max(sd,0.),28.)*.25+pow(max(sd,0.),5.)*.08)*uSunI+vec3(.45,.5,1.)*(pow(max(sd,0.),90.)*.35+pow(max(sd,0.),12.)*.1)*uNight; // night: a big moon with a cold halo
  c=mix(c,mix(c,vec3(.11,.07,.2),.55),smoothstep(r0-.0003-.0004*uNight,r0-.00015-.0002*uNight,sd)*(1.-sun)*mi);vec3 mp=(d-uSunT*sd)*260.;c=mix(c,mix(uSunC*1.25+.1,vec3(.96,.94,1.)*(1.-.22*smoothstep(.45,.75,vn(mp.xy*1.3+mp.z))-.1*vn(mp.xy*4.+mp.z)),uNight),sun*mi);
  if(o>0){vec3 ta=normalize(cross(uSunT,vec3(0.,1.,.001))),tb=cross(uSunT,ta);float ry=step(.5,fract(atan(dot(d,tb),dot(d,ta))*2.546+uTime*.012));c=mix(c,c*1.04+uSunC*.1,ry*smoothstep(.5,.97,sd)*(1.-smoothstep(.998,.9989,sd))*min(uSunI,1.)*(1.-uNight));} // the Townsville sunburst: sixteen slow rays round the sun
  if(o>0&&h>.15){vec2 q=d.xz/(1.+d.y)*34.,id=floor(q),f=fract(q)-.5;float r=h1(id);if(r>.93-.2*uNight){vec2 p=f-(vec2(h1(id+4.1),h1(id+8.3))-.5)*.5;float s=(1.-smoothstep(0.,.06,abs(p.x)*abs(p.y)*90.+length(p)*2.2))*(.55+.45*sin(uTime*2.+r*40.));c=mix(c,vec3(1.,.93,.98),s*smoothstep(.15-.12*uNight,.4-.3*uNight,h)*(.8+.2*uNight));}} // sparkles
  vec3 e=vec3(d.x*ca-d.z*sa,d.y,d.x*sa+d.z*ca),sh=vec3(uSunT.x*ca-uSunT.z*sa,uSunT.y,uSunT.x*sa+uSunT.z*ca);float k=1.+(.5-uCov)*.8,lw=.0045;vec3 ic=mix(uCs,vec3(.11,.07,.2),.75),cs=mix(uCs,uCl,.25);
  for(int i=0;i<NC;i++){if(dot(e,CC[i*2].xyz)<CC[i*2].w-(k-1.)*.03)continue;vec2 g=cg(i,e,k);float yb=e.y-CC[i*2+1].x,G=min(g.x,yb);if(G<-lw)continue; // back to front: each cloud paints over the last, outline and all
    float R=CC[i*2+1].z,lit=1.;if(o>0){vec3 s2=normalize(sh-e*dot(sh,e)+vec3(0.,.0001,0.)),q=normalize(e-s2*R*.22);vec2 g2=cg(i,q,k);lit=smoothstep(-.0005,.0005,min(g2.x,q.y-CC[i*2+1].x));} // cel shadow: where a step away from the sun leaves the cloud
    vec3 cc=mix(cs,uCl,lit);cc=mix(cc,mix(cs,ic,.18),1.-smoothstep(.0,.006,yb)); // a darker band along the flat bottom
    float cr=(1.-smoothstep(.0009,.0021,abs(g.x-g.y)))*step(0.,g.y)*(1.-smoothstep(R*.03,R*.065,G))*smoothstep(R*.3,R*.45,yb); // a short ink hook where two bumps meet, near the edge only
    c=mix(c,mix(cc,ic,max(1.-smoothstep(lw*.3,lw*.45,G),cr)),smoothstep(-lw*.75,-lw*.6,G));} // the stroke sits across the edge; outside it, the sky is left alone
  return mix(uFogC,c,smoothstep(-.02,.03,d.y));}`;
const u = v => ({ value: v }), col = h => new C(h);
// night light, in scene space: seven pairs of headlights (cone, soft edge, hot centre) and the eight street lamps nearest you
const LIT = `uniform vec4 uHL[7],uHD[7],uLP[8];uniform vec3 uLC[8];
vec3 nightLight(vec3 w,vec3 n){vec3 s=vec3(0.);for(int i=0;i<7;i++){vec3 L=w-uHL[i].xyz;float d=length(L)+.01;vec3 l=L/d;float k=dot(l,uHD[i].xyz),cn=smoothstep(.8,.92,k)*.5+smoothstep(.93,.99,k)*.7;s+=vec3(1.,.93,.8)*cn*uHL[i].w*(max(dot(n,-l),0.)*.7+.3)*30./(9.+d*d);}
  for(int i=0;i<8;i++){vec3 L=uLP[i].xyz-w;float d=length(L)+.01;s+=uLC[i]*uLP[i].w*(max(dot(n,L/d),0.)*.75+.25)*11./(5.+d*d*1.4);}return s;}`;
const UW = { uSun: u(new V(0, 1, 0)), uSunT: u(new V(0, 1, 0)), uSunC: u(col('#fff')), uShC: u(col('#fff')), uFogC: u(col('#fff')), uZen: u(col('#fff')), uHor: u(col('#fff')), uCl: u(col('#fff')), uCs: u(col('#fff')), uSeaA: u(col('#fff')), uSeaB: u(col('#fff')),
  uFog: u(.0016), uNight: u(0), uHL: u([...Array(7)].map(() => new THREE.Vector4())), uHD: u([...Array(7)].map(() => new THREE.Vector4())), uLP: u([...Array(8)].map(() => new THREE.Vector4())), uLC: u([...Array(8)].map(() => new V())), uCov: u(.5), uSunI: u(1), uWet: u(0), uTime: u(0), uEye: u(new V()) };
//           day        rain       golden hour
const LOOK = { uSunC: ['#fffdf6', '#c6bcdc', '#ffb884', '#5163b4'], uShC: ['#b891ea', '#8f84b8', '#a264cc', '#17153f'], uZen: ['#3fc4f7', '#7a6cab', '#7446d2', '#0b0930'], uHor: ['#ffd3ec', '#cbbbe0', '#ff9cc6', '#3d2a86'], uCl: ['#ffffff', '#e0d6ee', '#ffe3c4', '#9d93d8'], uCs: ['#ffbfe2', '#a797c8', '#ff8cba', '#3b3480'],
  uFogC: ['#ffdcef', '#c6b6dc', '#ffaecb', '#231a5c'], uSeaA: ['#45e3d6', '#8088bc', '#ff98ac', '#26357e'], uSeaB: ['#2f93f2', '#5c5ea0', '#7a4cc4', '#0c1046'] }, LOOKN = { uFog: [.0016, .0048, .0021, .0026], uCov: [.5, .16, .46, .52], uSunI: [1, 0, 1.25, .5], uWet: [0, 1, .2, .25] };
for (const k in LOOK) LOOK[k] = LOOK[k].map(col);
const SUND = [new V(.42, .78, .46).normalize(), new V(.42, .78, .46).normalize(), new V(-.82, .17, .5).normalize(), new V(.85, .26, .45).normalize()]; // day, rain, golden hour, and the moon
const WX = { w: [1, 0, 0, 0], t: [1, 0, 0], rain: 0, sink: 0 }; // four looks: day, rain, golden hour, night. sink: how far the golden sun has gone down
const sunL = new THREE.DirectionalLight('#fff', 2.4), hemiL = new THREE.HemisphereLight('#cfe6ff', '#7a4fc0', .5); scene.add(sunL, sunL.target, hemiL); // these light the cockpit, and follow the world's sun as the car turns
function weather(dt, now) {
  const w = WX.w, L = w.length; for (let i = 0; i < L; i++) w[i] = now ? WX.t[i] || 0 : w[i] + ((WX.t[i] || 0) - w[i]) * damp(dt, 2.2); const s = w.reduce((a, b) => a + b, 0) || 1; SUND[2].set(-.82, .17 - .25 * WX.sink, .5).normalize();
  for (const k in LOOK) { const c = UW[k].value.setRGB(0, 0, 0); for (let i = 0; i < L; i++) { const a = LOOK[k][i], f = w[i] / s; c.r += a.r * f; c.g += a.g * f; c.b += a.b * f; } }
  for (const k in LOOKN) { let v = 0; for (let i = 0; i < L; i++) v += LOOKN[k][i] * w[i]; UW[k].value = v / s; }
  UW.uSunT.value.set(0, 0, 0); for (let i = 0; i < L; i++) UW.uSunT.value.addScaledVector(SUND[i], w[i]); UW.uSunT.value.normalize(); WX.rain = w[1] / s; UW.uNight.value = w[3] / s;
  UW.uSun.value.copy(UW.uSunT.value).transformDirection(world.matrixWorld); UW.uTime.value = T;
  rig.getWorldPosition(_v); sunL.position.copy(_v).addScaledVector(UW.uSun.value, 4); sunL.target.position.copy(_v); sunL.color.copy(UW.uSunC.value); sunL.intensity = .75 * UW.uSunI.value + .12;
  hemiL.color.copy(UW.uHor.value); hemiL.intensity = .38 + .12 * WX.rain;
}
