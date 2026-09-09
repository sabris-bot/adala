import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    PieChart as RechartsPieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip as RechartsTooltip,
    Legend,
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import { 
    Users, 
    Scale, 
    Printer, 
    Brain, 
    Sparkles, 
    AlertTriangle, 
    CheckCircle2, 
    BookOpen, 
    Coins, 
    Copy, 
    Check,
    FileSpreadsheet,
    Shield,
    DollarSign,
    Layers,
    ListFilter,
    LayoutGrid,
    Table as TableIcon,
    HelpCircle,
    ArrowRightLeft,
    TrendingUp,
    Info,
    Bookmark,
    Download,
    BarChart3,
    PieChart as PieIcon
} from 'lucide-react';
import { InheritanceCalculation } from '../../services/inheritanceEngine';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { ComplexCasesExplainerModal } from './ComplexCasesExplainerModal';
import { DualJurisdictionSideComparison } from './DualJurisdictionSideComparison';

const ROYAL_PALETTE = [
    '#D4AF37', // Kuwait Gold
    '#059669', // Emerald
    '#0F172A', // Royal Navy
    '#2563EB', // Sapphire Blue
    '#D97706', // Amber Bronze
    '#7C3AED', // Royal Purple
    '#0D9488', // Teal
    '#DC2626', // Crimson
    '#4F46E5', // Indigo
    '#BE185D'  // Rose
];

interface Props {
    calculation: InheritanceCalculation | null;
    sunniCalc?: InheritanceCalculation | null;
    jafariCalc?: InheritanceCalculation | null;
    onTriggerPrint: (calc: InheritanceCalculation) => void;
    onGenerateAIReport: () => void;
    isAIReportLoading: boolean;
    aiReportText: string;
    onOpenScenarios?: () => void;
    onSaveCase?: () => void;
    onOpenAIDraftModal?: () => void;
    onNavigateToZakat?: () => void;
    onOpenAIConsultant?: () => void;
}

export const ResultsDashboard: React.FC<Props> = ({
    calculation,
    sunniCalc,
    jafariCalc,
    onTriggerPrint,
    onGenerateAIReport,
    isAIReportLoading,
    aiReportText,
    onOpenScenarios,
    onSaveCase,
    onOpenAIDraftModal,
    onNavigateToZakat,
    onOpenAIConsultant
}) => {
    const { addToast } = useToast();
    const [resultTab, setResultTab] = useState<'distribution' | 'comparison' | 'inventory' | 'exclusions' | 'steps' | 'sharia'>('distribution');
    const [displayMode, setDisplayMode] = useState<'cards' | 'table'>('cards');
    const [chartMode, setChartMode] = useState<'donut' | 'bar'>('donut');
    const [hoveredSliceIndex, setHoveredSliceIndex] = useState<number | null>(null);
    const [copiedReport, setCopiedReport] = useState(false);
    const [copiedFullSummary, setCopiedFullSummary] = useState(false);
    const [copiedShareId, setCopiedShareId] = useState<string | null>(null);

    // Complex cases explainer modal
    const [isExplainerOpen, setIsExplainerOpen] = useState(false);
    const [explainerTopicId, setExplainerTopicId] = useState<string>('omariyyatan');

    if (!calculation) {
        return (
            <Card className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl text-slate-400">
                <Scale className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
                <h5 className="text-xs font-black text-slate-700 dark:text-slate-200">لا يوجد حساب نشط حالياً</h5>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed max-w-xs mx-auto">
                    أدخل ممتلكات التركة المالية وقرابات الورثة لإنتاج محاكاة التقسيم الشرعي ومصح الإرث تلقائياً.
                </p>
            </Card>
        );
    }

    const pieData = calculation.shares
        .filter(s => !s.isExcluded && s.amount > 0)
        .map(s => ({
            name: s.heirLabel,
            value: s.amount,
            count: s.count,
            percentage: (s.shareValue * 100).toFixed(2),
            shareLabel: s.shareLabel,
            evidence: s.evidence?.article || 'قانون 51/1984'
        }));

    const handleCopyReport = () => {
        if (!aiReportText) return;
        navigator.clipboard.writeText(aiReportText);
        setCopiedReport(true);
        addToast({ type: 'success', title: 'تم النسخ', message: 'تم نسخ نص الفتوى الاستشارية للحافظة.' });
        setTimeout(() => setCopiedReport(false), 2000);
    };

    const handleCopySingleShare = (share: any, idx: number) => {
        const individualAmount = share.count > 1 ? ` (لكل واحد: ${(share.amount / share.count).toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك)` : '';
        const text = `【نصيب ${share.heirLabel}】: ${share.shareLabel} | النسبة: ${(share.shareValue * 100).toFixed(2)}% | المبلغ الصافي: ${share.amount.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك${individualAmount} | السند: ${share.evidence?.article || 'قانون الأحوال الشخصية الكويتي'}`;
        navigator.clipboard.writeText(text);
        setCopiedShareId(String(idx));
        addToast({ type: 'success', title: 'تم النسخ السريع', message: `تم نسخ بيانات نصيب ${share.heirLabel} بنجاح.` });
        setTimeout(() => setCopiedShareId(null), 2000);
    };

    const handleCopyFullSummary = () => {
        let text = `【بيان حصر الإرث والأنصبة الشرعية - مكتب المحامي صبري شطا】\n`;
        text += `المورث: ${calculation.deceasedName || 'غير معنون'} (${calculation.deceasedGender === 'M' ? 'متوفى' : 'متوفاة'})\n`;
        text += `المذهب المعتمد: ${calculation.madhab === 'sunni' ? 'سني (قانون الأحوال الشخصية رقم 51/1984)' : 'جعفري (نظام الطبقات)'}\n`;
        text += `إجمالي التركة: ${calculation.totalEstate.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك\n`;
        text += `الديون والتجهيز والوصايا: ${(calculation.debts + calculation.funeralExpenses + calculation.wills).toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك\n`;
        text += `صافي التركة القابلة للقسمة: ${calculation.netEstate.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك\n`;
        text += `أصل المسألة: ${calculation.baseProblem || '-'} | الحالة: ${calculation.isAoul ? 'عول (تزاحم سهام)' : calculation.isRadd ? 'رد الفائض' : 'عادلة'}\n`;
        text += `--------------------------------------------------\n`;
        text += `تفصيل وتوزيع الأنصبة المستحقة:\n`;
        calculation.shares.forEach(s => {
            const ind = s.count > 1 ? ` [لكل واحد: ${(s.amount / s.count).toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك]` : '';
            text += `- ${s.heirLabel} (${s.count}): ${s.shareLabel} = ${s.amount.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك (${(s.shareValue * 100).toFixed(2)}%)${ind}\n`;
        });
        if (calculation.excludedHeirs.length > 0) {
            text += `\nالمحجوبون من الإرث:\n`;
            calculation.excludedHeirs.forEach(e => {
                text += `- ${e.label}: محجوب بواسطة (${e.excludedBy}) - السبب: ${e.reason}\n`;
            });
        }
        navigator.clipboard.writeText(text);
        setCopiedFullSummary(true);
        addToast({ type: 'success', title: 'تم النسخ الكامل', message: 'تم نسخ ملخص التوزيع الشرعي بالكامل للحافظة.' });
        setTimeout(() => setCopiedFullSummary(false), 2000);
    };

    const assetItems = [
        { label: 'السيولة النقدية والمصارف', val: calculation.assets?.cash || 0 },
        { label: 'العقارات والأراضي', val: calculation.assets?.realEstate || 0 },
        { label: 'الأسهم والمحافظ الاستثمارية', val: calculation.assets?.stocks || 0 },
        { label: 'الذهب والمجوهرات', val: calculation.assets?.jewelry || 0 },
        { label: 'المركبات والآليات', val: calculation.assets?.vehicles || 0 },
        { label: 'الديون المرجوة (ذمم مدينة)', val: calculation.assets?.receivables || 0 },
        { label: 'مكافأة نهاية الخدمة والمعاش التقاعدي', val: calculation.assets?.endOfService || 0 },
        { label: 'الشركات والرخص التجارية', val: calculation.assets?.businessLicenses || 0 },
        { label: 'أصول وممتلكات عينية أخرى', val: calculation.assets?.otherAssets || 0 },
    ].filter(a => a.val > 0);

    const openTopic = (topicId: string) => {
        setExplainerTopicId(topicId);
        setIsExplainerOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Net Estate Banner Card */}
            <Card className="p-5 sm:p-6 border border-[#D4AF37]/40 shadow-xl bg-gradient-to-br from-[#0F2744] via-[#0A1C30] to-[#0A192F] text-white rounded-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                            <span className="text-[11px] font-black tracking-wider text-[#D4AF37] uppercase">
                                صافي التركة المقررة للقسمة القضائية
                            </span>
                        </div>
                        <h4 className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-[#10B981]">
                            {calculation.netEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
                            <span className="text-sm font-bold text-[#D4AF37] font-sans">د.ك (دينار كويتي)</span>
                        </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-2 bg-slate-900/90 px-3.5 py-2 rounded-xl border border-[#D4AF37]/30">
                            <Shield className="w-4 h-4 text-[#D4AF37]" />
                            <div className="text-start">
                                <span className="text-[9px] text-slate-400 block">المذهب المعتمد</span>
                                <span className="text-xs font-bold text-[#E6CA65]">
                                    {calculation.madhab === 'sunni' ? 'سني (قانون 51/1984)' : 'جعفري (الطبقات)'}
                                </span>
                            </div>
                        </div>

                        {onOpenScenarios && (
                            <Button
                                size="sm"
                                onClick={onOpenScenarios}
                                className="bg-[#D4AF37] hover:bg-[#B8902A] text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-sm border border-[#D4AF37] cursor-pointer"
                            >
                                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-950" />
                                مقارن السيناريوهات
                            </Button>
                        )}
                    </div>
                </div>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800 text-xs font-mono">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">إجمالي الأصول</span>
                        <span className="font-bold text-slate-200 text-sm">
                            {calculation.totalEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                        </span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">الديون والتجهيز</span>
                        <span className="font-bold text-rose-400 text-sm">
                            {(calculation.debts + calculation.funeralExpenses).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                        </span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">أصل المسألة</span>
                        <span className="font-bold text-[#D4AF37] text-sm">
                            {calculation.baseProblem || '-'}
                        </span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                        <span className="text-[10px] text-slate-400 block font-sans">حالة المسألة</span>
                        <span className="font-bold text-[#10B981] font-sans text-xs flex items-center gap-1 mt-0.5">
                            <span>{calculation.isAoul ? 'عول (تزاحم سهام)' : calculation.isRadd ? 'رد الفائض' : 'عادلة متوازنة'}</span>
                        </span>
                    </div>
                </div>

                {/* Contextual Smart Explainer Triggers */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[10px] text-slate-400 font-bold">شروح المسائل الفقهية المرتبطة:</span>
                    {calculation.isAoul && (
                        <button
                            type="button"
                            onClick={() => openTopic('aoul_rules')}
                            className="px-2.5 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-black flex items-center gap-1 transition-all"
                        >
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            لماذا عالت المسألة؟ (المادة 326)
                        </button>
                    )}
                    {calculation.isRadd && (
                        <button
                            type="button"
                            onClick={() => openTopic('radd_rules')}
                            className="px-2.5 py-1 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-black flex items-center gap-1 transition-all"
                        >
                            <Sparkles className="w-3 h-3 text-emerald-400" />
                            أحكام رد الفائض (المادة 326)
                        </button>
                    )}
                    {calculation.shares.some(s => s.shareLabel.includes('ثلث الباقي')) && (
                        <button
                            type="button"
                            onClick={() => openTopic('omariyyatan')}
                            className="px-2.5 py-1 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40 text-[10px] font-black flex items-center gap-1 transition-all"
                        >
                            <BookOpen className="w-3 h-3" />
                            تفسير المسألة العمرية (المادة 292)
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => openTopic('omariyyatan')}
                        className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center gap-1"
                    >
                        <HelpCircle className="w-3 h-3 text-[#D4AF37]" />
                        الموسوعة الفقهية للمسائل المعقدة
                    </button>
                </div>
            </Card>

            {/* Recharts Interactive Visualizer & Segmented Distribution Bar */}
            {pieData.length > 0 && (
                <Card className="p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-card bg-white dark:bg-[#132742] rounded-2xl transition-all">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]"></span>
                                الرسوم البيانية التفاعلية لتوزيع الحصص والأنصبة الشرعية
                            </h4>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                تمثيل بصري تفاعلي لتسهيل استيعاب الأنصبة للموكلين من إجمالي صافي التركة ({calculation.netEstate.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك)
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Switch between Donut and Bar Chart */}
                            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setChartMode('donut')}
                                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                        chartMode === 'donut'
                                            ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <PieIcon className="w-3.5 h-3.5" />
                                    <span>مخطط دائري</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChartMode('bar')}
                                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                        chartMode === 'bar'
                                            ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-sm'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    <span>مقارنة المبالغ</span>
                                </button>
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCopyFullSummary}
                                className="text-xs font-bold rounded-xl border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                                {copiedFullSummary ? <Check className="w-3.5 h-3.5 me-1.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 me-1.5 text-amber-500" />}
                                <span>{copiedFullSummary ? 'تم النسخ' : 'نسخ التوزيع'}</span>
                            </Button>
                        </div>
                    </div>

                    {/* Segmented Distribution Ribbon Bar */}
                    <div className="mb-5 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                        <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center justify-between">
                            <span>الشريط النسبي التراكمي للتوزيع:</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">100% مكتمل التوزيع</span>
                        </div>
                        <div className="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-800 shadow-inner">
                            {pieData.map((item, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        width: `${item.percentage}%`,
                                        backgroundColor: ROYAL_PALETTE[idx % ROYAL_PALETTE.length]
                                    }}
                                    onMouseEnter={() => setHoveredSliceIndex(idx)}
                                    onMouseLeave={() => setHoveredSliceIndex(null)}
                                    className="h-full transition-all duration-300 hover:opacity-85 cursor-pointer"
                                    title={`${item.name}: ${item.percentage}% (${Number(item.value).toLocaleString()} د.ك)`}
                                />
                            ))}
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[10px]">
                            {pieData.map((item, idx) => (
                                <div 
                                    key={idx} 
                                    onMouseEnter={() => setHoveredSliceIndex(idx)}
                                    onMouseLeave={() => setHoveredSliceIndex(null)}
                                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                                        hoveredSliceIndex === idx ? 'bg-amber-100 dark:bg-slate-800 ring-1 ring-[#D4AF37]' : ''
                                    }`}
                                >
                                    <span
                                        className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                                        style={{ backgroundColor: ROYAL_PALETTE[idx % ROYAL_PALETTE.length] }}
                                    />
                                    <span className="text-slate-700 dark:text-slate-300 font-bold">{item.name}</span>
                                    <span className="text-slate-500 dark:text-slate-400 font-mono">({item.percentage}%)</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Chart Canvas */}
                    <div className="relative w-full h-72 sm:h-80">
                        {chartMode === 'donut' ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={pieData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={68}
                                            outerRadius={105}
                                            paddingAngle={3}
                                            dataKey="value"
                                            onMouseEnter={(_, index) => setHoveredSliceIndex(index)}
                                            onMouseLeave={() => setHoveredSliceIndex(null)}
                                        >
                                            {pieData.map((_, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={ROYAL_PALETTE[index % ROYAL_PALETTE.length]} 
                                                    stroke="#0F172A"
                                                    strokeWidth={hoveredSliceIndex === index ? 3 : 1.5}
                                                    className="transition-all duration-200 cursor-pointer"
                                                />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip 
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="p-3 bg-slate-950 text-white rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1 text-start z-50">
                                                            <div className="font-black text-[#D4AF37]">{data.name}</div>
                                                            <div className="text-[11px] text-slate-300">{data.shareLabel}</div>
                                                            <div className="font-mono font-black text-emerald-400 text-sm">
                                                                {Number(data.value).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                                                            </div>
                                                            <div className="text-[10px] text-slate-400">النسبة من التركة: {data.percentage}%</div>
                                                            <div className="text-[9px] text-slate-400">السند: {data.evidence}</div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Legend 
                                            wrapperStyle={{ fontSize: '11px', direction: 'rtl', paddingTop: '10px' }} 
                                        />
                                    </RechartsPieChart>
                                </ResponsiveContainer>

                                {/* Central Focus Element inside Donut */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                                    <div className="text-center p-2 rounded-full w-32 h-32 flex flex-col items-center justify-center bg-white/90 dark:bg-[#132742]/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 shadow-inner">
                                        {hoveredSliceIndex !== null && pieData[hoveredSliceIndex] ? (
                                            <>
                                                <span className="text-[10px] text-[#D4AF37] font-black truncate max-w-[110px]">
                                                    {pieData[hoveredSliceIndex].name}
                                                </span>
                                                <span className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400">
                                                    {Number(pieData[hoveredSliceIndex].value).toLocaleString(undefined, { maximumFractionDigits: 0 })} د.ك
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-500 font-mono">
                                                    {pieData[hoveredSliceIndex].percentage}%
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span className="text-[9px] text-slate-400 font-bold">صافي التركة</span>
                                                <span className="text-xs font-black font-mono text-[#0F2744] dark:text-[#D4AF37]">
                                                    {calculation.netEstate.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                                </span>
                                                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                                                    د.ك موزعة بالكامل
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart 
                                    data={pieData} 
                                    layout="vertical"
                                    margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                                    <XAxis 
                                        type="number" 
                                        tickFormatter={(val) => `${(val / 1000).toFixed(0)}k د.ك`}
                                        tick={{ fontSize: 10, fill: '#64748b' }}
                                    />
                                    <YAxis 
                                        type="category" 
                                        dataKey="name" 
                                        width={110} 
                                        tick={{ fontSize: 11, fill: '#64748b' }} 
                                    />
                                    <RechartsTooltip 
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="p-3 bg-slate-950 text-white rounded-2xl shadow-2xl border border-slate-700 text-xs space-y-1 text-start">
                                                        <div className="font-black text-[#D4AF37]">{data.name}</div>
                                                        <div className="text-[11px] text-slate-300">{data.shareLabel}</div>
                                                        <div className="font-mono font-black text-emerald-400 text-sm">
                                                            {Number(data.value).toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                                                        </div>
                                                        <div className="text-[10px] text-slate-400">النسبة: {data.percentage}%</div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                                        {pieData.map((_, index) => (
                                            <Cell 
                                                key={`bar-${index}`} 
                                                fill={ROYAL_PALETTE[index % ROYAL_PALETTE.length]} 
                                            />
                                        ))}
                                    </Bar>
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            )}

            {/* Executive Legal Actions Toolbar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5">
                {/* 1. PDF Export / Print Certificate */}
                <Button
                    onClick={() => onTriggerPrint(calculation)}
                    className="bg-[#0F2744] hover:bg-[#0A1C30] text-white h-11 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border border-[#0F2744] dark:border-slate-700"
                >
                    <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>تصدير PDF</span>
                </Button>

                {/* 2. AI Legal Consultant (Complex Estates & Multiple Debts) */}
                {onOpenAIConsultant && (
                    <Button
                        onClick={onOpenAIConsultant}
                        className="bg-gradient-to-r from-[#0F2744] to-[#1a3a60] hover:from-[#0A1C30] hover:to-[#0F2744] text-[#D4AF37] border border-[#D4AF37]/60 h-11 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <Brain className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>الذكاء الاستشاري</span>
                    </Button>
                )}

                {/* 3. Side-by-side Jurisdiction Comparison */}
                <Button
                    onClick={() => setResultTab('comparison')}
                    className="bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-900 dark:text-[#D4AF37] border border-amber-300/80 dark:border-amber-700/60 h-11 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                    <ArrowRightLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>مقارنة المذهبين</span>
                </Button>

                {/* 4. AI Legal Memorandum Drafting */}
                <Button
                    onClick={() => {
                        if (onOpenAIDraftModal) {
                            onOpenAIDraftModal();
                        } else {
                            onGenerateAIReport();
                        }
                    }}
                    disabled={isAIReportLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                    {isAIReportLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    )}
                    <span>مذكرة الإرث</span>
                </Button>

                {/* 5. Save to Archive Case Record */}
                {onSaveCase && (
                    <Button
                        onClick={onSaveCase}
                        className="bg-white hover:bg-slate-50 dark:bg-[#0A1C30] dark:hover:bg-[#132742] text-slate-800 dark:text-[#D4AF37] border border-slate-200 dark:border-[#D4AF37]/40 h-11 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <Bookmark className="w-3.5 h-3.5 text-emerald-600 dark:text-[#D4AF37]" />
                        <span>حفظ بالسجل</span>
                    </Button>
                )}

                {/* 6. Estate Zakat Calculator Navigation */}
                {onNavigateToZakat && (
                    <Button
                        onClick={onNavigateToZakat}
                        className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 h-11 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                        <Coins className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>زكاة التركة</span>
                    </Button>
                )}
            </div>

            {/* AI Generated Report Box */}
            {aiReportText && (
                <Card className="p-6 border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-3xl text-slate-800 dark:text-slate-200 text-xs leading-relaxed space-y-3">
                    <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80 dark:border-emerald-800/50">
                        <span className="font-black text-emerald-950 dark:text-emerald-400 text-xs flex items-center gap-2">
                            <Brain className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                            مذكرة الفتوى والاستشارة الشرعية والقضائية
                        </span>
                        <button
                            type="button"
                            onClick={handleCopyReport}
                            className="text-[11px] text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 font-bold flex items-center gap-1"
                        >
                            {copiedReport ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedReport ? 'تم النسخ' : 'نسخ المذكرة'}</span>
                        </button>
                    </div>
                    <div className="whitespace-pre-wrap font-sans text-xs text-slate-700 dark:text-slate-300 leading-loose">
                        {aiReportText}
                    </div>
                </Card>
            )}

            {/* Detailed Tables & Smart Cards View */}
            <Card className="p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700/80 shadow-card bg-white dark:bg-[#132742] rounded-2xl transition-all">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                            جدول تفصيل وتأصيل الأنصبة الشرعية
                        </h3>

                        {/* Smart Cards vs Table View Switcher */}
                        {resultTab === 'distribution' && (
                            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setDisplayMode('cards')}
                                    className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                        displayMode === 'cards' 
                                            ? 'bg-white dark:bg-[#0F2744] text-slate-900 dark:text-white shadow-xs' 
                                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                    title="عرض الكروت الذكية"
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline text-[10px]">كروت ذكية</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDisplayMode('table')}
                                    className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                        displayMode === 'table' 
                                            ? 'bg-white dark:bg-[#0F2744] text-slate-900 dark:text-white shadow-xs' 
                                            : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                                    }`}
                                    title="عرض الجدول"
                                >
                                    <TableIcon className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline text-[10px]">جدول</span>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold gap-1">
                        <button
                            type="button"
                            onClick={() => setResultTab('distribution')}
                            className={`px-3 py-1.5 rounded-lg transition-all text-xs cursor-pointer ${
                                resultTab === 'distribution'
                                    ? 'bg-white dark:bg-[#0F2744] text-slate-900 dark:text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            الأنصبة ({calculation.shares.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setResultTab('comparison')}
                            className={`px-3 py-1.5 rounded-lg transition-all text-xs cursor-pointer flex items-center gap-1.5 ${
                                resultTab === 'comparison'
                                    ? 'bg-[#D4AF37] text-slate-950 font-black shadow-xs'
                                    : 'text-amber-800 dark:text-[#D4AF37] hover:bg-amber-100/50 dark:hover:bg-slate-800'
                            }`}
                        >
                            <ArrowRightLeft className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>مقارنة المذهبين</span>
                            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setResultTab('inventory')}
                            className={`px-3 py-1.5 rounded-lg transition-all text-xs cursor-pointer ${
                                resultTab === 'inventory'
                                    ? 'bg-white dark:bg-[#0F2744] text-slate-900 dark:text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            حصر الأصول ({assetItems.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setResultTab('exclusions')}
                            className={`px-3 py-1.5 rounded-lg transition-all text-xs cursor-pointer ${
                                resultTab === 'exclusions'
                                    ? 'bg-white dark:bg-[#0F2744] text-slate-900 dark:text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            المحجوبون ({calculation.excludedHeirs.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setResultTab('steps')}
                            className={`px-3 py-1.5 rounded-lg transition-all text-xs cursor-pointer ${
                                resultTab === 'steps'
                                    ? 'bg-white dark:bg-[#0F2744] text-slate-900 dark:text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            خطوات التصفية
                        </button>
                        <button
                            type="button"
                            onClick={() => setResultTab('sharia')}
                            className={`px-3 py-1.5 rounded-lg transition-all text-xs cursor-pointer ${
                                resultTab === 'sharia'
                                    ? 'bg-white dark:bg-[#0F2744] text-slate-900 dark:text-white shadow-xs'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            السند القانوني
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {resultTab === 'distribution' && (
                        <motion.div
                            key="dist"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            {displayMode === 'cards' ? (
                                /* Smart Cards Grid View */
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {calculation.shares.map((share, idx) => {
                                        const color = ROYAL_PALETTE[idx % ROYAL_PALETTE.length];
                                        const isSingleCopied = copiedShareId === String(idx);
                                        const individualShare = share.count > 1 ? share.amount / share.count : null;

                                        return (
                                            <div
                                                key={idx}
                                                className="p-4 bg-slate-50/70 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-500 rounded-3xl transition-all shadow-xs hover:shadow-md flex flex-col justify-between space-y-3 relative overflow-hidden group"
                                            >
                                                {/* Top Accent Strip */}
                                                <div 
                                                    className="absolute top-0 right-0 left-0 h-1"
                                                    style={{ backgroundColor: color }}
                                                />

                                                <div className="space-y-2.5">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="flex items-center gap-2.5">
                                                            <div 
                                                                className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-xs"
                                                                style={{ backgroundColor: color }}
                                                            >
                                                                {idx + 1}
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                                                    {share.heirLabel}
                                                                </h4>
                                                                <span className="text-[10px] text-slate-400 font-bold block">
                                                                    العدد: {share.count} {share.count > 1 ? 'أشخاص' : 'مستحق'}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <span className="text-[10px] font-black font-mono px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                                            {(share.shareValue * 100).toFixed(2)}%
                                                        </span>
                                                    </div>

                                                    {/* Share Category Badge & Description */}
                                                    <div className="p-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-700/70">
                                                        <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                                                            <span>نوع الفرض / الصفة:</span>
                                                            <span className="text-amber-600 dark:text-amber-400 font-black">{share.shareLabel}</span>
                                                        </div>
                                                    </div>

                                                    {/* Amount Display */}
                                                    <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 text-center">
                                                        <span className="text-[9px] text-slate-400 font-sans block">الصافي المالي الإجمالي المستحق</span>
                                                        <span className="text-base font-black font-mono text-amber-400">
                                                            {share.amount.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })}{' '}
                                                            <span className="text-[10px] text-slate-300 font-sans">د.ك</span>
                                                        </span>

                                                        {individualShare !== null && (
                                                            <div className="text-[10px] text-slate-300 border-t border-slate-800 pt-1 mt-1 font-mono">
                                                                نصيب كل فرد: {individualShare.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Legal Basis summary */}
                                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed bg-slate-100/50 dark:bg-slate-800/40 p-2 rounded-xl">
                                                        <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
                                                            {share.evidence?.article?.split('من قانون')[0] || 'قانون الأحوال الشخصية'}
                                                        </span>
                                                        "{share.evidence?.text}"
                                                    </div>
                                                </div>

                                                {/* Card Quick Copy Action */}
                                                <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleCopySingleShare(share, idx)}
                                                        className="w-full h-8 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl transition-all shadow-2xs"
                                                    >
                                                        {isSingleCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-500" />}
                                                        <span>{isSingleCopied ? 'تم نسخ الحصة' : 'نسخ تفاصيل الحصة'}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                /* Tabular View */
                                <div className="overflow-x-auto">
                                    <table className="w-full text-start text-xs">
                                        <thead>
                                            <tr className="text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 pb-2.5">
                                                <th className="text-start pb-2">الوارث وصفته</th>
                                                <th className="text-start pb-2">العدد</th>
                                                <th className="text-start pb-2">نوع الفرض والصفة</th>
                                                <th className="text-start pb-2">النسبة (%)</th>
                                                <th className="text-start pb-2">الصافي المستحق (KWD)</th>
                                                <th className="text-start pb-2">السند التشريعي</th>
                                                <th className="text-end pb-2">إجراء</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {calculation.shares.map((share, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                                                    <td className="py-3 font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                                        <span
                                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                            style={{ backgroundColor: ROYAL_PALETTE[idx % ROYAL_PALETTE.length] }}
                                                        ></span>
                                                        <span>{share.heirLabel}</span>
                                                    </td>
                                                    <td className="py-3 font-bold font-mono text-slate-600 dark:text-slate-400">{share.count}</td>
                                                    <td className="py-3 font-bold text-slate-700 dark:text-slate-300">{share.shareLabel}</td>
                                                    <td className="py-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">
                                                        {(share.shareValue * 100).toFixed(2)}%
                                                    </td>
                                                    <td className="py-3 font-mono font-black text-slate-900 dark:text-white">
                                                        {share.amount.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك
                                                    </td>
                                                    <td className="py-3 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                                                        {share.evidence?.article?.split('من قانون')[0] || 'الأحوال الشخصية'}
                                                    </td>
                                                    <td className="py-3 text-end">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleCopySingleShare(share, idx)}
                                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                                                copiedShareId === String(idx)
                                                                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                                                                    : 'text-slate-500 dark:text-slate-400 hover:text-[#0A192F] dark:hover:text-[#D4AF37] hover:bg-slate-100 dark:hover:bg-slate-800'
                                                            }`}
                                                            title="نسخ بيانات الحصة"
                                                        >
                                                            {copiedShareId === String(idx) ? (
                                                                <>
                                                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                                                    <span className="text-[11px]">تم النسخ</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-3.5 h-3.5" />
                                                                    <span className="text-[11px]">نسخ التفاصيل</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {resultTab === 'comparison' && (
                        <motion.div
                            key="comparison"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <DualJurisdictionSideComparison
                                sunniCalc={sunniCalc || (calculation?.madhab === 'sunni' ? calculation : null)}
                                jafariCalc={jafariCalc || (calculation?.madhab === 'jafari' ? calculation : null)}
                                compact={false}
                            />
                        </motion.div>
                    )}

                    {resultTab === 'inventory' && (
                        <motion.div
                            key="inv"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">الأصول المحصورة:</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                    {assetItems.length > 0 ? (
                                        assetItems.map((item, idx) => (
                                            <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl flex justify-between items-center text-xs">
                                                <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{item.label}</span>
                                                <span className="font-mono font-black text-slate-900 dark:text-white">{item.val.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-3 text-center py-4 text-xs text-slate-400">
                                            لم يتم تسجيل أصول عينية مفصلة.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">الاستقطاعات والتصفيات الشرعية (المادة 289):</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                    <div className="p-3 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl text-xs">
                                        <span className="text-slate-500 dark:text-slate-400 text-[10px] block">حقوق الرهن والعين:</span>
                                        <span className="font-black font-mono text-rose-700 dark:text-rose-400">{(calculation.deductions?.securedDebts || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                                    </div>
                                    <div className="p-3 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl text-xs">
                                        <span className="text-slate-500 dark:text-slate-400 text-[10px] block">نفقات التجهيز والتكفين:</span>
                                        <span className="font-black font-mono text-rose-700 dark:text-rose-400">{(calculation.funeralExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                                    </div>
                                    <div className="p-3 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl text-xs">
                                        <span className="text-slate-500 dark:text-slate-400 text-[10px] block">الديون المرسلة والإلهية:</span>
                                        <span className="font-black font-mono text-rose-700 dark:text-rose-400">{(calculation.debts || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                                    </div>
                                    <div className="p-3 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl text-xs">
                                        <span className="text-slate-500 dark:text-slate-400 text-[10px] block">الوصايا المنفذة (حد الثلث):</span>
                                        <span className="font-black font-mono text-amber-700 dark:text-amber-400">{(calculation.wills || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {resultTab === 'exclusions' && (
                        <motion.div
                            key="excl"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            {calculation.excludedHeirs.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {calculation.excludedHeirs.map((ex, idx) => (
                                        <div key={idx} className="p-3.5 bg-rose-50/40 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 rounded-2xl flex gap-3 text-xs">
                                            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <h5 className="font-black text-slate-800 dark:text-slate-200">
                                                    {ex.label} <span className="text-[10px] text-slate-400 font-normal">(العدد: {ex.count})</span>
                                                </h5>
                                                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">{ex.reason}</p>
                                                <span className="text-[9px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100/60 dark:bg-rose-900/40 px-2 py-0.5 rounded mt-1.5 inline-block">
                                                    محجوب بواسطة: {ex.excludedBy}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-xs">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                                    <span>لا يوجد ورثة محجوبون في هذه المسألة، جميع الأقارب المدخلين مستحقون.</span>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {resultTab === 'steps' && (
                        <motion.div
                            key="steps"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-2.5"
                        >
                            {calculation.steps.map((step, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs">
                                    <div className="w-5 h-5 rounded-full bg-slate-900 text-amber-400 font-bold flex items-center justify-center flex-shrink-0 text-[10px]">
                                        {idx + 1}
                                    </div>
                                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {resultTab === 'sharia' && (
                        <motion.div
                            key="sharia"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-3"
                        >
                            {calculation.shares.map((share, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                                    <div className="flex justify-between items-center">
                                        <h5 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                            <span
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: ROYAL_PALETTE[idx % ROYAL_PALETTE.length] }}
                                            ></span>
                                            <span>{share.heirLabel}</span> - <span>{share.shareLabel}</span>
                                        </h5>
                                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">
                                            {share.evidence.source}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 italic bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px]">
                                        "{share.evidence.text}"
                                    </p>
                                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block">
                                        {share.evidence.article}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            {/* Complex Cases Explainer Modal */}
            <ComplexCasesExplainerModal
                isOpen={isExplainerOpen}
                onClose={() => setIsExplainerOpen(false)}
                initialTopicId={explainerTopicId}
            />
        </div>
    );
};
