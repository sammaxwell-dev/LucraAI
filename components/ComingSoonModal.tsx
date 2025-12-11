'use client';

import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Orb } from '@/components/Orb';

interface ComingSoonModalProps {
    isOpen: boolean;
    onClose: () => void;
    featureName?: string;
}

export const ComingSoonModal = ({ isOpen, onClose, featureName = "This feature" }: ComingSoonModalProps) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`
                relative w-full max-w-md bg-[#080808] border border-white/10 rounded-2xl overflow-hidden
                shadow-2xl shadow-black/50 transform transition-all duration-500 ease-out
                ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}
            `}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-full transition-all duration-200"
                >
                    <X size={18} />
                </button>

                {/* Orb Container */}
                <div className="relative h-64 w-full flex items-center justify-center bg-gradient-to-b from-black/0 via-black/0 to-[#080808]">
                    <div className="absolute inset-0 flex items-center justify-center scale-150 opacity-90 pointer-events-none">
                        <Orb />
                    </div>
                </div>

                {/* Content */}
                <div className="relative px-8 pb-10 text-center z-10">
                    <h2 className="text-2xl font-medium text-white mb-3 tracking-tight">Coming Soon</h2>

                    <p className="text-zinc-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
                        We are currently developing <span className="text-white font-medium">{featureName}</span> to help you manage your finances even better.
                    </p>

                    <button
                        onClick={onClose}
                        className="
                            px-8 py-2.5 
                            bg-transparent text-white text-sm font-medium
                            border border-white/20 rounded-full
                            hover:bg-white hover:text-black hover:border-transparent
                            transition-all duration-300
                            focus:outline-none focus:ring-2 focus:ring-white/20
                        "
                    >
                        Got it
                    </button>

                    {/* Subtle footer text or brand */}
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <span className="text-[10px] uppercase tracking-widest text-zinc-600 font-medium">Lucra AI</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
