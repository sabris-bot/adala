
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

const CaseDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { addToast } = useToast();
    
    const [caseItem, setCaseItem] = useState<Case | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'hearings' | 'experts' | 'execution' | 'archive' | 'financials' | 'ai'>('details');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [aiSummary, setAiSummary] = useState<string | null>(null);

    useEffect(() => {
        const found = initialCases.find(c => c.id === id);
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
        { id: 'ai', label: 'التحليل الذكي', icon: <SparklesIcon className="w-4 h-4" /> }
    ] as const;

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
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
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
                        {activeTab === 'archive' && <ArchiveTab files={caseItem.caseFiles || []} />}
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

const ArchiveTab: React.FC<{ files: CaseFile[] }> = ({ files }) => (
    <Card className="p-8 rounded-[2.5rem] border-none shadow-sm dark:bg-dm-card">
        <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-3 italic">
                <FolderIcon className="w-6 h-6 text-primary" />
                أرشيف الملفات والمستندات
            </h2>
            <Button size="sm" className="rounded-xl font-black h-10">رفع مستند جديد</Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {files.map((file) => (
                <div key={file.id} className="p-6 bg-slate-50 dark:bg-dm-background rounded-[2rem] border border-slate-100 dark:border-slate-800 group hover:shadow-xl hover:border-primary/20 transition-all">
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl mb-4 flex items-center justify-center shadow-sm group-hover:bg-primary group-hover:text-white transition-colors">
                        <DocumentTextIcon className="w-10 h-10" />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white truncate mb-1">{file.fileName}</h4>
                    <p className="text-[10px] font-bold text-slate-400 lowercase italic mb-4">{file.fileType} • {file.uploadedAt}</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl h-9">تحميل</Button>
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl h-9 text-rose-500 hover:text-rose-600">حذف</Button>
                    </div>
                </div>
            ))}
        </div>
    </Card>
);

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

export default CaseDetailsPage;
