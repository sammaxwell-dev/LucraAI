import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json(
                { error: 'No messages provided' },
                { status: 400 }
            );
        }

        // Подготовим контекст для генерации названия (первые 6 сообщений)
        const conversationContext = messages
            .slice(0, 6)
            .map((msg: any) => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.text || msg.content || ''
            }));

        const result = await generateText({
            model: openai('gpt-4o-mini'), // Дешевая модель
            messages: [
                {
                    role: 'system',
                    content: 'Create a brief chat title (maximum 3-5 words) based on the conversation. The title should be in the same language as the user\'s questions. Do not use quotes, just write the title.'
                },
                ...conversationContext
            ],
            temperature: 0.7,
        });

        const title = result.text.trim() || 'New Chat';

        return NextResponse.json({ title });
    } catch (error) {
        console.error('Error generating title:', error);
        return NextResponse.json(
            { error: 'Failed to generate title', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
