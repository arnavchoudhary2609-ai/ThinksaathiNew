/**
 * ThinkSaathi Audio Synthesis Engine
 * Harnesses Web Audio API to generate high-fidelity, Gen-Z friendly mindfulness soundscapes.
 * Completely client-side, zero-latency, zero external asset downloads.
 */

class SaathiSoundEngine {
  constructor() {
    this.ctx = null;
    this.masterVolume = null;
    
    // Nodes for ambient/drone tracks
    this.droneOscs = [];
    this.droneGain = null;
    this.binauralOscL = null;
    this.binauralOscR = null;
    
    // Active modifiers for breathing phases
    this.breathGain = null;
    this.breathFilter = null;
    this.pannerNode = null; // for Anulom Vilom stereo panning
    
    // Wave sound nodes (sleep waves)
    this.waveBufferNode = null;
    this.waveGain = null;
    this.waveFilter = null;
    
    // Active intervals
    this.bowlInterval = null;
    this.oceanInterval = null;
    
    this.isPlaying = false;
    this.currentSessionType = null;
  }

  init() {
    if (this.ctx) return;
    
    // Initialize standard audio context safely across browsers
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Master volume node
    this.masterVolume = this.ctx.createGain();
    this.masterVolume.gain.setValueAtTime(0.6, this.ctx.currentTime);
    this.masterVolume.connect(this.ctx.destination);
  }

  setMasterVolume(val) {
    if (!this.masterVolume) return;
    this.masterVolume.gain.linearRampToValueAtTime(val, this.ctx.currentTime + 0.1);
  }

  // Starts the custom audio synthesis based on mindfulness session type
  start(sessionType) {
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    this.stopAll();
    this.currentSessionType = sessionType;
    this.isPlaying = true;

    // Create a base gain for the breathing pads
    this.breathGain = this.ctx.createGain();
    this.breathGain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    
    // Create stereo panner for Anulom Vilom or standard balance
    if (this.ctx.createStereoPanner) {
      this.pannerNode = this.ctx.createStereoPanner();
      this.pannerNode.pan.setValueAtTime(0, this.ctx.currentTime);
      this.breathGain.connect(this.pannerNode);
      this.pannerNode.connect(this.masterVolume);
    } else {
      this.breathGain.connect(this.masterVolume);
    }

    switch (sessionType) {
      case 'anulom_vilom':
        this.setupAnulomVilom();
        break;
      case 'bhramari':
        this.setupBhramari();
        break;
      case 'deep_belly':
        this.setupDeepBelly();
        break;
      case 'exam_calm':
        this.setupExamCalm();
        break;
      case 'morning_clarity':
        this.setupMorningClarity();
        break;
      case 'sleep_quiet':
        this.setupSleepQuiet();
        break;
    }
  }

  stop() {
    this.stopAll();
    this.isPlaying = false;
    this.currentSessionType = null;
  }

  stopAll() {
    // 1. Stop Drone Oscillators
    this.droneOscs.forEach(osc => {
      try { osc.stop(); } catch(e){}
    });
    this.droneOscs = [];
    if (this.droneGain) {
      try { this.droneGain.disconnect(); } catch(e){}
      this.droneGain = null;
    }

    // 2. Stop Binaural Oscillators
    if (this.binauralOscL) {
      try { this.binauralOscL.stop(); } catch(e){}
      this.binauralOscL = null;
    }
    if (this.binauralOscR) {
      try { this.binauralOscR.stop(); } catch(e){}
      this.binauralOscR = null;
    }

    // 3. Stop Wave Gen
    if (this.waveBufferNode) {
      try { this.waveBufferNode.stop(); } catch(e){}
      this.waveBufferNode = null;
    }
    if (this.waveGain) {
      try { this.waveGain.disconnect(); } catch(e){}
      this.waveGain = null;
    }

    // 4. Clear singing bowl interval
    if (this.bowlInterval) {
      clearInterval(this.bowlInterval);
      this.bowlInterval = null;
    }

    // 5. Clear ocean wave interval
    if (this.oceanInterval) {
      clearInterval(this.oceanInterval);
      this.oceanInterval = null;
    }
  }

  // Triggers updates when breathing steps transition (inhale, hold, exhale, hold)
  updateBreathingPhase(phase, durationMs) {
    if (!this.isPlaying || !this.ctx) return;
    
    const now = this.ctx.currentTime;
    const durSec = durationMs / 1000;

    // A. Visual Phase Panning for Anulom Vilom (Alternate Nostril)
    // Left nostril = left ear, Right nostril = right ear.
    if (this.currentSessionType === 'anulom_vilom' && this.pannerNode) {
      if (phase === 'inhale-left' || phase === 'exhale-left') {
        this.pannerNode.pan.linearRampToValueAtTime(-0.8, now + 1.0);
      } else if (phase === 'inhale-right' || phase === 'exhale-right') {
        this.pannerNode.pan.linearRampToValueAtTime(0.8, now + 1.0);
      } else {
        this.pannerNode.pan.linearRampToValueAtTime(0, now + 1.0); // Center during hold
      }
    }

    // Convert structured phases to simple Inhale, Hold, Exhale
    let simplifiedPhase = 'hold';
    if (phase.includes('inhale')) simplifiedPhase = 'inhale';
    if (phase.includes('exhale')) simplifiedPhase = 'exhale';

    // B. Handle specific audio profiles
    if (this.currentSessionType === 'bhramari') {
      // Bhramari is silent on inhale/hold, vibrates heavily like a bee hum during exhale
      if (simplifiedPhase === 'exhale') {
        this.droneOscs.forEach((osc, idx) => {
          // Exhale hum frequencies (around low 110Hz to 165Hz)
          const baseFreq = 110 + (idx * 55); 
          osc.frequency.setValueAtTime(baseFreq, now);
          // Gently pitch-bend the hum downwards like a natural vocal sigh
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.92, now + durSec);
        });
        // Bring hum gain up
        this.breathGain.gain.cancelScheduledValues(now);
        this.breathGain.gain.setValueAtTime(0.01, now);
        this.breathGain.gain.linearRampToValueAtTime(0.4, now + 0.8);
        this.breathGain.gain.exponentialRampToValueAtTime(0.01, now + durSec);
      } else {
        // Mute or dim to zero
        this.breathGain.gain.cancelScheduledValues(now);
        this.breathGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      }
    } 
    else if (this.currentSessionType === 'deep_belly' || this.currentSessionType === 'exam_calm') {
      // Warm atmospheric swells matching expansion/contraction
      if (simplifiedPhase === 'inhale') {
        this.breathGain.gain.cancelScheduledValues(now);
        this.breathGain.gain.linearRampToValueAtTime(0.35, now + durSec);
      } else if (simplifiedPhase === 'exhale') {
        this.breathGain.gain.cancelScheduledValues(now);
        this.breathGain.gain.linearRampToValueAtTime(0.08, now + durSec);
      } else {
        // Hold
        this.breathGain.gain.cancelScheduledValues(now);
        this.breathGain.gain.linearRampToValueAtTime(0.2, now + durSec);
      }
    }
    else if (this.currentSessionType === 'anulom_vilom') {
      if (simplifiedPhase === 'inhale') {
        this.breathGain.gain.cancelScheduledValues(now);
        this.breathGain.gain.linearRampToValueAtTime(0.25, now + durSec);
      } else if (simplifiedPhase === 'exhale') {
        this.breathGain.gain.cancelScheduledValues(now);
        this.breathGain.gain.linearRampToValueAtTime(0.07, now + durSec);
      } else {
        this.breathGain.gain.cancelScheduledValues(now);
        this.breathGain.gain.linearRampToValueAtTime(0.12, now + durSec);
      }
    }
  }

  // --- Session Audio Customization Configurations ---

  setupAnulomVilom() {
    const now = this.ctx.currentTime;
    // Create twin smooth sine wave pads (Root 220Hz, Perfect Fifth 330Hz)
    const freqs = [220, 330];
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.connect(this.breathGain);
      osc.start(now);
      this.droneOscs.push(osc);
    });
  }

  setupBhramari() {
    const now = this.ctx.currentTime;
    // Create detailed hum generator using multi-harmonic detuned triangle waves
    // Rich harmonic spectrum filters high frequencies to emulate a vocal hum
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(110, now); // base A2

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(220, now); // A3 harmonic

    // Warm resonant filter to suppress mechanical buzz and create deep, vocalizing hum
    this.breathFilter = this.ctx.createBiquadFilter();
    this.breathFilter.type = 'lowpass';
    this.breathFilter.frequency.setValueAtTime(180, now);
    this.breathFilter.Q.setValueAtTime(4.0, now);

    osc1.connect(this.breathFilter);
    osc2.connect(this.breathFilter);
    this.breathFilter.connect(this.breathGain);

    osc1.start(now);
    osc2.start(now);

    this.droneOscs.push(osc1, osc2);
  }

  setupDeepBelly() {
    const now = this.ctx.currentTime;
    // Massive, warm deep swelling frequencies (110Hz sine base, 165Hz fifth)
    const freqs = [110, 165, 220];
    freqs.forEach(f => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.connect(this.breathGain);
      osc.start(now);
      this.droneOscs.push(osc);
    });
  }

  setupExamCalm() {
    const now = this.ctx.currentTime;
    // Warm soothing low drone base
    const oscBase = this.ctx.createOscillator();
    oscBase.type = 'sine';
    oscBase.frequency.setValueAtTime(130.81, now); // C3
    oscBase.connect(this.breathGain);
    oscBase.start(now);
    this.droneOscs.push(oscBase);

    // Periodically strike beautiful singing bowls (every 12 seconds)
    this.triggerSingingBowl();
    this.bowlInterval = setInterval(() => {
      this.triggerSingingBowl();
    }, 12000);
  }

  setupMorningClarity() {
    const now = this.ctx.currentTime;
    // Beautiful, bright major chord drone evoking clarity and rising sun (C major: C3, G3, C4, E4)
    const chords = [130.81, 196.00, 261.63, 329.63];
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.setValueAtTime(0.08, now);
    this.droneGain.connect(this.masterVolume);

    chords.forEach((f, index) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      // Detune slightly for lush organic chorus vibrato
      osc.frequency.setValueAtTime(f + (Math.random() - 0.5) * 0.4, now);
      
      // Gentle warm LFO vibrato
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 0.2 + (index * 0.05);
      lfoGain.gain.value = 0.5;
      
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(now);

      osc.connect(this.droneGain);
      osc.start(now);
      this.droneOscs.push(osc);
    });
  }

  setupSleepQuiet() {
    const now = this.ctx.currentTime;
    // 1. Delta-wave Binaural Beats (200Hz in Left Ear, 204Hz in Right Ear)
    // Synchronizes brainwaves into a deep sleep state (4Hz differential)
    const splitter = this.ctx.createChannelSplitter(2);
    const merger = this.ctx.createChannelMerger(2);

    this.binauralOscL = this.ctx.createOscillator();
    this.binauralOscL.type = 'sine';
    this.binauralOscL.frequency.setValueAtTime(200, now);

    this.binauralOscR = this.ctx.createOscillator();
    this.binauralOscR.type = 'sine';
    this.binauralOscR.frequency.setValueAtTime(204, now);

    const gainL = this.ctx.createGain();
    gainL.gain.setValueAtTime(0.12, now);
    const gainR = this.ctx.createGain();
    gainR.gain.setValueAtTime(0.12, now);

    this.binauralOscL.connect(gainL);
    this.binauralOscR.connect(gainR);

    gainL.connect(merger, 0, 0); // connect to Left channel
    gainR.connect(merger, 0, 1); // connect to Right channel
    merger.connect(this.masterVolume);

    this.binauralOscL.start(now);
    this.binauralOscR.start(now);

    // 2. Dynamic Ocean Waves (Warm low-pass pink-like noise generator)
    this.generateOceanWaves();
  }

  // --- Specialized Instruments & Synthesized Textures ---

  // Simulates a high-end metal/crystal singing bowl strike
  triggerSingingBowl() {
    if (!this.ctx || !this.isPlaying) return;
    const now = this.ctx.currentTime;
    
    // A beautiful, complex strike requires multiple harmonically detuned oscillators
    const fundamental = 293.66; // D4 (associated with focus & flow)
    const partials = [1.0, 2.01, 3.02, 4.41, 5.67];
    const decayTimes = [8.0, 5.5, 4.0, 2.5, 1.5];
    const gains = [0.18, 0.08, 0.05, 0.03, 0.015];

    partials.forEach((mult, index) => {
      const freq = fundamental * mult;
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const amp = this.ctx.createGain();
      amp.gain.setValueAtTime(0, now);
      amp.gain.linearRampToValueAtTime(gains[index], now + 0.05); // quick strike attack
      amp.gain.exponentialRampToValueAtTime(0.0001, now + decayTimes[index]); // long physical sustain decay

      osc.connect(amp);
      amp.connect(this.masterVolume);

      osc.start(now);
      osc.stop(now + decayTimes[index]);
    });
  }

  // Dynamic procedural generator modeling ocean wave swell
  generateOceanWaves() {
    const bufferSize = this.ctx.sampleRate * 4; // 4 seconds of noise buffer
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Generate pink-like noise (filtered white noise)
    let b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // Normalize volume
      b6 = white * 0.115926;
    }

    this.waveBufferNode = this.ctx.createBufferSource();
    this.waveBufferNode.buffer = buffer;
    this.waveBufferNode.loop = true;

    this.waveFilter = this.ctx.createBiquadFilter();
    this.waveFilter.type = 'lowpass';
    this.waveFilter.frequency.setValueAtTime(250, this.ctx.currentTime);

    this.waveGain = this.ctx.createGain();
    this.waveGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    this.waveBufferNode.connect(this.waveFilter);
    this.waveFilter.connect(this.waveGain);
    this.waveGain.connect(this.masterVolume);

    this.waveBufferNode.start(0);

    // Periodically modulate filter cutoff and gain to simulate organic ocean swell waves (every 8.5 seconds)
    const swell = () => {
      if (!this.isPlaying || !this.waveGain || this.currentSessionType !== 'sleep_quiet') return;
      const t = this.ctx.currentTime;
      
      // Swell up (inhale phase equivalent)
      this.waveGain.gain.cancelScheduledValues(t);
      this.waveGain.gain.linearRampToValueAtTime(0.18, t + 4.0);
      this.waveFilter.frequency.cancelScheduledValues(t);
      this.waveFilter.frequency.exponentialRampToValueAtTime(550, t + 4.0);

      // Swell down (exhale phase equivalent)
      this.waveGain.gain.setValueAtTime(0.18, t + 4.0);
      this.waveGain.gain.linearRampToValueAtTime(0.03, t + 8.5);
      this.waveFilter.frequency.setValueAtTime(550, t + 4.0);
      this.waveFilter.frequency.exponentialRampToValueAtTime(150, t + 8.5);
    };

    swell();
    this.oceanInterval = setInterval(swell, 8500);
  }
}

// Attach to window so it is accessible from main scripts
window.SaathiSoundEngine = SaathiSoundEngine;
window.audioEngine = new SaathiSoundEngine();
