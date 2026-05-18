import React, { useState, useRef, useMemo } from 'react';
import ReactQuill from 'react-quill';
import { motion, AnimatePresence } from 'motion/react';
import 'react-quill/dist/quill.snow.css';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TextArea from '../components/ui/TextArea';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { geminiService } from '../services/geminiService';
import { GeminiAnalysisResult, ExtractedClause, AnalyzedContract, AnalyzedContractStatus, ContractCategory } from '../types';
import { RiskLevelBadge, Badge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import ReactMarkdown from 'react-markdown';
import AnalysisDashboard from '@/components/ContractAnalysis/AnalysisDashboard';
import ContractList from '@/components/ContractAnalysis/ContractList';
import LegalLibrary from '@/components/ContractAnalysis/LegalLibrary';
import { mockAnalyzedContracts } from '@/data/contractAnalysisData';
import { 
    DocumentTextIcon, ClipboardListCheckIcon, ShieldExclamationIcon, 
    LightBulbIcon, SparklesIcon, InformationCircleIcon, PaperClipIcon, 
    XCircleIcon, CameraIcon, PrinterIcon, PlusCircleIcon, SaveIcon,
    ArrowPathIcon, MagnifyingGlassIcon, PencilIcon,
    CheckCircleIcon, ExclamationTriangleIcon, BookOpenIcon,
    ArrowUturnLeftIcon, ScaleIcon, CpuChipIcon, ChatBubbleLeftEllipsisIcon,
    GavelIcon, Squares2X2Icon, FunnelIcon, ArrowRightIcon, ShareIcon
} from '../constants';

// --- Types ---
type PageView = 'dashboard' | 'analyze' | 'editor' | 'details' | 'library';

// --- Mock Templates ---
const initialTemplates = [
    { 
        id: '1', 
        name: 'عقد عمل محدد المدة - كويتي', 
        category: 'عمالي',
        content: `
            <div style="direction: rtl; text-align: right;">
                <h1 style="text-align: center; color: #1e3a8a;">عقد عمل محدد المدة</h1>
                <p style="margin-bottom: 20px;">إنه في يوم [[تاريخ_اليوم]] موافق [[تاريخ_هجري]]</p>
                <p>تم الاتفاق بين كل من:</p>
                <p><strong>أولاً: [[اسم_الشركة]]</strong> ومقرها [[العنوان_الرئيسي]] ويمثلها [[المفوض_بالتوقيع]] بصفته [[الوظيفة_القيادية]] (طرف أول)</p>
                <p><strong>ثانياً: السيد/ [[اسم_الموظف]]</strong> وجنسيته [[الجنسية]] ويحمل بطاقة مدنية رقم [[الرقم_المدني]] (طرف ثان)</p>
                <p style="margin-top: 20px;">تم الاتفاق على ما يلي:</p>
                <p>1. يعمل الطرف الثاني لدى الطرف الأول بوظيفة <strong>[[المسمى_الوظيفي]]</strong> براتب أساسي <strong>[[الراتب_الأساسي]]</strong> د.ك</p>
                <p>2. مدة هذا العقد سنة واحدة تبدأ من [[تاريخ_المباشرة]] وتعتبر فترة التجربة [[شهور_التجربة]] أشهر.</p>
                <p>3. يخضع هذا العقد لأحكام القانون رقم 6 لسنة 2010 بشأن العمل في القطاع الأهلي بدولة الكويت وتعديلاته.</p>
            </div>
        `
    },
    {
        id: '2',
        name: 'اتفاقية عدم إفصاح (NDA)',
        category: 'تجاري',
        content: `
            <div style="direction: rtl; text-align: right;">
                <h1 style="text-align: center; color: #1e3a8a;">اتفاقية سرية المعلومات</h1>
                <p>تم تحرير هذه الاتفاقية في [[تاريخ_اليوم]] بين:</p>
                <p>1. [[الطرف_المفصح]] (ويُشار إليه لاحقاً بـ "المفصح")</p>
                <p>2. [[الطرف_المستلم]] (ويُشار إليه لاحقاً بـ "المستلم")</p>
                <p style="margin-top: 20px;">اتفق الطرفان على الحفاظ على سرية المعلومات المتعلقة بـ [[مشروع_التعاون]]...</p>
                <p>تعتبر "المعلومات السرية" كافة البيانات التقنية، التجارية، المالية، أو أي معلومات أخرى يتم تبادلها بين الطرفين.</p>
            </div>
        `
    },
    {
        id: '3',
        name: 'عقد توريد مواد برمجية',
        category: 'تقني',
        content: `
            <div style="direction: rtl; text-align: right;">
                <h1 style="text-align: center; color: #1e3a8a;">اتفاقية توريد وخدمات برمجية</h1>
                <p>طرف أول: [[اسم_المورد]]</p>
                <p>طرف ثان: [[اسم_العميل]]</p>
                <p>موضوع العقد: توريد وبرمجة نظام [[اسم_النظام]] وفقاً للمواصفات الملحقة.</p>
                <p>قيمة العقد الإجمالية: [[قيمة_العقد]] د.ك</p>
            </div>
        `
    }
];

const fileToBase64 = (file: File): Promise<{ base64Data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(',')[1];
            if (base64Data) resolve({ base64Data, mimeType: file.type });
            else reject(new Error("Failed to extract base64 data from file."));
        };
        reader.onerror = error => reject(error);
    });
};

const ContractAnalysisPage: React.FC = () => {
    // Navigation State
    const [view, setView] = useState<PageView>('dashboard');
    const [selectedContract, setSelectedContract] = useState<AnalyzedContract | null>(null);

    // Analysis State
    const [contractText, setContractText] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<GeminiAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [analysisSource, setAnalysisSource] = useState<'text' | 'file' | 'image'>('text');
    const [jurisdiction, setJurisdiction] = useState<string>('الكويت');
    const [contractType, setContractType] = useState<string>('عقد عمل');

    // Editor State
    const [editorContent, setEditorContent] = useState<string>('');
    const [templates, setTemplates] = useState(initialTemplates);
    const [selectedTemplateId, setSelectedTemplateId] = useState('');
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [isCorrecting, setIsCorrecting] = useState(false);

    // Deep Analysis State
    const [deepAnalysisClause, setDeepAnalysisClause] = useState<ExtractedClause | null>(null);
    const [deepAnalysisContent, setDeepAnalysisContent] = useState<string>('');
    const [isDeepAnalyzing, setIsDeepAnalyzing] = useState(false);
    const [isDeepAnalysisModalOpen, setIsDeepAnalysisModalOpen] = useState(false);

    // Refs
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Extract Variables from Content
    const extractedVariables = useMemo(() => {
        const regex = /\[\[(.*?)\]\]/g;
        const matches = [];
        let match;
        while ((match = regex.exec(editorContent)) !== null) {
            if (!matches.includes(match[1])) {
                matches.push(match[1]);
            }
        }
        return matches;
    }, [editorContent]);

    const handleApplyTemplate = (id: string) => {
        const template = templates.find(t => t.id === id);
        if (template) {
            setEditorContent(template.content);
            setSelectedTemplateId(id);
            setVariableValues({});
        }
    };

    const handleSaveAsTemplate = () => {
        if (!editorContent) return;
        const name = prompt("أدخل اسماً للقالب الجديد:");
        if (name) {
            setIsSaving(true);
            setTimeout(() => {
                const newTpl = { id: `tpl-${Date.now()}`, name, content: editorContent, category: 'شخصي' };
                setTemplates([newTpl, ...templates]);
                setIsSaving(false);
                alert("تم حفظ القالب بنجاح في مكتبتك الشخصية.");
            }, 1000);
        }
    };

    const handleVariableChange = (varName: string, value: string) => {
        setVariableValues(prev => ({ ...prev, [varName]: value }));
    };

    const replaceVariables = () => {
        let newContent = editorContent;
        Object.entries(variableValues).forEach(([key, val]) => {
            const regex = new RegExp(`\\[\\[${key}\\]\\]`, 'g');
            newContent = newContent.replace(regex, val);
        });
        setEditorContent(newContent);
        setVariableValues({});
        alert("تم استبدال المتغيرات بنجاح.");
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setContractText(''); 
            setSelectedFile(file);
            if (file.type.startsWith('image/')) {
                setFilePreview(URL.createObjectURL(file));
            } else {
                setFilePreview(null);
            }
        }
    };
  
    const clearSelection = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
    };

    const handleAnalyzeContract = async () => {
        if (!contractText.trim() && !selectedFile) {
            setError("يرجى إدخال نص العقد أو رفع ملف للتحليل.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);
        
        try {
            let result: GeminiAnalysisResult;
            if (selectedFile) {
                const { base64Data, mimeType } = await fileToBase64(selectedFile);
                result = await geminiService.analyzeContract(undefined, { base64Data, mimeType }, jurisdiction, contractType);
            } else {
                result = await geminiService.analyzeContract(contractText, undefined, jurisdiction, contractType);
            }
            setAnalysisResult(result);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("حدث خطأ غير متوقع أثناء تحليل العقد.");
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePrint = () => {
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const handleReset = () => {
        setContractText('');
        clearSelection();
        setAnalysisResult(null);
        setError(null);
    };

    const handleCorrectGrammar = async (target: 'contract' | 'editor') => {
        const textToCorrect = target === 'contract' ? contractText : editorContent.replace(/<[^>]*>/g, '');
        if (!textToCorrect.trim()) return;

        setIsCorrecting(true);
        try {
            const correctedText = await geminiService.correctGrammarAndSpelling(textToCorrect);
            if (target === 'contract') {
                setContractText(correctedText);
            } else {
                setEditorContent(`<div style="direction: rtl; text-align: right;">${correctedText.replace(/\n/g, '<br/>')}</div>`);
            }
            alert("تم تدقيق النص وتصحيحه لغوياً بنجاح.");
        } catch (err) {
            alert("حدث خطأ أثناء التدقيق اللغوي.");
        } finally {
            setIsCorrecting(false);
        }
    };

    const handleApplyClauseToEditor = (clause: { title: string, content: string, aiRecommendation?: string }) => {
        const formattedClause = `
            <div style="direction: rtl; text-align: right; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; margin-bottom: 20px; background-color: #f8fafc;">
                <h3 style="color: #1e3a8a; margin-bottom: 10px;">${clause.title}</h3>
                <p style="margin-bottom: 15px; font-style: italic;">${clause.content}</p>
                ${clause.aiRecommendation ? `<div style="background-color: #e0f2fe; padding: 10px; border-radius: 8px; border-right: 4px solid #0369a1; font-size: 0.9em;">
                    <strong>توصية الذكاء الاصطناعي:</strong> ${clause.aiRecommendation}
                </div>` : ''}
            </div>
        `;
        setEditorContent(prev => prev + formattedClause);
        setView('editor');
        alert("تمت إضافة البند إلى محرر الصياغة.");
    };

    const handleDeepAnalyzeClause = async (clause: ExtractedClause) => {
        setDeepAnalysisClause(clause);
        setDeepAnalysisContent('');
        setIsDeepAnalyzing(true);
        setIsDeepAnalysisModalOpen(true);

        try {
            const analysis = await geminiService.analyzeClauseDeeply(clause, jurisdiction, contractType);
            setDeepAnalysisContent(analysis);
        } catch (err) {
            setError("فشل إجراء التحليل المعمق للبند.");
        } finally {
            setIsDeepAnalyzing(false);
        }
    };

    // --- RENDER HELPERS ---
    const SectionHeader = ({ title, icon, className = "" }: { title: string; icon?: React.ReactNode; className?: string }) => (
        <div className={`flex items-center gap-3 mb-4 ${className}`}>
            {icon && <span className="text-indigo-600 bg-indigo-50 p-2 rounded-xl">{icon}</span>}
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">{title}</h3>
        </div>
    );

    return (
        <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
            <style>{`
                @media print {
                    .print-hide { display: none !important; }
                    body { background: white !important; margin: 0; padding: 0; }
                    .print-area { position: absolute; left: 0; top: 0; width: 100%; border: none !important; box-shadow: none !important; padding: 1cm !important; }
                    .card { border: 1px solid #eee !important; box-shadow: none !important; margin-bottom: 20px !important; break-inside: avoid; }
                    .badge { border: 1px solid #ccc !important; background: transparent !important; color: black !important; }
                }
                .rtl-quill .ql-editor {
                    direction: rtl;
                    text-align: right;
                    font-family: 'Inter', sans-serif;
                    font-size: 1.1rem;
                    line-height: 1.8;
                    min-height: 600px;
                }
                .ql-toolbar.ql-snow {
                    border-top-left-radius: 1rem;
                    border-top-right-radius: 1rem;
                    background: #f8fafc;
                    border-color: #f1f5f9;
                    padding: 8px 12px;
                }
                .ql-container.ql-snow {
                    border-bottom-left-radius: 1rem;
                    border-bottom-right-radius: 1rem;
                    border-color: #f1f5f9;
                }
            `}</style>

            <div className="flex flex-col md:flex-row justify-between items-start gap-4 print-hide">
                <div className="flex items-center">
                    <div className="p-4 bg-indigo-600 rounded-2xl me-5 shadow-lg shadow-indigo-200 dark:shadow-none">
                        <ScaleIcon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">تحليل وصياغة العقود الذكية</h1>
                        <p className="text-slate-500 font-bold">بوابة التحليل القانوني المتطور المدعوم بالذكاء الاصطناعي</p>
                    </div>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-2xl self-end">
                    <button 
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${view === 'dashboard' ? 'bg-white dark:bg-dm-card shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setView('dashboard')}
                    >
                        <Squares2X2Icon className={`w-5 h-5 ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        الرئيسية
                    </button>
                    <button 
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${view === 'analyze' ? 'bg-white dark:bg-dm-card shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setView('analyze')}
                    >
                        <MagnifyingGlassIcon className={`w-5 h-5 ${view === 'analyze' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        تحليل جديد
                    </button>
                    <button 
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${view === 'editor' ? 'bg-white dark:bg-dm-card shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setView('editor')}
                    >
                        <PencilIcon className={`w-5 h-5 ${view === 'editor' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        محرر الصياغة
                    </button>
                    <button 
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${view === 'library' ? 'bg-white dark:bg-dm-card shadow-lg text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setView('library')}
                    >
                        <BookOpenIcon className={`w-5 h-5 ${view === 'library' ? 'text-indigo-600' : 'text-slate-400'}`} />
                        المكتبة القانونية
                    </button>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {view === 'dashboard' && (
                    <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12">
                        <AnalysisDashboard />
                        
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">العقود المحللة مؤخراً</h3>
                                    <p className="text-slate-500 font-bold">آخر مستندات تم إجراء فحص قانوني لها</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200" leftIcon={<FunnelIcon className="w-4 h-4"/>}>تصفية</Button>
                                    <Button variant="outline" size="sm" className="rounded-xl border-slate-200" leftIcon={<PlusCircleIcon className="w-4 h-4"/>}>إضافة يدوي</Button>
                                </div>
                            </div>
                            <ContractList 
                                contracts={mockAnalyzedContracts} 
                                onSelect={(contract) => {
                                    setSelectedContract(contract);
                                    setView('details');
                                }} 
                            />
                        </div>
                    </motion.div>
                )}

                {view === 'details' && selectedContract && (
                    <motion.div key="details" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8">
                        <div className="flex justify-between items-center bg-white dark:bg-dm-card p-6 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
                             <div className="flex items-center gap-4">
                                <Button variant="ghost" className="rounded-xl" onClick={() => setView('dashboard')}><ArrowUturnLeftIcon className="w-5 h-5"/></Button>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                                        {selectedContract.title}
                                        <Badge variant="secondary" text={selectedContract.referenceNumber} className="text-[10px] uppercase tracking-tighter" />
                                    </h2>
                                    <p className="text-xs text-slate-500 font-bold">{selectedContract.category} • تم الرفع بواسطة {selectedContract.uploadedBy}</p>
                                </div>
                             </div>
                             <div className="flex gap-2">
                                <Button variant="outline" size="sm" className="rounded-xl font-black" leftIcon={<PrinterIcon className="w-4 h-4"/>} onClick={handlePrint}>طباعة</Button>
                                <Button variant="secondary" size="sm" className="rounded-xl font-black" leftIcon={<ShareIcon className="w-4 h-4"/>}>مشاركة</Button>
                                <Button variant="primary" size="sm" className="rounded-xl font-black" leftIcon={<PencilIcon className="w-4 h-4"/>} onClick={() => {
                                    setEditorContent(`<div style="direction: rtl; text-align: right;">${selectedContract.summary}</div>`);
                                    setView('editor');
                                }}>تعديل في المحرر</Button>
                             </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-8 space-y-8">
                                <Card className="border-none shadow-xl rounded-[2.5rem] p-8">
                                    <SectionHeader title="الملخص التنفيذي والتحليل" icon={<InformationCircleIcon className="w-5 h-5 text-indigo-600"/>} />
                                    <p className="text-slate-700 dark:text-slate-300 leading-8 text-[15px] font-medium whitespace-pre-wrap p-6 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-slate-100 dark:border-slate-800 mb-8">
                                        {selectedContract.summary}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
                                            <h4 className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest mb-3">درجة الأمان</h4>
                                            <div className="text-3xl font-black text-indigo-600">{selectedContract.risks.securityPercentage}%</div>
                                        </div>
                                        <div className="p-6 bg-rose-50 dark:bg-rose-900/10 rounded-3xl border border-rose-100 dark:border-rose-900/30">
                                            <h4 className="text-[10px] font-black text-rose-900 dark:text-rose-300 uppercase tracking-widest mb-3">المخاطر المكتشفة</h4>
                                            <div className="text-3xl font-black text-rose-600">{selectedContract.risks.criticalIssues.length}</div>
                                        </div>
                                        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                                            <h4 className="text-[10px] font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-widest mb-3">بند مطابق للمعايير</h4>
                                            <div className="text-3xl font-black text-emerald-600">{selectedContract.clauses.length}</div>
                                        </div>
                                    </div>
                                </Card>

                                <SectionHeader title="تشريح بنود العقد" icon={<LightBulbIcon className="w-5 h-5 text-indigo-600"/>} className="px-4" />
                                <div className="space-y-4">
                                    {selectedContract.clauses.map((clause, idx) => (
                                        <Card key={idx} className="border-none shadow-lg rounded-3xl hover:ring-2 hover:ring-indigo-500/10 transition-all p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">{idx + 1}</span>
                                                    <h4 className="font-black text-slate-800 dark:text-white">{clause.title}</h4>
                                                </div>
                                                <RiskLevelBadge level={clause.risk} />
                                            </div>
                                            <p className="p-5 bg-slate-50 dark:bg-slate-800/20 rounded-2xl text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-7 mb-4 border border-slate-100 dark:border-slate-800">
                                                {clause.content}
                                            </p>
                                            {clause.aiRecommendation && (
                                                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border-r-4 border-indigo-600">
                                                    <div className="flex items-center gap-2 text-[11px] text-indigo-700 dark:text-indigo-300 font-black mb-1">
                                                        <SparklesIcon className="w-4 h-4"/>
                                                        توجيه قانوني (AI)
                                                    </div>
                                                    <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400 font-medium">{clause.aiRecommendation}</p>
                                                </div>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-8">
                                <Card className="border-none shadow-xl rounded-[2.5rem] p-8">
                                    <h4 className="text-sm font-black text-slate-800 dark:text-white mb-6">تفاصيل المستند</h4>
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-slate-800">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">التصنيف</span>
                                            <span className="text-xs font-black text-slate-800 dark:text-white">{selectedContract.category}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-slate-800">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">الطرف الأول</span>
                                            <span className="text-xs font-black text-slate-800 dark:text-white">{selectedContract.parties.firstParty}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-slate-800">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">الطرف الثاني</span>
                                            <span className="text-xs font-black text-slate-800 dark:text-white">{selectedContract.parties.secondParty}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-4 border-b border-slate-50 dark:border-slate-800">
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">القيمة</span>
                                            <span className="text-xs font-black text-indigo-600">{selectedContract.financials?.value} {selectedContract.financials?.currency}</span>
                                        </div>
                                    </div>
                                    <div className="mt-8">
                                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${selectedContract.qrCodeData}`} alt="QR Verification" className="w-24 h-24 mx-auto rounded-xl opacity-50 hover:opacity-100 transition-opacity cursor-help" title="تحقق من العقد رقمياً"/>
                                        <p className="text-[9px] text-center text-slate-400 font-bold mt-2">كود التحقق الرقمي الموحد</p>
                                    </div>
                                </Card>

                                <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-slate-900 text-white">
                                     <h4 className="text-sm font-black mb-6 flex items-center gap-2">
                                        <ExclamationTriangleIcon className="w-5 h-5 text-rose-500" /> تنبيهات الامتثال القانوين
                                     </h4>
                                     <div className="space-y-4">
                                        {selectedContract.risks.criticalIssues.map((issue, i) => (
                                            <div key={i} className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-[11px] font-medium text-rose-200">
                                                {issue}
                                            </div>
                                        ))}
                                        {selectedContract.risks.criticalIssues.length === 0 && (
                                            <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-[11px] font-medium text-emerald-200 text-center">
                                                لا توجد قضايا امتثال حرجة مكتشفة
                                            </div>
                                        )}
                                     </div>
                                </Card>

                                <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-indigo-600 text-white">
                                     <h4 className="text-sm font-black mb-4">نصيحة الخبير الذكي</h4>
                                     <p className="text-xs font-medium leading-7 opacity-90 mb-6">
                                        {selectedContract.legalAdvice}
                                     </p>
                                     <Button variant="primary" className="w-full rounded-2xl bg-white text-indigo-600 shadow-xl border-none font-black text-xs" leftIcon={<ArrowPathIcon className="w-4 h-4"/>}>تحميل البدائل المقترحة</Button>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                )}

                {view === 'analyze' && (
                    <motion.div 
                        key="analyze" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Input Column */ }
                            <div className="lg:col-span-5 space-y-6 print-hide">
                                <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden">
                                    <div className="p-8 bg-indigo-600 text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                                        <div className="flex items-center gap-3 mb-6">
                                            <span className="text-white bg-white/10 p-2 rounded-xl"><DocumentTextIcon className="w-5 h-5"/></span>
                                            <h3 className="text-lg font-black tracking-tight">مصدر البيانات</h3>
                                        </div>
                                        
                                        <div className="flex bg-white/10 p-1 rounded-xl gap-1 mb-6">
                                            <button 
                                                className={`flex-1 py-3 text-[10px] font-black rounded-lg transition-all ${analysisSource === 'text' ? 'bg-white text-indigo-600 shadow-xl' : 'text-white/60 hover:text-white'}`}
                                                onClick={() => { setAnalysisSource('text'); clearSelection(); }}
                                            >نص مدخل</button>
                                            <button 
                                                className={`flex-1 py-3 text-[10px] font-black rounded-lg transition-all ${analysisSource === 'file' ? 'bg-white text-indigo-600 shadow-xl' : 'text-white/60 hover:text-white'}`}
                                                onClick={() => { setAnalysisSource('file'); setContractText(''); }}
                                            >ملف (PDF/Doc)</button>
                                            <button 
                                                className={`flex-1 py-3 text-[10px] font-black rounded-lg transition-all ${analysisSource === 'image' ? 'bg-white text-indigo-600 shadow-xl' : 'text-white/60 hover:text-white'}`}
                                                onClick={() => { setAnalysisSource('image'); setContractText(''); }}
                                            >صورة / كاميرا</button>
                                        </div>

                                        {/* Jurisdcition and Contract Type Inputs */}
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/60 px-1">الاختصاص القضائي</label>
                                                <Select 
                                                    value={jurisdiction} 
                                                    onChange={(e) => setJurisdiction(e.target.value)}
                                                    className="bg-white/10 border-white/20 text-white rounded-xl text-xs h-10"
                                                    options={[
                                                        { label: 'الكويت', value: 'الكويت' },
                                                        { label: 'السعودية', value: 'السعودية' },
                                                        { label: 'الإمارات', value: 'الإمارات' },
                                                        { label: 'مصر', value: 'مصر' },
                                                        { label: 'الأردن', value: 'الأردن' },
                                                        { label: 'أخرى', value: 'أخرى' },
                                                    ]}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-white/60 px-1">نوع العقد</label>
                                                <Select 
                                                    value={contractType} 
                                                    onChange={(e) => setContractType(e.target.value)}
                                                    className="bg-white/10 border-white/20 text-white rounded-xl text-xs h-10"
                                                    options={[
                                                        { label: 'عقد عمل', value: 'عقد عمل' },
                                                        { label: 'عقد تجاري', value: 'عقد تجاري' },
                                                        { label: 'عقد إيجار', value: 'عقد إيجار' },
                                                        { label: 'اتفاقية سرية', value: 'اتفاقية سرية' },
                                                        { label: 'عقد توريد', value: 'عقد توريد' },
                                                        { label: 'أخرى', value: 'أخرى' },
                                                    ]}
                                                />
                                            </div>
                                        </div>

                                        <div className="min-h-[300px]">
                                            <AnimatePresence mode="wait">
                                                {analysisSource === 'text' ? (
                                                    <motion.div key="text-in" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
                                                        <div className="relative">
                                                            <TextArea 
                                                                value={contractText} 
                                                                onChange={(e) => setContractText(e.target.value)}
                                                                rows={10} 
                                                                placeholder="قم بلصق نصوص بنود العقد هنا للتحليل..." 
                                                                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-2xl resize-none pb-12"
                                                            />
                                                            <button 
                                                                onClick={() => handleCorrectGrammar('contract')}
                                                                disabled={isCorrecting || !contractText.trim()}
                                                                className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black text-white transition-all disabled:opacity-50"
                                                                title="تدقيق لغوي ونحوي"
                                                            >
                                                                {isCorrecting ? <LoadingSpinner size="sm" color="text-white" /> : <CheckCircleIcon className="w-3.5 h-3.5" />}
                                                                تدقيق إملائي
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ) : analysisSource === 'file' || analysisSource === 'image' ? (
                                                    <motion.div key="file-in" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="h-full">
                                                        {!selectedFile ? (
                                                            <div 
                                                                className="border-2 border-dashed border-white/20 rounded-3xl h-[280px] flex flex-col items-center justify-center p-8 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                                                                onClick={() => (analysisSource === 'image' ? cameraInputRef : fileInputRef).current?.click()}
                                                            >
                                                                <div className="p-6 rounded-full bg-white/10 group-hover:scale-110 transition-transform mb-4">
                                                                    {analysisSource === 'image' ? <CameraIcon className="w-10 h-10"/> : <PaperClipIcon className="w-10 h-10"/>}
                                                                </div>
                                                                <span className="font-black">اضغط لرفع الملف أو الصورة</span>
                                                                <p className="text-[10px] text-white/50 mt-2">يدعم PDF, Word ومختلف الصور</p>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-white/10 rounded-3xl p-6 relative group overflow-hidden h-[280px] flex flex-col items-center justify-center border border-white/20">
                                                                {filePreview ? (
                                                                    <img src={filePreview} className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" alt="Preview"/>
                                                                ) : (
                                                                    <div className="absolute inset-0 bg-indigo-900/50 flex items-center justify-center opacity-20"><DocumentTextIcon className="w-32 h-32"/></div>
                                                                )}
                                                                <div className="z-10 text-center">
                                                                    <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-white"/>
                                                                    <p className="font-black text-sm line-clamp-1 mb-1">{selectedFile.name}</p>
                                                                    <p className="text-[10px] text-white/60">{(selectedFile.size / (1024*1024)).toFixed(2)} MB</p>
                                                                    <Button variant="danger" size="sm" className="mt-6 rounded-xl !p-2" onClick={clearSelection}><XCircleIcon className="w-5 h-5"/></Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,image/*"/>
                                                        <input type="file" ref={cameraInputRef} onChange={handleFileChange} className="hidden" accept="image/*" capture="environment" />
                                                    </motion.div>
                                                ) : null}
                                            </AnimatePresence>
                                        </div>

                                        <div className="mt-8 flex gap-3">
                                            <Button 
                                                className="flex-grow rounded-2xl h-14 font-black shadow-2xl shadow-indigo-900 bg-white text-indigo-600 hover:bg-slate-50 transition-all text-lg"
                                                onClick={handleAnalyzeContract}
                                                isLoading={isLoading}
                                                disabled={isLoading || (!contractText.trim() && !selectedFile)}
                                            >
                                                بدء المعالجة الذكية
                                            </Button>
                                            <Button variant="secondary" className="rounded-2xl w-14 h-14 !p-0 bg-white/10 border-none" onClick={handleReset}><ArrowPathIcon className="w-6 h-6"/></Button>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="border-none shadow-lg rounded-3xl bg-slate-50 dark:bg-dm-card/30">
                                    <h4 className="font-black text-slate-800 dark:text-white text-sm mb-3 flex items-center gap-2">
                                        <InformationCircleIcon className="w-5 h-5 text-indigo-500"/> تعليمات الاستخدام
                                    </h4>
                                    <ul className="text-xs text-slate-500 space-y-3 font-medium">
                                        <li className="flex gap-2"><span className="text-indigo-600 font-black">•</span> يفضل رفع النصوص بوضوح عالي في حالة الصور.</li>
                                        <li className="flex gap-2"><span className="text-indigo-600 font-black">•</span> التحليل يشمل استخراج البنود، تحديد المخاطر، واقتراح التحسينات.</li>
                                        <li className="flex gap-2"><span className="text-indigo-600 font-black">•</span> تأكد من مراجعة النتائج قانونياً قبل اتخاذ أي قرار.</li>
                                    </ul>
                                </Card>
                            </div>

                            {/* Result Column */ }
                            <div className="lg:col-span-7 space-y-6">
                                <AnimatePresence mode="wait">
                                    {error && (
                                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-red-50 border border-red-100 rounded-[2rem] flex items-center gap-4 text-red-600">
                                            <ExclamationTriangleIcon className="w-10 h-10 shrink-0"/>
                                            <div>
                                                <h4 className="font-black text-sm mb-1">حدث خطأ أثناء التحليل</h4>
                                                <p className="text-xs opacity-80">{error}</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {isLoading ? (
                                        <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 bg-white dark:bg-dm-card border shadow-inner rounded-[2.5rem]">
                                            <div className="relative">
                                                <div className="absolute inset-0 blur-3xl bg-indigo-600/20 rounded-full animate-pulse" />
                                                <LoadingSpinner className="w-20 h-20 text-indigo-600 relative z-10" />
                                            </div>
                                            <h3 className="text-xl font-black mt-8 text-slate-800 dark:text-white tracking-tight text-center">جاري مسح العقد وتحليله...</h3>
                                            <p className="text-slate-500 font-medium mt-2 text-center">يتم الآن استخدام محرك Gemini 1.5 الذكي لاستخراج الثغرات والملاحظات</p>
                                            <div className="mt-12 w-full max-w-sm bg-slate-100 rounded-full h-2 overflow-hidden">
                                                <motion.div className="bg-indigo-600 h-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 15, ease: "linear" }} />
                                            </div>
                                        </motion.div>
                                    ) : analysisResult ? (
                                        <motion.div key="results" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 print-area">
                                            {/* Summary Card */ }
                                            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                                                <div className="p-8 border-b border-slate-50 flex justify-between items-center print-hide">
                                                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                                                        <ClipboardListCheckIcon className="w-6 h-6 text-indigo-600"/> تقرير مراجعة العقد
                                                    </h3>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" className="rounded-xl font-black" leftIcon={<PrinterIcon className="w-4 h-4"/>} onClick={handlePrint}>طباعة التقرير</Button>
                                                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => setAnalysisResult(null)}><ArrowUturnLeftIcon className="w-4 h-4"/></Button>
                                                    </div>
                                                </div>
                                                
                                                <div className="p-8 space-y-8">
                                                    <div>
                                                        <SectionHeader title="الملخص التنفيذي" icon={<InformationCircleIcon className="w-5 h-5 text-indigo-600"/>} />
                                                        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                            <p className="text-slate-700 dark:text-slate-300 leading-8 text-[15px] font-medium whitespace-pre-wrap">{analysisResult.summary}</p>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-900/30">
                                                            <h4 className="text-[10px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-widest mb-3">التقييم العام للمخاطر</h4>
                                                            <div className="flex items-center gap-4">
                                                                <RiskLevelBadge level={analysisResult.overallRiskAssessment} size="sm" className="h-12 px-6 text-base shadow-lg" />
                                                                <span className="font-black text-slate-800 dark:text-white text-lg">{analysisResult.overallRiskAssessment}</span>
                                                            </div>
                                                        </div>
                                                        <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 rounded-3xl border border-emerald-100 dark:border-emerald-900/30">
                                                            <h4 className="text-[10px] font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-widest mb-3">عناصر تم فحصها</h4>
                                                            <div className="flex items-center gap-4">
                                                                <div className="p-3 bg-white dark:bg-dm-card rounded-2xl shadow-sm font-black text-emerald-600 text-xl">{analysisResult.extractedClauses.length}</div>
                                                                <span className="font-black text-slate-800 dark:text-white">بند قانوني رئيسي</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Risk Breakdown Chart Style */ }
                                                    <div className="space-y-4">
                                                        <h4 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                                                            <ShieldExclamationIcon className="w-5 h-5 text-indigo-600"/> توزيع مخاطر البنود
                                                        </h4>
                                                        <div className="grid grid-cols-3 gap-2 h-3 rounded-full overflow-hidden bg-slate-100">
                                                            <div 
                                                                className="bg-emerald-500 transition-all" 
                                                                style={{ width: `${(analysisResult.extractedClauses.filter(c => c.risk === 'منخفض').length / analysisResult.extractedClauses.length) * 100}%` }} 
                                                            />
                                                            <div 
                                                                className="bg-yellow-500 transition-all" 
                                                                style={{ width: `${(analysisResult.extractedClauses.filter(c => c.risk === 'متوسط').length / analysisResult.extractedClauses.length) * 100}%` }} 
                                                            />
                                                            <div 
                                                                className="bg-red-500 transition-all" 
                                                                style={{ width: `${(analysisResult.extractedClauses.filter(c => (c.risk === 'مرتفع' || c.risk === 'حرج')).length / analysisResult.extractedClauses.length) * 100}%` }} 
                                                            />
                                                        </div>
                                                        <div className="flex justify-between text-[10px] font-black text-slate-400 px-1">
                                                            <span className="text-emerald-600">منخفضة: {analysisResult.extractedClauses.filter(c => c.risk === 'منخفض').length}</span>
                                                            <span className="text-yellow-600">متوسطة: {analysisResult.extractedClauses.filter(c => c.risk === 'متوسط').length}</span>
                                                            <span className="text-red-600">عالية/حرجة: {analysisResult.extractedClauses.filter(c => (c.risk === 'مرتفع' || c.risk === 'حرج')).length}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>

                                            {/* Detailed Clauses */ }
                                            <SectionHeader title="تحليل البنود القانونية" icon={<LightBulbIcon className="w-5 h-5 text-indigo-600"/>} className="px-4" />
                                            <div className="grid grid-cols-1 gap-4">
    {analysisResult.extractedClauses.map((clause, idx) => (
        <motion.div 
            key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
        >
            <Card className="border-none shadow-lg rounded-3xl group hover:ring-2 hover:ring-indigo-600/10 transition-all">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">{idx + 1}</span>
                            <h4 className="font-black text-slate-800 dark:text-white">{clause.title}</h4>
                        </div>
                        <RiskLevelBadge level={clause.risk} />
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/20 rounded-2xl text-[13px] text-slate-600 dark:text-slate-400 font-medium leading-7 whitespace-pre-wrap mb-4 border border-transparent group-hover:border-slate-200 transition-all">
                        {clause.content}
                    </div>
                    
                    {clause.aiRecommendation && (
                        <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border-r-4 border-indigo-600 mb-4">
                            <div className="flex items-center gap-2 text-[11px] text-indigo-700 dark:text-indigo-300 font-black mb-1">
                                <SparklesIcon className="w-4 h-4"/>
                                توصية الذكاء الاصطناعي
                            </div>
                            <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400 font-medium leading-5">
                                {clause.aiRecommendation}
                            </p>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-xl text-[10px] font-black h-8 text-amber-600 hover:bg-amber-50"
                            leftIcon={<SparklesIcon className="w-3 h-3"/>}
                            onClick={() => handleDeepAnalyzeClause(clause)}
                        >
                            تحليل قانوني معمق
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-xl text-[10px] font-black h-8 text-indigo-600 hover:bg-indigo-50"
                            leftIcon={<ArrowUturnLeftIcon className="w-3 h-3 rotate-180"/>}
                            onClick={() => handleApplyClauseToEditor(clause)}
                        >
                            نقل للمحرر للتعديل
                        </Button>
                    </div>
                </div>
            </Card>
        </motion.div>
    ))}
</div>

                                            {/* AI Recommendations */ }
                                            <div className="space-y-6">
                                                <Card className="border-none shadow-2xl rounded-[2.5rem] bg-indigo-900 text-white overflow-hidden p-8 relative">
                                                    <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -ml-32 -mt-32" />
                                                    <div className="flex items-center gap-4 mb-8 relative z-10">
                                                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                                                            <GavelIcon className="w-8 h-8 text-indigo-200" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-black tracking-tight">الرأي القانوني والمشورة الذكية</h3>
                                                            <p className="text-[10px] font-black text-indigo-300/60 uppercase">الولاية القضائية: {jurisdiction}</p>
                                                        </div>
                                                    </div>
                                                    <div className="relative z-10">
                                                        <div className="p-8 rounded-[2rem] bg-indigo-950/40 backdrop-blur-sm border border-white/10 leading-9 text-slate-100 font-medium whitespace-pre-wrap">
                                                            {analysisResult.legalAdvice || "يتم جاري معالجة الرأي القانوني المخصص..."}
                                                        </div>
                                                    </div>
                                                </Card>

                                                <Card className="border-none shadow-xl rounded-[2.5rem] bg-slate-100 dark:bg-dm-card overflow-hidden p-8 relative border-l-4 border-indigo-600">
                                                    <div className="flex items-center gap-3 mb-6 relative z-10">
                                                        <span className="text-indigo-600 bg-indigo-50 p-2 rounded-xl"><ClipboardListCheckIcon className="w-5 h-5"/></span>
                                                        <h3 className="text-lg font-black tracking-tight text-slate-800 dark:text-white">توصيات إضافية</h3>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                                                        {analysisResult.recommendations.map((rec, i) => (
                                                            <div key={i} className="flex gap-3 p-4 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                                                                <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                                                                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold leading-5">{rec}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </Card>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-12 bg-white dark:bg-dm-card/30 border border-dashed border-slate-200 rounded-[2.5rem] text-slate-400">
                                            <SparklesIcon className="w-20 h-20 mb-6 opacity-10" />
                                            <h3 className="text-lg font-black tracking-tight text-center">بانتظار إدخال العقد...</h3>
                                            <p className="text-sm font-medium mt-2 text-center max-w-xs">قم بإدخال النص في اللوحة الجانبية لتبدأ عملية المراجعة القانونية الذكية</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
                {view === 'library' && (
                    <motion.div key="library" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">المكتبة القانونية الذكية</h3>
                            <p className="text-slate-500 font-bold">تصفح القوانين، السوابق، والقوالب المعتمدة</p>
                        </div>
                        <LegalLibrary />
                    </motion.div>
                )}

                {view === 'editor' && (
                    <motion.div 
                        key="editor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} 
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                    >
                        {/* Sidebar */ }
                        <div className="lg:col-span-3 space-y-6 print-hide">
                            <Card className="border-none shadow-xl rounded-[2.5rem] p-6 bg-slate-900 text-white overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 rounded-full blur-2xl -mr-16 -mt-16" />
                                <h3 className="text-[11px] font-black border-b border-white/10 pb-4 mb-6 flex items-center gap-3">
                                    <BookOpenIcon className="w-5 h-5 text-indigo-400"/> مكتبة القوالب
                                </h3>
                                <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-none pr-1">
                                    {templates.map(tpl => (
                                        <button 
                                            key={tpl.id} 
                                            className={`w-full group text-right p-4 rounded-2xl transition-all border ${selectedTemplateId === tpl.id ? 'bg-indigo-600 border-indigo-500 shadow-xl' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                            onClick={() => handleApplyTemplate(tpl.id)}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className={`text-[9px] uppercase font-black tracking-widest ${selectedTemplateId === tpl.id ? 'text-white' : 'text-indigo-400'}`}>{tpl.category}</span>
                                                {selectedTemplateId === tpl.id && <CheckCircleIcon className="w-4 h-4 text-white"/>}
                                            </div>
                                            <span className="font-black text-[13px] text-inherit line-clamp-1">{tpl.name}</span>
                                        </button>
                                    ))}
                                    
                                    <button 
                                        className="w-full text-right p-4 rounded-2xl border-2 border-dashed border-white/10 text-white/50 hover:border-indigo-400 hover:text-indigo-400 transition-all flex items-center justify-center gap-3 font-black text-xs"
                                        onClick={() => { setEditorContent('<div style="direction: rtl; text-align: right;"><h1>العنوان هنا</h1><p>اكتب محتوى العقد...</p></div>'); setSelectedTemplateId('custom'); }}
                                    >
                                        <PlusCircleIcon className="w-5 h-5"/>
                                        إنشاء عقد من الصفر
                                    </button>
                                </div>
                            </Card>

                            <AnimatePresence>
                                {extractedVariables.length > 0 && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                        <Card className="border-none shadow-xl rounded-[2.5rem] p-8">
                                            <h3 className="text-[11px] font-black border-b border-slate-100 pb-4 mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
                                                <CpuChipIcon className="w-5 h-5 text-indigo-600"/> تعبئة الحقول الذكية
                                            </h3>
                                            <div className="space-y-5">
                                                {extractedVariables.map(v => (
                                                    <div key={v} className="bg-slate-50 dark:bg-dm-card/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                        <label className="block text-[9px] text-slate-400 mb-2 font-black uppercase tracking-wider">{v.replace(/_/g, ' ')}</label>
                                                        <input 
                                                            className="w-full text-xs bg-transparent border-none focus:ring-0 font-medium text-slate-800 dark:text-white p-0"
                                                            placeholder={`أدخل ${v.replace(/_/g, ' ')}...`}
                                                            value={variableValues[v] || ''}
                                                            onChange={(e) => handleVariableChange(v, e.target.value)}
                                                        />
                                                    </div>
                                                ))}
                                                <Button variant="primary" fullWidth onClick={replaceVariables} className="mt-4 rounded-2xl h-12 font-black shadow-lg shadow-indigo-100">تطبيق التغييرات</Button>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Editor Canvas */ }
                        <div className="lg:col-span-9 space-y-6">
                            <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden min-h-[85vh] flex flex-col">
                                <div className="p-6 bg-slate-50 dark:bg-dm-card/50 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4 print-hide">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-white dark:bg-dm-card rounded-2xl shadow-sm">
                                            <PencilIcon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-slate-800 dark:text-white">منصة صياغة العقود</h3>
                                            <p className="text-[10px] text-slate-400 font-bold">بناء وتخصيص الوثائق القانونية</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <Button 
                                            variant="ghost" 
                                            size="md" 
                                            className="rounded-2xl font-black text-indigo-600 hover:bg-indigo-50" 
                                            leftIcon={isCorrecting ? <LoadingSpinner size="sm" color="text-indigo-600" /> : <CheckCircleIcon className="w-5 h-5"/>} 
                                            onClick={() => handleCorrectGrammar('editor')}
                                            disabled={isCorrecting || !editorContent.replace(/<[^>]*>/g, '').trim()}
                                        >
                                            تدقيق لغوي
                                        </Button>
                                        <Button variant="outline" size="md" className="rounded-2xl font-black bg-white dark:bg-dm-card shadow-sm" leftIcon={<SaveIcon className="w-5 h-5 text-indigo-600"/>} onClick={handleSaveAsTemplate} isLoading={isSaving}>حفظ المسودة</Button>
                                        <Button variant="primary" size="md" className="rounded-2xl font-black shadow-lg shadow-indigo-100" leftIcon={<PrinterIcon className="w-5 h-5"/>} onClick={handlePrint}>تصدير PDF</Button>
                                    </div>
                                </div>
                                
                                <div className="flex-grow bg-white rtl-quill relative">
                                    <div className="absolute top-4 right-4 pointer-events-none z-0 flex flex-col gap-8 opacity-5">
                                        <ScaleIcon className="w-64 h-64 text-indigo-900 rotate-12" />
                                    </div>
                                    <ReactQuill 
                                        theme="snow" 
                                        value={editorContent} 
                                        onChange={setEditorContent} 
                                        className="h-full z-10 relative"
                                        placeholder="ابدأ بكتابة العقد هنا أو اختر قالباً من القائمة الجانبية لبدء التعديل..."
                                        modules={{
                                            toolbar: [
                                                [{ 'header': [1, 2, 3, false] }],
                                                ['bold', 'italic', 'underline', 'strike'],
                                                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                                [{ 'align': [] }],
                                                ['link'],
                                                ['clean']
                                            ]
                                        }}
                                    />
                                </div>
                                
                                <div className="p-4 bg-slate-50 dark:bg-dm-card/30 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-400 print-hide">
                                    <div className="flex gap-4">
                                        <span>كلمات: {editorContent.replace(/<[^>]*>/g, '').split(/\s+/).length}</span>
                                        <span>حروف: {editorContent.replace(/<[^>]*>/g, '').length}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span>الحفظ التلقائي نشط</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Deep Analysis Modal */}
            <Modal
                isOpen={isDeepAnalysisModalOpen}
                onClose={() => setIsDeepAnalysisModalOpen(false)}
                title={`التحليل الاستراتيجي: ${deepAnalysisClause?.title}`}
                size="xl"
            >
                <div className="space-y-6">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">النص الأصلي للبند</label>
                        <p className="text-sm text-slate-700 dark:text-slate-300 font-medium italic">{deepAnalysisClause?.content}</p>
                    </div>

                    {isDeepAnalyzing ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <LoadingSpinner size="lg" className="text-indigo-600 mb-4" />
                            <p className="text-sm font-black text-slate-500 animate-pulse">جاري تشريح البند قانونياً واستخراج البدائل...</p>
                        </div>
                    ) : (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-right" style={{ direction: 'rtl' }}>
                            <div className="p-6 bg-white dark:bg-dm-card rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                                <ReactMarkdown>{deepAnalysisContent}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button 
                            variant="secondary" 
                            className="rounded-xl font-black" 
                            onClick={() => setIsDeepAnalysisModalOpen(false)}
                        >
                            إغلاق
                        </Button>
                        <Button 
                            variant="primary" 
                            className="rounded-xl font-black"
                            leftIcon={<ClipboardListCheckIcon className="w-5 h-5" />}
                            onClick={() => {
                                setEditorContent(prev => prev + `<div style="direction: rtl; text-align: right; background: #f0f9ff; padding: 20px; border-radius: 12px; margin-top: 20px;"><h3>بديل مقترح لـ ${deepAnalysisClause?.title}</h3>${deepAnalysisContent.replace(/\n/g, '<br/>')}</div>`);
                                setIsDeepAnalysisModalOpen(false);
                                setView('editor');
                            }}
                            disabled={isDeepAnalyzing}
                        >
                            نقل المقترح للمحرر
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ContractAnalysisPage;
