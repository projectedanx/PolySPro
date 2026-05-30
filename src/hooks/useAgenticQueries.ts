import { useState } from 'react';
import { generateSemanticSearch, modulatePhantomDimensions } from '../services/gemini';
import { calculateCFDI, isArchitecturallyPlausible } from '../services/agentic/cipherSentinel';

export function useAgenticQueries() {
  const [assistantQuery, setAssistantQuery] = useState('');
  const [topologyTarget, setTopologyTarget] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [phantomDimensions, setPhantomDimensions] = useState<string[]>([]);
  const [plausibilityScore, setPlausibilityScore] = useState<number | null>(null);

  // Expose error state for intervention
  const [interventionPending, setInterventionPending] = useState(false);
  const [interventionPrompt, setInterventionPrompt] = useState('');

  const runAssistant = async () => {
    if (!assistantQuery.trim()) return;
    setAssistantLoading(true);
    setAssistantResult(null);
    setAgenticIntervention(null);
    try {
      // Epistemic Escrow Check
      const escrowCheck = await evaluateEpistemicEscrow(assistantQuery);
      if (escrowCheck && escrowCheck.is_escrowed) {
        setAgenticIntervention({
          type: 'ESCROW',
          message: "Epistemic Escrow Triggered: Interpretive Fracture Detected.",
          details: escrowCheck
        });
        return;
      }

      const res = await findSymbol(assistantQuery);
      setAssistantResult(res);
      // Automatically cache results from assistant
      if (res) {
        setMetadataCache(prev => ({
          ...prev,
          [res.character]: { description: res.description, usage: res.usage }
        }));
      }
    } finally {
      setAssistantLoading(false);
    }
  }

  const runTopologyMiner = async () => {
    if (!topologyQuery.trim()) return;
    setTopologyLoading(true);
    setTopologyResult(null);
    setAgenticIntervention(null);
    try {
      // Plausibility Oracle Check
      const constraints = [
        "Must not invoke server-side specific language or APIs",
        "Must be purely conceptual or client-side abstract",
        "Must not request direct database manipulation"
      ];
      const plausibilityCheck = await checkPlausibility(topologyQuery, constraints);

      if (plausibilityCheck && !plausibilityCheck.is_valid) {
        setAgenticIntervention({
          type: 'ORACLE_REJECTION',
          message: "Plausibility Oracle: Structural Constraint Violation.",
          details: plausibilityCheck
        });
        return;
      }

      const res = await mineTopology(topologyQuery);
      setTopologyResult(res);
    } finally {
      setTopologyLoading(false);
    }
  }

  return {
    assistantQuery,
    setAssistantQuery,
    topologyTarget,
    setTopologyTarget,
    isProcessing,
    phantomDimensions,
    plausibilityScore,
    interventionPending,
    interventionPrompt,
    setInterventionPending,
    runAssistant,
    runTopologyMiner
  };
}
