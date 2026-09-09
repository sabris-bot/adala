import React, { useState, useMemo } from 'react';
import { 
    Folder, 
    Trash2, 
    Printer, 
    RotateCcw, 
    Search, 
    Sparkles, 
    Download, 
    FileText, 
    Copy, 
    Check, 
    User, 
    Phone, 
    Calendar, 
    Scale, 
    Coins, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    Filter,
    Shield,
    ArrowUpRight,
    Plus,
    Tag
} from 'lucide-react';
import { InheritanceCalculation } from '../../services/inheritanceEngine';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface Props {
    savedCases: InheritanceCalculation[];
    onLoadCase: (calc: InheritanceCalculation) => void;
    onDeleteCase: (id?: string) => void;
    onPrintCase: (calc: InheritanceCalculation) => void;
    onDraftMemo?: (calc: InheritanceCalculation) => void;
    onCompareCase?: (calc: InheritanceCalculation) => void;
    onAddNewCase?: () => void;
}

export const SavedCasesView: React.FC<Props> = ({
    savedCases,
    onLoadCase,
    onDeleteCase,
    onPrintCase,
    onDraftMemo,
    onCompareCase,
    onAddNewCase
}) => {
    const { addToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [madhabFilter, setMadhabFilter] = useState<'all' | 'sunni' | 'jafari'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'amicable' | 'disputed' | 'archived'>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredCases = useMemo(() => {
        return savedCases.filter(c => {
            const query = searchQuery.toLowerCase().trim();
            const matchesQuery = 
                !query ||
                (c.deceasedName || '').toLowerCase().includes(query) ||
                (c.clientName || '').toLowerCase().includes(query) ||
                (c.caseNumber || '').toLowerCase().includes(query) ||
                (c.civilId || '').includes(query) ||
                (c.clientPhone || '').includes(query) ||
                (c.notes || '').toLowerCase().includes(query);

            const matchesMadhab = madhabFilter === 'all' || c.madhab === madhabFilter;
            const matchesStatus = statusFilter === 'all' || (c.status || 'active') === statusFilter;

            return matchesQuery && matchesMadhab && matchesStatus;
        });
    }, [savedCases, searchQuery, madhabFilter, statusFilter]);

    const totalEstatesSum = useMemo(() => {
        return savedCases.reduce((acc, c) => acc + (c.netEstate || 0), 0);
    }, [savedCases]);

    const amicableCount = savedCases.filter(c => c.status === 'amicable').length;
    const disputedCount = savedCases.filter(c => c.status === 'disputed').length;

    const handleCopyCaseSummary = (calc: InheritanceCalculation) => {
        let text = `【ملف تركة موكل - مكتب المحامي صبري شطا】\n`;
        text += `رقم الملف: ${calc.caseNumber || 'غير محدد'} | الموكل: ${calc.clientName || 'غير مسجل'}\n`;
        text += `المورث: ${calc.deceasedName || 'المورث'} | الرقم المدني: ${calc.civilId || 'غير مسجل'}\n`;
        text += `المذهب: ${calc.madhab === 'sunni' ? 'سني (قانون 51/1984)' : 'جعفري (دوائر استئنافية)'}\n`;
        text += `إجمالي التركة: ${calc.totalEstate.toLocaleString()} د.ك | الديون: ${(calc.debts + calc.funeralExpenses).toLocaleString()} د.ك\n`;
        text += `صافي التركة الخالص: ${calc.netEstate.toLocaleString()} د.ك\n\n`;
        text += `الأنصبة المستحقة (${calc.shares.length} ورثة):\n`;
        calc.shares.forEach(s => {
            text += `• ${s.heirLabel} (${s.count}): ${s.shareLabel} = ${s.amount.toLocaleString()} د.ك (${(s.shareValue * 100).toFixed(2)}%)\n`;
        });
        navigator.clipboard.writeText(text);
        setCopiedId(calc.id);
        addToast({ type: 'success', title: 'تم النسخ', message: 'تم نسخ ملخص ملف التركة بنجاح.' });
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getStatusBadge = (status?: string) => {
        switch (status) {
            case 'amicable':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        قسمة رضائية وتخارج
                    </span>
                );
            case 'disputed':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        <AlertCircle className="w-3 h-3" />
                        نزاع قضائي وفرز
                    </span>
                );
            case 'archived':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                        <Clock className="w-3 h-3" />
                        ملف مؤرشف
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                        <Scale className="w-3 h-3" />
                        قيد التصفية والحساب
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. EXECUTIVE HEADER BANNER */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#0F2744] via-[#143258] to-[#0A192F] text-white border-2 border-[#D4AF37]/50 shadow-card relative overflow-hidden">
                <div className="absolute top-0 left-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
                            <Folder className="w-6 h-6 text-slate-950" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-lg font-black text-white">
                                    سجل التركات السابقة للموكلين (الأرشيف الرقمي المعتمد)
                                </h2>
                                <span className="px-2 py-0.5 rounded-md bg-white/15 text-[#D4AF37] text-[10px] font-black border border-white/10">
                                    استرجاع وإعادة تصدير فوري
                                </span>
                            </div>
                            <p className="text-xs text-slate-300 mt-1">
                                إدارة وأرشفة ملفات تركات الموكلين، مع إمكانية استرجاع الحسابات القديمة للحاسبة وإعادة تصدير الصكوك الرسمية بضغطة زر
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
                        {onAddNewCase && (
                            <button
                                type="button"
                                onClick={onAddNewCase}
                                className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-amber-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                            >
                                <Plus className="w-4 h-4 text-slate-950" />
                                <span>حفظ المسألة الحالية كملف موكل</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Analytical Stats Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-white/15">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                        <span className="text-[10px] text-slate-300 block font-bold">إجمالي ملفات الموكلين</span>
                        <span className="text-base font-black text-white">{savedCases.length} قضية</span>
                    </div>

                    <div className="bg-amber-400/10 p-3 rounded-2xl border border-[#D4AF37]/40">
                        <span className="text-[10px] text-amber-300 font-bold block flex items-center gap-1">
                            <Coins className="w-3 h-3 text-[#D4AF37]" />
                            مجموع صافي التركات المدارة
                        </span>
                        <span className="text-base font-black text-[#D4AF37] font-mono">
                            {totalEstatesSum.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} د.ك
                        </span>
                    </div>

                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                        <span className="text-[10px] text-slate-300 block font-bold">اتفاقات التخارج الرضائي</span>
                        <span className="text-base font-black text-emerald-300">{amicableCount} ملفات</span>
                    </div>

                    <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                        <span className="text-[10px] text-slate-300 block font-bold">ملفات القسمة القضائية</span>
                        <span className="text-base font-black text-blue-300">{disputedCount} قضايا</span>
                    </div>
                </div>
            </div>

            {/* 2. SEARCH AND FILTER TOOLBAR */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-[#132742] p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-card">
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث باسم الموكل، اسم المورث، الرقم المدني، أو رقم الملف..."
                        className="w-full text-xs pr-10 pl-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37]"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {/* Madhab Filter */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setMadhabFilter('all')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                madhabFilter === 'all'
                                    ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                            }`}
                        >
                            المذهبين
                        </button>
                        <button
                            type="button"
                            onClick={() => setMadhabFilter('sunni')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                madhabFilter === 'sunni'
                                    ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                            }`}
                        >
                            سني
                        </button>
                        <button
                            type="button"
                            onClick={() => setMadhabFilter('jafari')}
                            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                                madhabFilter === 'jafari'
                                    ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                            }`}
                        >
                            جعفري
                        </button>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
                        <button
                            type="button"
                            onClick={() => setStatusFilter('all')}
                            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                                statusFilter === 'all'
                                    ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-2xs'
                                    : 'text-slate-600 dark:text-slate-300'
                            }`}
                        >
                            جميع الحالات
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('amicable')}
                            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                                statusFilter === 'amicable'
                                    ? 'bg-emerald-600 text-white shadow-2xs'
                                    : 'text-emerald-700 dark:text-emerald-400'
                            }`}
                        >
                            رضائية
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusFilter('disputed')}
                            className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                                statusFilter === 'disputed'
                                    ? 'bg-rose-600 text-white shadow-2xs'
                                    : 'text-rose-700 dark:text-rose-400'
                            }`}
                        >
                            قضائية
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. CLIENT ESTATES CARDS GRID */}
            {filteredCases.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#132742] rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700 space-y-3">
                    <Folder className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
                    <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">
                        لا توجد ملفات تركات مطابقة في الأرشيف
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                        يمكنك حفظ أي مسألة يتم حسابها في منصة الحاسبة عبر النقر على زر «حفظ في السجل» لحفظ بيانات الموكل واسترجاعها وإعادة تصديرها لاحقاً.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {filteredCases.map((caseItem) => {
                        const totalDeductions = (caseItem.debts || 0) + (caseItem.funeralExpenses || 0);

                        return (
                            <div 
                                key={caseItem.id} 
                                className="relative rounded-2xl bg-white dark:bg-[#132742] border-2 border-slate-200/90 dark:border-slate-700/80 hover:border-[#D4AF37] dark:hover:border-[#D4AF37] shadow-card hover:shadow-lg transition-all p-5 flex flex-col justify-between gap-4 group"
                            >
                                {/* Card Header */}
                                <div className="space-y-2.5">
                                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-[#0F2744] text-[#D4AF37] border border-[#D4AF37]/30">
                                                    {caseItem.caseNumber || `EST-${caseItem.id.slice(-6)}`}
                                                </span>
                                                {getStatusBadge(caseItem.status)}
                                            </div>

                                            <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                                                <User className="w-3.5 h-3.5 text-[#D4AF37]" />
                                                <span>الموكل: {caseItem.clientName || 'موكل المكتب'}</span>
                                            </h4>

                                            <div className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                                <span>المورث: <strong className="text-slate-800 dark:text-slate-200">{caseItem.deceasedName || 'المورث'}</strong></span>
                                                {caseItem.civilId && (
                                                    <span className="font-mono text-slate-500">({caseItem.civilId})</span>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => onDeleteCase(caseItem.id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                            title="حذف الملف من الأرشيف"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Financial Grid */}
                                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 text-xs">
                                        <div>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">إجمالي التركة</span>
                                            <span className="font-mono font-black text-slate-900 dark:text-white">
                                                {caseItem.totalEstate.toLocaleString()} د.ك
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">الديون والتجهيز</span>
                                            <span className="font-mono font-black text-rose-600 dark:text-rose-400">
                                                {totalDeductions.toLocaleString()} د.ك
                                            </span>
                                        </div>

                                        <div>
                                            <span className="text-[10px] text-amber-800 dark:text-[#D4AF37] block font-bold">صافي التوزيع</span>
                                            <span className="font-mono font-black text-[#D4AF37]">
                                                {caseItem.netEstate.toLocaleString()} د.ك
                                            </span>
                                        </div>
                                    </div>

                                    {/* Heirs summary tags */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-1">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">
                                            عدد الورثة: <strong className="text-slate-900 dark:text-white">{caseItem.shares.length} ورثة</strong> ({caseItem.madhab === 'sunni' ? 'المذهب السني' : 'المذهب الجعفري'})
                                        </span>

                                        {caseItem.clientPhone && (
                                            <span className="text-slate-500 flex items-center gap-1 font-mono">
                                                <Phone className="w-3 h-3 text-[#D4AF37]" />
                                                {caseItem.clientPhone}
                                            </span>
                                        )}
                                    </div>

                                    {caseItem.notes && (
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-amber-50/40 dark:bg-slate-800/40 p-2 rounded-lg border border-amber-200/40 dark:border-slate-700/60 line-clamp-2">
                                            {caseItem.notes}
                                        </p>
                                    )}
                                </div>

                                {/* 4. ONE-CLICK INSTANT ACTIONS TOOLBAR */}
                                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        {/* 1-Click Restore to Calculator */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onLoadCase(caseItem);
                                                addToast({
                                                    type: 'success',
                                                    title: 'تم استرجاع الحساب بنجاح',
                                                    message: `تم تحميل بيانات تركة (${caseItem.deceasedName || 'المورث'}) في شاشة الحاسبة.`
                                                });
                                            }}
                                            className="px-3 py-2.5 rounded-xl bg-[#0F2744] hover:bg-[#0A1C30] text-white dark:bg-[#D4AF37] dark:text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                            title="استرجاع كافة بيانات التركة والأصول وشجرة الورثة وتعبئة الحاسبة فوراً"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                            <span>استرجاع للحاسبة</span>
                                        </button>

                                        {/* 1-Click Re-Export PDF */}
                                        <button
                                            type="button"
                                            onClick={() => onPrintCase(caseItem)}
                                            className="px-3 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-amber-300 border border-[#D4AF37]/50 font-black text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                                            title="إعادة تصدير صك التركة الرسمي بصيغة PDF فوراً بضغطة زر"
                                        >
                                            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                                            <span>إعادة تصدير PDF</span>
                                        </button>
                                    </div>

                                    {/* Secondary Quick Actions */}
                                    <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                                        {onDraftMemo && (
                                            <button
                                                type="button"
                                                onClick={() => onDraftMemo(caseItem)}
                                                className="text-slate-600 dark:text-slate-300 hover:text-[#D4AF37] dark:hover:text-[#D4AF37] font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                                title="صياغة مذكرة إرث أو صحيفة دعوى فورية بالذكاء الاصطناعي"
                                            >
                                                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                                                <span>صياغة مذكرة إرث</span>
                                            </button>
                                        )}

                                        {onCompareCase && (
                                            <button
                                                type="button"
                                                onClick={() => onCompareCase(caseItem)}
                                                className="text-slate-600 dark:text-slate-300 hover:text-blue-600 font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                                title="مقارنة توزيع هذا الملف بين السني والجعفري"
                                            >
                                                <Scale className="w-3 h-3 text-blue-500" />
                                                <span>مقارنة المذهبين</span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => handleCopyCaseSummary(caseItem)}
                                            className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                            title="نسخ ملخص القضية"
                                        >
                                            {copiedId === caseItem.id ? (
                                                <Check className="w-3 h-3 text-emerald-500" />
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                            <span>{copiedId === caseItem.id ? 'تم النسخ' : 'نسخ الملخص'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
