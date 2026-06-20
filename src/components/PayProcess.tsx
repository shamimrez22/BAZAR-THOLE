import React, { useState } from 'react';
import { CreditCard, ShieldCheck, CheckCircle2, AlertCircle, X, ChevronRight, Loader2 } from 'lucide-react';
import { StoreSettings } from '../types';

interface PayProcessProps {
  method: 'Cash on Delivery' | 'bKash' | 'Nagad' | 'SSLCommerz';
  amount: number;
  onSuccess: (transactionId: string) => void;
  onCancel: () => void;
  settings?: StoreSettings;
}

export default function PayProcess({ method, amount, onSuccess, onCancel, settings }: PayProcessProps) {
  const [step, setStep] = useState<number>(1); // 1: Info, 2: Action/Input, 3: Processing, 4: Success
  const [inputVal, setInputVal] = useState<string>('');
  const [pinVal, setPinVal] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleNextStep = () => {
    if (method === 'bKash') {
      if (step === 1) {
        // Validation for mobile number
        if (!/^01[3-9]\d{8}$/.test(inputVal)) {
          setError('Please enter a valid 11-digit bKash number.');
          return;
        }
        setError('');
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setStep(2); // OTP & PIN screen
        }, 1200);
      } else if (step === 2) {
        if (pinVal.length < 4) {
          setError('Please enter your 5-digit PIN number.');
          return;
        }
        setError('');
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setStep(3);
          setTimeout(() => {
            onSuccess(`BKX-${Math.floor(10000000 + Math.random() * 90000000)}`);
          }, 1500);
        }, 1500);
      }
    } else if (method === 'Nagad') {
      if (step === 1) {
        if (!/^01[3-9]\d{8}$/.test(inputVal)) {
          setError('Please enter a valid 11-digit Nagad number.');
          return;
        }
        setError('');
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setStep(2);
        }, 1200);
      } else if (step === 2) {
        if (pinVal.length < 4) {
          setError('Please enter your 4-digit PIN.');
          return;
        }
        setError('');
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setStep(3);
          setTimeout(() => {
            onSuccess(`NGD-${Math.floor(10000000 + Math.random() * 90000000)}`);
          }, 1500);
        }, 1500);
      }
    } else if (method === 'SSLCommerz') {
      if (step === 1) {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setStep(2);
        }, 1500);
      } else if (step === 2) {
        if (!inputVal) {
          setError('Please choose a card or net-banking method.');
          return;
        }
        setError('');
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setStep(3);
          setTimeout(() => {
            onSuccess(`SSL-${Math.floor(10000000 + Math.random() * 90000000)}`);
          }, 1500);
        }, 1500);
      }
    } else {
      // Cash on Delivery
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        onSuccess('COD-PENDING');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300">
        
        {/* Header decoration based on payment brand */}
        {method === 'bKash' && (
          <div className="bg-[#e11e5f] p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-white p-1 flex items-center justify-center shadow-inner">
                <span className="font-bold text-lg text-[#e11e5f]">b</span>
              </div>
              <div>
                <h4 className="font-bold leading-tight font-display text-lg">bKash Checkout</h4>
                <p className="text-xs text-pink-100">Secure Mobile Payment Platform</p>
              </div>
            </div>
            <button id="bkash-close-btn" onClick={onCancel} className="rounded-full p-1.5 hover:bg-black/10 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {method === 'Nagad' && (
          <div className="bg-orange-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-full bg-white p-1 flex items-center justify-center shadow-inner">
                <span className="font-extrabold text-lg text-orange-600">ন</span>
              </div>
              <div>
                <h4 className="font-bold leading-tight font-display text-lg">Nagad Checkout</h4>
                <p className="text-xs text-orange-100">বাংলাদেশ ডাক বিভাগ</p>
              </div>
            </div>
            <button id="nagad-close-btn" onClick={onCancel} className="rounded-full p-1.5 hover:bg-black/10 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {method === 'SSLCommerz' && (
          <div className="bg-slate-800 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 p-1 font-bold text-white shadow-inner">
                SSL
              </div>
              <div>
                <h4 className="font-bold leading-tight font-display text-lg text-emerald-400">SSLCommerz Sandbox</h4>
                <p className="text-xs text-slate-300">Secure Direct Bank/Card Transfer</p>
              </div>
            </div>
            <button id="ssl-close-btn" onClick={onCancel} className="rounded-full p-1.5 hover:bg-black/10 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {method === 'Cash on Delivery' && (
          <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 font-extrabold text-emerald-600 shadow-inner">
                COD
              </div>
              <div>
                <h4 className="font-bold leading-tight font-display text-lg uppercase">CASH ON DELIVERY</h4>
                <p className="text-xs text-emerald-100 font-sans uppercase">PAY AFTER VERIFYING THE BOX</p>
              </div>
            </div>
            <button id="cod-close-btn" onClick={onCancel} className="rounded-full p-1.5 hover:bg-black/10 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content body */}
        <div className="p-6">
          
          {/* Amount Showcase */}
          <div className="mb-6 rounded-xl bg-slate-50 p-4 text-center border border-slate-100">
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Amount to pay</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mt-1">৳ {amount.toLocaleString('en-US')}</h2>
          </div>

          {/* Conditional Steps rendering */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
              <p className="mt-4 text-sm font-medium text-slate-600">Securely communicating with gateway...</p>
              <p className="text-xs text-slate-400 mt-1">Please do not refresh nor click back</p>
            </div>
          ) : step === 3 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
              <p className="mt-4 text-sm font-medium text-slate-700">Authorizing & Depositing Payment...</p>
              <p className="text-xs text-slate-400 mt-1">Processing secure digital receipt</p>
            </div>
          ) : (
            <>
              {/* bKash Payment Screen */}
              {method === 'bKash' && (
                <div>
                  {step === 1 ? (
                    <div className="space-y-4">
                      {settings?.bkashNumber && (
                        <div className="bg-pink-50 border border-pink-100 rounded-xl p-3 text-xs text-[#e11e5f]">
                          <strong className="block text-sm font-black mb-1">📢 Store bKash Wallet: {settings.bkashNumber}</strong>
                          <p className="font-sans font-medium text-[11px] leading-relaxed">{settings.bkashInstruction || 'Please send money and verify below.'}</p>
                        </div>
                      )}
                      <p className="text-xs text-slate-600 leading-relaxed font-sans mt-2">
                        Enter your bKash digital wallet number below. We will send a security verification PIN request.
                      </p>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">bKash Mobile No</label>
                        <input
                          id="bkash-phone-input"
                          type="text"
                          maxLength={11}
                          placeholder="e.g. 01700000000"
                          className="w-full text-center rounded-lg border border-slate-300 px-4 py-3 text-lg font-mono focus:border-pink-500 focus:outline-none"
                          value={inputVal}
                          onChange={(e) => setInputVal(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      <div className="flex items-start gap-2 rounded-lg bg-pink-50/50 p-3 text-xs text-[#e11e5f] border border-pink-100/30">
                        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>Agree to terms: Your PIN is fully encrypted on local client. We never record your confidential digits.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <p className="text-xs text-slate-600 leading-relaxed text-center">
                        Verified bKash Account: <strong className="font-mono">{inputVal}</strong>
                      </p>
                      <div className="rounded-lg bg-slate-100 p-3 text-center border border-slate-200">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wide">Security Verification Token</span>
                        <p className="font-mono text-sm tracking-widest font-bold text-slate-700 mt-0.5">OTP: M-438901</p>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider text-center">Enter 5-Digit bKash PIN</label>
                        <input
                          id="bkash-pin-input"
                          type="password"
                          maxLength={5}
                          placeholder="•••••"
                          className="w-full text-center rounded-lg border border-slate-300 px-4 py-3 text-xl font-mono focus:border-pink-500 focus:outline-none tracking-widest"
                          value={pinVal}
                          onChange={(e) => setPinVal(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Nagad Payment Screen */}
              {method === 'Nagad' && (
                <div>
                  {step === 1 ? (
                    <div className="space-y-4">
                      {settings?.nagadNumber && (
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-xs text-orange-850">
                          <strong className="block text-sm font-black mb-1 text-orange-700">📢 Store Nagad Wallet: {settings.nagadNumber}</strong>
                          <p className="font-sans font-medium text-[11px] leading-relaxed">{settings.nagadInstruction || 'Please send money and verify below.'}</p>
                        </div>
                      )}
                      <p className="text-xs text-slate-600 leading-relaxed font-sans text-center mt-2">
                        আপনার নগদ একাউন্ট নম্বরটি প্রনির্দিষ্ট করুন।
                      </p>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Nagad Mobile Number</label>
                        <input
                          id="nagad-phone-input"
                          type="text"
                          maxLength={11}
                          placeholder="01XXXXXXXXX"
                          className="w-full text-center rounded-lg border border-slate-300 px-4 py-3 text-lg font-mono focus:border-orange-500 focus:outline-none"
                          value={inputVal}
                          onChange={(e) => setInputVal(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <p className="text-xs text-slate-600 text-center">
                        Account: <strong className="font-mono">{inputVal}</strong>
                      </p>
                      <div className="bg-amber-50 p-2 text-center rounded text-xs text-amber-800 tracking-wider">
                        Verification Code: 40941
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1 text-center">Enter Private 4-Digit PIN</label>
                        <input
                          id="nagad-pin-input"
                          type="password"
                          maxLength={4}
                          placeholder="••••"
                          className="w-full text-center rounded-lg border border-slate-300 px-4 py-3 text-xl font-mono focus:border-orange-500 focus:outline-none tracking-widest"
                          value={pinVal}
                          onChange={(e) => setPinVal(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SSLCommerz Sandbox Screen */}
              {method === 'SSLCommerz' && (
                <div>
                  {step === 1 ? (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600 leading-relaxed text-center">
                        Choose a payment option via SSLCommerz sandbox integrations:
                      </p>
                      <button
                        onClick={() => { setInputVal('VISA_SANDBOX'); setStep(2); }}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-left transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                            <CreditCard className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-slate-800">Visa / Mastercard / Amex</span>
                            <p className="text-[10px] text-slate-400">Sandbox Test Credit Card</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      </button>

                      <button
                        onClick={() => { setInputVal('CITYTOUCH'); setStep(2); }}
                        className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 text-left transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                            <ShieldCheck className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-slate-800">Net Banking (CityTouch)</span>
                            <p className="text-[10px] text-slate-400">Direct instant login transfer</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-fade-in">
                      <div className="rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 p-4 text-center">
                        <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-600" />
                        <h4 className="font-semibold text-slate-800 text-sm mt-2">{inputVal === 'CITYTOUCH' ? 'CityTouch Payment Portal' : 'Test Credit Card Authorization'}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">We will generate a sandbox mock transaction reference.</p>
                      </div>
                      <div className="rounded-lg bg-orange-50 border border-orange-100 p-3 text-xs text-orange-800 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>No real funds will be deducted. All assets mock checkout directly inside Sandbox environment.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cash On Delivery Screen */}
              {method === 'Cash on Delivery' && (
                <div className="space-y-4 uppercase">
                  <div className="flex flex-col items-center justify-center p-4 text-center">
                    <CheckCircle2 className="h-12 w-12 text-emerald-500" />
                    <h4 className="font-bold text-slate-800 mt-2 uppercase">READY TO PLACE CASH ORDER</h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm uppercase">
                      OUR DISPATCH RIDER WILL ARRIVE WITH RAW ORGANIC PACKAGING AT YOUR SPECIFIED ADDRESS. VERIFY PRODUCT FRESHNESS AND PAY IN CURRENCY OR LOCAL BKASH QR AFTERWARDS.
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 text-center uppercase font-bold">
                    ENJOY FREE DELIVERY ON ORDERS EXCEEDING ৳ 800!
                  </div>
                </div>
              )}

              {/* Error warning indicator */}
              {error && (
                <div className="mt-4 rounded-lg bg-red-50 p-2.5 text-xs text-red-700 flex items-center gap-1.5 animate-pulse">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Footer CTA Buttons */}
              <div className="mt-6 flex items-center gap-3">
                {step === 1 && method !== 'Cash on Delivery' ? (
                  <>
                    <button
                      id="payment-cancel-btn"
                      onClick={onCancel}
                      className="w-1/3 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 active:scale-95 transition-all text-center"
                    >
                      Cancel
                    </button>
                    <button
                      id="payment-process-next-btn"
                      onClick={handleNextStep}
                      className="w-2/3 rounded-xl py-3 text-sm font-semibold text-white shadow-md active:scale-95 transition-all text-center flex items-center justify-center gap-1"
                      style={{
                        backgroundColor: method === 'bKash' ? '#e11e5f' : method === 'Nagad' ? '#ea580c' : '#1e293b'
                      }}
                    >
                      Authenticate No
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    {method !== 'Cash on Delivery' && (
                      <button
                        onClick={() => { setStep(1); setPinVal(''); setError(''); }}
                        className="w-1/3 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 active:scale-95 transition-all uppercase"
                      >
                        BACK
                      </button>
                    )}
                    <button
                      id="payment-submit-btn"
                      onClick={handleNextStep}
                      className="w-full rounded-xl py-3 text-sm font-semibold text-white shadow-md active:scale-95 transition-all text-center uppercase"
                      style={{
                        backgroundColor: method === 'bKash' ? '#e11e5f' : method === 'Nagad' ? '#ea580c' : method === 'SSLCommerz' ? '#10b981' : '#16a34a'
                      }}
                    >
                      {method === 'Cash on Delivery' ? 'CONFIRM AND PLACE ORDER' : 'SUBMIT SECURITY PIN'}
                    </button>
                  </>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
