import {
  Sparkles,
  Store,
  ShieldCheck,
  MapPin,
  Heart,
} from 'lucide-react';
import { LuxaLogo } from './LuxaLogo';

interface FooterProps {
  onOpenSellerPortal: () => void;
  onOpenSourcesModal: () => void;
  onOpenVerificationGuide: () => void;
  onOpenInfoPage: (page: 'about' | 'how-it-works' | 'contact' | 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenSellerPortal,
  onOpenSourcesModal,
  onOpenVerificationGuide,
  onOpenInfoPage,
}) => {
  return (
    <footer className="bg-neutral-900 text-neutral-400 text-xs border-t border-neutral-800 pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Callout: Merchant Onboarding in Ekiti */}
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              <Store className="w-4 h-4" />
              <span>For Retailers & Shop Owners</span>
            </div>
            <h3 className="text-xl font-bold text-white font-sans">
              Sell products in Ado-Ekiti or across Nigeria?
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-xl">
              List your inventory on LUXA. When people search for items you sell, we connect them directly to your WhatsApp, phone, or physical storefront.
            </p>
          </div>

          <button
            onClick={onOpenSellerPortal}
            className="px-5 py-3 bg-white hover:bg-neutral-100 text-neutral-900 font-bold rounded-xl transition-all shadow-sm shrink-0 cursor-pointer text-xs sm:text-sm"
          >
            Open Merchant Portal
          </button>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <LuxaLogo size="sm" theme="colorful" className="mb-3" />
            <p className="text-neutral-500 text-[11px] leading-relaxed mb-3">
              AI-powered product discovery engine helping people find what they need and connecting them to verified sellers.
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ado-Ekiti, Ekiti State, Nigeria</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Discovery Engine
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onOpenInfoPage('how-it-works')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  How LUXA Works
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSourcesModal}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Discovery Sources & AI
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenVerificationGuide}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Verification Standards
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Merchants & Business
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenSellerPortal}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  List Your Business
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSellerPortal}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Seller Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenVerificationGuide}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Get Verified in Ekiti
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              About & Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onOpenInfoPage('about')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  About LUXA
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoPage('contact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Contact & Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoPage('privacy')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Privacy Policy (Draft)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenInfoPage('terms')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Terms of Service (Draft)
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>
            &copy; {new Date().getFullYear()} LUXA. Working brand prototype for AI-powered product discovery. Demonstration listings are clearly labelled and separated from real merchant data.
          </p>
          <div className="flex items-center gap-1 text-neutral-400">
            <span>Built for Ado-Ekiti & Nigeria</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
