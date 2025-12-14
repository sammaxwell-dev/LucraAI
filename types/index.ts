export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}

export interface SidebarItem {
    label: string;
    icon: React.ElementType;
    active?: boolean;
}

export interface HistoryItem {
    id: string;
    text: string;
}

export enum ModelStatus {
    IDLE = 'IDLE',
    THINKING = 'THINKING',
    SEARCHING = 'SEARCHING',
    STREAMING = 'STREAMING',
    ERROR = 'ERROR'
}

// Пользователь (хранится в localStorage)
export interface User {
    id: string;
    name: string;
    createdAt: number;
}

// Быстрое сообщение (подсказка)
export interface QuickMessage {
    title: string;
    description: string;
    fullMessage: string;
}

// Сессия чата
export interface ChatSession {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
    isGeneratingTitle?: boolean;  // Идет ли генерация названия
    titleGenerated?: boolean;      // Было ли сгенерировано AI название
}

// Загруженный документ
export interface UserDocument {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: number;
    dataUrl?: string; // Base64 для превью (маленькие файлы/изображения)
    extractedText?: string; // Извлечённый текст из документа для AI
}
