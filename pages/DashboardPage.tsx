import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { 
    BriefcaseIcon, UsersIcon, BuildingOffice2Icon, 
    ShieldCheckIcon, BanknotesIcon, DocumentTextIcon, SparklesIcon, 
    BookOpenIcon, DocumentDuplicateIcon, BrainIcon, BuildingLibraryIcon, 
    UserGroupIcon, BellAlertIcon, ListBulletIcon, 
    GavelIcon, ClockIcon, 
    CalendarDaysIcon, 
    PlusCircleIcon,
    TrendingUpIcon, ArrowLeftIcon, ArrowRightIcon,
    ScaleIcon,
    ClipboardIcon, 
    WrenchScrewdriverIcon,
    PresentationChartLineIcon,
    MagnifyingGlassIcon,
    ClipboardListCheckIcon
} from '../constants'; 
import { 
    AlertCircle, 
    CheckCircle2, 
    Calendar, 
    ArrowRight, 
    Search, 
    LayoutDashboard, 
    PieChart, 
    MessageSquare, 
    Settings2,
    Check,
    AlertTriangle,
    Eye,
    Briefcase,
    CheckSquare,
    Play,
    Pause,
    History,
    Shield,
    TrendingUp,
    FileText,
    Activity,
    ExternalLink
} from 'lucide-react';
import Logo from '../components/ui/Logo';
import { useCaseTask } from '../components/CaseTaskContext';
import { AdminTaskStatus, CaseStatus, AdminTaskPriority } from '../types';
import { cn } from '../lib/utils';
import { 
    AreaChart, 
    Area, 
    BarChart,
    Bar,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from 'recharts';

// Import our system-wide mock data to provide accurate dynamic analytics
import { mockAnalyzedContracts } from '../data/contractAnalysisData';
import { initialMockCompanies } from '../data/companyMockData';
import { mockProperties, mockLeaseAgreements } from '../data/propertyData';
import { sampleEmployees } from '../data/employeeData';

const DashboardPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tasks, hearings, cases, updateHearingStatus, updateTaskStatus } = useCaseTask();
    
    // UI Local State for interactive filtering & custom user actions
    const [searchTerm, setSearchTerm] = useState('');
    const [activeChartTab, setActiveChartTab] = useState<'litigation' | 'financial'>('litigation');
    const [hearingSearch, setHearingSearch] = useState('');
    const [taskSearch, setTaskSearch] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Auto update clock every second
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Arabic live greeting based on daytime hours
    const greetingText = useMemo(() => {
        const hours = currentTime.getHours();
        if (hours < 12) return 'صباح الخير والعدالة';
        if (hours < 17) return 'مساء النور والاستشارات';
        return 'مساء الخير، مرحباً بك مجدداً';
    }, [currentTime]);

    // Live Date formatting inside Islamic/Kuwaiti calendar format
    const formattedDate = useMemo(() => {
        return currentTime.toLocaleDateString('ar-KW', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }, [currentTime]);

    const formattedTime = useMemo(() => {
        return currentTime.toLocaleTimeString('ar-KW', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
    }, [currentTime]);

    // --- Dynamic Calculation of Kpis & Sparklines ---
    const systemKpis = useMemo(() => {
        const activeCasesCount = cases.filter(c => c.status !== CaseStatus.CLOSED).length;
        const totalCases = cases.length || 1;
        const caseIncompletePercent = Math.round((activeCasesCount / totalCases) * 100);

        const scheduledHearings = hearings.filter(h => h.status === 'Scheduled').length;
        const totalHearings = hearings.length || 1;
        const activeHearingPercent = Math.round((scheduledHearings / totalHearings) * 100);

        const pendingTasksCount = tasks.filter(t => t.status !== AdminTaskStatus.COMPLETED).length;
        const totalTasks = tasks.length || 1;
        const pendingTasksPercent = Math.round((pendingTasksCount / totalTasks) * 100);

        const clientSet = new Set(cases.map(c => c.clientName));
        const totalClientsCount = clientSet.size + initialMockCompanies.length;

        const managedPropertiesCount = mockProperties.length;
        const activeLeasesCount = mockLeaseAgreements.length;

        const analyzedContractsCount = mockAnalyzedContracts.length;

        return [
            {
                id: 'cases',
                title: 'القضايا النشطة والمفتوحة',
                value: activeCasesCount,
                subtitle: 'نسبة القضايا تحت الائتلاف',
                percent: 100 - caseIncompletePercent,
                percentLabel: 'مغلقة وبحكم فاصل',
                icon: BriefcaseIcon,
                color: "from-blue-500 to-indigo-600 dark:from-blue-600/30 dark:to-indigo-500/30",
                iconBg: "bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400",
                link: "/cases"
            },
            {
                id: 'hearings',
                title: 'الرول الآلي والجلسات المجدولة',
                value: scheduledHearings,
                subtitle: 'أجندة المحاكم النشطة',
                percent: activeHearingPercent,
                percentLabel: 'جلسات مجدولة قائمة',
                icon: GavelIcon,
                color: "from-rose-500 to-amber-500 dark:from-rose-600/30 dark:to-amber-500/30",
                iconBg: "bg-rose-50 text-rose-600 dark:bg-rose-900/10 dark:text-rose-400",
                link: "/automated-docket"
            },
            {
                id: 'tasks',
                title: 'المهام والعمليات المعلقة',
                value: pendingTasksCount,
                subtitle: 'مؤشر استكمال الأعمال الإدارية',
                percent: 100 - pendingTasksPercent,
                percentLabel: 'أعمال منجزة بنجاح',
                icon: ClipboardListCheckIcon,
                color: "from-amber-500 to-orange-400 dark:from-amber-600/30 dark:to-orange-500/30",
                iconBg: "bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400",
                link: "/admin-tools/tasks"
            },
            {
                id: 'clients',
                title: 'محفظة الموكلين المشتركة',
                value: totalClientsCount,
                subtitle: `عقود شركات: ${initialMockCompanies.length} | أفراد: ${clientSet.size}`,
                percent: 88,
                percentLabel: 'تفاعل قانوني مستمر',
                icon: UserGroupIcon,
                color: "from-purple-500 to-pink-500 dark:from-purple-600/30 dark:to-pink-500/30",
                iconBg: "bg-purple-50 text-purple-600 dark:bg-purple-900/10 dark:text-purple-400",
                link: "/contacts"
            },
            {
                id: 'properties',
                title: 'إدارة الأملاك التعاقدية',
                value: managedPropertiesCount,
                subtitle: `العقود الإيجارية القائمة: ${activeLeasesCount}`,
                percent: 74,
                percentLabel: 'معدل الإشغال التعاقدي',
                icon: BuildingOffice2Icon,
                color: "from-emerald-500 to-teal-500 dark:from-emerald-600/30 dark:to-teal-500/30",
                iconBg: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400",
                link: "/property-management"
            },
            {
                id: 'contracts',
                title: 'الدراسات والتحليلات التعاقدية',
                value: analyzedContractsCount,
                subtitle: 'مسودات خاضعة للتدقيق الذكي',
                percent: 92,
                percentLabel: 'تحليل أمن وبنود الالتزام',
                icon: BrainIcon,
                color: "from-cyan-500 to-blue-500 dark:from-cyan-600/30 dark:to-blue-500/30",
                iconBg: "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/10 dark:text-cyan-400",
                link: "/contract-analysis"
            }
        ];
    }, [cases, hearings, tasks]);

    // Get priority highlights/legal alerts
    const legalAlerts = useMemo(() => {
        const alerts: { id: string; text: string; action: string; badge: string; type: 'urgent' | 'warning' | 'info' }[] = [];
        
        // Appeal warnings (appealed cases or statuette of limitations limits)
        cases.forEach(c => {
            if (c.priority === 'عاجلة' && c.status === CaseStatus.OPEN) {
                alerts.push({
                    id: `alert-case-${c.id}`,
                    badge: 'قضية عاجلة',
                    text: `يتطلب مباشرة إجراء دفاعي لقضية: ${c.title} (${c.caseNumber})`,
                    action: `/cases?id=${c.id}`,
                    type: 'urgent'
                });
            }
        });

        // High priority tasks past deadline or close
        tasks.slice(0, 3).forEach(t => {
            if (t.priority === AdminTaskPriority.CRITICAL || t.priority === AdminTaskPriority.HIGH) {
                if (t.status !== AdminTaskStatus.COMPLETED) {
                    alerts.push({
                        id: `alert-task-${t.id}`,
                        badge: 'مهمة حرجة',
                        text: `الموعد النهائي يقترب للمستند القانوني: ${t.title}`,
                        action: `/admin-tools/tasks`,
                        type: 'warning'
                    });
                }
            }
        });

        // Safe fallback alert if none are calculated
        if (alerts.length === 0) {
            alerts.push({
                id: 'sys-info-safe',
                badge: 'نظام آمن',
                text: 'كافة المعاملات القانونية ومواعيد التقادم والجلسات تحت الإدارة المستقرة بموجب اللائحة.',
                action: '/automated-docket',
                type: 'info'
            });
        }

        return alerts;
    }, [cases, tasks]);

    // --- Dynamic Charts Calculations ---
    const caseTypeChartData = useMemo(() => {
        const counts: Record<string, number> = {};
        cases.forEach(c => {
            const key = c.caseMainType || 'أخرى';
            counts[key] = (counts[key] || 0) + 1;
        });

        return Object.entries(counts).map(([name, value]) => ({
            name,
            value,
            percentage: Math.round((value / cases.length) * 100)
        }));
    }, [cases]);

    // Month index performance
    const litigationPerformanceData = [
        { name: 'يناير', 'القضايا المنجزة': 12, 'قيد الدراسة': 8 },
        { name: 'فبراير', 'القضايا المنجزة': 18, 'قيد الدراسة': 15 },
        { name: 'مارس', 'القضايا المنجزة': 24, 'قيد الدراسة': 10 },
        { name: 'أبريل', 'القضايا المنجزة': 31, 'قيد الدراسة': 14 },
        { name: 'مايو', 'القضايا المنجزة': 29, 'قيد الدراسة': 18 },
        { name: 'يونيو', 'القضايا المنجزة': 38, 'قيد الدراسة': 13 },
    ];

    const financialChartData = [
        { name: 'الأسبوع 1', 'المبالغ المحصلة': 4200, 'الرسوم القضائية': 1200 },
        { name: 'الأسبوع 2', 'المبالغ المحصلة': 6800, 'الرسوم القضائية': 2300 },
        { name: 'الأسبوع 3', 'المبالغ المحصلة': 5100, 'الرسوم القضائية': 1500 },
        { name: 'الأسبوع 4', 'المبالغ المحصلة': 9400, 'الرسوم القضائية': 3100 },
    ];

    // Filtered lists for interactive search
    const filteredHearings = useMemo(() => {
        return hearings
            .filter(h => {
                const query = hearingSearch.toLowerCase();
                return (
                    h.caseTitle?.toLowerCase().includes(query) ||
                    h.clientName?.toLowerCase().includes(query) ||
                    h.courtRoomOrLocation?.toLowerCase().includes(query) ||
                    (h.type && h.type.toLowerCase().includes(query))
                );
            })
            .slice(0, 5); // display top 5
    }, [hearings, hearingSearch]);

    const filteredTasks = useMemo(() => {
        return tasks
            .filter(t => {
                const query = taskSearch.toLowerCase();
                return (
                    t.title.toLowerCase().includes(query) ||
                    (t.description && t.description.toLowerCase().includes(query)) ||
                    t.assignedTo.toLowerCase().includes(query) ||
                    t.category.toLowerCase().includes(query)
                );
            })
            .slice(0, 5);
    }, [tasks, taskSearch]);

    // Active client overview list
    const recentClientsList = useMemo(() => {
        return cases.slice(0, 4).map(c => ({
            id: c.id,
            name: c.clientName,
            status: c.status,
            type: c.caseMainType,
            num: c.caseNumber,
            date: c.filingDate
        }));
    }, [cases]);

    // Recent system activities - unified real logs
    const unifiedLogs = useMemo(() => {
        const logs = [
            { id: 'log-1', action: 'اعتماد عقد تأسيس وتعديل حصص الشركاء', time: 'منذ 10 دقائق', user: 'م. أحمد الجابر', type: 'contract', badge: 'شؤون الشركات' },
            { id: 'log-2', action: 'رفع صحيفة الاستئناف الفرعي لإدارة التنفيذ الكلية', time: 'منذ ساعة', user: 'الأستاذ صبري شطا', type: 'case', badge: 'درجة الاستئناف' },
            { id: 'log-3', action: 'تحصيل الرسوم الثابتة والمصروفات الإدارية بقيمة 230 د.ك', time: 'منذ ساعتين', user: 'إدارة الحسابات', type: 'finance', badge: 'التحصيل المالي' },
            { id: 'log-4', action: 'إيداع المسودة الهندسية من الخبير المنتدب بالقضية', time: 'منذ 4 ساعات', user: 'مكتب الخبراء', type: 'admin', badge: 'أعمال الخبراء' },
            { id: 'log-5', action: 'تعديل وثيقة سرية للمستأجر بالعمارة الاستثمارية الثالثة', time: 'منذ يوم', user: 'مساعد قضائي', type: 'property', badge: 'إيصالات الإيجار' }
        ];
        return logs;
    }, []);

    // Interactive toggle status callback handler
    const toggleTask = (taskId: string, currentStatus: AdminTaskStatus) => {
        const nextStatus = currentStatus === AdminTaskStatus.COMPLETED 
            ? AdminTaskStatus.IN_PROGRESS 
            : AdminTaskStatus.COMPLETED;
        updateTaskStatus(taskId, nextStatus);
    };

    const advanceHearing = (hearingId: string, currentStatus: any) => {
        const statuses: ('Scheduled' | 'Completed' | 'Postponed' | 'Cancelled')[] = [
            'Scheduled',
            'Completed',
            'Postponed',
            'Cancelled'
        ];
        const currentIndex = statuses.indexOf(currentStatus);
        const nextIndex = (currentIndex + 1) % statuses.length;
        updateHearingStatus(hearingId, statuses[nextIndex]);
    };

    return (
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-6 animate-in fade-in duration-500" dir="rtl">
            
            {/* --- CORE WORKSPACE WELCOME HEADER --- */}
            <div className="relative overflow-hidden bg-gradient-to-l from-slate-900 via-slate-950 to-primary-light/10 dark:from-dm-card dark:via-dm-background dark:to-accent/5 p-6 sm:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 shadow-sm mb-8">
                {/* Visual Glow Ornamentations */}
                <div className="absolute top-[-200px] left-[-200px] w-96 h-96 rounded-full bg-primary/15 blur-[120px]" />
                <div className="absolute bottom-[-150px] right-[-100px] w-80 h-80 rounded-full bg-accent/10 blur-[100px]" />

                <div className="relative z-10 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
                    <div className="flex items-center gap-5">
                        <div className="p-1 border border-white/10 dark:border-slate-800 rounded-[2rem] shadow-xl shrink-0">
                            <div className="bg-slate-950 p-4 rounded-[1.8rem] border border-white/5 flex items-center justify-center">
                                <Logo variant="light" hideText iconClassName="w-9 h-9 text-accent" />
                            </div>
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight font-tajawal">
                                    {greetingText}، المحامي صبري شطا
                                </h1>
                                <span className="px-2.5 py-0.5 bg-accent text-primary-dark font-black rounded-lg text-[9px] uppercase tracking-wide">
                                    الإدارة القانونية العليا
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-bold">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-accent" /> {formattedDate}</span>
                                <span className="hidden sm:inline-block text-slate-700">|</span>
                                <span className="flex items-center gap-1.5 font-mono"><ClockIcon className="w-3.5 h-3.5 text-accent" /> {formattedTime}</span>
                                <span className="hidden sm:inline-block text-slate-700">|</span>
                                <span className="text-emerald-400 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    الاتصال بالخادم متمكن وآمن
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Search Console and Actions */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
                        <div className="relative flex-1 sm:min-w-[320px] group">
                            <Search className="absolute right-4.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-accent transition-colors" />
                            <input 
                                type="text" 
                                placeholder="البحث والتقصي السريع عن ملف أو خصم..." 
                                className="w-full pr-11 pl-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/10 dark:border-slate-800 rounded-[1.5rem] text-xs font-bold text-white placeholder-slate-400 focus:bg-white/15 focus:ring-4 focus:ring-accent/10 focus:border-accent/40 transition-all outline-none"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    // Mirror search across widgets
                                    setHearingSearch(e.target.value);
                                    setTaskSearch(e.target.value);
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Link to="/cases" className="flex-1 sm:flex-none">
                                <button className="w-full sm:w-auto px-5 py-3.5 bg-accent hover:bg-accent/95 active:scale-95 text-primary-dark font-black text-xs rounded-2xl shadow-lg shadow-accent/15 transition-all flex items-center justify-center gap-2">
                                    <PlusCircleIcon className="w-4.5 h-4.5 shrink-0" />
                                    تسجيل دعوى جديدة
                                </button>
                            </Link>
                            <Link to="/ai-assistant">
                                <button className="p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-accent transition-all">
                                    <SparklesIcon className="w-4.5 h-4.5" />
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- URGENT WARNING CENTER (TICKER ALERTS) --- */}
            {legalAlerts.length > 0 && (
                <div className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {legalAlerts.map((alert) => (
                            <div 
                                key={alert.id}
                                className={cn(
                                    "p-4 rounded-2xl border flex items-start gap-3 shadow-inner relative overflow-hidden transition-all duration-300 hover:shadow-md",
                                    alert.type === 'urgent' 
                                        ? "bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-300"
                                        : alert.type === 'warning'
                                        ? "bg-amber-50/50 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300"
                                        : "bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-300"
                                )}
                            >
                                <div className="absolute top-0 right-0 w-1.5 h-full bg-current opacity-80" />
                                <div className="p-2 bg-white dark:bg-dm-card rounded-xl shrink-0 shadow-sm">
                                    {alert.type === 'urgent' && <AlertCircle className="w-4 h-4 text-rose-500" />}
                                    {alert.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                                    {alert.type === 'info' && <Shield className="w-4 h-4 text-blue-500" />}
                                </div>
                                <div className="flex-1 min-w-0 text-right">
                                    <span className="text-[9px] font-black uppercase tracking-wider block mb-0.5 opacity-70">
                                        {alert.badge}
                                    </span>
                                    <p className="text-[11px] font-bold leading-relaxed truncate">
                                        {alert.text}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => navigate(alert.action)}
                                    className="p-1.5 hover:bg-white dark:hover:bg-dm-card rounded-lg transition-colors group text-current shrink-0"
                                >
                                    <ArrowLeftIcon className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* --- CORE BENTO SYSTEM KPIS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-10">
                {systemKpis.map((kpi, index) => {
                    const IconComp = kpi.icon;
                    return (
                        <motion.div
                            key={kpi.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            onClick={() => navigate(kpi.link)}
                            className="bg-white dark:bg-dm-card rounded-[2rem] border border-slate-100 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-xl hover:border-accent/30 transition-all duration-300 cursor-pointer group flex flex-col justify-between h-52 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex items-center justify-between">
                                <div className={cn("p-2.5 rounded-xl transition-all duration-300 group-hover:scale-110", kpi.iconBg)}>
                                    <IconComp className="w-5 h-5" />
                                </div>
                                <div className="w-6 h-6 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 items-center justify-center flex opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                </div>
                            </div>

                            <div className="mt-4">
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block mb-0.5">
                                    {kpi.title}
                                </span>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight tabular-nums mb-2">
                                    {kpi.value}
                                </h3>
                            </div>

                            <div className="space-y-1 mt-auto">
                                <div className="flex justify-between items-center text-[9px] font-bold text-slate-500 dark:text-slate-400">
                                    <span>{kpi.percentLabel}</span>
                                    <span>{kpi.percent}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-accent rounded-full transition-all duration-500" 
                                        style={{ width: `${kpi.percent}%` }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* --- DETAILED DATA ANALYSIS & LIVE METRICS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                
                {/* Visual Chart Hub */}
                <div className="lg:col-span-8 flex flex-col bg-white dark:bg-dm-card rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm justify-between">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                                <PresentationChartLineIcon className="w-5 h-5 text-accent" />
                                الرصد البياني ونشاطات المنظومة
                            </h2>
                            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                                Unified System Analytics Console
                            </p>
                        </div>
                        
                        <div className="flex bg-slate-50 dark:bg-dm-background p-1 rounded-xl border border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => setActiveChartTab('litigation')}
                                className={cn(
                                    "px-4 py-2 text-xs font-black rounded-lg transition-all",
                                    activeChartTab === 'litigation'
                                        ? "bg-white dark:bg-dm-card text-primary dark:text-accent shadow-sm"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                )}
                            >
                                كفاءة التقاضي والمنازعات
                            </button>
                            <button
                                onClick={() => setActiveChartTab('financial')}
                                className={cn(
                                    "px-4 py-2 text-xs font-black rounded-lg transition-all",
                                    activeChartTab === 'financial'
                                        ? "bg-white dark:bg-dm-card text-primary dark:text-accent shadow-sm"
                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                )}
                            >
                                المصروفات ونسب التحصيل
                            </button>
                        </div>
                    </div>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            {activeChartTab === 'litigation' ? (
                                <AreaChart data={litigationPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorWon" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorStudy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#d97706" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: 'none', 
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            backgroundColor: '#1e293b',
                                            color: '#fff',
                                            direction: 'rtl'
                                        }} 
                                        labelStyle={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700 }}
                                    />
                                    <Area type="monotone" dataKey="القضايا المنجزة" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorWon)" />
                                    <Area type="monotone" dataKey="قيد الدراسة" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorStudy)" />
                                </AreaChart>
                            ) : (
                                <BarChart data={financialChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:hidden" />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" className="hidden dark:block" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip 
                                        contentStyle={{ 
                                            borderRadius: '16px', 
                                            border: 'none', 
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            backgroundColor: '#1e293b',
                                            color: '#fff',
                                            direction: 'rtl'
                                        }} 
                                    />
                                    <Bar dataKey="المبالغ المحصلة" fill="#10b981" radius={[8, 8, 0, 0]} />
                                    <Bar dataKey="الرسوم القضائية" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-50 dark:border-slate-800/80">
                        <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold block">مجموع المبالغ المتداولة</span>
                            <span className="text-sm font-black text-slate-800 dark:text-white font-mono">25,500 د.ك</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold block">متوسط كفاءة التحصيل</span>
                            <span className="text-sm font-black text-emerald-500 font-mono">94.2%</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold block">إجمالي القضايا الفائزة</span>
                            <span className="text-sm font-black text-blue-500 font-mono">82%</span>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-slate-400 font-bold block">أتعاب الخبراء المسجلة</span>
                            <span className="text-sm font-black text-amber-500 font-mono">1,820 د.ك</span>
                        </div>
                    </div>
                </div>

                {/* Intelligent Advisor Widget */}
                <div className="lg:col-span-4 flex flex-col bg-slate-900 text-white rounded-[2.5rem] p-6 sm:p-8 justify-between shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-[-50px] left-[-50px] w-48 h-48 rounded-full bg-primary/25 blur-[60.5px] group-hover:scale-125 transition-transform duration-700" />
                    
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                    <SparklesIcon className="w-5 h-5 text-accent" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                    مستشار الذكاء الاصطناعي
                                </span>
                            </div>
                            <span className="text-[9px] bg-accent/25 text-accent font-black px-2 py-0.5 rounded-md border border-accent/20">
                                تحليل فوري
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 space-y-1">
                                <span className="text-[9px] font-black text-accent">قاطعة الامتثال القضائي</span>
                                <p className="text-xs font-black text-slate-100 leading-relaxed">
                                    "تحذير: صحيفة الدعوى رقم <span className="text-accent underline font-mono">2024/711</span> تفتقد للتفويض التجاري الساري للهيئة الممثلة. نوصي بتحديث الـ POA لتفادي الدفع بالبطلان."
                                </p>
                            </div>

                            <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 space-y-1">
                                <span className="text-[9px] font-black text-emerald-400">تقييم المخاطر</span>
                                <p className="text-xs font-black text-slate-100 leading-relaxed">
                                    "استكمال أطروحة الدفاع بالقضية العمالية له تأثير نجاح بنسبة <span className="text-emerald-400 font-mono font-black">92%</span> في ضوء أحكام محكمة التمييز الكويتية الأخيرة."
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <Link to="/ai-assistant">
                            <button className="w-full py-4 bg-white hover:bg-slate-50 text-slate-950 font-black text-xs rounded-2xl shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2">
                                استشارة المحلل القانوني الذكي
                                <ArrowLeftIcon className="w-4.5 h-4.5" />
                            </button>
                        </Link>
                    </div>
                </div>

            </div>

            {/* --- CORE SYSTEM MODULES QUICK LINK TILES --- */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-6 px-1">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                        بوابة الفروع ومفاتيح الإدارة القانونية
                    </h3>
                    <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-10 gap-4">
                    {[
                        { title: 'إدارة القضايا', icon: BriefcaseIcon, link: '/cases', bg: 'bg-blue-50/50 hover:bg-blue-50 text-blue-600 dark:bg-blue-900/10 dark:text-blue-400' },
                        { title: 'الرول الآلي', icon: ListBulletIcon, link: '/automated-docket', bg: 'bg-rose-50/50 hover:bg-rose-50 text-rose-600 dark:bg-rose-900/10 dark:text-rose-400' },
                        { title: 'المركز المالي', icon: BanknotesIcon, link: '/finance', bg: 'bg-emerald-50/50 hover:bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400' },
                        { title: 'شؤون الموظفين', icon: UserGroupIcon, link: '/employee-affairs', bg: 'bg-indigo-50/50 hover:bg-indigo-50 text-indigo-600 dark:bg-indigo-900/10 dark:text-indigo-400' },
                        { title: 'العقود والذكاء', icon: BrainIcon, link: '/contract-analysis', bg: 'bg-cyan-50/50 hover:bg-cyan-50 text-cyan-600 dark:bg-cyan-900/10 dark:text-cyan-400' },
                        { title: 'شؤون الشركات', icon: BuildingLibraryIcon, link: '/company-affairs', bg: 'bg-purple-50/50 hover:bg-purple-50 text-purple-600 dark:bg-purple-900/10 dark:text-purple-400' },
                        { title: 'إدارة الأملاك', icon: BuildingOffice2Icon, link: '/property-management', bg: 'bg-teal-50/50 hover:bg-teal-50 text-teal-600 dark:bg-teal-900/10 dark:text-teal-400' },
                        { title: 'المكتبة والبحث', icon: BookOpenIcon, link: '/legal-resources', bg: 'bg-amber-50/50 hover:bg-amber-50 text-amber-600 dark:bg-amber-900/10 dark:text-amber-400' },
                        { title: 'خرائط التفكير', icon: DocumentDuplicateIcon, link: '/smart-mind-map', bg: 'bg-fuchsia-50/50 hover:bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-900/10 dark:text-fuchsia-400' },
                        { title: 'إعدادات المنصة', icon: Settings2, link: '/settings', bg: 'bg-slate-50/50 hover:bg-slate-50 text-slate-600 dark:bg-slate-800/20 dark:text-slate-400' },
                    ].map((m, idx) => {
                        const Icon = m.icon;
                        return (
                            <Link 
                                key={idx} 
                                to={m.link} 
                                className="group p-4 bg-white dark:bg-dm-card rounded-2xl border border-slate-150/70 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-accent/20 transition-all duration-300 flex flex-col items-center justify-center text-center h-[105px]"
                            >
                                <div className={cn("p-2 rounded-xl transition-all duration-300 group-hover:scale-110 mb-2", m.bg)}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className="text-[11px] font-black text-slate-800 dark:text-white group-hover:text-accent transition-colors">
                                    {m.title}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* --- DYNAMIC TABLES & OPERATIONAL MODULES --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
                
                {/* Roll Schedule / Upcoming Court Hearings */}
                <div className="xl:col-span-2 bg-white dark:bg-dm-card rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <GavelIcon className="w-4.5 h-4.5 text-rose-500" />
                                    جدول الرول وجلسات المحاكم المتزامنة
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold tracking-wider mt-0.5">
                                    Interactive Court Roll Schedule
                                </p>
                            </div>

                            <div className="relative w-full sm:w-48">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="تصفية الرول..."
                                    className="w-full pr-8 pl-3 py-2 bg-slate-50 dark:bg-dm-background rounded-xl text-[11px] font-bold border border-slate-100 dark:border-slate-800 outline-none focus:ring-2 focus:ring-accent/10"
                                    value={hearingSearch}
                                    onChange={(e) => setHearingSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black">
                                        <th className="pb-3 pr-2">الدعوى والموكل</th>
                                        <th className="pb-3 text-center">درجة التقاضي / الموقع</th>
                                        <th className="pb-3 text-center">التاريخ والوقت</th>
                                        <th className="pb-3 text-left pl-2">الحالة الإجرائية (تفاعلية)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHearings.map(h => (
                                        <tr key={h.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-dm-background/50 transition-colors group">
                                            <td className="py-3 pr-2">
                                                <div className="font-black text-slate-800 dark:text-slate-100 group-hover:text-accent transition-colors">
                                                    {h.caseTitle}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-0.5">
                                                    الموكل: {h.clientName}
                                                </div>
                                            </td>
                                            <td className="py-3 text-center">
                                                <div className="font-bold text-slate-700 dark:text-slate-300">
                                                    {h.courtRoomOrLocation || 'قصر العدل'}
                                                </div>
                                                <div className="text-[9px] font-black text-slate-400">
                                                    {h.type || 'جلسة المرافعة'}
                                                </div>
                                            </td>
                                            <td className="py-3 text-center font-mono">
                                                <div className="font-bold text-slate-700 dark:text-slate-300">
                                                    {h.date}
                                                </div>
                                                <div className="text-[10px] text-slate-400">
                                                    {h.time || '09:00 ص'}
                                                </div>
                                            </td>
                                            <td className="py-3 text-left pl-2">
                                                <button 
                                                    onClick={() => advanceHearing(h.id, h.status)}
                                                    className={cn(
                                                        "px-2.5 py-1 text-[10px] font-black rounded-full border transition-all hover:scale-105 active:scale-95",
                                                        h.status === 'Completed'
                                                            ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/45 dark:text-emerald-400"
                                                            : h.status === 'Postponed'
                                                            ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900/45 dark:text-amber-400"
                                                            : h.status === 'Cancelled'
                                                            ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/20 dark:border-rose-900/45 dark:text-rose-400"
                                                            : "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900/45 dark:text-blue-400"
                                                    )}
                                                >
                                                    {h.status === 'Completed' && '✓ منجزة'}
                                                    {h.status === 'Postponed' && '⏳ مؤجلة'}
                                                    {h.status === 'Cancelled' && '✕ ملغاة'}
                                                    {h.status === 'Scheduled' && '● حية مجدولة'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredHearings.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-center py-10 text-slate-400">
                                                لم يستدل على جلسات متوافقة مع الاستقصاء القائم.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/80 flex justify-between items-center text-[11px] font-bold text-slate-400">
                        <span>انقر على حالة الجلسة لتبديل الحالة الإجرائية تلقائياً</span>
                        <Link to="/automated-docket" className="text-accent underline font-black">
                            شاشة الرول الكاملة ←
                        </Link>
                    </div>
                </div>

                {/* Interactive Task & Workflows Checkbox */}
                <div className="bg-white dark:bg-dm-card rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm flex flex-col justify-between">
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <div>
                                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <ClipboardListCheckIcon className="w-4.5 h-4.5 text-amber-500" />
                                    المهام الإدارية والعملياتية
                                </h3>
                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                                    Execution Workflows Checklist
                                </p>
                            </div>

                            <div className="relative w-full sm:w-36">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <input 
                                    type="text" 
                                    placeholder="بحث مهمة..."
                                    className="w-full pr-8 pl-3 py-1.5 bg-slate-50 dark:bg-dm-background rounded-xl text-[10px] font-bold border border-slate-105 dark:border-slate-800 outline-none focus:ring-1 focus:ring-accent"
                                    value={taskSearch}
                                    onChange={(e) => setTaskSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3 max-h-[260px] overflow-y-auto">
                            {filteredTasks.map(t => (
                                <div 
                                    key={t.id} 
                                    className={cn(
                                        "p-3 rounded-xl border flex items-center justify-between gap-3 transition-all duration-300",
                                        t.status === AdminTaskStatus.COMPLETED
                                            ? "bg-slate-50/50 dark:bg-slate-900/20 border-slate-100 dark:border-slate-800 opacity-60"
                                            : "bg-white dark:bg-dm-card border-slate-100 dark:border-slate-800 hover:border-accent/20"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => toggleTask(t.id, t.status)}
                                            className={cn(
                                                "w-4.5 h-4.5 rounded-md border flex items-center justify-center shrink-0 transition-all",
                                                t.status === AdminTaskStatus.COMPLETED
                                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                                    : "border-slate-300 dark:border-slate-600 hover:border-accent"
                                            )}
                                        >
                                            {t.status === AdminTaskStatus.COMPLETED && <Check className="w-3 h-3 stroke-[3]" />}
                                        </button>
                                        <div className="text-right">
                                            <p className={cn(
                                                "text-xs font-black text-slate-800 dark:text-slate-150 line-clamp-1",
                                                t.status === AdminTaskStatus.COMPLETED && "line-through text-slate-400 dark:text-slate-500"
                                            )}>
                                                {t.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[9px] font-bold text-slate-400">
                                                    إدارة: {t.category}
                                                </span>
                                                <span className="text-slate-200 dark:text-slate-800">•</span>
                                                <span className={cn(
                                                    "text-[8px] font-black px-1.5 py-0.2 rounded-md",
                                                    t.priority === AdminTaskPriority.CRITICAL || t.priority === AdminTaskPriority.HIGH
                                                        ? "bg-rose-50 text-rose-500 dark:bg-rose-950/20"
                                                        : "bg-slate-50 text-slate-500 dark:bg-slate-800"
                                                )}>
                                                    {t.priority}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-left shrink-0">
                                        <span className="text-[9px] font-mono text-slate-400 block">
                                            {t.dueDate}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {filteredTasks.length === 0 && (
                                <div className="text-center py-6 text-slate-400 text-xs">
                                    لا عمل مستحق حالياً يلبي المدخل.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800/80 flex justify-between items-center text-[11px] font-bold text-slate-400">
                        <span>انقر على المربع لوضع علامة المكتمل</span>
                        <Link to="/admin-tools/tasks" className="text-accent underline font-black">
                            قائمة المهام ←
                        </Link>
                    </div>
                </div>

            </div>

            {/* --- COMPLIANCE & RECENT AUDIT TIMELINE --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Client portfolios and Contract expiries */}
                <div className="lg:col-span-4 bg-white dark:bg-dm-card rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <UsersIcon className="w-4 h-4 text-purple-500" />
                                كشف الموكلين المسجلين حديثاً
                            </h3>
                            <p className="text-[9px] text-slate-400 mt-0.5">Recent Clients Portfolio</p>
                        </div>
                        <Link to="/contacts" className="text-[10px] text-primary dark:text-accent font-black hover:underline">الموكلين</Link>
                    </div>

                    <div className="space-y-4">
                        {recentClientsList.map((client, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-dm-background rounded-2xl border border-slate-100 dark:border-slate-800/50 text-xs hover:border-purple-300 dark:hover:border-purple-900/40 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 font-sans font-black flex items-center justify-center text-[10px]">
                                        {client.name.substring(0, 2)}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-800 dark:text-slate-100">
                                            {client.name}
                                        </h4>
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-450 mt-0.5">
                                            <span>رقم الدعوى: {client.num}</span>
                                            <span>•</span>
                                            <span className="text-slate-400">{client.type}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left font-mono">
                                    <span className="text-[10px] font-bold text-slate-500 block">
                                        {client.date}
                                    </span>
                                    <span className="text-[9px] bg-emerald-50 text-emerald-500 dark:bg-emerald-950/20 px-1.5 py-0.2 rounded font-sans font-black">
                                        {client.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audit & Legal Timeline Actions */}
                <div className="lg:col-span-8 bg-white dark:bg-dm-card rounded-[2.5rem] border border-slate-100 dark:border-slate-800/80 p-6 sm:p-8 shadow-sm justify-between flex flex-col">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                    موجز الأنشطة وسجل الرقابة القانونية الصارم
                                </h3>
                                <p className="text-[9px] text-slate-400 mt-0.5">Secured Operational Audit Logs</p>
                            </div>
                            <span className="text-[9px] tracking-tight bg-slate-50 dark:bg-dm-background px-2.5 py-1 border border-slate-100 dark:border-slate-850 rounded-lg text-slate-400">
                                مشفّر ومنظم
                            </span>
                        </div>

                        <div className="space-y-4">
                            {unifiedLogs.map((log) => (
                                <div 
                                    key={log.id} 
                                    className="flex items-start gap-3.5 pb-4 last:pb-0 border-b border-slate-50 dark:border-slate-800/40 last:border-0 group"
                                >
                                    <div className="relative mt-1">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-dm-card z-10 relative group-hover:scale-125 transition-transform" />
                                        <div className="absolute top-2.5 right-1 w-px h-10 bg-slate-100 dark:bg-slate-800/50" />
                                    </div>

                                    <div className="flex-1 text-right text-xs">
                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                            <span className="font-transparent font-black text-[13px] text-slate-800 dark:text-slate-100 group-hover:text-accent transition-colors">
                                                {log.action}
                                            </span>
                                            <span className="text-slate-200 dark:text-slate-800 select-none">•</span>
                                            <span className="text-[10px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 rounded-md px-1.5 py-0.2">
                                                {log.badge}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold font-mono">
                                            <span>القائم بالعملية: {log.user}</span>
                                            <span>{log.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/80 flex justify-between items-center text-[11px] font-bold text-slate-400">
                        <span>خاضع للمرسوم بقانون رقم 20 لسنة 2014 بشأن المعاملات الإلكترونية بدولة الكويت</span>
                        <span className="text-emerald-500 flex items-center gap-1 font-mono text-[9px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            AUDITING ACTIVE
                        </span>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default DashboardPage;
