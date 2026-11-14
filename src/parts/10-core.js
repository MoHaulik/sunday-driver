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
// The sky is one function of a direction, so puddles and the sea reflect the very same clouds. Y2K cartoon sky: a clean gradient, a flat sun with an ink ring, a few sparkles,
// and sixteen hand-placed puffs of cumulus, each a cluster of round lobes with a flat bottom, a lavender belly and an ink outline. Cheap: whole clusters are skipped unless you look at them.
const CLD = (() => { const h = k => { const x = Math.sin(k * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }, C = [], L = [], dir = (a, e) => [Math.cos(e) * Math.sin(a), Math.sin(e), -Math.cos(e) * Math.cos(a)]; let n = 0;
  const cloud = (az, e0, R, sq, bumps) => { C.push([...dir(az, e0 + R * .4), Math.cos(R * 2.2)], [Math.sin(e0), sq, 0, 0]); // per cloud: where it is, its flat bottom, how squashed
    for (let j = 0; j < 8; j++) { const t = j / 7 - .5, top = 1 - Math.abs(t) * 1.7, r = R * (.3 + .42 * Math.max(top, 0) * bumps + h(n * 7 + j) * .16), u = t * R * 2.6 + (h(n * 3 + j) - .5) * R * .25, v = r * (.15 + h(n * 11 + j) * .45) * (1 + top * .6); L.push([...dir(az + u / Math.cos(e0), e0 + v), r]); } n++; };
  for (let k = 0; k < 16; k++) cloud((k + h(k + 300)) / 16 * 6.283, .004 + h(k + 400) * .018, .11 + h(k + 500) * .09, 7, .7);          // a low band of long flat clouds sitting on the horizon
  for (let k = 0; k < 30; k++) cloud((k + h(k) * .8) / 30 * 6.283 + 1.3, .045 + h(k + 50) ** 1.3 * .42, .06 + h(k + 90) ** 1.4 * .11, 0, 1); // puffs, big and small, at every height
  const f = a => a.map(v => `vec4(${v.map(x => x.toFixed(4)).join(',')})`).join(','); return `const int NC=${n};const vec4 CC[${n * 2}]=vec4[${n * 2}](${f(C)});const vec4 CL[${n * 8}]=vec4[${n * 8}](${f(L)});`; })();
const SKY = `uniform vec3 uSunT,uSunC,uZen,uHor,uCl,uCs,uFogC;uniform float uCov,uSunI,uTime;${CLD}
float cg(int i,vec3 e,float k){float g=-1.,sq=CC[i*2+1].y;for(int j=0;j<8;j++){vec4 l=CL[i*8+j];float r=l.w*k,dy=e.y-l.y,t2=2.*(1.-dot(e,l.xyz))+sq*dy*dy;g=max(g,(r*r-t2)/(2.*r));}return min(g,e.y-CC[i*2+1].x);} // >0 inside the cloud, in radians from its edge
vec3 sky(vec3 d,int o){float h=max(d.y,0.),ca=cos(uTime*.004),sa=sin(uTime*.004);vec3 c=mix(uHor,uZen,smoothstep(0.,.62,pow(h,.75)));c=mix(c,uHor*1.06+.04,(1.-smoothstep(0.,.07,h))*.6); // a bright band on the horizon
  float sd=dot(d,uSunT),sun=smoothstep(.99905,.9992,sd);c+=uSunC*(pow(max(sd,0.),28.)*.25+pow(max(sd,0.),5.)*.08)*uSunI;c=mix(c,mix(c,vec3(.11,.07,.2),.55),smoothstep(.99875,.9989,sd)*(1.-sun)*uSunI);c=mix(c,uSunC*1.25+.1,sun*uSunI);
  if(o>0&&h>.15){vec2 q=d.xz/(1.+d.y)*34.,id=floor(q),f=fract(q)-.5;float r=h1(id);if(r>.93){vec2 p=f-(vec2(h1(id+4.1),h1(id+8.3))-.5)*.5;float s=(1.-smoothstep(0.,.06,abs(p.x)*abs(p.y)*90.+length(p)*2.2))*(.55+.45*sin(uTime*2.+r*40.));c=mix(c,vec3(1.,.93,.98),s*smoothstep(.15,.4,h)*.8);}} // sparkles
  vec3 e=vec3(d.x*ca-d.z*sa,d.y,d.x*sa+d.z*ca),sh=normalize(vec3(uSunT.x*ca-uSunT.z*sa,0.,uSunT.x*sa+uSunT.z*ca)+vec3(0.,-.0001,0.));float k=1.+(.5-uCov)*1.1,ink=1.-smoothstep(.0022,.0034,0.);vec3 ic=mix(uCs,vec3(.11,.07,.2),.78);
  for(int i=0;i<NC;i++){if(dot(e,CC[i*2].xyz)<CC[i*2].w-(k-1.)*.03)continue;float g=cg(i,e,k);if(g<-.0001)continue; // clouds are drawn back to front: each one paints over the last, outline and all
    float base=e.y-CC[i*2+1].x,g2=o>0?cg(i,normalize(e-sh*.014-vec3(0.,.006,0.)),k):1.;vec3 cc=mix(uCs,uCl,smoothstep(-.0004,.0012,g2));cc=mix(uCs,cc,smoothstep(.003,.009,base)); // cel shading: a crescent of shadow on the side away from the sun, and a shaded belly
    c=mix(cc,ic,1.-smoothstep(.0018,.0032,g));}
  return mix(uFogC,c,smoothstep(-.02,.03,d.y));}`;
const u = v => ({ value: v }), col = h => new C(h);
const UW = { uSun: u(new V(0, 1, 0)), uSunT: u(new V(0, 1, 0)), uSunC: u(col('#fff')), uShC: u(col('#fff')), uFogC: u(col('#fff')), uZen: u(col('#fff')), uHor: u(col('#fff')), uCl: u(col('#fff')), uCs: u(col('#fff')), uSeaA: u(col('#fff')), uSeaB: u(col('#fff')),
  uFog: u(.0016), uCov: u(.5), uSunI: u(1), uWet: u(0), uTime: u(0), uEye: u(new V()) };
//           day        rain       golden hour
const LOOK = { uSunC: ['#fffdf6', '#c6bcdc', '#ffb884'], uShC: ['#b891ea', '#8f84b8', '#a264cc'], uZen: ['#3fc4f7', '#7a6cab', '#7446d2'], uHor: ['#ffd3ec', '#cbbbe0', '#ff9cc6'], uCl: ['#ffffff', '#e0d6ee', '#ffe3c4'], uCs: ['#ffbfe2', '#a797c8', '#ff8cba'],
  uFogC: ['#ffdcef', '#c6b6dc', '#ffaecb'], uSeaA: ['#45e3d6', '#8088bc', '#ff98ac'], uSeaB: ['#2f93f2', '#5c5ea0', '#7a4cc4'] }, LOOKN = { uFog: [.0016, .0048, .0021], uCov: [.5, .16, .46], uSunI: [1, 0, 1.25], uWet: [0, 1, .2] };
for (const k in LOOK) LOOK[k] = LOOK[k].map(col);
const SUND = [new V(.42, .78, .46).normalize(), new V(.42, .78, .46).normalize(), new V(-.82, .17, .5).normalize()];
const WX = { w: [1, 0, 0], t: [1, 0, 0], rain: 0 };
const sunL = new THREE.DirectionalLight('#fff', 2.4), hemiL = new THREE.HemisphereLight('#cfe6ff', '#7a4fc0', .5); scene.add(sunL, sunL.target, hemiL); // these light the cockpit, and follow the world's sun as the car turns
function weather(dt, now) {
  const w = WX.w; for (let i = 0; i < 3; i++) w[i] = now ? WX.t[i] : w[i] + (WX.t[i] - w[i]) * damp(dt, 2.2); const s = w[0] + w[1] + w[2];
  for (const k in LOOK) { const c = UW[k].value.setRGB(0, 0, 0); for (let i = 0; i < 3; i++) { const a = LOOK[k][i], f = w[i] / s; c.r += a.r * f; c.g += a.g * f; c.b += a.b * f; } }
  for (const k in LOOKN) UW[k].value = (LOOKN[k][0] * w[0] + LOOKN[k][1] * w[1] + LOOKN[k][2] * w[2]) / s;
  UW.uSunT.value.set(0, 0, 0); for (let i = 0; i < 3; i++) UW.uSunT.value.addScaledVector(SUND[i], w[i]); UW.uSunT.value.normalize(); WX.rain = w[1] / s;
  UW.uSun.value.copy(UW.uSunT.value).transformDirection(world.matrixWorld); UW.uTime.value = T;
  rig.getWorldPosition(_v); sunL.position.copy(_v).addScaledVector(UW.uSun.value, 4); sunL.target.position.copy(_v); sunL.color.copy(UW.uSunC.value); sunL.intensity = .75 * UW.uSunI.value + .12;
  hemiL.color.copy(UW.uHor.value); hemiL.intensity = .38 + .12 * WX.rain;
}
