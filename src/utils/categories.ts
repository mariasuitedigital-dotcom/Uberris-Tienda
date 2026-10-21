import { CategoryInfo, StoreSettings, Product } from '../types';
import { cleanDirectImageUrl } from '../lib/supabase';

export const DEFAULT_BASE_CATEGORIES: CategoryInfo[] = [
  {
    id: 'Panadería' as any,
    name: 'Panadería Artesanal',
    description: 'Pan Chapla & Leña',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800',
    active: true,
  },
  {
    id: 'Lácteos' as any,
    name: 'Quesería & Lácteos',
    description: 'Queso Paria & Manjar',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800',
    active: true,
  },
  {
    id: 'Embutidos' as any,
    name: 'Embutidos & Carnes',
    description: 'Chorizo & Cecina',
    imageUrl: 'https://images.unsplash.com/photo-1542826438-bd32f43d626f?auto=format&fit=crop&q=80&w=800',
    active: true,
  },
  {
    id: 'Miel y Dulces' as any,
    name: 'Miel & Dulces',
    description: '100% Pura de Abeja',
    imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=800',
    active: true,
  },
  {
    id: 'Papa Nativa' as any,
    name: 'Papa Nativa',
    description: 'Cosecha de Altura',
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800',
    active: true,
  },
  {
    id: 'Granos Andinos' as any,
    name: 'Granos Andinos',
    description: 'Maíz Chullpi & Pillpi',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
    active: true,
  },
  {
    id: 'Pastas Artesanales' as any,
    name: 'Pastas Artesanales',
    description: 'Fideos & Lasaña Casera',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&q=80&w=800',
    active: true,
  },
];

/**
 * Normalizes any category ID or alias (including unaccented, lowercase, or legacy names)
 * into its official canonical ID so duplicates can NEVER appear across devices.
 */
export function normalizeCategoryId(rawId: string): string {
  if (!rawId) return 'Panadería';
  const trimmed = rawId.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'panadería' || lower === 'panaderia' || lower.includes('panad') || lower.includes('chapla')) {
    return 'Panadería';
  }
  if (lower === 'lácteos' || lower === 'lacteos' || lower.includes('ques') || lower.includes('manjar')) {
    return 'Lácteos';
  }
  if (lower === 'embutidos' || lower.includes('embut') || lower.includes('carne') || lower.includes('charqui') || lower.includes('cecina') || lower.includes('cuy') || lower.includes('chicharron')) {
    return 'Embutidos';
  }
  if (lower === 'miel y dulces' || lower === 'miel' || lower.includes('miel') || lower.includes('dulce')) {
    return 'Miel y Dulces';
  }
  if (lower === 'papa nativa' || lower === 'papas' || lower === 'papa' || lower.includes('papa')) {
    return 'Papa Nativa';
  }
  if (lower === 'granos andinos' || lower.includes('grano') || lower.includes('cereal') || lower.includes('maiz') || lower.includes('maíz')) {
    return 'Granos Andinos';
  }
  if (lower === 'pastas artesanales' || lower.includes('pasta') || lower.includes('fideo') || lower.includes('lasa')) {
    return 'Pastas Artesanales';
  }

  return trimmed;
}

export function getMergedCategories(
  settings?: Partial<StoreSettings>,
  products?: Product[]
): CategoryInfo[] {
  const map = new Map<string, CategoryInfo>();
  const seenNames = new Set<string>();

  // 1. Initialize with default base categories, applying any custom names/descriptions/images from settings
  DEFAULT_BASE_CATEGORIES.forEach((base) => {
    const canonicalId = normalizeCategoryId(base.id);
    const customName = settings?.categoryNames?.[base.id] || settings?.categoryNames?.[canonicalId] || base.name;
    const customDesc = settings?.categoryDescriptions?.[base.id] || settings?.categoryDescriptions?.[canonicalId] || base.description;
    const customUrl = cleanDirectImageUrl(settings?.categoryImages?.[base.id] || settings?.categoryImages?.[canonicalId] || '') || base.imageUrl;

    map.set(canonicalId, {
      ...base,
      id: canonicalId as any,
      name: customName,
      description: customDesc,
      imageUrl: customUrl,
    });
    seenNames.add(customName.trim().toLowerCase());
  });

  // Helper to safely register/merge a category
  const mergeCategory = (rawId: string, name?: string, desc?: string, imgUrl?: string, active?: boolean) => {
    if (!rawId) return;
    const canonicalId = normalizeCategoryId(rawId);
    
    // Ignore obsolete orphan categories like 'Bebidas' with 0 products
    if (canonicalId.toLowerCase() === 'bebidas') {
      const hasProducts = products?.some((p) => normalizeCategoryId(p.category) === canonicalId);
      if (!hasProducts) return;
    }

    const customName = settings?.categoryNames?.[canonicalId] || settings?.categoryNames?.[rawId] || name || canonicalId;
    const customDesc = settings?.categoryDescriptions?.[canonicalId] || settings?.categoryDescriptions?.[rawId] || desc || '';
    const customUrl = cleanDirectImageUrl(settings?.categoryImages?.[canonicalId] || settings?.categoryImages?.[rawId] || '') ||
      cleanDirectImageUrl(imgUrl || '') ||
      map.get(canonicalId)?.imageUrl ||
      DEFAULT_BASE_CATEGORIES[0].imageUrl;

    // Check if we already have this canonical ID
    const existing = map.get(canonicalId);
    if (existing) {
      // Enhance existing entry with any more detailed description or image
      map.set(canonicalId, {
        ...existing,
        name: customName || existing.name,
        description: customDesc || existing.description,
        imageUrl: customUrl || existing.imageUrl,
        active: active !== undefined ? active : existing.active,
      });
      return;
    }

    // Check if name is already represented by another canonical category (prevent duplicate displays)
    const normName = customName.trim().toLowerCase();
    if (seenNames.has(normName)) {
      return;
    }

    map.set(canonicalId, {
      id: canonicalId as any,
      name: customName,
      description: customDesc,
      imageUrl: customUrl,
      active: active !== false,
    });
    seenNames.add(normName);
  };

  // 2. Merge db_categories from localStorage sync
  try {
    const savedDbCats = typeof window !== 'undefined' ? localStorage.getItem('uberris_db_categories') : null;
    if (savedDbCats) {
      const parsedCats = JSON.parse(savedDbCats);
      if (Array.isArray(parsedCats)) {
        parsedCats.forEach((cat) => {
          if (!cat?.id) return;
          mergeCategory(cat.id, cat.name, cat.description, cat.image_url || cat.imageUrl, cat.active);
        });
      }
    }
  } catch (e) {
    // ignore
  }

  // 3. Merge custom categories from settings
  if (settings?.customCategories && Array.isArray(settings.customCategories)) {
    settings.customCategories.forEach((cat) => {
      if (!cat?.id) return;
      mergeCategory(cat.id, cat.name, cat.description, cat.imageUrl, cat.active);
    });
  }

  // 4. Check products for any additional categories not yet registered
  if (products && Array.isArray(products)) {
    products.forEach((p) => {
      if (p.category && p.category !== ('Todos' as any)) {
        const canonicalId = normalizeCategoryId(p.category);
        if (!map.has(canonicalId)) {
          mergeCategory(canonicalId, canonicalId, '', p.image, true);
        }
      }
    });
  }

  return Array.from(map.values()).filter((c) => c.active !== false);
}
