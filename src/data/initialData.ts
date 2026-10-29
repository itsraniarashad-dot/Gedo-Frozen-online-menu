import { Category, Product, StoreSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'all', name: 'الكل' },
  { id: 'dessert-supplies', name: 'مستلزمات الحلويات' },
  { id: 'poultry', name: 'دواجن متبلة وبانيه' },
  { id: 'meat', name: 'لحوم وبرجر وكفتة' },
  { id: 'pastry', name: 'سمبوسك ومقبلات' },
  { id: 'seafood', name: 'مأكولات بحرية' },
  { id: 'veggies', name: 'خضروات وفواكه' },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'b-1',
    name: 'بوكس لمة العيلة التوفيري',
    category: 'poultry',
    description: 'يحتوي على: 1 كجم ستريبس دجاج مقرمش + 1 كجم برجر بقري جامبو + طبق سمبوسة جبنة 12 قطعة + كيس بطاطس نصف مقلية 1 كجم مجاناً!',
    price: 680,
    originalPrice: 790,
    weight: '3.5 كجم تقريباً',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    badge: 'الأكثر توفيراً ⭐',
    inStock: true,
    storageTip: 'يحفظ مجمدًا عند -18° مئوية'
  },
  {
    id: 'b-2',
    name: 'باقة مفرزنات العزومات السريعة',
    category: 'pastry',
    description: 'طبق كبيبة شامي لحم 12 قطعة + طبق سمبوسة لحمة مفرومة بلدي 12 قطعة + طبق سبرينغ رول خضار وجبن 12 قطعة.',
    price: 395,
    originalPrice: 460,
    weight: '36 قطعة منوعة',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    badge: 'عرض خاص 🔥',
    inStock: true,
    storageTip: 'تطهى مباشرة وهي مجمدة دون إذابة'
  },

  // دواجن
  {
    id: 'p-1',
    name: 'ستريبس دجاج سوبر كرانشي (عادي / سبايسي)',
    category: 'poultry',
    description: 'صدور دجاج طازجة متبلة بخلطتنا المقرمشة السرية ومغطاة بطبقة كرسبي ذهبية مقرمشة غاية في اللذاذة.',
    price: 240,
    originalPrice: 270,
    weight: '1 كجم صـافي',
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80',
    badge: 'الأكثر مبيعاً 🏆',
    inStock: true,
    storageTip: 'يحفظ في الفريزر، يقلى مجمداً'
  },
  {
    id: 'p-2',
    name: 'بانيه دجاج مقرمش جاهز للتحمير',
    category: 'poultry',
    description: 'شرائح صدور بانيه رفيعة متبلة ومغلفة بالبقسماط الذهبي المتبل، مقرمشة من الخارج وطرية من الداخل.',
    price: 230,
    weight: '1 كجم (10-12 قطعة)',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    storageTip: 'يحفظ مجمداً حتى موعد الطهي'
  },
  {
    id: 'p-3',
    name: 'شيش طاووق متبل على الطريقة اللبنانية',
    category: 'poultry',
    description: 'قطع أوراك دجاج مخلية متبلة بخلطة الزبادي والليمون والبهارات والأعشاب، جاهزة للشوي أو الطاسة مباشرة.',
    price: 255,
    originalPrice: 280,
    weight: '1 كجم متبل',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=800&q=80',
    badge: 'تتبيلة مميزة 🍋',
    inStock: true,
    storageTip: 'يترك 10 دقائق قبل وضعه على الجريل الساخن'
  },
  {
    id: 'p-4',
    name: 'ناجتس دجاج للأطفال المقرمش',
    category: 'poultry',
    description: 'ناجتس لحم دجاج صافي 100% بدون دهون أو مواد حافظة، محبب ومثالي للوجبات المدرسية السريعة.',
    price: 180,
    weight: '800 جرام (حوالي 25 قطعة)',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    storageTip: 'يحفظ عند -18°'
  },

  // لحوم وبرجر وكفتة
  {
    id: 'm-1',
    name: 'برجر بقري جامبو متبل فاخر',
    category: 'meat',
    description: 'برجر لحم بلدي مفروم مع التوابل الغنية بدون صويا مضافة، يذوب في الفم ويحتفظ بعصارته أثناء الشوي.',
    price: 260,
    originalPrice: 290,
    weight: '1 كجم (8 قطع جامبو)',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80',
    badge: 'لحم بقري صافي 🥩',
    inStock: true,
    storageTip: 'يوضع على الجريل مجمداً مباشرة'
  },
  {
    id: 'm-2',
    name: 'كفتة حاتي متبلة جاهزة للشوي',
    category: 'meat',
    description: 'أصابع كفتة حاتي متبلة بالبصل والبهارات الشرقية ورشة ليّة ضاني خفيفة لنكهة الشواء الأصيلة.',
    price: 250,
    weight: '1 كجم (حوالي 16 أصبع)',
    image: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80',
    badge: 'طعم الحاتي الأصلي 🍢',
    inStock: true,
    storageTip: 'يحفظ مجمداً'
  },
  {
    id: 'm-3',
    name: 'حواوشي إسكندراني بلدي فاخر',
    category: 'meat',
    description: 'أرغفة حواوشي محشوة بخلطة اللحم البلدي المتبل بالفلفل والبصل والبهارات، جاهز للتحمير في الطاسة فوراً.',
    price: 190,
    originalPrice: 220,
    weight: 'عبوة 4 أرغفة محشية',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    storageTip: 'يسوى مجمداً على نار هادئة'
  },
  {
    id: 'm-4',
    name: 'سجق شرقي بلدي مجمد متبل',
    category: 'meat',
    description: 'سجق بقري بلدي في هانك طبيعي مع خلطة الثوم والبهارات الشرقية، ممتاز مع الطماطم والفلفل.',
    price: 270,
    weight: '1 كجم صافي',
    image: 'https://images.unsplash.com/photo-1585325701165-351af916e581?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    storageTip: 'يحفظ في الفريزر'
  },

  // سمبوسك ومقبلات
  {
    id: 's-1',
    name: 'سمبوسة ميكس جبن كيري وموزاريلا',
    category: 'pastry',
    description: 'عجينة سمبوسة مقرمشة خفيفة محشوة بميكس جبن غني مع لمسة زعتر ونعناع، لا تمتص زيت.',
    price: 125,
    weight: 'علبة 12 قطعة',
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    badge: 'مقرمشة ولذيذة 🧀',
    inStock: true,
    storageTip: 'تقلى مباشرة وهي مجمدة'
  },
  {
    id: 's-2',
    name: 'سمبوسة لحم مفروم بلدي معصج',
    category: 'pastry',
    description: 'محشوة بلحم مفروم بلدي طازج مطهو مع البصل والمكسرات والبهارات الخاصة.',
    price: 140,
    weight: 'علبة 12 قطعة',
    image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    storageTip: 'تقلى مفرزة دون فك التجميد'
  },
  {
    id: 's-3',
    name: 'كبيبة شامية باللحم والصنوبر',
    category: 'pastry',
    description: 'غلاف برغل ناعم ومقرمش محشو باللحمة المفرومة والبصل المكرمل ولمسة صنوبر، مضبوطة القوام.',
    price: 175,
    originalPrice: 200,
    weight: 'طبق 12 حبة',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    badge: 'عزايم ملوكي 👑',
    inStock: true,
    storageTip: 'لا تحركها أول دقيقتين في الزيت'
  },
  {
    id: 's-4',
    name: 'سبرينغ رول دجاج وخضار صيني',
    category: 'pastry',
    description: 'رقائق سبرينغ رول هشة محشوة بقطع الدجاج والخضار السوتيه المتبل بالصويا صوص والسمسم.',
    price: 130,
    weight: 'علبة 12 قطعة',
    image: 'https://images.unsplash.com/photo-1548946526-f69e2424cf45?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    storageTip: 'يقلى مجمداً'
  },

  // مأكولات بحرية
  {
    id: 'sf-1',
    name: 'جمبري جامبو بانيه مقرمش (تمبورا)',
    category: 'seafood',
    description: 'جمبري بحري مقشر ومنظف ومتبل بعناية مغلف بطبقة تمبورا مقرمشة، جاهز للقلي الفوري.',
    price: 360,
    originalPrice: 410,
    weight: 'طبق 500 جرام صافي (15-18 حبة)',
    image: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
    badge: 'فاخر ومقرمش 🍤',
    inStock: true,
    storageTip: 'يحفظ مجمداً عند -18°'
  },
  {
    id: 'sf-2',
    name: 'أصابع سمك فيليه مقرمش (Fish Fingers)',
    category: 'seafood',
    description: 'أصابع فيليه قشر بياض صافي متبل بالليمون والكمون ومغلف بالبقسماط الذهبي، خفيف وصحي للأولاد.',
    price: 210,
    weight: 'علبة 750 جرام',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    storageTip: 'يوضع مجمداً في الزيت الساخن'
  },

  // خضروات وفواكه
  {
    id: 'v-1',
    name: 'بطاطس فارم فريتس نصف مقلية ممتازة',
    category: 'veggies',
    description: 'أصابع بطاطس مقرمشة ذهبية سريعة التحضير من أجود حبات البطاطس المخصصة للتحمير.',
    price: 95,
    weight: 'كيس 1 كجم',
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    storageTip: 'تقلى مباشرة دون إذابة'
  },
  {
    id: 'v-2',
    name: 'فراولة بلدي مجمدة سريعة التحضير',
    category: 'veggies',
    description: 'فراولة طازجة منتقاة حبة بحبة، مغسولة ومجمدة بعناية للحفاظ على الطعم والفيتامينات، مثالية للعصائر والسموذي.',
    price: 65,
    weight: 'كيس 1 كجم',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=80',
    badge: 'طبيعي 100% 🍓',
    inStock: true,
    storageTip: 'يحفظ عند -18°'
  },
  {
    id: 'v-3',
    name: 'بامية إكسترا ممتازة مجمدة',
    category: 'veggies',
    description: 'بامية بلدي صغيرة الحجم (إكسترا مقمعة يدوياً) خضراء نضرة بدون أي خيوط أو ألياف.',
    price: 55,
    weight: 'كيس 400 جرام',
    image: 'https://images.unsplash.com/photo-1508746829417-e6f548d8d6ed?auto=format&fit=crop&w=800&q=80',
    inStock: true,
    storageTip: 'تضاف للصلصة وهي مجمدة'
  },

  // مستلزمات الحلويات (بأوزان متعددة)
  {
    id: 'bak-1',
    name: 'كريم شانتيه خام دريم بدون سكر فاخر',
    category: 'dessert-supplies',
    description: 'كريم شانتيه خام عالي الجودة والتماسك، قوام كثيف ومثالي لتزيين التورت والحلويات والمثلجات بدون أي إضافات، متوفر بجميع الأوزان من 50 جرام وحتى الكيلو.',
    price: 15,
    weight: 'اختر الوزن (من 50 جم إلى 1 كجم)',
    weightOptions: [
      { id: 'w-50', name: '50 جرام', price: 15 },
      { id: 'w-100', name: '100 جرام', price: 28 },
      { id: 'w-250', name: '250 جرام (ربع كجم)', price: 65, originalPrice: 70 },
      { id: 'w-500', name: '500 جرام (نصف كجم)', price: 125, originalPrice: 135 },
      { id: 'w-1000', name: '1 كجم (كيلو كامل)', price: 240, originalPrice: 260 },
    ],
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=800&q=80',
    badge: 'متوفر بأوزان مختلفة ⚖️',
    inStock: true,
    storageTip: 'يحفظ في مكان جاف وبارد أو بالثلاجة'
  },
  {
    id: 'bak-2',
    name: 'كاكاو خام إسباني غامق ممتاز',
    category: 'dessert-supplies',
    description: 'بودرة كاكاو إسباني خام غنية بدون سكر لنكهة شيكولاتة عميقة في الكيك والحلويات، متوفر بجميع الأوزان.',
    price: 20,
    weight: 'اختر الوزن (من 50 جم إلى 1 كجم)',
    weightOptions: [
      { id: 'c-50', name: '50 جرام', price: 20 },
      { id: 'c-100', name: '100 جرام', price: 38 },
      { id: 'c-250', name: '250 جرام (ربع كجم)', price: 90 },
      { id: 'c-500', name: '500 جرام (نصف كجم)', price: 175 },
      { id: 'c-1000', name: '1 كجم كامل', price: 340 },
    ],
    image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=800&q=80',
    badge: 'خام إسباني أصلي 🍫',
    inStock: true,
    storageTip: 'يحفظ في عبوة محكمة الإغلاق'
  },
  {
    id: 'bak-3',
    name: 'عجينة باف باستري (ميلفيه) مجمدة فاخرة',
    category: 'dessert-supplies',
    description: 'رقائق عجينة زبدية هشة ومورقة جاهزة للخبز، مثالية لتحضير أم علي، المخبوزات الفرنسية، والساليزونات المالحة.',
    price: 85,
    weight: 'عبوة 500 جرام (10 رقائق)',
    weightOptions: [
      { id: 'puff-500', name: 'عبوة 500 جرام (10 رقائق)', price: 85 },
      { id: 'puff-1000', name: 'عبوة 1 كجم توفير (20 رقيقة)', price: 160, originalPrice: 170 },
    ],
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    badge: 'توريق زبدي ممتاز 🥐',
    inStock: true,
    storageTip: 'تخرج من الفريزر 15 دقيقة قبل التشكيل والخبز'
  }
];

export const INITIAL_SETTINGS: StoreSettings = {
  storeName: 'Gedo Frozen | جدو فروزن',
  storeTagline: 'أشهى المفرزنات واللحوم الجاهزة للطهي بجودة وأمان مضمون',
  whatsappNumber: '201106166176', // رقم واتساب التاجر
  supportPhone: '01106166176',
  instapayHandle: 'gedo.frozen@instapay',
  walletNumber: '01106166176',
  walletType: 'فودافون كاش / أورنج كاش / اتصالات كاش',
  deliveryFee: 35,
  minOrderAmount: 0, // بدون حد أدنى للطلب
  addressText: '٧ز مدينة الفردوس استثماري شارع أنس ابن مالك أمام صيدلية محمد شمس -حدائق أكتوبر محافظة الجيزة-',
  announcementText: '🧊 مفرزنات متبلة ولذيذة جاهزة للطهي والتسليم السريع | 🛵 التوصيل متاح حالياً داخل منطقة 6 أكتوبر فقط',
  adminPin: '1234',
  workingHours: 'يومياً من 10 صباحاً حتى 11:30 مساءً'
};
