import React, { useState } from 'react';
import {
  Search,
  ArrowRight,
  Laptop,
  Smartphone,
  Shirt,
  Home,
  Sparkles,
  ShoppingBag,
  Headphones,
  Zap,
  Tag,
  X,
} from 'lucide-react';
import { ProductCategory } from '../types/index';

interface SearchHeroProps {
  onSearch: (query: string) => void;
  onSelectCategory: (category: ProductCategory | 'All') => void;
  onOpenWelcomeIntro?: () => void;
  selectedCategory: ProductCategory | 'All';
  isLoading: boolean;
  initialQuery?: string;
}

const CATEGORIES: { label: ProductCategory; icon: React.ReactNode }[] = [
  { label: 'Computers', icon: <Laptop className="w-4 h-4" /> },
  { label: 'Phones and Gadgets', icon: <Smartphone className="w-4 h-4" /> },
  { label: 'Accessories', icon: <Headphones className="w-4 h-4" /> },
  { label: 'Fashion', icon: <Shirt className="w-4 h-4" /> },
  { label: 'Appliances', icon: <Zap className="w-4 h-4" /> },
  { label: 'Home and Living', icon: <Home className="w-4 h-4" /> },
  { label: 'Beauty', icon: <Sparkles className="w-4 h-4" /> },
  { label: 'Groceries', icon: <ShoppingBag className="w-4 h-4" /> },
  { label: 'Other', icon: <Tag className="w-4 h-4" /> },
];

const SUGGESTED_QUERIES = [
  'Find a laptop for music production under 250,000 naira in Ekiti',
  'Where can I buy a wireless microphone?',
  'I need something that can help me record clean vocals at home',
  'Find affordable sneakers in Ado-Ekiti',
  'Compare phones under 300,000 naira',
];

export const SearchHero: React.FC<SearchHeroProps> = ({
  onSearch,
  onSelectCategory,
  onOpenWelcomeIntro,
  selectedCategory,
  isLoading,
  initialQuery = '',
}) => {
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleQueryClick = (example: string) => {
    setQuery(example);
    onSearch(example);
  };

  return (
    <section className="relative overflow-hidden bg-white border-b border-neutral-200 pt-8 pb-10 sm:pt-12 sm:pb-14">
      {/* Subtle background mesh accent */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-50 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Category Pill Tagline with Welcome intro trigger */}
        <div className="inline-flex items-center gap-2 mb-4 flex-wrap justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>LUXA AI Product Discovery Engine</span>
          </div>

          {onOpenWelcomeIntro && (
            <button
              onClick={onOpenWelcomeIntro}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-2xs cursor-pointer"
            >
              <span>Watch Welcome Intro</span>
              <ArrowRight className="w-3 h-3 text-emerald-400" />
            </button>
          )}
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-neutral-900 tracking-tight font-sans max-w-3xl mx-auto">
          Find what you need. <span className="text-neutral-950 underline decoration-emerald-500/80 decoration-wavy decoration-2">Discover who sells it.</span>
        </h1>

        {/* Supporting Text */}
        <p className="mt-3.5 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto font-normal leading-relaxed">
          Tell LUXA what you need in plain English. We find physical shops in{' '}
          <span className="font-semibold text-neutral-900">Ado-Ekiti, Ekiti State</span>, and verified sellers across Nigeria.
        </p>

        {/* Search Input Box */}
        <form onSubmit={handleSubmit} className="mt-8 max-w-3xl mx-auto">
          <div className="relative flex items-center bg-white rounded-2xl shadow-md border-2 border-neutral-900 focus-within:ring-4 focus-within:ring-emerald-500/20 transition-all p-1.5 sm:p-2">
            <div className="pl-3 sm:pl-4 text-neutral-400">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-neutral-500" />
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. I need a laptop for music production under 250,000 naira in Ekiti..."
              className="w-full px-3 py-2.5 sm:py-3 text-neutral-900 placeholder-neutral-400 text-sm sm:text-base font-normal bg-transparent focus:outline-none"
              autoFocus
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-full transition-colors cursor-pointer mr-1"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="flex items-center gap-2 px-5 py-2.5 sm:py-3 bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white font-semibold text-sm sm:text-base rounded-xl transition-all shrink-0 cursor-pointer shadow-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Discover</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Natural Language Search Prompts */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-xs">
          <span className="text-neutral-500 font-medium mr-1 hidden sm:inline">Try asking:</span>
          {SUGGESTED_QUERIES.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleQueryClick(sq)}
              className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200/90 text-neutral-700 rounded-lg transition-colors cursor-pointer text-left font-medium border border-neutral-200/60"
            >
              &ldquo;{sq}&rdquo;
            </button>
          ))}
        </div>

        {/* Product Category Shortcuts */}
        <div className="mt-8 pt-6 border-t border-neutral-100">
          <div className="flex items-center justify-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => onSelectCategory('All')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              All Categories
            </button>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.label;
              return (
                <button
                  key={cat.label}
                  onClick={() => onSelectCategory(cat.label)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200/40'
                  }`}
                >
                  <span className={isSelected ? 'text-emerald-400' : 'text-neutral-500'}>
                    {cat.icon}
                  </span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
