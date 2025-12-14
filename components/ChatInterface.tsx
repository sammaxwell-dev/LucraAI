'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Orb } from '@/components/Orb';
import { SuggestionCard } from '@/components/SuggestionCard';
import { WelcomeScreen } from '@/components/WelcomeScreen';
import {
    MoreHorizontal,
    Paperclip,
    Calculator,
    FileText,
    AudioWaveform,
    Send,
    Menu,
    Search,
    X,
    FileImage,
    File,
    AlertCircle
} from 'lucide-react';
import { ChatMessage, ModelStatus, QuickMessage, UserDocument } from '@/types';
import ReactMarkdown from 'react-markdown';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import { useUser } from '@/hooks/useUser';
import { useDocuments } from '@/hooks/useDocuments';
import { useChatSessionsContext } from '@/components/ChatSessionsContext';
import { getRandomQuickMessages } from '@/lib/quickMessages';
import { useSidebar } from '@/components/SidebarContext';

// Supported file types for direct attachment (GPT-4o vision)
// Note: DOCX is NOT supported by OpenAI - use Documents page for those
const SUPPORTED_TYPES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/gif',
    'image/webp',
    'text/plain',
    'text/markdown'
];

const SUPPORTED_EXTENSIONS = '.pdf,.png,.jpg,.jpeg,.gif,.webp,.txt,.md';

// Validate file type
function isFileSupported(file: File): boolean {
    if (SUPPORTED_TYPES.includes(file.type)) return true;
    if (file.name.endsWith('.md')) return true;
    return false;
}

// Convert file to data URL
async function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export default function ChatInterface() {
    const [input, setInput] = useState('');
    const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);
    const [status, setStatus] = useState<ModelStatus>(ModelStatus.IDLE);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toggle: toggleSidebar } = useSidebar();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isUpdatingFromLocalRef = useRef(false);
    const [quickMessages, setQuickMessages] = useState<QuickMessage[]>([]);

    // Hooks for user and sessions
    const { user, isLoading: isUserLoading, setUser } = useUser();
    const {
        activeSession,
        activeSessionId,
        isLoading: isSessionsLoading,
        createSession,
        updateSession,
    } = useChatSessionsContext();

    // Documents from Documents page (for context)
    const { documents: savedDocuments } = useDocuments();

    // Local messages (synced with active session)
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Sync messages when active session changes
    useEffect(() => {
        if (isUpdatingFromLocalRef.current) {
            isUpdatingFromLocalRef.current = false;
            return;
        }
        if (activeSession) {
            setMessages(activeSession.messages);
        } else {
            setMessages([]);
        }
    }, [activeSessionId, activeSession]);

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

    // Generate random quick messages for new chat
    useEffect(() => {
        if (messages.length === 0) {
            setQuickMessages(getRandomQuickMessages());
        }
    }, [messages.length]);

    // Handle file selection with validation
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            const validFiles: File[] = [];
            const invalidFiles: string[] = [];

            files.forEach(file => {
                if (isFileSupported(file)) {
                    validFiles.push(file);
                } else {
                    invalidFiles.push(file.name);
                }
            });

            if (invalidFiles.length > 0) {
                setFileError(`Unsupported: ${invalidFiles.join(', ')}. Use PDF, images, or text files.`);
                setTimeout(() => setFileError(null), 5000);
            }

            if (validFiles.length > 0) {
                setAttachedFiles(prev => [...prev, ...validFiles]);
            }
        }
    };

    // Remove attached file
    const handleRemoveFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Build document context for system prompt
    const getDocumentContext = (): string => {
        if (savedDocuments.length === 0) return '';

        const docList = savedDocuments.map(doc =>
            `- ${doc.name} (${doc.type}, uploaded ${new Date(doc.uploadedAt).toLocaleDateString()})`
        ).join('\n');

        return `\n\n[User's saved documents:\n${docList}]`;
    };

    // Send message with optional files
    const handleSendMessage = useCallback(async () => {
        if ((!input.trim() && attachedFiles.length === 0) || status !== ModelStatus.IDLE) return;

        // Create session if needed
        let currentSessionId = activeSessionId;
        if (!currentSessionId) {
            isUpdatingFromLocalRef.current = true;
            const newSession = createSession();
            currentSessionId = newSession.id;
        }

        // Build user message
        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: Date.now()
        };

        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');

        // Save to session (defer to avoid React setState during render)
        Promise.resolve().then(() => {
            isUpdatingFromLocalRef.current = true;
            updateSession(currentSessionId, newMessages);
        });

        setStatus(ModelStatus.THINKING);

        const modelMsgId = (Date.now() + 1).toString();
        const messagesWithPlaceholder = [...newMessages, {
            id: modelMsgId,
            role: 'model' as const,
            text: '',
            timestamp: Date.now()
        }];
        setMessages(messagesWithPlaceholder);

        try {
            // Build message parts for API
            const messageParts: Array<{ type: string; text?: string; mediaType?: string; url?: string }> = [];

            // Add text content
            let textContent = input.trim();

            // On first message, tell AI what documents are available (metadata only)
            // Full content is sent only when user explicitly asks about a document
            if (messages.length === 0 && savedDocuments.length > 0) {
                textContent += `\n\n[User has ${savedDocuments.length} document(s) in their library: ${savedDocuments.map(d => d.name).join(', ')}. Only analyze/discuss these if the user explicitly asks about them.]`;
            }

            if (textContent) {
                messageParts.push({ type: 'text', text: textContent });
            }

            // Add attached files from file input
            for (const file of attachedFiles) {
                const dataUrl = await fileToDataUrl(file);
                messageParts.push({
                    type: 'file',
                    mediaType: file.type || 'text/plain',
                    url: dataUrl
                });
            }

            // Note: Saved documents from Documents page are NOT sent as file attachments
            // because not all formats (like DOCX) are supported by the AI model.
            // Instead, their content/metadata is included in the system context.

            // Prepare all messages for API (AI SDK V5 format)
            const apiMessages = newMessages.map(m => ({
                id: m.id,
                role: m.role === 'model' ? 'assistant' : m.role,
                parts: [{ type: 'text', text: m.text }]
            }));

            // Add current message with files
            apiMessages[apiMessages.length - 1] = {
                id: userMsg.id,
                role: 'user',
                parts: messageParts as any
            };

            // Debug: log what we're sending
            console.log('📄 Saved documents:', savedDocuments.map(d => ({ name: d.name, hasDataUrl: !!d.dataUrl })));
            console.log('📎 Attached files:', attachedFiles.map(f => f.name));
            console.log('📨 Message parts:', messageParts.map(p => p.type === 'file' ? `file: ${p.mediaType}` : `text: ${p.text?.substring(0, 50)}...`));
            console.log('🔢 Is first message:', messages.length === 0);

            // Call API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages }),
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
                    accumulatedText += chunk;

                    setMessages(prev => prev.map(msg =>
                        msg.id === modelMsgId
                            ? { ...msg, text: accumulatedText }
                            : msg
                    ));
                }
            }

            // Save final messages
            setMessages(prev => {
                const finalMessages = prev.map(msg =>
                    msg.id === modelMsgId
                        ? { ...msg, text: accumulatedText }
                        : msg
                );
                // Schedule updateSession for next tick to avoid setState during render
                Promise.resolve().then(() => {
                    isUpdatingFromLocalRef.current = true;
                    updateSession(currentSessionId!, finalMessages);
                });
                return finalMessages;
            });

            // Clear attached files
            setAttachedFiles([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            setStatus(ModelStatus.IDLE);
        } catch (error) {
            console.error(error);
            setStatus(ModelStatus.ERROR);
            setMessages(prev => {
                const errorMessages = prev.map(msg =>
                    msg.id === modelMsgId
                        ? { ...msg, text: "Something went wrong. Please try again." }
                        : msg
                );
                // Schedule updateSession for next tick to avoid setState during render
                Promise.resolve().then(() => {
                    isUpdatingFromLocalRef.current = true;
                    updateSession(currentSessionId!, errorMessages);
                });
                return errorMessages;
            });
            setStatus(ModelStatus.IDLE);
        }
    }, [input, attachedFiles, status, messages, activeSessionId, savedDocuments, createSession, updateSession]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSuggestionClick = (message: string) => {
        setInput(message);
        setTimeout(() => handleSendMessage(), 100);
    };

    const handleWelcomeComplete = (name: string) => {
        setUser(name);
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Loading state
    if (isUserLoading || isSessionsLoading) {
        return (
            <div className="flex h-[100dvh] w-full bg-[#050505] items-center justify-center">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return <WelcomeScreen onComplete={handleWelcomeComplete} />;
    }

    const isSyncing = activeSession && activeSession.messages.length > 0 && messages.length === 0;
    const isChatEmpty = messages.length === 0 && !isSyncing;

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="flex h-full w-full bg-[#050505] overflow-hidden font-sans selection:bg-white/20">
            <main className={`flex-1 flex flex-col relative min-w-0 transition-all duration-300`}>
                {/* Background */}
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-[100px] pointer-events-none" />

                {/* Header */}
                <header className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 z-10 gap-4">
                    <button onClick={toggleSidebar} className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <Menu size={20} />
                    </button>



                    <button className="w-10 h-10 flex items-center justify-center rounded-full border border-white/10 bg-[#121212] text-zinc-400 hover:text-white hover:bg-[#1a1a1a] transition-colors ml-auto">
                        <MoreHorizontal size={18} />
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full px-3 md:px-4 z-10 overflow-hidden">
                    <LayoutGroup>
                        {!isChatEmpty && (
                            <div className="flex-1 overflow-y-auto px-1 md:pl-2 md:pr-4 mb-4 space-y-5">
                                {messages.map((msg, index) => {
                                    const isFirstModelMessage = index === messages.findIndex(m => m.role === 'model');

                                    return (
                                        <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            {msg.role === 'model' && (
                                                <div className="flex shrink-0 items-start mt-0.5">
                                                    {isFirstModelMessage ? (
                                                        <Orb className="w-7 h-7 md:w-8 md:h-8" layoutId="bot-avatar" isStatic />
                                                    ) : (
                                                        <Orb className="w-7 h-7 md:w-8 md:h-8" isStatic />
                                                    )}
                                                </div>
                                            )}

                                            {msg.role === 'model' && !msg.text && status === ModelStatus.SEARCHING ? (
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
                                                <div className="flex items-center gap-2 text-zinc-400 text-sm py-2">
                                                    <div className="flex gap-1">
                                                        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                                        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                                        <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce"></div>
                                                    </div>
                                                </div>
                                            ) : (
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

                    {/* Bottom Area */}
                    <div className="w-full mt-auto pb-4">
                        {/* Error */}
                        <AnimatePresence>
                            {fileError && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-3 flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                                >
                                    <AlertCircle size={16} />
                                    {fileError}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Attached Files */}
                        {attachedFiles.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                                {attachedFiles.map((file, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2"
                                    >
                                        {file.type.startsWith('image/') ? (
                                            <FileImage size={16} className="text-emerald-400" />
                                        ) : file.type === 'application/pdf' ? (
                                            <FileText size={16} className="text-red-400" />
                                        ) : (
                                            <File size={16} className="text-zinc-400" />
                                        )}
                                        <span className="text-sm text-zinc-300 max-w-[150px] truncate">{file.name}</span>
                                        <span className="text-xs text-zinc-500">{formatFileSize(file.size)}</span>
                                        <button onClick={() => handleRemoveFile(index)} className="p-1 hover:bg-white/10 rounded transition-colors">
                                            <X size={14} className="text-zinc-400" />
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="relative group bg-[#0F0F10] border border-white/10 rounded-2xl transition-all duration-300 focus-within:border-white/20 focus-within:shadow-glow focus-within:bg-[#141414]">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about taxes, attach documents..."
                                className="w-full bg-transparent text-zinc-200 placeholder:text-zinc-500 text-[16px] p-3 md:p-5 pb-14 md:pb-16 min-h-[100px] md:min-h-[140px] resize-none focus:outline-none rounded-2xl"
                                style={{ fontSize: '16px' }}
                            />

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={SUPPORTED_EXTENSIONS}
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`p-2 rounded-lg transition-colors ${attachedFiles.length > 0
                                            ? 'text-emerald-400 bg-emerald-500/10'
                                            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                                            }`}
                                        title="Attach (PDF, images, text)"
                                    >
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

                                <button
                                    onClick={handleSendMessage}
                                    disabled={(!input.trim() && attachedFiles.length === 0) || status !== ModelStatus.IDLE}
                                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all
                                        ${(input.trim() || attachedFiles.length > 0)
                                            ? 'bg-white text-black hover:scale-105'
                                            : 'bg-white/10 text-zinc-500 border border-white/5 cursor-not-allowed'}
                                    `}
                                >
                                    {status !== ModelStatus.IDLE ? (
                                        <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (input.trim() || attachedFiles.length > 0) ? (
                                        <Send size={20} />
                                    ) : (
                                        <AudioWaveform size={20} />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Suggestions */}
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
        </div>
    );
}
