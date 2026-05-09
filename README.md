<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PolySymbol Pro

PolySymbol Pro is an advanced, AI-powered specialized character management and learning tool.
It enables users to curate, explore, and learn complex symbols across various academic domains (Mathematics, Linguistics, Physics).

View your app in AI Studio: https://ai.studio/apps/drive/1fji-gf4kzXXHhgDpLU_UzqhH3y6Otbzz

## Purpose
The primary goal of PolySymbol Pro is to provide a "Pluriversal Knowledge Capsule" interface. It goes beyond simple character copying by offering deep, context-aware metadata via the Gemini API, cross-domain topological mapping, and dynamic study generation.

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   `npm install`
2. Create a `.env.local` file in the root directory and set your API key:
   `GEMINI_API_KEY=your_api_key_here`
3. Start the development server:
   `npm run dev`

## Architecture & Concepts

This project adheres strictly to **SIC 2.1 Compliance**, managing complex state purely in-memory and avoiding synchronous storage APIs.

### Agentic Inversion
We employ a defensive layer that intercepts and evaluates user intent *before* execution:
* **Plausibility Oracle:** Validates architectural constraints, acting as an active constraint engine.
* **Epistemic Escrow:** Detects ambiguity and hidden assumptions in queries (measuring the Confidence-Fidelity Divergence Index) and halts execution to ask clarifying questions.

### Project Aurelius
An embedded experimentation zone for generative concepts:
* **Non-Euclidean Latent Spaces:** Simulates complex geometrical transformations on base concepts.
* **Provenance Tracking:** Analyzes and debiases prompts by identifying "Latent Semiotic Gravity".
* **Cross-Modal Fusion:** Converts prompts into hyper-spectral rendering specifications for advanced display hardware.

## Testing

Standalone unit tests are executed directly via Node:
* `npm run test:roundtrip` (executes `src/utils/testRoundtrip.cjs`)
* `node src/utils/testStudyMode.cjs`

## Documentation Reference
* [Forward-Thinking Product Features](docs/product_features.md)
* [Lessons Learned during Context Evaluation](docs/lessons_learned.md)
* [Architectural Decision Records (ADRs)](docs/adr/)
  * [ADR 0001: Adoption of CRDTs for Real-time Collaboration](docs/adr/0001-real-time-collaboration-crdt.md)
