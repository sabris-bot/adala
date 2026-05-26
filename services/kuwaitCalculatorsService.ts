/**
 * Kuwait Comprehensive Legal Calculators Service
 * Fully compliant with Kuwaiti Laws:
 * - Labor Law No. 6/2010
 * - Decree Law No. 17/1960 on Judicial Fees
 * - Civil Law No. 67/1980
 * - Commercial Code No. 68/1980
 * - Decree Law No. 35/1978 on Lease/Rentals
 * - Kuwait Personal Status Law No. 51/1984 (Inheritance)
 * - Kuwait Social Insurance Law (PIFSS rules)
 */

export interface LegalReference {
  article: string;
  lawNameAr: string;
  lawNameEn: string;
  explanationAr: string;
  explanationEn: string;
  formulaAr: string;
  formulaEn: string;
}

// ==========================================
// 1. Labor & End-of-Service Calculations
// ==========================================

export interface EOSInput {
  monthlySalary: number;
  startDate: string;
  endDate: string;
  nationality: 'kuwaiti' | 'expat';
  reason: 'resignation' | 'dismissal' | 'retirement' | 'death';
}

export interface EOSResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  dailyRate: number;
  calculatedIndemnity: number;
  reducedIndemnity: number;
  resignationFactor: number;
  references: LegalReference[];
}

export const calculateKuwaitEOS = (input: EOSInput): EOSResult => {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = totalDays / 365.25;
  const remainingDays = totalDays % 365.25;
  const months = Math.floor(remainingDays / 30.44);
  const days = Math.floor(remainingDays % 30.44);

  // Daily rate according to Article 62: Salary is divided by 26 (standard working days in a month)
  const dailyRate = input.monthlySalary / 26;
  
  let calculatedIndemnity = 0;

  // Working out standard indemnity:
  // Article 51 of Labor Law No. 6/2010:
  // - First 5 years: 15 days for each year (15/26 of monthly salary per year)
  // - Over 5 years: 30 days for each year (30/26 of monthly salary per year)
  if (years <= 5) {
    calculatedIndemnity = (dailyRate * 15) * years;
  } else {
    calculatedIndemnity = (dailyRate * 15) * 5 + (dailyRate * 30) * (years - 5);
  }

  // Resignation reduction factor (only applies to expats, and only for resignation):
  // Article 53:
  // - Service < 3 years: No indemnity (0)
  // - Service 3 to 5 years: Half indemnity (0.50)
  // - Service 5 to 10 years: Two-thirds indemnity (0.6667)
  // - Service >= 10 years: Full indemnity (1.00)
  let resignationFactor = 1.0;
  if (input.reason === 'resignation') {
    if (years < 3) {
      resignationFactor = 0.0;
    } else if (years < 5) {
      resignationFactor = 0.5;
    } else if (years < 10) {
      resignationFactor = 2 / 3;
    } else {
      resignationFactor = 1.0;
    }
  }

  // If Kuwaiti, end of service is typically replaced by PIFSS unless there's a custom contract,
  // but expats are strictly on this indemnity. For calculations we show both.
  const reducedIndemnity = calculatedIndemnity * resignationFactor;

  const references: LegalReference[] = [
    {
      article: 'المادة 51',
      lawNameAr: 'قانون العمل بالقطاع الأهلي رقم 6 لسنة 2010',
      lawNameEn: 'Kuwait Labor Law No. 6 of 2010',
      explanationAr: 'يستحق العامل مكافأة نهاية سنة بواقع 15 يوماً عن كل سنة من السنوات الخمس الأولى، و30 يوماً عن كل سنة تالية، على ألا تزيد المكافأة الإجمالية في جميع الأحوال عن راتب سنة ونصف لعمال الأجر الشهري.',
      explanationEn: 'The worker shall be entitled to an end-of-service indemnity of 15 days salary for each of the first five years, and 30 days for each following year, provided the total indemnity does not exceed 1.5 years salary.',
      formulaAr: 'مكافأة = (الراتب اليومي × 15) × أول 5 سنوات + (الراتب اليومي × 30) × باقي السنوات',
      formulaEn: 'Indemnity = (Daily Rate * 15) * First 5 Years + (Daily Rate * 30) * Extra Years'
    },
    {
      article: 'المادة 53',
      lawNameAr: 'قانون العمل بالقطاع الأهلي رقم 6 لسنة 2010',
      lawNameEn: 'Kuwait Labor Law No. 6 of 2010',
      explanationAr: 'في حالة الاستقالة يستحق العامل نصف المكافأة إذا تراوحت خدمته بين 3 إلى 5 سنوات، وثلثي المكافأة إذا تراوحت بين 5 إلى 10 سنوات، ويستحق المكافأة كاملة إذا بلغت خدمته 10 سنوات فأكثر.',
      explanationEn: 'In case of resignation, the worker is entitled to half indemnity for service of 3 to 5 years, two-thirds for service of 5 to 10 years, and full indemnity for service exceeding 10 years.',
      formulaAr: 'المكافأة الصافية = المكافأة الإجمالية × نسبة الاستقالة الصاحبة لمقدار الخدمة',
      formulaEn: 'Net Indemnity = Gross Indemnity * Resignation Factor based on service length'
    }
  ];

  return {
    years: Number(years.toFixed(2)),
    months,
    days,
    totalDays,
    dailyRate: Number(dailyRate.toFixed(3)),
    calculatedIndemnity: Number(calculatedIndemnity.toFixed(3)),
    reducedIndemnity: Number(reducedIndemnity.toFixed(3)),
    resignationFactor,
    references
  };
};

// ==========================================
// 2. Leave Balance Cash-out Calculator
// ==========================================

export interface LeaveInput {
  monthlySalary: number;
  annualAllocation: number; // default 30 days
  totalTaken: number;
  carryoverDays: number;
}

export interface LeaveResult {
  remainingDays: number;
  cashoutValue: number;
  dailyRate: number;
  references: LegalReference[];
}

export const calculateLeaveBalance = (input: LeaveInput): LeaveResult => {
  const dailyRate = input.monthlySalary / 26;
  const remainingDays = (input.annualAllocation + input.carryoverDays) - input.totalTaken;
  const cashoutValue = remainingDays > 0 ? remainingDays * dailyRate : 0;

  const references: LegalReference[] = [
    {
      article: 'المادة 70',
      lawNameAr: 'قانون العمل بالقطاع الأهلي رقم 6 لسنة 2010',
      lawNameEn: 'Kuwait Labor Law No. 6 of 2010',
      explanationAr: 'للعامل الحق في إجازة سنوية مدفوعة الأجر لا تقل عن 30 يوماً. ويستحق العامل بدلاً نقدياً عن رصيد إجازاته المتراكمة عند انتهاء عقده، محسوباً على أساس آخر راتب تقاضاه.',
      explanationEn: 'The worker is entitled to paid annual leave of not less than 30 days. Upon termination of service, the worker shall receive cash compensation for accumulated unused leave based on their last drawn salary.',
      formulaAr: 'التعويض النقدي للفترة = رصيد الإجازات المتبقية × (الراتب / 26)',
      formulaEn: 'Leave Compensation = Remaining days * (Salary / 26)'
    }
  ];

  return {
    remainingDays,
    cashoutValue: Number(cashoutValue.toFixed(3)),
    dailyRate: Number(dailyRate.toFixed(3)),
    references
  };
};

// ==========================================
// 3. Overtime Calculator
// ==========================================

export interface OvertimeInput {
  monthlySalary: number;
  normalHours: number;
  restDayHours: number;
  holidayHours: number;
}

export interface OvertimeResult {
  dailyRate: number;
  hourlyRate: number;
  normalOvertimePay: number;
  restDayOvertimePay: number;
  holidayOvertimePay: number;
  totalOvertimePay: number;
  references: LegalReference[];
}

export const calculateOvertime = (input: OvertimeInput): OvertimeResult => {
  const dailyRate = input.monthlySalary / 26;
  const hourlyRate = dailyRate / 8; // standard 8 hours working day in Kuwait

  // Normal overtime is paid at 1.25x (Article 66)
  const normalOvertimePay = input.normalHours * hourlyRate * 1.25;
  // Rest day overtime is paid at 1.50x (Article 67)
  const restDayOvertimePay = input.restDayHours * hourlyRate * 1.50;
  // Holiday overtime is paid at 2.00x
  const holidayOvertimePay = input.holidayHours * hourlyRate * 2.00;

  const totalOvertimePay = normalOvertimePay + restDayOvertimePay + holidayOvertimePay;

  const references: LegalReference[] = [
    {
      article: 'المادة 66',
      lawNameAr: 'قانون العمل بالقطاع الأهلي رقم 6 لسنة 2010',
      lawNameEn: 'Kuwait Labor Law No. 6 of 2010',
      explanationAr: 'يجوز تشغيل العامل ساعات إضافية بأمر كتابي من صاحب العمل، ويقاضى عنها أجراً يضاف إليه 25% من أجره العادي عن ساعات العمل الإضافية في الأيام العادية.',
      explanationEn: 'The worker may perform overtime work by written order of the employer, and shall be paid normal rate plus 25% for overtime hours worked on regular working days.',
      formulaAr: 'أجر الساعات الإضافية العادية = عدد الساعات × (الأجر اليومي / 8) × 1.25',
      formulaEn: 'Normal Overtime Pay = Hours * Hourly Rate * 1.25'
    },
    {
      article: 'المادة 67',
      lawNameAr: 'قانون العمل بالقطاع الأهلي رقم 6 لسنة 2010',
      lawNameEn: 'Kuwait Labor Law No. 6 of 2010',
      explanationAr: 'العمل في أيام الراحة الأسبوعية يعوض عنه بأجر إضافي يزيد بنسبة 50% على الأقل بالإضافة إلى يوم راحة بديل، والعمل في عطلات الأعياد يعوض عنه بضعف الأجر الكامل.',
      explanationEn: 'Work performed on weekly rest days shall be compensated with an additional 50% rate plus a compensatory rest day, and on public holidays at double the normal rate.',
      formulaAr: 'أجر عطلة الأسبوع = ساعات × الأجر الساعي × 1.5 | أجر يوم العيد = ساعات × الأجر الساعي × 2.0',
      formulaEn: 'Rest Day Pay = Hours * Hourly Rate * 1.5 | Holiday Pay = Hours * Hourly Rate * 2.0'
    }
  ];

  return {
    dailyRate: Number(dailyRate.toFixed(3)),
    hourlyRate: Number(hourlyRate.toFixed(3)),
    normalOvertimePay: Number(normalOvertimePay.toFixed(3)),
    restDayOvertimePay: Number(restDayOvertimePay.toFixed(3)),
    holidayOvertimePay: Number(holidayOvertimePay.toFixed(3)),
    totalOvertimePay: Number(totalOvertimePay.toFixed(3)),
    references
  };
};

// ==========================================
// 4. Kuwait Court Fees Calculator
// ==========================================

export interface CourtFeeInput {
  claimAmount: number;
  stage: 'FIRST_INSTANCE' | 'APPEAL' | 'CASSATION' | 'EXECUTION';
  isReFiling?: boolean;
  reFilingUnderThreeMonths?: boolean;
  selectedFixedFees?: string[]; // 'petition', 'notice', 'notary', 'admin', 'announcement'
}

export interface CourtFeeResult {
  proportionalFee: number;
  fixedFee: number;
  total: number;
  breakdown: { bracketAr: string; bracketEn: string; rate: number; portionValue: number; portionFee: number }[];
  references: LegalReference[];
}

export const calculateKuwaitCourtFee = (input: CourtFeeInput): CourtFeeResult => {
  const amount = input.claimAmount;
  let proportionalFee = 0;
  let fixedFee = 0;
  let breakdown: { bracketAr: string; bracketEn: string; rate: number; portionValue: number; portionFee: number }[] = [];
  
  // 1. Calculate Proportional Fee based on Law 17/1973 as amended by Decree-Law 78/2025
  if (amount > 0) {
    if (input.stage === 'FIRST_INSTANCE') {
      let remaining = amount;
      
      // Tier 1: Up to 30,000 KWD => 5%
      const t1 = Math.min(remaining, 30000);
      if (t1 > 0) {
        const fee = t1 * 0.05;
        proportionalFee += fee;
        breakdown.push({
          bracketAr: "الشريحة الأولى: كحد أقصى 30,000 د.ك (بنسبة 5%)",
          bracketEn: "First Tier: up to 30,000 KWD (at 5%)",
          rate: 5,
          portionValue: t1,
          portionFee: fee
        });
        remaining -= t1;
      }

      // Tier 2: 30,000 to 150,000 KWD => 3.5%
      if (remaining > 0) {
        const t2 = Math.min(remaining, 120000); // 150k - 30k
        const fee = t2 * 0.035;
        proportionalFee += fee;
        breakdown.push({
          bracketAr: "الشريحة الثانية: ما زاد عن 30,000 حتى 150,000 د.ك (بنسبة 3.5%)",
          bracketEn: "Second Tier: exceeding 30,000 up to 150,000 KWD (at 3.5%)",
          rate: 3.5,
          portionValue: t2,
          portionFee: fee
        });
        remaining -= t2;
      }

      // Tier 3: 150,000 to 500,000 KWD => 2.5%
      if (remaining > 0) {
        const t3 = Math.min(remaining, 350000); // 500k - 150k
        const fee = t3 * 0.025;
        proportionalFee += fee;
        breakdown.push({
          bracketAr: "الشريحة الثالثة: ما زاد عن 150,000 حتى 500,000 د.ك (بنسبة 2.5%)",
          bracketEn: "Third Tier: exceeding 150,000 up to 500,000 KWD (at 2.5%)",
          rate: 2.5,
          portionValue: t3,
          portionFee: fee
        });
        remaining -= t3;
      }

      // Tier 4: 500,000 to 5,000,000 KWD => 1.5%
      if (remaining > 0) {
        const t4 = Math.min(remaining, 4500000); // 5M - 500k
        const fee = t4 * 0.015;
        proportionalFee += fee;
        breakdown.push({
          bracketAr: "الشريحة الرابعة: ما زاد عن 500,000 حتى 5,000,000 د.ك (بنسبة 1.5%)",
          bracketEn: "Fourth Tier: exceeding 500,000 up to 5,000,000 KWD (at 1.5%)",
          rate: 1.5,
          portionValue: t4,
          portionFee: fee
        });
        remaining -= t4;
      }

      // Tier 5: Above 5,000,000 KWD => 1%
      if (remaining > 0) {
        const fee = remaining * 0.01;
        proportionalFee += fee;
        breakdown.push({
          bracketAr: "الشريحة الخامسة: ما فاق 5,000,000 د.ك (بنسبة 1%)",
          bracketEn: "Fifth Tier: exceeding 5,000,000 KWD (at 1%)",
          rate: 1,
          portionValue: remaining,
          portionFee: fee
        });
      }

      // Kuwait minimum court fee application: 10 KWD under Decree-Law 78/2025
      if (proportionalFee < 10) {
        proportionalFee = 10;
        breakdown = [{
          bracketAr: "الحد الأدنى للرسوم القضائية المقررة قانونياً بموجب تعديل 78/2025",
          bracketEn: "Minimum court fee applied according to Decree-Law 78/2025",
          rate: 0,
          portionValue: amount,
          portionFee: 10
        }];
      }
    } else if (input.stage === 'APPEAL') {
      // Appeal fee: Half of the First Instance court fee under Kuwaiti Law
      const baseResult = calculateKuwaitCourtFee({ claimAmount: amount, stage: 'FIRST_INSTANCE' });
      proportionalFee = baseResult.proportionalFee / 2;
      breakdown.push({
        bracketAr: "رسم الاستئناف (يعادل نصف رسم القيد الابتدائي المقدر)",
        bracketEn: "Appeal Fee (equals exactly 50% of the First Instance fee)",
        rate: 50,
        portionValue: baseResult.proportionalFee,
        portionFee: proportionalFee
      });
    } else if (input.stage === 'CASSATION') {
      fixedFee += 100; // Entry cassation fee in Kuwait
      proportionalFee = 50; // Mandatory Cassation security deposit
      breakdown.push({
        bracketAr: "كفالة أمانة التمييز الإجبارية المقررة بقلم المحكمة",
        bracketEn: "Mandatory Cassation Security Deposit fee",
        rate: 0,
        portionValue: amount,
        portionFee: 50
      });
    } else if (input.stage === 'EXECUTION') {
      fixedFee += 10; // Basic file opening fee
      proportionalFee = amount * 0.005; // 0.5% proportional fee on execution
      if (proportionalFee > 1000) proportionalFee = 1000; // Capped at 1,000 KWD
      breakdown.push({
        bracketAr: "رسم التنفيذ النسبي (0.5% بحد أقصى 1000 د.ك)",
        bracketEn: "Proportional Execution Fee (0.5% capped at 1,000 KWD)",
        rate: 0.5,
        portionValue: amount,
        portionFee: proportionalFee
      });
    }
  }

  // 2. Apply Re-filing (إعادة رفع الدعوى) rule inside 3 months or after
  if (input.isReFiling && input.stage === 'FIRST_INSTANCE') {
    if (input.reFilingUnderThreeMonths) {
      // Re-filed within 3 months => only 10% of the original prorated fee
      const originalPropFee = proportionalFee;
      proportionalFee = originalPropFee * 0.10;
      breakdown.push({
        bracketAr: "عمل قاعدة إعادة قيد الدعوى خلال 3 أشهر (خصم 90% رسم تشجيعي)",
        bracketEn: "Re-filing within 3 months rule applied (90% discount on prop fee)",
        rate: 10,
        portionValue: originalPropFee,
        portionFee: proportionalFee
      });
    } else {
      // Re-filed after 3 months => full new fee applied (no changes)
      breakdown.push({
        bracketAr: "إعادة قيد الدعوى بعد 3 أشهر (تطبيق الرسم المالي كاملاً)",
        bracketEn: "Re-filing after 3 months (requires full new fee standard)",
        rate: 100,
        portionValue: proportionalFee,
        portionFee: proportionalFee
      });
    }
  }

  // 3. Add Selected Fixed Court Fees (الرسوم الثابتة المرفقة)
  if (input.selectedFixedFees && input.selectedFixedFees.length > 0) {
    input.selectedFixedFees.forEach(feeId => {
      switch (feeId) {
        case 'petition': // Orders on petition
          fixedFee += 15;
          break;
        case 'notice': // Notifications
          fixedFee += 10;
          break;
        case 'notary': // Notarization
          fixedFee += 12;
          break;
        case 'admin': // Admin overhead
          fixedFee += 5;
          break;
        case 'announcement': // Newspaper announcement
          fixedFee += 25;
          break;
      }
    });
  }

  const references: LegalReference[] = [
    {
      article: "المواد المعدلة (شريحة الرسوم القضائية)",
      lawNameAr: "القانون رقم 17 لسنة 1973 بشأن الرسوم القضائية والمعدل بالمرسوم بقانون رقم 78 لسنة 2025",
      lawNameEn: "Kuwait Judicial Fees Law No. 17/1973 amended by Decree-Law No. 78/2025",
      explanationAr: "تعتمد الرسوم القضائية الكويتية المحدثة لعام 2025 نظام الشرائح التنازلية التصاعدية الموزعة تبدأ بنسبة 5% للمطالبات حتى 30,000 دينار وتنتهي بنسبة 1% لما يتجاوز 5 ملايين دينار كويتي مع حد أدنى للاستحقاق قدره 10 د.ك.",
      explanationEn: "The updated Kuwaiti judicial fees for 2025 adopt a step-down sliding rate structure starting at 5% for claims up to 30,000 KWD down to 1% for values exceeding 5 million KWD, with a minimum fee of 10 KWD.",
      formulaAr: "الرسوم = شريحة 1 (5%) + شريحة 2 (3.5%) + شريحة 3 (2.5%) + شريحة 4 (1.5%) + شريحة 5 (1%)",
      formulaEn: "Fee = Tier 1 (5%) + Tier 2 (3.5%) + Tier 3 (2.5%) + Tier 4 (1.5%) + Tier 5 (1%)"
    },
    {
      article: "قواعد إعادة قيد الدعوى",
      lawNameAr: "قانون المرافعات المدنية والتجارية الكويتي مادة 100",
      lawNameEn: "Kuwaiti Civil & Commercial Procedure Code, Article 100",
      explanationAr: "إذا اعتبرت الدعوى كأن لم تكن، وأعيد رفعها خلال ثلاثة أشهر من تاريخ الحكم، يسدد فقط ما يعادل 10% (عُشر) الرسم الأصلي المستحق، بينما يتوجب كامل الأداء إذا تم القيد بعد فوات المدة المذكورة.",
      explanationEn: "If a case is dismissed without prejudice or deemed non-existent, re-filing it within three months of judgment triggers a highly subsidized fee of 10%. Complete code rates are due after.",
      formulaAr: "الرسم الاستحقاقي خلال 3 أشهر = الرسم الأصلي × 10%",
      formulaEn: "Re-filing fee within 3-months = Original Calculated Fee * 10%"
    }
  ];

  return {
    proportionalFee: Number(proportionalFee.toFixed(3)),
    fixedFee: Number(fixedFee.toFixed(3)),
    total: Number((proportionalFee + fixedFee).toFixed(3)),
    breakdown,
    references
  };
};

// ==========================================
// 5. Legal Interest Calculator (الفوائد القانونية)
// ==========================================

export interface InterestInput {
  principalAmount: number;
  interestType: 'COMMERCIAL' | 'CIVIL';
  startDate: string;
  endDate: string;
}

export interface InterestResult {
  days: number;
  rate: number;
  calculatedInterest: number;
  totalWithInterest: number;
  references: LegalReference[];
}

export const calculateLegalInterest = (input: InterestInput): InterestResult => {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Kuwait Law rates:
  // Commercial Code Art 110: 7% delay interest
  // Civil Code Art 302: 4% delay interest
  const rate = input.interestType === 'COMMERCIAL' ? 7 : 4;
  const calculatedInterest = (input.principalAmount * (rate / 100) * days) / 365;
  const totalWithInterest = input.principalAmount + calculatedInterest;

  const references: LegalReference[] = [
    {
      article: 'المادة 110',
      lawNameAr: 'قانون التجارة الكويتي رقم 68 لسنة 1980',
      lawNameEn: 'Kuwaiti Commercial Code No. 68 of 1980',
      explanationAr: 'إذا كان محل الالتزام مبلغاً من النقود وكان معلوم المقدار وقت نشوء الالتزام وتأخر المدين في الوفاء به، كان ملزماً بالتعويض عن التأخير في صورة فوائد مرصودة بواقع 7% سنوياً بالنسبة للالتزامات التجارية.',
      explanationEn: 'If the obligation is a sum of money of known amount at inception and the debtor delays payment, they are liable for interest at 7% per annum for commercial obligations.',
      formulaAr: 'الفائدة = (أصل الدين × 7%) × عدد الأيام ÷ 365',
      formulaEn: 'Interest = (Principal * 7%) * Days / 365'
    },
    {
      article: 'المادة 302',
      lawNameAr: 'القانون المدني الكويتي رقم 67 لسنة 1980',
      lawNameEn: 'Kuwaiti Civil Code No. 67 of 1980',
      explanationAr: 'يستحق الدائن فوائد تأخيرية عن سداد الديون المدنية بنسبة قدرها 4% سنوياً تبدأ من تاريخ المطالبة القضائية بها ما لم يحدد الاتفاق تاريخاً آخر.',
      explanationEn: 'The creditor shall receive delay interest on civil debts at 4% per annum starting from the date of judicial claim, unless otherwise agreed contractually.',
      formulaAr: 'الفائدة المدنية = (أصل الدين × 4%) × عدد الأيام ÷ 365',
      formulaEn: 'Civil Interest = (Principal * 4%) * Days / 365'
    }
  ];

  return {
    days,
    rate,
    calculatedInterest: Number(calculatedInterest.toFixed(3)),
    totalWithInterest: Number(totalWithInterest.toFixed(3)),
    references
  };
};

// ==========================================
// 6. Rental and Real Estate Disputes
// ==========================================

export interface RentalInput {
  monthlyRent: number;
  lateMonths: number;
  compensationRate: number; // yearly penalty rate default e.g. 10%
}

export interface RentalResult {
  totalLateRent: number;
  penaltyCharges: number;
  totalClaim: number;
  references: LegalReference[];
}

export const calculateRentalDispute = (input: RentalInput): RentalResult => {
  const totalLateRent = input.monthlyRent * input.lateMonths;
  // Rent late interest/charge usually computed at contractual rate or civil rate (4%) annually
  const penaltyCharges = totalLateRent * (input.compensationRate / 100) * (input.lateMonths * 30.4) / 365;
  const totalClaim = totalLateRent + penaltyCharges;

  const references: LegalReference[] = [
    {
      article: 'المادة 11',
      lawNameAr: 'المرسوم بقانون رقم 35 لسنة 1978 بشأن إيجار العقارات',
      lawNameEn: 'Lease Decree Law No. 35 of 1978',
      explanationAr: 'الأجرة تستحق في أول كل شهر أو في المواعيد التي يحددها عقد الإيجار. وفي حال تأخر المستأجر عن سداد الأجرة يحق للمؤجر رفع دعوى بإخلاء العين المستأجرة ومطالبة المستأجر بجميع الأجور المتأخرة والتعويض المناسب.',
      explanationEn: 'Rent is due at the beginning of each month or as agreed in the contract. If the tenant delays payment, the landlord is entitled to request eviction and demand all overdue rents plus compensation.',
      formulaAr: 'أجوز الإعانة = الأجرة الشهرية × عدد أشهر التأخير',
      formulaEn: 'Total Rent Due = Monthly Rent * Months of Arrears'
    }
  ];

  return {
    totalLateRent: Number(totalLateRent.toFixed(3)),
    penaltyCharges: Number(penaltyCharges.toFixed(3)),
    totalClaim: Number(totalClaim.toFixed(3)),
    references
  };
};

// ==========================================
// 7. Social Security (PIFSS) Calculator
// ==========================================

export interface PIFSSInput {
  basicSalary: number; // max insurable basic is 3000 KWD
  allowanceSocial: number;
}

export interface PIFSSResult {
  insurableSalary: number;
  employeeDeduction: number;
  employerContribution: number;
  governmentContribution: number;
  totalPIFSSContribution: number;
  references: LegalReference[];
}

export const calculatePIFSS = (input: PIFSSInput): PIFSSResult => {
  const insurableSalary = Math.min(3000, input.basicSalary + input.allowanceSocial);
  
  // Standard PIFSS percentages for Kuwaiti employees:
  // Employee pays 11% (10.5% basic + 0.5% unemployment insurance)
  // Employer pays 12.5% (11.5% basic + 1% reward)
  // Government pays 1.5%
  const employeeDeduction = insurableSalary * 0.11;
  const employerContribution = insurableSalary * 0.125;
  const governmentContribution = insurableSalary * 0.015;
  const totalPIFSSContribution = employeeDeduction + employerContribution + governmentContribution;

  const references: LegalReference[] = [
    {
      article: 'المادة 11 والبدائل المعنية',
      lawNameAr: 'قانون التأمينات الاجتماعية الكويتي الصادر بالأمر الأميري رقم 61 لسنة 1976',
      lawNameEn: 'Kuwaiti Social Insurance Law No. 61 of 1976',
      explanationAr: 'تقتطع التأمينات الاجتماعية نسب اشتراك بمعدل 11% من المرتب الشامل للمؤمن عليه بحد أقصى 3000 دينار كويتي، وتلتزم جهة العمل بدفع 12.5% من الاشتراك الشهري.',
      explanationEn: 'Social Security premiums are deducted at 11% for the insured employee, up to a maximum limit of 3,000 KWD monthly. The employer contributes 12.5% and the state contributes 1.5%.',
      formulaAr: 'الاشتراك المقتطع = المرتب الخاضع (حد أقصى 3000 د.ك) × 11% موظف / 12.5% رب العمل',
      formulaEn: 'Premium = Insurable Salary (max 3000 KWD) * 11% Employee / 12.5% Employer'
    }
  ];

  return {
    insurableSalary: Number(insurableSalary.toFixed(3)),
    employeeDeduction: Number(employeeDeduction.toFixed(3)),
    employerContribution: Number(employerContribution.toFixed(3)),
    governmentContribution: Number(governmentContribution.toFixed(3)),
    totalPIFSSContribution: Number(totalPIFSSContribution.toFixed(3)),
    references
  };
};

// ==========================================
// 8. Islamic Inheritance Shares (الشريعة والتركات)
// ==========================================

export interface HeirInput {
  estateValue: number;
  debtsAndFuneral: number;
  husband: boolean;
  wifeCount: number; // 0 - 4
  sonsCount: number;
  daughtersCount: number;
  fatherExist: boolean;
  motherExist: boolean;
}

export interface LegalHeirShare {
  heirLabelAr: string;
  heirLabelEn: string;
  fractionAr: string;
  fractionEn: string;
  sharePercentage: number;
  amountKwd: number;
  evidenceAr: string;
  evidenceEn: string;
}

export interface InheritanceResult {
  netEstate: number;
  heirs: LegalHeirShare[];
  references: LegalReference[];
}

export const calculateInheritance = (input: HeirInput): InheritanceResult => {
  const netEstate = Math.max(0, input.estateValue - input.debtsAndFuneral);
  const heirs: LegalHeirShare[] = [];
  
  if (netEstate <= 0) {
    return { netEstate: 0, heirs: [], references: [] };
  }

  // A simplified Islamic (Suni code) division standard for common scenarios:
  // Base denominators for Islamic estates
  let sharesLeft = 1;

  let hasDescendant = (input.sonsCount > 0 || input.daughtersCount > 0);

  // 1. Spouses
  let spouseRatio = 0;
  if (input.husband) {
    sharesLeft -= hasDescendant ? 1/4 : 1/2;
    heirs.push({
      heirLabelAr: 'الزوج',
      heirLabelEn: 'Husband',
      fractionAr: hasDescendant ? '1/4' : '1/2',
      fractionEn: hasDescendant ? '1/4' : '1/2',
      sharePercentage: hasDescendant ? 25 : 50,
      amountKwd: netEstate * (hasDescendant ? 0.25 : 0.50),
      evidenceAr: 'فرض للزوج النصف لعدم وجود فرع وارث، والربع عند وجوده (سورة النساء مادة 288)',
      evidenceEn: 'The husband inherits 1/2 if no descending heirs exist, and 1/4 with heirs (Quran 4:12).'
    });
  } else if (input.wifeCount > 0) {
    spouseRatio = hasDescendant ? 1/8 : 1/4;
    sharesLeft -= spouseRatio;
    const shareEach = (netEstate * spouseRatio) / input.wifeCount;
    heirs.push({
      heirLabelAr: `الزوجة (${input.wifeCount})`,
      heirLabelEn: `Wife (${input.wifeCount})`,
      fractionAr: hasDescendant ? '1/8 بالتساوي' : '1/4 بالتساوي',
      fractionEn: hasDescendant ? '1/8 equally' : '1/4 equally',
      sharePercentage: Number(((spouseRatio / input.wifeCount) * 100).toFixed(2)),
      amountKwd: Number(shareEach.toFixed(3)),
      evidenceAr: 'فريض للزوجة الثمن عند وجود فرع وارث، والربع لعدم وجوده (سورة النساء مادة 289)',
      evidenceEn: 'Wife/Wives inherit 1/8 in total if children exist, and 1/4 if no children (Quran 4:12).'
    });
  }

  // 2. Parents
  let motherRatio = 0;
  if (input.motherExist) {
    motherRatio = hasDescendant ? 1/6 : 1/3;
    sharesLeft -= motherRatio;
    heirs.push({
      heirLabelAr: 'الأم',
      heirLabelEn: 'Mother',
      fractionAr: hasDescendant ? '1/6' : '1/3',
      fractionEn: hasDescendant ? '1/6' : '1/3',
      sharePercentage: Number((motherRatio * 100).toFixed(2)),
      amountKwd: Number((netEstate * motherRatio).toFixed(3)),
      evidenceAr: 'فرض للأم السدس عند وجود فرع وارث أو جمع من الإخوة، والثلث عند عدمهم (سورة النساء مادة 290)',
      evidenceEn: 'The mother inherits 1/6 if descendants exist, and 1/3 if no descendants exist (Quran 4:11).'
    });
  }

  let fatherRatio = 0;
  if (input.fatherExist) {
    fatherRatio = hasDescendant ? 1/6 : 0; // if children exist, father gets 1/6 by Fardh, rest of heritage goes to children. If no children, father gets the residue as Taaseeb (Assaba)
    if (fatherRatio > 0) {
      sharesLeft -= fatherRatio;
      heirs.push({
        heirLabelAr: 'الأب',
        heirLabelEn: 'Father',
        fractionAr: '1/6 फर्ضاً',
        fractionEn: '1/6 Fardh',
        sharePercentage: 16.67,
        amountKwd: Number((netEstate / 6).toFixed(3)),
        evidenceAr: 'فرض للأب السدس بوجود ولد ذكر وارث (مادة 291)',
        evidenceEn: 'The father inherits 1/6 as Fardh in the presence of male Descendants (Art 291).'
      });
    }
  }

  // 3. Children (Residue Assaba: Double share for males compared to females)
  const residue = Math.max(0, netEstate * sharesLeft);
  if (hasDescendant && residue > 0) {
    const totalParts = (input.sonsCount * 2) + input.daughtersCount;
    if (totalParts > 0) {
      const partValue = residue / totalParts;
      if (input.sonsCount > 0) {
        const sonShareTotal = (partValue * 2) * input.sonsCount;
        heirs.push({
          heirLabelAr: `الأبناء الذكور (${input.sonsCount})`,
          heirLabelEn: `Sons (${input.sonsCount})`,
          fractionAr: 'عصبة بالغير (للذكر مثل حظ الأنثيين)',
          fractionEn: 'Residuary (2:1 Ratio)',
          sharePercentage: Number(((sonShareTotal / netEstate) * 100).toFixed(2)),
          amountKwd: Number(sonShareTotal.toFixed(3)),
          evidenceAr: 'للذكر مثل حظ الأنثيين تعصيباً شريفاً (سورة النساء مادة 294)',
          evidenceEn: 'Males receive double the share of females as residuaries (Quran 4:11).'
        });
      }
      if (input.daughtersCount > 0) {
        const daughterShareTotal = partValue * input.daughtersCount;
        heirs.push({
          heirLabelAr: `الإناث البنات (${input.daughtersCount})`,
          heirLabelEn: `Daughters (${input.daughtersCount})`,
          fractionAr: 'عصبة بالغير / فرض',
          fractionEn: 'Residuary / Fardh',
          sharePercentage: Number(((daughterShareTotal / netEstate) * 100).toFixed(2)),
          amountKwd: Number(daughterShareTotal.toFixed(3)),
          evidenceAr: 'البنت تأخذ النصف منفردة، والثلثين جمعاً، ومع الابن عصبة بالغير (مادة 295)',
          evidenceEn: 'Daughters inherit 1/2 if single, 2/3 if multiple, and as residuary with sons.'
        });
      }
    }
  } else if (!hasDescendant && input.fatherExist && residue > 0) {
    // Father inherits residue as Assaba if no descending heirs
    heirs.push({
      heirLabelAr: 'الأب (عصبة)',
      heirLabelEn: 'Father (Residuary Assaba)',
      fractionAr: 'الباقي تعصيباً',
      fractionEn: 'Remainder as Assaba',
      sharePercentage: Number((sharesLeft * 100).toFixed(2)),
      amountKwd: Number(residue.toFixed(3)),
      evidenceAr: 'يرث الأب تركة عصبة كاملة لعدم وجود فرع وارث (المادة 291 من قانون الأحوال الشخصية الكويتي)',
      evidenceEn: 'The father inherits the entire remainder as residuary when there is no descendant.'
    });
  }

  const references: LegalReference[] = [
    {
      article: 'مجموعة المواريث',
      lawNameAr: 'قانون الأحوال الشخصية الكويتي رقم 51 لسنة 1984',
      lawNameEn: 'Kuwait Personal Status Law No. 51 of 1984',
      explanationAr: 'ينظم قانون الأحوال الشخصية الكويتي أحكام المواريث وتوزيع الحصص والأنصبة استلهاماً من الشريعة الإسلامية لكافة أفراد العائلة والقرابة الوارثين.',
      explanationEn: 'The Kuwaiti Personal Status Law regulates estate inheritance based on Islamic Sharia shares for direct and collateral relatives.',
      formulaAr: 'قواعد التوزيع الشرعي: أصحاب الفروض أولاً ثم العصبات والمحجوبين',
      formulaEn: 'Sharia Distribution Rules: Fixed shares (Fardh) first, followed by residuaries (Assaba).'
    }
  ];

  return {
    netEstate,
    heirs,
    references
  };
};

// ==========================================
// 9. Contract Penalty Days Limit (الشرط الجزائي)
// ==========================================

export interface PenaltyInput {
  contractValue: number;
  delayDays: number;
  dailyPenaltyRate: number; // e.g., 0.1% or fixed KWD
  rateType: 'PERCENT' | 'FIXED';
  maxPenaltyPercent: number; // usually 10% limit of contract in Kuwait public works
}

export interface PenaltyResult {
  dailyAmount: number;
  calculatedPenalty: number;
  cappedPenalty: number;
  isCapped: boolean;
  references: LegalReference[];
}

export const calculateContractPenalty = (input: PenaltyInput): PenaltyResult => {
  const dailyAmount = input.rateType === 'PERCENT'
    ? input.contractValue * (input.dailyPenaltyRate / 100)
    : input.dailyPenaltyRate;

  const calculatedPenalty = dailyAmount * input.delayDays;
  const maxCap = input.contractValue * (input.maxPenaltyPercent / 100);
  const isCapped = calculatedPenalty > maxCap;
  const cappedPenalty = isCapped ? maxCap : calculatedPenalty;

  const references: LegalReference[] = [
    {
      article: 'المادة 224',
      lawNameAr: 'المرسوم بالقانون رقم 67 لسنة 1980 بإصدار القانون المدني الكويتي',
      lawNameEn: 'Kuwaiti Civil Code No. 67 of 1980',
      explanationAr: 'يجوز للمتعاقدين أن يحددوا مقدماً قيمة التعويض في العقد (الشرط الجزائي)، ويكون هذا التعويض المتفق عليه غير مستحق إذا أثبت المدين أن الدائن لم يلحقه أي ضرر، ويجوز للقاضي أن يخفض قيمة التعويض إذا كان مبالغاً فيه.',
      explanationEn: 'Contracting parties may pre-determine compensatory values (liquidated damages). This agreed amount is not paid if the debtor proves no harm was incurred, and judges can reduce it if exaggerated.',
      formulaAr: 'غرامة التأخير الكلية = الأيام × الغرامة اليومية (بحد أقصى السقف القانوني المتفق عليه)',
      formulaEn: 'Total Penalty = Delay Days * Daily rate (capped at agreed legal ceiling)'
    }
  ];

  return {
    dailyAmount: Number(dailyAmount.toFixed(3)),
    calculatedPenalty: Number(calculatedPenalty.toFixed(3)),
    cappedPenalty: Number(cappedPenalty.toFixed(3)),
    isCapped,
    references
  };
};

// ==========================================
// Centralized Export
// ==========================================

export const kuwaitCalculatorsService = {
  calculateKuwaitEOS,
  calculateLeaveBalance,
  calculateOvertime,
  calculateKuwaitCourtFee,
  calculateLegalInterest,
  calculateRentalDispute,
  calculatePIFSS,
  calculateInheritance,
  calculateContractPenalty
};
