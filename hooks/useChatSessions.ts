'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ChatSession, ChatMessage } from '@/types';

const SESSIONS_STORAGE_KEY = 'lucra-ai-sessions';
const ACTIVE_SESSION_KEY = 'lucra-ai-active-session';

// Группы по дате
export interface GroupedSessions {
    today: ChatSession[];
    yesterday: ChatSession[];
    thisWeek: ChatSession[];
    older: ChatSession[];
}

export function useChatSessions() {
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Загрузка сессий из localStorage
    useEffect(() => {
        try {
            const storedSessions = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
            const storedActiveId = window.localStorage.getItem(ACTIVE_SESSION_KEY);

            if (storedSessions) {
                setSessions(JSON.parse(storedSessions));
            }
            if (storedActiveId) {
                setActiveSessionId(storedActiveId);
            }
        } catch (error) {
            console.error('Error loading sessions:', error);
        }
        setIsLoading(false);
    }, []);

    // Сохранение в localStorage при изменении
    useEffect(() => {
        if (!isLoading) {
            try {
                window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
            } catch (error) {
                console.error('Error saving sessions:', error);
            }
        }
    }, [sessions, isLoading]);

    useEffect(() => {
        if (!isLoading && activeSessionId) {
            try {
                window.localStorage.setItem(ACTIVE_SESSION_KEY, activeSessionId);
            } catch (error) {
                console.error('Error saving active session:', error);
            }
        }
    }, [activeSessionId, isLoading]);

    // Создание новой сессии (НЕ сохраняет в историю - сессия сохранится только при первом сообщении)
    const createSession = useCallback((): ChatSession => {
        const newSession: ChatSession = {
            id: crypto.randomUUID(),
            title: 'New Chat',
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        // Только устанавливаем активную сессию, но НЕ добавляем в массив
        // Сессия добавится через updateSession при первом сообщении
        setActiveSessionId(newSession.id);

        return newSession;
    }, []);

    // Добавление новой сессии в массив (вызывается при первом сообщении)
    const addSession = useCallback((session: ChatSession) => {
        setSessions(prev => {
            // Проверяем, нет ли уже такой сессии
            if (prev.some(s => s.id === session.id)) {
                return prev;
            }
            return [session, ...prev];
        });
    }, []);

    // Обновление сессии (добавление сообщений)
    // Если сессия не существует в массиве, она будет добавлена автоматически
    const updateSession = useCallback((sessionId: string, messages: ChatMessage[]) => {
        setSessions(prev => {
            const existingSession = prev.find(s => s.id === sessionId);

            // Генерируем название из первого сообщения пользователя
            let title = 'New Chat';
            if (messages.length > 0) {
                const firstUserMessage = messages.find(m => m.role === 'user');
                if (firstUserMessage) {
                    title = firstUserMessage.text.slice(0, 50);
                    if (firstUserMessage.text.length > 50) {
                        title += '...';
                    }
                }
            }

            if (!existingSession) {
                // Сессия не существует - создаём новую и добавляем в начало
                const newSession: ChatSession = {
                    id: sessionId,
                    title,
                    messages,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                };
                return [newSession, ...prev];
            }

            // Обновляем существующую сессию
            return prev.map(session => {
                if (session.id === sessionId) {
                    return {
                        ...session,
                        title: session.title === 'New Chat' ? title : session.title,
                        messages,
                        updatedAt: Date.now(),
                    };
                }
                return session;
            });
        });
    }, []);

    // Удаление сессии
    const deleteSession = useCallback((sessionId: string) => {
        setSessions(prev => {
            const filtered = prev.filter(s => s.id !== sessionId);

            // Если удаляем активную сессию, переключаемся на первую из оставшихся
            if (sessionId === activeSessionId) {
                const nextActive = filtered[0]?.id || null;
                setActiveSessionId(nextActive);
                if (nextActive) {
                    window.localStorage.setItem(ACTIVE_SESSION_KEY, nextActive);
                } else {
                    window.localStorage.removeItem(ACTIVE_SESSION_KEY);
                }
            }

            return filtered;
        });
    }, [activeSessionId]);

    // Установка активной сессии
    const setActiveSession = useCallback((sessionId: string | null) => {
        setActiveSessionId(sessionId);
        if (sessionId) {
            window.localStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
        } else {
            window.localStorage.removeItem(ACTIVE_SESSION_KEY);
        }
    }, []);

    // Получение активной сессии
    const activeSession = useMemo(() => {
        return sessions.find(s => s.id === activeSessionId) || null;
    }, [sessions, activeSessionId]);

    // Группировка сессий по дате
    const groupedSessions = useMemo((): GroupedSessions => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const yesterday = today - 24 * 60 * 60 * 1000;
        const weekAgo = today - 7 * 24 * 60 * 60 * 1000;

        const groups: GroupedSessions = {
            today: [],
            yesterday: [],
            thisWeek: [],
            older: [],
        };

        // Сортируем по дате обновления (новые сверху)
        const sorted = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

        sorted.forEach(session => {
            const sessionDate = session.updatedAt;

            if (sessionDate >= today) {
                groups.today.push(session);
            } else if (sessionDate >= yesterday) {
                groups.yesterday.push(session);
            } else if (sessionDate >= weekAgo) {
                groups.thisWeek.push(session);
            } else {
                groups.older.push(session);
            }
        });

        return groups;
    }, [sessions]);

    return {
        sessions,
        activeSession,
        activeSessionId,
        isLoading,
        createSession,
        addSession,
        updateSession,
        deleteSession,
        setActiveSession,
        groupedSessions,
    };
}
