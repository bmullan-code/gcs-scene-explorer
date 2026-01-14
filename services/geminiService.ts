
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeScenes = async (scenesJson: any) => {
  try {
    const prompt = `
      Analyze the following scenes JSON data and provide a concise summary of the content, patterns, and highlights.
      Data: ${JSON.stringify(scenesJson, null, 2)}
      
      Format your response as markdown. Focus on:
      - Total number of scenes
      - Recurring themes or characters
      - Notable timestamps or events
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Could not generate analysis at this time.";
  }
};
