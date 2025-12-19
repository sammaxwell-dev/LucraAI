'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    Plus,
    History,
    Search,
    Command,
    MoreHorizontal,
    Triangle,
    X,
    Trash2,
    FileText,
    Calculator,
    Calendar,
    FileBarChart
} from 'lucide-react';
import { ComingSoonModal } from './ComingSoonModal';
import { ChatSession } from '@/types';
import { GroupedSessions } from '@/hooks/useChatSessions';

interface SidebarProps {
    isOpen: boolean;
    onCloseMobile?: () => void;
    sessions: ChatSession[];
    activeSessionId: string | null;
    groupedSessions: GroupedSessions;
    onNewChat: () => void;
    onSelectSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
    userName: string;
    documentCount?: number;
}

const NavItem = ({ icon: Icon, label, active = false, badge, onClick }: { icon: React.ElementType, label: string, active?: boolean, badge?: number, onClick?: () => void }) => (
    <div
        onClick={onClick}
        className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group
        ${active ? 'bg-surfaceHighlight text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}
    `}>
        <Icon size={18} strokeWidth={2} className={active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'} />
        <span className="text-sm font-medium whitespace-nowrap opacity-100 transition-opacity duration-200">{label}</span>
        {badge !== undefined && badge > 0 && (
            <span className="ml-auto px-1.5 py-0.5 text-xs font-medium bg-white/10 text-zinc-400 rounded">
                {badge}
            </span>
        )}
    </div>
);

interface SessionItemProps {
    session: ChatSession;
    isActive: boolean;
    onSelect: () => void;
    onDelete: () => void;
}

const SessionItem: React.FC<SessionItemProps> = ({ session, isActive, onSelect, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Закрытие меню при клике вне
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };

        if (showMenu) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showMenu]);

    return (
        <div
            className={`group relative flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors
                ${isActive ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'}
            `}
            onClick={onSelect}
        >
            <span className="text-sm truncate flex-1 pr-6">{session.title}</span>

            {/* Контекстное меню (три точки) */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                }}
                className={`absolute right-2 p-1 rounded transition-opacity
                    ${showMenu ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                    hover:bg-white/10
                `}
            >
                <MoreHorizontal size={14} className="text-zinc-400" />
            </button>

            {/* Dropdown меню */}
            {showMenu && (
                <div
                    ref={menuRef}
                    className="absolute right-0 top-full mt-1 z-50 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-1 min-w-[120px]"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => {
                            onDelete();
                            setShowMenu(false);
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <Trash2 size={14} />
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
};

interface SessionGroupProps {
    title: string;
    sessions: ChatSession[];
    activeSessionId: string | null;
    onSelectSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
}

const SessionGroup: React.FC<SessionGroupProps> = ({
    title,
    sessions,
    activeSessionId,
    onSelectSession,
    onDeleteSession
}) => {
    if (sessions.length === 0) return null;

    return (
        <div className="mb-6">
            <h3 className="px-3 text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">
                {title}
            </h3>
            <div className="space-y-0.5">
                {sessions.map(session => (
                    <SessionItem
                        key={session.id}
                        session={session}
                        isActive={session.id === activeSessionId}
                        onSelect={() => onSelectSession(session.id)}
                        onDelete={() => onDeleteSession(session.id)}
                    />
                ))}
            </div>
        </div>
    );
};

export const Sidebar: React.FC<SidebarProps> = ({
    isOpen,
    onCloseMobile,
    sessions,
    activeSessionId,
    groupedSessions,
    onNewChat,
    onSelectSession,
    onDeleteSession,
    userName,
    documentCount = 0
}) => {
    const [isMobile, setIsMobile] = useState(false);
    const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);
    const [comingSoonFeature, setComingSoonFeature] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // lg breakpoint
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const openComingSoon = (feature: string) => {
        setComingSoonFeature(feature);
        setIsComingSoonOpen(true);
        if (isMobile && onCloseMobile) {
            onCloseMobile();
        }
    };

    // Фильтрация сессий по поисковому запросу
    const filteredGroups = searchQuery.trim() ? {
        today: groupedSessions.today.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())),
        yesterday: groupedSessions.yesterday.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())),
        thisWeek: groupedSessions.thisWeek.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())),
        older: groupedSessions.older.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())),
    } : groupedSessions;

    // Desktop: collapse width to 0. Mobile: translate off-screen
    const sidebarClasses = isMobile
        ? `fixed inset-y-0 left-0 z-50 w-[280px] max-w-[85vw] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        : `relative h-full transition-[width,opacity] duration-300 ease-in-out border-r border-white/5 flex flex-col shrink-0 overflow-hidden ${isOpen ? 'w-[280px] opacity-100' : 'w-0 opacity-0 border-r-0'}`;

    return (
        <>
            <ComingSoonModal
                isOpen={isComingSoonOpen}
                onClose={() => setIsComingSoonOpen(false)}
                featureName={comingSoonFeature}
            />

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
                        <span className="text-xl font-bold tracking-tight whitespace-nowrap">Saldo AI</span>
                    </div>
                    {isMobile && (
                        <button onClick={onCloseMobile} className="p-1 text-zinc-400 hover:text-white">
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Search Bar */}
                <div className="px-6 mb-6">
                    <div className="relative group w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-zinc-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search chats"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#121212] border border-white/5 text-zinc-300 text-sm rounded-lg pl-9 pr-8 py-2.5 focus:outline-none focus:border-white/10 placeholder:text-zinc-600 transition-all min-w-[200px]"
                        />

                    </div>
                </div>

                {/* Main Navigation */}
                <div className="px-3 space-y-1">
                    <NavItem
                        icon={Plus}
                        label="New Chat"
                        onClick={() => {
                            onNewChat();
                            if (isMobile && onCloseMobile) onCloseMobile();
                        }}
                    />
                    <NavItem
                        icon={History}
                        label="History"
                        onClick={() => {
                            window.location.href = '/history';
                        }}
                    />
                    <NavItem
                        icon={FileText}
                        label="Documents"
                        badge={documentCount}
                        onClick={() => {
                            window.location.href = '/documents';
                        }}
                    />
                    <NavItem
                        icon={Calculator}
                        label="Calculator"
                        onClick={() => {
                            window.location.href = '/calculator';
                        }}
                    />
                    <NavItem
                        icon={Calendar}
                        label="Deadlines"
                        onClick={() => {
                            window.location.href = '/deadlines';
                        }}
                    />
                    <NavItem
                        icon={FileBarChart}
                        label="Reports"
                        onClick={() => {
                            window.location.href = '/reports';
                        }}
                    />
                </div>

                {/* Sessions List */}
                <div className="mt-6 px-3 flex-1 overflow-y-auto">
                    <SessionGroup
                        title="Today"
                        sessions={filteredGroups.today}
                        activeSessionId={activeSessionId}
                        onSelectSession={(id) => {
                            onSelectSession(id);
                            if (isMobile && onCloseMobile) onCloseMobile();
                        }}
                        onDeleteSession={onDeleteSession}
                    />
                    <SessionGroup
                        title="Yesterday"
                        sessions={filteredGroups.yesterday}
                        activeSessionId={activeSessionId}
                        onSelectSession={(id) => {
                            onSelectSession(id);
                            if (isMobile && onCloseMobile) onCloseMobile();
                        }}
                        onDeleteSession={onDeleteSession}
                    />
                    <SessionGroup
                        title="This Week"
                        sessions={filteredGroups.thisWeek}
                        activeSessionId={activeSessionId}
                        onSelectSession={(id) => {
                            onSelectSession(id);
                            if (isMobile && onCloseMobile) onCloseMobile();
                        }}
                        onDeleteSession={onDeleteSession}
                    />
                    <SessionGroup
                        title="Earlier"
                        sessions={filteredGroups.older}
                        activeSessionId={activeSessionId}
                        onSelectSession={(id) => {
                            onSelectSession(id);
                            if (isMobile && onCloseMobile) onCloseMobile();
                        }}
                        onDeleteSession={onDeleteSession}
                    />

                    {/* Empty State */}
                    {sessions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                                <History size={20} className="text-zinc-500" />
                            </div>
                            <p className="text-zinc-500 text-sm">No chats yet</p>
                            <p className="text-zinc-600 text-xs mt-1">Start a new conversation</p>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div className="p-4 border-t border-white/5 min-w-[280px]">
                    <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors group">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                                {userName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">{userName}</p>
                            <p className="text-xs text-zinc-500">Private</p>
                        </div>
                        <MoreHorizontal size={16} className="text-zinc-500" />
                    </div>
                </div>
            </div>
        </>
    );
};