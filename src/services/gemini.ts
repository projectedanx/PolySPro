
import { GoogleGenAI, Type } from "@google/genai";
// Fix: Import AssistantResponse from types.ts to resolve compilation error
import { AssistantResponse, PluriversalKnowledgeCapsule } from "../types";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "dummy" });

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


export const mineTopology = async (query: string): Promise<PluriversalKnowledgeCapsule | null> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `
You are the Lexical Topology Engine. You do not read words; you compute their thermodynamic constraints and non-Euclidean routing vectors.
Extract "Isomorphisms of Friction" across completely unrelated scientific domains based on this query: "${query}".
Output a Pluriversal Knowledge Capsule containing the latent bridge and the topology nodes (domain and context).
`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          latent_bridge: { type: Type.STRING, description: "The exact latent bridge connecting the orthogonal domains." },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                domain: { type: Type.STRING, description: "The scientific or conceptual domain." },
                context: { type: Type.STRING, description: "The context or terminology used in this domain." }
              },
              required: ["domain", "context"]
            }
          }
        },
        required: ["latent_bridge", "nodes"]
      }
    }
  });

  try {
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("Failed to parse topology miner response", e);
    return null;
  }
};

export const predictNextSymbol = async (context: string): Promise<string | null> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on the following mathematical or scientific text, predict the next logical symbol or short sequence of symbols to autocomplete the equation or text. Respond ONLY with the predicted symbols, nothing else. Context: "${context}"`,
    config: {
      temperature: 0.1,
    }
  });

  try {
    const text = response.text;
    return text ? text.trim() : null;
  } catch (e) {
    console.error("Failed to parse autocomplete response", e);
    return null;
  }
};
