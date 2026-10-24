import {
  Listing,
  Product,
  Seller,
  SearchIntent,
  SearchFilters,
  SearchResponse,
} from '../src/types/index.js';
import { parseSearchIntent } from './aiAdapter.js';
import { getDatabase } from './dataStore.js';

export async function executeDiscoveryPipeline(
  query: string,
  filters: SearchFilters = {},
  page = 1,
  pageSize = 12
): Promise<SearchResponse> {
  // Step 1: Validate the query
  const cleanQuery = (query || '').trim();

  // Step 2: Parse the user's intent using Gemma or Fallback
  const intent = await parseSearchIntent(cleanQuery, {
    state: filters.state || 'Ekiti',
    city: filters.city || 'Ado-Ekiti',
  });

  const db = getDatabase();

  // Step 3: Search internal product catalog (sellers + demo)
  const internalListings = searchInternalCatalog(cleanQuery, intent, db);

  // Step 4: Query configured external discovery sources (Source B)
  const externalResult = await queryExternalDiscoverySources(cleanQuery, intent);

  // Step 5: Normalize all retrieved records
  const allListings: Listing[] = [...internalListings, ...externalResult.listings];

  // Step 6: Deduplicate equivalent listings without losing seller/source links
  const deduplicated = deduplicateListings(allListings);

  // Step 7: Apply category, budget, location, and other filters
  const effectiveMinPrice = filters.minPrice ?? intent.min_price;
  const effectiveMaxPrice = filters.maxPrice ?? intent.max_price;
  const effectiveCategory = filters.category && filters.category !== 'All' ? filters.category : intent.product_category;
  const effectiveState = filters.state || intent.location.state;
  const effectiveCity = filters.city || intent.location.city;

  const filtered = deduplicated.filter((listing) => {
    // Category filter
    if (effectiveCategory && effectiveCategory !== 'All') {
      const prodCategory = listing.product?.category;
      if (prodCategory && prodCategory.toLowerCase() !== effectiveCategory.toLowerCase()) {
        return false;
      }
    }

    // Budget / Price filter
    if (effectiveMinPrice != null && listing.price < effectiveMinPrice) {
      return false;
    }
    if (effectiveMaxPrice != null && listing.price > effectiveMaxPrice) {
      return false;
    }

    // Source type filter
    if (filters.sourceType && filters.sourceType !== 'all') {
      if (listing.source_type !== filters.sourceType) return false;
    }

    // Verification status filter
    if (filters.verificationStatus && filters.verificationStatus !== 'all') {
      const vStatus = listing.seller?.verification_status || 'unverified';
      if (vStatus !== filters.verificationStatus) return false;
    }

    // Stock status filter
    if (filters.stockStatus && filters.stockStatus !== 'all') {
      if (listing.stock_status !== filters.stockStatus) return false;
    }

    // Location filter (if specified)
    if (filters.city && filters.city !== 'All Cities' && filters.city !== 'All') {
      const matchCity = listing.location.city.toLowerCase() === filters.city.toLowerCase();
      const servesCity = listing.location.delivery_coverage.some(
        (c) => c.toLowerCase().includes(filters.city!.toLowerCase()) || c.toLowerCase().includes('nationwide')
      );
      if (!matchCity && !servesCity) return false;
    }

    if (filters.state && filters.state !== 'All States' && filters.state !== 'All') {
      const matchState = listing.location.state.toLowerCase() === filters.state.toLowerCase();
      const servesState = listing.location.delivery_coverage.some(
        (c) => c.toLowerCase().includes(filters.state!.toLowerCase()) || c.toLowerCase().includes('nationwide')
      );
      if (!matchState && !servesState) return false;
    }

    return true;
  });

  // Step 8: Rank the actual retrieved results
  const ranked = rankListings(filtered, intent, cleanQuery, effectiveCity, effectiveState);

  // Apply user explicit sort override if requested
  const sortMode = filters.sort || intent.sorting_preferences || 'relevance';
  if (sortMode === 'lowest_price') {
    ranked.sort((a, b) => a.price - b.price);
  } else if (sortMode === 'highest_price') {
    ranked.sort((a, b) => b.price - a.price);
  } else if (sortMode === 'recently_updated') {
    ranked.sort((a, b) => new Date(b.last_updated_at).getTime() - new Date(a.last_updated_at).getTime());
  }

  // Step 9 & 10: Compute facets and return paginated results
  const facets = computeFacets(ranked);
  const total = ranked.length;
  const startIndex = (page - 1) * pageSize;
  const paginatedResults = ranked.slice(startIndex, startIndex + pageSize);

  return {
    intent,
    results: paginatedResults,
    total,
    page,
    pageSize,
    facets,
    sources_queried: {
      internal_catalog: true,
      registered_sellers: true,
      external_web: {
        enabled: externalResult.enabled,
        status: externalResult.status,
        message: externalResult.message,
      },
      gemma_ai: {
        enabled: intent.parser_used === 'gemma',
        status: intent.parser_used === 'gemma' ? 'active' : intent.parser_used === 'gemini' ? 'gemini_active' : 'fallback_rule_engine',
        message: intent.parser_notes,
      },
    },
  };
}

function searchInternalCatalog(query: string, intent: SearchIntent, db: ReturnType<typeof getDatabase>): Listing[] {
  const queryLower = query.toLowerCase();
  const searchKeywords = Array.from(new Set([
    ...intent.keywords,
    ...intent.synonyms,
    ...(intent.use_case ? intent.use_case.split(/\s+/) : []),
  ])).filter((k) => k && k.length > 2);

  const matchedListings: Listing[] = [];

  for (const listing of db.listings) {
    if (listing.listing_status === 'inactive') continue;

    const prod = db.products.find((p) => p.id === listing.product_id);
    const seller = listing.seller_id ? db.sellers.find((s) => s.id === listing.seller_id) : undefined;

    const itemWithRefs: Listing = {
      ...listing,
      product: prod,
      seller,
    };

    // If query is empty, return all active listings
    if (!queryLower) {
      matchedListings.push(itemWithRefs);
      continue;
    }

    const searchableText = [
      prod?.title || '',
      prod?.description || '',
      prod?.category || '',
      listing.seller_name || '',
      listing.location.city || '',
      listing.location.state || '',
      Object.entries(prod?.attributes || {}).map(([k, v]) => `${k} ${v}`).join(' '),
    ].join(' ').toLowerCase();

    // Direct substring or keyword match
    const hasDirectMatch = searchableText.includes(queryLower);
    const keywordMatches = searchKeywords.filter((kw) => searchableText.includes(kw.toLowerCase()));
    const categoryMatches = intent.product_category !== 'All' && prod?.category.toLowerCase() === intent.product_category.toLowerCase();

    if (hasDirectMatch || keywordMatches.length > 0 || (searchKeywords.length === 0 && categoryMatches)) {
      matchedListings.push(itemWithRefs);
    }
  }

  return matchedListings;
}

/**
 * Source B: Configurable External Web Discovery Adapter
 * If EXTERNAL_SEARCH_API_KEY is not configured, safely returns empty list with clear configuration notes
 */
async function queryExternalDiscoverySources(
  query: string,
  intent: SearchIntent
): Promise<{ listings: Listing[]; enabled: boolean; status: string; message: string }> {
  const apiKey = process.env.EXTERNAL_SEARCH_API_KEY;
  const apiUrl = process.env.EXTERNAL_SEARCH_API_URL;

  if (!apiKey) {
    return {
      listings: [],
      enabled: false,
      status: 'not_configured',
      message: 'External web discovery credentials not provided in .env (EXTERNAL_SEARCH_API_KEY). Showing verified internal and demonstration catalog.',
    };
  }

  try {
    // If an authorized search API (e.g. Google Custom Search or Serper) is provided:
    const targetUrl = apiUrl || 'https://google.serper.dev/search';
    const res = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: `${query} site:ng OR site:konga.com OR site:jumia.com.ng Nigeria`,
        num: 5,
      }),
    });

    if (!res.ok) throw new Error(`External search API returned ${res.status}`);
    const data = (await res.json()) as any;
    const externalListings: Listing[] = [];

    const organic = data.organic || [];
    organic.forEach((item: any, idx: number) => {
      externalListings.push({
        id: `ext_${Date.now()}_${idx}`,
        product_id: `ext_prod_${idx}`,
        seller_id: null,
        seller_name: item.source || new URL(item.link).hostname,
        source_type: 'external_web',
        source_name: `Web Discovery: ${new URL(item.link).hostname}`,
        source_url: item.link,
        price: 0, // Snippets do not guarantee price as per Rule 3
        currency: 'NGN',
        stock_status: 'unconfirmed',
        stock_verification_type: 'unverified',
        location: {
          city: 'Discovered Online',
          state: 'Nigeria',
          delivery_coverage: ['Nationwide Delivery'],
        },
        delivery_information: 'Refer to external website for live delivery rates and stock availability.',
        last_checked_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString(),
        listing_status: 'active',
        is_demo: false,
        match_reasons: ['Discovered from authorized external web search index'],
        product: {
          id: `ext_prod_${idx}`,
          seller_id: null,
          title: item.title,
          normalized_title: item.title.toLowerCase(),
          description: item.snippet || 'Public listing discovered via external web search.',
          category: (intent.product_category !== 'All' ? intent.product_category : 'Other') as any,
          attributes: { source_snippet: item.snippet || '' },
          image_url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });

    return {
      listings: externalListings,
      enabled: true,
      status: 'active',
      message: `Discovered ${externalListings.length} external public listings.`,
    };
  } catch (err: any) {
    return {
      listings: [],
      enabled: false,
      status: 'error',
      message: `External search failed safely: ${err.message}`,
    };
  }
}

function deduplicateListings(listings: Listing[]): Listing[] {
  const seen = new Map<string, Listing>();

  for (const item of listings) {
    // Key by seller and product title to prevent same seller duplicate records
    const key = `${item.seller_id || item.source_name}_${item.product?.title || item.id}`;
    if (!seen.has(key)) {
      seen.set(key, item);
    }
  }

  return Array.from(seen.values());
}

function rankListings(
  listings: Listing[],
  intent: SearchIntent,
  rawQuery: string,
  preferredCity?: string,
  preferredState?: string
): Listing[] {
  const queryLower = rawQuery.toLowerCase();
  const searchKeywords = [
    ...intent.keywords,
    ...intent.synonyms,
    ...(intent.use_case ? intent.use_case.split(/\s+/) : []),
  ].map((w) => w.toLowerCase());

  return listings
    .map((listing) => {
      let score = 50; // base score
      const reasons: string[] = listing.match_reasons ? [...listing.match_reasons] : [];

      const prod = listing.product;
      const titleLower = prod?.title.toLowerCase() || '';
      const descLower = prod?.description.toLowerCase() || '';

      // Title exact or strong match
      if (queryLower && titleLower.includes(queryLower)) {
        score += 40;
        reasons.push('Direct query match in product title');
      }

      // Keyword matches
      let matchedKeywordsCount = 0;
      for (const kw of searchKeywords) {
        if (titleLower.includes(kw)) {
          score += 15;
          matchedKeywordsCount++;
        } else if (descLower.includes(kw)) {
          score += 8;
          matchedKeywordsCount++;
        }
      }

      if (matchedKeywordsCount > 0 && !reasons.includes('Matches key search attributes')) {
        reasons.push(`Matches ${matchedKeywordsCount} relevant query keywords`);
      }

      // Category match
      if (intent.product_category !== 'All' && prod?.category.toLowerCase() === intent.product_category.toLowerCase()) {
        score += 20;
      }

      // Budget match
      if (intent.max_price != null && listing.price > 0) {
        if (listing.price <= intent.max_price) {
          score += 25;
          reasons.push(`Within requested budget (₦${listing.price.toLocaleString()})`);
        }
      }

      // Location match (Ado-Ekiti / Ekiti State bonus)
      const targetCity = preferredCity || intent.location.city;
      const targetState = preferredState || intent.location.state;

      if (targetCity && listing.location.city.toLowerCase() === targetCity.toLowerCase()) {
        score += 30;
        reasons.push(`Available locally in ${listing.location.city}`);
      } else if (targetState && listing.location.state.toLowerCase() === targetState.toLowerCase()) {
        score += 15;
        reasons.push(`Located in ${listing.location.state}`);
      }

      // Verification bonus
      if (listing.seller?.verification_status === 'platform_verified') {
        score += 15;
      } else if (listing.seller?.verification_status === 'business_details_checked') {
        score += 10;
      }

      // Freshness bonus: updated in last 7 days
      const daysSinceUpdate = (Date.now() - new Date(listing.last_updated_at).getTime()) / (1000 * 3600 * 24);
      if (daysSinceUpdate < 7) {
        score += 10;
      }

      return {
        ...listing,
        relevance_score: score,
        match_reasons: Array.from(new Set(reasons)).slice(0, 3),
      };
    })
    .sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
}

function computeFacets(listings: Listing[]) {
  const catMap = new Map<string, number>();
  const locMap = new Map<string, { city: string; state: string; count: number }>();
  const srcMap = new Map<string, number>();

  for (const item of listings) {
    // Categories
    const cat = item.product?.category || 'Other';
    catMap.set(cat, (catMap.get(cat) || 0) + 1);

    // Locations
    const locKey = `${item.location.city}_${item.location.state}`;
    const existingLoc = locMap.get(locKey);
    if (existingLoc) {
      existingLoc.count++;
    } else {
      locMap.set(locKey, { city: item.location.city, state: item.location.state, count: 1 });
    }

    // Source types
    srcMap.set(item.source_type, (srcMap.get(item.source_type) || 0) + 1);
  }

  return {
    categories: Array.from(catMap.entries()).map(([category, count]) => ({ category, count })),
    locations: Array.from(locMap.values()),
    sourceTypes: Array.from(srcMap.entries()).map(([sourceType, count]) => ({ sourceType, count })),
  };
}
