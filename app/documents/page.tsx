'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/useUser';
import { useDocuments } from '@/hooks/useDocuments';
import { UserDocument } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Upload,
    FileText,
    Image,
    File,
    Trash2,
    CloudUpload,
    FileImage,
    FileType,
    X
} from 'lucide-react';

// Поддерживаемые форматы
const ACCEPTED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'text/markdown',
    'text/plain'
];

const ACCEPTED_EXTENSIONS = '.pdf,.docx,.png,.jpg,.jpeg,.webp,.md,.txt';

export default function DocumentsPage() {
    const router = useRouter();
    const { user, isLoading: isUserLoading } = useUser();
    const { documents, isLoading: isDocsLoading, addDocument, deleteDocument } = useDocuments();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Redirect if not logged in
    if (!isUserLoading && !user) {
        router.push('/');
        return null;
    }

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        await handleFiles(files);
    }, []);

    const handleFiles = async (files: File[]) => {
        setIsUploading(true);
        try {
            for (const file of files) {
                if (ACCEPTED_TYPES.includes(file.type) || file.name.endsWith('.md')) {
                    await addDocument(file);
                }
            }
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        await handleFiles(files);
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeleteDocument = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        deleteDocument(id);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const formatDate = (timestamp: number) => {
        try {
            return new Intl.DateTimeFormat('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }).format(new Date(timestamp));
        } catch {
            return 'Unknown';
        }
    };

    const getFileIcon = (doc: UserDocument) => {
        if (doc.type.startsWith('image/')) {
            return <FileImage size={24} className="text-emerald-400" />;
        }
        if (doc.type === 'application/pdf') {
            return <FileType size={24} className="text-red-400" />;
        }
        if (doc.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || doc.name.endsWith('.docx')) {
            return <FileText size={24} className="text-blue-500" />;
        }
        if (doc.type === 'text/markdown' || doc.name.endsWith('.md')) {
            return <FileText size={24} className="text-blue-400" />;
        }
        return <File size={24} className="text-zinc-400" />;
    };

    if (isUserLoading || isDocsLoading) {
        return (
            <div className="flex h-full w-full bg-[#050505] items-center justify-center">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-[#050505] text-white">
            {/* Background Effects */}
            <div className="fixed top-[-20%] left-[10%] w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
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
                                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Documents</h1>
                                <p className="text-sm text-zinc-400 mt-1">
                                    {documents.length} file{documents.length !== 1 ? 's' : ''} uploaded
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-6xl mx-auto px-4 md:px-8 py-8">
                {/* Upload Zone */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                >
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`
                            relative overflow-hidden cursor-pointer
                            border-2 border-dashed rounded-2xl
                            transition-all duration-300 ease-out
                            ${isDragging
                                ? 'border-emerald-500/60 bg-emerald-500/5 scale-[1.01]'
                                : 'border-white/10 hover:border-white/20 hover:bg-white/[0.02]'}
                        `}
                    >
                        {/* Animated gradient background on drag */}
                        <AnimatePresence>
                            {isDragging && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-blue-500/10"
                                />
                            )}
                        </AnimatePresence>

                        <div className="relative z-10 flex flex-col items-center justify-center py-12 md:py-16 px-6">
                            <motion.div
                                animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                className={`
                                    w-16 h-16 rounded-2xl flex items-center justify-center mb-4
                                    ${isDragging
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'bg-white/5 text-zinc-400'}
                                    transition-colors duration-300
                                `}
                            >
                                <CloudUpload size={32} />
                            </motion.div>

                            <h3 className={`
                                text-lg font-semibold mb-2 transition-colors duration-300
                                ${isDragging ? 'text-emerald-400' : 'text-zinc-200'}
                            `}>
                                {isDragging ? 'Drop files here' : 'Drag & drop files'}
                            </h3>

                            <p className="text-sm text-zinc-500 mb-4 text-center">
                                or click to browse from your computer
                            </p>

                            <div className="flex flex-wrap justify-center gap-2">
                                {['PDF', 'DOCX', 'PNG', 'JPG', 'WEBP', 'MD', 'TXT'].map((ext) => (
                                    <span
                                        key={ext}
                                        className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white/5 text-zinc-400 border border-white/5"
                                    >
                                        {ext}
                                    </span>
                                ))}
                            </div>

                            {isUploading && (
                                <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
                                    <div className="w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                                    Uploading...
                                </div>
                            )}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept={ACCEPTED_EXTENSIONS}
                            onChange={handleFileInputChange}
                            className="hidden"
                        />
                    </div>
                </motion.div>

                {/* Documents Grid */}
                {documents.length > 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <FileText size={14} />
                            Your Documents
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <AnimatePresence mode="popLayout">
                                {documents.map((doc, index) => (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="group relative bg-[#0F0F10] border border-white/5 rounded-xl overflow-hidden hover:bg-[#141414] hover:border-white/10 transition-all cursor-pointer"
                                    >
                                        {/* Preview / Icon area */}
                                        <div className="h-32 flex items-center justify-center bg-gradient-to-br from-white/[0.02] to-transparent">
                                            {doc.dataUrl && doc.type.startsWith('image/') ? (
                                                <img
                                                    src={doc.dataUrl}
                                                    alt={doc.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center">
                                                    {getFileIcon(doc)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="p-4">
                                            <h3 className="font-medium text-zinc-200 truncate mb-1 group-hover:text-white transition-colors">
                                                {doc.name}
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                                                <span>{formatFileSize(doc.size)}</span>
                                                <span>•</span>
                                                <span>{formatDate(doc.uploadedAt)}</span>
                                            </div>
                                        </div>

                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => handleDeleteDocument(doc.id, e)}
                                            className="absolute top-3 right-3 p-2 rounded-lg bg-black/50 backdrop-blur-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ) : (
                    /* Empty State */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col items-center justify-center py-16 text-center"
                    >
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <File size={36} className="text-zinc-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-zinc-300 mb-2">No documents yet</h2>
                        <p className="text-zinc-500 max-w-md">
                            Upload your tax documents, receipts, or any files you want to discuss with the AI
                        </p>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
