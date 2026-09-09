import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { Loan, InstallmentStatus, Installment, LoanStatus } from '../../types';
import { InstallmentStatusBadge, LoanStatusBadge } from '../../components/ui/Badge';

interface LoanPaymentTrackerTabProps {
  lang: 'ar' | 'en';
  loans: Loan[];
  onRecordPayment: (
    loanId: string, 
    installmentId: string, 
    paymentAmount: number, 
    paymentDate: string
  ) => void;
  onRestructureLoan: (
    loanId: string, 
    newMonths: number, 
    newAmount: number
  ) => void;
}

export const LoanPaymentTrackerTab: React.FC<LoanPaymentTrackerTabProps> = ({
  lang,
  loans,
  onRecordPayment,
  onRestructureLoan
}) => {
  const [selectedLoanId, setSelectedLoanId] = useState<string>(loans[0]?.id || '');
  const [selectedInstId, setSelectedInstId] = useState<string | null>(null);
  
  // Repayment form states
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  // Restructure form states
  const [isRestructuring, setIsRestructuring] = useState(false);
  const [restructureMonths, setRestructureMonths] = useState<number>(12);
  const [restructureInstallment, setRestructureInstallment] = useState<string>('');

  const formatKWD = (num: number) => num.toFixed(3) + " د.ك";
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const activeLoan = loans.find(l => l.id === selectedLoanId);

  const handleApplyPayment = () => {
    if (!activeLoan || !selectedInstId) return;
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert(lang === 'ar' ? 'يرجى إدخال مبلغ صحيح للسداد' : 'Enter a positive numeric amount.');
      return;
    }
    onRecordPayment(activeLoan.id, selectedInstId, amountNum, paymentDate);
    setSelectedInstId(null);
    setPaymentAmount('');
  };

  const handleApplyRestructure = () => {
    if (!activeLoan) return;
    const instNum = parseFloat(restructureInstallment);
    if (isNaN(instNum) || instNum <= 0) {
      alert(lang === 'ar' ? 'يرجى تحديد قسط شهري مقترح صحيح' : 'Please input a valid proposed monthly payment.');
      return;
    }
    onRestructureLoan(activeLoan.id, restructureMonths, instNum);
    setIsRestructuring(false);
    setRestructureInstallment('');
  };

  return (
    <div className="space-y-6 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <Card 
        className="bg-white dark:bg-[#1E3C50] border border-slate-200/70 dark:border-slate-800 rounded-[2rem] shadow-xs" 
        title={lang === 'ar' ? 'البوابة الموحدة لمطالبات الأقساط والتحصيل' : 'Consolidated Loan Repayments Interface'}
      >
        <div className="flex flex-col md:flex-row gap-4 items-end mb-6">
          <div className="flex-grow text-right w-full">
            <label className="block text-xs font-black text-slate-700 dark:text-slate-350 mb-1.5">
              {lang === 'ar' ? 'اختر معاملة أو قرض نشط للموظف لتتبع خطته:' : 'Select active employee financing file to track:'}
            </label>
            <Select
              className="dark:bg-[#153042] dark:border-slate-800 dark:text-white"
              value={selectedLoanId}
              onChange={e => {
                setSelectedLoanId(e.target.value);
                setSelectedInstId(null);
              }}
              options={loans.map(l => ({
                value: l.id,
                label: `${l.employeeName} (${l.id}) - ${l.loanType} - ${formatKWD(l.loanAmount)}`
              }))}
            />
          </div>
          {activeLoan && activeLoan.status !== LoanStatus.PAID_IN_FULL && (
            <Button 
              className="bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl h-10 w-full md:w-auto"
              variant="secondary" 
              onClick={() => {
                setIsRestructuring(!isRestructuring);
                setRestructureMonths(activeLoan.numberOfInstallments);
                setRestructureInstallment(activeLoan.monthlyInstallment.toString());
              }}
            >
              {lang === 'ar' ? 'إجراء تسوية وهيكلة الدين' : 'Debt Structure Restructure'}
            </Button>
          )}
        </div>

        {activeLoan ? (
          <div className="space-y-6">
            {/* Quick stats on the selected file */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-5 bg-slate-50 dark:bg-[#153042] border border-slate-200/60 dark:border-slate-800 rounded-[1.5rem] text-right">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-450 font-bold">{lang === 'ar' ? 'المبلغ الأصلي المصروف:' : 'Original borrowed principal:'}</p>
                <p className="font-mono font-black text-slate-800 dark:text-white text-md mt-1">{formatKWD(activeLoan.loanAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-450 font-bold">{lang === 'ar' ? 'إجمالي المحصل والمسترد حتى الآن:' : 'Total amount repaid to date:'}</p>
                <p className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-md mt-1">{formatKWD(activeLoan.totalPaidAmount || 0)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-450 font-bold">{lang === 'ar' ? 'الذمة المالية المتبقية قائمة:' : 'Outstanding net remaining balance:'}</p>
                <p className="font-mono font-black text-rose-600 dark:text-rose-400 text-md mt-1">{formatKWD(activeLoan.remainingBalance ?? activeLoan.loanAmount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-450 font-bold">{lang === 'ar' ? 'جدولة الأقساط وحالة السند:' : 'Amortization & file status:'}</p>
                <div className="mt-1.5 flex items-center gap-2 justify-end">
                  <LoanStatusBadge status={activeLoan.status} />
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">({activeLoan.numberOfInstallments} {lang === 'ar' ? 'أشهر' : 'mon'})</span>
                </div>
              </div>
            </div>

            {/* RESTURSTURING TOOLBOX */}
            {isRestructuring && (
              <div className="p-5 border border-indigo-150 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-2xl space-y-4 animate-fade-in-down">
                <h4 className="text-xs font-black text-indigo-950 dark:text-indigo-400">
                  ⚙️ {lang === 'ar' ? 'مذكرة تسوية مالية وإعادة جدولة المديونيات' : 'Debt Restructure Panel'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <Input
                    className="dark:bg-[#153042] dark:text-white"
                    label={lang === 'ar' ? 'تعديل فترة السداد المقترحة (بالأشهر)' : 'Proposed duration (months)'}
                    type="number"
                    value={restructureMonths}
                    onChange={e => setRestructureMonths(parseInt(e.target.value) || 1)}
                  />
                  <Input
                    className="dark:bg-[#153042] dark:text-white"
                    label={lang === 'ar' ? 'قيمة القسط الشهري الجديد المقترح (د.ك)' : 'Proposed installment amount (KWD)'}
                    type="number"
                    step="0.001"
                    value={restructureInstallment}
                    onChange={e => setRestructureInstallment(e.target.value)}
                  />
                  <div className="flex gap-2 w-full">
                    <Button className="w-full bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl" variant="primary" onClick={handleApplyRestructure}>
                      {lang === 'ar' ? 'حفظ الجدولة وتطبيق التسوية' : 'Commit Restructure'}
                    </Button>
                    <Button className="w-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border-none" variant="ghost" onClick={() => setIsRestructuring(false)}>
                      {lang === 'ar' ? 'تراجع' : 'Cancel'}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Repayment Table */}
            <div>
              <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 mb-3">{lang === 'ar' ? 'جدول الملاحقة التفصيلي واستحقاق الأقساط' : 'Individual Repayments & Amortization Schedule'}</h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-[#1E3C50]">
                <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800 text-right text-xs">
                  <thead className="bg-slate-50 dark:bg-[#153042] font-black text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3.5">{lang === 'ar' ? 'رقم القسط' : 'Inst #'}</th>
                      <th className="px-4 py-3.5">{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Repayment Due Date'}</th>
                      <th className="px-4 py-3.5">{lang === 'ar' ? 'القيمة المطلوبة' : 'Principal Due'}</th>
                      <th className="px-4 py-3.5">{lang === 'ar' ? 'حالة السداد' : 'Repayment Status'}</th>
                      <th className="px-4 py-3.5">{lang === 'ar' ? 'تاريخ السداد الفعلي' : 'Payment Timestamp'}</th>
                      <th className="px-4 py-3.5">{lang === 'ar' ? 'المبلغ المستلم' : 'Paid Amount'}</th>
                      <th className="px-4 py-3.5 text-center">{lang === 'ar' ? 'إجراءات التحصيل' : 'Audit Action'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    {activeLoan.installments?.map(inst => (
                      <tr key={inst.id} className={inst.status === InstallmentStatus.OVERDUE ? 'bg-rose-50/40 dark:bg-rose-950/15' : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'}>
                        <td className="px-4 py-3.5 font-mono">{inst.installmentNumber}</td>
                        <td className="px-4 py-3.5 font-mono">{formatDate(inst.dueDate)}</td>
                        <td className="px-4 py-3.5 text-slate-900 dark:text-white font-extrabold">{formatKWD(inst.amountDue)}</td>
                        <td className="px-4 py-3.5">
                          <InstallmentStatusBadge status={inst.status} />
                        </td>
                        <td className="px-4 py-3.5 font-mono text-slate-450 dark:text-slate-500">{inst.paymentDate ? formatDate(inst.paymentDate) : '-'}</td>
                        <td className="px-4 py-3.5 text-emerald-600 dark:text-emerald-400 font-mono">{inst.amountPaid ? formatKWD(inst.amountPaid) : '-'}</td>
                        <td className="px-4 py-3.5 text-center">
                          {inst.status !== InstallmentStatus.PAID ? (
                            <button
                              id={`inst-pay-${inst.id}`}
                              type="button"
                              onClick={() => {
                                setSelectedInstId(inst.id);
                                setPaymentAmount(inst.amountDue.toFixed(3));
                              }}
                              className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:underline font-black outline-none cursor-pointer border-none bg-transparent"
                            >
                              🔑 {lang === 'ar' ? 'تسجيل إيداع الدفعة' : 'Register Payment'}
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-500 dark:text-emerald-400 font-bold">✓ {lang === 'ar' ? 'قيد السداد مكتمل' : 'Cleared'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {(!activeLoan.installments || activeLoan.installments.length === 0) && (
                      <tr>
                        <td colSpan={7} className="text-center py-10 italic text-slate-400 dark:text-slate-500">
                          {lang === 'ar' ? 'لم يتم توليد أي دفعات أو أقساط لهذا القرض بعد.' : 'No active installments are currently generated.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Record Pop-up */}
            {selectedInstId && (
              <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200/60 dark:border-emerald-900/40 rounded-2xl space-y-4 animate-fade-in-right">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-400">
                    ✍️ {lang === 'ar' ? 'استمارة قيد دفعة سداد ومعالجة مالية للأقساط' : 'Record Deposit Form Details'}
                  </h4>
                  <button 
                    onClick={() => setSelectedInstId(null)}
                    className="text-emerald-750 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-white text-xs font-black border-none bg-transparent cursor-pointer"
                  >
                    ✕ {lang === 'ar' ? 'إلغاء وتراجع' : 'Close'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <Input
                    className="dark:bg-[#153042] dark:text-white"
                    label={lang === 'ar' ? 'تاريخ تسوية وتلقي الدفعة' : 'Transaction pay date'}
                    type="date"
                    value={paymentDate}
                    onChange={e => setPaymentDate(e.target.value)}
                  />
                  <Input
                    className="dark:bg-[#153042] dark:text-white"
                    label={lang === 'ar' ? 'المبلغ المستلم نقداً أو بالتحويل (د.ك)' : 'Allocated budget amount (KWD)'}
                    type="number"
                    step="0.001"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 cursor-pointer" 
                      variant="primary" 
                      onClick={handleApplyPayment}
                    >
                      {lang === 'ar' ? 'ترحيل الحركة وتأكيد السداد' : 'Settle Payment'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-10 text-center text-slate-400 dark:text-slate-500 italic">
            {lang === 'ar' ? 'لا توجد أي ملفات أو معاملات نشطة للبحث والتحصيل حالياً.' : 'No active transactions to track right now.'}
          </div>
        )}
      </Card>
    </div>
  );
};
