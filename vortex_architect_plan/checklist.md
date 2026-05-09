# VORTEX-ARCHITECT: Rigorous Implementation Checklist

This checklist enforces the deterministic orchestration kernel and pluriversal planning mandates of VORTEX-ARCHITECT. It ensures that any codebase mutation adheres strictly to the defined "Negative Space Scaffolding."

## Phase 1: Architectural Boundaries & Initial Conditions
- [ ] **Topological Layer Inversion Rule Enforced:** Verify that base deterministic layers (Testing, CI/CD, Package Management) are compiling and passing *before* any architectural logic changes are initiated. Physical bounds precede design.
- [ ] **Semantic Lock Initialization:** Confirm that `+++ContextLock` decorators (or their programmatic equivalent) are established at the session's start to neutralize "Lost in the Middle" bias and anchor the core invariants.
- [ ] **Dependency Pinning Verified:** Assert that `package.json` contains strictly pinned semantic versions (no `^`, `~`, or wildcards), honoring the Superintendent's strict dependency protocol.

## Phase 2: Stigmergic Execution & Draft-Conditioned Synthesis
- [ ] **Zero-Collision Stigmergic Concurrency:** Verify the use of OS-level Semantic Mutex file locks (or isomorphic React equivalents like `useReducer` state guards) to prevent Abstract Syntax Tree (AST) collision during parallel operations.
- [ ] **Draft-Conditioned Constrained Decoding (DCCD) Active:** Ensure the cognitive generation pipeline separates the high-entropy draft phase from the low-entropy, deterministic output formatting. The Interpretive Fracture Coefficient ($C_d$) must approach zero.
- [ ] **Product-Requirements Prompt (PRP) Contract Validated:** Confirm that the executed task was bound by Preconditions (require), Postconditions (ensure), and Invariants (Semantic Anchors), rather than conversational ambiguity.

## Phase 3: Epistemic Immune Review
- [ ] **Anti-Saponification Check:** Review outputs to ensure zero semantic saponification. The system logic must not have degraded into generic, homogenized "corporate boilerplate."
- [ ] **Golden Scar Protocol (Anti-Sycophancy) Applied:** If an irreconcilable domain mismatch was encountered, verify that the conflict was NOT compromised. The tension must be held using the Golden Ratio dominance allocation.
- [ ] **Betti-1 ($\beta_1$) Loop Detection:** Analyze the generation cache/logs. Ensure no recursive hallucination loops (e.g., updating, failing, reverting a dependency repeatedly) have occurred. The Backtrack Index ($I_{bt}$) must be minimized.
- [ ] **Justified Uncertainty Report (JUR) / Epistemic Escrow:** If the Confidence-Fidelity Divergence Index (CFDI) crossed the threshold, confirm that execution was halted and placed in Epistemic Escrow, demanding human clarification rather than hallucinating an assumption.

## Phase 4: Autonomic Validation & Archive Integration
- [ ] **"Fix Until Green" Autonomic Loop Completed:** The task CANNOT be considered complete until linters, type checkers, and test suites (`npm run test:roundtrip`, `node test_aurelius.cjs`, etc.) pass reflexively.
- [ ] **Symbolic Scar Archive Updated:** If any topological logic failures or domain mismatches occurred during the sprint, log them precisely in `SymbolicScar.json` to enable Failure-Informed Prompt Inversion (FIPI).
- [ ] **Sprint Payload / Context Bundle (CxB) Generated:** Ensure the final commit and documentation update (e.g., in `.jules/superintendent.md` and `docs/lessons_learned.md`) encapsulate the thermodynamic metrics, capacity points, and dependency maps of this iteration.
