import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    ZoomIn, ZoomOut, Search, Printer, BookOpen, Clock, 
    MessageSquare, AlertTriangle, CheckCircle, ShieldAlert,
    X, Sparkles, Plus, Clipboard, Landmark, Scale, Share2, CornerDownLeft
} from 'lucide-react';
import { useToast } from '../ui/Toast';
import { AnalyzedContract, RiskLevel } from '../../types';

interface Annotation {
    id: string;
    clauseIndex: number;
    author: string;
    type: 'legal' | 'hr' | 'finance';
    comment: string;
    date: string;
}

interface SmartDocumentViewerProps {
    viewerText: string;
    setViewerText: (text: string) => void;
    zoomScale: number;
    setZoomScale: (scale: number) => void;
    annotations: Annotation[];
    setAnnotations: React.Dispatch<React.SetStateAction<Annotation[]>>;
    selectedParagraph: number;
    setSelectedParagraph: (idx: number) => void;
    onRunAI: () => void;
    isLoading: boolean;
    isSealed: boolean;
    applySealStampWithAnimation: () => void;
    isSealing: boolean;
    contractStrengthScore: number;
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    analysisSource: 'text' | 'file' | 'import';
    setAnalysisSource: (src: 'text' | 'file' | 'import') => void;
    systemEmployees: any[];
    systemProperties: any[];
    systemLitigations: any[];
    handleImportFromSystem: (type: 'employee' | 'property' | 'litigation', id: string) => void;
}

export const SmartDocumentViewer: React.FC<SmartDocumentViewerProps> = ({
    viewerText,
    setViewerText,
    zoomScale,
    setZoomScale,
    annotations,
    setAnnotations,
    selectedParagraph,
    setSelectedParagraph,
    onRunAI,
    isLoading,
    isSealed,
    applySealStampWithAnimation,
    isSealing,
    contractStrengthScore,
    selectedFile,
    setSelectedFile,
    handleFileUpload,
    analysisSource,
    setAnalysisSource,
    systemEmployees,
    systemProperties,
    systemLitigations,
    handleImportFromSystem
}) => {
    const { addToast } = useToast();
    const [searchText, setSearchText] = useState('');
    const [newAnnotation, setNewAnnotation] = useState('');
    const [newAnnotationType, setNewAnnotationType] = useState<'legal' | 'hr' | 'finance'>('legal');
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Splitted clauses index for smooth navigation
    const structuredClauses = useMemo(() => {
        return viewerText.split('\n\n')
            .map((p, idx) => {
                const trimmed = p.trim();
                let title = `البند ${idx + 1}`;
                if (trimmed.startsWith('بند') || trimmed.startsWith('البند')) {
                    const matched = trimmed.match(/^(بند\s+\d+|البند\s+\d+)/);
                    if (matched) title = matched[0];
                } else if (idx === 0) {
                    title = 'الديباجة والتأسيس';
                }
                return { title, index: idx, snippet: trimmed.substring(0, 40) + (trimmed.length > 40 ? '...' : '') };
            })
            .filter(item => item.snippet.length > 3);
    }, [viewerText]);

    const handleAddAnnotation = () => {
        if (!newAnnotation.trim()) return;
        const comment: Annotation = {
            id: `a-${Date.now()}`,
            clauseIndex: selectedParagraph,
            author: 'الأستاذ صبري شطا (مستشار امتثال أول)',
            type: newAnnotationType,
            comment: newAnnotation,
            date: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' }) + ' - اليوم'
        };
        setAnnotations([comment, ...annotations]);
        setNewAnnotation('');
        addToast({ 
            type: 'success', 
            title: 'تمت إضافة الهامش القانوني', 
            message: `تم قيد تعليق التدقيق على البند ${selectedParagraph + 1} بنجاح.` 
        });
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            setSelectedFile(file);
            simulateFileExtraction(file);
        }
    };

    const simulateFileExtraction = (file: File) => {
        addToast({
            type: 'info',
            title: 'جاري فك تشفير الملف',
            message: `يتم معالجة ${file.name} عبر محرّك تحويل المستندات والتعرف على الأحرف (OCR)...`
        });
        
        setTimeout(() => {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            let extractedText = `بموجب أحكام المرسوم بقانون رقم 6 لسنة 2010 بشأن العمل في القطاع الأهلي الكويتي ولوائحه التنفيذية.

العقد المرفع رقمياً: ${file.name}
تاريخ الأرشفة التلقائية بعد معالجة الملف: 2026-05-25

أطراف التعاقد:
الطرف الأول: شركة الأنظمة الرقمية المتقدمة بدولة الكويت (برج كيبكو) ويمثلها المفوض بالإدارة.
الطرف الثاني: الموظف المستهدف (صاحب السجل المهني المستورد).

البنود والشروط المستخلصة والمدققة:
البند الأول: الراتب والتعويض المالي الأساسي
يستحق الموظف حزمة مالية شهرية قدرها 1,250 دينار كويتي شامل جميع البدلات الأساسية وتدرج في حساب البنك الكويتي بانتظام.

البند الثاني: فترة التجربة (مادة 17)
يخضع الموظف لفترة تجربة قدرها 90 يوماً متواصلة (أيام عمل فعلية). لا يجوز لأي طرف إنهاء العلاقة دون مبرر مالم تكن ضمن السقف القانوني البالغ 100 يوم.

البند الثالث: ساعات العمل والراحة الأسبوعية (مادة 64)
تكون ساعات العمل الرسمية 45 ساعة عمل أسبوعية، موزعة على 5 أيام عمل، ويستحق العامل يومين راحة أسبوعية مدفوعة الأجر بالكامل.

البند الرابع: مكافأة نهاية الخدمة
تخضع مكافأة نهاية الخدمة للأحكام المحددة في المادة 51 من قانون العمل الكويتي رقم 6 لسنة 2010؛ حيث يستحق الموظف مكافأة كاملة عن سنوات الخدمة الفعلية المقررة بالقانون.
`;
            if (ext === 'docx' || ext === 'doc') {
                extractedText = `عقد تشغيل وصياغة اتفاقية استشارية متخصصة (مستخرج من ملف Word)
محرر في دولة الكويت بتاريخ 25 مايو 2026.

أولاً: شركة عدالة للاستشارات القانونية والشرعية بدولة الكويت.
ثانياً: السيد/ فيصل عبدالرحمن الشمري (كويتي الجنسية، بطاقة مدنية 290080302918).

بند 1: الغرض ونطاق الخدمة
يعين الطرف الأول الطرف الثاني بصفة مستشار مالي وتقني براتب مقطوع قدره 1,100 د.ك شهرياً.

بند 2: سرية البيانات وحظر المنافسة (مادة 42)
يحظر على الطرف الثاني إفشاء أي معلومات سرية أو العمل لدى شركة منافسة داخل العاصمة الكويت وضواحيها لمدة سنتين بعد انقضاء مدة العقد تلافياً للعقوبات المقررة.

بند 3: تسوية المنازعات وموقع التقاضي
تخضع جميع الخلافات الناشئة عن هذا المستند لأحكام محكمة الرقعي للأمور المستعجلة وبموجب القانون المدني الكويتي وقانون التجارة.`;
            } else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') {
                extractedText = `[التعرف الضوئي الضوئي المتقدم للصور OCR]
عقد عمل نموذجي موثق
التاريخ: 2025-05-15 (مستخلص من صورة ضوئية)

الطرف الأول: مجموعة الساير القابضة الكويتية
الطرف الثاني: السيدة/ سارة خالد الكندري (الرقم المدني 295091204859)

بند 1: المسمـى والراتـب
مدير قسم الحسابات والتدقيق، براتب شهري يبلغ 1,400 د.ك دينار كويتي تدفع في أول كل شهر.

بند 2: الإجازات السنوية (مادة 70)
تستحق العاملة إجازة سنوية مدفوعة الأجر قدرها 30 يوماً عمل بعد إتمام فترة تسعة أشهر متصلة من خدمة الطرف الأول.

بند 3: إنهاء العقد غير محدد المدة (مادة 44)
يلتزم الطرف المتسبب بفسخ العقد بتوجيه إخطار كتابي رسمي قبل ثلاثة أشهر كاملة تلافياً لغرامة الإنذار التعويضية المقررة قانوناً.`;
            } else if (ext === 'txt') {
                extractedText = `وثيقة عقد عمل من ملف نصي حر غير محدد التنسيق

الشروط والمطابقة القانونية:
الطرفان: مجموعة الغانم والشركة الزميلة ضد العامل الفني.
الدخل الشهري: 850 دينار كويتي.
ساعات العمل الأسبوعية: 48 ساعة أسبوعياً.
فترة الاختبار: 100 يوم عمل متوافقة تماماً مع قانون العمل الكويتي القطاع الأهلي.
الإجازات السنوية المرصودة: 35 يوماً عمل.
الشروط الخاصة: يحظر على العامل ممارسة المهنة الحرة طيلة مدة التوظيف.`;
            }

            setViewerText(extractedText);
            addToast({
                type: 'success',
                title: 'اكتمل التحويل والتنميط الرقمي',
                message: `تم بنجاح قراءة المستند وتحويله إلى صيغة قانونية موحدة في عارض المستندات.`
            });
        }, 1200);
    };

    return (
        <div id="smart-document-viewer-container" className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            {/* Left Controls & Import Area */}
            <div className="xl:col-span-4 space-y-6">
                <div className="bg-white dark:bg-dm-card p-6 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800/80 space-y-5">
                    <div>
                        <h3 className="text-md font-black text-slate-800 dark:text-white flex items-center gap-2">
                            <Plus className="w-5 h-5 text-indigo-600" /> مجمع جلب واستيراد المستندات
                        </h3>
                        <p className="text-[11px] text-slate-500 font-bold mt-1">
                            نظام كويتي ذكي يمنهج ويحول جميع الصيغ لعقد ذكي معياري
                        </p>
                    </div>

                    {/* Toggle Import Source Method */}
                    <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800">
                        <button 
                            onClick={() => setAnalysisSource('text')}
                            className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${analysisSource === 'text' ? 'bg-white dark:bg-dm-card text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            تحرير حر
                        </button>
                        <button 
                            onClick={() => setAnalysisSource('file')}
                            className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${analysisSource === 'file' ? 'bg-white dark:bg-dm-card text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            رفع ملف ذكي
                        </button>
                        <button 
                            onClick={() => setAnalysisSource('import')}
                            className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${analysisSource === 'import' ? 'bg-white dark:bg-dm-card text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            استيراد من النظام
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {analysisSource === 'text' && (
                            <motion.div 
                                key="src-text" 
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -5 }}
                                className="space-y-4"
                            >
                                <textarea
                                    value={viewerText}
                                    onChange={(e) => setViewerText(e.target.value)}
                                    rows={8}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-xs font-semibold leading-relaxed focus:ring-2 focus:ring-indigo-600 transition-colors text-right"
                                    placeholder="يرجى إدخال أو تحرير نصوص العقد وبنوده هنا للمطابقة وقراءة الامتثال..."
                                />
                            </motion.div>
                        )}

                        {analysisSource === 'file' && (
                            <motion.div 
                                key="src-file" 
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -5 }}
                                className="space-y-4"
                            >
                                <div 
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-[2rem] p-8 text-center transition-all cursor-pointer group flex flex-col items-center justify-center space-y-4 ${
                                        isDragOver 
                                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-inner' 
                                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-900/30'
                                    }`}
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleFileUpload}
                                        className="hidden" 
                                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
                                    />
                                    <div className="p-4 bg-white dark:bg-dm-card rounded-2xl shadow-md group-hover:scale-110 transition-transform">
                                        <Clipboard className="w-8 h-8 text-indigo-600" />
                                    </div>
                                    <div>
                                        <h5 className="text-xs font-black text-slate-700 dark:text-slate-300">
                                            اسحب وارمِ أي عقد هنا للمعالجة
                                        </h5>
                                        <p className="text-[10px] text-slate-400 font-bold mt-1 max-w-[220px] mx-auto leading-relaxed">
                                            تحسين فوري وقرار فك ضوئي للروابط الممسوحة ضوئياً وصور الموبايل والملفات بجميع أنواعها
                                        </p>
                                    </div>
                                    <span className="inline-block px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg">
                                        تصفح ملفات الجهاز
                                    </span>
                                </div>

                                {selectedFile && (
                                    <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border-r-4 border-indigo-600 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-lg">
                                                <BookOpen className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-indigo-950 dark:text-indigo-300 leading-none truncate max-w-[150px]">
                                                    {selectedFile.name}
                                                </p>
                                                <span className="text-[10px] text-indigo-600/70 font-semibold font-sans mt-0.5 block">
                                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setSelectedFile(null); 
                                                setViewerText(''); 
                                            }} 
                                            className="text-rose-500 hover:text-rose-700 p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {analysisSource === 'import' && (
                            <motion.div 
                                key="src-import" 
                                initial={{ opacity: 0, y: 5 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, y: -5 }}
                                className="space-y-4"
                            >
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 px-1 mb-1 block">
                                            قاعدة بيانات الموظفين (HR)
                                        </label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-bold h-10 px-3 rounded-xl focus:ring-2 focus:ring-indigo-600"
                                            onChange={(e) => {
                                                if(e.target.value) handleImportFromSystem('employee', e.target.value);
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>اختر سجلاً لموظف فيصل أو أحمد أو سارة...</option>
                                            {systemEmployees.map(e => (
                                                <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 px-1 mb-1 block">
                                            الممتلكات والعقارات وإيجارات الأملاك
                                        </label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-bold h-10 px-3 rounded-xl focus:ring-2 focus:ring-indigo-600"
                                            onChange={(e) => {
                                                if(e.target.value) handleImportFromSystem('property', e.target.value);
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>اختر مكتباً أو دكان تجاري بمجمّعات الشركة...</option>
                                            {systemProperties.map(p => (
                                                <option key={p.id} value={p.id}>{p.title} - المستأجر: {p.tenant}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-slate-400 px-1 mb-1 block">
                                            ملفات النزاعات والقضايا العمالية
                                        </label>
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs font-bold h-10 px-3 rounded-xl focus:ring-2 focus:ring-indigo-600"
                                            onChange={(e) => {
                                                if(e.target.value) handleImportFromSystem('litigation', e.target.value);
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>اختر ملف منازعة أو ادعاء قضائي عمالي...</option>
                                            {systemLitigations.map(l => (
                                                <option key={l.id} value={l.id}>{l.id}: {l.title}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <button 
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl h-11 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-650/15 transition-all"
                            onClick={onRunAI}
                            disabled={isLoading || !viewerText.trim()}
                        >
                            {isLoading ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                                <Sparkles className="w-4 h-4 text-indigo-200" />
                            )}
                            تفعيل الفحص والتحليل القانوني للبنود (AI)
                        </button>
                        <p className="text-[9px] text-slate-400 font-bold text-center animate-pulse">
                            يتم قراءة الصك ومطابقة التوافق مع مرسوم قانون العمل الكويتي 6/2010 والملحق المدني
                        </p>
                    </div>
                </div>

                {/* Left Live compliance metrics card */}
                <div className="bg-slate-950 text-white p-6 rounded-[2.5rem] shadow-xl border border-slate-900 space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-indigo-400 flex items-center gap-1.5 leading-none">
                            <Scale className="w-4 h-4" /> فحص الامتثال الكويتي الفوري
                        </span>
                        <span className="text-[10px] font-black bg-indigo-950/80 text-indigo-300 px-2.5 py-0.5 rounded-full">
                            أمان: {contractStrengthScore}%
                        </span>
                    </div>

                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                                contractStrengthScore > 80 ? 'bg-emerald-500' : contractStrengthScore > 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${contractStrengthScore}%` }}
                        />
                    </div>

                    {/* Quick indicator checklists of the active text content */}
                    <div className="space-y-3 pt-2">
                        <div className="text-[10px] font-semibold text-slate-400 border-b border-slate-800 pb-2">سجل نقاط فحص المحتوى الحركي:</div>
                        
                        <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl text-[10px] font-bold">
                            <span className="text-slate-300">أيام فترة التجربة (الحد الأقصى ١٠٠ يوم)</span>
                            <span className={viewerText.includes('١٢٠') || viewerText.includes('120') ? 'text-rose-450' : 'text-emerald-450'}>
                                {viewerText.includes('١٢٠') || viewerText.includes('120') ? 'مخالف (١٢٠ يوم)' : 'آمن (<= ١٠٠)'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl text-[10px] font-bold">
                            <span className="text-slate-300">ساعات العمل الأسبوعية (الأقصى ٤٨ ساعة)</span>
                            <span className={viewerText.includes('٥٠') || viewerText.includes('50') || viewerText.includes('٦٠') || viewerText.includes('60') ? 'text-rose-450' : 'text-emerald-450'}>
                                {viewerText.includes('٥٠') || viewerText.includes('50') || viewerText.includes('٦٠') || viewerText.includes('60') ? 'مخالف (>٤٨ ساعة)' : 'آمن (٤٥-٤٨)'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center bg-white/5 p-2 rounded-xl text-[10px] font-bold">
                            <span className="text-slate-300">الحد الأدنى للإجازة السنوية (٣٠ يوماً)</span>
                            <span className={viewerText.includes('١٥') || viewerText.includes('15') || viewerText.includes('٢٠') || viewerText.includes('20') ? 'text-rose-450' : 'text-emerald-450'}>
                                {viewerText.includes('١٥') || viewerText.includes('15') || viewerText.includes('٢٠') || viewerText.includes('20') ? 'مخالف (أقل من ٣٠ يوم)' : 'آمن (٣٠ يوماً فأكثر)'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Interactive Legal Document Viewer Panel */}
            <div className="xl:col-span-8 space-y-6">
                <div className="bg-white dark:bg-dm-card p-6 lg:p-8 rounded-[2.5rem] shadow-xl border border-slate-100 dark:border-slate-800/80 relative">
                    
                    {/* Professional Document Viewer Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800/70">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 rounded-2xl">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-800 dark:text-white">المخطوط والشاش عارض الوثائق القانونية</h4>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                    اضغط على أي بند أو فقرة لربط توجيه تدقيق، أو مراجعة الهوامش المشتركة
                                </p>
                            </div>
                        </div>

                        {/* Interactive tool widgets inside document viewer */}
                        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                            {/* Live document internal search box */}
                            <div className="relative flex-1 sm:flex-none">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="بحث فوري في نصوص الوثيقة..."
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-[11px] font-bold h-9 w-full sm:w-44 pr-9 pl-3 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:bg-white text-right"
                                />
                            </div>

                            <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                                <button 
                                    onClick={() => setZoomScale(Math.max(70, zoomScale - 10))} 
                                    className="w-8 h-8 flex items-center justify-center text-xs font-black text-slate-500 hover:bg-white dark:hover:bg-dm-card rounded-lg"
                                >
                                    -
                                </button>
                                <span className="text-[10px] font-black w-12 text-center font-sans">
                                    {zoomScale}%
                                </span>
                                <button 
                                    onClick={() => setZoomScale(Math.min(150, zoomScale + 10))} 
                                    className="w-8 h-8 flex items-center justify-center text-xs font-black text-slate-500 hover:bg-white dark:hover:bg-dm-card rounded-lg"
                                >
                                    +
                                </button>
                            </div>

                            <button 
                                onClick={() => window.print()}
                                className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950/40 dark:hover:bg-slate-900 text-slate-500 border border-slate-100 dark:border-slate-800 rounded-xl transition-all"
                                title="طباعة مسودة التحليل"
                            >
                                <Printer className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Smooth Navigation and Index sidebar junto with the Document Body */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-6 min-h-[500px]">
                        
                        {/* Smooth index outline checklist */}
                        <div className="lg:col-span-1 bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-150/40 dark:border-slate-800/50 space-y-2 max-h-[500px] overflow-y-auto">
                            <span className="text-[10px] font-black text-slate-400 px-1 uppercase tracking-wider block mb-2">
                                فهرس بنود العقد المعالجة
                            </span>
                            <div className="space-y-1.5">
                                {structuredClauses.map((clause, index) => (
                                    <button
                                        key={clause.index}
                                        onClick={() => {
                                            setSelectedParagraph(clause.index);
                                            addToast({
                                                type: 'info',
                                                title: `انتقال سريع لقسم: ${clause.title}`,
                                                message: `تم التصفح التلقائي وتوجيه نافذة المراجعة لفقرة العقد المطلوبة.`
                                            });
                                        }}
                                        className={`w-full text-right p-2.5 rounded-xl transition-all text-[11px] font-bold block ${
                                            selectedParagraph === clause.index
                                                ? 'bg-indigo-650 text-white shadow-md shadow-indigo-600/10'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/40'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 justify-start">
                                            <CornerDownLeft className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate">{clause.title}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Interactive Court Document Visual Design Screen */}
                        <div className="lg:col-span-2 space-y-4 relative border-l border-slate-50 dark:border-slate-800/80 pl-4">
                            
                            {/* Kuwaiti Royal/Notary Traditional Double Dashed Margins Style Visualized Overlay */}
                            <div className="absolute top-0 right-10 bottom-0 w-0.5 bg-rose-500/25 border-r border-dashed border-rose-500/20 pointer-events-none" />
                            <div className="absolute top-0 right-11 bottom-0 w-0.5 bg-rose-500/15 border-r border-dashed border-rose-500/10 pointer-events-none" />

                            <div 
                                className="text-slate-800 dark:text-slate-200 transition-all leading-relaxed font-semibold pr-12 pl-2 space-y-5"
                                style={{ fontSize: `${(zoomScale / 100) * 12.5}px` }}
                            >
                                {viewerText.split('\n\n').map((para, idx) => {
                                    const hasSearch = searchText.trim() && para.toLowerCase().includes(searchText.toLowerCase());
                                    const isSelected = selectedParagraph === idx;

                                    return (
                                        <motion.p
                                            key={idx}
                                            onClick={() => setSelectedParagraph(idx)}
                                            className={`p-3.5 rounded-2xl cursor-pointer relative transition-all ${
                                                isSelected 
                                                ? 'bg-indigo-50/70 border-r-4 border-indigo-600 text-indigo-950 dark:bg-indigo-950/20 dark:text-indigo-100 shadow-sm'
                                                : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/40'
                                            }`}
                                        >
                                            {/* Scroll check indicators */}
                                            {isSelected && (
                                                <span className="absolute left-3 top-2.5 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full select-none">
                                                    نشط للتعليق
                                                </span>
                                            )}

                                            {hasSearch ? (
                                                <span dangerouslySetInnerHTML={{
                                                    __html: para.replace(
                                                        new RegExp(`(${searchText})`, 'gi'),
                                                        `<mark class="bg-yellow-250 border-b-2 border-yellow-500 text-slate-950 font-bold">$1</mark>`
                                                    )
                                                }} />
                                            ) : (
                                                para
                                            )}
                                        </motion.p>
                                    );
                                })}
                            </div>

                            {/* Royal Metallic Corporate/Legal Decrypt Seal Logo stamping graphics */}
                            {isSealed && (
                                <motion.div
                                    initial={{ scale: 2.5, rotate: 45, opacity: 0 }}
                                    animate={{ scale: 1, rotate: -15, opacity: 0.85 }}
                                    className="absolute bottom-12 left-12 border-4 border-double border-indigo-800 rounded-full w-36 h-36 flex flex-col items-center justify-center p-3 text-center text-indigo-800 select-none cursor-not-allowed uppercase font-black tracking-tight"
                                >
                                    <div className="text-[10px]">مجموعة الصناعات</div>
                                    <div className="text-sm font-black text-rose-600">ختم الامتثال</div>
                                    <div className="text-[8px]">٢٥ مايو ٢٠٢٦</div>
                                    <div className="text-[7px] tracking-widest font-mono text-indigo-700">Digital Approved</div>
                                </motion.div>
                            )}
                        </div>

                        {/* Annotations Margin Log & Input Forms */}
                        <div className="lg:col-span-1 space-y-5">
                            <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider mb-2">
                                هوامش التعليقات والملحوظات ({annotations.length})
                            </span>

                            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                                {annotations.map((comment) => (
                                    <div 
                                        key={comment.id}
                                        className={`p-3.5 rounded-2xl border text-[10px] space-y-2 shadow-sm ${
                                            comment.type === 'legal'
                                            ? 'bg-indigo-50/50 dark:bg-indigo-950/15 border-indigo-100/60 dark:border-indigo-900/30 text-indigo-950 dark:text-indigo-200'
                                            : comment.type === 'hr'
                                            ? 'bg-amber-50/60 dark:bg-amber-950/15 border-amber-100/60 text-amber-950 dark:text-amber-200'
                                            : 'bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-100 text-emerald-950 dark:text-emerald-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center border-b border-black/5 pb-1">
                                            <span className="font-black text-slate-700 dark:text-slate-350">
                                                البند {comment.clauseIndex + 1}
                                            </span>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${
                                                comment.type === 'legal' ? 'bg-indigo-600 text-white' : comment.type === 'hr' ? 'bg-amber-500 text-slate-900' : 'bg-emerald-600 text-white'
                                            }`}>
                                                {comment.type.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="font-semibold leading-relaxed text-slate-650 dark:text-slate-300">
                                            {comment.comment}
                                        </p>
                                        <div className="text-[8px] text-slate-450 dark:text-slate-500 font-bold block text-left">
                                            بقلم: {comment.author} | {comment.date}
                                        </div>
                                    </div>
                                ))}

                                {annotations.length === 0 && (
                                    <div className="text-center py-6 text-slate-400 text-[10px] font-medium">
                                        لا توجد تعليقات إدارية على مسودة العقد حتى الآن
                                    </div>
                                )}
                            </div>

                            {/* New annotation insertion console */}
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-3xl border border-slate-150/50 dark:border-slate-850 space-y-3">
                                <span className="text-[10px] font-black text-slate-500 block">
                                    أضف تعليقاً على البند {selectedParagraph + 1}
                                </span>
                                <textarea
                                    value={newAnnotation}
                                    onChange={(e) => setNewAnnotation(e.target.value)}
                                    placeholder={`اكتب رأيك المهني بخصوص البند ${selectedParagraph + 1} المظلل...`}
                                    className="w-full bg-white dark:bg-dm-card border border-slate-100 dark:border-slate-800 text-[11px] font-bold rounded-2xl p-3 leading-normal focus:ring-1 focus:ring-indigo-605"
                                    rows={3}
                                />
                                <div className="space-y-2">
                                    <select
                                        value={newAnnotationType}
                                        onChange={(e) => setNewAnnotationType(e.target.value as any)}
                                        className="w-full bg-white dark:bg-dm-card border border-slate-100 dark:border-slate-800 text-[10px] font-black h-8 px-2 rounded-xl"
                                    >
                                        <option value="legal">تدقيق المستشار المستعان به</option>
                                        <option value="hr">إمضاء الشؤون والموظفين</option>
                                        <option value="finance">قيود والتزامات المحاسبة</option>
                                    </select>
                                    <button
                                        onClick={handleAddAnnotation}
                                        disabled={!newAnnotation.trim()}
                                        className="w-full bg-indigo-650 hover:bg-slate-900 disabled:opacity-50 text-white text-[10px] font-black h-8 rounded-xl transition-all"
                                    >
                                        حفظ التعليق بالهامش
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
            
        </div>
    );
};
