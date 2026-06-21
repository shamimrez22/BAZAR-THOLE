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

  // Keyboard hotkey '/' to focus search input instantly with high-tech UX
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === '/' && 
        document.activeElement?.tagName !== 'INPUT' && 
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        document.getElementById('header-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    <header className="sticky top-0 z-40 w-full bg-black border-b border-neutral-900 shadow-md">
      {/* ONE UNIFIED TOP BAR THAT CONTAINS SEARCH BAR AND EVERY ESSENTIAL ACTION */}
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 md:gap-4 font-sans">
        
        {/* Left Side: Brand Logo */}
        <div className="flex items-center gap-2 md:gap-6 shrink-0">
          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-2 select-none py-0.5 shrink-0 animate-fade-in">
            {/* The SVG Logo Icon triggers Admin Panel */}
            <div
              id="header-logo-icon"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAdmin();
              }}
              className="cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title="Click to open Admin Panel"
            >
              <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 hover:rotate-6 transition-transform" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Modern Sleek Handle */}
                <path d="M 35 32 C 35 12, 65 12, 65 32" stroke="#F97316" strokeWidth="6.5" strokeLinecap="round" fill="none" />
                {/* Premium Bag Pouch Shadow / Backdrop */}
                <path d="M 22 32 H 78 L 74 80 C 73 85, 68 88, 50 88 C 32 88, 27 85, 26 80 Z" fill="url(#bagGrad)" />
                {/* Highlights / Contrast Overlay */}
                <path d="M 50 32 H 78 L 74 80 C 73 85, 68 88, 50 88 Z" fill="#FFFFFF" fillOpacity="0.08" />
                {/* Symmetrical Geometric Gold/White Organic Emblem (Double Leaf + Star of Quality) */}
                <path d="M 50 42 C 58 42, 62 48, 62 56 C 62 64, 50 66, 50 66 C 50 66, 38 64, 38 56 C 38 48, 42 42, 50 42 Z" fill="#FBBF24" />
                <path d="M 50 42 C 50 42, 44 48, 44 56 C 44 62, 50 66, 50 66 Z" fill="#F59E0B" />
                <path d="M 50 30 L 52 34 L 56 35 L 53 36 L 50 40 L 47 36 L 44 35 L 48 34 Z" fill="#FFFFFF" />
                {/* Rivets */}
                <circle cx="35" cy="32" r="3.5" fill="#E2E8F0" />
                <circle cx="65" cy="32" r="3.5" fill="#E2E8F0" />
                <defs>
                  <radialGradient id="bagGrad" cx="50%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#047857" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            {/* The Text brand name navigates to Home */}
            <div
              id="header-logo-text"
              onClick={() => { onNavigate('home'); onSearch(''); setSearchTerm(''); }}
              className="flex flex-col justify-center text-left leading-none font-sans cursor-pointer hover:opacity-85 active:scale-95 transition-all"
              title="Go to Home"
            >
              <span className="text-[11px] sm:text-[14px] font-black tracking-wide text-[#F97316] uppercase leading-none">BAZAR</span>
              <span className="text-[8px] sm:text-[10px] font-extrabold tracking-[0.16em] text-white uppercase leading-none mt-0.5" style={{ textShadow: "0 0 10px rgba(255,255,255,0.15)" }}>THOLE</span>
            </div>
          </div>

          {/* Inline Navigation Menu (Desktop Only) */}
          <nav className="hidden md:flex items-center gap-0.5 sm:gap-1 border-l border-neutral-800 pl-1.5 md:pl-3 shrink-0 overflow-x-auto no-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.value}
                id={`header-nav-${item.value}`}
                onClick={() => { onNavigate(item.value); onSearch(''); setSearchTerm(''); }}
                className={`text-[9.5px] sm:text-xs font-bold uppercase tracking-wider transition-all py-1.5 px-1.5 sm:px-2.5 rounded-lg hover:bg-slate-900 hover:text-emerald-400 ${
                  activeTab === item.value 
                    ? 'text-emerald-400 font-extrabold bg-slate-900/80' 
                    : 'text-white hover:text-emerald-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Center: Search Box (Highly Unique Premium Interface with Neon Glow Ring for Desktop) */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-xl items-center gap-2 mx-2">
          {/* Input - obsidian dark background with subtle neutral/white border */}
          <input
            id="header-search-input"
            type="text"
            placeholder="Search Bazar Thole..."
            className="flex-1 h-12 pl-4 pr-4 rounded-lg border-2 border-neutral-800 text-xs text-white bg-neutral-950 hover:bg-black hover:border-neutral-700 focus:bg-black focus:border-white focus:ring-4 focus:ring-white/10 transition-all placeholder-neutral-400 shadow-md font-bold uppercase tracking-wider"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {/* Styled Unique Search Action Button - Beautifully styled outside the field */}
          <button
            id="header-search-submit"
            type="submit"
            className="h-12 px-5 text-black bg-white hover:bg-neutral-200 hover:scale-[1.03] active:scale-[0.97] rounded-lg border-2 border-white transition-all flex items-center justify-center cursor-pointer shadow-md"
            title="Search Now"
          >
            <Search className="h-4 w-4 stroke-[3.5]" />
          </button>
        </form>

        {/* Compact Search Box for Mobile (DIRECTLY IN MOBILE TOP BAR) */}
        <form onSubmit={handleSearchSubmit} className="flex md:hidden flex-1 items-center relative max-w-[130px] sm:max-w-xs shadow-sm">
          <input
            id="mobile-search-input-topbar"
            type="text"
            placeholder="Search..."
            className="w-full h-8 pl-2 pr-7 rounded-lg border border-neutral-800 text-[10px] text-white bg-[#111111] focus:bg-black focus:border-[#10B981] transition-all placeholder-neutral-500 font-bold uppercase tracking-wider"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-0.5 text-neutral-400 hover:text-white p-1 cursor-pointer"
            title="Search"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Right Side: Action Utilities */}
        <div className="flex items-center gap-1 sm:gap-3 shrink-0">
          {/* Quick Order Tracking Icon for desktop */}
          <button
            onClick={() => onNavigate('tracking')}
            className={`hidden md:flex p-2 rounded-xl text-white hover:text-emerald-400 hover:bg-slate-900 transition-colors cursor-pointer ${
              activeTab === 'tracking' ? 'text-emerald-400 bg-slate-900' : ''
            }`}
            title="Order Tracking"
          >
            <ClipboardList className="h-5 w-5" />
          </button>

          {/* Wishlist Icon */}
          <button
            id="header-wishlist-view"
            onClick={() => onNavigate('account')}
            className="hidden md:block relative p-2 rounded-xl text-white hover:text-emerald-400 hover:bg-slate-900 transition-colors cursor-pointer"
            title="My Wishlist"
          >
            <Heart className={`h-5 w-5 ${wishlist.length > 0 ? 'text-red-500 fill-red-500' : ''}`} />
            {wishlist.length > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-white font-sans font-bold text-[9px] h-4 w-4 rounded-full flex items-center justify-center border border-slate-950">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* User Profile dropdown or Login indicator - with highly illuminated white/light text */}
          {currentUser ? (
            <div className="flex items-center gap-1 shrink-0">
              <button
                id="header-profile-btn"
                onClick={() => onNavigate('account')}
                className="flex items-center gap-1 p-0.5 sm:p-1 rounded-full border border-neutral-800 hover:border-emerald-500 hover:bg-slate-900 transition-all text-left max-w-[80px] sm:max-w-[120px] truncate"
                title={`${currentUser.name}'s Profile`}
              >
                <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-[10px] sm:text-xs shrink-0 font-sans border border-neutral-800">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-[10.5px] sm:text-xs font-bold text-white truncate pr-1">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>
              <button
                id="header-logout-btn"
                onClick={onLogout}
                className="hidden xl:block text-[10px] font-bold text-red-400 hover:text-red-500 hover:underline px-1 cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              id="header-login-btn"
              onClick={() => onNavigate('login')}
              className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 text-[10.5px] sm:text-xs font-bold text-white hover:text-emerald-400 border border-neutral-0 border-neutral-800 bg-slate-900 hover:bg-slate-800 rounded-lg sm:rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-white" />
              <span>Login</span>
            </button>
          )}

          {/* Unified Shopping Cart Toggle */}
          <button
            id="header-cart-toggle"
            onClick={onToggleCart}
            className="bg-emerald-600 text-white flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl hover:bg-emerald-500 active:scale-95 transition-all shadow-sm font-bold text-[10.5px] sm:text-xs cursor-pointer shrink-0"
          >
            <div className="relative">
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2.5 -right-2 bg-yellow-400 text-slate-900 font-sans font-black text-[8px] h-3.5 w-3.5 rounded-full flex items-center justify-center border border-emerald-600 animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="font-semibold select-none">৳{cartPrice.toLocaleString('en-US')}</span>
          </button>

          {/* Mobile hamburger menu button inside Top Bar Actions */}
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden p-1 px-1.5 text-white hover:text-emerald-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer border border-neutral-800/60"
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu (Popping directly under the sticky bar) */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0c0c0c] border-b border-neutral-900 shadow-2xl animate-fade-in z-50 font-sans">
          <div className="px-4 py-3.5 space-y-2 flex flex-col">
            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest border-b border-neutral-900 pb-1.5 mb-1 block">NAVIGATION MENU</span>
            {navItems.map((item) => (
              <button
                key={item.value}
                id={`mobile-nav-${item.value}`}
                onClick={() => { onNavigate(item.value); onSearch(''); setSearchTerm(''); setMobileMenuOpen(false); }}
                className={`w-full text-left py-2.5 px-3 font-bold uppercase tracking-wider text-[11px] rounded-lg transition-all flex items-center justify-between ${
                  activeTab === item.value 
                    ? 'text-emerald-400 bg-neutral-900' 
                    : 'text-neutral-300 hover:text-emerald-400 hover:bg-neutral-950'
                }`}
              >
                <span>{item.label}</span>
                {activeTab === item.value && (
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                )}
              </button>
            ))}
            
            {/* Additional Contact and Operations info in the dropdown */}
            <div className="border-t border-neutral-900 mt-2 pt-2.5 flex items-center justify-between text-[9px] text-neutral-500 uppercase font-sans">
              <span>SUPPORT: <strong className="font-mono text-neutral-300">{settings.phone}</strong></span>
              <span>{settings.operatingHours}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
