import React from 'react';
import { Loan, LoanType, LoanStatus, Employee } from '../../types';
import { LoanStatusBadge } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import { 
  MagnifyingGlassIcon, EyeIcon, PencilIcon, TrashIcon, PrinterIcon, FolderIcon 
} from '../../constants';

interface LoanListTabProps {
  lang: 'ar' | 'en';
  loans: Loan[];
  employees: Employee[];
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  salaryRange: string;
  setSalaryRange: (val: string) => void;
  deductionWarningFilter: boolean;
  setDeductionWarningFilter: (val: boolean) => void;
  viewMode: 'table' | 'card';
  setViewMode: (val: 'table' | 'card') => void;
  onViewLoan: (id: string) => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (id: string) => void;
  onOpenPrintPreview: (loan: Loan) => void;
  onApproveLoan: (id: string, step: 'approve' | 'reject' | 'audit') => void;
}

export const LoanListTab: React.FC<LoanListTabProps> = ({
  lang,
  loans,
  employees,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterType,
  setFilterType,
  salaryRange,
  setSalaryRange,
  deductionWarningFilter,
  setDeductionWarningFilter,
  viewMode,
  setViewMode,
  onViewLoan,
  onEditLoan,
  onDeleteLoan,
  onOpenPrintPreview,
  onApproveLoan
}) => {
  const formatKWD = (num: number) => num.toFixed(3) + " د.ك";
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Perform filtering
  const filteredLoans = React.useMemo(() => {
    return loans.filter(l => {
      const matchSearch = l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (l.purpose && l.purpose.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchStatus = filterStatus ? l.status === filterStatus : true;
      const matchType = filterType ? l.loanType === filterType : true;

      const emp = employees.find(e => e.id === l.employeeId);
      const matchSalary = salaryRange === 'all' ? true :
                          salaryRange === 'high' ? (emp ? emp.basicSalary >= 1000 : false) :
                          salaryRange === 'low' ? (emp ? emp.basicSalary < 1000 : false) : true;
      
      let matchDeductionWarning = true;
      if (deductionWarningFilter && emp) {
        const ratio = (l.monthlyInstallment / emp.basicSalary) * 100;
        matchDeductionWarning = ratio > 10;
      }

      return matchSearch && matchStatus && matchType && matchSalary && matchDeductionWarning;
    });
  }, [loans, searchTerm, filterStatus, filterType, salaryRange, deductionWarningFilter, employees]);

  return (
    <div className="space-y-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* FILTER PANEL */}
      <div className="p-6 bg-slate-50/50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[2rem] space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-grow text-right">
            <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
            <input 
              className="w-full pr-10 pl-4 py-2 text-sm border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 dark:bg-slate-950 dark:text-white outline-none transition-all text-right"
              placeholder={lang === 'ar' ? 'البحث بالرمز، اسم المقترض، أو الغرض...' : 'Search by reference number, borrower, or reason...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full lg:w-48 text-right">
            <Select
              className="dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              value={filterStatus}
              options={[
                { value: '', label: lang === 'ar' ? 'كافة حالات السداد' : 'All Statuses' },
                { value: LoanStatus.ACTIVE, label: lang === 'ar' ? 'جاري الاستقطاع (نشط)' : LoanStatus.ACTIVE },
                { value: LoanStatus.PAID_IN_FULL, label: lang === 'ar' ? 'مسدد بالكامل' : LoanStatus.PAID_IN_FULL },
                { value: LoanStatus.PENDING_APPROVAL, label: lang === 'ar' ? 'بانتظار الاعتماد' : LoanStatus.PENDING_APPROVAL },
                { value: LoanStatus.UNDER_FINANCIAL_REVIEW, label: lang === 'ar' ? 'تحت التدقيق المالي' : LoanStatus.UNDER_FINANCIAL_REVIEW },
                { value: LoanStatus.DEFAULTED, label: lang === 'ar' ? 'متعثر عن السداد' : LoanStatus.DEFAULTED },
              ]}
              onChange={e => setFilterStatus(e.target.value)}
            />
          </div>
          <div className="w-full lg:w-48 text-right">
            <Select
              className="dark:bg-slate-950 dark:border-slate-800 dark:text-white"
              value={filterType}
              options={[
                { value: '', label: lang === 'ar' ? 'كافة التمويلات والسلف' : 'All Types' },
                { value: LoanType.PERSONAL, label: LoanType.PERSONAL },
                { value: LoanType.SALARY_ADVANCE, label: LoanType.SALARY_ADVANCE },
                { value: LoanType.HOUSING, label: LoanType.HOUSING },
                { value: LoanType.EMERGENCY, label: LoanType.EMERGENCY },
              ]}
              onChange={e => setFilterType(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-3 items-center">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{lang === 'ar' ? 'مرشحات خاصة:' : 'Special Filters:'}</span>
            
            <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-rose-700 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-3 py-1.5 rounded-lg select-none">
              <input 
                type="checkbox" 
                checked={deductionWarningFilter} 
                onChange={e => setDeductionWarningFilter(e.target.checked)}
                className="rounded border-rose-300 dark:border-rose-900 text-rose-600 focus:ring-rose-500"
              />
              <span>{lang === 'ar' ? 'أقساط تتخطى 10% من الراتب العادي' : 'Amounts over 10% wage cap'}</span>
            </label>

            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-350">
              <span className="text-xs text-slate-400 font-bold">{lang === 'ar' ? 'فئات رواتب المقترضين:' : 'Salary bracket:'}</span>
              <button 
                onClick={() => setSalaryRange('all')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${salaryRange === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200/60 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
              >
                {lang === 'ar' ? 'الكل' : 'All'}
              </button>
              <button 
                onClick={() => setSalaryRange('high')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${salaryRange === 'high' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200/60 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
              >
                {lang === 'ar' ? 'فوق 1,000 د.ك' : '>= 1,000 KWD'}
              </button>
              <button 
                onClick={() => setSalaryRange('low')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${salaryRange === 'low' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-200/60 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'}`}
              >
                {lang === 'ar' ? 'تحت 1,000 د.ك' : '< 1,000 KWD'}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-black rounded-lg border transition-all ${viewMode === 'table' ? 'bg-slate-900 dark:bg-indigo-600 border-slate-900 dark:border-indigo-600 text-white' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
            >
              {lang === 'ar' ? 'عرض جدول المعاملات' : 'Table View'}
            </button>
            <button 
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 text-xs font-black rounded-lg border transition-all ${viewMode === 'card' ? 'bg-slate-900 dark:bg-indigo-600 border-slate-900 dark:border-indigo-600 text-white' : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850'}`}
            >
              {lang === 'ar' ? 'عرض بطاقات منفصلة' : 'Card View'}
            </button>
          </div>
        </div>
      </div>

      {/* APPROVAL DECISION DESK */}
      {loans.some(l => l.status === LoanStatus.PENDING_APPROVAL || l.status === LoanStatus.UNDER_FINANCIAL_REVIEW) && (
        <div className="p-5 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/70 dark:border-amber-900/40 rounded-[2rem] text-right space-y-4 animate-pulse">
          <h4 className="text-sm font-black text-amber-900 dark:text-amber-400">
            ⏳ {lang === 'ar' ? 'مكتب قرارات الاعتمادات والموافقات المالية القائمة' : 'Decision Desk: Pending Approvals & Audits'}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loans
              .filter(l => l.status === LoanStatus.PENDING_APPROVAL || l.status === LoanStatus.UNDER_FINANCIAL_REVIEW)
              .map(l => {
                const emp = employees.find(e => e.id === l.employeeId);
                const complianceRatio = emp ? ((l.monthlyInstallment / emp.basicSalary) * 100) : 0;
                const isOverCap = complianceRatio > 10;
                
                return (
                  <div key={l.id} className="p-4 bg-white dark:bg-slate-950 border border-amber-200 dark:border-slate-800 rounded-2xl space-y-3 relative overflow-hidden">
                    <span className="absolute top-2 left-2 text-[8px] px-1.5 py-0.5 font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 rounded">
                      {l.status}
                    </span>
                    <p className="font-extrabold text-xs text-slate-950 dark:text-white">{l.employeeName}</p>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold space-y-1">
                      <p>{lang === 'ar' ? 'نوع الطلب:' : 'Type:'} <span className="font-bold text-slate-800 dark:text-white">{l.loanType}</span></p>
                      <p>{lang === 'ar' ? 'القيمة المطلوبة:' : 'Requested principal:'} <span className="font-black text-indigo-600 dark:text-indigo-400">{formatKWD(l.loanAmount)}</span></p>
                      <p>{lang === 'ar' ? 'قسط شهري مقدر:' : 'Monthly repayment:'} <span className="font-bold text-slate-800 dark:text-slate-350">{formatKWD(l.monthlyInstallment)} ({l.numberOfInstallments} {lang === 'ar' ? 'أشهر' : 'mon'})</span></p>
                      <p className={`font-black ${isOverCap ? 'text-rose-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {lang === 'ar' ? 'نسبة الاستقطاع من الراتب الأساسي:' : 'Wage ratio deduction:'} {complianceRatio.toFixed(1)}%
                      </p>
                    </div>
                    {/* Actions buttons */}
                    <div className="flex gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-850 justify-end">
                      <button 
                        onClick={() => onApproveLoan(l.id, 'reject')}
                        className="px-2 py-1 text-[10px] font-bold bg-rose-50 dark:bg-rose-950/25 text-rose-700 dark:text-rose-300 rounded border border-rose-200 dark:border-rose-900/50 hover:bg-rose-100"
                      >
                        {lang === 'ar' ? 'رفض الطلب' : 'Reject'}
                      </button>
                      <button 
                        onClick={() => onApproveLoan(l.id, 'audit')}
                        className="px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-200"
                      >
                        {lang === 'ar' ? 'مراجعة ثانية' : 'Audit'}
                      </button>
                      <button 
                        onClick={() => onApproveLoan(l.id, 'approve')}
                        className="px-2.5 py-1 text-[10px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded border-none shadow-xs cursor-pointer"
                      >
                        {lang === 'ar' ? 'موافقة واعتماد التمويل' : 'Approve & Release'}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* RENDER ACTIVE FILES LIST */}
      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-right">
              <thead className="bg-slate-50 dark:bg-slate-950 text-xs font-black text-slate-500 dark:text-slate-400 uppercase">
                <tr>
                  <th className="px-6 py-4 text-right">{lang === 'ar' ? 'رمز السند' : 'Ref Code'}</th>
                  <th className="px-6 py-4 text-right">{lang === 'ar' ? 'اسم الموظف المقترض' : 'Employee Borrower'}</th>
                  <th className="px-6 py-4 text-right">{lang === 'ar' ? 'نوع المعاملة' : 'Credit Type'}</th>
                  <th className="px-6 py-4 text-right">{lang === 'ar' ? 'القيمة والمبلغ' : 'Principal'}</th>
                  <th className="px-6 py-4 text-right">{lang === 'ar' ? 'الضمان والوضع القضائي' : 'Surety & Legal Status'}</th>
                  <th className="px-6 py-4 text-right">{lang === 'ar' ? 'القسط الشهري' : 'Monthly Payment'}</th>
                  <th className="px-6 py-4 text-right">{lang === 'ar' ? 'الحالة المعيارية' : 'Status'}</th>
                  <th className="px-6 py-4 text-right">{lang === 'ar' ? 'الرصيد المتبقي قائم' : 'Unpaid Remaining'}</th>
                  <th className="px-6 py-4 text-center">{lang === 'ar' ? 'إجراءات وتحرير معتمد' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                {filteredLoans.map(loan => {
                  const emp = employees.find(e => e.id === loan.employeeId);
                  const isOverLimit = emp ? ((loan.monthlyInstallment / emp.basicSalary) * 100) > 10 : false;
                  
                  return (
                    <tr key={loan.id} className="hover:bg-indigo-50/15 dark:hover:bg-indigo-500/5 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-400 dark:text-slate-500">{loan.id}</td>
                      <td className="px-6 py-4">
                        <p className="font-black text-slate-900 dark:text-white text-sm">{loan.employeeName}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-450 mt-1">
                          {emp?.jobTitle} | {lang === 'ar' ? `راتبه بالمسيرة: ${emp?.basicSalary.toFixed(3)} د.ك` : `Basic salary: ${emp?.basicSalary.toFixed(3)} KWD`}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[10px] bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-extrabold px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/40">
                          {loan.loanType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-950 dark:text-white text-sm">
                        {formatKWD(loan.loanAmount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1 text-right text-[10px] font-semibold leading-normal">
                          {loan.guarantorName ? (
                            <p className="text-slate-700 dark:text-slate-300">
                              🤝 {lang === 'ar' ? `الكفيل: ${loan.guarantorName}` : `Guarantor: ${loan.guarantorName}`}
                            </p>
                          ) : (
                            <p className="text-rose-500 font-bold">⚠️ {lang === 'ar' ? 'بدون كفيل شخصي' : 'No personal guarantor'}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1 justify-end">
                            {loan.isPromissoryNoteSigned ? (
                              <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-[8px] font-black px-1.5 py-0.5 rounded">
                                {lang === 'ar' ? '⚖️ سند لأمر موقع' : '⚖️ Promissory Note Signed'}
                              </span>
                            ) : (
                              <span className="bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded">
                                {lang === 'ar' ? '⚠️ لا يوجد سند موقع' : '⚠️ No Signed Note'}
                              </span>
                            )}
                            {loan.courtExecutionNumber && (
                              <span className="bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-[8px] font-black px-1.5 py-0.5 rounded">
                                {lang === 'ar' ? `👨‍⚖️ قضية: ${loan.courtExecutionNumber}` : `👨‍⚖️ Case: ${loan.courtExecutionNumber}`}
                              </span>
                            )}
                          </div>
                          {loan.courtExecutionStatus && (
                            <p className="text-rose-600 dark:text-rose-400 text-[9px] font-bold">
                              🚨 {loan.courtExecutionStatus}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-black text-sm ${isOverLimit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {formatKWD(loan.monthlyInstallment)}
                        </p>
                        <span className={`text-[9px] font-bold ${isOverLimit ? 'text-rose-500' : 'text-slate-450'}`}>
                          {emp ? `${((loan.monthlyInstallment / emp.basicSalary) * 100).toFixed(1)}%` : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <LoanStatusBadge status={loan.status} />
                      </td>
                      <td className="px-6 py-4 font-black text-indigo-950 dark:text-indigo-300">
                        {formatKWD(loan.remainingBalance ?? loan.loanAmount)}
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap space-x-1 space-x-reverse">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onViewLoan(loan.id)}
                          title={lang === 'ar' ? "عرض خطة وجدولة الأقساط" : "View payment lists"}
                        >
                          <EyeIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onEditLoan(loan)}
                          title={lang === 'ar' ? "تحرير بيانات الطلب" : "Edit values"}
                        >
                          <PencilIcon className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => onOpenPrintPreview(loan)}
                          title={lang === 'ar' ? "طباعة الاتفاقيات والتعهدات القانونية" : "Print and sign"}
                        >
                          <PrinterIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-500 hover:text-red-700" 
                          onClick={() => onDeleteLoan(loan.id)}
                          title={lang === 'ar' ? "إلغاء وحذف كلي" : "Delete record"}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
                {filteredLoans.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-400 dark:text-slate-500 font-bold">
                      <FolderIcon className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                      {lang === 'ar' ? 'لا يوجد أي معاملات تطابق معايير التدقيق المفروضة حالياً.' : 'No active entries comply with current filters.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID LAYOUT */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLoans.map(loan => {
            const emp = employees.find(e => e.id === loan.employeeId);
            const progress = Math.min(100, Math.max(0, (((loan.totalPaidAmount || 0) / loan.loanAmount) * 100)));
            
            return (
              <div 
                key={loan.id} 
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-[2rem] shadow-xs hover:shadow-md transition-all relative overflow-hidden text-right flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold">#{loan.id}</span>
                    <LoanStatusBadge status={loan.status} />
                  </div>
                  <h4 className="text-md font-black text-slate-900 dark:text-white mb-1 leading-tight">{loan.employeeName}</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-450 font-bold mb-4">{emp?.jobTitle} | {emp?.department}</p>
                  
                  <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3 text-xs font-bold text-slate-600 dark:text-slate-350 leading-relaxed">
                    <div className="flex justify-between">
                      <span>{lang === 'ar' ? 'نوع التمويل والتبويب:' : 'Type:'}</span>
                      <span className="text-slate-800 dark:text-white font-bold">{loan.loanType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{lang === 'ar' ? 'قيمة السند الأساسي:' : 'Principal amount:'}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-black">{formatKWD(loan.loanAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{lang === 'ar' ? 'استقطاع القسط شهرياً:' : 'Monthly repayment:'}</span>
                      <span className="text-slate-800 dark:text-white font-bold">{formatKWD(loan.monthlyInstallment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{lang === 'ar' ? 'تاريخ أول قسط:' : 'First installment due:'}</span>
                      <span className="text-slate-400 dark:text-slate-400 font-bold">{formatDate(loan.repaymentStartDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400">
                    <span>{lang === 'ar' ? 'المسترد والمسدد:' : 'Recovered Sum:'} {parseFloat(progress.toFixed(1))}%</span>
                    <span>{formatKWD(loan.remainingBalance ?? loan.loanAmount)} {lang === 'ar' ? 'متبقي قائم' : 'outstanding'}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                  
                  <div className="flex justify-end gap-1.5 pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                    <Button size="sm" variant="ghost" onClick={() => onViewLoan(loan.id)}>
                      {lang === 'ar' ? 'عرض الفايل' : 'View File'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onOpenPrintPreview(loan)}>
                      {lang === 'ar' ? 'طباعة العقود المعتمدة' : 'Official Printing'}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
