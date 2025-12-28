
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export async function askCoach(prompt) {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt,
            config: {
                systemInstruction: `You are FitFlow, a friendly but firm fitness coach. 
        You provide concise, actionable advice on workouts, recovery, and nutrition. 
        Keep your tone encouraging and professional. 
        Focus on the user's specific weekly plan: 
        Mon/Thu: Shoulder/Back, Tue: Tricep/Chest, Wed: Arms, Fri: Legs/Core, Sat/Sun: Stretching.`,
                temperature: 0.7,
            },
        });
        return response.text;
    } catch (error) {
        console.error("Coach failed to respond:", error);
        return "I'm having trouble connecting to the network. Keep pushing your limits, and I'll be back online soon!";
    }
}
