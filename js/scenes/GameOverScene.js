class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data) {
    this.won = data.won || false;
    this.coins = data.coins || 0;
    this.totalCoins = data.totalCoins || 22;
  }

  create() {
    window.audioManager.stopMusic();

    if (this.won) {
      window.audioManager.playWin();
    } else {
      window.audioManager.playLose();
    }

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.add.image(w / 2, h / 2, 'bg-sky').setScrollFactor(0);
    this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.4);

    if (this.won) {
      this.add.text(w / 2, 120, 'Gratulacje!', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '24px',
        color: '#ffd700',
        stroke: '#2d5a3d',
        strokeThickness: 3
      }).setOrigin(0.5);

      this.add.text(w / 2, 180, 'Udało Ci się!', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '14px',
        color: '#ffffff'
      }).setOrigin(0.5);

      this.add.text(w / 2, 240, `Monety: ${this.coins}/${this.totalCoins}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#e8f5e9'
      }).setOrigin(0.5);
    } else {
      this.add.text(w / 2, 140, 'Koniec gry', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '24px',
        color: '#ff6666',
        stroke: '#3a1010',
        strokeThickness: 3
      }).setOrigin(0.5);

      this.add.text(w / 2, 210, 'Spróbuj ponownie', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '12px',
        color: '#ffffff'
      }).setOrigin(0.5);

      this.add.text(w / 2, 260, `Zebrane monety: ${this.coins}/${this.totalCoins}`, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '10px',
        color: '#cccccc'
      }).setOrigin(0.5);
    }

    this.createActionButton(w / 2 - 90, h - 110, 'MENU', () => this.goToMenu());
    this.createActionButton(w / 2 + 90, h - 110, 'GRAJ', () => this.restartGame());

    this.restartText = this.add.text(w / 2, h - 60, 'SPACJA - Menu  |  ENTER - Graj  |  ESC - Menu', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '8px',
      color: '#ffd700'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.restartText,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    this.input.keyboard.once('keydown-SPACE', () => this.goToMenu());
    this.input.keyboard.once('keydown-ENTER', () => this.restartGame());
    this.input.keyboard.once('keydown-ESC', () => this.goToMenu());

    this.input.keyboard.on('keydown-M', () => {
      window.audioManager.toggleMute();
    });
  }

  createActionButton(x, y, label, onClick) {
    const button = this.add.text(x, y, `[ ${label} ]`, {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffd700'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => button.setColor('#ffffff'));
    button.on('pointerout', () => button.setColor('#ffd700'));
    button.on('pointerdown', onClick);

    return button;
  }

  goToMenu() {
    window.audioManager.ensureStarted().then(() => {
      window.audioManager.startMusic();
      this.scene.start('MenuScene');
    });
  }

  restartGame() {
    window.audioManager.ensureStarted().then(() => {
      window.audioManager.startMusic();
      this.scene.start('GameScene');
    });
  }
}
