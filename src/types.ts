
export interface CharacterSet {
  id: string;
  name: string;
  characters: string[];
  isCustom?: boolean;
}

export interface AssistantResponse {
  character: string;
  description: string;
  usage: string;
}

export interface SymbolMetadata {
  description: string;
  usage: string;
}

export interface PaletteAction {
  type: 'CREATE' | 'DELETE' | 'ADD_CHAR' | 'REMOVE_CHAR';
  payload: any;
}

export interface TopologyNode {
  domain: string;
  context: string;
}

export interface PluriversalKnowledgeCapsule {
  latent_bridge: string;
  nodes: TopologyNode[];
}

export interface QuizQuestion {
  symbol: string;
  correctAnswer: string;
  options: string[];
}

export type StudyModeState = 'idle' | 'loading' | 'active' | 'finished';

// Project Aurelius: Geometric Cognition Types
export interface LatentTopologyRequest {
  base_concept: string;
  target_geometry: "Hyperbolic" | "Elliptic" | "Spherical" | "Riemannian";
  phantom_dimensions: number;
  curvature_bias: number; // -1.0 to 1.0
}

export interface PlausibilityMetric {
  ssim_estimate: number;
  physical_adherence: number;
  semantic_drift: number;
}

export interface TopologyResponse {
  meta_prompt: string;
  structural_constraints: string[];
  plausibility_score: PlausibilityMetric;
  provenance_trail: string[];
}

// Agentic Inversion: Plausibility Oracle & Epistemic Escrow Types
export interface EpistemicEscrowRequest {
  is_escrowed: boolean;
  cfd_index: number; // Confidence-Fidelity Divergence Index (0.0 to 1.0)
  ambiguity_source: string;
  clarifying_question: string;
}

export interface PlausibilityConstraint {
  is_valid: boolean;
  violated_constraint: string | null;
  justification: string | null;
  required_action: string | null;
}

export interface AgenticIntervention {
  type: 'ESCROW' | 'ORACLE_REJECTION';
  message: string;
  details: EpistemicEscrowRequest | PlausibilityConstraint;
}
