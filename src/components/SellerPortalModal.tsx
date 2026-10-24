import React, { useState, useEffect } from 'react';
import {
  X,
  Store,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Package,
  Layers,
  MapPin,
  Lock,
  Mail,
  Phone,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { api } from '../services/api';
import { UserAccount, Seller, Listing, ProductCategory, StockStatus } from '../types/index';

interface SellerPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  currentSeller: Seller | null;
  onAuthSuccess: (user: UserAccount, seller?: Seller) => void;
  onCatalogChanged: () => void;
}

export const SellerPortalModal: React.FC<SellerPortalModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentSeller,
  onAuthSuccess,
  onCatalogChanged,
}) => {
  // Auth state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Ado-Ekiti');
  const [state, setState] = useState('Ekiti');
  const [description, setDescription] = useState('');

  // Dashboard state
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New product form modal/drawer
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingListingId, setEditingListingId] = useState<string | null>(null);

  // Product form fields
  const [prodTitle, setProdTitle] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('Computers');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodStock, setProdStock] = useState<StockStatus>('in_stock');
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodDelivery, setProdDelivery] = useState('Store pickup or dispatch delivery in Ado-Ekiti');
  const [prodSpecs, setProdSpecs] = useState('RAM: 16GB, Storage: 512GB SSD');

  useEffect(() => {
    if (currentUser?.seller_id) {
      loadMyListings();
    }
  }, [currentUser]);

  const loadMyListings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getMyListings();
      setMyListings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your listings');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (authMode === 'login') {
        const res = await api.login(email, password);
        onAuthSuccess(res.user, res.seller);
        setSuccessMsg('Logged in successfully!');
      } else {
        const res = await api.registerSeller({
          email,
          password,
          business_name: businessName,
          phone,
          whatsapp: phone,
          address,
          city,
          state,
          country: 'Nigeria',
          description,
        });
        onAuthSuccess(res.user, res.seller);
        setSuccessMsg('Seller account registered! Note: New accounts start with Unverified status until CAC / physical store inspection is completed.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      // Parse key-value specs
      const specObj: Record<string, string> = {};
      if (prodSpecs) {
        prodSpecs.split(',').forEach((item) => {
          const parts = item.split(':');
          if (parts.length === 2) {
            specObj[parts[0].trim()] = parts[1].trim();
          }
        });
      }

      if (editingListingId) {
        await api.updateListing(editingListingId, {
          title: prodTitle,
          category: prodCategory,
          price: parseFloat(prodPrice),
          description: prodDescription,
          stock_status: prodStock,
          delivery_information: prodDelivery,
          attributes: specObj,
          image_url: prodImageUrl || undefined,
        });
        setSuccessMsg('Product updated successfully!');
      } else {
        await api.createListing({
          title: prodTitle,
          category: prodCategory,
          price: parseFloat(prodPrice),
          description: prodDescription,
          stock_status: prodStock,
          delivery_information: prodDelivery,
          attributes: specObj,
          image_url: prodImageUrl || undefined,
          city: currentSeller?.city || 'Ado-Ekiti',
          state: currentSeller?.state || 'Ekiti',
        });
        setSuccessMsg('New product published to LUXA catalog!');
      }

      setIsAddingProduct(false);
      setEditingListingId(null);
      resetProductForm();
      await loadMyListings();
      onCatalogChanged();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from LUXA?')) return;
    try {
      await api.deleteListing(id);
      setSuccessMsg('Listing removed from catalog.');
      await loadMyListings();
      onCatalogChanged();
    } catch (err: any) {
      setError(err.message || 'Failed to delete listing');
    }
  };

  const startEditListing = (listing: Listing) => {
    setEditingListingId(listing.id);
    setProdTitle(listing.product?.title || '');
    setProdCategory(listing.product?.category || 'Computers');
    setProdPrice(listing.price.toString());
    setProdDescription(listing.product?.description || '');
    setProdStock(listing.stock_status);
    setProdImageUrl(listing.product?.image_url || '');
    setProdDelivery(listing.delivery_information || '');
    const specsStr = Object.entries(listing.product?.attributes || {})
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    setProdSpecs(specsStr);
    setIsAddingProduct(true);
  };

  const resetProductForm = () => {
    setProdTitle('');
    setProdCategory('Computers');
    setProdPrice('');
    setProdDescription('');
    setProdStock('in_stock');
    setProdImageUrl('');
    setProdDelivery('Store pickup or dispatch delivery in Ado-Ekiti');
    setProdSpecs('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-emerald-400 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {currentUser?.seller_id ? 'Seller Dashboard' : 'Merchant Portal & Registration'}
              </h2>
              <p className="text-xs text-neutral-500">
                {currentUser?.seller_id ? currentSeller?.business_name : 'List your store inventory on LUXA in Ekiti & nationwide'}
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

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shrink-0">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto p-6">
          {!currentUser?.seller_id ? (
            /* AUTHENTICATION VIEW */
            <div className="max-w-md mx-auto space-y-6">
              {/* Tab Selector */}
              <div className="flex p-1 bg-neutral-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'login' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Sign In to Store
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'register' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  Register New Business
                </button>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs">
                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block font-semibold text-neutral-800 mb-1">
                        Business / Store Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Fajuyi Sound Systems or Adebayo Tech Hub"
                        className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-neutral-800 mb-1">
                          Phone / WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+234 803 123 4567"
                          className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-neutral-800 mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Ado-Ekiti"
                          className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-800 mb-1">
                        Physical Storefront Address in Ekiti / Nigeria
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. 14 Fajuyi Memorial Square, Ado-Ekiti"
                        className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-800 mb-1">
                        Store Overview / Specialization
                      </label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Specialist in audio interfaces, microphones, and studio gear..."
                        className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="merchant@example.ng"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-neutral-800 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full p-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>

                {authMode === 'register' && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                    <p className="font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Verification Rule Note:</span>
                    </p>
                    <p>
                      Creating an account gives you instant catalog publishing access, but does not grant instant &ldquo;Platform Verified&rdquo; status. Our Ekiti verification agent inspects CAC / physical location before upgrading badges.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-sm rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{authMode === 'login' ? 'Sign In to Portal' : 'Register Store'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* SELLER LOGGED IN DASHBOARD */
            <div className="space-y-6">
              {/* Top Seller Status Bar */}
              <div className="p-4 rounded-2xl bg-neutral-900 text-white flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                    Verified Merchant Account
                  </span>
                  <h3 className="text-lg font-bold font-sans">
                    {currentSeller?.business_name}
                  </h3>
                  <p className="text-xs text-neutral-400">
                    {currentSeller?.city}, {currentSeller?.state} &bull; Status:{' '}
                    <span className="text-emerald-300 font-semibold uppercase">
                      {currentSeller?.verification_status.replace('_', ' ')}
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => {
                    resetProductForm();
                    setEditingListingId(null);
                    setIsAddingProduct(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product Listing</span>
                </button>
              </div>

              {/* Add/Edit Product Modal/Drawer */}
              {isAddingProduct && (
                <div className="p-5 rounded-2xl border-2 border-neutral-900 bg-neutral-50 space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                    <h3 className="text-sm font-bold text-neutral-900">
                      {editingListingId ? 'Edit Product Listing' : 'Publish New Product to LUXA Catalog'}
                    </h3>
                    <button
                      onClick={() => setIsAddingProduct(false)}
                      className="text-neutral-500 hover:text-neutral-800 text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                  <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                    <div>
                      <label className="block font-semibold text-neutral-800 mb-1">
                        Product Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={prodTitle}
                        onChange={(e) => setProdTitle(e.target.value)}
                        placeholder="e.g. Fifine K688 Dynamic Vocal Microphone or HP EliteBook 840 G6"
                        className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-neutral-800 mb-1">Category *</label>
                        <select
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value as ProductCategory)}
                          className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        >
                          <option value="Phones and Gadgets">Phones and Gadgets</option>
                          <option value="Computers">Computers</option>
                          <option value="Fashion">Fashion</option>
                          <option value="Home and Living">Home and Living</option>
                          <option value="Beauty">Beauty</option>
                          <option value="Groceries">Groceries</option>
                          <option value="Accessories">Accessories</option>
                          <option value="Appliances">Appliances</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-800 mb-1">Price (₦ NGN) *</label>
                        <input
                          type="number"
                          required
                          value={prodPrice}
                          onChange={(e) => setProdPrice(e.target.value)}
                          placeholder="e.g. 45000"
                          className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-800 mb-1">Stock Status</label>
                        <select
                          value={prodStock}
                          onChange={(e) => setProdStock(e.target.value as StockStatus)}
                          className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        >
                          <option value="in_stock">In Stock</option>
                          <option value="low_stock">Low Stock</option>
                          <option value="out_of_stock">Out of Stock</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-800 mb-1">
                        Description & Suitability
                      </label>
                      <textarea
                        rows={2}
                        value={prodDescription}
                        onChange={(e) => setProdDescription(e.target.value)}
                        placeholder="Clean vocals, home music recording, podcasting setup with dual USB/XLR output..."
                        className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-neutral-800 mb-1">
                          Specifications (Key: Value, comma-separated)
                        </label>
                        <input
                          type="text"
                          value={prodSpecs}
                          onChange={(e) => setProdSpecs(e.target.value)}
                          placeholder="RAM: 16GB, Storage: 512GB SSD, Connectivity: Wireless"
                          className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-neutral-800 mb-1">
                          Image URL (Optional)
                        </label>
                        <input
                          type="url"
                          value={prodImageUrl}
                          onChange={(e) => setProdImageUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-neutral-800 mb-1">
                        Delivery & Pickup Coverage
                      </label>
                      <input
                        type="text"
                        value={prodDelivery}
                        onChange={(e) => setProdDelivery(e.target.value)}
                        placeholder="Same day pickup at shop in Ado-Ekiti; 24h dispatch to Ikere and Oye"
                        className="w-full p-2.5 bg-white border border-neutral-200 rounded-xl text-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                      />
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsAddingProduct(false)}
                        className="px-4 py-2 border border-neutral-200 rounded-xl text-neutral-700 font-semibold hover:bg-neutral-100 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-5 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        {isLoading ? 'Saving...' : editingListingId ? 'Save Changes' : 'Publish Listing'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* My Products Table */}
              <div>
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider mb-3">
                  Your Catalog Listings ({myListings.length})
                </h3>

                {isLoading && myListings.length === 0 ? (
                  <div className="p-8 text-center text-xs text-neutral-500">
                    Loading your catalog...
                  </div>
                ) : myListings.length === 0 ? (
                  <div className="p-8 rounded-2xl border border-neutral-200 bg-neutral-50 text-center space-y-2">
                    <Package className="w-8 h-8 text-neutral-400 mx-auto" />
                    <h4 className="text-sm font-bold text-neutral-800">
                      No products listed yet
                    </h4>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                      Start discovering buyers in Ado-Ekiti and Ekiti State by listing your first product above.
                    </p>
                  </div>
                ) : (
                  <div className="border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100 text-xs">
                    {myListings.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden shrink-0">
                            <img
                              src={item.product?.image_url}
                              alt={item.product?.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="font-bold text-neutral-900 text-sm">
                              {item.product?.title}
                            </h4>
                            <div className="flex items-center gap-2 text-neutral-500 text-[11px] mt-0.5">
                              <span>{item.product?.category}</span>
                              <span>&bull;</span>
                              <span className="font-semibold text-emerald-700 capitalize">
                                {item.stock_status.replace('_', ' ')}
                              </span>
                              <span>&bull;</span>
                              <span>Updated {new Date(item.last_updated_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-4">
                          <span className="text-sm font-extrabold text-neutral-900 font-sans">
                            ₦{item.price.toLocaleString('en-NG')}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => startEditListing(item)}
                              className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                              title="Edit listing"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteListing(item.id)}
                              className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
