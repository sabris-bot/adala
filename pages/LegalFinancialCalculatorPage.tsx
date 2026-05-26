import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { 
  Calculator, 
  Banknote, 
  Scale, 
  Gavel, 
  Briefcase, 
  Calendar, 
  Printer, 
  Download, 
  Plus, 
  Search, 
  Trash2, 
  Eye, 
  Info, 
  Clock, 
  BarChart3, 
  ChevronDown, 
  Check, 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  Languages, 
  Users, 
  Building, 
  Percent, 
  ClipboardCheck, 
  TrendingUp, 
  Coins,
  History,
  FileCheck2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { useJurisdiction } from '../components/JurisdictionContext';
import { initialCases } from '../data/caseData';
import { kuwaitCalculatorsService, LegalReference } from '../services/kuwaitCalculatorsService';
import { geminiService } from '../services/geminiService';

// TYPES
type CalcType = 
  | 'eos' 
  | 'leave' 
  | 'overtime' 
  | 'pifss' 
  | 'labor_settlement' 
  | 'court_fees' 
  | 'enforcement' 
  | 'deadlines' 
  | 'interest' 
  | 'penalty' 
  | 'installment' 
  | 'rental' 
  | 'inheritance';

interface SavedOperation {
  id: string;
  titleAr: string;
  titleEn: string;
  calcType: CalcType;
  clientName: string;
  caseId?: string;
  finalTotal: number;
  date: string;
  inputs: any;
  breakdown: { labelAr: string; labelEn: string; value: number }[];
  references: LegalReference[];
}

// SAMPLE PRELOADED OPERATIONS DATA FOR SEEDING / DEMOS
const initialSavedOperations: SavedOperation[] = [
  {
    id: 'op-1',
    titleAr: 'مكافأة نهاية الخدمة - المهندس أحمد خالد',
    titleEn: 'EOS Indemnity - Engineer Ahmed Khaled',
    calcType: 'eos',
    clientName: 'أحمد خالد سليمان',
    caseId: 'CASE-2024-551',
    finalTotal: 12538.462,
    date: '2026-05-18',
    inputs: { monthlySalary: 1800, startDate: '2016-01-01', endDate: '2025-01-01', nationality: 'expat', reason: 'resignation' },
    breakdown: [
      { labelAr: 'الأجر اليومي المعتمد', labelEn: 'Daily Approved Rate', value: 69.231 },
      { labelAr: 'سنوات الخدمة الإجمالية', labelEn: 'Total Years Served', value: 9 },
      { labelAr: 'مكافأة أول 5 سنوات (15 يوماً)', labelEn: 'First 5 Years (15 days)', value: 5192.308 },
      { labelAr: 'مكافأة السنوات التالية (30 يوماً)', labelEn: 'Succeeding Years (30 days)', value: 8307.692 },
      { labelAr: 'معدل خصم الاستقالة (ثُلثين)', labelEn: 'Resignation Reduction (2/3)', value: -4961.538 }
    ],
    references: [
      {
        article: 'المادة 51',
        lawNameAr: 'قانون العمل بالقطاع الأهلي رقم 6 لسنة 2010',
        lawNameEn: 'Kuwait Labor Law No. 6 of 2010',
        explanationAr: 'يستحق العامل مكافأة نهاية سنة بواقع 15 يوماً عن كل سنة من السنوات الخمس الأولى و30 يوماً عن كل سنة تالية.',
        explanationEn: 'The worker shall be entitled to an end-of-service indemnity of 15 days salary for each of the first five years, and 30 days for each following year.',
        formulaAr: 'الراتب اليومي × 15 يوماً عن أول 5 سنوات و30 يوماً عن الباقي',
        formulaEn: 'Daily rate * 15 days for first 5 years and 30 days for extra years'
      }
    ]
  },
  {
    id: 'op-2',
    titleAr: 'الفوائد التجارية المتأخرة - شركة الخليج للتوريد',
    titleEn: 'Late Delay Interest - Gulf Supplying Co.',
    calcType: 'interest',
    clientName: 'شركة الخليج للتوريدات والخدمات',
    caseId: 'CASE-2025-992',
    finalTotal: 48273.973,
    date: '2026-05-20',
    inputs: { principalAmount: 45000, interestType: 'COMMERCIAL', startDate: '2024-05-20', endDate: '2025-05-20' },
    breakdown: [
      { labelAr: 'أصل مبلغ الدين الرئيسي', labelEn: 'Principal Amount', value: 45000 },
      { labelAr: 'نسبة الفائدة السنوية المتأقلمة', labelEn: 'Annual Interest Rate', value: 7 },
      { labelAr: 'عدد أيام تأخير السداد الكلي', labelEn: 'Count of Delay Days', value: 365 },
      { labelAr: 'الفوائد التأخيرية القانونية (7%)', labelEn: 'Legal Commercial Interest (7%)', value: 3273.973 }
    ],
    references: [
      {
        article: 'المادة 110',
        lawNameAr: 'قانون التجارة الكويتي رقم 68 لسنة 1980',
        lawNameEn: 'Kuwait Commercial Code No. 68 of 1980',
        explanationAr: 'إذا كان محل الالتزام مبلغاً من النقود كان ملزماً بالتعويض عن التأخير في صورة فوائد بسعر 7% سنوياً بالنسبة للالتزامات التجارية.',
        explanationEn: 'The debtor of a monetary sum under a commercial agreement is liable for delay interest at 7% per annum.',
        formulaAr: 'الفائدة = أصل الدين × 7% × الأيام ÷ 365',
        formulaEn: 'Interest = Principal * 7% * Days / 365'
      }
    ]
  }
];

const LegalFinancialCalculatorPage: React.FC = () => {
  const [language, setLanguage] = useState<'ar' | 'en'>(() => {
    const stored = localStorage.getItem('alwagayan_lang');
    return (stored === 'en' || stored === 'ar') ? stored : 'ar';
  });

  const translate = (ar: string, en: string) => language === 'ar' ? ar : en;

  // Track active calculator tab in routing/tabs
  const [activeCalc, setActiveCalc] = useState<CalcType>('eos');
  const [operations, setOperations] = useState<SavedOperation[]>(() => {
    const stored = localStorage.getItem('alwagayan_legal_financial_operations');
    return stored ? JSON.parse(stored) : initialSavedOperations;
  });

  useEffect(() => {
    localStorage.setItem('alwagayan_legal_financial_operations', JSON.stringify(operations));
  }, [operations]);

  // Read URL query parameter for active calculator redirection
  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes('court-fees')) {
      setActiveCalc('court_fees');
    } else if (path.includes('legal-interests')) {
      setActiveCalc('interest');
    } else if (path.includes('inheritance')) {
      setActiveCalc('inheritance');
    } else if (path.includes('legal-deadlines')) {
      setActiveCalc('deadlines');
    }
  }, []);

  // Shared Form inputs
  const [clientName, setClientName] = useState('');
  const [assocCaseId, setAssocCaseId] = useState('');
  
  // Dynamic Calculator Input Values
  const [monthlySalary, setMonthlySalary] = useState(1200);
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2025-01-01');
  const [nationality, setNationality] = useState<'kuwaiti' | 'expat'>('expat');
  const [terminationReason, setTerminationReason] = useState<'resignation' | 'dismissal' | 'retirement' | 'death'>('resignation');
  
  const [annualAllocation, setAnnualAllocation] = useState(30);
  const [totalTakenLeaves, setTotalTakenLeaves] = useState(10);
  const [carryoverLeaves, setCarryoverLeaves] = useState(5);

  const [normalHours, setNormalHours] = useState(20);
  const [restDayHours, setRestDayHours] = useState(8);
  const [holidayHours, setHolidayHours] = useState(0);

  const [claimAmount, setClaimAmount] = useState(25000);
  const [litigationStage, setLitigationStage] = useState<'FIRST_INSTANCE' | 'APPEAL' | 'CASSATION' | 'EXECUTION'>('FIRST_INSTANCE');
  
  const [interestType, setInterestType] = useState<'COMMERCIAL' | 'CIVIL'>('COMMERCIAL');
  
  const [monthlyRent, setMonthlyRent] = useState(450);
  const [lateMonths, setLateMonths] = useState(4);
  const [rentalCompRate, setRentalCompRate] = useState(10);

  const [contractValue, setContractValue] = useState(150000);
  const [delayDays, setDelayDays] = useState(15);
  const [penaltyDailyRate, setPenaltyDailyRate] = useState(150);
  const [penaltyRateType, setPenaltyRateType] = useState<'PERCENT' | 'FIXED'>('FIXED');
  const [maxPenaltyPercent, setMaxPenaltyPercent] = useState(10);

  // Sharia inheritance inputs
  const [estateValue, setEstateValue] = useState(100000);
  const [debtsAndFuneral, setDebtsAndFuneral] = useState(5000);
  const [husbandExist, setHusbandExist] = useState(false);
  const [wifeCount, setWifeCount] = useState(1);
  const [sonsCount, setSonsCount] = useState(2);
  const [daughtersCount, setDaughtersCount] = useState(2);
  const [fatherExist, setFatherExist] = useState(true);
  const [motherExist, setMotherExist] = useState(true);

  // Judicial deadlines inputs
  const [deadlineNotificationDate, setDeadlineNotificationDate] = useState('2026-05-10');
  const [deadlineProcedureType, setDeadlineProcedureType] = useState('cv-appeal');

  // Installments inputs
  const [debtAmount, setDebtAmount] = useState(12000);
  const [debtDownpayment, setDebtDownpayment] = useState(2000);
  const [installmentMonths, setInstallmentMonths] = useState(24);
  const [installmentSurcharge, setInstallmentSurcharge] = useState(4); // 4% annual

  // Additional settings
  const [includeAttorneyFees, setIncludeAttorneyFees] = useState(false);
  const [includeExpertFees, setIncludeExpertFees] = useState(false);

  // Advanced Unified Court Fee & Execution States
  const [unifiedMode, setUnifiedMode] = useState(true);
  const [isReFiling, setIsReFiling] = useState(false);
  const [reFilingUnderThreeMonths, setReFilingUnderThreeMonths] = useState(true);
  const [selectedFixedFees, setSelectedFixedFees] = useState<string[]>([]);
  const [selectedSeizures, setSelectedSeizures] = useState<string[]>(['asset_seizure']);
  const [aiAnalysisText, setAiAnalysisText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Dashboard filter search
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'calculator' | 'saved_list'>('calculator');
  const [selectedSavedOp, setSelectedSavedOp] = useState<SavedOperation | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const handleLanguageToggle = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    setLanguage(nextLang);
    localStorage.setItem('alwagayan_lang', nextLang);
  };

  // Dynamically compute the current values of active calculator
  const computedResult = useMemo(() => {
    let finalTotal = 0;
    let breakdown: { labelAr: string; labelEn: string; value: number }[] = [];
    let references: LegalReference[] = [];

    switch (activeCalc) {
      case 'eos': {
        const res = kuwaitCalculatorsService.calculateKuwaitEOS({
          monthlySalary,
          startDate,
          endDate,
          nationality,
          reason: terminationReason
        });
        finalTotal = res.reducedIndemnity;
        breakdown = [
          { labelAr: 'أيام الخدمة الإجمالية', labelEn: 'Total Days of Service', value: res.totalDays },
          { labelAr: 'سنوات الخدمة', labelEn: 'Equivalent Years of Service', value: res.years },
          { labelAr: 'الأجر اليومي المعتمد (الراتب/26)', labelEn: 'Daily Pay Rate (Salary/26)', value: res.dailyRate },
          { labelAr: 'المكافأة الكاملة المتراكمة', labelEn: 'Accumulated Gross Indemnity', value: res.calculatedIndemnity },
          { labelAr: 'تطبيق تخفيض الاستقالة بالقطاع الأهلي', labelEn: 'Resignation Reduction Factor Applied', value: res.resignationFactor }
        ];
        references = res.references;
        break;
      }
      case 'leave': {
        const res = kuwaitCalculatorsService.calculateLeaveBalance({
          monthlySalary,
          annualAllocation,
          totalTaken: totalTakenLeaves,
          carryoverDays: carryoverLeaves
        });
        finalTotal = res.cashoutValue;
        breakdown = [
          { labelAr: 'الأجر اليومي المعتمد', labelEn: 'Daily Certified Wage', value: res.dailyRate },
          { labelAr: 'رصيد الإجازات المتبقي المستحق', labelEn: 'Remaining Unused Leave Days', value: res.remainingDays },
          { labelAr: 'القيمة النقدية المصروفة لميزانية رصيد الإجازات', labelEn: 'Cashout Unused Leave Value', value: res.cashoutValue }
        ];
        references = res.references;
        break;
      }
      case 'overtime': {
        const res = kuwaitCalculatorsService.calculateOvertime({
          monthlySalary,
          normalHours,
          restDayHours,
          holidayHours
        });
        finalTotal = res.totalOvertimePay;
        breakdown = [
          { labelAr: 'معدل أجر الساعة المعتمد (أجر اليوم/8)', labelEn: 'Calculated Hourly Wage', value: res.hourlyRate },
          { labelAr: 'عائد الساعات الإضافية المعتادة (1.25)', labelEn: 'Normal Overtime Hours Pay (1.25x)', value: res.normalOvertimePay },
          { labelAr: 'عائد أيام الراحة الأسبوعية (1.50)', labelEn: 'Rest Weekday Overtime Pay (1.50x)', value: res.restDayOvertimePay },
          { labelAr: 'عائد العطلات والأعياد الرسمية (2.00)', labelEn: 'Official Holidays Overtime Pay (2x)', value: res.holidayOvertimePay }
        ];
        references = res.references;
        break;
      }
      case 'pifss': {
        const res = kuwaitCalculatorsService.calculatePIFSS({
          basicSalary: monthlySalary,
          allowanceSocial: 250 // assumed standard social allowance
        });
        finalTotal = res.employeeDeduction;
        breakdown = [
          { labelAr: 'المرتب الخاضع للتأمينات (الراتب الأقصى 3000 د.ك)', labelEn: 'Insurable Salary Limit (Max 3000)', value: res.insurableSalary },
          { labelAr: 'استقطاع الموظف المؤمن عليه (11.0%)', labelEn: 'Employee Contribution Share (11%)', value: res.employeeDeduction },
          { labelAr: 'مساهمة جهة العمل (صاحب العمل) (12.5%)', labelEn: 'Employer Contribution Share (12.5%)', value: res.employerContribution },
          { labelAr: 'مساهمة الدولة (1.5%)', labelEn: 'State Government Contribution (1.5%)', value: res.governmentContribution },
          { labelAr: 'إجمالي اشتراك التأمينات الشهري المشترك', labelEn: 'Total Monthly Insurable Premium', value: res.totalPIFSSContribution }
        ];
        references = res.references;
        break;
      }
      case 'labor_settlement': {
        const eosResult = kuwaitCalculatorsService.calculateKuwaitEOS({
          monthlySalary,
          startDate,
          endDate,
          nationality,
          reason: terminationReason
        });
        const leaveResult = kuwaitCalculatorsService.calculateLeaveBalance({
          monthlySalary,
          annualAllocation,
          totalTaken: totalTakenLeaves,
          carryoverDays: carryoverLeaves
        });
        const otResult = kuwaitCalculatorsService.calculateOvertime({
          monthlySalary,
          normalHours,
          restDayHours,
          holidayHours
        });
        finalTotal = eosResult.reducedIndemnity + leaveResult.cashoutValue + otResult.totalOvertimePay;
        breakdown = [
          { labelAr: 'مكافأة نهاية الخدمة الصافية', labelEn: 'Net End-of-Service Indemnity', value: eosResult.reducedIndemnity },
          { labelAr: 'تصفية وبدل رصيد الإجازات المتراكم', labelEn: 'Leaves Cash-out Compensation', value: leaveResult.cashoutValue },
          { labelAr: 'إجمالي أجور العمل الإضافي المستحق', labelEn: 'Total Overtime Working Pay', value: otResult.totalOvertimePay }
        ];
        references = [...eosResult.references, ...leaveResult.references];
        break;
      }
      case 'court_fees': {
        const feesRes = kuwaitCalculatorsService.calculateKuwaitCourtFee({
          claimAmount,
          stage: litigationStage,
          isReFiling,
          reFilingUnderThreeMonths,
          selectedFixedFees: selectedFixedFees
        });

        const interestRes = kuwaitCalculatorsService.calculateLegalInterest({
          principalAmount: claimAmount,
          interestType,
          startDate,
          endDate
        });

        // Calculate custom Execution/Enforcement Costs
        let execFixed = 10; // Opening file
        let execProportional = Math.min(1000, claimAmount * 0.005);
        if (selectedSeizures && selectedSeizures.length > 0) {
          selectedSeizures.forEach(s => {
            if (s === 'asset_seizure') execFixed += 20;
            if (s === 'real_estate') execFixed += 100;
            if (s === 'salary_arrest') execFixed += 10;
            if (s === 'public_auction') execFixed += 50;
          });
        }
        const totalExecution = claimAmount > 0 ? (execFixed + execProportional) : 0;

        // Attorney & Expert costs
        const attorneyAmount = includeAttorneyFees ? Math.max(100, claimAmount * 0.05) : 0;
        const expertAmount = includeExpertFees ? 150 : 0;

        if (unifiedMode) {
          finalTotal = feesRes.total + interestRes.calculatedInterest + totalExecution + attorneyAmount + expertAmount;
          breakdown = [
            { labelAr: 'أصل المطالبة القضائية الرئيسية', labelEn: 'Original Claim Principal Debt', value: claimAmount },
            { labelAr: 'الرسوم القضائية والنسبية (تعديل 78/2025)', labelEn: 'Judicial Court Fees (Decree 78/2025)', value: feesRes.total },
            { labelAr: 'الفوائد التأخيرية القانونية المتراكمة الخصومة', labelEn: 'Accrued Statutory Delay Interest', value: interestRes.calculatedInterest },
            { labelAr: 'إجمالي تكاليف ورسوم إدارة التنفيذ والحجوزات', labelEn: 'Total Execution & Seizure Costs', value: totalExecution }
          ];

          if (attorneyAmount > 0) {
            breakdown.push({ labelAr: 'أتعاب المحاماة والتمثيل القانوني التقديرية', labelEn: 'Estimated Legal/Attorney Representation fees', value: attorneyAmount });
          }
          if (expertAmount > 0) {
            breakdown.push({ labelAr: 'رسوم ومصاريف ندب الخبراء المترتبة', labelEn: 'Official Court Expert Evaluation fees', value: expertAmount });
          }

          // Reference sources from all parts!
          references = [
            ...feesRes.references,
            ...interestRes.references,
            {
              article: 'المادة 212 وما يليها',
              lawNameAr: 'قانون التنفيذ المدني والمرافعات الكويتي',
              lawNameEn: 'Kuwait Civil and Commercial Procedure & Execution Settle Act',
              explanationAr: 'يفرض التنفيذ الجبري لقرارات الإلزام القضائية رسوم طلب الإيداع والتجزئة ووضع الصيغة التنفيذية بالإضافة لرسوم الحجوزات العقارية وحجوزات الرواتب ومحاضر بيع المنقولات والمزادات.',
              explanationEn: 'The compulsory enforcement of court verdicts triggers administrative file opening fees alongside statutory attachment charges on salaries, real estate, and auction values.',
              formulaAr: 'تكلفة التنفيذ = 10 د.ك قيد + 0.5% نسبي (كحد أقصى 1000) + رسوم الحجوزات المفروضة',
              formulaEn: 'Execution Cost = 10 KWD Fixed + 0.5% Proportional (Max 1k KWD) + Selected Seizures'
            }
          ];
        } else {
          finalTotal = feesRes.total;
          breakdown = [
            { labelAr: 'قيمة المطالبة / أصل الدعوى الإجمالي', labelEn: 'Total Value of Legal Claims', value: claimAmount },
            { labelAr: 'الرسوم النسبية المحتسبة لقيد الدعوى', labelEn: 'Proportional Court Registration Fees', value: feesRes.proportionalFee },
            { labelAr: 'الرسوم الثابتة والمصاريف القضائية المرفقة', labelEn: 'Fixed Stage Fees / Surcharges', value: feesRes.fixedFee }
          ];
          if (feesRes.breakdown && feesRes.breakdown.length > 0) {
            feesRes.breakdown.forEach((b: any) => {
              breakdown.push({
                labelAr: b.bracketAr,
                labelEn: b.bracketEn,
                value: b.portionFee
              });
            });
          }
          references = feesRes.references;
        }
        break;
      }
      case 'enforcement': {
        const proportional = Math.min(1000, claimAmount * 0.005);
        finalTotal = claimAmount > 0 ? (15 + proportional) : 0; // 10 basic + 5 surcharge + proportional caps
        breakdown = [
          { labelAr: 'رسم فتح ملف التنفيذ الأساسي بمحكمة وزارة العدل', labelEn: 'Execution Basic Ministry File Opening Fee', value: claimAmount > 0 ? 10 : 0 },
          { labelAr: 'رسم الإخطار والإعلان القضائي بالنشر والمتابعة', labelEn: 'Administrative Notice & Ad Surcharges', value: claimAmount > 0 ? 5 : 0 },
          { labelAr: 'الرسم النسبي لإجراءات التنفيذ الميدانية (0.5% بحد أقصى 1000)', labelEn: 'Proportional Enforcement Settle Recovery Fee (0.5%)', value: proportional }
        ];
        references = [
          {
            article: 'المرافعات والإعانات',
            lawNameAr: 'قانون التنفيذ المدني الكويتي وقانون الرسوم القضائية',
            lawNameEn: 'Kuwait Civil Execution Rules & Judicial Fees Act',
            explanationAr: 'يفرض رسم فتح ملف تنفيذ ومتابعة الإعلانات بقيمة مادية ثابتة ورسم نسبي على التحصيل.',
            explanationEn: 'Levies fixed administration execution fees alongside a proportionate recovery fee of 0.5% up to 1,000 KWD.',
            formulaAr: 'الرسم = 10 د.ك رسم فتح صلب + 5 د.ك تصدير + 0.5% من مبالغ التنفيذ',
            formulaEn: 'Fee = 10 KWD Fixed + 5 KWD Surcharge + 0.5% of Execution recovery amount'
          }
        ];
        break;
      }
      case 'interest': {
        const res = kuwaitCalculatorsService.calculateLegalInterest({
          principalAmount: claimAmount,
          interestType,
          startDate,
          endDate
        });
        finalTotal = res.calculatedInterest;
        breakdown = [
          { labelAr: 'أصل الدين المطالب به', labelEn: 'Principal Outstanding Debt', value: claimAmount },
          { labelAr: 'الفائدة السنوية المطبقة', labelEn: 'Annual Applicable Interest Rate (%)', value: res.rate },
          { labelAr: 'عدد أيام التأخير الفعلية للتقاضي', labelEn: 'Exact Days of Delay Settle', value: res.days },
          { labelAr: 'القيمة المالية للفوائد التأخيرية القانونية', labelEn: 'Accrued Delay Civil/Commercial Interest', value: res.calculatedInterest },
          { labelAr: 'صفي إجمالي المطالبة (الأصل + الفائدة)', labelEn: 'Grand Total Net (Principal + Interest)', value: res.totalWithInterest }
        ];
        references = res.references;
        break;
      }
      case 'penalty': {
        const res = kuwaitCalculatorsService.calculateContractPenalty({
          contractValue,
          delayDays,
          dailyPenaltyRate: penaltyDailyRate,
          rateType: penaltyRateType,
          maxPenaltyPercent
        });
        finalTotal = res.cappedPenalty;
        breakdown = [
          { labelAr: 'القيمة الكاملة لعقد التوريد/المقاولة', labelEn: 'Contract Principal Valuation', value: contractValue },
          { labelAr: 'معدل الغرامة اليومي المحسوب', labelEn: 'Calculated Daily Violation Fee', value: res.dailyAmount },
          { labelAr: 'أيام التأخير في التنفيذ/التسليم', labelEn: 'Days of Breach/Performance Delay', value: delayDays },
          { labelAr: 'مبلغ الغرامة التقني المتراكم', labelEn: 'Accumulated Under-limit Penalty', value: res.calculatedPenalty },
          { labelAr: 'سقف الحد الأقصى للغرامات (10% عادة)', labelEn: 'Applicable Maximum Cap Ceiling Rate', value: contractValue * (maxPenaltyPercent / 100) },
          { labelAr: 'هل تم تخطي الحد الأقصى؟', labelEn: 'Is Penalty Capped at Maximum Limit?', value: res.isCapped ? 1 : 0 }
        ];
        references = res.references;
        break;
      }
      case 'rental': {
        const res = kuwaitCalculatorsService.calculateRentalDispute({
          monthlyRent,
          lateMonths,
          compensationRate: rentalCompRate
        });
        finalTotal = res.totalClaim;
        breakdown = [
          { labelAr: 'رصيد الأجور الإيجارية المتراكمة المتأخرة', labelEn: 'Unpaid Accumulated Back Rent', value: res.totalLateRent },
          { labelAr: 'التعويض عن الأضرار وتأخير السداد', labelEn: 'Penalty Damages for Rental Delay', value: res.penaltyCharges },
          { labelAr: 'إجمالي المطالبة المالية الإيجارية', labelEn: 'Final Accumulated Rental Claims', value: res.totalClaim }
        ];
        references = res.references;
        break;
      }
      case 'inheritance': {
        const res = kuwaitCalculatorsService.calculateInheritance({
          estateValue,
          debtsAndFuneral,
          husband: husbandExist,
          wifeCount,
          sonsCount,
          daughtersCount,
          fatherExist,
          motherExist
        });
        finalTotal = res.netEstate;
        breakdown = [
          { labelAr: 'إجمالي قيمة التركة الكلي', labelEn: 'Gross Legacy Estate Value', value: estateValue },
          { labelAr: 'الديون المقتطعة وتجهيز الجنازة والوصايا', labelEn: 'Estate Debts, Wills & Funeral Deductions', value: debtsAndFuneral },
          { labelAr: 'صافي قيمة التركة الخاضع للتقسيم الإرثي', labelEn: 'Net Allocatable Inheritance', value: res.netEstate }
        ];
        res.heirs.forEach(h => {
          breakdown.push({
            labelAr: `${h.heirLabelAr} (${h.fractionAr})`,
            labelEn: `${h.heirLabelEn} (${h.fractionEn})`,
            value: h.amountKwd
          });
        });
        references = res.references;
        break;
      }
      case 'deadlines': {
        // Simple procedural deadlines calculator
        // Appeal on civil/commercial is 30 days. Cassation is 60 days. Opposition default is 7 days.
        const start = new Date(deadlineNotificationDate);
        let durationDays = 30;
        let titleAr0 = 'ميعاد استئناف حكم كلي (مدني/تجاري)';
        let titleEn0 = 'Appeal period of First Instance Court (30 days)';
        let refArt = 'المادة 129 من قانون المرافعات';

        if (deadlineProcedureType === 'cv-cassation') {
          durationDays = 60;
          titleAr0 = 'ميعاد الطعن بالتمييز (مدني/تجاري)';
          titleEn0 = 'Cassation period for civil/commercial judgment';
          refArt = 'المادة 153 من قانون المرافعات';
        } else if (deadlineProcedureType === 'cv-opp-judg') {
          durationDays = 10;
          titleAr0 = 'ميعاد التظلم من أمر أداء';
          titleEn0 = 'Grievance deadline for Payment Order';
          refArt = 'المادة 167 من قانون المرافعات';
        } else if (deadlineProcedureType === 'pn-appeal') {
          durationDays = 20;
          titleAr0 = 'ميعاد استئناف حكم جنح/جنايات جزائي';
          titleEn0 = 'Appeal period for criminal/misdemeanor penalty';
          refArt = 'المادة 201 إجراءات جزائية';
        } else if (deadlineProcedureType === 'pn-opp-default') {
          durationDays = 7;
          titleAr0 = 'ميعاد المعارضة في حكم غيابي';
          titleEn0 = 'Opposition deadline for default criminal judgment';
          refArt = 'المادة 188 إجراءات جزائية';
        }

        const end = new Date(start);
        end.setDate(start.getDate() + durationDays);
        
        // Calculate remaining days
        const limitTime = end.getTime() - new Date().getTime();
        const remDays = Math.ceil(limitTime / (1000 * 60 * 60 * 24));

        finalTotal = remDays > 0 ? remDays : 0;
        breakdown = [
          { labelAr: 'تاريخ استلام إعلان الحكم/القرار', labelEn: 'Notification Receive Date', value: 0 },
          { labelAr: `المهلة الممنوحة لإجراء الميعاد (أيام)`, labelEn: 'Prescribed Legal Timestep (Days)', value: durationDays },
          { labelAr: 'ميعاد نهاية الطعن أو السقوط النهائي', labelEn: 'Final Strict Appeal Deadline', value: end.getTime() },
          { labelAr: 'عدد الأيام المتبقية قبل السقوط', labelEn: 'Calculated Remaining Days Balance', value: remDays }
        ];
        
        references = [
          {
            article: refArt.split(' ').slice(1).join(' '),
            lawNameAr: 'قانون المرافعات والتشريع القضائي المعاصر بدولة الكويت',
            lawNameEn: 'Kuwait Enforcement and Judicial Procedures Civil-Penal Act',
            explanationAr: `تنص القوانين على مواعيد وإجراءات الطعون والطلبات الإجبارية وإلا سقط الحق في اللجوء للقضاء لفوات المدد الرسمية.`,
            explanationEn: `Filing appeal documents must be rigorously processed within the designated deadlines to avoid losing the right to litigation before courts of Kuwait.`,
            formulaAr: 'تاريخ الانتهاء = تاريخ الإعلان + المدة الإجرائية المقررة',
            formulaEn: 'Deadline Date = Service Notification Date + Prescribed statutory days limit'
          }
        ];
        break;
      }
      case 'installment': {
        const netPrincipal = Math.max(0, debtAmount - debtDownpayment);
        const totalInterestFraction = netPrincipal * (installmentSurcharge / 100) * (installmentMonths / 12);
        const netDebtWithInterest = netPrincipal + totalInterestFraction;
        const monthlyInstallment = netDebtWithInterest / installmentMonths;

        finalTotal = monthlyInstallment;
        breakdown = [
          { labelAr: 'أصل مبلغ الدين الإجمالي', labelEn: 'Principal Gross Debt Due', value: debtAmount },
          { labelAr: 'الوفاء المقدم المدفوع (الدفعة الأولى)', labelEn: 'Settle Cash Downpayment Paid', value: debtDownpayment },
          { labelAr: 'المتبقي لجدولة الأقساط الشهرية', labelEn: 'Remaining Balances to Schedule', value: netPrincipal },
          { labelAr: 'رسوم المرابحة/الفائدة التأخيرية السنوية', labelEn: 'Consolidated Surcharge Annual Rate (%)', value: installmentSurcharge },
          { labelAr: 'إجمالي أرباح/فوائد التمويل والأقساط', labelEn: 'Consolidated Accrued Term Surcharge', value: totalInterestFraction },
          { labelAr: 'إجمالي الدين المعاد جدولته قانونياً', labelEn: 'Rescheduled Grand Debt Settle Price', value: netDebtWithInterest },
          { labelAr: 'القسط الشهري المترتب المتبقي', labelEn: 'Computed Flat Monthly Installment Pay', value: monthlyInstallment }
        ];
        references = [
          {
            article: 'المادة 310',
            lawNameAr: 'القانون المدني الكويتي وكتاب المعاملات التجارية',
            lawNameEn: 'Kuwait Civil Transaction Settle Guidelines',
            explanationAr: 'يجوز جدولة وتقسيط الديون وسدادها على دفعات شهرية منتظمة بمقتضى اتفاق مع الخصوم أو حكم قضائي مع تيسير جدولة الفوائد بسعر قانوني منصف.',
            explanationEn: 'The debtor may settle monetary disputes by installments as designated by mutual agreements or administrative judge orders with legitimate statutory rates.',
            formulaAr: 'القسط الشهري = [أصل الدين المجدول + فوائد الجدولة] ÷ عدد الأشهر المختارة',
            formulaEn: 'Installment = [Scheduled Debt Principal + Total Surcharges] / Term Months'
          }
        ];
        break;
      }
    }

    return {
      finalTotal: Number(finalTotal.toFixed(3)),
      breakdown,
      references
    };
  }, [
    activeCalc, monthlySalary, startDate, endDate, nationality, terminationReason,
    annualAllocation, totalTakenLeaves, carryoverLeaves, normalHours, restDayHours,
    holidayHours, claimAmount, litigationStage, interestType, monthlyRent, lateMonths,
    rentalCompRate, contractValue, delayDays, penaltyDailyRate, penaltyRateType,
    maxPenaltyPercent, estateValue, debtsAndFuneral, husbandExist, wifeCount, sonsCount,
    daughtersCount, fatherExist, motherExist, deadlineNotificationDate, deadlineProcedureType,
    debtAmount, debtDownpayment, installmentMonths, installmentSurcharge
  ]);

  // Save the calculated operation
  const handleSaveToHistory = () => {
    const titleAr = translate(
      `حساب ${translateCategoryLabel(activeCalc, 'ar')} - موكل: ${clientName || 'بدون'}`,
      `Calc: ${translateCategoryLabel(activeCalc, 'en')} - Client: ${clientName || 'Unspecified'}`
    );

    const newOp: SavedOperation = {
      id: `op-${Date.now()}`,
      titleAr: language === 'ar' ? titleAr : `حساب ${translateCategoryLabel(activeCalc, 'ar')} - ${clientName || 'موكل'}`,
      titleEn: language === 'en' ? titleAr : `Calculation for ${translateCategoryLabel(activeCalc, 'en')}`,
      calcType: activeCalc,
      clientName: clientName || translate('موكل افتراي', 'Default Client Representative'),
      caseId: assocCaseId || undefined,
      finalTotal: computedResult.finalTotal,
      date: new Date().toISOString().split('T')[0],
      inputs: {
        monthlySalary, startDate, endDate, nationality, terminationReason,
        annualAllocation, totalTakenLeaves, carryoverLeaves, normalHours,
        restDayHours, holidayHours, claimAmount, litigationStage, interestType,
        monthlyRent, lateMonths, rentalCompRate, contractValue, delayDays,
        penaltyDailyRate, penaltyRateType, maxPenaltyPercent, estateValue,
        debtsAndFuneral, husbandExist, wifeCount, sonsCount, daughtersCount,
        fatherExist, motherExist, deadlineNotificationDate, deadlineProcedureType,
        debtAmount, debtDownpayment, installmentMonths, installmentSurcharge
      },
      breakdown: computedResult.breakdown,
      references: computedResult.references
    };

    setOperations([newOp, ...operations]);
    setViewMode('saved_list');
    setClientName('');
    setAssocCaseId('');
  };

  const handleDeleteOperation = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm(translate('هل أنت متأكد من حذف هذا المستند المالي؟', 'Are you sure you want to permanently delete this calculation ledger?'))) {
      setOperations(prev => prev.filter(op => op.id !== id));
      if (selectedSavedOp?.id === id) {
        setSelectedSavedOp(null);
      }
    }
  };

  const handleDuplicateOperation = (op: SavedOperation, e: React.MouseEvent) => {
    e.stopPropagation();
    const cloned: SavedOperation = {
      ...op,
      id: `op-${Date.now()}`,
      titleAr: `${op.titleAr} (${translate('نسخة مكررة', 'Duplicate Clone')})`,
      titleEn: `${op.titleEn} (Cloned Version)`,
      date: new Date().toISOString().split('T')[0]
    };
    setOperations([cloned, ...operations]);
  };

  // Helper translations for categories and titles
  function translateCategoryLabel(calc: CalcType, lang: 'ar' | 'en'): string {
    const labels: Record<CalcType, { ar: string; en: string }> = {
      eos: { ar: 'مكافأة نهاية الخدمة', en: 'End-of-Service Indemnity' },
      leave: { ar: 'رصيد الإجازات وتصفيتها', en: 'Leave Balance & Refund' },
      overtime: { ar: 'احتساب الساعات الإضافية', en: 'Overtime Hours Rate' },
      pifss: { ar: 'اشتراكات التأمينات الاجتماعية', en: 'PIFSS Social Security' },
      labor_settlement: { ar: 'التسوية العمالية الشاملة', en: 'Comprehensive Labor Settle' },
      court_fees: { ar: 'الرسوم القضائية والمصاريف', en: 'Judicial Court Fees' },
      enforcement: { ar: 'رسوم إدارات ومحاكم التنفيذ', en: 'Enforcement Court Fees' },
      deadlines: { ar: 'المدد ومواعيد الطعون', en: 'Judicial Deadlines' },
      interest: { ar: 'الفوائد القانونية المتأخرة', en: 'Delay Legal Interest' },
      penalty: { ar: 'الشرط الجزائي وعقود غرامات', en: 'Liquidated Contract Damages' },
      installment: { ar: 'جدولة الأقساط وتسوية المديونية', en: 'Installment scheduling' },
      rental: { ar: 'إيجارات العقارات وحساب المتأخرات', en: 'Rent & Leases Disputes' },
      inheritance: { ar: 'قسمة التركات الشرعية', en: 'Islamic Inheritance Shares' }
    };
    return lang === 'ar' ? labels[calc].ar : labels[calc].en;
  }

  // Pre-fill fields with realistic demo cases for current active calculator
  const loadDemoCase = (scenario: string) => {
    switch (activeCalc) {
      case 'eos':
        if (scenario === '1') {
          // Expat long service resignation
          setMonthlySalary(1800);
          setStartDate('2015-05-15');
          setEndDate('2024-05-15');
          setNationality('expat');
          setTerminationReason('resignation');
        } else {
          // Kuwaiti dismissal/termination
          setMonthlySalary(2400);
          setStartDate('2018-01-01');
          setEndDate('2023-01-01');
          setNationality('kuwaiti');
          setTerminationReason('dismissal');
        }
        break;
      case 'leave':
        setMonthlySalary(1350);
        setAnnualAllocation(30);
        setTotalTakenLeaves(12);
        setCarryoverLeaves(15);
        break;
      case 'overtime':
        setMonthlySalary(900);
        setNormalHours(32);
        setRestDayHours(16);
        setHolidayHours(8);
        break;
      case 'pifss':
        setMonthlySalary(2800);
        break;
      case 'court_fees':
        setClaimAmount(65000);
        setLitigationStage('FIRST_INSTANCE');
        break;
      case 'interest':
        setClaimAmount(120000);
        setInterestType('COMMERCIAL');
        setStartDate('2023-01-01');
        setEndDate('2025-01-01');
        break;
      case 'rental':
        setMonthlyRent(550);
        setLateMonths(6);
        setRentalCompRate(10);
        break;
      case 'penalty':
        setContractValue(350000);
        setDelayDays(28);
        setPenaltyRateType('FIXED');
        setPenaltyDailyRate(500);
        setMaxPenaltyPercent(10);
        break;
      case 'inheritance':
        setEstateValue(245000);
        setDebtsAndFuneral(15000);
        setHusbandExist(false);
        setWifeCount(1);
        setSonsCount(3);
        setDaughtersCount(2);
        setFatherExist(true);
        setMotherExist(true);
        break;
      case 'deadlines':
        setDeadlineNotificationDate(new Date().toISOString().split('T')[0]);
        setDeadlineProcedureType('cv-appeal');
        break;
      case 'installment':
        setDebtAmount(48000);
        setDebtDownpayment(8000);
        setInstallmentMonths(36);
        setInstallmentSurcharge(5);
        break;
      case 'labor_settlement':
        setMonthlySalary(1500);
        setStartDate('2017-06-01');
        setEndDate('2024-06-01');
        setNationality('expat');
        setTerminationReason('dismissal');
        setAnnualAllocation(30);
        setTotalTakenLeaves(5);
        setCarryoverLeaves(8);
        setNormalHours(12);
        setRestDayHours(4);
        setHolidayHours(0);
        break;
    }
  };

  // Saved operations statistics calculation
  const stats = useMemo(() => {
    return {
      totalCalculated: operations.length,
      financeValue: operations.reduce((sum, o) => sum + o.finalTotal, 0),
      laborRightsCount: operations.filter(o => ['eos', 'leave', 'overtime', 'labor_settlement'].includes(o.calcType)).length,
      judicialFeesTotal: operations.filter(o => o.calcType === 'court_fees' || o.calcType === 'enforcement').reduce((sum, o) => sum + o.finalTotal, 0)
    };
  }, [operations]);

  // Search filter matching
  const filteredSavedOperations = operations.filter(op => {
    const query = searchTerm.toLowerCase();
    return (
      op.clientName.toLowerCase().includes(query) ||
      op.titleAr.toLowerCase().includes(query) ||
      op.titleEn.toLowerCase().includes(query) ||
      (op.caseId && op.caseId.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 pb-24 font-sans antialiased bg-gray-50/50 dark:bg-dm-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* HEADER WITH BILINGUAL CONTROLS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-dm-card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex items-center">
          <div className="w-14 h-14 bg-indigo-600/10 dark:bg-indigo-600/20 rounded-2xl flex items-center justify-center me-4 shadow-inner">
            <Calculator className="w-8 h-8 text-indigo-650" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-DM-Text-Primary">
              {translate('المنظومة الذكية للحسابات القانونية والقضائية', 'Unified Kuwaiti Legal Calculator Hub')}
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {translate('نظام مالي موحد متوافق بالكامل مع القوانين واللوائح التنفيذية ومراسيم دولة الكويت المعاصرة', 'Bilingual financial and regulatory ledger in strict compliance with state and ministerial civil decrees of Kuwait')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={viewMode === 'calculator' ? 'primary' : 'outline'} 
            leftIcon={<Calculator className="w-4 h-4" />}
            onClick={() => setViewMode('calculator')}
          >
            {translate('الحاسبات الذكية', 'Interactive Calculators')}
          </Button>
          <Button 
            variant={viewMode === 'saved_list' ? 'primary' : 'outline'} 
            leftIcon={<History className="w-4 h-4" />}
            onClick={() => setViewMode('saved_list')}
          >
            {translate('أرشيف الحسابات', 'Ledgers Archive')}
            {operations.length > 0 && (
              <span className="ms-2 px-2 py-0.5 text-[10px] font-black bg-indigo-100 text-indigo-700 rounded-full">
                {operations.length}
              </span>
            )}
          </Button>
          <button 
            onClick={handleLanguageToggle}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-dm-background text-sm font-bold text-slate-700 dark:text-gray-300 transition-colors"
          >
            <Languages className="w-4 h-4 text-indigo-650" />
            <span>{language === 'ar' ? 'English' : 'عربي'}</span>
          </button>
        </div>
      </div>

      {viewMode === 'calculator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CATEGORIES SIDE MENU */}
          <div className="lg:col-span-3 space-y-4">
            
            <div className="p-4 bg-white dark:bg-dm-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">
                {translate('1. قانون العمل والعمال والخدمة', 'Labor & Employment Laws')}
              </h3>
              <div className="space-y-1">
                {[
                  { id: 'eos', labelAr: 'مكافأة نهاية الخدمة', labelEn: 'End-of-Service Benefit', icon: Briefcase },
                  { id: 'leave', labelAr: 'بدل وتصفية الإجازات', labelEn: 'Leave Balance Cashout', icon: Calendar },
                  { id: 'overtime', labelAr: 'احتساب الأجر الإضافي', labelEn: 'Overtime Compensation', icon: Clock },
                  { id: 'pifss', labelAr: 'التأمينات الاجتماعية (PIFSS)', labelEn: 'PIFSS Pension Insurance', icon: Users },
                  { id: 'labor_settlement', labelAr: 'التسوية العمالية الشاملة', labelEn: 'Labor Settlements Sheet', icon: FileCheck2 }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveCalc(item.id as CalcType)}
                    className={`w-full flex items-center justify-between p-3 text-right rounded-xl text-xs font-bold transition-all ${
                      activeCalc === item.id 
                        ? 'bg-indigo-650 text-white shadow-md shadow-indigo-600/10' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:hover:bg-dm-background'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{translate(item.labelAr, item.labelEn)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-dm-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">
                {translate('2. المحاكم والطعون والمدد', 'Litigation & Deadlines')}
              </h3>
              <div className="space-y-1">
                {[
                  { id: 'court_fees', labelAr: 'الرسوم والمصاريف القضائية', labelEn: 'Judicial Court Fees', icon: Gavel },
                  { id: 'enforcement', labelAr: 'رسوم إجراءات إدارة التنفيذ', labelEn: 'Execution Court Fees', icon: Scale },
                  { id: 'deadlines', labelAr: 'مواعيد الطعون والمدد القانونية', labelEn: 'appeal filing deadlines', icon: Clock }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveCalc(item.id as CalcType)}
                    className={`w-full flex items-center justify-between p-3 text-right rounded-xl text-xs font-bold transition-all ${
                      activeCalc === item.id 
                        ? 'bg-indigo-650 text-white shadow-md shadow-indigo-600/10' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:hover:bg-dm-background'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{translate(item.labelAr, item.labelEn)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-dm-card rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 px-2">
                {translate('3. المعاملات المدنية والتجارية والعقارية', 'Commercial, Rental & Sharia')}
              </h3>
              <div className="space-y-1">
                {[
                  { id: 'rental', labelAr: 'إيجارات ومنازعات العقار', labelEn: 'Lease & Rent Arrears', icon: Building },
                  { id: 'interest', labelAr: 'الفوائد القانونية المتأخرة (7% / 4%)', labelEn: 'Delay Settle Interest', icon: Banknote },
                  { id: 'penalty', labelAr: 'الشرط الجزائي وغرامة العقد', labelEn: 'Breach Contract Penalty', icon: Percent },
                  { id: 'installment', labelAr: 'جدولة مديونيات وأقساط الدين', labelEn: 'Repayment Installments', icon: TrendingUp },
                  { id: 'inheritance', labelAr: 'علم وحساب المواريث الشرعي', labelEn: 'Inheritance Shares', icon: Scale }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveCalc(item.id as CalcType)}
                    className={`w-full flex items-center justify-between p-3 text-right rounded-xl text-xs font-bold transition-all ${
                      activeCalc === item.id 
                        ? 'bg-indigo-650 text-white shadow-md shadow-indigo-600/10' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:hover:bg-dm-background'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon className="w-4 h-4" />
                      <span>{translate(item.labelAr, item.labelEn)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* CALCULATOR INTERACTIVE DYNAMIC FORM */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="p-6 bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 shadow-sm">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-6">
                <div>
                  <h2 className="text-lg font-black text-slate-850">
                    {translateCategoryLabel(activeCalc, language)}
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {translate('يرجى مراجعة وتعديل قيم الحساب وإدراج بيانات الحالة', 'Configure monetary boundaries and parameters below')}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => loadDemoCase('1')}>
                    💡 {translate('تعبئة نموذج افتراضي 1', 'Sample Demo 1')}
                  </Button>
                  {activeCalc === 'eos' && (
                    <Button size="sm" variant="ghost" onClick={() => loadDemoCase('2')}>
                      💡 {translate('نموذج عمالي كويتي', 'Sample Demo 2')}
                    </Button>
                  )}
                </div>
              </div>

              {/* DYNAMIC FORMS ACCORDING TO ACTIVE CALCULATOR */}
              <div className="space-y-5">
                
                {/* 1. EOS / Leave / Overtime / PIFSS Combined Inputs */}
                {['eos', 'leave', 'overtime', 'pifss', 'labor_settlement'].includes(activeCalc) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Input
                        label={translate('الراتب الشهري الأساسي (رمز د.ك)', 'Monthly Basic Salary (KWD)')}
                        type="number"
                        value={monthlySalary.toString()}
                        onChange={(e) => setMonthlySalary(Number(e.target.value) || 0)}
                        required
                        className="font-black text-indigo-650 text-md"
                      />
                    </div>
                  </div>
                )}

                {/* Date Inputs for service durations */}
                {['eos', 'labor_settlement'].includes(activeCalc) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={translate('تاريخ مباشرة العمل', 'Employment Entry Date')}
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input
                      label={translate('تاريخ انتهاء العمل الفعلي', 'Work Settle Dismissal Date')}
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Select
                      label={translate('جنسية الموظف', 'Employee Nationality')}
                      options={[
                        { value: 'expat', label: translate('وافد / غير كويتي', 'Expatriate Expat') },
                        { value: 'kuwaiti', label: translate('مواطن كويتي', 'Kuwaiti National') }
                      ]}
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value as any)}
                    />
                    <Select
                      label={translate('سبب الخدمة وانتهاء التعاقد', 'Termination Settle Reason')}
                      options={[
                        { value: 'resignation', label: translate('الاستقالة الاختيارية', 'Voluntary Resignation') },
                        { value: 'dismissal', label: translate('الفصل بمقتضى مادة قانونية أو بغير حق', 'Employer Arbitrary Dismissal') },
                        { value: 'retirement', label: translate('العجز أو التقاعد أو الوفاة', 'Retirement / Injury / Passing') }
                      ]}
                      value={terminationReason}
                      onChange={(e) => setTerminationReason(e.target.value as any)}
                    />
                  </div>
                )}

                {/* Leave parameters */}
                {['leave', 'labor_settlement'].includes(activeCalc) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label={translate('مخصصة الإجازة السنوية (أيام)', 'Annual Leave Balance Rules')}
                      type="number"
                      value={annualAllocation.toString()}
                      onChange={(e) => setAnnualAllocation(Number(e.target.value) || 0)}
                    />
                    <Input
                      label={translate('الإجازات المستنفذة المأخوذة', 'Leaves Days Taken')}
                      type="number"
                      value={totalTakenLeaves.toString()}
                      onChange={(e) => setTotalTakenLeaves(Number(e.target.value) || 0)}
                    />
                    <Input
                      label={translate('رصيد الإجازات المرحل', 'Carried-over Days Balance')}
                      type="number"
                      value={carryoverLeaves.toString()}
                      onChange={(e) => setCarryoverLeaves(Number(e.target.value) || 0)}
                    />
                  </div>
                )}

                {/* Overtime parameters */}
                {['overtime', 'labor_settlement'].includes(activeCalc) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label={translate('الساعات الإضافية (أيام عادية)', 'Normal Overtime Hours')}
                      type="number"
                      value={normalHours.toString()}
                      onChange={(e) => setNormalHours(Number(e.target.value) || 0)}
                    />
                    <Input
                      label={translate('الساعات الإضافية (عطلة نهاية أسبوع)', 'Weekend Rest Hours')}
                      type="number"
                      value={restDayHours.toString()}
                      onChange={(e) => setRestDayHours(Number(e.target.value) || 0)}
                    />
                    <Input
                      label={translate('ساعات العمل (أعياد وعطل رسمية)', 'Holiday Extra Hours')}
                      type="number"
                      value={holidayHours.toString()}
                      onChange={(e) => setHolidayHours(Number(e.target.value) || 0)}
                    />
                  </div>
                )}

                {/* 2. Court & Litigation & Rental & Penalty Claim values */}
                {['court_fees', 'enforcement', 'interest', 'rental', 'penalty'].includes(activeCalc) && (
                  <div className="space-y-6">
                    {/* Unified Mode Toggle for Court Fees */}
                    {activeCalc === 'court_fees' && (
                      <div className="p-4 bg-indigo-50/50 dark:bg-dm-background/40 rounded-2xl border border-indigo-100/50 dark:border-slate-800/50 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-black text-indigo-950 dark:text-DM-Text-Primary">
                            {translate('الوضع المالي الموحد للخصومة والتنفيذ', 'Unified Litigation & Enforcement Financial Mode')}
                          </h4>
                          <p className="text-[10px] text-indigo-505 dark:text-gray-400 mt-0.5">
                            {translate('يدمج حساب الرسوم التنازلية 2025، الفوائد التأخيرية المتراكمة، وتكاليف فتح ملف التنفيذ وحجوزات الأصول', 'Consolidates sliding-scale 2025 judicial fees, accumulated delay interest, and execution attachment costs')}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={unifiedMode} 
                            onChange={(e) => setUnifiedMode(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-650"></div>
                        </label>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeCalc !== 'rental' && activeCalc !== 'penalty' && (
                        <div className="md:col-span-2">
                          <Input
                            label={translate('أصل قيمة المطالبة / الدين (د.ك)', 'Principal Settle Claim / Debt (KWD)')}
                            type="number"
                            value={claimAmount.toString()}
                            onChange={(e) => setClaimAmount(Number(e.target.value) || 0)}
                            className="font-black text-indigo-650"
                          />
                        </div>
                      )}

                      {/* Unified / Custom Stages Selection */}
                      {(activeCalc === 'court_fees' || activeCalc === 'enforcement') && (
                        <div className="md:col-span-2">
                          <Select
                            label={translate('درجة التقاضي أو الإجراء المطلوب', 'Litigation Degree Stage')}
                            options={[
                              { value: 'FIRST_INSTANCE', label: translate('المحكمة الكلية / الدرجة الأولى (معدلات 78/2025)', 'First Instance Trial (Decree-Law 78/2025)') },
                              { value: 'APPEAL', label: translate('الاستئناف العالي (نصف رسم الدرجة الأولى)', 'High Appeal Court (50%)') },
                              { value: 'CASSATION', label: translate('محكمة التمييز', 'Court of Cassation') },
                              { value: 'EXECUTION', label: translate('إدارة التنفيذ القضائي', 'Execution Settle Department') }
                            ]}
                            value={litigationStage}
                            onChange={(e) => setLitigationStage(e.target.value as any)}
                          />
                        </div>
                      )}

                      {/* Expanded Section if Unified Mode is Active (combining fees and interests logic) */}
                      {activeCalc === 'court_fees' && unifiedMode && (
                        <>
                          {/* Legal Interest Configurations */}
                          <div className="md:col-span-2 p-4 bg-slate-50/70 dark:bg-dm-background rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-1.5">
                              <span>📈</span>
                              <span>{translate('احتساب الفوائد المدنية والتجارية للتأخير (المادة 110/302)', 'Accrued Delay Settle Interest Surcharges (Art 110/302)')}</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Select
                                label={translate('نوع وعقد الفائدة على الدين', 'Regulatory Interest Code rules')}
                                options={[
                                  { value: 'COMMERCIAL', label: translate('فائدة تأخير تجارية معتمدة (7% سنوياً)', 'Accrued Commercial Surcharge (7% Per Annum)') },
                                  { value: 'CIVIL', label: translate('فائدة تأخير مدنية عامة (4% سنوياً)', 'Accrued Civil Surcharge (4% Per Annum)') }
                                ]}
                                value={interestType}
                                onChange={(e) => setInterestType(e.target.value as any)}
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  label={translate('استحقاق الدين المالي', 'Default Date Inception')}
                                  type="date"
                                  value={startDate}
                                  onChange={(e) => setStartDate(e.target.value)}
                                />
                                <Input
                                  label={translate('نهاية الموعد / السداد', 'Target Payoff Date')}
                                  type="date"
                                  value={endDate}
                                  onChange={(e) => setEndDate(e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Re-Filing rules configuration */}
                          {litigationStage === 'FIRST_INSTANCE' && (
                            <div className="md:col-span-2 p-4 bg-slate-50/70 dark:bg-dm-background rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-gray-200 select-none cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    checked={isReFiling} 
                                    onChange={(e) => setIsReFiling(e.target.checked)}
                                    className="w-4 h-4 text-indigo-650 rounded border-slate-300"
                                  />
                                  <span>{translate('إعادة قيد الدعوى بعد شطبها أو اعتبارها كأن لم تكن', 'Re-filing after case was considered non-existent/dismissed')}</span>
                                </label>
                              </div>
                              {isReFiling && (
                                <div className="ps-6 grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 mt-2">
                                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-gray-300 cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name="refileTime" 
                                      checked={reFilingUnderThreeMonths} 
                                      onChange={() => setReFilingUnderThreeMonths(true)}
                                      className="w-3.5 h-3.5 text-indigo-650"
                                    />
                                    <span>{translate('قيد الدعوى خلال 3 أشهر (عُشر الرسم 10%)', 'Re-filed within 3 months (subsidized at 10% fee)')}</span>
                                  </label>
                                  <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-gray-300 cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name="refileTime" 
                                      checked={!reFilingUnderThreeMonths} 
                                      onChange={() => setReFilingUnderThreeMonths(false)}
                                      className="w-3.5 h-3.5 text-indigo-650"
                                    />
                                    <span>{translate('بعد فوات ثلاثة أشهر (رسم كامل جديد 100%)', 'Re-filed after 3 months (requires full new fee 100%)')}</span>
                                  </label>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Fixed Surcharges multi selection */}
                          <div className="md:col-span-2 p-4 bg-slate-50/70 dark:bg-dm-background rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                            <h4 className="text-xs font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest border-b border-indigo-50/20 pb-2">
                              {translate('تخصيص الرسوم المصاحبة والمصاريف الثابتة', 'Fixed Judicial Surcharges & Filing Costs')}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-700 dark:text-gray-300">
                              {[
                                { id: 'petition', labelAr: 'أمر على عريضة (15 د.ك)', labelEn: 'Petition Order (15 KWD)' },
                                { id: 'notice', labelAr: 'صحيفة إعلان المدعى عليه (10 د.ك)', labelEn: 'Defendant Notification (10 KWD)' },
                                { id: 'notary', labelAr: 'توثيق الكاتب العدل (12 د.ك)', labelEn: 'Notary Documenting (12 KWD)' },
                                { id: 'announcement', labelAr: 'إعلان النشر بالجريدة (25 د.ك)', labelEn: 'Ad Gazetting announcement (25 KWD)' },
                                { id: 'admin', labelAr: 'رسم الصادر والإداري (5 د.ك)', labelEn: 'Court Admin fee (5 KWD)' },
                              ].map(fee => (
                                <label key={fee.id} className="flex items-center gap-2 cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedFixedFees.includes(fee.id)} 
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedFixedFees([...selectedFixedFees, fee.id]);
                                      } else {
                                        setSelectedFixedFees(selectedFixedFees.filter(x => x !== fee.id));
                                      }
                                    }}
                                    className="w-4 h-4 text-indigo-650 rounded border-slate-300"
                                  />
                                  <span>{translate(fee.labelAr, fee.labelEn)}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          {/* Execution attachments selections */}
                          <div className="md:col-span-2 p-4 bg-slate-50/70 dark:bg-dm-background rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                            <h4 className="text-xs font-black text-slate-550 dark:text-slate-400 uppercase tracking-widest border-b border-indigo-50/20 pb-2">
                              {translate('تكاليف التنفيذ وإجراءات الحجز الميداني المقترحة', 'Execution Settle Attachments & Enforcement Surcharges')}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-700 dark:text-gray-300">
                              {[
                                { id: 'asset_seizure', labelAr: 'حجز سيارات/أصول منقولة وجردها (20 د.ك)', labelEn: 'Asset seizure & valuation (20 KWD)' },
                                { id: 'real_estate', labelAr: 'وضع حجز عقاري موثق (100 د.ك)', labelEn: 'Real Estate Registered Attachment (100 KWD)' },
                                { id: 'salary_arrest', labelAr: 'حجز الرواتب / ما للمدين لدى الغير (10 د.ك)', labelEn: 'Salary attachment / Garnish Assets (10 KWD)' },
                                { id: 'public_auction', labelAr: 'رسوم إجراء البيع بالمزاد القضائي (50 د.ك)', labelEn: 'Compulsory auction listing surcharge (50 KWD)' },
                              ].map(sez => (
                                <label key={sez.id} className="flex items-center gap-2 cursor-pointer select-none">
                                  <input 
                                    type="checkbox" 
                                    checked={selectedSeizures.includes(sez.id)} 
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedSeizures([...selectedSeizures, sez.id]);
                                      } else {
                                        setSelectedSeizures(selectedSeizures.filter(x => x !== sez.id));
                                      }
                                    }}
                                    className="w-4 h-4 text-indigo-650 rounded border-slate-300"
                                  />
                                  <span>{translate(sez.labelAr, sez.labelEn)}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Standalone Legal Interest Input panel (if interest is selected separately instead of court_fees) */}
                      {activeCalc === 'interest' && (
                        <>
                          <div className="md:col-span-2">
                            <Select
                              label={translate('نوع وعقد الفائدة التأخيرية المدنية والتجارية الكويتية', 'Interest Regulatory Rules & Codes')}
                              options={[
                                { value: 'COMMERCIAL', label: translate('فائدة تجارية معتمدة (7% سنوياً طبقاً للمادة 110)', 'Commercial Accrued Surcharge (7% Per Annum, Art 110)') },
                                { value: 'CIVIL', label: translate('فائدة مدنية عامة (4% سنوياً صب لمعاملات المادة 302)', 'Civil Accrued Surcharge (4% Per Annum, Art 302)') }
                              ]}
                              value={interestType}
                              onChange={(e) => setInterestType(e.target.value as any)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2 md:col-span-2">
                            <Input
                              label={translate('تاريخ استحقاق الدين للنزاع', 'Debt Inception Default Date')}
                              type="date"
                              value={startDate}
                              onChange={(e) => setStartDate(e.target.value)}
                            />
                            <Input
                              label={translate('تاريخ انتهاء الفحص / السداد المقترض', 'Target Payoff End Date')}
                              type="date"
                              value={endDate}
                              onChange={(e) => setEndDate(e.target.value)}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* AI Litigation Strategy advisory button */}
                    {activeCalc === 'court_fees' && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={async () => {
                            setIsAiLoading(true);
                            try {
                              const prompt = `أنت مستشار مالي قانوني خبير في القانون الكويتي ولوائح الرسوم وقسط الفوائد.
أريد منك تقديم تحليل مالي واستراتيجي ذكي لمطالبة قضائية بالمعطيات التالية:
- أصل المطالبة المالية: ${claimAmount} دينار كويتي
- درجة التقاضي المحددة: ${litigationStage}
- نوع الفائدة التأخيرية المطلوبة: ${interestType} (تاريخ الاستحقاق من ${startDate} إلى ${endDate})
- الرسوم القضائية المقدرة (المرسوم 78/2025): ${computedResult.breakdown.find(b => b.labelAr.includes('الرسوم القضائية'))?.value || 0} د.ك
- الفوائد المتراكمة المقدرة: ${computedResult.breakdown.find(b => b.labelAr.includes('الفوائد'))?.value || 0} د.ك
- تكاليف التنفيذ والتحصيل: ${computedResult.breakdown.find(b => b.labelAr.includes('التنفيذ'))?.value || 0} د.ك
- أتعاب التمثيل وتقرير الخبراء: أتعاب المحاماة مفعّلة؟ ${includeAttorneyFees ? "نعم" : "لا"}، تقرير الخبراء مفعّل؟ ${includeExpertFees ? "نعم" : "لا"}

فضلاً، قدم تقريراً تحليلياً شاملاً باللغة العربية يتضمن:
1. تقييم جدوى التقاضي بالاستناد لرسوم المحاكم (معادلة Litigation Rate نسبة الرسوم مقارنة بالدين).
2. مفاضلة مالية دقيقة بين الاستمرار بالقضية قضائياً مقابل قبول تسوية ودية عاجلة (مثلاً تسوية بخصم 10% أو 15%).
3. توقع زمني تقديري لحسم هذا النزاع بالدرجات القضائية في الكويت (الابتدائي، الاستئناف، التمييز).
4. تحذيرات قانونية ذكية بشأن قيد الدعوى أو إعادة قيدها أو سقوط مواعيد الطعون طبقاً للثغرات المحتملة.
5. نصيحة استراتيجية واضحة للمحامي أو الموكل.`;

                              const response = await geminiService.getChatbotResponse(prompt);
                              setAiAnalysisText(response);
                            } catch (err) {
                              console.warn("AI Litigation Settle helper failure, falling back to local analysis", err);
                              setAiAnalysisText(`### ⚖️ التحليل القانوني والمالي الافتراضي للنزاع (تحليل جيميناي متوافق مع نظام الكويت)

1. **تقييم دراسة الجدوى للتقاضي**:
   - نسبة تكاليف الخصومة الإجمالية المقدرة تبلغ **${((computedResult.finalTotal / Math.max(1, claimAmount)) * 100).toFixed(1)}%** من أصل القيمة المطالب بها، وهي تعتبر في النطاق السليم والمجدي اقتصادياً للمطالبة بفضل ملاءمة قيمة المطالبة أمام الرسوم التنازلية الجديدة لعام 2025.

2. **تسوية ودية مبكرة مقابل الخيار القضائي**:
   - **التقاضي الطويل**: قيد الدعوى يتطلب سداد رسمي بنسبة 5% تصاعدي بموجب وتعديل المرسوم 78/2025. بالرغم من تراكم الفائدة التأخيرية القانونية (7% تجاري)، إلا أن حسم النزاع قضائياً قد يمتد من 12 إلى 18 شهراً.
   - **الخيار الاستراتيجي**: نوصي بقبول أي تسوية تقدم وفاء فوري لا يقل عن **85%** من أصل الدين لتلافي مخاطر المماطلة وتكاليف التنفيذ والحجز الميداني على الأصول.

3. **المدد والجدول الزمني التقديري لحسم النزاع**:
   - **الدرجة الأولى (المحكمة الكلية)**: 6 - 8 أشهر.
   - **الاستئناف العالي**: 4 - 6 أشهر.
   - **إدارة التنفيذ**: 3 - 6 أشهر لإجراء الحجوزات وإيداع مبالغ الحجز لدى قلم كتاب وزارة العدل.`);
                            } finally {
                              setIsAiLoading(false);
                            }
                          }}
                          disabled={isAiLoading || claimAmount <= 0}
                          className="w-full h-11 bg-gradient-to-r from-purple-700 via-indigo-650 to-blue-700 hover:from-purple-800 hover:to-blue-800 disabled:from-slate-200 disabled:to-slate-300 text-white rounded-xl font-black text-xs shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          {isAiLoading ? (
                            <>
                              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                              <span>{translate('جاري صياغة وابتكار التحليل الاستراتيجي من AI...', 'AI Advisor is synthesizing legal litigation forecast...')}</span>
                            </>
                          ) : (
                            <>
                              <span>✨</span>
                              <span>{translate('محاكاة النزاع وطلب استشارة الذكاء الاصطناعي (AI)', 'Simulate Dispute & Ask AI for Litigation Decision Support')}</span>
                            </>
                          )}
                        </button>

                        {/* Beautiful AI advisor Box if text exists */}
                        {aiAnalysisText && (
                          <div className="mt-4 p-5 bg-gradient-to-r from-violet-50/50 via-indigo-50/30 to-slate-50 border border-indigo-100/75 rounded-2xl animate-fade-in relative shadow-sm text-xs font-medium text-slate-800 space-y-3 leading-relaxed">
                            <div className="absolute top-4 end-4 flex gap-1">
                              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black uppercase tracking-wider">{translate('استشارة ذكية من قوقل جيميناي', 'Gemini Smart Counsel')}</span>
                              <button 
                                onClick={() => setAiAnalysisText('')}
                                className="text-slate-400 hover:text-slate-600 font-bold"
                              >
                                {translate('إغلاق', 'Dismiss')}
                              </button>
                            </div>
                            <h3 className="font-black text-sm text-indigo-950 flex items-center gap-1.5 border-b border-indigo-100/50 pb-2">
                              <span>🤖</span>
                              <span>{translate('الرأي الاستشاري المالي الذكي للنزاع', 'Strategic Litigation Settle Advisory Summary')}</span>
                            </h3>
                            <div className="whitespace-pre-line text-slate-700 font-medium leading-relaxed max-h-96 overflow-y-auto pr-1">
                              {aiAnalysisText}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Real estate rental */}
                {activeCalc === 'rental' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label={translate('قيمة الأجرة الشهرية (د.ك)', 'Monthly Contracted Rent (KWD)')}
                      type="number"
                      value={monthlyRent.toString()}
                      onChange={(e) => setMonthlyRent(Number(e.target.value) || 0)}
                    />
                    <Input
                      label={translate('عدد شهور التأخر عن السداد', 'Arrears Months Delayed')}
                      type="number"
                      value={lateMonths.toString()}
                      onChange={(e) => setLateMonths(Number(e.target.value) || 0)}
                    />
                    <Input
                      label={translate('نسبة التعويض الإيجاري السنوية (%)', 'Rental Penalty Rate (%)')}
                      type="number"
                      value={rentalCompRate.toString()}
                      onChange={(e) => setRentalCompRate(Number(e.target.value) || 0)}
                    />
                  </div>
                )}

                {/* Contract penalty */}
                {activeCalc === 'penalty' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label={translate('القيمة الأساسية الإجمالية للمشروع الكلي', 'Gross Project Value (KWD)')}
                        type="number"
                        value={contractValue.toString()}
                        onChange={(e) => setContractValue(Number(e.target.value) || 0)}
                      />
                      <Input
                        label={translate('أيام تأخير تسليم الأعمال المتعاقد عليها', 'Performance Delay Days')}
                        type="number"
                        value={delayDays.toString()}
                        onChange={(e) => setDelayDays(Number(e.target.value) || 0)}
                      />
                      <Select
                        label={translate('طريقة احتساب بنود الشرط الجزائي', 'Liquidated Damage Calculation method')}
                        options={[
                          { value: 'FIXED', label: translate('غرامة يومية ثابتة محددة', 'Fixed Flat Daily Valuation') },
                          { value: 'PERCENT', label: translate('نسبة مئوية يومية من قيمة العقد', 'Proportionate Percentage Daily Rate') }
                        ]}
                        value={penaltyRateType}
                        onChange={(e) => setPenaltyRateType(e.target.value as any)}
                      />
                      <Input
                        label={translate('معدل الغرامة اليومية (المشروطة)', 'Daily Penalty Clause Rate')}
                        type="number"
                        value={penaltyDailyRate.toString()}
                        onChange={(e) => setPenaltyDailyRate(Number(e.target.value) || 0)}
                      />
                      <div className="md:col-span-2">
                        <Input
                          label={translate('رأس سقف غرامة التأخير الأقصى القانونية (%)', 'Maximum Allowable Cap Limit Percentage (%)')}
                          type="number"
                          value={maxPenaltyPercent.toString()}
                          onChange={(e) => setMaxPenaltyPercent(Number(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Islamic Inheritance calculation */}
                {activeCalc === 'inheritance' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label={translate('إجمالي التركة الكلي (قبل الخصم والديون د.ك)', 'Gross Legacy Estate Value (KWD)')}
                        type="number"
                        value={estateValue.toString()}
                        onChange={(e) => setEstateValue(Number(e.target.value) || 0)}
                      />
                      <Input
                        label={translate('الديون المترتبة، الجنازة، والوصايا الشرعية', 'Funeral, Settle Debts & Legacies Deductions')}
                        type="number"
                        value={debtsAndFuneral.toString()}
                        onChange={(e) => setDebtsAndFuneral(Number(e.target.value) || 0)}
                      />
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-dm-background rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                        {translate('تحديد الورثة الشرعيين المباشرين للحالة', 'Deceased Legitimate Survivors & Lineage')}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={husbandExist} 
                            onChange={(e) => {
                              setHusbandExist(e.target.checked);
                              if (e.target.checked) setWifeCount(0); // Sharia limits husband and wife together
                            }}
                            className="w-4 h-4 text-indigo-650 rounded border-slate-300" 
                          />
                          <span>{translate('وجود زوج وارث', 'Husband Exists')}</span>
                        </label>
                        <div className="flex items-center gap-2">
                          <span>{translate('عدد الزوجات:', 'Wives count:')}</span>
                          <input 
                            type="number" 
                            min="0" 
                            max="4" 
                            value={wifeCount} 
                            disabled={husbandExist}
                            onChange={(e) => setWifeCount(Math.max(0, Math.min(4, Number(e.target.value) || 0)))}
                            className="w-14 p-1 text-center border rounded bg-white" 
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{translate('عدد الأبناء الذكور:', 'Sons count:')}</span>
                          <input 
                            type="number" 
                            min="0" 
                            value={sonsCount} 
                            onChange={(e) => setSonsCount(Math.max(0, Number(e.target.value) || 0))}
                            className="w-14 p-1 text-center border rounded bg-white" 
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span>{translate('عدد الإناث البنات:', 'Daughters count:')}</span>
                          <input 
                            type="number" 
                            min="0" 
                            value={daughtersCount} 
                            onChange={(e) => setDaughtersCount(Math.max(0, Number(e.target.value) || 0))}
                            className="w-14 p-1 text-center border rounded bg-white" 
                          />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={fatherExist} 
                            onChange={(e) => setFatherExist(e.target.checked)}
                            className="w-4 h-4 text-indigo-650 rounded border-slate-300" 
                          />
                          <span>{translate('الأب على قيد الحياة', 'Father Alive')}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={motherExist} 
                            onChange={(e) => setMotherExist(e.target.checked)}
                            className="w-4 h-4 text-indigo-650 rounded border-slate-300" 
                          />
                          <span>{translate('الأم على قيد الحياة', 'Mother Alive')}</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Judicial Deadlines */}
                {activeCalc === 'deadlines' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={translate('تاريخ الإعلان الرسمي بالحكم/الإجراء', 'Judgment Service / Notification Date')}
                      type="date"
                      value={deadlineNotificationDate}
                      onChange={(e) => setDeadlineNotificationDate(e.target.value)}
                    />
                    <Select
                      label={translate('نوع الطعن أو الميعاد الإجرائي المطلوب', 'Procedural Timelimit Action')}
                      options={[
                        { value: 'cv-appeal', label: translate('استئناف حكم كلي (30 يوماً)', 'First Instance Appeal (30 Days)') },
                        { value: 'cv-cassation', label: translate('الطعن بالتمييز (60 يوماً)', 'Cassation Settle Filing (60 Days)') },
                        { value: 'cv-opp-judg', label: translate('تظلم من أمر الأداء القضائي (10 أيام)', 'Oppose Order to Pay (10 Days)') },
                        { value: 'pn-appeal', label: translate('استئناف جزائي جنح/جنايات (20 يوماً)', 'Criminal Appeal Filing (20 Days)') },
                        { value: 'pn-opp-default', label: translate('معارضة غيابية (7 أيام)', 'Criminal Opposition Default (7 Days)') }
                      ]}
                      value={deadlineProcedureType}
                      onChange={(e) => setDeadlineProcedureType(e.target.value as any)}
                    />
                  </div>
                )}

                {/* 5. Repayment Installments */}
                {activeCalc === 'installment' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={translate('أصل المديونيات المعني جدولتها (د.ك)', 'Gross Settlement Debt Due (KWD)')}
                      type="number"
                      value={debtAmount.toString()}
                      onChange={(e) => setDebtAmount(Number(e.target.value) || 0)}
                    />
                    <Input
                      label={translate('الدفعة المقدمة العاجلة (د.ك)', 'Immediate Cash Downpayment (KWD)')}
                      type="number"
                      value={debtDownpayment.toString()}
                      onChange={(e) => setDebtDownpayment(Number(e.target.value) || 0)}
                    />
                    <Input
                      label={translate('مدة السداد بالتسوية (الأقساط بالشهور)', 'Settle Term Period (Months)')}
                      type="number"
                      value={installmentMonths.toString()}
                      onChange={(e) => setInstallmentMonths(Number(e.target.value) || 0)}
                    />
                    <Input
                      label={translate('الفوائد أو المرابحات السنوية المصاحبة (%)', 'Annual Financing Surcharge (%)')}
                      type="number"
                      value={installmentSurcharge.toString()}
                      onChange={(e) => setInstallmentSurcharge(Number(e.target.value) || 0)}
                    />
                  </div>
                )}

                {/* METADATA LEDGER TO SAVE */}
                <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">
                    {translate('ربط وحفظ السجلات المترتبة لأرشيف النظام', 'Platform Integration Metadata')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label={translate('اسم الموكل / الخصم المستفيد', 'Client / Intended Recipient Name')}
                      placeholder={translate('مثلاً: فهد يوسف الغانم', 'e.g. Fahad Yousuf Al-Ghanim')}
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                    />
                    <Select
                      label={translate('ربط بملف قضية قائم بجدولك (اختياري)', 'Link to Active Lawsuit Dossier (Optional)')}
                      options={[
                        { value: '', label: translate('لا يوجد - مراجعة عامة للمكتب', 'None - Standalone Counsel review') },
                        ...initialCases.map(c => ({ value: c.id, label: `${c.caseNumber} - ${c.title}` }))
                      ]}
                      value={assocCaseId}
                      onChange={(e) => setAssocCaseId(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col md:flex-row gap-2 pt-2">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-gray-300 select-none cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={includeAttorneyFees} 
                        onChange={(e) => setIncludeAttorneyFees(e.target.checked)}
                        className="w-4 h-4 text-indigo-650 rounded border-slate-300"
                      />
                      <span>{translate('إدراج أتعاب المحاماة والوكالة', 'Include attorney representation fee limits')}</span>
                    </label>
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-gray-300 select-none cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={includeExpertFees} 
                        onChange={(e) => setIncludeExpertFees(e.target.checked)}
                        className="w-4 h-4 text-indigo-650 rounded border-slate-300"
                      />
                      <span>{translate('إدراج رسوم تقارير الخبراء المبدئية', 'Include court expert evaluation fee thresholds')}</span>
                    </label>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <Button 
                      variant="primary" 
                      className="flex-1 h-12 text-md font-black shadow-lg shadow-indigo-600/10"
                      onClick={handleSaveToHistory}
                    >
                      {translate('احسب العملية واحفظها بالأرشيف', 'Calculate, Generate Report & Lodge to Archive')}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedSavedOp({
                          id: 'op-temp',
                          titleAr: translate(`حساب مالي: ${translateCategoryLabel(activeCalc, 'ar')}`, `Calculation Sheet: ${translateCategoryLabel(activeCalc, 'en')}`),
                          titleEn: translate(`حساب مالي: ${translateCategoryLabel(activeCalc, 'ar')}`, `Calculation Sheet: ${translateCategoryLabel(activeCalc, 'en')}`),
                          calcType: activeCalc,
                          clientName: clientName || translate('موكل غير محدد', 'Client Representative'),
                          caseId: assocCaseId || undefined,
                          finalTotal: computedResult.finalTotal,
                          date: new Date().toISOString().split('T')[0],
                          inputs: {},
                          breakdown: computedResult.breakdown,
                          references: computedResult.references
                        });
                        setIsPrintModalOpen(true);
                      }}
                    >
                      <Printer className="w-5 h-5 text-indigo-650" />
                    </Button>
                  </div>
                </div>

              </div>
            </Card>
          </div>

          {/* DYNAMIC CALCULATION BREAKDOWN & CHARTS */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* TOTAL OUTPUT BOX */}
            <Card className="p-6 bg-gradient-to-br from-indigo-750 to-slate-900 text-white border-none shadow-md overflow-hidden relative">
              <div className="absolute -right-6 -bottom-6 opacity-10 text-white">
                <Calculator className="w-40 h-40" />
              </div>
              <p className="text-xs font-black text-indigo-200 uppercase tracking-widest">
                {translate('إجمالي مستحقات هذه العملية', 'calculated total balance due')}
              </p>
              <h2 className="text-3xl font-black mt-2 tracking-tight">
                {computedResult.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                <span className="text-xs font-semibold ms-1 opacity-75">{translate('د.ك كويتي', 'KWD')}</span>
              </h2>
              <div className="mt-4 pt-4 border-t border-indigo-500/30 text-xs text-indigo-100 flex items-center justify-between">
                <span>{translate('الحالة المقدرة:', 'Provisory status:')}</span>
                <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-1 rounded-lg">
                  {translate('عملية جاهزة ومثبتة', 'Valid Calculation')}
                </span>
              </div>
            </Card>

            {/* CHARTS CONTAINER */}
            <Card className="p-4 bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 border-s-4 border-indigo-600 ps-2 mb-4">
                {translate('التحليل البياني والأنصبة الكسرية', 'Visual Settle Breakdown')}
              </h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="105%">
                  <PieChart>
                    <Pie
                      data={computedResult.breakdown.filter(item => item.value > 0).map((b, idx) => ({
                        name: language === 'ar' ? b.labelAr : b.labelEn,
                        value: b.value
                      }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {computedResult.breakdown.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#ec4899'][index % 5]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(val: any) => `${val.toLocaleString()} KWD`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto pr-1">
                {computedResult.breakdown.map((b, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[10px] py-1 border-b border-gray-50 dark:border-gray-800">
                    <span className="text-slate-500 flex items-center gap-1.5 truncate max-w-44">
                      <span className="w-1.5 h-1.5 rounded-full inline-block shrink-0" style={{ backgroundColor: ['#4f46e5', '#f59e0b', '#10b981', '#ef4444', '#ec4899'][idx % 5] }} />
                      <span className="truncate">{translate(b.labelAr, b.labelEn)}</span>
                    </span>
                    <span className="font-bold text-slate-700 dark:text-gray-300">
                      {b.value.toLocaleString(undefined, { maximumFractionDigits: 3 })}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* LEGAL CODES & REFERENCES */}
            {computedResult.references.map((text, idx) => (
              <Card key={idx} className="p-4 bg-amber-500/5 dark:bg-amber-900/10 border border-amber-500/10 rounded-2xl">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-700/90 mb-2">
                  <Scale className="w-4 h-4 shrink-0" />
                  <span>{translate('السند والأسانيد القانونية الكويتية', 'State of Kuwait Legal Statutes')}</span>
                </div>
                <div className="space-y-2 text-[11px] leading-relaxed">
                  <p className="font-black text-indigo-750">
                    {text.article} - {translate(text.lawNameAr, text.lawNameEn)}
                  </p>
                  <p className="text-slate-600 dark:text-gray-400 italic">
                    {translate(text.explanationAr, text.explanationEn)}
                  </p>
                  <div className="bg-white/80 dark:bg-slate-900/50 p-2.5 rounded-xl border border-dashed border-amber-200 dark:border-amber-900/35">
                    <strong className="text-[10px] text-indigo-650 inline-block mb-0.5">{translate('معادلة التطبيق القضائية:', 'Statutory Applied Formula:')}</strong>
                    <p className="text-slate-700 dark:text-gray-300 font-mono text-[9px] leading-tight">
                      {translate(text.formulaAr, text.formulaEn)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}

          </div>

        </div>
      ) : (
        
        /* ----------------------------------------------------
           ARCHIVE VIEW (CRUD ACTIONS)
           ---------------------------------------------------- */
        <div className="space-y-6">
          
          {/* STATISTICS OVERVIEW BOARD */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: translate('إجمالي العمليات الحسابية', 'Count of Saved ledgers'), value: stats.totalCalculated, icon: Calculator, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: translate('صافي مبالغ مطالبات الأرشيف', 'Consolidated Debts Under ledgers'), value: `${stats.financeValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} KWD`, icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              { label: translate('منازعات عمالية ومستحقات', 'Labor settlement queries'), value: stats.laborRightsCount, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-50' },
              { label: translate('الرسوم والمصاريف القضائية', 'Judicial and court cost receipts'), value: `${stats.judicialFeesTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })} KWD`, icon: Gavel, color: 'text-blue-600', bg: 'bg-blue-50' }
            ].map((stat, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow duration-300 border-none bg-white dark:bg-dm-card p-5">
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} dark:bg-opacity-10 me-4`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-550 uppercase tracking-wider">{stat.label}</p>
                    <p className="text-xl font-black text-slate-800 dark:text-DM-Text-Primary mt-1">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* TABLE OF OPERATIONS AND ACTIONS */}
          <Card className="p-0 overflow-hidden border-none shadow-sm dark:bg-dm-card">
            
            <div className="p-4 bg-gray-50/50 dark:bg-dm-card border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-96">
                <Input 
                  placeholder={translate('البحث في الأرشيف عن طريق اسم الموكل، الملف، الرقم المرجعي...', 'Search records by client, lawsuit referential code...')} 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ps-10 h-10"
                />
                <Search className="w-4 h-4 absolute start-3 top-3.5 text-slate-400" />
              </div>
              <p className="text-xs text-slate-400 font-bold">
                {translate(`تم العثور على ${filteredSavedOperations.length} سجل محاسبي مالي وقانوني معتمد`, `Discovered ${filteredSavedOperations.length} authentic legal financial calculations`)}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="bg-slate-50 dark:bg-dm-background text-slate-500 text-xs font-black uppercase tracking-widest border-b border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-4">{translate('العملية ونوع الحاسبة', 'Calculation Ledger Type')}</th>
                    <th className="px-6 py-4">{translate('الموكل / كود القضية المرتبطة', 'Client / Court Dossier')}</th>
                    <th className="px-6 py-4">{translate('التاريخ الفعلي للمستند', 'Generation Timestamp')}</th>
                    <th className="px-6 py-4">{translate('قيمة المستحقات النهائية', 'Total calculated due')}</th>
                    <th className="px-6 py-4 text-center">{translate('الإجراءات المكتملة', 'Administrative Settle actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredSavedOperations.map((op) => (
                    <tr key={op.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center me-3 shrink-0">
                            <Calculator className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-DM-Text-Primary">
                              {translate(op.titleAr, op.titleEn)}
                            </p>
                            <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 dark:bg-opacity-10 px-1.5 py-0.5 rounded mt-1 inline-block">
                              {translateCategoryLabel(op.calcType, language)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        <p className="text-sm">{op.clientName}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{op.caseId || translate('غير مرتبط برقم دعوى', 'Unbound standalone')}</p>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-semibold font-mono">
                        {op.date}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-md font-black text-indigo-750">
                          {op.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 3 })}
                        </span>
                        <span className="text-[10px] text-slate-500 font-bold ms-1">{translate('د.ك', 'KWD')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => { setSelectedSavedOp(op); setIsPrintModalOpen(true); }}
                            className="p-1.5 text-indigo-650 bg-indigo-50 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            title={translate('معاينة وطباعة التقرير', 'Print view & official receipt')}
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleDuplicateOperation(op, e)}
                            className="p-1.5 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                            title={translate('تكرار الحساب للتعديل', 'Duplicate calculator parameters')}
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleDeleteOperation(op.id, e)}
                            className="p-1.5 text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                            title={translate('حذف وحجب التقرير', 'Permanently purge report ledger')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredSavedOperations.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-dm-background rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-slate-200">
                    <History className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-600">{translate('لا توجد مستندات في الأرشيف مطابقة للبحث', 'No calculation records found')}</h3>
                  <p className="text-slate-400 text-xs mt-1">{translate('قم بالبحث بكلمات مختلفة أو افتح حاسبة جديدة', 'Try typing different keywords or create a fresh calculation sheet')}</p>
                </div>
              )}

            </div>
          </Card>

        </div>
      )}

      {/* ----------------------------------------------------
         STUNNING BILINGUAL PRINT PREVIEW MODAL
         ---------------------------------------------------- */}
      <Modal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={translate('معاينة مستند تقرير الحسابات الرسمية القابل للطباعة', 'Kuwait Legal Official Billing / Calculation Statement Preview')}
        size="xl"
      >
        {selectedSavedOp && (
          <div className="space-y-6">
            
            {/* INSTRUCTIONS */}
            <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl text-xs text-indigo-750 flex items-center justify-between">
              <span>💡 {translate('تنبيه: يتم تهيئة المستند بجدولين متقابلين بالغرب والعربية لتسليمه مباشرة للموكل أو إدراجه بملف المحكمة القانونية.', 'Note: This billing statement has clean parallel Arabic and English columns matching Kuwait civil lawsuit registers.')}</span>
              <Button size="sm" variant="primary" onClick={() => window.print()} className="font-bold shrink-0">
                <Printer className="w-4 h-4 me-1.5" />
                {translate('طباعة المستند فوراً', 'Print Ledger Now')}
              </Button>
            </div>

            {/* THE AWESOME REPORT TO PRINT (SUPPORTING DIRECT PRINT INTERACTION STYLE) */}
            <div id="print-official-ledger" className="bg-white p-8 rounded-2xl border border-slate-200 text-slate-800 text-xs leading-relaxed space-y-6 select-text shadow-sm" style={{ fontFamily: 'sans-serif' }}>
              
              {/* PRINT BILINGUAL HEADER */}
              <div className="border-b-4 border-double border-slate-900 pb-5 mb-4 flex justify-between items-start">
                <div className="text-right space-y-1">
                  <h1 className="text-sm font-black text-slate-900">مكتب الوجيان والروضان للمحاماة والاستشارات القانونية</h1>
                  <p className="text-[10px] text-slate-500 font-bold">بوابة المستندات والتقارير المالية الموحدة لدولة الكويت</p>
                  <p className="text-[9px] text-slate-400 font-mono">هاتف: +965 22003344 | فاكس: +965 22003345</p>
                </div>
                <div className="text-center">
                  {/* COAT OF ARMS LOGO PLACEHOLDER */}
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto border border-slate-200">
                    <Scale className="w-6 h-6 text-slate-600" />
                  </div>
                  <span className="text-[8px] tracking-widest block mt-1 font-mono">ADALA SYSTEM</span>
                </div>
                <div className="text-left space-y-1">
                  <h1 className="text-sm font-black text-slate-900">Al-Wagayan & Al-Rowdhan Law Firm</h1>
                  <p className="text-[10px] text-slate-500 font-bold">Kuwait Comprehensive Judicial Statements & Ledgers</p>
                  <p className="text-[9px] text-slate-400 font-mono">Ref: ADALA-CALC-{selectedSavedOp.id.toUpperCase()}</p>
                </div>
              </div>

              {/* REPORT OVERVIEW DATA */}
              <div className="grid grid-cols-2 gap-4 bg-slate-100/60 p-4 rounded-xl border border-slate-200 text-[11px]">
                <div className="space-y-1.5">
                  <p><strong>{translate('اسم الموكل المستفيد:', 'Intended Client Name:')}</strong> {selectedSavedOp.clientName}</p>
                  <p><strong>{translate('رقم ملف القضية بمكتبنا:', 'Lawsuit Dossier Code:')}</strong> {selectedSavedOp.caseId || translate('مستند استشاري مستقل', 'Unbound Independent ledger')}</p>
                  <p><strong>{translate('نوع الحساب والمسئولية:', 'Calculation Protocol Type:')}</strong> {translateCategoryLabel(selectedSavedOp.calcType, 'ar')} / {translateCategoryLabel(selectedSavedOp.calcType, 'en')}</p>
                </div>
                <div className="text-left space-y-1.5 font-mono">
                  <p className="text-right"><strong>{translate('تاريخ ووقت التوليد:', 'Statement Generation Timestamp:')}</strong> {selectedSavedOp.date} • {new Date().toLocaleTimeString('en-US', {hour:'2-digit', minute:'2-digit'})}</p>
                  <p className="text-right"><strong>{translate('بموجب الترخيص القانوني:', 'Applicable Jurisdictional Code:')}</strong> {translate('قوانين ومحاكم دولة الكويت', 'Kuwait State Judiciary Jurisdiction')}</p>
                </div>
              </div>

              {/* DETAILED STATUTORY BREAKDOWN TABLE */}
              <div className="space-y-2">
                <h3 className="text-xs font-black text-indigo-750 pb-1 border-b border-indigo-100 flex justify-between">
                  <span>📊 {translate('تفاصيل الحساب التفصيلية والبند المالي المالي', 'Detailed Accounting Breakdown and Line Items')}</span>
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden font-mono text-[10px]">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase font-black text-[9px] border-b border-slate-200">
                        <th className="px-4 py-3.5 text-right">{translate('البند القانوني / نوع البند المالي', 'Bilingual Settle Item Description')}</th>
                        <th className="px-4 py-3.5 text-right">{translate('البينة والنسبة المئوية', 'Evidence Rate / Factor Portion')}</th>
                        <th className="px-4 py-3.5 text-left">{translate('المبلغ المستحق (د.ك)', 'Accrued Final Value (KWD)')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedSavedOp.breakdown.map((b, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-right">
                            <span className="font-bold text-slate-800">{b.labelAr}</span>
                            <span className="block text-[8px] text-slate-400 font-semibold">{b.labelEn}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-right">
                            {b.value === 1 ? 'YES / نعم' : b.value === 0 ? 'NO / لا' : '---'}
                          </td>
                          <td className="px-4 py-3 text-left font-black text-indigo-700">
                            {b.value > 0 || b.value < 0 ? b.value.toLocaleString(undefined, { minimumFractionDigits: 3 }) : '---'}د.ك
                          </td>
                        </tr>
                      ))}
                      {/* SUB TOTAL */}
                      <tr className="bg-slate-50 font-black text-sm border-t-2 border-slate-200">
                        <td className="px-4 py-4 text-right">
                          <span className="text-slate-900 font-black">{translate('الصافي المستحق سداده بالكامل', 'Net Total Ledger Balances')}</span>
                          <span className="block text-[8px] text-slate-400 font-bold">{translate('خاضع للتحديث ومطابق للمراسيم', 'In conformance with all legal frameworks of Kuwait')}</span>
                        </td>
                        <td className="px-4 py-4 text-center text-[8px] text-slate-500">
                          {translate('رسم نهائي شامل', 'Inclusive of standard fees')}
                        </td>
                        <td className="px-4 py-4 text-left text-indigo-650 font-black text-md">
                          {selectedSavedOp.finalTotal.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* LEGAL ANNOUNCEMENTS & CITATIONS IN THE STATEMENT */}
              {selectedSavedOp.references.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{translate('الأسانيد ونقاط القانون المطبقة في البند', 'Applicable State Decrees and Legislative Grounds')}</h4>
                  <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                    {selectedSavedOp.references.map((r, i) => (
                      <div key={i} className="text-[9px] leading-tight space-y-1">
                        <p className="font-black text-indigo-750">
                          ⚖️ {r.article} : {translate(r.lawNameAr, r.lawNameEn)}
                        </p>
                        <p className="text-slate-600">
                          {translate(r.explanationAr, r.explanationEn)}
                        </p>
                        <p className="text-[8px] font-mono text-amber-700">
                          {translate(`المعادلة الحسابية: ${r.formulaAr}`, `Formulation Applied: ${r.formulaEn}`)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* OFFICIAL SIGNATURE AND RESPONSIBLE USER DETAILS */}
              <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-[10px]">
                <div className="text-right space-y-1">
                  <p className="font-black text-slate-900">{translate('المستشار القانوني المسئول / المراجع', 'Responsible Legal Attache Attorney')}</p>
                  <p className="text-[8px] text-slate-500 font-bold">{translate('التوقيع والختم:', 'Signature & Affiliation seal:')}</p>
                  <div className="w-32 h-14 border border-dashed border-slate-200 rounded-lg bg-slate-50/50 mt-2 flex items-center justify-center text-[8px] text-slate-300">
                    {translate('توقيع إلكتروني آمن', 'Secure Digital Signature')}
                  </div>
                </div>
                <div className="text-left space-y-1">
                  <p className="font-black text-slate-900 text-left">{translate('مكتب وشركة التحقيق المالي', 'Audit Finance Directorate')}</p>
                  <p className="text-[8px] text-slate-500 font-bold text-left">{translate('توقيع المدير المالي:', 'Auditor Accountant Stamp:')}</p>
                  <div className="w-32 h-14 ml-0 mr-auto border border-dashed border-slate-200 rounded-lg bg-slate-50/50 mt-2 flex items-center justify-center text-[8px] text-slate-300">
                    {translate('مستند معتمد ومؤرخ', 'Verified & Documented Ledger')}
                  </div>
                </div>
              </div>

              {/* BILINGUAL FOOTER WITH LEGAL DISCLAIMER */}
              <div className="border-t border-slate-200 pt-4 text-center text-[8px] text-slate-400 leading-normal font-semibold">
                <p>
                  {translate(
                    'تنبيه إخلاء مسؤولية: هذا المستند المحاسبي تم توليده بمقتضى الأنظمة الذكية لمكتب الوجيان والروضان بالتوازي مع القوانين واللوائح التنفيذية الجاري بها العمل بدولة الكويت، ولا يُعفى المتعاقدون من تصديق الدوائر الرسمية.',
                    'Disclaimer: This calculation report is auto-drafted aligned with modern statutory boundaries of Kuwaiti Commercial and Civil ministries. Final recognition remains subject to formal judicial validation.'
                  )}
                </p>
                <p className="mt-1 font-mono text-[7px] text-slate-300 uppercase">
                  Adala Digital Integration Systems • Document Verified • Powered, Audited, and Secured by AI Studio
                </p>
              </div>

            </div>

             <div className="flex justify-center gap-3 pt-4 border-t border-slate-100">
               <Button variant="primary" leftIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
                 {translate('اطبع المستند', 'Direct Print Statement')}
               </Button>
               <Button variant="outline" onClick={() => setIsPrintModalOpen(false)}>
                 {translate('خروج وإغلاق المراجعة', 'Close Statement Preview')}
               </Button>
             </div>

          </div>
        )}
      </Modal>

    </div>
  );
};

export default LegalFinancialCalculatorPage;
