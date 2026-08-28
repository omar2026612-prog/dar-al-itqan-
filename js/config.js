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
    "facebook": "https://l.instagram.com/?u=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18DTXv8dFM&e=AUANg_8gt78D2mVf_NZgEZ-avuNPSZnOW_RkVHpb-dgqFovjiTLhtBITfNmWFn71v2ZgpMLFjP3ubTKqJpXOboWQOkGPzdrOQtVcuMW3GDkFSKCj7gThP4kK49Vu4YJFjvztYmjCWi-LCamg97Mz8w",
    "instagram": "https://l.instagram.com/?u=https%3A%2F%2Fwww.instagram.com%2Fitqank&e=AUCvdFhUPmyk79LTsAMlYcqLd0iLvUYsQIAXWVxyIzow7XTnvK-JGMsqVjG2jj0iN1bFrsksJJ6o-9yzcNNTYUgVHgTP6NRE8Svtl3Oe2JitaqXOPx53Gh76bSKx-tzY61SYIJc9mO61pmCk5ZT9xQ",
    "tiktok": "https://l.instagram.com/?u=https%3A%2F%2Fwww.tiktok.com%2F%40itqank&e=AUBCFNEQAf5nWsu24fOq6f6LonZ2tG_nCaodkoKvDKasG9OkwmP8Eu4fGRO10N14ip8gD6custTS-bxG1I27X9WhLkJjZPv2gAfXWwghcFHOfpimIW5YCjWLOMgvo9_1uhokAcpP_Uk4SJcrF31CCA",
    "youtube": "https://l.instagram.com/?u=https%3A%2F%2Fyoutube.com%2F%40itqank%3Fsi%3DqwjWvxCeb1J9wnT-&e=AUD1fkHcgXzPnq0waIEJ45j67XeI7rotfc8k5D5kkj9JdIBgwZduTzwyK1Jt45HjMfcpG6yKIt-WyOKRPZkwawC3XdH9yukrBpE08HpOd9-Ea_m3B4luhVSvAzDkOG5b_r53LDnvWHGVOOSLvFwMyw",
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
