import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import Card from '../components/ui/Card';
import {
    PresentationChartLineIcon,
    InformationCircleIcon,
    CalendarDaysIcon,
    BriefcaseIcon,
    ClipboardDocumentListIcon,
    ShieldCheckIcon,
    UsersIcon,
    BuildingOffice2Icon,
    PrinterIcon,
    BanknotesIcon,
    ShareIcon, 
    CHART_COLORS,
    CASE_STATUS_CHART_COLORS,
    RISK_COLORS,
    JUDGMENT_OUTCOME_CHART_COLORS,
    TASK_PRIORITY_COLORS,
    COMPLIANCE_STATUS_CHART_COLORS,
    RepresentationRequestStatusChartColors,
    ArrowUpCircleIcon,
    ArrowDownCircleIcon,
    AdjustmentsHorizontalIcon,
    Squares2X2Icon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon,
    ClockIcon,
    SparklesIcon,
    CheckBadgeIcon,
    XCircleIcon,
    AcademicCapIcon,
    FunnelIcon,
    DocumentTextIcon,
    LightBulbIcon,
    ArrowsRightLeftIcon,
    ChartBarIcon,
    ChartPieIcon,
    PlusCircleIcon,
    TrashIcon,
    PencilIcon,
    EyeIcon,
    DocumentDuplicateIcon,
    ListBulletIcon,
    ChevronDownIcon,
    PaperAirplaneIcon
} from '../constants';
import PrintHeader from '../components/ui/PrintHeader';
import { format } from 'date-fns';
import { 
    PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { 
    CaseStatus, AdminTaskStatus, JudgmentOutcome
} from '../types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { geminiService } from '../services/geminiService';
import { Badge } from '../components/ui/Badge';
import { useCaseTask } from '../components/CaseTaskContext';

// Import constants and data
import { initialCases as mockCasesDataFromList } from '../data/caseData';
import { initialMockTasks } from '../data/taskData';
import { mockFinancialTransactions } from './FinancialManagementPage';
import { mockProperties } from '../data/propertyData';

const formatCurrency = (amount?: number, t?: any): string => {
    if (amount === undefined || isNaN(amount)) return '-';
    const currency = t ? t('currency_kwd', { defaultValue: 'د.ك' }) : 'د.ك';
    return `${amount.toFixed(3)} ${currency}`;
};

const formatDateForReport = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return dateString; 
      return dateObj.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) { return dateString; } 
};

// --- MOCK DATA ---
interface SavedReport {
    id: string;
    title: string;
    category: string;
    type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    date: string;
    description: string;
    status: 'READY' | 'PROCESSING' | 'FAILED';
    dataCount: number;
}

const INITIAL_SAVED_REPORTS: SavedReport[] = [
    { id: 'rep-001', title: 'تقرير القضايا الأسبوعي - مايو 2024', category: 'cases', type: 'WEEKLY', date: '2024-05-12', description: 'ملخص شامل للقضايا المفتوحة والمغلقة خلال الأسبوع الثاني من مايو.', status: 'READY', dataCount: 45 },
    { id: 'rep-002', title: 'تحليل الإيرادات الشهري - أبريل 2024', category: 'financial', type: 'MONTHLY', date: '2024-04-30', description: 'تقرير مالي مفصل للتدفقات النقدية والمصروفات لشهر أبريل.', status: 'READY', dataCount: 120 },
    { id: 'rep-003', title: 'مؤشرات أداء المحامين - الربع الأول', category: 'staff', type: 'CUSTOM', date: '2024-03-31', description: 'تقييم كفاءة الفريق القانوني بناءً على زمن المعالجة ومعدل النجاح.', status: 'READY', dataCount: 12 },
    { id: 'rep-004', title: 'تقرير الامتثال الضريبي والقانوني', category: 'compliance', type: 'MONTHLY', date: '2024-05-01', description: 'مراجعة دورية للمتطلبات التنظيمية والمواعيد النهائية.', status: 'READY', dataCount: 28 },
];

const StatCard = ({ label, value, icon, trend, trendValue, color, bg }: any) => (
    <motion.div 
        whileHover={{ scale: 1.02, y: -5 }}
        className="bg-white dark:bg-dm-card p-6 rounded-[32px] border border-gray-100 dark:border-gray-800 transition-all shadow-xl shadow-gray-200/20 relative overflow-hidden group"
    >
        <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity transform rotate-12 ${color}`}>
            {React.cloneElement(icon, { className: "w-32 h-32" })}
        </div>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${bg} shadow-lg text-white`}>{icon}</div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black ${trend === 'up' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {trend === 'up' ? <ArrowUpCircleIcon className="w-3 h-3"/> : <ArrowDownCircleIcon className="w-3 h-3"/>}
                        {trendValue}
                    </div>
                )}
            </div>
            <p className="text-3xl font-black text-gray-900 dark:text-dm-text leading-none mb-2 tracking-tighter" dir="ltr">{value}</p>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        </div>
    </motion.div>
);

const STATUS_COLORS_REPORTS: Record<string, string> = {
    ...CASE_STATUS_CHART_COLORS,
    ...RISK_COLORS,
    ...JUDGMENT_OUTCOME_CHART_COLORS,
    ...TASK_PRIORITY_COLORS,
    ...COMPLIANCE_STATUS_CHART_COLORS,
    ...RepresentationRequestStatusChartColors,
};

interface ReportCategoryDefinition {
    value: string;
    label: string;
    icon: React.ReactNode;
    subReports: { value: string; label: string; icon: React.ReactNode }[];
}

const ReportsPage: React.FC = () => {
    const { t } = useTranslation();
    const { cases: mockCasesDataFromList, tasks: initialMockTasks } = useCaseTask();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'generator' | 'archive' | 'ai'>('dashboard');
    const [savedReports, setSavedReports] = useState<SavedReport[]>(INITIAL_SAVED_REPORTS);
    const [archiveSearchTerm, setArchiveSearchTerm] = useState('');
    const [archiveFilterCategory, setArchiveFilterCategory] = useState('');

    const reportCategories: ReportCategoryDefinition[] = useMemo(() => [
        {
            value: 'cases', label: 'إحصائيات القضايا', icon: <BriefcaseIcon className="w-5 h-5" />,
            subReports: [
                { value: 'caseStatusDistribution', label: 'توزيع القضايا حسب الحالة', icon: <ChartPieIcon className="w-4 h-4" /> },
                { value: 'lawyerWorkload', label: 'كثافة العمل لكل محامي', icon: <UsersIcon className="w-4 h-4" /> },
                { value: 'successRate', label: 'معدل النجاح في الأحكام', icon: <CheckBadgeIcon className="w-4 h-4" /> },
            ],
        },
        {
            value: 'financial', label: 'التحليل المالي', icon: <BanknotesIcon className="w-5 h-5" />,
            subReports: [
                { value: 'revenueAnalysis', label: 'تحليل الإيرادات الشهرية', icon: <PresentationChartLineIcon className="w-4 h-4" /> },
                { value: 'expenseStructure', label: 'هيكل المصروفات التشغيلية', icon: <ChartPieIcon className="w-4 h-4" /> },
            ],
        },
        {
            value: 'staff', label: 'كفاءة الموظفين', icon: <UsersIcon className="w-5 h-5" />,
            subReports: [
                { value: 'taskCompletionRatio', label: 'معدل إنجاز المهام الكلي', icon: <ClipboardDocumentListIcon className="w-4 h-4" /> },
            ],
        },
    ], []);

    const timePeriodOptions = useMemo(() => [
        { value: 'all', label: 'كل الأوقات' },
        { value: 'last7days', label: 'آخر 7 أيام' },
        { value: 'last30days', label: 'آخر 30 يومًا' },
        { value: 'currentMonth', label: 'الشهر الحالي' },
        { value: 'customRange', label: 'نطاق مخصص' },
    ], []);

    const [selectedCategory, setSelectedCategory] = useState<string>('cases');
    const [selectedReport, setSelectedReport] = useState<string>('caseStatusDistribution');
    const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('all');
    const [reportFrequency, setReportFrequency] = useState<string>('ONCE');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    
    const [reportData, setReportData] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chartType, setChartType] = useState<'pie' | 'bar' | 'line' | 'area' | 'list'>('bar'); 
    const [reportTitle, setReportTitle] = useState<string>('');

    // AI Chat State
    const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', content: string}[]>([
        { role: 'model', content: 'أنا مساعدك التحليلي الذكي. كيف يمكنني مساعدتك في تحليل البيانات اليوم؟' }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
    useEffect(() => { if (activeTab === 'ai') scrollToBottom(); }, [chatMessages, activeTab]);

    const handleSendAiMessage = async () => {
        if (!chatInput.trim() || isAiThinking) return;
        const userMsg = chatInput;
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsAiThinking(true);
        try {
            const context = `Context: Lawyer firm analytics. Total cases: ${mockCasesDataFromList.length}.`;
            const response = await geminiService.getChatbotResponse(context + "\n" + userMsg, []);
            setChatMessages(prev => [...prev, { role: 'model', content: response }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'model', content: 'عذراً، واجهت مشكلة.' }]);
        } finally { setIsAiThinking(false); }
    };

    const currentSubReportOptions = useMemo(() => {
        return reportCategories.find(cat => cat.value === selectedCategory)?.subReports || [];
    }, [selectedCategory, reportCategories]);

    const kpis = useMemo(() => ([
        { label: 'القضايا المفتوحة', value: mockCasesDataFromList.filter(c => c.status !== CaseStatus.CLOSED).length, icon: <BriefcaseIcon className="w-6 h-6"/>, trend: 'up', trendValue: '12%', color: 'text-indigo-600', bg: 'from-indigo-600 to-indigo-700' },
        { label: 'جلسات قادمة (أسبوع)', value: mockCasesDataFromList.filter(c => c.nextHearingDate && new Date(c.nextHearingDate) < new Date(Date.now() + 7 * 86400000)).length, icon: <CalendarDaysIcon className="w-6 h-6"/>, trend: 'down', trendValue: '4%', color: 'text-amber-600', bg: 'from-amber-500 to-amber-600' },
        { label: 'نسبة النجاح', value: `${Math.round((mockCasesDataFromList.filter(c => c.judgmentOutcome === JudgmentOutcome.WON).length / (mockCasesDataFromList.filter(c => c.judgmentOutcome).length || 1)) * 100)}%`, icon: <CheckBadgeIcon className="w-6 h-6"/>, trend: 'up', trendValue: '1.2%', color: 'text-emerald-600', bg: 'from-emerald-500 to-emerald-600' },
        { label: 'تحصيل الإيرادات', value: formatCurrency(mockFinancialTransactions.reduce((sum, f) => sum + f.amount, 0), t).split(' ')[0], icon: <BanknotesIcon className="w-6 h-6"/>, trendValue: '8%', color: 'text-blue-600', bg: 'from-blue-600 to-blue-700' },
        { label: 'المهام المنجزة', value: initialMockTasks.filter(t => t.status === AdminTaskStatus.COMPLETED).length, icon: <ClipboardDocumentListIcon className="w-6 h-6"/>, color: 'text-violet-600', bg: 'from-violet-500 to-violet-600' },
        { label: 'الأصول المدارة', value: mockProperties.length, icon: <BuildingOffice2Icon className="w-6 h-6"/>, color: 'text-slate-600', bg: 'from-slate-600 to-slate-700' },
    ]), [t]);

    const generateReport = useCallback(async () => {
        setIsLoading(true);
        setReportData(null);
        await new Promise(r => setTimeout(r, 600));
        let data: any = { chartData: [], listData: [] };
        let newChartType: any = 'bar';
        
        switch (selectedReport) {
            case 'caseStatusDistribution':
                const statuses = mockCasesDataFromList.reduce((acc: any, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});
                data.chartData = Object.entries(statuses).map(([name, value]) => ({ name, value }));
                data.listData = mockCasesDataFromList;
                newChartType = 'pie';
                break;
            case 'lawyerWorkload':
                const workloads = mockCasesDataFromList.reduce((acc: any, c) => { acc[c.assignedLawyer] = (acc[c.assignedLawyer] || 0) + 1; return acc; }, {});
                data.chartData = Object.entries(workloads).map(([name, value]) => ({ name, value }));
                break;
            case 'revenueAnalysis':
                data.chartData = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو'].map((m, i) => ({ name: m, value: 5000 + Math.random() * 2000 }));
                newChartType = 'area';
                break;
            default: break;
        }

        setReportData(data);
        setReportTitle(currentSubReportOptions.find(r => r.value === selectedReport)?.label || '');
        setChartType(newChartType);
        setIsLoading(false);
    }, [selectedReport, currentSubReportOptions]);

    const saveToArchive = () => {
        if (!reportData) return;
        const newRep: SavedReport = {
            id: `rep-${Date.now()}`,
            title: reportTitle,
            category: selectedCategory,
            type: 'MONTHLY',
            date: new Date().toISOString().split('T')[0],
            description: `تقرير مستخرج آلياً يعرض بيانات ${reportTitle}.`,
            status: 'READY',
            dataCount: reportData.chartData.length
        };
        setSavedReports([newRep, ...savedReports]);
        alert("تم الحفظ بنجاح!");
    };

    const renderChart = () => {
        const data = reportData.chartData;
        if (!data || data.length === 0) return null;
        return (
            <div className="h-[450px] w-full p-6 bg-white dark:bg-dm-card rounded-[32px] shadow-xl border border-gray-100 dark:border-gray-800">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'pie' ? (
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={80} outerRadius={130} paddingAngle={5} dataKey="value">
                                {data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS_REPORTS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    ) : chartType === 'area' ? (
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1} />
                        </AreaChart>
                    ) : (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        );
    };

    const filteredArchive = useMemo(() => {
        return savedReports.filter(r => r.title.toLowerCase().includes(archiveSearchTerm.toLowerCase()) && (!archiveFilterCategory || r.category === archiveFilterCategory));
    }, [savedReports, archiveSearchTerm, archiveFilterCategory]);

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 font-sans text-right" dir="rtl">
            <PrintHeader title="مركز التقارير والإحصائيات" subtitle="إدارة البيانات وتحليل الأداء القانوني والمالي" />
            
            {/* Main Header */}
            <div className="bg-slate-900 text-white p-10 rounded-[40px] shadow-2xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black mb-3 tracking-tight">مركز التقارير والتحليلات <span className="text-indigo-400">الذكية</span></h1>
                        <p className="text-slate-400 max-w-xl font-medium">المنصة الشاملة لاستخراج مؤشرات الأداء، رصد الميزانية، وتوليد التقارير الدورية المدعومة بالذكاء الاصطناعي.</p>
                    </div>
                    <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl">
                        {(['dashboard', 'archive', 'ai'] as const).map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-xl' : 'text-slate-300 hover:text-white'}`}>
                                {tab === 'dashboard' ? 'الرئيسية' : tab === 'archive' ? 'الأرشيف' : 'الذكاء الاصطناعي'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                    <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                            {kpis.map((kpi, idx) => <StatCard key={idx} {...kpi} />)}
                        </div>

                        {/* Generator Controls */}
                        <div className="bg-white dark:bg-dm-card p-8 rounded-[40px] shadow-xl border border-gray-100 dark:border-gray-800">
                             <div className="flex justify-between items-center mb-8 border-b pb-6">
                                <h2 className="text-2xl font-black flex items-center gap-3">
                                    <PlusCircleIcon className="w-7 h-7 text-indigo-600"/> استخراج تقرير جديد
                                </h2>
                                <div className="flex gap-2">
                                    {['ONCE', 'WEEKLY', 'MONTHLY'].map(f => (
                                        <button key={f} onClick={() => setReportFrequency(f)} className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${reportFrequency === f ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-400'}`}>
                                            {f === 'ONCE' ? 'لمرة واحدة' : f === 'WEEKLY' ? 'أسبوعي' : 'شهري'}
                                        </button>
                                    ))}
                                </div>
                             </div>
                             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-4 space-y-3">
                                    {reportCategories.map(cat => (
                                        <button key={cat.value} onClick={() => { setSelectedCategory(cat.value); setSelectedReport(cat.subReports[0].value); }}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${selectedCategory === cat.value ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}>
                                            <div className="flex items-center gap-4">
                                                {cat.icon}
                                                <span className="font-black text-sm">{cat.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="lg:col-span-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Select label="نوع التقرير" options={currentSubReportOptions} value={selectedReport} onChange={e => setSelectedReport(e.target.value)} />
                                        <Select label="الفترة الزمنية" options={timePeriodOptions} value={selectedTimePeriod} onChange={e => setSelectedTimePeriod(e.target.value)} />
                                    </div>
                                    <Button onClick={generateReport} isLoading={isLoading} className="w-full h-14 rounded-2xl text-lg font-black" leftIcon={<SparklesIcon className="w-6 h-6"/>}>توليد التقرير المباشر</Button>
                                </div>
                             </div>
                        </div>

                        {reportData && (
                            <div className="mt-8 animate-in slide-in-from-bottom-5">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-3xl font-black">{reportTitle}</h2>
                                    <Button variant="outline" onClick={saveToArchive} leftIcon={<DocumentDuplicateIcon className="w-5"/>}>حفظ في الأرشيف</Button>
                                </div>
                                {renderChart()}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'archive' && (
                    <motion.div key="archive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-dm-card p-6 rounded-3xl border border-gray-100">
                             <div className="md:col-span-2 relative">
                                 <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"/>
                                 <input placeholder="ابحث في سجل التقارير..." className="w-full pr-12 pl-4 py-3 rounded-2xl bg-gray-50 border-none font-bold text-sm" value={archiveSearchTerm} onChange={e => setArchiveSearchTerm(e.target.value)} />
                             </div>
                             <Select options={[{value: '', label: 'كل التصنيفات'}]} value={archiveFilterCategory} onChange={e => setArchiveFilterCategory(e.target.value)} className="border-none bg-gray-50"/>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {filteredArchive.map(rep => (
                                 <Card key={rep.id} className="p-6 rounded-[32px] border-none shadow-xl hover:shadow-2xl transition-all group">
                                     <div className="flex justify-between mb-4">
                                         <Badge text={rep.type} size="xs" variant="info" className="font-black" />
                                         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                             <button className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"><PencilIcon className="w-4 h-4"/></button>
                                             <button className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"><TrashIcon className="w-4 h-4"/></button>
                                         </div>
                                     </div>
                                     <h3 className="text-lg font-black mb-2 line-clamp-1">{rep.title}</h3>
                                     <p className="text-xs text-gray-500 mb-4 line-clamp-2">{rep.description}</p>
                                     <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                                         <span className="text-[10px] font-mono text-gray-400">{rep.date}</span>
                                         <Button variant="ghost" size="sm" className="text-indigo-600 font-black" leftIcon={<EyeIcon className="w-4"/>}>عرض</Button>
                                     </div>
                                 </Card>
                             ))}
                         </div>
                    </motion.div>
                )}

                {activeTab === 'ai' && (
                    <motion.div key="ai" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto h-[650px] flex flex-col bg-white dark:bg-dm-card rounded-[40px] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                        <div className="bg-indigo-600 p-8 text-white flex justify-between items-center">
                            <h3 className="text-2xl font-black flex items-center gap-3"><SparklesIcon className="w-8 h-8"/> المحلل القانوني الذكي</h3>
                            <div className="flex gap-2">
                                <span className="w-3 h-3 bg-white/30 rounded-full animate-pulse" />
                                <span className="w-3 h-3 bg-white/30 rounded-full animate-pulse [animation-delay:0.2s]" />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[80%] p-5 rounded-[2rem] ${msg.role === 'user' ? 'bg-white border text-gray-800 rounded-tr-none font-bold' : 'bg-indigo-600 text-white shadow-xl rounded-tl-none font-medium'}`}>
                                        <div className="text-sm md:text-base leading-relaxed">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isAiThinking && <LoadingSpinner size="sm" color="text-indigo-600" />}
                            <div ref={chatEndRef} />
                        </div>
                        <div className="p-8 border-t bg-white">
                            <div className="flex gap-4 p-2 bg-gray-50 rounded-[2rem] border border-gray-100 shadow-inner">
                                <input type="text" className="flex-1 bg-transparent px-6 py-4 focus:outline-none text-sm font-bold" placeholder="اطلب تحليلاً للأداء أو الاتجاهات المالية..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendAiMessage()} />
                                <button onClick={handleSendAiMessage} className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all active:scale-95">
                                    <PaperAirplaneIcon className="w-6 h-6 rotate-180" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ReportsPage;
