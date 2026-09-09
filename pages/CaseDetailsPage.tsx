
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Case, CaseStatus, RiskLevel, CaseMainType, CasePriority, CourtLevel, 
    Hearing, CaseFile, ExecutionAction, ExpertAction, LitigationStage, NotificationStatus 
} from '../types';
import { initialCases } from '../data/caseData';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
    CaseStatusBadge, RiskLevelBadge, PriorityBadge, 
    ExecutionActionStatusBadge, ExpertActionStatusBadge 
} from '../components/ui/Badge';
import { 
    ArrowRightIcon, ScaleIcon, GavelIcon, ClockIcon, DocumentTextIcon, 
    BanknotesIcon, FolderIcon, SparklesIcon, PrinterIcon, HistoryIcon,
    BriefcaseIcon, InformationCircleIcon, TagIcon, PlusCircleIcon,
    ChevronDownIcon, EyeIcon, PencilIcon, ShareIcon, ActivityIcon,
    CheckCircleIcon, BuildingLibraryIcon, ListBulletIcon
} from '../constants';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { useToast } from '../components/ui/Toast';
import FloatingAiAssistantWidget from '../components/FloatingAiAssistantWidget';

const DEFAULT_TAGS = [
    { id: 'tag-urgent', name: 'ملف مستعجل 🔴', color: 'red' },
    { id: 'tag-evidence', name: 'مستندات حاسمة 🟢', color: 'green' },
    { id: 'tag-missing-docs', name: 'نقص مستندات 🟡', color: 'amber' },
    { id: 'tag-review', name: 'قيد التدقيق 🔵', color: 'blue' },
    { id: 'tag-client', name: 'مراجعة العميل 🟣', color: 'purple' }
];

const AVAILABLE_COLORS = [
    { value: 'red', label: 'أحمر 🔴' },
    { value: 'green', label: 'أخضر 🟢' },
    { value: 'blue', label: 'أزرق 🔵' },
    { value: 'amber', label: 'ذهبي 🟡' },
    { value: 'purple', label: 'بنفسجي 🟣' },
    { value: 'teal', label: 'تركواز 🟢' },
    { value: 'rose', label: 'وردي 🌸' },
    { value: 'indigo', label: 'نيلي 🌌' }
];

const getTagColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; darkBg: string; darkText: string }> = {
        red: {
            bg: 'bg-red-50 text-red-700 border-red-100',
            text: 'text-red-700',
            border: 'border-red-100',
            darkBg: 'dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30',
            darkText: 'dark:text-red-400'
        },
        green: {
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            text: 'text-emerald-700',
            border: 'border-emerald-100',
            darkBg: 'dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30',
            darkText: 'dark:text-emerald-400'
        },
        blue: {
            bg: 'bg-blue-50 text-blue-700 border-blue-100',
            text: 'text-blue-700',
            border: 'border-blue-100',
            darkBg: 'dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30',
            darkText: 'dark:text-blue-400'
        },
        amber: {
            bg: 'bg-amber-50 text-amber-700 border-amber-100',
            text: 'text-amber-700',
            border: 'border-amber-100',
            darkBg: 'dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30',
            darkText: 'dark:text-amber-400'
        },
        purple: {
            bg: 'bg-purple-50 text-purple-700 border-purple-100',
            text: 'text-purple-700',
            border: 'border-purple-100',
            darkBg: 'dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/30',
            darkText: 'dark:text-purple-400'
        },
        teal: {
            bg: 'bg-teal-50 text-teal-700 border-teal-100',
            text: 'text-teal-700',
            border: 'border-teal-100',
            darkBg: 'dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/30',
            darkText: 'dark:text-teal-400'
        },
        rose: {
            bg: 'bg-rose-50 text-rose-700 border-rose-100',
            text: 'text-rose-700',
            border: 'border-rose-100',
            darkBg: 'dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30',
            darkText: 'dark:text-rose-400'
        },
        indigo: {
            bg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
            text: 'text-indigo-700',
            border: 'border-indigo-100',
            darkBg: 'dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-900/30',
            darkText: 'dark:text-indigo-400'
        }
    };
    const c = colors[color] || {
        bg: 'bg-slate-50 text-slate-700 border-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-100',
        darkBg: 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        darkText: 'dark:text-slate-300'
    };
    return `${c.bg} ${c.darkBg} border px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-tight inline-flex items-center gap-1`;
};

const CaseDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { addToast } = useToast();
    
    const [caseItem, setCaseItem] = useState<Case | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'hearings' | 'experts' | 'execution' | 'archive' | 'financials' | 'ai' | 'emails' | 'memos'>('details');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);

    const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [newTagColor, setNewTagColor] = useState('red');

    const [isFocusMode, setIsFocusMode] = useState(false);
    const [focusFontSize, setFocusFontSize] = useState<number>(18);
    const [focusLineHeight, setFocusLineHeight] = useState<'relaxed' | 'loose'>('relaxed');
    const [focusFontFamily, setFocusFontFamily] = useState<'serif' | 'sans'>('serif');

    useEffect(() => {
        if (isFocusMode) {
            document.documentElement.classList.add('focus-mode-active');
        } else {
            document.documentElement.classList.remove('focus-mode-active');
        }
        return () => {
            document.documentElement.classList.remove('focus-mode-active');
        };
    }, [isFocusMode]);

    const updateCase = (updated: Case) => {
        setCaseItem(updated);
        const stored = localStorage.getItem('qanooni_cases_list');
        if (stored) {
            try {
                const currentCases: Case[] = JSON.parse(stored);
                const index = currentCases.findIndex(c => c.id === updated.id);
                if (index !== -1) {
                    currentCases[index] = updated;
                    localStorage.setItem('qanooni_cases_list', JSON.stringify(currentCases));
                }
            } catch (e) {
                console.error("Failed to update qanooni_cases_list:", e);
            }
        }
    };

    const customTags = caseItem?.customTags || DEFAULT_TAGS;

    const handleToggleTagOnCase = (tagId: string) => {
        if (!caseItem) return;
        const currentTags = caseItem.tags || [];
        const updatedTags = currentTags.includes(tagId)
            ? currentTags.filter(id => id !== tagId)
            : [...currentTags, tagId];
        
        updateCase({
            ...caseItem,
            tags: updatedTags
        });
    };

    const handleCreateTagDefinition = () => {
        if (!caseItem) return;
        if (!newTagName.trim()) {
            addToast({ type: 'error', title: 'خطأ', message: 'يرجى كتابة اسم التصنيف الجديد' });
            return;
        }

        const newTag = {
            id: `tag-${Date.now()}`,
            name: newTagName.trim(),
            color: newTagColor
        };

        const updatedCustomTags = [...customTags, newTag];
        updateCase({
            ...caseItem,
            customTags: updatedCustomTags
        });

        setNewTagName('');
        addToast({ type: 'success', title: 'تم الحفظ', message: 'تم إنشاء بطاقة التصنيف الملونة بنجاح' });
    };

    const handleDeleteTagDefinition = (tagId: string) => {
        if (!caseItem) return;
        const updatedCustomTags = customTags.filter(t => t.id !== tagId);
        const updatedCaseTags = (caseItem.tags || []).filter(id => id !== tagId);
        
        // Also remove this tag from any files
        const updatedFiles = (caseItem.caseFiles || []).map(f => ({
            ...f,
            tags: (f.tags || []).filter(id => id !== tagId)
        }));

        updateCase({
            ...caseItem,
            customTags: updatedCustomTags,
            tags: updatedCaseTags,
            caseFiles: updatedFiles
        });

        addToast({ type: 'success', title: 'تم الحذف', message: 'تم حذف بطاقة التصنيف من النظام وإلغاء ارتباطها' });
    };

    useEffect(() => {
        let currentCases = initialCases;
        const stored = localStorage.getItem('qanooni_cases_list');
        if (stored) {
            try {
                currentCases = JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse qanooni_cases_list:", e);
            }
        }
        const found = currentCases.find(c => c.id === id);
        if (found) {
            setCaseItem(found);
        } else {
            addToast({ type: 'error', title: 'خطأ', message: 'القضية المطلوبة غير موجودة' });
            navigate('/cases');
        }
    }, [id, navigate, addToast]);

    if (!caseItem) return null;

    const handleGenerateAiSummary = async () => {
        setIsGeneratingSummary(true);
        try {
            const context = {
                title: caseItem.title,
                type: caseItem.caseMainType,
                court: caseItem.courtName,
                demands: caseItem.legalDemands,
                hearings: caseItem.hearings?.map(h => ({ date: h.date, type: h.type, result: h.notes }))
            };
            const prompt = `بناءً على بيانات القضية التالية في القانون الكويتي، قدم تحليلاً قانونياً استراتيجياً وملخصاً للموقف الحالي:\n${JSON.stringify(context)}`;
            const response = await geminiService.getChatbotResponse(prompt);
            setAiSummary(response);
        } catch (error) {
            addToast({ type: 'error', title: 'خطأ في الذكاء الاصطناعي', message: 'تعذر تحليل القضية حالياً' });
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    const tabs = [
        { id: 'details', label: 'البيانات الأساسية', icon: <InformationCircleIcon className="w-4 h-4" /> },
        { id: 'hearings', label: 'الجلسات والقرارات', icon: <GavelIcon className="w-4 h-4" /> },
        { id: 'experts', label: 'إدارة الخبراء', icon: <BriefcaseIcon className="w-4 h-4" /> },
        { id: 'execution', label: 'إجراءات التنفيذ', icon: <ClockIcon className="w-4 h-4" /> },
        { id: 'financials', label: 'المصاريف والأتعاب', icon: <BanknotesIcon className="w-4 h-4" /> },
        { id: 'archive', label: 'ملفات القضية', icon: <FolderIcon className="w-4 h-4" /> },
        { id: 'emails', label: 'المراسلات والقوالب', icon: <EnvelopeIcon className="w-4 h-4" /> },
        { id: 'memos', label: 'المذكرات القانونية', icon: <DocumentTextIcon className="w-4 h-4" /> },
        { id: 'ai', label: 'التحليل الذكي', icon: <SparklesIcon className="w-4 h-4" /> }
    ] as const;

    if (isFocusMode && caseItem) {
        return (
            <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-[#FCFBF9] text-[#1C1917] transition-all" dir="rtl">
                {/* Fixed Control Toolbar */}
                <div className="sticky top-4 z-50 flex flex-wrap items-center justify-between gap-4 p-4 mb-8 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-lg no-focus">
                    <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 text-sm">وضع القراءة المركزة والطباعة 📖</span>
                        <span className="text-xs text-stone-300">|</span>
                        <span className="text-xs font-black bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg">ملف القضية</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Font Family Selector */}
                        <button 
                            onClick={() => setFocusFontFamily(prev => prev === 'serif' ? 'sans' : 'serif')}
                            className="p-2 hover:bg-stone-50 rounded-xl transition-all border border-stone-200 text-xs font-black flex items-center gap-1 text-stone-700 bg-white"
                            title="تغيير نوع الخط"
                        >
                            <span>نوع الخط:</span>
                            <span className="font-bold underline">{focusFontFamily === 'serif' ? 'رسمي (نسخ)' : 'حديث (رقعة)'}</span>
                        </button>

                        {/* Font Sizing */}
                        <div className="flex items-center bg-stone-50 rounded-xl border border-stone-200 p-0.5">
                            <button 
                                onClick={() => setFocusFontSize(prev => Math.max(14, prev - 2))}
                                className="w-8 h-8 flex items-center justify-center hover:bg-stone-200 rounded-lg text-stone-600 font-bold"
                                title="تصغير الخط"
                            >
                                أ-
                            </button>
                            <span className="px-2 text-xs font-black text-stone-700">{focusFontSize}px</span>
                            <button 
                                onClick={() => setFocusFontSize(prev => Math.min(28, prev + 2))}
                                className="w-8 h-8 flex items-center justify-center hover:bg-stone-200 rounded-lg text-stone-600 font-bold"
                                title="تكبير الخط"
                            >
                                أ+
                            </button>
                        </div>

                        {/* Line Spacing */}
                        <button 
                            onClick={() => setFocusLineHeight(prev => prev === 'relaxed' ? 'loose' : 'relaxed')}
                            className="p-2 hover:bg-stone-50 rounded-xl transition-all border border-stone-200 text-xs font-black flex items-center gap-1 text-stone-700 bg-white"
                            title="تغيير التباعد بين السطور"
                        >
                            تباعد: {focusLineHeight === 'relaxed' ? 'متوسط' : 'مريح'}
                        </button>

                        <button 
                            onClick={() => window.print()}
                            className="px-3.5 py-2 bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl transition-all shadow-sm text-xs font-black flex items-center gap-1.5"
                        >
                            <PrinterIcon className="w-4 h-4" />
                            طباعة فورية
                        </button>

                        <button 
                            onClick={() => setIsFocusMode(false)}
                            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-850 text-white rounded-xl transition-all text-xs font-black flex items-center gap-1.5"
                        >
                            <ArrowRightIcon className="w-4 h-4 rotate-180" />
                            خروج
                        </button>
                    </div>
                </div>

                {/* Printable Document Paper Card */}
                <div 
                    className={`bg-white border border-stone-200 shadow-sm p-6 md:p-12 lg:p-16 rounded-3xl transition-all text-stone-900
                                ${focusFontFamily === 'serif' ? 'font-focused-serif' : 'font-focused-sans'}
                                ${focusLineHeight === 'relaxed' ? 'leading-relaxed' : 'leading-loose'}`}
                    style={{ fontSize: `${focusFontSize}px` }}
                >
                    {/* Legal Document Header */}
                    <div className="flex justify-between items-start border-b-2 border-stone-900 pb-6 mb-10">
                        <div className="text-right">
                            <h2 className="text-lg font-black text-stone-900">مكتب المحامي صبري شطا وشركاه</h2>
                            <p className="text-xs text-stone-500 font-bold mt-1">للمحاماة والاستشارات القانونية والتحكيم</p>
                            <p className="text-[10px] text-stone-400 font-medium font-sans">دولة الكويت، العاصمة</p>
                        </div>
                        <div className="text-center py-2 px-4 border border-stone-300 rounded-xl">
                            <span className="text-sm font-black text-stone-900 block font-sans">مستند قضائي مدرج</span>
                            <span className="text-[10px] text-stone-500 font-bold font-sans">رقم الملف: {caseItem.fileNumber}</span>
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <h1 className="text-2xl lg:text-3xl font-black text-stone-900 tracking-tight leading-tight">
                            تقرير ملف الدعوى القضائية الشامل
                        </h1>
                        <p className="text-xs text-stone-500 font-bold mt-2 font-sans">تاريخ التصدير المعتمد: {new Date().toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>

                    {/* Section 1: Basic Information */}
                    <div className="mb-10">
                        <h3 className="text-base font-black text-stone-900 border-r-4 border-[#00796B] pr-3 mb-4">
                            أولاً: البيانات الأساسية لملف الدعوى
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-stone-850 text-sm py-4 bg-stone-50 rounded-xl px-5 border border-stone-200/50">
                            <div>
                                <span className="font-extrabold text-stone-500 text-xs block mb-1">عنوان ملف الدعوى:</span>
                                <span className="font-black text-stone-900">{caseItem.title}</span>
                            </div>
                            <div>
                                <span className="font-extrabold text-stone-500 text-xs block mb-1">الرقم الآلي الموحد للبوابة القضائية:</span>
                                <span className="font-bold text-stone-900 font-sans">{caseItem.automatedNo || 'غير متوفر'}</span>
                            </div>
                            <div>
                                <span className="font-extrabold text-stone-500 text-xs block mb-1">رقم القضية القضائية:</span>
                                <span className="font-bold text-stone-900 font-sans">{caseItem.caseNumber}</span>
                            </div>
                            <div>
                                <span className="font-extrabold text-stone-500 text-xs block mb-1">الرقم الداخلي للمكتب:</span>
                                <span className="font-bold text-stone-900 font-sans">{caseItem.internalCaseNumber || 'قيد المعالجة'}</span>
                            </div>
                            <div>
                                <span className="font-extrabold text-stone-500 text-xs block mb-1">اسم موكل المكتب والصفة:</span>
                                <span className="font-bold text-stone-900">{caseItem.clientName} ({caseItem.clientRole})</span>
                            </div>
                            <div>
                                <span className="font-extrabold text-stone-500 text-xs block mb-1">الخصم والصفة في الدعوى:</span>
                                <span className="font-bold text-stone-900">{caseItem.opposingPartyName || 'غير مسجل'} ({caseItem.opponentRole})</span>
                            </div>
                            <div>
                                <span className="font-extrabold text-stone-500 text-xs block mb-1">المحكمة والدائرة القضائية:</span>
                                <span className="font-bold text-stone-900">{caseItem.courtName} - {caseItem.circuit || 'الدائرة العامة'}</span>
                            </div>
                            <div>
                                <span className="font-extrabold text-stone-500 text-xs block mb-1">درجة التقاضي وحالة الملف الحالية:</span>
                                <span className="font-bold text-stone-900">{caseItem.litigationStage || 'أول درجة'} | {caseItem.status}</span>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Subject & Demands */}
                    <div className="mb-10">
                        <h3 className="text-base font-black text-stone-900 border-r-4 border-[#00796B] pr-3 mb-4">
                            ثانياً: ملخص النزاع والطلبات الختامية للموكل
                        </h3>
                        <div className="text-stone-850 text-sm leading-relaxed whitespace-pre-wrap p-5 bg-stone-50 rounded-xl border border-stone-200/50 italic">
                            "{caseItem.legalDemands || 'لم يتم تقيد طلبات قانونية إضافية لهذا الملف.'}"
                        </div>
                    </div>

                    {/* Section 3: Scheduled Hearings */}
                    <div className="mb-10">
                        <h3 className="text-base font-black text-stone-900 border-r-4 border-[#00796B] pr-3 mb-4">
                            ثالثاً: تاريخ رول الجلسات والقرارات الصادرة
                        </h3>
                        {(!caseItem.hearings || caseItem.hearings.length === 0) ? (
                            <p className="text-xs text-stone-500 italic">لم تدرج أي جلسات قضائية مجدولة لهذا الملف حتى الآن.</p>
                        ) : (
                            <div className="overflow-x-auto border border-stone-200 rounded-xl">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-stone-100 text-stone-600 font-sans border-b border-stone-200">
                                        <tr>
                                            <th className="p-3">تاريخ الجلسة</th>
                                            <th className="p-3">نوع الجلسة</th>
                                            <th className="p-3">القاعة القضائية</th>
                                            <th className="p-3">القرار والنتيجة الصادرة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-150 text-stone-850">
                                        {caseItem.hearings.map((h, i) => (
                                            <tr key={i} className="hover:bg-stone-50/30">
                                                <td className="p-3 font-sans font-bold">{h.date}</td>
                                                <td className="p-3 font-bold">{h.type}</td>
                                                <td className="p-3 font-sans">{h.room || 'الدائرة العامة'}</td>
                                                <td className="p-3 font-bold text-stone-950 leading-relaxed">{h.notes || 'لم يصدر قرار بعد'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Section 4: Executions */}
                    <div className="mb-10">
                        <h3 className="text-base font-black text-stone-900 border-r-4 border-[#00796B] pr-3 mb-4">
                            رابعاً: الإجراءات التنفيذية والقرارات المتخذة
                        </h3>
                        {(!caseItem.executionActions || caseItem.executionActions.length === 0) ? (
                            <p className="text-xs text-stone-500 italic">لا توجد إجراءات تنفيذية مسجلة حتى تاريخه.</p>
                        ) : (
                            <div className="space-y-3 font-sans">
                                {caseItem.executionActions.map((ex, i) => (
                                    <div key={i} className="p-4 bg-stone-50 rounded-xl border border-stone-200/50 flex justify-between items-center text-xs">
                                        <div>
                                            <span className="font-extrabold text-stone-900 block mb-1">{ex.actionName}</span>
                                            <span className="text-stone-500 font-bold font-sans">تاريخ الإجراء: {ex.date} | المتابع: {ex.executorName}</span>
                                        </div>
                                        <span className="font-bold text-stone-700 bg-stone-200/60 px-3 py-1 rounded-md">{ex.status}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section 5: AI Recommendations */}
                    {aiSummary && (
                        <div className="mb-10 no-focus">
                            <h3 className="text-base font-black text-stone-900 border-r-4 border-[#00796B] pr-3 mb-4">
                                خامساً: التوجيه والتحليل الاستراتيجي من كشاف عدالة الذكي (AI)
                            </h3>
                            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-850 leading-relaxed font-sans markdown-body">
                                <ReactMarkdown>{aiSummary}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    {/* Footer Signature */}
                    <div className="mt-20 pt-8 border-t border-stone-300 flex justify-between items-center text-xs font-sans">
                        <div className="text-right text-stone-400 font-bold">
                            توقيع واعتماد رئيس الهيئة الاستشارية للمكتب
                        </div>
                        <div className="text-left font-bold text-stone-400">
                            صنع بكل فخر في دولة الكويت © {new Date().getFullYear()} عدالة
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-10 bg-slate-50 dark:bg-dm-background min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
                <div className="flex items-center gap-4">
                    <Link to="/cases" className="p-3 bg-white dark:bg-dm-card rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <ArrowRightIcon className="w-5 h-5 text-slate-400 rotate-180" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-lg border border-primary/20">
                                {caseItem.internalCaseNumber || 'قضية جديدة'}
                            </span>
                            <span className="text-[10px] font-black text-slate-400">ملف رقم: {caseItem.fileNumber}</span>
                        </div>
                        <h1 className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tighter max-w-2xl leading-tight">
                            {caseItem.title}
                        </h1>
                        <div className="flex flex-wrap gap-2 mt-3 items-center">
                            {(caseItem.tags || []).map(tagId => {
                                const t = customTags.find(x => x.id === tagId);
                                if (!t) return null;
                                return (
                                    <span key={tagId} className={getTagColorClasses(t.color)}>
                                        <TagIcon className="w-3 h-3" />
                                        {t.name}
                                    </span>
                                );
                            })}
                            <button 
                                onClick={() => setIsTagManagerOpen(true)} 
                                className="text-[10px] text-primary bg-primary/5 hover:bg-primary/10 border border-primary/20 font-black px-2.5 py-1 rounded-full flex items-center gap-1 transition-all"
                            >
                                <PlusCircleIcon className="w-3.5 h-3.5" />
                                تصنيف ملف القضية
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Button 
                        variant="outline" 
                        className="flex-1 lg:flex-none h-12 rounded-2xl gap-2 font-black border-slate-200 bg-amber-50/50 hover:bg-amber-100/60 dark:bg-amber-950/20 dark:border-amber-900/40 text-amber-800 dark:text-amber-300" 
                        onClick={() => setIsFocusMode(true)}
                    >
                        <EyeIcon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        وضع القراءة المركزة
                    </Button>
                    <Button variant="outline" className="flex-1 lg:flex-none h-12 rounded-2xl gap-2 font-black border-slate-200" onClick={() => window.print()}>
                        <PrinterIcon className="w-4 h-4 text-slate-400" />
                        طباعة الملف
                    </Button>
                    <Button className="flex-1 lg:flex-none h-12 rounded-2xl gap-2 font-black shadow-xl shadow-primary/20">
                        <PencilIcon className="w-4 h-4" />
                        تعديل البيانات
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-9 space-y-8">
                    {/* Status Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatusCard label="حالة القضية" value={<CaseStatusBadge status={caseItem.status} />} icon={<ActivityIcon className="text-primary" />} />
                        <StatusCard label="درجة التقاضي" value={caseItem.litigationStage || 'أول درجة'} icon={<ScaleIcon className="text-indigo-500" />} />
                        <StatusCard label="المخاطر" value={<RiskLevelBadge level={caseItem.riskLevel} />} icon={<HistoryIcon className="text-orange-500" />} />
                        <StatusCard label="المحكمة" value={caseItem.courtName} icon={<BuildingLibraryIcon className="text-blue-500" />} />
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                                    activeTab === tab.id 
                                    ? 'bg-white dark:bg-dm-card text-primary shadow-sm' 
                                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="min-h-[500px]"
                    >
                        {activeTab === 'details' && <DetailsTab caseItem={caseItem} />}
                        {activeTab === 'hearings' && <HearingsTab hearings={caseItem.hearings || []} />}
                        {activeTab === 'experts' && <ExpertsTab expertActions={caseItem.expertActions || []} />}
                        {activeTab === 'execution' && <ExecutionTab executionActions={caseItem.executionActions || []} />}
                        {activeTab === 'financials' && <FinancialsTab financials={caseItem.financials} />}
                        {activeTab === 'archive' && (
                            <ArchiveTab 
                                caseItem={caseItem} 
                                onUpdateCase={updateCase} 
                            />
                        )}
                        {activeTab === 'emails' && <EmailsTab caseItem={caseItem} />}
                        {activeTab === 'memos' && (
                            <MemosTab 
                                caseItem={caseItem} 
                                onUpdateCase={updateCase} 
                            />
                        )}
                        {activeTab === 'ai' && (
                            <AiAnalysisTab 
                                summary={aiSummary} 
                                onGenerate={handleGenerateAiSummary} 
                                isLoading={isGeneratingSummary} 
                            />
                        )}
                    </motion.div>
                </div>

                {/* Sidebar Info */}
                <div className="lg:col-span-3 space-y-6">
                    <Card className="p-6 rounded-[2rem] border-none shadow-sm dark:bg-dm-card">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">الأطراف المشاركة</h3>
                        <div className="space-y-6">
                            <PartyInfo label="الموكل" name={caseItem.clientName} role={caseItem.clientRole} isPrimary />
                            <PartyInfo label="الخصم" name={caseItem.opposingPartyName || 'غير مسجل'} role={caseItem.opponentRole} />
                            <hr className="border-slate-100 dark:border-slate-800" />
                            <PartyInfo label="المحامي المسؤول" name={caseItem.assignedLawyer} role="مستشار قانوني" icon={<UserTieIcon className="w-4 h-4 text-primary" />} />
                        </div>
                    </Card>

                    <Card className="p-6 rounded-[2rem] border-none shadow-sm bg-slate-900 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full -translate-y-16 translate-x-16 blur-2xl transition-transform group-hover:scale-150" />
                        <div className="relative z-10">
                            <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-4">ملخص الطلبات</h3>
                            <p className="text-xs font-bold leading-relaxed text-slate-300 italic">
                                "{caseItem.legalDemands || 'لم يتم قيد الطلبات القانونية لهذه القضية.'}"
                            </p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Tag Manager Modal */}
            <AnimatePresence>
                {isTagManagerOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-dm-card rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 text-right p-8 space-y-6"
                        >
                            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                                <button 
                                    onClick={() => setIsTagManagerOpen(false)} 
                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-lg"
                                >
                                    ✕
                                </button>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3">
                                    <TagIcon className="w-5 h-5 text-primary" />
                                    إدارة التصنيفات الملونة والبطاقات القانونية
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Define Tag Checklist / Toggle to current case */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">تخصيص تصنيفات القضية الحالية</h3>
                                    <p className="text-[11px] text-slate-400">حدد البطاقات التي تود إرفاقها بملف هذه القضية لتسهيل الفرز المتقدم:</p>
                                    <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar p-1">
                                        {customTags.map(tag => {
                                            const isAssigned = (caseItem.tags || []).includes(tag.id);
                                            return (
                                                <div 
                                                    key={tag.id} 
                                                    onClick={() => handleToggleTagOnCase(tag.id)}
                                                    className={`flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                                                        isAssigned 
                                                        ? 'bg-primary/5 border-primary/30 shadow-sm' 
                                                        : 'bg-slate-50 dark:bg-slate-800/45 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteTagDefinition(tag.id);
                                                            }}
                                                            className="text-rose-500 hover:text-rose-700 p-1 text-xs"
                                                            title="حذف هذا التصنيف بالكامل"
                                                        >
                                                            ✕
                                                        </button>
                                                        <span className="text-[10px] font-black opacity-60">حذف</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs font-black text-slate-700 dark:text-slate-200">{tag.name}</span>
                                                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center`} style={{
                                                            backgroundColor: tag.color === 'red' ? '#EF4444' : (tag.color === 'green' ? '#10B981' : (tag.color === 'blue' ? '#3B82F6' : (tag.color === 'amber' ? '#F59E0B' : (tag.color === 'purple' ? '#8B5CF6' : (tag.color === 'teal' ? '#14B8A6' : (tag.color === 'rose' ? '#F43F5E' : '#6366F1'))))))
                                                        }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Create New Custom Tag */}
                                <div className="space-y-4 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 text-right">
                                    <h3 className="text-xs font-black text-slate-900 dark:text-white">إنشاء بطاقة تصنيف مخصصة جديدة</h3>
                                    
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400">اسم بطاقة التصنيف (أقصى 20 حرف)</label>
                                        <input 
                                            type="text"
                                            placeholder="مثال: مذكرة دفاع مستعجلة"
                                            value={newTagName}
                                            onChange={(e) => setNewTagName(e.target.value.slice(0, 25))}
                                            className="w-full text-xs font-bold h-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 rounded-xl px-4 text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 block">اختر اللون التعريفي</label>
                                        <div className="flex flex-wrap gap-1.5 justify-end">
                                            {AVAILABLE_COLORS.map(c => (
                                                <button
                                                    key={c.value}
                                                    onClick={() => setNewTagColor(c.value)}
                                                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black border transition-all ${
                                                        newTagColor === c.value 
                                                        ? 'border-slate-900 dark:border-white scale-105 shadow-sm' 
                                                        : 'border-transparent'
                                                    }`}
                                                    style={{
                                                        backgroundColor: c.value === 'red' ? '#FEE2E2' : (c.value === 'green' ? '#D1FAE5' : (c.value === 'blue' ? '#DBEAFE' : (c.value === 'amber' ? '#FEF3C7' : (c.value === 'purple' ? '#F3E8FF' : (c.value === 'teal' ? '#CCFBF1' : (c.value === 'rose' ? '#FFE4E6' : '#E0E7FF')))))),
                                                        color: c.value === 'red' ? '#991B1B' : (c.value === 'green' ? '#065F46' : (c.value === 'blue' ? '#1E40AF' : (c.value === 'amber' ? '#92400E' : (c.value === 'purple' ? '#6B21A8' : (c.value === 'teal' ? '#0F766E' : (c.value === 'rose' ? '#9F1239' : '#3730A3'))))))
                                                    }}
                                                >
                                                    {c.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <Button 
                                        onClick={handleCreateTagDefinition}
                                        className="w-full h-10 rounded-xl font-black text-xs gap-2 mt-2 shadow-sm"
                                    >
                                        <PlusCircleIcon className="w-4 h-4" />
                                        تأكيد إنشاء وحفظ البطاقة
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Button 
                                    onClick={() => setIsTagManagerOpen(false)}
                                    className="h-11 px-8 rounded-xl font-black text-xs"
                                >
                                    موافق وحفظ التغييرات
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Sub-Components ---

const StatusCard: React.FC<{ label: string; value: React.ReactNode; icon: React.ReactElement }> = ({ label, value, icon }) => (
    <div className="bg-white dark:bg-dm-card p-5 rounded-[1.75rem] shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 group hover:shadow-md transition-shadow">
        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-primary/5 transition-colors">
            {React.cloneElement(icon as any, { className: "w-5 h-5" })}
        </div>
        <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <div className="text-xs font-black text-slate-900 dark:text-white truncate">{value}</div>
        </div>
    </div>
);

const PartyInfo: React.FC<{ label: string; name: string; role: string | string[] | undefined; isPrimary?: boolean; icon?: React.ReactNode }> = ({ label, name, role, isPrimary, icon }) => {
    const roles = Array.isArray(role) ? role : (role ? [role] : []);
    
    return (
        <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl h-10 w-10 flex items-center justify-center shrink-0 ${isPrimary ? 'bg-primary/10 text-primary' : 'bg-slate-50 dark:bg-slate-800 text-slate-400'}`}>
                {icon || <BuildingLibraryIcon className="w-5 h-5" />}
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                <p className="text-xs font-black text-slate-900 dark:text-white mb-0.5">{name}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                    {roles.length > 0 ? (
                        roles.map((r, i) => {
                            const isPlaintiff = ['مدعي', 'طالب', 'شاكي', 'طالب تنفيذ', 'طاعن', 'مستأنف', 'طالب أمر', 'دائن', 'مستفيد'].includes(r);
                            const isDefendant = ['مدعى عليه', 'مطلوب ضده', 'مشكو في حقه', 'منفذ ضده', 'متهم', 'مستأنف ضده', 'مطعون ضده', 'مدين'].includes(r);
                            
                            let badgeClass = "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-100 dark:border-slate-800/50";
                            if (isPrimary) {
                                if (isPlaintiff) {
                                    badgeClass = "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20";
                                } else if (isDefendant) {
                                    badgeClass = "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/20";
                                } else {
                                    badgeClass = "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border border-indigo-100/50 dark:border-indigo-900/20";
                                }
                            } else {
                                if (isDefendant) {
                                    badgeClass = "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100/30 dark:border-rose-900/20";
                                } else if (isPlaintiff) {
                                    badgeClass = "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-400 border border-sky-100/30 dark:border-sky-900/20";
                                } else {
                                    badgeClass = "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-100 dark:border-slate-700/50";
                                }
                            }

                            return (
                                <span 
                                    key={i} 
                                    className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold tracking-tight leading-none ${badgeClass}`}
                                >
                                    {r}
                                </span>
                            );
                        })
                    ) : (
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                            {isPrimary ? 'مدعي' : 'مدعى عليه'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Content Components ---

const DetailsTab: React.FC<{ caseItem: Case }> = ({ caseItem }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-6">
            <Card className="p-8 rounded-[2.5rem] border-none shadow-sm dark:bg-dm-card">
                <div className="flex items-center gap-3 mb-8">
                    <DocumentTextIcon className="w-6 h-6 text-primary" />
                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">وصف القضية والوقائع</h2>
                </div>
                <div className="prose prose-slate dark:prose-invert max-w-none">
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic">
                        {caseItem.description || 'لا يوجد وصف مفصل للقضية متوفر حالياً.'}
                    </p>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-8 rounded-[2.5rem] border-none shadow-sm dark:bg-dm-card">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">بيانات القيد</h3>
                    <div className="space-y-5">
                        <DataRow label="تاريخ رفع الدعوى" value={caseItem.filingDate} />
                        <DataRow label="الدائرة" value={caseItem.circuit || 'غير محددة'} />
                        <DataRow label="اسم القاضي" value={caseItem.judgeName || 'غير محدد'} />
                        <DataRow label="رقم الآلي" value={caseItem.caseNumber} />
                    </div>
                </Card>
                <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-primary/5 dark:bg-primary/10">
                    <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6">المستندات القانونية</h3>
                    <div className="space-y-5">
                        <DataRow label="رقم التوكيل" value={caseItem.poaNumbers?.join(', ') || 'لم يسجل'} />
                        <DataRow label="مدة التقادم" value={caseItem.statuteOfLimitationsDate || 'غير محددة'} />
                        <DataRow label="حالة الإعلان" value={caseItem.notificationStatus || 'غير معروفة'} />
                    </div>
                </Card>
            </div>
        </div>
    );
};

const DataRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-1 border-b border-slate-50 dark:border-slate-800 last:border-0 pb-3">
        <span className="text-[11px] font-bold text-slate-400">{label}</span>
        <span className="text-xs font-black text-slate-900 dark:text-white">{value}</span>
    </div>
);

const HearingsTab: React.FC<{ hearings: Hearing[] }> = ({ hearings }) => (
    <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white dark:bg-dm-card">
        <div className="flex justify-between items-center mb-10">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 italic">
                <GavelIcon className="w-6 h-6 text-amber-500" />
                رول الجلسات والقرارات
            </h2>
            <Button size="sm" variant="outline" className="rounded-xl font-black gap-2 h-10">
                <PlusCircleIcon className="w-4 h-4" />
                إضافة جلسة
            </Button>
        </div>

        <div className="space-y-4">
            {hearings.length > 0 ? (
                hearings.map((h, i) => (
                    <div key={h.id} className="relative pr-8 border-r-2 border-slate-100 dark:border-slate-800 pb-10 last:pb-4 group">
                        <div className="absolute right-[-9px] top-0 w-4 h-4 rounded-full bg-white dark:bg-dm-card border-2 border-primary group-hover:scale-125 transition-transform" />
                        <div className="bg-slate-50 dark:bg-dm-background p-6 rounded-3xl group-hover:bg-white dark:group-hover:bg-dm-card transition-all group-hover:shadow-md border border-transparent group-hover:border-slate-100 dark:group-hover:border-slate-800">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded-lg mb-2 inline-block">
                                        {h.type}
                                    </span>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{new Date(h.date).toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter ${
                                    h.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                    {h.status === 'Completed' ? 'منتهية' : 'مجدولة'}
                                </span>
                            </div>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                                {h.notes || 'لم يتم تسجيل ملخص لهذه الجلسة.'}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-20 opacity-30">
                    <GavelIcon className="w-20 h-20 mx-auto mb-4 text-slate-300" />
                    <p className="text-sm font-black">لا توجد جلسات مجدولة لهذه القضية</p>
                </div>
            )}
        </div>
    </Card>
);

const ExpertsTab: React.FC<{ expertActions: ExpertAction[] }> = ({ expertActions }) => (
    <Card className="p-8 rounded-[2.5rem] border-none shadow-sm dark:bg-dm-card">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 italic">
                <BriefcaseIcon className="w-6 h-6 text-indigo-500" />
                إدارة الخبراء
            </h2>
            <Button size="sm" className="rounded-xl font-black h-10">ندب خبير جديد</Button>
        </div>
        <div className="space-y-4">
            {expertActions.length > 0 ? (
                expertActions.map((ex) => (
                    <div key={ex.id} className="p-6 bg-slate-50 dark:bg-dm-background rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-1">{ex.expertName || 'بانتظار الندب'}</h4>
                                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-lg">{ex.expertField}</span>
                            </div>
                            <ExpertActionStatusBadge status={ex.status} />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-[11px] font-bold text-slate-500">
                            <div className="flex flex-col gap-1 italic border-l pr-4">
                                <span className="text-slate-400 font-black">المهمة الموكلة</span>
                                {ex.assignedTask}
                            </div>
                            <div className="flex flex-col gap-2">
                                <p>تاريخ الإحالة: <span className="text-slate-900 dark:text-white">{ex.referralDate}</span></p>
                                <p>الإيداع: <span className="text-slate-900 dark:text-white">{ex.reportSubmissionDate || 'قيد البحث'}</span></p>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/20 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                    <BriefcaseIcon className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                    <p className="text-xs font-black text-slate-400">القضية لم تُحل لإدارة الخبراء بعد</p>
                </div>
            )}
        </div>
    </Card>
);

const ExecutionTab: React.FC<{ executionActions: ExecutionAction[] }> = ({ executionActions }) => (
    <Card className="p-8 rounded-[2.5rem] border-none shadow-sm dark:bg-dm-card">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 italic mb-8">
            <ClockIcon className="w-6 h-6 text-rose-500" />
            إجراءات التنفيذ
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {executionActions.map((ex) => (
                <div key={ex.id} className="p-6 bg-slate-50 dark:bg-dm-background rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-rose-200 transition-colors">
                    <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{ex.actionType}</span>
                        <ExecutionActionStatusBadge status={ex.status} />
                    </div>
                    <div className="space-y-3 mb-4">
                        <div className="flex justify-between items-center text-[11px] font-bold italic">
                            <span className="text-slate-400">تاريخ التقديم</span>
                            <span className="text-slate-900 dark:text-white">{ex.applicationDate}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] font-bold italic">
                            <span className="text-slate-400">قيمة المديونية</span>
                            <span className="text-slate-900 dark:text-white">{ex.amountInvolved || 0} د.ك</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl h-10 font-black text-[10px]">تحديث الحالة</Button>
                        <Button variant="outline" size="sm" className="w-10 rounded-xl h-10 p-0 shadow-sm">
                            <EyeIcon className="w-4 h-4 text-slate-400" />
                        </Button>
                    </div>
                </div>
            ))}
            <button className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] text-slate-300 hover:text-rose-500 hover:border-rose-100 transition-all">
                <PlusCircleIcon className="w-12 h-12 mb-2" />
                <span className="font-black text-xs">إضافة إجراء تنفيذي</span>
            </button>
        </div>
    </Card>
);

const FinancialsTab: React.FC<{ financials?: Case['financials'] }> = ({ financials }) => (
    <div className="space-y-6">
        <Card className="p-10 rounded-[3rem] border-none shadow-sm dark:bg-dm-card bg-slate-900 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">إجمالي الأتعاب الاتفاقية</p>
                    <p className="text-3xl font-black text-white italic">{financials?.totalFees || 0} <span className="text-xs">د.ك</span></p>
                </div>
                <div className="text-center border-x border-white/5">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 italic">إجمالي المحصل</p>
                    <p className="text-3xl font-black text-white italic">{financials?.paid || 0} <span className="text-xs">د.ك</span></p>
                </div>
                <div className="text-center">
                    <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 italic">الرصيد المتبقي</p>
                    <p className="text-3xl font-black text-white italic">{financials?.remaining || 0} <span className="text-xs">د.ك</span></p>
                </div>
            </div>
            <div className="mt-10 h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-primary" 
                    style={{ width: `${((financials?.paid || 0) / (financials?.totalFees || 1)) * 100}%` }} 
                />
            </div>
        </Card>

        <Card className="p-8 rounded-[2.5rem] border-none shadow-sm dark:bg-dm-card">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-[13px] font-black text-slate-900 dark:text-white italic">سجل المصروفات القضائية والرسوم</h3>
                <Button variant="outline" size="sm" className="rounded-xl h-10 font-black">إضافة سند صرف</Button>
            </div>
            <div className="space-y-4">
                {financials?.expenses?.map((exp) => (
                    <div key={exp.id} className="flex justify-between items-center p-5 bg-slate-50 dark:bg-dm-background rounded-2xl border border-slate-100 dark:border-slate-800 group hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-400 group-hover:text-primary transition-colors">
                                <BanknotesIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-800 dark:text-white">{exp.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">مصاريف قضائية</p>
                            </div>
                        </div>
                        <span className="text-sm font-black text-slate-900 dark:text-white italic">{exp.amount} <span className="text-[10px]">د.ك</span></span>
                    </div>
                )) || (
                    <div className="text-center py-10 opacity-20 italic font-black text-sm">لا توجد مصروفات مسجلة</div>
                )}
            </div>
        </Card>
    </div>
);

const ArchiveTab: React.FC<{ caseItem: Case; onUpdateCase: (updated: Case) => void }> = ({ caseItem, onUpdateCase }) => {
    const { addToast } = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedImportance, setSelectedImportance] = useState<string>('all');
    const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
    
    // For editing a file's tags and importance
    const [editingFileId, setEditingFileId] = useState<string | null>(null);
    const [fileImportance, setFileImportance] = useState<'critical' | 'high' | 'medium' | 'low' | undefined>(undefined);
    const [fileTags, setFileTags] = useState<string[]>([]);

    const customTags = caseItem.customTags || DEFAULT_TAGS;
    const files = caseItem.caseFiles || [];

    // Filtered Files
    const filteredFiles = files.filter(file => {
        const matchesSearch = file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (file.fileType || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                             (file.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesImportance = selectedImportance === 'all' || file.importance === selectedImportance;
        const matchesTag = selectedTagFilter === 'all' || (file.tags || []).includes(selectedTagFilter);
        return matchesSearch && matchesImportance && matchesTag;
    });

    // Handle saving file tag/importance edits
    const handleSaveFileEdits = (fileId: string) => {
        const updatedFiles = files.map(f => {
            if (f.id === fileId) {
                return {
                    ...f,
                    importance: fileImportance,
                    tags: fileTags
                };
            }
            return f;
        });

        onUpdateCase({
            ...caseItem,
            caseFiles: updatedFiles
        });
        
        setEditingFileId(null);
        addToast({
            type: 'success',
            title: 'تم التحديث',
            message: 'تم تحديث تصنيف المستند بنجاح 🏷️'
        });
    };

    // Open editor for a file
    const startEditingFile = (file: CaseFile) => {
        setEditingFileId(file.id);
        setFileImportance(file.importance);
        setFileTags(file.tags || []);
    };

    // Toggle tag on a file
    const toggleTagOnFile = (tagId: string) => {
        setFileTags(prev => 
            prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
        );
    };

    // Add a new file mockup
    const handleAddFile = () => {
        const nameInput = prompt('أدخل اسم المستند الجديد:');
        if (!nameInput) return;
        const typeInput = prompt('أدخل نوع المستند (مثال: عقد، مذكرة، دليل، توكيل):') || 'مستند قانوني';
        
        const newFile: CaseFile = {
            id: `file-${Date.now()}`,
            fileName: nameInput.endsWith('.pdf') ? nameInput : `${nameInput}.pdf`,
            fileType: typeInput,
            uploadedAt: new Date().toISOString().split('T')[0],
            tags: [],
            importance: 'medium'
        };

        onUpdateCase({
            ...caseItem,
            caseFiles: [newFile, ...files]
        });

        addToast({
            type: 'success',
            title: 'تمت الإضافة',
            message: 'تمت إضافة المستند الجديد للأرشيف بنجاح 📄'
        });
    };

    // Delete a file
    const handleDeleteFile = (fileId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا المستند؟')) return;
        
        onUpdateCase({
            ...caseItem,
            caseFiles: files.filter(f => f.id !== fileId)
        });

        addToast({
            type: 'success',
            title: 'تم الحذف',
            message: 'تم حذف المستند بنجاح من أرشيف القضية'
        });
    };

    // Importance levels definition
    const IMPORTANCE_LEVELS = [
        { value: 'critical', label: 'حرج للغاية 🚨', colorClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30' },
        { value: 'high', label: 'أهمية عالية 🟠', colorClass: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/30' },
        { value: 'medium', label: 'أهمية متوسطة 🟡', colorClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30' },
        { value: 'low', label: 'أهمية منخفضة 🔵', colorClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/30' }
    ];

    return (
        <Card className="p-8 rounded-[2.5rem] border-none shadow-sm dark:bg-dm-card space-y-6 text-right">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <Button size="sm" onClick={handleAddFile} className="rounded-xl font-black h-10 gap-2 shrink-0 md:order-2">
                    <PlusCircleIcon className="w-4 h-4" />
                    رفع مستند جديد
                </Button>
                <div className="md:order-1">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 italic">
                        <FolderIcon className="w-6 h-6 text-primary" />
                        أرشيف الملفات والمستندات المصنفة
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">تصفح، فلتر، وصنّف مستندات القضية بناءً على الأهمية والبطاقات التعريفية</p>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-slate-800">
                {/* Search */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">البحث بالاسم والنوع</label>
                    <input 
                        type="text"
                        placeholder="ابحث عن مستند..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-xs font-bold h-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>

                {/* Filter by Importance */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">تصفية حسب الأهمية</label>
                    <select
                        value={selectedImportance}
                        onChange={(e) => setSelectedImportance(e.target.value)}
                        className="w-full text-xs font-bold h-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">كل درجات الأهمية</option>
                        <option value="critical">🚨 حرج للغاية</option>
                        <option value="high">🟠 أهمية عالية</option>
                        <option value="medium">🟡 أهمية متوسطة</option>
                        <option value="low">🔵 أهمية منخفضة</option>
                    </select>
                </div>

                {/* Filter by custom tags */}
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">تصفية حسب بطاقات التصنيف</label>
                    <select
                        value={selectedTagFilter}
                        onChange={(e) => setSelectedTagFilter(e.target.value)}
                        className="w-full text-xs font-bold h-10 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 text-right focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                        <option value="all">كل البطاقات والتصنيفات</option>
                        {customTags.map(tag => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Active Filters Display */}
            {(selectedImportance !== 'all' || selectedTagFilter !== 'all' || searchQuery !== '') && (
                <div className="flex flex-wrap gap-2 items-center text-xs text-slate-500 justify-start">
                    <span>الفلاتر النشطة:</span>
                    {searchQuery && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            بحث: "{searchQuery}"
                            <button onClick={() => setSearchQuery('')} className="hover:text-red-500">✕</button>
                        </span>
                    )}
                    {selectedImportance !== 'all' && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            أهمية: {IMPORTANCE_LEVELS.find(x => x.value === selectedImportance)?.label}
                            <button onClick={() => setSelectedImportance('all')} className="hover:text-red-500">✕</button>
                        </span>
                    )}
                    {selectedTagFilter !== 'all' && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                            تصنيف: {customTags.find(x => x.id === selectedTagFilter)?.name}
                            <button onClick={() => setSelectedTagFilter('all')} className="hover:text-red-500">✕</button>
                        </span>
                    )}
                    <button 
                        onClick={() => { setSearchQuery(''); setSelectedImportance('all'); setSelectedTagFilter('all'); }} 
                        className="text-primary hover:underline text-[10px] font-bold mr-2"
                    >
                        تصفير الكل
                    </button>
                </div>
            )}

            {/* Documents Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFiles.length > 0 ? (
                    filteredFiles.map((file) => {
                        const fileImportanceObj = IMPORTANCE_LEVELS.find(x => x.value === file.importance);
                        const isEditing = editingFileId === file.id;

                        return (
                            <div 
                                key={file.id} 
                                className={`p-6 rounded-[2rem] border transition-all flex flex-col justify-between text-right ${
                                    isEditing 
                                    ? 'bg-primary/5 border-primary shadow-xl ring-2 ring-primary/10 scale-[1.02]' 
                                    : 'bg-slate-50 dark:bg-dm-background border-slate-100 dark:border-slate-800 hover:shadow-xl hover:border-primary/20'
                                }`}
                            >
                                <div>
                                    {/* Document Header with Badges */}
                                    <div className="flex justify-between items-start gap-2 mb-4">
                                        <div className="flex flex-wrap gap-1">
                                            {/* Importance Badge */}
                                            {fileImportanceObj && (
                                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black border ${fileImportanceObj.colorClass}`}>
                                                    {fileImportanceObj.label}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-slate-400 shrink-0">
                                            <DocumentTextIcon className="w-6 h-6" />
                                        </div>
                                    </div>

                                    {/* Title and date */}
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate mb-1" title={file.fileName}>
                                        {file.fileName}
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 lowercase italic mb-3">
                                        {file.fileType} • {file.uploadedAt}
                                    </p>

                                    {/* Associated tags */}
                                    <div className="flex flex-wrap gap-1 mb-4 min-h-[22px] justify-end">
                                        {(file.tags || []).map(tagId => {
                                            const t = customTags.find(x => x.id === tagId);
                                            if (!t) return null;
                                            return (
                                                <span key={tagId} className={getTagColorClasses(t.color)}>
                                                    <TagIcon className="w-2.5 h-2.5" />
                                                    {t.name}
                                                </span>
                                            );
                                        })}
                                        {(file.tags || []).length === 0 && (
                                            <span className="text-[9px] text-slate-300 dark:text-slate-600 italic">بدون بطاقات تصنيف</span>
                                        )}
                                    </div>
                                </div>

                                {/* Custom Inline Editor Panel */}
                                {isEditing ? (
                                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-inner animate-in slide-in-from-bottom-2 duration-150">
                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 block">مستوى الأهمية القضائية</label>
                                            <div className="grid grid-cols-2 gap-1">
                                                {IMPORTANCE_LEVELS.map(level => (
                                                    <button
                                                        key={level.value}
                                                        onClick={() => setFileImportance(level.value as any)}
                                                        className={`px-2 py-1 rounded-lg text-[9px] font-black border text-center transition-all ${
                                                            fileImportance === level.value 
                                                            ? 'border-primary bg-primary/5 text-primary' 
                                                            : 'border-slate-100 dark:border-slate-700 text-slate-500'
                                                        }`}
                                                    >
                                                        {level.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-slate-400 block">البطاقات الملونة المرتبطة</label>
                                            <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto p-1 border border-slate-100 dark:border-slate-700 rounded-lg justify-end">
                                                {customTags.map(tag => {
                                                    const isSelected = fileTags.includes(tag.id);
                                                    return (
                                                        <button
                                                            key={tag.id}
                                                            onClick={() => toggleTagOnFile(tag.id)}
                                                            className={`px-2 py-0.5 rounded-md text-[9px] font-bold border transition-all ${
                                                                isSelected 
                                                                ? 'border-slate-900 bg-slate-100 dark:border-white dark:bg-slate-750 text-slate-900 dark:text-white font-black' 
                                                                : 'opacity-50 hover:opacity-100 border-transparent bg-slate-50 dark:bg-slate-900'
                                                            }`}
                                                        >
                                                            {tag.name}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button 
                                                size="sm" 
                                                onClick={() => handleSaveFileEdits(file.id)}
                                                className="flex-1 rounded-xl h-8 text-[10px] font-black"
                                            >
                                                حفظ
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline" 
                                                onClick={() => setEditingFileId(null)}
                                                className="flex-1 rounded-xl h-8 text-[10px] border-slate-200"
                                            >
                                                إلغاء
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Normal Action Buttons */
                                    <div className="space-y-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => startEditingFile(file)}
                                                className="flex-1 text-[10px] font-black text-primary hover:text-primary-dark bg-primary/5 hover:bg-primary/10 border border-primary/10 h-9 rounded-xl flex items-center justify-center gap-1.5 transition-all"
                                            >
                                                <PencilIcon className="w-3.5 h-3.5" />
                                                تصنيف وتعديل المستند
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="outline" size="sm" className="flex-1 rounded-xl h-8 text-[10px]">تحميل</Button>
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                onClick={() => handleDeleteFile(file.id)}
                                                className="flex-1 rounded-xl h-8 text-[10px] text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-slate-200"
                                            >
                                                حذف
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-20 bg-slate-50 dark:bg-slate-800/10 rounded-[3rem] border-4 border-dashed border-slate-100 dark:border-slate-800">
                        <FolderIcon className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                        <p className="text-sm font-black text-slate-400">لا توجد مستندات تطابق شروط الفلترة المحددة</p>
                        <button 
                            onClick={() => { setSearchQuery(''); setSelectedImportance('all'); setSelectedTagFilter('all'); }} 
                            className="text-xs text-primary font-black mt-2 underline"
                        >
                            تصفير الفلاتر والبحث
                        </button>
                    </div>
                )}
            </div>
        </Card>
    );
};

const AiAnalysisTab: React.FC<{ summary: string | null; onGenerate: () => void; isLoading: boolean }> = ({ summary, onGenerate, isLoading }) => (
    <Card className="p-10 rounded-[3rem] border-none shadow-sm bg-gradient-to-br from-indigo-600 to-indigo-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
        <div className="relative z-10 text-center">
            {!summary ? (
                <div className="space-y-6 max-w-xl mx-auto py-10">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-pulse">
                        <SparklesIcon className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-black italic tracking-tighter">التحليل الاستراتيجي المدعوم بالذكاء الاصطناعي</h2>
                    <p className="text-sm font-medium text-slate-300 leading-loose">
                        سيقوم المساعد الذكي بتحليل كافة بيانات القضية والجلسات وقرارات الخبراء لتقديم ملخص استراتيجي شامل يساعد في اتخاذ القرار وتوقع النتائج.
                    </p>
                    <Button 
                        onClick={onGenerate} 
                        disabled={isLoading} 
                        className="bg-white text-indigo-900 hover:bg-slate-50 h-14 rounded-2xl px-12 font-black shadow-2xl text-base"
                    >
                        {isLoading ? 'قيد التحليل...' : 'ابدأ التحليل الآن'}
                    </Button>
                </div>
            ) : (
                <div className="text-right space-y-6 animate-in fade-in duration-700">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                        <h2 className="text-xl font-black italic flex items-center gap-3">
                            <SparklesIcon className="w-6 h-6 text-primary" />
                            تقرير التحليل الذكي للقضية
                        </h2>
                        <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white h-10 rounded-xl font-black" onClick={onGenerate}>إعادة التحليل</Button>
                    </div>
                    <div className="bg-white/5 p-8 rounded-[2.5rem] mt-6 leading-loose text-sm font-bold border border-white/10 italic prose-invert prose-p:mb-4">
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </div>
                </div>
            )}
        </div>
    </Card>
);

// --- Simple Missing Icons (Mocked or Reused) ---
const UserTieIcon = BriefcaseIcon; 

const EnvelopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const EmailsTab: React.FC<{ caseItem: Case }> = ({ caseItem }) => {
    const { addToast } = useToast();
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('hearing_update');
    const [subject, setSubject] = useState<string>('');
    const [body, setBody] = useState<string>('');
    const [clientEmail, setClientEmail] = useState<string>('client.contact@qanooni.com');
    const [isSending, setIsSending] = useState<boolean>(false);
    const [sentEmails, setSentEmails] = useState<{ id: string; templateName: string; subject: string; sentAt: string; status: string }[]>([]);

    const EMAIL_TEMPLATES = [
        {
            id: 'hearing_update',
            name: 'تحديث الجلسة وتحديد الجلسة المقبلة 📅',
            subject: 'تحديث عاجل: مجريات القضية رقم {fileNumber} - {title}',
            body: `عزيزي العميل المحترم {clientName}،

تحية طيبة وبعد،

نود إفادتكم علماً بآخر التطورات في قضيتكم الموقرة المقيدة برقم ملف {fileNumber} وبقضية رقم {caseNumber} ضد {opposingPartyName} المنظورة أمام {courtName} ({courtLevel}) - الدائرة {circuit}.

تم عقد الجلسة الأخيرة وتحديد تاريخ الجلسة القادمة ليكون في {nextHearingDate}. نحن نعمل حالياً على إعداد كافة الدفوع والمذكرات القانونية اللازمة لتقديمها أمام عدالة المحكمة لضمان تحقيق أفضل النتائج.

إذا كان لديكم أي استفسار، يرجى عدم التردد في التواصل معنا.

مع وافر الاحترام والتقدير،
مكتب المحاماة والاستشارات القانونية
المحامي المسؤول: {assignedLawyer}`
        },
        {
            id: 'request_documents',
            name: 'طلب تزويدنا بمستندات وأدلة إضافية هامة 📄',
            subject: 'طلب مستندات هامة لاستكمال استراتيجية الدفاع - قضية {title}',
            body: `عزيزي العميل المحترم {clientName}،

تحية طيبة وبعد،

بناءً على المراجعة الدقيقة لملف القضية رقم {fileNumber} ومستنداتها المودعة، وإعداداً للمرافعات القادمة ضد {opposingPartyName}، يرجى تزويدنا بالمستندات التالية في أقرب وقت ممكن:
1. [يرجى كتابة المستند المطلوب الأول]
2. [يرجى كتابة المستند المطلوب الثاني]

تأخر تزويدنا بهذه المستندات قد يؤثر على الجدول الزمني لإعداد المذكرة القانونية المزمع تقديمها أمام {courtName} في الجلسة المقبلة المحددة بتاريخ {nextHearingDate}.

نشكر لكم تعاونكم الدائم والمستمر معنا.

وتقبلوا منا خالص التقدير،
المحامي المسؤول: {assignedLawyer}`
        },
        {
            id: 'payment_reminder',
            name: 'إشعار سداد الدفعة المالية (الأتعاب) 💰',
            subject: 'إشعار استحقاق مالي وأتعاب قانونية - ملف رقم {fileNumber}',
            body: `عزيزي العميل المحترم {clientName}،

تحية طيبة وبعد،

نأمل أن تكونوا بخير وعافية. نود إخطاركم بأنه قد استحق سداد الدفعة المالية (الأتعاب القانونية) المتفق عليها بموجب عقد التمثيل القانوني الخاص بقضيتكم رقم {fileNumber} المرفوعة أمام {courtName}.

المبلغ المستحق السداد حالياً: {amount} {currency}

يرجى التكرم بسداد المبلغ المذكور لتجنب أي تأخير في اتخاذ الإجراءات القضائية أو تقديم الطلبات اللازمة أمام خبراء وزارة العدل والمحاكم.

شاكرين لكم حسن تعاونكم وتفهمكم.

مع خالص التقدير،
القسم المالي - المحامي المسؤول: {assignedLawyer}`
        },
        {
            id: 'poa_request',
            name: 'طلب إصدار أو تصديق توكيل قضائي جديد ⚖️',
            subject: 'طلب عاجل: إصدار توكيل قضائي رسمي لصالح المكتب - ملف {fileNumber}',
            body: `عزيزي العميل المحترم {clientName}،

تحية طيبة وبعد،

تمهيداً للمباشرة الفعالة في تمثيلكم قانونياً وإقامة الدعاوى القضائية باسمكم للدفاع عن حقوقكم في موضوع {title} ضد {opposingPartyName} أمام {courtName}.

يرجى التكرم بزيارة إدارة التوثيقات بوزارة العدل أو استخدام تطبيق (سهل) لإصدار "توكيل رسمي خاص بالقضايا والمحاكم" لصالح مكتبنا.

اسم الوكيل المعتمد للإصدار:
- {assignedLawyer} (أو من يفوضه المكتب من السادة المحامين)

نرجو تزويدنا بنسخة من التوكيل فور صدوره لنتمكن من إيداعه في ملف الدعوى رسمياً.

وتقبلوا منا خالص التقدير والاحترام،
مكتب المحاماة والاستشارات القانونية`
        },
        {
            id: 'expert_session',
            name: 'إخطار بموعد جلسة إدارة الخبراء 🏛️',
            subject: 'إشعار هام: موعد جلسة إدارة الخبراء بوزارة العدل - ملف {fileNumber}',
            body: `عزيزي العميل المحترم {clientName}،

تحية طيبة وبعد،

نحيطكم علماً بأن إدارة الخبراء بوزارة العدل قد حددت موعداً لمناقشة الجوانب الفنية والمالية في القضية رقم {caseNumber} المنظورة أمام {courtName}.

تفاصيل الجلسة:
- التاريخ والوقت: الجلسة القادمة بتاريخ {nextHearingDate}
- المكان: مقر إدارة الخبراء

نظراً للأهمية البالغة لهذه الجلسة في تحديد الموقف المالي والفني للنزاع، يرجى التكرم بالحضور برفقة المستشار القانوني المتابع للملف لتفنيد ادعاءات الخصم {opposingPartyName}.

شاكرين ومقدرين كريم تعاونكم،
المحامي المسؤول: {assignedLawyer}`
        },
        {
            id: 'defense_memo_ready',
            name: 'مسودة مذكرة الدفاع جاهزة للمراجعة 📝',
            subject: 'جاهزية مسودة المذكرة القانونية للمراجعة والتوقيع - ملف {fileNumber}',
            body: `عزيزي العميل المحترم {clientName}،

تحية طيبة وبعد،

يسرنا إبلاغكم بأن الفريق القانوني بمكتبنا قد انتهى من صياغة وإعداد "مسودة مذكرة الدفاع الختامية" في القضية رقم {caseNumber} المرفوعة ضد {opposingPartyName} المنظورة أمام {courtName} - الدائرة {circuit}.

يرجى التفضل بزيارة مكتبنا خلال الـ 48 ساعة القادمة لمراجعة بنود المذكرة واعتمادها بالتوقيع قبل تقديمها لعدالة المحكمة في الجلسة المقبلة بتاريخ {nextHearingDate}.

إذا رغبتم في مراجعتها عبر البريد الإلكتروني أولاً، يرجى إخطارنا بذلك.

وتقبلوا منا خالص التقدير،
المكتب القانوني - المحامي المسؤول: {assignedLawyer}`
        }
    ];

    const PLACEHOLDERS = [
        { label: '👤 اسم العميل', value: '{clientName}' },
        { label: '📂 رقم الملف', value: '{fileNumber}' },
        { label: '⚖️ رقم القضية', value: '{caseNumber}' },
        { label: '👥 الخصم', value: '{opposingPartyName}' },
        { label: '🏛️ المحكمة', value: '{courtName}' },
        { label: '📊 درجة التقاضي', value: '{courtLevel}' },
        { label: '🎪 الدائرة', value: '{circuit}' },
        { label: '📅 الجلسة القادمة', value: '{nextHearingDate}' },
        { label: '💰 المبلغ', value: '{amount}' },
        { label: '💵 العملة', value: '{currency}' },
        { label: '👔 المحامي', value: '{assignedLawyer}' }
    ];

    const fillTemplate = (text: string) => {
        return text
            .replace(/{clientName}/g, caseItem.clientName || 'العميل الكريم')
            .replace(/{title}/g, caseItem.title || '')
            .replace(/{fileNumber}/g, caseItem.fileNumber || caseItem.id || '')
            .replace(/{caseNumber}/g, caseItem.caseNumber || 'غير محدد')
            .replace(/{opposingPartyName}/g, caseItem.opposingPartyName || 'الطرف الآخر')
            .replace(/{courtName}/g, caseItem.courtName || 'المحكمة الموقرة')
            .replace(/{courtLevel}/g, caseItem.courtLevel || 'غير محدد')
            .replace(/{circuit}/g, caseItem.circuit || 'غير محدد')
            .replace(/{nextHearingDate}/g, caseItem.nextHearingDate || 'الجلسة القادمة')
            .replace(/{assignedLawyer}/g, caseItem.assignedLawyer || 'مستشارنا القانوني')
            .replace(/{amount}/g, caseItem.financials?.totalFees ? (caseItem.financials.totalFees - (caseItem.financials.paid || 0)).toString() : '500')
            .replace(/{currency}/g, caseItem.financials?.currency || 'د.ك');
    };

    // Load template when selectedTemplateId or caseItem changes
    useEffect(() => {
        const found = EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId);
        if (found) {
            setSubject(fillTemplate(found.subject));
            setBody(fillTemplate(found.body));
        }
    }, [selectedTemplateId, caseItem]);

    // Load sent emails history
    useEffect(() => {
        const stored = localStorage.getItem(`sent_emails_${caseItem.id}`);
        if (stored) {
            try {
                setSentEmails(JSON.parse(stored));
            } catch (e) {
                console.error(e);
            }
        }
    }, [caseItem.id]);

    const handleSendEmail = () => {
        if (!subject.trim() || !body.trim() || !clientEmail.trim()) {
            addToast({ type: 'error', title: 'خطأ', message: 'يرجى ملء جميع الحقول المطلوبة' });
            return;
        }

        setIsSending(true);
        setTimeout(() => {
            const newEmail = {
                id: `mail-${Date.now()}`,
                templateName: EMAIL_TEMPLATES.find(t => t.id === selectedTemplateId)?.name || 'قالب مخصص',
                subject,
                sentAt: new Date().toLocaleString('ar-EG', { hour12: true }),
                status: 'تم الإرسال بنجاح 🟢'
            };

            const updated = [newEmail, ...sentEmails];
            setSentEmails(updated);
            localStorage.setItem(`sent_emails_${caseItem.id}`, JSON.stringify(updated));
            setIsSending(false);
            addToast({ type: 'success', title: 'تم الإرسال', message: 'تم إرسال البريد الإلكتروني القانوني للعميل بنجاح' });
        }, 1200);
    };

    const handleCopyText = () => {
        navigator.clipboard.writeText(`الموضوع: ${subject}\n\n${body}`);
        addToast({ type: 'success', title: 'تم النسخ', message: 'تم نسخ محتوى البريد الإلكتروني للحافظة' });
    };

    const handleInsertPlaceholder = (val: string) => {
        setBody(prev => prev + ' ' + val);
        addToast({ type: 'success', title: 'تم الإدراج', message: `تمت إضافة المتغير ${val} في نهاية نص الرسالة` });
    };

    return (
        <Card className="p-8 rounded-[2.5rem] border-none shadow-sm dark:bg-dm-card">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 italic">
                    <EnvelopeIcon className="w-6 h-6 text-primary" />
                    المراسلات والقوالب القانونية التلقائية
                </h2>
                <div className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full font-black border border-emerald-500/20">
                    مزامنة حية لبيانات القضية ⚡
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Editor Section */}
                <div className="space-y-6 text-right">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 block">اختر قالب المراسلة القانونية</label>
                        <select
                            value={selectedTemplateId}
                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                            className="w-full text-xs font-black h-12 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 dark:text-slate-100 text-right"
                        >
                            {EMAIL_TEMPLATES.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 block">بريد العميل المستهدف</label>
                        <input
                            type="email"
                            value={clientEmail}
                            onChange={(e) => setClientEmail(e.target.value)}
                            className="w-full text-xs font-bold h-12 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 dark:text-slate-100 text-right"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 block">موضوع الرسالة</label>
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="w-full text-xs font-bold h-12 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 rounded-2xl px-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 dark:text-slate-100 text-right"
                        />
                    </div>

                    {/* Placeholder click tags */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 block">انقر لإدراج متغير تلقائي في نص الرسالة ⚡</label>
                        <div className="flex flex-wrap gap-1.5 justify-end">
                            {PLACEHOLDERS.map(p => (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => handleInsertPlaceholder(p.value)}
                                    className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 hover:bg-primary/5 hover:text-primary dark:bg-slate-800 dark:hover:bg-primary/20 border border-slate-200 dark:border-slate-750 text-slate-600 dark:text-slate-300 transition-all"
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 block">نص الرسالة القانونية (قابل للتعديل)</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            rows={12}
                            className="w-full text-xs font-bold p-4 border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 dark:text-slate-100 text-right leading-relaxed custom-scrollbar"
                        />
                    </div>

                    <div className="flex gap-4">
                        <Button
                            onClick={handleSendEmail}
                            disabled={isSending}
                            className="flex-1 h-12 rounded-2xl font-black gap-2 shadow-lg"
                        >
                            {isSending ? 'جاري إرسال البريد...' : 'إرسال البريد الآن'}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleCopyText}
                            className="h-12 px-6 rounded-2xl font-black gap-2 border-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                            نسخ النص
                        </Button>
                    </div>
                </div>

                {/* Live Preview Section */}
                <div className="space-y-6">
                    <span className="text-[11px] font-black text-slate-400 block text-right">معاينة الرسالة الرسمية (ترويسة المكتب)</span>
                    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-inner text-right relative overflow-hidden">
                        {/* Letterhead */}
                        <div className="border-b border-dashed border-slate-200 dark:border-slate-700 pb-4 mb-6 flex justify-between items-center text-xs">
                            <div className="text-slate-400 text-left">
                                <p className="font-mono text-[9px] font-bold">DATE: {new Date().toLocaleDateString('en-US')}</p>
                                <p className="font-mono text-[9px] font-bold">CASE-ID: {caseItem.internalCaseNumber || 'NEW'}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-black text-slate-900 dark:text-white">مكتب عدالة للمحاماة</p>
                                <p className="text-[9px] font-bold text-slate-400 italic">مستشارون قانونيون وقضاء كويتي</p>
                            </div>
                        </div>

                        {/* Envelope details */}
                        <div className="space-y-2 mb-6 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-750 text-xs">
                            <div className="flex justify-between">
                                <span className="font-black text-slate-900 dark:text-white">{clientEmail}</span>
                                <span className="text-slate-400 font-bold">:إلى (المرسل إليه)</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-black text-slate-900 dark:text-white">{subject}</span>
                                <span className="text-slate-400 font-bold">:الموضوع</span>
                            </div>
                        </div>

                        {/* Letter Body */}
                        <div className="text-xs font-bold leading-relaxed text-slate-700 dark:text-slate-300 min-h-[220px] whitespace-pre-wrap break-words px-2 bg-white dark:bg-slate-800/40 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                            {body ? fillTemplate(body) : 'يرجى تحديد أو صياغة نص الرسالة للمعاينة.'}
                        </div>

                        {/* Signature Seal */}
                        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end text-[10px]">
                            <div className="text-left">
                                <span className="inline-block border-2 border-emerald-500/30 text-emerald-600 bg-emerald-500/5 px-3 py-1 rounded-full font-black tracking-tight transform -rotate-3 text-[9px]">
                                    معتمد إلكترونياً • APPROVED
                                </span>
                            </div>
                            <div className="text-right text-slate-400">
                                <p className="font-bold">المحامي المسؤول</p>
                                <p className="font-black text-slate-800 dark:text-slate-200 mt-1">{caseItem.assignedLawyer || 'مستشار قانوني'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sent Emails History Logs */}
            {sentEmails.length > 0 && (
                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-right">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">سجل المراسلات الصادرة لهذه القضية</h3>
                    <div className="space-y-3">
                        {sentEmails.map((mail) => (
                            <div key={mail.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div className="text-left w-full md:w-auto">
                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl">
                                        {mail.status}
                                    </span>
                                </div>
                                <div className="text-right flex-1">
                                    <span className="text-[10px] font-black text-slate-400 block mb-0.5">{mail.sentAt} • {mail.templateName}</span>
                                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">{mail.subject}</h4>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </Card>
    );
};

interface MemosTabProps {
    caseItem: Case;
    onUpdateCase: (updated: Case) => void;
}

const MemosTab: React.FC<MemosTabProps> = ({ caseItem, onUpdateCase }) => {
    const { addToast } = useToast();
    const [memoType, setMemoType] = useState<string>('defense');
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const [customInstructions, setCustomInstructions] = useState<string>('');
    const [generatedText, setGeneratedText] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const MEMO_TYPES = [
        { id: 'defense', name: 'مذكرة دفاع ختامية ⚖️' },
        { id: 'appeal', name: 'صحيفة طعن بالاستئناف 🏛️' },
        { id: 'reply', name: 'مذكرة رد وتعقيب ختامي 📝' },
        { id: 'counterclaim', name: 'مذكرة دعوى فرعية متقابلة 🔄' }
    ];

    const files = caseItem.caseFiles || [];

    const getMergedFileReferences = () => {
        const selectedList = files.filter(f => selectedFiles.includes(f.id));
        if (selectedList.length === 0) {
            return '• (لم يتم تحديد مستندات مدمجة من ملف القضية)';
        }
        return selectedList.map((f, i) => 
            `${i + 1}. مستند رسمي: [${f.fileName}] - نوعه: [${f.fileType}] - تاريخ إيداعه بملف القضية: [${f.uploadedAt}]`
        ).join('\n');
    };

    const handleMergeTemplate = () => {
        const fileReferences = getMergedFileReferences();
        let template = '';

        if (memoType === 'defense') {
            template = `بسم الله الرحمن الرحيم

أمام محكمة: {courtName} الموقرة - الدائرة {circuit}
مقدمة للجلسة المحددة بتاريخ: {nextHearingDate}

مقدمة من الموكل: {clientName} ({clientRole})
ضد الخصم: {opposingPartyName} ({opponentRole})

في القضية رقم: {caseNumber} (رقم الملف المكتبي: {fileNumber})
موضوع الدعوى: {title}

أولاً: خلاصة الوقائع والطلبات:
تتلخص وقائع الدعوى الماثلة في أن الطرف الآخر قد أقام دعواه بمطالبة موكلنا بطلبات غير مستندة إلى واقع أو قانون سليم. وحيث أن موكلنا {clientName} يود تفنيد هذه المزاعم لعدالة المحكمة وبيان بطلانها جملة وتفصيلاً مستنداً إلى ملف القضية وأوجه الدفاع التالية.

ثانياً: المستندات المؤيدة وحافظة الأدلة المدمجة:
نود الاستناد والتمسك بالمستندات الرسمية التالية المودعة بملف الدعوى الماثل كدليل قاطع على صحة دفاعنا وبراءة ذمتنا:
{fileReferences}

ثالثاً: الدفوع والأسباب القانونية الكافية:
تأسيساً على قانون المرافعات المدنية والتجارية الكويتي:
1. ندفع بانتفاء السند التعاقدي أو التقصيري الملزم في ذمة موكلنا وبطلان كافة ادعاءات الخصم لعموميتها وخلوها من الإثبات السديد.
2. نلتمس الالتفات عن الأقوال المرسلة التي سيقت من قبل الطرف الآخر لعدم كفايتها لمواجهة الحقائق المستندية الثابتة.
${customInstructions ? `\nدفوع وملاحظات إضافية مخصصة من مستشار القضية:\n${customInstructions}` : ''}

رابعاً: الطلبات الختامية:
بناءً على ما تقدم من أسباب ودفوع، نلتمس من عدالة المحكمة القضاء بـ:
1. أصلياً: رفض الدعوى المرفوعة من الخصم بالكامل لعدم ثبوتها ومخالفتها لأحكام القانون، مع إلزام رافعها بالمصروفات ومقابل أتعاب المحاماة الفعلية.
2. احتياطياً: إحالة الدعوى لإدارة الخبراء بوزارة العدل لتصفية الحساب بين الطرفين وبيان الحقيقة.

وتقبلوا لعدالة المحكمة وافر الاحترام والتقدير،،،
مقدم المذكرة: {assignedLawyer}
محام ومستشار قانوني معتمد بالمنصة`;
        } else if (memoType === 'appeal') {
            template = `بسم الله الرحمن الرحيم

أمام محكمة الاستئناف الموقرة - الدائرة {circuit}
في القضية رقم: {caseNumber} (رقم الملف المكتبي: {fileNumber})

صحيفة طعن بالاستئناف

مقدم من المستأنف: {clientName} ({clientRole})
ضد المستأنف ضده: {opposingPartyName} ({opponentRole})

الموضوع والأسباب:
يطعن المستأنف بموجب هذا الاستئناف على الحكم الصادر ضده من محكمة أول درجة والذي قضى بإلزامه بطلبات مجحفة. وحيث أن هذا الحكم قد صدر مشوباً بعيوب قانونية جسيمة ومخالفاً لروح العدالة والقانون الكويتي المستقر، فإننا نود الطعن عليه تأسيساً على الآتي:

أولاً: الخطأ البين في تطبيق القانون وتأويله من قبل محكمة أول درجة.
ثانياً: القصور في التسبيب والفساد في الاستدلال، حيث أغفل الحكم المستندات والبيانات الحاسمة المودعة بملف الدعوى والمدمجة طيه:
{fileReferences}
${customInstructions ? `\nأسباب ودواعي استئناف إضافية مخصصة:\n${customInstructions}` : ''}

الطلبات الختامية:
لذلك، نلتمس من عدالة محكمة الاستئناف الموقرة:
1. قبول الطعن بالاستئناف شكلاً لتقديمه في الميعاد المحدد قانوناً.
2. وفي الموضوع: إلغاء الحكم المستأنف بالكامل، والقضاء مجدداً برفض دعوى المستأنف ضده، مع إلزام الخصم بكامل المصاريف وأتعاب المحاماة عن درجتي التقاضي.

وتقبلوا لعدالتكم وافر التقدير والتحية،،،
مقدم الاستئناف: {assignedLawyer}`;
        } else if (memoType === 'reply') {
            template = `بسم الله الرحمن الرحيم

بدائرة المحكمة: {courtName} الموقرة - الدائرة {circuit}
مخصصة لجلسة النظر المحددة بتاريخ: {nextHearingDate}

مذكرة رد وتعقيب ختامي على دفاع الخصم

مقدمة من الموكل: {clientName} ({clientRole})
ضد الخصم: {opposingPartyName} ({opponentRole})

في القضية رقم: {caseNumber} (رقم الملف المكتبي: {fileNumber})
موضوع الدعوى: {title}

أولاً: تفنيد ادعاءات الخصم:
رداً على ما ورد بمذكرة دفاع الخصم الأخيرة ومحاولاته اليائسة لتفنيد حقوقنا، يود موكلنا {clientName} أن يستعرض لعدالة المحكمة الهشاشة القانونية لتلك الدفوع على النحو الآتي:
1. كافة مزاعم الخصم تفتقر إلى أي أصل مستندي رسمي يدعمها في القانون الكويتي.
2. تكذب هذه المزاعم وتدحضها المستندات الرسمية الثابتة بملف القضية وحافظة الأدلة المدمجة أدناه:
{fileReferences}
${customInstructions ? `\nأوجه رد تفصيلية إضافية:\n${customInstructions}` : ''}

ثانياً: الطلبات الختامية:
نصمم على كامل طلباتنا الختامية السابقة ونلتمس رفض دفاع الخصم والحكم لنا بكافة الطلبات وإلزام الخصم بالمصاريف وأتعاب التمثيل الفعلي.

وتقبلوا وافر الاحترام،،،
مقدم المذكرة: {assignedLawyer}`;
        } else {
            template = `بسم الله الرحمن الرحيم

بدائرة المحكمة: {courtName} الموقرة - الدائرة {circuit}
جلسة النظر المقررة: {nextHearingDate}

مذكرة بدعوى فرعية متقابلة

مقدمة من الموكل: {clientName} (المدعى عليه أصلياً / المدعي فرعياً)
ضد الخصم: {opposingPartyName} (المدعي أصلياً / المدعى عليه فرعياً)

في القضية رقم: {caseNumber} (رقم الملف المكتبي: {fileNumber})

أولاً: أسباب الدعوى الفرعية المتقابلة:
بموجب المادة 84 من قانون المرافعات الكويتي، يحق لنا تقديم طلبات عارضة ومتقابلة ترتبط بالدعوى الأصلية. وحيث أن المدعي أصلياً ({opposingPartyName}) قد أخل بالتزاماته العقدية وتسبب لموكلنا في خسائر بالغة، فإننا نقيم هذه الدعوى الفرعية استناداً إلى أدلة الملف والمستندات التالية المدمجة:
{fileReferences}
${customInstructions ? `\nأسانيد إضافية للدعوى الفرعية:\n${customInstructions}` : ''}

ثانياً: الطلبات في الدعوى الفرعية:
1. قبول الدعوى الفرعية شكلاً لربطها بالخصومة الأصلية.
2. وفي الموضوع: إلزام المدعى عليه فرعياً ({opposingPartyName}) بأن يؤدي لموكلنا تعويضاً عادلاً جابراً لكافة الأضرار المادية والأدبية، مع إلزامه بالمصاريف وأتعاب المحاماة الفعلية.

وتقبلوا لعدالة المحكمة وافر الاحترام والتقدير،،،
مقدم المذكرة: {assignedLawyer}`;
        }

        const filled = template
            .replace(/{clientName}/g, caseItem.clientName || 'العميل الكريم')
            .replace(/{clientRole}/g, Array.isArray(caseItem.clientRole) ? caseItem.clientRole.join('، ') : (caseItem.clientRole || 'موكلنا'))
            .replace(/{title}/g, caseItem.title || '')
            .replace(/{fileNumber}/g, caseItem.fileNumber || caseItem.id || '')
            .replace(/{caseNumber}/g, caseItem.caseNumber || 'غير محدد')
            .replace(/{opposingPartyName}/g, caseItem.opposingPartyName || 'الخصم')
            .replace(/{opponentRole}/g, Array.isArray(caseItem.opponentRole) ? caseItem.opponentRole.join('، ') : (caseItem.opponentRole || 'الطرف الآخر'))
            .replace(/{courtName}/g, caseItem.courtName || 'المحكمة الموقرة')
            .replace(/{courtLevel}/g, caseItem.courtLevel || 'غير محدد')
            .replace(/{circuit}/g, caseItem.circuit || 'غير محدد')
            .replace(/{nextHearingDate}/g, caseItem.nextHearingDate || 'الجلسة المقبلة')
            .replace(/{assignedLawyer}/g, caseItem.assignedLawyer || 'مستشارنا القانوني')
            .replace(/{fileReferences}/g, fileReferences);

        setGeneratedText(filled);
        addToast({
            type: 'success',
            title: 'تم التوليد بنجاح',
            message: 'تم دمج بيانات القضية والمستندات في قالب المذكرة القانونية بنجاح ⚡'
        });
    };

    const handleAiGenerate = async () => {
        setIsGenerating(true);
        const fileReferences = getMergedFileReferences();
        const typeLabel = MEMO_TYPES.find(t => t.id === memoType)?.name || 'مذكرة قانونية';

        const prompt = `بصفتك مستشاراً قانونياً ومحامياً كويتياً خبيراً بارعاً جداً في صياغة المذكرات القانونية والدفوع أمام المحاكم الكويتية بموجب قانون المرافعات الكويتي.
يرجى صياغة مذكرة قانونية متكاملة ورصينة ومحترفة من نوع (${typeLabel}) لقضية بالمعطيات التالية:

- عنوان القضية: ${caseItem.title}
- رقم القضية في المحكمة: ${caseItem.caseNumber}
- رقم الملف المكتبي: ${caseItem.fileNumber}
- المحكمة المختصة: ${caseItem.courtName} (${caseItem.courtLevel})
- الدائرة: ${caseItem.circuit || 'غير محددة'}
- اسم الموكل (العميل): ${caseItem.clientName} (دوره: ${Array.isArray(caseItem.clientRole) ? caseItem.clientRole.join('، ') : (caseItem.clientRole || 'غير محدد')})
- اسم الخصم (الطرف الآخر): ${caseItem.opposingPartyName || 'غير مسجل'} (دوره: ${Array.isArray(caseItem.opponentRole) ? caseItem.opponentRole.join('، ') : (caseItem.opponentRole || 'غير محدد')})
- المحامي المسؤول: ${caseItem.assignedLawyer}
- الطلبات القانونية المسجلة: ${caseItem.legalDemands || 'غير محددة بالتفصيل'}
- تاريخ الجلسة القادمة: ${caseItem.nextHearingDate || 'غير محدد'}

المستندات وحافظة الأدلة المدمجة المحددة من ملف القضية:
${fileReferences}

أيضاً، خذ بعين الاعتبار الملاحظات والطلبات الخاصة الإضافية من المحامي:
"${customInstructions || 'يرجى تقديم صياغة دفاعية قوية مع الدفوع الشكلية والموضوعية الملائمة.'}"

يرجى صياغة المذكرة بلغة قانونية كويتية بليغة جداً ورصينة (تبدأ بديباجة رسمية "بسم الله الرحمن الرحيم"، تليها الوقائع، ثم الدفوع والأسانيد القانونية التفصيلية بالإشارة للمستندات المرفقة، ثم الطلبات الختامية المحددة بدقة وخانة التوقيع). لا تضف أي نص توضيحي خارجي قبل أو بعد المذكرة.`;

        try {
            const aiResponse = await geminiService.getChatbotResponse(prompt);
            setGeneratedText(aiResponse);
            addToast({
                type: 'success',
                title: 'اكتمل التوليد الذكي',
                message: 'تمت صياغة المذكرة القانونية بدقة عالية باستخدام الذكاء الاصطناعي 🤖✨'
            });
        } catch (error) {
            console.warn(error);
            addToast({
                type: 'error',
                title: 'تم استخدام الدمج المحلي',
                message: 'لم نتمكن من الوصول للذكاء الاصطناعي حالياً، تم التوليد التلقائي بواسطة الدمج المحلي'
            });
            handleMergeTemplate();
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopyText = () => {
        if (!generatedText) return;
        navigator.clipboard.writeText(generatedText);
        addToast({
            type: 'success',
            title: 'تم النسخ',
            message: 'تم نسخ نص المذكرة القانونية للحافظة بنجاح 📋'
        });
    };

    const handleDownloadText = () => {
        if (!generatedText) return;
        const element = document.createElement("a");
        const file = new Blob([generatedText], { type: 'text/plain;charset=utf-8' });
        element.href = URL.createObjectURL(file);
        const typeLabel = MEMO_TYPES.find(t => t.id === memoType)?.name.replace(/[^\u0600-\u06FFa-zA-Z0-9 ]/g, '').trim() || 'مذكرة_قانونية';
        element.download = `مذكرة_${typeLabel}_ملف_${caseItem.fileNumber || caseItem.id}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        addToast({
            type: 'success',
            title: 'تم التحميل',
            message: 'تم تصدير المذكرة كملف نصي بنجاح 💾'
        });
    };

    const handleSaveToCaseFiles = () => {
        if (!generatedText) return;
        const typeLabel = MEMO_TYPES.find(t => t.id === memoType)?.name.replace(/[^\u0600-\u06FFa-zA-Z0-9 ]/g, '').trim() || 'مذكرة قانونية';
        
        const newFile: CaseFile = {
            id: `memo-file-${Date.now()}`,
            fileName: `مذكرة_${typeLabel}_مستخرجة.pdf`,
            fileType: "مذكرة قانونية",
            uploadedAt: new Date().toISOString().split('T')[0],
            description: `مذكرة قانونية توليد تلقائي (${typeLabel}) مع دمج مستندات الأرشيف ومراجعة المستشار المتابع.`,
            importance: 'high'
        };

        const updatedFiles = [newFile, ...(caseItem.caseFiles || [])];
        
        onUpdateCase({
            ...caseItem,
            caseFiles: updatedFiles
        });

        addToast({
            type: 'success',
            title: 'تم الحفظ في الأرشيف',
            message: 'تم حفظ المذكرة كمستند رسمي جديد في أرشيف ملفات هذه القضية بنجاح 📂'
        });
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            addToast({
                type: 'error',
                title: 'تم حظر النافذة المنبثقة',
                message: 'يرجى السماح بالنوافذ المنبثقة لطباعة المستند.'
            });
            return;
        }

        printWindow.document.write(`
            <html dir="rtl">
            <head>
                <title>طباعة المذكرة القانونية - ملف رقم ${caseItem.fileNumber || caseItem.id}</title>
                <style>
                    body {
                        font-family: 'Sakkal Majalla', 'Traditional Arabic', 'Times New Roman', serif;
                        padding: 40px;
                        line-height: 1.8;
                        background-color: #fff;
                        color: #000;
                    }
                    .document-container {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 3px double #000;
                        padding: 30px;
                        position: relative;
                        min-height: 95vh;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        border-bottom: 2px solid #000;
                        padding-bottom: 15px;
                        margin-bottom: 30px;
                        font-family: Arial, sans-serif;
                        font-size: 13px;
                    }
                    .header-center {
                        text-align: center;
                        font-size: 18px;
                        font-weight: bold;
                    }
                    .content {
                        white-space: pre-wrap;
                        font-size: 16px;
                        text-align: justify;
                    }
                    .footer {
                        position: absolute;
                        bottom: 20px;
                        left: 0;
                        right: 0;
                        text-align: center;
                        font-size: 10px;
                        border-top: 1px solid #ddd;
                        padding-top: 10px;
                        font-family: Arial, sans-serif;
                        color: #555;
                    }
                    @media print {
                        body { padding: 0; }
                        .document-container { border: 3px double #000; min-height: 98vh; }
                    }
                </style>
            </head>
            <body>
                <div class="document-container">
                    <div class="header">
                        <div>
                            <strong>دولة الكويت</strong><br>
                            ${caseItem.courtName || 'المحكمة الموقرة'}<br>
                            الدائرة: ${caseItem.circuit || 'غير حددة'}
                        </div>
                        <div class="header-center">
                            مذكرة دفاع رسمية
                        </div>
                        <div style="text-align: left;">
                            رقم القضية: ${caseItem.caseNumber || 'N/A'}<br>
                            رقم الملف: ${caseItem.fileNumber || 'N/A'}<br>
                            التاريخ: ${new Date().toISOString().split('T')[0]}
                        </div>
                    </div>
                    <div class="content">${generatedText}</div>
                    <div class="footer">
                        تمت الطباعة والتحقق تلقائياً عبر منصة عدالة لإدارة القضايا والاستشارات القانونية
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() { window.close(); }, 500);
                    };
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();
    };

    // Auto merge on mount if text is empty
    useEffect(() => {
        if (!generatedText) {
            handleMergeTemplate();
        }
    }, [memoType]);

    return (
        <Card className="p-8 rounded-[2.5rem] border-none shadow-sm dark:bg-dm-card space-y-6 text-right">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
                <div>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 italic">
                        <DocumentTextIcon className="w-6 h-6 text-primary" />
                        صانع ومولد المذكرات القانونية التلقائي
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                        ولد عرائض ومذكرات الدفاع والدعاوى الفرعية بالدمج الفوري لبيانات القضية ومستنداتها المرفوعة أو بصياغة الذكاء الاصطناعي
                    </p>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Right Column: Configuration & Controls */}
                <div className="lg:col-span-4 space-y-6 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                        إعدادات صياغة المستند
                    </h3>

                    {/* Memo Type select */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 block">نوع وموضوع المذكرة القانونية</label>
                        <select
                            value={memoType}
                            onChange={(e) => setMemoType(e.target.value)}
                            className="w-full text-xs font-semibold h-11 px-3 bg-white dark:bg-dm-card border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-right text-slate-800 dark:text-slate-200"
                        >
                            {MEMO_TYPES.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Files Selection */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-slate-400 block">دمج وحقن مستندات القضية (حوافظ الأدلة)</label>
                        {files.length === 0 ? (
                            <p className="text-[10px] text-slate-400 italic">لا توجد ملفات مرفوعة بأرشيف هذه القضية لدمجها حالياً.</p>
                        ) : (
                            <div className="space-y-2 max-h-[140px] overflow-y-auto bg-white dark:bg-dm-card p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                                {files.map(file => (
                                    <label key={file.id} className="flex items-center gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer hover:text-primary transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={selectedFiles.includes(file.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedFiles(prev => [...prev, file.id]);
                                                } else {
                                                    setSelectedFiles(prev => prev.filter(id => id !== file.id));
                                                }
                                            }}
                                            className="rounded text-primary focus:ring-primary w-3.5 h-3.5"
                                        />
                                        <span className="truncate flex-1">{file.fileName}</span>
                                        <span className="text-[9px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">{file.fileType}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Specific Instructions */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-black text-slate-400 block">نقاط وملاحظات دفاع مخصصة (اختياري)</label>
                        <textarea
                            value={customInstructions}
                            onChange={(e) => setCustomInstructions(e.target.value)}
                            placeholder="مثال: الدفع بسقوط الحق بالتقادم، أو إثبات براءة الذمة بموجب التحويل البنكي الأخير المرفق..."
                            className="w-full text-xs font-semibold p-3 h-24 bg-white dark:bg-dm-card border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-primary text-right text-slate-800 dark:text-slate-200 resize-none"
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2 space-y-2">
                        <Button
                            onClick={handleMergeTemplate}
                            variant="secondary"
                            className="w-full h-11 rounded-xl font-bold text-xs justify-center"
                        >
                            دمج القالب القياسي السريع ⚡
                        </Button>
                        <Button
                            onClick={handleAiGenerate}
                            className="w-full h-11 rounded-xl font-bold text-xs justify-center gap-2 bg-gradient-to-r from-primary to-indigo-600 border-none text-white hover:opacity-90 animate-shimmer"
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    جاري الصياغة بالذكاء الاصطناعي...
                                </>
                            ) : (
                                <>
                                    <SparklesIcon className="w-4 h-4" />
                                    توليد ذكي بالذكاء الاصطناعي ✨
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Left Column: Document Editor and Live sheet */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900/60 p-2 rounded-xl">
                        <span className="text-[10px] font-black text-slate-400 mr-2">محرر ومعاين المستند الفعلي</span>
                        <div className="flex gap-1.5">
                            <button
                                onClick={handleCopyText}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                title="نسخ المذكرة"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                            </button>
                            <button
                                onClick={handleDownloadText}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                title="تحميل ملف نصي"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            </button>
                            <button
                                onClick={handleSaveToCaseFiles}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                                title="حفظ وحقن في ملفات القضية"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                            </button>
                            <button
                                onClick={handlePrint}
                                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-primary transition-colors"
                                title="طباعة المذكرة بتنسيق رسمي"
                            >
                                <PrinterIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Printable A4 Styled Sheet */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-8 sm:p-12 min-h-[600px] text-right font-serif relative overflow-hidden text-slate-900 dark:text-slate-100">
                        {/* Legal Frame Border Accent */}
                        <div className="absolute inset-2 border-2 border-double border-slate-200/60 dark:border-slate-800/60 pointer-events-none" />
                        
                        <div className="relative z-10 space-y-6">
                            {/* Official Header */}
                            <div className="flex justify-between items-start text-[11px] font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-4 font-sans">
                                <div className="text-right">
                                    <p>دولة الكويت</p>
                                    <p>{caseItem.courtName || 'المحكمة الموقرة'}</p>
                                    <p>الدائرة: {caseItem.circuit || 'غير محددة'}</p>
                                </div>
                                <div className="text-center">
                                    <span className="text-[14px] tracking-widest text-primary font-serif">مذكرة دفاع رسمية</span>
                                </div>
                                <div className="text-left font-mono">
                                    <p>رقم القضية: {caseItem.caseNumber || 'N/A'}</p>
                                    <p>رقم الملف: {caseItem.fileNumber || 'N/A'}</p>
                                    <p>التاريخ: {new Date().toISOString().split('T')[0]}</p>
                                </div>
                            </div>

                            {/* Text Editor Area */}
                            <textarea
                                value={generatedText}
                                onChange={(e) => setGeneratedText(e.target.value)}
                                className="w-full min-h-[500px] p-2 bg-transparent border-none outline-none focus:ring-0 text-slate-900 dark:text-slate-100 text-sm leading-relaxed font-serif text-right resize-none placeholder-slate-300"
                                placeholder="يرجى دمج قالب المذكرة أو توليدها لعرض النص القابل للتعديل هنا..."
                            />

                            {/* Document Footer */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] text-slate-400 font-sans">
                                <p>هذا المستند تم إنشاؤه عبر منصة عدالة ومعد للتقديم أمام السلطات القضائية بدولة الكويت</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-400 font-sans px-2">
                        <span>الكلمات: {generatedText.trim() ? generatedText.split(/\s+/).length : 0} كلمة</span>
                        <span>جاهز ومحفوظ تلقائياً في المتصفح</span>
                    </div>
                </div>
            </div>

            {/* Floating AI Assistant Widget with active case context */}
            <FloatingAiAssistantWidget currentCase={caseItem} />
        </Card>
    );
};

export default CaseDetailsPage;
