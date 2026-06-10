import React, { useState, useRef, useEffect } from 'react';
import { Search, Check, Globe } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

const CURRENCIES = [
  { code: 'USD', flag: '🇺🇸', name: 'US Dollar' },
  { code: 'INR', flag: '🇮🇳', name: 'Indian Rupee' },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro' },
  { code: 'GBP', flag: '🇬🇧', name: 'British Pound' },
  { code: 'JPY', flag: '🇯🇵', name: 'Japanese Yen' },
  { code: 'CAD', flag: '🇨🇦', name: 'Canadian Dollar' },
  { code: 'AUD', flag: '🇦🇺', name: 'Australian Dollar' },
  { code: 'SGD', flag: '🇸🇬', name: 'Singapore Dollar' },
];

export default function CurrencySelector() {
  const { currency, setPreferredCurrency } = useFinance();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearchTerm] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const dropdownRef = useRef(null);

  const selectedCurrency = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCurrencies = CURRENCIES.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (code) => {
    if (code === currency) {
      setIsOpen(false);
      return;
    }
    
    setIsUpdating(true);
    await setPreferredCurrency(code);
    setIsUpdating(false);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all duration-200 ${
          isOpen 
            ? 'bg-white/[0.06] border-indigo-500/30 text-indigo-400' 
            : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.06] hover:text-slate-200'
        } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label="Select currency"
      >
        <span className="text-sm leading-none">{selectedCurrency.flag}</span>
        <span className="text-[11px] font-semibold tracking-wider font-mono uppercase">{selectedCurrency.code}</span>
      </button>

      <div
        className={`absolute right-0 mt-2 w-64 z-[100] bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden transform origin-top-right transition-all duration-200 ease-out flex flex-col ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="p-3 border-b border-white/[0.06] bg-slate-900/95 backdrop-blur-xl sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search currency..."
              value={search}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/20 transition-all"
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[280px] custom-scrollbar py-2">
          {filteredCurrencies.length === 0 ? (
            <div className="px-4 py-3 text-center text-xs text-slate-500">No currencies found</div>
          ) : (
            filteredCurrencies.map((c) => {
              const isSelected = c.code === currency;
              return (
                <button
                  key={c.code}
                  onClick={() => handleSelect(c.code)}
                  className={`w-full flex items-center justify-between px-4 py-2 hover:bg-white/[0.04] transition-colors ${
                    isSelected ? 'bg-indigo-500/[0.05]' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-base leading-none">{c.flag}</span>
                    <div className="text-left">
                      <p className={`text-[13px] font-medium ${isSelected ? 'text-indigo-400' : 'text-slate-200'}`}>
                        {c.code}
                      </p>
                      <p className="text-[10px] text-slate-500">{c.name}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
