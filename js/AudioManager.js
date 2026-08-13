class AudioManager {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicGain = null;
    this.sfxGain = null;
    this.musicOscillators = [];
    this.musicInterval = null;
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
      this.musicGain.gain.value = 0.12;
      this.sfxGain.gain.value = 0.35;
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio niedostępny:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.musicGain) this.musicGain.gain.value = this.muted ? 0 : 0.12;
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
    if (!this.ctx || this.musicInterval) return;
    this.resume();

    const melody = [
      { f: 392, d: 0.4 }, { f: 440, d: 0.4 }, { f: 494, d: 0.4 }, { f: 440, d: 0.4 },
      { f: 392, d: 0.4 }, { f: 330, d: 0.4 }, { f: 349, d: 0.4 }, { f: 392, d: 0.8 },
      { f: 330, d: 0.4 }, { f: 349, d: 0.4 }, { f: 392, d: 0.4 }, { f: 349, d: 0.4 },
      { f: 330, d: 0.4 }, { f: 294, d: 0.4 }, { f: 330, d: 0.8 }, { f: 0, d: 0.4 }
    ];

    let step = 0;
    this.musicInterval = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const note = melody[step % melody.length];
      if (note.f > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = note.f;
        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + note.d);
        osc.connect(gain);
        gain.connect(this.musicGain);
        osc.start();
        osc.stop(this.ctx.currentTime + note.d);
        this.musicOscillators.push(osc);
      }
      step++;
    }, 400);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.musicOscillators.forEach(o => {
      try { o.stop(); } catch (_) {}
    });
    this.musicOscillators = [];
  }
}

window.audioManager = new AudioManager();
