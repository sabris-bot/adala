import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { useToast } from '../components/ui/Toast';
import { useTranslation } from 'react-i18next';
import { 
    ResponsiveContainer, 
    AreaChart, 
    Area, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    PlusCircle, 
    Search, 
    Filter, 
    Users, 
    ShieldCheck, 
    Activity, 
    Scale, 
    Briefcase,
    FileCheck,
    Sparkles, 
    Clock, 
    Building2, 
    Plus, 
    Trash2, 
    Edit3,
    Eye,
    Printer,
    Send,
    MessageSquare,
    AlertTriangle,
    Coins,
    CheckCircle,
    Info,
    Calendar,
    Landmark,
    FileText,
    Percent,
    SlidersHorizontal,
    ChevronDown,
    Download,
    QrCode,
    FileSignature,
    Bookmark,
    ArrowUpRight,
    ArrowDownRight,
    Lock,
    Settings,
    LayoutGrid,
    Table,
    History,
    FileSpreadsheet,
    FileCode2,
    Check,
    X,
    FolderSync,
    Layers,
    Receipt,
    Divide
} from 'lucide-react';

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

// --- SUBMODULE EMBEDS ---
import { DecisionSimulator } from '../components/FinancialManagement/DecisionSimulator';
import { FinancialCalculators } from '../components/FinancialManagement/FinancialCalculators';
import { OfficialDocumentsHub } from '../components/FinancialManagement/OfficialDocumentsHub';

// Importing all dedicated functional tabs
import { DashboardTab } from '../components/FinancialManagement/DashboardTab';
import { TreasuryTab } from '../components/FinancialManagement/TreasuryTab';
import { EarningsTab } from '../components/FinancialManagement/EarningsTab';
import { ExpensesTab } from '../components/FinancialManagement/ExpensesTab';
import { InvoicesTab } from '../components/FinancialManagement/InvoicesTab';
import { DebtsTab } from '../components/FinancialManagement/DebtsTab';
import { PayrollTab } from '../components/FinancialManagement/PayrollTab';
import { EscrowTab } from '../components/FinancialManagement/EscrowTab';
import { BudgetTab } from '../components/FinancialManagement/BudgetTab';
import { PropertiesTab } from '../components/FinancialManagement/PropertiesTab';
import { AuditNotifyTab } from '../components/FinancialManagement/AuditNotifyTab';

// --- ORIGINAL STABLE MOCK DATA FOR COMPATIBILITY ---
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
    amount: -1202.000,
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

const mockBankAccounts = [
  { id: 'bank-1', name: 'بنك بوبيان - الحساب الرئيسي الموحد', accountNumber: '**** KWD 5566', balance: 68400, type: 'جارٍ' },
  { id: 'bank-2', name: 'بنك الخليج - حساب الأمانات والودائع الضامنة', accountNumber: '**** KWD 8822', balance: 182450, type: 'أمانات' },
  { id: 'bank-3', name: 'بيت التمويل الكويتي - الحساب التشغيلي والرواتب', accountNumber: '**** KWD 1144', balance: 24300, type: 'جارٍ' },
];

const mockTrustAccounts = [
  { id: 'TR-101', clientName: 'فهد محمد العجمي والمجموعة العقارية', totalBalance: 125000.000, pendingDisbursements: 15000.000, lastActivity: '2024-05-14', caseId: 'CASE-2024-882' },
  { id: 'TR-102', clientName: 'شركة بوبيان لخدمات الملاحة والبترول', totalBalance: 45600.750, pendingDisbursements: 0, lastActivity: '2024-05-10', caseId: 'CASE-2024-115' },
  { id: 'TR-103', clientName: 'المواطنة سارة عبدالرحمن العبدالله', totalBalance: 8900.000, pendingDisbursements: 2500.000, lastActivity: '2024-05-05', caseId: 'CASE-2024-441' },
];

const mockBudgets = [
  { id: 'b-1', category: 'الرواتب والأجور التشغيلية', budget: 150000, actual: 124500, label: 'أجور الرواتب' },
  { id: 'b-2', category: 'إيجار المقر والخدمات اللوجستية', budget: 12000, actual: 10200, label: 'اللوجستيات' },
  { id: 'b-3', category: 'رسوم المحاكم والدراسات القضائية', budget: 8000, actual: 6400, label: 'الدعاوى' },
  { id: 'b-4', category: 'حملات التسويق والانتشار التقني', budget: 5000, actual: 5450, label: 'التسويق والمستلزمات' },
];

const initialAuditLogs = [
  { time: '14:22', date: '2024-05-28', user: 'أحمد المحاسب', action: 'إنشاء الفاتورة رقم INV-2024-105 لشركة الصناعات', status: 'completed' },
  { time: '11:05', date: '2024-05-25', user: 'أحمد المحاسب', action: 'صرف عمولة بقيمة 350 د.ك للمحامي المنتدب فهد الخالد', status: 'completed' },
  { time: '09:00', date: '2024-05-20', user: 'النظام الآلي', action: 'تسجيل إيداع حساب أمانة بقيمة 15,000 د.ك من شركة الخليج للتأمين', status: 'approved' },
  { time: '16:40', date: '2024-05-16', user: 'أحمد المحاسب', action: 'تسجيل استرداد رسوم قضائية بقيمة 300 د.ك من خزينة الدولة', status: 'completed' },
  { time: '10:15', date: '2024-05-12', user: 'السكرتارية', action: 'تحصيل مبلغ استشارة فورية بقيمة 500 د.ك عبر خدمة كي-نت', status: 'completed' },
];

const FinancialManagementPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const { addToast } = useToast();

  // Unified visual tabs with comprehensive submodules mapping
  type FinancialTabs = 
    | 'dashboard' 
    | 'treasury'
    | 'journal' 
    | 'earnings'
    | 'expenses'
    | 'invoices' 
    | 'settlements'
    | 'debts'
    | 'payroll' 
    | 'loans' 
    | 'escrow' 
    | 'budget' 
    | 'properties' 
    | 'ai'
    | 'audit';

  const [activeTab, setActiveTab] = useState<FinancialTabs>('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'analytics' | 'timeline' | 'reports'>('table');

  // Core persist datasets
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(() => {
    const saved = localStorage.getItem('qanooni_fin_transactions');
    return saved ? JSON.parse(saved) : mockFinancialTransactions;
  });

  const [bankAccounts, setBankAccounts] = useState(() => {
    const saved = localStorage.getItem('qanooni_fin_bank_accounts');
    return saved ? JSON.parse(saved) : mockBankAccounts;
  });

  const [trustAccounts, setTrustAccounts] = useState(() => {
    const saved = localStorage.getItem('qanooni_fin_trust_accounts');
    return saved ? JSON.parse(saved) : mockTrustAccounts;
  });

  const [budgets, setBudgets] = useState(() => {
    const saved = localStorage.getItem('qanooni_fin_budgets');
    return saved ? JSON.parse(saved) : mockBudgets;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('qanooni_fin_audit_logs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  const [userRole, setUserRole] = useState<'lawyer' | 'admin' | 'consultant' | 'finance_manager'>('finance_manager');

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem('qanooni_fin_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('qanooni_fin_bank_accounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('qanooni_fin_trust_accounts', JSON.stringify(trustAccounts));
  }, [trustAccounts]);

  useEffect(() => {
    localStorage.setItem('qanooni_fin_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('qanooni_fin_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // General Filter Parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('');

  // Floating Controller Modals
  const [selectedTxForPreview, setSelectedTxForPreview] = useState<FinancialTransaction | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);

  // Form parameters
  const [formData, setFormData] = useState<Partial<FinancialTransaction>>({
    transactionDate: new Date().toISOString().split('T')[0],
    type: FinancialTransactionType.EXPENSE,
    amount: 0,
    currency: 'KWD',
    description: '',
    paymentMethod: PaymentMethod.BANK_TRANSFER,
    category: ExpenseCategory.OFFICE_SUPPLIES,
    vendorOrPayee: '',
    invoiceNumber: '',
    notes: ''
  });

  // Stamp and Printable controllers (Inspired by Legal Library)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printDocConfig, setPrintDocConfig] = useState({
    title: 'تقرير الموازنة والحركات المالية الكلية',
    refNumber: `FIN-KW-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
    watermark: 'مكتب صبري شطا للمحاماة',
    applyWatermark: true,
    applyStamp: true,
    stampType: 'approved' as 'approved' | 'confidential' | 'outbound' | 'shata',
    comment: 'تم تمحيص القيود ومراجعتها بدقة كاملة من قبل المراقب المالي المعتمد.',
    addSignatures: true
  });

  // AI Cognitive system states
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
    { role: 'model', content: 'مرحباً بك في مركز التحليلات والمستشار المالي الذكي لمنظومة عدالة القانونية. لقد قمت بتحميل التقارير والتدفقات النقدية واليوميات والودائع الضامنة للمكتب بالكامل في ذاكرة التحليل الذاتي الآمنة. كيف يمكنني إرشادك استراتيجياً اليوم؟' }
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

  // Aggregated mathematics calculations
  const stats = useMemo(() => {
    const revenue = transactions
      .filter(t => t.amount > 0 && t.category !== 'TRUST_ACCOUNT')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const trustAmount = bankAccounts.find(b => b.id === 'bank-2')?.balance || 182450.000;

    return {
      revenue,
      expenses,
      profit: revenue - expenses,
      trustAmount
    };
  }, [transactions, bankAccounts]);

  // AI advisory core dispatch
  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || chatInput.trim();
    if (!textToSend || isAiLoading) return;

    if (!customMessage) setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: textToSend }]);
    setIsAiLoading(true);

    try {
      const history = chatMessages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));

      const contextPrompt = `
        أنت البروفيسور والمستشار المالي القانوني لمكتب "صبري شطا للمحاماة والاستشارات القانونية والمقاصد الشرعية".
        معلومات وقاعدة بيانات الإدارة المالية الحالية لمكتب عدالة:
        - إجمالي التدفقات للإيرادات: ${formatCurrency(stats.revenue)} د.ك
        - إجمالي المصروفات والنفقات التشغيلية: ${formatCurrency(stats.expenses)} د.ك
        - صافي الربح التشغيلي الموزع: ${formatCurrency(stats.profit)} د.ك
        - رصيد حسابات ودائع الأمانات الضامنة للموكلين: ${formatCurrency(stats.trustAmount)} د.ك
        - عدد القيود المالية المسجلة بدفتر اليومية: ${transactions.length} قيود محاسبية
        - قائمة ببنود الموازنة التقديرية الحالية: ${budgets.map(b => `${b.category}: ميزانية ${b.budget} د.ك، المصروف ${b.actual} د.ك`).join(' | ')}
        - قائمة الحسابات البنكية المربوطة: ${bankAccounts.map(b => `${b.name}: الرصيد المتوفر ${b.balance} د.ك`).join(' | ')}

        طلب مستشار الإدارة المالية: "${textToSend}"
        يرجى الإجابة بدقة بالغة وتقديم تحليلات مالية وتوقعات كمسؤول تدقيق خبير ومعرب، مع إيراد توصيات لزيادة الربحية وتقليل الإنفاق اللوجستي.
      `;

      const response = await geminiService.getChatbotResponse(contextPrompt, history);
      setChatMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'model', content: 'عذراً، واجهت المنظومة صعوبة في معالجة طلبك المالي من خلال خادم الذكاء الاصطناعي. يرجى المحاولة بعد قليل.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Safe unique transaction currency formatting
  const formatCurrency = (amount: number, currency: string = 'KWD') => {
    return new Intl.NumberFormat('ar-KW', { style: 'currency', currency, minimumFractionDigits: 3 }).format(amount);
  };

  // Table filters & Dynamic ledger calculations
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (tx.vendorOrPayee && tx.vendorOrPayee.toLowerCase().includes(searchQuery.toLowerCase())) ||
        tx.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = !filterType || tx.type === filterType;
      const matchesCategory = !filterCategory || tx.category === filterCategory;
      
      let matchesStatus = true;
      if (filterStatus !== 'all') {
        const isExpense = tx.amount < 0;
        if (filterStatus === 'paid') matchesStatus = isExpense ? Math.abs(tx.amount) > 100 : true;
        if (filterStatus === 'pending') matchesStatus = tx.id === 'ft-1' || tx.id === 'ft-cons-1';
        if (filterStatus === 'overdue') matchesStatus = tx.id === 'ft-tax-1';
      }

      return matchesSearch && matchesType && matchesStatus && matchesCategory;
    });
  }, [transactions, searchQuery, filterType, filterStatus, filterCategory]);

  const ledgerAggr = useMemo(() => {
    const selectedRevenue = filteredTransactions
      .filter(t => t.amount > 0 && t.category !== 'TRUST_ACCOUNT')
      .reduce((sum, t) => sum + t.amount, 0);

    const selectedExpenses = filteredTransactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      selectedRevenue,
      selectedExpenses,
      selectedProfit: selectedRevenue - selectedExpenses,
      selectedCount: filteredTransactions.length
    };
  }, [filteredTransactions]);

  // Transaction deletion Handler
  const handleDelete = (id: string, description: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في حذف القيد المالي المحاسبي: "${description}"؟`)) {
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      const newLog = {
        time: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        user: 'مدير النظام',
        action: `حذف قيد مالي رقم #${id} - "${description}"`,
        status: 'archived'
      };
      setAuditLogs([newLog, ...auditLogs]);

      addToast({
        type: 'success',
        title: 'تم حذف القيد من السجل',
        message: 'تم إزالة الحركة المالية المحددة بشكل نهائي ومزامنة الدفاتر.'
      });
    }
  };

  // Save/Edit action with Duplication Prevention Safeguard
  const handleSaveInJournal = () => {
    if (!formData.description || !formData.amount) {
      addToast({
        type: 'error',
        title: 'بيانات ناقصة',
        message: 'يرجى تدوين وصف الشرح والقيمة المالية قبل إتمام قيد السند.'
      });
      return;
    }

    const rawVal = formData.type === FinancialTransactionType.REVENUE ? Math.abs(formData.amount) : -Math.abs(formData.amount);
    
    // Duplication check parameter
    const isDuplicate = transactions.some(tx => 
      tx.id !== editingTransaction?.id &&
      tx.transactionDate === formData.transactionDate &&
      tx.description.trim() === formData.description!.trim() &&
      tx.amount === rawVal
    );

    if (isDuplicate) {
      addToast({
        type: 'error',
        title: 'تنبيه: قيد محاسبي مكرر!',
        message: 'تم رفض إدخال القيد لوجود حركة مالية مطابقة تماماً في الوصف والتاريخ والمبلغ لتفادي تكرار العمليات.'
      });
      return;
    }

    if (editingTransaction) {
      setTransactions(prev => prev.map(t => t.id === editingTransaction.id ? { ...t, ...formData, amount: rawVal } as FinancialTransaction : t));
      addToast({
        type: 'success',
        title: 'تم تعديل القيد المالي',
        message: 'تم تحديث بيانات القيد المحاسبي وحفظ التغييرات بنجاح.'
      });
    } else {
      const generatedId = `ft-${Date.now()}`;
      const newTx: FinancialTransaction = {
        ...formData,
        id: generatedId,
        amount: rawVal,
        createdAt: new Date().toISOString(),
        recordedBy: 'أحمد المحاسب'
      } as unknown as FinancialTransaction;
      
      setTransactions([newTx, ...transactions]);

      const newLog = {
        time: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toISOString().split('T')[0],
        user: 'أحمد المحاسب',
        action: `إضافة قيد محاسبي بقيمة ${formatCurrency(Math.abs(rawVal))} - ${formData.description}`,
        status: 'completed'
      };
      setAuditLogs([newLog, ...auditLogs]);

      addToast({
        type: 'success',
        title: 'تم تدوين القيد المالي',
        message: 'تم بنجاح ترحيل الحركة المالية الجديدة لدفتر اليومية.'
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
      category: ExpenseCategory.OFFICE_SUPPLIES,
      vendorOrPayee: '',
      invoiceNumber: '',
      notes: ''
    });
  };

  const handleEdit = (tx: FinancialTransaction) => {
    setEditingTransaction(tx);
    setFormData({
      ...tx,
      amount: Math.abs(tx.amount)
    });
    setIsFormModalOpen(true);
  };

  const handleDuplicate = (tx: FinancialTransaction) => {
    const generatedId = `ft-dup-${Date.now()}`;
    const desc = `${tx.description} (نسخة مكررة)`;
    
    const newTx: FinancialTransaction = {
      ...tx,
      id: generatedId,
      description: desc,
      createdAt: new Date().toISOString(),
      recordedBy: 'أحمد المحاسب'
    };

    setTransactions([newTx, ...transactions]);
    addToast({
      type: 'info',
      title: 'تم تكرار القيد المحاسبي',
      message: 'تم توليد نسخة مطابقة لدفتر اليومية بنجاح.'
    });
  };

  const triggerExportSimulation = (format: 'PDF' | 'Word' | 'Excel') => {
    addToast({
      type: 'success',
      title: `تصدير المستند المالي بنجاح`,
      message: `تم ترميز وحفظ القيود لملف ${format} وتحميله عبر متصفحك.`
    });
  };

  // Recharts custom colors for visuals
  const COLORS = ['#DFBA5A', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

  const chartDataRevenuesExpenses = [
    { name: 'مارس', إيرادات: 18200, مصروفات: 11400 },
    { name: 'أبريل', إيرادات: stats.revenue * 0.9, مصروفات: stats.expenses * 0.8 },
    { name: 'مايو', إيرادات: stats.revenue, مصروفات: stats.expenses }
  ];

  const pieDataCategoryDistribution = [
    { name: 'الرواتب والأجور', value: 65, fill: '#DFBA5A' },
    { name: 'الاستمارات والمشتريات', value: 15, fill: '#3b82f6' },
    { name: 'الخدمات واللوجستيات', value: 12, fill: '#10b981' },
    { name: 'أخرى ونثريات', value: 8, fill: '#ef4444' }
  ];

  return (
    <div id="qanooni-financial-cockpit" className="p-4 md:p-8 bg-[#FAF7F2] min-h-screen font-sans text-right pb-32 transition-all" dir="rtl">
      {/* Official Print Header embedded, visible only on Print */}
      <PrintHeader title={printDocConfig.title} subtitle={`الرمز المرجعي: ${printDocConfig.refNumber} | مكتب مستشار صبري شطا`} />

      {/* PROFESSIONAL HIGH-END OFFICIAL HEADER */}
      {/* Inspired by Legal Library: welcome display card in a pristine, beautiful light style */}
      <div id="fin-top-banner" className="max-w-7xl mx-auto mb-8 no-print transition-all">
        <div id="fin-hero-gradient-card" className="bg-white rounded-[2rem] p-6 md:p-8 text-gray-900 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start md:items-center gap-4">
            <div className="p-4 bg-amber-500/10 rounded-2xl flex items-center justify-center text-[#B8922A] shrink-0 border border-amber-500/15">
              <Landmark className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <span className="text-[#B8922A] font-black uppercase tracking-widest text-[9px] font-mono">Qanooni Central Finance Cockpit</span>
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 mt-1">
                المركز المالي الشامل والحسابات الكلية
              </h1>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed max-w-2xl font-medium">
                منصة متكاملة للموثوقية المحاسبية لليوميات وسجلات الفواتير ورواتب الكوادر، والمطابقة والتدقيق الضريبي وحساب نهاية الخدمة للعمال، بامتثال تام مع ديوان الاستشارات ومحكمة الكلية الكبرى بدولة الكويت.
              </p>
            </div>
          </div>
          
          <div id="fin-hero-actions" className="flex flex-wrap gap-2 shrink-0">
            <Button 
              id="fin-btn-add-record"
              variant="primary" 
              size="sm" 
              onClick={() => {
                setEditingTransaction(null);
                setIsFormModalOpen(true);
              }}
              className="bg-[#B8922A] hover:bg-[#A37E20] text-white font-black rounded-xl px-4 py-2.5 text-xs flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              قيد حركة محاسبية جديدة
            </Button>
            <Button 
              id="fin-btn-direct-print"
              variant="outline" 
              size="sm" 
              onClick={() => {
                setPrintDocConfig(p => ({ ...p, title: 'كشف ميزانيات وأرصدة الدائرة المحاسبية بالكامل' }));
                setIsPrintModalOpen(true);
              }} 
              className="bg-gray-50 text-gray-750 text-gray-700 hover:bg-gray-100 border-gray-200 text-xs px-4 py-2.5 rounded-xl flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              منشئ التقارير والطباعة
            </Button>
          </div>
        </div>

        {/* Dynamic marquee alert box */}
        <div className="mt-4 p-3.5 bg-amber-50/60 border border-amber-100 rounded-2xl flex items-center gap-3 text-xs text-amber-900 font-medium">
          <span className="bg-amber-500/15 text-[#B8922A] px-2 py-0.5 rounded-lg font-black text-[10px] uppercase shrink-0 flex items-center gap-1 border border-amber-500/20 font-sans">
            <AlertTriangle className="w-3.5 h-3.5" /> تنبيه مالي هام
          </span>
          <div className="w-full overflow-hidden relative h-4">
            <div className="absolute whitespace-nowrap animate-marquee flex gap-12 font-semibold">
              <span>تنبيه: اقتراب استحقاق سداد ضريبة الشؤون ودعم العمالة بقيمة KWD 3,200.000 (تاريخ الاستحقاق: 15 يونيو)</span>
              <span>تنبيه: فاتورة رقم INV-2024-003 مستحقة الدفع على بنك الخليج في دورتها المتأخرة</span>
              <span>إشعار: تم ترحيل جرايات ومكافآت نهاية الخدمة بنجاح لنظام كشوف الرواتب للربع الجاري</span>
            </div>
          </div>
        </div>
      </div>

      {/* METRIC CARD HUD (Inspired by Legal Library Widgets) */}
      <div id="fin-metric-cards-grid" className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8 no-print">
          {[
              { id: 'hud-revenue', label: 'إجمالي الحركات الواردة', info: 'مجموع أتعاب الموكلين والمقبوضات', amount: stats.revenue, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50/45 border-emerald-100/60' },
              { id: 'hud-expenses', label: 'كشف النفقات الخارجة', info: 'أجور تشغيلية وطاقة إيجارية', amount: stats.expenses, icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50/45 border-rose-100/60' },
              { id: 'hud-profit', label: 'صافي الربح التشغيلي', info: 'العائد الفعلي المتاح للتوزيع', amount: stats.profit, icon: Scale, color: 'text-[#B8922A]', bg: 'bg-amber-50/45 border-amber-200/50' },
              { id: 'hud-trust', label: 'محفظة أمانات الموكلين', info: 'أرصدة بنك الأمانات المفصولة المودعة', amount: stats.trustAmount, icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50/45 border-purple-100/60' },
              { id: 'hud-transactions', label: 'القيود والدفاتر الفعالة', info: 'مسار حماية المعالجة المبرم', amount: transactions.length, isCount: true, icon: Clock, color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200/50' },
          ].map((stat, i) => (
              <motion.div 
                id={`stat-card-${stat.id}`}
                key={i} 
                whileHover={{ y: -3 }}
                className={`p-5 rounded-3xl border ${stat.bg} shadow-sm flex flex-col justify-between transition-all bg-white hover:shadow-md`}
              >
                  <div className="flex justify-between items-start mb-3">
                      <p className="text-[10px] font-black text-gray-500 tracking-wider uppercase">{stat.label}</p>
                      <div className="p-2 rounded-xl bg-white shadow-xs border border-gray-100 shrink-0">
                          <stat.icon className={`w-4 h-4 ${stat.color}`} />
                      </div>
                  </div>
                  <div>
                      <p className="text-xl font-black text-gray-900 font-mono tracking-tighter">
                        {stat.isCount ? `${stat.amount} قيد مالي` : formatCurrency(stat.amount)}
                      </p>
                      <p className="text-[9px] text-gray-400 font-sans mt-1 leading-normal font-medium">{stat.info}</p>
                  </div>
              </motion.div>
          ))}
      </div>

      {/* CORE SPLIT WORKSPACE */}
      <div id="fin-workspace-container" className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 outline-none">
        
        {/* SIDEBAR NAVIGATION CONTROLLER (Aesthetic Design of Legal Library Sidebar in elegant light golden/slate) */}
        <div id="fin-sidebar-nav" className="lg:col-span-3 space-y-4 no-print">
          
          {/* Section 1: Core Center */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-1.5 transition-all hover:shadow-md">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-2.5 mb-2 pb-1.5 border-b border-gray-100 font-mono">1. التحليلات والموقف المالي</span>
            
            <button 
              id="fin-nav-btn-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'dashboard' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>لوحة الأرصدة والتحليلات</span>
              </div>
            </button>

            <button 
              id="fin-nav-btn-treasury"
              onClick={() => setActiveTab('treasury')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'treasury' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4" />
                <span>إدارة حركات الخزينة والصندوق</span>
              </div>
            </button>
          </div>

          {/* Section 2: General Daybook & Daily Records */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-1.5 transition-all hover:shadow-md font-sans">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-2.5 mb-2 pb-1.5 border-b border-gray-100 font-mono">2. الدفاتر الحسابية واليومية</span>
            
            <button 
              id="fin-nav-btn-journal"
              onClick={() => setActiveTab('journal')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'journal' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>دفتر اليومية وقيد السندات</span>
              </div>
            </button>

            <button 
              id="fin-nav-btn-earnings"
              onClick={() => setActiveTab('earnings')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'earnings' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span>كشف المقبوضات والإيرادات</span>
              </div>
            </button>

            <button 
              id="fin-nav-btn-expenses"
              onClick={() => setActiveTab('expenses')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'expenses' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                <span>كراس النفقات والمصروفات</span>
              </div>
            </button>
          </div>

          {/* Section 3: Invoicing, Claims & Installments */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-1.5 transition-all hover:shadow-md font-sans">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-2.5 mb-2 pb-1.5 border-b border-gray-100 font-mono">3. الفواتير والذمم والوثائق</span>
            
            <button 
              id="fin-nav-btn-invoices"
              onClick={() => setActiveTab('invoices')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'invoices' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4" />
                <span>الفواتير والمطالبات المالية</span>
              </div>
            </button>

            <button 
              id="fin-nav-btn-settlements"
              onClick={() => setActiveTab('settlements')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'settlements' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileSignature className="w-4 h-4" />
                <span>سندات المقاصات والمخالصات</span>
              </div>
            </button>

            <button 
              id="fin-nav-btn-debts"
              onClick={() => setActiveTab('debts')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'debts' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4" />
                <span>الديون والأقساط المستحقة</span>
              </div>
            </button>
          </div>

          {/* Section 4: Human Resources & Assets */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-1.5 transition-all hover:shadow-md font-sans">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-2.5 mb-2 pb-1.5 border-b border-gray-100 font-mono">4. الموارد البشرية والرواتب والأصول</span>
            
            <button 
              id="fin-nav-btn-payroll"
              onClick={() => setActiveTab('payroll')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'payroll' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>مسير الرواتب والأجور</span>
              </div>
            </button>

            <button 
              id="fin-nav-btn-loans"
              onClick={() => setActiveTab('loans')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'loans' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4" />
                <span>سلف وحسابات الموظفين</span>
              </div>
            </button>

            <button 
              id="fin-nav-btn-properties"
              onClick={() => setActiveTab('properties')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'properties' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>عقارات وأصول المكتب</span>
              </div>
            </button>
          </div>

          {/* Section 5: Budgets & Escrows */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-1.5 transition-all hover:shadow-md font-sans">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-2.5 mb-2 pb-1.5 border-b border-gray-100 font-mono">5. الميزانيات والأمانات الكبرى</span>

            <button 
              id="fin-nav-btn-escrow"
              onClick={() => setActiveTab('escrow')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'escrow' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4" />
                <span>حسابات الأمانات والودائع</span>
              </div>
            </button>

            <button 
              id="fin-nav-btn-budget"
              onClick={() => setActiveTab('budget')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'budget' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                <span>مراقبة الميزانيات التقديرية</span>
              </div>
            </button>
          </div>

          {/* Section 6: AI Consult & Auditing trail */}
          <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-1.5 transition-all hover:shadow-md font-sans">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-2.5 mb-2 pb-1.5 border-b border-gray-100 font-mono">6. الاستشارات الذكية والأمان</span>
            
            <button 
              id="fin-nav-btn-ai"
              onClick={() => setActiveTab('ai')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ai' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-650 text-gray-700 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#B8922A] animate-pulse" />
                <span>المستشار الذكي (GPT)</span>
              </div>
            </button>

            <button 
              id="fin-nav-btn-audit"
              onClick={() => setActiveTab('audit')}
              className={`w-full flex justify-between items-center px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'audit' 
                ? 'bg-amber-500/10 text-[#B8922A] border-r-4 border-[#B8922A] font-black' 
                : 'text-gray-650 text-gray-700 hover:bg-slate-50 hover:text-gray-900 border-r-4 border-transparent text-right'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>جداول التدقيق والعمليات</span>
              </div>
            </button>
          </div>
        </div>

        {/* CENTRAL WORKSPACE DISPATCHER */}
        <div id="fin-central-workspace" className="lg:col-span-9 space-y-6">
          <AnimatePresence mode="wait">
            
            {/* SUB-TAB 1: LOOT REALTIME DASHBOARD & METRIC OVERVIEWS */}
            {activeTab === 'dashboard' && (
              <motion.div 
                id="fin-tab-content-dashboard"
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DashboardTab formatCurrency={formatCurrency} transactions={transactions} />
              </motion.div>
            )}

            {/* SUB-TAB 2: TREASURY AND BOX CONTROLLER */}
            {activeTab === 'treasury' && (
              <motion.div 
                id="fin-tab-content-treasury"
                key="treasury"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <TreasuryTab formatCurrency={formatCurrency} />
              </motion.div>
            )}

            {/* SUB-TAB 3: GENERAL JOURNAL BOOK (Now beautifully refactored as the core document table) */}
            {activeTab === 'journal' && (
              <motion.div 
                id="fin-tab-content-journal"
                key="journal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Search, Filter Toolbar & ViewMode Selector (Inspired by Legal Library Archive filter toolbars) */}
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-5 text-gray-900">
                  <div className="flex flex-col lg:flex-row gap-4 items-center justify-between no-print w-full">
                    <div className="flex-1 w-full relative">
                      <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B8922A]" />
                      <input 
                        type="text" 
                        placeholder="ابحث في القيود والمستندات بذكاء (وصف، رقم الفاتورة، اسم المستفيد، الطابع)..."
                        className="w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#B8922A]/40 text-gray-800 placeholder-gray-400 text-right"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* Compact View Mode Selector Buttons */}
                    <div className="flex gap-2 shrink-0 bg-gray-100 p-1.5 rounded-2xl border border-gray-200 text-xs text-gray-500 font-bold">
                      <button 
                        id="fin-viewmode-btn-table"
                        onClick={() => setViewMode('table')} 
                        className={`p-2 rounded-xl flex items-center gap-1.5 ${viewMode === 'table' ? 'bg-white shadow-xs text-[#B8922A] font-black border border-gray-200/50' : 'hover:text-gray-900'}`}
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>الجدول</span>
                      </button>
                      <button 
                        id="fin-viewmode-btn-grid"
                        onClick={() => setViewMode('grid')} 
                        className={`p-2 rounded-xl flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-white shadow-xs text-[#B8922A] font-black border border-gray-200/50' : 'hover:text-gray-900'}`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>البطاقات</span>
                      </button>
                      <button 
                        id="fin-viewmode-btn-timeline"
                        onClick={() => setViewMode('timeline')} 
                        className={`p-2 rounded-xl flex items-center gap-1.5 ${viewMode === 'timeline' ? 'bg-white shadow-xs text-[#B8922A] font-black border border-gray-200/50' : 'hover:text-gray-900'}`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>الخط الزمني</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-bold no-print pt-2 border-t border-gray-100">
                    <select 
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-700 font-sans"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="">كافة أصناف العمليات</option>
                      <option value="REVENUE">المقبوضات والإيرادات</option>
                      <option value="EXPENSE">النفقات والمدفوعات</option>
                      <option value="SALARY_PAYMENT">تسوية الرواتب والأجور</option>
                    </select>

                    <select 
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-700 font-sans"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">كافة الحالات</option>
                      <option value="paid">معاملات مسواة</option>
                      <option value="pending">انتظار الاعتماد والمصادقة</option>
                      <option value="overdue">مطالبات قيد المتابعة المتأخرة</option>
                    </select>

                    <select 
                      className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-700 font-sans"
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                    >
                      <option value="">كافة التصنيفات الضريبية والمكتبية</option>
                      <option value="LEGAL_FEES">أتعاب القضايا الموكلة</option>
                      <option value="RENT">أعباء الإيجار والخدمات</option>
                      <option value="SALARIES">رواتب والتعويض الإجرائي</option>
                      <option value="OFFICE_SUPPLIES">نثريات المكتب والقرطاسية</option>
                      <option value="TAX_ZAKAT">الوعاء الضريبي والمالية</option>
                      <option value="TRUST_ACCOUNT">ودائع الأمانات المعلقة</option>
                    </select>
                  </div>
                </div>

                {/* Live Row Metrics banner */}
                <div id="fin-live-aggregated-banner" className="bg-gradient-to-l from-amber-50 to-amber-100/50 text-[#B8922A] p-5 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-3 text-xs font-black shadow-sm border border-amber-200/50">
                  <div>
                    <span>اليومية المفلترة الحالية:</span>
                    <span className="font-black underline underline-offset-4 ml-1">{ledgerAggr.selectedCount} عمليات مفلترة ونشطة</span>
                  </div>
                  <div className="flex flex-wrap gap-4 font-mono font-black text-[13px]">
                    <span className="text-emerald-600">الوارد: +{formatCurrency(ledgerAggr.selectedRevenue)}</span>
                    <span className="text-rose-600 font-bold">المنصرف: -{formatCurrency(ledgerAggr.selectedExpenses)}</span>
                    <span className="border-r border-gray-200 pr-4">صافي النتيجة: <span className={ledgerAggr.selectedProfit >= 0 ? 'text-emerald-600 underline' : 'text-rose-600 underline'}>{formatCurrency(ledgerAggr.selectedProfit)}</span></span>
                  </div>
                </div>

                {/* RENDER MODES SECTION CONDITONALS */}
                
                {/* 3a. Table Mode */}
                {viewMode === 'table' && (
                  <div id="fin-viewmode-panel-table" className="bg-white border-2 border-gray-150 rounded-[2.5rem] overflow-hidden shadow-sm">
                    <div className="overflow-x-auto no-scrollbar">
                      <table className="w-full text-xs text-right border-collapse">
                        <thead>
                          <tr className="bg-gray-50 text-[#B8922A] font-black border-b border-gray-100 uppercase tracking-wider">
                            <th className="p-5 font-black">رمز المعاملة وطبيعتها</th>
                            <th className="p-5">التاريخ</th>
                            <th className="p-5">البيان والشرح وتفاصيل الطرف المالي</th>
                            <th className="p-5 text-left">مبلغ القيد الكلي</th>
                            <th className="p-5 text-center no-print">خيارات التحكم والتدقيق</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTransactions.map(tx => (
                            <tr key={tx.id} className="border-b border-gray-50 hover:bg-slate-50 transition-all text-gray-700">
                              <td className="p-5">
                                <div className="font-mono font-bold text-[#B8922A] flex items-center gap-2">
                                  <span>{tx.id}</span>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-black ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                    {tx.amount > 0 ? 'قيد مقبوضات' : 'قيد سداد'}
                                  </span>
                                </div>
                              </td>
                              <td className="p-5 whitespace-nowrap font-mono">{tx.transactionDate}</td>
                              <td className="p-5">
                                <div className="font-black text-gray-900 text-sm">{tx.description}</div>
                                <div className="text-[10px] text-gray-400 font-sans mt-1">
                                  المستفيد: <span className="text-gray-600 font-bold">{tx.vendorOrPayee || 'غير محدد'}</span> | المرجع الدفتري: <span className="text-[#B8922A] font-mono font-bold">{tx.invoiceNumber || 'لا يوجد'}</span>
                                </div>
                              </td>
                              <td className={`p-5 text-left font-mono font-black text-sm whitespace-nowrap ${tx.amount > 0 ? 'text-[#B8922A]' : 'text-rose-600'}`}>
                                {formatCurrency(tx.amount)}
                              </td>
                              <td className="p-5 text-center no-print whitespace-nowrap flex items-center justify-center gap-2 h-full">
                                <button 
                                  id={`btn-view-${tx.id}`}
                                  onClick={() => setSelectedTxForPreview(tx)}
                                  className="p-2 hover:bg-amber-500/10 text-[#B8922A] rounded-xl transition-colors shrink-0"
                                  title="عرض إضبارة المعاملة والتدقيق الفرعي"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  id={`btn-edit-${tx.id}`}
                                  onClick={() => handleEdit(tx)}
                                  className="p-2 hover:bg-teal-500/10 text-teal-650 rounded-xl transition-colors shrink-0"
                                  title="تعديل حركة"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  id={`btn-dup-${tx.id}`}
                                  onClick={() => handleDuplicate(tx)}
                                  className="p-2 hover:bg-amber-500/10 text-amber-600 rounded-xl transition-colors shrink-0"
                                  title="تكرار وحماية الحركة"
                                >
                                  <FolderSync className="w-4 h-4" />
                                </button>
                                <button 
                                  id={`btn-del-${tx.id}`}
                                  onClick={() => handleDelete(tx.id, tx.description)}
                                  className="p-2 hover:bg-rose-500/10 text-rose-600 rounded-xl transition-colors shrink-0"
                                  title="حذف حركة نهائياً"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {filteredTransactions.length === 0 && (
                            <tr>
                              <td colSpan={5} className="p-16 text-center text-gray-400 font-bold italic">
                                لا توجد حركات يومية محاسبية مطابقة لمعايير البحث المعروضة.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 3b. Card Grid Mode */}
                {viewMode === 'grid' && (
                  <div id="fin-viewmode-panel-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredTransactions.map(tx => (
                      <motion.div 
                        id={`tx-grid-card-${tx.id}`}
                        key={tx.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white border border-gray-150 hover:border-[#B8922A]/45 rounded-[2.5rem] text-gray-800 shadow-sm flex flex-col justify-between transition-all duration-300"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-mono font-black bg-gray-50 border border-gray-150 text-[#B8922A] px-2 py-1 rounded-md">{tx.id}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-black ${tx.amount > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                              {tx.amount > 0 ? 'حركة واردة KWD' : 'حركة خارجة KWD'}
                            </span>
                          </div>
                          
                          <h4 className="font-black text-gray-900 text-base leading-snug">{tx.description}</h4>
                          <span className="text-[10px] font-bold text-gray-500 mt-1 block">التصنيف: {tx.category}</span>
                          
                          <div className="space-y-2 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-700">
                            <div className="flex justify-between">
                              <span className="text-gray-400">المرسل إليه / الطرف الثاني:</span>
                              <span className="font-bold text-gray-800">{tx.vendorOrPayee || 'غير محدد'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">رقم الفاتورة أو القيد:</span>
                              <span className="font-mono text-[#B8922A]">{tx.invoiceNumber || 'بلا مرجع'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-400">المقيد والمنسق التشغيلي:</span>
                              <span className="text-gray-600 font-bold">{tx.recordedBy || 'النظام الآلي'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center bg-transparent">
                          <span className={`text-lg font-black font-mono ${tx.amount > 0 ? 'text-[#B8922A]' : 'text-rose-600'}`}>
                            {formatCurrency(tx.amount)}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <button 
                              id={`dup-btn-${tx.id}`}
                              onClick={() => setSelectedTxForPreview(tx)}
                              className="p-2 hover:bg-slate-50 text-[#B8922A] rounded-xl transition-colors"
                              title="عرض إضبارة التفاصيل"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              id={`edit-btn-${tx.id}`}
                              onClick={() => handleEdit(tx)}
                              className="p-2 hover:bg-slate-50 text-teal-600 rounded-xl transition-colors"
                              title="تعديل"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              id={`del-btn-${tx.id}`}
                              onClick={() => handleDelete(tx.id, tx.description)}
                              className="p-2 hover:bg-slate-50 text-rose-600 rounded-xl transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* 3c. Timeline Mode */}
                {viewMode === 'timeline' && (
                  <div id="fin-viewmode-panel-timeline" className="bg-white border-2 border-gray-150 p-8 rounded-[2.5rem] shadow-sm text-gray-800 space-y-6">
                    <h4 className="text-xs font-black text-[#B8922A] uppercase tracking-widest pb-3 border-b border-gray-100 flex items-center gap-1.5 font-mono">
                      <Clock className="w-4 h-4" />
                      الخط الزمني المالي لتدفق السجلات المحوسبة
                    </h4>

                    <div className="space-y-6 relative border-r border-[#B8922A]/25 pr-4 mr-2">
                       {filteredTransactions.map((tx, idx) => (
                        <div id={`timeline-row-${tx.id}`} key={tx.id} className="relative">
                          {/* Anchor Node circle element */}
                          <span className={`absolute -right-[23px] top-1 w-3 h-3 rounded-full ${tx.amount > 0 ? 'bg-[#B8922A] shadow-md shadow-[#B8922A]/20' : 'bg-rose-500 shadow-md shadow-rose-500/20'}`} />
                          
                          <div className="text-xs">
                            <span className="text-[10px] font-mono text-gray-500 block">{tx.transactionDate} ({tx.id})</span>
                            <h5 className="font-black text-sm text-gray-900 mt-1">{tx.description}</h5>
                            <p className="text-[11px] text-gray-400 font-sans mt-0.5 font-medium">الطرف الثاني: {tx.vendorOrPayee || 'غير محدد'} | المستند: {tx.invoiceNumber || 'لا يدون'}</p>
                            <div className="flex justify-between items-center mt-2.5 max-w-sm">
                              <span className={`font-mono font-black text-sm ${tx.amount > 0 ? 'text-[#B8922A]' : 'text-rose-600'}`}>
                                {formatCurrency(tx.amount)}
                              </span>
                              <button 
                                id={`preview-btn-${tx.id}`}
                                onClick={() => setSelectedTxForPreview(tx)} 
                                className="text-[10px] bg-gray-50 text-gray-700 hover:text-black hover:bg-gray-150 px-2.5 py-1 rounded-lg border border-gray-200 font-bold transition-all"
                              >
                                عرض الإضبارة المالية
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* SUB-TAB 4: REVENUES & DIRECT FEE COLLECTIONS */}
            {activeTab === 'earnings' && (
              <motion.div 
                id="fin-tab-content-earnings"
                key="earnings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <EarningsTab formatCurrency={formatCurrency} />
              </motion.div>
            )}

            {/* SUB-TAB 5: EXPENSES MANAGEMENT */}
            {activeTab === 'expenses' && (
              <motion.div 
                id="fin-tab-content-expenses"
                key="expenses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <ExpensesTab formatCurrency={formatCurrency} />
              </motion.div>
            )}

            {/* SUB-TAB 6: INVOICING & CLIENT ACCOUNTS */}
            {activeTab === 'invoices' && (
              <motion.div 
                id="fin-tab-content-invoices"
                key="invoices"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <InvoicesTab formatCurrency={formatCurrency} />
              </motion.div>
            )}

            {/* SUB-TAB 7: COMPLEX SETTLEMENTS & OFFICIAL FINANCIAL TEMPLATES HUB (Using high end OfficialDocumentsHub) */}
            {activeTab === 'settlements' && (
              <motion.div 
                id="fin-tab-content-settlements"
                key="settlements"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <OfficialDocumentsHub formatCurrency={formatCurrency} />
              </motion.div>
            )}

            {/* SUB-TAB 8: CONCRETE DEBTS, COMPLIANCE & ACCRUED INSTALLEMTS */}
            {activeTab === 'debts' && (
              <motion.div 
                id="fin-tab-content-debts"
                key="debts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <DebtsTab formatCurrency={formatCurrency} isAr={true} />
              </motion.div>
            )}

            {/* SUB-TAB 9: PERSONNEL PAYROLL MANAGEMENT */}
            {activeTab === 'payroll' && (
              <motion.div 
                id="fin-tab-content-payroll"
                key="payroll"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <PayrollTab formatCurrency={formatCurrency} isAr={true} />
              </motion.div>
            )}

            {/* SUB-TAB 10: STAFF LOANS & ADVANCES CALCULATIONS */}
            {activeTab === 'loans' && (
              <motion.div 
                id="fin-tab-content-loans"
                key="loans"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <FinancialCalculators formatCurrency={formatCurrency} />
              </motion.div>
            )}

            {/* SUB-TAB 11: ESCROWS DEPOSIT SAFEKEEPING */}
            {activeTab === 'escrow' && (
              <motion.div 
                id="fin-tab-content-escrow"
                key="escrow"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <EscrowTab formatCurrency={formatCurrency} />
              </motion.div>
            )}

            {/* SUB-TAB 12: BUDGET CONTROL PANELS */}
            {activeTab === 'budget' && (
              <motion.div 
                id="fin-tab-content-budget"
                key="budget"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <BudgetTab formatCurrency={formatCurrency} isAr={true} />
              </motion.div>
            )}

            {/* SUB-TAB 13: REAL ESTATE RENTAL PROPERTIES RENTS */}
            {activeTab === 'properties' && (
              <motion.div 
                id="fin-tab-content-properties"
                key="properties"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <PropertiesTab formatCurrency={formatCurrency} isAr={true} />
              </motion.div>
            )}

            {/* SUB-TAB 14: AI ADVISOR (Extremely rich dialogue layout with forecasting/anomaly indicators) */}
            {activeTab === 'ai' && (
              <motion.div 
                id="fin-tab-content-ai"
                key="ai"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto h-[710px] flex flex-col bg-[#040D1A] rounded-[2.5rem] border-2 border-[#DFBA5A]/30 shadow-2xl overflow-hidden font-sans text-right"
                dir="rtl"
              >
                <div className="bg-[#0a1424] px-6 py-4 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#DFBA5A]/15 border border-[#DFBA5A]/25 text-[#DFBA5A] rounded-xl">
                      <Sparkles className="w-5 h-5 text-[#DFBA5A] animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-black text-white text-sm">مستشار الإدارة المالية المعرفي الذكي</h3>
                      <p className="text-[9px] text-[#DFBA5A] font-black uppercase tracking-widest leading-none mt-0.5">Qanooni Advanced Fin-GPT Core</p>
                    </div>
                  </div>
                </div>

                {/* Predefined quick prompts selector buttons */}
                <div id="ai-quick-triggers" className="px-6 py-3 bg-[#101F37] border-b border-white/5 flex flex-wrap gap-2 text-xs no-print text-[#DFBA5A]">
                  <button 
                    id="ai-trigger-expense"
                    onClick={() => handleSendMessage('حلل لي نفقات ومصروفات المكتب هذا الشهر وعين المخارج غير المألوفة لقمع الهدر')}
                    className="px-3 py-1.5 bg-[#13243F] border border-white/10 hover:border-[#DFBA5A] hover:bg-[#DFBA5A]/10 text-white rounded-full transition-all cursor-pointer font-bold"
                  >
                    🔍 تحليل المشتريات والمصروفات
                  </button>
                  <button 
                    id="ai-trigger-escrow"
                    onClick={() => handleSendMessage('ما هي آليات الحماية لحفظ الودائع والأمانات الضامنة؟ وهل يوجد تداخل محاسبي؟')}
                    className="px-3 py-1.5 bg-[#13243F] border border-white/10 hover:border-[#DFBA5A] hover:bg-[#DFBA5A]/10 text-white rounded-full transition-all cursor-pointer font-bold"
                  >
                    🛡️ كشف أمانات الموكلين المعلقة
                  </button>
                  <button 
                    id="ai-trigger-anomaly"
                    onClick={() => handleSendMessage('هل يفصح محرك المنظومة المالي عن أي قيود محاسبية شاذة أو أخطاء قيدية (Anomaly Detection)؟')}
                    className="px-3 py-1.5 bg-[#13243F] border border-white/10 hover:border-[#DFBA5A] hover:bg-[#DFBA5A]/10 text-white rounded-full transition-all cursor-pointer font-bold"
                  >
                    🔍 تقرير المعاملات الشاذة (Anomalies)
                  </button>
                  <button 
                    id="ai-trigger-forecasting"
                    onClick={() => handleSendMessage('بناءً على نمو المقبوضات وصرف الرواتب، قدم لي توقعات الربحية للأشهر الثلاثة القادمة (Financial Forecasting)')}
                    className="px-3 py-1.5 bg-[#13243F] border border-white/10 hover:border-[#DFBA5A] hover:bg-[#DFBA5A]/10 text-white rounded-full transition-all cursor-pointer font-bold"
                  >
                    📈 توقعات الأرباح والسيولة (Forecasting)
                  </button>
                </div>

                {/* Cognitive stream chat messaging zone */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-[#0a1424]/40 text-xs">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[75%] rounded-2xl p-4 leading-relaxed ${
                        msg.role === 'user' 
                        ? 'bg-[#13243F] border border-[#DFBA5A]/25 text-white rounded-tr-none' 
                        : 'bg-[#101F37] border border-white/5 text-slate-100 shadow-sm rounded-tl-none text-right font-medium'
                      }`}>
                        <div className="markdown-body font-sans">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex justify-end">
                      <div className="bg-[#101F37] rounded-2xl p-4 flex gap-2">
                        <span className="w-2 h-2 bg-[#DFBA5A] rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 bg-[#DFBA5A] rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 bg-[#DFBA5A] rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t border-white/5 bg-[#0a1424] no-print">
                  <div className="flex gap-3">
                    <input 
                      id="ai-chat-input-field"
                      type="text" 
                      className="flex-1 bg-[#13243F] text-white placeholder-slate-400 px-5 py-3 rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#DFBA5A]/25 text-xs font-bold"
                      placeholder="اسأل المستشار المالي (مثال: هل يتواءم رصيد الخزينة الحالي مع الوعاء الضريبي؟)..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button 
                      id="ai-send-message-btn"
                      onClick={() => handleSendMessage()}
                      disabled={isAiLoading || !chatInput.trim()}
                      className="bg-gradient-to-l from-[#DFBA5A] to-[#B8922A] text-[#050b15] p-3 rounded-xl shadow-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:grayscale shrink-0 flex items-center justify-center cursor-pointer font-black"
                    >
                      <Send className="w-5 h-5 rotate-180" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SUB-TAB 15: MASTER AUDIT TRAILS Logs */}
            {activeTab === 'audit' && (
              <motion.div 
                id="fin-tab-content-audit"
                key="audit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AuditNotifyTab userRole={userRole} setUserRole={setUserRole} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* DETAILED FINANCIAL PROFILE DRAWER / OVERLAY (Inspired by Legal Library document cards) */}
      <AnimatePresence>
        {selectedTxForPreview && (
          <Modal
            key="tx-details-modal"
            isOpen={!!selectedTxForPreview}
            onClose={() => setSelectedTxForPreview(null)}
            title="إضبارة المستند المالي التفصيلي (Financial Profile)"
            size="lg"
          >
            <div id="fin-profile-modal-body" className="space-y-6 pt-4 text-right font-sans relative" dir="rtl">
              
              {/* Profile high contrast top header */}
              <div className="bg-gradient-to-l from-[#101F37] to-[#0D182A] p-6 rounded-3xl border border-[#DFBA5A]/25 text-white flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-[#DFBA5A] font-black uppercase tracking-wider block font-mono">ADL FINANCIAL LEDGER</span>
                  <h3 className="text-lg font-black mt-1 text-white">{selectedTxForPreview.description}</h3>
                  <p className="text-xs text-slate-400 mt-1">تاريخ العملية: <span className="font-mono font-bold text-slate-300">{selectedTxForPreview.transactionDate}</span> | المسؤول: <span className="text-slate-300 font-bold">{selectedTxForPreview.recordedBy || 'المحاسب المعتمد'}</span></p>
                </div>
                <div className="text-left font-mono">
                  <span className="text-[9px] text-slate-400 uppercase block font-black">القيمة الكلية المعتمدة</span>
                  <span className={`text-2xl font-black ${selectedTxForPreview.amount > 0 ? 'text-[#DFBA5A]' : 'text-rose-400'}`}>
                    {formatCurrency(selectedTxForPreview.amount)}
                  </span>
                </div>
              </div>

              {/* Detailed specs layout grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-normal">
                
                {/* Visual Section 1: Core Parameters */}
                <div className="p-5 bg-slate-50 border border-gray-150 rounded-2xl space-y-3.5">
                  <h4 className="text-xs font-black text-slate-800 border-b border-gray-200 pb-2 flex items-center gap-1.5 leading-none">
                    <Info className="w-4 h-4 text-primary" /> معطيات القيود الهيكلية
                  </h4>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">رمز المعاملة الموحد (UUID):</span>
                    <span className="font-mono font-bold text-gray-900">{selectedTxForPreview.id}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">طبيعة المعاملة:</span>
                    <span className={`font-black ${selectedTxForPreview.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {selectedTxForPreview.amount > 0 ? 'إيراد / توريد مقبوض' : 'نفقة / ذمة تسوية خارجة'}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">طريقة الدفع / التحصيل:</span>
                    <span className="font-bold text-gray-900 bg-white border px-2 py-0.5 rounded-md font-sans">{selectedTxForPreview.paymentMethod}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">رقم الفاتورة أو المستند الدفتري:</span>
                    <span className="font-mono font-bold text-[#B8922A]">{selectedTxForPreview.invoiceNumber || 'بلا رقم فوري'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">التصنيف الضريبي والوعاء المالي:</span>
                    <span className="font-bold text-slate-800">{selectedTxForPreview.category}</span>
                  </div>
                </div>

                {/* Visual Section 2: Financial calculation VAT & deductions (Auto Computed) */}
                <div className="p-5 bg-slate-50 border border-gray-150 rounded-2xl space-y-3">
                  <h4 className="text-xs font-black text-slate-800 border-b border-gray-200 pb-2 flex items-center gap-1.5 leading-none">
                    <Percent className="w-4 h-4 text-primary" /> تفاصيل الضريبة والمستقطعات عمالياً
                  </h4>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500">المبلغ المطلق الأصلي:</span>
                    <span className="font-mono font-bold text-gray-950">{formatCurrency(Math.abs(selectedTxForPreview.amount))}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">ضريبة القيمة المضافة المحتسبة (5%):</span>
                    <span className="font-mono text-gray-700">+{formatCurrency(Math.abs(selectedTxForPreview.amount) * 0.05)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">قيمة الاستقطاع ومصروف التأمين (1.5%):</span>
                    <span className="font-mono text-rose-600">-{formatCurrency(Math.abs(selectedTxForPreview.amount) * 0.015)}</span>
                  </div>

                  <div className="flex justify-between border-t border-dashed border-gray-300 pt-2 font-bold text-slate-900">
                    <span>المجموع الصافي المتوقع للتسوية:</span>
                    <span className="font-mono text-[#B8922A]">{formatCurrency(Math.abs(selectedTxForPreview.amount) * 1.035)}</span>
                  </div>
                </div>
              </div>

              {/* Note space */}
              {selectedTxForPreview.notes && (
                <div className="p-4 bg-[#DFBA5A]/5 border border-[#DFBA5A]/25 rounded-2xl text-xs text-slate-800 leading-relaxed font-sans">
                  <span className="font-black text-[#B8922A] block mb-1">ملاحظات التدقيق الإضافية:</span>
                  <p>{selectedTxForPreview.notes}</p>
                </div>
              )}

              {/* Approval status check-rail (simulating official checks) */}
              <div className="p-4 border border-gray-200 bg-white rounded-2xl space-y-3 text-xs font-sans">
                <span className="font-black text-slate-800 block">سلسلة الاعتماد والترخيص بالاعتماد المالي:</span>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl font-bold border border-emerald-100">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>تم التدقيق المحاسبي (Audited)</span>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl font-bold border border-emerald-100">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>اعتمد من المدير المالي (CFO Appv.)</span>
                  </div>
                  <div className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold border ${selectedTxForPreview.amount > 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span>{selectedTxForPreview.amount > 0 ? 'رصيد مستلم ومسوى غيابياً' : 'بانتظار مصادقة المستشار صبري شطا'}</span>
                  </div>
                </div>
              </div>

              {/* Simulated Attachments */}
              <div className="space-y-2">
                <span className="text-xs font-black text-slate-800 block">الملفات والمرفقات الثبوتية المرتبطة:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-white border rounded-xl flex justify-between items-center text-xs hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-black block text-slate-800">سند تحويل بنكي مبرز KWD</span>
                        <span className="text-[9px] text-gray-400 font-mono">FIN-PAYMENT-SLIP.pdf (1.2 MB)</span>
                      </div>
                    </div>
                    <button 
                      id={`att-down-1-${selectedTxForPreview.id}`}
                      onClick={() => triggerExportSimulation('PDF')} 
                      className="p-1 hover:bg-slate-100 rounded-md text-gray-500"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 bg-white border rounded-xl flex justify-between items-center text-xs hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <div>
                        <span className="font-black block text-slate-800">عقد صياغة الشراكة والتوكيل</span>
                        <span className="text-[9px] text-gray-400 font-mono">LEGAL-CONTRACT-EXEC.pdf (2.4 MB)</span>
                      </div>
                    </div>
                    <button 
                      id={`att-down-2-${selectedTxForPreview.id}`}
                      onClick={() => triggerExportSimulation('PDF')} 
                      className="p-1 hover:bg-slate-100 rounded-md text-gray-500"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Controller Footer options */}
              <div className="bg-slate-50 p-6 rounded-[2rem] flex flex-wrap justify-between items-center gap-4 mt-8 no-print">
                <div className="flex gap-2">
                  <Button 
                    id="profile-btn-sim-print"
                    variant="outline" 
                    leftIcon={<Printer className="w-4 h-4" />}
                    onClick={() => {
                      setPrintDocConfig(p => ({
                        ...p,
                        title: `سند قيد القيد المحاسبي رقم ${selectedTxForPreview.id}`,
                        comment: `تم استخراج هذا السند التفصيلي الخاص بـ "${selectedTxForPreview.description}" آلياً ومزوداً بالختم والاعتماد الرقمي.`
                      }));
                      setIsPrintModalOpen(true);
                    }}
                  >
                    تهيئة المستند للطباعة
                  </Button>
                  <Button 
                    id="profile-btn-sim-dup"
                    variant="ghost" 
                    leftIcon={<FolderSync className="w-4 h-4" />}
                    onClick={() => {
                      handleDuplicate(selectedTxForPreview);
                      setSelectedTxForPreview(null);
                    }}
                    className="text-amber-600 hover:bg-amber-50"
                  >
                    تكرار القيد للتدوير
                  </Button>
                </div>
                <Button id="profile-btn-close" variant="ghost" onClick={() => setSelectedTxForPreview(null)}>إغلاق الإضبارة</Button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* COMPREHENSIVE FISCAL PRINT CONFIGURATION MODAL (Inspired by Legal Library Stamp Manager) */}
      <AnimatePresence>
        {isPrintModalOpen && (
          <Modal
            key="print-config-modal"
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            title="إشهار طباعة التقرير المالي المعتمد"
            size="lg"
          >
            <div id="print-config-modal-body" className="space-y-6 pt-4 text-right font-sans" dir="rtl">
              <div className="p-4 bg-slate-50 border rounded-2xl text-xs space-y-2">
                <span className="font-black text-slate-800 block">معاينة المستند القانوني المعتمد للطباعة:</span>
                <p className="text-gray-500 font-sans">حدد نوع الدمغات والختم الرقمي لتضمينها بمتن التقرير قبل إرساله لآلة الطباعة أو التصدير الكوني.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <Input 
                  label="عنوان التقرير أو السند المصدر"
                  type="text"
                  value={printDocConfig.title}
                  onChange={(e) => setPrintDocConfig({ ...printDocConfig, title: e.target.value })}
                  required
                />
                <Input 
                  label="الرمز المرجعي للاقتصاد المبرم"
                  type="text"
                  value={printDocConfig.refNumber}
                  onChange={(e) => setPrintDocConfig({ ...printDocConfig, refNumber: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans">
                {/* Stamp options selector */}
                <div className="space-y-2">
                  <label className="font-black text-slate-700 block text-xs">نوع الختم المصاحب للتقرير:</label>
                  <select 
                    className="w-full border rounded-xl p-3 bg-white outline-none font-sans"
                    value={printDocConfig.stampType}
                    onChange={(e) => setPrintDocConfig({ ...printDocConfig, stampType: e.target.value as any })}
                  >
                    <option value="shata">دمغة مكتب صبري شطا للمحاماة (الذهبية)</option>
                    <option value="approved">ختم معتمد ومصدق محاسبياً (Approved)</option>
                    <option value="confidential">شعار سري ومكتوم للغاية (Confidential)</option>
                    <option value="outbound">حساب صادر وخارجي للكلية (Outbound)</option>
                  </select>
                </div>
                
                <div className="space-y-4 pt-6">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="apply-stamp-chk"
                      checked={printDocConfig.applyStamp}
                      onChange={(e) => setPrintDocConfig({ ...printDocConfig, applyStamp: e.target.checked })}
                      className="w-4 h-4 text-amber-500 focus:ring-amber-400 rounded"
                    />
                    <label htmlFor="apply-stamp-chk" className="font-bold text-gray-700">تضمين ختوم الاعتماد الرسمية</label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="apply-watermark-chk"
                      checked={printDocConfig.applyWatermark}
                      onChange={(e) => setPrintDocConfig({ ...printDocConfig, applyWatermark: e.target.checked })}
                      className="w-4 h-4 text-amber-500 focus:ring-amber-400 rounded"
                    />
                    <label htmlFor="apply-watermark-chk" className="font-bold text-gray-700">تطبيق العلامة المائية للشركة</label>
                  </div>
                </div>
              </div>

              {/* Editable custom comment before printing */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-700 block">ملاحظات و تذييل التقرير المبرم (قابلة للتعديل):</label>
                <textarea 
                  value={printDocConfig.comment}
                  onChange={(e) => setPrintDocConfig({ ...printDocConfig, comment: e.target.value })}
                  className="w-full border rounded-xl p-4 text-xs font-sans focus:ring-2 focus:ring-[#DFBA5A]/25 outline-none min-h-[90px] text-right"
                  placeholder="اكتب أي ملاحظات إدارية لتذييل التقرير بها..."
                />
              </div>

              {/* Visual Seals preview panel inside config */}
              <div className="bg-slate-100 p-5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-3 bg-white border rounded-xl text-primary font-black"><QrCode className="w-8 h-8" /></span>
                  <div className="text-xs">
                    <span className="font-black text-slate-800 block">مفتاح تأكيد صحة المستند (Secured QR)</span>
                    <span className="text-[10px] text-gray-400 font-mono">https://isValid.qanooni.adl/verify/{printDocConfig.refNumber}</span>
                  </div>
                </div>
                
                {printDocConfig.applyStamp && (
                  <div className="text-center font-black animate-pulse text-[10px] uppercase border-4 border-dashed border-[#DFBA5A]/80 text-[#B8922A] px-3 py-1 bg-white rounded-xl rotate-12 flex flex-col leading-tight">
                    <span>{printDocConfig.stampType.toUpperCase()} SEAL</span>
                    <span>QANOONI ADL</span>
                  </div>
                )}
              </div>

              {/* Action buttons inside Printing manager */}
              <div className="flex flex-wrap gap-2 justify-end pt-5 no-print">
                <Button id="print-mgr-cancel" variant="ghost" onClick={() => setIsPrintModalOpen(false)}>إلغاء الأمر</Button>
                
                <div className="flex gap-2">
                  <Button 
                    id="print-mgr-excel"
                    variant="outline"
                    className="text-emerald-700"
                    leftIcon={<FileSpreadsheet className="w-4 h-4" />}
                    onClick={() => {
                      setIsPrintModalOpen(false);
                      triggerExportSimulation('Excel');
                    }}
                  >
                    تصدير Excel Sheets
                  </Button>
                  <Button 
                    id="print-mgr-word"
                    variant="outline"
                    className="text-blue-700"
                    leftIcon={<FileCode2 className="w-4 h-4" />}
                    onClick={() => {
                      setIsPrintModalOpen(false);
                      triggerExportSimulation('Word');
                    }}
                  >
                    تصدير Word DOC
                  </Button>
                  <Button 
                    id="print-mgr-submit-print"
                    variant="primary"
                    className="bg-gradient-to-l from-[#DFBA5A] to-[#B8922A] text-slate-950 font-black h-11 px-6 shadow-md shadow-amber-500/10"
                    leftIcon={<Printer className="w-4 h-4" />}
                    onClick={() => {
                      setIsPrintModalOpen(false);
                      addToast({
                        type: 'info',
                        title: 'تحضير للطباعة الرسمية',
                        message: 'جاري استدعاء محاذاة الطباعة وإطلاق الكود المالي...'
                      });
                      setTimeout(() => {
                        window.print();
                      }, 500);
                    }}
                  >
                    إرسال لآلة الطباعة الفورية
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* TRANSACTION CREATION & MODIFICATION FORM (Complies with clean fields) */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingTransaction ? 'تعديل وتدقيق قيد المستند المحاسبي' : 'قيد وتسجيل سند حركة محاسبية جديدة'}
        size="lg"
      >
        <div id="fin-form-modal-body" className="space-y-6 pt-4 text-right font-sans" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="تاريخ معاملة القيد"
              type="date" 
              value={formData.transactionDate}
              onChange={(e) => setFormData({...formData, transactionDate: e.target.value})}
              required
            />
            <Select 
              label="طبيعة ونوع الحركة"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value as any})}
              options={financialTransactionTypeOptions}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="البيان التوضيحي وشرح الغرض"
              placeholder="مثال: أتعاب ترافع قسط أخير، تجديد اشتراك دورية..."
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required
            />
            <Select 
              label="التصنيف المحاسبي للوعاء المالي"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value as any})}
              options={[
                { value: 'LEGAL_FEES', label: 'أتعاب القضايا الموكلة والاستشارات' },
                { value: ExpenseCategory.RENT, label: 'إيجار المقر السكني والخدمي' },
                { value: ExpenseCategory.SALARIES, label: 'الأجور والمرتبات والمخصصات الكلية' },
                { value: ExpenseCategory.OFFICE_SUPPLIES, label: 'قرطاسية ونثريات ومستلزمات تشغيلية' },
                { value: 'TAX_ZAKAT', label: 'المستحقات الضريبية والزكاة والجمارك' },
                { value: 'TRUST_ACCOUNT', label: 'ودائع وأمانات الموكلين المعلقة' }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input 
              label="المبلغ المطلق بالأرقام"
              type="number" 
              placeholder="0.000"
              value={formData.amount?.toString()}
              onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
              className="font-mono text-lg font-bold"
              required
            />
            <Select 
              label="عملة الحركة"
              value={formData.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
              options={currencyOptions}
            />
            <Select 
              label="وسيلة الدفع المعتمدة"
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value as any})}
              options={paymentMethodOptions}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="المستفيد / الطرف الثاني المعني بالأمر"
              placeholder="اسم المورد أو الموظف أو العميل المباشر..."
              value={formData.vendorOrPayee || ''}
              onChange={(e) => setFormData({...formData, vendorOrPayee: e.target.value})}
            />
            <Input 
              label="رقم الفاتورة أو رمز التسوية للتدقيق"
              placeholder="مثال: INV-2024-REF-889"
              value={formData.invoiceNumber || ''}
              onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-750 text-slate-700 block">شرح وملاحظات إضافية (أمين الصندوق):</label>
            <textarea 
              value={formData.notes || ''}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full border rounded-xl p-4 text-xs font-sans outline-none focus:ring-2 focus:ring-[#DFBA5A]/25 min-h-[70px]"
              placeholder="دوّن أي ملاحظة مساعدة على التسوية المستقبلية هنا..."
            />
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
            <span className="text-[10px] text-gray-400 font-medium leading-relaxed max-w-sm">
              * يتم تفحص قيام المعني بالحركة آلياً وقمع الإزداوج وتكرار التوريد حرصاً على مصادقة التقارير ربع السنوية.
            </span>
            <div className="flex gap-2">
              <Button id="form-cancel" variant="ghost" onClick={() => setIsFormModalOpen(false)}>إلغاء الأمر</Button>
              <Button id="form-submit" variant="primary" onClick={handleSaveInJournal} className="bg-teal-600 hover:bg-teal-550 hover:bg-teal-500 text-white font-bold h-11 px-5 shadow-lg shadow-teal-500/10">حفظ وترحيل السند للدفاتر الكلية</Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Global Style Configuration Override (Inspired by Legal Library) */}
      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes marquee {
          0% { transform: translate3d(100%, 0, 0); }
          100% { transform: translate3d(-100%, 0, 0); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 35s linear infinite;
        }

        @media print {
          .no-print { display: none !important; }
          #qanooni-financial-cockpit { background: white !important; padding: 0 !important; }
        }
      ` }} />
    </div>
  );
};

export default FinancialManagementPage;
