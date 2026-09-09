import React, { useState, useMemo } from 'react';
import { 
  Scale, Printer, User, DollarSign, Calendar, Briefcase, FileText, Trash2, Plus, RotateCcw, Copy, Check, ShieldCheck,
  AlertTriangle, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TerminationReasonKuwait, ContractTypeKuwait } from '../../types';
import { RedesignedTakenLeave, RedesignedFinancialItem } from './types';
import { EosPrintLayout } from './EosPrintLayout';
import { calculateDurationKuwait, calculateEosKuwait, NumberToKuwaitiWords } from '../../utils/kuwaitEosUtils';

export const EosWorkstation: React.FC = () => {
  // Print Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Copy state for legal release text
  const [copied, setCopied] = useState(false);
  
  // Interactive checklist states for UI acknowledgment
  const [agreeCalculations, setAgreeCalculations] = useState(false);
  const [agreeRelease, setAgreeRelease] = useState(false);
  const [agreeConfidentiality, setAgreeConfidentiality] = useState(false);
  
  // Core Profile inputs
  const [employeeName, setEmployeeName] = useState("");
  const [civilId, setCivilId] = useState("");
  const [id] = useState(`EMP-${Date.now().toString().slice(-4)}`);
  const [department, setDepartment] = useState("الإدارة والتشغيل");
  const [jobTitle, setJobTitle] = useState("");

  // Core Calculator Inputs
  const [joiningDate, setJoiningDate] = useState("2021-01-01");
  const [exitDate, setExitDate] = useState(new Date().toISOString().split('T')[0]);
  const [basicSalary, setBasicSalary] = useState<number>(1000);
  const [allowableAllowance, setAllowableAllowance] = useState<number>(0);
  const [unpaidAbsenceDays, setUnpaidAbsenceDays] = useState<number>(0);
  const [isKuwaiti, setIsKuwaiti] = useState(false);
  const [nationality, setNationality] = useState("");
  const [contractType, setContractType] = useState<ContractTypeKuwait>(ContractTypeKuwait.UNLIMITED);
  const [terminationReason, setTerminationReason] = useState<string>(TerminationReasonKuwait.RESIGNATION_3_TO_5_YEARS);
  
  // Advanced Settings fixed to common defaults for clean UX
  const [indemnityDivisor] = useState<26 | 30>(26);
  const [leaveAccrualBasis] = useState<'law30' | 'fullMonth'>('law30');
  const [enforceLeaveCap] = useState(true);
  const [leaveCapDays] = useState<number>(60);
  const [deductFridaysFromLeaves] = useState<boolean>(true);

  // Financial Additions & Deductions
  const [additions, setAdditions] = useState<RedesignedFinancialItem[]>([]);
  const [deductions, setDeductions] = useState<RedesignedFinancialItem[]>([]);
  const [tempAddDesc, setTempAddDesc] = useState('');
  const [tempAddAmt, setTempAddAmt] = useState('');
  const [tempDeductDesc, setTempDeductDesc] = useState('');
  const [tempDeductAmt, setTempDeductAmt] = useState('');

  // Used Leaves states
  const [leaveFromDate, setLeaveFromDate] = useState("");
  const [leaveToDate, setLeaveToDate] = useState("");
  const [leaveTypeState, setLeaveTypeState] = useState("annual");
  const [leaveNote, setLeaveNote] = useState("");

  // Taken Leaves list
  const [takenLeaves, setTakenLeaves] = useState<RedesignedTakenLeave[]>([]);

  // Experience Certificate performance notes
  const [performanceNotes, setPerformanceNotes] = useState("أبدى الموظف خلال فترة عمله انضباطاً عالياً، وتعاوناً مثمراً مع زملائه، وأظهر مهارات مهنية متميزة في أداء المهام الموكلة إليه.");

  // Compute unpaid absence days from unpaid leave types
  const totalUnpaidAbsenceDaysFromLeaves = useMemo(() => {
    return takenLeaves
      .filter(l => l.isUnpaid)
      .reduce((sum, leave) => sum + leave.netDays, 0);
  }, [takenLeaves]);

  const totalUnpaidAbsenceDays = useMemo(() => {
    return unpaidAbsenceDays + totalUnpaidAbsenceDaysFromLeaves;
  }, [unpaidAbsenceDays, totalUnpaidAbsenceDaysFromLeaves]);

  // Calculate Duration
  const duration = useMemo(() => {
    return calculateDurationKuwait(joiningDate, exitDate, totalUnpaidAbsenceDays);
  }, [joiningDate, exitDate, totalUnpaidAbsenceDays]);

  // Compute final results
  const computations = useMemo(() => {
    const totalTakenLeaveDays = takenLeaves
      .filter(l => l.leaveTypeKey === 'annual' || !l.leaveTypeKey)
      .reduce((sum, leave) => {
        return sum + (deductFridaysFromLeaves ? leave.netDays : leave.days);
      }, 0);

    const accrualDaysCount = leaveAccrualBasis === 'law30'
      ? (duration.activeTotalDays / 365) * 30
      : (duration.activeTotalDays / 365.25) * 30;

    const baseResult = calculateEosKuwait({
      joiningDate,
      exitDate,
      basicSalary,
      allowableAllowance,
      unpaidAbsenceDays: totalUnpaidAbsenceDays,
      paymentFrequency: 'monthly',
      contractType,
      terminationReason: terminationReason as TerminationReasonKuwait,
      totalAccruedLeaveDays: accrualDaysCount,
      leaveDaysAlreadyTaken: totalTakenLeaveDays,
      indemnityDivisor,
      isKuwaiti,
      pifssEmployerPaid: 0,
      autoCalculatePifss: true,
      isFemaleSpecialResignation: false,
      enforceLeaveCap,
      leaveCapDays,
      leaveAccrualBasis,
      additions: additions.map(a => ({ description: a.description, amount: a.amount })),
      deductions: deductions.map(d => ({ description: d.description, amount: d.amount }))
    });

    const netLeaveDays = Math.max(0, (leaveAccrualBasis === 'law30' ? baseResult.leaveDaysLaw : baseResult.leaveDaysCompany) - totalTakenLeaveDays);
    const finalCappedLeaveDays = enforceLeaveCap && netLeaveDays > leaveCapDays ? leaveCapDays : netLeaveDays;

    return {
      ...baseResult,
      accruedLeaveDays: leaveAccrualBasis === 'law30' ? baseResult.leaveDaysLaw : baseResult.leaveDaysCompany,
      totalTakenLeaveDays,
      remainingLeaveDays: netLeaveDays,
      finalCappedLeaveDays
    };
  }, [
    joiningDate, exitDate, basicSalary, allowableAllowance, totalUnpaidAbsenceDays,
    contractType, terminationReason, indemnityDivisor, isKuwaiti, enforceLeaveCap, 
    leaveCapDays, additions, deductions, takenLeaves, deductFridaysFromLeaves, 
    leaveAccrualBasis, duration.activeTotalDays
  ]);

  // Get friendly name for termination reason in legal document
  const getFriendlyReasonLabel = (reason: string) => {
    switch (reason) {
      case TerminationReasonKuwait.RESIGNATION_UNDER_3_YEARS:
        return "الاستقالة قبل إتمام 3 سنوات من الخدمة بموجب المادة (53)";
      case TerminationReasonKuwait.RESIGNATION_3_TO_5_YEARS:
        return "الاستقالة بعد إتمام خدمة من 3 إلى 5 سنوات بموجب المادة (53)";
      case TerminationReasonKuwait.RESIGNATION_5_TO_10_YEARS:
        return "الاستقالة بعد إتمام خدمة من 5 إلى 10 سنوات بموجب المادة (53)";
      case TerminationReasonKuwait.RESIGNATION_10_PLUS_YEARS:
        return "الاستقالة بعد إتمام خدمة 10 سنوات فأكثر بموجب المادة (53)";
      case TerminationReasonKuwait.PROBATION_RESIGNATION:
        return "الاستقالة خلال فترة التجربة";
      case TerminationReasonKuwait.DISMISSAL_WITH_NOTICE:
        return "إنهاء الخدمة بموجب قرار من صاحب العمل مع مهلة الإخطار القانونية";
      case TerminationReasonKuwait.ORGANIZATIONAL_REDUNDANCY:
        return "إنهاء الخدمة لدواعي تنظيمية مبررة وتقليص عدد العمالة";
      case TerminationReasonKuwait.CLOSURE_OR_BANKRUPTCY:
        return "تصفية المنشأة نهائياً أو إعلان إفلاسها التجاري";
      case TerminationReasonKuwait.CONTRACT_EXPIRY:
        return "انتهاء المدة المحددة في عقد العمل محدد المدة";
      case TerminationReasonKuwait.DISMISSAL_WITHOUT_NOTICE_ART_41:
        return "الفصل التأديبي الفوري دون إنذار بموجب أحكام المادة (41)";
      case TerminationReasonKuwait.DISMISSAL_ART_41_LOSS:
        return "الفصل بموجب المادة (41) لتسبب العامل بخسارة جسيمة للمنشأة";
      case TerminationReasonKuwait.DISMISSAL_ART_41_FRAUD:
        return "الفصل بموجب المادة (41) لثبوت حصول العامل على الوظيفة نتيجة الغش والتدليس";
      case TerminationReasonKuwait.DISMISSAL_ART_41_SECRETS:
        return "الفصل بموجب المادة (41) لقيام العامل بإفشاء أسرار المنشأة مسبباً أضراراً مادية محققة";
      case TerminationReasonKuwait.DISMISSAL_ART_41_MORALS:
        return "الفصل بموجب المادة (41) لارتكاب العامل فعلاً مخلاً بالآداب العامة أو جريمة مخلة بالشرف";
      case TerminationReasonKuwait.DISMISSAL_ART_41_ASSAULT:
        return "الفصل بموجب المادة (41) لاعتداء العامل بالضرب أو الإهانة على صاحب العمل أو الزملاء";
      case TerminationReasonKuwait.DISMISSAL_ART_41_OBLIGATIONS:
        return "الفصل بموجب المادة (41) للإخلال الجسيم بالالتزامات العقدية وتعليمات سلامة المنشأة";
      case TerminationReasonKuwait.TERMINATION_FOR_ABSENCE:
        return "إنهاء الخدمة بسبب غياب وانقطاع العامل عن العمل بموجب المادة (42)";
      case TerminationReasonKuwait.PROBATION_TERMINATION:
        return "إنهاء خدمة العامل بواسطة صاحب العمل خلال فترة التجربة";
      default:
        return reason;
    }
  };

  const handleCopyWaiverText = () => {
    const text = `إقرار وتعهد ومخالصة نهائية بالتراضي

أقر أنا الموقع أدناه الموظف المستفيد: ${employeeName || "[اسم الموظف]"}
الرقم المدني الكويتي: ${civilId || "[الرقم المدني]"}
المسمى الوظيفي: ${jobTitle || "[المسمى الوظيفي]"}
القسم الإداري: ${department}

بأنني قد استلمت من صاحب العمل كامل مستحقاتي العمالية والمالية الشاملة والنهائية المترتبة على فترة عملي لديها من تاريخ التعيين ${joiningDate} وحتى تاريخ انتهاء الخدمة ${exitDate} بسبب (${getFriendlyReasonLabel(terminationReason)})، وبقيمة إجمالية وقدرها:
صافي مبلغ التصفية النهائي: ${computations.netPayout.toLocaleString('ar-KW', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك (فقط ${NumberToKuwaitiWords(computations.netPayout)} لا غير).

وبموجب هذا الإقرار، فإنني أبرئ ذمة صاحب العمل والمنشأة والشركاء فيها إبراء ذمة شاملاً، عاماً، تاماً، قاطعاً ونهائياً لا رجعة فيه من أي حق أو مطالبة حالية أو مستقبلية تتعلق بمكافأة نهاية الخدمة، أو بدل رصيد الإجازات السنوية، أو الرواتب والبدلات، أو أي ميزات عمالية أخرى بموجب قانون العمل الكويتي رقم 6 لسنة 2010 وتعديلاته. كما أتعهد بعدم إفشاء أسرار العمل والمحافظة على خصوصية المنشأة.

المقر بما فيه (الموظف): ${employeeName || "......................................."}
التوقيع / البصمة: .......................................
التاريخ: ${new Date(exitDate).toLocaleDateString('ar-KW')} م
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Reset inputs
  const handleReset = () => {
    setEmployeeName('');
    setCivilId('');
    setJobTitle('');
    setJoiningDate('2021-01-01');
    setExitDate(new Date().toISOString().split('T')[0]);
    setBasicSalary(1000);
    setAllowableAllowance(0);
    setUnpaidAbsenceDays(0);
    setIsKuwaiti(false);
    setNationality('');
    setContractType(ContractTypeKuwait.UNLIMITED);
    setTerminationReason(TerminationReasonKuwait.RESIGNATION_3_TO_5_YEARS);
    setAdditions([]);
    setDeductions([]);
    setTakenLeaves([]);
    setLeaveFromDate('');
    setLeaveToDate('');
    setLeaveNote('');
  };

  const handleAddAddition = () => {
    const amt = parseFloat(tempAddAmt);
    if (tempAddDesc && !isNaN(amt) && amt > 0) {
      setAdditions([...additions, { id: `add-${Date.now()}`, description: tempAddDesc, amount: amt }]);
      setTempAddDesc('');
      setTempAddAmt('');
    }
  };

  const handleAddDeduction = () => {
    const amt = parseFloat(tempDeductAmt);
    if (tempDeductDesc && !isNaN(amt) && amt > 0) {
      setDeductions([...deductions, { id: `ded-${Date.now()}`, description: tempDeductDesc, amount: amt }]);
      setTempDeductDesc('');
      setTempDeductAmt('');
    }
  };

  const handleRemoveAddition = (id: string) => {
    setAdditions(additions.filter(a => a.id !== id));
  };

  const handleRemoveDeduction = (id: string) => {
    setDeductions(deductions.filter(d => d.id !== id));
  };

  const handleAddLeave = () => {
    if (!leaveFromDate || !leaveToDate) return;
    const start = new Date(leaveFromDate);
    const end = new Date(leaveToDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return; // Invalid dates
    }

    // Total calendar days
    const totalDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Count Fridays
    let fridays = 0;
    let current = new Date(start);
    while (current <= end) {
      if (current.getDay() === 5) { // 5 is Friday
        fridays++;
      }
      current.setDate(current.getDate() + 1);
    }

    const netDays = totalDays - fridays;

    let leaveLabel = 'إجازة سنوية دورية';
    let isUnpaid = false;

    if (leaveTypeState === 'annual') {
      leaveLabel = 'إجازة سنوية دورية';
      isUnpaid = false;
    } else if (leaveTypeState === 'sick_paid') {
      leaveLabel = 'إجازة مرضية (مدفوعة الأجر)';
      isUnpaid = false;
    } else if (leaveTypeState === 'sick_unpaid') {
      leaveLabel = 'إجازة مرضية (غير مدفوعة)';
      isUnpaid = true;
    } else if (leaveTypeState === 'special_paid') {
      leaveLabel = 'إجازة خاصة (مدفوعة الأجر)';
      isUnpaid = false;
    } else if (leaveTypeState === 'special_unpaid') {
      leaveLabel = 'إجازة خاصة (غير مدفوعة)';
      isUnpaid = true;
    }

    const newLeave: RedesignedTakenLeave = {
      id: `leave-${Date.now()}`,
      fromDate: leaveFromDate,
      toDate: leaveToDate,
      days: totalDays,
      fridaysCount: fridays,
      netDays: netDays,
      leaveType: leaveLabel,
      leaveTypeKey: leaveTypeState,
      isUnpaid: isUnpaid,
      note: leaveNote || 'إجازة مسجلة'
    };

    setTakenLeaves([...takenLeaves, newLeave]);
    setLeaveFromDate('');
    setLeaveToDate('');
    setLeaveNote('');
  };

  const handleRemoveLeave = (id: string) => {
    setTakenLeaves(takenLeaves.filter(leave => leave.id !== id));
  };

  return (
    <div className="min-h-screen bg-stone-50 text-right font-sans antialiased text-stone-900 px-4 sm:px-6 lg:px-8 py-8" dir="rtl">
      
      {/* 1. Simplified Elegant Header */}
      <div className="max-w-6xl mx-auto mb-8 border-b border-stone-200 pb-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black text-stone-900 flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#00796B]" />
            <span>تصفية مستحقات نهاية الخدمة</span>
            <span className="text-xs font-bold text-[#00796B] bg-[#00796B]/10 px-2.5 py-0.5 rounded-full border border-[#00796B]/20">قانون العمل الكويتي</span>
          </h1>
          <p className="text-xs text-stone-500 mt-1.5">حاسبة مبسطة ودقيقة لمستحقات مكافأة نهاية الخدمة وتسييل رصيد الإجازات وفقاً للمادتين 51 و 70</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="text-xs px-4 py-2 bg-white text-stone-600 hover:text-stone-900 border border-stone-200 rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة تعيين</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPrintModal(true)}
            className="text-xs px-4 py-2 bg-[#00796B] hover:bg-[#004D40] text-white rounded-xl font-bold transition-all flex items-center gap-1 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>تقرير التصفية (PDF)</span>
          </button>
        </div>
      </div>

      {/* 2. Main Grid Layout */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* RIGHT COLUMN: Minimal Inputs Form (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card A: Employee Info */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <User className="w-4 h-4 text-[#00796B]" />
              <h3 className="text-xs font-bold text-stone-700">القسم الأول: الملف العمالي التعريفي</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 block">اسم الموظف</label>
                <input
                  type="text"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="مثال: أحمد العتيبي"
                  className="w-full text-xs font-bold h-9 px-3 border border-stone-200 bg-stone-50/50 rounded-lg text-stone-900 focus:border-[#00796B] outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 block">الرقم المدني</label>
                <input
                  type="text"
                  value={civilId}
                  onChange={(e) => setCivilId(e.target.value)}
                  placeholder="مثال: ٢٩٠٠٤١٢٠١٢٣٤"
                  className="w-full text-xs font-bold h-9 px-3 border border-stone-200 bg-stone-50/50 rounded-lg text-stone-900 focus:border-[#00796B] outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 block">المسمى الوظيفي</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="مثال: مستشار قانوني"
                  className="w-full text-xs font-bold h-9 px-3 border border-stone-200 bg-stone-50/50 rounded-lg text-stone-900 focus:border-[#00796B] outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[10px] font-bold text-stone-500 block mb-1">جنسية الموظف الخاضع للتسوية</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-stone-100 p-1 rounded-lg flex h-9 border border-stone-200 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setIsKuwaiti(true);
                      setNationality("");
                    }}
                    className={`flex-1 text-center rounded-md text-[10px] font-bold transition-all cursor-pointer border-none ${isKuwaiti ? 'bg-[#00796B] text-white shadow-xs' : 'bg-transparent text-stone-500 hover:text-stone-800'}`}
                  >
                    🇰🇼 كويتي
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsKuwaiti(false);
                    }}
                    className={`flex-1 text-center rounded-md text-[10px] font-bold transition-all cursor-pointer border-none ${!isKuwaiti ? 'bg-[#00796B] text-white shadow-xs' : 'bg-transparent text-stone-500 hover:text-stone-800'}`}
                  >
                    غير كويتي
                  </button>
                </div>

                {!isKuwaiti ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                      placeholder="الجنسية (مثال: مصرية، سورية...)"
                      className="w-full text-xs font-bold h-9 px-3 border border-stone-200 bg-stone-50/50 rounded-lg text-stone-900 focus:border-[#00796B] outline-none transition-all"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value="الكويتية 🇰🇼"
                      disabled
                      className="w-full text-xs font-bold h-9 px-3 border border-stone-200 bg-stone-100 rounded-lg text-stone-400 outline-none select-none cursor-not-allowed"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Performance Notes Input for Experience Certificate */}
            <div className="pt-2 border-t border-dashed border-stone-200 mt-2">
              <label className="text-[10px] font-bold text-stone-500 block mb-1">ملاحظات الأداء السلوكي والمهني (لإدراجها تلقائياً في شهادة الخبرة)</label>
              <textarea
                value={performanceNotes}
                onChange={(e) => setPerformanceNotes(e.target.value)}
                rows={2}
                placeholder="أبدى الموظف خلال فترة عمله انضباطاً عالياً، وتعاوناً مثمراً مع زملائه، وأظهر مهارات مهنية متميزة في أداء المهام الموكلة إليه."
                className="w-full text-xs font-medium p-2.5 border border-stone-200 bg-stone-50/50 rounded-lg text-stone-900 focus:border-[#00796B] outline-none transition-all resize-none"
              />
            </div>
          </div>

          {/* Card B: Core Employment Determinants & Reason */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <Briefcase className="w-4 h-4 text-[#00796B]" />
              <h3 className="text-xs font-bold text-stone-700">القسم الثاني: محددات الخدمة والسبب القانوني</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 block">تاريخ التعيين</label>
                <input
                  type="date"
                  value={joiningDate}
                  onChange={(e) => setJoiningDate(e.target.value)}
                  className="w-full text-xs font-bold h-9 px-3 border border-stone-200 bg-stone-50/50 rounded-lg text-stone-900 focus:border-[#00796B] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 block">تاريخ انتهاء الخدمة</label>
                <input
                  type="date"
                  value={exitDate}
                  onChange={(e) => setExitDate(e.target.value)}
                  className="w-full text-xs font-bold h-9 px-3 border border-stone-200 bg-stone-50/50 rounded-lg text-stone-900 focus:border-[#00796B] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 block">أيام الغياب غير المدفوع</label>
                <input
                  type="number"
                  min="0"
                  value={unpaidAbsenceDays}
                  onChange={(e) => setUnpaidAbsenceDays(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full text-xs font-bold h-9 px-3 border border-stone-200 bg-stone-50/50 rounded-lg text-stone-900 focus:border-[#00796B] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-1">
              <div className="sm:col-span-4 space-y-1">
                <span className="text-[10px] font-bold text-stone-500 block">نوع عقد العمل</span>
                <div className="bg-stone-100 p-1 rounded-lg flex h-9 border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setContractType(ContractTypeKuwait.UNLIMITED)}
                    className={`flex-1 text-center rounded-md text-[10px] font-bold transition-all cursor-pointer border-none ${contractType === ContractTypeKuwait.UNLIMITED ? 'bg-[#00796B] text-white shadow-xs' : 'bg-transparent text-stone-500 hover:text-stone-800'}`}
                  >
                    غير محدد
                  </button>
                  <button
                    type="button"
                    onClick={() => setContractType(ContractTypeKuwait.LIMITED)}
                    className={`flex-1 text-center rounded-md text-[10px] font-bold transition-all cursor-pointer border-none ${contractType === ContractTypeKuwait.LIMITED ? 'bg-[#00796B] text-white shadow-xs' : 'bg-transparent text-stone-500 hover:text-stone-800'}`}
                  >
                    محدد المدة
                  </button>
                </div>
              </div>

              <div className="sm:col-span-8 space-y-1">
                <label className="text-[10px] font-bold text-stone-500 block">سبب انتهاء الخدمة وموجبات المكافأة</label>
                <select
                  value={terminationReason}
                  onChange={(e) => setTerminationReason(e.target.value)}
                  className="w-full text-[11px] font-bold h-9 px-2 border border-stone-200 bg-stone-50 rounded-lg text-stone-800 focus:border-[#00796B] outline-none"
                >
                  <optgroup label="الاستقالة (مبادرة من الموظف - المادة 53)">
                    <option value={TerminationReasonKuwait.RESIGNATION_UNDER_3_YEARS}>استقالة (خدمة أقل من ٣ سنوات) - لا مكافأة</option>
                    <option value={TerminationReasonKuwait.RESIGNATION_3_TO_5_YEARS}>استقالة (خدمة من ٣ إلى ٥ سنوات) - نصف مكافأة</option>
                    <option value={TerminationReasonKuwait.RESIGNATION_5_TO_10_YEARS}>استقالة (خدمة من ٥ إلى ١٠ سنوات) - ثلثي مكافأة</option>
                    <option value={TerminationReasonKuwait.RESIGNATION_10_PLUS_YEARS}>استقالة (خدمة ١٠ سنوات فأكثر) - مكافأة كاملة</option>
                    <option value={TerminationReasonKuwait.PROBATION_RESIGNATION}>استقالة عمالية خلال فترة التجربة - لا مكافأة</option>
                  </optgroup>
                  <optgroup label="إنهاء الخدمة بواسطة صاحب العمل (استحقاق كامل)">
                    <option value={TerminationReasonKuwait.DISMISSAL_WITH_NOTICE}>إنهاء الخدمة مع مهلة إخطار - استحقاق كامل</option>
                    <option value={TerminationReasonKuwait.ORGANIZATIONAL_REDUNDANCY}>إنهاء لأسباب تنظيمية وتقليص العمالة - استحقاق كامل</option>
                    <option value={TerminationReasonKuwait.CLOSURE_OR_BANKRUPTCY}>إغلاق المنشأة النهائي أو إفلاسها - استحقاق كامل</option>
                    <option value={TerminationReasonKuwait.CONTRACT_EXPIRY}>انتهاء مدة العقد (للعقود محددة المدة) - استحقاق كامل</option>
                  </optgroup>
                  <optgroup label="الفصل التأديبي / الحرمان من المكافأة (المادة 41)">
                    <option value={TerminationReasonKuwait.DISMISSAL_WITHOUT_NOTICE_ART_41}>فصل العامل لأسباب المادة 41 العامة - حرمان كامل</option>
                    <option value={TerminationReasonKuwait.DISMISSAL_ART_41_LOSS}>فصل (المادة 41): خطأ جسيم تسبب في خسارة فادحة</option>
                    <option value={TerminationReasonKuwait.DISMISSAL_ART_41_FRAUD}>فصل (المادة 41): الحصول على العمل بالغش أو التدليس</option>
                    <option value={TerminationReasonKuwait.DISMISSAL_ART_41_SECRETS}>فصل (المادة 41): إفشاء أسرار المنشأة مسبباً خسائر مؤكدة</option>
                    <option value={TerminationReasonKuwait.DISMISSAL_ART_41_MORALS}>فصل (المادة 41): ارتكاب فعل مخل بالآداب أو جريمة شرف</option>
                    <option value={TerminationReasonKuwait.DISMISSAL_ART_41_ASSAULT}>فصل (المادة 41): الاعتداء بالضرب أو الإهانة على زملاء العمل</option>
                    <option value={TerminationReasonKuwait.DISMISSAL_ART_41_OBLIGATIONS}>فصل (المادة 41): الإخلال الجسيم بالالتزامات العقدية وسلامة المنشأة</option>
                    <option value={TerminationReasonKuwait.TERMINATION_FOR_ABSENCE}>إنهاء الخدمة بسبب الانقطاع والغياب عن العمل (المادة 42)</option>
                    <option value={TerminationReasonKuwait.PROBATION_TERMINATION}>إنهاء الخدمة بواسطة صاحب العمل خلال فترة التجربة</option>
                  </optgroup>
                </select>

                {/* Dynamic Validation Warning Tooltip for EOS */}
                {(() => {
                  const yearsFloat = duration.activeTotalDays / 365.25;
                  const isResignation = [
                    TerminationReasonKuwait.RESIGNATION,
                    TerminationReasonKuwait.RESIGNATION_UNDER_3_YEARS,
                    TerminationReasonKuwait.RESIGNATION_3_TO_5_YEARS,
                    TerminationReasonKuwait.RESIGNATION_5_TO_10_YEARS,
                    TerminationReasonKuwait.RESIGNATION_10_PLUS_YEARS
                  ].includes(terminationReason as any);
                  
                  const isDisciplinary = terminationReason.includes('DISMISSAL_ART_41') || 
                                         terminationReason.includes('TERMINATION_FOR_ABSENCE') ||
                                         terminationReason.includes('PROBATION_TERMINATION') ||
                                         terminationReason.includes('PROBATION_RESIGNATION');

                  const hasWarning = computations.conversionScale < 1.0 || yearsFloat < 1;

                  if (!hasWarning) return null;

                  let title = "تنبيه تدقيق: المكافأة غير كاملة ⚠️";
                  let description = "";
                  let lawArticle = "";

                  if (yearsFloat < 1) {
                    title = "عدم استحقاق لعدم اكتمال سنة ⚠️";
                    description = `العامل لم يكمل سنة كاملة من الخدمة الفعلية (المدة الحالية: ${duration.years} سنة، ${duration.months} شهر، ${duration.days} يوم).`;
                    lawArticle = "المادة 51: يشترط لاستحقاق مكافأة نهاية الخدمة اكتمال سنة عمل واحدة على الأقل لدى نفس صاحب العمل للبدء بالاحتساب المالي.";
                  } else if (isDisciplinary) {
                    title = "حرمان تأديبي كامل من المكافأة 🚨";
                    description = "بناءً على الفصل التأديبي أو الانقطاع عن العمل أو الإنهاء في فترة التجربة، فإن العامل لا يستحق أي مكافأة عمالية.";
                    lawArticle = "المادة 41: يُحرم العامل من كامل مكافأة نهاية الخدمة في حال فصله تأديبياً لارتكابه أحد المخالفات الجسيمة المذكورة قانوناً.";
                  } else if (isResignation) {
                    if (yearsFloat < 3) {
                      title = "استقالة دون حد الخدمة الأدنى (0%) ⚠️";
                      description = `العامل مستقيل بمدة خدمة أقل من 3 سنوات (${yearsFloat.toFixed(2)} سنة). لا يستحق أي مكافأة نهائياً.`;
                      lawArticle = "المادة 53: الموظف المستقيل لا يستحق مكافأة نهاية الخدمة إذا تقلصت مدة خدمته عن 3 سنوات متتالية.";
                    } else if (yearsFloat >= 3 && yearsFloat < 5) {
                      title = "استقالة بنصف مكافأة فقط (50%) ⚠️";
                      description = `الموظف مستقيل بمدة خدمة بين 3 و 5 سنوات (${yearsFloat.toFixed(2)} سنة). يستحق نصف المكافأة الكاملة فقط.`;
                      lawArticle = "المادة 53: الموظف المستقيل يستحق نصف المكافأة إذا تراوحت مدة خدمته بين 3 سنوات وأقل من 5 سنوات.";
                    } else if (yearsFloat >= 5 && yearsFloat < 10) {
                      title = "استقالة بثلثي مكافأة فقط (66.67%) ⚠️";
                      description = `الموظف مستقيل بمدة خدمة بين 5 و 10 سنوات (${yearsFloat.toFixed(2)} سنة). يستحق ثلثي المكافأة الكاملة فقط.`;
                      lawArticle = "المادة 53: الموظف المستقيل يستحق ثلثي المكافأة إذا تراوحت مدة خدمته بين 5 سنوات وأقل من 10 سنوات.";
                    }
                  }

                  return (
                    <div className="mt-3 bg-amber-50/75 border border-amber-200 rounded-xl p-3 text-right animate-fade-in relative group/tooltip">
                      <div className="flex gap-2">
                        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-[10.5px] font-black text-amber-900 flex items-center gap-1.5">
                            <span>{title}</span>
                            <span className="text-[9px] font-bold bg-amber-100/80 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">تدقيق عمالي</span>
                          </h4>
                          <p className="text-[10px] text-amber-950 font-bold leading-relaxed">{description}</p>
                          <div className="text-[9.5px] text-stone-500 font-medium border-t border-amber-100 pt-1 mt-1 leading-relaxed">
                            <strong>السند القانوني الكويتي:</strong> {lawArticle}
                          </div>
                        </div>
                      </div>
                      
                      {/* Absolute Tooltip on Hover to show more detailed audit advisory */}
                      <div className="absolute z-10 hidden group-hover/tooltip:block bg-stone-900 text-white text-[9.5px] p-3 rounded-xl shadow-lg w-72 -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full border border-stone-800 transition-all leading-relaxed">
                        <div className="space-y-1.5">
                          <p className="font-bold text-amber-400">💡 دليل تدقيق مسؤول الموارد البشرية:</p>
                          <p className="font-medium text-stone-300">• يرجى التحقق من تواريخ التعيين والمخالصة والغياب الفعلي.</p>
                          <p className="font-medium text-stone-300">• تصفية مستحقات الاستقالة تتم عمالياً بمطابقة المادة 53 لضمان الامتثال وعدم الوقوع تحت بطلان الصلح عمالياً.</p>
                        </div>
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full w-2 h-2 bg-stone-900 rotate-45" />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Card C: Salary and Regular Allowances */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <DollarSign className="w-4 h-4 text-[#00796B]" />
              <h3 className="text-xs font-bold text-stone-700">القسم الثالث: تفاصيل الراتب والبدلات</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 block">الراتب الأساسي الشهري</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={basicSalary || ''}
                    onChange={(e) => setBasicSalary(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="1000"
                    className="w-full text-xs font-bold h-9 pr-3 pl-12 border border-stone-200 bg-stone-50/50 rounded-lg text-stone-900 focus:border-[#00796B] outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-[10px] font-bold text-stone-400">د.ك</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-stone-500 block">العلاوات والبدلات المنتظمة (جزء من الراتب الشامل)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={allowableAllowance || ''}
                    onChange={(e) => setAllowableAllowance(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0"
                    className="w-full text-xs font-bold h-9 pr-3 pl-12 border border-stone-200 bg-stone-50/50 rounded-lg text-stone-900 focus:border-[#00796B] outline-none"
                  />
                  <span className="absolute left-3 top-2.5 text-[10px] font-bold text-stone-400">د.ك</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card D: Interactive Leaves & Taken Leaves with Dates */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100 justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00796B]" />
                <h3 className="text-xs font-bold text-stone-700">القسم الرابع: الإجازات والإجازات المستخدمة بالتواريخ</h3>
              </div>
              <span className="text-[9px] font-bold bg-[#00796B]/10 text-[#00796B] px-2 py-0.5 rounded border border-[#00796B]/20 font-sans">المادة 70</span>
            </div>

            {/* Live Accrual Breakdown Panel */}
            <div className="bg-stone-50 p-4 border border-stone-150 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-stone-800">
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold text-stone-400 block">المستحقة طوال الخدمة:</span>
                <span className="text-xs font-black text-stone-900 font-sans">{computations.accruedLeaveDays.toFixed(1)} <span className="text-[9px] text-stone-500">يوم</span></span>
              </div>
              <div className="space-y-0.5 border-r border-stone-200">
                <span className="text-[9px] font-bold text-stone-400 block">الإجازات المستخدمة:</span>
                <span className="text-xs font-black text-rose-600 font-sans">{computations.totalTakenLeaveDays} <span className="text-[9px] text-stone-500">يوم</span></span>
              </div>
              <div className="space-y-0.5 border-r border-stone-200 flex flex-col justify-center items-center">
                <span className="text-[9px] font-bold text-stone-400 block">صافي رصيد الإجازات:</span>
                <span className="text-xs font-black text-stone-900 font-sans">{computations.remainingLeaveDays.toFixed(1)} <span className="text-[9px] text-stone-500">يوم</span></span>
                {computations.remainingLeaveDays < 0 && (
                  <span className="inline-flex items-center gap-0.5 mt-1 text-[8px] font-black text-rose-700 bg-rose-50 border border-rose-200 px-1.5 py-0.5 rounded-md leading-none">
                    رصيد سالب ⚠️
                  </span>
                )}
                {computations.remainingLeaveDays === 0 && (
                  <span className="inline-flex items-center gap-0.5 mt-1 text-[8px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-md leading-none">
                    رصيد مستنفد ⚠️
                  </span>
                )}
                {computations.remainingLeaveDays > 0 && computations.remainingLeaveDays <= 5 && (
                  <span className="inline-flex items-center gap-0.5 mt-1 text-[8px] font-black text-amber-600 bg-amber-50 border border-amber-150 px-1.5 py-0.5 rounded-md leading-none">
                    قريب من النفاذ ⚠️
                  </span>
                )}
                {computations.remainingLeaveDays > leaveCapDays && (
                  <span className="inline-flex items-center gap-0.5 mt-1 text-[8px] font-black text-rose-700 bg-rose-50 border border-rose-150 px-1.5 py-0.5 rounded-md leading-none">
                    تجاوز الحد الأقصى ⚠️
                  </span>
                )}
              </div>
              <div className="space-y-0.5 border-r border-stone-200">
                <span className="text-[9px] font-bold text-stone-400 block">التعويض المالي:</span>
                <span className="text-xs font-black text-[#00796B] font-sans">{computations.leaveCompensation.toLocaleString(undefined, { minimumFractionDigits: 3 })} <span className="text-[8px] text-stone-500">د.ك</span></span>
              </div>
            </div>

            {/* Visual Leave Alert System (Badge & Details) */}
            {(computations.remainingLeaveDays <= 5 || computations.remainingLeaveDays > leaveCapDays) && (
              <div className={`rounded-xl border p-3.5 space-y-2 animate-fade-in transition-all text-right ${
                computations.remainingLeaveDays < 0 
                  ? 'bg-rose-50/60 border-rose-200 text-rose-950' 
                  : computations.remainingLeaveDays === 0
                    ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                    : computations.remainingLeaveDays > leaveCapDays 
                      ? 'bg-rose-50/50 border-rose-200 text-rose-950' 
                      : 'bg-amber-50/40 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center gap-2">
                  {computations.remainingLeaveDays > leaveCapDays ? (
                    <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  )}
                  <span className="text-[10.5px] font-black">
                    {computations.remainingLeaveDays < 0 && 'تنبيه الموارد البشرية: رصيد الإجازات السنوية مكشوف وسالب!'}
                    {computations.remainingLeaveDays === 0 && 'تنبيه الموارد البشرية: رصيد الإجازات السنوية مستنفد بالكامل!'}
                    {computations.remainingLeaveDays > 0 && computations.remainingLeaveDays <= 5 && 'تنبيه الموارد البشرية: رصيد الإجازات السنوية أوشك على النفاذ!'}
                    {computations.remainingLeaveDays > leaveCapDays && 'تنبيه قانوني هام: رصيد الإجازات يتجاوز الحد المسموح به نقداً!'}
                  </span>
                </div>
                
                <p className="text-[10px] leading-relaxed font-semibold opacity-90">
                  {computations.remainingLeaveDays < 0 && (
                    <>
                      يبلغ صافي رصيد الموظف <strong className="font-sans text-rose-700">({computations.remainingLeaveDays.toFixed(1)} يوماً)</strong>. 
                      لقد تجاوز الموظف رصيد إجازاته المستحقة له قانوناً مما يتطلب التدقيق الإداري، ويحق لصاحب العمل خصم القيمة المعادلة للأيام الزائدة من راتبه الشامل أو من تصفية مستحقاته النهائية.
                    </>
                  )}
                  {computations.remainingLeaveDays === 0 && (
                    <>
                      رصيد إجازات الموظف صفر تماماً. لن يستحق الموظف أي بدل مالي نقدي عن رصيد الإجازات الدورية غير المستخدمة عند تصفية مستحقات نهاية خدمته.
                    </>
                  )}
                  {computations.remainingLeaveDays > 0 && computations.remainingLeaveDays <= 5 && (
                    <>
                      يبلغ صافي رصيد الإجازات المتبقي <strong className="font-sans text-amber-700">({computations.remainingLeaveDays.toFixed(1)} يوماً)</strong> فقط. 
                      هذا الرصيد منخفض جداً، يرجى مراجعة سجلات الإجازات لضمان عدم وجود إجازات غير مسجلة بالمنظومة قبل إتمام المخالصة النهائية.
                    </>
                  )}
                  {computations.remainingLeaveDays > leaveCapDays && (
                    <>
                      يبلغ رصيد إجازات الموظف الصافي <strong className="font-sans text-rose-700">({computations.remainingLeaveDays.toFixed(1)} يوماً)</strong>، 
                      وهو ما يتجاوز الحد الأقصى المسموح بتسييله وصرفه نقداً بموجب المادة (70) من قانون العمل الكويتي بالقطاع الأهلي والذي يسقف التراكم والتعويض النقدي عند <strong className="font-sans text-[#00796B]">({leaveCapDays} يوماً)</strong> فقط للعامين الأخيرين من الخدمة. 
                      <span className="block mt-1 font-black text-rose-700">⚠️ تم تطبيق الحد الأقصى ({leaveCapDays} يوماً) تلقائياً على التعويض المالي الظاهر في كشف حساب التصفية.</span>
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Leave addition form */}
            <div className="border border-stone-150 rounded-xl p-3 bg-stone-50/40 space-y-3">
              <span className="text-[10px] font-bold text-[#00796B] block">تسجيل إجازة مستخدمة جديدة (تُستقطع تلقائياً بالتواريخ):</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-stone-400 block">من تاريخ</label>
                  <input
                    type="date"
                    value={leaveFromDate}
                    onChange={(e) => setLeaveFromDate(e.target.value)}
                    className="w-full text-xs font-bold h-8 px-2 border border-stone-200 bg-white rounded-lg outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-stone-400 block">إلى تاريخ</label>
                  <input
                    type="date"
                    value={leaveToDate}
                    onChange={(e) => setLeaveToDate(e.target.value)}
                    className="w-full text-xs font-bold h-8 px-2 border border-stone-200 bg-white rounded-lg outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-stone-400 block">نوع الإجازة</label>
                  <select
                    value={leaveTypeState}
                    onChange={(e) => setLeaveTypeState(e.target.value)}
                    className="w-full text-[10px] font-bold h-8 px-1 border border-stone-200 bg-white rounded-lg outline-none"
                  >
                    <option value="annual">إجازة سنوية (مدفوعة)</option>
                    <option value="sick_paid">إجازة مرضية (مدفوعة)</option>
                    <option value="sick_unpaid">إجازة مرضية (غير مدفوعة)</option>
                    <option value="special_paid">إجازة خاصة (مدفوعة)</option>
                    <option value="special_unpaid">إجازة خاصة (غير مدفوعة)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-stone-400 block">ملاحظات / الوصف</label>
                  <input
                    type="text"
                    value={leaveNote}
                    onChange={(e) => setLeaveNote(e.target.value)}
                    placeholder="مثال: إجازة الصيف"
                    className="w-full text-xs font-medium h-8 px-2 border border-stone-200 bg-white rounded-lg outline-none"
                  />
                </div>
              </div>

              {/* Legal Effect Note */}
              <div className="bg-[#E0F2F1] border border-[#B2DFDB] text-[10px] p-2.5 rounded-lg text-[#004D40] leading-relaxed">
                <span className="font-extrabold block mb-0.5">⚠️ التأثير التلقائي بموجب القانون الكويتي:</span>
                {leaveTypeState === 'annual' && 'خصم الأيام الفعلية الصافية من رصيد الإجازات السنوية للموظف. لا تؤثر على مدة الخدمة الفعلية.'}
                {leaveTypeState === 'sick_paid' && 'إجازة مرضية مدفوعة الأجر بالكامل (المادة 69). لا تؤثر على مدة الخدمة ولا تُخصم من رصيد الإجازات.'}
                {leaveTypeState === 'sick_unpaid' && 'إجازة مرضية غير مدفوعة الأجر (المادة 69). تُعتبر فترة انقطاع وتُخصم تلقائياً من مدة الخدمة الفعلية لتخفيض مكافأة نهاية الخدمة.'}
                {leaveTypeState === 'special_paid' && 'إجازة خاصة مدفوعة الأجر (وفاة، زواج، حج). لا تؤثر على مدة الخدمة ولا تُخصم من رصيد الإجازات.'}
                {leaveTypeState === 'special_unpaid' && 'إجازة استثنائية غير مدفوعة الأجر بموافقة صاحب العمل. تُعتبر فترة انقطاع وتُخصم تلقائياً من مدة الخدمة الفعلية لتخفيض مكافأة نهاية الخدمة.'}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddLeave}
                  className="px-4 py-1.5 bg-[#00796B] hover:bg-[#004D40] text-white rounded-lg font-bold text-[10px] transition-all flex items-center gap-1 cursor-pointer border-none"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تسجيل وإضافة الإجازة</span>
                </button>
              </div>
            </div>

            {/* List of taken leaves */}
            {takenLeaves.length > 0 ? (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-stone-500 block">سجل فترات الإجازات المستخدمة المسجلة:</span>
                <div className="border border-stone-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                  <table className="w-full text-right border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-stone-50 text-stone-500 border-b border-stone-200 font-bold">
                        <th className="p-2">الفترة</th>
                        <th className="p-2 text-center">أيام التقويم</th>
                        <th className="p-2 text-center">أيام الجمع (مستبعدة)</th>
                        <th className="p-2 text-center">صافي الخصم</th>
                        <th className="p-2">النوع والملاحظات</th>
                        <th className="p-2 text-center">حذف</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {takenLeaves.map((leave) => (
                        <tr key={leave.id} className="hover:bg-stone-50/50 text-stone-700 font-semibold">
                          <td className="p-2 font-mono text-[9px]">من {leave.fromDate} إلى {leave.toDate}</td>
                          <td className="p-2 text-center font-sans text-stone-900">{leave.days}</td>
                          <td className="p-2 text-center font-sans text-teal-600">{leave.fridaysCount}</td>
                          <td className="p-2 text-center font-sans text-rose-600 font-black">{leave.netDays}</td>
                          <td className="p-2">
                            <span className="text-slate-500 block">{leave.leaveType}</span>
                            <span className="text-[9px] text-stone-400 font-medium block">{leave.note}</span>
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveLeave(leave.id)}
                              className="text-rose-500 hover:text-rose-700 bg-transparent border-none cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[9px] text-stone-400 leading-relaxed font-medium">
                  * وفقاً للمادة 70، يُستبعد أيام الجمع المتخللة للإجازة الدورية عند حساب الرصيد المستخدم ما لم ينص العقد على غير ذلك. صافي الخصم هو المعتمد في تصفية نهاية الخدمة.
                </p>
              </div>
            ) : (
              <div className="bg-stone-50 border border-dashed border-stone-200 rounded-xl p-6 text-center text-[10.5px] text-stone-400 font-bold">
                لا يوجد فترات إجازات مستخدمة مسجلة حالياً. استخدم النموذج أعلاه لتسجيل الإجازات بتواريخها الدقيقة.
              </div>
            )}
          </div>

          {/* Card E: Extra Adjustments */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
              <DollarSign className="w-4 h-4 text-[#00796B]" />
              <h3 className="text-xs font-bold text-stone-700">القسم الخامس: بنود إضافية للتصفية (مستحقات واستقطاعات أخرى)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Additions */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-[#00796B]">مستحقات إضافية (أخرى)</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempAddDesc}
                    onChange={(e) => setTempAddDesc(e.target.value)}
                    placeholder="مثال: مكافأة تميز"
                    className="flex-1 text-xs font-medium h-8 px-2 border border-stone-200 rounded-lg outline-none"
                  />
                  <input
                    type="number"
                    value={tempAddAmt}
                    onChange={(e) => setTempAddAmt(e.target.value)}
                    placeholder="المبلغ"
                    className="w-16 text-xs font-bold h-8 px-2 border border-stone-200 rounded-lg outline-none font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleAddAddition}
                    className="h-8 w-8 bg-[#00796B] text-white rounded-lg flex items-center justify-center font-bold text-xs hover:bg-[#004D40] border-none cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {additions.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {additions.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-stone-50 border border-stone-150 rounded-lg text-[10.5px]">
                        <span className="font-semibold text-stone-700">{item.description}</span>
                        <div className="flex items-center gap-2 font-bold font-sans text-stone-900">
                          <span>{item.amount} د.ك</span>
                          <button type="button" onClick={() => handleRemoveAddition(item.id)} className="text-rose-500 hover:text-rose-700 bg-transparent border-none cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Deductions */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-rose-600">استقطاعات عمالية أخرى</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempDeductDesc}
                    onChange={(e) => setTempDeductDesc(e.target.value)}
                    placeholder="مثال: سلفة مستلمة"
                    className="flex-1 text-xs font-medium h-8 px-2 border border-stone-200 rounded-lg outline-none"
                  />
                  <input
                    type="number"
                    value={tempDeductAmt}
                    onChange={(e) => setTempDeductAmt(e.target.value)}
                    placeholder="المبلغ"
                    className="w-16 text-xs font-bold h-8 px-2 border border-stone-200 rounded-lg outline-none font-sans"
                  />
                  <button
                    type="button"
                    onClick={handleAddDeduction}
                    className="h-8 w-8 bg-rose-600 text-white rounded-lg flex items-center justify-center font-bold text-xs hover:bg-rose-700 border-none cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {deductions.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {deductions.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 bg-stone-50 border border-stone-150 rounded-lg text-[10.5px]">
                        <span className="font-semibold text-stone-700">{item.description}</span>
                        <div className="flex items-center gap-2 font-bold font-sans text-stone-950">
                          <span>{item.amount} د.ك</span>
                          <button type="button" onClick={() => handleRemoveDeduction(item.id)} className="text-rose-500 hover:text-rose-700 bg-transparent border-none cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* LEFT COLUMN: Clean Real-time Calculation Sheet (5/12) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card D: Clean Real-time Output */}
          <div className="bg-white rounded-2xl border-2 border-[#00796B]/30 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <span className="text-xs font-black text-stone-800 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#00796B]" />
                كشف تسوية مستحقات عمالية
              </span>
              <span className="text-[9px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">نظام ممتثل بالكامل</span>
            </div>

            {/* Final Big Number */}
            <div className="bg-stone-50/70 border border-stone-150 rounded-2xl p-5 text-center space-y-1.5">
              <span className="text-[10px] font-bold text-stone-500 block">صافي مبلغ التصفية النهائي</span>
              <span className="text-2xl font-black text-[#00796B] font-sans block">{computations.netPayout.toLocaleString('ar-KW', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} <span className="text-sm">د.ك</span></span>
              <p className="text-[9.5px] font-bold text-stone-500 leading-relaxed max-w-xs mx-auto">{NumberToKuwaitiWords(computations.netPayout)}</p>
            </div>

            {/* Active Service Duration details */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-stone-500 block">١. مدة الخدمة الصافية للعمل الفعلي</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2.5 bg-stone-50/50 rounded-xl border border-stone-150">
                  <span className="text-base font-black text-stone-900 font-sans block">{duration.years}</span>
                  <span className="text-[9px] font-bold text-stone-500 block">سنة</span>
                </div>
                <div className="p-2.5 bg-stone-50/50 rounded-xl border border-stone-150">
                  <span className="text-base font-black text-stone-900 font-sans block">{duration.months}</span>
                  <span className="text-[9px] font-bold text-stone-500 block">شهر</span>
                </div>
                <div className="p-2.5 bg-stone-50/50 rounded-xl border border-stone-150">
                  <span className="text-base font-black text-stone-900 font-sans block">{duration.days}</span>
                  <span className="text-[9px] font-bold text-stone-500 block">يوم فعلي</span>
                </div>
              </div>
              <p className="text-[9.5px] text-stone-500 font-medium text-center">إجمالي الأيام الميلادية للخدمة: <strong className="font-sans text-stone-850">{duration.totalCalendarDays} يوماً</strong></p>
            </div>

            {/* Sub-breakdown parameters */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-[10px] font-black text-stone-500 block mb-1">٢. تفاصيل احتساب المستحقات والمكافأة</span>
              
              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-stone-500 font-medium">الراتب الأساسي مع البدلات بانتظام:</span>
                <span className="font-bold text-stone-900 font-sans">{(basicSalary + allowableAllowance).toLocaleString()} د.ك</span>
              </div>

              <div className="flex justify-between items-center text-xs py-1">
                <span className="text-stone-500 font-medium">مكافأة نهاية الخدمة (المادة 51):</span>
                <span className="font-bold text-stone-900 font-sans flex items-center gap-1.5">
                  {computations.finalIndemnity.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                  {(computations.conversionScale < 1.0 || (duration.activeTotalDays / 365.25) < 1) && (
                    <span 
                      className="inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse cursor-help" 
                      title="مكافأة غير كاملة أو مستبعدة قانوناً - راجع التفصيل في قسم سبب انتهاء الخدمة"
                    />
                  )}
                </span>
              </div>

              <div className="flex justify-between items-start text-xs py-1 flex-col sm:flex-row sm:items-center gap-1">
                <div className="flex flex-col">
                  <span className="text-stone-500 font-medium">التعويض عن رصيد الإجازات (المادة 70):</span>
                  {computations.remainingLeaveDays > leaveCapDays && (
                    <span className="text-[8px] font-black text-rose-700 bg-rose-50 border border-rose-100 px-1 rounded mt-0.5 w-fit">
                      تم تطبيق سقف التعويض ({leaveCapDays} يوماً)
                    </span>
                  )}
                  {computations.remainingLeaveDays < 0 && (
                    <span className="text-[8px] font-black text-rose-700 bg-rose-50 border border-rose-100 px-1 rounded mt-0.5 w-fit">
                      رصيد سالب (لا يستحق تعويض)
                    </span>
                  )}
                  {computations.remainingLeaveDays === 0 && (
                    <span className="text-[8px] font-black text-stone-500 bg-stone-100 border border-stone-200 px-1 rounded mt-0.5 w-fit">
                      رصيد مستنفد (لا يستحق تعويض)
                    </span>
                  )}
                </div>
                <span className="font-bold text-stone-900 font-sans">{computations.leaveCompensation.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
              </div>

              {computations.pifssOffsetApplied > 0 && (
                <div className="flex justify-between items-center text-xs py-1 text-rose-600">
                  <span className="font-semibold">استقطاع حصة صاحب العمل بالـ (PIFSS):</span>
                  <span className="font-bold font-sans">-{computations.pifssOffsetApplied.toLocaleString()} د.ك</span>
                </div>
              )}

              {computations.totalAdditions > 0 && (
                <div className="flex justify-between items-center text-xs py-1 text-teal-600">
                  <span className="font-semibold">إجمالي مستحقات إضافية أخرى:</span>
                  <span className="font-bold font-sans">+{computations.totalAdditions.toLocaleString()} د.ك</span>
                </div>
              )}

              {computations.totalDeductions > 0 && (
                <div className="flex justify-between items-center text-xs py-1 text-rose-600">
                  <span className="font-semibold">إجمالي استقطاعات أخرى:</span>
                  <span className="font-bold font-sans">-{computations.totalDeductions.toLocaleString()} د.ك</span>
                </div>
              )}
            </div>

            {/* Quick legal guidance footer on card */}
            <div className="bg-[#00796B]/5 border border-[#00796B]/10 rounded-xl p-3.5 text-[10px] text-stone-600 leading-relaxed space-y-1">
              <p className="font-black text-[#00796B]">توجيهات قانونية وقضائية سريعة:</p>
              <p>• يستند الحساب للراتب الشامل (الأساسي + البدلات المنتظمة الدورية) كما استقر عليه قضاء محكمة التمييز الكويتية.</p>
              <p>• تعويض الإجازات المتراكمة يخضع لقاسم ثابت يبلغ ٢٦ يوماً بالمطابقة مع المادة ٧٠ من قانون العمل.</p>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Official Legal Receipt & Release Document (إقرار وتعهد ومخالصة نهائية بالتراضي) */}
      <div className="max-w-6xl mx-auto mt-8 bg-[#FAF8F5] border-2 border-stone-200 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        
        {/* Document Frame / Header ornament */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-600 via-[#00796B] to-amber-600" />
        
        <div className="absolute top-6 left-6 opacity-[0.04] pointer-events-none select-none">
          <Scale className="w-24 h-24 text-stone-900" />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-200 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#00796B]" />
            <div>
              <h3 className="text-sm font-black text-stone-900">صيغة الإقرار والمخالصة العمالية النهائية المبرمة بالتراضي</h3>
              <p className="text-[10px] text-stone-500 mt-0.5">وثيقة مخالصة قانونية وتصفية إبراء ذمة متوافقة مع محاكم وزارة العدل الكويتية</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopyWaiverText}
              className={`text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${copied ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200'}`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'تم نسخ الإقرار!' : 'نسخ صيغة الإقرار'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="text-xs px-3.5 py-1.5 bg-[#00796B] hover:bg-[#004D40] text-white rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer border-none"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة وتوقيع الإقرار</span>
            </button>
          </div>
        </div>

        {/* The Actual Legal Document Area */}
        <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="text-center space-y-1">
            <h5 className="text-[11px] font-black text-stone-600 underline decoration-stone-300 underline-offset-4 font-sans">إقرار وتعهد وإبراء ذمة واستلام مخالصة نهائية شاملة</h5>
          </div>

          <div className="text-xs text-stone-800 leading-relaxed text-justify space-y-3 font-medium">
            <p>
              أقر أنا الموقع أدناه الموظف/ <span className="font-extrabold text-stone-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{employeeName || "................................................"}</span>، 
              الجنسية: <span className="font-bold text-stone-900">{isKuwaiti ? "الكويتية 🇰🇼" : (nationality ? `${nationality} 🌍` : "غير الكويتية (وافد)")}</span>، 
              حامل البطاقة المدنية رقم: <span className="font-mono font-bold text-stone-900 bg-stone-150 px-1.5 py-0.5 rounded">{civilId || "............................"}</span>، 
              وبمسمى وظيفي: <span className="font-bold text-stone-900">{jobTitle || "...................................."}</span>، 
              المنتمي لقسم/ <span className="font-bold text-stone-900">{department || "................"}</span>.
            </p>
            <p>
              بأنني قد استلمت وتصفيت كامل مستحقاتي العمالية والمالية والإدارية والقانونية والبدلات والرواتب المستحقة لي الناشئة والمترتبة عن فترة عملي لدى صاحب العمل من تاريخ التعيين <span className="font-mono font-bold text-stone-900">{joiningDate}</span> وحتى انتهاء الخدمة الفعلي في <span className="font-mono font-bold text-stone-900">{exitDate}</span> بسبب <span className="font-extrabold text-[#00796B]">{getFriendlyReasonLabel(terminationReason)}</span>، وذلك بعد مراجعة دقيقة وتفصيلية لبنود الحساب والكسور الرياضية الممتثلة للمادتين (51) و(70) من القانون الكويتي رقم (6/2010)، والتي تمثلت بالقيم الصافية التالية:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-4 bg-stone-50 border border-stone-200/80 p-3 rounded-lg text-[10.5px]">
              <div>
                <span className="text-stone-400 block font-bold">١. صافي مكافأة نهاية الخدمة (المادة ٥١):</span>
                <span className="font-mono font-black text-stone-900">{computations.finalIndemnity.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
              </div>
              <div>
                <span className="text-stone-400 block font-bold">٢. بدل الإجازات السنوية (المادة ٧٠):</span>
                <span className="font-mono font-black text-stone-900">{computations.leaveCompensation.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
              </div>
              <div>
                <span className="text-stone-400 block font-bold">٣. صافي مبلغ التصفية النهائي:</span>
                <span className="font-mono font-black text-[#00796B]">{computations.netPayout.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
              </div>
            </div>

            <p className="bg-[#ECFDF5]/50 border border-emerald-100 p-2.5 rounded-lg text-emerald-950 font-black font-sans">
              وعليه فإن صافي المبلغ النهائي المسلّم لي هو وقدره: {computations.netPayout.toLocaleString('ar-KW', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} د.ك (فقط {NumberToKuwaitiWords(computations.netPayout)} لا غير).
            </p>

            <p>
              وبموجب هذا الإقرار والمخالصة، فإنني أبرئ ذمة صاحب العمل والشركاء والمنشأة إبراء ذمة شاملاً ومانعاً ونهائياً لا رجعة فيه من أي حق أو دعوى أو مطالبة قضائية أو إدارية حالية أو مستقبلية تتعلق بفرع من فروع مستحقاتي العمالية أمام الهيئة العامة للقوى العاملة أو كافة درجات المحاكم الكويتية، وتعتبر هذه براءة ذمة واستلام نهائي وسقوط قطعي لأي نزاع عمالي. كما أتعهد بالالتزام بعدم إفشاء أي أسرار للمنشأة أو التعدي على حقوق ومصالح موكليها أو عملائها طوال فترة عامين تالية لانتهاء الخدمة.
            </p>
          </div>

          {/* Checklist for Interactive Acknowledgement */}
          <div className="border-t border-dashed border-stone-200 pt-4 mt-2 space-y-2">
            <label className="flex items-start gap-2.5 text-[10.5px] font-bold text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeCalculations}
                onChange={(e) => setAgreeCalculations(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-stone-300 text-[#00796B] focus:ring-[#00796B]"
              />
              <span>أقر بصحة التسويات الرياضية والكسور ومبالغ التصفية المبينة أعلاه ومطابقتها للواقع الفعلي لعملي.</span>
            </label>
            <label className="flex items-start gap-2.5 text-[10.5px] font-bold text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeRelease}
                onChange={(e) => setAgreeRelease(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-stone-300 text-[#00796B] focus:ring-[#00796B]"
              />
              <span>أقر باستلام كامل الحقوق والمخالصة المالية وإبراء ذمة صاحب العمل إبراءً كلياً وقاطعاً وشاملاً من أي مطالبات عمالية.</span>
            </label>
            <label className="flex items-start gap-2.5 text-[10.5px] font-bold text-stone-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeConfidentiality}
                onChange={(e) => setAgreeConfidentiality(e.target.checked)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-stone-300 text-[#00796B] focus:ring-[#00796B]"
              />
              <span>أتعهد بالالتزام بعدم إفشاء أسرار المنشأة أو التعدي على حقوق موكليها وسرية معلوماتهم المحفوظة.</span>
            </label>
          </div>

          {/* Signature block with active status based on checklist checks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-stone-150 pt-5 mt-4 text-[11px] text-stone-700">
            <div className={`p-3.5 rounded-xl border transition-all ${agreeCalculations && agreeRelease && agreeConfidentiality ? 'bg-emerald-50/40 border-emerald-200 shadow-3xs' : 'bg-stone-50/50 border-stone-150 opacity-60'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-stone-900">المُقر بما فيه (الموظف المستفيد):</span>
                {agreeCalculations && agreeRelease && agreeConfidentiality ? (
                  <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-sans">بصمة التوقيع جاهزة</span>
                ) : (
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-sans">بانتظار الإقرارات الثلاثة</span>
                )}
              </div>
              <p className="mt-1">الاسم: <strong className="text-stone-900">{employeeName || "................................................"}</strong></p>
              <p>الرقم المدني: <strong className="text-stone-900 font-mono">{civilId || "............................"}</strong></p>
              <p className="mt-3">التوقيع / البصمة العمالية: ...........................................................</p>
            </div>
            
            <div className="p-3.5 rounded-xl border border-stone-150 bg-stone-50/50 flex flex-col justify-between">
              <div>
                <span className="font-black text-stone-900 block mb-1">الطرف الثاني (المنشأة وصاحب العمل):</span>
                <p>اسم المفوض بالإدارة: ...........................................................</p>
                <p>المسمى الوظيفي: ...........................................................</p>
              </div>
              <div className="flex justify-between items-end pt-3 mt-2 border-t border-stone-150/50 text-[10px] text-stone-500">
                <span>توقيع المسؤول والختم الرسمي: ......................</span>
                <span className="font-mono">{new Date(exitDate).toLocaleDateString('ar-KW')} م</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Official Print Modal Overlay */}
      <AnimatePresence>
        {showPrintModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-start justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <EosPrintLayout
                employeeName={employeeName || "الموظف المستفيد"}
                civilId={civilId}
                id={id}
                department={department}
                jobTitle={jobTitle || "مسمى عمالي"}
                isKuwaiti={isKuwaiti}
                nationality={isKuwaiti ? "الكويتية" : nationality}
                joiningDate={joiningDate}
                exitDate={exitDate}
                terminationReason={terminationReason}
                contractType={contractType}
                basicSalary={basicSalary}
                allowableAllowance={allowableAllowance}
                indemnityDivisor={indemnityDivisor}
                grossSalary={basicSalary + allowableAllowance}
                unpaidAbsenceDays={unpaidAbsenceDays}
                enforceLeaveCap={enforceLeaveCap}
                leaveCapDays={leaveCapDays}
                duration={{
                  years: duration.years,
                  months: duration.months,
                  days: duration.days,
                  totalCalendarDays: duration.totalCalendarDays,
                  activeDays: duration.activeTotalDays
                }}
                computations={computations}
                takenLeaves={takenLeaves}
                deductFridaysFromLeaves={deductFridaysFromLeaves}
                leaveAccrualBasis={leaveAccrualBasis}
                additions={additions}
                deductions={deductions}
                performanceNotes={performanceNotes}
                onClose={() => setShowPrintModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
