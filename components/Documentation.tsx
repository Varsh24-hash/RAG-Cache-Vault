
import React from 'react';

const Documentation: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Hero Header */}
      <header className="mb-16 border-b border-zinc-800 pb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight text-zinc-100">
          Low-Latency RAG Caching
        </h1>
        <p className="text-xl text-zinc-400 leading-relaxed italic border-l-2 border-indigo-500 pl-6">
          "A high-performance caching layer designed specifically for <strong>Retrieval-Augmented Generation (RAG)</strong> systems. This pipeline minimizes end-to-end latency by reusing semantically equivalent query–context pairs while maintaining correctness, observability, and memory safety."
        </p>
      </header>

      <section className="space-y-16">
        {/* Overview */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
            <i className="fa-solid fa-eye text-indigo-500 text-sm"></i>
            Overview
          </h2>
          <p className="text-zinc-400 leading-relaxed mb-8">
            Traditional RAG pipelines repeatedly perform expensive retrieval and embedding operations—even for similar or identical queries. 
            <strong> Low-Latency RAG Caching</strong> solves this by introducing a semantic-aware cache that sits between the retriever and the generator.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GoalCard icon="⚡" title="Speed" desc="Sub-millisecond response times for repeated queries" />
            <GoalCard icon="🧠" title="Intelligence" desc="Semantic-aware cache keys (not naive string matching)" />
            <GoalCard icon="♻️" title="Safety" desc="Predictable memory usage with LRU eviction" />
            <GoalCard icon="📊" title="Insight" desc="Deep observability into cache and pipeline behavior" />
          </div>
        </div>

        {/* Architecture */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-sitemap text-indigo-500 text-sm"></i>
            Architecture
          </h2>
          <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 font-mono text-sm text-indigo-300 overflow-x-auto leading-relaxed">
{`User Query
   ↓
Semantic Context Hasher
   ↓
Cache Lookup (LRU)
   ├─ HIT  → Return Cached Context
   └─ MISS → Retriever → Store → Return
   ↓
LLM Generator`}
          </pre>
          
          <div className="mt-8 space-y-6">
             <ComponentDetail 
               num="1" 
               title="Semantic Context Hashing" 
               items={[
                 "Converts (query + retrieved context) into a stable semantic hash",
                 "Prevents cache misses due to superficial text variations",
                 "Ensures logically equivalent queries map to the same key"
               ]} 
             />
             <ComponentDetail 
               num="2" 
               title="LRU Cache Engine" 
               items={[
                 "Fixed memory footprint with deterministic behavior",
                 "Automatically evicts least recently used entries",
                 "Optimized for high-concurrency reads and writes"
               ]} 
             />
             <ComponentDetail 
               num="3" 
               title="RAG Pipeline Integration" 
               items={[
                 "Cache sits transparently inside the RAG flow",
                 "No changes required to the underlying LLM",
                 "Pluggable with existing vector databases and retrievers"
               ]} 
             />
          </div>
        </div>

        {/* Features */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-star text-indigo-500 text-sm"></i>
            Key Features
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <FeatureRow 
              icon="🚀" 
              title="Sub-ms Cache Hits" 
              desc="Repeated query–context pairs are returned instantly, bypassing retrieval and embedding steps entirely." 
            />
            <FeatureRow 
              icon="♻️" 
              title="True LRU Eviction" 
              desc="Deterministic memory usage. No stale or unbounded cache growth. Ideal for mission-critical production systems." 
            />
            <FeatureRow 
              icon="📊" 
              title="Observability & Metrics" 
              desc="Track system health through hit/miss ratios, average latency per stage, eviction counts, and throughput." 
            />
          </div>
        </div>

        {/* Code Example */}
        <div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-code text-indigo-500 text-sm"></i>
            API Usage (Conceptual)
          </h2>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="bg-zinc-900 px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Python / Logic</span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
                <div className="w-2 h-2 rounded-full bg-zinc-700"></div>
              </div>
            </div>
            <pre className="p-6 font-mono text-sm text-zinc-300 leading-relaxed overflow-x-auto">
{`# 1. Lookup cache using query and potential context
result = cache.get(query, context)

if result is None:
    # 2. On miss, perform heavy retrieval
    context = retriever.retrieve(query)
    
    # 3. Store result in LRU cache
    cache.put(query, context)

# 4. Generate final response
response = llm.generate(query, context)`}
            </pre>
          </div>
        </div>

        {/* Performance & Config Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-zinc-100 mb-4">Performance Impact</h3>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="py-3 font-semibold text-zinc-500">Scenario</th>
                  <th className="py-3 font-semibold text-zinc-500 text-right">Avg Latency</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-900">
                  <td className="py-3">No Cache</td>
                  <td className="py-3 text-right">800–1200 ms</td>
                </tr>
                <tr className="border-b border-zinc-900">
                  <td className="py-3">Cache Miss</td>
                  <td className="py-3 text-right">700–900 ms</td>
                </tr>
                <tr className="border-b border-zinc-900">
                  <td className="py-3 text-indigo-400 font-bold">Cache Hit</td>
                  <td className="py-3 text-right text-emerald-400 font-mono font-bold">&lt; 5 ms</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100 mb-4">Configuration</h3>
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="py-3 font-semibold text-zinc-500">Parameter</th>
                  <th className="py-3 font-semibold text-zinc-500">Value</th>
                </tr>
              </thead>
              <tbody className="text-zinc-400">
                <tr className="border-b border-zinc-900">
                  <td className="py-3 font-mono text-xs">cache_size</td>
                  <td className="py-3">Max capacity entries</td>
                </tr>
                <tr className="border-b border-zinc-900">
                  <td className="py-3 font-mono text-xs">eviction</td>
                  <td className="py-3">LRU (default)</td>
                </tr>
                <tr className="border-b border-zinc-900">
                  <td className="py-3 font-mono text-xs">strategy</td>
                  <td className="py-3">Semantic Hash</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Best Practices */}
        <div className="bg-indigo-600/5 border border-indigo-500/20 rounded-2xl p-8">
           <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center gap-2">
            <i className="fa-solid fa-lightbulb text-indigo-400 text-sm"></i>
            Best Practices
          </h2>
          <ul className="space-y-4 text-zinc-400">
            <li className="flex items-start gap-3">
              <span className="text-indigo-500 mt-1">•</span>
              <span>Use <strong>semantic hashing</strong> for user-facing queries to handle synonyms.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500 mt-1">•</span>
              <span>Tune <strong>cache size</strong> based on unique query diversity in your dataset.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500 mt-1">•</span>
              <span>Monitor <strong>hit ratio</strong> to validate the effectiveness of the context hash.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-indigo-500 mt-1">•</span>
              <span>Combine with <strong>vector databases</strong> for optimal high-recall performance.</span>
            </li>
          </ul>
        </div>

        {/* Summary Footer */}
        <footer className="text-center py-12 border-t border-zinc-800">
          <p className="text-zinc-500 text-sm leading-relaxed max-w-2xl mx-auto">
            Low-Latency RAG Caching is built for production-grade AI systems where speed, correctness, and observability matter. 
            By eliminating redundant retrieval work, it significantly improves responsiveness and reduces infrastructure costs.
          </p>
          <div className="mt-8 font-bold text-zinc-300 tracking-tighter uppercase text-xs space-x-4">
             <span>Designed for speed</span>
             <span className="text-zinc-700">•</span>
             <span>Built for scale</span>
             <span className="text-zinc-700">•</span>
             <span>Engineered for clarity</span>
          </div>
        </footer>
      </section>
    </div>
  );
};

const GoalCard: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg flex items-center gap-4">
    <div className="text-2xl">{icon}</div>
    <div>
      <h4 className="text-zinc-200 font-bold text-sm">{title}</h4>
      <p className="text-zinc-500 text-xs">{desc}</p>
    </div>
  </div>
);

const ComponentDetail: React.FC<{ num: string; title: string; items: string[] }> = ({ num, title, items }) => (
  <div className="flex gap-4">
    <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 text-xs font-bold text-zinc-400">
      {num}
    </div>
    <div>
      <h4 className="text-zinc-200 font-bold mb-2 uppercase tracking-wide text-xs">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-zinc-500 text-sm flex items-center gap-2">
            <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const FeatureRow: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex gap-6 items-start">
    <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-xl flex items-center justify-center text-xl shrink-0">
      {icon}
    </div>
    <div>
      <h4 className="text-zinc-100 font-bold mb-1">{title}</h4>
      <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Documentation;
