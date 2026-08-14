class AudioManager {
  static FOREST_MELODY = [
    // Wstęp — spokojny motyw w górę
    { f: 294, d: 0.45, bass: 196 }, { f: 330, d: 0.45 }, { f: 349, d: 0.45 }, { f: 392, d: 0.55, bass: 262 },
    { f: 440, d: 0.45 }, { f: 392, d: 0.45 }, { f: 349, d: 0.45 }, { f: 330, d: 0.65, bass: 220 },
    { f: 0, d: 0.35 },

    // Temat A — główna melodia
    { f: 392, d: 0.4, bass: 262 }, { f: 440, d: 0.4 }, { f: 494, d: 0.4 }, { f: 523, d: 0.55 },
    { f: 587, d: 0.4 }, { f: 523, d: 0.4 }, { f: 494, d: 0.4 }, { f: 440, d: 0.55, bass: 294 },
    { f: 392, d: 0.75 }, { f: 0, d: 0.3 },

    // Temat B — wyższy, lżejszy fragment
    { f: 523, d: 0.35, bass: 330 }, { f: 587, d: 0.35 }, { f: 659, d: 0.35 }, { f: 587, d: 0.35 },
    { f: 523, d: 0.35 }, { f: 494, d: 0.35 }, { f: 440, d: 0.35 }, { f: 494, d: 0.55 },
    { f: 523, d: 0.45 }, { f: 440, d: 0.45 }, { f: 392, d: 0.85, bass: 262 },
    { f: 0, d: 0.35 },

    // Mostek — niższy, spokojniejszy
    { f: 330, d: 0.55, bass: 220 }, { f: 349, d: 0.55 }, { f: 392, d: 0.55 }, { f: 349, d: 0.55 },
    { f: 330, d: 0.55 }, { f: 294, d: 0.55, bass: 196 }, { f: 330, d: 0.55 }, { f: 349, d: 0.55 },
    { f: 392, d: 0.9 }, { f: 0, d: 0.45 },

    // Temat C — figura rytmiczna
    { f: 440, d: 0.3, bass: 294 }, { f: 440, d: 0.3 }, { f: 494, d: 0.3 }, { f: 523, d: 0.3 },
    { f: 494, d: 0.3 }, { f: 440, d: 0.3 }, { f: 392, d: 0.3 }, { f: 440, d: 0.3 },
    { f: 392, d: 0.3 }, { f: 349, d: 0.3 }, { f: 330, d: 0.45 }, { f: 294, d: 0.45, bass: 196 },
    { f: 330, d: 0.45 }, { f: 392, d: 0.95 },
    { f: 0, d: 0.4 },

    // Repryza — powrót do tematu z zakończeniem
    { f: 392, d: 0.45, bass: 262 }, { f: 440, d: 0.45 }, { f: 494, d: 0.45 }, { f: 440, d: 0.45 },
    { f: 392, d: 0.45 }, { f: 349, d: 0.45 }, { f: 330, d: 0.45 }, { f: 349, d: 0.45 },
    { f: 392, d: 0.55 }, { f: 440, d: 0.55 }, { f: 392, d: 1.1, bass: 196 },
    { f: 0, d: 0.8 }
  ];

  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicOscillators = [];
    this.musicTimeout = null;
    this.musicPlaying = false;
    this.musicStep = 0;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.musicGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();
      this.musicGain.connect(this.ctx.destination);
      this.sfxGain.connect(this.ctx.destination);
      this.musicGain.gain.value = 0.45;
      this.sfxGain.gain.value = 0.35;
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio niedostępny:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      return this.ctx.resume();
    }
    return Promise.resolve();
  }

  ensureStarted() {
    if (!this.initialized) this.init();
    return this.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.musicGain) this.musicGain.gain.value = this.muted ? 0 : 0.45;
    if (this.sfxGain) this.sfxGain.gain.value = this.muted ? 0 : 0.35;
    return this.muted;
  }

  playTone(freq, duration, type = 'square', volume = 0.3, startFreq = null) {
    if (!this.ctx || this.muted) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq || freq, this.ctx.currentTime);
    if (startFreq) {
      osc.frequency.exponentialRampToValueAtTime(freq, this.ctx.currentTime + duration * 0.5);
    }
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playJump() {
    this.playTone(440, 0.12, 'square', 0.25, 220);
  }

  playCoin() {
    this.playTone(880, 0.08, 'sine', 0.3);
    setTimeout(() => this.playTone(1100, 0.1, 'sine', 0.25), 60);
  }

  playHurt() {
    this.playTone(150, 0.25, 'sawtooth', 0.35, 300);
  }

  playStomp() {
    this.playTone(200, 0.1, 'square', 0.3, 400);
  }

  playDroneLaunch() {
    this.playTone(660, 0.15, 'sawtooth', 0.2, 330);
    setTimeout(() => this.playTone(880, 0.1, 'square', 0.15), 80);
  }

  playWin() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 0.2, 'sine', 0.3), i * 120);
    });
  }

  playLose() {
    const notes = [392, 349, 330, 262];
    notes.forEach((n, i) => {
      setTimeout(() => this.playTone(n, 0.25, 'triangle', 0.25), i * 150);
    });
  }

  startMusic() {
    if (!this.initialized) this.init();
    if (!this.ctx || this.musicPlaying) return;

    this.musicPlaying = true;
    this.musicStep = 0;
    this.scheduleMusicStep();
  }

  scheduleMusicStep() {
    if (!this.musicPlaying || !this.ctx) return;

    const melody = AudioManager.FOREST_MELODY;
    const note = melody[this.musicStep % melody.length];

    if (!this.muted) {
      this.resume();
      if (note.f > 0) {
        this.playMusicNote(note.f, note.d, note.type || 'triangle', note.v || 0.28);
      }
      if (note.bass > 0) {
        this.playMusicNote(note.bass, note.d * 1.05, 'sine', (note.bv || 0.14));
      }
    }

    this.musicStep++;
    const delayMs = Math.max(120, note.d * 1000);
    this.musicTimeout = setTimeout(() => this.scheduleMusicStep(), delayMs);
  }

  playMusicNote(freq, duration, type, volume) {
    if (!this.ctx || this.muted) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration * 0.92);
    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
    this.musicOscillators.push(osc);
  }

  stopMusic() {
    this.musicPlaying = false;
    if (this.musicTimeout) {
      clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
    this.musicOscillators.forEach(o => {
      try { o.stop(); } catch (_) {}
    });
    this.musicOscillators = [];
  }
}

window.audioManager = new AudioManager();
