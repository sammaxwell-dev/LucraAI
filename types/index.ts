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
    STREAMING = 'STREAMING',
    ERROR = 'ERROR'
}
