'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserDocument } from '@/types';

const STORAGE_KEY = 'lucra_documents';
const MAX_FILE_SIZE_FOR_PREVIEW = 5 * 1024 * 1024; // 5MB
const MAX_TEXT_LENGTH = 50000; // Max characters to store

// Extract text from file based on type
async function extractTextFromFile(file: File): Promise<string | undefined> {
    const type = file.type;
    const name = file.name.toLowerCase();

    try {
        // Text files (.txt, .md)
        if (type === 'text/plain' || type === 'text/markdown' || name.endsWith('.txt') || name.endsWith('.md')) {
            const text = await file.text();
            return text.substring(0, MAX_TEXT_LENGTH);
        }

        // DOCX files
        if (type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || name.endsWith('.docx')) {
            const mammoth = await import('mammoth');
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            return result.value.substring(0, MAX_TEXT_LENGTH);
        }

        // PDF - would need pdf.js or similar, skip for now
        // Images - would need OCR, skip for now

        return undefined;
    } catch (error) {
        console.error('Error extracting text from file:', error);
        return undefined;
    }
}

export function useDocuments() {
    const [documents, setDocuments] = useState<UserDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Загрузка из localStorage
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setDocuments(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading documents:', error);
        }
        setIsLoading(false);
    }, []);

    // Сохранение в localStorage
    const saveDocuments = useCallback((docs: UserDocument[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
        } catch (error) {
            console.error('Error saving documents:', error);
        }
    }, []);

    // Добавление документа
    const addDocument = useCallback(async (file: File): Promise<UserDocument> => {
        const newDoc: UserDocument = {
            id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadedAt: Date.now(),
        };

        // Extract text content from document
        const extractedText = await extractTextFromFile(file);
        if (extractedText) {
            newDoc.extractedText = extractedText;
        }

        // Store dataUrl for preview (images only, to save space)
        if (file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE_FOR_PREVIEW) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    newDoc.dataUrl = e.target?.result as string;
                    setDocuments(prev => {
                        const updated = [newDoc, ...prev];
                        saveDocuments(updated);
                        return updated;
                    });
                    resolve(newDoc);
                };
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        // Non-image files - just save metadata and extracted text
        setDocuments(prev => {
            const updated = [newDoc, ...prev];
            saveDocuments(updated);
            return updated;
        });
        return newDoc;
    }, [saveDocuments]);

    // Удаление документа
    const deleteDocument = useCallback((id: string) => {
        setDocuments(prev => {
            const updated = prev.filter(doc => doc.id !== id);
            saveDocuments(updated);
            return updated;
        });
    }, [saveDocuments]);

    // Очистка всех документов
    const clearAllDocuments = useCallback(() => {
        setDocuments([]);
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return {
        documents,
        isLoading,
        addDocument,
        deleteDocument,
        clearAllDocuments
    };
}

