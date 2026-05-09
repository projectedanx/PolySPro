
import { GoogleGenAI, Type } from "@google/genai";
// Fix: Import AssistantResponse from types.ts to resolve compilation error
import { AssistantResponse, PluriversalKnowledgeCapsule, LatentTopologyRequest, TopologyResponse } from "../types";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY || "dummy" });

/**
 * Interrogates the Gemini API to retrieve structured metadata based on a user's textual description of a symbol.
 *
 * @param {string} description - The user's query describing the symbol.
 * @returns {Promise<AssistantResponse | null>} A promise that resolves to the metadata object, or null on failure.
 */
export const findSymbol = async (description: string): Promise<AssistantResponse | null> => {
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
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

/**
 * Retrieves brief official description and usage metadata for a given character symbol.
 *
 * @param {string} char - The target character symbol.
 * @returns {Promise<{description: string, usage: string} | null>} A promise resolving to the metadata, or null on failure.
 */
export const getSymbolMetadata = async (char: string): Promise<{description: string, usage: string} | null> => {
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
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


/**
 * Computes thermodynamic constraints and non-Euclidean routing vectors to extract "Isomorphisms of Friction"
 * across unrelated scientific domains based on the user's query.
 *
 * @param {string} query - The base concept to explore across domains.
 * @returns {Promise<PluriversalKnowledgeCapsule | null>} A promise resolving to the Pluriversal Knowledge Capsule.
 */
export const mineTopology = async (query: string): Promise<PluriversalKnowledgeCapsule | null> => {
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
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

/**
 * Predicts the next logical symbol or short sequence of symbols to autocomplete an equation or text.
 *
 * @param {string} context - The preceding mathematical or scientific text.
 * @returns {Promise<string | null>} A promise resolving to the predicted symbols.
 */
export const predictNextSymbol = async (context: string): Promise<string | null> => {
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
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

/**
 * Generates plausible but incorrect descriptions (distractors) for use in multiple-choice quiz questions.
 *
 * @param {string} char - The target symbol.
 * @param {string} correctDescription - The correct description of the symbol.
 * @returns {Promise<string[] | null>} A promise resolving to an array of distractor strings.
 */
export const generateQuizDistractors = async (char: string, correctDescription: string): Promise<string[] | null> => {
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: `For the symbol "${char}" with the correct description "${correctDescription}", generate exactly 3 plausible but incorrect descriptions (distractors) that could trick a user in a multiple-choice quiz. Return them as a JSON array of 3 strings.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "An array of 3 incorrect but plausible descriptions."
      }
    }
  });

  try {
    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("Failed to parse distractors response", e);
    return null;
  }
};

// Project Aurelius: Isomorphic Bridge to Non-Euclidean Latent Space
/**
 * Constructs a "Unified Meta-Prompt" that forces an image generation model to render a concept
 * adhering strictly to specific geometry constraints (Project Aurelius).
 *
 * @param {LatentTopologyRequest} request - The requested geometric transformation parameters.
 * @returns {Promise<TopologyResponse | null>} A promise resolving to the topology response containing the meta-prompt and constraints.
 */
export const modulatePhantomDimensions = async (request: LatentTopologyRequest): Promise<TopologyResponse | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `
You are the Plausibility Oracle and Phantom Dimension Modulator.
Task: Construct a "Unified Meta-Prompt" that forces an image generation model to render the concept "${request.base_concept}" adhering strictly to ${request.target_geometry} geometry.
Parameters:
- Phantom Dimensions: ${request.phantom_dimensions} (Extrapolate complexity beyond 3D)
- Curvature Bias: ${request.curvature_bias} (Negative for hyperbolic, positive for spherical)

Return a JSON object containing the structural constraints, the finalized meta_prompt, an estimated plausibility score (simulating PBR validation), and a mocked provenance trail.
`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            meta_prompt: { type: Type.STRING, description: "The final prompt to feed to a diffusion model." },
            structural_constraints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Explicit geometric rules the generation must follow."
            },
            plausibility_score: {
              type: Type.OBJECT,
              properties: {
                ssim_estimate: { type: Type.NUMBER },
                physical_adherence: { type: Type.NUMBER },
                semantic_drift: { type: Type.NUMBER }
              }
            },
            provenance_trail: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Mocked tracing of the training data sets influencing this generation."
            }
          },
          required: ["meta_prompt", "structural_constraints", "plausibility_score", "provenance_trail"]
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("Failed to parse topological modulation response", e);
    return null;
  }
};
