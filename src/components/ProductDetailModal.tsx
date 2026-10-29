import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Plus, Minus, Snowflake, ShieldCheck, ShoppingBag, Scale } from 'lucide-react';

export const ProductDetailModal: React.FC = () => {
  const { selectedProductForModal, closeProductModal, addToCart } = useStore();
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedWeightIndex, setSelectedWeightIndex] = useState<number>(0);
  const [itemNote, setItemNote] = useState<string>('');

  if (!selectedProductForModal) return null;

  const product = selectedProductForModal;
  const hasWeightOptions = product.weightOptions && product.weightOptions.length > 0;
  const currentWeightOption = hasWeightOptions ? product.weightOptions![selectedWeightIndex] : undefined;

  const unitPrice = currentWeightOption ? currentWeightOption.price : product.price;
  const originalUnitPrice = currentWeightOption?.originalPrice || product.originalPrice;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    addToCart(product, quantity, currentWeightOption, itemNote.trim() ? itemNote : undefined);
    closeProductModal();
    setItemNote('');
    setQuantity(1);
    setSelectedWeightIndex(0);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-orange-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeProductModal}
          className="absolute top-3 left-3 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow-md flex items-center justify-center transition cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Banner */}
        <div className="relative h-60 sm:h-72 w-full bg-stone-100 shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

          {/* Badges on image */}
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {product.badge && (
              <span className="bg-orange-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-md">
                {product.badge}
              </span>
            )}
            {originalUnitPrice && originalUnitPrice > unitPrice && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm">
                وفر {originalUnitPrice - unitPrice} ج.م
              </span>
            )}
          </div>

          {/* Bottom info banner on image */}
          <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white">
            <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5">
              {hasWeightOptions ? (
                <>
                  <Scale className="w-3.5 h-3.5 text-amber-300" />
                  <span>{currentWeightOption?.name}</span>
                </>
              ) : (
                <>
                  <Snowflake className="w-3.5 h-3.5 text-cyan-300" />
                  <span>{product.weight || 'مجمد طازج'}</span>
                </>
              )}
            </div>
            {product.storageTip && (
              <span className="text-[11px] text-stone-200 bg-stone-900/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                {product.storageTip}
              </span>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {/* Header & Price */}
          <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900">
                {product.name}
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">
                {product.description}
              </p>
            </div>
            <div className="text-left shrink-0">
              <div className="text-2xl font-black text-orange-600">
                {unitPrice} <span className="text-xs font-bold text-stone-500">ج.م</span>
              </div>
              {originalUnitPrice && originalUnitPrice > unitPrice && (
                <div className="text-xs text-stone-400 line-through">
                  {originalUnitPrice} ج.م
                </div>
              )}
            </div>
          </div>

          {/* Weight Selection Section (if product has multiple weight options) */}
          {hasWeightOptions && (
            <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-orange-600" />
                  <span>اختر وزن العبوة المطلوب:</span>
                </h4>
                <span className="text-xs font-black text-orange-600">
                  {currentWeightOption?.name} — {currentWeightOption?.price} ج.م
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {product.weightOptions!.map((opt, idx) => {
                  const isSelected = selectedWeightIndex === idx;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedWeightIndex(idx)}
                      className={`p-2.5 rounded-xl border text-right transition cursor-pointer ${
                        isSelected
                          ? 'border-orange-500 bg-white ring-2 ring-orange-500/30 shadow-xs'
                          : 'border-stone-200 bg-white/70 hover:bg-white text-stone-700'
                      }`}
                    >
                      <div className="font-bold text-xs text-stone-900">{opt.name}</div>
                      <div className="text-xs font-black text-orange-600 mt-0.5">{opt.price} ج.م</div>
                      {opt.originalPrice && (
                        <div className="text-[10px] text-stone-400 line-through">{opt.originalPrice} ج.م</div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Item Special Notes Input */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              ملاحظاتك الخاصة على هذا الصنف (اختياري):
            </label>
            <input
              type="text"
              placeholder="مثلاً: بدون سكر / تغليف خاص..."
              value={itemNote}
              onChange={(e) => setItemNote(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-stone-50 focus:bg-white border border-stone-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-xl text-xs sm:text-sm outline-none transition"
            />
          </div>

        </div>

        {/* Modal Footer: Quantity & Add Button */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3 shrink-0">
          
          {/* Quantity Selector */}
          <div className="flex items-center bg-white border border-stone-200 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 transition cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-black text-base text-stone-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-orange-600 text-white hover:bg-orange-700 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            disabled={!product.inStock}
            className="flex-1 flex items-center justify-center gap-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-black text-sm sm:text-base py-3 px-5 rounded-2xl shadow-md hover:shadow-lg transition active:scale-98 cursor-pointer"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>إضافة للسلة</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-xs font-bold">
              {totalPrice} ج.م
            </span>
          </button>

        </div>

      </div>

    </div>
  );
};
