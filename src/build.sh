#!/bin/sh
# joins parts/ into dist/index.html (the game is one file), and makes a local test copy that loads three.js from node_modules
mkdir -p dist/assets && cat parts/00-head.html parts/10-core.js parts/20-track.js parts/30-world.js parts/40-cockpit.js parts/50-audio.js parts/60-game.js parts/65-prizes.js parts/66-start.js parts/68-ppg.js parts/70-main.js > dist/index.html
cp hand-left.glb hand-right.glb dist/assets/ && cp nxtwebxr.png favicon.png dist/
sed -e 's#https://cdn.jsdelivr.net/npm/three@0.150.1/build/#/node_modules/three/build/#' -e 's#https://cdn.jsdelivr.net/npm/three@0.150.1/examples/jsm/#/node_modules/three/examples/jsm/#' -e 's#<link href="https://fonts[^>]*>##' dist/index.html > dist/test.html
