import React from 'react';
import { 
    Coins, 
    AlertTriangle, 
    Building, 
    Banknote, 
    TrendingUp, 
    Gem, 
    Car, 
    FileCheck2, 
    Briefcase, 
    Award, 
    Sparkles,
    ShieldAlert,
    CheckCircle2
} from 'lucide-react';
import { EstateAssets, EstateDeductions } from '../../services/inheritanceEngine';
import Card from '../ui/Card';

interface Props {
    assets: EstateAssets;
    setAssets: React.Dispatch<React.SetStateAction<EstateAssets>>;
    deductions: EstateDeductions;
    setDeductions: React.Dispatch<React.SetStateAction<EstateDeductions>>;
    totalEstate: number;
    netEstate: number;
    onNextStep?: () => void;
    onPrevStep?: () => void;
}

export const EstateLiquidationCard: React.FC<Props> = ({
    assets,
    setAssets,
    deductions,
    setDeductions,
    totalEstate,
    netEstate,
    onNextStep,
    onPrevStep
}) => {
    const handleAssetChange = (field: keyof EstateAssets, val: string) => {
        const num = parseFloat(val) || 0;
        setAssets(prev => ({ ...prev, [field]: Math.max(0, num) }));
    };

    const handleDeductionChange = (field: keyof EstateDeductions, val: string) => {
        const num = parseFloat(val) || 0;
        setDeductions(prev => ({ ...prev, [field]: Math.max(0, num) }));
    };

    const setQuickCash = (amount: number) => {
        setAssets(prev => ({ ...prev, cash: amount }));
    };

    const totalDeductions = (deductions.securedDebts || 0) + (deductions.funeralExpenses || 0) + (deductions.unsecuredDebts || 0) + (deductions.wills || 0);
    const maxWillAllowed = Math.max(0, (totalEstate - (deductions.securedDebts || 0) - (deductions.funeralExpenses || 0) - (deductions.unsecuredDebts || 0)) / 3);
    const willExceeds = deductions.wills > maxWillAllowed && maxWillAllowed > 0;

    return (
        <Card className="p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-card bg-white dark:bg-[#132742] rounded-2xl transition-all">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0F2744] dark:bg-[#0A1C30] text-[#D4AF37] flex items-center justify-center font-bold border border-[#D4AF37]/40 shadow-xs">
                        <Coins className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-800 dark:text-[#E6CA65] border border-amber-500/30">
                                الخطوة 2
                            </span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                تصفية التركة والذمة المالية والحقوق المترتبة
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            حصر الأصول العينية والنقدية واستقطاع الديون والتجهيز والوصايا تلقائياً بالترتيب الشرعي (المادة 289)
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 bg-gradient-to-r from-[#0F2744] to-[#16345C] text-white px-4 py-2.5 rounded-xl border border-[#D4AF37]/35 shadow-sm">
                    <div>
                        <span className="text-[10px] text-slate-300 block">إجمالي التركة</span>
                        <span className="text-xs font-mono font-bold text-white">
                            {totalEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                        </span>
                    </div>
                    <span className="text-[#D4AF37]/40">|</span>
                    <div>
                        <span className="text-[10px] text-[#D4AF37] block">صافي التركة للقسمة</span>
                        <span className="text-sm font-mono font-black text-[#10B981]">
                            {netEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Fill Presets (Interactive Chips) */}
            <div className="flex flex-wrap items-center gap-2 mb-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 me-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-[#D4AF37]" />
                    تعبئة سريعة للنقدية (KWD):
                </span>
                {[
                    { label: '50 ألف', val: 50000 },
                    { label: '100 ألف', val: 100000 },
                    { label: '250 ألف', val: 250000 },
                    { label: '500 ألف', val: 500000 },
                    { label: 'مليون د.ك', val: 1000000 }
                ].map(item => (
                    <button
                        key={item.val}
                        type="button"
                        onClick={() => setQuickCash(item.val)}
                        className={`px-3 py-1 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer border ${
                            assets.cash === item.val
                                ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 border-[#0F2744] dark:border-[#D4AF37] shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#D4AF37] hover:text-[#D4AF37]'
                        }`}
                    >
                        {item.label}
                    </button>
                ))}
            </div>

            {/* Asset Categories Grid */}
            <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 dark:bg-[#D4AF37]" />
                        <span>1. الأصول والممتلكات العينية والنقدية (بالدينار الكويتي KWD)</span>
                    </h4>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        مجموع الأصول: {totalEstate.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50/80 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#D4AF37] transition-all">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[10px] font-bold mb-1.5">
                            <Banknote className="w-3.5 h-3.5 text-[#10B981]" />
                            <span>النقد والودائع البنكية</span>
                        </div>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.000"
                            value={assets.cash || ''}
                            onChange={e => handleAssetChange('cash', e.target.value)}
                            className="w-full bg-transparent font-black text-sm font-mono text-slate-900 dark:text-white border-none outline-none p-0"
                        />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#D4AF37] transition-all">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[10px] font-bold mb-1.5">
                            <Building className="w-3.5 h-3.5 text-blue-500" />
                            <span>العقارات والأراضي</span>
                        </div>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.000"
                            value={assets.realEstate || ''}
                            onChange={e => handleAssetChange('realEstate', e.target.value)}
                            className="w-full bg-transparent font-black text-sm font-mono text-slate-900 dark:text-white border-none outline-none p-0"
                        />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#D4AF37] transition-all">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[10px] font-bold mb-1.5">
                            <TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                            <span>الأسهم والمحافظ والصناديق</span>
                        </div>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.000"
                            value={assets.stocks || ''}
                            onChange={e => handleAssetChange('stocks', e.target.value)}
                            className="w-full bg-transparent font-black text-sm font-mono text-slate-900 dark:text-white border-none outline-none p-0"
                        />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#D4AF37] transition-all">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[10px] font-bold mb-1.5">
                            <Gem className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>المجوهرات والمعادن النفيسة</span>
                        </div>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.000"
                            value={assets.jewelry || ''}
                            onChange={e => handleAssetChange('jewelry', e.target.value)}
                            className="w-full bg-transparent font-black text-sm font-mono text-slate-900 dark:text-white border-none outline-none p-0"
                        />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#D4AF37] transition-all">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[10px] font-bold mb-1.5">
                            <Car className="w-3.5 h-3.5 text-slate-500" />
                            <span>المركبات واليخوت والآليات</span>
                        </div>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.000"
                            value={assets.vehicles || ''}
                            onChange={e => handleAssetChange('vehicles', e.target.value)}
                            className="w-full bg-transparent font-black text-sm font-mono text-slate-900 dark:text-white border-none outline-none p-0"
                        />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#D4AF37] transition-all">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[10px] font-bold mb-1.5">
                            <Award className="w-3.5 h-3.5 text-rose-500" />
                            <span>مكافأة نهاية الخدمة / تقاعد</span>
                        </div>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.000"
                            value={assets.endOfService || ''}
                            onChange={e => handleAssetChange('endOfService', e.target.value)}
                            className="w-full bg-transparent font-black text-sm font-mono text-slate-900 dark:text-white border-none outline-none p-0"
                        />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#D4AF37] transition-all">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[10px] font-bold mb-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                            <span>الرخص والشركات والمؤسسات</span>
                        </div>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.000"
                            value={assets.businessLicenses || ''}
                            onChange={e => handleAssetChange('businessLicenses', e.target.value)}
                            className="w-full bg-transparent font-black text-sm font-mono text-slate-900 dark:text-white border-none outline-none p-0"
                        />
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 focus-within:border-[#D4AF37] transition-all">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 text-[10px] font-bold mb-1.5">
                            <FileCheck2 className="w-3.5 h-3.5 text-cyan-500" />
                            <span>ديون مستحقة للتركة لدى الغير</span>
                        </div>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.000"
                            value={assets.receivables || ''}
                            onChange={e => handleAssetChange('receivables', e.target.value)}
                            className="w-full bg-transparent font-black text-sm font-mono text-slate-900 dark:text-white border-none outline-none p-0"
                        />
                    </div>
                </div>
            </div>

            {/* Deductions in Strict Legal Order (Article 289) */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        <span>2. الاستقطاعات والالتزامات المالية (مرتبة حسب الأسبقية الشرعية والقانونية)</span>
                    </h4>
                    <span className="text-[10px] text-[#B8902A] dark:text-[#D4AF37] font-bold">
                        المادة (289) من قانون الأحوال الشخصية الكويتي
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-800 dark:text-slate-200 block">
                            أ. حقوق العين والرهن (ديون موثقة)
                        </label>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.000 د.ك"
                            value={deductions.securedDebts || ''}
                            onChange={e => handleDeductionChange('securedDebts', e.target.value)}
                            className="w-full h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                        <span className="text-[9px] text-slate-400 block">تُقدّم ديون الرهن أولاً</span>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-800 dark:text-slate-200 block">
                            ب. نفقات تجهيز المتوفى وتكفينه
                        </label>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.000 د.ك"
                            value={deductions.funeralExpenses || ''}
                            onChange={e => handleDeductionChange('funeralExpenses', e.target.value)}
                            className="w-full h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                        <span className="text-[9px] text-slate-400 block">المصاريف بالمعروف بلا إسراف</span>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[11px] font-black text-slate-800 dark:text-slate-200 block">
                            ج. الديون المرسلة في الذمة
                        </label>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.000 د.ك"
                            value={deductions.unsecuredDebts || ''}
                            onChange={e => handleDeductionChange('unsecuredDebts', e.target.value)}
                            className="w-full h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                        <span className="text-[9px] text-slate-400 block">ديون الله والعباد غير الموثقة</span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black text-slate-800 dark:text-slate-200 block">
                                د. الوصايا النافذة (حد الثلث)
                            </label>
                            {maxWillAllowed > 0 && (
                                <span className="text-[9px] text-[#B8902A] dark:text-[#D4AF37] font-mono">
                                    حد الثلث: {maxWillAllowed.toLocaleString(undefined, { maximumFractionDigits: 0 })} د.ك
                                </span>
                            )}
                        </div>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            placeholder="0.000 د.ك"
                            value={deductions.wills || ''}
                            onChange={e => handleDeductionChange('wills', e.target.value)}
                            className={`w-full h-10 px-3 border rounded-xl font-mono font-bold text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none ${
                                willExceeds ? 'border-rose-500 focus:border-rose-600' : 'border-slate-200 dark:border-slate-700 focus:border-[#D4AF37]'
                            }`}
                        />
                        <span className="text-[9px] text-slate-400 block">في حدود ثلث الباقي بعد الديون</span>
                    </div>
                </div>

                {willExceeds && (
                    <div className="flex items-center gap-2 p-3 bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 rounded-xl text-xs">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        <span>
                            تنبيه قانوني: الوصية المدخلة تجاوزت حد الثلث الشرعي ({maxWillAllowed.toLocaleString(undefined, { maximumFractionDigits: 2 })} د.ك)، وتحتاج لإجازة الورثة الراشدين لنفاذ الزيادة (المادة 345).
                        </span>
                    </div>
                )}
            </div>

            {/* Step Navigation Actions */}
            {(onNextStep || onPrevStep) && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    {onPrevStep ? (
                        <button
                            type="button"
                            onClick={onPrevStep}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                        >
                            ← السابق: بيانات المتوفى
                        </button>
                    ) : <div />}

                    {onNextStep && (
                        <button
                            type="button"
                            onClick={onNextStep}
                            className="px-5 py-2.5 rounded-xl bg-[#0F2744] hover:bg-[#0A1C30] text-white dark:text-[#D4AF37] border border-[#0F2744] dark:border-[#D4AF37]/40 text-xs font-black transition-all flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                            <span>التالي: حصر وتحديد الورثة</span>
                            <span>→</span>
                        </button>
                    )}
                </div>
            )}
        </Card>
    );
};

