const audioCtx = () => {
  if (!_ctx) _ctx = new AudioContext();
  return _ctx;
};
let _ctx: AudioContext | null = null;

function play(fn: (ctx: AudioContext) => void) {
  const ctx = audioCtx();
  if (ctx.state === "suspended") ctx.resume();
  fn(ctx);
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

export function playSpinStart() {
  play((ctx) => {
    // Quick descending whir
    for (let i = 0; i < 6; i++) {
      tone(ctx, 600 - i * 60, 0.06, "square", 0.1, ctx.currentTime + i * 0.03);
    }
  });
}

export function playReelStop() {
  play((ctx) => {
    // Clunk sound
    tone(ctx, 150, 0.1, "square", 0.12);
    noise(ctx, 0.05, 0.1);
  });
}

export function playWin() {
  play((ctx) => {
    const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      tone(ctx, freq, 0.25, "square", 0.12, ctx.currentTime + i * 0.12);
    });
  });
}

export function playJackpot() {
  play((ctx) => {
    // Triumphant fanfare
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((freq, i) => {
      tone(ctx, freq, 0.3, "square", 0.12, ctx.currentTime + i * 0.15);
      tone(ctx, freq * 0.5, 0.3, "triangle", 0.08, ctx.currentTime + i * 0.15);
    });
  });
}

export function playLose() {
  play((ctx) => {
    // Sad descending tones
    tone(ctx, 300, 0.2, "triangle", 0.1);
    tone(ctx, 220, 0.3, "triangle", 0.1, ctx.currentTime + 0.2);
  });
}

export function playRefill() {
  play((ctx) => {
    // Coin-drop sound
    for (let i = 0; i < 4; i++) {
      tone(ctx, 1200 + i * 200, 0.1, "sine", 0.1, ctx.currentTime + i * 0.08);
    }
  });
}

export function playHandlePull() {
  play((ctx) => {
    // Mechanical spring sound
    tone(ctx, 200, 0.08, "sawtooth", 0.1);
    tone(ctx, 350, 0.06, "sawtooth", 0.08, ctx.currentTime + 0.05);
    noise(ctx, 0.06, 0.06, ctx.currentTime + 0.02);
  });
}
