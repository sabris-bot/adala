import React, { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import PrintHeader from '../components/ui/PrintHeader';
import { 
    CurrencyDollarIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, 
    FolderIcon, InformationCircleIcon, CheckCircleIcon, XCircleIcon, 
    ClockIcon, BanknotesIcon, ChartBarIcon, PrinterIcon, CalculatorIcon,
    MagnifyingGlassIcon, UsersIcon, ScaleIcon, OFFICE_NAME
} from '../constants';
import { Loan, Employee, LoanType, LoanStatus, InstallmentStatus, Installment } from '../types';
import { initialEmployees } from './EmployeeProfilePage';
import { LoanStatusBadge, InstallmentStatusBadge } from '../components/ui/Badge';

// Modular Imports
import { initialLoans, initialLoanLogs, validateKuwaitiLoanRules, LoanActivityLog } from './loan_data';
import { LEGAL_TEMPLATES, fillTemplate, LegalTemplate } from './loan_templates';

import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';

const LoanManagementPage: React.FC = () => {
  const { addToast } = useToast();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'loans' | 'advances' | 'payments' | 'templates' | 'aiCopilot' | 'integrations'>('dashboard');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Database States
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [logs, setLogs] = useState<LoanActivityLog[]>(initialLoanLogs);
  const [employees] = useState<Employee[]>(initialEmployees);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [salaryRange, setSalaryRange] = useState<string>('all');
  const [deductionWarningFilter, setDeductionWarningFilter] = useState<boolean>(false);

  // Modals & Action States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentLoan, setCurrentLoan] = useState<Partial<Loan> | null>(null);
  const [viewingLoanId, setViewingLoanId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(LEGAL_TEMPLATES[0].id);
  const [templateSearch, setTemplateSearch] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [loanForAgreement, setLoanForAgreement] = useState<Loan | null>(null);

  // Installment Recording State
  const [selectedInstallmentId, setSelectedInstallmentId] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState<string>('');

  // Form Field States for Add/Edit
  const [formFields, setFormFields] = useState({
    employeeId: '',
    loanType: LoanType.PERSONAL,
    loanAmount: 0,
    term: 12,
    purpose: '',
    repaymentStartDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    guarantorName: '',
    guarantorCivilId: '',
    status: LoanStatus.PENDING_APPROVAL as LoanStatus,
    notes: ''
  });

  // AI Copilot Interactive Simulated Questions
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Translations Map
  const t = useMemo(() => ({
    ar: {
      title: "منظومة إدارة القروض وسلف الموظفين",
      subtitle: `إدارة التمويل الداخلي، الاستقطاعات الشهرية، وتسويات مكافأة نهاية الخدمة بمقر مكتب المحاماة - v3.0`,
      firm: OFFICE_NAME,
      langLabel: "English",
      dashboard: "لوحة تحكم القروض",
      loans: "القروض والتمويلات العامة",
      advances: "سلف رواتب عاجلة",
      repaymentTracker: "تتبع سداد الأقساط",
      templates: "محرر التعهدات والعقود",
      aiAdvisor: "المستشار المالي الذكي (AI)",
      integrations: "مركز الربط والتكامل",
      addBtn: "إصدار تمويل / سلفة جديدة",
      statsTitle: "المركز المالي للقروض",
      searchPlaceholder: "ابحث باسم الموظف أو الرقم المدني أو المرجع...",
      all: "الكل",
      status: "الحالة",
      type: "نوع السلفة",
      monthlyInstallment: "القسط الشهري",
      remaining: "الرصيد المتبقي",
      paid: "المسدد",
      outstanding: "قائم غير مسدد",
      term: "المدة (أشهر)",
      guarantor: "الطرف الضامن (الكفيل)",
      actions: "إجراءات",
      viewDetails: "عرض الفايل المالي",
      edit: "تعديل الطلب",
      delete: "حذف السجل",
      laborLawHeader: "ضمانات الامتثال المالي (المادة 20 ومادة 51)",
      laborLawNote: "لا يجوز استقطاع أكثر من 10% من أجر العامل الأساسي سداداً لقروض داخلية، وتستقطع الذمم الباقية من مكافأة نهاية الخدمة في حال تركه للعمل.",
      totalOutflow: "أرصدة التمويلات النشطة",
      totalRecovered: "إجمالي الاسترداد المحصل",
      pendingAudit: "طلبات قيد المراجعة المالية",
      activeBorrowers: "معدل الاقتراض الداخلي",
      viewTable: "عرض جدول",
      viewGrid: "عرض بطاقات",
      calculatorTitle: "محاكي التمويل المتطور والتدقيق التلقائي",
      employeeSelector: "اختر الموظف",
      salaryLabel: "راتب الموظف في النظام",
      loanAmountLabel: "المبلغ المطلوب (د.ك)",
      termLabel: "فترة السداد والتقسيط",
      purposeLabel: "سبب السلفة / القرض بالتفصيل",
      startDateLabel: "تاريخ استحقاق أول قسط",
      calcResult: "تحليل الامتثال المالي قبل الحفظ",
      maxDeductionAllowed: "سقف الاستقطاع المسموح (10%)",
      actualDeduction: "القسط الفعلي المقدر",
      percentageOfSalary: "النسبة من الأجر الأساسي",
      lawCompliance: "مؤشر حماية الأجور والرواتب",
      compliantReg: "متوافق مع المادة (20)",
      violatingReg: "قسط يتجاوز 10% - يرجى تمديد السداد",
      saveBtn: "حفظ القرار وإدراجه بالنظام",
      cancelBtn: "إلغاء المعاملة",
      guarantorCivil: "الرقم المدني للكفيل",
      guarantorName: "الاسم الكامل للكفيل",
      timelineTitle: "سجل العمليات التاريخية والاعتمادات والتدقيق المالي",
      alertsTitle: "نظام الإنذارات والأخطار المبكرة العاجل"
    },
    en: {
      title: "Loans & Salary Advances Management",
      subtitle: `Internal corporate finance, monthly deductions, and end-of-service recoveries for Alwagayan Firm - v3.0`,
      firm: "Alwagayan Law Firm",
      langLabel: "العربية",
      dashboard: "Finances Dashboard",
      loans: "Employee Loans Support",
      advances: "Salary Advances Block",
      repaymentTracker: "Installments & Repayments",
      templates: "Contracts & Legal Covenants",
      aiAdvisor: "AI Financial Risk Copilot",
      integrations: "Integration & Sync Hub",
      addBtn: "Issue New Loan / Advance",
      statsTitle: "Financial Statement of Loans",
      searchPlaceholder: "Search by employee, civil ID or loan code...",
      all: "All",
      status: "Status",
      type: "Type",
      monthlyInstallment: "Installment",
      remaining: "Rem. Balance",
      paid: "Paid Amount",
      outstanding: "Outstanding",
      term: "Term (Months)",
      guarantor: "Guarantor Details",
      actions: "Actions",
      viewDetails: "View Financial Profile",
      edit: "Edit Loan Request",
      delete: "Delete Record",
      laborLawHeader: "Kuwait Labor Law Compliance Rules (Art. 20 & 51)",
      laborLawNote: "Salary deductions for internal debts are capped at 10% of basic wages. Outstanding balances are fully collected from EOS benefits in termination.",
      totalOutflow: "Active Debt Portfolio",
      totalRecovered: "Total Recovered Funds",
      pendingAudit: "Pending Financial Audits",
      activeBorrowers: "Active Borrowers Ratio",
      viewTable: "Table Layout",
      viewGrid: "Grid Cards",
      calculatorTitle: "Finance Simulation Dashboard & Audit Engine",
      employeeSelector: "Select Employee",
      salaryLabel: "System Listed Basic Wage",
      loanAmountLabel: "Requested Principal (KWD)",
      termLabel: "Amortization Period (Months)",
      purposeLabel: "Detailed Business/Personal Purpose",
      startDateLabel: "Due Date of First Installment",
      calcResult: "Regulatory Compliant Analysis",
      maxDeductionAllowed: "Statutory Cap Amount (10%)",
      actualDeduction: "Calculated Monthly Installment",
      percentageOfSalary: "Wage Ratio Percentage",
      lawCompliance: "Wage Protection Index Status",
      compliantReg: "Compliant with Article (20)",
      violatingReg: "Violation! Installment exceeds 10% wage cap",
      saveBtn: "Commit Approved Loan to Ledger",
      cancelBtn: "Cancel Entry",
      guarantorCivil: "Civil ID of Guarantor",
      guarantorName: "Full Name of Guarantor",
      timelineTitle: "Administrative & Financial Auditing Activity Logs",
      alertsTitle: "Urgent Financial Warnings & System Alerts"
    }
  }), []);

  const tLocal = lang === 'ar' ? t.ar : t.en;

  // Formatting helper
  const formatKWD = (num: number) => num.toFixed(3) + " د.ك";
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Stats
  const stats = useMemo(() => {
    const totalOutflowCount = loans.filter(l => l.status === LoanStatus.ACTIVE || l.status === LoanStatus.DEFAULTED).reduce((sum, l) => sum + (l.remainingBalance || l.loanAmount), 0);
    const paidSum = loans.reduce((sum, l) => sum + (l.totalPaidAmount || 0), 0);
    const pendingSum = loans.filter(l => l.status === LoanStatus.PENDING_APPROVAL || l.status === LoanStatus.UNDER_FINANCIAL_REVIEW).length;
    const activeRate = ((loans.filter(l => l.status === LoanStatus.ACTIVE).length / (employees.length || 1)) * 100).toFixed(1);

    return {
      totalOutflow: totalOutflowCount,
      totalPaid: paidSum,
      pendingCount: pendingSum,
      activeRate: activeRate
    };
  }, [loans, employees]);

  // Handle Employee selection to auto-fill salary details in the form
  const handleEmployeeFieldChange = (empId: string) => {
    const selectedEmp = employees.find(e => e.id === empId);
    if (selectedEmp) {
      setFormFields(prev => ({
        ...prev,
        employeeId: empId,
        loanAmount: prev.loanAmount || 500,
        notes: `الراتب الأساسي الحالي للموظف المسجل في المنظومة: ${selectedEmp.basicSalary.toFixed(3)} د.ك. تاريخ التعيين: ${selectedEmp.joiningDate}.`
      }));
    }
  };

  const selectedEmployeeForForm = useMemo(() => {
    return employees.find(e => e.id === formFields.employeeId);
  }, [formFields.employeeId, employees]);

  // Recalculated live metrics
  const liveMonthlyInstallment = useMemo(() => {
    if (formFields.loanAmount > 0 && formFields.term > 0) {
      return parseFloat((formFields.loanAmount / formFields.term).toFixed(3));
    }
    return 0;
  }, [formFields.loanAmount, formFields.term]);

  const liveDeductionRatio = useMemo(() => {
    if (!selectedEmployeeForForm || liveMonthlyInstallment <= 0) return 0;
    return (liveMonthlyInstallment / selectedEmployeeForForm.basicSalary) * 100;
  }, [selectedEmployeeForForm, liveMonthlyInstallment]);

  const isViolatingKuwaitiCap = liveDeductionRatio > 10;

  // Search and filter logic
  const filteredLoans = useMemo(() => {
    return loans.filter(l => {
      const matchSearch = l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          l.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchStatus = filterStatus ? l.status === filterStatus : true;
      const matchType = filterType ? l.loanType === filterType : true;

      // Salary Filter
      const emp = employees.find(e => e.id === l.employeeId);
      const matchSalary = salaryRange === 'all' ? true :
                          salaryRange === 'high' ? (emp ? emp.basicSalary >= 1000 : false) :
                          salaryRange === 'low' ? (emp ? emp.basicSalary < 1000 : false) : true;
      
      // Deduction Alert filter
      let matchDeductionWarning = true;
      if (deductionWarningFilter && emp) {
        const ratio = (l.monthlyInstallment / emp.basicSalary) * 100;
        matchDeductionWarning = ratio > 10;
      }

      return matchSearch && matchStatus && matchType && matchSalary && matchDeductionWarning;
    });
  }, [loans, searchTerm, filterStatus, filterType, salaryRange, deductionWarningFilter, employees]);

  // Open Modal for Add/Edit
  const openFormModal = (loanToEdit?: Loan) => {
    if (loanToEdit) {
      setCurrentLoan(loanToEdit);
      const matchedEmp = employees.find(e => e.id === loanToEdit.employeeId);
      setFormFields({
        employeeId: loanToEdit.employeeId,
        loanType: loanToEdit.loanType,
        loanAmount: loanToEdit.loanAmount,
        term: loanToEdit.numberOfInstallments,
        purpose: loanToEdit.purpose || '',
        repaymentStartDate: loanToEdit.repaymentStartDate,
        guarantorName: loanToEdit.guarantorName || '',
        guarantorCivilId: loanToEdit.guarantorCivilId || '',
        status: loanToEdit.status,
        notes: loanToEdit.notes || ''
      });
    } else {
      setCurrentLoan(null);
      const firstEmp = employees[0]?.id || '';
      setFormFields({
        employeeId: firstEmp,
        loanType: LoanType.PERSONAL,
        loanAmount: 1000,
        term: 12,
        purpose: 'تغطية مصاريف استثنائية طارئة',
        repaymentStartDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        guarantorName: 'غانم خلف الشمري',
        guarantorCivilId: '293021890382',
        status: LoanStatus.PENDING_APPROVAL,
        notes: ''
      });
      if (firstEmp) {
        handleEmployeeFieldChange(firstEmp);
      }
    }
    setIsFormOpen(true);
  };

  // Submit Handler for Loans
  const handleSaveLoan = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formFields.employeeId || formFields.loanAmount <= 0 || formFields.term <= 0) {
      addToast({
        type: 'warning',
        title: lang === 'ar' ? 'بيانات غير تامة' : 'Incomplete Fields',
        message: lang === 'ar' ? 'يرجى مراجعة قيم المبلغ وفترات السداد للتأكيد.' : 'Please enter valid loan amount and terms.'
      });
      return;
    }

    const selectedEmpObj = employees.find(e => e.id === formFields.employeeId);
    if (!selectedEmpObj) return;

    // Check duplicate loan prevention
    const hasActiveOverlapping = loans.some(l => 
      l.employeeId === formFields.employeeId && 
      l.status === LoanStatus.ACTIVE && 
      l.id !== currentLoan?.id
    );

    if (hasActiveOverlapping) {
      const runSave = window.confirm(
        lang === 'ar' 
          ? 'الموظف يمتلك سلفة نشطة بالفعل بنظام الرواتب والشرائح المالية. هل تود دمج أو تأكيد إضافة هذا الالتزام الإضافي؟' 
          : 'Warning: This employee already has an active debt. Proceed with creating another financial obligation?'
      );
      if (!runSave) return;
    }

    // Generate Installment steps
    const generatedInstallments: Installment[] = [];
    const startDate = new Date(formFields.repaymentStartDate);
    const instAmount = parseFloat((formFields.loanAmount / formFields.term).toFixed(3));
    
    for (let i = 0; i < formFields.term; i++) {
      const d = new Date(startDate);
      d.setMonth(startDate.getMonth() + i);
      generatedInstallments.push({
        id: `inst-${Date.now()}-${i}`,
        installmentNumber: i + 1,
        dueDate: d.toISOString().split('T')[0],
        amountDue: instAmount,
        status: InstallmentStatus.UPCOMING
      });
    }

    const savedRecord: Loan = {
      id: currentLoan?.id || `AD-LN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      employeeId: formFields.employeeId,
      employeeName: selectedEmpObj.fullNameAr,
      loanType: formFields.loanType,
      loanAmount: formFields.loanAmount,
      purpose: formFields.purpose,
      requestDate: currentLoan?.requestDate || new Date().toISOString().split('T')[0],
      approvalDate: formFields.status === LoanStatus.APPROVED || formFields.status === LoanStatus.ACTIVE ? new Date().toISOString().split('T')[0] : undefined,
      disbursementDate: formFields.status === LoanStatus.ACTIVE ? new Date().toISOString().split('T')[0] : undefined,
      repaymentStartDate: formFields.repaymentStartDate,
      numberOfInstallments: formFields.term,
      monthlyInstallment: instAmount,
      status: formFields.status,
      installments: generatedInstallments,
      totalPaidAmount: currentLoan?.totalPaidAmount || 0,
      remainingBalance: currentLoan?.remainingBalance ?? formFields.loanAmount,
      guarantorName: formFields.guarantorName || undefined,
      guarantorCivilId: formFields.guarantorCivilId || undefined,
      notes: formFields.notes,
      createdAt: currentLoan?.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    let updatedLoans;
    if (currentLoan) {
      updatedLoans = loans.map(l => l.id === currentLoan.id ? savedRecord : l);
      
      const newLog: LoanActivityLog = {
        id: `log-${Date.now()}`,
        loanId: savedRecord.id,
        action: 'تعديل وتحديث الرمز والجدولة',
        actionEn: 'Loan Record Modified & Repackaged',
        user: 'المدير العام والتدقيق المالي',
        date: new Date().toISOString().split('T')[0],
        notes: `تم تعديل قيمة السند ليصبح قيمته ${savedRecord.loanAmount.toFixed(3)} د.ك مستقطع على ${savedRecord.numberOfInstallments} شهر.`,
        notesEn: `Modified principal to ${savedRecord.loanAmount.toLocaleString()} KWD with ${savedRecord.numberOfInstallments}-month term.`
      };
      setLogs([newLog, ...logs]);
    } else {
      updatedLoans = [savedRecord, ...loans];
      
      const newLog: LoanActivityLog = {
        id: `log-${Date.now()}`,
        loanId: savedRecord.id,
        action: 'تأسيس وبث طلب تمويل قانوني',
        actionEn: 'New Loan Application Streamed',
        user: 'منظومة عدالة العمالية تلقائياً',
        date: new Date().toISOString().split('T')[0],
        notes: `تم جدولة التمويل بقسط شهري ${savedRecord.monthlyInstallment.toFixed(3)} د.ك بما يتطابق مع المادة 20.`,
        notesEn: `Amortized with a monthly payment of ${savedRecord.monthlyInstallment.toFixed(3)} KWD conforming to statutory caps.`
      };
      setLogs([newLog, ...logs]);
    }

    setLoans(updatedLoans);
    setIsFormOpen(false);
    setCurrentLoan(null);
    addToast({
      type: 'success',
      title: lang === 'ar' ? 'تم الحفظ بنجاح' : 'Success',
      message: lang === 'ar' ? 'تم حفظ التعديلات وإدراج الضريبة والرواتب بنجاح.' : 'Financial records synced perfectly.'
    });
  };

  // Delete Loan entry
  const handleDeleteLoan = (id: string) => {
    const confirmText = lang === 'ar' ? 'هل أنت متأكد بشكل قاطع من رغبتك في مسح هذا القرض وإلغاء أرشيف الأقساط التاريخي؟' : 'Are you sure you want to permanently delete this loan file?';
    if (window.confirm(confirmText)) {
      setLoans(loans.filter(l => l.id !== id));
      addToast({
        type: 'info',
        title: lang === 'ar' ? 'تمت الإزالة' : 'Deleted',
        message: lang === 'ar' ? 'تم حذف ملف التمويل وإغلاق الأقساط بنظام المحاسبة.' : 'Loan folder and schedules erased.'
      });
    }
  };

  // Record Installment Payment
  const handleConfirmInstallmentPayment = () => {
    if (!viewingLoanId || !selectedInstallmentId) return;

    const parsedAmount = parseFloat(paymentAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      addToast({
        type: 'warning',
        title: lang === 'ar' ? 'مبلغ غير دقيق' : 'Invalid Amount',
        message: lang === 'ar' ? 'يرجى إدخال مبلغ دفع يتجاوز الصفر.' : 'Please input a valid positive amount.'
      });
      return;
    }

    setLoans(prevLoans => prevLoans.map(loan => {
      if (loan.id === viewingLoanId) {
        const updatedInsts = loan.installments.map(inst => {
          if (inst.id === selectedInstallmentId) {
            const currentAmountPaid = inst.amountPaid || 0;
            const newAmountPaid = currentAmountPaid + parsedAmount;
            const isFullyPaid = newAmountPaid >= inst.amountDue;
            return {
              ...inst,
              amountPaid: parseFloat(newAmountPaid.toFixed(3)),
              paymentDate: paymentDate,
              status: isFullyPaid ? InstallmentStatus.PAID : InstallmentStatus.PARTIALLY_PAID
            };
          }
          return inst;
        });

        const totalPaid = updatedInsts.reduce((sum, inst) => sum + (inst.amountPaid || 0), 0);
        const remBalance = Math.max(0, loan.loanAmount - totalPaid);
        const finalStatus = remBalance === 0 ? LoanStatus.PAID_IN_FULL : loan.status;

        // Create log entry
        setTimeout(() => {
          const installmentNum = loan.installments.find(i => i.id === selectedInstallmentId)?.installmentNumber || 0;
          const recoveryLog: LoanActivityLog = {
            id: `log-${Date.now()}`,
            loanId: loan.id,
            action: 'استلام وقيد سداد قسط للذمة',
            actionEn: 'Installment Repayment Captured',
            user: 'شؤون المدخل المالي والمدفوعات',
            date: paymentDate,
            notes: `سحب نقدي/بنكي بقيمة ${parsedAmount.toFixed(3)} د.ك للقسط رقم ${installmentNum}. الرصيد المتبقي الإجمالي: ${remBalance.toFixed(3)} د.ك.`,
            notesEn: `Settled payment of ${parsedAmount.toFixed(3)} KWD towards installment #${installmentNum}. Balance: ${remBalance.toFixed(3)} KWD.`
          };
          setLogs(prevLogs => [recoveryLog, ...prevLogs]);
        }, 100);

        return {
          ...loan,
          installments: updatedInsts,
          totalPaidAmount: parseFloat(totalPaid.toFixed(3)),
          remainingBalance: parseFloat(remBalance.toFixed(3)),
          status: finalStatus
        };
      }
      return loan;
    }));

    setSelectedInstallmentId(null);
    setPaymentAmount('');
    addToast({
      type: 'success',
      title: lang === 'ar' ? 'سجل السداد معتمد' : 'Receipt Logged',
      message: lang === 'ar' ? 'تم احتساب السداد والتسوية المباشرة بنظام الأجور.' : 'Payment registered and balanced successfully.'
    });
  };

  // Selected Loan for View Modal
  const activeViewingLoanObj = useMemo(() => {
    return loans.find(l => l.id === viewingLoanId) || null;
  }, [viewingLoanId, loans]);

  // Document templates replacements map builder
  const templateReplacements = useMemo(() => {
    if (!loanForAgreement) return {};
    const emp = employees.find(e => e.id === loanForAgreement.employeeId);
    
    // Words representation of amount
    const calcWords = (amt: number) => {
      if (amt === 1000) return 'ألف';
      if (amt === 2000) return 'ألفين';
      if (amt === 4000) return 'أربعة آلاف';
      if (amt === 800) return 'ثمانمائة';
      if (amt === 300) return 'ثلاثمائة';
      if (amt === 8500) return 'ثمانية آلاف وخمسمائة';
      return `${amt} دينار كويتي`;
    };

    return {
      REF_NUMBER: loanForAgreement.id,
      DATE: new Date().toISOString().split('T')[0],
      EMPLOYEE_NAME: loanForAgreement.employeeName,
      JOB_TITLE: emp?.jobTitle || 'موظف إداري',
      DEPARTMENT: emp?.department || 'إدارة الشؤون القانونية',
      BASIC_SALARY: emp?.basicSalary ? emp.basicSalary.toFixed(3) : '0.000',
      LOAN_AMOUNT: loanForAgreement.loanAmount.toFixed(3),
      LOAN_AMOUNT_WORDS: calcWords(loanForAgreement.loanAmount),
      TERM: loanForAgreement.numberOfInstallments.toString(),
      MONTHLY_INSTALLMENT: loanForAgreement.monthlyInstallment.toFixed(3),
      START_DATE: loanForAgreement.repaymentStartDate,
      END_DATE: loanForAgreement.installments[loanForAgreement.installments.length - 1]?.dueDate || 'غير محدد',
      NATIONALITY: emp?.civilId ? 'كويتي' : 'مقيم بالكويت',
      CIVIL_ID: emp?.civilId || '294081029302',
      COMPANY_NAME: OFFICE_NAME,
      GUARANTOR_NAME: loanForAgreement.guarantorName || 'لا يوجد كفيل مسجل',
      GUARANTOR_CIVIL_ID: loanForAgreement.guarantorCivilId || '-',
      GUARANTOR_JOB: 'شريك مستشار إداري',
      GUARANTOR_SALARY: '1450.000',
      REMAINING_BALANCE: loanForAgreement.remainingBalance ? loanForAgreement.remainingBalance.toFixed(3) : '0.000',
      OFFICIAL_SEAL: 'مكتب الوقيان والعوضي والشركاء',
      EMPLOYEE_ID: emp?.id || 'emp-xxx',
      BANK_NAME: 'بنك الخليج / بنك الكويت الوطني',
      INSTALLMENTS_TABLE: loanForAgreement.installments.slice(0, 5).map(i => 
        `قسط ${i.installmentNumber}: استحقاق ${i.dueDate} بمبلغ ${i.amountDue.toFixed(3)}د.ك (${i.status})`
      ).join('\n')
    };
  }, [loanForAgreement, employees]);

  // Selected legal template body filled
  const preparedTemplateContent = useMemo(() => {
    const activeTemp = LEGAL_TEMPLATES.find(t => t.id === selectedTemplateId);
    if (!activeTemp || !loanForAgreement) return '';
    return fillTemplate(activeTemp, lang, templateReplacements);
  }, [selectedTemplateId, loanForAgreement, lang, templateReplacements]);

  // Interactive AI Copilot Query submission Handler
  const handleAskFinancialAI = () => {
    if (!aiQuestion.trim()) return;
    setAiLoading(true);
    setAiResponse(null);

    setTimeout(() => {
      setAiLoading(false);
      const query = aiQuestion.toLowerCase();
      
      if (query.includes('سداد') || query.includes('قسط') || query.includes('inst')) {
        setAiResponse(
          lang === 'ar' 
            ? 'بناءً على الذكاء الاصطناعي بلائحة الجزاءات والتعليمات العمالية، يتضح أن الموظف "أحمد مبارك" هو الأقل عرضة للمخاطر الائتمانية حيث يمتلك سجل التزام بنسبة 100% ويستقطع قسطه الجاري بسلاسة دون تعثر. بينما الموظف "علي جاسم" يمثل مخاطرة مرتفعة بنسبة 78% لوجود تعثر نشط لقسط مايو بقيمته 250 د.ك.' 
            : 'AI Advisory: Debtor Ahmed Mubarak holds a 100% repayment satisfaction index. Debtor Ali Jassim flags a 78% risk level due to an active delinquency in his housing loan installment of 250 KWD.'
        );
      } else if (query.includes('مادة') || query.includes('قانون') || query.includes('law')) {
        setAiResponse(
          lang === 'ar'
            ? 'الرأي القانوني الرقمي: تحذر المادة 20 من استقطاع يزيد عن 10% من الراتب الأساسي، وعند إضافة أي قرض تكميلي أو التزام جديد يوصى بتعديل مدة السداد لتمتد على 24 شهراً بدلاً من 12 شهر بهدف موازنة الأجور والرواتب وحماية الدخل المتاح.'
            : 'Legal Insight: Article 20 of Kuwait Labor Law restricts basic wage deductions above 10%. Adding any new loans will require lengthening amortization schedules to 24 months to maintain appropriate statutory balance.'
        );
      } else if (query.includes('مكافأة') || query.includes('نهاية') || query.includes('eos')) {
        setAiResponse(
          lang === 'ar'
            ? 'مستشار نهاية الخدمة: تم فحص مكافأة نهاية الخدمة التقديرية (EOS) لكافة المقترضين، وجميعهم يمتلكون أرصدة مكافأة مستحقة تغطي بالكامل القيمة المتبقية لقروضهم (صمام أمان بموجب المادة 51 القانونية).'
            : 'EOS Audit: Estimation checks reveal that the calculated End-of-Service gratuity accruals for all active borrowers fully cover their aggregate loan liabilities, ensuring secure corporate asset preservation under Art. 51.'
        );
      } else {
        setAiResponse(
          lang === 'ar'
            ? 'توصية الذكاء الاصطناعي: يرجى التدقيق المالي بشكل عاجل وتحفيز مراجعة سجلات الحضور والانضباط حيث أن الموظفين مفرطي الاقتراض والذين لديهم إنذارات انضباطية تزيد احتمالية تعثرهم المالي بـ 2.4 ضعفاً.'
            : 'AI Recommendation: Cross-referencing active disciplinary profiles is highly recommended. Highly leveraged employees with active policy warnings present a 2.4x higher probability of repayment delay.'
        );
      }
    }, 1200);
  };

  // Preset Template selection
  const handleOpenPrintPreview = (loan: Loan) => {
    setLoanForAgreement(loan);
    setIsPrintModalOpen(true);
  };

  // Recharts Data Parsing
  const graphDataByCategory = useMemo(() => {
    const typesMap: { [key: string]: number } = {};
    loans.forEach(l => {
      const typeLabel = l.loanType;
      typesMap[typeLabel] = (typesMap[typeLabel] || 0) + l.loanAmount;
    });
    return Object.keys(typesMap).map(key => ({
      name: key,
      value: typesMap[key]
    }));
  }, [loans]);

  const graphDataRepaymentForecast = useMemo(() => {
    return [
      { name: 'Jan', amount: 800 },
      { name: 'Feb', amount: 950 },
      { name: 'Mar', amount: 1100 },
      { name: 'Apr', amount: 1250 },
      { name: 'May', amount: 1400 },
      { name: 'Jun', amount: 1550 },
    ];
  }, []);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6 pb-20 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Banner and Navigation Switcher */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-xs bg-indigo-50 text-indigo-700 font-extrabold px-3 py-1 rounded-full border border-indigo-100">
                {tLocal.firm}
              </span>
              <span className="text-xs text-slate-300">|</span>
              <button 
                onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold underline"
              >
                {tLocal.langLabel}
              </button>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              {tLocal.title}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              {tLocal.subtitle}
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="border-slate-300 shadow-xs" 
              leftIcon={<ClockIcon className="w-4 h-4" />}
              onClick={() => openFormModal()}
            >
              {lang === 'ar' ? 'إنشاء مسودة/سند' : 'Create Draft Record'}
            </Button>
            <Button 
              variant="primary" 
              className="px-6 shadow-md shadow-indigo-600/10" 
              leftIcon={<PlusCircleIcon className="w-5 h-5" />}
              onClick={() => openFormModal()}
            >
              {tLocal.addBtn}
            </Button>
          </div>
        </div>

        {/* Tab Switching Rail */}
        <div className="flex flex-wrap border-b border-slate-200 mt-6 pt-2 bg-slate-50 p-2 rounded-xl gap-2">
          {[
            { id: 'dashboard', label: tLocal.dashboard, icon: <ChartBarIcon className="w-4 h-4" /> },
            { id: 'loans', label: tLocal.loans, icon: <CurrencyDollarIcon className="w-4 h-4" /> },
            { id: 'payments', label: tLocal.repaymentTracker, icon: <UsersIcon className="w-4 h-4" /> },
            { id: 'templates', label: tLocal.templates, icon: <FolderIcon className="w-4 h-4" /> },
            { id: 'aiCopilot', label: tLocal.aiAdvisor, icon: <CalculatorIcon className="w-4 h-4" /> },
            { id: 'integrations', label: tLocal.integrations, icon: <ScaleIcon className="w-4 h-4" /> },
          ].map(tab => (
            <button
              id={`tab-btn-${tab.id}`}
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'templates' && loans.length > 0) {
                  setLoanForAgreement(loans[0]);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-lg transition-all ${
                activeTab === tab.id 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Stats Cards Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 mb-1">{tLocal.totalOutflow}</p>
          <p className="text-2xl font-black text-slate-800">{formatKWD(stats.totalOutflow)}</p>
          <div className="mt-2 text-[10px] text-emerald-600 font-bold">
            ✔ {lang === 'ar' ? 'مغطاة بالكفالة القانونية' : 'Secured under corporate bindings'}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 mb-1">{tLocal.totalRecovered}</p>
          <p className="text-2xl font-black text-emerald-600">{formatKWD(stats.totalPaid)}</p>
          <div className="mt-2 text-[10px] text-slate-500 font-bold">
            {lang === 'ar' ? 'نسبة التحصيل: 96.8%' : 'Recovery Rate: 96.8%'}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 mb-1">{tLocal.pendingAudit}</p>
          <p className="text-2xl font-black text-amber-500">{stats.pendingCount}</p>
          <div className="mt-2 text-[10px] text-slate-500 font-bold">
            {lang === 'ar' ? 'تستلزم موافقة الموارد البشرية' : 'Requires administrative approval'}
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-400 mb-1">{tLocal.activeBorrowers}</p>
          <p className="text-2xl font-black text-indigo-600">{stats.activeRate}%</p>
          <div className="mt-2 text-[10px] text-slate-500 font-bold">
            {lang === 'ar' ? 'من إجمالي مقدرات القوة العاملة' : 'Of total company manpower'}
          </div>
        </div>
      </div>

      {/* WARNING BANNER ABOUT KUWAIT LABOR LAW */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-xs relative overflow-hidden">
        <ScaleIcon className="absolute -left-10 -bottom-10 w-48 h-48 text-indigo-500/10 pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <p className="text-xs font-bold text-indigo-400 tracking-wider flex items-center gap-2">
            <ScaleIcon className="w-4 h-4" />
            {tLocal.firm} - {tLocal.laborLawHeader}
          </p>
          <p className="text-sm font-black max-w-2xl leading-relaxed">
            {tLocal.laborLawNote}
          </p>
        </div>
      </div>

      {/* TAB CONTENT: 1. DASHBOARD & ANALYTICS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-white" title={lang === 'ar' ? 'توزيع أرصدة القروض القائمة' : 'Portfolio Distribution by Loan Type'}>
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={graphDataByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip formatter={(value: any) => [`${parseFloat(value).toFixed(3)} د.ك`]} />
                    <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                      {graphDataByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="bg-white" title={lang === 'ar' ? 'تحليل حجم السلف المحصلة' : 'Volume Share analysis'}>
              <div className="h-64 w-full flex flex-col justify-between items-center relative">
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: lang === 'ar' ? 'مبالغ مسددة' : 'Reclaimed (Paid)', value: stats.totalPaid },
                        { name: lang === 'ar' ? 'رصيد دائن قائم' : 'Outstanding principal', value: stats.totalOutflow }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#4f46e5" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-emerald-500 rounded-full"></span>{lang === 'ar' ? 'مسدد' : 'Paid'}</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-600 rounded-full"></span>{lang === 'ar' ? 'متبقي' : 'Unpaid'}</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Alerts & Urgent Notifications Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-white" title={lang === 'ar' ? 'بيان المخالفات والإنذارات العاجلة' : 'Strict Overdue Warnings & Legal Actions'}>
              <div className="space-y-3">
                {loans.filter(l => l.status === LoanStatus.DEFAULTED).map(l => {
                  const empObj = employees.find(e => e.id === l.employeeId);
                  return (
                    <div key={l.id} className="p-4 bg-rose-50 border-r-4 border-rose-500 rounded-xl space-y-2">
                      <div className="flex justify-between items-center font-black text-rose-950 text-xs">
                        <span>⚠️ {lang === 'ar' ? 'تعثر رسمي قائم عن السداد' : 'Outstanding Delinquency'}</span>
                        <span>{l.id}</span>
                      </div>
                      <p className="text-xs text-rose-700 leading-relaxed font-bold">
                        {lang === 'ar' 
                          ? `تخلف الموظف [${l.employeeName}] براتب ${empObj?.basicSalary.toFixed(3)} د.ك عن سداد أقساط القرض الممتص البالغ قيمته الإجمالية ${l.loanAmount.toFixed(3)} د.ك.`
                          : `Employee [${l.employeeName}] basic wage ${empObj?.basicSalary.toFixed(3)} KWD failed first repayment schedules.`}
                      </p>
                      <div className="flex justify-end gap-2 pt-2">
                        <Button size="sm" variant="danger" onClick={() => handleOpenPrintPreview(l)}>
                          {lang === 'ar' ? 'إخراج نموذج إنذار الكفيل' : 'Print Guarantor Overdue Warning'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {loans.filter(l => l.status === LoanStatus.DEFAULTED).length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-6 italic">
                    {lang === 'ar' ? 'لا يوجد أي تعثر مالي نشط حالياً بالنظام.' : 'No active defaults on repayments.'}
                  </p>
                )}
              </div>
            </Card>

            <Card className="bg-white" title={tLocal.timelineTitle}>
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {logs.map(log => (
                  <div key={log.id} className="relative border-r-2 border-slate-200 pr-4 pb-2 text-right">
                    <span className="absolute top-1 -right-1.5 w-3 h-3 bg-indigo-600 rounded-full ring-4 ring-white"></span>
                    <p className="text-xs font-black text-slate-800 flex justify-between">
                      <span>{lang === 'ar' ? log.action : log.actionEn}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{log.date}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">
                      {lang === 'ar' ? log.notes : log.notesEn}
                    </p>
                    <p className="text-[9px] text-slate-400 italic mt-0.5">
                      {lang === 'ar' ? `المشغل: ${log.user}` : `Operator: ${log.user}`}
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 2. APPLICANT GENERAL LOANS */}
      {activeTab === 'loans' && (
        <Card className="bg-white overflow-hidden shadow-xs border border-slate-200">
          {/* Advanced Search Filter Panel */}
          <div className="p-6 bg-slate-50 border-b border-slate-200 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-grow">
                <MagnifyingGlassIcon className="absolute right-3 top-3 w-5 h-5 text-slate-400" />
                <input 
                  className="w-full pr-10 pl-4 py-2 text-sm border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder={tLocal.searchPlaceholder}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full lg:w-48">
                <Select
                  value={filterStatus}
                  options={[
                    { value: '', label: lang === 'ar' ? 'كافة حالات السداد' : 'All Repayment Statuses' },
                    { value: LoanStatus.ACTIVE, label: LoanStatus.ACTIVE },
                    { value: LoanStatus.PAID_IN_FULL, label: LoanStatus.PAID_IN_FULL },
                    { value: LoanStatus.PENDING_APPROVAL, label: LoanStatus.PENDING_APPROVAL },
                    { value: LoanStatus.UNDER_FINANCIAL_REVIEW, label: LoanStatus.UNDER_FINANCIAL_REVIEW },
                    { value: LoanStatus.DEFAULTED, label: LoanStatus.DEFAULTED },
                  ]}
                  onChange={e => setFilterStatus(e.target.value)}
                />
              </div>
              <div className="w-full lg:w-48">
                <Select
                  value={filterType}
                  options={[
                    { value: '', label: lang === 'ar' ? 'كافة أنواع التمويل' : 'All Types' },
                    { value: LoanType.PERSONAL, label: LoanType.PERSONAL },
                    { value: LoanType.SALARY_ADVANCE, label: LoanType.SALARY_ADVANCE },
                    { value: LoanType.HOUSING, label: LoanType.HOUSING },
                    { value: LoanType.EMERGENCY, label: LoanType.EMERGENCY },
                  ]}
                  onChange={e => setFilterType(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <span className="text-xs font-bold text-slate-500">{lang === 'ar' ? 'مؤشرات إضافية:' : 'Additional Indexes:'}</span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-black text-rose-700 bg-rose-50 border border-rose-100 px-3 py-1.5 rounded-lg">
                <input 
                  type="checkbox" 
                  checked={deductionWarningFilter} 
                  onChange={e => setDeductionWarningFilter(e.target.checked)}
                />
                <span>{lang === 'ar' ? 'قروض خارجة عن حاجز الـ 10% (تحذيرات)' : 'Over 10% basic wage alerts'}</span>
              </label>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <span>{lang === 'ar' ? 'فئات الراتب:' : 'Salary Bracket:'}</span>
                <button 
                  onClick={() => setSalaryRange('all')}
                  className={`px-3 py-1 rounded-md transition-all ${salaryRange === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}
                >
                  {tLocal.all}
                </button>
                <button 
                  onClick={() => setSalaryRange('high')}
                  className={`px-3 py-1 rounded-md transition-all ${salaryRange === 'high' ? 'bg-indigo-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}
                >
                  {lang === 'ar' ? 'فوق 1,000 د.ك' : '>= 1,000 KWD'}
                </button>
                <button 
                  onClick={() => setSalaryRange('low')}
                  className={`px-3 py-1 rounded-md transition-all ${salaryRange === 'low' ? 'bg-indigo-600 text-white' : 'bg-slate-200 hover:bg-slate-300'}`}
                >
                  {lang === 'ar' ? 'تحت 1,000 د.ك' : '< 1,000 KWD'}
                </button>
              </div>

              <div className="flex-grow flex justify-end gap-2">
                <button 
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${viewMode === 'table' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white text-slate-600'}`}
                >
                  {tLocal.viewTable}
                </button>
                <button 
                  onClick={() => setViewMode('card')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${viewMode === 'card' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white text-slate-600'}`}
                >
                  {tLocal.viewGrid}
                </button>
              </div>
            </div>
          </div>

          {/* RENDERING TABLE MODE */}
          {viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-right">
                <thead className="bg-slate-50 text-xs font-black text-slate-500 uppercase">
                  <tr>
                    <th className="px-6 py-4">{lang === 'ar' ? 'الرمز المرجعي' : 'Ref. Code'}</th>
                    <th className="px-6 py-4">{lang === 'ar' ? 'اسم المقترض' : 'Borrower'}</th>
                    <th className="px-6 py-4">{lang === 'ar' ? 'نوع السند' : 'Credit Type'}</th>
                    <th className="px-6 py-4">{lang === 'ar' ? 'القيمة والمبلغ' : 'Principal'}</th>
                    <th className="px-6 py-4">{tLocal.monthlyInstallment}</th>
                    <th className="px-6 py-4">{tLocal.status}</th>
                    <th className="px-6 py-4">{tLocal.remaining}</th>
                    <th className="px-6 py-4 text-center">{tLocal.actions}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100 text-sm">
                  {filteredLoans.map(loan => {
                    const emp = employees.find(e => e.id === loan.employeeId);
                    const isOverLimit = emp ? ((loan.monthlyInstallment / emp.basicSalary) * 100) > 10 : false;
                    
                    return (
                      <tr key={loan.id} className="hover:bg-indigo-50/10 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-500">{loan.id}</td>
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-slate-900">{loan.employeeName}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                            {emp?.jobTitle} {lang === 'ar' ? `(راتب: ${emp?.basicSalary.toFixed(3)} د.ك)` : `(Salary: ${emp?.basicSalary.toFixed(3)} KWD)`}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs bg-slate-100 text-slate-800 font-extrabold px-2.5 py-1 rounded-md">
                            {loan.loanType}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-black text-slate-900">{formatKWD(loan.loanAmount)}</td>
                        <td className="px-6 py-4">
                          <p className={`font-black ${isOverLimit ? 'text-rose-600' : 'text-slate-700'}`}>
                            {formatKWD(loan.monthlyInstallment)}
                          </p>
                          <p className={`text-[9px] font-bold mt-0.5 ${isOverLimit ? 'text-rose-500' : 'text-slate-400'}`}>
                            {emp ? `${((loan.monthlyInstallment / emp.basicSalary) * 100).toFixed(1)}%` : '-'}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <LoanStatusBadge status={loan.status} />
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-600">
                          {formatKWD(loan.remainingBalance ?? loan.loanAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center space-x-1 space-x-reverse">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setViewingLoanId(loan.id)}
                            title={tLocal.viewDetails}
                          >
                            <EyeIcon className="w-4 h-4 text-indigo-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openFormModal(loan)}
                            title={tLocal.edit}
                          >
                            <PencilIcon className="w-4 h-4 text-amber-500" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700" 
                            onClick={() => handleDeleteLoan(loan.id)}
                            title={tLocal.delete}
                          >
                            <TrashIcon className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-[10px] py-1 border-slate-300"
                            onClick={() => handleOpenPrintPreview(loan)}
                          >
                            <PrinterIcon className="w-3" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredLoans.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400 font-bold">
                        <FolderIcon className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        {lang === 'ar' ? 'لا توجد توافقات لنتائج التصفية الحالية.' : 'No loan files match current filters.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* CARD GRID LAYOUT */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {filteredLoans.map(loan => {
                const emp = employees.find(e => e.id === loan.employeeId);
                const progress = Math.min(100, Math.max(0, (((loan.totalPaidAmount || 0) / loan.loanAmount) * 100)));
                return (
                  <div 
                    key={loan.id} 
                    className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] text-slate-400 font-mono font-bold">#{loan.id}</span>
                      <LoanStatusBadge status={loan.status} />
                    </div>
                    <h4 className="text-md font-extrabold text-slate-900 mb-1">{loan.employeeName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold mb-4">{emp?.jobTitle} | {emp?.department}</p>
                    
                    <div className="space-y-2 border-t border-slate-100 pt-3 text-xs font-bold text-slate-600">
                      <div className="flex justify-between"><span>{lang === 'ar' ? 'نوع التمويل' : 'Type'}</span><span>{loan.loanType}</span></div>
                      <div className="flex justify-between"><span>{lang === 'ar' ? 'مبلغ القرض' : 'Loan Amount'}</span><span className="text-indigo-600 font-black">{formatKWD(loan.loanAmount)}</span></div>
                      <div className="flex justify-between"><span>{tLocal.monthlyInstallment}</span><span>{formatKWD(loan.monthlyInstallment)}</span></div>
                    </div>

                    <div className="mt-4 space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>{lang === 'ar' ? 'المسترد:' : 'Recovered:'} {parseFloat(progress.toFixed(1))}%</span>
                        <span>{formatKWD(loan.remainingBalance ?? loan.loanAmount)} {lang === 'ar' ? 'متبقي' : 'rem'}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }}></div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                      <Button size="sm" variant="ghost" onClick={() => setViewingLoanId(loan.id)}>
                        {lang === 'ar' ? 'عرض الفايل' : 'View File'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleOpenPrintPreview(loan)}>
                        {lang === 'ar' ? 'طباعة العقود' : 'Legal Print'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {/* TAB CONTENT: 3. MONTHLY REPAYMENTS TRACKER */}
      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white" title={lang === 'ar' ? 'المكلفون والمقترضون النشطون في السيستم' : 'Active Corporate Borrowers'}>
            <div className="space-y-4">
              {loans.filter(l => l.status === LoanStatus.ACTIVE || l.status === LoanStatus.DEFAULTED || l.status === LoanStatus.PAID_IN_FULL).map(l => {
                const emp = employees.find(e => e.id === l.employeeId);
                const nextPay = l.installments.find(i => i.status === InstallmentStatus.PENDING || i.status === InstallmentStatus.UPCOMING || i.status === InstallmentStatus.OVERDUE);
                return (
                  <div key={l.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex justify-between items-center">
                    <div>
                      <p className="text-sm font-extrabold text-slate-900">{l.employeeName}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 font-bold">
                        {l.loanType} | {lang === 'ar' ? 'إجمالي الدين:' : 'Total Debt:'} {formatKWD(l.loanAmount)}
                      </p>
                      {nextPay && (
                        <p className="text-[10px] text-slate-500 font-black mt-2">
                          📋 {lang === 'ar' ? 'القسط القادم:' : 'Next installment:'} {formatKWD(nextPay.amountDue)} ({formatDate(nextPay.dueDate)})
                        </p>
                      )}
                    </div>
                    <div className="text-left space-y-1">
                      <LoanStatusBadge status={l.status} />
                      <p className="text-xs font-black text-rose-600 mt-1">
                        {lang === 'ar' ? 'المتبقي:' : 'Rem:'} {formatKWD(l.remainingBalance ?? l.loanAmount)}
                      </p>
                      <Button 
                        size="sm" 
                        variant="primary" 
                        onClick={() => setViewingLoanId(l.id)}
                      >
                        {lang === 'ar' ? 'سجل السداد والجدول' : 'Repayment Board'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="space-y-6">
            <Card className="bg-white" title={lang === 'ar' ? 'سحب فوري وإيداع للأقساط' : 'Fast Repayment Logging'}>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                {lang === 'ar' 
                  ? 'اختر أي ملف موظف من لوحة الاقتطاع النشطة وافتح "سجل السداد" لتوجيه المحاسبة لإجراء التسوية المباشرة وخفض الرصيد المالي.'
                  : 'Select an active profile on the left to quickly allocate dynamic payments to unpaid installments.'}
              </p>
            </Card>

            <Card className="bg-slate-900 text-white border-0" title={lang === 'ar' ? 'تذكير مالي وقانوني هام' : 'Statutory Deductions Cap'}>
              <div className="space-y-2 text-xs font-bold leading-relaxed text-slate-300">
                <p>
                  {lang === 'ar' ? '• بموجب قانون العمل الكويتي المادة 20 لا يسمح إطلاقاً بتحصيل فروع فوائد مادية على قروض الموظفين لكونها قروضاً حسنة.' : '• Covenants with corporate employees must carry 0.00% monthly/annual interest rate.'}
                </p>
                <p>
                  {lang === 'ar' ? '• سيتم حظر أي معاملات تتخطى السلم الإداري أو الاستقطاع بغير موافقة خطية ومعتمدة الكترونياً.' : '• Every deduction mandates a written/certified wet or digital signature matching the formal covenants.'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 4. DOCUMENTS & TEMPLATES GENERATOR */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <Card className="bg-white" title={lang === 'ar' ? 'إعداد وصياغة المستندات' : 'Filing Templates Hub'}>
              <div className="space-y-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    className="w-full pr-9 pl-3 py-1.5 text-xs border rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                    placeholder={lang === 'ar' ? 'ابحث عن نموذج...' : 'Filter templates...'}
                    value={templateSearch}
                    onChange={e => setTemplateSearch(e.target.value)}
                  />
                </div>

                <div className="space-y-1 max-h-[40vh] overflow-y-auto">
                  {LEGAL_TEMPLATES.filter(t => 
                    t.titleAr.includes(templateSearch) || t.titleEn.toLowerCase().includes(templateSearch.toLowerCase())
                  ).map(temp => (
                    <button
                      id={`template-btn-${temp.id}`}
                      key={temp.id}
                      onClick={() => setSelectedTemplateId(temp.id)}
                      className={`w-full text-right p-2.5 rounded-lg text-xs font-bold transition-all block ${
                        selectedTemplateId === temp.id 
                          ? 'bg-indigo-50 text-indigo-800 border-r-4 border-indigo-600' 
                          : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <p>{lang === 'ar' ? temp.titleAr : temp.titleEn}</p>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {lang === 'ar' ? temp.categoryAr : temp.categoryEn}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <Select
                    label={lang === 'ar' ? 'ربط المعاينة بملف الموظف المقترض' : 'Bind Print Preview to Employee'}
                    value={loanForAgreement?.id || ''}
                    options={loans.map(l => ({ value: l.id, label: `${l.employeeName} (${l.id})` }))}
                    onChange={e => {
                      const selectedLoan = loans.find(l => l.id === e.target.value);
                      if (selectedLoan) setLoanForAgreement(selectedLoan);
                    }}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {loanForAgreement ? (
              <Card className="bg-white" title={lang === 'ar' ? 'محرر ومطبعة السندات الرسمية الكترونياً' : 'Official Interactive Covenant Print-Hub'}>
                {/* Print Ready Sheet */}
                <div className="p-8 bg-white border border-slate-300 rounded-xl shadow-xs text-slate-800 leading-relaxed relative font-sans">
                  {/* Firm Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-slate-900">{tLocal.firm}</h3>
                      <p className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'منظومة إدارة الشؤون المالية والعمالية' : 'Manpower and Internal Credits Division'}</p>
                    </div>
                    <div className="text-left text-xs font-mono font-bold text-slate-400">
                      <p>REF: {loanForAgreement.id}</p>
                      <p>Date: {new Date().toISOString().split('T')[0]}</p>
                    </div>
                  </div>

                  {/* Document QR Code placeholder */}
                  <div className="absolute top-24 left-8 w-12 h-12 border border-slate-200 bg-slate-50 flex items-center justify-center text-[8px] font-mono text-slate-400 no-print">
                    [QR_CODE]
                  </div>

                  {/* Preloaded editable content */}
                  <div className="space-y-4 text-xs select-text whitespace-pre-wrap leading-relaxed text-slate-800 border border-dashed border-slate-200 p-4 rounded-lg bg-slate-50/50">
                    {preparedTemplateContent}
                  </div>

                  {/* Seals & Signatures block */}
                  <div className="grid grid-cols-2 gap-12 pt-10 mt-10 border-t border-slate-100 text-center font-bold text-xs text-slate-800">
                    <div className="space-y-4">
                      <p>{lang === 'ar' ? 'اعتماد محاسبة الأجور' : 'Payroll Certified By'}</p>
                      <div className="h-10 border-b border-dashed border-slate-300"></div>
                      <p className="text-[9px] text-emerald-600">✔ تم التدقيق والمطابقة - المادة ٢٠</p>
                    </div>
                    <div className="space-y-4">
                      <p>{lang === 'ar' ? 'توقيع وبصمة الموظف (المقر)' : 'Employee Seal / Hand signature'}</p>
                      <div className="h-10 border-b border-dashed border-slate-300"></div>
                      <p className="text-[9px] text-slate-400 font-mono">ID: {loanForAgreement.employeeId}</p>
                    </div>
                  </div>

                  {/* Document Official Stamp */}
                  <div className="mt-8 flex justify-center">
                    <div className="border-4 border-dashed border-indigo-600/30 text-indigo-600/50 text-[10px] uppercase font-black tracking-widest px-4 py-2 rotate-3 rounded-lg select-none">
                      {lang === 'ar' ? 'الإدارة القانونية والمالية معتمد' : 'LEGAL & FINANCE DEPT APPROVED'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    className="border-slate-300"
                    leftIcon={<PrinterIcon className="w-4 h-4" />}
                    onClick={() => handleOpenPrintPreview(loanForAgreement)}
                  >
                    {lang === 'ar' ? 'معاينة بالحجم الكامل وطباعة' : 'Full Screen Print Preview'}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="bg-white">
                <p className="text-center py-12 text-slate-400 italic">
                  {lang === 'ar' ? 'يرجى ربط المعاينة بملف موظف مقترض أولاً لتوليد المستندات والمخالصات.' : 'Select or bind an active loan folder above to populate templates.'}
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 5. AI FINANCIAL ADVISOR & RISK COPILOT */}
      {activeTab === 'aiCopilot' && (
        <div className="space-y-6">
          <Card className="bg-white" title={lang === 'ar' ? 'مستشار الذكاء الاصطناعي بلائحة الجزاءات والتدقيق المالي (AI Copilot)' : 'AI Corporate Audit and Risk Analysis Advisor'}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed font-bold">
                  {lang === 'ar'
                    ? 'مركز التحكم المالي بالذكاء الاصطناعي يقوم بتحليل ملاءة المقترضين التاريخية، ومقارنتها بسجلات الغياب والحضور والانضباط، وتوليد توقعات التدفق والمطابقة مع سقف المادة 20.'
                    : 'Interactive AI control center evaluating debt coverage balances, comparing historical payroll indexes, and preventing regulatory fines in Kuwait.'}
                </p>

                <div className="space-y-2 pt-2">
                  <label className="text-xs font-black text-slate-700 block">
                    {lang === 'ar' ? 'اسأل المستشار المالي الرقمي عن القروض والالتزامات:' : 'Ask AI Auditor about employee loan risks:'}
                  </label>
                  <div className="flex gap-2">
                    <input 
                      className="flex-grow p-3 text-xs border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                      value={aiQuestion}
                      onChange={e => setAiQuestion(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: قارن لي احتمالية تعثر علي جاسم مع أحمد محمود...' : 'e.g. Compare risk of default between borrowers...'}
                      onKeyDown={e => { if (e.key === 'Enter') handleAskFinancialAI(); }}
                    />
                    <Button 
                      variant="primary" 
                      onClick={handleAskFinancialAI}
                      disabled={aiLoading}
                    >
                      {aiLoading ? (lang === 'ar' ? 'جاري التحليل...' : 'Analyzing...') : (lang === 'ar' ? 'استشارة' : 'Ask AI')}
                    </Button>
                  </div>
                </div>

                {/* Response Area */}
                {aiResponse && (
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2 animate-fade-in-right">
                    <p className="text-xs font-black text-indigo-900 flex items-center gap-2">
                      <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                      {lang === 'ar' ? 'رأي المستشار المالي اللائحي' : 'Digital Audit Response'}
                    </p>
                    <p className="text-xs text-indigo-950 font-bold leading-relaxed whitespace-pre-wrap">
                      {aiResponse}
                    </p>
                  </div>
                )}
              </div>

              {/* AI Risk Scores Sidebar widgets */}
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <p className="text-xs font-black text-slate-800">{lang === 'ar' ? 'توصيات الجدولة الاستباقية' : 'Optimal Amortization Guides'}</p>
                  
                  <div className="space-y-4 text-[10px] font-bold text-slate-600 Leading-relaxed">
                    <div className="space-y-1">
                      <p className="flex justify-between"><span>أحمد مبارك</span><span className="text-emerald-600">آمن (9.1% دائن)</span></p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="flex justify-between"><span>علي محمد جاسم</span><span className="text-rose-600">مخاطرة تعثر</span></p>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900 text-white rounded-xl text-[10px] leading-relaxed">
                  <p className="font-bold text-amber-400 mb-1">💡 {lang === 'ar' ? 'تدقيق دائم:' : 'Permanent Guideline:'}</p>
                  <p>
                    {lang === 'ar' 
                      ? 'القسط المقسط هو الخيار الأمثل للموظف ماليًا وصحيًا. ينصح دائمًا برفض طلبات السداد الفوري لغير السلف الطارئة تجنبًا لنفاذ السيولة المتاحة لتفادي عجز الأسر.'
                      : 'Always refuse prompt full salary cashouts for non-emergency demands. Gradual amortization safeguards consumer liquidity index.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT: 6. INTEGRATIONS & SYSTEM HUB */}
      {activeTab === 'integrations' && (
        <Card className="bg-white" title={lang === 'ar' ? 'مركز الربط البيني والتحديث المتكامل' : 'Adala ERP System Integration Architecture'}>
          <div className="space-y-6">
            <p className="text-xs text-slate-500 leading-relaxed font-bold">
              {lang === 'ar' 
                ? 'تقوم منظومة السلف والقروض بالمطابقة اللحظية والمزامنة الشاملة لمعطيات الذمم والديون مع كافة الأقسام العمالية والقانونية داخل نظام عدالة.'
                : 'The credit module maintains a strict direct synchronization schema with all relevant legal databases and accounts.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-right">
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-black">HR & Employee Files</span>
                <p className="text-xs font-extrabold text-slate-800 pt-1">{lang === 'ar' ? 'شؤون الموظفين والملفات' : 'Employee Records Integration'}</p>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  {lang === 'ar' ? 'التحقق اللحظي من الراتب الأساسي المسجل لتثبيت سقف ومقترحات القروض.' : 'Pulls the most updated basic salary indices directly.'}
                </p>
                <p className="text-[9px] text-emerald-600 font-bold">✔ {lang === 'ar' ? 'المزامنة متصلة ونشطة' : 'Direct sync active'}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-right">
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md font-black">Payroll Engine</span>
                <p className="text-xs font-extrabold text-slate-800 pt-1">{lang === 'ar' ? 'تكامل الأجور والمسيرات' : 'Payroll and WPS Portal'}</p>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  {lang === 'ar' ? 'خصم مبرمج وتغذية آلية لمسيرات الرواتب لشهر مايو لجميع المقترضين بنسبة ١٠٪.' : 'Feeds deduction parameters into active payment slips.'}
                </p>
                <p className="text-[9px] text-emerald-600 font-bold">✔ {lang === 'ar' ? 'المزامنة متصلة ونشطة' : 'Direct sync active'}</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-right">
                <span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-md font-black">EOS Benefits Engine</span>
                <p className="text-xs font-extrabold text-slate-800 pt-1">{lang === 'ar' ? 'صرف وتدقيق نهاية الخدمة' : 'EOS and Final Gratuities'}</p>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                  {lang === 'ar' ? 'حجز وتجميد جزئي تعويضي لقيمة الرصيد المتبقي للقروض من مستند نهاية الخدمة بموجب المادة ٥١.' : 'Flags unpaid corporate loans in final exits block.'}
                </p>
                <p className="text-[9px] text-emerald-600 font-bold">✔ {lang === 'ar' ? 'المزامنة متصلة ونشطة' : 'Direct sync active'}</p>
              </div>
            </div>

            {/* Simulated interactive Flow chart block represent architectural integrity */}
            <div className="p-6 bg-slate-900 text-white rounded-2xl relative overflow-hidden">
              <h4 className="text-sm font-black mb-3 text-indigo-400 flex items-center gap-2">
                <span>{lang === 'ar' ? 'بروتوكول تحصيل وتوجيه السداد الآلي' : 'Automated Accounting Outflow Protocol'}</span>
              </h4>
              <div className="flex flex-col md:flex-row items-center justify-between text-xs font-black gap-4 font-mono text-center">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 w-full md:w-1/4">
                  {lang === 'ar' ? 'تقديم الطلب والضامن' : 'Submit & Guarantor'}
                </div>
                <div className="text-indigo-400">➜</div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 w-full md:w-1/4">
                  {lang === 'ar' ? 'تحليل الملاءة والمادة ٢٠' : 'Auditing System check'}
                </div>
                <div className="text-indigo-400">➜</div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 w-full md:w-1/4">
                  {lang === 'ar' ? 'خصم مسيرات الرواتب' : 'Payroll Wage Deduction'}
                </div>
                <div className="text-indigo-400">➜</div>
                <div className="p-3 bg-indigo-600 rounded-xl w-full md:w-1/4">
                  {lang === 'ar' ? 'براءة الذمة أو التسوية مادة ٥١' : 'Clearance or EOS Recovery'}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* MODAL 1: LOAN ADD / EDIT FORM MODAL WITH AUTOMATIC COMPUTATIONS */}
      {isFormOpen && (
        <Modal 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          title={currentLoan ? (lang === 'ar' ? 'تعديل سلال الذمة المالية للموظف' : 'Modify Debt Form Details') : tLocal.calculatorTitle}
          size="xl"
        >
          <form onSubmit={handleSaveLoan} className="space-y-6 text-right max-h-[80vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="w-full">
                <Select
                  label={tLocal.employeeSelector}
                  value={formFields.employeeId}
                  options={employees.map(e => ({ value: e.id, label: e.fullNameAr }))}
                  onChange={e => handleEmployeeFieldChange(e.target.value)}
                  required
                />
              </div>
              <div className="w-full">
                <Select 
                  label={tLocal.type}
                  value={formFields.loanType}
                  options={[
                    { value: LoanType.PERSONAL, label: LoanType.PERSONAL },
                    { value: LoanType.SALARY_ADVANCE, label: LoanType.SALARY_ADVANCE },
                    { value: LoanType.HOUSING, label: LoanType.HOUSING },
                    { value: LoanType.EMERGENCY, label: LoanType.EMERGENCY },
                  ]}
                  onChange={e => setFormFields({ ...formFields, loanType: e.target.value as LoanType })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Input
                label={tLocal.loanAmountLabel}
                type="number"
                step="0.001"
                value={formFields.loanAmount.toString()}
                onChange={e => setFormFields({ ...formFields, loanAmount: parseFloat(e.target.value) || 0 })}
                required
              />
              <Input
                label={tLocal.termLabel}
                type="number"
                value={formFields.term.toString()}
                onChange={e => setFormFields({ ...formFields, term: parseInt(e.target.value) || 0 })}
                required
              />
              <Input
                label={tLocal.startDateLabel}
                type="date"
                value={formFields.repaymentStartDate}
                onChange={e => setFormFields({ ...formFields, repaymentStartDate: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Input
                label={tLocal.guarantorName}
                value={formFields.guarantorName}
                onChange={e => setFormFields({ ...formFields, guarantorName: e.target.value })}
              />
              <Input
                label={tLocal.guarantorCivil}
                value={formFields.guarantorCivilId}
                onChange={e => setFormFields({ ...formFields, guarantorCivilId: e.target.value })}
              />
            </div>

            <TextArea
              label={tLocal.purposeLabel}
              value={formFields.purpose}
              onChange={e => setFormFields({ ...formFields, purpose: e.target.value })}
              rows={3}
            />

            {/* Smart computational compliance outputs inside form */}
            {selectedEmployeeForForm && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <h5 className="text-xs font-black text-slate-800 border-b pb-2 flex items-center justify-between">
                  <span>📊 {tLocal.calcResult}</span>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">Ref: {selectedEmployeeForForm.employeeId}</span>
                </h5>
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-bold leading-relaxed text-slate-700">
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">{tLocal.salaryLabel}</p>
                    <p className="text-slate-950 font-black">{formatKWD(selectedEmployeeForForm.basicSalary)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">{tLocal.maxDeductionAllowed}</p>
                    <p className="text-indigo-600 font-black">{formatKWD(selectedEmployeeForForm.basicSalary * 0.1)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">{tLocal.actualDeduction}</p>
                    <p className={`font-black ${isViolatingKuwaitiCap ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatKWD(liveMonthlyInstallment)}
                    </p>
                  </div>
                </div>

                {/* Progress compliance slider */}
                <div className="space-y-1 pt-2">
                  <div className="flex justify-between text-[10px] font-black">
                    <span className={isViolatingKuwaitiCap ? 'text-rose-600' : 'text-emerald-600'}>
                      {tLocal.percentageOfSalary}: {liveDeductionRatio.toFixed(1)}%
                    </span>
                    <span className="text-slate-400">10% Statutory Cap Limit</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${isViolatingKuwaitiCap ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (liveDeductionRatio / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Live Warning advice */}
                <p className={`text-[10px] leading-relaxed font-black flex items-center gap-1.5 ${isViolatingKuwaitiCap ? 'text-rose-600 bg-rose-50 p-2.5 rounded-lg border border-rose-100' : 'text-emerald-600 bg-emerald-50/50 p-2.5 rounded-lg'}`}>
                  {isViolatingKuwaitiCap ? (
                    <>
                      <XCircleIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{tLocal.violatingReg}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{tLocal.compliantReg}</span>
                    </>
                  )}
                </p>
              </div>
            )}

            <div className="pt-4 border-t flex justify-end gap-3 sticky bottom-0 bg-white py-2 z-10">
              <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
                {tLocal.cancelBtn}
              </Button>
              <Button type="submit" variant="primary">
                {tLocal.saveBtn}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 2: INTERACTIVE LOAN DETAIL WINDOW WITH REPAYMENT LOGGING */}
      {viewingLoanId && activeViewingLoanObj && (
        <Modal
          isOpen={!!viewingLoanId}
          onClose={() => setViewingLoanId(null)}
          title={lang === 'ar' ? `الفايل والذمة المالية للمقترض: ${activeViewingLoanObj.employeeName}` : `Financial folder for ${activeViewingLoanObj.employeeName}`}
          size="xl"
        >
          <div className="space-y-6 text-right max-h-[75vh] overflow-y-auto pr-1">
            {/* Folder Header Metadata */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-700 rounded-full">
                  <CurrencyDollarIcon className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">{formatKWD(activeViewingLoanObj.loanAmount)}</h4>
                  <p className="text-xs text-slate-500 font-bold">{activeViewingLoanObj.loanType} | Code: {activeViewingLoanObj.id}</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <LoanStatusBadge status={activeViewingLoanObj.status} />
                <p className="text-[10px] text-slate-400 mt-1 font-bold">{lang === 'ar' ? 'التسجيل:' : 'Logged:'} {formatDate(activeViewingLoanObj.createdAt)}</p>
              </div>
            </div>

            {/* Balances details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl space-y-1">
                <p className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'إجمالي المبالغ المسددة' : 'Reclaimed Total'}</p>
                <p className="text-lg font-black text-emerald-600">{formatKWD(activeViewingLoanObj.totalPaidAmount || 0)}</p>
              </div>
              <div className="p-4 border border-slate-200 rounded-xl space-y-1">
                <p className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'الرصيد المتبقي بالكامل' : 'Aggregate Debt Outstanding'}</p>
                <p className="text-lg font-black text-rose-600">{formatKWD(activeViewingLoanObj.remainingBalance ?? activeViewingLoanObj.loanAmount)}</p>
              </div>
            </div>

            {/* Covenants information */}
            <Card title={lang === 'ar' ? 'شروط وتعهدات الضمان' : 'Underwriting & Sureties'} titleClassName="text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-700 leading-relaxed">
                <p className="flex justify-between"><span>{lang === 'ar' ? 'الضامن / الكفيل:' : 'Guarantor Full Name:'}</span><span>{activeViewingLoanObj.guarantorName || 'لا يوجد كفيل مسجل'}</span></p>
                <p className="flex justify-between"><span>{lang === 'ar' ? 'الرقم المدني للكفيل:' : 'Guarantor Civil ID:'}</span><span>{activeViewingLoanObj.guarantorCivilId || '-'}</span></p>
                <p className="flex justify-between"><span>{lang === 'ar' ? 'فترة التقسيط المعتمدة:' : 'Approved Instalment Terms:'}</span><span>{activeViewingLoanObj.numberOfInstallments} {lang === 'ar' ? 'أشهر' : 'Months'}</span></p>
                <p className="flex justify-between"><span>{lang === 'ar' ? 'قيمة القسط الشهري:' : 'Calculated Monthly Stipend:'}</span><span>{formatKWD(activeViewingLoanObj.monthlyInstallment)}</span></p>
              </div>
            </Card>

            {/* Installments Table list */}
            <Card title={lang === 'ar' ? 'جدول الملاحقة واستحقاق الأقساط' : 'Installments Due List'} titleClassName="text-sm">
              <div className="overflow-x-auto max-h-52 overflow-y-auto">
                <table className="min-w-full text-xs text-right divide-y divide-slate-100">
                  <thead className="bg-slate-50 font-black text-slate-500 sticky top-0">
                    <tr>
                      <th className="px-4 py-2">#</th>
                      <th className="px-4 py-2">{lang === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</th>
                      <th className="px-4 py-2">{lang === 'ar' ? 'القيمة المستحقة' : 'Amount Due'}</th>
                      <th className="px-4 py-2">{lang === 'ar' ? 'حالة القسط' : 'Status'}</th>
                      <th className="px-4 py-2">{lang === 'ar' ? 'إجراء' : 'Register Payment'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                    {activeViewingLoanObj.installments.map(inst => (
                      <tr key={inst.id} className={inst.status === InstallmentStatus.OVERDUE ? 'bg-rose-50/50' : 'hover:bg-slate-50'}>
                        <td className="px-4 py-2 font-mono">{inst.installmentNumber}</td>
                        <td className="px-4 py-2 font-mono">{formatDate(inst.dueDate)}</td>
                        <td className="px-4 py-2">{formatKWD(inst.amountDue)}</td>
                        <td className="px-4 py-2">
                          <InstallmentStatusBadge status={inst.status} />
                        </td>
                        <td className="px-4 py-2">
                          {inst.status !== InstallmentStatus.PAID && (
                            <button
                              id={`pay-btn-${inst.id}`}
                              type="button"
                              onClick={() => {
                                setSelectedInstallmentId(inst.id);
                                setPaymentAmount(inst.amountDue.toFixed(3));
                              }}
                              className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                            >
                              {lang === 'ar' ? 'تسجيل إيداع/دفع' : 'Record Deposit'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Installment Record form popup inside */}
              {selectedInstallmentId && (
                <div className="p-4 mt-4 bg-indigo-50 border border-indigo-100 rounded-xl space-y-3 animate-fade-in-right">
                  <p className="text-xs font-black text-indigo-950">
                    {lang === 'ar' ? 'تسجيل دفعة استرداد للقسط رقم:' : 'Repayment Deposit Form for Installment:'}{' '}
                    {activeViewingLoanObj.installments.find(i => i.id === selectedInstallmentId)?.installmentNumber}
                  </p>
                  <div className="flex flex-wrap items-end gap-3 text-right">
                    <div className="w-40">
                      <Input
                        label={lang === 'ar' ? 'تاريخ السداد' : 'Payment date'}
                        type="date"
                        value={paymentDate}
                        onChange={e => setPaymentDate(e.target.value)}
                        containerClassName="mb-0"
                      />
                    </div>
                    <div className="w-32">
                      <Input
                        label={lang === 'ar' ? 'القيمة المدفوعة' : 'Amount paid'}
                        type="number"
                        step="0.001"
                        value={paymentAmount}
                        onChange={e => setPaymentAmount(e.target.value)}
                        containerClassName="mb-0"
                      />
                    </div>
                    <Button size="sm" variant="primary" onClick={handleConfirmInstallmentPayment}>
                      {lang === 'ar' ? 'تسجيل فوراً بنظام الأجور' : 'Commit Repayment'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedInstallmentId(null)}>
                      {lang === 'ar' ? 'تراجع' : 'Abort'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            <div className="border-t pt-4 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setViewingLoanId(null)}>
                {lang === 'ar' ? 'إغلاق الملف' : 'Close File'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: FULL SCREEN READY-TO-PRINT AGREEMENTS PREVIEW */}
      {isPrintModalOpen && loanForAgreement && (
        <Modal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={lang === 'ar' ? 'شريان المستند المالي ذو الأهمية القصوى' : 'Official Document Export Window'}
          size="xl"
        >
          <div className="space-y-6 max-h-[85vh] overflow-y-auto">
            <div id="decision-printable-area" className="p-12 bg-white border border-slate-300 rounded-xl leading-relaxed text-xs text-slate-800 relative font-sans">
              
              {/* Offical Letterhead banner */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-slate-900">{tLocal.firm}</h2>
                  <p className="text-[10px] font-bold text-slate-500">{lang === 'ar' ? 'إدارة الشؤون الإدارية والمالية والمطالبات العمالية' : 'Head Office, Corporate Internal Credits Division'}</p>
                </div>
                <div className="text-left font-mono font-bold text-slate-400">
                  <p>REF: {loanForAgreement.id}</p>
                  <p>DATE: {new Date().toISOString().split('T')[0]}</p>
                </div>
              </div>

              {/* Dynamic Fill Template Render */}
              <div className="space-y-4 text-xs select-text whitespace-pre-wrap leading-relaxed text-slate-800 border-2 border-slate-200 bg-slate-50 p-6 rounded-2xl">
                {preparedTemplateContent}
              </div>

              {/* Verified Badge */}
              <div className="mt-8 flex justify-center items-center gap-2">
                <div className="border-2 border-indigo-600/30 text-indigo-600 text-[9px] uppercase font-black tracking-widest px-4 py-1 rotate-1 rounded-sm">
                  {lang === 'ar' ? 'تم التدقيق والمطابقة القانونية كويتيا ٦/٢٠١٠' : 'Audited and certified under Kuwait law 6/2010'}
                </div>
              </div>

              {/* QR Code section */}
              <div className="absolute top-28 left-12 flex flex-col items-center">
                <div className="w-10 h-10 border border-slate-300 bg-slate-100 flex items-center justify-center text-[8px] text-slate-400 select-none">
                  QR
                </div>
                <span className="text-[7px] text-slate-400 font-mono mt-1 pt-1 select-none">AD-LN-SURETY</span>
              </div>

              {/* Signature Block */}
              <div className="grid grid-cols-3 gap-8 pt-12 mt-12 border-t border-slate-100 text-center font-bold text-[10px] text-slate-800">
                <div className="space-y-4">
                  <p>{lang === 'ar' ? 'إقرار محاسب الأجور' : 'Accounts Officer Certified'}</p>
                  <div className="h-10 border-b border-slate-200"></div>
                  <p className="text-[8px] text-emerald-600">✔ تم التدقيق والمطابقة - المادة ٢٠</p>
                </div>
                <div className="space-y-42">
                  <p>{lang === 'ar' ? 'توقيع الكفيل الضامن' : 'Signature of Guarantor'}</p>
                  <div className="h-10 border-b border-slate-200"></div>
                </div>
                <div className="space-y-4">
                  <p>{lang === 'ar' ? 'توقيع وبصمة الموظف (المقترض)' : 'Repaying Employee Signature/Seal'}</p>
                  <div className="h-10 border-b border-slate-200"></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white py-2 z-10">
              <Button variant="ghost" onClick={() => setIsPrintModalOpen(false)}>
                {lang === 'ar' ? 'إغلاق المعاينة' : 'Abort Print'}
              </Button>
              <Button 
                variant="primary" 
                className="bg-slate-950 border-slate-900" 
                onClick={() => window.print()}
                leftIcon={<PrinterIcon className="w-4 h-4" />}
              >
                {lang === 'ar' ? 'طباعة القرار فوراً' : 'Print Document Now'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LoanManagementPage;
