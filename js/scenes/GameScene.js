class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.TOTAL_COINS = 22;
    this.coinsCollected = 0;
    this.lives = 3;
    this.isInvincible = false;
    this.gameOver = false;
    this.respawning = false;

    this.createBackground();
    this.createLevel();
    this.createPlayer();
    this.createCoins();
    this.createEnemies();
    this.createCrazyPepas();
    this.createFlag();
    this.createHUD();
    this.setupControls();
    this.setupCollisions();

    this.physics.world.setBounds(0, 0, this.levelWidth, 480);
    this.cameras.main.setBounds(0, 0, this.levelWidth, 480);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    if (!window.audioManager.musicInterval) {
      window.audioManager.startMusic();
    }
  }

  createBackground() {
    this.bgSky = this.add.tileSprite(400, 240, 800, 480, 'bg-sky').setScrollFactor(0);
    this.bgMountains = this.add.tileSprite(400, 100, 800, 200, 'bg-mountains')
      .setScrollFactor(0)
      .setAlpha(0.85);
    this.bgTrees = this.add.tileSprite(400, 340, 800, 200, 'bg-trees')
      .setScrollFactor(0)
      .setAlpha(0.9);
  }

  createLevel() {
    this.platforms = this.physics.add.staticGroup();
    this.levelWidth = 3600;

    const platformData = [
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
    ];

    platformData.forEach(p => {
      for (let i = 0; i < p.w; i++) {
        const tileX = p.x + i * 32;
        const tileY = p.y;
        const tile = this.platforms.create(tileX + 16, tileY + 16, `tile-${p.tile}`);
        tile.setOrigin(0.5);
        tile.refreshBody();

        if (p.tile === 'grass' && i < p.w) {
          const dirt = this.platforms.create(tileX + 16, tileY + 48, 'tile-dirt');
          dirt.setOrigin(0.5);
          dirt.refreshBody();
          const dirt2 = this.platforms.create(tileX + 16, tileY + 80, 'tile-dirt');
          dirt2.setOrigin(0.5);
          dirt2.refreshBody();
        }
      }
    });
  }

  createPlayer() {
    this.player = this.physics.add.sprite(64, 400, 'player-idle');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0);
    this.player.setSize(20, 28);
    this.player.setOffset(6, 4);
    this.player.body.setMaxVelocity(220, 600);
    this.player.play('player-idle');
    this.facingRight = true;
  }

  createCoins() {
    this.coins = this.physics.add.group({ allowGravity: false });

    const coinPositions = [
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
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin-0');
      coin.setOrigin(0.5);
      coin.body.setAllowGravity(false);
      coin.play('coin-spin');
    });
  }

  createEnemies() {
    this.enemies = this.physics.add.group();

    const enemyData = [
      { x: 400, y: 420, minX: 320, maxX: 720 },
      { x: 1400, y: 420, minX: 1240, maxX: 1520 },
      { x: 2600, y: 420, minX: 2500, maxX: 2720 }
    ];

    enemyData.forEach(data => {
      const enemy = this.enemies.create(data.x, data.y, 'enemy-0');
      enemy.setCollideWorldBounds(false);
      enemy.setBounce(0);
      enemy.setSize(24, 18);
      enemy.setOffset(4, 4);
      enemy.body.setAllowGravity(true);
      enemy.body.setImmovable(false);
      enemy.setVelocityX(-40);
      enemy.play('enemy-walk');
      enemy.minX = data.minX;
      enemy.maxX = data.maxX;
      enemy.direction = -1;
      enemy.isAlive = true;
    });
  }

  createCrazyPepas() {
    this.crazyPepas = this.physics.add.staticGroup();
    this.drones = this.physics.add.group();

    const pepaData = [
      { x: 864, y: 296 },
      { x: 2112, y: 312 }
    ];

    pepaData.forEach(data => {
      const pepa = this.crazyPepas.create(data.x, data.y, 'crazy-pepa-0');
      pepa.setOrigin(0.5, 1);
      pepa.refreshBody();
      pepa.body.setSize(20, 28);
      pepa.body.setOffset(6, 4);
      pepa.play('crazy-pepa-idle');
      pepa.launchTimer = Phaser.Math.Between(3000, 5000);
      pepa.telegraphing = false;
      pepa.warningText = null;
      pepa.hasShownApproachLabel = false;
      pepa.hasShownPassLabel = false;
      pepa.nameLabel = null;
    });
  }

  createComicSpeechBubble(x, y, text) {
    const container = this.add.container(x, y).setDepth(50);

    const bubbleW = 132;
    const bubbleH = 42;
    const g = this.add.graphics();

    const spikes = 10;
    const outerX = bubbleW / 2;
    const outerY = bubbleH / 2;
    const innerX = outerX * 0.58;
    const innerY = outerY * 0.58;
    const pts = [];

    for (let i = 0; i < spikes * 2; i++) {
      const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const rx = i % 2 === 0 ? outerX : innerX;
      const ry = i % 2 === 0 ? outerY : innerY;
      pts.push({
        x: Math.cos(angle) * rx,
        y: Math.sin(angle) * ry
      });
    }

    g.fillStyle(0xffee00, 1);
    g.fillPoints(pts, true);

    const pointerY = bubbleH / 2 + 2;
    g.fillStyle(0xffee00, 1);
    g.fillTriangle(-8, pointerY, 8, pointerY, 0, pointerY + 14);

    const labelText = this.add.text(0, -2, text, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#000000',
      align: 'center',
      stroke: '#ffffff',
      strokeThickness: 1
    }).setOrigin(0.5);

    container.add([g, labelText]);
    return container;
  }

  showCrazyPepaLabel(pepa, type = 'approach') {
    if (pepa.nameLabel) return;

    if (type === 'approach') {
      if (pepa.hasShownApproachLabel) return;
      pepa.hasShownApproachLabel = true;
    } else {
      if (pepa.hasShownPassLabel) return;
      pepa.hasShownPassLabel = true;
    }

    const labelY = pepa.y - 52;
    pepa.nameLabel = this.createComicSpeechBubble(pepa.x, labelY, 'Crazy Pepa');
    pepa.nameLabel.setScale(0).setAlpha(1);

    this.tweens.add({
      targets: pepa.nameLabel,
      scale: 1.15,
      duration: 280,
      ease: 'Back.easeOut',
      onComplete: () => {
        if (!pepa.nameLabel) return;
        this.tweens.add({
          targets: pepa.nameLabel,
          scale: 1,
          duration: 120,
          ease: 'Sine.easeOut'
        });
      }
    });

    this.tweens.add({
      targets: pepa.nameLabel,
      y: labelY - 6,
      duration: 900,
      yoyo: true,
      repeat: 1,
      ease: 'Sine.easeInOut'
    });

    this.time.delayedCall(2000, () => {
      if (!pepa.nameLabel || !pepa.nameLabel.active) return;
      this.tweens.add({
        targets: pepa.nameLabel,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          if (pepa.nameLabel) {
            pepa.nameLabel.destroy();
            pepa.nameLabel = null;
          }
        }
      });
    });
  }

  createFlag() {
    this.flag = this.physics.add.sprite(3520, 432, 'flag-0');
    this.flag.setOrigin(0.5, 1);
    this.flag.body.setAllowGravity(false);
    this.flag.body.setSize(20, 50);
    this.flag.body.setOffset(6, 10);
    this.flag.play('flag-wave');
  }

  createHUD() {
    this.hudBg = this.add.rectangle(400, 20, 780, 36, 0x000000, 0.45).setScrollFactor(0).setDepth(100);

    this.coinText = this.add.text(16, 12, `Monety: 0/${this.TOTAL_COINS}`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffd700'
    }).setScrollFactor(0).setDepth(101);

    this.livesIcons = [];
    for (let i = 0; i < 3; i++) {
      const heart = this.add.image(720 - i * 24, 20, 'heart')
        .setScrollFactor(0)
        .setDepth(101)
        .setScale(0.9);
      this.livesIcons.push(heart);
    }

    this.muteHint = this.add.text(400, 12, '', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#aaaaaa'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(101);
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      M: Phaser.Input.Keyboard.KeyCodes.M
    });
  }

  setupCollisions() {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, null, this);
    this.physics.add.overlap(this.player, this.crazyPepas, this.hitCrazyPepa, null, this);
    this.physics.add.overlap(this.player, this.drones, this.hitDrone, null, this);
    this.physics.add.collider(this.drones, this.platforms, (drone) => this.destroyDrone(drone), null, this);
    this.physics.add.overlap(this.player, this.flag, this.reachFlag, null, this);
  }

  collectCoin(player, coin) {
    if (!coin.active) return;
    coin.disableBody(true, true);
    this.coinsCollected++;
    this.coinText.setText(`Monety: ${this.coinsCollected}/${this.TOTAL_COINS}`);
    window.audioManager.playCoin();
  }

  hitEnemy(player, enemy) {
    if (!enemy.isAlive || this.isInvincible || this.gameOver) return;

    const playerBottom = player.body.y + player.body.height;
    const enemyTop = enemy.body.y;
    const isStomp = player.body.velocity.y > 0 && playerBottom <= enemyTop + 16;

    if (isStomp) {
      this.stompEnemy(enemy);
      player.setVelocityY(-320);
    } else {
      this.takeDamage();
    }
  }

  stompEnemy(enemy) {
    enemy.isAlive = false;
    enemy.disableBody(true, true);
    enemy.setVisible(false);
    window.audioManager.playStomp();
  }

  hitCrazyPepa(player) {
    if (this.isInvincible || this.gameOver) return;
    this.takeDamage();
  }

  hitDrone(player, drone) {
    if (!drone.active || this.isInvincible || this.gameOver) return;
    this.destroyDrone(drone);
    this.takeDamage();
  }

  destroyDrone(drone) {
    if (!drone || !drone.active) return;
    drone.disableBody(true, true);
    drone.setVisible(false);
  }

  startDroneTelegraph(pepa) {
    if (pepa.telegraphing || this.gameOver) return;
    pepa.telegraphing = true;

    pepa.setTint(0xffff00);
    pepa.warningText = this.add.text(pepa.x, pepa.y - 40, '!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '14px',
      color: '#ff4444'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: pepa.warningText,
      y: pepa.y - 48,
      alpha: { from: 1, to: 0.4 },
      duration: 400,
      yoyo: true,
      repeat: 1
    });

    this.time.delayedCall(800, () => {
      if (!pepa.active) return;
      pepa.clearTint();
      if (pepa.warningText) {
        pepa.warningText.destroy();
        pepa.warningText = null;
      }
      this.launchDrone(pepa);
      pepa.telegraphing = false;
      pepa.launchTimer = Phaser.Math.Between(4000, 6000);
    });
  }

  launchDrone(pepa) {
    if (this.gameOver) return;

    const startX = pepa.x;
    const startY = pepa.y - 24;
    const targetX = this.player.x;
    const targetY = this.player.y - 16;
    const angle = Phaser.Math.Angle.Between(startX, startY, targetX, targetY);
    const speed = 100;

    const drone = this.drones.create(startX, startY, 'drone-0');
    drone.setOrigin(0.5);
    drone.body.setAllowGravity(false);
    drone.body.setSize(12, 12);
    drone.body.setOffset(2, 2);
    drone.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
    drone.play('drone-spin');

    window.audioManager.playDroneLaunch();
  }

  takeDamage() {
    this.lives--;
    this.updateLivesHUD();
    window.audioManager.playHurt();

    if (this.lives <= 0) {
      this.endGame(false);
      return;
    }

    this.isInvincible = true;
    this.player.setTint(0xff6666);

    this.tweens.add({
      targets: this.player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 10,
      onComplete: () => {
        this.player.clearTint();
        this.player.setAlpha(1);
        this.isInvincible = false;
      }
    });

    this.player.setVelocity(-this.player.body.velocity.x * 0.5, -200);
  }

  updateLivesHUD() {
    this.livesIcons.forEach((heart, i) => {
      heart.setTexture(i < this.lives ? 'heart' : 'heart-empty');
    });
  }

  reachFlag() {
    if (this.gameOver) return;
    this.endGame(true);
  }

  endGame(won) {
    this.gameOver = true;
    this.physics.pause();
    this.player.setVelocity(0, 0);

    this.time.delayedCall(500, () => {
      this.scene.start('GameOverScene', {
        won,
        coins: this.coinsCollected,
        totalCoins: this.TOTAL_COINS
      });
    });
  }

  update() {
    if (this.gameOver) return;

    this.updateParallax();
    this.updatePlayer();
    this.updateEnemies();
    this.updateCrazyPepas();
    this.updateDrones();

    if (Phaser.Input.Keyboard.JustDown(this.keys.M)) {
      const muted = window.audioManager.toggleMute();
      this.muteHint.setText(muted ? 'Wyciszono' : '');
      this.time.delayedCall(1500, () => this.muteHint.setText(''));
    }
  }

  updateParallax() {
    const scrollX = this.cameras.main.scrollX;
    this.bgSky.tilePositionX = scrollX * 0.05;
    this.bgMountains.tilePositionX = scrollX * 0.2;
    this.bgTrees.tilePositionX = scrollX * 0.4;
  }

  updatePlayer() {
    const onGround = this.player.body.blocked.down || this.player.body.touching.down;
    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const jump = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.keys.W);

    if (left) {
      this.player.setVelocityX(-180);
      this.player.setFlipX(true);
      this.facingRight = false;
    } else if (right) {
      this.player.setVelocityX(180);
      this.player.setFlipX(false);
      this.facingRight = true;
    } else {
      this.player.setVelocityX(this.player.body.velocity.x * 0.85);
    }

    if (jump && onGround) {
      this.player.setVelocityY(-420);
      window.audioManager.playJump();
    }

    if (!onGround) {
      this.player.anims.play('player-jump', true);
    } else if (Math.abs(this.player.body.velocity.x) > 20) {
      this.player.anims.play('player-run', true);
    } else {
      this.player.anims.play('player-idle', true);
    }

    if (this.player.y > 520 && !this.respawning) {
      this.respawning = true;
      this.takeDamage();
      if (this.lives > 0 && !this.gameOver) {
        this.player.setPosition(64, 400);
        this.player.setVelocity(0, 0);
        this.time.delayedCall(500, () => { this.respawning = false; });
      }
    }
  }

  updateEnemies() {
    this.enemies.children.iterate(enemy => {
      if (!enemy || !enemy.isAlive) return;

      if (enemy.x <= enemy.minX) {
        enemy.direction = 1;
        enemy.setVelocityX(40);
        enemy.setFlipX(false);
      } else if (enemy.x >= enemy.maxX) {
        enemy.direction = -1;
        enemy.setVelocityX(-40);
        enemy.setFlipX(true);
      }

      if (enemy.body.blocked.left) {
        enemy.direction = 1;
        enemy.setVelocityX(40);
        enemy.setFlipX(false);
      } else if (enemy.body.blocked.right) {
        enemy.direction = -1;
        enemy.setVelocityX(-40);
        enemy.setFlipX(true);
      }
    });
  }

  updateCrazyPepas() {
    const delta = this.game.loop.delta;
    const cam = this.cameras.main;
    const triggerDistance = 480;
    const passThreshold = 28;

    this.crazyPepas.children.iterate(pepa => {
      if (!pepa || !pepa.active) return;

      if (!pepa.hasShownApproachLabel && !pepa.nameLabel) {
        const dist = Phaser.Math.Distance.Between(
          this.player.x, this.player.y, pepa.x, pepa.y
        );
        const isOnScreen = pepa.x >= cam.scrollX - 48 && pepa.x <= cam.scrollX + cam.width + 48;

        if (dist <= triggerDistance || isOnScreen) {
          this.showCrazyPepaLabel(pepa, 'approach');
        }
      }

      if (!pepa.hasShownPassLabel && !pepa.nameLabel && this.player.x > pepa.x + passThreshold) {
        this.showCrazyPepaLabel(pepa, 'pass');
      }

      if (pepa.telegraphing) return;

      pepa.launchTimer -= delta;
      if (pepa.launchTimer <= 0) {
        this.startDroneTelegraph(pepa);
      }
    });
  }

  updateDrones() {
    const cam = this.cameras.main;
    const margin = 64;

    this.drones.children.iterate(drone => {
      if (!drone || !drone.active) return;

      if (
        drone.x < cam.scrollX - margin ||
        drone.x > cam.scrollX + cam.width + margin ||
        drone.y < -margin ||
        drone.y > 520
      ) {
        this.destroyDrone(drone);
      }
    });
  }
}
