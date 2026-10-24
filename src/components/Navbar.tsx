import React from 'react';
import {
  MapPin,
  Sparkles,
  Store,
  HelpCircle,
  ShieldCheck,
  Cpu,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { UserAccount, Seller } from '../types/index';
import { LuxaLogo } from './LuxaLogo';

interface NavbarProps {
  currentLocation: { state: string; city: string };
  onLocationChange: (loc: { state: string; city: string }) => void;
  onOpenSellerPortal: () => void;
  onOpenSourcesModal: () => void;
  onOpenVerificationGuide: () => void;
  onOpenWelcomeIntro: () => void;
  onOpenInfoPage: (page: 'about' | 'how-it-works' | 'contact' | 'privacy' | 'terms') => void;
  onResetSearch: () => void;
  currentUser: UserAccount | null;
  currentSeller: Seller | null;
  onLogout: () => void;
  aiModelName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLocation,
  onLocationChange,
  onOpenSellerPortal,
  onOpenSourcesModal,
  onOpenVerificationGuide,
  onOpenWelcomeIntro,
  onOpenInfoPage,
  onResetSearch,
  currentUser,
  currentSeller,
  onLogout,
  aiModelName,
}) => {
  const locations = [
    { city: 'Ado-Ekiti', state: 'Ekiti', label: 'Ado-Ekiti, Ekiti' },
    { city: 'Ikere-Ekiti', state: 'Ekiti', label: 'Ikere-Ekiti, Ekiti' },
    { city: 'All Cities', state: 'Ekiti', label: 'All Ekiti State' },
    { city: 'Lagos', state: 'Lagos', label: 'Lagos State' },
    { city: 'All Cities', state: 'All States', label: 'All Nigeria (Nationwide)' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      {/* Top micro-bar: Market announcement & AI Status */}
      <div className="bg-neutral-900 text-neutral-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>
            Initial focus: <strong>Ado-Ekiti & Ekiti State</strong>, Nigeria. Expanding nationwide.
          </span>
          <button
            onClick={onOpenWelcomeIntro}
            className="ml-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 px-2 py-0.5 rounded-full transition-colors cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Welcome Intro</span>
          </button>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-neutral-400">
          <button
            onClick={onOpenSourcesModal}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            title="Inspect AI Engine & Discovery Pipeline"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI: {aiModelName}</span>
          </button>
          <span className="hidden sm:inline">|</span>
          <button
            onClick={onOpenVerificationGuide}
            className="hidden sm:flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Verification Standards</span>
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-6">
          <button
            onClick={onResetSearch}
            className="flex items-center text-left group cursor-pointer focus:outline-none"
            title="LUXA Home"
          >
            <LuxaLogo size="md" theme="colorful" animate />
          </button>

          {/* Quick Location Dropdown */}
          <div className="relative hidden md:flex items-center text-xs text-neutral-600 bg-neutral-100 hover:bg-neutral-200/80 rounded-full px-3 py-1.5 transition-colors">
            <MapPin className="w-3.5 h-3.5 text-neutral-500 mr-1.5 shrink-0" />
            <select
              value={`${currentLocation.city}|${currentLocation.state}`}
              onChange={(e) => {
                const [city, state] = e.target.value.split('|');
                onLocationChange({ city, state });
              }}
              className="bg-transparent font-medium text-neutral-800 focus:outline-none cursor-pointer pr-1"
            >
              {locations.map((loc) => (
                <option key={`${loc.city}|${loc.state}`} value={`${loc.city}|${loc.state}`}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center / Right Links */}
        <nav className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => onOpenInfoPage('how-it-works')}
            className="hidden lg:flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-900 px-2 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-neutral-400" />
            <span>How Discovery Works</span>
          </button>

          <button
            onClick={onOpenSourcesModal}
            className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 px-2.5 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Inspect Discovery Sources & Provenance"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Discovery Sources</span>
          </button>

          {/* Seller Portal Button */}
          {currentUser && currentSeller ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenSellerPortal}
                className="flex items-center gap-2 text-sm font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
              >
                <Store className="w-4 h-4 text-emerald-600" />
                <span className="max-w-[130px] truncate">{currentSeller.business_name}</span>
              </button>
              <button
                onClick={onLogout}
                title="Log Out"
                className="p-2 text-neutral-500 hover:text-red-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenSellerPortal}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-neutral-900 hover:bg-neutral-800 px-3.5 sm:px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span>List Your Business</span>
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Location Selector Row */}
      <div className="md:hidden border-t border-neutral-100 px-4 py-2 bg-neutral-50 flex items-center justify-between text-xs text-neutral-600">
        <div className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <span className="text-neutral-500">Searching in:</span>
        </div>
        <select
          value={`${currentLocation.city}|${currentLocation.state}`}
          onChange={(e) => {
            const [city, state] = e.target.value.split('|');
            onLocationChange({ city, state });
          }}
          className="bg-transparent font-medium text-neutral-800 focus:outline-none cursor-pointer"
        >
          {locations.map((loc) => (
            <option key={`${loc.city}|${loc.state}`} value={`${loc.city}|${loc.state}`}>
              {loc.label}
            </option>
          ))}
        </select>
      </div>
    </header>
  );
};
