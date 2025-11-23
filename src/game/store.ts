import { create } from 'zustand';
import { GeminiService } from '../ai/GeminiService';

interface GameState {
    score: number;
    streak: number;
    health: number;
    isPlaying: boolean;
    currentCode: string;
    targetCode: string;
    levelIndex: number;
    apiKey: string | null;
    geminiService: GeminiService | null;
    isLoading: boolean;

    // Actions
    addScore: (points: number) => void;
    resetStreak: () => void;
    incrementStreak: () => void;
    setPlaying: (isPlaying: boolean) => void;
    setTargetCode: (code: string) => void;
    updateCurrentCode: (code: string) => void;
    nextLevel: () => Promise<void>;
    setApiKey: (key: string) => void;
}

const INITIAL_LEVELS = [
    'console.log("Hello World");',
    'function add(a, b) { return a + b; }',
];

export const useGameStore = create<GameState>((set, get) => ({
    score: 0,
    streak: 0,
    health: 100,
    isPlaying: false,
    currentCode: '',
    targetCode: INITIAL_LEVELS[0],
    levelIndex: 0,
    apiKey: null,
    geminiService: null,
    isLoading: false,

    addScore: (points) => set((state) => ({ score: state.score + points })),
    resetStreak: () => set({ streak: 0 }),
    incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
    setPlaying: (isPlaying) => set({ isPlaying }),
    setTargetCode: (code) => set({ targetCode: code, currentCode: '' }),
    updateCurrentCode: (code) => set({ currentCode: code }),

    setApiKey: (key) => set({
        apiKey: key,
        geminiService: new GeminiService(key)
    }),

    nextLevel: async () => {
        set({ isLoading: true });
        const state = get();
        const { levelIndex, geminiService, targetCode } = state;

        let nextCode = '';

        if (geminiService) {
            // Use AI to generate next line
            nextCode = await geminiService.generateNextLine(targetCode);
        } else {
            // Fallback to mock levels
            const nextIndex = (levelIndex + 1) % INITIAL_LEVELS.length;
            nextCode = INITIAL_LEVELS[nextIndex];
        }

        set((state) => ({
            levelIndex: state.levelIndex + 1,
            targetCode: nextCode,
            currentCode: '',
            score: state.score + 500,
            isLoading: false
        }));
    },
}));
