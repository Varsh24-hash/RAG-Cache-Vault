
import React from 'react';
import { Metrics } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  metrics: Metrics;
}

const Dashboard: React.FC<DashboardProps> = ({ metrics }) => {
  const hitRatio = metrics.totalQueries > 0 
    ? ((metrics.cacheHits / metrics.totalQueries) * 100).toFixed(1) 
    : '0';

  const avgLlmLatency = metrics.cacheMisses > 0 
    ? (metrics.totalLlmLatency / metrics.cacheMisses).toFixed(0) 
    : '0';

  const avgCacheLatency = metrics.cacheHits > 0 
    ? (metrics.totalCacheLatency / metrics.cacheHits).toFixed(0) 
    : '0';

  const capacityPercentage = (metrics.currentCacheSize / metrics.capacity) * 100;

  const chartData = [
    { name: 'Cache Hits', value: metrics.cacheHits, color: '#10b981' },
    { name: 'Cache Misses', value: metrics.cacheMisses, color: '#f43f5e' }
  ];

  return (
    <div className="w-full mt-12 bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 transition-all duration-500 overflow-hidden">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            <i className="fa-solid fa-chart-line text-indigo-500"></i>
            Pipeline Observability
          </h2>
          <p className="text-sm text-zinc-500">Real-time telemetry and LRU cache tracking</p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-full border border-emerald-500/20 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            ACTIVE
          </span>
          {metrics.evictionCount > 0 && (
            <span className="px-3 py-1 bg-amber-500/10 text-amber-500 text-xs font-semibold rounded-full border border-amber-500/20">
              EVICTING
            </span>
          )}
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard 
          label="Total Queries" 
          value={metrics.totalQueries} 
          icon="fa-circle-nodes" 
          color="text-blue-400"
        />
        <MetricCard 
          label="Cache Hit Ratio" 
          value={`${hitRatio}%`} 
          icon="fa-bolt" 
          color="text-emerald-400"
        />
        <MetricCard 
          label="Eviction Count" 
          value={metrics.evictionCount} 
          icon="fa-trash-can" 
          color="text-rose-400"
        />
        <MetricCard 
          label="Avg Latency (ms)" 
          value={metrics.totalQueries > 0 ? ((metrics.totalLlmLatency + metrics.totalCacheLatency) / metrics.totalQueries).toFixed(0) : '0'} 
          icon="fa-clock" 
          color="text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Latency Comparison */}
        <div className="lg:col-span-1 bg-zinc-950/50 p-5 rounded-lg border border-zinc-800">
          <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Latency Comparison</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-zinc-500">Cached Response</span>
                <span className="text-emerald-400 font-mono">{avgCacheLatency}ms</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: metrics.totalQueries > 0 ? `${(Number(avgCacheLatency) / (Number(avgLlmLatency) || 1000)) * 100}%` : '0%' }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span className="text-zinc-500">Gemini LLM Generation</span>
                <span className="text-rose-400 font-mono">{avgLlmLatency}ms</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 w-full"></div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[10px] text-zinc-600 italic">
            * LRU cache significantly reduces compute costs and improves user UX by serving recurring context instantly.
          </p>
        </div>

        {/* Cache Usage */}
        <div className="lg:col-span-1 bg-zinc-950/50 p-5 rounded-lg border border-zinc-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Cache Capacity (LRU)</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-3xl font-bold text-zinc-100">{metrics.currentCacheSize}</span>
              <span className="text-zinc-500 mb-1">/ {metrics.capacity} entries</span>
            </div>
            <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden mb-2">
              <div 
                className={`h-full transition-all duration-500 ${capacityPercentage > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                style={{ width: `${capacityPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="text-xs text-zinc-500 space-y-1">
             <p className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
               Size reflects unique (query + context) pairs.
             </p>
             <p className="flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-amber-500"></span>
               Oldest accessed entries are evicted at {metrics.capacity}.
             </p>
          </div>
        </div>

        {/* Distribution Chart */}
        <div className="lg:col-span-1 bg-zinc-950/50 p-5 rounded-lg border border-zinc-800 min-h-[180px]">
          <h3 className="text-sm font-semibold text-zinc-400 mb-4 uppercase tracking-wider">Query Distribution</h3>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10, fill: '#71717a' }} />
              <Tooltip 
                cursor={{ fill: 'transparent' }} 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '4px', fontSize: '10px' }} 
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string | number; icon: string; color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-zinc-950/40 border border-zinc-800 p-4 rounded-lg flex items-center gap-4">
    <div className={`w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 ${color}`}>
      <i className={`fa-solid ${icon}`}></i>
    </div>
    <div>
      <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{label}</p>
      <p className="text-xl font-bold text-zinc-100">{value}</p>
    </div>
  </div>
);

export default Dashboard;
