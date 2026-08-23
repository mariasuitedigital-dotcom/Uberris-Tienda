import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Product,
  Order,
  OrderItem,
  RawSupply,
  InventoryMovement,
  OrderStatus,
  StoreSettings,
  ProductionBatch
} from '../types';

// Read from Vite environment variables or dynamic localStorage fallback
const getSupabaseCredentials = () => {
  const envObj = (import.meta as any).env || {};
  const envUrl = (envObj.VITE_SUPABASE_URL as string) || '';
  const envKey = (envObj.VITE_SUPABASE_ANON_KEY as string) || '';

  const localUrl = localStorage.getItem('uberris_supabase_url') || '';
  const localKey = localStorage.getItem('uberris_supabase_anon_key') || '';

  const url = envUrl || localUrl;
  const key = envKey || localKey;

  return { url: url.trim(), key: key.trim(), isConfigured: Boolean(url && key && url.startsWith('http')) };
};

let clientInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
  const { url, key, isConfigured } = getSupabaseCredentials();
  if (!isConfigured) return null;

  if (!clientInstance) {
    try {
      clientInstance = createClient(url, key, {
        auth: { persistSession: false },
        realtime: { params: { eventsPerSecond: 10 } },
      });
    } catch (err) {
      console.error('Error initializing Supabase client:', err);
      return null;
    }
  }
  return clientInstance;
};

export const isSupabaseConnected = (): boolean => {
  return getSupabaseCredentials().isConfigured;
};

export const saveSupabaseCredentialsLocal = (url: string, key: string) => {
  if (url) localStorage.setItem('uberris_supabase_url', url.trim());
  else localStorage.removeItem('uberris_supabase_url');

  if (key) localStorage.setItem('uberris_supabase_anon_key', key.trim());
  else localStorage.removeItem('uberris_supabase_anon_key');

  clientInstance = null; // reset instance
};

export const getSavedSupabaseConfig = () => {
  return getSupabaseCredentials();
};

/**
 * Postimages & External URL Helper:
 * Ensures URLs from Postimages, Google Drive, Dropbox, Imgur or other CDNs are direct image links
 */
export const cleanDirectImageUrl = (url: string): string => {
  if (!url) return '';
  let trimmed = url.trim();

  // 1. Extract from BBCode [img]URL[/img] or [url=...][img]URL[/img][/url]
  const bbMatch = trimmed.match(/\[img\](.*?)\[\/img\]/i);
  if (bbMatch && bbMatch[1]) {
    trimmed = bbMatch[1].trim();
  }

  // 2. Extract from Markdown ![alt](URL) or HTML <img src="URL" />
  const mdMatch = trimmed.match(/!\[.*?\]\((https?:\/\/[^\s\)]+)\)/i);
  if (mdMatch && mdMatch[1]) {
    trimmed = mdMatch[1].trim();
  }
  const htmlMatch = trimmed.match(/src=["'](https?:\/\/[^"']+)["']/i);
  if (htmlMatch && htmlMatch[1]) {
    trimmed = htmlMatch[1].trim();
  }

  // 3. Postimages page viewer link -> Direct image link
  if (trimmed.includes('postimg.cc/') && !trimmed.includes('i.postimg.cc/')) {
    const postimgMatch = trimmed.match(/postimg\.cc\/([a-zA-Z0-9]+)/i);
    if (postimgMatch && postimgMatch[1]) {
      return `https://i.postimg.cc/${postimgMatch[1]}/image.jpg`;
    }
  }

  // 4. Google Drive Share link -> Direct Image URL
  const gdriveMatch1 = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch1 && gdriveMatch1[1]) {
    return `https://lh3.googleusercontent.com/d/${gdriveMatch1[1]}`;
  }
  const gdriveMatch2 = trimmed.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/i);
  if (gdriveMatch2 && gdriveMatch2[1]) {
    return `https://lh3.googleusercontent.com/d/${gdriveMatch2[1]}`;
  }

  // 5. Dropbox link -> Direct Image URL
  if (trimmed.includes('dropbox.com') && trimmed.includes('dl=0')) {
    trimmed = trimmed.replace('dl=0', 'raw=1');
  }

  // 6. Imgur link without extension -> Add .jpg
  const imgurMatch = trimmed.match(/^https?:\/\/(?:i\.)?imgur\.com\/([a-zA-Z0-9]+)$/i);
  if (imgurMatch && imgurMatch[1] && !trimmed.endsWith('.jpg') && !trimmed.endsWith('.png')) {
    return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
  }

  return trimmed;
};

/* ==========================================================================
   SQL MIGRATION SCRIPT FOR SUPABASE SQL EDITOR (ALL TABLES & ACTIONS)
   ========================================================================== */
export const SUPABASE_SQL_FOOTER_MIGRATION = `-- ============================================================================
-- ACTUALIZACIÓN RÁPIDA: NUEVAS COLUMNAS DE REDES, FOOTER Y CUENTAS DE PAGO
-- Copia y pega esto en el "SQL Editor" de Supabase y presiona "RUN"
-- ============================================================================

ALTER TABLE IF EXISTS public.store_settings 
  ADD COLUMN IF NOT EXISTS footer_bio TEXT DEFAULT 'Llevamos el sabor inconfundible del Pan Chapla tradicional, panes andinos y productos del valle apurimeño directo a tu mesa familiar.',
  ADD COLUMN IF NOT EXISTS footer_shipping_info TEXT DEFAULT 'Despachamos por agencias de transporte confiables (Palomino, Shalom, Mariscal Cáceres, Molina) con empaque sellado para conservar la frescura.',
  ADD COLUMN IF NOT EXISTS yape_number TEXT DEFAULT '983746281',
  ADD COLUMN IF NOT EXISTS yape_name TEXT DEFAULT 'Uberris del Valle',
  ADD COLUMN IF NOT EXISTS plin_number TEXT DEFAULT '983746281',
  ADD COLUMN IF NOT EXISTS plin_name TEXT DEFAULT 'Uberris del Valle',
  ADD COLUMN IF NOT EXISTS bank_account_bank TEXT DEFAULT 'BCP',
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT DEFAULT '191-12345678-0-12',
  ADD COLUMN IF NOT EXISTS bank_account_cci TEXT DEFAULT '00219100123456780123',
  ADD COLUMN IF NOT EXISTS bank_account_name TEXT DEFAULT 'Uberris del Valle EIRL',
  ADD COLUMN IF NOT EXISTS show_tiktok BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_facebook BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_instagram BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_whatsapp BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_address BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_hours BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_shipping_info BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_payment_badges BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS guarantee_badge_1 TEXT DEFAULT 'Horno tradicional a leña de piedra andina',
  ADD COLUMN IF NOT EXISTS guarantee_badge_2 TEXT DEFAULT 'Insumos 100% ecológicos de pequeños productores',
  ADD COLUMN IF NOT EXISTS origin_location_text TEXT DEFAULT 'Valle de Apurímac (Abancay - Andahuaylas)',
  ADD COLUMN IF NOT EXISTS hero_tag TEXT DEFAULT 'Apurímac en tu Mesa',
  ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT 'Sabores de Origen',
  ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT 'productos naturales y bebidas con el sabor auténtico de los andes.',
  ADD COLUMN IF NOT EXISTS hero_image_1 TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_2 TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_3 TEXT;
`;

export const SUPABASE_SQL_SETUP = `-- ============================================================================
-- BASE DE DATOS COMPLETA: UBERRIS DEL VALLE - APURÍMAC
-- EJECUTA ESTE SCRIPT COMPLETO EN EL "SQL EDITOR" DE TU PANEL DE SUPABASE
-- ============================================================================

-- 1. TABLA: PRODUCTOS DEL CATÁLOGO & CONTROL DE STOCK
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  units_per_package INTEGER NOT NULL DEFAULT 1,
  category TEXT NOT NULL,
  image TEXT,
  available BOOLEAN NOT NULL DEFAULT true,
  stock_type TEXT NOT NULL DEFAULT 'a_producir', -- 'con_stock' (físico) | 'a_producir' (bajo demanda)
  stock INTEGER NOT NULL DEFAULT 0,
  badge TEXT,
  raw_recipe JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA: PEDIDOS Y DESPACHOS
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  address TEXT,
  destination_city TEXT NOT NULL,
  delivery_date DATE,
  status TEXT NOT NULL DEFAULT 'pendiente', -- 'pendiente', 'en_produccion', 'despachado', 'entregado', 'cancelado'
  total NUMERIC(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  payment_method TEXT DEFAULT 'Yape',
  shipping_type TEXT DEFAULT 'agency',
  shipping_agency TEXT,
  shipping_branch TEXT,
  shipping_address TEXT,
  shipping_notice TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA: DETALLE DE PRODUCTOS POR PEDIDO (ORDER ITEMS)
CREATE TABLE IF NOT EXISTS public.order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit_label TEXT NOT NULL,
  units_per_package INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA: INSUMOS Y MATERIA PRIMA (HARINA, MANTECA, ANÍS, LECHE, EMPAQUES)
CREATE TABLE IF NOT EXISTS public.raw_supplies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
  unit TEXT NOT NULL, -- 'Kg', 'Litros', 'Unidades', 'Gramos'
  minimum_threshold NUMERIC(10, 2) NOT NULL DEFAULT 10,
  cost_per_unit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLA: MOVIMIENTOS DE KARDEX & AUDITORÍA DE INVENTARIO
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id TEXT PRIMARY KEY,
  supply_id TEXT NOT NULL,
  supply_name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'venta_automatica', 'ingreso_compra', 'ajuste_manual', 'merma', 'horneada'
  amount NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reference_order TEXT
);

-- 6. TABLA: CONFIGURACIÓN DEL NEGOCIO, CONTACTO, REDES SOCIALES Y BRANDING
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'main_store',
  business_name TEXT NOT NULL DEFAULT 'Uberris del Valle',
  tagline TEXT DEFAULT 'Panadería & Delicias de Apurímac',
  footer_bio TEXT DEFAULT 'Llevamos el sabor inconfundible del Pan Chapla tradicional, panes andinos y productos del valle apurimeño directo a tu mesa familiar.',
  footer_shipping_info TEXT DEFAULT 'Despachamos por agencias de transporte confiables (Palomino, Shalom, Mariscal Cáceres, Molina) con empaque sellado para conservar la frescura.',
  phone TEXT DEFAULT '+51 983 746 281',
  whatsapp_phone TEXT NOT NULL DEFAULT '51983746281',
  email TEXT DEFAULT 'pedidos@uberrisdelvalle.com',
  address_text TEXT DEFAULT 'Av. Arenas 450, Abancay - Apurímac, Perú',
  business_hours TEXT DEFAULT 'Lunes a Sábado: 6:00 AM - 8:00 PM | Domingos: 6:00 AM - 1:30 PM',
  tiktok_url TEXT DEFAULT 'https://www.tiktok.com/@uberrisdelvalle',
  facebook_url TEXT DEFAULT 'https://www.facebook.com/uberrisdelvalle',
  instagram_url TEXT DEFAULT 'https://www.instagram.com/uberrisdelvalle',
  logo_url TEXT,
  hero_banner_url TEXT,
  yape_qr_image TEXT,
  yape_number TEXT DEFAULT '983746281',
  yape_name TEXT DEFAULT 'Uberris del Valle',
  plin_qr_image TEXT,
  plin_number TEXT DEFAULT '983746281',
  plin_name TEXT DEFAULT 'Uberris del Valle',
  bank_account_bank TEXT DEFAULT 'BCP',
  bank_account_number TEXT DEFAULT '191-12345678-0-12',
  bank_account_cci TEXT DEFAULT '00219100123456780123',
  bank_account_name TEXT DEFAULT 'Uberris del Valle EIRL',
  announcement_banner TEXT DEFAULT '🌱 Envíos a Abancay, Andahuaylas, Cusco, Lima y todo Apurímac directo de la hornada.',
  show_tiktok BOOLEAN DEFAULT true,
  show_facebook BOOLEAN DEFAULT true,
  show_instagram BOOLEAN DEFAULT true,
  show_whatsapp BOOLEAN DEFAULT true,
  show_phone BOOLEAN DEFAULT true,
  show_email BOOLEAN DEFAULT true,
  show_address BOOLEAN DEFAULT true,
  show_hours BOOLEAN DEFAULT true,
  show_shipping_info BOOLEAN DEFAULT true,
  show_payment_badges BOOLEAN DEFAULT true,
  guarantee_badge_1 TEXT DEFAULT 'Horno tradicional a leña de piedra andina',
  guarantee_badge_2 TEXT DEFAULT 'Insumos 100% ecológicos de pequeños productores',
  origin_location_text TEXT DEFAULT 'Valle de Apurímac (Abancay - Andahuaylas)',
  hero_tag TEXT DEFAULT 'Apurímac en tu Mesa',
  hero_title TEXT DEFAULT 'Sabores de Origen',
  hero_subtitle TEXT DEFAULT 'productos naturales y bebidas con el sabor auténtico de los andes.',
  hero_image_1 TEXT,
  hero_image_2 TEXT,
  hero_image_3 TEXT,
  category_images JSONB DEFAULT '{}'::jsonb,
  shipping_destinations JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- MIGRACIÓN / ACTUALIZACIÓN SI LA TABLA YA EXISTÍA PREVIAMENTE
ALTER TABLE IF EXISTS public.store_settings 
  ADD COLUMN IF NOT EXISTS footer_bio TEXT DEFAULT 'Llevamos el sabor inconfundible del Pan Chapla tradicional, panes andinos y productos del valle apurimeño directo a tu mesa familiar.',
  ADD COLUMN IF NOT EXISTS footer_shipping_info TEXT DEFAULT 'Despachamos por agencias de transporte confiables (Palomino, Shalom, Mariscal Cáceres, Molina) con empaque sellado para conservar la frescura.',
  ADD COLUMN IF NOT EXISTS yape_number TEXT DEFAULT '983746281',
  ADD COLUMN IF NOT EXISTS yape_name TEXT DEFAULT 'Uberris del Valle',
  ADD COLUMN IF NOT EXISTS plin_number TEXT DEFAULT '983746281',
  ADD COLUMN IF NOT EXISTS plin_name TEXT DEFAULT 'Uberris del Valle',
  ADD COLUMN IF NOT EXISTS bank_account_bank TEXT DEFAULT 'BCP',
  ADD COLUMN IF NOT EXISTS bank_account_number TEXT DEFAULT '191-12345678-0-12',
  ADD COLUMN IF NOT EXISTS bank_account_cci TEXT DEFAULT '00219100123456780123',
  ADD COLUMN IF NOT EXISTS bank_account_name TEXT DEFAULT 'Uberris del Valle EIRL',
  ADD COLUMN IF NOT EXISTS show_tiktok BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_facebook BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_instagram BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_whatsapp BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_phone BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_address BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_hours BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_shipping_info BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_payment_badges BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS hero_image_1 TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_2 TEXT,
  ADD COLUMN IF NOT EXISTS hero_image_3 TEXT,
  ADD COLUMN IF NOT EXISTS category_images JSONB DEFAULT '{}'::jsonb;

-- 7. TABLA: PLANIFICACIÓN DE HORNADAS / LOTES DE PRODUCCIÓN
CREATE TABLE IF NOT EXISTS public.production_batches (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity_packages INTEGER NOT NULL,
  total_units INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'planificado', -- 'planificado', 'amasando', 'en_horno', 'terminado'
  scheduled_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- ÍNDICES PARA BÚSQUEDAS RÁPIDAS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_supplies_category ON public.raw_supplies(category);

-- ============================================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY)
-- Permite lectura y escritura para sincronización en tiempo real de la tienda y panel admin
-- ============================================================================
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  -- Products
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read products' AND tablename = 'products') THEN
    CREATE POLICY "Public read products" ON public.products FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public write products' AND tablename = 'products') THEN
    CREATE POLICY "Public write products" ON public.products FOR ALL USING (true);
  END IF;

  -- Orders
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read orders' AND tablename = 'orders') THEN
    CREATE POLICY "Public read orders" ON public.orders FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public write orders' AND tablename = 'orders') THEN
    CREATE POLICY "Public write orders" ON public.orders FOR ALL USING (true);
  END IF;

  -- Order Items
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read order_items' AND tablename = 'order_items') THEN
    CREATE POLICY "Public read order_items" ON public.order_items FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public write order_items' AND tablename = 'order_items') THEN
    CREATE POLICY "Public write order_items" ON public.order_items FOR ALL USING (true);
  END IF;

  -- Supplies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read supplies' AND tablename = 'raw_supplies') THEN
    CREATE POLICY "Public read supplies" ON public.raw_supplies FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public write supplies' AND tablename = 'raw_supplies') THEN
    CREATE POLICY "Public write supplies" ON public.raw_supplies FOR ALL USING (true);
  END IF;

  -- Movements
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read movements' AND tablename = 'inventory_movements') THEN
    CREATE POLICY "Public read movements" ON public.inventory_movements FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public write movements' AND tablename = 'inventory_movements') THEN
    CREATE POLICY "Public write movements" ON public.inventory_movements FOR ALL USING (true);
  END IF;

  -- Store Settings
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read settings' AND tablename = 'store_settings') THEN
    CREATE POLICY "Public read settings" ON public.store_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public write settings' AND tablename = 'store_settings') THEN
    CREATE POLICY "Public write settings" ON public.store_settings FOR ALL USING (true);
  END IF;

  -- Production Batches
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read batches' AND tablename = 'production_batches') THEN
    CREATE POLICY "Public read batches" ON public.production_batches FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public write batches' AND tablename = 'production_batches') THEN
    CREATE POLICY "Public write batches" ON public.production_batches FOR ALL USING (true);
  END IF;
END $$;

-- ============================================================================
-- ACTIVAR PUBLICACIÓN REALTIME EN TODAS LAS TABLAS CLAVE
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.raw_supplies;
ALTER PUBLICATION supabase_realtime ADD TABLE public.store_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.production_batches;
`;

/* ==========================================================================
   1. PRODUCTOS CRUD OPERATIONS
   ========================================================================== */
export const dbFetchProducts = async (): Promise<Product[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    if (error.code === 'PGRST205' || error.message?.includes('schema cache') || error.message?.includes('Could not find the table')) {
      console.info('ℹ️ Supabase: Tabla "products" aún no creada.');
    } else {
      console.warn('Notice fetching products from Supabase:', error.message || error);
    }
    return null;
  }

  if (!data) return [];

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    description: row.description || '',
    price: Number(row.price),
    unit: row.unit,
    unitsPerPackage: row.units_per_package || 1,
    category: row.category,
    image: row.image,
    available: row.available !== false,
    stockType: row.stock_type || 'a_producir',
    stock: Number(row.stock || 0),
    badge: row.badge || undefined,
    rawRecipe: row.raw_recipe || [],
  }));
};

export const dbUpsertProduct = async (product: Product): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  const payload = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    unit: product.unit,
    units_per_package: product.unitsPerPackage,
    category: product.category,
    image: cleanDirectImageUrl(product.image),
    available: product.available,
    stock_type: product.stockType || 'a_producir',
    stock: product.stock || 0,
    badge: product.badge || null,
    raw_recipe: product.rawRecipe || [],
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('products').upsert(payload);
  if (error) {
    console.error('Error saving product to Supabase:', error);
    return false;
  }
  return true;
};

export const dbDeleteProduct = async (productId: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from('products').delete().eq('id', productId);
  if (error) {
    console.error('Error deleting product from Supabase:', error);
    return false;
  }
  return true;
};

export const dbSeedProducts = async (products: Product[]): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  const rows = products.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price,
    unit: p.unit,
    units_per_package: p.unitsPerPackage,
    category: p.category,
    image: cleanDirectImageUrl(p.image),
    available: p.available,
    stock_type: p.stockType || 'a_producir',
    stock: p.stock || 0,
    badge: p.badge || null,
    raw_recipe: p.rawRecipe || [],
  }));

  const { error } = await supabase.from('products').upsert(rows);
  if (error) {
    console.error('Error seeding products to Supabase:', error);
    return false;
  }
  return true;
};

/* ==========================================================================
   2. PEDIDOS CRUD OPERATIONS
   ========================================================================== */
export const dbFetchOrders = async (): Promise<Order[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: ordersData, error: ordersError } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (ordersError) {
    if (ordersError.code === 'PGRST205' || ordersError.message?.includes('schema cache') || ordersError.message?.includes('Could not find the table')) {
      console.info('ℹ️ Supabase: Tabla "orders" aún no creada.');
    } else {
      console.warn('Notice fetching orders from Supabase:', ordersError.message || ordersError);
    }
    return null;
  }

  if (!ordersData) return [];

  return ordersData.map((row: any) => ({
    id: row.id,
    clientName: row.client_name,
    clientPhone: row.client_phone,
    address: row.address || '',
    destinationCity: row.destination_city,
    deliveryDate: row.delivery_date || undefined,
    status: row.status as OrderStatus,
    total: Number(row.total),
    notes: row.notes || '',
    paymentMethod: row.payment_method || 'Yape',
    shippingType: row.shipping_type || 'agency',
    shippingAgency: row.shipping_agency || '',
    shippingBranch: row.shipping_branch || '',
    shippingAddress: row.shipping_address || '',
    shippingNotice: row.shipping_notice || '',
    createdAt: row.created_at,
    items: (row.order_items || []).map((item: any) => ({
      productId: item.product_id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      unitLabel: item.unit_label,
      unitsPerPackage: item.units_per_package || 1,
    })),
  }));
};

export const dbCreateOrder = async (order: Order): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  // 1. Insert order
  const orderRow = {
    id: order.id,
    client_name: order.clientName,
    client_phone: order.clientPhone,
    address: order.address || null,
    destination_city: order.destinationCity,
    delivery_date: order.deliveryDate || null,
    status: order.status,
    total: order.total,
    notes: order.notes || null,
    payment_method: order.paymentMethod || 'Yape',
    shipping_type: order.shippingType || 'agency',
    shipping_agency: order.shippingAgency || null,
    shipping_branch: order.shippingBranch || null,
    shipping_address: order.shippingAddress || null,
    shipping_notice: order.shippingNotice || null,
    created_at: order.createdAt || new Date().toISOString(),
  };

  const { error: orderError } = await supabase.from('orders').insert(orderRow);
  if (orderError) {
    console.error('Error creating order in Supabase:', orderError);
    return false;
  }

  // 2. Insert items
  if (order.items && order.items.length > 0) {
    const itemsRows = order.items.map((i) => ({
      order_id: order.id,
      product_id: i.productId,
      product_name: i.productName,
      quantity: i.quantity,
      unit_price: i.unitPrice,
      unit_label: i.unitLabel,
      units_per_package: i.unitsPerPackage,
    }));

    const { error: itemsError } = await supabase.from('order_items').insert(itemsRows);
    if (itemsError) {
      console.error('Error inserting order items to Supabase:', itemsError);
    }
  }

  // 3. If any item has 'con_stock', deduct stock in Supabase
  for (const item of order.items) {
    try {
      const { data: prodData } = await supabase
        .from('products')
        .select('stock, stock_type')
        .eq('id', item.productId)
        .single();

      if (prodData && prodData.stock_type === 'con_stock') {
        const newStock = Math.max(0, (prodData.stock || 0) - item.quantity);
        await supabase.from('products').update({ stock: newStock }).eq('id', item.productId);
      }
    } catch (e) {
      console.warn('Could not auto-deduct stock for product:', item.productId, e);
    }
  }

  return true;
};

export const dbUpdateOrderStatus = async (orderId: string, status: OrderStatus): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId);

  if (error) {
    console.error('Error updating order status in Supabase:', error);
    return false;
  }
  return true;
};

export const dbDeleteOrder = async (orderId: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  if (error) {
    console.error('Error deleting order from Supabase:', error);
    return false;
  }
  return true;
};

export const dbSeedOrders = async (orders: Order[]): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  for (const order of orders) {
    await dbCreateOrder(order);
  }
  return true;
};

/* ==========================================================================
   3. INSUMOS & MATERIA PRIMA (RAW SUPPLIES)
   ========================================================================== */
export const dbFetchSupplies = async (): Promise<RawSupply[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('raw_supplies')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.warn('Notice fetching supplies from Supabase:', error.message || error);
    return null;
  }

  if (!data) return [];

  return data.map((r: any) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    stock: Number(r.stock),
    unit: r.unit,
    minimumThreshold: Number(r.minimum_threshold),
    costPerUnit: Number(r.cost_per_unit),
  }));
};

export const dbUpsertSupply = async (supply: RawSupply): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from('raw_supplies').upsert({
    id: supply.id,
    name: supply.name,
    category: supply.category,
    stock: supply.stock,
    unit: supply.unit,
    minimum_threshold: supply.minimumThreshold,
    cost_per_unit: supply.costPerUnit,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Error saving supply to Supabase:', error);
    return false;
  }
  return true;
};

export const dbDeleteSupply = async (supplyId: string): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from('raw_supplies').delete().eq('id', supplyId);
  return !error;
};

export const dbSeedSupplies = async (supplies: RawSupply[]): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  const rows = supplies.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    stock: s.stock,
    unit: s.unit,
    minimum_threshold: s.minimumThreshold,
    cost_per_unit: s.costPerUnit,
  }));

  const { error } = await supabase.from('raw_supplies').upsert(rows);
  return !error;
};

/* ==========================================================================
   4. MOVIMIENTOS DE KARDEX & INVENTARIO
   ========================================================================== */
export const dbFetchMovements = async (): Promise<InventoryMovement[] | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('inventory_movements')
    .select('*')
    .order('date', { ascending: false });

  if (error) return null;
  if (!data) return [];

  return data.map((m: any) => ({
    id: m.id,
    supplyId: m.supply_id,
    supplyName: m.supply_name,
    type: m.type,
    amount: Number(m.amount),
    unit: m.unit,
    date: m.date,
    referenceOrder: m.reference_order || undefined,
  }));
};

export const dbCreateMovement = async (movement: InventoryMovement): Promise<boolean> => {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from('inventory_movements').insert({
    id: movement.id,
    supply_id: movement.supplyId,
    supply_name: movement.supplyName,
    type: movement.type,
    amount: movement.amount,
    unit: movement.unit,
    date: movement.date || new Date().toISOString(),
    reference_order: movement.referenceOrder || null,
  });

  return !error;
};

/* ==========================================================================
   5. CONFIGURACIÓN DEL NEGOCIO (STORE SETTINGS)
   ========================================================================== */
export const dbFetchStoreSettings = async (): Promise<StoreSettings | null> => {
  const supabase = getSupabase();
  if (!supabase) return null;

  const localSavedStr = typeof window !== 'undefined' ? localStorage.getItem('uberris_store_settings') : null;
  const localSavedSettings: Partial<StoreSettings> = localSavedStr ? (JSON.parse(localSavedStr) || {}) : {};

  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .eq('id', 'main_store')
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    businessName: data.business_name || 'Uberris del Valle',
    tagline: data.tagline || 'Panadería & Delicias de Apurímac',
    footerBio: data.footer_bio || 'Llevamos el sabor inconfundible del Pan Chapla tradicional, panes andinos y productos del valle apurimeño directo a tu mesa familiar.',
    footerShippingInfo: data.footer_shipping_info || 'Despachamos por agencias de transporte confiables (Palomino, Shalom, Mariscal Cáceres, Molina) con empaque sellado para conservar la frescura.',
    phone: data.phone || '+51 983 746 281',
    whatsappPhone: data.whatsapp_phone || '51983746281',
    email: data.email || 'pedidos@uberrisdelvalle.com',
    addressText: data.address_text || 'Av. Arenas 450, Abancay - Apurímac, Perú',
    businessHours: data.business_hours || 'Lunes a Sábado: 6:00 AM - 8:00 PM | Domingos: 6:00 AM - 1:30 PM',
    tiktokUrl: data.tiktok_url || 'https://www.tiktok.com/@uberrisdelvalle',
    facebookUrl: data.facebook_url || 'https://www.facebook.com/uberrisdelvalle',
    instagramUrl: data.instagram_url || 'https://www.instagram.com/uberrisdelvalle',
    logoUrl: data.logo_url || '',
    heroBannerUrl: data.hero_banner_url || '',
    yapeQrImage: data.yape_qr_image || '',
    yapeNumber: data.yape_number || '983746281',
    yapeName: data.yape_name || 'Uberris del Valle',
    plinQrImage: data.plin_qr_image || '',
    plinNumber: data.plin_number || '983746281',
    plinName: data.plin_name || 'Uberris del Valle',
    bankAccountBank: data.bank_account_bank || 'BCP',
    bankAccountNumber: data.bank_account_number || '191-12345678-0-12',
    bankAccountCci: data.bank_account_cci || '00219100123456780123',
    bankAccountName: data.bank_account_name || 'Uberris del Valle EIRL',
    announcementBanner: data.announcement_banner || '',
    showTiktok: data.show_tiktok !== false,
    showFacebook: data.show_facebook !== false,
    showInstagram: data.show_instagram !== false,
    showWhatsapp: data.show_whatsapp !== false,
    showPhone: data.show_phone !== false,
    showEmail: data.show_email !== false,
    showAddress: data.show_address !== false,
    showHours: data.show_hours !== false,
    showShippingInfo: data.show_shipping_info !== false,
    showPaymentBadges: data.show_payment_badges !== false,
    guaranteeBadge1: data.guarantee_badge_1 || localSavedSettings.guaranteeBadge1 || 'Horno tradicional a leña de piedra andina',
    guaranteeBadge2: data.guarantee_badge_2 || localSavedSettings.guaranteeBadge2 || 'Insumos 100% ecológicos de pequeños productores',
    originLocationText: data.origin_location_text || localSavedSettings.originLocationText || 'Valle de Apurímac (Abancay - Andahuaylas)',
    heroTag: data.hero_tag || localSavedSettings.heroTag || 'Apurímac en tu Mesa',
    heroTitle: data.hero_title || localSavedSettings.heroTitle || 'Sabores de Origen',
    heroSubtitle: data.hero_subtitle || localSavedSettings.heroSubtitle || 'productos naturales y bebidas con el sabor auténtico de los andes.',
    heroImage1: data.hero_image_1 || localSavedSettings.heroImage1 || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
    heroImage2: data.hero_image_2 || localSavedSettings.heroImage2 || 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=600',
    heroImage3: data.hero_image_3 || localSavedSettings.heroImage3 || 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=600',
    categoryImages: data.category_images || localSavedSettings.categoryImages || {
      'Panadería': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
      'Lácteos': 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800',
      'Embutidos': 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=800',
      'Miel y Dulces': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
      'Papa Nativa': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800',
    },
    updatedAt: data.updated_at,
  };
};

export const dbUpsertStoreSettings = async (
  settings: StoreSettings
): Promise<{ success: boolean; needsMigration?: boolean; error?: string }> => {
  // Always save to localStorage as an instant guarantee so client and admin never lose data
  try {
    localStorage.setItem('uberris_store_settings', JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving local store settings fallback:', e);
  }

  const supabase = getSupabase();
  if (!supabase) return { success: true };

  // Attempt 1: Full payload with all new columns
  const fullPayload = {
    id: 'main_store',
    business_name: settings.businessName,
    tagline: settings.tagline,
    footer_bio: settings.footerBio,
    footer_shipping_info: settings.footerShippingInfo,
    phone: settings.phone,
    whatsapp_phone: settings.whatsappPhone,
    email: settings.email,
    address_text: settings.addressText,
    business_hours: settings.businessHours,
    tiktok_url: settings.tiktokUrl,
    facebook_url: settings.facebookUrl,
    instagram_url: settings.instagramUrl,
    logo_url: cleanDirectImageUrl(settings.logoUrl || ''),
    hero_banner_url: cleanDirectImageUrl(settings.heroBannerUrl || ''),
    yape_qr_image: cleanDirectImageUrl(settings.yapeQrImage || ''),
    yape_number: settings.yapeNumber,
    yape_name: settings.yapeName,
    plin_qr_image: cleanDirectImageUrl(settings.plinQrImage || ''),
    plin_number: settings.plinNumber,
    plin_name: settings.plinName,
    bank_account_bank: settings.bankAccountBank,
    bank_account_number: settings.bankAccountNumber,
    bank_account_cci: settings.bankAccountCci,
    bank_account_name: settings.bankAccountName,
    announcement_banner: settings.announcementBanner,
    show_tiktok: settings.showTiktok !== false,
    show_facebook: settings.showFacebook !== false,
    show_instagram: settings.showInstagram !== false,
    show_whatsapp: settings.showWhatsapp !== false,
    show_phone: settings.showPhone !== false,
    show_email: settings.showEmail !== false,
    show_address: settings.showAddress !== false,
    show_hours: settings.showHours !== false,
    show_shipping_info: settings.showShippingInfo !== false,
    show_payment_badges: settings.showPaymentBadges !== false,
    guarantee_badge_1: settings.guaranteeBadge1 || 'Horno tradicional a leña de piedra andina',
    guarantee_badge_2: settings.guaranteeBadge2 || 'Insumos 100% ecológicos de pequeños productores',
    origin_location_text: settings.originLocationText || 'Valle de Apurímac (Abancay - Andahuaylas)',
    hero_tag: settings.heroTag || 'Apurímac en tu Mesa',
    hero_title: settings.heroTitle || 'Sabores de Origen',
    hero_subtitle: settings.heroSubtitle || 'productos naturales y bebidas con el sabor auténtico de los andes.',
    hero_image_1: cleanDirectImageUrl(settings.heroImage1 || ''),
    hero_image_2: cleanDirectImageUrl(settings.heroImage2 || ''),
    hero_image_3: cleanDirectImageUrl(settings.heroImage3 || ''),
    category_images: settings.categoryImages || {},
    updated_at: new Date().toISOString(),
  };

  const { error: fullError } = await supabase.from('store_settings').upsert(fullPayload);
  if (!fullError) {
    return { success: true, needsMigration: false };
  }

  console.warn('Full store_settings upsert returned error (likely missing newly added columns in Postgres):', fullError.message);

  // Attempt 2: Fallback payload using only the original base columns so saving never crashes or fails completely
  const fallbackPayload = {
    id: 'main_store',
    business_name: settings.businessName,
    tagline: settings.tagline,
    phone: settings.phone,
    whatsapp_phone: settings.whatsappPhone,
    email: settings.email,
    address_text: settings.addressText,
    business_hours: settings.businessHours,
    tiktok_url: settings.tiktokUrl,
    facebook_url: settings.facebookUrl,
    instagram_url: settings.instagramUrl,
    logo_url: cleanDirectImageUrl(settings.logoUrl || ''),
    hero_banner_url: cleanDirectImageUrl(settings.heroBannerUrl || ''),
    yape_qr_image: cleanDirectImageUrl(settings.yapeQrImage || ''),
    plin_qr_image: cleanDirectImageUrl(settings.plinQrImage || ''),
    announcement_banner: settings.announcementBanner,
    updated_at: new Date().toISOString(),
  };

  const { error: fallbackError } = await supabase.from('store_settings').upsert(fallbackPayload);
  if (!fallbackError) {
    return { success: true, needsMigration: true, error: fullError.message };
  }

  // If table does not exist at all in Supabase yet, return error details but local data is still safe
  return { success: false, needsMigration: true, error: fullError.message || fallbackError.message };
};

/* ==========================================================================
   6. REALTIME SUBSCRIPTIONS
   ========================================================================== */
export const subscribeToSupabaseOrders = (onDataChange: () => void) => {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel('orders-realtime-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
      onDataChange();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToSupabaseProducts = (onDataChange: () => void) => {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel('products-realtime-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
      onDataChange();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToSupabaseSupplies = (onDataChange: () => void) => {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel('supplies-realtime-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'raw_supplies' }, () => {
      onDataChange();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

export const subscribeToSupabaseSettings = (onDataChange: () => void) => {
  const supabase = getSupabase();
  if (!supabase) return () => {};

  const channel = supabase
    .channel('settings-realtime-channel')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'store_settings' }, () => {
      onDataChange();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Utility to convert base64 dataUrl to Blob for Supabase Storage uploads
 */
export const dataURLToBlob = (dataUrl: string): Blob => {
  try {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (err) {
    console.error('Error converting dataURL to Blob:', err);
    return new Blob([], { type: 'image/jpeg' });
  }
};

/**
 * Uploads an image File or Blob directly to Supabase Storage Bucket.
 * Priority buckets: 'productos-uberris', 'PRODUCTOS-UBERRIS', 'productos', 'images'
 */
export const uploadImageToSupabaseStorage = async (
  fileOrBlob: File | Blob,
  customPrefix: string = 'prod',
  targetBucket: string = 'productos-uberris'
): Promise<{ success: boolean; url?: string; error?: string }> => {
  const supabase = getSupabase();
  if (!supabase) {
    return { success: false, error: 'Supabase no está configurado.' };
  }

  try {
    let ext = 'jpg';
    if (fileOrBlob.type) {
      const typePart = fileOrBlob.type.split('/')[1];
      if (typePart) ext = typePart.replace('jpeg', 'jpg').replace('+xml', '');
    }

    const randomHash = Math.random().toString(36).substring(2, 8);
    const timeStamp = Date.now();
    const cleanPrefix = customPrefix.replace(/[^a-zA-Z0-9_-]/g, '_');
    const finalFileName = `${cleanPrefix}_${timeStamp}_${randomHash}.${ext}`;

    const candidateBuckets = Array.from(new Set([
      targetBucket,
      'productos-uberris',
      'PRODUCTOS-UBERRIS',
      'productos',
      'images',
      'public'
    ]));

    let lastErrorMessage = '';

    for (const b of candidateBuckets) {
      const { data, error } = await supabase.storage
        .from(b)
        .upload(finalFileName, fileOrBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: fileOrBlob.type || 'image/jpeg'
        });

      if (!error && data) {
        const { data: publicData } = supabase.storage.from(b).getPublicUrl(data.path);
        if (publicData?.publicUrl) {
          return { success: true, url: publicData.publicUrl };
        }
      } else if (error) {
        lastErrorMessage = error.message;
      }
    }

    return { success: false, error: lastErrorMessage || 'No se pudo subir al bucket de Supabase.' };
  } catch (err: any) {
    console.error('Exception during Supabase Storage upload:', err);
    return { success: false, error: err?.message || 'Error inesperado al subir la imagen.' };
  }
};

