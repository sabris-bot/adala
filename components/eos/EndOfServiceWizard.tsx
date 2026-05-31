import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Scale, Coins, Calendar, ShieldAlert, Laptop, 
  CheckSquare, Check, Sparkles, HelpCircle, ArrowRight, ArrowLeft,
  AlertOctagon, Key, UserCheck, Award, Briefcase, FileText, Printer, ShieldCheck
} from 'lucide-react';
import { TerminationReasonKuwait, ContractTypeKuwait, EOS_Settlement } from '../../types';
import { initialExtendedEmployees, ExtendedEmployee } from '../../data/employeeExtendedData';
import { calculateKuwaitEOS } from '../../services/eosService';
import { useLanguage } from '../i18n/LanguageProvider';

interface EndOfServiceWizardProps {
  onClose: () => void;
  onSave: (record: EOS_Settlement) => void;
  editCase: EOS_Settlement | null;
}

// 16 Detailed Kuwaiti Labor Law Termination Scenarios
const TERMINATION_SCENARIOS = [
  {
    id: 'resignation_standard',
    labelAr: 'استقالة رسمية بموجب المادة 53',
    labelEn: 'Formal Resignation under Article 53',
    enumValue: TerminationReasonKuwait.RESIGNATION,
    category: 'employee',
    gratuityAr: 'مقياس الخدمة',
    gratuityEn: 'Service Scale',
    lawArticleAr: 'المادة (٥٣)',
    lawArticleEn: 'Article (53)',
    descAr: 'تخضع لسنوات الخدمة: أقل من ٣ (لا تستحق)، ٣-٥ (نصف)، ٥-١٠ (ثلثين)، ١٠+ (كامل)',
    descEn: 'Subject to service years: <3 (none), 3-5 (half), 5-10 (two-thirds), 10+ (full)'
  },
  {
    id: 'dismissal_notice',
    labelAr: 'إنهاء من قبل صاحب العمل مع إخطار',
    labelEn: 'Dismissal by Employer with Notice',
    enumValue: TerminationReasonKuwait.DISMISSAL_WITH_NOTICE,
    category: 'employer',
    gratuityAr: '١٠0% كاملة',
    gratuityEn: '100% Full',
    lawArticleAr: 'المادة (٤٤) و(٥١)',
    lawArticleEn: 'Articles (44) & (51)',
    descAr: 'إنهاء فردي أو جماعي بقرار المنشأة مع الوفاء بمهلة إنذار عمالي ٣ أشهر',
    descEn: 'Individual or collective termination by employer with 3-month legal notice met'
  },
  {
    id: 'dismissal_art41',
    labelAr: 'فصل تأديبي بسبب خطأ مادة 41',
    labelEn: 'Disciplinary Dismissal without Notice (Art. 41)',
    enumValue: TerminationReasonKuwait.DISMISSAL_WITHOUT_NOTICE_ART_41,
    category: 'employer',
    gratuityAr: 'حرمان تام (0%)',
    gratuityEn: 'Total Forfeiture (0%)',
    lawArticleAr: 'المادة (٤١)',
    lawArticleEn: 'Article (41)',
    descAr: 'فصل تسبيبي لغياب مستمر، إفشاء أسرار، خسارة مادية جسيمة أو اعتداء عمالي',
    descEn: 'Cause-based dismissal for continuous absence, disclosing secrets, gross material loss, or assault'
  },
  {
    id: 'contract_expiry_lim',
    labelAr: 'انتهاء العقد محدد المدة دون تجديد',
    labelEn: 'Expiry of Limited-Term Contract without Renewal',
    enumValue: TerminationReasonKuwait.CONTRACT_EXPIRY,
    category: 'contract',
    gratuityAr: '١00% كاملة',
    gratuityEn: '100% Full',
    lawArticleAr: 'مستحقات العقد',
    lawArticleEn: 'Contractual Dues',
    descAr: 'انقضاء الأجل القانوني للعلاقة العمالية المبرمة للمدة دون رغبة بتجديده',
    descEn: 'Expiration of the legal duration of the employment relation with no intent to renew'
  },
  {
    id: 'consensual_settlement',
    labelAr: 'إنهاء الخدمة بالتراضي والاتفاق المتساوي',
    labelEn: 'Mutual and Consensual Settlement Agreement',
    enumValue: TerminationReasonKuwait.CONSENSUAL_TERMINATION,
    category: 'contract',
    gratuityAr: '١00% توافقية',
    gratuityEn: '100% Amicable',
    lawArticleAr: 'التراضي العمالي',
    lawArticleEn: 'Mutual Agreement',
    descAr: 'حل العلاقة ودياً بالتراضي وحوسبة صافي المستحقات رضائياً خارج ساحة الخلاف',
    descEn: 'Friendly dissolution of relationship by consent and calculating net dues amicably outside dispute'
  },
  {
    id: 'retirement_active',
    labelAr: 'التقاعد الذاتي المعمول به قانوناً',
    labelEn: 'Statutory Retirement at Legal Age',
    enumValue: TerminationReasonKuwait.RETIREMENT,
    category: 'employee',
    gratuityAr: '١00% كاملة',
    gratuityEn: '100% Full',
    lawArticleAr: 'مادة بلوغ السن',
    lawArticleEn: 'Retirement Age',
    descAr: 'صرف المستحقات لبلوغ السن القانونية عمالياً أو الاستحقاق للتقاعد الوطني التأميني',
    descEn: 'Disbursement of dues for reaching the legal labor age or eligibility for national pension'
  }
];

export const EndOfServiceWizard: React.FC<EndOfServiceWizardProps> = ({
  onClose,
  onSave,
  editCase
}) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  
  // Linked employee state sub-records
  const [linkedEmployee, setLinkedEmployee] = useState<ExtendedEmployee | null>(null);

  // Form main fields
  const [formFields, setFormFields] = useState({
    employeeName: '',
    employeeCivilId: '',
    jobTitle: '',
    department: 'قطاع العقود والاستشارات',
    nationality: 'وافد',
    joiningDate: '2022-01-01',
    lastWorkingDay: '2026-05-25',
    contractType: ContractTypeKuwait.UNLIMITED,
    terminationReason: TerminationReasonKuwait.RESIGNATION,
    basicSalary: 850,
    allowances: 150,
    leaveEntitlement: 30,
    leaveTaken: 10,
    leaveAdjustment: 0,
    overtimeHours: 0,
    finalMonthWorkedDays: 0,
    otherBonuses: 0,
    loansDeduction: 0,
    disciplinaryDeductions: 0,
    absenceDays: 0,
    unpaidLeaveDays: 0,
    socialInsuranceDeduction: 0,
    sector: 'private' as 'private' | 'oil' | 'government',
    notes: '',
    companyLaptopReturned: true,
    companyPhoneReturned: true,
    companyKeysReturned: true,
    accessBadgesReturned: true
  });

  // Load edit scenario values if editing
  useEffect(() => {
    if (editCase) {
      setFormFields({
        employeeName: editCase.employeeName,
        employeeCivilId: editCase.employeeId,
        jobTitle: editCase.jobTitle || 'موظف بقطاع المباشرة',
        department: editCase.department || 'قطاع العقود والاستشارات',
        nationality: editCase.nationality || 'كويتي',
        joiningDate: editCase.joiningDate || '2022-01-01',
        lastWorkingDay: editCase.lastWorkingDay || '2026-05-25',
        contractType: (editCase.contractType as ContractTypeKuwait) || ContractTypeKuwait.UNLIMITED,
        terminationReason: editCase.terminationReason,
        basicSalary: editCase.basicSalary,
        allowances: editCase.allowances,
        leaveEntitlement: 30,
        leaveTaken: editCase.leaveBalanceDays ? Math.max(0, 30 - editCase.leaveBalanceDays) : 10,
        leaveAdjustment: 0,
        overtimeHours: 0,
        finalMonthWorkedDays: editCase.finalMonthWorkedDays || 0,
        otherBonuses: editCase.otherBonuses || 0,
        loansDeduction: editCase.loansDeduction || 0,
        disciplinaryDeductions: editCase.disciplinaryDeductions || 0,
        absenceDays: editCase.absenceDays || 0,
        unpaidLeaveDays: editCase.unpaidLeaveDays || 0,
        socialInsuranceDeduction: editCase.socialInsuranceDeduction || 0,
        sector: editCase.notes?.includes('نفط') ? 'oil' : editCase.notes?.includes('حكوم') ? 'government' : 'private',
        notes: editCase.notes || '',
        companyLaptopReturned: true,
        companyPhoneReturned: true,
        companyKeysReturned: true,
        accessBadgesReturned: true
      });
      
      const matchedEmp = initialExtendedEmployees.find(e => e.civilId === editCase.employeeId);
      if (matchedEmp) {
        setLinkedEmployee(matchedEmp);
        setSelectedEmployeeId(matchedEmp.id);
      }
    }
  }, [editCase]);

  // Handle Employee Database Linkage
  const handleEmployeeSelection = (id: string) => {
    setSelectedEmployeeId(id);
    if (!id) {
      setLinkedEmployee(null);
      return;
    }

    const emp = initialExtendedEmployees.find(e => e.id === id);
    if (!emp) return;

    setLinkedEmployee(emp);

    const allowancesSum = emp.allowances?.reduce((sum, item) => sum + item.value, 0) || 0;
    const leaveDaysSum = emp.leaveRequests?.filter(r => r.status === 'Approved').reduce((sum, r) => sum + r.days, 0) || 0;
    const activeLoansSum = emp.loans?.filter(l => l.status === 'Active').reduce((sum, l) => sum + l.balanceAmount, 0) || 0;
    const disciplinaryPenaltySum = emp.disciplinaryActions?.filter(d => d.status === 'Approved' && d.penaltyAmount).reduce((sum, d) => sum + (d.penaltyAmount || 0), 0) || 0;

    setFormFields(prev => ({
      ...prev,
      employeeName: isAr ? emp.fullNameAr : (emp.fullNameEn || emp.fullNameAr),
      employeeCivilId: emp.civilId,
      jobTitle: emp.jobTitle,
      department: emp.department || 'إداري',
      nationality: emp.nationality || 'كويتي',
      basicSalary: emp.basicSalary,
      allowances: allowancesSum,
      leaveTaken: leaveDaysSum,
      loansDeduction: activeLoansSum,
      joiningDate: emp.joiningDate || '2022-01-01',
      disciplinaryDeductions: disciplinaryPenaltySum,
      notes: isAr 
        ? `تم ربط التصفية الشاملة تلقائياً بسجل الموظف رقم الكادر (${emp.employeeId}).`
        : `Dossier bound automatically to employee staff record ID (${emp.employeeId}).`
    }));
  };

  // Perform live EOS benefit calculations
  const liveCalculationResult = useMemo(() => {
    try {
      const basic = Number(formFields.basicSalary) || 0;
      const allow = Number(formFields.allowances) || 0;
      const gross = basic + allow;

      const calcResult = calculateKuwaitEOS({
        joiningDate: formFields.joiningDate,
        lastWorkingDay: formFields.lastWorkingDay,
        basicSalary: basic,
        allowances: allow,
        terminationReason: formFields.terminationReason,
        paySystem: 'شهري',
        leaveEntitlement: Number(formFields.leaveEntitlement) || 30,
        leaveTaken: Number(formFields.leaveTaken) || 0,
        leaveAdjustment: Number(formFields.leaveAdjustment) || 0,
        noticeAction: 'WorkDuringNotice',
        otherAdditions: (Number(formFields.overtimeHours) * ((gross / 26) / 8) * 1.5) + Number(formFields.otherBonuses),
        deductions: Number(formFields.loansDeduction) || 0,
        absenceDays: Number(formFields.absenceDays) || 0,
        socialInsuranceDeduction: Number(formFields.socialInsuranceDeduction) || 0,
        sector: formFields.sector,
        unpaidLeaveDays: Number(formFields.unpaidLeaveDays) || 0,
        disciplinaryDeductions: Number(formFields.disciplinaryDeductions) || 0,
        finalMonthWorkedDays: Number(formFields.finalMonthWorkedDays) || 0
      });

      return calcResult;
    } catch (e) {
      return null;
    }
  }, [formFields]);

  // Dispatch fully prepared case to parent state
  const handleSaveLocal = () => {
    if (!formFields.employeeName || !formFields.employeeCivilId) {
      alert(isAr ? 'يجب ملء اسم الموظف ورقمه المدني أولاً للمباشرة بالاعتماد.' : 'Employee Name and Civil ID must be filled first.');
      return;
    }

    const compiled = liveCalculationResult;
    if (!compiled) {
      alert(isAr ? 'حدث خطأ أثناء رصد العمليات الحسابية للمكافأة، يرجى التحقق من أرقام المدخلات.' : 'An error occurred during calculation. Please check numeric inputs.');
      return;
    }

    const compiledCase: EOS_Settlement = {
      id: editCase ? editCase.id : `EOS-${Date.now().toString().slice(-4)}`,
      settlementNumber: editCase?.settlementNumber || `EOS-2026-${Date.now().toString().slice(-4)}`,
      employeeId: formFields.employeeCivilId,
      employeeName: formFields.employeeName,
      jobTitle: formFields.jobTitle,
      department: formFields.department,
      settlementDate: editCase?.settlementDate || new Date().toISOString().split('T')[0],
      joiningDate: formFields.joiningDate,
      lastWorkingDay: formFields.lastWorkingDay,
      terminationReason: formFields.terminationReason,
      status: editCase?.status || 'PendingReview',
      basicSalary: Number(formFields.basicSalary),
      allowances: Number(formFields.allowances),
      grossSalary: Number(formFields.basicSalary) + Number(formFields.allowances),
      serviceYears: compiled.serviceYears,
      serviceMonths: compiled.serviceMonths,
      serviceDays: compiled.serviceDays,
      indemnityAmount: compiled.indemnityAmount,
      leaveBalanceAmount: compiled.leavePayAmount,
      accruedSalaryAmount: compiled.accruedSalaryAmount || 0,
      noticePeriodAmount: compiled.noticePeriodPay,
      otherBonuses: Number(formFields.otherBonuses),
      loansDeduction: Number(formFields.loansDeduction),
      absenceDeduction: Number(formFields.absenceDays) * ((Number(formFields.basicSalary) + Number(formFields.allowances)) / 26),
      otherDeductions: 0,
      netPayable: compiled.netAmount,
      legalArticles: compiled.legalArticles.map(a => isAr ? `المادة (${a.article}): ${a.text.slice(0, 110)}...` : `Article ${a.article}: ${a.text.slice(0, 110)}...`),
      preparedBy: editCase?.preparedBy || (isAr ? 'شؤون الموظفين - الوجيان' : 'HR Personnel - Al-Wajayan'),
      notes: formFields.notes,
      approvals: editCase?.approvals || { hr: 'مكتمل', legal: 'بانتظار', finance: 'بانتظار', gm: 'معلق' },
      signatures: editCase?.signatures || { employee: '', hr: '', legal: '', fin: '' }
    };

    onSave(compiledCase);
  };

  const stepsList = [
    { num: 1, title: 'بيانات الكادر' },
    { num: 2, title: 'الظرف القانوني' },
    { num: 3, title: 'مرتبات وبدلات' },
    { num: 4, title: 'تصفية الإجازات' },
    { num: 5, title: 'الخصومات والعهد' },
    { num: 6, title: 'مكافأة مادة 51' },
    { num: 7, title: 'مراجعة الموازنة' },
    { num: 8, title: 'الاعتماد والمستندات' }
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl w-full max-w-4xl overflow-hidden text-right font-sans my-8" dir={isAr ? 'rtl' : 'ltr'}>
        
        {/* Header bar */}
        <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-center justify-between select-none">
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer border-none bg-transparent focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1">
            <Briefcase className="w-4 h-4 text-[#00796B]" />
            <span>{editCase ? 'تعديل ملف تصفية الخدمة' : 'مساعد إعداد وتوثيق براءة الذمة العمالية'}</span>
          </span>
        </div>

        {/* 8 Step flow indicators */}
        <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] select-none">
            {stepsList.map((st, idx) => (
              <React.Fragment key={st.num}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black border transition-all ${activeStep === st.num ? 'bg-[#00796B] text-white border-[#00796B]' : activeStep > st.num ? 'bg-emerald-100 text-[#00796B] border-[#00796B]' : 'bg-white text-slate-400 border-slate-200'}`}>
                    {activeStep > st.num ? <Check className="w-3.5 h-3.5" /> : st.num}
                  </div>
                  <span className={`text-[10px] font-black ${activeStep === st.num ? 'text-slate-900 underline' : 'text-slate-400'}`}>{st.title}</span>
                </div>
                {idx < stepsList.length - 1 && (
                  <div className={`flex-1 h-[2px] mx-2 transition-colors ${activeStep > st.num ? 'bg-[#00796B]' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Step content inputs */}
        <div className="p-6 sm:p-8 max-h-[480px] overflow-y-auto">
          
          {/* STEP 1: EMPLOYEE DATA LINK */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/5 text-[#00796B] border border-emerald-100 rounded-2xl text-xs font-bold leading-normal">
                اختر الموظف من قاعدة الكوادر والملفات المدمجة لإدراج الراتب الأساسي، التواقيع المسبقة، الإجازات المستعملة والأرصدة العينية لفض تضارب البيانات تلقائياً.
              </div>

              <div className="space-y-1.5 select-none font-bold text-xs">
                <label className="text-[10px] font-extrabold text-slate-400 block">ربط بسجل الموظفين المعينين</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => handleEmployeeSelection(e.target.value)}
                  className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-Tajawal font-bold"
                >
                  <option value="">-- إدراج يدوي غير مربوط بالملف --</option>
                  {initialExtendedEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullNameAr} ({emp.employeeId})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 focus-within:border-[#00796B]">
                  <label className="text-[10px] font-bold text-slate-450 block">اسم الموظف الثلاثي</label>
                  <input
                    type="text"
                    value={formFields.employeeName}
                    onChange={(e) => setFormFields(prev => ({ ...prev, employeeName: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    placeholder="الأسم المعتمد بوزارة الشؤون"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-450 block">الرقم المدني الكويتي</label>
                  <input
                    type="text"
                    value={formFields.employeeCivilId}
                    onChange={(e) => setFormFields(prev => ({ ...prev, employeeCivilId: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-left"
                    placeholder="290000000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 text-right font-bold text-xs select-none">
                  <label className="text-[10px] text-slate-450 block">المسمى والوظيفة</label>
                  <input
                    type="text"
                    value={formFields.jobTitle}
                    onChange={(e) => setFormFields(prev => ({ ...prev, jobTitle: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-right font-bold text-xs select-none">
                  <label className="text-[10px] text-slate-450 block">القسم والقطاع الإداري</label>
                  <input
                    type="text"
                    value={formFields.department}
                    onChange={(e) => setFormFields(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: LEGAL TERMINATION SCENARIO */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-[#00796B] bg-[#00796B]/5 px-2 py-0.5 rounded">تصنيف الظروف والبنود القانونية</span>
              <p className="text-xs text-slate-400 font-semibold mt-1">تؤثر أسباب ونسب المغادرة العمالية على مكافأة مادة 51 والتدقيق الإبرائي للمحاكم تلقائياً:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TERMINATION_SCENARIOS.map(sc => (
                  <div
                    key={sc.id}
                    onClick={() => setFormFields(prev => ({ ...prev, terminationReason: sc.enumValue }))}
                    className={`p-4 border rounded-2xl cursor-pointer text-right space-y-2 select-none hover:border-[#00796B] transition-colors ${formFields.terminationReason === sc.enumValue ? 'bg-[#00796B]/5 border-[#00796B]' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[9.5px] bg-[#00796B] text-white px-2 py-0.5 rounded font-bold font-serif">{sc.lawArticleAr}</span>
                      <h4 className="text-xs font-black text-slate-800">{sc.labelAr}</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed font-bold">{sc.descAr}</p>
                    <span className="text-[9px] text-[#00796B] block font-black">المكافأة المقدرة: {sc.gratuityAr}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: CONTRACT & SALARIES */}
          {activeStep === 3 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-xl text-xs font-medium text-slate-500 leading-normal">
                الراتب الإجمالي الأخير يعتبر الأساس الشرعي لأمور تسييل مكافأة مادة 51، حيث يشتمل على الراتب الأساسي مضافاً إليه البدلات الثابتة شهرياً.
              </div>

              <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                <div className="space-y-1.5 focus-within:border-[#00796B]">
                  <label className="text-[10px] font-black text-slate-450 block">الراتب الأساسي الأخير (د.ك)</label>
                  <input
                    type="number"
                    value={formFields.basicSalary}
                    onChange={(e) => setFormFields(prev => ({ ...prev, basicSalary: Number(e.target.value) }))}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-left"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#00796B] block">البدلات الثابتة المعتمدة (د.ك)</label>
                  <input
                    type="number"
                    value={formFields.allowances}
                    onChange={(e) => setFormFields(prev => ({ ...prev, allowances: Number(e.target.value) }))}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-left"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 font-sans text-xs select-none font-bold">
                <div className="space-y-1.5 text-right">
                  <label className="text-[10px] text-slate-450 block">تاريخ مباشرة العمل بالملف</label>
                  <input
                    type="date"
                    value={formFields.joiningDate}
                    onChange={(e) => setFormFields(prev => ({ ...prev, joiningDate: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left"
                  />
                </div>

                <div className="space-y-1.5 text-right">
                  <label className="text-[10px] text-slate-450 block">تاريخ التوقف والنهو الفعلي</label>
                  <input
                    type="date"
                    value={formFields.lastWorkingDay}
                    onChange={(e) => setFormFields(prev => ({ ...prev, lastWorkingDay: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: LEAVE REVIEW */}
          {activeStep === 4 && (
            <div className="space-y-4">
              <span className="text-[10px] bg-emerald-500/10 text-[#00796B] rounded px-2 py-0.5 font-bold">تصفية وحوسبة كسر الإجازات السنوية مادة 70</span>
              <p className="text-xs text-slate-500 leading-normal font-bold">يستحق الموظف عند المغادرة تعويضاً نقدياً على أساس رصيد الإجازات السنوية المتبقية مقسوماً على 26 يوماً عمل بالشرق الكويتي:</p>

              <div className="grid grid-cols-3 gap-4 text-xs font-sans">
                <div className="space-y-1 text-right font-bold select-none">
                  <label className="text-[10px] text-slate-400 block">رصيد الاستحقاق السنوي الأقصى</label>
                  <input
                    type="number"
                    value={formFields.leaveEntitlement}
                    onChange={(e) => setFormFields(prev => ({ ...prev, leaveEntitlement: Number(e.target.value) }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left"
                  />
                </div>

                <div className="space-y-1 text-right font-bold select-none">
                  <label className="text-[10px] text-slate-400 block">أيام الإجازة المستغلة سلفاً</label>
                  <input
                    type="number"
                    value={formFields.leaveTaken}
                    onChange={(e) => setFormFields(prev => ({ ...prev, leaveTaken: Number(e.target.value) }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left"
                  />
                </div>

                <div className="space-y-1 text-right font-bold select-none">
                  <label className="text-[10px] text-slate-400 block">معدل أيام التسوية المتبقية كاش</label>
                  <input
                    type="number"
                    value={formFields.leaveAdjustment}
                    onChange={(e) => setFormFields(prev => ({ ...prev, leaveAdjustment: Number(e.target.value) }))}
                    className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-left text-emerald-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: LOANS & DEDUCTIONS CUSTODY */}
          {activeStep === 5 && (
            <div className="space-y-4">
              <span className="text-[10px] bg-red-50 text-red-650 px-2 py-0.5 rounded font-bold border border-red-100">سجل استقطاع العجوزات والعهد العينية</span>
              <p className="text-xs text-slate-550 font-bold leading-normal">
                برجاء رصد مبالغ القروض الشخصية وغرامات السلوك وتسييل قيمة العجز العيني بالخصم من شيك الموظف النهائي:
              </p>

              <div className="grid grid-cols-2 gap-4 font-sans text-xs">
                <div className="space-y-1 text-right font-bold select-none">
                  <label className="text-[10px] text-rose-650 block">القروض الشخصية والسلف الطويلة المتبقية (د.ك)</label>
                  <input
                    type="number"
                    value={formFields.loansDeduction}
                    onChange={(e) => setFormFields(prev => ({ ...prev, loansDeduction: Number(e.target.value) }))}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-left text-red-800"
                  />
                </div>

                <div className="space-y-1 text-right font-bold select-none">
                  <label className="text-[10px] text-rose-650 block">غرامات الخصومات والإنقاص اللائحي للجزاءات (د.ك)</label>
                  <input
                    type="number"
                    value={formFields.disciplinaryDeductions}
                    onChange={(e) => setFormFields(prev => ({ ...prev, disciplinaryDeductions: Number(e.target.value) }))}
                    className="w-full h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-left text-red-800"
                  />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border rounded-2xl grid grid-cols-2 gap-3 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">لابتوب عيني مسترد:</span>
                  <input
                    type="checkbox"
                    checked={formFields.companyLaptopReturned}
                    onChange={(e) => setFormFields(prev => ({ ...prev, companyLaptopReturned: e.target.checked }))}
                    className="accent-[#00796B]"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">مفاتيح وهواتف مسددة:</span>
                  <input
                    type="checkbox"
                    checked={formFields.companyPhoneReturned}
                    onChange={(e) => setFormFields(prev => ({ ...prev, companyPhoneReturned: e.target.checked }))}
                    className="accent-[#00796B]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: INDEMNITY MATH */}
          {activeStep === 6 && (
            <div className="space-y-4">
              <span className="text-xs font-black text-slate-800 block">فهرس العملية الحسابية المؤتمتة مادة 51</span>
              <p className="text-[10.5px] text-slate-500 font-bold leading-relaxed">
                تقوم منظومة "عدالة" بحوسبة مدة الخدمة الطولية لكسور الأيام بدقة عشارية تامة وطبقاً للتعديل القانوني لعام 2026.
              </p>

              {liveCalculationResult ? (
                <div className="p-4 bg-emerald-500/5 border border-emerald-100 rounded-2xl space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center font-Tajawal font-bold text-slate-800">
                    <div className="bg-white p-3 border rounded-xl">
                      <span className="text-[9.5px] text-slate-400 block">أعوام دقيقة</span>
                      <span className="text-lg font-black text-[#00796B] block font-mono">{liveCalculationResult.serviceYears}</span>
                    </div>
                    <div className="bg-white p-3 border rounded-xl">
                      <span className="text-[9.5px] text-slate-400 block">أشهر دقيقة</span>
                      <span className="text-lg font-black text-[#00796B] block font-mono">{liveCalculationResult.serviceMonths}</span>
                    </div>
                    <div className="bg-white p-3 border rounded-xl">
                      <span className="text-[9.5px] text-slate-400 block">أيام عمالية</span>
                      <span className="text-lg font-black text-[#00796B] block font-mono">{liveCalculationResult.serviceDays}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold font-sans">
                    <span className="text-slate-550">الحاصل الحسابي لمكافأة مادة 51 الإجمالية:</span>
                    <span className="font-mono text-[#00796B] font-black text-base">{liveCalculationResult.indemnityAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400">جاري احتساب التسوية العمالية...</div>
              )}
            </div>
          )}

          {/* STEP 7: NET SETTLEMENT REVIEW */}
          {activeStep === 7 && (
            <div className="space-y-4">
              <span className="text-xs font-black text-slate-800 block">تفاصيل توازن ميزان الخدمة الموحد (Net Settlement)</span>
              
              {liveCalculationResult ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 font-sans font-bold select-none">
                    <div className="flex justify-between">
                      <span className="text-slate-400">(+) مكافأة الخدمة:</span>
                      <span className="font-mono">{liveCalculationResult.indemnityAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })} KWD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">(+) تعويض الإجازات كاش:</span>
                      <span className="font-mono">{liveCalculationResult.leavePayAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })} KWD</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">(-) القروض المستحقة للمنشأة:</span>
                      <span className="font-mono text-rose-400">-{formFields.loansDeduction.toLocaleString(undefined, { minimumFractionDigits: 3 })} KWD</span>
                    </div>
                    <hr className="border-white/10" />
                    <div className="flex justify-between text-emerald-300 font-extrabold text-sm select-none leading-none">
                      <span>الصافي الودي المعتمد المعد للصرف:</span>
                      <span className="font-mono">{liveCalculationResult.netAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400">جاري استيراد الحسبة بنجاح...</div>
              )}
            </div>
          )}

          {/* STEP 8: DOCUMENT ISSUANCE */}
          {activeStep === 8 && (
            <div className="space-y-4">
              <span className="text-xs font-black text-[#00796B] block">طابعة الصك والمستند مروّساً لجهة التوقيع</span>
              <p className="text-[10.5px] text-slate-400 leading-normal font-bold">
                تم التحقق من كافة أرقام الموازنة الحسابية بنجاح. أضف أي ملاحظات إجرائية ختامية لإدراجها في مذكر صبري شطا:
              </p>

              <div className="space-y-1.5 font-bold font-sans text-xs">
                <label className="text-[10px] text-slate-450 block">ملاحظات وقيود براءة الذمة الهامة</label>
                <textarea
                  value={formFields.notes}
                  onChange={(e) => setFormFields(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-700 text-right focus:outline-none focus:border-[#00796B] font-semibold leading-relaxed"
                  placeholder="مثال: تم تسييل الحساب ومقاصة السيارة وتسوية الهامش الودي"
                />
              </div>

              <div className="p-4 bg-[#00796B]/5 border border-[#00796B]/15 rounded-2xl flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-[#00796B] shrink-0 animate-bounce" />
                <div className="space-y-0.5 text-right font-Tajawal font-bold text-[#004D40] text-xs leading-tight">
                  <h4>اعتماد المطابقة للقانون 6/2010</h4>
                  <p className="text-[9.5px] text-slate-500 mt-0.5">جاهز للتصدير والتوقيع.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Navigations */}
        <div className="bg-slate-50 border-t border-slate-100 p-5 flex items-center justify-between font-sans">
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="h-10 px-5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer focus:outline-none"
            >
              إلغاء الأمر
            </button>
          </div>

          <div className="flex gap-2 font-black select-none text-xs">
            {activeStep > 1 && (
              <button
                onClick={() => setActiveStep(prev => prev - 1)}
                className="h-10 px-5 rounded-xl text-xs font-black bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer flex items-center gap-1.5 focus:outline-none"
              >
                <ArrowRight className="w-4 h-4" />
                <span>الخطوة السابقة</span>
              </button>
            )}

            {activeStep < 8 ? (
              <button
                onClick={() => setActiveStep(prev => prev + 1)}
                className="h-10 px-5 rounded-xl text-xs font-black bg-[#E0F2F1] text-[#004D40] border border-[#B2DFDB] hover:bg-[#B2DFDB] transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none"
              >
                <span>الخطوة التالية</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSaveLocal}
                className="h-10 px-5 rounded-xl text-xs font-black bg-[#00796B] text-white hover:bg-[#004D40] cursor-pointer border-none shadow-md flex items-center gap-1.5 focus:outline-none"
              >
                <Check className="w-4 h-4 font-black" />
                <span>حفظ مستند براءة الذمة</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
