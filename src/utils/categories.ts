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
];

export function getMergedCategories(
  settings?: Partial<StoreSettings>,
  products?: Product[]
): CategoryInfo[] {
  const map = new Map<string, CategoryInfo>();

  // 1. Initialize with default base categories, applying any custom names/descriptions/images from settings
  DEFAULT_BASE_CATEGORIES.forEach((base) => {
    const customName = settings?.categoryNames?.[base.id] || base.name;
    const customDesc = settings?.categoryDescriptions?.[base.id] || base.description;
    const customUrl = cleanDirectImageUrl(settings?.categoryImages?.[base.id] || '') || base.imageUrl;

    map.set(base.id, {
      ...base,
      name: customName,
      description: customDesc,
      imageUrl: customUrl,
    });
  });

  // 2. Merge custom categories from settings
  if (settings?.customCategories && Array.isArray(settings.customCategories)) {
    settings.customCategories.forEach((cat) => {
      if (!cat.id) return;
      const customName = settings?.categoryNames?.[cat.id] || cat.name || cat.id;
      const customDesc = settings?.categoryDescriptions?.[cat.id] || cat.description || '';
      const customUrl = cleanDirectImageUrl(settings?.categoryImages?.[cat.id] || '') || cat.imageUrl || DEFAULT_BASE_CATEGORIES[0].imageUrl;

      map.set(cat.id, {
        id: cat.id as any,
        name: customName,
        description: customDesc,
        imageUrl: customUrl,
        active: cat.active !== false,
      });
    });
  }

  // 3. Check products for any additional categories not yet registered
  if (products && Array.isArray(products)) {
    products.forEach((p) => {
      if (p.category && p.category !== 'Todos' as any && !map.has(p.category)) {
        const catId = p.category;
        const customName = settings?.categoryNames?.[catId] || catId;
        const customDesc = settings?.categoryDescriptions?.[catId] || '';
        const customUrl = cleanDirectImageUrl(settings?.categoryImages?.[catId] || '') || p.image || DEFAULT_BASE_CATEGORIES[0].imageUrl;

        map.set(catId, {
          id: catId as any,
          name: customName,
          description: customDesc,
          imageUrl: customUrl,
          active: true,
        });
      }
    });
  }

  return Array.from(map.values()).filter((c) => c.active !== false);
}
