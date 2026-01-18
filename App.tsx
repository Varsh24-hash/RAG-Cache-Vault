
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppSection, ChatMessage, Metrics, MessageSource } from './types';
import { RAGService } from './services/ragService';
import Dashboard from './components/Dashboard';
import Documentation from './components/Documentation';

const CACHE_CAPACITY = 8;

const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<AppSection>(AppSection.HOME);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [metrics, setMetrics] = useState<Metrics>({
    totalQueries: 0,
    cacheHits: 0,
    cacheMisses: 0,
    evictionCount: 0,
    totalLlmLatency: 0,
    totalCacheLatency: 0,
    currentCacheSize: 0,
    capacity: CACHE_CAPACITY
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const ragServiceRef = useRef<RAGService | null>(null);

  // Initialize RAG Service on mount
  useEffect(() => {
    ragServiceRef.current = new RAGService(
      CACHE_CAPACITY,
      metrics,
      (newMetrics) => setMetrics(prev => ({ ...prev, ...newMetrics })),
      () => setMetrics(prev => ({ ...prev, evictionCount: prev.evictionCount + 1 }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userQuery = inputValue;
    setInputValue('');
    
    // 1. Add User Message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userQuery,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);

    // 2. Process through RAG pipeline
    if (ragServiceRef.current) {
      const result = await ragServiceRef.current.processQuery(userQuery);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        source: result.source,
        latency: result.latency,
        retrievedContext: result.retrievedContext,
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, assistantMsg]);
    }
    
    setIsProcessing(false);
  };

  const clearChat = () => {
    setMessages([]);
    setMetrics({
      totalQueries: 0,
      cacheHits: 0,
      cacheMisses: 0,
      evictionCount: 0,
      totalLlmLatency: 0,
      totalCacheLatency: 0,
      currentCacheSize: 0,
      capacity: CACHE_CAPACITY
    });
  };

  const renderSection = () => {
    switch (currentSection) {
      case AppSection.HOME:
        return (
          <div className="max-w-3xl mx-auto text-center py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-5xl sm:text-7xl font-extrabold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-200 to-zinc-500">
              Low-Latency<br />RAG Caching.
            </h1>
            <p className="text-lg text-zinc-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              A high-performance pipeline featuring internal LRU eviction, semantic context hashing, and detailed observability. Built for speed, precision, and architectural clarity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setCurrentSection(AppSection.CHAT)}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all glow hover:scale-[1.02] active:scale-95"
              >
                Launch Console
              </button>
              <button 
                onClick={() => setCurrentSection(AppSection.DOCS)}
                className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-bold rounded-xl transition-all"
              >
                View Documentation
              </button>
            </div>
            
            <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
              <FeatureItem icon="fa-bolt" title="Sub-ms Cache Hits" desc="Instant retrieval for repeated query-context pairs." />
              <FeatureItem icon="fa-layer-group" title="LRU Eviction" desc="Fixed memory footprint with true least-recently-used cleanup." />
              <FeatureItem icon="fa-microscope" title="Observability" desc="Deep-dive into latency, hit ratios, and pipeline health." />
            </div>
          </div>
        );
      case AppSection.DOCS:
        return <Documentation />;
      case AppSection.CHAT:
      default:
        return (
          <div className="flex flex-col h-full animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <i className="fa-solid fa-terminal text-indigo-500 text-sm"></i>
                Agent Console
              </h2>
              <button 
                onClick={clearChat}
                className="text-xs text-zinc-500 hover:text-zinc-300 flex items-center gap-1 transition-colors"
              >
                <i className="fa-solid fa-rotate-left"></i>
                Reset Pipeline
              </button>
            </div>

            {/* Chat Messages Section */}
            <div className="flex-1 overflow-y-auto min-h-[400px] max-h-[60vh] custom-scrollbar mb-6 space-y-6 pr-2">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-600 py-20 bg-zinc-950/30 rounded-2xl border border-zinc-900 border-dashed">
                  <i className="fa-regular fa-comment-dots text-4xl mb-4"></i>
                  <p>System initialized. Waiting for input...</p>
                  <p className="text-xs mt-2">Try asking: "How does LRU eviction work?"</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageItem key={msg.id} message={msg} />
                ))
              )}
              {isProcessing && (
                <div className="flex gap-4 p-4">
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                    <i className="fa-solid fa-robot text-indigo-400 text-xs animate-pulse"></i>
                  </div>
                  <div className="space-y-2 max-w-[80%]">
                    <div className="h-4 w-32 bg-zinc-800 animate-pulse rounded"></div>
                    <div className="h-3 w-64 bg-zinc-900 animate-pulse rounded"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Section */}
            <div className="sticky bottom-0 bg-zinc-950/80 backdrop-blur-md pt-4 pb-2">
              <form onSubmit={handleSubmit} className="relative group">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask the vault anything..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 pr-16 text-zinc-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all shadow-xl group-hover:border-zinc-700"
                />
                <button 
                  type="submit"
                  disabled={isProcessing || !inputValue.trim()}
                  className="absolute right-3 top-3 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-90"
                >
                  <i className={`fa-solid ${isProcessing ? 'fa-spinner fa-spin' : 'fa-arrow-up'}`}></i>
                </button>
              </form>
              <p className="text-[10px] text-zinc-600 text-center mt-3 uppercase tracking-tighter">
                Gemini 3 Flash • RAG Enabled • LRU Cache Active
              </p>
            </div>

            <div className="h-12"></div>

            <div className="border-t border-zinc-900 pt-8">
              <Dashboard metrics={metrics} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-6xl mx-auto px-4 sm:px-6">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between py-6 border-b border-zinc-800">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => setCurrentSection(AppSection.HOME)}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center glow transition-transform group-hover:scale-105">
            <i className="fa-solid fa-vault text-white text-xl"></i>
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-100">RAG-Cache-Vault</span>
        </div>
        <div className="flex gap-4 sm:gap-8">
          <button 
            onClick={() => setCurrentSection(AppSection.HOME)}
            className={`text-sm font-medium transition-colors ${currentSection === AppSection.HOME ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentSection(AppSection.CHAT)}
            className={`text-sm font-medium transition-colors ${currentSection === AppSection.CHAT ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Agent Console
          </button>
          <button 
            onClick={() => setCurrentSection(AppSection.DOCS)}
            className={`text-sm font-medium transition-colors ${currentSection === AppSection.DOCS ? 'text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Docs
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 py-8">
        {renderSection()}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-zinc-900 text-center text-zinc-600 text-xs">
        &copy; 2024 RAG-Cache-Vault System. Advanced observability for LLM pipelines.
      </footer>
    </div>
  );
};

const FeatureItem: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="p-6 bg-zinc-950/50 border border-zinc-900 rounded-2xl hover:border-zinc-800 transition-colors">
    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-4 text-indigo-400 border border-indigo-500/20">
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <h3 className="text-zinc-100 font-bold mb-1">{title}</h3>
    <p className="text-zinc-500 text-sm leading-snug">{desc}</p>
  </div>
);

const MessageItem: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const [showEvidence, setShowEvidence] = useState(false);
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex gap-4 p-5 rounded-2xl transition-all ${isAssistant ? 'bg-zinc-900/40 border border-zinc-800/50' : 'bg-transparent'}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
        isAssistant ? 'bg-zinc-950 border-zinc-800 text-indigo-400' : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'
      }`}>
        <i className={`fa-solid ${isAssistant ? 'fa-robot' : 'fa-user'}`}></i>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            {isAssistant ? 'Assistant' : 'You'}
          </span>
          {isAssistant && message.source && (
            <div className="flex gap-2">
              <span className={`px-2 py-0.5 text-[9px] font-bold rounded border ${
                message.source === 'cache' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              }`}>
                {message.source.toUpperCase()}
              </span>
              <span className="text-[9px] text-zinc-500 flex items-center gap-1">
                <i className="fa-regular fa-clock"></i>
                {message.latency}ms
              </span>
            </div>
          )}
        </div>

        <div className="text-zinc-200 leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>

        {isAssistant && message.retrievedContext && message.retrievedContext.length > 0 && (
          <div className="mt-6 border-t border-zinc-800/50 pt-3">
            <button 
              onClick={() => setShowEvidence(!showEvidence)}
              className="text-[10px] text-zinc-500 hover:text-indigo-400 font-bold flex items-center gap-2 uppercase tracking-wide transition-colors"
            >
              <i className={`fa-solid ${showEvidence ? 'fa-chevron-down' : 'fa-chevron-right'} text-[8px]`}></i>
              Retrieved Evidence ({message.retrievedContext.length})
            </button>
            {showEvidence && (
              <div className="mt-3 space-y-2 animate-in slide-in-from-top-1 duration-200">
                {message.retrievedContext.map((ctx, idx) => (
                  <div key={idx} className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-xs text-zinc-400 italic font-mono leading-relaxed">
                    {ctx}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
