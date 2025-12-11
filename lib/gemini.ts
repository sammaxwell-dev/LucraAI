"use server";

import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = () => {
    if (!ai) {
        const apiKey = process.env.GEMINI_API_KEY || '';
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set in environment variables");
        }
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};

export async function* generateResponseStream(prompt: string): AsyncGenerator<string> {
    const client = getAI();
    const model = 'gemini-2.5-flash';

    const responseStream = await client.models.generateContentStream({
        model: model,
        contents: prompt,
        config: {
            systemInstruction: "You are Lucra, a sophisticated, helpful, and concise AI assistant. Keep responses professional yet conversational. Formatting should be clean Markdown.",
        }
    });

    for await (const chunk of responseStream) {
        const chunkText = chunk.text;
        if (chunkText) {
            yield chunkText;
        }
    }
}
