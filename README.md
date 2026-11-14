# Sunday Driver

Mixed-reality first-person racing for **Meta Quest 3**, in the browser (WebXR + three.js). One HTML file, no build step needed to host it; all sound is synthesized. A [NXT/WebXR](https://www.nxtwebxr.com) production, built on the die Hände skeleton.

A dashboard appears in your room. Press the red START button, the wipers sweep, and behind the windscreen there is another world. Windscreen and side windows are a stencil portal; everything else is your room.

- **Hands only.** Grab the rim to steer (a hand on the wheel = throttle, let go = brake). Pull the handbrake to drift; release it for a drift boost. Tap the hub to honk. Controllers work as a fallback.
- **1 vs 6, three laps, three looks:** sunny, rain (puddles, drops on the glass, wipers), golden hour.
- `?sim` on a desktop: arrows/WASD steer, space = handbrake, enter = start, H = horn. `__SD.go('race' | 'rain' | 'dusk' | 'ready' | 'crank')` jumps to a moment.
- `CFG` at the top of the script holds the tuning (speed, grip, corner assist, wheel and handbrake reach).

Source lives in `src/parts/`; `src/build.sh` joins the parts into `index.html`. Hand meshes: `@webxr-input-profiles/assets` (MIT).
