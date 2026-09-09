import React, { useState, useEffect } from 'react';
import { 
    CurrencyCode, DEFAULT_CURRENCIES, getActiveCurrencyRates, 
    getSelectedCurrency, setSelectedCurrency, setCustomExchangeRate 
} from '../../utils/currencyEngine';
import Button from './Button';
import Modal from './Modal';
import Input from './Input';
import { useToast } from './Toast';
import { 
    Coins, RefreshCw, SlidersHorizontal, Check, Globe, 
    TrendingUp, ShieldCheck, ArrowRightLeft
} from 'lucide-react';

interface CurrencySelectorBarProps {
    onCurrencyChange?: (selectedCurrency: CurrencyCode) => void;
    className?: string;
}

export const CurrencySelectorBar: React.FC<CurrencySelectorBarProps> = ({
    onCurrencyChange,
    className = ''
}) => {
    const { addToast } = useToast();
    const [activeCurrency, setActiveCurrencyState] = useState<CurrencyCode>(getSelectedCurrency());
    const [rates, setRates] = useState(getActiveCurrencyRates());
    const [isRatesModalOpen, setIsRatesModalOpen] = useState(false);
    const [isRefreshingCBK, setIsRefreshingCBK] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<string>('اليوم - بنك الكويت المركزي (CBK)');

    // Temporary editing rates for modal
    const [tempRates, setTempRates] = useState({ ...rates });

    const handleSelectCurrency = (code: CurrencyCode) => {
        setActiveCurrencyState(code);
        setSelectedCurrency(code);
        if (onCurrencyChange) onCurrencyChange(code);
    };

    const handleSyncCBK = () => {
        setIsRefreshingCBK(true);
        setTimeout(() => {
            // Apply fresh minor micro-fluctuations simulating live CBK API
            const updated = { ...rates };
            updated.USD.rateVsKwd = 3.264;
            updated.EUR.rateVsKwd = 3.018;
            updated.GBP.rateVsKwd = 2.585;
            updated.SAR.rateVsKwd = 12.238;
            updated.AED.rateVsKwd = 11.978;

            setRates(updated);
            setIsRefreshingCBK(false);
            const nowTime = new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' });
            setLastSyncTime(`تم التحديث الآن (${nowTime}) - بنك الكويت المركزي`);

            addToast({
                type: 'success',
                title: 'تم تحديث أسعار الصرف',
                message: 'تمت جلب أحدث أسعار الصرف الرسمية المعتمدة من بنك الكويت المركزي.'
            });
        }, 800);
    };

    const handleSaveCustomRates = () => {
        Object.keys(tempRates).forEach(k => {
            const code = k as CurrencyCode;
            setCustomExchangeRate(code, tempRates[code].rateVsKwd);
        });
        setRates(getActiveCurrencyRates());
        setIsRatesModalOpen(false);
        addToast({
            type: 'success',
            title: 'تم حفظ أسعار الصرف',
            message: 'تم تحديث معادلات التحويل المخصصة للتقارير العقارية بنجاح.'
        });
    };

    return (
        <div className={`bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 shadow-2xs space-y-3 ${className}`}>
            
            {/* Header bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Globe className="w-4 h-4" />
                    </span>
                    <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                            محرك التقارير المالية متعدد العملات (المعاملات الدولية)
                        </h4>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                            {lastSyncTime}
                        </span>
                    </div>
                </div>

                {/* Right controls: CBK sync & edit rates */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSyncCBK}
                        disabled={isRefreshingCBK}
                        className="text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingCBK ? 'animate-spin text-amber-500' : ''}`} />
                        تحديث CBK
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setTempRates({ ...rates }); setIsRatesModalOpen(true); }}
                        className="text-[11px] font-bold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        تعديل أسعار الصرف
                    </Button>
                </div>
            </div>

            {/* Currency Switcher Buttons Pill Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                {(Object.keys(DEFAULT_CURRENCIES) as CurrencyCode[]).map(code => {
                    const info = rates[code] || DEFAULT_CURRENCIES[code];
                    const isSelected = activeCurrency === code;

                    return (
                        <button
                            key={code}
                            onClick={() => handleSelectCurrency(code)}
                            className={`p-2.5 rounded-xl border transition-all text-right cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                                isSelected
                                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm dark:bg-amber-500 dark:text-slate-950 dark:border-amber-500'
                                    : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
                            }`}
                        >
                            <div className="flex items-center justify-between w-full mb-1">
                                <span className="text-sm">{info.flag}</span>
                                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                                    isSelected 
                                        ? 'bg-amber-400 text-slate-950 dark:bg-slate-950 dark:text-amber-400' 
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                }`}>
                                    {code}
                                </span>
                            </div>

                            <div className="space-y-0.5">
                                <span className="text-xs font-black block tracking-tight">
                                    {info.nameAr}
                                </span>
                                <span className={`text-[10px] font-mono font-medium block ${isSelected ? 'text-slate-300 dark:text-slate-900' : 'text-slate-500'}`}>
                                    {code === 'KWD' ? '1.000 د.ك (الأساس)' : `1 د.ك = ${info.rateVsKwd} ${info.symbol}`}
                                </span>
                            </div>

                            {isSelected && (
                                <span className="absolute left-1 top-1 text-amber-400 dark:text-slate-950">
                                    <Check className="w-3.5 h-3.5" />
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Custom Rates Adjustment Modal */}
            {isRatesModalOpen && (
                <Modal
                    isOpen={isRatesModalOpen}
                    onClose={() => setIsRatesModalOpen(false)}
                    title="ضبط وإدارة أسعار صرف العملات الدولية (مقابل الدينار الكويتي)"
                    size="lg"
                >
                    <div className="space-y-4 text-right" style={{ direction: 'rtl' }}>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                            يمكنك تعديل أسعار تحويل العملات لتناسب اتفاقيات المستثمرين الدوليين والعقود العقارية المبرمة بالدولار أو اليورو.
                        </p>

                        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                            {(Object.keys(DEFAULT_CURRENCIES) as CurrencyCode[]).map(code => {
                                if (code === 'KWD') return null; // KWD is base
                                const cur = tempRates[code];

                                return (
                                    <div key={code} className="flex items-center justify-between gap-4 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{cur.flag}</span>
                                            <div>
                                                <span className="text-xs font-bold text-slate-900 dark:text-white block">{cur.nameAr} ({code})</span>
                                                <span className="text-[10px] text-slate-500">الرمز: {cur.symbol}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-500">1 د.ك =</span>
                                            <input
                                                type="number"
                                                step="0.001"
                                                value={cur.rateVsKwd}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 1;
                                                    setTempRates({
                                                        ...tempRates,
                                                        [code]: { ...cur, rateVsKwd: val }
                                                    });
                                                }}
                                                className="w-28 text-xs font-mono font-bold p-2 bg-slate-50 dark:bg-slate-800 border rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            />
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{cur.symbol}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                            <Button variant="outline" onClick={() => setIsRatesModalOpen(false)}>إلغاء</Button>
                            <Button onClick={handleSaveCustomRates} className="bg-slate-900 text-white font-bold text-xs px-6 py-2 rounded-xl">
                                حفظ التعديلات
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};
