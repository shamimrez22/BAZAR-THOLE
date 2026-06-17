import React, { useState } from 'react';
import { 
  ShoppingCart, Search, User, Menu, X, ShieldAlert, Heart, Truck, HelpCircle, 
  MapPin, LogOut, ClipboardList
} from 'lucide-react';
import { CartItem, User as ProfileUser, StoreSettings } from '../types';

interface HeaderProps {
  cart: CartItem[];
  wishlist: string[];
  currentUser: ProfileUser | null;
  settings: StoreSettings;
  activeTab: string;
  onNavigate: (tab: string) => void;
  onSearch: (term: string) => void;
  onToggleAdmin: () => void;
  onToggleCart: () => void;
  onLogout: () => void;
}

export default function Header({
  cart,
  wishlist,
  currentUser,
  settings,
  activeTab,
  onNavigate,
  onSearch,
  onToggleAdmin,
  onToggleCart,
  onLogout,
}: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
    onNavigate('shop');
  };

  const navItems = [
    { label: 'Home', value: 'home' },
    { label: 'Shop', value: 'shop' },
    { label: 'Tracking', value: 'tracking' },
    { label: 'About', value: 'about' },
    { label: 'Contact', value: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200/80 shadow-sm">
      {/* ONE UNIFIED TOP BAR THAT CONTAINS SEARCH BAR AND EVERY ESSENTIAL ACTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 font-sans">
        
        {/* Left Side: Brand Logo & Nav Links */}
        <div className="flex items-center gap-6 shrink-0">
          {/* Mobile hamburger menu button */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <div
            id="header-logo"
            onClick={() => { onNavigate('home'); onSearch(''); setSearchTerm(''); }}
            className="flex items-center gap-1.5 cursor-pointer select-none py-1 group shrink-0"
          >
            {/* Beautiful customized Bazar Thole logo mimicking the user's uploaded screenshot exactly */}
            <div className="flex items-center gap-2 select-none animate-fade-in">
              <svg className="w-8 h-8 shrink-0 hover:scale-105 transition-transform" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Outer Orange Shopping Bag Shape conforming to the uploaded image */}
                <path d="
                  M 30 35 
                  C 30 18, 70 18, 70 35 
                  C 75 35, 80 38, 80 43 
                  L 78 78 
                  C 77 84, 72 88, 66 88 
                  L 24 88 
                  C 18 88, 13 84, 12 78 
                  L 10 43 
                  C 10 38, 15 35, 20 35
                  L 22 35
                " stroke="#F97316" strokeWidth="8.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                
                {/* Inside Cart */}
                <path d="M 23 58 H 32 L 38 78 M 32 64 H 74 L 78 58 H 32" stroke="#1E293B" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="43" cy="83" r="5.5" fill="#1E293B" />
                <circle cx="67" cy="83" r="5.5" fill="#1E293B" />
                
                {/* Cargo Boxes inside Cart */}
                <rect x="36" y="50" width="8" height="13" rx="1.5" fill="#84CC16" />
                <rect x="47" y="44" width="8" height="19" rx="1.5" fill="#F97316" />
                <rect x="58" y="49" width="8" height="14" rx="1.5" fill="#EF4444" />
              </svg>

              <div className="flex flex-col justify-center text-left leading-none font-sans">
                <span className="text-[15px] font-black tracking-wide text-[#F97316] uppercase leading-none">Bazar</span>
                <span className="text-[12px] font-extrabold tracking-[0.16em] text-slate-800 uppercase leading-none mt-0.5">Thole</span>
              </div>
            </div>
          </div>

          {/* Inline Navigation Menu (Desktop only - unified here!) */}
          <nav className="hidden lg:flex items-center gap-5 border-l border-gray-200 pl-6 shrink-0">
            {navItems.map((item) => (
              <button
                key={item.value}
                id={`header-nav-${item.value}`}
                onClick={() => { onNavigate(item.value); onSearch(''); setSearchTerm(''); }}
                className={`text-xs font-bold uppercase tracking-wider transition-all py-1.5 px-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 ${
                  activeTab === item.value 
                    ? 'text-emerald-700 font-extrabold bg-emerald-50/50' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Center: Search Box (Sleek, centered, spacious) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md items-center relative mx-2">
          <input
            id="header-search-input"
            type="text"
            placeholder="Search fresh mangoes, catfish, ghee, organic rice..."
            className="w-full pl-5 pr-12 py-2 rounded-full border border-gray-200/80 text-xs bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/20 focus:outline-none transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            id="header-search-submit"
            type="submit"
            className="absolute right-1 text-white bg-emerald-650 bg-emerald-600 hover:bg-emerald-700 p-1.5 px-3.5 rounded-full transition-all font-semibold shadow-xs flex items-center justify-center cursor-pointer"
            title="Search"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Right Side: Action Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Quick Admin Access Button */}
          <button
            id="header-admin-quick-btn"
            onClick={onToggleAdmin}
            className="hidden md:flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition-all shadow-xs cursor-pointer select-none"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Admin</span>
          </button>

          {/* Quick Order Tracking Icon for desktop */}
          <button
            onClick={() => onNavigate('tracking')}
            className={`hidden sm:flex p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer ${
              activeTab === 'tracking' ? 'text-emerald-600 bg-emerald-50' : ''
            }`}
            title="Order Tracking"
          >
            <ClipboardList className="h-5 w-5" />
          </button>

          {/* Wishlist Icon */}
          <button
            id="header-wishlist-view"
            onClick={() => onNavigate('account')}
            className="relative p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
            title="My Wishlist"
          >
            <Heart className={`h-5 w-5 ${wishlist.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white font-sans font-bold text-[9px] h-4 w-4 rounded-full flex items-center justify-center border border-white">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* User Profile dropdown or Login indicator */}
          {currentUser ? (
            <div className="flex items-center gap-1">
              <button
                id="header-profile-btn"
                onClick={() => onNavigate('account')}
                className="flex items-center gap-1.5 p-1 rounded-full border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left max-w-[120px] truncate"
                title={`${currentUser.name}'s Profile`}
              >
                <div className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-850 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 font-sans">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:block text-xs font-bold text-slate-705 text-slate-700 truncate pr-1">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
              <button
                id="header-logout-btn"
                onClick={onLogout}
                className="hidden xl:block text-[10px] font-bold text-red-500 hover:text-red-700 hover:underline px-1 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={() => onNavigate('login')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 border border-gray-200 hover:border-emerald-600 bg-white hover:bg-emerald-50/50 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Login</span>
            </button>
          )}

          {/* Unified Compact Shopping Cart Toggle */}
          <button
            id="header-cart-toggle"
            onClick={onToggleCart}
            className="bg-emerald-600 text-white flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-emerald-700 active:scale-95 transition-all shadow-sm font-bold text-xs cursor-pointer shrink-0"
          >
            <div className="relative">
              <ShoppingCart className="h-4 w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-yellow-400 text-slate-900 font-sans font-black text-[9px] h-3.5 w-3.5 rounded-full flex items-center justify-center border border-emerald-600 animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="font-semibold select-none">৳{cartPrice.toLocaleString('en-US')}</span>
          </button>
        </div>
      </div>

      {/* Mobile-only Search Bar & Fast Nav (Always in one top bar structure) */}
      <div className="block md:hidden px-4 pb-3.5 pt-1 border-t border-gray-150/15 bg-white">
        <form onSubmit={handleSearchSubmit} className="flex items-center relative">
          <input
            id="mobile-search-input"
            type="text"
            placeholder="Search fresh groceries..."
            className="w-full pl-4 pr-10 py-1.5 rounded-xl border border-gray-200 text-xs bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-none transition-all placeholder-gray-400 shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-3 text-emerald-600 hover:text-emerald-700 p-1 cursor-pointer"
            title="Search"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* Mobile Drawer Overlay Slider Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in bg-black/60 backdrop-blur-xs">
          <div className="w-80 bg-white h-full p-6 space-y-6 flex flex-col justify-between shadow-2xl animate-slide-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-150">
                <span className="font-display font-black text-emerald-600 text-lg">BAZAR THOLE</span>
                <button
                  id="mobile-menu-close"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.value}
                    id={`mobile-nav-${item.value}`}
                    onClick={() => { onNavigate(item.value); onSearch(''); setSearchTerm(''); setMobileMenuOpen(false); }}
                    className={`w-full text-left py-2.5 font-bold uppercase tracking-wider text-xs rounded-xl transition-all ${
                      activeTab === item.value 
                        ? 'text-emerald-700 bg-emerald-50 px-4' 
                        : 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50 px-4'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-3.5 text-xs text-slate-500">
              <button
                onClick={() => { onToggleAdmin(); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-1.5 bg-yellow-400 text-slate-900 py-3 rounded-xl font-bold font-sans tracking-wide active:scale-95 transition-all shadow-md hover:bg-yellow-300 pointer-events-auto cursor-pointer"
              >
                <ShieldAlert className="h-4 w-4" />
                <span>STORE ADMIN PANEL</span>
              </button>
              <div className="text-center text-[11px] font-medium space-y-1">
                <p>Hotline Service Support: <strong className="font-mono text-slate-700">{settings.phone}</strong></p>
                <p className="text-[10px] text-slate-400">Hours: {settings.operatingHours}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
