import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS, INITIAL_SUPPLIES, DEFAULT_STORE_SETTINGS } from './src/data/initialData';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Dedicated server data directory for automatic multi-device synchronization
const DATA_DIR = path.join(process.cwd(), 'data', 'cloud_state');
const STORE_FILE = path.join(DATA_DIR, 'server_store.json');

interface ServerStore {
  version: number;
  updatedAt: string;
  supabaseConfig: {
    url: string;
    key: string;
  };
  orders: any[];
  products: any[];
  supplies: any[];
  settings: any | null;
  categories: any[];
}

let store: ServerStore = {
  version: Date.now(),
  updatedAt: new Date().toISOString(),
  supabaseConfig: {
    url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
    key: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '',
  },
  orders: [],
  products: INITIAL_PRODUCTS,
  supplies: INITIAL_SUPPLIES,
  settings: DEFAULT_STORE_SETTINGS,
  categories: [],
};

// Load persistent data from disk if it exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(STORE_FILE)) {
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    store = {
      ...store,
      ...parsed,
      version: parsed.version || Date.now(),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      supabaseConfig: {
        url: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || parsed.supabaseConfig?.url || '',
        key: process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || parsed.supabaseConfig?.key || '',
      },
    };
  }

  // Ensure default seeds if arrays are empty
  if (!store.products || store.products.length === 0) {
    store.products = INITIAL_PRODUCTS;
  }
  if (!store.supplies || store.supplies.length === 0) {
    store.supplies = INITIAL_SUPPLIES;
  }
  if (!store.settings) {
    store.settings = DEFAULT_STORE_SETTINGS;
  }
} catch (err) {
  console.error('[Server Storage] Error initializing store:', err);
}

const persistStore = () => {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Server Storage] Error writing store file:', err);
  }
};

const touchStore = () => {
  store.version = Date.now();
  store.updatedAt = new Date().toISOString();
  persistStore();
};

// Initial write so disk always has valid state
persistStore();

// ==========================================
// CENTRAL REALTIME SYNC API FOR ALL DEVICES
// ==========================================

// Central synchronization state endpoint: ALL devices poll this to stay 100% identical!
app.get('/api/sync-state', (req, res) => {
  res.json({
    version: store.version,
    updatedAt: store.updatedAt,
    orders: store.orders || [],
    products: store.products || INITIAL_PRODUCTS,
    settings: store.settings || DEFAULT_STORE_SETTINGS,
    categories: store.categories || [],
    hasSupabase: Boolean(store.supabaseConfig.url && store.supabaseConfig.key),
  });
});

// 1. Central Supabase & Cloud Config
// Allows ANY cellphone, tablet or computer to automatically receive credentials on load without manual entry!
app.get('/api/config', (req, res) => {
  const url = store.supabaseConfig.url || process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = store.supabaseConfig.key || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
  res.json({
    supabaseUrl: url,
    supabaseAnonKey: key,
    isConfigured: Boolean(url && key && url.startsWith('http')),
  });
});

app.post('/api/config', (req, res) => {
  const { supabaseUrl, supabaseAnonKey } = req.body;
  store.supabaseConfig = {
    url: (supabaseUrl || '').trim(),
    key: (supabaseAnonKey || '').trim(),
  };
  touchStore();
  console.log('[Server Config] Supabase credentials updated centrally. All devices now share this configuration.');
  res.json({ success: true, isConfigured: Boolean(store.supabaseConfig.url && store.supabaseConfig.key) });
});

// 2. Orders API (Direct Central Cloud Persistence)
app.get('/api/orders', (req, res) => {
  res.json({ orders: store.orders || [] });
});

app.post('/api/orders', (req, res) => {
  const newOrder = req.body;
  if (!newOrder || !newOrder.id) {
    return res.status(400).json({ error: 'Order must have an id' });
  }

  // Deduplicate and prepend
  const existsIndex = store.orders.findIndex((o) => o.id === newOrder.id);
  if (existsIndex >= 0) {
    store.orders[existsIndex] = { ...store.orders[existsIndex], ...newOrder };
  } else {
    store.orders.unshift(newOrder);
  }
  touchStore();
  res.json({ success: true, order: newOrder, version: store.version });
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const index = store.orders.findIndex((o) => o.id === id);
  if (index >= 0) {
    store.orders[index] = { ...store.orders[index], ...updates };
    touchStore();
    return res.json({ success: true, order: store.orders[index], version: store.version });
  }
  res.status(404).json({ error: 'Order not found' });
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  store.orders = store.orders.filter((o) => o.id !== id);
  touchStore();
  res.json({ success: true, id, version: store.version });
});

// 3. Products Catalog API
app.get('/api/products', (req, res) => {
  res.json({ products: store.products && store.products.length > 0 ? store.products : INITIAL_PRODUCTS });
});

app.put('/api/products', (req, res) => {
  const { products, product } = req.body;
  if (Array.isArray(products) && products.length > 0) {
    store.products = products;
  } else if (product && product.id) {
    const idx = store.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      store.products[idx] = product;
    } else {
      store.products.unshift(product);
    }
  }
  touchStore();
  res.json({ success: true, count: store.products.length, version: store.version });
});

// 4. Store Settings API
app.get('/api/settings', (req, res) => {
  res.json({ settings: store.settings || DEFAULT_STORE_SETTINGS });
});

app.put('/api/settings', (req, res) => {
  const { settings } = req.body;
  if (settings) {
    store.settings = settings;
    touchStore();
  }
  res.json({ success: true, settings: store.settings, version: store.version });
});

// 5. Bulk Sync / Initial Seeding endpoint from frontend
app.post('/api/sync-all', (req, res) => {
  const { orders, products, settings, supplies, categories } = req.body;
  if (Array.isArray(orders) && orders.length > 0) {
    const map = new Map();
    for (const o of store.orders) map.set(o.id, o);
    for (const o of orders) map.set(o.id, o);
    store.orders = Array.from(map.values());
  }
  if (Array.isArray(products) && products.length > 0) {
    store.products = products;
  }
  if (settings) {
    store.settings = settings;
  }
  if (Array.isArray(supplies) && supplies.length > 0) {
    store.supplies = supplies;
  }
  if (Array.isArray(categories) && categories.length > 0) {
    store.categories = categories;
  }
  touchStore();
  res.json({
    success: true,
    ordersCount: store.orders.length,
    productsCount: store.products.length,
    version: store.version,
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    orders: store.orders.length,
    products: store.products.length,
    hasSupabase: Boolean(store.supabaseConfig.url && store.supabaseConfig.key),
    serverTime: new Date().toISOString(),
  });
});

// ==========================================
// VITE SPA MIDDLEWARE / STATIC ASSETS
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Uberris Central Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
