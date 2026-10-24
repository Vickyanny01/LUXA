export type ProductCategory =
  | 'Phones and Gadgets'
  | 'Computers'
  | 'Fashion'
  | 'Home and Living'
  | 'Beauty'
  | 'Groceries'
  | 'Accessories'
  | 'Appliances'
  | 'Other';

export type VerificationStatus =
  | 'unverified'
  | 'verification_pending'
  | 'business_details_checked'
  | 'platform_verified';

export type StockStatus =
  | 'in_stock'
  | 'low_stock'
  | 'out_of_stock'
  | 'unconfirmed';

export type StockVerificationType =
  | 'seller_reported'
  | 'independently_confirmed'
  | 'unverified';

export type SourceType =
  | 'registered_seller'
  | 'external_web'
  | 'retailer_feed'
  | 'public_directory'
  | 'demo';

export interface VerificationDetails {
  cac_registered?: boolean;
  physical_store_inspected?: boolean;
  phone_verified?: boolean;
  notes?: string;
  verified_at?: string;
}

export interface SellerPublicContact {
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
}

export interface Seller {
  id: string;
  owner_user_id: string;
  business_name: string;
  description: string;
  website?: string | null;
  public_contact: SellerPublicContact;
  city: string;
  state: string;
  country: string;
  verification_status: VerificationStatus;
  verification_details: VerificationDetails;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  seller_id: string | null;
  title: string;
  normalized_title: string;
  description: string;
  category: ProductCategory;
  attributes: Record<string, string>;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface ListingLocation {
  city: string;
  state: string;
  address?: string;
  delivery_coverage: string[];
}

export interface Listing {
  id: string;
  product_id: string;
  seller_id: string | null;
  seller_name: string;
  source_type: SourceType;
  source_name: string;
  source_url?: string | null;
  price: number;
  currency: string; // e.g. "NGN"
  stock_status: StockStatus;
  stock_verification_type: StockVerificationType;
  location: ListingLocation;
  delivery_information: string;
  last_checked_at: string;
  last_updated_at: string;
  listing_status: 'active' | 'inactive' | 'flagged';
  is_demo: boolean;
  // Computed ranking/search metadata
  relevance_score?: number;
  match_reasons?: string[];
  product?: Product;
  seller?: Seller;
}

export interface SearchIntent {
  original_query: string;
  intent: 'product_discovery' | 'price_comparison' | 'seller_lookup' | 'availability_check';
  product_category: ProductCategory | 'All';
  keywords: string[];
  synonyms: string[];
  use_case?: string;
  min_price: number | null;
  max_price: number | null;
  currency: string;
  location: {
    state?: string;
    city?: string;
    raw?: string;
  };
  requested_specifications: Record<string, string>;
  delivery_preferences?: string | null;
  sorting_preferences: 'relevance' | 'lowest_price' | 'highest_price' | 'recently_updated';
  clarification_needed?: string | null;
  parser_used: 'gemma' | 'gemini' | 'rule_fallback';
  parser_notes: string;
  is_fallback: boolean;
}

export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  state?: string;
  city?: string;
  sourceType?: SourceType | 'all';
  verificationStatus?: VerificationStatus | 'all';
  stockStatus?: StockStatus | 'all';
  sort?: 'relevance' | 'lowest_price' | 'highest_price' | 'recently_updated';
}

export interface SearchResponse {
  intent: SearchIntent;
  results: Listing[];
  total: number;
  page: number;
  pageSize: number;
  facets: {
    categories: { category: string; count: number }[];
    locations: { city: string; state: string; count: number }[];
    sourceTypes: { sourceType: string; count: number }[];
  };
  sources_queried: {
    internal_catalog: boolean;
    registered_sellers: boolean;
    external_web: { enabled: boolean; status: string; message: string };
    gemma_ai: { enabled: boolean; status: string; message: string };
  };
}

export interface DiscoverySourceStatus {
  id: string;
  name: string;
  type: 'registered_sellers' | 'gemma_ai' | 'gemini_ai' | 'external_web_search' | 'retailer_feeds' | 'public_directories';
  status: 'operational' | 'pending_credentials' | 'simulated_fallback' | 'inactive';
  description: string;
  env_keys: string[];
  is_configured: boolean;
  notes: string;
  last_sync: string | null;
}

export interface ListingReport {
  id: string;
  target_type: 'listing' | 'seller';
  target_id: string;
  target_title?: string;
  reason: 'inaccurate_price' | 'out_of_stock' | 'suspicious_seller' | 'wrong_contact' | 'fake_listing' | 'other';
  details: string;
  reporter_email?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  created_at: string;
}

export interface UserAccount {
  id: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  seller_id?: string;
  business_name?: string;
  created_at: string;
}
