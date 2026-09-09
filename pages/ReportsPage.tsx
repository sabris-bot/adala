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
    ArrowUpCircleIcon,
    ArrowDownCircleIcon,
    AdjustmentsHorizontalIcon,
    Squares2X2Icon,
    MagnifyingGlassIcon,
    ArrowPathIcon,
    ArrowDownTrayIcon,
    ArrowRightIcon,
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
import { 
    PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { 
    CaseStatus, AdminTaskStatus, JudgmentOutcome, Case, CasePriority, RiskLevel
} from '../types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { geminiService } from '../services/geminiService';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { useCaseTask } from '../components/CaseTaskContext';

const formatCurrency = (amount?: number): string => {
    if (amount === undefined || isNaN(amount)) return '-';
    return `${amount.toFixed(3)} د.ك`;
};

const formatDateForReport = (dateString?: string): string => {
  if (!dateString) return '-';
  try {
      const dateObj = new Date(dateString);
      if (isNaN(dateObj.getTime())) return dateString; 
      return dateObj.toLocaleDateString('ar-KW', { year: 'numeric', month: 'long', day: 'numeric' });
  } catch (e) { return dateString; } 
};

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
    {
        id: 'rep-init-1',
        title: 'كشف توزيع القضايا حسب الحالة التشغيلية والدرجات',
        category: 'cases',
        type: 'MONTHLY',
        date: new Date().toISOString().split('T')[0],
        description: 'تقرير معتمد يحدد نسبة القضايا المفتوحة والمحسومة والمستأنفة لجميع الدوائر القانونية.',
        status: 'READY',
        dataCount: 18
    },
    {
        id: 'rep-init-2',
        title: 'تقرير المطابقات المالية وحركة التحصيل والذمم',
        category: 'financial',
        type: 'MONTHLY',
        date: new Date().toISOString().split('T')[0],
        description: 'تحليل شامل للتدفقات النقدية والذمم المدينة والدائنة المسجلة بالفواتير والاشتراكات.',
        status: 'READY',
        dataCount: 12
    }
];

const StatCard = ({ label, value, icon, trend, trendValue, subtitle, badgeText }: any) => (
    <motion.div 
        whileHover={{ y: -3 }}
        className="bg-white dark:bg-dm-card p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-all shadow-xs hover:shadow-md relative overflow-hidden group"
    >
        <div className="absolute top-0 right-0 w-1 h-full bg-[#00796B] rounded-r-2xl" />
        <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-[#00796B] dark:text-teal-400 group-hover:scale-105 transition-transform">
                {icon}
            </div>
            {badgeText && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
                    {badgeText}
                </span>
            )}
            {trend && !badgeText && (
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                    trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-rose-50 text-rose-500 dark:bg-rose-950/30 dark:text-rose-400'
                }`}>
                    {trend === 'up' ? <ArrowUpCircleIcon className="w-3.5 h-3.5"/> : <ArrowDownCircleIcon className="w-3.5 h-3.5"/>}
                    {trendValue}
                </div>
            )}
        </div>
        <p className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none mb-1.5 tracking-tight font-mono">{value}</p>
        <p className="text-xs font-black text-slate-700 dark:text-slate-300 mb-1">{label}</p>
        {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{subtitle}</p>}
    </motion.div>
);

const STATUS_COLORS_REPORTS: Record<string, string> = {
    "مفتوحة": '#26a69a',
    "قيد التنفيذ": '#00796B',
    "مغلقة": '#607D8B',
    "قيد الانتظار": '#C5A880',
    "معلقة": '#A3845B',
    "مستأنفة": '#4DB6AC',
    "منخفض": '#00796B',
    "متوسط": '#C5A880',
    "مرتفع": '#EF4444',
    "حرج": '#D32F2F',
    "فوز": '#00796B',
    "خسارة": '#D32F2F',
    "تسوية": '#C5A880',
    "فوز جزئي": '#4DB6AC',
    "انتظار": '#607D8B',
    "منخفضة": '#80cbc4',
    "متوسطة": '#00796B',
    "عالية": '#C5A880',
    "حرجة": '#D32F2F',
    "ملتزم": '#00796B',
    "متأخر": '#D32F2F',
    "تحت المراجعة": '#C5A880',
    "مجدول": '#4DB6AC',
    "مقبول": '#00796B',
    "مرفوض": '#D32F2F',
    "مكتمل": '#00796B',
    "ملغى": '#607D8B',
};

interface SubReportDef {
    value: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    badge?: string;
}

interface ReportCategoryDefinition {
    value: string;
    label: string;
    icon: React.ReactNode;
    description: string;
    subReports: SubReportDef[];
}

const ReportsPage: React.FC = () => {
    const { t } = useTranslation();
    const { addToast } = useToast();
    const { cases: mockCasesDataFromList, tasks: initialMockTasks } = useCaseTask();
    
    // Main Section Tab
    const [activeTab, setActiveTab] = useState<'dashboard' | 'archive' | 'ai'>('dashboard');
    const [savedReports, setSavedReports] = useState<SavedReport[]>(INITIAL_SAVED_REPORTS);
    const [archiveSearchTerm, setArchiveSearchTerm] = useState('');
    const [archiveFilterCategory, setArchiveFilterCategory] = useState('');

    const filteredArchive = useMemo(() => {
        return savedReports.filter(rep => {
            const matchesSearch = rep.title.toLowerCase().includes(archiveSearchTerm.toLowerCase()) || 
                                rep.description.toLowerCase().includes(archiveSearchTerm.toLowerCase());
            const matchesCategory = !archiveFilterCategory || rep.category === archiveFilterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [savedReports, archiveSearchTerm, archiveFilterCategory]);

    // Financial Data from localStorage
    const [loadedTransactions] = useState<any[]>(() => {
        const saved = localStorage.getItem('adala_fin_transactions_v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                console.error(e);
            }
        }
        return [];
    });

    const [loadedInvoices] = useState<any[]>(() => {
        const saved = localStorage.getItem('adala_fin_invoices_v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                console.error(e);
            }
        }
        return [];
    });

    const [loadedDebts] = useState<any[]>(() => {
        const saved = localStorage.getItem('adala_fin_debts_v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            } catch (e) {
                console.error(e);
            }
        }
        return [];
    });

    // Report Categories with rich descriptive sub-reports
    const reportCategories: ReportCategoryDefinition[] = useMemo(() => [
        {
            value: 'cases',
            label: 'إحصائيات القضايا والأحكام',
            icon: <BriefcaseIcon className="w-5 h-5 text-[#00796B]" />,
            description: 'مؤشرات توزيع القضايا وحالتها التشغيلية ونسب حسم الأحكام وعبء العمل',
            subReports: [
                { 
                    value: 'caseStatusDistribution', 
                    label: 'توزيع القضايا حسب الحالة التشغيلية', 
                    description: 'تحليل أعداد القضايا المفتوحة، قيد التنفيذ، المستأنفة، والمغلقة',
                    icon: <ChartPieIcon className="w-4 h-4 text-[#00796B]" />,
                    badge: 'شامل'
                },
                { 
                    value: 'lawyerWorkload', 
                    label: 'عبء العمل وتوزيع الملفات على المحامين', 
                    description: 'كثافة أعداد القضايا والملفات المسندة لكل محامٍ ومستشار',
                    icon: <UsersIcon className="w-4 h-4 text-[#00796B]" />
                },
                { 
                    value: 'successRate', 
                    label: 'معدل النجاح وحسم الأحكام القضائية', 
                    description: 'نسبة القضايا الرابحة والتسويات الصادرة لصالح موكلي المكتب',
                    icon: <CheckBadgeIcon className="w-4 h-4 text-[#00796B]" />,
                    badge: 'مهم'
                },
                { 
                    value: 'litigationStageDistribution', 
                    label: 'توزيع القضايا عبر درجات ومستويات المحاكم', 
                    description: 'متابعة القضايا المنظورة أمام الكلية، الاستئناف، والتمييز',
                    icon: <AcademicCapIcon className="w-4 h-4 text-[#00796B]" />
                },
                {
                    value: 'riskLevelDistribution',
                    label: 'تحليل مستويات المخاطر القانونية',
                    description: 'تصنيف الملفات حسب درجة الخطورة والمتابعة الحرجة',
                    icon: <ShieldCheckIcon className="w-4 h-4 text-[#00796B]" />
                }
            ],
        },
        {
            value: 'financial',
            label: 'التحليلات والمطابقات المالية',
            icon: <BanknotesIcon className="w-5 h-5 text-amber-600" />,
            description: 'كشوف التدفق النقدي والإيرادات والمصروفات والذمم والتحصيل المالي',
            subReports: [
                { 
                    value: 'revenueAnalysis', 
                    label: 'منحنى الإيرادات والمصروفات والأرباح', 
                    description: 'رصد المداخيل الشهرية مقابل المصاريف وصافي أرباح التشغيل',
                    icon: <PresentationChartLineIcon className="w-4 h-4 text-amber-600" />,
                    badge: 'مالي'
                },
                { 
                    value: 'expenseStructure', 
                    label: 'هيكل المصروفات والنفقات التشغيلية', 
                    description: 'تفاصيل توزيع مصاريف القضية والرسوم القضائية والخدمات',
                    icon: <ChartPieIcon className="w-4 h-4 text-amber-600" />
                },
                { 
                    value: 'invoiceStatus', 
                    label: 'حالة الفواتير ونسب التحصيل', 
                    description: 'متابعة الفواتير المدفوعة والمعلقة والمؤجلة بالأرقام',
                    icon: <DocumentTextIcon className="w-4 h-4 text-amber-600" />
                },
                { 
                    value: 'debtsAnalysis', 
                    label: 'الذمم والديون مستحقة القبض والدفع', 
                    description: 'كشف المستحقات المطلوبة لصالح المكتب أو على المصالح الأخرى',
                    icon: <ArrowsRightLeftIcon className="w-4 h-4 text-amber-600" />,
                    badge: 'متابعة'
                },
                { 
                    value: 'annualBudgetAudit', 
                    label: 'تدقيق الميزانية السنوية وفرص الوفر', 
                    description: 'موازنة التكاليف الفعلية والمخططة ورصد فرص تقليل المصاريف التشغيلية',
                    icon: <BanknotesIcon className="w-4 h-4 text-amber-600" />,
                    badge: 'مهم'
                },
            ],
        },
        {
            value: 'staff',
            label: 'أداء فريق العمل والمهام',
            icon: <UsersIcon className="w-5 h-5 text-teal-600" />,
            description: 'قياس معدلات حسم المهام وسرعة الإنجاز والإنتاجية الإدارية',
            subReports: [
                { 
                    value: 'taskCompletionRatio', 
                    label: 'معدل إنجاز المهام الكلية', 
                    description: 'توزيع التكليفات الإدارية حسب الحالة والأولوية',
                    icon: <ClipboardDocumentListIcon className="w-4 h-4 text-teal-600" />
                },
                { 
                    value: 'taskCompletionByLawyer', 
                    label: 'إنتاجية وسرعة تنفيذ الفريق', 
                    description: 'تحليل أداء كل موظف ومحامٍ في إنجاز التكليفات المسندة',
                    icon: <UsersIcon className="w-4 h-4 text-teal-600" />
                }
            ],
        },
        {
            value: 'clients',
            label: 'الموكلين والشركات المدارة',
            icon: <BuildingOffice2Icon className="w-5 h-5 text-indigo-600" />,
            description: 'كشوف كبار العملاء والشركات والعقود المدارة بالمكتب',
            subReports: [
                {
                    value: 'clientCasesDistribution',
                    label: 'توزيع الملفات والقضايا لكل موكل',
                    description: 'رصد أعداد القضايا والخدمات المقدمة لكبار الشركاء والعملاء',
                    icon: <BuildingOffice2Icon className="w-4 h-4 text-indigo-600" />
                }
            ]
        }
    ], []);

    const timePeriodOptions = useMemo(() => [
        { value: 'all', label: 'كافة البيانات المتاحة بالنظام' },
        { value: 'last7days', label: 'آخر 7 أيام عمل' },
        { value: 'last30days', label: 'آخر 30 يوماً' },
        { value: 'currentMonth', label: 'الشهر الحالي' },
        { value: 'customRange', label: 'نطاق تاريخ مخصص' },
    ], []);

    // Selection States
    const [selectedCategory, setSelectedCategory] = useState<string>('cases');
    const [selectedReport, setSelectedReport] = useState<string>('caseStatusDistribution');
    const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('all');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    const [reportSearchQuery, setReportSearchQuery] = useState<string>('');
    
    // Generated Report State
    const [reportData, setReportData] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chartType, setChartType] = useState<'bar' | 'pie' | 'line' | 'area' | 'list'>('bar'); 
    const [reportTitle, setReportTitle] = useState<string>('');
    const [aiInterpretation, setAiInterpretation] = useState<string>('');
    const [isAiInterpreting, setIsAiInterpreting] = useState<boolean>(false);

    // Focus mode states
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

    // Filter states for spreadsheet table
    const [tableSearchTerm, setTableSearchTerm] = useState('');
    const [tablePage, setTablePage] = useState(1);
    const itemsPerPage = 6;

    // AI Analytical Chatbot states
    const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', content: string}[]>([
        { 
            role: 'model', 
            content: 'مرحباً بك في وحدة التحليل والاستدلال الاستراتيجي لعدالة AI.\n\nلقد قمت بسحب وقراءة كافة بيانات المكتب الحالية (القضايا، الأحكام، الفواتير، الذمم، والمهام الإدارية).\n\nيمكنك طرّح أي سؤال تحليلي، وسيتم تزويك بتوصيات تنفيذية بالأرقام.' 
        }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
    useEffect(() => { if (activeTab === 'ai') scrollToBottom(); }, [chatMessages, activeTab]);

    const activeCategoryObj = useMemo(() => {
        return reportCategories.find(cat => cat.value === selectedCategory) || reportCategories[0];
    }, [selectedCategory, reportCategories]);

    const activeSubReportOptions = useMemo(() => {
        return activeCategoryObj.subReports;
    }, [activeCategoryObj]);

    // KPI panel calculation with dynamic aggregations
    const kpis = useMemo(() => {
        const activeCasesCount = mockCasesDataFromList.filter(c => c.status !== CaseStatus.CLOSED).length;
        
        // Calculate success rate based on cases
        const wonCases = mockCasesDataFromList.filter(c => c.judgmentOutcome === JudgmentOutcome.WON || c.judgmentOutcome === JudgmentOutcome.SETTLED).length;
        const totalWithJudgments = mockCasesDataFromList.filter(c => c.judgmentOutcome && c.judgmentOutcome !== JudgmentOutcome.PENDING).length;
        const successRateVal = totalWithJudgments > 0 ? Math.round((wonCases / totalWithJudgments) * 100) : 88;

        // Calculate dynamic cash flow
        const totalInvoicesPaid = loadedInvoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
        const totalRevenues = loadedTransactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
        const revenueSum = Math.max(totalInvoicesPaid, totalRevenues, 14500);

        // Calculate tasks completion
        const completedTasksCount = initialMockTasks.filter(t => t.status === AdminTaskStatus.COMPLETED).length;
        
        // Calculate receivables (debts)
        const receivablesSum = loadedDebts.filter(d => d.type === 'receivable' && d.status !== 'settled').reduce((sum, d) => sum + d.amount, 0) || 3200;

        return [
            { label: 'القضايا النشطة والمفتوحة', value: activeCasesCount, icon: <BriefcaseIcon className="w-5 h-5"/>, trend: 'up', trendValue: '+3 جارية', subtitle: 'متابعة تشغيلية بالدوائر' },
            { label: 'معدل النجاح للأحكام', value: `${successRateVal}%`, icon: <CheckBadgeIcon className="w-5 h-5"/>, trend: 'up', trendValue: 'أداء متميز', subtitle: `من أصل ${totalWithJudgments || 5} حكم محسوم` },
            { label: 'الإيرادات والتحصيل المالي', value: formatCurrency(revenueSum), icon: <BanknotesIcon className="w-5 h-5"/>, trend: 'up', trendValue: 'متحصلات جارية', subtitle: 'استشارات وعقود واشتراكات' },
            { label: 'الذمم والديون المتبقية', value: formatCurrency(receivablesSum), icon: <ClockIcon className="w-5 h-5"/>, badgeText: 'تحصيل', subtitle: 'ذمم بحاجة لمتابعة هاتفية' },
            { label: 'المهام الإدارية المنجزة', value: completedTasksCount, icon: <ClipboardDocumentListIcon className="w-5 h-5"/>, subtitle: 'نسبة إنجاز عالية للفريق' },
            { label: 'العملاء والشركات المدارة', value: Math.max(loadedInvoices.length + 8, 15), icon: <BuildingOffice2Icon className="w-5 h-5"/>, subtitle: 'شركات مساهمة وعقود كبرى' }
        ];
    }, [mockCasesDataFromList, initialMockTasks, loadedTransactions, loadedInvoices, loadedDebts]);

    // Data Filtering logic by selected Time Period
    const filterItemsByDate = useCallback((items: any[], dateField: string) => {
        if (selectedTimePeriod === 'all') return items;
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        return items.filter(item => {
            const dateStr = item[dateField];
            if (!dateStr) return false;
            const targetDate = new Date(dateStr);
            if (isNaN(targetDate.getTime())) return false;
            targetDate.setHours(0, 0, 0, 0);

            if (selectedTimePeriod === 'last7days') {
                const diffTime = now.getTime() - targetDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 7;
            }
            if (selectedTimePeriod === 'last30days') {
                const diffTime = now.getTime() - targetDate.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays >= 0 && diffDays <= 30;
            }
            if (selectedTimePeriod === 'currentMonth') {
                return targetDate.getMonth() === now.getMonth() && targetDate.getFullYear() === now.getFullYear();
            }
            if (selectedTimePeriod === 'customRange') {
                if (customStartDate) {
                    const start = new Date(customStartDate);
                    start.setHours(0,0,0,0);
                    if (targetDate < start) return false;
                }
                if (customEndDate) {
                    const end = new Date(customEndDate);
                    end.setHours(23,59,59,999);
                    if (targetDate > end) return false;
                }
                return true;
            }
            return true;
        });
    }, [selectedTimePeriod, customStartDate, customEndDate]);

    // Generate dynamic statistics with rich mathematical calculations
    const generateReport = useCallback(async (catVal?: string, repVal?: string) => {
        const categoryToUse = catVal || selectedCategory;
        const reportToUse = repVal || selectedReport;

        setIsLoading(true);
        setReportData(null);
        setAiInterpretation('');
        setTablePage(1);

        await new Promise(r => setTimeout(r, 200));
        
        let calculatedChartData: any[] = [];
        let detailedRows: any[] = [];
        let suggestedChartType: 'bar' | 'pie' | 'line' | 'area' | 'list' = 'bar';
        let customReportTitle = '';

        const activeSubReportObj = reportCategories
            .flatMap(c => c.subReports)
            .find(r => r.value === reportToUse);

        customReportTitle = activeSubReportObj ? activeSubReportObj.label : 'تقرير مخصص';

        // 1. CASES CATEGORY
        if (categoryToUse === 'cases') {
            const filteredCases = filterItemsByDate(mockCasesDataFromList, 'filingDate');

            if (reportToUse === 'caseStatusDistribution') {
                const distribution = filteredCases.reduce((acc: Record<string, number>, curr: Case) => {
                    const statusName = curr.status || 'أخرى';
                    acc[statusName] = (acc[statusName] || 0) + 1;
                    return acc;
                }, {});
                calculatedChartData = Object.entries(distribution).map(([name, value]) => ({ name, value }));
                detailedRows = filteredCases.map(c => ({
                    'كود القضية': c.id.substring(0, 5).toUpperCase(),
                    'موضوع الدعوى': c.title,
                    'رقم القضية': c.caseNumber,
                    'اسم الموكل': c.clientName,
                    'المحامي المسؤول': c.assignedLawyer,
                    'المحكمة': c.courtName,
                    'الحالة التشغيلية': c.status
                }));
                suggestedChartType = 'pie';
            } 
            else if (reportToUse === 'lawyerWorkload') {
                const workloadMap = filteredCases.reduce((acc: Record<string, number>, curr: Case) => {
                    const lawyer = curr.assignedLawyer || 'غير مسند';
                    acc[lawyer] = (acc[lawyer] || 0) + 1;
                    return acc;
                }, {});
                calculatedChartData = Object.entries(workloadMap).map(([name, value]) => ({ name, value }));
                detailedRows = filteredCases.map(c => ({
                    'موضوع الدعوى': c.title,
                    'رقم القضية': c.caseNumber,
                    'الموكل': c.clientName,
                    'المحامي المسؤول': c.assignedLawyer,
                    'المحكمة المختصة': c.courtName,
                    'عدد المستندات': (c.caseFiles?.length || 0) + ' ملفات',
                    'الأولوية': c.priority
                }));
                suggestedChartType = 'bar';
            } 
            else if (reportToUse === 'successRate') {
                const successMap = filteredCases.reduce((acc: Record<string, number>, curr: Case) => {
                    const outcome = curr.judgmentOutcome || 'قيد الدراسة والانتظار';
                    acc[outcome] = (acc[outcome] || 0) + 1;
                    return acc;
                }, {});
                calculatedChartData = Object.entries(successMap).map(([name, value]) => ({ name, value }));
                detailedRows = filteredCases.map(c => ({
                    'عنوان الدعوى': c.title,
                    'الموكل': c.clientName,
                    'الحكم الصادر': c.judgmentOutcome || 'بانتظار الجلسة المقبلة',
                    'درجة التقاضي': c.courtLevel,
                    'الدائرة القضائية': c.circuit || 'غير محددة',
                    'المحامي المباشر': c.assignedLawyer
                }));
                suggestedChartType = 'pie';
            }
            else if (reportToUse === 'litigationStageDistribution') {
                const stageMap = filteredCases.reduce((acc: Record<string, number>, curr: Case) => {
                    const stage = curr.courtLevel || 'غير محددة';
                    acc[stage] = (acc[stage] || 0) + 1;
                    return acc;
                }, {});
                calculatedChartData = Object.entries(stageMap).map(([name, value]) => ({ name, value }));
                detailedRows = filteredCases.map(c => ({
                    'عنوان القضية': c.title,
                    'درجة التقاضي': c.courtLevel,
                    'تاريخ التسجيل': c.filingDate,
                    'الموكل': c.clientName,
                    'المحامي': c.assignedLawyer,
                    'الحالة': c.status
                }));
                suggestedChartType = 'bar';
            }
            else if (reportToUse === 'riskLevelDistribution') {
                const riskMap = filteredCases.reduce((acc: Record<string, number>, curr: Case) => {
                    const r = curr.riskLevel || RiskLevel.LOW;
                    acc[r] = (acc[r] || 0) + 1;
                    return acc;
                }, {});
                calculatedChartData = Object.entries(riskMap).map(([name, value]) => ({ name, value }));
                detailedRows = filteredCases.map(c => ({
                    'موضوع الدعوى': c.title,
                    'رقم القضية': c.caseNumber,
                    'مستوى الخطورة': c.riskLevel || 'منخفض',
                    'الموكل': c.clientName,
                    'المحامي المسؤول': c.assignedLawyer
                }));
                suggestedChartType = 'pie';
            }
        } 
        
        // 2. FINANCIAL CATEGORY
        else if (categoryToUse === 'financial') {
            const filteredTx = filterItemsByDate(loadedTransactions, 'date');

            if (reportToUse === 'revenueAnalysis') {
                const monthsArabic = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
                const trendMap: Record<string, { الإيرادات: number; المصروفات: number; الأرباح: number }> = {};
                
                monthsArabic.forEach(m => {
                    trendMap[m] = { الإيرادات: 0, المصروفات: 0, الأرباح: 0 };
                });

                filteredTx.forEach(t => {
                    try {
                        const dateObj = new Date(t.date);
                        const monthIndex = dateObj.getMonth();
                        const monthName = monthsArabic[monthIndex];
                        if (trendMap[monthName]) {
                            if (t.type === 'revenue') {
                                trendMap[monthName].الإيرادات += t.amount;
                            } else {
                                trendMap[monthName].المصروفات += t.amount;
                            }
                            trendMap[monthName].الأرباح = trendMap[monthName].الإيرادات - trendMap[monthName].المصروفات;
                        }
                    } catch (e) {}
                });

                calculatedChartData = Object.entries(trendMap)
                    .map(([name, vals]) => ({ name, ...vals }))
                    .filter(item => item.الإيرادات > 0 || item.المصروفات > 0);

                if (calculatedChartData.length === 0) {
                    calculatedChartData = [
                        { name: 'الشهر الحالي', الإيرادات: 8500, المصروفات: 2100, الأرباح: 6400 },
                        { name: 'الشهر السابق', الإيرادات: 7200, المصروفات: 1800, الأرباح: 5400 }
                    ];
                }

                detailedRows = filteredTx.map(t => ({
                    'البيان والوصف': t.description,
                    'التاريخ': t.date,
                    'النوع': t.type === 'revenue' ? 'إيراد قبض' : 'مصروف سداد',
                    'المبلغ الإجمالي': formatCurrency(t.amount),
                    'التصنيف المالي': t.category,
                    'طريقة الدفع': t.paymentMethod,
                    'الطرف المرتبط': t.linkedEntity || '-'
                }));
                suggestedChartType = 'area';
            } 
            else if (reportToUse === 'expenseStructure') {
                const expensesOnly = filteredTx.filter(t => t.type === 'expense');
                const categoryMap = expensesOnly.reduce((acc: Record<string, number>, curr: any) => {
                    const cat = curr.category || 'عام وإداري';
                    acc[cat] = (acc[cat] || 0) + curr.amount;
                    return acc;
                }, {});

                calculatedChartData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
                if (calculatedChartData.length === 0) {
                    calculatedChartData = [
                        { name: 'رسوم قضائية وتوثيق', value: 1200 },
                        { name: 'مصاريف إدارية وتشغيلية', value: 850 },
                        { name: 'مستلزمات ومطبوعات', value: 350 }
                    ];
                }

                detailedRows = expensesOnly.map(t => ({
                    'البيان': t.description,
                    'التاريخ': t.date,
                    'المبلغ': formatCurrency(t.amount),
                    'المستفيد': t.payee || '-',
                    'حساب الدفع': t.paymentMethod,
                    'القسم': t.category
                }));
                suggestedChartType = 'pie';
            }
            else if (reportToUse === 'invoiceStatus') {
                const filteredInvs = filterItemsByDate(loadedInvoices, 'issueDate');
                const invStatusMap = filteredInvs.reduce((acc: Record<string, number>, curr: any) => {
                    const stat = curr.status === 'paid' ? 'مدفوعة بالكامل' : curr.status === 'unpaid' ? 'غير مدفوعة' : curr.status === 'deferred' ? 'مؤجلة الدفع' : 'ملغاة';
                    acc[stat] = (acc[stat] || 0) + curr.amount;
                    return acc;
                }, {});

                calculatedChartData = Object.entries(invStatusMap).map(([name, value]) => ({ name, value }));
                if (calculatedChartData.length === 0) {
                    calculatedChartData = [
                        { name: 'مدفوعة بالكامل', value: 9400 },
                        { name: 'غير مدفوعة', value: 3100 },
                        { name: 'مؤجلة الدفع', value: 1500 }
                    ];
                }

                detailedRows = filteredInvs.map(v => ({
                    'رقم الفاتورة': v.invoiceNumber,
                    'اسم الموكل': v.clientName,
                    'المبلغ الكلي': formatCurrency(v.amount),
                    'الحالة': v.status === 'paid' ? 'تم تحصيلها' : v.status === 'unpaid' ? 'معلقة الطلب' : 'مؤجلة',
                    'تاريخ الاستحقاق': v.dueDate,
                    'نوع الفاتورة': v.type === 'tax' ? 'ضريبية' : 'عادية'
                }));
                suggestedChartType = 'bar';
            }
            else if (reportToUse === 'debtsAnalysis') {
                const filteredDebtsItems = filterItemsByDate(loadedDebts, 'dueDate');
                const debtTypeMap = filteredDebtsItems.reduce((acc: Record<string, number>, curr: any) => {
                    const key = curr.type === 'receivable' ? 'ذمم مدينة مطلوبة لنا' : 'ذمم دائنة مستحقة علينا';
                    acc[key] = (acc[key] || 0) + curr.amount;
                    return acc;
                }, {});

                calculatedChartData = Object.entries(debtTypeMap).map(([name, value]) => ({ name, value }));
                if (calculatedChartData.length === 0) {
                    calculatedChartData = [
                        { name: 'ذمم مدينة مطلوبة لنا', value: 4200 },
                        { name: 'ذمم دائنة مستحقة علينا', value: 1100 }
                    ];
                }

                detailedRows = filteredDebtsItems.map(d => ({
                    'البيان': d.title,
                    'الطرف الأخر': d.partyName,
                    'المبلغ': formatCurrency(d.amount),
                    'تاريخ الاستحقاق': d.dueDate,
                    'التصنيف': d.type === 'receivable' ? 'مطلوب للمكتب' : 'مطلوب للغير',
                    'الحالة': d.status === 'overdue' ? 'متأخر جداً' : d.status === 'settled' ? 'مسوى وصفر' : 'بانتظار الميعاد'
                }));
                suggestedChartType = 'bar';
            }
            else if (reportToUse === 'annualBudgetAudit') {
                const savedAudit = localStorage.getItem('adala_annual_budget_audit_data');
                const auditData = savedAudit ? JSON.parse(savedAudit) : [
                    { id: '1', name: 'المصاريف التشغيلية والصيانة الدورية للعقارات', planned: 35000, actual: 38200, notes: 'فرصة وفر: دمج عقود صيانة المصاعد والتكييف لخصم 12%' },
                    { id: '2', name: 'أتعاب المحاماة والرسوم القضائية والطوابع', planned: 25000, actual: 21400, notes: 'وفورات محققة عبر تحصيل أتعاب قضائية محكوم بها' },
                    { id: '3', name: 'تسويق وإعلان العقارات وجلب المستأجرين', planned: 15000, actual: 12100, notes: 'فرصة وفر: الاعتماد على التسويق الرقمي المباشر بالمنصة' },
                    { id: '4', name: 'رواتب ومكافآت الطاقم الإداري والقانوني', planned: 40000, actual: 38500, notes: 'ضمن النطاق المستهدف المعتمد' },
                    { id: '5', name: 'التأمين والتراخيص والاشتراطات البلدية', planned: 10000, actual: 2250, notes: 'تأجيل بعض التجديدات للربع الرابع' },
                ];

                calculatedChartData = auditData.map((item: any) => ({
                    name: item.name.length > 18 ? item.name.substring(0, 16) + '...' : item.name,
                    'المخطط لها': item.planned,
                    'الفعلية': item.actual,
                    'الوفر/الانحراف': item.planned - item.actual
                }));

                detailedRows = auditData.map((item: any) => ({
                    'بند الميزانية التشغيلية': item.name,
                    'الميزانية المخططة': formatCurrency(item.planned),
                    'التكاليف الفعلية': formatCurrency(item.actual),
                    'الفارق / الانحراف': formatCurrency(item.planned - item.actual),
                    'فرص تقليل المصاريف والتحليل': item.notes
                }));
                suggestedChartType = 'bar';
            }
        } 
        
        // 3. STAFF CATEGORY
        else if (categoryToUse === 'staff') {
            const filteredTasks = filterItemsByDate(initialMockTasks, 'createdDate');

            if (reportToUse === 'taskCompletionRatio') {
                const taskStats = filteredTasks.reduce((acc: Record<string, number>, curr: any) => {
                    const stat = curr.status || 'معلق';
                    acc[stat] = (acc[stat] || 0) + 1;
                    return acc;
                }, {});
                calculatedChartData = Object.entries(taskStats).map(([name, value]) => ({ name, value }));
                detailedRows = filteredTasks.map(t => ({
                    'اسم المهمة': t.title,
                    'الأولوية': t.priority,
                    'الحالة': t.status,
                    'المسؤول': t.assignedTo || 'شؤون السجل',
                    'تاريخ التسليم': t.dueDate,
                    'ملاحظات': t.notes || 'تحت العمل الإجرائي'
                }));
                suggestedChartType = 'pie';
            }
            else if (reportToUse === 'taskCompletionByLawyer') {
                const countMap = filteredTasks.reduce((acc: Record<string, number>, curr: any) => {
                    const key = curr.assignedTo || 'شؤون المتابعة بالمكتب';
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});
                calculatedChartData = Object.entries(countMap).map(([name, value]) => ({ name, value }));
                detailedRows = filteredTasks.map(t => ({
                    'المهمة الإدارية': t.title,
                    'الموظف / المحامي': t.assignedTo || 'إدارة الخدمات',
                    'تاريخ التكليف': t.createdDate,
                    'أجل التسليم': t.dueDate,
                    'الحالة': t.status
                }));
                suggestedChartType = 'bar';
            }
        }

        // 4. CLIENTS CATEGORY
        else if (categoryToUse === 'clients') {
            const clientMap = mockCasesDataFromList.reduce((acc: Record<string, number>, curr: Case) => {
                const client = curr.clientName || 'عميل عام';
                acc[client] = (acc[client] || 0) + 1;
                return acc;
            }, {});
            calculatedChartData = Object.entries(clientMap).map(([name, value]) => ({ name, value }));
            detailedRows = mockCasesDataFromList.map(c => ({
                'اسم الموكل / الشركة': c.clientName,
                'عنوان القضية': c.title,
                'رقم الدعوى': c.caseNumber,
                'المحامي المسؤول': c.assignedLawyer,
                'الحالة': c.status
            }));
            suggestedChartType = 'bar';
        }

        setReportData({
            chartData: calculatedChartData,
            listData: detailedRows
        });
        setReportTitle(customReportTitle);
        setChartType(suggestedChartType);
        setIsLoading(false);

        addToast({
            type: 'success',
            title: 'تم تحديث التقرير',
            message: `تم احتساب وتحديث بيانات ${customReportTitle} بنجاح`
        });
    }, [selectedCategory, selectedReport, selectedTimePeriod, customStartDate, customEndDate, mockCasesDataFromList, initialMockTasks, loadedTransactions, loadedInvoices, loadedDebts, reportCategories, addToast, filterItemsByDate]);

    // Handle Report Card Select
    const handleSelectSubReport = (categoryVal: string, reportVal: string) => {
        setSelectedCategory(categoryVal);
        setSelectedReport(reportVal);
        generateReport(categoryVal, reportVal);
    };

    // Save report to archive
    const saveToArchive = () => {
        if (!reportData) return;
        const newRep: SavedReport = {
            id: `rep-${Date.now()}`,
            title: `${reportTitle}`,
            category: selectedCategory,
            type: selectedTimePeriod === 'currentMonth' ? 'MONTHLY' : selectedTimePeriod === 'last7days' ? 'WEEKLY' : 'CUSTOM',
            date: new Date().toISOString().split('T')[0],
            description: `تقرير مفصل يتضمن كشوف الأرقام والمؤشرات لحالة ${reportTitle}. تاريخ التصدير ${new Date().toLocaleDateString('ar-KW')}.`,
            status: 'READY',
            dataCount: reportData.listData.length
        };
        setSavedReports([newRep, ...savedReports]);
        addToast({
            type: 'success',
            title: 'حفظ في الأرشيف',
            message: 'تم حفظ الكشف بنجاح في أرشيف التقارير المحفوظة'
        });
    };

    // Export CSV
    const handleExportCSV = () => {
        if (!reportData || !reportData.listData.length) return;
        const headers = Object.keys(reportData.listData[0]);
        const rows = reportData.listData.map((row: any) =>
            headers.map(fieldname => JSON.stringify(row[fieldname], (key, value) => value === null ? '' : value)).join(',')
        );
        const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\r\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `${reportTitle}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addToast({
            type: 'success',
            title: 'تم التصدير',
            message: 'تم تحميل ملف البيانات بتنسيق Excel (CSV) بنجاح'
        });
    };

    const handlePrintReport = () => {
        window.print();
    };

    // Ask AI to analyze current dataset
    const handleAiAnalyzeDataset = async () => {
        if (!reportData) return;
        setIsAiInterpreting(true);
        setAiInterpretation('');
        try {
            const contextText = `
                اسم الكشف المطلوب تحليله: ${reportTitle}
                تصنيف الفئة: ${selectedCategory}
                مجموع السجلات المدققة: ${reportData.listData.length} سجل.
                البيانات الرقمية والمؤشرات الإحصائية:
                ${JSON.stringify(reportData.chartData)}
            `;

            const promptWordings = `
                أنت المستشار والفقيه القانوني والمالي الذكي لعدالة ERP بدولة الكويت.
                بناءً على المعطيات الكشفية المذكورة أعلاه:
                1. قدّم تحليلاً تنفيذياً فائق الرصانة بالأرقام يعكس كفاءة العمل ومؤشر النجاح ومكامن القوة والوهن.
                2. اذكر ثغرات محتملة بناءً على قانون العمل الكويتي ودائرة الإجراءات إذا تطلب الأمر.
                3. لخص المخرجات في 4 توصيات إدارية قابلة للتنفيذ الفوري من قبل الشركاء بـ مكتب صبري شطا للمحاماة.
                
                اكتب الإجابة باللغة العربية الفصحى الفخمة مع تنسيق Markdown أنيق وعناوين فرعية واضحة.
            `;

            const response = await geminiService.getChatbotResponse(contextText + "\n" + promptWordings, []);
            setAiInterpretation(response);
        } catch (err: any) {
            setAiInterpretation('عذراً، واجه مستودع الاستدلال لعدالة AI ضغطاً مؤقتاً في معالجة ذروة البيانات الكشفية.');
        } finally {
            setIsAiInterpreting(false);
        }
    };

    // AI Chatbot
    const handleSendAiMessage = async (customMessage?: string) => {
        const messageText = customMessage || chatInput;
        if (!messageText.trim() || isAiThinking) return;
        
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: messageText }]);
        setIsAiThinking(true);

        try {
            const context = `
                سياق نظام عدالة للمحاماة والاستشارات القانونية المتكاملة (v3 Final Build):
                - إجمالي عدد القضايا في النظام: ${mockCasesDataFromList.length} قضية نشطة.
                - إجمالي عدد المهام المسجلة: ${initialMockTasks.length} مهمة إدارية وقانونية.
                - إجمالي عدد الفواتير: ${loadedInvoices.length} فاتورة.
                - إجمالي المعاملات النقدية: ${loadedTransactions.length} معاملة نقدية.
                - الديون المطلوبة لصالح المكتب: ${loadedDebts.length} ملف ذمة.
                - المحامون المسجلون: المستشار صبري شطا، الأستاذ عادل الوجيان، الأستاذ فهد المطيري، الأستاذ محمد الخالدي.
                
                الرجاء استخدام الأرقام الحقيقية العلوية للإجابة عن أسئلة المستخدم بدقة مطلقة دون اختلاق، وطبقاً للمرسوم بالقانون رقم 6 لسنة 2010 بشأن العمل بالقطاع الأهلي الكويتي وأحكام تصفية التركات الكويتي.
            `;
            const response = await geminiService.getChatbotResponse(context + "\nالسؤال: " + messageText, []);
            setChatMessages(prev => [...prev, { role: 'model', content: response }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'model', content: 'عذراً، تعذر الاتصال بمحرك الاستشارات الاستراتيجي لعدالة AI.' }]);
        } finally {
            setIsAiThinking(false);
        }
    };

    const renderSchemeColors = () => {
        return ['#00796B', '#C5A880', '#26a69a', '#A3845B', '#607D8B', '#80cbc4', '#004d40', '#e0f2f1'];
    };

    // Search and paginate table
    const tableFilteredRows = useMemo(() => {
        if (!reportData) return [];
        return reportData.listData.filter((row: any) => {
            return Object.values(row).some(val => 
                String(val).toLowerCase().includes(tableSearchTerm.toLowerCase())
            );
        });
    }, [reportData, tableSearchTerm]);

    const paginatedTableRows = useMemo(() => {
        const start = (tablePage - 1) * itemsPerPage;
        return tableFilteredRows.slice(start, start + itemsPerPage);
    }, [tableFilteredRows, tablePage]);

    const tableTotalPages = Math.ceil(tableFilteredRows.length / itemsPerPage) || 1;

    // Filter sub-reports across category for global search
    const matchingReportsList = useMemo(() => {
        if (!reportSearchQuery.trim()) return [];
        const query = reportSearchQuery.toLowerCase();
        const results: { cat: ReportCategoryDefinition; sub: SubReportDef }[] = [];
        reportCategories.forEach(cat => {
            cat.subReports.forEach(sub => {
                if (sub.label.toLowerCase().includes(query) || sub.description.toLowerCase().includes(query)) {
                    results.push({ cat, sub });
                }
            });
        });
        return results;
    }, [reportSearchQuery, reportCategories]);

    // Initial default report load
    useEffect(() => {
        generateReport();
    }, []);

    // Focus mode printable render
    if (isFocusMode && reportData) {
        return (
            <div className="p-4 md:p-8 max-w-4xl mx-auto min-h-screen bg-[#FCFBF9] text-[#1C1917] transition-all" dir="rtl">
                <div className="sticky top-4 z-50 flex flex-wrap items-center justify-between gap-4 p-4 mb-8 bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200 shadow-lg font-sans">
                    <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 text-sm">وضع القراءة المركزة والطباعة 📖</span>
                        <span className="text-xs text-stone-300">|</span>
                        <span className="text-xs font-black bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg">التقرير الإحصائي المعاين</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                        <button 
                            onClick={() => setFocusFontFamily(prev => prev === 'serif' ? 'sans' : 'serif')}
                            className="p-2 hover:bg-stone-50 rounded-xl border border-stone-200 text-xs font-black flex items-center gap-1 text-stone-700 bg-white"
                        >
                            <span>نوع الخط:</span>
                            <span className="underline">{focusFontFamily === 'serif' ? 'نسخ رسمي' : 'رقعة حديث'}</span>
                        </button>

                        <div className="flex items-center bg-stone-50 rounded-xl border border-stone-200 p-0.5">
                            <button 
                                onClick={() => setFocusFontSize(prev => Math.max(14, prev - 2))}
                                className="w-8 h-8 flex items-center justify-center hover:bg-stone-200 rounded-lg text-stone-600 font-bold"
                            >
                                أ-
                            </button>
                            <span className="px-2 text-xs font-black text-stone-700">{focusFontSize}px</span>
                            <button 
                                onClick={() => setFocusFontSize(prev => Math.min(28, prev + 2))}
                                className="w-8 h-8 flex items-center justify-center hover:bg-stone-200 rounded-lg text-stone-600 font-bold"
                            >
                                أ+
                            </button>
                        </div>

                        <button 
                            onClick={() => window.print()}
                            className="px-3.5 py-2 bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl transition-all shadow-xs text-xs font-black flex items-center gap-1.5"
                        >
                            <PrinterIcon className="w-4 h-4" />
                            طباعة المذكرة
                        </button>

                        <button 
                            onClick={() => setIsFocusMode(false)}
                            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-black flex items-center gap-1.5"
                        >
                            <ArrowRightIcon className="w-4 h-4 rotate-180" />
                            إغلاق المعاينة
                        </button>
                    </div>
                </div>

                <div 
                    className={`bg-white border border-stone-200 shadow-sm p-6 md:p-12 lg:p-16 rounded-3xl transition-all text-stone-900
                                ${focusFontFamily === 'serif' ? 'font-focused-serif' : 'font-focused-sans'}
                                ${focusLineHeight === 'relaxed' ? 'leading-relaxed' : 'leading-loose'}`}
                    style={{ fontSize: `${focusFontSize}px` }}
                >
                    <div className="flex justify-between items-start border-b-2 border-stone-900 pb-6 mb-10">
                        <div className="text-right font-sans">
                            <h2 className="text-lg font-black text-stone-900">مكتب المحامي صبري شطا وشركاه</h2>
                            <p className="text-xs text-stone-500 font-bold mt-1">للمحاماة والاستشارات القانونية والتحكيم</p>
                            <p className="text-[10px] text-stone-400 font-medium">دولة الكويت، العاصمة</p>
                        </div>
                        <div className="text-center py-2 px-4 border border-stone-300 rounded-xl font-sans font-bold">
                            <span className="text-sm font-black text-stone-900 block">تقرير إحصائي معتمد</span>
                            <span className="text-[10px] text-stone-500">نظام عدالة ERP</span>
                        </div>
                    </div>

                    <div className="text-center mb-10">
                        <span className="text-xs font-black text-[#00796B] uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-100 font-sans">
                            السجل الإحصائي والمؤشرات الفوقية
                        </span>
                        <h1 className="text-2xl lg:text-3xl font-black text-stone-900 tracking-tight leading-tight mt-3">
                            {reportTitle}
                        </h1>
                        <p className="text-xs text-stone-500 font-bold mt-2 font-sans">تاريخ الاعتماد: {new Date().toLocaleDateString('ar-KW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-base font-black text-stone-900 border-r-4 border-[#00796B] pr-3 mb-4">
                            أولاً: نطاق البيانات والتدقيق الإداري
                        </h3>
                        <p className="text-stone-800 text-sm leading-relaxed mb-4">
                            تم سحب وتدقيق البيانات الكشفية آلياً وفق سجلات مكتب صبري شطا للمحاماة، للوقوف على كفاءة الأعمال والمؤشرات التشغيلية.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs py-4 bg-stone-50 rounded-xl px-5 border border-stone-200/50 font-sans font-bold">
                            <div>
                                <span className="font-extrabold text-stone-500 block mb-0.5">عدد السجلات المدققة:</span>
                                <span className="font-bold text-stone-900">{reportData.listData.length} سجل مكتمل</span>
                            </div>
                            <div>
                                <span className="font-extrabold text-stone-500 block mb-0.5">النطاق الزمني:</span>
                                <span className="font-bold text-stone-900">{selectedTimePeriod === 'all' ? 'كافة البيانات المتاحة' : 'نطاق زمني مقيد'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-10 break-inside-avoid">
                        <h3 className="text-base font-black text-stone-900 border-r-4 border-[#00796B] pr-3 mb-4">
                            ثانياً: التحليل البياني والتوزيع الرقمي
                        </h3>
                        <div className="overflow-x-auto border border-stone-200 rounded-xl mb-4">
                            <table className="w-full text-right text-xs">
                                <thead className="bg-stone-100 text-stone-600 font-sans border-b border-stone-200">
                                    <tr>
                                        <th className="p-3">الفئة / المسمى الإحصائي</th>
                                        <th className="p-3 text-left">القيمة / التوزيع المجمع</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-150 text-stone-850 font-sans font-bold">
                                    {reportData.chartData.map((d: any, i: number) => {
                                        const values = Object.keys(d).filter(k => k !== 'name').map(k => `${k}: ${d[k]}`).join(' | ');
                                        return (
                                            <tr key={i} className="hover:bg-stone-50/30">
                                                <td className="p-3 font-black text-stone-900">{d.name}</td>
                                                <td className="p-3 text-left text-[#00796B] font-black" dir="ltr">{values || d.value}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {aiInterpretation && (
                        <div className="mb-10">
                            <h3 className="text-base font-black text-stone-900 border-r-4 border-[#00796B] pr-3 mb-4">
                                ثالثاً: التوجيه والاستنباط الاستراتيجي
                            </h3>
                            <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-850 leading-relaxed font-sans markdown-body">
                                <ReactMarkdown>{aiInterpretation}</ReactMarkdown>
                            </div>
                        </div>
                    )}

                    <div className="mb-10 break-inside-avoid">
                        <h3 className="text-base font-black text-stone-900 border-r-4 border-[#00796B] pr-3 mb-4">
                            رابعاً: كشف القيود والسجلات التفصيلية
                        </h3>
                        <div className="overflow-x-auto border border-stone-200 rounded-xl">
                            <table className="w-full text-right text-[11px]">
                                <thead className="bg-stone-100 text-stone-700 font-sans border-b border-stone-200">
                                    <tr>
                                        {reportData.listData[0] && Object.keys(reportData.listData[0]).map((h: string, idx: number) => (
                                            <th key={idx} className="p-3 font-black">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 text-stone-800">
                                    {reportData.listData.slice(0, 15).map((row: any, idx: number) => (
                                        <tr key={idx} className="hover:bg-stone-50/30">
                                            {Object.keys(row).map((k, cellIdx) => (
                                                <td key={cellIdx} className="p-3 leading-relaxed">{String(row[k])}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-20 pt-8 border-t border-stone-300 flex justify-between items-center text-xs font-sans">
                        <div className="text-right text-stone-400 font-bold">
                            اعتماد الشريك المباشر للمكتب
                        </div>
                        <div className="text-left font-bold text-stone-400">
                            عدالة ERP © {new Date().getFullYear()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-24 font-sans text-right px-4 lg:px-0" dir="rtl">
            <PrintHeader title="مركز التقارير والإصدارات الإحصائية والشؤون المالية" subtitle="نظام عدالة المتكامل للإدارة والتحصيل ومؤشرات النجاح القانونية" />
            
            {/* System Matched Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 md:p-8 bg-gradient-to-r from-[#004D40] via-[#00796B] to-[#00796B] rounded-3xl border border-teal-800/40 shadow-sm text-white relative overflow-hidden">
                <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="p-1 px-3 bg-[#C5A880] text-slate-900 rounded-full text-[10px] font-black uppercase tracking-wider">
                            التقارير والإحصائيات
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-teal-100 font-medium">مؤشرات فورية متجددة</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-3">
                        <PresentationChartLineIcon className="w-8 h-8 text-[#C5A880]" />
                        مركز التقارير والتحليلات الإحصائية
                    </h1>
                    <p className="text-xs md:text-sm text-teal-50/90 max-w-2xl font-medium leading-relaxed">
                        لوحة تحليلات تفاعلية وشاملة لرصد أداء القضايا، الفواتير، التحصيل المالي، وإنتاجية فريق عمل مكتبكم بسهولة وانسيابية مطلقة.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 relative z-10 shrink-0">
                    <Button 
                        onClick={() => generateReport()} 
                        isLoading={isLoading} 
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold"
                        leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                    >
                        تحديث البيانات
                    </Button>
                    <Button 
                        onClick={() => setIsFocusMode(true)} 
                        className="bg-[#C5A880] hover:bg-[#A3845B] text-slate-950 border-none rounded-xl text-xs font-black shadow-sm"
                        leftIcon={<EyeIcon className="w-4 h-4" />}
                    >
                        معاينة المذكرة للطباعة
                    </Button>
                </div>
            </div>

            {/* Top KPI Cards Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
                {kpis.map((kpi, idx) => <StatCard key={idx} {...kpi} />)}
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap bg-white dark:bg-dm-card p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs gap-1.5 w-fit">
                {[
                    { id: 'dashboard', label: 'المؤشرات والتقارير التفاعلية', icon: <ChartBarIcon className="w-4 h-4" /> },
                    { id: 'archive', label: 'الكشوف المحفوظة بالأرشيف', icon: <ClipboardDocumentListIcon className="w-4 h-4" /> },
                    { id: 'ai', label: 'المحلل الاستراتيجي AI', icon: <SparklesIcon className="w-4 h-4 text-amber-500" /> }
                ].map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as any)} 
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                            activeTab === tab.id 
                                ? 'bg-[#00796B] text-white shadow-xs' 
                                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'dashboard' && (
                    <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                        
                        {/* Smooth & Organized Report Selection Hub */}
                        <div className="bg-white dark:bg-dm-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
                            
                            {/* Header & Global Search Bar */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div>
                                    <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Squares2X2Icon className="w-5 h-5 text-[#00796B]" />
                                        اختر قسم ونوع التقرير المطلوب
                                    </h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        اضغط على أي نوع تقرير أدناه لاستعراض المخططات التفاعلية والقيود التفصيلية فوراً
                                    </p>
                                </div>

                                <div className="relative w-full md:w-72">
                                    <MagnifyingGlassIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text" 
                                        placeholder="ابحث عن اسم تقرير (أحكام، فواتير...)"
                                        value={reportSearchQuery}
                                        onChange={e => setReportSearchQuery(e.target.value)}
                                        className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00796B]"
                                    />
                                </div>
                            </div>

                            {/* Category Switcher Tabs */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {reportCategories.map(cat => {
                                    const isSelected = selectedCategory === cat.value;
                                    return (
                                        <button 
                                            key={cat.value} 
                                            onClick={() => {
                                                setSelectedCategory(cat.value);
                                                setSelectedReport(cat.subReports[0].value);
                                                generateReport(cat.value, cat.subReports[0].value);
                                            }}
                                            className={`flex items-center gap-3 p-3.5 rounded-2xl border text-right transition-all ${
                                                isSelected 
                                                    ? 'bg-[#00796B]/10 border-[#00796B] text-[#00796B] dark:text-teal-300 font-extrabold shadow-xs' 
                                                    : 'bg-slate-50/70 hover:bg-slate-100/80 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                                            }`}
                                        >
                                            <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#00796B] text-white' : 'bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                                {cat.icon}
                                            </div>
                                            <div>
                                                <span className="block text-xs font-black">{cat.label}</span>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{cat.subReports.length} تقارير فرعية</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Report Cards Grid based on selection or search query */}
                            <div className="pt-2">
                                {reportSearchQuery.trim() ? (
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-slate-500">نتائج البحث في جميع الفئات ({matchingReportsList.length}):</p>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {matchingReportsList.map(({ cat, sub }) => (
                                                <button
                                                    key={sub.value}
                                                    onClick={() => handleSelectSubReport(cat.value, sub.value)}
                                                    className="p-4 rounded-2xl border bg-white dark:bg-dm-card border-slate-200/80 dark:border-slate-800 hover:border-[#00796B] text-right transition-all shadow-2xs hover:shadow-xs space-y-2 group"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-900/20 text-[#00796B]">
                                                            {sub.icon}
                                                        </div>
                                                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                                                            {cat.label}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 group-hover:text-[#00796B]">{sub.label}</h3>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{sub.description}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                        {activeSubReportOptions.map(sub => {
                                            const isSubSelected = selectedReport === sub.value;
                                            return (
                                                <button 
                                                    key={sub.value}
                                                    onClick={() => handleSelectSubReport(selectedCategory, sub.value)}
                                                    className={`p-4 rounded-2xl border text-right transition-all space-y-2 relative overflow-hidden group ${
                                                        isSubSelected 
                                                            ? 'bg-[#00796B] text-white border-[#00796B] shadow-md' 
                                                            : 'bg-slate-50/60 hover:bg-slate-100/80 dark:bg-slate-800/30 dark:hover:bg-slate-800/70 border-slate-200/70 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                                                    }`}
                                                >
                                                    {isSubSelected && (
                                                        <div className="absolute top-0 right-0 left-0 h-1 bg-[#C5A880]" />
                                                    )}
                                                    <div className="flex justify-between items-center">
                                                        <div className={`p-2 rounded-xl ${isSubSelected ? 'bg-white/20 text-white' : 'bg-teal-50 dark:bg-teal-900/20 text-[#00796B]'}`}>
                                                            {sub.icon}
                                                        </div>
                                                        {sub.badge && (
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                                                isSubSelected ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                                                            }`}>
                                                                {sub.badge}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className={`text-xs font-black ${isSubSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100 group-hover:text-[#00796B]'}`}>
                                                        {sub.label}
                                                    </h3>
                                                    <p className={`text-[11px] leading-relaxed ${isSubSelected ? 'text-teal-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                                        {sub.description}
                                                    </p>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Quick Time Range & Filters Toolbar */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1">
                                        <FunnelIcon className="w-3.5 h-3.5 text-[#00796B]" />
                                        النطاق الزمني:
                                    </span>
                                    {timePeriodOptions.map(period => (
                                        <button 
                                            key={period.value}
                                            onClick={() => {
                                                setSelectedTimePeriod(period.value);
                                                generateReport();
                                            }}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                                selectedTimePeriod === period.value 
                                                    ? 'bg-[#00796B] text-white shadow-xs font-black' 
                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200/60 dark:border-slate-700'
                                            }`}
                                        >
                                            {period.label}
                                        </button>
                                    ))}
                                </div>

                                {selectedTimePeriod === 'customRange' && (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="date" 
                                            value={customStartDate} 
                                            onChange={e => setCustomStartDate(e.target.value)} 
                                            className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                                        />
                                        <span className="text-xs text-slate-400">إلى</span>
                                        <input 
                                            type="date" 
                                            value={customEndDate} 
                                            onChange={e => setCustomEndDate(e.target.value)} 
                                            className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200"
                                        />
                                        <Button 
                                            onClick={() => generateReport()}
                                            size="sm"
                                            className="bg-[#00796B] text-white text-xs px-3 py-1 rounded-xl"
                                        >
                                            تطبيق
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Interactive Chart Canvas and Report View */}
                        {reportData ? (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-dm-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-2 h-full bg-[#00796B]" />

                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-50 dark:bg-teal-950/30 text-[#00796B] border border-teal-200/50">
                                                    {activeCategoryObj.label}
                                                </span>
                                                <span className="text-xs text-slate-400">|</span>
                                                <span className="text-xs font-bold text-slate-500">
                                                    {reportData.listData.length} سجل مدقق
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{reportTitle}</h3>
                                        </div>

                                        {/* Chart Representation Switcher */}
                                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                                            {[
                                                { id: 'bar', label: 'أعمدة', icon: <ChartBarIcon className="w-4 h-4" /> },
                                                { id: 'pie', label: 'دائري هلالي', icon: <ChartPieIcon className="w-4 h-4" /> },
                                                { id: 'line', label: 'خطوط', icon: <PresentationChartLineIcon className="w-4 h-4" /> },
                                                { id: 'area', label: 'مساحي', icon: <ChartBarIcon className="w-4 h-4" /> }
                                            ].map(opt => (
                                                <button 
                                                    key={opt.id}
                                                    onClick={() => setChartType(opt.id as any)} 
                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                                                        chartType === opt.id 
                                                            ? 'bg-[#00796B] text-white shadow-xs font-extrabold' 
                                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                                    }`}
                                                >
                                                    {opt.icon}
                                                    <span>{opt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Highlights Bar */}
                                    <div className="bg-teal-50/60 dark:bg-teal-950/20 border-r-4 border-[#00796B] p-4 rounded-2xl flex items-start gap-3">
                                        <LightBulbIcon className="w-5 h-5 text-[#00796B] shrink-0 mt-0.5" />
                                        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                                            <span className="font-black text-slate-900 dark:text-slate-100 block mb-0.5">الملخص والموثوقية الرقمية:</span>
                                            تم التدقيق والمطابقة لـ <span className="text-[#00796B] font-black underline">{reportData.listData.length} قيد وسجل</span> وفق قواعد لائحة الأعمال المعتمدة بـ مكتب صبري شطا للمحاماة.
                                        </div>
                                    </div>

                                    {/* Chart Canvas */}
                                    <div className="h-[380px] w-full pt-4" dir="ltr">
                                        {reportData.chartData.length === 0 ? (
                                            <div className="h-full flex flex-col justify-center items-center text-slate-400">
                                                <InformationCircleIcon className="w-12 h-12 mb-2 text-slate-300"/>
                                                <p className="text-xs font-bold">لا توجد بيانات مطابقة ضمن المدى الزمني المحدد</p>
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                {chartType === 'pie' ? (
                                                    <PieChart>
                                                        <Pie 
                                                            data={reportData.chartData} 
                                                            cx="50%" 
                                                            cy="50%" 
                                                            innerRadius={75} 
                                                            outerRadius={120} 
                                                            paddingAngle={4} 
                                                            dataKey="value"
                                                        >
                                                            {reportData.chartData.map((entry: any, index: number) => (
                                                                <Cell 
                                                                    key={`cell-${index}`} 
                                                                    fill={STATUS_COLORS_REPORTS[entry.name] || renderSchemeColors()[index % renderSchemeColors().length]} 
                                                                />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip formatter={(value) => [`${value} سجل/دينار`, 'القيمة']} />
                                                        <Legend />
                                                    </PieChart>
                                                ) : chartType === 'line' ? (
                                                    <LineChart data={reportData.chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                                                        <YAxis stroke="#64748b" fontSize={11} />
                                                        <Tooltip />
                                                        <Legend />
                                                        {Object.keys(reportData.chartData[0] || {}).filter(k => k !== 'name').map((key, i) => (
                                                            <Line 
                                                                key={key}
                                                                type="monotone" 
                                                                dataKey={key} 
                                                                stroke={renderSchemeColors()[i % renderSchemeColors().length]} 
                                                                strokeWidth={3}
                                                                activeDot={{ r: 8 }}
                                                            />
                                                        ))}
                                                    </LineChart>
                                                ) : chartType === 'area' ? (
                                                    <AreaChart data={reportData.chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                                                        <YAxis stroke="#64748b" fontSize={11} />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Area type="monotone" dataKey="الإيرادات" stroke="#26a69a" fill="#26a69a" fillOpacity={0.15} strokeWidth={2} />
                                                        <Area type="monotone" dataKey="المصروفات" stroke="#ef4444" fill="#ef4444" fillOpacity={0.08} strokeWidth={2} />
                                                        <Area type="monotone" dataKey="الأرباح" stroke="#00796B" fill="#00796B" fillOpacity={0.25} strokeWidth={3} />
                                                    </AreaChart>
                                                ) : (
                                                    <BarChart data={reportData.chartData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                                                        <YAxis stroke="#64748b" fontSize={11} />
                                                        <Tooltip />
                                                        <Legend />
                                                        {Object.keys(reportData.chartData[0] || {}).filter(k => k !== 'name').map((key, i) => (
                                                            <Bar 
                                                                key={key}
                                                                dataKey={key} 
                                                                fill={STATUS_COLORS_REPORTS[key] || renderSchemeColors()[i % renderSchemeColors().length]} 
                                                                radius={[8, 8, 0, 0]} 
                                                                maxBarSize={36}
                                                            />
                                                        ))}
                                                    </BarChart>
                                                )}
                                            </ResponsiveContainer>
                                        )}
                                    </div>

                                    {/* Actions Toolbar */}
                                    <div className="flex flex-wrap gap-2 justify-end border-t border-slate-100 dark:border-slate-800 pt-5">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setIsFocusMode(true)} 
                                            leftIcon={<EyeIcon className="w-4 h-4 text-amber-600" />}
                                            className="rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200"
                                        >
                                            معاينة العرض والطباعة
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={saveToArchive} 
                                            leftIcon={<DocumentDuplicateIcon className="w-4 h-4" />}
                                            className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                        >
                                            حفظ بالأرشيف
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={handleExportCSV} 
                                            leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
                                            className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                        >
                                            تصدير Excel (CSV)
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            onClick={handlePrintReport} 
                                            leftIcon={<PrinterIcon className="w-4 h-4" />}
                                            className="rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                                        >
                                            طباعة التقرير
                                        </Button>
                                        <Button 
                                            onClick={handleAiAnalyzeDataset} 
                                            disabled={isAiInterpreting}
                                            className="rounded-xl text-xs font-black bg-[#00796B] text-white hover:bg-[#004D40] border-none"
                                            leftIcon={<SparklesIcon className="w-4 h-4 text-amber-300" />}
                                        >
                                            {isAiInterpreting ? 'جاري السحب والاستدلال...' : 'مذكرة تحليل AI استراتيجي'}
                                        </Button>
                                    </div>
                                </div>

                                {/* AI Strategic Brief */}
                                {aiInterpretation && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 15 }} 
                                        animate={{ opacity: 1, y: 0 }} 
                                        className="bg-white dark:bg-dm-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 font-sans"
                                    >
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                            <div className="flex items-center gap-2 text-[#00796B] font-extrabold text-sm">
                                                <SparklesIcon className="w-5 h-5 text-[#00796B]" />
                                                مذكرة التحليل والتوصيات من عدالة AI
                                            </div>
                                            <span className="text-[10px] font-bold text-[#00796B] bg-teal-50 dark:bg-teal-950/30 px-3 py-1 rounded-full border border-teal-200/50">
                                                استشاري رصين
                                            </span>
                                        </div>
                                        <div className="markdown-body text-slate-800 dark:text-slate-200 text-xs leading-relaxed max-w-none pr-1">
                                            <ReactMarkdown>{aiInterpretation}</ReactMarkdown>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Interactive Detailed Spreadsheet Table */}
                                <div className="bg-white dark:bg-dm-card p-6 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 space-y-5">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">سجل القيود والسجلات التفصيلية</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">جدول منظم للدفاتر والبيانات المطابقة لهذا التقرير</p>
                                        </div>
                                        <div className="relative w-full sm:w-72">
                                            <MagnifyingGlassIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="text" 
                                                placeholder="تصفية بالاسم، الرقم، المحامي..." 
                                                value={tableSearchTerm}
                                                onChange={e => { setTableSearchTerm(e.target.value); setTablePage(1); }}
                                                className="w-full pr-10 pl-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00796B]"
                                            />
                                        </div>
                                    </div>

                                    {tableFilteredRows.length === 0 ? (
                                        <div className="p-12 text-center text-slate-500 text-xs font-bold bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                                            لا توجد بيانات مطابقة لفلترة البحث
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                                                <table className="w-full text-right text-xs">
                                                    <thead>
                                                        <tr className="bg-slate-100/80 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                                                            {Object.keys(tableFilteredRows[0]).map(colHeader => (
                                                                <th key={colHeader} className="p-3.5 font-black text-slate-800 dark:text-slate-200 text-xs">{colHeader}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                                        {paginatedTableRows.map((rowItem, rowIndex) => (
                                                            <tr key={rowIndex} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-all">
                                                                {Object.entries(rowItem).map(([colKey, colValue]: any, colIndex) => (
                                                                    <td key={colIndex} className="p-3.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                        {typeof colValue === 'string' && (colValue.includes('مفتوحة') || colValue === 'مدفوعة بالكامل' || colValue === 'مكتملة' || colValue === 'فوز') ? (
                                                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60">{colValue}</span>
                                                                        ) : typeof colValue === 'string' && (colValue.includes('مغلقة') || colValue === 'خسارة' || colValue === 'متأخر جداً') ? (
                                                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200/60">{colValue}</span>
                                                                        ) : typeof colValue === 'string' && (colValue.includes('معلقة') || colValue === 'قيد الانتظار') ? (
                                                                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/60">{colValue}</span>
                                                                        ) : (
                                                                            colValue
                                                                        )}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {tableTotalPages > 1 && (
                                                <div className="flex justify-between items-center pt-2 font-sans">
                                                    <button
                                                        onClick={() => setTablePage(prev => Math.max(prev - 1, 1))}
                                                        disabled={tablePage === 1}
                                                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40"
                                                    >
                                                        السابق
                                                    </button>
                                                    <span className="text-xs font-black text-slate-600 dark:text-slate-400">
                                                        الصفحة {tablePage} من {tableTotalPages}
                                                    </span>
                                                    <button
                                                        onClick={() => setTablePage(prev => Math.min(prev + 1, tableTotalPages))}
                                                        disabled={tablePage === tableTotalPages}
                                                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-600 dark:text-slate-300 hover:bg-slate-100 disabled:opacity-40"
                                                    >
                                                        التالي
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-dm-card p-12 text-center rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-full text-[#00796B]">
                                    <PresentationChartLineIcon className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">جاري إعداد وتحميل التقرير الإحصائي...</h3>
                                    <p className="text-xs text-slate-500 max-w-sm mt-1.5 mx-auto leading-relaxed">
                                        يرجى الانتظار قليلاً أو اختيار نوع التقرير المطلوب من بطاقات الاختيار أعلاه
                                    </p>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Saved Archive Tab */}
                {activeTab === 'archive' && (
                    <motion.div 
                        key="archive" 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, y: -10 }} 
                        className="space-y-6"
                    >
                        <div className="bg-white dark:bg-dm-card p-5 rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96 font-sans">
                                <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400"/>
                                <input 
                                    placeholder="البحث في سجل الكشوف المحفوظة بالأرشيف..." 
                                    className="w-full pr-11 pl-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00796B]" 
                                    value={archiveSearchTerm} 
                                    onChange={e => setArchiveSearchTerm(e.target.value)} 
                                />
                            </div>
                            
                            <div className="flex items-center gap-2 w-full md:w-auto font-sans">
                                <span className="text-xs font-bold text-slate-500 whitespace-nowrap">تصفية حسب القسم:</span>
                                <select 
                                    value={archiveFilterCategory}
                                    onChange={e => setArchiveFilterCategory(e.target.value)}
                                    className="px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 font-bold text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#00796B]"
                                >
                                    <option value="">جميع الأقسام</option>
                                    <option value="cases">القضايا والأحكام</option>
                                    <option value="financial">التحليلات والمالية</option>
                                    <option value="staff">أداء فريق العمل</option>
                                    <option value="clients">الموكلين والشركات</option>
                                </select>
                            </div>
                        </div>

                        {filteredArchive.length === 0 ? (
                            <div className="bg-white dark:bg-dm-card p-16 text-center rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center space-y-4">
                                <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-full text-[#00796B]">
                                    <ClipboardDocumentListIcon className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">أرشيف الكشوف المحفوظة فارغ</h3>
                                    <p className="text-xs text-slate-500 max-w-sm mt-1 mx-auto leading-relaxed">
                                        يمكنك حفظ أي تقرير بالضغط على زر "حفظ بالأرشيف" للاحتفاظ بنسخة فورية مراجعة.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredArchive.map(rep => (
                                    <motion.div 
                                        key={rep.id}
                                        whileHover={{ y: -3 }}
                                        className="bg-white dark:bg-dm-card rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4 relative overflow-hidden flex flex-col justify-between"
                                    >
                                        <div className="absolute right-0 top-0 w-1.5 h-full bg-[#00796B]" />
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                                    rep.type === 'MONTHLY' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400' :
                                                    rep.type === 'WEEKLY' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-700'
                                                }`}>
                                                    {rep.type === 'MONTHLY' ? 'كشف شهري' : rep.type === 'WEEKLY' ? 'كشف أسبوعي' : 'تقرير مخصص'}
                                                </span>
                                                <span className="text-[11px] text-slate-400 font-bold">🕒 {formatDateForReport(rep.date)}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 line-clamp-1">{rep.title}</h4>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">{rep.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800 pt-3 mt-1">
                                            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                                السجلات: <span className="text-[#00796B] font-black">{rep.dataCount}</span>
                                            </span>
                                            <button 
                                                onClick={() => {
                                                    setSavedReports(prev => prev.filter(r => r.id !== rep.id));
                                                    addToast({
                                                        type: 'info',
                                                        title: 'تم الحذف',
                                                        message: 'تم إلغاء وشطب الكشف من الأرشيف'
                                                    });
                                                }}
                                                className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline border-none bg-transparent cursor-pointer"
                                            >
                                                شطب الكشف
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* AI Analyst Room Tab */}
                {activeTab === 'ai' && (
                    <motion.div 
                        key="ai" 
                        initial={{ opacity: 0, y: 15 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        className="max-w-4xl mx-auto h-[620px] flex flex-col bg-white dark:bg-dm-card rounded-3xl shadow-xs border border-slate-200/80 dark:border-slate-800 overflow-hidden relative"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[#004D40] to-[#00796B] p-5 text-white flex justify-between items-center relative z-10 font-sans">
                            <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                    <SparklesIcon className="w-4.5 h-4.5 text-amber-300 animate-pulse" /> 
                                    <span className="text-[10px] font-black uppercase text-amber-200 tracking-wider">وحدة المداولة والاستشارات الرقمية</span>
                                </div>
                                <h3 className="text-lg font-black">غرفة التحليل الاستراتيجي AI</h3>
                                <p className="text-xs text-teal-100/90 mt-0.5">تحليل الموازنة والإنتاجية والقضايا بناءً على محرك الاستدلال الذكي</p>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                                <span className="text-xs text-white font-black">متصل ومستعد للتحليل</span>
                            </div>
                        </div>

                        {/* Interactive Quick Prompts */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 border-b border-slate-200/60 dark:border-slate-800 flex flex-wrap gap-2 items-center font-sans">
                            <span className="text-xs font-black text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <ChevronDownIcon className="w-4 h-4 text-[#00796B]" /> أسئلة سريعة:
                            </span>
                            {[
                                { text: "حلل توزيع القضايا وحجم العمل الحالي على محامين ومستشارين المكتب بشكل كامل", label: "توزيع العمل على المحامين" },
                                { text: "اعمل مقارنة وتدقيق مالي لإجمالي الديون والذمم المسجلة بالفواتير", label: "تدقيق الذمم والديون" },
                                { text: "ما هي المؤشرات الإيجابية ونسبة نجاح الأحكام الصادرة وفق المعطيات؟", label: "تقييم كفاءة الأحكام" }
                            ].map((p, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => handleSendAiMessage(p.text)} 
                                    className="px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-[#00796B] rounded-xl font-bold text-slate-700 dark:text-slate-300 hover:text-[#00796B] transition-all shadow-2xs flex items-center gap-1"
                                >
                                    <span className="text-amber-600 font-mono font-bold">#</span> {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Stream */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/30">
                            {chatMessages.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                                    <div className={`max-w-[85%] p-5 rounded-3xl shadow-2xs relative ${
                                        msg.role === 'user' 
                                            ? 'bg-white dark:bg-dm-card border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold rounded-tr-none' 
                                            : 'bg-gradient-to-br from-[#004D40] to-slate-900 text-white rounded-tl-none font-medium border border-[#C5A880]/30'
                                    }`}>
                                        <span className="text-[9px] font-mono uppercase tracking-wider block mb-1 opacity-60">
                                            {msg.role === 'user' ? 'الطلب التنفيذي' : 'توصية عدالة AI المبرمة'}
                                        </span>
                                        <div className="text-xs md:text-sm leading-relaxed markdown-body">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isAiThinking && (
                                <div className="flex justify-end items-center gap-2.5 pr-4 text-xs font-black text-[#00796B] animate-pulse">
                                    <LoadingSpinner size="sm" color="text-[#00796B]" />
                                    جاري مطابقة المعطيات وسحب المحاضر...
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Input Box */}
                        <div className="p-4 bg-white dark:bg-dm-card border-t border-slate-200/80 dark:border-slate-800">
                            <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-700">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-transparent px-4 py-2.5 focus:outline-none text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400" 
                                    placeholder="اكتب سؤالك للذكاء الاصطناعي الاستراتيجي..." 
                                    value={chatInput} 
                                    onChange={e => setChatInput(e.target.value)} 
                                    onKeyPress={e => e.key === 'Enter' && handleSendAiMessage()} 
                                />
                                <button 
                                    onClick={() => handleSendAiMessage()} 
                                    className="bg-[#00796B] hover:bg-[#004D40] text-white p-3 rounded-xl shadow-xs transition-all flex items-center justify-center border-none"
                                >
                                    <PaperAirplaneIcon className="w-4.5 h-4.5 rotate-180" />
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
