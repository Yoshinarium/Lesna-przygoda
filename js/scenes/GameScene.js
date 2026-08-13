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
}
