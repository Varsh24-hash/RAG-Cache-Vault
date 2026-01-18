
import { GoogleGenAI } from "@google/genai";
import { LRUCache } from "./lruCache";
import { Document, Metrics, MessageSource } from "../types";

const VAULT_DOCS: Document[] = [
  { id: '1', title: 'Cache Strategy', content: 'LRU eviction is better than TTL for RAG pipelines because it maintains high-frequency context regardless of time, preventing valid context from expiring just because it is old.' },
  { id: '2', title: 'System Architecture', content: 'The Vault system uses a multi-tier caching layer where keys are derived from the hash of the query and the retrieved context combined.' },
  { id: '3', title: 'Gemini 3 Pro', content: 'Gemini 3 Pro is a state-of-the-art multimodal model optimized for complex reasoning and long-context RAG applications.' },
  { id: '4', title: 'Retrieval Quality', content: 'Retrieval quality in RAG is measured by faithfulness and relevance. Our system uses semantic chunking to ensure context integrity.' }
];

export class RAGService {
  private cache: LRUCache;
  private ai: GoogleGenAI;
  private metrics: Metrics;
  private setMetrics: (m: Metrics) => void;

  constructor(
    capacity: number, 
    initialMetrics: Metrics, 
    setMetrics: (m: Metrics) => void,
    onEviction: () => void
  ) {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    this.cache = new LRUCache(capacity, onEviction);
    this.metrics = initialMetrics;
    this.setMetrics = setMetrics;
  }

  private simpleHash(s: string): string {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      const char = s.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(16);
  }

  private async retrieve(query: string): Promise<string[]> {
    // Simulated semantic retrieval
    const words = query.toLowerCase().split(/\W+/);
    return VAULT_DOCS
      .filter(doc => words.some(w => doc.content.toLowerCase().includes(w) || doc.title.toLowerCase().includes(w)))
      .map(doc => doc.content);
  }

  async processQuery(query: string): Promise<{
    response: string;
    source: MessageSource;
    latency: number;
    retrievedContext: string[];
  }> {
    const startTime = performance.now();
    
    // 1. Retrieval
    const context = await this.retrieve(query);
    const contextString = context.join('\n');
    
    // 2. Cache Key Generation (Hash of Query + Context)
    const cacheKey = this.simpleHash(query + contextString);
    
    // 3. Cache Lookup
    const cachedEntry = this.cache.get(cacheKey);
    
    if (cachedEntry) {
      const latency = Math.round(performance.now() - startTime);
      const updatedMetrics = {
        ...this.metrics,
        totalQueries: this.metrics.totalQueries + 1,
        cacheHits: this.metrics.cacheHits + 1,
        totalCacheLatency: this.metrics.totalCacheLatency + latency,
        currentCacheSize: this.cache.size
      };
      this.metrics = updatedMetrics;
      this.setMetrics(updatedMetrics);
      
      return {
        response: cachedEntry.response,
        source: 'cache',
        latency,
        retrievedContext: context
      };
    }

    // 4. Cache Miss -> LLM Generation
    const llmStartTime = performance.now();
    
    const prompt = `
      Instructions: Use the provided context to answer the question. 
      If the context is insufficient or the information is not present, use your internal knowledge to provide a direct and helpful answer.
      
      IMPORTANT: Do NOT include any disclaimers like "The provided context does not contain..." or "According to the context...". 
      Start your response directly with the answer to the user's question.
      
      Context: 
      ${contextString || "No specific documents found in vault."}
      
      User Question: ${query}
    `;

    try {
      const result = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      const response = result.text || "I couldn't generate a response.";
      const latency = Math.round(performance.now() - startTime);
      
      // Store in Cache
      this.cache.put(cacheKey, {
        key: cacheKey,
        response,
        context,
        timestamp: Date.now()
      });

      const updatedMetrics = {
        ...this.metrics,
        totalQueries: this.metrics.totalQueries + 1,
        cacheMisses: this.metrics.cacheMisses + 1,
        totalLlmLatency: this.metrics.totalLlmLatency + (performance.now() - llmStartTime),
        currentCacheSize: this.cache.size
      };
      this.metrics = updatedMetrics;
      this.setMetrics(updatedMetrics);

      return {
        response,
        source: 'gemini',
        latency,
        retrievedContext: context
      };
    } catch (error) {
      console.error("RAG Pipeline Error:", error);
      return {
        response: "An error occurred while processing your request.",
        source: 'system',
        latency: 0,
        retrievedContext: []
      };
    }
  }
}
