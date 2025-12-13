'use client';

import { useState, useRef, useEffect } from 'react';
import { Orb } from './Orb';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
    onComplete: (name: string) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
    const [name, setName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Автофокус на поле ввода
        setTimeout(() => inputRef.current?.focus(), 500);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isSubmitting) return;

        setIsSubmitting(true);
        // Небольшая задержка для анимации
        setTimeout(() => {
            onComplete(name.trim());
        }, 300);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#050505] flex items-center justify-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[30%] w-[600px] h-[600px] bg-blue-900/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-[40%] left-[-10%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px] pointer-events-none" />

            <motion.div
                className="relative z-10 flex flex-col items-center text-center px-6 max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                {/* Orb Animation */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="mb-8"
                >
                    <Orb className="w-[120px] h-[120px] md:w-[160px] md:h-[160px]" />
                </motion.div>

                {/* Welcome Text */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >


                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                        Welcome to <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Lucra AI</span>
                    </h1>

                    <p className="text-zinc-400 text-base md:text-lg mb-8 max-w-md">
                        Your intelligent assistant for Swedish tax and accounting. Let's get started!
                    </p>
                </motion.div>

                {/* Name Input Form */}
                <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="w-full max-w-sm"
                >
                    <div className="relative group">
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter your name"
                            className="w-full bg-[#0F0F10] border border-white/10 text-white text-lg rounded-2xl px-5 py-4 pr-14 focus:outline-none focus:border-white/20 focus:shadow-glow placeholder:text-zinc-500 transition-all"
                            style={{ fontSize: '16px' }}
                            disabled={isSubmitting}
                        />

                        <button
                            type="submit"
                            disabled={!name.trim() || isSubmitting}
                            className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl transition-all
                                ${name.trim()
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25'
                                    : 'bg-white/10 text-zinc-500 cursor-not-allowed'}
                            `}
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <ArrowRight size={20} />
                            )}
                        </button>
                    </div>

                    <p className="text-zinc-500 text-sm mt-4">
                        Press <span className="text-zinc-400 font-medium">Enter</span> to continue
                    </p>
                </motion.form>

                {/* Bottom Glow Effect */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[100px] bg-gradient-to-t from-blue-500/10 to-transparent blur-2xl pointer-events-none" />
            </motion.div>
        </div>
    );
};
