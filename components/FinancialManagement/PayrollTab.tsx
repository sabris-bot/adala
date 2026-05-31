import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Users, 
    Calculator, 
    ShieldCheck, 
    DollarSign, 
    Plus, 
    Trash2, 
    Edit, 
    Printer, 
    FileText, 
    Download, 
    Clock, 
    AlertTriangle, 
    CheckCircle, 
    Search,
    PiggyBank,
    TrendingDown,
    Award
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { Badge } from '../ui/Badge';
import { useToast } from '../ui/Toast';

interface EmployeePayroll {
    id: string;
    nameAr: string;
    nameEn: string;
    roleAr: string;
    roleEn: string;
    basicSalary: number;
    allowances: number;
    deductions: number;
    advances: number;
    commissionRate: number; // as percentage
    commissionAmount: number;
    accruedDays: number;
    joinDate: string;
    pensionDeduction: number; // standard Kuwait 7% (citizen employee) or 0
    calculatedNet: number;
    status: 'draft' | 'pending' | 'approved' | 'paid';
}

interface LoansTracker {
    id: string;
    employeeNameAr: string;
    employeeNameEn: string;
    totalAmount: number;
    remainingAmount: number;
    monthlyInstallment: number;
    startDate: string;
    status: 'active' | 'suspended' | 'fully_paid';
}

interface PayrollTabProps {
    formatCurrency: (amount: number, currency?: string) => string;
    isAr?: boolean;
}

export const PayrollTab: React.FC<PayrollTabProps> = ({ formatCurrency, isAr = true }) => {
    const { addToast } = useToast();

    // 1. Employee Payroll States
    const [employees, setEmployees] = useState<EmployeePayroll[]>([
        {
            id: 'emp-101',
            nameAr: 'المستشار صبري شطا',
            nameEn: 'Consultant Sabri Shata',
            roleAr: 'كبير المستشارين القانونيين',
            roleEn: 'Chief Legal Consultant',
            basicSalary: 2800,
            allowances: 450,
            deductions: 0,
            advances: 0,
            commissionRate: 5,
            commissionAmount: 350,
            accruedDays: 30,
            joinDate: '2018-01-15',
            pensionDeduction: 0,
            calculatedNet: 3600,
            status: 'paid'
        },
        {
            id: 'emp-102',
            nameAr: 'المحامي فهد الرشيدي',
            nameEn: 'Lawyer Fahad Al-Rashidi',
            roleAr: 'مدير قسم المرافعة الكلية',
            roleEn: 'Head of Litigation',
            basicSalary: 1800,
            allowances: 300,
            deductions: 50,
            advances: 200,
            commissionRate: 10,
            commissionAmount: 480,
            accruedDays: 30,
            joinDate: '2020-03-01',
            pensionDeduction: 126, // 1800 * 7% Kuwaiti Pension
            calculatedNet: 2204,
            status: 'approved'
        },
        {
            id: 'emp-103',
            nameAr: 'المحامية فاطمة علي',
            nameEn: 'Lawyer Fatima Ali',
            roleAr: 'محامية تمييز واستئناف',
            roleEn: 'Appeals & Cassation Lawyer',
            basicSalary: 1600,
            allowances: 250,
            deductions: 0,
            advances: 0,
            commissionRate: 5,
            commissionAmount: 160,
            accruedDays: 30,
            joinDate: '2021-06-10',
            pensionDeduction: 112,
            calculatedNet: 1898,
            status: 'approved'
        },
        {
            id: 'emp-104',
            nameAr: 'السيد أحمد المحاسب',
            nameEn: 'Mr. Ahmed Accountant',
            roleAr: 'رئيس الشؤون المالية والتدقيق',
            roleEn: 'Chief Financial Officer',
            basicSalary: 1200,
            allowances: 150,
            deductions: 40,
            advances: 0,
            commissionRate: 0,
            commissionAmount: 0,
            accruedDays: 30,
            joinDate: '2019-11-01',
            pensionDeduction: 0,
            calculatedNet: 1310,
            status: 'pending'
        }
    ]);

    // 2. Loans Tracker States
    const [loans, setLoans] = useState<LoansTracker[]>([
        {
            id: 'loan-01',
            employeeNameAr: 'المحامي فهد الرشيدي',
            employeeNameEn: 'Fahad Al-Rashidi',
            totalAmount: 3000,
            remainingAmount: 1200,
            monthlyInstallment: 200,
            startDate: '2024-01-01',
            status: 'active'
        },
        {
            id: 'loan-02',
            employeeNameAr: 'السيد أحمد المحاسب',
            employeeNameEn: 'Ahmed Accountant',
            totalAmount: 1000,
            remainingAmount: 0,
            monthlyInstallment: 100,
            startDate: '2023-05-15',
            status: 'fully_paid'
        }
    ]);

    // Payroll and EOS Calculator states
    const [selectedEmployeeForPayslip, setSelectedEmployeeForPayslip] = useState<EmployeePayroll | null>(null);
    const [selectedEmployeeForEOS, setSelectedEmployeeForEOS] = useState<EmployeePayroll | null>(null);
    const [eosYears, setEosYears] = useState<number>(0);
    const [eosMonths, setEosMonths] = useState<number>(0);
    const [eosPayout, setEosPayout] = useState<number>(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingEmployee, setEditingEmployee] = useState<EmployeePayroll | null>(null);
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

    // New employee template
    const [empForm, setEmpForm] = useState<Partial<EmployeePayroll>>({
        id: '',
        nameAr: '',
        nameEn: '',
        roleAr: '',
        roleEn: '',
        basicSalary: 1000,
        allowances: 100,
        deductions: 0,
        advances: 0,
        commissionRate: 0,
        commissionAmount: 0,
        accruedDays: 30,
        joinDate: new Date().toISOString().split('T')[0],
        pensionDeduction: 0,
        status: 'draft'
    });

    // 3. Automatic calculations dynamically updated
    const calculateNetPay = (emp: Partial<EmployeePayroll>) => {
        const salary = Number(emp.basicSalary) || 0;
        const allow = Number(emp.allowances) || 0;
        const ded = Number(emp.deductions) || 0;
        const adv = Number(emp.advances) || 0;
        const comm = Number(emp.commissionAmount) || 0;
        const pens = Number(emp.pensionDeduction) || 0;
        const daysFactor = (Number(emp.accruedDays) || 30) / 30;
        
        return Math.max(0, parseFloat(((salary * daysFactor) + allow + comm - ded - adv - pens).toFixed(3)));
    };

    const handleSaveEmployee = () => {
        if (!empForm.nameAr || !empForm.nameEn) {
            addToast({
                type: 'error',
                title: isAr ? 'خطأ في التثبيت' : 'Validation Error',
                message: isAr ? 'الرجاء إدخال اسم الموظف باللغتين العربية والإنجليزية' : 'Please enter employee name in both languages'
            });
            return;
        }

        const calculatedNet = calculateNetPay(empForm);
        const resolvedEmpForm = { 
            ...empForm, 
            calculatedNet,
            pensionDeduction: empForm.pensionDeduction || 0 
        } as EmployeePayroll;

        if (editingEmployee) {
            setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? resolvedEmpForm : e));
            addToast({
                type: 'success',
                title: isAr ? 'تم تحديث البيانات' : 'Employee Redirection Successful',
                message: isAr ? 'تم تعديل ومعالجة مسير الرواتب بنجاح.' : 'Employee modifications saved successfully.'
            });
        } else {
            const entry = {
                ...resolvedEmpForm,
                id: `emp-${Date.now()}`
            };
            setEmployees(prev => [entry, ...prev]);
            addToast({
                type: 'success',
                title: isAr ? 'تمت الإضافة' : 'Employee Created',
                message: isAr ? 'تم إدراج الموظف وتفعيل مسيره المالي.' : 'Employee payroll record has been initialized.'
            });
        }
        setIsEmployeeModalOpen(false);
        setEditingEmployee(null);
    };

    // Calculate End of Service (EOS) Indemnity according to Kuwait Labor Law
    const runEosCalculation = (employee: EmployeePayroll) => {
        const join = new Date(employee.joinDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - join.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalYears = diffDays / 365.25;
        
        const years = Math.floor(totalYears);
        const months = Math.floor((totalYears - years) * 12);
        
        setEosYears(years);
        setEosMonths(months);

        // Kuwait Private Sector Law standard calculations:
        // First 5 years: 15 days' salary for each year
        // Beyond 5 years: 30 days' salary for each year
        // Daily rate = monthly salary / 26 days (per law)
        const dailyRate = (employee.basicSalary + employee.allowances) / 26;
        let totalPayout = 0;

        if (totalYears <= 5) {
            totalPayout = totalYears * 15 * dailyRate;
        } else {
            const firstSegment = 5 * 15 * dailyRate;
            const secondSegment = (totalYears - 5) * 30 * dailyRate;
            totalPayout = firstSegment + secondSegment;
        }

        // Clip to maximum allowed by Kuwaiti law (1.5 years of gross salary)
        const maxLimit = (employee.basicSalary + employee.allowances) * 18;
        if (totalPayout > maxLimit) {
            totalPayout = maxLimit;
        }

        setEosPayout(parseFloat(totalPayout.toFixed(3)));
        setSelectedEmployeeForEOS(employee);
    };

    const handleLoanRequest = (emp: EmployeePayroll, amount: number, installment: number) => {
        if (amount <= 0 || installment <= 0) return;
        
        const newLoan: LoansTracker = {
            id: `loan-${Date.now()}`,
            employeeNameAr: emp.nameAr,
            employeeNameEn: emp.nameEn,
            totalAmount: amount,
            remainingAmount: amount,
            monthlyInstallment: installment,
            startDate: new Date().toISOString().split('T')[0],
            status: 'active'
        };

        setLoans(prev => [newLoan, ...prev]);
        addToast({
            type: 'success',
            title: isAr ? 'القرض معتمد لغوياً' : 'Loan Agreement Authorized',
            message: isAr ? `تم تسجيل قرض للمستفيد بقيمة ${formatCurrency(amount)}` : `Authorized loan of ${formatCurrency(amount)}`
        });
    };

    const triggerBulkPay = () => {
        setEmployees(prev => prev.map(e => e.status === 'approved' ? { ...e, status: 'paid' } : e));
        addToast({
            type: 'success',
            title: isAr ? 'دفع جماعي مستكمل' : 'Automated Bank Wire Dispatched',
            message: isAr ? 'تم صرف الدفوعات وتثبيت قيود الرواتب بدفتر اليومية.' : 'Paid approved salaries and updated the general ledger.'
        });
    };

    const filtered = useMemo(() => {
        return employees.filter(e => {
            const term = searchQuery.toLowerCase();
            return e.nameAr.toLowerCase().includes(term) || 
                   e.nameEn.toLowerCase().includes(term) ||
                   e.roleAr.toLowerCase().includes(term) ||
                   e.roleEn.toLowerCase().includes(term);
        });
    }, [employees, searchQuery]);

    return (
        <div className="space-y-8 text-right" dir={isAr ? 'rtl' : 'ltr'}>
            
            {/* Action panel header */}
            <div className="bg-white dark:bg-dm-card p-6 md:p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-850 dark:text-white flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" />
                        {isAr ? 'مسير الرواتب والميزانية العمالية المحاسبية' : 'Salary Payroll & Labor Budget Book'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        {isAr ? 'حساب رواتب الموظفين والمصالح والخصومات والتأمينات وفقاً لقانون العمل الكويتي والبدلات التكافلية.' : 'Integrative payroll auditing, legal commissions, pension deductions and advances according to Kuwaiti labor guidelines.'}
                    </p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <Button 
                        variant="primary" 
                        leftIcon={<Plus className="w-4 h-4" />}
                        className="rounded-xl px-5 py-2.5 text-xs font-bold"
                        onClick={() => {
                            setEditingEmployee(null);
                            setEmpForm({
                                id: '',
                                nameAr: '',
                                nameEn: '',
                                roleAr: '',
                                roleEn: '',
                                basicSalary: 1000,
                                allowances: 150,
                                deductions: 0,
                                advances: 0,
                                commissionRate: 5,
                                commissionAmount: 0,
                                accruedDays: 30,
                                joinDate: new Date().toISOString().split('T')[0],
                                pensionDeduction: 0,
                                status: 'draft'
                            });
                            setIsEmployeeModalOpen(true);
                        }}
                    >
                        {isAr ? 'تسجيل موظف جديد' : 'New Employee Entry'}
                    </Button>
                    <Button 
                        variant="accent"
                        leftIcon={<CheckCircle className="w-4 h-4" />}
                        className="rounded-xl px-5 py-2.5 text-xs font-black"
                        onClick={triggerBulkPay}
                    >
                        {isAr ? 'تثبيت وصرف الرواتب المعتمدة' : 'Wire Approved Payroll Batch'}
                    </Button>
                </div>
            </div>

            {/* Main view split: Wages table and Calculations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Employee Salaries Management Grid */}
                <Card className="p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="text-md font-bold text-slate-800 dark:text-white">{isAr ? 'سجل الموظفين والبدلات' : 'Employee Registry & Entitlements'}</h4>
                        <div className="relative w-48">
                            <input 
                                type="text"
                                placeholder={isAr ? 'ابحث...' : 'Search...'}
                                className="w-full text-xs bg-slate-50 dark:bg-dm-background px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-800 focus:outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black text-slate-400">
                                    <th className="py-3 px-2">{isAr ? 'الموظف / الدور' : 'Employee / Role'}</th>
                                    <th className="py-3 px-2">{isAr ? 'الراتب الأساسي' : 'Basic Pay'}</th>
                                    <th className="py-3 px-2">{isAr ? 'العمولات / البدلات' : 'Allowances/Comm.'}</th>
                                    <th className="py-3 px-2 text-rose-500">{isAr ? 'الخصومات / السلف' : 'Deductions'}</th>
                                    <th className="py-3 px-2 text-emerald-600">{isAr ? 'صافي الراتب' : 'Net Salary'}</th>
                                    <th className="py-3 px-2 text-center">{isAr ? 'العمليات' : 'Operation'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                                {filtered.map(emp => (
                                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 text-xs">
                                        <td className="py-3.5 px-2">
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-dm-text">{isAr ? emp.nameAr : emp.nameEn}</p>
                                                <p className="text-[10px] text-slate-400 font-medium">{isAr ? emp.roleAr : emp.roleEn}</p>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-2 font-mono">{formatCurrency(emp.basicSalary)}</td>
                                        <td className="py-3.5 px-2 font-mono text-emerald-500">
                                            +{formatCurrency(emp.allowances + emp.commissionAmount)}
                                        </td>
                                        <td className="py-3.5 px-2 font-mono text-rose-500">
                                            -{formatCurrency(emp.deductions + emp.advances + (emp.pensionDeduction || 0))}
                                        </td>
                                        <td className="py-3.5 px-2 font-mono text-indigo-600 dark:text-primary-light font-black">
                                            {formatCurrency(emp.calculatedNet)}
                                        </td>
                                        <td className="py-3.5 px-2 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button 
                                                    className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg text-indigo-600"
                                                    title={isAr ? 'أرشفة قسيمة الراتب' : 'View Payslip'}
                                                    onClick={() => setSelectedEmployeeForPayslip(emp)}
                                                >
                                                    <FileText className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    className="p-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg text-emerald-600"
                                                    title={isAr ? 'مستحقات نهاية الخدمة' : 'Indemnity calculative assessment'}
                                                    onClick={() => runEosCalculation(emp)}
                                                >
                                                    <Calculator className="w-3.5 h-3.5" />
                                                </button>
                                                <button 
                                                    className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg text-amber-500"
                                                    title={isAr ? 'تعديل السلم الراتبي' : 'Update wages rate'}
                                                    onClick={() => {
                                                        setEditingEmployee(emp);
                                                        setEmpForm(emp);
                                                        setIsEmployeeModalOpen(true);
                                                    }}
                                                >
                                                    <Edit className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Right hand Panel: Advanced Kuwait EOS & Loan Center */}
                <div className="space-y-6">
                    {/* Kuwait Labor Law End-of-Service calculator */}
                    <Card className="p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                            <PiggyBank className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-bold text-sm">{isAr ? 'حاسبة نهاية الخدمة وفق القانون الكويتي' : 'Kuwait Civil EOS Indemnity'}</h4>
                        </div>
                        <p className="text-[10px] text-slate-400">
                            {isAr ? 'يحسب مكافأة التقاعد والتسويات النهائية للحقوق العمالية (القطاع الأهلي - المادة 51/2010).' : 'Calculates end of service remuneration for expatriates or Kuwaiti assets based on standard legal multipliers (Law 6/2010).'}
                        </p>

                        {selectedEmployeeForEOS ? (
                            <div className="bg-slate-50 dark:bg-dm-background p-4 rounded-xl border border-slate-100 dark:border-slate-850 space-y-3.5 animate-in fade-in">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400 font-bold">{isAr ? 'الموظف المحدد:' : 'Employee:'}</span>
                                    <span className="font-bold text-slate-800 dark:text-white">{isAr ? selectedEmployeeForEOS.nameAr : selectedEmployeeForEOS.nameEn}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs border-t border-slate-100 dark:border-gray-800 pt-2">
                                    <span className="text-slate-400">{isAr ? 'تاريخ التعيين:' : 'Join Date:'}</span>
                                    <span className="font-mono font-bold">{selectedEmployeeForEOS.joinDate}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-400">{isAr ? 'إجمالي سنوات الخدمة:' : 'Years of service:'}</span>
                                    <span className="font-bold text-neutral-dark dark:text-primary-light font-mono">
                                        {eosYears} {isAr ? 'سنة و' : 'Y &'} {eosMonths} {isAr ? 'أشهر' : 'M'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-t border-dashed border-slate-200 dark:border-gray-800 pt-3">
                                    <span className="text-indigo-600 text-xs font-black">{isAr ? 'المكافأة المحتسبة:' : 'Indemnity Due:'}</span>
                                    <span className="font-mono text-lg font-black text-indigo-600 dark:text-primary-light">{formatCurrency(eosPayout)}</span>
                                </div>
                                <Button 
                                    size="sm" 
                                    fullWidth
                                    variant="outline"
                                    className="text-[10px] font-bold"
                                    leftIcon={<Printer className="w-3.5 h-3.5" />}
                                    onClick={() => alert(isAr ? 'جاري طباعة استمارة التسوية العمالية المختومة والنهائية...' : 'Spooling authorized exit settlement format...')}
                                >
                                    {isAr ? 'طباعة استمارة تسوية نهائية' : 'Print Final Indemnity Remuneration'}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <Calculator className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-[11px] text-slate-400">{isAr ? 'اضغط على زر الحاسبة بجوار أي موظف لتوطين مستحقاته فورياً.' : 'Press calculator icon of any employee to load instant legal exit metrics.'}</p>
                            </div>
                        )}
                    </Card>

                    {/* Salary Loans and Advances Management */}
                    <Card className="p-6 md:p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl space-y-4">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-white">
                            <TrendingDown className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-bold text-sm">{isAr ? 'منظومة السلف وتصفية الديون العمالية' : 'Loans and Advance Clearing'}</h4>
                        </div>
                        
                        <div className="divide-y divide-slate-100 dark:divide-slate-850">
                            {loans.map(loan => (
                                <div key={loan.id} className="py-3 flex justify-between items-center text-xs">
                                    <div>
                                        <p className="font-bold text-slate-800 dark:text-dm-text">{isAr ? loan.employeeNameAr : loan.employeeNameEn}</p>
                                        <p className="text-[9px] text-slate-400 font-mono">
                                            {isAr ? `تاريخ البدء: ${loan.startDate}` : `Started: ${loan.startDate}`}
                                        </p>
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black text-slate-800 dark:text-white font-mono">
                                            {formatCurrency(loan.remainingAmount)} / {formatCurrency(loan.totalAmount)}
                                        </p>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                            loan.status === 'active' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-105 text-slate-400 bg-slate-100'
                                        }`}>
                                            {loan.status === 'active' ? (isAr ? 'نشط' : 'Active') : (isAr ? 'تم السداد بالكامل' : 'Paid')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Individual Payslip Official overlay template modal */}
            <AnimatePresence>
                {selectedEmployeeForPayslip && (
                    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/65 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <motion.div 
                            initial={{ scale: 0.96, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.96, opacity: 0 }}
                            className="bg-white dark:bg-dm-card rounded-[36px] max-w-2xl w-full p-8 md:p-10 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="border-b-2 border-slate-100 dark:border-gray-800 pb-4 text-center">
                                <h3 className="text-xl font-black text-indigo-600">{isAr ? 'كشف راتب تفصيلي معتمد ومختوم' : 'Certified Official Salary Payslip'}</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ref ID: SLS-{selectedEmployeeForPayslip.id}-{new Date().getFullYear()}</p>
                            </div>

                            {/* Slip Document Body */}
                            <div className="border-4 border-double border-slate-100 dark:border-gray-800 p-6 md:p-8 space-y-6 bg-slate-50/20 rounded-2xl">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-md font-black text-slate-850">{isAr ? 'عدالة للخدمات القانونية الكبرى' : 'Adala Central Juristic Law'}</h2>
                                        <p className="text-[9px] text-slate-400">{isAr ? 'الكويت - برج الصفاة المركزي - ميزانين' : 'Kuwait, Al-Safat Court Plaza, M-level'}</p>
                                        <p className="text-[9px] text-slate-400">{isAr ? 'الرقم الضريبي والترخيص: 5543-9822' : 'License CR No: 5543-9822'}</p>
                                    </div>
                                    <div className="text-left font-mono text-[9px] text-slate-400">
                                        <p>{isAr ? 'التاريخ المرجعي:' : 'Date Issued:'} {new Date().toLocaleDateString('en-GB')}</p>
                                        <p>{isAr ? 'طريقة الصرف: تحويل بنكي الكتروني' : 'Method: Direct Bank Wire Setup'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs pt-4 border-t border-slate-100 dark:border-gray-800">
                                    <div>
                                        <span className="text-slate-400 block">{isAr ? 'اسم المستحق واللقب:' : 'Employee Name:'}</span>
                                        <span className="font-bold text-slate-800">{isAr ? selectedEmployeeForPayslip.nameAr : selectedEmployeeForPayslip.nameEn}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block">{isAr ? 'الوصف المهني والدرجة:' : 'Title/Grade:'}</span>
                                        <span className="font-bold text-slate-800">{isAr ? selectedEmployeeForPayslip.roleAr : selectedEmployeeForPayslip.roleEn}</span>
                                    </div>
                                </div>

                                {/* Financial break-downs */}
                                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-gray-800">
                                    <div className="space-y-2 text-xs">
                                        <h5 className="font-bold text-emerald-600 border-b border-emerald-100 pb-1">{isAr ? 'العوائد الإيجابية والبدلات' : 'Credits & Allowances'}</h5>
                                        <div className="flex justify-between">
                                            <span>{isAr ? 'الراتب الأساسي:' : 'Basic Pay:'}</span>
                                            <span className="font-mono font-bold">+{formatCurrency(selectedEmployeeForPayslip.basicSalary)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{isAr ? 'بدل الانتقال والسكن الكويتي:' : 'Allowances/House:'}</span>
                                            <span className="font-mono font-bold">+{formatCurrency(selectedEmployeeForPayslip.allowances)}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-500 font-bold">
                                            <span>{isAr ? 'العمولات التشغيلية وقضايا:' : 'Juristic Commissions:'}</span>
                                            <span className="font-mono">+{formatCurrency(selectedEmployeeForPayslip.commissionAmount)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <h5 className="font-bold text-rose-500 border-b border-rose-100 pb-1">{isAr ? 'الخصوم والاستقطاعات والضمان' : 'Debits & Deductions'}</h5>
                                        <div className="flex justify-between">
                                            <span>{isAr ? 'الخصومات التأديبية / العقوبات:' : 'Deductive Penalties:'}</span>
                                            <span className="font-mono font-bold text-rose-500">-{formatCurrency(selectedEmployeeForPayslip.deductions)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>{isAr ? 'سداد قسط السلفة الشهري:' : 'Loan Repayments:'}</span>
                                            <span className="font-mono font-bold text-rose-500">-{formatCurrency(selectedEmployeeForPayslip.advances)}</span>
                                        </div>
                                        <div className="flex justify-between text-rose-500 font-bold">
                                            <span>{isAr ? 'استقطاع هيئة ديوان التأمينات:' : 'Pension Social Security:'}</span>
                                            <span className="font-mono">-{formatCurrency(selectedEmployeeForPayslip.pensionDeduction)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm font-black pt-4 border-t-2 border-indigo-100 dark:border-gray-800">
                                    <span className="text-slate-800">{isAr ? 'صافي المبلغ المحول للبنك:' : 'Net Payroll Wire:'}</span>
                                    <span className="font-mono text-lg text-indigo-600 dark:text-primary-light">{formatCurrency(selectedEmployeeForPayslip.calculatedNet)}</span>
                                </div>

                                <div className="flex justify-between items-end pt-8 font-serif opacity-70">
                                    <div className="text-[9px]">
                                        <p>{isAr ? 'توقيع معتمد للشؤون المالية' : 'Authorized CFO Seal'}</p>
                                        <div className="w-24 h-px bg-slate-300 mt-3" />
                                    </div>
                                    <div className="text-[9px] relative text-center">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-double border-indigo-600/25 flex items-center justify-center font-black rotate-12 text-[10px] text-indigo-600">عدالة</div>
                                        <p className="mt-8">{isAr ? 'الختم الرسمي للمؤسسة' : 'Central Firm Stamp'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2.5">
                                <Button 
                                    variant="outline" 
                                    className="rounded-xl px-5 text-xs font-bold"
                                    leftIcon={<Printer className="w-4 h-4" />}
                                    onClick={() => window.print()}
                                >
                                    {isAr ? 'طباعة قسيمة الراتب' : 'Print Payslip Voucher'}
                                </Button>
                                <Button 
                                    className="rounded-xl px-5 text-xs font-bold"
                                    onClick={() => setSelectedEmployeeForPayslip(null)}
                                >
                                    {isAr ? 'إغلاق الكشف' : 'Close Document'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Custom Modal for Adding or Editing Employee سلم الرواتب */}
            <AnimatePresence>
                {isEmployeeModalOpen && (
                    <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/65 flex items-center justify-center p-4 z-50 animate-in fade-in">
                        <motion.div 
                            initial={{ scale: 0.97, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.97, opacity: 0 }}
                            className="bg-white dark:bg-dm-card rounded-[32px] max-w-xl w-full p-8 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-6"
                        >
                            <div className="border-b border-slate-100 dark:border-gray-800 pb-3">
                                <h3 className="text-lg font-black text-slate-850 dark:text-white">
                                    {editingEmployee ? (isAr ? 'تعديل السلم الراتبي والبدلات' : 'Edit Wages & Contract Base') : (isAr ? 'إدراج موظف وميثاق راتبي جديد' : 'New Personnel Wage Definition')}
                                </h3>
                                <p className="text-xs text-slate-400">{isAr ? 'حدد الراتب والقيمة المقتطعة للتأمينات وعقود العمولة القضائية.' : 'Specify salaries, pension coefficients and litigation commissions.'}</p>
                            </div>

                            <div className="space-y-4 text-xs font-bold text-slate-600 dark:text-slate-350">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'الاسم بالكامل (عربي)' : 'Full Name (AR)'}</label>
                                        <Input 
                                            value={empForm.nameAr}
                                            onChange={(e) => setEmpForm({...empForm, nameAr: e.target.value})}
                                            placeholder="أحمد يوسف الصالح"
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'الاسم بالكامل (إنجليزي)' : 'Full Name (EN)'}</label>
                                        <Input 
                                            value={empForm.nameEn}
                                            onChange={(e) => setEmpForm({...empForm, nameEn: e.target.value})}
                                            placeholder="Ahmed Youssef Al-Saleh"
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'المسمى الوظيفي (عربي)' : 'Title (AR)'}</label>
                                        <Input 
                                            value={empForm.roleAr}
                                            onChange={(e) => setEmpForm({...empForm, roleAr: e.target.value})}
                                            placeholder="مستشار تمثيل جنائي"
                                            className="rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'المسمى الوظيفي (إنجليزي)' : 'Title (EN)'}</label>
                                        <Input 
                                            value={empForm.roleEn}
                                            onChange={(e) => setEmpForm({...empForm, roleEn: e.target.value})}
                                            placeholder="Criminal Litigation Advisor"
                                            className="rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 border-t border-slate-50 dark:border-gray-800 pt-4">
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'الراتب الأساسي' : 'Basic Salary'}</label>
                                        <Input 
                                            type="number"
                                            value={empForm.basicSalary?.toString()}
                                            onChange={(e) => setEmpForm({...empForm, basicSalary: parseFloat(e.target.value) || 0})}
                                            className="rounded-xl font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'البدلات والضيافة' : 'Allowances'}</label>
                                        <Input 
                                            type="number"
                                            value={empForm.allowances?.toString()}
                                            onChange={(e) => setEmpForm({...empForm, allowances: parseFloat(e.target.value) || 0})}
                                            className="rounded-xl font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5">{isAr ? 'الحصة الخدمية المعقودة' : 'Paid Days'}</label>
                                        <Input 
                                            type="number"
                                            value={empForm.accruedDays?.toString()}
                                            onChange={(e) => setEmpForm({...empForm, accruedDays: parseInt(e.target.value) || 30})}
                                            className="rounded-xl font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 pt-2">
                                    <div>
                                        <label className="block mb-1.5 text-rose-500">{isAr ? 'الخصومات والعقوبات' : 'Deductive Penalties'}</label>
                                        <Input 
                                            type="number"
                                            value={empForm.deductions?.toString()}
                                            onChange={(e) => setEmpForm({...empForm, deductions: parseFloat(e.target.value) || 0})}
                                            className="rounded-xl font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5 text-rose-500">{isAr ? 'قسط الائتمان وسلليات' : 'Salary Advances'}</label>
                                        <Input 
                                            type="number"
                                            value={empForm.advances?.toString()}
                                            onChange={(e) => setEmpForm({...empForm, advances: parseFloat(e.target.value) || 0})}
                                            className="rounded-xl font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5 text-rose-500">{isAr ? 'تأمينات كويتية (7%)' : 'Kuwaiti Pension Deductions'}</label>
                                        <Input 
                                            type="number"
                                            value={empForm.pensionDeduction?.toString()}
                                            onChange={(e) => setEmpForm({...empForm, pensionDeduction: parseFloat(e.target.value) || 0})}
                                            className="rounded-xl font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <label className="block mb-1.5 text-emerald-500">{isAr ? 'رابط العمولة المباشرة (%)' : 'Case Commission (%)'}</label>
                                        <Input 
                                            type="number"
                                            value={empForm.commissionRate?.toString()}
                                            onChange={(e) => setEmpForm({...empForm, commissionRate: parseFloat(e.target.value) || 0})}
                                            className="rounded-xl font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-1.5 text-emerald-500">{isAr ? 'قيمة ميزان عمولاته كاش' : 'Earned Commission'}</label>
                                        <Input 
                                            type="number"
                                            value={empForm.commissionAmount?.toString()}
                                            onChange={(e) => setEmpForm({...empForm, commissionAmount: parseFloat(e.target.value) || 0})}
                                            className="rounded-xl font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-gray-800">
                                <Button 
                                    variant="outline" 
                                    className="rounded-xl px-5 text-xs font-bold"
                                    onClick={() => {
                                        setIsEmployeeModalOpen(false);
                                        setEditingEmployee(null);
                                    }}
                                >
                                    {isAr ? 'إلغاء الأمر' : 'Cancel'}
                                </Button>
                                <Button 
                                    variant="primary" 
                                    className="rounded-xl px-6 text-xs font-black shadow-lg shadow-indigo-600/15"
                                    onClick={handleSaveEmployee}
                                >
                                    {isAr ? 'رصف وحقن التعديلات الممثلة' : 'Save Salary Scale'}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
