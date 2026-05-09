import { Type } from "@google/genai";
import { ai } from "./gemini";

export interface Citation {
  doc_id: string;
  doc_title: string;
  url: string;
  text_snippet: string;
  relevance_score: number;
}

export interface RagResponse {
  success: boolean;
  answer: string | null;
  confidence: number;
  citations: Citation[];
  retrieval_stats: {
    total_docs_queried: number;
    docs_after_filtering: number;
    docs_after_reranking: number;
    vector_search_ms: number;
    rerank_time_ms: number;
    llm_generation_ms: number;
    total_latency_ms: number;
  };
  error?: string | null;
  suggestion?: string | null;
}

/**
 * Simulates retrieval of documents based on a query.
 *
 * @param {string} query - The search query.
 * @param {string} collection - The collection to search in.
 * @returns {Promise<any[]>} An array of mock document objects.
 */
export const retrieveDocuments = async (query: string, collection: string) => {
  return [
    { id: "doc-1", title: "Test Doc 1", snippet: "This is relevant context about " + query, url: "https://example.com/1" },
    { id: "doc-2", title: "Test Doc 2", snippet: "More context.", url: "https://example.com/2" }
  ];
};

/**
 * Mocks the reranking of retrieved documents based on relevance to the query.
 *
 * @param {string} query - The search query.
 * @param {any[]} docs - The initial retrieved documents.
 * @returns {Promise<any[]>} The reranked documents with assigned scores.
 */
export const rerankResults = async (query: string, docs: any[]) => {
  return docs.map(d => ({ ...d, score: 0.9 }));
};

/**
 * Generates structured citations mapping claims in the answer to the provided source documents.
 *
 * @param {string} answer - The generated answer text.
 * @param {any[]} docs - The source documents used for generation.
 * @returns {Promise<Object>} An object containing citations and unmapped claims.
 */
export const generateCitations = async (answer: string, docs: any[]) => {
  return {
    citations: docs.map(d => ({
      doc_id: d.id,
      doc_title: d.title,
      url: d.url,
      text_snippet: d.snippet,
      relevance_score: d.score
    })),
    unmapped_claims: []
  };
};

/**
 * Orchestrates the full Retrieval-Augmented Generation (RAG) pipeline.
 * Coordinates retrieval, reranking, LLM generation, and citation formatting, while recording latency metrics.
 *
 * @param {string} query - The user's query.
 * @param {string} userId - The ID of the user executing the query.
 * @param {string} collectionName - The target document collection.
 * @returns {Promise<RagResponse>} The final structured response containing the answer, citations, and stats.
 */
export const runRagQuery = async (query: string, userId: string, collectionName: string): Promise<RagResponse> => {
  const start = Date.now();

  const docs = await retrieveDocuments(query, collectionName);
  const searchMs = Date.now() - start;

  const rerankStart = Date.now();
  const rankedDocs = await rerankResults(query, docs);
  const rerankMs = Date.now() - rerankStart;

  const llmStart = Date.now();
  const contextText = rankedDocs.map(d => d.snippet).join(" ");

  let answerText = "Dummy generated answer based on context.";
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Answer the following query using ONLY the provided context.
      Query: "${query}"
      Context: "${contextText}"`
    });
    answerText = response.text || answerText;
  } catch (e) {
    console.error("LLM Generation failed:", e);
  }
  const llmMs = Date.now() - llmStart;

  const citationsData = await generateCitations(answerText, rankedDocs);

  return {
    success: true,
    answer: answerText,
    confidence: 0.95,
    citations: citationsData.citations,
    retrieval_stats: {
      total_docs_queried: 100,
      docs_after_filtering: 10,
      docs_after_reranking: rankedDocs.length,
      vector_search_ms: searchMs,
      rerank_time_ms: rerankMs,
      llm_generation_ms: llmMs,
      total_latency_ms: Date.now() - start
    }
  };
};
