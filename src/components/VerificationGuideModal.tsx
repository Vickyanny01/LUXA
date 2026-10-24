import React from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  CheckCircle,
  Clock,
  Building2,
  FileCheck,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

interface VerificationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationGuideModal: React.FC<VerificationGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                LUXA Seller Verification Standards
              </h2>
              <p className="text-xs text-neutral-500">
                Transparent trust architecture for Ekiti State & Nigeria
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

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 text-xs text-neutral-600">
          <div className="p-4 rounded-xl bg-neutral-900 text-neutral-200 space-y-1.5">
            <h3 className="font-bold text-sm text-white font-sans">
              Why Verification Matters on LUXA
            </h3>
            <p className="leading-relaxed">
              In Nigerian online commerce, fake accounts, advance-fee fraud, and phantom listings are major risks. LUXA adheres to strict non-negotiable verification rules. A website presence or social media link alone is <strong>never</strong> treated as proof of legitimacy.
            </p>
          </div>

          <div className="space-y-4">
            {/* Level 4: Platform Verified */}
            <div className="p-4 rounded-2xl border-2 border-blue-500 bg-blue-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600 text-white font-bold text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Platform Verified</span>
                </span>
                <span className="text-[11px] font-semibold text-blue-900">Highest Trust Tier</span>
              </div>
              <p className="text-neutral-800 font-medium">
                Physical storefront in Ado-Ekiti or Ekiti State physically visited and inspected by LUXA verification agents, alongside verified CAC business registration and tested contact channels.
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-600 text-[11px]">
                <li>Physical premises at verified address (e.g. Fajuyi, Adebayo Road, Bank Road)</li>
                <li>Valid Corporate Affairs Commission (CAC) certificate on record</li>
                <li>Direct in-person or verified audio/video equipment inspection</li>
              </ul>
            </div>

            {/* Level 3: Business Details Checked */}
            <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Business Details Checked</span>
                </span>
                <span className="text-[11px] font-semibold text-emerald-900">Verified Credentials</span>
              </div>
              <p className="text-neutral-800 font-medium">
                The seller has submitted government ID, valid proof of business registration, and verified telephone/WhatsApp numbers.
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-600 text-[11px]">
                <li>CAC certificate and National ID/NIN confirmed</li>
                <li>Phone and WhatsApp numbers verified via 2-step OTP</li>
              </ul>
            </div>

            {/* Level 2: Verification Pending */}
            <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-600 text-white font-bold text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Verification Pending</span>
                </span>
                <span className="text-[11px] font-semibold text-amber-900">In Review</span>
              </div>
              <p className="text-neutral-800">
                The merchant has created an account and submitted documents. Review is underway by our regional compliance team.
              </p>
            </div>

            {/* Level 1: Unverified */}
            <div className="p-4 rounded-2xl border border-neutral-300 bg-neutral-50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-600 text-white font-bold text-xs">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Unverified Merchant</span>
                </span>
                <span className="text-[11px] font-semibold text-neutral-600">Standard Baseline</span>
              </div>
              <p className="text-neutral-700">
                Newly registered merchant account or external web listing. Information has not yet been verified by LUXA.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block">Buyer Safety Principle:</strong>
              <span>Always verify the product physically or use cash on delivery / escrow when dealing with unverified merchants.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
