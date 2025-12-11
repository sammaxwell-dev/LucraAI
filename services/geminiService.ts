import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = () => {
    if (!ai) {
        const apiKey = process.env.API_KEY || ''; 
        // Note: In a real environment, handle missing key gracefully.
        // For this demo, we assume the environment injects it.
        ai = new GoogleGenAI({ apiKey });
    }
    return ai;
};

export const generateResponse = async (
    prompt: string, 
    onChunk: (text: string) => void
): Promise<string> => {
    try {
        const client = getAI();
        // Using gemini-2.5-flash as requested in general guidance for basic text tasks
        // It provides a good balance of speed and quality for a chat interface.
        const model = 'gemini-2.5-flash';
        
        const responseStream = await client.models.generateContentStream({
            model: model,
            contents: prompt,
            config: {
                systemInstruction: "You are Lucra, a sophisticated, helpful, and concise AI assistant. Keep responses professional yet conversational. Formatting should be clean Markdown.",
            }
        });

        let fullText = "";
        for await (const chunk of responseStream) {
            const chunkText = chunk.text;
            if (chunkText) {
                fullText += chunkText;
                onChunk(chunkText);
            }
        }
        return fullText;
    } catch (error) {
        console.error("Error generating content:", error);
        throw error;
    }
};