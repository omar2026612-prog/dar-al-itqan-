/**
 * ============================================================
 *  دار الإتقان للمطابخ والديكورات — ملف الإعدادات المركزي
 *  تم إنشاؤه من لوحة التحكم — ارفعه ليحل محل js/config.js
 * ============================================================
 */

const SITE_CONFIG = {
  "companyName": {
    "ar": "دار الإتقان للمطابخ والديكور",
    "en": "Dar Al Itqan Kitchens and Decor"
  },
  "tagline": {
    "ar": "نصنع مساحات تليق بذوقك",
    "en": "Crafting spaces worthy of your taste"
  },
  "shortDescription": {
    "ar": "تصاميم مطابخ وديكورات داخلية تجمع بين جمال التصميم ودقة التنفيذ وجودة التفاصيل.",
    "en": "Kitchen and interior decor designs that combine beautiful design, precise execution, and quality detail."
  },
  "country": {
    "ar": "سلطنة عُمان",
    "en": "Sultanate of Oman"
  },
  "contact": {
    "phone": "+968 93966645",
    "whatsapp": "96893966645",
    "email": "[COMPANY_EMAIL]",
    "address": {
      "ar": "[COMPANY_ADDRESS]",
      "en": "[COMPANY_ADDRESS_EN]"
    },
    "workingHours": {
      "ar": "[WORKING_HOURS]",
      "en": "[WORKING_HOURS_EN]"
    }
  },
  "social": {
    "facebook": "https://www.facebook.com/itqank",
    "instagram": "https://www.instagram.com/itqank",
    "tiktok": "https://www.tiktok.com/@itqank",
    "youtube": "https://youtube.com/@itqank",
    "snapchat": "https://www.snapchat.com/add/itqank"
  },
  "googleMapsQuery": "",
  "googleMapsEmbedUrl": "",
  "whatsappDefaultMessage": {
    "ar": "السلام عليكم، أرغب في الاستفسار عن تصميم وتنفيذ مطبخ/ديكور.",
    "en": "Hello, I'd like to inquire about kitchen/decor design and execution."
  },
  "tickerText": {
    "ar": "دار الإتقان للمطابخ والديكور  •  نصنع مساحات تليق بذوقك  •  للاستفسار والحجز: +968 93966645",
    "en": "Dar Al Itqan Kitchens and Decor  •  Crafting spaces worthy of your taste  •  Call us: +968 93966645"
  },
  "nav": [
    {
      "key": "home",
      "ar": "الرئيسية",
      "en": "Home",
      "href": "index.html"
    },
    {
      "key": "about",
      "ar": "من نحن",
      "en": "About",
      "href": "about.html"
    },
    {
      "key": "services",
      "ar": "خدماتنا",
      "en": "Services",
      "href": "services.html"
    },
    {
      "key": "portfolio",
      "ar": "معرض الأعمال",
      "en": "Portfolio",
      "href": "portfolio.html"
    },
    {
      "key": "videos",
      "ar": "الفيديوهات",
      "en": "Videos",
      "href": "videos.html"
    },
    {
      "key": "social",
      "ar": "السوشيال ميديا",
      "en": "Social",
      "href": "social.html"
    },
    {
      "key": "contact",
      "ar": "تواصل معنا",
      "en": "Contact",
      "href": "contact.html"
    }
  ],
  "adminPasscode": "123456789"
};

function getWhatsAppLink(customMessage) {
  const number = SITE_CONFIG.contact.whatsapp.replace(/[^0-9]/g, "");
  const message = encodeURIComponent(customMessage || SITE_CONFIG.whatsappDefaultMessage.ar);
  return `https://wa.me/${number}?text=${message}`;
}

function getGoogleMapsSrc() {
  const embed = SITE_CONFIG.googleMapsEmbedUrl;
  if (embed && !embed.startsWith("[")) return embed;
  const query = SITE_CONFIG.googleMapsQuery;
  if (query && !query.startsWith("[") && query.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(query.trim())}&output=embed`;
  }
  return "";
}
