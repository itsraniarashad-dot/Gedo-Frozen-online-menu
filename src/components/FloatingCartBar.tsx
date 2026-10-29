import React from 'react';
import { useStore } from '../context/StoreContext';
import { ShoppingBag, ArrowLeft } from 'lucide-react';

export const FloatingCartBar: React.FC = () => {
  const { cartTotalCount, subtotal, isCheckoutOpen, openCheckout } = useStore();

  if (cartTotalCount === 0 || isCheckoutOpen) return null;

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto">
        
        {/* Floating Bar Button */}
        <button
          onClick={openCheckout}
          className="w-full bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white rounded-2xl p-3 sm:p-3.5 shadow-xl shadow-orange-600/30 flex items-center justify-between transition-all duration-200 active:scale-98 cursor-pointer border border-white/20"
        >
          {/* Left: Cart Count & Subtotal */}
          <div className="flex items-center gap-3">
            <div className="relative bg-white/20 p-2 rounded-xl">
              <ShoppingBag className="w-5 h-5 text-white" />
              <span className="absolute -top-1.5 -right-1.5 bg-white text-orange-600 font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                {cartTotalCount}
              </span>
            </div>
            <div className="text-right">
              <div className="text-[11px] text-orange-100 font-medium">إجمالي المنتجات</div>
              <div className="text-base sm:text-lg font-black leading-none">
                {subtotal} <span className="text-xs font-bold">ج.م</span>
              </div>
            </div>
          </div>

          {/* Right: Checkout CTA */}
          <div className="flex items-center gap-2 font-black text-sm sm:text-base bg-white/20 hover:bg-white/30 px-3.5 py-1.5 rounded-xl transition">
            <span>إتمام الطلب</span>
            <ArrowLeft className="w-4 h-4" />
          </div>
        </button>

      </div>
    </div>
  );
};
