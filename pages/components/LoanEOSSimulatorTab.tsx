import React, { useState, useMemo } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Loan, Employee, LoanStatus } from '../../types';

interface LoanEOSSimulatorTabProps {
  lang: 'ar' | 'en';
  employees: Employee[];
  loans: Loan[];
  onCommitEOSDeduction: (
    employeeId: string, 
    remainingBalance: number,
    finalGratuity: number,
    netPayable: number
  ) => void;
  onNavigateToDocument: (templateId: string, loanId: string) => void;
}

export const LoanEOSSimulatorTab: React.FC<LoanEOSSimulatorTabProps> = ({
  lang,
  employees,
  loans,
  onCommitEOSDeduction,
  onNavigateToDocument
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '');
  const selectedEmp = employees.find(e => e.id === selectedEmpId);
  
  // Customization parameters
  const [customSalary, setCustomSalary] = useState<string>('');
  const [serviceYearsOverride, setServiceYearsOverride] = useState<string>('');
  const [contractType, setContractType] = useState<'indefinite' | 'fixed'>('indefinite');
  const [terminationReason, setTerminationReason] = useState<'employer_termination' | 'resignation' | 'mutual_agreement' | 'contract_expiry'>('employer_termination');
  const [unusedLeaveDays, setUnusedLeaveDays] = useState<string>('0');
  const [unpaidSalaryDays, setUnpaidSalaryDays] = useState<string>('0');
  const [isAutoOffsetActive, setIsAutoOffsetActive] = useState<boolean>(true);

  const formatKWD = (num: number) => num.toFixed(3) + " د.ك";

  // Sync state when employee changes
  React.useEffect(() => {
    if (selectedEmp) {
      setCustomSalary(selectedEmp.basicSalary.toString());
      setServiceYearsOverride('');
      setUnusedLeaveDays('0');
      setUnpaidSalaryDays('0');
    }
  }, [selectedEmpId, selectedEmp]);

  // Real-time calculation compliant with Kuwait Labor Law No. 6/2010 (Article 51 & 53)
  const calculateEOS = useMemo(() => {
    if (!selectedEmp) return null;

    const baseSalary = customSalary ? (parseFloat(customSalary) || 0) : selectedEmp.basicSalary;
    
    // Calculate actual years of service
    let years = 0;
    if (serviceYearsOverride) {
      years = Math.max(0, parseFloat(serviceYearsOverride) || 0);
    } else {
      const joinDate = new Date(selectedEmp.joiningDate || '2020-01-01');
      const today = new Date();
      const diffMs = today.getTime() - joinDate.getTime();
      years = parseFloat((diffMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2));
    }

    // Kuwaiti Labor Law End of Service formula:
    // Daily wage divisor is strictly 26 days: dailyWage = basicSalary / 26
    const dailyWage = baseSalary / 26;
    
    // First 5 years: 15 days for each year
    // Subsequent years: 30 days (or 26 days full monthly wage) for each year
    let grossGratuity = 0;
    if (years <= 5) {
      grossGratuity = years * 15 * dailyWage;
    } else {
      const first5Years = 5 * 15 * dailyWage;
      const remainingYears = (years - 5) * 26 * dailyWage;
      grossGratuity = first5Years + remainingYears;
    }

    // Maximum cap: 1.5 years of wage (18 months basic salary) under Kuwait Labor Law
    const maxIndemnityCap = baseSalary * 18;
    let entitledGratuity = Math.min(grossGratuity, maxIndemnityCap);

    // Resignation deductions under Article 53 of Kuwait Labor Law (for indefinite contracts):
    // - Under 3 years: 0% (No indemnity)
    // - 3 to 5 years: 50% of indemnity
    // - 5 to 10 years: 66.67% (two-thirds) of indemnity
    // - 10+ years: 100% full indemnity
    let resignationRatio = 1.0;
    let resignationNote = '';
    if (terminationReason === 'resignation' && contractType === 'indefinite') {
      if (years < 3) {
        resignationRatio = 0;
        resignationNote = 'استقالة قبل إتمام 3 سنوات: لا يستحق العامل مكافأة نهاية خدمة (مادة 53).';
      } else if (years >= 3 && years < 5) {
        resignationRatio = 0.50;
        resignationNote = 'استقالة بين 3 و 5 سنوات: يستحق العامل نصف المكافأة (50% بموجب مادة 53).';
      } else if (years >= 5 && years < 10) {
        resignationRatio = 2 / 3;
        resignationNote = 'استقالة بين 5 و 10 سنوات: يستحق العامل ثلثي المكافأة (66.7% بموجب مادة 53).';
      } else {
        resignationRatio = 1.0;
        resignationNote = 'استقالة بعد 10 سنوات: يستحق العامل المكافأة كاملة (100% بموجب مادة 53).';
      }
    }

    const calculatedGratuity = entitledGratuity * resignationRatio;

    // Additional Entitlements: Unused leave and unpaid salary
    const leaveDaysNum = parseFloat(unusedLeaveDays) || 0;
    const leaveEncashment = leaveDaysNum * dailyWage;

    const unpaidDaysNum = parseFloat(unpaidSalaryDays) || 0;
    const unpaidSalaryEncashment = unpaidDaysNum * dailyWage;

    const totalGrossEntitlement = calculatedGratuity + leaveEncashment + unpaidSalaryEncashment;

    // Sum active, overdue, and pending corporate loans
    const empLoans = loans.filter(
      l => l.employeeId === selectedEmp.id && l.status !== LoanStatus.PAID_IN_FULL
    );
    const outstandingDebt = empLoans.reduce((sum, l) => sum + (l.remainingBalance ?? l.loanAmount), 0);
    const primaryActiveLoanId = empLoans[0]?.id || '';

    // Automatic Offset / Set-off logic (الجبر التلقائي للمديونية)
    const deductedDebt = isAutoOffsetActive ? Math.min(outstandingDebt, totalGrossEntitlement) : 0;
    const netPayableToEmployee = Math.max(0, totalGrossEntitlement - outstandingDebt);
    const remainingUncoveredDebt = Math.max(0, outstandingDebt - totalGrossEntitlement);

    return {
      baseSalary,
      dailyWage,
      years,
      grossGratuity,
      entitledGratuity,
      resignationRatio,
      resignationNote,
      calculatedGratuity,
      leaveEncashment,
      unpaidSalaryEncashment,
      totalGrossEntitlement,
      outstandingDebt,
      deductedDebt,
      netPayableToEmployee,
      remainingUncoveredDebt,
      empLoans,
      primaryActiveLoanId
    };
  }, [
    selectedEmp, 
    customSalary, 
    serviceYearsOverride, 
    contractType, 
    terminationReason, 
    unusedLeaveDays, 
    unpaidSalaryDays, 
    isAutoOffsetActive, 
    loans
  ]);

  // Execute Settlement
  const handleExecuteSettlement = () => {
    if (!selectedEmp || !calculateEOS) return;
    if (calculateEOS.outstandingDebt <= 0) {
      alert(lang === 'ar' ? 'الموظف ليس عليه أي مديونيات قائمة بالوقت الراهن.' : 'Employee has no active debts.');
      return;
    }

    const confirmAction = window.confirm(
      lang === 'ar'
        ? `تأكيد إجراء الجبر التلقائي والتسوية للموظف [${selectedEmp.fullNameAr}] بموجب المادة (51) من قانون العمل الكويتي رقم 6 لسنة 2010؟\n` +
          `• إجمالي مستحقات نهاية الخدمة: ${formatKWD(calculateEOS.totalGrossEntitlement)}\n` +
          `• إجمالي المديونيات المخصومة (الجبر التلقائي): ${formatKWD(calculateEOS.outstandingDebt)}\n` +
          `• صافي المستحق المصروف للموظف: ${formatKWD(calculateEOS.netPayableToEmployee)}`
        : `Confirm Article 51 Final Settlement for [${selectedEmp.fullNameAr}]?\n` +
          `• Gross Gratuity: ${formatKWD(calculateEOS.totalGrossEntitlement)}\n` +
          `• Deducted Debts: ${formatKWD(calculateEOS.outstandingDebt)}\n` +
          `• Net Payable: ${formatKWD(calculateEOS.netPayableToEmployee)}`
    );

    if (confirmAction) {
      onCommitEOSDeduction(
        selectedEmp.id, 
        calculateEOS.outstandingDebt, 
        calculateEOS.totalGrossEntitlement, 
        calculateEOS.netPayableToEmployee
      );
      
      // Auto-navigate to EOS document template
      onNavigateToDocument('temp-09', calculateEOS.primaryActiveLoanId);
    }
  };

  return (
    <div className="space-y-6 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Card 
        className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-[2rem] shadow-xs" 
        title={lang === 'ar' ? 'حاسبة مستحقات نهاية الخدمة والتسوية العمالية وفق القانون الكويتي (المادة 51) مع الجبر التلقائي للمديونيات' : 'Kuwait Labor Law End-of-Service Indemnity & Automatic Debt Offset Simulator (Art 51)'}
      >
        {/* TOP LEGAL CITATION BANNER */}
        <div className="p-4 bg-slate-50 dark:bg-[#153042] border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-xl shrink-0">
            ⚖️
          </div>
          <div className="space-y-1">
            <p className="text-xs font-black text-slate-800 dark:text-white">
              {lang === 'ar' ? 'أحكام المادتين (20) و (51) من قانون العمل الكويتي رقم 6 لسنة 2010:' : 'Articles 20 & 51 Kuwait Labor Law Regulation:'}
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
              {lang === 'ar'
                ? 'يجوز لصاحب العمل استقطاع كامل المديونيات والقروض والسلف الممنوحة للعامل من مكافأة نهاية خدمته وبدل الإجازات ومستحقاته المالية عند إنهاء الخدمة دون التقيد بسقف الـ 10%، وإجراء المقاصة والجبر المالي الشامل بموجب مخالصة معتمدة.'
                : 'Employers are authorized upon termination to fully set off and deduct all outstanding employee loans from the final indemnity gratuity and leave accruals without the 10% monthly wage ceiling limitation.'}
            </p>
          </div>
        </div>

        {/* CONTROLS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end mb-6">
          <div className="text-right">
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'ar' ? 'الموظف المعني بالتسوية:' : 'Select Employee:'}
            </label>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-white bg-white dark:bg-[#153042] font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.fullNameAr} ({e.nationality} - {e.jobTitle})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'ar' ? 'الراتب الأساسي المعتمد (د.ك):' : 'Basic Calculation Wage (KWD):'}
            </label>
            <input 
              type="number"
              step="0.001"
              value={customSalary}
              onChange={e => setCustomSalary(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-black text-slate-800 dark:text-white bg-white dark:bg-[#153042] text-right outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'ar' ? 'سنوات الخدمة (تلقائي إن تُرِك فارغاً):' : 'Service Years Override:'}
            </label>
            <input 
              type="number"
              step="0.01"
              value={serviceYearsOverride}
              onChange={e => setServiceYearsOverride(e.target.value)}
              placeholder={lang === 'ar' ? 'محسوب تلقائياً من تاريخ التعيين' : 'Calculated from hire date'}
              className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-black text-slate-800 dark:text-white bg-white dark:bg-[#153042] text-right outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1.5">
              {lang === 'ar' ? 'سبب انتهاء الخدمة (المادة 51 و 53):' : 'Termination Reason:'}
            </label>
            <select
              value={terminationReason}
              onChange={e => setTerminationReason(e.target.value as any)}
              className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs text-slate-700 dark:text-white bg-white dark:bg-[#153042] font-bold outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="employer_termination">{lang === 'ar' ? 'إنهاء الخدمة من صاحب العمل (مكافأة كاملة)' : 'Termination by Employer (100%)'}</option>
              <option value="resignation">{lang === 'ar' ? 'استقالة العامل (تطبيق نسب المادة 53)' : 'Resignation (Article 53 Rules)'}</option>
              <option value="mutual_agreement">{lang === 'ar' ? 'إنهاء العقد بالتراضي والاتفاق' : 'Mutual Agreement'}</option>
              <option value="contract_expiry">{lang === 'ar' ? 'انتهاء مدة العقد المحدد' : 'Fixed Contract Expiry'}</option>
            </select>
          </div>
        </div>

        {/* ADDITIONAL PARAMETERS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6 p-4 bg-slate-50/60 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-800 rounded-2xl">
          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'ar' ? 'رصيد الإجازات المتبقية (بالأيام):' : 'Unused Leave Balance (Days):'}
            </label>
            <input 
              type="number"
              value={unusedLeaveDays}
              onChange={e => setUnusedLeaveDays(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-bold text-slate-800 dark:text-white bg-white dark:bg-[#153042] text-right"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'ar' ? 'أيام الرواتب المتأخرة المستحقة (بالأيام):' : 'Unpaid Salary Accrual (Days):'}
            </label>
            <input 
              type="number"
              value={unpaidSalaryDays}
              onChange={e => setUnpaidSalaryDays(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2 text-xs font-bold text-slate-800 dark:text-white bg-white dark:bg-[#153042] text-right"
              placeholder="0"
            />
          </div>

          <div className="flex items-center justify-between p-2.5 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-xl">
            <div className="text-right">
              <span className="text-xs font-black text-indigo-950 dark:text-indigo-300 block">
                ⚡ {lang === 'ar' ? 'خاصية الجبر التلقائي للمديونية' : 'Auto Debt Set-Off'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                {lang === 'ar' ? 'خصم فوري مباشر من المستحقات' : 'Direct full offset against EOS'}
              </span>
            </div>
            <input 
              type="checkbox"
              checked={isAutoOffsetActive}
              onChange={e => setIsAutoOffsetActive(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {selectedEmp && calculateEOS && (
          <div className="space-y-6 border-t border-slate-200 dark:border-slate-800 pt-6">
            
            {/* CALCULATIVE DISPLAY ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Box 1: Gratuity Details */}
              <div className="p-5 border border-slate-200/70 dark:border-slate-800 bg-slate-50 dark:bg-[#153042] rounded-2xl space-y-3.5">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-850 pb-2 flex justify-between items-center">
                  <span>📋 {lang === 'ar' ? 'مستحقات مكافأة نهاية الخدمة' : 'EOS Gratuity Assessment'}</span>
                  <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold">قانون 6/2010</span>
                </h4>
                <div className="space-y-2 text-xs font-bold text-slate-600 dark:text-slate-350 leading-relaxed">
                  <p className="flex justify-between">
                    <span>{lang === 'ar' ? 'تاريخ التعيين:' : 'Hire Date:'}</span>
                    <span className="font-mono text-slate-800 dark:text-white">{selectedEmp.joiningDate}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>{lang === 'ar' ? 'مدة الخدمة الفعلية:' : 'Total Service Tenure:'}</span>
                    <span className="font-mono text-slate-800 dark:text-white">{calculateEOS.years.toFixed(2)} {lang === 'ar' ? 'سنوات' : 'yrs'}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>{lang === 'ar' ? 'الأجر اليومي (قسمة 26 يوماً):' : 'Daily Wage Basis (Div 26):'}</span>
                    <span className="font-mono text-slate-800 dark:text-white">{formatKWD(calculateEOS.dailyWage)}</span>
                  </p>
                  <p className="flex justify-between">
                    <span>{lang === 'ar' ? 'مكافأة نهاية الخدمة المقررة:' : 'Statutory Indemnity:'}</span>
                    <span className="font-mono text-slate-800 dark:text-white">{formatKWD(calculateEOS.calculatedGratuity)}</span>
                  </p>
                  {calculateEOS.leaveEncashment > 0 && (
                    <p className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>{lang === 'ar' ? 'بدل رصيد الإجازات المتبقية:' : 'Leave Encashment:'}</span>
                      <span className="font-mono">+{formatKWD(calculateEOS.leaveEncashment)}</span>
                    </p>
                  )}
                  {calculateEOS.unpaidSalaryEncashment > 0 && (
                    <p className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>{lang === 'ar' ? 'الأجور المتأخرة المستحقة:' : 'Unpaid Wages:'}</span>
                      <span className="font-mono">+{formatKWD(calculateEOS.unpaidSalaryEncashment)}</span>
                    </p>
                  )}
                  {calculateEOS.resignationNote && (
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 p-1.5 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                      ⚠️ {calculateEOS.resignationNote}
                    </p>
                  )}
                  <p className="flex justify-between text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2 font-black text-sm">
                    <span>{lang === 'ar' ? 'إجمالي الاستحقاق الإجمالي:' : 'Total Gross Entitlement:'}</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono">{formatKWD(calculateEOS.totalGrossEntitlement)}</span>
                  </p>
                </div>
              </div>

              {/* Box 2: Outstanding Loans & Debt Items */}
              <div className="p-5 border border-slate-200/70 dark:border-slate-800 bg-slate-50 dark:bg-[#153042] rounded-2xl space-y-3.5">
                <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-850 pb-2 flex justify-between items-center">
                  <span>💳 {lang === 'ar' ? 'المديونيات والقروض المعلقة' : 'Active Debts & Advances'}</span>
                  <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">{calculateEOS.empLoans.length} {lang === 'ar' ? 'ملفات' : 'files'}</span>
                </h4>
                {calculateEOS.empLoans.length > 0 ? (
                  <div className="space-y-2.5 max-h-48 overflow-y-auto">
                    {calculateEOS.empLoans.map(l => (
                      <div key={l.id} className="p-3 bg-white dark:bg-[#1E3C50] border border-slate-200/60 dark:border-slate-800 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-black text-slate-900 dark:text-white">{l.loanType}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{l.id} | قسط {formatKWD(l.monthlyInstallment)}</p>
                        </div>
                        <p className="font-mono font-black text-rose-600 dark:text-rose-400">{formatKWD(l.remainingBalance ?? l.loanAmount)}</p>
                      </div>
                    ))}
                    <p className="flex justify-between text-slate-900 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-2 font-black text-sm">
                      <span>{lang === 'ar' ? 'إجمالي المديونية المستحقة:' : 'Total Debt Liability:'}</span>
                      <span className="text-rose-600 dark:text-rose-400 font-mono">{formatKWD(calculateEOS.outstandingDebt)}</span>
                    </p>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400 dark:text-slate-500 italic font-bold">
                    💚 {lang === 'ar' ? 'لا توجد ديون أو سلف معلقة على الموظف حالياً' : 'No corporate debts registered on this employee.'}
                  </div>
                )}
              </div>

              {/* Box 3: Final Set-Off Settlement & Net Payout */}
              <div className="p-5 border-2 border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/15 rounded-2xl space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-300 border-b border-indigo-200 dark:border-indigo-900/40 pb-2 flex justify-between items-center">
                    <span>⚖️ {lang === 'ar' ? 'نتيجة الجبر التلقائي وصافي المستحق' : 'Net Settlement Outcome'}</span>
                    <span className="text-[10px] font-mono bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded">مادة 51</span>
                  </h4>
                  <div className="space-y-3 pt-2 text-xs font-bold text-slate-600 dark:text-slate-350 leading-relaxed">
                    <p className="flex justify-between">
                      <span>{lang === 'ar' ? 'إجمالي مستحقات نهاية الخدمة:' : 'Gross Gratuity:'}</span>
                      <span className="font-mono text-slate-900 dark:text-white">{formatKWD(calculateEOS.totalGrossEntitlement)}</span>
                    </p>
                    <p className="flex justify-between text-rose-600 dark:text-rose-400">
                      <span>{lang === 'ar' ? 'المديونية المخصومة (جبر تلقائي):' : 'Automatic Debt Set-Off:'}</span>
                      <span className="font-mono font-extrabold">-{formatKWD(calculateEOS.deductedDebt)}</span>
                    </p>
                    <p className="flex justify-between text-slate-950 dark:text-white border-t border-slate-200 dark:border-slate-800 pt-3 font-black text-sm">
                      <span>{lang === 'ar' ? 'الصافي المصروف للموظف (د.ك):' : 'Net Handover to Employee:'}</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-extrabold font-mono text-base">{formatKWD(calculateEOS.netPayableToEmployee)}</span>
                    </p>
                    {calculateEOS.remainingUncoveredDebt > 0 && (
                      <p className="text-[11px] text-rose-600 dark:text-rose-400 font-black p-2 bg-rose-50 dark:bg-rose-950/30 rounded-lg">
                        ⚠️ {lang === 'ar' ? `تنبيه: متبقٍ عجز مديونية بذمة الموظف قدره ${formatKWD(calculateEOS.remainingUncoveredDebt)} يستلزم سداداً نقدياً أو الرجوع على الكفيل.` : `Deficit of ${formatKWD(calculateEOS.remainingUncoveredDebt)} remains.`}
                      </p>
                    )}
                  </div>
                </div>

                {calculateEOS.outstandingDebt > 0 && (
                  <button 
                    onClick={handleExecuteSettlement}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md border-none cursor-pointer mt-4 transition-all"
                  >
                    🚀 {lang === 'ar' ? 'تأكيد التسوية وإجراء الجبر التلقائي (المادة 51)' : 'Execute Article 51 Automatic Set-Off'}
                  </button>
                )}
              </div>

            </div>

            {/* AUDIT CHECKLIST FOR PAM & KUWAIT LABOR DEPT */}
            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/15 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl text-right text-xs leading-relaxed space-y-2">
              <p className="font-black text-amber-900 dark:text-amber-400 flex items-center gap-1.5">
                <span>📌</span>
                <span>{lang === 'ar' ? 'إجراءات التوثيق الرسمية لمكتب صبري شطا لتفادي منازعات الهيئة العامة للقوى العاملة:' : 'Formal Documentation Checklist for Public Authority for Manpower (PAM):'}</span>
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-[11px] text-slate-600 dark:text-slate-350 mr-3 font-semibold">
                <li>{lang === 'ar' ? 'طباعة نموذج [اتفاقية استقطاع وتسوية من نهاية الخدمة - مادة 51] وتوقيعه ببصمة الإبهام من الموظف.' : 'Print Article 51 EOS Settlement Accord and secure employee thumbprint.'}</li>
                <li>{lang === 'ar' ? 'إرفاق صورة التحويل البنكي لصافي المبلغ المتبقي كإشعار تحويل نهائي.' : 'Attach bank wire transfer advice for net payout.'}</li>
                <li>{lang === 'ar' ? 'إصدار شهادة براءة الذمة النهائية وإلغاء السندات لأمر والكمبيالات المقابلة وإغلاق الملف المالي.' : 'Issue formal clearance certificate and discharge promissory instruments.'}</li>
              </ul>
            </div>

          </div>
        )}
      </Card>
    </div>
  );
};
