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
  
  // Customizable parameters for flexibility
  const selectedEmp = employees.find(e => e.id === selectedEmpId);
  const [customSalary, setCustomSalary] = useState<string>('');
  const [serviceYearsOverride, setServiceYearsOverride] = useState<string>('');

  const formatKWD = (num: number) => num.toFixed(3) + " د.ك";

  // Real-time dynamic financial alignment calculations
  const calculateEOS = useMemo(() => {
    if (!selectedEmp) return null;

    const baseSalary = customSalary ? parseFloat(customSalary) : selectedEmp.basicSalary;
    
    // Parse service period
    let years = 0;
    if (serviceYearsOverride) {
      years = parseFloat(serviceYearsOverride) || 0;
    } else {
      const joinDate = new Date(selectedEmp.joiningDate || '2020-01-01');
      const today = new Date();
      const diffMs = today.getTime() - joinDate.getTime();
      years = parseFloat((diffMs / (1000 * 60 * 60 * 24 * 365.25)).toFixed(2));
    }

    // Kuwaiti Labor Law End of Service Indemnity formula (Standard private sector rules):
    // For workers paid monthly basis:
    // - 15 days of pay for each of the first five years
    // - 30 days of pay for each subsequent year
    // Note: Daily wage is calculated as (monthly / 26 days) in Kuwait Civil court practice!
    const dailyWage = baseSalary / 26;
    let gratuity = 0;

    if (years <= 5) {
      gratuity = years * 15 * dailyWage;
    } else {
      const firstPart = 5 * 15 * dailyWage;
      const secondPart = (years - 5) * 26 * dailyWage; // full month basic salary
      gratuity = firstPart + secondPart;
    }

    // Cap at 1.5 years of salary maximum under Kuwait law
    const maxIndemnityCap = baseSalary * 18;
    const finalGratuity = Math.min(gratuity, maxIndemnityCap);

    // Sum active/overdue debts for this employee
    const empLoans = loans.filter(
      l => l.employeeId === selectedEmp.id && l.status !== LoanStatus.PAID_IN_FULL
    );
    const outstandingDebt = empLoans.reduce((sum, l) => sum + (l.remainingBalance ?? l.loanAmount), 0);
    const primaryActiveLoanId = empLoans[0]?.id || '';

    const netPayable = Math.max(0, finalGratuity - outstandingDebt);

    return {
      baseSalary,
      years,
      gratuity,
      finalGratuity,
      outstandingDebt,
      netPayable,
      empLoans,
      primaryActiveLoanId
    };
  }, [selectedEmp, customSalary, serviceYearsOverride, loans]);

  // Sync state with selected employee
  React.useEffect(() => {
    if (selectedEmp) {
      setCustomSalary(selectedEmp.basicSalary.toString());
      setServiceYearsOverride('');
    }
  }, [selectedEmpId, selectedEmp]);

  const handleExecuteSettlement = () => {
    if (!selectedEmp || !calculateEOS) return;
    if (calculateEOS.outstandingDebt <= 0) {
      alert(lang === 'ar' ? 'الموظف ليس عليه أي مديونيات قائمة بالوقت الراهن' : 'Employee has no active debts.');
      return;
    }

    const confirmAction = window.confirm(
      lang === 'ar'
        ? `تأكيد قيد التسوية للموظف: [${selectedEmp.fullNameAr}] بموجب المادة 51 من القانون الكويتي؟\nسيتم استقطاع مبلغ ${formatKWD(calculateEOS.outstandingDebt)} كليا من مكافأة نهاية الخدمة البالغة ${formatKWD(calculateEOS.finalGratuity)} د.ك.`
        : `Confirm settlement for ${selectedEmp.fullNameAr} under Article 51?\nOutstanding debt of ${formatKWD(calculateEOS.outstandingDebt)} KWD will be deducted from gratuity of ${formatKWD(calculateEOS.finalGratuity)} KWD.`
    );

    if (confirmAction) {
      onCommitEOSDeduction(
        selectedEmp.id, 
        calculateEOS.outstandingDebt, 
        calculateEOS.finalGratuity, 
        calculateEOS.netPayable
      );
      
      // Auto-navigate to document editor
      onNavigateToDocument('temp-09', calculateEOS.primaryActiveLoanId);
    }
  };

  return (
    <div className="space-y-6 text-right font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Card className="bg-white" title={lang === 'ar' ? 'مستحقات مكافأة نهاية الخدمة وتسويات المادة 51' : 'EOS Gratuity Amortization Panel (Article 51 Compliance)'}>
        
        {/* UPPER DESCRIPTION */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-full shrink-0">
            ⚖️
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-bold">
            {lang === 'ar'
              ? 'تسمح المادة (51) و (20) من قانون العمل الكويتي رقم 6 لسنة 2010 للمخدم باقتطاع المبالغ المستحقة له وجبر الديون والقروض الممنوحة للموظفين مباشرة من مكافأة نهاية خدمتهم دون التقيد بسقف استقطاع الـ 10% الشهري للرواتب العادية، شريطة إبرام مخالصة تسوية مديونية نهائية.'
              : 'Article 51 and 20 of Kuwait Civil Labour Law regulates employer privileges to reclaim outstanding advances and debt fully from the final end-of-service gratuities, bypasssing the normal 10% basic wage cap, provided a mutual settlement agreement is formally signed.'}
          </p>
        </div>

        {/* SELECT EMPLOYEE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6">
          <div className="text-right">
            <label className="block text-xs font-black text-slate-700 mb-1.5">{lang === 'ar' ? 'اختر الموظف لحساب مستحقات نهاية الخدمة:' : 'Select employee'}</label>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="w-full border rounded-xl p-2.5 text-xs text-slate-700 bg-white font-bold face-out-line"
            >
              {employees.map(e => (
                <option key={e.id} value={e.id}>{e.fullNameAr} ({e.nationality})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">{lang === 'ar' ? 'الراتب المعتمد للحساب (د.ك):' : 'Calculation salary (KWD)'}</label>
            <input 
              type="number"
              value={customSalary}
              onChange={e => setCustomSalary(e.target.value)}
              className="w-full border rounded-xl p-2 text-xs font-black text-slate-800 text-right outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-700 mb-1.5">{lang === 'ar' ? 'تعديل سنوات الخدمة (تلقائي إن تُرِك فارغاً):' : 'Override years of service'}</label>
            <input 
              type="number"
              step="0.01"
              value={serviceYearsOverride}
              onChange={e => setServiceYearsOverride(e.target.value)}
              placeholder={lang === 'ar' ? 'مثال: 5.5' : 'e.g. 5.5'}
              className="w-full border rounded-xl p-2 text-xs font-black text-slate-800 text-right outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {selectedEmp && calculateEOS && (
          <div className="space-y-6 border-t pt-6">
            
            {/* CALCULATIVE DISPLAY ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Box 1: Gratuity Details */}
              <div className="p-5 border border-slate-200 bg-slate-50 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-slate-500 border-b pb-2">📋 {lang === 'ar' ? 'مكافأة الكفاءة ونهاية الخدمة المقدرة' : 'Gratuity Summary'}</h4>
                <div className="space-y-2 text-xs font-bold text-slate-600 leading-relaxed">
                  <p className="flex justify-between"><span>{lang === 'ar' ? 'تاريخ التعيين بالعمل:' : 'Hire date:'}</span><span>{selectedEmp.joiningDate}</span></p>
                  <p className="flex justify-between"><span>{lang === 'ar' ? 'مدة العمل الفعلية (سنوات):' : 'Service period (years):'}</span><span>{calculateEOS.years.toFixed(2)} {lang === 'ar' ? 'سنة' : 'yrs'}</span></p>
                  <p className="flex justify-between"><span>{lang === 'ar' ? 'قيمة الراتب المرجعي للحساب:' : 'Amortization salary basis:'}</span><span>{formatKWD(calculateEOS.baseSalary)}</span></p>
                  <p className="flex justify-between text-slate-900 border-t pt-2 font-black text-sm">
                    <span>{lang === 'ar' ? 'إجمالي مستحق العمل المقدر:' : 'Gross indemnity sum:'}</span>
                    <span className="text-emerald-700">{formatKWD(calculateEOS.finalGratuity)}</span>
                  </p>
                </div>
              </div>

              {/* Box 2: Outstanding loans ledger */}
              <div className="p-5 border border-slate-200 bg-slate-50 rounded-2xl space-y-4">
                <h4 className="text-xs font-black text-slate-500 border-b pb-2">💳 {lang === 'ar' ? 'المديونية والقروض المعلقة بالنظام' : 'Active Corporate Loans'}</h4>
                {calculateEOS.empLoans.length > 0 ? (
                  <div className="space-y-3">
                    {calculateEOS.empLoans.map(l => (
                      <div key={l.id} className="p-3 bg-white border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-extrabold text-slate-900">{l.loanType}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{l.id} | {lang === 'ar' ? 'معدل قسط:' : 'Repayment:'} {formatKWD(l.monthlyInstallment)}</p>
                        </div>
                        <p className="font-mono font-black text-rose-600">{formatKWD(l.remainingBalance ?? l.loanAmount)}</p>
                      </div>
                    ))}
                    <p className="flex justify-between text-slate-900 border-t pt-2 font-black text-sm">
                      <span>{lang === 'ar' ? 'إجمالي مطالبات الديون:' : 'Total due debts sum:'}</span>
                      <span className="text-rose-700">{formatKWD(calculateEOS.outstandingDebt)}</span>
                    </p>
                  </div>
                ) : (
                  <div className="py-10 text-center text-xs text-slate-400 italic font-bold">
                    💚 {lang === 'ar' ? 'لا توجد ديون أو قروض معلقة على الموظف حالياً' : 'No corporate debts registered on this profile.'}
                  </div>
                )}
              </div>

              {/* Box 3: Final Balance settlement */}
              <div className="p-5 border-2 border-indigo-100 bg-indigo-50/20 rounded-2xl space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black text-indigo-950 border-b pb-2">⚖️ {lang === 'ar' ? 'حسابات التسوية وصافي المصروف (الذمة)' : 'Net Settlement Amount'}</h4>
                  <div className="space-y-3 pt-2 text-xs font-bold text-slate-600 leading-relaxed">
                    <p className="flex justify-between"><span>{lang === 'ar' ? 'الاسترداد المقترح للمخدم مادة 51:' : 'Corporate recovery:'}</span><span className="text-rose-600 font-extrabold">-{formatKWD(calculateEOS.outstandingDebt)}</span></p>
                    <p className="flex justify-between text-slate-950 border-t pt-3 font-black text-md">
                      <span>{lang === 'ar' ? 'الصافي المصروف للموظف كـ مكافأة:' : 'Net hand-over gratuity payable:'}</span>
                      <span className="text-indigo-600 font-extrabold">{formatKWD(calculateEOS.netPayable)}</span>
                    </p>
                  </div>
                </div>

                {calculateEOS.outstandingDebt > 0 && (
                  <button 
                    onClick={handleExecuteSettlement}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-xs-md transition-all mt-4 hover:translate-y-[-1px]"
                  >
                    🚀 {lang === 'ar' ? 'إجراء قيد تصفية مديونية (مادة 51)' : 'Commit Debt Clear Settlement'}
                  </button>
                )}
              </div>

            </div>

            {/* DYNAMIC LAW GUIDES COVENANT BANNER */}
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between text-right leading-relaxed">
              <div className="space-y-0.5">
                <p className="text-xs font-black text-emerald-950">
                  📄 {lang === 'ar' ? 'مرفق ومستند تسوية براءة الذمة الجاهز للمطابقة' : 'Linked documents under Art 51 rules'}
                </p>
                <p className="text-[10px] text-emerald-700 font-semibold">
                  {lang === 'ar'
                    ? 'بعد إجراء التصفية، ننصح بطباعة "إقرار بالخصم من مكافأة نهاية الخدمة" مع تفاصيل الأرقام المرجعية لضمان التوثيق والحماية المالية للمكتب القانوني.'
                    : 'We suggest printing the binding salary deduction consent and debt structure memo templates to secure legal proof.'}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => {
                    if (calculateEOS.primaryActiveLoanId) {
                      onNavigateToDocument('temp-09', calculateEOS.primaryActiveLoanId);
                    } else {
                      alert(lang === 'ar' ? 'يرجى تحديد موظف لديه تمويل نشط أولاً' : 'Select borrower with active loan first.');
                    }
                  }}
                  className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-extrabold transition-all"
                >
                  📝 {lang === 'ar' ? 'إقرار الخصم الكويتي رقم 9' : 'Print EOS Deduct Consent'}
                </button>
                <button
                  onClick={() => {
                    if (calculateEOS.primaryActiveLoanId) {
                      onNavigateToDocument('temp-10', calculateEOS.primaryActiveLoanId);
                    } else {
                      alert(lang === 'ar' ? 'يرجى تحديد موظف لديه تمويل نشط أولاً' : 'Select borrower with active loan first.');
                    }
                  }}
                  className="px-3 py-1.5 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-900 rounded-lg text-xs font-extrabold transition-all"
                >
                  📄 {lang === 'ar' ? 'نموذج مخالصة تسوية رقم 10' : 'Print Debt Settlement Agreement'}
                </button>
              </div>
            </div>

          </div>
        )}
      </Card>
    </div>
  );
};
