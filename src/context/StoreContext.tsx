import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Product, Category, CartItem, StoreSettings, CustomerDetails, WeightOption } from '../types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../data/initialData';

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

  // Admin actions
  loginAdmin: (pin: string) => boolean;
  logoutAdmin: () => void;
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addCategory: (name: string) => void;
  updateCategory: (id: string, newName: string) => void;
  deleteCategory: (id: string) => void;
  importBulkProducts: (importedProducts: Omit<Product, 'id'>[], replaceExisting?: boolean) => void;
  resetToDefaults: () => void;

  // Checkout submit
  sendOrderViaWhatsApp: (customerDetails: CustomerDetails) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load products (and ensure any newly added initial products like Chantilly cream exist)
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('gedo_frozen_products');
      if (saved) {
        const parsed: Product[] = JSON.parse(saved);
        // Merge missing default products (like bak-1, bak-2)
        const missing = INITIAL_PRODUCTS.filter(ip => !parsed.some(p => p.id === ip.id));
        if (missing.length > 0) {
          return [...parsed, ...missing];
        }
        return parsed;
      }
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Load categories (and ensure baking category exists)
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('gedo_frozen_categories');
      if (saved) {
        const parsed: Category[] = JSON.parse(saved);
        const missing = INITIAL_CATEGORIES.filter(ic => !parsed.some(c => c.id === ic.id));
        if (missing.length > 0) {
          return [...parsed, ...missing];
        }
        return parsed;
      }
      return INITIAL_CATEGORIES;
    } catch {
      return INITIAL_CATEGORIES;
    }
  });

  // Load settings
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('gedo_frozen_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.whatsappNumber === '201012345678' || parsed.whatsappNumber === '01012345678' || !parsed.whatsappNumber) {
          parsed.whatsappNumber = INITIAL_SETTINGS.whatsappNumber;
          parsed.supportPhone = INITIAL_SETTINGS.supportPhone;
          parsed.walletNumber = INITIAL_SETTINGS.walletNumber;
        }
        if (!parsed.announcementText || parsed.announcementText.includes('مبردة') || parsed.announcementText.includes('مجاني') || parsed.announcementText.includes('باب')) {
          parsed.announcementText = INITIAL_SETTINGS.announcementText;
        }
        if (!parsed.addressText || !parsed.addressText.includes('الفردوس') || parsed.addressText.includes('سيارات مجهزة')) {
          parsed.addressText = INITIAL_SETTINGS.addressText;
        }
        delete parsed.freeDeliveryThreshold;
        return { ...INITIAL_SETTINGS, ...parsed };
      }
      return INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // Cart state
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
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('gedo_admin_auth') === 'true';
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('gedo_frozen_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('gedo_frozen_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('gedo_frozen_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('gedo_frozen_cart', JSON.stringify(cart));
  }, [cart]);

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
    // If product has weightOptions and none specified, pick the first one
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

  // Admin auth
  const loginAdmin = (pin: string): boolean => {
    if (pin.trim() === settings.adminPin.trim()) {
      setIsAdminLoggedIn(true);
      sessionStorage.setItem('gedo_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('gedo_admin_auth');
  };

  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = 'prod-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setProducts(prev => [ { id, ...newProd }, ...prev ]);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updated } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setCart(prev => prev.filter(item => item.product.id !== id));
  };

  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = 'cat-' + Date.now();
    setCategories(prev => [...prev, { id, name: trimmed }]);
  };

  const updateCategory = (id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || id === 'all') return;
    setCategories(prev =>
      prev.map(c => (c.id === id ? { ...c, name: trimmed } : c))
    );
  };

  const deleteCategory = (id: string) => {
    if (id === 'all') return;
    setCategories(prev => prev.filter(c => c.id !== id));
    if (activeCategory === id) {
      setActiveCategory('all');
    }
  };

  const importBulkProducts = (importedProducts: Omit<Product, 'id'>[], replaceExisting: boolean = false) => {
    const formatted = importedProducts.map((p, idx) => ({
      id: 'prod-imp-' + Date.now() + '-' + idx,
      ...p
    }));

    if (replaceExisting) {
      setProducts(formatted);
    } else {
      setProducts(prev => [...formatted, ...prev]);
    }
  };

  const resetToDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setSettings(INITIAL_SETTINGS);
    localStorage.removeItem('gedo_frozen_products');
    localStorage.removeItem('gedo_frozen_categories');
    localStorage.removeItem('gedo_frozen_settings');
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

    let itemsText = '';
    cart.forEach((item, index) => {
      const price = item.selectedWeight ? item.selectedWeight.price : item.product.price;
      const itemSubtotal = price * item.quantity;
      itemsText += `${index + 1}. *${item.product.name}*\n`;
      if (item.selectedWeight) {
        itemsText += `   الوزن/الحجم المختار: *${item.selectedWeight.name}*\n`;
      } else if (item.product.weight) {
        itemsText += `   الوزن: (${item.product.weight})\n`;
      }
      itemsText += `   الكمية: ${item.quantity} × ${price} ج.م = ${itemSubtotal} ج.م\n`;
      if (item.notes) {
        itemsText += `   ملاحظة للصنف: ${item.notes}\n`;
      }
    });

    let addressSection = '';
    if (customerDetails.deliveryType === 'delivery') {
      addressSection = 
`📍 *عنوان التوصيل (داخل 6 أكتوبر):*
- الحي / المنطقة: ${customerDetails.area || 'غير محدد'}
- الشارع: ${customerDetails.street || 'غير محدد'}
- العمارة/الدور/الشقة: ${customerDetails.building ? `عمارة ${customerDetails.building}` : ''} ${customerDetails.apartment ? `شقة ${customerDetails.apartment}` : ''}
${customerDetails.landmark ? `- علامة مميزة: ${customerDetails.landmark}` : ''}`;
    } else {
      addressSection = `🏪 *الاستلام:* من مقر المحل (٧ز مدينة الفردوس استثماري شارع أنس ابن مالك أمام صيدلية محمد شمس -حدائق أكتوبر-)`;
    }

    const message = 
`🧊 *طلب جديد من متجر ${settings.storeName}* 🧊
رقم الطلب: #${orderNumber}
التاريخ: ${new Date().toLocaleDateString('ar-EG')}

👤 *بيانات العميل:*
- الاسم: ${customerDetails.name}
- رقم الهاتف: ${customerDetails.phone}
${customerDetails.altPhone ? `- هاتف بديل: ${customerDetails.altPhone}\n` : ''}- طريقة الاستلام: ${deliveryTypeLabel}

${addressSection}

---------------------------------
🛒 *أصناف الطلب (${cartTotalCount} صنف):*
${itemsText}
---------------------------------
💰 *الحساب والإجمالي:*
- المجموع الفرعي: ${subtotal} ج.م
${customerDetails.deliveryType === 'delivery' ? `- رسوم التوصيل: ${orderFee} ج.م\n` : ''}- *الإجمالي النهائي: ${finalTotal} ج.م*

💳 *طريقة الدفع المختارة:*
${paymentLabel}

${customerDetails.notes ? `📝 *ملاحظات عامة على الطلب:* \n${customerDetails.notes}\n` : ''}
يرجى تأكيد استلام الطلب وتجهيزه. شكراً لكم!`;

    // Clean phone number for WhatsApp link
    let cleanNumber = settings.whatsappNumber.replace(/[^0-9]/g, '');
    if (cleanNumber.startsWith('01')) {
      cleanNumber = '2' + cleanNumber; // add Egypt prefix if needed
    }

    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    
    // Clear cart upon successful trigger and close checkout
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
