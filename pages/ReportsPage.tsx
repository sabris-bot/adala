import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
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
    ChartPieIcon
} from '../constants';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { arSA } from 'date-fns/locale/ar-SA';
import { 
    PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
    ResponsiveContainer, Cell, LabelList, LineChart, Line, AreaChart, Area,
    ComposedChart
} from 'recharts';
import { 
    Case, CaseStatus, ComplianceRequirement, ComplianceStatus as ComplianceStatusEnum, 
    RiskLevel, AdminTask, AdminTaskStatus, AdminTaskPriority, FinancialTransaction, 
    FinancialTransactionType, LegalRepresentationRequest, RepresentationRequestStatus, 
    CourtLevel, CompliancePriority, PropertyUnitStatus, JudgmentOutcome
} from '../types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { PriorityBadge, CaseStatusBadge, RiskLevelBadge, ComplianceStatusBadge, RepresentationRequestStatusBadge, AdminTaskStatusBadge, CompliancePriorityBadge, Badge } from '../components/ui/Badge';

// Import constants and data
import { initialCases as mockCasesDataFromList } from '../data/caseData';
import initialMockTasks from './TaskManagementPage';
import { initialComplianceData } from './CompliancePage';
import { mockFinancialTransactions } from './FinancialManagementPage';
import { mockLegalRepresentationRequests } from './LegalRepresentationPage'; 
import { mockProperties, mockRentPayments, mockLeaseAgreements } from '../data/propertyData';

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

// --- Custom Components ---

const StatCard = ({ label, value, icon, trend, trendValue, color, bg }: any) => (
    <motion.div 
        whileHover={{ scale: 1.02, y: -5 }}
        className={`${bg} p-6 rounded-[32px] border border-transparent hover:border-black/5 transition-all shadow-sm relative overflow-hidden group`}
    >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity transform translate-x-4 -translate-y-4">
            {React.cloneElement(icon, { size: 120, className: "w-32 h-32" })}
        </div>
        <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-white shadow-xl shadow-${color}/5 ${color}`}>{icon}</div>
                {trend && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${trend === 'up' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {trend === 'up' ? <ArrowUpCircleIcon className="w-3 h-3"/> : <ArrowDownCircleIcon className="w-3 h-3"/>}
                        {trendValue}
                    </div>
                )}
            </div>
            <p className="text-3xl font-black text-gray-900 leading-none mb-2 tracking-tighter">{value}</p>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
        </div>
    </motion.div>
);

// --- Config ---

const STATUS_COLORS_REPORTS: Record<string, string> = {
    ...CASE_STATUS_CHART_COLORS,
    ...RISK_COLORS,
    ...JUDGMENT_OUTCOME_CHART_COLORS,
    ...TASK_PRIORITY_COLORS,
    ...COMPLIANCE_STATUS_CHART_COLORS,
    ...RepresentationRequestStatusChartColors,
    [AdminTaskStatus.TODO]: '#6366f1',
    [AdminTaskStatus.IN_PROGRESS]: '#f59e0b',
    [AdminTaskStatus.COMPLETED]: '#10b981',
    [AdminTaskStatus.BLOCKED]: '#ef4444',
    [AdminTaskStatus.CANCELLED]: '#9ca3af'
};

interface ReportCategoryDefinition {
    value: string;
    label: string;
    icon: React.ReactNode;
    subReports: { value: string; label: string; icon: React.ReactNode }[];
}

const ReportsPage: React.FC = () => {
    const { t } = useTranslation();
    const reportCategories: ReportCategoryDefinition[] = useMemo(() => [
        {
            value: 'cases', label: t('case_statistics', { defaultValue: 'إحصائيات القضايا' }), icon: <BriefcaseIcon className="w-5 h-5" />,
            subReports: [
                { value: 'caseStatusDistribution', label: t('case_status_distribution', { defaultValue: 'توزيع القضايا حسب الحالة' }), icon: <ChartPieIcon className="w-4 h-4" /> },
                { value: 'lawyerWorkload', label: t('lawyer_workload', { defaultValue: 'كثافة العمل لكل محامي' }), icon: <UsersIcon className="w-4 h-4" /> },
                { value: 'successRate', label: t('success_rate_judgments', { defaultValue: 'معدل النجاح في الأحكام' }), icon: <CheckBadgeIcon className="w-4 h-4" /> },
                { value: 'caseRiskProfile', label: t('case_risk_profile', { defaultValue: 'ملف المخاطر للقضايا' }), icon: <ShieldCheckIcon className="w-4 h-4" /> },
                { value: 'courtStagesInfo', label: t('court_stages_distribution', { defaultValue: 'توزيع مراحل التقاضي' }), icon: <BuildingOffice2Icon className="w-4 h-4" /> },
            ],
        },
        {
            value: 'financial', label: t('financial_analysis', { defaultValue: 'التحليل المالي' }), icon: <BanknotesIcon className="w-5 h-5" />,
            subReports: [
                { value: 'revenueAnalysis', label: t('monthly_revenue_analysis', { defaultValue: 'تحليل الإيرادات الشهرية' }), icon: <PresentationChartLineIcon className="w-4 h-4" /> },
                { value: 'expenseStructure', label: t('operational_expense_structure', { defaultValue: 'هيكل المصروفات التشغيلية' }), icon: <ChartPieIcon className="w-4 h-4" /> },
                { value: 'profitabilityByCaseType', label: t('profitability_by_case_type', { defaultValue: 'الربحية حسب النوع' }), icon: <BanknotesIcon className="w-4 h-4" /> },
                { value: 'receivablesAgeing', label: t('receivables_ageing', { defaultValue: 'أعمار المستحقات المتأخرة' }), icon: <ClockIcon className="w-4 h-4" /> },
            ],
        },
        {
            value: 'staff', label: t('staff_efficiency', { defaultValue: 'كفاءة الموظفين' }), icon: <UsersIcon className="w-5 h-5" />,
            subReports: [
                { value: 'taskCompletionRatio', label: t('total_task_completion_rate', { defaultValue: 'معدل إنجاز المهام الكلي' }), icon: <ClipboardDocumentListIcon className="w-4 h-4" /> },
                { value: 'staffWorkload', label: t('active_tasks_distribution', { defaultValue: 'توزيع المهام النشطة' }), icon: <FunnelIcon className="w-4 h-4" /> },
                { value: 'avgResolutionTime', label: t('avg_request_resolution_time', { defaultValue: 'متوسط زمن معالجة الطلبات' }), icon: <ClockIcon className="w-4 h-4" /> },
            ],
        },
        {
            value: 'compliance', label: t('legal_compliance', { defaultValue: 'الامتثال القانوني' }), icon: <ShieldCheckIcon className="w-5 h-5" />,
            subReports: [
                { value: 'complianceOverview', label: t('general_compliance_map', { defaultValue: 'خارطة الامتثال العامة' }), icon: <DocumentTextIcon className="w-4 h-4" /> },
                { value: 'regulatoryRisk', label: t('pending_regulatory_risks', { defaultValue: 'المخاطر التنظيمية المعلقة' }), icon: <AcademicCapIcon className="w-4 h-4" /> },
            ],
        },
    ], [t]);

    const timePeriodOptions = useMemo(() => [
        { value: 'all', label: t('all_times', { defaultValue: 'كل الأوقات' }) },
        { value: 'last7days', label: t('last_7_days', { defaultValue: 'آخر 7 أيام' }) },
        { value: 'last30days', label: t('last_30_days', { defaultValue: 'آخر 30 يومًا' }) },
        { value: 'currentMonth', label: t('current_month', { defaultValue: 'الشهر الحالي' }) },
        { value: 'currentQuarter', label: t('current_quarter', { defaultValue: 'الربع الحالي' }) },
        { value: 'currentYear', label: t('current_year', { defaultValue: 'السنة المالية الحالية' }) },
        { value: 'customRange', label: t('custom_range', { defaultValue: 'نطاق مخصص' }) },
    ], [t]);

    const [selectedCategory, setSelectedCategory] = useState<string>('cases');
    const [selectedReport, setSelectedReport] = useState<string>('caseStatusDistribution');
    const [selectedTimePeriod, setSelectedTimePeriod] = useState<string>('all');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');
    
    const [reportData, setReportData] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [chartType, setChartType] = useState<'pie' | 'bar' | 'line' | 'area' | 'list'>('bar'); 
    const [reportTitle, setReportTitle] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

    const currentSubReportOptions = useMemo(() => {
        return reportCategories.find(cat => cat.value === selectedCategory)?.subReports || [];
    }, [selectedCategory]);

    const kpis = useMemo(() => ([
        { label: t('open_cases', { defaultValue: 'القضايا المفتوحة' }), value: mockCasesDataFromList.filter(c => c.status !== CaseStatus.CLOSED).length, icon: <BriefcaseIcon className="w-6 h-6"/>, trend: 'up', trendValue: '12%', color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: t('upcoming_hearings_week', { defaultValue: 'جلسات قادمة (أسبوع)' }), value: mockCasesDataFromList.filter(c => c.nextHearingDate && new Date(c.nextHearingDate) < new Date(Date.now() + 7 * 86400000)).length, icon: <CalendarDaysIcon className="w-6 h-6"/>, trend: 'down', trendValue: '4%', color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: t('success_rate_long', { defaultValue: 'نسبة النجاح' }), value: `${Math.round((mockCasesDataFromList.filter(c => c.judgmentOutcome === JudgmentOutcome.WON).length / (mockCasesDataFromList.filter(c => c.judgmentOutcome).length || 1)) * 100)}%`, icon: <CheckBadgeIcon className="w-6 h-6"/>, trend: 'up', trendValue: '1.2%', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: t('revenue_collection', { defaultValue: 'تحصيل الإيرادات' }), value: formatCurrency(mockFinancialTransactions.filter(f => f.amount > 0).reduce((sum, f) => sum + f.amount, 0), t).split(' ')[0], icon: <BanknotesIcon className="w-6 h-6"/>, trend: 'up', trendValue: '8%', color: 'text-blue-600', bg: 'bg-blue-50' },
    ]), [t, formatCurrency]);

    const generateReport = useCallback(async () => {
        setIsLoading(true);
        setReportData(null);
        await new Promise(r => setTimeout(r, 800));

        let data: any = { chartData: [], listData: [] };
        let newChartType: any = 'bar';
        
        // --- Filtering Logic ---
        const filterByTime = (dateStr: string) => {
            if (selectedTimePeriod === 'all') return true;
            const date = new Date(dateStr);
            const now = new Date();
            if (selectedTimePeriod === 'last7days') return date >= new Date(now.setDate(now.getDate() - 7));
            if (selectedTimePeriod === 'last30days') return date >= new Date(now.setDate(now.getDate() - 30));
            if (selectedTimePeriod === 'currentMonth') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            if (selectedTimePeriod === 'currentYear') return date.getFullYear() === now.getFullYear();
            if (selectedTimePeriod === 'customRange') return date >= new Date(customStartDate) && date <= new Date(customEndDate);
            return true;
        };

        const relCases = mockCasesDataFromList.filter(c => filterByTime(c.createdDate));
        const relTasks = initialMockTasks.filter(t => filterByTime(t.createdAt || '2024-01-01'));
        const relFinancials = mockFinancialTransactions.filter(f => filterByTime(f.transactionDate));

        // --- Report Logic ---
        switch (selectedReport) {
            case 'caseStatusDistribution':
                const statuses = relCases.reduce((acc: any, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {});
                data.chartData = Object.entries(statuses).map(([name, value]) => ({ name, value }));
                data.listData = relCases;
                newChartType = 'pie';
                break;
            case 'lawyerWorkload':
                const workloads = relCases.reduce((acc: any, c) => { acc[c.assignedLawyer] = (acc[c.assignedLawyer] || 0) + 1; return acc; }, {});
                data.chartData = Object.entries(workloads).map(([name, value]) => ({ name, value }));
                break;
            case 'successRate':
                const won = relCases.filter(c => c.judgmentOutcome === JudgmentOutcome.WON).length;
                const lost = relCases.filter(c => c.judgmentOutcome === JudgmentOutcome.LOST).length;
                const settled = relCases.filter(c => c.judgmentOutcome === JudgmentOutcome.SETTLED).length;
                data.chartData = [
                    { name: t('won', { defaultValue: 'فوز' }), value: won },
                    { name: t('lost', { defaultValue: 'خسارة' }), value: lost },
                    { name: t('settled', { defaultValue: 'تسوية' }), value: settled }
                ];
                newChartType = 'pie';
                break;
            case 'revenueAnalysis':
                const months = [
                    t('january', { defaultValue: 'يناير' }), 
                    t('february', { defaultValue: 'فبراير' }), 
                    t('march', { defaultValue: 'مارس' }), 
                    t('april', { defaultValue: 'أبريل' }), 
                    t('may', { defaultValue: 'مايو' }), 
                    t('june', { defaultValue: 'يونيو' }), 
                    t('july', { defaultValue: 'يوليو' }), 
                    t('august', { defaultValue: 'أغسطس' }), 
                    t('september', { defaultValue: 'سبتمبر' }), 
                    t('october', { defaultValue: 'أكتوبر' }), 
                    t('november', { defaultValue: 'نوفمبر' }), 
                    t('december', { defaultValue: 'ديسمبر' })
                ];
                data.chartData = months.slice(0, 5).map((m, i) => ({
                    name: m,
                    [t('value', { defaultValue: 'قيمة' })]: relFinancials.filter(f => f.amount > 0 && new Date(f.transactionDate).getMonth() === i).reduce((s, f) => s + f.amount, 100 * (i+1))
                }));
                newChartType = 'area';
                break;
            case 'taskCompletionRatio':
                const comp = relTasks.filter(t => t.status === AdminTaskStatus.COMPLETED).length;
                const pending = relTasks.filter(t => t.status !== AdminTaskStatus.COMPLETED).length;
                data.chartData = [{ name: t('completed', { defaultValue: 'مكتمل' }), value: comp }, { name: t('pending', { defaultValue: 'معلق' }), value: pending }];
                newChartType = 'pie';
                break;
            default:
                break;
        }

        setReportData(data);
        setReportTitle(currentSubReportOptions.find(r => r.value === selectedReport)?.label || '');
        setChartType(newChartType);
        setIsLoading(false);
    }, [selectedReport, selectedTimePeriod, customStartDate, customEndDate, currentSubReportOptions]);

    const renderChart = () => {
        const data = reportData.chartData;
        if (!data || data.length === 0) return null;

        return (
            <div className="h-[400px] w-full p-6 bg-white dark:bg-dm-card rounded-[40px] shadow-2xl shadow-gray-200/50">
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'pie' ? (
                        <PieChart>
                            <Pie 
                                data={data} 
                                cx="50%" cy="50%" 
                                innerRadius={80} outerRadius={130} 
                                paddingAngle={8} 
                                dataKey="value"
                            >
                                {data.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_COLORS_REPORTS[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} stroke="transparent" />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        </PieChart>
                    ) : chartType === 'area' ? (
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey={t('value', { defaultValue: 'قيمة' })} stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorVal)" />
                        </AreaChart>
                    ) : (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                            <Tooltip cursor={{ fill: '#f1f5f9', radius: 12 }} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="value" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={40} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-200">
                            <PresentationChartLineIcon className="w-8 h-8" />
                        </div>
                        <h1 className="text-5xl font-black text-gray-900 tracking-tighter">{t('comprehensive_performance_analytics', { defaultValue: 'تحليلات الأداء الشاملة' })}</h1>
                    </div>
                    <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2">
                         <SparklesIcon className="w-4 h-4 text-indigo-500"/> {t('smart_reports_live_data', { defaultValue: 'تقارير ذكية مدعومة بالبيانات الحية' })}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-2xl border-2 h-12" leftIcon={<PrinterIcon className="w-5"/>}>{t('export_pdf', { defaultValue: 'تصدير PDF' })}</Button>
                    <Button variant="primary" className="rounded-2xl h-12 shadow-xl shadow-indigo-100 px-8" leftIcon={<ArrowDownTrayIcon className="w-5"/>}>{t('export_data', { defaultValue: 'تصدير البيانات' })}</Button>
                </div>
            </div>

            {/* KPI Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <StatCard key={idx} {...kpi} />
                ))}
            </div>

            {/* AI Insights Banner */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-700 rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                    <div className="flex items-start gap-6 max-w-2xl">
                        <div className="p-4 bg-white/20 rounded-[24px] backdrop-blur-xl shrink-0 group-hover:scale-110 transition-transform duration-500">
                            <LightBulbIcon className="w-10 h-10 text-amber-300" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black mb-2 flex items-center gap-2 italic">{t('ai_insight', { defaultValue: 'Insight الذكاء الاصطناعي' })} <Badge text="PRO" variant="warning" size="xs" /></h3>
                            <p className="text-indigo-100 text-sm leading-relaxed font-medium">
                                {t('ai_insight_desc', { defaultValue: 'تم رصد زيادة في معدل ربحية القضايا العمالية بنسبة 15% خلال الربع الأخير. نقترح توجيه المزيد من الموارد البشرية لهذا القطاع لتحسين العوائد التشغيلية وتقليل زمن إنجاز المهام.' })}
                            </p>
                        </div>
                    </div>
                    <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-indigo-600 rounded-2xl h-14 px-8 font-black">
                        {t('view_detailed_analysis', { defaultValue: 'عرض التحليل التفصيلي' })}
                    </Button>
                </div>
            </div>

            {/* Report Generator Controls */}
            <div className="bg-white dark:bg-dm-card p-10 rounded-[48px] shadow-2xl shadow-gray-200/50 border border-gray-100 dark:border-gray-800">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Categories Column */}
                    <div className="lg:col-span-4 space-y-4">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                            <Squares2X2Icon className="w-4 h-4"/> {t('select_main_category', { defaultValue: 'اختيار التصنيف الرئيسي' })}
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            {reportCategories.map(cat => (
                                <button 
                                    key={cat.value}
                                    onClick={() => { setSelectedCategory(cat.value); setSelectedReport(cat.subReports[0].value); }}
                                    className={`flex items-center justify-between p-4 rounded-3xl border-2 transition-all group ${selectedCategory === cat.value ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-2 rounded-xl ${selectedCategory === cat.value ? 'bg-white/20' : 'bg-white group-hover:bg-gray-200'}`}>{cat.icon}</div>
                                        <span className="font-black text-sm">{cat.label}</span>
                                    </div>
                                    <ArrowsRightLeftIcon className={`w-4 h-4 transition-transform ${selectedCategory === cat.value ? 'rotate-180 opacity-100' : 'opacity-0'}`}/>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Options Column */}
                    <div className="lg:col-span-8 flex flex-col justify-between gap-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">نوع التقرير الفرعي</label>
                                    <div className="flex flex-col gap-2">
                                        {currentSubReportOptions.map(sr => (
                                            <button 
                                                key={sr.value}
                                                onClick={() => setSelectedReport(sr.value)}
                                                className={`flex items-center gap-3 p-3.5 rounded-2xl text-xs font-bold transition-all border ${selectedReport === sr.value ? 'bg-white border-indigo-600 text-indigo-600 shadow-lg' : 'bg-gray-50 border-transparent text-gray-400 hover:bg-gray-100'}`}
                                            >
                                                {sr.icon}
                                                {sr.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">النطاق الزمني</label>
                                    <Select 
                                        options={timePeriodOptions} 
                                        value={selectedTimePeriod} 
                                        onChange={(e) => setSelectedTimePeriod(e.target.value)}
                                        className="h-14 rounded-2xl border-none bg-gray-50 text-sm font-black focus:ring-indigo-600/20"
                                    />
                                </div>
                                {selectedTimePeriod === 'customRange' && (
                                    <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
                                        <Input type="date" label="من" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} containerClassName="mb-0" className="rounded-2xl border-none bg-gray-50 h-14"/>
                                        <Input type="date" label="إلى" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} containerClassName="mb-0" className="rounded-2xl border-none bg-gray-50 h-14"/>
                                    </div>
                                )}
                                <div className="p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
                                    <div className="flex items-start gap-4">
                                        <InformationCircleIcon className="w-5 h-5 text-indigo-400 mt-1"/>
                                        <p className="text-[10px] font-black text-indigo-600/60 leading-relaxed uppercase">{t('realtime_data_note', { defaultValue: 'سيتم تجميع البيانات فورياً من السجلات المالية والإدارية النشطة لضمان دقة الرسوم البيانية الناتجة.' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button 
                                onClick={generateReport} 
                                isLoading={isLoading} 
                                className="flex-1 h-16 rounded-[24px] text-xl font-black shadow-2xl shadow-indigo-100" 
                                leftIcon={<SparklesIcon className="w-8 h-8"/>}
                            >
                                {t('generate_analytical_report', { defaultValue: 'توليد التقرير التحليلي' })}
                            </Button>
                            <Button variant="outline" className="h-16 w-16 rounded-[24px] border-2 group">
                                <ArrowPathIcon className="w-6 h-6 text-gray-400 group-hover:rotate-180 transition-transform duration-700"/>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Result Area */}
            {reportData && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="flex items-center justify-between border-b-2 border-dashed border-gray-100 pb-8 px-4">
                        <div>
                            <h2 className="text-4xl font-black text-gray-900 mb-1 tracking-tighter">{reportTitle}</h2>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest"><CalendarDaysIcon className="w-4 h-4"/> {timePeriodOptions.find(o=>o.value === selectedTimePeriod)?.label}</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                                <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest"><ChartBarIcon className="w-4 h-4"/> {reportData.chartData.length} {t('data_points', { defaultValue: 'نقاط بيانات' })}</span>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-4 rounded-3xl flex items-center gap-4">
                             <div className="text-right">
                                 <p className="text-[10px] font-black text-gray-400 leading-none mb-1 uppercase tracking-widest">{t('export_date', { defaultValue: 'تاريخ الاستخراج' })}</p>
                                 <p className="font-mono text-xs font-black text-gray-900">{format(new Date(), 'yyyy/MM/dd HH:mm')}</p>
                             </div>
                             <div className="w-[1px] h-8 bg-gray-200"></div>
                             <img src="https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff" className="w-10 h-10 rounded-2xl shadow-lg ring-4 ring-white" alt=""/>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-10">
                        {renderChart()}
                        
                        {reportData.listData && reportData.listData.length > 0 && (
                            <Card title={t('review_reference_records', { defaultValue: 'مراجعة السجلات المرجعية' })} className="border-none shadow-2xl rounded-[40px] overflow-hidden p-0">
                                <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50/50">
                                    <div className="relative w-80">
                                        <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
                                        <input placeholder={t('filter_results', { defaultValue: 'تصفية النتائج...' })} className="w-full pr-12 pl-4 py-3 bg-white rounded-2xl border-none text-xs font-bold focus:ring-2 focus:ring-indigo-600/10"/>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="rounded-xl" leftIcon={<FunnelIcon className="w-4"/>}>{t('filter_options', { defaultValue: 'خيارات الفلترة' })}</Button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-sm">
                                        <thead>
                                            <tr className="bg-gray-50/20 dark:bg-dm-background/50 border-b dark:border-gray-800">
                                                <th className="p-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">{t('identifier', { defaultValue: 'المعرف' })}</th>
                                                <th className="p-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">{t('title_party', { defaultValue: 'العنوان / الطرف' })}</th>
                                                <th className="p-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">{t('date', { defaultValue: 'التاريخ' })}</th>
                                                <th className="p-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em]">{t('responsible', { defaultValue: 'المسؤول' })}</th>
                                                <th className="p-5 font-black text-[10px] text-gray-400 uppercase tracking-[0.2em] text-center">{t('status', { defaultValue: 'الحالة' })}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                            {reportData.listData.slice(0, 8).map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="p-5 font-mono text-[10px] font-black text-gray-400">#{item.id || i + 100}</td>
                                                    <td className="p-5">
                                                        <p className="font-black text-gray-900 text-xs tracking-tight">{item.title || item.clientName || t('unknown_record', { defaultValue: 'سجل مجهول' })}</p>
                                                        {item.category && <p className="text-[10px] font-black text-gray-300 uppercase mt-0.5">{item.category}</p>}
                                                    </td>
                                                    <td className="p-5 font-bold text-gray-500 text-xs italic">{formatDateForReport(item.createdDate || item.transactionDate || item.dueDate)}</td>
                                                    <td className="p-5 flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[8px] font-black">
                                                            {(item.assignedLawyer || item.assignedTo || 'U').charAt(0)}
                                                        </div>
                                                        <span className="text-xs font-black text-gray-600">{item.assignedLawyer || item.assignedTo || '-'}</span>
                                                    </td>
                                                    <td className="p-5 text-center">
                                                        <Badge 
                                                            text={item.status} 
                                                            variant={item.status === 'مكسب' || item.status === 'مكتمل' ? 'success' : 'info'} 
                                                            size="xs"
                                                            className="rounded-xl px-4 py-1.5"
                                                        />
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {reportData.listData.length > 8 && (
                                    <div className="p-6 bg-gray-50/50 border-t flex justify-center">
                                        <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest text-indigo-600 border-indigo-100 hover:bg-indigo-50">{t('view_all_records', { defaultValue: 'عرض كافة السجلات' })} ({reportData.listData.length})</Button>
                                    </div>
                                )}
                            </Card>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsPage;
