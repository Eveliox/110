// Opt-in, synthesized sound: nothing is downloaded and nothing plays until the visitor turns it on.
// Interactions report how hard they're moving; each voice swells with that and fades on its own.

type Voice = { gain: GainNode; filter: BiquadFilterNode };

let context: AudioContext | null = null;
let voices: { pour: Voice; squeegee: Voice } | null = null;
let enabled = false;
const listeners = new Set<(on: boolean) => void>();

function noiseBuffer(ctx: AudioContext) {
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let brown = 0;
  // Brownian noise: softer and more liquid than white noise.
  for (let i = 0; i < data.length; i++) { brown = (brown + (Math.random() * 2 - 1) * .02) / 1.02; data[i] = brown * 3.5; }
  return buffer;
}

function voice(ctx: AudioContext, buffer: AudioBuffer, type: BiquadFilterType, frequency: number, q: number): Voice {
  const source = ctx.createBufferSource();
  source.buffer = buffer; source.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = type; filter.frequency.value = frequency; filter.Q.value = q;
  const gain = ctx.createGain();
  gain.gain.value = 0;
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start();
  return { gain, filter };
}

function swell(v: Voice | undefined, level: number, pitch: number, release: number) {
  if (!context || !v || !enabled) return;
  const now = context.currentTime;
  v.gain.gain.cancelScheduledValues(now);
  v.gain.gain.setTargetAtTime(level, now, .03);
  v.gain.gain.setTargetAtTime(0, now + .08, release);
  v.filter.frequency.setTargetAtTime(pitch, now, .05);
}

export const sound = {
  get enabled() { return enabled; },
  async setEnabled(on: boolean) {
    enabled = on;
    if (on && !context) {
      context = new AudioContext();
      const buffer = noiseBuffer(context);
      voices = { pour: voice(context, buffer, "lowpass", 500, 4), squeegee: voice(context, buffer, "bandpass", 1600, 6) };
    }
    if (context) await (on ? context.resume() : context.suspend());
    listeners.forEach(fn => fn(on));
  },
  subscribe(fn: (on: boolean) => void) { listeners.add(fn); return () => { listeners.delete(fn); }; },
  /** Stirring the pour: speed is screen-widths per second. */
  stir(speed: number) { const s = Math.min(1, speed / 3); swell(voices?.pour, s * .5, 320 + s * 700, .25); },
  /** Pulling the squeegee: speed is CSS pixels per millisecond. */
  squeegee(speed: number) { const s = Math.min(1, speed / 2.5); swell(voices?.squeegee, .12 + s * .4, 1100 + s * 1300, .12); },
  /** A sample chip set down on the table. */
  tap() {
    if (!context || !enabled) return;
    const now = context.currentTime, osc = context.createOscillator(), gain = context.createGain();
    osc.frequency.setValueAtTime(820, now); osc.frequency.exponentialRampToValueAtTime(240, now + .07);
    gain.gain.setValueAtTime(.18, now); gain.gain.exponentialRampToValueAtTime(.001, now + .12);
    osc.connect(gain).connect(context.destination); osc.start(now); osc.stop(now + .13);
  },
};
