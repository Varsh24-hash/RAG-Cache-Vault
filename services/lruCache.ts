
import { CacheEntry } from '../types';

/**
 * Implements a true LRU (Least Recently Used) cache.
 * When capacity is reached, the oldest accessed item is evicted.
 */
export class LRUCache {
  private cache: Map<string, CacheEntry>;
  private capacity: number;
  private onEviction: () => void;

  constructor(capacity: number, onEviction: () => void) {
    this.cache = new Map();
    this.capacity = capacity;
    this.onEviction = onEviction;
  }

  get(key: string): CacheEntry | undefined {
    if (!this.cache.has(key)) return undefined;

    // To implement LRU: move the accessed key to the "end" (most recent)
    const entry = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry;
  }

  put(key: string, entry: CacheEntry): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict the least recently used (first item in the map iterator)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
      this.onEviction();
    }
    this.cache.set(key, entry);
  }

  get size(): number {
    return this.cache.size;
  }

  get maxCapacity(): number {
    return this.capacity;
  }
  
  clear(): void {
    this.cache.clear();
  }
}
