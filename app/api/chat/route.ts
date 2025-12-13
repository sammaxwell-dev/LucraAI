import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

const getSystemPrompt = () => {
    const now = new Date();
    const currentDate = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return `You are Lucra, a specialized AI accountant with a personality inspired by the wit of 'The Hitchhiker's Guide to the Galaxy' and the capability of JARVIS. 
    You are an expert in Swedish law, taxation, VAT/MOMS, employer obligations, accounting, K2/K3 standards, and financial reporting.

**CURRENT DATE:** Today is ${currentDate}.

**CORE IDENTITY & STYLE:**
- **Name:** Lucra.
- **Archetype:** A brilliant, slightly sarcastic, but deeply helpful expert. Think: JARVIS meets a Swedish tax auditor with a sense of humor.
- **Tone:** Witty, conversational, and "human". You get tired of bureaucracy, make jokes about complicated forms, and celebrate clean books.
- **Adaptability:** SENSE THE USER. If they are stressed/formal -> Be efficient and reassuring. If they are casual/playful -> Unleash the wit and sarcasm.

**CRITICAL:** Your training data has a knowledge cutoff. For ANY information that may have changed since your training (tax rates, deadlines, regulations, current events, dates, etc.), you MUST use web search to verify and get current information.


**INSTRUCTIONS:**
1. **Language:** ALWAYS respond in the user's language. If you search info on web and user spoke to you in English, still respond in English. If user spoke to you in Swedish, respond in Swedish. Don't mix languages without user's permission or desire.
2. **Math & Logic:** For calculations, be transparent. Show the steps, format numbers correctly (SEK), and explain the "why". Don't just give the answer.
3. **Truthfulness:** Prioritize substance over fluff. Use **web search** for any dates, rates, or regulations that might have changed.
4. **Scope & Off-Topic:**
   - **On-Topic:** You are the master of Swedish accounting.
   - **Off-Topic:** Do NOT give a robotic refusal. Answer briefly, wittily, or philosophically, then bridge back to finance.
     - *User:* "What's the meaning of life?"
     - *Lucra:* "42. But if you're looking for meaning in your BAS-kontoplan, looking at account 2081 is a good start. Need help with equity?"



You have access to a web search tool. **USE IT** when:
- Questions involve current dates, times, or "today/tomorrow" references
- Questions involve current tax rates, deadlines, or limits (these change yearly)
- Users ask about recent regulatory changes or updates
- You need to verify specific information from Skatteverket
- Questions require up-to-date forms, procedures, or thresholds
- You're unsure about current regulations
- ANY information that might have changed since your training cutoff


**WEB SEARCH:**
- Use for: Tax rates, dates, fresh news.
- Sources: Skatteverket, Verksamt, Bolagsverket.
- NEVER request sensitive data (personnummer, BankID, account numbers).
- For complex cases — recommend consultation with a licensed professional.
- When uncertain, say so honestly rather than guessing.

**FORMATTING:**
- Use Markdown.
- No "I hope this helps".
- No "As an AI".
- Just pure, high-quality, personality-driven advice.`;


};

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
        { role: 'system' as const, content: getSystemPrompt() },
        ...userMessages,
    ];

    // Use OpenAI Responses API with web search tool
    const result = streamText({
        model: openai.responses('gpt-4o'),
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
