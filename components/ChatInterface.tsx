'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Orb } from '@/components/Orb';
import { SuggestionCard } from '@/components/SuggestionCard';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import {
    ChevronDown,
    MoreHorizontal,
    Paperclip,
    Calculator,
    FileText,
    AudioWaveform,
    Send,
    Bot,
    User,
    Menu,
    Search
} from 'lucide-react';
import { ChatMessage, ModelStatus, QuickMessage } from '@/types';
import ReactMarkdown from 'react-markdown';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import { useChatSessions } from '@/hooks/useChatSessions';
import { getRandomQuickMessages } from '@/lib/quickMessages';

export default function ChatInterface() {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<ModelStatus>(ModelStatus.IDLE);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isUpdatingFromLocalRef = useRef(false); // Флаг для предотвращения sync-циклов
    const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([]);

    // Хуки для пользователя и сессий
    const { user, isLoading: isUserLoading, setUser } = useUser();
    const {
        sessions,
        activeSession,
        activeSessionId,
        isLoading: isSessionsLoading,
        createSession,
        updateSession,
        deleteSession,
        setActiveSession,
        groupedSessions
    } = useChatSessions();

    // Локальные сообщения (синхронизируются с активной сессией)
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Синхронизация сообщений при смене активной сессии
    useEffect(() => {
        // Не синхронизируем, если обновление идёт локально (при отправке сообщения)
        if (isUpdatingFromLocalRef.current) {
            isUpdatingFromLocalRef.current = false;
            return;
        }
        if (activeSession) {
            setMessages(activeSession.messages);
        } else {
            setMessages([]);
        }
    }, [activeSession]);

    const scrollToBottom = () => {
        if (messagesEndRef.current?.parentElement) {
            const parent = messagesEndRef.current.parentElement;
            parent.scrollTo({
                top: parent.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, status]);

    // Генерация случайных быстрых сообщений при создании нового чата
    useEffect(() => {
        if (messages.length === 0) {
            setQuickMessages(getRandomQuickMessages());
        }
    }, [messages.length]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };

        // Set initial state
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Создание нового чата
    const handleNewChat = useCallback(() => {
        createSession();
        setMessages([]);
    }, [createSession]);

    // Выбор сессии
    const handleSelectSession = useCallback((sessionId: string) => {
        setActiveSession(sessionId);
    }, [setActiveSession]);

    // Удаление сессии
    const handleDeleteSession = useCallback((sessionId: string) => {
        deleteSession(sessionId);
    }, [deleteSession]);

    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || status !== ModelStatus.IDLE) return;

        // Если нет активной сессии, создаём новую
        let currentSessionId = activeSessionId;
        if (!currentSessionId) {
            isUpdatingFromLocalRef.current = true; // Предотвращаем sync при создании сессии
            const newSession = createSession();
            currentSessionId = newSession.id;
        }

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: Date.now()
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');

        // Сохраняем сообщение в сессию
        isUpdatingFromLocalRef.current = true; // Предотвращаем sync при обновлении
        updateSession(currentSessionId, newMessages);

        // Show thinking status while waiting for response
        setStatus(ModelStatus.THINKING);

        const modelMsgId = (Date.now() + 1).toString();
        // Placeholder for model response
        const messagesWithPlaceholder = [...newMessages, {
            id: modelMsgId,
            role: 'model' as const,
            text: '',
            timestamp: Date.now()
        }];
        setMessages(messagesWithPlaceholder);

        try {
            // Prepare messages history for API (include all previous messages + new user message)
            const allMessages = newMessages.map(m => ({
                role: m.role === 'model' ? 'assistant' : m.role,
                content: m.text,
            }));

            // Call the API route for streaming
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: allMessages }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });

                    // Check for status markers
                    if (chunk.includes('[STATUS:SEARCHING]')) {
                        setStatus(ModelStatus.SEARCHING);
                        // Remove marker from text
                        const cleanChunk = chunk.replace('[STATUS:SEARCHING]\n', '').replace('[STATUS:SEARCHING]', '');
                        if (cleanChunk) {
                            accumulatedText += cleanChunk;
                        }
                    } else if (chunk.includes('[STATUS:STREAMING]')) {
                        setStatus(ModelStatus.STREAMING);
                        // Remove marker from text
                        const cleanChunk = chunk.replace('[STATUS:STREAMING]\n', '').replace('[STATUS:STREAMING]', '');
                        if (cleanChunk) {
                            accumulatedText += cleanChunk;
                        }
                    } else {
                        accumulatedText += chunk;
                    }

                    // Update message with accumulated text (without markers)
                    setMessages(prev => prev.map(msg =>
                        msg.id === modelMsgId
                            ? { ...msg, text: accumulatedText }
                            : msg
                    ));
                }
            }

            // Сохраняем финальные сообщения в сессию
            setMessages(prev => {
                const finalMessages = prev.map(msg =>
                    msg.id === modelMsgId
                        ? { ...msg, text: accumulatedText }
                        : msg
                );
                isUpdatingFromLocalRef.current = true;
                updateSession(currentSessionId!, finalMessages);
                return finalMessages;
            });

            setStatus(ModelStatus.IDLE);
        } catch (error) {
            console.error(error);
            setStatus(ModelStatus.ERROR);
            setMessages(prev => {
                const errorMessages = prev.map(msg =>
                    msg.id === modelMsgId
                        ? { ...msg, text: "I'm sorry, I encountered an error. Please check your connection or API key." }
                        : msg
                );
                isUpdatingFromLocalRef.current = true;
                updateSession(currentSessionId!, errorMessages);
                return errorMessages;
            });
            setStatus(ModelStatus.IDLE);
        }
    }, [input, status, messages, activeSessionId, createSession, updateSession]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Обработчик клика на карточку подсказки
    const handleSuggestionClick = (message: string) => {
        setInput(message);
        // Небольшая задержка для визуализации
        setTimeout(() => {
            handleSendMessage();
        }, 100);
    };

    // Welcome screen handler
    const handleWelcomeComplete = (name: string) => {
        setUser(name);
    };

    // Loading state
    if (isUserLoading || isSessionsLoading) {
        return (
            <div className="flex h-[100dvh] w-full bg-[#050505] items-center justify-center">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    // Welcome screen for new users
    if (!user) {
        return <WelcomeScreen onComplete={handleWelcomeComplete} />;
    }

    // Prevent showing empty state during sync (fixes Orb animation on reload)
    const isSyncing = activeSession && activeSession.messages.length > 0 && messages.length === 0;
    const isChatEmpty = messages.length === 0 && !isSyncing;

    // Получение приветствия на основе времени суток
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="flex h-[100dvh] w-full bg-[#050505] overflow-hidden font-sans selection:bg-white/20">
            <Sidebar
                isOpen={isSidebarOpen}
                onCloseMobile={() => setIsSidebarOpen(false)}
                sessions={sessions}
                activeSessionId={activeSessionId}
                groupedSessions={groupedSessions}
                onNewChat={handleNewChat}
                onSelectSession={handleSelectSession}
                onDeleteSession={handleDeleteSession}
                userName={user.name}
            />

            {/* Main Content */}
            <main className={`flex-1 flex flex-col relative min-w-0 transition-all duration-300`}>
                {/* Background Spotlights */}
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <header className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 z-10 gap-4">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <Menu size={20} />
                    </button>

                    <button className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 bg-[#121212] text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition-colors ml-auto">
                        <MoreHorizontal size={18} />
                    </button>
                </header>

                {/* Content Container */}
                <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-3 md:px-4 pb-4 md:pb-8 z-10 overflow-hidden">

                    {/* Chat History Area (Visible when chat starts) */}
                    <LayoutGroup>
                        {!isChatEmpty && (
                            <div className="flex-1 overflow-y-auto px-1 md:pl-2 md:pr-4 mb-4 space-y-5">
                                {messages.map((msg, index) => {
                                    const isFirstModelMessage = index === messages.findIndex(m => m.role === 'model');
                                    const isLastModelMessage = msg.role === 'model' &&
                                        index === messages.map((m, i) => m.role === 'model' ? i : -1).filter(i => i !== -1).pop();

                                    return (
                                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {/* Bot Avatar */}
                                            {msg.role === 'model' && (
                                                <div className="flex shrink-0 items-start mt-0.5">
                                                    {isFirstModelMessage ? (
                                                        <Orb className="w-7 h-7 md:w-8 md:h-8" layoutId="bot-avatar" isStatic />
                                                    ) : (
                                                        <Orb className="w-7 h-7 md:w-8 md:h-8" isStatic />
                                                    )}
                                                </div>
                                            )}

                                            {/* Message Content or Status Indicator */}
                                            {msg.role === 'model' && !msg.text && status === ModelStatus.SEARCHING ? (
                                                // Show searching indicator when waiting for response
                                                <div className="flex items-center gap-2 text-zinc-400 text-sm py-2">
                                                    <Search size={14} className="animate-pulse" />
                                                    <span>Searching the web</span>
                                                    <div className="flex gap-1 ml-1">
                                                        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></div>
                                                    </div>
                                                </div>
                                            ) : msg.role === 'model' && !msg.text && (status === ModelStatus.THINKING || status === ModelStatus.STREAMING) ? (
                                                // Show typing indicator when thinking or streaming but no text yet
                                                <div className="flex items-center gap-2 text-zinc-400 text-sm py-2">
                                                    <div className="flex gap-1">
                                                        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></div>
                                                    </div>
                                                </div>
                                            ) : (
                                                // Show actual message content
                                                <div className={`
                                                    ${msg.role === 'user'
                                                        ? 'px-4 py-3 rounded-2xl max-w-[85%] md:max-w-[70%] bg-white/[0.08] text-zinc-100 rounded-tr-sm border border-white/[0.06]'
                                                        : 'max-w-full pr-2'}
                                                `}>
                                                    <div className={`
                                                        text-[15px] md:text-[16px] leading-[1.75] tracking-[-0.01em] font-normal
                                                        ${msg.role === 'user' ? 'text-zinc-100' : 'text-[#e8e8e8]'}
                                                        [&>p]:mb-4 [&>p:last-child]:mb-0
                                                        [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-4 [&>ul>li]:mb-2
                                                        [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:mb-4 [&>ol>li]:mb-2
                                                        [&>h1]:text-xl [&>h1]:font-semibold [&>h1]:mb-3 [&>h1]:mt-6 [&>h1]:text-white
                                                        [&>h2]:text-lg [&>h2]:font-semibold [&>h2]:mb-2 [&>h2]:mt-5 [&>h2]:text-white
                                                        [&>h3]:text-base [&>h3]:font-semibold [&>h3]:mb-2 [&>h3]:mt-4 [&>h3]:text-white
                                                        [&>strong]:font-semibold [&>strong]:text-white
                                                        [&_strong]:font-semibold [&_strong]:text-white
                                                        [&>code]:bg-white/10 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-sm
                                                    `}>
                                                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}



                                <div ref={messagesEndRef} />
                            </div>
                        )}

                        {/* Empty State / Welcome Screen */}
                        {isChatEmpty && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-0">
                                <div className="mb-4 md:mb-8">
                                    <Orb className="w-[100px] h-[100px] md:w-[140px] md:h-[140px]" layoutId="bot-avatar" />
                                </div>
                                <h1 className="text-2xl md:text-4xl font-medium text-zinc-100 mb-2 md:mb-3 tracking-tight">
                                    {getGreeting()}, {user.name}.
                                </h1>
                                <h2 className="text-base md:text-3xl font-medium text-zinc-400 tracking-tight">
                                    How can I assist with your taxes today?
                                </h2>
                            </div>
                        )}
                    </LayoutGroup>

                    {/* Bottom Interaction Area */}
                    <div className="w-full mt-auto">

                        {/* Input Box */}
                        <div className="relative group bg-[#0F0F10] border border-white/10 rounded-2xl transition-all duration-300 focus-within:border-white/20 focus-within:shadow-glow focus-within:bg-[#141414]">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about deductions, forms, or tax account..."
                                className="w-full bg-transparent text-zinc-200 placeholder:text-zinc-500 text-[16px] p-3 md:p-5 pb-14 md:pb-16 min-h-[100px] md:min-h-[140px] resize-none focus:outline-none rounded-2xl"
                                style={{ fontSize: '16px' }}
                            />

                            {/* Action Bar inside Input */}
                            <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-colors" title="Attach Document">
                                        <Paperclip size={18} />
                                    </button>

                                    <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors">
                                        <Calculator size={14} />
                                        Deduction Guide
                                    </button>

                                    <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-medium text-zinc-300 hover:bg-white/5 transition-colors">
                                        <FileText size={14} />
                                        Find Forms
                                    </button>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!input.trim() || status !== ModelStatus.IDLE}
                                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all
                                            ${input.trim()
                                                ? 'bg-white text-black hover:scale-105'
                                                : 'bg-white/10 text-zinc-500 border border-white/5 cursor-not-allowed'}
                                        `}
                                    >
                                        {status !== ModelStatus.IDLE ? (
                                            <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                                        ) : input.trim() ? (
                                            <Send size={20} />
                                        ) : (
                                            <AudioWaveform size={20} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Suggestion Cards (Only visible on empty state) */}
                        {isChatEmpty && quickMessages.length > 0 && (
                            <div className="mt-4 md:mt-6 -mx-2 md:mx-0">
                                <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto px-2 md:px-0 pb-2 md:pb-0 snap-x snap-mandatory scrollbar-hide">
                                    {quickMessages.map((msg, index) => (
                                        <SuggestionCard
                                            key={index}
                                            title={msg.title}
                                            description={msg.description}
                                            onClick={() => handleSuggestionClick(msg.fullMessage)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div >
    );
}
