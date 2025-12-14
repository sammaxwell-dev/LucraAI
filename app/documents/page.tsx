'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useUser } from '@/hooks/useUser';
import { useChatSessions } from '@/hooks/useChatSessions';
import {
    Menu,
    CloudUpload,
    FileText,
    Image as ImageIcon,
    FileType,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentsPage() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { user } = useUser();
    const {
        sessions,
        activeSessionId,
        groupedSessions,
        createSession,
        setActiveSession,
        deleteSession
    } = useChatSessions();

    const [isDragging, setIsDragging] = useState(false);
    const [recentUploads, setRecentUploads] = useState([
        { id: '1', name: 'Tax_Return_2024.pdf', type: 'PDF', size: '2.4 MB', date: '2 hours ago', status: 'processed' },
        { id: '2', name: 'Invoice_#1023.jpg', type: 'Image', size: '1.8 MB', date: '5 hours ago', status: 'processed' },
        { id: '3', name: 'Meeting_Notes_Q4.md', type: 'Markdown', size: '12 KB', date: 'Yesterday', status: 'pending' },
    ]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        // Mock upload logic
    };

    return (
        <div className="flex h-[100dvh] w-full bg-[#050505] overflow-hidden font-sans selection:bg-white/20">
            <Sidebar
                isOpen={isSidebarOpen}
                onCloseMobile={() => setIsSidebarOpen(false)}
                sessions={sessions}
                activeSessionId={null}
                groupedSessions={groupedSessions}
                onNewChat={() => {
                    createSession();
                    window.location.href = '/';
                }}
                onSelectSession={(id) => {
                    setActiveSession(id);
                    window.location.href = '/';
                }}
                onDeleteSession={deleteSession}
                userName={user?.name || 'User'}
            />

            <main className="flex-1 flex flex-col relative min-w-0 transition-all duration-300">
                {/* Background Spotlights */}
                <div className="absolute top-[-20%] left-[20%] w-[600px] h-[600px] bg-blue-900/05 rounded-full blur-[120px] pointer-events-none" />

                {/* Header */}
                <header className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 z-10 gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-xl font-semibold text-white tracking-tight">Documents</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-400">
                            <Shield size={12} className="text-green-500" />
                            <span>Encrypted & Secure</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-8 z-10 w-full max-w-6xl mx-auto">

                    {/* Intro Text */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-medium text-white mb-2">Upload Content</h2>
                        <p className="text-zinc-400">Import your documents, receipts, and notes for AI analysis.</p>
                    </div>

                    {/* Upload Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className={`
                            relative group border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer
                            ${isDragging
                                ? 'border-blue-500/50 bg-blue-500/5'
                                : 'border-zinc-800 hover:border-zinc-700 bg-white/[0.02] hover:bg-white/[0.04]'}
                        `}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                            <div className={`
                                w-20 h-20 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                                ${isDragging ? 'bg-blue-500/20 scale-110' : 'bg-white/5 group-hover:bg-white/10'}
                            `}>
                                <CloudUpload size={32} className={`transition-colors ${isDragging ? 'text-blue-400' : 'text-zinc-400'}`} />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-white mb-1">
                                    Click to upload or drag and drop
                                </h3>
                                <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                                    Support for PDF, PNG, JPG, and Markdown files. <br />
                                    Max file size 50 MB.
                                </p>
                            </div>
                        </div>

                        {/* Supported Formats Badges */}
                        <div className="flex items-center justify-center gap-3 mt-4 opacity-60">
                            {[
                                { icon: FileText, label: 'PDF' },
                                { icon: ImageIcon, label: 'Images' },
                                { icon: FileType, label: 'MD' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 text-xs text-zinc-400">
                                    <item.icon size={12} />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent Uploads Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        className="mt-12"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-medium text-white">Recent Uploads</h3>
                            <button className="text-sm text-zinc-500 hover:text-white transition-colors">
                                View All
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {recentUploads.map((file, index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 * index + 0.3 }}
                                    key={file.id}
                                    className="group flex items-center p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.05] transition-all"
                                >
                                    {/* Icon based on Type */}
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mr-4 text-zinc-300">
                                        {file.type === 'PDF' && <FileText size={20} />}
                                        {file.type === 'Image' && <ImageIcon size={20} />}
                                        {file.type === 'Markdown' && <FileType size={20} />}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium text-zinc-200 truncate group-hover:text-white transition-colors">{file.name}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-zinc-500">{file.size}</span>
                                            <span className="w-0.5 h-0.5 rounded-full bg-zinc-600"></span>
                                            <span className="text-xs text-zinc-500">{file.date}</span>
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="flex items-center gap-4">
                                        {file.status === 'processed' ? (
                                            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 text-xs font-medium text-green-400 border border-green-500/10">
                                                <CheckCircle2 size={12} />
                                                <span>Processed</span>
                                            </div>
                                        ) : (
                                            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-xs font-medium text-amber-400 border border-amber-500/10">
                                                <Clock size={12} />
                                                <span>Processing</span>
                                            </div>
                                        )}

                                        <button className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all">
                                            <MoreHorizontal size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                </div>
            </main>
        </div>
    );
}
