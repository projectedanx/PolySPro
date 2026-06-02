<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# PolySymbol Pro

## TIER 1: Repository Identity & Ontological Glossary

**Repository Name:** PolySymbol Pro
**0xCARTO Synthesis Timestamp:** 2026-06-03T00:19:00+10:00
**Phronesis Confidence:** Φ = 0.04
**Ground Truth Score:** GDS = 0.95
**Undocumented Features Detected:** 0

**What This Repository Is**
PolySymbol Pro is a client-side React application built with Vite that acts as a "Pluriversal Knowledge Capsule". It employs a Semantic Parallax Zone to bridge injected server-side agent definitions (e.g., Next.js/Firestore/OpenAI in AGENTS.md) with a client-side isomorphic execution layer using the Gemini API. It enforces strict structural and epistemic constraints via a Plausibility Oracle and Epistemic Escrow.

**What This Repository Is NOT**
It is NOT a Next.js application, nor does it connect directly to a Firestore vector database for its core generative capabilities, despite the presence of server-side agent definitions in the documentation. It does not use synchronous local storage for state to maintain SIC 2.1 compliance.

**Ontological Glossary — Pluriversal Lexicon**

| Term | Location | Standard Equivalent | Local Meaning | Preservation Flag |
| :--- | :--- | :--- | :--- | :--- |
| `Semantic Parallax Zone` | `src/services/ragAgent.ts` | Adapter Pattern / Mock Layer | Implements a server-side API contract natively on the client to avoid architectural drift from `AGENTS.md` definitions. | [GOLDEN_SCAR] — L5 Paraconsistent State |
| `Plausibility Oracle` | `src/services/agentic/plausibilityOracle.ts` | Schema Validator | Acts as an active constraint engine enforcing structural boundaries before LLM execution. | [CULTURAL_ARTIFACT] |
| `Epistemic Escrow` | `src/services/agentic/epistemicEscrow.ts` | User Confirmation Dialog / Webhook Handler | Intercepts ambiguity and halts execution, particularly via Feishu Webhooks (KIRA-7 protocol), to demand interactive clarification. | [GOLDEN_SCAR] |
| `Symbolic Scar` | `SymbolicScar.json` | Error Log / Issue Tracker | A local registry of algorithmic traumas and preserved constraints preventing "Semantic Saponification". | [CULTURAL_ARTIFACT] |

## TIER 2: Architecture Topology Map

```mermaid
graph TD
    subgraph ENV["Environment Layer"]
        D1[.env.local]
        D2["SILENT_REQUIRED_ENV: GEMINI_API_KEY<br/>⚠️ Explicitly required for boot"]
    end

    subgraph APP["Application Layer (src/)"]
        A1[Entry Point<br/>src/main.tsx or index.tsx]
        A2[Vite/React Core<br/>src/App.tsx]
        A3["Semantic Parallax Zone<br/>src/services/ragAgent.ts"]
        A4["Epistemic Sentinel<br/>src/services/agentic/cipherSentinel.ts"]
    end

    subgraph AGENT["Agent Definitions"]
        AG1["AGENTS.md<br/>⚠️ NOMINATIVE TRAP: Defines Next.js/Firestore"]
    end

    subgraph CI["CI/CD Layer (.github/workflows/)"]
        C1["codeql.yml<br/>on: push, PR, schedule"]
    end

    subgraph TEST["Test Layer"]
        T1["npm run test:roundtrip<br/>src/utils/testRoundtrip.cjs"]
        T2["⚠️ PHANTOM TEST INFRASTRUCTURE<br/>Tests exist but are not run in CI/CD"]
    end

    D1 -->|configures| APP
    A1 --> A2
    A2 --> A3 & A4
    AG1 -.->|conceptually guides| A3
    CI -->|runs security scan| APP
    T1 -.->|manual execution only| APP

    classDef warning fill:#fef3c7,stroke:#d97706,color:#000
    classDef golden fill:#fde68a,stroke:#b45309,color:#000
    classDef phantom fill:#fee2e2,stroke:#dc2626,color:#000

    class D2,T2 warning
    class AG1 golden
    class T1 phantom
```

## TIER 3: CI/CD Pipeline Cartograph

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant GH as GitHub
    participant CQL as codeql.yml
    participant TST as Local Test Runner ⚠️

    Dev->>GH: git push (main/PR)
    GH->>CQL: trigger on:push/pull_request

    rect rgb(220, 252, 231)
        Note over CQL: Security Analysis Phase
        CQL->>CQL: Initialize CodeQL
        CQL->>CQL: Analyze javascript-typescript
        CQL-->>GH: Upload Security Events
    end

    rect rgb(254, 243, 199)
        Note over TST: ⚠️ ORPHANED TEST EXECUTION
        Note over TST: `npm run test:roundtrip` is defined in package.json
        Note over TST: but is never invoked automatically by any GitHub Action.
        Dev->>TST: Manual execution required
    end
```

## TIER 4: Dependency Matrix & Entropy Audit

Entropy Score: 0 = deterministic, 1 = fully chaotic. (Score: 0.10 - Excellent, due to exact pins)

| Dependency | Version Pin | Production? | CI Invoked? | Entropy Vector |
| :--- | :--- | :--- | :--- | :--- |
| `@google/genai` | `1.49.0` (exact pin) | ✅ Yes | ❌ No | ✅ LOW |
| `react` | `19.2.5` (exact pin) | ✅ Yes | ❌ No | ✅ LOW |
| `react-dom` | `19.2.5` (exact pin) | ✅ Yes | ❌ No | ✅ LOW |
| `typescript` | `5.8.3` (exact pin) | ❌ Dev only | ❌ No | ✅ LOW |
| `vite` | `6.4.2` (exact pin) | ❌ Dev only | ❌ No | ✅ LOW |
| `dotenv` | `17.4.2` (exact pin) | ❌ Dev only | ❌ No | ✅ LOW |

**Entropy Score by Layer:**
- Environment: 0.20 (1 Silent ENV var: `GEMINI_API_KEY`)
- Application Dependencies: 0.00 (All exact pins)
- CI Pipeline: 0.15 (Phantom test execution)
- **Overall Repository Entropy:** 0.12 (Target: < 0.15)

## TIER 5: Operational Runbook & Cultural Artifacts Log

**To Deploy / Run Locally:**
1. Clone the repository and execute `npm install`.
2. ⚠️ **SILENT_REQUIRED_ENV**: You MUST create a `.env.local` file and define `GEMINI_API_KEY=your_key`. The application will fail to initialize agentic services without this.
3. Start the development server with `npm run dev`.
4. Run validation tests manually via `npm run test:roundtrip`.

**Symbolic Scar Tissue Log — Cultural Artifacts**

- **Golden Scar #001: The Parallax Zone Adapter (`ragAgent.ts`)**
  - **Tension:** The `AGENTS.md` file defines a Next.js backend with Firestore vectors. The project is a Vite client-side app.
  - **Resolution:** Instead of rewriting `AGENTS.md` (Ontological Erasure) or breaking the client architecture, `ragAgent.ts` implements the Agent contract via isomorphic Gemini calls.

- **Golden Scar #002: Feishu Webhook Sovereignty (`epistemicEscrow.ts`)**
  - **Tension:** KIRA-7 protocols demand strict AES decryption and Challenge/Response webhook handling for Feishu integrations, utilizing `@larksuiteoapi/node-sdk`, maintaining 6900s token caching (SagaRecovery).
