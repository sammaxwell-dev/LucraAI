'use client';

import { Sidebar } from '@/components/Sidebar';
import { SidebarProvider, useSidebar } from '@/components/SidebarContext';
import { ChatSessionsProvider, useChatSessionsContext } from '@/components/ChatSessionsContext';
import { useUser } from '@/hooks/useUser';
import { useDocuments } from '@/hooks/useDocuments';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

function AppShellContent({ children }: { children: React.ReactNode }) {
    const { isOpen, closeMobile } = useSidebar();
    const router = useRouter();

    // Use shared context for chat sessions
    const { user } = useUser();
    const { documents } = useDocuments();
    const {
        sessions,
        activeSessionId,
        groupedSessions,
        createSession,
        setActiveSession,
        deleteSession
    } = useChatSessionsContext();

    const handleNewChat = useCallback(() => {
        createSession();
        router.push('/');
    }, [createSession, router]);

    const handleSelectSession = useCallback((sessionId: string) => {
        setActiveSession(sessionId);
        router.push('/');
    }, [setActiveSession, router]);

    const handleDeleteSession = useCallback((sessionId: string) => {
        deleteSession(sessionId);
    }, [deleteSession]);

    return (
        <div className="flex h-[100dvh] w-full bg-[#050505] overflow-hidden font-sans selection:bg-white/20">
            {user && (
                <Sidebar
                    isOpen={isOpen}
                    onCloseMobile={closeMobile}
                    sessions={sessions}
                    activeSessionId={activeSessionId}
                    groupedSessions={groupedSessions}
                    onNewChat={handleNewChat}
                    onSelectSession={handleSelectSession}
                    onDeleteSession={handleDeleteSession}
                    userName={user.name}
                    documentCount={documents.length}
                />
            )}

            <main className={`flex-1 flex flex-col relative min-w-0 transition-all duration-300 w-full`}>
                {children}
            </main>
        </div>
    );
}

export function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <ChatSessionsProvider>
                <AppShellContent>{children}</AppShellContent>
            </ChatSessionsProvider>
        </SidebarProvider>
    );
}
