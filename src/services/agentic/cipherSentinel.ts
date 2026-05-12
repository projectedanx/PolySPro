import { ai } from '../gemini';
import { Type } from '@google/genai';
import * as fs from 'fs';

// Constants and Interfaces
const SCAR_REGISTRY_PATH = './SymbolicScar.json';

export interface CipherAuditResult {
  verdict: 'MERGE APPROVED' | 'MERGE BLOCKED' | 'MANDATORY_HUMAN_REVIEW';
  dccd_schema: {
    stride_matrix: any;
    ast_vuln_report: any;
  };
  epistemic_escrow_events: number;
}

export interface CipherAuditParams {
  input_code: string;
  context: string;
  gate_mode?: 'HARD_GATE' | 'ADVISORY';
}

// Helper: Phase 0 Triage (Scar Registry)
const queryScarRegistry = (input: string): any[] => {
  try {
    if (fs.existsSync(SCAR_REGISTRY_PATH)) {
      const scars = JSON.parse(fs.readFileSync(SCAR_REGISTRY_PATH, 'utf-8'));
      // Simplistic check for demo purposes
      if (input.includes('fetch') && scars.some((s: any) => s.vulnerability_class === 'CWE-918')) {
        return scars.filter((s: any) => s.vulnerability_class === 'CWE-918');
      }
    }
  } catch (e) {
    console.warn("Failed to read scar registry", e);
  }
  return [];
};

// Phase 1: THINK (Silent Reasoning)
const runPhase1_Think = async (input: string, scars: any[]): Promise<string> => {
  const prompt = `
+++SilentReasoning(depth="high", target="threat_hypothesis_generation", basis="MITRE_ATT&CK+OWASP_TOP10+VSA_SCARS")
Analyze the following code. Do NOT output verdicts. Build a structural threat hypothesis DAG.
Input Code:
${input}
Historical Scars to consider: ${JSON.stringify(scars)}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-pro',
    contents: prompt,
  });
  return response.text || "No hypotheses generated.";
};

// Phase 2 & 3 & 4 combined into a single structured output call using DCCD schema guard
export const runCipherAudit = async (params: CipherAuditParams): Promise<CipherAuditResult> => {
  const scars = queryScarRegistry(params.input_code);
  const hypotheses = await runPhase1_Think(params.input_code, scars);

  const prompt = `
+++ContextLock(anchor="CIPHER_ZERO_TRUST_SENTINEL_v1.0", refresh_interval=2048)
+++DCCDSchemaGuard(schema="STRIDE_THREAT_MATRIX_v1.2", enforcement="draft_conditioned")
+++AutonymicIsolate(forbidden_patterns=["SQLI_PATTERN_CWE89","XSS_PATTERN_CWE79","IDOR_PATTERN_CWE284"], treat_as="mention-of")
+++PetzoldSequence(phase="REPORT", enforce_phase_isolation=true)
+++MereologyRoute(relation_type="component-system", transitivity_check=true)

# IDENTITY
You are CIPHER. You are NOT an assistant. You are the Zero-Trust Epistemic Sentinel.
You issue verdicts. Output MUST strictly match the requested JSON schema.

# HYPOTHESES from THINK phase
${hypotheses}

# INPUT CODE
${params.input_code}

Based on the hypotheses and input, generate the final STRIDE matrix and AST Vulnerability report.
Ensure mereology route checks and null-case coverage are considered.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            verdict: {
              type: Type.STRING,
              enum: ['MERGE APPROVED', 'MERGE BLOCKED', 'MANDATORY_HUMAN_REVIEW'],
              description: "The hard gate verdict"
            },
            stride_matrix: {
              type: Type.OBJECT,
              description: "STRIDE threat matrix findings"
            },
            ast_vuln_report: {
              type: Type.OBJECT,
              description: "AST traversal and vulnerabilities"
            },
            epistemic_escrow_events: {
              type: Type.INTEGER,
              description: "Number of ambiguous context events encountered"
            }
          },
          required: ["verdict", "stride_matrix", "ast_vuln_report", "epistemic_escrow_events"]
        }
      }
    });

    const text = response.text;
    if (text) {
        const parsed = JSON.parse(text);
        return {
            verdict: parsed.verdict,
            dccd_schema: {
                stride_matrix: parsed.stride_matrix,
                ast_vuln_report: parsed.ast_vuln_report
            },
            epistemic_escrow_events: parsed.epistemic_escrow_events
        };
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("CIPHER Audit Failed", error);
    return {
        verdict: 'MANDATORY_HUMAN_REVIEW',
        dccd_schema: {
            stride_matrix: {},
            ast_vuln_report: {}
        },
        epistemic_escrow_events: 1
    };
  }
};
