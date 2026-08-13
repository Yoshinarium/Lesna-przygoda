class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const loadingText = this.add.text(w / 2, h / 2 - 20, 'Ładowanie...', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const barBg = this.add.rectangle(w / 2, h / 2 + 20, 280, 16, 0x2d5a3d);
    const bar = this.add.rectangle(w / 2 - 134, h / 2 + 20, 0, 12, 0xffd700);
    bar.setOrigin(0, 0.5);

    this.generateAllAssets();
    bar.width = 268;

    this.createAnimations();

    loadingText.setText('Gotowe!');
    this.time.delayedCall(300, () => {
      this.scene.start('MenuScene');
    });
  }

  generateAllAssets() {
    this.generatePlayerSprites();
    this.generateTileSprites();
    this.generateCoinSprites();
    this.generateEnemySprites();
    this.generateCrazyPepaSprites();
    this.generateDroneSprite();
    this.generateFlagSprite();
    this.generateHeartSprite();
    this.generateParallaxSprites();
  }

  createAnimations() {
    this.anims.create({
      key: 'player-idle',
      frames: [{ key: 'player-idle' }],
      frameRate: 1,
      repeat: -1
    });

    this.anims.create({
      key: 'player-run',
      frames: [
        { key: 'player-run-0' },
        { key: 'player-run-1' },
        { key: 'player-run-2' },
        { key: 'player-run-3' }
      ],
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'player-jump',
      frames: [{ key: 'player-jump' }],
      frameRate: 1,
      repeat: -1
    });

    this.anims.create({
      key: 'coin-spin',
      frames: [
        { key: 'coin-0' },
        { key: 'coin-1' },
        { key: 'coin-2' },
        { key: 'coin-3' }
      ],
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'enemy-walk',
      frames: [
        { key: 'enemy-1' },
        { key: 'enemy-0' }
      ],
      frameRate: 4,
      repeat: -1
    });

    this.anims.create({
      key: 'flag-wave',
      frames: [
        { key: 'flag-0' },
        { key: 'flag-1' }
      ],
      frameRate: 3,
      repeat: -1
    });

    this.anims.create({
      key: 'crazy-pepa-idle',
      frames: [
        { key: 'crazy-pepa-0' },
        { key: 'crazy-pepa-1' }
      ],
      frameRate: 3,
      repeat: -1
    });

    this.anims.create({
      key: 'drone-spin',
      frames: [
        { key: 'drone-0' },
        { key: 'drone-1' }
      ],
      frameRate: 8,
      repeat: -1
    });
  }

  drawPixelRect(g, x, y, w, h, color) {
    g.fillStyle(color);
    g.fillRect(x, y, w, h);
  }

  generatePlayerSprites() {
    const colors = {
      skin: 0xf4c896,
      shirt: 0x3d8b37,
      pants: 0x5c4033,
      hat: 0x2d5a27
    };

    const drawPlayer = (g, legOffset) => {
      g.clear();
      this.drawPixelRect(g, 10, 2, 12, 6, colors.hat);
      this.drawPixelRect(g, 11, 8, 10, 8, colors.skin);
      this.drawPixelRect(g, 8, 16, 16, 10, colors.shirt);
      this.drawPixelRect(g, 9, 26 + legOffset, 6, 6, colors.pants);
      this.drawPixelRect(g, 17, 26 - legOffset, 6, 6, colors.pants);
      this.drawPixelRect(g, 6, 18, 4, 8, colors.shirt);
      this.drawPixelRect(g, 22, 18, 4, 8, colors.shirt);
    };

    const idleG = this.make.graphics({ x: 0, y: 0, add: false });
    drawPlayer(idleG, 0);
    idleG.generateTexture('player-idle', 32, 32);

    for (let i = 0; i < 4; i++) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      drawPlayer(g, i % 2 === 0 ? 0 : 2);
      g.generateTexture(`player-run-${i}`, 32, 32);
    }

    const jumpG = this.make.graphics({ x: 0, y: 0, add: false });
    jumpG.clear();
    this.drawPixelRect(jumpG, 10, 0, 12, 6, colors.hat);
    this.drawPixelRect(jumpG, 11, 6, 10, 8, colors.skin);
    this.drawPixelRect(jumpG, 6, 14, 20, 10, colors.shirt);
    this.drawPixelRect(jumpG, 8, 24, 6, 6, colors.pants);
    this.drawPixelRect(jumpG, 18, 24, 6, 6, colors.pants);
    this.drawPixelRect(jumpG, 2, 12, 6, 10, colors.shirt);
    this.drawPixelRect(jumpG, 24, 12, 6, 10, colors.shirt);
    jumpG.generateTexture('player-jump', 32, 32);
  }

  generateTileSprites() {
    const grass = this.make.graphics({ x: 0, y: 0, add: false });
    grass.fillStyle(0x5a8f3c);
    grass.fillRect(0, 0, 32, 32);
    grass.fillStyle(0x4a7a32);
    grass.fillRect(0, 16, 32, 16);
    grass.fillStyle(0x6aad4a);
    for (let i = 0; i < 32; i += 8) grass.fillRect(i, 0, 4, 4);
    grass.generateTexture('tile-grass', 32, 32);

    const wood = this.make.graphics({ x: 0, y: 0, add: false });
    wood.fillStyle(0x8b6914);
    wood.fillRect(0, 0, 32, 32);
    wood.fillStyle(0x6b4f0a);
    for (let y = 4; y < 32; y += 8) wood.fillRect(0, y, 32, 2);
    wood.generateTexture('tile-wood', 32, 32);

    const stone = this.make.graphics({ x: 0, y: 0, add: false });
    stone.fillStyle(0x7a7a7a);
    stone.fillRect(0, 0, 32, 32);
    stone.fillStyle(0x5a5a5a);
    stone.fillRect(2, 2, 12, 12);
    stone.fillRect(16, 16, 12, 12);
    stone.fillStyle(0x9a9a9a);
    stone.fillRect(16, 2, 10, 10);
    stone.generateTexture('tile-stone', 32, 32);

    const dirt = this.make.graphics({ x: 0, y: 0, add: false });
    dirt.fillStyle(0x6b4423);
    dirt.fillRect(0, 0, 32, 32);
    dirt.fillStyle(0x5a3818);
    for (let i = 0; i < 8; i++) {
      dirt.fillRect(Phaser.Math.Between(0, 24), Phaser.Math.Between(0, 24), 6, 6);
    }
    dirt.generateTexture('tile-dirt', 32, 32);
  }

  generateCoinSprites() {
    const shades = [0xffd700, 0xffe566, 0xffaa00, 0xffe566];
    for (let i = 0; i < 4; i++) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const w = i === 0 || i === 2 ? 16 : (i === 1 ? 10 : 6);
      g.fillStyle(shades[i]);
      g.fillCircle(8, 8, 7);
      g.fillStyle(0xffee88);
      g.fillCircle(8 - w / 8, 6, 2);
      g.generateTexture(`coin-${i}`, 16, 16);
    }
  }

  generateEnemySprites() {
    for (let frame = 0; frame < 2; frame++) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x8b6914);
      g.fillEllipse(16, 22, 28, 16);
      g.fillStyle(0xa07828);
      g.fillEllipse(16, 20, 24, 12);
      g.fillStyle(0x6b4f0a);
      g.fillCircle(22, 14, 8);
      g.fillStyle(0xffffff);
      g.fillCircle(24, 12, 3);
      g.fillStyle(0x1a1a1a);
      g.fillCircle(25, 12, 1.5);
      const hornOffset = frame === 0 ? 0 : 1;
      g.fillStyle(0x5a4020);
      g.fillTriangle(20, 6 + hornOffset, 24, 2, 28, 6 + hornOffset);
      g.generateTexture(`enemy-${frame}`, 32, 24);
    }
  }

  generateCrazyPepaSprites() {
    const colors = {
      body: 0xff8cb4,
      dress: 0xff5588,
      cheek: 0xffaaaa,
      eye: 0xffffff,
      pupil: 0x222222,
      hair: 0xcc4488
    };

    for (let frame = 0; frame < 2; frame++) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const bob = frame === 0 ? 0 : 1;

      this.drawPixelRect(g, 10, 4 + bob, 12, 10, colors.body);
      this.drawPixelRect(g, 8, 14 + bob, 16, 10, colors.dress);
      this.drawPixelRect(g, 6, 24 + bob, 6, 6, colors.dress);
      this.drawPixelRect(g, 20, 24 + bob, 6, 6, colors.dress);
      this.drawPixelRect(g, 8, 2 + bob, 4, 4, colors.hair);
      this.drawPixelRect(g, 20, 2 + bob, 4, 4, colors.hair);
      this.drawPixelRect(g, 14, 0 + bob, 4, 3, colors.hair);
      this.drawPixelRect(g, 11, 10 + bob, 4, 3, colors.eye);
      this.drawPixelRect(g, 19, 10 + bob, 4, 3, colors.eye);
      this.drawPixelRect(g, 12, 11 + bob, 2, 2, colors.pupil);
      this.drawPixelRect(g, 20, 11 + bob, 2, 2, colors.pupil);
      this.drawPixelRect(g, 8, 14 + bob, 3, 2, colors.cheek);
      this.drawPixelRect(g, 21, 14 + bob, 3, 2, colors.cheek);
      this.drawPixelRect(g, 14, 16 + bob, 4, 2, 0xff3366);

      g.generateTexture(`crazy-pepa-${frame}`, 32, 32);
    }
  }

  generateDroneSprite() {
    for (let frame = 0; frame < 2; frame++) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x444444);
      g.fillRect(6, 6, 4, 4);
      g.fillStyle(0x666666);
      g.fillRect(7, 7, 2, 2);
      g.fillStyle(0x888888);
      const bladeOffset = frame === 0 ? 0 : 1;
      g.fillRect(2 + bladeOffset, 7, 4, 2);
      g.fillRect(10 - bladeOffset, 7, 4, 2);
      g.fillRect(7, 2 + bladeOffset, 2, 4);
      g.fillRect(7, 10 - bladeOffset, 2, 4);
      g.fillStyle(0xff4444);
      g.fillCircle(8, 8, 1);
      g.generateTexture(`drone-${frame}`, 16, 16);
    }
  }

  generateFlagSprite() {
    for (let i = 0; i < 2; i++) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x5c4033);
      g.fillRect(2, 0, 4, 64);
      g.fillStyle(i === 0 ? 0x3d8b37 : 0x4aad42);
      g.fillTriangle(6, 4, 6, 28, 30 + i * 2, 16);
      g.fillStyle(0xffd700);
      g.fillCircle(4, 4, 3);
      g.generateTexture(`flag-${i}`, 32, 64);
    }
  }

  generateHeartSprite() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xff4444);
    g.fillCircle(6, 6, 5);
    g.fillCircle(14, 6, 5);
    g.fillTriangle(2, 8, 18, 8, 10, 18);
    g.generateTexture('heart', 20, 20);

    const empty = this.make.graphics({ x: 0, y: 0, add: false });
    empty.fillStyle(0x555555);
    empty.fillCircle(6, 6, 5);
    empty.fillCircle(14, 6, 5);
    empty.fillTriangle(2, 8, 18, 8, 10, 18);
    empty.generateTexture('heart-empty', 20, 20);
  }

  generateParallaxSprites() {
    const sky = this.make.graphics({ x: 0, y: 0, add: false });
    sky.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xb8e0f0, 0xb8e0f0, 1);
    sky.fillRect(0, 0, 800, 480);
    sky.generateTexture('bg-sky', 800, 480);

    const mountains = this.make.graphics({ x: 0, y: 0, add: false });
    mountains.fillStyle(0x5a7a6a);
    mountains.fillTriangle(0, 200, 150, 60, 300, 200);
    mountains.fillTriangle(200, 200, 400, 40, 600, 200);
    mountains.fillTriangle(500, 200, 700, 80, 900, 200);
    mountains.fillStyle(0x4a6a5a);
    mountains.fillTriangle(100, 200, 250, 100, 400, 200);
    mountains.fillTriangle(450, 200, 600, 90, 750, 200);
    mountains.generateTexture('bg-mountains', 800, 200);

    const trees = this.make.graphics({ x: 0, y: 0, add: false });
    for (let x = 0; x < 800; x += 60) {
      const th = Phaser.Math.Between(60, 100);
      trees.fillStyle(0x4a3020);
      trees.fillRect(x + 24, 200 - th + 20, 12, th - 20);
      trees.fillStyle(0x2d6b2d);
      trees.fillCircle(x + 30, 200 - th, 28);
      trees.fillStyle(0x3d8b3d);
      trees.fillCircle(x + 22, 200 - th + 10, 20);
      trees.fillCircle(x + 38, 200 - th + 10, 20);
    }
    trees.generateTexture('bg-trees', 800, 200);
  }
}
