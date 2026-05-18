
import React, { useState, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { 
    ActivityIcon, 
    PlusIcon, 
    UserCircleIcon, 
    ChevronRightIcon, 
    MagnifyingGlassIcon,
    FunnelIcon,
    StarIcon,
    ArrowPathIcon,
    ChartBarIcon,
    PrinterIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    ArrowDownTrayIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ClipboardDocumentListIcon,
    ClockIcon,
    TrendingUpIcon,
    DocumentTextIcon,
    BuildingOffice2Icon,
    UsersIcon,
    ShieldCheckIcon,
    AwardIcon,
    TargetIcon,
    HistoryIcon,
    FileEditIcon,
    CalendarDaysIcon
} from '../constants';
import { 
    PerformanceAppraisal, 
    PerformanceAppraisalStatus, 
    PerformanceGoalStatus, 
    PerformanceGoalPriority,
    PerformanceGoal,
    PeriodicReview,
    Employee
} from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { useJurisdiction } from '../components/JurisdictionContext';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';

// --- MOCK DATA ---
const mockEmployees: Employee[] = [
    { 
        id: '1', employeeId: 'EMP001', fullNameAr: 'أحمد محمود العبدالله', jobTitle: 'محامي أول', department: 'التقاضي', 
        joiningDate: '2018-05-10', photoUrl: 'https://i.pravatar.cc/150?u=1', status: 'Active', basicSalary: 1500,
        civilId: '290010100123', nationality: 'كويتي', contractType: 'Legal' as any
    },
    { 
        id: '2', employeeId: 'EMP002', fullNameAr: 'سارة خالد الصباح', jobTitle: 'مستشار قانوني', department: 'الشركات', 
        joiningDate: '2020-02-15', photoUrl: 'https://i.pravatar.cc/150?u=2', status: 'Active', basicSalary: 1800,
        civilId: '295050500456', nationality: 'كويتية', contractType: 'Legal' as any
    },
    { 
        id: '3', employeeId: 'EMP003', fullNameAr: 'محمد جاسم العتيبي', jobTitle: 'باحث قانوني', department: 'العقود', 
        joiningDate: '2021-11-01', photoUrl: 'https://i.pravatar.cc/150?u=3', status: 'Active', basicSalary: 1200,
        civilId: '288080800789', nationality: 'كويتي', contractType: 'Legal' as any
    },
    { 
        id: '4', employeeId: 'EMP004', fullNameAr: 'ليلى يوسف القطان', jobTitle: 'سكرتيرة تنفيذية', department: 'الإدارة', 
        joiningDate: '2019-08-20', photoUrl: 'https://i.pravatar.cc/150?u=4', status: 'Active', basicSalary: 900,
        civilId: '292020200321', nationality: 'كويتية', contractType: 'Administrative' as any
    },
];

const mockAppraisals: PerformanceAppraisal[] = [
    {
        id: 'app-1',
        employeeId: '1',
        employeeName: 'أحمد محمود العبدالله',
        employeeIdNumber: 'EMP001',
        employeeJobTitle: 'محامي أول',
        employeeDepartment: 'التقاضي',
        managerId: 'mgr-1',
        managerName: 'صبري شطا',
        appraisalDate: '2024-01-15',
        appraisalPeriod: '2023',
        status: PerformanceAppraisalStatus.COMPLETED,
        experienceYears: 6,
        joiningDate: '2018-05-10',
        referenceNumber: 'PERF-2023-001',
        overallScore: 4.7,
        overallGrade: 'Excellent',
        generalNotes: 'موظف متميز جداً، أداء قانوني رفيع المستوى وقدرة عالية على كسب القضايا المعقدة.',
        criteria: {
            attendance: { name: 'الالتزام والانضباط', score: 5, notes: 'ملتزم جداً بالمواعيد' },
            workQuality: { name: 'جودة العمل', score: 5, notes: 'دقة قانونية عالية' },
            speedOfDelivery: { name: 'سرعة الإنجاز', score: 4.5, notes: 'سريع جداً' },
            teamwork: { name: 'التعاون والعمل الجماعي', score: 4.5, notes: 'متعاون مع زملائه' },
            communication: { name: 'مهارات التواصل', score: 4.8, notes: 'تواصل فعال مع الموكلين' },
            responsibility: { name: 'تحمل المسؤولية', score: 5, notes: 'محل ثقة تامة' },
            problemSolving: { name: 'حل المشكلات', score: 4.7, notes: 'حلول قانونية إبداعية' },
            leadership: { name: 'القيادة', score: 4.5, notes: 'يوجه صغار المحامين ببراعة' },
            creativity: { name: 'الإبداع والتطوير', score: 4.5, notes: 'يقترح تحسينات مستمرة' },
            policyCompliance: { name: 'الالتزام بسياسات الشركة', score: 5, notes: 'مثال يحتذى به' },
        },
        goals: [
            { id: 'g1', title: 'زيادة نسبة كسب القضايا', description: 'الوصول لنسبة كسب 85% في قضايا الجنايات', startDate: '2023-01-01', endDate: '2023-12-31', progress: 90, priority: PerformanceGoalPriority.HIGH, status: PerformanceGoalStatus.COMPLETED, kpiMarkers: '88% Actual' },
            { id: 'g2', title: 'تدريب المحامين المستجدين', description: 'الإشراف على 3 محامين تحت التدريب', startDate: '2023-01-01', endDate: '2023-06-30', progress: 100, priority: PerformanceGoalPriority.MEDIUM, status: PerformanceGoalStatus.COMPLETED },
        ],
        reviews: [
            { id: 'r1', date: '2023-04-10', type: 'Quarterly', managerNotes: 'بداية ممتازة للسنة، التزام تام بالأهداف.', employeeNotes: 'أشعر بدعم كبير من الإدارة.' },
            { id: 'r2', date: '2023-07-20', type: 'Quarterly', managerNotes: 'استمرار للأداء المتميز.', employeeNotes: 'تم إنجاز 60% من الأهداف السنوية.' },
        ],
        recommendations: {
            promotion: true,
            salaryIncrease: true,
            bonus: true,
            trainingNeeded: 'دورة في التحكيم الدولي المتقدم',
            warning: false,
            developmentPlan: 'التركيز على مهارات التفاوض في العقود الدولية.'
        },
        signatures: {
            manager: { name: 'صبري شطا', signedAt: '2024-01-16T10:00:00Z' },
            hr: { name: 'نوال الكندري', signedAt: '2024-01-17T09:30:00Z' },
            employee: { name: 'أحمد محمود العبدالله', signedAt: '2024-01-18T14:20:00Z' }
        },
        createdAt: '2024-01-10T08:00:00Z',
        qrCodeData: 'https://qanooni.pro/verify/PERF-2023-001'
    },
    {
        id: 'app-2',
        employeeId: '2',
        employeeName: 'سارة خالد الصباح',
        employeeIdNumber: 'EMP002',
        employeeJobTitle: 'مستشار قانوني',
        employeeDepartment: 'الشركات',
        managerId: 'mgr-1',
        managerName: 'صبري شطا',
        appraisalDate: '2024-01-20',
        appraisalPeriod: '2023',
        status: PerformanceAppraisalStatus.UNDER_REVIEW,
        overallScore: 4.2,
        overallGrade: 'Very Good',
        criteria: {
            attendance: { name: 'الالتزام والانضباط', score: 4.2, notes: '' },
            workQuality: { name: 'جودة العمل', score: 4.5, notes: '' },
            speedOfDelivery: { name: 'سرعة الإنجاز', score: 4.0, notes: '' },
            teamwork: { name: 'التعاون والعمل الجماعي', score: 4.5, notes: '' },
            communication: { name: 'مهارات التواصل', score: 4.2, notes: '' },
            responsibility: { name: 'تحمل المسؤولية', score: 4.0, notes: '' },
            problemSolving: { name: 'حل المشكلات', score: 4.5, notes: '' },
            leadership: { name: 'القيادة', score: 4.0, notes: '' },
            creativity: { name: 'الإبداع والتطوير', score: 4.2, notes: '' },
            policyCompliance: { name: 'الالتزام بسياسات الشركة', score: 4.5, notes: '' },
        },
        goals: [],
        reviews: [],
        referenceNumber: 'PERF-2023-002',
        createdAt: '2024-01-15T11:00:00Z'
    }
];

const EmployeePerformancePage: React.FC = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'overview' | 'appraisals' | 'goals' | 'reviews' | 'reports'>('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All');
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedAppraisal, setSelectedAppraisal] = useState<PerformanceAppraisal | null>(null);
    
    // Printing
    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        // @ts-ignore
        content: () => componentRef.current,
        documentTitle: `Performance Appraisal - ${selectedAppraisal?.employeeName || 'Employee'}`
    });

    // Stats calculations
    const stats = useMemo(() => {
        const total = mockAppraisals.length;
        const completed = mockAppraisals.filter(a => a.status === PerformanceAppraisalStatus.COMPLETED).length;
        const underReview = mockAppraisals.filter(a => a.status === PerformanceAppraisalStatus.UNDER_REVIEW).length;
        const highPerformers = mockAppraisals.filter(a => a.overallScore >= 4.5).length;
        const needsImprovement = mockAppraisals.filter(a => a.overallScore < 3.0).length;
        const avgScore = total > 0 ? (mockAppraisals.reduce((acc, curr) => acc + curr.overallScore, 0) / total).toFixed(2) : '0';

        return { total, completed, underReview, highPerformers, needsImprovement, avgScore };
    }, []);

    // Filtered Appraisals
    const filteredAppraisals = useMemo(() => {
        return mockAppraisals.filter(a => {
            const matchesSearch = a.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                 a.employeeIdNumber?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesDept = departmentFilter === 'All' || a.employeeDepartment === departmentFilter;
            return matchesSearch && matchesDept;
        });
    }, [searchQuery, departmentFilter]);

    // Chart Data
    const deptPerformanceData = [
        { name: 'التقاضي', score: 4.7 },
        { name: 'الشركات', score: 4.2 },
        { name: 'العقود', score: 3.8 },
        { name: 'الإدارة', score: 4.0 },
    ];

    const radarData = selectedAppraisal ? [
        { subject: 'الالتزام', A: selectedAppraisal.criteria.attendance.score, fullMark: 5 },
        { subject: 'الجودة', A: selectedAppraisal.criteria.workQuality.score, fullMark: 5 },
        { subject: 'السرعة', A: selectedAppraisal.criteria.speedOfDelivery.score, fullMark: 5 },
        { subject: 'التعاون', A: selectedAppraisal.criteria.teamwork.score, fullMark: 5 },
        { subject: 'التواصل', A: selectedAppraisal.criteria.communication.score, fullMark: 5 },
        { subject: 'القيادة', A: selectedAppraisal.criteria.leadership.score, fullMark: 5 },
    ] : [];

    const handleViewAppraisal = (appraisal: PerformanceAppraisal) => {
        setSelectedAppraisal(appraisal);
        setIsViewModalOpen(true);
    };

    const getStatusBadge = (status: PerformanceAppraisalStatus) => {
        switch (status) {
            case PerformanceAppraisalStatus.COMPLETED: return <Badge text={status} color="green" />;
            case PerformanceAppraisalStatus.UNDER_REVIEW: return <Badge text={status} color="blue" />;
            case PerformanceAppraisalStatus.PENDING_APPROVAL: return <Badge text={status} color="yellow" />;
            default: return <Badge text={status} color="gray" />;
        }
    };

    const getGradeColor = (score: number) => {
        if (score >= 4.5) return 'text-emerald-500';
        if (score >= 4.0) return 'text-blue-500';
        if (score >= 3.0) return 'text-yellow-500';
        return 'text-rose-500';
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header section with Stats */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-2">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <ActivityIcon className="w-8 h-8" />
                        </div>
                        تقييم الأداء السنوي
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mt-2 ms-14 text-sm uppercase tracking-widest">
                        إدارة الكفاءات • تتبع الأهداف • تطوير الكوادر
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="primary" size="lg" className="shadow-xl shadow-primary/20 rounded-2xl" onClick={() => setIsAddModalOpen(true)}>
                        <PlusIcon className="w-5 h-5 me-2" />
                        إضافة تقييم جديد
                    </Button>
                    <Button variant="outline" size="lg" className="rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                        <ArrowDownTrayIcon className="w-5 h-5 me-2" />
                        تصدير التقارير
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                {[
                    { label: 'إجمالي الموظفين', value: stats.total, icon: <UsersIcon className="w-5 h-5" />, color: 'blue' },
                    { label: 'المكتملة', value: stats.completed, icon: <CheckCircleIcon className="w-5 h-5" />, color: 'emerald' },
                    { label: 'قيد المراجعة', value: stats.underReview, icon: <ClockIcon className="w-5 h-5" />, color: 'amber' },
                    { label: 'أداء مرتفع', value: stats.highPerformers, icon: <AwardIcon className="w-5 h-5" />, color: 'purple' },
                    { label: 'محتاج تحسين', value: stats.needsImprovement, icon: <ExclamationTriangleIcon className="w-5 h-5" />, color: 'rose' },
                    { label: 'متوسط الأداء', value: stats.avgScore, icon: <TrendingUpIcon className="w-5 h-5" />, color: 'blue' },
                ].map((stat, i) => (
                    <Card key={i} className="p-5 border-none bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all duration-300 group">
                        <div className={`p-3 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/10 text-${stat.color}-600 w-fit mb-3 group-hover:scale-110 transition-transform`}>
                            {stat.icon}
                        </div>
                        <div className="text-2xl font-black text-slate-800 dark:text-white mb-1">{stat.value}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{stat.label}</div>
                    </Card>
                ))}
            </div>

            {/* Main Tabs Navigation */}
            <div className="flex border-b border-slate-100 dark:border-slate-800/50 mb-6 overflow-x-auto no-scrollbar">
                {[
                    { id: 'overview', label: 'لوحة التحكم', icon: ChartBarIcon },
                    { id: 'appraisals', label: 'إدارة التقييمات', icon: UserCircleIcon },
                    { id: 'goals', label: 'الأهداف السنوية', icon: TargetIcon },
                    { id: 'reviews', label: 'المتابعة الدورية', icon: HistoryIcon },
                    { id: 'reports', label: 'التقارير', icon: FileEditIcon },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-black transition-all border-b-2 whitespace-nowrap
                            ${activeTab === tab.id 
                                ? 'border-primary text-primary bg-primary/5' 
                                : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/30'}
                        `}
                    >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Charts Column */}
                    <Card className="lg:col-span-2 p-8 border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40" title="توزيع الأداء حسب الأقسام">
                        <div className="h-[350px] mt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deptPerformanceData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }} />
                                    <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700, fill: '#64748B' }} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', fontWeight: 700 }}
                                        cursor={{ fill: '#F1F5F9' }}
                                    />
                                    <Bar dataKey="score" radius={[8, 8, 0, 0]} barSize={45}>
                                        {deptPerformanceData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B82F6' : '#6366F1'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Alerts & Recent Activity */}
                    <div className="space-y-6">
                        <Card className="p-6 border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40" title="تنبيهات المراجعة القادمة">
                            <div className="space-y-4 mt-6">
                                {[
                                    { name: 'محمد العتيبي', date: '2024-05-20', type: 'مراجعة ربع سنوية', urgent: true },
                                    { name: 'ليلى القطان', date: '2024-06-01', type: 'تقييم كفاءة', urgent: false },
                                ].map((alert, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse"></div>
                                            <div>
                                                <div className="text-xs font-black text-slate-800 dark:text-white uppercase">{alert.name}</div>
                                                <div className="text-[10px] font-bold text-slate-400 mt-0.5">{alert.type}</div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-[10px] font-black ${alert.urgent ? 'text-rose-500' : 'text-primary'}`}>{alert.date}</div>
                                            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">بعد 4 أيام</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6 border-none bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl shadow-indigo-200/50">
                            <h4 className="text-lg font-black mb-2">خطة التطوير الربعية</h4>
                            <p className="text-xs text-indigo-100 font-bold leading-relaxed mb-6">تم اعتماد ميزانية التدريب لتغطية دورات التميز القانوني لـ 15 موظفاً في النصف الأول من العام.</p>
                            <Button variant="ghost" className="text-white hover:bg-white/10 border border-white/20 w-fit">عرض التفاصيل</Button>
                        </Card>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: APPRAISALS */}
            {activeTab === 'appraisals' && (
                <div className="space-y-6">
                    {/* Filters Bar */}
                    <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-50 dark:border-slate-800/50">
                        <div className="relative flex-grow">
                            <MagnifyingGlassIcon className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="بحث باسم الموظف أو الرقم الوظيفي..."
                                className="w-full ps-12 pe-4 py-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none focus:ring-2 focus:ring-primary text-sm font-bold"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-4">
                            <select 
                                className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-none text-sm font-black px-6 py-3 cursor-pointer outline-none focus:ring-2 focus:ring-primary"
                                value={departmentFilter}
                                onChange={(e) => setDepartmentFilter(e.target.value)}
                            >
                                <option value="All">جميع الأقسام</option>
                                <option value="التقاضي">التقاضي</option>
                                <option value="الشركات">الشركات</option>
                                <option value="العقود">العقود</option>
                                <option value="الإدارة">الإدارة</option>
                            </select>
                            <Button variant="ghost" className="rounded-2xl p-3 bg-slate-50 dark:bg-slate-800/50 border-none">
                                <FunnelIcon className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Appraisals Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredAppraisals.map((appraisal) => (
                            <Card key={appraisal.id} className="p-8 border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/30 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                                
                                <div className="flex justify-between items-start mb-6 relative">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-inner flex items-center justify-center">
                                            {appraisal.employeePhotoUrl ? (
                                                <img src={appraisal.employeePhotoUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <UserCircleIcon className="w-10 h-10 text-slate-300" />
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-slate-800 dark:text-white leading-tight">{appraisal.employeeName}</h4>
                                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{appraisal.employeeJobTitle} | {appraisal.employeeDepartment}</p>
                                        </div>
                                    </div>
                                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black">{appraisal.appraisalPeriod}</div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8 relative">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                                        <div className={`text-2xl font-black ${getGradeColor(appraisal.overallScore)}`}>{appraisal.overallScore} / 5</div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">التقييم العام</div>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl text-center">
                                        <div className="text-sm font-black text-slate-800 dark:text-white">{appraisal.overallGrade}</div>
                                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">الدرجة النهائية</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between relative">
                                    {getStatusBadge(appraisal.status)}
                                    <div className="flex gap-2">
                                        <button onClick={() => handleViewAppraisal(appraisal)} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors hover:shadow-lg">
                                            <EyeIcon className="w-5 h-5" />
                                        </button>
                                        <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors">
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB CONTENT: GOALS */}
            {activeTab === 'goals' && (
                <div className="space-y-8">
                    <Card className="p-10 border-none bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/40">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">متابعة الأهداف الاستراتيجية</h3>
                                <p className="text-xs font-bold text-slate-400 mt-1">قياس مؤشرات الأداء الوظيفي KPIs</p>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-xl border-slate-100">إضافة هدف جديد</Button>
                        </div>

                        <div className="space-y-8 mt-10">
                            {mockAppraisals[0].goals.map((goal) => (
                                <div key={goal.id} className="p-8 border border-slate-100 dark:border-slate-800 rounded-3xl hover:border-primary/30 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-lg font-black text-slate-800 dark:text-white uppercase font-sans tracking-tight">{goal.title}</h4>
                                                <Badge text={goal.priority} color={goal.priority === PerformanceGoalPriority.HIGH ? 'rose' : 'blue'} className="text-[10px] px-3 font-black" />
                                            </div>
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">{goal.description}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black text-primary font-mono">{goal.progress}%</div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mt-1">نسبة الإنجاز</div>
                                        </div>
                                    </div>

                                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-4 rounded-full overflow-hidden mb-6 flex group-hover:scale-[1.01] transition-transform">
                                        <div 
                                            className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-1000 ease-out relative"
                                            style={{ width: `${goal.progress}%` }}
                                        >
                                            <div className="absolute top-0 right-0 bg-white/30 h-full w-4 blur-sm animate-pulse"></div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase">
                                            <div className="flex items-center gap-2">
                                                <CalendarDaysIcon className="w-4 h-4 text-primary" />
                                                البداية: {goal.startDate}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <ClockIcon className="w-4 h-4 text-rose-400" />
                                                النهاية: {goal.endDate}
                                            </div>
                                            {goal.kpiMarkers && (
                                                <div className="flex items-center gap-2 text-emerald-500">
                                                    <TargetIcon className="w-4 h-4" />
                                                    KPI: {goal.kpiMarkers}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="sm" className="rounded-xl text-slate-400 hover:text-primary">تحديث التقدم</Button>
                                            <Button variant="ghost" size="sm" className="rounded-xl text-slate-400 hover:text-primary">تعديل</Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* MODAL: VIEW APPRAISAL (OFFICIAL PRINT FORMAT) */}
            <Modal
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="تفاصيل تقييم الأداء"
                size="xl"
            >
                <div className="flex justify-between items-center mb-6 px-1">
                    <div className="flex gap-3">
                        <Button variant="primary" size="sm" className="rounded-xl shadow-lg" onClick={handlePrint}>
                            <PrinterIcon className="w-4 h-4 me-2" />
                            طباعة التقييم الرسمي
                        </Button>
                        <Button variant="outline" size="sm" className="rounded-xl">
                            <ArrowDownTrayIcon className="w-4 h-4 me-2" />
                            تصدير PDF
                        </Button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-400">حالة التقييم:</span>
                        {selectedAppraisal && getStatusBadge(selectedAppraisal.status)}
                    </div>
                </div>

                <div 
                    ref={componentRef}
                    className="bg-white p-12 text-slate-800 rounded-3xl dark:text-slate-900 ltr print:p-0 print:rounded-none"
                    dir="rtl"
                >
                    {/* Header with Logo */}
                    <div className="flex justify-between items-start border-b-4 border-primary pb-10 mb-10">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary">
                                <ActivityIcon className="w-12 h-12" />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-2xl font-black text-primary tracking-tight">عدالة • منظومة الإدارة القانونية</h1>
                                <p className="text-sm font-black text-slate-500 uppercase tracking-widest">نموذج تقييم الأداء السنوي المعتمد</p>
                                <p className="text-[10px] font-bold text-slate-400">الرقم المرجعي: {selectedAppraisal?.referenceNumber}</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-2 overflow-hidden">
                                {selectedAppraisal?.qrCodeData && (
                                    <div className="p-2 bg-white">
                                        <div className="w-20 h-20 bg-slate-200 animate-pulse"></div>
                                    </div>
                                )}
                             </div>
                             <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">امسح للتحقق من الصحة</div>
                        </div>
                    </div>

                    {/* Employee Profile Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6 border-b border-primary/20 pb-2">بيانات الموظف</h3>
                            <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">الاسم الكامل</label>
                                    <div className="text-sm font-black text-slate-700">{selectedAppraisal?.employeeName}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">الرقم الوظيفي</label>
                                    <div className="text-sm font-black text-slate-700 font-mono tracking-tighter">{selectedAppraisal?.employeeIdNumber}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">المسمى الوظيفي</label>
                                    <div className="text-sm font-black text-slate-700">{selectedAppraisal?.employeeJobTitle}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">القسم</label>
                                    <div className="text-sm font-black text-slate-700">{selectedAppraisal?.employeeDepartment}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">تاريخ التعيين</label>
                                    <div className="text-sm font-black text-slate-700">{selectedAppraisal?.joiningDate}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">سنوات الخبرة</label>
                                    <div className="text-sm font-black text-slate-700">{selectedAppraisal?.experienceYears} سنوات</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100">
                             <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6 border-b border-primary/20 pb-2">تفاصيل التقييم</h3>
                             <div className="grid grid-cols-2 gap-y-6 gap-x-10">
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">فترة التقييم</label>
                                    <div className="text-sm font-black text-slate-700">{selectedAppraisal?.appraisalPeriod}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">تاريخ التقييم</label>
                                    <div className="text-sm font-black text-slate-700">{selectedAppraisal?.appraisalDate}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">المدير المسؤول</label>
                                    <div className="text-sm font-black text-slate-700">{selectedAppraisal?.managerName}</div>
                                </div>
                                <div>
                                    <label className="text-[9px] font-black text-slate-400 uppercase mb-1 block">التقييم العام</label>
                                    <div className={`text-lg font-black ${getGradeColor(selectedAppraisal?.overallScore || 0)}`}>{selectedAppraisal?.overallScore} / 5</div>
                                </div>
                            </div>
                            <div className="mt-8 p-4 bg-white rounded-2xl border border-slate-100 text-center">
                                <span className={`text-xl font-black ${getGradeColor(selectedAppraisal?.overallScore || 0)}`}>{selectedAppraisal?.overallGrade}</span>
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-1">النتيجة النهائية</div>
                            </div>
                        </div>
                    </div>

                    {/* Performance Criteria Visualizer */}
                    <div className="mb-12">
                        <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-8 border-b border-primary/20 pb-2">تحليل معايير الأداء المعتمدة</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart outerRadius={90} data={radarData}>
                                        <PolarGrid stroke="#E2E8F0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 700, fill: '#64748B' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} axisLine={false} />
                                        <Radar
                                            name="الأداء"
                                            dataKey="A"
                                            stroke="#3B82F6"
                                            fill="#3B82F6"
                                            fillOpacity={0.4}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-x-10 gap-y-4">
                                {selectedAppraisal && Object.entries(selectedAppraisal.criteria).map(([key, value]) => (
                                    <div key={key} className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                            <span className="text-slate-500">{value.name}</span>
                                            <span className="text-primary">{value.score} / 5</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${(value.score / 5) * 100}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Qualitative Notes */}
                    <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 mb-12">
                         <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-4">ملاحظات المدير العام</h3>
                         <div className="text-sm font-bold text-slate-600 leading-relaxed italic">
                            "{selectedAppraisal?.generalNotes}"
                         </div>
                    </div>

                    {/* Goals Progress in Appraisal */}
                    {selectedAppraisal?.goals && selectedAppraisal.goals.length > 0 && (
                        <div className="mb-12">
                            <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6 border-b border-primary/20 pb-2">تحقيق الأهداف السنوية</h3>
                            <div className="space-y-4">
                                {selectedAppraisal.goals.map((goal, idx) => (
                                    <div key={idx} className="flex items-center gap-6 p-4 border border-slate-100 rounded-2xl">
                                        <div className="flex-grow">
                                            <div className="text-sm font-black text-slate-800">{goal.title}</div>
                                            <div className="text-[10px] font-bold text-slate-400 mt-1">{goal.description}</div>
                                        </div>
                                        <div className="w-48 space-y-1">
                                            <div className="flex justify-between text-[10px] font-black uppercase">
                                                <span className="text-slate-400">الإنجاز</span>
                                                <span className="text-primary">{goal.progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${goal.progress}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Recommendations and Signatures */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-20 pt-10 border-t border-slate-100">
                        <div className="space-y-6">
                            <h3 className="text-xs font-black text-primary uppercase tracking-widest border-s-4 border-primary ps-3">توصيات الموارد البشرية</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${selectedAppraisal?.recommendations?.promotion ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                                        {selectedAppraisal?.recommendations?.promotion && <CheckCircleIcon className="w-4 h-4" />}
                                    </div>
                                    <span className="text-xs font-black text-slate-600">ترقية لدرجة وظيفية أعلى</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${selectedAppraisal?.recommendations?.salaryIncrease ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                                        {selectedAppraisal?.recommendations?.salaryIncrease && <CheckCircleIcon className="w-4 h-4" />}
                                    </div>
                                    <span className="text-xs font-black text-slate-600">منح زيادة في الراتب الأساسي</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-md flex items-center justify-center ${selectedAppraisal?.recommendations?.bonus ? 'bg-emerald-500 text-white' : 'bg-slate-200'}`}>
                                        {selectedAppraisal?.recommendations?.bonus && <CheckCircleIcon className="w-4 h-4" />}
                                    </div>
                                    <span className="text-xs font-black text-slate-600">صرف مكافأة أداء استثنائية (Bonus)</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 text-center">
                            <div className="space-y-4">
                                <div className="h-20 flex items-end justify-center border-b border-primary/20 pb-2 italic text-slate-300 font-serif">
                                    {selectedAppraisal?.signatures?.manager?.name}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">توقيع المدير المباشر</div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-20 flex items-end justify-center border-b border-primary/20 pb-2 italic text-slate-300 font-serif">
                                    {selectedAppraisal?.signatures?.hr?.name}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">اعتماد الموارد البشرية</div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-20 flex items-end justify-center border-b border-primary/20 pb-2 italic text-slate-300 font-serif">
                                    {selectedAppraisal?.signatures?.employee?.name}
                                </div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">توقيع الموظف بالموافقة</div>
                            </div>
                        </div>
                    </div>

                    {/* Official Stamp Footer */}
                    <div className="mt-24 pt-10 border-t-2 border-slate-50 flex justify-between items-center opacity-50 grayscale">
                        <div className="text-[8px] font-bold text-slate-400 max-w-xs">
                            هذا المستند صادر آلياً من نظام Qanooni Pro لإدارة الأداء. أي محاولة تعديل يدوية أو تلاعب في الأرقام تعرض صاحبها للمساءلة القانونية.
                        </div>
                        <div className="flex items-center gap-2">
                             <ShieldCheckIcon className="w-6 h-6 text-emerald-500" />
                             <div className="text-[10px] font-black text-slate-500">نظام معتمد • آمن • مشفر</div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default EmployeePerformancePage;
