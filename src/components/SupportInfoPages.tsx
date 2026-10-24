import React from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Search,
  Store,
  HelpCircle,
  Mail,
  MapPin,
  AlertTriangle,
} from 'lucide-react';

interface SupportInfoPagesProps {
  activePage: 'about' | 'how-it-works' | 'contact' | 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const SupportInfoPages: React.FC<SupportInfoPagesProps> = ({
  activePage,
  onClose,
}) => {
  if (!activePage) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-3xl rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <h2 className="text-base font-bold text-neutral-900 capitalize">
              {activePage.replace('-', ' ')} &mdash; LUXA
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-6 text-sm text-neutral-700 leading-relaxed">
          {activePage === 'how-it-works' && (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-extrabold text-neutral-900 font-sans mb-2">
                  How Product Discovery Works on LUXA
                </h1>
                <p className="text-neutral-600">
                  LUXA is an AI-powered product discovery engine, not just another eCommerce marketplace. Instead of requiring you to know which shop stocks what you need, you simply describe what you want.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 text-emerald-400 font-bold flex items-center justify-center">1</div>
                  <h4 className="font-bold text-neutral-900 text-sm">Natural Language Request</h4>
                  <p className="text-neutral-600">
                    Type a request like &ldquo;I need a laptop for music production under 250,000 naira in Ekiti&rdquo; or &ldquo;wireless microphone for home vocals&rdquo;.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 text-emerald-400 font-bold flex items-center justify-center">2</div>
                  <h4 className="font-bold text-neutral-900 text-sm">AI Intent Parser & Ranking</h4>
                  <p className="text-neutral-600">
                    Our server-side AI model extracts your budget, target category, location constraints (Ado-Ekiti, Ekiti State, or Nationwide), and technical specs.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 text-emerald-400 font-bold flex items-center justify-center">3</div>
                  <h4 className="font-bold text-neutral-900 text-sm">Direct Seller Connection</h4>
                  <p className="text-neutral-600">
                    View verified physical shops in Ekiti State, transparent pricing, and connect directly via WhatsApp, phone call, or store visit.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <strong className="block font-bold">Why prices and stock can change:</strong>
                <p>
                  Products sell in real-time at local physical markets in Ado-Ekiti (e.g. Fajuyi, Adebayo, Ijigbo). While LUXA monitors updates, always confirm live stock and today&apos;s price directly with the merchant before dispatch or travel.
                </p>
              </div>
            </div>
          )}

          {activePage === 'about' && (
            <div className="space-y-5">
              <h1 className="text-2xl font-extrabold text-neutral-900 font-sans">
                About LUXA
              </h1>
              <p>
                In Nigeria today, consumers frequently waste hours messaging dozens of WhatsApp vendors, browsing scattered Instagram pages, and walking through sprawling physical markets just to locate a specific item.
              </p>
              <p>
                LUXA unifies this experience. Starting with a deep local commitment to <strong>Ado-Ekiti and Ekiti State</strong> and scaling across Nigeria, LUXA indexes registered merchants, public physical stores, and authorized retailer feeds into one clean, intelligent search interface.
              </p>

              <div className="p-4 rounded-xl bg-neutral-900 text-white text-xs space-y-2">
                <h4 className="font-bold text-sm text-emerald-400">Our Core Promise</h4>
                <p className="text-neutral-300">
                  Tell LUXA what you need. Discover where to get it. No fake reviews, no hidden sponsored rankings, and strict separation of demonstration testing data from real merchants.
                </p>
              </div>
            </div>
          )}

          {activePage === 'contact' && (
            <div className="space-y-5">
              <h1 className="text-2xl font-extrabold text-neutral-900 font-sans">
                Contact LUXA
              </h1>
              <p className="text-neutral-600">
                Are you a retailer in Ado-Ekiti or across Nigeria looking to list your shop, or a shopper with feedback? Reach out to our regional operations team.
              </p>

              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl border border-neutral-200 flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-neutral-900 font-semibold">Ekiti Regional Operations</strong>
                    <span className="text-neutral-600">Fajuyi Memorial District / Adebayo Commercial Area, Ado-Ekiti, Ekiti State, Nigeria</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block text-neutral-900 font-semibold">General Inquiries & Verification Submissions</strong>
                    <span className="text-neutral-600">operations@luxa.example.ng</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Notice: This is a working draft policy for evaluation purposes and does not claim legal certification.</span>
              </div>
              <h1 className="text-2xl font-extrabold text-neutral-900 font-sans">
                Privacy Policy (Working Draft)
              </h1>
              <p className="text-xs">
                LUXA respects shopper privacy. We do not require account registration or personal information for basic product discovery. When you search, only your search query and general city/state selection are processed by our discovery engine.
              </p>
              <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">Merchant Information</h4>
              <p className="text-xs">
                Merchants agree to publish their business contact numbers (WhatsApp and phone) and storefront address solely for the purpose of receiving customer product inquiries.
              </p>
            </div>
          )}

          {activePage === 'terms' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Notice: This is a working draft terms of service for evaluation purposes.</span>
              </div>
              <h1 className="text-2xl font-extrabold text-neutral-900 font-sans">
                Terms of Service (Working Draft)
              </h1>
              <p className="text-xs">
                LUXA operates as a discovery platform that connects shoppers with merchants. LUXA is not a party to direct financial transactions between consumers and independent sellers unless explicitly facilitated through an authorized escrow program.
              </p>
              <p className="text-xs">
                Users are encouraged to verify goods before payment, especially when dealing with unverified merchants. Demonstration data is strictly provided for testing and evaluation purposes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
