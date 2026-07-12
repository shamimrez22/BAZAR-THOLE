import { Product, Category, Order, User, Coupon, Banner, Review, StoreSettings } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_COUPONS, INITIAL_BANNERS, INITIAL_REVIEWS, DEFAULT_SETTINGS } from './initialData';
import { collection, doc, setDoc as firestoreSetDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { firestoreDb, OperationType, handleFirestoreError } from "./firebase";

// Recursively strips out undefined properties to prevent Firestore crashes (Unsupported field value: undefined)
export function sanitizeForFirestore<T>(obj: T): T {
  if (obj === undefined) {
    return null as any;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (obj instanceof Date) {
    return obj.toISOString() as any;
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore) as any;
  }
  const sanitized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = (obj as any)[key];
      if (val !== undefined) {
        sanitized[key] = sanitizeForFirestore(val);
      }
    }
  }
  return sanitized;
}

// Wrapper to automatically sanitize all documents written to Firestore
const setDoc = (reference: any, data: any, options?: any) => {
  if (options) {
    return firestoreSetDoc(reference, sanitizeForFirestore(data), options);
  }
  return firestoreSetDoc(reference, sanitizeForFirestore(data));
};

let originalLocalStorage: Storage | null = null;
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    originalLocalStorage = window.localStorage;
  }
} catch (e) {
  console.warn('[BT Database] Cannot access window.localStorage:', e);
}

// Memory storage fallback buffer when localStorage is unavailable (e.g., iOS Safari Private Mode, embedded social app webviews, or restricted cookies)
const memoryStorage: Record<string, string> = {};

const localStorage = {
  getItem(key: string): string | null {
    try {
      if (!originalLocalStorage) return memoryStorage[key] || null;
      return originalLocalStorage.getItem(key);
    } catch (e) {
      console.warn(`[BT Database Warning] localStorage.getItem failed for key "${key}":`, e);
      return memoryStorage[key] || null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      if (!originalLocalStorage) {
        memoryStorage[key] = value;
        return;
      }
      originalLocalStorage.setItem(key, value);
    } catch (e) {
      console.error(`[BT Database Warning] localStorage.setItem failed for key "${key}" (cookie blocked or quota exceeded):`, e);
      memoryStorage[key] = value;
    }
  },
  removeItem(key: string): void {
    try {
      if (!originalLocalStorage) {
        delete memoryStorage[key];
        return;
      }
      originalLocalStorage.removeItem(key);
    } catch (e) {
      delete memoryStorage[key];
    }
  },
  clear(): void {
    try {
      if (originalLocalStorage) {
        originalLocalStorage.clear();
      }
    } catch (e) {
      // ignore
    }
    Object.keys(memoryStorage).forEach(k => delete memoryStorage[k]);
  }
};

// DB keys for localStorage
const KEYS = {
  PRODUCTS: 'bazar_products_v1',
  CATEGORIES: 'bazar_categories_v1',
  ORDERS: 'bazar_orders_v1',
  USERS: 'bazar_users_v1',
  COUPONS: 'bazar_coupons_v1',
  BANNERS: 'bazar_banners_v1',
  REVIEWS: 'bazar_reviews_v1',
  SETTINGS: 'bazar_settings_v1',
  CURRENT_USER: 'bazar_current_user_v1',
};

// Initialize localStorage if empty
export const initDb = () => {
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(KEYS.CATEGORIES)) {
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
  }
  if (!localStorage.getItem(KEYS.ORDERS)) {
    // Start with a couple of nice demo orders
    const demoOrders: Order[] = [
      {
        id: 'ord-101',
        trackingCode: 'BZR-98745',
        customerName: 'Demo Customer',
        email: 'demo@example.com',
        phone: '01700-000000',
        address: 'Appt 4B, Road 4, Sector 11, Uttara',
        city: 'Dhaka',
        items: [
          {
            productId: 'fi-1',
            productName: 'Padma Hilsha Fish (পদ্মার ইলিশ)',
            price: 1450,
            quantity: 1,
            unit: '900g - 1kg (1 piece)',
            image: 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?auto=format&fit=crop&q=80&w=400',
          },
          {
            productId: 'v-1',
            productName: 'Fresh Green Cucumber (শসা)',
            price: 60,
            quantity: 2,
            unit: '1 kg',
            image: 'https://images.unsplash.com/photo-1449339043598-7f5158a4628f?auto=format&fit=crop&q=80&w=400',
          }
        ],
        subtotal: 1570,
        discount: 100,
        deliveryFee: 50,
        total: 1520,
        paymentMethod: 'bKash',
        paymentStatus: 'Paid',
        status: 'Processing',
        orderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      },
      {
        id: 'ord-102',
        trackingCode: 'BZR-34201',
        customerName: 'Jamil Hasan',
        email: 'jamil@gmail.com',
        phone: '01911-223344',
        address: 'House 12, Level 2, Dhanmondi',
        city: 'Dhaka',
        items: [
          {
            productId: 'f-1',
            productName: 'Rajshahi Fazli Mango (ফজলি আম)',
            price: 130,
            quantity: 3,
            unit: '1 kg',
            image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&q=80&w=400',
          }
        ],
        subtotal: 390,
        discount: 0,
        deliveryFee: 50,
        total: 440,
        paymentMethod: 'Cash on Delivery',
        paymentStatus: 'Pending',
        status: 'Pending',
        orderDate: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4h ago
      }
    ];
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(demoOrders));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    // Initial users
    const defaultUsers: User[] = [
      {
        id: 'usr-1',
        email: 'demo@example.com',
        name: 'Demo Customer',
        phone: '01700-000000',
        address: 'Appt 4B, Road 4, Sector 11, Uttara',
        city: 'Dhaka',
        registeredDate: '2026-06-01T12:00:00Z',
        status: 'Active',
      },
      {
        id: 'usr-2',
        email: 'jamil@gmail.com',
        name: 'Jamil Hasan',
        phone: '01911-223344',
        address: 'House 12, Level 2, Dhanmondi',
        city: 'Dhaka',
        registeredDate: '2026-06-05T14:30:00Z',
        status: 'Active',
      }
    ];
    localStorage.setItem(KEYS.USERS, JSON.stringify(defaultUsers));
  }
  if (!localStorage.getItem(KEYS.COUPONS)) {
    localStorage.setItem(KEYS.COUPONS, JSON.stringify(INITIAL_COUPONS));
  }
  if (!localStorage.getItem(KEYS.BANNERS)) {
    localStorage.setItem(KEYS.BANNERS, JSON.stringify(INITIAL_BANNERS));
  }
  if (!localStorage.getItem(KEYS.REVIEWS)) {
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
  }
  if (!localStorage.getItem(KEYS.SETTINGS)) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
  }
};

// Local storage helper operations
export const db = {
  // PRODUCTS
  getProducts(): Product[] {
    initDb();
    return JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]');
  },
  saveProduct(product: Product): Product[] {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index >= 0) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));

    setDoc(doc(firestoreDb, "products", product.id), product)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `products/${product.id}`));

    return products;
  },
  deleteProduct(id: string): Product[] {
    const products = this.getProducts().filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));

    deleteDoc(doc(firestoreDb, "products", id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `products/${id}`));

    return products;
  },
  updateStock(id: string, newStock: number) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index >= 0) {
      products[index].stock = Math.max(0, newStock);
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));

      const product = products[index];
      setDoc(doc(firestoreDb, "products", id), product)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `products/${id}`));
    }
  },

  // CATEGORIES
  getCategories(): Category[] {
    initDb();
    return JSON.parse(localStorage.getItem(KEYS.CATEGORIES) || '[]');
  },
  saveCategory(category: Category): Category[] {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.slug === category.slug);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));

    setDoc(doc(firestoreDb, "categories", category.slug), category)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `categories/${category.slug}`));

    return categories;
  },
  deleteCategory(slug: string): Category[] {
    const categories = this.getCategories().filter(c => c.slug !== slug);
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));

    deleteDoc(doc(firestoreDb, "categories", slug))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `categories/${slug}`));

    return categories;
  },

  // ORDERS
  getOrders(): Order[] {
    initDb();
    return JSON.parse(localStorage.getItem(KEYS.ORDERS) || '[]');
  },
  addOrder(order: Omit<Order, 'id' | 'trackingCode' | 'orderDate'>): Order {
    const orders = this.getOrders();
    const id = `ord-${Math.floor(100 + Math.random() * 900)}`;
    const trackingCode = `BZR-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      ...order,
      id,
      trackingCode,
      orderDate: new Date().toISOString(),
    };
    orders.unshift(newOrder); // Newest first
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

    // Dedup inventory items based on checkout
    order.items.forEach(item => {
      const products = this.getProducts();
      const matchIdx = products.findIndex(p => p.id === item.productId);
      if (matchIdx >= 0) {
        products[matchIdx].stock = Math.max(0, products[matchIdx].stock - item.quantity);
        localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));

        // Sync stock update to Firestore
        setDoc(doc(firestoreDb, "products", item.productId), products[matchIdx])
          .catch(err => handleFirestoreError(err, OperationType.WRITE, `products/${item.productId}`));
      }
    });

    setDoc(doc(firestoreDb, "orders", id), newOrder)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `orders/${id}`));

    return newOrder;
  },
  updateOrderStatus(orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Order[] {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index >= 0) {
      orders[index].status = status;
      if (paymentStatus) {
        orders[index].paymentStatus = paymentStatus;
      }
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

      const order = orders[index];
      setDoc(doc(firestoreDb, "orders", orderId), order)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `orders/${orderId}`));
    }
    return orders;
  },
  deleteOrder(orderId: string): Order[] {
    const orders = this.getOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(filtered));

    deleteDoc(doc(firestoreDb, "orders", orderId))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`));

    return filtered;
  },
  updateOrder(updatedOrder: Order): Order[] {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === updatedOrder.id);
    if (index >= 0) {
      orders[index] = updatedOrder;
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));

      setDoc(doc(firestoreDb, "orders", updatedOrder.id), updatedOrder)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `orders/${updatedOrder.id}`));
    }
    return orders;
  },

  // USERS
  getUsers(): User[] {
    initDb();
    const users: User[] = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    // Guarantee demo@example.com exists in list for seamless user testing
    const hasDemo = users.some(u => u.email.toLowerCase() === 'demo@example.com');
    if (!hasDemo) {
      const demoUser: User = {
        id: 'usr-demo-custom',
        email: 'demo@example.com',
        name: 'Demo Customer',
        phone: '01700-000000',
        address: 'Appt 4B, Road 4, Sector 11, Uttara',
        city: 'Dhaka',
        registeredDate: new Date().toISOString(),
        status: 'Active'
      };
      users.push(demoUser);
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));

      setDoc(doc(firestoreDb, "users", demoUser.id), demoUser)
        .catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${demoUser.id}`));
    }
    return users;
  },
  saveUser(user: User): User[] {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    let targetUser = user;
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
      targetUser = users[index];
    } else {
      users.push(user);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));

    setDoc(doc(firestoreDb, "users", targetUser.id), targetUser)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${targetUser.id}`));

    return users;
  },
  getCurrentUser(): User | null {
    const data = localStorage.getItem(KEYS.CURRENT_USER);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },
  setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
      this.saveUser(user); // Sync inside list
    } else {
      localStorage.removeItem(KEYS.CURRENT_USER);
    }
  },

  // COUPONS
  getCoupons(): Coupon[] {
    initDb();
    return JSON.parse(localStorage.getItem(KEYS.COUPONS) || '[]');
  },
  saveCoupon(coupon: Coupon): Coupon[] {
    const coupons = this.getCoupons();
    const index = coupons.findIndex(c => c.id === coupon.id);
    if (index >= 0) {
      coupons[index] = coupon;
    } else {
      coupons.push(coupon);
    }
    localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons));

    setDoc(doc(firestoreDb, "coupons", coupon.id), coupon)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `coupons/${coupon.id}`));

    return coupons;
  },
  deleteCoupon(id: string): Coupon[] {
    const coupons = this.getCoupons().filter(c => c.id !== id);
    localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons));

    deleteDoc(doc(firestoreDb, "coupons", id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `coupons/${id}`));

    return coupons;
  },

  // BANNERS
  getBanners(): Banner[] {
    initDb();
    return JSON.parse(localStorage.getItem(KEYS.BANNERS) || '[]');
  },
  saveBanner(banner: Banner): Banner[] {
    const banners = this.getBanners();
    const index = banners.findIndex(b => b.id === banner.id);
    if (index >= 0) {
      banners[index] = banner;
    } else {
      banners.push(banner);
    }
    localStorage.setItem(KEYS.BANNERS, JSON.stringify(banners));

    setDoc(doc(firestoreDb, "banners", banner.id), banner)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `banners/${banner.id}`));

    return banners;
  },
  deleteBanner(id: string): Banner[] {
    const banners = this.getBanners().filter(b => b.id !== id);
    localStorage.setItem(KEYS.BANNERS, JSON.stringify(banners));

    deleteDoc(doc(firestoreDb, "banners", id))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `banners/${id}`));

    return banners;
  },

  // REVIEWS
  getReviews(): Review[] {
    initDb();
    return JSON.parse(localStorage.getItem(KEYS.REVIEWS) || '[]');
  },
  addReview(review: Review): Review[] {
    const reviews = this.getReviews();
    reviews.unshift(review);
    localStorage.setItem(KEYS.REVIEWS, JSON.stringify(reviews));

    setDoc(doc(firestoreDb, "reviews", review.id), review)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `reviews/${review.id}`));

    return reviews;
  },

  // SETTINGS
  getSettings(): StoreSettings {
    initDb();
    const stored = localStorage.getItem(KEYS.SETTINGS);
    if (!stored) return { ...DEFAULT_SETTINGS };
    try {
      const parsed = JSON.parse(stored);
      // Automatically sanitize and migrate any older/interim branding variants to BAZAR THOLE
      let changed = false;
      if (parsed && (!parsed.storeName || parsed.storeName.trim() === '' || parsed.storeName === 'BAZAR' || parsed.storeName === 'Bazar' || parsed.storeName.toUpperCase().includes('E-COMMERCE') || parsed.storeName.toUpperCase() === 'BAZAR DHAKA')) {
        parsed.storeName = 'BAZAR THOLE';
        changed = true;
      }
      // Ensure credentials exist, default to SHAMIM / 321 if completely missing
      if (parsed && (!parsed.adminUsername || !parsed.adminPassword)) {
        if (!parsed.adminUsername) parsed.adminUsername = 'SHAMIM';
        if (!parsed.adminPassword) parsed.adminPassword = '321';
        changed = true;
      }
      // Fill fallback values only if they are completely missing (undefined) so we do not override false/disabled states
      if (parsed) {
        if (parsed.enableTopNotice === undefined) {
          parsed.enableTopNotice = true;
          changed = true;
        }
        if (!parsed.topNoticeText || parsed.topNoticeText.trim() === '') {
          parsed.topNoticeText = DEFAULT_SETTINGS.topNoticeText;
          changed = true;
        }
        if (parsed.enableBottomNotice === undefined) {
          parsed.enableBottomNotice = true;
          changed = true;
        }
        if (!parsed.bottomNoticeText || parsed.bottomNoticeText.trim() === '') {
          parsed.bottomNoticeText = DEFAULT_SETTINGS.bottomNoticeText;
          changed = true;
        }
      }
      if (changed) {
        localStorage.setItem(KEYS.SETTINGS, JSON.stringify(parsed));
      }
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return { ...DEFAULT_SETTINGS };
    }
  },
  saveSettings(settings: StoreSettings): StoreSettings {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    // Asynchronously update the server settings so all other devices are synced
    fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    }).catch(err => console.error('Failed to update server settings:', err));

    setDoc(doc(firestoreDb, "settings", "store_config"), settings)
      .catch(err => handleFirestoreError(err, OperationType.WRITE, `settings/store_config`));

    return settings;
  }
};

// Real-time synchronization module with Firestore
export const syncWithFirestore = (onUpdate: () => void) => {
  // Products listener
  onSnapshot(collection(firestoreDb, "products"), (snapshot) => {
    if (snapshot.empty) {
      // Seed initial products from local storage
      const items = db.getProducts();
      items.forEach(item => {
        setDoc(doc(firestoreDb, "products", item.id), item)
          .catch(err => console.error("Products seed failed:", err));
      });
    } else {
      const items: Product[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as Product);
      });
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(items));
      onUpdate();
    }
  }, (error) => {
    console.error("Products live sync failed:", error);
  });

  // Categories listener
  onSnapshot(collection(firestoreDb, "categories"), (snapshot) => {
    if (snapshot.empty) {
      const items = db.getCategories();
      items.forEach(item => {
        setDoc(doc(firestoreDb, "categories", item.slug), item)
          .catch(err => console.error("Categories seed failed:", err));
      });
    } else {
      const items: Category[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as Category);
      });
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(items));
      onUpdate();
    }
  }, (error) => {
    console.error("Categories live sync failed:", error);
  });

  // Orders listener
  onSnapshot(collection(firestoreDb, "orders"), (snapshot) => {
    if (snapshot.empty) {
      const items = db.getOrders();
      items.forEach(item => {
        setDoc(doc(firestoreDb, "orders", item.id), item)
          .catch(err => console.error("Orders seed failed:", err));
      });
    } else {
      const items: Order[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as Order);
      });
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(items));
      onUpdate();
    }
  }, (error) => {
    console.error("Orders live sync failed:", error);
  });

  // Users listener
  onSnapshot(collection(firestoreDb, "users"), (snapshot) => {
    if (snapshot.empty) {
      const items = db.getUsers();
      items.forEach(item => {
        setDoc(doc(firestoreDb, "users", item.id), item)
          .catch(err => console.error("Users seed failed:", err));
      });
    } else {
      const items: User[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as User);
      });
      localStorage.setItem(KEYS.USERS, JSON.stringify(items));
      onUpdate();
    }
  }, (error) => {
    console.error("Users live sync failed:", error);
  });

  // Coupons listener
  onSnapshot(collection(firestoreDb, "coupons"), (snapshot) => {
    if (snapshot.empty) {
      const items = db.getCoupons();
      items.forEach(item => {
        setDoc(doc(firestoreDb, "coupons", item.id), item)
          .catch(err => console.error("Coupons seed failed:", err));
      });
    } else {
      const items: Coupon[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as Coupon);
      });
      localStorage.setItem(KEYS.COUPONS, JSON.stringify(items));
      onUpdate();
    }
  }, (error) => {
    console.error("Coupons live sync failed:", error);
  });

  // Banners listener
  onSnapshot(collection(firestoreDb, "banners"), (snapshot) => {
    if (snapshot.empty) {
      const items = db.getBanners();
      items.forEach(item => {
        setDoc(doc(firestoreDb, "banners", item.id), item)
          .catch(err => console.error("Banners seed failed:", err));
      });
    } else {
      const items: Banner[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as Banner);
      });
      localStorage.setItem(KEYS.BANNERS, JSON.stringify(items));
      onUpdate();
    }
  }, (error) => {
    console.error("Banners live sync failed:", error);
  });

  // Reviews listener
  onSnapshot(collection(firestoreDb, "reviews"), (snapshot) => {
    if (snapshot.empty) {
      const items = db.getReviews();
      items.forEach(item => {
        setDoc(doc(firestoreDb, "reviews", item.id), item)
          .catch(err => console.error("Reviews seed failed:", err));
      });
    } else {
      const items: Review[] = [];
      snapshot.forEach(doc => {
        items.push(doc.data() as Review);
      });
      localStorage.setItem(KEYS.REVIEWS, JSON.stringify(items));
      onUpdate();
    }
  }, (error) => {
    console.error("Reviews live sync failed:", error);
  });

  // Settings listener
  onSnapshot(doc(firestoreDb, "settings", "store_config"), (snapshot) => {
    if (!snapshot.exists()) {
      const config = db.getSettings();
      setDoc(doc(firestoreDb, "settings", "store_config"), config)
        .catch(err => console.error("Settings seed failed:", err));
    } else {
      const config = snapshot.data() as StoreSettings;
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(config));
      onUpdate();
    }
  }, (error) => {
    console.error("Settings live sync failed:", error);
  });
};
