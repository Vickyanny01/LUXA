import {
  SearchResponse,
  SearchFilters,
  Listing,
  Seller,
  SearchIntent,
  DiscoverySourceStatus,
  ListingReport,
  UserAccount,
} from '../types/index';

const TOKEN_KEY = 'luxa_auth_token';
const USER_KEY = 'luxa_user_session';

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthSession(token: string, user: UserAccount, seller?: Seller): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify({ user, seller }));
}

export function clearAuthSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getCachedUser(): { user: UserAccount; seller?: Seller } | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `HTTP Error ${res.status}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.error || errJson.details || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Discovery & Search
  async search(query: string, filters: SearchFilters = {}, page = 1, pageSize = 12): Promise<SearchResponse> {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.minPrice != null) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice != null) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.city && filters.city !== 'All Cities' && filters.city !== 'All') params.append('city', filters.city);
    if (filters.state && filters.state !== 'All States' && filters.state !== 'All') params.append('state', filters.state);
    if (filters.sourceType && filters.sourceType !== 'all') params.append('sourceType', filters.sourceType);
    if (filters.verificationStatus && filters.verificationStatus !== 'all') params.append('verificationStatus', filters.verificationStatus);
    if (filters.stockStatus && filters.stockStatus !== 'all') params.append('stockStatus', filters.stockStatus);
    if (filters.sort) params.append('sort', filters.sort);
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());

    return request<SearchResponse>(`/api/search?${params.toString()}`);
  },

  async parseIntent(query: string, location?: { state: string; city: string }): Promise<SearchIntent> {
    return request<SearchIntent>('/api/intent/parse', {
      method: 'POST',
      body: JSON.stringify({ query, location }),
    });
  },

  async getListing(id: string): Promise<{ listing: Listing; related: Listing[] }> {
    return request<{ listing: Listing; related: Listing[] }>(`/api/listings/${id}`);
  },

  async getSeller(id: string): Promise<{ seller: Seller; listings: Listing[] }> {
    return request<{ seller: Seller; listings: Listing[] }>(`/api/sellers/${id}`);
  },

  // Seller & Auth
  async registerSeller(data: any): Promise<{ token: string; user: UserAccount; seller: Seller }> {
    const res = await request<{ token: string; user: UserAccount; seller: Seller }>('/api/sellers/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    setAuthSession(res.token, res.user, res.seller);
    return res;
  },

  async login(email: string, password: string): Promise<{ token: string; user: UserAccount; seller?: Seller }> {
    const res = await request<{ token: string; user: UserAccount; seller?: Seller }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthSession(res.token, res.user, res.seller);
    return res;
  },

  async getMe(): Promise<{ user: UserAccount; seller?: Seller }> {
    return request<{ user: UserAccount; seller?: Seller }>('/api/auth/me');
  },

  async getMyListings(): Promise<Listing[]> {
    return request<Listing[]>('/api/seller/my-listings');
  },

  async createListing(listingData: any): Promise<Listing> {
    return request<Listing>('/api/seller/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  },

  async updateListing(id: string, listingData: any): Promise<{ listing: Listing }> {
    return request<{ listing: Listing }>(`/api/seller/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  },

  async deleteListing(id: string): Promise<{ message: string }> {
    return request<{ message: string }>(`/api/seller/listings/${id}`, {
      method: 'DELETE',
    });
  },

  // Reporting & Transparency
  async submitReport(reportData: any): Promise<{ message: string; report: ListingReport }> {
    return request<{ message: string; report: ListingReport }>('/api/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  },

  async getDiscoverySources(): Promise<{
    sources: DiscoverySourceStatus[];
    stats: { total_listings: number; demo_listings: number; registered_seller_listings: number; sellers_count: number };
  }> {
    return request<{
      sources: DiscoverySourceStatus[];
      stats: { total_listings: number; demo_listings: number; registered_seller_listings: number; sellers_count: number };
    }>('/api/discovery-sources');
  },
};
