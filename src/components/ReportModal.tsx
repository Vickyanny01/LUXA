import React, { useState } from 'react';
import {
  X,
  Flag,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Listing, Seller } from '../types/index';

interface ReportModalProps {
  targetListing: Listing | null;
  targetSeller: Seller | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  targetListing,
  targetSeller,
  onClose,
}) => {
  const [reason, setReason] = useState<string>('inaccurate_price');
  const [details, setDetails] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!targetListing && !targetSeller) return null;

  const targetTitle = targetListing
    ? targetListing.product?.title || targetListing.id
    : targetSeller?.business_name || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.submitReport({
        target_type: targetListing ? 'listing' : 'seller',
        target_id: targetListing ? targetListing.id : targetSeller?.id,
        target_title: targetTitle,
        reason,
        details,
        reporter_email: email || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative bg-white w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-red-600" />
            <h2 className="text-sm font-bold text-neutral-900">
              Report Inaccuracy or Suspicious Listing
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">
              Report Logged Successfully
            </h3>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto leading-relaxed">
              Thank you for keeping LUXA accurate. Our moderation system reviews flagged records to protect shoppers across Ekiti State and Nigeria.
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-neutral-900 text-white font-bold text-xs rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-700">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">
                Target Being Reported
              </span>
              <strong className="text-neutral-900 text-sm block truncate">
                {targetTitle}
              </strong>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Reason for Report *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              >
                <option value="inaccurate_price">Inaccurate Price / Price Changed</option>
                <option value="out_of_stock">Product Out of Stock</option>
                <option value="wrong_contact">Invalid Phone or WhatsApp Contact</option>
                <option value="suspicious_seller">Suspicious Seller / Possible Scam</option>
                <option value="fake_listing">Misleading or Fake Information</option>
                <option value="other">Other Concern</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Details (What did you observe?)
              </label>
              <textarea
                rows={3}
                required
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="The seller quoted ₦55,000 instead of ₦45,000 when I called, or the item was sold out..."
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-neutral-800 mb-1">
                Your Email Address (Optional for follow-up)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-neutral-700 font-semibold hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
