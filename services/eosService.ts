
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
    adjustedTotalDays?: number;
    
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
    accruedSalaryAmount?: number;
    
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
    leaveEntitlement: number; // usually 30 or 35/40
    leaveTaken: number;
    leaveAdjustment: number;
    noticeAction: 'WorkDuringNotice' | 'PayNoticePay' | 'Waived';
    otherAdditions: number;
    deductions: number;
    absenceDays: number;
    socialInsuranceDeduction: number;
    sector?: 'private' | 'oil' | 'government';
    unpaidLeaveDays?: number;
    disciplinaryDeductions?: number;
    finalMonthWorkedDays?: number; // actual days worked in final month
}): EOSCalculationResult => {
    // 0. Ensure inputs are numbers (or zero if NaN/invalid)
    const basicSalary = isNaN(inputs.basicSalary) || !isFinite(inputs.basicSalary) ? 0 : inputs.basicSalary;
    const allowances = isNaN(inputs.allowances) || !isFinite(inputs.allowances) ? 0 : inputs.allowances;
    const leaveEntitlement = isNaN(inputs.leaveEntitlement) || !isFinite(inputs.leaveEntitlement) ? 30 : inputs.leaveEntitlement;
    const leaveTaken = isNaN(inputs.leaveTaken) || !isFinite(inputs.leaveTaken) ? 0 : inputs.leaveTaken;
    const leaveAdjustment = isNaN(inputs.leaveAdjustment) || !isFinite(inputs.leaveAdjustment) ? 0 : inputs.leaveAdjustment;
    const otherAdditions = isNaN(inputs.otherAdditions) || !isFinite(inputs.otherAdditions) ? 0 : inputs.otherAdditions;
    const deductions = isNaN(inputs.deductions) || !isFinite(inputs.deductions) ? 0 : inputs.deductions;
    const absenceDays = isNaN(inputs.absenceDays) || !isFinite(inputs.absenceDays) ? 0 : inputs.absenceDays;
    const socialInsuranceDeduction = isNaN(inputs.socialInsuranceDeduction) || !isFinite(inputs.socialInsuranceDeduction) ? 0 : inputs.socialInsuranceDeduction;
    const unpaidLeaveDays = isNaN(inputs.unpaidLeaveDays || 0) || !isFinite(inputs.unpaidLeaveDays || 0) ? 0 : (inputs.unpaidLeaveDays || 0);
    const disciplinaryDeductionsInput = isNaN(inputs.disciplinaryDeductions || 0) || !isFinite(inputs.disciplinaryDeductions || 0) ? 0 : (inputs.disciplinaryDeductions || 0);
    const finalMonthWorkedDaysInput = isNaN(inputs.finalMonthWorkedDays || 0) || !isFinite(inputs.finalMonthWorkedDays || 0) ? 0 : (inputs.finalMonthWorkedDays || 0);

    const start = parseISO(inputs.joiningDate || "2026-05-25");
    const end = parseISO(inputs.lastWorkingDay || "2026-05-25");
    
    const isStartValid = start && !isNaN(start.getTime());
    const isEndValid = end && !isNaN(end.getTime());

    // Total raw days
    const rawTotalDays = (isStartValid && isEndValid) ? Math.max(0, differenceInDays(end, start)) : 0;
    // Subtract unpaid leave days as they do not count towards the duration of employment in Kuwaiti Labor Law
    const unpaidDays = unpaidLeaveDays;
    const totalDays = Math.max(0, rawTotalDays - unpaidDays);
    
    let serviceYearsFull = Math.floor(totalDays / 365.25);
    let serviceMonthsFull = Math.floor((totalDays % 365.25) / 30.4375);
    let serviceDaysRemaining = Math.floor((totalDays % 365.25) % 30.4375);

    if (isNaN(serviceYearsFull)) serviceYearsFull = 0;
    if (isNaN(serviceMonthsFull)) serviceMonthsFull = 0;
    if (isNaN(serviceDaysRemaining)) serviceDaysRemaining = 0;
    
    const yearsFloat = isNaN(totalDays / 365.25) ? 0 : totalDays / 365.25;
    const grossSalary = basicSalary + allowances;
    
    const sector = inputs.sector || 'private';
    
    // daily rate for monthly workers in civil sector is Gross salary / 26
    // for oil sector daily rate is Gross salary / 30 usually
    const dailyRateDivisor = sector === 'oil' ? 30 : 26;
    const dailyRate = grossSalary / dailyRateDivisor; 
    
    // 1. Indemnity Calculation based on Sector
    let baseIndemnity = 0;
    let firstFiveAmount = 0;
    let subsequentAmount = 0;
    let cap = 0;
    let isCapped = false;
    let sectorDesc = "قانون العمل رقم 6 لسنة 2010 (القطاع الأهلي)";
    const articles: { article: string; text: string }[] = [];

    if (sector === 'oil') {
        // --- Oil Sector (Law No. 28 of 1969) ---
        // 30 days per year for the first 5 years (which equals 1 month/year)
        // 45 days per year for each subsequent year (which equals 1.5 months/year)
        // Oil sector worker is entitled to an uncapped end of service indemnity!
        sectorDesc = "قانون العمل في قطاع البترول رقم 28 لسنة 1969";
        articles.push({ article: "بند البترول", text: "يستحق العامل في قطاع النفط مكافأة نهاية خدمة بواقع أجر 30 يوماً عن كل سنة من السنوات الخمس الأولى، وأجر 45 يوماً عن كل سنة تالية، دون سقف أقصى للمكافأة." });
        
        if (yearsFloat <= 5) {
            firstFiveAmount = grossSalary * yearsFloat; // 30 days is exactly 1 month
        } else {
            firstFiveAmount = grossSalary * 5;
            subsequentAmount = (grossSalary * 1.5) * (yearsFloat - 5); // 45 days is 1.5 months
        }
        baseIndemnity = firstFiveAmount + subsequentAmount;
        cap = Infinity; // Uncapped
        isCapped = false;
    } else if (sector === 'government') {
        // --- Government/Civil Service Sector ---
        // For non-Kuwaitis under CSC guidelines: 15 days/year for first 5 years, 1 month thereafter. Capped at 10 months.
        sectorDesc = "نظام ديوان الخدمة المدنية (القطاع الحكومي)";
        articles.push({ article: "ديوان الخدمة", text: "تُحدد مكافأة غير الكويتيين في الخدمة المدنية بواقع نصف شهر (15 يوماً) عن الخمس سنوات الأولى، وشهر عن كل سنة تالية وبحد أقصى يعادل راتب 10 أشهر." });
        
        if (yearsFloat <= 5) {
            firstFiveAmount = (grossSalary * 0.5) * yearsFloat;
        } else {
            firstFiveAmount = (grossSalary * 0.5) * 5;
            subsequentAmount = grossSalary * (yearsFloat - 5);
        }
        baseIndemnity = firstFiveAmount + subsequentAmount;
        cap = grossSalary * 10; // 10 months salary cap
        if (baseIndemnity > cap) {
            baseIndemnity = cap;
            isCapped = true;
        }
    } else {
        // --- Private Sector ( الأهلي ) Law No. 6 of 2010 ---
        articles.push({ article: "51", text: "يستحق العامل مكافأة نهاية خدمة بواقع 15 يوماً عن كل سنة من السنوات الخمس الأولى وشهراً عن كل سنة تالية (للموظف الشهري)." });
        
        if (inputs.paySystem === 'شهري') {
            if (yearsFloat <= 5) {
                firstFiveAmount = (dailyRate * 15) * yearsFloat;
            } else {
                firstFiveAmount = (dailyRate * 15) * 5;
                subsequentAmount = grossSalary * (yearsFloat - 5);
            }
            cap = grossSalary * 18; // Maximum indemnity is 1.5 years salary (18 months)
        } else {
            // Non-monthly wage workers (daily / hourly / piecework): 10 days for first 5 years, 15 days thereafter.
            if (yearsFloat <= 5) {
                firstFiveAmount = (dailyRate * 10) * yearsFloat;
            } else {
                firstFiveAmount = (dailyRate * 10) * 5;
                subsequentAmount = (dailyRate * 15) * (yearsFloat - 5);
            }
            cap = grossSalary * 12; // One year salary
        }

        baseIndemnity = firstFiveAmount + subsequentAmount;
        if (baseIndemnity > cap) {
            baseIndemnity = cap;
            isCapped = true;
        }
    }

    // 2. Adjustment Factor based on Reason (Article 53, 41, 48, 54)
    let factor = 1.0;
    let adjDesc = "استحقاق كامل";

    // Resignation Logic (Article 53)
    // Note: resignation rules apply only to civil/private and sometimes government. In oil, and civil sector, resignation over 10 years gets 100%.
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
    const accruedLeave = yearsFloat * leaveEntitlement;
    const currentLeaveBalance = accruedLeave - leaveTaken + leaveAdjustment;
    const leavePay = currentLeaveBalance * dailyRate;
    articles.push({ article: "70-79", text: "يستحق العامل إجازة سنوية ويتم تعويضه نقداً عن رصيد الإجازات المتبقي عند نهاية الخدمة." });

    // 4. Notice Period Pay (Article 44)
    let noticePay = 0;
    if (inputs.noticeAction === 'PayNoticePay') {
        noticePay = grossSalary * 3; // Standard 3 months notice for monthly workers in civil cases
        articles.push({ article: "44", text: "في حال عدم منح مهلة الإخطار، يلتزم الطرف المنتهي بدفع بدل نقدي يعادل أجر العامل عن نفس الفترة." });
    }

    // 5. Accrued Salary for Final Month worked days
    // If the employee actually worked a few days during their terminal month, they receive pro-rated accrued salary
    const finalMonthWorkedDays = finalMonthWorkedDaysInput;
    const accruedSalary = finalMonthWorkedDays * dailyRate; 
    if (finalMonthWorkedDays > 0) {
        articles.push({ article: "الأجر المستحق", text: "يستحق العامل أجراً متراصداً عن الأيام الفعلية التي قضاها على رأس العمل خلال شهر تصفية الخدمة." });
    }

    // 6. Totals & Deductions
    const additionsTotal = finalIndemnity + leavePay + noticePay + accruedSalary + otherAdditions;
    const absenceDeduction = absenceDays * dailyRate;
    const disciplinaryDeductions = disciplinaryDeductionsInput;
    const deductionsTotal = deductions + absenceDeduction + socialInsuranceDeduction + disciplinaryDeductions;
    const netAmount = additionsTotal - deductionsTotal;

    // Recursive NaN and Infinity cleaner helper
    const recursiveSanitizeNaN = (obj: any): any => {
        if (obj === null || obj === undefined) return obj;
        if (typeof obj === 'number') {
            return isNaN(obj) || !isFinite(obj) ? 0 : obj;
        }
        if (Array.isArray(obj)) {
            return obj.map(item => recursiveSanitizeNaN(item));
        }
        if (typeof obj === 'object') {
            const result: any = {};
            for (const key of Object.keys(obj)) {
                result[key] = recursiveSanitizeNaN(obj[key]);
            }
            return result;
        }
        return obj;
    };

    const rawResult: EOSCalculationResult = {
        serviceYears: serviceYearsFull,
        serviceMonths: serviceMonthsFull,
        serviceDays: serviceDaysRemaining,
        totalDays: rawTotalDays,
        adjustedTotalDays: totalDays,
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
        accruedSalaryAmount: Math.round(accruedSalary * 1000) / 1000,
        additionsTotal: Math.round(additionsTotal * 1000) / 1000,
        deductionsTotal: Math.round(deductionsTotal * 1000) / 1000,
        netAmount: Math.round(netAmount * 1000) / 1000,
        legalArticles: articles
    };

    return recursiveSanitizeNaN(rawResult);
};

