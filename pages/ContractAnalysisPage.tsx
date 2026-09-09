import React, { useState, useMemo } from 'react';
import { useToast } from '../components/ui/Toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Modal from '../components/ui/Modal';
import { 
    FileText, Sparkles, Upload, ShieldCheck, ShieldAlert, AlertTriangle, 
    CheckCircle2, Printer, Download, RefreshCw, ArrowLeft, ArrowRight,
    Check, FileSpreadsheet, Plus, Trash2, Edit3, Search, Clock, 
    Scale, HelpCircle, Lock, Eye, Building, Users, FileSignature, Share2, ChevronRight, ChevronLeft
} from 'lucide-react';

// Data types for clause analysis
export interface ContractClause {
    id: string;
    clauseNumber: string;
    clauseTitle: string;
    currentText: string;
    analysisText: string;
    riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    statuteReference: string;
    proposedAmendment: string;
    isApplied: boolean;
}

export interface ContractTemplate {
    id: string;
    title: string;
    category: string;
    description: string;
    firstPartyDefault: string;
    secondPartyDefault: string;
    valueDefault: string;
    clauses: ContractClause[];
}

// Default Kuwaiti Contract Templates
const KUWAIT_CONTRACT_TEMPLATES: ContractTemplate[] = [
    {
        id: 'tpl-employment',
        title: 'عقد عمل محدد المدة - قانون العمل الكويتي رقم 6 لسنة 2010',
        category: 'شؤون الموظفين والعمل',
        description: 'عقد عمل معتمد يتضمن أحكام فترة التجربة والرواتب والإجازات وفق المادتين 17 و70.',
        firstPartyDefault: 'شركة مجموعة الصناعات الوطنية (صاحب العمل)',
        secondPartyDefault: 'أحمد محمود الصباح (الموظف)',
        valueDefault: '1,600 د.ك شهرياً',
        clauses: [
            {
                id: 'cl-1',
                clauseNumber: 'البند الأول',
                clauseTitle: 'المسمى الوظيفي ونطاق المهام',
                currentText: 'يعمل الطرف الثاني تحت إشراف وإدارة الطرف الأول بوظيفة مدير مشاريع، ويلتزم بتأدية واجباته بدقة وأمانة وفق الأصول.',
                analysisText: 'البند صريح ومكتمل النواحي الشكلية، وحدد العلاقة التبعية بشكل مطابق لقانون العمل.',
                riskLevel: 'LOW',
                statuteReference: 'المادة 14 من قانون العمل الكويتي رقم 6/2010',
                proposedAmendment: 'النص الحالي مطابق ومكتمل ولا يتطلب أي تعديل.',
                isApplied: true
            },
            {
                id: 'cl-2',
                clauseNumber: 'البند الثاني',
                clauseTitle: 'فترة التجربة والاختبار',
                currentText: 'تحدد فترة التجربة للعامل بأربعة أشهر (120 يوماً) غير مأجورة، ويحق لصاحب العمل إنهائها في أي وقت دون إخطار.',
                analysisText: 'ثغرة قانونية جوهرية: المادة 17 تحدد فترة التجربة بـ 100 يوم عمل فعلي كأحد أقصى ويجب أن تكون مأجورة بالكامل. الشرط الحالي باطل لمخالفته النظام العام.',
                riskLevel: 'HIGH',
                statuteReference: 'المادة 17 من قانون العمل الكويتي رقم 6 لسنة 2010',
                proposedAmendment: 'تكون فترة التجربة 90 يوماً عمل مأجورة بالكامل، وتخضع لأحكام المادة 17 من قانون العمل الكويتي.',
                isApplied: false
            },
            {
                id: 'cl-3',
                clauseNumber: 'البند الثالث',
                clauseTitle: 'دورية سداد الأجور والبدلات',
                currentText: 'يستحق الموظف راتباً قدره 1,600 د.ك، وتدفع المستحقات مرة كل شهرين بناءً على الميزانية المتاحة.',
                analysisText: 'مخالفة صريحة للمادة 56 بوجوب دفع أجور العمال الشهريين مرة على الأقل في كل شهر.',
                riskLevel: 'MEDIUM',
                statuteReference: 'المادة 56 من قانون العمل الكويتي',
                proposedAmendment: 'يتقاضى الطرف الثاني راتباً شهرياً مقداره 1,600 د.ك يدفع بانتظام في نهاية كل شهر ميلادي.',
                isApplied: false
            },
            {
                id: 'cl-4',
                clauseNumber: 'البند الرابع',
                clauseTitle: 'شرط عدم المنافسة وحظر العمل',
                currentText: 'يحظر على الموظف العمل لدى أي منافس في كافة دول الخليج العربي لمدة 5 سنوات بعد انتهاء العقد.',
                analysisText: 'شرط باطل ومجحف طبقاً لأحكام محكمة التمييز الكويتية لعمومية الحظر المكاني والزماني الشامل وتأثيره على حق الموظف في الكسب.',
                riskLevel: 'HIGH',
                statuteReference: 'المادة 83 من القانون المدني ومبادئ التمييز الكويتية',
                proposedAmendment: 'يقتصر حظر المنافسة على دولة الكويت ولمدة لا تتجاوز سنة واحدة فقط وفي ذات النشاط المباشر.',
                isApplied: false
            },
            {
                id: 'cl-5',
                clauseNumber: 'البند الخامس',
                clauseTitle: 'الإجازة السنوية مدفوعة الأجر',
                currentText: 'يستحق الموظف إجازة سنوية قدرها 15 يوماً بعد مرور سنتين من العمل المستمر.',
                analysisText: 'مخالفة صريحة للمادة 70 التي تقرر إجازة سنوية لا تقل عن 30 يوماً مدفوعة الأجر بعد 9 أشهر من الخدمة.',
                riskLevel: 'MEDIUM',
                statuteReference: 'المادة 70 من قانون العمل الكويتي',
                proposedAmendment: 'يستحق الموظف إجازة سنوية مدفوعة الأجر بالكامل قدرها 35 يوماً عمل سنوياً.',
                isApplied: false
            }
        ]
    },
    {
        id: 'tpl-lease',
        title: 'عقد إيجار تجاري واستثماري - برج الحمراء التجاري',
        category: 'عقارات وإيجارات',
        description: 'عقد إيجار مكاتب تجارية معتمد مطابق لمرسوم قانون الإيجارات الكويتي رقم 35 لسنة 1978.',
        firstPartyDefault: 'شركة مجمع الحمراء العقارية (المؤجر)',
        secondPartyDefault: 'شركة الحلول البرمجية الذكية (المستأجر)',
        valueDefault: '2,000 د.ك شهرياً',
        clauses: [
            {
                id: 'cl-101',
                clauseNumber: 'البند الأول',
                clauseTitle: 'العين المؤجرة والغرض من الاستغلال',
                currentText: 'يؤجر الطرف الأول للطرف الثاني المكتب رقم 32 المتموضع بالدور 32 ببرج الحمراء لاستغلاله كمقر إداري.',
                analysisText: 'البند محدد بوضوح ومكتمل الأوصاف النافية للجهالة.',
                riskLevel: 'LOW',
                statuteReference: 'المادة 2 من مرسوم قانون الإيجارات الكويتي',
                proposedAmendment: 'النص مطابق وأصيل.',
                isApplied: true
            },
            {
                id: 'cl-102',
                clauseNumber: 'البند الثاني',
                clauseTitle: 'زيادة الإيجار السنوية المنفردة',
                currentText: 'يحق للمؤجر زيادة الإيجار بنسبة 25% سنوياً بإرادته المنفردة دون الحاجة إلى موافقة المستأجر أو إخطار سابق.',
                analysisText: 'مخالفة صريحة لمرسوم الإيجارات رقم 35/1978 المعدل بالقانون 125/2023؛ إذ لا تجوز إعادة النظر في القيمة الإيجارية إلا بعد مرور 5 سنوات.',
                riskLevel: 'HIGH',
                statuteReference: 'المادة 11 من مرسوم قانون الإيجارات الكويتي',
                proposedAmendment: 'لا يجوز تعديل القيمة الإيجارية إلا بعد انقضاء 5 سنوات كاملة من العقد وطبقاً للنسب القانونية.',
                isApplied: false
            },
            {
                id: 'cl-103',
                clauseNumber: 'البند الثالث',
                clauseTitle: 'الإخلاء الجبري وقطع الخدمات',
                currentText: 'عند التأخر في سداد الإيجار لمدة 3 أيام، يحق للمؤجر إخلاء العين فوراً وقطع التيار الكهربائي والخدمات.',
                analysisText: 'مخالفة جسيمة للنظام العام؛ الإخلاء وقطع الخدمات لا يكونان إلا بحكم قضائي نهائي من دائرة مستعجل الإيجارات وفق المادة 20.',
                riskLevel: 'HIGH',
                statuteReference: 'المادة 20 من مرسوم قانون الإيجارات الكويتي',
                proposedAmendment: 'يخضع أي منازعة بشأن الإخلاء ودفع الإيجار لدائرة مستعجل الإيجارات بوزارة العدل الكويتي.',
                isApplied: false
            }
        ]
    },
    {
        id: 'tpl-construction',
        title: 'عقد مقاولة وإنشاءات هندسية - مشروع مجمع الأنشطة',
        category: 'عقود مقاولات وإنشاءات',
        description: 'عقد مقاولة وتوريد معتمد يتضمن أحكام الشرط الجزائي والضمان العشراتي وفق القانون المدني.',
        firstPartyDefault: 'مجموعة المرزوق العقارية (المالك)',
        secondPartyDefault: 'شركة الخليج للمقاولات العامة (المقاول)',
        valueDefault: '150,000 د.ك',
        clauses: [
            {
                id: 'cl-201',
                clauseNumber: 'البند الأول',
                clauseTitle: 'الشرط الجزائي عن التأخير في التسليم',
                currentText: 'يخصم من المقاول مبلغ 1,000 د.ك عن كل يوم تأخير في التسليم دون حد أقصى ودون إثبات الضرر.',
                analysisText: 'تخالف المادة 303 من القانون المدني الكويتي؛ حيث يحق للقاضي أو الخبير القائم بالدعوى تخفيض التعويض الاتفاقي المبالغ فيه.',
                riskLevel: 'HIGH',
                statuteReference: 'المادة 303 من القانون المدني الكويتي',
                proposedAmendment: 'تحدد غرامة التأخير بنسبة 0.5% أسبوعياً وبحد أقصى 10% من إجمالي قيمة العقد.',
                isApplied: false
            },
            {
                id: 'cl-202',
                clauseNumber: 'البند الثاني',
                clauseTitle: 'الإعفاء من الضمان العشراتي',
                currentText: 'يعفى المقاول والمهندس المصمم من أي مسؤولية عن تهدم المبنى أو العيوب الخفية بعد تسليم الأنشطة.',
                analysisText: 'شرط باطل بطلاناً مطلقاً لمخالفته المادة 692 من القانون المدني الكويتي التي تجعل الضمان العشراتي من النظام العام الذي لا يجوز الاتفاق على إعفائه.',
                riskLevel: 'HIGH',
                statuteReference: 'المادة 692 من القانون المدني الكويتي',
                proposedAmendment: 'يلتزم المقاول بالضمان العشراتي لسلامة الهيكل الإنشائي لمدة 10 سنوات كاملة من تاريخ التسليم النهائي.',
                isApplied: false
            }
        ]
    }
];

export default function ContractAnalysisPage() {
    const { addToast } = useToast();

    // Active Wizard Step (1: Upload/Input, 2: Smart Analysis, 3: Recommendations & Export)
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

    // Selected Contract Template
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('tpl-employment');
    const [inputMode, setInputMode] = useState<'template' | 'file' | 'text'>('template');

    // Contract Parties & Metadata
    const [firstParty, setFirstParty] = useState<string>('شركة مجموعة الصناعات الوطنية (صاحب العمل)');
    const [secondParty, setSecondParty] = useState<string>('أحمد محمود الصباح (الموظف)');
    const [contractValue, setContractValue] = useState<string>('1,600 د.ك شهرياً');
    const [rawContractText, setRawContractText] = useState<string>('');

    // Active Analysis Clauses State
    const [activeClauses, setActiveClauses] = useState<ContractClause[]>(
        KUWAIT_CONTRACT_TEMPLATES[0].clauses
    );

    // Dynamic Loading state
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
    const [isOfficialSealed, setIsOfficialSealed] = useState<boolean>(true);

    // Select Template Handler
    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplateId(templateId);
        const tpl = KUWAIT_CONTRACT_TEMPLATES.find(t => t.id === templateId);
        if (tpl) {
            setFirstParty(tpl.firstPartyDefault);
            setSecondParty(tpl.secondPartyDefault);
            setContractValue(tpl.valueDefault);
            setActiveClauses(JSON.parse(JSON.stringify(tpl.clauses)));
        }
    };

    // Simulated File Upload
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            addToast({
                type: 'info',
                title: 'جارٍ استخراج بنود العقد',
                message: `تم رفع الملف (${file.name}). جارٍ التحليل الآلي واستخلاص البنود...`
            });
            setIsAnalyzing(true);
            setTimeout(() => {
                setIsAnalyzing(false);
                addToast({
                    type: 'success',
                    title: 'تم استخراج بنود العقد',
                    message: 'تم تفكيك العقد إلى 5 بنود رئيسية وفحصها وفق القانون الكويتي.'
                });
            }, 1000);
        }
    };

    // Run AI Analysis & Go to Step 2
    const handleStartAnalysis = () => {
        setIsAnalyzing(true);
        addToast({
            type: 'info',
            title: 'بدء تحليل وحوكمة العقد',
            message: 'جارٍ مقارنة البنود مع التشريعات الكويتية ومبادئ محكمة التمييز...'
        });

        setTimeout(() => {
            setIsAnalyzing(false);
            setCurrentStep(2);
            addToast({
                type: 'success',
                title: 'اكتمل التحليل الذكي 🎯',
                message: 'تم تحديد الثغرات والمخاطر القانونية بنجاح.'
            });
        }, 800);
    };

    // Single Clause 1-Click Fix
    const handleApplyClauseFix = (clauseId: string) => {
        const updated = activeClauses.map(cl => {
            if (cl.id === clauseId) {
                return { ...cl, isApplied: true, riskLevel: 'LOW' as const };
            }
            return cl;
        });
        setActiveClauses(updated);

        const targetClause = activeClauses.find(c => c.id === clauseId);
        addToast({
            type: 'success',
            title: 'تم تطبيق التعديل القانوني ✨',
            message: `تم تصحيح (${targetClause?.clauseTitle}) ليتوافق تماماً مع التشريع الكويتي.`
        });
    };

    // Fix All Clauses at Once
    const handleFixAllClauses = () => {
        const updated = activeClauses.map(cl => ({ ...cl, isApplied: true, riskLevel: 'LOW' as const }));
        setActiveClauses(updated);
        addToast({
            type: 'success',
            title: 'تمت حوكمة كافة البنود 🪄',
            message: 'تم تصحيح جميع الثغرات والمخاطر والمستندات القانونية بضغطة واحدة.'
        });
    };

    // Calculate KPI metrics
    const metrics = useMemo(() => {
        const total = activeClauses.length;
        if (total === 0) return { compliancePercent: 100, highRisks: 0, mediumRisks: 0, appliedCount: 0 };

        const appliedCount = activeClauses.filter(c => c.isApplied).length;
        const highRisks = activeClauses.filter(c => !c.isApplied && c.riskLevel === 'HIGH').length;
        const mediumRisks = activeClauses.filter(c => !c.isApplied && c.riskLevel === 'MEDIUM').length;

        // Base score calculated from applied/low risk items
        const rawScore = Math.round((appliedCount / total) * 100);

        return {
            compliancePercent: rawScore,
            highRisks,
            mediumRisks,
            appliedCount,
            total
        };
    }, [activeClauses]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans transition-colors duration-300 rtl text-right" dir="rtl">
            
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-5">
                <div className="flex items-center gap-3.5">
                    <span className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xs">
                        <Scale className="w-7 h-7" />
                    </span>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                            تحليل وحوكمة العقود والبنود القانونية
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                            فحص العقود، كشف الثغرات والمخاطر، والتحقق من الامتثال للقوانين الكويتية بأسلوب مبسط وانسيابي
                        </p>
                    </div>
                </div>

                {/* Print/Export Shortcut */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsPrintModalOpen(true)}
                        className="text-xs font-bold rounded-xl flex items-center gap-1.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                    >
                        <Printer className="w-4 h-4 text-slate-500" />
                        معاينة التقرير والطباعة
                    </Button>
                </div>
            </div>

            {/* Clean KPI Dashboard Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                
                {/* Metric 1: Kuwait Law Compliance % */}
                <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">نسبة الامتثال القانوني</span>
                        <div className="flex items-baseline gap-2">
                            <span className={`text-2xl font-black ${metrics.compliancePercent >= 90 ? 'text-emerald-600' : metrics.compliancePercent >= 70 ? 'text-amber-500' : 'text-rose-600'}`}>
                                {metrics.compliancePercent}%
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {metrics.compliancePercent >= 90 ? 'ممتاز' : 'يتطلب تعديل'}
                            </span>
                        </div>
                    </div>
                    <div className={`p-3 rounded-2xl ${metrics.compliancePercent >= 90 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/50'}`}>
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                </Card>

                {/* Metric 2: Identified Risks */}
                <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">الثغرات والمخاطر المكتشفة</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-slate-900 dark:text-white">
                                {metrics.highRisks + metrics.mediumRisks}
                            </span>
                            <span className="text-[10px] text-rose-600 font-bold">
                                ({metrics.highRisks} عالي / {metrics.mediumRisks} متوسط)
                            </span>
                        </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600">
                        <AlertTriangle className="w-6 h-6" />
                    </div>
                </Card>

                {/* Metric 3: Applied Amendments */}
                <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">البنود المعدلة والمصححة</span>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black text-emerald-600">
                                {metrics.appliedCount} / {metrics.total}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">بند محوكم</span>
                        </div>
                    </div>
                    <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                        <CheckCircle2 className="w-6 h-6" />
                    </div>
                </Card>

                {/* Metric 4: Legal Governance Status */}
                <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between shadow-2xs">
                    <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">الحالة التشغيلية للعقد</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white block">
                            {metrics.compliancePercent >= 90 ? 'جاهز للاعتماد والتوثيق' : 'يحتاج معالجة الثغرات'}
                        </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                        <FileSignature className="w-6 h-6" />
                    </div>
                </Card>

            </div>

            {/* 3-Step Wizard Navigation Stepper */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 mb-6 shadow-2xs">
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
                    
                    {/* Step 1 Tab */}
                    <button
                        onClick={() => setCurrentStep(1)}
                        className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                            currentStep === 1 
                                ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span className="w-6 h-6 rounded-full bg-slate-950/10 dark:bg-white/20 flex items-center justify-center text-xs font-mono">1</span>
                        <span>الخطوة 1: تحميل وإدخال العقد</span>
                    </button>

                    {/* Step 2 Tab */}
                    <button
                        onClick={() => setCurrentStep(2)}
                        className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                            currentStep === 2 
                                ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span className="w-6 h-6 rounded-full bg-slate-950/10 dark:bg-white/20 flex items-center justify-center text-xs font-mono">2</span>
                        <span>الخطوة 2: نتائج الفحص والتحليل الذكي</span>
                    </button>

                    {/* Step 3 Tab */}
                    <button
                        onClick={() => setCurrentStep(3)}
                        className={`py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                            currentStep === 3 
                                ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        <span className="w-6 h-6 rounded-full bg-slate-950/10 dark:bg-white/20 flex items-center justify-center text-xs font-mono">3</span>
                        <span>الخطوة 3: التوصيات والتصدير المعتمد</span>
                    </button>

                </div>
            </div>

            {/* STEP 1: UPLOAD & INPUT CONTRACT */}
            {currentStep === 1 && (
                <div className="space-y-6">
                    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs space-y-6">
                        
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>اختر مصدر العقد المراد تحليله وحوكمته</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    يمكنك اختيار نموذج عقد معتمد من النظام، أو رفع ملف PDF/Word، أو كتابة النص المباشر.
                                </p>
                            </div>

                            {/* Mode toggle */}
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                <button
                                    onClick={() => setInputMode('template')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${inputMode === 'template' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'}`}
                                >
                                    نموذج معتمد
                                </button>
                                <button
                                    onClick={() => setInputMode('file')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${inputMode === 'file' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'}`}
                                >
                                    رفع ملف العقد
                                </button>
                                <button
                                    onClick={() => setInputMode('text')}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${inputMode === 'text' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs' : 'text-slate-500'}`}
                                >
                                    إدخال نص حر
                                </button>
                            </div>
                        </div>

                        {/* MODE A: SYSTEM TEMPLATES */}
                        {inputMode === 'template' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {KUWAIT_CONTRACT_TEMPLATES.map(tpl => (
                                    <div
                                        key={tpl.id}
                                        onClick={() => handleTemplateSelect(tpl.id)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                                            selectedTemplateId === tpl.id 
                                                ? 'border-amber-500 bg-amber-500/5 dark:bg-amber-950/20 ring-2 ring-amber-500/20' 
                                                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                                {tpl.category}
                                            </span>
                                            {selectedTemplateId === tpl.id && (
                                                <CheckCircle2 className="w-4 h-4 text-amber-500" />
                                            )}
                                        </div>
                                        <h4 className="text-xs font-black text-slate-900 dark:text-white leading-snug">
                                            {tpl.title}
                                        </h4>
                                        <p className="text-[11px] text-slate-500 line-clamp-2">
                                            {tpl.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* MODE B: FILE UPLOAD DROPZONE */}
                        {inputMode === 'file' && (
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center space-y-3 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-slate-50 transition-colors">
                                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center">
                                    <Upload className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">اسحب ملف العقد أو اضغط للرفع</h4>
                                    <p className="text-[11px] text-slate-500">يدعم صيغ PDF، DOCX، أو TXT بحجم أقصى 25 ميجابايت</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf,.docx,.doc,.txt"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                    id="contract-file-input"
                                />
                                <label
                                    htmlFor="contract-file-input"
                                    className="inline-block px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl cursor-pointer hover:opacity-90"
                                >
                                    اختر الملف من جهازك
                                </label>
                            </div>
                        )}

                        {/* MODE C: TEXTAREA INPUT */}
                        {inputMode === 'text' && (
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">الصق نص العقد كاملاً هنا:</label>
                                <textarea
                                    rows={8}
                                    value={rawContractText}
                                    onChange={(e) => setRawContractText(e.target.value)}
                                    placeholder="الصق نصوص البنود القانونية هنا ليتم فك أسرارها وتحليل ثغراتها..."
                                    className="w-full text-xs font-mono p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                                />
                            </div>
                        )}

                        {/* PARTIES METADATA INPUTS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الطرف الأول (المؤجر / صاحب العمل)</label>
                                <Input
                                    type="text"
                                    value={firstParty}
                                    onChange={(e) => setFirstParty(e.target.value)}
                                    className="text-xs dark:bg-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الطرف الثاني (المستأجر / العامل)</label>
                                <Input
                                    type="text"
                                    value={secondParty}
                                    onChange={(e) => setSecondParty(e.target.value)}
                                    className="text-xs dark:bg-slate-800"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">القيمة المالية / الراتب</label>
                                <Input
                                    type="text"
                                    value={contractValue}
                                    onChange={(e) => setContractValue(e.target.value)}
                                    className="text-xs dark:bg-slate-800"
                                />
                            </div>
                        </div>

                        {/* START ANALYSIS BUTTON */}
                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={handleStartAnalysis}
                                disabled={isAnalyzing}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-8 py-3 rounded-xl flex items-center gap-2 shadow-sm"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        <span>جارٍ تحليل بنود العقد بذكاء...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        <span>بدء الفحص والتحليل القانوني الذكي ➔</span>
                                    </>
                                )}
                            </Button>
                        </div>

                    </Card>
                </div>
            )}

            {/* STEP 2: SMART ANALYSIS RESULTS & COMPARISON TABLE */}
            {currentStep === 2 && (
                <div className="space-y-6">
                    
                    {/* Executive Contract Overview Card */}
                    <Card className="p-5 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>نظرة عامة وملخص العقد الخاضع للحوكمة</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    الطرف الأول: <strong className="text-slate-800 dark:text-slate-200">{firstParty}</strong> | الطرف الثاني: <strong className="text-slate-800 dark:text-slate-200">{secondParty}</strong> | المقابل: <strong className="text-amber-600">{contractValue}</strong>
                                </p>
                            </div>

                            <Button
                                size="sm"
                                onClick={handleFixAllClauses}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs"
                            >
                                <Sparkles className="w-4 h-4" />
                                <span>تطبيق كافة التعديلات القانونية بضغطة واحدة (1-Click Fix All)</span>
                            </Button>
                        </div>
                    </Card>

                    {/* Streamlined Analysis & Comparison Table */}
                    <Card className="p-0 overflow-hidden bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs">
                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs border-collapse">
                                <thead>
                                    <tr className="bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                                        <th className="p-3.5 w-1/5">البند والنص الحالي</th>
                                        <th className="p-3.5 w-1/4">التحليل الذكي والمستند القانوني</th>
                                        <th className="p-3.5 w-28 text-center">تقييم الخطورة</th>
                                        <th className="p-3.5 w-1/3">التعديل المقترح وفقاً للقانون الكويتي</th>
                                        <th className="p-3.5 w-32 text-center">الإجراء السريع</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {activeClauses.map(clause => {
                                        return (
                                            <tr key={clause.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                                                
                                                {/* Clause Name & Current Text */}
                                                <td className="p-3.5 align-top space-y-1">
                                                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        {clause.clauseNumber}: {clause.clauseTitle}
                                                    </span>
                                                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-mono">
                                                        "{clause.currentText}"
                                                    </p>
                                                </td>

                                                {/* Smart AI Analysis & Statute */}
                                                <td className="p-3.5 align-top space-y-1.5">
                                                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                                        {clause.analysisText}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200/60 dark:border-amber-900/60">
                                                        <Scale className="w-3 h-3 shrink-0" />
                                                        <span>{clause.statuteReference}</span>
                                                    </div>
                                                </td>

                                                {/* Risk Level Badge */}
                                                <td className="p-3.5 align-top text-center">
                                                    {clause.isApplied ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            تم التصحيح
                                                        </span>
                                                    ) : clause.riskLevel === 'HIGH' ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            خطورة عالية
                                                        </span>
                                                    ) : clause.riskLevel === 'MEDIUM' ? (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            خطورة متوسطة
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300">
                                                            <ShieldCheck className="w-3 h-3" />
                                                            مطابق وسليم
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Proposed Kuwait Wording Amendment */}
                                                <td className="p-3.5 align-top space-y-1">
                                                    <div className={`p-2.5 rounded-xl border text-xs leading-relaxed ${clause.isApplied ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-bold' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'}`}>
                                                        {clause.proposedAmendment}
                                                    </div>
                                                </td>

                                                {/* 1-Click Action Button */}
                                                <td className="p-3.5 align-top text-center">
                                                    {clause.isApplied ? (
                                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block pt-2">
                                                            معتمد بالنص المعدل ✓
                                                        </span>
                                                    ) : (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleApplyClauseFix(clause.id)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-xs"
                                                        >
                                                            تطبيق التعديل
                                                        </Button>
                                                    )}
                                                </td>

                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Step Navigation Bar */}
                    <div className="flex justify-between items-center pt-2">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentStep(1)}
                            className="text-xs font-bold rounded-xl"
                        >
                            الرجوع للخطوة 1 (إدخال العقد)
                        </Button>

                        <Button
                            onClick={() => setCurrentStep(3)}
                            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-xs"
                        >
                            <span>التالي: التوصيات والتصدير المعتمد ➔</span>
                        </Button>
                    </div>

                </div>
            )}

            {/* STEP 3: RECOMMENDATIONS & OFFICIAL EXPORT */}
            {currentStep === 3 && (
                <div className="space-y-6">
                    
                    {/* Final Governance Report Card */}
                    <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-2xs space-y-5">
                        
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                    <span>تقرير الامتثال والتوصيات القانونية المعتمدة</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    جاهزية العقد للتوقيع والتوثيق الرسمي لدى الجهات المعنية بدولة الكويت.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl text-xs font-bold">
                                <span>الختم والاعتماد الرقمي:</span>
                                <input
                                    type="checkbox"
                                    checked={isOfficialSealed}
                                    onChange={(e) => setIsOfficialSealed(e.target.checked)}
                                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Executive Summary Box */}
                        <div className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-4 rounded-2xl space-y-2">
                            <h4 className="text-xs font-black text-emerald-900 dark:text-emerald-300">
                                النتيجة النهائية لحوكمة العقد:
                            </h4>
                            <p className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                                تمت معالجة وتصحيح بنود العقد بنسبة امتثال <strong>{metrics.compliancePercent}%</strong> متوافقة بالكامل مع القوانين واللوائح التنفيذية بدولة الكويت. العقد جاهز الآن للطباعة والتوقيع.
                            </p>
                        </div>

                        {/* Recommendation Checklist */}
                        <div className="space-y-2">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">التوصيات الإجرائية قبل التوقيع:</h4>
                            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>توقيع طرفي العقد على كافة صفحات العقد والأحكام المعدلة.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>إيداع نسخة من العقد في السجل المركزي لمكتب المحاماة لحفظ الحقوق.</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>التأكد من توثيق عقود الإيجار والمقاولات لدى الجهات المختصة (إدارة التوثيق بوزارة العدل).</span>
                                </li>
                            </ul>
                        </div>

                        {/* Official Export & Print Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            
                            <Button
                                onClick={() => setIsPrintModalOpen(true)}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-xs"
                            >
                                <Printer className="w-4 h-4" />
                                <span>طباعة التقرير والعقد المعتمد</span>
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => {
                                    addToast({
                                        type: 'success',
                                        title: 'تصدير PDF',
                                        message: 'تم تجهيز ملف العقد المحوكم بنجاح كملف PDF مع الترويسة الرسمية.'
                                    });
                                }}
                                className="text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            >
                                <Download className="w-4 h-4 text-slate-500" />
                                <span>تصدير ملف PDF مع الترويسة</span>
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => {
                                    addToast({
                                        type: 'info',
                                        title: 'حفظ بالأرشيف',
                                        message: 'تم حفظ العقد والبنود المعدلة في سجل عقود المكتب.'
                                    });
                                }}
                                className="text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                            >
                                <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                                <span>حفظ في أرشيف المكتب</span>
                            </Button>

                        </div>

                    </Card>

                    {/* Return button */}
                    <div className="flex justify-start">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentStep(2)}
                            className="text-xs font-bold rounded-xl"
                        >
                            الرجوع لجدول التحليل (الخطوة 2)
                        </Button>
                    </div>

                </div>
            )}

            {/* OFFICIAL PRINT MODAL WITH LAW FIRM LETTERHEAD */}
            <Modal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                title="معاينة وطباعة التقرير العقد المحوكم بالترويسة الرسمية"
                className="max-w-3xl text-right rtl"
            >
                <div className="p-6 space-y-6 text-right font-sans text-slate-900 bg-white dark:bg-slate-900 rounded-2xl">
                    
                    {/* Law Firm Official Header */}
                    <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-black text-slate-900 dark:text-white">
                                مكتب المحاماة والاستشارات القانونية والتحكيم
                            </h2>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                دولة الكويت - العاصمة - شارع ألكويت - برج الحمراء
                            </p>
                        </div>

                        <div className="text-left font-mono text-[10px] text-slate-500">
                            <div>رقم التقرير: AUDIT-{Math.floor(1000 + Math.random() * 9000)}</div>
                            <div>التاريخ: {new Date().toISOString().split('T')[0]}</div>
                        </div>
                    </div>

                    {/* Report Contract Title */}
                    <div className="text-center space-y-1">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                            تقرير حوكمة وفحص الامتثال القانوني
                        </h3>
                        <p className="text-xs font-bold text-amber-600">
                            الطرف الأول: {firstParty} | الطرف الثاني: {secondParty}
                        </p>
                    </div>

                    {/* Clauses Table Preview */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                                    <th className="p-2 border-b">البند</th>
                                    <th className="p-2 border-b">النص المعدل المعمد</th>
                                    <th className="p-2 border-b">المستند القانوني الكويتي</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {activeClauses.map(c => (
                                    <tr key={c.id}>
                                        <td className="p-2 font-bold">{c.clauseTitle}</td>
                                        <td className="p-2">{c.proposedAmendment}</td>
                                        <td className="p-2 text-amber-700 dark:text-amber-400 font-mono text-[10px]">{c.statuteReference}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Official Stamp & Signatures */}
                    {isOfficialSealed && (
                        <div className="pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                            <div className="text-center space-y-1">
                                <span className="text-[10px] font-bold text-slate-400 block">توقيع المستشار القانوني</span>
                                <span className="text-xs font-black text-slate-900 dark:text-white block">أستاذ صبري شطا</span>
                            </div>

                            <div className="w-24 h-24 border-2 border-rose-600 rounded-full flex flex-col items-center justify-center text-rose-600 font-black text-[9px] rotate-[-12deg] p-1 text-center shadow-xs">
                                <span>مكتب صبري شطا</span>
                                <span>اعتماد قانوني</span>
                                <span>الكويت - معتمد</span>
                            </div>
                        </div>
                    )}

                    {/* Modal Print Trigger */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            variant="outline"
                            onClick={() => setIsPrintModalOpen(false)}
                            className="text-xs font-bold"
                        >
                            إغلاق
                        </Button>
                        <Button
                            onClick={() => {
                                window.print();
                            }}
                            className="bg-slate-900 text-white font-bold text-xs px-6"
                        >
                            طباعة مباشرة 🖨️
                        </Button>
                    </div>

                </div>
            </Modal>

        </div>
    );
}
