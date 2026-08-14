class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    window.audioManager.init();

    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    this.add.image(w / 2, h / 2, 'bg-sky').setScrollFactor(0);
    this.add.image(w / 2, 205, 'bg-landscape').setScrollFactor(0).setAlpha(0.88);
    this.add.image(w / 2, 350, 'bg-trees').setScrollFactor(0).setAlpha(0.9);

    this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.25);

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
      'Pauza: P  |  Menu: ESC  |  Wyciszenie: M',
      '',
      'Unikaj leśnych stworów!',
      'Skacz na nie, by je pokonać!',
      'Uważaj na Crazy Pepa — strzela dronami!'
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

    this.audioStarted = false;
    this.bindMenuInput(w, h);
    this.input.once('pointerdown', () => this.ensureAudioStarted());
  }

  bindMenuInput(w, h) {
    this.input.keyboard.once('keydown-SPACE', () => this.startGame());
    this.input.keyboard.once('keydown-ENTER', () => this.startGame());

    this.input.keyboard.on('keydown', (event) => {
      if (event.code === 'Space' || event.code === 'Enter') return;
      this.ensureAudioStarted();
    });

    this.input.keyboard.on('keydown-M', () => {
      this.ensureAudioStarted();
      const muted = window.audioManager.toggleMute();
      this.muteText = this.muteText || this.add.text(w / 2, h - 30, '', {
        fontFamily: '"Press Start 2P", monospace',
        fontSize: '8px',
        color: '#aaaaaa'
      }).setOrigin(0.5);
      this.muteText.setText(muted ? 'Wyciszono (M)' : 'Dźwięk włączony');
    });
  }

  ensureAudioStarted() {
    if (this.audioStarted) return;
    this.audioStarted = true;
    window.audioManager.ensureStarted().then(() => {
      if (!window.audioManager.musicPlaying) {
        window.audioManager.startMusic();
      }
    });
  }

  startGame() {
    window.audioManager.ensureStarted().then(() => {
      if (!window.audioManager.musicPlaying) {
        window.audioManager.startMusic();
      }
      this.scene.start('GameScene');
    });
  }
}
