import { Product, Category, Order, User, Coupon, Banner, Review, StoreSettings } from '../types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_COUPONS, INITIAL_BANNERS, INITIAL_REVIEWS, DEFAULT_SETTINGS } from './initialData';

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
        customerName: 'Shamim Reza',
        email: 'shamimrez22@gmail.com',
        phone: '01712-345678',
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
        email: 'shamimrez22@gmail.com',
        name: 'Shamim Reza',
        phone: '01712-345678',
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
    return products;
  },
  deleteProduct(id: string): Product[] {
    const products = this.getProducts().filter(p => p.id !== id);
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
    return products;
  },
  updateStock(id: string, newStock: number) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index >= 0) {
      products[index].stock = Math.max(0, newStock);
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
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
    return categories;
  },
  deleteCategory(slug: string): Category[] {
    const categories = this.getCategories().filter(c => c.slug !== slug);
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
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
      }
    });

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
    }
    return orders;
  },
  deleteOrder(orderId: string): Order[] {
    const orders = this.getOrders();
    const filtered = orders.filter(o => o.id !== orderId);
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(filtered));
    return filtered;
  },
  updateOrder(updatedOrder: Order): Order[] {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === updatedOrder.id);
    if (index >= 0) {
      orders[index] = updatedOrder;
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
    }
    return orders;
  },

  // USERS
  getUsers(): User[] {
    initDb();
    return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  },
  saveUser(user: User): User[] {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
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
    return coupons;
  },
  deleteCoupon(id: string): Coupon[] {
    const coupons = this.getCoupons().filter(c => c.id !== id);
    localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons));
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
    return banners;
  },
  deleteBanner(id: string): Banner[] {
    const banners = this.getBanners().filter(b => b.id !== id);
    localStorage.setItem(KEYS.BANNERS, JSON.stringify(banners));
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
    return reviews;
  },

  // SETTINGS
  getSettings(): StoreSettings {
    initDb();
    return JSON.parse(localStorage.getItem(KEYS.SETTINGS) || JSON.stringify(DEFAULT_SETTINGS));
  },
  saveSettings(settings: StoreSettings): StoreSettings {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }
};
