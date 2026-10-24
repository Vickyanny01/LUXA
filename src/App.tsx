import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Store,
  Layers,
  ArrowRight,
  ShieldCheck,
  MapPin,
  RefreshCw,
  HelpCircle,
  PackageSearch,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { SearchHero } from './components/SearchHero';
import { AiInterpretationBanner } from './components/AiInterpretationBanner';
import { FilterSidebar } from './components/FilterSidebar';
import { ListingCard } from './components/ListingCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SellerProfileModal } from './components/SellerProfileModal';
import { SellerPortalModal } from './components/SellerPortalModal';
import { DiscoverySourcesModal } from './components/DiscoverySourcesModal';
import { VerificationGuideModal } from './components/VerificationGuideModal';
import { ReportModal } from './components/ReportModal';
import { SupportInfoPages } from './components/SupportInfoPages';
import { WelcomeAnimation } from './components/WelcomeAnimation';
import { Footer } from './components/Footer';
import { AnimatePresence } from 'motion/react';

import { api, getCachedUser, clearAuthSession } from './services/api';
import {
  Listing,
  ProductCategory,
  SearchFilters,
  SearchIntent,
  Seller,
  UserAccount,
} from './types/index';

export function App() {
  // Introduction Welcome Animation — Always comes first when customers open LUXA
  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(true);

  // Main discovery state
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'All'>('All');
  const [currentLocation, setCurrentLocation] = useState<{ state: string; city: string }>({
    state: 'Ekiti',
    city: 'Ado-Ekiti',
  });
  const [filters, setFilters] = useState<SearchFilters>({
    sort: 'relevance',
    city: 'Ado-Ekiti',
    state: 'Ekiti',
  });

  const [listings, setListings] = useState<Listing[]>([]);
  const [intent, setIntent] = useState<SearchIntent | null>(null);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Facets
  const [facets, setFacets] = useState<{
    categories: { category: string; count: number }[];
    locations: { city: string; state: string; count: number }[];
    sourceTypes: { sourceType: string; count: number }[];
  }>({ categories: [], locations: [], sourceTypes: [] });

  // Modals & Panels
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  const [sellerListings, setSellerListings] = useState<Listing[]>([]);

  const [isSellerPortalOpen, setIsSellerPortalOpen] = useState(false);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [isVerificationGuideOpen, setIsVerificationGuideOpen] = useState(false);
  const [reportTargetListing, setReportTargetListing] = useState<Listing | null>(null);
  const [reportTargetSeller, setReportTargetSeller] = useState<Seller | null>(null);
  const [infoPage, setInfoPage] = useState<'about' | 'how-it-works' | 'contact' | 'privacy' | 'terms' | null>(null);

  // Mobile filters drawer
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => getCachedUser()?.user || null);
  const [currentSeller, setCurrentSeller] = useState<Seller | null>(() => getCachedUser()?.seller || null);

  // Perform search pipeline
  const performSearch = useCallback(
    async (searchQuery: string, currentFilters: SearchFilters, page = 1) => {
      setIsLoading(true);
      try {
        const response = await api.search(searchQuery, currentFilters, page, pageSize);
        setListings(response.results);
        setIntent(response.intent);
        setTotalResults(response.total);
        setFacets(response.facets);
        setCurrentPage(page);
        setHasSearched(Boolean(searchQuery.trim() || (currentFilters.category && currentFilters.category !== 'All')));
      } catch (err) {
        console.error('Discovery search failed:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [pageSize]
  );

  // Initial load
  useEffect(() => {
    performSearch('', { ...filters, city: currentLocation.city, state: currentLocation.state }, 1);
  }, []);

  const handleSearchSubmit = (newQuery: string) => {
    setQuery(newQuery);
    const updatedFilters = { ...filters, category: undefined };
    setSelectedCategory('All');
    performSearch(newQuery, updatedFilters, 1);
  };

  const handleCategorySelect = (category: ProductCategory | 'All') => {
    setSelectedCategory(category);
    const updatedFilters: SearchFilters = {
      ...filters,
      category: category === 'All' ? undefined : category,
    };
    setFilters(updatedFilters);
    performSearch(query, updatedFilters, 1);
  };

  const handleLocationChange = (loc: { state: string; city: string }) => {
    setCurrentLocation(loc);
    const updatedFilters = {
      ...filters,
      city: loc.city === 'All Cities' ? undefined : loc.city,
      state: loc.state === 'All States' ? undefined : loc.state,
    };
    setFilters(updatedFilters);
    performSearch(query, updatedFilters, 1);
  };

  const handleFilterChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    performSearch(query, newFilters, 1);
  };

  const handleResetFilters = () => {
    const defaultFilters: SearchFilters = {
      sort: 'relevance',
      city: currentLocation.city === 'All Cities' ? undefined : currentLocation.city,
      state: currentLocation.state === 'All States' ? undefined : currentLocation.state,
    };
    setFilters(defaultFilters);
    setSelectedCategory('All');
    performSearch(query, defaultFilters, 1);
  };

  const handleResetHome = () => {
    setQuery('');
    setSelectedCategory('All');
    const defaultFilters: SearchFilters = {
      sort: 'relevance',
      city: 'Ado-Ekiti',
      state: 'Ekiti',
    };
    setFilters(defaultFilters);
    setCurrentLocation({ city: 'Ado-Ekiti', state: 'Ekiti' });
    performSearch('', defaultFilters, 1);
  };

  const handleSelectListing = async (listing: Listing) => {
    try {
      const details = await api.getListing(listing.id);
      setSelectedListing(details.listing);
      setRelatedListings(details.related);
    } catch {
      setSelectedListing(listing);
      setRelatedListings([]);
    }
  };

  const handleViewSellerProfile = async (sellerId: string) => {
    try {
      const data = await api.getSeller(sellerId);
      setSelectedSeller(data.seller);
      setSellerListings(data.listings);
    } catch (err) {
      console.error('Failed to load seller profile:', err);
    }
  };

  const handleContactSeller = (listing: Listing) => {
    handleSelectListing(listing);
  };

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    setCurrentSeller(null);
  };

  const totalPages = Math.ceil(totalResults / pageSize);

  const getAiModelName = () => {
    if (intent?.parser_used === 'gemma') return 'Gemma 2';
    if (intent?.parser_used === 'gemini') return 'Gemini 2.5 Flash';
    return 'LUXA Nigeria NLP Engine';
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 text-neutral-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        currentLocation={currentLocation}
        onLocationChange={handleLocationChange}
        onOpenSellerPortal={() => setIsSellerPortalOpen(true)}
        onOpenSourcesModal={() => setIsSourcesModalOpen(true)}
        onOpenVerificationGuide={() => setIsVerificationGuideOpen(true)}
        onOpenWelcomeIntro={() => setIsWelcomeOpen(true)}
        onOpenInfoPage={(page) => setInfoPage(page)}
        onResetSearch={handleResetHome}
        currentUser={currentUser}
        currentSeller={currentSeller}
        onLogout={handleLogout}
        aiModelName={getAiModelName()}
      />

      {/* Search Hero */}
      <SearchHero
        onSearch={handleSearchSubmit}
        onSelectCategory={handleCategorySelect}
        onOpenWelcomeIntro={() => setIsWelcomeOpen(true)}
        selectedCategory={selectedCategory}
        isLoading={isLoading}
        initialQuery={query}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* AI Intent Interpretation Banner (displays when a query was parsed) */}
        {intent && intent.original_query && (
          <AiInterpretationBanner intent={intent} />
        )}

        {/* Results Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-950 font-sans">
                {query ? (
                  <span>
                    Results for &ldquo;<span className="text-neutral-800">{query}</span>&rdquo;
                  </span>
                ) : selectedCategory !== 'All' ? (
                  <span>{selectedCategory} in {currentLocation.city}</span>
                ) : (
                  <span>Featured Products & Stores in {currentLocation.city}</span>
                )}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
              Found <strong className="text-neutral-900">{totalResults}</strong> matching listings across verified local shops and discovery feeds.
            </p>
          </div>

          {/* Mobile Filter Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl shadow-2xs hover:bg-neutral-50 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-500" />
              <span>Filters & Sort</span>
            </button>
          </div>
        </div>

        {/* Main Grid with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24">
            <FilterSidebar
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleResetFilters}
              categories={facets.categories}
              locations={facets.locations}
              totalResults={totalResults}
            />
          </div>

          {/* Results Column */}
          <div className="lg:col-span-3 space-y-6">
            {isLoading ? (
              /* Loading Skeleton */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3 animate-pulse">
                    <div className="w-full aspect-16/10 bg-neutral-200 rounded-xl" />
                    <div className="h-5 bg-neutral-200 rounded w-1/3" />
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                    <div className="h-4 bg-neutral-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : listings.length === 0 ? (
              /* Empty State */
              <div className="p-8 sm:p-12 rounded-3xl bg-white border border-neutral-200 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
                  <PackageSearch className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-neutral-900 font-sans">
                    No matching products found
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                    We couldn&apos;t find an exact match for &ldquo;{query}&rdquo; in our current catalog. Try loosening price filters, searching for a broader term, or trying one of our suggested examples.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                  <button
                    onClick={handleResetFilters}
                    className="px-4 py-2 bg-neutral-900 text-white font-semibold text-xs rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => handleSearchSubmit('Find a laptop for music production')}
                    className="px-4 py-2 bg-neutral-100 text-neutral-700 font-semibold text-xs rounded-xl hover:bg-neutral-200 transition-colors cursor-pointer"
                  >
                    Try Laptop Search
                  </button>
                </div>
              </div>
            ) : (
              /* Product Listings Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    onSelect={handleSelectListing}
                    onContactSeller={handleContactSeller}
                  />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => performSearch(query, filters, currentPage - 1)}
                  className="p-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 text-neutral-700 transition-colors cursor-pointer"
                  title="Previous page"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold text-neutral-700 px-3 py-1">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  disabled={currentPage >= totalPages || isLoading}
                  onClick={() => performSearch(query, filters, currentPage + 1)}
                  className="p-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-40 text-neutral-700 transition-colors cursor-pointer"
                  title="Next page"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Feature Explainer / Value Proposition (Section 4.A) */}
        {!hasSearched && (
          <section className="mt-16 pt-12 border-t border-neutral-200">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-emerald-700 font-bold uppercase tracking-wider text-xs">
                The LUXA Difference
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-sans mt-1">
                A Product Discovery Engine, Not Just Another Marketplace
              </h2>
              <p className="text-neutral-600 text-xs sm:text-sm mt-2">
                We bridge the gap between people who need products and physical shops in Ekiti and Nigeria who have them in stock.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-emerald-400 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 font-sans">
                  Plain English Understanding
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  No need to memorize exact SKUs. Tell LUXA &ldquo;I need clean vocals under 50k&rdquo; and our AI understands microphones, audio gear, and local budget constraints.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-blue-400 flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 font-sans">
                  Deep Local Presence in Ekiti
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Discover physical walk-in shops across Ado-Ekiti (Fajuyi, Adebayo, Bank Road, Ijigbo), Ikere, and Oye with verified telephone and WhatsApp contacts.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-2xs space-y-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-neutral-900 font-sans">
                  Transparent Trust Tiers
                </h3>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Never guess if a seller is legitimate. We strictly label unverified merchants, checked business registrations, and physical platform inspections.
                </p>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenSellerPortal={() => setIsSellerPortalOpen(true)}
        onOpenSourcesModal={() => setIsSourcesModalOpen(true)}
        onOpenVerificationGuide={() => setIsVerificationGuideOpen(true)}
        onOpenInfoPage={(page) => setInfoPage(page)}
      />

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-sm bg-white h-full p-5 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900">Filters & Sort</h3>
              <button
                onClick={() => setIsMobileFiltersOpen(false)}
                className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 cursor-pointer"
              >
                Close
              </button>
            </div>
            <FilterSidebar
              filters={filters}
              onChange={(f) => {
                handleFilterChange(f);
                setIsMobileFiltersOpen(false);
              }}
              onReset={() => {
                handleResetFilters();
                setIsMobileFiltersOpen(false);
              }}
              categories={facets.categories}
              locations={facets.locations}
              totalResults={totalResults}
            />
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedListing && (
        <ProductDetailModal
          listing={selectedListing}
          relatedListings={relatedListings}
          onClose={() => setSelectedListing(null)}
          onSelectListing={(l) => handleSelectListing(l)}
          onOpenReportModal={(l) => {
            setReportTargetListing(l);
            setReportTargetSeller(null);
          }}
          onViewSellerProfile={(sellerId) => {
            setSelectedListing(null);
            handleViewSellerProfile(sellerId);
          }}
        />
      )}

      {/* Seller Profile Modal */}
      {selectedSeller && (
        <SellerProfileModal
          seller={selectedSeller}
          listings={sellerListings}
          onClose={() => setSelectedSeller(null)}
          onSelectListing={(l) => handleSelectListing(l)}
          onOpenReportSeller={(s) => {
            setReportTargetSeller(s);
            setReportTargetListing(null);
          }}
        />
      )}

      {/* Seller Portal & Registration Modal */}
      <SellerPortalModal
        isOpen={isSellerPortalOpen}
        onClose={() => setIsSellerPortalOpen(false)}
        currentUser={currentUser}
        currentSeller={currentSeller}
        onAuthSuccess={(user, seller) => {
          setCurrentUser(user);
          setCurrentSeller(seller || null);
        }}
        onCatalogChanged={() => performSearch(query, filters, 1)}
      />

      {/* Discovery Sources & AI Transparency Modal */}
      <DiscoverySourcesModal
        isOpen={isSourcesModalOpen}
        onClose={() => setIsSourcesModalOpen(false)}
      />

      {/* Verification Guide Modal */}
      <VerificationGuideModal
        isOpen={isVerificationGuideOpen}
        onClose={() => setIsVerificationGuideOpen(false)}
      />

      {/* Report Modal */}
      {(reportTargetListing || reportTargetSeller) && (
        <ReportModal
          targetListing={reportTargetListing}
          targetSeller={reportTargetSeller}
          onClose={() => {
            setReportTargetListing(null);
            setReportTargetSeller(null);
          }}
        />
      )}

      {/* Information Pages Modal */}
      <SupportInfoPages
        activePage={infoPage}
        onClose={() => setInfoPage(null)}
      />

      {/* Customer Welcome Introduction Animation (Always comes first) */}
      <AnimatePresence>
        {isWelcomeOpen && (
          <WelcomeAnimation
            key="welcome-intro-screen"
            onClose={() => setIsWelcomeOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
