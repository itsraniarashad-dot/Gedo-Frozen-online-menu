import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Product, Category, StoreSettings } from '../types';

export const SUPABASE_PAGE_SIZE = 1000;

// Fetch all categories from Supabase
export async function fetchAllCategoriesFromSupabase(): Promise<Category[]> {
  if (!supabase || !isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories from Supabase:', error);
    if (error.code === '42501') {
      const permissionErr: any = new Error(
        'يرجى تفعيل صلاحية القراءة للزوار في Supabase لجدول الأقسام: ' +
        'GRANT SELECT ON public.categories TO anon;'
      );
      permissionErr.code = error.code;
      permissionErr.isPermissionError = true;
      throw permissionErr;
    }
    throw error;
  }

  const mapped: Category[] = (data || []).map((row: any) => ({
    id: String(row.id),
    name: row.name,
    icon: row.icon || undefined,
  }));

  return mapped;
}

// Fetch all products using pagination (handles > 1,000 items)
export async function fetchAllProductsFromSupabase(): Promise<Product[]> {
  if (!supabase || !isSupabaseConfigured) return [];

  let allProducts: Product[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const to = from + SUPABASE_PAGE_SIZE - 1;
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact' })
      .range(from, to)
      .order('name', { ascending: true });

    if (error) {
      console.error(`Error fetching products range ${from}-${to}:`, error);
      if (error.code === '42501') {
        const permissionErr: any = new Error(
          'يرجى تفعيل صلاحية القراءة للزوار في Supabase لجدول المنتجات: ' +
          'GRANT SELECT ON public.products TO anon;'
        );
        permissionErr.code = error.code;
        permissionErr.isPermissionError = true;
        throw permissionErr;
      }
      throw error;
    }

    if (!data || data.length === 0) {
      break;
    }

    const pageProducts: Product[] = data.map((row: any) => {
      let weightOptions = undefined;
      if (row.weight_options) {
        weightOptions = typeof row.weight_options === 'string'
          ? JSON.parse(row.weight_options)
          : row.weight_options;
      } else if (row.weightOptions) {
        weightOptions = typeof row.weightOptions === 'string'
          ? JSON.parse(row.weightOptions)
          : row.weightOptions;
      }

      return {
        id: String(row.id),
        name: row.name,
        category: String(row.category || row.category_id || 'all'),
        description: row.description || '',
        price: Number(row.price) || 0,
        originalPrice: row.original_price ? Number(row.original_price) : (row.originalPrice ? Number(row.originalPrice) : undefined),
        weight: row.weight || '',
        weightOptions: weightOptions,
        cookingMethod: row.cooking_method || row.cookingMethod || undefined,
        cookingTime: row.cooking_time || row.cookingTime || undefined,
        image: row.image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
        badge: row.badge || undefined,
        inStock: row.in_stock !== undefined ? Boolean(row.in_stock) : (row.inStock !== undefined ? Boolean(row.inStock) : true),
        storageTip: row.storage_tip || row.storageTip || undefined,
      };
    });

    allProducts = [...allProducts, ...pageProducts];

    if (data.length < SUPABASE_PAGE_SIZE || (count !== null && allProducts.length >= count)) {
      hasMore = false;
    } else {
      from += SUPABASE_PAGE_SIZE;
    }
  }

  return allProducts;
}

// Fetch store settings from Supabase
export async function fetchStoreSettingsFromSupabase(): Promise<StoreSettings | null> {
  if (!supabase || !isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    if (error.code === '42501') {
      console.warn('Notice: store_settings permissions not yet granted in Supabase. Using current store settings.');
    } else {
      console.error('Error fetching store settings:', error);
    }
    return null;
  }

  if (!data) return null;

  return {
    storeName: data.store_name || data.storeName || 'Gedo Frozen | جدو فروزن',
    storeTagline: data.store_tagline || data.storeTagline || '',
    whatsappNumber: data.whatsapp_number || data.whatsappNumber || '201106166176',
    supportPhone: data.support_phone || data.supportPhone || '01106166176',
    instapayHandle: data.instapay_handle || data.instapayHandle || 'gedo.frozen@instapay',
    walletNumber: data.wallet_number || data.walletNumber || '01106166176',
    walletType: data.wallet_type || data.walletType || 'فودافون كاش / أورنج كاش / اتصالات كاش',
    deliveryFee: Number(data.delivery_fee ?? data.deliveryFee ?? 35),
    freeDeliveryThreshold: data.free_delivery_threshold ? Number(data.free_delivery_threshold) : undefined,
    minOrderAmount: Number(data.min_order_amount ?? data.minOrderAmount ?? 0),
    addressText: data.address_text || data.addressText || '',
    announcementText: data.announcement_text || data.announcementText || '',
    adminPin: data.admin_pin || data.adminPin || '1234',
    workingHours: data.working_hours || data.workingHours || '',
  };
}

// Check admin role in admin_users table
export async function verifyAdminUser(userId: string, email?: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  // Try checking by user_id or id
  const { data: byId } = await supabase
    .from('admin_users')
    .select('*')
    .or(`id.eq.${userId},user_id.eq.${userId}`)
    .limit(1)
    .maybeSingle();

  if (byId) return true;

  // If not found and email provided, check by email
  if (email) {
    const { data: byEmail } = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .limit(1)
      .maybeSingle();

    if (byEmail) return true;
  }

  return false;
}
