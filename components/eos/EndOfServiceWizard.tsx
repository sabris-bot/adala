import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, Scale, Coins, Calendar, ShieldAlert, Laptop, 
  CheckSquare, Check, Sparkles, HelpCircle, ArrowRight, ArrowLeft,
  AlertOctagon, Key, UserCheck, Award
} from 'lucide-react';
import { TerminationReasonKuwait, ContractTypeKuwait, EOS_Settlement } from '../../types';
import { initialExtendedEmployees, ExtendedEmployee } from '../../data/employeeExtendedData';
import { calculateKuwaitEOS } from '../../services/eosService';

interface EndOfServiceWizardProps {
  onClose: () => void;
  onSave: (record: EOS_Settlement) => void;
  editCase: EOS_Settlement | null;
}

// 16 Detailed Kuwaiti Labor Law Termination Scenarios
const TERMINATION_SCENARIOS = [
  { id: 'resignation_standard', label: 'استقالة رسمية بموجب المادة 53', enumValue: TerminationReasonKuwait.RESIGNATION, category: 'employee', gratuity: 'مقياس الخدمة', lawArticle: 'المادة (٥٣)', desc: 'تخضع لسنوات الخدمة: أقل من ٣ (لا تستحق)، ٣-٥ (نصف)، ٥-١٠ (ثلثين)، ١٠+ (كامل)' },
  { id: 'dismissal_notice', label: 'إنهاء من قبل صاحب العمل مع إخطار', enumValue: TerminationReasonKuwait.DISMISSAL_WITH_NOTICE, category: 'employer', gratuity: '١٠0% كاملة', lawArticle: 'المادة (٤٤) و(٥١)', desc: 'إنهاء فردي أو جماعي بقرار المنشأة مع الوفاء بمهلة إنذار عمالي ٣ أشهر' },
  { id: 'dismissal_art41', label: 'فصل تأديبي بسبب خطأ مادة 41', enumValue: TerminationReasonKuwait.DISMISSAL_WITHOUT_NOTICE_ART_41, category: 'employer', gratuity: 'حرمان تام (0%)', lawArticle: 'المادة (٤١)', desc: 'فصل تسبيبي لغياب مستمر، إفشاء أسرار، خسارة مادية جسيمة أو اعتداء عمالي' },
  { id: 'contract_expiry_lim', label: 'انتهاء العقد محدد المدة دون تجديد', enumValue: TerminationReasonKuwait.CONTRACT_EXPIRY, category: 'contract', gratuity: '١00% كاملة', lawArticle: 'مستحقات العقد', desc: 'انقضاء الأجل القانوني للعلاقة العمالية المبرمة للمدة دون رغبة بتجديده' },
  { id: 'consensual_settlement', label: 'إنهاء الخدمة بالتراضي والاتفاق المتساوي', enumValue: TerminationReasonKuwait.CONSENSUAL_TERMINATION, category: 'contract', gratuity: '١00% توافقية', lawArticle: 'التراضي العمالي', desc: 'حل العلاقة ودياً بالتراضي وحوسبة صافي المستحقات رضائياً خارج ساحة الخلاف' },
  { id: 'retirement_active', label: 'التقاعد الذاتي المعمول به قانوناً', enumValue: TerminationReasonKuwait.RETIREMENT, category: 'employee', gratuity: '١00% كاملة', lawArticle: 'مادة بلوغ السن', desc: 'صرف المستحقات لبلوغ السن القانونية عمالياً أو الاستحقاق للتقاعد الوطني التأميني' },
  { id: 'death_indemnity', label: 'وفاة الموظف (المكافأة للورثة الشرعيين)', enumValue: TerminationReasonKuwait.DEATH, category: 'legal_event', gratuity: '١00% للورثة', lawArticle: 'الشرع وقانون العمل', desc: 'وفاة طبيعية أو أثناء أداء الواجب العمالي، تصرف المستحقات لصالح الأنصبة الشرعية' },
  { id: 'health_disability', label: 'عجز صحي كلي أو جزئي مانع للعمل', enumValue: TerminationReasonKuwait.TOTAL_DISABILITY, category: 'legal_event', gratuity: '١00% كاملة', lawArticle: 'اللجنة الطبية العامة', desc: 'ثبوت عدم القدرة الصحية على أداء مهام الكادر بتقرير رسمي مبرم' },
  { id: 'probation_dismissal_active', label: 'إنهاء الخدمة بقرار الشركة خلال التجربة', enumValue: TerminationReasonKuwait.PROBATION_TERMINATION, category: 'employer', gratuity: 'لا مكافأة (0%)', lawArticle: 'فترة المية يوم', desc: 'الفصل خلال أول ١٠٠ يوم للعمل بتقرير لعدم كفاءة العامل وصلاحيته' },
  { id: 'probation_resignation_active', label: 'انسحاب واستقالة العامل خلال فترة التجربة', enumValue: TerminationReasonKuwait.PROBATION_RESIGNATION, category: 'employee', gratuity: 'لا مكافأة', lawArticle: 'المرحلة العقدية الأولى', desc: 'ترك العمل برغبة الكادر طوعياً خلال مئة اليوم الأولى من الارتباط والالتحاق' },
  { id: 'leaving_work_art48', label: 'ترك العمل طوعياً لخطأ صاحب العمل مادة 48', enumValue: TerminationReasonKuwait.RESIGNATION_ART_48_EMPLOYER_FAULT, category: 'employee', gratuity: '١00% كاملة', lawArticle: 'المادة (٤٨)', desc: 'ترك العمل لتعرض الموظف لاعتداء، تزوير الشروط، أو مهددات السلامة بالمنشأة' },
  { id: 'absence_breach_42', label: 'إنهاء المباشرة للانقطاع والغياب عشوائياً مادة 42', enumValue: TerminationReasonKuwait.TERMINATION_FOR_ABSENCE, category: 'employer', gratuity: 'بلا مكافأة مادة 41', lawArticle: 'المادة (٤٢)', desc: 'الانقطاع دون إبلاغ لأكثر من ٧ أيام متصلة أو ١٥ يوماً منفصلة خلال العام العمالي' },
  { id: 'visa_transfer_cancel', label: 'إلغاء الإقامة أو نقل الكفالة القانونية', enumValue: TerminationReasonKuwait.DISMISSAL_WITH_NOTICE, category: 'legal_event', gratuity: 'كاملة عمالياً', lawArticle: 'شؤون الإقامة والهيئة', desc: 'تعذر تجديد وتوثيق الإقامة أو طلب النقل لظروف نظامية متعلقة بضوابط شؤون الإقامة' },
  { id: 'redundancy_shutdown', label: 'إعادة الهيكلة وتصفية فرع أو إغلاق المنشأة', enumValue: TerminationReasonKuwait.CLOSURE_OR_BANKRUPTCY, category: 'employer', gratuity: '١00% كاملة', lawArticle: 'إنهاء نظامي جماعي', desc: 'التسريح المبرر لإفلاس الكيان القانوني أو تسييل الأصول لظروف استثنائية معتمدة' },
  { id: 'arbitration_conflict', label: 'تسوية نزاع عمالي ودي بوزارة القوى العاملة', enumValue: TerminationReasonKuwait.CONSENSUAL_TERMINATION, category: 'legal_event', gratuity: 'مقطوع / متصالح', lawArticle: 'الصلح والتراضي الموثق', desc: 'عقد تسوية ودية موحدة لإنهاء النزاع وتسجيل مخالصة مديونية قبل الذهاب للمحاكم' },
  { id: 'marriage_res_woman', label: 'استقالة عمالية بسبب الزواج للمرأة مادة 54', enumValue: TerminationReasonKuwait.MARRIAGE_RESIGNATION_WOMEN, category: 'employee', gratuity: '١00% كاملة', lawArticle: 'المادة (٥٤)', desc: 'استقالة الموظفة بسبب عقد زواجها المثبت خلال سنة من إبرام الزواج عمالياً' }
];

export const EndOfServiceWizard: React.FC<EndOfServiceWizardProps> = ({
  onClose,
  onSave,
  editCase
}) => {
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
      employeeName: emp.fullNameAr,
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
      notes: `تم ربط التصفية الشاملة تلقائياً بسجل الموظف رقم الكادر (${emp.employeeId}).`
    }));
  };

  // Perform live EOS benefit calculations using existing services
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
      alert('يجب ملء اسم الموظف ورقمه المدني أولاً للمباشرة بالاعتماد.');
      return;
    }

    const calculated = liveCalculationResult;
    if (!calculated) {
      alert('حدث خطأ أثناء رصد العمليات الحسابية للمكافأة، يرجى التحقق من أرقام المدخلات.');
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
      serviceYears: calculated.serviceYears,
      serviceMonths: calculated.serviceMonths,
      serviceDays: calculated.serviceDays,
      indemnityAmount: calculated.indemnityAmount,
      leaveBalanceAmount: calculated.leavePayAmount,
      accruedSalaryAmount: calculated.accruedSalaryAmount || 0,
      noticePeriodAmount: calculated.noticePeriodPay,
      otherBonuses: Number(formFields.otherBonuses),
      loansDeduction: Number(formFields.loansDeduction),
      absenceDeduction: Number(formFields.absenceDays) * ((Number(formFields.basicSalary) + Number(formFields.allowances)) / 26),
      otherDeductions: 0,
      netPayable: calculated.netAmount,
      legalArticles: calculated.legalArticles.map(a => `المادة (${a.article}): ${a.text.slice(0, 110)}...`),
      preparedBy: editCase?.preparedBy || 'شؤون الموظفين - الوجيان',
      notes: formFields.notes || 'تسوية صادر آلياً عن عدالة سيستم.',
      approvals: editCase?.approvals || { hr: 'مكتمل', legal: 'معلق', finance: 'معلق', gm: 'معلق' },
      signatures: editCase?.signatures || { employee: '', hr: 'شيرين النجار', fin: '', legal: '' },
      nationality: formFields.nationality,
      contractType: formFields.contractType,
      leaveBalanceDays: calculated.leaveBalanceDays,
      disciplinaryDeductions: Number(formFields.disciplinaryDeductions),
      finalMonthWorkedDays: Number(formFields.finalMonthWorkedDays),
      unpaidLeaveDays: Number(formFields.unpaidLeaveDays),
      absenceDays: Number(formFields.absenceDays),
      timeline: editCase?.timeline || [
        { date: new Date().toISOString().split('T')[0], actionAr: 'تأسيس وبدء معالجة ملف براءة الذمة الشاملة', actionEn: 'Profile registered under audits', user: 'عدالة سيستم' }
      ]
    };

    onSave(compiledCase);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dark backdrop element */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
      />

      {/* Slide-out Sheet drawer */}
      <div className="relative w-full max-w-xl bg-white dark:bg-dm-card h-full shadow-2xl flex flex-col z-10 text-right p-6 overflow-hidden">
        
        {/* Draw Header */}
        <div className="flex justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-extrabold text-gray-900 dark:text-white">
              {editCase ? `تحديث ومراجعة تصفية عمالية (${editCase.settlementNumber})` : 'معالج احتساب تصفية عمالية ومخالصة جديدة'}
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Stepper bar */}
        <div className="flex justify-between items-center my-4 p-2 bg-gray-50 dark:bg-slate-950/60 rounded-xl border border-gray-150 dark:border-gray-800 shrink-0 select-none">
          {[
            { step: 1, label: 'البيانات الأساسية' },
            { step: 2, label: 'سبب التصفية' },
            { step: 3, label: 'رصيد الإجازات' },
            { step: 4, label: 'دائن ومدين' },
            { step: 5, label: 'العهد والاعتمادات' }
          ].map(s => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`flex-1 text-center py-2 rounded-lg text-[9px] sm:text-[10px] font-black transition-all cursor-pointer ${activeStep === s.step ? 'bg-primary text-white shadow-sm font-black' : 'text-gray-450 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <span>{s.step}. {s.label}</span>
            </button>
          ))}
        </div>

        {/* ACTIVE MODULE CONTAINER SENSITIVELY */}
        <div className="flex-1 overflow-y-auto px-1 py-1 space-y-4">
          
          {/* STEP 1: Basic Info & DB Connection */}
          {activeStep === 1 && (
            <div className="space-y-4 text-xs font-semibold text-gray-700 dark:text-gray-300">
              
              <div className="p-4 bg-primary/5 dark:bg-primary-dark/20 border border-primary/20 rounded-xl space-y-2">
                <label className="block text-[11px] font-extrabold text-primary dark:text-primary-light">
                  ربط السند ببطاقة الموظف بقاعدة كادر الوجيان (Kader Link):
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={e => handleEmployeeSelection(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs font-bold outline-none text-gray-800 dark:text-white cursor-pointer"
                >
                  <option value="">-- اختر موظفاً لسحب موازنة الأجور والعهد تلقائياً --</option>
                  {initialExtendedEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullNameAr} ({emp.jobTitle})</option>
                  ))}
                </select>
                <p className="text-[9.5px] text-gray-400">عند اختيار ملف، تسحب تصفية الراتب والخصومات للأيام الماضية والمكافآت آلياً وبدقة.</p>
              </div>

              {/* Warnings and profile indicators showing DB linkage */}
              {linkedEmployee && (
                <div className="p-3.5 bg-amber-500/5 border border-amber-500/10 rounded-xl space-y-2 text-[10px] leading-relaxed">
                  <p className="font-extrabold text-amber-500 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" />
                    <span>ملاحظات نظام الامتثال لسجل الموظف ({linkedEmployee.fullNameAr}):</span>
                  </p>
                  <ul className="list-disc pr-4 space-y-1 text-gray-600 dark:text-gray-400 font-bold">
                    <li>ديون السلف النشطة: <span className="font-mono text-gray-900 dark:text-white font-black">{linkedEmployee.loans?.filter(l => l.status === 'Active').reduce((sum, l) => sum + l.balanceAmount, 0) || 0} د.ك</span></li>
                    <li>العقوبات والإنذارات: <span className="font-mono text-red-500 font-black">{linkedEmployee.disciplinaryActions?.length || 0} إنذارات إدارية</span></li>
                    <li>مؤشر التقييم الفني: <span className="font-sans text-emerald-600 font-black flex items-center gap-1 text-[9.5px]"><Award className="w-3.5 h-3.5 inline" /> {linkedEmployee.evaluations?.[0]?.overallScore || 'لا يوجد تقييم'} / 100</span></li>
                  </ul>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400">اسم الموظف الثلاثي (بالبطاقة المدنية)</label>
                <input 
                  type="text" 
                  value={formFields.employeeName}
                  onChange={e => setFormFields({...formFields, employeeName: e.target.value})}
                  className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white font-bold rounded-lg border border-gray-200 dark:border-gray-800 outline-none focus:border-primary"
                  placeholder="محمد عبدالرحمن المطيري"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400">البطاقة المدنية (١٢ خانة)</label>
                  <input 
                    type="text" 
                    maxLength={12}
                    value={formFields.employeeCivilId}
                    onChange={e => setFormFields({...formFields, employeeCivilId: e.target.value})}
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white font-mono rounded-lg border border-gray-200 outline-none"
                    placeholder="286010212345"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400">المسمى الوظيفي والصفة</label>
                  <input 
                    type="text" 
                    value={formFields.jobTitle}
                    onChange={e => setFormFields({...formFields, jobTitle: e.target.value})}
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white font-bold rounded-lg border border-gray-200 outline-none"
                    placeholder="مدير مبيعات أول"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400">تاريخ بدء العمل (التعيين)</label>
                  <input 
                    type="date" 
                    value={formFields.joiningDate}
                    onChange={e => setFormFields({...formFields, joiningDate: e.target.value})}
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg border border-gray-200 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400">تاريخ المباشرة الأخير (الخروج)</label>
                  <input 
                    type="date" 
                    value={formFields.lastWorkingDay}
                    onChange={e => setFormFields({...formFields, lastWorkingDay: e.target.value})}
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg border border-gray-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400">القطاع العمالي القانوني</label>
                  <select
                    value={formFields.sector}
                    onChange={e => setFormFields({...formFields, sector: e.target.value as any})}
                    className="w-full h-10 px-2 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg border border-gray-200 outline-none cursor-pointer"
                  >
                    <option value="private">💼 القطاع الأهلي (قانون عمل 6/2010)</option>
                    <option value="oil">🏭 القطاع النفطي والمصارف (قانون 28/1969)</option>
                    <option value="government">🏛️ ديوان الخدمة (csc لغير الكويتيين)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400">طبيعة صك عقد العمل المبرم</label>
                  <select
                    value={formFields.contractType}
                    onChange={e => setFormFields({...formFields, contractType: e.target.value as any})}
                    className="w-full h-10 px-2 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg border border-gray-200 outline-none cursor-pointer"
                  >
                    <option value={ContractTypeKuwait.UNLIMITED}>غير محدد المدة (Unlimited)</option>
                    <option value={ContractTypeKuwait.LIMITED}>محدد المدة (Limited)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400">الجنسية والتبعية</label>
                  <input 
                    type="text" 
                    value={formFields.nationality}
                    onChange={e => setFormFields({...formFields, nationality: e.target.value})}
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white font-bold rounded-lg border border-gray-200 outline-none"
                    placeholder="كويتي"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400">الشعبة / الإدارة والفرع</label>
                  <input 
                    type="text" 
                    value={formFields.department}
                    onChange={e => setFormFields({...formFields, department: e.target.value})}
                    className="w-full h-10 px-3 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white font-bold rounded-lg border border-gray-200 outline-none"
                  />
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: Kuwait Law 16 Termination Reason Details */}
          {activeStep === 2 && (
            <div className="space-y-3">
              <p className="text-[11px] font-black text-gray-400 text-right">رصد وتكييف سبب انتهاء خدمة الكادر طبقاً للأحكام (16 سيناريو):</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
                {TERMINATION_SCENARIOS.map(sc => {
                  const isSelected = formFields.terminationReason === sc.enumValue;
                  return (
                    <div
                      key={sc.id}
                      onClick={() => setFormFields({...formFields, terminationReason: sc.enumValue})}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${isSelected ? 'bg-primary/10 border-primary text-primary-dark dark:text-primary-light' : 'bg-gray-50 dark:bg-slate-900/40 border-gray-150 dark:border-gray-800 hover:bg-gray-100'}`}
                    >
                      <div className="flex justify-between items-start text-right">
                        <span className="text-xs font-black">{sc.label}</span>
                        <span className="text-[8px] bg-primary/20 text-primary-dark dark:text-primary-light font-bold px-1 py-0.5 rounded font-mono shrink-0 select-none">{sc.lawArticle}</span>
                      </div>
                      <p className="text-[9.5px] text-gray-400 dark:text-gray-450 mt-1 leading-normal font-bold">{sc.desc}</p>
                      <div className="flex justify-between items-center mt-2.5 border-t border-gray-250/20 pt-1 text-[8px] font-bold opacity-80">
                        <span>الامتياز المالي للمغادرة:</span>
                        <span className="font-mono text-primary font-bold">{sc.gratuity}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Annual Leaves Liquidation */}
          {activeStep === 3 && (
            <div className="space-y-4 font-semibold text-gray-750 dark:text-gray-300">
              <div className="p-4 bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/10 rounded-2xl space-y-3">
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1 leading-none pb-2 border-b border-emerald-500/10 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>تسييل كاش رصيد الإجازات السنوية (مادة 70 عمالي)</span>
                </span>
                
                <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400">رصيد الإجازات الكلي</label>
                    <input 
                      type="number" 
                      value={formFields.leaveEntitlement}
                      onChange={e => setFormFields({...formFields, leaveEntitlement: Math.max(0, Number(e.target.value))})}
                      className="w-full h-10 px-2 bg-white dark:bg-slate-900 rounded-lg border text-center font-mono font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400">الإجازات المستهلكة (Used)</label>
                    <input 
                      type="number" 
                      value={formFields.leaveTaken}
                      onChange={e => setFormFields({...formFields, leaveTaken: Math.max(0, Number(e.target.value))})}
                      className="w-full h-10 px-2 bg-white dark:bg-slate-900 rounded-lg border text-center font-mono font-bold outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400">تعديلات الرصيد (+/-)</label>
                    <input 
                      type="number" 
                      value={formFields.leaveAdjustment}
                      onChange={e => setFormFields({...formFields, leaveAdjustment: Number(e.target.value)})}
                      className="w-full h-10 px-2 bg-white dark:bg-slate-900 rounded-lg border text-center font-mono font-bold outline-none"
                    />
                  </div>
                </div>

                {liveCalculationResult && liveCalculationResult.leaveBalanceDays < 0 && (
                  <div className="p-2.5 bg-danger/10 text-danger border border-danger/20 rounded-lg text-[9.5px] font-bold leading-relaxed flex gap-1">
                    <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>تنبيه خطوة 3: الأيام المستهلكة المرفوعة لتسييل رصيد الموظف تتعدى موازنة حسابه عمالياً ليرجى تصفير الأيام المتبقية.</span>
                  </div>
                )}

                <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-gray-150 dark:border-gray-800 flex justify-between leading-snug">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold">رصيد الأيام المتبقية آلياً للتعويض:</p>
                    <span className="text-sm font-mono font-extrabold text-[#00796B]">
                      {liveCalculationResult ? liveCalculationResult.leaveBalanceDays : 0} يوماً عمالياً
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-gray-400 font-bold">قيمة تعويض الكاش التعادلي:</p>
                    <span className="text-sm font-mono font-extrabold text-success">
                      {liveCalculationResult ? liveCalculationResult.leavePayAmount.toLocaleString(undefined, { minimumFractionDigits: 3 }) : '0.000'} د.ك
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-slate-900/40 border rounded-2xl space-y-2 text-xs font-semibold">
                <span className="text-gray-900 dark:text-white font-extrabold block">قاعدة احتساب الإجازات بدولة الكويت:</span>
                <p className="text-gray-400 leading-normal text-[10.5px]">
                  موافق لقانون العمل الكويتي رقم 6 لسنة 2010، يُمنح العامل تعويضاً نقدياً عن رصيد إجازاته السنوية غير المستنفذة يُحسب على أساس آخر راتب إجمالي تقاضاه العامل مقسوماً على 26.
                </p>
              </div>

            </div>
          )}

          {/* STEP 4: Ledger Additions & Deductions */}
          {activeStep === 4 && (
            <div className="space-y-4 font-semibold text-gray-700 dark:text-gray-300">
              
              {/* COMP COMP ASSETS */}
              <div className="bg-success/5 dark:bg-success/15 p-4 rounded-xl border border-success/10 space-y-3">
                <span className="text-xs font-black text-success border-b pb-1 flex items-center gap-1 leading-none select-none">
                  <Coins className="w-3.5 h-3.5" />
                  <span>عناصر الأجور والمستحقات المباشرة (+)</span>
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400">الراتب الأساسي (KWD)</label>
                    <input 
                      type="number" 
                      value={formFields.basicSalary}
                      onChange={e => setFormFields({...formFields, basicSalary: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-white dark:bg-slate-900 border font-mono font-bold text-center rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400">البدلات (Allowances)</label>
                    <input 
                      type="number" 
                      value={formFields.allowances}
                      onChange={e => setFormFields({...formFields, allowances: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-white dark:bg-slate-900 border font-mono font-bold text-center rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400">ساعات الإضافي (Overtime)</label>
                    <input 
                      type="number" 
                      value={formFields.overtimeHours}
                      onChange={e => setFormFields({...formFields, overtimeHours: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-white dark:bg-slate-900 border font-mono text-center rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400">أيام عمل فعلية في الشهر الأخير</label>
                    <input 
                      type="number" 
                      value={formFields.finalMonthWorkedDays}
                      onChange={e => setFormFields({...formFields, finalMonthWorkedDays: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-white dark:bg-slate-900 border font-mono font-bold text-center rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-gray-400">بونص ومكافآت تعاقدية إضافية أخرى</label>
                  <input 
                    type="number" 
                    value={formFields.otherBonuses}
                    onChange={e => setFormFields({...formFields, otherBonuses: Number(e.target.value)})}
                    className="w-full h-10 px-3 bg-white dark:bg-slate-900 border font-mono text-center rounded-lg"
                  />
                </div>
              </div>

              {/* DEDUCTIONS COMP */}
              <div className="bg-danger/5 dark:bg-danger/15 p-4 rounded-xl border border-danger/10 space-y-3">
                <span className="text-xs font-black text-danger border-b pb-1 flex items-center gap-1 leading-none select-none">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>الخصومات والذمم المترتبة للمؤسسة (-)</span>
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400">مقاصة قروض متبقية / سلف</label>
                    <input 
                      type="number" 
                      value={formFields.loansDeduction}
                      onChange={e => setFormFields({...formFields, loansDeduction: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-white dark:bg-slate-900 border font-mono text-center rounded-lg text-danger"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400">الخصومات الادارية اللائحية / الجزاءات</label>
                    <input 
                      type="number" 
                      value={formFields.disciplinaryDeductions}
                      onChange={e => setFormFields({...formFields, disciplinaryDeductions: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-white dark:bg-slate-900 border font-mono text-center rounded-lg text-danger"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400">أيام غياب عشوائي غيرة مستند</label>
                    <input 
                      type="number" 
                      value={formFields.absenceDays}
                      onChange={e => setFormFields({...formFields, absenceDays: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-white dark:bg-slate-900 border font-mono text-center rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] text-gray-400">أيام انقطاع/إجازات بلا راتب (Unpaid)</label>
                    <input 
                      type="number" 
                      value={formFields.unpaidLeaveDays}
                      onChange={e => setFormFields({...formFields, unpaidLeaveDays: Number(e.target.value)})}
                      className="w-full h-10 px-3 bg-white dark:bg-slate-900 border font-mono text-center rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] text-gray-400">اقتطاع اشتراك التأمينات والتقاعد الوطنية (PIFSS)</label>
                  <input 
                    type="number" 
                    value={formFields.socialInsuranceDeduction}
                    onChange={e => setFormFields({...formFields, socialInsuranceDeduction: Number(e.target.value)})}
                    className="w-full h-10 px-3 bg-white dark:bg-slate-900 border font-mono text-center rounded-lg"
                  />
                </div>
              </div>

            </div>
          )}

          {/* STEP 5: Asset handover checkpoint */}
          {activeStep === 5 && (
            <div className="space-y-4 font-semibold text-gray-750 dark:text-gray-300">
              
              <div className="p-4 bg-gray-50 dark:bg-slate-900/60 border rounded-xl space-y-3">
                <span className="text-xs font-black text-gray-900 dark:text-white flex items-center gap-1 leading-none border-b pb-1.5"><Laptop className="w-3.5 h-3.5"/> تصفية وتسليم العهد العينية:</span>
                
                <div className="grid grid-cols-2 gap-3 text-xs font-bold font-sans">
                  <label className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900 hover:bg-emerald-500/10 p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <input type="checkbox" checked={formFields.companyLaptopReturned} onChange={e => setFormFields({...formFields, companyLaptopReturned: e.target.checked})} className="cursor-pointer" />
                    <span>لابتوب المكتب والملحقات</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900 hover:bg-emerald-500/10 p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <input type="checkbox" checked={formFields.companyPhoneReturned} onChange={e => setFormFields({...formFields, companyPhoneReturned: e.target.checked})} className="cursor-pointer" />
                    <span>جهاز الموبايل وخط الاتصال</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900 hover:bg-emerald-500/10 p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <input type="checkbox" checked={formFields.companyKeysReturned} onChange={e => setFormFields({...formFields, companyKeysReturned: e.target.checked})} className="cursor-pointer" />
                    <span>مفاتيح المكاتب والملفات</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-slate-900 hover:bg-emerald-500/10 p-2 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <input type="checkbox" checked={formFields.accessBadgesReturned} onChange={e => setFormFields({...formFields, accessBadgesReturned: e.target.checked})} className="cursor-pointer" />
                    <span>كروت دخول غرف السيرفرات</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] text-gray-400">ملاحظات وحواشي صياغة براءة الذمة</label>
                <textarea 
                  rows={3}
                  value={formFields.notes}
                  onChange={e => setFormFields({...formFields, notes: e.target.value})}
                  className="w-full text-[11px] p-2 bg-gray-50 dark:bg-slate-900 text-gray-800 dark:text-white rounded-lg border border-gray-200 outline-none font-bold"
                  placeholder="وثق أي تفاصيل تسوية، مقاصة مالي، أو مجالس تحقيق استثنائية..."
                />
              </div>

            </div>
          )}

        </div>

        {/* DRAW BOTTOM LIVE PREVIEW ACCURED SCALE */}
        {liveCalculationResult && (
          <div className="p-3 bg-gray-50 dark:bg-slate-950/65 rounded-xl border border-gray-200 dark:border-gray-800 shrink-0 text-right mt-2 space-y-1.5 select-none text-[10.5px]">
            <span className="text-[9.5px] font-black text-primary flex items-center gap-1 leading-none border-b border-primary/20 pb-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span>معاينة مخصص نهاية الخدمة الفوري (Live EOS Gratuity):</span>
            </span>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-bold font-sans">
              <div>أعوام الخدمة الصافية: <span className="font-mono text-gray-850 dark:text-white font-extrabold">{liveCalculationResult.serviceYears} سنة / {liveCalculationResult.serviceMonths} شهر</span></div>
              <div>مكافأة الاندمنتي: <span className="font-mono text-[#00796B] font-extrabold bg-slate-200/50 dark:bg-slate-900/60 px-1 rounded">{liveCalculationResult.indemnityAmount.toLocaleString()} د.ك</span></div>
              <div className="col-span-2 pt-1 border-t border-gray-150 dark:border-gray-800 flex justify-between items-center text-xs font-extrabold text-[#00796B]">
                <span>صافي الحصاد المالي المستحق للصرف البنكي:</span>
                <span className="font-mono text-success text-sm font-black text-left">
                  {liveCalculationResult.netAmount.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                </span>
              </div>
            </div>
          </div>
        )}

        {/* BOTTOM STEP WORK CONTROLS */}
        <div className="pt-4 grid grid-cols-2 gap-3 border-t border-gray-100 dark:border-gray-800 shrink-0 select-none">
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-3 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-gray-500 dark:text-gray-300 transition-all border outline-none cursor-pointer"
            >
              إلغاء المعالج
            </button>
            {activeStep > 1 && (
              <button 
                onClick={() => setActiveStep(prev => prev - 1)}
                className="w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 border text-gray-400 cursor-pointer flex items-center justify-center transition-all"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            {activeStep < 5 ? (
              <button 
                onClick={() => setActiveStep(prev => prev + 1)}
                className="w-full h-10 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shadow-primary/20"
              >
                <span>الخطوة التالية</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button 
                onClick={handleSaveLocal}
                className="w-full h-10 rounded-xl bg-[#00796B] hover:bg-[#004D40] text-white text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-primary/25"
              >
                تحديث وحفظ التصفية
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
