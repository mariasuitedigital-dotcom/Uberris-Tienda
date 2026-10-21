import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS, INITIAL_SUPPLIES, DEFAULT_STORE_SETTINGS } from './src/data/initialData.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Dedicated server data directories for automatic multi-device synchronization & fast image hosting
const DATA_DIR = path.join(process.cwd(), 'data', 'cloud_state');
const STORE_FILE = path.join(DATA_DIR, 'server_store.json');
const UPLOADS_DIR = path.join(process.cwd(), 'data', 'uploads');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded images statically with caching
app.use('/uploads', express.static(UPLOADS_DIR, {
  maxAge: '7d',
  immutable: false,
}));

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

persistStore();

// ==========================================
// SERVER-SIDE SUPABASE CLIENT
// ==========================================
let serverSupabaseClient: SupabaseClient | null = null;

const getServerSupabase = (): SupabaseClient | null => {
  const url = store.supabaseConfig.url || process.env.VITE_SUPABASE_URL || '';
  const key = store.supabaseConfig.key || process.env.VITE_SUPABASE_ANON_KEY || '';
  if (!url || !key || !url.startsWith('http')) return null;

  if (!serverSupabaseClient) {
    try {
      serverSupabaseClient = createClient(url, key, {
        auth: { persistSession: false },
      });
    } catch (e) {
      console.warn('[Server Supabase] Error instantiating client:', e);
      return null;
    }
  }
  return serverSupabaseClient;
};

// Periodic server-level synchronization with Supabase database
const syncFromSupabaseServer = async () => {
  const sb = getServerSupabase();
  if (!sb) return;

  try {
    // 1. Sync products from Supabase
    const { data: dbProducts, error: prodErr } = await sb
      .from('products')
      .select('*')
      .order('created_at', { ascending: true });

    if (!prodErr && Array.isArray(dbProducts) && dbProducts.length > 0) {
      store.products = dbProducts.map((row: any) => ({
        id: row.id,
        name: row.name,
        description: row.description || '',
        price: Number(row.price),
        unit: row.unit || 'Paquete',
        unitsPerPackage: row.units_per_package || 1,
        category: row.category,
        image: row.image,
        available: row.available !== false,
        stockType: row.stock_type || 'a_producir',
        stock: Number(row.stock || 0),
        badge: row.badge || undefined,
        rawRecipe: row.raw_recipe || [],
      }));
      touchStore();
      console.log(`[Server Supabase] Synced ${store.products.length} live products from database.`);
    }

    // 2. Sync store_settings from Supabase
    const { data: dbSettings } = await sb
      .from('store_settings')
      .select('settings_data')
      .eq('id', 'global')
      .maybeSingle();

    if (dbSettings && dbSettings.settings_data) {
      store.settings = { ...DEFAULT_STORE_SETTINGS, ...dbSettings.settings_data };
      touchStore();
    }

    // 3. Sync categories from Supabase
    const { data: dbCategories, error: catErr } = await sb
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!catErr && Array.isArray(dbCategories) && dbCategories.length > 0) {
      store.categories = dbCategories.map((c: any) => ({
        id: c.id,
        name: c.name,
        description: c.description || '',
        imageUrl: c.image_url || '',
        active: c.active !== false,
      }));
      touchStore();
    }
  } catch (err) {
    console.warn('[Server Supabase] Periodic sync warning:', err);
  }
};

// Initial sync on boot
syncFromSupabaseServer();
// Refresh from Supabase every 60 seconds
setInterval(syncFromSupabaseServer, 60000);

// ==========================================
// CENTRAL REALTIME SYNC API FOR ALL DEVICES
// ==========================================

// Dedicated image upload endpoint: converts base64/blobs into fast, lightweight static files
app.post('/api/upload-image', (req, res) => {
  try {
    const { image, prefix } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'No image provided' });
    }

    // If it's already an http or relative URL, return it
    if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('/uploads/')) {
      return res.json({ success: true, url: image });
    }

    // Parse data URL: data:image/png;base64,....
    const match = image.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid base64 image data URL' });
    }

    const rawExt = match[1].toLowerCase();
    const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
    const base64Data = match[2];
    const safePrefix = (prefix || 'img').replace(/[^a-zA-Z0-9_-]/g, '').substring(0, 15);
    const fileName = `${safePrefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    const fileUrl = `/uploads/${fileName}`;

    console.log(`[Server Image] Saved upload: ${fileUrl} (${(base64Data.length / 1024).toFixed(1)} KB)`);
    res.json({ success: true, url: fileUrl });
  } catch (err: any) {
    console.error('[Server Image] Upload error:', err);
    res.status(500).json({ error: err.message || 'Error saving image' });
  }
});

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

// Central Supabase & Cloud Config
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
  serverSupabaseClient = null;
  touchStore();
  syncFromSupabaseServer();
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

  // Async push to Supabase as well
  const sb = getServerSupabase();
  if (sb) {
    (async () => {
      try {
        await sb.from('orders').upsert({
          id: newOrder.id,
          customer_name: newOrder.customerName,
          customer_phone: newOrder.customerPhone,
          delivery_address: newOrder.deliveryAddress,
          reference_point: newOrder.referencePoint || null,
          notes: newOrder.notes || null,
          total_amount: Number(newOrder.totalAmount) || 0,
          payment_method: newOrder.paymentMethod,
          payment_proof_image: newOrder.paymentProofImage || null,
          status: newOrder.status || 'pendiente',
          created_at: newOrder.createdAt || new Date().toISOString(),
        });
      } catch (e: any) {
        console.warn('[Server Supabase] order upsert notice:', e.message || e);
      }
    })();
  }

  res.json({ success: true, order: newOrder, version: store.version });
});

app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const index = store.orders.findIndex((o) => o.id === id);
  if (index >= 0) {
    store.orders[index] = { ...store.orders[index], ...updates };
    touchStore();

    const sb = getServerSupabase();
    if (sb && updates.status) {
      (async () => {
        try {
          await sb.from('orders')
            .update({ status: updates.status, updated_at: new Date().toISOString() })
            .eq('id', id);
        } catch (e: any) {
          console.warn('[Server Supabase] order status update notice:', e.message || e);
        }
      })();
    }

    return res.json({ success: true, order: store.orders[index], version: store.version });
  }
  res.status(404).json({ error: 'Order not found' });
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  store.orders = store.orders.filter((o) => o.id !== id);
  touchStore();

  const sb = getServerSupabase();
  if (sb) {
    (async () => {
      try {
        await sb.from('orders').delete().eq('id', id);
      } catch (e) {}
    })();
  }

  res.json({ success: true, id, version: store.version });
});

// 3. Products Catalog API
app.get('/api/products', (req, res) => {
  res.json({ products: store.products && store.products.length > 0 ? store.products : INITIAL_PRODUCTS });
});

app.put('/api/products', async (req, res) => {
  const { products, product } = req.body;
  const sb = getServerSupabase();

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

  // Dual-write to Supabase from the backend server as well
  if (sb) {
    const prodsToUpsert = (Array.isArray(products) && products.length > 0)
      ? (product ? [product] : products)
      : (product ? [product] : []);

    (async () => {
      for (const p of prodsToUpsert) {
        try {
          await sb.from('products').upsert({
            id: p.id,
            name: p.name,
            description: p.description || '',
            price: Number(p.price) || 0,
            unit: p.unit || 'Paquete',
            units_per_package: p.unitsPerPackage || 1,
            category: p.category,
            image: p.image,
            available: p.available !== false,
            stock_type: p.stockType || 'a_producir',
            stock: Number(p.stock) || 0,
            badge: p.badge || null,
            raw_recipe: p.rawRecipe || [],
            updated_at: new Date().toISOString(),
          });
        } catch (e: any) {
          console.warn('[Server Supabase] product upsert notice:', e.message || e);
        }
      }
    })();
  }

  res.json({ success: true, count: store.products.length, version: store.version });
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  store.products = store.products.filter((p) => p.id !== id);
  touchStore();

  const sb = getServerSupabase();
  if (sb) {
    (async () => {
      try {
        await sb.from('products').delete().eq('id', id);
      } catch (e) {}
    })();
  }

  res.json({ success: true, id, version: store.version });
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

    const sb = getServerSupabase();
    if (sb) {
      (async () => {
        try {
          await sb.from('store_settings').upsert({
            id: 'global',
            settings_data: settings,
            updated_at: new Date().toISOString(),
          });
        } catch (e) {}
      })();
    }
  }
  res.json({ success: true, settings: store.settings, version: store.version });
});

// 5. Categories API
app.get('/api/categories', (req, res) => {
  res.json({ categories: store.categories || [] });
});

app.put('/api/categories', (req, res) => {
  const { categories } = req.body;
  if (Array.isArray(categories)) {
    store.categories = categories;
    touchStore();

    const sb = getServerSupabase();
    if (sb) {
      (async () => {
        for (const cat of categories) {
          try {
            await sb.from('categories').upsert({
              id: cat.id,
              name: cat.name,
              description: cat.description || '',
              image_url: cat.imageUrl || cat.image_url || '',
              active: cat.active !== false,
              updated_at: new Date().toISOString(),
            });
          } catch (e) {}
        }
      })();
    }
  }
  res.json({ success: true, count: (store.categories || []).length, version: store.version });
});

// 6. Bulk Sync endpoint from frontend
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
