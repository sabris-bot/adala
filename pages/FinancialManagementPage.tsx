
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { FinancialTransactionTypeBadge } from '../components/ui/Badge';
import { 
    BanknotesIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, FolderIcon, 
    InformationCircleIcon, ShoppingCartIcon, ReceiptPercentIcon, UsersIcon 
} from '../constants';
import { FinancialTransaction, FinancialTransactionType, PaymentMethod, ExpenseCategory, PurchaseCategory, RequestAttachment, Employee, Case } from '../types';
import { 
    financialTransactionTypeOptions, paymentMethodOptions, expenseCategoryOptions, purchaseCategoryOptions, 
    currencyOptions, financialEntityOptions
} from '../constants';

// Import mock data from other pages for linking
import { initialEmployees } from './EmployeeProfilePage'; 
import { initialCases } from './CaseListPage'; 

const mockAccountCodes = [ 
    { value: 'EXP-001', label: 'مصروفات إيجار (EXP-001)'},
    { value: 'EXP-002', label: 'فواتير خدمات (EXP-002)'},
    { value: 'EXP-003', label: 'مستلزمات مكتبية (EXP-003)'},
    { value: 'PUR-001', label: 'أصول ثابتة - أجهزة (PUR-001)'},
    { value: 'REV-001', label: 'إيرادات أتعاب قضايا (REV-001)'},
    { value: 'SAL-001', label: 'مصروفات رواتب (SAL-001)'},
];

const mockVendors = ['شركة الأجهزة الحديثة', 'مكتبة النور', 'مجموعة الخليج للتأمين', 'وكالة إعلانات الإبداع'];

// Prepare data for financial examples
const mockEmployeesForFinance = initialEmployees.map(emp => ({
  id: emp.id,
  name: emp.fullNameAr,
  basicSalary: emp.basicSalary,
  allowances: emp.allowances || [],
}));

const mockCasesForFinance = initialCases.map(c => ({
  id: c.id,
  title: c.title,
  caseNumber: c.caseNumber,
}));


export const mockFinancialTransactions: FinancialTransaction[] = [ // Added export
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
    id: 'ft3', // Salary for Ahmed Mahmoud
    transactionDate: '2024-07-30',
    type: FinancialTransactionType.SALARY_PAYMENT,
    description: `راتب شهر يوليو 2024 للموظف ${mockEmployeesForFinance.find(e=>e.id === 'emp-001')?.name || 'أحمد محمود'}`,
    amount: -((mockEmployeesForFinance.find(e=>e.id === 'emp-001')?.basicSalary || 0) + (mockEmployeesForFinance.find(e=>e.id === 'emp-001')?.allowances?.reduce((sum, al) => sum + al.value, 0) || 0)),
    currency: 'KWD',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    employeeId: 'emp-001',
    relatedToEntity: 'employee',
    relatedEntityId: 'emp-001',
    relatedEntityName: mockEmployeesForFinance.find(e=>e.id === 'emp-001')?.name || 'أحمد محمود مبارك',
    accountCode: 'SAL-001',
    notes: 'شامل الراتب الأساسي والبدلات.',
    recordedBy: 'مسؤول الرواتب',
    createdAt: '2024-07-30',
  },
  {
    id: 'ft_sal_002', // Salary for Fatima Ali
    transactionDate: '2024-07-30',
    type: FinancialTransactionType.SALARY_PAYMENT,
    description: `راتب شهر يوليو 2024 للموظفة ${mockEmployeesForFinance.find(e=>e.id === 'emp-002')?.name || 'فاطمة علي'}`,
    amount: -((mockEmployeesForFinance.find(e=>e.id === 'emp-002')?.basicSalary || 0) + (mockEmployeesForFinance.find(e=>e.id === 'emp-002')?.allowances?.reduce((sum, al) => sum + al.value, 0) || 0)),
    currency: 'KWD',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    category: "راتب الموظف",
    employeeId: 'emp-002',
    relatedToEntity: 'employee',
    relatedEntityId: 'emp-002',
    relatedEntityName: mockEmployeesForFinance.find(e=>e.id === 'emp-002')?.name || 'فاطمة علي حسين',
    accountCode: 'SAL-001',
    recordedBy: 'مسؤول الرواتب',
    createdAt: '2024-07-30',
  },
  {
    id: 'ft_sal_003', // Salary for Ali Mohammed
    transactionDate: '2024-07-30',
    type: FinancialTransactionType.SALARY_PAYMENT,
    description: `راتب شهر يوليو 2024 للموظف ${mockEmployeesForFinance.find(e=>e.id === 'emp-003')?.name || 'علي محمد'}`,
    amount: -((mockEmployeesForFinance.find(e=>e.id === 'emp-003')?.basicSalary || 0) + (mockEmployeesForFinance.find(e=>e.id === 'emp-003')?.allowances?.reduce((sum, al) => sum + al.value, 0) || 0)),
    currency: 'KWD',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    category: "راتب الموظف",
    employeeId: 'emp-003',
    relatedToEntity: 'employee',
    relatedEntityId: 'emp-003',
    relatedEntityName: mockEmployeesForFinance.find(e=>e.id === 'emp-003')?.name || 'علي محمد جاسم',
    accountCode: 'SAL-001',
    notes: 'خصم سلفة جزئية من الراتب (مثال).',
    recordedBy: 'مسؤول الرواتب',
    createdAt: '2024-07-30',
  },
   {
    id: 'ft_sal_004', // Salary for Noura Khalid
    transactionDate: '2024-07-30',
    type: FinancialTransactionType.SALARY_PAYMENT,
    description: `راتب شهر يوليو 2024 للموظفة ${mockEmployeesForFinance.find(e=>e.id === 'emp-004')?.name || 'نورة خالد'}`,
    amount: -((mockEmployeesForFinance.find(e=>e.id === 'emp-004')?.basicSalary || 0) + (mockEmployeesForFinance.find(e=>e.id === 'emp-004')?.allowances?.reduce((sum, al) => sum + al.value, 0) || 0)), // 1500 + 300 + 25 = -1825
    currency: 'KWD',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    category: "راتب الموظف",
    employeeId: 'emp-004',
    relatedToEntity: 'employee',
    relatedEntityId: 'emp-004',
    relatedEntityName: mockEmployeesForFinance.find(e=>e.id === 'emp-004')?.name || 'نورة خالد السبيعي',
    accountCode: 'SAL-001',
    recordedBy: 'مسؤول الرواتب',
    createdAt: '2024-07-30',
  },
  {
    id: 'ft4',
    transactionDate: '2024-07-15',
    type: FinancialTransactionType.REVENUE,
    description: `أتعاب القضية رقم ${mockCasesForFinance.find(c=>c.id === '1')?.caseNumber || 'CML-2024-101'} - دفعة أولى`,
    amount: 1500, 
    currency: 'KWD',
    paymentMethod: PaymentMethod.CHEQUE,
    category: 'أتعاب قانونية',
    relatedToEntity: 'case',
    relatedEntityId: mockCasesForFinance.find(c=>c.id === '1')?.id,
    relatedEntityName: mockCasesForFinance.find(c=>c.id === '1')?.title,
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
  {
    id: 'ft6',
    transactionDate: '2024-08-02',
    type: FinancialTransactionType.EXPENSE,
    description: 'مصاريف ضيافة لعميل هام',
    amount: -35.750,
    currency: 'KWD',
    paymentMethod: PaymentMethod.CASH,
    category: ExpenseCategory.HOSPITALITY_ENTERTAINMENT,
    vendorOrPayee: 'مقهى فاخر',
    notes: 'استضافة العميل (شركة XYZ) لمناقشة تطورات القضية.',
    recordedBy: 'أحمد محمود',
    createdAt: '2024-08-02',
  },
  {
    id: 'ft7',
    transactionDate: '2024-08-05',
    type: FinancialTransactionType.PURCHASE,
    description: 'شراء اشتراك سنوي لبرنامج محاسبة',
    amount: -250,
    currency: 'USD', 
    paymentMethod: PaymentMethod.CREDIT_CARD,
    category: PurchaseCategory.SOFTWARE_LICENSES,
    vendorOrPayee: 'Global Software Inc.',
    invoiceNumber: 'GSI-SUB-9876',
    notes: 'تم الدفع بالدولار، سيتم تحويل القيمة إلى دينار كويتي في السجلات.',
    recordedBy: 'مدير المشتريات',
    createdAt: '2024-08-05',
  },
  {
    id: 'ft9',
    transactionDate: '2024-08-10',
    type: FinancialTransactionType.EXPENSE,
    description: 'رسوم تقديم مستندات للمحكمة في القضية ' + (mockCasesForFinance.find(c=>c.id === '2')?.caseNumber || 'LAB-2024-055'),
    amount: -25.000,
    currency: 'KWD',
    paymentMethod: PaymentMethod.CASH,
    category: ExpenseCategory.GOVERNMENT_FEES,
    vendorOrPayee: 'محكمة العاصمة - قسم الرسوم',
    relatedToEntity: 'case',
    relatedEntityId: mockCasesForFinance.find(c=>c.id === '2')?.id,
    relatedEntityName: mockCasesForFinance.find(c=>c.id === '2')?.title,
    recordedBy: 'مندوب المحكمة',
    createdAt: '2024-08-10',
  },
  {
    id: 'ft10',
    transactionDate: '2024-08-12',
    type: FinancialTransactionType.OTHER_INCOME,
    description: 'إيراد من استشارة قانونية لشركة (أ) غير مرتبطة بقضية',
    amount: 300,
    currency: 'KWD',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    category: 'إيرادات استشارات',
    relatedToEntity: 'client',
    relatedEntityName: 'شركة (أ) للاستشارات', 
    recordedBy: 'المحاسب',
    createdAt: '2024-08-12',
  },
  {
    id: 'ft11',
    transactionDate: '2024-08-15',
    type: FinancialTransactionType.EXPENSE,
    description: 'تذاكر طيران لحضور مؤتمر قانوني (' + (mockEmployeesForFinance.find(e=>e.id === 'emp-001')?.name || 'أحمد محمود') + ')',
    amount: -180.000,
    currency: 'KWD',
    paymentMethod: PaymentMethod.CREDIT_CARD,
    category: ExpenseCategory.TRAVEL_TRANSPORTATION,
    vendorOrPayee: 'طيران الجزيرة',
    relatedToEntity: 'employee',
    relatedEntityId: 'emp-001',
    relatedEntityName: mockEmployeesForFinance.find(e=>e.id === 'emp-001')?.name || 'أحمد محمود مبارك',
    notes: 'مؤتمر القانون التجاري الدولي - دبي',
    recordedBy: 'سكرتارية المكتب',
    createdAt: '2024-08-15',
  },
  {
    id: 'ft12',
    transactionDate: '2024-08-20',
    type: FinancialTransactionType.OTHER_OUTGOING,
    description: 'دفعة مقدمة لمصمم الموقع الإلكتروني للمكتب',
    amount: -500,
    currency: 'KWD',
    paymentMethod: PaymentMethod.CHEQUE,
    category: 'تطوير الموقع الإلكتروني',
    vendorOrPayee: 'شركة الحلول الرقمية للتصميم',
    invoiceNumber: 'CHQ-DES-001',
    isRecurring: false,
    notes: 'الدفعة الأولى من أصل 3 دفعات لمشروع تصميم الموقع.',
    recordedBy: 'المدير الإداري',
    createdAt: '2024-08-20',
  },
  {
    id: 'ft13',
    transactionDate: '2024-08-22',
    type: FinancialTransactionType.EXPENSE,
    description: 'شراء مستلزمات مكتبية متنوعة (أقلام، أوراق، ملفات)',
    amount: -17.500,
    currency: 'KWD',
    paymentMethod: PaymentMethod.CASH,
    category: ExpenseCategory.OFFICE_SUPPLIES,
    vendorOrPayee: 'مكتبة السنافر',
    invoiceNumber: 'INV-STAT-08-2024-005',
    accountCode: 'EXP-003',
    notes: 'شراء عاجل لمستلزمات نفدت من المخزن.',
    recordedBy: 'السكرتير الإداري',
    createdAt: '2024-08-22',
  }
];


interface FinancialTransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: FinancialTransaction) => void;
  initialData?: Partial<FinancialTransaction> | null;
  predefinedType?: FinancialTransactionType; // For handling specific "Add Expense/Purchase/Salary" links
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

    if (name === 'type') {
        setFormData(prev => ({ ...prev, category: undefined, employeeId: undefined, relatedToEntity: undefined, relatedEntityId: undefined, relatedEntityName: undefined }));
    }
    if (name === 'relatedToEntity' && value === '') { // Clear related ID and Name if entity type is cleared
        setFormData(prev => ({ ...prev, relatedEntityId: undefined, relatedEntityName: undefined }));
    }
    if (name === 'employeeId' && formData.type === FinancialTransactionType.SALARY_PAYMENT) {
      const selectedEmp = mockEmployeesForFinance.find(emp => emp.id === value);
      setFormData(prev => ({
        ...prev,
        relatedToEntity: 'employee',
        relatedEntityId: value,
        relatedEntityName: selectedEmp?.name || '',
      }));
    }
  };
  
  const currentCategoryOptions = useMemo(() => {
    let options = [{ value: '', label: 'لا توجد فئة محددة لهذا النوع' }];
    if (formData.type === FinancialTransactionType.EXPENSE) return [{ value: '', label: 'اختر فئة المصروف' }, ...expenseCategoryOptions];
    if (formData.type === FinancialTransactionType.PURCHASE) return [{ value: '', label: 'اختر فئة الشراء' }, ...purchaseCategoryOptions];
    return options; 
  }, [formData.type]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.type || formData.amount === undefined ) { // Amount can be 0
      alert("يرجى ملء الحقول الإلزامية: الوصف، النوع، والمبلغ.");
      return;
    }
    if (formData.type === FinancialTransactionType.SALARY_PAYMENT && !formData.employeeId) {
        alert("يرجى اختيار الموظف عند تسجيل دفعة راتب.");
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
                    disabled={!!predefinedType} // Disable if type is predefined by entry point
            />
        </div>
        <TextArea name="description" label="وصف المعاملة" value={formData.description || ''} onChange={handleChange} required rows={2} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input name="amount" label="المبلغ" type="number" value={String(formData.amount || 0)} onChange={handleChange} required step="0.001" 
                   placeholder="مثال: -500 للمصروف، 1000 للإيراد"/>
            <Select name="currency" label="العملة" value={formData.currency} options={currencyOptions} onChange={handleChange} />
            <Select name="paymentMethod" label="طريقة الدفع" value={formData.paymentMethod || ''} options={[{value:'', label:'غير محدد'}, ...paymentMethodOptions]} onChange={handleChange} />
        </div>
        
        {(formData.type === FinancialTransactionType.EXPENSE || formData.type === FinancialTransactionType.PURCHASE) && (
            <Select name="category" label="الفئة (للمصروفات/المشتريات)" value={formData.category || ''} options={currentCategoryOptions} onChange={handleChange} 
                    disabled={currentCategoryOptions.length <= 1 && currentCategoryOptions[0].value === ''}/>
        )}
         {formData.type !== FinancialTransactionType.SALARY_PAYMENT && formData.type !== FinancialTransactionType.REVENUE && formData.type !== FinancialTransactionType.OTHER_INCOME && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="vendorOrPayee" label="المورد/الجهة المستفيدة" value={formData.vendorOrPayee || ''} onChange={handleChange} placeholder="اسم الشركة أو الشخص"/>
                <Input name="invoiceNumber" label="رقم الفاتورة/الإيصال" value={formData.invoiceNumber || ''} onChange={handleChange} />
            </div>
         )}
        
        {formData.type === FinancialTransactionType.SALARY_PAYMENT && (
            <Select name="employeeId" label="الموظف (لدفعات الرواتب)" value={formData.employeeId || ''} 
                options={[{value:'', label:'اختر موظفًا'}, ...mockEmployeesForFinance.map(e => ({value: e.id, label: e.name}))]} 
                onChange={handleChange} required
            />
        )}

        <Card title="الربط والتفاصيل المحاسبية (اختياري)" titleClassName="text-sm !py-2" className="bg-slate-50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 pt-2">
                 <Select name="relatedToEntity" label="مرتبط بـ" value={formData.relatedToEntity || ''} 
                    options={[{value:'', label:'غير مرتبط'}, ...financialEntityOptions]} onChange={handleChange} />
                <Input name="relatedEntityId" label="معرّف الكيان المرتبط" value={formData.relatedEntityId || ''} onChange={handleChange} placeholder="رقم القضية، معرّف الموظف، إلخ"/>
                <Input name="relatedEntityName" label="اسم الكيان المرتبط (للعرض)" value={formData.relatedEntityName || ''} onChange={handleChange} />
                <Select name="accountCode" label="رمز الحساب (دليل الحسابات)" value={formData.accountCode || ''} 
                    options={[{value:'', label:'غير محدد'}, ...mockAccountCodes]} onChange={handleChange} />
            </div>
            <div className="flex items-center mt-3">
                <input type="checkbox" id="isRecurring" name="isRecurring" checked={!!formData.isRecurring} onChange={handleChange} className="form-checkbox h-4 w-4 text-primary me-2"/>
                <label htmlFor="isRecurring" className="text-sm text-gray-700">معاملة متكررة؟</label>
            </div>
            {formData.isRecurring && (
                <Input name="recurrenceDetails" label="تفاصيل التكرار" value={formData.recurrenceDetails || ''} onChange={handleChange} placeholder="مثال: شهري، كل يوم 5 من الشهر" containerClassName="mt-2"/>
            )}
        </Card>

        <TextArea name="notes" label="ملاحظات إضافية" value={formData.notes || ''} onChange={handleChange} rows={3} />
        <Input name="recordedBy" label="تم التسجيل بواسطة (اسم المستخدم)" value={formData.recordedBy || ''} onChange={handleChange} />
        
        <div className="flex justify-end space-x-3 space-x-reverse pt-3">
          <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          <Button type="submit">{initialData?.id ? "حفظ التعديلات" : "إضافة معاملة"}</Button>
        </div>
      </form>
    </Modal>
  );
};

interface ViewFinancialTransactionModalProps {
  transaction: FinancialTransaction | null;
  onClose: () => void;
  onEdit: (transaction: FinancialTransaction) => void;
}
const ViewFinancialTransactionModal: React.FC<ViewFinancialTransactionModalProps> = ({ transaction, onClose, onEdit }) => {
  if (!transaction) return null;
  const formatDate = (dateStr?: string) => dateStr ? new Date(dateStr).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour:'2-digit', minute:'2-digit'}) : 'غير محدد';

  const getRelatedEntityDisplayName = (tx: FinancialTransaction): string => {
      if (tx.relatedEntityName) return tx.relatedEntityName;
      if (tx.relatedEntityId) {
          if (tx.relatedToEntity === 'case') {
              return initialCases.find(c => c.id === tx.relatedEntityId)?.title || tx.relatedEntityId;
          }
          if (tx.relatedToEntity === 'employee') {
              return initialEmployees.find(e => e.id === tx.relatedEntityId)?.fullNameAr || tx.relatedEntityId;
          }
          return tx.relatedEntityId;
      }
      if (tx.employeeId && tx.type === FinancialTransactionType.SALARY_PAYMENT) {
          return initialEmployees.find(e => e.id === tx.employeeId)?.fullNameAr || tx.employeeId;
      }
      return '-';
  };

  const relatedEntityDisplayName = getRelatedEntityDisplayName(transaction);


  return (
    <Modal isOpen={!!transaction} onClose={onClose} title={`تفاصيل المعاملة المالية`} size="xl">
      <div className="space-y-3 text-sm max-h-[75vh] overflow-y-auto p-1 scrollbar-thin">
        
        <Card title="ملخص المعاملة" className="bg-slate-50 dark:bg-dm-card" titleClassName="text-sm font-semibold">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-2">
                <div><strong>التاريخ:</strong> {formatDate(transaction.transactionDate)}</div>
                <div><strong>النوع:</strong> <FinancialTransactionTypeBadge type={transaction.type} size="sm"/></div>
                <div className="lg:col-span-3"><strong>الوصف:</strong> <pre className="whitespace-pre-wrap font-sans text-sm p-1 bg-white dark:bg-dm-background border rounded">{transaction.description}</pre></div>
                <div><strong>المبلغ:</strong> <span className={transaction.amount >= 0 ? 'text-success font-bold' : 'text-danger font-bold'}>{transaction.amount.toFixed(3)} {transaction.currency}</span></div>
                <div><strong>طريقة الدفع:</strong> {transaction.paymentMethod || '-'}</div>
                <div><strong>الفئة:</strong> {transaction.category || '-'}</div>
            </div>
        </Card>

        {(transaction.vendorOrPayee || transaction.invoiceNumber) && (
             <Card title="المورد/الجهة والفاتورة" className="bg-slate-50 dark:bg-dm-card" titleClassName="text-sm font-semibold">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
                    <div><strong>المورد/الجهة المستفيدة:</strong> {transaction.vendorOrPayee || '-'}</div>
                    <div><strong>رقم الفاتورة/الإيصال:</strong> {transaction.invoiceNumber || '-'}</div>
                </div>
            </Card>
        )}

        {(transaction.relatedToEntity || transaction.employeeId) && (
            <Card title="الربط بكيانات أخرى" className="bg-slate-50 dark:bg-dm-card" titleClassName="text-sm font-semibold">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
                    <div><strong>مرتبط بـ (نوع الكيان):</strong> {transaction.relatedToEntity || (transaction.employeeId ? 'موظف': '-') }</div>
                    <div><strong>معرّف الكيان:</strong> {transaction.relatedEntityId || transaction.employeeId || '-' }</div>
                    <div className="md:col-span-2"><strong>اسم الكيان (للعرض):</strong> {relatedEntityDisplayName}</div>
                 </div>
            </Card>
        )}

         {(transaction.accountCode || transaction.isRecurring) && (
            <Card title="التفاصيل المحاسبية" className="bg-slate-50 dark:bg-dm-card" titleClassName="text-sm font-semibold">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-2">
                    <div><strong>رمز الحساب:</strong> {transaction.accountCode || '-'}</div>
                    <div><strong>معاملة متكررة:</strong> {transaction.isRecurring ? `نعم (${transaction.recurrenceDetails || 'بدون تفاصيل'})` : 'لا'}</div>
                </div>
            </Card>
        )}

        {transaction.notes && <Card title="ملاحظات إضافية" className="bg-yellow-50 dark:bg-yellow-800/30 border-yellow-200 dark:border-yellow-700" titleClassName="text-sm font-semibold text-yellow-800 dark:text-yellow-200"><pre className="whitespace-pre-wrap font-sans p-2 bg-white dark:bg-dm-background border rounded">{transaction.notes}</pre></Card>}
        
        {transaction.attachments && transaction.attachments.length > 0 && (
            <Card title="المرفقات" className="bg-slate-50 dark:bg-dm-card" titleClassName="text-sm font-semibold">
                <ul className="p-2">
                    {transaction.attachments.map(att => (
                        <li key={att.id} className="text-xs mb-1 p-1 bg-white dark:bg-dm-background border rounded flex justify-between items-center">
                            <span>{att.name}</span>
                            <span className="text-gray-400 text-xxs">({formatDate(att.uploadedAt)})</span>
                        </li>
                    ))}
                </ul>
            </Card>
        )}

        <Card title="معلومات التسجيل" className="bg-slate-100 dark:bg-dm-card/50 text-xs text-gray-500 dark:text-gray-400" titleClassName="text-xs font-semibold">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 p-2">
                <p><strong>تم التسجيل بواسطة:</strong> {transaction.recordedBy || 'غير محدد'}</p>
                <p><strong>تاريخ الإنشاء:</strong> {formatDate(transaction.createdAt)}</p>
                <p><strong>آخر تحديث:</strong> {transaction.updatedAt ? formatDate(transaction.updatedAt) : '-'}</p>
            </div>
        </Card>
      </div>
      <div className="mt-4 flex justify-end space-x-2 space-x-reverse p-3 border-t dark:border-gray-700">
          <Button variant="outline" onClick={() => { onClose(); onEdit(transaction); }}>تعديل المعاملة</Button>
          <Button variant="primary" onClick={onClose}>إغلاق</Button>
      </div>
    </Modal>
  );
};


const FinancialManagementPage: React.FC = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(mockFinancialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FinancialTransactionType | ''>('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Partial<FinancialTransaction> | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<FinancialTransaction | null>(null);
  const [formPredefinedType, setFormPredefinedType] = useState<FinancialTransactionType | undefined>(undefined);


  const categoryOptionsForFilter = useMemo(() => {
    let options: { value: string; label: string }[] = [{ value: '', label: 'كل الفئات' }];
    if (filterType === FinancialTransactionType.EXPENSE) {
      options = [...options, ...expenseCategoryOptions];
    } else if (filterType === FinancialTransactionType.PURCHASE) {
      options = [...options, ...purchaseCategoryOptions];
    } else if (filterType) { 
        // --- FIX START ---
        // Added explicit type 'string[]' to help TypeScript's inference.
      const customCategories: string[] = Array.from(new Set(transactions.filter(t => t.type === filterType && typeof t.category === 'string').map(t => t.category as string)));
        // --- FIX END ---
      options = [...options, ...customCategories.map(c => ({value: c, label: c}))];
    } else { 
        // --- FIX START ---
        // Added explicit type 'string[]' to help TypeScript's inference.
      const allCategories: string[] = Array.from(new Set(transactions.map(t => t.category).filter(Boolean) as string[]));
        // --- FIX END ---
      options = [...options, ...allCategories.map(c => ({value: c, label: c}))];
    }
    return options;
  }, [filterType, transactions]);


  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const searchMatch = (
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.vendorOrPayee && tx.vendorOrPayee.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.invoiceNumber && tx.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.relatedEntityName && tx.relatedEntityName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (tx.accountCode && tx.accountCode.toLowerCase().includes(searchTerm.toLowerCase())) || // Search by account code
        (tx.category && tx.category.toLowerCase().includes(searchTerm.toLowerCase())) // Search by category string
      );
      const typeMatch = filterType ? tx.type === filterType : true;
      const categoryMatch = filterCategory ? tx.category === filterCategory : true;
      const dateFromMatch = filterDateFrom ? new Date(tx.transactionDate) >= new Date(filterDateFrom) : true;
      const dateToMatch = filterDateTo ? new Date(tx.transactionDate) <= new Date(filterDateTo) : true;

      return searchMatch && typeMatch && categoryMatch && dateFromMatch && dateToMatch;
    }).sort((a,b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
  }, [transactions, searchTerm, filterType, filterCategory, filterDateFrom, filterDateTo]);
  
  const summary = useMemo(() => {
    const income = filteredTransactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = filteredTransactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    return {
      count: filteredTransactions.length,
      totalIncome: income,
      totalExpenses: expenses,
      netBalance: income - expenses,
    };
  }, [filteredTransactions]);


  const handleAddTransaction = (predefinedType?: FinancialTransactionType) => {
    setEditingTransaction(null);
    setFormPredefinedType(predefinedType);
    setIsFormModalOpen(true);
  };

  const handleEditTransaction = (transaction: FinancialTransaction) => {
    setEditingTransaction(transaction);
    setFormPredefinedType(transaction.type); // Use existing type when editing
    setIsFormModalOpen(true);
  };
  
  const handleViewTransaction = (transaction: FinancialTransaction) => {
    setViewingTransaction(transaction);
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
    setFormPredefinedType(undefined); // Reset predefined type
  };
  
  const formatDateForDisplay = (dateString?: string) => {
    if (!dateString) return '-';
    try { return new Date(dateString).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }); } 
    catch(e) { return dateString; }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
            <BanknotesIcon className="w-8 h-8 text-primary me-3" />
            <h1 className="text-3xl font-bold text-primary-dark dark:text-primary-light">سجل المعاملات المالية</h1>
        </div>
        <div className="flex space-x-2 space-x-reverse flex-wrap justify-center md:justify-end gap-2">
            <Button onClick={() => handleAddTransaction()} leftIcon={<PlusCircleIcon className="w-5 h-5" />} className="flex-shrink-0">معاملة جديدة</Button>
            <Button onClick={() => handleAddTransaction(FinancialTransactionType.EXPENSE)} variant="outline" size="sm" leftIcon={<ReceiptPercentIcon className="w-4"/>} className="flex-shrink-0">إضافة مصروف</Button>
            <Button onClick={() => handleAddTransaction(FinancialTransactionType.PURCHASE)} variant="outline" size="sm" leftIcon={<ShoppingCartIcon className="w-4"/>} className="flex-shrink-0">إضافة شراء</Button>
            <Button onClick={() => handleAddTransaction(FinancialTransactionType.SALARY_PAYMENT)} variant="outline" size="sm" leftIcon={<UsersIcon className="w-4"/>} className="flex-shrink-0">تسجيل راتب</Button>
        </div>
      </div>
      
      <Card className="bg-blue-50 dark:bg-dm-card/30 border-blue-200 dark:border-blue-700/50">
        <div className="flex items-start">
            <InformationCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 me-3 mt-1 flex-shrink-0" />
            <div>
                <h3 className="text-md font-semibold text-blue-700 dark:text-blue-300 mb-1">إدارة شاملة للشؤون المالية والمحاسبية</h3>
                <p className="text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                    تمكنك هذه الوحدة من تسجيل وتتبع جميع المعاملات المالية للمكتب أو الشركة، بما في ذلك المصروفات، المشتريات، دفعات الرواتب، والإيرادات. 
                    استخدم الفلاتر أدناه لتصفية وعرض المعاملات حسب معايير محددة.
                </p>
            </div>
        </div>
      </Card>

      <Card>
        <div className="p-4 bg-gray-50 dark:bg-dm-card/50 rounded-lg mb-6">
            <Input 
                placeholder="ابحث بالوصف، المورد، رقم الفاتورة، الملاحظات، رمز الحساب، الفئة..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                containerClassName="mb-4"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <Select label="نوع المعاملة" options={[{value: '', label: 'الكل'}, ...financialTransactionTypeOptions]} value={filterType} onChange={(e) => {setFilterType(e.target.value as FinancialTransactionType | ''); setFilterCategory('');}} containerClassName="mb-0"/>
                <Select label="الفئة" options={categoryOptionsForFilter} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} containerClassName="mb-0" disabled={categoryOptionsForFilter.length <= 1}/>
                <Input label="من تاريخ" type="date" value={filterDateFrom} onChange={e => setFilterDateFrom(e.target.value)} containerClassName="mb-0"/>
                <Input label="إلى تاريخ" type="date" value={filterDateTo} onChange={e => setFilterDateTo(e.target.value)} containerClassName="mb-0"/>
            </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            <thead className="bg-gray-100 dark:bg-dm-card">
              <tr>
                {['التاريخ', 'النوع', 'الوصف', 'المبلغ', 'العملة', 'الفئة', 'المورد/الجهة', 'إجراءات'].map(header => (
                  <th key={header} scope="col" className="px-3 py-3 text-right font-medium text-gray-600 dark:text-gray-300">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dm-background divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-dm-card/60 transition-colors">
                  <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{formatDateForDisplay(tx.transactionDate)}</td>
                  <td className="px-3 py-2 whitespace-nowrap"><FinancialTransactionTypeBadge type={tx.type} /></td>
                  <td className="px-3 py-2 whitespace-nowrap font-medium text-primary-dark dark:text-primary-light max-w-xs truncate" title={tx.description}>{tx.description}</td>
                  <td className={`px-3 py-2 whitespace-nowrap font-semibold ${tx.amount >= 0 ? 'text-success' : 'text-danger'}`}>{tx.amount.toFixed(3)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-500 dark:text-gray-400">{tx.currency}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300">{tx.category || '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-700 dark:text-gray-300 max-w-[150px] truncate" title={tx.vendorOrPayee || (tx.type === FinancialTransactionType.SALARY_PAYMENT ? tx.relatedEntityName : undefined)}>{tx.vendorOrPayee || (tx.type === FinancialTransactionType.SALARY_PAYMENT ? tx.relatedEntityName : '-')}</td>
                  <td className="px-3 py-2 whitespace-nowrap space-x-1 space-x-reverse">
                    <Button variant="ghost" size="sm" onClick={() => handleViewTransaction(tx)} title="عرض التفاصيل"><EyeIcon className="w-4 h-4 text-primary dark:text-primary-light" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditTransaction(tx)} title="تعديل"><PencilIcon className="w-4 h-4 text-yellow-600 dark:text-yellow-400" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteTransaction(tx.id)} className="text-danger hover:text-red-700 dark:text-red-400 dark:hover:text-red-500" title="حذف"><TrashIcon className="w-4 h-4" /></Button>
                  </td>
                </tr>
              ))}
              {filteredTransactions.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-500 dark:text-gray-400">
                     <FolderIcon className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                    لا توجد معاملات مالية تطابق معايير البحث الحالية.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {summary.count > 0 && (
             <div className="mt-6 p-4 bg-gray-100 dark:bg-dm-card/70 rounded-lg text-sm">
                <h4 className="font-semibold text-md text-primary-dark dark:text-primary-light mb-2">ملخص المعاملات المعروضة:</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <p><strong>إجمالي المعاملات:</strong> {summary.count}</p>
                    <p><strong>إجمالي الإيرادات:</strong> <span className="font-bold text-success">{summary.totalIncome.toFixed(3)} د.ك</span></p>
                    <p><strong>إجمالي المصروفات:</strong> <span className="font-bold text-danger">{summary.totalExpenses.toFixed(3)} د.ك</span></p>
                    <p><strong>صافي الرصيد:</strong> <span className={`font-bold ${summary.netBalance >=0 ? 'text-success' : 'text-danger'}`}>{summary.netBalance.toFixed(3)} د.ك</span></p>
                </div>
            </div>
        )}
      </Card>

      <FinancialTransactionFormModal
        isOpen={isFormModalOpen}
        onClose={() => {setIsFormModalOpen(false); setFormPredefinedType(undefined);}}
        onSubmit={handleFormSubmit}
        initialData={editingTransaction}
        predefinedType={formPredefinedType}
      />
      <ViewFinancialTransactionModal
        transaction={viewingTransaction}
        onClose={() => setViewingTransaction(null)}
        onEdit={(transactionToEdit) => { setViewingTransaction(null); handleEditTransaction(transactionToEdit); }}
      />
    </div>
  );
};

export default FinancialManagementPage;
