import { Type } from "@google/genai";
import { ai } from "../gemini";
import { EpistemicEscrowRequest } from "../../types";

export const evaluateEpistemicEscrow = async (query: string, cfdThreshold: number = 0.15): Promise<EpistemicEscrowRequest | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `
You are the Epistemic Escrow Agent. Your job is to detect Interpretive Fracture.
Analyze the following query: "${query}"

Determine if the query makes hidden assumptions, uses ambiguous terms, or lacks the necessary context to provide a definitively correct answer without guessing.
Calculate the Confidence-Fidelity Divergence Index (CFDI) between 0.0 and 1.0. A high CFDI (> ${cfdThreshold}) means you are confident you can generate an answer, but fidelity to the truth is low because of ambiguity.

If the CFDI > ${cfdThreshold}, set "is_escrowed" to true, identify the "ambiguity_source", and ask a "clarifying_question" to the user.
If the CFDI <= ${cfdThreshold}, set "is_escrowed" to false.

Respond in JSON format.
`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_escrowed: { type: Type.BOOLEAN, description: "Whether the query should be halted and placed in escrow." },
            cfd_index: { type: Type.NUMBER, description: "The Confidence-Fidelity Divergence Index." },
            ambiguity_source: { type: Type.STRING, description: "The specific part of the query that is ambiguous or assumes missing context." },
            clarifying_question: { type: Type.STRING, description: "The question to ask the user to resolve the ambiguity." }
          },
          required: ["is_escrowed", "cfd_index", "ambiguity_source", "clarifying_question"]
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("Failed to evaluate Epistemic Escrow", e);
    return null;
  }
};
