/**
 * 🎮 Agent Valhalla - Web Audio Procedural Sound Engine
 * 0 KB external audio files · Native Web Audio API Synthesizer
 * Generates unique deterministic chimes and RPG sound effects.
 */

(function (window) {
  'use strict';

  let audioCtx = null;
  let soundEnabled = localStorage.getItem('valhalla_sound_enabled') !== 'false'; // default true

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Simple string hash to generate deterministic numbers from agent.id
  function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  const ValhallaAudio = {
    isSoundEnabled: function () {
      return soundEnabled;
    },

    toggleSound: function () {
      soundEnabled = !soundEnabled;
      localStorage.setItem('valhalla_sound_enabled', soundEnabled ? 'true' : 'false');
      if (soundEnabled) {
        this.playBeep(523.25, 0.1, 'sine'); // C5 confirmation beep
      }
      return soundEnabled;
    },

    setSoundEnabled: function (enabled) {
      soundEnabled = !!enabled;
      localStorage.setItem('valhalla_sound_enabled', soundEnabled ? 'true' : 'false');
    },

    playBeep: function (freq, duration, type) {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq || 440, ctx.currentTime);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (duration || 0.15));

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + (duration || 0.15));
      } catch (e) {
        console.warn('Audio play error:', e);
      }
    },

    /**
     * 🎴 Play a unique deterministic 3-note chime when inspecting a hero!
     * Each hero has a distinct melody computed from their ID and domain.
     */
    playHeroChime: function (agent) {
      if (!soundEnabled || !agent) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const hash = hashString(agent.id || 'hero');
        const now = ctx.currentTime;

        // Choose base scale and wave type based on domain
        const domain = (agent.domain || '').toLowerCase();
        const rarity = (agent.rarity || 'Rare');

        let waveType = 'sine';
        let basePitch = 261.63; // C4

        if (domain.includes('security') || domain.includes('sysadmin')) {
          waveType = 'triangle';
          basePitch = 196.00; // G3 (deeper, serious)
        } else if (domain.includes('game') || domain.includes('spatial') || domain.includes('media')) {
          waveType = 'sawtooth';
          basePitch = 329.63; // E4 (cyber, energetic)
        } else if (domain.includes('design') || domain.includes('creative')) {
          waveType = 'sine';
          basePitch = 349.23; // F4 (ethereal, harmonious)
        } else if (domain.includes('finance') || domain.includes('product') || domain.includes('marketing')) {
          waveType = 'sine';
          basePitch = 293.66; // D4 (confident, bright)
        }

        // Generate 3 harmonic chord offsets from hash
        const intervals = [
          1,
          1 + ((hash % 5) * 0.125),
          1.5 + (((hash >> 3) % 4) * 0.125)
        ];

        intervals.forEach((multiplier, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = waveType;
          osc.frequency.setValueAtTime(basePitch * multiplier, now + idx * 0.08);

          const startTime = now + idx * 0.08;
          const noteDuration = 0.22;

          gain.gain.setValueAtTime(0.0001, startTime);
          gain.gain.linearRampToValueAtTime(0.08, startTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + noteDuration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + noteDuration);
        });

        // If Legendary, add a soft golden shimmer overtone
        if (rarity === 'Legendary') {
          const shimmerOsc = ctx.createOscillator();
          const shimmerGain = ctx.createGain();
          shimmerOsc.type = 'sine';
          shimmerOsc.frequency.setValueAtTime(basePitch * 3, now + 0.2);

          shimmerGain.gain.setValueAtTime(0.0001, now + 0.2);
          shimmerGain.gain.linearRampToValueAtTime(0.05, now + 0.26);
          shimmerGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

          shimmerOsc.connect(shimmerGain);
          shimmerGain.connect(ctx.destination);

          shimmerOsc.start(now + 0.2);
          shimmerOsc.stop(now + 0.6);
        }
      } catch (e) {
        console.warn('Audio chime error:', e);
      }
    },

    /**
     * ⚡ Summon action sound - Energetic power surge
     */
    playSummonSound: function (agent) {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Frequency sweep from 200Hz to 600Hz
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.18);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.25);

        // Follow-up sparkle chord
        const chordNotes = [523.25, 659.25, 783.99]; // C5, E5, G5
        chordNotes.forEach((freq, idx) => {
          const cOsc = ctx.createOscillator();
          const cGain = ctx.createGain();

          cOsc.type = 'sine';
          cOsc.frequency.setValueAtTime(freq, now + 0.1 + idx * 0.04);

          const cStart = now + 0.1 + idx * 0.04;
          cGain.gain.setValueAtTime(0.07, cStart);
          cGain.gain.exponentialRampToValueAtTime(0.0001, cStart + 0.2);

          cOsc.connect(cGain);
          cGain.connect(ctx.destination);

          cOsc.start(cStart);
          cOsc.stop(cStart + 0.2);
        });
      } catch (e) {
        console.warn('Summon audio error:', e);
      }
    },

    /**
     * 🏆 Level-up fanfare sound - Major victorious arpeggio
     */
    playLevelUpSound: function () {
      if (!soundEnabled) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      try {
        const now = ctx.currentTime;
        // C4, E4, G4, C5, E5 fanfare
        const fanfare = [261.63, 329.63, 392.00, 523.25, 659.25];

        fanfare.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = idx === fanfare.length - 1 ? 'triangle' : 'sine';
          const startTime = now + idx * 0.09;
          const duration = idx === fanfare.length - 1 ? 0.6 : 0.2;

          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.001, startTime);
          gain.gain.linearRampToValueAtTime(0.12, startTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
        });
      } catch (e) {
        console.warn('Level-up audio error:', e);
      }
    }
  };

  window.ValhallaAudio = ValhallaAudio;
})(window);
