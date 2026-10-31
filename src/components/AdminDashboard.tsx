import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, StoreSettings, WeightOption } from '../types';
import * as XLSX from 'xlsx';
import { 
  X, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  FileSpreadsheet, 
  Settings, 
  Package, 
  Check, 
  AlertCircle, 
  Image as ImageIcon, 
  Layers, 
  RotateCcw,
  Download,
  Lock,
  Eye,
  CheckCircle,
  HelpCircle,
  FileText,
  MessageSquare,
  CreditCard,
  Scale,
  Sparkles,
  Filter,
  Search
} from 'lucide-react';

const PRESET_FROZEN_IMAGES = [
  { label: 'برجر بقري', url: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80' },
  { label: 'ستريبس / بانيه دجاج', url: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80' },
  { label: 'سمبوسة ومقبلات', url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80' },
  { label: 'كفتة مشوية / لحم', url: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80' },
  { label: 'جمبري وسي فود', url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80' },
  { label: 'بطاطس مقلية', url: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80' },
  { label: 'فراولة وخضروات', url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80' },
  { label: 'حواوشي بلدي', url: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80' },
  { label: 'كريم شانتيه / تزيين', url: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80' },
  { label: 'شيكولاتة وكاكاو', url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=80' },
  { label: 'مخبوزات وميلفيه', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' }
];

export const AdminDashboard: React.FC = () => {
  const { 
    isAdminDashboardOpen, 
    closeAdminDashboard, 
    products, 
    categories, 
    settings, 
    updateSettings, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    addCategory,
    updateCategory,
    deleteCategory,
    importBulkProducts, 
    resetToDefaults,
    isAdminLoggedIn,
    loginAdminWithSupabase,
    logoutAdmin,
    adminEmail,
    isUsingSupabase
  } = useStore();

  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'products' | 'excel' | 'settings' | 'categories'>('products');

  // Category inline edit state
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState<string>('');

  // Product modal state (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<Omit<Product, 'id'>>({
    name: '',
    category: categories[1]?.id || 'poultry',
    description: '',
    price: 150,
    originalPrice: undefined,
    weight: '1 كجم',
    cookingMethod: 'قلاية هوائية أو زيت ساخن',
    cookingTime: '10 دقائق',
    image: PRESET_FROZEN_IMAGES[0].url,
    badge: '',
    inStock: true,
    storageTip: 'يحفظ مجمداً عند -18° مئوية'
  });

  // Settings form
  const [settingsForm, setSettingsForm] = useState<StoreSettings>(settings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Excel / CSV Import state
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<Omit<Product, 'id'>[]>([]);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [importStatus, setImportStatus] = useState<string>('');

  // Category input
  const [newCategoryName, setNewCategoryName] = useState('');

  // Bulk actions state
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkTargetCategory, setBulkTargetCategory] = useState<string>('');
  const [adminProductSearch, setAdminProductSearch] = useState<string>('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState<string>('all');

  if (!isAdminDashboardOpen) return null;

  const handleToggleSelectAll = (itemsToToggle: Product[]) => {
    const itemIds = itemsToToggle.map(p => p.id);
    const allSelected = itemIds.every(id => selectedProductIds.includes(id));
    if (allSelected) {
      setSelectedProductIds(prev => prev.filter(id => !itemIds.includes(id)));
    } else {
      setSelectedProductIds(prev => Array.from(new Set([...prev, ...itemIds])));
    }
  };

  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleApplyBulkCategory = () => {
    if (!bulkTargetCategory || selectedProductIds.length === 0) return;
    selectedProductIds.forEach(id => {
      updateProduct(id, { category: bulkTargetCategory });
    });
    alert(`تم بنجاح نقل (${selectedProductIds.length}) منتج إلى قسم "${categories.find(c => c.id === bulkTargetCategory)?.name}"!`);
    setSelectedProductIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedProductIds.length === 0) return;
    if (confirm(`هل أنت متأكد من حذف (${selectedProductIds.length}) منتج دفعة واحدة؟`)) {
      selectedProductIds.forEach(id => deleteProduct(id));
      setSelectedProductIds([]);
    }
  };

  const handleSmartAutoCategorize = () => {
    const rules = [
      {
        catId: 'dessert-supplies',
        catName: 'مستلزمات الحلويات',
        keywords: ['كريم', 'شانتيه', 'كاكاو', 'شيكولاتة', 'شوكولاتة', 'فانيليا', 'بيكنج', 'خميرة', 'دقيق', 'سكر', 'باف باستري', 'ميلفيه', 'جيلي', 'تورتة', 'كنافة', 'بسبوسة', 'جلاش', 'عجينة', 'محسن', 'زبدة', 'كريمة', 'شيبس', 'بستري', 'لوتس', 'نوتيلا', 'فستق', 'مكسرات', 'كراميل', 'كريمة خفق', 'شوكولاته']
      },
      {
        catId: 'poultry',
        catName: 'دواجن وبانيه ومقرمشات',
        keywords: ['بانيه', 'دجاج', 'فراخ', 'ستريبس', 'زنجر', 'ناجتس', 'شيش', 'كوردون', 'كرسبي', 'شاورما دجاج', 'اجنحة', 'أجنحة', 'وراك', 'صدور', 'بط', 'رومي', 'تشيكن']
      },
      {
        catId: 'meat',
        catName: 'لحوم وبرجر ومفرومات',
        keywords: ['برجر', 'كفتة', 'لحم', 'لحمة', 'كبدة', 'سجق', 'مفروم', 'حواوشي', 'بفتيك', 'استيك', 'عرق', 'شاورما لحم', 'موزة', 'سجق شرقي', 'سوسيس', 'هوت دوج', 'بيف']
      },
      {
        catId: 'pastry',
        catName: 'سمبوسك ومقبلات ومعجنات',
        keywords: ['سمبوسك', 'سمبوسة', 'كبيبة', 'كبة', 'رول', 'سبرينج', 'بوريك', 'بيتزا', 'فطير', 'منقوشة', 'كريب', 'سبرنج رول']
      },
      {
        catId: 'seafood',
        catName: 'مأكولات بحرية وأسماك',
        keywords: ['جمبري', 'سمك', 'سي فود', 'سيفود', 'كاليماري', 'فيليه', 'كابوريا', 'سبيط', 'شوربة سيفود', 'سلمون', 'تونة', 'بلطي']
      },
      {
        catId: 'veggies',
        catName: 'خضروات وفواكه مجمدة',
        keywords: ['بطاطس', 'ملوخية', 'بامية', 'بسلة', 'خضار', 'فراولة', 'مانجو', 'ذرة', 'سبانخ', 'قلقاس', 'جزر', 'فاصوليا', 'بصل', 'بروكلي', 'خرشوف', 'ورق عنب']
      }
    ];

    // Ensure all target categories exist
    rules.forEach(rule => {
      if (!categories.some(c => c.id === rule.catId || c.name === rule.catName)) {
        addCategory(rule.catName);
      }
    });

    let categorizedCount = 0;
    products.forEach(prod => {
      const nameLower = prod.name.toLowerCase();
      for (const rule of rules) {
        if (rule.keywords.some(kw => nameLower.includes(kw))) {
          const existingCat = categories.find(c => c.id === rule.catId || c.name === rule.catName);
          const targetId = existingCat ? existingCat.id : rule.catId;
          updateProduct(prod.id, { category: targetId });
          categorizedCount++;
          break;
        }
      }
    });

    alert(`⚡ تم بنجاح تصنيف (${categorizedCount}) منتج وتوزيعهم على الأقسام المناسبة وفق أسمائهم!`);
  };

  // Login handler with Supabase email & password + admin_users verification
  const handleSupabaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthErrorMessage('');

    const res = await loginAdminWithSupabase(authEmail, authPassword);
    setAuthLoading(false);

    if (res.success) {
      setAuthErrorMessage('');
      setAuthPassword('');
    } else {
      setAuthErrorMessage(res.error || 'فشل تسجيل الدخول، يرجى التأكد من البريد وكلمة المرور.');
    }
  };

  // Open product editor
  const handleOpenAddProduct = () => {
    setEditingProductId(null);
    setProductForm({
      name: '',
      category: categories[1]?.id || 'poultry',
      description: '',
      price: 150,
      originalPrice: undefined,
      weight: '1 كجم',
      weightOptions: undefined,
      cookingMethod: 'قلاية هوائية أو زيت ساخن',
      cookingTime: '8-10 دقائق',
      image: PRESET_FROZEN_IMAGES[0].url,
      badge: '',
      inStock: true,
      storageTip: 'يحفظ مجمداً عند -18° مئوية'
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setProductForm({
      name: prod.name,
      category: prod.category,
      description: prod.description || '',
      price: prod.price,
      originalPrice: prod.originalPrice,
      weight: prod.weight || '',
      weightOptions: prod.weightOptions ? [...prod.weightOptions] : undefined,
      cookingMethod: prod.cookingMethod || '',
      cookingTime: prod.cookingTime || '',
      image: prod.image,
      badge: prod.badge || '',
      inStock: prod.inStock,
      storageTip: prod.storageTip || ''
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) return;

    if (editingProductId) {
      updateProduct(editingProductId, productForm);
    } else {
      addProduct(productForm);
    }
    setIsProductModalOpen(false);
  };

  // Handle image upload from computer (Base64)
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setProductForm(prev => ({ ...prev, image: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Parse Excel file (.xlsx, .xls, .csv)
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    setImportStatus('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet);

        parseRowsToProducts(jsonRows);
      } catch (err) {
        setImportStatus('تعذر قراءة ملف الإكسيل. تأكد من سلامة الملف أو جرب نسخ ولصق النصوص.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Parse pasted table text (from Excel copy-paste)
  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    try {
      const lines = pastedText.trim().split('\n');
      if (lines.length === 0) return;

      const delimiter = lines[0].includes('\t') ? '\t' : ',';
      const headers = lines[0].split(delimiter).map(h => h.trim().toLowerCase());
      
      const rows: Record<string, any>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(delimiter).map(v => v.trim());
        if (values.length <= 1 && !values[0]) continue;
        const rowObj: Record<string, any> = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] || '';
        });
        rows.push(rowObj);
      }

      parseRowsToProducts(rows);
    } catch {
      setImportStatus('حدث خطأ أثناء قراءة النص المنسوخ');
    }
  };

  // Helper mapper for Excel rows
  const parseRowsToProducts = (rows: Record<string, any>[]) => {
    if (!rows || rows.length === 0) {
      setImportStatus('الملف فارغ أو لا يحتوي على صفوف بيانات');
      return;
    }

    const detected: Omit<Product, 'id'>[] = [];

    rows.forEach((row, i) => {
      // Find columns by matching Arabic & English key patterns
      const findVal = (patterns: string[]): any => {
        for (const key of Object.keys(row)) {
          const lowerKey = key.trim().toLowerCase();
          if (patterns.some(p => lowerKey.includes(p))) {
            return row[key];
          }
        }
        return undefined;
      };

      const name = findVal(['name', 'اسم', 'صنف', 'منتج', 'title']) || `منتج رقم ${i + 1}`;
      const priceVal = findVal(['price', 'سعر', 'السعر', 'ثمن']);
      const price = Number(priceVal) || 100;
      const originalPriceVal = findVal(['original', 'قبل الخصم', 'القديم', 'old']);
      const originalPrice = originalPriceVal ? Number(originalPriceVal) : undefined;
      const category = findVal(['category', 'قسم', 'تصنيف', 'نوع']) || 'poultry';
      const weight = findVal(['weight', 'وزن', 'حجم', 'عبوة', 'size']) || '1 كجم';
      const description = findVal(['desc', 'وصف', 'تفاصيل', 'info']) || '';
      const cookingMethod = findVal(['cooking', 'طهي', 'تسوية', 'طريقة']) || 'قلاية هوائية أو زيت ساخن';
      const image = findVal(['image', 'صورة', 'لينك', 'url', 'img']) || PRESET_FROZEN_IMAGES[i % PRESET_FROZEN_IMAGES.length].url;
      const badge = findVal(['badge', 'شارة', 'عرض', 'مميز']) || '';

      detected.push({
        name: String(name).trim(),
        price,
        originalPrice,
        category: String(category).trim(),
        weight: String(weight).trim(),
        description: String(description).trim(),
        cookingMethod: String(cookingMethod).trim(),
        cookingTime: '8-10 دقائق',
        image: String(image).trim(),
        badge: badge ? String(badge).trim() : undefined,
        inStock: true,
        storageTip: 'يحفظ مجمداً عند -18° مئوية'
      });
    });

    setParsedPreview(detected);
    setImportStatus(`تم العثور على (${detected.length}) منتج جاهز للاستيراد.`);
  };

  // Confirm Bulk Import
  const handleExecuteImport = () => {
    if (parsedPreview.length === 0) return;
    importBulkProducts(parsedPreview, importMode === 'replace');
    setImportStatus(`🎉 تم استيراد (${parsedPreview.length}) منتج بنجاح في المتجر!`);
    setParsedPreview([]);
    setExcelFile(null);
    setPastedText('');
    setTimeout(() => setActiveTab('products'), 1500);
  };

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        'اسم المنتج': 'برجر بقري جامبو متبل',
        'السعر': 260,
        'السعر قبل الخصم': 290,
        'القسم': 'لحوم وبرجر وكفتة',
        'الوزن أو العبوة': '1 كجم (8 قطع)',
        'الوصف': 'لحم بلدي فاخر متبل جاهز للشوي السريع',
        'طريقة الطهي': 'شواية جريل أو طاسة 8 دقائق',
        'شارة': 'الأكثر طلباً',
        'رابط الصورة': 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80'
      },
      {
        'اسم المنتج': 'سمبوسة جبنة ومشروم',
        'السعر': 120,
        'السعر قبل الخصم': 140,
        'القسم': 'سمبوسك ومقبلات',
        'الوزن أو العبوة': 'علبة 12 قطعة',
        'الوصف': 'عجينة مقرمشة خفيفة محشوة ميكس أجبان فاخرة',
        'طريقة الطهي': 'قلي في زيت ساخن 4 دقائق',
        'شارة': 'مقرمش ولذيذ',
        'رابط الصورة': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'قالب منتجات جدو فروزن');
    XLSX.writeFile(workbook, 'قالب_منتجات_Gedo_Frozen.xlsx');
  };

  // Full Store Backup (Products + Categories + Settings)
  const handleDownloadFullBackup = () => {
    const backupData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      products,
      categories,
      settings
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `نسخة_احتياطية_كاملة_Gedo_Frozen_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Restore Store Backup
  const handleRestoreFullBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.products && Array.isArray(parsed.products)) {
          localStorage.setItem('gedo_frozen_products', JSON.stringify(parsed.products));
        }
        if (parsed.categories && Array.isArray(parsed.categories)) {
          localStorage.setItem('gedo_frozen_categories', JSON.stringify(parsed.categories));
        }
        if (parsed.settings) {
          localStorage.setItem('gedo_frozen_settings', JSON.stringify(parsed.settings));
        }
        alert('🎉 تم استعادة نسختك الاحتياطية بنجاح! سيتم تحديث الصفحة الآن لعرض كافة بياناتك.');
        window.location.reload();
      } catch (err) {
        alert('عذراً، حدث خطأ أثناء قراءة ملف النسخة الاحتياطية. يرجى التأكد من اختيار الملف الصحيح.');
      }
    };
    reader.readAsText(file);
  };

  // Export current catalog to Excel
  const handleExportCurrentToExcel = () => {
    const data = products.map(p => ({
      'اسم المنتج': p.name,
      'السعر': p.price,
      'السعر قبل الخصم': p.originalPrice || '',
      'القسم': categories.find(c => c.id === p.category)?.name || p.category,
      'الوزن أو العبوة': p.weight || '',
      'الوصف': p.description || '',
      'شارة': p.badge || '',
      'متوفر': p.inStock ? 'نعم' : 'لا',
      'رابط الصورة': p.image
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'المنتجات');
    XLSX.writeFile(wb, 'منتجات_Gedo_Frozen_الحالية.xlsx');
  };

  // Save Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 2500);
  };

  // Add Category
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory(newCategoryName.trim());
    setNewCategoryName('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      
      {/* Container */}
      <div 
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-orange-200 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 text-white p-2 rounded-xl">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                <span>لوحة إدارة متجر Gedo Frozen</span>
                <span className="text-xs bg-orange-600/60 text-orange-200 font-bold px-2 py-0.5 rounded-full">
                  صاحب المتجر
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                إضافة وتعديل المنتجات، رفع ملفات الإكسيل، وإعدادات الواتساب وطرق الدفع
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <div className="flex items-center gap-2">
                {adminEmail && (
                  <span className="text-[11px] text-stone-300 bg-stone-800 px-2.5 py-1 rounded-lg border border-stone-700 hidden sm:inline-block" dir="ltr">
                    {adminEmail}
                  </span>
                )}
                <button
                  onClick={logoutAdmin}
                  className="text-xs bg-stone-800 hover:bg-stone-700 text-stone-300 px-3 py-1.5 rounded-lg transition cursor-pointer"
                >
                  تسجيل خروج
                </button>
              </div>
            )}
            <button
              onClick={closeAdminDashboard}
              className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Auth Screen if not logged in */}
        {!isAdminLoggedIn ? (
          <div className="p-8 text-center max-w-sm mx-auto my-auto space-y-4">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-lg font-black text-stone-900">تسجيل دخول صاحب المتجر</h3>
              <p className="text-xs text-stone-500 mt-1">
                الدخول محمي بالكامل عبر حساب المدير المسجل في Supabase
              </p>
            </div>

            {/* Supabase Email/Password Form Only */}
            <form onSubmit={handleSupabaseLogin} className="space-y-3 text-right">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">البريد الإلكتروني للإدارة</label>
                <input
                  type="email"
                  required
                  placeholder="admin@gedofrozen.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  dir="ltr"
                  className="w-full text-xs sm:text-sm py-2.5 px-3 bg-stone-50 border border-stone-300 rounded-xl focus:border-orange-500 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  dir="ltr"
                  className="w-full text-xs sm:text-sm py-2.5 px-3 bg-stone-50 border border-stone-300 rounded-xl focus:border-orange-500 focus:bg-white outline-none"
                />
              </div>

              {authErrorMessage && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl font-bold text-center">
                  {authErrorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                {authLoading ? (
                  <span>جاري التحقق من الصلاحيات...</span>
                ) : (
                  <span>دخول لوحة التحكم</span>
                )}
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 bg-stone-100 p-2 border-b border-stone-200 overflow-x-auto text-xs sm:text-sm font-bold">
              <button
                onClick={() => setActiveTab('products')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                  activeTab === 'products'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Package className="w-4 h-4" />
                <span>المنتجات ({products.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('excel')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                  activeTab === 'excel'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>استيراد ملف إكسيل / نصوص</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full">
                  جديد
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                  activeTab === 'settings'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>إعدادات الواتساب وطرق الدفع</span>
              </button>

              <button
                onClick={() => setActiveTab('categories')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                  activeTab === 'categories'
                    ? 'bg-white text-orange-600 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>الأقسام ({categories.length})</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              
              {/* TAB 1: PRODUCTS MANAGEMENT */}
              {activeTab === 'products' && (
                <div className="space-y-4">
                  {/* Top actions */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-black text-stone-900">
                        قائمة منتجات المتجر ({products.length} منتج)
                      </h3>
                      <p className="text-xs text-stone-500">
                        يمكنك فرز وتصنيف المنتجات بسهولة، نقلها جماعياً لأقسامها، أو تعديل أسعارها وصورها.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleDownloadFullBackup}
                        className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition cursor-pointer"
                        title="تحميل نسخة احتياطية كاملة من كل المنتجات والأقسام والأسعار"
                      >
                        <Download className="w-3.5 h-3.5 text-emerald-100" />
                        <span>حفظ نسخة احتياطية كاملة (Backup) 💾</span>
                      </button>

                      <label
                        className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-3 py-2 rounded-xl border border-stone-300 transition cursor-pointer"
                        title="استرجاع نسخة محفوظة مسبقاً في أي وقت أو على أي جهاز آخر"
                      >
                        <Upload className="w-3.5 h-3.5 text-stone-600" />
                        <span>استرجاع نسخة (Restore)</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleRestoreFullBackup}
                          className="hidden"
                        />
                      </label>

                      <button
                        onClick={handleExportCurrentToExcel}
                        className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold px-3 py-2 rounded-xl border border-stone-300 transition cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تصدير إكسيل</span>
                      </button>

                      <button
                        onClick={handleOpenAddProduct}
                        className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة منتج جديد</span>
                      </button>
                    </div>
                  </div>

                  {/* Smart Auto-Categorizer Banner */}
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 p-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-orange-500 text-white shadow-xs">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-black text-xs sm:text-sm text-stone-900">
                          التصنيف الذكي التلقائي لجميع المنتجات ⚡
                        </h4>
                        <p className="text-[11px] text-stone-600">
                          بضغطة واحدة: يفحص السيستم أسماء جميع المنتجات ويوزعها تلقائياً على أقسامها (حلويات، لحوم، دواجن، مقبلات، سيفود، خضروات) دون أي عناء يدوي!
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSmartAutoCategorize}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      <span>بدء التصنيف التلقائي الآن ⚡</span>
                    </button>
                  </div>

                  {/* Search and Category Filter Bar */}
                  <div className="flex flex-wrap items-center gap-2 bg-stone-50 p-2.5 rounded-2xl border border-stone-200">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="ابحث عن اسم منتج لتحديده أو تعديله جماعياً (مثلاً: شوكولاتة، برجر، دجاج)..."
                        value={adminProductSearch}
                        onChange={(e) => setAdminProductSearch(e.target.value)}
                        className="w-full pr-9 pl-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Filter className="w-4 h-4 text-stone-500" />
                      <select
                        value={adminCategoryFilter}
                        onChange={(e) => setAdminCategoryFilter(e.target.value)}
                        className="bg-white border border-stone-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-700 outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="all">عرض جميع الأقسام ({products.length})</option>
                        {categories.filter(c => c.id !== 'all').map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} ({products.filter(p => p.category === c.id).length})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Bulk Actions Banner */}
                  {selectedProductIds.length > 0 && (
                    <div className="bg-orange-600 text-white p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in duration-150">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-white text-orange-600 font-black text-xs flex items-center justify-center">
                          {selectedProductIds.length}
                        </span>
                        <span className="text-xs font-bold">تم تحديد {selectedProductIds.length} منتج للتحكم الجماعي</span>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={bulkTargetCategory}
                          onChange={(e) => setBulkTargetCategory(e.target.value)}
                          className="bg-white text-stone-900 text-xs font-bold px-3 py-1.5 rounded-xl outline-none"
                        >
                          <option value="">-- اختر القسم لنقل المنتجات إليه --</option>
                          {categories.filter(c => c.id !== 'all').map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={handleApplyBulkCategory}
                          disabled={!bulkTargetCategory}
                          className="bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          نقل جماعي
                        </button>

                        <button
                          type="button"
                          onClick={handleBulkDelete}
                          className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer"
                        >
                          حذف جماعي
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedProductIds([])}
                          className="text-orange-200 hover:text-white text-xs underline px-2 cursor-pointer"
                        >
                          إلغاء التحديد
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Products Table */}
                  <div className="border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold">
                          <tr>
                            <th className="p-3 w-8 text-center">
                              <input
                                type="checkbox"
                                checked={
                                  products.filter(p => {
                                    const matchS = !adminProductSearch.trim() || p.name.toLowerCase().includes(adminProductSearch.toLowerCase());
                                    const matchC = adminCategoryFilter === 'all' || p.category === adminCategoryFilter;
                                    return matchS && matchC;
                                  }).length > 0 &&
                                  products.filter(p => {
                                    const matchS = !adminProductSearch.trim() || p.name.toLowerCase().includes(adminProductSearch.toLowerCase());
                                    const matchC = adminCategoryFilter === 'all' || p.category === adminCategoryFilter;
                                    return matchS && matchC;
                                  }).every(p => selectedProductIds.includes(p.id))
                                }
                                onChange={() => {
                                  const filtered = products.filter(p => {
                                    const matchS = !adminProductSearch.trim() || p.name.toLowerCase().includes(adminProductSearch.toLowerCase());
                                    const matchC = adminCategoryFilter === 'all' || p.category === adminCategoryFilter;
                                    return matchS && matchC;
                                  });
                                  handleToggleSelectAll(filtered);
                                }}
                                className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                                title="تحديد الظاهرين"
                              />
                            </th>
                            <th className="p-3">المنتج</th>
                            <th className="p-3">القسم (تغيير مباشر)</th>
                            <th className="p-3">السعر</th>
                            <th className="p-3">الوزن / الحجم</th>
                            <th className="p-3">الحالة</th>
                            <th className="p-3 text-center">إجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-stone-100">
                          {products
                            .filter(p => {
                              const matchS = !adminProductSearch.trim() || p.name.toLowerCase().includes(adminProductSearch.toLowerCase());
                              const matchC = adminCategoryFilter === 'all' || p.category === adminCategoryFilter;
                              return matchS && matchC;
                            })
                            .map((prod) => (
                            <tr 
                              key={prod.id} 
                              className={`transition ${
                                selectedProductIds.includes(prod.id) ? 'bg-orange-50/60' : 'hover:bg-stone-50/70'
                              }`}
                            >
                              <td className="p-3 w-8 text-center">
                                <input
                                  type="checkbox"
                                  checked={selectedProductIds.includes(prod.id)}
                                  onChange={() => handleToggleSelectProduct(prod.id)}
                                  className="w-4 h-4 accent-orange-600 rounded cursor-pointer"
                                />
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={prod.image}
                                    alt={prod.name}
                                    className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-stone-900">{prod.name}</div>
                                    {prod.badge && (
                                      <span className="text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.2 rounded font-semibold">
                                        {prod.badge}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="p-3">
                                <select
                                  value={prod.category}
                                  onChange={(e) => updateProduct(prod.id, { category: e.target.value })}
                                  className="bg-stone-50 hover:bg-white focus:bg-white border border-stone-200 focus:border-orange-500 rounded-lg px-2 py-1 text-xs font-bold text-stone-700 outline-none cursor-pointer transition max-w-[150px] truncate"
                                  title="تغيير القسم مباشرة بنقرة واحدة"
                                >
                                  {categories.filter(c => c.id !== 'all').map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-3">
                                <div className="font-black text-stone-900">{prod.price} ج.م</div>
                                {prod.originalPrice && (
                                  <div className="text-[10px] text-stone-400 line-through">
                                    {prod.originalPrice} ج.م
                                  </div>
                                )}
                              </td>
                              <td className="p-3 text-stone-600">{prod.weight || '-'}</td>
                              <td className="p-3">
                                <button
                                  onClick={() => updateProduct(prod.id, { inStock: !prod.inStock })}
                                  className={`text-[10px] font-black px-2 py-0.5 rounded-full cursor-pointer transition ${
                                    prod.inStock
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                                  }`}
                                >
                                  {prod.inStock ? 'متوفر' : 'غير متوفر'}
                                </button>
                              </td>
                              <td className="p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleOpenEditProduct(prod)}
                                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-orange-100 text-stone-600 hover:text-orange-600 transition"
                                    title="تعديل المنتج"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(`هل أنت متأكد من حذف "${prod.name}"؟`)) {
                                        deleteProduct(prod.id);
                                      }
                                    }}
                                    className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-stone-600 hover:text-red-600 transition"
                                    title="حذف المنتج"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: EXCEL & CSV BULK IMPORTER */}
              {activeTab === 'excel' && (
                <div className="space-y-6">
                  {/* Instructions Header */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="text-sm font-black text-emerald-950 flex items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                        <span>استيراد منتجاتك من ملف إكسيل (Excel / CSV) بسهولة</span>
                      </h3>
                      <p className="text-xs text-emerald-800 leading-relaxed max-w-xl">
                        بما أنك واجهت مشكلة في رفع ملف الإكسيل هنا، يمكنك الآن رفعه مباشرة داخل هذا الزر أو فتح الإكسيل على جهازك ونسخ الأعمدة ولصقها في المربع أدناه!
                      </p>
                    </div>

                    <button
                      onClick={handleDownloadTemplate}
                      className="shrink-0 flex items-center gap-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-2 rounded-xl transition shadow-2xs"
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>تحميل قالب إكسيل استرشادي</span>
                    </button>
                  </div>

                  {/* Method 1: Upload File */}
                  <div className="border border-stone-200 rounded-2xl p-4 bg-white space-y-3">
                    <h4 className="text-xs font-black text-stone-900 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-orange-600" />
                      <span>الطريقة الأولى: رفع ملف الإكسيل مباشرة (.xlsx / .xls / .csv)</span>
                    </h4>

                    <div className="border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition bg-stone-50/50">
                      <FileSpreadsheet className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-stone-700">
                        {excelFile ? `الملف المختار: ${excelFile.name}` : 'اضغط لاختيار ملف الإكسيل من جهازك'}
                      </p>
                      <p className="text-[11px] text-stone-400 mt-0.5">
                        يدعم صيغ XLSX, XLS, CSV
                      </p>
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleExcelFileUpload}
                        className="mt-3 text-xs text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Method 2: Paste Rows directly */}
                  <div className="border border-stone-200 rounded-2xl p-4 bg-white space-y-3">
                    <h4 className="text-xs font-black text-stone-900 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-orange-600" />
                      <span>الطريقة الثانية: نسخ ولصق صفوف الإكسيل مباشرة هنا (Copy & Paste)</span>
                    </h4>
                    <p className="text-xs text-stone-500">
                      افتح ملف الإكسيل لديك، حدد الصفوف بالماوس، اضغط (Ctrl+C)، ثم الصقها (Ctrl+V) في المربع التالي:
                    </p>
                    <textarea
                      rows={4}
                      placeholder={`اسم المنتج\tالسعر\tالقسم\tالوزن\nبرجر بقري جامبو\t260\tلحوم وبرجر\t1 كجم\nبانيه دجاج مقرمش\t230\tدواجن\t1 كجم`}
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      className="w-full p-3 font-mono text-xs bg-stone-50 border border-stone-300 rounded-xl focus:border-orange-500 focus:bg-white outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleParsePastedText}
                      disabled={!pastedText.trim()}
                      className="bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                    >
                      معاينة البيانات المنسوخة
                    </button>
                  </div>

                  {/* Status Banner */}
                  {importStatus && (
                    <div className="p-3 bg-stone-100 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>{importStatus}</span>
                    </div>
                  )}

                  {/* Preview Table if products parsed */}
                  {parsedPreview.length > 0 && (
                    <div className="border border-emerald-300 rounded-2xl p-4 bg-emerald-50/30 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-black text-emerald-950">
                            معاينة المنتجات الجاهزة للاستيراد ({parsedPreview.length} صنف)
                          </h4>
                          <p className="text-xs text-stone-500">
                            راجع البيانات قبل إضافتها للمتجر
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="importMode"
                              checked={importMode === 'append'}
                              onChange={() => setImportMode('append')}
                            />
                            <span>إضافة على المنتجات الحالية</span>
                          </label>

                          <label className="text-xs font-bold text-red-700 flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="importMode"
                              checked={importMode === 'replace'}
                              onChange={() => setImportMode('replace')}
                            />
                            <span>استبدال الكل بالجديد</span>
                          </label>
                        </div>
                      </div>

                      {/* Preview table */}
                      <div className="max-h-60 overflow-y-auto border border-stone-200 rounded-xl bg-white">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-stone-100 font-bold sticky top-0 text-stone-700">
                            <tr>
                              <th className="p-2">الاسم</th>
                              <th className="p-2">السعر</th>
                              <th className="p-2">القسم</th>
                              <th className="p-2">الوزن</th>
                              <th className="p-2">طريقة الطهي</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                            {parsedPreview.map((item, idx) => (
                              <tr key={idx}>
                                <td className="p-2 font-bold text-stone-900">{item.name}</td>
                                <td className="p-2 font-mono font-bold text-orange-600">{item.price} ج.م</td>
                                <td className="p-2 text-stone-600">{item.category}</td>
                                <td className="p-2 text-stone-500">{item.weight}</td>
                                <td className="p-2 text-stone-500">{item.cookingMethod}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Confirm Import Button */}
                      <button
                        onClick={handleExecuteImport}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-md transition"
                      >
                        تأكيد وحفظ ({parsedPreview.length}) منتج في المتجر الآن 🚀
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SETTINGS (WHATSAPP & PAYMENTS) */}
              {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-5 max-w-2xl">
                  {settingsSavedMessage && (
                    <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 p-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>تم حفظ الإعدادات بنجاح! تم تحديث رقم الواتساب وحسابات الدفع فوراً.</span>
                    </div>
                  )}

                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
                    <h4 className="text-xs font-black text-stone-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                      <span>بيانات الواتساب والتواصل للطلبات</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          رقم واتساب المتجر (الذي ستصل عليه رسائل الطلبات) *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="مثلاً: 201012345678 أو 01012345678"
                          value={settingsForm.whatsappNumber}
                          onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                        />
                        <span className="text-[10px] text-stone-400 mt-1 block">
                          اكتب الرقم مسبوقاً بكود مصر 20 أو 010/011/012/015
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          هاتف خدمة العملاء / الخط الساخن
                        </label>
                        <input
                          type="text"
                          value={settingsForm.supportPhone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, supportPhone: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
                    <h4 className="text-xs font-black text-stone-900 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-purple-600" />
                      <span>إعدادات الدفع الإلكتروني (إنستاباي والمحافظ)</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          حساب / معرف إنستاباي (InstaPay Handle)
                        </label>
                        <input
                          type="text"
                          placeholder="gedo.frozen@instapay"
                          value={settingsForm.instapayHandle}
                          onChange={(e) => setSettingsForm({ ...settingsForm, instapayHandle: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          رقم المحفظة الإلكترونية (فودافون كاش ومثيلاتها)
                        </label>
                        <input
                          type="text"
                          placeholder="01012345678"
                          value={settingsForm.walletNumber}
                          onChange={(e) => setSettingsForm({ ...settingsForm, walletNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
                    <h4 className="text-xs font-black text-stone-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-orange-600" />
                      <span>إعدادات التوصيل والطلبات</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          رسوم التوصيل المبدئية (تبدأ من ١٠ جنيه وتزيد بحسب المكان)
                        </label>
                        <input
                          type="number"
                          value={settingsForm.deliveryFee}
                          onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFee: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          الحد الأدنى للطلب (ج.م) - ضع 0 لإلغاء الحد الأدنى
                        </label>
                        <input
                          type="number"
                          value={settingsForm.minOrderAmount}
                          onChange={(e) => setSettingsForm({ ...settingsForm, minOrderAmount: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        نطاق التوصيل الجغرافي
                      </label>
                      <input
                        type="text"
                        value={settingsForm.addressText}
                        onChange={(e) => setSettingsForm({ ...settingsForm, addressText: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        شريط الإعلان العلوي (Announcement Bar)
                      </label>
                      <input
                        type="text"
                        value={settingsForm.announcementText}
                        onChange={(e) => setSettingsForm({ ...settingsForm, announcementText: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          مواعيد العمل
                        </label>
                        <input
                          type="text"
                          value={settingsForm.workingHours}
                          onChange={(e) => setSettingsForm({ ...settingsForm, workingHours: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          نظام حماية الدخول
                        </label>
                        <div className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 flex items-center justify-between">
                          <span className="font-semibold text-emerald-700">محمي بـ Supabase Auth 🔒</span>
                          <span className="text-[11px] text-stone-400">تم إلغاء نظام الـ PIN</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="submit"
                      className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md transition"
                    >
                      حفظ كافة الإعدادات
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('هل ترغب في استعادة الإعدادات الافتراضية والمنتجات التجريبية؟')) {
                          resetToDefaults();
                        }
                      }}
                      className="text-xs text-stone-400 hover:text-red-600 flex items-center gap-1 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>إعادة التعيين للوضع الافتراضي</span>
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 4: CATEGORIES MANAGEMENT */}
              {activeTab === 'categories' && (
                <div className="space-y-5 max-w-xl">
                  <div>
                    <h3 className="text-base font-black text-stone-900">إدارة وتعديل أقسام المنيو</h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      يمكنك هنا إضافة أقسام جديدة، تعديل اسم أي قسم حالي، أو حذف الأقسام القديمة التي لا تحتاجها.
                    </p>
                  </div>
                  
                  {/* Add category form */}
                  <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2">
                    <label className="block text-xs font-bold text-stone-700">
                      إضافة قسم جديد للمنيو:
                    </label>
                    <form onSubmit={handleAddCategory} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="مثلاً: خامات ومستلزمات حلويات، صوصات، مفرزنات خاصة..."
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1 px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                      />
                      <button
                        type="submit"
                        className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shrink-0 shadow-xs"
                      >
                        + إضافة القسم
                      </button>
                    </form>
                  </div>

                  {/* Categories list */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-stone-600 font-bold px-1">
                      <span>الأقسام الحالية ({categories.length}):</span>
                      {categories.filter(c => c.id !== 'all').length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('هل أنت متأكد من رغبتك في حذف كافة الأقسام الحالية للبدء من جديد بأقسامك الخاصة؟')) {
                              categories.filter(c => c.id !== 'all').forEach(c => deleteCategory(c.id));
                            }
                          }}
                          className="text-[11px] text-red-600 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف جميع الأقسام والبدء من جديد</span>
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
                      {categories.map((c) => {
                        const isSystemAll = c.id === 'all';
                        const isEditing = editingCategoryId === c.id;
                        const productCount = products.filter(p => p.category === c.id || (isSystemAll && p)).length;

                        return (
                          <div 
                            key={c.id} 
                            className={`py-2.5 px-3.5 flex items-center justify-between gap-2 transition ${
                              isEditing ? 'bg-orange-50/50' : 'hover:bg-stone-50/70'
                            }`}
                          >
                            {isEditing ? (
                              /* Inline Editing Mode */
                              <div className="flex items-center gap-2 flex-1">
                                <input
                                  type="text"
                                  value={editingCategoryName}
                                  onChange={(e) => setEditingCategoryName(e.target.value)}
                                  autoFocus
                                  className="flex-1 px-3 py-1.5 bg-white border border-orange-500 rounded-xl text-xs font-bold outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (editingCategoryName.trim()) {
                                      updateCategory(c.id, editingCategoryName);
                                      setEditingCategoryId(null);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                                  title="حفظ الاسم الجديد"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCategoryId(null)}
                                  className="p-1.5 rounded-lg bg-stone-200 text-stone-600 hover:bg-stone-300 transition"
                                  title="إلغاء التعديل"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              /* Normal Display Mode */
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs sm:text-sm text-stone-900">
                                    {c.name}
                                  </span>
                                  {isSystemAll && (
                                    <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full font-semibold">
                                      القسم العام (شامل)
                                    </span>
                                  )}
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-stone-400 font-mono bg-stone-100 px-2 py-0.5 rounded-lg">
                                    {productCount} منتج
                                  </span>

                                  {!isSystemAll && (
                                    <div className="flex items-center gap-1">
                                      {/* Edit Category Name Button */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingCategoryId(c.id);
                                          setEditingCategoryName(c.name);
                                        }}
                                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-orange-100 text-stone-600 hover:text-orange-600 transition cursor-pointer"
                                        title="تعديل اسم القسم"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>

                                      {/* Delete Category Button */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const confirmMsg = productCount > 0 
                                            ? `القسم "${c.name}" يحتوي على (${productCount}) منتج. هل أنت متأكد من حذفه؟ (ستظل المنتجات محفوظة ولكن بدون قسم).`
                                            : `هل أنت متأكد من حذف قسم "${c.name}"؟`;
                                          if (confirm(confirmMsg)) {
                                            deleteCategory(c.id);
                                          }
                                        }}
                                        className="p-1.5 rounded-lg bg-stone-100 hover:bg-red-100 text-stone-600 hover:text-red-600 transition cursor-pointer"
                                        title="حذف هذا القسم"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </>
        )}

      </div>

      {/* Product Add / Edit Modal Sub-popup */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-3">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 border border-orange-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-black text-stone-900 text-base">
                {editingProductId ? 'تعديل بيانات المنتج' : 'إضافة منتج جديد'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="w-7 h-7 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">اسم المنتج *</label>
                <input
                  type="text"
                  required
                  placeholder="مثلاً: بانيه دجاج مقرمش جاهز للتحمير"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">السعر (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">السعر قبل الخصم</label>
                  <input
                    type="number"
                    placeholder="اختياري"
                    value={productForm.originalPrice || ''}
                    onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">القسم / التصنيف</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500 bg-white"
                  >
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">الوزن / الكمية الافتراضية</label>
                  <input
                    type="text"
                    placeholder="1 كجم / 12 قطعة / اختر الوزن"
                    value={productForm.weight}
                    onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Weight Options Manager */}
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-amber-950 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(productForm.weightOptions && productForm.weightOptions.length > 0)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProductForm({
                            ...productForm,
                            weight: 'اختر الوزن',
                            weightOptions: [
                              { id: 'w-' + Date.now() + '-1', name: '50 جرام', price: 15 },
                              { id: 'w-' + Date.now() + '-2', name: '100 جرام', price: 28 },
                              { id: 'w-' + Date.now() + '-3', name: '250 جرام (ربع كجم)', price: 65 },
                              { id: 'w-' + Date.now() + '-4', name: '500 جرام (نصف كجم)', price: 125 },
                              { id: 'w-' + Date.now() + '-5', name: '1 كجم (كيلو كامل)', price: 240 },
                            ]
                          });
                        } else {
                          setProductForm({ ...productForm, weightOptions: undefined });
                        }
                      }}
                      className="w-4 h-4 accent-orange-600 rounded"
                    />
                    <span>تفعيل خيارات أوزان وأحجام متعددة (مثل: من 50 جم إلى 1 كجم) ⚖️</span>
                  </label>
                </div>

                {productForm.weightOptions && productForm.weightOptions.length > 0 && (
                  <div className="space-y-2 pt-1 border-t border-amber-200/60">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-stone-600 font-bold">الأوزان المتاحة وسعر كل وزن:</span>
                      <button
                        type="button"
                        onClick={() => {
                          const newId = 'w-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
                          setProductForm({
                            ...productForm,
                            weightOptions: [
                              ...(productForm.weightOptions || []),
                              { id: newId, name: 'وزن جديد', price: 50 }
                            ]
                          });
                        }}
                        className="text-[10px] bg-orange-600 text-white font-bold px-2 py-1 rounded-lg hover:bg-orange-700 transition"
                      >
                        + إضافة خيار وزن آخر
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {productForm.weightOptions.map((opt, idx) => (
                        <div key={opt.id} className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-amber-200">
                          <input
                            type="text"
                            placeholder="اسم الوزن (مثلاً: 100 جرام)"
                            value={opt.name}
                            onChange={(e) => {
                              const updated = [...productForm.weightOptions!];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setProductForm({ ...productForm, weightOptions: updated });
                            }}
                            className="flex-1 px-2 py-1 text-xs border border-stone-200 rounded-lg outline-none"
                          />
                          <div className="flex items-center gap-1 w-24">
                            <input
                              type="number"
                              placeholder="السعر"
                              value={opt.price}
                              onChange={(e) => {
                                const updated = [...productForm.weightOptions!];
                                updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                                setProductForm({ ...productForm, weightOptions: updated });
                              }}
                              className="w-16 px-1.5 py-1 text-xs border border-stone-200 rounded-lg outline-none text-center font-bold"
                            />
                            <span className="text-[10px] text-stone-500">ج.م</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = productForm.weightOptions!.filter((_, i) => i !== idx);
                              setProductForm({
                                ...productForm,
                                weightOptions: updated.length > 0 ? updated : undefined
                              });
                            }}
                            className="text-stone-300 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">وصف المنتج</label>
                <textarea
                  rows={2}
                  placeholder="وصف مختصر للمكونات والتتبيلة..."
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">شارة مميزة (Badge اختياري)</label>
                <input
                  type="text"
                  placeholder="الأكثر مبيعاً 🔥 / جديد / مميز"
                  value={productForm.badge}
                  onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs sm:text-sm outline-none focus:border-orange-500"
                />
              </div>

              {/* Image Section */}
              <div className="space-y-2 border-t pt-2">
                <label className="block text-xs font-bold text-stone-700">صورة المنتج</label>
                
                {/* Image preview */}
                {productForm.image && (
                  <div className="w-full h-28 rounded-xl overflow-hidden border border-stone-200 relative bg-stone-50">
                    <img
                      src={productForm.image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Upload from PC */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold py-2 px-3 rounded-xl cursor-pointer border border-stone-300 transition">
                    <Upload className="w-4 h-4 text-orange-600" />
                    <span>رفع صورة من جهازك</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Image URL input */}
                <input
                  type="url"
                  placeholder="أو اكتب رابط الصورة (URL)"
                  value={productForm.image}
                  onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                  className="w-full px-3 py-1.5 border border-stone-200 rounded-xl text-xs outline-none focus:border-orange-500 font-mono"
                />

                {/* Quick preset choices */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
                  <span className="text-[10px] text-stone-400 shrink-0">صور جاهزة:</span>
                  {PRESET_FROZEN_IMAGES.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setProductForm({ ...productForm, image: preset.url })}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-orange-100 text-stone-700 shrink-0 border border-stone-200"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* In stock toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm({ ...productForm, inStock: e.target.checked })}
                  className="w-4 h-4 accent-orange-600 rounded"
                />
                <span className="text-xs font-bold text-stone-800">المنتج متوفر حالياً في المخزن للطلب</span>
              </label>

              <button
                type="submit"
                className="w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl transition shadow-md"
              >
                {editingProductId ? 'حفظ التعديلات' : 'إضافة المنتج للمتجر'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
