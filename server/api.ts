import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import {
  getDatabase,
  saveDatabase,
  hashPassword,
  generateSalt,
} from './dataStore.js';
import { executeDiscoveryPipeline } from './discoveryEngine.js';
import { parseSearchIntent } from './aiAdapter.js';
import {
  Listing,
  Product,
  Seller,
  ListingReport,
  SearchFilters,
} from '../src/types/index.js';

export const apiRouter = Router();

// In-memory token store for authentication
const activeSessions = new Map<string, { userId: string; email: string; role: string; sellerId?: string }>();

// Helper auth middleware
function requireAuth(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }

  (req as any).user = session;
  next();
}

/**
 * 1. SEARCH ENDPOINT (11-step pipeline)
 */
apiRouter.get('/search', async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const filters: SearchFilters = {
      category: req.query.category as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      city: req.query.city as string,
      state: req.query.state as string,
      sourceType: req.query.sourceType as any,
      verificationStatus: req.query.verificationStatus as any,
      stockStatus: req.query.stockStatus as any,
      sort: req.query.sort as any,
    };
    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '12', 10);

    const searchResponse = await executeDiscoveryPipeline(q, filters, page, pageSize);

    // Record search history if non-empty
    if (q) {
      const db = getDatabase();
      db.search_history.unshift({
        id: `sh_${Date.now()}`,
        query: q,
        timestamp: new Date().toISOString(),
        results_count: searchResponse.total,
      });
      if (db.search_history.length > 50) db.search_history.pop();
      saveDatabase();
    }

    res.json(searchResponse);
  } catch (err: any) {
    console.error('[LUXA API] Search error:', err);
    res.status(500).json({ error: 'Search failed', details: err.message });
  }
});

/**
 * 2. INTENT PARSE INSPECTOR
 */
apiRouter.post('/intent/parse', async (req: Request, res: Response) => {
  try {
    const { query, location } = req.body;
    const intent = await parseSearchIntent(query || '', location || { state: 'Ekiti', city: 'Ado-Ekiti' });
    res.json(intent);
  } catch (err: any) {
    res.status(500).json({ error: 'Intent parsing failed', details: err.message });
  }
});

/**
 * 3. GET SINGLE LISTING DETAILS
 */
apiRouter.get('/listings/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const listing = db.listings.find((l) => l.id === req.params.id);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const product = db.products.find((p) => p.id === listing.product_id);
  const seller = listing.seller_id ? db.sellers.find((s) => s.id === listing.seller_id) : undefined;

  // Find related products in the same category
  const relatedListings = db.listings
    .filter((l) => l.id !== listing.id && l.listing_status === 'active')
    .map((l) => ({
      ...l,
      product: db.products.find((p) => p.id === l.product_id),
      seller: l.seller_id ? db.sellers.find((s) => s.id === l.seller_id) : undefined,
    }))
    .filter((l) => l.product?.category === product?.category)
    .slice(0, 4);

  res.json({
    listing: {
      ...listing,
      product,
      seller,
    },
    related: relatedListings,
  });
});

/**
 * 4. GET SELLER PUBLIC PROFILE AND ACTIVE LISTINGS
 */
apiRouter.get('/sellers/:id', (req: Request, res: Response) => {
  const db = getDatabase();
  const seller = db.sellers.find((s) => s.id === req.params.id);
  if (!seller) {
    return res.status(404).json({ error: 'Seller not found' });
  }

  const sellerListings = db.listings
    .filter((l) => l.seller_id === seller.id && l.listing_status === 'active')
    .map((l) => ({
      ...l,
      product: db.products.find((p) => p.id === l.product_id),
      seller,
    }));

  res.json({
    seller,
    listings: sellerListings,
  });
});

/**
 * 5. SELLER REGISTRATION
 * NOTE: Account creation does NOT automatically grant verification!
 */
apiRouter.post('/sellers/register', (req: Request, res: Response) => {
  try {
    const {
      business_name,
      description,
      email,
      password,
      phone,
      whatsapp,
      address,
      city,
      state,
      country,
      website,
    } = req.body;

    if (!business_name || !email || !password || !phone) {
      return res.status(400).json({ error: 'Missing required fields: business name, email, password, and phone number are required.' });
    }

    const db = getDatabase();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const salt = generateSalt();
    const password_hash = hashPassword(password, salt);
    const userId = `user_${Date.now()}`;
    const sellerId = `seller_${Date.now()}`;
    const now = new Date().toISOString();

    const newSeller: Seller = {
      id: sellerId,
      owner_user_id: userId,
      business_name,
      description: description || 'New merchant on LUXA.',
      website: website || null,
      public_contact: {
        phone,
        whatsapp: whatsapp || phone,
        email,
        address: address || '',
      },
      city: city || 'Ado-Ekiti',
      state: state || 'Ekiti',
      country: country || 'Nigeria',
      // Explicit rule: Creating an account must NOT automatically make a seller verified!
      verification_status: 'unverified',
      verification_details: {
        phone_verified: false,
        cac_registered: false,
        physical_store_inspected: false,
        notes: 'Newly registered account. Verification documentation required.',
      },
      created_at: now,
      updated_at: now,
    };

    const newUser = {
      id: userId,
      email,
      role: 'seller' as const,
      seller_id: sellerId,
      business_name,
      password_hash,
      salt,
      created_at: now,
    };

    db.users.push(newUser);
    db.sellers.push(newSeller);
    saveDatabase();

    const token = crypto.randomBytes(24).toString('hex');
    activeSessions.set(token, {
      userId,
      email,
      role: 'seller',
      sellerId,
    });

    res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        role: 'seller',
        seller_id: sellerId,
        business_name,
        created_at: now,
      },
      seller: newSeller,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Registration failed', details: err.message });
  }
});

/**
 * 6. AUTH LOGIN
 */
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const db = getDatabase();
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const hashed = hashPassword(password, user.salt);
  if (hashed !== user.password_hash) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const seller = user.seller_id ? db.sellers.find((s) => s.id === user.seller_id) : undefined;
  const token = crypto.randomBytes(24).toString('hex');
  activeSessions.set(token, {
    userId: user.id,
    email: user.email,
    role: user.role,
    sellerId: user.seller_id,
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      seller_id: user.seller_id,
      business_name: user.business_name,
      created_at: user.created_at,
    },
    seller,
  });
});

/**
 * 7. AUTH CURRENT USER
 */
apiRouter.get('/auth/me', requireAuth, (req: Request, res: Response) => {
  const sessionUser = (req as any).user;
  const db = getDatabase();
  const user = db.users.find((u) => u.id === sessionUser.userId);
  const seller = sessionUser.sellerId ? db.sellers.find((s) => s.id === sessionUser.sellerId) : undefined;

  res.json({
    user: user ? { id: user.id, email: user.email, role: user.role, seller_id: user.seller_id, business_name: user.business_name } : sessionUser,
    seller,
  });
});

/**
 * 8. GET SELLER'S OWN LISTINGS
 */
apiRouter.get('/seller/my-listings', requireAuth, (req: Request, res: Response) => {
  const sessionUser = (req as any).user;
  if (!sessionUser.sellerId) {
    return res.status(403).json({ error: 'Only sellers have a product catalog.' });
  }

  const db = getDatabase();
  const myListings = db.listings
    .filter((l) => l.seller_id === sessionUser.sellerId)
    .map((l) => ({
      ...l,
      product: db.products.find((p) => p.id === l.product_id),
    }));

  res.json(myListings);
});

/**
 * 9. CREATE PRODUCT & LISTING (SELLER ONLY)
 */
apiRouter.post('/seller/listings', requireAuth, (req: Request, res: Response) => {
  try {
    const sessionUser = (req as any).user;
    if (!sessionUser.sellerId) {
      return res.status(403).json({ error: 'Only registered sellers can create product listings.' });
    }

    const {
      title,
      description,
      category,
      price,
      currency,
      stock_status,
      attributes,
      image_url,
      delivery_information,
      address,
      city,
      state,
      delivery_coverage,
    } = req.body;

    if (!title || price == null || !category) {
      return res.status(400).json({ error: 'Product title, category, and price are required.' });
    }

    const db = getDatabase();
    const seller = db.sellers.find((s) => s.id === sessionUser.sellerId);
    if (!seller) {
      return res.status(404).json({ error: 'Seller profile not found' });
    }

    const now = new Date().toISOString();
    const productId = `prod_${Date.now()}`;
    const listingId = `list_${Date.now()}`;

    const newProduct: Product = {
      id: productId,
      seller_id: seller.id,
      title,
      normalized_title: title.toLowerCase(),
      description: description || '',
      category,
      attributes: attributes || {},
      image_url: image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
      created_at: now,
      updated_at: now,
    };

    const newListing: Listing = {
      id: listingId,
      product_id: productId,
      seller_id: seller.id,
      seller_name: seller.business_name,
      source_type: 'registered_seller',
      source_name: seller.business_name,
      source_url: null,
      price: parseFloat(price),
      currency: currency || 'NGN',
      stock_status: stock_status || 'in_stock',
      stock_verification_type: 'seller_reported',
      location: {
        city: city || seller.city || 'Ado-Ekiti',
        state: state || seller.state || 'Ekiti',
        address: address || seller.public_contact.address || '',
        delivery_coverage: delivery_coverage && delivery_coverage.length > 0 ? delivery_coverage : [seller.city, seller.state],
      },
      delivery_information: delivery_information || 'Direct contact with seller for delivery arrangement.',
      last_checked_at: now,
      last_updated_at: now,
      listing_status: 'active',
      is_demo: false, // REAL LISTING FROM AUTHENTICATED REGISTERED SELLER
      match_reasons: ['Newly added by registered seller in ' + (city || seller.city)],
      product: newProduct,
      seller,
    };

    db.products.push(newProduct);
    db.listings.unshift(newListing);
    saveDatabase();

    res.status(201).json(newListing);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create listing', details: err.message });
  }
});

/**
 * 10. UPDATE LISTING (SELLER ONLY - OWNERSHIP ENFORCED)
 */
apiRouter.put('/seller/listings/:id', requireAuth, (req: Request, res: Response) => {
  try {
    const sessionUser = (req as any).user;
    const db = getDatabase();
    const listing = db.listings.find((l) => l.id === req.params.id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // OWNERSHIP CHECK: Sellers cannot edit other sellers' listings!
    if (listing.seller_id !== sessionUser.sellerId) {
      return res.status(403).json({ error: 'Access denied: You can only edit your own listings.' });
    }

    const {
      title,
      description,
      category,
      price,
      stock_status,
      delivery_information,
      attributes,
      image_url,
      listing_status,
    } = req.body;

    const now = new Date().toISOString();

    // Update Product
    const product = db.products.find((p) => p.id === listing.product_id);
    if (product) {
      if (title) {
        product.title = title;
        product.normalized_title = title.toLowerCase();
      }
      if (description !== undefined) product.description = description;
      if (category) product.category = category;
      if (attributes) product.attributes = attributes;
      if (image_url) product.image_url = image_url;
      product.updated_at = now;
    }

    // Update Listing
    if (price !== undefined) listing.price = parseFloat(price);
    if (stock_status) listing.stock_status = stock_status;
    if (delivery_information) listing.delivery_information = delivery_information;
    if (listing_status) listing.listing_status = listing_status;
    listing.last_updated_at = now;
    listing.last_checked_at = now;

    saveDatabase();
    res.json({ listing, product });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update listing', details: err.message });
  }
});

/**
 * 11. DELETE / DEACTIVATE LISTING (OWNERSHIP ENFORCED)
 */
apiRouter.delete('/seller/listings/:id', requireAuth, (req: Request, res: Response) => {
  const sessionUser = (req as any).user;
  const db = getDatabase();
  const listingIndex = db.listings.findIndex((l) => l.id === req.params.id);

  if (listingIndex === -1) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const listing = db.listings[listingIndex];
  if (listing.seller_id !== sessionUser.sellerId) {
    return res.status(403).json({ error: 'Access denied: You can only delete your own listings.' });
  }

  db.listings.splice(listingIndex, 1);
  saveDatabase();
  res.json({ message: 'Listing deleted successfully' });
});

/**
 * 12. SUBMIT ACCURACY REPORT
 */
apiRouter.post('/reports', (req: Request, res: Response) => {
  try {
    const { target_type, target_id, target_title, reason, details, reporter_email } = req.body;
    if (!target_id || !reason) {
      return res.status(400).json({ error: 'Target ID and report reason are required.' });
    }

    const db = getDatabase();
    const report: ListingReport = {
      id: `rep_${Date.now()}`,
      target_type: target_type || 'listing',
      target_id,
      target_title,
      reason,
      details: details || '',
      reporter_email,
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    db.reports.push(report);
    saveDatabase();
    res.status(201).json({ message: 'Report submitted successfully. Thank you for keeping LUXA accurate.', report });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit report', details: err.message });
  }
});

/**
 * 13. DISCOVERY SOURCES STATUS
 */
apiRouter.get('/discovery-sources', (req: Request, res: Response) => {
  const db = getDatabase();
  res.json({
    sources: db.discovery_sources,
    stats: {
      total_listings: db.listings.length,
      demo_listings: db.listings.filter((l) => l.is_demo).length,
      registered_seller_listings: db.listings.filter((l) => !l.is_demo).length,
      sellers_count: db.sellers.length,
    },
  });
});
