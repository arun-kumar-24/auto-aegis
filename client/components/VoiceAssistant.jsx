'use client';

import { useState, useRef } from 'react';
import { Play, Square, MessageSquare, Loader2, Volume2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VoiceAssistant({ fileContent }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [question, setQuestion] = useState('');
    const [mode, setMode] = useState('idle'); // idle, summarizing, asking, speaking

    // Keep a ref so we can cancel speech easily
    const synthRef = useRef(null);

    // Initialize speech synthesis if available
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
    }

    const speak = (text) => {
        if (!synthRef.current) {
            toast.error("Your browser doesn't support text-to-speech.");
            return;
        }

        // Cancel any ongoing speech
        synthRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a good English voice, preferably female/assistant sounding
        const voices = synthRef.current.getVoices();
        const preferredVoice = voices.find(v => v.lang.startsWith('en-') && (v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Female')));
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }

        utterance.rate = 1.05;
        utterance.pitch = 1.1;

        utterance.onstart = () => {
            setIsPlaying(true);
            setMode('speaking');
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setMode('idle');
        };

        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e);
            setIsPlaying(false);
            setMode('idle');
            // Ignore interruption errors, log others
            if (e.error !== 'interrupted') {
                toast.error('Error playing audio.');
            }
        };

        synthRef.current.speak(utterance);
    };

    const stopSpeaking = () => {
        if (synthRef.current) {
            synthRef.current.cancel();
            setIsPlaying(false);
            setMode('idle');
        }
    };

    const handleSummarize = async () => {
        if (!fileContent) {
            toast.error('No file content to summarize.');
            return;
        }

        setIsLoading(true);
        setMode('summarizing');
        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'summarize', content: fileContent }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to summarize');

            toast.success('Summary generated. Playing...');
            speak(data.result);
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            setMode('idle');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAsk = async (e) => {
        e.preventDefault();
        if (!question.trim() || !fileContent) return;

        setIsLoading(true);
        setMode('asking');
        const currentQ = question;
        setQuestion('');

        try {
            const res = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'ask', content: fileContent, question: currentQ }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to get answer');

            speak(data.result);
        } catch (error) {
            console.error(error);
            toast.error(error.message);
            setMode('idle');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-black/40 border-b border-white/5 p-4 shrink-0 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-violet-400" />
                    <span className="text-xs font-black text-white/80 uppercase tracking-widest">Aegis Voice AI</span>
                </div>

                {/* Status Indicator */}
                {mode !== 'idle' && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full">
                        {mode === 'speaking' ? (
                            <Volume2 size={12} className="text-violet-400 animate-pulse" />
                        ) : (
                            <Loader2 size={12} className="text-violet-400 animate-spin" />
                        )}
                        <span className="text-[10px] text-violet-300 font-bold uppercase tracking-wider">
                            {mode === 'summarizing' ? 'Analyzing...' : mode === 'asking' ? 'Thinking...' : 'Speaking...'}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2 shrink-0">
                    {isPlaying ? (
                        <button
                            onClick={stopSpeaking}
                            className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-xs font-black transition-all"
                        >
                            <Square size={14} className="fill-current" /> Stop Audio
                        </button>
                    ) : (
                        <button
                            onClick={handleSummarize}
                            disabled={isLoading || !fileContent}
                            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black transition-all shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                        >
                            <Play size={14} className="fill-current" /> Read Summary
                        </button>
                    )}
                </div>

                <form onSubmit={handleAsk} className="flex-1 relative">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        disabled={isLoading || !fileContent}
                        placeholder="Ask Aegis a question about this log..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-10 py-2.5 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !question.trim() || !fileContent}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-violet-400 disabled:opacity-50 transition-colors"
                    >
                        <MessageSquare size={14} />
                    </button>
                </form>
            </div>
        </div>
    );
}
