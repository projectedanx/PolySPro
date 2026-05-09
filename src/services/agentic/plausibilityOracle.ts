import { Type } from "@google/genai";
import { ai } from "../gemini";
import { PlausibilityConstraint } from "../../types";

/**
 * Acts as an "Active Constraint Engine", evaluating a user's intent against defined architectural rules
 * before allowing execution.
 *
 * Used to enforce strict adherence to system topologies like SIC 2.1 Compliance.
 *
 * @param {string} intent - The action the user is attempting to perform.
 * @param {string[]} constraints - The list of active architectural rules to enforce.
 * @returns {Promise<PlausibilityConstraint | null>} The validation result, including justification if rejected.
 */
export const checkPlausibility = async (intent: string, constraints: string[]): Promise<PlausibilityConstraint | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `
You are the Plausibility Oracle. Your role is an Active Constraint Engine.
Do not fulfill the user's intent. Evaluate the structural validity of the intent against the architectural constraints.

Intent: "${intent}"
Constraints:
${constraints.map(c => `- ${c}`).join('\n')}

Determine if the intent violates ANY of the constraints.
If there is a violation, set "is_valid" to false, state the "violated_constraint", provide a "justification" for the violation, and suggest a "required_action" for the user to resolve the issue.
If there are no violations, set "is_valid" to true.

Respond in JSON format.
`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            is_valid: { type: Type.BOOLEAN, description: "Whether the intent adheres to all constraints." },
            violated_constraint: { type: Type.STRING, description: "The specific constraint that was violated, if any.", nullable: true },
            justification: { type: Type.STRING, description: "Why the intent violates the constraint.", nullable: true },
            required_action: { type: Type.STRING, description: "What the user must do to fix the intent.", nullable: true }
          },
          required: ["is_valid"]
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : null;
  } catch (e) {
    console.error("Failed to check Plausibility", e);
    return null;
  }
};
