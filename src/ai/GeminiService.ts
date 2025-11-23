import { GoogleGenAI } from "@google/genai";

export class GeminiService {
    private ai: GoogleGenAI;

    constructor(apiKey: string) {
        this.ai = new GoogleGenAI({ apiKey });
    }

    async generateNextLine(previousCode: string): Promise<string> {
        const prompt = `
      You are a musical coding assistant in a rhythm game.
      The player just typed this line of code: "${previousCode}"
      
      Generate the NEXT logical line of code to continue the sequence.
      Rules:
      1. Return ONLY the code. No markdown, no explanations.
      2. Keep it short (under 60 characters) so it fits the rhythm.
      3. Make it syntactically correct JavaScript/TypeScript.
      4. If the previous line was a function definition, write the first line of the body.
      5. If it was a variable, use it.
      
      Example:
      Input: const beat = 0;
      Output: beat++;
    `;

        try {
            const response = await this.ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
            });

            const text = response.text;
            // Clean up potential markdown code blocks if the model ignores the prompt
            return text?.trim().replace(/```/g, '').replace(/javascript/g, '').replace(/typescript/g, '').trim() || "// AI is silent...";
        } catch (error) {
            console.error("Gemini API Error:", error);
            return "// AI is thinking... (Error)";
        }
    }
}

