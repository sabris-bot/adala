import React, { useState, useEffect } from 'react';
import { 
    Sparkles, 
    Scale, 
    AlertCircle, 
    CheckCircle2, 
    Copy, 
    Check, 
    Printer, 
    Download, 
    RefreshCw, 
    ShieldCheck, 
    Building, 
    Coins, 
    Layers, 
    HelpCircle, 
    ArrowRight,
    TrendingDown,
    FileText,
    BadgeAlert
} from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { InheritanceCalculation, EstateAssets, EstateDeductions } from '../../services/inheritanceEngine';
import { useToast } from '../ui/Toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    calculation: InheritanceCalculation | null;
    assets: EstateAssets;
    deductions: EstateDeductions;
}

export const EstateAIConsultantModal: React.FC<Props> = ({
    isOpen,
    onClose,
    calculation,
    assets,
    deductions
}) => {
    const { addToast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [consultationText, setConsultationText] = useState<string>('');
    const [specialNotes, setSpecialNotes] = useState<string>('');
    const [selectedFocus, setSelectedFocus] = useState<'comprehensive' | 'debt_liquidation' | 'amicable_division' | 'minors_protection'>('comprehensive');
    const [isCopied, setIsCopied] = useState(false);

    // Financial Analysis Calculations
    const totalAssets = Object.values(assets || {}).reduce((acc, val) => acc + (Number(val) || 0), 0);
    const securedDebts = Number(deductions?.securedDebts || 0);
    const funeralExpenses = Number(deductions?.funeralExpenses || 0);
    const unsecuredDebts = Number(deductions?.unsecuredDebts || 0);
    const wills = Number(deductions?.wills || 0);
    const totalDebts = securedDebts + funeralExpenses + unsecuredDebts;
    const netEstate = Math.max(0, totalAssets - totalDebts - wills);
    const isDeficit = totalDebts > totalAssets;
    const deficitAmount = Math.max(0, totalDebts - totalAssets);
    const cash = Number(assets?.cash || 0);
    const realEstate = Number(assets?.realEstate || 0);
    const debtRatio = totalAssets > 0 ? (totalDebts / totalAssets) * 100 : 100;

    const fetchAIConsultation = async () => {
        setIsLoading(true);
        try {
            const payload = {
                deceasedName: calculation?.deceasedName || 'المورث',
                deceasedGender: calculation?.deceasedGender || 'M',
                madhab: calculation?.madhab || 'sunni',
                totalEstate: totalAssets,
                netEstate: netEstate,
                assets: assets,
                deductions: deductions,
                heirs: calculation?.shares || [],
                specialCircumstances: specialNotes ? `${specialNotes} (محور التركيز المطلوب: ${selectedFocus})` : `محور التركيز المطلوب: ${selectedFocus}`
            };

            const res = await fetch('/api/inheritance/ai-consultant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error(`Server returned ${res.status}`);
            }

            const data = await res.json();
            setConsultationText(data.consultation || 'تعذر استخراج الاستشارة.');
            addToast({ type: 'success', title: 'تم التحليل والاستشارة', message: 'تم إعداد الاستشارة القانونية الذكية بنجاح.' });
        } catch (err) {
            console.error('AI Consultant fetch failed:', err);
            // Dynamic client fallback if server fetch fails
            const clientFallback = `## تقرير الاستشارة القانونية الاستراتيجية في تصفية وقسمة التركة المعقدة
**مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية - دولة الكويت**
**المرجع:** قانون الأحوال الشخصية الكويتي رقم (51) لسنة 1984

### أولاً: التشخيص المالي والهيكلي للتركة والتزاماتها
- إجمالي الأصول المحصورة: ${totalAssets.toLocaleString()} د.ك
- إجمالي الديون والتجهيز: ${totalDebts.toLocaleString()} د.ك (نسبة استهلاك الديون: ${debtRatio.toFixed(1)}%)
- الوضع المحاسبي: ${isDeficit ? `⚠️ التركة مستغرقة بالديون بعجز (${deficitAmount.toLocaleString()} د.ك). لا تركة للورثة عملاً بالمادة 289.` : `صافي خالص للتوزيع قدره (${netEstate.toLocaleString()} د.ك).`}

### ثانياً: الترتيب الإلزامي لسداد الديون ومؤن التجهيز (المادة 289)
1. الحقوق العينية الممتازة (${securedDebts.toLocaleString()} د.ك): تُستوفى من أعيانها المرهونة أولاً.
2. نفقات التجهيز بالمعروف (${funeralExpenses.toLocaleString()} د.ك): من كفن ومؤن دفن معتادة.
3. الديون المرسلة في الذمة (${unsecuredDebts.toLocaleString()} د.ك): تسدد من سائر التركة، وتخضع لقسمة الغرماء عند العجز.
4. الوصايا (${wills.toLocaleString()} د.ك): في حدود الثلث الشرعي بعد استيفاء الديون.

### ثالثاً: خطة العمل الاستراتيجية لتجنب البيع الجبري
نوصي بالتفاوض الرضائي مع الدائنين لجدولة الديون أو تسييل الأصول المنقولة وتفادي دعاوى الفرز والبيع بالمزاد العلني.`;
            setConsultationText(clientFallback);
            addToast({ type: 'info', title: 'تم التوليد محلياً', message: 'تم تجهيز الاستشارة القانونية بالنموذج المعتمد.' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && !consultationText) {
            fetchAIConsultation();
        }
    }, [isOpen]);

    const handleCopy = () => {
        if (!consultationText) return;
        navigator.clipboard.writeText(consultationText);
        setIsCopied(true);
        addToast({ type: 'success', title: 'تم النسخ', message: 'تم نسخ الاستشارة القانونية للحافظة.' });
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handlePrint = () => {
        const win = window.open('', '_blank');
        if (!win) return;
        win.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="utf-8" />
                <title>استشارة قانونية في تصفية التركة - مكتب المحامي صبري شطا</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #0f172a; line-height: 1.8; }
                    h2, h3 { color: #0F2744; border-bottom: 2px solid #D4AF37; padding-bottom: 6px; }
                    hr { border: none; border-top: 1px solid #e2e8f0; margin: 20px 0; }
                    .header { text-align: center; margin-bottom: 30px; }
                    pre { white-space: pre-wrap; font-family: inherit; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية</h2>
                    <p>دولة الكويت | تقرير الاستشارة الذكية في قسمة التركات المعقدة</p>
                </div>
                <pre>${consultationText}</pre>
                <script>window.print();</script>
            </body>
            </html>
        `);
        win.document.close();
    };

    const handleDownload = () => {
        const blob = new Blob([consultationText], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `استشارة_تركة_${calculation?.deceasedName || 'معقدة'}_${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="الذكاء الاصطناعي الاستشاري: تحليل الديون والتركات المعقدة (قانون 51/1984)"
            size="xl"
        >
            <div className="space-y-6">
                {/* 1. FINANCIAL DIAGNOSTIC BAR */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">إجمالي موجودات التركة</span>
                        <span className="text-sm sm:text-base font-black font-mono text-slate-900 dark:text-white">
                            {totalAssets.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} د.ك
                        </span>
                        <span className="text-[10px] text-slate-500 block">نقد، عقارات، أسهم</span>
                    </div>

                    <div className={`p-3.5 rounded-2xl border space-y-1 ${
                        isDeficit 
                            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200' 
                            : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60 text-amber-950 dark:text-amber-200'
                    }`}>
                        <span className="text-[10px] block font-bold flex items-center gap-1">
                            <AlertCircle className="w-3 h-3 text-amber-600 dark:text-[#D4AF37]" />
                            مجموع الديون والالتزامات
                        </span>
                        <span className="text-sm sm:text-base font-black font-mono">
                            {totalDebts.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} د.ك
                        </span>
                        <span className="text-[10px] block font-bold">
                            {isDeficit ? `⚠️ استغراق بعجز ${deficitAmount.toLocaleString()} د.ك` : `نسبة الاستهلاك: ${debtRatio.toFixed(1)}%`}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-1">
                        <span className="text-[10px] text-blue-900 dark:text-blue-300 block font-bold">كفاية السيولة النقدية</span>
                        <span className="text-sm sm:text-base font-black font-mono text-blue-950 dark:text-white">
                            {cash.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} د.ك
                        </span>
                        <span className={`text-[10px] font-bold block ${cash >= totalDebts ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {cash >= totalDebts ? 'تغطي الديون بالكامل ✓' : 'عجز سيولة يتطلب تسييل'}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
                        <span className="text-[10px] text-emerald-900 dark:text-emerald-300 block font-bold">صافي التركة الخالص للتوزيع</span>
                        <span className="text-sm sm:text-base font-black font-mono text-emerald-950 dark:text-emerald-300">
                            {netEstate.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} د.ك
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block font-bold">
                            {calculation?.shares.length || 0} ورثة مستحقين
                        </span>
                    </div>
                </div>

                {/* 2. ADVISORY CONFIGURATION STRIP */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                            <h4 className="text-xs font-black text-slate-800 dark:text-white">
                                توجيه محور الاستشارة القانونية:
                            </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                            <button
                                type="button"
                                onClick={() => setSelectedFocus('comprehensive')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    selectedFocus === 'comprehensive'
                                        ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-2xs'
                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                                }`}
                            >
                                تحليل شامل
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedFocus('debt_liquidation')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    selectedFocus === 'debt_liquidation'
                                        ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-2xs'
                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                                }`}
                            >
                                جدولة الديون وتفادي المزاد
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedFocus('amicable_division')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    selectedFocus === 'amicable_division'
                                        ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-2xs'
                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                                }`}
                            >
                                عقود التخارج (المادة 318)
                            </button>
                            <button
                                type="button"
                                onClick={() => setSelectedFocus('minors_protection')}
                                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                    selectedFocus === 'minors_protection'
                                        ? 'bg-[#0F2744] text-white dark:bg-[#D4AF37] dark:text-slate-950 shadow-2xs'
                                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                                }`}
                            >
                                شؤون القُصّر
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                        <input
                            type="text"
                            value={specialNotes}
                            onChange={(e) => setSpecialNotes(e.target.value)}
                            placeholder="أضف ظروفاً خاصة للمسألة (مثال: نزاع على عمارة السالمية، ديون بنكية برهن رسمي، أو وجود قاصر)..."
                            className="w-full text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-[#D4AF37]"
                        />
                        <button
                            type="button"
                            onClick={fetchAIConsultation}
                            disabled={isLoading}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0F2744] hover:bg-[#0A1C30] dark:bg-[#D4AF37] dark:text-slate-950 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-sm shrink-0 cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                            <span>{isLoading ? 'جاري التحليل...' : 'تحديث الاستشارة'}</span>
                        </button>
                    </div>
                </div>

                {/* 3. CONSULTATION OUTPUT VIEWER */}
                <div className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4 max-h-[480px] overflow-y-auto">
                    {/* Header Action Bar */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 text-amber-700 dark:text-[#D4AF37] flex items-center justify-center font-bold">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-xs font-black text-slate-900 dark:text-white block">
                                    مذكرة الرأي القانوني والاستشاري الصادرة عن المكتب
                                </span>
                                <span className="text-[10px] text-slate-500">
                                    مبنية على نصوص قانون الأحوال الشخصية الكويتي (المواد 288-345)
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                onClick={handleCopy}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                                title="نسخ الاستشارة"
                            >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                            <button
                                type="button"
                                onClick={handlePrint}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                                title="طباعة الاستشارة"
                            >
                                <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                                type="button"
                                onClick={handleDownload}
                                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
                                title="تنزيل كملف نصي"
                            >
                                <Download className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="py-16 text-center space-y-3">
                            <div className="w-10 h-10 border-3 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                جاري استقراء نصوص القانون الكويتي وتحليل هيكل الديون والتركة...
                            </p>
                        </div>
                    ) : (
                        <div className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap font-sans space-y-3">
                            {consultationText}
                        </div>
                    )}
                </div>

                {/* 4. FOOTER EXECUTIVE DIRECTIVE */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>معتمد للاستخدام الاستشاري المباشر مع موكلي مكتب المحامي صبري شطا</span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            className="w-full sm:w-auto text-xs"
                        >
                            إغلاق
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleCopy}
                            className="w-full sm:w-auto text-xs flex items-center gap-1.5"
                        >
                            <Copy className="w-3.5 h-3.5" />
                            <span>نسخ الاستشارة الكاملة</span>
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
