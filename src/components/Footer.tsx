import React from 'react';
import { 
  Mail, Phone, MapPin, Clock, ShieldCheck, Heart, Truck, Undo2, Award,
  Facebook, Twitter, Instagram, Youtube, Linkedin, Globe 
} from 'lucide-react';
import { StoreSettings } from '../types';

interface FooterProps {
  settings: StoreSettings;
  onNavigate: (tab: string) => void;
}

export default function Footer({ settings, onNavigate }: FooterProps) {
  // Helper to map dynamic social labels from settings into lucide icons
  const getSocialIcon = (label: string) => {
    const cleanLabel = label.toLowerCase();
    if (cleanLabel.includes('fb') || cleanLabel.includes('facebook')) return <Facebook className="h-4.5 w-4.5" />;
    if (cleanLabel.includes('tw') || cleanLabel.includes('twitter') || cleanLabel.includes('x')) return <Twitter className="h-4.5 w-4.5" />;
    if (cleanLabel.includes('ig') || cleanLabel.includes('instagram')) return <Instagram className="h-4.5 w-4.5" />;
    if (cleanLabel.includes('yt') || cleanLabel.includes('youtube')) return <Youtube className="h-4.5 w-4.5" />;
    if (cleanLabel.includes('li') || cleanLabel.includes('linkedin')) return <Linkedin className="h-4.5 w-4.5" />;
    return <Globe className="h-4.5 w-4.5" />;
  };

  return (
    <footer className="bg-slate-950 text-gray-300 font-sans border-t-4 border-orange-500">
      
      {/* Middle main columns layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column A: Company and general values */}
          <div className="space-y-5">
            <div className="flex items-center gap-2 select-none">
              <svg className="w-9 h-9 shrink-0 hover:scale-105 transition-transform" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <path d="M 23 58 H 32 L 38 78 M 32 64 H 74 L 78 58 H 32" stroke="#FFFFFF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <circle cx="43" cy="83" r="5.5" fill="#FFFFFF" />
                <circle cx="67" cy="83" r="5.5" fill="#FFFFFF" />
                
                {/* Cargo Boxes inside Cart */}
                <rect x="36" y="50" width="8" height="13" rx="1.5" fill="#84CC16" />
                <rect x="47" y="44" width="8" height="19" rx="1.5" fill="#F97316" />
                <rect x="58" y="49" width="8" height="14" rx="1.5" fill="#EF4444" />
              </svg>

              <div className="flex flex-col justify-center text-left leading-none font-sans">
                <span className="text-[16px] font-black tracking-wide text-[#F97316] uppercase leading-none">BAZAR</span>
                <span className="text-[13px] font-extrabold tracking-[0.16em] text-white uppercase leading-none mt-0.5">THOLE</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              BAZAR THOLE is Bangladesh's trusted omni-channel e-commerce hub. We bring you premium quality products across fashion, electronics, health & beauty, daily groceries, and lifestyle essentials directly to your doorstep with guaranteed authenticity.
            </p>

            <div className="space-y-2.5 pt-1 text-xs text-gray-450 border-t border-slate-900">
              <span className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{settings.address}</span>
              </span>
              <span className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-mono">{settings.email}</span>
              </span>
              <span className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="font-mono">{settings.phone}</span>
              </span>
            </div>

            {/* Dynamic Social Media controlled from the Settings Form */}
            {settings.socialLinksExpanded && settings.socialLinksExpanded.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-2.5">FOLLOW OUR CODES</span>
                <div className="flex flex-wrap gap-2">
                  {settings.socialLinksExpanded.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.label}
                      className="h-8.5 w-8.5 bg-slate-900 hover:bg-emerald-600 hover:text-white text-gray-400 rounded-xl flex items-center justify-center transition-all hover:scale-105 border border-slate-800 hover:border-emerald-500 cursor-pointer"
                    >
                      {getSocialIcon(item.label)}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Column B: Store Guarantees (Beautifully styled replacement for Categories) */}
          <div className="space-y-4">
            <h4 className="font-bold font-display text-white text-sm tracking-wider uppercase border-b border-slate-900 pb-2">SHOP WITH CONFIDENCE</h4>
            <div className="space-y-3.5 pt-1.5">
              
              <div className="flex gap-3 items-start group">
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/40 text-emerald-450 shrink-0 transition-colors group-hover:bg-emerald-900/60 group-hover:text-emerald-400">
                  <Truck className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-200 text-xs">Express Home Delivery</h5>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">Super fast door-to-door shipping option across all 64 districts of Bangladesh.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start group">
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/40 text-emerald-450 shrink-0 transition-colors group-hover:bg-emerald-900/60 group-hover:text-emerald-400">
                  <Undo2 className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-200 text-xs">Easy Return Security</h5>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">Stress-free refund options if packaging is untampered or item varies from specifications.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start group">
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/40 text-emerald-450 shrink-0 transition-colors group-hover:bg-emerald-900/60 group-hover:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-200 text-xs">100% Verified Quality</h5>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">Every dispatch has passed strict grading benchmarks to match premium standards.</p>
                </div>
              </div>

              <div className="flex gap-3 items-start group">
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-emerald-900/40 text-emerald-450 shrink-0 transition-colors group-hover:bg-emerald-900/60 group-hover:text-emerald-400">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h5 className="font-bold text-gray-200 text-xs">Genuine Products Only</h5>
                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">Zero counterfeits. We source directly from brands, major suppliers, or farmers.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Column C: Help & Account info */}
          <div className="space-y-4">
            <h4 className="font-bold font-display text-white text-sm tracking-wider uppercase border-b border-slate-900 pb-2">USEFUL HYPERLINKS</h4>
            <ul className="space-y-2.5 pt-1.5 text-xs text-gray-400 font-sans">
              <li>
                <button onClick={() => onNavigate('tracking')} className="hover:text-emerald-450 hover:underline transition-colors block text-left w-full cursor-pointer py-0.5">Order Tracking System</button>
              </li>
              <li>
                <button onClick={() => onNavigate('account')} className="hover:text-emerald-450 hover:underline transition-colors block text-left w-full cursor-pointer py-0.5">My Profile Portal</button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-emerald-450 hover:underline transition-colors block text-left w-full cursor-pointer py-0.5">Company Story & Principles</button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-emerald-450 hover:underline transition-colors block text-left w-full cursor-pointer py-0.5">Get In Touch / Support Desk</button>
              </li>
            </ul>
          </div>

          {/* Column D: Timing & Payment visual display */}
          <div className="space-y-5">
            <h4 className="font-bold font-display text-white text-sm tracking-wider uppercase border-b border-slate-900 pb-2">DELIVERY OPERATIONAL TIMING</h4>
            <div className="flex items-start gap-2.5 text-xs bg-slate-900 p-4 rounded-xl border border-slate-800 leading-relaxed text-gray-300">
              <Clock className="h-4.5 w-4.5 text-emerald-450 shrink-0 mt-0.5" />
              <span>We deliver everyday dispatch orders from <strong className="text-emerald-400 font-mono block mt-1">{settings.operatingHours}</strong></span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-550 uppercase block tracking-wider">AUTHORIZED SYSTEMS & GATEWAYS</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="px-2.5 py-1 rounded-lg bg-pink-700/90 text-white font-mono text-[9px] font-black tracking-tighter shadow-sm border border-pink-600/30">bKash</span>
                <span className="px-2.5 py-1 rounded-lg bg-orange-600/95 text-white font-sans text-[9px] font-black shadow-sm border border-orange-500/30">Nagad</span>
                <span className="px-2.5 py-1 rounded-lg bg-teal-800 text-white font-mono text-[9px] font-black tracking-tighter shadow-sm border border-emerald-750">SSLCommerz</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-150 text-[9px] font-bold shadow-sm border border-slate-700">COD</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Lower Copyright Row */}
      <div className="bg-slate-990 text-gray-500 text-xs py-5 px-4 sm:px-8 border-t border-slate-900 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© 2026 BAZAR THOLE E-commerce Limited (bazarthole.com.bd). Sourced farm fresh across Bangladesh.</p>
          <p className="flex items-center gap-1 justify-center text-[10px] text-gray-600">
            <span>Powered by dynamic inventory and authentic item management values</span>
            <Heart className="h-2.5 w-2.5 text-red-650 fill-red-650" />
          </p>
        </div>
      </div>

    </footer>
  );
}
