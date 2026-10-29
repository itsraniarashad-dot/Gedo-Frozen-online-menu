import React, { useState } from 'react';
import { Product } from '../types';
import { useStore, getCartItemKey } from '../context/StoreContext';
import { Plus, Minus, Flame, Timer, Snowflake, Scale } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { cart, addToCart, updateQuantity, openProductModal } = useStore();
  const [selectedWeightIndex, setSelectedWeightIndex] = useState<number>(0);

  const hasWeightOptions = product.weightOptions && product.weightOptions.length > 0;
  const currentWeightOption = hasWeightOptions ? product.weightOptions![selectedWeightIndex] : undefined;

  // Active price and original price based on selected weight
  const currentPrice = currentWeightOption ? currentWeightOption.price : product.price;
  const currentOriginalPrice = currentWeightOption?.originalPrice || product.originalPrice;

  // Find if this exact item + weight is in cart
  const itemCartKey = getCartItemKey({ product, selectedWeight: currentWeightOption });
  const cartItem = cart.find(item => getCartItemKey(item) === itemCartKey);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/90 hover:border-orange-300 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Top Image Section */}
      <div 
        className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100 cursor-pointer"
        onClick={() => openProductModal(product)}
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>

        {/* Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="bg-orange-600 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shadow-sm backdrop-blur-xs">
              {product.badge}
            </span>
          )}
          {currentOriginalPrice && currentOriginalPrice > currentPrice && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              وفر {currentOriginalPrice - currentPrice} ج.م
            </span>
          )}
        </div>

        {/* Weight / Pack badge */}
        <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
          {hasWeightOptions ? (
            <>
              <Scale className="w-3 h-3 text-amber-300" />
              <span>{currentWeightOption?.name}</span>
            </>
          ) : (
            <>
              <Snowflake className="w-3 h-3 text-cyan-300" />
              <span>{product.weight}</span>
            </>
          )}
        </div>

        {/* Out of stock badge */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md">
              نفذت الكمية مؤقتاً
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Cooking instruction tag if available */}
          {product.cookingMethod && (
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                <Flame className="w-3 h-3 text-orange-500" />
                {product.cookingMethod}
              </span>
              {product.cookingTime && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500">
                  <Timer className="w-3 h-3 text-stone-400" />
                  {product.cookingTime}
                </span>
              )}
            </div>
          )}

          {/* Product Title */}
          <h3 
            onClick={() => openProductModal(product)}
            className="font-bold text-stone-900 text-sm sm:text-base hover:text-orange-600 transition-colors cursor-pointer line-clamp-1"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Product Description */}
          <p className="text-stone-500 text-xs mt-1 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Weight Options Selector Pills (if product has weights e.g. 50g, 100g, 250g, 500g, 1kg) */}
          {hasWeightOptions && (
            <div className="mt-2.5 pt-2 border-t border-stone-100">
              <div className="text-[11px] font-bold text-stone-700 mb-1.5 flex items-center justify-between">
                <span>اختر الوزن المطلوب:</span>
                <span className="text-orange-600 text-[10px] font-black">{currentWeightOption?.name}</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {product.weightOptions!.map((opt, idx) => {
                  const isSelected = selectedWeightIndex === idx;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedWeightIndex(idx)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-600 text-white shadow-2xs ring-1 ring-orange-600'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                      }`}
                    >
                      {opt.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Price and Add to Cart Section */}
        <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          
          {/* Price */}
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-black text-orange-600">
                {currentPrice}
              </span>
              <span className="text-[11px] font-bold text-stone-500">ج.م</span>
            </div>
            {currentOriginalPrice && currentOriginalPrice > currentPrice && (
              <span className="text-[11px] text-stone-400 line-through">
                {currentOriginalPrice} ج.م
              </span>
            )}
          </div>

          {/* Action Button: Quantity controller if already added, else Add Button */}
          <div>
            {!product.inStock ? (
              <span className="text-xs text-stone-400 font-semibold px-2 py-1 bg-stone-100 rounded-lg">
                غير متوفر
              </span>
            ) : quantityInCart > 0 ? (
              <div className="flex items-center bg-orange-50 border border-orange-200 rounded-xl p-0.5 shadow-2xs">
                <button
                  onClick={() => updateQuantity(itemCartKey, quantityInCart - 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white text-orange-600 hover:bg-orange-600 hover:text-white transition shadow-2xs cursor-pointer active:scale-95"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-black text-sm text-stone-900">
                  {quantityInCart}
                </span>
                <button
                  onClick={() => addToCart(product, 1, currentWeightOption)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition shadow-2xs cursor-pointer active:scale-95"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => addToCart(product, 1, currentWeightOption)}
                className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold px-3.5 py-1.5 sm:py-2 rounded-xl shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
