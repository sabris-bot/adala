import React, { useMemo } from 'react';
import Card from '../../components/ui/Card';
import { 
  CurrencyDollarIcon, ScaleIcon, ClockIcon, ChartBarIcon,
  ExclamationTriangleIcon, CheckCircleIcon, BanknotesIcon
} from '../../constants';
import { Loan, LoanStatus, Employee } from '../../types';
import { LoanStatusBadge } from '../../components/ui/Badge';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend, LineChart, Line, CartesianGrid, AreaChart, Area 
} from 'recharts';

interface LoanDashboardProps {
  lang: 'ar' | 'en';
  loans: Loan[];
  employees: Employee[];
  logs: any[];
  onOpenPrintPreview: (loan: Loan) => void;
  onViewLoan: (loanId: string) => void;
}

export const LoanDashboard: React.FC<LoanDashboardProps> = ({
  lang,
  loans,
  employees,
  logs,
  onOpenPrintPreview,
  onViewLoan
}) => {
  const isAr = lang === 'ar';
  const formatKWD = (num: number) => num.toFixed(3) + " د.ك";
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // 1. Comprehensive Financial Aggregations
  const stats = useMemo(() => {
    const totalDisbursed = loans.reduce((sum, l) => sum + (l.loanAmount || 0), 0);
    const totalPaid = loans.reduce((sum, l) => sum + (l.totalPaidAmount || 0), 0);
    const totalOutstanding = loans
      .filter(l => l.status === LoanStatus.ACTIVE || l.status === LoanStatus.DEFAULTED || l.status === LoanStatus.UNDER_FINANCIAL_REVIEW)
      .reduce((sum, l) => sum + (l.remainingBalance ?? l.loanAmount), 0);
    const totalDefaulted = loans
      .filter(l => l.status === LoanStatus.DEFAULTED)
      .reduce((sum, l) => sum + (l.remainingBalance ?? l.loanAmount), 0);
    
    const pendingAuditsCount = loans.filter(
      l => l.status === LoanStatus.PENDING_APPROVAL || l.status === LoanStatus.UNDER_FINANCIAL_REVIEW
    ).length;

    const totalSalaries = employees.reduce((sum, e) => sum + (e.basicSalary || 0), 0);
    const totalMonthlyInstallments = loans
      .filter(l => l.status === LoanStatus.ACTIVE)
      .reduce((sum, l) => sum + (l.monthlyInstallment || 0), 0);
    
    const overallDebtRatio = totalSalaries > 0 ? ((totalMonthlyInstallments / totalSalaries) * 100).toFixed(1) : '0.0';
    const recoveryRate = totalDisbursed > 0 ? ((totalPaid / totalDisbursed) * 100).toFixed(1) : '0.0';

    return {
      totalDisbursed,
      totalPaid,
      totalOutstanding,
      totalDefaulted,
      pendingAuditsCount,
      totalSalaries,
      totalMonthlyInstallments,
      overallDebtRatio,
      recoveryRate
    };
  }, [loans, employees]);

  // 2. Recharts Data: Disbursed vs Repaid vs Outstanding vs Defaulted by Loan Type
  const chartDataByType = useMemo(() => {
    const typesMap: { [key: string]: { name: string; disbursed: number; paid: number; outstanding: number; defaulted: number } } = {};
    
    loans.forEach(l => {
      const typeKey = l.loanType;
      if (!typesMap[typeKey]) {
        typesMap[typeKey] = {
          name: typeKey,
          disbursed: 0,
          paid: 0,
          outstanding: 0,
          defaulted: 0
        };
      }
      typesMap[typeKey].disbursed += l.loanAmount;
      typesMap[typeKey].paid += (l.totalPaidAmount || 0);
      if (l.status === LoanStatus.DEFAULTED) {
        typesMap[typeKey].defaulted += (l.remainingBalance ?? l.loanAmount);
      } else if (l.status !== LoanStatus.PAID_IN_FULL) {
        typesMap[typeKey].outstanding += (l.remainingBalance ?? l.loanAmount);
      }
    });

    return Object.values(typesMap);
  }, [loans]);

  // 3. Recharts Data: Loans vs Salaries and 10% Cap Comparison for Borrowers
  const borrowerSalaryCapData = useMemo(() => {
    return loans.slice(0, 6).map(l => {
      const emp = employees.find(e => e.id === l.employeeId);
      const salary = emp?.basicSalary || 1000;
      const statutoryCap10 = salary * 0.10;
      const installment = l.monthlyInstallment;
      return {
        name: l.employeeName.split(' ')[0] + ' (' + l.id.slice(-3) + ')',
        salary: salary,
        statutoryCap10: statutoryCap10,
        installment: installment,
        isOverCap: installment > statutoryCap10
      };
    });
  }, [loans, employees]);

  // 4. Recharts Data: Portfolio Status Composition (Pie)
  const portfolioStatusData = useMemo(() => {
    return [
      { name: isAr ? 'أرصدة مسددة بالكامل' : 'Paid in Full', value: stats.totalPaid, color: '#10B981' },
      { name: isAr ? 'أرصدة نشطة منتظمة' : 'Active Regular', value: Math.max(0, stats.totalOutstanding - stats.totalDefaulted), color: '#6366F1' },
      { name: isAr ? 'أرصدة متعثرة ومحالة للقضاء' : 'Defaulted / Delinquent', value: stats.totalDefaulted, color: '#EF4444' }
    ].filter(item => item.value > 0);
  }, [stats, isAr]);

  // 5. Defaulted Loans detailed list
  const defaultedLoans = useMemo(() => {
    return loans.filter(l => l.status === LoanStatus.DEFAULTED);
  }, [loans]);

  // 6. Guarantor Risk coverage analysis
  const guarantorRiskAnalysis = useMemo(() => {
    const activeLoans = loans.filter(l => l.status === LoanStatus.ACTIVE || l.status === LoanStatus.DEFAULTED);
    let fullySecuredSum = 0;
    let uncollateralizedSum = 0;
    let missingGuarantorCount = 0;

    activeLoans.forEach(l => {
      if (l.guarantorName && l.guarantorCivilId) {
        fullySecuredSum += l.remainingBalance ?? l.loanAmount;
      } else {
        uncollateralizedSum += l.remainingBalance ?? l.loanAmount;
        missingGuarantorCount++;
      }
    });

    const activeTotal = fullySecuredSum + uncollateralizedSum;
    const coveragePercent = activeTotal > 0 ? (fullySecuredSum / activeTotal) * 100 : 100;

    return {
      fullySecuredSum,
      uncollateralizedSum,
      missingGuarantorCount,
      coveragePercent: parseFloat(coveragePercent.toFixed(1))
    };
  }, [loans]);

  return (
    <div className="space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* 1. TOP STATS BOARD: 4 ESSENTIAL FINANCIAL METRICS IN 3-DECIMAL KWD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Disbursed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-[2rem] shadow-xs text-right space-y-3">
          <div className="flex justify-between items-center">
            <span className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
              <CurrencyDollarIcon className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 rounded-md">
              {isAr ? 'إجمالي الصرف' : 'Disbursed'}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400">
              {isAr ? 'إجمالي المبالغ المصروفة' : 'Total Disbursed Capital'}
            </p>
            <p className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1">
              {formatKWD(stats.totalDisbursed)}
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-[100%]"></div>
          </div>
          <p className="text-[10px] text-slate-500 font-bold">
            {isAr ? `عدد ${loans.length} تمويل وسلفة مقيدة بالسجلات` : `${loans.length} total loan records`}
          </p>
        </div>

        {/* Metric 2: Total Recovered */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-[2rem] shadow-xs text-right space-y-3">
          <div className="flex justify-between items-center">
            <span className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircleIcon className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 rounded-md">
              {isAr ? 'المسترد والمحصل' : 'Recovered'}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400">
              {isAr ? 'إجمالي المبالغ المسددة والمستردة' : 'Total Repaid Capital'}
            </p>
            <p className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {formatKWD(stats.totalPaid)}
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full" style={{ width: `${Math.min(100, parseFloat(stats.recoveryRate))}%` }}></div>
          </div>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
            {isAr ? `نسبة التحصيل: ${stats.recoveryRate}% من إجمالي المحفظة` : `Recovery Rate: ${stats.recoveryRate}%`}
          </p>
        </div>

        {/* Metric 3: Active Outstanding Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-[2rem] shadow-xs text-right space-y-3">
          <div className="flex justify-between items-center">
            <span className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <ScaleIcon className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-0.5 rounded-md">
              {isAr ? 'الذمم القائمة' : 'Outstanding'}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400">
              {isAr ? 'إجمالي الأرصدة القائمة (المتبقية)' : 'Outstanding Active Balances'}
            </p>
            <p className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1">
              {formatKWD(stats.totalOutstanding)}
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full w-[65%]"></div>
          </div>
          <p className="text-[10px] text-slate-500 font-bold">
            {isAr ? 'تستقطع دورياً من مسيرات الرواتب' : 'Monthly wage deductions'}
          </p>
        </div>

        {/* Metric 4: Total Defaulted Balances */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-[2rem] shadow-xs text-right space-y-3">
          <div className="flex justify-between items-center">
            <span className="p-2.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
              <ExclamationTriangleIcon className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2.5 py-0.5 rounded-md">
              {isAr ? 'المبالغ المتعثرة' : 'Defaulted'}
            </span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400">
              {isAr ? 'إجمالي المبالغ المتعثرة' : 'Total Defaulted Capital'}
            </p>
            <p className="text-xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
              {formatKWD(stats.totalDefaulted)}
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-600 h-full w-[35%]"></div>
          </div>
          <p className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
            {isAr ? `تنبيه: عدد ${defaultedLoans.length} قروض تحت الملاحقة والتنفيذ` : `${defaultedLoans.length} loans under legal recovery`}
          </p>
        </div>
      </div>

      {/* 2. RECHARTS INTERACTIVE CHARTS: DISBURSED VS REPAID VS OUTSTANDING VS DEFAULTED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Multi-Bar Chart: Financial Totals by Loan Type */}
        <Card 
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-[2rem] shadow-xs" 
          title={isAr ? 'تحليل المبالغ المصروفة، المسددة، القائمة، والمتعثرة حسب نوع التمويل (د.ك)' : 'Disbursed, Repaid, Outstanding & Defaulted by Loan Type (KWD)'}
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataByType} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${v}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px', textAlign: isAr ? 'right' : 'left' }}
                  formatter={(value: any, name: any) => {
                    const label = name === 'disbursed' ? (isAr ? 'المصروف' : 'Disbursed') :
                                  name === 'paid' ? (isAr ? 'المسدد' : 'Paid') :
                                  name === 'outstanding' ? (isAr ? 'القائم' : 'Outstanding') :
                                  (isAr ? 'المتعثر' : 'Defaulted');
                    return [`${parseFloat(value).toFixed(3)} د.ك`, label];
                  }} 
                />
                <Legend 
                  formatter={(value) => {
                    return value === 'disbursed' ? (isAr ? 'المبالغ المصروفة' : 'Disbursed') :
                           value === 'paid' ? (isAr ? 'المبالغ المسددة' : 'Repaid') :
                           value === 'outstanding' ? (isAr ? 'الأرصدة القائمة' : 'Outstanding') :
                           (isAr ? 'المبالغ المتعثرة' : 'Defaulted');
                  }}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Bar dataKey="disbursed" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="paid" fill="#10B981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="outstanding" fill="#6366F1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="defaulted" fill="#EF4444" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Donut Chart: Portfolio Share Breakdown */}
        <Card 
          className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-[2rem] shadow-xs" 
          title={isAr ? 'توزيع المحفظة الائتمانية والتعثر' : 'Credit Portfolio & Default Share'}
        >
          <div className="h-72 w-full flex flex-col justify-between items-center relative">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={portfolioStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px', textAlign: isAr ? 'right' : 'left' }}
                  formatter={(value: any) => [`${parseFloat(value).toFixed(3)} د.ك`, isAr ? 'المبلغ' : 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap gap-3 text-[10px] font-black justify-center pb-2">
              {portfolioStatusData.map((entry, idx) => (
                <span key={idx} className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  {entry.name}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* 3. RECHARTS: SALARY VS MONTHLY INSTALLMENTS VS 10% ARTICLE 20 CEILING */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Compliance Bar/Line Chart */}
        <Card 
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-[2rem] shadow-xs" 
          title={isAr ? 'مقارنة الأقساط الشهرية بسقف الاستقطاع القانوني (10% من الراتب الأساسي مادة 20)' : 'Monthly Installments vs 10% Statutory Salary Cap (Article 20)'}
        >
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={borrowerSalaryCapData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px', textAlign: isAr ? 'right' : 'left' }}
                  formatter={(value: any, name: any) => {
                    const label = name === 'salary' ? (isAr ? 'الراتب الأساسي' : 'Basic Salary') :
                                  name === 'statutoryCap10' ? (isAr ? 'سقف 10% القانوني' : '10% Legal Cap') :
                                  (isAr ? 'القسط الشهري الفعلي' : 'Actual Installment');
                    return [`${parseFloat(value).toFixed(3)} د.ك`, label];
                  }} 
                />
                <Legend 
                  formatter={(value) => {
                    return value === 'salary' ? (isAr ? 'الراتب الأساسي' : 'Basic Salary') :
                           value === 'statutoryCap10' ? (isAr ? 'الحد الأقصى المسموح (10%)' : '10% Cap Limit') :
                           (isAr ? 'القسط الشهري المطلوب' : 'Monthly Installment');
                  }}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
                <Bar dataKey="salary" fill="#94A3B8" radius={[4, 4, 0, 0]} opacity={0.4} />
                <Bar dataKey="statutoryCap10" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="installment" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Guarantor Risk & Coverage Gauge */}
        <Card 
          className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-[2rem] shadow-xs" 
          title={isAr ? 'مؤشر تغطية الكفالات الشخصية' : 'Guarantor Risk Coverage'}
        >
          <div className="space-y-4 text-right text-xs p-2">
            <div className="flex flex-col items-center justify-center p-3">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="56" cy="56" r="46" stroke="#f1f5f9" strokeWidth="8" fill="transparent" className="dark:stroke-slate-800" />
                  <circle cx="56" cy="56" r="46" stroke="#10b981" strokeWidth="8" fill="transparent" 
                          strokeDasharray={289}
                          strokeDashoffset={289 - (289 * guarantorRiskAnalysis.coveragePercent) / 100}
                          strokeLinecap="round" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-lg font-black font-mono text-slate-800 dark:text-white">{guarantorRiskAnalysis.coveragePercent}%</span>
                  <span className="text-[9px] text-slate-400 font-bold">{isAr ? 'تغطية الضمان' : 'Surety Ratio'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-slate-500">{isAr ? 'مغطاة بكفيل كويتي:' : 'Guaranteed:'}</span>
                <span className="font-mono text-emerald-600 font-black">{formatKWD(guarantorRiskAnalysis.fullySecuredSum)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-bold">
                <span className="text-slate-500">{isAr ? 'بدون كفيل شخصي:' : 'Unsecured:'}</span>
                <span className="font-mono text-rose-600 font-black">{formatKWD(guarantorRiskAnalysis.uncollateralizedSum)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. DEFAULTED LOANS & OVERDUE WARNINGS PANEL */}
      {defaultedLoans.length > 0 && (
        <Card 
          className="bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/40 rounded-[2rem]" 
          title={isAr ? 'سجل المديونيات المتعثرة وإجراءات التنفيذ القضائي العاجلة' : 'Defaulted Loans & Urgent Court Enforcement Registry'}
        >
          <div className="space-y-3">
            {defaultedLoans.map(l => (
              <div key={l.id} className="p-4 bg-rose-50/60 dark:bg-rose-950/20 border-r-4 border-rose-500 rounded-2xl space-y-2 text-right">
                <div className="flex justify-between items-center font-black text-rose-950 dark:text-rose-200 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span>🚨</span>
                    <span>{isAr ? 'تعثر رسمي - ملاحقة قضائية وتنفيذية' : 'Formal Default - Court Action'}</span>
                  </span>
                  <span className="font-mono bg-rose-100 dark:bg-rose-900/40 px-2.5 py-0.5 rounded text-rose-800 dark:text-rose-200">{l.id}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold text-rose-900 dark:text-rose-200">
                  <p><strong>{isAr ? 'المقترض:' : 'Debtor:'}</strong> {l.employeeName}</p>
                  <p><strong>{isAr ? 'المبلغ المتعثر:' : 'Defaulted Sum:'}</strong> <span className="font-mono font-black text-rose-600 dark:text-rose-400">{formatKWD(l.remainingBalance ?? l.loanAmount)}</span></p>
                  <p><strong>{isAr ? 'الكفيل الضامن:' : 'Guarantor:'}</strong> {l.guarantorName || 'لا يوجد'}</p>
                </div>
                {l.courtExecutionNumber && (
                  <p className="text-[11px] font-mono text-rose-750 dark:text-rose-300 bg-white/80 dark:bg-slate-900/80 p-2 rounded-lg border border-rose-200 dark:border-rose-900/40">
                    ⚖️ {isAr ? `ملف التنفيذ القضائي: ${l.courtExecutionNumber} | الحالة: ${l.courtExecutionStatus || 'حجز راتب ومنع سفر'}` : `Execution File: ${l.courtExecutionNumber}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

    </div>
  );
};
