import React, { useMemo } from 'react';
import { 
  Coins, CheckSquare, Clock, AlertTriangle, ShieldCheck, 
  TrendingUp, Users, Calendar, Info, BadgeInfo,
  ArrowUpRight, AlertCircle, Sparkles, Building2, UserX, FileText, CheckCircle2
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';
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
          text: `العامل ${c.employeeName}: رصدت المنظومة سلفاً وذمماً مالية معلقة بقيمة (${c.loansDeduction} د.ك) تتطلب تفعيل المقاصة وتصفية الفروق قبل الصرف المالي البنكي النهائي.`,
          action: 'مراجعة المديونيات وتسويات المقاصة'
        });
      }
      // 2. Check probation
      if (c.serviceYears === 0 && (c.serviceMonths || 0) < 3 && c.status !== 'Completed') {
        alerts.push({
          id: `alert-prob-${c.id}`,
          type: 'info',
          text: `الموظف ${c.employeeName}: لا تزال مدة خدمته العمالية أقل من مائة يوم (فترة التجربة). تخضع مخالفته لأحكام المادة 24 من قانون العمل الكويتي.`,
          action: 'مراجعة معايير الكفاءة وفترة التجربة'
        });
      }
      // 3. Pending approvals
      if (c.status === 'PendingReview' || c.status === 'UnderHRReview') {
        alerts.push({
          id: `alert-appr-${c.id}`,
          type: 'critical',
          text: `صك التسوية (${c.settlementNumber || c.id}) الخاص بـ ${c.employeeName} لا يزال بانتظار استيفاء التواقيع والربط بين شؤون الموظفين والشركاء القانونيين.`,
          action: `اعتماد الملف كـ ${activeRole === 'legal' ? 'مستشار قانوني مطبق' : 'مدقق بيرول معتمد'}`
        });
      }
    });

    if (alerts.length === 0) {
      alerts.push({
        id: 'no-alerts',
        type: 'info',
        text: 'كافة المعاملات وبراءات الذمم الحالية مطابقة للوائح والقانون وفي حالة استقرار مالي تام بدولة الكويت.',
        action: 'تحديث مؤشرات التوازن'
      });
    }

    return alerts;
  }, [savedCases, activeRole]);

  return (
    <div className="space-y-8 text-right" dir="rtl">
      
      {/* 1. BENTO-STYLE METRIC STATS COLLAGE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none font-sans">
        
        {/* Metric Card 1: Combined liabilities */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#00796B]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block tracking-tight">إجمالي ميزانية تصفية الخدمة</span>
                <span className="text-[9.5px] text-slate-400 font-semibold mt-0.5 block">التزامات براءات الذمم قيد الصرف</span>
              </div>
              <div className="p-2.5 bg-[#00796B]/5 text-[#00796B] rounded-2xl border border-[#00796B]/10">
                <Coins className="w-5 h-5 text-[#00796B]" />
              </div>
            </div>
            <div className="mt-5">
              <p className="text-2xl sm:text-3xl font-black text-[#00796B] font-mono leading-none">
                {stats.totalDuesOut.toLocaleString(undefined, { minimumFractionDigits: 3 })}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-black text-[#00796B]">دينار كويتي</span>
                <span className="text-[9.5px] text-slate-400 font-semibold">• ميزان الالتزام الفعلي الصادر</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Card 2: Fully done vs pending */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block tracking-tight">التسويات المنجزة والمسددة</span>
                <span className="text-[9.5px] text-slate-400 font-semibold mt-0.5 block">نسبة براءات الذمة المغلقة بالكامل</span>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>
            
            <div className="mt-5">
              <div className="flex justify-between items-baseline mb-2">
                <p className="text-2xl sm:text-3xl font-black text-slate-800 font-mono leading-none">
                  {stats.fullyDone} <span className="text-xs font-bold text-slate-400 font-sans">/ {stats.totalCount}</span>
                </p>
                <span className="text-xs font-extrabold text-emerald-600 font-mono">
                  {stats.totalCount ? Math.round((stats.fullyDone / stats.totalCount) * 100) : 0}%
                </span>
              </div>
              
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-l from-[#00796B] to-emerald-500 h-1.5 rounded-full transition-all duration-1000" 
                  style={{ width: `${stats.totalCount ? (stats.fullyDone / stats.totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Metric Card 3: Average Service duration */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#4DB6AC]/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
          <div className="relative z-10 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[11px] font-bold text-slate-400 block tracking-tight">متوسط سنوات الخدمة</span>
                <span className="text-[9.5px] text-slate-400 font-semibold mt-0.5 block">معدل العطاء وبقاء الكفاءات</span>
              </div>
              <div className="p-2.5 bg-[#4DB6AC]/5 text-[#4DB6AC] rounded-2xl border border-[#4DB6AC]/10">
                <Calendar className="w-5 h-5 text-[#00796B]" />
              </div>
            </div>
            <div className="mt-5">
              <p className="text-2xl sm:text-3xl font-black text-slate-800 font-mono leading-none">
                {stats.avgYears}
              </p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-black text-slate-700">سنوات الخدمة</span>
                <span className="text-[9.5px] text-slate-400 font-semibold">• لكل موظف مبرأ ذمته</span>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Card 4: Action card with beautiful modern layout */}
        <div className="bg-[#00796B] border border-[#004D40] rounded-3xl p-6 shadow-xs relative overflow-hidden text-white flex flex-col justify-between">
          <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <div>
            <div className="flex justify-between items-center select-none">
              <span className="text-[10px] font-black tracking-widest text-[#E0F2F1] uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#4DB6AC] animate-pulse" />
                <span>العمليات العمالية الفورية</span>
              </span>
            </div>
            <h4 className="text-xs font-black mt-1.5 text-white">معالج براءة ذمة جديد</h4>
            <p className="text-[9.5px] text-[#E0F2F1]/85 mt-1 leading-relaxed font-semibold">
              تصفية وحوسبة فورية لـ مكافأة نهاية الخدمة، مستحقات الإجازة، وخصم عُهد الأجهزة والعهود البنكية.
            </p>
          </div>
          <button 
            onClick={onAddNewCase}
            className="w-full mt-4 h-9 bg-white text-[#00796B] rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1 hover:bg-[#E0F2F1] transition-all border-none shadow-xs cursor-pointer focus:outline-none"
          >
            <span>+ إنشاء ملف وحسابه كقيد</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. SYMMETRICAL INTERACTIVE CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
        
        {/* Department financial volume - 7 Column view */}
        <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-black text-xs text-[#00796B] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#00796B]" />
                <span>تحليل الالتزامات المالية المتراكمة حسب الفروع والأقسام</span>
              </h4>
              <span className="text-[9.5px] font-bold text-slate-400">دينار كويتي (KWD)</span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">توزيع سيولة نهاية الخدمة المطلوبة لتغطية براءات الذمة لكل قطاع حالي</p>
          </div>
          
          <div className="h-56 mt-6 w-full font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={departmentChartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDepartment" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00796B" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#00796B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: '#64748b', fontWeight: 'bold' }} stroke="#e2e8f0" tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#e2e8f0" tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: '16px', background: '#0B1424', color: '#ffffff', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="value" stroke="#00796B" fillOpacity={1} fill="url(#colorDepartment)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ledger Credits vs Debits - 5 Column view */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="font-black text-xs text-[#00796B] flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-[#00796B]" />
                <span>ميزان التسوية (إجمالي مستحقات الكادر مقابل استقطاعات المؤسسة)</span>
              </h4>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">رصد وتفويض حصاد العامل الإجمالي مقابل تسويات الفقد والعهود والأقساط الشخصية</p>
          </div>

          <div className="h-56 mt-6 w-full font-mono">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialBars} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: '#64748b', fontWeight: 'bold' }} stroke="#e2e8f0" tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#e2e8f0" tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, borderRadius: '16px', background: '#0B1424', color: '#ffffff', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="المستحقات" fill="#00796B" radius={[6, 6, 0, 0]} />
                <Bar dataKey="الخصومات" fill="#ef4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 3. SYMMETRICAL COMPLIANCE & LEGAL ALERTS WATCH */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs font-sans">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 justify-start mb-4">
          <BadgeInfo className="w-5 h-5 text-[#00796B]" />
          <div>
            <h4 className="font-black text-xs sm:text-sm text-[#00796B]">لوحة رقابة الامتثال وإجراءات التوازن لقانون العمل الكويتي</h4>
            <span className="text-[9.5px] text-slate-400 font-semibold block mt-0.5">مذكرة فحص آلية لملفات البيرول والمغادرات النشطة للقطاعين الأهلي والنفطي</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto pr-1 no-scrollbar">
          {complianceAlerts.map((alert, idx) => {
            const isCritical = alert.type === 'critical';
            const isWarning = alert.type === 'warning';
            
            const cardBg = isCritical ? 'bg-red-500/5 border-red-200/50 text-red-900' :
                           isWarning ? 'bg-amber-500/5 border-amber-200/50 text-amber-900' :
                           'bg-emerald-500/5 border-emerald-200/50 text-emerald-900';
                           
            const iconColor = isCritical ? 'text-red-500' :
                              isWarning ? 'text-amber-500' :
                              'text-emerald-500';

            return (
              <div 
                key={alert.id || idx} 
                className={`p-4 rounded-2xl border ${cardBg} flex flex-col justify-between gap-3 text-right hover:border-slate-300 transition-all duration-300`}
              >
                <div className="flex gap-2.5 items-start text-xs font-sans">
                  <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
                  <p className="leading-relaxed font-bold tracking-tight">{alert.text}</p>
                </div>
                
                <div className="flex justify-between items-center border-t border-slate-100/30 pt-2.5 text-[9.5px] font-black">
                  <span className="opacity-80">التوصية ومسار المعالجة:</span>
                  <span className="underline cursor-pointer text-[#00796B] hover:text-[#004D40] transition-colors flex items-center gap-0.5">
                    <span>{alert.action}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
