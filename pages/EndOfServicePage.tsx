import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Trash2, Printer, RefreshCw, Calendar, 
  User, CheckCircle, AlertTriangle, X, Bot, Eye, Scale, FileText,
  Download, Info, ShieldAlert, Award, Globe, Fingerprint, Landmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TerminationReasonKuwait, ContractTypeKuwait } from '../types';
import PrintHeader from '../components/ui/PrintHeader';

// --- Arabic Number-to-Words Converter for Kuwaiti Dinar & Fils ---
function NumberToKuwaitiWords(num: number): string {
  const dinar = Math.floor(num);
  const fils = Math.round((num - dinar) * 1000);
  
  const onesAr = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة"];
  const teensAr = ["ععر", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const tensAr = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundredsAr = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
  const thousandsAr = ["", "ألف", "ألفان", "ثلاثة آلاف", "أربعة آلاف", "خمسة آلاف", "ستة آلاف", "سبعة آلاف", "ثمانية آلاف", "تسعة آلاف", "عشرة آلاف"];
  
  function convertLessThanThousand(n: number): string {
    if (n === 0) return "";
    let parts: string[] = [];
    
    // Hundreds
    const h = Math.floor(n / 100);
    if (h > 0) parts.push(hundredsAr[h]);
    
    // Tens & Ones
    const r = n % 100;
    if (r > 0) {
      if (r <= 10) {
        parts.push(onesAr[r]);
      } else if (r < 20) {
        parts.push(teensAr[r - 10]);
      } else {
        const t = Math.floor(r / 10);
        const o = r % 10;
        if (o > 0) {
          parts.push(onesAr[o] + " و " + tensAr[t]);
        } else {
          parts.push(tensAr[t]);
        }
      }
    }
    return parts.join(" و ");
  }

  function convertDinar(n: number): string {
    if (n === 0) return "صفر";
    let parts: string[] = [];
    
    // Millions
    const m = Math.floor(n / 1000000);
    if (m > 0) {
      parts.push(convertLessThanThousand(m) + " مليون");
    }
    
    // Thousands
    const th = Math.floor((n % 1000000) / 1000);
    if (th > 0) {
      if (th === 1) parts.push("ألف");
      else if (th === 2) parts.push("ألفان");
      else if (th <= 10) parts.push(thousandsAr[th]);
      else parts.push(convertLessThanThousand(th) + " ألف");
    }
    
    // Remainder
    const rem = n % 1000;
    if (rem > 0) {
      parts.push(convertLessThanThousand(rem));
    }
    
    return parts.join(" و ");
  }

  let result = convertDinar(dinar) + " دينار كويتي";
  if (fils > 0) {
    result += " و " + convertLessThanThousand(fils) + " فلساً";
  }
  return "فقط " + result + " لا غير";
}

// --- Duration of Service breakdown Helper ---
interface DurationDetails {
  years: number;
  months: number;
  days: number;
  totalCalendarDays: number;
  activeTotalDays: number;
}

function calculateDurationKuwait(startStr: string, endStr: string, unpaidAbsenceDays: number): DurationDetails {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return { years: 0, months: 0, days: 0, totalCalendarDays: 0, activeTotalDays: 0 };
  }

  // Calculate inclusive calendar days
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalCalendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const activeTotalDays = Math.max(0, totalCalendarDays - unpaidAbsenceDays);

  // Exact year-month-day breakdown on activeTotalDays
  let years = Math.floor(activeTotalDays / 365.25);
  let remainingDays = activeTotalDays % 365.25;
  let months = Math.floor(remainingDays / 30.4375);
  let days = Math.round(remainingDays % 30.4375);

  if (days >= 30) {
    months += 1;
    days -= 30;
  }
  if (months >= 12) {
    years += 1;
    months -= 12;
  }

  return { years, months, days, totalCalendarDays, activeTotalDays };
}

interface FinancialItem {
  description: string;
  amount: number;
}

const EndOfServicePage: React.FC = () => {
  // Preseeded employees covering standard diverse casework of Ministry audits
  const preseededEmployees = [
    {
      id: 'emp1',
      companyName: 'شركة الحلول القانونية المتكاملة المحدودة',
      pamFileNumber: 'KW-902910-A',
      employeeName: 'أحمد محمود مبارك الأنصاري',
      nationality: 'كويتي',
      civilId: '285010112345',
      passportNumber: 'K4019284',
      jobTitle: 'مستشار ومحام مقيد أمام التمييز والدستورية',
      joiningDate: '2018-05-15',
      exitDate: '2026-06-06',
      unpaidAbsenceDays: 4,
      basicSalary: 1500,
      allowableAllowance: 350,
      contractType: ContractTypeKuwait.UNLIMITED,
      terminationReason: TerminationReasonKuwait.DISMISSAL_WITH_NOTICE,
      annualLeaveEntitlement: 30,
      totalAccruedLeaveDays: 145,
      leaveDaysAlreadyTaken: 20,
      additions: [
        { description: 'مكافأة أداء الربع الأول لعام 2026', amount: 450 }
      ] as FinancialItem[],
      deductions: [
        { description: 'تأمين طبي خاص مستقطع شهرياً', amount: 50 }
      ] as FinancialItem[]
    },
    {
      id: 'emp2',
      companyName: 'شركة علي الغانم وأولاده للتجارة العامة',
      pamFileNumber: 'KW-881920-C',
      employeeName: 'مي عبدالكريم العوضي',
      nationality: 'كويتية',
      civilId: '293021401344',
      passportNumber: 'K9012491',
      jobTitle: 'رئيس وحدة المبيعات والخدمات الرقمية',
      joiningDate: '2019-10-01',
      exitDate: '2026-06-01',
      unpaidAbsenceDays: 0,
      basicSalary: 1100,
      allowableAllowance: 200,
      contractType: ContractTypeKuwait.UNLIMITED,
      terminationReason: TerminationReasonKuwait.RESIGNATION, // 6.66 Years -> 2/3 indemnity
      annualLeaveEntitlement: 30,
      totalAccruedLeaveDays: 110,
      leaveDaysAlreadyTaken: 45,
      additions: [] as FinancialItem[],
      deductions: [] as FinancialItem[]
    },
    {
      id: 'emp3',
      companyName: 'الشركة العربية للاستيراد والتصدير وجلب العمالة',
      pamFileNumber: 'KW-738912-E',
      employeeName: 'مجد الدين فايز حماد',
      nationality: 'أردني',
      civilId: '298110502194',
      passportNumber: 'A90291948',
      jobTitle: 'مهندس ميكانيك تكييف وتدفئة',
      joiningDate: '2023-11-15',
      exitDate: '2026-06-01',
      unpaidAbsenceDays: 12,
      basicSalary: 850,
      allowableAllowance: 150,
      contractType: ContractTypeKuwait.UNLIMITED,
      terminationReason: TerminationReasonKuwait.RESIGNATION, // Under 3 years -> 0% indemnity under Art 53
      annualLeaveEntitlement: 30,
      totalAccruedLeaveDays: 76.5,
      leaveDaysAlreadyTaken: 12,
      additions: [] as FinancialItem[],
      deductions: [
        { description: 'تلفيات في مركبة الشركة المستلمة بقيمة العقد', amount: 180 }
      ] as FinancialItem[]
    },
    {
      id: 'emp4',
      companyName: 'مؤسسة الرياض الهندسية للمقاولات العامة',
      pamFileNumber: 'KW-902384-B',
      employeeName: 'روبيرتو دياز سيلفا',
      nationality: 'برازيلي',
      civilId: '290123001294',
      passportNumber: 'PC4019284',
      jobTitle: 'مشرف فني حدادة وتشكيل معادن',
      joiningDate: '2015-01-20',
      exitDate: '2026-06-01',
      unpaidAbsenceDays: 0,
      basicSalary: 950,
      allowableAllowance: 250,
      contractType: ContractTypeKuwait.LIMITED,
      terminationReason: TerminationReasonKuwait.DISMISSAL_WITHOUT_NOTICE_ART_41, // Under Article 41 -> 0% indemnity, but gets leave balance
      annualLeaveEntitlement: 30,
      totalAccruedLeaveDays: 247,
      leaveDaysAlreadyTaken: 10,
      additions: [
        { description: 'أوفر تايم ساعات عمل إضافية معتمدة', amount: 320 }
      ] as FinancialItem[],
      deductions: [
        { description: 'مستحقات سلفة مالية متبقية معلقة', amount: 400 }
      ] as FinancialItem[]
    }
  ];

  // Form State variables
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [companyName, setCompanyName] = useState<string>('شركة الحلول القانونية المتكاملة المحدودة');
  const [pamFileNumber, setPamFileNumber] = useState<string>('KW-902910-A');
  const [employeeName, setEmployeeName] = useState<string>('');
  const [nationality, setNationality] = useState<string>('كويتي');
  const [civilId, setCivilId] = useState<string>('');
  const [passportNumber, setPassportNumber] = useState<string>('');
  const [jobTitle, setJobTitle] = useState<string>('');
  const [joiningDate, setJoiningDate] = useState<string>('2018-05-15');
  const [exitDate, setExitDate] = useState<string>('2026-06-06');
  const [unpaidAbsenceDays, setUnpaidAbsenceDays] = useState<number>(0);
  
  const [basicSalary, setBasicSalary] = useState<number>(1200);
  const [allowableAllowance, setAllowableAllowance] = useState<number>(200);
  const [contractType, setContractType] = useState<ContractTypeKuwait>(ContractTypeKuwait.UNLIMITED);
  const [terminationReason, setTerminationReason] = useState<TerminationReasonKuwait>(TerminationReasonKuwait.DISMISSAL_WITH_NOTICE);

  const [annualLeaveEntitlement, setAnnualLeaveEntitlement] = useState<number>(30);
  const [totalAccruedLeaveDays, setTotalAccruedLeaveDays] = useState<number>(180);
  const [leaveDaysAlreadyTaken, setLeaveDaysAlreadyTaken] = useState<number>(15);

  // Lists of Additions and Deductions
  const [additions, setAdditions] = useState<FinancialItem[]>([]);
  const [deductions, setDeductions] = useState<FinancialItem[]>([]);

  // Individual inputs for additions / deductions
  const [addDesc, setAddDesc] = useState<string>('');
  const [addAmt, setAddAmt] = useState<string>('');
  const [deductDesc, setDeductDesc] = useState<string>('');
  const [deductAmt, setDeductAmt] = useState<string>('');

  // Controlling result layout visibility & print modal
  const [showResult, setShowResult] = useState<boolean>(true);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'calculations' | 'legalReferences'>('calculations');
  const [activePageTab, setActivePageTab] = useState<'calculator' | 'dossier'>('calculator');

  // Reset form function
  const handleResetForm = () => {
    setSelectedEmpId('');
    setCompanyName('');
    setPamFileNumber('');
    setEmployeeName('');
    setNationality('كويتي');
    setCivilId('');
    setPassportNumber('');
    setJobTitle('');
    setJoiningDate('');
    setExitDate('');
    setUnpaidAbsenceDays(0);
    setBasicSalary(0);
    setAllowableAllowance(0);
    setContractType(ContractTypeKuwait.UNLIMITED);
    setTerminationReason(TerminationReasonKuwait.DISMISSAL_WITH_NOTICE);
    setAnnualLeaveEntitlement(30);
    setTotalAccruedLeaveDays(0);
    setLeaveDaysAlreadyTaken(0);
    setAdditions([]);
    setDeductions([]);
    setAddDesc('');
    setAddAmt('');
    setDeductDesc('');
    setDeductAmt('');
    setShowResult(false);
  };

  // Prepopulate employee callback
  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    if (!empId) {
      handleResetForm();
      return;
    }
    const emp = preseededEmployees.find(e => e.id === empId);
    if (emp) {
      setCompanyName(emp.companyName);
      setPamFileNumber(emp.pamFileNumber);
      setEmployeeName(emp.employeeName);
      setNationality(emp.nationality);
      setCivilId(emp.civilId);
      setPassportNumber(emp.passportNumber);
      setJobTitle(emp.jobTitle);
      setJoiningDate(emp.joiningDate);
      setExitDate(emp.exitDate);
      setUnpaidAbsenceDays(emp.unpaidAbsenceDays);
      setBasicSalary(emp.basicSalary);
      setAllowableAllowance(emp.allowableAllowance);
      setContractType(emp.contractType);
      setTerminationReason(emp.terminationReason);
      setAnnualLeaveEntitlement(emp.annualLeaveEntitlement);
      setTotalAccruedLeaveDays(emp.totalAccruedLeaveDays);
      setLeaveDaysAlreadyTaken(emp.leaveDaysAlreadyTaken);
      setAdditions(emp.additions);
      setDeductions(emp.deductions);
      setShowResult(true);
    }
  };

  // Add items callbacks
  const handleAddAddition = () => {
    if (!addDesc || !addAmt || isNaN(parseFloat(addAmt))) return;
    setAdditions(prev => [...prev, { description: addDesc, amount: parseFloat(addAmt) }]);
    setAddDesc('');
    setAddAmt('');
  };

  const handleAddDeduction = () => {
    if (!deductDesc || !deductAmt || isNaN(parseFloat(deductAmt))) return;
    setDeductions(prev => [...prev, { description: deductDesc, amount: parseFloat(deductAmt) }]);
    setDeductDesc('');
    setDeductAmt('');
  };

  const handleRemoveAddition = (index: number) => {
    setAdditions(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveDeduction = (index: number) => {
    setDeductions(prev => prev.filter((_, i) => i !== index));
  };

  // Computed Values
  const duration = useMemo(() => {
    return calculateDurationKuwait(joiningDate, exitDate, unpaidAbsenceDays);
  }, [joiningDate, exitDate, unpaidAbsenceDays]);

  const grossSalary = useMemo(() => {
    return basicSalary + allowableAllowance;
  }, [basicSalary, allowableAllowance]);

  const netLeaveDays = useMemo(() => {
    return Math.max(0, totalAccruedLeaveDays - leaveDaysAlreadyTaken);
  }, [totalAccruedLeaveDays, leaveDaysAlreadyTaken]);

  const dailyRateLeave = useMemo(() => {
    return grossSalary / 26; // Under Kuwait Cassation court standard for working days
  }, [grossSalary]);

  const dailyRateIndemnity = useMemo(() => {
    return grossSalary / 30; // Under Kuwait Article 62 for monthly calculation base
  }, [grossSalary]);

  // LEGAL LAW ENGINE
  const computations = useMemo(() => {
    if (!joiningDate || !exitDate || grossSalary <= 0) {
      return {
        rawIndemnity: 0,
        conversionScale: 1.0,
        finalIndemnity: 0,
        leaveCompensation: 0,
        totalAdditions: 0,
        totalDeductions: 0,
        netPayout: 0,
        yearsOfService: 0,
        first5YearsDaysAccrued: 0,
        remainingYearsDaysAccrued: 0,
        isCapped: false,
        ceilingMax: 0
      };
    }

    const yearsFloat = duration.activeTotalDays / 365.25;

    // 1. Raw End Of Service days: first 5 years gets 15 days/year, remaining gets 30 days/year
    let first5YearsDaysAccrued = 0;
    let remainingYearsDaysAccrued = 0;

    if (yearsFloat <= 5) {
      first5YearsDaysAccrued = yearsFloat * 15;
    } else {
      first5YearsDaysAccrued = 5 * 15;
      remainingYearsDaysAccrued = (yearsFloat - 5) * 30;
    }

    const totalIndemnityDays = first5YearsDaysAccrued + remainingYearsDaysAccrued;
    const rawIndemnity = totalIndemnityDays * dailyRateIndemnity;

    // 2. Conversion/Resignation scale (Article 53 & Article 41 / 48 / 54)
    let conversionScale = 1.0;

    // Direct match against termination
    if (
      terminationReason === TerminationReasonKuwait.RESIGNATION ||
      terminationReason === TerminationReasonKuwait.RESIGNATION_UNDER_3_YEARS ||
      terminationReason === TerminationReasonKuwait.RESIGNATION_3_TO_5_YEARS ||
      terminationReason === TerminationReasonKuwait.RESIGNATION_5_TO_10_YEARS ||
      terminationReason === TerminationReasonKuwait.RESIGNATION_10_PLUS_YEARS
    ) {
      if (yearsFloat < 3) {
        conversionScale = 0.0;
      } else if (yearsFloat >= 3 && yearsFloat < 5) {
        conversionScale = 0.50;
      } else if (yearsFloat >= 5 && yearsFloat < 10) {
        conversionScale = (2 / 3); // 66.67%
      } else {
        conversionScale = 1.0;
      }
    } else if (
      terminationReason === TerminationReasonKuwait.DISMISSAL_WITHOUT_NOTICE_ART_41 ||
      terminationReason === TerminationReasonKuwait.DISMISSAL_ART_41_LOSS ||
      terminationReason === TerminationReasonKuwait.DISMISSAL_ART_41_FRAUD ||
      terminationReason === TerminationReasonKuwait.DISMISSAL_ART_41_SECRETS ||
      terminationReason === TerminationReasonKuwait.DISMISSAL_ART_41_MORALS ||
      terminationReason === TerminationReasonKuwait.DISMISSAL_ART_41_ASSAULT ||
      terminationReason === TerminationReasonKuwait.DISMISSAL_ART_41_OBLIGATIONS ||
      terminationReason === TerminationReasonKuwait.TERMINATION_FOR_ABSENCE ||
      terminationReason === TerminationReasonKuwait.PROBATION_TERMINATION ||
      terminationReason === TerminationReasonKuwait.PROBATION_RESIGNATION
    ) {
      // Dismissal under Article 41 -> Complete loss of indemnity
      conversionScale = 0.0;
    } else {
      // Dismissal with notice, death, retirement, disability, consensual, or Article 48 & Article 54 -> Full payout (100%)
      conversionScale = 1.0;
    }

    let finalIndemnity = rawIndemnity * conversionScale;

    // Standard Maximum cap under Kuwait labor law is 18 months of gross salary (Article 51)
    const ceilingMax = grossSalary * 18;
    let isCapped = false;
    if (finalIndemnity > ceilingMax) {
      finalIndemnity = ceilingMax;
      isCapped = true;
    }

    // 3. Outstanding Leaves Compensations
    const leaveCompensation = netLeaveDays * dailyRateLeave;

    // 4. Other addons & deductions sums
    const sumAdditions = additions.reduce((sum, item) => sum + item.amount, 0);
    const sumDeductions = deductions.reduce((sum, item) => sum + item.amount, 0);

    const netPayout = Math.max(0, finalIndemnity + leaveCompensation + sumAdditions - sumDeductions);

    return {
      rawIndemnity,
      conversionScale,
      finalIndemnity,
      leaveCompensation,
      totalAdditions: sumAdditions,
      totalDeductions: sumDeductions,
      netPayout,
      yearsOfService: yearsFloat,
      first5YearsDaysAccrued,
      remainingYearsDaysAccrued,
      isCapped,
      ceilingMax
    };
  }, [joiningDate, exitDate, grossSalary, duration, dailyRateIndemnity, dailyRateLeave, terminationReason, netLeaveDays, additions, deductions]);

  const arabicWordsPayout = useMemo(() => {
    return NumberToKuwaitiWords(computations.netPayout);
  }, [computations.netPayout]);

  // dynamic legal allocation text
  const dynamicLegalNote = useMemo(() => {
    const yearsFloat = computations.yearsOfService;
    if (
      terminationReason === TerminationReasonKuwait.DISMISSAL_WITHOUT_NOTICE_ART_41 ||
      terminationReason === TerminationReasonKuwait.DISMISSAL_ART_41_LOSS ||
      terminationReason === TerminationReasonKuwait.DISMISSAL_ART_41_FRAUD ||
      terminationReason === TerminationReasonKuwait.DISMISSAL_ART_41_SECRETS ||
      terminationReason === TerminationReasonKuwait.DISMISSAL_ART_41_MORALS ||
      terminationReason === TerminationReasonKuwait.DISMISSAL_ART_41_ASSAULT ||
      terminationReason === TerminationReasonKuwait.DISMISSAL_ART_41_OBLIGATIONS
    ) {
      return {
        articleRef: "المادة (41)",
        status: "حرمان تام من مكافأة نهاية الخدمة بموجب إخلال العامل أو ارتكاب خطأ جسيم.",
        brief: "تنص المادة 41 من قانون العمل الكويتي على حق صاحب العمل في فصل العامل دون إنذار ودون دفعة مكافأة الخدمة في حالات استثنائية معينة (مثل إفشاء الأسرار، التلفيات الجسيمة، الاعتداء، الغش أو الانقطاع وبصمت البصمات)."
      };
    }
    
    if (
      terminationReason === TerminationReasonKuwait.RESIGNATION ||
      terminationReason === TerminationReasonKuwait.RESIGNATION_UNDER_3_YEARS ||
      terminationReason === TerminationReasonKuwait.RESIGNATION_3_TO_5_YEARS ||
      terminationReason === TerminationReasonKuwait.RESIGNATION_5_TO_10_YEARS ||
      terminationReason === TerminationReasonKuwait.RESIGNATION_10_PLUS_YEARS
    ) {
      if (yearsFloat < 3) {
        return {
          articleRef: "المادة (53) - بند أ",
          status: "استقالة بخدمة دون الـ 3 سنوات: لا يستحق المكافأة نهائياً (0%).",
          brief: "حرصاً على استقرار العمل، تعفى الجهة المغذية من سداد المكافأة إذا بادر المستقيل بإنهاء العقد قبل العام الثالث من الخدمة المستمرة لعقد غير محدد المدة."
        };
      } else if (yearsFloat >= 3 && yearsFloat < 5) {
        return {
          articleRef: "المادة (53) - بند ب",
          status: "استقالة بخدمة بين 3 إلى 5 سنوات: يستحق (50%) من المكافأة المتراكمة.",
          brief: "يستحق العامل ثلثي المكافأة المعتادة عن المدة الكلية في حالة بقاء خدمته من ثلاث سنوات حتى ما دون خمس سنوات، طبقاً للمادة 53 من قانون العمل رقم 6 لسنة 2010."
        };
      } else if (yearsFloat >= 5 && yearsFloat < 10) {
        return {
          articleRef: "المادة (53) - بند ج",
          status: "استقالة بخدمة بين 5 إلى 10 سنوات: يستحق ثلثي المكافأة (66.67%).",
          brief: "بموجب المادة 53، يتم صرف ثلثي مكافأة نهاية الخدمة الكاملة للعامل المستقيل الذي بلغت خدمته 5 سنوات متواصلة ولم تبلغ عشر سنوات كاملة."
        };
      } else {
        return {
          articleRef: "المادة (53) - بند د",
          status: "استقالة بخدمة تفوق 10 سنوات: يستحق المكافأة كاملة (100%).",
          brief: "إذا تجاوزت مدة الخدمة الفعلية الصافية حاجز 10 سنوات متتالية، يستحق المستقيل صرف المكافأة الإجمالية بنسبة 100% دون أي تطبيق للخصم بموجب المادة 53."
        };
      }
    }

    if (
      terminationReason === TerminationReasonKuwait.MARRIAGE_RESIGNATION_WOMEN
    ) {
      return {
        articleRef: "المادة (54) - استثناء عائلي للمرأة",
        status: "استقالة بسبب الزواج: يستحق المكافأة كاملة (100% استحقاق).",
        brief: "تنص المادة 54 على استثناء خاص يقضي باستحقاق كامل المكافأة للمرأة العاملة المستقيلة إذا أنهت العقد بسبب زواجها خلال عام من تاريخ عقد الزواج الفعلي."
      };
    }

    if (
      terminationReason === TerminationReasonKuwait.RESIGNATION_ART_48_EMPLOYER_FAULT ||
      terminationReason === TerminationReasonKuwait.RESIGNATION_ART_48_NON_COMPLIANCE ||
      terminationReason === TerminationReasonKuwait.RESIGNATION_ART_48_ASSAULT ||
      terminationReason === TerminationReasonKuwait.RESIGNATION_ART_48_HEALTH_SAFETY ||
      terminationReason === TerminationReasonKuwait.RESIGNATION_ART_48_FRAUD_CONDITIONS
    ) {
      return {
        articleRef: "المادة (48) - خطأ جهة العمل",
        status: "إنهاء اختياري مسبب بنكول جهة عطل: يستحق المكافأة كاملة (100% استحقاق).",
        brief: "يحق للعامل ترك العمل دون إخطار واستحقاق كامل مكافأته العمالية في حالات محددة كاعتداء صاحب العمل، غشه في شروط الاتفاق، أو تهديد السلامة الموثق."
      };
    }

    return {
      articleRef: "المادة (51)",
      status: "فصل عادي أو انتهاء مدة عقد طبيعي: استحقاق كامل المكافأة (100%).",
      brief: "الحسبة الأساسية لمكافأة نهاية الخدمة للقطاع الخاص تحت المادة 51: 15 يوماً للأعوام الخمسة الأولى، و30 يوماً لكل سنة من السنوات اللاحقة، وتحسب الأجزاء بنسبة ما قضي في الخدمة."
    };
  }, [terminationReason, computations.yearsOfService]);

  // Load dynamic office name to keep it synchronized with the rest of the system
  const officeNameAr = useMemo(() => {
    try {
      const savedOffice = localStorage.getItem('profile_office_info');
      if (savedOffice) {
        const parsed = JSON.parse(savedOffice);
        if (parsed.name) return parsed.name;
      }
    } catch (e) {
      console.error('Failed to load office name inside EndOfServicePage', e);
    }
    return "مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية";
  }, []);

  return (
    <div className="bg-slate-50 text-slate-800 p-4 sm:p-6 lg:p-8 space-y-6 font-sans min-h-screen" id="eos-restored-module" dir="rtl">
      
      {/* 1. Header with Title and Reset */}
      <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 shadow-sm">
        {/* Right side: Title */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 rounded-xl text-[#134D41]">
            <Search className="w-6 h-6" />
          </div>
          <div className="text-right flex flex-col md:items-start">
            <h1 className="text-lg sm:text-xl font-black text-slate-900">احتساب نهاية الخدمة (القطاع الخاص)</h1>
            <p className="text-[10px] sm:text-xs text-[#134D41] font-bold mt-1">
              عدالة - منظومة الإدارة القانونية المتكاملة | تحت إشراف: {officeNameAr}
            </p>
          </div>
        </div>

        {/* Left side: Reset Button */}
        <div>
          <button 
            type="button"
            onClick={handleResetForm}
            className="flex items-center gap-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition-colors cursor-pointer shadow-sm focus:outline-none bg-white font-sans"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400 animate-spin-hover" />
            <span>إعادة تعيين النموذج</span>
          </button>
        </div>
      </div>

      {/* Tab Switcher: Smart Calculator vs Full Dossiers */}
      <div className="bg-white border border-[#E2E8F0] p-1.5 rounded-2xl flex flex-col sm:flex-row gap-2 max-w-xl mx-auto w-full select-none shadow-sm font-sans mb-4">
        <button
          type="button"
          onClick={() => {
            setActivePageTab('calculator');
            // Ensure values are set to sensible default if empty
            if (!joiningDate) setJoiningDate('2018-05-15');
            if (!exitDate) setExitDate('2026-06-06');
            if (basicSalary === 0) setBasicSalary(1200);
            if (allowableAllowance === 0) setAllowableAllowance(200);
            setShowResult(true);
          }}
          className={`flex-grow py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 border-0 cursor-pointer font-sans h-11 ${
            activePageTab === 'calculator'
              ? 'bg-[#134D41] text-white shadow-md'
              : 'text-slate-500 bg-transparent hover:bg-slate-50 hover:text-slate-900 font-bold'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>الحاسبة القانونية الذكية الفورية</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setActivePageTab('dossier');
            setShowResult(true);
          }}
          className={`flex-grow py-3 px-4 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 border-0 cursor-pointer font-sans h-11 ${
            activePageTab === 'dossier'
              ? 'bg-[#134D41] text-white shadow-md'
              : 'text-slate-500 bg-transparent hover:bg-slate-50 hover:text-slate-900 font-bold'
          }`}
        >
          <User className="w-4 h-4" />
          <span>منظومة تصفية أضابير الموظفين الكلية</span>
        </button>
      </div>

      {activePageTab === 'calculator' && (
        <div className="space-y-6">
          {/* Quick Calculator Guidance Badge */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3 text-right">
            <div className="p-2 bg-emerald-100 rounded-lg text-[#134D41] mt-0.5 shrink-0">
              <Scale className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-black text-[#134D41]">حساب فوري متوافق مع قانون العمل الكويتي رقم (6) لسنة 2010</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                أدخل تاريخ التعيين، تاريخ الاستقالة، والراتب الأساسي لاستخلاص الحساب التقديري لمكافأة نهاية الخدمة وبدل رصيد الإجازات فوراً مع السند القانوني التفصيلي.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Input Form Column (5 Cols) */}
            <div className="lg:col-span-5 bg-white border border-[#E2E8F0] p-6 rounded-2xl space-y-5 shadow-xs text-right">
              <div className="border-b pb-3 mb-2">
                <span className="text-[10px] font-black text-slate-400 block mb-0.5 font-mono">INPUT DATA</span>
                <h2 className="text-sm font-black text-slate-900 flex items-center gap-1.5 justify-end">
                  <span>المعطيات وحقول الإدخال</span>
                  <Scale className="w-4 h-4 text-[#134D41]" />
                </h2>
              </div>

              {/* Appointment & Resignation dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div className="space-y-1 text-right">
                  <label className="text-xs font-bold text-slate-600 block">تاريخ التعيين (الالتحاق)</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                    <input 
                      type="date" 
                      value={joiningDate}
                      onChange={(e) => setJoiningDate(e.target.value)}
                      className="w-full text-xs font-black h-11 pr-9 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#134D41] focus:bg-white outline-none font-mono text-center"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-right">
                  <label className="text-xs font-bold text-slate-600 block">تاريخ الاستقالة / مغادرة العمل</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
                    <input 
                      type="date" 
                      value={exitDate}
                      onChange={(e) => setExitDate(e.target.value)}
                      className="w-full text-xs font-black h-11 pr-9 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#134D41] focus:bg-white outline-none font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Basic Salary & Allowances */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                <div className="space-y-1 text-right">
                  <label className="text-xs font-bold text-slate-600 block">الراتب الأساسي (د.ك)</label>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setBasicSalary(prev => Math.max(0, prev - 100))}
                      className="h-11 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 cursor-pointer text-xs"
                    >
                      -100
                    </button>
                    <input 
                      type="number" 
                      value={basicSalary || ''}
                      onChange={(e) => setBasicSalary(Math.max(0, parseFloat(e.target.value) || 0))}
                      placeholder="الأساسي"
                      className="w-full text-xs font-black h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#134D41] focus:bg-white outline-none font-mono text-center"
                    />
                    <button
                      type="button"
                      onClick={() => setBasicSalary(prev => prev + 100)}
                      className="h-11 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 cursor-pointer text-xs"
                    >
                      +100
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-right">
                  <label className="text-xs font-bold text-slate-600 block">البدلات الخاضعة (د.ك)</label>
                  <input 
                    type="number" 
                    value={allowableAllowance || ''}
                    onChange={(e) => setAllowableAllowance(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="بدل السكن/الانتقال"
                    className="w-full text-xs font-black h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#134D41] focus:bg-white outline-none font-mono text-center"
                  />
                </div>
              </div>

              {/* Leave Cash-out Setup */}
              <div className="space-y-1.5 border-t pt-4 font-sans text-right">
                <label className="text-xs font-bold text-slate-700 flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-normal leading-none">(اليومية = الأجر الشامل / 26)</span>
                  <span>رصيد الإجازات السنوية المتبقية (بدل نقد)</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">إجمالي أيام الإجازات المستحقة</label>
                    <input 
                      type="number" 
                      value={totalAccruedLeaveDays}
                      onChange={(e) => setTotalAccruedLeaveDays(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full text-xs font-semibold h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#134D41] outline-none font-mono text-center"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 block">الأيام المستهلكة فعلياً</label>
                    <input 
                      type="number" 
                      value={leaveDaysAlreadyTaken}
                      onChange={(e) => setLeaveDaysAlreadyTaken(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="w-full text-xs font-semibold h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#134D41] outline-none font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Contract Type & Termination reason */}
              <div className="space-y-3 pt-2 font-sans text-right">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">نوع العقد</label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as ContractTypeKuwait)}
                    className="w-full text-xs font-black h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:border-[#134D41] outline-none text-right dir-rtl font-sans"
                  >
                    <option value={ContractTypeKuwait.UNLIMITED}>مفتوح المدة / غير محدد المدة</option>
                    <option value={ContractTypeKuwait.LIMITED}>محدد المدة والزمن</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">سبب التوقف / الاستقالة</label>
                  <select
                    value={terminationReason}
                    onChange={(e) => setTerminationReason(e.target.value as TerminationReasonKuwait)}
                    className="w-full text-xs font-black h-11 px-3 bg-slate-50 border border-slate-200 rounded-xl text-[#0b332b] focus:border-[#134D41] outline-none text-right font-sans"
                  >
                    <option value={TerminationReasonKuwait.RESIGNATION}>الاستقالة الاختيارية للعامل (المادة 53)</option>
                    <option value={TerminationReasonKuwait.DISMISSAL_WITH_NOTICE}>الفصل من العمل بإخطار من صاحب العمل</option>
                    <option value={TerminationReasonKuwait.CONTRACT_EXPIRY}>انتهاء العقد الطبيعي بدون تجديد</option>
                    <option value={TerminationReasonKuwait.DISMISSAL_WITHOUT_NOTICE_ART_41}>الفصل التأديبي بموجب المادة 41 (حرمان كامل)</option>
                    <option value={TerminationReasonKuwait.MARRIAGE_RESIGNATION_WOMEN}>استقالة عائلية للمرأة بسبب الزواج (المادة 54)</option>
                  </select>
                </div>
              </div>

              {/* Additional Print-Only Metadata (prefilled or editable) */}
              <div className="border-t pt-4 space-y-3 bg-[#FAFBFD] p-4 rounded-xl border border-slate-100 font-sans text-right">
                <span className="text-[10px] font-black text-slate-400 block mb-1 font-mono">PRINT DETAILS METADATA</span>
                
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={employeeName}
                      onChange={(e) => setEmployeeName(e.target.value)}
                      placeholder="اسم الموظف..."
                      className="w-full text-xs font-semibold h-9 px-2 bg-white border border-slate-200 rounded-lg focus:border-[#134D41] text-right"
                    />
                    <input 
                      type="text" 
                      value={civilId}
                      onChange={(e) => setCivilId(e.target.value)}
                      placeholder="الرقم المدني..."
                      className="w-full text-xs font-semibold h-9 px-2 bg-white border border-slate-200 rounded-lg focus:border-[#134D41] text-right font-mono text-center"
                    />
                  </div>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="اسم صاحب العمل / الشركة الموظفة الكفيلة..."
                    className="w-full text-xs font-semibold h-9 px-2 bg-white border border-slate-200 rounded-lg focus:border-[#134D41] text-right"
                  />
                </div>
              </div>
            </div>

            {/* Live Outputs Bento Column (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Grand Total Highlight */}
              <div className="bg-[#134D41] text-white p-6 sm:p-8 rounded-3xl text-center space-y-3 relative overflow-hidden shadow-md font-sans">
                {/* Background scales representation */}
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                  <Scale className="w-[180px] h-[180px]" />
                </div>

                <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase block">إجمالي صافي مستحقات نهاية الخدمة والتعويضات</span>
                <strong className="text-3xl sm:text-4xl font-black text-[#D4AF37] font-mono block leading-none">
                  {computations.netPayout.toFixed(3)} د.ك
                </strong>
                <p className="text-xs font-bold text-emerald-100 mx-auto leading-relaxed max-w-md pt-2 border-t border-emerald-850 font-sans">
                  {arabicWordsPayout}
                </p>
              </div>

              {/* Detailed Split Breakdown Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-right">
                
                {/* EOS Gratuity detailed card */}
                <div className="bg-[#FAFBFD] border border-slate-200 p-5 rounded-2xl relative text-right flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="p-1 px-2.5 bg-emerald-50 text-[#134D41] text-[9px] font-black rounded border border-emerald-105 font-mono">
                        المادة (51)
                      </span>
                      <h4 className="text-xs font-black text-slate-800">مكافأة نهاية الخدمة</h4>
                    </div>
                    <div className="w-full h-px bg-slate-200/60 my-2"></div>
                    <div className="space-y-1.5 text-xs text-slate-650 leading-relaxed">
                      <div className="flex justify-between font-semibold">
                        <span className="font-mono text-[#134D41] font-black">+{computations.rawIndemnity.toFixed(3)} د.ك</span>
                        <span>شريطة المتراكم الأساسي:</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="font-mono text-zinc-600">x {Math.round(computations.conversionScale * 100)}%</span>
                        <span>معدل تسوية المواد:</span>
                      </div>
                      {computations.isCapped && (
                        <p className="text-[10px] text-amber-600 font-bold leading-tight mt-1">
                          ⚠️ تم تطبيق السقف القانوني (18 شهراً من الأجر الكلي)
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 mt-4 flex justify-between items-center">
                    <strong className="text-lg font-black text-emerald-600 font-mono">
                      {computations.finalIndemnity.toFixed(3)} د.ك
                    </strong>
                    <span className="text-[10px] text-slate-400 font-bold">الاستحقاق القانوني:</span>
                  </div>
                </div>

                {/* Leaves Compensation detailed card */}
                <div className="bg-[#FAFBFD] border border-slate-200 p-5 rounded-2xl relative text-right flex flex-col justify-between shadow-2xs">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="p-1 px-2.5 bg-amber-50 text-amber-700 text-[9px] font-black rounded border border-amber-105 font-mono">
                        المادة (68)
                      </span>
                      <h4 className="text-xs font-black text-slate-800">بدل رصيد الإجازات السنوية</h4>
                    </div>
                    <div className="w-full h-px bg-slate-200/60 my-2"></div>
                    <div className="space-y-1.5 text-xs text-slate-650 leading-relaxed">
                      <div className="flex justify-between font-semibold">
                        <span className="font-mono text-zinc-700">{netLeaveDays} أيام</span>
                        <span>رصيد الإجازات المتراكمة:</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span className="font-mono text-[#134D41] font-bold">{dailyRateLeave.toFixed(3)} د.ك</span>
                        <span>محتسب أجر اليوم الواحد:</span>
                      </div>
                      <p className="text-[9.5px] text-slate-450 font-semibold leading-relaxed mt-1">
                        * اليومية تحسب لغرض صرف الرصيد ببلد المصدر على (الراتب الشامل / 26) بموجب محكمة التمييز الكويتي.
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 mt-4 flex justify-between items-center">
                    <strong className="text-lg font-black text-amber-600 font-mono">
                      {computations.leaveCompensation.toFixed(3)} د.ك
                    </strong>
                    <span className="text-[10px] text-slate-400 font-bold">بدل الصرف النقدي:</span>
                  </div>
                </div>

              </div>

              {/* Service Years Breakdown Details */}
              <div className="bg-[#FAF9F5] border border-[#B59458]/20 p-5 rounded-2xl text-right space-y-3 shadow-xs font-sans">
                <div className="flex justify-between items-center pb-2 border-b border-yellow-250/20">
                  <span className="text-[10px] font-black text-[#B59458] font-mono">SERVICE TIMELINE DATA</span>
                  <h4 className="text-xs font-black text-[#134D41] font-serif">تفصيل فترة الدوام والخدمة الفعلية</h4>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <span className="text-xl font-black text-[#134D41] font-mono block">{duration.years}</span>
                    <span className="text-[10px] font-bold text-slate-500 block mt-0.5">سنة</span>
                  </div>
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <span className="text-xl font-black text-[#134D41] font-mono block">{duration.months}</span>
                    <span className="text-[10px] font-bold text-slate-500 block mt-0.5">شهر</span>
                  </div>
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
                    <span className="text-xl font-black text-[#134D41] font-mono block">{duration.days}</span>
                    <span className="text-[10px] font-bold text-slate-500 block mt-0.5">يوم</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed text-right">
                  إجمالي أيام التقويم المسجلة بالخدمة: <strong className="font-extrabold text-slate-800">{duration.totalCalendarDays} يوم تقويمي</strong>.
                  {unpaidAbsenceDays > 0 && ` تم استبعاد ${unpaidAbsenceDays} أيام غياب أو إجازة بدون راتب من الحسبة المعتمدة.`}
                </p>
              </div>

              {/* Dynamic Legal reference memo */}
              <div className="bg-teal-50/50 p-5 rounded-2xl border border-teal-100 space-y-2.5 text-right font-sans">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-black text-teal-850 font-mono">LEGAL REFERENCE DOC</span>
                  <strong className="text-[#134D41] text-xs font-black flex items-center gap-1">
                    <span>{dynamicLegalNote.articleRef} - السند والمادة الحاكمة</span>
                    <Scale className="w-3.5 h-3.5" />
                  </strong>
                </div>
                <div className="w-full h-px bg-teal-100"></div>
                <p className="font-semibold text-xs leading-relaxed text-slate-700 text-right leading-relaxed text-justify">
                  {dynamicLegalNote.brief}
                </p>
                <div className="bg-white/80 p-3 rounded-lg text-[10px] text-slate-550 font-semibold leading-relaxed border border-teal-50 mt-1">
                  💡 تدرج الاستحقاق للاستقالة الاختيارية بموجب المادة 53: 0% للخدمة دون 3 سنوات، 50% للخدمة من 3 إلى 5 سنوات، 66.67% للخدمة من 5 إلى 10 سنوات، و 100% للخدمة فوق 10 سنوات.
                </div>
              </div>

              {/* Action Buttons (Print and detailed ledger) */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 font-sans">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#134D41] hover:bg-[#0c332b] text-white font-black text-xs px-6 py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer border-0 font-sans"
                >
                  <Printer className="w-4 h-4 ml-1" />
                  <span>طباعة صك التسوية القانوني الكامل</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActivePageTab('dossier');
                    setShowResult(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 font-bold text-xs px-6 py-3.5 rounded-xl shadow-sm transition-all cursor-pointer font-sans"
                >
                  <User className="w-4 h-4 ml-1" />
                  <span>الانتقال للمنظومة لربط السجلات العمالية</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {activePageTab === 'dossier' && (
        <>
          {/* 2. Employee Selector (Optional) */}
      <div className="bg-[#FAFBFD] border border-blue-100 p-5 rounded-2xl space-y-2 text-right shadow-xs">
        <label className="font-extrabold text-[#1E3A8A] text-xs flex items-center justify-end gap-1.5">
          <span>اختيار موظف من السجلات (اختياري)</span>
        </label>
        <p className="text-[11px] text-slate-500 mr-1">يمكنك اختيار موظف مسجل لتعبئة البيانات الأساسية والمالية تلقائياً.</p>
        
        <div className="flex items-center gap-2 justify-end pt-1">
          <select
            value={selectedEmpId}
            onChange={(e) => handleSelectEmployee(e.target.value)}
            className="w-full max-w-sm text-xs font-semibold h-10 px-3 bg-white border border-[#CBD5E1] rounded-lg text-slate-800 focus:border-[#134D41] outline-none text-right dir-rtl"
          >
            <option value="">--- اختر موظفاً ---</option>
            {preseededEmployees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.employeeName}</option>
            ))}
          </select>
          <button 
            type="button"
            onClick={() => selectedEmpId && handleSelectEmployee(selectedEmpId)}
            className="p-2.5 text-blue-600 hover:text-blue-800 bg-white rounded-lg border border-[#CBD5E1] hover:border-blue-400 focus:outline-none cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-blue-600" />
          </button>
        </div>
      </div>

      {/* 4. Section 1: Employee Data */}
      <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl text-right space-y-5 shadow-xs">
        <h2 className="text-sm font-black text-slate-900 border-r-4 border-[#134D41] pr-2">1. بيانات الموظف وفترة الخدمة</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">اسم الشركة/صاحب العمل</label>
              <input 
                type="text" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full text-xs font-semibold h-11 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none text-right"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">الرقم المدني</label>
              <input 
                type="text" 
                value={civilId}
                onChange={(e) => setCivilId(e.target.value)}
                className="w-full text-xs font-semibold h-11 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none font-mono text-right"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">تاريخ الالتحاق بالعمل</label>
              <input 
                type="date" 
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full text-xs font-semibold h-11 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none font-mono text-right"
              />
            </div>
          </div>

          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">اسم الموظف بالكامل</label>
              <input 
                type="text" 
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="أحمد عبدالله"
                className="w-full text-xs font-semibold h-11 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none text-right"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">المسمى الوظيفي</label>
              <input 
                type="text" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full text-xs font-semibold h-11 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none text-right"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">تاريخ نهاية الخدمة</label>
              <input 
                type="date" 
                value={exitDate}
                onChange={(e) => setExitDate(e.target.value)}
                className="w-full text-xs font-semibold h-11 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none font-mono text-right"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Section 2 & 3: Salaries, Contract & Leaves */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Right side: Section 2 */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl text-right space-y-4 shadow-xs">
          <h2 className="text-sm font-black text-slate-900 border-r-4 border-[#134D41] pr-2">2. تفاصيل الراتب والعقد</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">البدلات الخاضعة (د.ك)</label>
              <input 
                type="number" 
                value={allowableAllowance}
                onChange={(e) => setAllowableAllowance(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full text-xs font-semibold h-11 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none font-mono text-right"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">الراتب الأساسي (د.ك)</label>
              <input 
                type="number" 
                value={basicSalary}
                onChange={(e) => setBasicSalary(Math.max(0, parseFloat(e.target.value) || 0))}
                placeholder="مثال: 800"
                className="w-full text-xs font-semibold h-11 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none font-mono text-right"
              />
            </div>
          </div>

          <div className="bg-[#EBFDF5]/90 border border-emerald-100 rounded-xl text-[#047857] py-3 px-4 text-center text-xs font-black shadow-2xs">
            الراتب الشامل للحساب: {grossSalary.toFixed(3)} د.ك
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">نوع العقد</label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value as ContractTypeKuwait)}
                className="w-full text-xs font-semibold h-11 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none text-right dir-rtl font-sans"
              >
                <option value={ContractTypeKuwait.UNLIMITED}>غير محدد المدة</option>
                <option value={ContractTypeKuwait.LIMITED}>محدد المدة</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">سبب إنهاء الخدمة</label>
              <select
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value as TerminationReasonKuwait)}
                className="w-full text-[#111827] text-right font-bold text-xs h-11 px-3 bg-white border border-slate-200 rounded-lg focus:border-[#134D41] outline-none dir-rtl font-sans"
              >
                {Object.values(TerminationReasonKuwait).map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Left side: Section 3 */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl text-right space-y-4 shadow-xs">
          <h2 className="text-sm font-black text-slate-900 border-r-4 border-[#134D41] pr-2">3. رصيد الإجازات</h2>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 block">استحقاق الإجازة السنوية (أيام/سنة)</label>
            <input 
              type="number" 
              value={annualLeaveEntitlement}
              onChange={(e) => setAnnualLeaveEntitlement(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full text-xs font-semibold h-11 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none font-mono text-right"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">المستخدم منها (أيام)</label>
              <input 
                type="number" 
                value={leaveDaysAlreadyTaken}
                onChange={(e) => setLeaveDaysAlreadyTaken(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full text-xs font-semibold h-11 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none font-mono text-right"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">إجمالي الرصيد المستحق (أيام)</label>
              <input 
                type="number" 
                value={totalAccruedLeaveDays}
                onChange={(e) => setTotalAccruedLeaveDays(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full text-xs font-semibold h-11 px-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none font-mono text-right"
              />
            </div>
          </div>

          <div className="bg-[#FFFDF0]/90 border border-amber-200 rounded-xl text-[#B45309] py-3 px-4 text-center text-xs font-black shadow-2xs">
            صافي الرصيد المستحق للصرف: {netLeaveDays} يوم
          </div>
        </div>
      </div>

      {/* 5. Section 4 & 5: Additions & Deductions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Right side: Code Additions */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl text-right space-y-4 shadow-xs">
          <h2 className="text-sm font-black text-slate-900 border-r-4 border-[#134D41] pr-2">4. إضافات أخرى (مكافآت، عمولات)</h2>
          
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-8">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">الوصف</label>
              <input 
                type="text" 
                value={addDesc}
                onChange={(e) => setAddDesc(e.target.value)}
                placeholder="وصف البند..."
                className="w-full text-xs font-semibold h-10 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none text-right"
              />
            </div>
            <div className="col-span-4">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">المبلغ (د.ك)</label>
              <input 
                type="number" 
                value={addAmt}
                onChange={(e) => setAddAmt(e.target.value)}
                className="w-full text-xs font-semibold h-10 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none font-mono text-right"
              />
            </div>
          </div>

          <div className="flex justify-start">
            <button 
              type="button"
              onClick={handleAddAddition}
              className="border border-[#134D41] text-[#134D41] bg-white rounded-lg px-4 py-1.5 hover:bg-[#EBFDF5] flex items-center gap-1 cursor-pointer text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة</span>
            </button>
          </div>

          {additions.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              {additions.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg border">
                  <button type="button" onClick={() => handleRemoveAddition(index)} className="text-red-500 hover:text-red-700 bg-transparent border-0 font-bold cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex gap-4 font-bold text-right">
                    <span className="text-[#047857] font-mono">+{item.amount.toFixed(3)} د.ك</span>
                    <span className="text-slate-700">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Left side: Code Deductions */}
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-2xl text-right space-y-4 shadow-xs">
          <h2 className="text-sm font-black text-slate-900 border-r-4 border-[#134D41] pr-2">5. خصومات (سلف، قروض، أضرار)</h2>
          
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-8">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">الوصف</label>
              <input 
                type="text" 
                value={deductDesc}
                onChange={(e) => setDeductDesc(e.target.value)}
                placeholder="وصف الخصم..."
                className="w-full text-xs font-semibold h-10 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none text-right"
              />
            </div>
            <div className="col-span-4">
              <label className="text-[10px] font-bold text-slate-500 block mb-1">المبلغ (د.ك)</label>
              <input 
                type="number" 
                value={deductAmt}
                onChange={(e) => setDeductAmt(e.target.value)}
                className="w-full text-xs font-semibold h-10 px-2.5 bg-white border border-slate-200 rounded-lg text-slate-800 focus:border-[#134D41] outline-none font-mono text-right"
              />
            </div>
          </div>

          <div className="flex justify-start">
            <button 
              type="button"
              onClick={handleAddDeduction}
              className="border border-[#134D41] text-[#134D41] bg-white rounded-lg px-4 py-1.5 hover:bg-[#EBFDF5] flex items-center gap-1 cursor-pointer text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة</span>
            </button>
          </div>

          {deductions.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              {deductions.map((item, index) => (
                <div key={index} className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded-lg border">
                  <button type="button" onClick={() => handleRemoveDeduction(index)} className="text-red-500 hover:text-red-700 bg-transparent border-0 font-bold cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="flex gap-4 font-bold text-right">
                    <span className="text-rose-600 font-mono">-{item.amount.toFixed(3)} د.ك</span>
                    <span className="text-slate-700">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Execute calculation button */}
      <div className="flex justify-center pt-2">
        <button 
          type="button"
          onClick={() => setShowResult(true)}
          className="w-full max-w-xl flex items-center justify-center gap-2 bg-[#134D41] hover:bg-[#0f2d25] text-white font-black text-sm px-10 py-3.5 rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer border-0"
        >
          <Search className="w-4 h-4 ml-1.5" />
          <span>عرض النتيجة التفصيلية</span>
        </button>
      </div>

      {/* 7. Live summary payout module */}
      {showResult && (
        <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl text-right space-y-6 shadow-sm">
          <h2 className="text-[#134D41] text-base font-black border-r-4 border-emerald-500 pr-2">نتيجة الحساب النهائية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Net payout */}
            <div className="border-2 border-emerald-500 bg-[#F9FDFB] rounded-2xl p-6 text-center shadow-2xs flex flex-col justify-center">
              <span className="text-xs text-slate-500 font-black block">صافي المبلغ المستحق للدفع</span>
              <strong className="text-2xl sm:text-3xl font-black text-emerald-600 font-mono block mt-2">
                {computations.netPayout.toFixed(3)} د.ك
              </strong>
            </div>

            {/* Leave balance amount */}
            <div className="border border-slate-200 bg-white rounded-xl p-5 text-center flex flex-col justify-center">
              <span className="text-xs text-slate-500 font-bold block">بدل رصيد الإجازات</span>
              <strong className="text-xl font-black text-amber-500 font-mono block mt-2">
                {computations.leaveCompensation.toFixed(3)} د.ك
              </strong>
            </div>

            {/* End of service rewards */}
            <div className="border border-slate-200 bg-white rounded-xl p-5 text-center flex flex-col justify-center">
              <span className="text-xs text-slate-500 font-bold block">مكافأة نهاية الخدمة (الصافي)</span>
              <strong className="text-xl font-black text-slate-700 font-mono block mt-2">
                {computations.finalIndemnity.toFixed(3)} د.ك
              </strong>
            </div>
          </div>

          {/* Details list */}
          <div className="bg-[#FAFBFD] border border-slate-200 rounded-xl p-5 text-right space-y-3">
            <h4 className="text-xs font-black text-slate-800">تفاصيل إضافية:</h4>
            <div className="w-full h-px bg-slate-200"></div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#047857] font-bold">
                <span className="font-mono">+{computations.totalAdditions.toFixed(3)} د.ك</span>
                <span>إجمالي الإضافات الأخرى:</span>
              </div>
              <div className="flex justify-between items-center text-rose-600 font-bold">
                <span className="font-mono">-{computations.totalDeductions.toFixed(3)} د.ك</span>
                <span>إجمالي الخصومات:</span>
              </div>
            </div>
          </div>

          {/* Tab Selector & Detailed workings / references on screen */}
          <div className="border-t pt-6 space-y-4">
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 justify-center max-w-md mx-auto">
              <button
                type="button"
                onClick={() => setActiveTab('calculations')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs transition-colors border-0 cursor-pointer font-sans ${
                  activeTab === 'calculations' 
                    ? 'bg-[#134D41] text-white shadow-sm' 
                    : 'text-slate-600 bg-transparent'
                }`}
              >
                تفصيل الحساب القانوني
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('legalReferences')}
                className={`flex-1 py-2 rounded-lg font-bold text-xs transition-colors border-0 cursor-pointer font-sans ${
                  activeTab === 'legalReferences' 
                    ? 'bg-[#134D41] text-white shadow-sm' 
                    : 'text-slate-600 bg-transparent'
                }`}
              >
                السند ومذكرة قانون العمل
              </button>
            </div>

            {activeTab === 'calculations' ? (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 space-y-2 text-xs text-right">
                <div className="flex justify-between border-b pb-1">
                  <span className="font-mono font-bold text-[#134D41]">{computations.rawIndemnity.toFixed(3)} د.ك</span>
                  <span className="text-slate-600">المكافأة التقديرية الكلية للخدمة:</span>
                </div>
                <div className="flex justify-between border-b pb-1">
                  <span className="font-mono font-bold text-slate-800">x {Math.round(computations.conversionScale * 100)}%</span>
                  <span className="text-slate-600">المعدل المستحق حسب المبرر والمادة 53:</span>
                </div>
              </div>
            ) : (
              <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100 space-y-2 text-xs text-right text-slate-800 text-justify font-sans">
                <strong className="text-[#134D41] block mb-1">{dynamicLegalNote.articleRef} - السند المعتمد</strong>
                <p className="font-semibold leading-relaxed text-slate-700">{dynamicLegalNote.brief}</p>
              </div>
            )}
          </div>

          {/* Print Covenant Trigger Button */}
          <div className="flex justify-center pt-2 font-sans">
            <button 
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="flex items-center gap-2 bg-[#134D41] hover:bg-[#0f2d25] text-white font-serif font-black text-xs px-10 py-3.5 rounded-xl shadow-md transition-all active:scale-[0.98] cursor-pointer border-0 font-sans"
            >
              <Printer className="w-4 h-4 ml-1.5" />
              <span>طباعة كشف التسوية المالي الرسمي</span>
            </button>
          </div>
        </div>
      )}
        </>
      )}

      {/* 8. Official Document Print Flow Modal */}
      <AnimatePresence>
        {showPrintModal && (
          <div className="fixed inset-0 z-50 bg-black/60 overflow-y-auto flex items-start justify-center p-4 print:p-0 print:absolute print:inset-0 print:z-0 print:bg-white" id="official-print-modal">
            <div className="bg-white rounded-3xl border border-slate-350 w-full max-w-4xl p-6 sm:p-11 relative space-y-7 shadow-2xl print:shadow-none print:border-none print:p-0 print:my-0 my-8">
              
              {/* Internal Modal Title Header */}
              <div className="flex justify-between items-center border-b pb-4 print:hidden select-none" id="modal-controls-top">
                <button 
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer border bg-transparent font-bold font-sans border-solid"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1.5 text-[#134D41]">
                  <FileText className="w-5 h-5 text-[#134D41]" />
                  <span className="font-serif font-black text-xs text-[#134D41]">كشف حساب التسوية النهائية لمستحقات نهاية الخدمة</span>
                </div>
              </div>

              {/* Printable specs area */}
              <div className="space-y-6 text-right p-1 print:p-0" id="printable-area">
                
                {/* Double-bordered elegant legal parchment sheet */}
                <div className="border-[3px] border-[#134D41] rounded-2xl p-6 sm:p-10 bg-white relative space-y-7 print:border-[3px] print:rounded-none print:p-8 overflow-hidden shadow-sm" id="printable-sheet">
                  
                  {/* Subtle water-marked legal scales of justice in background */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                    <Scale className="w-[380px] h-[380px] text-[#134D41]" />
                  </div>

                  {/* Unified Office Letterhead and Branding Header */}
                  <PrintHeader 
                    title="كشف تصفية المستحقات العمالية ومكافأة نهاية الخدمة" 
                    subtitle="بموجب أحكام مواد قانون العمل الكويتي رقم (6) لسنة 2010 وتعديلاته بالقطاع الأهلي" 
                  />

                  {/* Document Metadata box (Date, due-date of the settlement, accountability tags) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200/80 p-4 rounded-xl text-[10px] text-slate-800 font-sans print:bg-slate-50 relative z-10">
                    <div className="space-y-0.5">
                      <span className="text-slate-400 block font-bold">تاريخ التصفية وإصدار السند:</span>
                      <span className="font-extrabold text-slate-900">{new Date().toLocaleDateString('ar-KW', { day: 'numeric', month: 'long', year: 'numeric' })} م</span>
                    </div>
                    <div className="space-y-0.5 text-center sm:text-center">
                      <span className="text-slate-400 block font-bold">تاريخ الاستحقاق القانوني:</span>
                      <span className="font-black text-[#134D41] bg-teal-50 px-2 py-0.5 rounded border border-teal-100 inline-block">
                        {exitDate ? new Date(exitDate).toLocaleDateString('ar-KW', { day: 'numeric', month: 'long', year: 'numeric' }) : '................................'} م
                      </span>
                    </div>
                    <div className="space-y-0.5 text-left" dir="ltr">
                      <span className="text-slate-400 block font-bold text-left">DOCUMENT REFS:</span>
                      <span className="font-mono font-black text-rose-700">ADALAH-EOS-LAW-6-2010</span>
                    </div>
                  </div>

                  {/* Supervision and Platform Auditing Box */}
                  <div className="bg-slate-50/50 border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-600 print:text-black relative z-10">
                    <div className="text-right space-y-0.5">
                      <p className="font-black text-slate-900 text-xs">تمت التصفية المالية والتدقيق القانوني بمراسيم:</p>
                      <p className="font-bold text-[#134D41]">{officeNameAr}</p>
                      <p className="text-[9px] text-gray-500 font-medium">الاستشارات العمالية وصرف مستحقات المنشأة والكادر</p>
                    </div>
                    <div className="text-left sm:text-left space-y-0.5 text-left" dir="ltr">
                      <p className="font-black text-slate-900 text-xs">ISSUED & VERIFIED BY:</p>
                      <p className="font-bold text-slate-700">Adala - Integrated Legal Management System v3</p>
                      <p className="text-[9px] text-gray-400 font-mono">ADALAH-EOS-SECURE-AUDIT</p>
                    </div>
                  </div>

                  {/* Section I: Employee Profiles and Records */}
                  <div className="space-y-2 relative z-10">
                    <div className="bg-[#134D41] text-white px-3 py-1.5 rounded-lg text-xs font-black flex justify-between items-center shadow-sm">
                      <span>أولاً: بيانات الموظف والمنشأة وتواريخ الخدمة</span>
                      <span className="text-[10px] font-normal opacity-85">سجلات إدارة قيد القوى العاملة</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-xs text-slate-700 px-2 leading-relaxed">
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-black text-slate-900">{companyName || '................................'}</span>
                        <span className="text-slate-500 font-bold">اسم المنشأة/الشركة:</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-black text-slate-900">{employeeName || '................................'}</span>
                        <span className="text-slate-500 font-bold">اسم الموظف المستفيد:</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-mono font-black text-slate-950">{civilId || '................................'}</span>
                        <span className="text-slate-500 font-bold">الرقم المدني الكويتي:</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-black text-slate-900">{jobTitle || '................................'}</span>
                        <span className="text-slate-500 font-bold">المسمى الوظيفي:</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-mono font-black text-slate-900">{joiningDate ? new Date(joiningDate).toLocaleDateString('ar-KW', { day: 'numeric', month: 'long', year: 'numeric' }) : '................................'} م</span>
                        <span className="text-slate-500 font-bold">تاريخ مباشرة العمل (الالتحاق):</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-mono font-black text-[#134D41]">{exitDate ? new Date(exitDate).toLocaleDateString('ar-KW', { day: 'numeric', month: 'long', year: 'numeric' }) : '................................'} م</span>
                        <span className="text-slate-500 font-bold font-serif underline underline-offset-2 decoration-[#134D41]">تاريخ الاستحقاق القانوني (التوقف):</span>
                      </div>
                      <div className="col-span-1 sm:col-span-2 flex justify-between bg-slate-50 p-2.5 rounded-lg border border-slate-150">
                        <span className="font-black text-[#134D41] text-xs">
                          {duration.years} سنة و {duration.months} شهر و {duration.days} يوم
                        </span>
                        <span className="text-slate-800 font-black">إجمالي مدة الخدمة الفعلية المقيدة للطلب:</span>
                      </div>
                    </div>
                  </div>

                  {/* Section II: Salaries and reasons details */}
                  <div className="relative z-10">
                    <div className="bg-[#134D41] text-white px-3 py-1.5 rounded-lg text-xs font-black flex justify-between items-center shadow-sm mb-3">
                      <span>ثانياً: راتب القياس وبنود الاحتساب الأساسية</span>
                      <span className="text-[10px] font-normal opacity-85">موجب المادة (62) من القانون</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 text-xs text-slate-700 px-2 leading-relaxed">
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-mono font-black text-slate-900">{basicSalary.toFixed(3)} د.ك</span>
                        <span className="text-slate-500 font-bold">الراتب الأساسي الشهري:</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-mono font-black text-slate-900">{allowableAllowance.toFixed(3)} د.ك</span>
                        <span className="text-slate-500 font-bold">البدلات الاعتيادية الخاضعة:</span>
                      </div>
                      <div className="col-span-1 sm:col-span-2 flex justify-between bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 my-1">
                        <span className="font-mono font-black text-emerald-800 text-sm">{grossSalary.toFixed(3)} د.ك</span>
                        <span className="font-black text-slate-900">الأجر الشامل المعتمد للاحتساب (مادة 62):</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-black text-slate-900">{contractType}</span>
                        <span className="text-slate-500 font-bold">طبيعة عقد العمل المبرم:</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-100 pb-1.5">
                        <span className="font-black text-slate-900 text-[11px]">{terminationReason}</span>
                        <span className="text-slate-500 font-bold">سبب انتهاء علاقة العمل المقيد:</span>
                      </div>
                    </div>
                  </div>

                  {/* Section III: Detailed calculation matrix */}
                  <div className="relative z-10">
                    <div className="bg-[#134D41] text-white px-3 py-1.5 rounded-lg text-xs font-black flex justify-between items-center shadow-sm mb-3">
                      <span>ثالثاً: مصفوفة تسوية وتصفية المستحقات العمالية تفصيلياً</span>
                      <span className="text-[10px] font-normal opacity-85">مطابق تماماً لنصوص القانون وقضاء محكمة التمييز</span>
                    </div>
                    
                    <div className="overflow-x-auto border border-slate-300 rounded-xl bg-white">
                      <table className="w-full text-xs text-right border-collapse">
                        <thead>
                          <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-[10px] sm:text-xs">
                            <th className="p-3 border-l border-slate-200 font-extrabold text-right">البيان والاستحقاق المالي</th>
                            <th className="p-3 border-l border-slate-200 font-extrabold text-center">الأساس القانوني والعملية الرياضية</th>
                            <th className="p-3 font-extrabold text-left w-36">المبلغ (د.ك)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="p-3 border-l border-slate-200 text-right font-bold text-slate-800">
                              مكافأة نهاية الخدمة الإجمالية
                              <span className="block text-[9px] text-gray-500 font-normal mt-0.5">عن كامل مدة الخدمة ({computations.yearsOfService.toFixed(2)} سنة)</span>
                            </td>
                            <td className="p-3 border-l border-slate-200 text-slate-600 text-center text-[10.5px] leading-relaxed">
                              <div>أول 5 سنوات: {Math.min(5, computations.yearsOfService).toFixed(2)} سنة × 15 يوم/سنة × ({dailyRateIndemnity.toFixed(3)} د.ك/يوم)</div>
                              {computations.yearsOfService > 5 && (
                                <div>ما بعد الـ 5 سنوات: {(computations.yearsOfService - 5).toFixed(2)} سنة × 30 يوم/سنة × ({dailyRateIndemnity.toFixed(3)} د.ك/يوم)</div>
                              )}
                            </td>
                            <td className="p-3 text-left font-mono font-bold text-slate-900">{computations.rawIndemnity.toFixed(3)} د.ك</td>
                          </tr>
                          <tr>
                            <td className="p-3 border-l border-slate-200 text-right font-bold text-slate-800">
                              عامل تكييف مكافأة الاستقالة (المادة 53)
                              <span className="block text-[9px] text-gray-500 font-normal mt-0.5">بناءً على تدرج سنوات الخدمة بالاستقالة</span>
                            </td>
                            <td className="p-3 border-l border-slate-200 text-slate-600 text-center text-[11px]">
                              مدة الخدمة {computations.yearsOfService.toFixed(2)} سنة - نسبة الاستحقاق الفعلي: <span className="text-[#134D41] bg-teal-50 px-1.5 py-0.5 rounded border border-teal-100 font-bold font-mono">{Math.round(computations.conversionScale * 100)}%</span>
                            </td>
                            <td className="p-3 text-left font-mono font-bold text-slate-900">
                              × {computations.conversionScale.toFixed(2)}
                            </td>
                          </tr>
                          {computations.isCapped && (
                            <tr className="bg-amber-50">
                              <td className="p-3 border-l border-amber-200 text-right font-bold text-amber-900">
                                سقف مكافأة نهاية الخدمة (المادة 51)
                                <span className="block text-[9px] text-amber-700 font-normal mt-0.5">الحد الأقصى القانوني للمكافأة</span>
                              </td>
                              <td className="p-3 border-l border-amber-200 text-amber-700 text-center text-[11px] leading-relaxed">
                                تم تطبيق سقف الـ 18 شهراً من الراتب الشامل بموجب المادة 51: ({grossSalary.toFixed(3)} د.ك × 18 = {computations.ceilingMax.toFixed(3)} د.ك)
                              </td>
                              <td className="p-3 text-left font-mono font-bold text-amber-950">مُطبّق (سقف {computations.ceilingMax.toFixed(3)})</td>
                            </tr>
                          )}
                          <tr className="bg-teal-50/20 text-emerald-950">
                            <td className="p-3 border-l border-teal-100 text-right font-black">
                              صافي مكافأة نهاية الخدمة المعتمدة
                              <span className="block text-[9px] text-gray-500 font-normal mt-0.5">بعد تكييف الاستقالة وتطبيق السقف القانوني</span>
                            </td>
                            <td className="p-3 border-l border-teal-100 text-slate-600 text-center text-[11px]">
                              بموجب المادتين (51، 53) من القانون رقم 6 لسنة 2010
                            </td>
                            <td className="p-3 text-left font-mono font-black text-[#134D41]">{computations.finalIndemnity.toFixed(3)} د.ك</td>
                          </tr>
                          <tr>
                            <td className="p-3 border-l border-slate-200 text-right font-bold text-slate-800">
                              بدل رصيد الإجازات السنوية (المادة 68)
                              <span className="block text-[9px] text-gray-500 font-normal mt-0.5">عن رصيد أيام الإجازات المتراكمة وغير المستغلة</span>
                            </td>
                            <td className="p-3 border-l border-slate-200 text-slate-600 text-center text-[10.5px] leading-relaxed">
                              {netLeaveDays} يوم إجازة × ({dailyRateLeave.toFixed(3)} د.ك/يوم)
                              <span className="block text-[9px] text-slate-400 font-bold mt-0.5">المعدل اليومي يحسب على (الراتب الشامل / 26) وفق قضاء محكمة التمييز الكويتية</span>
                            </td>
                            <td className="p-3 text-left font-mono font-bold text-slate-900">{computations.leaveCompensation.toFixed(3)} د.ك</td>
                          </tr>
                          {computations.totalAdditions > 0 && (
                            <tr className="bg-emerald-50/40 text-emerald-900">
                              <td className="p-3 border-l border-emerald-200 text-right font-bold">
                                إضافات ومكافآت أخرى
                              </td>
                              <td className="p-3 border-l border-emerald-200 text-center text-emerald-700 text-[11px]">
                                {additions.map(a => `${a.description} (${a.amount.toFixed(3)} د.ك)`).join(' ، ')}
                              </td>
                              <td className="p-3 text-left font-mono font-bold">+{computations.totalAdditions.toFixed(3)} د.ك</td>
                            </tr>
                          )}
                          {computations.totalDeductions > 0 && (
                            <tr className="bg-rose-50/40 text-rose-900">
                              <td className="p-3 border-l border-rose-200 text-right font-bold">
                                استقطاعات وتنزيلات
                              </td>
                              <td className="p-3 border-l border-rose-200 text-center text-rose-700 text-[11px]">
                                {deductions.map(d => `${d.description} (${d.amount.toFixed(3)} د.ك)`).join(' ، ')}
                              </td>
                              <td className="p-3 text-left font-mono font-bold">-{computations.totalDeductions.toFixed(3)} د.ك</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Green Highlighted Grand Net box */}
                  <div className="bg-[#ECFDF5] border-2 border-emerald-500 rounded-2xl p-6 text-center select-all shadow-inner relative overflow-hidden z-10">
                    <div className="absolute right-4 top-4 opacity-5">
                      <Scale className="w-16 h-16 text-emerald-800" />
                    </div>
                    <span className="text-xs font-black text-slate-800 uppercase tracking-widest block mb-1">صافي المبلغ الاجمالي المستحق للصرف والدفع النهائي</span>
                    <strong className="text-2xl sm:text-3xl font-black text-[#134D41] font-mono block tracking-wider leading-relaxed">
                      {computations.netPayout.toFixed(3)} د.ك
                    </strong>
                    <p className="text-xs sm:text-sm font-black text-[#134D41] border-t border-emerald-200/80 pt-2 px-1 leading-relaxed font-sans mt-2">
                      فقط وقدره: {arabicWordsPayout} لا غير.
                    </p>
                  </div>

                  {/* Waiver satisfying covenant signature block */}
                  <div className="border border-dashed border-slate-350 p-4 rounded-xl text-[10px] leading-relaxed text-right bg-slate-50/50 text-slate-700 font-sans relative z-10">
                    <span className="font-extrabold text-slate-900 block mb-1 text-[11px]">إقرار وتعهد مخالصة وإبراء ذمة نهائي:</span>
                    أقر وأعترف أنا الموقع أدناه، <strong className="font-extrabold text-slate-900">{employeeName || "الموظف المذكورة بياناته أعلاه"}</strong>، بأنني قد استلمت بموجب هذا المستند كافة حقوقي ومستحقاتي العمالية والمالية المبينة بالجدول أعلاه من <strong className="font-extrabold text-slate-900">{companyName || "المنشأة/صاحب العمل"}</strong>، إقراراً قاطعاً مانعاً للجهالة ويشمل مكافأة نهاية خدمتي وبدل إجازاتي السنوية وكافة مستحقاتي العمالية الناشئة عن عقد عملي أو فترة خدمتي كاملة، وبهذا الاستلام أبرئ ذمة المنشأة إبراءً تاماً وشاملاً ونهائياً ونافذاً من أي حقوق أو مطالبات مستقبلية بموجب قانون العمل الكويتي بالقطاع الأهلي رقم 6 لسنة 2010 وتعديلاته.
                  </div>

                  {/* Sign Off Footprint with stamps and certification signatures */}
                  <div className="pt-6 border-t border-slate-200 mt-6 select-none relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center items-center">
                      
                      {/* Col 1: Employee signature */}
                      <div className="space-y-4 text-right">
                        <h4 className="font-black text-xs text-slate-900 border-b pb-1 font-sans">طرف أول: الموظف (المقر بالمخالصة)</h4>
                        <div className="space-y-1.5 text-[10px] text-slate-600 font-sans">
                          <p>الاسم الكامل: {employeeName || '................................'}</p>
                          <p>الهوية/الرقم المدني: {civilId || '................................'}</p>
                          <p className="pt-4 font-bold text-slate-700">التوقيع / البصمة: ............................</p>
                        </div>
                      </div>

                      {/* Col 2: Stamp & Seal center */}
                      <div className="flex flex-col items-center justify-center">
                        {/* Physical wet stamp aesthetic badge */}
                        <div className="relative border-4 border-double border-emerald-700/60 rounded-full w-24 h-24 flex flex-col items-center justify-center text-center p-2 select-none rotate-6 scale-95 mx-auto bg-white shadow-sm">
                          <span className="text-[7px] font-black text-emerald-800 font-sans leading-none">مكتب المحامي</span>
                          <span className="text-[9px] font-black text-emerald-950 font-serif my-0.5 leading-none">صبري شطا</span>
                          <span className="text-[6px] font-bold text-emerald-700 font-sans leading-none">مُعْتَمَد ومُدَقَّقْ</span>
                          <span className="text-[5px] font-mono text-emerald-500 leading-none mt-1">ADALAH-APPROVED</span>
                        </div>
                        <span className="text-[8px] font-black text-slate-400 mt-2 font-mono">AUTHORIZED CODENAME SEAL</span>
                      </div>

                      {/* Col 3: Company Representative or HR Signature */}
                      <div className="space-y-4 text-left" dir="ltr">
                        <h4 className="font-black text-xs text-slate-900 border-b pb-1 font-sans text-right">طرف ثانٍ: ممثل الشركة (صاحب العمل)</h4>
                        <div className="space-y-1.5 text-[10px] text-slate-600 font-sans text-right" dir="rtl">
                          <p>الاسم المسؤول: .................................</p>
                          <p>التوقيع والصفة: .................................</p>
                          <p className="pt-4 font-bold text-slate-700">تاريخ السداد الفعلي: ____ / ____ / ____ م</p>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

              </div>

              {/* Action Toolbar buttons inside modal */}
              <div className="flex justify-end gap-3 border-t pt-4 print:hidden" id="modal-controls-bottom animate-none">
                <button
                  type="button"
                  onClick={() => setShowPrintModal(false)}
                  className="border border-solid border-slate-400 hover:bg-slate-50 text-slate-700 font-bold text-xs px-6 py-2.5 rounded-xl transition-all cursor-pointer bg-white font-sans"
                >
                  إغلاق
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-[#134D41] hover:bg-[#0B332A] text-white font-serif font-black text-xs px-8 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer border-0 font-sans"
                >
                  <Printer className="w-4 h-4 ml-1.5" />
                  <span>طباعة الكشف التصفوي</span>
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Styled emulation block for full control of printers */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #official-print-modal, #official-print-modal * {
            visibility: visible !important;
          }
          #official-print-modal {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            background: white !important;
            padding: 0px !important;
            margin: 0px !important;
            box-shadow: none !important;
            border: none !important;
          }
          #modal-controls-top, #modal-controls-bottom {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default EndOfServicePage;
