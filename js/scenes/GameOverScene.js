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

    this.restartText = this.add.text(w / 2, h - 80, 'SPACJA - Menu  |  ENTER - Graj ponownie', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '9px',
      color: '#ffd700'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.restartText,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1
    });

    this.input.keyboard.once('keydown-SPACE', () => {
      window.audioManager.startMusic();
      this.scene.start('MenuScene');
    });

    this.input.keyboard.once('keydown-ENTER', () => {
      window.audioManager.startMusic();
      this.scene.start('GameScene');
    });

    this.input.keyboard.on('keydown-M', () => {
      window.audioManager.toggleMute();
    });
  }
}
