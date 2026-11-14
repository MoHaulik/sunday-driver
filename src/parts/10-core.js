import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as skClone } from 'three/addons/utils/SkeletonUtils.js';
import { mergeBufferGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

await Promise.race([Promise.all(['800 30px Unbounded', '700 30px "Chakra Petch"', 'italic 700 30px "Chakra Petch"', '500 30px "Chakra Petch"'].map(f => document.fonts.load(f))), new Promise(r => setTimeout(r, 3000))]).catch(() => { }); // the dials, the screens and the shop signs are painted with these

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
  HB: { x: .455, y: -.5, z: .03, len: .22, grab: .09, drop: .2 }, START: { x: .215, y: -.277, z: -.556 },
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
// The sky is one function of a direction, so puddles and the sea can reflect the very same clouds. Cumulus the way background painters do them: hard edges, a lit side and a blue-grey side.
const SKY = `uniform vec3 uSunT,uSunC,uZen,uHor,uCl,uCs,uFogC;uniform float uCov,uSunI,uTime;
float cl(vec3 d,int o){vec3 p=d*vec3(2.2,5.5,2.2)+vec3(uTime*.006,0.,0.);float n=vn3(p)*.55+vn3(p*2.1+3.1)*.28;if(o>0)n+=vn3(p*4.3+7.7)*.17;else n+=.085;return n;}
vec3 sky(vec3 d,int o){float h=max(d.y,0.);vec3 c=mix(uHor,uZen,pow(h,.5));
  float sd=max(dot(d,uSunT),0.);c+=uSunC*(smoothstep(.9992,.9996,sd)*1.5+pow(sd,24.)*.22+pow(sd,4.)*.08)*uSunI;
  float thr=uCov+h*.55,n=cl(d,o),m=smoothstep(thr,thr+.03,n)*smoothstep(-.01,.05,d.y);
  if(m>.001){float n2=cl(normalize(d+uSunT*.07),0),lit=smoothstep(-.02,.05,n-n2+.02);vec3 cc=mix(uCs,uCl,lit);cc=mix(cc,uCl,smoothstep(thr+.03,thr,n)*.5);c=mix(c,cc,m);}
  return mix(uFogC,c,smoothstep(-.02,.06,d.y));}`;
const u = v => ({ value: v }), col = h => new C(h);
const UW = { uSun: u(new V(0, 1, 0)), uSunT: u(new V(0, 1, 0)), uSunC: u(col('#fff')), uShC: u(col('#fff')), uFogC: u(col('#fff')), uZen: u(col('#fff')), uHor: u(col('#fff')), uCl: u(col('#fff')), uCs: u(col('#fff')), uSeaA: u(col('#fff')), uSeaB: u(col('#fff')),
  uFog: u(.0016), uCov: u(.5), uSunI: u(1), uWet: u(0), uTime: u(0), uEye: u(new V()) };
//           day        rain       golden hour
const LOOK = { uSunC: ['#fff7ea', '#b3bcc6', '#ffb87e'], uShC: ['#8e9fdc', '#7f8a9c', '#80609e'], uZen: ['#2a7be8', '#5f6c78', '#3a4fa3'], uHor: ['#bfe8ff', '#a9b3ba', '#ffc79c'], uCl: ['#ffffff', '#c4cacf', '#ffdcbc'], uCs: ['#b4c9ee', '#8a939b', '#c9809a'],
  uFogC: ['#cbeafc', '#a6b0b7', '#f5c3a4'], uSeaA: ['#2fb4dc', '#62767f', '#e09a82'], uSeaB: ['#1a5fc8', '#4a5a66', '#5a4da0'] }, LOOKN = { uFog: [.0016, .0048, .0021], uCov: [.5, .16, .46], uSunI: [1, 0, 1.25], uWet: [0, 1, .2] };
for (const k in LOOK) LOOK[k] = LOOK[k].map(col);
const SUND = [new V(.42, .78, .46).normalize(), new V(.42, .78, .46).normalize(), new V(-.82, .17, .5).normalize()];
const WX = { w: [1, 0, 0], t: [1, 0, 0], rain: 0 };
const sunL = new THREE.DirectionalLight('#fff', 2.4), hemiL = new THREE.HemisphereLight('#cfe6ff', '#3a3530', .5); scene.add(sunL, sunL.target, hemiL); // these light the cockpit, and follow the world's sun as the car turns
function weather(dt, now) {
  const w = WX.w; for (let i = 0; i < 3; i++) w[i] = now ? WX.t[i] : w[i] + (WX.t[i] - w[i]) * damp(dt, 2.2); const s = w[0] + w[1] + w[2];
  for (const k in LOOK) { const c = UW[k].value.setRGB(0, 0, 0); for (let i = 0; i < 3; i++) { const a = LOOK[k][i], f = w[i] / s; c.r += a.r * f; c.g += a.g * f; c.b += a.b * f; } }
  for (const k in LOOKN) UW[k].value = (LOOKN[k][0] * w[0] + LOOKN[k][1] * w[1] + LOOKN[k][2] * w[2]) / s;
  UW.uSunT.value.set(0, 0, 0); for (let i = 0; i < 3; i++) UW.uSunT.value.addScaledVector(SUND[i], w[i]); UW.uSunT.value.normalize(); WX.rain = w[1] / s;
  UW.uSun.value.copy(UW.uSunT.value).transformDirection(world.matrixWorld); UW.uTime.value = T;
  rig.getWorldPosition(_v); sunL.position.copy(_v).addScaledVector(UW.uSun.value, 4); sunL.target.position.copy(_v); sunL.color.copy(UW.uSunC.value); sunL.intensity = 1.5 * UW.uSunI.value + .2;
  hemiL.color.copy(UW.uHor.value); hemiL.intensity = .32 + .15 * WX.rain;
}
