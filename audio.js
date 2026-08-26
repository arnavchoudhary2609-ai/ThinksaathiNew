/**
 * ThinkSaathi Audio Synthesis Engine — v3.0
 * Nature-immersive soundscapes for the 6 digital sanctuary environments.
 * Uses Web Audio API to generate ocean waves, forest breeze, mountain wind,
 * singing bowls, rain, and cosmic drones — all client-side, zero downloads.
 *
 * Each environment has a unique ambient layer that plays continuously
 * and responds to breathing phases with volume swells.
 */

class SaathiSoundEngine {
  constructor() {
    this.ctx = null;
    this.masterVolume = null;

    // Shared audio nodes
    this.droneOscs = [];
    this.droneGain = null;
    this.breathGain = null;

    // Noise-based ambient generators
    this.noiseNode = null;
    this.noiseGain = null;
    this.noiseFilter = null;

    // Wave/wind swell modulation
    this.swellInterval = null;

    // Singing bowl interval
    this.bowlInterval = null;

    this.isPlaying = false;
    this.currentSessionType = null;
  }

  init() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();

    this.masterVolume = this.ctx.createGain();
    this.masterVolume.gain.setValueAtTime(0.55, this.ctx.currentTime);
    this.masterVolume.connect(this.ctx.destination);
  }

  setMasterVolume(val) {
    if (!this.masterVolume) return;
    this.masterVolume.gain.linearRampToValueAtTime(val, this.ctx.currentTime + 0.1);
  }

  // ── PUBLIC API ──

  start(sessionType) {
    this.init();
    if (this.ctx.state === 'suspended') this.ctx.resume();

    this.stopAll();
    this.currentSessionType = sessionType;
    this.isPlaying = true;

    // Shared breath-reactive gain node
    this.breathGain = this.ctx.createGain();
    this.breathGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    this.breathGain.connect(this.masterVolume);

    switch (sessionType) {
      case 'ocean_breathing':   this.setupOcean();       break;
      case 'pink_sky':          this.setupPinkSky();     break;
      case 'mountain_calm':     this.setupMountain();    break;
      case 'gentle_yoga':       this.setupYoga();        break;
      case 'stretch_release':   this.setupStretch();     break;
      case 'guided_meditation': this.setupMeditation();  break;
      default:                  this.setupOcean();       break;
    }
  }

  stop() {
    this.stopAll();
    this.isPlaying = false;
    this.currentSessionType = null;
  }

  stopAll() {
    this.droneOscs.forEach(osc => { try { osc.stop(); } catch(e){} });
    this.droneOscs = [];

    if (this.droneGain) { try { this.droneGain.disconnect(); } catch(e){} this.droneGain = null; }
    if (this.noiseNode) { try { this.noiseNode.stop(); } catch(e){} this.noiseNode = null; }
    if (this.noiseGain) { try { this.noiseGain.disconnect(); } catch(e){} this.noiseGain = null; }
    if (this.noiseFilter) { try { this.noiseFilter.disconnect(); } catch(e){} this.noiseFilter = null; }
    if (this.swellInterval) { clearInterval(this.swellInterval); this.swellInterval = null; }
    if (this.bowlInterval) { clearInterval(this.bowlInterval); this.bowlInterval = null; }
  }

  // Called by processNextBreathingStep to modulate volume with breathing phases
  updateBreathingPhase(phase, durationMs) {
    if (!this.isPlaying || !this.ctx || !this.breathGain) return;

    const now = this.ctx.currentTime;
    const dur = durationMs / 1000;

    let simple = 'hold';
    if (phase.includes('inhale')) simple = 'inhale';
    if (phase.includes('exhale')) simple = 'exhale';

    // Swell the ambient soundscape with the breath
    if (simple === 'inhale') {
      this.breathGain.gain.cancelScheduledValues(now);
      this.breathGain.gain.linearRampToValueAtTime(0.35, now + dur);
    } else if (simple === 'exhale') {
      this.breathGain.gain.cancelScheduledValues(now);
      this.breathGain.gain.linearRampToValueAtTime(0.08, now + dur);
    } else {
      this.breathGain.gain.cancelScheduledValues(now);
      this.breathGain.gain.linearRampToValueAtTime(0.18, now + dur);
    }

    // Modulate noise filter cutoff to make waves/wind "breathe"
    if (this.noiseFilter) {
      if (simple === 'inhale') {
        this.noiseFilter.frequency.cancelScheduledValues(now);
        this.noiseFilter.frequency.exponentialRampToValueAtTime(600, now + dur);
      } else if (simple === 'exhale') {
        this.noiseFilter.frequency.cancelScheduledValues(now);
        this.noiseFilter.frequency.exponentialRampToValueAtTime(150, now + dur);
      }
    }
  }

  // ── ENVIRONMENT SOUND PROFILES ──

  /**
   * 🌊 OCEAN BREATHING
   * Deep ocean wave swells using filtered pink noise + low sine drone
   */
  setupOcean() {
    const now = this.ctx.currentTime;

    // 1. Ocean wave noise (filtered pink noise with periodic swell)
    this._createPinkNoise(0.14, 250);

    // 2. Deep warm sub-bass drone (ocean depth rumble)
    const freqs = [55, 82.41]; // A1 and E2 — deep ocean tones
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.06, now);
    this.droneGain.connect(this.breathGain);

    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.connect(this.droneGain);
      osc.start(now);
      this.droneOscs.push(osc);
    });

    // 3. Periodic wave swell modulation (every 8s, simulates waves crashing)
    this._startWaveSwell(8000, 0.22, 0.04, 550, 120);
  }

  /**
   * 🌸 PINK SKY BREATHING
   * Warm evening atmosphere — gentle wind + warm harmonic pad
   */
  setupPinkSky() {
    const now = this.ctx.currentTime;

    // 1. Gentle breeze (very soft filtered noise)
    this._createPinkNoise(0.06, 180);

    // 2. Warm major chord pad (C major: C4, E4, G4)
    const chords = [261.63, 329.63, 392.00];
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.05, now);
    this.droneGain.connect(this.breathGain);

    chords.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f + (Math.random() - 0.5) * 0.5, now);
      osc.connect(this.droneGain);
      osc.start(now);
      this.droneOscs.push(osc);

      // Gentle LFO vibrato for organic warmth
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.15 + (i * 0.04);
      lfoGain.gain.value = 0.4;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);
      this.droneOscs.push(lfo);
    });

    // 3. Gentle wind swell
    this._startWaveSwell(10000, 0.12, 0.02, 350, 100);
  }

  /**
   * ⛰️ MOUNTAIN CALM
   * Morning valley — mountain wind with clear singing bowls
   */
  setupMountain() {
    const now = this.ctx.currentTime;

    // 1. Mountain wind noise
    this._createPinkNoise(0.08, 200);

    // 2. Clear, ethereal drone (perfect fifth: D3 + A3)
    const freqs = [146.83, 220.00];
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.04, now);
    this.droneGain.connect(this.breathGain);

    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.connect(this.droneGain);
      osc.start(now);
      this.droneOscs.push(osc);
    });

    // 3. Periodic crystal singing bowl strikes (every 15s)
    this._triggerSingingBowl();
    this.bowlInterval = setInterval(() => this._triggerSingingBowl(), 15000);

    // 4. Wind swell
    this._startWaveSwell(12000, 0.15, 0.03, 400, 100);
  }

  /**
   * 🧘 GENTLE YOGA
   * Warm indoor atmosphere — soft pad with subtle wind chimes
   */
  setupYoga() {
    const now = this.ctx.currentTime;

    // 1. Very quiet room ambience
    this._createPinkNoise(0.03, 120);

    // 2. Rich warm major 7th chord (Cmaj7: C3, E3, G3, B3)
    const chords = [130.81, 164.81, 196.00, 246.94];
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.04, now);
    this.droneGain.connect(this.breathGain);

    chords.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.connect(this.droneGain);
      osc.start(now);
      this.droneOscs.push(osc);
    });

    // 3. Periodic soft chime (every 10s)
    this._triggerChime();
    this.bowlInterval = setInterval(() => this._triggerChime(), 10000);
  }

  /**
   * 💆 STRETCH & RELEASE
   * Calm indoor — deep bass with soft rain-like texture
   */
  setupStretch() {
    const now = this.ctx.currentTime;

    // 1. Gentle rain texture (higher-frequency noise, softer)
    this._createPinkNoise(0.09, 400);

    // 2. Deep calming minor drone (A minor: A2, C3, E3)
    const freqs = [110, 130.81, 164.81];
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.035, now);
    this.droneGain.connect(this.breathGain);

    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.connect(this.droneGain);
      osc.start(now);
      this.droneOscs.push(osc);
    });

    // 3. Soft rain swell
    this._startWaveSwell(9000, 0.16, 0.04, 600, 200);
  }

  /**
   * 🌌 GUIDED MEDITATION
   * Deep space — cosmic drone with binaural beats + star shimmer
   */
  setupMeditation() {
    const now = this.ctx.currentTime;

    // 1. Very faint cosmic dust noise
    this._createPinkNoise(0.04, 150);

    // 2. Deep cosmic drone (C2 + G2)
    const freqs = [65.41, 98.00];
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.05, now);
    this.droneGain.connect(this.breathGain);

    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.connect(this.droneGain);
      osc.start(now);
      this.droneOscs.push(osc);
    });

    // 3. Theta-wave binaural beats (200Hz L, 206Hz R → 6Hz theta differential)
    const merger = this.ctx.createChannelMerger(2);
    const binauralGainL = this.ctx.createGain();
    const binauralGainR = this.ctx.createGain();
    binauralGainL.gain.setValueAtTime(0.08, now);
    binauralGainR.gain.setValueAtTime(0.08, now);

    const oscL = this.ctx.createOscillator();
    oscL.type = 'sine';
    oscL.frequency.setValueAtTime(200, now);

    const oscR = this.ctx.createOscillator();
    oscR.type = 'sine';
    oscR.frequency.setValueAtTime(206, now);

    oscL.connect(binauralGainL);
    oscR.connect(binauralGainR);
    binauralGainL.connect(merger, 0, 0);
    binauralGainR.connect(merger, 0, 1);
    merger.connect(this.masterVolume);

    oscL.start(now);
    oscR.start(now);
    this.droneOscs.push(oscL, oscR);

    // 4. Periodic singing bowl for deep focus
    this._triggerSingingBowl();
    this.bowlInterval = setInterval(() => this._triggerSingingBowl(), 18000);
  }

  // ── SHARED SOUND PRIMITIVES ──

  /**
   * Creates a seamlessly looping pink noise generator (simulates ocean, wind, rain)
   * @param {number} volume - initial gain (0.0–1.0)
   * @param {number} cutoff - lowpass filter cutoff frequency in Hz
   */
  _createPinkNoise(volume, cutoff) {
    const bufferSize = this.ctx.sampleRate * 4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    // Pink noise via Paul Kellet's refined method
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = buffer;
    this.noiseNode.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'lowpass';
    this.noiseFilter.frequency.setValueAtTime(cutoff, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(volume, this.ctx.currentTime);

    this.noiseNode.connect(this.noiseFilter);
    this.noiseFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.breathGain);
    this.noiseNode.start(0);
  }

  /**
   * Starts a periodic volume + filter swell to simulate organic wave/wind motion.
   * Creates the "breathing ocean" or "gusting mountain wind" effect.
   */
  _startWaveSwell(intervalMs, peakVol, troughVol, peakCutoff, troughCutoff) {
    const swell = () => {
      if (!this.isPlaying || !this.noiseGain) return;
      const t = this.ctx.currentTime;
      const halfCycle = intervalMs / 2000; // half-cycle in seconds

      // Swell up
      this.noiseGain.gain.cancelScheduledValues(t);
      this.noiseGain.gain.linearRampToValueAtTime(peakVol, t + halfCycle);
      if (this.noiseFilter) {
        this.noiseFilter.frequency.cancelScheduledValues(t);
        this.noiseFilter.frequency.exponentialRampToValueAtTime(peakCutoff, t + halfCycle);
      }

      // Swell down
      this.noiseGain.gain.setValueAtTime(peakVol, t + halfCycle);
      this.noiseGain.gain.linearRampToValueAtTime(troughVol, t + halfCycle * 2);
      if (this.noiseFilter) {
        this.noiseFilter.frequency.setValueAtTime(peakCutoff, t + halfCycle);
        this.noiseFilter.frequency.exponentialRampToValueAtTime(troughCutoff, t + halfCycle * 2);
      }
    };

    swell();
    this.swellInterval = setInterval(swell, intervalMs);
  }

  /**
   * Crystal singing bowl strike — complex multi-partial with long decay
   */
  _triggerSingingBowl() {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    const fundamental = 293.66; // D4
    const partials = [1.0, 2.01, 3.02, 4.41, 5.67];
    const decays = [8.0, 5.5, 4.0, 2.5, 1.5];
    const gains = [0.14, 0.06, 0.04, 0.025, 0.012];

    partials.forEach((mult, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * mult, now);

      const amp = this.ctx.createGain();
      amp.gain.setValueAtTime(0, now);
      amp.gain.linearRampToValueAtTime(gains[i], now + 0.04);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + decays[i]);

      osc.connect(amp);
      amp.connect(this.masterVolume);
      osc.start(now);
      osc.stop(now + decays[i]);
    });
  }

  /**
   * Soft wind chime — high-frequency short-decay sine burst
   */
  _triggerChime() {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;

    // Random high-register notes for organic feel
    const notes = [880, 1046.5, 1318.5, 1568, 1760];
    const chosen = notes[Math.floor(Math.random() * notes.length)];

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(chosen, now);

    const amp = this.ctx.createGain();
    amp.gain.setValueAtTime(0, now);
    amp.gain.linearRampToValueAtTime(0.08, now + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

    osc.connect(amp);
    amp.connect(this.masterVolume);
    osc.start(now);
    osc.stop(now + 3.0);
  }
}

// Attach globally
window.SaathiSoundEngine = SaathiSoundEngine;
window.audioEngine = new SaathiSoundEngine();
