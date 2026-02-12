import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { getAISystemPrompt } from '@/ai-system-prompt';


export async function POST(req: Request) {
    const { prompt, messages } = await req.json();

    // Transform user messages
    const userMessages = messages
        ? messages.map((m: { role: string; text?: string; content?: string }) => ({
            role: m.role as 'user' | 'assistant' | 'system',
            content: m.text || m.content || '',
        }))
        : [{ role: 'user' as const, content: prompt }];

    // Add system prompt at the beginning
    const inputMessages = [
        { role: 'system' as const, content: getAISystemPrompt() },
        ...userMessages,
    ];

    // Use OpenAI Responses API with web search tool
    const result = streamText({
        model: openai.responses('gpt-5.2'),
        messages: inputMessages,
        tools: {
            web_search: openai.tools.webSearch({
                searchContextSize: 'medium',
                userLocation: { type: 'approximate', country: 'SE' },
            }),
        },
    });

    // Create custom stream that includes status markers
    const encoder = new TextEncoder();
    let hasStartedStreaming = false;
    let isSearching = false;

    const customStream = new ReadableStream({
        async start(controller) {
            try {
                for await (const part of result.fullStream) {
                    if (part.type === 'tool-call' && part.toolName === 'web_search') {
                        // Send searching marker
                        if (!isSearching) {
                            isSearching = true;
                            controller.enqueue(encoder.encode('[STATUS:SEARCHING]\n'));
                        }
                    } else if (part.type === 'tool-result') {
                        // Search completed, text will start soon
                        if (isSearching) {
                            controller.enqueue(encoder.encode('[STATUS:STREAMING]\n'));
                            isSearching = false;
                        }
                    } else if (part.type === 'text-delta') {
                        // Send streaming marker on first text
                        if (!hasStartedStreaming) {
                            hasStartedStreaming = true;
                            if (!isSearching) {
                                controller.enqueue(encoder.encode('[STATUS:STREAMING]\n'));
                            }
                        }
                        // Send actual text
                        controller.enqueue(encoder.encode(part.text));
                    }
                }
                controller.close();
            } catch (error) {
                controller.error(error);
            }
        },
    });

    return new Response(customStream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
        },
    });
}
