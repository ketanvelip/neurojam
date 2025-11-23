import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { audioEngine } from '../audio/AudioEngine';

export const Bandmate: React.FC = () => {
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const unsubscribe = audioEngine.onBeat(() => {
            setScale(1.2);
            setTimeout(() => setScale(1), 100);
        });
        return unsubscribe;
    }, []);

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <motion.div
                animate={{ scale }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
                className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full shadow-lg flex items-center justify-center"
            >
                <span className="text-4xl">🤖</span>
            </motion.div>
            <h3 className="mt-4 text-xl font-bold text-white">AI Bandmate</h3>
            <p className="text-gray-400 text-sm">Grooving to 100 BPM</p>
        </div>
    );
};
