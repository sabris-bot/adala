import React, { useMemo } from 'react';
import Card from '../../components/ui/Card';
import { 
  CurrencyDollarIcon, ScaleIcon, ClockIcon, ChartBarIcon 
} from '../../constants';
import { Loan, LoanStatus, Employee } from '../../types';
import { LoanStatusBadge } from '../../components/ui/Badge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

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
  // Formatters
  const formatKWD = (num: number) => num.toFixed(3) + " د.ك";
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Recharts Data Parsing
  const graphDataByCategory = useMemo(() => {
    const typesMap: { [key: string]: number } = {};
    loans.forEach(l => {
      const typeLabel = l.loanType;
      typesMap[typeLabel] = (typesMap[typeLabel] || 0) + l.loanAmount;
    });
    return Object.keys(typesMap).map(key => ({
      name: key,
      value: typesMap[key]
    }));
  }, [loans]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  const stats = useMemo(() => {
    const totalOutflowCount = loans
      .filter(l => l.status === LoanStatus.ACTIVE || l.status === LoanStatus.DEFAULTED)
      .reduce((sum, l) => sum + (l.remainingBalance || l.loanAmount), 0);
    const paidSum = loans.reduce((sum, l) => sum + (l.totalPaidAmount || 0), 0);
    const pendingSum = loans.filter(
      l => l.status === LoanStatus.PENDING_APPROVAL || l.status === LoanStatus.UNDER_FINANCIAL_REVIEW
    ).length;
    const activeRate = ((loans.filter(l => l.status === LoanStatus.ACTIVE).length / (employees.length || 1)) * 100).toFixed(1);

    return {
      totalOutflow: totalOutflowCount,
      totalPaid: paidSum,
      pendingCount: pendingSum,
      activeRate: activeRate
    };
  }, [loans, employees]);

  const defaultedLoans = useMemo(() => {
    return loans.filter(l => l.status === LoanStatus.DEFAULTED);
  }, [loans]);

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow text-right">
          <p className="text-xs font-semibold text-slate-400 mb-1">
            {lang === 'ar' ? 'أرصدة التمويلات النشطة (القائمة)' : 'Active Debt Portfolio'}
          </p>
          <p className="text-2xl font-black text-slate-800">{formatKWD(stats.totalOutflow)}</p>
          <div className="mt-2 text-[10px] text-emerald-600 font-bold">
            ✔ {lang === 'ar' ? 'مغطاة بالكفالة القانونية' : 'Secured under corporate bindings'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow text-right">
          <p className="text-xs font-semibold text-slate-400 mb-1">
            {lang === 'ar' ? 'إجمالي الاسترداد المحصل' : 'Total Recovered Funds'}
          </p>
          <p className="text-2xl font-black text-emerald-600">{formatKWD(stats.totalPaid)}</p>
          <div className="mt-2 text-[10px] text-slate-500 font-bold">
            {lang === 'ar' ? 'نسبة التحصيل الإجمالية: 96.8%' : 'Recovery Rate: 96.8%'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow text-right">
          <p className="text-xs font-semibold text-slate-400 mb-1">
            {lang === 'ar' ? 'طلبات قيد المراجعة المالية' : 'Pending Financial Audits'}
          </p>
          <p className="text-2xl font-black text-amber-500">{stats.pendingCount}</p>
          <div className="mt-2 text-[10px] text-slate-500 font-bold">
            {lang === 'ar' ? 'تستلزم مراجعة الأجور والسياسات' : 'Requires administrative approval'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow text-right">
          <p className="text-xs font-semibold text-slate-400 mb-1">
            {lang === 'ar' ? 'معدل الاقتراض الداخلي للموظفين' : 'Active Borrowers Ratio'}
          </p>
          <p className="text-2xl font-black text-indigo-600">{stats.activeRate}%</p>
          <div className="mt-2 text-[10px] text-slate-500 font-bold">
            {lang === 'ar' ? 'من إجمالي مقدرات القوة العاملة' : 'Of total company manpower'}
          </div>
        </div>
      </div>

      {/* Recharts Graphics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white" title={lang === 'ar' ? 'توزيع أرصدة القروض حسب النوع والتبويب' : 'Portfolio Distribution by Loan Type'}>
          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={graphDataByCategory}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip formatter={(value: any) => [`${parseFloat(value).toFixed(3)} د.ك`]} />
                <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                  {graphDataByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="bg-white" title={lang === 'ar' ? 'تحليل حجم السلف المحصلة مقابل القائمة' : 'Volume Share Analysis (Paid vs Outstanding)'}>
          <div className="h-64 w-full flex flex-col justify-between items-center relative">
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie
                  data={[
                    { name: lang === 'ar' ? 'مبالغ مسددة' : 'Reclaimed (Paid)', value: stats.totalPaid },
                    { name: lang === 'ar' ? 'أرصدة متبقية مستحقة' : 'Outstanding Remaining', value: stats.totalOutflow }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#4f46e5" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 text-xs font-bold justify-center">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                {lang === 'ar' ? 'مبالغ مسددة' : 'Paid'}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
                {lang === 'ar' ? 'أرصدة قائمة' : 'Outstanding'}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Urgent Alerts and Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border-2 border-rose-100" title={lang === 'ar' ? 'بيان المخالفات والإنذارات والتعثر المالي العاجل' : 'Strict Overdue Warnings & Legal Alert Centre'}>
          <div className="space-y-3">
            {defaultedLoans.map(l => {
              const empObj = employees.find(e => e.id === l.employeeId);
              return (
                <div key={l.id} className="p-4 bg-rose-50 border-r-4 border-rose-500 rounded-xl space-y-2 text-right">
                  <div className="flex justify-between items-center font-black text-rose-950 text-xs">
                    <span>⚠️ {lang === 'ar' ? 'تعثر رسمي قائم عن سداد الأقساط' : 'Outstanding Delinquency'}</span>
                    <span className="font-mono">{l.id}</span>
                  </div>
                  <p className="text-xs text-rose-800 leading-relaxed font-bold">
                    {lang === 'ar' 
                      ? `تخلف الموظف [${l.employeeName}] براتب أساسي ${empObj?.basicSalary.toFixed(3)} د.ك عن سداد الأقساط الشهرية المستحقة للقرض البالغ قيمته الإجمالية ${l.loanAmount.toFixed(3)} د.ك.`
                      : `Employee [${l.employeeName}] with basic wage ${empObj?.basicSalary.toFixed(3)} KWD has failed first repayment installments on loan value of ${l.loanAmount.toFixed(3)} KWD.`}
                  </p>
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => onViewLoan(l.id)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-white border border-slate-300 rounded-md hover:bg-slate-100 text-slate-800"
                    >
                      {lang === 'ar' ? 'مراجعة خيارات السداد والجدولة' : 'Repayment Board'}
                    </button>
                    <button 
                      onClick={() => onOpenPrintPreview(l)}
                      className="px-2.5 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-700 rounded-md text-white"
                    >
                      {lang === 'ar' ? 'استخراج نموذج إنذار الكفيل بالسداد' : 'Print Guarantor Overdue Warning'}
                    </button>
                  </div>
                </div>
              );
            })}
            {defaultedLoans.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-10 italic">
                {lang === 'ar' ? 'لا يوجد أي تعثر مالي نشط أو أقساط متأخرة حالياً بالنظام.' : 'No active defaults or overdue installments on repayments.'}
              </p>
            )}
          </div>
        </Card>

        <Card className="bg-white" title={lang === 'ar' ? 'سجل العمليات والتدقيق الإداري والمالي الفوري' : 'Automated Auditing Timeline Log'}>
          <div className="space-y-4 max-h-[19rem] overflow-y-auto pr-1">
            {logs.map(log => (
              <div key={log.id} className="relative border-r-2 border-slate-100 pr-5 pb-3 text-right">
                <span className="absolute top-1 -right-[5px] w-2.5 h-2.5 bg-indigo-600 rounded-full ring-4 ring-white"></span>
                <p className="text-xs font-black text-slate-800 flex justify-between">
                  <span>{lang === 'ar' ? log.action : log.actionEn}</span>
                  <span className="text-[9px] text-slate-400 font-mono">{log.date}</span>
                </p>
                <p className="text-[10px] text-slate-500 font-bold mt-1">
                  {lang === 'ar' ? log.notes : log.notesEn}
                </p>
                <p className="text-[9px] text-slate-400 italic mt-0.5">
                  {lang === 'ar' ? `المشغل والموثق: ${log.user}` : `Certifier: ${log.user}`}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
