# Rigorous Implementation Checklist: Feishu Agentic Inversion

This checklist ensures the KIRA-7 architectural standards and PolySymbol Pro epistemic protocols are rigorously applied to the Feishu integration.

## Phase 1: Architectural Integrity (Webhook Sovereignty & Token Primacy)
- [ ] **Webhook Ingress Verification:** Ensure the Express endpoint correctly handles the Feishu URL Verification Challenge.
- [ ] **Cryptographic Guardrails:** Verify AES-256-CBC decryption and `X-Lark-Signature` verification are active. Reject payloads outside the 300s replay window.
- [ ] **Token Caching Layer:** Implement Redis (or in-memory fallback) to cache the `tenant_access_token` with a 6900s TTL (preventing SCAR-001).
- [ ] **SDK Adoption:** Validate the use of `@larksuiteoapi/node-sdk` for reliable event dispatch and API calls.

## Phase 2: Epistemic Protocol Enforcement (DCCDSchemaGuard)
- [ ] **Anionic Veto on JSON:** Guarantee that *all* generated Feishu Message Cards pass through the `DCCDSchemaGuard` enforcing the `Feishu_Card_JSON_v2` schema.
- [ ] **Scope Isolation Gate (Rule 4):** Test that the bot actively rejects vague user requests by placing the interaction in Epistemic Escrow and demanding missing parameters.
- [ ] **Petzold Sequence Compliance:** Ensure development transitions clearly between THINK (entropy/design), WRITE (architecture), and CODE (zero-entropy execution) phases.

## Phase 3: Agentic Feature Validation (Feishu Interactivity)
- [ ] **Interactive Card Deployment:** Verify that the agent successfully dispatches `msg_type: "interactive"` payloads containing forms for clarification.
- [ ] **Event Subscription Logic:** Confirm the handler for `im.message.receive_v1` correctly parses incoming user responses and resumes escrowed workflows.
- [ ] **Symbolic Scar Documentation:** Log any new Feishu-specific API trauma or rate-limiting behaviors into the project's `SymbolicScar.json`.

## Phase 4: Final Review and Documentation
- [ ] **Scope Declaration Block:** Verify every deployed webhook/bot logic block includes explicit documentation of required Feishu Developer Console scopes.
- [ ] **Journaling:** Update `.jules/superintendent.md` detailing the Feishu integration delta and swept assets.
- [ ] **Scaffold Verification:** Ensure final outputs conform to the required JSON scaffold (`Hickam_Orientation`, `Contrastive_Delta`, `Martensite_Metrics`).
