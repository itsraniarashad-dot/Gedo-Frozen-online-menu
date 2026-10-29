export type CookingMethod = 'airfryer' | 'frying' | 'oven' | 'boil' | 'grill' | 'ready';

export interface WeightOption {
  id: string;
  name: string; // e.g. "50 جرام", "100 جرام", "250 جرام (ربع كيلو)", "500 جرام", "1 كجم"
  price: number;
  originalPrice?: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  weight: string;
  weightOptions?: WeightOption[];
  cookingMethod?: string;
  cookingTime?: string;
  image: string;
  badge?: string;
  inStock: boolean;
  storageTip?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedWeight?: WeightOption;
  notes?: string;
}

export type PaymentMethod = 'cod' | 'instapay' | 'wallet';

export type DeliveryType = 'delivery' | 'pickup';

export interface CustomerDetails {
  name: string;
  phone: string;
  altPhone?: string;
  deliveryType: DeliveryType;
  area: string;
  street: string;
  building: string;
  apartment: string;
  landmark?: string;
  notes?: string;
  paymentMethod: PaymentMethod;
}

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  whatsappNumber: string; // e.g. "201012345678"
  supportPhone: string;
  instapayHandle: string; // e.g. "gedofrozen@instapay"
  walletNumber: string; // e.g. "01012345678"
  walletType: string; // e.g. "فودافون كاش / أورنج / اتصالات"
  deliveryFee: number;
  freeDeliveryThreshold?: number;
  minOrderAmount: number;
  addressText: string;
  announcementText: string;
  adminPin: string;
  workingHours: string;
}
