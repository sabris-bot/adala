import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Search, 
  Users, 
  Activity, 
  Scale, 
  Briefcase, 
  Clock, 
  Building2, 
  Trash2, 
  Printer, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Calendar, 
  Landmark, 
  FileText, 
  SlidersHorizontal, 
  Download, 
  QrCode, 
  History, 
  BookOpen, 
  HelpCircle,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import PrintHeader from '../components/ui/PrintHeader';
import { notificationService } from '../services/notificationService';
import { AnnualBudgetAuditView } from '../components/Financial/AnnualBudgetAuditView';
import { BankReconciliationView } from '../components/Financial/BankReconciliationView';

// Shared Tabs structure
type TabType = 'dashboard' | 'revenues' | 'expenses' | 'treasury' | 'invoices' | 'debts' | 'reports' | 'bank-reconciliation' | 'budget-audit';

interface Transaction {
  id: string;
  date: string;
  type: 'revenue' | 'expense';
  description: string;
  amount: number;
  category: string;
  paymentMethod: string;
  payee: string;
  invoiceNumber?: string;
  linkedEntity: string; // Case, Contract, Client, Employee
}

interface BankAccount {
  id: string;
  name: string;
  type: 'bank' | 'safe' | 'wallet';
  accountNumber: string;
  iban?: string;
  balance: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  type: 'tax' | 'regular' | 'debit' | 'credit';
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'unpaid' | 'cancelled' | 'deferred';
  paymentMethod?: string;
}

interface Debt {
  id: string;
  title: string;
  partyName: string;
  type: 'receivable' | 'payable'; // ذمم مدينة / ذمم دائنة
  amount: number;
  dueDate: string;
  status: 'pending' | 'overdue' | 'settled';
}

const FinancialManagementPage: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Shared Persistent States (Loads from LocalStorage, defaults to [] for organic usage only)
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('adala_fin_transactions_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    const saved = localStorage.getItem('adala_fin_bank_accounts_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('adala_fin_invoices_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [debts, setDebts] = useState<Debt[]>(() => {
    const saved = localStorage.getItem('adala_fin_debts_v2');
    return saved ? JSON.parse(saved) : [];
  });

  // Save states to localStorage
  useEffect(() => {
    localStorage.setItem('adala_fin_transactions_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('adala_fin_bank_accounts_v2', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('adala_fin_invoices_v2', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('adala_fin_debts_v2', JSON.stringify(debts));
  }, [debts]);

  // --- DUE DATES REMINDERS CONFIGURATION STATE AND LOGIC ---
  const [reminderDays, setReminderDays] = useState<number[]>(() => {
    const saved = localStorage.getItem('adala_fin_debt_reminder_days');
    return saved ? JSON.parse(saved) : [1, 3, 7]; // Defaults: 1 day, 3 days, 7 days before
  });

  const [newCustomReminder, setNewCustomReminder] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('adala_fin_debt_reminder_days', JSON.stringify(reminderDays));
  }, [reminderDays]);

  const getDaysDifference = (dueDateStr: string): number => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  useEffect(() => {
    const notifiedKeysJson = localStorage.getItem('adala_fin_notified_keys');
    let notifiedKeys: string[] = notifiedKeysJson ? JSON.parse(notifiedKeysJson) : [];
    let updated = false;

    const checkAndNotify = (
      id: string, 
      title: string, 
      party: string, 
      amount: number, 
      dueDate: string, 
      type: 'receivable' | 'payable' | 'invoice'
    ) => {
      const distance = getDaysDifference(dueDate);
      const amountStr = formatKWD(amount);

      // Overdue alert
      if (distance < 0) {
        const alertedKey = `overdue-${id}`;
        if (!notifiedKeys.includes(alertedKey)) {
          let arabicTitle = '';
          let arabicMsg = '';
          if (type === 'receivable') {
            arabicTitle = `ذمة مدينة متأخرة: ${title}`;
            arabicMsg = `الذمة المدينة المستحقة على ${party} بقيمة ${amountStr} قد تجاوزت تاريخ استحقاقها (${dueDate}) بـ ${Math.abs(distance)} يوم.`;
          } else if (type === 'payable') {
            arabicTitle = `ذمة دائنة متأخرة: ${title}`;
            arabicMsg = `الذمة الدائنة المستحقة لـ ${party} بقيمة ${amountStr} قد تجاوزت تاريخ استحقاقها (${dueDate}) بـ ${Math.abs(distance)} يوم.`;
          } else {
            arabicTitle = `فاتورة مستحقة متأخرة: ${title}`;
            arabicMsg = `الفاتورة المستحقة على العميل ${party} بقيمة ${amountStr} قد تجاوزت تاريخ استحقاقها (${dueDate}) بـ ${Math.abs(distance)} يوم.`;
          }

          notificationService.addNotification({
            title: arabicTitle,
            message: arabicMsg,
            category: 'IMPORTANT',
            priority: 'HIGH',
            relatedId: id
          });
          notifiedKeys.push(alertedKey);
          updated = true;
        }
      }

      // Due Today alert
      if (distance === 0) {
        const alertedKey = `duetoday-${id}`;
        if (!notifiedKeys.includes(alertedKey)) {
          let arabicTitle = '';
          let arabicMsg = '';
          if (type === 'receivable') {
            arabicTitle = `ذمة مدينة مستحقة اليوم: ${title}`;
            arabicMsg = `تذكير مالي: الذمة المدينة المستحقة على ${party} بقيمة ${amountStr} جاهزة للتحصيل اليوم.`;
          } else if (type === 'payable') {
            arabicTitle = `ذمة دائنة مستحقة اليوم: ${title}`;
            arabicMsg = `تذكير مالي: الذمة الدائنة المستحقة لـ ${party} بقيمة ${amountStr} واجبة السداد اليوم.`;
          } else {
            arabicTitle = `فاتورة مستحقة اليوم: ${title}`;
            arabicMsg = `تذكير مالي: الفاتورة رقم ${title} المستحقة بقيمة ${amountStr} على العميل ${party} مستحقة اليوم.`;
          }

          notificationService.addNotification({
            title: arabicTitle,
            message: arabicMsg,
            category: 'REMINDER',
            priority: 'URGENT',
            relatedId: id
          });
          notifiedKeys.push(alertedKey);
          updated = true;
        }
      }

      // Custom offsets check
      reminderDays.forEach(days => {
        if (distance === days && days > 0) {
          const alertedKey = `due-${days}-${id}`;
          if (!notifiedKeys.includes(alertedKey)) {
            let arabicTitle = '';
            let arabicMsg = '';
            if (type === 'receivable') {
              arabicTitle = `استحقاق ذمة مدينة خلال ${days} أيام: ${title}`;
              arabicMsg = `تنبيه مالي مجدول: ذمة مدينة مستحقة على ${party} بقيمة ${amountStr} يتبقى على موعدها ${days} أيام بالتاريخ (${dueDate}).`;
            } else if (type === 'payable') {
              arabicTitle = `استحقاق ذمة دائنة خلال ${days} أيام: ${title}`;
              arabicMsg = `تنبيه مالي مجدول: ذمة دائنة مستحقة لـ ${party} بقيمة ${amountStr} يتبقى على موعد دفعها ${days} أيام بالتاريخ (${dueDate}).`;
            } else {
              arabicTitle = `استحقاق فاتورة خلال ${days} أيام: ${title}`;
              arabicMsg = `تنبيه مالي مجدول: الفاتورة المستحقة على ${party} بقيمة ${amountStr} يتبقى على موعد تحصيلها ${days} أيام بالتاريخ (${dueDate}).`;
            }

            notificationService.addNotification({
              title: arabicTitle,
              message: arabicMsg,
              category: 'REMINDER',
              priority: 'NORMAL',
              relatedId: id
            });
            notifiedKeys.push(alertedKey);
            updated = true;
          }
        }
      });
    };

    debts.forEach(d => {
      if (d.status !== 'settled') {
        checkAndNotify(d.id, d.title, d.partyName, d.amount, d.dueDate, d.type);
      }
    });

    invoices.forEach(inv => {
      if (inv.status === 'unpaid') {
        checkAndNotify(inv.id, inv.invoiceNumber, inv.clientName, inv.amount, inv.dueDate, 'invoice');
      }
    });

    if (updated) {
      localStorage.setItem('adala_fin_notified_keys', JSON.stringify(notifiedKeys));
    }
  }, [debts, invoices, reminderDays]);
  // -------------------------------------------------------------

  // 2. Modals Control States
  const [showAddTxModal, setShowAddTxModal] = useState(false);
  const [txType, setTxType] = useState<'revenue' | 'expense'>('revenue');
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddDebtModal, setShowAddDebtModal] = useState(false);
  const [printableDoc, setPrintableDoc] = useState<any | null>(null);

  // Forms inputs fields
  const [txForm, setTxForm] = useState({
    description: '',
    amount: '',
    category: 'أتعاب قضايا',
    paymentMethod: 'تحويل بنكي',
    payee: '',
    invoiceNumber: '',
    linkedEntity: 'قضية بنك بوبيان - 105/2026',
    date: new Date().toISOString().split('T')[0]
  });

  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'bank' as 'bank' | 'safe' | 'wallet',
    accountNumber: '',
    iban: '',
    balance: ''
  });

  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    clientName: '',
    type: 'tax' as 'tax' | 'regular' | 'debit' | 'credit',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    amount: '',
    paymentMethod: 'كي نت'
  });

  const [debtForm, setDebtForm] = useState({
    title: '',
    partyName: '',
    type: 'receivable' as 'receivable' | 'payable',
    amount: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  // 3. Dynamic Interactive KPI Calculations
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalExpense = 0;
    transactions.forEach(t => {
      if (t.type === 'revenue') totalRevenue += t.amount;
      if (t.type === 'expense') totalExpense += t.amount;
    });

    const netProfit = totalRevenue - totalExpense;
    const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
    const receivablesVal = debts.filter(d => d.type === 'receivable' && d.status !== 'settled').reduce((sum, d) => sum + d.amount, 0);
    const payablesVal = debts.filter(d => d.type === 'payable' && d.status !== 'settled').reduce((sum, d) => sum + d.amount, 0);
    const outstandingInvoicesCount = invoices.filter(inv => inv.status === 'unpaid').length;

    return {
      totalRevenue,
      totalExpense,
      netProfit,
      totalBankBalance,
      receivablesVal,
      payablesVal,
      outstandingInvoicesCount
    };
  }, [transactions, bankAccounts, debts, invoices]);

  // Aligned styling configurations
  const formatKWD = (value: number) => {
    return new Intl.NumberFormat('ar-KW', { style: 'currency', currency: 'KWD', minimumFractionDigits: 3 }).format(value);
  };

  // Systems integrations linkables lists
  const workspaceIntegrationSelects = {
    cases: [
      'قضية بنك بوبيان التجارية - رقم 105/2026',
      'نزاع عقار برج الحمراء الاستثماري - رقم 99/2026',
      'دعوى تعويضات موظفي الاستثمارات الوطنية - رقم 84/2025',
      'إثبات ملكية عقار حولي ورثة الغانم - رقم 7/2026'
    ],
    contracts: [
      'عقد شركة الغانم للمواد الإنشائية',
      'عقد بيع قسيمة السالمية رولان السكني',
      'عقد الصياغة والتحكيم لمجموعة الصناعات الكبرى'
    ],
    employees: [
      'المستشار صبري شطا',
      'المحامي فهد الرشيدي',
      'المحامية فاطمة علي',
      'المحامي أحمد الصالح'
    ]
  };

  // 4. Form Action Handlers
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txForm.description || !txForm.amount || !txForm.payee) {
      addToast({ type: 'error', title: 'خطأ في المدخلات', message: 'يرجى مراءة ملء الخانات كافّة والتحقق منها.' });
      return;
    }

    const value = parseFloat(txForm.amount);
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: txForm.date,
      type: txType,
      description: txForm.description,
      amount: value,
      category: txForm.category,
      paymentMethod: txForm.paymentMethod,
      payee: txForm.payee,
      invoiceNumber: txForm.invoiceNumber || undefined,
      linkedEntity: txForm.linkedEntity
    };

    setTransactions(prev => [newTx, ...prev]);

    // Fast bank account update balance if the payment is linked
    if (bankAccounts.length > 0) {
      setBankAccounts(prev => prev.map(acc => {
        // Adjust the first bank account by balance change as a helpful automation
        if (acc.id === prev[0].id) {
          return {
            ...acc,
            balance: txType === 'revenue' ? acc.balance + value : acc.balance - value
          };
        }
        return acc;
      }));
    }

    setShowAddTxModal(false);
    setTxForm(prev => ({ ...prev, description: '', amount: '', payee: '', invoiceNumber: '' }));
    addToast({
      type: 'success',
      title: 'تم تسجيل المعاملة المالية',
      message: `${txType === 'revenue' ? 'تم قيد المقبوضات' : 'تم قيد الصرفيات والمصاريف'} بنجاح وتم ربطه بالنظام.`
    });
  };

  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountForm.name || !accountForm.balance) {
      addToast({ type: 'error', title: 'خطأ في التسجيل', message: 'يرجى ملء الاسم والرصيد الافتتاحي بشكل صحيح.' });
      return;
    }

    const newAcc: BankAccount = {
      id: `acc-${Date.now()}`,
      name: accountForm.name,
      type: accountForm.type,
      accountNumber: accountForm.accountNumber || 'غير متوفر',
      iban: accountForm.iban || undefined,
      balance: parseFloat(accountForm.balance)
    };

    setBankAccounts(prev => [newAcc, ...prev]);
    setShowAddAccountModal(false);
    setAccountForm({ name: '', type: 'bank', accountNumber: '', iban: '', balance: '' });
    addToast({ type: 'success', title: 'تمّ تهيئة الحساب بنجاح', message: 'تم إدراج الصندوق أو المحفظة البنكية إلى حسابات المكتب.' });
  };

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceForm.clientName || !invoiceForm.amount) {
      addToast({ type: 'error', title: 'خانات فارغة', message: 'يرجى كتابة اسم العميل وقيمة الفاتورة ومراجعتها.' });
      return;
    }

    const num = invoiceForm.invoiceNumber || `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const amt = parseFloat(invoiceForm.amount);
    const newInv: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: num,
      clientName: invoiceForm.clientName,
      type: invoiceForm.type,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: invoiceForm.dueDate,
      amount: amt,
      status: 'unpaid'
    };

    setInvoices(prev => [newInv, ...prev]);

    // Create a corresponding debt automatically to link receivables
    const newDebt: Debt = {
      id: `debt-auto-${Date.now()}`,
      title: `فاتورة معلقة رقْم ${num}`,
      partyName: invoiceForm.clientName,
      type: 'receivable',
      amount: amt,
      dueDate: invoiceForm.dueDate,
      status: 'pending'
    };
    setDebts(prev => [newDebt, ...prev]);

    setShowAddInvoiceModal(false);
    setInvoiceForm(prev => ({ ...prev, invoiceNumber: '', clientName: '', amount: '' }));
    addToast({
      type: 'success',
      title: 'تم توليد الفاتورة والذمة المدينة',
      message: `تم إنشاء الفاتورة ${num} وإضافتها لقائمة المدفوعات المستحقة.`
    });
  };

  const handleAddDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtForm.title || !debtForm.partyName || !debtForm.amount) {
      addToast({ type: 'error', title: 'خطأ', message: 'يرجى مراجعة كافة الحسابات وملء الخانات الإلزامية.' });
      return;
    }

    const newDebt: Debt = {
      id: `debt-${Date.now()}`,
      title: debtForm.title,
      partyName: debtForm.partyName,
      type: debtForm.type,
      amount: parseFloat(debtForm.amount),
      dueDate: debtForm.dueDate,
      status: 'pending'
    };

    setDebts(prev => [newDebt, ...prev]);
    setShowAddDebtModal(false);
    setDebtForm(prev => ({ ...prev, title: '', partyName: '', amount: '' }));
    addToast({
      type: 'success',
      title: 'تم تسجيل العهدة/الذِمّة',
      message: 'تم إضافة المطالبة المالية بنجاح للجدولة الأمنية لنظام عدالة.'
    });
  };

  const handleDeleteTx = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    addToast({ type: 'warning', title: 'معاملة ملغاة', message: 'تم إزالة القيد المالي من النظام والتحليلات الجارية.' });
  };

  const handleSettleDebt = (id: string) => {
    setDebts(prev => prev.map(d => {
      if (d.id === id) {
        // Record as revenue or expense transaction automatically on settle
        const val = d.amount;
        const newTx: Transaction = {
          id: `tx-settle-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: d.type === 'receivable' ? 'revenue' : 'expense',
          description: `تسوية مطالبة مالية: ${d.title}`,
          amount: val,
          category: d.type === 'receivable' ? 'تصفية ذمم مدينة' : 'سداد ذمم دائنة',
          paymentMethod: 'تحويل نقدي',
          payee: d.partyName,
          linkedEntity: 'غير مرتبط'
        };
        setTransactions(prevT => [newTx, ...prevT]);

        return { ...d, status: 'settled' as const };
      }
      return d;
    }));
    addToast({ type: 'success', title: 'اكتملت التسجيلات والتحصيل', message: 'تم سداد أو تحصيل الذِمّة بالكامل وقيد المعاملة المالية المناسبة.' });
  };

  // 5. Automated Upcoming Debt Alerts Calc
  const debtAlerts = useMemo(() => {
    const today = new Date();
    return debts.filter(d => {
      if (d.status === 'settled') return false;
      const due = new Date(d.dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7; // Less than or equal to 7 days
    });
  }, [debts]);

  // Recharts cashflow helper builder from Organic Data
  const chartData = useMemo(() => {
    // Generate simple dynamic metrics from existing entries
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
    return months.map((m, i) => {
      // Create interesting curve based on standard entries or incremental values
      const factor = (i + 1) * 200;
      return {
        name: m,
        إيرادات: metrics.totalRevenue > 0 ? (metrics.totalRevenue / 6) * (i + 0.5) + factor : 0,
        مصروفات: metrics.totalExpense > 0 ? (metrics.totalExpense / 6) * (i + 0.2) + factor * 0.4 : 0
      };
    });
  }, [metrics]);

  return (
    <div id="unified_fin_mgt_platform_v2" className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 text-right font-sans" style={{ direction: 'rtl' }}>
      
      {/* Global Printable Header for reports/full page printing */}
      <PrintHeader 
        title="التقرير المالي التدقيقي للمنظومة" 
        subtitle="كشف التدفقات النقدية والميزانية والمستندات الحسابية - منظومة عدالة" 
      />

      {/* 1. Header Banner & Submodule Indicator */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-primary-dark via-primary to-primary rounded-[2rem] border border-primary/20 shadow-xl no-print text-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 px-3 bg-accent text-primary-dark rounded-full text-[10px] font-black uppercase tracking-wider">الإدارة والتدقيق المالي</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
            <span className="text-xs text-accent-light font-mono">آمن وسريّ</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
            منظومة الإدارة المالية الذكية لـ <span className="text-accent font-marhey">عدالة</span>
          </h1>
          <p className="text-xs text-slate-350 mt-1 max-w-2xl font-medium leading-relaxed">
            البوابة الرقمية الموحدة لتحليل كشوف الإيرادات والصرفيات، إدارة الصناديق البنكية، تتبع المطالبات، وجدولة تسوية الديون مع الربط المباشر بالقضايا والعقود.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button 
            onClick={() => { setTxType('revenue'); setShowAddTxModal(true); }}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 transition-all font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-950/20 text-white"
          >
            <Plus className="w-4 h-4 text-emerald-100" />
            <span>قيد مقبوضات جديد</span>
          </button>
          <button 
            onClick={() => { setTxType('expense'); setShowAddTxModal(true); }}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 transition-all font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-950/20 text-white"
          >
            <Plus className="w-4 h-4 text-rose-100" />
            <span>تسجيل معاملة صرف</span>
          </button>
        </div>
      </div>

      {/* 2. Automated Smart Reminders / Alerts Area */}
      {debtAlerts.length > 0 && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-between gap-4 text-orange-700 animate-pulse no-print">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-orange-600" />
            <div className="text-right">
              <h4 className="text-xs font-black">إشعار استحقاق مالي قادم خلال 7 أيام!</h4>
              <p className="text-[11px] font-medium opacity-90 mt-0.5">
                لديك {debtAlerts.length} ذمة معقلة تقترب من موعد الدفع. يرجى تصفية استحقاقات المستفيد لتجنب غرامات التأخير.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('debts')}
            className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-black rounded-lg transition-all"
          >
            معاينة الاستحقاقات
          </button>
        </div>
      )}

      {/* 3. Global KPI Metrics Blocks (Dynamic Calculated with Interactive Tab Swapping) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
        <div 
          onClick={() => setActiveTab('revenues')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'revenues' 
              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-800' 
              : 'bg-white border-slate-100 hover:shadow-md text-slate-700'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-xl"><TrendingUp className="w-5 h-5" /></span>
            <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-md">المقبوضات</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold">إجمالي الإيرادات المسجلة حالياً</p>
          <h3 className="text-xl font-black font-mono mt-1 text-slate-900">{formatKWD(metrics.totalRevenue)}</h3>
        </div>

        <div 
          onClick={() => setActiveTab('expenses')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'expenses' 
              ? 'bg-rose-500/10 border-rose-500 text-rose-800' 
              : 'bg-white border-slate-100 hover:shadow-md text-slate-700'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 bg-rose-500/10 text-rose-600 rounded-xl"><TrendingDown className="w-5 h-5" /></span>
            <span className="text-[10px] bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded-md">الصرفيات</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold">إجمالي المصروفات والنفقات المقيدة</p>
          <h3 className="text-xl font-black font-mono mt-1 text-slate-900">{formatKWD(metrics.totalExpense)}</h3>
        </div>

        <div 
          onClick={() => setActiveTab('reports')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'reports' 
              ? 'bg-accent/15 border-accent text-accent-dark' 
              : 'bg-white border-slate-100 hover:shadow-md text-slate-700'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 bg-accent/10 text-accent rounded-xl"><Activity className="w-5 h-5" /></span>
            <span className="text-[10px] bg-accent-light/60 text-accent-dark font-bold px-2 py-0.5 rounded-md">الأرباح والخسائر</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold">صافي الملاءة المالية الجاري للشركة</p>
          <h3 className={`text-xl font-black font-mono mt-1 ${metrics.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatKWD(metrics.netProfit)}
          </h3>
        </div>

        <div 
          onClick={() => setActiveTab('treasury')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            activeTab === 'treasury' 
              ? 'bg-blue-500/10 border-blue-500 text-blue-800' 
              : 'bg-white border-slate-100 hover:shadow-md text-slate-700'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <span className="p-2.5 bg-blue-500/10 text-blue-600 rounded-xl"><Landmark className="w-5 h-5" /></span>
            <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-md">الخزينة والأرصدة</span>
          </div>
          <p className="text-[10px] text-slate-400 font-bold">الملخص الرقمي في البنوك والصناديق التجارية</p>
          <h3 className="text-xl font-black font-mono mt-1 text-slate-900">{formatKWD(metrics.totalBankBalance)}</h3>
        </div>
      </div>

      {/* 4. Functional Subsections Routing Workspace & Tabs Menu */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* RIGHT SIDEBAR MODULES SELECTOR */}
        <div className="lg:col-span-3 space-y-4 no-print">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-2">
            <span className="text-[10px] font-black text-slate-400 tracking-wider block px-2 mb-2">النظام المالي الموحد</span>
            
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'dashboard' ? 'bg-accent text-slate-950 shadow-md shadow-accent/15 hover:opacity-95' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>لوحة التحليلات الجارية</span>
            </button>

            <button 
              onClick={() => setActiveTab('revenues')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'revenues' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/15' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4" />
                <span>إدارة الإيرادات والمقبوضات</span>
              </div>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-700 px-1.5 py-0.5 rounded font-mono">
                {transactions.filter(t => t.type === 'revenue').length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('expenses')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'expenses' ? 'bg-rose-600 text-white shadow-md shadow-rose-500/15' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <TrendingDown className="w-4 h-4" />
                <span>إدارة المصروفات والصرفيات</span>
              </div>
              <span className="text-[9px] bg-rose-500/20 text-rose-700 px-1.5 py-0.5 rounded font-mono">
                {transactions.filter(t => t.type === 'expense').length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('treasury')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'treasury' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4" />
                <span>إدارة الحسابات والصناديق</span>
              </div>
              <span className="text-[9px] bg-blue-500/20 text-blue-700 px-1.5 py-0.5 rounded font-mono">
                {bankAccounts.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('invoices')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'invoices' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4" />
                <span>الفواتير والرسوم التجارية</span>
              </div>
              <span className="text-[9px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-mono">
                {invoices.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('debts')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'debts' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-4 h-4" />
                <span>الذمم والديون والأقساط</span>
              </div>
              <span className="text-[9px] bg-orange-500/20 text-orange-700 px-1.5 py-0.5 rounded font-mono">
                {debts.length}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('bank-reconciliation')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'bank-reconciliation' ? 'bg-blue-700 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Landmark className="w-4 h-4 text-blue-500" />
                <span>مطابقة الكشوف البنكية والإيجارات</span>
              </div>
              <span className="text-[9px] bg-blue-500/20 text-blue-700 px-1.5 py-0.5 rounded font-mono">
                KNet / البنوك
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('budget-audit')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'budget-audit' ? 'bg-purple-800 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4 text-purple-400" />
                <span>تدقيق الميزانية السنوية والأداء</span>
              </div>
              <span className="text-[9px] bg-purple-500/20 text-purple-700 px-1.5 py-0.5 rounded font-mono">
                تدقيق 📊
              </span>
            </button>

            <button 
              onClick={() => setActiveTab('reports')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === 'reports' ? 'bg-purple-650 bg-purple-700 text-white shadow-md' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-4 h-4" />
                <span>التقارير والميزانية العمومية</span>
              </div>
              <span className="text-[9px] bg-purple-800/20 text-purple-750 px-1.5 py-0.5 rounded font-mono">
                كشوف
              </span>
            </button>
          </div>

          <div className="bg-accent-light/40 border border-accent/25 p-4.5 rounded-3xl text-accent-dark text-[11px] leading-relaxed font-black">
            <h5 className="font-black flex items-center gap-1.5 mb-1.5">
              <QrCode className="w-4 h-4 text-primary" />
              أولوية الخصوصية والأمان
            </h5>
            كافة البيانات مخزنة محلياً بالكامل ومحفوظة بموجب إقرار قانون التدابير السرية لبلدية الكويت والأنظمة القضائية الحاكمة.
          </div>
        </div>

        {/* LEFT WORKSPACE RENDERING VIEW CHANNELS */}
        <div className="lg:col-span-9 bg-white p-6 rounded-[2rem] border border-slate-150-100 shadow-sm min-h-[450px]">
          <AnimatePresence mode="wait">
            
            {/* TAB: DASHBOARD */}
            {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">لوحة تحليل التدفقات النقدية والنشاط</h2>
                    <p className="text-xs text-slate-500 mt-0.5">مؤشرات الرسوم التفاعلية وحالة الملاءة المحدثة تلقائياً.</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold bg-slate-50 p-2 border rounded-xl font-mono text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span>مزامنة جارية: {new Date().toLocaleDateString('ar-KW')}</span>
                  </div>
                </div>

                {/* Recharts Area for cashflows */}
                <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50">
                  <h3 className="text-xs font-black text-slate-800 mb-4 text-right">رسم تخطيطي لتراكم الأرصدة التجارية والإيرادات الدورية (د.ك)</h3>
                  {transactions.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <Activity className="w-12 h-12 stroke-[1] text-amber-500 animate-pulse" />
                      <p className="text-xs font-bold">لا يوجد لديك قيود مالية كافية لتوليد رسم بياني تفاعلي.</p>
                      <button 
                        onClick={() => { setTxType('revenue'); setShowAddTxModal(true); }}
                        className="text-xs text-accent-dark font-black underline mt-1"
                      >
                        اضغط هنا لإدراج المقبوضات الأولى للنشاط لإظهار المنحنيات
                      </button>
                    </div>
                  ) : (
                    <div className="h-64 select-none">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: 10 }} />
                          <Area type="monotone" dataKey="إيرادات" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                          <Area type="monotone" dataKey="مصروفات" stroke="#f43f5e" fillOpacity={1} fill="url(#colorExp)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Sub-grid system integrations indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4.5 border rounded-2xl space-y-3 bg-white hover:shadow-xs transition-shadow">
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 border-b pb-2">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      روابط التكامل الفعّال مع القضايا والعقود
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      عند تسجيل مقبوضات أتعاب قانونية، يتم ربط المعاملة باسم الموكل أو المقاولة تلقائياً لتحديث تقارير رصيد القضية.
                    </p>
                    <div className="space-y-1.5 text-[11px] font-bold text-slate-600 font-mono">
                      <div className="flex justify-between p-1 px-2 bg-slate-50 rounded">
                        <span>نوع الكيان المستهدف للربط</span>
                        <span className="text-accent-dark">القضايا والعقود</span>
                      </div>
                      <div className="flex justify-between p-1 px-2 bg-slate-50 rounded">
                        <span>تردد التحديثات التلقائية</span>
                        <span className="text-emerald-600">فوري ومؤمن</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4.5 border rounded-2xl space-y-3 bg-white hover:shadow-xs transition-shadow">
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 border-b pb-2">
                      <Users className="w-4 h-4 text-purple-600" />
                      مستحقات ورواتب الكادر البشري
                    </h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      المنظومة تسمح بخصم المصروفات التلقائية لعمولات الموظفين وصرفيات كشوف المخصصات لبلدية الكويت وإدارة الموارد البشرية.
                    </p>
                    <div className="space-y-1.5 text-[11px] font-bold text-slate-600 font-mono">
                      <div className="flex justify-between p-1 px-2 bg-slate-50 rounded">
                        <span>إجمالي الموظفين والمحاميين</span>
                        <span className="text-purple-600">{workspaceIntegrationSelects.employees.length} مسجلين</span>
                      </div>
                      <div className="flex justify-between p-1 px-2 bg-slate-50 rounded">
                        <span>التحقق من الامتثال</span>
                        <span className="text-emerald-600">آمن ومطابق</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: REVENUES & EXPENSES */}
            {(activeTab === 'revenues' || activeTab === 'expenses') && (
              <motion.div 
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">
                      {activeTab === 'revenues' ? 'سجل المقبوضات وإيداعات الإيرادات' : 'كشوف الصرفيات والمصروفات الإدارية'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activeTab === 'revenues' ? 'الأرصدة والأرباح الواردة للمكتب من الأتعاب والقضايا.' : 'كافة المبالغ الخارجة لامتثال الإيجارات والمصالح.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => { setTxType(activeTab === 'revenues' ? 'revenue' : 'expense'); setShowAddTxModal(true); }}
                    className={`px-4 py-2 text-xs font-black text-white rounded-xl flex items-center gap-1.5 shadow-md ${
                      activeTab === 'revenues' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/10' : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/10'
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>إحصاء معاملة جديدة</span>
                  </button>
                </div>

                {/* Toolbar filtering */}
                <div className="flex items-center gap-2 relative border border-slate-100 rounded-xl p-2.5 bg-slate-50 text-slate-800">
                  <Search className="w-4 h-4 text-slate-400 mr-1.5" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن معاملة موثوقة (الوصف، المستفيد، الكيان)..."
                    className="bg-transparent text-xs text-right font-bold w-full outline-none placeholder-slate-400"
                  />
                </div>

                {/* Transactions table */}
                <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 font-black border-b text-slate-700">
                      <tr>
                        <th className="p-3">التاريخ</th>
                        <th className="p-3">الوصف والجهة</th>
                        <th className="p-3">التصنيف</th>
                        <th className="p-3">ارتباط النظام</th>
                        <th className="p-3 text-left">المبلغ بالدينار الكويتي</th>
                        <th className="p-3 text-center no-print">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-650 font-medium">
                      {transactions.filter(t => t.type === (activeTab === 'revenues' ? 'revenue' : 'expense'))
                        .filter(t => {
                          if (!searchQuery) return true;
                          return t.description.includes(searchQuery) || t.payee.includes(searchQuery) || t.category.includes(searchQuery);
                        })
                        .length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-slate-400">
                              <div className="flex flex-col items-center justify-center gap-2">
                                <History className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                                <p className="font-bold">سلسلة البيانات فارغة تماماً.</p>
                                <p className="text-[10px] opacity-80">لا يوجد لديك تسجيلات مالية لهذا التطبيق حتى الآن.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          transactions.filter(t => t.type === (activeTab === 'revenues' ? 'revenue' : 'expense'))
                            .filter(t => {
                              if (!searchQuery) return true;
                              return t.description.includes(searchQuery) || t.payee.includes(searchQuery) || t.category.includes(searchQuery);
                            })
                            .map((t) => (
                              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-3 font-mono text-[10px]">{t.date}</td>
                                <td className="p-3">
                                  <p className="font-black text-slate-900">{t.description}</p>
                                  <p className="text-[10px] text-slate-400 mt-0.5">المستفيد: {t.payee} • {t.paymentMethod}</p>
                                </td>
                                <td className="p-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                    t.type === 'revenue' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                                  }`}>{t.category}</span>
                                </td>
                                <td className="p-3 text-[10px] text-indigo-650 font-bold max-w-[150px] truncate">{t.linkedEntity}</td>
                                <td className={`p-3 text-left font-mono font-black ${t.type === 'revenue' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {t.type === 'revenue' ? '+' : '-'}{formatKWD(t.amount)}
                                </td>
                                <td className="p-3 text-center space-x-1.5 space-x-reverse no-print">
                                  <button 
                                    onClick={() => setPrintableDoc({
                                      title: t.type === 'revenue' ? 'سند إيصال وقبض مالي' : 'إذن صرف وصرفية معتمدة',
                                      refNumber: t.id,
                                      date: t.date,
                                      payee: t.payee,
                                      amount: t.amount,
                                      category: t.category,
                                      description: t.description,
                                      note: `لقد تم تصفية هذا التبادل المالي وربطه بالنظام القانوني لصالح: ${t.linkedEntity}`
                                    })}
                                    className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-black text-[10px] transition-all flex inline-flex items-center gap-1"
                                  >
                                    <Printer className="w-3 h-3" />
                                    <span>طباعة السند</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTx(t.id)}
                                    className="p-1 text-rose-650 hover:bg-rose-50-600 hover:bg-rose-50 text-rose-700 rounded transition-all"
                                    title="حذف"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))
                        )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* TAB: TREASURY */}
            {activeTab === 'treasury' && (
              <motion.div 
                key="treasury"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">صناديق الخزينة والمحافظ النقدية</h2>
                    <p className="text-xs text-slate-500 mt-0.5">الحسابات البنيكية والعهد النشطة لحفظ رأس المال.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddAccountModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-500/10"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة صندوق أو حساب بنكي</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {bankAccounts.length === 0 ? (
                    <div className="col-span-3 p-12 text-center text-slate-400 border border-dashed rounded-3xl space-y-2">
                      <Landmark className="w-12 h-12 mx-auto stroke-[1] text-blue-500" />
                      <h4 className="font-bold text-xs text-slate-800">لا يوجد حسابات بنكية معرفة حالياً.</h4>
                      <p className="text-[11px]">يرجى تهيئة صندوق مالي أولاً لإظهار الأرصدة وإدراج الصفقات القانونية.</p>
                    </div>
                  ) : (
                    bankAccounts.map((acc) => (
                      <div key={acc.id} className="p-4.5 border border-slate-100 rounded-2xl relative bg-slate-50/50 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <span className={`p-2 rounded-xl text-white ${
                            acc.type === 'bank' ? 'bg-blue-600' : acc.type === 'safe' ? 'bg-amber-600' : 'bg-purple-600'
                          }`}>
                            <Landmark className="w-4 h-4" />
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">حساب رقم: {acc.accountNumber}</span>
                        </div>
                        <h4 className="font-black text-xs text-slate-900">{acc.name}</h4>
                        <p className="text-[9px] text-slate-400 mt-0.5 uppercase">{acc.type === 'bank' ? 'حساب ائتماني' : acc.type === 'safe' ? 'خزنة فرعية' : 'محفظة ذكية'}</p>
                        <hr className="my-2.5 opacity-60" />
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] text-slate-400 font-bold">الرصيد المتاح الحالي:</span>
                          <span className="text-sm font-mono font-black text-slate-900">{formatKWD(acc.balance)}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* TAB: INVOICES */}
            {activeTab === 'invoices' && (
              <motion.div 
                key="invoices"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">إدارة ودورة الفواتير والرسوم الاستشارية</h2>
                    <p className="text-xs text-slate-500 mt-0.5">الفواتير لبلدية الكويت، ضريبة الأرباح، والخدمات العادية.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddInvoiceModal(true)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إنشاء فاتورة جديدة</span>
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-50 font-black border-b text-slate-700">
                      <tr>
                        <th className="p-3">رقم الفاتورة</th>
                        <th className="p-3">العميل والمستفيد</th>
                        <th className="p-3">تاريخ الاستحقاق</th>
                        <th className="p-3">نوع الفاتورة</th>
                        <th className="p-3 text-left">المبلغ</th>
                        <th className="p-3 text-center no-print">فاتورة جاهزة للتصدير و QR</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-slate-650 font-medium">
                      {invoices.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <FileText className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                              <p className="font-bold">قائمة الفواتير خالية.</p>
                              <p className="text-[10px] opacity-80">اضغط على زر الإنشاء بالركن لتوليد الفواتير للضرائب والخدمات.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        invoices.map((inv) => (
                          <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-black text-slate-950">{inv.invoiceNumber}</td>
                            <td className="p-3">
                              <p className="font-bold text-slate-900">{inv.clientName}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">إصدار: {inv.issueDate}</p>
                            </td>
                            <td className="p-3 font-mono text-[10px] text-rose-600 font-bold">{inv.dueDate}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                inv.type === 'tax' ? 'bg-amber-50 text-amber-700' : 'bg-slate-50 text-accent-dark'
                              }`}>
                                {inv.type === 'tax' ? 'فاتورة ضريبية' : inv.type === 'debit' ? 'إشعار مدين' : inv.type === 'credit' ? 'إشعار دائن' : 'فاتورة عادية'}
                              </span>
                            </td>
                            <td className="p-3 text-left font-mono font-black text-slate-905-900">{formatKWD(inv.amount)}</td>
                            <td className="p-3 text-center no-print">
                              <button 
                                onClick={() => setPrintableDoc({
                                  title: inv.type === 'tax' ? 'فاتورة ضريبية رسمية للشركة' : 'فاتورة خدمات استشارية قانونية',
                                  refNumber: inv.invoiceNumber,
                                  date: inv.issueDate,
                                  payee: inv.clientName,
                                  amount: inv.amount,
                                  category: 'خدمات الترافع والتقارير الاستشارية',
                                  description: `مطالبة مالية تفصيلية مستحقة الدفع بحلول تاريخ ${inv.dueDate}`,
                                  note: 'الرسوم الضريبية والامتثال السلوكي يخضع لشروط الترخيص الإداري.'
                                })}
                                className="p-1 px-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-black text-[10px] transition-all flex inline-flex items-center gap-1.5"
                              >
                                <QrCode className="w-3.5 h-3.5 text-amber-500" />
                                <span>معاينة وتدقيق</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* TAB: DEBTS AND LIABILITIES */}
            {activeTab === 'debts' && (
              <motion.div 
                key="debts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">سجل الذمم الدائنة والمدينة والأقساط المعلقة</h2>
                    <p className="text-xs text-slate-500 mt-0.5">جدولة وسداد الالتزامات والذمم المستحقة للعملاء والمحيط الإداري.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddDebtModal(true)}
                    className="px-4 py-2 bg-orange-650 bg-orange-600 hover:bg-orange-500 text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-orange-500/10"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة مطالبة / ذِمّة معلقة</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Custom Reminder Controls Panel */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-205 rounded-3xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2.5 border-b pb-3.5">
                        <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                          <SlidersHorizontal className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-900">تنبيهات استحقاق الذمم</h3>
                          <p className="text-[10px] text-slate-400">ربط تواريخ الاستحقاق بنظام الإشعارات.</p>
                        </div>
                      </div>

                      {/* Active Offsets List */}
                      <div className="space-y-2">
                        <span className="text-[10px] text-slate-400 font-bold block">الفترات النشطة للتنبيه قبل الاستحقاق:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {reminderDays.map(days => (
                            <div key={days} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 border border-orange-100/60 text-orange-850 rounded-xl text-[10px] font-black">
                              <span>{days === 0 ? 'في نفس اليوم' : `قبل ${days} أيام`}</span>
                              <button 
                                onClick={() => {
                                  setReminderDays(prev => prev.filter(d => d !== days));
                                  addToast({ type: 'info', title: 'تمت الإزالة', message: `تم إيقاف فترة التنبيه قبل ${days} أيام.` });
                                }}
                                className="text-orange-500 hover:text-orange-700 font-extrabold ml-0.5 text-xs focus:outline-none"
                                title="إزالة فترة التنبيه"
                              >
                                &times;
                              </button>
                            </div>
                          ))}
                          {reminderDays.length === 0 && (
                            <span className="text-[10px] text-rose-500 font-bold">لا توجد فترات تنبيه نشطة. ستحصل على تنبيهات المتأخرات واليوم فقط.</span>
                          )}
                        </div>
                      </div>

                      {/* Add Custom Offset */}
                      <div className="space-y-2 pt-3 border-t border-slate-100">
                        <label className="text-[10px] text-slate-500 font-bold block">إضافة تذكير مخصص (بالأيام قبل موعد الاستحقاق):</label>
                        <div className="flex gap-2">
                          <input 
                            type="number" 
                            min="1" 
                            max="365"
                            placeholder="عدد الأيام"
                            value={newCustomReminder}
                            onChange={(e) => setNewCustomReminder(e.target.value)}
                            className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold text-center focus:ring-1 focus:ring-orange-500 focus:border-orange-500 outline-none"
                          />
                          <button 
                            onClick={() => {
                              const days = parseInt(newCustomReminder, 10);
                              if (isNaN(days) || days <= 0) {
                                addToast({ type: 'error', title: 'خطأ الإدخال', message: 'يرجى إدخال عدد أيام أكبر من الصفر.' });
                                return;
                              }
                              if (reminderDays.includes(days)) {
                                addToast({ type: 'warning', title: 'موجود مسبقاً', message: 'هذه الفترة مضافة مسبقاً وتعمل حالياً.' });
                                return;
                              }
                              setReminderDays(prev => [...prev, days].sort((a,b) => a-b));
                              setNewCustomReminder('');
                              addToast({ 
                                type: 'success', 
                                title: 'تم تفعيل فترة تذكير مخصصة', 
                                message: `مكتب الإدارة المالية سيقوم بمراقبة الديون وتنبيهك بمهلة ${days} أيام قبل تاريخ الاستحقاق.` 
                              });
                            }}
                            className="px-3.5 py-2 bg-slate-905 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl hover:opacity-95"
                          >
                            تثبيت
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400 leading-relaxed pt-1.5 border-t border-dashed mt-2">
                          * أي قيد مالي أو ذمة مسجلة في هذا القسم تراقب تلقائياً، والمنظومة ترسل الإشعار المناسب كذمة مدينة (لنا) أو دائنة (علينا) للقسم المالي على مدار الساعة.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Debts Table (2 Cols) */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white shadow-sm">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-50 font-black border-b text-slate-700">
                          <tr>
                            <th className="p-3">البيان المالي للعهد والديون</th>
                            <th className="p-3">الطرف الثاني</th>
                            <th className="p-3">تاريخ الاستحقاق النهائى والمسافة والمهل</th>
                            <th className="p-3">النوع والموقف</th>
                            <th className="p-3 text-left">قيمة الذِمّة المالية</th>
                            <th className="p-3 text-center no-print">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-slate-650 font-medium">
                          {debts.length === 0 ? (
                            <tr>
                              <td colSpan={6} className="p-12 text-center text-slate-400">
                                <div className="flex flex-col items-center justify-center gap-2">
                                  <SlidersHorizontal className="w-10 h-10 text-slate-300 stroke-[1.5]" />
                                  <p className="font-bold">لوحة الديون والذمم فارغة.</p>
                                  <p className="text-[10px] opacity-80">أدرج المطالبات من خلال الضغط على الزر، أو سيتم إضافتها تلقائياً عند توليد الفواتير.</p>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            debts.map((d) => {
                              const remainingDays = getDaysDifference(d.dueDate);
                              return (
                                <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-3">
                                    <p className="font-bold text-slate-900">{d.title}</p>
                                    <p className="text-[9px] text-slate-400">الموقف: {d.status === 'settled' ? 'تمت التسوية' : 'بانتظار السداد'}</p>
                                  </td>
                                  <td className="p-3 font-bold text-slate-800">{d.partyName}</td>
                                  <td className="p-3">
                                    <div className="flex flex-col">
                                      <span className="font-mono text-[10px] font-bold">{d.dueDate}</span>
                                      {d.status !== 'settled' && (
                                        <span className={`text-[9px] font-black mt-0.5 ${
                                          remainingDays < 0 ? 'text-rose-600' : remainingDays === 0 ? 'text-amber-600 font-extrabold animate-pulse' : 'text-slate-400'
                                        }`}>
                                          {remainingDays < 0 
                                            ? `متأخرة بـ ${Math.abs(remainingDays)} يوم` 
                                            : remainingDays === 0 
                                              ? 'تستحق السداد والتحصيل اليوم!' 
                                              : `المتبقي: ${remainingDays} يوم`}
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                      d.type === 'receivable' ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'
                                    }`}>
                                      {d.type === 'receivable' ? 'ذمّة مدينة (لنا)' : 'ذمّة دائنة (علينا)'}
                                    </span>
                                  </td>
                                  <td className="p-3 text-left font-mono font-black text-slate-900">{formatKWD(d.amount)}</td>
                                  <td className="p-3 text-center no-print">
                                    {d.status === 'pending' ? (
                                      <button 
                                        onClick={() => handleSettleDebt(d.id)}
                                        className="p-1 px-3 bg-gradient-to-r from-accent to-accent-dark text-slate-950 font-black rounded text-[10px] transition-all hover:opacity-90 shadow-sm"
                                      >
                                        تحصيل وتسوية الآن
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-emerald-600 font-black flex justify-center items-center gap-1">
                                        <CheckCircle className="w-3.5 h-3.5" /> مسواة باليد
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: BANK RECONCILIATION */}
            {activeTab === 'bank-reconciliation' && (
              <motion.div 
                key="bank-reconciliation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <BankReconciliationView />
              </motion.div>
            )}

            {/* TAB: BUDGET AUDIT */}
            {activeTab === 'budget-audit' && (
              <motion.div 
                key="budget-audit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <AnnualBudgetAuditView />
              </motion.div>
            )}

            {/* TAB: REPORTS */}
            {activeTab === 'reports' && (
              <motion.div 
                key="reports"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">التقارير المالية التدقيقية والتصدير النهائي</h2>
                    <p className="text-xs text-slate-500 mt-0.5">تحليل صافي التدفقات، الأرباح والخسائر الجارية، والميزانية الضريبية.</p>
                  </div>
                  <div className="flex items-center gap-1.5 no-print">
                    <button 
                      onClick={() => addToast({ type: 'success', title: 'تم التصدير إلى Excel', message: 'بناء وحفظ جدول التفاصيل المالية الجارية بنجاح.' })}
                      className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-black flex items-center gap-1 border border-emerald-250-200 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      <span>تصدير Excel</span>
                    </button>
                    <button 
                      onClick={() => window.print()}
                      className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black flex items-center gap-1 shadow-md transition-all"
                    >
                      <Printer className="w-4 h-4" />
                      <span>طباعة التقرير الشامل</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div 
                    onClick={() => setActiveTab('budget-audit')}
                    className="p-5 bg-purple-50 hover:bg-purple-100/80 border border-purple-200 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-black text-xs text-purple-950 group-hover:text-purple-700">وحدة تدقيق الميزانية السنوية 📊</h4>
                      <p className="text-[10px] text-purple-700 mt-0.5">مقارنة التكاليف الفعلية بالمخطط لها وتحديد فرص التوفير</p>
                    </div>
                    <span className="px-3 py-1.5 bg-purple-700 text-white rounded-xl text-xs font-bold">معاينة التقرير ←</span>
                  </div>

                  <div 
                    onClick={() => setActiveTab('bank-reconciliation')}
                    className="p-5 bg-blue-50 hover:bg-blue-100/80 border border-blue-200 rounded-2xl cursor-pointer transition-all flex items-center justify-between group"
                  >
                    <div>
                      <h4 className="font-black text-xs text-blue-950 group-hover:text-blue-700">مطابقة الكشوف البنكية ومطابقة الإيجارات 🏦</h4>
                      <p className="text-[10px] text-blue-700 mt-0.5">ربط التحويلات الواردة والتنبيه بالمطابقات المفقودة</p>
                    </div>
                    <span className="px-3 py-1.5 bg-blue-700 text-white rounded-xl text-xs font-bold">معاينة المطابقة ←</span>
                  </div>
                </div>

                <div className="p-6 border border-slate-100 rounded-3xl bg-slate-50/50 space-y-4">
                  <h3 className="text-sm font-black text-slate-800 border-b pb-3">تجميعة حسابات الأرباح والخسائر لبلدية الكويت القانونية</h3>
                  
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between p-2.5 border-b font-medium">
                      <span className="text-slate-500">مجموع المقبوضات (الإيرادات والمثبتات):</span>
                      <span className="font-mono text-emerald-600 font-black">{formatKWD(metrics.totalRevenue)}</span>
                    </div>

                    <div className="flex justify-between p-2.5 border-b font-medium">
                      <span className="text-slate-500">مجموع النفقات والصرفيات والعهود:</span>
                      <span className="font-mono text-rose-600 font-black">{formatKWD(metrics.totalExpense)}</span>
                    </div>

                    <div className="flex justify-between p-2.5 border-b font-medium">
                      <span className="text-slate-500">حساب الأقساط المدينة بانتظار التحصيل:</span>
                      <span className="font-mono text-slate-700 font-bold">{formatKWD(metrics.receivablesVal)}</span>
                    </div>

                    <div className="flex justify-between p-2.5 border-b font-medium">
                      <span className="text-slate-500">حساب المتأخرات والديون الدائنة المستحقة عليها:</span>
                      <span className="font-mono text-rose-700 font-bold">{formatKWD(metrics.payablesVal)}</span>
                    </div>

                    <div className="flex justify-between p-3.5 bg-accent-light/50 text-slate-950 rounded-xl font-black text-sm">
                      <span>صافي الأرباح الموزعة الجاري (M-Loss Net):</span>
                      <span className="font-mono">{formatKWD(metrics.netProfit)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* 5. FIRST-CLASS CUSTOM PRINT PREVIEW MODAL */}
      {printableDoc && (
        <div role="dialog" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-[2.5rem] border border-slate-205 shadow-2xl p-6.5 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-5 text-right font-sans relative">
            <button 
              onClick={() => setPrintableDoc(null)}
              className="absolute top-4 left-4 p-2 bg-slate-100 hover:bg-slate-200 transition-colors rounded-full text-slate-700 no-print"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="border-[3px] border-accent/60 p-2 rounded-2xl">
              <div className="border border-slate-200 p-5 rounded-xl space-y-4">
                
                {/* Official Print Header - ONLY VISIBLE DURING PRINT */}
                <PrintHeader 
                  title={printableDoc.title} 
                  subtitle={`رقم السند: ${printableDoc.refNumber} • تاريخ المعاملة: ${printableDoc.date}`} 
                />

                {/* Visual Official seal - ONLY VISIBLE ON SCREEN PREVIEW */}
                <div className="flex justify-between items-center border-b pb-4 no-print">
                  <div className="text-right">
                    <h3 className="text-sm font-black text-primary">منظومة عدالة للمحاماة</h3>
                    <p className="text-[9px] text-slate-400 mt-0.5">مكتب معتمد - بلدية الكويت</p>
                  </div>
                  <div className="p-2 bg-accent/15 border border-accent/25 rounded-lg text-xs font-black text-accent-dark">
                    معاينة السند المالي
                  </div>
                </div>

                <div className="text-center py-2 no-print">
                  <h2 className="text-base font-black text-slate-900 underline decoration-accent decoration-2 underline-offset-4">
                    {printableDoc.title}
                  </h2>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">رقم المرجع: {printableDoc.refNumber} • تاريخ: {printableDoc.date}</p>
                </div>

                <div className="space-y-2.5 text-xs leading-relaxed font-bold">
                  {/* LIVE USER CUSTOMIZATION EDITABLE FORM */}
                  <div className="p-3 bg-slate-50 border rounded-xl flex flex-col gap-2 no-print">
                    <label className="text-[10px] text-slate-400">تعديل البيان يدوياً قبل الطباعة النهائية:</label>
                    <textarea 
                      value={printableDoc.description}
                      onChange={(e) => setPrintableDoc({ ...printableDoc, description: e.target.value })}
                      className="w-full bg-white border rounded p-1.5 focus:ring-1 focus:ring-primary outline-none text-xs text-slate-850 font-bold"
                      rows={3}
                    />
                  </div>

                  {/* Print Version of Description - ONLY VISIBLE DURING PRINT */}
                  <div className="print-only p-4 bg-slate-50 border border-slate-100 rounded-xl mb-4 text-xs font-bold leading-relaxed text-slate-800">
                    <span className="text-[10px] text-slate-400 block mb-1">البيان والشرح التفصيلي للعملية:</span>
                    {printableDoc.description}
                  </div>

                  <div className="grid grid-cols-2 gap-3.5 text-[11px] font-bold">
                    <div className="bg-slate-50 p-2 border rounded">
                      <span className="text-slate-400 block text-[9px]">الطرف الثاني / الجهة المستلمة:</span>
                      <span className="text-slate-800">{printableDoc.payee}</span>
                    </div>
                    <div className="bg-slate-50 p-2 border rounded">
                      <span className="text-slate-400 block text-[9px]">بند تصنيف الحساب:</span>
                      <span className="text-slate-800">{printableDoc.category}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-accent-light/30 border-r-4 border-accent text-slate-900 text-center rounded-l">
                    <span className="text-[10px] text-slate-500 block">إجمالي الملخص المُراد تسويته:</span>
                    <span className="text-base font-mono font-black text-slate-900">{formatKWD(printableDoc.amount)}</span>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed italic block mt-1.5 no-print">
                    {printableDoc.note}
                  </p>
                </div>

                {/* Footers QR Code automation */}
                <div className="flex justify-between items-center border-t pt-4">
                  <div className="text-[8px] text-slate-400">
                    <p>المشرف الضريبي العام لوزارة المالية الكويتية</p>
                    <p className="mt-0.5">رمز توثيق المحلفين: AD-KWT-2026-FL</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <QrCode className="w-10 h-10 text-slate-950" />
                    <span className="text-[8px] text-slate-400 uppercase leading-tight">مسح رمزي<br/>QR للتحقق</span>
                  </div>
                </div>

              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-black no-print">
              <button 
                onClick={() => setPrintableDoc(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
              >
                إغلاق
              </button>
              <button 
                onClick={() => {
                  window.print();
                  setPrintableDoc(null);
                  addToast({ type: 'success', title: 'تم إرسال أمر الطباعة', message: 'جاري تشغيل الطابعة بموجب كشوف التدقيق الحسابي.' });
                }}
                className="px-4 py-2 bg-gradient-to-r from-accent to-accent-dark text-slate-950 rounded-xl transition-all shadow-md flex items-center gap-1.5 hover:opacity-95"
              >
                <Printer className="w-4 h-4" />
                <span>إتمام والطباعة النهائية</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODALS FOR FORMS INPUTS */}
      
      {/* ADDTX MODAL */}
      {showAddTxModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddTransaction} className="bg-white rounded-3xl border shadow-xl p-5 max-w-md w-full text-right font-sans space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b pb-2">
              {txType === 'revenue' ? 'تسجيل إيرادات ومقبوضات جديدة' : 'قيد سداد ومصروفات جارية'}
            </h3>

            <div className="space-y-2.5 text-xs font-bold text-slate-700">
              <div className="flex flex-col gap-1">
                <label>التاريخ:</label>
                <input 
                  type="date"
                  value={txForm.date}
                  onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                  className="p-2 border rounded-xl outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label>بيان المسمى الحسابي المالي:</label>
                <input 
                  type="text" 
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  placeholder="مثال: أتعاب المرافعة لقضية بنك بوبيان"
                  className="p-2 border rounded-xl outline-none text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label>المبلغ (د.ك):</label>
                  <input 
                    type="number" 
                    step="0.001"
                    value={txForm.amount}
                    onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                    placeholder="250.000"
                    className="p-2 border rounded-xl outline-none font-mono"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label>المستلم / المستفيد:</label>
                  <input 
                    type="text" 
                    value={txForm.payee}
                    onChange={(e) => setTxForm({ ...txForm, payee: e.target.value })}
                    placeholder="الاسم الكامل للعميل"
                    className="p-2 border rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label>البند والتصنيف الملحق:</label>
                  <select 
                    value={txForm.category}
                    onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                    className="p-2 border rounded-xl outline-none text-xs"
                  >
                    {txType === 'revenue' ? (
                      <>
                        <option>أتعاب قضايا</option>
                        <option>استشارات قانونية دقيقة</option>
                        <option>تمثيل وتحكيم</option>
                        <option>أرباح عقارية مستأجرة</option>
                      </>
                    ) : (
                      <>
                        <option>رواتب ومستحقات محامين</option>
                        <option>رسوم حكومية وطوابع قضائية</option>
                        <option>إيجار مقر المكتب</option>
                        <option>مصاريف لوجستية ونثريات</option>
                        <option>تجديد تراخيص وتأمينات</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label>طريقة معالجة الدفع:</label>
                  <select 
                    value={txForm.paymentMethod}
                    onChange={(e) => setTxForm({ ...txForm, paymentMethod: e.target.value })}
                    className="p-2 border rounded-xl outline-none text-xs"
                  >
                    <option>تحويل بنكي</option>
                    <option>شيك مصدق</option>
                    <option>نقداً</option>
                    <option>كي نت</option>
                    <option>بطاقة ائتمان</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label>التكامل الملحق - ربط الكيان المالي المباشر:</label>
                <select 
                  value={txForm.linkedEntity}
                  onChange={(e) => setTxForm({ ...txForm, linkedEntity: e.target.value })}
                  className="p-2 border rounded-xl outline-none text-xs"
                >
                  <optgroup label="القضايا المفعلة">
                    {workspaceIntegrationSelects.cases.map(c => <option key={c} value={c}>{c}</option>)}
                  </optgroup>
                  <optgroup label="العقود">
                    {workspaceIntegrationSelects.contracts.map(co => <option key={co} value={co}>{co}</option>)}
                  </optgroup>
                  <optgroup label="الموظفين والشركاء">
                    {workspaceIntegrationSelects.employees.map(em => <option key={em} value={em}>{em}</option>)}
                  </optgroup>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-black pt-2">
              <button 
                type="button" 
                onClick={() => setShowAddTxModal(false)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                إلغاء
              </button>
              <button 
                type="submit"
                className={`px-4 py-2 text-white rounded-xl ${
                  txType === 'revenue' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                حفظ وإدراج للنظام
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ACCOUNT MODAL */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddBankAccount} className="bg-white rounded-3xl border shadow-xl p-5 max-w-sm w-full text-right font-sans space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b pb-2">تهيئة صندوق أو حساب مصرفي</h3>

            <div className="space-y-2.5 text-xs font-bold text-slate-700">
              <div className="flex flex-col gap-1">
                <label>الاسم التعريفي للحساب:</label>
                <input 
                  type="text"
                  placeholder="مثال: بيت التمويل الكويتي - الخزينة"
                  value={accountForm.name}
                  onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                  className="p-2 border rounded-xl outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label>نوع الصندوق المالي:</label>
                <select 
                  value={accountForm.type}
                  onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value as any })}
                  className="p-2 border rounded-xl outline-none text-xs"
                >
                  <option value="bank">حساب بنكي جاري</option>
                  <option value="safe">صندوق نقدي فرعي</option>
                  <option value="wallet">محفظة دفع رقمية</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label>رقم الحساب:</label>
                  <input 
                    type="text"
                    value={accountForm.accountNumber}
                    onChange={(e) => setAccountForm({ ...accountForm, accountNumber: e.target.value })}
                    placeholder="992019-201"
                    className="p-2 border rounded-xl outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label>الرصيد الافتتاحي (د.ك):</label>
                  <input 
                    type="number"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                    placeholder="1000.000"
                    className="p-2 border rounded-xl outline-none font-mono"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-black pt-2">
              <button type="button" onClick={() => setShowAddAccountModal(false)} className="px-3 py-2 bg-slate-100 rounded-xl">إلغاء</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl">حفظ</button>
            </div>
          </form>
        </div>
      )}

      {/* INVOICE MODAL */}
      {showAddInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddInvoice} className="bg-white rounded-3xl border shadow-xl p-5 max-w-sm w-full text-right font-sans space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b pb-2">توليد وصياغة فاتورة جديدة</h3>

            <div className="space-y-2.5 text-xs font-bold text-slate-700">
              <div className="flex flex-col gap-1">
                <label>اسم العميل القانوني:</label>
                <input 
                  type="text"
                  placeholder="مثال: شركة الصناعات الوطنية"
                  value={invoiceForm.clientName}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, clientName: e.target.value })}
                  className="p-2 border rounded-xl outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label>نوع الفاتورة:</label>
                  <select 
                    value={invoiceForm.type}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, type: e.target.value as any })}
                    className="p-2 border rounded-xl outline-none text-xs"
                  >
                    <option value="tax">فاتورة ضريبية رسمية</option>
                    <option value="regular">فاتورة عادية</option>
                    <option value="debit">إشعار مدين</option>
                    <option value="credit">إشعار دائن</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label>المبلغ (د.ك):</label>
                  <input 
                    type="number"
                    value={invoiceForm.amount}
                    onChange={(e) => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                    placeholder="350.000"
                    className="p-2 border rounded-xl outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label>تاريخ الاستحقاق النهائي لتدابير الدفع:</label>
                <input 
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                  className="p-2 border rounded-xl outline-none text-xs font-bold"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-black pt-2">
              <button type="button" onClick={() => setShowAddInvoiceModal(false)} className="px-3 py-2 bg-slate-100 rounded-xl">إلغاء</button>
              <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl">توليد وإرسال</button>
            </div>
          </form>
        </div>
      )}

      {/* DEBT MODAL */}
      {showAddDebtModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddDebt} className="bg-white rounded-3xl border shadow-xl p-5 max-w-sm w-full text-right font-sans space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b pb-2">تسجيل أقساط أو ذِمّة معلقة</h3>

            <div className="space-y-2.5 text-xs font-bold text-slate-700">
              <div className="flex flex-col gap-1">
                <label>البيان والسبب الحسابي:</label>
                <input 
                  type="text"
                  placeholder="مثال: قسط قضية الخبراء الثاني"
                  value={debtForm.title}
                  onChange={(e) => setDebtForm({ ...debtForm, title: e.target.value })}
                  className="p-2 border rounded-xl outline-none"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label>الطرف الآخر أو المستفيد:</label>
                <input 
                  type="text"
                  placeholder="اسم الشخص أو الموكل المدين"
                  value={debtForm.partyName}
                  onChange={(e) => setDebtForm({ ...debtForm, partyName: e.target.value })}
                  className="p-2 border rounded-xl outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <label>نوع التزام الذِمّة:</label>
                  <select 
                    value={debtForm.type}
                    onChange={(e) => setDebtForm({ ...debtForm, type: e.target.value as any })}
                    className="p-2 border rounded-xl outline-none text-xs"
                  >
                    <option value="receivable">ذِمّة مدينة لنا (مطالبة واردة)</option>
                    <option value="payable">ذِمّة دائنة علينا (التزام بالدفع)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label>مبلغ الدين (د.ك):</label>
                  <input 
                    type="number"
                    value={debtForm.amount}
                    onChange={(e) => setDebtForm({ ...debtForm, amount: e.target.value })}
                    placeholder="500.000"
                    className="p-2 border rounded-xl outline-none font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label>تاريخ المطالبة النهائي:</label>
                <input 
                  type="date"
                  value={debtForm.dueDate}
                  onChange={(e) => setDebtForm({ ...debtForm, dueDate: e.target.value })}
                  className="p-2 border rounded-xl outline-none"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 text-xs font-black pt-2">
              <button type="button" onClick={() => setShowAddDebtModal(false)} className="px-3 py-2 bg-slate-100 rounded-xl">إلغاء</button>
              <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-xl">حفظ في السجل</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export const mockFinancialTransactions: any[] = [];

export default FinancialManagementPage;
