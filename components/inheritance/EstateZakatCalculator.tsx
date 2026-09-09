import React, { useState, useMemo } from 'react';
import { 
    Coins, 
    Calendar, 
    Scale, 
    CheckCircle2, 
    AlertCircle, 
    ArrowRight, 
    HelpCircle, 
    Printer, 
    Download, 
    Sparkles, 
    Calculator, 
    ShieldCheck, 
    Info, 
    Building, 
    Wallet, 
    BadgePercent, 
    Clock, 
    ChevronDown, 
    ChevronUp 
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { EstateAssets, EstateDeductions } from '../../services/inheritanceEngine';
import { useToast } from '../ui/Toast';

interface Props {
    estateAssets: EstateAssets;
    estateDeductions: EstateDeductions;
    deceasedName?: string;
    onApplyZakatToDeductions: (zakatAmount: number) => void;
    onBackToCalculator: () => void;
}

export const EstateZakatCalculator: React.FC<Props> = ({
    estateAssets,
    estateDeductions,
    deceasedName = 'المورث',
    onApplyZakatToDeductions,
    onBackToCalculator
}) => {
    const { addToast } = useToast();

    // --- Zakat Parameters State ---
    // Standard Kuwait gold price per gram for 24K (default ~24.500 KWD)
    const [goldPricePerGram, setGoldPricePerGram] = useState<number>(24.500);
    // Standard silver price per gram (default ~0.320 KWD)
    const [silverPricePerGram, setSilverPricePerGram] = useState<number>(0.320);
    // Nisab standard: 'gold' (85g) or 'silver' (595g) - Kuwait Zakat House uses Gold for cash/wealth
    const [nisabStandard, setNisabStandard] = useState<'gold' | 'silver'>('gold');

    // Calendar standard: Hijri (2.5% = 1/40) or Gregorian (2.577% accounting for 11 extra days)
    const [calendarType, setCalendarType] = useState<'hijri' | 'gregorian'>('hijri');

    // Number of overdue years (الحول - هل مرت سنة واحدة أم سنوات لم تؤد زكاتها)
    const [overdueYears, setOverdueYears] = useState<number>(1);
    const [isHawlCompleted, setIsHawlCompleted] = useState<boolean>(true);

    // Asset Inclusions / Overrides
    const [includeCash, setIncludeCash] = useState<boolean>(true);
    const [includeStocks, setIncludeStocks] = useState<boolean>(true);
    // For stocks: are they for trading (100% market value) or dividend/fixed (only dividends/net liquid)?
    const [stocksZakatMode, setStocksZakatMode] = useState<'trading' | 'dividend'>('trading');
    const [dividendYieldPercent, setDividendYieldPercent] = useState<number>(10); // if dividend only

    const [includeJewelryGold, setIncludeJewelryGold] = useState<boolean>(true);
    // Gold intended for saving/trade vs personal lawful usage (حلي الاستعمال الشخصي معفي)
    const [jewelryZakatRate, setJewelryZakatRate] = useState<number>(100); // 100% or percentage for investment

    const [includeReceivables, setIncludeReceivables] = useState<boolean>(true); // الديون المرجوة
    const [includeBusinessLicenses, setIncludeBusinessLicenses] = useState<boolean>(true); // عروض التجارة

    // Real Estate: Is it commercial/for sale (subject to zakat) or rented (zakat on rent only)?
    const [realEstateMode, setRealEstateMode] = useState<'exempt' | 'trading' | 'rental'>('exempt');
    const [rentalYieldAmount, setRentalYieldAmount] = useState<number>(0);

    // Deductions from Zakatable Base
    const [deductImmediateDebts, setDeductImmediateDebts] = useState<boolean>(true);
    const [showFatwaDetails, setShowFatwaDetails] = useState<boolean>(false);

    // --- Computations ---
    // 1. Nisab calculation in KWD
    const nisabThreshold = useMemo(() => {
        if (nisabStandard === 'gold') {
            return 85 * goldPricePerGram; // 85g 24K
        } else {
            return 595 * silverPricePerGram; // 595g Pure Silver
        }
    }, [nisabStandard, goldPricePerGram, silverPricePerGram]);

    // 2. Effective Zakat Rate
    const zakatRate = useMemo(() => {
        return calendarType === 'hijri' ? 0.025 : 0.02577;
    }, [calendarType]);

    // 3. Itemized Zakatable Assets
    const zakatableItems = useMemo(() => {
        const items: Array<{ id: string; name: string; originalVal: number; zakatableVal: number; note: string }> = [];

        // Cash & bank accounts
        if (includeCash && (estateAssets.cash || 0) > 0) {
            items.push({
                id: 'cash',
                name: 'السيولة النقدية والودائع المصرفية',
                originalVal: estateAssets.cash || 0,
                zakatableVal: estateAssets.cash || 0,
                note: 'تزكى بالكامل لكونها عيناً نقدية سائلة.'
            });
        }

        // Stocks & funds
        if (includeStocks && (estateAssets.stocks || 0) > 0) {
            const rawStocks = estateAssets.stocks || 0;
            const zakatableStocks = stocksZakatMode === 'trading' 
                ? rawStocks 
                : (rawStocks * (dividendYieldPercent / 100));
            items.push({
                id: 'stocks',
                name: `الأسهم والمحافظ الاستثمارية (${stocksZakatMode === 'trading' ? 'مضاربة وتجارة' : 'استثمار طويل وعائد'})`,
                originalVal: rawStocks,
                zakatableVal: zakatableStocks,
                note: stocksZakatMode === 'trading' 
                    ? 'تزكى بالقيمة السوقية يوم الوفاة.' 
                    : `تزكى نسبة الأرباح والموجودات الزكوية (${dividendYieldPercent}%).`
            });
        }

        // Jewelry & Gold
        if (includeJewelryGold && (estateAssets.jewelry || 0) > 0) {
            const rawJewelry = estateAssets.jewelry || 0;
            const zakatableJewelry = rawJewelry * (jewelryZakatRate / 100);
            items.push({
                id: 'jewelry',
                name: 'الذهب والسبائك والمجوهرات الاستثمارية',
                originalVal: rawJewelry,
                zakatableVal: zakatableJewelry,
                note: jewelryZakatRate === 100 ? 'سبائك وذهب مدخر يزكى بالكامل.' : `مخصص استثماري بنسبة ${jewelryZakatRate}%.`
            });
        }

        // Receivables (الديون المرجوة)
        if (includeReceivables && (estateAssets.receivables || 0) > 0) {
            items.push({
                id: 'receivables',
                name: 'الديون المرجوة وحقوق الذمم المدينة',
                originalVal: estateAssets.receivables || 0,
                zakatableVal: estateAssets.receivables || 0,
                note: 'دين على مقر مليء يرجى سداده يزكيه الدائن لسنة واحدة.'
            });
        }

        // Business Licenses / Companies / Stock inventory
        if (includeBusinessLicenses && (estateAssets.businessLicenses || 0) > 0) {
            items.push({
                id: 'business',
                name: 'عروض التجارة والشركات والبضائع المعدة للبيع',
                originalVal: estateAssets.businessLicenses || 0,
                zakatableVal: estateAssets.businessLicenses || 0,
                note: 'تقوم بسعر السوق (جملة) يوم حلول الحول.'
            });
        }

        // Real Estate based on classification
        if (estateAssets.realEstate && estateAssets.realEstate > 0) {
            if (realEstateMode === 'trading') {
                items.push({
                    id: 'realEstate_trading',
                    name: 'عقارات وأراضٍ معدة للبيع والتجارة (عروض تجارة)',
                    originalVal: estateAssets.realEstate,
                    zakatableVal: estateAssets.realEstate,
                    note: 'تزكى بكامل قيمتها السوقية إن كانت معروضة للمضاربة.'
                });
            } else if (realEstateMode === 'rental' && rentalYieldAmount > 0) {
                items.push({
                    id: 'realEstate_rental',
                    name: 'ريع وإيجارات العقارات المستغلة',
                    originalVal: estateAssets.realEstate,
                    zakatableVal: rentalYieldAmount,
                    note: 'العين معفية، والزكاة في الريع الصافي المستلم وحال عليه الحول.'
                });
            }
        }

        return items;
    }, [
        estateAssets,
        includeCash,
        includeStocks,
        stocksZakatMode,
        dividendYieldPercent,
        includeJewelryGold,
        jewelryZakatRate,
        includeReceivables,
        includeBusinessLicenses,
        realEstateMode,
        rentalYieldAmount
    ]);

    // Gross Zakatable Assets Total
    const grossZakatableWealth = useMemo(() => {
        return zakatableItems.reduce((acc, item) => acc + item.zakatableVal, 0);
    }, [zakatableItems]);

    // Deductible Debts
    const applicableDeductions = useMemo(() => {
        if (!deductImmediateDebts) return 0;
        return (estateDeductions.securedDebts || 0) + (estateDeductions.unsecuredDebts || 0);
    }, [deductImmediateDebts, estateDeductions]);

    // Net Zakatable Base
    const netZakatableBase = useMemo(() => {
        return Math.max(0, grossZakatableWealth - applicableDeductions);
    }, [grossZakatableWealth, applicableDeductions]);

    // Is Nisab Reached?
    const isNisabReached = useMemo(() => {
        return netZakatableBase >= nisabThreshold;
    }, [netZakatableBase, nisabThreshold]);

    // Total Zakat Due
    const totalZakatDue = useMemo(() => {
        if (!isHawlCompleted || !isNisabReached) return 0;
        return netZakatableBase * zakatRate * Math.max(1, overdueYears);
    }, [isHawlCompleted, isNisabReached, netZakatableBase, zakatRate, overdueYears]);

    const handleApplyToEstate = () => {
        if (totalZakatDue <= 0) {
            addToast({ 
                type: 'warning', 
                title: 'لا توجد زكاة واجبة', 
                message: 'مبلغ الزكاة المحسوب صفر؛ إما لعدم بلوغ النصاب أو عدم استيفاء الحول.' 
            });
            return;
        }
        onApplyZakatToDeductions(totalZakatDue);
        addToast({
            type: 'success',
            title: 'تم إدراج الزكاة في التركة',
            message: `تم قيد مبلغ (${totalZakatDue.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك) كدين شرعي في تصفية التركة طبقاً للمادة (289).`
        });
        onBackToCalculator();
    };

    return (
        <div className="space-y-6">
            {/* Header / Intro Banner */}
            <div className="bg-gradient-to-r from-[#0F2744] via-[#0A1C30] to-[#0F2744] p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/40 shadow-xl text-white relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-pulse"></span>
                            <span className="text-[11px] font-black uppercase text-[#D4AF37] tracking-wider">
                                منظومة احتساب زكاة التركة الشرعية والقضائية
                            </span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                            <Coins className="w-7 h-7 text-[#D4AF37]" />
                            <span>تصفية زكاة تركة المرحوم: {deceasedName}</span>
                        </h3>
                        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                            طبقاً للمادة (289) من قانون الأحوال الشخصية الكويتي وفتاوى بيت الزكاة الكويتي وهيئة كبار العلماء، 
                            فإن الزكاة المستحقة في ذمة المتوفى تُعد ديناً شرعياً لله تعالى يُستقطع ويُسدد من أصل التركة قبل تنفيذ الوصايا وقبل قسمة المواريث.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={onBackToCalculator}
                            variant="outline"
                            className="text-xs font-black border-slate-600 bg-slate-800/80 text-white hover:bg-slate-700 rounded-xl cursor-pointer"
                        >
                            <ArrowRight className="w-3.5 h-3.5 me-1.5" />
                            العودة للحاسبة
                        </Button>
                    </div>
                </div>

                {/* KPI Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/80 text-xs font-mono">
                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-sans">قيمة النصاب الشرعي</span>
                        <span className="font-bold text-[#D4AF37] text-sm sm:text-base">
                            {nisabThreshold.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                        </span>
                        <span className="text-[9px] text-slate-400 font-sans block mt-0.5">
                            ({nisabStandard === 'gold' ? '85 جرام ذهب 24' : '595 جرام فضة'})
                        </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-sans">الوعاء الزكوي الصافي</span>
                        <span className="font-bold text-white text-sm sm:text-base">
                            {netZakatableBase.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                        </span>
                        <span className="text-[9px] text-emerald-400 font-sans block mt-0.5">
                            {isNisabReached ? '✓ تجاوز النصاب الشرعي' : '✗ لم يبلغ النصاب'}
                        </span>
                    </div>

                    <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                        <span className="text-[10px] text-slate-400 block font-sans">سعر النسبة المعتمدة</span>
                        <span className="font-bold text-amber-300 text-sm sm:text-base">
                            {(zakatRate * 100).toFixed(3)}%
                        </span>
                        <span className="text-[9px] text-slate-400 font-sans block mt-0.5">
                            (سنة {calendarType === 'hijri' ? 'هجرية قمرية' : 'ميلادية شمسية'})
                        </span>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-xl border border-[#D4AF37]/50 shadow-inner">
                        <span className="text-[10px] text-[#D4AF37] block font-sans font-bold">الزكاة الشرعية الواجبة</span>
                        <span className="font-black text-emerald-400 text-base sm:text-lg">
                            {totalZakatDue.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
                            <span className="text-xs font-sans text-slate-300">د.ك</span>
                        </span>
                        <span className="text-[9px] text-slate-300 font-sans block mt-0.5">
                            دين واجب السداد فوراً
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Interactive Controls Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left/Middle Column (2 cols): Settings & Zakatable Asset Items */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Parameters Card */}
                    <Card className="p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-card bg-white dark:bg-[#132742] rounded-2xl">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2 mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <Scale className="w-4 h-4 text-[#D4AF37]" />
                            ضوابط النصاب والحول والتقويم المعتمدة بدولة الكويت
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            {/* Nisab Basis */}
                            <div className="space-y-1.5">
                                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>معيار النصاب الشرعي:</span>
                                    <span className="text-[10px] text-amber-600 dark:text-[#D4AF37]">معيار بيت الزكاة</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setNisabStandard('gold')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                                            nisabStandard === 'gold'
                                                ? 'bg-[#0F2744] text-white border-[#0F2744] dark:bg-[#D4AF37] dark:text-slate-950 dark:border-[#D4AF37]'
                                                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        نصاب الذهب (85 جم)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setNisabStandard('silver')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                                            nisabStandard === 'silver'
                                                ? 'bg-[#0F2744] text-white border-[#0F2744] dark:bg-[#D4AF37] dark:text-slate-950 dark:border-[#D4AF37]'
                                                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        نصاب الفضة (595 جم)
                                    </button>
                                </div>
                            </div>

                            {/* Gold Price Input */}
                            <div className="space-y-1.5">
                                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>سعر جرام الذهب عيار 24 بالكويت:</span>
                                    <span className="text-[10px] text-slate-400">سعر الصاغة المحلي</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={goldPricePerGram}
                                        onChange={(e) => setGoldPricePerGram(Math.max(1, Number(e.target.value)))}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#D4AF37]"
                                    />
                                    <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-400">د.ك/جم</span>
                                </div>
                            </div>

                            {/* Calendar Hijri / Gregorian */}
                            <div className="space-y-1.5">
                                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>نوع التقويم لحساب الحول:</span>
                                    <span className="text-[10px] text-slate-400">فارق 11 يوماً سنوياً</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setCalendarType('hijri')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                                            calendarType === 'hijri'
                                                ? 'bg-[#0F2744] text-white border-[#0F2744] dark:bg-[#D4AF37] dark:text-slate-950 dark:border-[#D4AF37]'
                                                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        هجري (2.50%)
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCalendarType('gregorian')}
                                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center ${
                                            calendarType === 'gregorian'
                                                ? 'bg-[#0F2744] text-white border-[#0F2744] dark:bg-[#D4AF37] dark:text-slate-950 dark:border-[#D4AF37]'
                                                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                        }`}
                                    >
                                        ميلادي (2.577%)
                                    </button>
                                </div>
                            </div>

                            {/* Hawl completion & overdue years */}
                            <div className="space-y-1.5">
                                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                                    <span>حالة استيفاء الحول وعدد السنوات:</span>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">شرط الوجوب</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <label className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer flex-1">
                                        <input
                                            type="checkbox"
                                            checked={isHawlCompleted}
                                            onChange={(e) => setIsHawlCompleted(e.target.checked)}
                                            className="rounded text-[#D4AF37] focus:ring-[#D4AF37] h-4 w-4"
                                        />
                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">حال عليه الحول</span>
                                    </label>
                                    <div className="w-24">
                                        <select
                                            value={overdueYears}
                                            onChange={(e) => setOverdueYears(Number(e.target.value))}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none"
                                        >
                                            <option value={1}>سنة واحدة</option>
                                            <option value={2}>سنتان</option>
                                            <option value={3}>3 سنوات</option>
                                            <option value={4}>4 سنوات</option>
                                            <option value={5}>5 سنوات</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Zakatable Assets Breakdown Table */}
                    <Card className="p-5 border border-slate-200/80 dark:border-slate-700/80 shadow-card bg-white dark:bg-[#132742] rounded-2xl">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Wallet className="w-4 h-4 text-emerald-600" />
                                    حصر وتكييف الأصول الخاضعة للزكاة من التركة
                                </h4>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                    تم استيراد بيانات الأصول آلياً من قسم تصفية التركة لتحديد ما تجب فيه الزكاة شرعاً
                                </p>
                            </div>

                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl">
                                {zakatableItems.length} أصول زكوية محددة
                            </span>
                        </div>

                        {/* List of Zakatable Items */}
                        <div className="space-y-3">
                            {zakatableItems.map((item) => (
                                <div 
                                    key={item.id}
                                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 transition-all hover:border-[#D4AF37]/50"
                                >
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                                            <span className="text-xs font-black text-slate-900 dark:text-white">
                                                {item.name}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 ps-6">
                                            {item.note}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-4 ps-6 sm:ps-0 w-full sm:w-auto justify-between sm:justify-end">
                                        <div className="text-start sm:text-end">
                                            <span className="text-[10px] text-slate-400 block font-sans">القيمة الخاضعة للزكاة</span>
                                            <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                                                {item.zakatableVal.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {zakatableItems.length === 0 && (
                                <div className="py-8 text-center text-xs text-slate-400">
                                    لا توجد أصول مسجلة خاضعة للزكاة. يرجى إدخال السيولة أو الأوراق المالية في حاسبة التركة أولاً.
                                </div>
                            )}
                        </div>

                        {/* Deductible Debts Section */}
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                                <input
                                    type="checkbox"
                                    checked={deductImmediateDebts}
                                    onChange={(e) => setDeductImmediateDebts(e.target.checked)}
                                    className="rounded text-[#D4AF37] focus:ring-[#D4AF37] h-4 w-4"
                                />
                                <span>خصم الديون الحالة المسجلة على المتوفى قبل احتساب الزكاة ({applicableDeductions.toLocaleString()} د.ك)</span>
                            </label>

                            <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                                - {applicableDeductions.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                            </span>
                        </div>
                    </Card>
                </div>

                {/* Right Column (1 col): Final Legal Settlement Card & Actions */}
                <div className="space-y-5">
                    {/* Final Zakat Determination Card */}
                    <Card className="p-5 border-2 border-[#D4AF37]/50 shadow-xl bg-white dark:bg-[#132742] rounded-2xl relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-28 h-28 bg-[#D4AF37]/10 rounded-full blur-xl pointer-events-none"></div>

                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                                القرار الشرعي لصك الزكاة
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                                ملزم للأثر
                            </span>
                        </div>

                        {/* Breakdown Box */}
                        <div className="space-y-3 text-xs">
                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span>إجمالي الأموال المحصورة:</span>
                                <span className="font-mono font-bold text-slate-900 dark:text-white">
                                    {grossZakatableWealth.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span>الديون المستقطعة من الوعاء:</span>
                                <span className="font-mono font-bold text-rose-600">
                                    - {applicableDeductions.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-slate-700 dark:text-slate-300 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span>الوعاء الخاضع للزكاة (الصافي):</span>
                                <span className="font-mono font-black text-slate-900 dark:text-white">
                                    {netZakatableBase.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span>حد النصاب المطلوب:</span>
                                <span className="font-mono font-bold text-[#D4AF37]">
                                    {nisabThreshold.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span>السنوات المستحقة (الحول):</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {isHawlCompleted ? `${overdueYears} سنة` : 'لم يستوفِ الحول (معفي)'}
                                </span>
                            </div>
                        </div>

                        {/* Grand Total Amount Banner */}
                        <div className="mt-5 p-4 bg-slate-900 text-white rounded-xl border border-slate-800 text-center space-y-1">
                            <span className="text-[10px] text-slate-400 font-sans block">
                                صافي الزكاة الواجبة الإخراج من التركة
                            </span>
                            <div className="text-2xl font-black font-mono text-[#D4AF37]">
                                {totalZakatDue.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
                                <span className="text-xs font-sans text-white">د.ك</span>
                            </div>
                            <span className="text-[9px] text-emerald-400 font-sans block">
                                دين ممتاز مقدم في المرتبة الثانية من المادة 289
                            </span>
                        </div>

                        {/* Action: Apply directly to Inheritance Calculator */}
                        <div className="mt-5 space-y-2.5">
                            <Button
                                onClick={handleApplyToEstate}
                                disabled={totalZakatDue <= 0}
                                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                            >
                                <CheckCircle2 className="w-4 h-4 text-white" />
                                إدراج الزكاة كدين مستقطع في حاسبة المواريث
                            </Button>

                            <Button
                                onClick={onBackToCalculator}
                                variant="outline"
                                className="w-full h-10 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl cursor-pointer"
                            >
                                إلغاء والرجوع للحاسبة
                            </Button>
                        </div>
                    </Card>

                    {/* Sharia Reference Accordion Card */}
                    <Card className="p-4 border border-slate-200/80 dark:border-slate-700/80 shadow-card bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs space-y-2">
                        <button
                            type="button"
                            onClick={() => setShowFatwaDetails(!showFatwaDetails)}
                            className="w-full flex items-center justify-between font-bold text-slate-800 dark:text-slate-200 text-start cursor-pointer"
                        >
                            <span className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-[#D4AF37]">
                                <Info className="w-4 h-4" />
                                السند الشرعي والقضائي في القانون الكويتي
                            </span>
                            {showFatwaDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {showFatwaDetails && (
                            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                                <p>
                                    <strong>المادة (289) من القانون 51/1984:</strong> تؤدى من التركة بحسب الترتيب الآتي: نفقات التجهيز، قضاء الديون، تنفيذ الوصايا، ثم قسمة الباقي بين الورثة.
                                </p>
                                <p>
                                    <strong>رأي الجمهور وبيت الزكاة الكويتي:</strong> الزكاة دين لله في ذمة المتوفى، وحقوق الله أحق بالقضاء لقوله ﷺ: «فدين الله أحق أن يُقضى» (رواه البخاري ومسلم).
                                </p>
                                <p>
                                    <strong>الأصول الشخصية المعفاة:</strong> السكن الخاص، السيارات الشخصية، والأثاث معفاة بإجماع الفقهاء لأنها مخصصة للحاجة الأصلية وليست نماءً.
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};
