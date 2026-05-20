import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useToast } from '../components/ui/Toast';
import { 
    BanknotesIcon, 
    PlusCircleIcon, 
    SparklesIcon, 
    MagnifyingGlassIcon, 
    ChevronDownIcon, 
    EyeIcon, 
    DocumentDuplicateIcon, 
    TrashIcon, 
    PencilIcon, 
    ClockIcon,
    ExclamationTriangleIcon,
    XIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    ArrowDownTrayIcon,
    ArrowPathIcon,
    ScaleIcon,
    BriefcaseIcon,
    ChartBarIcon,
    CalculatorIcon,
    ReceiptPercentIcon,
    UsersIcon,
    ShieldCheckIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    PlusIcon,
    CreditCardIcon,
    PresentationChartLineIcon,
    DocumentTextIcon,
    ChevronRightIcon,
    PaperAirplaneIcon,
    ChatBubbleLeftRightIcon,
    PrinterIcon,
    ArrowUpRightIcon,
    ArrowDownRightIcon,
    BuildingLibraryIcon
} from '../constants';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import PrintHeader from '../components/ui/PrintHeader';
import { geminiService } from '../services/geminiService';
import { 
    FinancialTransaction, 
    FinancialTransactionType, 
    PaymentMethod, 
    ExpenseCategory 
} from '../types';
import { 
    financialTransactionTypeOptions, 
    paymentMethodOptions, 
    currencyOptions 
} from '../constants';
import { initialCases } from '../data/caseData';

// --- MOCK DATA ---
export const mockFinancialTransactions: FinancialTransaction[] = [
  {
    id: 'ft-1',
    transactionDate: '2024-05-10',
    type: FinancialTransactionType.REVENUE,
    description: 'أتعاب الترافع في قضية بنك بوبيان - القسط الثاني',
    amount: 2500.000,
    currency: 'KWD',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    category: 'LEGAL_FEES',
    vendorOrPayee: 'بنك بوبيان ش.م.ك',
    invoiceNumber: 'INV-2024-001',
    recordedBy: 'أحمد المحاسب',
    createdAt: '2024-05-10',
    relatedToEntity: 'case',
    relatedEntityId: 'case-101',
    relatedEntityName: 'بنك بوبيان ضد شركة المقاولات'
  },
  {
    id: 'ft-2',
    transactionDate: '2024-05-01',
    type: FinancialTransactionType.EXPENSE,
    description: 'إيجار مقر المكتب الرئيسي - شهر مايو',
    amount: -850.000,
    currency: 'KWD',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    category: ExpenseCategory.RENT,
    vendorOrPayee: 'شركة المشاريع العقارية',
    invoiceNumber: 'RENT-MAY-24',
    isRecurring: true,
    recordedBy: 'النظام الآلي',
    createdAt: '2024-05-01'
  },
  {
    id: 'ft-3',
    transactionDate: '2024-05-05',
    type: FinancialTransactionType.SALARY_PAYMENT,
    description: 'رواتب الموظفين والمستشارين - شهر أبريل',
    amount: -12450.000,
    currency: 'KWD',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    category: ExpenseCategory.SALARIES,
    vendorOrPayee: 'كافة الموظفين',
    recordedBy: 'إدارة الموارد البشرية',
    createdAt: '2024-05-05'
  },
  {
    id: 'ft-4',
    transactionDate: '2024-05-12',
    type: FinancialTransactionType.REVENUE,
    description: 'استشارة قانونية فورية - تأسيس شركة مساهمة',
    amount: 500.000,
    currency: 'KWD',
    paymentMethod: PaymentMethod.KNET,
    category: 'CONSULTATION',
    vendorOrPayee: 'علي محمد الغانم',
    invoiceNumber: 'CS-2024-45',
    recordedBy: 'السكرتارية',
    createdAt: '2024-05-12'
  },
  {
    id: 'ft-5',
    transactionDate: '2024-05-08',
    type: FinancialTransactionType.EXPENSE,
    description: 'رسوم اشتراك قاعدة بيانات LexisNexis السنوي',
    amount: -1200.000,
    currency: 'USD',
    paymentMethod: PaymentMethod.CREDIT_CARD,
    category: ExpenseCategory.OFFICE_SUPPLIES,
    vendorOrPayee: 'LexisNexis Global',
    invoiceNumber: 'LN-SUBS-2024',
    recordedBy: 'أحمد المحاسب',
    createdAt: '2024-05-08'
  },
  {
    id: 'ft-tax-1',
    transactionDate: '2024-04-15',
    type: FinancialTransactionType.EXPENSE,
    description: 'سداد ضريبة دعم العمالة الوطنية - الربع الأول 2024',
    amount: -3200.000,
    currency: 'KWD',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    category: 'TAX_ZAKAT',
    vendorOrPayee: 'وزارة المالية - الكويت',
    invoiceNumber: 'TAX-2024-001RT',
    recordedBy: 'أحمد المحاسب',
    createdAt: '2024-04-15'
  },
  {
    id: 'ft-comm-1',
    transactionDate: '2024-05-25',
    type: FinancialTransactionType.EXPENSE,
    description: 'عمولة المحامي المنتدب - قضية شركة المقاولات',
    amount: -350.000,
    currency: 'KWD',
    paymentMethod: PaymentMethod.CASH,
    category: ExpenseCategory.SALARIES,
    vendorOrPayee: 'المحامي فهد الخالد',
    recordedBy: 'أحمد المحاسب',
    createdAt: '2024-05-25',
    relatedToEntity: 'employee',
    relatedEntityId: 'emp-105'
  },
  {
    id: 'ft-cons-1',
    transactionDate: '2024-05-22',
    type: FinancialTransactionType.REVENUE,
    description: 'أتعاب استشارة عقد تأسيس شركة (VIP)',
    amount: 1500.000,
    currency: 'KWD',
    paymentMethod: PaymentMethod.KNET,
    category: 'LEGAL_CONSULTATION',
    vendorOrPayee: 'مجموعة المرزوق التجارية',
    invoiceNumber: 'CONS-2024-88',
    recordedBy: 'فاطمة علي',
    createdAt: '2024-05-22'
  },
  {
    id: 'ft-petty-1',
    transactionDate: '2024-05-21',
    type: FinancialTransactionType.EXPENSE,
    description: 'نثريات المكتب (قرطاسية ومستلزمات ضيافة)',
    amount: -45.500,
    currency: 'KWD',
    paymentMethod: PaymentMethod.CASH,
    category: ExpenseCategory.OFFICE_SUPPLIES,
    vendorOrPayee: 'سوق السالمية',
    recordedBy: 'السكرتارية',
    createdAt: '2024-05-21'
  },
  {
    id: 'ft-maint-1',
    transactionDate: '2024-05-15',
    type: FinancialTransactionType.EXPENSE,
    description: 'صيانة وقائية لأجهزة التكييف والشبكة الرئيسية',
    amount: -450.000,
    currency: 'KWD',
    paymentMethod: PaymentMethod.CASH,
    category: ExpenseCategory.OFFICE_SUPPLIES,
    vendorOrPayee: 'شركة الصفاة للخدمات الفنية',
    invoiceNumber: 'MAINT-7822',
    recordedBy: 'السكرتارية',
    createdAt: '2024-05-15'
  },
  {
    id: 'ft-asset-1',
    transactionDate: '2024-03-20',
    type: FinancialTransactionType.EXPENSE,
    description: 'تجديد أجهزة الحاسب الآلي (تجهيز 5 محطات عمل للمستشارين)',
    amount: -2150.000,
    currency: 'KWD',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    category: 'CAPITAL_EXPENDITURE',
    vendorOrPayee: 'إكسايت للالكترونيات',
    recordedBy: 'أحمد المحاسب',
    createdAt: '2024-03-20',
    notes: 'تمت إضافة الأجهزة لسجل الأصول الاستهلاكية'
  },
  {
    id: 'ft-refund-1',
    transactionDate: '2024-05-16',
    type: FinancialTransactionType.REVENUE,
    description: 'استرداد مصاريف قضية رقم 55/2024 (رسوم خبراء مستردة)',
    amount: 300.000,
    currency: 'KWD',
    paymentMethod: PaymentMethod.CHEQUE,
    category: 'LEGAL_EXPENSES_RECOVERY',
    vendorOrPayee: 'خزينة المحكمة الكلية',
    recordedBy: 'أحمد المحاسب',
    createdAt: '2024-05-16',
    relatedToEntity: 'case',
    relatedEntityId: 'case-202',
    relatedEntityName: 'صبري ضد شركة الأغذية'
  },
  {
    id: 'ft-trust-1',
    transactionDate: '2024-05-20',
    type: FinancialTransactionType.REVENUE,
    description: 'إيداع أمانة تعويض حكم نهائي - قضية رقم 1234/2023',
    amount: 15000.000,
    currency: 'KWD',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    category: 'TRUST_ACCOUNT',
    vendorOrPayee: 'شركة الخليج للتأمين',
    invoiceNumber: 'TRUST-2024-01',
    recordedBy: 'أحمد المحاسب',
    createdAt: '2024-05-20',
    relatedToEntity: 'case',
    relatedEntityId: 'case-303',
    relatedEntityName: 'خالد محمد ضد شركة الخليج'
  },
  { 
    id: 'ft-adv-1', 
    transactionDate: '2024-05-30', 
    type: FinancialTransactionType.EXPENSE, 
    amount: -450.0, 
    currency: 'KWD', 
    category: 'MARKETING', 
    description: 'إعلانات وسائل التواصل الاجتماعي - حملة مايو', 
    paymentMethod: PaymentMethod.CREDIT_CARD, 
    vendorOrPayee: 'Meta Platforms', 
    recordedBy: 'أحمد المحاسب', 
    createdAt: '2024-05-30' 
  },
  { 
    id: 'ft-fees-1', 
    transactionDate: '2024-05-28', 
    type: FinancialTransactionType.REVENUE, 
    amount: 3200.0, 
    currency: 'KWD', 
    category: 'LEGAL_FEES', 
    description: 'أتعاب قضية التمييز رقم 887/2023', 
    paymentMethod: PaymentMethod.BANK_TRANSFER, 
    vendorOrPayee: 'شركة الصناعات الوطنية', 
    recordedBy: 'فاطمة علي', 
    createdAt: '2024-05-28', 
    invoiceNumber: 'INV-2024-105' 
  }
];

// --- COMPONENTS ---

const mockBankAccounts = [
  { id: 'bank-1', name: 'بنك بوبيان - الحساب الرئيسي', accountNumber: '**** 5566', balance: 45000, type: 'جارٍ' },
  { id: 'bank-2', name: 'بنك الخليج - حساب الأمانات', accountNumber: '**** 8822', balance: 125000, type: 'أمانات' },
  { id: 'bank-3', name: 'بيت التمويل الكويتي - الرواتب', accountNumber: '**** 1144', balance: 15000, type: 'جارٍ' },
];

// --- MOCK DATA ---

const mockInvoices = [
  { id: 'INV-2024-001', clientName: 'شركة الأمل للتجارة', amount: 4500.000, status: 'paid', date: '2024-05-10', dueDate: '2024-05-20', type: 'أتعاب محاماة' },
  { id: 'INV-2024-002', clientName: 'خالد الصقر', amount: 1200.000, status: 'partial', date: '2024-05-12', dueDate: '2024-05-25', type: 'استشارة قانونية' },
  { id: 'INV-2024-003', clientName: 'بنك الخليج العربي', amount: 8900.500, status: 'pending', date: '2024-05-14', dueDate: '2024-06-14', type: 'قضايا عمالية' },
  { id: 'INV-2024-004', clientName: 'وزارة الصحة', amount: 15600.000, status: 'overdue', date: '2024-04-01', dueDate: '2024-05-01', type: 'مطالبات مالية' },
];

const mockTrustAccounts = [
  { id: 'TR-101', clientName: 'فهد محمد العجمي', totalBalance: 125000.000, pendingDisbursements: 15000.000, lastActivity: '2024-05-14', caseId: 'CASE-2024-882' },
  { id: 'TR-102', clientName: 'شركة بوبيان للملاحة', totalBalance: 45600.750, pendingDisbursements: 0, lastActivity: '2024-05-10', caseId: 'CASE-2024-115' },
  { id: 'TR-103', clientName: 'سارة عبدالرحمن', totalBalance: 8900.000, pendingDisbursements: 2500.000, lastActivity: '2024-05-05', caseId: 'CASE-2024-441' },
];


const FinancialManagementPage: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'journal' | 'analytics' | 'invoices' | 'trust' | 'banks' | 'reports' | 'documents' | 'ai'>('journal');
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(mockFinancialTransactions);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedTxForPreview, setSelectedTxForPreview] = useState<FinancialTransaction | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);

  // AI Assistant State
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
    { role: 'model', content: 'مرحباً بك في مركز التحليلات المالية الذكي. يمكنني مساعدتك في استخراج تقارير، تحليل النفقات، أو تقديم توقعات حول التدفقات النقدية للمكتب. كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isAiLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsAiLoading(true);

    try {
      const history = chatMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const contextPrompt = `
        معلومات مالية حالية للمكتب:
        - إجمالي الإيرادات: ${formatCurrency(stats.revenue)}
        - إجمالي المصروفات: ${formatCurrency(stats.expenses)}
        - صافي الربح: ${formatCurrency(stats.profit)}
        - أمانات الموكلين: ${formatCurrency(stats.trustAmount)}
        - عدد القيود المسجلة: ${transactions.length}
        
        طلب المستخدم: ${userMessage}
      `;

      const response = await geminiService.getChatbotResponse(contextPrompt, history);
      setChatMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'model', content: 'عذراً، واجهت مشكلة في معالجة طلبك المالي. يرجى المحاولة مرة أخرى.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const [formData, setFormData] = useState<Partial<FinancialTransaction>>({
    transactionDate: new Date().toISOString().split('T')[0],
    type: FinancialTransactionType.EXPENSE,
    amount: 0,
    currency: 'KWD',
    description: '',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (tx.vendorOrPayee && tx.vendorOrPayee.toLowerCase().includes(searchQuery.toLowerCase())) ||
                           tx.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = !filterType || tx.type === filterType;
      const matchesStartDate = !startDate || tx.transactionDate >= startDate;
      const matchesEndDate = !endDate || tx.transactionDate <= endDate;
      return matchesSearch && matchesType && matchesStartDate && matchesEndDate;
    });
  }, [transactions, searchQuery, filterType, startDate, endDate]);

  const stats = useMemo(() => {
    const revenue = transactions.filter(t => t.amount > 0 && t.category !== 'TRUST_ACCOUNT').reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const trustAmount = transactions.filter(t => t.category === 'TRUST_ACCOUNT').reduce((sum, t) => sum + t.amount, 0);
    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      trustAmount
    };
  }, [transactions]);

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من رغبتك في حذف هذا القيد المالي؟')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      addToast({
        type: 'success',
        title: 'تم حذف القيد',
        message: 'تم إزالة الحركة المالية من السجل بنجاح.'
      });
    }
  };

  const handleEdit = (tx: FinancialTransaction) => {
    setEditingTransaction(tx);
    setFormData(tx);
    setIsFormModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.description || !formData.amount) {
        addToast({
            type: 'error',
            title: 'بيانات ناقصة',
            message: 'يرجى إكمال البيانات الأساسية (الوصف والمبلغ) قبل الحفظ.'
        });
        return;
    }

    if (editingTransaction) {
        setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...formData } as FinancialTransaction : t));
        addToast({
            type: 'success',
            title: 'تم التحديث',
            message: 'تم تحديث بيانات القيد المالي بنجاح.'
        });
    } else {
        const newTx: FinancialTransaction = {
            ...formData,
            id: `ft-${Date.now()}`,
            createdAt: new Date().toISOString(),
            recordedBy: 'مدير النظام'
        } as FinancialTransaction;
        setTransactions([newTx, ...transactions]);
        addToast({
            type: 'success',
            title: 'إضافة قيد',
            message: 'تمت إضافة القيد المالي الجديد إلى السجل.'
        });
    }
    setIsFormModalOpen(false);
    setEditingTransaction(null);
    setFormData({
        transactionDate: new Date().toISOString().split('T')[0],
        type: FinancialTransactionType.EXPENSE,
        amount: 0,
        currency: 'KWD',
        description: '',
        paymentMethod: PaymentMethod.BANK_TRANSFER,
    });
  };

  const formatCurrency = (amount: number, currency: string = 'KWD') => {
    return new Intl.NumberFormat('ar-KW', { style: 'currency', currency }).format(amount);
  };

  const getTxTypeLabel = (type: FinancialTransactionType) => {
    return financialTransactionTypeOptions.find(o => o.value === type)?.label || type;
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen font-sans text-right pb-32" dir="rtl">
      <PrintHeader title="تقرير الإدارة المالية والتدفقات النقدية" subtitle="تقرير شامل بالمركز المالي وأمانات الموكلين" />

      {/* Premium Header */}
      <div className="max-w-7xl mx-auto mb-10 no-print">
          <div className="bg-primary-dark rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary-light/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl" />
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                          <div className="p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                              <BanknotesIcon className="w-8 h-8 text-white" />
                          </div>
                          <div>
                              <span className="text-primary-light font-black uppercase tracking-widest text-[10px]">Financial Intelligence Center</span>
                              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mt-1">
                                  الإدارة المالية <span className="text-amber-400">المركزية</span>
                              </h1>
                          </div>
                      </div>
                      <p className="text-primary-light/70 text-lg max-w-2xl font-medium leading-relaxed">
                          نظام محاسبي ذكي متخصص للمكاتب القانونية الكبرى، يدير التدفقات النقدية، الفواتير الإلكترونية، وأمانات الموكلين بدقة متناهية وفق المعايير المالية الدولية.
                      </p>
                  </div>
                  
                  <div className="flex flex-col gap-3 w-full md:w-auto">
                      <Button 
                          onClick={() => {
                              setEditingTransaction(null);
                              setFormData({
                                  transactionDate: new Date().toISOString().split('T')[0],
                                  type: FinancialTransactionType.REVENUE,
                                  amount: 0,
                                  currency: 'KWD',
                                  description: '',
                                  paymentMethod: PaymentMethod.BANK_TRANSFER,
                              });
                              setIsFormModalOpen(true);
                          }}
                          leftIcon={<PlusCircleIcon className="w-6 h-6" />}
                          size="lg"
                          className="bg-amber-500 hover:bg-amber-600 text-amber-950 shadow-2xl shadow-amber-500/20 rounded-2xl px-10 h-16 text-lg font-black group"
                      >
                          <span className="group-hover:scale-105 transition-transform">قيد مالي جديد</span>
                      </Button>
                      <div className="flex gap-3">
                          <button 
                            onClick={() => window.print()}
                            className="flex-1 md:flex-initial h-12 px-6 bg-white/10 border border-white/20 rounded-xl text-white font-bold hover:bg-white/20 flex items-center justify-center gap-2 transition-all shadow-sm"
                          >
                              <ArrowDownTrayIcon className="w-5 h-5" />
                              تصدير كشف
                          </button>
                          <button 
                            onClick={() => setActiveTab('ai')}
                            className="flex-1 md:flex-initial h-12 px-6 bg-white/10 border border-white/20 rounded-xl text-white font-bold hover:bg-white/20 flex items-center justify-center gap-2 transition-all shadow-sm"
                          >
                              <SparklesIcon className="w-5 h-5" />
                              التحليل الذكي
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 no-print">
          <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-gradient-to-br from-indigo-600 to-primary text-white relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-110 transition-transform" />
              <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                          <BanknotesIcon className="w-6 h-6" />
                      </div>
                      <Badge variant="success" size="xs" text="+12.5%" className="bg-white/20 border-none text-white font-black" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">إجمالي الإيرادات</p>
                  <h3 className="text-3xl font-black font-mono tracking-tighter">
                    {formatCurrency(transactions.filter(t => t.amount > 0).reduce((acc, t) => acc + t.amount, 0))}
                  </h3>
              </div>
          </Card>

          <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-dm-card group hover:scale-[1.02] transition-all border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-600 group-hover:text-white transition-all">
                      <ArrowDownRightIcon className="w-6 h-6" />
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي المصروفات</p>
                      <h3 className="text-3xl font-black text-rose-600 font-mono tracking-tighter">
                        {formatCurrency(Math.abs(transactions.filter(t => t.amount < 0).reduce((acc, t) => acc + t.amount, 0)))}
                      </h3>
                  </div>
              </div>
          </Card>

          <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-dm-card group hover:scale-[1.02] transition-all border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <PresentationChartLineIcon className="w-6 h-6" />
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">صافي الأرباح</p>
                      <h3 className="text-3xl font-black text-emerald-600 font-mono tracking-tighter">
                        {formatCurrency(transactions.reduce((acc, t) => acc + t.amount, 0))}
                      </h3>
                  </div>
              </div>
          </Card>

          <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-dm-card group hover:scale-[1.02] transition-all border border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-4">
                  <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all">
                      <ShieldCheckIcon className="w-6 h-6" />
                  </div>
                  <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">أمانات الموكلين</p>
                      <h3 className="text-3xl font-black text-amber-600 font-mono tracking-tighter">
                        {formatCurrency(182450.000)}
                      </h3>
                  </div>
              </div>
          </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mb-10 no-print overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 bg-white dark:bg-dm-card p-2 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 w-fit">
              {[
                  { id: 'journal', label: 'دفتر اليومية', icon: ChartBarIcon },
                  { id: 'invoices', label: 'الفواتير الإلكترونية', icon: DocumentTextIcon },
                  { id: 'trust', label: 'حسابات الأمانة', icon: ShieldCheckIcon },
                  { id: 'banks', label: 'الحسابات البنكية', icon: CreditCardIcon },
                  { id: 'reports', label: 'التقارير المالية', icon: DocumentDuplicateIcon },
                  { id: 'documents', label: 'الأرشيف المالي', icon: DocumentTextIcon },
                  { id: 'ai', label: 'المساعد الذكي AI', icon: SparklesIcon },
              ].map(tab => (
                  <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-3 px-8 py-4 rounded-[1.5rem] text-sm font-black transition-all duration-300 whitespace-nowrap ${
                          activeTab === tab.id 
                          ? 'bg-primary text-white shadow-xl shadow-primary/20 scale-105' 
                          : 'text-gray-400 hover:text-primary hover:bg-primary/5'
                      }`}
                  >
                        <tab.icon className="w-5 h-5" />
                        {tab.label}
                  </button>
              ))}
          </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'journal' && (
            <motion.div 
              key="journal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
                {/* AI Insights Header */}
                <div className="bg-gradient-to-r from-slate-900 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-1000"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="p-5 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl">
                                <SparklesIcon className="w-10 h-10 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tighter mb-1">ملخص الذكاء المالي</h2>
                                <p className="text-white/60 text-sm font-medium">بناءً على قيود اليومية، يلاحظ النظام انخفاضاً بنسبة <span className="text-emerald-400 font-bold">15%</span> في المصاريف النثرية لهذا الشهر.</p>
                            </div>
                        </div>
                        <Button className="bg-white text-indigo-900 hover:bg-primary hover:text-white rounded-2xl h-14 px-8 font-black shadow-xl transition-all">تحليل أعمق AI</Button>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 bg-white dark:bg-dm-card p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-xl no-print">
                    <div className="md:col-span-2">
                        <Input 
                            placeholder="ابحث في التاريخ، الوصف، المستفيد..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={<MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />}
                        />
                    </div>
                    <div>
                        <Select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            options={[
                                { label: 'جميع الأنواع', value: '' },
                                ...financialTransactionTypeOptions
                            ]}
                        />
                    </div>
                    <div className="md:col-span-2">
                        <div className="flex gap-2">
                            <Input 
                                type="date" 
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="flex-1"
                            />
                            <Input 
                                type="date" 
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="flex-1"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        {(startDate || endDate || filterType || searchQuery) && (
                            <button 
                                onClick={() => { setStartDate(''); setEndDate(''); setFilterType(''); setSearchQuery(''); }}
                                className="text-xs font-bold text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-xl transition-all"
                            >
                                مسح التصفية
                            </button>
                        )}
                    </div>
                </div>

                {/* Desktop Table / Mobile Cards */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">التاريخ</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">النوع / التصنيف</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">البيان</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-left">المبلغ</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">التحكم</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-700">{tx.transactionDate}</span>
                                                <span className="text-[10px] text-gray-400 font-mono italic">#{tx.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <Badge variant={tx.amount > 0 ? 'success' : 'danger'} size="sm" text={getTxTypeLabel(tx.type)} className="w-fit mb-1" />
                                                <span className="text-[10px] text-gray-400 font-bold">{tx.category}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900 leading-relaxed">{tx.description}</span>
                                                <span className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                                                    <UsersIcon className="w-3 h-3" />
                                                    {tx.vendorOrPayee || 'غير محدد'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-left">
                                            <span className={`text-sm font-black font-mono ${tx.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount, tx.currency)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    className="p-2 hover:bg-primary/5 rounded-full text-primary transition-all active:scale-90"
                                                    onClick={() => setSelectedTxForPreview(tx)}
                                                    title="معاينة وطباعة"
                                                >
                                                    <PrinterIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    className="p-2 hover:bg-amber-50 rounded-full text-amber-500 transition-all active:scale-90"
                                                    onClick={() => handleEdit(tx)}
                                                    title="تعديل"
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    className="p-2 hover:bg-rose-50 rounded-full text-rose-500 transition-all active:scale-90"
                                                    onClick={() => handleDelete(tx.id)}
                                                    title="حذف"
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredTransactions.length === 0 && (
                        <div className="text-center py-20">
                            <BanknotesIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">لا توجد سجلات مالية</h3>
                            <p className="text-gray-400 text-sm">جرب تغيير معايير البحث أو أضف قيداً جديداً</p>
                        </div>
                    )}
                </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="space-y-6"
            >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="flex justify-between items-start mb-8">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">النمو المالي والتدفق النقدي</h2>
                                    <p className="text-xs text-gray-400">مقارنة شهرية بين الإيرادات والمصروفات للسنة الجارية.</p>
                                </div>
                                <div className="flex gap-2">
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                        <div className="w-2 h-2 rounded-full bg-primary"></div> إيرادات
                                    </span>
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                        <div className="w-2 h-2 rounded-full bg-rose-400"></div> مصروفات
                                    </span>
                                </div>
                            </div>
                            
                            {/* Mock Chart Area */}
                            <div className="h-64 flex items-end justify-between gap-2 px-2">
                                {[40, 60, 45, 90, 65, 80, 50, 85].map((v, i) => (
                                    <div key={i} className="flex-1 flex gap-1 items-end h-full group relative">
                                        <div className="flex-1 bg-primary/20 rounded-t group-hover:bg-primary transition-all" style={{ height: `${v}%` }}></div>
                                        <div className="flex-1 bg-rose-400/20 rounded-t group-hover:bg-rose-400 transition-all" style={{ height: `${v * 0.6}%` }}></div>
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap">
                                            إيراد: {v * 100} د.ك
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-4 px-2">
                                 {['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس'].map(m => (
                                     <span key={m} className="text-[10px] text-gray-400 font-bold">{m}</span>
                                 ))}
                            </div>
                        </div>

                        {/* Budget vs Actual Section */}
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-900">مراقبة الميزانية التقديرية (2024)</h3>
                                <Button variant="ghost" size="sm" className="text-primary">تعديل الميزانية</Button>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { label: 'رواتب ومكافئات', budget: 150000, actual: 142000, color: 'bg-primary' },
                                    { label: 'إيجارات وخدمات', budget: 12000, actual: 11500, color: 'bg-indigo-500' },
                                    { label: 'تسويق واشتراكات', budget: 8000, actual: 9200, color: 'bg-rose-500' },
                                    { label: 'أدوات مكتبية وصيانة', budget: 5000, actual: 3800, color: 'bg-emerald-500' },
                                ].map((item, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-sm font-bold text-gray-700">{item.label}</span>
                                            <span className="text-[10px] text-gray-400 font-mono">
                                                {formatCurrency(item.actual)} / {formatCurrency(item.budget)}
                                            </span>
                                        </div>
                                        <div className="w-full h-3 bg-gray-50 rounded-full overflow-hidden flex">
                                            <div 
                                                className={`h-full ${item.color} rounded-full transition-all duration-1000`} 
                                                style={{ width: `${Math.min(100, (item.actual / item.budget) * 100)}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                            <span className={item.actual > item.budget ? 'text-rose-600' : 'text-emerald-600'}>
                                                {item.actual > item.budget ? 'تجاوز' : 'ضمن الميزانية'} ({Math.round((item.actual / item.budget) * 100)}%)
                                            </span>
                                            <span className="text-gray-400">المتبقي: {formatCurrency(Math.max(0, item.budget - item.actual))}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-slate-900 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-[10px] font-bold text-white/50 uppercase mb-4 tracking-widest">توقعات الذكاء الاصطناعي</p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary rounded-lg">
                                            <SparklesIcon className="w-5 h-5 text-white" />
                                        </div>
                                        <p className="text-sm font-medium">يتوقع النظام زيادة في الأرباح بنسبة <span className="text-emerald-400 font-bold">12%</span> الربع القادم.</p>
                                    </div>
                                    <div className="h-px bg-white/10"></div>
                                    <p className="text-[10px] text-white/60 leading-relaxed italic">
                                        * بناءً على العقود النشطة في قسم المقاولات ومعدل التحصيل التاريخي لشركائنا بقطاع البنوك.
                                    </p>
                                </div>
                            </div>
                            <ChartBarIcon className="absolute -bottom-6 -left-6 w-32 h-32 text-white/5 -rotate-12" />
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">هيكل المصروفات</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600">الرواتب والأجور</span>
                                        <span className="font-bold">65%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: '65%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600">الإيجار الخدمات</span>
                                        <span className="font-bold">20%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-400" style={{ width: '20%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600">أخرى ومستهلكات</span>
                                        <span className="font-bold">15%</span>
                                    </div>
                                    <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-400" style={{ width: '15%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Intelligence Feature Section */}
                <div className="bg-white p-10 rounded-3xl border border-gray-100 shadow-xl text-center">
                    <div className="bg-primary/10 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <CalculatorIcon className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">أداة محاكاة القرارات المالية</h2>
                    <p className="text-gray-500 max-w-xl mx-auto mb-8 text-sm leading-relaxed">
                        قم بإسقاط سيناريوهات مالية افتراضية (مثل زيادة عدد المحامين أو فتح فرع جديد) وشاهد التأثير المباشر والبعيد المدى على ربحية المكتب.
                    </p>
                    <Button variant="outline" size="lg">ابدأ المحاكاة الآن</Button>
                </div>
            </motion.div>
          )}

          {activeTab === 'invoices' && (
             <motion.div 
               key="invoices"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-8"
             >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 no-print">
                    {[
                        { label: 'إجمالي المفوتر', value: 30200, icon: DocumentTextIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                        { label: 'المحصل فعلياً', value: 5700, icon: CheckCircleIcon, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'بانتظار السداد', value: 8900, icon: ClockIcon, color: 'text-amber-600', bg: 'bg-amber-50' },
                        { label: 'فواتير متأخرة', value: 15600, icon: ExclamationTriangleIcon, color: 'text-rose-600', bg: 'bg-rose-50' },
                    ].map((s, i) => (
                        <Card key={i} className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-dm-card">
                            <div className="flex justify-between items-start mb-6">
                                <div className={`p-4 ${s.bg} ${s.color} rounded-2xl`}>
                                    <s.icon className="w-6 h-6" />
                                </div>
                                <Badge variant="info" size="xs" text="2024" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <h4 className="text-3xl font-black text-gray-900 dark:text-dm-text font-mono tracking-tighter">{formatCurrency(s.value)}</h4>
                        </Card>
                    ))}
                </div>

                <Card className="rounded-[3rem] overflow-hidden border-none shadow-xl bg-white dark:bg-dm-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right" dir="rtl">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-dm-background/50 border-b border-gray-100 dark:border-gray-800">
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">رقم الفاتورة</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">العميل والبيان</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">المبلغ</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">الاستحقاق</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">الحالة</th>
                                    <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                {mockInvoices.map(inv => (
                                    <tr key={inv.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-gray-50 dark:bg-dm-background rounded-xl text-primary"><DocumentTextIcon className="w-5 h-5" /></div>
                                                <span className="font-mono font-black text-xs">{inv.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-gray-900 dark:text-dm-text">{inv.clientName}</span>
                                                <span className="text-[10px] text-gray-400 font-bold">{inv.type}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-left">
                                            <span className="text-lg font-black text-primary font-mono">{formatCurrency(inv.amount)}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="text-xs font-bold text-gray-400">{inv.dueDate}</span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <Badge 
                                                variant={inv.status === 'paid' ? 'success' : inv.status === 'overdue' ? 'danger' : 'info'} 
                                                size="sm" 
                                                text={inv.status === 'paid' ? 'تم تحصيلها' : inv.status === 'overdue' ? 'متأخرة' : 'قيد الانتظار'} 
                                            />
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 hover:bg-white rounded-xl shadow-sm text-primary transition-all active:scale-90"><PrinterIcon className="w-5 h-5" /></button>
                                                <button className="p-2 hover:bg-white rounded-xl shadow-sm text-gray-400 active:scale-90"><PencilIcon className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
             </motion.div>
          )}

          {activeTab === 'reports' && (
             <motion.div 
               key="reports"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               className="space-y-8"
             >
                {/* Reports Header & Selection */}
                <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">مركز التقارير المالية المتطور</h2>
                        <p className="text-sm text-gray-500">قم بتوليد التقارير التفصيلية، الميزانيات، وفشوفات الحسابات لفترات زمنية مخصصة.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" onClick={() => {
                            const today = new Date();
                            setStartDate(new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]);
                            setEndDate(new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]);
                        }}>هذا الشهر</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                            const today = new Date();
                            const currentQuarter = Math.floor(today.getMonth() / 3);
                            setStartDate(new Date(today.getFullYear(), currentQuarter * 3, 1).toISOString().split('T')[0]);
                            setEndDate(new Date(today.getFullYear(), (currentQuarter + 1) * 3, 0).toISOString().split('T')[0]);
                        }}>هذا الربع</Button>
                        <Button variant="outline" size="sm" onClick={() => {
                            setStartDate(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
                            setEndDate(new Date().toISOString().split('T')[0]);
                        }}>هذه السنة</Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Report Types List */}
                    <div className="space-y-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-primary/50 transition-all cursor-pointer group">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <ChartBarIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">تقرير الأرباح والخسائر</h3>
                                    <p className="text-[10px] text-gray-400 uppercase font-black">Profit & Loss Statement</p>
                                </div>
                             </div>
                             <p className="text-xs text-gray-500 leading-relaxed mb-4">كشف تفصيلي بالإيرادات التشغيلية مخصوماً منها التكاليف الإدارية والمصاريف العمومية.</p>
                             <Button variant="ghost" size="sm" fullWidth leftIcon={<ArrowDownTrayIcon className="w-4 h-4"/>}>تحميل التقرير PDF</Button>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-primary/50 transition-all cursor-pointer group text-right">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-amber-50 rounded-2xl text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                    <ScaleIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">ميزان المراجعة</h3>
                                    <p className="text-[10px] text-gray-400 uppercase font-black">Trial Balance</p>
                                </div>
                             </div>
                             <p className="text-xs text-gray-500 leading-relaxed mb-4">نظرة شاملة على جميع أرصدة الحسابات المدينة والدائنة لضمان التوازن المحاسبي.</p>
                             <Button variant="ghost" size="sm" fullWidth leftIcon={<DocumentTextIcon className="w-4 h-4"/>}>معاينة الكشف</Button>
                        </div>

                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:border-primary/50 transition-all cursor-pointer group text-right">
                             <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                    <ReceiptPercentIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">الملخص الضريبي والزكاة</h3>
                                    <p className="text-[10px] text-gray-400 uppercase font-black">Tax & Zakat Summary</p>
                                </div>
                             </div>
                             <p className="text-xs text-gray-500 leading-relaxed mb-4">احتساب الوعاء الضريبي وتقدير مبالغ الزكاة المستحقة بناءً على الأرباح المحققة.</p>
                             <Button variant="ghost" size="sm" fullWidth leftIcon={<ArrowPathIcon className="w-4 h-4"/>}>تحديث البيانات</Button>
                        </div>
                    </div>

                    {/* Report Preview / Generator */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-xl p-0 overflow-hidden flex flex-col min-h-[600px]">
                        <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                            <div>
                                <h4 className="font-black text-gray-900 uppercase">كشف حساب تفصيلي - معاينة</h4>
                                <p className="text-[10px] text-gray-400 font-bold">الفترة: {startDate || 'من الأزل'} إلى {endDate || 'اليوم'}</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-all text-gray-500 hover:text-primary"><ArrowDownTrayIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                        
                        <div className="p-10 flex-grow bg-white overflow-y-auto no-scrollbar font-serif">
                            {/* PDF/Print Style Preview */}
                            <div className="max-w-2xl mx-auto border-4 border-gray-50 p-8 min-h-[500px]">
                                <div className="flex justify-between items-start mb-12 border-b-2 border-primary pb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-primary mb-1">عدالة للخدمات القانونية</h2>
                                        <p className="text-xs text-gray-500">الكويت - مجمع برج الصفاة</p>
                                        <p className="text-xs text-gray-500">هاتف: 22446688</p>
                                    </div>
                                    <div className="text-left font-mono">
                                        <p className="text-[10px] text-gray-400 font-black">DOCUMENT: STATEMENT_OF_ACCOUNT</p>
                                        <p className="text-[10px] text-gray-400 font-black">DATE: {new Date().toLocaleDateString('ar-KW')}</p>
                                    </div>
                                </div>

                                <div className="mb-10">
                                    <h3 className="text-center text-xl font-bold bg-gray-50 py-3 mb-8 underline underline-offset-8">ملخص الحركة المالية خلال الفترة المختارة</h3>
                                    <div className="grid grid-cols-3 gap-px bg-gray-200 border border-gray-200 rounded-xl overflow-hidden">
                                        <div className="bg-white p-4 text-center">
                                            <p className="text-[10px] text-gray-400 font-black mb-1">إجمالي المقبوضات</p>
                                            <p className="text-lg font-black text-emerald-600">{formatCurrency(filteredTransactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0))}</p>
                                        </div>
                                        <div className="bg-white p-4 text-center border-x border-gray-100">
                                            <p className="text-[10px] text-gray-400 font-black mb-1">إجمالي المدفوعات</p>
                                            <p className="text-lg font-black text-rose-600">{formatCurrency(filteredTransactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0))}</p>
                                        </div>
                                        <div className="bg-white p-4 text-center">
                                            <p className="text-[10px] text-gray-400 font-black mb-1">صافي الرصيد</p>
                                            <p className="text-lg font-black text-primary">{formatCurrency(filteredTransactions.reduce((s, t) => s + t.amount, 0))}</p>
                                        </div>
                                    </div>
                                </div>

                                <table className="w-full text-xs text-right border-collapse mb-10">
                                    <thead>
                                        <tr className="bg-primary text-white">
                                            <th className="p-2 border border-gray-200">التاريخ</th>
                                            <th className="p-2 border border-gray-200">البيان والشرح</th>
                                            <th className="p-2 border border-gray-200">المبلغ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTransactions.slice(0, 10).map(tx => (
                                            <tr key={tx.id} className="border-b border-gray-50">
                                                <td className="p-2 border border-gray-100 font-mono italic">{tx.transactionDate}</td>
                                                <td className="p-2 border border-gray-100">{tx.description}</td>
                                                <td className="p-2 border border-gray-100 text-left font-bold">{formatCurrency(tx.amount)}</td>
                                            </tr>
                                        ))}
                                        {filteredTransactions.length > 10 && (
                                            <tr>
                                                <td colSpan={3} className="p-4 text-center text-gray-400 italic">... ومسجل {filteredTransactions.length - 10} حركات أخرى ضمت التقرير الكامل</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <div className="mt-auto pt-10 border-t border-gray-100 flex justify-between items-end opacity-50">
                                    <div className="text-[10px]">
                                        <p>توقيع المدير المالي</p>
                                        <div className="w-32 h-px bg-gray-300 mt-4"></div>
                                    </div>
                                    <div className="text-[10px]">
                                        <p>ختم المكتب الرسمي</p>
                                        <div className="w-20 h-20 border-2 border-primary/20 rounded-full flex items-center justify-center text-primary font-black opacity-20 rotate-12">عدالة</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                            <p className="text-xs text-gray-400 italic mb-4">* يتم توليد هذه التقارير بشكل آلي من قاعدة بيانات القيود المحاسبية للمكتب.</p>
                            <Button variant="primary" leftIcon={<SparklesIcon className="w-5 h-5" />}>توليد التقرير النهائي المختوم</Button>
                        </div>
                    </div>
                </div>
             </motion.div>
          )}

          {activeTab === 'documents' && (
             <motion.div 
               key="documents"
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="space-y-6"
             >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 space-y-4">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-xs font-black text-gray-400 uppercase mb-4 tracking-widest">تصنيفات الأرشيف</h3>
                            <nav className="space-y-1">
                                {[
                                    { label: 'فواتير الموردين', count: 124 },
                                    { label: 'سندات القبض', count: 85 },
                                    { label: 'كشوفات البنك', count: 12 },
                                    { label: 'عقود الإيجار', count: 3 },
                                    { label: 'وثائق ضريبية', count: 5 }
                                ].map((cat, i) => (
                                    <button key={i} className="w-full flex justify-between items-center px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                                        <span>{cat.label}</span>
                                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded-full">{cat.count}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <Button fullWidth variant="outline" leftIcon={<ArrowPathIcon className="w-4 h-4"/>}>مزامنة الماسح الضوئي</Button>
                    </div>

                    <div className="md:col-span-3 space-y-4">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                             <div className="relative flex-grow">
                                <MagnifyingGlassIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input type="text" placeholder="ابحث في المستندات المؤرشفة..." className="w-full pr-10 pl-4 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                             </div>
                             <Button variant="secondary" size="sm" leftIcon={<PlusIcon className="w-4 h-4"/>}>رفع مستند</Button>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                                { name: 'فاتورة صيانة - إداري', date: '2024-05-15', type: 'PDF', size: '1.2 MB' },
                                { name: 'إيصال سداد كهرباء', date: '2024-05-10', type: 'JPG', size: '3.4 MB' },
                                { name: 'كشف حساب بوبيان - مايو', date: '2024-05-01', type: 'PDF', size: '15.8 MB' },
                                { name: 'عقد توريد مستلزمات', date: '2024-04-20', type: 'PDF', size: '2.1 MB' },
                                { name: 'ضريبة دعم العمالة', date: '2024-04-15', type: 'PDF', size: '0.8 MB' },
                            ].map((doc, i) => (
                                <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden">
                                     <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors"></div>
                                     <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary/10 transition-colors">
                                            <DocumentTextIcon className="w-6 h-6 text-gray-400 group-hover:text-primary" />
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500"><EyeIcon className="w-4 h-4"/></button>
                                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500"><ArrowDownTrayIcon className="w-4 h-4"/></button>
                                        </div>
                                     </div>
                                     <h4 className="text-sm font-bold text-gray-800 mb-1 truncate">{doc.name}</h4>
                                     <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
                                         <span>{doc.date}</span>
                                         <span className="bg-gray-50 px-1.5 py-0.5 rounded font-mono">{doc.type}</span>
                                     </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
             </motion.div>
          )}

          {activeTab === 'trust' && (
             <motion.div 
                key="trust"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
             >
                <div className="bg-gradient-to-br from-amber-600 to-amber-800 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-6 text-right">
                            <div className="p-6 bg-white/20 backdrop-blur-md rounded-[2.5rem]">
                                <ShieldCheckIcon className="w-12 h-12" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tighter mb-2">إدارة حسابات الأمانة الذكية</h2>
                                <p className="text-amber-50/80 text-sm font-medium leading-relaxed max-w-xl">
                                    نظام رقابي متكامل لتتبع أموال الموكلين المودعة في خزينة المكتب أو المحكمة، مع ضمان الفصل التام عن الحسابات التشغيلية.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-8 rounded-[2.5rem] border border-white/20 text-center min-w-[200px]">
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">إجمالي الأمانات</p>
                            <h3 className="text-3xl font-black font-mono tracking-tighter">{formatCurrency(182450.000)}</h3>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockTrustAccounts.map(account => (
                        <Card key={account.id} className="p-10 rounded-[3.5rem] border-none shadow-xl bg-white dark:bg-dm-card group hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 dark:bg-dm-background rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 opacity-50" />
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="p-5 bg-amber-50 dark:bg-dm-background text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-all transform group-hover:rotate-6">
                                    <ShieldCheckIcon className="w-8 h-8" />
                                </div>
                                <Badge variant="info" size="xs" text={account.id} className="font-mono bg-gray-50 text-gray-400 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors" />
                            </div>
                            <h4 className="text-2xl font-black text-gray-900 dark:text-dm-text mb-1 tracking-tighter group-hover:text-primary transition-colors">{account.clientName}</h4>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">رقم المرجع: {account.caseId}</p>
                            
                            <div className="space-y-4 pt-8 border-t border-gray-50 dark:border-gray-800 relative z-10">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">الرصيد المودع</span>
                                    <span className="text-3xl font-black text-primary font-mono tracking-tighter">{formatCurrency(account.totalBalance)}</span>
                                </div>
                                {account.pendingDisbursements > 0 && (
                                    <div className="flex justify-between items-center text-xs p-3 bg-rose-50 rounded-xl">
                                        <span className="text-rose-600 font-bold">صرف معلق</span>
                                        <span className="text-rose-600 font-black font-mono">-{formatCurrency(account.pendingDisbursements)}</span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-10 pt-8 flex gap-4 relative z-10">
                                <Button variant="secondary" className="flex-1 rounded-[1.25rem] h-12 font-black transition-all">إيداع</Button>
                                <Button variant="ghost" className="flex-1 rounded-[1.25rem] h-12 font-black text-rose-500 hover:bg-rose-50 transition-all">طلب صرف</Button>
                            </div>
                        </Card>
                    ))}
                    <button className="border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-[3.5rem] p-12 flex flex-col items-center justify-center text-gray-400 hover:border-amber-400 hover:text-amber-500 transition-all group bg-gray-50/20 min-h-[400px]">
                        <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                            <PlusIcon className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-black uppercase tracking-widest">فتح حساب أمانة جديد</p>
                    </button>
                </div>
             </motion.div>
          )}
          {activeTab === 'banks' && (
            <motion.div 
              key="banks"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {mockBankAccounts.map(account => (
                <Card key={account.id} className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-dm-card group hover:scale-[1.02] transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl group-hover:bg-primary/10 transition-colors" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div className="p-4 bg-gray-50 dark:bg-dm-background rounded-2xl text-gray-400 group-hover:text-primary transition-colors">
                        <BuildingLibraryIcon className="w-8 h-8" />
                      </div>
                      <Badge variant="info" size="sm" text={account.type} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-dm-text mb-1">{account.name}</h3>
                    <p className="text-xs text-gray-400 font-mono mb-6">{account.accountNumber}</p>
                    <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">الرصيد المتوفر</p>
                      <p className="text-3xl font-black text-primary font-mono">{formatCurrency(account.balance)}</p>
                    </div>
                  </div>
                </Card>
              ))}
              <button 
                className="border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-all group bg-gray-50/30 dark:bg-dm-background/30 min-h-[250px]"
              >
                <PlusIcon className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-bold">ربط حساب بنكي جديد</span>
              </button>
            </motion.div>
          )}

          {activeTab === 'reports' && (
            <motion.div 
              key="reports"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {[
                    { title: 'تقرير الأرباح والخسائر الربع سنوي', category: 'التقارير الرئيسية', icon: PresentationChartLineIcon, color: 'text-indigo-600' },
                    { title: 'كشف ميزان المراجعة التفصيلي', category: 'المحاسبة القانونية', icon: ChartBarIcon, color: 'text-emerald-600' },
                    { title: 'كشف التدفقات النقدية (Cash Flow)', category: 'الإدارة التشغيلية', icon: ArrowPathIcon, color: 'text-blue-600' },
                    { title: 'تحليل المصاريف التشغيلية للمكتب', category: 'الكفاءة الإنفاقية', icon: BanknotesIcon, color: 'text-rose-600' },
                    { title: 'تقرير أمانات الموكلين المعلقة', category: 'الالتزامات القانونية', icon: ShieldCheckIcon, color: 'text-amber-600' },
                    { title: 'تقرير ضريبة القيمة المضافة المتوقع', category: 'الامتثال الضريبي', icon: DocumentTextIcon, color: 'text-violet-600' },
                ].map((report, i) => (
                    <Card key={i} className="p-10 rounded-[3rem] border-none shadow-xl bg-white dark:bg-dm-card group hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 dark:bg-dm-background rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700 opacity-50" />
                        <div className={`p-5 rounded-2xl bg-gray-50 dark:bg-dm-background w-fit mb-8 ${report.color} group-hover:scale-110 transition-transform relative z-10`}>
                            <report.icon className="w-8 h-8" />
                        </div>
                        <h4 className="text-2xl font-black text-gray-900 dark:text-dm-text mb-2 tracking-tighter leading-tight relative z-10">{report.title}</h4>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest relative z-10">{report.category}</p>
                        <div className="mt-10 pt-6 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center relative z-10">
                            <span className="text-xs font-black text-primary flex items-center gap-2">عرض وتصدير <ArrowUpRightIcon className="w-3 h-3" /></span>
                            <PrinterIcon className="w-5 h-5 text-gray-300 hover:text-primary transition-colors" />
                        </div>
                    </Card>
                ))}
            </motion.div>
          )}

          {activeTab === 'documents' && (
            <motion.div 
              key="documents"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="md:col-span-1 p-8 rounded-[2.5rem] bg-indigo-600 text-white shadow-2xl shadow-indigo-500/20 flex flex-col justify-between min-h-[300px]">
                        <div>
                            <div className="p-4 bg-white/20 rounded-2xl w-fit mb-6"><DocumentTextIcon className="w-8 h-8" /></div>
                            <h3 className="text-2xl font-black mb-2 tracking-tight">الأرشيف المالي</h3>
                            <p className="text-indigo-100/70 text-xs font-medium leading-relaxed uppercase tracking-widest">Digital Financial Vault</p>
                        </div>
                        <Button className="bg-white text-indigo-600 rounded-2xl h-14 font-black shadow-xl">رفع مستند جديد</Button>
                    </Card>

                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { name: 'فاتورة توريد حواسيب مركزية', date: '2024/05/10', size: '1.2MB' },
                            { name: 'إيصال سداد رسوم قضائية #991', date: '2024/04/28', size: '0.4MB' },
                            { name: 'عقد استشارات - شركة نفط الكويت', date: '2024/03/15', size: '4.8MB' },
                            { name: 'كشف حساب بوبيان - الربع الأول', date: '2024/04/01', size: '2.1MB' },
                            { name: 'مخالصة نهائية - مكتب العقارات', date: '2024/02/10', size: '0.9MB' },
                            { name: 'قسيمة رواتب شهر مايو 2024', date: '2024/05/01', size: '3.5MB' },
                        ].map((doc, idx) => (
                            <Card key={idx} className="p-6 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-dm-card group hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-gray-50 dark:bg-dm-background rounded-xl text-gray-400 group-hover:text-primary transition-colors">
                                        <DocumentTextIcon className="w-6 h-6" />
                                    </div>
                                    <Badge variant="info" size="sm" text={doc.size} />
                                </div>
                                <h5 className="font-black text-gray-900 dark:text-dm-text text-sm truncate mb-1">{doc.name}</h5>
                                <p className="text-[10px] text-gray-400 font-bold">{doc.date}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </motion.div>
          )}

          {activeTab === 'ai' && (
            <motion.div 
               key="ai"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl mx-auto h-[700px] flex flex-col bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden"
            >
                <div className="bg-primary/5 p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-2xl shadow-sm">
                            <SparklesIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-black text-gray-900">المساعد المالي الذكي</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">AI Financial Advisor</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
                    {chatMessages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                            <div className={`max-w-[80%] rounded-2xl p-4 ${
                                msg.role === 'user' 
                                ? 'bg-gray-50 text-gray-800 rounded-tr-none' 
                                : 'bg-primary/5 text-gray-900 border border-primary/10 rounded-tl-none font-medium'
                            }`}>
                                <div className="markdown-body">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isAiLoading && (
                        <div className="flex justify-end">
                            <div className="bg-gray-50 rounded-2xl p-4 flex gap-2">
                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            className="flex-1 bg-white px-6 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                            placeholder="اسأل المحلل المالي الذكي (مثلاً: حلل لي المصروفات هذا الشهر)..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={isAiLoading || !chatInput.trim()}
                            className="bg-primary text-white p-4 rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            <PaperAirplaneIcon className="w-6 h-6 rotate-180" />
                        </button>
                    </div>
                </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transaction Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingTransaction ? 'تعديل قيد مالي' : 'إضافة قيد مالي جديد'}
        size="lg"
      >
        <div className="space-y-6 pt-4" dir="rtl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                    label="تاريخ المعاملة"
                    type="date" 
                    value={formData.transactionDate}
                    onChange={(e) => setFormData({...formData, transactionDate: e.target.value})}
                    required
                />
                <Select 
                    label="نوع المعاملة"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    options={financialTransactionTypeOptions}
                    required
                />
            </div>

            <Input 
                label="البيان / الوصف"
                placeholder="وصف تفصيلي للمعاملة..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input 
                    label="المبلغ"
                    type="number" 
                    placeholder="0.000"
                    value={formData.amount?.toString()}
                    onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                    className="font-mono text-lg font-bold"
                    required
                />
                <Select 
                    label="العملة"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    options={currencyOptions}
                    required
                />
                <Select 
                    label="طريقة الدفع"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as any})}
                    options={paymentMethodOptions}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                    label="المستفيد / المورد"
                    placeholder="اسم الطرف الآخر..."
                    value={formData.vendorOrPayee || ''}
                    onChange={(e) => setFormData({...formData, vendorOrPayee: e.target.value})}
                />
                <Input 
                    label="رقم الفاتورة / المرجع"
                    placeholder="رقم المستند الورقي إن وجد..."
                    value={formData.invoiceNumber || ''}
                    onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                />
            </div>

        <div className="bg-gray-50 dark:bg-dm-background p-8 rounded-[2rem] border border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center mt-10 gap-6">
            <p className="text-xs text-gray-400 font-medium italic">
                * سيتم تثبيت القيد فور الحفظ ضمن السجل العام للمكتب ولن يمكن تعديل الحقول الأساسية لاحقاً.
            </p>
            <div className="flex gap-4 w-full sm:w-auto">
                <Button variant="ghost" size="lg" onClick={() => setIsFormModalOpen(false)} className="flex-1 sm:flex-none">إلغاء</Button>
                <Button size="lg" onClick={handleSave} className="flex-1 sm:flex-none shadow-xl shadow-primary/20">حفظ القيد المالي</Button>
            </div>
        </div>
      </div>
    </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={!!selectedTxForPreview}
        onClose={() => setSelectedTxForPreview(null)}
        title="تفاصيل القيد المحاسبي"
        size="md"
      >
        {selectedTxForPreview && (
          <div className="space-y-6" dir="rtl">
            <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start mb-10">
                    <div className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                         <CreditCardIcon className="w-10 h-10" />
                    </div>
                    <div className="text-left font-mono">
                        <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Transaction ID</p>
                        <p className="text-lg font-bold text-gray-900 tracking-tighter">#{selectedTxForPreview.id}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">البيان الأساسي</p>
                        <h4 className="text-xl font-bold text-gray-800 leading-relaxed">{selectedTxForPreview.description}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">القيمة المالية</p>
                            <p className={`text-2xl font-black font-mono ${selectedTxForPreview.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {formatCurrency(selectedTxForPreview.amount, selectedTxForPreview.currency)}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">تاريخ المعاملة</p>
                            <p className="text-lg font-bold text-gray-700">{selectedTxForPreview.transactionDate}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">الطرف الثاني</p>
                            <p className="text-sm font-bold text-gray-700">{selectedTxForPreview.vendorOrPayee || 'غير محدد'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">وسيلة الدفع</p>
                            <p className="text-sm font-bold text-gray-700">{selectedTxForPreview.paymentMethod}</p>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50">
                        <p className="text-[10px] text-gray-400 font-bold uppercase mb-2">المستند المرفق</p>
                        <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between group cursor-pointer hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-xl shadow-sm">
                                    <DocumentTextIcon className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-700">فاتورة_مرفقة_{selectedTxForPreview.id}.pdf</p>
                                    <p className="text-[10px] text-gray-400 font-mono italic">2.4 MB - تم رفعه بواسطة {selectedTxForPreview.recordedBy}</p>
                                </div>
                            </div>
                            <EyeIcon className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
                        </div>
                    </div>
                </div>
                 <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/5 rounded-full blur-3xl"></div>
            </div>
            
            <div className="flex justify-end gap-3 print:hidden">
                <Button variant="outline" onClick={() => window.print()} leftIcon={<PrinterIcon className="w-5 h-5"/>}>طباعة المستند</Button>
                <Button onClick={() => setSelectedTxForPreview(null)}>إغلاق النافذة</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Global CSS for no-scrollbar */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media print {
            .no-print { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default FinancialManagementPage;
