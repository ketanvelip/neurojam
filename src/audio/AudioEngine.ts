import * as Tone from 'tone';

export interface BeatEvent {
    beat: number;
    time: number;
}

type BeatCallback = (beat: BeatEvent) => void;

export class AudioEngine {
    private bpm: number;
    private isPlaying: boolean = false;
    private isInitialized: boolean = false;
    private callbacks: Set<BeatCallback> = new Set();
    private beatCount: number = 0;

    // Instruments
    private kick: Tone.MembraneSynth | null = null;
    private snare: Tone.NoiseSynth | null = null;
    private hihat: Tone.MetalSynth | null = null;
    private bass: Tone.MonoSynth | null = null;

    constructor(bpm: number = 100) {
        this.bpm = bpm;
        Tone.Transport.bpm.value = this.bpm;
    }

    public async initialize() {
        if (this.isInitialized) return;

        await Tone.start();
        console.log('Audio Engine Initialized');

        // Initialize Instruments
        this.kick = new Tone.MembraneSynth({
            pitchDecay: 0.05,
            octaves: 10,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: "exponential" }
        }).toDestination();

        this.snare = new Tone.NoiseSynth({
            noise: { type: "white" },
            envelope: { attack: 0.005, decay: 0.1, sustain: 0 }
        }).toDestination();

        this.hihat = new Tone.MetalSynth({
            envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
            harmonicity: 5.1,
            modulationIndex: 32,
            resonance: 4000,
            octaves: 1.5
        }).toDestination();
        this.hihat.volume.value = -20;

        this.bass = new Tone.MonoSynth({
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.1, decay: 0.3, release: 2 }
        }).toDestination();
        this.bass.volume.value = -10;

        // Game Loop (Logic) - Runs every quarter note
        new Tone.Loop((time) => {
            const beatEvent = { beat: this.beatCount, time };
            this.callbacks.forEach(cb => cb(beatEvent));
            this.beatCount++;
        }, "4n").start(0);

        // Music Patterns
        // Kick: 4-on-the-floor
        new Tone.Sequence((time, note) => {
            this.kick?.triggerAttackRelease(note, "8n", time);
        }, ["C2", "C2", "C2", "C2"], "4n").start(0);

        // Snare: Backbeat (2 and 4)
        new Tone.Sequence((time, note) => {
            if (note) this.snare?.triggerAttackRelease("8n", time);
        }, [null, "Hit", null, "Hit"], "4n").start(0);

        // HiHat: 16th notes
        new Tone.Sequence((time, note) => {
            if (note) this.hihat?.triggerAttackRelease("32n", time, 0.3);
        }, ["x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x", "x"], "16n").start(0);

        // Bass: Driving 8th notes
        new Tone.Sequence((time, note) => {
            this.bass?.triggerAttackRelease(note, "8n", time);
        }, ["C2", "C2", "E2", "E2", "G2", "G2", "B2", "B2"], "8n").start(0);

        this.isInitialized = true;
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

export const audioEngine = new AudioEngine(100);
