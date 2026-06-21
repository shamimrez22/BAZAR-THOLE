export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  unit: string;
  price: number; // Discount price is stored here if discounted, or write separate fields
  originalPrice: number; // Used for crossing out
  discountPercent: number; // 0 if no discount
  stock: number;
  description: string;
  rating: number;
  featured: boolean;
  bestSeller: boolean;
  isNewArrival: boolean;
  popular: boolean;
  deliveryFee?: number;
  affiliateUrl?: string;
  isFlashSale?: boolean;
  isSpecialOffer?: boolean;
  sizes?: string[];
}

export interface Category {
  slug: string;
  name: string;
  image: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Canceled';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export interface Order {
  id: string;
  trackingCode: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  items: {
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    unit: string;
    image: string;
    selectedSize?: string;
  }[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  paymentMethod: 'Cash on Delivery' | 'bKash' | 'Nagad' | 'SSLCommerz';
  paymentStatus: 'Pending' | 'Paid' | 'Failed';
  status: OrderStatus;
  orderDate: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  registeredDate: string;
  status: 'Active' | 'Blocked';
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  minSpend: number;
  active: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  badge: string;
  bgGradient: string;
}

export interface Review {
  id: string;
  productName: string;
  customerName: string;
  feedback: string;
  rating: number;
  date: string;
  avatar: string;
}

export interface StoreSettings {
  storeName: string;
  email: string;
  phone: string;
  address: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  operatingHours: string;
  
  // SYSTEM_CORE_CONFIG properties
  siteDescEnglish?: string;
  siteDescBengali?: string;
  phone2?: string;
  socialFb?: string;
  socialTw?: string;
  socialIg?: string;
  
  quickLinks?: Array<{ id: string; label: string; url: string }>;
  socialLinksExpanded?: Array<{ id: string; label: string; url: string }>;

  // SMS & Gmail configurations
  smsGateway?: string;
  smsApiToken?: string;
  enableSmtp?: boolean;
  smtpHost?: string;
  smtpPort?: number;
  gmailAppPassword?: string;

  // Orders & Taxes configurations
  deliveryFeeOutsideDhaka?: number;
  vatTaxPercent?: number;
  enableSSLCommerz?: boolean;
  enableBkashNagad?: boolean;
  bkashNumber?: string;
  nagadNumber?: string;
  bkashInstruction?: string;
  nagadInstruction?: string;
  minOrderValue?: number;

  // Security & Admin 
  adminUsername?: string;
  adminPassword?: string;
  recoveryEmail?: string;
  recoveryPhone?: string;

  // Ads Configurations
  enableAds?: boolean;
  adsterraHeaderScript?: string;
  adsterraSidebarScript?: string;
  adsterraFeedScript?: string;
  isSafeAdsOnly?: boolean;

  // Special Offer Section configuration
  specialOfferTitle?: string;
  specialOfferDesc?: string;
  specialOfferImage?: string;
  specialOfferHours?: number;
  specialOfferMinutes?: number;

  // Homepage Scrolling Notices
  enableTopNotice?: boolean;
  topNoticeText?: string;
  enableBottomNotice?: boolean;
  bottomNoticeText?: string;
}

export const BANGLADESH_DISTRICTS = [
  { en: "Bagerhat", bn: "Bagerhat (বাগেরহাট)" },
  { en: "Bandarban", bn: "Bandarban (বান্দরবান)" },
  { en: "Barguna", bn: "Barguna (বরগুনা)" },
  { en: "Barisal", bn: "Barisal (বরিশাল)" },
  { en: "Bhola", bn: "Bhola (ভোলা)" },
  { en: "Bogra", bn: "Bogra (বগুড়া)" },
  { en: "Brahmanbaria", bn: "Brahmanbaria (ব্রাহ্মণবাড়িয়া)" },
  { en: "Chandpur", bn: "Chandpur (চাঁদপুর)" },
  { en: "Chapainawabganj", bn: "Chapainawabganj (চাঁপাইনবাবগঞ্জ)" },
  { en: "Chittagong", bn: "Chittagong (চট্টগ্রাম)" },
  { en: "Chuadanga", bn: "Chuadanga (চুয়াডাঙ্গা)" },
  { en: "Comilla", bn: "Comilla (কুমিল্লা)" },
  { en: "Cox's Bazar", bn: "Cox's Bazar (কক্সবাজার)" },
  { en: "Dhaka", bn: "Dhaka (ঢাকা)" },
  { en: "Dinajpur", bn: "Dinajpur (দিনাজপুর)" },
  { en: "Faridpur", bn: "Faridpur (ফরিদপুর)" },
  { en: "Feni", bn: "Feni (ফেনী)" },
  { en: "Gaibandha", bn: "Gaibandha (গাইবান্ধা)" },
  { en: "Gazipur", bn: "Gazipur (গাজীপুর)" },
  { en: "Gopalganj", bn: "Gopalganj (গোপালগঞ্জ)" },
  { en: "Habiganj", bn: "Habiganj (হবিগঞ্জ)" },
  { en: "Jamalpur", bn: "Jamalpur (জামালপুর)" },
  { en: "Jessore", bn: "Jessore (যশোর)" },
  { en: "Jhalokati", bn: "Jhalokati (ঝালকাঠি)" },
  { en: "Jhenaidah", bn: "Jhenaidah (ঝিনাইদহ)" },
  { en: "Joypurhat", bn: "Joypurhat (জয়পুরহাট)" },
  { en: "Khagrachhari", bn: "Khagrachhari (খাগড়াছড়ি)" },
  { en: "Khulna", bn: "Khulna (খুলনা)" },
  { en: "Kishoreganj", bn: "Kishoreganj (কিশোরগঞ্জ)" },
  { en: "Kurigram", bn: "Kurigram (কুড়িগ্রাম)" },
  { en: "Kushtia", bn: "Kushtia (কুষ্টিয়া)" },
  { en: "Lakshmipur", bn: "Lakshmipur (লক্ষ্মীপুর)" },
  { en: "Lalmonirhat", bn: "Lalmonirhat (লালমনিরহাট)" },
  { en: "Madaripur", bn: "Madaripur (মাদারীপুর)" },
  { en: "Magura", bn: "Magura (মাগুরা)" },
  { en: "Manikganj", bn: "Manikganj (মানিকগঞ্জ)" },
  { en: "Meherpur", bn: "Meherpur (মেহেরপুর)" },
  { en: "Moulvibazar", bn: "Moulvibazar (মৌলভীবাজার)" },
  { en: "Munshiganj", bn: "Munshiganj (মুন্সিগঞ্জ)" },
  { en: "Mymensingh", bn: "Mymensingh (ময়মনসিংহ)" },
  { en: "Naogaon", bn: "Naogaon (নওগাঁ)" },
  { en: "Narail", bn: "Narail (নড়াইল)" },
  { en: "Narayanganj", bn: "Narayanganj (নারায়ণগঞ্জ)" },
  { en: "Narsingdi", bn: "Narsingdi (নরসিংদী)" },
  { en: "Natore", bn: "Natore (নাটোর)" },
  { en: "Netrokona", bn: "Netrokona (নেত্রকোণা)" },
  { en: "Nilphamari", bn: "Nilphamari (নীলফামারী)" },
  { en: "Noakhali", bn: "Noakhali (নোয়াখালী)" },
  { en: "Pabna", bn: "Pabna (পাবনা)" },
  { en: "Panchagarh", bn: "Panchagarh (পঞ্চগড়)" },
  { en: "Patuakhali", bn: "Patuakhali (পটুয়াখালী)" },
  { en: "Pirojpur", bn: "Pirojpur (পিরোজপুর)" },
  { en: "Rajbari", bn: "Rajbari (রাজবাড়ী)" },
  { en: "Rajshahi", bn: "Rajshahi (রাজশাহী)" },
  { en: "Rangamati", bn: "Rangamati (রাঙ্গামাটি)" },
  { en: "Rangpur", bn: "Rangpur (রংপুর)" },
  { en: "Satkhira", bn: "Satkhira (সাতক্ষীরা)" },
  { en: "Shariatpur", bn: "Shariatpur (শরীয়তপুর)" },
  { en: "Sherpur", bn: "Sherpur (শেরপুর)" },
  { en: "Sirajganj", bn: "Sirajganj (সিরাজগঞ্জ)" },
  { en: "Sunamganj", bn: "Sunamganj (সুনামগঞ্জ)" },
  { en: "Sylhet", bn: "Sylhet (সিলেট)" },
  { en: "Tangail", bn: "Tangail (টাঙ্গাইল)" },
  { en: "Thakurgaon", bn: "Thakurgaon (ঠাকুরগাঁও)" }
];

