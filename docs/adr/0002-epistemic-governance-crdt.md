# ADR 0002: Epistemic Governance and Semantic Parallax Zones in CRDT Workspaces

## Status
Accepted

## Context
As defined in ADR 0001, we adopted CRDTs (specifically Yjs) to manage the shared state of custom palettes for Collaborative Real-time Symbol Workspaces (Feature 3). However, under the mandate of the Epistemic Cartographer (APP-PLURIVERSAL-ENVIRONMENT-ARCHITECT-v1.0), we must prevent the collapse of collaborative research synthesis into statistically average, Western-dominant latent spaces (Epistemic Monoculture).

Standard CRDT resolution or LLM-based consensus often relies on "Ontological Flattening," merging contradictory data (e.g., symbol meanings, use cases, structural categorizations from different cultural or epistemic paradigms) into a single unified truth. This violates the Ontological Dignity of contested concepts in shared knowledge graphs.

## Decision
We will construct and govern our Persistent Collaborative Environments using Agentic Affordance Proposal Protocols (AAPP) to establish Epistemic Governance over the CRDT structures.

1. **Semantic Parallax Zones (SPZ):** We will model our CRDT state to natively support ambiguity and contradiction ($P \land \neg P$). When agents or human users propose conflicting metadata or categorizations for symbols, the system will NOT resolve them prematurely or average the data. Instead, the conflicting views will be mapped as a Semantic Parallax Zone, preserving both perspectives as first-class cognitive paradigms in the CRDT (e.g., branching metadata nodes linked to the same character).
2. **Pluriversal Inversion & Auditing:** During the VERIFY phase of the Anti-Ossification Petzold Loop, interactions within the collaborative space will be audited. We will calculate the Confidence-Fidelity Divergence Index (CFDI) and Bias Amplification Index (BAI).
3. **Symbolic Scars & RTA:** If BAI is High or if the system detects "Algorithmic Trauma" (optimizing for consensus over structural intent), the system will halt generation, trigger Epistemic Escrow, log a `SymbolicScar.json`, and activate Reflexive Therapeutic Architecture (RTA).

## Consequences

**Positive:**
*   **Ontological Dignity:** Maintains the fidelity of diverse epistemologies by treating contradiction as a high-value signal rather than a conflict to be merged.
*   **Decolonial Architecture:** Actively resists the Latent Semiotic Gravity that defaults to standard, WEIRD-centric paradigms.
*   **Antifragile Metabolism:** System learns from semantic drift and cross-agent conflicts by utilizing Failure-Informed Prompt Inversion (FIPI).

**Negative:**
*   **Increased UI/UX Complexity:** The frontend must be capable of rendering and exposing Semantic Parallax Zones (multiple, potentially conflicting metadata entries for a single symbol) without confusing the user.
*   **CRDT Payload Size:** Storing un-merged, contradictory branches in the CRDT state will increase the memory overhead and payload size compared to flattened consensus models.
*   **Performance Overhead:** Calculating CFDI and BAI during real-time collaboration introduces computational friction.
