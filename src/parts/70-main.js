
// ═══════════════════════════ LOOP ═══════════════════════════
const mouse = new THREE.Vector2();
const framePoster = () => { const w = innerWidth, h = innerHeight; if (w / h > 1.1) camera.setViewOffset(w, h, -w * .13, 0, w, h); else camera.setViewOffset(w, h, 0, h * .16, w, h); }; // the landing page: the car sits clear of the words
addEventListener('resize', () => { if (renderer.xr.isPresenting) return; camera.aspect = innerWidth / innerHeight; if (G.phase === 'poster') framePoster(); camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); });
function loop() {
  const dt = DBG.fdt || Math.min(clock.getDelta(), .05); T += dt;
  if (!renderer.xr.isPresenting) { // no headset: a camera over the passenger's shoulder for the poster, or in the driver's seat for ?sim
    if (G.phase === 'poster') { const a = Math.sin(T * .13) * .09; camera.position.set(.98 + a, .13, .6).applyMatrix4(rig.matrixWorld); camera.lookAt(rig.localToWorld(_v.set(.12, -.17, -.9))); }
    else { camera.position.copy(rig.position); camera.rotation.set(-.1 + mouse.y * .5, rig.rotation.y - mouse.x * 1.1, 0, 'YXZ'); }
    if (DBG.cam) DBG.cam(camera); camera.updateMatrixWorld(); }
  const sdt = T < G.slow ? dt * .3 : dt; // crossing the line: the world slows for a breath
  updHands(dt); flow(sdt); updWipers(sdt); setWorld(sdt); weather(sdt); parts.update(sdt); updRain(sdt, P.vf); prizes(dt, sdt); ppg(dt, sdt); world2(sdt); startFx(dt); screens(); updAudio(dt); vr(sdt); night(sdt); dome(sdt); storm(sdt); keyDim(sdt); ghost(sdt); sparks(dt); perf(dt); mirrors();
  renderer.render(scene, camera);
}

// ═══════════════════════════ SESSION ═══════════════════════════
const HOME = [new V(0, 1.2, 0), new V(0, 0, -1)];
function begin(xr) { WX.storm = WX.rainX = 0; camera.clearViewOffset(); $('ov').classList.add('hide'); G.fin.length = 0; G.place = 0; G.lap = 1; G.engine = 0; G.lights = 0; G.tipHB = G.usedHB = false; G.again = false; startReset(); IN.everHeld = false; WX.t = [1, 0, 0]; weather(0, true);
  grid(); openGlass(false); UG.uDust.value = 0; WS.a = WP.a0; WS.on = false; WS.want = 0; G.clipZ = -2.4; hud.material.opacity = 0;
  if (xr) setPhase('place'); else { camera.fov = 74; camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); seat(...HOME); setPhase('boot'); sfx('arrive'); } }
function end() { WX.storm = WX.rainX = 0; seat(...HOME); G.clipZ = 99; G.engine = 1; G.lights = 0; startReset(); setPower(1); KEYS.state = 'in'; grid(); openGlass(true); WS.want = 0; setPhase('poster'); $('ov').classList.remove('hide'); camera.fov = 36; camera.aspect = innerWidth / innerHeight; framePoster(); camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); }
$('go').onclick = async () => {
  audioInit(); if (SIM) return begin(false);
  if (!navigator.xr) { $('msg').textContent = 'Open this page in the browser of your Meta Quest'; return; }
  try { const s = await navigator.xr.requestSession('immersive-ar', { requiredFeatures: ['local-floor'], optionalFeatures: ['hand-tracking'] }); s.addEventListener('end', end); await renderer.xr.setSession(s); begin(true); }
  catch (e) { $('msg').textContent = 'Could not start · ' + e.message; }
};
// ?sim: drive at a desk. Arrows / WASD steer (down = lift off), space = handbrake, enter = start button, H = horn, mouse = look round
if (SIM) { addEventListener('mousemove', e => mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1)); addEventListener('keydown', e => { KEY[e.key.toLowerCase()] = true; if (e.key === ' ') e.preventDefault(); }); addEventListener('keyup', e => { KEY[e.key.toLowerCase()] = false; }); }
function go(to) { // test hook: jump straight to a moment
  if (G.phase === 'poster') begin(false); G.clipZ = 99; G.engine = 1; openGlass(true); RADIO.on = true; if (to === 'ready') { openGlass(false); return setPhase('ready'); } if (to === 'crank') { openGlass(false); return setPhase('crank'); }
  if (to === 'count') return setPhase('count'); setPhase('race'); IN.auto = false; G.t = 3; if (to === 'rain') { P.prog += TL * 1.2; RIV.forEach(r => r.prog += TL * 1.2); } if (to === 'dusk') { P.prog += TL * 2.1; RIV.forEach(r => r.prog += TL * 2.1); } if (to === 'night') { G.level = 2; WX.t = [0, 0, 0, 1]; WX.w = [0, 0, 0, 1]; } }
window.__SD = { hill, hill2, nearest, RADIO, KEYS, CDS, PL, startReset, SAVE, ITEMS, SHOP, SMIR, buy, install, mirrorBreak, rivMirror, burst, G, P, IN, WX, UG, WS, WH, HB, PH, RIV, DBG, CFG, KEY, PEND, go, loop, begin, end, heartShow, trackAt, carHit, wallHit, MIRR, strike, STRK, GH, PERF, quality, GA, garageIn, garageOut, work, ARM: typeof ARM !== "undefined" ? ARM : null, armPose, swatch, THEMES, SHOP_ITEMS: ITEMS, DUCK, VIS, BOB, STK, MADJ, duckOut, HV, rig, camera, scene, renderer, THREE, A, TL };

// ═══════════════════════════ BOOT ═══════════════════════════
(async () => {
  const loader = new GLTFLoader(); // the hand meshes only cut your real hands out of the picture; without them the game still runs
  try { const [l, r] = await Promise.all([loader.loadAsync('assets/hand-left.glb'), loader.loadAsync('assets/hand-right.glb')]); HANDSRC.left = l.scene; HANDSRC.right = r.scene; } catch (e) { console.warn('hand meshes', e); }
  weather(0, true); end();
  try { renderer.compile(scene, camera); } catch (e) { }
  renderer.setAnimationLoop(loop);
  $('go').disabled = false; $('go').textContent = SIM ? 'Drive' : 'Get in';
  $('msg').innerHTML = SIM ? 'Arrows steer · space handbrake · enter start' : 'Meta Quest 3 · Mixed reality · <span style="display:inline-block">Bare hands, no controllers</span>';
})();
</script></body></html>
