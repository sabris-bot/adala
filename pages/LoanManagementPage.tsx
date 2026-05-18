
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import PrintHeader from '../components/ui/PrintHeader';
import { 
    CurrencyDollarIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    FolderIcon, InformationCircleIcon, CheckCircleIcon, XCircleIcon, 
    ClockIcon, BanknotesIcon, ChartBarIcon, PrinterIcon, CalculatorIcon,
    MagnifyingGlassIcon, UsersIcon, ScaleIcon, OFFICE_NAME
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

const LoanCalculator: React.FC<{ employees: Employee[]; onApply: (data: Partial<Loan>) => void }> = ({ employees, onApply }) => {
  const [calcData, setCalcData] = useState({
    employeeId: employees[0]?.id || '',
    amount: 1000,
    term: 12,
    type: LoanType.PERSONAL
  });

  const selectedEmp = employees.find(e => e.id === calcData.employeeId);
  const monthly = (calcData.amount / calcData.term);
  const deductionRatio = selectedEmp ? (monthly / selectedEmp.basicSalary) * 100 : 0;
  const isExceeding = deductionRatio > 10;

  const handleApply = () => {
    onApply({
      employeeId: calcData.employeeId,
      loanAmount: calcData.amount,
      numberOfInstallments: calcData.term,
      loanType: calcData.type,
      monthlyInstallment: parseFloat(monthly.toFixed(3)),
      requestDate: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <Card title="المُحاكي المالي المتطور" className="bg-slate-900 border-none shadow-2xl relative overflow-hidden" titleClassName="text-white">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2">الموظف المعني</label>
                    <Select 
                        value={calcData.employeeId} 
                        options={employees.map(e => ({ value: e.id, label: e.fullNameAr }))} 
                        onChange={e => setCalcData({...calcData, employeeId: e.target.value})}
                        className="h-14 bg-white/5 border-white/10 text-white font-bold rounded-2xl focus:ring-indigo-500/50"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2">نوع التمويل</label>
                    <Select 
                        value={calcData.type} 
                        options={loanTypeOptions} 
                        onChange={e => setCalcData({...calcData, type: e.target.value as LoanType})}
                        className="h-14 bg-white/5 border-white/10 text-white font-bold rounded-2xl"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2">مبلغ القرض (د.ك)</label>
                    <div className="relative">
                        <Input 
                            type="number" 
                            step="50"
                            value={String(calcData.amount)} 
                            onChange={e => setCalcData({...calcData, amount: parseFloat(e.target.value) || 0})}
                            className="h-14 bg-white/5 border-white/10 text-white font-black text-xl rounded-2xl pr-12"
                        />
                        <BanknotesIcon className="absolute right-4 top-4 w-6 h-6 text-slate-500" />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 mr-2">مدة السداد (6 - 60 شهر)</label>
                    <div className="relative">
                        <Input 
                            type="number" 
                            value={String(calcData.term)} 
                            onChange={e => setCalcData({...calcData, term: parseInt(e.target.value) || 12})}
                            className="h-14 bg-white/5 border-white/10 text-white font-black text-xl rounded-2xl pr-12"
                        />
                        <ClockIcon className="absolute right-4 top-4 w-6 h-6 text-slate-500" />
                    </div>
                </div>
            </div>
            <div className="pt-4 flex gap-4">
                <Button 
                    variant="primary" 
                    className="flex-1 h-14 bg-indigo-600 hover:bg-indigo-500 text-lg font-black rounded-2xl shadow-xl shadow-indigo-600/20"
                    onClick={handleApply}
                    leftIcon={<PlusCircleIcon className="w-6 h-6"/>}
                >
                    تحويل المحاكاة إلى طلب رسمي
                </Button>
            </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl rounded-[2rem] p-8 border border-white/10 flex flex-col justify-between relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-full h-1 ${isExceeding ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
            <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">نتائج التحليل المالي</p>
                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] font-black text-indigo-400 mb-1">القسط الشهري المقدر</p>
                        <p className={`text-4xl font-black italic ${isExceeding ? 'text-rose-400' : 'text-white'}`}>{monthly.toFixed(3)} <span className="text-sm">د.ك</span></p>
                    </div>
                    <div className="h-px bg-white/10 w-full"></div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 mb-2">نسبة الاستقطاع من الراتب</p>
                        <div className="flex items-end justify-between gap-2 mb-2">
                            <span className={`text-2xl font-black ${isExceeding ? 'text-rose-400' : 'text-emerald-400'}`}>{deductionRatio.toFixed(1)}%</span>
                            <span className="text-[10px] font-black text-slate-500">الحد الأقصى القانوني: 10%</span>
                        </div>
                        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                            <div 
                                className={`h-full transition-all duration-700 ${isExceeding ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                style={{ width: `${Math.min(100, (deductionRatio / 10) * 100)}%` }}
                            ></div>
                        </div>
                        {isExceeding && (
                            <p className="text-[10px] text-rose-300 font-bold mt-2 flex items-center gap-1 leading-tight">
                                <XCircleIcon className="w-3 h-3 flex-shrink-0" />
                                تنبيه: القسط يتجاوز الحد المسموح به في المادة (20) من قانون العمل.
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 space-y-2">
                <p className="text-[9px] text-slate-500 font-bold italic leading-relaxed">
                    * تعتمد هذه الحاسبة على الراتب الأساسي المسجل في النظام فقط ولا تشمل البدلات الخارجية.
                </p>
            </div>
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

const KUWAIT_LABOR_LAW_LOAN_ARTICLES = {
    DEDUCTION_LIMIT: "المادة (20): لا يجوز لصاحب العمل أن يقتطع من أجر العامل أكثر من (10%) وفاءً لديون أو قروض مستحقة له، كما لا يجوز له أن يتقاضى عنها أية فائدة.",
    TERMINATION_RECOVERY: "المادة (51): في حالة انتهاء خدمة العامل، يحق لصاحب العمل استيفاء ما يكون مستحقاً له من ديون أو قروض من مكافأة نهاية الخدمة والمستحقات الأخرى.",
    ADVANCE_WAGES: "القرار الوزاري: تعتبر السلف المقدمة على الراتب جزءاً من الالتزامات المالية التي تسدد وفق الاتفاق المبرم بما لا يخل بكرامة العامل ومعيشته."
};

// --- Extended Loan Interface for Local Use ---
interface DetailedLoan extends Loan {
    hasPreviousLoans?: boolean;
    hasDefaultHistory?: boolean;
    defaultNotes?: string;
    employeeJobTitle?: string;
    employeeDepartment?: string;
}

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
  initialData?: Partial<DetailedLoan> | null;
  onSubmit: (data: Loan) => void;
  onCancel: () => void;
  employees: Employee[];
  loans: Loan[];
}

const LoanForm: React.FC<LoanFormProps> = ({ initialData, onSubmit, onCancel, employees, loans }) => {
  const [formData, setFormData] = useState<Partial<DetailedLoan>>(
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
      hasPreviousLoans: false,
      hasDefaultHistory: false,
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

  const employeeActiveLoans = useMemo(() => 
    loans.filter(l => l.employeeId === formData.employeeId && l.status === LoanStatus.ACTIVE),
  [formData.employeeId, loans]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const numValue = ['loanAmount', 'numberOfInstallments', 'monthlyInstallment'].includes(name) ? parseFloat(value) : value;
    
    if (name === 'employeeId') {
        const hasHistory = loans.some(l => l.employeeId === value);
        setFormData(prev => ({ ...prev, employeeId: value, hasPreviousLoans: hasHistory }));
        return;
    }

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
          <Card title="بيانات الطلب والتحقق" titleClassName="text-md">
            {employeeActiveLoans.length > 0 && (
                <div className="mb-4 p-4 bg-amber-50 border-r-4 border-amber-500 rounded-lg flex items-start gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-right">
                        <p className="text-sm font-black text-amber-900 italic">تنبيه: الموظف لديه قرض نشط حالياً</p>
                        <p className="text-[10px] text-amber-700">الرصيد المتبقي الإجمالي: {employeeActiveLoans.reduce((sum, l) => sum + l.loanAmount, 0).toFixed(3)} د.ك. تنص السياسة الداخلية على جدولة القروض بالتتابع.</p>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select label="الموظف المقترض" name="employeeId" value={formData.employeeId} options={employees.map(e => ({ value: e.id, label: `${e.fullNameAr} (${e.employeeId})` }))} onChange={handleChange} required />
              <Select label="نوع السلفة / القرض" name="loanType" value={formData.loanType} options={loanTypeOptions} onChange={handleChange} required />
            </div>
            <Input label="الغرض التفصيلي" name="purpose" value={formData.purpose || ''} onChange={handleChange} placeholder="مثال: دفعة زواج، ترميم، عجز مؤقت..." />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded-lg text-indigo-600 focus:ring-indigo-500" checked={formData.hasPreviousLoans} onChange={e => setFormData({...formData, hasPreviousLoans: e.target.checked})} />
                        <span className="text-sm font-bold text-slate-700">يوجد قروض سابقة لهذا الموظف</span>
                    </label>
                    <p className="text-[10px] text-slate-400 mr-8">تحديد هذا الخيار يساعد في تقييم الملاءة التاريخية</p>
                </div>
                <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded-lg text-rose-600 focus:ring-rose-500" checked={formData.hasDefaultHistory} onChange={e => setFormData({...formData, hasDefaultHistory: e.target.checked})} />
                        <span className="text-sm font-bold text-rose-700">يوجد سجل تعثر أو تأخير سابق</span>
                    </label>
                    {formData.hasDefaultHistory && (
                        <Input placeholder="تفاصيل التعثر السابق..." value={formData.defaultNotes || ''} onChange={e => setFormData({...formData, defaultNotes: e.target.value})} className="mt-2 text-xs" />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
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
                    <div className="md:col-span-2 p-4 bg-slate-900 rounded-2xl text-white space-y-2">
                        <p className="text-[10px] font-black text-indigo-400 flex items-center gap-2">
                             السند القانوني الكويتي <ScaleIcon className="w-3" />
                        </p>
                        <p className="text-[11px] font-bold text-slate-300 italic leading-relaxed">
                            {KUWAIT_LABOR_LAW_LOAN_ARTICLES.DEDUCTION_LIMIT}
                        </p>
                    </div>
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
  loan: DetailedLoan | null;
}> = ({ isOpen, onClose, loan }) => {
  if (!isOpen || !loan) return null;

  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric'}) : '-';
  const formatCurrency = (num: number) => `${num.toFixed(3)} د.ك`;
  const employeeDetails = initialEmployees.find(e => e.id === loan.employeeId);
  const companyName = OFFICE_NAME;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="نموذج اتفاقية قرض موظف رسمي" size="xl">
      <div id="printable-loan-agreement-content" className="printable-sheet bg-white text-slate-900 p-12 text-right" dir="rtl">
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-900">{companyName}</h2>
                <p className="text-sm font-bold text-slate-500">إدارة الشؤون الإدارية والمالية</p>
            </div>
            <div className="text-left font-mono">
                <p className="text-sm font-black mb-1 text-slate-400">REF: {loan.id.toUpperCase()}</p>
                <p className="text-sm font-black">Date: {loan.requestDate}</p>
            </div>
        </div>

        <div className="text-center py-6 bg-slate-50 border-y-2 border-slate-200 mb-10">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">سند اتفاقية قرض وإقرار مديونية</h1>
            <p className="text-xs font-bold text-slate-500 mt-2 tracking-widest uppercase">LOAN AGREEMENT & DEBT ACKNOWLEDGMENT STATEMENT</p>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-10">
            <div className="space-y-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">بيانات الموظف (المقترض)</p>
                <div className="space-y-3 text-sm font-bold">
                    <p className="flex justify-between"><span>الاسم الكامل:</span> <span className="text-lg">{loan.employeeName}</span></p>
                    <p className="flex justify-between"><span>الرقم المدني:</span> <span>{employeeDetails?.civilId || '-'}</span></p>
                    <p className="flex justify-between"><span>الرقم الوظيفي:</span> <span>{employeeDetails?.employeeId || '-'}</span></p>
                    <p className="flex justify-between"><span>المسمى الوظيفي:</span> <span>{employeeDetails?.jobTitle || '-'}</span></p>
                    <p className="flex justify-between"><span>الراتب الأساسي:</span> <span>{formatCurrency(employeeDetails?.basicSalary || 0)}</span></p>
                </div>
            </div>
            <div className="space-y-4">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-1">تفاصيل التمويل الداخلي</p>
                <div className="space-y-3 text-sm font-bold">
                    <p className="flex justify-between"><span>نوع السلفة:</span> <span className="text-indigo-600 font-extrabold">{loan.loanType}</span></p>
                    <p className="flex justify-between"><span>إجمالي المبلغ:</span> <span className="text-lg font-black">{formatCurrency(loan.loanAmount)}</span></p>
                    <p className="flex justify-between"><span>عدد الأقساط:</span> <span>{loan.numberOfInstallments} أيـام</span></p>
                    <p className="flex justify-between"><span>قيمة القوط الشهري:</span> <span className="text-indigo-600">{formatCurrency(loan.monthlyInstallment)}</span></p>
                    <p className="flex justify-between"><span>نسبة الخصم:</span> <span className={((loan.monthlyInstallment / (employeeDetails?.basicSalary || 1)) * 100) > 10 ? 'text-rose-600' : 'text-emerald-600'}>{((loan.monthlyInstallment / (employeeDetails?.basicSalary || 1)) * 100).toFixed(1)}%</span></p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-10">
            <div className={`p-6 rounded-2xl border-2 ${loan.hasPreviousLoans ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2">السجل الائتماني الداخلي</p>
                <p className="text-sm font-bold">{loan.hasPreviousLoans ? '✅ الموظف له سابق تعامل مع نظام القروض' : 'ℹ️ الموظف لم يسبق له الاقتراض'}</p>
            </div>
            <div className={`p-6 rounded-2xl border-2 ${loan.hasDefaultHistory ? 'bg-rose-50 border-rose-100' : 'bg-emerald-50 border-emerald-100'}`}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-2">سجل التعثر والالتزام</p>
                <p className="text-sm font-bold">{loan.hasDefaultHistory ? `⚠️ يوجد سجل تعثر سابق: ${loan.defaultNotes}` : '✅ سجل الموظف خالٍ من أي تعثرات مالية'}</p>
            </div>
        </div>

        <div className="space-y-6 text-sm font-bold leading-relaxed mb-12">
            <p className="p-4 bg-slate-50 rounded-xl">أقر أنا الموقع أدناه باستلامي لمبلغ القرض المذكور أعلاه بقيمة ({formatCurrency(loan.loanAmount)})، وأوافق موافقة نهائية وباتة لا رجعة فيها على خصم مدفوعات هذا القرض من راتبي الشهري أو أي مستحقات أخرى لي بذمة الشركة في حال انتهاء خدمتي لأي سبب من الأسباب.</p>
            
            <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-indigo-400">
                    <ScaleIcon className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">السند القانوني الكويتي</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] leading-relaxed">
                    <p className="italic opacity-80">{KUWAIT_LABOR_LAW_LOAN_ARTICLES.DEDUCTION_LIMIT}</p>
                    <p className="italic opacity-80">{KUWAIT_LABOR_LAW_LOAN_ARTICLES.TERMINATION_RECOVERY}</p>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 gap-20 pt-10 border-t-2 border-slate-100">
            <div className="space-y-6 text-center">
                <div className="bg-slate-50 py-2 mb-4 rounded-xl">
                    <p className="text-sm font-black text-slate-900 uppercase tracking-widest">توقيع الموظف (المقترض)</p>
                </div>
                <div className="h-24 flex items-center justify-center italic text-slate-300 font-serif text-3xl select-none">
                    {loan.employeeName}
                </div>
                <div className="border-b-4 border-slate-900 mx-auto w-3/4"></div>
                <p className="text-[10px] text-slate-400 mt-2 font-black">أوافق على كافة الشروط المالية المذكورة</p>
            </div>
            <div className="space-y-6 text-center">
                <div className="bg-slate-900 py-2 mb-4 rounded-xl">
                    <p className="text-sm font-black text-white uppercase tracking-widest">اعتماد المدير العام</p>
                </div>
                <div className="h-24 flex items-center justify-center italic text-slate-900 font-serif text-3xl select-none">
                    W. Adala
                </div>
                <div className="border-b-4 border-slate-900 mx-auto w-3/4"></div>
                <p className="text-[10px] text-slate-400 mt-2 font-black">يعتمد الصرف بناءً على تقرير الملاءة المالية</p>
            </div>
        </div>

        <div className="pt-20 flex justify-between font-black text-[10px] text-slate-400 uppercase tracking-widest italic no-print-bg">
            <span>Adala ERP - Internal Finance Management</span>
            <span>Document ID: {loan.id} / {new Date().getFullYear()}</span>
        </div>

        <div className="flex justify-end pt-8 border-t gap-3 print:hidden mt-10">
            <Button variant="ghost" onClick={onClose}>إغلاق المعاينة</Button>
            <Button variant="primary" className="bg-slate-900 shadow-xl" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4 h-4"/>}>طباعة المستند الرسمي الآن</Button>
        </div>
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
        <LoanCalculator 
          employees={initialEmployees} 
          onApply={(calcData) => {
            setEditingLoan(calcData);
            setIsFormModalOpen(true);
          }}
        />
      </div>

      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
          <ScaleIcon className="absolute -left-10 -bottom-10 w-64 h-64 text-white opacity-[0.03] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-right">
                  <div className="flex items-center gap-3 mb-2">
                       <ScaleIcon className="w-8 h-8 text-indigo-400" />
                       <h2 className="text-2xl font-black italic">نظام القروض والائتمان الكويتي</h2>
                  </div>
                  <p className="text-slate-400 font-bold max-w-xl">
                      تتم إدارة كافة السلف والقروض الداخلية وفق المادة (20) من قانون العمل رقم 6 لسنة 2010، والتي تحمي العامل من الاقتطاعات الجائرة وتحدد سقف السداد بـ 10% من الراتب الأساسي.
                  </p>
              </div>
              <div className="flex gap-4">
                   <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md text-center min-w-[120px]">
                        <p className="text-[10px] font-black text-indigo-300 mb-1">سقف الخصم</p>
                        <p className="text-xl font-black italic">10%</p>
                   </div>
                   <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md text-center min-w-[120px]">
                        <p className="text-[10px] font-black text-emerald-300 mb-1">نسبة الفائدة</p>
                        <p className="text-xl font-black italic">0%</p>
                   </div>
                   <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md text-center min-w-[120px]">
                        <p className="text-[10px] font-black text-rose-300 mb-1">العوائد</p>
                        <p className="text-xl font-black italic">نهاية الخدمة</p>
                   </div>
              </div>
          </div>
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
                                <td className="px-3 py-2 whitespace-nowrap">
                                    <div className="font-medium text-slate-900">{loan.employeeName}</div>
                                    <div className="flex gap-1 mt-1">
                                        {(loan as DetailedLoan).hasPreviousLoans && <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1 rounded border border-indigo-100 font-black">قرض سابق</span>}
                                        {(loan as DetailedLoan).hasDefaultHistory && <span className="text-[8px] bg-rose-50 text-rose-600 px-1 rounded border border-rose-100 font-black">سجل تعثر</span>}
                                    </div>
                                </td>
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
          <LoanForm initialData={editingLoan} onSubmit={handleFormSubmit} onCancel={() => { setIsFormModalOpen(false); setEditingLoan(null); }} employees={initialEmployees} loans={loans} />
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
