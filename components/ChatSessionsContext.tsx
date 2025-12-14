'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useChatSessions, GroupedSessions } from '@/hooks/useChatSessions';
import { ChatSession, ChatMessage } from '@/types';

interface ChatSessionsContextType {
    sessions: ChatSession[];
    activeSession: ChatSession | null;
    activeSessionId: string | null;
    isLoading: boolean;
    createSession: () => ChatSession;
    addSession: (session: ChatSession) => void;
    updateSession: (sessionId: string, messages: ChatMessage[]) => void;
    deleteSession: (sessionId: string) => void;
    setActiveSession: (sessionId: string | null) => void;
    groupedSessions: GroupedSessions;
}

const ChatSessionsContext = createContext<ChatSessionsContextType | undefined>(undefined);

export function ChatSessionsProvider({ children }: { children: ReactNode }) {
    const chatSessionsState = useChatSessions();

    return (
        <ChatSessionsContext.Provider value={chatSessionsState}>
            {children}
        </ChatSessionsContext.Provider>
    );
}

export function useChatSessionsContext() {
    const context = useContext(ChatSessionsContext);
    if (context === undefined) {
        throw new Error('useChatSessionsContext must be used within a ChatSessionsProvider');
    }
    return context;
}
