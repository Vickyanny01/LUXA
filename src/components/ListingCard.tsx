import React from 'react';
import {
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Clock,
  ExternalLink,
  MessageCircle,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Tag,
} from 'lucide-react';
import { Listing } from '../types/index';

interface ListingCardProps {
  listing: Listing;
  onSelect: (listing: Listing) => void;
  onContactSeller: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onSelect,
  onContactSeller,
}) => {
  const prod = listing.product;
  const seller = listing.seller;

  // Format Nigerian Naira
  const formattedPrice =
    listing.price > 0
      ? `₦${listing.price.toLocaleString('en-NG')}`
      : 'Price on Inquiry';

  // Verification status label and styling
  const getVerificationBadge = () => {
    const status = seller?.verification_status || 'unverified';
    if (status === 'platform_verified') {
      return {
        label: 'Platform Verified',
        icon: <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />,
        className: 'bg-blue-50 text-blue-800 border-blue-200',
        title: 'Physical store or CAC documents inspected by LUXA',
      };
    }
    if (status === 'business_details_checked') {
      return {
        label: 'Details Checked',
        icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
        className: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        title: 'Business registration documentation verified',
      };
    }
    if (status === 'verification_pending') {
      return {
        label: 'Verification Pending',
        icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
        className: 'bg-amber-50 text-amber-800 border-amber-200',
        title: 'Merchant onboarding in progress',
      };
    }
    return {
      label: 'Unverified Seller',
      icon: <ShieldAlert className="w-3.5 h-3.5 text-neutral-500" />,
      className: 'bg-neutral-100 text-neutral-600 border-neutral-200',
      title: 'Listing submitted without formal verification yet',
    };
  };

  const vBadge = getVerificationBadge();

  // Stock status pill
  const getStockBadge = () => {
    if (listing.stock_status === 'in_stock') {
      return {
        label: 'In Stock',
        className: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
    }
    if (listing.stock_status === 'low_stock') {
      return {
        label: 'Low Stock',
        className: 'text-amber-700 bg-amber-50 border-amber-200',
      };
    }
    if (listing.stock_status === 'out_of_stock') {
      return {
        label: 'Out of Stock',
        className: 'text-red-700 bg-red-50 border-red-200',
      };
    }
    return {
      label: 'Stock Unconfirmed',
      className: 'text-neutral-600 bg-neutral-100 border-neutral-200',
    };
  };

  const stockBadge = getStockBadge();

  // Format freshness date
  const getFreshness = () => {
    try {
      const diffMs = Date.now() - new Date(listing.last_updated_at).getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return 'Updated today';
      if (diffDays === 1) return 'Updated yesterday';
      if (diffDays < 30) return `Updated ${diffDays}d ago`;
      return 'Updated >1mo ago';
    } catch {
      return 'Freshness unknown';
    }
  };

  return (
    <article className="group bg-white rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative">
      {/* SECTION 3 ACCURACY RULE: Visibly labelled DEMO DATA badge */}
      {listing.is_demo && (
        <div className="bg-amber-500 text-amber-950 font-bold text-[10px] uppercase tracking-wider px-3 py-1 text-center border-b border-amber-600/20 flex items-center justify-center gap-1">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span>Demonstration Data &mdash; For testing only</span>
        </div>
      )}

      {/* Image Container */}
      <div
        onClick={() => onSelect(listing)}
        className="relative w-full aspect-16/10 bg-neutral-100 overflow-hidden cursor-pointer"
      >
        <img
          src={prod?.image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'}
          alt={prod?.title || 'Product'}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Category Pill on Image */}
        <div className="absolute top-2.5 left-2.5">
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-neutral-900/80 backdrop-blur-md text-white shadow-xs">
            {prod?.category || 'General'}
          </span>
        </div>

        {/* Stock Badge on Image */}
        <div className="absolute top-2.5 right-2.5">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border shadow-xs ${stockBadge.className}`}>
            {stockBadge.label}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Currency */}
          <div className="flex items-baseline justify-between gap-2 mb-1.5">
            <span className="text-xl sm:text-2xl font-extrabold text-neutral-950 tracking-tight font-sans">
              {formattedPrice}
            </span>
            <span className="text-[11px] text-neutral-500 font-medium">
              {listing.currency}
            </span>
          </div>

          {/* Title */}
          <h2
            onClick={() => onSelect(listing)}
            className="text-sm sm:text-base font-bold text-neutral-900 line-clamp-2 hover:text-emerald-700 transition-colors cursor-pointer leading-snug"
          >
            {prod?.title || 'Product Title'}
          </h2>

          {/* Seller / Store Identity & Verification Badge */}
          <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-neutral-800 truncate" title={listing.seller_name}>
                {listing.seller_name}
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0 ${vBadge.className}`}
                title={vBadge.title}
              >
                {vBadge.icon}
                <span>{vBadge.label}</span>
              </span>
            </div>

            {/* Location Pill */}
            <div className="flex items-center gap-1 text-xs text-neutral-600">
              <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">
                {listing.location.city}, {listing.location.state}
              </span>
            </div>
          </div>

          {/* Match Reasons (Why LUXA recommended this) */}
          {listing.match_reasons && listing.match_reasons.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {listing.match_reasons.slice(0, 2).map((reason, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/60"
                >
                  <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="truncate max-w-[200px]">{reason}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer: Freshness & Actions */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          <span className="text-[11px] text-neutral-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{getFreshness()}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelect(listing)}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
            >
              Details
            </button>
            <button
              onClick={() => onContactSeller(listing)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer shadow-2xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Contact</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
