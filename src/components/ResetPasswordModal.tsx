import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff, ArrowRight } from 'lucide-react';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  // Strictly check if there is an active session from Supabase
  useEffect(() => {
    if (!isOpen || !supabase || !isSupabaseConfigured) return;

    const hash = window.location.hash;
    if (hash.includes('error=')) {
      setIsValidSession(false);
      const params = new URLSearchParams(hash.replace('#', '?'));
      setErrorMessage(params.get('error_description') || 'رابط استعادة كلمة المرور غير صالح أو منتهي الصلاحية.');
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsValidSession(true);
      } else {
        setIsValidSession(false);
        setErrorMessage('لم يتم العثور على جلسة استعادة صالحة أو انتهت مدة صلاحية الرابط.');
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password.length < 6) {
      setErrorMessage('يجب أن لا تقل كلمة المرور عن 6 أحرف أو أرقام.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('كلمة المرور وتأكيدها غير متطابقين.');
      return;
    }

    if (!supabase || !isSupabaseConfigured) {
      setErrorMessage('خدمة Supabase غير متصلة.');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password.trim()
      });

      if (error) {
        setErrorMessage(error.message || 'حدث خطأ أثناء تحديث كلمة المرور. قد يكون الرابط منتهي الصلاحية.');
      } else {
        setSuccessMessage('تم تحديث كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بها.');
        // Clean hash from URL
        if (window.location.hash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
        setTimeout(() => {
          onSuccess();
        }, 2200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'حدث خطأ غير متوقع أثناء الحفظ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-orange-100 flex flex-col p-6 text-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-md">
            <Lock className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-stone-900">إعادة تعيين كلمة المرور</h2>
            <p className="text-xs text-stone-500 mt-1">
              أدخل كلمة المرور الجديدة لحساب إدارة متجر Gedo Frozen
            </p>
          </div>
        </div>

        {isValidSession === false ? (
          <div className="mt-6 space-y-4 text-center">
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-xs sm:text-sm text-red-700 font-bold flex items-center gap-2 justify-center">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{errorMessage || 'رابط الاستعادة منتهي الصلاحية أو غير صالح.'}</span>
            </div>
            <p className="text-xs text-stone-500">
              يرجى طلب رابط استعادة جديد من شاشة تسجيل الدخول.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              العودة للمتجر
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                كلمة المرور الجديدة *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={loading || !!successMessage}
                  placeholder="لا تقل عن 6 أحرف"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  className="w-full text-xs sm:text-sm py-2.5 pl-10 pr-3 bg-stone-50 border border-stone-300 rounded-xl focus:border-orange-500 focus:bg-white outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                تأكيد كلمة المرور الجديدة *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                disabled={loading || !!successMessage}
                placeholder="أعد كتابة كلمة المرور"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                dir="ltr"
                className="w-full text-xs sm:text-sm py-2.5 px-3 bg-stone-50 border border-stone-300 rounded-xl focus:border-orange-500 focus:bg-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !!successMessage}
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {loading ? (
                <span>جاري حفظ كلمة المرور...</span>
              ) : (
                <span>حفظ كلمة المرور الجديدة والدخول</span>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full py-2 text-center text-xs text-stone-400 hover:text-stone-600 cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>إلغاء والعودة للمتجر</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
