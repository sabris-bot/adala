import React, { useState, useMemo } from 'react';
import { 
    Scale, 
    ArrowLeftRight, 
    Sparkles, 
    AlertTriangle, 
    CheckCircle2, 
    Filter, 
    Copy, 
    Check, 
    Info, 
    BookOpen, 
    Download,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { InheritanceCalculation } from '../../services/inheritanceEngine';
import Card from '../ui/Card';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface Props {
    sunniCalc: InheritanceCalculation | null;
    jafariCalc: InheritanceCalculation | null;
    className?: string;
    onClose?: () => void;
    compact?: boolean;
}

export interface ComparisonRow {
    heirType: string;
    heirLabel: string;
    count: number;
    sunniShareLabel: string;
    sunniShareValue: number;
    sunniAmount: number;
    sunniNote?: string;
    jafariShareLabel: string;
    jafariShareValue: number;
    jafariAmount: number;
    jafariNote?: string;
    diffAmount: number;
    isSignificantDiff: boolean;
    diffReason: string;
}

export const DualJurisdictionSideComparison: React.FC<Props> = ({
    sunniCalc,
    jafariCalc,
    className = '',
    onClose,
    compact = false
}) => {
    const { addToast } = useToast();
    const [filterOnlyDivergent, setFilterOnlyDivergent] = useState(false);
    const [expandedRowIndex, setExpandedRowIndex] = useState<number | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    // Compute unified side-by-side comparison rows
    const comparisonRows: ComparisonRow[] = useMemo(() => {
        if (!sunniCalc || !jafariCalc) return [];

        const rowsMap = new Map<string, ComparisonRow>();

        // 1. Process Sunni Shares
        sunniCalc.shares.forEach(s => {
            const key = s.heirType;
            rowsMap.set(key, {
                heirType: s.heirType,
                heirLabel: s.heirLabel,
                count: s.count,
                sunniShareLabel: s.shareLabel,
                sunniShareValue: s.shareValue,
                sunniAmount: s.amount,
                sunniNote: s.evidence?.article,
                jafariShareLabel: 'محجوب / لا يرث',
                jafariShareValue: 0,
                jafariAmount: 0,
                diffAmount: s.amount,
                isSignificantDiff: false,
                diffReason: ''
            });
        });

        // 2. Process Jafari Shares
        jafariCalc.shares.forEach(j => {
            const key = j.heirType;
            if (rowsMap.has(key)) {
                const existing = rowsMap.get(key)!;
                existing.jafariShareLabel = j.shareLabel;
                existing.jafariShareValue = j.shareValue;
                existing.jafariAmount = j.amount;
                existing.jafariNote = j.evidence?.article;
                existing.diffAmount = Math.abs(existing.sunniAmount - j.amount);
            } else {
                rowsMap.set(key, {
                    heirType: j.heirType,
                    heirLabel: j.heirLabel,
                    count: j.count,
                    sunniShareLabel: 'محجوب / لا يرث',
                    sunniShareValue: 0,
                    sunniAmount: 0,
                    jafariShareLabel: j.shareLabel,
                    jafariShareValue: j.shareValue,
                    jafariAmount: j.amount,
                    jafariNote: j.evidence?.article,
                    diffAmount: j.amount,
                    isSignificantDiff: false,
                    diffReason: ''
                });
            }
        });

        // 3. Detect and Tag Significant Differences (الفروق الجوهرية)
        const rows: ComparisonRow[] = [];
        const hasDaughters = sunniCalc.shares.some(s => s.heirType === 'daughter');
        const hasBrothersOrUncles = sunniCalc.shares.some(s => 
            s.heirType === 'full_brother' || 
            s.heirType === 'paternal_brother' || 
            s.heirType === 'paternal_uncle'
        );

        rowsMap.forEach((row) => {
            const amountDiff = Math.abs(row.sunniAmount - row.jafariAmount);
            const isDifferent = amountDiff > 0.1 || 
                                (row.sunniAmount > 0 && row.jafariAmount === 0) || 
                                (row.jafariAmount > 0 && row.sunniAmount === 0) ||
                                row.sunniShareLabel !== row.jafariShareLabel;

            let reason = 'تطابق كامل في الأنصبة الشرعية بين المذهبين.';

            if (isDifferent) {
                if ((row.heirType.includes('brother') || row.heirType.includes('uncle')) && row.jafariAmount === 0 && row.sunniAmount > 0) {
                    reason = 'حجب كلي في المذهب الجعفري: تقدم الطبقة الأولى (الأولاد/الأبوين) مانع لإرث الحواشي والعصبات تماماً؛ بينما في السني يرث بالتعصيب الفائض.';
                } else if (row.heirType === 'daughter' && hasBrothersOrUncles) {
                    reason = 'رد الفائض بالجعفري: تستحق البنت كامل التركة فرضاً ورداً مع حجب الإخوة والأعمام؛ بينما في السني تشارك العصبة في الباقي.';
                } else if (sunniCalc.isAoul) {
                    reason = 'عول المسألة بالسني: نقصت الحصة لتزاحم السهام؛ في حين لا عول في الجعفري ويحسم النقص حصرياً من البنت أو الأخت الشقيقة.';
                } else if (sunniCalc.isRadd && !row.heirType.includes('wife') && !row.heirType.includes('husband')) {
                    reason = 'رد الفائض في المذهب السني على ذوي الفروض؛ بينما في الجعفري يتبع قواعد القرابة ونظام الطبقات الحصرية.';
                } else if (row.heirType === 'mother' || row.heirType === 'father') {
                    reason = 'اختلاف في قواعد حجب الأم بالإخوة أو في المسألة العمرية (ثلث الباقي بالسني مقابل ثلث الأصل بالجعفري).';
                } else if (row.heirType.includes('grandfather')) {
                    reason = 'مقاسمة الجد للإخوة في السني سنداً للمادة 304؛ بينما في الجعفري يقع في الطبقة الثانية مع الإخوة بالتساوي.';
                } else {
                    reason = 'فارق جوهري في تقدير الحصة الفرضية أو التعصيبية ومقدار العول والرد بين الفقهين.';
                }
            }

            row.isSignificantDiff = isDifferent;
            row.diffReason = reason;
            rows.push(row);
        });

        return rows;
    }, [sunniCalc, jafariCalc]);

    const significantDiffCount = comparisonRows.filter(r => r.isSignificantDiff).length;
    const totalMaxDiff = comparisonRows.reduce((acc, r) => acc + (r.isSignificantDiff ? r.diffAmount : 0), 0);

    const displayedRows = filterOnlyDivergent 
        ? comparisonRows.filter(r => r.isSignificantDiff) 
        : comparisonRows;

    const handleCopySummary = () => {
        if (!sunniCalc || !jafariCalc) return;
        let text = `【تقرير المقارنة الفقهية المزدوجة - المذهب السني مقابل الجعفري】\n`;
        text += `المورث: ${sunniCalc.deceasedName || 'المورث'} | صافي التركة: ${sunniCalc.netEstate.toLocaleString()} د.ك\n`;
        text += `الفروق الجوهرية المرصودة: ${significantDiffCount} من أصل ${comparisonRows.length} وارثاً\n\n`;
        displayedRows.forEach(r => {
            text += `• ${r.heirLabel}:\n`;
            text += `  - السني: ${r.sunniShareLabel} (${r.sunniAmount.toLocaleString()} د.ك)\n`;
            text += `  - الجعفري: ${r.jafariShareLabel} (${r.jafariAmount.toLocaleString()} د.ك)\n`;
            if (r.isSignificantDiff) {
                text += `  ⚠️ [فارق جوهري]: ${r.diffAmount.toLocaleString()} د.ك | السند: ${r.diffReason}\n`;
            }
            text += `\n`;
        });
        navigator.clipboard.writeText(text);
        setIsCopied(true);
        addToast({ type: 'success', title: 'تم النسخ', message: 'تم نسخ جدول الفروق الجوهرية بنجاح.' });
        setTimeout(() => setIsCopied(false), 2200);
    };

    if (!sunniCalc || !jafariCalc) {
        return (
            <Card className="p-6 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-[#132742] border border-slate-200 dark:border-slate-800 rounded-2xl">
                يرجى إدخال الورثة وعناصر التركة لعرض جدول المقارنة الجانبي بين المذهبين.
            </Card>
        );
    }

    return (
        <div id="dual-jurisdiction-side-comparison" className={`space-y-4 ${className}`}>
            {/* Executive Header Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0F2744] via-[#16365c] to-[#0A192F] text-white border-2 border-[#D4AF37]/50 shadow-md relative overflow-hidden">
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#D4AF37]/15 rounded-full blur-2xl pointer-events-none" />
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D4AF37] text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
                            <ArrowLeftRight className="w-5 h-5 text-slate-950" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                                    أداة المقارنة التفاعلية: المذهب السني vs المذهب الجعفري
                                </h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#D4AF37] text-slate-950 shadow-2xs">
                                    تظليل ذهبي للفروق
                                </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                                دراسة مقارنة لتوزيع نفس التركة ({sunniCalc.netEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك) بين قانون الأحوال الشخصية الكويتي والدوائر الجعفرية
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                            type="button"
                            onClick={handleCopySummary}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 border border-white/20 cursor-pointer"
                            title="نسخ جدول المقارنة"
                        >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'تم النسخ' : 'نسخ التقرير'}</span>
                        </button>
                    </div>
                </div>

                {/* Analytical Stats Ribbon */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-white/15 text-xs">
                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-300 block">إجمالي الورثة</span>
                        <span className="text-sm font-black text-white">{comparisonRows.length} ورثة</span>
                    </div>

                    <div className="bg-amber-400/10 p-2.5 rounded-xl border border-[#D4AF37]/40">
                        <span className="text-[10px] text-amber-300 font-bold block flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                            فروق جوهرية مظللة
                        </span>
                        <span className="text-sm font-black text-[#D4AF37]">{significantDiffCount} فروق</span>
                    </div>

                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-300 block">أصل المسألة (السني)</span>
                        <span className="text-xs font-black text-blue-300">
                            {sunniCalc.baseProblem || '-'} {sunniCalc.isAoul ? '(عول ⚠️)' : sunniCalc.isRadd ? '(رد)' : '(عادل)'}
                        </span>
                    </div>

                    <div className="bg-white/5 p-2.5 rounded-xl border border-white/10">
                        <span className="text-[10px] text-slate-300 block">نظام الحسم (الجعفري)</span>
                        <span className="text-xs font-black text-emerald-300">
                            نظام الطبقات الثلاث (لا عول)
                        </span>
                    </div>
                </div>
            </div>

            {/* Filter Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">طريقة العرض:</span>
                    <button
                        type="button"
                        onClick={() => setFilterOnlyDivergent(false)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            !filterOnlyDivergent
                                ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-xs'
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                        }`}
                    >
                        جميع الورثة ({comparisonRows.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterOnlyDivergent(true)}
                        className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            filterOnlyDivergent
                                ? 'bg-[#D4AF37] text-slate-950 font-black shadow-xs'
                                : 'text-amber-800 dark:text-[#D4AF37] hover:bg-amber-100/50 dark:hover:bg-slate-700'
                        }`}
                    >
                        <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                        <span>الفروق الجوهرية فقط ({significantDiffCount})</span>
                    </button>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="w-3 h-3 rounded-md bg-[#D4AF37]/30 border border-[#D4AF37] inline-block" />
                    <span>الصفوف المظللة بالذهبي تدل على فارق حكم جوهري</span>
                </div>
            </div>

            {/* Comparative Table */}
            <div className="overflow-x-auto rounded-2xl border-2 border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-[#132742] shadow-sm">
                <table className="w-full text-start text-xs border-collapse">
                    <thead>
                        <tr className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 font-black">
                            <th className="py-3 px-3.5 text-start">الوارث والصفة</th>
                            <th className="py-3 px-3.5 text-start bg-blue-50/50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300">
                                المذهب السني (قانون 51/1984)
                            </th>
                            <th className="py-3 px-3.5 text-start bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300">
                                المذهب الجعفري (الدوائر الجعفرية)
                            </th>
                            <th className="py-3 px-3.5 text-end">الفارق المالي</th>
                            <th className="py-3 px-3.5 text-center">التكييف والسند</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {displayedRows.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">
                                    لا توجد فروق جوهرية في هذه المسألة؛ الحصص متطابقة تماماً بين المذهبين.
                                </td>
                            </tr>
                        ) : (
                            displayedRows.map((row, idx) => {
                                const isExpanded = expandedRowIndex === idx;
                                const isGolden = row.isSignificantDiff;

                                return (
                                    <React.Fragment key={row.heirType}>
                                        <tr 
                                            className={`transition-colors ${
                                                isGolden 
                                                    ? 'bg-amber-500/10 dark:bg-amber-400/10 border-r-4 border-[#D4AF37] hover:bg-amber-500/15 dark:hover:bg-amber-400/15' 
                                                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                            }`}
                                        >
                                            {/* Heir Details */}
                                            <td className="py-3 px-3.5 font-bold text-slate-900 dark:text-white">
                                                <div className="flex items-center gap-2">
                                                    {isGolden && (
                                                        <span 
                                                            className="w-2 h-2 rounded-full bg-[#D4AF37] shrink-0 animate-pulse" 
                                                            title="فارق جوهري بين المذهبين"
                                                        />
                                                    )}
                                                    <div>
                                                        <span className="block text-slate-900 dark:text-white font-black text-xs">
                                                            {row.heirLabel}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                                            العدد: {row.count}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Sunni Jurisdiction */}
                                            <td className="py-3 px-3.5 bg-blue-50/20 dark:bg-blue-950/10">
                                                <div className="space-y-0.5">
                                                    <span className="inline-block px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200 text-[10px] font-bold">
                                                        {row.sunniShareLabel}
                                                    </span>
                                                    <div className="font-mono font-black text-slate-900 dark:text-white text-xs">
                                                        {row.sunniAmount.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                                                        {(row.sunniShareValue * 100).toFixed(2)}% من الصافي
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Jafari Jurisdiction */}
                                            <td className="py-3 px-3.5 bg-emerald-50/20 dark:bg-emerald-950/10">
                                                <div className="space-y-0.5">
                                                    <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 text-[10px] font-bold">
                                                        {row.jafariShareLabel}
                                                    </span>
                                                    <div className="font-mono font-black text-slate-900 dark:text-white text-xs">
                                                        {row.jafariAmount.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                                                        {(row.jafariShareValue * 100).toFixed(2)}% من الصافي
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Financial Difference */}
                                            <td className="py-3 px-3.5 text-end">
                                                {row.diffAmount > 0.001 ? (
                                                    <div className="space-y-0.5">
                                                        <span className={`font-mono font-black text-xs ${
                                                            isGolden ? 'text-amber-800 dark:text-[#D4AF37]' : 'text-slate-700 dark:text-slate-300'
                                                        }`}>
                                                            {row.diffAmount.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                                                        </span>
                                                        <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                                            فارق {Math.abs(row.sunniShareValue - row.jafariShareValue * 100).toFixed(1)}%
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-emerald-700 dark:text-emerald-400 font-black text-[11px] flex items-center justify-end gap-1">
                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                        متطابق
                                                    </span>
                                                )}
                                            </td>

                                            {/* Reason & Expand Details */}
                                            <td className="py-3 px-3.5 text-center">
                                                {isGolden ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => setExpandedRowIndex(isExpanded ? null : idx)}
                                                        className="px-2.5 py-1 rounded-lg bg-[#D4AF37] hover:bg-amber-400 text-slate-950 font-black text-[10px] transition-all inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                                                        title="عرض سبب الفارق الجوهري"
                                                    >
                                                        <span>فارق جوهري ⚠️</span>
                                                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                    </button>
                                                ) : (
                                                    <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                                                        اتفاق فقهي
                                                    </span>
                                                )}
                                            </td>
                                        </tr>

                                        {/* Expandable Reason Drawer */}
                                        {isExpanded && (
                                            <tr className="bg-amber-50 dark:bg-amber-950/40 border-r-4 border-[#D4AF37]">
                                                <td colSpan={5} className="py-3 px-4 text-xs text-amber-950 dark:text-amber-200">
                                                    <div className="flex items-start gap-2.5">
                                                        <Info className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                                                        <div className="space-y-1">
                                                            <div className="font-black text-amber-900 dark:text-[#D4AF37]">
                                                                السند الفقهي والقضائي لاختلاف نصيب ({row.heirLabel}):
                                                            </div>
                                                            <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed">
                                                                {row.diffReason}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Bottom Executive Guidance Note */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                <BookOpen className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-[11px]">
                    <span className="font-black text-slate-800 dark:text-slate-200 block">
                        التوجيه القضائي لمكتب المحامي صبري شطا:
                    </span>
                    <p className="leading-relaxed">
                        يُعمل بالمذهب السني أمام دوائر الأحوال الشخصية العامة استناداً للمادة (346) من القانون 51/1984، بينما تختص الدوائر الاستئنافية الجعفرية بالمسائل التابعة للمواطنين الشيعة وفقاً لمرسوم إنشائها، ويعد بيان الفروق الجوهرية المظللة بالذهبي أساساً جوهرياً لتقديم المشورة للموكلين قبل توقيع عقود التخارج أو التقدم بدعاوى الفرز والتجنيب.
                    </p>
                </div>
            </div>
        </div>
    );
};
