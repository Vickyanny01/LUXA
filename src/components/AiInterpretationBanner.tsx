import React, { useState } from 'react';
import {
  Sparkles,
  MapPin,
  Tag,
  Banknote,
  Cpu,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { SearchIntent } from '../types/index';

interface AiInterpretationBannerProps {
  intent: SearchIntent;
}

export const AiInterpretationBanner: React.FC<AiInterpretationBannerProps> = ({ intent }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!intent || !intent.original_query) return null;

  const hasConstraints =
    intent.max_price != null ||
    intent.min_price != null ||
    (intent.product_category && intent.product_category !== 'All') ||
    intent.location.city ||
    intent.location.state ||
    intent.use_case ||
    Object.keys(intent.requested_specifications).length > 0;

  const parserBadgeColor =
    intent.parser_used === 'gemma'
      ? 'bg-purple-50 text-purple-700 border-purple-200'
      : intent.parser_used === 'gemini'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-emerald-50 text-emerald-800 border-emerald-200';

  const parserLabel =
    intent.parser_used === 'gemma'
      ? 'Gemma AI Inference'
      : intent.parser_used === 'gemini'
      ? 'Gemini 2.5 Flash'
      : 'LUXA Rule Engine (Nigeria NLP)';

  return (
    <div className="bg-white border border-neutral-200 rounded-xl shadow-xs overflow-hidden mb-6 transition-all">
      {/* Summary Header */}
      <div className="px-4 py-3 bg-neutral-50/70 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-neutral-900 text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Request Interpretation
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${parserBadgeColor}`}>
                {parserLabel}
              </span>
            </div>
            <p className="text-xs text-neutral-600 line-clamp-1">
              Query: &ldquo;<span className="text-neutral-900 font-medium">{intent.original_query}</span>&rdquo;
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-200 px-2.5 py-1 rounded-md shadow-2xs hover:bg-neutral-50 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Hide structured schema' : 'Inspect interpretation'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Extracted Structured Chips */}
      <div className="px-4 py-3 flex flex-wrap items-center gap-2 text-xs">
        {/* Category */}
        {intent.product_category && intent.product_category !== 'All' && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-800 font-medium border border-neutral-200">
            <Tag className="w-3.5 h-3.5 text-neutral-500" />
            <span>Category: <strong className="text-neutral-900">{intent.product_category}</strong></span>
          </span>
        )}

        {/* Budget Max */}
        {intent.max_price != null && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-medium border border-emerald-200">
            <Banknote className="w-3.5 h-3.5 text-emerald-600" />
            <span>Max Budget: <strong className="text-emerald-950">₦{intent.max_price.toLocaleString()}</strong></span>
          </span>
        )}

        {/* Location */}
        {(intent.location.city || intent.location.state) && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 font-medium border border-blue-200">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            <span>
              Target: <strong className="text-blue-950">{intent.location.city || ''}{intent.location.city && intent.location.state ? ', ' : ''}{intent.location.state || ''}</strong>
            </span>
          </span>
        )}

        {/* Use Case */}
        {intent.use_case && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 font-medium border border-amber-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Use Case: <strong className="text-amber-950">{intent.use_case}</strong></span>
          </span>
        )}

        {/* Specs */}
        {Object.entries(intent.requested_specifications).map(([key, val]) => (
          <span key={key} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 border border-neutral-200 font-medium">
            <span className="capitalize text-neutral-500">{key}:</span>
            <strong className="text-neutral-900">{val}</strong>
          </span>
        ))}

        {!hasConstraints && (
          <span className="text-xs text-neutral-500 italic">
            Broad search across all available product categories and sellers.
          </span>
        )}
      </div>

      {/* Clarification prompt if present */}
      {intent.clarification_needed && (
        <div className="mx-4 mb-3 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Search hint:</strong> {intent.clarification_needed}
          </span>
        </div>
      )}

      {/* Expanded Technical Inspector */}
      {isExpanded && (
        <div className="px-4 py-3 bg-neutral-900 text-neutral-200 border-t border-neutral-200 text-xs font-mono">
          <div className="flex items-center justify-between mb-2">
            <span className="text-neutral-400 font-sans font-semibold">Structured SearchIntent Schema (Validated JSON)</span>
            <span className="text-[11px] text-emerald-400">{intent.parser_notes}</span>
          </div>
          <pre className="p-3 bg-neutral-950 rounded-lg overflow-x-auto text-[11px] text-emerald-300 leading-relaxed scrollbar-thin">
            {JSON.stringify(intent, null, 2)}
          </pre>
          <p className="mt-2 text-[11px] font-sans text-neutral-400">
            LUXA applies hard database filters and relevance scoring directly from these validated fields, protecting against arbitrary injection or hallucinations.
          </p>
        </div>
      )}
    </div>
  );
};
