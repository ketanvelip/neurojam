import * as Tone from 'tone';

export interface BeatEvent {
    beat: number;
    time: number;
}

type BeatCallback = (beat: BeatEvent) => void;

export class AudioEngine {
    private bpm: number;
    private isPlaying: boolean = false;
    private callbacks: Set<BeatCallback> = new Set();
    private beatCount: number = 0;

    constructor(bpm: number = 120) {
        this.bpm = bpm;
        Tone.Transport.bpm.value = this.bpm;
    }

    public async initialize() {
        await Tone.start();
        console.log('Audio Engine Initialized');

        // Create a simple synth for the metronome (optional, can be muted)
        const synth = new Tone.MembraneSynth().toDestination();

        new Tone.Loop((time) => {
            // Trigger callback for game loop
            const beatEvent = { beat: this.beatCount, time };
            this.callbacks.forEach(cb => cb(beatEvent));

            // Play a sound on every beat for testing
            synth.triggerAttackRelease("C2", "8n", time);

            this.beatCount++;
        }, "4n").start(0);
    }

    public start() {
        if (this.isPlaying) return;
        Tone.Transport.start();
        this.isPlaying = true;
    }

    public stop() {
        if (!this.isPlaying) return;
        Tone.Transport.stop();
        this.isPlaying = false;
        this.beatCount = 0;
    }

    public onBeat(callback: BeatCallback): () => void {
        this.callbacks.add(callback);
        return () => { this.callbacks.delete(callback); };
    }

    public getBPM() {
        return this.bpm;
    }
}

export const audioEngine = new AudioEngine(100); // Default 100 BPM
