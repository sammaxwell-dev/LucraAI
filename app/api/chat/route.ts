import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { prompt } = await request.json();

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return new Response("GEMINI_API_KEY is not configured", { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey });
        const model = 'gemini-2.5-flash';

        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: "You are Lucra, a sophisticated, helpful, and concise AI assistant. Keep responses professional yet conversational. Formatting should be clean Markdown.",
            }
        });

        // Create a ReadableStream to stream the response
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of responseStream) {
                        const chunkText = chunk.text;
                        if (chunkText) {
                            controller.enqueue(new TextEncoder().encode(chunkText));
                        }
                    }
                    controller.close();
                } catch (error) {
                    controller.error(error);
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error("Error in chat API:", error);
        return new Response("Failed to generate response", { status: 500 });
    }
}
