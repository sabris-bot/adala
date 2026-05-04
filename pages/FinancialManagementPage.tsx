

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { FinancialTransactionTypeBadge } from '../components/ui/Badge';
import { 
    BanknotesIcon, PlusCircleIcon, PencilIcon, TrashIcon, FolderIcon, 
    ReceiptPercentIcon, UsersIcon, PrinterIcon, ArrowPathIcon, 
    TrendingUpIcon, TrendingDownIcon, ArrowDownTrayIcon, DocumentTextIcon,
    ClipboardListCheckIcon, ScaleIcon, HomeIcon, BriefcaseIcon,
    CurrencyDollarIcon, ChartBarIcon, CalculatorIcon
} from '../constants';
import { FinancialTransaction, FinancialTransactionType, PaymentMethod, ExpenseCategory, PurchaseCategory, Case, RentPayment, RentPaymentStatus } from '../types';
import { 
    financialTransactionTypeOptions, paymentMethodOptions, expenseCategoryOptions, purchaseCategoryOptions, 
    currencyOptions, financialEntityOptions
} from '../constants';

// Import mock data from other pages for linking
import { initialEmployees } from './EmployeeProfilePage'; 
import { initialCases } from '../data/caseData';
import { mockRentPayments } from '../data/propertyData';

const mockAccountCodes = [ 
    { value: 'EXP-001', label: 'مصروفات إيجار المكتب (EXP-001)'},
    { value: 'EXP-002', label: 'فواتير الاتصالات والإنترنت (EXP-002)'},
    { value: 'EXP-003', label: 'قرطاسية ومستلزمات (EXP-003)'},
    { value: 'PUR-001', label: 'أصول ثابتة - حواسب (PUR-001)'},
    { value: 'REV-001', label: 'أتعاب استشارات قانونية (REV-001)'},
    { value: 'REV-002', label: 'أتعاب ترافع قضايا (REV-002)'},
    { value: 'REV-003', label: 'إيرادات إدارة عقارات (REV-003)'},
    { value: 'SAL-001', label: 'مصروفات الرواتب (SAL-001)'},
];

const mockEmployeesForFinance = initialEmployees.map(emp => ({
  id: emp.id,
  name: emp.fullNameAr,
}));

const mockCasesForFinance = initialCases.map(c => ({
  id: c.id,
  title: c.title,
  caseNumber: c.caseNumber,
}));

// Function to convert Rent Payments to Financial Transactions for integration display
const integrateRentToTransactions = (rentPayments: RentPayment[]): FinancialTransaction[] => {
    return rentPayments.map(rp => ({
        id: `integrated-rent-${rp.id}`,
        transactionDate: rp.paymentDate || rp.dueDate,
        type: FinancialTransactionType.REVENUE,
        description: `تحصيل إيجار - فترة: ${rp.paymentForPeriod}`,
        amount: rp.amountPaid,
        currency: 'KWD',
        paymentMethod: rp.paymentMethod || PaymentMethod.KNET,
        category: 'إيراد عقارات',
        relatedToEntity: 'property',
        relatedEntityId: rp.leaseAgreementId,
        recordedBy: 'نظام العقارات التلقائي',
        createdAt: rp.recordedAt || new Date().toISOString()
    }));
};

export const mockFinancialTransactions: FinancialTransaction[] = [ 
  {
    id: 'ft1',
    transactionDate: '2024-07-28',
    type: FinancialTransactionType.EXPENSE,
    description: 'دفع إيجار مكتب شهر يوليو 2024',
    amount: -750, 
    currency: 'KWD',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    category: ExpenseCategory.RENT,
    vendorOrPayee: 'شركة إدارة العقارات المتحدة',
    invoiceNumber: 'INV-RENT-2024-07',
    accountCode: 'EXP-001',
    isRecurring: true,
    recurrenceDetails: 'شهري، يستحق في اليوم الأول من كل شهر',
    notes: 'تم التحويل من حساب الشركة الرئيسي.',
    recordedBy: 'المحاسب',
    createdAt: '2024-07-28',
  },
  {
    id: 'ft2',
    transactionDate: '2024-07-25',
    type: FinancialTransactionType.PURCHASE,
    description: 'شراء جهاز كمبيوتر محمول جديد للموظف علي محمد جاسم',
    amount: -450,
    currency: 'KWD',
    paymentMethod: PaymentMethod.CREDIT_CARD,
    category: PurchaseCategory.OFFICE_EQUIPMENT,
    vendorOrPayee: 'شركة الأجهزة الحديثة',
    invoiceNumber: 'INV-LAP-00123',
    relatedToEntity: 'employee',
    relatedEntityId: 'emp-003', 
    relatedEntityName: mockEmployeesForFinance.find(e=>e.id === 'emp-003')?.name || 'علي محمد جاسم',
    accountCode: 'PUR-001',
    attachments: [{id:'att-lap', name:'فاتورة شراء لابتوب.pdf', uploadedAt:'2024-07-25'}],
    recordedBy: 'مدير المشتريات',
    createdAt: '2024-07-25',
  },
  {
    id: 'ft3', 
    transactionDate: '2024-07-30',
    type: FinancialTransactionType.SALARY_PAYMENT,
    description: `راتب شهر يوليو 2024 للموظف أحمد محمود`,
    amount: -1250,
    currency: 'KWD',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    employeeId: 'emp-001',
    relatedToEntity: 'employee',
    relatedEntityId: 'emp-001',
    relatedEntityName: 'أحمد محمود مبارك',
    accountCode: 'SAL-001',
    notes: 'شامل الراتب الأساسي والبدلات.',
    recordedBy: 'مسؤول الرواتب',
    createdAt: '2024-07-30',
  },
  {
    id: 'ft4',
    transactionDate: '2024-07-15',
    type: FinancialTransactionType.REVENUE,
    description: `أتعاب القضية رقم CML-2024-101 - دفعة أولى`,
    amount: 1500, 
    currency: 'KWD',
    paymentMethod: PaymentMethod.CHEQUE,
    category: 'أتعاب قانونية',
    relatedToEntity: 'case',
    relatedEntityId: '1',
    relatedEntityName: 'مطالبة بتعويضات',
    invoiceNumber: 'INV-CASE-101-01',
    accountCode: 'REV-001',
    recordedBy: 'المحاسب',
    createdAt: '2024-07-15',
  },
  {
    id: 'ft5',
    transactionDate: '2024-08-01',
    type: FinancialTransactionType.EXPENSE,
    description: 'فاتورة كهرباء شهر يوليو 2024',
    amount: -85.500,
    currency: 'KWD',
    paymentMethod: PaymentMethod.ONLINE_PAYMENT,
    category: ExpenseCategory.UTILITIES,
    vendorOrPayee: 'وزارة الكهرباء والماء',
    invoiceNumber: 'MEW-JUL2024-123',
    accountCode: 'EXP-002',
    recordedBy: 'المحاسب',
    createdAt: '2024-08-01',
  },
  { id: 'ft6', transactionDate: '2024-06-15', type: FinancialTransactionType.REVENUE, description: 'أتعاب استشارة', amount: 800, currency: 'KWD', paymentMethod: PaymentMethod.BANK_TRANSFER, category: 'أتعاب قانونية', createdAt: '2024-06-15', recordedBy: 'المحاسب' },
  { id: 'ft7', transactionDate: '2024-06-20', type: FinancialTransactionType.EXPENSE, description: 'صيانة مكتب', amount: -120, currency: 'KWD', paymentMethod: PaymentMethod.CASH, category: ExpenseCategory.OFFICE_SUPPLIES, createdAt: '2024-06-20', recordedBy: 'المحاسب' },
  { id: 'ft8', transactionDate: '2024-08-05', type: FinancialTransactionType.EXPENSE, description: 'رسوم قضائية - قضية مطالبة', amount: -150, currency: 'KWD', paymentMethod: PaymentMethod.ONLINE_PAYMENT, category: ExpenseCategory.GOVERNMENT_FEES, relatedToEntity: 'case', relatedEntityId: '1',  createdAt: '2024-08-05', recordedBy: 'حاسبة الرسوم' },
];

// --- Components ---

const KPICard: React.FC<{ title: string; value: string; trend?: number; colorClass: string; icon: React.ReactElement<any> }> = ({ title, value, trend, colorClass, icon }) => (
    <div className={`p-4 rounded-xl border border-gray-100 bg-white dark:bg-dm-card shadow-sm flex items-start justify-between`}>
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</p>
            <h3 className={`text-2xl font-bold ${colorClass.replace('bg-', 'text-')}`}>{value}</h3>
            {trend !== undefined && (
                <div className={`flex items-center text-xs mt-2 font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend >= 0 ? <TrendingUpIcon className="w-3 h-3 me-1"/> : <TrendingDownIcon className="w-3 h-3 me-1"/>}
                    {Math.abs(trend)}% {trend >= 0 ? 'مقارنة بالشهر السابق' : 'مقارنة بالشهر السابق'}
                </div>
            )}
        </div>
        <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 text-opacity-100`}>
            {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 ${colorClass.replace('bg-', 'text-')}` })}
        </div>
    </div>
);

// --- Report Generation Helper ---
interface ReportSummary {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    expenseByCategory: Record<string, number>;
    revenueBySource: Record<string, number>;
}

const generateReportData = (transactions: FinancialTransaction[], startDate: Date, endDate: Date): ReportSummary => {
    const filtered = transactions.filter(t => {
        const d = new Date(t.transactionDate);
        return d >= startDate && d <= endDate;
    });

    const summary: ReportSummary = {
        totalIncome: 0,
        totalExpense: 0,
        netProfit: 0,
        expenseByCategory: {},
        revenueBySource: {}
    };

    filtered.forEach(t => {
        if (t.amount > 0) {
            summary.totalIncome += t.amount;
            const source = t.category || 'غير مصنف';
            summary.revenueBySource[source] = (summary.revenueBySource[source] || 0) + t.amount;
        } else {
            const amount = Math.abs(t.amount);
            summary.totalExpense += amount;
            const cat = t.category || 'مصروفات عامة';
            summary.expenseByCategory[cat] = (summary.expenseByCategory[cat] || 0) + amount;
        }
    });
    summary.netProfit = summary.totalIncome - summary.totalExpense;
    return summary;
};

// --- Report Modal ---
const FinancialReportModal: React.FC<{ isOpen: boolean; onClose: () => void; transactions: FinancialTransaction[] }> = ({ isOpen, onClose, transactions }) => {
    const [reportType, setReportType] = useState<'income_statement' | 'expense_analysis' | 'tax_report'>('income_statement');
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState(new Date().getMonth()); // 0-11

    if (!isOpen) return null;

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // Last day of month
    
    const reportData = generateReportData(transactions, startDate, endDate);

    const handlePrint = () => window.print();

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="التقارير المالية الدورية" size="lg">
            <div className="space-y-6 p-1">
                <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg print:hidden border border-gray-200">
                    <Select label="نوع التقرير" value={reportType} onChange={e => setReportType(e.target.value as any)} 
                        options={[
                            {value: 'income_statement', label: 'قائمة الدخل (الأرباح والخسائر)'},
                            {value: 'expense_analysis', label: 'تحليل المصروفات التفصيلي'},
                            {value: 'tax_report', label: 'التقرير الضريبي (مبسط)'}
                        ]}
                        containerClassName="mb-0 w-64"
                    />
                    <div className="flex gap-2">
                        <Select label="السنة" value={year} onChange={e => setYear(Number(e.target.value))} 
                            options={[2023, 2024, 2025].map(y => ({value: y, label: y.toString()}))} containerClassName="mb-0 w-32"
                        />
                        <Select label="الشهر" value={month} onChange={e => setMonth(Number(e.target.value))} 
                            options={Array.from({length: 12}, (_, i) => ({value: i, label: new Date(0, i).toLocaleString('ar-EG', {month: 'long'})}))} containerClassName="mb-0 w-32"
                        />
                    </div>
                </div>

                <div className="border p-8 bg-white text-black printable-content shadow-sm">
                    <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-primary-dark">
                            {reportType === 'income_statement' ? 'قائمة الدخل' : reportType === 'expense_analysis' ? 'تحليل المصروفات' : 'التقرير الضريبي'}
                        </h2>
                        <p className="text-gray-600 mt-1">
                            عن الفترة من {startDate.toLocaleDateString('ar-EG')} إلى {endDate.toLocaleDateString('ar-EG')}
                        </p>
                    </div>

                    {reportType === 'income_statement' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-bold text-green-700 text-lg border-b mb-2">الإيرادات</h3>
                                <table className="w-full text-sm">
                                    <tbody>
                                        {Object.entries(reportData.revenueBySource).map(([source, amount]) => (
                                            <tr key={source} className="border-b border-dashed">
                                                <td className="py-2">{source}</td>
                                                <td className="py-2 text-left font-mono">{amount.toFixed(3)}</td>
                                            </tr>
                                        ))}
                                        <tr className="font-bold bg-green-50">
                                            <td className="py-2">إجمالي الإيرادات</td>
                                            <td className="py-2 text-left">{reportData.totalIncome.toFixed(3)} د.ك</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-red-700 text-lg border-b mb-2">المصروفات</h3>
                                <table className="w-full text-sm">
                                    <tbody>
                                        {Object.entries(reportData.expenseByCategory).map(([cat, amount]) => (
                                            <tr key={cat} className="border-b border-dashed">
                                                <td className="py-2">{cat}</td>
                                                <td className="py-2 text-left font-mono">{amount.toFixed(3)}</td>
                                            </tr>
                                        ))}
                                        <tr className="font-bold bg-red-50">
                                            <td className="py-2">إجمالي المصروفات</td>
                                            <td className="py-2 text-left">{reportData.totalExpense.toFixed(3)} د.ك</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            <div className="mt-8 pt-4 border-t-2 border-black flex justify-between items-center text-xl font-bold">
                                <span>صافي الربح / (الخسارة)</span>
                                <span className={reportData.netProfit >= 0 ? 'text-green-700' : 'text-red-700'}>{reportData.netProfit.toFixed(3)} د.ك</span>
                            </div>
                        </div>
                    )}

                    {reportType === 'expense_analysis' && (
                        <div>
                            <table className="w-full text-sm border-collapse border border-gray-300">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border p-2 text-right">بند المصروف</th>
                                        <th className="border p-2 text-left">القيمة (د.ك)</th>
                                        <th className="border p-2 text-left">النسبة %</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(reportData.expenseByCategory).sort((a,b) => b[1] - a[1]).map(([cat, amount]) => {
                                        const percentage = reportData.totalExpense > 0 ? (amount / reportData.totalExpense) * 100 : 0;
                                        return (
                                            <tr key={cat}>
                                                <td className="border p-2">{cat}</td>
                                                <td className="border p-2 text-left">{amount.toFixed(3)}</td>
                                                <td className="border p-2 text-left flex items-center">
                                                     <div className="w-16 h-2 bg-gray-200 rounded-full me-2 overflow-hidden">
                                                        <div className="h-full bg-red-500" style={{width: `${percentage}%`}}></div>
                                                     </div>
                                                     {percentage.toFixed(1)}%
                                                </td>
                                            </tr>
                                        );
                                    })}
                                     <tr className="bg-gray-50 font-bold">
                                        <td className="border p-2">الإجمالي</td>
                                        <td className="border p-2 text-left">{reportData.totalExpense.toFixed(3)}</td>
                                        <td className="border p-2 text-left">100%</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                     {reportType === 'tax_report' && (
                        <div className="text-center py-10 text-gray-500">
                            <p>تقرير ضريبي مبسط يعرض صافي الدخل الخاضع للضريبة (إن وجد).</p>
                            <div className="mt-6 p-4 bg-gray-50 rounded border inline-block min-w-[300px]">
                                <p className="text-sm text-gray-600 mb-2">صافي الربح المحاسبي</p>
                                <p className="font-bold text-xl dir-ltr">{reportData.netProfit.toFixed(3)} KWD</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-4 print:hidden gap-2">
                    <Button variant="outline" onClick={onClose}>إغلاق</Button>
                    <Button onClick={handlePrint} leftIcon={<PrinterIcon className="w-4"/>}>طباعة التقرير</Button>
                    <Button variant="secondary" leftIcon={<ArrowDownTrayIcon className="w-4"/>}>تصدير Excel</Button>
                </div>
            </div>
        </Modal>
    );
};

// --- Printable Receipt Modal ---
const PrintableReceiptModal: React.FC<{ transaction: FinancialTransaction | null; onClose: () => void; }> = ({ transaction, onClose }) => {
    if (!transaction) return null;
    const isIncome = transaction.amount >= 0;
    const title = isIncome ? 'سند قبض' : 'سند صرف';
    const amountAbs = Math.abs(transaction.amount).toFixed(3);

    return (
        <Modal isOpen={!!transaction} onClose={onClose} title={`معاينة ${title}`} size="lg">
            <div id="printable-receipt" className="printable-sheet bg-white text-black min-h-[500px]">
                {/* Legal Print Header */}
                <div className="legal-print-header">
                    <div className="title-box">
                        <h1 className="text-2xl font-black text-primary">منظومة عدالة القانونية</h1>
                        <p className="text-xs text-gray-500 font-bold">{title}</p>
                        <p className="text-[10px] text-gray-400 mt-1 italic">رقم السند: {transaction.id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div className="logo-box">
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-xl">ع</div>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 mt-4 no-print-bg">
                    <div className="text-2xl">
                        <strong>المبلغ: </strong> 
                        <span className="font-mono font-black text-3xl mx-2 text-primary">{amountAbs}</span> 
                        {transaction.currency}
                    </div>
                    <div className="text-sm text-gray-500">
                        تاريخ السند: {new Date(transaction.transactionDate).toLocaleDateString('ar-EG')}
                    </div>
                </div>

                <div className="space-y-4 text-base leading-loose">
                    <p>
                        <strong>{isIncome ? 'استلمنا من السيد/السادة:' : 'صرفنا إلى السيد/السادة:'}</strong> 
                        <span className="border-b border-dotted border-gray-400 px-2 min-w-[200px] inline-block">{transaction.vendorOrPayee || transaction.relatedEntityName || '....................'}</span>
                    </p>
                    <p>
                        <strong>وذلك عن:</strong> 
                        <span className="border-b border-dotted border-gray-400 px-2 block mt-1">{transaction.description}</span>
                    </p>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <p><strong>طريقة الدفع:</strong> {transaction.paymentMethod}</p>
                        {transaction.invoiceNumber && <p><strong>رقم المرجع/الشيك:</strong> {transaction.invoiceNumber}</p>}
                    </div>
                </div>

                <div className="flex justify-between mt-16 pt-8 px-8">
                    <div className="text-center">
                        <p className="font-bold mb-8">المحاسب / أمين الصندوق</p>
                        <p>.........................</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold mb-8">{isIncome ? 'المستلم' : 'المستفيد'}</p>
                        <p>.........................</p>
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 p-4 bg-gray-50 border-t rounded-b-lg print:hidden">
                <Button variant="outline" onClick={onClose}>إغلاق</Button>
                <Button onClick={() => window.print()} leftIcon={<PrinterIcon className="w-4"/>}>طباعة السند</Button>
            </div>
        </Modal>
    );
};

// --- Form Modal ---
interface FinancialTransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: FinancialTransaction) => void;
  initialData?: Partial<FinancialTransaction> | null;
  predefinedType?: FinancialTransactionType; 
}

const FinancialTransactionFormModal: React.FC<FinancialTransactionFormModalProps> = ({ isOpen, onClose, onSubmit, initialData, predefinedType }) => {
  const [formData, setFormData] = useState<Partial<FinancialTransaction>>(
    initialData || {
      transactionDate: new Date().toISOString().split('T')[0],
      type: predefinedType || FinancialTransactionType.EXPENSE,
      amount: 0,
      currency: 'KWD',
      createdAt: new Date().toISOString().split('T')[0],
    }
  );

  useEffect(() => {
    if (isOpen) {
      setFormData(
        initialData ? { ...initialData, type: initialData.type || predefinedType || FinancialTransactionType.EXPENSE } 
                  : {
                      transactionDate: new Date().toISOString().split('T')[0],
                      type: predefinedType || FinancialTransactionType.EXPENSE,
                      amount: 0,
                      currency: 'KWD',
                      createdAt: new Date().toISOString().split('T')[0],
                    }
      );
    }
  }, [isOpen, initialData, predefinedType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const isChecked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setFormData(prev => ({
      ...prev,
      [name]: isChecked !== undefined ? isChecked : (name === 'amount' ? parseFloat(value) || 0 : value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.type || formData.amount === undefined ) { 
      alert("يرجى ملء الحقول الإلزامية: الوصف، النوع، والمبلغ.");
      return;
    }
    onSubmit({
      ...formData,
      id: formData.id || `ft-${Date.now()}`,
      updatedAt: new Date().toISOString().split('T')[0],
    } as FinancialTransaction);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? "تعديل معاملة مالية" : "إضافة معاملة مالية جديدة"} size="xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input name="transactionDate" label="تاريخ المعاملة" type="date" value={formData.transactionDate} onChange={handleChange} required />
            <Select name="type" label="نوع المعاملة" value={formData.type} options={financialTransactionTypeOptions} onChange={handleChange} required 
                    disabled={!!predefinedType} 
            />
        </div>
        <TextArea name="description" label="وصف المعاملة" value={formData.description || ''} onChange={handleChange} required rows={2} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input name="amount" label="المبلغ" type="number" value={String(formData.amount || 0)} onChange={handleChange} required step="0.001" placeholder="مثال: -500 للمصروف، 1000 للإيراد"/>
            <Select name="currency" label="العملة" value={formData.currency} options={currencyOptions} onChange={handleChange} />
            <Select name="paymentMethod" label="طريقة الدفع" value={formData.paymentMethod || ''} options={[{value:'', label:'غير محدد'}, ...paymentMethodOptions]} onChange={handleChange} />
        </div>
        
        {(formData.type === FinancialTransactionType.EXPENSE || formData.type === FinancialTransactionType.PURCHASE) && (
            <Select name="category" label="الفئة" value={formData.category || ''} options={[{value:'', label:'اختر الفئة'}, ...expenseCategoryOptions, ...purchaseCategoryOptions]} onChange={handleChange} />
        )}
        
         {formData.type !== FinancialTransactionType.SALARY_PAYMENT && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="vendorOrPayee" label="المورد/الجهة المستفيدة" value={formData.vendorOrPayee || ''} onChange={handleChange} placeholder="اسم الشركة أو الشخص"/>
                <Input name="invoiceNumber" label="رقم الفاتورة/الإيصال" value={formData.invoiceNumber || ''} onChange={handleChange} />
            </div>
         )}
         
         {formData.type === FinancialTransactionType.SALARY_PAYMENT && (
             <Select name="employeeId" label="الموظف" value={formData.employeeId || ''} options={[{value:'', label:'اختر موظف'}, ...mockEmployeesForFinance.map(e=>({value:e.id, label:e.name}))]} onChange={handleChange}/>
         )}
        
        <Card title="الربط والتفاصيل المحاسبية" titleClassName="text-sm !py-2" className="bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pt-2">
                 <Select name="relatedToEntity" label="مرتبط بـ" value={formData.relatedToEntity || ''} 
                    options={[{value:'', label:'غير مرتبط'}, ...financialEntityOptions]} onChange={handleChange} />
                <Select name="accountCode" label="رمز الحساب" value={formData.accountCode || ''} 
                    options={[{value:'', label:'غير محدد'}, ...mockAccountCodes]} onChange={handleChange} />
            </div>
        </Card>

        <div className="flex justify-end space-x-3 space-x-reverse pt-3">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit">{initialData?.id ? "حفظ التعديلات" : "إضافة معاملة"}</Button>
        </div>
      </form>
    </Modal>
  );
};

// --- Main Page ---
const FinancialManagementPage: React.FC = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(mockFinancialTransactions);
  const [includeIntegrated, setIncludeIntegrated] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FinancialTransactionType | ''>('');
  const [activeView, setActiveView] = useState<'journal' | 'dashboard' | 'integration'>('journal');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Partial<FinancialTransaction> | null>(null);
  const [formPredefinedType, setFormPredefinedType] = useState<FinancialTransactionType | undefined>(undefined);
  const [receiptToPrint, setReceiptToPrint] = useState<FinancialTransaction | null>(null);

  // Combined transactions from mock + integrated modules
  const allTransactions = useMemo(() => {
     if (!includeIntegrated) return transactions;
     const integratedRent = integrateRentToTransactions(mockRentPayments.filter(p => p.status === RentPaymentStatus.PAID));
     return [...transactions, ...integratedRent];
  }, [transactions, includeIntegrated]);

  // --- STATS ---
  const summary = useMemo(() => {
    const income = allTransactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = allTransactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return { income, expenses, net: income - expenses };
  }, [allTransactions]);
  
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(tx => {
      const searchMatch = (
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.vendorOrPayee && tx.vendorOrPayee.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      const typeMatch = filterType ? tx.type === filterType : true;
      return searchMatch && typeMatch;
    }).sort((a,b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }, [allTransactions, searchTerm, filterType]);

  // --- Handlers ---
  const handleAddTransaction = (predefinedType?: FinancialTransactionType) => {
    setEditingTransaction(null);
    setFormPredefinedType(predefinedType);
    setIsFormModalOpen(true);
  };
  const handleEditTransaction = (transaction: FinancialTransaction) => {
    setEditingTransaction(transaction);
    setFormPredefinedType(transaction.type);
    setIsFormModalOpen(true);
  };
  const handleDeleteTransaction = useCallback((transactionId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذه المعاملة المالية؟')) {
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    }
  }, []);
  const handleFormSubmit = (data: FinancialTransaction) => {
    if (editingTransaction && editingTransaction.id) {
      setTransactions(prev => prev.map(t => (t.id === editingTransaction.id ? data : t)));
    } else {
      setTransactions(prev => [data, ...prev]);
    }
    setIsFormModalOpen(false);
    setEditingTransaction(null);
    setFormPredefinedType(undefined);
  };
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG') : '-';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center print-hide">
        <div className="flex items-center mb-4 md:mb-0">
            <BanknotesIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">الإدارة المالية الموحدة</h1>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
             <Button onClick={() => setIsReportModalOpen(true)} variant="secondary" leftIcon={<DocumentTextIcon className="w-4"/>}>التقارير المالية</Button>
            <Button onClick={() => handleAddTransaction(FinancialTransactionType.EXPENSE)} variant="outline" size="sm" leftIcon={<ReceiptPercentIcon className="w-4"/>}>إضافة مصروف</Button>
            <Button onClick={() => handleAddTransaction(FinancialTransactionType.SALARY_PAYMENT)} variant="outline" size="sm" leftIcon={<UsersIcon className="w-4"/>}>تسجيل راتب</Button>
            <Button onClick={() => handleAddTransaction()} leftIcon={<PlusCircleIcon className="w-5 h-5" />}>معاملة جديدة</Button>
        </div>
      </div>
      
      {/* Dashboard Stats (KPIs) - Replaced Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 no-print">
          <button 
             onClick={() => setActiveView('journal')}
             className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${activeView === 'journal' ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white text-gray-500 border hover:bg-gray-50 uppercase text-xs'}`}>
             <ClipboardListCheckIcon className="w-5 h-5" /> سجل القيود اليومي
          </button>
          <button 
             onClick={() => setActiveView('dashboard')}
             className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${activeView === 'dashboard' ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white text-gray-500 border hover:bg-gray-50 uppercase text-xs'}`}>
             <ChartBarIcon className="w-5 h-5" /> تحليل الأداء والتدفقات
          </button>
          <button 
             onClick={() => setActiveView('integration')}
             className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${activeView === 'integration' ? 'bg-primary text-white shadow-lg scale-105' : 'bg-white text-gray-500 border hover:bg-gray-50 uppercase text-xs'}`}>
             <TrendingUpIcon className="w-5 h-5" /> الربط مع الأقسام الأخرى
          </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-right">
          <KPICard title="إجمالي الإيرادات" value={`${summary.income.toFixed(3)} د.ك`} trend={5.2} colorClass="bg-green-500" icon={<BanknotesIcon className="w-6"/>} />
          <KPICard title="إجمالي المصروفات" value={`${summary.expenses.toFixed(3)} د.ك`} trend={-1.5} colorClass="bg-red-500" icon={<ReceiptPercentIcon className="w-6"/>} />
          <KPICard title="صافي الربح" value={`${summary.net.toFixed(3)} د.ك`} trend={12} colorClass="bg-blue-500" icon={<ClipboardListCheckIcon className="w-6"/>} />
          <KPICard title="المعاملات النشطة" value={allTransactions.length.toString()} colorClass="bg-purple-500" icon={<DocumentTextIcon className="w-6"/>} />
      </div>

      {activeView === 'journal' && (
        <Card title="سجل القيود المالي الموحد" className="animate-fade-in-right">
          <div className="p-4 bg-gray-50 rounded-lg mb-6 flex flex-col md:flex-row gap-4 print:hidden items-center">
              <Input placeholder="بحث بالوصف، المورد، المرجع..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} containerClassName="mb-0 flex-grow" />
              <Select options={[{value: '', label: 'كل الأنواع'}, ...financialTransactionTypeOptions]} value={filterType} onChange={(e) => setFilterType(e.target.value as FinancialTransactionType | '')} containerClassName="mb-0 w-full md:w-48"/>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-600 bg-white px-3 py-2 border rounded cursor-pointer whitespace-nowrap">
                  <input type="checkbox" checked={includeIntegrated} onChange={(e) => setIncludeIntegrated(e.target.checked)} className="rounded text-primary" />
                  دمج بيانات الأقسام (تلقائي)
              </label>
               <Button variant="ghost" onClick={() => {setSearchTerm(''); setFilterType('');}}><ArrowPathIcon className="w-5 h-5"/></Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-100 uppercase text-[11px] text-gray-500">
                <tr>
                  {['التاريخ', 'النوع', 'البيان والقسم المرتبط', 'المبلغ (د.ك)', 'الفئة', 'المستفيد / المورد', 'إجراءات'].map(header => (
                    <th key={header} className="px-3 py-3 text-right font-medium">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map(tx => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-3 py-2 whitespace-nowrap text-xs">{formatDate(tx.transactionDate)}</td>
                    <td className="px-3 py-2 whitespace-nowrap"><FinancialTransactionTypeBadge type={tx.type} /></td>
                    <td className="px-3 py-2">
                        <div className="font-medium text-gray-800">{tx.description}</div>
                        <div className="flex items-center gap-1 mt-0.5">
                            {tx.relatedToEntity === 'case' && <span className="text-[9px] bg-blue-50 text-blue-600 px-1 rounded flex items-center gap-0.5"><ScaleIcon className="w-2 h-2"/> قضايا</span>}
                            {tx.relatedToEntity === 'property' && <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1 rounded flex items-center gap-0.5"><HomeIcon className="w-2 h-2"/> عقارات</span>}
                            {tx.relatedToEntity === 'employee' && <span className="text-[9px] bg-purple-50 text-purple-600 px-1 rounded flex items-center gap-0.5"><UsersIcon className="w-2 h-2"/> موظفين</span>}
                            <span className="text-[9px] text-gray-400 font-mono">#{tx.id.slice(-6)}</span>
                        </div>
                    </td>
                    <td className={`px-3 py-2 whitespace-nowrap font-bold dir-ltr ${tx.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                        {tx.amount >= 0 ? `+${tx.amount.toFixed(3)}` : tx.amount.toFixed(3)}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-500">{tx.category || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap max-w-[150px] truncate">{tx.vendorOrPayee || tx.relatedEntityName || '-'}</td>
                    <td className="px-3 py-2 whitespace-nowrap space-x-1 space-x-reverse print-hide opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => setReceiptToPrint(tx)} title="طباعة سند"><PrinterIcon className="w-4 h-4 text-gray-600" /></Button>
                      {!tx.id.startsWith('integrated-') && (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => handleEditTransaction(tx)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTransaction(tx.id)} className="text-danger"><TrashIcon className="w-4 h-4" /></Button>
                          </>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && <tr><td colSpan={7} className="text-center py-20 text-gray-400 italic">لا توجد سجلات مالية مطابقة حالياً.</td></tr>}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeView === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-right">
              <Card title="توزيع المصروفات حسب الفئة" className="lg:col-span-2">
                  <div className="space-y-4 py-4">
                      {Object.entries(generateReportData(allTransactions, new Date(2024, 0, 1), new Date()).expenseByCategory)
                        .sort((a,b) => b[1] - a[1]).map(([cat, amount]) => {
                            const percentage = (amount / summary.expenses) * 100;
                            return (
                                <div key={cat} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="font-bold">{cat}</span>
                                        <span className="text-gray-500 font-mono">{amount.toFixed(3)} د.ك ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{width: `${percentage}%`}}></div>
                                    </div>
                                </div>
                            );
                        })}
                  </div>
              </Card>
              <Card title="مصادر الدخل الرئيسية">
                   <div className="space-y-4 py-4">
                        {Object.entries(generateReportData(allTransactions, new Date(2024, 0, 1), new Date()).revenueBySource)
                            .sort((a,b) => b[1] - a[1]).map(([source, amount]) => {
                                const percentage = (amount / summary.income) * 100;
                                return (
                                    <div key={source} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border-r-4 border-success">
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">{source}</p>
                                            <p className="text-[10px] text-gray-500">{percentage.toFixed(1)}% من الإجمالي</p>
                                        </div>
                                        <span className="font-mono text-success font-bold text-sm">+{amount.toFixed(3)}</span>
                                    </div>
                                );
                            })}
                  </div>
              </Card>
              <div className="lg:col-span-3">
                  <Card title="إحصائيات التدفق النقدي الشهري">
                        <div className="flex items-end justify-between h-40 gap-2 px-4">
                            {[650, 800, 1200, 950, 1500, 1100, 1800, 1400].map((v, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full bg-slate-100 rounded-t relative h-full flex items-end">
                                        <div 
                                            className="w-full bg-primary/40 group-hover:bg-primary transition-all rounded-t" 
                                            style={{height: `${(v/2000)*100}%`}}
                                        ></div>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-[9px] font-bold bg-gray-800 text-white px-1 rounded">{v}</div>
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i]}</span>
                                </div>
                            ))}
                        </div>
                  </Card>
              </div>
          </div>
      )}

      {activeView === 'integration' && (
          <div className="space-y-6 animate-fade-in-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card title="وحدة تكامل العقارات" icon={<HomeIcon className="w-5 h-5 text-emerald-500"/>}>
                      <p className="text-xs text-gray-500 mb-4">يقوم النظام بسحب دفعات الإيجار المحصلة من قسم إدارة العقارات ودمجها في السجل المالي تلقائياً.</p>
                      <div className="space-y-2">
                           <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                               <span className="text-xs font-bold text-emerald-800">إجمالي تحصيلات الإيجار (المكتشفة)</span>
                               <span className="font-mono font-bold text-emerald-700">{mockRentPayments.filter(p=>p.status===RentPaymentStatus.PAID).reduce((s,c)=>s+c.amountPaid, 0).toFixed(3)} د.ك</span>
                           </div>
                           <Button variant="outline" size="sm" fullWidth leftIcon={<ArrowPathIcon className="w-4 h-4"/>}>مزامنة يدوية للتحصيلات</Button>
                      </div>
                  </Card>
                  <Card title="وحدة تكامل القضايا" icon={<ScaleIcon className="w-5 h-5 text-blue-500"/>}>
                      <p className="text-xs text-gray-500 mb-4">تتبع الرسوم القضائية والمصاريف الإدارية المدفوعة لكل ملف قضية على حدة.</p>
                      <div className="space-y-2">
                           <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                               <span className="text-xs font-bold text-blue-800">إجمالي الرسوم التقديرية (هذا الشهر)</span>
                               <span className="font-mono font-bold text-blue-700">450.000 د.ك</span>
                           </div>
                           <Button variant="outline" size="sm" fullWidth leftIcon={<CalculatorIcon className="w-4 h-4"/>}>تحميل رسوم المحاكم</Button>
                      </div>
                  </Card>
              </div>
              <Card title="ربط فواتير العملاء (إصدار تجريبي)">
                  <div className="p-10 text-center border-2 border-dashed rounded-2xl bg-gray-50">
                      <CurrencyDollarIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                      <h3 className="font-bold text-gray-800 italic">ميزة الفواتير الإلكترونية تحت التطوير</h3>
                      <p className="text-xs text-gray-500 mt-2">ستسمح هذه الوحدة مستقبلاً بإصدار فواتير ضريبية للعملاء وربطها بالدفعات المستلمة عبر K-Net.</p>
                  </div>
              </Card>
          </div>
      )}
      {/* Modals */}
      <FinancialTransactionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {setIsFormModalOpen(false); setFormPredefinedType(undefined);}}
        onSubmit={handleFormSubmit}
        initialData={editingTransaction}
        predefinedType={formPredefinedType}
      />
      
      <PrintableReceiptModal transaction={receiptToPrint} onClose={() => setReceiptToPrint(null)} />
      
      <FinancialReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} transactions={transactions}/>
    </div>
  );
};

export default FinancialManagementPage;