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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'loans' | 'payments' | 'advances' | 'templates' | 'aiCopilot' | 'integrations'>('dashboard');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');

  // Core State Engines
  const [loans, setLoans] = useState<Loan[]>(initialLoans);
  const [logs, setLogs] = useState<LoanActivityLog[]>(initialLoanLogs);
  const [employees] = useState<Employee[]>(initialEmployees as unknown as Employee[]);

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
  const [formAllowAdministrativeOverride, setFormAllowAdministrativeOverride] = useState<boolean>(false);

  // AI interactive helper states
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  // Helper selectors
  const activeViewingLoanObj = useMemo(() => {
    return loans.find(l => l.id === viewingLoanId);
  }, [loans, viewingLoanId]);

  const selectedEmployeeForForm = useMemo(() => {
    return employees.find(e => e.id === formEmployeeId) || employees[0];
  }, [employees, formEmployeeId]);

  // Handle change in selection to default values
  const handleFormLoanTypeChange = (type: LoanType) => {
    setFormLoanType(type);
    if (type === LoanType.SALARY_ADVANCE || type === LoanType.EMERGENCY) {
      setFormNumberOfInstallments('1');
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

  // Smart auto-fix for Article 20 compliance
  const handleAutoFixInstallments = () => {
    if (!selectedEmployeeForForm) return;
    const amountFloat = parseFloat(formAmount) || 0;
    if (amountFloat <= 0) return;
    const maxMonthlyAllowed = selectedEmployeeForForm.basicSalary * 0.10;
    if (maxMonthlyAllowed <= 0) return;
    const requiredMonths = Math.ceil(amountFloat / maxMonthlyAllowed);
    setFormNumberOfInstallments(requiredMonths.toString());
    addToast({
      title: lang === 'ar' ? 'تم الضبط التلقائي للمادة 20' : 'Auto-adjusted for Article 20',
      message: lang === 'ar' ? `تمت زيادة مدة السداد إلى ${requiredMonths} قسطاً شهرياً لتكون نسبة الاستقطاع ${(amountFloat / requiredMonths / selectedEmployeeForForm.basicSalary * 100).toFixed(1)}%` : `Term adjusted to ${requiredMonths} months.`,
      type: 'success'
    });
  };

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
      setFormAllowAdministrativeOverride(false);
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
      setFormAllowAdministrativeOverride(false);
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

    // Strict Enforcement of 10% wage cap validation under Article 20
    if (isViolatingKuwaitiCap && !formAllowAdministrativeOverride) {
      addToast({
        title: lang === 'ar' ? 'مخالفة المادة (20) قانون العمل الكويتي' : 'Article 20 Statutory Violation',
        message: lang === 'ar' ? 'لا يمكن تقديم الطلب لأن القسط الشهري يتجاوز 10% من الراتب الأساسي. يرجى تعديل عدد الأقساط أو استخدام زر الضبط التلقائي.' : 'Installment exceeds 10% basic salary cap. Please adjust term.',
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
          ? (lang === 'ar' ? 'تم قيد الطلب وتحويله للتدقيق لتجاوزه الحد القانوني 10%' : 'Submitted. Under audit due to wage ceiling.')
          : (lang === 'ar' ? 'تم صرف التمويل وترحيله لملف الأجور للموظف' : 'New loan successfully disbursed.'),
        type: isViolatingKuwaitiCap ? 'error' : 'success'
      });
    }
    setIsFormOpen(false);
  };

  // Delete records
  const handleDeleteLoan = (id: string) => {
    const confirmation = window.confirm(lang === 'ar' ? 'هل أنت متأكد تماماً من إزالة وإلغاء هذه المعاملة التمويلية كلياً؟' : 'Are you sure you want to delete this loan?');
    if (confirmation) {
      setLoans(prev => prev.filter(l => l.id !== id));
      addToast({
        title: lang === 'ar' ? 'تم الحذف' : 'Record Deleted',
        message: lang === 'ar' ? 'تمت إزالة المعاملة كلياً وقيد الإلغاء بالسجلات' : 'Loan record successfully expunged.',
        type: 'success'
      });
    }
  };

  // Approve/Reject Action Desk
  const handleApproveLoan = (id: string, step: 'approve' | 'reject' | 'audit') => {
    setLoans(prev => prev.map(l => {
      if (l.id === id) {
        if (step === 'approve') return { ...l, status: LoanStatus.ACTIVE };
        if (step === 'reject') return { ...l, status: LoanStatus.PAID_IN_FULL }; // Or closed
        if (step === 'audit') return { ...l, status: LoanStatus.UNDER_FINANCIAL_REVIEW };
      }
      return l;
    }));

    addToast({
      title: lang === 'ar' ? 'تحديث قرار الاعتماد' : 'Decision Committed',
      message: lang === 'ar' ? `تم اعتماد الإجراء (${step}) للملف رقم ${id}` : `Step ${step} committed for file ${id}`,
      type: 'info'
    });
  };

  // Record a payment directly
  const handleRecordPayment = (loanId: string, instId: string, paidAmount: number, payDate: string) => {
    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        const updatedInstallments = (l.installments || []).map(inst => {
          if (inst.id === instId) {
            return {
              ...inst,
              status: InstallmentStatus.PAID,
              paymentDate: payDate,
              amountPaid: paidAmount
            };
          }
          return inst;
        });

        const newPaidTotal = (l.totalPaidAmount || 0) + paidAmount;
        const newRemaining = Math.max(0, l.loanAmount - newPaidTotal);
        const isFullyPaid = newRemaining === 0;

        return {
          ...l,
          totalPaidAmount: newPaidTotal,
          remainingBalance: newRemaining,
          status: isFullyPaid ? LoanStatus.PAID_IN_FULL : l.status,
          installments: updatedInstallments
        };
      }
      return l;
    }));

    addToast({
      title: lang === 'ar' ? 'تم تسجيل الدفعة' : 'Payment Registered',
      message: lang === 'ar' ? `تم ترحيل سداد بمبلغ ${paidAmount.toFixed(3)} د.ك بنجاح.` : `Payment of ${paidAmount.toFixed(3)} KWD registered.`,
      type: 'success'
    });
  };

  // Restructure a loan
  const handleRestructureLoan = (loanId: string, newMonths: number, newInstallment: number) => {
    setLoans(prev => prev.map(l => {
      if (l.id === loanId) {
        const remaining = l.remainingBalance ?? l.loanAmount;
        const newInstallments: Installment[] = Array.from({ length: newMonths }, (_, i) => {
          const d = new Date();
          d.setMonth(d.getMonth() + (i + 1));
          return {
            id: `inst-restruct-${Date.now()}-${i + 1}`,
            installmentNumber: i + 1,
            dueDate: d.toISOString().split('T')[0],
            amountDue: newInstallment,
            status: InstallmentStatus.UPCOMING
          };
        });

        return {
          ...l,
          numberOfInstallments: newMonths,
          monthlyInstallment: newInstallment,
          installments: newInstallments
        };
      }
      return l;
    }));

    addToast({
      title: lang === 'ar' ? 'تمت إعادة الجدولة' : 'Restructure Applied',
      message: lang === 'ar' ? `تم تمديد فترة السداد إلى ${newMonths} قسطاً شهرياً بقيمة ${newInstallment.toFixed(3)} د.ك لكل قسط.` : `Loan successfully restructured.`,
      type: 'success'
    });
  };

  // Commit EOS Deduction (Article 51 Set-off)
  const handleCommitEOSDeduction = (employeeId: string, remainingBalance: number, finalGratuity: number, netPayable: number) => {
    setLoans(prev => prev.map(l => {
      if (l.employeeId === employeeId && l.status !== LoanStatus.PAID_IN_FULL) {
        return {
          ...l,
          status: LoanStatus.PAID_IN_FULL,
          remainingBalance: 0,
          totalPaidAmount: l.loanAmount,
          notes: (l.notes ? l.notes + ' | ' : '') + `تم سداد المديونية بالكامل عبر الجبر التلقائي والمقاصة من مكافأة نهاية الخدمة (مادة 51)`
        };
      }
      return l;
    }));

    addToast({
      title: lang === 'ar' ? 'تم تنفيذ الجبر التلقائي والمقاصة (مادة 51)' : 'Article 51 Auto Set-Off Executed',
      message: lang === 'ar' 
        ? `تم خصم المديونيات (${remainingBalance.toFixed(3)} د.ك) من إجمالي مكافأة نهاية الخدمة (${finalGratuity.toFixed(3)} د.ك). الصافي المصروف: ${netPayable.toFixed(3)} د.ك.`
        : `EOS Set-off completed.`,
      type: 'success'
    });
  };

  // Bridge to navigate to documents hub
  const handleNavigateToDocumentsTab = (templateId: string, loanId: string) => {
    setInitialSelectedTemplateId(templateId);
    setInitialSelectedLoanId(loanId);
    setActiveTab('templates');
  };

  // AI interactive simulator
  const handleSimulateAiQuestions = () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setTimeout(() => {
      setIsAiLoading(false);
      if (aiPrompt.includes('20') || aiPrompt.includes('استقطاع') || aiPrompt.includes('سقف')) {
        setAiResponse(
          lang === 'ar'
            ? `وفقاً للمادة (20) من قانون العمل الكويتي رقم 6 لسنة 2010، لا يجوز استقطاع أكثر من 10% من أجر العامل وفاءً للديون أو القروض المستحقة لصاحب العمل، ولا يتقاضى صاحب العمل أي فائدة عن هذه القروض. في حال تجاوز هذه النسبة، يعتبر التصرف مخالفاً ويحق للعامل استرداد ما زاد عن الحد القانوني ما لم تكن هناك تسوية نهائية بنهاية الخدمة.`
            : `Under Article 20 of Kuwait Labor Law No. 6/2010, payroll deductions for employer loans are strictly capped at 10% of basic wage with zero interest. Deductions exceeding 10% constitute a statutory labor violation.`
        );
      } else if (aiPrompt.includes('51') || aiPrompt.includes('نهاية الخدمة') || aiPrompt.includes('مكافأة') || aiPrompt.includes('مقاصة')) {
        setAiResponse(
          lang === 'ar'
            ? `إعمالاً للمادة (51) والمادة (20) من قانون العمل الكويتي، عند انتهاء علاقة العمل وتصفية الحسابات، تسقط القيود الشهرية للاستقطاع (10%) ويجوز لصاحب العمل إجراء المقاصة القانونية والجبر التلقائي بخصم كامل رصيد المديونيات والقروض المتبقية من مكافأة نهاية الخدمة وبدل الإجازات بموجب مخالصة معتمدة.`
            : `Under Article 51, upon termination of employment, the employer is legally authorized to execute a complete set-off and deduct all outstanding loan balances from the employee's End of Service indemnity.`
        );
      } else {
        setAiResponse(
          lang === 'ar'
            ? `منظومة عدالة تطبق الضوابط القانونية الكويتية: (1) سقف الاستقطاع الشهري 10% بالمادة 20، (2) الجبر التلقائي من مكافأة نهاية الخدمة بالمادة 51، (3) وجوب إصدار السندات التنفيذية والكمبيالات وفق قانون التجارة الكويتي لضمان حق التنفيذ الجبري وأمر الأداء.`
            : `Adala strictly enforces Kuwait Labor Law 6/2010 (Arts 20 & 51) and Commercial Code (Arts 472-518) for loan repayments and executive enforcement.`
        );
      }
    }, 450);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 1. TOP HEADER & MAIN CONTROLS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 rounded-[2rem] shadow-xs">
        <div className="space-y-1 text-right">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 rounded-xl">
              <ScaleIcon className="w-6 h-6" />
            </span>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              {lang === 'ar' ? 'إدارة الكفالات والقروض والسلف المهنية' : 'Loans, Sureties & Advances Management'}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
            {lang === 'ar' 
              ? 'مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية • متوافق مع قانون العمل الكويتي رقم 6 لسنة 2010 (المادتين 20 و 51) وقانون التجارة رقم 68 لسنة 1980'
              : 'Sabri Shatta Law Firm • Kuwait Labor Law 6/2010 & Commercial Code'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setLang(l => l === 'ar' ? 'en' : 'ar')}
            className="px-3.5 py-2 text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl border-none cursor-pointer hover:bg-slate-200 transition-all"
          >
            🌐 {lang === 'ar' ? 'English' : 'عربي'}
          </button>

          <Button
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs h-10 px-4 flex items-center gap-2 shadow-md cursor-pointer border-none"
            onClick={() => handleOpenLoanForm()}
          >
            <PlusCircleIcon className="w-4 h-4" />
            <span>{lang === 'ar' ? 'صرف تمويل / سلفة جديدة' : 'New Loan Application'}</span>
          </Button>
        </div>
      </div>

      {/* 2. REORGANIZED NAVIGATION TABS */}
      <div className="flex overflow-x-auto gap-1 border-b border-slate-200 dark:border-slate-800 pb-0.5 text-xs font-bold scrollbar-none">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`px-4 py-3 rounded-t-xl transition-all border-none cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dashboard' 
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-black shadow-xs border-b-2 border-indigo-600' 
              : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800'
          }`}
        >
          <ChartBarIcon className="w-4 h-4" />
          <span>{lang === 'ar' ? 'لوحة التحكم والمؤشرات' : 'Dashboard & Analytics'}</span>
        </button>

        <button 
          onClick={() => setActiveTab('loans')}
          className={`px-4 py-3 rounded-t-xl transition-all border-none cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'loans' 
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-black shadow-xs border-b-2 border-indigo-600' 
              : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800'
          }`}
        >
          <FolderIcon className="w-4 h-4" />
          <span>{lang === 'ar' ? 'سجل القروض والسلف' : 'Loan Directory'}</span>
        </button>

        <button 
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-3 rounded-t-xl transition-all border-none cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'payments' 
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-black shadow-xs border-b-2 border-indigo-600' 
              : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800'
          }`}
        >
          <ClockIcon className="w-4 h-4" />
          <span>{lang === 'ar' ? 'متابعة الأقساط والتحصيل' : 'Repayments & Amortization'}</span>
        </button>

        <button 
          onClick={() => setActiveTab('advances')}
          className={`px-4 py-3 rounded-t-xl transition-all border-none cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'advances' 
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-black shadow-xs border-b-2 border-indigo-600' 
              : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800'
          }`}
        >
          <ScaleIcon className="w-4 h-4" />
          <span>{lang === 'ar' ? 'مكافأة نهاية الخدمة والجبر التلقائي (مادة 51)' : 'EOS Gratuity & Debt Offset (Art 51)'}</span>
        </button>

        <button 
          onClick={() => setActiveTab('templates')}
          className={`px-4 py-3 rounded-t-xl transition-all border-none cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'templates' 
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-black shadow-xs border-b-2 border-indigo-600' 
              : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800'
          }`}
        >
          <PrinterIcon className="w-4 h-4" />
          <span>{lang === 'ar' ? 'محرر السندات والنماذج (سند لأمر، إقرار دين، كمبيالة)' : 'Document Hub & Forms (Stamp & QR)'}</span>
        </button>

        <button 
          onClick={() => setActiveTab('aiCopilot')}
          className={`px-4 py-3 rounded-t-xl transition-all border-none cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'aiCopilot' 
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-black shadow-xs border-b-2 border-indigo-600' 
              : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800'
          }`}
        >
          <span>🤖</span>
          <span>{lang === 'ar' ? 'المستشار القانوني للمادة 20 / 51' : 'Labor Compliance Copilot'}</span>
        </button>

        <button 
          onClick={() => setActiveTab('integrations')}
          className={`px-4 py-3 rounded-t-xl transition-all border-none cursor-pointer flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'integrations' 
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-black shadow-xs border-b-2 border-indigo-600' 
              : 'bg-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800'
          }`}
        >
          <span>🔌</span>
          <span>{lang === 'ar' ? 'تكامل الأنظمة والرواتب' : 'ERP Integrations'}</span>
        </button>
      </div>

      {/* 3. ACTIVE VIEWPORT PORTAL */}
      <div className="space-y-6">
        {activeTab === 'dashboard' && (
          <LoanDashboard 
            lang={lang} 
            loans={loans} 
            employees={employees} 
            logs={logs}
            onOpenPrintPreview={(loan) => handleNavigateToDocumentsTab('temp-promissory', loan.id)}
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
            onOpenPrintPreview={(loan) => handleNavigateToDocumentsTab('temp-promissory', loan.id)}
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
          <Card 
            className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-[2rem] shadow-xs" 
            title={lang === 'ar' ? 'المساعد القانوني والرقابي التفاعلي للرواتب والأجور' : 'Interactive Labor Law Risk Advisory'}
          >
            <div className="space-y-4 text-right">
              <div className="p-4 bg-slate-50 dark:bg-[#153042] border border-slate-200/60 dark:border-slate-800 rounded-2xl text-xs font-semibold leading-relaxed">
                <p className="font-black mb-1.5 text-slate-800 dark:text-white">🤖 {lang === 'ar' ? 'اسأل المساعد عن المادة ٢٠ و المادة ٥١ لتوليد استشارات سريعة:' : 'Query Labor law compliance advices:'}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button 
                    onClick={() => { setAiPrompt(lang === 'ar' ? 'كيف أضمن عدم تجاوز قسط القرض للـ 10% بموجب المادة 20؟' : 'Explain Art 20 10% limit'); }}
                    className="px-2.5 py-1.5 text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-lg text-indigo-700 dark:text-indigo-400 cursor-pointer"
                  >
                    {lang === 'ar' ? 'المادة 20 (حد الـ 10% للأقساط)' : 'Art 20 Salary Cap limit'}
                  </button>
                  <button 
                    onClick={() => { setAiPrompt(lang === 'ar' ? 'ما هي رخص الخصم الكامل من مكافأة نهاية الخدمة بموجب المادة 51؟' : 'Explain EOS settlements Art 51'); }}
                    className="px-2.5 py-1.5 text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900 rounded-lg text-indigo-700 dark:text-indigo-400 cursor-pointer"
                  >
                    {lang === 'ar' ? 'المادة 51 (التسويات من نهاية الخدمة)' : 'Art 51 EOS Gratuity Clear'}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Input
                  className="dark:bg-[#153042] dark:text-white text-right"
                  label={lang === 'ar' ? 'أدخل استفسارك بخصوص نظام الأجور أو الكفلاء الكويتيين:' : 'Enter compliance question'}
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder={lang === 'ar' ? 'مثال: الحد الأقصى للاستقطاع مادة 20...' : 'e.g., maximum salary deduction limit...'}
                />
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 border-none cursor-pointer mt-2"
                  variant="primary" 
                  onClick={handleSimulateAiQuestions} 
                  disabled={isAiLoading}
                >
                  {isAiLoading ? (lang === 'ar' ? 'تحليل القيود...' : 'Analyzing constraints...') : (lang === 'ar' ? 'سؤال المستشار القانوني لعدالة' : 'Query Legal Advisor')}
                </Button>
              </div>

              {aiResponse && (
                <div className="p-5 bg-indigo-50/30 dark:bg-[#153042] border border-indigo-150 dark:border-indigo-900/60 rounded-2xl animate-fade-in-right text-xs leading-relaxed font-bold text-slate-800 dark:text-white">
                  <p className="text-indigo-950 dark:text-indigo-400 font-black mb-1">💡 {lang === 'ar' ? 'المطابقة الاستشارية لعدالة:' : 'Adala Intelligent Legal Advice:'}</p>
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

      {/* MODAL 1: VIEW FILE MODAL */}
      {viewingLoanId && activeViewingLoanObj && (
        <Modal
          isOpen={!!viewingLoanId}
          onClose={() => setViewingLoanId(null)}
          title={lang === 'ar' ? `الملف والذمة المالية للمقترض: ${activeViewingLoanObj.employeeName}` : `Financial folder for ${activeViewingLoanObj.employeeName}`}
          size="xl"
        >
          <div className="space-y-6 text-right max-h-[75vh] overflow-y-auto pr-1 dark:text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="space-y-1 text-right">
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">{lang === 'ar' ? 'القيمة الأصلية للصرف:' : 'Borrowed Total:'}</p>
                <p className="text-lg font-black text-slate-900 dark:text-white font-mono">{activeViewingLoanObj.loanAmount.toFixed(3)} د.ك</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Ref Code: {activeViewingLoanObj.id}</p>
              </div>
              <div className="flex flex-col items-end">
                <LoanStatusBadge status={activeViewingLoanObj.status} />
                <p className="text-[10px] mt-1.5 text-slate-400 dark:text-slate-500">{lang === 'ar' ? 'مسجل في:' : 'Logged:'} {activeViewingLoanObj.createdAt}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{lang === 'ar' ? 'إجمالي المبالغ المسددة' : 'Paid amount total'}</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 font-mono">{(activeViewingLoanObj.totalPaidAmount || 0).toFixed(3)} د.ك</p>
              </div>
              <div className="p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">{lang === 'ar' ? 'الرصيد المتبقي بمحاضر الالتزام' : 'Remaining balance due'}</p>
                <p className="text-lg font-black text-rose-600 dark:text-rose-400 font-mono">{(activeViewingLoanObj.remainingBalance ?? activeViewingLoanObj.loanAmount).toFixed(3)} د.ك</p>
              </div>
            </div>

            {/* Guarantor Details */}
            <div className="p-4 border border-slate-200/60 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-950 space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300 leading-relaxed">
              <p className="text-slate-500 dark:text-slate-400 font-black border-b border-slate-200/50 dark:border-slate-800 pb-1.5 mb-2 flex justify-between">
                <span>{lang === 'ar' ? 'الالتزام والضامن الكفيل:' : 'Guarantor Surety Details:'}</span>
                <span>{activeViewingLoanObj.guarantorName ? (lang === 'ar' ? 'يوجد كفالة معتمدة' : 'Guaranteed') : (lang === 'ar' ? 'لا يوجد كفيل مباشر' : 'No personal guarantor')}</span>
              </p>
              {activeViewingLoanObj.guarantorName && (
                <>
                  <p className="flex justify-between"><span>{lang === 'ar' ? 'اسم الكفيل الثلاثي:' : 'Guarantor Name:'}</span><span>{activeViewingLoanObj.guarantorName}</span></p>
                  <p className="flex justify-between"><span>{lang === 'ar' ? 'الرقم المدني للكفيل:' : 'Civil ID:'}</span><span className="font-mono">{activeViewingLoanObj.guarantorCivilId}</span></p>
                </>
              )}
              <p className="flex justify-between"><span>{lang === 'ar' ? 'فترة التقسيط:' : 'Amortization Months:'}</span><span>{activeViewingLoanObj.numberOfInstallments} {lang === 'ar' ? 'أشهر' : 'mon'}</span></p>
              <p className="flex justify-between"><span>{lang === 'ar' ? 'قيمة القسط الشهري مقرر المادة 20:' : 'Deducted monthly installment:'}</span><span className="font-mono">{activeViewingLoanObj.monthlyInstallment.toFixed(3)} د.ك</span></p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border-none h-10 cursor-pointer" variant="ghost" onClick={() => setViewingLoanId(null)}>
                {lang === 'ar' ? 'إغلاق الملف' : 'Close File'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: ADD/EDIT LOAN FORM WITH AUTOMATIC ARTICLE 20 VALIDATOR */}
      {isFormOpen && (
        <Modal
          size="lg"
          onClose={() => setIsFormOpen(false)}
          isOpen={isFormOpen}
          title={editingLoan ? (lang === 'ar' ? 'تعديل وصياغة المعاملة التمويلية' : 'Edit Loan Request') : (lang === 'ar' ? 'تأسيس قرار تمويلي / سلفة جديدة للموظف' : 'Establish New Loan Application')}
        >
          <form onSubmit={handleSaveLoanFormSubmit} className="space-y-4 text-right" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-slate-750 dark:text-slate-300 mb-1.5">{lang === 'ar' ? 'اختر الموظف المقترض:' : 'Select employee'}</label>
                <select
                  value={formEmployeeId}
                  onChange={e => setFormEmployeeId(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-950 outline-none"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.fullNameAr} ({e.nationality} - راتبه: {e.basicSalary.toFixed(3)} د.ك)</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-750 dark:text-slate-300 mb-1.5">{lang === 'ar' ? 'نوع التمويل والتبويب:' : 'Financing classification'}</label>
                <select
                  value={formLoanType}
                  onChange={e => handleFormLoanTypeChange(e.target.value as LoanType)}
                  className="w-full border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-bold text-slate-700 dark:text-white bg-white dark:bg-slate-950 outline-none"
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
                className="dark:bg-slate-950 dark:text-white text-right font-mono"
                label={lang === 'ar' ? 'قيمة مبلغ التمويل المصروف (د.ك):' : 'Financing Principal (KWD)'}
                type="number"
                step="0.001"
                value={formAmount}
                onChange={e => setFormAmount(e.target.value)}
                required
              />

              <Input
                className="dark:bg-slate-950 dark:text-white text-right"
                label={lang === 'ar' ? 'تاريخ أول قسط واستحقاق:' : 'First installment due date'}
                type="date"
                value={formRepaymentStartDate}
                onChange={e => setFormRepaymentStartDate(e.target.value)}
                required
              />

              <Input
                className="dark:bg-slate-950 dark:text-white text-right font-mono"
                label={lang === 'ar' ? 'فترة التقسيط بالشهور (أقساط):' : 'Term period (months)'}
                type="number"
                value={formNumberOfInstallments}
                onChange={e => setFormNumberOfInstallments(e.target.value)}
                required
                disabled={formLoanType === LoanType.SALARY_ADVANCE || formLoanType === LoanType.EMERGENCY}
              />
            </div>

            {formLoanType !== LoanType.SALARY_ADVANCE && formLoanType !== LoanType.EMERGENCY && (
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 rounded-2xl space-y-4">
                <p className="text-xs font-black text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1.5">👤 {lang === 'ar' ? 'الضمانات وهيكل كفيل الموظف:' : 'Personal Guarantor Liability'}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    className="dark:bg-slate-900 dark:text-white text-right"
                    label={lang === 'ar' ? 'اسم الكفيل الضامن الثلاثي:' : 'Guarantor Name'}
                    value={formGuarantorName}
                    onChange={e => setFormGuarantorName(e.target.value)}
                  />
                  <Input
                    className="dark:bg-slate-900 dark:text-white text-right font-mono"
                    label={lang === 'ar' ? 'الرقم المدني للكفيل:' : 'Guarantor Civil ID'}
                    value={formGuarantorCivilId}
                    onChange={e => setFormGuarantorCivilId(e.target.value)}
                  />
                </div>
              </div>
            )}

            <TextArea
              className="dark:bg-slate-950 dark:text-white text-right"
              label={lang === 'ar' ? 'الغرض وتوصيف الضوابط الائتمانية:' : 'Finance Purpose or reasons'}
              value={formPurpose}
              onChange={e => setFormPurpose(e.target.value)}
              placeholder={lang === 'ar' ? 'اكتب الغرض الإيضاحي من طلب السلفة كويتياً المادة ٢٠...' : 'Explain the reason...'}
            />

            {/* REAL-TIME VALIDATION AND COMPLIANCE CHECK FOR ARTICLE 20 */}
            {selectedEmployeeForForm && (
              <div className={`p-4 rounded-xl border-2 text-right space-y-3 ${
                isViolatingKuwaitiCap 
                  ? 'border-rose-300 dark:border-rose-900 bg-rose-50/40 dark:bg-rose-950/20' 
                  : 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10'
              }`}>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                    <span>⚖️</span>
                    <span>{lang === 'ar' ? 'التحقق الآلي من حد الاستقطاع (المادة 20 - سقف 10% من الراتب الأساسي):' : 'Statutory Wage Cap Validation (Article 20 - 10% Limit):'}</span>
                  </p>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                    isViolatingKuwaitiCap 
                      ? 'bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200' 
                      : 'bg-emerald-200 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                  }`}>
                    {isViolatingKuwaitiCap ? (lang === 'ar' ? '⚠️ مخالف لسقف 10%' : 'Over 10% Cap') : (lang === 'ar' ? '✓ متوافق قانونياً' : 'Compliant')}
                  </span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-700 dark:text-slate-350">
                  <div>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 mb-1">{lang === 'ar' ? 'الراتب الأساسي:' : 'Basic Salary:'}</p>
                    <p className="text-slate-900 dark:text-white font-mono font-black">{selectedEmployeeForForm.basicSalary.toFixed(3)} د.ك</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 mb-1">{lang === 'ar' ? 'الحد الأقصى المسموح (10%):' : 'Max 10% Cap:'}</p>
                    <p className="text-emerald-600 dark:text-emerald-400 font-mono font-black">{(selectedEmployeeForForm.basicSalary * 0.1).toFixed(3)} د.ك</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-450 dark:text-slate-500 mb-1">{lang === 'ar' ? 'القسط الشهري المقترح:' : 'Proposed Installment:'}</p>
                    <p className={`font-mono font-black ${isViolatingKuwaitiCap ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {liveMonthlyInstallment.toFixed(3)} د.ك
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[10px] font-black">
                    <span className={isViolatingKuwaitiCap ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {lang === 'ar' ? 'نسبة الاستقطاع الفعلية:' : 'Actual Wage Ratio:'} {liveDeductionRatio.toFixed(1)}%
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">10.0% Max Statutory Ceiling</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${isViolatingKuwaitiCap ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (liveDeductionRatio / 10) * 100)}%` }}
                    ></div>
                  </div>
                </div>

                {isViolatingKuwaitiCap && (
                  <div className="p-3 bg-rose-100/60 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl space-y-2 text-xs">
                    <p className="text-rose-900 dark:text-rose-200 font-bold leading-relaxed">
                      ⚠️ {lang === 'ar'
                        ? `تنبيه مخالفة قانونية: القسط الشهري (${liveMonthlyInstallment.toFixed(3)} د.ك) يتجاوز سقف الاستقطاع القانوني (10% = ${(selectedEmployeeForForm.basicSalary * 0.1).toFixed(3)} د.ك) بموجب المادة 20 من قانون العمل الكويتي رقم 6 لسنة 2010.`
                        : `Violation: Monthly installment exceeds 10% statutory limit under Kuwait Labor Law 6/2010.`}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={handleAutoFixInstallments}
                        className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black text-xs border-none cursor-pointer shadow-xs flex items-center gap-1.5"
                      >
                        ⚡ {lang === 'ar' ? 'ضبط تلقائي لعدد الأقساط ليتوافق مع المادة 20' : 'Auto-adjust term to comply with 10% cap'}
                      </button>

                      <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={formAllowAdministrativeOverride}
                          onChange={e => setFormAllowAdministrativeOverride(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{lang === 'ar' ? 'طلب استثناء إداري مسبب معتمد' : 'Administrative Exception Waiver'}</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 bg-white dark:bg-slate-900 py-2 z-10">
              <Button className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl border-none h-10 cursor-pointer" type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 border-none cursor-pointer font-black" 
                type="submit" 
                variant="primary"
                disabled={isViolatingKuwaitiCap && !formAllowAdministrativeOverride}
              >
                {lang === 'ar' ? 'صرف وترحيل القيد للرواتب' : 'Confirm & Commit Credit'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default LoanManagementPage;
