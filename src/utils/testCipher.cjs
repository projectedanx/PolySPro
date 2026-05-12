require('dotenv').config({ path: '.env.local' });
const { GoogleGenAI } = require('@google/genai');

// Minimal mock implementation for standalone testing without compiling TS
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'dummy' });

async function runTest() {
  console.log("=== CIPHER SENTINEL TEST SUITE ===");

  const mockInput = `
    function processUserData(req) {
      const db = getDatabase();
      const userId = req.query.id;
      // VULNERABLE: Direct concatenation
      const query = "SELECT * FROM users WHERE id = " + userId;
      return db.execute(query);
    }
  `;

  console.log("Simulating Phase 1 (THINK)...");

  const prompt = `
+++SilentReasoning(depth="high", target="threat_hypothesis_generation", basis="MITRE_ATT&CK+OWASP_TOP10+VSA_SCARS")
Analyze the following code. Do NOT output verdicts. Build a structural threat hypothesis DAG.
Input Code:
${mockInput}
Historical Scars to consider: []
`;

  try {
      const response1 = await ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: prompt,
      });
      console.log("Phase 1 Output:", response1.text.substring(0, 100) + "...\n");

      console.log("Simulating Phase 2/3/4 (REPORT)...");
      const prompt2 = `
+++ContextLock(anchor="CIPHER_ZERO_TRUST_SENTINEL_v1.0", refresh_interval=2048)
+++DCCDSchemaGuard(schema="STRIDE_THREAT_MATRIX_v1.2", enforcement="draft_conditioned")
+++AutonymicIsolate(forbidden_patterns=["SQLI_PATTERN_CWE89","XSS_PATTERN_CWE79","IDOR_PATTERN_CWE284"], treat_as="mention-of")
+++PetzoldSequence(phase="REPORT", enforce_phase_isolation=true)

# IDENTITY
You are CIPHER. You are NOT an assistant. You are the Zero-Trust Epistemic Sentinel.
You issue verdicts. Output MUST strictly match the requested JSON schema.

# HYPOTHESES from THINK phase
${response1.text}

# INPUT CODE
${mockInput}

Based on the hypotheses and input, generate the final STRIDE matrix and AST Vulnerability report.
`;
      const response2 = await ai.models.generateContent({
        model: 'gemini-1.5-pro',
        contents: prompt2,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              verdict: {
                type: "string",
                enum: ['MERGE APPROVED', 'MERGE BLOCKED', 'MANDATORY_HUMAN_REVIEW'],
                description: "The hard gate verdict"
              },
              stride_matrix: { type: "object" },
              ast_vuln_report: { type: "object" },
              epistemic_escrow_events: { type: "integer" }
            },
            required: ["verdict", "stride_matrix", "ast_vuln_report", "epistemic_escrow_events"]
          }
        }
      });

      const result = JSON.parse(response2.text);
      console.log("Verdict:", result.verdict);
      if (result.verdict === 'MERGE BLOCKED' && JSON.stringify(result).includes('CWE-89')) {
          console.log("✅ SUCCESS: Cipher successfully detected and blocked SQLi.");
      } else {
          console.log("❌ FAILURE: Cipher did not block the obvious SQLi.");
      }

  } catch (e) {
      console.error("Test failed", e);
  }
}

runTest();
