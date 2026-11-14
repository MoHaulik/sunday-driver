
// ═══════════════════════════ AUDIO: every sound is synthesized. An engine that follows the revs, wind, tyres, rain, three rival engines placed in space, and a radio ═══════════════════════════
const A = { ctx: null }, RADIO = { on: false, next: 0, step: 0, st: 0, cool: 0 };
function audioInit() {
  if (A.ctx) { A.ctx.resume(); return; }
  const c = A.ctx = new (window.AudioContext || window.webkitAudioContext)();
  A.comp = c.createDynamicsCompressor(); A.comp.threshold.value = -14; A.comp.knee.value = 10; A.comp.ratio.value = 5; A.comp.attack.value = .003; A.comp.release.value = .2; A.comp.connect(c.destination);
  A.sfx = c.createGain(); A.sfx.gain.value = .8; A.sfx.connect(A.comp);
  const n = c.sampleRate * 2 | 0; A.nb = c.createBuffer(1, n, c.sampleRate); const d = A.nb.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const loopN = () => { const s = c.createBufferSource(); s.buffer = A.nb; s.loop = true; s.start(0, Math.random()); return s; };
  const osc = (type, f) => { const o = c.createOscillator(); o.type = type; o.frequency.value = f; o.start(); return o; };
  const gain = v => { const g = c.createGain(); g.gain.value = v; return g; }, filt = (type, f, q = 1) => { const b = c.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };
  const pan = (ref = 1) => { const p = c.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = ref; p.rolloffFactor = 1; return p; };
  // your engine: three oscillators a fifth and an octave apart, under a low-pass that opens with revs and throttle, and a slow lump in the idle
  A.engF = filt('lowpass', 300, 2.5); A.engG = gain(0); A.engO = [osc('sawtooth', 50), osc('square', 25), osc('sawtooth', 75)]; [.5, .4, .22].forEach((g, i) => A.engO[i].connect(gain(g)).connect(A.engF)); A.engF.connect(A.engG).connect(A.comp);
  A.lump = osc('sine', 11); A.lumpG = gain(0); A.lump.connect(A.lumpG).connect(A.engG.gain);
  A.windF = filt('bandpass', 500, .5); A.windG = gain(0); loopN().connect(A.windF).connect(A.windG).connect(A.comp);
  A.sqF = filt('bandpass', 1500, 5); A.sqG = gain(0); loopN().connect(A.sqF).connect(A.sqG).connect(A.comp);
  A.rainG = gain(0); loopN().connect(filt('highpass', 2600, .5)).connect(A.rainG).connect(A.comp); A.roofG = gain(0); loopN().connect(filt('bandpass', 380, 1.2)).connect(A.roofG).connect(A.comp);
  A.riv = [0, 1, 2].map(() => { const o = osc('sawtooth', 60), o2 = osc('square', 30), f = filt('lowpass', 650, 1.5), g = gain(0), p = pan(4); o.connect(f); o2.connect(gain(.5)).connect(f); f.connect(g).connect(p).connect(A.comp); return { o, o2, g, p }; });
  // the radio plays through the dashboard: band-limited like a small speaker, and placed where the speaker is
  A.radIn = gain(1); A.radG = gain(0); A.radP = pan(.7); A.radIn.connect(filt('highpass', 150, .7)).connect(filt('lowpass', 5200, .7)).connect(A.radG).connect(A.radP).connect(A.comp);
}
const aset = (param, v, tc = .06) => { if (A.ctx) param.setTargetAtTime(v, A.ctx.currentTime, tc); };
function tone(o, type, f, f2, d, g, t = 0, a = .004) { const c = A.ctx, t0 = c.currentTime + t, os = c.createOscillator(), gn = c.createGain(); os.type = type; os.frequency.setValueAtTime(f, t0);
  if (f2) os.frequency.exponentialRampToValueAtTime(f2, t0 + d); gn.gain.setValueAtTime(.0001, t0); gn.gain.exponentialRampToValueAtTime(Math.max(g, .0002), t0 + a); gn.gain.exponentialRampToValueAtTime(.0001, t0 + d);
  os.connect(gn).connect(o); os.start(t0); os.stop(t0 + d + .03); }
function noise(o, d, g, type = 'highpass', f = 1000, t = 0, f2, q = 1) { const c = A.ctx, t0 = c.currentTime + t, s = c.createBufferSource(), fl = c.createBiquadFilter(), gn = c.createGain(); s.buffer = A.nb;
  fl.type = type; fl.Q.value = q; fl.frequency.setValueAtTime(f, t0); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t0 + d); gn.gain.setValueAtTime(Math.max(g, .0002), t0); gn.gain.exponentialRampToValueAtTime(.0001, t0 + d);
  s.connect(fl).connect(gn).connect(o); s.start(t0, Math.random() * 1.5); s.stop(t0 + d + .02); }
function sfx(type, x = 1, y = 0) { if (!A.ctx) return; const o = A.sfx;
  switch (type) {
    case 'click': tone(o, 'square', 1900, 700, .035, .12); noise(o, .02, .12, 'highpass', 3000); break;
    case 'grab': tone(o, 'sine', 160, 90, .07, .2); noise(o, .04, .05, 'lowpass', 700); break;
    case 'arrive': tone(o, 'sine', 110, 520, 1.6, .1, 0, .5); tone(o, 'triangle', 220, 1040, 1.6, .04, 0, .6); noise(o, 1.6, .03, 'bandpass', 600, 0, 5200, 3); break;
    case 'starter': for (let i = 0; i < 9; i++) { tone(o, 'sawtooth', 62 + i * 2, 48, .09, .22, i * .105); noise(o, .07, .1, 'bandpass', 900, i * .105, 500, 2); } break;
    case 'catch': tone(o, 'sawtooth', 48, 130, .5, .3, 0, .03); noise(o, .5, .2, 'lowpass', 900, 0, 200); break;
    case 'wipe': noise(o, .5, .05, 'bandpass', x > 0 ? 500 : 1300, 0, x > 0 ? 1300 : 500, 3); tone(o, 'sine', 95, 60, .06, .16, .0); break;
    case 'washer': noise(o, .7, .07, 'highpass', 3200); tone(o, 'sawtooth', 190, 230, .7, .02); break;
    case 'whirr': tone(o, 'sawtooth', 150, 185, 1.15, .035, 0, .05); noise(o, 1.15, .02, 'bandpass', 1400, 0, 1800, 4); tone(o, 'sine', 80, 50, .08, .2, 1.15); break;
    case 'beep': tone(o, 'sine', x, 0, y || .16, .28); tone(o, 'triangle', x * 2, 0, y || .16, .06); break;
    case 'bump': tone(o, 'sine', 120, 42, .2, .6 * x); noise(o, .14, .35 * x, 'lowpass', 500); break;
    case 'scrape': noise(o, .28, .22 * x, 'bandpass', 2300, 0, 1500, 2.5); tone(o, 'sawtooth', 310, 110, .22, .08 * x); break;
    case 'horn': for (const f of [415, 523]) { tone(o, 'sawtooth', f, 0, .42, .09, 0, .01); tone(o, 'square', f, 0, .42, .04, 0, .01); } break;
    case 'splash': noise(o, .6, .4, 'lowpass', 2600, 0, 260); noise(o, .3, .15, 'highpass', 2000); break;
    case 'boost': tone(o, 'sawtooth', 180, 900, .5, .1, 0, .05); noise(o, .6, .12, 'bandpass', 800, 0, 4200, 2); break;
    case 'ratchet': for (let i = 0; i < 3; i++) tone(o, 'square', 1200 - i * 90, 500, .02, .09, i * .045); break;
    case 'shift': noise(o, .06, .05, 'lowpass', 500); break;
    case 'lap': tone(o, 'sine', 880, 0, .12, .2); tone(o, 'sine', 1320, 0, .3, .2, .12); break;
    case 'whoosh': noise(o, .45, .1 * x, 'bandpass', 500, 0, 1500, 1.5); break;
    case 'fanfare': [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => { tone(o, 'triangle', f, 0, i === 6 ? .9 : .16, .16, i * .13); tone(o, 'square', f / 2, 0, i === 6 ? .9 : .16, .04, i * .13); }); break;
  } }
// the radio: sixteen steps a bar, four bars round. FMaj7, Em7, Dm7, G7, the way a summer afternoon sounds
const STATIONS = [{ name: 'NXT FM · Sunday Drive', bpm: 104, ch: [[5, 9, 12, 16], [4, 7, 11, 14], [2, 5, 9, 12], [7, 11, 14, 17]] }, { name: 'Radio Kyst · Night Shift', bpm: 86, ch: [[9, 12, 16, 19], [5, 9, 12, 16], [2, 5, 9, 12], [4, 8, 11, 14]] }, { name: 'Radio off', bpm: 100, ch: null }], hz = n => 130.81 * 2 ** (n / 12);
function radio() { const ST = STATIONS[RADIO.st]; if (!A.ctx || !RADIO.on || !ST.ch) return; const c = A.ctx, o = A.radIn, st = 60 / ST.bpm / 4; if (RADIO.next < c.currentTime - .3) RADIO.next = c.currentTime + .05;
  const nt = (type, f, t, d, g, a = .005) => { const os = c.createOscillator(), gn = c.createGain(); os.type = type; os.frequency.value = f; gn.gain.setValueAtTime(.0001, t); gn.gain.exponentialRampToValueAtTime(g, t + a); gn.gain.exponentialRampToValueAtTime(.0001, t + d); os.connect(gn).connect(o); os.start(t); os.stop(t + d + .02); };
  const ns = (t, d, g, f, type = 'highpass') => { const s = c.createBufferSource(), fl = c.createBiquadFilter(), gn = c.createGain(); s.buffer = A.nb; fl.type = type; fl.frequency.value = f; gn.gain.setValueAtTime(g, t); gn.gain.exponentialRampToValueAtTime(.0001, t + d); s.connect(fl).connect(gn).connect(o); s.start(t, Math.random()); s.stop(t + d + .02); };
  while (RADIO.next < c.currentTime + .18) { const t = RADIO.next, s = RADIO.step % 16, bar = (RADIO.step >> 4) % 4, ch = ST.ch[bar], sw = s % 2 ? st * .16 : 0, T0 = t + sw;
    if (s % 4 === 0) { const os = c.createOscillator(), gn = c.createGain(); os.frequency.setValueAtTime(140, T0); os.frequency.exponentialRampToValueAtTime(48, T0 + .11); gn.gain.setValueAtTime(.5, T0); gn.gain.exponentialRampToValueAtTime(.0001, T0 + .2); os.connect(gn).connect(o); os.start(T0); os.stop(T0 + .22); } // kick
    if (s === 4 || s === 12) { ns(T0, .14, .2, 1500, 'bandpass'); nt('triangle', 190, T0, .08, .12); } ns(T0, s % 4 === 2 ? .09 : .03, s % 2 ? .035 : .06, 7000);                                                                                 // snare, hats
    if ([0, 3, 6, 8, 11, 14].includes(s)) nt('triangle', hz(ch[0] - 12 + (s === 6 || s === 14 ? 12 : 0)), T0, st * 1.7, .34, .008);                                                                                                           // bass
    if (s === 0 || s === 6 || s === 10) for (const n of ch) { nt('sine', hz(n + 12), T0, s ? st * 1.6 : st * 5, .075); nt('triangle', hz(n + 12) * 2.005, T0, st * 1.2, .018); }                                                                 // electric piano
    const mel = [[16, 0, 14, 0, 12, 0, 9, 12, 0, 0, 14, 0, 16, 0, 19, 0], [14, 0, 0, 11, 0, 14, 0, 0, 16, 0, 14, 0, 11, 0, 7, 0], [12, 0, 9, 0, 12, 0, 14, 16, 0, 0, 12, 0, 9, 0, 5, 0], [11, 0, 14, 0, 17, 0, 14, 0, 19, 0, 17, 0, 14, 11, 0, 0]][bar][s];
    if (mel && !RADIO.st && (RADIO.step >> 6) % 2) nt('square', hz(mel + 12), T0, st * 1.5, .03, .01); RADIO.next += st; RADIO.step++; } }
function updateListener() { if (!A.ctx) return; const L = A.ctx.listener; camera.getWorldPosition(_v); camera.getWorldDirection(_v4); _v3.copy(YA).applyQuaternion(camera.getWorldQuaternion(_q));
  if (L.positionX) { L.positionX.value = _v.x; L.positionY.value = _v.y; L.positionZ.value = _v.z; L.forwardX.value = _v4.x; L.forwardY.value = _v4.y; L.forwardZ.value = _v4.z; L.upX.value = _v3.x; L.upY.value = _v3.y; L.upZ.value = _v3.z; } }
const setPan = (p, v) => { p.positionX.value = v.x; p.positionY.value = v.y; p.positionZ.value = v.z; };
