import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Product, Category, CartItem, StoreSettings, CustomerDetails, WeightOption } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { 
  fetchAllProductsFromSupabase, 
  fetchAllCategoriesFromSupabase, 
  fetchStoreSettingsFromSupabase,
  verifyAdminUser 
} from '../services/supabaseData';

export const getCartItemKey = (item: { product: { id: string }; selectedWeight?: { id: string } }): string => {
  return `${item.product.id}${item.selectedWeight ? `_${item.selectedWeight.id}` : ''}`;
};

interface StoreContextType {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  cart: CartItem[];
  activeCategory: string;
  searchQuery: string;
  isCheckoutOpen: boolean;
  isAdminDashboardOpen: boolean;
  selectedProductForModal: Product | null;
  isAdminLoggedIn: boolean;

  // Supabase Status
  isLoadingData: boolean;
  dataSourceError: string | null;
  isUsingSupabase: boolean;
  adminEmail: string | null;
  refreshData: () => Promise<void>;

  // Actions
  setActiveCategory: (cat: string) => void;
  setSearchQuery: (query: string) => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openAdminDashboard: () => void;
  closeAdminDashboard: () => void;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;

  // Cart actions
  addToCart: (product: Product, quantity?: number, selectedWeight?: WeightOption, notes?: string) => void;
  updateQuantity: (cartItemKey: string, quantity: number) => void;
  removeFromCart: (cartItemKey: string) => void;
  clearCart: () => void;
  getCartItemKey: (item: { product: { id: string }; selectedWeight?: { id: string } }) => string;
  cartTotalCount: number;
  subtotal: number;
  calculateDeliveryFee: (deliveryType: 'delivery' | 'pickup') => number;
  calculateTotal: (deliveryType: 'delivery' | 'pickup') => number;

  // Admin actions (PIN fallback & Supabase email/password)
  loginAdmin: (pin: string) => boolean;
  loginAdminWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  updateCategory: (id: string, newName: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  importBulkProducts: (importedProducts: Omit<Product, 'id'>[], replaceExisting?: boolean) => Promise<void>;
  resetToDefaults: () => void;

  // Checkout submit
  sendOrderViaWhatsApp: (customerDetails: CustomerDetails) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Loading & error state
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
  const [dataSourceError, setDataSourceError] = useState<string | null>(null);

  // Products state (initializes with empty array or local fallback, replaced by Supabase)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('gedo_frozen_products');
      if (saved) return JSON.parse(saved);
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Categories state
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('gedo_frozen_categories');
      if (saved) return JSON.parse(saved);
      return INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Settings state
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('gedo_frozen_settings');
      if (saved) return { ...INITIAL_SETTINGS, ...JSON.parse(saved) };
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Cart state (STRICT REQUIREMENT: Keep shopping cart stored locally)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gedo_frozen_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);
  
  // Admin auth state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('gedo_admin_auth') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    return sessionStorage.getItem('gedo_admin_email') || null;
  });

  // Save cart locally
  useEffect(() => {
    localStorage.setItem('gedo_frozen_cart', JSON.stringify(cart));
  }, [cart]);

  // Check Supabase session on load
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const isAdmin = await verifyAdminUser(session.user.id, session.user.email);
        if (isAdmin) {
          setIsAdminLoggedIn(true);
          setAdminEmail(session.user.email || null);
          sessionStorage.setItem('gedo_admin_auth', 'true');
          sessionStorage.setItem('gedo_admin_email', session.user.email || '');
        }
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const isAdmin = await verifyAdminUser(session.user.id, session.user.email);
        if (isAdmin) {
          setIsAdminLoggedIn(true);
          setAdminEmail(session.user.email || null);
          sessionStorage.setItem('gedo_admin_auth', 'true');
          sessionStorage.setItem('gedo_admin_email', session.user.email || '');
        } else {
          setIsAdminLoggedIn(false);
          setAdminEmail(null);
          sessionStorage.removeItem('gedo_admin_auth');
          sessionStorage.removeItem('gedo_admin_email');
        }
      } else if (event === 'SIGNED_OUT') {
        setIsAdminLoggedIn(false);
        setAdminEmail(null);
        sessionStorage.removeItem('gedo_admin_auth');
        sessionStorage.removeItem('gedo_admin_email');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch all data from Supabase
  const loadDataFromSupabase = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoadingData(false);
      return;
    }

    setIsLoadingData(true);
    setDataSourceError(null);

    try {
      let catError: any = null;
      let prodError: any = null;

      // 1. Fetch categories
      try {
        const fetchedCategories = await fetchAllCategoriesFromSupabase();
        if (fetchedCategories.length > 0) {
          const hasAll = fetchedCategories.some(c => c.id === 'all');
          const finalCategories = hasAll
            ? fetchedCategories
            : [{ id: 'all', name: 'الكل' }, ...fetchedCategories];
          setCategories(finalCategories);
        }
      } catch (err: any) {
        console.warn('Categories load issue:', err);
        catError = err;
      }

      // 2. Fetch ALL products (paginated)
      try {
        const fetchedProducts = await fetchAllProductsFromSupabase();
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
        }
      } catch (err: any) {
        console.warn('Products load issue:', err);
        prodError = err;
      }

      // 3. Fetch store settings
      try {
        const fetchedSettings = await fetchStoreSettingsFromSupabase();
        if (fetchedSettings) {
          setSettings(prev => ({ ...prev, ...fetchedSettings }));
        }
      } catch (err: any) {
        console.warn('Store settings load issue:', err);
      }

      // If there is any permission error, show clear Arabic explanation
      if (catError || prodError) {
        const primaryError = catError || prodError;
        setDataSourceError(primaryError.message || 'حدث خطأ في صلاحيات Supabase (RLS).');
      }
    } catch (err: any) {
      console.error('Failed to load store data from Supabase:', err);
      setDataSourceError(err.message || 'حدث خطأ أثناء تحميل البيانات من Supabase.');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadDataFromSupabase();
  }, [loadDataFromSupabase]);

  // Cart calculations with weightOption support
  const cartTotalCount = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.selectedWeight ? item.selectedWeight.price : item.product.price;
      return sum + (price * item.quantity);
    }, 0);
  }, [cart]);

  const calculateDeliveryFee = (deliveryType: 'delivery' | 'pickup'): number => {
    if (deliveryType === 'pickup') return 0;
    return settings.deliveryFee;
  };

  const calculateTotal = (deliveryType: 'delivery' | 'pickup'): number => {
    return subtotal + calculateDeliveryFee(deliveryType);
  };

  // Cart Actions
  const addToCart = (
    product: Product, 
    quantity: number = 1, 
    selectedWeight?: WeightOption, 
    notes?: string
  ) => {
    const weightToUse = selectedWeight || (product.weightOptions && product.weightOptions.length > 0 ? product.weightOptions[0] : undefined);
    const targetKey = getCartItemKey({ product, selectedWeight: weightToUse });

    setCart(prev => {
      const existingIndex = prev.findIndex(item => getCartItemKey(item) === targetKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
          notes: notes !== undefined ? notes : updated[existingIndex].notes
        };
        return updated;
      } else {
        return [...prev, { product, quantity, selectedWeight: weightToUse, notes }];
      }
    });
  };

  const updateQuantity = (cartItemKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemKey);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        getCartItemKey(item) === cartItemKey ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (cartItemKey: string) => {
    setCart(prev => prev.filter(item => getCartItemKey(item) !== cartItemKey));
  };

  const clearCart = () => {
    setCart([]);
  };

  // UI Modals
  const openCheckout = () => setIsCheckoutOpen(true);
  const closeCheckout = () => setIsCheckoutOpen(false);

  const openAdminDashboard = () => setIsAdminDashboardOpen(true);
  const closeAdminDashboard = () => setIsAdminDashboardOpen(false);

  const openProductModal = (product: Product) => setSelectedProductForModal(product);
  const closeProductModal = () => setSelectedProductForModal(null);

  // Admin auth: Supabase Email/Password + Admin verification
  const loginAdminWithSupabase = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!supabase || !isSupabaseConfigured) {
      // Fallback message if not configured yet
      return { success: false, error: 'لم يتم ربط مفاتيح Supabase بعد. يمكنك استخدام رمز المرور PIN كبديل.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        return { success: false, error: error.message || 'بيانات الدخول غير صحيحة' };
      }

      if (!data.user) {
        return { success: false, error: 'تعذر التحقق من المستخدم' };
      }

      // Check admin_users table for verification
      const isAdmin = await verifyAdminUser(data.user.id, data.user.email);
      if (!isAdmin) {
        await supabase.auth.signOut();
        return { success: false, error: 'هذا الحساب ليس لديه صلاحيات صاحب المتجر (غير مسجل في جدول admin_users).' };
      }

      setIsAdminLoggedIn(true);
      setAdminEmail(data.user.email || null);
      sessionStorage.setItem('gedo_admin_auth', 'true');
      sessionStorage.setItem('gedo_admin_email', data.user.email || '');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ أثناء تسجيل الدخول' };
    }
  };

  // Admin PIN fallback
  const loginAdmin = (pin: string): boolean => {
    if (pin.trim() === settings.adminPin.trim()) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('gedo_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = async () => {
    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Error signing out of Supabase:', err);
      }
    }
    setIsAdminLoggedIn(false);
    setAdminEmail(null);
    sessionStorage.removeItem('gedo_admin_auth');
    sessionStorage.removeItem('gedo_admin_email');
  };

  // Update Settings
  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));

    if (supabase && isSupabaseConfigured) {
      try {
        const payload: any = {};
        if (newSettings.storeName !== undefined) payload.store_name = newSettings.storeName;
        if (newSettings.storeTagline !== undefined) payload.store_tagline = newSettings.storeTagline;
        if (newSettings.whatsappNumber !== undefined) payload.whatsapp_number = newSettings.whatsappNumber;
        if (newSettings.supportPhone !== undefined) payload.support_phone = newSettings.supportPhone;
        if (newSettings.instapayHandle !== undefined) payload.instapay_handle = newSettings.instapayHandle;
        if (newSettings.walletNumber !== undefined) payload.wallet_number = newSettings.walletNumber;
        if (newSettings.walletType !== undefined) payload.wallet_type = newSettings.walletType;
        if (newSettings.deliveryFee !== undefined) payload.delivery_fee = newSettings.deliveryFee;
        if (newSettings.minOrderAmount !== undefined) payload.min_order_amount = newSettings.minOrderAmount;
        if (newSettings.addressText !== undefined) payload.address_text = newSettings.addressText;
        if (newSettings.announcementText !== undefined) payload.announcement_text = newSettings.announcementText;
        if (newSettings.adminPin !== undefined) payload.admin_pin = newSettings.adminPin;
        if (newSettings.workingHours !== undefined) payload.working_hours = newSettings.workingHours;

        // Upsert into store_settings
        const { data: existing } = await supabase.from('store_settings').select('id').limit(1).maybeSingle();
        if (existing?.id) {
          await supabase.from('store_settings').update(payload).eq('id', existing.id);
        } else {
          await supabase.from('store_settings').insert([payload]);
        }
      } catch (err) {
        console.error('Failed to sync settings with Supabase:', err);
      }
    }
  };

  // Add Product
  const addProduct = async (newProd: Omit<Product, 'id'>) => {
    const tempId = 'prod-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const optimisticProduct: Product = { id: tempId, ...newProd };
    setProducts(prev => [optimisticProduct, ...prev]);

    if (supabase && isSupabaseConfigured) {
      try {
        const payload: any = {
          name: newProd.name,
          category: newProd.category,
          description: newProd.description,
          price: newProd.price,
          original_price: newProd.originalPrice,
          weight: newProd.weight,
          weight_options: newProd.weightOptions ? JSON.stringify(newProd.weightOptions) : null,
          image: newProd.image,
          badge: newProd.badge,
          in_stock: newProd.inStock,
          storage_tip: newProd.storageTip
        };

        const { data, error } = await supabase.from('products').insert([payload]).select().single();
        if (error) throw error;
        if (data?.id) {
          setProducts(prev => prev.map(p => p.id === tempId ? { ...p, id: String(data.id) } : p));
        }
      } catch (err) {
        console.error('Failed to add product to Supabase:', err);
      }
    }
  };

  // Update Product
  const updateProduct = async (id: string, updated: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updated } : p))
    );

    if (supabase && isSupabaseConfigured) {
      try {
        const payload: any = {};
        if (updated.name !== undefined) payload.name = updated.name;
        if (updated.category !== undefined) payload.category = updated.category;
        if (updated.description !== undefined) payload.description = updated.description;
        if (updated.price !== undefined) payload.price = updated.price;
        if (updated.originalPrice !== undefined) payload.original_price = updated.originalPrice;
        if (updated.weight !== undefined) payload.weight = updated.weight;
        if (updated.weightOptions !== undefined) payload.weight_options = updated.weightOptions ? JSON.stringify(updated.weightOptions) : null;
        if (updated.image !== undefined) payload.image = updated.image;
        if (updated.badge !== undefined) payload.badge = updated.badge;
        if (updated.inStock !== undefined) payload.in_stock = updated.inStock;
        if (updated.storageTip !== undefined) payload.storage_tip = updated.storageTip;

        await supabase.from('products').update(payload).eq('id', id);
      } catch (err) {
        console.error(`Failed to update product ${id} in Supabase:`, err);
      }
    }
  };

  // Delete Product
  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.filter(item => item.product.id !== id));

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('products').delete().eq('id', id);
      } catch (err) {
        console.error(`Failed to delete product ${id} in Supabase:`, err);
      }
    }
  };

  // Add Category
  const addCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const tempId = 'cat-' + Date.now();
    setCategories(prev => [...prev, { id: tempId, name: trimmed }]);

    if (supabase && isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.from('categories').insert([{ name: trimmed }]).select().single();
        if (error) throw error;
        if (data?.id) {
          setCategories(prev => prev.map(c => c.id === tempId ? { ...c, id: String(data.id) } : c));
        }
      } catch (err) {
        console.error('Failed to add category to Supabase:', err);
      }
    }
  };

  // Update Category
  const updateCategory = async (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || id === 'all') return;
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, name: trimmed } : c))
    );

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('categories').update({ name: trimmed }).eq('id', id);
      } catch (err) {
        console.error(`Failed to update category ${id} in Supabase:`, err);
      }
    }
  };

  // Delete Category
  const deleteCategory = async (id: string) => {
    if (id === 'all') return;
    setCategories(prev => prev.filter(c => c.id !== id));
    if (activeCategory === id) {
      setActiveCategory('all');
    }

    if (supabase && isSupabaseConfigured) {
      try {
        await supabase.from('categories').delete().eq('id', id);
      } catch (err) {
        console.error(`Failed to delete category ${id} in Supabase:`, err);
      }
    }
  };

  // Import Bulk Products
  const importBulkProducts = async (importedProducts: Omit<Product, 'id'>[], replaceExisting: boolean = false) => {
    const formatted = importedProducts.map((p, idx) => ({
      id: 'prod-imp-' + Date.now() + '-' + idx,
      ...p
    }));

    if (replaceExisting) {
      setProducts(formatted);
    } else {
      setProducts(prev => [...formatted, ...prev]);
    }

    if (supabase && isSupabaseConfigured) {
      try {
        const records = importedProducts.map(p => ({
          name: p.name,
          category: p.category,
          description: p.description || '',
          price: p.price,
          original_price: p.originalPrice || null,
          weight: p.weight || '',
          weight_options: p.weightOptions ? JSON.stringify(p.weightOptions) : null,
          image: p.image,
          badge: p.badge || null,
          in_stock: p.inStock,
          storage_tip: p.storageTip || null
        }));

        if (replaceExisting) {
          // Delete all then insert
          await supabase.from('products').delete().neq('id', '0');
        }
        
        // Insert in batches of 100
        for (let i = 0; i < records.length; i += 100) {
          const batch = records.slice(i, i + 100);
          await supabase.from('products').insert(batch);
        }

        // Reload fresh from Supabase
        await loadDataFromSupabase();
      } catch (err) {
        console.error('Failed to import products to Supabase:', err);
      }
    }
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setSettings(INITIAL_SETTINGS);
  };

  // WhatsApp formatted order
  const sendOrderViaWhatsApp = (customerDetails: CustomerDetails) => {
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const orderFee = calculateDeliveryFee(customerDetails.deliveryType);
    const finalTotal = calculateTotal(customerDetails.deliveryType);

    const paymentLabel = 
      customerDetails.paymentMethod === 'cod' 
        ? '💵 دفع كاش عند الاستلام'
        : customerDetails.paymentMethod === 'instapay'
        ? `⚡ تحويل إنستاباي (InstaPay: ${settings.instapayHandle})`
        : `📱 محفظة إلكترونية (${settings.walletNumber} - ${settings.walletType})`;

    const deliveryTypeLabel = 
      customerDetails.deliveryType === 'delivery' ? '🛵 توصيل داخل 6 أكتوبر' : '🏪 استلام من مقر المحل بالفردوس';

    let message = `*طلب جديد من المتجر الإلكتروني - جدو فروزن* 🧊\n`;
    message += `*رقم الطلب:* #${orderNumber}\n`;
    message += `--------------------------------\n`;
    message += `*بيانات العميل:*\n`;
    message += `👤 *الاسم:* ${customerDetails.name}\n`;
    message += `📞 *رقم الهاتف:* ${customerDetails.phone}\n`;
    if (customerDetails.altPhone) {
      message += `📞 *رقم إضافي:* ${customerDetails.altPhone}\n`;
    }
    message += `🚚 *طريقة الاستلام:* ${deliveryTypeLabel}\n`;
    
    if (customerDetails.deliveryType === 'delivery') {
      message += `📍 *عنوان التوصيل بالتفصيل:*\n`;
      message += `المنطقة: ${customerDetails.area}\n`;
      message += `الشارع: ${customerDetails.street}\n`;
      message += `عمارة: ${customerDetails.building} - شقة: ${customerDetails.apartment}\n`;
      if (customerDetails.landmark) {
        message += `علامة مميزة: ${customerDetails.landmark}\n`;
      }
    }

    message += `💳 *طريقة الدفع المختارة:* ${paymentLabel}\n`;
    
    if (customerDetails.notes) {
      message += `📝 *ملاحظات خاصة:* ${customerDetails.notes}\n`;
    }

    message += `--------------------------------\n`;
    message += `*الأصناف والمنتجات المطلوبة:* 🛒\n`;

    cart.forEach((item, index) => {
      const unitPrice = item.selectedWeight ? item.selectedWeight.price : item.product.price;
      const weightInfo = item.selectedWeight ? ` (${item.selectedWeight.name})` : (item.product.weight ? ` [${item.product.weight}]` : '');
      const itemSubtotal = unitPrice * item.quantity;
      
      message += `${index + 1}. *${item.product.name}*${weightInfo}\n`;
      message += `   ${item.quantity} × ${unitPrice} = *${itemSubtotal} ج.م*\n`;
      if (item.notes) {
        message += `   ملاحظة: ${item.notes}\n`;
      }
    });

    message += `--------------------------------\n`;
    message += `💰 *قيمة الأصناف:* ${subtotal} ج.م\n`;
    message += `🛵 *رسوم التوصيل:* ${orderFee} ج.م\n`;
    message += `⭐ *إجمالي الحساب النهائي:* *${finalTotal} ج.م*\n`;
    message += `--------------------------------\n`;
    message += `يرجى تأكيد استلام الطلب وتحديد موعد التوصيل، شكراً لكم!`;

    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
    clearCart();
    closeCheckout();
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        settings,
        cart,
        activeCategory,
        searchQuery,
        isCheckoutOpen,
        isAdminDashboardOpen,
        selectedProductForModal,
        isAdminLoggedIn,

        isLoadingData,
        dataSourceError,
        isUsingSupabase: isSupabaseConfigured,
        adminEmail,
        refreshData: loadDataFromSupabase,

        setActiveCategory,
        setSearchQuery,
        openCheckout,
        closeCheckout,
        openAdminDashboard,
        closeAdminDashboard,
        openProductModal,
        closeProductModal,

        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getCartItemKey,
        cartTotalCount,
        subtotal,
        calculateDeliveryFee,
        calculateTotal,

        loginAdmin,
        loginAdminWithSupabase,
        logoutAdmin,
        updateSettings,
        addProduct,
        updateProduct,
        deleteProduct,
        addCategory,
        updateCategory,
        deleteCategory,
        importBulkProducts,
        resetToDefaults,
        sendOrderViaWhatsApp,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
