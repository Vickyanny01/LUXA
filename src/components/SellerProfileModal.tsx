import React from 'react';
import {
  X,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  Clock,
  Phone,
  MessageCircle,
  Mail,
  Globe,
  Flag,
  Store,
  Calendar,
} from 'lucide-react';
import { Seller, Listing } from '../types/index';

interface SellerProfileModalProps {
  seller: Seller | null;
  listings: Listing[];
  onClose: () => void;
  onSelectListing: (listing: Listing) => void;
  onOpenReportSeller: (seller: Seller) => void;
}

export const SellerProfileModal: React.FC<SellerProfileModalProps> = ({
  seller,
  listings,
  onClose,
  onSelectListing,
  onOpenReportSeller,
}) => {
  if (!seller) return null;

  const getVerificationInfo = () => {
    if (seller.verification_status === 'platform_verified') {
      return {
        label: 'Platform Verified Merchant',
        icon: <ShieldCheck className="w-5 h-5 text-blue-600" />,
        badgeClass: 'bg-blue-50 text-blue-900 border-blue-200',
        explanation: 'This merchant has undergone physical store inspection in Ekiti State and submitted formal verification documentation.',
      };
    }
    if (seller.verification_status === 'business_details_checked') {
      return {
        label: 'Business Details Checked',
        icon: <CheckCircle className="w-5 h-5 text-emerald-600" />,
        badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        explanation: 'Business identity and registration documents verified with phone number confirmation.',
      };
    }
    if (seller.verification_status === 'verification_pending') {
      return {
        label: 'Verification Pending',
        icon: <Clock className="w-5 h-5 text-amber-600" />,
        badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
        explanation: 'This shop registered recently. Formal identity inspection is in progress.',
      };
    }
    return {
      label: 'Unverified Merchant',
      icon: <ShieldAlert className="w-5 h-5 text-neutral-500" />,
      badgeClass: 'bg-neutral-100 text-neutral-800 border-neutral-200',
      explanation: 'Newly onboarded merchant. Exercise customary caution when transacting.',
    };
  };

  const vInfo = getVerificationInfo();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80 shrink-0">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-neutral-700" />
            <h2 className="text-base font-bold text-neutral-900">
              Merchant Profile & Catalog
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          {/* Business Hero Banner */}
          <div className="p-5 rounded-2xl bg-neutral-900 text-white space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold font-sans">
                {seller.business_name}
              </h1>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${vInfo.badgeClass}`}>
                {vInfo.icon}
                <span>{vInfo.label}</span>
              </span>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed">
              {seller.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-2 border-t border-neutral-800">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>{seller.city}, {seller.state}, {seller.country}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <span>Active since {new Date(seller.created_at).toLocaleDateString()}</span>
              </span>
            </div>
          </div>

          {/* Verification Details Box */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-neutral-600" />
              <span>Verification Breakdown</span>
            </h3>
            <p className="text-xs text-neutral-600">{vInfo.explanation}</p>
            {seller.verification_details.notes && (
              <p className="text-xs text-neutral-500 italic bg-white p-2.5 rounded-lg border border-neutral-200/60">
                &ldquo;{seller.verification_details.notes}&rdquo;
              </p>
            )}
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
              Direct Contact Channels
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {seller.public_contact.whatsapp && (
                <a
                  href={`https://wa.me/${seller.public_contact.whatsapp.replace(/[^\d]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/30 transition-all text-neutral-800"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold block">WhatsApp Business</span>
                    <span className="text-neutral-500">{seller.public_contact.whatsapp}</span>
                  </div>
                </a>
              )}

              {seller.public_contact.phone && (
                <a
                  href={`tel:${seller.public_contact.phone}`}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 hover:border-neutral-900 bg-white hover:bg-neutral-50 transition-all text-neutral-800"
                >
                  <Phone className="w-4 h-4 text-neutral-600 shrink-0" />
                  <div>
                    <span className="font-semibold block">Telephone</span>
                    <span className="text-neutral-500">{seller.public_contact.phone}</span>
                  </div>
                </a>
              )}

              {seller.public_contact.address && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border border-neutral-200 bg-white text-neutral-800 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-neutral-600 shrink-0" />
                  <div>
                    <span className="font-semibold block">Physical Storefront Location</span>
                    <span className="text-neutral-500">{seller.public_contact.address}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Active Listings Catalog */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                Listed Products ({listings.length})
              </h3>
            </div>

            {listings.length === 0 ? (
              <p className="text-xs text-neutral-500 italic p-4 text-center border border-neutral-200 rounded-xl">
                No active listings published yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {listings.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      onClose();
                      onSelectListing(l);
                    }}
                    className="p-3 rounded-xl border border-neutral-200 bg-white hover:border-neutral-900 transition-all cursor-pointer flex items-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                      <img
                        src={l.product?.image_url}
                        alt={l.product?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-neutral-900 truncate">
                        {l.product?.title}
                      </h4>
                      <p className="text-xs font-extrabold text-neutral-900 font-sans mt-0.5">
                        ₦{l.price.toLocaleString('en-NG')}
                      </p>
                      <span className="text-[10px] text-neutral-500 capitalize block">
                        {l.stock_status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report Seller */}
          <div className="pt-4 border-t border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
            <span>Inaccurate contact details or suspicious behavior?</span>
            <button
              onClick={() => onOpenReportSeller(seller)}
              className="flex items-center gap-1 font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>Report this Seller</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
