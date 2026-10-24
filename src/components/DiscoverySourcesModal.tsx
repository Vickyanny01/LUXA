import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Cpu,
  Layers,
  Globe,
  Database,
  CheckCircle2,
  Clock,
  AlertCircle,
  Code2,
  ArrowRight,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { DiscoverySourceStatus, SearchIntent } from '../types/index';

interface DiscoverySourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscoverySourcesModal: React.FC<DiscoverySourcesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [sources, setSources] = useState<DiscoverySourceStatus[]>([]);
  const [stats, setStats] = useState<{ total_listings: number; demo_listings: number; registered_seller_listings: number; sellers_count: number }>({
    total_listings: 0,
    demo_listings: 0,
    registered_seller_listings: 0,
    sellers_count: 0,
  });

  // Sandbox Intent Tester state
  const [testQuery, setTestQuery] = useState('I need a wireless microphone for recording music at home under 50,000 naira');
  const [testResult, setTestResult] = useState<SearchIntent | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const data = await api.getDiscoverySources();
      setSources(data.sources);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to load discovery sources:', err);
    }
  };

  const handleRunTest = async () => {
    if (!testQuery.trim()) return;
    setIsTesting(true);
    try {
      const res = await api.parseIntent(testQuery);
      setTestResult(res);
    } catch (err) {
      console.error('Intent test failed:', err);
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-emerald-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Discovery Architecture & AI Engine Transparency
              </h2>
              <p className="text-xs text-neutral-500">
                Modular multi-source discovery pipeline conforming to LUXA accuracy specifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">Total Catalog</span>
              <strong className="text-xl font-extrabold text-neutral-950 font-sans">{stats.total_listings}</strong>
              <span className="text-[11px] text-neutral-400 block mt-0.5">Listings in database</span>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
              <span className="text-neutral-500 block text-[10px] uppercase font-bold">Local Merchants</span>
              <strong className="text-xl font-extrabold text-neutral-950 font-sans">{stats.sellers_count}</strong>
              <span className="text-[11px] text-neutral-400 block mt-0.5">Ado-Ekiti & Nigeria</span>
            </div>
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200">
              <span className="text-amber-800 block text-[10px] uppercase font-bold">Demo Seed Data</span>
              <strong className="text-xl font-extrabold text-amber-950 font-sans">{stats.demo_listings}</strong>
              <span className="text-[11px] text-amber-700 block mt-0.5">Visibly labelled (Rule 3)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-emerald-800 block text-[10px] uppercase font-bold">Live Registered</span>
              <strong className="text-xl font-extrabold text-emerald-950 font-sans">{stats.registered_seller_listings}</strong>
              <span className="text-[11px] text-emerald-700 block mt-0.5">From authenticated sellers</span>
            </div>
          </div>

          {/* Discovery Sources Grid */}
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
              Configured Discovery Sources (Section 6)
            </h3>
            <div className="space-y-3">
              {sources.map((src) => {
                const isOp = src.status === 'operational';
                const isFallback = src.status === 'simulated_fallback';
                return (
                  <div
                    key={src.id}
                    className="p-4 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-colors space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isOp ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : isFallback ? (
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0" />
                        )}
                        <h4 className="font-bold text-neutral-900 text-sm">{src.name}</h4>
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isOp
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isFallback
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                        }`}
                      >
                        {src.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-neutral-600">{src.description}</p>

                    <div className="p-2.5 rounded-lg bg-neutral-50 text-[11px] text-neutral-500 font-mono">
                      {src.notes}
                    </div>

                    {src.env_keys && src.env_keys.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="text-neutral-400">Environment keys:</span>
                        {src.env_keys.map((k) => (
                          <code key={k} className="px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-700 font-mono">
                            {k}
                          </code>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive AI Intent Parser Sandbox */}
          <div className="p-5 rounded-2xl bg-neutral-900 text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Interactive AI Intent Parser Sandbox
                </h3>
              </div>
              <span className="text-[11px] text-neutral-400 font-mono">
                Schema: SearchIntent
              </span>
            </div>

            <p className="text-xs text-neutral-400">
              Type any Nigerian shopping query below to inspect how LUXA&apos;s AI adapter transforms it into structured search criteria.
            </p>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={testQuery}
                onChange={(e) => setTestQuery(e.target.value)}
                placeholder="e.g. I need something that can help me record clean vocals at home"
                className="flex-1 p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleRunTest}
                disabled={isTesting}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-neutral-950 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                {isTesting ? 'Parsing...' : 'Parse Intent'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {testResult && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span>Engine: {testResult.parser_used.toUpperCase()}</span>
                  <span>{testResult.parser_notes}</span>
                </div>
                <pre className="p-3 bg-neutral-950 rounded-xl text-[11px] text-emerald-300 font-mono overflow-x-auto border border-neutral-800 scrollbar-thin">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
