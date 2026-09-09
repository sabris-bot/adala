import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
    Scale, Sparkles, UserCheck, FileSpreadsheet, Users, Award, 
    Printer, ShieldCheck, ChevronLeft, ChevronRight, Lock, CheckCircle2,
    Send, AlertTriangle, ArrowRightLeft, FileText, Check
} from 'lucide-react';
import { PRINT_TEMPLATES } from './templates';
import { CaseStatus, InvestigationCase } from './types';

interface ResolutionsTabProps {
    selectedCase: InvestigationCase | null;
    cases: InvestigationCase[];
    setCases: (cases: InvestigationCase[]) => void;
    
    // AI Advisor States & Actions
    isAiAnalyzing: boolean;
    aiAnalysisResult: any;
    isAiMemoDrafting: boolean;
    onRunAiAnalysis: () => void;
    onApplyAiRecommendation: () => void;
    onDraftAiLegalMemo: () => void;

    // AI Advisor Chat States & Actions
    aiAdvisorChatText: string;
    setAiAdvisorChatText: (text: string) => void;
    aiAdvisorChatHistory: any[];
    isAiAdvisorChatLoading: boolean;
    onSendAdvisorMessage: () => void;

    // Direct Editor States & Actions
    editorText: string;
    setEditorText: (text: string) => void;
    resolvedPrintText: string;
    selectedTemplateId: string;
    setSelectedTemplateId: (id: string) => void;
    onSaveTemplateText: () => void;
    onResetTemplateText: () => void;

    // Approvals State & Actions
    onApproveRole: (role: 'investigator' | 'legal_manager' | 'general_manager') => void;
    onOpenPrintModal?: () => void;
    addToast: (toast: { type: string; title: string; message: string }) => void;
}

export const ResolutionsTab: React.FC<ResolutionsTabProps> = ({
    selectedCase,
    cases,
    setCases,
    isAiAnalyzing,
    aiAnalysisResult,
    isAiMemoDrafting,
    onRunAiAnalysis,
    onApplyAiRecommendation,
    onDraftAiLegalMemo,
    aiAdvisorChatText,
    setAiAdvisorChatText,
    aiAdvisorChatHistory,
    isAiAdvisorChatLoading,
    onSendAdvisorMessage,
    editorText,
    setEditorText,
    resolvedPrintText,
    selectedTemplateId,
    setSelectedTemplateId,
    onSaveTemplateText,
    onResetTemplateText,
    onApproveRole,
    onOpenPrintModal,
    addToast
}) => {
    const getAutoRecommendedTier = () => {
        if (!selectedCase) return 1;
        const cat = selectedCase.category || '';
        if (cat.includes('غياب') || cat.includes('الامتناع')) return 3;
        if (cat.includes('مالية') || cat.includes('خزينة') || cat.includes('أمن')) return 4;
        if (cat.includes('تأخير') || cat.includes('إنصراف')) return 2;
        if (cat.includes('إفشاء') || cat.includes('سرية') || cat.includes('سلطة')) return 5;
        if (cat.includes('سلوكية') || cat.includes('تعدي')) return 1;
        return 1;
    };

    const [selectedSimTier, setSelectedSimTier] = useState<number>(getAutoRecommendedTier());
    const [customRecommendationText, setCustomRecommendationText] = useState(selectedCase?.recommendation || '');

    React.useEffect(() => {
        if (selectedCase) {
            setSelectedSimTier(getAutoRecommendedTier());
            setCustomRecommendationText(selectedCase.recommendation || '');
        }
    }, [selectedCase]);

    const KUWAIT_PENALTY_TIERS = [
        {
            level: 1,
            title: "إنذار أول كتابي",
            deductionDays: 0,
            description: "توجيه تنبيه خطي بسيط للموظف يوضع في ملفه الشخصي لدرء التكرار بموجب الضوابط اللائحية.",
            article: "المادة 102 من قانون العمل 6/2010",
            consequence: "لا يوجد أثر مالي مباشر، ولكن يسجل كسابقة أولى تلغيها مضي 6 أشهر دون مخالفات أخرى.",
            value: "إنذار كتابي رسمي أول مع لفت نظر مشدد لدرء التكرار"
        },
        {
            level: 2,
            title: "خصم راتب يوم واحد",
            deductionDays: 1,
            description: "خصم قيمة أجر يوم عمل واحد من راتب الموظف الشامل مع توجيه تعهد خطي رسمي بعدم العود.",
            article: "المادة 102 من قانون العمل 6/2010",
            consequence: "خصم مالي يعادل (الراتب الشامل / 26) يوماً بموجب الحساب العمالي الكويتي.",
            value: "خصم راتب يوم عمل كامل مع تعهد كتابي"
        },
        {
            level: 3,
            title: "خصم راتب 3 أيام",
            deductionDays: 3,
            description: "خصم قيمة أجر 3 أيام عمل من راتب الموظف نتيجة تكرار ذات المخالفة أو زيادة جسامتها الإجرائية.",
            article: "المادة 102 من قانون العمل 6/2010",
            consequence: "خصم مالي يعادل 3 أيام من الأجر مع تسجيلها في السجل التأديبي للموظف.",
            value: "خصم راتب 3 أيام عمل بموجب لائحة الجزاءات"
        },
        {
            level: 4,
            title: "خصم راتب 5 أيام (الحد الأقصى للمرة الأولى)",
            deductionDays: 5,
            description: "خصم قيمة أجر 5 أيام عمل، وهو الحد الأقصى الجائز للخصم عن المخالفة الواحدة في الشهر الواحد بموجب القانون.",
            article: "المادة 102 من قانون العمل 6/2010",
            consequence: "خصم مالي يعادل 5 أيام. لا يجوز معاقبة العامل بخصم يزيد عن 5 أيام في الشهر الواحد لمخالفة واحدة.",
            value: "خصم راتب 5 أيام عمل بالحد الأقصى الشهري القانوني"
        },
        {
            level: 5,
            title: "إيقاف مؤقت عن العمل لمدة أسبوع",
            deductionDays: 7,
            description: "وقف الموظف عن ممارسة أعماله مؤقتاً لمدة لا تتجاوز 10 أيام مع حرمان من الأجر أو صرف نصفه فقط.",
            article: "المادة 102 من قانون العمل 6/2010",
            consequence: "حرمان مؤقت من مباشرة مهام العمل ووقف صرف الراتب طيلة فترة الإيقاف.",
            value: "إيقاف مؤقت لمدة أسبوع وحرمان من نصف الأجر"
        },
        {
            level: 6,
            title: "فصل تأديبي مسبّب (مادة 41)",
            deductionDays: 0,
            description: "إنهاء عقد العمل وفصل الموظف نهائياً دون إخطار أو مكافأة نهاية خدمة لارتكابه خطأ جسيماً من الحالات الحصرية.",
            article: "المادة 41 من قانون العمل 6/2010",
            consequence: "الفصل الفوري وسقوط مستحقات نهاية الخدمة كلياً أو جزئياً تبياناً لدرجة الضرر الواقع للمنشأة.",
            value: "فصل تأديبي فوري لارتكاب خطأ جسيم بموجب المادة 41"
        }
    ];

    const handleApplyManualPenalty = (tierObj: typeof KUWAIT_PENALTY_TIERS[0]) => {
        if (!selectedCase) return;
        const updated = cases.map(c => {
            if (c.id === selectedCase.id) {
                return { 
                    ...c, 
                    proposedPenalty: tierObj.value,
                    deductionDays: tierObj.deductionDays,
                    recommendation: `نوصي بتوقيع عقوبة (${tierObj.title}) وفقاً لأحكام ${tierObj.article}؛ نظراً لثبوت الواقعة وتوافر أدلة الإدانة وسماع أقوال المشكو بحقه.`
                };
            }
            return c;
        });
        setCases(updated);
        addToast({
            type: 'success',
            title: 'تم اعتماد درجة الجزاء',
            message: `تم تطبيق جزاء (${tierObj.title}) على محضر التحقيق رقم ${selectedCase.caseNumber}.`
        });
    };

    // TRANSFER TO DISCIPLINARY & APPEALS MODULE
    const handleTransferToDisciplinary = () => {
        if (!selectedCase) return;

        try {
            // Read current disciplinary records from localStorage
            const savedDisc = localStorage.getItem('alwagayan_disciplinary');
            let discList = [];
            if (savedDisc) {
                discList = JSON.parse(savedDisc);
            }

            const autoRecordNo = `QA-DISC-2026-${Math.floor(100 + Math.random() * 900)}`;
            const todayStr = new Date().toISOString().split('T')[0];
            
            // Calculate 20-day appeal deadline according to Kuwait Labor Law
            const appealDateObj = new Date();
            appealDateObj.setDate(appealDateObj.getDate() + 20);
            const appealDeadlineStr = appealDateObj.toISOString().split('T')[0];

            const newDisciplinaryRecord = {
                id: `disc-rec-${Date.now()}`,
                recordNumber: autoRecordNo,
                employeeId: selectedCase.employeeId || 'EMP-100',
                employeeName: selectedCase.employeeName,
                civilId: selectedCase.civilId || '290000000000',
                employeeJobTitle: selectedCase.employeeJobTitle,
                employeeDepartment: selectedCase.employeeDepartment,
                violationType: selectedCase.category || 'مخالفة إدارية عامة',
                violationDate: selectedCase.startDate,
                notificationDate: todayStr,
                relatedInvestigationNo: selectedCase.caseNumber,
                sanctionType: selectedCase.proposedPenalty || 'تنبيه خطي رسمي',
                deductionDays: selectedCase.deductionDays || 0,
                details: selectedCase.facts || selectedCase.subject,
                evidenceNotes: `مستند إلى محضر التحقيق الإداري الرسمي رقم ${selectedCase.caseNumber} المنعقد بمعرفة ${selectedCase.investigator}.`,
                status: 'معتمد',
                issueDate: todayStr,
                appealDeadlineDate: appealDeadlineStr,
                approvedBy: 'مدير الشؤون القانونية والموارد البشرية',
                hasAppealed: false,
                isClosed: false,
                investigationTranscript: {
                    caseId: selectedCase.id,
                    caseNumber: selectedCase.caseNumber,
                    hearingDate: selectedCase.startDate,
                    investigator: selectedCase.investigator,
                    interrogationSummary: selectedCase.facts || selectedCase.subject,
                    questionsAndAnswers: (selectedCase.sessions || []).flatMap(s => s.questions || []).map(q => ({
                        question: q.question,
                        answer: q.answer
                    })),
                    legalGrounds: selectedCase.legalReferences || ['المادة 35 من قانون العمل', 'المادة 102 من قانون العمل'],
                    safeguardsObserved: {
                        hearingConducted: true,
                        defenseHeard: true,
                        proportionalSanction: true
                    }
                }
            };

            const updatedDiscList = [newDisciplinaryRecord, ...discList];
            localStorage.setItem('alwagayan_disciplinary', JSON.stringify(updatedDiscList));

            // Update investigation case
            const updatedCases = cases.map(c => {
                if (c.id === selectedCase.id) {
                    return {
                        ...c,
                        status: CaseStatus.CLOSED,
                        isTransferredToDisciplinary: true,
                        transferredRecordNumber: autoRecordNo,
                        endDate: todayStr,
                        approvedByGeneralManager: true
                    };
                }
                return c;
            });
            setCases(updatedCases);

            addToast({
                type: 'success',
                title: 'تم ترحيل واعتماد القرار التأديبي',
                message: `تم إنشاء القيد رقم (${autoRecordNo}) بنجاح وإدراجه في قسم الجزاءات والتظلمات مع فتح مهلة التظلم 20 يوماً.`
            });
        } catch (error) {
            console.error('Error transferring to disciplinary:', error);
            addToast({
                type: 'error',
                title: 'فشل الترحيل',
                message: 'تعذر ترحيل القرار إلى قسم الجزاءات. يرجى المحاولة مرة أخرى.'
            });
        }
    };

    const activeTierData = KUWAIT_PENALTY_TIERS.find(t => t.level === selectedSimTier) || KUWAIT_PENALTY_TIERS[0];

    // Filter closed or active cases that have decisions
    const casesWithDecisions = cases.filter(c => 
        c.proposedPenalty || 
        c.isTransferredToDisciplinary || 
        c.status === CaseStatus.CLOSED || 
        c.approvedByInvestigator
    );

    // Calculate 20-day appeal deadline status
    const getAppealInfo = (caseItem: InvestigationCase) => {
        const baseDateStr = caseItem.endDate || caseItem.startDate;
        const baseDate = new Date(baseDateStr);
        const deadlineDate = new Date(baseDate);
        deadlineDate.setDate(deadlineDate.getDate() + 20);
        
        const today = new Date();
        const diffTime = deadlineDate.getTime() - today.getTime();
        const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const isExpired = remainingDays <= 0;
        const deadlineStr = deadlineDate.toISOString().split('T')[0];

        return {
            deadlineStr,
            remainingDays: Math.max(0, remainingDays),
            isExpired,
            statusLabel: caseItem.isTransferredToDisciplinary
                ? (isExpired ? 'محصن (انقضت الـ 20 يوماً)' : `قيد مهلة التظلم (${remainingDays} يوم متبقي)`)
                : 'قيد الاعتماد'
        };
    };

    return (
        <div className="space-y-6 animate-fade-in text-right font-sans" style={{ direction: 'rtl' }}>
            
            {/* 1. Dedicated Decisions & Appeals Registry Table (المادة 35 و102) */}
            <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3.5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-amber-50 text-amber-800 border border-amber-200/70 text-[10px] font-black px-2.5 py-0.5 rounded-lg">
                                سجل المتابعة الإلزامية
                            </span>
                            <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                                المادة 35 و 102 من قانون العمل
                            </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 pt-1">
                            <Scale className="w-4 h-4 text-slate-700" />
                            سجل القرارات التأديبية ومتابعة مهلة الـ 20 يوماً للتظلم
                        </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                        إجمالي القرارات: {casesWithDecisions.length}
                    </span>
                </div>

                {casesWithDecisions.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <Scale className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                        <p className="text-xs font-bold text-slate-600">لا توجد قرارات تأديبية صادرة حتى الآن.</p>
                        <p className="text-[11px] text-slate-400">يمكنك استخدام محاكي سلم الجزاءات أدناه لتوقيع العقوبة المناسبة وترحيل القرار.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                        <table className="w-full text-xs text-right">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-black">
                                <tr>
                                    <th className="p-3">رقم المحضر / القرار</th>
                                    <th className="p-3">الموظف المعني</th>
                                    <th className="p-3">المخالفة والتصنيف</th>
                                    <th className="p-3">العقوبة المقررة</th>
                                    <th className="p-3">تاريخ الصدور</th>
                                    <th className="p-3">مهلة التظلم (20 يوماً)</th>
                                    <th className="p-3">حالة القرار</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {casesWithDecisions.map(c => {
                                    const appealInfo = getAppealInfo(c);
                                    const isSelected = selectedCase?.id === c.id;
                                    return (
                                        <tr 
                                            key={c.id}
                                            className={`hover:bg-slate-50 transition-colors ${isSelected ? 'bg-amber-50/40' : ''}`}
                                        >
                                            <td className="p-3 font-mono font-bold text-slate-900">
                                                {c.caseNumber}
                                                {c.transferredRecordNumber && (
                                                    <span className="block text-[10px] text-emerald-700 font-sans font-medium">
                                                        قيد: {c.transferredRecordNumber}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <span className="font-bold text-slate-900 block">{c.employeeName}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{c.employeeDepartment}</span>
                                            </td>
                                            <td className="p-3 text-slate-700 max-w-[180px] truncate">
                                                {c.category || c.subject}
                                            </td>
                                            <td className="p-3">
                                                <span className="font-bold text-amber-900 block text-[11px]">
                                                    {c.proposedPenalty || 'قيد المداولة'}
                                                </span>
                                                {c.deductionDays ? (
                                                    <span className="text-[10px] text-slate-500 font-mono">
                                                        خصم {c.deductionDays} أيام
                                                    </span>
                                                ) : null}
                                            </td>
                                            <td className="p-3 font-mono text-slate-600 text-[11px]">
                                                {c.endDate || c.startDate}
                                            </td>
                                            <td className="p-3">
                                                <div className="space-y-0.5">
                                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md inline-block ${
                                                        appealInfo.isExpired 
                                                            ? 'bg-slate-100 text-slate-700 border border-slate-200' 
                                                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200/70'
                                                    }`}>
                                                        {appealInfo.statusLabel}
                                                    </span>
                                                    <span className="block text-[9px] text-slate-400 font-mono">
                                                        آخر موعد: {appealInfo.deadlineStr}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {c.isTransferredToDisciplinary ? (
                                                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                        مرحّل للجزاءات
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                                                        قيد الاستيفاء
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Top Overview & Transfer Action Banner */}
            {selectedCase?.isTransferredToDisciplinary ? (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-3">
                        <span className="p-2 bg-emerald-600 text-white rounded-xl">
                            <CheckCircle2 className="w-5 h-5" />
                        </span>
                        <div>
                            <h4 className="text-xs font-black text-emerald-950">تم ترحيل واعتماد هذا القرار في سجل الجزاءات والتظلمات</h4>
                            <p className="text-[11px] text-emerald-800 font-medium font-mono">رقم القيد التأديبي: {selectedCase.transferredRecordNumber} • الحالة: معتمد ومحصن قانونياً</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {onOpenPrintModal && (
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-xs font-bold bg-white"
                                onClick={onOpenPrintModal}
                            >
                                <Printer className="w-3.5 h-3.5 ml-1" />
                                طباعة القرار
                            </Button>
                        )}
                    </div>
                </div>
            ) : null}


            {/* Grid of Decision Builder */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Right Column: Kuwait Labor Law Penalty Ladder (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Kuwait Labor Law Article 102 Ladder */}
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-5">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                                    <Scale className="w-4 h-4" />
                                </span>
                                <div>
                                    <h3 className="text-xs font-extrabold text-slate-900">محاكي سلم الجزاءات التأديبية (المادة 102 من قانون العمل 6/2010)</h3>
                                    <p className="text-[10px] text-slate-400">التدرج العقابي المنصوص عليه تشريعياً لضمان عدم بطلان القرار</p>
                                </div>
                            </div>
                        </div>

                        {/* Tier Selector Chips */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {KUWAIT_PENALTY_TIERS.map(tier => (
                                <button
                                    key={tier.level}
                                    onClick={() => setSelectedSimTier(tier.level)}
                                    className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                                        selectedSimTier === tier.level 
                                            ? 'bg-slate-900 border-slate-900 text-white shadow-xs scale-[1.02]' 
                                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                    }`}
                                >
                                    <div className="flex justify-between items-center w-full mb-1">
                                        <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                                            selectedSimTier === tier.level ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-700'
                                        }`}>
                                            الدرجة {tier.level}
                                        </span>
                                        {tier.deductionDays > 0 && (
                                            <span className={`text-[9px] font-mono font-bold ${
                                                selectedSimTier === tier.level ? 'text-amber-300' : 'text-slate-500'
                                            }`}>
                                                {tier.deductionDays} أيام خصم
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs font-bold">{tier.title}</span>
                                </button>
                            ))}
                        </div>

                        {/* Active Tier Detailed Card */}
                        <div className="p-4 bg-amber-50/40 border border-amber-200/80 rounded-xl space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                                        {activeTierData.title}
                                    </h4>
                                    <span className="text-[10px] text-amber-800 font-bold font-mono">{activeTierData.article}</span>
                                </div>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-lg px-3 py-1.5 shadow-2xs"
                                    onClick={() => handleApplyManualPenalty(activeTierData)}
                                >
                                    اعتماد هذا الجزاء
                                    <Check className="w-3.5 h-3.5 mr-1" />
                                </Button>
                            </div>

                            <p className="text-xs text-slate-700 leading-relaxed font-sans">{activeTierData.description}</p>
                            
                            <div className="text-[11px] text-slate-600 bg-white p-3 rounded-lg border border-amber-200/60 font-medium">
                                <span className="font-bold text-amber-900 ml-1">الأثر القانوني والمالي:</span>
                                {activeTierData.consequence}
                            </div>
                        </div>

                        {/* Current Applied Penalty on Case */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                            <div>
                                <span className="text-[10px] text-slate-400 block font-bold">الجزاء المعتمد حالياً بالملف:</span>
                                <p className="text-xs font-black text-slate-900">
                                    {selectedCase?.proposedPenalty || 'لم يتم تحديد جزاء مقترح بعد'}
                                </p>
                            </div>
                            {selectedCase?.deductionDays !== undefined && (
                                <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-md border">
                                    أيام الخصم: {selectedCase.deductionDays}
                                </span>
                            )}
                        </div>
                    </Card>

                    {/* AI Legal Recommendation Drafter */}
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                                    <Sparkles className="w-4 h-4" />
                                </span>
                                <div>
                                    <h3 className="text-xs font-extrabold text-slate-900">المستشار القانوني الذكي (AI Legal Advisor)</h3>
                                    <p className="text-[10px] text-slate-400">مطابقة وقائع التحقيق مع قانون العمل الكويتي رقم 6 لسنة 2010 (المواد 35، 41، 102)</p>
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-xs font-bold bg-indigo-50/50 hover:bg-indigo-100 text-indigo-900 border-indigo-200"
                                onClick={onRunAiAnalysis}
                                disabled={isAiAnalyzing}
                            >
                                {isAiAnalyzing ? 'جارِ التحليل...' : 'توليد توصية قانونية ذكية'}
                                <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                            </Button>
                        </div>

                        {aiAnalysisResult ? (
                            <div className="p-4 bg-indigo-50/40 border border-indigo-200/70 rounded-xl space-y-3.5">
                                {/* Legal Summary & Analysis */}
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-indigo-900 block">التكييف والتسبيب القانوني المقترح:</span>
                                    <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans bg-white p-3 rounded-lg border border-indigo-100">
                                        {aiAnalysisResult.recommendation || aiAnalysisResult.summary || JSON.stringify(aiAnalysisResult)}
                                    </p>
                                </div>

                                {/* Matched Legal Articles */}
                                {aiAnalysisResult.applicableArticles && aiAnalysisResult.applicableArticles.length > 0 && (
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-black text-indigo-900 block">النصوص والمواد القانونية المنطبقة (قانون العمل الكويتي):</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {aiAnalysisResult.applicableArticles.map((art: string, aIdx: number) => (
                                                <span key={aIdx} className="text-[10px] font-bold bg-white text-indigo-950 px-2.5 py-1 rounded-md border border-indigo-200/80 shadow-3xs flex items-center gap-1">
                                                    <Scale className="w-3 h-3 text-indigo-600" />
                                                    {art}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Proposed Penalty Degrees */}
                                {aiAnalysisResult.proposedPenalties && aiAnalysisResult.proposedPenalties.length > 0 && (
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-black text-indigo-900 block">الجزاءات التأديبية المقترحة وفق سلم التدرج (المادة 102):</span>
                                        <div className="space-y-1.5">
                                            {aiAnalysisResult.proposedPenalties.map((pen: string, pIdx: number) => (
                                                <div key={pIdx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-indigo-100 text-xs">
                                                    <span className="font-bold text-slate-800">
                                                        {pIdx + 1}. {pen}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (!selectedCase) return;
                                                            const updated = cases.map(c => {
                                                                if (c.id === selectedCase.id) {
                                                                    return {
                                                                        ...c,
                                                                        proposedPenalty: pen,
                                                                        recommendation: `بناءً على التوصية الذكية للمستشار: نقترح توقيع (${pen}) استناداً للمواد المنطبقة (${(aiAnalysisResult.applicableArticles || []).join('، ') || 'المادة 102'}).`
                                                                    };
                                                                }
                                                                return c;
                                                            });
                                                            setCases(updated);
                                                            addToast({
                                                                type: 'success',
                                                                title: 'تم اعتماد مقترح الذكاء الاصطناعي',
                                                                message: `تم تطبيق جزاء (${pen}) مباشرة على ملف التحقيق.`
                                                            });
                                                        }}
                                                        className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[9.5px] rounded-md transition-all border-none cursor-pointer"
                                                    >
                                                        اعتماد الجزاء ✓
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-1 border-t border-indigo-100">
                                    <Button
                                        size="sm"
                                        className="bg-indigo-700 hover:bg-indigo-800 text-white text-xs font-bold rounded-lg"
                                        onClick={onApplyAiRecommendation}
                                    >
                                        تثبيت التوصية في أوراق الملف
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs font-bold bg-white text-indigo-900 border-indigo-200"
                                        onClick={onDraftAiLegalMemo}
                                        disabled={isAiMemoDrafting}
                                    >
                                        {isAiMemoDrafting ? 'جارِ الصياغة...' : 'صياغة مذكرة رأي رسمية'}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-slate-500 leading-relaxed">
                                اضغط على زر التحليل الذكي لمطابقة وقائع وأقوال التحقيق مباشرة مع أحكام قانون العمل الكويتي (رقم 6 لسنة 2010)، واستخراج المواد المنطبقة ومقترحات الجزاء التأديبي.
                            </p>
                        )}
                    </Card>
                </div>

                {/* Left Column: Approvals & Disciplinary Transfer Action (5 cols) */}
                <div className="lg:col-span-5 space-y-6">
                    
                    {/* Multi-Tier Approval Workflow */}
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-5">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
                                <UserCheck className="w-4 h-4" />
                            </span>
                            <div>
                                <h3 className="text-xs font-extrabold text-slate-900">سلسلة الاعتماد والمصادقة اللائحية</h3>
                                <p className="text-[10px] text-slate-400">التوقيع الثلاثي لضمان نفاذ القرار</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {/* 1. Investigator */}
                            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-slate-400 block font-bold">1. المحقق الإداري المختص:</span>
                                    <p className="text-xs font-bold text-slate-800">{selectedCase?.investigator || 'أ. صبري شطا'}</p>
                                </div>
                                {selectedCase?.approvedByInvestigator ? (
                                    <span className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        تم الاعتماد
                                    </span>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs font-bold"
                                        onClick={() => onApproveRole('investigator')}
                                    >
                                        اعتماد المحقق
                                    </Button>
                                )}
                            </div>

                            {/* 2. Legal Manager */}
                            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-slate-400 block font-bold">2. مدير الشؤون القانونية:</span>
                                    <p className="text-xs font-bold text-slate-800">رئيس قطاع الامتثال والفتوى</p>
                                </div>
                                {selectedCase?.approvedByLegalManager ? (
                                    <span className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        تم الاعتماد
                                    </span>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-xs font-bold"
                                        onClick={() => onApproveRole('legal_manager')}
                                    >
                                        اعتماد الإدارة
                                    </Button>
                                )}
                            </div>

                            {/* 3. General Manager */}
                            <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] text-slate-400 block font-bold">3. المدير العام للمنشأة:</span>
                                    <p className="text-xs font-bold text-slate-800">الرئيس التنفيذي والمفوض بالتوقيع</p>
                                </div>
                                {selectedCase?.approvedByGeneralManager ? (
                                    <span className="flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        تم التصديق
                                    </span>
                                ) : (
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        className="text-xs font-bold bg-slate-900 hover:bg-slate-800"
                                        onClick={() => onApproveRole('general_manager')}
                                    >
                                        تصديق المدير
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Master Action: Transfer To Disciplinary & Appeals Department */}
                    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl shadow-md space-y-4">
                        <div className="space-y-1">
                            <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                                الربط والتكامل المباشر
                            </span>
                            <h3 className="text-sm font-black text-white pt-1 flex items-center gap-2">
                                <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                                ترحيل واعتماد القرار في سجل الجزاءات والتظلمات
                            </h3>
                            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                                عند ترحيل القرار، سيتم نقله رسمياً إلى قسم (/employee-affairs/disciplinary)، وخصم أيام الجزاء من المسيرات، وإشعار الموظف بحقه في التظلم خلال 20 يوماً.
                            </p>
                        </div>

                        <Button
                            size="lg"
                            className={`w-full text-xs font-black py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all ${
                                selectedCase?.isTransferredToDisciplinary
                                    ? 'bg-emerald-700 text-white cursor-default'
                                    : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
                            }`}
                            onClick={handleTransferToDisciplinary}
                            disabled={selectedCase?.isTransferredToDisciplinary}
                        >
                            {selectedCase?.isTransferredToDisciplinary ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 text-white" />
                                    تم الترحيل والإدراج في سجل الجزاءات
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 ml-1" />
                                    اعتماد وترحيل إلى سجل الجزاءات والتظلمات
                                </>
                            )}
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
};
