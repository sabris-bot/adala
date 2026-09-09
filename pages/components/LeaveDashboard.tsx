import React, { useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { 
  Clock, Sparkles, Calendar, Calculator, ShieldCheck, 
  UserCheck, Users, FileText, CheckCircle2, AlertTriangle, 
  HeartPulse, Umbrella, ArrowUpRight, TrendingUp, RefreshCw,
  Scale, Baby, Moon, Compass, Landmark
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { DetailedLeaveRequest } from '../LeaveManagementPage';
import { LeaveTypeKuwait } from '../../types';

interface LeaveDashboardProps {
  lang: 'ar' | 'en';
  requests: DetailedLeaveRequest[];
  employeesList: any[];
  onTabChange: (tabId: 'dashboard' | 'requests' | 'balances' | 'calendar' | 'templates') => void;
  onViewRequest: (request: DetailedLeaveRequest) => void;
  onOpenProfile: (emp: any) => void;
}

export const LeaveDashboard: React.FC<LeaveDashboardProps> = ({
  lang,
  requests,
  employeesList,
  onTabChange,
  onViewRequest,
  onOpenProfile
}) => {
  const isAr = lang === 'ar';

  // 1. Calculations & Live Metrics
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Active leaves ongoing today
    const activeLeaves = requests.filter(r => {
      return (r.status === 'Approved' || r.status === 'Completed') && r.startDate <= todayStr && r.endDate >= todayStr;
    });

    // Sick leaves count & total days
    const sickRequests = requests.filter(r => r.leaveType === LeaveTypeKuwait.SICK && (r.status === 'Approved' || r.status === 'Completed'));
    const totalSickDays = sickRequests.reduce((sum, r) => sum + r.numberOfDays, 0);

    // Remaining balances calculation across all employees
    let totalAllotted = 0;
    let totalConsumed = 0;
    let totalCarriedOver = 0;

    employeesList.forEach(emp => {
      const annual = emp.annualLeaveEntitlement || 30;
      const carried = emp.carriedOverBalance || 0;
      totalAllotted += (annual + carried);
      totalCarriedOver += carried;

      const consumed = requests
        .filter(r => r.employeeId === emp.id && (r.status === 'Approved' || r.status === 'Completed') && (r.leaveType === LeaveTypeKuwait.ANNUAL || r.leaveType === LeaveTypeKuwait.UNPAID))
        .reduce((sum, r) => sum + r.numberOfDays, 0);
      totalConsumed += consumed;
    });

    const totalRemaining = Math.max(0, totalAllotted - totalConsumed);
    const avgRemaining = employeesList.length > 0 ? (totalRemaining / employeesList.length).toFixed(1) : '30.0';

    const pendingRequests = requests.filter(r => r.status === 'Pending' || r.status === 'UnderReview' || r.status === 'AwaitingEmployeeDocuments');

    return {
      activeLeavesCount: activeLeaves.length,
      activeLeavesList: activeLeaves,
      totalSickDays,
      sickCasesCount: sickRequests.length,
      totalRemaining,
      avgRemaining,
      totalCarriedOver,
      pendingCount: pendingRequests.length,
      totalEmployees: employeesList.length
    };
  }, [requests, employeesList]);

  // 2. Chart Data: Monthly Distribution
  const monthlyChartData = useMemo(() => {
    const months = isAr 
      ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const initialData = months.map(m => ({ 
      name: m, 
      annual: 0, 
      sick: 0,
      special: 0
    }));
    
    requests.forEach(r => {
      const date = new Date(r.startDate);
      const mIdx = date.getMonth();
      if (mIdx >= 0 && mIdx < 12 && (r.status === 'Approved' || r.status === 'Completed' || r.status === 'Pending')) {
        if (r.leaveType === LeaveTypeKuwait.ANNUAL) {
          initialData[mIdx].annual += r.numberOfDays;
        } else if (r.leaveType === LeaveTypeKuwait.SICK) {
          initialData[mIdx].sick += r.numberOfDays;
        } else {
          initialData[mIdx].special += r.numberOfDays;
        }
      }
    });
    
    return initialData.map(d => ({
      name: d.name,
      [isAr ? 'سنوية' : 'Annual']: d.annual,
      [isAr ? 'مرضية' : 'Sick']: d.sick,
      [isAr ? 'مناسبات وقانونية' : 'Special & Legal']: d.special
    }));
  }, [requests, isAr]);

  // 3. Types Distribution
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach(r => {
      if (r.status === 'Approved' || r.status === 'Completed') {
        counts[r.leaveType] = (counts[r.leaveType] || 0) + r.numberOfDays;
      }
    });

    const colors: Record<string, string> = {
      [LeaveTypeKuwait.ANNUAL]: '#00796B',
      [LeaveTypeKuwait.SICK]: '#EF4444',
      [LeaveTypeKuwait.HAJJ]: '#8B5CF6',
      [LeaveTypeKuwait.MATERNITY]: '#EC4899',
      [LeaveTypeKuwait.IDDAH]: '#6366F1',
      [LeaveTypeKuwait.EMERGENCY]: '#F59E0B',
      [LeaveTypeKuwait.UNPAID]: '#64748B',
      [LeaveTypeKuwait.STUDY]: '#0EA5E9',
    };

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key],
      color: colors[key] || '#94A3B8'
    })).filter(item => item.value > 0);
  }, [requests]);

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Top 4 Live Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Active Leaves */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'إجمالي الإجازات القائمة' : 'Currently On Leave'}
            </span>
            <span className="p-2.5 rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400">
              <Umbrella className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-850 dark:text-white">
              {metrics.activeLeavesCount}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {isAr ? 'موظف اليوم' : 'staff active'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              {isAr ? 'نسبة الشغور اللحظي' : 'Vacancy rate'}:
            </span>
            <span className="font-bold text-teal-600 dark:text-teal-400">
              {metrics.totalEmployees > 0 ? ((metrics.activeLeavesCount / metrics.totalEmployees) * 100).toFixed(0) : 0}%
            </span>
          </div>
        </div>

        {/* Card 2: Sick Leaves */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'الإجازات المرضية (المادة 69)' : 'Sick Leaves (Art. 69)'}
            </span>
            <span className="p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
              <HeartPulse className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {metrics.totalSickDays}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {isAr ? 'يوماً مستهلكاً' : 'days consumed'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              {isAr ? 'الحالات المسجلة' : 'Recorded cases'}:
            </span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {metrics.sickCasesCount} {isAr ? 'حالات' : 'cases'}
            </span>
          </div>
        </div>

        {/* Card 3: Remaining Leave Balance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'متوسط الرصيد المتبقي' : 'Avg Remaining Balance'}
            </span>
            <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <Calculator className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {metrics.avgRemaining}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {isAr ? 'يوماً / موظف' : 'days / employee'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              {isAr ? 'إجمالي الرصيد للكادر' : 'Total fleet pool'}:
            </span>
            <span className="font-bold text-amber-600">
              {metrics.totalRemaining} {isAr ? 'يوم' : 'days'}
            </span>
          </div>
        </div>

        {/* Card 4: Rollover & Carried Over */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'الأرصدة المرحلة والتدوير' : 'Rollover & Carried Over'}
            </span>
            <span className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400">
              <RefreshCw className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
              {metrics.totalCarriedOver}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {isAr ? 'يوماً مرحلاً' : 'carried days'}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              {isAr ? 'طلبات قيد المراجعة' : 'Pending review'}:
            </span>
            <span className="font-bold text-rose-500">
              {metrics.pendingCount} {isAr ? 'طلبات' : 'requests'}
            </span>
          </div>
        </div>

      </div>

      {/* Kuwait Labor Law Statutory Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-teal-950 text-white p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shrink-0">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-base text-teal-300">
                  {isAr ? 'الامتثال لقانون العمل الكويتي رقم 6 لسنة 2010 (القطاع الأهلي)' : 'Kuwait Labor Law No. 6/2010 Compliance'}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold border border-teal-400/30">
                  {isAr ? 'نفاذ تشريعي معتمد' : 'Statutory'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                {isAr 
                  ? 'المادة 70: استحقاق 30 يوماً سنوياً بعد قضاء 9 أشهر خدمة دون احتساب العطل الرسمية والمرضية. المادة 69: تنظيم المرضية بشرائح الأجر (15 يوماً 100%، 10 أيام 75%، 10 أيام 50%، 10 أيام 25%، و15 يوماً 0%).' 
                  : 'Art. 70: 30 days paid annual leave after 9 months service. Art. 69: 5 sick leave tiers.'}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-teal-500/40 text-teal-200 hover:bg-teal-950/60 shrink-0 text-xs"
            onClick={() => onTabChange('balances')}
          >
            {isAr ? 'فتح حاسبة الأرصدة والبدلات' : 'Open Statutory Calculator'}
          </Button>
        </div>
      </div>

      {/* Visual Charts & Ongoing Leaves Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Trend Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-extrabold text-sm text-slate-850 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-600" />
                {isAr ? 'المخطط البياني السنوي لاستهلاك الإجازات' : 'Monthly Leave Consumption'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isAr ? 'توزيع أيام الإجازات السنوية والمرضية والخاصة على مدار السنة' : 'Annual, sick and special leaves distribution'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-slate-400">2026</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAnnual" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00796B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00796B" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorSick" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px', textAlign: 'right' }} 
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey={isAr ? 'سنوية' : 'Annual'} stroke="#00796B" strokeWidth={2} fillOpacity={1} fill="url(#colorAnnual)" />
                <Area type="monotone" dataKey={isAr ? 'مرضية' : 'Sick'} stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSick)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Types Breakdown Donut (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-extrabold text-sm text-slate-850 dark:text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-teal-600" />
              {isAr ? 'التوزيع النسبي حسب نوع الإجازة' : 'Leave Types Breakdown'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isAr ? 'إجمالي الأيام المعتمدة المنصرفة للموظفين' : 'Total approved days across categories'}
            </p>
          </div>

          <div className="h-52 w-full my-auto flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px', textAlign: 'right' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-xs text-slate-400 py-10">
                {isAr ? 'لا توجد بيانات مسجلة حالياً' : 'No data recorded'}
              </div>
            )}
          </div>

          {/* Custom Mini Legend */}
          <div className="grid grid-cols-2 gap-2 text-[10px] pt-3 border-t border-slate-100 dark:border-slate-800">
            {pieData.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="truncate font-medium text-slate-700 dark:text-slate-300">{item.name}:</span>
                <span className="font-bold text-slate-900 dark:text-white mr-auto">{item.value} {isAr ? 'ي' : 'd'}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Currently On Leave Staff Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <div>
            <h4 className="font-extrabold text-sm text-slate-850 dark:text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-600" />
              {isAr ? 'كشف الموظفين المجازين حالياً (مباشرة العمل القادمة)' : 'Personnel Currently On Leave'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isAr ? 'متابعة الكوادر المنقطعة وتعيين البديل المفوض لتفادي تعطل مصالح الموكلين' : 'Tracking staff absence and handover delegates'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="text-xs"
            onClick={() => onTabChange('requests')}
          >
            {isAr ? 'عرض كافة الطلبات' : 'View all requests'}
          </Button>
        </div>

        {metrics.activeLeavesList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold border-y border-slate-100 dark:border-slate-800">
                  <th className="p-3 text-right">{isAr ? 'الموظف المعني' : 'Employee'}</th>
                  <th className="p-3 text-right">{isAr ? 'نوع الإجازة' : 'Type'}</th>
                  <th className="p-3 text-center">{isAr ? 'الفترة' : 'Dates'}</th>
                  <th className="p-3 text-center">{isAr ? 'الأيام المتبقية' : 'Days Remaining'}</th>
                  <th className="p-3 text-right">{isAr ? 'الزميل البديل المفوض' : 'Handover Replacement'}</th>
                  <th className="p-3 text-center">{isAr ? 'الإجراء' : 'Action'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {metrics.activeLeavesList.map(req => {
                  const end = new Date(req.endDate).getTime();
                  const now = new Date().getTime();
                  const remainingDays = Math.max(0, Math.ceil((end - now) / 86400000));

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="p-3 font-bold text-slate-850 dark:text-white">
                        {req.employeeName}
                        <span className="block text-[10px] text-slate-400 font-normal">{req.jobTitle || 'محام'}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
                          {req.leaveType}
                        </span>
                      </td>
                      <td className="p-3 text-center font-mono text-[11px] text-slate-600 dark:text-slate-400">
                        {req.startDate} » {req.endDate}
                      </td>
                      <td className="p-3 text-center">
                        <span className="font-bold text-amber-600">
                          {remainingDays} {isAr ? 'يوماً للعودة' : 'days left'}
                        </span>
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 font-medium">
                        {req.substituteEmployeeName || (isAr ? 'لم يُعين بديل' : 'None')}
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-[11px] h-7 px-2"
                          onClick={() => onViewRequest(req)}
                        >
                          {isAr ? 'تفاصيل السند' : 'Dossier'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/20 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-teal-500 mx-auto mb-2 opacity-80" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {isAr ? 'كافة الكوادر القانونية والإدارية على رأس عملهم اليوم' : 'All staff are currently on active duty'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isAr ? 'لا توجد إجازات جارية مسجلة لليوم الحالي' : 'No active leaves recorded today'}
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

