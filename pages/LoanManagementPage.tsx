
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { 
    CurrencyDollarIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    FolderIcon, InformationCircleIcon, CheckCircleIcon, XCircleIcon, 
    ClockIcon, BanknotesIcon, ChartBarIcon, PrinterIcon, CalculatorIcon,
    MagnifyingGlassIcon, UsersIcon, OFFICE_NAME
} from '../constants';

const StatsCard: React.FC<{ title: string; value: string; icon: React.ReactElement<any>; trend?: string; color: 'blue' | 'green' | 'orange' | 'purple' }> = ({ title, value, icon, trend, color }) => {
  const shadowColor = {
    blue: 'shadow-blue-100 ring-blue-50',
    green: 'shadow-green-100 ring-green-50',
    orange: 'shadow-orange-100 ring-orange-50',
    purple: 'shadow-purple-100 ring-purple-50'
  }[color];

  const iconColors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600'
  }[color];

  return (
    <div className={`bg-white p-5 rounded-2xl shadow-lg ring-1 mb-1 transition-all hover:scale-[1.02] ${shadowColor}`}>
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2.5 rounded-xl ${iconColors}`}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
        </div>
        {trend && <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{trend}</span>}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500 mb-1">{title}</h3>
        <p className="text-2xl font-black text-slate-900">{value}</p>
      </div>
    </div>
  );
};

const LoanCalculator: React.FC<{ employees: Employee[] }> = ({ employees }) => {
  const [calcData, setCalcData] = useState({
    employeeId: employees[0]?.id || '',
    amount: 1000,
    term: 12
  });

  const selectedEmp = employees.find(e => e.id === calcData.employeeId);
  const monthly = (calcData.amount / calcData.term);
  const deductionRatio = selectedEmp ? (monthly / selectedEmp.basicSalary) * 100 : 0;
  const isExceeding = deductionRatio > 10;

  return (
    <Card title="آلة حاسبة سريعة (المحاكاة المالية)" className="bg-slate-50/50 border-dashed">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <Select label="اختر الموظف" value={calcData.employeeId} options={employees.map(e => ({ value: e.id, label: e.fullNameAr }))} onChange={e => setCalcData({...calcData, employeeId: e.target.value})} />
        <Input label="مبلغ القرض المقترح" type="number" value={String(calcData.amount)} onChange={e => setCalcData({...calcData, amount: parseFloat(e.target.value) || 0})} />
        <Input label="مدة السداد (شهور)" type="number" value={String(calcData.term)} onChange={e => setCalcData({...calcData, term: parseInt(e.target.value) || 12})} />
        <div className="p-3 bg-white border rounded shadow-sm">
          <p className="text-[10px] text-gray-500 mb-1">القسط الشهري التقديري:</p>
          <p className={`text-lg font-bold ${isExceeding ? 'text-red-600' : 'text-blue-700'}`}>{monthly.toFixed(3)} د.ك</p>
          {selectedEmp && (
            <p className={`text-[9px] mt-1 font-bold ${isExceeding ? 'text-red-500' : 'text-green-600'}`}>
              ({deductionRatio.toFixed(1)}% من الراتب) {isExceeding && '⚠️ تجاوز الحد'}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};
import { Loan, Employee, LoanType, LoanStatus, Installment, InstallmentStatus, RequestAttachment } from '../types';
import { loanTypeOptions, loanStatusOptions, installmentStatusOptions } from '../constants';
import { LoanStatusBadge, InstallmentStatusBadge } from '../components/ui/Badge';
import { initialEmployees } from './EmployeeProfilePage'; // Integration

export const initialLoans: Loan[] = [
  {
    id: 'loan1',
    employeeId: initialEmployees[0]?.id || 'emp-001',
    employeeName: initialEmployees[0]?.fullNameAr || 'أحمد محمود مبارك',
    loanType: LoanType.PERSONAL,
    loanAmount: 5000,
    purpose: 'مصاريف شخصية طارئة - ترميم منزل',
    requestDate: '2023-10-15',
    approvalDate: '2023-10-18',
    disbursementDate: '2023-10-20',
    repaymentStartDate: '2023-11-01',
    numberOfInstallments: 12,
    monthlyInstallment: 416.667,
    status: LoanStatus.ACTIVE,
    installments: Array.from({ length: 12 }, (_, i) => ({
      id: `inst1-${i+1}`,
      installmentNumber: i + 1,
      dueDate: new Date(2023, 10 + i, 1).toISOString().split('T')[0],
      amountDue: 416.667,
      status: i < 8 ? InstallmentStatus.PAID : (i === 8 ? InstallmentStatus.PENDING : InstallmentStatus.UPCOMING),
      amountPaid: i < 8 ? 416.667 : undefined,
      paymentDate: i < 8 ? new Date(2023, 10 + i, 1).toISOString().split('T')[0] : undefined,
    })),
    totalPaidAmount: 416.667 * 8,
    remainingBalance: 5000 - (416.667 * 8),
    createdAt: '2023-10-15',
    notes: "القرض الأول للموظف، ملتزم بالسداد."
  },
  {
    id: 'loan2',
    employeeId: initialEmployees[1]?.id || 'emp-002',
    employeeName: initialEmployees[1]?.fullNameAr || 'فاطمة علي حسين',
    loanType: LoanType.SALARY_ADVANCE,
    loanAmount: 500,
    purpose: 'لتغطية مصاريف عاجلة',
    requestDate: '2024-06-01',
    approvalDate: '2024-06-01',
    disbursementDate: '2024-06-02',
    repaymentStartDate: '2024-07-01',
    numberOfInstallments: 2,
    monthlyInstallment: 250,
    status: LoanStatus.PAID_IN_FULL,
    installments: [
        { id: 'inst2-1', installmentNumber: 1, dueDate: '2024-07-01', amountDue: 250, amountPaid: 250, paymentDate: '2024-07-01', status: InstallmentStatus.PAID },
        { id: 'inst2-2', installmentNumber: 2, dueDate: '2024-08-01', amountDue: 250, amountPaid: 250, paymentDate: '2024-08-01', status: InstallmentStatus.PAID },
    ],
    totalPaidAmount: 500,
    remainingBalance: 0,
    createdAt: '2024-06-01',
  },
  {
    id: 'loan3',
    employeeId: initialEmployees[2]?.id || 'emp-003',
    employeeName: initialEmployees[2]?.fullNameAr || 'علي محمد جاسم',
    loanType: LoanType.HOUSING, 
    loanAmount: 10000,
    purpose: 'دفعة أولى لشراء مسكن',
    requestDate: '2024-08-01',
    status: LoanStatus.PENDING_APPROVAL,
    repaymentStartDate: '2024-10-01',
    numberOfInstallments: 40,
    monthlyInstallment: 250, 
    installments: [],
    totalPaidAmount: 0,
    remainingBalance: 10000,
    createdAt: '2024-08-01',
    notes: 'بانتظار موافقة الإدارة المالية.'
  },
];

const LoanStatCard: React.FC<{ title: string; value: string; subValue?: string; icon: React.ReactNode; colorClass: string }> = ({ title, value, subValue, icon, colorClass }) => (
    <div className={`p-4 rounded-lg border-s-4 ${colorClass} bg-white dark:bg-dm-card shadow-sm flex items-center justify-between`}>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase">{title}</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-dm-text mt-1">{value}</p>
            {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-full bg-opacity-20 dark:bg-opacity-10 ${colorClass.replace('border-', 'bg-').replace('-500', '-100')} ${colorClass.replace('border-', 'text-').replace('-500', '-600')}`}>
            {icon}
        </div>
    </div>
);

interface LoanFormProps {
  initialData?: Partial<Loan> | null;
  onSubmit: (data: Loan) => void;
  onCancel: () => void;
  employees: Employee[];
}

const LoanForm: React.FC<LoanFormProps> = ({ initialData, onSubmit, onCancel, employees }) => {
  const [formData, setFormData] = useState<Partial<Loan>>(
    initialData || {
      employeeId: employees.length > 0 ? employees[0].id : '',
      loanType: LoanType.PERSONAL,
      loanAmount: 0,
      requestDate: new Date().toISOString().split('T')[0],
      repaymentStartDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0], 
      numberOfInstallments: 12,
      monthlyInstallment: 0,
      status: LoanStatus.PENDING_APPROVAL,
      installments: [],
      createdAt: new Date().toISOString().split('T')[0],
    }
  );

  const selectedEmployee = useMemo(() => 
    employees.find(e => e.id === formData.employeeId), 
  [formData.employeeId, employees]);

  const deductionPercentage = useMemo(() => {
    if (!selectedEmployee || !formData.monthlyInstallment) return 0;
    return (formData.monthlyInstallment / selectedEmployee.basicSalary) * 100;
  }, [selectedEmployee, formData.monthlyInstallment]);

  useEffect(() => {
    if (formData.loanAmount && formData.numberOfInstallments && formData.numberOfInstallments > 0) {
        setFormData(prev => ({ ...prev, monthlyInstallment: parseFloat((prev.loanAmount! / prev.numberOfInstallments!).toFixed(3)) }));
    }
  }, [formData.loanAmount, formData.numberOfInstallments]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numValue = ['loanAmount', 'numberOfInstallments', 'monthlyInstallment'].includes(name) ? parseFloat(value) : value;
    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId || !formData.loanAmount || formData.loanAmount <= 0) {
        alert("يرجى تعبئة كافة البيانات الإلزامية.");
        return;
    }
    
    // Check Article 20
    if (deductionPercentage > 10) {
        const confirmExceed = window.confirm(`تنبيه قانوني (المادة 20): قيمة القسط (${deductionPercentage.toFixed(1)}%) تتجاوز الحد المسموح به قانوناً (10% من الأجر). هل تريد الاستمرار رغم ذلك؟`);
        if (!confirmExceed) return;
    }

    let finalInstallments = formData.installments || [];
    if ((formData.status === LoanStatus.APPROVED || formData.status === LoanStatus.ACTIVE) && finalInstallments.length === 0 && formData.repaymentStartDate && formData.numberOfInstallments && formData.monthlyInstallment) {
        const startDate = new Date(formData.repaymentStartDate);
        for (let i = 0; i < formData.numberOfInstallments; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(startDate.getMonth() + i);
            finalInstallments.push({
                id: `new-inst-${Date.now()}-${i}`,
                installmentNumber: i + 1,
                dueDate: dueDate.toISOString().split('T')[0],
                amountDue: formData.monthlyInstallment,
                status: InstallmentStatus.UPCOMING,
            });
        }
    }
    
    onSubmit({ 
        ...formData, 
        employeeName: selectedEmployee?.fullNameAr || 'غير معروف', 
        installments: finalInstallments,
        remainingBalance: formData.loanAmount,
        totalPaidAmount: 0,
        updatedAt: new Date().toISOString().split('T')[0]
    } as Loan);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card title="بيانات الطلب" titleClassName="text-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="الموظف المقترض" name="employeeId" value={formData.employeeId} options={employees.map(e => ({ value: e.id, label: `${e.fullNameAr} (${e.employeeId})` }))} onChange={handleChange} required />
              <Select label="نوع السلفة / القرض" name="loanType" value={formData.loanType} options={loanTypeOptions} onChange={handleChange} required />
            </div>
            <Input label="الغرض التفصيلي" name="purpose" value={formData.purpose || ''} onChange={handleChange} placeholder="مثال: دفعة زواج، ترميم، عجز مؤقت..." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="إجمالي المبلغ (د.ك)" name="loanAmount" type="number" value={String(formData.loanAmount || 0)} onChange={handleChange} required step="0.001" />
              <Input label="تاريخ تقديم الطلب" name="requestDate" type="date" value={formData.requestDate} onChange={handleChange} required />
            </div>
          </Card>

          <Card title="خطة الاسترداد" titleClassName="text-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input label="تاريخ أول قسط" name="repaymentStartDate" type="date" value={formData.repaymentStartDate} onChange={handleChange} required />
              <Input label="عدد الأشهر (الأقساط)" name="numberOfInstallments" type="number" value={String(formData.numberOfInstallments || 0)} onChange={handleChange} required />
              <div className="space-y-1">
                <Input label="القسط الشهري المتوقع" name="monthlyInstallment" type="number" value={String(formData.monthlyInstallment || 0)} onChange={handleChange} required step="0.001" disabled className="bg-gray-50 border-dashed" />
                {deductionPercentage > 0 && selectedEmployee && (
                  <div className={`text-[10px] font-bold p-1 rounded ${deductionPercentage > 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {deductionPercentage > 10 ? '⚠️ يتجاوز 10% من الراتب' : '✅ ضمن الحد القانوني'} ({deductionPercentage.toFixed(1)}%)
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card title="طرف ضامن / كفيل" titleClassName="text-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="اسم الكفيل الثلاثي" name="guarantorName" value={formData.guarantorName || ''} onChange={handleChange} />
                <Input label="الرقم المدني للكفيل" name="guarantorCivilId" value={formData.guarantorCivilId || ''} onChange={handleChange} />
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="التحقق من الملاءة" className="bg-primary/5">
            {selectedEmployee ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">الراتب الأساسي:</span>
                  <span className="font-bold">{selectedEmployee.basicSalary.toFixed(3)} د.ك</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">سقف الخصم (10%):</span>
                  <span className="font-bold text-secondary">{(selectedEmployee.basicSalary * 0.1).toFixed(3)} د.ك</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">تاريخ التعيين:</span>
                  <span>{new Date(selectedEmployee.joiningDate).toLocaleDateString('ar-EG')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">سنوات الخدمة:</span>
                  <span className="badge bg-blue-100 text-blue-700">{selectedEmployee.serviceYears || 0} سنة</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-center text-gray-400 py-4 italic">اختر موظفاً لعرض بيانات الملاءة المالية</p>
            )}
          </Card>

          <Card title="الإجراء الإداري" className="border-accent-DEFAULT">
            <Select label="حالة الطلب الحالية" name="status" value={formData.status} options={loanStatusOptions} onChange={handleChange} />
            <TextArea label="ملاحظات اللجنة المالية" name="notes" value={formData.notes || ''} onChange={handleChange} rows={4} />
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-3 space-x-reverse pt-4 border-t sticky bottom-0 bg-white dark:bg-dm-card p-2 z-10">
        <Button type="button" variant="ghost" onClick={onCancel}>إلغاء</Button>
        <Button type="submit" variant="primary" className="px-10">إصدار قرار القرض</Button>
      </div>
    </form>
  );
};

const LoanDetailsModal: React.FC<{
    loan: Loan | null;
    onClose: () => void;
    onRecordPayment: (loanId: string, installmentId: string, paymentDate: string, amountPaid: number) => void;
    onUpdateStatus: (loanId: string, status: LoanStatus) => void;
    onPrint: (loan: Loan) => void;
    employees: Employee[];
}> = ({ loan, onClose, onRecordPayment, onUpdateStatus, onPrint, employees }) => {
    if (!loan) return null;
    
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [amountPaid, setAmountPaid] = useState('');
    const [selectedInstallmentId, setSelectedInstallmentId] = useState<string | null>(null);

    const handleRecordPaymentSubmit = () => {
        if (selectedInstallmentId && paymentDate && parseFloat(amountPaid) > 0) {
            onRecordPayment(loan.id, selectedInstallmentId, paymentDate, parseFloat(amountPaid));
            setSelectedInstallmentId(null);
            setAmountPaid('');
        } else {
            alert("يرجى تحديد القسط وإدخال تاريخ ومبلغ الدفع بشكل صحيح.");
        }
    };
    
    const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';
    
    // Progress Calculation
    const progressPercent = Math.min(100, Math.max(0, ((loan.totalPaidAmount || 0) / loan.loanAmount) * 100));

    return (
        <Modal isOpen={!!loan} onClose={onClose} title={`تفاصيل القرض لموظف: ${loan.employeeName}`} size="xl">
            <div className="space-y-5 max-h-[75vh] overflow-y-auto p-1">
                {/* Header Summary */}
                <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600"><CurrencyDollarIcon className="w-8 h-8"/></div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">{loan.loanAmount.toLocaleString()} د.ك</h3>
                            <p className="text-sm text-gray-500">{loan.loanType}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <LoanStatusBadge status={loan.status} />
                        <span className="text-xs text-gray-400 mt-1">تاريخ الطلب: {formatDate(loan.requestDate)}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <Card className="bg-gray-50">
                    <div className="flex justify-between text-sm font-semibold mb-2">
                        <span className="text-green-600">المسدد: {(loan.totalPaidAmount || 0).toFixed(3)} د.ك</span>
                        <span className="text-red-600">المتبقي: {(loan.remainingBalance || loan.loanAmount).toFixed(3)} د.ك</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                        <div className="bg-green-500 h-4 rounded-full transition-all duration-500 flex items-center justify-center text-[10px] text-white font-bold" style={{ width: `${progressPercent}%` }}>
                            {progressPercent > 10 ? `${progressPercent.toFixed(0)}%` : ''}
                        </div>
                    </div>
                </Card>

                {/* Action Buttons for Pending Loans */}
                {loan.status === LoanStatus.PENDING_APPROVAL && (
                    <div className="flex gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg items-center justify-between">
                         <div>
                            <h4 className="font-bold text-yellow-800">طلب معلق</h4>
                            <p className="text-xs text-yellow-700">يرجى اتخاذ إجراء بشأن هذا الطلب.</p>
                         </div>
                         <div className="flex gap-2">
                             <Button size="sm" variant="primary" onClick={() => onUpdateStatus(loan.id, LoanStatus.ACTIVE)} leftIcon={<CheckCircleIcon className="w-4"/>}>موافقة وصرف</Button>
                             <Button size="sm" variant="danger" onClick={() => onUpdateStatus(loan.id, LoanStatus.REJECTED)} leftIcon={<XCircleIcon className="w-4"/>}>رفض الطلب</Button>
                         </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card title="تفاصيل العقد" titleClassName="text-sm">
                        <div className="space-y-2 text-sm">
                            <p className="flex justify-between"><span>الغرض:</span> <span>{loan.purpose || '-'}</span></p>
                            <p className="flex justify-between"><span>عدد الأقساط:</span> <span>{loan.numberOfInstallments}</span></p>
                            <p className="flex justify-between"><span>القسط الشهري:</span> <span>{loan.monthlyInstallment.toFixed(3)} د.ك</span></p>
                            <p className="flex justify-between"><span>تاريخ بدء السداد:</span> <span>{formatDate(loan.repaymentStartDate)}</span></p>
                            <p className="flex justify-between"><span>الكفيل:</span> <span>{loan.guarantorName || 'لا يوجد'}</span></p>
                        </div>
                    </Card>
                    <Card title="التواريخ" titleClassName="text-sm">
                         <div className="space-y-2 text-sm">
                            <p className="flex justify-between"><span>تاريخ الموافقة:</span> <span>{formatDate(loan.approvalDate)}</span></p>
                            <p className="flex justify-between"><span>تاريخ الصرف:</span> <span>{formatDate(loan.disbursementDate)}</span></p>
                            <p className="flex justify-between"><span>آخر تحديث:</span> <span>{formatDate(loan.updatedAt)}</span></p>
                        </div>
                    </Card>
                </div>

                <Card title="جدول الأقساط" titleClassName="text-sm">
                    {loan.installments.length > 0 ? (
                        <>
                        <div className="overflow-x-auto max-h-60 scrollbar-thin">
                            <table className="min-w-full divide-y divide-gray-200 text-xs">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        {['#', 'الاستحقاق', 'المبلغ المستحق', 'المبلغ المدفوع', 'تاريخ الدفع', 'الحالة', 'تسجيل سداد'].map(h => <th key={h} className="px-2 py-2 text-right font-medium">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {loan.installments.map(inst => (
                                        <tr key={inst.id} className={inst.status === InstallmentStatus.OVERDUE ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                            <td className="px-2 py-1">{inst.installmentNumber}</td>
                                            <td className="px-2 py-1">{formatDate(inst.dueDate)}</td>
                                            <td className="px-2 py-1">{inst.amountDue.toFixed(3)} د.ك</td>
                                            <td className="px-2 py-1">{(inst.amountPaid || 0).toFixed(3)} د.ك</td>
                                            <td className="px-2 py-1">{formatDate(inst.paymentDate)}</td>
                                            <td className="px-2 py-1"><InstallmentStatusBadge status={inst.status} /></td>
                                            <td className="px-2 py-1">
                                                {(inst.status !== InstallmentStatus.PAID && loan.status === LoanStatus.ACTIVE) && (
                                                    <Button size="sm" variant="outline" className="text-xs py-0.5 px-2 h-auto" onClick={() => { setSelectedInstallmentId(inst.id); setAmountPaid(inst.amountDue.toFixed(3)) }}>
                                                        سداد
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {selectedInstallmentId && (
                            <div className="mt-4 p-3 border rounded-md bg-blue-50 space-y-2 animate-fade-in-right">
                                <h4 className="font-semibold text-sm text-blue-800">تسجيل سداد للقسط رقم: {loan.installments.find(i=>i.id === selectedInstallmentId)?.installmentNumber}</h4>
                                <div className="flex items-end gap-2">
                                    <Input label="تاريخ الدفع" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} containerClassName="flex-grow mb-0" />
                                    <Input label="المبلغ المدفوع" type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} step="0.001" containerClassName="w-32 mb-0" />
                                    <Button onClick={handleRecordPaymentSubmit} size="sm">تأكيد</Button>
                                    <Button variant="ghost" size="sm" onClick={() => setSelectedInstallmentId(null)}>إلغاء</Button>
                                </div>
                                {loan.monthlyInstallment > (employees.find(e => e.id === loan.employeeId)?.basicSalary || 0) * 0.1 && (
                                    <p className="text-[10px] text-orange-600 font-bold mt-1">تنبيه: القسط يتجاوز 10% من الراتب الأساسي (المادة 20).</p>
                                )}
                            </div>
                        )}
                        </>
                    ) : (
                        <p className="text-center text-gray-500 py-4 italic">سيتم إنشاء جدول الأقساط عند الموافقة على القرض وتحديد تاريخ بدء السداد.</p>
                    )}
                </Card>
                 <div className="mt-6 flex justify-end">
                    <Button variant="secondary" onClick={() => onPrint(loan)}>طباعة ملخص/اتفاقية القرض</Button>
                </div>
            </div>
        </Modal>
    );
};

const PrintableLoanAgreementModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  loan: Loan | null;
}> = ({ isOpen, onClose, loan }) => {
  if (!isOpen || !loan) return null;

  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric'}) : '-';
  const formatCurrency = (num: number) => `${num.toFixed(3)} د.ك`;
  const employeeDetails = initialEmployees.find(e => e.id === loan.employeeId);
  const companyName = OFFICE_NAME;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="نموذج اتفاقية قرض موظف" size="lg">
      <div id="printable-loan-agreement-content" className="p-4 print-statement">
        <style>{`
            .print-statement h2 { font-size: 1.3rem; font-weight: bold; text-align: center; margin-bottom: 1rem; color: #0D47A1; border-bottom: 2px solid #0D47A1; pb-2; }
            .print-statement h3 { font-size: 1rem; font-weight: bold; margin-top: 1rem; margin-bottom: 0.5rem; color: #1976D2; background: #f8fafc; padding: 4px 8px; border-radius: 4px; }
            .print-statement p { margin-bottom: 0.6rem; font-size: 0.95rem; line-height: 1.6; color: #334155; }
            .print-statement strong { font-weight: 700; color: #1e293b; }
            .print-statement .signature-area { margin-top: 3rem; padding-top: 1.5rem; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-around; }
            .print-statement .signature-block { text-align: center; width: 45%; }
            .print-statement .signature-block p { margin-bottom: 2rem; font-weight: bold; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
              .print-hide-in-modal { display: none !important; }
              #printable-loan-agreement-content { font-size: 11pt; padding: 0; }
            }
        `}</style>
        
        <h2>اتفاقية قرض موظف (رقم المرجع: {loan.id.split('-').pop()})</h2>
        
        <p><strong>الطرف الأول:</strong> {companyName} (يشار إليه بـ "الشركة")</p>
        <p><strong>الطرف الثاني (المقترض):</strong> السيد/ <strong>{loan.employeeName}</strong> بصفتـه موظفاً لدى الشركة.</p>
        
        <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 my-4">
            <p><strong>الرقم المدني:</strong> {employeeDetails?.civilId || '-'}</p>
            <p><strong>الرقم الوظيفي:</strong> {employeeDetails?.employeeId || '-'}</p>
            <p><strong>المسمى الوظيفي:</strong> {employeeDetails?.jobTitle || '-'}</p>
            <p><strong>الراتب الأساسي:</strong> {employeeDetails?.basicSalary.toFixed(3) || '-'} د.ك</p>
        </div>

        <h3>أولاً: التمهيد</h3>
        <p>
            بناءً على طلب الطرف الثاني واحتياجه المبرر، وافقت الشركة على صرف "<strong>{loan.loanType}</strong>" للطرف الثاني كقرض حسن (بدون فوائد) وفقاً للضوابط المعمول بها في السياسة الداخلية للشركة وبما يتوافق مع أحكام <strong>قانون العمل الكويتي رقم 6 لسنة 2010</strong>.
        </p>

        <h3>ثانياً: مبلغ القرض</h3>
        <p>يقر الطرف الأول بصرف مبلغ وقدره <strong>{formatCurrency(loan.loanAmount)}</strong> للطرف الثاني، ويقر الطرف الثاني باستلامه للمبلغ المذكور وإضافته لذمته المالية كدين مستحق الأداء للشركة.</p>

        <h3>ثالثاً: آلية السداد (الخصم الشهري)</h3>
        <p>1. يلتزم الطرف الثاني بسداد القرض على أقساط شهرية متتالية عددها (<strong>{loan.numberOfInstallments}</strong>) قسطاً.</p>
        <p>2. قيمة القسط الشهري هي <strong>{formatCurrency(loan.monthlyInstallment)}</strong>، وهو ما يشكل نسبة <strong>{((loan.monthlyInstallment / (employeeDetails?.basicSalary || 1)) * 100).toFixed(1)}%</strong> من الراتب الأساسي.</p>
        <p>3. يبدأ الخصم من حيازة الراتب اعتباراً من شهر: <strong>{formatDate(loan.repaymentStartDate)}</strong>.</p>

        <h3>رابعاً: حقوق الشركة في الاسترداد</h3>
        <p>
            يوافق الطرف الثاني موافقة نهائية وباتة على قيام الشركة بخصم الأقساط الشهرية من راتبه. كما يقر بأنه في حال <strong>انتهاء خدمته</strong> لأي سبب، فإن الرصيد المتبقي من القرض يعتبر <strong>حالاً وواجب الأداء فوراً</strong>، وللشركة الحق في خصمه من مكافأة نهاية الخدمة أو أي مستحقات أخرى له.
        </p>

        <h3>خامساً: جدول الأقساط (ملخص)</h3>
        <div className="overflow-hidden border border-slate-300 rounded-lg mb-4">
          <table className="min-w-full text-[10px]">
            <thead className="bg-slate-100 font-bold">
              <tr>
                <th className="border-b px-3 py-1.5 text-right">رقم القسط</th>
                <th className="border-b px-3 py-1.5 text-right">تاريخ الاستحقاق</th>
                <th className="border-b px-3 py-1.5 text-right">المبلغ</th>
                <th className="border-b px-3 py-1.5 text-right">الرصيد المتبقي</th>
              </tr>
            </thead>
            <tbody>
              {loan.installments.slice(0, 10).map((inst) => (
                <tr key={inst.id} className="border-b hover:bg-slate-50">
                  <td className="px-3 py-1">{inst.installmentNumber}</td>
                  <td className="px-3 py-1">{formatDate(inst.dueDate)}</td>
                  <td className="px-3 py-1">{formatCurrency(inst.amountDue)}</td>
                  <td className="px-3 py-1">{formatCurrency(loan.loanAmount - (inst.installmentNumber * inst.amountDue))}</td>
                </tr>
              ))}
              {loan.installments.length > 10 && <tr><td colSpan={4} className="text-center italic py-2 bg-slate-50 text-[9px]">... يتبع باقي الأقساط في السجلات المالية المعتمدة ...</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="signature-area">
            <div className="signature-block">
                <p>توقيع الموظف (المقترض):</p>
                <div className="h-12 border-b border-slate-400 mb-2"></div>
                <small>التاريخ: ____/____/____</small>
            </div>
            <div className="signature-block">
                <p>اعتماد الشركة (الطرف الأول):</p>
                <div className="h-12 border-b border-slate-400 mb-2"></div>
                <small>الختم الرسمي:</small>
            </div>
        </div>

        {loan.guarantorName && (
          <div className="mt-8 p-4 border rounded-lg bg-orange-50 border-orange-200">
            <h3 className="bg-transparent p-0 text-orange-800">إقرار الكفالة (الضامن):</h3>
            <p className="text-sm text-orange-900 italic">
                أنا الموقع أدناه السيد/ {loan.guarantorName} (المدني: {loan.guarantorCivilId || '-'}), أكفل الموظف المذكور أعلاه كفالة غرم وأداء تضامنية في سداد هذا القرض، وألتزم بالسداد في حال تعثره.
            </p>
            <div className="mt-4 text-center">
                <p className="text-xs">توقيع الكفيل: ......................................................</p>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end print-hide-in-modal">
        <Button variant="ghost" onClick={onClose} className="me-2">إغلاق</Button>
        <Button variant="primary" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>}>طباعة الاتفاقية</Button>
      </div>
    </Modal>
  );
};


const LoanManagementPage: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<LoanStatus | ''>('');
  const [filterType, setFilterType] = useState<LoanType | ''>('');

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Partial<Loan> | null>(null);
  const [viewingLoan, setViewingLoan] = useState<Loan | null>(null);
  const [isPrintAgreementModalOpen, setIsPrintAgreementModalOpen] = useState(false);
  const [loanToPrint, setLoanToPrint] = useState<Loan | null>(null);

  // Stats Logic
  const stats = useMemo(() => {
    const activeLoans = loans.filter(l => l.status === LoanStatus.ACTIVE);
    const totalActiveBalance = activeLoans.reduce((sum, l) => sum + (l.remainingBalance || 0), 0);
    const totalPaid = loans.reduce((sum, l) => sum + (l.totalPaidAmount || 0), 0);
    const pendingRequests = loans.filter(l => l.status === LoanStatus.PENDING_APPROVAL).length;

    return {
        activeCount: activeLoans.length,
        balance: totalActiveBalance,
        paid: totalPaid,
        pending: pendingRequests
    };
  }, [loans]);

  const filteredLoans = useMemo(() => {
    return loans.filter(loan =>
      (loan.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (initialEmployees.find(e => e.id === loan.employeeId)?.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
      ) &&
      (filterStatus ? loan.status === filterStatus : true) &&
      (filterType ? loan.loanType === filterType : true)
    ).sort((a,b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());
  }, [loans, searchTerm, filterStatus, filterType]);
  
  const handleAddLoan = () => {
    setEditingLoan(null);
    setIsFormModalOpen(true);
  };

  const handleEditLoan = (loan: Loan) => {
    setEditingLoan(loan);
    setIsFormModalOpen(true);
  };

  const handleViewLoan = (loan: Loan) => {
    setViewingLoan(loan);
  };
  
  const handleDeleteLoan = useCallback((loanId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا القرض؟ سيتم حذف جميع سجلات الأقساط المرتبطة به.')) {
        setLoans(prev => prev.filter(l => l.id !== loanId));
    }
  }, []);

  const handleFormSubmit = (data: Loan) => {
    let updatedLoans;
    if (editingLoan && editingLoan.id) {
      updatedLoans = loans.map(l => l.id === editingLoan.id ? { ...data, id: l.id, createdAt: l.createdAt } : l);
    } else {
      updatedLoans = [{ ...data, id: `loan-${Date.now()}` }, ...loans];
    }
    setLoans(updatedLoans);
    setIsFormModalOpen(false);
    setEditingLoan(null);
    if (viewingLoan && viewingLoan.id === data.id) {
        setViewingLoan(updatedLoans.find(l => l.id === data.id) || null);
    }
  };
  
  const handleRecordPayment = (loanId: string, installmentId: string, paymentDate: string, amountPaid: number) => {
    setLoans(prevLoans => prevLoans.map(loan => {
        if (loan.id === loanId) {
            const updatedInstallments = loan.installments.map(inst => {
                if (inst.id === installmentId) {
                    return { ...inst, amountPaid, paymentDate, status: amountPaid >= inst.amountDue ? InstallmentStatus.PAID : InstallmentStatus.PARTIALLY_PAID };
                }
                return inst;
            });
            const totalPaid = updatedInstallments.reduce((sum, inst) => sum + (inst.amountPaid || 0), 0);
            const remaining = loan.loanAmount - totalPaid;
            const newStatus = remaining <= 0 ? LoanStatus.PAID_IN_FULL : loan.status;

            return { ...loan, installments: updatedInstallments, totalPaidAmount: totalPaid, remainingBalance: remaining, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] };
        }
        return loan;
    }));
  };

  const handleUpdateStatus = (loanId: string, status: LoanStatus) => {
      setLoans(prevLoans => prevLoans.map(loan => {
          if (loan.id === loanId) {
            let updatedLoan = { ...loan, status, updatedAt: new Date().toISOString() };
            if (status === LoanStatus.ACTIVE && loan.installments.length === 0) {
                 // Generate Installments on Approval if not exists
                 const installments = [];
                 const startDate = new Date(loan.repaymentStartDate);
                 for (let i = 0; i < loan.numberOfInstallments; i++) {
                    const dueDate = new Date(startDate);
                    dueDate.setMonth(startDate.getMonth() + i);
                    installments.push({
                        id: `inst-${Date.now()}-${i}`,
                        installmentNumber: i + 1,
                        dueDate: dueDate.toISOString().split('T')[0],
                        amountDue: loan.monthlyInstallment,
                        status: InstallmentStatus.UPCOMING
                    });
                 }
                 updatedLoan.installments = installments;
                 updatedLoan.approvalDate = new Date().toISOString();
                 updatedLoan.disbursementDate = new Date().toISOString(); // Simulate disbursement same time
            }
            return updatedLoan;
          }
          return loan;
      }));
      setViewingLoan(null); // Close modal after action
  };

  const handleOpenPrintAgreement = (loan: Loan) => {
    setLoanToPrint(loan);
    setIsPrintAgreementModalOpen(true);
  };
  
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">إدارة القروض والسلف</h1>
          <p className="text-slate-500 mt-1">تنظيم التمويل الداخلي والامتثال للمادة 20 من قانون العمل الكويتي</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <Button variant="outline" className="border-slate-300" leftIcon={<CalculatorIcon className="w-5 h-5"/>} onClick={() => window.scrollTo({ top: document.getElementById('calc-section')?.offsetTop, behavior: 'smooth'})}>الحاسبة المالية</Button>
          <Button variant="primary" onClick={handleAddLoan} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>إصدار سلفة جديدة</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="إجمالي القروض القائمة" value={stats.balance.toFixed(3) + " د.ك"} icon={<BanknotesIcon className="text-blue-600"/>} trend="+12% من الشهر الماضي" color="blue" />
        <StatsCard title="المبالغ المستردة" value={stats.paid.toFixed(3) + " د.ك"} icon={<CheckCircleIcon className="text-green-600"/>} trend="نسبة تحصيل 98%" color="green" />
        <StatsCard title="طلبات قيد المراجعة" value={stats.pending.toString()} icon={<ClockIcon className="text-orange-500"/>} trend="3 طلبات عاجلة" color="orange" />
        <StatsCard title="عدد المقترضين النشطين" value={stats.activeCount.toString()} icon={<UsersIcon className="text-purple-600"/>} trend="15% من القوة العاملة" color="purple" />
      </div>

      <div id="calc-section">
        <LoanCalculator employees={initialEmployees} />
      </div>

      <Card className="overflow-hidden border-none shadow-md ring-1 ring-slate-200">
        <div className="bg-slate-50 border-b border-slate-200 p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-grow">
               <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
               <input 
                className="w-full pr-10 pl-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="ابحث باسم الموظف، الرقم الوظيفي، أو نوع القرض..." 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={filterStatus} options={[{value: '', label: 'كافة الحالات'}, ...loanStatusOptions]} onChange={e => setFilterStatus(e.target.value as LoanStatus | '')} />
            </div>
            <div className="w-full md:w-48">
              <Select value={filterType} options={[{value: '', label: 'كافة أنواع القروض'}, ...loanTypeOptions]} onChange={e => setFilterType(e.target.value as LoanType | '')} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded text-xs text-blue-700">
            <InformationCircleIcon className="w-4 h-4 flex-shrink-0" />
            <span>نظام القروض يتوافق تلقائياً مع <strong>المادة 20</strong> (سقف استقطاع 10% من الأجر الأساسي).</span>
          </div>
        </div>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        {['اسم الموظف', 'نوع القرض', 'المبلغ', 'الحالة', 'المتبقي', 'القسط التالي', 'إجراءات'].map(h=><th key={h} className="px-3 py-3 text-right font-medium">{h}</th>)}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLoans.map(loan => {
                        const nextUnpaidInstallment = loan.installments.find(i => i.status === InstallmentStatus.PENDING || i.status === InstallmentStatus.UPCOMING || i.status === InstallmentStatus.OVERDUE);
                        return (
                            <tr key={loan.id} className="hover:bg-primary-light/5">
                                <td className="px-3 py-2 whitespace-nowrap font-medium">{loan.employeeName}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{loan.loanType}</td>
                                <td className="px-3 py-2 whitespace-nowrap font-bold text-primary-dark">{loan.loanAmount.toFixed(3)} د.ك</td>
                                <td className="px-3 py-2 whitespace-nowrap"><LoanStatusBadge status={loan.status}/></td>
                                <td className="px-3 py-2 whitespace-nowrap text-red-600">{(loan.remainingBalance || loan.loanAmount).toFixed(3)} د.ك</td>
                                <td className="px-3 py-2 whitespace-nowrap">{nextUnpaidInstallment ? formatDate(nextUnpaidInstallment.dueDate) : 'مسدد'}</td>
                                <td className="px-3 py-2 whitespace-nowrap space-x-1 space-x-reverse">
                                    <Button variant="ghost" size="sm" onClick={() => handleViewLoan(loan)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-primary" /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleEditLoan(loan)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteLoan(loan.id)} className="text-danger hover:text-red-700" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                                </td>
                            </tr>
                        );
                    })}
                    {filteredLoans.length === 0 && (
                        <tr><td colSpan={7} className="text-center py-10 text-gray-500"><FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400"/>لا توجد قروض تطابق بحثك.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
      </Card>

      <Modal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setEditingLoan(null);}} title={editingLoan?.id ? `تعديل قرض: ${editingLoan.employeeName}` : "إضافة طلب قرض جديد"} size="xl">
          <LoanForm initialData={editingLoan} onSubmit={handleFormSubmit} onCancel={() => { setIsFormModalOpen(false); setEditingLoan(null); }} employees={initialEmployees} />
      </Modal>
      
      <LoanDetailsModal 
        loan={viewingLoan} 
        onClose={() => setViewingLoan(null)} 
        onRecordPayment={handleRecordPayment}
        onUpdateStatus={handleUpdateStatus}
        onPrint={handleOpenPrintAgreement}
        employees={initialEmployees}
      />

      <PrintableLoanAgreementModal
        isOpen={isPrintAgreementModalOpen}
        onClose={() => setIsPrintAgreementModalOpen(false)}
        loan={loanToPrint}
      />

    </div>
  );
};

export default LoanManagementPage;
