# Assets

Sprites and audio are generated programmatically at runtime:

- Sprites: `js/scenes/BootScene.js` (Phaser Graphics API)
- Audio: `js/AudioManager.js` (Web Audio API)
- Level layout: `assets/maps/level1.json` (loaded by `GameScene`)

Run the game through a local HTTP server (e.g. Live Server) so the level JSON can load correctly.

Optional future imports: Kenney.nl CC0 packs, custom WAV/MP3 files in `assets/audio/`.
