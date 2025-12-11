'use client';

import { useEffect, useState } from 'react';
import {
    Home,
    FileText,
    Landmark,
    Users,
    History,
    Search,
    Command,
    MoreHorizontal,
    Triangle,
    X
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    onCloseMobile?: () => void;
}

const NavItem = ({ icon: Icon, label, active = false }: { icon: React.ElementType, label: string, active?: boolean }) => (
    <div className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group
        ${active ? 'bg-surfaceHighlight text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}
    `}>
        <Icon size={18} strokeWidth={2} className={active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'} />
        <span className="text-sm font-medium whitespace-nowrap opacity-100 transition-opacity duration-200">{label}</span>
    </div>
);

const HistoryEntry = ({ text }: { text: string }) => (
    <div className="px-3 py-2 text-sm text-zinc-400 hover:text-zinc-200 cursor-pointer truncate transition-colors">
        {text}
    </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onCloseMobile }) => {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Desktop: collapse width to 0. Mobile: translate off-screen
    const sidebarClasses = isMobile
        ? `fixed inset-y-0 left-0 z-50 w-[280px] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        : `relative h-full transition-[width,opacity] duration-300 ease-in-out border-r border-white/5 flex flex-col shrink-0 overflow-hidden ${isOpen ? 'w-[280px] opacity-100' : 'w-0 opacity-0 border-r-0'}`;

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
                    onClick={onCloseMobile}
                />
            )}

            <div className={`${sidebarClasses} bg-[#050505] flex flex-col`}>
                {/* Subtle Gradient Shine on Left Edge */}
                <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-transparent via-white/10 to-transparent opacity-50"></div>

                {/* Logo & Close Button for Mobile */}
                <div className="p-6 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white">
                        <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center text-black">
                            <Triangle size={14} fill="black" className="rotate-180" />
                        </div>
                        <span className="text-xl font-bold tracking-tight whitespace-nowrap">Lucra AI</span>
                    </div>
                    {isMobile && (
                        <button onClick={onCloseMobile} className="p-1 text-zinc-400 hover:text-white">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Search Bar - Hide when width is 0 to avoid visual glitches if not fully handled */}
                <div className="px-6 mb-6">
                    <div className="relative group w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-zinc-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search chats"
                            className="w-full bg-[#121212] border border-white/5 text-zinc-300 text-sm rounded-lg pl-9 pr-8 py-2.5 focus:outline-none focus:border-white/10 placeholder:text-zinc-600 transition-all min-w-[200px]"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 border border-zinc-700 rounded text-[10px] text-zinc-500">
                            <Command size={10} />
                        </div>
                    </div>
                </div>

                {/* Main Navigation - Skatteverket Adapted */}
                <div className="px-3 space-y-1">
                    <NavItem icon={Home} label="Home" active />
                    <NavItem icon={FileText} label="Income Tax" />
                    <NavItem icon={Landmark} label="Tax Account" />
                    <NavItem icon={Users} label="Population Reg" />
                    <NavItem icon={History} label="History" />
                </div>

                {/* History Section */}
                <div className="mt-8 px-3 flex-1 overflow-y-auto">
                    <div className="mb-6">
                        <h3 className="px-3 text-sm font-semibold text-zinc-300 mb-2 uppercase tracking-wide whitespace-nowrap">Tomorrow</h3>
                        <div className="space-y-0.5">
                            <HistoryEntry text="How to deduct travel expenses?" />
                            <HistoryEntry text="Tax return deadline 2025" />
                            <HistoryEntry text="Registering a new company" />
                        </div>
                    </div>

                    <div>
                        <h3 className="px-3 text-sm font-semibold text-zinc-300 mb-2 uppercase tracking-wide whitespace-nowrap">10 days Ago</h3>
                        <div className="space-y-0.5">
                            <HistoryEntry text="Rot and Rut deduction limits" />
                            <HistoryEntry text="Selling property tax rules" />
                            <HistoryEntry text="Change of address notification" />
                        </div>
                    </div>
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-white/5 min-w-[280px]">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                            <img
                                src="https://picsum.photos/100/100"
                                alt="User"
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">Shamil Musaev</p>
                            <p className="text-xs text-zinc-500">Private</p>
                        </div>
                        <MoreHorizontal size={16} className="text-zinc-500" />
                    </div>
                </div>
            </div>
        </>
    );
};