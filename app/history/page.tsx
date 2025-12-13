'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useUser } from '@/hooks/useUser';
import {
    ArrowLeft,
    MessageSquare,
    Clock,
    Search,
    Trash2,
    Calendar
} from 'lucide-react';
import { ChatSession } from '@/types';

export default function HistoryPage() {
    const router = useRouter();
    const { user, isLoading: isUserLoading } = useUser();
    const {
        sessions,
        groupedSessions,
        isLoading: isSessionsLoading,
        setActiveSession,
        deleteSession
    } = useChatSessions();
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || isSessionsLoading) {
        return (
            <div className="flex h-screen w-full bg-[#050505] items-center justify-center">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    const filteredSessions = searchQuery.trim()
        ? sessions.filter(s =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : sessions;

    const handleOpenChat = (sessionId: string) => {
        setActiveSession(sessionId);
        router.push('/');
    };

    const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this chat?')) {
            deleteSession(sessionId);
        }
    };

    const formatDate = (timestamp: number) => {
        try {
            const date = new Date(timestamp);
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(date);
        } catch {
            return 'Unknown date';
        }
    };

    const getPreview = (session: ChatSession) => {
        const firstUserMessage = session.messages.find(m => m.role === 'user');
        if (!firstUserMessage) return 'No messages yet';
        return firstUserMessage.text.slice(0, 100) + (firstUserMessage.text.length > 100 ? '...' : '');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Background Effects */}
            <div className="fixed top-[-20%] left-[30%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#050505]/80 border-b border-white/5">
                <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/')}
                                className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Chat History</h1>
                                <p className="text-sm text-zinc-400 mt-1">
                                    {filteredSessions.length} conversation{filteredSessions.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mt-6">
                        <div className="relative group max-w-2xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-hover:text-zinc-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0F0F10] border border-white/10 text-zinc-300 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:border-white/20 focus:shadow-glow placeholder:text-zinc-600 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                {filteredSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <MessageSquare size={28} className="text-zinc-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-300 mb-2">
                            {searchQuery ? 'No results found' : 'No conversations yet'}
                        </h2>
                        <p className="text-zinc-500 max-w-md">
                            {searchQuery
                                ? 'Try adjusting your search terms'
                                : 'Start a new chat to see it appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Group: Today */}
                        {groupedSessions.today.length > 0 && !searchQuery && (
                            <SessionGroup
                                title="Today"
                                sessions={groupedSessions.today}
                                onOpen={handleOpenChat}
                                onDelete={handleDeleteSession}
                                formatDate={formatDate}
                                getPreview={getPreview}
                            />
                        )}

                        {/* Group: Yesterday */}
                        {groupedSessions.yesterday.length > 0 && !searchQuery && (
                            <SessionGroup
                                title="Yesterday"
                                sessions={groupedSessions.yesterday}
                                onOpen={handleOpenChat}
                                onDelete={handleDeleteSession}
                                formatDate={formatDate}
                                getPreview={getPreview}
                            />
                        )}

                        {/* Group: This Week */}
                        {groupedSessions.thisWeek.length > 0 && !searchQuery && (
                            <SessionGroup
                                title="This Week"
                                sessions={groupedSessions.thisWeek}
                                onOpen={handleOpenChat}
                                onDelete={handleDeleteSession}
                                formatDate={formatDate}
                                getPreview={getPreview}
                            />
                        )}

                        {/* Group: Earlier */}
                        {groupedSessions.older.length > 0 && !searchQuery && (
                            <SessionGroup
                                title="Earlier"
                                sessions={groupedSessions.older}
                                onOpen={handleOpenChat}
                                onDelete={handleDeleteSession}
                                formatDate={formatDate}
                                getPreview={getPreview}
                            />
                        )}

                        {/* Search Results (ungrouped) */}
                        {searchQuery && (
                            <div className="space-y-3">
                                {filteredSessions.map(session => (
                                    <ChatCard
                                        key={session.id}
                                        session={session}
                                        onOpen={() => handleOpenChat(session.id)}
                                        onDelete={(e) => handleDeleteSession(session.id, e)}
                                        formatDate={formatDate}
                                        getPreview={getPreview}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

interface SessionGroupProps {
    title: string;
    sessions: ChatSession[];
    onOpen: (id: string) => void;
    onDelete: (id: string, e: React.MouseEvent) => void;
    formatDate: (timestamp: number) => string;
    getPreview: (session: ChatSession) => string;
}

function SessionGroup({ title, sessions, onOpen, onDelete, formatDate, getPreview }: SessionGroupProps) {
    return (
        <div>
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Calendar size={14} />
                {title}
            </h2>
            <div className="space-y-3">
                {sessions.map(session => (
                    <ChatCard
                        key={session.id}
                        session={session}
                        onOpen={() => onOpen(session.id)}
                        onDelete={(e) => onDelete(session.id, e)}
                        formatDate={formatDate}
                        getPreview={getPreview}
                    />
                ))}
            </div>
        </div>
    );
}

interface ChatCardProps {
    session: ChatSession;
    onOpen: () => void;
    onDelete: (e: React.MouseEvent) => void;
    formatDate: (timestamp: number) => string;
    getPreview: (session: ChatSession) => string;
}

function ChatCard({ session, onOpen, onDelete, formatDate, getPreview }: ChatCardProps) {
    return (
        <div
            onClick={onOpen}
            className="group bg-[#0F0F10] border border-white/5 rounded-xl p-4 md:p-5 hover:bg-[#141414] hover:border-white/10 transition-all cursor-pointer"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg font-semibold text-zinc-100 mb-2 truncate group-hover:text-white transition-colors">
                        {session.title}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-3 line-clamp-2">
                        {getPreview(session)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-zinc-500">
                        <span className="flex items-center gap-1.5">
                            <Clock size={12} />
                            {formatDate(session.updatedAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <MessageSquare size={12} />
                            {session.messages.length} message{session.messages.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
                <button
                    onClick={onDelete}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                >
                    <Trash2 size={16} />
                </button>
            </div>
        </div>
    );
}
