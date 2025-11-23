import React, { useEffect, useState } from 'react';
import { useGameStore } from '../game/store';
import { audioEngine } from '../audio/AudioEngine';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import * as Tone from 'tone';

export const CodeEditor: React.FC = () => {
    const { currentCode, targetCode, updateCurrentCode, addScore, incrementStreak, resetStreak, nextLevel, isLoading } = useGameStore();
    const [lastBeatTime, setLastBeatTime] = useState(0);
    const [feedback, setFeedback] = useState<'perfect' | 'good' | 'miss' | null>(null);

    // Tolerance window in seconds (e.g., +/- 0.1s)
    const HIT_WINDOW = 0.15;

    useEffect(() => {
        // Subscribe to beats to track timing
        const unsubscribe = audioEngine.onBeat(({ time }) => {
            setLastBeatTime(time); // Use the time from the event
        });
        return unsubscribe;
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (isLoading) return; // Prevent input while loading

        const newVal = e.target.value;

        // Allow backspace/deletion
        if (newVal.length < currentCode.length) {
            updateCurrentCode(newVal);
            return;
        }

        // Validate against target code
        if (!targetCode.startsWith(newVal)) {
            setFeedback('miss');
            resetStreak();
            // Block incorrect input
            return;
        }

        // Only process rhythm for added characters
        if (newVal.length > currentCode.length) {
            const now = Tone.now();
            const timeSinceBeat = now - lastBeatTime;
            const beatDuration = 60 / audioEngine.getBPM();
            const timeToNextBeat = beatDuration - timeSinceBeat;

            const diff = Math.min(timeSinceBeat, timeToNextBeat);

            if (diff < HIT_WINDOW) {
                setFeedback('perfect');
                addScore(100);
                incrementStreak();
            } else {
                setFeedback('miss');
                resetStreak();
            }

            // Clear feedback after a short delay
            setTimeout(() => setFeedback(null), 500);
        }

        updateCurrentCode(newVal);

        // Check for completion
        if (newVal === targetCode) {
            nextLevel();
            setFeedback('perfect');
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto p-4">
            <div className="mb-4 p-4 bg-gray-800 rounded-lg font-mono text-green-400 text-lg opacity-80 select-none min-h-[3.5rem] flex items-center">
                {isLoading ? (
                    <span className="animate-pulse text-purple-400">AI Bandmate is jamming... 🎵</span>
                ) : (
                    targetCode
                )}
            </div>

            <div className="relative">
                <textarea
                    value={currentCode}
                    onChange={handleInput}
                    disabled={isLoading}
                    className={clsx(
                        "w-full h-32 bg-gray-900 text-white font-mono text-lg p-4 rounded-lg border-2 border-gray-700 focus:outline-none resize-none transition-colors",
                        isLoading ? "opacity-50 cursor-not-allowed border-gray-800" : "focus:border-purple-500"
                    )}
                    placeholder={isLoading ? "Wait for the drop..." : "Type to the beat..."}
                    autoFocus
                />

                <AnimatePresence>
                    {feedback && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.5 }}
                            animate={{ opacity: 1, y: 0, scale: 1.2 }}
                            exit={{ opacity: 0 }}
                            className={clsx(
                                "absolute top-0 right-0 m-2 px-2 py-1 rounded font-bold text-sm pointer-events-none",
                                feedback === 'perfect' ? "bg-green-500 text-white" : "bg-red-500 text-white"
                            )}
                        >
                            {feedback.toUpperCase()}!
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};


