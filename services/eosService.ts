
import { format, differenceInDays, differenceInYears, differenceInMonths, parseISO, addYears, addMonths } from 'date-fns';
import { TerminationReasonKuwait, ContractTypeKuwait, EOS_Settlement, EOS_SettlementStatus } from '../types';

/**
 * Kuwaiti Labor Law End of Service Calculation Service
 * Reference: Private Sector Labor Law No. 6 of 2010
 */

export interface EOSCalculationResult {
    serviceYears: number;
    serviceMonths: number;
    serviceDays: number;
    totalDays: number;
    
    indemnityAmount: number;
    indemnityBreakdown: {
        firstFiveYearsAmount: number;
        subsequentYearsAmount: number;
        totalBeforeCap: number;
        capAmount: number;
        isCapped: boolean;
        adjustmentFactor: number;
        adjustmentDescription: string;
    };
    
    leaveBalanceDays: number;
    leavePayAmount: number;
    
    noticePeriodPay: number;
    
    additionsTotal: number;
    deductionsTotal: number;
    netAmount: number;
    
    legalArticles: { article: string; text: string }[];
}

export const calculateKuwaitEOS = (inputs: {
    joiningDate: string;
    lastWorkingDay: string;
    basicSalary: number;
    allowances: number;
    terminationReason: TerminationReasonKuwait;
    paySystem: 'شهري' | 'غير شهري';
    leaveEntitlement: number; // usually 30
    leaveTaken: number;
    leaveAdjustment: number;
    noticeAction: 'WorkDuringNotice' | 'PayNoticePay' | 'Waived';
    otherAdditions: number;
    deductions: number;
    absenceDays: number;
    socialInsuranceDeduction: number;
}): EOSCalculationResult => {
    const start = parseISO(inputs.joiningDate);
    const end = parseISO(inputs.lastWorkingDay);
    
    const totalDays = Math.max(0, differenceInDays(end, start));
    const serviceYearsFull = Math.floor(totalDays / 365.25);
    const serviceMonthsFull = Math.floor((totalDays % 365.25) / 30.4375);
    const serviceDaysRemaining = Math.floor((totalDays % 365.25) % 30.4375);
    
    const yearsFloat = totalDays / 365.25;
    const grossSalary = inputs.basicSalary + inputs.allowances;
    const dailyRate = grossSalary / 26; // Standard Kuwaiti Labor Law daily rate for monthly workers
    
    // 1. Indemnity Calculation (Article 51)
    let baseIndemnity = 0;
    let firstFiveAmount = 0;
    let subsequentAmount = 0;
    let cap = 0;
    let isCapped = false;

    if (inputs.paySystem === 'شهري') {
        // Kuwaiti practice for monthly workers for Indemnity calculation:
        // First 5 years: 15 days for each year -> (Salary/26) * 15
        // Thereafter: 1 month for each year -> grossSalary
        if (yearsFloat <= 5) {
            firstFiveAmount = (dailyRate * 15) * yearsFloat;
        } else {
            firstFiveAmount = (dailyRate * 15) * 5;
            subsequentAmount = grossSalary * (yearsFloat - 5);
        }
        cap = grossSalary * 18; // Maximum indemnity is 1.5 years salary (18 months)
    } else {
        // 10 days for first 5 years, 15 days thereafter
        const workerDailyRate = grossSalary / 26; 
        if (yearsFloat <= 5) {
            firstFiveAmount = (workerDailyRate * 10) * yearsFloat;
        } else {
            firstFiveAmount = (workerDailyRate * 10) * 5;
            subsequentAmount = (workerDailyRate * 15) * (yearsFloat - 5);
        }
        cap = grossSalary * 12; // One year salary
    }

    baseIndemnity = firstFiveAmount + subsequentAmount;
    if (baseIndemnity > cap) {
        baseIndemnity = cap;
        isCapped = true;
    }

    // 2. Adjustment Factor based on Reason (Article 53, 41, 48, 54)
    let factor = 1.0;
    let adjDesc = "استحقاق كامل";
    const articles: { article: string; text: string }[] = [];

    articles.push({ article: "51", text: "يستحق العامل مكافأة نهاية خدمة بواقع 15 يوماً عن كل سنة من السنوات الخمس الأولى وشهراً عن كل سنة تالية (للموظف الشهري)." });

    // Resignation Logic (Article 53)
    if (inputs.terminationReason.includes("استقالة") || 
        inputs.terminationReason === TerminationReasonKuwait.RESIGNATION ||
        inputs.terminationReason === TerminationReasonKuwait.RESIGNATION_UNDER_3_YEARS ||
        inputs.terminationReason === TerminationReasonKuwait.RESIGNATION_3_TO_5_YEARS ||
        inputs.terminationReason === TerminationReasonKuwait.RESIGNATION_5_TO_10_YEARS ||
        inputs.terminationReason === TerminationReasonKuwait.RESIGNATION_10_PLUS_YEARS) {
        
        articles.push({ article: "53", text: "تحدد نسب استحقاق المكافأة في حال الاستقالة: صفر (أقل من 3 سنوات)، نصف (3-5 سنوات)، ثلثي (5-10 سنوات)، كاملة (10+ سنوات)." });

        if (yearsFloat < 3) {
            factor = 0;
            adjDesc = "لا يوجد استحقاق (استقالة قبل 3 سنوات)";
        } else if (yearsFloat < 5) {
            factor = 0.5;
            adjDesc = "نصف المكافأة (استقالة 3-5 سنوات)";
        } else if (yearsFloat < 10) {
            factor = 2/3;
            adjDesc = "ثلثي المكافأة (استقالة 5-10 سنوات)";
        } else {
            factor = 1.0;
            adjDesc = "المكافأة كاملة (استقالة 10+ سنوات)";
        }
    }

    // Special Case: Marriage (Article 54)
    if (inputs.terminationReason === TerminationReasonKuwait.MARRIAGE_RESIGNATION_WOMEN) {
        factor = 1.0;
        adjDesc = "استحقاق كامل (استقالة المرأة بسبب الزواج)";
        articles.push({ article: "54", text: "تستحق العاملة مكافأة نهاية خدمة كاملة إذا أنهت العقد بسبب زواجها خلال عام من تاريخ الزواج." });
    }

    // Special Case: Employer Fault (Article 48)
    if (inputs.terminationReason.includes("المادة 48")) {
        factor = 1.0;
        adjDesc = "استحقاق كامل (ترك العمل لسبب يرجع لجهاز رب العمل)";
        articles.push({ article: "48", text: "يجوز للعامل أن ينهي عقد العمل بدون إخطار ويستحق مكافأة نهاية الخدمة كاملة إذا أخل صاحب العمل بالتزاماته." });
    }

    // Special Case: Firing for cause (Article 41)
    if (inputs.terminationReason.includes("المادة 41") || inputs.terminationReason === TerminationReasonKuwait.DISMISSAL_WITHOUT_NOTICE_ART_41) {
        factor = 0;
        adjDesc = "حرمان من المكافأة (فصل تأديبي جسيم)";
        articles.push({ article: "41", text: "يجوز لصاحب العمل فصل العامل بدون إخطار وبدون مكافأة إذا ارتكب خطأ جسيماً." });
    }

    // Full Entitlement Reasons (No deduction)
    const fullReasons = [
        TerminationReasonKuwait.DISMISSAL_WITH_NOTICE,
        TerminationReasonKuwait.DEATH,
        TerminationReasonKuwait.TOTAL_DISABILITY,
        TerminationReasonKuwait.RETIREMENT,
        TerminationReasonKuwait.CONTRACT_EXPIRY,
        TerminationReasonKuwait.CLOSURE_OR_BANKRUPTCY,
        TerminationReasonKuwait.ORGANIZATIONAL_REDUNDANCY
    ];

    if (fullReasons.includes(inputs.terminationReason)) {
        factor = 1.0;
        adjDesc = "استحقاق كامل (إنهاء من صاحب العمل أو ظروف قهرية)";
    }

    const finalIndemnity = baseIndemnity * factor;

    // 3. Leave Balance Calculation (Article 70-79)
    // Accrued leave = (Years of service) * entitlement per year
    const accruedLeave = yearsFloat * inputs.leaveEntitlement;
    const currentLeaveBalance = accruedLeave - inputs.leaveTaken + inputs.leaveAdjustment;
    const leavePay = currentLeaveBalance * dailyRate;
    articles.push({ article: "70-79", text: "يستحق العامل إجازة سنوية ويتم تعويضه نقداً عن رصيد الإجازات المتبقي عند نهاية الخدمة." });

    // 4. Notice Period Pay (Article 44)
    let noticePay = 0;
    if (inputs.noticeAction === 'PayNoticePay') {
        noticePay = grossSalary * 3; // Standard 3 months for monthly pay
        articles.push({ article: "44", text: "في حال عدم منح مهلة الإخطار، يلتزم الطرف المنتهي بدفع بدل نقدي يعادل أجر العامل عن نفس الفترة." });
    }

    // 5. Totals
    const additionsTotal = finalIndemnity + leavePay + noticePay + inputs.otherAdditions;
    const absenceDeduction = inputs.absenceDays * dailyRate;
    const deductionsTotal = inputs.deductions + absenceDeduction + inputs.socialInsuranceDeduction;
    const netAmount = additionsTotal - deductionsTotal;

    return {
        serviceYears: serviceYearsFull,
        serviceMonths: serviceMonthsFull,
        serviceDays: serviceDaysRemaining,
        totalDays,
        indemnityAmount: Math.round(finalIndemnity * 1000) / 1000,
        indemnityBreakdown: {
            firstFiveYearsAmount: firstFiveAmount,
            subsequentYearsAmount: subsequentAmount,
            totalBeforeCap: baseIndemnity,
            capAmount: cap,
            isCapped,
            adjustmentFactor: factor,
            adjustmentDescription: adjDesc
        },
        leaveBalanceDays: Math.round(currentLeaveBalance * 100) / 100,
        leavePayAmount: Math.round(leavePay * 1000) / 1000,
        noticePeriodPay: Math.round(noticePay * 1000) / 1000,
        additionsTotal: Math.round(additionsTotal * 1000) / 1000,
        deductionsTotal: Math.round(deductionsTotal * 1000) / 1000,
        netAmount: Math.round(netAmount * 1000) / 1000,
        legalArticles: articles
    };
};
