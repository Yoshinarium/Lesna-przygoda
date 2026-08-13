class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    window.audioManager.init();
    window.audioManager.startMusic();

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.add.image(w / 2, h / 2, 'bg-sky').setScrollFactor(0);
    this.add.image(w / 2, 120, 'bg-mountains').setScrollFactor(0).setAlpha(0.7);
    this.add.image(w / 2, 280, 'bg-trees').setScrollFactor(0).setAlpha(0.8);

    const overlay = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.25);

    this.add.text(w / 2, 80, 'Leśna Przygoda', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '28px',
      color: '#ffd700',
      stroke: '#2d5a3d',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(w / 2, 160, 'Zbieraj monety i dotrzyj do flagi!', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '10px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    const instructions = [
      'Poruszaj się: ← → lub A D',
      'Skacz: Spacja, ↑ lub W',
      'Wyciszenie: M',
      '',
      'Unikaj leśnych stworów!',
      'Skacz na nie, by je pokonać!'
    ];

    instructions.forEach((line, i) => {
      this.add.text(w / 2, 210 + i * 22, line, {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '9px',
        color: '#e8f5e9',
        align: 'center'
      }).setOrigin(0.5);
    });

    this.startText = this.add.text(w / 2, h - 60, 'Naciśnij SPACJĘ lub ENTER', {
      fontFamily: '"Press Start 2P", monospace',
      fontSize: '11px',
      color: '#ffd700'
    }).setOrigin(0.5);

    this.tweens.add({
      targets: this.startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1
    });

    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
    this.input.keyboard.once('keydown-ENTER', () => this.startGame());

    this.input.keyboard.on('keydown-M', () => {
      const muted = window.audioManager.toggleMute();
      this.muteText = this.muteText || this.add.text(w / 2, h - 30, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#aaaaaa'
      }).setOrigin(0.5);
      this.muteText.setText(muted ? 'Wyciszono (M)' : 'Dźwięk włączony');
    });
  }

  startGame() {
    window.audioManager.resume();
    this.scene.start('GameScene');
  }
}
