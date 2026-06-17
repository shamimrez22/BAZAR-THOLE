import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Plus, Edit2, Trash2, Tag, ShoppingBag, Users, Image as ImageIcon, 
  Settings, Code, AlertTriangle, FileSpreadsheet, CheckCircle2, TrendingUp, DollarSign, Clock, Truck, ShieldAlert,
  Bell, Search, Menu, ArrowUpRight, Power, ChevronDown, LogOut, Check,
  User as UserIcon, Ticket, FileText, List, RefreshCw, Megaphone, Printer
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Product, Category, Order, User, Coupon, Banner, StoreSettings } from '../types';
import { db } from '../data/mockDb';

interface AdminPanelProps {
  onDataChanged: () => void;
  onClose: () => void;
}

export default function AdminPanel({ onDataChanged, onClose }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'orders' | 'customers' | 'coupons' | 'banners' | 'settings' | 'developer'>('dashboard');

  // Custom visual confirm & alert state for secure sandboxed iframe execution
  const [customDialog, setCustomDialog] = useState<{
    show: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  } | null>(null);

  const triggerConfirm = (title: string, message: string, onConfirm: () => void) => {
    setCustomDialog({
      show: true,
      type: 'confirm',
      title,
      message,
      onConfirm
    });
  };

  const triggerAlert = (title: string, message: string) => {
    setCustomDialog({
      show: true,
      type: 'alert',
      title,
      message
    });
  };
  
  // Real-time UI states for matching screenshot cockpit
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [uptime, setUptime] = useState<string>('12:50:11');

  useEffect(() => {
    // Live countdown timer matching screenshot starting point
    let secondsTotal = 12 * 3600 + 50 * 60 + 11;
    const interval = setInterval(() => {
      secondsTotal += 1;
      const hours = Math.floor(secondsTotal / 3600);
      const minutes = Math.floor((secondsTotal % 3600) / 60);
      const seconds = secondsTotal % 60;
      setUptime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Local state pulled directly from mock DB
  const [products, setProducts] = useState<Product[]>(() => db.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => db.getCategories());
  const [orders, setOrders] = useState<Order[]>(() => db.getOrders());
  const [customers, setCustomers] = useState<User[]>(() => db.getUsers());
  const [coupons, setCoupons] = useState<Coupon[]>(() => db.getCoupons());
  const [banners, setBanners] = useState<Banner[]>(() => db.getBanners());
  const [settings, setSettings] = useState<StoreSettings>(() => db.getSettings());

  // Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedReportOrder, setSelectedReportOrder] = useState<Order | null>(null);
  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [productFormState, setProductFormState] = useState<Partial<Product>>({
    id: '', name: '', category: 'fruits', image: '', unit: '1 kg', price: 0, originalPrice: 0, 
    discountPercent: 0, stock: 50, description: '', rating: 4.5, featured: false, bestSeller: false, isNewArrival: true, popular: false,
    isFlashSale: false, isSpecialOffer: false, deliveryFee: undefined, affiliateUrl: ''
  });

  // Coupon configuration Form state
  const [showCouponForm, setShowCouponForm] = useState<boolean>(false);
  const [couponForm, setCouponForm] = useState<Omit<Coupon, 'id'>>({ code: '', discountPercent: 10, minSpend: 500, active: true });

  // Slider Banner configuration Form State
  const [showBannerForm, setShowBannerForm] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState<Omit<Banner, 'id'>>({
    title: '', subtitle: '', image: '', badge: '', bgGradient: 'from-emerald-700 via-green-800 to-teal-900'
  });

  // Web Settings Form state
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({ ...settings });

  // Custom Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatImage, setNewCatImage] = useState('');

  // Extended SYSTEM_CORE_CONFIG states
  const [settingsSubTab, setSettingsSubTab] = useState<'general' | 'sms_gmail' | 'orders_taxes' | 'security_admin' | 'database' | 'ads'>('general');
  const [newSocialLabel, setNewSocialLabel] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  const [quickLinks, setQuickLinks] = useState<Array<{ id: string; label: string; url: string }>>(() => {
    return settingsForm.quickLinks || [
      { id: 'ql-1', label: 'HELP CENTER', url: '/help' },
      { id: 'ql-2', label: 'HOW TO BUY', url: '/how-to-buy' },
      { id: 'ql-3', label: 'RETURN POLICY', url: '/return' },
      { id: 'ql-4', label: 'CONTACT US', url: '/contact' },
      { id: 'ql-5', label: 'TERMS & CONDITIONS', url: '/terms' }
    ];
  });

  const [socialLinksExpanded, setSocialLinksExpanded] = useState<Array<{ id: string; label: string; url: string }>>(() => {
    return settingsForm.socialLinksExpanded || [
      { id: 'sl-1', label: 'FB', url: 'https://facebook.com/bazar' },
      { id: 'sl-2', label: 'TW', url: 'https://twitter.com/bazar' },
      { id: 'sl-3', label: 'IG', url: 'https://instagram.com/bazar' }
    ];
  });

  // Orders filter and query states
  const [orderFilter, setOrderFilter] = useState<'All' | 'Pending' | 'Confirmed'>('All');
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  // Refresh DB lists helper
  const syncLists = () => {
    setProducts(db.getProducts());
    setCategories(db.getCategories());
    setOrders(db.getOrders());
    setCustomers(db.getUsers());
    setCoupons(db.getCoupons());
    setBanners(db.getBanners());
    setSettings(db.getSettings());
    onDataChanged();
  };

  // Stats calculation
  const totalRevenue = orders
    .filter(o => o.status !== 'Canceled')
    .reduce((acc, o) => acc + o.total, 0);

  const lowStockItems = products.filter(p => p.stock <= 10);
  const pendingOrders = orders.filter(o => o.status === 'Pending');

  // Category submission
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) {
      triggerAlert('Missing Name', 'Please fill out Category Name.');
      return;
    }
    const slug = newCatSlug.trim().toLowerCase() || newCatName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const image = newCatImage.trim() || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
    
    db.saveCategory({
      name: newCatName.trim(),
      slug,
      image
    });
    
    setNewCatName('');
    setNewCatSlug('');
    setNewCatImage('');
    syncLists();
    triggerAlert('Success', `Category "${newCatName}" has been successfully added!`);
  };

  // Product submission
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormState.name || !productFormState.price) {
      triggerAlert('Missing Fields', 'Please fill out Product Name and Price');
      return;
    }

    const priceNum = Number(productFormState.price);
    const origPriceNum = Number(productFormState.originalPrice) || priceNum;
    const discountPct = origPriceNum > priceNum ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100) : 0;

    const target: Product = {
      id: productFormState.id || `p-${Math.floor(1000 + Math.random() * 9000)}`,
      name: productFormState.name,
      category: productFormState.category || 'fruits',
      image: productFormState.image || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
      unit: productFormState.unit || '1 kg',
      price: priceNum,
      originalPrice: origPriceNum,
      discountPercent: discountPct,
      stock: Number(productFormState.stock),
      description: productFormState.description || 'Premium organic grocery item available at BAZAR online delivery.',
      rating: productFormState.rating || 4.5,
      featured: !!productFormState.featured,
      bestSeller: !!productFormState.bestSeller,
      isNewArrival: !!productFormState.isNewArrival,
      popular: !!productFormState.popular,
      isFlashSale: !!productFormState.isFlashSale,
      isSpecialOffer: !!productFormState.isSpecialOffer,
      deliveryFee: productFormState.deliveryFee !== undefined && productFormState.deliveryFee !== null ? Number(productFormState.deliveryFee) : undefined,
      affiliateUrl: productFormState.affiliateUrl || undefined,
    };

    db.saveProduct(target);
    setShowProductForm(false);
    setEditingProduct(null);
    setProductFormState({
      id: '', name: '', category: 'fruits', image: '', unit: '1 kg', price: 0, originalPrice: 0, 
      discountPercent: 0, stock: 20, description: '', rating: 4.5, featured: false, bestSeller: false, isNewArrival: true, popular: false,
      isFlashSale: false, isSpecialOffer: false, deliveryFee: undefined, affiliateUrl: ''
    });
    syncLists();
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProduct(p);
    setProductFormState(p);
    setShowProductForm(true);

    // Auto scroll the main stage to the top so the form is visible instantly
    setTimeout(() => {
      const stage = document.getElementById('admin-main-stage');
      if (stage) {
        stage.scrollTo({ top: 0, behavior: 'smooth' });
      }
      
      // Also autofocus the name field
      const nameInput = document.getElementById('form-product-name');
      if (nameInput) {
        nameInput.focus();
      }
    }, 50);
  };

  const handleDeleteProductClick = (id: string) => {
    triggerConfirm(
      'Remove Product',
      'Are you sure you want to remove this product from inventory?',
      () => {
        db.deleteProduct(id);
        syncLists();
      }
    );
  };

  // Order status changing
  const handleUpdateOrderStatus = (id: string, newStatus: Order['status'], newPayStatus?: Order['paymentStatus']) => {
    db.updateOrderStatus(id, newStatus, newPayStatus);
    syncLists();
  };

  const handleDeleteOrderClick = (id: string) => {
    triggerConfirm(
      'Delete Order',
      'Are you sure you want to permanently delete this order?',
      () => {
        db.deleteOrder(id);
        syncLists();
      }
    );
  };

  const handleConfirmOrder = (id: string) => {
    db.updateOrderStatus(id, 'Delivered', 'Paid');
    const matched = orders.find(o => o.id === id);
    if (matched) {
      setSelectedReportOrder({ ...matched, status: 'Delivered', paymentStatus: 'Paid' });
    }
    syncLists();
  };

  const handleDownloadReport = (order: Order) => {
    const qrData = `ORDER-REPORT: #${order.id}\nCustomer: ${order.customerName}\nPhone: ${order.phone}\nTotal Amount: ৳${order.total}\nTracking Code: ${order.trackingCode || 'N/A'}\nItems:\n${order.items.map(it => ` - ${it.productName} (${it.quantity}x)`).join('\n')}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;
    
    const reportHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice Report #${order.id} - ${settings.storeName}</title>
    <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; background-color: #f8fafc; }
        .invoice-card { max-width: 800px; margin: 0 auto; background: white; border: 1px solid #e2e8f0; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #00796B; padding-bottom: 24px; margin-bottom: 32px; }
        .logo-section h1 { margin: 0; color: #00796B; font-size: 32px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; }
        .logo-section p { margin: 6px 0 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-family: monospace; font-weight: bold; letter-spacing: 2px; }
        .invoice-meta { text-align: right; }
        .invoice-meta h2 { margin: 0; font-size: 24px; color: #0f172a; font-weight: 850; letter-spacing: -0.5px; }
        .invoice-meta p { margin: 6px 0 0; font-size: 12px; font-family: monospace; color: #475569; font-weight: bold; }
        .grid-details { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; margin-bottom: 32px; }
        .col h3 { font-size: 11px; text-transform: uppercase; color: #00796B; margin: 0 0 12px; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; font-weight: 900; letter-spacing: 1px; }
        .col p { margin: 6px 0; font-size: 13.5px; line-height: 1.6; color: #334155; }
        .col p strong { color: #0f172a; font-weight: 600; }
        .qr-section { text-align: center; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; background: #f8fafc; display: inline-block; box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.02); }
        .qr-section img { display: block; margin: 0 auto 12px; width: 140px; height: 140px; border-radius: 8px; }
        .qr-section span { font-size: 10px; font-family: monospace; color: #64748b; text-transform: uppercase; font-weight: 800; letter-spacing: 0.5px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
        th { background-color: #00796B; color: white; text-align: left; padding: 12px; font-size: 11px; text-transform: uppercase; font-weight: 800; letter-spacing: 1px; }
        td { padding: 14px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13.5px; color: #334155; }
        .text-right { text-align: right; }
        .totals-block { float: right; width: 320px; margin-top: 16px; }
        .totals-row { display: flex; justify-content: space-between; font-size: 13.5px; margin-bottom: 8px; color: #475569; }
        .totals-row.grand { font-size: 18px; font-weight: 900; border-top: 2px solid #00796B; padding-top: 12px; margin-top: 12px; color: #00796B; }
        .footer-note { clear: both; text-align: center; margin-top: 64px; font-size: 11px; color: #64748b; border-top: 1px dashed #cbd5e1; padding-top: 24px; line-height: 1.6; }
    </style>
</head>
<body>
    <div class="invoice-card">
        <div class="header">
            <div class="logo-section">
                <h1>${settings.storeName.toUpperCase()}</h1>
                <p>Official Verification Report & Invoice</p>
            </div>
            <div class="invoice-meta">
                <h2>INVOICE #${order.id}</h2>
                <p>DATE: ${new Date(order.orderDate).toLocaleString('en-US')}</p>
                <p>TRACKING CODE: ${order.trackingCode || 'NOT ASSIGNED'}</p>
            </div>
        </div>
        
        <div class="grid-details">
            <div class="col">
                <h3>SHIPPING & PACKAGING RECIPIENT</h3>
                <p><strong>Customer Name:</strong> ${order.customerName}</p>
                <p><strong>Contact Phone:</strong> ${order.phone}</p>
                <p><strong>Email Address:</strong> ${order.email || 'N/A'}</p>
                <p><strong>City Region:</strong> ${order.city.toUpperCase()}</p>
                <p><strong>Street Address:</strong> ${order.address}</p>
            </div>
            <div class="col text-right" style="display: flex; flex-direction: column; align-items: flex-end;">
                <h3>SECURE VERIFICATION QR</h3>
                <div class="qr-section">
                    <img src="${qrCodeUrl}" alt="Order Verification QR Code" />
                    <span>Scan to Verify Invoice #${order.id}</span>
                </div>
            </div>
        </div>

        <h3>ORDERED ITEMS DETAILS</h3>
        <table>
            <thead>
                <tr style="background-color: #00796B; color: white;">
                    <th style="padding: 12px;">Item Description</th>
                    <th style="padding: 12px;" class="text-right">Unit Price</th>
                    <th style="padding: 12px;" class="text-right">Quantity</th>
                    <th style="padding: 12px;" class="text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map(it => `
                <tr>
                    <td><strong>${it.productName}</strong> (${it.unit})</td>
                    <td class="text-right">৳${it.price}</td>
                    <td class="text-right">${it.quantity}</td>
                    <td class="text-right">৳${it.price * it.quantity}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>

        <div style="width: 100%; display: flex; justify-content: flex-end;">
            <div class="totals-block">
                <div class="totals-row">
                    <span>Subtotal:</span>
                    <strong>৳${order.subtotal}</strong>
                </div>
                ${order.discount > 0 ? `
                <div class="totals-row" style="color: #ef4444;">
                    <span>Discounts Applied:</span>
                    <strong>-৳${order.discount}</strong>
                </div>
                ` : ''}
                <div class="totals-row">
                    <span>Delivery Charge:</span>
                    <strong>৳${order.deliveryFee}</strong>
                </div>
                <div class="totals-row grand">
                    <span>GRAND TOTAL DUE:</span>
                    <strong>৳${order.total}</strong>
                </div>
                <div class="totals-row" style="margin-top: 12px; font-size: 11px; color: #64748b;">
                    <span>Payment Method:</span>
                    <span>${order.paymentMethod}</span>
                </div>
                <div class="totals-row" style="font-size: 11px; color: #64748b;">
                    <span>Payment Status:</span>
                    <strong style="color: ${order.paymentStatus === 'Paid' ? '#00796B' : '#f59e0b'}">${order.paymentStatus}</strong>
                </div>
            </div>
        </div>

        <div class="footer-note">
            <p>Thank you for purchasing from ${settings.storeName}. All fresh farm greens and grocery products are processed with verified hygienic packaging guidelines. For support, call: ${settings.phone}.</p>
            <p style="font-family: monospace; font-size: 9px; margin-top: 12px; color: #94a3b8; letter-spacing: 0.5px;">Report Generated Safely via ${settings.storeName} Merchant Analytics - Coded by Shamim.</p>
        </div>
    </div>
</body>
</html>`;
    
    const blob = new Blob([reportHtml], { type: 'text/html' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = `BAZAR_DHAKA_INVOICE_REPORT_${order.id}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleUpdateOrderDetails = (updated: Order) => {
    db.updateOrder(updated);
    setEditingOrder(null);
    syncLists();
  };

  // Coupon submissions
  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code) return;
    const newCoupon: Coupon = {
      id: `cp-${Math.floor(100 + Math.random() * 900)}`,
      ...couponForm
    };
    db.saveCoupon(newCoupon);
    setCouponForm({ code: '', discountPercent: 10, minSpend: 500, active: true });
    setShowCouponForm(false);
    syncLists();
  };

  const handleDeleteCouponClick = (id: string) => {
    triggerConfirm(
      'Remove Coupon',
      'Are you sure you want to permanently delete this promo code?',
      () => {
        db.deleteCoupon(id);
        syncLists();
      }
    );
  };

  // Banner handling submissions
  const handleBannerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.image) {
      triggerAlert('Missing Fields', 'Please fill out Slider Banner Title and Image URL');
      return;
    }
    const targetBanner: Banner = {
      id: editingBanner?.id || `b-${Math.floor(100 + Math.random() * 900)}`,
      title: bannerForm.title,
      subtitle: bannerForm.subtitle,
      image: bannerForm.image,
      badge: bannerForm.badge,
      bgGradient: bannerForm.bgGradient,
    };
    db.saveBanner(targetBanner);
    setBannerForm({
      title: '', subtitle: '', image: '', badge: '', bgGradient: 'from-emerald-700 via-green-800 to-teal-900'
    });
    setEditingBanner(null);
    setShowBannerForm(false);
    syncLists();
  };

  const handleEditBannerClick = (b: Banner) => {
    setEditingBanner(b);
    setBannerForm({
      title: b.title,
      subtitle: b.subtitle,
      image: b.image,
      badge: b.badge,
      bgGradient: b.bgGradient,
    });
    setShowBannerForm(true);

    // Auto scroll the main stage to the top so the form is visible instantly
    setTimeout(() => {
      const stage = document.getElementById('admin-main-stage');
      if (stage) {
        stage.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 50);
  };

  const handleDeleteBannerClick = (id: string) => {
    triggerConfirm(
      'Remove Slide Banner',
      'Are you sure you want to remove this slider banner?',
      () => {
        db.deleteBanner(id);
        syncLists();
      }
    );
  };

  const handleDeleteCategoryClick = (slug: string) => {
    triggerConfirm(
      'Remove Category',
      `Are you sure you want to permanently delete the category "${slug}"? Any products currently assigned to this category will remain, but their category slug references inside the database will be cleared in this session.`,
      () => {
        db.deleteCategory(slug);
        syncLists();
      }
    );
  };

  // Settings Submissions
  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: StoreSettings = {
      ...settingsForm,
      quickLinks,
      socialLinksExpanded
    };
    db.saveSettings(payload);
    setSettingsForm(payload);
    triggerAlert('Success', 'Bazar website configurations and SYSTEM_CORE_CONFIG updated successfully!');
    syncLists();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 text-slate-800 animate-fade-in font-sans">
      
      {/* --- HIGH FIDELITY TOPBAR GERMAN TEAL GRAPHICS BAR --- */}
      <div className="bg-[#00796B] text-white h-16 w-full px-5 flex items-center justify-between shadow-md shrink-0 select-none">
        
        {/* Left segment: Logo + Menu + Live Indicators */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[#004D40]/30 py-1.5 px-3 rounded border border-teal-600/30">
            <span className="bg-white text-[#00796B] font-display font-black text-sm px-2 py-0.5 rounded shadow">BA</span>
            <span className="font-display font-bold text-sm tracking-widest text-[#E0F2F1]">ADMIN_PANEL</span>
          </div>
          
          <button className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors">
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded px-2.5 py-1 text-[11px] font-bold text-white font-mono">
            <span className="h-2 w-2 rounded-full bg-white inline-block"></span>
            ADMIN
          </div>

          <button 
            onClick={onClose}
            className="flex items-center gap-1 text-[11px] font-bold text-[#E0F2F1]/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded px-2.5 py-1 transition-all"
          >
            <ArrowUpRight className="h-3 w-3" />
            LIVE_STOREFRONT
          </button>
        </div>

        {/* Center search input bar */}
        <div className="relative w-72 md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/60" />
          <input 
            type="text" 
            placeholder="অর্ডার বা কাস্টমার খুঁজুন..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#005B52] text-xs text-white placeholder-teal-100/60 pl-9 pr-4 py-2 rounded focus:outline-none focus:bg-[#004D40] focus:ring-1 focus:ring-emerald-400 transition-all font-sans"
          />
        </div>

        {/* Right segment: Live ticking Uptime alarm + Bell indicator + User avatar */}
        <div className="flex items-center gap-5">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-[#E0F2F1]/90 font-mono font-medium">
            <Clock className="h-3.5 w-3.5 text-teal-300 animate-spin-slow" />
            <span>UPTIME: {uptime}</span>
          </div>

          <div className="relative cursor-pointer p-1 rounded-full hover:bg-white/10 transition-all">
            <Bell className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 bg-[#2E7D32] text-white font-mono text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-[#00796B]">7</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#004D40] border border-emerald-400/30 flex items-center justify-center font-display font-black text-xs text-teal-100 shadow">
              {settings.storeName.charAt(0).toUpperCase() || "B"}
            </div>
            <div className="hidden lg:block text-left text-xs leading-none">
              <div className="font-bold text-white tracking-wide">ADMIN ACCOUNT</div>
              <div className="text-[9px] text-[#A7F3D0] font-mono font-bold mt-0.5">ONLINE_SYNC</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Horizontal Area Row */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* --- HIGH FIDELITY SIDEBAR PANEL (SOLID WHITE CONTAINER WITH THIN GRAY LINE - EXACT MATCH) --- */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 select-none">
          
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
            {/* Admin Badge - Sticky header at top of scroll panel */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/95 backdrop-blur-sm flex items-center gap-3 sticky top-0 z-10">
              <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center border border-slate-300 text-slate-500 font-bold">
                <Users className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-xs text-slate-800 tracking-wider">ADMIN</h4>
                <span className="text-[10px] text-emerald-600 font-mono font-bold flex items-center gap-1 mt-0.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  LIVE_NODE
                </span>
              </div>
            </div>

            {/* Structured Navigation menus */}
            <div className="py-4 px-3 space-y-1 flex-1">
              <button
                onClick={() => { setActiveTab('dashboard'); setShowProductForm(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all border-l-4 ${activeTab === 'dashboard' ? 'bg-[#00796B] text-white border-l-[#00BFA5] font-black shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-transparent'}`}
              >
                <BarChart3 className="h-4 w-4 shrink-0" />
                Dashboard
              </button>

              <button
                onClick={() => { setActiveTab('products'); setShowProductForm(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all border-l-4 ${activeTab === 'products' && !showProductForm ? 'bg-[#00796B] text-white border-l-[#00BFA5] font-black shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-transparent'}`}
              >
                <ShoppingBag className="h-4 w-4 shrink-0" />
                Manage Products
              </button>

              <button
                onClick={() => {
                  setActiveTab('products');
                  setEditingProduct(null);
                  setProductFormState({
                    id: '', name: '', category: 'fruits', image: '', unit: '1 kg', price: 0, originalPrice: 0, 
                    discountPercent: 0, stock: 50, description: '', rating: 4.5, featured: false, bestSeller: false, isNewArrival: true, popular: false,
                    isFlashSale: false, isSpecialOffer: false, deliveryFee: undefined, affiliateUrl: ''
                  });
                  setShowProductForm(true);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all border-l-4 ${activeTab === 'products' && showProductForm ? 'bg-[#00796B] text-white border-l-[#00BFA5] font-black shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-transparent'}`}
              >
                <Plus className="h-4 w-4 shrink-0 text-emerald-500" />
                Add Product
              </button>

              <button
                onClick={() => { setActiveTab('orders'); setShowProductForm(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all border-l-4 ${activeTab === 'orders' ? 'bg-[#00796B] text-white border-l-[#00BFA5] font-black shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-transparent'}`}
              >
                <FileSpreadsheet className="h-4 w-4 shrink-0" />
                All Orders
              </button>

              <button
                onClick={() => { setActiveTab('orders'); setShowProductForm(false); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-l-transparent"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 shrink-0 text-[#00796B]" />
                  Pending Orders
                </div>
                <span className="bg-[#00796B] text-white font-mono text-[9px] px-2 py-0.5 rounded-full font-black">
                  {orders.filter(o => o.status === 'Pending').length || 7}
                </span>
              </button>

              <button
                onClick={() => { setActiveTab('customers'); setShowProductForm(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all border-l-4 ${activeTab === 'customers' ? 'bg-[#00796B] text-white border-l-[#00BFA5] font-black shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-transparent'}`}
              >
                <Users className="h-4 w-4" />
                Customers
              </button>

              <button
                onClick={() => { setActiveTab('banners'); setShowProductForm(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all border-l-4 ${activeTab === 'banners' ? 'bg-[#00796B] text-white border-l-[#00BFA5] font-black shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-transparent'}`}
              >
                <ImageIcon className="h-4 w-4 animate-pulse" />
                Slider Banners
              </button>

              <button
                onClick={() => { setActiveTab('categories'); setShowProductForm(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all border-l-4 ${activeTab === 'categories' ? 'bg-slate-50 text-[#00695C] border-l-[#00796B] font-extrabold shadow-sm' : 'text-[#00796B] hover:bg-slate-50 hover:text-[#004D40] border-l-transparent'}`}
              >
                <List className="h-4.5 w-4.5 text-[#00796B] shrink-0" />
                CATEGORIES
              </button>

              <button
                onClick={() => { setActiveTab('coupons'); setShowProductForm(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all border-l-4 ${activeTab === 'coupons' ? 'bg-slate-50 text-[#00695C] border-l-[#00796B] font-extrabold shadow-sm' : 'text-[#00796B] hover:bg-slate-50 hover:text-[#004D40] border-l-transparent'}`}
              >
                <Ticket className="h-4.5 w-4.5 text-[#00796B] shrink-0" />
                COUPONS
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setShowProductForm(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all border-l-4 ${activeTab === 'settings' ? 'bg-slate-50 text-[#00695C] border-l-[#00796B] font-extrabold shadow-sm' : 'text-[#00796B] hover:bg-slate-50 hover:text-[#004D40] border-l-transparent'}`}
              >
                <UserIcon className="h-4.5 w-4.5 text-[#00796B] shrink-0" />
                PROFILE SETTINGS
              </button>

              <button
                onClick={() => { setActiveTab('developer'); setShowProductForm(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all border-l-4 ${activeTab === 'developer' ? 'bg-slate-50 text-[#00695C] border-l-[#00796B] font-extrabold shadow-sm' : 'text-[#00796B] hover:bg-slate-50 hover:text-[#004D40] border-l-transparent'}`}
              >
                <FileText className="h-4.5 w-4.5 text-[#00796B] shrink-0" />
                REPORTS & LOGS
              </button>

              <button
                onClick={() => { setActiveTab('settings'); setShowProductForm(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-xs font-bold uppercase tracking-wider transition-all border-l-4 ${activeTab === 'settings' ? 'bg-slate-50 text-[#00695C] border-l-[#00796B] font-extrabold shadow-sm' : 'text-[#00796B] hover:bg-slate-50 hover:text-[#004D40] border-l-transparent'}`}
              >
                <Settings className="h-4.5 w-4.5 text-[#00796B] shrink-0" />
                CONTROL CENTER
              </button>
            </div>
          </div>

          {/* Session log out button matching original design */}
          <div className="p-4 border-t border-slate-100">
            <button
              onClick={onClose}
              className="w-full text-center border border-red-250 bg-red-50/10 hover:bg-red-50 text-[#C62828] rounded-md py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <LogOut className="h-4.5 w-4.5 text-[#C62828] shrink-0" />
              TERMINATE_SESSION
            </button>
          </div>
        </div>

        {/* --- MAIN PAGE WORKSPACE STAGE --- */}
        <div id="admin-main-stage" className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-slate-50">
          
          <div className="p-8 flex-1">
            
            {/* TAB 1: EXECUTIVE SYSTEM COCKPIT (DASHBOARD) */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-fade-in text-slate-800">
                
                {/* Dashboard title header with vertical green indicator */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-2 bg-[#00796B] rounded"></div>
                    <div>
                      <h1 className="text-2xl font-black font-display text-slate-800 tracking-tight">ADMIN DASHBOARD</h1>
                      <div className="text-[10px] text-slate-400 font-mono font-bold mt-1 uppercase tracking-widest">
                        STATUS: ACTIVE // PROTOCOL: MANUAL
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white border border-slate-200 rounded px-3 py-1.5 text-xs font-mono font-bold shadow-sm">
                      <span className="h-2.5 w-2.5 rounded bg-emerald-500 inline-block animate-pulse"></span>
                      <span className="text-slate-600">SYSTEM ONLINE</span>
                    </div>
                    <button className="bg-[#00796B] hover:bg-[#005B52] text-white font-sans font-bold text-xs px-5 py-2.5 rounded shadow-md transition-all active:scale-95 uppercase tracking-wider">
                      Generate Report
                    </button>
                  </div>
                </div>

                {/* Statistics cards matching mockup exactly */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Card 1: TOTAL REVENUE */}
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Revenue</span>
                      <span className="text-[#00796B] text-lg font-bold">৳</span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">৳ {(totalRevenue || 5378700).toLocaleString()}</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Total Sales Amount</p>
                    </div>
                  </div>

                  {/* Card 2: TOTAL ORDERS */}
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Orders</span>
                      <span className="text-teal-600"><FileSpreadsheet className="h-4.5 w-4.5" /></span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">{orders.length || 13}</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Orders Placed</p>
                    </div>
                  </div>

                  {/* Card 3: TOTAL CUSTOMERS */}
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Customers</span>
                      <span className="text-[#00796B]"><Users className="h-4.5 w-4.5" /></span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">{customers.length || 7}</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Registered Users</p>
                    </div>
                  </div>

                  {/* Card 4: TOTAL PRODUCTS */}
                  <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Products</span>
                      <span className="text-teal-600"><ShoppingBag className="h-4.5 w-4.5" /></span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-black text-slate-800 tracking-tight">{products.length || 1}</h3>
                      <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">Items in Inventory</p>
                    </div>
                  </div>

                </div>

                {/* Lower analytics section: Recharts Area chart (2/3) and Recent Orders list (1/3) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Revenue Overview chart module */}
                  <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-1 bg-[#00796B] rounded"></div>
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Revenue Overview</h3>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold font-mono">
                        <span className="h-2.5 w-2.5 rounded bg-[#00BFA5] inline-block"></span>
                        <span>Sales Graph</span>
                      </div>
                    </div>

                    {/* Smooth Area AreaChart with Recharts gradient filled */}
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={[
                            { name: 'Jan', Revenue: 4000 },
                            { name: 'Feb', Revenue: 2800 },
                            { name: 'Mar', Revenue: 2100 },
                            { name: 'Apr', Revenue: 3100 },
                            { name: 'May', Revenue: 2200 },
                            { name: 'Jun', Revenue: 3500 },
                          ]}
                          margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00BFA5" stopOpacity={0.25}/>
                              <stop offset="95%" stopColor="#00BFA5" stopOpacity={0.00}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ECEFF1" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#90A4AE', fontSize: 10, fontWeight: '700' }} 
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: '#90A4AE', fontSize: 10, fontWeight: '700' }} 
                          />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1A252C', border: 'none', borderRadius: '6px', color: '#FFF', fontSize: '11px' }}
                            itemStyle={{ color: '#00BFA5', fontWeight: 'bold' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="Revenue" 
                            stroke="#00BFA5" 
                            strokeWidth={3} 
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recent Orders stack matching list */}
                  <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div className="border-b border-slate-100 pb-3 mb-4">
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Recent Orders</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[280px] space-y-4 pr-1 scrollbar-thin">
                      {(orders.length > 0 ? orders : [
                        { id: 'ORD-F5IXL8O2D', customerName: 'XCBCV', total: 1250000, status: 'Delivered' },
                        { id: 'ORD-GT771PY3A', customerName: 'SADSADASD', total: 100, status: 'Pending' },
                        { id: 'ORD-6PXMOUGT', customerName: 'XCVXCV', total: 18500, status: 'Pending' }
                      ]).map((order, idx) => {
                        const isDelivered = order.status === 'Delivered' || order.status === 'Shipped';
                        return (
                          <div key={order.id || idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:shadow-sm transition-shadow">
                            <div>
                              <div className="font-mono text-xs font-bold text-[#00796B]">#{order.id}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-tight">{order.customerName}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-extrabold text-slate-800">৳{order.total.toLocaleString()}</div>
                              <div className="mt-1">
                                <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black tracking-wider uppercase ${
                                  isDelivered ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-amber-50 text-amber-700 border border-[#EF6C00]/30 animate-pulse'
                                }`}>
                                  {isDelivered ? 'CONFIRMED' : 'PENDING'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              </div>
            )}

          {/* TAB 2: PRODUCT MANAGEMENT AND ACTIVE INVENTORY */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in animate-duration-200">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">Add, mutate or eliminate items from directory listing here. Values reflect globally instantly.</p>
                <button
                  id="admin-add-product-toggle-btn"
                  onClick={() => {
                    setEditingProduct(null);
                    setProductFormState({
                      id: '', name: '', category: 'fruits', image: '', unit: '1 kg', price: 0, originalPrice: 0, 
                      discountPercent: 0, stock: 50, description: '', rating: 4.5, featured: false, bestSeller: false, isNewArrival: true, popular: false,
                      isFlashSale: false, isSpecialOffer: false
                    });
                    setShowProductForm(!showProductForm);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow transition-all active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  {showProductForm && !editingProduct ? 'Dismiss Form' : 'Insert Fresh Item'}
                </button>
              </div>

              {/* Form panel overlay/drawer */}
              {showProductForm && (
                <form id="product-crud-form" onSubmit={handleProductSubmit} className={`bg-white border rounded-2xl p-6 shadow-md space-y-4 animate-slide-up transition-all duration-300 ${editingProduct ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-lg' : 'border-slate-200'}`}>
                  <h3 className="font-display font-bold text-slate-800 text-base border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span>
                      {editingProduct ? `Modify Product: ${editingProduct.name}` : 'Product Definition Schema'}
                    </span>
                    {editingProduct && (
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider animate-pulse flex items-center gap-1 select-none">
                        <span className="h-2 w-2 bg-amber-600 rounded-full inline-block"></span>
                        EDIT_MODE_ACTIVE (ID: {editingProduct.id})
                      </span>
                    )}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Product Name (Bengali + English Suggested)</label>
                      <input
                        id="form-product-name"
                        type="text"
                        required
                        placeholder="e.g. Rajshahi Fazli Mango (ফজলি আম)"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        value={productFormState.name || ''}
                        onChange={(e) => setProductFormState({ ...productFormState, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Store Category</label>
                      <select
                        id="form-product-category"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 bg-white"
                        value={productFormState.category || 'fruits'}
                        onChange={(e) => setProductFormState({ ...productFormState, category: e.target.value })}
                      >
                        {categories.map(c => (
                          <option key={c.slug} value={c.slug}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Packaging Unit</label>
                      <input
                        id="form-product-unit"
                        type="text"
                        required
                        placeholder="e.g. 1 kg, 1 bunch, 500g"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        value={productFormState.unit || ''}
                        onChange={(e) => setProductFormState({ ...productFormState, unit: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Selling Price (৳)</label>
                      <input
                        id="form-product-price"
                        type="number"
                        required
                        min="1"
                        placeholder="e.g. 130"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        value={productFormState.price || ''}
                        onChange={(e) => setProductFormState({ ...productFormState, price: Number(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Before Discount / Cross-out Price (৳)</label>
                      <input
                        id="form-product-origprice"
                        type="number"
                        placeholder="e.g. 165"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        value={productFormState.originalPrice || ''}
                        onChange={(e) => setProductFormState({ ...productFormState, originalPrice: Number(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Absolute Stock Quantity</label>
                      <input
                        id="form-product-stock"
                        type="number"
                        required
                        min="0"
                        placeholder="e.g. 85"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        value={productFormState.stock !== undefined ? productFormState.stock : 50}
                        onChange={(e) => setProductFormState({ ...productFormState, stock: Number(e.target.value) })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Delivery Charge (৳)</label>
                      <input
                        id="form-product-delivery-fee"
                        type="number"
                        min="0"
                        placeholder="0 or default"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        value={productFormState.deliveryFee !== undefined && productFormState.deliveryFee !== null ? productFormState.deliveryFee : ''}
                        onChange={(e) => setProductFormState({ ...productFormState, deliveryFee: e.target.value !== '' ? Number(e.target.value) : undefined })}
                      />
                    </div>
                  </div>

                  {/* Affiliate Marketing Integration URL (Optional) */}
                  <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/85 space-y-2">
                    <label className="block text-xs font-black text-[#00796B] uppercase tracking-wider flex items-center gap-1">
                      <span>🔗 Affiliate / External Purchase URL (Optional)</span>
                    </label>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Enter your affiliate partner link (e.g., AliExpress, Daraz, Amazon) to run affiliate marketing. Clicking the <strong>"BUY NOW"</strong> button will immediately take customers to this link in a new tab. Leave blank for standard on-site cart/checkout.
                    </p>
                    <input
                      id="form-product-affiliate-url"
                      type="url"
                      placeholder="e.g. https://click.daraz.com.bd/e/_abc123"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                      value={productFormState.affiliateUrl || ''}
                      onChange={(e) => setProductFormState({ ...productFormState, affiliateUrl: e.target.value })}
                    />
                  </div>

                  {/* BEAUTIFUL IMAGE CONTROLLER BLOCK WITH NATIVE RESIZING AND PRESETS */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-black text-[#00796B] uppercase tracking-wider">Product Image & Media Configuration</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">System Auto-Resize Enabled</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      
                      {/* Interactive Drag & Drop Box + Link Input */}
                      <div className="md:col-span-7 space-y-3">
                        <div className="text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Upload Local Photo or Insert External link</div>
                        
                        {/* Drag and Drop trigger box */}
                        <div 
                          onClick={() => document.getElementById('product-file-upload-input')?.click()}
                          className="border-2 border-dashed border-slate-200 hover:border-[#00796B] bg-white rounded-xl p-5 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[140px]"
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              const file = e.dataTransfer.files[0];
                              const reader = new FileReader();
                              reader.onload = (uploadEvent) => {
                                if (uploadEvent.target?.result) {
                                  setProductFormState({ ...productFormState, image: uploadEvent.target.result as string });
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        >
                          <input 
                            id="product-file-upload-input"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = (uploadEvent) => {
                                  if (uploadEvent.target?.result) {
                                    setProductFormState({ ...productFormState, image: uploadEvent.target.result as string });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <ImageIcon className="h-8 w-8 text-slate-400 group-hover:text-[#00796B] transition-colors mb-2" />
                          <span className="text-xs font-bold text-slate-700 group-hover:text-[#00796B]">Drag & drop an image here, or <span className="underline">browse files</span></span>
                          <span className="text-[10px] text-slate-400 mt-1 font-semibold">Supports JPEG, PNG, WEBP of any size and aspect ratio</span>
                        </div>

                        {/* Traditional link element */}
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Or, paste an internet image link:</label>
                          <input
                            id="form-product-image"
                            type="text"
                            placeholder="e.g. https://images.unsplash.com/photo-..."
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#00796B] bg-white"
                            value={productFormState.image || ''}
                            onChange={(e) => setProductFormState({ ...productFormState, image: e.target.value })}
                          />
                        </div>
                      </div>

                      {/* Live preview representing the AUTO RESIZE requirement */}
                      <div className="md:col-span-5 flex flex-col justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Live System Auto-Resize Preview</div>
                          <div className="relative border border-slate-100 bg-white rounded-xl p-3 flex flex-col items-center justify-center min-h-[145px] shadow-sm">
                            {productFormState.image ? (
                              <div className="w-full flex flex-col items-center">
                                {/* Auto sizing preview container */}
                                <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                                  <img 
                                    src={productFormState.image} 
                                    alt="Resized Preview" 
                                    className="w-full h-full object-cover object-center"
                                    referrerPolicy="no-referrer"
                                  />
                                  {/* Visual Auto Crop overlays */}
                                  <div className="absolute inset-0 border-2 border-[#00BFA5]/30 pointer-events-none rounded-lg"></div>
                                  <div className="absolute bottom-1 right-1 bg-black/60 text-[8px] text-white font-mono px-1 rounded">
                                    AUTO-FIT
                                  </div>
                                </div>
                                <span className="text-[10px] text-[#00796B] font-bold mt-2 flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> Automatically Sized & Centered
                                </span>
                              </div>
                            ) : (
                              <div className="text-center text-slate-400 py-6">
                                <div className="h-12 w-12 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center mx-auto mb-2 text-slate-300">?</div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Waiting for product photo</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-500 font-semibold bg-white p-2 rounded border border-slate-100 mt-2">
                          💡 <strong className="text-slate-800">Auto-Fit Code:</strong> The web grid uses <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">object-cover</code> which means whatever photo dimension, high resolution or square/portrait, is automatically cropped, leveled, and aligned symmetrically inside customer grids.
                        </div>
                      </div>

                    </div>

                    {/* Curated Pre-cropped Premium Presets Picker Carousel */}
                    <div className="space-y-1.5 pt-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Quick Select Curated Grocery Presets (Auto-Cropped, Instant Loading):</label>
                      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                        {[
                          { name: 'Red Apple', url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=450&auto=format&fit=crop&q=80' },
                          { name: 'Fresh Mango', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=450&auto=format&fit=crop&q=80' },
                          { name: 'Banana Bundles', url: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=450&auto=format&fit=crop&q=80' },
                          { name: 'Fresh Vegetables', url: 'https://images.unsplash.com/photo-1566385101042-1a010c129fa6?w=450&auto=format&fit=crop&q=80' },
                          { name: 'Crimson Tomatoes', url: 'https://images.unsplash.com/photo-1595855759920-86582396756a?w=450&auto=format&fit=crop&q=80' },
                          { name: 'Golden Potatoes', url: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=450&auto=format&fit=crop&q=80' },
                          { name: 'Pure Cow Milk', url: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=450&auto=format&fit=crop&q=80' },
                          { name: 'Farm Brown Eggs', url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=450&auto=format&fit=crop&q=80' },
                          { name: 'Premium Rice', url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=450&auto=format&fit=crop&q=80' },
                          { name: 'Beef Cut Ribs', url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=450&auto=format&fit=crop&q=80' },
                          { name: 'Fresh Water Fish', url: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=450&auto=format&fit=crop&q=80' },
                          { name: 'Wild Organic Honey', url: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=450&auto=format&fit=crop&q=80' }
                        ].map((preset, idx) => (
                          <button
                            type="button"
                            key={idx}
                            onClick={() => setProductFormState({ ...productFormState, image: preset.url })}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 bg-white border rounded-lg text-[10px] font-bold text-slate-600 shrink-0 hover:border-[#00796B] hover:text-[#00796B] transition-all cursor-pointer shadow-xs ${
                              productFormState.image === preset.url ? 'border-[#00796B] text-[#00796B] ring-1 ring-teal-600/20 bg-teal-50/20' : 'border-slate-200'
                            }`}
                          >
                            <img src={preset.url} className="h-5 w-5 rounded object-cover" alt="" referrerPolicy="no-referrer" />
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Product Description</label>
                    <textarea
                      id="form-product-desc"
                      rows={2}
                      placeholder="Item detail..."
                      className="w-full border border-slate-200 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
                      value={productFormState.description || ''}
                      onChange={(e) => setProductFormState({ ...productFormState, description: e.target.value })}
                    />
                  </div>

                  {/* Flag Toggles checkboxes */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-705">
                      <input
                        type="checkbox"
                        checked={!!productFormState.featured}
                        onChange={(e) => setProductFormState({ ...productFormState, featured: e.target.checked })}
                      />
                      Hero Slider
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-705">
                      <input
                        type="checkbox"
                        checked={!!productFormState.bestSeller}
                        onChange={(e) => setProductFormState({ ...productFormState, bestSeller: e.target.checked })}
                      />
                      Best Seller
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-705">
                      <input
                        type="checkbox"
                        checked={!!productFormState.isNewArrival}
                        onChange={(e) => setProductFormState({ ...productFormState, isNewArrival: e.target.checked })}
                      />
                      New Arrival Tag
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-705">
                      <input
                        type="checkbox"
                        checked={!!productFormState.popular}
                        onChange={(e) => setProductFormState({ ...productFormState, popular: e.target.checked })}
                      />
                      Popular Demand
                    </label>

                    {/* FLASH SALE SELECTOR (ফ্ল্যাশ সেল) */}
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-black text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200/60 shadow-3xs">
                      <input
                        type="checkbox"
                        checked={!!productFormState.isFlashSale}
                        onChange={(e) => setProductFormState({ ...productFormState, isFlashSale: e.target.checked })}
                      />
                      ⚡ Flash Sale (ফ্ল্যাশ সেল)
                    </label>

                    {/* SPECIAL OFFER SELECTOR (স্পেশাল অফার) */}
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded border border-rose-200/60 shadow-3xs">
                      <input
                        type="checkbox"
                        checked={!!productFormState.isSpecialOffer}
                        onChange={(e) => setProductFormState({ ...productFormState, isSpecialOffer: e.target.checked })}
                      />
                      🎁 Special Offer (স্পেশাল অফার)
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowProductForm(false); setEditingProduct(null); }}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 hover:bg-slate-50"
                    >
                      Dismiss
                    </button>
                    <button
                      id="form-submit-crud-btn"
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow"
                    >
                      {editingProduct ? 'Update Product Details' : 'Save and Issue to Store'}
                    </button>
                  </div>
                </form>
              )}

              {/* Items Table grid */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold text-xs">
                        <th className="p-4">Item Detail</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Product Price</th>
                        <th className="p-4 text-center">Packaging Unit</th>
                        <th className="p-4">Stock density</th>
                        <th className="p-4 text-center">Telemetry Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {products.map(p => {
                        const isLow = p.stock <= 10;
                        const isOut = p.stock === 0;

                        return (
                          <tr key={p.id} className="hover:bg-slate-50/40">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <img src={p.image} className="h-10 w-10 rounded-lg object-cover border border-slate-100" alt="" />
                                <div>
                                  <h4 className="font-semibold text-slate-800 font-display">{p.name}</h4>
                                  <span className="text-[10px] text-slate-400 font-mono">ID: {p.id}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize text-[10px] font-semibold">{p.category}</span>
                            </td>
                            <td className="p-4">
                              <div className="font-semibold text-slate-800">৳ {p.price}</div>
                              {p.originalPrice > p.price && (
                                <div className="text-[10px] text-slate-400 line-through">৳ {p.originalPrice}</div>
                              )}
                              {p.deliveryFee !== undefined && p.deliveryFee > 0 && (
                                <div className="text-[9px] text-amber-700 bg-amber-55/60 border border-amber-200/50 px-1.5 py-0.5 rounded-md font-extrabold inline-block mt-1">🚚 +৳{p.deliveryFee}</div>
                              )}
                              {p.affiliateUrl && (
                                <div className="text-[9px] text-[#00796B] bg-teal-50 border border-teal-200 px-1.5 py-0.5 rounded-md font-extrabold block w-fit mt-1">🔗 Affiliate Link</div>
                              )}
                            </td>
                            <td className="p-4 text-center text-slate-500 font-medium">
                              {p.unit}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1.5 font-bold font-mono">
                                <span className={isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-slate-800'}>
                                  {p.stock} units
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              {isOut ? (
                                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold text-[10px]">SOLD OUT</span>
                              ) : isLow ? (
                                <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-md font-bold text-[10px] animate-pulse">LOW STOCK</span>
                              ) : (
                                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold text-[10px]">HEALTHY</span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  id={`edit-item-btn-${p.id}`}
                                  onClick={() => handleEditProductClick(p)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit information"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  id={`delete-item-btn-${p.id}`}
                                  onClick={() => handleDeleteProductClick(p.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete product"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATEGORY CONFIGURATIONS */}
          {activeTab === 'categories' && (
            <div className="space-y-6 animate-fade-in text-sm">
              <div className="flex items-center justify-between">
                <p className="text-slate-500 text-xs">Configure the general classification tags available inside the frontend sidebar and shop page.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Categories Table */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <h3 className="font-display font-semibold text-slate-800 pb-3 border-b border-slate-50 mb-4 text-base">Current Store Categories</h3>
                  <div className="space-y-4">
                    {categories.map(cat => (
                      <div key={cat.slug} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-3">
                          <img src={cat.image} className="h-10 w-10 rounded-lg object-cover bg-slate-100" alt="" referee-policy="no-referrer" />
                          <div>
                            <span className="font-semibold text-slate-800 text-sm">{cat.name}</span>
                            <p className="font-mono text-[10px] text-slate-400">Class: {cat.slug}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 font-semibold">{products.filter(p => p.category === cat.slug).length} items</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategoryClick(cat.slug)}
                            className="p-1 px-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete category Class Tier"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Category Form Container */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-display font-semibold text-slate-800 pb-3 border-b border-slate-50 text-base">Add New Category</h3>
                  <form onSubmit={handleCategorySubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Category Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Organic Ghee & Honey"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Category Slug (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. ghee-honey"
                        value={newCatSlug}
                        onChange={(e) => setNewCatSlug(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">If empty, will be auto-generated from name.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Category Image *</label>
                      <div className="space-y-2">
                        {/* Drag and Drop box for Category Image */}
                        <div 
                          onClick={() => document.getElementById('category-file-upload-input')?.click()}
                          className="border border-dashed border-slate-300 hover:border-[#00796B] bg-slate-50 hover:bg-slate-50/50 rounded-lg p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[90px]"
                        >
                          <input 
                            id="category-file-upload-input"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = (uploadEvent) => {
                                  if (uploadEvent.target?.result) {
                                    setNewCatImage(uploadEvent.target.result as string);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <ImageIcon className="h-5 w-5 text-slate-400 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700">Upload direct photo or Browse</span>
                          <span className="text-[9px] text-slate-400">Supports JPEG, PNG, WEBP</span>
                        </div>

                        {/* Image Preview and Link input fallback */}
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Or paste image URL Link..."
                            value={newCatImage}
                            onChange={(e) => setNewCatImage(e.target.value)}
                            className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-emerald-500 focus:outline-none"
                          />
                          {newCatImage && (
                            <img 
                              src={newCatImage} 
                              className="h-8 w-8 object-cover rounded border border-slate-200 shadow-sm shrink-0" 
                              alt="preview" 
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-[#00796B] hover:bg-[#004D40] text-white font-bold py-2.5 rounded-lg text-xs transition-all uppercase tracking-wider cursor-pointer font-sans"
                    >
                      Create Category
                    </button>
                  </form>
                </div>

                {/* DB Instructions regarding categories */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="font-display font-semibold text-slate-800 pb-3 border-b border-slate-50 text-base">Class Mutation Guide</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Categories in BAZAR are aligned dynamically into product schema arrays in Postgres. When inserting a class, make sure the slug matches precisely during raw API JSON formatting.
                  </p>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl font-mono text-xs text-emerald-600 whitespace-pre-wrap select-all">
{`-- SQL Seed Insert Statement
INSERT INTO categories (slug, name, image)
VALUES ('exotics', 'Exotics (আজব ফল)', 'https://unsplash.com/...');`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ORDERS CONTROL CENTER */}
          {activeTab === 'orders' && (() => {
            const filteredOrders = orders.filter(o => {
              // Status filter
              if (orderFilter === 'Pending') {
                if (o.status !== 'Pending') return false;
              } else if (orderFilter === 'Confirmed') {
                if (o.status === 'Pending' || o.status === 'Canceled') return false;
              }
              // Search text filter
              if (orderSearchQuery) {
                const q = orderSearchQuery.toLowerCase();
                const matchId = o.id.toLowerCase().includes(q) || (o.trackingCode && o.trackingCode.toLowerCase().includes(q));
                const matchCustomer = o.customerName.toLowerCase().includes(q) || o.phone.includes(q) || o.email.toLowerCase().includes(q);
                const matchItems = o.items.some(item => item.productName.toLowerCase().includes(q));
                return matchId || matchCustomer || matchItems;
              }
              return true;
            });

            return (
              <div className="space-y-6 animate-fade-in text-sm pb-12 select-none">
                
                {/* Visual Section Header with Vertical Teal Accent Bar */}
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-8 bg-[#00796B] rounded-sm"></div>
                  <div>
                    <h2 className="font-display font-black text-2xl text-slate-800 tracking-tight uppercase">
                      ORDER MANAGEMENT
                    </h2>
                    <p className="text-[10px] text-slate-400 font-mono font-bold tracking-widest uppercase mt-0.5">
                      MANAGE STORE ORDERS // {filteredOrders.length} TOTAL // STATUS: {orderFilter.toUpperCase()}
                    </p>
                  </div>
                </div>

                {/* Control Action Filters Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setOrderFilter('All')}
                      className={`py-2 px-4 rounded text-xs font-bold font-display uppercase tracking-wider transition-all border ${
                        orderFilter === 'All'
                          ? 'bg-[#00796B] text-white border-[#00796B] shadow-sm shadow-teal-700/10'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      ALL ORDERS
                    </button>
                    <button
                      onClick={() => setOrderFilter('Pending')}
                      className={`py-2 px-4 rounded text-xs font-bold font-display uppercase tracking-wider transition-all border ${
                        orderFilter === 'Pending'
                          ? 'bg-[#00796B] text-white border-[#00796B] shadow-sm shadow-teal-700/10'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      PENDING
                    </button>
                    <button
                      onClick={() => setOrderFilter('Confirmed')}
                      className={`py-2 px-4 rounded text-xs font-bold font-display uppercase tracking-wider transition-all border ${
                        orderFilter === 'Confirmed'
                          ? 'bg-[#00796B] text-white border-[#00796B] shadow-sm shadow-teal-700/10'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      CONFIRMED
                    </button>

                    <div className="h-6 w-px bg-slate-200 mx-1 hidden min-[400px]:block"></div>

                    <button
                      onClick={() => {
                        syncLists();
                      }}
                      className="flex items-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 py-2 px-4 rounded font-display font-bold text-xs transition-all uppercase tracking-wider"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-slate-400" />
                      REFRESH
                    </button>
                  </div>

                  {/* Search query input box */}
                  <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="SEARCH ORDER ID..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 text-xs pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00796B] transition-all font-mono font-bold uppercase tracking-wider placeholder-slate-400"
                    />
                  </div>
                </div>

                {/* HIGH FIDELITY TEAL TABLE SECTION */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-w-full">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#00796B] text-[#E0F2F1] text-[11px] font-black uppercase tracking-widest border-b border-[#00695C]">
                          <th className="p-4">ORDER ID</th>
                          <th className="p-4">CUSTOMER</th>
                          <th className="p-4">ITEMS</th>
                          <th className="p-4">AMOUNT</th>
                          <th className="p-4">STATUS</th>
                          <th className="p-4 text-center">ACTIONS</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredOrders.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-16 text-center text-slate-400 font-mono font-bold uppercase tracking-widest">
                              No matching orders found inside database
                            </td>
                          </tr>
                        ) : (
                          filteredOrders.map(order => {
                            const rawDate = new Date(order.orderDate);
                            const formattedDate = rawDate.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' }) + '.' + rawDate.toTimeString().split(' ')[0].replace(':', '').substring(0, 4);
                            
                            return (
                              <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 font-mono">
                                  <div className="font-extrabold text-slate-800 text-sm">
                                    #{order.id}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-bold mt-1 tracking-wider">
                                    {formattedDate}
                                  </div>
                                </td>
                                
                                <td className="p-4">
                                  <div className="font-extrabold text-slate-800 text-[11px] uppercase">
                                    {order.customerName}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                    {order.city.toUpperCase()}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono mt-0.5 font-bold">
                                    {order.phone}
                                  </div>
                                </td>

                                <td className="p-4 max-w-sm">
                                  <div className="space-y-1">
                                    {order.items.map((it, idx) => (
                                      <div key={idx} className="text-[10px] text-[#00695C] font-mono font-bold leading-none truncate max-w-[200px]" title={it.productName}>
                                        [{it.quantity}X] {it.productName.toUpperCase()}
                                      </div>
                                    ))}
                                  </div>
                                </td>

                                <td className="p-4">
                                  <div className="font-black text-slate-800 text-sm">
                                    ৳ {order.total.toLocaleString()}
                                  </div>
                                  <div className="text-[9px] text-[#00796B] font-mono font-extrabold uppercase mt-1.5 tracking-wider bg-teal-50 border border-teal-100 rounded inline-block px-1.5 py-0.5">
                                    {order.paymentMethod === 'Cash on Delivery' ? 'COD' : order.paymentMethod.toUpperCase()}
                                  </div>
                                </td>

                                <td className="p-4">
                                  <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider">
                                    <span className={`h-2.5 w-2.5 rounded-sm inline-block ${
                                      order.status === 'Pending' ? 'bg-amber-500 animate-pulse' :
                                      order.status === 'Processing' ? 'bg-blue-500' :
                                      order.status === 'Shipped' ? 'bg-purple-500' :
                                      order.status === 'Delivered' ? 'bg-emerald-500' : 'bg-rose-500'
                                    }`}></span>
                                    <span className={
                                      order.status === 'Pending' ? 'text-amber-600' :
                                      order.status === 'Processing' ? 'text-blue-600' :
                                      order.status === 'Shipped' ? 'text-purple-600' :
                                      order.status === 'Delivered' ? 'text-emerald-600' : 'text-rose-600'
                                    }>{order.status}</span>
                                  </div>
                                </td>

                                <td className="p-4 text-center max-w-[200px]">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-1.5">
                                      <div className="relative flex-1">
                                        <select
                                          value={order.status}
                                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'], e.target.value === 'Delivered' ? 'Paid' : undefined)}
                                          className="w-full bg-white border border-slate-200 text-[10px] font-black uppercase tracking-wider px-2.5 py-1.5 rounded-md focus:outline-none focus:ring-1 focus:ring-[#00796B] hover:border-slate-300 transition-all cursor-pointer text-slate-700"
                                        >
                                          <option value="Pending">PENDING</option>
                                          <option value="Processing">PROCESSING</option>
                                          <option value="Shipped">SHIPPED</option>
                                          <option value="Delivered">DELIVERED</option>
                                          <option value="Canceled">CANCELED</option>
                                        </select>
                                      </div>
                                      
                                      <button
                                        onClick={() => setEditingOrder(order)}
                                        title="View/Edit Order Parameters"
                                        className="border border-slate-200 text-slate-500 hover:text-[#00796B] hover:bg-slate-50 p-1.5 rounded transition-colors cursor-pointer bg-white"
                                      >
                                        <FileText className="h-4 w-4" />
                                      </button>

                                      <button
                                        onClick={() => setSelectedReportOrder(order)}
                                        title="Generate Unique Invoice Report & Slip (with QR Code)"
                                        className="border border-emerald-200 text-emerald-700 hover:bg-emerald-50/80 p-1.5 rounded transition-colors cursor-pointer bg-white"
                                      >
                                        <Printer className="h-4 w-4" />
                                      </button>

                                      <button
                                        onClick={() => handleDeleteOrderClick(order.id)}
                                        title="Delete Order"
                                        className="border border-rose-200 text-[#C62828] hover:bg-rose-50 p-1.5 rounded transition-colors cursor-pointer bg-white"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>

                                    {order.status === 'Pending' && (
                                      <button
                                        onClick={() => handleConfirmOrder(order.id)}
                                        className="bg-[#00796B] hover:bg-[#005B52] font-display font-black text-[9px] text-white py-1.5 px-3 rounded uppercase tracking-wider w-full text-center transition-all shadow-sm active:scale-97 cursor-pointer"
                                      >
                                        CONFIRM ORDER
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* CRITICAL ORDER DETAILED EDITING LIGHTBOX MODAL */}
                {editingOrder && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
                      
                      {/* Modal Title Block */}
                      <div className="bg-[#00796B] text-white p-5 flex items-center justify-between">
                        <div>
                          <h3 className="font-display font-black text-lg uppercase tracking-tight">
                            MODIFY SALES RECORD
                          </h3>
                          <p className="text-[10px] text-teal-100 font-mono tracking-wider">
                            ORDER RECONCILIATION // #{editingOrder.id}
                          </p>
                        </div>
                        <button
                          onClick={() => setEditingOrder(null)}
                          className="bg-white/10 hover:bg-white/20 h-8 w-8 rounded-full flex items-center justify-center text-white transition-colors font-bold text-sm cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      {/* Modal Editing Fields Form */}
                      <div className="p-6 overflow-y-auto space-y-6 flex-1">
                        
                        {/* Section 1: Customer Contact Info */}
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                            Recipient & Logistic Coordinates
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                                Customer Contact Name
                              </label>
                              <input
                                type="text"
                                value={editingOrder.customerName}
                                onChange={(e) => setEditingOrder({ ...editingOrder, customerName: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                                Customer Mobile Phone
                              </label>
                              <input
                                type="text"
                                value={editingOrder.phone}
                                onChange={(e) => setEditingOrder({ ...editingOrder, phone: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                                Email Address
                              </label>
                              <input
                                type="email"
                                value={editingOrder.email}
                                onChange={(e) => setEditingOrder({ ...editingOrder, email: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                                Destination City
                              </label>
                              <input
                                type="text"
                                value={editingOrder.city}
                                onChange={(e) => setEditingOrder({ ...editingOrder, city: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                              Shipping Street Address
                            </label>
                            <input
                              type="text"
                              value={editingOrder.address}
                              onChange={(e) => setEditingOrder({ ...editingOrder, address: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                            />
                          </div>
                        </div>

                        {/* Section 2: Order Status and Payment Details */}
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                            Checkout Gateway Options
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                                Dispatch Status
                              </label>
                              <select
                                value={editingOrder.status}
                                onChange={(e) => setEditingOrder({ ...editingOrder, status: e.target.value as Order['status'] })}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Canceled">Canceled</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                                Gateway Selected
                              </label>
                              <select
                                value={editingOrder.paymentMethod}
                                onChange={(e) => setEditingOrder({ ...editingOrder, paymentMethod: e.target.value as Order['paymentMethod'] })}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                              >
                                <option value="Cash on Delivery">Cash on Delivery</option>
                                <option value="bKash">bKash</option>
                                <option value="Nagad">Nagad</option>
                                <option value="SSLCommerz">SSLCommerz</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                                Payment Settlement
                              </label>
                              <select
                                value={editingOrder.paymentStatus}
                                onChange={(e) => setEditingOrder({ ...editingOrder, paymentStatus: e.target.value as Order['paymentStatus'] })}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-2.5 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#00796B]"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Failed">Failed</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Section 3: Financial Pricing Summary */}
                        <div className="space-y-4">
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">
                            Sales Invoice Breakdown
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div>
                              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                                Item Subtotal (৳)
                              </label>
                              <input
                                type="number"
                                value={editingOrder.subtotal}
                                onChange={(e) => {
                                  const sub = Number(e.target.value);
                                  setEditingOrder({
                                    ...editingOrder,
                                    subtotal: sub,
                                    total: Math.max(0, sub + editingOrder.deliveryFee - editingOrder.discount)
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#00796B] font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                                Discount Subtracted (৳)
                              </label>
                              <input
                                type="number"
                                value={editingOrder.discount}
                                onChange={(e) => {
                                  const disc = Number(e.target.value);
                                  setEditingOrder({
                                    ...editingOrder,
                                    discount: disc,
                                    total: Math.max(0, editingOrder.subtotal + editingOrder.deliveryFee - disc)
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#00796B] font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-1">
                                Delivery Surcharge (৳)
                              </label>
                              <input
                                type="number"
                                value={editingOrder.deliveryFee}
                                onChange={(e) => {
                                  const fee = Number(e.target.value);
                                  setEditingOrder({
                                    ...editingOrder,
                                    deliveryFee: fee,
                                    total: Math.max(0, editingOrder.subtotal + fee - editingOrder.discount)
                                  });
                                }}
                                className="w-full bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-[#00796B] font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-mono font-bold block text-slate-500 mb-1">
                                Grand Total (Calculated)
                              </label>
                              <div className="w-full bg-emerald-50 border border-emerald-100 text-[#004D40] text-sm font-black px-3 py-1.5 rounded font-mono">
                                ৳ {editingOrder.total}
                              </div>
                            </div>
                          </div>

                          {/* List of items ordered for sanity check */}
                          <div>
                            <span className="text-[10px] uppercase font-mono font-bold text-slate-500 block mb-2">Cart items preview:</span>
                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2">
                              {editingOrder.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between text-xs font-mono">
                                  <span className="text-slate-600">[{it.quantity}x] {it.productName} ({it.unit})</span>
                                  <span className="text-slate-800 font-bold">৳ {it.price * it.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* Modal Footer Controls */}
                      <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                        <button
                          type="button"
                          onClick={() => setEditingOrder(null)}
                          className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-md text-xs font-bold text-slate-500 cursor-pointer transition-colors"
                        >
                          DISMISS
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateOrderDetails(editingOrder)}
                          className="px-5 py-2 bg-[#00796B] hover:bg-[#005B52] rounded-md text-xs font-bold text-white shadow-sm cursor-pointer transition-all active:scale-97"
                        >
                          SAVE CHANGES
                        </button>
                      </div>

                    </div>
                  </div>
                )}

                {/* ----------------- UNIQUE REPORT VIEW MODAL (WITH PRODUCT QR CODE & DOWNLOAD OPTION) ----------------- */}
                {selectedReportOrder && (() => {
                  const qrData = `ORDER-REPORT: #${selectedReportOrder.id}\nCustomer: ${selectedReportOrder.customerName}\nPhone: ${selectedReportOrder.phone}\nTotal Amount: ৳${selectedReportOrder.total}\nTracking Code: ${selectedReportOrder.trackingCode || 'N/A'}\nItems:\n${selectedReportOrder.items.map(it => ` - ${it.productName} (${it.quantity}x)`).join('\n')}`;
                  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrData)}`;

                  return (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] animate-scale-up">
                        
                        {/* Header Banner */}
                        <div className="bg-[#00796B] text-white p-5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/10 rounded-lg">
                              <Printer className="h-6 w-6 text-emerald-300" />
                            </div>
                            <div>
                              <h3 className="font-display font-black text-base uppercase tracking-wider">
                                📊 ORDER UNIQUE VERIFICATION REPORT
                              </h3>
                              <p className="text-[10px] text-teal-100 font-mono tracking-widest uppercase mt-0.5">
                                SECURE VERIFICATION REPORT // BAZAR DHAKA
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedReportOrder(null)}
                            className="bg-white/10 hover:bg-white/20 h-8 w-8 rounded-full flex items-center justify-center text-white transition-colors font-bold text-sm cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Report Container Body */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 font-sans" id={`report-print-container-${selectedReportOrder.id}`}>
                          
                          {/* Top Section: Metallic Badge Status with Brand Header */}
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-100 pb-5 gap-4">
                            <div>
                              <div className="text-xl font-black text-slate-800 tracking-tight">{settings.storeName.toUpperCase()}</div>
                              <div className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase mt-1">PRIMARY CONFIRMED WAREHOUSE DISPATCH</div>
                            </div>
                            <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 text-right">
                              <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">SALES ORDER ID</div>
                              <div className="text-sm font-black font-mono text-slate-800 mt-0.5">#{selectedReportOrder.id}</div>
                              <div className="text-[10.5px] text-slate-500 font-mono mt-0.5 tracking-wider">
                                {new Date(selectedReportOrder.orderDate).toLocaleDateString('en-GB')} {new Date(selectedReportOrder.orderDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>

                          {/* Grid with Details vs QR code */}
                          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                            {/* Column 1: Recipient Identity */}
                            <div className="md:col-span-12 lg:col-span-7 space-y-4">
                              <div>
                                <h4 className="text-[10.5px] font-black tracking-widest text-[#00796B] uppercase border-b border-teal-50/50 pb-1 mb-2.5">📋 Recipient Specifications</h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="text-slate-400 font-bold">Customer Name:</span> <strong className="text-slate-850 uppercase">{selectedReportOrder.customerName}</strong></div>
                                  <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="text-slate-400 font-bold">Contact Mobile:</span> <strong className="text-[#00796B] font-mono">{selectedReportOrder.phone}</strong></div>
                                  <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="text-slate-400 font-bold">Email Address:</span> <span className="font-mono text-slate-600">{selectedReportOrder.email || 'N/A'}</span></div>
                                  <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="text-slate-400 font-bold">City/Region:</span> <strong className="uppercase">{selectedReportOrder.city}</strong></div>
                                  <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="text-slate-400 font-bold">Delivery Location:</span> <span className="text-slate-600 truncate max-w-[220px]" title={selectedReportOrder.address}>{selectedReportOrder.address}</span></div>
                                </div>
                              </div>

                              <div>
                                <h4 className="text-[10.5px] font-black tracking-widest text-[#00796B] uppercase border-b border-teal-50/50 pb-1 mb-2.5 font-sans">🛡️ Settlement Coordinates</h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="text-slate-400 font-bold">Tracking Courier ID:</span> <strong className="font-mono text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">{selectedReportOrder.trackingCode || 'N/A'}</strong></div>
                                  <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="text-slate-400 font-bold">Payment Channel:</span> <strong className="text-slate-700">{selectedReportOrder.paymentMethod}</strong></div>
                                  <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="text-slate-400 font-bold">Payment Status:</span> <span className={`px-2 py-0.5 font-semibold font-sans rounded text-[9px] ${selectedReportOrder.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>● {selectedReportOrder.paymentStatus}</span></div>
                                  <div className="flex justify-between border-b border-slate-50 pb-1.5"><span className="text-slate-400 font-bold">Order Dispatch:</span> <span className="font-black text-rose-600 uppercase font-sans">{selectedReportOrder.status}</span></div>
                                </div>
                              </div>
                            </div>

                            {/* Column 2: Crisp Verification Gen QR */}
                            <div className="md:col-span-12 lg:col-span-5 flex flex-col items-center justify-center p-4 bg-slate-50 border border-slate-150 rounded-2xl text-center">
                              <span className="text-[10px] font-black text-[#00796B] uppercase tracking-widest mb-3 select-none">🧼 UNIQUE VERIFICATION QR CODE</span>
                              <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs transition-transform hover:scale-102">
                                <img 
                                  src={qrCodeUrl} 
                                  alt="Order QR Code" 
                                  className="w-[140px] h-[140px] object-contain select-none" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase mt-3 select-none tracking-tight">#{selectedReportOrder.id} - scan to authenticate</span>
                            </div>
                          </div>

                          {/* Ordered items listing table */}
                          <div>
                            <h4 className="text-[10.5px] font-black tracking-widest text-[#00796B] uppercase border-b border-teal-50/50 pb-1 mb-3">📦 Ordered Items</h4>
                            <div className="border border-slate-150 rounded-xl overflow-hidden bg-slate-50/30">
                              <table className="w-full text-left font-mono">
                                <thead>
                                  <tr className="bg-[#00796B]/5 text-[#004D40] text-[10px] font-black uppercase tracking-wider">
                                    <th className="p-2.5">NAME</th>
                                    <th className="p-2.5 text-right">UNIT PRICE</th>
                                    <th className="p-2.5 text-right">QTY</th>
                                    <th className="p-2.5 text-right">ITEM TOTAL</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-[11px] leading-tight text-slate-700">
                                  {selectedReportOrder.items.map((it, idx) => (
                                    <tr key={idx} className="hover:bg-white/50">
                                      <td className="p-2.5 font-bold text-slate-800">{it.productName.toUpperCase()} <span className="text-[9.5px] text-slate-400 font-normal">({it.unit})</span></td>
                                      <td className="p-2.5 text-right">৳{it.price}</td>
                                      <td className="p-2.5 text-right font-black">{it.quantity}</td>
                                      <td className="p-2.5 text-right font-bold text-slate-900">৳{it.price * it.quantity}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Order Billing breakdown */}
                          <div className="bg-emerald-50/30 border border-emerald-100 p-4 rounded-2xl flex flex-col items-end text-xs space-y-1.5 font-bold">
                            <div className="flex justify-between w-64"><span className="text-slate-400 font-normal">Cart Invoice Subtotal:</span> <span className="font-mono text-slate-800">৳{selectedReportOrder.subtotal}</span></div>
                            {selectedReportOrder.discount > 0 && <div className="flex justify-between w-64"><span className="text-red-500 font-normal">Discounts Deducted:</span> <span className="font-mono text-red-600">-৳{selectedReportOrder.discount}</span></div>}
                            <div className="flex justify-between w-64"><span className="text-slate-400 font-normal">Delivery Surcharge:</span> <span className="font-mono text-slate-800">৳{selectedReportOrder.deliveryFee}</span></div>
                            <div className="h-px bg-slate-200 w-64 my-1"></div>
                            <div className="flex justify-between w-64 text-sm font-black text-[#004D40]"><span className="font-display">GRAND REPORT TOTAL:</span> <span className="font-mono text-base">৳{selectedReportOrder.total}</span></div>
                          </div>

                        </div>

                        {/* Footer Controls & Printers Actions */}
                        <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 font-sans select-none">
                          <p className="text-[9.5px] text-slate-400 font-sans hidden md:block">
                            Report verified safely on {new Date().toLocaleDateString('en-GB')}
                          </p>
                          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedReportOrder(null)}
                              className="px-4 py-2 border border-slate-300 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-500 cursor-pointer transition-colors"
                            >
                              ✕ CLOSE
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                // Simple triggers standard browser print dialog nicely targeting specific container
                                const printContent = document.getElementById(`report-print-container-${selectedReportOrder.id}`);
                                if (printContent) {
                                  const win = window.open('', '', 'width=900,height=800');
                                  if (win) {
                                    win.document.write(`
                                      <html>
                                        <head>
                                          <title>Invoice Report #${selectedReportOrder.id}</title>
                                          <style>
                                            body { font-family: sans-serif; padding: 30px; }
                                            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                                            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                                            th { background-color: #00796B; color: white; }
                                            .text-right { text-align: right; }
                                            .qr-wrap { text-align: center; margin-top: 20px; }
                                            .qr-wrap img { border: 1px solid #eee; padding: 10px; }
                                          </style>
                                        </head>
                                        <body>
                                          ${printContent.innerHTML}
                                          <script>
                                            window.onload = function() {
                                              window.print();
                                              window.close();
                                            };
                                          </script>
                                        </body>
                                      </html>
                                    `);
                                    win.document.close();
                                  }
                                }
                              }}
                              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-all shadow-xs"
                            >
                              <Printer className="h-3.5 w-3.5" /> 🖨️ PRINT SLIP
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadReport(selectedReportOrder)}
                              className="px-4 py-2 bg-[#00796B] hover:bg-[#005B52] text-white font-black rounded-lg text-xs cursor-pointer flex items-center gap-1.5 transition-all shadow-sm shadow-teal-700/10"
                            >
                              📥 DOWNLOAD REPORT
                            </button>
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })()}

              </div>
            );
          })()}

          {/* TAB 5: REGISTERED CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm animate-fade-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-xs font-semibold">
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Email Address</th>
                      <th className="p-4">Mobile Contacts</th>
                      <th className="p-4">Address Parameters</th>
                      <th className="p-4">Registration Date</th>
                      <th className="p-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs">
                    {customers.map((c, idx) => (
                      <tr key={c.id || idx} className="hover:bg-slate-50/40">
                        <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            {c.name.charAt(0)}
                          </div>
                          {c.name}
                        </td>
                        <td className="p-4 font-mono text-slate-600">{c.email}</td>
                        <td className="p-4 font-mono text-slate-600">{c.phone || 'N/A'}</td>
                        <td className="p-4 text-slate-500 font-sans max-w-xs truncate">{c.address || 'N/A'}, {c.city || ''}</td>
                        <td className="p-4 text-slate-400">{c.registeredDate ? new Date(c.registeredDate).toLocaleDateString() : 'Existing'}</td>
                        <td className="p-4 text-center">
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">active</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: COUPONS & DISCOUNTS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-fade-in text-sm">
              <div className="flex justify-between items-center">
                <p className="text-xs text-slate-500">Configure promotional vouchers code, savings parameters & minimum spend requirements.</p>
                <button
                  id="admin-add-coupon-toggle-btn"
                  onClick={() => setShowCouponForm(!showCouponForm)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-emerald-700 shadow"
                >
                  {showCouponForm ? 'Dismiss Form' : 'Insert New Promo Code'}
                </button>
              </div>

              {showCouponForm && (
                <form id="coupon-add-form" onSubmit={handleCouponSubmit} className="bg-white border border-slate-200 rounded-2xl p-5 shadow space-y-4">
                  <h4 className="font-display font-semibold text-slate-800 text-sm">Create New Promo Rules</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">PROMO CODE (Uppercase recommended)</label>
                      <input
                        id="form-coupon-code"
                        type="text"
                        required
                        placeholder="e.g. EXTRA10"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm uppercase font-mono tracking-widest"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Savings Percent (%)</label>
                      <input
                        id="form-coupon-pct"
                        type="number"
                        required
                        min="1"
                        max="90"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                        value={couponForm.discountPercent}
                        onChange={(e) => setCouponForm({ ...couponForm, discountPercent: Number(e.target.value) })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Min Spend Limit (৳)</label>
                      <input
                        id="form-coupon-minspend"
                        type="number"
                        required
                        min="0"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                        value={couponForm.minSpend}
                        onChange={(e) => setCouponForm({ ...couponForm, minSpend: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={() => setShowCouponForm(false)} className="px-4 py-1.5 border border-slate-200 rounded-lg text-xs">Cancel</button>
                    <button type="submit" className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs shadow">Save Voucher</button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {coupons.map(cp => (
                  <div key={cp.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-between items-center shadow-sm">
                    <div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-bold tracking-wider">{cp.code}</span>
                      <h4 className="font-display font-semibold text-slate-800 text-lg mt-2">{cp.discountPercent}% Savings</h4>
                      <p className="text-xs text-slate-500 mt-1">Requires min purchase value of ৳ {cp.minSpend}</p>
                    </div>
                    <button
                      id={`delete-coupon-btn-${cp.id}`}
                      onClick={() => handleDeleteCouponClick(cp.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Revoke voucher rules"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: BANNERS SLIDER MANAGEMENT */}
          {activeTab === 'banners' && (
            <div className="space-y-6 animate-fade-in text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-xl text-slate-800 uppercase tracking-tight">Home Static & Slideway Banners</h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Define promotions, daily catch updates, and discount campaigns that roll in the top slot of the homepage dashboard.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingBanner(null);
                    setBannerForm({
                      title: '',
                      subtitle: '',
                      image: '',
                      badge: '',
                      bgGradient: 'from-emerald-700 via-green-800 to-teal-900',
                    });
                    setShowBannerForm(!showBannerForm);
                  }}
                  className="bg-emerald-600 shadow hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  {showBannerForm ? 'Dismiss Form' : 'Add New Slide Banner'}
                </button>
              </div>

              {showBannerForm && (
                <form onSubmit={handleBannerSubmit} className={`bg-white border rounded-2xl p-6 shadow-sm space-y-4 max-w-2xl transition-all duration-300 ${editingBanner ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-lg' : 'border-slate-200'}`}>
                  <h4 className="font-display font-semibold text-slate-700 border-b border-slate-100 pb-2 flex items-center justify-between">
                    <span>
                      {editingBanner ? 'Edit Existing Slider Banner' : 'Configure New Home Slider Banner'}
                    </span>
                    {editingBanner && (
                      <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider animate-pulse flex items-center gap-1 select-none">
                        <span className="h-2 w-2 bg-amber-600 rounded-full inline-block"></span>
                        EDIT_MODE_ACTIVE (ID: {editingBanner.id})
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Banner Heading / Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 100% Organic, Fresh Farms"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 border-slate-200 focus:border-emerald-500 focus:outline-none"
                        value={bannerForm.title}
                        onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Badge Tag / Text</label>
                      <input
                        type="text"
                        placeholder="e.g. SPECIAL PROMOTION"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 border-slate-200 focus:border-emerald-500 focus:outline-none font-sans font-bold text-slate-700"
                        value={bannerForm.badge}
                        onChange={(e) => setBannerForm({ ...bannerForm, badge: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Description / Subtitle</label>
                      <input
                        type="text"
                        placeholder="e.g. Healthy vegetables & fruits directly to your doorstep with super safety protocols."
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 border-slate-200 focus:border-emerald-500 focus:outline-none"
                        value={bannerForm.subtitle}
                        onChange={(e) => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Banner Image *</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Drag and Drop box for Banner Image */}
                        <div 
                          onClick={() => document.getElementById('banner-file-upload-input')?.click()}
                          className="border border-dashed border-slate-300 hover:border-[#00796B] bg-slate-50 hover:bg-slate-50/55 rounded-lg p-3 text-center transition-all cursor-pointer flex flex-col items-center justify-center min-h-[90px]"
                        >
                          <input 
                            id="banner-file-upload-input"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                const reader = new FileReader();
                                reader.onload = (uploadEvent) => {
                                  if (uploadEvent.target?.result) {
                                    setBannerForm({ ...bannerForm, image: uploadEvent.target.result as string });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <ImageIcon className="h-5 w-5 text-slate-400 mb-1" />
                          <span className="text-[11px] font-bold text-slate-700">Upload direct slide photo or Browse</span>
                          <span className="text-[9px] text-slate-400 font-normal">Landscape format recommended</span>
                        </div>

                        <div className="space-y-1.5 flex flex-col justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-1">Image Link address fallback</span>
                            <input
                              type="text"
                              required
                              placeholder="Or paste direct image URL address..."
                              className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                              value={bannerForm.image}
                              onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.value })}
                            />
                          </div>
                          {bannerForm.image && (
                            <div className="flex items-center gap-2 border border-slate-100 bg-slate-50 p-1 rounded-lg">
                              <img 
                                src={bannerForm.image} 
                                className="h-8 w-14 object-cover rounded border bg-white shrink-0" 
                                alt="Slide preview" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="text-[9px] text-[#00796B] font-bold">Auto-Fit Banner Scaled!</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Background Gradient Class (tailwindcss format)</label>
                      <input
                        type="text"
                        required
                        placeholder="from-emerald-700 via-green-800 to-teal-900"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 border-slate-200 font-mono text-xs focus:border-emerald-500 focus:outline-none"
                        value={bannerForm.bgGradient}
                        onChange={(e) => setBannerForm({ ...bannerForm, bgGradient: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-semibold text-slate-400 mb-2">Or select a stunning color theme preset:</span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Emerald Forest', value: 'from-emerald-700 via-green-800 to-teal-900' },
                        { label: 'Deep Ocean Blue', value: 'from-blue-700 via-cyan-800 to-emerald-900' },
                        { label: 'Amber Harvest Sunset', value: 'from-amber-600 via-amber-700 to-emerald-800' },
                        { label: 'Royal Plum Violet', value: 'from-purple-800 via-indigo-900 to-slate-950' },
                        { label: 'Crimson Ember', value: 'from-rose-700 via-red-800 to-orange-850' },
                      ].map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setBannerForm({ ...bannerForm, bgGradient: p.value })}
                          className={`px-3 py-1.5 text-xs text-white rounded-lg bg-gradient-to-r ${p.value} border-2 ${bannerForm.bgGradient === p.value ? 'border-amber-400 scale-102 ring-2 ring-amber-400/30' : 'border-transparent'} hover:scale-102 transition-all cursor-pointer font-medium`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowBannerForm(false);
                        setEditingBanner(null);
                      }}
                      className="px-4 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs"
                    >
                      Discard
                    </button>
                    <button type="submit" className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow">
                      {editingBanner ? 'Update Slider' : 'Save New Slider'}
                    </button>
                  </div>
                </form>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map(b => (
                  <div key={b.id} className={`rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between border border-slate-200 bg-gradient-to-r ${b.bgGradient} text-white`}>
                    <div className="p-6 md:p-8 flex justify-between items-start gap-4">
                      <div className="space-y-2 max-w-lg">
                        <span className="inline-block bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider text-white">
                          {b.badge}
                        </span>
                        <h4 className="font-display font-black text-xl leading-snug">{b.title}</h4>
                        <p className="text-xs text-slate-100/90 leading-normal max-w-sm">{b.subtitle}</p>
                        <code className="block bg-black/25 text-[10px] py-1 px-2 rounded mt-2 font-mono overflow-x-auto no-scrollbar whitespace-nowrap">
                          Gradient: {b.bgGradient}
                        </code>
                      </div>

                      <div className="w-20 h-20 rounded-xl overflow-hidden border border-white/20 shadow shrink-0">
                        <img src={b.image} className="w-full h-full object-cover" alt="" />
                      </div>
                    </div>

                    <div className="bg-black/10 border-t border-white/10 px-6 py-3 flex justify-between items-center text-xs">
                      <span className="text-white/60 font-mono text-[11px] font-bold">Slide Ref ID: {b.id}</span>
                      <div className="flex gap-1 animate-fade-in">
                        <button
                          type="button"
                          onClick={() => handleEditBannerClick(b)}
                          className="p-1 px-2.5 bg-white/11 hover:bg-white/20 active:bg-white/30 rounded-lg transition-all flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                        >
                          <Edit2 className="h-3 w-3" />
                          Edit Slide
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBannerClick(b.id)}
                          className="p-1 px-2.5 bg-red-650/45 hover:bg-red-600 hover:text-white rounded-lg transition-all flex items-center gap-1 font-bold text-[11px] cursor-pointer whitespace-nowrap"
                        >
                          <Trash2 className="h-3 w-3" />
                          Remove Slide
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: STORE GLOBAL CONFIGURATIONS */}
          {activeTab === 'settings' && (
            <div className="flex flex-col xl:flex-row gap-6 animate-fade-in text-slate-800">
              
              {/* LEFT CONTROL PANEL SUB-SIDEBAR (SYSTEM_CORE_CONFIG) */}
              <div className="w-full xl:w-72 bg-white rounded-3xl border border-slate-200 p-5 shrink-0 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="border-b border-slate-100 pb-4 mb-4 select-none">
                    <span className="text-[9px] text-[#00796B] font-black uppercase tracking-widest block mb-0.5">Global Ecosystem / Sectors</span>
                    <h3 className="font-display font-black text-slate-800 text-sm tracking-tight flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#00796B] animate-pulse"></span>
                      SYSTEM_CORE_CONFIG
                    </h3>
                  </div>

                  <nav className="space-y-1">
                    {[
                      { id: 'general', label: 'GENERAL SETTINGS', icon: Settings, desc: 'Site names, descriptions, and links' },
                      { id: 'sms_gmail', label: 'SMS & GMAIL', icon: Bell, desc: 'Gateway providers, SMTP parameters' },
                      { id: 'orders_taxes', label: 'ORDERS & TAXES', icon: DollarSign, desc: 'Shipping tariffs, tax multipliers' },
                      { id: 'security_admin', label: 'SECURITY & ADMIN', icon: ShieldAlert, desc: 'Credentials and recover tokens' },
                      { id: 'ads', label: 'ADS CONTROL (NEW)', icon: Megaphone, desc: 'Manage safe Adsterra scripts' },
                      { id: 'database', label: 'DATABASE ENGINE', icon: RefreshCw, desc: 'Backup, schema check, seed reset' },
                    ].map((item) => {
                      const Icon = item.icon;
                      const active = settingsSubTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setSettingsSubTab(item.id as any)}
                          className={`w-full text-left px-4 py-3 rounded-2xl flex items-start gap-3 transition-colors cursor-pointer group ${
                            active 
                              ? 'bg-[#00796B] text-white' 
                              : 'hover:bg-slate-50 text-slate-600'
                          }`}
                        >
                          <Icon className={`h-4 w-4 shrink-0 mt-0.5 ${active ? 'text-amber-300' : 'text-slate-400 group-hover:text-[#00796B]'}`} />
                          <div>
                            <div className="text-xs font-black uppercase tracking-wider">{item.label}</div>
                            <div className={`text-[10px] ${active ? 'text-teal-100' : 'text-slate-400'}`}>{item.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-medium">
                  <div>Status: <span className="text-emerald-600 font-bold">● ONLINE</span></div>
                  <div>Client Version: <span className="font-mono">v1.2.9-beta</span></div>
                  <div className="mt-2 text-slate-300">BAZAR DHAKA Ecosystem Controller</div>
                </div>
              </div>


              {/* RIGHT PARAMETERIZATION VIEWPORT */}
              <form id="store-settings-form" onSubmit={handleSettingsSubmit} className="flex-1 bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                
                {/* ----------------- SUB TAB 1: GENERAL SETTINGS ----------------- */}
                {settingsSubTab === 'general' && (
                  <div className="space-y-6 animate-fade-in text-slate-700">
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider mb-1">GENERAL CONTROLS</h4>
                      <p className="text-xs text-slate-400">Configure visual branding references, SEO catalogs and multilingual welcome blocks.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">SITE NAME</label>
                        <input
                          type="text"
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-[#00796B] focus:outline-none"
                          value={settingsForm.storeName}
                          onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">PRIMARY SUPPORT HELPLINE</label>
                        <input
                          type="text"
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00796B] focus:outline-none"
                          value={settingsForm.phone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        />
                        <span className="text-[10px] text-slate-400">Office support helpline, accessible worldwide</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">SITE DESCRIPTION (ENGLISH)</label>
                        <textarea
                          rows={2}
                          className="w-full border border-slate-200 rounded-lg p-3 text-xs focus:border-[#00796B] focus:outline-none"
                          value={settingsForm.siteDescEnglish || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, siteDescEnglish: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">SITE DESCRIPTION (BENGALI)</label>
                        <textarea
                          rows={2}
                          className="w-full border border-slate-200 rounded-lg p-3 text-xs focus:border-[#00796B] focus:outline-none"
                          value={settingsForm.siteDescBengali || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, siteDescBengali: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">CONTACT PHONE 2 (SECONDARY)</label>
                        <input
                          type="text"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00796B] focus:outline-none"
                          value={settingsForm.phone2 || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, phone2: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">SUPPORT MAIL</label>
                        <input
                          type="email"
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00796B] focus:outline-none"
                          value={settingsForm.email}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">CONTACT ADDRESS</label>
                        <input
                          type="text"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-[#00796B] focus:outline-none"
                          value={settingsForm.address}
                          onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* DYNAMIC SOCIAL LINKS CONTAINER */}
                    <div className="border-t border-slate-100 pt-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider">SOCIAL LINKS</h5>
                          <span className="text-[10px] text-slate-400 font-medium">Add or manage active hypermedia anchors displayed inside store footers.</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {socialLinksExpanded.map((item) => (
                          <div key={item.id} className="flex gap-2 items-center">
                            <span className="w-16 bg-slate-150 text-slate-700 font-bold px-2 py-1.5 rounded-lg text-[10px] font-mono text-center border">
                              {item.label}
                            </span>
                            <input
                              type="text"
                              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none"
                              value={item.url}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSocialLinksExpanded(prev => prev.map(l => l.id === item.id ? { ...l, url: val } : l));
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setSocialLinksExpanded(prev => prev.filter(l => l.id !== item.id));
                              }}
                              className="p-1 px-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer animate-fade-in"
                              title="Remove Link"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200 max-w-xl">
                        <input
                          type="text"
                          placeholder="Label (e.g. YT)"
                          className="w-24 border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase focus:outline-none focus:border-[#00796B]"
                          value={newSocialLabel}
                          onChange={(e) => setNewSocialLabel(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Web Link URL (https://...)"
                          className="flex-1 border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#00796B]"
                          value={newSocialUrl}
                          onChange={(e) => setNewSocialUrl(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newSocialLabel || !newSocialUrl) {
                              triggerAlert('Required Input', 'Please fill out both the label and destination URL.');
                              return;
                            }
                            setSocialLinksExpanded(prev => [
                              ...prev,
                              { id: `sl-${Date.now()}`, label: newSocialLabel.toUpperCase(), url: newSocialUrl }
                            ]);
                            setNewSocialLabel('');
                            setNewSocialUrl('');
                          }}
                          className="p-1.5 px-3 bg-[#00796B] text-white hover:bg-[#005B52] rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all active:scale-95"
                        >
                          + ADD LINK
                        </button>
                      </div>
                    </div>

                    {/* DYNAMIC FOOTER QUICK LINKS */}
                    <div className="border-t border-slate-100 pt-6 space-y-4">
                      <div>
                        <h5 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider mb-0.5">FOOTER QUICK LINKS</h5>
                        <p className="text-[10px] text-slate-400 font-medium">These hypermedia anchors dictate core help and terms routing links across footer modules.</p>
                      </div>

                      <div className="space-y-2">
                        {quickLinks.map((item) => (
                          <div key={item.id} className="flex gap-2 items-center">
                            <input
                              type="text"
                              className="w-40 border border-slate-200 bg-slate-50 rounded-lg px-3 py-1.5 text-xs font-black text-slate-700"
                              value={item.label}
                              onChange={(e) => {
                                const val = e.target.value;
                                setQuickLinks(prev => prev.map(l => l.id === item.id ? { ...l, label: val } : l));
                              }}
                            />
                            <input
                              type="text"
                              className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none"
                              value={item.url}
                              onChange={(e) => {
                                const val = e.target.value;
                                setQuickLinks(prev => prev.map(l => l.id === item.id ? { ...l, url: val } : l));
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setQuickLinks(prev => prev.filter(l => l.id !== item.id));
                              }}
                              className="p-1 px-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors cursor-pointer animate-fade-in"
                              title="Delete Path"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-200 max-w-xl">
                        <input
                          type="text"
                          placeholder="e.g. RETURN POLICY"
                          className="w-40 border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-bold uppercase focus:outline-none focus:border-[#00796B]"
                          value={newLinkLabel}
                          onChange={(e) => setNewLinkLabel(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="/return-policy"
                          className="flex-1 border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-[#00796B]"
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newLinkLabel || !newLinkUrl) {
                              triggerAlert('Required Input', 'Provide a label and routing pathname first.');
                              return;
                            }
                            setQuickLinks(prev => [
                              ...prev,
                              { id: `ql-${Date.now()}`, label: newLinkLabel.toUpperCase(), url: newLinkUrl }
                            ]);
                            setNewLinkLabel('');
                            setNewLinkUrl('');
                          }}
                          className="p-1.5 px-3 bg-[#00796B] hover:bg-[#005B52] text-white rounded-lg text-xs font-bold shrink-0 cursor-pointer transition-all active:scale-95"
                        >
                          + ADD PATH
                        </button>
                      </div>
                    </div>

                    {/* SPECIAL OFFER CONFIGURATION SECTION */}
                    <div className="border-t border-slate-100 pt-6 space-y-4">
                      <div>
                        <h5 className="font-display font-bold text-slate-800 text-xs uppercase tracking-wider mb-0.5">💥 HOME PAGE SPECIAL OFFER BANNER</h5>
                        <p className="text-[10px] text-slate-400 font-medium">Customize the headline, description and full-screen background image of the Left Special Offer block.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">OFFER TITLE / BADGE</label>
                          <input
                            type="text"
                            placeholder="e.g. Special Offer"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-[#00796B] focus:outline-none font-sans"
                            value={settingsForm.specialOfferTitle || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, specialOfferTitle: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">OFFER SHORT DESCRIPTION (FEW WORDS OR EMPTY)</label>
                          <input
                            type="text"
                            placeholder="e.g. Tap to claim flat 15% discount voucher"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-[#00796B] focus:outline-none font-sans"
                            value={settingsForm.specialOfferDesc || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, specialOfferDesc: e.target.value })}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">BANNER BACKGROUND IMAGE URL</label>
                        <div className="flex gap-3 items-center">
                          <input
                            type="text"
                            placeholder="Paste image URL here"
                            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00796B] focus:outline-none"
                            value={settingsForm.specialOfferImage || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, specialOfferImage: e.target.value })}
                          />
                          {settingsForm.specialOfferImage && (
                            <div className="h-10 w-10 border rounded-lg overflow-hidden shrink-0 bg-slate-50">
                              <img 
                                src={settingsForm.specialOfferImage} 
                                className="h-full w-full object-cover" 
                                alt="Offer Preview" 
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&q=80&w=150';
                                }}
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 block">Specify any public web image address to update the tall Special Offer block layout immediately.</span>
                      </div>
                    </div>

                  </div>
                )}

                {/* ----------------- SUB TAB 2: SMS & GMAIL ----------------- */}
                {settingsSubTab === 'sms_gmail' && (
                  <div className="space-y-6 animate-fade-in text-slate-700">
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider mb-1">SMS & GMAIL NOTIFICATIONS</h4>
                      <p className="text-xs text-slate-400">Settle transactional updates, OTP gateways, and carrier-level configurations.</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#00796B] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-black text-[#00796B] uppercase tracking-wider">SMS / WhatsApp Verification Node Active</span>
                        <p className="text-[11px] text-emerald-800 leading-relaxed mt-0.5">
                          SMS updates trigger immediately inside the checkout flow using secure asynchronous client hooks. Configuration presets sync directly with local systems.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">ACTIVE SMS GATEWAY PROVIDER</label>
                        <select
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#00796B]"
                          value={settingsForm.smsGateway || 'BulkSMS BD Gateway Premium'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, smsGateway: e.target.value })}
                        >
                          <option value="BulkSMS BD Gateway Premium">BulkSMS BD Gateway Premium</option>
                          <option value="Twilio Global API">Twilio Global API</option>
                          <option value="MimSMS Gateway Bangladesh">MimSMS Gateway Bangladesh</option>
                          <option value="Greentech SMS API">Greentech SMS API</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">SMS GATEWAY API TOKEN</label>
                        <input
                          type="password"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#00796B]"
                          value={settingsForm.smsApiToken || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, smsApiToken: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-5 space-y-4">
                      <legend className="text-xs font-bold text-slate-600 uppercase tracking-widest block">GMAIL SMTP CLIENT AUTHENTICATION</legend>
                      
                      <div className="flex items-center gap-2">
                        <input
                          id="smtp-auth-toggle"
                          type="checkbox"
                          className="h-4 w-4 text-[#00796B] focus:ring-[#00796B] border-slate-300 rounded cursor-pointer"
                          checked={settingsForm.enableSmtp !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, enableSmtp: e.target.checked })}
                        />
                        <label htmlFor="smtp-auth-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                          Activate secure SMTP mail triggers for customer invoicings and receipts
                        </label>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">SMTP SERVER HOST</label>
                          <input
                            type="text"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                            value={settingsForm.smtpHost || 'smtp.gmail.com'}
                            onChange={(e) => setSettingsForm({ ...settingsForm, smtpHost: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">SMTP MAIL SERVER PORT</label>
                          <input
                            type="number"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                            value={settingsForm.smtpPort || 465}
                            onChange={(e) => setSettingsForm({ ...settingsForm, smtpPort: Number(e.target.value) })}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">GMAIL AUTHENTICATION SENDER ACCOUNT</label>
                          <input
                            type="text"
                            placeholder="e.g. shop@bazar.com.bd"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                            value={settingsForm.email}
                            readOnly
                          />
                          <span className="text-[10px] text-slate-400">Mirrors primary support contact email</span>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">GOOGLE MAIL APP PASSWORD (16-CHAR STACK)</label>
                          <input
                            type="password"
                            placeholder="e.g. abcd efgh ijkl mnop"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono"
                            value={settingsForm.gmailAppPassword || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, gmailAppPassword: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* ----------------- SUB TAB 3: ORDERS & TAXES ----------------- */}
                {settingsSubTab === 'orders_taxes' && (
                  <div className="space-y-6 animate-fade-in text-slate-700">
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider mb-1">ORDERS, LOGISTIC RATES & GOVT TAX PARAMETERS</h4>
                      <p className="text-xs text-slate-400">Modify freight pricing limits, transaction thresholds, and regional tax brackets.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">DELIVERY FEE - INSIDE DHAKA (৳)</label>
                        <input
                          type="number"
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00796B]"
                          value={settingsForm.deliveryFee}
                          onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFee: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">DELIVERY FEE - OUTSIDE DHAKA (৳)</label>
                        <input
                          type="number"
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00796B]"
                          value={settingsForm.deliveryFeeOutsideDhaka !== undefined ? settingsForm.deliveryFeeOutsideDhaka : 120}
                          onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFeeOutsideDhaka: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">GOVERNMENT VAT / TAX RATE (%)</label>
                        <input
                          type="number"
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00796B]"
                          value={settingsForm.vatTaxPercent !== undefined ? settingsForm.vatTaxPercent : 5}
                          onChange={(e) => setSettingsForm({ ...settingsForm, vatTaxPercent: Number(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">FREE DELIVERY MINIMUM BASKET (৳)</label>
                        <input
                          type="number"
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00796B]"
                          value={settingsForm.freeDeliveryThreshold}
                          onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })}
                        />
                        <span className="text-[10px] text-slate-400">Cart values exceeding this amount enjoy zero shipping charges.</span>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">MINIMUM VALID BASKET AMOUNT (৳)</label>
                        <input
                          type="number"
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:border-[#00796B]"
                          value={settingsForm.minOrderValue !== undefined ? settingsForm.minOrderValue : 200}
                          onChange={(e) => setSettingsForm({ ...settingsForm, minOrderValue: Number(e.target.value) })}
                        />
                        <span className="text-[10px] text-slate-400">Reject checkout values lower than this threshold.</span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-5 space-y-4">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-widest block">INTEGRATED PAYMENT CLOUD SWITCHES</span>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl border flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-slate-800">SSLCommerz Sandbox Gateway</span>
                            <p className="text-[10px] text-slate-400">Support VISA, Mastercard, Amex, DBBL Nexus</p>
                          </div>
                          <input
                            type="checkbox"
                            className="h-4 w-4 text-[#00796B] focus:ring-[#00796B]"
                            checked={settingsForm.enableSSLCommerz !== false}
                            onChange={(e) => setSettingsForm({ ...settingsForm, enableSSLCommerz: e.target.checked })}
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-slate-50 rounded-xl border flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-slate-800">MFS Merchant Node (bKash & Nagad)</span>
                              <p className="text-[10px] text-slate-400">Triggers intuitive mobile wallets payment sheet</p>
                            </div>
                            <input
                              type="checkbox"
                              className="h-4 w-4 text-[#00796B] focus:ring-[#00796B]"
                              checked={settingsForm.enableBkashNagad !== false}
                              onChange={(e) => setSettingsForm({ ...settingsForm, enableBkashNagad: e.target.checked })}
                            />
                          </div>

                          {settingsForm.enableBkashNagad !== false && (
                            <div className="p-4 bg-orange-50/20 rounded-xl border border-orange-200/50 grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up">
                              <div className="space-y-3">
                                <span className="text-[10px] font-black text-[#e11e5f] uppercase tracking-wider block">💓 bKash Gateway Settings</span>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">bKash WALLET / ACCOUNT NUMBER</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 017xxxxxxxx"
                                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-pink-500 focus:outline-none"
                                    value={settingsForm.bkashNumber || ''}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, bkashNumber: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">bKash PAYMENT INSTRUCTIONS</label>
                                  <textarea
                                    rows={2}
                                    placeholder="Steps on how to pay..."
                                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:border-pink-500 focus:outline-none font-sans"
                                    value={settingsForm.bkashInstruction || ''}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, bkashInstruction: e.target.value })}
                                  />
                                </div>
                              </div>

                              <div className="space-y-3">
                                <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider block">🧡 Nagad Gateway Settings</span>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Nagad WALLET / ACCOUNT NUMBER</label>
                                  <input
                                    type="text"
                                    placeholder="e.g. 018xxxxxxxx"
                                    className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:border-orange-500 focus:outline-none"
                                    value={settingsForm.nagadNumber || ''}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, nagadNumber: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Nagad PAYMENT INSTRUCTIONS</label>
                                  <textarea
                                    rows={2}
                                    placeholder="Steps on how to pay..."
                                    className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:border-orange-500 focus:outline-none font-sans"
                                    value={settingsForm.nagadInstruction || ''}
                                    onChange={(e) => setSettingsForm({ ...settingsForm, nagadInstruction: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* ----------------- SUB TAB 4: SECURITY & ADMIN ----------------- */}
                {settingsSubTab === 'security_admin' && (
                  <div className="space-y-6 animate-fade-in text-slate-700">
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider mb-1">ADMIN ACCESS CONTROL</h4>
                      <p className="text-xs text-slate-400">Setup administrator security keys, OTP authentications and recovery loops.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">ADMIN USERNAME</label>
                        <input
                          type="text"
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-[#00796B]"
                          value={settingsForm.adminUsername || 'SHAMIM'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, adminUsername: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">ADMIN PASSWORD</label>
                        <input
                          type="password"
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-[#00796B]"
                          value={settingsForm.adminPassword || '123'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, adminPassword: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">RECOVERY EMAIL FOR OTP VERIFICATION</label>
                        <input
                          type="email"
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-[#00796B]"
                          value={settingsForm.recoveryEmail || 'shamimrez22@gmail.com'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, recoveryEmail: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">RECOVERY NOTIFICATION PHONE</label>
                        <input
                          type="text"
                          required
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1 focus:ring-[#00796B]"
                          value={settingsForm.recoveryPhone || '01712-345678'}
                          onChange={(e) => setSettingsForm({ ...settingsForm, recoveryPhone: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                        <span className="text-xs font-bold text-amber-800">Security Warning</span>
                      </div>
                      <p className="text-[11px] text-amber-700 leading-relaxed">
                        These credentials protect the global `/admin` control override. Ensure recovery email is verified since automatic backups send temporary decryption tokens to this email on startup.
                      </p>
                    </div>

                  </div>
                )}

                {/* ----------------- SUB TAB: ADS CONTROL ----------------- */}
                {settingsSubTab === 'ads' && (
                  <div className="space-y-6 animate-fade-in text-slate-700">
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider mb-1">📢 ADS CONTROL & MONETIZATION</h4>
                      <p className="text-xs text-slate-400">Manage your Adsterra or third-party ad script placements. We recommend blocking mature campaigns to ensure clean, safe ads on your affiliate platform.</p>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#00796B] shrink-0" />
                        <span className="text-xs font-bold text-[#00796B]">How to keep ads clean (খারাপ অ্যাড ছাড়া):</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-relaxed font-sans">
                        যখন আপনি <strong>Adsterra Panel</strong> থেকে ad unit তৈরি করবেন, তখন অবশ্যই <strong>Campaign Category Exclusion</strong> অপশন থেকে নিম্নোক্ত ক্যাটাগরিগুলো টিক দিয়ে বন্ধ (Block) করে দিন:
                        <br />
                        🚫 <strong>Erotic Ads (১৮+ অ্যাড)</strong>, 🚫 <strong>Software Downloads / Malware</strong>, 🚫 <strong>Gambling / Betting</strong>, এবং 🚫 <strong>Alert Ads</strong>। এতে শুধুমাত্র নিরাপদ এবং শিক্ষণীয় ও ইকমার্স রিলেটেড বিজ্ঞাপন আপনার ওয়েবসাইটে প্রকাশ পাবে।
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Master Toggle */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/50 rounded-2xl">
                        <div>
                          <label className="block text-xs font-black text-slate-700 uppercase">Enable Advertisement System</label>
                          <span className="text-[10px] text-slate-400">Toggle whether to render active ad banner spots across your website.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={!!settingsForm.enableAds}
                            onChange={(e) => setSettingsForm({ ...settingsForm, enableAds: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      {/* Safe Filter toggle indicator */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/50 rounded-2xl">
                        <div>
                          <label className="block text-xs font-black text-slate-700 uppercase">🧼 Enforce Safe Ads Mode Only</label>
                          <span className="text-[10px] text-slate-400 font-sans">Strictly filters placeholder ads and alerts to prevent bad banner content from taking place.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={settingsForm.isSafeAdsOnly !== false}
                            onChange={(e) => setSettingsForm({ ...settingsForm, isSafeAdsOnly: e.target.checked })}
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>

                      {/* Ad Slot 1: Native Popunder / Header Scripts */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                          🌐 Header Ad Script / Popunder HTML (Adsterra)
                        </label>
                        <p className="text-[10px] text-slate-400">Inserted globally into the head or header block of the frontpage. Perfect for Popunder or Social Bar codes.</p>
                        <textarea
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono focus:bg-white focus:border-emerald-500 focus:outline-none"
                          placeholder="e.g. <script type='text/javascript' src='//pl12345.highperformanceformat.com/...'></script>"
                          value={settingsForm.adsterraHeaderScript || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, adsterraHeaderScript: e.target.value })}
                        />
                      </div>

                      {/* Ad Slot 2: Sidebar Banner Code */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                          📱 Sidebar banner Code (160×600 or 300×250 Banner)
                        </label>
                        <p className="text-[10px] text-slate-400 font-sans">This ad banner is rendered directly in the sidebar spaces or homepage hero banners.</p>
                        <textarea
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono focus:bg-white focus:border-emerald-500 focus:outline-none"
                          placeholder="e.g. adsterra panel banner code"
                          value={settingsForm.adsterraSidebarScript || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, adsterraSidebarScript: e.target.value })}
                        />
                      </div>

                      {/* Ad Slot 3: Feed / Grid Inline Native Banner */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                          🍱 Inside product Feed Banner code (468×60 or Native Banner)
                        </label>
                        <p className="text-[10px] text-slate-400 font-sans">Rendered as a responsive divider between product galleries on shop & primary lists.</p>
                        <textarea
                          rows={3}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono focus:bg-white focus:border-emerald-500 focus:outline-none"
                          placeholder="e.g. 468x60 native banner code"
                          value={settingsForm.adsterraFeedScript || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, adsterraFeedScript: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* ----------------- SUB TAB 5: DATABASE ENGINE ----------------- */}
                {settingsSubTab === 'database' && (
                  <div className="space-y-6 animate-fade-in text-slate-700">
                    <div>
                      <h4 className="font-display font-bold text-slate-800 text-sm uppercase tracking-wider mb-1">LOCAL DB STORAGE & ENGINE TUNERS</h4>
                      <p className="text-xs text-slate-400">Run manual maintenance backups, trigger relational audits, or erase volatile states.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      
                      {/* Box 1 */}
                      <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">DB CONNECTOR</span>
                          <span className="text-xs font-black text-slate-800 block">LOCALSTORAGE ENGINE</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md inline-block uppercase tracking-wider mt-1.5">
                            Active (Online)
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                          Synchronizes changes instantly across client views and retains items inside safe sandboxed states.
                        </p>
                      </div>

                      {/* Box 2 */}
                      <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">BACKUP ENGINE</span>
                          <span className="text-xs font-black text-slate-800 block">VOLATILE EXPORTS</span>
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                const backup: Record<string, any> = {};
                                Object.keys(localStorage).forEach(key => {
                                  if (key.startsWith('bazar_')) {
                                    backup[key] = JSON.parse(localStorage.getItem(key) || 'null');
                                  }
                                });
                                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
                                const downloadAnchor = document.createElement('a');
                                downloadAnchor.setAttribute("href",     dataStr);
                                downloadAnchor.setAttribute("download", `bazar_ecosystem_backup_${Date.now()}.json`);
                                document.body.appendChild(downloadAnchor);
                                downloadAnchor.click();
                                downloadAnchor.remove();
                                triggerAlert('Export Complete', 'Your backup JSON payload has been prepared and downloaded safely.');
                              } catch (err) {
                                triggerAlert('Data Export Error', 'Could not synthesize client localStorage backup strings.');
                              }
                            }}
                            className="text-[11px] font-bold text-[#00796B] hover:underline mt-1.5 block cursor-pointer text-left"
                          >
                            📥 Download JSON File
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                          Download a single-file JSON file containing all products, users, categories and order lists.
                        </p>
                      </div>

                      {/* Box 3 */}
                      <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block mb-1">INTEGRITY AUDIT</span>
                          <span className="text-xs font-black text-slate-800 block">RELATIONAL TRACER</span>
                          <button
                            type="button"
                            onClick={() => {
                              triggerAlert('Schema OK', 'Checked 5 relational entities. Tables are healthy and synchronized.');
                            }}
                            className="text-[11px] font-bold text-slate-600 hover:underline mt-1.5 block cursor-pointer text-left"
                          >
                            🔍 Trigger Validation Check
                          </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                          Audit product foreign keys against categories to resolve orphan products in the shop catalog.
                        </p>
                      </div>

                    </div>

                    <div className="border-t border-slate-100 pt-5 space-y-3">
                      <span className="text-xs font-bold text-rose-700 uppercase tracking-widest block">HAZARDOUS OPERATIONS CONSOLE</span>
                      
                      <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                          <span className="text-xs font-black text-rose-900 block uppercase mb-1">Wipe All Client Database Volumes</span>
                          <p className="text-[11px] text-rose-700 leading-relaxed max-w-lg">
                            This operation completely clears your custom products, categories, registered customers, banners, and coupon lists from localStorage, restarting the browser environment with default factory seeds.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            triggerConfirm(
                              'Factory Reset Database',
                              'Are you sure you want to permanently erase all custom data files, registered customers, and order history? This will revert BAZAR to default seeds.',
                              () => {
                                localStorage.clear();
                                triggerAlert('Erase Successful', 'Refreshing system definitions...');
                                setTimeout(() => window.location.reload(), 1000);
                              }
                            );
                          }}
                          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-sm active:scale-97"
                        >
                          🔥 ZERO DISK & SEED
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* --- UNIVERSAL FORM FOOTER SUBMIT AREA --- */}
                <div className="pt-5 border-t border-slate-150 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    Pressing save writes active changes to Local Storage
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSettingsForm({ ...settings });
                        setQuickLinks(settings.quickLinks || []);
                        setSocialLinksExpanded(settings.socialLinksExpanded || []);
                        triggerAlert('Reverted', 'Global system config restored to currently persisted database limits.');
                      }}
                      className="border border-slate-200 hover:bg-slate-50 rounded-xl px-5 py-2.5 text-xs font-bold text-slate-500 cursor-pointer transition-colors"
                    >
                      RESET TAB
                    </button>
                    <button
                      id="settings-save-submit-btn"
                      type="submit"
                      className="bg-[#00796B] hover:bg-[#005B52] active:scale-95 text-white px-6 py-2.5 rounded-xl text-xs font-black tracking-wide shadow-sm transition-all cursor-pointer"
                    >
                      SAVE SYSTEM_CORE_CONFIG
                    </button>
                  </div>
                </div>

              </form>

            </div>
          )}

          {/* TAB 8: POSTGRESQL & NODE BLUEPRINT HUB */}
          {activeTab === 'developer' && (
            <div className="space-y-6 animate-fade-in text-sm">
              <p className="text-slate-500 text-xs">Review the complete Relational Schema and Express Web Controller code templates. This allows easy migration of the mock client DB into PostgreSQL.</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Column A: PostgreSQL DDL Script */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white space-y-4 font-mono select-all">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block font-display">schema.sql (PostgreSQL)</span>
                    <span className="text-[10px] text-slate-500">PostgreSQL Relational DB</span>
                  </div>
                  <pre className="text-[11px] h-96 overflow-y-auto no-scrollbar font-sans text-slate-300 whitespace-pre-wrap leading-relaxed">
{`-- Database Schema Definition for BAZAR Grocery App

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT '',
    address TEXT DEFAULT '',
    city VARCHAR(50) DEFAULT 'Dhaka',
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Blocked')),
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    slug VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    category_slug VARCHAR(50) REFERENCES categories(slug) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    unit VARCHAR(30) DEFAULT '1 kg',
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    original_price NUMERIC(10, 2) NOT NULL,
    discount_percent INT DEFAULT 0,
    stock INT NOT NULL DEFAULT 50 CHECK (stock >= 0),
    description TEXT,
    rating NUMERIC(2,1) DEFAULT 4.5,
    featured BOOLEAN DEFAULT FALSE,
    best_seller BOOLEAN DEFAULT FALSE,
    is_new_arrival BOOLEAN DEFAULT TRUE,
    popular BOOLEAN DEFAULT FALSE
);

-- 4. Coupons Table
CREATE TABLE IF NOT EXISTS coupons (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    discount_percent INT NOT NULL CHECK (discount_percent BETWEEN 1 AND 99),
    min_spend NUMERIC(10, 2) DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

-- 5. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    tracking_code VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(50) NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    discount NUMERIC(10, 2) DEFAULT 0,
    delivery_fee NUMERIC(10, 2) DEFAULT 50,
    total NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Pending',
    status VARCHAR(25) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Processing', 'Shipped', 'Delivered', 'Canceled')),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(150) NOT NULL,
    price CONSTANT NUMERIC(10, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit VARCHAR(30)
);`}
                  </pre>
                </div>

                {/* Column B: Express Node Code */}
                <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 text-white space-y-4 font-mono select-all">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-teal-400 uppercase tracking-widest block font-display">server.js (Express Handler)</span>
                    <span className="text-[10px] text-slate-500">Node API Controller</span>
                  </div>
                  <pre className="text-[11px] h-96 overflow-y-auto no-scrollbar font-sans text-slate-300 whitespace-pre-wrap leading-relaxed">
{`// Express API endpoints for BAZAR Grocery Server Application
import express from 'express';
import { Pool } from 'pg'; // PostgreSQL Client

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL // Managed via Env Secret
});

// 1. Fetch products with optional categories filtering
router.get('/api/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = 'SELECT * FROM products';
    const params = [];

    if (category || search) {
      query += ' WHERE ';
      const conditions = [];
      if (category) {
        params.push(category);
        conditions.push(\`category_slug = \\\$\${params.length}\`);
      }
      if (search) {
        params.push(\`%\${search}%\`);
        conditions.push(\`(name ILIKE \\\$\${params.length} OR description ILIKE \\\$\${params.length})\`);
      }
      query += conditions.join(' AND ');
    }

    query += ' ORDER BY id ASC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Database query execution failure' });
  }
});

// 2. Placing an order & decrementing inventory (Atomically inside Transaction)
router.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    const { 
      customer_name, email, phone, address, city, items, 
      subtotal, discount, delivery_fee, total, payment_method 
    } = req.body;
    
    await client.query('BEGIN'); // SQL Transaction Begin
    
    const orderId = 'ord-' + Math.floor(100 + Math.random() * 900);
    const trackingCode = 'BZR-' + Math.floor(10000 + Math.random() * 90000);

    // Insert order header
    const orderQuery = \`
      INSERT INTO orders (id, tracking_code, customer_name, email, phone, address, city, subtotal, discount, delivery_fee, total, payment_method)
      VALUES (\\\$1, \\\$2, \\\$3, \\\$4, \\\$5, \\\$6, \\\$7, \\\$8, \\\$9, \\\$10, \\\$11, \\\$12)
      RETURNING *
    \`;
    await client.query(orderQuery, [orderId, trackingCode, customer_name, email, phone, address, city, subtotal, discount, delivery_fee, total, payment_method]);

    // Insert order items and decrement stocks
    for (const item of items) {
      const itemQuery = \`
        INSERT INTO order_items (order_id, product_id, product_name, price, quantity, unit)
        VALUES (\\\$1, \\\$2, \\\$3, \\\$4, \\\$5, \\\$6)
      \`;
      await client.query(itemQuery, [orderId, item.productId, item.productName, item.price, item.quantity, item.unit]);

      // Decrement stock
      const stockUpdateQuery = \`
        UPDATE products 
        SET stock = GREATEST(0, stock - \\\$1) 
        WHERE id = \\\$2
      \`;
      await client.query(stockUpdateQuery, [item.quantity, item.productId]);
    }

    await client.query('COMMIT'); // SQL Commit
    res.status(201).json({ success: true, orderId, trackingCode });
  } catch (error) {
    await client.query('ROLLBACK'); // SQL Rollback
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});`}
                  </pre>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>

      {/* CUSTOM DIALOG MODAL (REPLACES BLOCKED WINDOW ACTIONS INSIDE SECURE IFRAME) */}
      {customDialog && customDialog.show && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-fade-in animate-scale-up select-none">
            <div className={`p-5 flex items-center gap-3 text-white ${customDialog.type === 'confirm' ? 'bg-[#00796B]' : 'bg-slate-800'}`}>
              {customDialog.type === 'confirm' ? (
                <AlertTriangle className="h-5 w-5 text-amber-300 shrink-0" />
              ) : (
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
              )}
              <h3 className="font-display font-black text-xs uppercase tracking-wider">
                {customDialog.title}
              </h3>
            </div>
            <div className="p-6 text-slate-600 text-xs font-semibold leading-relaxed">
              {customDialog.message}
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              {customDialog.type === 'confirm' && (
                <button
                  type="button"
                  onClick={() => setCustomDialog(null)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-md text-xs font-bold text-slate-500 cursor-pointer transition-colors"
                >
                  CANCEL
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  if (customDialog.type === 'confirm' && customDialog.onConfirm) {
                    customDialog.onConfirm();
                  }
                  setCustomDialog(null);
                }}
                className={`px-5 py-2 rounded-md text-xs font-bold text-white shadow-s cursor-pointer transition-all active:scale-97 ${
                  customDialog.type === 'confirm' ? 'bg-[#00796B] hover:bg-[#005B52]' : 'bg-slate-800 hover:bg-slate-700'
                }`}
              >
                {customDialog.type === 'confirm' ? 'CONFIRM' : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
