import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  MapPin,
  Banknote,
  ShieldCheck,
  Package,
  Layers,
} from 'lucide-react';
import { SearchFilters, ProductCategory, VerificationStatus, StockStatus, SourceType } from '../types/index';

interface FilterSidebarProps {
  filters: SearchFilters;
  onChange: (updated: SearchFilters) => void;
  onReset: () => void;
  categories: { category: string; count: number }[];
  locations: { city: string; state: string; count: number }[];
  totalResults: number;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onChange,
  onReset,
  categories,
  locations,
  totalResults,
}) => {
  return (
    <aside className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-neutral-900" />
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Refine Discovery
          </h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          title="Reset all filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort Order */}
      <div>
        <label className="block text-xs font-bold text-neutral-900 mb-2 uppercase tracking-wider">
          Sort Results
        </label>
        <select
          value={filters.sort || 'relevance'}
          onChange={(e) => onChange({ ...filters, sort: e.target.value as any })}
          className="w-full text-xs font-medium text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
        >
          <option value="relevance">Most Relevant First</option>
          <option value="lowest_price">Price: Lowest to Highest</option>
          <option value="highest_price">Price: Highest to Lowest</option>
          <option value="recently_updated">Recently Updated</option>
        </select>
      </div>

      {/* Price Range Filter */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 mb-2 uppercase tracking-wider">
          <Banknote className="w-3.5 h-3.5 text-neutral-500" />
          <span>Price Budget (₦ NGN)</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-neutral-500 font-medium mb-1">Min (₦)</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  minPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full text-xs text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
          <div>
            <label className="block text-[10px] text-neutral-500 font-medium mb-1">Max (₦)</label>
            <input
              type="number"
              placeholder="e.g. 250000"
              value={filters.maxPrice ?? ''}
              onChange={(e) =>
                onChange({
                  ...filters,
                  maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                })
              }
              className="w-full text-xs text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
            />
          </div>
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 mb-2 uppercase tracking-wider">
          <MapPin className="w-3.5 h-3.5 text-neutral-500" />
          <span>Location</span>
        </div>
        <select
          value={filters.city || 'All Cities'}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
          className="w-full text-xs font-medium text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
        >
          <option value="All Cities">All Locations</option>
          <option value="Ado-Ekiti">Ado-Ekiti, Ekiti State</option>
          <option value="Ikere-Ekiti">Ikere-Ekiti, Ekiti State</option>
          <option value="Oye-Ekiti">Oye-Ekiti, Ekiti State</option>
          <option value="Lagos">Lagos State</option>
        </select>
      </div>

      {/* Verification Status Filter */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 mb-2 uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
          <span>Seller Verification</span>
        </div>
        <div className="space-y-1.5 text-xs">
          {[
            { value: 'all', label: 'All Sellers' },
            { value: 'platform_verified', label: 'Platform Verified Only' },
            { value: 'business_details_checked', label: 'Details Checked' },
          ].map((item) => (
            <label
              key={item.value}
              className="flex items-center gap-2 text-neutral-700 cursor-pointer hover:text-neutral-900"
            >
              <input
                type="radio"
                name="verificationStatus"
                checked={(filters.verificationStatus || 'all') === item.value}
                onChange={() =>
                  onChange({
                    ...filters,
                    verificationStatus: item.value as VerificationStatus | 'all',
                  })
                }
                className="rounded-full text-neutral-900 focus:ring-0 cursor-pointer"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Stock Availability */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 mb-2 uppercase tracking-wider">
          <Package className="w-3.5 h-3.5 text-neutral-500" />
          <span>Availability</span>
        </div>
        <div className="space-y-1.5 text-xs">
          {[
            { value: 'all', label: 'All Availability' },
            { value: 'in_stock', label: 'In Stock Only' },
            { value: 'low_stock', label: 'Low Stock Included' },
          ].map((item) => (
            <label
              key={item.value}
              className="flex items-center gap-2 text-neutral-700 cursor-pointer hover:text-neutral-900"
            >
              <input
                type="radio"
                name="stockStatus"
                checked={(filters.stockStatus || 'all') === item.value}
                onChange={() =>
                  onChange({
                    ...filters,
                    stockStatus: item.value as StockStatus | 'all',
                  })
                }
                className="rounded-full text-neutral-900 focus:ring-0 cursor-pointer"
              />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Source Type Filter */}
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 mb-2 uppercase tracking-wider">
          <Layers className="w-3.5 h-3.5 text-neutral-500" />
          <span>Data Provenance</span>
        </div>
        <select
          value={filters.sourceType || 'all'}
          onChange={(e) => onChange({ ...filters, sourceType: e.target.value as any })}
          className="w-full text-xs font-medium text-neutral-800 bg-neutral-50 border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
        >
          <option value="all">All Data Sources</option>
          <option value="registered_seller">Registered Sellers Only</option>
          <option value="demo">Demonstration Data</option>
          <option value="external_web">External Web Discovery</option>
        </select>
      </div>
    </aside>
  );
};
