import React from 'react';
import { 
    Scale, Activity, Clock, ShieldCheck, Undo2, AlertTriangle, 
    FileText, CheckCircle2, TrendingUp, AlertCircle, Compass, 
    PlusCircle, Printer, ArrowRight, UserCheck, ShieldAlert
} from 'lucide-react';
import { 
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
    PieChart, Pie, Cell 
} from 'recharts';
import Button from '../../components/ui/Button';
import { DisciplinaryRecord, DisciplinaryActionStatus, calculate20DayCountdown } from './DisciplinaryTypes';

interface DisciplinaryDashboardTabProps {
    records: DisciplinaryRecord[];
    onNavigateTab: (tab: 'records' | 'simulator' | 'workbench' | 'appeals' | 'analytics') => void;
    onOpenNewRecordModal: () => void;
    onOpenNewAppealModal: () => void;
    onSelectRecordForDossier: (recordId: string) => void;
}

export const DisciplinaryDashboardTab: React.FC<DisciplinaryDashboardTabProps> = ({
    records,
    onNavigateTab,
    onOpenNewRecordModal,
    onOpenNewAppealModal,
    onSelectRecordForDossier
}) => {
    // Calculated KPI Metrics
    const total = records.length;
    const pending = records.filter(r => r.status === DisciplinaryActionStatus.PENDING).length;
    const approved = records.filter(r => r.status === DisciplinaryActionStatus.APPROVED).length;
    const appealed = records.filter(r => r.status === DisciplinaryActionStatus.APPEALED).length;
    const reducedOrCancelled = records.filter(
        r => r.status === DisciplinaryActionStatus.REDUCED || r.status === DisciplinaryActionStatus.CANCELLED
    ).length;

    // Total financial deduction days across active records
    const totalDeductionDays = records
        .filter(r => r.status === DisciplinaryActionStatus.APPROVED)
        .reduce((sum, r) => sum + (r.deductionDays || 0), 0);

    // Violations distribution
    const counts: Record<string, number> = {};
    records.forEach(r => { 
        const key = r.violationType || 'أخرى';
        counts[key] = (counts[key] || 0) + 1; 
    });
    const violationChartData = Object.keys(counts).map(k => ({
        name: k.length > 18 ? k.substring(0, 16) + '...' : k,
        fullLabel: k,
        count: counts[k]
    }));

    // Status breakdown for Pie
    const statusPieData = [
        { name: 'معتمد وساري (م 102)', value: approved, color: '#113F36' },
        { name: 'قيد التحقيق (م 35)', value: pending, color: '#D97706' },
        { name: 'تظلم قائم (20 يوماً)', value: appealed, color: '#7C3AED' },
        { name: 'معدل / ملغى', value: reducedOrCancelled, color: '#059669' }
    ].filter(item => item.value > 0);

    // Active appeals list with countdown
    const activeAppealsList = records
        .filter(r => r.status === DisciplinaryActionStatus.APPEALED || r.appealsLogs)
        .slice(0, 4);

    return (
        <div className="space-y-6">
            
            {/* Quick Alert Banner: Kuwait Labor Law Adherence */}
            <div className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white p-4 sm:p-5 rounded-2xl border border-[#C19A5B]/30 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 z-10">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#C19A5B] to-[#F59E0B] text-[#0F172A] flex items-center justify-center font-black shadow-md shrink-0">
                        <Scale className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#C19A5B]/20 text-[#F59E0B] border border-[#C19A5B]/40">
                                نظام الامتثال القانوني الآلي
                            </span>
                            <span className="text-xs text-slate-300 font-bold">قانون العمل الكويتي رقم 6 لسنة 2010</span>
                        </div>
                        <h3 className="text-base font-black text-white mt-1">
                            لوحة المراقبة التأديبية والتحقيقات الإدارية والبت في التظلمات
                        </h3>
                        <p className="text-xs text-slate-300 mt-0.5 max-w-3xl leading-relaxed">
                            تطبيق فوري لضمانات التحقيق (المادة 35)، وسلم تدرج العقوبات (المادة 102)، ومتابعة حية لمهلة الـ 20 يوماً للتظلمات القانونية.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 z-10 shrink-0 w-full sm:w-auto">
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onOpenNewRecordModal}
                        className="bg-[#C19A5B] hover:bg-[#a37f44] text-[#0F172A] font-black text-xs h-9 px-4 rounded-xl shadow-md flex-1 sm:flex-initial justify-center"
                    >
                        <PlusCircle className="w-4 h-4 ml-1.5" />
                        قيد قرار تأديبي جديد
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onOpenNewAppealModal}
                        className="border-[#C19A5B]/40 text-[#F59E0B] hover:bg-white/10 font-bold text-xs h-9 px-4 rounded-xl flex-1 sm:flex-initial justify-center"
                    >
                        <Undo2 className="w-4 h-4 ml-1.5" />
                        تقديم تظلم إلكتروني
                    </Button>
                </div>
            </div>

            {/* 1. TOP STATS GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* Card 1: Total Decisions */}
                <div 
                    onClick={() => onNavigateTab('records')}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 left-0 h-1 bg-[#113F36]" />
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">إجمالي القرارات التأديبية</span>
                        <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-[#113F36] dark:text-teal-400 group-hover:scale-110 transition-transform">
                            <Activity className="w-4.5 h-4.5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono">{total}</span>
                        <span className="text-[10px] text-teal-700 dark:text-teal-400 font-bold">ملف مقيد</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-bold">
                        <span>انقر لاستعراض السجلات</span>
                        <ArrowRight className="w-3 h-3 rotate-180 text-teal-600" />
                    </p>
                </div>

                {/* Card 2: Under Investigation (Art 35) */}
                <div 
                    onClick={() => onNavigateTab('workbench')}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 left-0 h-1 bg-[#D97706]" />
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">قيد التحقيق وسماع الأقوال (م 35)</span>
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 group-hover:scale-110 transition-transform">
                            <Clock className="w-4.5 h-4.5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">{pending}</span>
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold">محاضر معلقة</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-bold">
                        <span>جلسات الاستجواب الرسمية</span>
                        <ArrowRight className="w-3 h-3 rotate-180 text-amber-600" />
                    </p>
                </div>

                {/* Card 3: Approved Sanctions (Art 102) */}
                <div 
                    onClick={() => onNavigateTab('records')}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 left-0 h-1 bg-emerald-600" />
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">عقوبات نافذة قانوناً (م 102)</span>
                        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-4.5 h-4.5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400 font-mono">{approved}</span>
                        <span className="text-[10px] text-emerald-600 font-bold">سارية بالخدمة</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-bold">
                        <span>إجمالي الخصومات: {totalDeductionDays} أيام</span>
                    </p>
                </div>

                {/* Card 4: Appeals Pending (20 Days Countdown) */}
                <div 
                    onClick={() => onNavigateTab('appeals')}
                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 left-0 h-1 bg-purple-600" />
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">التظلمات والاعتراضات القائمة</span>
                        <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400 group-hover:scale-110 transition-transform">
                            <Undo2 className="w-4.5 h-4.5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-400 font-mono">{appealed}</span>
                        <span className="text-[10px] text-purple-600 font-bold">مهلة الـ 20 يوماً</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1 font-bold">
                        <span>عرض قرارات البت بالتظلم</span>
                        <ArrowRight className="w-3 h-3 rotate-180 text-purple-600" />
                    </p>
                </div>

            </div>

            {/* 2. CHARTS & TIMELINE SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Violations Distribution Bar Chart */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#C19A5B]" />
                            <h3 className="text-xs font-black text-slate-900 dark:text-white">
                                تصنيف وتوزيع المخالفات المسجلة بالمنشأة
                            </h3>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            محدث تلقائياً
                        </span>
                    </div>

                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={violationChartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 10, fill: '#64748B' }} 
                                    interval={0}
                                    angle={-15}
                                    textAnchor="end"
                                />
                                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                                <Tooltip 
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-[#0F172A] text-white p-2.5 rounded-xl text-xs font-bold shadow-xl border border-[#C19A5B]/30 text-right">
                                                    <p className="text-[#C19A5B] mb-1">{data.fullLabel}</p>
                                                    <p>عدد الحالات: <span className="font-mono text-emerald-400 font-black">{data.count}</span></p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar dataKey="count" fill="#113F36" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Status Breakdown & Resolution Ring */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <div className="flex items-center gap-2">
                                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                                <h3 className="text-xs font-black text-slate-900 dark:text-white">
                                    توزيع حالات القرارات التأديبية
                                </h3>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-600">
                                {total} قرار
                            </span>
                        </div>

                        <div className="h-48 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusPieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={46}
                                        outerRadius={72}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {statusPieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold border-t border-slate-100 dark:border-slate-800 pt-3">
                        {statusPieData.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                                <div className="flex items-center gap-1.5 truncate">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                    <span className="text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
                                </div>
                                <span className="font-mono font-black text-slate-900 dark:text-white px-1.5">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* 3. 20-DAY COUNTDOWN WATCHLIST & QUICK WORKBENCH ENTRY */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 shadow-xs">
                
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#D97706]" />
                            مراقبة المهل القانونية للتظلم والاعتراض (عداد الـ 20 يوماً المباشر)
                        </h3>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                            المادة 102 من قانون العمل الكويتي: تبدأ مهلة التظلم من تاريخ الإخطار الرسمي وتسقط الدعوى بانقضائها دون بت.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigateTab('appeals')}
                        className="text-xs font-bold h-8 border-purple-300 text-purple-700 dark:text-purple-300 hover:bg-purple-50"
                    >
                        فتح سجل التظلمات الكامل ({records.filter(r => r.status === DisciplinaryActionStatus.APPEALED).length})
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeAppealsList.length === 0 ? (
                        <div className="col-span-2 text-center py-8 text-slate-400 font-bold text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                            لا توجد تظلمات معلقة في الوقت الحالي، جميع المهل مستقرة وممتثلة.
                        </div>
                    ) : (
                        activeAppealsList.map(rec => {
                            const cd = calculate20DayCountdown(rec.notificationDate, rec.appealDeadlineDate);

                            return (
                                <div 
                                    key={rec.id}
                                    onClick={() => {
                                        onSelectRecordForDossier(rec.id);
                                        onNavigateTab('records');
                                    }}
                                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-[#C19A5B] transition-all cursor-pointer space-y-2.5"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-mono text-[10px] font-bold text-[#113F36] dark:text-teal-400">
                                                {rec.recordNumber}
                                            </span>
                                            <h4 className="text-xs font-black text-slate-900 dark:text-white">
                                                {rec.employeeName}
                                            </h4>
                                            <span className="text-[10px] text-slate-500">
                                                {rec.employeeJobTitle} • {rec.employeeDepartment}
                                            </span>
                                        </div>

                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${
                                            cd.statusSeverity === 'urgent' ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/50 dark:text-rose-300' :
                                            cd.statusSeverity === 'warning' ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/50 dark:text-amber-300' :
                                            'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-950/50 dark:text-teal-300'
                                        }`}>
                                            {cd.statusSeverity === 'urgent' ? 'عاجل جداً' :
                                             cd.statusSeverity === 'warning' ? 'تنبيه مهلة' : 'آمن'}
                                        </span>
                                    </div>

                                    {/* Progress countdown */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px] font-bold">
                                            <span className="text-slate-600 dark:text-slate-400">المهلة المتبقية:</span>
                                            <span className="font-mono font-black text-slate-900 dark:text-white">
                                                {cd.remainingDays > 0 ? `${cd.remainingDays} / 20 يوماً` : 'انتهت المهلة'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full transition-all duration-500 ${
                                                    cd.statusSeverity === 'urgent' ? 'bg-rose-600' :
                                                    cd.statusSeverity === 'warning' ? 'bg-amber-500' : 'bg-emerald-600'
                                                }`}
                                                style={{ width: `${cd.progressPercent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                                        <span>تاريخ الإبلاغ: {rec.notificationDate}</span>
                                        <span>نهاية المهلة: {cd.deadlineFormatted}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

            </div>

        </div>
    );
};
