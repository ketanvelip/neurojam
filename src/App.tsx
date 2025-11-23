import { useState } from 'react';
import { Play, Square } from 'lucide-react';
import { CodeEditor } from './components/CodeEditor';
import { Bandmate } from './components/Bandmate';
import { audioEngine } from './audio/AudioEngine';
import { useGameStore } from './game/store';

function App() {
    const [isStarted, setIsStarted] = useState(false);
    const { score, streak, setApiKey, apiKey } = useGameStore();
    const [inputKey, setInputKey] = useState('');

    const handleStart = async () => {
        if (!apiKey && !inputKey) {
            alert("Please enter a Gemini API Key to jam with AI!");
            return;
        }
        if (inputKey) {
            setApiKey(inputKey);
        }

        await audioEngine.initialize();
        audioEngine.start();
        setIsStarted(true);
    };

    const handleStop = () => {
        audioEngine.stop();
        setIsStarted(false);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center font-sans">
            <header className="absolute top-0 w-full p-6 flex justify-between items-center">
                <h1 className="text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    NEUROJAM
                </h1>
                <div className="flex gap-6">
                    <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-widest">Score</div>
                        <div className="text-2xl font-bold font-mono">{score}</div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase tracking-widest">Streak</div>
                        <div className="text-2xl font-bold font-mono text-yellow-400">{streak}</div>
                    </div>
                </div>
            </header>

            <main className="w-full max-w-4xl flex flex-col items-center gap-8">
                {!isStarted ? (
                    <div className="flex flex-col items-center gap-4">
                        <input
                            type="password"
                            placeholder="Enter Gemini API Key"
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            className="px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white w-64 focus:border-purple-500 outline-none"
                        />
                        <button
                            onClick={handleStart}
                            className="group relative px-8 py-4 bg-white text-black font-bold text-xl rounded-full hover:scale-105 transition-transform"
                        >
                            <div className="absolute inset-0 bg-purple-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity" />
                            <span className="flex items-center gap-2">
                                <Play size={24} fill="currentColor" /> Start Jamming
                            </span>
                        </button>
                        <p className="text-xs text-gray-500">Get a key from Google AI Studio</p>
                    </div>
                ) : (
                    <>
                        <Bandmate />
                        <CodeEditor />
                        <button
                            onClick={handleStop}
                            className="mt-8 text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <Square size={16} fill="currentColor" /> Stop
                        </button>
                    </>
                )}
            </main>
        </div>
    );
}

export default App;
