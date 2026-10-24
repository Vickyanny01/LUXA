import React, { useState } from 'react';
import {
  X,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Phone,
  MessageCircle,
  ExternalLink,
  AlertTriangle,
  Flag,
  Share2,
  CheckCircle,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Listing } from '../types/index';

interface ProductDetailModalProps {
  listing: Listing | null;
  relatedListings: Listing[];
  onClose: () => void;
  onSelectListing: (listing: Listing) => void;
  onOpenReportModal: (listing: Listing) => void;
  onViewSellerProfile: (sellerId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  listing,
  relatedListings,
  onClose,
  onSelectListing,
  onOpenReportModal,
  onViewSellerProfile,
}) => {
  const [copied, setCopied] = useState(false);

  if (!listing) return null;

  const prod = listing.product;
  const seller = listing.seller;

  const formattedPrice =
    listing.price > 0
      ? `₦${listing.price.toLocaleString('en-NG')}`
      : 'Price on Inquiry';

  // Construct WhatsApp URL
  const getWhatsAppUrl = () => {
    const rawNumber = seller?.public_contact.whatsapp || seller?.public_contact.phone || '';
    const cleanNumber = rawNumber.replace(/[^\d]/g, '');
    const message = encodeURIComponent(
      `Hello ${seller?.business_name || 'Seller'}, I found your listing for "${prod?.title}" on LUXA (₦${listing.price.toLocaleString('en-NG')}). Is it currently available at your shop in ${listing.location.city}?`
    );
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getVerificationBadge = () => {
    const status = seller?.verification_status || 'unverified';
    if (status === 'platform_verified') {
      return {
        label: 'Platform Verified',
        icon: <ShieldCheck className="w-4 h-4 text-blue-600" />,
        className: 'bg-blue-50 text-blue-900 border-blue-200',
        description: 'Physical location and business registration inspected & confirmed by LUXA.',
      };
    }
    if (status === 'business_details_checked') {
      return {
        label: 'Business Details Checked',
        icon: <CheckCircle className="w-4 h-4 text-emerald-600" />,
        className: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        description: 'CAC identity documents and phone number verified.',
      };
    }
    if (status === 'verification_pending') {
      return {
        label: 'Verification Pending',
        icon: <Clock className="w-4 h-4 text-amber-600" />,
        className: 'bg-amber-50 text-amber-900 border-amber-200',
        description: 'Seller account registered; verification paperwork currently in review.',
      };
    }
    return {
      label: 'Unverified Merchant',
      icon: <ShieldAlert className="w-4 h-4 text-neutral-500" />,
      className: 'bg-neutral-100 text-neutral-800 border-neutral-200',
      description: 'Public listing or self-registered seller without formal verification.',
    };
  };

  const vBadge = getVerificationBadge();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header Row */}
        <div className="px-5 py-3.5 border-b border-neutral-200 flex items-center justify-between gap-3 bg-neutral-50/80 shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            <span>{prod?.category || 'Product Discovery'}</span>
            <span>&bull;</span>
            <span className="text-neutral-900 font-bold">{listing.location.city}, {listing.location.state}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer"
              title="Copy product link"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/60 rounded-full transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SECTION 3 ACCURACY RULE: Visibly labelled DEMO DATA banner */}
        {listing.is_demo && (
          <div className="bg-amber-500 text-amber-950 font-bold text-xs uppercase tracking-wider px-4 py-2 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Demonstration Listing — For platform testing & design evaluation. Not an active checkout.</span>
            </div>
            <span className="text-[10px] bg-amber-950 text-amber-200 px-2 py-0.5 rounded font-mono">
              DEMO DATA
            </span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-7">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Left Column: Image and Provenance */}
            <div className="space-y-4">
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200">
                <img
                  src={prod?.image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'}
                  alt={prod?.title || 'Product'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-900/90 text-white backdrop-blur-md">
                    {listing.stock_status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Data Provenance Card */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-neutral-900 uppercase tracking-wider">
                  <Layers className="w-3.5 h-3.5 text-neutral-600" />
                  <span>Listing Provenance & Freshness</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-neutral-600">
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Data Source:</span>
                    <strong className="text-neutral-800 capitalize">{listing.source_type.replace('_', ' ')}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Stock Status:</span>
                    <strong className="text-neutral-800 capitalize">{listing.stock_verification_type.replace('_', ' ')}</strong>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Last Checked:</span>
                    <span className="text-neutral-800">{new Date(listing.last_checked_at).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block text-[10px]">Last Updated:</span>
                    <span className="text-neutral-800">{new Date(listing.last_updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Title, Price, Description, Seller Card, CTA */}
            <div className="space-y-5">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-950 font-sans leading-snug">
                  {prod?.title}
                </h1>

                {/* Price Display */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-neutral-900 tracking-tight font-sans">
                    {formattedPrice}
                  </span>
                  <span className="text-sm font-semibold text-neutral-500">
                    {listing.currency}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-1.5">
                  Description
                </h2>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {prod?.description}
                </p>
              </div>

              {/* Specifications Table */}
              {prod?.attributes && Object.keys(prod.attributes).length > 0 && (
                <div>
                  <h2 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-2">
                    Key Specifications
                  </h2>
                  <div className="rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100 text-xs">
                    {Object.entries(prod.attributes).map(([key, val]) => (
                      <div key={key} className="flex px-3 py-2 bg-neutral-50/50">
                        <span className="w-1/3 font-semibold text-neutral-600 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="w-2/3 text-neutral-900 font-medium">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Seller Information Card */}
              <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/70 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                      Seller / Shop
                    </span>
                    <button
                      onClick={() => seller && onViewSellerProfile(seller.id)}
                      className="text-base font-bold text-neutral-900 hover:text-emerald-700 transition-colors block text-left cursor-pointer"
                    >
                      {listing.seller_name}
                    </button>
                  </div>

                  <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border ${vBadge.className}`}>
                    {vBadge.icon}
                    <span>{vBadge.label}</span>
                  </span>
                </div>

                <p className="text-xs text-neutral-600">
                  {vBadge.description}
                </p>

                {/* Physical Store Location */}
                <div className="flex items-start gap-1.5 text-xs text-neutral-700 pt-2 border-t border-neutral-200/60">
                  <MapPin className="w-4 h-4 text-neutral-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-neutral-900">
                      {listing.location.address || `${listing.location.city}, ${listing.location.state}`}
                    </span>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Delivery: {listing.delivery_information}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {/* WhatsApp Action */}
                  <a
                    href={getWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>

                  {/* Direct Phone Call */}
                  {seller?.public_contact.phone ? (
                    <a
                      href={`tel:${seller.public_contact.phone}`}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>Call Seller</span>
                    </a>
                  ) : (
                    <button
                      disabled
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-neutral-200 text-neutral-500 font-semibold text-sm rounded-xl cursor-not-allowed"
                    >
                      <Phone className="w-4 h-4" />
                      <span>No Phone Listed</span>
                    </button>
                  )}
                </div>

                {/* External URL if discovered */}
                {listing.source_url && (
                  <a
                    href={listing.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Visit Original Web Source</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Related Listings Section */}
          {relatedListings && relatedListings.length > 0 && (
            <div className="pt-6 border-t border-neutral-200">
              <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4">
                Other Similar Products in Ekiti & Nearby
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {relatedListings.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectListing(rel)}
                    className="p-3 rounded-xl border border-neutral-200 bg-white hover:border-neutral-900 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-16/10 rounded-lg overflow-hidden bg-neutral-100 mb-2">
                        <img
                          src={rel.product?.image_url}
                          alt={rel.product?.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="text-xs font-bold text-neutral-900 line-clamp-1">
                        {rel.product?.title}
                      </h3>
                      <p className="text-[11px] text-neutral-500 truncate">
                        {rel.seller_name}
                      </p>
                    </div>
                    <div className="mt-2 text-xs font-extrabold text-neutral-950 font-sans">
                      ₦{rel.price.toLocaleString('en-NG')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Trust & Reporting Actions */}
          <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
            <span>Notice outdated price or suspicious seller?</span>
            <button
              onClick={() => onOpenReportModal(listing)}
              className="flex items-center gap-1 font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report this Listing</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
