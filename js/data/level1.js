/** Dane poziomu 1 — osadzone w JS, żeby gra działała z pliku index.html (file://). */
const LEVEL_1_DATA = {
  name: 'level1',
  width: 3600,
  height: 480,
  spawn: { x: 64, y: 400 },
  flag: { x: 3520, y: 432 },
  totalCoins: 22,
  platforms: [
    { x: 0, y: 448, w: 24, tile: 'grass' },
    { x: 768, y: 448, w: 8, tile: 'grass' },
    { x: 1024, y: 448, w: 6, tile: 'grass' },
    { x: 1216, y: 448, w: 10, tile: 'grass' },
    { x: 1536, y: 448, w: 8, tile: 'grass' },
    { x: 1792, y: 448, w: 12, tile: 'grass' },
    { x: 2176, y: 448, w: 10, tile: 'grass' },
    { x: 2496, y: 448, w: 8, tile: 'grass' },
    { x: 2752, y: 448, w: 14, tile: 'grass' },
    { x: 3200, y: 448, w: 12, tile: 'grass' },
    { x: 480, y: 376, w: 4, tile: 'wood' },
    { x: 640, y: 336, w: 3, tile: 'wood' },
    { x: 800, y: 312, w: 4, tile: 'wood' },
    { x: 992, y: 360, w: 3, tile: 'stone' },
    { x: 1184, y: 328, w: 4, tile: 'wood' },
    { x: 1408, y: 360, w: 3, tile: 'stone' },
    { x: 1632, y: 320, w: 4, tile: 'wood' },
    { x: 1824, y: 360, w: 3, tile: 'wood' },
    { x: 2048, y: 328, w: 4, tile: 'stone' },
    { x: 2272, y: 360, w: 3, tile: 'wood' },
    { x: 2496, y: 320, w: 4, tile: 'wood' },
    { x: 2720, y: 360, w: 3, tile: 'stone' },
    { x: 3008, y: 376, w: 3, tile: 'wood' }
  ],
  coins: [
    { x: 128, y: 400 }, { x: 256, y: 400 }, { x: 384, y: 400 },
    { x: 512, y: 328 }, { x: 672, y: 288 },
    { x: 832, y: 264 }, { x: 896, y: 280 }, { x: 960, y: 400 },
    { x: 1008, y: 312 }, { x: 1152, y: 400 },
    { x: 1216, y: 280 }, { x: 1504, y: 400 },
    { x: 1424, y: 312 }, { x: 1664, y: 272 },
    { x: 1856, y: 312 }, { x: 2080, y: 280 },
    { x: 2304, y: 312 }, { x: 2528, y: 272 },
    { x: 2752, y: 312 }, { x: 3040, y: 328 },
    { x: 3200, y: 400 }, { x: 3360, y: 400 }
  ],
  enemies: [
    { x: 400, y: 420, minX: 320, maxX: 720 },
    { x: 1400, y: 420, minX: 1240, maxX: 1520 },
    { x: 2600, y: 420, minX: 2500, maxX: 2720 }
  ],
  crazyPepas: [
    { x: 864, y: 312 },
    { x: 2112, y: 328 }
  ]
};
