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

// Сессия чата
export interface ChatSession {
    id: string;
    title: string;           // Автоматически из первого сообщения
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}
