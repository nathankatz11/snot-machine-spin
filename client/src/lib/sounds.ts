const audioCtx = () => {
  if (!_ctx) _ctx = new AudioContext();
  return _ctx;
};
let _ctx: AudioContext | null = null;

let _musicGain: GainNode | null = null;
let _musicPlaying = false;

function play(fn: (ctx: AudioContext) => void) {
  const ctx = audioCtx();
  if (ctx.state === "suspended") ctx.resume();
  fn(ctx);
}

export function isMobile(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

export async function checkSilentMode(): Promise<boolean> {
  if (!isMobile()) return false;
  const ctx = audioCtx();
  if (ctx.state === "suspended") {
    try { await ctx.resume(); } catch { return true; }
  }
  return new Promise<boolean>((resolve) => {
    const osc = ctx.createOscillator();
    const analyser = ctx.createAnalyser();
    const gain = ctx.createGain();
    analyser.fftSize = 256;
    osc.frequency.value = 200;
    gain.gain.value = 0.01;
    osc.connect(gain).connect(analyser).connect(ctx.destination);
    osc.start();
    setTimeout(() => {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      osc.stop();
      osc.disconnect();
      const hasSignal = data.some((v) => v > 0);
      resolve(!hasSignal);
    }, 100);
  });
}

export function shouldShowSoundReminder(): boolean {
  if (!isMobile()) return false;
  const dismissed = sessionStorage.getItem("sound-reminder-dismissed");
  return !dismissed;
}

export function dismissSoundReminder(): void {
  sessionStorage.setItem("sound-reminder-dismissed", "1");
}

function tone(
  ctx: AudioContext,
  freq: number,
  duration: number,
  type: OscillatorType = "square",
  volume = 0.15,
  startTime = ctx.currentTime,
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

function noise(ctx: AudioContext, duration: number, volume = 0.08, startTime = ctx.currentTime) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const src = ctx.createBufferSource();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 800;
  filter.Q.value = 1;
  src.buffer = buffer;
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  src.connect(filter).connect(gain).connect(ctx.destination);
  src.start(startTime);
  src.stop(startTime + duration);
}

// ─── Background Music (looping chiptune) ───

export function startMusic() {
  if (_musicPlaying) return;
  play((ctx) => {
    _musicGain = ctx.createGain();
    _musicGain.gain.value = 0.04;
    _musicGain.connect(ctx.destination);

    const melody = [
      392, 440, 494, 523, 494, 440, 392, 330,
      294, 330, 392, 440, 392, 330, 294, 262,
      392, 440, 494, 523, 587, 523, 494, 440,
      392, 440, 392, 330, 294, 330, 392, 392,
    ];
    const bass = [
      196, 196, 220, 220, 247, 247, 262, 262,
      165, 165, 196, 196, 220, 220, 196, 196,
      196, 196, 220, 220, 247, 247, 262, 262,
      196, 196, 220, 220, 165, 165, 196, 196,
    ];
    const noteLen = 0.22;
    const loopLen = melody.length * noteLen;

    function scheduleLoop(startAt: number) {
      if (!_musicPlaying || !_musicGain) return;
      for (let i = 0; i < melody.length; i++) {
        const t = startAt + i * noteLen;
        // Melody
        const osc1 = ctx.createOscillator();
        const g1 = ctx.createGain();
        osc1.type = "square";
        osc1.frequency.value = melody[i];
        g1.gain.setValueAtTime(0.06, t);
        g1.gain.exponentialRampToValueAtTime(0.001, t + noteLen * 0.9);
        osc1.connect(g1).connect(_musicGain!);
        osc1.start(t);
        osc1.stop(t + noteLen);

        // Bass
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.type = "triangle";
        osc2.frequency.value = bass[i];
        g2.gain.setValueAtTime(0.04, t);
        g2.gain.exponentialRampToValueAtTime(0.001, t + noteLen * 0.9);
        osc2.connect(g2).connect(_musicGain!);
        osc2.start(t);
        osc2.stop(t + noteLen);
      }
      // Schedule next loop
      setTimeout(() => scheduleLoop(startAt + loopLen), (loopLen - 1) * 1000);
    }

    _musicPlaying = true;
    scheduleLoop(ctx.currentTime);
  });
}

export function stopMusic() {
  _musicPlaying = false;
  if (_musicGain) {
    _musicGain.gain.setValueAtTime(_musicGain.gain.value, audioCtx().currentTime);
    _musicGain.gain.exponentialRampToValueAtTime(0.001, audioCtx().currentTime + 0.5);
    _musicGain = null;
  }
}

export function isMusicPlaying() {
  return _musicPlaying;
}

// ─── Game Sounds ───

export function playSpinStart() {
  play((ctx) => {
    for (let i = 0; i < 6; i++) {
      tone(ctx, 600 - i * 60, 0.06, "square", 0.1, ctx.currentTime + i * 0.03);
    }
  });
}

export function playReelStop() {
  play((ctx) => {
    tone(ctx, 150, 0.1, "square", 0.12);
    noise(ctx, 0.05, 0.1);
  });
}

export function playWin(size: "small" | "medium" | "big" = "medium") {
  play((ctx) => {
    if (size === "small") {
      const notes = [523, 659, 784];
      notes.forEach((freq, i) => {
        tone(ctx, freq, 0.2, "square", 0.08, ctx.currentTime + i * 0.1);
      });
    } else if (size === "medium") {
      const notes = [523, 659, 784, 1047];
      notes.forEach((freq, i) => {
        tone(ctx, freq, 0.25, "square", 0.12, ctx.currentTime + i * 0.12);
      });
    } else {
      const notes = [523, 659, 784, 1047, 1319];
      notes.forEach((freq, i) => {
        tone(ctx, freq, 0.3, "square", 0.14, ctx.currentTime + i * 0.1);
        tone(ctx, freq * 0.5, 0.3, "triangle", 0.06, ctx.currentTime + i * 0.1);
      });
    }
  });
}

export function playJackpot() {
  play((ctx) => {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      tone(ctx, freq, 0.3, "square", 0.12, ctx.currentTime + i * 0.15);
      tone(ctx, freq * 0.5, 0.3, "triangle", 0.08, ctx.currentTime + i * 0.15);
    });
    // Extra sparkle
    for (let i = 0; i < 10; i++) {
      tone(ctx, 2000 + Math.random() * 2000, 0.05, "sine", 0.04, ctx.currentTime + 1 + i * 0.08);
    }
  });
}

export function playLose() {
  play((ctx) => {
    tone(ctx, 300, 0.2, "triangle", 0.1);
    tone(ctx, 220, 0.3, "triangle", 0.1, ctx.currentTime + 0.2);
  });
}

export function playRefill() {
  play((ctx) => {
    for (let i = 0; i < 4; i++) {
      tone(ctx, 1200 + i * 200, 0.1, "sine", 0.1, ctx.currentTime + i * 0.08);
    }
  });
}

export function playHandlePull() {
  play((ctx) => {
    tone(ctx, 200, 0.08, "sawtooth", 0.1);
    tone(ctx, 350, 0.06, "sawtooth", 0.08, ctx.currentTime + 0.05);
    noise(ctx, 0.06, 0.06, ctx.currentTime + 0.02);
  });
}

export function playAnticipation() {
  play((ctx) => {
    // Drumroll-style building tension
    for (let i = 0; i < 12; i++) {
      const t = ctx.currentTime + i * 0.06;
      tone(ctx, 200 + i * 30, 0.05, "square", 0.04 + i * 0.005, t);
      noise(ctx, 0.03, 0.03 + i * 0.003, t);
    }
  });
}

export function playBonusTrigger() {
  play((ctx) => {
    // Dramatic ascending fanfare
    const notes = [392, 494, 587, 698, 784, 880, 988, 1047];
    notes.forEach((freq, i) => {
      tone(ctx, freq, 0.15, "square", 0.12, ctx.currentTime + i * 0.08);
      tone(ctx, freq * 1.5, 0.15, "sine", 0.06, ctx.currentTime + i * 0.08);
    });
    // Sparkle cascade
    for (let i = 0; i < 20; i++) {
      tone(ctx, 1500 + Math.random() * 3000, 0.08, "sine", 0.03, ctx.currentTime + 0.6 + i * 0.04);
    }
  });
}

export function playFreeSpin() {
  play((ctx) => {
    tone(ctx, 880, 0.15, "square", 0.08);
    tone(ctx, 1047, 0.15, "square", 0.08, ctx.currentTime + 0.08);
    tone(ctx, 1319, 0.2, "square", 0.1, ctx.currentTime + 0.16);
  });
}

export function playStreakUp() {
  play((ctx) => {
    tone(ctx, 880, 0.1, "sine", 0.1);
    tone(ctx, 1320, 0.15, "sine", 0.12, ctx.currentTime + 0.08);
    tone(ctx, 1760, 0.2, "sine", 0.1, ctx.currentTime + 0.16);
  });
}

export function playStreakBreak() {
  play((ctx) => {
    // Sad trombone
    tone(ctx, 392, 0.3, "sawtooth", 0.08);
    tone(ctx, 370, 0.3, "sawtooth", 0.08, ctx.currentTime + 0.3);
    tone(ctx, 349, 0.3, "sawtooth", 0.08, ctx.currentTime + 0.6);
    tone(ctx, 294, 0.6, "sawtooth", 0.1, ctx.currentTime + 0.9);
  });
}

export function playAchievement() {
  play((ctx) => {
    const notes = [784, 988, 1175, 1568];
    notes.forEach((freq, i) => {
      tone(ctx, freq, 0.2, "sine", 0.1, ctx.currentTime + i * 0.12);
      tone(ctx, freq * 0.5, 0.2, "triangle", 0.05, ctx.currentTime + i * 0.12);
    });
  });
}

export function playTickUp() {
  play((ctx) => {
    tone(ctx, 1200, 0.03, "sine", 0.06);
  });
}
