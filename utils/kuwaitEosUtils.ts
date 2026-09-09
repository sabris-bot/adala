import { TerminationReasonKuwait, ContractTypeKuwait } from '../types';

export interface DurationDetails {
  years: number;
  months: number;
  days: number;
  totalCalendarDays: number;
  activeTotalDays: number;
}

export interface FinancialItem {
  description: string;
  amount: number;
}

export interface EosCalculationResult {
  rawIndemnity: number;
  conversionScale: number;
  finalIndemnityBeforeOffset: number;
  pifssOffsetApplied: number;
  finalIndemnity: number;
  leaveCompensation: number;
  leaveCompensationLaw: number;
  leaveCompensationCompany: number;
  leaveDaysLaw: number;
  leaveDaysCompany: number;
  leaveDailyRateLaw: number;
  leaveDailyRateCompany: number;
  totalAdditions: number;
  totalDeductions: number;
  netPayout: number;
  yearsOfService: number;
  firstPeriodDays: number;
  subsequentPeriodDays: number;
  isCapped: boolean;
  ceilingMax: number;
  pifssEstimate: number;
}

// Compact Arabic Number-to-Words for Kuwaiti Dinars and Fils
export function NumberToKuwaitiWords(num: number): string {
  const dinar = Math.floor(num);
  const fils = Math.round((num - dinar) * 1000);
  
  const onesAr = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة"];
  const teensAr = ["عشر", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const tensAr = ["", "عشرة", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundredsAr = ["", "مائة", "مائتان", "ثلاثمائة", "أربعمائة", "خمسمائة", "ستمائة", "سبعمائة", "ثمانمائة", "تسعمائة"];
  
  function convertLessThanThousand(n: number): string {
    if (n === 0) return "";
    let parts: string[] = [];
    const h = Math.floor(n / 100);
    if (h > 0) parts.push(hundredsAr[h]);
    
    const r = n % 100;
    if (r > 0) {
      if (r <= 10) parts.push(onesAr[r]);
      else if (r < 20) parts.push(teensAr[r - 10]);
      else {
        const t = Math.floor(r / 10);
        const o = r % 10;
        if (o > 0) parts.push(onesAr[o] + " و " + tensAr[t]);
        else parts.push(tensAr[t]);
      }
    }
    return parts.join(" و ");
  }

  function convertDinar(n: number): string {
    if (n === 0) return "صفر";
    let parts: string[] = [];
    const m = Math.floor(n / 1000000);
    if (m > 0) parts.push(convertLessThanThousand(m) + " مليون");
    const th = Math.floor((n % 1000000) / 1000);
    if (th > 0) {
      if (th === 1) parts.push("ألف");
      else if (th === 2) parts.push("ألفان");
      else parts.push(convertLessThanThousand(th) + " ألف");
    }
    const rem = n % 1000;
    if (rem > 0) parts.push(convertLessThanThousand(rem));
    return parts.join(" و ");
  }

  let result = convertDinar(dinar) + " دينار كويتي";
  if (fils > 0) {
    result += " و " + convertLessThanThousand(fils) + " فلساً";
  }
  return "فقط " + result + " لا غير";
}

// Calendar Duration Calculation based on Kuwaiti Work Days
export function calculateDurationKuwait(startStr: string, endStr: string, unpaidAbsenceDays: number): DurationDetails {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return { years: 0, months: 0, days: 0, totalCalendarDays: 0, activeTotalDays: 0 };
  }
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalCalendarDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  const activeTotalDays = Math.max(0, totalCalendarDays - unpaidAbsenceDays);

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

// Complete Kuwait Labor Law Indemnity Calculator
export function calculateEosKuwait(params: {
  joiningDate: string;
  exitDate: string;
  basicSalary: number;
  allowableAllowance: number;
  unpaidAbsenceDays: number;
  paymentFrequency: 'monthly' | 'daily';
  contractType: ContractTypeKuwait;
  terminationReason: TerminationReasonKuwait;
  totalAccruedLeaveDays: number;
  leaveDaysAlreadyTaken: number;
  indemnityDivisor: 26 | 30;
  isKuwaiti: boolean;
  pifssEmployerPaid: number;
  autoCalculatePifss: boolean;
  isFemaleSpecialResignation: boolean;
  enforceLeaveCap: boolean;
  leaveCapDays?: number;
  leaveAccrualBasis?: 'law30' | 'fullMonth';
  additions: FinancialItem[];
  deductions: FinancialItem[];
}): EosCalculationResult {
  const {
    joiningDate,
    exitDate,
    basicSalary,
    allowableAllowance,
    unpaidAbsenceDays,
    paymentFrequency,
    terminationReason,
    totalAccruedLeaveDays,
    leaveDaysAlreadyTaken,
    indemnityDivisor,
    isKuwaiti,
    pifssEmployerPaid,
    autoCalculatePifss,
    isFemaleSpecialResignation,
    enforceLeaveCap,
    leaveCapDays = 60,
    leaveAccrualBasis = 'law30',
    additions,
    deductions
  } = params;

  const emptyResult: EosCalculationResult = {
    rawIndemnity: 0,
    conversionScale: 1.0,
    finalIndemnityBeforeOffset: 0,
    pifssOffsetApplied: 0,
    finalIndemnity: 0,
    leaveCompensation: 0,
    leaveCompensationLaw: 0,
    leaveCompensationCompany: 0,
    leaveDaysLaw: 0,
    leaveDaysCompany: 0,
    leaveDailyRateLaw: 0,
    leaveDailyRateCompany: 0,
    totalAdditions: 0,
    totalDeductions: 0,
    netPayout: 0,
    yearsOfService: 0,
    firstPeriodDays: 0,
    subsequentPeriodDays: 0,
    isCapped: false,
    ceilingMax: 0,
    pifssEstimate: 0
  };

  if (!joiningDate || !exitDate) return emptyResult;
  const grossSalary = basicSalary + allowableAllowance;
  if (grossSalary <= 0) return emptyResult;

  const duration = calculateDurationKuwait(joiningDate, exitDate, unpaidAbsenceDays);
  const yearsFloat = duration.activeTotalDays / 365.25;
  const dailyRateIndemnity = grossSalary / indemnityDivisor;
  const dailyRateLeave = grossSalary / 26; // Under Kuwait Law, leave divisor is strictly 26

  let firstPeriodDays = 0;
  let subsequentPeriodDays = 0;

  // Article 51 Indemnity Multipliers
  if (paymentFrequency === 'monthly') {
    // Paid on monthly basis
    if (yearsFloat <= 5) {
      firstPeriodDays = yearsFloat * 15;
    } else {
      firstPeriodDays = 5 * 15;
      subsequentPeriodDays = (yearsFloat - 5) * indemnityDivisor; // One month's salary per year = indemnityDivisor days
    }
  } else {
    // Paid on daily, weekly, hourly or piece-work basis
    if (yearsFloat <= 5) {
      firstPeriodDays = yearsFloat * 10;
    } else {
      firstPeriodDays = 5 * 10;
      subsequentPeriodDays = (yearsFloat - 5) * 15;
    }
  }

  const rawIndemnity = (firstPeriodDays + subsequentPeriodDays) * dailyRateIndemnity;

  // Article 53: Resignation Scale
  let conversionScale = 1.0;
  const isResignation = [
    TerminationReasonKuwait.RESIGNATION,
    TerminationReasonKuwait.RESIGNATION_UNDER_3_YEARS,
    TerminationReasonKuwait.RESIGNATION_3_TO_5_YEARS,
    TerminationReasonKuwait.RESIGNATION_5_TO_10_YEARS,
    TerminationReasonKuwait.RESIGNATION_10_PLUS_YEARS
  ].includes(terminationReason);

  const isDisciplinaryArt41 = [
    TerminationReasonKuwait.DISMISSAL_WITHOUT_NOTICE_ART_41,
    TerminationReasonKuwait.DISMISSAL_ART_41_LOSS,
    TerminationReasonKuwait.DISMISSAL_ART_41_FRAUD,
    TerminationReasonKuwait.DISMISSAL_ART_41_SECRETS,
    TerminationReasonKuwait.DISMISSAL_ART_41_MORALS,
    TerminationReasonKuwait.DISMISSAL_ART_41_ASSAULT,
    TerminationReasonKuwait.DISMISSAL_ART_41_OBLIGATIONS,
    TerminationReasonKuwait.TERMINATION_FOR_ABSENCE,
    TerminationReasonKuwait.PROBATION_TERMINATION,
    TerminationReasonKuwait.PROBATION_RESIGNATION
  ].includes(terminationReason) || terminationReason.includes("المادة 41");

  if (isResignation) {
    if (isFemaleSpecialResignation) {
      // Article 54: Special exemption for female resignations (marriage within 1 year or birth within 6 months)
      conversionScale = 1.0;
    } else {
      if (yearsFloat < 3) conversionScale = 0.0;
      else if (yearsFloat < 5) conversionScale = 0.50;
      else if (yearsFloat < 10) conversionScale = 2 / 3;
      else conversionScale = 1.0;
    }
  } else if (isDisciplinaryArt41) {
    // Under Article 41: No indemnity is payable
    conversionScale = 0.0;
  } else {
    // Employer dismissal, retirement, death, mutual agreement, Article 48 resignation
    conversionScale = 1.0;
  }

  let finalIndemnityBeforeOffset = rawIndemnity * conversionScale;

  // Article 51 Max Ceiling Caps
  let ceilingMax = 0;
  let isCapped = false;
  if (paymentFrequency === 'monthly') {
    ceilingMax = grossSalary * 18; // 18 months' salary
  } else {
    ceilingMax = grossSalary * 12; // 1 year's salary (12 months)
  }

  if (finalIndemnityBeforeOffset > ceilingMax) {
    finalIndemnityBeforeOffset = ceilingMax;
    isCapped = true;
  }

  // PIFSS (Social Security) Offset calculation for Kuwaiti citizens
  let pifssOffsetApplied = 0;
  const pifssEstimate = Math.min(grossSalary, 3000) * 0.115 * (duration.activeTotalDays / 30.4375); // 11.5% employer share

  if (isKuwaiti) {
    pifssOffsetApplied = autoCalculatePifss ? pifssEstimate : pifssEmployerPaid;
  }

  // Final indemnity after PIFSS offset
  const finalIndemnity = Math.max(0, finalIndemnityBeforeOffset - pifssOffsetApplied);

  // Leave compensation calculations for both methods (law vs company policy)
  const leaveDaysLaw = (duration.activeTotalDays / 365) * 30;
  const leaveDaysCompany = (duration.activeTotalDays / 365.25) * 30;

  const leaveDailyRateLaw = grossSalary / 26;
  const leaveDailyRateCompany = grossSalary / 30;

  let actualLeaveDaysLaw = Math.max(0, leaveDaysLaw - leaveDaysAlreadyTaken);
  if (enforceLeaveCap && actualLeaveDaysLaw > leaveCapDays) {
    actualLeaveDaysLaw = leaveCapDays;
  }
  const leaveCompensationLaw = actualLeaveDaysLaw * leaveDailyRateLaw;

  let actualLeaveDaysCompany = Math.max(0, leaveDaysCompany - leaveDaysAlreadyTaken);
  if (enforceLeaveCap && actualLeaveDaysCompany > leaveCapDays) {
    actualLeaveDaysCompany = leaveCapDays;
  }
  const leaveCompensationCompany = actualLeaveDaysCompany * leaveDailyRateCompany;

  // Active leave compensation based on the selected accrual basis
  const leaveCompensation = leaveAccrualBasis === 'law30' ? leaveCompensationLaw : leaveCompensationCompany;

  // Financial additions and deductions sums
  const totalAdditions = additions.reduce((acc, item) => acc + item.amount, 0);
  const totalDeductions = deductions.reduce((acc, item) => acc + item.amount, 0);

  // Final aggregate payout
  const netPayout = Math.max(0, finalIndemnity + leaveCompensation + totalAdditions - totalDeductions);

  return {
    rawIndemnity,
    conversionScale,
    finalIndemnityBeforeOffset,
    pifssOffsetApplied,
    finalIndemnity,
    leaveCompensation,
    leaveCompensationLaw,
    leaveCompensationCompany,
    leaveDaysLaw,
    leaveDaysCompany,
    leaveDailyRateLaw,
    leaveDailyRateCompany,
    totalAdditions,
    totalDeductions,
    netPayout,
    yearsOfService: yearsFloat,
    firstPeriodDays,
    subsequentPeriodDays,
    isCapped,
    ceilingMax,
    pifssEstimate
  };
}
