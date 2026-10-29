import React, { useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

export const CategoryNav: React.FC = () => {
  const { categories, activeCategory, setActiveCategory, products } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getProductCount = (catId: string) => {
    if (catId === 'all') return products.length;
    return products.filter(p => p.category === catId).length;
  };

  return (
    <div className="sticky top-[108px] md:top-[128px] z-30 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs py-2.5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        
        {/* Navigation scroll arrows for desktop */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="hidden md:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-stone-200 items-center justify-center text-stone-600 hover:text-orange-600 hover:border-orange-300 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="hidden md:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-stone-200 items-center justify-center text-stone-600 hover:text-orange-600 hover:border-orange-300 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Categories container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1 md:px-8"
        >
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const count = getProductCount(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-600/30 ring-2 ring-orange-600/20'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 border border-stone-200/80'
                }`}
              >
                {cat.id === 'bundles' && (
                  <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-amber-200' : 'text-amber-500'}`} />
                )}
                <span>{cat.name}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-black ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-stone-200/80 text-stone-600 group-hover:bg-stone-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
