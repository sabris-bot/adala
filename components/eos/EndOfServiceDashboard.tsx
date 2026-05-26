import React, { useMemo } from 'react';
import { 
  Coins, CheckSquare, Clock, AlertTriangle, ShieldCheck, 
  TrendingUp, Users, Calendar, Info, BadgeInfo
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { EOS_Settlement } from '../../types';

interface EndOfServiceDashboardProps {
  savedCases: EOS_Settlement[];
  onAddNewCase: () => void;
  activeRole: string;
}

export const EndOfServiceDashboard: React.FC<EndOfServiceDashboardProps> = ({
  savedCases,
  onAddNewCase,
  activeRole
}) => {
  // Statistics computations
  const stats = useMemo(() => {
    const totalDuesOut = savedCases.reduce((sum, c) => sum + (c.netPayable || 0), 0);
    const fullyDone = savedCases.filter(c => c.status === 'Completed' || c.status === 'Disbursed').length;
    const pendingCount = savedCases.length - fullyDone;
    const avgYears = savedCases.length 
      ? Number((savedCases.reduce((sum, c) => sum + (c.serviceYears || 0), 0) / savedCases.length).toFixed(1)) 
      : 0;

    return { totalDuesOut, fullyDone, pendingCount, totalCount: savedCases.length, avgYears };
  }, [savedCases]);

  // Chart data 1: Liability per department
  const departmentChartData = useMemo(() => {
    const records: Record<string, number> = {};
    savedCases.forEach(c => {
      const dept = c.department ? c.department.split(' ')[0] : 'إداري';
      records[dept] = (records[dept] || 0) + (c.netPayable || 0);
    });
    return Object.entries(records).map(([name, value]) => ({ 
      name, 
      value: Math.round(value) 
    }));
  }, [savedCases]);

  // Chart data 2: Accrued vs Deducted comparison
  const financialBars = useMemo(() => {
    return savedCases.map(c => {
      const basic = c.basicSalary || 0;
      const allow = c.allowances || 0;
      const additions = (c.indemnityAmount || 0) + (c.leaveBalanceAmount || 0) + (c.accruedSalaryAmount || 0) + (c.otherBonuses || 0);
      const deductions = (c.loansDeduction || 0) + (c.absenceDeduction || 0) + (c.disciplinaryDeductions || 0) + (c.socialInsuranceDeduction || 0);
      return {
        name: c.employeeName.split(' ')[0],
        'المستحقات': Math.round(additions),
        'الخصومات': Math.round(deductions),
      };
    });
  }, [savedCases]);

  // Compliance alerts list generator
  const complianceAlerts = useMemo(() => {
    const alerts: Array<{ id: string; type: 'warning' | 'info' | 'critical'; text: string; action: string }> = [];
    
    savedCases.forEach(c => {
      // 1. Check heavy loans
      if ((c.loansDeduction || 0) > 400 && c.status !== 'Completed') {
        alerts.push({
          id: `alert-loan-${c.id}`,
          type: 'warning',
          text: `الموظف ${c.employeeName}: هناك مديونية سلف معلقة بقيمة (${c.loansDeduction} د.ك) تتطلب مقاصة عاجلة قبل الصرف النهائي.`,
          action: 'مراجعة قسم الكوادر والمالية'
        });
      }
      // 2. Check probation
      if (c.serviceYears === 0 && (c.serviceMonths || 0) < 3 && c.status !== 'Completed') {
        alerts.push({
          id: `alert-prob-${c.id}`,
          type: 'info',
          text: `العامل ${c.employeeName}: في فترة التجربة القانونية (أقل من 100 يوم). إنهاء الخدمة يخضع لقواعد المادة 24 من قانون العمل الكويتي.`,
          action: 'تطبيق أحكام فترة التجربة'
        });
      }
      // 3. Pending approvals
      if (c.status === 'PendingReview' || c.status === 'UnderHRReview') {
        alerts.push({
          id: `alert-appr-${c.id}`,
          type: 'critical',
          text: `الملف ${c.settlementNumber || c.id} عمال عاجل: بانتظار استكمال التواقيع وتدقيق المعاملة للموظف ${c.employeeName}.`,
          action: `إجراء اعتماد كـ ${activeRole.toUpperCase()}`
        });
      }
    });

    if (alerts.length === 0) {
      alerts.push({
        id: 'no-alerts',
        type: 'info',
        text: 'كافة المعاملات في حالة توازن تام ولا توجد انحرافات تدقيقية أو عهد معلقة قانونياً بدولة الكويت حالياً.',
        action: 'تحديث مؤشرات التوازن'
      });
    }

    return alerts;
  }, [savedCases, activeRole]);

  return (
    <div className="space-y-6">
      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dm-card p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-400">إجمالي الالتزامات المالية القائمة</span>
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold mt-1 font-mono text-primary leading-tight">
            {stats.totalDuesOut.toLocaleString(undefined, { minimumFractionDigits: 3 })} <span className="text-xs font-sans font-bold text-gray-400">د.ك</span>
          </p>
          <span className="text-[9.5px] text-gray-400 dark:text-gray-500 block mt-2">مجموع مستحقات نهاية الخدمة والتصفيات</span>
        </div>

        <div className="bg-white dark:bg-dm-card p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-400">الصفقات المنتهية والمستندات المصروفة</span>
            <div className="p-1.5 rounded-lg bg-success/10 text-success">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold mt-1 font-mono text-success leading-tight">
            {stats.fullyDone} / {stats.totalCount} <span className="text-xs font-sans font-bold text-gray-400">سجل</span>
          </p>
          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-success h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${stats.totalCount ? (stats.fullyDone / stats.totalCount) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-dm-card p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-gray-400 dark:text-gray-400">متوسط سنوات الخدمة العمالية</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold mt-1 font-mono text-amber-500 leading-tight">
            {stats.avgYears} <span className="text-xs font-sans font-bold text-gray-400">سنة</span>
          </p>
          <span className="text-[9.5px] text-gray-400 dark:text-gray-500 block mt-2">مدة التراكم الفعلي لموظفي الوجيان</span>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-primary-light/5 dark:from-dm-card dark:to-dm-background p-4 rounded-2xl border border-primary/20 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-xs font-black text-primary dark:text-primary-light flex items-center gap-1">
              <TrendingUp className="w-4 h-4 animate-bounce" />
              <span>إجراء تصديق جديد</span>
            </span>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-1 leading-snug">
              تأسيس وتصفية مستند مخالصة قانوني متكامل يطابق أحكام الكويت.
            </p>
          </div>
          <button 
            onClick={onAddNewCase}
            className="mt-3 text-center w-full py-2 bg-primary hover:bg-primary-dark text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-primary/20 hover:scale-[1.02]"
          >
            + معالج احتساب تصفية جديد
          </button>
        </div>
      </div>

      {/* DOUBLE GRAPH PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Accrued vs Deductions */}
        <div className="bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="font-extrabold text-xs text-gray-800 dark:text-white uppercase flex items-center gap-1.5">
              <Coins className="text-primary w-4.5 h-4.5" />
              <span>ميزان التسوية الكلي (المستحقات مقابل الخصومات المترتبة بالدينار الكويتي)</span>
            </h4>
            <p className="text-[10px] text-gray-400 mt-1">رصد الموازنة المالية الفردية لكل موظف عمالي ملحق</p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialBars} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: '8px', direction: 'rtl' }} />
                <Bar dataKey="المستحقات" fill="#00796B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="الخصومات" fill="#F44336" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Liability per department */}
        <div className="bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h4 className="font-extrabold text-xs text-gray-800 dark:text-white uppercase flex items-center gap-1.5">
              <Users className="text-primary w-4.5 h-4.5" />
              <span>توزيع حجم المسؤولية المالية الحالية عمالياً حسب فروع الأقسام (د.ك)</span>
            </h4>
            <p className="text-[10px] text-gray-400 mt-1 font-semibold">تحليل المخصصات المتراكمة تحت التسوية</p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={departmentChartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00796B" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#00796B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: '8px' }} />
                <Area type="monotone" dataKey="value" stroke="#00796B" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* COMPLIANCE ALERT CONTROL CENTER */}
      <div className="bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm space-y-3">
        <h4 className="font-extrabold text-xs text-gray-800 dark:text-white uppercase flex items-center gap-1.5 border-b pb-2 border-gray-55 dark:border-gray-800/80">
          <BadgeInfo className="w-4.5 h-4.5 text-primary" />
          <span>مذكرة الرقابة الفورية والامتثال لقانون العمل الكويتي (Kuwait Law Watch)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
          {complianceAlerts.map(alert => {
            const bgClass = alert.type === 'critical' ? 'bg-danger/10 text-danger border-danger/20' :
                             alert.type === 'warning' ? 'bg-warning/10 text-warning border-warning/20 font-semibold' :
                             'bg-primary/10 text-primary border-primary/20';
            return (
              <div key={alert.id} className={`p-3 rounded-xl border ${bgClass} flex flex-col justify-between gap-2.5 transition-all text-right`}>
                <div className="flex gap-2 items-start text-[10.5px]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{alert.text}</p>
                </div>
                <div className="flex justify-between items-center border-t border-gray-200/40 dark:border-gray-800/20 pt-1.5 text-[9px] font-bold">
                  <span className="opacity-80">التوصية التدقيقية:</span>
                  <span className="underline cursor-pointer hover:opacity-100">{alert.action}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
