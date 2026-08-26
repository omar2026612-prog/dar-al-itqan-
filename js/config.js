/**
 * ============================================================
 *  دار الإتقان للمطابخ والديكورات — ملف الإعدادات المركزي
 *  Dar Al Itqan Kitchens & Decor — Central Config File
 * ============================================================
 *  عدّل بياناتك هنا فقط، وستنعكس تلقائياً في كل صفحات الموقع
 *  (رقم الهاتف، واتساب، العنوان، الروابط، البريد الإلكتروني...)
 *
 *  ملاحظة هامة:
 *  القيم الموضوعة بين علامتي [ ] هي بيانات لم تُتحقّق بعد من
 *  المصدر الرسمي (صفحة فيسبوك الشركة) ويجب استبدالها ببياناتكم
 *  الحقيقية قبل نشر الموقع. لم يتم اختلاق أي رقم أو ادعاء تسويقي.
 * ============================================================
 */

const SITE_CONFIG = {
  // ---------- الهوية ----------
  // الاسم مطابق تماماً للافتة المعرض الرسمية
  companyName: {
    ar: "دار الإتقان للمطابخ والديكور",
    en: "Dar Al Itqan Kitchens and Decor",
  },
  tagline: {
    ar: "نصنع مساحات تليق بذوقك",
    en: "Crafting spaces worthy of your taste",
  },
  shortDescription: {
    ar: "تصاميم مطابخ وديكورات داخلية تجمع بين جمال التصميم ودقة التنفيذ وجودة التفاصيل.",
    en: "Kitchen and interior decor designs that combine beautiful design, precise execution, and quality detail.",
  },
  country: {
    ar: "سلطنة عُمان",
    en: "Sultanate of Oman",
  },

  // ---------- بيانات التواصل ----------
  // الرقم مأخوذ من لافتة المعرض الرسمية (93966645) — تم افتراض مقدمة سلطنة عُمان +968
  // تأكد من صحته وعدّله هنا إذا لزم الأمر
  contact: {
    phone: "+968 93966645",
    whatsapp: "96893966645",
    email: "[COMPANY_EMAIL]",
    address: {
      ar: "[COMPANY_ADDRESS]",              // العنوان التفصيلي/الولاية غير مؤكد من الصور — أضفه هنا
      en: "[COMPANY_ADDRESS_EN]",
    },
    workingHours: {
      ar: "[WORKING_HOURS]",                // مثال: السبت - الخميس، 9 صباحاً - 9 مساءً
      en: "[WORKING_HOURS_EN]",
    },
  },

  // ---------- روابط التواصل الاجتماعي ----------
  // معرّف "itqank" ظاهر على لوحات المعرض بجانب أيقونات فيسبوك/انستغرام/تيك توك
  // تم بناء الروابط التالية على هذا الأساس — تحقق منها وعدّلها إذا اختلفت
  social: {
    facebook: "https://www.facebook.com/itqank",
    instagram: "https://www.instagram.com/itqank",
    tiktok: "https://www.tiktok.com/@itqank",
    youtube: "https://youtube.com/@itqank",
    snapchat: "https://www.snapchat.com/add/itqank",
  },

  // ---------- خرائط جوجل ----------
  // أسهل طريقة: اكتب عنوان المعرض نصياً هنا (مثال: "معرض دار الإتقان، صحار، عُمان")
  // وسيُبنى رابط الخريطة تلقائياً بدون الحاجة لأي كود تضمين معقّد.
  // يمكن أيضاً وضع رابط تضمين خرائط جوجل الكامل في googleMapsEmbedUrl إن رغبت بذلك (اختياري، له الأولوية إن وُجد).
  googleMapsQuery: "[GOOGLE_MAPS_ADDRESS]",
  googleMapsEmbedUrl: "",

  // ---------- رسالة واتساب التلقائية ----------
  whatsappDefaultMessage: {
    ar: "السلام عليكم، أرغب في الاستفسار عن تصميم وتنفيذ مطبخ/ديكور.",
    en: "Hello, I'd like to inquire about kitchen/decor design and execution.",
  },

  // ---------- الشريط المتحرك (أعلى كل صفحات الموقع) ----------
  // نص واحد يُعرض بحركة مستمرة أعلى الهيدر — عدّله من تبويب "بيانات الشركة"
  // في لوحة التحكم، أو مباشرة هنا. اترك النص فارغاً لإخفاء الشريط بالكامل.
  tickerText: {
    ar: "دار الإتقان للمطابخ والديكور  •  نصنع مساحات تليق بذوقك  •  للاستفسار والحجز: +968 93966645",
    en: "Dar Al Itqan Kitchens and Decor  •  Crafting spaces worthy of your taste  •  Call us: +968 93966645",
  },

  // ---------- روابط التنقل الرئيسية ----------
  nav: [
    { key: "home", ar: "الرئيسية", en: "Home", href: "index.html" },
    { key: "about", ar: "من نحن", en: "About", href: "about.html" },
    { key: "services", ar: "خدماتنا", en: "Services", href: "services.html" },
    { key: "portfolio", ar: "معرض الأعمال", en: "Portfolio", href: "portfolio.html" },
    { key: "videos", ar: "الفيديوهات", en: "Videos", href: "videos.html" },
    { key: "social", ar: "السوشيال ميديا", en: "Social", href: "social.html" },
    { key: "contact", ar: "تواصل معنا", en: "Contact", href: "contact.html" },
  ],

  // ---------- لوحة التحكم (admin.html) ----------
  // كلمة مرور بسيطة لحماية صفحة لوحة التحكم من الزوار العاديين فقط —
  // هذه ليست حماية أمنية حقيقية (الصفحة كود يعمل في المتصفح)، لذا لا تضع
  // فيها بيانات حساسة، ولا تشارك رابط admin.html علناً. غيّرها من هنا.
  adminPasscode: "123456789",
};

// دالة مساعدة لبناء رابط واتساب مع الرسالة الافتراضية
function getWhatsAppLink(customMessage) {
  const number = SITE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "");
  const message = encodeURIComponent(customMessage || SITE_CONFIG.whatsappDefaultMessage.ar);
  return `https://wa.me/${number}?text=${message}`;
}

// دالة مساعدة لبناء رابط تضمين خرائط جوجل تلقائياً:
// - إن وُجد رابط تضمين كامل (googleMapsEmbedUrl) نستخدمه كما هو (له الأولوية).
// - وإلا، إن وُجد عنوان نصي (googleMapsQuery) نبني منه رابط تضمين مباشرة بدون أي مفتاح API.
// - وإلا نرجع فارغاً ليظهر نص "لم تتم الإضافة بعد" بدل الخريطة.
function getGoogleMapsSrc() {
  const embed = SITE_CONFIG.googleMapsEmbedUrl;
  if (embed && !embed.startsWith("[")) return embed;
  const query = SITE_CONFIG.googleMapsQuery;
  if (query && !query.startsWith("[") && query.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(query.trim())}&output=embed`;
  }
  return "";
}
