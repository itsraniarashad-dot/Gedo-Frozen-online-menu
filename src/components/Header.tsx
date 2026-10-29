import React from 'react';
import { useStore } from '../context/StoreContext';
import { 
  ShoppingBag, 
  Search, 
  PhoneCall, 
  Clock, 
  ShieldCheck, 
  X,
  MessageCircle,
  Snowflake,
  Flame
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    settings, 
    cartTotalCount, 
    subtotal, 
    openCheckout, 
    searchQuery, 
    setSearchQuery, 
    openAdminDashboard,
    isAdminLoggedIn
  } = useStore();

  return (
    <header className="bg-white border-b border-orange-100 sticky top-0 z-40 shadow-xs">
      {/* Top Announcement Bar */}
      {settings.announcementText && (
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-xs md:text-sm py-2 px-4 text-center font-medium shadow-inner flex items-center justify-center gap-2">
          <Snowflake className="w-4 h-4 animate-spin text-orange-100" style={{ animationDuration: '8s' }} />
          <span>{settings.announcementText}</span>
          <span className="hidden md:inline-block bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold">
            خدمة سريعة
          </span>
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3 md:py-4 gap-3">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white shadow-sm border border-orange-200/80 p-1 overflow-hidden shrink-0 hover:shadow-md transition">
              <img
                src="/logo.png"
                alt="Gedo Frozen - جدو فروزن"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-1.5">
                  <span className="text-orange-600">جدو</span>
                  <span className="text-stone-800 font-black">GEDO</span>
                  <span className="text-[11px] bg-orange-100 text-orange-700 font-extrabold px-2 py-0.5 rounded-full border border-orange-200">
                    FROZEN
                  </span>
                </h1>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block font-bold truncate max-w-xs md:max-w-md">
                مجمدات ومستلزمات الحلويات
              </p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="ابحث عن برجر، بانيه، سمبوسة، ستريبس، باقات التوفير..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-11 py-2.5 bg-stone-50 hover:bg-stone-100 focus:bg-white border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-full text-sm outline-none transition-all"
              />
              <Search className="w-4 h-4 text-stone-400 absolute right-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions: Admin Button + Phone + Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Contact / WhatsApp */}
            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition"
              title="تواصل معنا عبر واتساب"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
              <span>واتساب المتجر</span>
            </a>

            {/* Admin Dashboard Button */}
            <button
              onClick={openAdminDashboard}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 text-xs font-bold rounded-xl border transition cursor-pointer active:scale-95 ${
                isAdminLoggedIn
                  ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-xs'
                  : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300'
              }`}
              title="لوحة تحكم صاحب المتجر (إضافة وتعديل المنتجات والإعدادات)"
            >
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>الإدارة</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={openCheckout}
              className="relative flex items-center gap-2.5 bg-orange-600 hover:bg-orange-700 text-white px-3.5 sm:px-4 py-2.5 rounded-2xl shadow-sm hover:shadow-md transition active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {cartTotalCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-stone-900 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {cartTotalCount}
                  </span>
                )}
              </div>
              <div className="text-right hidden sm:block">
                <div className="text-[10px] text-orange-100 font-medium leading-none">السلة</div>
                <div className="text-xs font-black tracking-tight leading-tight">
                  {subtotal} ج.م
                </div>
              </div>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden pb-3">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="ابحث عن صنفك المفضل أو منتج مجمد..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-10 py-2 bg-stone-100 focus:bg-white border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl text-xs sm:text-sm outline-none transition"
            />
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Sub-header status bar */}
      <div className="bg-stone-50 border-t border-stone-100 py-1.5 px-4 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-semibold text-emerald-700">المتجر يستقبل الطلبات الآن</span>
            <span className="text-stone-300">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-stone-500">
              <Clock className="w-3 h-3 text-stone-400" />
              {settings.workingHours}
            </span>
          </div>
          <div className="flex items-center gap-2 text-stone-500">
            <span className="font-bold text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded-md border border-orange-200 text-[11px]">
              التوصيل متاح داخل منطقة 6 أكتوبر فقط حالياً 📍
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
