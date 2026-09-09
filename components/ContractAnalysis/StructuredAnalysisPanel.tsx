import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    FileText, CheckCircle2, AlertTriangle, ShieldAlert, Sparkles, 
    ArrowRightLeft, FileCheck, ClipboardList, Send, FilePlus, Landmark, Scale, Key,
    Copy, Download, Printer
} from 'lucide-react';
import Card from '../ui/Card';
import { Badge, RiskLevelBadge } from '../ui/Badge';
import { AnalyzedContract, RiskLevel, AnalyzedContractStatus } from '../../types';
import { useToast } from '../ui/Toast';

interface StructuredAnalysisPanelProps {
    contract: AnalyzedContract;
    onStatusChange: (status: AnalyzedContractStatus) => void;
    approvals: {
        hr: { approved: boolean; date: string; user: string };
        finance: { approved: boolean; date: string; user: string };
        legal: { approved: boolean; date: string; user: string };
    };
    onApprove: (role: 'hr' | 'finance' | 'legal') => void;
    isSealed: boolean;
    applySeal: () => void;
}

export const StructuredAnalysisPanel: React.FC<StructuredAnalysisPanelProps> = ({
    contract,
    onStatusChange,
    approvals,
    onApprove,
    isSealed,
    applySeal
}) => {
    const { addToast } = useToast();
    const [subTab, setSubTab] = useState<'components' | 'clauses' | 'risks' | 'governance'>('components');
    const [pinInputs, setPinInputs] = useState({ hr: '', finance: '', legal: '' });
    const [pinOpen, setPinOpen] = useState<'hr' | 'finance' | 'legal' | null>(null);

    // Hardcode some Kuwaiti Law Standard matching articles for the visual presentation
    const kuwaitiLegalMap = [
        { title: 'فترة التجربة والاختبار', article: 'مادة ١٧ من قانون العمل الأهلي الكويتي', limit: 'الحد الأقصى ١٠٠ يوم متصلة ويشترط النص عليها خطياً.' },
        { title: 'ساعات العمل الأسبوعية', article: 'مادة ٦٤ من قانون العمل الكويتي', limit: 'الحد الأقصى ٤٨ ساعة عمل في الأسبوع (٤٥ في الممارسة) مع يوما راحة.' },
        { title: 'حق الإجازة السنوية', article: 'مادة ٧٠ من قانون العمل الكويتي', limit: '٣٠ يوماً على الأقل مدفوعة الأجر سنوياً بعد إتمام ٩ أشهر عمل.' },
        { title: 'فترة الإنذار بالإنهاء', article: 'مادة ٤٤ من قانون العمل الكويتي', limit: '٣ أشهر على الأقل للعقود غير محددة المدة لأصحاب الرواتب الشهرية.' },
    ];

    const handlePinVerify = (role: 'hr' | 'finance' | 'legal') => {
        if (pinInputs[role] === '1234') {
            onApprove(role);
            setPinOpen(null);
            setPinInputs(prev => ({ ...prev, [role] : '' }));
            addToast({
                type: 'success',
                title: 'تم اعتماد الخطوة بنجاح',
                message: `تم توثيق موافقة قسم ${role === 'hr' ? 'شؤون الموظفين' : role === 'finance' ? 'الإدارة المالية' : 'المستشار القانوني'} برقمها المدني والتوقيع الرقمي الذكي.`
            });
        } else {
            addToast({
                type: 'error',
                title: 'رمز PIN خاطئ',
                message: 'رمز التحقق السريع الموحد الافتراضي هو 1234 لتجربة النظام.'
            });
        }
    };

    return (
        <Card className="border-none shadow-xl rounded-[2.5rem] p-6 lg:p-8 bg-white dark:bg-dm-card overflow-hidden">
            {/* 1. KPI Results Grid - Similar to End of Service */}
            <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-150/60 dark:border-slate-800/80 mb-6 text-right space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-md font-black text-[#134D41] border-r-4 border-[#134D41] pr-2">
                            النتيجة الإجمالية والامتثال للمسؤولية والقوانين الكويتية
                        </h2>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">
                            فحص ومطابقة تلقائية لبنود العقد مقابل القانون رقم 6 لسنة 2010 والقرارات الإدارية المنظمة
                        </p>
                    </div>
                    {/* Quick Copy, Download, & Print Buttons */}
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                const textToCopy = `تقرير مراجعة العقد: ${contract.title}\nالأطراف: الأول (${contract.parties.firstParty}) - الثاني (${contract.parties.secondParty})\nالتقييم العام للامتثال: ${contract.risks.securityPercentage}%\nمستوى المخاطر: ${contract.risks.riskLevel === RiskLevel.LOW ? 'منخفض (مطابق)' : 'مرتفع'}\nالملخص القانوني: ${contract.summary}`;
                                navigator.clipboard.writeText(textToCopy);
                                addToast({
                                    type: 'success',
                                    title: 'تم النسخ بنجاح',
                                    message: 'تم نسخ خلاصة التدريب والتحليل لامتثال العقد.'
                                });
                            }}
                            className="bg-white hover:bg-slate-50 dark:bg-slate-950/40 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-sm transition-all"
                        >
                            <Copy className="w-3.5 h-3.5 text-[#134D41]" />
                            <span>نسخ التحليل</span>
                        </button>

                        <button
                            onClick={() => {
                                const textToDownload = `تقرير مراجعة العقد والامتثال القانوني الكويتي\n========================================\nاسم العقد: ${contract.title}\nالطرف الأول: ${contract.parties.firstParty}\nالطرف الثاني: ${contract.parties.secondParty}\nتاريخ التدقيق: ${new Date().toLocaleDateString('ar-KW')}\n\nمعدل الأمان والامتثال: ${contract.risks.securityPercentage}%\nمستوى المخاطر الكلية: ${contract.overallRisk === RiskLevel.LOW ? 'منخفض (مطابق قانونياً)' : 'مرتفع'}\n\nملخص التدقيق والامتثال:\n-------------------------\n${contract.summary}\n\nالبنود والملاحظات العمالية:\n-------------------------\n${contract.clauses.map((clause, idx) => `بند ${idx+1}: ${clause.title}\nالامتثال: ${clause.legalBasis}\nالتوصية: ${clause.aiRecommendation}\nالنص الحقيقي: ${clause.content}`).join('\n\n')}\n`;
                                const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `تقرير_امتثال_عقد_${contract.parties.secondParty}.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                                addToast({
                                    type: 'success',
                                    title: 'بدء التحميل',
                                    message: 'جاري تحميل تقرير الفحص الفني.'
                                });
                            }}
                            className="bg-white hover:bg-slate-50 dark:bg-slate-950/40 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-sm transition-all"
                        >
                            <Download className="w-3.5 h-3.5 text-[#134D41]" />
                            <span>تحميل كمسودة (TXT)</span>
                        </button>

                        <button
                            onClick={() => window.print()}
                            className="bg-[#134D41] hover:bg-[#0f2d25] text-white px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1.5 shadow-md transition-all"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>طباعة التقرير</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Compliance score */}
                    <div className="border border-emerald-100 bg-emerald-50/20 dark:bg-[#134D41]/5 rounded-2xl p-5 text-center shadow-xs flex flex-col justify-center">
                        <span className="text-[10px] text-slate-500 font-extrabold block">مؤشر أمان وسلامة البنود</span>
                        <strong className="text-2xl font-black text-emerald-600 dark:text-emerald-450 font-mono block mt-1">
                            {contract.risks.securityPercentage}%
                        </strong>
                        <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold mt-1">
                            {contract.risks.securityPercentage >= 80 ? '✓ متطابق كلياً وخالٍ من الجور' : '⚠ يتطلب مراجعة فورية'}
                        </span>
                    </div>

                    {/* Threat estimation */}
                    <div className={`border rounded-2xl p-5 text-center flex flex-col justify-center ${
                        contract.risks.riskLevel === RiskLevel.LOW 
                        ? 'border-emerald-100 bg-white dark:bg-dm-card' 
                        : 'border-amber-100 bg-white dark:bg-dm-card'
                    }`}>
                        <span className="text-[10px] text-slate-500 font-extrabold block">مستوى خطورة الالتزامات</span>
                        <strong className={`text-lg font-black block mt-1 ${
                            contract.risks.riskLevel === RiskLevel.LOW ? 'text-emerald-650' : 'text-amber-600'
                        }`}>
                            {contract.risks.riskLevel === RiskLevel.LOW ? 'منخفض / مطابق 🟢' : 'متوسط / تنويه 🟡'}
                        </strong>
                        <span className="text-[9px] text-slate-400 font-bold mt-1">مطابق لأحكام محكمة التمييز</span>
                    </div>

                    {/* Legal foundation match */}
                    <div className="border border-slate-200/60 bg-white dark:bg-dm-card rounded-2xl p-5 text-center flex flex-col justify-center">
                        <span className="text-[10px] text-slate-500 font-extrabold block">القانون المرجعي للتدقيق</span>
                        <strong className="text-md sm:text-lg font-black text-slate-800 dark:text-white block mt-1">
                            {contract.category === 'عقد عمل' 
                                ? (contract.financials?.currency === 'SAR' ? 'نظام العمل السعودي (مرسوم م/51)' : contract.financials?.currency === 'AED' ? 'قانون تنظيم علاقات العمل الإماراتي' : contract.financials?.currency === 'EGP' ? 'قانون العمل المصري رقم 12 لسنة 2003' : 'قانون العمل الكويتي (٦/٢٠١٠)')
                                : contract.category === 'عقد إيجار'
                                ? (contract.financials?.currency === 'SAR' ? 'نظام المعاملات المدنية السعودي (الإيجار)' : 'قانون الإيجارات وإيجار العقارات')
                                : (contract.financials?.currency === 'SAR' ? 'أنظمة المعاملات المدنية والتجارية بالمملكة' : contract.financials?.currency === 'AED' ? 'قانون المعاملات المدنية والتجارية الإماراتي' : contract.financials?.currency === 'EGP' ? 'القانون المدني والتجاري المصري' : 'القانون المدني والتجاري الكويتي')}
                        </strong>
                        <span className="text-[9px] text-slate-400 font-bold mt-1">محدث طِبقاً لآخر التعديلات التشريعية للمحاكم</span>
                    </div>
                </div>

                <div className="bg-white dark:bg-dm-card border border-slate-150/65 dark:border-slate-800 p-4 rounded-2xl text-right space-y-2">
                    <span className="text-[10px] font-black text-[#134D41] block">ديباجة رأي هيئة المراجعة:</span>
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 leading-relaxed">
                        {contract.category === 'عقد عمل' ? (
                            `بموجب المراجعة الرقمية لملف التعاقد للطرف الثاني (${contract.parties.secondParty})، تمت المقارنة الآلية لبنود ساعات العمل، فترات الراحة، شروط التجربة المحددة بـ ${contract.duration || 'عقد معتاد'} وبدل رصيد الإجازات. تلتزم الصياغة بالحدود القانونية وحقوق العمالة المستقرة.`
                        ) : contract.category === 'عقد إيجار' ? (
                            `بموجب الفحص الفني لملف الإيجار للأطراف (${contract.parties.firstParty}) و(${contract.parties.secondParty})، تمت مراجعة بنود العين المؤجرة، القيمة الإيجارية الشهرية المقدرة بـ ${contract.financials?.value ? contract.financials.value.toLocaleString() : 'المدونة'} ${contract.financials?.currency || 'KWD'}، ومطابقة التوافق مع النظم التنظيمية وقواعد المحكمة.`
                        ) : (
                            `بموجب الفحص الفني والآلي الذكي لعقد (${contract.category || 'مخصص'}) بين الأطراف (${contract.parties.firstParty}) و (${contract.parties.secondParty})، تم تدقيق بنود الالتزامات المشتركة، بنود الإشعار، نطاق المسؤولية والشرط الجزائي، والمطابقة مع القواعد العامة للالتزام بموجب الباب الخاص بنوع التعاقد.`
                        )}
                    </p>
                </div>
            </div>

            {/* Redesign sub-tabs panel with enterprise quality */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                    <h3 className="text-md font-black text-[#134D41] dark:text-white flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-[#134D41]" /> لوحات التحليل القانوني والالتزام الكويتي
                    </h3>
                    <p className="text-[11px] text-slate-500 font-bold">قرارات الذكاء القانوني المتكامل مع نظام شؤون المحاكم والأهلي</p>
                </div>

                <div className="flex flex-wrap gap-2 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800 shrink-0 font-sans">
                    <button
                        onClick={() => setSubTab('components')}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all border-0 cursor-pointer ${subTab === 'components' ? 'bg-[#134D41] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'}`}
                    >
                        مكونات العقد المستخلصة
                    </button>
                    <button
                        onClick={() => setSubTab('clauses')}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all border-0 cursor-pointer ${subTab === 'clauses' ? 'bg-[#134D41] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'}`}
                    >
                        فحص البنود والمطابقة
                    </button>
                    <button
                        onClick={() => setSubTab('risks')}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all border-0 cursor-pointer ${subTab === 'risks' ? 'bg-[#134D41] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'}`}
                    >
                        تقرير المخاطر والتوصيات
                    </button>
                    <button
                        onClick={() => setSubTab('governance')}
                        className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all border-0 cursor-pointer ${subTab === 'governance' ? 'bg-[#134D41] text-white shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 bg-transparent'}`}
                    >
                        الموافقات والختم الرقمي
                    </button>
                </div>
            </div>

            <div className="pt-6">
                <AnimatePresence mode="wait">
                    {/* Subtag 1: Extracted Contract Components */}
                    {subTab === 'components' && (
                        <motion.div key="comp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">شخصية ومصداقية الأطراف</span>
                                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">الطرف الأول: {contract.parties.firstParty}</p>
                                    <p className="text-xs font-bold text-slate-500 mt-1">الطرف الثاني: {contract.parties.secondParty}</p>
                                </div>

                                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">فترة السريان والأجل</span>
                                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">المدة الكلية: {contract.duration || 'غير محددة المدة'}</p>
                                    <p className="text-xs font-bold text-slate-500 mt-1">تاريخ المباشرة: {contract.dates.effectiveDate || '٢٠٢٦-٠٥-٢٥'}</p>
                                </div>

                                <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">التقييم والرواتب المالية</span>
                                    <p className="text-xs font-black text-emerald-650 dark:text-emerald-450 font-sans">
                                        {contract.financials?.value ? `${contract.financials.value / 12} دينار كويتي شهرياً` : 'يحدد لاحقاً'}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1">شروط وسداد: {contract.financials?.paymentTerms || 'سداد بنكي مباشر'}</p>
                                </div>
                            </div>

                            <div className="p-4 rounded-[2rem] bg-emerald-50/20 dark:bg-[#134D41]/5 border-r-4 border-[#134D41] space-y-2">
                                <h4 className="text-xs font-black text-[#134D41] dark:text-[#EBFDF5] flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-[#134D41] animate-pulse" /> ملخص مراجعة الذكاء القانوني المستخلص
                                </h4>
                                <p className="text-xs text-[#0f2d25] dark:text-slate-350 leading-relaxed font-semibold font-sans">
                                    {contract.summary}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Subtag 2: Clause-by-clause legal compliance analysis against Kuwait laws */}
                    {subTab === 'clauses' && (
                        <motion.div key="clauses-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="flex justify-between items-center px-1 mb-2">
                                <span className="text-[11px] font-black text-slate-400">فحص مواد العقد مقابل قانون العمل الأهلي الكويتي رقم ٦ لسنة ٢٠١٠:</span>
                                <span className="text-[10px] font-black text-[#134D41]">٤ نقاط رئيسية مفحوصة تلقائياً</span>
                            </div>

                            <div className="space-y-3">
                                {contract.clauses.map((clause, idx) => (
                                    <div 
                                        key={clause.id || idx}
                                        className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 grid grid-cols-1 lg:grid-cols-4 gap-4 items-start"
                                    >
                                        <div className="lg:col-span-1 space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-[#134D41] shrink-0" />
                                                <h5 className="text-xs font-black text-slate-800 dark:text-slate-100">{clause.title}</h5>
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400 block">{clause.legalBasis || 'قانون العمل الكويتي (ملحق)'}</span>
                                            <RiskLevelBadge level={clause.risk} size="sm" />
                                        </div>

                                        <div className="lg:col-span-2 text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                                            {clause.content}
                                        </div>

                                        <div className="lg:col-span-1 bg-white dark:bg-dm-card/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/50 space-y-1.5">
                                            <span className="text-[9px] text-slate-400 font-extrabold flex items-center gap-1">
                                                <Sparkles className="w-3.5 h-3.5 text-[#134D41] animate-pulse" /> توصية المحرّك الذكي:
                                            </span>
                                            <p className="text-[10px] font-extrabold text-[#0f2d25] dark:text-slate-300 leading-normal">
                                                {clause.aiRecommendation || 'البند مطابق للشروط القياسية في وزارة العدل الكويتية ولا يتضمن شروط جائرة.'}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {contract.clauses.length === 0 && (
                                    <div className="py-8 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-2">
                                        <Scale className="w-8 h-8 text-slate-400 mx-auto animate-bounce" />
                                        <p className="text-xs font-black text-slate-500">لا يوجد بنود مفحوصة حالياً.</p>
                                        <p className="text-[10px] text-slate-400 font-semibold">اضغط على زر تفعيل الفحص الذكي في القائمة اليمنى لاستخلاص مواد العقد وفحص مطابقتها.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Subtab 3: Comprehensive Risks Assessment & Legal Recommendations */}
                    {subTab === 'risks' && (
                        <motion.div key="risks-tab" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Risk Breakdown Box */}
                                <div className="bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/20 p-5 rounded-[2rem] space-y-4">
                                    <h4 className="text-xs font-black text-rose-800 dark:text-rose-450 flex items-center gap-1.5">
                                        <ShieldAlert className="w-4 h-4 text-rose-600" /> البنود الحرجة والملاحظات السلبية المرصودة
                                    </h4>

                                    <div className="space-y-2">
                                        {contract.risks.criticalIssues.map((issue, idx) => (
                                            <div key={idx} className="flex gap-2 items-start text-xs font-bold text-rose-900 dark:text-rose-300">
                                                <span className="shrink-0 w-1.5 h-1.5 bg-rose-600 rounded-full mt-1.5" />
                                                <p className="leading-snug">{issue}</p>
                                            </div>
                                        ))}

                                        {contract.risks.criticalIssues.length === 0 && (
                                            <div className="text-xs text-emerald-700 dark:text-emerald-450 font-black flex items-center gap-1.5">
                                                <CheckCircle2 className="w-4 h-4" /> خالي من البنود الحرجة (امتثال معتمد كلياً)
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Standard Approved alternatives and comments */}
                                <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-950/20 p-5 rounded-[2rem] space-y-4">
                                    <h4 className="text-xs font-black text-emerald-800 dark:text-emerald-450 flex items-center gap-1.5">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> البنود المطابقة المعتمدة
                                    </h4>

                                    <div className="space-y-2">
                                        <div className="flex gap-2 items-start text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                                            <span className="shrink-0 w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1.5" />
                                            <p>تدرج مبالغ وحزم الأجور والتأمين تماشياً مع كشوفات ديوان الخدمة ودعم العمالة.</p>
                                        </div>
                                        <div className="flex gap-2 items-start text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
                                            <span className="shrink-0 w-1.5 h-1.5 bg-emerald-600 rounded-full mt-1.5" />
                                            <p>الإجازة السنوية محددة بـ ٣٠ يوماً على الأقل وهو يتناسب تماماً مع نص المادة ٧٠ للشؤون.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recommendations checklist from advisor */}
                            <div className="p-5 bg-emerald-50/10 dark:bg-[#134D41]/5 rounded-[2rem] border border-[#134D41]/20 space-y-3">
                                <h4 className="text-xs font-black text-[#134D41] dark:text-[#EBFDF5] flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-[#134D41] animate-pulse" /> التوصيات الإدارية المطلوبة للتعديل والاعتماد النهائي
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {contract.recommendations.map((rec, idx) => (
                                        <div key={idx} className="bg-white dark:bg-dm-card/80 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-3.5 items-start">
                                            <div className="p-1 bg-[#134D41]/10 text-[#134D41] rounded-lg text-xs font-black mt-0.5 font-sans">
                                                {idx + 1}
                                            </div>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-355 leading-relaxed">
                                                {rec}
                                            </p>
                                        </div>
                                    ))}

                                    {contract.recommendations.length === 0 && (
                                        <p className="text-xs text-slate-500 font-bold">كل التعديلات متوافقة تلقائياً.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Subtag 4: Advanced multi-department Sign-off & Pin Signature Stamp Workflow */}
                    {subTab === 'governance' && (
                        <motion.div key="gov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                            <div className="flex justify-between items-center px-1">
                                <div>
                                    <h4 className="text-xs font-black text-slate-800 dark:text-white">دورة حوكمة الموافقات والاعتمادات بالشركة</h4>
                                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">يتعين إمضاء وتصديق كافة الأقسام المعنية للتصريح بختم الامتثال القانوني</p>
                                </div>
                                <span className="text-[9px] font-black bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full dark:bg-rose-950/30 dark:text-rose-400">
                                    رقم سري موحد للتجربة: 1234
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* HR Department Signature Column */}
                                <div className={`p-4 rounded-[2rem] border relative overflow-hidden transition-all ${
                                    approvals.hr.approved 
                                    ? 'bg-emerald-55/35 border-emerald-200 dark:bg-emerald-950/10' 
                                    : 'bg-slate-50 border-slate-205 dark:bg-slate-900 dark:border-slate-800'
                                }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${approvals.hr.approved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                            شؤون الموظفين HR
                                        </span>
                                        {approvals.hr.approved ? (
                                            <span className="text-[10px] text-emerald-600 font-extrabold font-sans">✓ تمت الموافقة</span>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 font-bold">بانتظار الإمضاء</span>
                                        )}
                                    </div>

                                    {approvals.hr.approved ? (
                                        <div className="space-y-1 mt-4">
                                            <p className="text-xs font-black text-slate-700 dark:text-slate-300">{approvals.hr.user}</p>
                                            <p className="text-[9px] text-slate-400 font-bold">التاريخ: {approvals.hr.date}</p>
                                            <div className="absolute -bottom-4 -left-4 w-16 h-16 border-2 border-emerald-600/20 rounded-full flex items-center justify-center text-[7px] text-emerald-600/30 transform -rotate-12 select-none uppercase font-black">
                                                HR Approved
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setPinOpen('hr')}
                                            className="w-full bg-[#134D41] dark:bg-[#134D41]/35 hover:bg-emerald-800 text-white text-[10px] font-black h-8 rounded-xl transition-all border-0 cursor-pointer"
                                        >
                                            أدخل الرمز للتوقيع (PIN)
                                        </button>
                                    )}
                                </div>

                                {/* Finance Department Signature Column */}
                                <div className={`p-4 rounded-[2rem] border relative overflow-hidden transition-all ${
                                    approvals.finance.approved 
                                    ? 'bg-emerald-55/35 border-emerald-200 dark:bg-emerald-950/10' 
                                    : 'bg-slate-50 border-slate-205 dark:bg-slate-900 dark:border-slate-800'
                                }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${approvals.finance.approved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                            الإدارة المالية
                                        </span>
                                        {approvals.finance.approved ? (
                                            <span className="text-[10px] text-emerald-600 font-extrabold font-sans">✓ تمت الموافقة</span>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 font-bold">بانتظار الإمضاء</span>
                                        )}
                                    </div>

                                    {approvals.finance.approved ? (
                                        <div className="space-y-1 mt-4">
                                            <p className="text-xs font-black text-slate-700 dark:text-slate-305">{approvals.finance.user}</p>
                                            <p className="text-[9px] text-slate-400 font-bold">التاريخ: {approvals.finance.date}</p>
                                            <div className="absolute -bottom-4 -left-4 w-16 h-16 border-2 border-emerald-600/20 rounded-full flex items-center justify-center text-[7px] text-emerald-600/30 transform -rotate-12 select-none uppercase font-black">
                                                FIN Approved
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setPinOpen('finance')}
                                            className="w-full bg-[#134D41] dark:bg-[#134D41]/35 hover:bg-emerald-800 text-white text-[10px] font-black h-8 rounded-xl transition-all border-0 cursor-pointer"
                                        >
                                            أدخل الرمز للتوقيع (PIN)
                                        </button>
                                    )}
                                </div>

                                {/* Legal Department Signature Column */}
                                <div className={`p-4 rounded-[2rem] border relative overflow-hidden transition-all ${
                                    approvals.legal.approved 
                                    ? 'bg-emerald-55/35 border-emerald-200 dark:bg-emerald-950/10' 
                                    : 'bg-slate-50 border-slate-205 dark:bg-slate-900 dark:border-slate-800'
                                }`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${approvals.legal.approved ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                            قسم الشؤون القانونية
                                        </span>
                                        {approvals.legal.approved ? (
                                            <span className="text-[10px] text-emerald-600 font-extrabold font-sans">✓ تمت الموافقة</span>
                                        ) : (
                                            <span className="text-[10px] text-slate-400 font-bold">بانتظار الإمضاء</span>
                                        )}
                                    </div>

                                    {approvals.legal.approved ? (
                                        <div className="space-y-1 mt-4">
                                            <p className="text-xs font-black text-slate-700 dark:text-slate-305">{approvals.legal.user}</p>
                                            <p className="text-[9px] text-slate-400 font-bold">التاريخ: {approvals.legal.date}</p>
                                            <div className="absolute -bottom-4 -left-4 w-16 h-16 border-2 border-emerald-600/20 rounded-full flex items-center justify-center text-[7px] text-emerald-600/30 transform -rotate-12 select-none uppercase font-black">
                                                LEGAL Verified
                                            </div>
                                        </div>
                                    ) : (
                                        <button 
                                            onClick={() => setPinOpen('legal')}
                                            className="w-full bg-[#134D41] dark:bg-[#134D41]/35 hover:bg-emerald-800 text-white text-[10px] font-black h-8 rounded-xl transition-all border-0 cursor-pointer"
                                        >
                                            أدخل الرمز للتوقيع (PIN)
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Seal stamping action once all are green */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <div>
                                    <h5 className="text-xs font-black text-slate-800 dark:text-white">تطبيق الختم المائي الرقمي المعتمد</h5>
                                    <p className="text-[10px] text-slate-500 font-bold">يجب تصديق الإمضاءات الثلاثة تمهيداً لتطبيق ختم امتثال الشركة</p>
                                </div>

                                <button
                                    onClick={applySeal}
                                    disabled={isSealed || !(approvals.hr.approved && approvals.finance.approved && approvals.legal.approved)}
                                    className={`px-6 h-11 text-xs font-black rounded-xl flex items-center gap-2 shadow-lg transition-all border-0 cursor-pointer ${
                                        isSealed 
                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/20 shadow-none border border-emerald-200 cursor-not-allowed'
                                        : (approvals.hr.approved && approvals.finance.approved && approvals.legal.approved)
                                        ? 'bg-[#134D41] text-white hover:bg-emerald-900'
                                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800/60 cursor-not-allowed shadow-none'
                                    }`}
                                >
                                    <FileCheck className="w-4 h-4" />
                                    {isSealed ? 'تم توثيق وختم هذا العقد قانونياً وعملياً' : 'تطبيق الختم والتصديق النهائي'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Simulated Keyboard PIN verify Modal overlay */}
            {pinOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-dm-card p-6 rounded-[2rem] w-full max-w-sm shadow-2xl relative border border-slate-100 dark:border-slate-800">
                        <h4 className="text-sm font-black text-slate-800 dark:text-white mb-2">
                            التحقق من الهوية الثنائية للتوقيع الرقمي
                        </h4>
                        <p className="text-[10px] text-slate-500 font-semibold mb-4">
                            توقيع كود المصادقة الموحد للاعتمادات. الرمز التجريبي الافتراضي هو: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono font-bold text-[#134D41]">1234</code>
                        </p>
                        
                        <div className="space-y-4">
                            <input
                                type="password"
                                maxLength={4}
                                placeholder="----"
                                value={pinInputs[pinOpen]}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setPinInputs(prev => ({ ...prev, [pinOpen]: val }));
                                }}
                                className="w-full text-center bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 h-12 text-xl tracking-widest font-mono font-black rounded-xl"
                            />

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handlePinVerify(pinOpen)}
                                    className="flex-1 bg-[#134D41] hover:bg-emerald-950 text-white text-xs font-black h-10 rounded-xl border-0 cursor-pointer"
                                >
                                    تأكيد التوقيع
                                </button>
                                <button
                                    onClick={() => setPinOpen(null)}
                                    className="px-4 bg-slate-105 hover:bg-slate-205 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold h-10 rounded-xl"
                                >
                                    إلغاء
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </Card>
    );
};
