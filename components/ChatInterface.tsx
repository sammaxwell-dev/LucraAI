'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Orb } from '@/components/Orb';
import { SuggestionCard } from '@/components/SuggestionCard';
import {
    ChevronDown,
    MoreHorizontal,
    Paperclip,
    Calculator,
    FileText,
    AudioWaveform,
    Bot,
    User,
    Menu,
    Search
} from 'lucide-react';
import { ChatMessage, ModelStatus } from '@/types';
import ReactMarkdown from 'react-markdown';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';

export default function ChatInterface() {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [status, setStatus] = useState<ModelStatus>(ModelStatus.IDLE);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    const handleSendMessage = useCallback(async () => {
        if (!input.trim() || status !== ModelStatus.IDLE) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Show searching status first (web search happens before response)
        setStatus(ModelStatus.SEARCHING);

        const modelMsgId = (Date.now() + 1).toString();
        // Placeholder for model response
        setMessages(prev => [...prev, {
            id: modelMsgId,
            role: 'model',
            text: '',
            timestamp: Date.now()
        }]);

        try {
            // Call the API route for streaming
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: userMsg.text }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            // Switch to streaming once we start receiving text
            setStatus(ModelStatus.STREAMING);

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const chunk = decoder.decode(value, { stream: true });
                    accumulatedText += chunk;
                    setMessages(prev => prev.map(msg =>
                        msg.id === modelMsgId
                            ? { ...msg, text: accumulatedText }
                            : msg
                    ));
                }
            }

            setStatus(ModelStatus.IDLE);
        } catch (error) {
            console.error(error);
            setStatus(ModelStatus.ERROR);
            setMessages(prev => prev.map(msg =>
                msg.id === modelMsgId
                    ? { ...msg, text: "I'm sorry, I encountered an error. Please check your connection or API key." }
                    : msg
            ));
            setStatus(ModelStatus.IDLE);
        }
    }, [input, status]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const isChatEmpty = messages.length === 0;

    return (
        <div className="flex h-[100dvh] w-full bg-[#050505] overflow-hidden font-sans selection:bg-white/20">
            <Sidebar
                isOpen={isSidebarOpen}
                onCloseMobile={() => setIsSidebarOpen(false)}
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

                    <button className="flex items-center gap-2 px-4 py-2 bg-[#121212] border border-white/10 rounded-lg text-sm font-medium text-zinc-300 hover:bg-[#1a1a1a] transition-colors ml-auto">
                        Skatteverket
                        <ChevronDown size={14} className="text-zinc-500" />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 bg-[#121212] text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition-colors">
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

                                            {/* Status Indicators - показываем рядом с последним сообщением модели */}
                                            {isLastModelMessage && (status === ModelStatus.THINKING || status === ModelStatus.STREAMING || status === ModelStatus.SEARCHING) && (
                                                <div className="flex items-center ml-2">
                                                    {status === ModelStatus.SEARCHING ? (
                                                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                            <Search size={16} className="animate-pulse" />
                                                            <span>Searching the web</span>
                                                            <span className="text-zinc-500 font-medium">...</span>
                                                        </div>
                                                    ) : status === ModelStatus.THINKING ? (
                                                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                                            <div className="flex gap-1">
                                                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></div>
                                                            </div>
                                                            <span className="text-zinc-500">Thinking...</span>
                                                        </div>
                                                    ) : null}
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
                                    Good Evening, Kristoffer.
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
                                        {status !== ModelStatus.IDLE ? <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div> : <AudioWaveform size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Suggestion Cards (Only visible on empty state) */}
                        {isChatEmpty && (
                            <div className="mt-4 md:mt-6 -mx-2 md:mx-0">
                                <div className="flex md:grid md:grid-cols-3 gap-3 md:gap-4 overflow-x-auto px-2 md:px-0 pb-2 md:pb-0 snap-x snap-mandatory scrollbar-hide">
                                    <SuggestionCard
                                        title="Travel Deductions"
                                        description="Check if you are eligible for travel to work deductions (Reseavdrag)"
                                    />
                                    <SuggestionCard
                                        title="Declare Income"
                                        description="Assistance with submitting your annual income declaration"
                                    />
                                    <SuggestionCard
                                        title="VAT & Employer"
                                        description="Rules regarding VAT returns and employer contributions"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
