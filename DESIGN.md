# Sunday Driver: design rules

This is a living document. Each new feature has to pass the rules below, and when a feature teaches us something, we add it here.

## The four checks (every feature, every time)

1. **Hands.** Can you touch it, and does it answer back? Poking, pinching, slamming, flicking and throwing all count. Reading something off a screen does not. (Pass: the horn, the duck, the visor, the key. Fail: HUD text.)
2. **Your room.** Does it reach into the real room through passthrough: the floor, the cabin, the windows? (Pass: confetti on the floor, the duck thrown out of the window. Fail: anything that only exists behind the glass.)
3. **Depth.** Does it read in 3D when you move your head? Use parallax, real geometry, view-dependent rims, and near/mid/far layers. Anything painted flat on the sky is a last resort. (Pass: 3D clouds. Fail: the old sky-painted clouds.)
4. **Story.** Does the small thing tell a story? Trinkets have histories, THE LIST crosses names off, the medal is "7th of 7" until you beat it.

## Art direction

- **Powerpuff × Y2K.** Flat candy colours, a heavy dark-purple ink line (`#1d1233`) on everything solid, cel shading with hard band edges, sparkles and hearts, chrome only as an accent.
- **Light has three tones:** shadow, a mid-tone where light grazes, and lit. Add a rim that moves with your head. No smooth realistic gradients.
- **Neon belongs to the night:** pink `#ff5fc8` and cyan `#4fe0ff` lamps, warm `#ffd29a` in the cabin.
- **Original characters only.** Homage to the style, never copies of the cast.

## Frame budget (Quest 3, 72 Hz = 13.9 ms)

- Run `?perf` to show the in-cabin meter: fps, ms, draw calls and triangles, with the mirrors included.
- Automatic quality steps in when a frame stays over 14.5 ms for 2 s, and steps back up after 20 s of good frames.
  - **Q1:** halves the mirror refresh rate.
  - **Q2:** drops the far skyline and the cloud ink outlines.
  - **Q3:** halves the clouds and drops the rival streaks.
- Fixed foveation is on.
- **Night lighting** costs nothing by day, because the shader branches on `uNight`. Cars further than 110 m and lamps further than 70 m have zero weight.
- **Known hot spot:** cockpit draw calls. Every `mesh()` gets an ink-outline twin, so the next big win is merging static cockpit parts.
- **Rule:** a new feature has to state its cost in calls and triangles, and the ones that might cost frames ship with a Quest-mode fallback.

## Sound

- Every one-shot sound comes from where it happens (`sfxAt` for points, `spat(p, true)` for far things where only the direction counts).
- The radio plays from the dash and rival engines from the rival cars. Thunder arrives late, based on distance.

## Code map (`src/parts`, joined by `build.sh`)

| Part | What it holds |
| --- | --- |
| `10-core` | config, renderer, the sky function, weather looks (day, rain, golden hour, night), night-light shader code |
| `20-track` | the circuit spline |
| `30-world` | town, land, road, sea, cars, particles |
| `40-cockpit` | the cabin, wheel, glass portal, wipers, mirrors |
| `50-audio` | synthesised sound |
| `60-game` | input, physics, race flow, levels |
| `65-prizes` | ceremony, confetti, hologram shop, colour themes |
| `66-start` | key, ignition, CD picker |
| `68-ppg` | hero streaks, the win heart, 3D clouds, Townsville, impacts, trees |
| `69-vr` | real mirrors, hand toys, windows, deck, sky life, night, dome light, lightning, spatial sound, perf, ghost |
| `70-main` | the loop and session |
