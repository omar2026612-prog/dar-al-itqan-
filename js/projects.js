/**
 * بيانات المشاريع / صور المعرض
 * لإضافة مشروع جديد: انسخ كائناً من القائمة وعدّل بياناته،
 * وضع صورك داخل images/projects/
 */
let PROJECTS = [
  {
    id: "kitchen-charcoal-marble",
    category: "kitchens",
    title: { ar: "مطبخ رمادي فحمي بواجهات زجاجية مضلعة", en: "Charcoal Kitchen with Ribbed Glass Fronts" },
    location: { ar: "معرض دار الإتقان", en: "Dar Al Itqan Showroom" },
    cover: "images/projects/kitchen-charcoal-marble-1.jpg",
    gallery: ["images/projects/kitchen-charcoal-marble-1.jpg", "images/projects/kitchen-charcoal-marble-2.jpg"],
    description: {
      ar: "مطبخ بتصميم على شكل حرف L بدرجة رمادي فحمي غير لامع، مع واجهة خلفية من الرخام الطبيعي وجزيرة وسطية بسطح غرانيت أسود، وخزانات علوية بزجاج مضلع.",
      en: "An L-shaped kitchen in matte charcoal grey, a natural marble backsplash, a central island with a black granite top, and upper cabinets with ribbed glass fronts.",
    },
  },
  {
    id: "kitchen-walnut-beige",
    category: "kitchens",
    title: { ar: "مطبخ عصري بيج وخشب الجوز", en: "Modern Beige & Walnut Kitchen" },
    location: { ar: "معرض دار الإتقان", en: "Dar Al Itqan Showroom" },
    cover: "images/projects/kitchen-walnut-beige.jpg",
    gallery: ["images/projects/kitchen-walnut-beige.jpg"],
    description: {
      ar: "مطبخ بلمسة دافئة تجمع بين الخزانات البيج المطفية وواجهات خشب الجوز الطبيعي، مع إضاءة خفية أسفل الوحدات وجزيرة بسطح غرانيت أسود.",
      en: "A warm kitchen combining matte beige cabinetry with natural walnut fronts, hidden under-cabinet lighting, and a black granite island.",
    },
  },
  {
    id: "kitchen-white-gloss",
    category: "kitchens",
    title: { ar: "مطبخ أبيض لامع بلمسات خشبية", en: "White Gloss Kitchen with Wood Accents" },
    location: { ar: "معرض دار الإتقان", en: "Dar Al Itqan Showroom" },
    cover: "images/projects/kitchen-white-gloss.jpg",
    gallery: ["images/projects/kitchen-white-gloss.jpg"],
    description: {
      ar: "مطبخ بلمسة نظيفة وعصرية بواجهات بيضاء لامعة، مظلة شفط مائلة بلمسة خشبية، وسطح عمل أسود يمنح تبايناً أنيقاً.",
      en: "A clean, modern kitchen with glossy white fronts, an angled wood-accent hood, and a black countertop for elegant contrast.",
    },
  },
  {
    id: "kitchen-wood-tone",
    category: "kitchens",
    title: { ar: "مطبخ بدرجات الخشب الطبيعي", en: "Natural Wood-Tone Kitchen" },
    location: { ar: "معرض دار الإتقان", en: "Dar Al Itqan Showroom" },
    cover: "images/projects/kitchen-wood-tone.jpg",
    gallery: ["images/projects/kitchen-wood-tone.jpg"],
    description: {
      ar: "تصميم يعتمد على درجات الخشب الطبيعي الدافئة مع وحدات تخزين مفتوحة وخزانات جانبية بارتفاع كامل.",
      en: "A design built around warm natural wood tones, with open storage units and full-height side cabinets.",
    },
  },
  {
    id: "bedroom-mirrored-wardrobe",
    category: "wardrobes",
    title: { ar: "خزانة ملابس بمرايا مؤطرة بالأسود", en: "Black-Framed Mirrored Wardrobe" },
    location: { ar: "معرض دار الإتقان", en: "Dar Al Itqan Showroom" },
    cover: "images/projects/bedroom-mirrored-wardrobe.jpg",
    gallery: ["images/projects/bedroom-mirrored-wardrobe.jpg"],
    description: {
      ar: "خزانة ملابس بأبواب مرايا كاملة الارتفاع بإطارات سوداء رفيعة، تمنح غرفة النوم اتساعاً بصرياً وطابعاً عصرياً فاخراً.",
      en: "A full-height mirrored wardrobe with slim black frames, adding visual depth and a modern luxury feel to the bedroom.",
    },
  },
  {
    id: "bedroom-headboard",
    category: "bedrooms",
    title: { ar: "غرفة نوم بلوح رأس منجّد", en: "Bedroom with Upholstered Headboard Wall" },
    location: { ar: "معرض دار الإتقان", en: "Dar Al Itqan Showroom" },
    cover: "images/projects/bedroom-headboard.jpg",
    gallery: ["images/projects/bedroom-headboard.jpg"],
    description: {
      ar: "جدار رأس السرير بتنجيد مخملي بخطوط عمودية، مع وحدة تلفزيون خشبية جانبية ولمسات إضاءة دافئة.",
      en: "A velvet-upholstered headboard wall with vertical channel tufting, a side wood TV unit, and warm accent lighting.",
    },
  },
  {
    id: "bedroom-wardrobe-led",
    category: "wardrobes",
    title: { ar: "خزانة زاوية بإضاءة LED مخفية", en: "Corner Wardrobe with Hidden LED Lighting" },
    location: { ar: "معرض دار الإتقان", en: "Dar Al Itqan Showroom" },
    cover: "images/projects/bedroom-wardrobe-led.jpg",
    gallery: ["images/projects/bedroom-wardrobe-led.jpg"],
    description: {
      ar: "خزانة زاوية بيج بمقابض سوداء طويلة، وإضاءة LED مخفية أسفل الوحدة تمنح إحساساً فندقياً فاخراً.",
      en: "A beige corner wardrobe with long black handles and hidden LED lighting beneath the unit for a hotel-luxury feel.",
    },
  },
  {
    id: "entry-console-walnut",
    category: "decor",
    title: { ar: "وحدة مدخل خشبية بتصميم مضلع", en: "Ribbed Walnut Entry Console" },
    location: { ar: "معرض دار الإتقان", en: "Dar Al Itqan Showroom" },
    cover: "images/projects/entry-console-walnut.jpg",
    gallery: ["images/projects/entry-console-walnut.jpg"],
    description: {
      ar: "وحدة مدخل عمودية بخشب الجوز المضلع، مع مقعد جلوس مدمج وإضاءة معلقة، تصميم يجمع بين الوظيفة والجمال.",
      en: "A vertical ribbed-walnut entry console with a built-in bench seat and pendant lighting — a piece that blends function and beauty.",
    },
  },
  {
    id: "kitchenette-teal-walnut",
    category: "decor",
    title: { ar: "ركن مطبخ صغير بالأخضر الفاتح والجوز", en: "Compact Kitchenette in Sage & Walnut" },
    location: { ar: "معرض دار الإتقان", en: "Dar Al Itqan Showroom" },
    cover: "images/projects/kitchenette-teal-walnut.jpg",
    gallery: ["images/projects/kitchenette-teal-walnut.jpg"],
    description: {
      ar: "تصميم لركن ضيافة صغير يجمع بين الخزانات الخضراء الفاتحة وخشب الجوز الدافئ، مع طاولة بار مائلة الأرجل.",
      en: "A compact hospitality corner combining sage-green cabinetry with warm walnut, and an angled-leg bar table.",
    },
  },
];
