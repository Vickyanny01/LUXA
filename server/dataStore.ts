import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import {
  Seller,
  Product,
  Listing,
  DiscoverySourceStatus,
  ListingReport,
  UserAccount,
  ProductCategory,
} from '../src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'luxa-db.json');

export interface DatabaseState {
  users: (UserAccount & { password_hash: string; salt: string })[];
  sellers: Seller[];
  products: Product[];
  listings: Listing[];
  discovery_sources: DiscoverySourceStatus[];
  reports: ListingReport[];
  search_history: { id: string; query: string; timestamp: string; results_count: number }[];
  saved_products: { id: string; user_id: string; listing_id: string; created_at: string }[];
}

// In-memory state
let db: DatabaseState = {
  users: [],
  sellers: [],
  products: [],
  listings: [],
  discovery_sources: [],
  reports: [],
  search_history: [],
  saved_products: [],
};

// Simple password hashing
export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 32).toString('hex');
}

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function initDatabase(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed.listings && parsed.listings.length > 0) {
        db = parsed;
        console.log(`[LUXA DB] Loaded ${db.listings.length} listings and ${db.sellers.length} sellers from persistent storage.`);
        return;
      }
    }
  } catch (err) {
    console.warn('[LUXA DB] Failed to read persistent db, reseeding demo data:', err);
  }

  // Seed with rich, compliant demonstration data
  seedInitialData();
  saveDatabase();
}

export function saveDatabase(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[LUXA DB] Error persisting database to disk:', err);
  }
}

export function getDatabase(): DatabaseState {
  return db;
}

function seedInitialData() {
  console.log('[LUXA DB] Seeding initial demonstration data for Ado-Ekiti and Nigeria...');

  const sellerSalt = generateSalt();
  const demoSellers: Seller[] = [
    {
      id: 'seller_ekiti_sound',
      owner_user_id: 'user_fajuyi_sound',
      business_name: 'Fajuyi Digital Audio & Sound Systems',
      description: 'Specialists in podcast mics, studio monitoring, home audio interfaces, and vocal production gear.',
      website: 'https://fajuyisound.example.ng',
      public_contact: {
        phone: '+234 803 456 7890',
        whatsapp: '+234 803 456 7890',
        email: 'sales@fajuyisound.example.ng',
        address: '14 Fajuyi Memorial Square, Adjacent Bank Road, Ado-Ekiti, Ekiti State',
      },
      city: 'Ado-Ekiti',
      state: 'Ekiti',
      country: 'Nigeria',
      verification_status: 'platform_verified',
      verification_details: {
        cac_registered: true,
        physical_store_inspected: true,
        phone_verified: true,
        notes: 'Physical shop verified in Ado-Ekiti. Tested audio equipment with in-store testing booth.',
        verified_at: '2026-08-15T10:00:00Z',
      },
      created_at: '2026-06-10T08:00:00Z',
      updated_at: '2026-10-20T12:00:00Z',
    },
    {
      id: 'seller_ekiti_computers',
      owner_user_id: 'user_ekiti_comp',
      business_name: 'Ekiti Computer Village Hub',
      description: 'Grade-A UK & US used laptops, workstations, DAW-configured systems for music producers and programmers.',
      website: null,
      public_contact: {
        phone: '+234 814 112 3344',
        whatsapp: '+234 814 112 3344',
        email: 'contact@ekiticomp.example.ng',
        address: 'Block C, Suite 4, Adebayo Road / Opposite EKSU Guest House, Ado-Ekiti, Ekiti State',
      },
      city: 'Ado-Ekiti',
      state: 'Ekiti',
      country: 'Nigeria',
      verification_status: 'platform_verified',
      verification_details: {
        cac_registered: true,
        physical_store_inspected: true,
        phone_verified: true,
        notes: 'Registered enterprise. Physical showroom visited in Ado-Ekiti. 6-month hardware warranty provided.',
        verified_at: '2026-07-01T09:30:00Z',
      },
      created_at: '2026-05-14T11:00:00Z',
      updated_at: '2026-10-22T14:15:00Z',
    },
    {
      id: 'seller_crown_sneakers',
      owner_user_id: 'user_crown_kicks',
      business_name: 'Crown Sneaker Vault Ado-Ekiti',
      description: 'Original and authentic lifestyle footwear, casual sneakers, and sports wear for students and young professionals.',
      website: 'https://crownsneakers.example.ng',
      public_contact: {
        phone: '+234 816 778 9900',
        whatsapp: '+234 816 778 9900',
        email: 'crownkicks@example.ng',
        address: '22 Bank Road, Opposite GTBank, Ado-Ekiti, Ekiti State',
      },
      city: 'Ado-Ekiti',
      state: 'Ekiti',
      country: 'Nigeria',
      verification_status: 'business_details_checked',
      verification_details: {
        cac_registered: true,
        physical_store_inspected: false,
        phone_verified: true,
        notes: 'Identity & business registration documentation verified. Store photos validated.',
        verified_at: '2026-09-10T15:00:00Z',
      },
      created_at: '2026-08-01T10:00:00Z',
      updated_at: '2026-10-18T16:00:00Z',
    },
    {
      id: 'seller_ekiti_gadgets',
      owner_user_id: 'user_ekiti_gadgets',
      business_name: 'Osun/Ekiti Gadgets Direct',
      description: 'Authorized retailer of smartphones, tablets, accessories, and power banks with manufacturer warranties.',
      website: null,
      public_contact: {
        phone: '+234 703 998 8112',
        whatsapp: '+234 703 998 8112',
        email: 'orders@gadgetsdirect.example.ng',
        address: '5 Ijigbo Roundabout, Ado-Ekiti, Ekiti State',
      },
      city: 'Ado-Ekiti',
      state: 'Ekiti',
      country: 'Nigeria',
      verification_status: 'platform_verified',
      verification_details: {
        cac_registered: true,
        physical_store_inspected: true,
        phone_verified: true,
        notes: 'Physical shop at Ijigbo Roundabout confirmed. Authorized dealer certificate on file.',
        verified_at: '2026-08-20T11:00:00Z',
      },
      created_at: '2026-04-12T09:00:00Z',
      updated_at: '2026-10-23T11:30:00Z',
    },
    {
      id: 'seller_hilltop_appliances',
      owner_user_id: 'user_hilltop',
      business_name: 'Hilltop Living & Home Essentials',
      description: 'Solar inverters, rechargeable fans, kitchen appliances, and home power backup systems.',
      website: null,
      public_contact: {
        phone: '+234 802 334 5566',
        whatsapp: '+234 802 334 5566',
        address: 'Basiri Road, Near Federal Polytechnic Junction, Ado-Ekiti, Ekiti State',
      },
      city: 'Ado-Ekiti',
      state: 'Ekiti',
      country: 'Nigeria',
      verification_status: 'verification_pending',
      verification_details: {
        cac_registered: false,
        physical_store_inspected: false,
        phone_verified: true,
        notes: 'Seller signed up recently. Phone number verified via SMS OTP; physical inspection pending.',
      },
      created_at: '2026-10-15T14:00:00Z',
      updated_at: '2026-10-20T09:00:00Z',
    },
    {
      id: 'seller_lagos_tech_hub',
      owner_user_id: 'user_lagos_tech',
      business_name: 'Lagos Pro Sound & Tech Outlet',
      description: 'Nationwide distributor of studio equipment, Shure microphones, Focusrite audio interfaces, and studio monitors.',
      website: 'https://lagosprosound.example.ng',
      public_contact: {
        phone: '+234 809 112 2334',
        whatsapp: '+234 809 112 2334',
        email: 'sales@lagosprosound.example.ng',
        address: 'Otigba Street, Computer Village, Ikeja, Lagos State',
      },
      city: 'Lagos',
      state: 'Lagos',
      country: 'Nigeria',
      verification_status: 'platform_verified',
      verification_details: {
        cac_registered: true,
        physical_store_inspected: true,
        phone_verified: true,
        notes: 'Major verified distributor in Ikeja Computer Village with nationwide dispatch via peace mass / god is good logistics to Ekiti.',
        verified_at: '2026-05-10T10:00:00Z',
      },
      created_at: '2026-03-01T10:00:00Z',
      updated_at: '2026-10-21T18:00:00Z',
    },
  ];

  const demoUsers: DatabaseState['users'] = [
    {
      id: 'user_fajuyi_sound',
      email: 'fajuyisound@example.ng',
      role: 'seller',
      seller_id: 'seller_ekiti_sound',
      business_name: 'Fajuyi Digital Audio & Sound Systems',
      created_at: '2026-06-10T08:00:00Z',
      password_hash: hashPassword('password123', sellerSalt),
      salt: sellerSalt,
    },
    {
      id: 'user_ekiti_comp',
      email: 'ekiticomp@example.ng',
      role: 'seller',
      seller_id: 'seller_ekiti_computers',
      business_name: 'Ekiti Computer Village Hub',
      created_at: '2026-05-14T11:00:00Z',
      password_hash: hashPassword('password123', sellerSalt),
      salt: sellerSalt,
    },
    {
      id: 'user_demo_buyer',
      email: 'buyer@example.ng',
      role: 'buyer',
      created_at: '2026-09-01T12:00:00Z',
      password_hash: hashPassword('buyer123', sellerSalt),
      salt: sellerSalt,
    },
  ];

  const demoProducts: Product[] = [
    // 1. Wireless Microphones & Clean Vocals
    {
      id: 'prod_fifine_k688',
      seller_id: 'seller_ekiti_sound',
      title: 'Fifine K688 Dynamic USB/XLR Vocal Studio Microphone',
      normalized_title: 'fifine k688 dynamic usb xlr vocal studio microphone clean vocals recording',
      description: 'Dynamic cardioid microphone engineered for clean vocals at home, music vocal recording, and podcasting. Features dual USB and XLR outputs, built-in headphone monitoring jack, and touch mute.',
      category: 'Accessories',
      attributes: {
        brand: 'Fifine',
        model: 'K688',
        polar_pattern: 'Cardioid',
        connectivity: 'USB-C & XLR Dual Output',
        vocal_clarity: 'Clean studio grade, background noise rejection',
        use_case: 'Clean vocal recording, home studio, music production, streaming',
        accessories: 'Shock mount, USB cable included',
      },
      image_url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-09-01T10:00:00Z',
      updated_at: '2026-10-23T14:00:00Z',
    },
    {
      id: 'prod_boya_byv20',
      seller_id: 'seller_ekiti_sound',
      title: 'Boya BY-V20 Dual Wireless Lavalier Microphone (Type-C / iPhone)',
      normalized_title: 'boya by v20 dual wireless lavalier microphone clean vocals smartphone',
      description: 'Compact 2.4GHz wireless microphone with 2 transmitters and 1 receiver. Noise reduction button provides clean vocal capture in noisy environments. 9 hours battery life.',
      category: 'Accessories',
      attributes: {
        brand: 'Boya',
        model: 'BY-V20',
        connectivity: 'Wireless 2.4GHz',
        range: 'Up to 50 meters',
        battery_life: '9 hours',
        use_case: 'Mobile vocal recording, interviews, content creation, TikTok/Reels',
      },
      image_url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-09-15T12:00:00Z',
      updated_at: '2026-10-20T10:00:00Z',
    },
    {
      id: 'prod_hollyland_lark_m1',
      seller_id: 'seller_lagos_tech_hub',
      title: 'Hollyland Lark M1 Duo Wireless Lapel Microphone Kit',
      normalized_title: 'hollyland lark m1 duo wireless lapel microphone kit clean vocals recording',
      description: 'Premium wireless microphone system with HearClear ambient noise cancellation for studio-quality crystal clean vocal reproduction. Comes with portable charging case.',
      category: 'Accessories',
      attributes: {
        brand: 'Hollyland',
        model: 'Lark M1 Duo',
        connectivity: 'Wireless 2.4GHz',
        battery_life: '20 hours with charging case',
        noise_cancellation: 'HearClear Smart DSP',
        use_case: 'Music demos, vocal interviews, broadcast production',
      },
      image_url: 'https://images.unsplash.com/photo-1583244532610-2a234e7c3eca?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-08-10T11:00:00Z',
      updated_at: '2026-10-22T09:00:00Z',
    },

    // 2. Laptops for Music Production
    {
      id: 'prod_hp_elitebook_840',
      seller_id: 'seller_ekiti_computers',
      title: 'HP EliteBook 840 G6 - Intel Core i7, 16GB RAM, 512GB NVMe SSD',
      normalized_title: 'hp elitebook 840 g6 intel core i7 16gb ram 512gb ssd laptop music production ekiti',
      description: 'Clean UK used flagship laptop pre-configured for music production, digital audio workstations (FL Studio 21, Cubase 12, Ableton Live 11), sound design, and coding. Fast NVMe SSD ensures zero latency.',
      category: 'Computers',
      attributes: {
        brand: 'HP',
        model: 'EliteBook 840 G6',
        processor: 'Intel Core i7-8665U (Up to 4.8GHz Turbo)',
        ram: '16GB DDR4 (Expandable to 32GB)',
        storage: '512GB High-Speed NVMe M.2 SSD',
        screen: '14-inch Full HD Anti-Glare IPS (1920x1080)',
        ports: 'Thunderbolt 3, USB 3.1, HDMI, Audio Combo Jack',
        music_production_tested: 'FL Studio, Cubase, Reaper tested with ASIO drivers',
        condition: 'Grade-A UK Used with 6-month hardware guarantee',
      },
      image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-08-25T14:00:00Z',
      updated_at: '2026-10-24T08:00:00Z',
    },
    {
      id: 'prod_dell_latitude_7490',
      seller_id: 'seller_ekiti_computers',
      title: 'Dell Latitude 7490 Ultrabook - Core i7 8th Gen, 16GB RAM, 512GB SSD',
      normalized_title: 'dell latitude 7490 core i7 8th gen 16gb ram 512gb ssd laptop music production studio',
      description: 'Durable carbon-fiber enterprise laptop with robust cooling for heavy audio rendering and plugins. Tested with heavy VST plugins (Nexus, Omnisphere, Serum) without stutter.',
      category: 'Computers',
      attributes: {
        brand: 'Dell',
        model: 'Latitude 7490',
        processor: 'Intel Core i7-8650U Quad Core',
        ram: '16GB DDR4',
        storage: '512GB SSD',
        screen: '14-inch FHD Display',
        battery: 'Up to 5 hours battery backup',
        condition: 'US Pre-owned, pristine condition',
      },
      image_url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-09-02T16:00:00Z',
      updated_at: '2026-10-23T11:00:00Z',
    },
    {
      id: 'prod_lenovo_thinkpad_t480',
      seller_id: 'seller_ekiti_computers',
      title: 'Lenovo ThinkPad T480 - Core i5 8th Gen, 16GB RAM, 256GB SSD',
      normalized_title: 'lenovo thinkpad t480 core i5 8th gen 16gb ram 256gb ssd laptop music production student',
      description: 'The legendary workhorse ThinkPad with dual battery system. Ideal budget setup for music production beginners, beatmakers, and students in Ekiti State.',
      category: 'Computers',
      attributes: {
        brand: 'Lenovo',
        model: 'ThinkPad T480',
        processor: 'Intel Core i5-8350U Quad Core',
        ram: '16GB RAM',
        storage: '256GB NVMe SSD',
        screen: '14-inch HD Display',
        battery: 'Dual battery system (up to 7 hours)',
        condition: 'Clean UK Used',
      },
      image_url: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-09-10T12:00:00Z',
      updated_at: '2026-10-21T15:30:00Z',
    },

    // 3. Sneakers & Fashion in Ekiti
    {
      id: 'prod_nike_af1_low',
      seller_id: 'seller_crown_sneakers',
      title: 'Nike Air Force 1 07 Low Triple White Sneakers',
      normalized_title: 'nike air force 1 07 low triple white sneakers shoes kicks ado ekiti',
      description: 'Classic iconic street sneakers with padded collar, perforated toe box, and encapsulated Nike Air cushioning. Available in sizes 40 to 45.',
      category: 'Fashion',
      attributes: {
        brand: 'Nike',
        model: 'Air Force 1 07',
        color: 'Triple White',
        sizes_available: '40, 41, 42, 43, 44, 45',
        material: 'Genuine leather upper',
        condition: 'Brand new in box',
      },
      image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-09-20T10:00:00Z',
      updated_at: '2026-10-24T06:00:00Z',
    },
    {
      id: 'prod_adidas_samba_og',
      seller_id: 'seller_crown_sneakers',
      title: 'Adidas Samba OG Black & White Gum Sole Heritage Sneakers',
      normalized_title: 'adidas samba og black white gum sole sneakers shoes ekiti',
      description: 'The trendiest low-profile leather sneaker featuring soft leather upper, suede overlays, and contrast gum rubber outsole. Instant style for daily wear.',
      category: 'Fashion',
      attributes: {
        brand: 'Adidas Originals',
        model: 'Samba OG',
        color: 'Core Black / Footwear White / Gum',
        sizes_available: '41, 42, 43, 44',
        condition: 'Brand new with tags',
      },
      image_url: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-09-25T11:00:00Z',
      updated_at: '2026-10-22T17:00:00Z',
    },
    {
      id: 'prod_nb_550_lifestyle',
      seller_id: 'seller_crown_sneakers',
      title: 'New Balance 550 Retro Basketball Lifestyle Sneakers',
      normalized_title: 'new balance 550 retro basketball lifestyle sneakers footwear ado ekiti',
      description: 'Streamlined silhouette inspired by late 80s pro basketball kicks. Clean white leather construction with forest green accents.',
      category: 'Fashion',
      attributes: {
        brand: 'New Balance',
        model: '550',
        color: 'White with Forest Green',
        sizes_available: '42, 43, 44, 45',
        condition: 'Brand new with original packaging',
      },
      image_url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-10-01T14:00:00Z',
      updated_at: '2026-10-23T12:00:00Z',
    },

    // 4. Phones & Gadgets under 300,000 Naira
    {
      id: 'prod_redmi_note_13',
      seller_id: 'seller_ekiti_gadgets',
      title: 'Xiaomi Redmi Note 13 (8GB RAM + 256GB Storage, 108MP Camera)',
      normalized_title: 'xiaomi redmi note 13 8gb ram 256gb storage 108mp camera smartphone ado ekiti phone',
      description: 'Stunning 6.67" AMOLED 120Hz display, flagship-level 108MP triple camera, 5000mAh battery with 33W fast charger inside the box. Official 13-month warranty.',
      category: 'Phones and Gadgets',
      attributes: {
        brand: 'Xiaomi Redmi',
        model: 'Note 13 4G',
        ram: '8GB (+8GB Virtual RAM Expansion)',
        storage: '256GB Internal Storage',
        battery: '5000mAh with 33W Fast Charger',
        display: '6.67" AMOLED 120Hz, 1800 nits peak brightness',
        camera: '108MP Ultra-clear Main + 8MP Ultra-wide + 2MP Macro',
        condition: 'Brand New Sealed in Box (Official Nigerian Warranty)',
      },
      image_url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-09-05T09:00:00Z',
      updated_at: '2026-10-24T05:00:00Z',
    },
    {
      id: 'prod_samsung_galaxy_a15',
      seller_id: 'seller_ekiti_gadgets',
      title: 'Samsung Galaxy A15 (6GB RAM + 128GB ROM, Super AMOLED 90Hz)',
      normalized_title: 'samsung galaxy a15 6gb ram 128gb rom smartphone under 300000 phone ekiti',
      description: 'Vibrant 6.5" Super AMOLED screen with Vision Booster, 50MP triple rear camera system, guaranteed 4 OS upgrades and 5 years security updates.',
      category: 'Phones and Gadgets',
      attributes: {
        brand: 'Samsung',
        model: 'Galaxy A15',
        ram: '6GB RAM',
        storage: '128GB (MicroSD expandable up to 1TB)',
        battery: '5000mAh with 25W Super Fast Charging support',
        display: '6.5" FHD+ Super AMOLED 90Hz',
        condition: 'Brand New (Samsung Nigeria Warranty)',
      },
      image_url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-08-30T10:00:00Z',
      updated_at: '2026-10-23T16:00:00Z',
    },
    {
      id: 'prod_tecno_camon_30',
      seller_id: 'seller_ekiti_gadgets',
      title: 'Tecno Camon 30 (8GB RAM + 256GB Storage, 50MP OIS Selfie Camera)',
      normalized_title: 'tecno camon 30 8gb ram 256gb storage phone camera ado ekiti under 300000',
      description: 'Photography powerhouse featuring 50MP front and rear sensors with Optical Image Stabilization (OIS), MediaTek Helio G99 Ultimate, and 70W Ultra Charge.',
      category: 'Phones and Gadgets',
      attributes: {
        brand: 'Tecno',
        model: 'Camon 30',
        ram: '8GB',
        storage: '256GB',
        charging: '70W Ultra Fast Charge (0 to 100% in 45 mins)',
        camera: '50MP OIS Night Camera + 50MP Eye-tracking AF Selfie',
        condition: 'Brand New Sealed with Carlcare 12+1 Warranty',
      },
      image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02560?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-09-12T15:00:00Z',
      updated_at: '2026-10-22T13:00:00Z',
    },

    // 5. Appliances & Living
    {
      id: 'prod_qasa_fan',
      seller_id: 'seller_hilltop_appliances',
      title: 'QASA 18" Solar & AC/DC Rechargeable Standing Fan with Remote Control',
      normalized_title: 'qasa 18 solar ac dc rechargeable standing fan remote control power backup ekiti',
      description: 'Heavy duty rechargeable standing fan designed for unreliable power supply. Operates for 12 hours on low speed on battery, with solar input port, USB phone charger output, and LED night light.',
      category: 'Appliances',
      attributes: {
        brand: 'QASA',
        blade_size: '18 inches',
        battery: '12V 4.5Ah Rechargeable Lead-Acid Battery',
        duration: 'Up to 12 hours run time',
        solar_compatible: 'Direct 16V solar panel charging port',
        extras: 'USB mobile charging port, full remote control',
      },
      image_url: 'https://images.unsplash.com/photo-1618941716939-553df3c6c278?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-10-15T14:30:00Z',
      updated_at: '2026-10-24T04:00:00Z',
    },
  ];

  const demoListings: Listing[] = [
    // 1. Fifine K688
    {
      id: 'list_fifine_001',
      product_id: 'prod_fifine_k688',
      seller_id: 'seller_ekiti_sound',
      seller_name: 'Fajuyi Digital Audio & Sound Systems',
      source_type: 'demo',
      source_name: 'Fajuyi Digital Audio Showroom (Ado-Ekiti)',
      source_url: 'https://fajuyisound.example.ng/products/fifine-k688',
      price: 45000,
      currency: 'NGN',
      stock_status: 'in_stock',
      stock_verification_type: 'seller_reported',
      location: {
        city: 'Ado-Ekiti',
        state: 'Ekiti',
        address: '14 Fajuyi Memorial Square, Beside Bank Road, Ado-Ekiti',
        delivery_coverage: ['Ado-Ekiti', 'Ikere-Ekiti', 'Oye-Ekiti', 'Ekiti State', 'Nationwide Dispatch'],
      },
      delivery_information: 'Same-day pickup available in Ado-Ekiti; 1-day dispatch to other parts of Ekiti State.',
      last_checked_at: '2026-10-23T14:00:00Z',
      last_updated_at: '2026-10-23T14:00:00Z',
      listing_status: 'active',
      is_demo: true,
      match_reasons: ['In stock locally in Ado-Ekiti', 'Priced under ₦50,000 budget', 'Specialized for clean vocals & music recording'],
    },
    // 2. Boya BY-V20
    {
      id: 'list_boya_002',
      product_id: 'prod_boya_byv20',
      seller_id: 'seller_ekiti_sound',
      seller_name: 'Fajuyi Digital Audio & Sound Systems',
      source_type: 'demo',
      source_name: 'Fajuyi Digital Audio Showroom (Ado-Ekiti)',
      source_url: null,
      price: 38500,
      currency: 'NGN',
      stock_status: 'in_stock',
      stock_verification_type: 'seller_reported',
      location: {
        city: 'Ado-Ekiti',
        state: 'Ekiti',
        address: '14 Fajuyi Memorial Square, Ado-Ekiti',
        delivery_coverage: ['Ado-Ekiti', 'Ekiti State'],
      },
      delivery_information: 'Immediate pickup at store or dispatch rider within Ado-Ekiti (₦1,000 delivery fee).',
      last_checked_at: '2026-10-20T10:00:00Z',
      last_updated_at: '2026-10-20T10:00:00Z',
      listing_status: 'active',
      is_demo: true,
      match_reasons: ['Budget-friendly wireless microphone', 'Under ₦50,000', 'Local seller in Ekiti State'],
    },
    // 3. Hollyland Lark M1
    {
      id: 'list_hollyland_003',
      product_id: 'prod_hollyland_lark_m1',
      seller_id: 'seller_lagos_tech_hub',
      seller_name: 'Lagos Pro Sound & Tech Outlet',
      source_type: 'demo',
      source_name: 'Lagos Pro Sound (Nationwide Dispatch)',
      source_url: 'https://lagosprosound.example.ng/gear/hollyland-m1',
      price: 98000,
      currency: 'NGN',
      stock_status: 'in_stock',
      stock_verification_type: 'independently_confirmed',
      location: {
        city: 'Lagos',
        state: 'Lagos',
        address: 'Otigba St, Computer Village, Ikeja',
        delivery_coverage: ['Lagos', 'Ekiti State', 'Nationwide'],
      },
      delivery_information: 'Express courier delivery to Ado-Ekiti terminal via GIGM / Peace Mass (takes 24-48 hours).',
      last_checked_at: '2026-10-22T09:00:00Z',
      last_updated_at: '2026-10-22T09:00:00Z',
      listing_status: 'active',
      is_demo: true,
      match_reasons: ['Studio-grade dual channel wireless lapel microphone', 'Clean DSP noise reduction'],
    },
    // 4. HP EliteBook 840 G6 for Music Production
    {
      id: 'list_hp_004',
      product_id: 'prod_hp_elitebook_840',
      seller_id: 'seller_ekiti_computers',
      seller_name: 'Ekiti Computer Village Hub',
      source_type: 'demo',
      source_name: 'Ekiti Computer Village Showroom (Adebayo Rd)',
      source_url: null,
      price: 235000,
      currency: 'NGN',
      stock_status: 'in_stock',
      stock_verification_type: 'seller_reported',
      location: {
        city: 'Ado-Ekiti',
        state: 'Ekiti',
        address: 'Block C, Suite 4, Adebayo Road, Ado-Ekiti',
        delivery_coverage: ['Ado-Ekiti', 'Ikere-Ekiti', 'Oye-Ekiti', 'Ekiti State'],
      },
      delivery_information: 'Free setup and testing in shop. Delivery available anywhere in Ekiti within 24 hours.',
      last_checked_at: '2026-10-24T08:00:00Z',
      last_updated_at: '2026-10-24T08:00:00Z',
      listing_status: 'active',
      is_demo: true,
      match_reasons: ['Under ₦250,000 budget (₦235,000)', '16GB RAM + Core i7 for music production', 'Located physically in Ado-Ekiti'],
    },
    // 5. Dell Latitude 7490
    {
      id: 'list_dell_005',
      product_id: 'prod_dell_latitude_7490',
      seller_id: 'seller_ekiti_computers',
      seller_name: 'Ekiti Computer Village Hub',
      source_type: 'demo',
      source_name: 'Ekiti Computer Village Showroom (Adebayo Rd)',
      source_url: null,
      price: 245000,
      currency: 'NGN',
      stock_status: 'in_stock',
      stock_verification_type: 'seller_reported',
      location: {
        city: 'Ado-Ekiti',
        state: 'Ekiti',
        address: 'Block C, Suite 4, Adebayo Road, Ado-Ekiti',
        delivery_coverage: ['Ado-Ekiti', 'Ekiti State'],
      },
      delivery_information: 'Physical inspection and testing welcome. Pre-installed DAWs available on request.',
      last_checked_at: '2026-10-23T11:00:00Z',
      last_updated_at: '2026-10-23T11:00:00Z',
      listing_status: 'active',
      is_demo: true,
      match_reasons: ['Within ₦250,000 budget', '16GB RAM + 512GB SSD for music plugins', 'In Ado-Ekiti'],
    },
    // 6. Lenovo ThinkPad T480
    {
      id: 'list_lenovo_006',
      product_id: 'prod_lenovo_thinkpad_t480',
      seller_id: 'seller_ekiti_computers',
      seller_name: 'Ekiti Computer Village Hub',
      source_type: 'demo',
      source_name: 'Ekiti Computer Village Showroom',
      source_url: null,
      price: 195000,
      currency: 'NGN',
      stock_status: 'low_stock',
      stock_verification_type: 'seller_reported',
      location: {
        city: 'Ado-Ekiti',
        state: 'Ekiti',
        address: 'Adebayo Road, Ado-Ekiti',
        delivery_coverage: ['Ado-Ekiti', 'Ekiti State'],
      },
      delivery_information: 'Store pickup or doorstep delivery in Ado.',
      last_checked_at: '2026-10-21T15:30:00Z',
      last_updated_at: '2026-10-21T15:30:00Z',
      listing_status: 'active',
      is_demo: true,
      match_reasons: ['Super affordable (under ₦200k)', '16GB RAM for audio work'],
    },
    // 7. Nike Air Force 1
    {
      id: 'list_af1_007',
      product_id: 'prod_nike_af1_low',
      seller_id: 'seller_crown_sneakers',
      seller_name: 'Crown Sneaker Vault Ado-Ekiti',
      source_type: 'demo',
      source_name: 'Crown Sneaker Vault (Bank Rd, Ado-Ekiti)',
      source_url: 'https://crownsneakers.example.ng/af1',
      price: 32000,
      currency: 'NGN',
      stock_status: 'in_stock',
      stock_verification_type: 'seller_reported',
      location: {
        city: 'Ado-Ekiti',
        state: 'Ekiti',
        address: '22 Bank Road, Opposite GTBank, Ado-Ekiti',
        delivery_coverage: ['Ado-Ekiti', 'Ekiti State', 'Nationwide'],
      },
      delivery_information: 'Walk into store to try on sizes. Dispatch rider across Ado-Ekiti within 2 hours.',
      last_checked_at: '2026-10-24T06:00:00Z',
      last_updated_at: '2026-10-24T06:00:00Z',
      listing_status: 'active',
      is_demo: true,
      match_reasons: ['Affordable sneakers in Ado-Ekiti (₦32,000)', 'Verified business details'],
    },
    // 8. Adidas Samba OG
    {
      id: 'list_samba_008',
      product_id: 'prod_adidas_samba_og',
      seller_id: 'seller_crown_sneakers',
      seller_name: 'Crown Sneaker Vault Ado-Ekiti',
      source_type: 'demo',
      source_name: 'Crown Sneaker Vault (Bank Rd, Ado-Ekiti)',
      source_url: 'https://crownsneakers.example.ng/samba',
      price: 38000,
      currency: 'NGN',
      stock_status: 'in_stock',
      stock_verification_type: 'seller_reported',
      location: {
        city: 'Ado-Ekiti',
        state: 'Ekiti',
        address: '22 Bank Road, Ado-Ekiti',
        delivery_coverage: ['Ado-Ekiti', 'Ekiti State'],
      },
      delivery_information: 'Pickup available today.',
      last_checked_at: '2026-10-22T17:00:00Z',
      last_updated_at: '2026-10-22T17:00:00Z',
      listing_status: 'active',
      is_demo: true,
      match_reasons: ['Trendy sneakers available in Ekiti', 'Competitive price'],
    },
    // 9. New Balance 550
    {
      id: 'list_nb_009',
      product_id: 'prod_nb_550_lifestyle',
      seller_id: 'seller_crown_sneakers',
      seller_name: 'Crown Sneaker Vault Ado-Ekiti',
      source_type: 'demo',
      source_name: 'Crown Sneaker Vault',
      source_url: null,
      price: 35000,
      currency: 'NGN',
      stock_status: 'low_stock',
      stock_verification_type: 'seller_reported',
      location: {
        city: 'Ado-Ekiti',
        state: 'Ekiti',
        address: 'Bank Road, Ado-Ekiti',
        delivery_coverage: ['Ado-Ekiti'],
      },
      delivery_information: 'Only a few pairs remaining in sizes 42 and 43.',
      last_checked_at: '2026-10-23T12:00:00Z',
      last_updated_at: '2026-10-23T12:00:00Z',
      listing_status: 'active',
      is_demo: true,
      match_reasons: ['Affordable stylish sneakers in Ekiti'],
    },
    // 10. Redmi Note 13
    {
      id: 'list_redmi_010',
      product_id: 'prod_redmi_note_13',
      seller_id: 'seller_ekiti_gadgets',
      seller_name: 'Osun/Ekiti Gadgets Direct',
      source_type: 'demo',
      source_name: 'Osun/Ekiti Gadgets Direct (Ijigbo Roundabout)',
      source_url: null,
      price: 215000,
      currency: 'NGN',
      stock_status: 'in_stock',
      stock_verification_type: 'independently_confirmed',
      location: {
        city: 'Ado-Ekiti',
        state: 'Ekiti',
        address: '5 Ijigbo Roundabout, Ado-Ekiti',
        delivery_coverage: ['Ado-Ekiti', 'Ikere-Ekiti', 'Ekiti State'],
      },
      delivery_information: 'In-store collection or express delivery within Ado-Ekiti in 1 hour.',
      last_checked_at: '2026-10-24T05:00:00Z',
      last_updated_at: '2026-10-24T05:00:00Z',
      listing_status: 'active',
      is_demo: true,
      match_reasons: ['Priced under ₦300,000 (₦215,000)', '108MP camera + AMOLED screen', 'In stock at Ijigbo Roundabout'],
    },
    // 11. Samsung Galaxy A15
    {
      id: 'list_samsung_011',
      product_id: 'prod_samsung_galaxy_a15',
      seller_id: 'seller_ekiti_gadgets',
      seller_name: 'Osun/Ekiti Gadgets Direct',
      source_type: 'demo',
      source_name: 'Osun/Ekiti Gadgets Direct',
      source_url: null,
      price: 238000,
      currency: 'NGN',
      stock_status: 'in_stock',
      stock_verification_type: 'independently_confirmed',
      location: {
        city: 'Ado-Ekiti',
        state: 'Ekiti',
        address: '5 Ijigbo Roundabout, Ado-Ekiti',
        delivery_coverage: ['Ado-Ekiti', 'Ekiti State'],
      },
      delivery_information: 'Full official Samsung warranty card registered upon purchase.',
      last_checked_at: '2026-10-23T16:00:00Z',
      last_updated_at: '2026-10-23T16:00:00Z',
      listing_status: 'active',
      is_demo: true,
      match_reasons: ['Priced under ₦300,000 (₦238,000)', 'AMOLED screen & Samsung durability'],
    },
    // 12. Tecno Camon 30
    {
      id: 'list_tecno_012',
      product_id: 'prod_tecno_camon_30',
      seller_id: 'seller_ekiti_gadgets',
      seller_name: 'Osun/Ekiti Gadgets Direct',
      source_type: 'demo',
      source_name: 'Osun/Ekiti Gadgets Direct',
      source_url: null,
      price: 285000,
      currency: 'NGN',
      stock_status: 'in_stock',
      stock_verification_type: 'seller_reported',
      location: {
        city: 'Ado-Ekiti',
        state: 'Ekiti',
        address: '5 Ijigbo Roundabout, Ado-Ekiti',
        delivery_coverage: ['Ado-Ekiti', 'Ekiti State'],
      },
      delivery_information: 'Available in store.',
      last_checked_at: '2026-10-22T13:00:00Z',
      last_updated_at: '2026-10-22T13:00:00Z',
      listing_status: 'active',
      is_demo: true,
      match_reasons: ['Under ₦300,000 budget (₦285,000)', 'Flagship 50MP OIS camera'],
    },
    // 13. QASA Rechargeable Fan
    {
      id: 'list_qasa_013',
      product_id: 'prod_qasa_fan',
      seller_id: 'seller_hilltop_appliances',
      seller_name: 'Hilltop Living & Home Essentials',
      source_type: 'demo',
      source_name: 'Hilltop Store (Basiri, Ado-Ekiti)',
      source_url: null,
      price: 58000,
      currency: 'NGN',
      stock_status: 'in_stock',
      stock_verification_type: 'seller_reported',
      location: {
        city: 'Ado-Ekiti',
        state: 'Ekiti',
        address: 'Basiri Road, Ado-Ekiti',
        delivery_coverage: ['Ado-Ekiti'],
      },
      delivery_information: 'Doorstep delivery via tricycle dispatch in Ado-Ekiti.',
      last_checked_at: '2026-10-24T04:00:00Z',
      last_updated_at: '2026-10-24T04:00:00Z',
      listing_status: 'active',
      is_demo: true,
      match_reasons: ['Rechargeable battery fan with solar input', 'In Ado-Ekiti'],
    },
  ];

  const discoverySources: DiscoverySourceStatus[] = [
    {
      id: 'src_registered_sellers',
      name: 'LUXA Registered Sellers Catalog',
      type: 'registered_sellers',
      status: 'operational',
      description: 'Verified seller profiles, live store inventories, and direct WhatsApp contacts.',
      env_keys: [],
      is_configured: true,
      notes: 'Active. Supports merchant onboarding, product management, and real-time inventory updates.',
      last_sync: new Date().toISOString(),
    },
    {
      id: 'src_gemma_ai',
      name: 'Gemma Natural Language Intent Parser',
      type: 'gemma_ai',
      status: process.env.GEMMA_API_URL && process.env.GEMMA_API_KEY ? 'operational' : 'simulated_fallback',
      description: 'Server-side inference adapter for Gemma 2 models to convert natural language queries into validated shopping intent schemas.',
      env_keys: ['GEMMA_API_URL', 'GEMMA_API_KEY', 'GEMMA_MODEL_ID'],
      is_configured: Boolean(process.env.GEMMA_API_URL && process.env.GEMMA_API_KEY),
      notes: process.env.GEMMA_API_URL && process.env.GEMMA_API_KEY
        ? 'Connected to configured Gemma endpoint.'
        : 'Gemma API keys not provided in environment. LUXA is running in robust Nigerian NLP Rule Engine fallback mode.',
      last_sync: null,
    },
    {
      id: 'src_external_web',
      name: 'External Web Discovery Adapter (Source B)',
      type: 'external_web_search',
      status: process.env.EXTERNAL_SEARCH_API_KEY ? 'operational' : 'pending_credentials',
      description: 'Authorized public product search & retailer indexing API to discover external web listings across Nigerian stores.',
      env_keys: ['EXTERNAL_SEARCH_API_URL', 'EXTERNAL_SEARCH_API_KEY'],
      is_configured: Boolean(process.env.EXTERNAL_SEARCH_API_KEY),
      notes: process.env.EXTERNAL_SEARCH_API_KEY
        ? 'External web search adapter active.'
        : 'External web discovery credentials not configured in .env. External web discovery is paused while preserving catalog search.',
      last_sync: null,
    },
    {
      id: 'src_ekiti_directory',
      name: 'Ekiti State Business Directory',
      type: 'public_directories',
      status: 'operational',
      description: 'Curated directory of physical retailers in Ado-Ekiti (Fajuyi, Adebayo, Bank Rd, Ijigbo) and across Ekiti State.',
      env_keys: [],
      is_configured: true,
      notes: 'Demonstration and physical directory active.',
      last_sync: new Date().toISOString(),
    },
  ];

  db = {
    users: demoUsers,
    sellers: demoSellers,
    products: demoProducts,
    listings: demoListings,
    discovery_sources: discoverySources,
    reports: [],
    search_history: [],
    saved_products: [],
  };
}
