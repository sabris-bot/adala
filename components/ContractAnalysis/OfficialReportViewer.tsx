import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
    Printer, Edit3, CheckCircle, AlertTriangle, ShieldCheck, 
    Save, RefreshCw, Plus, Trash2, ArrowRight, CornerDownLeft, FileText, Bookmark
} from 'lucide-react';
import { AnalyzedContract, RiskLevel } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { useToast } from '../ui/Toast';

interface OfficialReportViewerProps {
    contract: AnalyzedContract | null;
    isSealed: boolean;
    approvals: {
        hr: { approved: boolean; date: string; user: string };
        finance: { approved: boolean; date: string; user: string };
        legal: { approved: boolean; date: string; user: string };
    };
    onGoToAnalysis: () => void;
}

export const OfficialReportViewer: React.FC<OfficialReportViewerProps> = ({
    contract,
    isSealed,
    approvals,
    onGoToAnalysis
}) => {
    const { addToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    
    // Editable States
    const [reportTitle, setReportTitle] = useState('');
    const [refNumber, setRefNumber] = useState('');
    const [summary, setSummary] = useState('');
    const [firstParty, setFirstParty] = useState('');
    const [secondParty, setSecondParty] = useState('');
    const [customNotes, setCustomNotes] = useState('');
    const [recommendations, setRecommendations] = useState<string[]>([]);
    const [newRecText, setNewRecText] = useState('');
    const [legalVerdict, setLegalVerdict] = useState('مطابق كلياً ومفحوص بموجب المادة 17 والمادة 70 من قانون العمل الكويتي رقم 6/2010');

    // Populate standard values on contract load
    useEffect(() => {
        if (contract) {
            setReportTitle(`تقرير الفحص والامتثال القانوني لعقد - ${contract.title}`);
            setRefNumber(contract.referenceNumber || `QA-2026-LE-${Math.floor(Math.random() * 90) + 10}`);
            setFirstParty(contract.parties?.firstParty || 'مجموعة الصناعات الوطنية');
            setSecondParty(contract.parties?.secondParty || 'أحمد محمود العبدالله');
            setSummary(contract.summary || 'تم فحص محتوى هذا العقد وتدقيقه بموجب اللوائح التنفيذية الصادرة من وزارة العدل والشؤون العامة بدولة الكويت.');
            setCustomNotes('يخضع هذا التقرير للسرية التامة ولا يجوز تداوله خارج الأقسام المرخص لها (شؤون الموظفين، الإدارة المالية، الإدارة القانونية العليا).');
            
            const initialRecs = contract.recommendations && contract.recommendations.length > 0 
                ? [...contract.recommendations] 
                : [
                    'نوصي بالأرشفة والاحتفاظ بختم مطابقة الامتثال على مسودة العقد النهائية.',
                    'التحقق من إدراج الرقم المدني للطرفين بشكل سليم لتلافي بطلان البنود التعاقدية.',
                    'ضرورة إتمام سداد موازنة الراتب عبر البوابة المالية المصرفية المحلية بانتظام.'
                  ];
            setRecommendations(initialRecs);
        } else {
            setReportTitle('تقرير الفحص والامتثال القانوني الموحد');
            setRefNumber(`QA-2026-LE-91`);
            setFirstParty('شركة مجموعة الصناعات الوطنية بالعارضية');
            setSecondParty('أحمد محمود العبدالله');
            setSummary('لم يتم تحديد عقد مفصّل. يرجى اختيار عقد من شاشة عارض العقود لملئ البيانات تلقائياً.');
            setRecommendations([
                'يرجى ترحيل عقد من بوابة عارض العقود.',
                'التحقق من مطابقة ديباجة التأسيس وفق مرسوم قانون العمل الكويتي.'
            ]);
        }
    }, [contract]);

    const handleAddRecommendation = () => {
        if (!newRecText.trim()) return;
        setRecommendations([...recommendations, newRecText.trim()]);
        setNewRecText('');
        addToast({
            type: 'success',
            title: 'تمت إضافة التوصية',
            message: 'تم تحديث التوجيه القانوني بنجاح.'
        });
    };

    const handleRemoveRecommendation = (index: number) => {
        const updated = recommendations.filter((_, idx) => idx !== index);
        setRecommendations(updated);
        addToast({
            type: 'info',
            title: 'تم حذف التوصية',
            message: 'تم استبعاد التوصية من التقرير المطبوع.'
        });
    };

    const handleSaveEdits = () => {
        setIsEditing(false);
        addToast({
            type: 'success',
            title: 'تم حفظ التعديلات المقررة',
            message: 'التقرير المعروض جاهز للطباعة أو التصدير التلقائي كمسودة PDF معتمدة.'
        });
    };

    const triggerPrint = () => {
        window.print();
    };

    const getRiskBadgeColor = () => {
        if (!contract) return 'bg-emerald-50 text-emerald-700 border-emerald-150';
        switch (contract.overallRisk) {
            case RiskLevel.HIGH:
                return 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-300 border-rose-100';
            case RiskLevel.MEDIUM:
                return 'bg-amber-50 dark:bg-amber-955/20 text-amber-700 dark:text-amber-305 border-amber-100';
            default:
                return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-305 border-emerald-100';
        }
    };

    const getRiskText = () => {
        if (!contract) return 'آمن ومطابق 🟢';
        switch (contract.overallRisk) {
            case RiskLevel.HIGH: return 'مرتفع المخاطر 🔴';
            case RiskLevel.MEDIUM: return 'متوسط المخاطر 🟡';
            default: return 'مطابق قانونياً 🟢';
        }
    };

    return (
        <div className="space-y-6">
            
            {/* Top Interactive Panel Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-dm-card p-5 rounded-[2rem] shadow-md border border-slate-100 dark:border-slate-800 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 rounded-2xl">
                        <Printer className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-850 dark:text-white">بوابة الطباعة وصياغة تقارير الامتثال الرسمية</h3>
                        <p className="text-[10px] text-slate-500 font-bold mt-0.5">يمكنك تنقيح التقرير وسائر البيانات والتوجيهات قبل إصدار النسخة المطبوعة والمؤرشفة</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button 
                        onClick={onGoToAnalysis}
                        variant="secondary"
                        className="text-[10px] font-black h-9 px-4 rounded-xl flex items-center gap-1 leading-none"
                    >
                        <ArrowRight className="w-3.5 h-3.5" />
                        العودة للمُحلل القانوني
                    </Button>

                    <Button 
                        onClick={() => setIsEditing(!isEditing)}
                        variant="secondary"
                        className={`text-[10px] font-black h-9 px-4 rounded-xl flex items-center gap-1 leading-none ${isEditing ? 'bg-indigo-50 text-indigo-700' : ''}`}
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        {isEditing ? 'إنهاء التعديل' : 'تعديل التقرير قبل الطباعة'}
                    </Button>

                    <Button 
                        onClick={triggerPrint}
                        className="bg-indigo-650 hover:bg-indigo-700 text-white text-[10px] font-black h-9 px-5 rounded-xl flex items-center gap-1.5 leading-none shadow-md shadow-indigo-600/15"
                    >
                        <Printer className="w-3.5 h-3.5" />
                        طـبـاعة / تصدير PDF
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* Main Legal Folio Paper */}
                <div className="xl:col-span-8 bg-white text-slate-900 dark:text-slate-900 p-8 lg:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 print:border-none print:shadow-none print:rounded-none min-h-[1050px] relative font-serif text-right leading-relaxed max-w-[900px] mx-auto print:max-w-none print:mx-0 print:p-0">
                    
                    {/* Background Double Dashed Margin for Kuwait traditional court style */}
                    <div className="absolute top-0 right-12 bottom-0 w-0.5 bg-rose-500/15 border-r border-dashed border-rose-500/10 pointer-events-none print:right-6" />
                    <div className="absolute top-0 right-13 bottom-0 w-0.5 bg-rose-500/10 border-r border-dashed border-rose-500/5 pointer-events-none print:right-7" />

                    <div className="pr-16 pl-4 print:pr-10 print:pl-0 space-y-8">
                        
                        {/* 1. Official Royal Header */}
                        <div className="flex justify-between items-start border-b-2 border-slate-850 pb-6 relative">
                            
                            {/* Right Unit: Kuwait Court Hierarchy & Office Details */}
                            <div className="space-y-1 text-right">
                                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">النظام القانوني الموحد</div>
                                <div className="text-sm font-black text-slate-900 tracking-tight">مكتب المحامي صبري شطا</div>
                                <div className="text-xs font-black text-[#134D41]">للمحاماة والاستشارات القانونية والتحكيم</div>
                                <div className="text-[9px] font-bold text-slate-500">تحت إشراف: أ. صبري شطا وصياغات الامتثال</div>
                            </div>

                            {/* Center Logo Emblems */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="border border-slate-800 rounded-full w-14 h-14 flex items-center justify-center p-2 mb-1 select-none print:w-12 print:h-12 bg-white">
                                    <div className="font-serif font-black text-sm text-[#134D41] tracking-widest text-center leading-tight">عدالة</div>
                                </div>
                                <div className="text-[8px] font-black text-slate-400">نظام الإدارة القانونية الذكي</div>
                            </div>

                            {/* Left Unit: Serial Metadatas & Date */}
                            <div className="space-y-1 text-left font-sans text-[10px] font-bold text-slate-600" dir="ltr">
                                <div>Serial Ref: <span className="font-mono text-xs">{refNumber}</span></div>
                                <div>Issuance: <span className="font-mono text-xs">{new Date().toISOString().split('T')[0]}</span></div>
                                <div>Classification: <span className="font-mono text-xs text-indigo-600">{contract?.category || 'شؤون قانونية'}</span></div>
                                <div>Status: <span className="text-emerald-700 font-extrabold uppercase">APPROVED / معتمد</span></div>
                            </div>
                        </div>

                        {/* 2. Document Title */}
                        <div className="text-center py-4">
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={reportTitle} 
                                    onChange={(e) => setReportTitle(e.target.value)}
                                    className="w-full text-center bg-slate-50 border-2 border-indigo-100 rounded-2xl font-black text-xl p-3 text-slate-900 focus:outline-none focus:border-indigo-600 font-sans"
                                />
                            ) : (
                                <h2 className="text-xl font-black text-slate-950 underline decoration-double decoration-slate-400 underline-offset-8 leading-normal tracking-wide">
                                    {reportTitle}
                                </h2>
                            )}
                        </div>

                        {/* 3. Formal Executive Summary Grid */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-900 bg-slate-100 p-2 rounded flex items-center gap-1.5 font-sans leading-none print:bg-slate-50">
                                <FileText className="w-4 h-4 text-slate-700" /> أولاً: ديباجة التأسيس والامتثال الأساسي
                            </h4>
                            
                            <div className="grid grid-cols-2 gap-4 text-xs font-bold font-sans">
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 print:bg-white">
                                    <span className="text-[9px] text-slate-400 block mb-1">الجهة المتعاقدة (الطرف الأول):</span>
                                    {isEditing ? (
                                        <input type="text" value={firstParty} onChange={(e) => setFirstParty(e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1" />
                                    ) : (
                                        <span className="text-slate-800">{firstParty}</span>
                                    )}
                                </div>
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-150 print:bg-white">
                                    <span className="text-[9px] text-slate-400 block mb-1">الموظف / المستفيد (الطرف الثاني):</span>
                                    {isEditing ? (
                                        <input type="text" value={secondParty} onChange={(e) => setSecondParty(e.target.value)} className="w-full bg-white border border-slate-200 rounded p-1" />
                                    ) : (
                                        <span className="text-slate-800">{secondParty}</span>
                                    )}
                                </div>
                            </div>

                            <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 space-y-2 print:bg-white">
                                <span className="text-[10px] font-black text-slate-400 block font-sans">ملخص فحص بنود العقد وتدقيق مستند الشرف:</span>
                                {isEditing ? (
                                    <textarea 
                                        value={summary} 
                                        onChange={(e) => setSummary(e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded p-3 h-28 text-xs font-serif leading-relaxed"
                                    />
                                ) : (
                                    <p className="text-xs font-serif leading-relaxed text-slate-800 pr-1 select-text">
                                        {summary}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 4. Active Risk Level Checker */}
                        <div className={`border p-4 rounded-3xl flex items-center justify-between font-sans ${getRiskBadgeColor()}`}>
                            <div className="flex items-center gap-3">
                                {contract?.overallRisk === RiskLevel.HIGH ? (
                                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                                ) : (
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                )}
                                <div>
                                    <span className="text-[10px] font-black opacity-80 uppercase block">تأكيد مستوى السلامة القانونية:</span>
                                    <span className="text-xs font-black">{getRiskText()}</span>
                                </div>
                            </div>
                            <div className="text-left">
                                <span className="text-[10px] font-black opacity-80 block">معدل نقاط الأمان:</span>
                                <span className="text-xs font-mono font-black">{contract?.risks.securityPercentage || 95}%</span>
                            </div>
                        </div>

                        {/* 5. Custom Real-time Legal Recommendations / Advice Edit before Print section */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-900 bg-slate-100 p-2 rounded flex items-center gap-1.5 font-sans leading-none print:bg-slate-50">
                                <Bookmark className="w-4 h-4 text-slate-700" /> ثانياً: التوجيهات والتعديلات الفنية المقترحة
                            </h4>

                            <ul className="space-y-2.5 text-xs font-serif pr-2 list-inside list-decimal">
                                {recommendations.map((rec, idx) => (
                                    <li key={idx} className="text-slate-850 leading-relaxed group select-text">
                                        <div className="flex justify-between items-start gap-3">
                                            <span>{rec}</span>
                                            {isEditing && (
                                                <button 
                                                    onClick={() => handleRemoveRecommendation(idx)}
                                                    className="p-1 text-rose-500 hover:bg-rose-50 rounded select-none print:hidden shrink-0"
                                                    title="حذف هذا التوجيه"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {isEditing && (
                                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex gap-2 items-center print:hidden">
                                    <input 
                                        type="text" 
                                        placeholder="اكتب توجيه قانوني جديد واضغط للبدء..."
                                        value={newRecText} 
                                        onChange={(e) => setNewRecText(e.target.value)}
                                        className="bg-white border text-xs h-9 px-3 rounded-xl flex-1 text-right focus:outline-none"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddRecommendation();
                                        }}
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleAddRecommendation}
                                        className="h-9 px-3 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 shrink-0 flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> أضف
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 6. Verdict and compliance signature field */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-900 bg-slate-100 p-2 rounded flex items-center gap-1.5 font-sans leading-none print:bg-slate-50">
                                <CornerDownLeft className="w-4 h-4 text-slate-705" /> ثالثاً: الموثوقية والرأي القانوني النهائي
                            </h4>
                            
                            <div className="bg-slate-50 p-4 rounded-3xl border border-slate-150 text-xs font-serif leading-relaxed text-slate-850 space-y-2 print:bg-white shadow-inner">
                                <span className="text-[10px] font-black text-indigo-900 block font-sans">قرار لجنة التدقيق والامتثال الوزاري للفصل عمالياً:</span>
                                {isEditing ? (
                                    <input 
                                        type="text" 
                                        value={legalVerdict} 
                                        onChange={(e) => setLegalVerdict(e.target.value)}
                                        className="w-full bg-white border rounded p-1 text-xs font-serif" 
                                    />
                                ) : (
                                    <p className="pr-1 font-semibold text-slate-900">
                                        {legalVerdict}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 7. Official Stamps and signatures block layout */}
                        <div className="pt-8 border-t border-slate-200">
                            <div className="grid grid-cols-3 gap-4 text-center text-[10px] font-bold font-sans">
                                
                                {/* Signature Unit 1 */}
                                <div className="space-y-2">
                                    <span className="text-slate-400 block uppercase font-extrabold">الموافقة والمكلف العمالي (HR)</span>
                                    <div className="h-16 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100 pr-1 print:bg-transparent print:border-none">
                                        {approvals.hr.approved ? (
                                            <div className="text-indigo-900 font-extrabold text-[9px]">
                                                <span className="text-emerald-600">✓ معتمد بالكامل</span>
                                                <div className="text-[8px] text-slate-400 font-sans tracking-tight mt-0.5">{approvals.hr.user}</div>
                                                <div className="text-[7px] text-slate-400 font-mono tracking-tight">{approvals.hr.date}</div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 font-black animate-pulse">بانتظار اعتماده بالرقم المدني ⌛</span>
                                        )}
                                    </div>
                                </div>

                                {/* Signature Unit 2 */}
                                <div className="space-y-2">
                                    <span className="text-slate-400 block uppercase font-extrabold">المراجعة والاعتماد المحاسبي</span>
                                    <div className="h-16 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100 pr-1 print:bg-transparent print:border-none">
                                        {approvals.finance.approved ? (
                                            <div className="text-indigo-900 font-extrabold text-[9px]">
                                                <span className="text-emerald-600">✓ معتمد بالكامل</span>
                                                <div className="text-[8px] text-slate-400 font-sans tracking-tight mt-0.5">{approvals.finance.user}</div>
                                                <div className="text-[7px] text-slate-400 font-mono tracking-tight">{approvals.finance.date}</div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 font-black animate-pulse">بانتظار اعتماده بالرقم المدني ⌛</span>
                                        )}
                                    </div>
                                </div>

                                {/* Signature Unit 3 */}
                                <div className="space-y-2 relative">
                                    <span className="text-slate-400 block uppercase font-extrabold">المستشار والموقع القانوني</span>
                                    <div className="h-16 flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100 pr-1 print:bg-transparent print:border-none relative">
                                        {approvals.legal.approved || isSealed ? (
                                            <div className="text-indigo-900 font-extrabold text-[9px] relative z-10">
                                                <span className="text-emerald-600">✓ معتمد بالكامل</span>
                                                <div className="text-[8px] text-slate-400 font-sans tracking-tight mt-0.5">{approvals.legal.user || 'صبري شطا'}</div>
                                                <div className="text-[7px] text-slate-400 font-mono tracking-tight">{approvals.legal.date || '٢٥ مايو ٢٠٢٦'}</div>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 font-black animate-pulse">بانتظار اعتماده بالرقم المدني ⌛</span>
                                        )}
                                    </div>

                                    {/* Traditional Notary Decrypt Seal graphic applied only if isSealed is true */}
                                    {isSealed && (
                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-dashed border-rose-500 rounded-full w-24 h-24 flex flex-col items-center justify-center text-rose-500 rotate-12 pointer-events-none select-none opacity-80 scale-90 print:scale-100">
                                            <div className="text-[7px] font-black font-sans leading-none">مجموعة الصناعات</div>
                                            <div className="text-[9px] font-black font-sans tracking-tighter leading-none mt-1">ختم الامتثال</div>
                                            <div className="text-[6px] font-mono leading-none mt-1">Digital Approved</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 8. Extra legal disclosure footer */}
                        <div className="pt-8 border-t border-slate-150 flex flex-col sm:flex-row justify-between items-center text-[9px] text-slate-500 font-sans font-bold px-2 gap-2 mt-4">
                            <div className="text-right">
                                <span>تم التحقق إلكترونياً وصياغة هذا التقرير آلياً بموجب المرسوم القانوني الكويتي رقم 6 لسنة 2010.</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[9px]" dir="rtl">
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-650 font-black">عدالة الموحد</span>
                                <span>مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية</span>
                                <span className="text-slate-300">•</span>
                                <span>هاتف: <span className="font-sans font-black">+965 2244 8877</span></span>
                                <span className="text-slate-300">•</span>
                                <span>البريد الإلكتروني: <span className="font-sans font-black">support@adalah.kw</span></span>
                                <span className="text-slate-300">•</span>
                                <span className="text-[8px] text-slate-400">صفحة 1 من 1</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* Left informational sidebar tips with action cards */}
                <div className="xl:col-span-4 space-y-6 print:hidden">
                    
                    {/* Live report properties editor status checklist card */}
                    <Card className="border-none shadow-xl rounded-[2rem] p-6 bg-white dark:bg-dm-card space-y-4">
                        <h4 className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-650" /> مراجعة حيوية للتقرير البيني
                        </h4>
                        
                        <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                            يقوم محرّك التدقيق القانوني بتأهيل هذا التقرير للاعتماد التام ومطابقة المحتوى. تحقق من استيفاء المتطلبات التالية:
                        </p>

                        <div className="space-y-2.5 pt-1">
                            <div className="flex items-start gap-2 text-[10px] font-extrabold bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl">
                                <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-slate-800 dark:text-slate-200 block">العقد المترابط سليم</span>
                                    <span className="text-slate-400 block mt-0.5 font-bold">تم ربط العقد وقراءته بدقة ومراجعة البنود المشروعة.</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-[10px] font-extrabold bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl">
                                <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isSealed ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <div>
                                    <span className="text-slate-800 dark:text-slate-200 block">التوقيع بالختم الرقمي الحكومي</span>
                                    <span className="text-slate-400 block mt-0.5 font-bold">
                                        {isSealed ? 'تم توشيح الوثيقة بالختم وتوثيقها.' : 'قم بالرجوع لتبويب الموافقات في المحلل لإكمال التوقيع.'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-[10px] font-extrabold bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl">
                                <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${approvals.hr.approved && approvals.finance.approved ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <div>
                                    <span className="text-slate-800 dark:text-slate-200 block">اعتماد الإدارات الثلاث</span>
                                    <span className="text-slate-400 block mt-0.5 font-bold">يضمن التحقق والتأهيل بالرقم السري PIN من الأطراف المسؤولة.</span>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Simple Quick Tips Alert of Kuwait Law */}
                    <Card className="border-none shadow-xl rounded-[2rem] p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white space-y-3">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block">نصائح الامتثال الكويتي الفنية:</span>
                        <p className="text-[10px] font-semibold text-slate-300 leading-relaxed">
                            تُلزم المادة 17 والمادة 44 بقانون العمل الكويتي رقم 6 لسنة 2010 كافة الجهات وأرباب التشغيل بضرورة كتابة العقود وتوثيقها باللغة العربية الرسمية كشرط لإنفاذ الشروط الجزائية، مع الالتزام التام بفترة التجربة وأيام الإجازات المعمول بها.
                        </p>
                    </Card>
                </div>

            </div>

        </div>
    );
};
