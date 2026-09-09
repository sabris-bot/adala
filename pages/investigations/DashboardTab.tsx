import React, { useEffect, useState } from 'react';
import { InvestigationCase, CaseStatus } from './types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
    Folder, Clock, CheckCircle2, ShieldAlert, FilePlus, 
    TrendingUp, Award, Calendar, AlertTriangle, ArrowUpRight, Scale, 
    ChevronLeft, Mic, ShieldCheck, Activity, Users, FileText, ArrowRightLeft,
    Bell, Sparkles, PieChart as PieChartIcon, BarChart3, AlertCircle
} from 'lucide-react';
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend
} from 'recharts';
import { notificationService } from '../../services/notificationService';
import { NotificationType, NotificationPriority } from '../../types';

interface DashboardTabProps {
    cases: InvestigationCase[];
    stats: {
        total: number;
        new: number;
        ongoing: number;
        closed: number;
        onHold: number;
        archivedOrReferred?: number;
    };
    onSelectCase: (id: string) => void;
    onAddCaseTrigger: () => void;
    onOpenVoiceStudio?: () => void;
    onNavigateTab?: (tabKey: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
    cases,
    stats,
    onSelectCase,
    onAddCaseTrigger,
    onOpenVoiceStudio,
    onNavigateTab
}) => {
    const [notifiedCases, setNotifiedCases] = useState<Record<string, boolean>>({});

    // 1. Calculate violation distribution
    const categoryCounts: Record<string, number> = {};
    cases.forEach(c => {
        const cat = c.category || 'مخالفات لائحية عامة';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    // 2. Identify cases with imminent statutory limit under Article 35 (15-day limit)
    const activeRiskCases = cases.filter(c => {
        if (c.status === CaseStatus.CLOSED || c.status === CaseStatus.ARCHIVED) return false;
        const oDate = new Date(c.startDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - oDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 4; // Monitoring active cases approaching 15 days
    });

    // 3. Count active appeals / pending decisions & Calculate 20-Day Grievance Deadline Badges
    const appealTrackingCases = cases.filter(c => 
        c.proposedPenalty || 
        c.isTransferredToDisciplinary || 
        c.status === CaseStatus.CLOSED || 
        c.endDate
    ).map(c => {
        const baseDateStr = c.endDate || c.startDate;
        const baseDate = new Date(baseDateStr);
        const deadlineDate = new Date(baseDate);
        deadlineDate.setDate(deadlineDate.getDate() + 20);
        
        const today = new Date();
        const diffTime = deadlineDate.getTime() - today.getTime();
        const remainingDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        const isExpired = remainingDays <= 0;
        const isExpiringSoon = remainingDays > 0 && remainingDays <= 3;
        const deadlineStr = deadlineDate.toISOString().split('T')[0];

        return {
            caseItem: c,
            deadlineStr,
            remainingDays: Math.max(0, remainingDays),
            isExpired,
            isExpiringSoon
        };
    });

    // 4. Auto-trigger notification for investigator if 3 days or fewer remain before 20-day appeal deadline
    useEffect(() => {
        appealTrackingCases.forEach(item => {
            if (item.isExpiringSoon && !notifiedCases[item.caseItem.id]) {
                try {
                    notificationService.addNotification({
                        title: `تنبيه اقتراب انتهاء مهلة التظلم (المادة 102)`,
                        message: `تنبيه للمحقق المسؤول (${item.caseItem.investigator}): يتبقى ${item.remainingDays} أيام فقط على انتهاء مهلة الـ 20 يوماً القانونية للتظلم في القضية ${item.caseItem.caseNumber} للموظف ${item.caseItem.employeeName}.`,
                        category: 'URGENT',
                        priority: 'HIGH',
                        relatedId: item.caseItem.id
                    });
                    setNotifiedCases(prev => ({ ...prev, [item.caseItem.id]: true }));
                } catch (e) {
                    console.error('Error dispatching deadline alert', e);
                }
            }
        });
    }, [appealTrackingCases, notifiedCases]);

    // 5. Closed / transferred decisions count
    const closedDecisionsCount = cases.filter(c => c.status === CaseStatus.CLOSED || c.isTransferredToDisciplinary).length;
    const pendingDecisionsCount = cases.filter(c => 
        c.status !== CaseStatus.CLOSED && 
        c.status !== CaseStatus.ARCHIVED && 
        (!c.approvedByGeneralManager || !c.approvedByLegalManager)
    ).length;

    // 6. Metrics Calculations for Recharts Charts:
    // a. Completion Rate (Closed / Total)
    const completionRate = stats.total > 0 ? Math.round((stats.closed / stats.total) * 100) : 0;
    
    // b. Average duration per completed investigation (in days)
    const completedWithDates = cases.filter(c => (c.status === CaseStatus.CLOSED || c.endDate) && c.startDate);
    let totalDurationDays = 0;
    completedWithDates.forEach(c => {
        const start = new Date(c.startDate).getTime();
        const end = c.endDate ? new Date(c.endDate).getTime() : new Date().getTime();
        const days = Math.max(1, Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)));
        totalDurationDays += days;
    });
    const avgDurationDays = completedWithDates.length > 0 ? (totalDurationDays / completedWithDates.length).toFixed(1) : '3.5';

    // c. Ratio of legal recommendations vs total cases
    const casesWithRecommendation = cases.filter(c => c.recommendation || c.proposedPenalty).length;
    const recommendationRatio = stats.total > 0 ? Math.round((casesWithRecommendation / stats.total) * 100) : 0;

    // Chart 1 Data: Status Breakdown (Pie)
    const statusChartData = [
        { name: 'جديد ومقيد', value: stats.new, color: '#64748b' },
        { name: 'قيد الاستجواب', value: stats.ongoing, color: '#d97706' },
        { name: 'منتهي ومحفوظ', value: stats.closed, color: '#059669' },
        { name: 'معلق إدارياً', value: stats.onHold, color: '#475569' }
    ].filter(d => d.value > 0);

    // Chart 2 Data: Duration & Completion Comparison (Bar)
    const performanceChartData = [
        { name: 'نسبة الإنجاز والتسوية', value: completionRate, target: 85, fill: '#059669' },
        { name: 'نسبة صياغة التوصيات', value: recommendationRatio, target: 90, fill: '#0284c7' },
        { name: 'الامتثال للضمانات (المادة 115)', value: 92, target: 100, fill: '#d97706' }
    ];

    // Compute overall compliance rate across all cases based on safeguards checklists
    let totalScore = 0;
    let scoredCasesCount = 0;
    cases.forEach(c => {
        if (c.safeguards) {
            const checklist = c.safeguards;
            const checkedCount = Object.values(checklist).filter(Boolean).length;
            totalScore += (checkedCount / 5) * 100;
            scoredCasesCount++;
        }
    });
    const avgComplianceRate = scoredCasesCount > 0 ? Math.round(totalScore / scoredCasesCount) : 95;

    return (
        <div className="space-y-6 text-right font-sans" style={{ direction: 'rtl' }}>
            
            {/* 1. Bento Grid of 4 Core Requested KPI Indicators */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Metric 1: Total Investigation Files */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
                    <div className="space-y-1.5 min-w-0 pr-1">
                        <span className="text-[11px] font-bold text-slate-500 block truncate">إجمالي ملفات التحقيق</span>
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-2xl font-black text-slate-900 font-mono tracking-tight">{stats.total}</span>
                            <span className="text-[10px] font-extrabold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                مقيدة بالسجل
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">محاضر مقيدة رسمياً</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-2xs">
                        <Folder className="w-5 h-5" />
                    </div>
                </div>

                {/* Metric 2: Completion Rate & Avg Duration */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-emerald-300 transition-all">
                    <div className="space-y-1.5 min-w-0 pr-1">
                        <span className="text-[11px] font-bold text-slate-500 block truncate">معدل الإنجاز والسرعة</span>
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-2xl font-black text-emerald-800 font-mono tracking-tight">{completionRate}%</span>
                            <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/70">
                                {avgDurationDays} يوم/تحقيق
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">متوسط مدة الإنجاز</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-emerald-900 text-emerald-300 flex items-center justify-center shrink-0 shadow-2xs">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                {/* Metric 3: Ongoing & Active Cases */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-amber-300 transition-all">
                    <div className="space-y-1.5 min-w-0 pr-1">
                        <span className="text-[11px] font-bold text-slate-500 block truncate">قيد التحقيق والاستجواب</span>
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-2xl font-black text-amber-700 font-mono tracking-tight">{stats.ongoing + stats.new}</span>
                            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/70">
                                {stats.new} وارد جديد
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">جلسات استماع منعقدة</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 border border-amber-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>

                {/* Metric 4: Recommendations vs Total Cases */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-indigo-300 transition-all">
                    <div className="space-y-1.5 min-w-0 pr-1">
                        <span className="text-[11px] font-bold text-slate-500 block truncate">نسبة التوصيات القانونية</span>
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-2xl font-black text-indigo-700 font-mono tracking-tight">{recommendationRatio}%</span>
                            <span className="text-[10px] font-extrabold text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/70">
                                {casesWithRecommendation} توصية مصاغة
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium truncate">من إجمالي الملفات</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 flex items-center justify-center shrink-0 shadow-2xs">
                        <Scale className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* 2. Interactive Charts Section (Recharts Visual Dashboard) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left Chart: Performance Metrics & Completion Rate (8 Cols) */}
                <div className="lg:col-span-8">
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <BarChart3 className="w-4 h-4" />
                                </span>
                                <div>
                                    <h3 className="text-xs font-black text-slate-900">مؤشرات أداء التحقيق والتوصيات القانونية (Recharts Analytics)</h3>
                                    <p className="text-[10px] text-slate-400">معدل الإنجاز • نسبة التوصيات الصادرة • الالتزام بالضمانات</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                                    متوسط الإنجاز: {avgDurationDays} أيام
                                </span>
                            </div>
                        </div>

                        <div className="h-64 w-full pt-2">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={performanceChartData}
                                    layout="vertical"
                                    margin={{ top: 10, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                                    <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                                    <Tooltip 
                                        formatter={(val: any) => [`${val}%`, 'المؤشر الحالي']}
                                        contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '11px', direction: 'rtl' }}
                                    />
                                    <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={22} fill="#00796B" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Right Chart: Status Distribution (4 Cols) */}
                <div className="lg:col-span-4">
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                                    <PieChartIcon className="w-4 h-4" />
                                </span>
                                <div>
                                    <h3 className="text-xs font-black text-slate-900">توزيع حالات ملفات التحقيق</h3>
                                    <p className="text-[10px] text-slate-400">حسب المرحلة الإجرائية</p>
                                </div>
                            </div>
                        </div>

                        <div className="h-44 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={45}
                                        outerRadius={70}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {statusChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        formatter={(val: any) => [val, 'عدد القضايا']}
                                        contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '11px', direction: 'rtl' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[10px] font-bold">
                            {statusChartData.map((s, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                                    <span className="text-slate-600 truncate">{s.name}:</span>
                                    <span className="font-mono text-slate-900 font-bold">{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* 3. 20-Day Legal Grievance Deadline Badges (نظام عدادات مهلة التظلم 20 يوماً وتنبيهات المحقق) */}
            <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3.5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="bg-indigo-50 border border-indigo-200/70 text-indigo-700 px-2 py-0.5 rounded-lg text-[10px] font-black">
                                المادة 102 من قانون العمل
                            </span>
                            <span className="bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                عداد التظلمات القانونية (20 يوماً)
                            </span>
                        </div>
                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 pt-1">
                            <Bell className="w-4 h-4 text-indigo-600 shrink-0" />
                            متابعة المهل المتبقية لانتهاء حق التظلم القانوني والتنبيه الاستباقي (3 أيام)
                        </h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 self-start sm:self-auto">
                        القرارات الصادرة: {appealTrackingCases.length}
                    </span>
                </div>

                {appealTrackingCases.length === 0 ? (
                    <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                        <p className="text-xs font-bold text-slate-600">لا توجد قرارات تأديبية تحت متابعة مهلة التظلم حالياً.</p>
                        <p className="text-[10px] text-slate-400">يتم فتح مهلة الـ 20 يوماً تلقائياً فور اعتماد أو ترحيل الجزاء في التحقيق.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {appealTrackingCases.map((item, idx) => {
                            const { caseItem, deadlineStr, remainingDays, isExpired, isExpiringSoon } = item;
                            return (
                                <div 
                                    key={idx}
                                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                                        isExpired
                                            ? 'bg-slate-50/70 border-slate-200 text-slate-600'
                                            : isExpiringSoon
                                                ? 'bg-rose-50/50 border-rose-300 shadow-2xs animate-pulse-subtle'
                                                : 'bg-indigo-50/30 border-indigo-200/80 hover:border-indigo-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-mono font-black text-slate-900">
                                            {caseItem.caseNumber}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            {isExpired ? (
                                                <span className="text-[9px] font-black bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                                                    تحصن القرار (انتهت المهلة)
                                                </span>
                                            ) : isExpiringSoon ? (
                                                <span className="text-[9px] font-black bg-rose-600 text-white px-2 py-0.5 rounded-md flex items-center gap-1 animate-pulse">
                                                    <AlertCircle className="w-3 h-3" />
                                                    تنبيه عاجل: متبقي {remainingDays} أيام
                                                </span>
                                            ) : (
                                                <span className="text-[9px] font-black bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded-md">
                                                    متبقي {remainingDays} يوماً للتظلم
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-slate-900 line-clamp-1">{caseItem.employeeName}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">الجزاء: {caseItem.proposedPenalty || 'تنبيه إداري'}</p>
                                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">تاريخ الانتهاء: {deadlineStr}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 text-[10px]">
                                        <span className="text-slate-500 font-medium truncate max-w-[150px]">
                                            المحقق: {caseItem.investigator?.split(' ')[0] || 'المستشار القانوني'}
                                        </span>
                                        <button 
                                            onClick={() => onSelectCase(caseItem.id)}
                                            className="text-indigo-700 hover:text-indigo-900 font-bold transition-colors"
                                        >
                                            فتح الملف ←
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* 4. Article 35 (15-Day Limit) Monitoring & Recent Cases Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Right Panel: Imminent Legal Deadline Alerts (Article 35 monitoring) (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3.5">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="bg-rose-50 border border-rose-200/70 text-rose-700 px-2 py-0.5 rounded-lg text-[10px] font-black">
                                        أمن الامتثال اللائحي
                                    </span>
                                    <span className="bg-amber-50 text-amber-800 border border-amber-200/60 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                        المادة 35 من قانون العمل
                                    </span>
                                </div>
                                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 pt-1">
                                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                                    مراقب المهل القانونية وسقوط الحق التأديبي (سقف الـ 15 يوماً)
                                </h3>
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/60 self-start sm:self-auto">
                                المهلة الإلزامية للمباشرة
                            </span>
                        </div>

                        {activeRiskCases.length === 0 ? (
                            <div className="p-5 bg-emerald-50/50 border border-emerald-200/70 rounded-xl text-center space-y-1">
                                <p className="text-xs font-black text-emerald-900">✓ جميع قضايا التحقيق الحالية مستوفاة لشرط المدد في قانون العمل الكويتي.</p>
                                <p className="text-[11px] text-emerald-700 font-medium">لم يتجاوز أي ملف نشط حاجز المدد القانونية، مما يضمن سلامة وصحة الإجراءات القضائية.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {activeRiskCases.map(c => {
                                    const oDate = new Date(c.startDate);
                                    const diffDays = Math.ceil(Math.abs(new Date().getTime() - oDate.getTime()) / (1000 * 60 * 60 * 24));
                                    const remainingDays = Math.max(0, 15 - diffDays);
                                    const isCritical = remainingDays <= 4;
                                    return (
                                        <div 
                                            key={c.id} 
                                            className={`p-4 border rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all ${
                                                isCritical 
                                                    ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300' 
                                                    : 'bg-amber-50/30 border-amber-200/80 hover:border-amber-300'
                                            }`}
                                        >
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                                                        isCritical ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                                                    }`}>
                                                        {isCritical ? 'حرِج جداً' : 'قيد المتابعة'}
                                                    </span>
                                                    <span className="text-xs font-black text-slate-900 font-mono">{c.caseNumber}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <span className="text-xs font-bold text-slate-700">{c.employeeName}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">({c.employeeDepartment})</span>
                                                </div>
                                                <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{c.subject}</h4>
                                                <p className="text-[10px] text-slate-500 font-medium">
                                                    تاريخ فتح القيد: {c.startDate} • مرت {diffDays} يوماً
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                                                <div className="text-left">
                                                    <p className={`text-xs font-black font-mono ${isCritical ? 'text-rose-700' : 'text-amber-800'}`}>
                                                        المتبقي: {remainingDays} أيام
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 font-bold">مهلة مادة 35</p>
                                                </div>
                                                <Button 
                                                    size="sm" 
                                                    variant="primary" 
                                                    className={`text-xs font-bold rounded-lg px-3 py-1.5 ${
                                                        isCritical ? 'bg-rose-700 hover:bg-rose-800 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'
                                                    }`}
                                                    onClick={() => onSelectCase(c.id)}
                                                >
                                                    فتح الملف
                                                    <ChevronLeft className="w-3.5 h-3.5 mr-1 inline-block" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>

                    {/* Quick Access & Recent Active Cases */}
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-700" />
                                أحدث محاضر التحقيق والقضايا النشطة
                            </h3>
                            {onNavigateTab && (
                                <button 
                                    onClick={() => onNavigateTab('registry')}
                                    className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer"
                                >
                                    عرض السجل الكامل ←
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {cases.slice(0, 4).map(c => (
                                <div 
                                    key={c.id} 
                                    onClick={() => onSelectCase(c.id)}
                                    className="p-3.5 border border-slate-200/70 rounded-xl hover:border-amber-400/80 hover:bg-amber-50/20 transition-all cursor-pointer space-y-2 group bg-slate-50/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                                            {c.caseNumber}
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            c.status === CaseStatus.CLOSED ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                                            c.status === CaseStatus.ONGOING ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                                            'bg-slate-100 text-slate-700'
                                        }`}>
                                            {c.status}
                                        </span>
                                    </div>
                                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-amber-900 transition-colors">
                                        {c.employeeName}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                        {c.subject}
                                    </p>
                                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50">
                                        <span>جلسات التحقيق: {c.sessions?.length || 0}</span>
                                        <span className="font-mono">{c.startDate}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Left Panel: Compliance Gauge & Categories Distribution (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* Compliance & Safeguards Card */}
                    <Card className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl shadow-md space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                            <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4" />
                                الامتثال للضمانات اللائحية الخمس
                            </span>
                            <span className="text-xl font-black text-white font-mono">{avgComplianceRate}%</span>
                        </div>

                        <p className="text-xs text-slate-300 leading-relaxed">
                            مؤشر التزام المحققين بالضمانات القانونية (إخطار مكتوب، سماع دفاع، توقيع الأقوال، تدرج المادة 102، ومراعاة مهلة الـ 15 يوماً).
                        </p>

                        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${avgComplianceRate}%` }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] text-slate-300 font-bold">
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                حماية من بطلان الجزاء
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                توثيق إلكتروني معتمد
                            </div>
                        </div>
                    </Card>

                    {/* Violation Types Distribution */}
                    <Card className="p-6 bg-white border border-slate-200/80 rounded-2xl shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black text-slate-900 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-amber-600" />
                                تصنيف المخالفات والوقائع
                            </h3>
                            <span className="text-[10px] text-slate-400 font-bold font-mono">
                                {Object.keys(categoryCounts).length} تصنيفات
                            </span>
                        </div>

                        <div className="space-y-3">
                            {Object.entries(categoryCounts).map(([catName, count], idx) => {
                                const percentage = Math.round((count / (cases.length || 1)) * 100);
                                return (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex justify-between text-xs font-bold text-slate-700">
                                            <span className="text-xs truncate max-w-[160px]">{catName}</span>
                                            <span className="font-mono text-slate-500 text-[11px]">{count} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    idx === 0 ? 'bg-slate-900' :
                                                    idx === 1 ? 'bg-amber-600' :
                                                    idx === 2 ? 'bg-teal-600' : 'bg-blue-600'
                                                }`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

