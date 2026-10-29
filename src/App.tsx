import React, { useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { FloatingCartBar } from './components/FloatingCartBar';
import { CartCheckoutModal } from './components/CartCheckoutModal';
import { AdminDashboard } from './components/AdminDashboard';
import { 
  Snowflake, 
  Flame, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  Search, 
  PhoneCall, 
  MessageCircle,
  HelpCircle,
  ChevronDown,
  MapPin
} from 'lucide-react';

const MenuContent: React.FC = () => {
  const { 
    products, 
    categories, 
    activeCategory, 
    searchQuery, 
    setSearchQuery,
    settings,
    openAdminDashboard
  } = useStore();

  // Filter products by category & search query
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesSearch = 
        !searchQuery.trim() ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, activeCategory, searchQuery]);

  // Grouped products when "all" is active and no search query
  const groupedCategories = useMemo(() => {
    if (activeCategory !== 'all' || searchQuery.trim()) return null;
    return categories
      .filter(c => c.id !== 'all')
      .map(category => ({
        category,
        items: products.filter(p => p.category === category.id)
      }))
      .filter(group => group.items.length > 0);
  }, [categories, products, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-800">
      {/* Main Header */}
      <Header />

      {/* Hero Banner Section */}
      <section className="bg-gradient-to-b from-orange-50 via-white to-stone-50 border-b border-orange-100/60 py-6 md:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Right text in RTL */}
            <div className="text-center md:text-right space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>مفرزنات منزلية ومطاعم بأعلى درجات الجودة والنظافة</span>
              </div>
              
              <h2 className="text-2xl sm:text-4xl font-black text-stone-900 leading-tight">
                أشهى الوجبات والمفرزنات المجمدة
                <span className="block text-orange-600 mt-1">
                  جاهزة للطهي والتسوية في دقائق! 🧊🔥
                </span>
              </h2>

              <p className="text-stone-600 text-xs sm:text-sm leading-relaxed">
                وفر وقتك وجهدك مع تشكيلة جدو فروزن الممتازة: برجر صافي، ستريبس وبانيه كرانشي، سمبوسك مقرمشة، ومأكولات بحرية متبلة جاهزة للطهي في منطقة 6 أكتوبر مع خيارات دفع مرنة (كاش، إنستاباي، ومحافظ إلكترونية).
              </p>

              {/* Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs font-bold text-stone-600">
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
                  <Truck className="w-4 h-4 text-orange-600" />
                  <span>توصيل سريع داخل 6 أكتوبر</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>لحوم ودواجن بلدي 100%</span>
                </div>
              </div>
            </div>

            {/* Left Quick Highlights Card */}
            <div className="w-full md:w-auto shrink-0 bg-white border border-orange-200/90 rounded-3xl p-4 sm:p-5 shadow-lg shadow-orange-600/5 max-w-sm">
              <div className="flex items-center gap-3 border-b border-stone-100 pb-3 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-white border border-orange-200 p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                  <img src="/logo.png" alt="جدو فروزن" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-stone-900">جدو GEDO FROZEN</h4>
                  <p className="text-[11px] text-orange-700 font-bold">مجمدات ومستلزمات الحلويات</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex items-center justify-between">
                  <span>الحد الأدنى:</span>
                  <span className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-lg">
                    بدون حد أدنى للطلب ✓
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>رسوم التوصيل:</span>
                  <span className="font-bold text-stone-900">{settings.deliveryFee} ج.م</span>
                </div>
                <div className="flex items-center justify-between text-orange-800 bg-orange-100/70 px-2.5 py-1.5 rounded-xl font-bold border border-orange-200">
                  <span>نطاق التوصيل:</span>
                  <span>داخل 6 أكتوبر فقط 📍</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px] text-stone-500">
                  <span>طرق الدفع المتاحة:</span>
                  <span className="font-bold text-stone-800">كاش / إنستاباي / محفظة</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Sticky Category Navigation */}
      <CategoryNav />

      {/* Products Catalog Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        
        {/* Active Filter or Search info */}
        {searchQuery.trim() && (
          <div className="mb-6 flex items-center justify-between bg-white p-3.5 rounded-2xl border border-stone-200">
            <div className="text-xs sm:text-sm text-stone-600">
              نتائج البحث عن: <strong className="text-orange-600 font-black">"{searchQuery}"</strong> ({filteredProducts.length} صنف)
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-stone-400 hover:text-stone-700"
            >
              إلغاء البحث
            </button>
          </div>
        )}

        {/* If no search and "all" category is selected: Lebanese Bakery sectioned layout */}
        {groupedCategories && groupedCategories.length > 0 ? (
          <div className="space-y-12">
            {groupedCategories.map(({ category, items }) => (
              <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-36">
                <div className="flex items-center justify-between mb-4 border-b border-stone-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-6 bg-orange-600 rounded-full"></span>
                    <h3 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                      {category.name}
                    </h3>
                    <span className="text-xs font-bold text-stone-400">
                      ({items.length} صنف)
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Filtered View (specific category or active search) */
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-stone-200/80 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-6 bg-orange-600 rounded-full"></span>
                <h3 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
                  {categories.find(c => c.id === activeCategory)?.name || 'المنتجات'}
                </h3>
                <span className="text-xs font-bold text-stone-400">
                  ({filteredProducts.length} صنف)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ) : (
          /* Zero Results State */
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-300 p-6">
            <Snowflake className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="text-base font-black text-stone-800">لم يتم العثور على أي منتج</h3>
            <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
              جرب البحث بكلمة أخرى أو اختر قسماً مختلفاً من شريط الأقسام في الأعلى
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition"
            >
              عرض كافة المنتجات
            </button>
          </div>
        )}

      </main>

      {/* Floating Bottom Cart Bar */}
      <FloatingCartBar />

      {/* Modals */}
      <ProductDetailModal />
      <CartCheckoutModal />
      <AdminDashboard />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-16 pt-10 pb-24 sm:pb-12 text-stone-600 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand & Bio */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-11 h-11 rounded-2xl bg-white border border-stone-200 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                  <img src="/logo.png" alt="جدو فروزن" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-base font-black text-stone-900 leading-none">
                    جدو فروزن | GEDO FROZEN
                  </h4>
                  <p className="text-[11px] text-orange-600 font-bold mt-1">مجمدات ومستلزمات الحلويات</p>
                </div>
              </div>
              <div className="pt-2 bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-stone-900 font-bold text-xs">
                  <MapPin className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>عنوان ومقر المحل:</span>
                </div>
                <p className="text-xs font-semibold text-stone-700 leading-relaxed pr-5">
                  ٧ز مدينة الفردوس استثماري شارع أنس ابن مالك أمام صيدلية محمد شمس -حدائق أكتوبر محافظة الجيزة-
                </p>
                <div className="text-[11px] text-orange-700 font-medium pr-5 pt-0.5">
                  🛵 التوصيل متاح داخل منطقة 6 أكتوبر | ومتاح الاستلام من المحل مباشرة 🏪
                </div>
              </div>
            </div>

            {/* Col 2: Ordering & Payment */}
            <div className="space-y-2">
              <h5 className="font-black text-stone-900 text-sm">طرق الدفع المعتمدة</h5>
              <ul className="space-y-1.5 text-stone-500">
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                  <span>الدفع عند الاستلام (كاش)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                  <span>تحويل إنستاباي (InstaPay)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  <span>محافظ إلكترونية (فودافون كاش ومثيلاتها)</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Contact & Store Owner */}
            <div className="space-y-2">
              <h5 className="font-black text-stone-900 text-sm">التواصل والدعم</h5>
              <p className="text-stone-500">
                مواعيد العمل: {settings.workingHours}
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <a
                  href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-xl font-bold w-fit transition"
                >
                  <MessageCircle className="w-4 h-4 text-green-600" />
                  <span>محادثة واتساب للطلب</span>
                </a>

                <button
                  onClick={openAdminDashboard}
                  className="mt-1 inline-flex items-center gap-2 bg-stone-900 hover:bg-orange-600 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer shadow-xs w-fit"
                >
                  <ShieldCheck className="w-4 h-4 text-orange-400" />
                  <span>لوحة تحكم وإعدادات المتجر ⚙️</span>
                </button>
              </div>
            </div>

          </div>

          <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-400 text-[11px]">
            <div>
              © {new Date().getFullYear()} Gedo Frozen | جميع الحقوق محفوظة لمتجر جدو فروزن.
            </div>
            <div className="flex items-center gap-2">
              <span>تطوير وتصميم منيو رقمي ذكي للمنتجات المجمدة</span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MenuContent />
    </StoreProvider>
  );
}
