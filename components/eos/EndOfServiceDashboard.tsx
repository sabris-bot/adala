import React, { useMemo, useState } from 'react';
import { 
  Coins, CheckSquare, Clock, AlertTriangle, ShieldCheck, 
  TrendingUp, Users, Calendar, Info, BadgeInfo,
  ArrowUpRight, AlertCircle, Sparkles, Building2, UserX, FileText, CheckCircle2, ChevronLeft, Award, HelpCircle, ArrowRight, CornerDownLeft, Loader2
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid, Legend } from 'recharts';
import { EOS_Settlement } from '../../types';

interface EndOfServiceDashboardProps {
  savedCases: EOS_Settlement[];
  onAddNewCase: () => void;
  activeRole: string;
}

export const EndOfServiceDashboard: React.FC<EndOfServiceDashboardProps> = ({
  savedCases = [],
  onAddNewCase,
  activeRole
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'total' | 'completed' | 'pending' | 'duration'>('total');
  const [hoveredAlertId, setHoveredAlertId] = useState<string | null>(null);

  // Advanced financial aggregations
  const stats = useMemo(() => {
    const totalDuesOut = savedCases.reduce((sum, c) => sum + (c.netPayable || 0), 0);
    const fullyDone = savedCases.filter(c => c.status === 'Completed' || c.status === 'Disbursed').length;
    const pendingCount = savedCases.filter(c => c.status !== 'Completed' && c.status !== 'Disbursed').length;
    const averageYears = savedCases.length 
      ? Number((savedCases.reduce((sum, c) => sum + (c.serviceYears || 0), 0) / savedCases.length).toFixed(1)) 
      : 0;

    const activeCasesList = savedCases.filter(c => c.status !== 'Completed');
    const totalLiabilities = savedCases.reduce((sum, c) => sum + (c.indemnityAmount || 0) + (c.leaveBalanceAmount || 0), 0);
    
    return { totalDuesOut, fullyDone, pendingCount, totalCount: savedCases.length, averageYears, activeCasesList, totalLiabilities };
  }, [savedCases]);

  // Chart: Liabilities allocated by Department (re-mapped elegantly)
  const deptPerformanceData = useMemo(() => {
    const records: Record<string, number> = {};
    savedCases.forEach(c => {
      const dept = c.department ? c.department.split(' ')[0] : 'إداري';
      records[dept] = (records[dept] || 0) + (c.netPayable || 0);
    });
    return Object?.entries(records).map(([name, value]) => ({ 
      name, 
      'المخصص المالي': Math.round(value) 
    }));
  }, [savedCases]);

  // Chart: Accruals vs Deductions for top items
  const creditDeductBars = useMemo(() => {
    return savedCases.slice(0, 5).map(c => {
      const positive = (c.indemnityAmount || 0) + (c.leaveBalanceAmount || 0) + (c.accruedSalaryAmount || 0) + (c.otherBonuses || 0);
      const negative = (c.loansDeduction || 0) + (c.absenceDeduction || 0) + (c.disciplinaryDeductions || 0) + (c.socialInsuranceDeduction || 0);
      return {
        name: c.employeeName.split(' ')[0],
        'المستحقات': Math.round(positive),
        'الخصومات': Math.round(negative),
      };
    });
  }, [savedCases]);

  // Legal Compliance & Smart Warning Systems
  const complianceAlerts = useMemo(() => {
    const alerts: Array<{ id: string; type: 'warning' | 'info' | 'critical'; text: string; action: string; article: string }> = [];
    
    savedCases.forEach(c => {
      if ((c.loansDeduction || 0) > 300 && c.status !== 'Completed') {
        alerts.push({
          id: `alert-loan-${c.id}`,
          type: 'warning',
          text: `العامل ${c.employeeName}: توجد ذمم معلقة بقيمة (${c.loansDeduction} د.ك) تتطلب موافقة المقاصة الائتمانية قبل إصدار مخالصة الحساب البنكي.`,
          action: 'موافقة المقاصة',
          article: 'المادة 51'
        });
      }
      if (c.serviceYears === 0 && (c.serviceMonths || 0) < 3 && c.status !== 'Completed') {
        alerts.push({
          id: `alert-prob-${c.id}`,
          type: 'info',
          text: `العامل ${c.employeeName}: مدة الخدمة أقل من 100 يوم. بموجب المادة (24)، لا تستحق مكافأة نهاية الخدمة، ولكن يتم تصفية رصيد الإجازات المتبقية.`,
          action: 'تطبيق المادة 24',
          article: 'المادة 24'
        });
      }
      if (c.status === 'PendingReview' || c.status === 'UnderFinancialReview') {
        alerts.push({
          id: `alert-appr-${c.id}`,
          type: 'critical',
          text: `الملف (${c.settlementNumber || c.id}) لـ ${c.employeeName} ينتظر التوقيع والاعتماد والتحقق النهائي وتصفية العهد المتبادلة.`,
          action: 'فتح المعاملة',
          article: 'التدقيق والاعتماد'
        });
      }
    });

    if (alerts.length === 0) {
      alerts.push({
        id: 'stable-state',
        type: 'info',
        text: 'كافة المعاملات المالية وبراءات الذمم الحالية مطابقة للوائح والقوانين وفي حالة استقرار مالي متوازن بموجب تفتيش الأجور بدولة الكويت.',
        action: 'تحديث الدفاتر',
        article: 'امتثال كلي'
      });
    }

    return alerts;
  }, [savedCases]);

  const statsCatalogInfo = [
    {
      id: 'total',
      title: 'إجمالي الالتزامات الكلية',
      subtitle: 'حجم مخصصات التصفية',
      value: `${stats.totalDuesOut.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك`,
      desc: 'يمثل كافة الالتزامات المالية الصادرة',
      icon: Coins,
      accent: 'border-[#B59458] text-[#B59458]'
    },
    {
      id: 'completed',
      title: 'براءات الذمة المغلقة',
      subtitle: 'الملفات المكتملة والمبرأة',
      value: `${stats.fullyDone} / ${stats.totalCount}`,
      desc: `${stats.totalCount ? Math.round((stats.fullyDone / stats.totalCount) * 100) : 0}% نسبة الاستيفاء الإجمالية`,
      icon: ShieldCheck,
      accent: 'border-emerald-500 text-emerald-600'
    },
    {
      id: 'pending',
      title: 'ملفات قيد المراجعة',
      subtitle: 'المعاملات النشطة المعلقة',
      value: `${stats.pendingCount} ملفات`,
      desc: 'بانتظار ائتمانات وصرف البنكي الموحد',
      icon: Clock,
      accent: 'border-amber-500 text-amber-500'
    },
    {
      id: 'duration',
      title: 'متوسط سنوات الخدمة',
      subtitle: 'معدل سنوات العطاء الكلي',
      value: `${stats.averageYears} سنوات`,
      desc: 'حجم الخدمة للعقود المنتهية',
      icon: Calendar,
      accent: 'border-[#0B332A] text-[#0B332A]'
    }
  ];

  return (
    <div className="space-y-8 text-right font-sans" dir="rtl">
      
      {/* 1. EXECUTIVE BENTO-GRID METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCatalogInfo.map((card) => {
          const IconComp = card.icon;
          const isSelected = selectedMetric === card.id;
          return (
            <div
              key={card.id}
              onClick={() => setSelectedMetric(card.id as any)}
              className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 cursor-pointer group ${
                isSelected 
                  ? 'bg-[#0B332A] text-white border-[#B59458] shadow-xl ring-2 ring-[#B59458]/30 -translate-y-1' 
                  : 'bg-white border-slate-150 text-slate-800 hover:border-[#B59458]/60 hover:shadow-md'
              }`}
            >
              <div className="absolute top-0 left-0 w-24 h-24 bg-[#B59458]/5 rounded-full -translate-x-1/3 -translate-y-1/3 group-hover:scale-125 transition-transform duration-500 pointer-events-none" />
              <div className="flex flex-col justify-between h-full relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`text-[10px] uppercase font-extrabold tracking-wider block ${isSelected ? 'text-[#D4AF37]' : 'text-slate-400'}`}>
                      {card.title}
                    </span>
                    <span className={`text-[9.5px] mt-0.5 block ${isSelected ? 'text-slate-350' : 'text-slate-400'}`}>
                      {card.subtitle}
                    </span>
                  </div>
                  <div className={`p-2.5 rounded-xl border ${isSelected ? 'bg-white/10 border-[#B59458]/40' : 'bg-[#FAF9F5] border-slate-200/60'}`}>
                    <IconComp className={`w-5 h-5 ${isSelected ? 'text-[#D4AF37]' : 'text-[#0B332A]/70'}`} />
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl sm:text-3.5xl font-black font-mono leading-none tracking-tight">
                    {card.value}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-3">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${isSelected ? 'bg-white/10 text-[#D4AF37] border-white/10' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {card.id === 'completed' ? 'تغطية قانونية' : 'امتثال كويتي'}
                    </span>
                    <span className={`text-[10px] font-medium block truncate ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                      {card.desc}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. DYNAMIC INFORMATIONAL STRATEGIC FEEDBACK */}
      <div className="bg-[#FAF9F5] border border-[#B59458]/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4 text-right">
          <div className="w-12 h-12 rounded-full bg-[#0B332A] text-[#D4AF37] flex items-center justify-center shrink-0 border border-[#B59458]/30">
            <Sparkles className="w-6 h-6 text-[#B59458]" />
          </div>
          <div>
            <h5 className="text-[11px] font-black uppercase text-slate-400">البيان الإستراتيجي للامتثال وقاعدة تفتيش الأجور</h5>
            <p className="text-slate-800 text-xs sm:text-sm font-semibold mt-1 leading-relaxed">
              {selectedMetric === 'total' && `إجمالي الالتزامات المالية المتراكمة المسجلة لإنهاء الخدمة تبلغ ${stats.totalDuesOut.toLocaleString()} د.ك، بمعدل مخصص مالي كلي يبلغ ${stats.totalLiabilities.toLocaleString()} د.ك مقتطع منها الغيابات والعهود.`}
              {selectedMetric === 'completed' && `تم إجماد وإكمال وتدوين عدد ${stats.fullyDone} مخالصة شاملة ومصدقة، وتقديم التقارير القانونية لنبذ الخصومات وبراءة الذمة من الشركاء.`}
              {selectedMetric === 'pending' && `يتواجد حالياً عدد ${stats.pendingCount} طلب تصفية نشط في مراحل التدقيق وإخلاء العهد التقنية والمالية وبانتظار التوافيع المباشرة.`}
              {selectedMetric === 'duration' && `معدل سنوات العطاء الكلي للموظفين المغادرين يبلغ ${stats.averageYears} سنة، مما يضع تقدير متوسط مكافأة نهاية الخدمة في مستواها الطبيعي للمادة 51.`}
            </p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col gap-3 font-bold shrink-0 text-center w-full md:w-auto">
          <div className="flex-1 bg-white border border-[#B59458]/20 px-4 py-2.5 rounded-xl text-[10.5px] text-[#0B332A] flex items-center justify-center gap-2 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span>سلامة الأداء المالي: <strong className="font-mono text-xs text-emerald-700">99.1%</strong></span>
          </div>
          <button
            onClick={onAddNewCase}
            className="flex-1 px-4 py-2 bg-[#B59458] hover:bg-[#D4AF37] text-[#0B332A] rounded-xl text-[10.5px] font-black transition-all border-none shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>تأسيس ملف تصفية</span>
            <ChevronLeft className="w-4 h-4 shrink-0 rotate-180" />
          </button>
        </div>
      </div>

      {/* 3. CHARTS CONTAINER WITH MODERN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart A: Department Liabilities Allocated (7 Columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-150 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex justify-between items-center text-right">
              <h4 className="font-black text-xs sm:text-base text-[#0B332A] font-serif flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#B59458]" />
                <span>فرز التزامات الصرف الكلية حسب القطاع والأقسام</span>
              </h4>
              <span className="text-[10px] font-black bg-slate-50 text-[#0B332A] px-2 py-0.5 rounded border border-slate-200 font-mono">د.ك KWD</span>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              تحليل إجمالي السيولة المخصصة لمكافآت وتصفية كاش الإجازات والرواتب المعلقة المستحقة بموجب القانون الكويتي رقم 6 لعام 2010 لكل فرع تشغيلي.
            </p>
          </div>

          <div className="h-64 mt-6 w-full font-mono">
            {deptPerformanceData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold text-xs">لا تتوفر حالياً بيانات لتوزيع القطاعات</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={deptPerformanceData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDeptGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B59458" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#B59458" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: '#64748b', fontWeight: 'extrabold' }} stroke="#e2e8f0" tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#e2e8f0" tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: '12px', background: '#0B332A', color: '#ffffff', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="المخصص المالي" stroke="#B59458" fillOpacity={1} fill="url(#colorDeptGold)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart B: Credits vs Debits analysis (5 Columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-150 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <h4 className="font-black text-xs sm:text-base text-[#0B332A] font-serif flex items-center gap-2 text-right">
              <Coins className="w-5 h-5 text-[#B59458]" />
              <span>ميزان الحساب (مستحقات العمال ومقاصة العهد)</span>
            </h4>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              عرض بياني تحليلي لأعلى 5 موظفين يقارن بين التعويض الإجمالي وبين السقف المالي لخصم العهد الشخصية أو المفقودات المقاصة.
            </p>
          </div>

          <div className="h-64 mt-6 w-full font-mono">
            {creditDeductBars.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold text-xs">لا يوجد موظفون مضافون لعرض المقارنة</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={creditDeductBars} margin={{ top: 10, right: 0, left: -25, bottom: 0 }} barSize={12}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: '#64748b', fontWeight: 'extrabold' }} stroke="#e2e8f0" tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#e2e8f0" tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 10, borderRadius: '12px', background: '#0B332A', color: '#ffffff', border: 'none' }} />
                  <Bar dataKey="المستحقات" fill="#0B332A" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="الخصومات" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 4. EXECUTIVE ACTIONS, LIVE CASES TIMELINE & ACTIVE ROADMAP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main interactive cases lists (Active & Pending Approval) (7 columns) */}
        <div className="lg:col-span-7 bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 select-none">
            <span className="inline-flex items-center gap-1 bg-[#0B332A]/5 text-[#0B332A] text-[9px] font-black px-2.5 py-1 rounded-full">
              <span>{stats.activeCasesList.length} حالات في الانتظار</span>
            </span>
            <h4 className="font-black text-xs sm:text-base text-[#0B332A] font-serif">سجل براءات الذمة ومسار الموافقات المباشرة</h4>
          </div>

          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
            {stats.activeCasesList.length === 0 ? (
              <div className="p-8 text-center bg-[#FAF9F5] border border-dashed border-slate-200 rounded-xl space-y-2 select-none">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h6 className="text-xs font-black text-[#0B332A]">كافة الملفات مكتملة ومغلقة تماماً</h6>
                <p className="text-[10px] text-slate-400 font-semibold">مكتب صبري شطا: لا توجد أية براءات معلقة حالياً بمسار الشركاء.</p>
              </div>
            ) : (
              stats.activeCasesList.map((c) => {
                const totalApprovalsDone = Object.values(c.approvals || {}).filter(v => v === 'مكتمل' || v === 'معتمد').length;
                const totalApprovalsNeeded = Object.values(c.approvals || {}).length;
                const progressPercentage = Math.round((totalApprovalsDone / totalApprovalsNeeded) * 100);

                return (
                  <div key={c.id} className="p-4 rounded-xl border border-slate-150 hover:border-[#B59458]/55 hover:shadow-xs transition-all text-right space-y-3 bg-white">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="font-mono text-[#B59458] font-black">{c.settlementNumber || c.id}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] text-slate-400">خطوات الاعتماد:</span>
                        <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md font-mono font-black text-slate-700">
                          {totalApprovalsDone} من {totalApprovalsNeeded}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h6 className="text-sm font-black text-slate-900 leading-none">{c.employeeName}</h6>
                        <span className="text-[10px] text-slate-400 block mt-1.5 font-bold">{c.jobTitle} • {c.department}</span>
                      </div>

                      <div className="text-left font-mono shrink-0">
                        <span className="block font-black text-sm text-[#0B332A]">{c.netPayable.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                        <span className="text-[8.5px] text-slate-400 block mt-0.5 font-bold">الصافي الإجمالي</span>
                      </div>
                    </div>

                    {/* Progress tracking line */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                        <span>قيد الفحص والمصادقة</span>
                        <span className="font-mono text-[#0B332A]">{progressPercentage}% مكتمل</span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#0B332A] h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Compact dynamic signature tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1 text-[8.5px] font-black select-none">
                      <span className={`px-2 py-0.5 rounded border ${c.approvals.hr === 'مكتمل' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-slate-50 text-slate-400 border-slate-150'}`}>الموارد البشرية</span>
                      <span className={`px-2 py-0.5 rounded border ${c.approvals.legal === 'معتمد' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-slate-50 text-slate-400 border-slate-150'}`}>المستشار القانوني</span>
                      <span className={`px-2 py-0.5 rounded border ${c.approvals.finance === 'مكتمل' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-slate-50 text-slate-400 border-slate-150'}`}>الرقابة المالية</span>
                      <span className={`px-2 py-0.5 rounded border ${c.approvals.gm === 'معتمد' ? 'bg-emerald-50 text-emerald-700 border-emerald-250' : 'bg-slate-50 text-slate-400 border-slate-150'}`}>المدير العام</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Legal Auditing and alerts dashboard column (5 columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-150 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between select-none">
            <span className="font-mono text-[9px] font-black bg-rose-500/10 text-rose-600 px-2.5 py-0.5 rounded border border-rose-200">صبري شطا AI</span>
            <h4 className="font-black text-xs sm:text-base text-[#0B332A] font-serif">مذكرة الرقابة والامتياز الدستوري</h4>
          </div>

          <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1 text-right">
            {complianceAlerts.map((alert, idx) => {
              const isCritical = alert.type === 'critical';
              const isWarning = alert.type === 'warning';
              
              const cardClass = isCritical 
                ? 'bg-rose-500/5 border-rose-200 text-rose-950 hover:bg-rose-500/10' 
                : isWarning 
                  ? 'bg-amber-500/5 border-amber-200 text-amber-940 hover:bg-amber-500/10' 
                  : 'bg-emerald-500/5 border-emerald-250 text-emerald-950 hover:bg-emerald-500/10';
                             
              const badgeClass = isCritical 
                ? 'bg-rose-100 text-rose-700 border-rose-300' 
                : isWarning 
                  ? 'bg-amber-100 text-amber-700 border-amber-300' 
                  : 'bg-emerald-100 text-emerald-700 border-emerald-300';

              return (
                <div 
                  key={alert.id || idx} 
                  onMouseEnter={() => setHoveredAlertId(alert.id)}
                  onMouseLeave={() => setHoveredAlertId(null)}
                  className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between gap-4 ${cardClass} ${
                    hoveredAlertId === alert.id ? 'shadow-2xs translate-x-[-2px]' : ''
                  }`}
                >
                  <div className="flex gap-3 items-start text-xs font-sans text-right">
                    <div className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase shrink-0 border mt-0.5 ${badgeClass}`}>
                      {alert.article}
                    </div>
                    <p className="leading-relaxed font-bold tracking-tight text-right flex-1">{alert.text}</p>
                  </div>
                  
                  <div className="flex justify-between items-center border-t border-slate-200/40 pt-2.5 text-[9.5px] font-black font-serif">
                    <span className="opacity-70 font-semibold font-sans">التوصية الدورية:</span>
                    <span className="underline cursor-pointer text-[#0B332A] hover:text-[#B59458] transition-colors flex items-center gap-0.5">
                      <span>{alert.action}</span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-[#B59458]" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
