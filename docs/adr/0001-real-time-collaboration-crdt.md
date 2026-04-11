# ADR 0001: Adoption of CRDTs for Real-time Collaboration

## Status
Proposed

## Context
The PolySymbol Pro application currently manages custom palette state locally using React's `useReducer`. This fulfills "SIC 2.1 Compliance" by keeping data in-memory and avoiding synchronous `localStorage` calls. However, our product roadmap (Feature 3: Collaborative Real-time Symbol Workspaces) requires multiple users to edit the same custom palette concurrently over a network.

If we attempt to use standard state replacement (e.g., sending the entire `palette` array over WebSockets), concurrent edits will overwrite each other, leading to data loss and race conditions. Operational Transformation (OT) requires a central, authoritative server to sequence operations, which introduces a single point of failure and high latency for a globally distributed tool.

## Decision
We will adopt a **Conflict-free Replicated Data Type (CRDT)** architecture to manage the shared state of custom palettes.

Specifically, we will integrate **Yjs** as the CRDT implementation.

*   The local `useReducer` state for custom palettes will be replaced by a `Y.Array` or `Y.Map`.
*   React components will subscribe to changes in the Yjs data structures rather than the local reducer state.
*   Synchronization between clients will initially utilize WebSockets (`y-websocket`) for simplicity, with the architectural flexibility to move to WebRTC (`y-webrtc`) for peer-to-peer syncing if server costs become a constraint.

## Consequences

**Positive (The 'Why'):**
*   **Eventual Consistency:** Guarantees that all users will converge on the exact same palette state, regardless of the order in which edits are received or network latency.
*   **Offline Support:** Users can continue editing their palettes while disconnected. Once reconnected, the CRDT will mathematically resolve all conflicts without user intervention.
*   **Decentralization Potential:** Lays the groundwork for true peer-to-peer collaboration, reducing reliance on centralized backend infrastructure.

**Negative (Trade-offs):**
*   **Complexity:** Introduces a paradigm shift in how frontend engineers reason about state. They can no longer use simple reassignment; they must use Yjs mutation methods.
*   **Memory Overhead:** CRDTs store tombstones (records of deleted items) to resolve conflicts. For highly active palettes, this could increase the memory footprint over time, requiring periodic garbage collection or snapshotting on the server.
*   **Integration Friction:** Binding Yjs to React requires specific connector libraries (e.g., `y-react` or custom hooks) to trigger re-renders correctly when the underlying CRDT mutates.

## References
* [Product Features Roadmap](../product_features.md)
* [Yjs Documentation](https://docs.yjs.dev/)
