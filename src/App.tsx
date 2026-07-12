import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, ShoppingCart, User, Heart, ChevronLeft, ChevronRight, Truck, Info, PhoneCall, 
  MapPin, Clock, Calendar, Star, Send, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, 
  Plus, Minus, Trash2, Tag, Copy, HelpCircle, Eye, LogOut, Lock, Map, RefreshCw, Mail, X,
  ChevronDown, SlidersHorizontal, TrendingUp, Zap, Printer
} from 'lucide-react';
import { Product, Category, Order, User as ProfileUser, Coupon, Banner, Review, StoreSettings, CartItem, BANGLADESH_DISTRICTS } from './types';
import { db, initDb, syncWithFirestore } from './data/mockDb';
import Header from './components/Header';
import Footer from './components/Footer';
import PayProcess from './components/PayProcess';
import AdminPanel from './components/AdminPanel';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface AdSlotProps {
  scriptHtml?: string;
  className?: string;
}

export const AdSlotContainer: React.FC<AdSlotProps> = ({ scriptHtml, className }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    if (!scriptHtml) return;

    // Use a non-blocking macro-task delay to allow critical React render and layout to complete first
    const timer = setTimeout(() => {
      try {
        if (!containerRef.current) return;
        const fragment = document.createRange().createContextualFragment(scriptHtml);
        
        // Ensure any newly injected script elements are asynchronous and don't block mobile internet threads
        const scripts = fragment.querySelectorAll('script');
        scripts.forEach((script) => {
          if (script.src) {
            script.async = true;
            script.defer = true;
          }
        });
        
        containerRef.current.appendChild(fragment);
      } catch (err) {
        console.error('Error inserting ad script:', err);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [scriptHtml]);

  return <div ref={containerRef} className={className} />;
};

export const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  e.currentTarget.onerror = null;
  e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50' y='52' font-family='system-ui, sans-serif' font-size='8' font-weight='600' fill='%2300796B' text-anchor='middle'%3EBAZAR THOLE%3C/text%3E%3C/svg%3E";
};

export default function App() {
  // Navigation State: 'home', 'shop', 'tracking', 'about', 'contact', 'account', 'login', 'register', 'checkout'
  const [activeTab, setActiveTab] = useState<string>('home');
  
  // App-wide DB States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(() => {
    const s = db.getSettings();
    if (s && s.storeName && (s.storeName.toUpperCase().includes('E-COMMERCE') || s.storeName.toUpperCase() === 'BAZAR' || s.storeName.toUpperCase() === 'BAZAR DHAKA')) {
      s.storeName = 'BAZAR THOLE';
    }
    return s;
  });
  const [currentUser, setCurrentUser] = useState<ProfileUser | null>(null);

  // Home Screen active state slider index
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [isSliderHovered, setIsSliderHovered] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>(() => {
    const s = db.getSettings();
    return {
      hours: s?.specialOfferHours !== undefined ? s.specialOfferHours : 4,
      minutes: s?.specialOfferMinutes !== undefined ? s.specialOfferMinutes : 45,
      seconds: 12
    };
  });

  // Shop filters category selection slug
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [priceRange, setPriceRange] = useState<number>(1800);
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(false);
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);
  const [visibleShopProducts, setVisibleShopProducts] = useState<number>(20);

  // Product detailed modal state
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [detailQuantity, setDetailQuantity] = useState<number>(1);
  const [detailProductSize, setDetailProductSize] = useState<string | undefined>(undefined);

  // E-commerce Cart & Wishlist state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // Coupon promo applied state
  const [enteredCoupon, setEnteredCoupon] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string>('');

  // Checkout billing address parameters
  const [billingName, setBillingName] = useState<string>('');
  const [billingPhone, setBillingPhone] = useState<string>('');
  const [billingEmail, setBillingEmail] = useState<string>('');
  const [billingCity, setBillingCity] = useState<string>('Dhaka');
  const [billingAddress, setBillingAddress] = useState<string>('');
  const [billingErrors, setBillingErrors] = useState<{ name?: string; phone?: string; address?: string }>({});
  const [paymentOption, setPaymentOption] = useState<'Cash on Delivery' | 'bKash' | 'Nagad' | 'SSLCommerz'>('Cash on Delivery');
  
  // Auto-fallback if the currently selected paymentOption is disabled from Admin Panel settings
  useEffect(() => {
    const activeMethods = [
      { id: 'Cash on Delivery', enabled: settings.enableCOD !== false },
      { id: 'bKash', enabled: settings.enableBkash !== false },
      { id: 'Nagad', enabled: settings.enableNagad !== false },
      { id: 'SSLCommerz', enabled: settings.enableSSLCommerz !== false }
    ].filter(m => m.enabled);
    
    if (activeMethods.length > 0 && !activeMethods.some(m => m.id === paymentOption)) {
      setPaymentOption(activeMethods[0].id as any);
    }
  }, [settings.enableCOD, settings.enableBkash, settings.enableNagad, settings.enableSSLCommerz, paymentOption]);
  
  // Payment simulator visual display
  const [paySimulator, setPaySimulator] = useState<{ active: boolean; method: typeof paymentOption; amount: number } | null>(null);
  const [latestPlacedOrder, setLatestPlacedOrder] = useState<Order | null>(null);
  const [showThankYouPopup, setShowThankYouPopup] = useState<boolean>(false);
  const [successCountdown, setSuccessCountdown] = useState<number>(10);

  // Order tracking page search parameters
  const [trackCodeInput, setTrackCodeInput] = useState<string>('');
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [trackSearchError, setTrackSearchError] = useState<boolean>(false);

  // Client feedback contact page
  const [contactFormName, setContactFormName] = useState<string>('');
  const [contactFormEmail, setContactFormEmail] = useState<string>('');
  const [contactFormMessage, setContactFormMessage] = useState<string>('');
  const [contactSubmitSuccess, setContactSubmitSuccess] = useState<boolean>(false);

  // Login page inputs
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Register page inputs
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regAddress, setRegAddress] = useState<string>('');
  const [regCity, setRegCity] = useState<string>('Dhaka');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regSuccess, setRegSuccess] = useState<boolean>(false);

  // Global admin override modal view
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Toast Notifications inside app
  const [toastMessage, setToastMessage] = useState<string>('');

  // Ref for Categories horizontal slider
  const categoriesContainerRef = React.useRef<HTMLDivElement>(null);

  // Fetch settings from server
  const fetchServerSettings = async (forceUpdateState = false) => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const serverSettings = await res.json();
        if (serverSettings && serverSettings.storeName) {
          // If the store name needs migration
          if (serverSettings.storeName.toUpperCase().includes('E-COMMERCE') || serverSettings.storeName.toUpperCase() === 'BAZAR' || serverSettings.storeName.toUpperCase() === 'BAZAR DHAKA') {
            serverSettings.storeName = 'BAZAR THOLE';
          }
          
          // Save to localStorage so it is available synchronously on subsequent reloads
          window.localStorage?.setItem('bazar_settings_v1', JSON.stringify(serverSettings));
          
          // Only update React state if there is a real difference or if forceUpdateState is true
          setSettings((current) => {
            const hasChanged = 
              !current ||
              current.enableTopNotice !== serverSettings.enableTopNotice ||
              current.topNoticeText !== serverSettings.topNoticeText ||
              current.enableBottomNotice !== serverSettings.enableBottomNotice ||
              current.bottomNoticeText !== serverSettings.bottomNoticeText ||
              current.storeName !== serverSettings.storeName ||
              current.deliveryFee !== serverSettings.deliveryFee ||
              current.freeDeliveryThreshold !== serverSettings.freeDeliveryThreshold;

            if (forceUpdateState || hasChanged) {
              return serverSettings;
            }
            return current;
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch store settings from server:', err);
    }
  };

  // Initial Seed loading and Firestore synchronization
  useEffect(() => {
    initDb();
    loadAllDbValues();
    
    // Start real-time Firestore synchronization
    syncWithFirestore(loadAllDbValues);
    
    // Auto sync current user sessions if recorded
    const savedUser = db.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
      // Pre-populate billing coordinates
      setBillingName(savedUser.name);
      setBillingPhone(savedUser.phone);
      setBillingEmail(savedUser.email);
      setBillingAddress(savedUser.address);
      setBillingCity(savedUser.city);
    }
  }, []);

  // Reset visible products pagination count to protect memory on filter shifts
  useEffect(() => {
    setVisibleShopProducts(20);
  }, [selectedCategory, searchFilter, priceRange, onlyDiscounted, activeTab]);

  // Scroll to top of the page on any tab/page change
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (e) {
      window.scrollTo(0, 0);
    }
  }, [activeTab]);

  // Adjust detailed visual selection defaults
  useEffect(() => {
    if (detailProduct) {
      setDetailQuantity(1);
      setDetailProductSize(detailProduct.sizes && detailProduct.sizes.length > 0 ? detailProduct.sizes[0] : undefined);
    } else {
      setDetailProductSize(undefined);
    }
  }, [detailProduct]);

  // Success screen redirection timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (showThankYouPopup && latestPlacedOrder) {
      setSuccessCountdown(10);
      interval = setInterval(() => {
        setSuccessCountdown(p => {
          if (p <= 1) {
            clearInterval(interval);
            setShowThankYouPopup(false);
            setLatestPlacedOrder(null);
            setActiveTab('home');
            return 10;
          }
          return p - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showThankYouPopup, latestPlacedOrder]);

  // Home Page Slider Autoplay Loop
  useEffect(() => {
    if (banners.length <= 1 || isSliderHovered) return;
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [banners.length, isSliderHovered]);

  // Home Page Categories Autoplay Loop (Slides items to the left dynamically)
  useEffect(() => {
    let scrollInterval: NodeJS.Timeout;
    if (categories.length > 0) {
      scrollInterval = setInterval(() => {
        const el = categoriesContainerRef.current;
        if (!el) return;
        const maxScroll = el.scrollWidth - el.clientWidth;
        if (el.scrollLeft >= maxScroll - 10) {
          el.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          el.scrollBy({ left: 160, behavior: 'smooth' });
        }
      }, 3000);
    }
    return () => {
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [categories]);

  // Flash Sale Live countdown timer logic
  useEffect(() => {
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset countdown loop back to the configured set duration when finished to stay hot & alive
          return {
            hours: settings?.specialOfferHours !== undefined ? settings.specialOfferHours : 5,
            minutes: settings?.specialOfferMinutes !== undefined ? settings.specialOfferMinutes : 59,
            seconds: 59
          };
        }
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [settings?.specialOfferHours, settings?.specialOfferMinutes]);

  // Adsterra/Global Header and Popunder Script Dynamic Execution Hook
  useEffect(() => {
    if (!settings.enableAds || !settings.adsterraHeaderScript) {
      const existing = document.getElementById('adsterra-global-header-container');
      if (existing) existing.remove();
      return;
    }

    // Delay script injection on a robust timeout so that the entire DOM paints first
    const safeTimer = setTimeout(() => {
      try {
        let container = document.getElementById('adsterra-global-header-container');
        if (!container) {
          container = document.createElement('div');
          container.id = 'adsterra-global-header-container';
          document.body.appendChild(container);
        }
        container.innerHTML = '';
        
        const fragment = document.createRange().createContextualFragment(settings.adsterraHeaderScript);
        
        // Force asynchronous flag on any script source tags to prevent blocking on network timeouts
        const scripts = fragment.querySelectorAll('script');
        scripts.forEach((script) => {
          if (script.src) {
            script.async = true;
            script.defer = true;
          }
        });
        
        container.appendChild(fragment);
      } catch (err) {
        console.error('Failed to inject global header ad script:', err);
      }
    }, 1800); // 1.8 seconds timeout guarantees absolute client side load complete

    return () => clearTimeout(safeTimer);
  }, [settings.enableAds, settings.adsterraHeaderScript]);

  const loadAllDbValues = () => {
    setProducts(db.getProducts());
    setCategories(db.getCategories());
    setCoupons(db.getCoupons());
    setBanners(db.getBanners());
    setReviews(db.getReviews());
    const s = db.getSettings();
    if (s && s.storeName && (s.storeName.toUpperCase().includes('E-COMMERCE') || s.storeName.toUpperCase() === 'BAZAR' || s.storeName.toUpperCase() === 'BAZAR DHAKA')) {
      s.storeName = 'BAZAR THOLE';
    }
    setSettings(s);
    if (s) {
      setTimeLeft({
        hours: s.specialOfferHours !== undefined ? s.specialOfferHours : 4,
        minutes: s.specialOfferMinutes !== undefined ? s.specialOfferMinutes : 45,
        seconds: 0
      });
    }
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number = 1, selectedSize?: string) => {
    if (product.stock <= 0) {
      triggerToast('⚠️ Sorry, this item is out of stock!');
      return;
    }

    const sizeString = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);

    const currentInCart = cart.find(item => item.product.id === product.id && item.selectedSize === sizeString);
    const existingQty = currentInCart ? currentInCart.quantity : 0;

    if (existingQty + quantity > product.stock) {
      triggerToast(`⚠️ Stock Limit Reached: Only ${product.stock} items left in store.`);
      return;
    }

    setCart(prevCart => {
      const matchIdx = prevCart.findIndex(item => item.product.id === product.id && item.selectedSize === sizeString);
      if (matchIdx >= 0) {
        const updated = [...prevCart];
        updated[matchIdx].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product, quantity, selectedSize: sizeString }];
      }
    });

    triggerToast(`🛒 Succeeded: Sourced ${quantity} x ${product.name} ${sizeString ? `(${sizeString})` : ''} to your basket!`);
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    const matchedProduct = products.find(p => p.id === productId);
    if (!matchedProduct) return;

    setCart(prevCart => {
      const matchIdx = prevCart.findIndex(item => item.product.id === productId);
      if (matchIdx < 0) return prevCart;

      const currentQty = prevCart[matchIdx].quantity;
      const targetQty = currentQty + delta;

      if (targetQty <= 0) {
        return prevCart.filter(item => item.product.id !== productId);
      }

      if (targetQty > matchedProduct.stock) {
        triggerToast(`⚠️ Limit Reached: Maximum available stock of this item is ${matchedProduct.stock}.`);
        return prevCart;
      }

      const updated = [...prevCart];
      updated[matchIdx].quantity = targetQty;
      return updated;
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    triggerToast('🛒 Item removed from active cart.');
  };

  // Wishlist toggle helper
  const handleToggleWishlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setWishlist(prev => {
      if (prev.includes(id)) {
        triggerToast('🤍 Item removed from my wishlist.');
        return prev.filter(item => item !== id);
      } else {
        triggerToast('💖 Added to my wishlist!');
        return [...prev, id];
      }
    });
  };

  // Checkout Direct Buy Now Shortcut
  const handleDirectBuyNow = (product: Product, quantity: number = 1, selectedSize?: string) => {
    if (product.affiliateUrl) {
      window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
      triggerToast('🚀 Redirecting to official store affiliate link...');
      return;
    }
    if (product.stock <= 0) {
      triggerToast('⚠️ Sorry, this item is out of stock!');
      return;
    }
    const sizeString = selectedSize || (product.sizes && product.sizes.length > 0 ? product.sizes[0] : undefined);
    // Clear and put single item in cart with correct size
    setCart([{ product, quantity, selectedSize: sizeString }]);
    setActiveTab('checkout');
    setIsCartOpen(false);
  };

  // Coupon validation logic
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const matchedCode = coupons.find(c => c.code.toLowerCase() === enteredCoupon.trim().toLowerCase());
    
    if (!matchedCode) {
      setCouponError('Invalid voucher code. Please try BAZAR15 or EIDMUBARAK.');
      setAppliedCoupon(null);
      return;
    }

    if (!matchedCode.active) {
      setCouponError('This voucher code is currently inactive.');
      setAppliedCoupon(null);
      return;
    }

    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

    if (subtotal < matchedCode.minSpend) {
      setCouponError(`Min purchase limit not reached! Spend ৳ ${matchedCode.minSpend} to secure discount.`);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon(matchedCode);
    triggerToast(`🎉 Promo Saved! Enjoy ${matchedCode.discountPercent}% flat discount list!`);
  };

  // Checkout submission
  const handleCheckoutSubmit = (e?: any) => {
    if (e) {
      try {
        e.preventDefault();
        e.stopPropagation();
      } catch (err) {
        console.warn('Event preventDefault/stopPropagation omitted:', err);
      }
    }

    console.log('[Checkout] Placing secure order with details:', {
      name: billingName,
      phone: billingPhone,
      city: billingCity,
      address: billingAddress,
      paymentOption,
      cartCount: cart.length
    });

    // Explicit client-side JS validation to bypass native hidden iframe blocking
    const errors: { name?: string; phone?: string; address?: string } = {};
    if (!billingName || !billingName.trim()) {
      errors.name = 'দয়া করে আপনার সম্পূর্ণ নাম লিখুন (Please enter your recipient name)';
    }
    if (!billingPhone || !billingPhone.trim()) {
      errors.phone = 'দয়া করে আপনার সঠিক মোবাইল নম্বর দিন (Please enter your mobile number)';
    } else {
      const cleanPhone = billingPhone.trim();
      if (cleanPhone.length < 11) {
        errors.phone = 'মোবাইল নম্বরটি অবশ্যই ১১ ডিজিটের হতে হবে (Must be a valid 11-digit mobile number)';
      }
    }
    if (!billingAddress || !billingAddress.trim()) {
      errors.address = 'দয়া করে আপনার বিস্তারিত ডেলিভারি ঠিকানা দিন (Please enter your shipping address)';
    }

    if (Object.keys(errors).length > 0) {
      setBillingErrors(errors);
      triggerToast('⚠️ দয়া করে ফর্মের লাল চিহ্নিত ঘরগুলো সঠিকভাবে পূরণ করুন।');
      return;
    }

    setBillingErrors({});

    if (cart.length === 0) {
      triggerToast('⚠️ আপনার কার্টটি খালি! অনুগ্রহ করে কিছু পণ্য যোগ করুন।');
      return;
    }

    try {
      const subtotal = cart.reduce((acc, item) => acc + (item.product?.price || 0) * (item.quantity || 1), 0);
      const discountVal = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercent) / 100) : 0;
      const baseFee = subtotal >= (settings?.freeDeliveryThreshold ?? 800) ? 0 : (settings?.deliveryFee ?? 50);
      const productDeliveryFees = cart.reduce((acc, item) => acc + (item.product?.deliveryFee || 0) * (item.quantity || 1), 0);
      const totalDeliveryFee = baseFee + productDeliveryFees;
      const finalAmount = subtotal - discountVal + totalDeliveryFee;

      const orderMeta = {
        customerName: billingName.trim(),
        email: billingEmail || 'guest@bazar.com.bd',
        phone: billingPhone.trim(),
        address: billingAddress.trim(),
        city: billingCity,
        items: cart.map(item => ({
          productId: item.product?.id || 'unknown',
          productName: item.product?.name || 'Sourced Product',
          price: item.product?.price || 0,
          quantity: item.quantity || 1,
          unit: item.product?.unit || 'pcs',
          image: item.product?.image || '',
          selectedSize: item.selectedSize || (item.product?.sizes && item.product.sizes.length > 0 ? item.product.sizes[0] : undefined)
        })),
        subtotal,
        discount: discountVal,
        deliveryFee: totalDeliveryFee,
        total: finalAmount,
        paymentMethod: paymentOption,
        paymentStatus: paymentOption === 'Cash on Delivery' ? 'Pending' as const : 'Paid' as const,
        status: 'Pending' as const,
      };

      console.log('[Checkout] Saving order schema metadata:', orderMeta);

      const placed = db.addOrder(orderMeta);
      console.log('[Checkout] Order added successfully:', placed);

      setLatestPlacedOrder(placed);
      setCart([]); // Clear cart
      setAppliedCoupon(null);
      setEnteredCoupon('');
      setPaySimulator(null);
      
      // Direct thank you popup trigger!
      setShowThankYouPopup(true);
      
      // Switch background tab to home so closing the modal places them on home
      setActiveTab('home');
      
      loadAllDbValues(); // refresh stocks state
      triggerToast(`🎉 আলহামদুলিল্লাহ! আপনার অর্ডারটি #${placed.id} সফলভাবে সম্পন্ন হয়েছে।`);
    } catch (dbErr: any) {
      console.error('[Checkout Critical Error] Failed to place order:', dbErr);
      alert(`অর্ডারটি সম্পন্ন করতে সমস্যা হয়েছে: ${dbErr?.message || dbErr}`);
    }
  };

  // Payment simulator success handler
  const handlePaymentSuccess = (transactionId: string) => {
    const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const discountVal = appliedCoupon ? Math.round((subtotal * appliedCoupon.discountPercent) / 100) : 0;
    const baseFee = subtotal >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee;
    const productDeliveryFees = cart.reduce((acc, item) => acc + (item.product.deliveryFee || 0) * item.quantity, 0);
    const totalDeliveryFee = baseFee + productDeliveryFees;
    const finalAmount = subtotal - discountVal + totalDeliveryFee;

    const orderMeta = {
      customerName: billingName,
      email: billingEmail || 'guest@bazar.com.bd',
      phone: billingPhone,
      address: billingAddress,
      city: billingCity,
      items: cart.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        unit: item.product.unit,
        image: item.product.image,
        selectedSize: item.selectedSize || (item.product.sizes && item.product.sizes.length > 0 ? item.product.sizes[0] : undefined)
      })),
      subtotal,
      discount: discountVal,
      deliveryFee: totalDeliveryFee,
      total: finalAmount,
      paymentMethod: paymentOption,
      paymentStatus: paymentOption === 'Cash on Delivery' ? 'Pending' as const : 'Paid' as const,
      status: 'Pending' as const,
    };

    const placed = db.addOrder(orderMeta);
    setLatestPlacedOrder(placed);
    setCart([]); // Clear cart
    setAppliedCoupon(null);
    setEnteredCoupon('');
    setPaySimulator(null);
    loadAllDbValues(); // refresh stocks state
    setActiveTab('order-confirmation'); // Route to dynamic success confirmation page
    triggerToast(`🎉 Hooray! Your order #${placed.id} has been submitted!`);
  };

  // Track code search
  const handleTrackSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackSearchError(false);
    const ordersList = db.getOrders();
    const cleanTerm = trackCodeInput.trim().toUpperCase();

    // Match by ID or exact Tracking code
    const found = ordersList.find(o => o.id.toUpperCase() === cleanTerm || o.trackingCode.toUpperCase() === cleanTerm);
    
    if (found) {
      setTrackedOrder(found);
    } else {
      setTrackedOrder(null);
      setTrackSearchError(true);
    }
  };

  // Login processing and authentication
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // Quick verify in simulated custom user table
    const allUsers = db.getUsers();
    const found = allUsers.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
    
    if (found) {
      db.setCurrentUser(found);
      setCurrentUser(found);
      
      // Auto hydrate profile address coordinates
      setBillingName(found.name);
      setBillingPhone(found.phone);
      setBillingEmail(found.email);
      setBillingAddress(found.address);
      setBillingCity(found.city);

      triggerToast(`👤 Welcome back, ${found.name}!`);
      setActiveTab('home');
    } else {
      setLoginError('Incorrect credentials or registered email not found in local sandbox.');
    }
  };

  // Register processing
  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegSuccess(false);

    if (!regName || !regEmail || !regPhone || !regPassword) {
      alert('Please fill out all fields.');
      return;
    }

    const newUser: ProfileUser = {
      id: `usr-${Math.floor(100 + Math.random() * 900)}`,
      email: regEmail,
      name: regName,
      phone: regPhone,
      address: regAddress,
      city: regCity,
      registeredDate: new Date().toISOString(),
      status: 'Active'
    };

    db.saveUser(newUser);
    setRegSuccess(true);
    triggerToast('🎉 Account registered! You can log in now.');
    
    // Auto transition inputs to login screen
    setLoginEmail(regEmail);
    setLoginPassword(regPassword);
    
    // Reset inputs
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegAddress('');
    setRegPassword('');
    
    setTimeout(() => {
      setActiveTab('login');
      setRegSuccess(false);
    }, 1500);
  };

  // Custom user profiles updates
  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    db.saveUser(currentUser);
    db.setCurrentUser(currentUser);
    triggerToast('💾 Account profile credentials updated!');
  };

  // Logout coordinate resets
  const handleLogout = () => {
    db.setCurrentUser(null);
    setCurrentUser(null);
    setBillingName('');
    setBillingPhone('');
    setBillingEmail('');
    setBillingAddress('');
    setBillingCity('Dhaka');
    triggerToast('🚪 Logged out successfully.');
    setActiveTab('home');
  };

  // Pre-filtered arrays for shop list
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch = searchFilter === '' || p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.description.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesPrice = p.price <= priceRange;
    const matchesDiscount = !onlyDiscounted || p.discountPercent > 0;
    return matchesCategory && matchesSearch && matchesPrice && matchesDiscount;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      
      {/* Dynamic Toast Alerts banner */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-[#FAF5EE] border-3 border-stone-900 text-stone-900 px-6 py-4 rounded-none shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-1 min-w-[290px] sm:min-w-[350px] max-w-md animate-slide-down">
          <div className="flex items-center justify-between border-b-2 border-stone-900/10 pb-1.5 mb-1 bg-stone-100/50 -mx-6 -mt-4 px-6 py-1.5 select-none">
            <span className="bg-black text-[#FAFAFA] font-mono text-[9px] font-black tracking-widest px-2 py-0.5 uppercase">
              ALHAMDULILLAH ✨
            </span>
            <span className="text-[9px] text-black font-display font-black tracking-widest uppercase">
              SYSTEM NOTIFICATION
            </span>
          </div>
          <div className="flex items-start gap-3 pt-1">
            <div className="bg-[#EFE9DB] border-2 border-stone-950 p-1.5 shrink-0 flex items-center justify-center animate-pulse">
              <span className="text-base select-none">
                {toastMessage.includes('🛒') || toastMessage.includes('basket') ? '🛍️' : 
                 toastMessage.includes('Welcome') || toastMessage.includes('profile') || toastMessage.includes('Account') ? '👤' : 
                 toastMessage.includes('Logged out') ? '🚪' : 
                 toastMessage.includes('Coupon') || toastMessage.includes('Voucher') || toastMessage.includes('Promo') ? '🎟️' : 
                 toastMessage.includes('wishlist') ? '💖' : '✨'}
              </span>
            </div>
            <p className="text-xs font-black font-sans text-stone-900 leading-snug pt-0.5">
              {toastMessage}
            </p>
          </div>
        </div>
      )}

      {/* Main Header navigation */}
      <Header
        cart={cart}
        wishlist={wishlist}
        currentUser={currentUser}
        settings={settings}
        activeTab={activeTab}
        onNavigate={setActiveTab}
        onSearch={setSearchFilter}
        onToggleAdmin={() => setIsAdminOpen(true)}
        onToggleCart={() => setIsCartOpen(!isCartOpen)}
        onLogout={handleLogout}
      />

      {/* Primary Page views router staging */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* VIEW 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-6 animate-fade-in">

            {/* TOP SCROLLING MARQUEE NOTICE */}
            {settings.enableTopNotice && settings.topNoticeText && (
              <div className="bg-[#00796B] text-white py-2 px-4 rounded-2xl overflow-hidden shadow-sm border border-teal-600/30 flex items-center gap-3 relative select-none">
                <span className="bg-red-500 text-white font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 flex items-center justify-center animate-pulse z-10 shadow">
                  NOTICE
                </span>
                <div className="relative w-full overflow-hidden flex items-center">
                  <div className="animate-notice-marquee font-sans font-medium text-xs sm:text-sm tracking-wide whitespace-nowrap shrink-0 min-w-max">
                    {settings.topNoticeText}
                  </div>
                </div>
              </div>
            )}
            
            {/* Interactive Grid: Special Offer Banner on the Left, Main Slider on the Right */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 items-stretch">
              
              {/* Left Column: Special Offer Tall Banner (takes 1/4 layout on desktop, hidden on mobile/tablet) */}
              <div 
                onClick={() => {
                  if (coupons.length > 0) {
                    const promo = coupons[0];
                    setEnteredCoupon(promo.code);
                    setAppliedCoupon(promo);
                    setCouponError('');
                    triggerToast(`🎟️ Applied Coupon "${promo.code}" - Flat ${promo.discountPercent}% OFF!`);
                  } else {
                    setEnteredCoupon('BAZAR10');
                    setAppliedCoupon({ id: 'fallback', code: 'BAZAR10', discountPercent: 10, minSpend: 500, active: true });
                    setCouponError('');
                    triggerToast('🎟️ Applied Promo Code BAZAR10 - enjoy Flat 10% OFF!');
                  }
                }}
                className="hidden md:flex md:col-span-1 rounded-3xl p-4 sm:p-5 text-white bg-slate-900 border border-slate-200/50 flex-col justify-between shadow-sm relative overflow-hidden group select-none min-h-[290px] md:min-h-full md:h-[290px] lg:h-[320px] cursor-pointer active:scale-[0.99] transition-all duration-200"
              >
                {/* Full-size Immersive Beautiful background with sharp visibility */}
                <div className="absolute inset-0 z-0">
                  <img 
                    src={settings.specialOfferImage || "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=600"} 
                    className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-1000 ease-out animate-fade-in" 
                    alt="Premium Special Offer Background" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent transition-all duration-300 animate-fade-in"></div>
                </div>

                {/* Top lightning badge and discount indicator */}
                <div className="flex items-center justify-between w-full relative z-10">
                  <div className="flex items-center gap-1.5 bg-[#022B28]/95 backdrop-blur-sm text-white border border-emerald-500/30 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-lg tracking-wider shadow-sm">
                    <Zap className="h-3.5 w-3.5 fill-emerald-400 text-emerald-405" />
                    <span>Special Offer</span>
                  </div>

                  <span className="bg-emerald-600 text-white font-sans font-black text-[10px] px-2.5 py-1 rounded-full shadow-md animate-bounce">
                    -{coupons.length > 0 ? coupons[0].discountPercent : 15}% OFF
                  </span>
                </div>

                {/* Spacer to layout description beautifully */}
                <div className="h-10 relative z-10"></div>

                {/* Info & Call-To-Action contents stacked neatly at the bottom on top of full background image */}
                <div className="space-y-2.5 relative z-10">
                  
                  {/* "SPECIAL ACCESS" Slanted ribbon with bright green layout */}
                  <div className="bg-emerald-600 text-white text-[10px] font-black tracking-widest px-2.5 py-1 shadow-md uppercase select-none transform -skew-x-12 inline-block">
                    {settings.specialOfferTitle || 'Special Offer'}
                  </div>

                  <div className="space-y-1">
                    {settings.specialOfferDesc && settings.specialOfferDesc.trim() !== '' && (
                      <p className="text-[10px] sm:text-[11.5px] text-white font-sans font-semibold leading-snug max-w-[95%] text-left drop-shadow-[0_1.5px_1.5px_rgba(0,0,0,0.8)]">
                        {settings.specialOfferDesc}
                      </p>
                    )}
                  </div>

                  {/* Countdown live clock overlay inside the banner */}
                  <div className="flex items-center gap-1 font-sans justify-start bg-black/55 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-white/10 shadow-lg">
                    <span className="text-[8.5px] uppercase font-bold tracking-widest text-emerald-400 mr-0.5 animate-pulse">Ends In:</span>
                    <div className="flex items-center gap-1 text-[11px]">
                      <strong className="font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</strong>
                      <span className="text-[7.5px] text-gray-300">h</span>
                      <span className="font-black text-emerald-400 animate-pulse">:</span>
                      <strong className="font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</strong>
                      <span className="text-[7.5px] text-gray-300">m</span>
                      <span className="font-black text-emerald-400 animate-pulse">:</span>
                      <strong className="font-black text-emerald-400">{String(timeLeft.seconds).padStart(2, '0')}</strong>
                      <span className="text-[7.5px] text-gray-300">s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Sliding Feature Hero Carousel (takes 3/4 layout on desktop) */}
              <div 
                onMouseEnter={() => setIsSliderHovered(true)}
                onMouseLeave={() => setIsSliderHovered(false)}
                className="group relative rounded-3xl overflow-hidden h-[145px] md:h-[290px] lg:h-[320px] bg-white border border-slate-200/90 cursor-pointer md:col-span-2 lg:col-span-3 shadow-sm"
              >
                <div 
                  className="flex h-full w-full transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${heroIndex * 100}%)` }}
                >
                  {banners.map((slide, idx) => (
                    <div 
                      key={slide.id || idx}
                      className="w-full h-full shrink-0 p-3.5 sm:p-8 md:p-9 lg:p-10 flex flex-col justify-center text-white relative select-none"
                    >
                      {/* Full Background Image */}
                      <div className="absolute inset-0 z-0">
                        <img 
                          src={slide.image} 
                          className="w-full h-full object-cover transform scale-100 group-hover:scale-102 transition-transform duration-[4000ms] ease-out select-none pointer-events-none" 
                          alt={slide.title}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      </div>

                      {/* Corner SHOP NOW button with absolutely zero text, beautifully styled */}
                      <div className="absolute bottom-3.5 left-3.5 sm:bottom-5 sm:left-5 z-10 select-none">
                        <button
                          id={`hero-shop-cta-btn-${slide.id}`}
                          onClick={(e) => { e.stopPropagation(); setActiveTab('shop'); setSelectedCategory('all'); }}
                          className="bg-orange-600 hover:bg-orange-700 hover:scale-105 active:scale-95 text-white font-sans font-black tracking-widest text-[8.5px] sm:text-[10.5px] uppercase px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-[0_4px_14px_rgba(234,88,12,0.4)] border border-orange-500/20 flex items-center gap-1.5 sm:gap-2 cursor-pointer transition-all duration-200"
                        >
                          <span>SHOP NOW</span>
                          <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating Navigation Arrows */}
                {banners.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-slate-800 hover:scale-110 active:scale-90 p-2 md:p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md cursor-pointer z-10 flex items-center justify-center border border-slate-200"
                      title="Previous banner"
                    >
                      <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroIndex((prev) => (prev + 1) % banners.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-slate-800 hover:scale-110 active:scale-90 p-2 md:p-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-md cursor-pointer z-10 flex items-center justify-center border border-slate-200"
                      title="Next banner"
                    >
                      <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                  </>
                )}

                {/* Slide controls Dots */}
                <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {banners.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setHeroIndex(idx); }}
                      className={`h-1.5 w-1.5 sm:h-2 sm:w-2 md:h-2.5 md:w-2.5 rounded-full transition-all cursor-pointer ${heroIndex === idx ? 'bg-emerald-600 w-4 sm:w-5 md:w-6' : 'bg-slate-200 hover:bg-slate-300'}`}
                      title={`Go to slide ${idx + 1}`}
                    ></button>
                  ))}
                </div>
              </div>

            </div>

            {/* BOTTOM SCROLLING MARQUEE NOTICE */}
            {settings.enableBottomNotice && settings.bottomNoticeText && (
              <div className="bg-amber-50 border border-amber-200 text-amber-900 py-2 px-4 rounded-2xl overflow-hidden shadow-xs flex items-center gap-3 relative select-none">
                <span className="bg-amber-600 text-white font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 flex items-center justify-center z-10 shadow">
                  ANNOUNCEMENT
                </span>
                <div className="relative w-full overflow-hidden flex items-center">
                  <div className="animate-notice-marquee font-sans font-bold text-xs sm:text-sm tracking-wider whitespace-nowrap shrink-0 min-w-max">
                    {settings.bottomNoticeText}
                  </div>
                </div>
              </div>
            )}


            {/* Quick search shortcuts Categories lists */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-800 tracking-tight uppercase">Featured Categories</h3>
                  <p className="text-xs text-slate-400 font-sans">Handpicked and freshly harvested items categorized for swift shopping</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => {
                      if (categoriesContainerRef.current) {
                        categoriesContainerRef.current.scrollBy({ left: -260, behavior: 'smooth' });
                      }
                    }}
                    className="h-8 w-8 hover:bg-slate-100 border border-slate-200 text-slate-750 bg-white rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90"
                    title="Slide Left"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => {
                      if (categoriesContainerRef.current) {
                        categoriesContainerRef.current.scrollBy({ left: 260, behavior: 'smooth' });
                      }
                    }}
                    className="h-8 w-8 hover:bg-slate-100 border border-slate-200 text-slate-750 bg-white rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-90"
                    title="Slide Right"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => { setSelectedCategory('all'); setActiveTab('shop'); }} 
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1 ml-1"
                  >
                    <span>View All</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>

              <div 
                ref={categoriesContainerRef}
                className="flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x"
              >
                {categories.map((cat, idx) => (
                  <div
                    key={cat.slug || idx}
                    onClick={() => { setSelectedCategory(cat.slug); setActiveTab('shop'); }}
                    className="flex-none w-[114px] sm:w-[138px] bg-white border border-gray-200/70 rounded-2xl p-3 sm:p-4 text-center flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-500 hover:shadow-md group transition-all duration-300 active:scale-95 snap-start"
                  >
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-slate-50 border-2 border-emerald-50 relative shrink-0 p-1 group-hover:border-emerald-500 group-hover:bg-emerald-50/50 transition-all duration-300 shadow-sm flex items-center justify-center">
                      <img 
                        src={cat.image} 
                        className="h-full w-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500 aspect-square" 
                        alt={cat.name} 
                        referrerPolicy="no-referrer" 
                        loading="lazy"
                        onError={handleImageError}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700 transition-colors leading-tight line-clamp-1">
                      {cat.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Selling Products Block (সেরা বিক্রিত পণ্য) */}
            <div className="space-y-4 pt-4" id="top-selling-products-section">
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                <div>
                  <h3 className="font-display font-black text-lg text-slate-800 tracking-tight uppercase flex items-center gap-1.5 animate-fade-in">
                    <span>🔥 Top Selling Products</span>
                    <span className="bg-orange-100 text-[#F97316] text-[10px] px-1.5 py-0.5 rounded font-black uppercase tracking-wide">POPULAR</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">Highly recommended groceries at unparalleled wholesale prices</p>
                </div>
                <button 
                  onClick={() => { setSelectedCategory('all'); setActiveTab('shop'); }} 
                  className="bg-orange-50 hover:bg-orange-100 text-[#F97316] text-xs font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>More Hot Picks</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.slice(0, 5).map((product, pIdx) => {
                  const isOut = product.stock === 0 && !product.affiliateUrl;

                  return (
                    <div
                      key={`top-selling-${product.id}`}
                      onClick={() => setDetailProduct(product)}
                      className="bg-white border border-gray-200/90 rounded-2xl p-4 flex flex-col justify-between h-full select-none hover:shadow-lg transition-all relative cursor-pointer group"
                    >
                      {/* Top Badges */}
                      {product.isNewArrival && (
                        <span className="absolute top-2.5 left-2.5 z-10 bg-[#F97316] text-white font-sans font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                          New Arrival
                        </span>
                      )}

                      {product.originalPrice > product.price && (
                        <span className="absolute top-2.5 right-2.5 z-10 bg-[#22C55E] text-white font-sans font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                          Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      )}

                      {/* Image Container with full-bleed cover */}
                      <div className="h-44 w-full rounded-xl bg-slate-50 select-none relative overflow-hidden flex items-center justify-center border border-slate-100 shrink-0">
                        <img 
                          src={product.image} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                          alt={product.name} 
                          referrerPolicy="no-referrer" 
                          loading="lazy"
                          onError={handleImageError}
                        />
                        {isOut && (
                          <div className="absolute inset-0 bg-white/75 backdrop-blur-3xs flex items-center justify-center">
                            <span className="bg-red-655 text-white font-black px-2 py-0.5 text-[9px] select-none rounded uppercase bg-red-600">OUT OF STOCK</span>
                          </div>
                        )}
                      </div>

                      {/* Item Info Description */}
                      <div className="flex-1 flex flex-col justify-between pt-1">
                        <div>
                          <h4 className="font-sans font-bold text-slate-850 text-xs sm:text-[12.5px] leading-snug line-clamp-2 h-9 mt-1 hover:text-orange-500 transition-colors">
                            {product.name}
                          </h4>
                          
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/40">
                              {product.unit}
                            </span>
                            {product.stock > 0 && product.stock <= 5 && (
                              <span className="text-[8.5px] font-black text-amber-605 bg-amber-50 px-1 py-0.5 rounded border border-amber-100/30">
                                Only {product.stock} left
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-baseline gap-1 mt-1 font-sans">
                            <span className="text-sm sm:text-base font-extrabold text-[#F97316]">৳{product.price.toLocaleString('en-US')}</span>
                            {product.originalPrice > product.price && (
                              <span className="text-[10px] sm:text-xs text-slate-450 line-through font-normal">৳{product.originalPrice.toLocaleString('en-US')}</span>
                            )}
                          </div>

                          {product.originalPrice > product.price ? (
                            <div className="mt-1 mb-1.5">
                              <span className="bg-lime-50 text-lime-800 text-[9.5px] font-bold px-1.5 py-0.5 rounded border border-lime-200/50 inline-block">
                                ৳{(product.originalPrice - product.price).toLocaleString('en-US')} অফ
                              </span>
                            </div>
                          ) : (
                            <div className="mt-1 mb-1.5 h-[19px]" />
                          )}
                        </div>

                        {/* Order CTAs buttons */}
                        <div className="flex items-center gap-1 mt-auto pt-1.5" onClick={(e) => e.stopPropagation()}>
                          {product.affiliateUrl ? (
                            <button
                              type="button"
                              onClick={() => handleDirectBuyNow(product)}
                              className="w-full py-1.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold text-[10px] rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-3xs"
                            >
                              <span>Buy Link 🔗</span>
                            </button>
                          ) : isOut ? (
                            <button
                              type="button"
                              disabled
                              className="w-full py-1.5 border border-red-500/80 text-red-500 font-bold text-[10px] rounded-lg flex items-center justify-center cursor-not-allowed bg-red-50/10"
                            >
                              <span>Stock Out</span>
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAddToCart(product)}
                                className="w-1/2 py-1.5 border border-[#F97316] text-[#F97316] hover:bg-orange-50/20 font-bold text-[9.5px] sm:text-[10.5px] rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 bg-white"
                              >
                                <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span>Add</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => handleDirectBuyNow(product)}
                                className="w-1/2 py-1.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold text-[9.5px] sm:text-[10.5px] rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-3xs"
                              >
                                <span>Buy</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Best Selling ribbon banner in top corner on last card */}
                      {pIdx === 4 && (
                        <div className="absolute top-2.5 right-2.5 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs flex items-center gap-0.5 uppercase select-none leading-none tracking-wide animate-pulse">
                          🔥 Best Selling
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Adsterra Banner Slot (Above Flash Sell) */}
            {settings.enableAds && (settings.adsterraSidebarScript || settings.adsterraFeedScript) && (
              <div className="bg-slate-50 border border-dashed border-slate-200 p-3 rounded-2xl flex flex-col items-center justify-center space-y-1 my-4 text-center max-w-5xl mx-auto">
                <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase flex items-center gap-1 leading-none select-none">
                  <span>📢 SPONSORED ADVERTISEMENT</span>
                  {settings.isSafeAdsOnly !== false && <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded text-[8px] font-black scale-90 origin-left">🧼 SAFE FILTER ACTIVE</span>}
                </span>
                <AdSlotContainer 
                  scriptHtml={settings.adsterraFeedScript || settings.adsterraSidebarScript} 
                  className="w-full flex justify-center scale-95 origin-center overflow-x-auto select-none mt-1" 
                />
              </div>
            )}

            {/* Curated Premium Picks section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                <div>
                  <h3 className="font-display font-bold text-lg text-slate-800 tracking-tight uppercase">⚡ Flash Sell</h3>
                  <p className="text-xs text-slate-400 font-sans">The absolute favorites in Dhaka households right now</p>
                </div>
                <button 
                  onClick={() => { setSelectedCategory('all'); setActiveTab('shop'); }} 
                  className="text-emerald-600 hover:text-emerald-700 text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>See more sales</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {products.filter(p => p.isFlashSale || (p.isFlashSale === undefined && p.bestSeller)).slice(0, 5).map(product => {
                  const isOut = product.stock === 0 && !product.affiliateUrl;

                  return (
                    <div
                      key={product.id}
                      onClick={() => setDetailProduct(product)}
                      className="bg-white border border-gray-200/90 rounded-2xl p-4 flex flex-col justify-between h-full select-none hover:shadow-lg transition-all relative group cursor-pointer"
                    >
                      {/* Top Badges */}
                      {product.isNewArrival && (
                        <span className="absolute top-2.5 left-2.5 z-10 bg-[#F97316] text-white font-sans font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                          New Arrival
                        </span>
                      )}

                      {product.originalPrice > product.price && (
                        <span className="absolute top-2.5 right-2.5 z-10 bg-[#22C55E] text-white font-sans font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                          Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                        </span>
                      )}

                      {/* Image Container with full-bleed cover */}
                      <div className="h-44 w-full rounded-xl bg-slate-50 select-none relative overflow-hidden flex items-center justify-center border border-slate-100 shrink-0">
                        <img 
                          src={product.image} 
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                          alt={product.name} 
                          referrerPolicy="no-referrer" 
                        />
                        {isOut && (
                          <div className="absolute inset-0 bg-white/75 backdrop-blur-3xs flex items-center justify-center">
                            <span className="bg-red-655 text-white font-black px-2 py-0.5 text-[9px] select-none rounded uppercase bg-red-600">OUT OF STOCK</span>
                          </div>
                        )}
                      </div>

                      {/* Item Info Description */}
                      <div className="flex-1 flex flex-col justify-between pt-1">
                        <div>
                          <h4 className="font-sans font-bold text-slate-850 text-xs sm:text-[12.5px] leading-snug line-clamp-2 h-9 mt-1 hover:text-orange-500 transition-colors">
                            {product.name}
                          </h4>
                          
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/40">
                              {product.unit}
                            </span>
                            {product.stock > 0 && product.stock <= 5 && (
                              <span className="text-[8.5px] font-black text-amber-605 bg-amber-50 px-1 py-0.5 rounded border border-amber-100/30">
                                Only {product.stock} left
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-baseline gap-1 mt-1 font-sans">
                            <span className="text-sm sm:text-base font-extrabold text-[#F97316]">৳{product.price.toLocaleString('en-US')}</span>
                            {product.originalPrice > product.price && (
                              <span className="text-[10px] sm:text-xs text-slate-450 line-through font-normal">৳{product.originalPrice.toLocaleString('en-US')}</span>
                            )}
                          </div>

                          {product.originalPrice > product.price ? (
                            <div className="mt-1 mb-1.5">
                              <span className="bg-lime-50 text-lime-800 text-[9.5px] font-bold px-1.5 py-0.5 rounded border border-lime-200/50 inline-block">
                                ৳{(product.originalPrice - product.price).toLocaleString('en-US')} অফ
                              </span>
                            </div>
                          ) : (
                            <div className="mt-1 mb-1.5 h-[19px]" />
                          )}
                        </div>

                        {/* Order CTAs buttons */}
                        <div className="flex items-center gap-1 mt-auto pt-1.5" onClick={(e) => e.stopPropagation()}>
                          {product.affiliateUrl ? (
                            <button
                              type="button"
                              onClick={() => handleDirectBuyNow(product)}
                              className="w-full py-1.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold text-[10px] rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-3xs"
                            >
                              <span>Buy Link 🔗</span>
                            </button>
                          ) : isOut ? (
                            <button
                              type="button"
                              disabled
                              className="w-full py-1.5 border border-red-500/80 text-red-500 font-bold text-[10px] rounded-lg flex items-center justify-center cursor-not-allowed bg-red-50/10"
                            >
                              <span>Stock Out</span>
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAddToCart(product)}
                                className="w-1/2 py-1.5 border border-[#F97316] text-[#F97316] hover:bg-orange-50/20 font-bold text-[9.5px] sm:text-[10.5px] rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 bg-white"
                              >
                                <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                <span>Add</span>
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => handleDirectBuyNow(product)}
                                className="w-1/2 py-1.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold text-[9.5px] sm:text-[10.5px] rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-3xs"
                              >
                                <span>Buy</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Offers Section */}
            {products.some(p => p.isSpecialOffer || p.popular) && (
              <div className="space-y-3 pt-4 animate-fade-in" id="special-offers-container-section">
                <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-805 tracking-tight uppercase flex items-center gap-1.5">
                      <span>🎁 Special Offer</span>
                      <span className="bg-rose-100 text-rose-600 border border-rose-200 rounded-full px-2.5 py-0.5 text-[8.5px] font-black uppercase tracking-wide">Special Combo</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-sans">Exclusive discount bundles and special gift hampers directly from BAZAR THOLE</p>
                  </div>
                  <button 
                    onClick={() => { setSelectedCategory('all'); setActiveTab('shop'); }} 
                    className="text-orange-500 hover:text-orange-600 text-xs font-bold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <span>More Offers</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {products.filter(p => p.isSpecialOffer || (p.isSpecialOffer === undefined && p.popular)).slice(0, 5).map(product => {
                    const isOut = product.stock === 0 && !product.affiliateUrl;

                    return (
                      <div
                        key={`special-offer-card-${product.id}`}
                        onClick={() => setDetailProduct(product)}
                        className="bg-white border border-gray-200/90 rounded-2xl p-4 flex flex-col justify-between h-full select-none hover:shadow-lg transition-all relative group cursor-pointer"
                      >
                        {/* Top Badges */}
                        <span className="absolute top-2.5 left-2.5 z-10 bg-rose-600 text-white font-sans font-extrabold text-[9px] px-1.5 py-0.5 rounded shadow-2xs">
                          Special Offer
                        </span>

                        {product.originalPrice > product.price && (
                          <span className="absolute top-2.5 right-2.5 z-10 bg-[#22C55E] text-white font-sans font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                            Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                          </span>
                        )}

                        {/* Image Container with full-bleed cover */}
                        <div className="h-44 w-full rounded-xl bg-slate-50 select-none relative overflow-hidden flex items-center justify-center border border-slate-100 shrink-0">
                          <img 
                            src={product.image} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                            alt={product.name} 
                            referrerPolicy="no-referrer" 
                          />
                          {isOut && (
                            <div className="absolute inset-0 bg-white/75 backdrop-blur-3xs flex items-center justify-center">
                              <span className="bg-red-655 text-white font-black px-2 py-0.5 text-[9px] select-none rounded uppercase bg-red-600">OUT OF STOCK</span>
                            </div>
                          )}
                        </div>

                        {/* Item Info Description */}
                        <div className="flex-1 flex flex-col justify-between pt-1">
                          <div>
                            <h4 className="font-sans font-bold text-slate-850 text-xs sm:text-[12.5px] leading-snug line-clamp-2 h-9 mt-1 hover:text-orange-500 transition-colors">
                              {product.name}
                            </h4>
                            
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/40">
                                {product.unit}
                              </span>
                              {product.stock > 0 && product.stock <= 5 && (
                                <span className="text-[8.5px] font-black text-amber-605 bg-amber-50 px-1 py-0.5 rounded border border-amber-100/30">
                                  Only {product.stock} left
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-baseline gap-1 mt-1 font-sans">
                              <span className="text-sm sm:text-base font-extrabold text-[#F97316]">৳{product.price.toLocaleString('en-US')}</span>
                              {product.originalPrice > product.price && (
                                <span className="text-[10px] sm:text-xs text-slate-450 line-through font-normal">৳{product.originalPrice.toLocaleString('en-US')}</span>
                              )}
                            </div>

                            {product.originalPrice > product.price ? (
                              <div className="mt-1 mb-1.5">
                                <span className="bg-lime-50 text-lime-800 text-[9.5px] font-bold px-1.5 py-0.5 rounded border border-lime-200/50 inline-block">
                                  ৳{(product.originalPrice - product.price).toLocaleString('en-US')} অফ
                                </span>
                              </div>
                            ) : (
                              <div className="mt-1 mb-1.5 h-[19px]" />
                            )}
                          </div>

                          {/* Order CTAs buttons */}
                          <div className="flex items-center gap-1 mt-auto pt-1.5" onClick={(e) => e.stopPropagation()}>
                            {product.affiliateUrl ? (
                              <button
                                type="button"
                                onClick={() => handleDirectBuyNow(product)}
                                className="w-full py-1.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold text-[10px] rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-3xs"
                              >
                                <span>Buy Link 🔗</span>
                              </button>
                            ) : isOut ? (
                              <button
                                type="button"
                                disabled
                                className="w-full py-1.5 border border-red-500/80 text-red-500 font-bold text-[10px] rounded-lg flex items-center justify-center cursor-not-allowed bg-red-50/10"
                              >
                                <span>Stock Out</span>
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleAddToCart(product)}
                                  className="w-1/2 py-1.5 border border-[#F97316] text-[#F97316] hover:bg-orange-50/20 font-bold text-[9.5px] sm:text-[10.5px] rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 bg-white"
                                >
                                  <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  <span>Add</span>
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => handleDirectBuyNow(product)}
                                  className="w-1/2 py-1.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold text-[9.5px] sm:text-[10.5px] rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-3xs"
                                >
                                  <span>Buy</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

        {/* VIEW 2: SHOP PAGE */}
        {activeTab === 'shop' && (
          <div className="space-y-3 animate-fade-in text-slate-800">
            
            {/* Filter tags header bar - Simplified & Compact */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-base text-slate-850 tracking-wide uppercase">Shop</span>
                <span className="text-xs text-slate-400 font-sans">({filteredProducts.length} items)</span>
              </div>

              {/* Reset filter trigger */}
              <button
                id="reset-shop-filters"
                onClick={() => {
                  setSelectedCategory('all');
                  setPriceRange(1800);
                  setSearchFilter('');
                  setOnlyDiscounted(false);
                }}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-3xs hover:bg-slate-50 transition-all"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset Filters</span>
              </button>
            </div>

            {/* Horizontal Filter Controls (Replaces cluttered vertical sidebar and multi-line pills) */}
            <div className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-3xs">
              
              {/* Category Dropdown Selector */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">Browse Class:</span>
                <select
                  id="shop-category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full sm:w-64 bg-slate-50 hover:bg-slate-100/80 border border-gray-200 text-xs font-bold px-3 py-2 rounded-xl focus:border-emerald-600 focus:outline-none cursor-pointer transition-all"
                >
                  <option value="all">All Products (সব পণ্য)</option>
                  {categories.map(cat => (
                    <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Price and On-sale filter controls */}
              <div className="hidden md:flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full md:w-auto justify-end">
                {/* Price budget slider */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap shrink-0">Price Limit:</span>
                  <input
                    id="shop-price-slider"
                    type="range"
                    min="10"
                    max="1800"
                    step="10"
                    className="w-full sm:w-32 md:w-40 accent-emerald-600 h-1.5 bg-gray-100 rounded-lg cursor-pointer"
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                  />
                  <span className="font-mono text-xs font-bold bg-slate-50 border border-gray-150 px-2 py-0.5 rounded-lg text-emerald-800 shrink-0 text-center min-w-[70px] shadow-3xs">
                    ≤ ৳{priceRange}
                  </span>
                </div>

                {/* Discount check / Active Search Filter */}
                <div className="flex items-center gap-2.5 shrink-0">
                  {searchFilter && (
                    <div className="bg-amber-50 text-amber-900 border border-dashed border-amber-300 px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-[11px] font-semibold">
                      <span>"{searchFilter}"</span>
                      <button
                        onClick={() => setSearchFilter('')}
                        className="text-red-500 hover:text-red-700 font-black text-xs ml-1 cursor-pointer"
                        title="Clear search"
                      >
                        ×
                      </button>
                    </div>
                  )}

                  <label className="hidden lg:flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-700 select-none bg-slate-50 hover:bg-slate-100 px-3 py-2 rounded-xl border border-gray-200 transition-all shadow-3xs">
                    <input
                      id="shop-discount-checkbox"
                      type="checkbox"
                      checked={onlyDiscounted}
                      onChange={(e) => setOnlyDiscounted(e.target.checked)}
                      className="accent-emerald-600 h-3.5 w-3.5 rounded cursor-pointer"
                    />
                    <span>On Sale</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Store items Grid matching filtering constraints */}
            <div className="w-full">
              {filteredProducts.length === 0 ? (
                <div className="bg-white border text-center py-20 rounded-3xl space-y-4">
                  <HelpCircle className="mx-auto h-12 w-12 text-gray-300" />
                  <h4 className="font-display font-black text-lg text-gray-800">No Food Sourced items match requirements</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">Try slide pricing limits higher or check different categorization filter tabs!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredProducts.slice(0, visibleShopProducts).map(product => {
                      const isOut = product.stock === 0 && !product.affiliateUrl;

                      return (
                        <div
                          key={product.id}
                          onClick={() => setDetailProduct(product)}
                          className="bg-white border border-gray-200/90 rounded-2xl p-4 flex flex-col justify-between h-full select-none hover:shadow-lg transition-all relative group cursor-pointer"
                        >
                          {/* Top Badges */}
                          {product.isNewArrival && (
                            <span className="absolute top-2.5 left-2.5 z-10 bg-[#F97316] text-white font-sans font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                              New Arrival
                            </span>
                          )}

                          {product.originalPrice > product.price && (
                            <span className="absolute top-2.5 right-2.5 z-10 bg-[#22C55E] text-white font-sans font-extrabold text-[9px] px-1.5 py-0.5 rounded">
                              Save {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                            </span>
                          )}

                          {/* Image Container with full-bleed cover */}
                          <div className="h-44 w-full rounded-xl bg-slate-50 select-none relative overflow-hidden flex items-center justify-center border border-slate-100 shrink-0">
                            <img 
                              src={product.image} 
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                              alt={product.name} 
                              referrerPolicy="no-referrer" 
                            />
                            {isOut && (
                              <div className="absolute inset-0 bg-white/75 backdrop-blur-3xs flex items-center justify-center">
                                <span className="bg-red-655 text-white font-black px-2 py-0.5 text-[9px] select-none rounded uppercase bg-red-600">OUT OF STOCK</span>
                              </div>
                            )}
                          </div>

                          {/* Item Info Description */}
                          <div className="flex-1 flex flex-col justify-between pt-1">
                            <div>
                              <h4 className="font-sans font-bold text-slate-850 text-xs sm:text-[12.5px] leading-snug line-clamp-2 h-9 mt-1 hover:text-orange-500 transition-colors">
                                {product.name}
                              </h4>
                              
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/40">
                                  {product.unit}
                                </span>
                                {product.stock > 0 && product.stock <= 5 && (
                                  <span className="text-[8.5px] font-black text-amber-605 bg-amber-50 px-1 py-0.5 rounded border border-amber-100/30">
                                    Only {product.stock} left
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-baseline gap-1 mt-1 font-sans">
                                <span className="text-sm sm:text-base font-extrabold text-[#F97316]">৳{product.price.toLocaleString('en-US')}</span>
                                {product.originalPrice > product.price && (
                                  <span className="text-[10px] sm:text-xs text-slate-450 line-through font-normal">৳{product.originalPrice.toLocaleString('en-US')}</span>
                                )}
                              </div>

                              {product.originalPrice > product.price ? (
                                <div className="mt-1 mb-1.5">
                                  <span className="bg-lime-50 text-lime-800 text-[9.5px] font-bold px-1.5 py-0.5 rounded border border-lime-200/50 inline-block">
                                    ৳{(product.originalPrice - product.price).toLocaleString('en-US')} অফ
                                  </span>
                                </div>
                              ) : (
                                <div className="mt-1 mb-1.5 h-[19px]" />
                              )}
                            </div>

                            {/* Order CTAs buttons */}
                            <div className="flex items-center gap-1 mt-auto pt-1.5" onClick={(e) => e.stopPropagation()}>
                              {product.affiliateUrl ? (
                                <button
                                  type="button"
                                  onClick={() => handleDirectBuyNow(product)}
                                  className="w-full py-1.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold text-[10px] rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-3xs"
                                >
                                  <span>Buy Link 🔗</span>
                                </button>
                              ) : isOut ? (
                                <button
                                  type="button"
                                  disabled
                                  className="w-full py-1.5 border border-red-500/80 text-red-500 font-bold text-[10px] rounded-lg flex items-center justify-center cursor-not-allowed bg-red-50/10"
                                >
                                  <span>Stock Out</span>
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleAddToCart(product)}
                                    className="w-1/2 py-1.5 border border-[#F97316] text-[#F97316] hover:bg-orange-50/20 font-bold text-[9.5px] sm:text-[10.5px] rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 bg-white"
                                  >
                                    <ShoppingCart className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                    <span>Add</span>
                                  </button>
                                  
                                  <button
                                    type="button"
                                    onClick={() => handleDirectBuyNow(product)}
                                    className="w-1/2 py-1.5 bg-[#F97316] hover:bg-orange-600 text-white font-bold text-[9.5px] sm:text-[10.5px] rounded-lg flex items-center justify-center gap-0.5 cursor-pointer transition-all active:scale-95 shadow-3xs"
                                  >
                                    <span>Buy</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {filteredProducts.length > visibleShopProducts && (
                  <div className="flex flex-col items-center justify-center mt-10 space-y-3 animate-fade-in">
                    <p className="text-xs text-slate-500 font-sans font-medium">
                      Showing <strong className="text-emerald-600 font-bold">{Math.min(visibleShopProducts, filteredProducts.length)}</strong> of <strong className="text-slate-800 font-bold">{filteredProducts.length}</strong> items in total
                    </p>
                    <button
                      onClick={() => setVisibleShopProducts(prev => prev + 24)}
                      className="px-8 py-3 bg-[#F97316] hover:bg-orange-600 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow hover:shadow-orange-500/20 cursor-pointer active:scale-95"
                    >
                      Show More Products (আরও পণ্য লোড করুন)
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

        {/* VIEW 3: ORDER TRACKING PAGE */}
        {activeTab === 'tracking' && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in text-slate-800">
            
            <div className="text-center space-y-2">
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Order Status Tracking</span>
              <h2 className="font-display font-black text-2.5xl text-gray-900 leading-none">Track My Order</h2>
              <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">Copy billing order ID ord-101 (or find under custom account histories) to track shipments in real-time</p>
            </div>

            {/* Tracking search form box */}
            <form onSubmit={handleTrackSearchSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-4">
              <input
                id="tracking-search-input"
                type="text"
                required
                placeholder="e.g. ord-101 or BZR-34201"
                className="w-full sm:flex-1 bg-gray-50 border border-gray-200 px-5 py-3 rounded-2xl text-sm font-mono tracking-widest text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all uppercase"
                value={trackCodeInput}
                onChange={(e) => setTrackCodeInput(e.target.value)}
              />
              <button
                id="tracking-search-submit"
                type="submit"
                className="w-full sm:w-fit px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold active:scale-95 transition-all shadow shadow-emerald-600/10 cursor-pointer text-center"
              >
                Track Now
              </button>
            </form>

            {/* Error notifications */}
            {trackSearchError && (
              <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-700 flex items-start gap-2 animate-bounce">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Voucher or Order Reference Not Found</strong>
                  <p className="mt-0.5 font-sans">Verify character spelling. Example code: ord-101. Placing active checkouts automatically issues dynamic tracked IDs!</p>
                </div>
              </div>
            )}

            {/* Tracking result card showcasing vertical progress line */}
            {trackedOrder && (() => {
              const qrData = `ORDER-VERIFY: #${trackedOrder.id}\nCustomer: ${trackedOrder.customerName}\nPhone: ${trackedOrder.phone}\nTotal Amount: ৳${trackedOrder.total}\nTracking Code: ${trackedOrder.trackingCode || 'N/A'}\nItems:\n${trackedOrder.items.map(it => ` - ${it.productName} (${it.quantity}x)`).join('\n')}`;
              const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrData)}`;

              return (
                <div className="space-y-6 animate-scale-up">
                  
                  {/* Status Banner */}
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-6">
                    
                    {/* Header overview details */}
                    <div className="border-b border-gray-100 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-widest block font-sans">🛡️ BAZAR THOLE OFFICIAL LOGISTICS DIRECT REPORT</span>
                        <h4 className="font-mono font-black text-xl text-slate-900 mt-1">ORDER ID: #{trackedOrder.id}</h4>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400 font-mono">Reference Code: {trackedOrder.trackingCode}</span>
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full border border-emerald-100 font-bold uppercase font-sans tracking-wide">
                            {trackedOrder.status}
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right bg-slate-50 border border-slate-200/60 p-3 rounded-2xl">
                        <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Date Logged</span>
                        <strong className="text-xs text-slate-700 block mt-0.5">{new Date(trackedOrder.orderDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</strong>
                      </div>
                    </div>

                    {/* Vertical visual tracking history progress lines */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                      
                      {/* Left: Tracker Progression */}
                      <div className="lg:col-span-12 xl:col-span-7 space-y-6 pt-2 pl-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        
                        {/* Step A: Order Placed */}
                        <div className="relative flex gap-4 text-xs">
                          <div className="h-9 w-9 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center shrink-0 z-10">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-800 text-sm">Order Submitted successfully</h5>
                            <p className="text-slate-400 mt-0.5">Payment Method: {trackedOrder.paymentMethod} • Status: {trackedOrder.paymentStatus}</p>
                          </div>
                        </div>

                        {/* Step B: Processing (Active if status !== Pending) */}
                        <div className="relative flex gap-4 text-xs">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                            ['Processing', 'Shipped', 'Delivered'].includes(trackedOrder.status)
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-600'
                              : 'bg-white border-slate-200 text-slate-300'
                          }`}>
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <h5 className={`font-bold text-sm ${['Processing', 'Shipped', 'Delivered'].includes(trackedOrder.status) ? 'text-slate-800 font-black' : 'text-slate-400'}`}>
                              Hygienic Sorting & Packaging State
                            </h5>
                            <p className="text-slate-400 mt-0.5">Assuring weight checks & natural freshness values.</p>
                          </div>
                        </div>

                        {/* Step C: Shipped */}
                        <div className="relative flex gap-4 text-xs">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                            ['Shipped', 'Delivered'].includes(trackedOrder.status)
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-600'
                              : 'bg-white border-slate-200 text-slate-300'
                          }`}>
                            <Truck className="h-4 w-4" />
                          </div>
                          <div>
                            <h5 className={`font-bold text-sm ${['Shipped', 'Delivered'].includes(trackedOrder.status) ? 'text-slate-800 font-black' : 'text-slate-400'}`}>
                              Assigned Dispatch & Transport Out (Shipped)
                            </h5>
                            <p className="text-slate-400 mt-0.5 font-sans">Entrusted to regional rider. Delivery on-going.</p>
                          </div>
                        </div>

                        {/* Step D: Delivered */}
                        <div className="relative flex gap-4 text-xs">
                          <div className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                            trackedOrder.status === 'Delivered'
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20'
                              : 'bg-white border-slate-200 text-slate-300'
                          }`}>
                            <CheckCircle2 className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <h5 className={`font-bold text-sm ${trackedOrder.status === 'Delivered' ? 'text-emerald-700 font-black' : 'text-slate-400'}`}>
                              Successfully Handed Over & Completed
                            </h5>
                            <p className="text-slate-400 mt-0.5">Recipients evaluated and accepted grocery quality checkpoints.</p>
                          </div>
                        </div>

                      </div>

                      {/* Right: Dynamic Interactive QR Authenticator */}
                      <div className="lg:col-span-12 xl:col-span-5 flex flex-col items-center justify-center p-5 bg-[#00796B]/5 border border-[#00796B]/15 rounded-2xl text-center select-none">
                        <span className="text-[10px] font-black text-[#00796B] uppercase tracking-widest mb-3">🛡️ INVOICE VERIFICATION QR CODE</span>
                        <div className="p-4 bg-white border border-teal-100 rounded-2xl shadow-sm">
                          <img 
                            src={qrCodeUrl} 
                            alt="Verification QR code" 
                            className="w-[130px] h-[130px] object-contain border border-slate-100 p-1.5 rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="text-[9.5px] font-mono font-bold text-slate-500 uppercase mt-3">Scan with Camera to Verify Order</span>
                      </div>

                    </div>

                    {/* Cancel Warning Indicator (Conditional) */}
                    {trackedOrder.status === 'Canceled' && (
                      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-4 text-xs text-rose-800 flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
                        <span className="font-bold">Notice: This order status was terminated or refunded by BAZAR THOLE support system.</span>
                      </div>
                    )}

                  </div>

                  {/* Detailed Invoice Sheet / Report View */}
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-6">
                    <h4 className="text-xs font-black text-[#00796B] uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-2">
                      <span>📦 DETAILED BILLING & PRODUCT SHEET</span>
                    </h4>

                    {/* Recipient Details & Dispatch Address */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs bg-slate-50/50 p-4 border border-slate-150 rounded-2xl font-sans">
                      <div>
                        <span className="text-[9.5px] font-bold text-slate-400 block uppercase tracking-wider mb-1.5">RECIPIENT CUSTOMER INFO</span>
                        <span className="block font-black text-slate-800 text-sm">{trackedOrder.customerName}</span>
                        <span className="block font-mono text-slate-650 mt-1">{trackedOrder.phone}</span>
                        {trackedOrder.email && <span className="block text-slate-500 mt-0.5 font-mono">{trackedOrder.email}</span>}
                      </div>
                      <div>
                        <span className="text-[9.5px] font-bold text-slate-400 block uppercase tracking-wider mb-1.5">DISPATCH SHIPPING ADDRESS</span>
                        <span className="block font-medium text-slate-700">{trackedOrder.address}</span>
                        <span className="block font-bold text-slate-800 mt-1">Region: {trackedOrder.city.toUpperCase()}</span>
                      </div>
                    </div>

                    {/* Items table row details list */}
                    <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-xs bg-white">
                      <div className="p-3 bg-slate-50 border-b border-slate-150 select-none flex items-center justify-between text-[10.5px] font-bold text-slate-500 font-sans">
                        <span>PRODUCT DESCRIPTION</span>
                        <span>SUB-TOTALS</span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {trackedOrder.items.map((item, idx) => (
                          <div key={idx} className="p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {item.image ? (
                                <img src={item.image} className="h-10 w-10 rounded-lg object-cover border border-slate-200" alt="" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="h-10 w-10 bg-emerald-50 text-emerald-700 flex items-center justify-center rounded-lg border border-emerald-100 font-bold font-mono">
                                  {idx + 1}
                                </div>
                              )}
                              <div>
                                <h5 className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-tight">{item.productName}</h5>
                                <span className="text-[10.5px] text-slate-400 block font-sans mt-0.5">
                                  ৳ {item.price} x {item.quantity} {item.unit}
                                </span>
                              </div>
                            </div>
                            <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm shrink-0">
                              ৳ {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bill summary Breakdown */}
                    <div className="border-t border-gray-100 pt-5 space-y-2.5 text-slate-500 font-semibold text-xs font-sans">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <span className="text-slate-800 font-mono">৳ {trackedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      {trackedOrder.discount > 0 && (
                        <div className="flex justify-between text-rose-500">
                          <span>Coupons Discount</span>
                          <span className="font-mono font-bold">- ৳ {trackedOrder.discount.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Hygienic Home Shipping fee</span>
                        <span className="text-slate-850 font-mono">
                          {trackedOrder.deliveryFee === 0 ? 'FREE' : `৳ ${trackedOrder.deliveryFee}`}
                        </span>
                      </div>
                      
                      <div className="border-t border-solid border-slate-150 pt-4 flex justify-between font-black text-slate-900 text-base">
                        <span className="font-display uppercase tracking-tight">Net Bill Payable</span>
                        <span className="text-emerald-700 font-mono text-lg font-black">
                          ৳ {trackedOrder.total.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Printer and customer local options */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <span className="text-[10px] text-slate-400 font-sans tracking-wide">
                        Verified Securely. Thank you for buying from BAZAR THOLE.
                      </span>
                      <div className="flex items-center gap-2">
                        {/* Instant Print Button */}
                        <button
                          type="button"
                          onClick={() => {
                            const printWindow = window.open('', '', 'width=900,height=800');
                            if (printWindow) {
                              const pageData = `
                                <html>
                                <head>
                                  <title>BAZAR THOLE ORDER RECEIPT #${trackedOrder.id}</title>
                                  <style>
                                    body { font-family: system-ui, sans-serif; padding: 40px; color: #334155; }
                                    .invoice-box { border: 1px solid #e2e8f0; padding: 30px; border-radius: 16px; max-width: 800px; margin: 0 auto; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
                                    .flex { display: flex; justify-content: space-between; align-items: center; }
                                    h2 { color: #00796B; margin: 0; }
                                    .items-tbl { width: 100%; border-collapse: collapse; margin-top: 20px; }
                                    .items-tbl th, .items-tbl td { border: 1px solid #f1f5f9; padding: 10px; text-align: left; }
                                    .items-tbl th { background-color: #f8fafc; color: #475569; font-size: 11px; text-transform: uppercase; }
                                    .text-right { text-align: right; }
                                    .qr-wrapper { text-align: center; margin-top: 24px; }
                                    .qr-wrapper img { border: 1px solid #e2e8f0; padding: 8px; border-radius: 12px; }
                                  </style>
                                </head>
                                <body>
                                  <div className="invoice-box">
                                    <div className="flex" style="border-bottom: 2px solid #00796B; padding-bottom: 16px; margin-bottom: 20px;">
                                      <div>
                                        <h2>${settings.storeName.toUpperCase()}</h2>
                                        <p style="font-size: 11px; margin: 4px 0 0; color: #64748b; font-family: monospace;">CUSTOMERS TRACKING PORTAL RECEIPT</p>
                                      </div>
                                      <div style="text-align: right;">
                                        <h3 style="margin: 0;">ORDER #${trackedOrder.id}</h3>
                                        <p style="font-size: 12px; margin: 4px 0 0; color: #64748b;">DATE: ${new Date(trackedOrder.orderDate).toLocaleString()}</p>
                                      </div>
                                    </div>

                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 13px; margin-bottom: 20px;">
                                      <div>
                                        <strong style="color: #00796B;">SHIPPING RECIPIENT:</strong>
                                        <p style="margin: 4px 0;">${trackedOrder.customerName}</p>
                                        <p style="margin: 4px 0;">Phone: ${trackedOrder.phone}</p>
                                        <p style="margin: 4px 0;">Location: ${trackedOrder.address}, ${trackedOrder.city}</p>
                                      </div>
                                      <div style="text-align: right;">
                                        <strong>STATUS REPORT:</strong>
                                        <p style="margin: 4px 0;">Current State: <strong style="color: #00796B;">${trackedOrder.status}</strong></p>
                                        <p style="margin: 4px 0;">Tracking ID: ${trackedOrder.trackingCode}</p>
                                        <p style="margin: 4px 0;">Method: ${trackedOrder.paymentMethod}</p>
                                      </div>
                                    </div>

                                    <table className="items-tbl">
                                      <thead>
                                        <tr>
                                          <th>Description</th>
                                          <th className="text-right">Price</th>
                                          <th className="text-right">Qty</th>
                                          <th className="text-right">Total</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        ${trackedOrder.items.map(it => `
                                          <tr>
                                            <td><strong>${it.productName}</strong> (${it.unit})</td>
                                            <td class="text-right">৳${it.price}</td>
                                            <td class="text-right">${it.quantity}</td>
                                            <td class="text-right">৳${it.price * it.quantity}</td>
                                          </tr>
                                        `).join('')}
                                      </tbody>
                                    </table>

                                    <div style="margin-top: 20px; text-align: right; font-size: 13px; line-height: 1.6;">
                                      <p style="margin: 4px 0;">Subtotal: ৳${trackedOrder.subtotal}</p>
                                      ${trackedOrder.discount > 0 ? `<p style="margin: 4px 0; color: #ef4444;">Discount: -৳${trackedOrder.discount}</p>` : ''}
                                      <p style="margin: 4px 0;">Delivery Charge: ৳${trackedOrder.deliveryFee}</p>
                                      <h3 style="margin: 8px 0 0; color: #00796B; font-size: 18px;">Total Paid: ৳${trackedOrder.total}</h3>
                                    </div>

                                    <div className="qr-wrapper">
                                      <img src="${qrCodeUrl}" alt="" />
                                      <p style="font-size: 10px; color: #94a3b8; font-family: monospace; margin-top: 6px;">SCAN TO AUTHENTICATE INVOICE REGISTER</p>
                                    </div>
                                  </div>
                                </body>
                                </html>
                              `;
                              printWindow.document.write(pageData);
                              printWindow.document.close();
                              printWindow.onload = function() {
                                printWindow.print();
                                printWindow.close();
                              };
                            }
                          }}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <Printer className="h-3.5 w-3.5" /> Print Receipt
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const cleanStoreName = 'BAZAR THOLE';
                            const qrData = "ORDER-REPORT: #" + trackedOrder.id + "\n" +
                                           "Customer: " + trackedOrder.customerName + "\n" +
                                           "Phone: " + trackedOrder.phone + "\n" +
                                           "Total Amount: ৳" + trackedOrder.total + "\n" +
                                           "Tracking Code: " + (trackedOrder.trackingCode || "N/A") + "\n" +
                                           "Items:\n" + trackedOrder.items.map(it => " - " + it.productName + " (" + it.quantity + "x)").join("\n");
                            const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(qrData);
                            
                            const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Report #${trackedOrder.id} - ${settings.storeName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
        @page {
            size: A4 portrait;
            margin: 0 !important;
        }
        * {
            box-sizing: border-box !important;
            margin: 0;
            padding: 0;
        }
        html, body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Inter', 'Hind Siliguri', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* WEB ONLY: Gorgeous backdrop when viewed in browser */
        @media screen {
            html, body {
                background-color: #05100B !important;
                background-image: radial-gradient(circle at center, #0F2E1E 0%, #05100B 100%) !important;
                margin: 0 !important;
                padding: 0 !important;
                min-height: 100vh !important;
                display: block !important;
            }
            .invoice-wrapper {
                display: block;
                padding: 40px 15px;
                box-sizing: border-box;
                min-height: 100vh;
                width: 100%;
                overflow-x: auto;
                text-align: center;
            }
            .invoice-container {
                display: inline-flex !important;
                text-align: left;
                margin: 0 auto !important;
                box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(212, 175, 55, 0.2) !important;
                border-radius: 16px !important;
                background-color: #FAF8F5 !important;
                flex-shrink: 0 !important;
                transform-origin: top center;
                transition: transform 0.2s ease, zoom 0.2s ease;
            }
            /* Responsive scaling for PC and mobile browser viewports */
            @media (max-width: 840px) {
                .invoice-container { zoom: 0.9 !important; }
            }
            @media (max-width: 760px) {
                .invoice-container { zoom: 0.8 !important; }
            }
            @media (max-width: 680px) {
                .invoice-container { zoom: 0.7 !important; }
            }
            @media (max-width: 600px) {
                .invoice-container { zoom: 0.6 !important; }
            }
            @media (max-width: 520px) {
                .invoice-container { zoom: 0.5 !important; }
            }
            @media (max-width: 440px) {
                .invoice-container { zoom: 0.42 !important; }
            }
            @media (max-width: 360px) {
                .invoice-container { zoom: 0.36 !important; }
            }
        }

        /* PRINT ONLY: Clean layout mapping */
        @media print {
            html, body {
                background-color: #ffffff !important;
                width: 210mm !important;
                height: 297mm !important;
                overflow: hidden !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .invoice-wrapper {
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                height: 100% !important;
                display: block !important;
                overflow: visible !important;
            }
            .invoice-container {
                width: 210mm !important;
                height: 297mm !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                border: 12px solid #071F13 !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                box-sizing: border-box !important;
                zoom: 1 !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #05100B;">
    <div class="invoice-wrapper">
        <div class="invoice-container" style="width: 794px; height: 1120px; margin: 0; padding: 0; background-color: #FAF8F5; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; position: relative; font-family: 'Inter', 'Hind Siliguri', sans-serif; border: 12px solid #071F13; overflow: hidden;">
        
        <!-- Luxury corner notch ornaments -->
        <div style="position: absolute; top: 12px; left: 12px; width: 16px; height: 16px; border-top: 3px solid #D4AF37; border-left: 3px solid #D4AF37; z-index: 10;"></div>
        <div style="position: absolute; top: 12px; right: 12px; width: 16px; height: 16px; border-top: 3px solid #D4AF37; border-right: 3px solid #D4AF37; z-index: 10;"></div>
        <div style="position: absolute; bottom: 12px; left: 12px; width: 16px; height: 16px; border-bottom: 3px solid #D4AF37; border-left: 3px solid #D4AF37; z-index: 10;"></div>
        <div style="position: absolute; bottom: 12px; right: 12px; width: 16px; height: 16px; border-bottom: 3px solid #D4AF37; border-right: 3px solid #D4AF37; z-index: 10;"></div>
        
        <!-- Double line border frame inside the outer border -->
        <div style="position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 1px solid #D4AF37; pointer-events: none; z-index: 5;"></div>
        
        <!-- Top Luxury Header Block -->
        <div class="top-header" style="background-color: #071F13; padding: 22px 45px; color: #ffffff; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; width: 100%; border-bottom: 3px solid #D4AF37; position: relative; z-index: 2;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 44px; height: 44px; border: 2px solid #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: rgba(212, 175, 55, 0.05);">
                    <span style="font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 900; color: #D4AF37; letter-spacing: -1px;">BT</span>
                </div>
                <div class="brand-title-group" style="display: flex; flex-direction: column; text-align: left;">
                    <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1.5px; line-height: 1.0; text-transform: uppercase; color: #FCFBF9; font-family: 'Inter', sans-serif;">${cleanStoreName}</h1>
                    <div class="brand-protocol-sub" style="font-size: 7.5px; font-weight: 700; color: #D4AF37; letter-spacing: 1.2px; text-transform: uppercase; margin-top: 4px; font-family: 'Inter', sans-serif;">PREMIUM ORGANIC FOODS // PLATINUM SECURED RECEIPT</div>
                </div>
            </div>
            <div class="system-meta-details" style="text-align: right; font-family: monospace; font-size: 9px; line-height: 1.4; color: rgba(252, 251, 249, 0.85); font-weight: 500;">
                <span style="color: #D4AF37;">STATION:</span> HUB_CENTRAL<br/>
                <span style="color: #D4AF37;">TIME:</span> ${new Date(trackedOrder.orderDate).toLocaleTimeString('en-US', { hour12: false })}<br/>
                <span style="color: #D4AF37;">CLIENT:</span> WEB_PORTAL_V2
            </div>
        </div>

        <!-- Middle Area -->
        <div class="invoice-body-wrapper" style="flex: 1; padding: 24px 45px 15px 45px; display: flex; flex-direction: column; box-sizing: border-box; width: 100%; z-index: 2; position: relative;">
            
            <!-- Document sheet inner card with elegant background -->
            <div class="document-sheet" style="background-color: #ffffff; border: 1px solid #E5DFD5; padding: 26px 30px; box-sizing: border-box; flex: 1; position: relative; display: flex; flex-direction: column; width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(15, 46, 30, 0.03);">
                
                <!-- Decorative Gold Watermark background -->
                <div class="sheet-watermark" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-15deg); font-size: 48px; font-weight: 950; color: rgba(212, 175, 55, 0.025); text-transform: uppercase; letter-spacing: 8px; pointer-events: none; white-space: nowrap; text-align: center; z-index: 1;">${cleanStoreName} ORIGINAL</div>

                <!-- Gold certified seal badge (CSS only) -->
                <div style="position: absolute; bottom: 85px; left: 35px; width: 75px; height: 75px; border: 1px dashed #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: rotate(-8deg); background-color: rgba(212, 175, 55, 0.02); z-index: 5; pointer-events: none;">
                    <div style="width: 65px; height: 65px; border: 1px double #D4AF37; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2px; box-sizing: border-box;">
                        <span style="font-size: 5.5px; font-weight: 900; color: #D4AF37; letter-spacing: 0.5px; text-transform: uppercase; line-height: 1;">100% PURE</span>
                        <span style="font-size: 8px; font-weight: 950; color: #071F13; letter-spacing: 0.5px; margin: 1px 0; line-height: 1;">ORGANIC</span>
                        <span style="font-size: 5px; font-weight: 800; color: #D4AF37; line-height: 1;">SECURED</span>
                    </div>
                </div>

                <div class="sheet-content-inner" style="position: relative; z-index: 2; width: 100%; height: 100%; display: flex; flex-direction: column; flex: 1; box-sizing: border-box;">
                    
                    <!-- Header inside sheet -->
                    <div class="invoice-section-title-wrapper" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; width: 100%; border-bottom: 1px solid #E5DFD5; padding-bottom: 10px;">
                        <div class="invoice-title-block" style="text-align: left;">
                            <h2 style="font-size: 19px; font-weight: 900; color: #071F13; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 2px 0; font-family: 'Inter', sans-serif;">OFFICIAL STATEMENT</h2>
                            <span style="font-size: 8.5px; color: #8A857C; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">TAX INVOICE AND TRANSACTION RECORD</span>
                        </div>
                        <div style="background-color: #071F13; color: #D4AF37; font-size: 8.5px; font-weight: 800; padding: 4px 8px; border-radius: 4px; letter-spacing: 1px; font-family: monospace;">ORIGINAL_COPY</div>
                    </div>

                    <!-- Details grid -->
                    <div class="details-grid" style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 18px; width: 100%;">
                        
                        <!-- Invoice Metadata -->
                        <div class="meta-details-list" style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; line-height: 1.5; width: 50%; text-align: left; border-left: 3px solid #D4AF37; padding-left: 12px; box-sizing: border-box;">
                            <div class="meta-detail-row" style="display: flex; align-items: center;">
                                <span class="meta-detail-label" style="font-weight: 800; color: #8A857C; text-transform: uppercase; font-size: 9px; width: 100px; letter-spacing: 0.5px; display: inline-block;">INVOICE ID:</span>
                                <span class="meta-detail-value" style="color: #071F13; font-weight: 800; font-family: 'Inter', sans-serif;">#ORD-${trackedOrder.id}</span>
                            </div>
                            <div class="meta-detail-row" style="display: flex; align-items: center;">
                                <span class="meta-detail-label" style="font-weight: 800; color: #8A857C; text-transform: uppercase; font-size: 9px; width: 100px; letter-spacing: 0.5px; display: inline-block;">DATE ISSUED:</span>
                                <span class="meta-detail-value" style="color: #1e293b; font-weight: 700;">${new Date(trackedOrder.orderDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                            <div class="meta-detail-row" style="display: flex; align-items: center;">
                                <span class="meta-detail-label" style="font-weight: 800; color: #8A857C; text-transform: uppercase; font-size: 9px; width: 100px; letter-spacing: 0.5px; display: inline-block;">TRACKING KEY:</span>
                                <span class="meta-detail-value" style="color: #1e293b; font-weight: 700; font-family: monospace;">${trackedOrder.trackingCode || 'PROCESSING'}</span>
                            </div>
                            <div class="meta-detail-row" style="display: flex; align-items: center;">
                                <span class="meta-detail-label" style="font-weight: 800; color: #8A857C; text-transform: uppercase; font-size: 9px; width: 100px; letter-spacing: 0.5px; display: inline-block;">PAY METHOD:</span>
                                <span class="meta-detail-value" style="color: #1e293b; font-weight: 700;">${trackedOrder.paymentMethod}</span>
                            </div>
                        </div>

                        <!-- Bill To Section -->
                        <div class="bill-to-destination-card" style="width: 50%; text-align: right; display: flex; flex-direction: column; align-items: flex-end; border-right: 3px solid #071F13; padding-right: 12px; box-sizing: border-box;">
                            <span class="bill-to-title-label" style="font-size: 9px; font-weight: 900; color: #071F13; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; display: block;">SHIPPING RECIPIENT:</span>
                            <span class="bill-to-info-line" style="font-size: 13px; color: #071F13; font-weight: 800; margin: 1px 0; line-height: 1.2; display: block; font-family: 'Inter', 'Hind Siliguri', sans-serif;">${trackedOrder.customerName}</span>
                            <span class="bill-to-info-line" style="font-size: 11px; color: #475569; font-weight: 600; margin: 1px 0; display: block;">Phone: ${trackedOrder.phone}</span>
                            ${trackedOrder.email ? '<span class="bill-to-info-line" style="font-size: 11px; color: #475569; font-weight: 600; margin: 1px 0; display: block;">Email: ' + trackedOrder.email + '</span>' : ''}
                            <span class="bill-to-info-line" style="font-size: 11px; color: #475569; font-weight: 600; margin: 1px 0; line-height: 1.2; display: block; font-family: 'Inter', 'Hind Siliguri', sans-serif;">${trackedOrder.address}</span>
                            <span class="bill-to-info-line" style="font-size: 11px; color: #071F13; font-weight: 700; margin: 1px 0; display: block; text-transform: uppercase; font-family: 'Inter', 'Hind Siliguri', sans-serif;">${trackedOrder.city}</span>
                        </div>
                    </div>

                    <!-- Items Table -->
                    <div class="manifest-table-wrapper" style="margin-bottom: 15px; width: 100%;">
                        <table class="manifest-data-grid" style="width: 100%; border-collapse: collapse; font-family: 'Inter', 'Hind Siliguri', sans-serif;">
                            <thead>
                                <tr>
                                    <th style="width: 50%; background-color: #071F13; color: #ffffff; font-weight: 700; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 14px; text-align: left; border: 1px solid #071F13; border-bottom: 3px solid #D4AF37;">Product Description</th>
                                    <th style="width: 15%; background-color: #071F13; color: #ffffff; font-weight: 700; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 14px; text-align: right; border: 1px solid #071F13; border-bottom: 3px solid #D4AF37;">QTY</th>
                                    <th style="width: 15%; background-color: #071F13; color: #ffffff; font-weight: 700; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 14px; text-align: right; border: 1px solid #071F13; border-bottom: 3px solid #D4AF37;">Unit Price</th>
                                    <th style="width: 20%; background-color: #071F13; color: #ffffff; font-weight: 700; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 14px; text-align: right; border: 1px solid #071F13; border-bottom: 3px solid #D4AF37;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${trackedOrder.items.map((it, i) => `
                                    <tr style="background-color: ${i % 2 === 0 ? '#FAF9F6' : '#ffffff'};">
                                        <td style="padding: 9px 14px; border: 1px solid #E5DFD5; font-size: 11.5px; color: #1e293b; vertical-align: middle; text-align: left;">
                                            <strong style="color: #071F13; font-family: 'Inter', 'Hind Siliguri', sans-serif;">${it.productName}</strong>
                                            <span style="color: #8A857C; font-size: 9.5px; font-weight: 600; margin-left: 5px;">(${it.unit})</span>
                                        </td>
                                        <td style="padding: 9px 14px; border: 1px solid #E5DFD5; font-size: 11.5px; color: #071F13; font-weight: 700; vertical-align: middle; text-align: right;">x${it.quantity}</td>
                                        <td style="padding: 9px 14px; border: 1px solid #E5DFD5; font-size: 11.5px; color: #475569; vertical-align: middle; text-align: right;">৳${it.price}</td>
                                        <td style="padding: 9px 14px; border: 1px solid #E5DFD5; font-size: 12px; color: #071F13; font-weight: 800; vertical-align: middle; text-align: right;">৳${it.price * it.quantity}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Verification & Trust Indicators (Fills the faka space beautifully using margin-top: auto) -->
                    <div class="trust-signature-block" style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 20px; margin-top: auto; margin-bottom: 15px; border-top: 1px dashed #E5DFD5; padding-top: 15px; box-sizing: border-box; width: 100%;">
                        <!-- Organic Assurance Seals -->
                        <div style="display: flex; flex-direction: column; gap: 5px; text-align: left; box-sizing: border-box;">
                            <span style="font-size: 9px; font-weight: 900; color: #071F13; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">BAZAR THOLE SAFE FOODS DECREE:</span>
                            <div style="display: grid; grid-template-columns: 1fr; gap: 4px; font-size: 9px; font-weight: 700; color: #475569; font-family: 'Inter', 'Hind Siliguri', sans-serif;">
                                <div style="display: flex; align-items: center; gap: 5px;"><span style="color: #D4AF37; font-size: 10px;">✔</span> 100% Formalin-Free Secured (শতভাগ ফরমালিন মুক্ত)</div>
                                <div style="display: flex; align-items: center; gap: 5px;"><span style="color: #D4AF37; font-size: 10px;">✔</span> Sourced Directly from Local Farmers (কৃষক থেকে সরাসরি)</div>
                                <div style="display: flex; align-items: center; gap: 5px;"><span style="color: #D4AF37; font-size: 10px;">✔</span> Strict Hygienic Sort & Deliver (নিরাপদ ও স্বাস্থ্যসম্মত বাছাই)</div>
                            </div>
                        </div>
                        
                        <!-- Authority Signatures -->
                        <div style="display: flex; justify-content: flex-end; align-items: flex-end; gap: 20px; box-sizing: border-box;">
                            <div style="text-align: center;">
                                <div style="font-family: 'Georgia', serif; font-style: italic; font-size: 13px; color: #071F13; margin-bottom: 2px; border-bottom: 1px solid #D4AF37; padding-bottom: 2px; width: 95px; letter-spacing: 0.5px;">Bazar Thole</div>
                                <span style="font-size: 7.5px; font-weight: 800; color: #8A857C; text-transform: uppercase; letter-spacing: 0.5px; display: block;">DISPATCH OFFICER</span>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-family: 'Georgia', serif; font-style: italic; font-size: 13px; color: #071F13; margin-bottom: 2px; border-bottom: 1px solid #D4AF37; padding-bottom: 2px; width: 95px; letter-spacing: 0.5px;">Verified Safe</div>
                                <span style="font-size: 7.5px; font-weight: 800; color: #8A857C; text-transform: uppercase; letter-spacing: 0.5px; display: block;">QUALITY TRUSTEE</span>
                            </div>
                        </div>
                    </div>

                    <!-- Summary calculation area -->
                    <div class="bottom-summary-container" style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; border-top: 1px solid #E5DFD5; padding-top: 12px; box-sizing: border-box;">
                        
                        <!-- Left QR code scanner -->
                        <div class="qr-verification-box" style="display: flex; align-items: center; gap: 10px; background-color: #FAF9F6; border: 1px solid #E5DFD5; padding: 6px 12px; border-radius: 6px; border-left: 4px solid #071F13; box-sizing: border-box;">
                            <img src="${qrCodeUrl}" alt="Order QR Code" style="width: 48px; height: 48px; border: 1px solid #E5DFD5; border-radius: 3px; background-color: #ffffff; padding: 1px;" />
                            <div class="qr-verification-caption" style="font-size: 7.5px; font-weight: 700; color: #8A857C; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.3; max-width: 110px;">SCAN REGISTRY CODES TO VERIFY ORIGINAL STATEMENT</div>
                        </div>

                        <!-- Right Totals Calculations -->
                        <div class="totals-calculation-block" style="width: 260px; display: flex; flex-direction: column; box-sizing: border-box;">
                            <div class="summary-calculation-row" style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 4px; font-weight: 700; text-transform: uppercase; width: 100%;">
                                <span>Cart Subtotal:</span>
                                <strong style="color: #071F13; font-weight: 700;">৳${trackedOrder.subtotal}</strong>
                            </div>
                            ${trackedOrder.discount > 0 ? `
                                <div class="summary-calculation-row discount-subtraction" style="display: flex; justify-content: space-between; font-size: 11px; color: #b91c1c; margin-bottom: 4px; font-weight: 700; text-transform: uppercase; width: 100%;">
                                    <span>Discounts:</span>
                                    <strong style="color: #b91c1c; font-weight: 700;">-৳${trackedOrder.discount}</strong>
                                </div>
                            ` : ''}
                            <div class="summary-calculation-row" style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 4px; font-weight: 700; text-transform: uppercase; width: 100%;">
                                <span>Delivery Cost:</span>
                                <strong style="color: #071F13; font-weight: 700;">৳${trackedOrder.deliveryFee}</strong>
                            </div>
                            
                            <!-- Premium Grand Total Banner -->
                            <div class="grand-total-solid-banner" style="background-color: #071F13; color: #ffffff; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; margin-top: 6px; box-sizing: border-box; width: 100%; border-radius: 6px; border: 1px solid #D4AF37; box-shadow: 0 4px 10px rgba(15, 46, 30, 0.15);">
                                <span style="font-weight: 900; font-size: 10px; letter-spacing: 0.8px; text-transform: uppercase; color: #D4AF37;">Amount Due:</span>
                                <strong style="font-weight: 900; font-size: 15px; color: #FCFBF9;">৳${trackedOrder.total}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer Area -->
        <div style="padding: 0 45px 22px 45px; box-sizing: border-box; width: 100%; z-index: 2; position: relative;">
            <div class="footer-rule-accent" style="height: 1px; background-color: #D4AF37; margin-bottom: 8px; width: 100%;"></div>
            <p class="footer-caps-note" style="text-align: center; font-size: 8.5px; font-weight: 700; color: #8A857C; text-transform: uppercase; letter-spacing: 1px; margin: 0; line-height: 1.4;">
                ★ THANK YOU FOR BUYING HYGIENIC ORGANIC FOODS WITH ${cleanStoreName} ★<br/>
                QUESTIONS OR ORDER ASSISTANCE? CALL: ${settings.phone} // EMAIL: ${settings.email || 'SUPPORT@BAZARTHOLE.COM'}
            </p>
        </div>
    </div>
</div>

<script>
    function adjustScale() {
        const container = document.querySelector('.invoice-container');
        const wrapper = document.querySelector('.invoice-wrapper');
        if (!container || !wrapper) return;
        
        const designWidth = 794;
        const designHeight = 1120;
        const availableWidth = window.innerWidth - 30;
        
        if (availableWidth < designWidth) {
            const scale = availableWidth / designWidth;
            container.style.transform = 'scale(' + scale + ')';
            container.style.transformOrigin = 'top center';
            container.style.zoom = '1';
            container.style.webkitZoom = '1';
            const offset = designHeight * (1 - scale);
            container.style.marginBottom = '-' + offset + 'px';
        } else {
            container.style.transform = 'none';
            container.style.marginBottom = '0px';
        }
    }
    window.addEventListener('load', adjustScale);
    window.addEventListener('resize', adjustScale);
    document.addEventListener('DOMContentLoaded', adjustScale);
</script>
</body>
</html>
`;

                            const handleSaveHtml = () => {
                              const printScript = `
                              <script>
                                  window.onload = function() {
                                      setTimeout(function() {
                                          window.print();
                                      }, 500);
                                  };
                              </script>
                              `;
                              const fallbackHtml = reportHtml.replace('</body>', `${printScript}</body>`);
                              const blob = new Blob([fallbackHtml], { type: 'text/html;charset=utf-8' });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = "BAZAR_THOLE_INVOICE_REPORT_" + trackedOrder.id + ".html";
                              link.style.display = 'none';
                              document.body.appendChild(link);
                              link.click();
                              setTimeout(() => {
                                document.body.removeChild(link);
                                URL.revokeObjectURL(url);
                              }, 300);

                              triggerToast(`📥 saved clean BAZAR THOLE Web HTML invoice! Open it to print.`);
                            };

                            const downloadPdf = async () => {
                              try {
                                const html2pdf = (window as any).html2pdf;
                                if (!html2pdf) {
                                  throw new Error('html2pdf script not loaded yet.');
                                }

                                const iframe = document.createElement('iframe');
                                iframe.style.position = 'fixed';
                                iframe.style.left = '0';
                                iframe.style.top = '0';
                                iframe.style.width = '794px';
                                iframe.style.height = '1120px';
                                iframe.style.border = 'none';
                                iframe.style.margin = '0';
                                iframe.style.padding = '0';
                                iframe.style.zIndex = '-99999';
                                iframe.style.visibility = 'hidden';
                                document.body.appendChild(iframe);

                                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                                if (!iframeDoc) {
                                  throw new Error('Failed to access iframe document');
                                }

                                iframeDoc.open();
                                iframeDoc.write(reportHtml);
                                iframeDoc.close();

                                const images = iframeDoc.getElementsByTagName('img');
                                const imgPromises = Array.from(images).map(img => {
                                  if (img.complete) return Promise.resolve();
                                  return new Promise(resolve => {
                                    img.onload = resolve;
                                    img.onerror = resolve;
                                  });
                                });

                                await Promise.all([
                                  ...imgPromises,
                                  new Promise(resolve => setTimeout(resolve, 1000))
                                ]);

                                const targetElement = iframeDoc.querySelector('.invoice-container') || iframeDoc.body;

                                 const opt = {
                                  margin: 0,
                                  filename: "BAZAR_THOLE_INVOICE_REPORT_" + trackedOrder.id + ".pdf",
                                  image: { type: 'jpeg', quality: 0.98 },
                                  html2canvas: { 
                                    scale: 2, 
                                    useCORS: true, 
                                    logging: false,
                                    backgroundColor: '#ffffff',
                                    scrollX: 0,
                                    scrollY: 0,
                                    windowWidth: 794,
                                    width: 794,
                                    height: 1120,
                                    onclone: (clonedDoc: any) => {
                                      const html = clonedDoc.documentElement;
                                      const body = clonedDoc.body;
                                      
                                      if (html) {
                                        html.style.width = '794px';
                                        html.style.height = '1120px';
                                        html.style.margin = '0';
                                        html.style.padding = '0';
                                        html.style.overflow = 'hidden';
                                      }
                                      
                                      if (body) {
                                        body.style.width = '794px';
                                        body.style.minWidth = '794px';
                                        body.style.maxWidth = '794px';
                                        body.style.height = '1120px';
                                        body.style.minHeight = '1120px';
                                        body.style.maxHeight = '1120px';
                                        body.style.margin = '0';
                                        body.style.padding = '0';
                                        body.style.overflow = 'hidden';
                                        body.style.backgroundColor = '#ffffff';
                                        body.style.display = 'block';
                                        body.style.position = 'relative';
                                      }
                                      
                                      const container = clonedDoc.querySelector('.invoice-container');
                                      if (container) {
                                        container.style.width = '794px';
                                        container.style.height = '1120px';
                                        container.style.position = 'absolute';
                                        container.style.left = '0';
                                        container.style.top = '0';
                                        container.style.margin = '0';
                                        container.style.padding = '0';
                                        container.style.transform = 'none';
                                        container.style.zoom = '1';
                                        container.style.webkitZoom = '1';
                                        container.style.boxSizing = 'border-box';
                                      }

                                      // Inject style to strip all responsive zoom & overflow scaling from PDF capture
                                      const pdfStyle = clonedDoc.createElement('style');
                                      pdfStyle.innerHTML = `
                                        @media screen, print {
                                          html, body {
                                            width: 794px !important;
                                            height: 1120px !important;
                                            margin: 0 !important;
                                            padding: 0 !important;
                                            overflow: hidden !important;
                                            background-color: #ffffff !important;
                                          }
                                          .invoice-wrapper {
                                            width: 794px !important;
                                            height: 1120px !important;
                                            padding: 0 !important;
                                            margin: 0 !important;
                                            overflow: hidden !important;
                                            display: block !important;
                                          }
                                          .invoice-container {
                                            width: 794px !important;
                                            height: 1120px !important;
                                            zoom: 1 !important;
                                            -moz-transform: none !important;
                                            transform: none !important;
                                            position: absolute !important;
                                            left: 0 !important;
                                            top: 0 !important;
                                            margin: 0 !important;
                                            padding: 0 !important;
                                            box-sizing: border-box !important;
                                          }
                                        }
                                      `;
                                      clonedDoc.head.appendChild(pdfStyle);
                                    }
                                  },
                                  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
                                };


                                await html2pdf().from(targetElement).set(opt).save();

                                document.body.removeChild(iframe);

                                triggerToast(`📥 Invoice PDF for Order #${trackedOrder.id} has been saved directly to your device.`);
                              } catch (err) {
                                console.error("PDF generation failed, falling back to instant print HTML:", err);
                                handleSaveHtml();
                              }
                            };

                            downloadPdf();
                          }}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          📥 Save PDF Invoice
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const cleanStoreName = 'BAZAR THOLE';
                            const qrData = "ORDER-REPORT: #" + trackedOrder.id + "\n" +
                                           "Customer: " + trackedOrder.customerName + "\n" +
                                           "Phone: " + trackedOrder.phone + "\n" +
                                           "Total Amount: ৳" + trackedOrder.total + "\n" +
                                           "Tracking Code: " + (trackedOrder.trackingCode || "N/A") + "\n" +
                                           "Items:\n" + trackedOrder.items.map(it => " - " + it.productName + " (" + it.quantity + "x)").join("\n");
                            const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" + encodeURIComponent(qrData);
                            
                            const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Report #${trackedOrder.id} - ${settings.storeName}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
        @page {
            size: A4 portrait;
            margin: 0 !important;
        }
        * {
            box-sizing: border-box !important;
            margin: 0;
            padding: 0;
        }
        html, body {
            margin: 0 !important;
            padding: 0 !important;
            font-family: 'Inter', 'Hind Siliguri', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* WEB ONLY: Gorgeous backdrop when viewed in browser */
        @media screen {
            html, body {
                background-color: #05100B !important;
                background-image: radial-gradient(circle at center, #0F2E1E 0%, #05100B 100%) !important;
                margin: 0 !important;
                padding: 0 !important;
                min-height: 100vh !important;
                display: block !important;
            }
            .invoice-wrapper {
                display: block;
                padding: 40px 15px;
                box-sizing: border-box;
                min-height: 100vh;
                width: 100%;
                overflow-x: auto;
                text-align: center;
            }
            .invoice-container {
                display: inline-flex !important;
                text-align: left;
                margin: 0 auto !important;
                box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(212, 175, 55, 0.2) !important;
                border-radius: 16px !important;
                background-color: #FAF8F5 !important;
                flex-shrink: 0 !important;
                transform-origin: top center;
                transition: transform 0.2s ease, zoom 0.2s ease;
            }
            /* Responsive scaling for PC and mobile browser viewports */
            @media (max-width: 840px) {
                .invoice-container { zoom: 0.9 !important; }
            }
            @media (max-width: 760px) {
                .invoice-container { zoom: 0.8 !important; }
            }
            @media (max-width: 680px) {
                .invoice-container { zoom: 0.7 !important; }
            }
            @media (max-width: 600px) {
                .invoice-container { zoom: 0.6 !important; }
            }
            @media (max-width: 520px) {
                .invoice-container { zoom: 0.5 !important; }
            }
            @media (max-width: 440px) {
                .invoice-container { zoom: 0.42 !important; }
            }
            @media (max-width: 360px) {
                .invoice-container { zoom: 0.36 !important; }
            }
        }

        /* PRINT ONLY: Clean layout mapping */
        @media print {
            html, body {
                background-color: #ffffff !important;
                width: 210mm !important;
                height: 297mm !important;
                overflow: hidden !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .invoice-wrapper {
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                height: 100% !important;
                display: block !important;
                overflow: visible !important;
            }
            .invoice-container {
                width: 210mm !important;
                height: 297mm !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border-radius: 0 !important;
                border: 12px solid #071F13 !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
                box-sizing: border-box !important;
                zoom: 1 !important;
            }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #05100B;">
    <div class="invoice-wrapper">
        <div class="invoice-container" style="width: 794px; height: 1120px; margin: 0; padding: 0; background-color: #FAF8F5; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; position: relative; font-family: 'Inter', 'Hind Siliguri', sans-serif; border: 12px solid #071F13; overflow: hidden;">
        
        <!-- Luxury corner notch ornaments -->
        <div style="position: absolute; top: 12px; left: 12px; width: 16px; height: 16px; border-top: 3px solid #D4AF37; border-left: 3px solid #D4AF37; z-index: 10;"></div>
        <div style="position: absolute; top: 12px; right: 12px; width: 16px; height: 16px; border-top: 3px solid #D4AF37; border-right: 3px solid #D4AF37; z-index: 10;"></div>
        <div style="position: absolute; bottom: 12px; left: 12px; width: 16px; height: 16px; border-bottom: 3px solid #D4AF37; border-left: 3px solid #D4AF37; z-index: 10;"></div>
        <div style="position: absolute; bottom: 12px; right: 12px; width: 16px; height: 16px; border-bottom: 3px solid #D4AF37; border-right: 3px solid #D4AF37; z-index: 10;"></div>
        
        <!-- Double line border frame inside the outer border -->
        <div style="position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 1px solid #D4AF37; pointer-events: none; z-index: 5;"></div>
        
        <!-- Top Luxury Header Block -->
        <div class="top-header" style="background-color: #071F13; padding: 22px 45px; color: #ffffff; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box; width: 100%; border-bottom: 3px solid #D4AF37; position: relative; z-index: 2;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="width: 44px; height: 44px; border: 2px solid #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; background-color: rgba(212, 175, 55, 0.05);">
                    <span style="font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 900; color: #D4AF37; letter-spacing: -1px;">BT</span>
                </div>
                <div class="brand-title-group" style="display: flex; flex-direction: column; text-align: left;">
                    <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 1.5px; line-height: 1.0; text-transform: uppercase; color: #FCFBF9; font-family: 'Inter', sans-serif;">${cleanStoreName}</h1>
                    <div class="brand-protocol-sub" style="font-size: 7.5px; font-weight: 700; color: #D4AF37; letter-spacing: 1.2px; text-transform: uppercase; margin-top: 4px; font-family: 'Inter', sans-serif;">PREMIUM ORGANIC FOODS // PLATINUM SECURED RECEIPT</div>
                </div>
            </div>
            <div class="system-meta-details" style="text-align: right; font-family: monospace; font-size: 9px; line-height: 1.4; color: rgba(252, 251, 249, 0.85); font-weight: 500;">
                <span style="color: #D4AF37;">STATION:</span> HUB_CENTRAL<br/>
                <span style="color: #D4AF37;">TIME:</span> ${new Date(trackedOrder.orderDate).toLocaleTimeString('en-US', { hour12: false })}<br/>
                <span style="color: #D4AF37;">CLIENT:</span> WEB_PORTAL_V2
            </div>
        </div>

        <!-- Middle Area -->
        <div class="invoice-body-wrapper" style="flex: 1; padding: 24px 45px 15px 45px; display: flex; flex-direction: column; box-sizing: border-box; width: 100%; z-index: 2; position: relative;">
            
            <!-- Document sheet inner card with elegant background -->
            <div class="document-sheet" style="background-color: #ffffff; border: 1px solid #E5DFD5; padding: 26px 30px; box-sizing: border-box; flex: 1; position: relative; display: flex; flex-direction: column; width: 100%; border-radius: 8px; box-shadow: 0 4px 12px rgba(15, 46, 30, 0.03);">
                
                <!-- Decorative Gold Watermark background -->
                <div class="sheet-watermark" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-15deg); font-size: 48px; font-weight: 950; color: rgba(212, 175, 55, 0.025); text-transform: uppercase; letter-spacing: 8px; pointer-events: none; white-space: nowrap; text-align: center; z-index: 1;">${cleanStoreName} ORIGINAL</div>

                <!-- Gold certified seal badge (CSS only) -->
                <div style="position: absolute; bottom: 85px; left: 35px; width: 75px; height: 75px; border: 1px dashed #D4AF37; border-radius: 50%; display: flex; align-items: center; justify-content: center; transform: rotate(-8deg); background-color: rgba(212, 175, 55, 0.02); z-index: 5; pointer-events: none;">
                    <div style="width: 65px; height: 65px; border: 1px double #D4AF37; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2px; box-sizing: border-box;">
                        <span style="font-size: 5.5px; font-weight: 900; color: #D4AF37; letter-spacing: 0.5px; text-transform: uppercase; line-height: 1;">100% PURE</span>
                        <span style="font-size: 8px; font-weight: 950; color: #071F13; letter-spacing: 0.5px; margin: 1px 0; line-height: 1;">ORGANIC</span>
                        <span style="font-size: 5px; font-weight: 800; color: #D4AF37; line-height: 1;">SECURED</span>
                    </div>
                </div>

                <div class="sheet-content-inner" style="position: relative; z-index: 2; width: 100%; height: 100%; display: flex; flex-direction: column; flex: 1; box-sizing: border-box;">
                    
                    <!-- Header inside sheet -->
                    <div class="invoice-section-title-wrapper" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; width: 100%; border-bottom: 1px solid #E5DFD5; padding-bottom: 10px;">
                        <div class="invoice-title-block" style="text-align: left;">
                            <h2 style="font-size: 19px; font-weight: 900; color: #071F13; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 2px 0; font-family: 'Inter', sans-serif;">OFFICIAL STATEMENT</h2>
                            <span style="font-size: 8.5px; color: #8A857C; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px;">TAX INVOICE AND TRANSACTION RECORD</span>
                        </div>
                        <div style="background-color: #071F13; color: #D4AF37; font-size: 8.5px; font-weight: 800; padding: 4px 8px; border-radius: 4px; letter-spacing: 1px; font-family: monospace;">ORIGINAL_COPY</div>
                    </div>

                    <!-- Details grid -->
                    <div class="details-grid" style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 18px; width: 100%;">
                        
                        <!-- Invoice Metadata -->
                        <div class="meta-details-list" style="display: flex; flex-direction: column; gap: 4px; font-size: 11px; line-height: 1.5; width: 50%; text-align: left; border-left: 3px solid #D4AF37; padding-left: 12px; box-sizing: border-box;">
                            <div class="meta-detail-row" style="display: flex; align-items: center;">
                                <span class="meta-detail-label" style="font-weight: 800; color: #8A857C; text-transform: uppercase; font-size: 9px; width: 100px; letter-spacing: 0.5px; display: inline-block;">INVOICE ID:</span>
                                <span class="meta-detail-value" style="color: #071F13; font-weight: 800; font-family: 'Inter', sans-serif;">#ORD-${trackedOrder.id}</span>
                            </div>
                            <div class="meta-detail-row" style="display: flex; align-items: center;">
                                <span class="meta-detail-label" style="font-weight: 800; color: #8A857C; text-transform: uppercase; font-size: 9px; width: 100px; letter-spacing: 0.5px; display: inline-block;">DATE ISSUED:</span>
                                <span class="meta-detail-value" style="color: #1e293b; font-weight: 700;">${new Date(trackedOrder.orderDate).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                            <div class="meta-detail-row" style="display: flex; align-items: center;">
                                <span class="meta-detail-label" style="font-weight: 800; color: #8A857C; text-transform: uppercase; font-size: 9px; width: 100px; letter-spacing: 0.5px; display: inline-block;">TRACKING KEY:</span>
                                <span class="meta-detail-value" style="color: #1e293b; font-weight: 700; font-family: monospace;">${trackedOrder.trackingCode || 'PROCESSING'}</span>
                            </div>
                            <div class="meta-detail-row" style="display: flex; align-items: center;">
                                <span class="meta-detail-label" style="font-weight: 800; color: #8A857C; text-transform: uppercase; font-size: 9px; width: 100px; letter-spacing: 0.5px; display: inline-block;">PAY METHOD:</span>
                                <span class="meta-detail-value" style="color: #1e293b; font-weight: 700;">${trackedOrder.paymentMethod}</span>
                            </div>
                        </div>

                        <!-- Bill To Section -->
                        <div class="bill-to-destination-card" style="width: 50%; text-align: right; display: flex; flex-direction: column; align-items: flex-end; border-right: 3px solid #071F13; padding-right: 12px; box-sizing: border-box;">
                            <span class="bill-to-title-label" style="font-size: 9px; font-weight: 900; color: #071F13; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; display: block;">SHIPPING RECIPIENT:</span>
                            <span class="bill-to-info-line" style="font-size: 13px; color: #071F13; font-weight: 800; margin: 1px 0; line-height: 1.2; display: block; font-family: 'Inter', 'Hind Siliguri', sans-serif;">${trackedOrder.customerName}</span>
                            <span class="bill-to-info-line" style="font-size: 11px; color: #475569; font-weight: 600; margin: 1px 0; display: block;">Phone: ${trackedOrder.phone}</span>
                            ${trackedOrder.email ? '<span class="bill-to-info-line" style="font-size: 11px; color: #475569; font-weight: 600; margin: 1px 0; display: block;">Email: ' + trackedOrder.email + '</span>' : ''}
                            <span class="bill-to-info-line" style="font-size: 11px; color: #475569; font-weight: 600; margin: 1px 0; line-height: 1.2; display: block; font-family: 'Inter', 'Hind Siliguri', sans-serif;">${trackedOrder.address}</span>
                            <span class="bill-to-info-line" style="font-size: 11px; color: #071F13; font-weight: 700; margin: 1px 0; display: block; text-transform: uppercase; font-family: 'Inter', 'Hind Siliguri', sans-serif;">${trackedOrder.city}</span>
                        </div>
                    </div>

                    <!-- Items Table -->
                    <div class="manifest-table-wrapper" style="margin-bottom: 15px; width: 100%;">
                        <table class="manifest-data-grid" style="width: 100%; border-collapse: collapse; font-family: 'Inter', 'Hind Siliguri', sans-serif;">
                            <thead>
                                <tr>
                                    <th style="width: 50%; background-color: #071F13; color: #ffffff; font-weight: 700; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 14px; text-align: left; border: 1px solid #071F13; border-bottom: 3px solid #D4AF37;">Product Description</th>
                                    <th style="width: 15%; background-color: #071F13; color: #ffffff; font-weight: 700; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 14px; text-align: right; border: 1px solid #071F13; border-bottom: 3px solid #D4AF37;">QTY</th>
                                    <th style="width: 15%; background-color: #071F13; color: #ffffff; font-weight: 700; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 14px; text-align: right; border: 1px solid #071F13; border-bottom: 3px solid #D4AF37;">Unit Price</th>
                                    <th style="width: 20%; background-color: #071F13; color: #ffffff; font-weight: 700; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.8px; padding: 10px 14px; text-align: right; border: 1px solid #071F13; border-bottom: 3px solid #D4AF37;">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${trackedOrder.items.map((it, i) => `
                                    <tr style="background-color: ${i % 2 === 0 ? '#FAF9F6' : '#ffffff'};">
                                        <td style="padding: 9px 14px; border: 1px solid #E5DFD5; font-size: 11.5px; color: #1e293b; vertical-align: middle; text-align: left;">
                                            <strong style="color: #071F13; font-family: 'Inter', 'Hind Siliguri', sans-serif;">${it.productName}</strong>
                                            <span style="color: #8A857C; font-size: 9.5px; font-weight: 600; margin-left: 5px;">(${it.unit})</span>
                                        </td>
                                        <td style="padding: 9px 14px; border: 1px solid #E5DFD5; font-size: 11.5px; color: #071F13; font-weight: 700; vertical-align: middle; text-align: right;">x${it.quantity}</td>
                                        <td style="padding: 9px 14px; border: 1px solid #E5DFD5; font-size: 11.5px; color: #475569; vertical-align: middle; text-align: right;">৳${it.price}</td>
                                        <td style="padding: 9px 14px; border: 1px solid #E5DFD5; font-size: 12px; color: #071F13; font-weight: 800; vertical-align: middle; text-align: right;">৳${it.price * it.quantity}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>

                    <!-- Verification & Trust Indicators (Fills the faka space beautifully using margin-top: auto) -->
                    <div class="trust-signature-block" style="display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 20px; margin-top: auto; margin-bottom: 15px; border-top: 1px dashed #E5DFD5; padding-top: 15px; box-sizing: border-box; width: 100%;">
                        <!-- Organic Assurance Seals -->
                        <div style="display: flex; flex-direction: column; gap: 5px; text-align: left; box-sizing: border-box;">
                            <span style="font-size: 9px; font-weight: 900; color: #071F13; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px;">BAZAR THOLE SAFE FOODS DECREE:</span>
                            <div style="display: grid; grid-template-columns: 1fr; gap: 4px; font-size: 9px; font-weight: 700; color: #475569; font-family: 'Inter', 'Hind Siliguri', sans-serif;">
                                <div style="display: flex; align-items: center; gap: 5px;"><span style="color: #D4AF37; font-size: 10px;">✔</span> 100% Formalin-Free Secured (শতভাগ ফরমালিন মুক্ত)</div>
                                <div style="display: flex; align-items: center; gap: 5px;"><span style="color: #D4AF37; font-size: 10px;">✔</span> Sourced Directly from Local Farmers (কৃষক থেকে সরাসরি)</div>
                                <div style="display: flex; align-items: center; gap: 5px;"><span style="color: #D4AF37; font-size: 10px;">✔</span> Strict Hygienic Sort & Deliver (নিরাপদ ও স্বাস্থ্যসম্মত বাছাই)</div>
                            </div>
                        </div>
                        
                        <!-- Authority Signatures -->
                        <div style="display: flex; justify-content: flex-end; align-items: flex-end; gap: 20px; box-sizing: border-box;">
                            <div style="text-align: center;">
                                <div style="font-family: 'Georgia', serif; font-style: italic; font-size: 13px; color: #071F13; margin-bottom: 2px; border-bottom: 1px solid #D4AF37; padding-bottom: 2px; width: 95px; letter-spacing: 0.5px;">Bazar Thole</div>
                                <span style="font-size: 7.5px; font-weight: 800; color: #8A857C; text-transform: uppercase; letter-spacing: 0.5px; display: block;">DISPATCH OFFICER</span>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-family: 'Georgia', serif; font-style: italic; font-size: 13px; color: #071F13; margin-bottom: 2px; border-bottom: 1px solid #D4AF37; padding-bottom: 2px; width: 95px; letter-spacing: 0.5px;">Verified Safe</div>
                                <span style="font-size: 7.5px; font-weight: 800; color: #8A857C; text-transform: uppercase; letter-spacing: 0.5px; display: block;">QUALITY TRUSTEE</span>
                            </div>
                        </div>
                    </div>

                    <!-- Summary calculation area -->
                    <div class="bottom-summary-container" style="display: flex; justify-content: space-between; align-items: flex-end; width: 100%; border-top: 1px solid #E5DFD5; padding-top: 12px; box-sizing: border-box;">
                        
                        <!-- Left QR code scanner -->
                        <div class="qr-verification-box" style="display: flex; align-items: center; gap: 10px; background-color: #FAF9F6; border: 1px solid #E5DFD5; padding: 6px 12px; border-radius: 6px; border-left: 4px solid #071F13; box-sizing: border-box;">
                            <img src="${qrCodeUrl}" alt="Order QR Code" style="width: 48px; height: 48px; border: 1px solid #E5DFD5; border-radius: 3px; background-color: #ffffff; padding: 1px;" />
                            <div class="qr-verification-caption" style="font-size: 7.5px; font-weight: 700; color: #8A857C; text-transform: uppercase; letter-spacing: 0.5px; line-height: 1.3; max-width: 110px;">SCAN REGISTRY CODES TO VERIFY ORIGINAL STATEMENT</div>
                        </div>

                        <!-- Right Totals Calculations -->
                        <div class="totals-calculation-block" style="width: 260px; display: flex; flex-direction: column; box-sizing: border-box;">
                            <div class="summary-calculation-row" style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 4px; font-weight: 700; text-transform: uppercase; width: 100%;">
                                <span>Cart Subtotal:</span>
                                <strong style="color: #071F13; font-weight: 700;">৳${trackedOrder.subtotal}</strong>
                            </div>
                            ${trackedOrder.discount > 0 ? `
                                <div class="summary-calculation-row discount-subtraction" style="display: flex; justify-content: space-between; font-size: 11px; color: #b91c1c; margin-bottom: 4px; font-weight: 700; text-transform: uppercase; width: 100%;">
                                    <span>Discounts:</span>
                                    <strong style="color: #b91c1c; font-weight: 700;">-৳${trackedOrder.discount}</strong>
                                </div>
                            ` : ''}
                            <div class="summary-calculation-row" style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; margin-bottom: 4px; font-weight: 700; text-transform: uppercase; width: 100%;">
                                <span>Delivery Cost:</span>
                                <strong style="color: #071F13; font-weight: 700;">৳${trackedOrder.deliveryFee}</strong>
                            </div>
                            
                            <!-- Premium Grand Total Banner -->
                            <div class="grand-total-solid-banner" style="background-color: #071F13; color: #ffffff; padding: 9px 12px; display: flex; justify-content: space-between; align-items: center; margin-top: 6px; box-sizing: border-box; width: 100%; border-radius: 6px; border: 1px solid #D4AF37; box-shadow: 0 4px 10px rgba(15, 46, 30, 0.15);">
                                <span style="font-weight: 900; font-size: 10px; letter-spacing: 0.8px; text-transform: uppercase; color: #D4AF37;">Amount Due:</span>
                                <strong style="font-weight: 900; font-size: 15px; color: #FCFBF9;">৳${trackedOrder.total}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Footer Area -->
        <div style="padding: 0 45px 22px 45px; box-sizing: border-box; width: 100%; z-index: 2; position: relative;">
            <div class="footer-rule-accent" style="height: 1px; background-color: #D4AF37; margin-bottom: 8px; width: 100%;"></div>
            <p class="footer-caps-note" style="text-align: center; font-size: 8.5px; font-weight: 700; color: #8A857C; text-transform: uppercase; letter-spacing: 1px; margin: 0; line-height: 1.4;">
                ★ THANK YOU FOR BUYING HYGIENIC ORGANIC FOODS WITH ${cleanStoreName} ★<br/>
                QUESTIONS OR ORDER ASSISTANCE? CALL: ${settings.phone} // EMAIL: ${settings.email || 'SUPPORT@BAZARTHOLE.COM'}
            </p>
        </div>
    </div>
</div>

<script>
    function adjustScale() {
        const container = document.querySelector('.invoice-container');
        const wrapper = document.querySelector('.invoice-wrapper');
        if (!container || !wrapper) return;
        
        const designWidth = 794;
        const designHeight = 1120;
        const availableWidth = window.innerWidth - 30;
        
        if (availableWidth < designWidth) {
            const scale = availableWidth / designWidth;
            container.style.transform = 'scale(' + scale + ')';
            container.style.transformOrigin = 'top center';
            container.style.zoom = '1';
            container.style.webkitZoom = '1';
            const offset = designHeight * (1 - scale);
            container.style.marginBottom = '-' + offset + 'px';
        } else {
            container.style.transform = 'none';
            container.style.marginBottom = '0px';
        }
    }
    window.addEventListener('load', adjustScale);
    window.addEventListener('resize', adjustScale);
    document.addEventListener('DOMContentLoaded', adjustScale);
</script>
</body>
</html>
`;

                            const printScript = `
                            <script>
                                window.onload = function() {
                                    setTimeout(function() {
                                        window.print();
                                    }, 500);
                                };
                            </script>
                            `;
                            const fallbackHtml = reportHtml.replace('</body>', `${printScript}</body>`);
                            const blob = new Blob([fallbackHtml], { type: 'text/html;charset=utf-8' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = "BAZAR_THOLE_INVOICE_REPORT_" + trackedOrder.id + ".html";
                            link.style.display = 'none';
                            document.body.appendChild(link);
                            link.click();
                            setTimeout(() => {
                              document.body.removeChild(link);
                              URL.revokeObjectURL(url);
                            }, 300);

                            triggerToast(`📥 Saved Web HTML Invoice! Open this file to print or save.`);
                          }}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          🌐 Save Web File (ওয়েব ফাইল)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* VIEW 4: ABOUT US PAGE */}
        {activeTab === 'about' && (
          <div className="max-w-3xl mx-auto space-y-12 animate-fade-in text-slate-800">
            <div className="text-center space-y-2">
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Company Story</span>
              <h2 className="font-display font-black text-2.5xl text-gray-900 leading-none">About BAZAR THOLE Organic Store</h2>
              <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">Providing hygienic home transportation coordinates for secure organic meals</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-8 space-y-6 shadow-xs text-sm">
              <p className="text-gray-650 leading-relaxed font-sans text-sm block">
                Established in 2026, **BAZAR THOLE** started as a micro-cooperative initiative supporting agricultural families in the outskirts of Dhaka - specifically near Savar, Gazipur & Manikganj. Our core ambition is to eliminate chemical food preservation intermediaries. By delivering straight from the harvest fields to your dinner tables inside Dhaka city, we provide 100% formalin-free food items.
              </p>
              
              <h4 className="font-display font-bold text-gray-800 text-base">Why choose BAZAR THOLE?</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h5 className="font-bold text-emerald-700">Formalin Free Catch guarantee</h5>
                  <p className="text-gray-500">All Padma catchment fresh catfish and Hilsa are caught daily, kept in clean chilled environments and directly shipped without chemical layers.</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                  <h5 className="font-bold text-emerald-700">Direct From Farmer Networks</h5>
                  <p className="text-gray-500">We pay fair market valuations directly to organic cooperatives, cutting out complex secondary broker commission markups.</p>
                </div>
              </div>

              <div className="pt-4 text-center">
                <button onClick={() => setActiveTab('shop')} className="bg-emerald-600 text-white font-semibold py-2.5 px-6 rounded-full text-xs shadow hover:bg-emerald-700 transition-colors cursor-pointer">
                  Shop safe groceries
                </button>
              </div>
            </div>

            {/* Campaign Coupon Promo Strip - Moved to About tab */}
            {coupons.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-150 text-slate-800 rounded-2.5xl p-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-fade-in">
                <div className="flex items-center gap-3.5 text-center sm:text-left">
                  <div className="bg-emerald-100 p-2.5 rounded-xl border border-emerald-200 shrink-0">
                    <Tag className="h-5 w-5 text-emerald-800" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-extrabold text-emerald-700 tracking-wider uppercase block">Fresh Hub Savings Coupon</span>
                    <h4 className="font-semibold text-sm text-slate-800">
                      Get Flat <span className="text-emerald-700 font-extrabold font-display">{coupons[0].discountPercent}% OFF</span> using discount code 
                      <code className="bg-emerald-100/85 border border-emerald-200 px-2 py-0.5 rounded text-emerald-800 font-mono font-bold mx-1.5">{coupons[0].code}</code>
                    </h4>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => { setEnteredCoupon(coupons[0].code); triggerToast(`📋 Applied Coupon Code ${coupons[0].code}!`); }}
                    className="bg-emerald-700 hover:bg-emerald-850 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    Apply Coupon
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(coupons[0].code); triggerToast(`📋 Copied Voucher ${coupons[0].code}!`); }}
                    className="bg-white hover:bg-slate-50 text-slate-755 border border-slate-200 font-bold px-3 py-2 rounded-xl text-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Copy Code
                  </button>
                </div>
              </div>
            )}

            {/* Brand assurance milestones with rich positive space - Moved to About tab */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-slate-200/30 text-slate-800">
              <div className="bg-white p-5 rounded-2.5xl border border-slate-200/50 flex flex-col sm:flex-row items-start gap-4 hover:border-emerald-100 hover:shadow-xs transition-all duration-300">
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-display font-semibold text-sm text-slate-850">Swift Clean Delivery</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Directly delivered in sterilized containers from farm storage to your doorstep within 2 hours.</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2.5xl border border-slate-200/50 flex flex-col sm:flex-row items-start gap-4 hover:border-purple-100 hover:shadow-xs transition-all duration-300">
                <div className="bg-purple-50 text-purple-700 p-3 rounded-xl shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-display font-semibold text-sm text-slate-850">Naturally Sourced</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Strict non-toxic inspection guidelines on every food asset. Zero added synthetic preservatives.</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-2.5xl border border-slate-200/50 flex flex-col sm:flex-row items-start gap-4 hover:border-amber-100 hover:shadow-xs transition-all duration-300">
                <div className="bg-amber-50 text-amber-700 p-3 rounded-xl shrink-0">
                  <PhoneCall className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h4 className="font-display font-semibold text-sm text-slate-850">24/7 BAZAR THOLE Hotline</h4>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">Instantly resolve questions, reschedule timeslots, or customize custom orders on the go.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 5: CONTACT US PAGE */}
        {activeTab === 'contact' && (
          <div className="max-w-4xl mx-auto space-y-10 animate-fade-in text-slate-800">
            <div className="text-center space-y-2">
              <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Get In Touch</span>
              <h2 className="font-display font-black text-2.5xl text-gray-900 leading-none">Contact Our Support Desk</h2>
              <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">We respond to support queries within 2 hours during operational windows</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4 text-xs">
                <h4 className="font-display font-bold text-sm text-gray-800 uppercase tracking-widest pb-2 border-b">Store Coordinates</h4>
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block text-slate-800">Corporate Headquarters</strong>
                      <span className="text-slate-400 leading-relaxed block mt-0.5">{settings.address}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <PhoneCall className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block text-slate-800">Helpline Sourcing Support</strong>
                      <span className="text-slate-400 font-mono block mt-0.5">{settings.phone}</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Mail className="h-5 w-5 text-emerald-600 shrink-0" />
                    <div>
                      <strong className="block text-slate-800">Technical email API</strong>
                      <span className="text-slate-400 font-mono block mt-0.5">{settings.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                <h4 className="font-display font-bold text-slate-800 text-base mb-4">Send Us Direct Feedback</h4>
                
                {contactSubmitSuccess ? (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-250 p-6 text-center space-y-3">
                    <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
                    <h5 className="font-display font-bold text-slate-800 text-sm">Message Transmit success!</h5>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">We registered your text details in sandbox records. An agent will contact your mailbox shortly.</p>
                    <button onClick={() => setContactSubmitSuccess(false)} className="text-xs text-emerald-600 font-bold hover:underline">Send another note</button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setContactSubmitSuccess(true);
                      setContactFormName('');
                      setContactFormEmail('');
                      setContactFormMessage('');
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Your Name</label>
                        <input
                          id="contact-form-name"
                          type="text"
                          required
                          placeholder="e.g. Jamil Hasan"
                          className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white"
                          value={contactFormName}
                          onChange={(e) => setContactFormName(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Your Email Coordinates</label>
                        <input
                          id="contact-form-email"
                          type="email"
                          required
                          placeholder="e.g. jamil@gmail.com"
                          className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white"
                          value={contactFormEmail}
                          onChange={(e) => setContactFormEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Your Message / Suggestion Detail</label>
                      <textarea
                        id="contact-form-message"
                        rows={4}
                        required
                        placeholder="Write details of organic items request or shipping issues..."
                        className="w-full bg-slate-50 border border-gray-200 rounded-lg p-4 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white"
                        value={contactFormMessage}
                        onChange={(e) => setContactFormMessage(e.target.value)}
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        id="contact-submit"
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl active:scale-95 transition-all shadow shadow-emerald-600/10 cursor-pointer"
                      >
                        Transmit My Note
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW 6: MY ACCOUNT PAGE */}
        {activeTab === 'account' && (
          <div className="space-y-8 animate-fade-in text-slate-800">
            
            {/* Login guard warning block if user logged out */}
            {!currentUser ? (
              <div className="max-w-md mx-auto bg-white border border-gray-100 rounded-3xl p-8 text-center space-y-4 shadow-sm">
                <Lock className="mx-auto h-12 w-12 text-gray-300" />
                <h4 className="font-display font-black text-lg text-gray-800">Client Account Closed</h4>
                <p className="text-xs text-slate-400">Please authenticate to load personal order histories, addresses registry, and wishlists.</p>
                <div className="flex gap-3 justify-center pt-2">
                  <button onClick={() => setActiveTab('login')} className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors hover:bg-emerald-700 shadow shadow-emerald-600/15">Sign In Now</button>
                  <button onClick={() => setActiveTab('register')} className="border border-gray-200 text-gray-700 px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer">Register Account</button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Profile card setting left */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6 self-start">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-emerald-600 text-white font-display font-black text-xl rounded-full flex items-center justify-center">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-base">{currentUser.name}</h4>
                      <span className="text-[10px] text-gray-400 font-mono">ID: {currentUser.id}</span>
                    </div>
                  </div>

                  <form onSubmit={handleProfileUpdate} className="space-y-4 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Full Deshi Name</label>
                      <input
                        id="acc-profile-name"
                        type="text"
                        required
                        className="w-full border rounded-lg px-3 py-2"
                        value={currentUser.name}
                        onChange={(e) => setCurrentUser({ ...currentUser, name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Email Coordinates</label>
                      <input
                        id="acc-profile-email"
                        type="email"
                        disabled
                        className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-400 cursor-not-allowed font-mono"
                        value={currentUser.email}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Mobile Phone (Dhaka region)</label>
                      <input
                        id="acc-profile-phone"
                        type="text"
                        required
                        className="w-full border rounded-lg px-3 py-2 font-mono"
                        value={currentUser.phone}
                        onChange={(e) => setCurrentUser({ ...currentUser, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-400 mb-1">Default Delivery Address</label>
                      <textarea
                        id="acc-profile-address"
                        rows={2}
                        required
                        className="w-full border rounded-lg p-2.5"
                        value={currentUser.address}
                        onChange={(e) => setCurrentUser({ ...currentUser, address: e.target.value })}
                      />
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button type="submit" className="w-full bg-slate-800 text-white rounded-lg py-2 font-semibold hover:bg-emerald-600 transition-colors cursor-pointer">Update Profile</button>
                      <button type="button" onClick={handleLogout} className="text-red-600 hover:underline px-2 text-[11px] font-bold">Logout</button>
                    </div>
                  </form>
                </div>

                {/* Orders tracking on center/right */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* --- SPENDING TRENDS RECHARTS VISUALIZATION --- */}
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-2">
                      <h3 className="font-display font-bold text-slate-800 text-sm flex items-center gap-2">
                        <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
                        <span>My Spending Trends (Last 6 Months)</span>
                      </h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">
                        ANALYSIS // DESHI BILLING
                      </span>
                    </div>
                    
                    {/* Recharts Bar chart representation */}
                    <div className="h-64 w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { Month: 'Jan', Amount: 1200 },
                            { Month: 'Feb', Amount: 1850 },
                            { Month: 'Mar', Amount: 950 },
                            { Month: 'Apr', Amount: 2400 },
                            { Month: 'May', Amount: 1530 },
                            { Month: 'Jun', Amount: (() => {
                              const userOrders = db.getOrders().filter(o => currentUser && o.email.toLowerCase() === currentUser.email.toLowerCase());
                              const realTotalJun = userOrders.reduce((sum, o) => sum + o.total, 0);
                              return realTotalJun > 0 ? realTotalJun : 3100;
                            })() }
                          ]}
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                          <XAxis 
                            dataKey="Month" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748B', fontSize: 11, fontWeight: '600' }} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#64748B', fontSize: 11, fontWeight: '600' }} 
                          />
                          <Tooltip 
                            cursor={{ fill: '#F1F5F9' }}
                            contentStyle={{ backgroundColor: '#1E293B', border: 'none', borderRadius: '12px', color: '#FFF', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            itemStyle={{ color: '#34D399', fontWeight: 'bold' }}
                          />
                          <Bar 
                            dataKey="Amount" 
                            fill="#10B981" 
                            radius={[6, 6, 0, 0]} 
                            maxBarSize={45}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="mt-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <p className="text-slate-600 font-medium">Your average monthly healthy food investment is <strong className="text-emerald-700">৳1,838</strong></p>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">Optimal</span>
                    </div>
                  </div>
                  
                  {/* Whislist container */}
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-display font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                       <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                       <span>My Fresh Wishlist ({wishlist.length})</span>
                    </h3>
                    
                    {wishlist.length === 0 ? (
                      <p className="text-xs text-slate-400">Your wishlist is currently empty. Star food items during shopping!</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {products.filter(p => wishlist.includes(p.id)).map(p => (
                          <div key={p.id} className="flex gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                            <img src={p.image} className="h-12 w-12 rounded-lg object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                              <h5 className="text-xs font-bold text-slate-800 leading-none truncate">{p.name}</h5>
                              <span className="text-[10px] text-emerald-600 mt-1 block">৳ {p.price} • {p.unit}</span>
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  id={`acc-wishlist-cart-${p.id}`}
                                  onClick={() => handleAddToCart(p)}
                                  className="text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded transition-colors"
                                >
                                  Add
                                </button>
                                <button
                                  onClick={() => handleToggleWishlist(p.id)}
                                  className="text-[10px] font-semibold text-red-500 hover:underline"
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Customer Purchase History */}
                  <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-display font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-emerald-600" />
                      <span>Order Shipping History</span>
                    </h3>

                    <div className="space-y-4">
                      {db.getOrders()
                        .filter(o => o.email.toLowerCase() === currentUser.email.toLowerCase())
                        .map(order => (
                          <div key={order.id} className="border border-slate-100 rounded-2xl p-4 space-y-3 hover:border-slate-200 transition-all">
                            
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-slate-100 text-xs">
                              <div>
                                <span className="font-mono font-bold text-emerald-600 text-sm">ID: #{order.id}</span>
                                <span className="text-[10px] text-slate-400 font-mono ml-2">({order.trackingCode})</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                                  order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                  order.status === 'Shipped' ? 'bg-purple-100 text-purple-700' :
                                  'bg-amber-100 text-amber-700'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-xs pt-1">
                              <div>
                                <span className="text-[10px] text-slate-400 block font-medium">Recipient Address Parameters</span>
                                <strong className="text-slate-700 font-sans">{order.address}, {order.city}</strong>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] text-slate-400 block font-medium">Total Bill Paid</span>
                                <strong className="text-emerald-600 text-sm">৳ {order.total}</strong>
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-[11px]">
                              <button
                                id={`acc-track-${order.id}`}
                                onClick={() => { setTrackCodeInput(order.id); setTrackedOrder(order); setActiveTab('tracking'); }}
                                className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                ⚡ Track active delivery sequence
                              </button>
                              <span className="text-slate-400 font-medium font-sans">{new Date(order.orderDate).toLocaleDateString()}</span>
                            </div>

                          </div>
                        ))}

                      {db.getOrders().filter(o => o.email.toLowerCase() === currentUser.email.toLowerCase()).length === 0 && (
                        <div className="py-6 text-center text-slate-400 text-xs">
                           No orders placed under this account yet. Placed orders in checkout immediately sync here!
                        </div>
                      )}
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* VIEW 7: LOGIN PAGE */}
        {activeTab === 'login' && (
          <div className="max-w-md mx-auto space-y-6 animate-fade-in text-slate-800 uppercase">
            <div className="text-center space-y-2">
              <h2 className="font-display font-black text-2.5xl tracking-tight text-gray-900 leading-none">LOGIN CREDENTIALS</h2>
              <p className="text-xs text-slate-400">ACCESS ORDER HISTORIES, CUSTOM WISHLISTS & SECURE DELIVERIES INSTANTLY</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 text-xs">
              
              {loginError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-150 leading-relaxed font-sans flex items-center gap-1.5 font-medium uppercase">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{loginError.toUpperCase()}</span>
                </div>
              )}

              {/* Account Quickfill coordinates advice */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold text-gray-500 block tracking-wider">DEMO / SANDBOX LOGIN CREDENTIALS</span>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  PRESAVED ACCOUNT: <strong className="font-mono">demo@example.com</strong> <br />
                  PASSWORD: <strong className="font-mono">password123</strong> (OR SIGN UP NOW).
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">YOUR REGISTERED EMAIL</label>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="E.G. DEMO@EXAMPLE.COM"
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono uppercase placeholder:uppercase"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider font-sans">SECRET CODE PASSWORD</label>
                <input
                  id="login-password"
                  type="password"
                  required
                  placeholder="ENTER SECRET CODE"
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-emerald-500 focus:bg-white font-mono uppercase placeholder:uppercase"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  id="login-submit"
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl active:scale-95 transition-all shadow shadow-emerald-600/10 cursor-pointer text-center uppercase tracking-wider"
                >
                  VERIFY CREDENTIALS
                </button>
              </div>

              <p className="text-center pt-2 text-slate-400">
                NEW TO BAZAR THOLE ORGANIC?{' '}
                <button type="button" onClick={() => setActiveTab('register')} className="text-emerald-600 text-xs font-bold hover:underline uppercase">
                  CREATE FRESH ACCOUNT
                </button>
              </p>
            </form>
          </div>
        )}

        {/* VIEW 8: REGISTRATION PAGE */}
        {activeTab === 'register' && (
          <div className="max-w-md mx-auto space-y-6 animate-fade-in text-slate-800">
            <div className="text-center space-y-2">
              <h2 className="font-display font-black text-2.5xl tracking-tight text-gray-900 leading-none">Create Deshi Account</h2>
              <p className="text-xs text-slate-400">Register once to automatically record organic food voucher rates</p>
            </div>

            <form onSubmit={handleRegistrationSubmit} className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm space-y-4 text-xs">
              
              {regSuccess && (
                <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-150 text-[11px] leading-relaxed font-semibold">
                   🎉 Account created successfully! Routing to Login screen...
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Your Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs focus:outline-none focus:border-emerald-500 focus:bg-white"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="e.g. info@example.com"
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-mono"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider font-sans">Mobile Contacts (Dhaka number)</label>
                <input
                  id="reg-phone"
                  type="text"
                  required
                  placeholder="e.g. 01700000000"
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-mono"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">Default Home Delivery Address</label>
                <textarea
                  id="reg-address"
                  rows={2}
                  required
                  placeholder="House, Road, Apartment or Sector details..."
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg p-3 text-xs"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider">District / Division</label>
                <select
                  id="reg-city"
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs bg-white text-slate-700 focus:outline-none focus:border-emerald-500 font-sans cursor-pointer h-10"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                >
                  {BANGLADESH_DISTRICTS.map((dst) => (
                    <option key={dst.en} value={dst.en}>
                      {dst.bn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1 uppercase tracking-wider font-sans">Secure password</label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  placeholder="Set secret code"
                  className="w-full bg-slate-50 border border-gray-200 rounded-lg px-4 py-2.5 text-xs font-mono"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
              </div>

              <div className="pt-2">
                <button
                  id="register-submit"
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl active:scale-95 transition-all shadow shadow-emerald-600/10 cursor-pointer text-center"
                >
                  Confirm Registration
                </button>
              </div>

              <p className="text-center pt-2 text-slate-400">
                Already registered with BAZAR THOLE?{' '}
                <button type="button" onClick={() => setActiveTab('login')} className="text-emerald-600 text-xs font-bold hover:underline">
                  Sign In instead
                </button>
              </p>
            </form>
          </div>
        )}

        {/* VIEW 9: CHECKOUT PAGE */}
        {activeTab === 'checkout' && (
          <div className="space-y-8 animate-fade-in text-slate-800">
            <div className="text-center space-y-1">
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-full font-bold uppercase tracking-wider">Direct Checkout</span>
              <h2 className="font-display font-black text-2.5xl text-gray-900 leading-none">Finalize Sourced Cart</h2>
              <p className="text-xs text-slate-400 font-sans">Verify shipping addresses coordinates and complete mobile sandbox payments</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column forms */}
              <div className="lg:col-span-2 space-y-6">
                
                <form id="checkout-billing-form" onSubmit={handleCheckoutSubmit} className="bg-[#FAF5EE] border-2 border-stone-900 p-0 shadow-sm space-y-0 text-sm overflow-hidden">
                  
                  {/* Black Banner Head like user screenshot: "PERSONAL INFORMATION:" style */}
                  <div className="bg-black text-[#FAFAFA] px-5 py-3 font-bold text-sm uppercase tracking-wider border-b border-stone-900 select-none flex items-center justify-between">
                    <span>📋 RECIPIENT & PERSONAL DETAILS (ব্যক্তিগত এবং ডেলিভারি তথ্য)</span>
                    <span className="text-xs bg-neutral-800 px-2 py-0.5 border border-neutral-700 font-mono font-bold">SECTIONS: ALL</span>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">RECIPIENT NAME (নাম) :*</label>
                        <input
                          id="bill-name"
                          type="text"
                          placeholder="আপনার সম্পূর্ণ নাম লিখুন"
                          className={`w-full bg-white border-2 rounded-none px-4 py-2.5 text-sm font-sans text-stone-900 focus:outline-none focus:ring-2 h-11 shadow-sm ${billingErrors.name ? 'border-red-600 focus:ring-red-650' : 'border-stone-900 focus:ring-[#0E6C57]'}`}
                          value={billingName}
                          onChange={(e) => {
                            setBillingName(e.target.value);
                            if (e.target.value.trim()) {
                              setBillingErrors(prev => ({ ...prev, name: undefined }));
                            }
                          }}
                        />
                        {billingErrors.name && (
                          <p className="text-red-650 text-xs font-bold mt-1.5 animate-pulse">❌ {billingErrors.name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">MOBILE NUMBER (মোবাইল নম্বর) :*</label>
                        <div className="flex items-stretch h-11">
                          <span className={`inline-flex items-center px-4 bg-stone-200 border-2 border-r-0 text-stone-900 font-bold text-sm select-none ${billingErrors.phone ? 'border-red-600' : 'border-stone-900'}`}>
                            88
                          </span>
                          <input
                            id="bill-phone"
                            type="text"
                            placeholder="যেমন: 01712345678"
                            className={`w-full bg-white border-2 border-l-0 rounded-none px-4 py-2.5 text-sm font-mono text-stone-900 focus:outline-none focus:ring-2 flex-1 shadow-sm ${billingErrors.phone ? 'border-red-600 focus:ring-red-650' : 'border-stone-900 focus:ring-[#0E6C57]'}`}
                            value={billingPhone}
                            onChange={(e) => {
                              setBillingPhone(e.target.value);
                              if (e.target.value.trim().length >= 11) {
                                setBillingErrors(prev => ({ ...prev, phone: undefined }));
                              }
                            }}
                          />
                        </div>
                        {billingErrors.phone && (
                          <p className="text-red-650 text-xs font-bold mt-1.5 animate-pulse">❌ {billingErrors.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">DISTRICT / DIVISION (জেলা / বিভাগ) :*</label>
                        <select
                          id="bill-city"
                          className="w-full bg-white border-2 border-stone-900 rounded-none px-4 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#0E6C57] font-sans cursor-pointer h-11 shadow-sm"
                          value={billingCity}
                          onChange={(e) => setBillingCity(e.target.value)}
                        >
                          {BANGLADESH_DISTRICTS.map((dst) => (
                            <option key={dst.en} value={dst.en}>
                              {dst.bn} ({dst.en})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wide">DETAILED ADDRESS COORDINATES (বিস্তারিত ঠিকানা) :*</label>
                      <textarea
                        id="bill-address"
                        rows={3}
                        placeholder="যেমন: গ্রাম, ডাকঘর, থানা বা হাউজ নং, রোড নং, এলাকা..."
                        className={`w-full bg-white border-2 rounded-none p-3 text-sm text-stone-900 focus:outline-none focus:ring-2 font-sans shadow-sm ${billingErrors.address ? 'border-red-600 focus:ring-red-650' : 'border-stone-900 focus:ring-[#0E6C57]'}`}
                        value={billingAddress}
                        onChange={(e) => {
                          setBillingAddress(e.target.value);
                          if (e.target.value.trim()) {
                            setBillingErrors(prev => ({ ...prev, address: undefined }));
                          }
                        }}
                      />
                      {billingErrors.address && (
                        <p className="text-red-650 text-xs font-bold mt-1.5 animate-pulse">❌ {billingErrors.address}</p>
                      )}
                    </div>

                  {/* BLACK BANNER HEAD 2 */}
                  <div className="bg-black text-[#FAFAFA] px-4 py-2 font-bold text-xs uppercase tracking-wider relative -left-6 w-[calc(100%+3rem)] select-none mt-6 border-y border-stone-900">
                    ⚡ SELECT PAYMENT METHOD (পেমেন্ট পদ্ধতি নির্ধারণ করুন) :*
                  </div>


                  {/* Two-column responsive layout: Product Image Preview on the Left, Payment option on the Right. Submit Order is placed neatly below them */}
                  <div className="pt-4 border-t border-stone-300 space-y-5">
                    
                    {/* Top Row: Left Image column, Right Payment Column */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fade-in">
                      
                      {/* Left Column: Beautiful Clean Product Image Frame (No text or badge overlays) */}
                      <div className="bg-white border-2 border-stone-900 p-2 rounded-none flex items-center justify-center">
                        {cart.length > 0 ? (
                          <div className="w-full relative aspect-[4/3] bg-white flex items-center justify-center overflow-hidden select-none">
                            <img 
                              src={cart[0].product.image} 
                              alt={cart[0].product.name} 
                              className="w-full h-full object-cover rounded-none"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                            <span className="text-3xl">📦</span>
                            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">NO PRODUCTS IN CART</p>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Dynamic Payment Switchboards */}
                      <div className="bg-stone-100 border-2 border-stone-900 p-4 rounded-none flex flex-col justify-center space-y-3">
                        <span className="text-[10px] font-black tracking-widest text-[#0E6C57] uppercase block">⚡ SELECT PAYMENT SYSTEM (পেমেন্ট পদ্ধতি)</span>
                        
                        <div className="space-y-2.5">
                          {/* Cash on Delivery option if enabled */}
                          {settings.enableCOD !== false && (
                            <label className={`flex items-start gap-3 p-3 border-2 cursor-pointer select-none transition-all ${paymentOption === 'Cash on Delivery' ? 'border-black bg-stone-950/5' : 'border-stone-300 bg-white hover:border-stone-400'}`}>
                              <input
                                type="radio"
                                name="payment_opt_real"
                                className="h-4 w-4 mt-0.5 accent-black"
                                checked={paymentOption === 'Cash on Delivery'}
                                onChange={() => setPaymentOption('Cash on Delivery')}
                              />
                              <div>
                                <span className="font-bold text-stone-900 text-xs block uppercase">Cash on Delivery (ক্যাশ অন ডেলিভারি)</span>
                                <span className="text-[11px] text-stone-600 font-semibold font-sans block leading-tight mt-1">হাতে পণ্য পেয়ে মূল্য পরিশোধ করুন</span>
                              </div>
                            </label>
                          )}

                          {/* bKash option if enabled */}
                          {settings.enableBkash !== false && (
                            <label className={`flex items-start gap-3 p-3 border-2 cursor-pointer select-none transition-all ${paymentOption === 'bKash' ? 'border-[#e11e5f] bg-[#e11e5f]/5' : 'border-stone-300 bg-white hover:border-stone-400'}`}>
                              <input
                                type="radio"
                                name="payment_opt_real"
                                className="h-4 w-4 mt-0.5 accent-[#e11e5f]"
                                checked={paymentOption === 'bKash'}
                                onChange={() => setPaymentOption('bKash')}
                              />
                              <div>
                                <span className="font-extrabold text-[#e11e5f] text-xs block uppercase">bKash (বিকাশ ওয়ালেট)</span>
                                <span className="text-[11px] text-[#e11e5f] font-semibold font-sans block leading-tight mt-1 font-sans">বিকাশ ওয়ালেট থেকে পেমেন্ট করুন</span>
                              </div>
                            </label>
                          )}

                          {/* Nagad option if enabled */}
                          {settings.enableNagad !== false && (
                            <label className={`flex items-start gap-3 p-3 border-2 cursor-pointer select-none transition-all ${paymentOption === 'Nagad' ? 'border-[#E65100] bg-[#E65100]/5' : 'border-stone-300 bg-white hover:border-stone-400'}`}>
                              <input
                                type="radio"
                                name="payment_opt_real"
                                className="h-4 w-4 mt-0.5 tracking-wide accent-[#E65100]"
                                checked={paymentOption === 'Nagad'}
                                onChange={() => setPaymentOption('Nagad')}
                              />
                              <div>
                                <span className="font-extrabold text-[#E65100] text-xs block uppercase">Nagad (নগদ ওয়ালেট)</span>
                                <span className="text-[11px] text-[#E65100] font-semibold font-sans block leading-tight mt-1 font-sans">নগদ ওয়ালেট থেকে পেমেন্ট করুন</span>
                              </div>
                            </label>
                          )}

                          {/* SSLCommerz option if enabled */}
                          {settings.enableSSLCommerz !== false && (
                            <label className={`flex items-start gap-3 p-3 border-2 cursor-pointer select-none transition-all ${paymentOption === 'SSLCommerz' ? 'border-black bg-stone-950/5' : 'border-stone-400 bg-white hover:border-stone-400'}`}>
                              <input
                                type="radio"
                                name="payment_opt_real"
                                className="h-4 w-4 mt-0.5 accent-black"
                                checked={paymentOption === 'SSLCommerz'}
                                onChange={() => setPaymentOption('SSLCommerz')}
                              />
                              <div>
                                <span className="font-bold text-stone-900 text-xs block uppercase">SSLCommerz Sandbox</span>
                                <span className="text-[11px] text-stone-600 font-semibold font-sans block leading-tight mt-1">কার্ড বা অন্য অনলাইন ব্যাংকিং</span>
                              </div>
                            </label>
                          )}

                          {/* If no gateways are enabled */}
                          {settings.enableCOD === false && settings.enableBkash === false && settings.enableNagad === false && settings.enableSSLCommerz === false && (
                            <div className="p-4 bg-red-50 border-2 border-red-500 text-red-700 text-xs text-center font-bold">
                              ⚠️ NO ACTIVE GATEWAYS AVAILABLE AT THE MOMENT.
                              </div>
                          )}

                        </div>
                      </div>

                    </div>

                    {/* Bottom Row: Order Placement button with Bengali notice */}
                    <div className="pt-4 border-t border-stone-200">
                      <button
                        id="place-order-submit-btn"
                        type="submit"
                        onClick={handleCheckoutSubmit}
                        className="w-full bg-black hover:bg-stone-900 text-[#FAFAFA] font-extrabold py-4 text-center shadow cursor-pointer text-sm active:scale-95 transition-all uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-stone-900 animate-pulse"
                      >
                        ⚡ CONFIRM SECURE ORDER (অর্ডার নিশ্চিত করুন)
                      </button>
                    </div>

                  </div>
                </div>
                </form>

              </div>

              {/* Right Column Cart summary details */}
              <div className="space-y-6">
                
                {/* Applied coupons vouchers info panel */}
                <div className="bg-[#FAF5EE] border-2 border-stone-900 p-0 shadow-sm overflow-hidden text-sm">
                  <div className="bg-black text-[#FAFAFA] px-4 py-2.5 font-bold text-xs uppercase tracking-wider border-b border-stone-900 select-none">
                    🎟️ PROMOTIONAL VOUCHER (কুপন ডিসকাউন্ট)
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        id="checkout-coupon-input"
                        type="text"
                        placeholder="e.g. BAZAR15"
                        className="flex-1 uppercase font-mono tracking-widest"
                        value={enteredCoupon}
                        onChange={(e) => setEnteredCoupon(e.target.value)}
                      />
                      <button type="submit" className="bg-black hover:bg-stone-900 text-[#FAFAFA] font-bold px-4 text-xs transition-colors cursor-pointer border-2 border-stone-900">APPLY</button>
                    </form>

                    {couponError && <p className="text-xs text-red-650 font-bold">{couponError}</p>}
                    
                    {appliedCoupon ? (
                      <div className="bg-emerald-50 border border-emerald-500 p-3 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-emerald-700 font-extrabold block">VOUCHER ACTIVE (কুপন সক্রিয়)</span>
                          <strong className="text-emerald-950 font-mono text-sm">{appliedCoupon.code} ({appliedCoupon.discountPercent}% OFF)</strong>
                        </div>
                        <button onClick={() => { setAppliedCoupon(null); setEnteredCoupon(''); }} className="text-xs text-red-650 font-extrabold hover:underline cursor-pointer">REMOVE</button>
                      </div>
                    ) : (
                      <div className="bg-stone-200 border border-stone-300 p-2 text-stone-700 text-xs text-center font-bold leading-relaxed">
                        💡 Use coupon <strong className="font-mono text-black font-extrabold">BAZAR15</strong> to save 15% flat!
                      </div>
                    )}
                  </div>
                </div>

                {/* Items in cart list & mathematical calculations - Designed like "SEAT INFORMATION:" ticket table */}
                <div className="bg-[#FAF5EE] border-2 border-stone-900 p-0 shadow-sm overflow-hidden text-xs">
                  
                  {/* SEAT INFORMATION header styling */}
                  <div className="bg-black text-[#FAFAFA] px-4 py-2.5 font-bold text-xs uppercase tracking-wider flex items-center justify-between border-b border-stone-900 select-none">
                    <span>🛒 SEAT / ITEM CHECKOUT INFO (পণ্য চেকআউট বিবরণ)</span>
                    <span className="font-extrabold bg-neutral-800 px-2 py-0.5 rounded text-[10px]">{cart.length} ITEMS</span>
                  </div>

                  {/* Seat table columns matching: SEAT NO - FARE - REMOVE */}
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-neutral-900 text-[#FAFAFA] text-[10px] font-bold uppercase tracking-wider text-center border-b border-stone-900">
                        <th className="py-2.5 px-3 border-r border-stone-900 text-left">ITEM NAME (আইটেম / পণ্য)</th>
                        <th className="py-2.5 px-3 border-r border-stone-900">QTY (পরিমাণ)</th>
                        <th className="py-2.5 px-3">FARE (TAKA)</th>
                      </tr>
                    </thead>
                    <tbody>
                  
                      {cart.map((item, idx) => (
                        <tr key={idx} className="bg-[#FAF5EE] border-b border-stone-300 font-bold text-stone-900 border-r border-l border-stone-900">
                          <td className="py-3 px-3 border-r border-[#DCDCDC] text-left leading-snug">
                            <div>{item.product.name}</div>
                            {item.product.sizes && item.product.sizes.length > 0 && (
                              <div className="mt-1 flex items-center gap-1.5 bg-emerald-50 border border-[#0E6C57]/40 px-2 py-0.5 rounded text-[10px] w-fit">
                                <span className="text-[#0E6C57] font-black uppercase text-[9px]">Select Size:</span>
                                <select
                                  value={item.selectedSize || item.product.sizes[0]}
                                  onChange={(e) => {
                                    const newSize = e.target.value;
                                    setCart(prevCart => {
                                      const updated = [...prevCart];
                                      updated[idx].selectedSize = newSize;
                                      return updated;
                                    });
                                    triggerToast(`✨ Size updated to ${newSize} for ${item.product.name}!`);
                                  }}
                                  className="bg-white border border-stone-300 text-stone-800 rounded font-bold px-1.5 py-0.5 cursor-pointer text-[10px] uppercase outline-none focus:border-[#0E6C57]"
                                >
                                  {item.product.sizes.map(sz => (
                                    <option key={sz} value={sz}>{sz}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 border-r border-[#DCDCDC] text-center font-mono">
                            {item.quantity} × {item.product.unit}
                          </td>
                          <td className="py-3 px-3 text-right font-mono">
                            ৳ {(item.product.price * item.quantity).toLocaleString('en-US')}
                          </td>
                        </tr>
                      ))}

                      {/* Summary calculations styled as transport ticket fares */}
                      <tr className="bg-stone-200/85 font-black border-t-2 border-stone-900">
                        <td colSpan={2} className="py-2.5 px-3 border-r border-stone-300 text-right uppercase">
                          TOTAL PRICE (মোট মূল্য):
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-stone-900 font-black">
                          ৳ {cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0).toLocaleString('en-US')}
                        </td>
                      </tr>

                      {appliedCoupon && (
                        <tr className="bg-red-50 text-red-800 font-bold border-t border-stone-300">
                          <td colSpan={2} className="py-2.5 px-3 border-r border-stone-300 text-right uppercase">
                            COUPON SAVINGS ({appliedCoupon.code}):
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono font-black text-red-650">
                            - ৳ {Math.round((cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) * appliedCoupon.discountPercent) / 100).toLocaleString('en-US')}
                          </td>
                        </tr>
                      )}

                      <tr className="bg-stone-200/80 font-bold text-stone-700 border-t border-stone-300">
                        <td colSpan={2} className="py-2.5 px-3 border-r border-stone-300 text-right uppercase">
                          SHIPPING / CONVENIENCE CHARGE:
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-stone-900">
                          {cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) >= settings.freeDeliveryThreshold ? (
                            <span className="text-emerald-700 font-bold uppercase text-[10px] bg-emerald-100 px-1.5 py-0.5 border border-emerald-300 font-sans">FREE</span>
                          ) : (
                            `৳ ${settings.deliveryFee}`
                          )}
                        </td>
                      </tr>

                      {cart.some(item => !!item.product.deliveryFee) && (
                        <tr className="bg-stone-200/80 font-bold text-stone-700 border-t border-stone-300">
                          <td colSpan={2} className="py-2.5 px-3 border-r border-stone-300 text-right uppercase">
                            ADDITIONAL PACKAGING FARE:
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono text-stone-950 font-black">
                            + ৳ {cart.reduce((acc, item) => acc + (item.product.deliveryFee || 0) * item.quantity, 0).toLocaleString('en-US')}
                          </td>
                        </tr>
                      )}

                      <tr className="bg-amber-100 text-stone-950 font-extrabold border-t-2 border-stone-900">
                        <td colSpan={2} className="py-3.5 px-3 border-r border-stone-900 text-right text-[11px] uppercase tracking-wider font-extrabold">
                          NET FARE / PAYABLE AMOUNT (সর্বমোট প্রদেয়):
                        </td>
                        <td className="py-3.5 px-3 text-right font-mono text-sm text-black font-black">
                          ৳ {
                            (
                              cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) 
                              - (appliedCoupon ? Math.round((cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) * appliedCoupon.discountPercent) / 100) : 0)
                              + (cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0) >= settings.freeDeliveryThreshold ? 0 : settings.deliveryFee)
                              + cart.reduce((acc, item) => acc + (item.product.deliveryFee || 0) * item.quantity, 0)
                            ).toLocaleString('en-US')
                          }
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          </div>
        )}



      </main>

      {/* Global Bottom Banner Advertisement Slot (Above Footer) */}
      {settings.enableAds && settings.adsterraFeedScript && (
        <div className="bg-slate-50 border-t border-b border-dashed border-slate-200 p-3 flex flex-col items-center justify-center space-y-1 my-2 text-center select-none">
          <span className="text-[9px] text-slate-400 font-bold tracking-widest uppercase flex items-center gap-1 select-none leading-none">
            <span>📢 SPONSORED BANNER</span>
            {settings.isSafeAdsOnly !== false && <span className="text-emerald-600 bg-emerald-50 border border-emerald-100 px-1 py-0.5 rounded text-[8px] font-black">🧼 SAFE CONTENT FILTER</span>}
          </span>
          <AdSlotContainer 
            scriptHtml={settings.adsterraFeedScript} 
            className="w-full flex justify-center scale-95 overflow-x-auto select-none mt-1" 
          />
        </div>
      )}

      {/* FOOTER element shortcut coordinates */}
      <Footer settings={settings} onNavigate={setActiveTab} />

      {/* VIEW 10: PRODUCT DETAILED OVERLAY MODAL */}
      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl animate-scale-up text-slate-800 border border-slate-100">
            {/* Top Close Button */}
            <button
              id="detail-close"
              onClick={() => setDetailProduct(null)}
              className="absolute top-4 right-4 z-20 bg-white/90 hover:bg-white text-slate-500 hover:text-red-500 rounded-full p-2 border border-slate-200 shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
              
              {/* LEFT & CENTER IMAGE GALLERY COLUMN (5/12 cols) */}
              <div className="md:col-span-5 bg-slate-50 p-6 flex items-center justify-center border-r border-slate-100">
                
                {/* Main Selected Image Container */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-center relative w-full aspect-square max-w-[280px] md:max-w-none">
                  <img src={detailProduct.image} className="w-full h-full object-contain rounded-xl" alt="" />
                  {detailProduct.discountPercent > 0 && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
                      {detailProduct.discountPercent}% OFF
                    </span>
                  )}
                </div>

              </div>

              {/* RIGHT TEXT DETAILS COLUMN (7/12 cols) */}
              <div className="md:col-span-7 p-6 sm:p-8 space-y-4 flex flex-col justify-between">
                
                <div className="space-y-3">
                  
                  {/* Breadcrumbs */}
                  <div className="text-[11px] font-bold text-slate-450 font-sans tracking-wide">
                    <span>HOME</span> <span className="mx-1 font-sans">•</span> <span className="text-emerald-600 font-sans">PRODUCTS</span> <span className="mx-1 font-sans">•</span> <span className="uppercase text-slate-550 font-sans">{detailProduct.category}</span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-black text-2xl text-slate-900 leading-snug tracking-tight">
                    {detailProduct.name}
                  </h3>

                  {/* Rating / Review Info */}
                  <div className="flex items-center gap-2.5 text-xs text-slate-500 font-semibold font-sans">
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(detailProduct.rating) ? 'fill-amber-500 text-amber-500' : 'text-slate-200'}`} />
                      ))}
                    </div>
                    <span className="font-sans font-extrabold text-slate-800">{detailProduct.rating} Rating</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold uppercase font-sans">100% Organic & Chemical Free</span>
                  </div>

                  {/* Divider */}
                  <hr className="border-slate-100" />

                  {/* Price Box */}
                  <div className="flex items-baseline gap-3 pt-1">
                    <span className="text-3xl font-black text-orange-600 font-display">
                      ৳ {detailProduct.price.toLocaleString('en-US')}
                    </span>
                    {detailProduct.originalPrice > detailProduct.price && (
                      <>
                        <span className="text-sm font-semibold text-slate-400 line-through">
                          ৳ {detailProduct.originalPrice.toLocaleString('en-US')}
                        </span>
                        <span className="bg-emerald-50 text-emerald-700 font-extrabold text-xs px-2.5 py-0.5 rounded-full border border-emerald-200">
                          SAVE {Math.round(((detailProduct.originalPrice - detailProduct.price) / detailProduct.originalPrice) * 100)}%
                        </span>
                      </>
                    )}
                  </div>

                  {/* Unit Package */}
                  <div className="flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">WEIGHT:</span>
                      <strong className="text-slate-700 font-sans">{detailProduct.unit}</strong>
                    </div>
                    {detailProduct.deliveryFee !== undefined && detailProduct.deliveryFee > 0 && (
                      <div className="flex items-center gap-2 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-lg font-bold text-[10.5px]">
                        <span className="font-bold uppercase tracking-widest text-[9px] text-amber-600">DELIVERY CHARGE:</span>
                        <strong className="font-extrabold font-sans">৳ {detailProduct.deliveryFee}</strong>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed font-sans font-medium line-clamp-3">
                    {detailProduct.description}
                  </p>

                  {/* Size selection options if size-wise product */}
                  {detailProduct.sizes && detailProduct.sizes.length > 0 && (
                    <div className="py-3 border-t border-b border-dashed border-stone-200">
                      <span className="block text-xs font-bold text-stone-900 mb-2 uppercase tracking-wider">
                        Select available Size / Weight (সাইজ নির্বাচন করুন):
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {detailProduct.sizes.map((sz) => {
                          const isSel = detailProductSize === sz;
                          return (
                            <button
                              key={sz}
                              type="button"
                              onClick={() => setDetailProductSize(sz)}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-black uppercase transition-all tracking-wider cursor-pointer border-2 ${
                                isSel
                                  ? 'bg-[#0E6C57] text-[#FAF5EE] border-[#0E6C57] shadow-md scale-105'
                                  : 'bg-white text-stone-700 border-stone-300 hover:border-stone-500 hover:bg-stone-50'
                              }`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Interactive Quantity Selector */}
                  <div className="flex items-center gap-4 py-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity:</span>
                    <div className="flex items-center border-2 border-slate-200 rounded-xl bg-slate-50 overflow-hidden font-bold">
                      <button
                        type="button"
                        onClick={() => setDetailQuantity(prev => Math.max(1, prev - 1))}
                        className="px-3 py-1.5 hover:bg-slate-200 text-slate-600 cursor-pointer active:scale-90 transition-all font-sans"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-4 text-slate-800 font-mono text-sm min-w-[40px] text-center">
                        {detailQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDetailQuantity(prev => Math.min(detailProduct.stock || 99, prev + 1))}
                        className="px-3 py-1.5 hover:bg-slate-200 text-slate-600 cursor-pointer active:scale-90 transition-all font-sans"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    
                    {/* Stock Alert */}
                    <span className="text-xs font-sans font-bold">
                      {detailProduct.stock === 0 ? (
                        <span className="text-red-500">❌ Out Of Stock</span>
                      ) : detailProduct.stock <= 5 ? (
                        <span className="text-red-500">⚠️ Only {detailProduct.stock} left!</span>
                      ) : (
                        <span className="text-emerald-600">✓ In Stock ({detailProduct.stock})</span>
                      )}
                    </span>
                  </div>

                </div>

                {/* Primary Action Buttons (Wiggling Buy Now & Add To Cart) */}
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row gap-3">
                    
                    {/* ADD TO CART - Orange Button */}
                    {!detailProduct.affiliateUrl && (
                      <button
                        id="detail-add-cart-custom"
                        type="button"
                        onClick={() => { handleAddToCart(detailProduct, detailQuantity, detailProductSize); setDetailProduct(null); }}
                        disabled={detailProduct.stock === 0}
                        className="w-full sm:w-1/2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl py-3.5 px-4 text-xs font-bold transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider shadow"
                      >
                        <ShoppingCart className="h-4 w-4 shrink-0 text-white" />
                        Add To Cart
                      </button>
                    )}

                    {/* BUY NOW - Black/Teal Button animate-wiggle-action */}
                    <button
                      id="detail-buy-now-custom"
                      type="button"
                      onClick={() => { handleDirectBuyNow(detailProduct, detailQuantity, detailProductSize); setDetailProduct(null); }}
                      disabled={detailProduct.stock === 0 && !detailProduct.affiliateUrl}
                      className={`${detailProduct.affiliateUrl ? 'w-full' : 'w-full sm:w-1/2'} bg-[#022B28] hover:bg-teal-950 text-white rounded-xl py-3.5 px-4 text-xs font-black shadow-lg transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer text-center uppercase tracking-widest animate-wiggle-action flex items-center justify-center gap-1.5`}
                    >
                      <span>⚡ {detailProduct.affiliateUrl ? 'BUY NOW (Affiliate)' : 'Buy Now'}</span>
                    </button>
                  </div>

                  {/* Secondary Social Action Buttons: WhatsApp and Call For Order */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    
                    {/* Order on WhatsApp */}
                    <button
                      id="detail-whatsapp-order"
                      type="button"
                      onClick={() => {
                        const whatsappMsg = `Hello BAZAR THOLE! I want to order ${detailQuantity}x "${detailProduct.name}" (${detailProduct.unit}). Price: ৳${detailProduct.price * detailQuantity}. Please confirm my order!`;
                        window.open(`https://wa.me/${settings.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappMsg)}`, '_blank');
                      }}
                      className="w-full sm:w-1/2 bg-[#12a14b] text-white rounded-xl py-3 px-4 text-[11px] font-bold hover:bg-green-700 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase"
                    >
                      <svg className="h-4 w-4 fill-white shrink-0" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      Order On WhatsApp
                    </button>

                    {/* Call helpline */}
                    <button
                      id="detail-call-helpline"
                      type="button"
                      onClick={() => {
                        window.open(`tel:${settings.phone}`, '_self');
                      }}
                      className="w-full sm:w-1/2 bg-[#1e3a8a] text-white rounded-xl py-3 px-4 text-[11px] font-bold hover:bg-blue-800 transition-all cursor-pointer flex items-center justify-center gap-2 uppercase font-sans"
                    >
                      <PhoneCall className="h-4 w-4 shrink-0 text-white" />
                      Call For Order: {settings.phone}
                    </button>

                  </div>

                  {/* Brand Badge */}
                  <div className="flex items-center gap-2 text-xs pt-1">
                    <span className="text-slate-400 font-bold text-[10px]">BRAND:</span>
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 font-black px-3.5 py-1.5 rounded-full border border-amber-200 text-[11px] hover:bg-amber-100 transition-colors uppercase leading-none font-sans">
                      <span className="text-amber-500">🍀</span>
                      {detailProduct.category?.toUpperCase() === 'HONEY' ? 'HONEYRAJ' : 'BAZAR RAW'}
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      )}

      {/* VIEW 11: IN-APP CART SLIDE DRAWER SIDEBAR */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex animate-fade-in bg-black/60">
          <div className="ml-auto w-full max-w-md bg-white h-full p-6 shadow-2xl flex flex-col justify-between animate-slide-left text-slate-800">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-emerald-600" />
                  <span className="font-display font-black text-lg text-slate-800 uppercase tracking-tighter">My BAZAR THOLE Cart</span>
                </div>
                <button
                  id="cart-drawer-close"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 hover:text-red-500 text-gray-400 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Items listing inside cart */}
              <div className="mt-6 divide-y divide-slate-100 h-[64vh] overflow-y-auto no-scrollbar space-y-3 pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 leading-tight">
                    <div className="flex items-center gap-3">
                      <img src={item.product.image} className="h-10 w-10 rounded-lg object-cover" alt="" />
                      <div>
                        <span className="font-bold text-slate-700 block text-xs truncate max-w-[140px]">{item.product.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-1">৳ {item.product.price} / {item.product.unit}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity incremeting buttons */}
                      <div className="flex items-center border border-slate-200 rounded-lg p-1 text-slate-700 bg-slate-50">
                        <button
                          id={`cart-decrease-${item.product.id}`}
                          onClick={() => handleUpdateCartQty(item.product.id, -1)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-mono text-xs font-bold px-2">{item.quantity}</span>
                        <button
                          id={`cart-increase-${item.product.id}`}
                          onClick={() => handleUpdateCartQty(item.product.id, 1)}
                          className="p-1 hover:bg-slate-200 rounded text-slate-500"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        id={`cart-remove-${item.product.id}`}
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                        title="Remove product"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="text-center py-20 space-y-4 text-slate-400 font-sans">
                     <ShoppingBag className="mx-auto h-12 w-12 text-slate-200" />
                     <p className="text-xs">Your basket folder is fully clean. Explore our shop!</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sum total calculators at the drawer footer bottom */}
            <div className="border-t border-gray-100 pt-4 space-y-4">
              <div className="flex items-center justify-between font-bold text-sm text-slate-800">
                <span>Subtotal Items Val:</span>
                <span className="text-emerald-600 font-display text-lg">৳ {cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0)}</span>
              </div>
              
              <div className="flex gap-3">
                <button
                  id="checkout-direct-btn"
                  onClick={() => { setIsCartOpen(false); setActiveTab('checkout'); }}
                  disabled={cart.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl tracking-wide text-xs shadow shadow-emerald-650/15 disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none transition-all active:scale-95 cursor-pointer text-center"
                >
                  Direct Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 12: SECURE SANDBOX PAYMENTS SIMULATION MODALS */}
      {paySimulator && paySimulator.active && (
        <PayProcess
          method={paySimulator.method}
          amount={paySimulator.amount}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setPaySimulator(null)}
          settings={settings}
        />
      )}

      {/* VIEW 13: COMPREHENSIVE ADMIN DASHBOARD DRAWER PANEL */}
      {isAdminOpen && (
        <AdminPanel
          onDataChanged={loadAllDbValues}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* VIEW 14: THANK YOU POPUP MODAL (DIRECT CONFRIME POPUP) */}
      {showThankYouPopup && latestPlacedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border-2 border-stone-900 w-full max-w-lg rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden animate-scale-up">
            
            {/* Top decorative accent */}
            <div className="h-3 bg-[#0E6C57] w-full" />
            
            {/* Close button */}
            <button
              onClick={() => {
                setShowThankYouPopup(false);
                setLatestPlacedOrder(null);
                setActiveTab('home');
              }}
              className="absolute top-5 right-5 p-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-full text-stone-700 transition-colors cursor-pointer active:scale-95"
              title="Close"
              type="button"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Content Container */}
            <div className="p-6 sm:p-8 text-center space-y-6">
              
              {/* Check Icon with dynamic scale */}
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 border-4 border-emerald-500/20 shadow-md animate-bounce">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 animate-pulse" />
              </div>

              {/* Success Greetings */}
              <div className="space-y-2">
                <h2 className="font-sans font-black text-2xl sm:text-3xl text-stone-950 leading-tight">
                  ধন্যবাদ! অর্ডার কনফার্ম হয়েছে
                </h2>
                <p className="text-sm font-semibold text-emerald-700 font-sans leading-relaxed">
                  আলহামদুলিল্লাহ! আপনার অর্ডারটি সফলভাবে সম্পন্ন হয়েছে।
                </p>
              </div>

              {/* Order Info & Tracking Card */}
              <div className="bg-stone-50 border-2 border-stone-900 p-4 rounded-2xl space-y-3 text-left">
                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <span className="text-xs font-bold text-stone-500">অর্ডার নম্বর (Order ID):</span>
                  <span className="text-xs font-bold text-stone-950 font-mono">#{latestPlacedOrder.id}</span>
                </div>
                
                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <span className="text-xs font-bold text-stone-500">মোট মূল্য (Total Amount):</span>
                  <span className="text-sm font-black text-[#0E6C57] font-sans">৳ {latestPlacedOrder.total.toLocaleString('en-US')}</span>
                </div>

                <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                  <span className="text-xs font-bold text-stone-500">পেমেন্ট পদ্ধতি (Payment):</span>
                  <span className="text-xs font-semibold text-stone-800 font-sans">{latestPlacedOrder.paymentMethod}</span>
                </div>

                {/* Tracking Code with copy button */}
                <div className="pt-1">
                  <span className="text-[10px] font-black text-stone-400 block uppercase tracking-widest leading-none mb-1.5">YOUR TRACKING ID (ট্র্যাকিং আইডি):</span>
                  <div className="flex items-center gap-2">
                    <strong className="text-stone-950 font-mono text-sm tracking-wider uppercase bg-white border border-stone-300 px-3 py-1.5 rounded flex-1 text-center">
                      {latestPlacedOrder.trackingCode}
                    </strong>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(latestPlacedOrder.trackingCode);
                        triggerToast('📋 Tracking ID copied safely to device!');
                      }}
                      className="p-2 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg text-emerald-600 transition-colors cursor-pointer active:scale-95 shadow-sm"
                      title="Copy Tracking ID"
                      type="button"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-xs text-stone-500 leading-relaxed font-sans px-4">
                আমাদের প্রতিনিধি অতি শীঘ্রই আপনার নাম্বারে কল করে অর্ডারটি নিশ্চিত করে ডেলিভারি প্রক্রিয়া শুরু করবেন।
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
                <button
                  onClick={() => {
                    setShowThankYouPopup(false);
                    setLatestPlacedOrder(null);
                    setActiveTab('home');
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-[#0E6C57] hover:bg-[#0b5443] text-white border-2 border-stone-900 font-black text-sm uppercase tracking-widest rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4" />
                  কেনাকাটা চালিয়ে যান
                </button>
              </div>

              {/* Auto close message */}
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest pt-2">
                ⏱️ {successCountdown} সেকেন্ডের মধ্যে হোমপেজে নিয়ে যাওয়া হবে...
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
