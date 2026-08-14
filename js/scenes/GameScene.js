class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.levelData = typeof LEVEL_1_DATA !== 'undefined' ? LEVEL_1_DATA : null;
    if (!this.levelData) {
      this.add.text(400, 240, 'Błąd: brak danych poziomu.\nOdśwież stronę.', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#ffffff',
        align: 'center'
      }).setOrigin(0.5);
      return;
    }
    this.TOTAL_COINS = this.levelData.totalCoins;
    this.coinsCollected = 0;
    this.lives = 3;
    this.isInvincible = false;
    this.gameOver = false;
    this.respawning = false;
    this.isPaused = false;
    this.levelResetId = 0;

    this.createBackground();
    this.createLevel();
    this.createPlayer();
    this.createCoins();
    this.createEnemies();
    this.createCrazyPepas();
    this.createFlag();
    this.createHUD();
    this.createPauseOverlay();
    this.setupControls();
    this.setupCollisions();

    this.physics.world.setBounds(0, 0, this.levelWidth, this.levelData.height);
    this.cameras.main.setBounds(0, 0, this.levelWidth, this.levelData.height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);

    if (!window.audioManager.musicPlaying) {
      window.audioManager.ensureStarted().then(() => {
        window.audioManager.startMusic();
      });
    }
  }

  createBackground() {
    this.bgSky = this.add.tileSprite(400, 240, 800, 480, 'bg-sky')
      .setScrollFactor(0)
      .setDepth(-10);
    this.bgLandscape = this.add.tileSprite(400, 205, 800, 280, 'bg-landscape')
      .setScrollFactor(0)
      .setAlpha(0.92)
      .setDepth(-9);
    this.bgTrees = this.add.tileSprite(400, 350, 800, 200, 'bg-trees')
      .setScrollFactor(0)
      .setAlpha(0.94)
      .setDepth(-8);
  }

  createLevel() {
    this.platforms = this.physics.add.staticGroup();
    this.levelWidth = this.levelData.width;

    this.levelData.platforms.forEach(p => {
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
    this.playerSpawnX = this.levelData.spawn.x;
    this.playerSpawnY = this.levelData.spawn.y;
    this.player = this.physics.add.sprite(this.playerSpawnX, this.playerSpawnY, 'player-idle');
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
    this.levelData.coins.forEach(pos => this.spawnCoin(pos.x, pos.y));
  }

  spawnCoin(x, y) {
    const coin = this.coins.create(x, y, 'coin-0');
    coin.setOrigin(0.5);
    coin.body.setAllowGravity(false);
    coin.play('coin-spin');
    return coin;
  }

  createEnemies() {
    this.enemies = this.physics.add.group();
    this.enemyInitialData = this.levelData.enemies;

    this.enemyInitialData.forEach(data => {
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

    this.levelData.crazyPepas.forEach(data => {
      const pepa = this.crazyPepas.create(data.x, data.y, 'crazy-pepa-0');
      pepa.setOrigin(0.5, 1);
      pepa.body.setSize(20, 28);
      pepa.body.setOffset(6, 4);
      pepa.refreshBody();
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
    this.flag = this.physics.add.sprite(this.levelData.flag.x, this.levelData.flag.y, 'flag-0');
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

  createPauseOverlay() {
    this.pauseOverlay = this.add.container(400, 240).setScrollFactor(0).setDepth(200).setVisible(false);

    const bg = this.add.rectangle(0, 0, 800, 480, 0x000000, 0.65);
    const title = this.add.text(0, -50, 'PAUZA', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '24px',
      color: '#ffd700'
    }).setOrigin(0.5);
    const resumeHint = this.add.text(0, 10, 'P - wznów grę', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff'
    }).setOrigin(0.5);
    const menuHint = this.add.text(0, 44, 'ESC - powrót do menu', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#e8f5e9'
    }).setOrigin(0.5);

    this.pauseOverlay.add([bg, title, resumeHint, menuHint]);
  }

  setupControls() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      M: Phaser.Input.Keyboard.KeyCodes.M,
      P: Phaser.Input.Keyboard.KeyCodes.P,
      ESC: Phaser.Input.Keyboard.KeyCodes.ESC
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
    if (pepa.telegraphing || this.gameOver || this.isPaused) return;
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

    const resetId = this.levelResetId;
    this.time.delayedCall(800, () => {
      if (resetId !== this.levelResetId || !pepa.active) return;
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
    if (this.gameOver || this.isPaused) return;

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
    this.resetLevelAfterDeath();
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
  }

  resetLevelAfterDeath() {
    this.levelResetId++;

    this.player.setPosition(this.playerSpawnX, this.playerSpawnY);
    this.player.setVelocity(0, 0);
    this.player.setFlipX(false);
    this.facingRight = true;
    this.player.anims.play('player-idle', true);

    this.resetCoins();
    this.resetEnemies();
    this.resetCrazyPepas();

    this.cameras.main.centerOn(this.playerSpawnX, this.playerSpawnY);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  resetCoins() {
    this.coinsCollected = 0;
    this.coinText.setText(`Monety: 0/${this.TOTAL_COINS}`);
    this.coins.clear(true, true);
    this.levelData.coins.forEach(pos => this.spawnCoin(pos.x, pos.y));
  }

  resetEnemies() {
    const children = this.enemies.getChildren();
    this.enemyInitialData.forEach((data, i) => {
      const enemy = children[i];
      if (!enemy) return;

      enemy.enableBody(true, true, true, true);
      enemy.setVisible(true);
      enemy.setPosition(data.x, data.y);
      enemy.setVelocityX(-40);
      enemy.setFlipX(true);
      enemy.minX = data.minX;
      enemy.maxX = data.maxX;
      enemy.direction = -1;
      enemy.isAlive = true;
      enemy.play('enemy-walk');
    });
  }

  resetCrazyPepas() {
    this.drones.clear(true, true);

    this.crazyPepas.children.iterate(pepa => {
      if (!pepa || !pepa.active) return;

      pepa.clearTint();
      pepa.telegraphing = false;
      if (pepa.warningText) {
        pepa.warningText.destroy();
        pepa.warningText = null;
      }
      if (pepa.nameLabel) {
        pepa.nameLabel.destroy();
        pepa.nameLabel = null;
      }
      pepa.hasShownApproachLabel = false;
      pepa.hasShownPassLabel = false;
      pepa.launchTimer = Phaser.Math.Between(3000, 5000);
    });
  }

  updateLivesHUD() {
    this.livesIcons.forEach((heart, i) => {
      heart.setTexture(i < this.lives ? 'heart' : 'heart-empty');
    });
  }

  togglePause() {
    if (this.gameOver) return;

    this.isPaused = !this.isPaused;

    if (this.isPaused) {
      this.physics.pause();
      this.pauseOverlay.setVisible(true);
    } else {
      this.physics.resume();
      this.pauseOverlay.setVisible(false);
    }
  }

  exitToMenu() {
    if (this.isPaused) {
      this.physics.resume();
      this.isPaused = false;
      this.pauseOverlay.setVisible(false);
    }
    this.scene.start('MenuScene');
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

    if (Phaser.Input.Keyboard.JustDown(this.keys.ESC)) {
      this.exitToMenu();
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.P)) {
      this.togglePause();
      return;
    }

    if (this.isPaused) return;

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
    this.bgLandscape.tilePositionX = scrollX * 0.25;
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
