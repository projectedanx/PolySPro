
import { GoogleGenAI, Type } from "@google/genai";
// Fix: Import AssistantResponse from types.ts to resolve compilation error
import { AssistantResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findSymbol = async (description: string): Promise<AssistantResponse | null> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Find the specific mathematical, scientific, or foreign character symbol based on this description: "${description}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          character: { type: Type.STRING, description: "The Unicode character symbol itself." },
          description: { type: Type.STRING, description: "Official name of the character." },
          usage: { type: Type.STRING, description: "Common usage or context." }
        },
        required: ["character", "description", "usage"]
      }
    }
  });

  try {
    // Fix: Access .text property directly (not a method) and handle potential undefined return value
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("Failed to parse assistant response", e);
    return null;
  }
};

export const getSymbolMetadata = async (char: string): Promise<{description: string, usage: string} | null> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Provide a brief official description and usage for the character: "${char}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING, description: "Short official name or description." },
          usage: { type: Type.STRING, description: "Brief example of how it is used." }
        },
        required: ["description", "usage"]
      }
    }
  });

  try {
    // Fix: Access .text property directly and provide fallback for undefined values
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (e) {
    return null;
  }
};
