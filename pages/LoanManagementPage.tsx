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
    PlusCircleIcon, InformationCircleIcon, CheckCircleIcon, XCircleIcon, 
    BanknotesIcon, ChartBarIcon, ScaleIcon, UsersIcon, FolderIcon,
    PrinterIcon, CalculatorIcon, ClockIcon, OFFICE_NAME
} from '../constants';
import { Loan, Employee, LoanType, LoanStatus, InstallmentStatus, Installment } from '../types';
import { initialEmployees } from './EmployeeProfilePage';
import { LoanStatusBadge, InstallmentStatusBadge } from '../components/ui/Badge';

// Import our modular subcomponents
import { LoanDashboard } from './components/LoanDashboard';
import { LoanListTab } from './components/LoanListTab';
import { LoanPaymentTrackerTab } from './components/LoanPaymentTrackerTab';
import { LoanEOSSimulatorTab } from './components/LoanEOSSimulatorTab';
import { LoanDocumentHubTab } from './components/LoanDocumentHubTab';
import { LoanIntegrationsTab } from './components/LoanIntegrationsTab';

// Database Models
import { initialLoans, initialLoanLogs, validateKuwaitiLoanRules, LoanActivityLog } from './loan_data';
import { LEGAL_TEMPLATES, fillTemplate, LegalTemplate } from './loan_templates';

const LoanManagementPage: React.FC = () => {
  const { addToast } = useToast();
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'loans' | 'advances' | 'payments' | 'templates' | 'aiCopilot' | 'integrations'>('dashboard');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Core State Engines
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [logs, setLogs] = useState<LoanActivityLog[]>(initialLoanLogs);
  const [employees] = useState<Employee[]>(initialEmployees);

  // Search/Filters states
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [salaryRange, setSalaryRange] = useState<string>('all');
  const [deductionWarningFilter, setDeductionWarningFilter] = useState<boolean>(false);

  // Navigation state bridges for documents hub
  const [initialSelectedLoanId, setInitialSelectedLoanId] = useState<string>('');
  const [initialSelectedTemplateId, setInitialSelectedTemplateId] = useState<string>('');

  // Modals States
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [viewingLoanId, setViewingLoanId] = useState<string | null>(null);

  // Add/Edit Form specific states
  const [formEmployeeId, setFormEmployeeId] = useState<string>(employees[0]?.id || '');
  const [formLoanType, setFormLoanType] = useState<LoanType>(LoanType.PERSONAL);
  const [formAmount, setFormAmount] = useState<string>('');
  const [formPurpose, setFormPurpose] = useState<string>('');
  const [formRepaymentStartDate, setFormRepaymentStartDate] = useState<string>('');
  const [formNumberOfInstallments, setFormNumberOfInstallments] = useState<string>('12');
  const [formGuarantorName, setFormGuarantorName] = useState<string>('');
  const [formGuarantorCivilId, setFormGuarantorCivilId] = useState<string>('');
  const [formNotes, setFormNotes] = useState<string>('');

  // AI interactive helper states
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Local translations for general menus
  const tLocal = {
    firm: lang === 'ar' ? OFFICE_NAME : OFFICE_NAME,
    title: lang === 'ar' ? 'منظومة إدارة الكفالات والقروض والسلف المهنية' : 'Professional Employee Loans & Advances Suite',
    addNewBtn: lang === 'ar' ? 'صرف تمويل / سلفة جديدة' : 'Disburse New Credit / Advance',
    salaryLabel: lang === 'ar' ? 'الراتب الأساسي للموظف' : 'Registered Basic Wage',
    maxDeductionAllowed: lang === 'ar' ? 'الحد الأقصى المسموح (10%)' : 'statutory Cap Limit (10%)',
    actualDeduction: lang === 'ar' ? 'القسط الشهري المقترح' : 'Proposed monthly amount',
    percentageOfSalary: lang === 'ar' ? 'نسبة الاستقطاع من الراتب' : 'Deduction ratio',
    violatingReg: lang === 'ar' ? 'تجاوز للحد الأقصى (مخالفة للمادة 20 قانون السداد الكويتي)' : 'Violation: exceeds 10% basic salary cap (Art 20)',
    compliantReg: lang === 'ar' ? 'متطابق قانونياً وضمن السقف المسموح به للمادة 20' : 'Compliant under Article 20 parameters',
    saveBtn: lang === 'ar' ? 'صرف وترحيل القيد للرواتب' : 'Confirm & Commit Credit',
    cancelBtn: lang === 'ar' ? 'إلغاء' : 'Cancel'
  };

  // Helper selectors
  const activeViewingLoanObj = useMemo(() => {
    return loans.find(l => l.id === viewingLoanId);
  }, [loans, viewingLoanId]);

  const selectedEmployeeForForm = useMemo(() => {
    return employees.find(e => e.id === formEmployeeId) || employees[0];
  }, [employees, formEmployeeId]);

  // Handle change in selection to default emergency values
  const handleFormLoanTypeChange = (type: LoanType) => {
    setFormLoanType(type);
    if (type === LoanType.SALARY_ADVANCE || type === LoanType.EMERGENCY) {
      setFormNumberOfInstallments('1'); // salary advance behaves as short-term 1 month repaid
      setFormGuarantorName('');
      setFormGuarantorCivilId('');
    } else {
      setFormNumberOfInstallments('12');
    }
  };

  // Real-time compliance monitoring values
  const liveMonthlyInstallment = useMemo(() => {
    const amountFloat = parseFloat(formAmount) || 0;
    const monthsInt = parseInt(formNumberOfInstallments) || 1;
    return amountFloat / monthsInt;
  }, [formAmount, formNumberOfInstallments]);

  const liveDeductionRatio = useMemo(() => {
    if (!selectedEmployeeForForm) return 0;
    return (liveMonthlyInstallment / selectedEmployeeForForm.basicSalary) * 100;
  }, [selectedEmployeeForForm, liveMonthlyInstallment]);

  const isViolatingKuwaitiCap = useMemo(() => {
    return liveDeductionRatio > 10;
  }, [liveDeductionRatio]);

  // Open the add/edit loan modal
  const handleOpenLoanForm = (loan?: Loan) => {
    if (loan) {
      setEditingLoan(loan);
      setFormEmployeeId(loan.employeeId);
      setFormLoanType(loan.loanType);
      setFormAmount(loan.loanAmount.toString());
      setFormPurpose(loan.purpose || '');
      setFormRepaymentStartDate(loan.repaymentStartDate || '');
      setFormNumberOfInstallments(loan.numberOfInstallments.toString());
      setFormGuarantorName(loan.guarantorName || '');
      setFormGuarantorCivilId(loan.guarantorCivilId || '');
      setFormNotes(loan.notes || '');
    } else {
      setEditingLoan(null);
      setFormEmployeeId(employees[0]?.id || '');
      setFormLoanType(LoanType.PERSONAL);
      setFormAmount('');
      setFormPurpose('');
      setFormRepaymentStartDate(new Date().toISOString().split('T')[0]);
      setFormNumberOfInstallments('12');
      setFormGuarantorName('');
      setFormGuarantorCivilId('');
      setFormNotes('');
    }
    setIsFormOpen(true);
  };

  // Save/Create Loan records
  const handleSaveLoanFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(formAmount);
    const monthsVal = parseInt(formNumberOfInstallments);

    if (isNaN(amountVal) || amountVal <= 0) {
      addToast({
        title: lang === 'ar' ? 'خطأ في الإدخال' : 'Input Error',
        message: lang === 'ar' ? 'يرجى كتابة مبلغ التمويل الصحيح' : 'Please input a valid financing amount.',
        type: 'error'
      });
      return;
    }
    if (isNaN(monthsVal) || monthsVal <= 0) {
      addToast({
        title: lang === 'ar' ? 'ثغرة في الآجال' : 'Term Error',
        message: lang === 'ar' ? 'يرجى تحديد فترة سداد صحيحة' : 'Invalid duration term.',
        type: 'error'
      });
      return;
    }

    const calculatedInstallment = amountVal / monthsVal;

    // Generate installment entries
    const generatedInstallments: Installment[] = Array.from({ length: monthsVal }, (_, idx) => {
      const dueDateObj = new Date(formRepaymentStartDate || new Date());
      dueDateObj.setMonth(dueDateObj.getMonth() + idx);
      return {
        id: `inst-gen-${Date.now()}-${idx + 1}`,
        installmentNumber: idx + 1,
        dueDate: dueDateObj.toISOString().split('T')[0],
        amountDue: calculatedInstallment,
        status: InstallmentStatus.UPCOMING
      };
    });

    if (editingLoan) {
      // Modify active loan
      setLoans(prev => prev.map(l => {
        if (l.id === editingLoan.id) {
          return {
            ...l,
            loanAmount: amountVal,
            loanType: formLoanType,
            purpose: formPurpose,
            numberOfInstallments: monthsVal,
            monthlyInstallment: calculatedInstallment,
            guarantorName: formGuarantorName,
            guarantorCivilId: formGuarantorCivilId,
            notes: formNotes,
            installments: generatedInstallments,
            remainingBalance: amountVal - (l.totalPaidAmount || 0)
          };
        }
        return l;
      }));

      // Append edit audit log
      setLogs(prev => [
        {
          id: `log-edit-${Date.now()}`,
          loanId: editingLoan.id,
          action: 'تعديل الصياغة والجدولة المالية',
          actionEn: 'Loan Parameters Amended',
          user: 'رئيس الشؤون القانونية',
          date: new Date().toISOString().split('T')[0],
          notes: `تم إعادة جدولة القرض للموظف بقيمة إجمالية ${amountVal.toFixed(3)} د.ك موزعة على ${monthsVal} أشهر بحالة نشطة ومطابقة المادة ٢٠.`,
          notesEn: `Restructured active loan fields of ${amountVal.toFixed(3)} KWD over ${monthsVal} months.`
        },
        ...prev
      ]);

      addToast({
        title: lang === 'ar' ? 'تم التعديل بنجاح' : 'Amended Successfully',
        message: lang === 'ar' ? 'تم تحديث التمويل وإعادة جدولة الدفعات' : 'Loan parameters successfully amended.',
        type: 'success'
      });
    } else {
      // Create fresh loan record
      const newId = `AD-LN-${new Date().getFullYear()}-000${loans.length + 1}`;
      const freshLoan: Loan = {
        id: newId,
        employeeId: formEmployeeId,
        employeeName: selectedEmployeeForForm?.fullNameAr || 'أحمد الصباح',
        loanType: formLoanType,
        loanAmount: amountVal,
        purpose: formPurpose,
        requestDate: new Date().toISOString().split('T')[0],
        approvalDate: new Date().toISOString().split('T')[0],
        disbursementDate: new Date().toISOString().split('T')[0],
        repaymentStartDate: formRepaymentStartDate,
        numberOfInstallments: monthsVal,
        monthlyInstallment: calculatedInstallment,
        status: isViolatingKuwaitiCap ? LoanStatus.UNDER_FINANCIAL_REVIEW : LoanStatus.ACTIVE,
        installments: generatedInstallments,
        totalPaidAmount: 0,
        remainingBalance: amountVal,
        guarantorName: formGuarantorName,
        guarantorCivilId: formGuarantorCivilId,
        notes: formNotes,
        createdAt: new Date().toISOString().split('T')[0]
      };

      setLoans(prev => [freshLoan, ...prev]);

      // Add to logs
      setLogs(prev => [
        {
          id: `log-new-${Date.now()}`,
          loanId: newId,
          action: isViolatingKuwaitiCap ? 'تأسيس قيد وتحويل للمراجعة للمادة 20' : 'صرف واطلاق تمويل جديد',
          actionEn: isViolatingKuwaitiCap ? 'Loan Registered & Under Audit' : 'Disbursement Active',
          user: 'أمين الخزينة الرئيسي',
          date: new Date().toISOString().split('T')[0],
          notes: isViolatingKuwaitiCap 
            ? `تنبيه: تم تحويل القرض للمراجع المالي لتخطيه قسط الاستقطاع لـ 10% من راتب الموظف.`
            : `صرف مالي مباشر برقم مرجعي معتمد لراتب موظف بموجب المادة 20.`,
          notesEn: `Successfully logged new corporate transaction under official compliance check.`
        },
        ...prev
      ]);

      addToast({
        title: isViolatingKuwaitiCap ? (lang === 'ar' ? 'تنبيه تدقيق مالي' : 'Financial Review Required') : (lang === 'ar' ? 'تم الصرف بنجاح' : 'Disbursement Successful'),
        message: isViolatingKuwaitiCap 
          ? (lang === 'ar' ? 'تم قيد الطلب ولكن تم تحويله للتدقيق لتجاوزه الحد القانوني 10%' : 'Submitted. Needs review due to exceeding statutory wage limit.')
          : (lang === 'ar' ? 'تم صرف التمويل وترحيله لملف الأجور للموظف' : 'New loan successfully disbursed and linked to accounts.'),
        type: isViolatingKuwaitiCap ? 'error' : 'success'
      });
    }
    setIsFormOpen(false);
  };

  // Delete records
  const handleDeleteLoan = (id: string) => {
    const confirmation = window.confirm(lang === 'ar' ? 'هل أنت متأكد تماماً من إزالة وإلغاء هذا المعاملة التمويلية كليا؟' : 'Are you sure you want to delete this loan?');
    if (confirmation) {
      setLoans(prev => prev.filter(l => l.id !== id));
      addToast({
        title: lang === 'ar' ? 'تم الحذف' : 'Record Deleted',
        message: lang === 'ar' ? 'تمت إزالة المعاملة كلياً وقيد الإلغاء بالسجلات' : 'Loan record successfully expunged.',
        type: 'success'
      });
    }
  };

  // Record an installment payment (deposit)
  const handleRecordPayment = (
    loanId: string, 
    installmentId: string, 
    amountNum: number, 
    payDate: string
  ) => {
    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        const updatedInsts = l.installments.map(inst => {
          if (inst.id === installmentId) {
            return {
              ...inst,
              status: InstallmentStatus.PAID,
              amountPaid: amountNum,
              paymentDate: payDate
            };
          }
          return inst;
        });

        const repaidSum = updatedInsts
          .filter(i => i.status === InstallmentStatus.PAID)
          .reduce((sum, i) => sum + (i.amountPaid || 0), 0);
        
        const remaining = l.loanAmount - repaidSum;
        const finalStatus = remaining <= 0 ? LoanStatus.PAID_IN_FULL : l.status;

        return {
          ...l,
          installments: updatedInsts,
          totalPaidAmount: repaidSum,
          remainingBalance: remaining,
          status: finalStatus
        };
      }
      return l;
    }));

    // Record activity audit log
    setLogs(prev => [
      {
        id: `pay-log-${Date.now()}`,
        loanId: loanId,
        action: 'استلام دفعة سداد قسط',
        actionEn: 'Installment Repayment Received',
        user: 'إدارة التحصيلات والأجور',
        date: payDate,
        notes: `تم قيد دفعة سداد نقدي بقيمة ${amountNum.toFixed(3)} د.ك واستلامها في خزينة المكتب الموحدة.`,
        notesEn: `Successfully committed deposit of ${amountNum.toFixed(3)} KWD to internal general bank accounts.`
      },
      ...prev
    ]);

    addToast({
      title: lang === 'ar' ? 'تم استلام الدفعة' : 'Payment Received',
      message: lang === 'ar' ? 'تم تسجيل إيداع الدفعة بنجاح وتحديث الرصيد القائم' : 'Deposit received. Balance updated.',
      type: 'success'
    });
  };

  // Restructure a loan duration and monthly installment
  const handleRestructureLoan = (loanId: string, newMonths: number, newInstAmount: number) => {
    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        // regenerate remaining installments
        const unpaidSum = l.remainingBalance ?? l.loanAmount;
        const generatedInsts: Installment[] = Array.from({ length: newMonths }, (_, idx) => {
          const date = new Date();
          date.setMonth(date.getMonth() + idx + 1);
          return {
            id: `inst-restruct-${Date.now()}-${idx + 1}`,
            installmentNumber: idx + 1,
            dueDate: date.toISOString().split('T')[0],
            amountDue: unpaidSum / newMonths,
            status: InstallmentStatus.UPCOMING
          };
        });

        return {
          ...l,
          numberOfInstallments: newMonths,
          monthlyInstallment: unpaidSum / newMonths,
          installments: generatedInsts,
          status: LoanStatus.ACTIVE
        };
      }
      return l;
    }));

    setLogs(prev => [
      {
        id: `restruct-log-${Date.now()}`,
        loanId: loanId,
        action: 'إعادة جدولة وهيكلة الديون',
        actionEn: 'Debt Amortization Restructured',
        user: 'المدير المالي والالتزام',
        date: new Date().toISOString().split('T')[0],
        notes: `تم إعادة تصفية المديونيات لتقسيط الرصيد المستحق على ${newMonths} أشهر لتخفيف عبء الاستقطاع.`,
        notesEn: `Amortization structure amended over ${newMonths} payments.`
      },
      ...prev
    ]);

    addToast({
      title: lang === 'ar' ? 'إعادة جدولة مديونية' : 'Debt Restructured',
      message: lang === 'ar' ? 'تمت إعادة هيكلة التمويل والجدولة وتوليد الأقساط الجديدة' : 'Debt restructured successfully.',
      type: 'success'
    });
  };

  // Commit an End of Service Gratuity deductions (Article 51)
  const handleCommitEOSDeduction = (
    employeeId: string, 
    outstandingDebt: number, 
    finalGratuity: number, 
    netPayable: number
  ) => {
    // Clear and mark loans for this employee as PAID_IN_FULL or SETTLED
    setLoans(prev => prev.map(l => {
      if (l.employeeId === employeeId && l.status !== LoanStatus.PAID_IN_FULL) {
        const clearedInsts = l.installments.map(i => ({
          ...i,
          status: InstallmentStatus.PAID,
          amountPaid: i.amountDue,
          paymentDate: new Date().toISOString().split('T')[0]
        }));

        return {
          ...l,
          installments: clearedInsts,
          totalPaidAmount: l.loanAmount,
          remainingBalance: 0,
          status: LoanStatus.PAID_IN_FULL
        };
      }
      return l;
    }));

    // Record large final audit ledger
    const emp = employees.find(e => e.id === employeeId);
    setLogs(prev => [
      {
        id: `eos-log-${Date.now()}`,
        loanId: 'AD-EOS-SETTLE',
        action: 'تسوية المادة 51 القانونية لإنهاء الخدمة',
        actionEn: 'Article 51 Final EOS Settlement',
        user: 'رئيس الموارد البشرية والامتثال',
        date: new Date().toISOString().split('T')[0],
        notes: `تم الإستقطاع النهائي المفتوح لباقي القروض بقيمة ${outstandingDebt.toFixed(3)} د.ك من إجمالي مكافأة ${emp?.fullNameAr} البالغة ${finalGratuity.toFixed(3)} د.ك الصافي المصروف: ${netPayable.toFixed(3)} د.ك.`,
        notesEn: `Committed full debt recovery of ${outstandingDebt.toFixed(3)} KWD from EOS benefits under Kuwait Law.`
      },
      ...prev
    ]);

    addToast({
      title: lang === 'ar' ? 'إقرار تصفية مادة 51' : 'EOS Settle Committed',
      message: lang === 'ar' ? 'تمت تسوية وتصفية القروض وتصفير المديونية المادة 51 بنجاح' : 'Debt cleared under Article 51.',
      type: 'success'
    });
  };

  // Direct tab selection and prefill transition for visual sandbox
  const handleNavigateToDocumentsTab = (templateId: string, loanId: string) => {
    setInitialSelectedLoanId(loanId);
    setInitialSelectedTemplateId(templateId);
    setActiveTab('templates');
  };

  // Handle Approve/Reject decisions on PENDING files
  const handleApproveLoan = (id: string, step: 'approve' | 'reject' | 'audit') => {
    setLoans(prev => prev.map(l => {
      if (l.id === id) {
        let finalStatus = l.status;
        let actionLabel = '';
        if (step === 'approve') {
          finalStatus = LoanStatus.ACTIVE;
          actionLabel = 'تم اعتماد التمويل وصرفه';
        } else if (step === 'reject') {
          finalStatus = LoanStatus.PAID_IN_FULL; // or closed
          actionLabel = 'تم رفض وإلغاء المعاملة';
        } else {
          finalStatus = LoanStatus.UNDER_FINANCIAL_REVIEW;
          actionLabel = 'إرسال للمراجعة والتدقيق المالي';
        }

        return {
          ...l,
          status: finalStatus
        };
      }
      return l;
    }));

    addToast({
      title: lang === 'ar' ? 'تم قيد القرار الإداري' : 'Administrative Decision Logged',
      message: lang === 'ar' ? 'تم قيد القرار الإداري في سجل التمويل ومسيرة المال' : 'Decision committed.',
      type: 'success'
    });
  };

  // Simulator AI advisory copilot responses
  const handleSimulateAiQuestions = () => {
    setIsAiLoading(true);
    setAiResponse('');
    setTimeout(() => {
      let advice = '';
      const promptLower = aiPrompt.toLowerCase();

      if (promptLower.includes('مادة 20') || promptLower.includes('مادة ٢٠') || promptLower.includes('10%') || promptLower.includes('salary cap')) {
        advice = lang === 'ar' 
          ? `تقضي المادة (20) من قانون عمل الكويت رقم 6 / 2010 بمنع المخدم من استقطاع أكثر من 10% من الراتب العادي الأساسي للموظف شهرياً وفاءً للقروض والديون. يتوجب على محاسب الأجور الالتزام المطلق بضبط السهم البرمجي وعدم تجاوزه لتفادي البطلان النقدي المرفوع أمام المحاكم العمالية.`
          : `Under Article 20 of Kuwait Labor Law, monthly salary deductions targeting corporate debts are strictly capped at 10% of the employee's basic wage. Exceeding this limit renders the payroll file legally void inside courts.`;
      } else if (promptLower.includes('مادة 51') || promptLower.includes('مادة ٥١') || promptLower.includes('نهاية الخدمة') || promptLower.includes('eos')) {
        advice = lang === 'ar'
          ? `المادة (51) تحدد آليات صرف مكافآت إنهاء الخدمة. والامتياز القانوني للأموال يعطي المخدم الحق بالخصم والمقاصة بالكامل لباقي ديون الموظف القائم من مستحقات مكافأة نهاية الخدمة الإجمالية كجبر مالي نهائي، مما يمثل تصفية عادلة مادة 51.`
          : `Article 51 clarifies the liquidation rights. The employer holds preferred legal entitlement to deduct outstanding debt directly from the cumulative end-of-service gratuity sum without the 10% ceiling limit, creating a secure recovery corridor.`;
      } else {
        advice = lang === 'ar'
          ? `تحليل الأنظمة: يوصى نظام عدالة الكفيل بتقديم هوية مدنية كويتية صالحة (Civil ID). سقف المبادلة المالي متوافق لضمان تحصيل الديون. هل ترغب باختيار "مركز التسويات مادة 51" أو "تصدير المستند رقم 4 إقرار بالخصم"؟`
          : `Compliance Analyzer: System suggests requiring valid Civil ID validation for and personal bonds for key loans. Let us recommend checking the EOS simulators panel or creating Salary direct deduction consents.`;
      }

      setAiResponse(advice);
      setIsAiLoading(false);
    }, 1000);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen font-sans antialiased text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* HEADER BAR AND BRANDING */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-indigo-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 justify-end md:justify-start">
            <span className="bg-slate-900 text-white text-[10px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              {lang === 'ar' ? 'عدالة • الأمن المالي' : 'Adala • Financial Protection'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">{tLocal.title}</h1>
          <p className="text-xs text-slate-500 font-semibold">{tLocal.firm}</p>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-wrap gap-3 items-center">
          <button 
            onClick={() => setLang(prev => prev === 'ar' ? 'en' : 'ar')}
            className="px-3 py-1.5 text-xs font-black bg-white rounded-xl border hover:bg-slate-100 text-slate-800"
          >
            🌐 {lang === 'ar' ? 'English' : 'العربية'}
          </button>
          
          <Button 
            variant="primary" 
            className="bg-indigo-600 border-indigo-500 hover:bg-indigo-700"
            onClick={() => handleFormLoanTypeChange(LoanType.PERSONAL)} // fallback to reset
            leftIcon={<PlusCircleIcon className="w-4.5 h-4.5" />}
          >
            <span onClick={() => handleOpenLoanForm()}>{tLocal.addNewBtn}</span>
          </Button>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex flex-wrap border-b border-slate-200 mt-6 gap-2 mb-6 text-xs font-bold text-slate-500">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-2.5 rounded-t-lg transition-all ${activeTab === 'dashboard' ? 'border-b-2 border-indigo-600 text-indigo-600 font-black bg-white' : 'hover:bg-slate-100'}`}
        >
          📈 {lang === 'ar' ? 'لوحة التحكم والمؤشرات' : 'Dashboard KPI'}
        </button>
        <button 
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-2.5 rounded-t-lg transition-all ${activeTab === 'loans' ? 'border-b-2 border-indigo-600 text-indigo-600 font-black bg-white' : 'hover:bg-slate-100'}`}
        >
          📂 {lang === 'ar' ? 'قرارات طلبات القروض والسلف' : 'Borrowers & Approvals'}
        </button>
        <button 
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-t-lg transition-all ${activeTab === 'payments' ? 'border-b-2 border-indigo-600 text-indigo-600 font-black bg-white' : 'hover:bg-slate-100'}`}
        >
          🗓️ {lang === 'ar' ? 'متابعة الأقساط والتحصيل' : 'Repayments Tracker'}
        </button>
        <button 
          onClick={() => setActiveTab('advances')}
          className={`px-4 py-2.5 rounded-t-lg transition-all ${activeTab === 'advances' ? 'border-b-2 border-indigo-600 text-indigo-600 font-black bg-white' : 'hover:bg-slate-100'}`}
        >
          ⚖️ {lang === 'ar' ? 'تسويات المادة 51 (نهاية الخدمة)' : 'EOS Debt Settle (Art 51)'}
        </button>
        <button 
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-2.5 rounded-t-lg transition-all ${activeTab === 'templates' ? 'border-b-2 border-indigo-600 text-indigo-600 font-black bg-white' : 'hover:bg-slate-100'}`}
        >
          📄 {lang === 'ar' ? 'محرر السندات والنماذج الـ 8 المعاينة' : '8 Core Printing Center'}
        </button>
        <button 
          onClick={() => setActiveTab('aiCopilot')}
          className={`px-4 py-2.5 rounded-t-lg transition-all ${activeTab === 'aiCopilot' ? 'border-b-2 border-indigo-600 text-indigo-600 font-black bg-white' : 'hover:bg-slate-100'}`}
        >
          🤖 {lang === 'ar' ? 'المستشار القانوني للمادة 20 / 51' : 'Labor Compliance Copilot'}
        </button>
        <button 
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-2.5 rounded-t-lg transition-all ${activeTab === 'integrations' ? 'border-b-2 border-indigo-600 text-indigo-600 font-black bg-white' : 'hover:bg-slate-100'}`}
        >
          🔌 {lang === 'ar' ? 'تكامل الأنظمة وشؤون الموظفين' : 'ERP Integrations'}
        </button>
      </div>

      {/* ACTIVE VIEWPORT PORTAL */}
      <div className="space-y-6">
        {activeTab === 'dashboard' && (
          <LoanDashboard 
            lang={lang} 
            loans={loans} 
            employees={employees} 
            logs={logs}
            onOpenPrintPreview={(loan) => handleNavigateToDocumentsTab('temp-11', loan.id)}
            onViewLoan={(id) => {
              setViewingLoanId(id);
              setActiveTab('payments');
            }}
          />
        )}

        {activeTab === 'loans' && (
          <LoanListTab
            lang={lang}
            loans={loans}
            employees={employees}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            filterType={filterType}
            setFilterType={setFilterType}
            salaryRange={salaryRange}
            setSalaryRange={setSalaryRange}
            deductionWarningFilter={deductionWarningFilter}
            setDeductionWarningFilter={setDeductionWarningFilter}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onViewLoan={(id) => setViewingLoanId(id)}
            onEditLoan={handleOpenLoanForm}
            onDeleteLoan={handleDeleteLoan}
            onOpenPrintPreview={(loan) => handleNavigateToDocumentsTab('temp-08', loan.id)}
            onApproveLoan={handleApproveLoan}
          />
        )}

        {activeTab === 'payments' && (
          <LoanPaymentTrackerTab
            lang={lang}
            loans={loans.filter(l => l.status === LoanStatus.ACTIVE || l.status === LoanStatus.DEFAULTED || l.status === LoanStatus.PAID_IN_FULL)}
            onRecordPayment={handleRecordPayment}
            onRestructureLoan={handleRestructureLoan}
          />
        )}

        {activeTab === 'advances' && (
          <LoanEOSSimulatorTab
            lang={lang}
            employees={employees}
            loans={loans}
            onCommitEOSDeduction={handleCommitEOSDeduction}
            onNavigateToDocument={handleNavigateToDocumentsTab}
          />
        )}

        {activeTab === 'templates' && (
          <LoanDocumentHubTab
            lang={lang}
            loans={loans}
            employees={employees}
            initialSelectedLoanId={initialSelectedLoanId}
            initialSelectedTemplateId={initialSelectedTemplateId}
          />
        )}

        {activeTab === 'aiCopilot' && (
          <Card className="bg-white" title={lang === 'ar' ? 'المساعد القانوني والرقابي التفاعلي للرواتب والأجور' : 'Interactive Labor Law Risk Advisory'}>
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold leading-relaxed">
                <p className="font-black mb-1">🤖 {lang === 'ar' ? 'اسأل المساعد عن المادة ٢٠ و المادة ٥١ لتوليد استشارات سريعة:' : 'Query Labor law compliance advices:'}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button 
                    onClick={() => { setAiPrompt(lang === 'ar' ? 'كيف أضمن عدم تجاوز قسط القرض للـ 10% بموجب المادة 20؟' : 'Explain Art 20 10% limit'); }}
                    className="px-2.5 py-1 text-[10px] font-black bg-indigo-50 border border-indigo-100 rounded text-indigo-700"
                  >
                    {lang === 'ar' ? 'المادة 20 (حد الـ 10% للأقساط)' : 'Art 20 Salary Cap limit'}
                  </button>
                  <button 
                    onClick={() => { setAiPrompt(lang === 'ar' ? 'ما هي رخص الخصم الكامل من مكافأة نهاية الخدمة بموجب المادة 51؟' : 'Explain EOS settlements Art 51'); }}
                    className="px-2.5 py-1 text-[10px] font-black bg-indigo-50 border border-indigo-100 rounded text-indigo-700"
                  >
                    {lang === 'ar' ? 'المادة 51 (التسويات من نهاية الخدمة)' : 'Art 51 EOS Gratutity Clear'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  label={lang === 'ar' ? 'أدخل استفسارك بخصوص نظام الأجور أو الكفلاء الكويتيين:' : 'Enter compliance question'}
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: الحد الأقصى للاستقطاع مادة 20...' : 'e.g., maximum salary deduction limit...'}
                />
                <Button variant="primary" onClick={handleSimulateAiQuestions} disabled={isAiLoading}>
                  {isAiLoading ? (lang === 'ar' ? 'تحليل القيود...' : 'Analyzing constraints...') : (lang === 'ar' ? 'سؤال المستشار القانوني لعدالة' : 'Query Legal Advisor')}
                </Button>
              </div>

              {aiResponse && (
                <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl animate-fade-in-right text-xs leading-relaxed font-bold">
                  <p className="text-indigo-950 font-black mb-1">💡 {lang === 'ar' ? 'المطابقة الاستشارية لعدالة:' : 'Adala Intelligent Legal Advice:'}</p>
                  <p>{aiResponse}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'integrations' && (
          <LoanIntegrationsTab lang={lang} loans={loans} />
        )}
      </div>

      {/* MODAL 1: EDITABLE FILE VIEW WITH INSTALLMENTS AND PAYMENTS */}
      {viewingLoanId && activeViewingLoanObj && (
        <Modal
          isOpen={!!viewingLoanId}
          onClose={() => setViewingLoanId(null)}
          title={lang === 'ar' ? `الملف والذمة المالية للمقترض: ${activeViewingLoanObj.employeeName}` : `Financial folder for ${activeViewingLoanObj.employeeName}`}
          size="xl"
        >
          <div className="space-y-6 text-right max-h-[75vh] overflow-y-auto pr-1">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-bold text-slate-700">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold">{lang === 'ar' ? 'القيمة الأصلية للصرف:' : 'Borrowed Total:'}</p>
                <p className="text-lg font-black text-slate-900">{activeViewingLoanObj.loanAmount.toFixed(3) + " د.ك"}</p>
                <p className="text-[10px] text-slate-400">Ref Code: {activeViewingLoanObj.id}</p>
              </div>
              <div>
                <LoanStatusBadge status={activeViewingLoanObj.status} />
                <p className="text-[10px] mt-1 text-slate-400">{lang === 'ar' ? 'مسجل في:' : 'Logged:'} {activeViewingLoanObj.createdAt}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-xl bg-slate-50/50">
                <p className="text-[10px] text-slate-400">{lang === 'ar' ? 'إجمالي المبالغ المسددة' : 'Paid amount total'}</p>
                <p className="text-lg font-black text-emerald-600">{(activeViewingLoanObj.totalPaidAmount || 0).toFixed(3) + " د.ك"}</p>
              </div>
              <div className="p-4 border rounded-xl bg-slate-50/50">
                <p className="text-[10px] text-slate-400">{lang === 'ar' ? 'الرصيد المتبقي بمحاضر الالتزام' : 'Remaining balance due'}</p>
                <p className="text-lg font-black text-rose-600">{(activeViewingLoanObj.remainingBalance ?? activeViewingLoanObj.loanAmount).toFixed(3) + " د.ك"}</p>
              </div>
            </div>

            {/* Guarantor Details */}
            <div className="p-4 border rounded-xl bg-slate-50/20 space-y-2 text-xs font-bold text-slate-700 leading-relaxed">
              <p className="text-slate-500 font-black border-b pb-1.5 mb-2 flex justify-between">
                <span>{lang === 'ar' ? 'الالتزام والضامن الكفيل:' : 'Guarantor Surety Details:'}</span>
                <span>{activeViewingLoanObj.guarantorName ? (lang === 'ar' ? 'موجد كفالة معتمدة' : 'Guaranteed') : (lang === 'ar' ? 'لا يوجد كفيل مباشر' : 'No personal guarantor')}</span>
              </p>
              {activeViewingLoanObj.guarantorName && (
                <>
                  <p className="flex justify-between"><span>{lang === 'ar' ? 'اسم الكفيل الثلاثي:' : 'Guarantor Name:'}</span><span>{activeViewingLoanObj.guarantorName}</span></p>
                  <p className="flex justify-between"><span>{lang === 'ar' ? 'الرقم المدني للكفيل:' : 'Civil ID:'}</span><span>{activeViewingLoanObj.guarantorCivilId}</span></p>
                </>
              )}
              <p className="flex justify-between"><span>{lang === 'ar' ? 'فترة التقسيط:' : 'Amortization Months:'}</span><span>{activeViewingLoanObj.numberOfInstallments} {lang === 'ar' ? 'أشهر' : 'mon'}</span></p>
              <p className="flex justify-between"><span>{lang === 'ar' ? 'قيمة القسط الشهري مقرر المادة 20:' : 'Deducted monthly installment:'}</span><span>{activeViewingLoanObj.monthlyInstallment.toFixed(3) + " د.ك"}</span></p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="ghost" onClick={() => setViewingLoanId(null)}>
                {lang === 'ar' ? 'إغلاق الملف' : 'Close File'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: ADD/EDIT LOAN FORM MODAL */}
      {isFormOpen && (
        <Modal
          size="lg"
          onClose={() => setIsFormOpen(false)}
          isOpen={isFormOpen}
          title={editingLoan ? (lang === 'ar' ? 'تعديل وصياغة المعاملة التمويلية' : 'Edit Loan Request parameters') : (lang === 'ar' ? 'تأسيس قرار تمويلي / سلفة جديدة للموظف' : 'Establish New Loan Application')}
        >
          <form onSubmit={handleSaveLoanFormSubmit} className="space-y-4 text-right">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-750 mb-1">{lang === 'ar' ? 'اختر الموظف المقترض:' : 'Select employee'}</label>
                <select
                  value={formEmployeeId}
                  onChange={e => setFormEmployeeId(e.target.value)}
                  className="w-full border rounded-xl p-2.5 text-xs font-bold text-slate-700 bg-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.fullNameAr} ({e.nationality})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-750 mb-1">{lang === 'ar' ? 'نوع التمويل والتبويب:' : 'Financing classification'}</label>
                <select
                  value={formLoanType}
                  onChange={e => handleFormLoanTypeChange(e.target.value as LoanType)}
                  className="w-full border rounded-xl p-2.5 text-xs font-bold text-slate-700 bg-white"
                >
                  <option value={LoanType.PERSONAL}>{lang === 'ar' ? 'قرض مالي شخصي طويل الأجل' : LoanType.PERSONAL}</option>
                  <option value={LoanType.SALARY_ADVANCE}>{lang === 'ar' ? 'سلفة على راتب الشهر الحالي (قصيرة الأجل)' : LoanType.SALARY_ADVANCE}</option>
                  <option value={LoanType.HOUSING}>{lang === 'ar' ? 'سلفة إسكانية خاصة' : LoanType.HOUSING}</option>
                  <option value={LoanType.EMERGENCY}>{lang === 'ar' ? 'سلفة علاجية أو طارئة' : LoanType.EMERGENCY}</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label={lang === 'ar' ? 'قيمة مبلغ التمويل المصروف (د.ك):' : 'Financing Principal (KWD)'}
                type="number"
                step="0.001"
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                required
              />

              <Input
                label={lang === 'ar' ? 'تاريخ أول قسط واستحقاق:' : 'First installment due date'}
                type="date"
                value={formRepaymentStartDate}
                onChange={e => setFormRepaymentStartDate(e.target.value)}
                required
              />

              <Input
                label={lang === 'ar' ? 'فترة التقسيط بالشهور (أقساط):' : 'Term period (months)'}
                type="number"
                value={formNumberOfInstallments}
                onChange={e => setFormNumberOfInstallments(e.target.value)}
                required
                disabled={formLoanType === LoanType.SALARY_ADVANCE || formLoanType === LoanType.EMERGENCY}
              />
            </div>

            {formLoanType !== LoanType.SALARY_ADVANCE && formLoanType !== LoanType.EMERGENCY && (
              <div className="p-4 bg-slate-50 border rounded-xl space-y-4">
                <p className="text-xs font-black text-slate-800 border-b pb-1">👤 {lang === 'ar' ? 'الضمانات وهيكل كفيل الموظف:' : 'Personal Guarantor Liability'}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={lang === 'ar' ? 'اسم الكفيل الضامن الثلاثي:' : 'Guarantor Name'}
                    value={formGuarantorName}
                    onChange={e => setFormGuarantorName(e.target.value)}
                  />
                  <Input
                    label={lang === 'ar' ? 'الرقم المدني للكفيل:' : 'Guarantor Civil ID'}
                    value={formGuarantorCivilId}
                    onChange={e => setFormGuarantorCivilId(e.target.value)}
                  />
                </div>
              </div>
            )}

            <TextArea
              label={lang === 'ar' ? 'الغرض وتوصيف الضوابط الائتمانية:' : 'Finance Purpose or reasons'}
              value={formPurpose}
              onChange={e => setFormPurpose(e.target.value)}
              placeholder={lang === 'ar' ? 'اكتب الغرض الإيضاحي من طلب السلفة كويتياً المادة ٢٠...' : 'Explain the reason...'}
            />

            {/* REAL-TIME COMPLIANCE CHECK FOR ARTICLE 20 */}
            {selectedEmployeeForForm && (
              <div className="p-4 rounded-xl border-2 border-slate-100 bg-slate-50 text-right space-y-3">
                <p className="text-[10.5px] font-black text-slate-500 flex items-center gap-1">
                  <span>⚖️</span>
                  <span>{lang === 'ar' ? 'محاكاة ومطابقة آلية للمادة (20) - قانون العمل الكويتي 6/2010:' : 'Kuwait labor Article 20 parameters check:'}</span>
                </p>
                
                <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-700 leading-none">
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">{tLocal.salaryLabel}</p>
                    <p className="text-slate-900 font-extrabold">{selectedEmployeeForForm.basicSalary.toFixed(3)} د.ك</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">{tLocal.maxDeductionAllowed}</p>
                    <p className="text-indigo-600 font-extrabold">{(selectedEmployeeForForm.basicSalary * 0.1).toFixed(3)} د.ك</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 mb-0.5">{tLocal.actualDeduction}</p>
                    <p className={`font-black ${isViolatingKuwaitiCap ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {liveMonthlyInstallment.toFixed(3)} د.ك
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black">
                    <span className={isViolatingKuwaitiCap ? 'text-rose-600' : 'text-emerald-500'}>
                      {tLocal.percentageOfSalary}: {liveDeductionRatio.toFixed(1)}%
                    </span>
                    <span className="text-slate-400">10% Statutory Cap limit</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${isViolatingKuwaitiCap ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (liveDeductionRatio / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                <p className={`text-[10px] font-bold leading-normal flex items-center gap-1 ${isViolatingKuwaitiCap ? 'text-rose-600 bg-rose-50 p-2 rounded-lg border border-rose-100' : 'text-emerald-600 bg-emerald-50/50 p-2 rounded-lg'}`}>
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

            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white py-2 z-10">
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
    </div>
  );
};

export default LoanManagementPage;
