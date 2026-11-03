export class GardenAudio {
  private context?: AudioContext;
  private voices = new Set<OscillatorNode>();
  private silent = false;
  get muted(): boolean { return this.silent; }
  set muted(value:boolean) { this.silent=value; if (value) this.cancel(); }
  unlock(): void {
    try {
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => {});
    } catch { /* Visual timing remains fully usable without an audio device. */ }
  }
  note(midi: number): void {
    if (this.muted || !this.context || this.context.state !== 'running' || this.voices.size>=12) return;
    const context = this.context, oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    gain.gain.setValueAtTime(0, context.currentTime);
    gain.gain.linearRampToValueAtTime(.055, context.currentTime + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .65);
    oscillator.connect(gain); gain.connect(context.destination);
    this.voices.add(oscillator);
    oscillator.start(); oscillator.stop(context.currentTime + .7);
    oscillator.onended = () => { this.voices.delete(oscillator); oscillator.disconnect(); gain.disconnect(); };
  }
  private cancel(): void {
    for (const voice of this.voices) { try { voice.stop(); } catch { /* Already ended. */ } }
    this.voices.clear();
  }
  suspend(): void { this.cancel(); void this.context?.suspend().catch(() => {}); }
  dispose(): void { this.cancel(); void this.context?.close().catch(() => {}); }
}
