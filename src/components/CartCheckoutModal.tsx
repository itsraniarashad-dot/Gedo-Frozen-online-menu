import React, { useState } from 'react';
import { useStore, getCartItemKey } from '../context/StoreContext';
import { CustomerDetails, PaymentMethod, DeliveryType } from '../types';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Truck, 
  Store, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Zap, 
  Copy, 
  Check, 
  MessageSquare,
  AlertCircle,
  MapPin,
  Phone,
  User
} from 'lucide-react';

export const CartCheckoutModal: React.FC = () => {
  const { 
    isCheckoutOpen, 
    closeCheckout, 
    cart, 
    updateQuantity, 
    removeFromCart, 
    clearCart,
    subtotal, 
    settings, 
    calculateDeliveryFee, 
    calculateTotal,
    sendOrderViaWhatsApp
  } = useStore();

  const [deliveryType, setDeliveryType] = useState<DeliveryType>('delivery');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  
  // Form fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [apartment, setApartment] = useState('');
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');

  // Copy feedbacks
  const [copiedInstapay, setCopiedInstapay] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isCheckoutOpen) return null;

  const currentDeliveryFee = calculateDeliveryFee(deliveryType);
  const finalTotal = calculateTotal(deliveryType);

  const handleCopy = (text: string, type: 'instapay' | 'wallet') => {
    navigator.clipboard.writeText(text);
    if (type === 'instapay') {
      setCopiedInstapay(true);
      setTimeout(() => setCopiedInstapay(false), 2000);
    } else {
      setCopiedWallet(true);
      setTimeout(() => setCopiedWallet(false), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (cart.length === 0) {
      setErrorMessage('سلة المشتريات فارغة!');
      return;
    }

    if (!name.trim()) {
      setErrorMessage('يرجى إدخال اسم العميل');
      return;
    }

    if (!phone.trim() || phone.trim().length < 9) {
      setErrorMessage('يرجى إدخال رقم هاتف صحيح للتواصل والتأكيد');
      return;
    }

    if (deliveryType === 'delivery') {
      if (!area.trim() || !street.trim()) {
        setErrorMessage('يرجى كتابة المنطقة والشارع لتوصيل الطلب');
        return;
      }
    }

    if (subtotal < settings.minOrderAmount) {
      setErrorMessage(`الحد الأدنى للطلب هو ${settings.minOrderAmount} ج.م`);
      return;
    }

    const customerDetails: CustomerDetails = {
      name: name.trim(),
      phone: phone.trim(),
      altPhone: altPhone.trim() || undefined,
      deliveryType,
      area: area.trim(),
      street: street.trim(),
      building: building.trim(),
      apartment: apartment.trim(),
      landmark: landmark.trim() || undefined,
      notes: notes.trim() || undefined,
      paymentMethod
    };

    sendOrderViaWhatsApp(customerDetails);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      
      {/* Container */}
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-orange-100 flex flex-col max-h-[94vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="bg-orange-100 text-orange-600 p-2 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-stone-900">سلة الطلبات وإتمام الشراء</h2>
              <p className="text-xs text-stone-500">مراجعة الأصناف واختيار طريقة الدفع والتوصيل</p>
            </div>
          </div>
          
          <button
            onClick={closeCheckout}
            className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Error Message */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Section 1: Cart Items Review */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-sm font-black text-stone-800 flex items-center gap-2">
                <span>الأصناف المختارة ({cart.length})</span>
              </h3>
              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-stone-400 hover:text-red-600 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>تفريغ السلة</span>
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-500 text-sm font-bold">سلة المشتريات فارغة حالياً</p>
                <p className="text-stone-400 text-xs mt-1">تصفح المنيو وأضف منتجاتك المفضلة</p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100 bg-stone-50 rounded-2xl p-2 sm:p-3 border border-stone-200/80 max-h-56 overflow-y-auto">
                {cart.map((item) => {
                  const itemKey = getCartItemKey(item);
                  const itemPrice = item.selectedWeight ? item.selectedWeight.price : item.product.price;
                  return (
                    <div key={itemKey} className="py-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                            {item.product.name}
                          </h4>
                          <div className="text-[11px] text-stone-500 flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-orange-600">{itemPrice} ج.م</span>
                            {item.selectedWeight ? (
                              <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-1.5 py-0.2 rounded">
                                الوزن: {item.selectedWeight.name}
                              </span>
                            ) : item.product.weight ? (
                              <span>({item.product.weight})</span>
                            ) : null}
                          </div>
                          {item.notes && (
                            <div className="text-[10px] text-orange-600 italic">
                              ملاحظة: {item.notes}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Quantity control */}
                        <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded text-stone-600 hover:bg-stone-100"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-stone-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-orange-600 text-white hover:bg-orange-700"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Line subtotal */}
                        <div className="w-16 text-left font-black text-xs sm:text-sm text-stone-900">
                          {itemPrice * item.quantity} ج.م
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(itemKey)}
                          className="text-stone-300 hover:text-red-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {cart.length > 0 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Section 2: Delivery Type Selector */}
              <div>
                <label className="block text-xs font-black text-stone-800 mb-2">
                  طريقة استلام الطلب:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('delivery')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs sm:text-sm font-bold transition cursor-pointer ${
                      deliveryType === 'delivery'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Truck className="w-4 h-4 text-orange-600" />
                    <span>توصيل للمنزل (دليفري)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('pickup')}
                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border text-xs sm:text-sm font-bold transition cursor-pointer ${
                      deliveryType === 'pickup'
                        ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20'
                        : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <Store className="w-4 h-4 text-orange-600" />
                    <span>استلام من الفرع</span>
                  </button>
                </div>

                {deliveryType === 'pickup' && (
                  <div className="mt-2.5 p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                      <span>عنوان ومقر المحل للاستلام:</span>
                    </div>
                    <p className="text-[11px] text-stone-700 pr-5 font-semibold">
                      ٧ز مدينة الفردوس استثماري شارع أنس ابن مالك أمام صيدلية محمد شمس -حدائق أكتوبر محافظة الجيزة-
                    </p>
                  </div>
                )}
              </div>

              {/* Section 3: Customer Details */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3">
                <h3 className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-orange-600" />
                  <span>بيانات العميل وعنوان التوصيل</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      الاسم بالكامل *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثلاً: محمد أحمد"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 focus:border-orange-500 rounded-xl text-xs sm:text-sm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      رقم الهاتف الأساسي (الواتساب) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="01012345678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 focus:border-orange-500 rounded-xl text-xs sm:text-sm outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      رقم هاتف بديل (اختياري)
                    </label>
                    <input
                      type="tel"
                      placeholder="رقم إضافي للتأكيد"
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-stone-200 focus:border-orange-500 rounded-xl text-xs sm:text-sm outline-none"
                    />
                  </div>

                  {deliveryType === 'delivery' && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] font-bold text-stone-600">
                          الحي / المنطقة داخل 6 أكتوبر *
                        </label>
                        <span className="text-[10px] text-orange-700 font-bold bg-orange-100/70 px-1.5 py-0.5 rounded">
                          داخل 6 أكتوبر فقط حالياً
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="مثلاً: الحي المتميز، الحي الأول، غرب سوميد، حدائق أكتوبر..."
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 focus:border-orange-500 rounded-xl text-xs sm:text-sm outline-none"
                      />
                    </div>
                  )}
                </div>

                {deliveryType === 'delivery' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          اسم الشارع *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="شارع النصر، متفرع من..."
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-stone-200 focus:border-orange-500 rounded-xl text-xs sm:text-sm outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          العمارة / الدور / الشقة
                        </label>
                        <div className="grid grid-cols-2 gap-1.5">
                          <input
                            type="text"
                            placeholder="عمارة"
                            value={building}
                            onChange={(e) => setBuilding(e.target.value)}
                            className="px-2 py-2 bg-white border border-stone-200 focus:border-orange-500 rounded-xl text-xs outline-none text-center"
                          />
                          <input
                            type="text"
                            placeholder="شقة"
                            value={apartment}
                            onChange={(e) => setApartment(e.target.value)}
                            className="px-2 py-2 bg-white border border-stone-200 focus:border-orange-500 rounded-xl text-xs outline-none text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1">
                        علامة مميزة أو إرشادات للمندوب (اختياري)
                      </label>
                      <input
                        type="text"
                        placeholder="بجوار صيدلية... / أمام مسجد..."
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-200 focus:border-orange-500 rounded-xl text-xs sm:text-sm outline-none"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-stone-600 mb-1">
                    ملاحظات عامة على الطلب (اختياري)
                  </label>
                  <input
                    type="text"
                    placeholder="مواعيد التوصيل المفضلة، أو أي توجيهات أخرى..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-200 focus:border-orange-500 rounded-xl text-xs sm:text-sm outline-none"
                  />
                </div>
              </div>

              {/* Section 4: Payment Methods (Cash, InstaPay, Mobile Wallet) */}
              <div className="space-y-3">
                <label className="block text-xs font-black text-stone-800">
                  اختر طريقة الدفع المفضلة:
                </label>
                
                <div className="space-y-2.5">
                  {/* Option 1: Cash on Delivery */}
                  <div
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/20'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${paymentMethod === 'cod' ? 'bg-orange-500 text-white' : 'bg-stone-100 text-stone-600'}`}>
                          <Banknote className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-stone-900">
                            الدفع عند الاستلام (كاش)
                          </div>
                          <div className="text-[11px] text-stone-500">
                            ادفع نقداً لمندوب التوصيل عند استلام وجباتك المجمدة
                          </div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'cod' ? 'border-orange-600 bg-orange-600' : 'border-stone-300'
                      }`}>
                        {paymentMethod === 'cod' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>

                  {/* Option 2: InstaPay */}
                  <div
                    onClick={() => setPaymentMethod('instapay')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === 'instapay'
                        ? 'border-purple-500 bg-purple-50/70 ring-2 ring-purple-500/20'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${paymentMethod === 'instapay' ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                          <Zap className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-stone-900 flex items-center gap-2">
                            <span>تحويل إنستاباي (InstaPay)</span>
                            <span className="bg-purple-100 text-purple-700 text-[10px] px-2 py-0.5 rounded-md font-bold">
                              سريع وآمن ⚡
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-500">
                            التحويل المباشر من تطبيق إنستاباي لحساب المتجر
                          </div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'instapay' ? 'border-purple-600 bg-purple-600' : 'border-stone-300'
                      }`}>
                        {paymentMethod === 'instapay' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* InstaPay Account Details when selected */}
                    {paymentMethod === 'instapay' && (
                      <div className="mt-3 pt-3 border-t border-purple-200/70 bg-white p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-stone-400 block">عنوان الدفع / المعرف (IPA):</span>
                          <span className="font-mono font-bold text-xs sm:text-sm text-purple-900 dir-ltr select-all">
                            {settings.instapayHandle}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(settings.instapayHandle, 'instapay');
                          }}
                          className="flex items-center justify-center gap-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          {copiedInstapay ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-green-700">تم النسخ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ العنوان</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Option 3: Mobile Wallet (Vodafone / Orange / Etisalat Cash) */}
                  <div
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === 'wallet'
                        ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/20'
                        : 'border-stone-200 bg-white hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${paymentMethod === 'wallet' ? 'bg-rose-600 text-white' : 'bg-stone-100 text-stone-600'}`}>
                          <Smartphone className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-stone-900">
                            محفظة إلكترونية كاش
                          </div>
                          <div className="text-[11px] text-stone-500">
                            فودافون كاش، أورنج كاش، اتصالات كاش، وي باي
                          </div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        paymentMethod === 'wallet' ? 'border-rose-600 bg-rose-600' : 'border-stone-300'
                      }`}>
                        {paymentMethod === 'wallet' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    {/* Wallet Number details when selected */}
                    {paymentMethod === 'wallet' && (
                      <div className="mt-3 pt-3 border-t border-rose-200/70 bg-white p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-stone-400 block">رقم المحفظة للتحويل:</span>
                          <span className="font-mono font-bold text-xs sm:text-sm text-rose-900 dir-ltr select-all">
                            {settings.walletNumber}
                          </span>
                          <span className="text-[10px] text-stone-500 block">({settings.walletType})</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(settings.walletNumber, 'wallet');
                          }}
                          className="flex items-center justify-center gap-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                        >
                          {copiedWallet ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-green-700">تم النسخ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>نسخ رقم المحفظة</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {(paymentMethod === 'instapay' || paymentMethod === 'wallet') && (
                  <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      تنبيه: سيتم إرسال تفاصيل تحويلك في رسالة الواتساب، يرجى إرفاق صورة إيصال التحويل في الشات لتجهيز الطلب مباشرة.
                    </span>
                  </p>
                )}
              </div>

              {/* Section 5: Order Breakdown & Calculation */}
              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-stone-600">
                  <span>المجموع الفرعي للمنتجات:</span>
                  <span className="font-bold text-stone-900">{subtotal} ج.م</span>
                </div>

                <div className="flex justify-between text-stone-600">
                  <span>خدمة التوصيل (داخل 6 أكتوبر):</span>
                  <span className="font-bold text-stone-900">
                    {deliveryType === 'pickup' ? (
                      <span className="text-stone-500">استلام من الفرع (0 ج.م)</span>
                    ) : (
                      <span>{currentDeliveryFee} ج.م</span>
                    )}
                  </span>
                </div>

                <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline text-base sm:text-lg font-black text-stone-900">
                  <span>المبلغ الإجمالي للدفع:</span>
                  <div className="text-orange-600 font-black">
                    {finalTotal} <span className="text-xs font-bold text-stone-500">ج.م</span>
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black text-base py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-98 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>تأكيد وإرسال الطلب عبر واتساب</span>
              </button>
            </form>
          )}

        </div>

      </div>

    </div>
  );
};
