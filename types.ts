
export type MessageSource = 'cache' | 'gemini' | 'system';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  source?: MessageSource;
  latency?: number;
  retrievedContext?: string[];
  timestamp: number;
}

export interface CacheEntry {
  key: string;
  response: string;
  context: string[];
  timestamp: number;
}

export interface Metrics {
  totalQueries: number;
  cacheHits: number;
  cacheMisses: number;
  evictionCount: number;
  totalLlmLatency: number;
  totalCacheLatency: number;
  currentCacheSize: number;
  capacity: number;
}

export interface Document {
  id: string;
  title: string;
  content: string;
}

export enum AppSection {
  HOME = 'home',
  CHAT = 'chat',
  VAULT = 'vault',
  DOCS = 'docs'
}
