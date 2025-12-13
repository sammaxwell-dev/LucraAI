'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';

const USER_STORAGE_KEY = 'lucra-ai-user';

export function useUser() {
    const [user, setUserState] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Загрузка пользователя из localStorage
    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(USER_STORAGE_KEY);
            if (stored) {
                setUserState(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading user:', error);
        }
        setIsLoading(false);
    }, []);

    // Создание/обновление пользователя
    const setUser = useCallback((name: string) => {
        const newUser: User = {
            id: crypto.randomUUID(),
            name: name.trim(),
            createdAt: Date.now(),
        };

        try {
            window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
            setUserState(newUser);
        } catch (error) {
            console.error('Error saving user:', error);
        }
    }, []);

    // Удаление пользователя (для logout)
    const clearUser = useCallback(() => {
        try {
            window.localStorage.removeItem(USER_STORAGE_KEY);
            setUserState(null);
        } catch (error) {
            console.error('Error clearing user:', error);
        }
    }, []);

    return { user, isLoading, setUser, clearUser };
}
