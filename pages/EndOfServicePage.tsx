import React, { useState, useMemo, useEffect } from 'react';
import { 
  Eye, Edit, Trash2, Search, Scale, ShieldCheck, Printer, 
  FileText, CheckCircle2, AlertTriangle, AlertCircle, Plus, 
  Check, UserCheck, History, FileSignature, Coins, BookOpen, 
  User, Sparkles, ChevronLeft, Calendar, BadgeInfo, Download, 
  RefreshCw, X, Laptop, Award, Landmark, Lock, CheckSquare, 
  Clock, FileSpreadsheet, Key, AlertOctagon, HelpCircle,
  Filter, ChevronDown, List, Grid, Sliders, Play, FileDown,
  Activity, BookCheck, Stamp, BadgeAlert, Sparkle, Bot, CheckCircle,
  Calculator, UserPlus, FileArchive, CheckSquare as CheckIcon, RefreshCcw,
  FileCode, Send, Building2, ArrowUpRight, FolderClosed, CheckSquare2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { EOS_Settlement, EOS_SettlementStatus, TerminationReasonKuwait, ContractTypeKuwait } from '../types';
import { calculateKuwaitEOS } from '../services/eosService';
import { OFFICE_NAME } from '../constants';
import { geminiService } from '../services/geminiService';
import { useLanguage } from '../components/i18n/LanguageProvider';

// Subcomponents
import { EndOfServiceDocumentViewer } from '../components/eos/EndOfServiceDocumentViewer';
import { EndOfServiceWizard } from '../components/eos/EndOfServiceWizard';

// Initial saved cases
const initialSavedCases: EOS_Settlement[] = [
  {
    id: 'EOS-1029',
    employeeId: 'K-20921',
    employeeName: 'أحمد جاسم الشمري',
    nationality: 'كويتي',
    settlementDate: '2026-05-30',
    department: 'الشؤون الإدارية والموارد البشرية',
    jobTitle: 'مدير قطاع شؤون الموظفين',
    joiningDate: '2016-01-01',
    lastWorkingDay: '2026-05-30',
    serviceYears: 10,
    serviceMonths: 4,
    serviceDays: 29,
    basicSalary: 1200,
    allowances: 350,
    grossSalary: 1550,
    terminationReason: TerminationReasonKuwait.RESIGNATION,
    contractType: ContractTypeKuwait.UNLIMITED,
    indemnityAmount: 11180.500,
    leaveBalanceDays: 45,
    leaveBalanceAmount: 2682.690,
    accruedSalaryAmount: 1550.000,
    noticePeriodAmount: 0,
    otherBonuses: 500.000,
    loansDeduction: 1200.000,
    absenceDays: 2,
    absenceDeduction: 119.230,
    disciplinaryDeductions: 0.000,
    socialInsuranceDeduction: 124.000,
    otherDeductions: 119.230,
    netPayable: 14589.960,
    status: 'Completed',
    preparedBy: 'شؤون الموظفين',
    settlementNumber: 'SET-99210-2026',
    approvals: { hr: 'مكتمل', legal: 'معتمد', finance: 'مكتمل', gm: 'معتمد' },
    signatures: {
      employee: 'أحمد جاسم الشمري - تم إبراء الذمة بالتوقيع الرقمي المعتمد',
      hr: 'الشؤون الإدارية: م. فواز الصباح - معتمد رصيد الإجازات والأيام',
      legal: 'المستشار القانوني: د. صبري شطا - معتمد ومطابق للقانون 6/2010',
      fin: 'الرقابة المالية: أ. خالد الروضان - تم خصم القرض وعمل المقاصة'
    },
    notes: 'تمت التسوية وتوقيع مخالصة إبراء ذمة شاملة ومسح العهد العينية ومخالصة بنك الكويت الوطني.',
    timeline: [
      { date: '2026-05-10', actionAr: 'تقديم طلب الاستقالة وقبولها بموجب المادة 53 من قبل الموارد البشرية', actionEn: 'Resignation requested and approved under Article 53', user: 'م. فواز الصباح' },
      { date: '2026-05-12', actionAr: 'إتمام جرد العهد ومسح الهواتف وحساب العجز المالي للشركة', actionEn: 'Inventory completed and mobile data wiped', user: 'شؤون الموظفين' },
      { date: '2026-05-14', actionAr: 'توقيع مخالصة تصفية الديون ومقاصة القروض الشخصية المتبقية', actionEn: 'Debt liquidation clearance signed', user: 'أ. خالد الروضان' },
      { date: '2026-05-20', actionAr: 'اعتماد المستشار القانوني وإصدار سند الإقرار الودية الموحدة', actionEn: 'Legal advisor signature, issuing unified settlement deed', user: 'د. صبري شطا' }
    ],
    legalArticles: ['المادة 51', 'المادة 53']
  },
  {
    id: 'EOS-1033',
    employeeId: 'N-88291',
    employeeName: 'محمد فاروق عبد المجيد',
    nationality: 'مصري',
    settlementDate: '2026-05-28',
    department: 'قسم الخدمات المساندة والفنية',
    jobTitle: 'مهندس صيانة ميكانيكية أول',
    joiningDate: '2019-03-15',
    lastWorkingDay: '2026-05-28',
    serviceYears: 7,
    serviceMonths: 2,
    serviceDays: 13,
    basicSalary: 650,
    allowances: 150,
    grossSalary: 800,
    terminationReason: TerminationReasonKuwait.DISMISSAL_WITH_NOTICE,
    contractType: ContractTypeKuwait.LIMITED,
    indemnityAmount: 4268.320,
    leaveBalanceDays: 30,
    leaveBalanceAmount: 923.070,
    accruedSalaryAmount: 720.000,
    noticePeriodAmount: 0,
    otherBonuses: 0.000,
    loansDeduction: 0.000,
    absenceDays: 0,
    absenceDeduction: 0.000,
    disciplinaryDeductions: 150.000,
    socialInsuranceDeduction: 0.000,
    otherDeductions: 150.000,
    netPayable: 5761.390,
    status: 'PendingReview',
    preparedBy: 'مروان خضير',
    settlementNumber: 'SET-99318-2026',
    approvals: { hr: 'مكتمل', legal: 'بانتظار', finance: 'بانتظار', gm: 'معلق' },
    signatures: {
      employee: '',
      hr: 'أخصائي شؤون عمالية: مروان خضير - تم إثبات تاريخ إنهاء العمل من مكاتب الوزارة',
      fin: '',
      legal: ''
    },
    notes: 'إنهاء خدمة الموظف نظراً للظروف التشغيلية مع إخطاره رسمياً، يستحق مستحقاته كاملة.',
    timeline: [
      { date: '2026-05-15', actionAr: 'إصدار كتاب إنهاء خدمة رسمي مع منح مهلة الإخطار ٣ أشهر', actionEn: 'Official termination notice issued with 3 months lead', user: 'الموارد البشرية' }
    ],
    legalArticles: ['المادة 44', 'المادة 51']
  },
  {
    id: 'EOS-1035',
    employeeId: 'K-20102',
    employeeName: 'مشاري عبد المحسن المطيري',
    nationality: 'كويتي',
    settlementDate: '2026-05-20',
    department: 'قسم الحفر والإنتاج النفطي',
    jobTitle: 'فني حفر آبار ميداني',
    joiningDate: '2021-01-01',
    lastWorkingDay: '2026-05-20',
    serviceYears: 5,
    serviceMonths: 4,
    serviceDays: 19,
    basicSalary: 1800,
    allowances: 950,
    grossSalary: 2750,
    terminationReason: TerminationReasonKuwait.RESIGNATION,
    contractType: ContractTypeKuwait.UNLIMITED,
    indemnityAmount: 6415.300,
    leaveBalanceDays: 12,
    leaveBalanceAmount: 1269.230,
    accruedSalaryAmount: 1650.000,
    noticePeriodAmount: 0,
    otherBonuses: 1200.000,
    loansDeduction: 3500.000,
    absenceDays: 5,
    absenceDeduction: 528.840,
    disciplinaryDeductions: 0.000,
    socialInsuranceDeduction: 220.000,
    otherDeductions: 528.840,
    netPayable: 6085.690,
    status: 'UnderFinancialReview',
    preparedBy: 'حنان الخالدي',
    settlementNumber: 'SET-99341-2026',
    approvals: { hr: 'مكتمل', legal: 'معتمد', finance: 'قيدالمراجعة', gm: 'معلق' },
    signatures: {
      employee: '',
      hr: 'الموارد البشرية: حنان الخالدي - تم فحص الخدمة النفطية وتطبيق لوائح العقد الموحد للنفط',
      fin: '',
      legal: 'مستشار قطاع النفط: أسامة الحربي - متطابق مع علاوة الحقل والميزات الإجرائية'
    },
    notes: 'الموظف لديه سلفة شخصية من ميزانية الشركة بقيمة 3,500 د.ك جاري مقاصتها بكفاءة.',
    timeline: [
      { date: '2026-05-02', actionAr: 'استلام الاستقالة والتحقق من رصيد السلفة براءة الذمة العينية', actionEn: 'Resignation received, checking loans and equipment handover', user: 'حنان الخالدي' }
    ],
    legalArticles: ['المادة 51', 'المادة 53']
  }
];

const translations: Record<'ar' | 'en', any> = {
  ar: {
    title: "إدارة ومخالصات نهاية الخدمة والتسويات العمالية",
    officeName: "مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية والتحكيم",
    lawComplianceBadge: "مطابق لقانون العمل الكويتي في القطاع الأهلي رقم 6 لسنة 2010",
    complianceVerified: "معتمد قانوناً",
    searchPlaceholder: "البحث باسم الموظف، الرقم المدني، المسمى الوظيفي...",
    newSettlement: "ملف تسوية ومخالصة جديدة",
    classification: "التصنيف والسبب القانوني لإنهاء الخدمة",
    allClassifications: "كافة الأسباب القانونية",
    statusFilter: "تصفية الملفات حسب حالة الاعتماد",
    dossierCount: "ملف تسوية عمالية",
    serviceDuration: "مدة الخدمة الإجمالية للموظف",
    years: "سنوات",
    months: "أشهر",
    days: "أيام",
    netPayable: "صافي المستحقات والتعويضات المعتمدة",
    kwd: "د.ك",
    statutoryCeiling: "الحد الأقصى المكفول قانوناً",
    underLimit: "ضمن النطاق القانوني",
    resignationScale: "نسبة استحقاق مكافأة نهاية الخدمة (المادة 51)",
    firstFiveYears: "الخمس سنوات الأولى",
    beyondFiveYears: "السنوات التالية",
    calculationsTab: "محرك احتساب التسوية",
    documentsTab: "المستندات القانونية والمخالصات",
    approvalsTab: "اعتمادات أطراف العلاقة",
    dependenciesTab: "تصفية العهد والربط المالي",
    basicSalary: "الراتب الأساسي الأخير",
    allowances: "البدلات الثابتة والتعويضات",
    joiningDate: "تاريخ مباشرة العمل الفعلي",
    lastWorkingDay: "تاريخ انتهاء الخدمة (آخر يوم عمل)",
    leaveBalance: "رصيد الإجازات السنوية المستحقة (يوم)",
    absenceDays: "أيام الغياب بدون عذر مقبول (يوم)",
    totalEarnings: "إجمالي المستحقات المالية (+)",
    totalDeductions: "إجمالي الاستقطاعات والخصومات (-)",
    saveDossier: "حفظ ومزامنة ملف التسوية",
    formulasBreakdown: "مسار التدقيق الحسابي التفصيلي للمكافأة",
    dailyWageBasis: "أساس حساب الأجر اليومي (مقسم على 26)",
    dailyRate: "معدل الراتب اليومي النهائي",
    formulaUsed: "المعادلة المطبقة بموجب المادة 51",
    formulaSample: "(الراتب الأساسي + البدلات الثابتة) / 26 = الأجر اليومي",
    mathTransparency: "التفصيل الرياضي لمكافأة نهاية الخدمة (مادة 51)",
    signaturesSec: "مصفوفة التوقيعات والاعتمادات الرسمية لبراءة الذمة",
    employeeSignature: "توقيع الطرف الثاني (الموظف - إقرار الوفاء)",
    hrApproval: "تدقيق واعتماد إدارة الموارد البشرية",
    legalApproval: "المصادقة القانونية لمكتب المحامي صبري شطا",
    financeApproval: "الرقابة وتأكيد التحويل المالي والدفع الإمراري",
    assetsClearance: "تصفية ومقاصة الأصول والعهد العينية المستلمة",
    laptopHandover: "جهاز الحاسب المحمول (اللابتوب) وملحقاته وعهدته",
    badgeHandover: "بطاقة المرور الإلكترونية وبوابة الدخول الذكي",
    keysHandover: "مفاتيح المكاتب والخزائن العينية المخصصة",
    carHandover: "سيارة المنشأة والعهد والآليات اللوجستية",
    returnedStatus: "تم الاسترداد بحالة سليمة ✔",
    pendingStatus: "قيد المراجعة والاستلام المعلق ⏳",
    lostStatus: "مفقود - استقطاع القيمة التقديرية للأصل",
    bankLinkage: "التسوية المصرفية والتحويل البنكي للمستحقات",
    targetBank: "البنك المعتمد بدولة الكويت للإيداع",
    bankReceipt: "رقم الحوالة المصرفية للإيداع المعتمد",
    ibanCode: "رقم الحساب الدولي المبرأ للذمة (IBAN)",
    printDeed: "طباعة صك المخالصة المروّسة",
    exportWord: "تصدير إلى ملف Word",
    lawFirmStationery: "صك مروّس رسمي - مكتب صبري شطا للمحاماة",
    printTitle: "سند المخالصة وإبراء الذمة العمالية المطلقة والتسوية الشاملة",
    phone: "الهاتف: +965 22000000",
    email: "البريد الإلكتروني: info@shatta-law.com",
    address: "العنوان: برج القبلة، شرق، دولة الكويت",
    pageOf: "صفحة 1 من 1",
    verificationAr: "مستند تسوية معتمد ومتوافق مع الهيئة العامة للقوى العاملة وقوانين العمل الكويتية",
    qrLabel: "مسح الرمز للتحقق من مصادقة السند",
    unpaidLeaveDeduction: "استقطاع أيام الغياب والإجازات غير المدفوعة",
    notCertified: "بانتظار المراجعة والتدقيق",
    draft: "مسودة غير معتمدة",
    reviewing: "قيد التدقيق القانوني والمالي",
    certified: "تمت المخالصة وبانتظار الإيداع البنكي",
    approved: "تم إيداع المستحقات مالياً وإغلاق الملف",
    activeDossier: "الملف العمالي النشط المستهدف",
    litigationEscalation: "إحالة الملف إلى شكوى عمالية (إدارة علاقات العمل)"
  },
  en: {
    title: "End of Service & Labor Settlements",
    officeName: "Sabri Shatta Law Firm & Arbitrations",
    lawComplianceBadge: "Compliant with Kuwait Labor Law No. 6 of 2010",
    complianceVerified: "Legally Verified",
    searchPlaceholder: "Search name, civil ID, title...",
    newSettlement: "New Settlement File",
    classification: "Legal Classification",
    allClassifications: "All Classifications",
    statusFilter: "Filter by Status",
    dossierCount: "Labor files",
    serviceDuration: "Total Service Duration",
    years: "Years",
    months: "Months",
    days: "Days",
    netPayable: "Net Approved Paycut",
    kwd: "KWD",
    statutoryCeiling: "Statutory Cap",
    underLimit: "Within Law Range",
    resignationScale: "Resignation Scale (Art. 51)",
    firstFiveYears: "First 5 Years",
    beyondFiveYears: "Beyond 5 Years",
    calculationsTab: "Calculation Engine",
    documentsTab: "Legal Forms",
    approvalsTab: "Sign-offs & Workflow",
    dependenciesTab: "Clearances & Debts",
    basicSalary: "Basic Salary",
    allowances: "Fixed Allowances",
    joiningDate: "Hired Date",
    lastWorkingDay: "Last Working Day",
    leaveBalance: "Unused Leave Days",
    absenceDays: "Unexcused Absence (Days)",
    totalEarnings: "Total Earnings",
    totalDeductions: "Total Deductions",
    saveDossier: "Sync & Update Dossier",
    formulasBreakdown: "Detailed Mathematical Formulas",
    dailyWageBasis: "Daily Wage Basis (26 Days Divisor)",
    dailyRate: "Daily Wage Rate",
    formulaUsed: "Equation applied for Art.51 gr",
    formulaSample: "Basic salary + Allowances / 26 = Daily wage basis",
    mathTransparency: "Math Transparency Audit (Art. 51)",
    signaturesSec: "Waiver & Administrative Signatures Matrix",
    employeeSignature: "Employee Handover Sign (Absolute Release)",
    hrApproval: "HR Specialist Audit & Stamp",
    legalApproval: "Legal Consultation of Sabri Shatta",
    financeApproval: "Audit of Treasury & bank transfer",
    assetsClearance: "Physical Asset & Inventory Clearances",
    laptopHandover: "Corporate Laptop & Devices Handover",
    badgeHandover: "Access Badge & Digital Accounts",
    keysHandover: "Physical Keys & Office Drawer Release",
    carHandover: "Company Fleet car Transfer",
    returnedStatus: "Returned & Safe ✔",
    pendingStatus: "Under Review ⏳",
    lostStatus: "Lost - Offset Value Deducted",
    bankLinkage: "Clearing & Bank Wire Remittances",
    targetBank: "Remitted Kuwait Bank",
    bankReceipt: "Wire Transfer ID Number",
    ibanCode: "Receiver IBAN Number",
    printDeed: "Print Official Document",
    exportWord: "Export to Word",
    lawFirmStationery: "Certified Letterhead of Sabri Shatta Law Firm",
    printTitle: "Receipt of Service Clearances & General Discharge Act",
    phone: "Tel: +965 22000000",
    email: "Email: info@shatta-law.com",
    address: "Address: Al-Qibla Tower, Sharq, Kuwait",
    pageOf: "Page 1 of 1",
    verificationAr: "Digitally certified by Sabri Shatta under the supervision of Kuwait Labor Affairs",
    qrLabel: "Scan to Verify QR",
    unpaidLeaveDeduction: "Absence Deductions",
    notCertified: "Unapproved",
    draft: "Draft",
    reviewing: "Under Review",
    certified: "Discharged",
    approved: "Disbursed",
    activeDossier: "Active Labor Dossier",
    litigationEscalation: "Escalate dossier to Court Case"
  }
};

export default function EndOfServicePage() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const tObj = translations[isAr ? 'ar' : 'en'];

  // Command center active module state
  // Modules: 'dashboard' | 'dossiers' | 'calculations' | 'disputes' | 'clearance' | 'assets' | 'documents' | 'reports' | 'amicable'
  const [activeModule, setActiveModule] = useState<'dashboard' | 'dossiers' | 'calculations' | 'disputes' | 'clearance' | 'assets' | 'documents' | 'reports' | 'amicable'>('dashboard');

  // Global Cases State
  const [savedCases, setSavedCases] = useState<EOS_Settlement[]>(() => {
    const cached = localStorage.getItem('adalah_eos_cases_cache_v3');
    return cached ? JSON.parse(cached) : initialSavedCases;
  });

  useEffect(() => {
    localStorage.setItem('adalah_eos_cases_cache_v3', JSON.stringify(savedCases));
  }, [savedCases]);

  const [activeCaseId, setActiveCaseId] = useState<string>(() => {
    return savedCases.length > 0 ? savedCases[0].id : '';
  });
  
  // Modals / Overlays
  const [wizardOpen, setWizardOpen] = useState<boolean>(false);
  const [editCase, setEditCase] = useState<EOS_Settlement | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const [disputeModalOpen, setDisputeModalOpen] = useState<boolean>(false);
  
  // Search & Filter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterClassification, setFilterClassification] = useState<string>('ALL');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  
  // active Role (for approvals)
  const [activeRole, setActiveRole] = useState<'hr' | 'legal' | 'finance' | 'gm'>('hr');

  // Multi-Step Asset Clearances Tracker for Selected Worker
  const [checkedAssets, setCheckedAssets] = useState({
    laptop: 'returned',
    badge: 'returned',
    keys: 'returned',
    car: 'returned'
  });

  // Dispute escalation text
  const [disputeMemo, setDisputeMemo] = useState<string>('');

  const activeCase = useMemo(() => {
    return savedCases.find(c => c.id === activeCaseId) || savedCases[0] || null;
  }, [savedCases, activeCaseId]);

  // Adjust assets checks whenever worker shifts
  useEffect(() => {
    if (activeCase) {
      setCheckedAssets({
        laptop: 'returned',
        badge: 'returned',
        keys: 'returned',
        car: 'returned'
      });
      setAiActive(false);
      setAiReport('');
    }
  }, [activeCaseId]);

  // Inline calculation state values
  const [inlineValues, setInlineValues] = useState({
    basicSalary: 0,
    allowances: 0,
    leaveDays: 0,
    absenceDays: 0,
    otherAdditions: 0,
    disciplinaryDeductions: 0
  });

  useEffect(() => {
    if (activeCase) {
      setInlineValues({
        basicSalary: activeCase.basicSalary,
        allowances: activeCase.allowances || 0,
        leaveDays: activeCase.leaveBalanceDays || 0,
        absenceDays: activeCase.absenceDays || 0,
        otherAdditions: activeCase.otherBonuses || 0,
        disciplinaryDeductions: activeCase.disciplinaryDeductions || 0
      });
    }
  }, [activeCase]);

  // Run Real-time calculation math of the selected employee
  const liveCalculations = useMemo(() => {
    if (!activeCase) return null;
    
    // Deduct missing assets
    let assetDeductions = 0;
    if (checkedAssets.laptop === 'lost') assetDeductions += 450;
    if (checkedAssets.badge === 'lost') assetDeductions += 15;
    if (checkedAssets.keys === 'lost') assetDeductions += 25;
    if (checkedAssets.car === 'lost') assetDeductions += 2800;

    const res = calculateKuwaitEOS({
      joiningDate: activeCase.joiningDate,
      lastWorkingDay: activeCase.lastWorkingDay,
      basicSalary: inlineValues.basicSalary,
      allowances: inlineValues.allowances,
      terminationReason: activeCase.terminationReason as TerminationReasonKuwait,
      paySystem: 'شهري',
      leaveEntitlement: 30,
      leaveTaken: 0,
      leaveAdjustment: inlineValues.leaveDays,
      noticeAction: 'WorkDuringNotice',
      otherAdditions: inlineValues.otherAdditions,
      deductions: activeCase.loansDeduction + assetDeductions,
      absenceDays: inlineValues.absenceDays,
      socialInsuranceDeduction: activeCase.socialInsuranceDeduction || 0,
      disciplinaryDeductions: inlineValues.disciplinaryDeductions,
    });

    return {
      indemnity: res.indemnityAmount,
      leaveCompensation: res.leavePayAmount,
      absenceDeduct: res.deductionsTotal - assetDeductions - activeCase.loansDeduction - inlineValues.disciplinaryDeductions,
      assetDeductions,
      netPayout: res.netAmount,
      dailyRate: res.indemnityBreakdown.firstFiveYearsAmount > 0 || res.indemnityBreakdown.subsequentYearsAmount > 0 
        ? (inlineValues.basicSalary + inlineValues.allowances) / 26 
        : 0,
      breakdown: res.indemnityBreakdown,
      articles: res.legalArticles
    };
  }, [activeCase, inlineValues, checkedAssets]);

  // Save changes from parameters editor to state
  const handleSaveInlineCalculations = () => {
    if (!activeCase || !liveCalculations) return;
    setSavedCases(prev => prev.map(c => {
      if (c.id === activeCase.id) {
        return {
          ...c,
          basicSalary: inlineValues.basicSalary,
          allowances: inlineValues.allowances,
          leaveBalanceDays: inlineValues.leaveDays,
          absenceDays: inlineValues.absenceDays,
          otherBonuses: inlineValues.otherAdditions,
          disciplinaryDeductions: inlineValues.disciplinaryDeductions,
          indemnityAmount: liveCalculations.indemnity,
          leaveBalanceAmount: liveCalculations.leaveCompensation,
          netPayable: liveCalculations.netPayout,
          notes: c.notes + `\n[تم إعادة تعديل الحسبة يدوياً في ${new Date().toLocaleDateString()}]`
        };
      }
      return c;
    }));
    alert(isAr ? 'تمت مزامنة وحفظ التحديثات المالية بنجاح' : 'Financial recalculations updated and sync\'d successfully.');
  };

  // AI Auditor with Gemini
  const [aiReport, setAiReport] = useState<string>('');
  const [aiActive, setAiActive] = useState<boolean>(false);
  const [aiPending, setAiPending] = useState<boolean>(false);

  const triggerLegalAuditAI = async (mode: 'audit' | 'risk' | 'recs') => {
    if (!activeCase || !liveCalculations) return;
    setAiPending(true);
    setAiActive(true);
    setAiReport('');
    
    let query = '';
    if (mode === 'audit') {
      query = `أنت الخبير القانوني بمكتب صبري شطا للمحاماة والاستشارات القانونية بدولة الكويت. راجع الحسبة الودية لـ:
      العامل: ${activeCase.employeeName}
      نوع المغادرة والسبب: ${activeCase.terminationReason}
      الراتب الكلي: ${Number(inlineValues.basicSalary) + Number(inlineValues.allowances)} د.ك.
      سنوات الخدمة: ${activeCase.serviceYears} سنة.
      المكافأة المحتسبة: ${liveCalculations.indemnity} د.ك.
      رصيد الإجازات: ${inlineValues.leaveDays} يوماً.
      هل الحسبة مطابقة تماماً لمقتضى المادة 51، 53 والمادة 26 من قانون العمل الكويتي في القطاع الأهلي؟ وضح الدليل القانوني بوضوح بلغة المحاماة كأنك المستشار المعتمد.`;
    } else if (mode === 'risk') {
      query = `حلل مخاطر تحويل إنهاء علاقة الموظف ${activeCase.employeeName} ذو الرقم المدني [${activeCase.employeeId}] إلى القضاء الكويتي. 
      تفاصيل: الراتب ${inlineValues.basicSalary} د.ك، المغادرة بسبب: ${activeCase.terminationReason}، الاقتطاع من القروض الشخصية: ${activeCase.loansDeduction} د.ك والعهود العينية الضائعة: ${liveCalculations.assetDeductions} د.ك.
      ما نسبة نشوء نزاع أمام الهيئة العامة للقوى العاملة وكيف نواجه طعن مادة 41 بخصوص حرمان العمال؟`;
    } else {
      query = `أنت المستشار القانوني لمكتب صبري شطا للمحاماة والاستشارات القانونية والتحكيم بمدينة الكويت. الموظف ${activeCase.employeeName} يطالب ببدلات إضافية بعد تسييل مخالصة قيمتها ${liveCalculations.netPayout} د.ك. ما هي الإجراءات والتدابير الوقائية ومحضر مخالصة التوقيع المانع للجهالة والتنازل النهائي لتفادي الطعون؟ صغ مذكرة قوية.`;
    }

    try {
      const result = await geminiService.generateContent(query);
      setAiReport(result);
    } catch (err) {
      setAiReport(`فشل استدعاء تدقيق Gemini الذكي: ${err instanceof Error ? err.message : 'عطل فني في شبكة الربط والاتصال بالذكاء الاصطناعي'}`);
    } finally {
      setAiPending(false);
    }
  };

  const handleTransitionToLaborCase = () => {
    if (!activeCase || !liveCalculations) return;
    setDisputeMemo(`تأسست المسودة القضائية لمكتب صبري شطا للمطالبة بملف براءة ذمة السيد/ ${activeCase.employeeName}.
القيمة المنازع عليها: ${liveCalculations.netPayout.toLocaleString(undefined, { minimumFractionDigits: 3 })} دينار كويتي.
سبب الاختلاف: تسييل الخصومات العقدية ورفض تصفية العهد والمديونيات الشخصية بموجب اللائحة الداخلية للجزاءات.`);
    setDisputeModalOpen(true);
  };

  const confirmDisputeTransition = () => {
    if (!activeCase) return;
    setSavedCases(prev => prev.map(c => {
      if (c.id === activeCase.id) {
        return {
          ...c,
          status: 'UnderHRReview',
          notes: `[تصعيد للتحكيم والقضاء الكويتي] - نشأ نزاع قانوني مبرم: ${disputeMemo}`
        };
      }
      return c;
    }));
    setDisputeModalOpen(false);
    alert(isAr ? 'تم تصعيد الملف بنجاح وتأسيس مسج النزاع أمام القضاء الكويتي.' : 'File successfully escalated to active dispute, logging reference in the courts ledger.');
  };

  // Document sign-off delegation
  const handleDocumentSignOff = (updatedSignatures: any, updatedApprovals: any, comment: string) => {
    if (!activeCase) return;
    setSavedCases(prev => prev.map(c => {
      if (c.id === activeCase.id) {
        return {
          ...c,
          signatures: {
            ...c.signatures,
            ...updatedSignatures
          },
          approvals: {
            ...c.approvals,
            ...updatedApprovals
          },
          notes: c.notes + (comment ? `\n[ملاحظة كفيل من ${activeRole.toUpperCase()}]: ${comment}` : '')
        };
      }
      return c;
    }));
    
    alert(isAr ? 'تم إدراج توقيعك السحابي الرقمي وختم السند المعزز بنجاح' : 'Digital signature and certified stamp affixed in record.');
  };

  // Delete Case Handler
  const handleDeleteCase = (id: string) => {
    if (confirm(isAr ? 'هل أنت متأكد من حذف هذا السند العمالي نهائياً؟' : 'Are you sure you want to permanently delete this record?')) {
      const remaining = savedCases.filter(c => c.id !== id);
      setSavedCases(remaining);
      if (activeCaseId === id && remaining.length > 0) {
        setActiveCaseId(remaining[0].id);
      }
    }
  };

  // Wizard saves
  const handleSaveCase = (record: EOS_Settlement) => {
    setSavedCases(prev => {
      const idx = prev.findIndex(c => c.id === record.id);
      if (idx !== -1) {
        return prev.map(c => c.id === record.id ? record : c);
      } else {
        return [record, ...prev];
      }
    });
    setActiveCaseId(record.id);
    setWizardOpen(false);
    setEditCase(null);
  };

  // Sidebar queries and tag filtering logic
  const filteredCases = useMemo(() => {
    return savedCases.filter(c => {
      const matchSearch = searchTerm.trim() === '' || 
        c.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.jobTitle && c.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchClass = filterClassification === 'ALL' || c.terminationReason === filterClassification;
      
      const matchStatus = selectedStatuses.length === 0 || selectedStatuses.includes(c.status);

      return matchSearch && matchClass && matchStatus;
    });
  }, [savedCases, searchTerm, filterClassification, selectedStatuses]);

  // Pre-calculated statuses mapping list
  const statusesCatalog = [
    { id: 'Completed', labelAr: 'مغلق ومسدد', labelEn: 'Completed', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { id: 'PendingReview', labelAr: 'بانتظار المراجعة', labelEn: 'Pending Review', color: 'bg-amber-50 text-amber-700 border-amber-100' },
    { id: 'UnderFinancialReview', labelAr: 'تدقيق مالي', labelEn: 'Financial Review', color: 'bg-rose-50 text-rose-700 border-rose-100' },
    { id: 'UnderHRReview', labelAr: 'متنازع عليه', labelEn: 'Disputed', color: 'bg-violet-50 text-violet-700 border-violet-100' }
  ];

  // Handler to toggle selection on status lists filters
  const handleToggleStatusFilter = (id: string) => {
    setSelectedStatuses(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Formatted numeric values for printing
  const printPrintDate = new Date().toLocaleDateString('ar-KW');

  // Stats for local cases
  const metricsStats = useMemo(() => {
    const totalFiles = savedCases.length;
    const completedCount = savedCases.filter(c => c.status === 'Completed').length;
    const disputeCount = savedCases.filter(c => c.status === 'UnderHRReview').length;
    const pendingCount = savedCases.filter(c => c.status === 'PendingReview' || c.status === 'UnderFinancialReview').length;
    const totalPayouts = savedCases.reduce((sum, c) => sum + c.netPayable, 0);
    return { totalFiles, completedCount, disputeCount, pendingCount, totalPayouts };
  }, [savedCases]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans text-slate-800 antialiased selection:bg-[#00796B]/20 selection:text-[#00796B]" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* 1. SOPHISTICATED FULL-STEEL BREADCRUMB HEADER */}
      <header className="bg-gradient-to-r from-slate-900 via-[#0a4d44] to-slate-900 border-b border-emerald-990 py-6 px-6 sm:px-10 shadow-lg text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="text-right">
            {/* Breadcrumb links */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-200 opacity-80 mb-2">
              <span>{tObj.officeName}</span>
              <ChevronLeft className="w-3.5 h-3.5 opacity-65 shrink-0" />
              <span>إدارة شؤون الموظفين</span>
              <ChevronLeft className="w-3.5 h-3.5 opacity-65 shrink-0" />
              <span className="text-emerald-400">{tObj.title}</span>
            </div>

            {/* Principal Title and Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white font-serif">
                {tObj.title}
              </h1>
              <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-300 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-500/20 select-none">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{tObj.lawComplianceBadge}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-center">
            <button
              onClick={() => {
                setEditCase(null);
                setWizardOpen(true);
              }}
              className="h-10 px-5 rounded-xl text-xs font-black bg-[#E0F2F1] text-[#004D40] border border-[#B2DFDB] hover:bg-[#B2DFDB] transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none shadow-md"
              id="btn-add-dossier"
            >
              <Plus className="w-4 h-4" />
              <span>{tObj.newSettlement}</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. ADVANCED METRICS COMMAND BAR */}
      <section className="bg-white border-b border-slate-100 py-4 px-6 md:px-10 shadow-xs select-none">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-right hover:border-emerald-500 transition-all">
            <span className="text-[10px] font-bold text-slate-400 block">إجمالي الملفات الواردة</span>
            <span className="text-xl font-bold text-slate-900 block font-mono mt-1">{metricsStats.totalFiles} <small className="text-xs font-sans text-slate-400">ملفات</small></span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-right hover:border-emerald-500 transition-all">
            <span className="text-[10px] font-bold text-slate-400 block">المخالصات المغلقة والمسددة</span>
            <span className="text-xl font-bold text-emerald-600 block font-mono mt-1">{metricsStats.completedCount} <small className="text-xs font-sans text-slate-400">منجزة</small></span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-right hover:border-emerald-500 transition-all">
            <span className="text-[10px] font-bold text-slate-400 block">منازعات منظورة بالمحكمة</span>
            <span className="text-xl font-bold text-red-600 block font-mono mt-1">{metricsStats.disputeCount} <small className="text-xs font-sans text-red-300">متنازع عليه</small></span>
          </div>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-right hover:border-emerald-500 transition-all">
            <span className="text-[10px] font-bold text-slate-400 block">التدقيق والاعتماد المالي</span>
            <span className="text-xl font-bold text-amber-600 block font-mono mt-1">{metricsStats.pendingCount} <small className="text-xs font-sans text-slate-400">تحت المراجعة</small></span>
          </div>
          <div className="p-3 bg-[#00796B]/5 rounded-2xl border border-[#00796B]/10 text-right col-span-2 md:col-span-1 hover:border-emerald-500 transition-all">
            <span className="text-[10px] font-bold text-[#00796B] block">صافي الحوالت المدفوعة (د.ك)</span>
            <span className="text-xl font-black text-[#00796B] block font-mono mt-1">{metricsStats.totalPayouts.toLocaleString(undefined, { maximumFractionDigits: 0 })} <small className="text-[9px] font-sans text-slate-500">KWD</small></span>
          </div>
        </div>
      </section>

      {/* 3. CORE TWO-COLUMN LUXURY SUITE INTERFACES */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* A. SHINY SIDEBAR NAVIGATION CONTROLS */}
          <div className="lg:col-span-3 space-y-4">
            
            <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-right">
              <div>
                <h3 className="text-sm font-black text-[#00796B] border-b border-slate-100 pb-2 flex items-center gap-2 justify-end">
                  <Scale className="w-4 h-4 text-[#00796B]" />
                  <span>مركز إجراءات نهاية الخدمة</span>
                </h3>
              </div>
              
              {/* Category 1: الرصد والمتابعة */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 block px-2 mb-1 uppercase tracking-wider">الرصد والمتابعة العمالية</span>
                <button
                  onClick={() => setActiveModule('dashboard')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${activeModule === 'dashboard' ? 'bg-[#00796B]/10 text-[#00796B] font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 shrink-0 text-[#00796B]" />
                    <span>لوحة تحليلات نهاية الخدمة</span>
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">ملخص</span>
                </button>

                <button
                  onClick={() => setActiveModule('dossiers')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${activeModule === 'dossiers' ? 'bg-[#00796B]/10 text-[#00796B] font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <FolderClosed className="w-4 h-4 shrink-0 text-[#00796B]" />
                    <span>سجل تسويات نهاية الخدمة</span>
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-800 rounded">{savedCases.length}</span>
                </button>
              </div>

              {/* Category 2: الاحتساب والتسوية */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 block px-2 mb-1 uppercase tracking-wider">العمليات الحسابية والتسوية</span>
                <button
                  onClick={() => setActiveModule('calculations')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${activeModule === 'calculations' ? 'bg-[#00796B]/10 text-[#00796B] font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <Calculator className="w-4 h-4 shrink-0 text-[#00796B]" />
                    <span>محرك احتساب نهاية الخدمة</span>
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded font-mono">المدقق</span>
                </button>

                <button
                  onClick={() => setActiveModule('assets')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${activeModule === 'assets' ? 'bg-[#00796B]/10 text-[#00796B] font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <Laptop className="w-4 h-4 shrink-0 text-[#00796B]" />
                    <span>عهد وأصول الموظف</span>
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-50 text-amber-800 rounded">العهود</span>
                </button>
              </div>

              {/* Category 3: الاعتمادات والنزاعات */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 block px-2 mb-1 uppercase tracking-wider">الاعتمادات وإدارة العلاقات</span>
                <button
                  onClick={() => setActiveModule('disputes')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${activeModule === 'disputes' ? 'bg-[#00796B]/10 text-[#00796B] font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4 shrink-0 text-[#00796B]" />
                    <span>نزاعات وعلاقات العمل</span>
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-red-50 text-red-800 rounded">{savedCases.filter(c => c.status === 'UnderHRReview').length}</span>
                </button>

                <button
                  onClick={() => setActiveModule('clearance')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${activeModule === 'clearance' ? 'bg-[#00796B]/10 text-[#00796B] font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <Stamp className="w-4 h-4 shrink-0 text-[#00796B]" />
                    <span>مصفوفة التوقيعات والاعتمادات</span>
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">المخالصة</span>
                </button>
              </div>

              {/* Category 4: المستندات والمعاملات */}
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 block px-2 mb-1 uppercase tracking-wider">النماذج والمستندات القانونية</span>
                <button
                  onClick={() => setActiveModule('documents')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${activeModule === 'documents' ? 'bg-[#00796B]/10 text-[#00796B] font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 shrink-0 text-[#00796B]" />
                    <span>الحقيبة الشاملة للمستندات</span>
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-blue-50 text-blue-800 rounded">10 نماذج</span>
                </button>

                <button
                  onClick={() => setActiveModule('amicable')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${activeModule === 'amicable' ? 'bg-[#00796B]/10 text-[#00796B] font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 shrink-0 text-[#00796B]" />
                    <span>صيغ التسوية والصلح الودي</span>
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-purple-50 text-purple-800 rounded">شطا</span>
                </button>

                <button
                  onClick={() => setActiveModule('reports')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer text-xs font-bold transition-all ${activeModule === 'reports' ? 'bg-[#00796B]/10 text-[#00796B] font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <span className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 shrink-0 text-[#00796B]" />
                    <span>تقارير الهيئة العامة للقوى العاملة</span>
                  </span>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">الوزارة</span>
                </button>
              </div>

            </div>

            {/* Quick help reference detailing Kuwait Labor Law */}
            <div className="bg-slate-900 border border-slate-800 text-emerald-300 rounded-3xl p-5 select-none space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-400" />
                <h4 className="text-xs font-bold font-serif text-white">مرشد قانون العمل الكويتي</h4>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed font-tajawal">
                بموجب القانون رقم 6 لسنة 2010، يستحق العامل عند انتهاء خدمته مكافأة تحسب على النحو التالي:
              </p>
              <ul className="text-[10px] space-y-1.5 text-slate-400 pr-3 pl-3">
                <li>• <strong className="text-slate-200">الأجر اليومي</strong>: الراتب الأساسي + البدلات مقسوماً على 26.</li>
                <li>• <strong className="text-slate-200">أول 5 سنوات</strong>: 15 يوماً من الأجر اليومي عن كل سنة.</li>
                <li>• <strong className="text-slate-200">السنوات التالية</strong>: 30 يوماً من الأجر اليومي عن كل سنة.</li>
                <li>• <strong className="text-slate-200">رصيد الإجازات</strong>: يستحق عنها العامل تعويضاً نقدياً على أساس آخر أجر يومي.</li>
              </ul>
            </div>

          </div>

          {/* B. MAIN INTERACTIVE CONTENT PORTIONS (TAB SWITCH PANEL) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* MODULE 1: SUMMARY DASHBOARD */}
            {activeModule === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Visual Banner introducing the Law Suite */}
                <div className="bg-gradient-to-br from-emerald-900 to-[#12302d] rounded-3xl p-6 text-white relative overflow-hidden shadow-md text-right">
                  <div className="relative z-10 space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold font-serif">نظام التصفية العمالية الموثق الموحد (Adalah EOS Gateway)</h2>
                    <p className="text-xs text-slate-200 max-w-xl font-tajawal leading-relaxed">
                      يدعم هذا المحرك رصد موازنات الكوادر، تسييل الإجازات السنوية، جرد العهد وإيقاع الخصومات القانونية، وحوكمة براءة الذمة للشركات والمؤسسات بامتثال تام للوزارة والمحاكم بدولة الكويت.
                    </p>
                    <div className="pt-2 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">المادة 51: مكافأة الخدمة</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">المادة 53: الاستقالة</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">المادة 70: أرصدة الإجازات كاش</span>
                    </div>
                  </div>
                  <div className="absolute left-4 bottom-0 top-0 opacity-10 flex items-center pointer-events-none">
                    <Scale className="w-48 h-48" />
                  </div>
                </div>

                {/* Grid for Quick Stats Detail and Visual Charts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Active dossiers list overview */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-right space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                      <button 
                        onClick={() => setActiveModule('dossiers')} 
                        className="text-[10.5px] font-black text-[#00796B] hover:underline cursor-pointer border-none bg-transparent"
                      >
                        عرض الكل
                      </button>
                      <h3 className="text-xs font-black text-slate-800">الملفات النشطة المكتملة حديثاً</h3>
                    </div>

                    <div className="space-y-3">
                      {savedCases.map(c => (
                        <div key={c.id} onClick={() => { setActiveCaseId(c.id); setActiveModule('calculations'); }} className="p-3 bg-slate-50 hover:bg-[#00796B]/5 border border-slate-100 rounded-2xl flex items-center justify-between transition-colors cursor-pointer text-right">
                          <span className="text-xs font-mono font-black text-[#00796B]">{c.netPayable.toLocaleString()} د.ك</span>
                          <div>
                            <span className="text-xs font-extrabold text-slate-800 block leading-tight">{c.employeeName}</span>
                            <span className="text-[10px] text-slate-400 block font-semibold mt-1">{c.jobTitle} • {c.nationality}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Highlights of Case Management System link & recent legal alerts */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-right space-y-4">
                    <h3 className="text-xs font-black text-slate-800 pb-2 border-b border-slate-50">توجيهات الامتثال القضائي لـ مكتب صبري شطا</h3>
                    
                    <div className="space-y-4">
                      
                      <div className="flex gap-3 text-right">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                          <BadgeAlert className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[11px] font-extrabold text-slate-800">تنبيه المادة 41 للفصل التأديبي</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                            يُحرم الموظف تماماً من مكافأة نهاية الخدمة في حال تم إثبات غيابه المتصل لأكثر من 7 أيام متتالية، أو منفصلاً لعشرين يوماً طبقاً لقرارات المحقق المعتمد.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 text-right">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#00796B] flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[11px] font-extrabold text-slate-800">تسييل رصيد الإجازات السنوية المريح</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                            الحد الأدنى للاحتساب هو قسمة الراتب الإجمالي الأخير على 26 ثم الضرب في عدد أيام رصيد الإجازات المتراكمة. يمنع منعا باتا استخدام أساس 30 يوماً عمالاً بالشرق.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 text-right">
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[11px] font-extrabold text-slate-800">استخدام مساعد الذكاء الاصطناعي</h4>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-bold">
                            الرجاء تفعيل Adala Legal AI للتأكد من خلو مذكرات تصفية الخدمة المزدوجة من أي أخطاء ثنائية لغوية قد تتسبب في بطلان المخالصة الإبرائية المطلقة.
                          </p>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Central Statistics Graphs & charts (D3 / Recharts fallback visually beautiful representation) */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-right space-y-4">
                  <h3 className="text-xs font-black text-slate-800 pb-2 border-b border-slate-50">توزيع المغادرات والمنطلقات العمالية بالشرق</h3>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-4 max-w-sm w-full">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-500">منجزة ومغلقة نهائياً</span>
                        <span className="text-[#00796B] font-mono">65%</span>
                      </div>
                      <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#00796B] h-2 rounded-full" style={{ width: '65%' }} />
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-500">تحت المراجعة والتدقيق المالي</span>
                        <span className="text-amber-650 font-mono">20%</span>
                      </div>
                      <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: '20%' }} />
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-500">متنازع عليها وتداول مادة 53</span>
                        <span className="text-rose-650 font-mono">15%</span>
                      </div>
                      <div className="w-full bg-slate-150 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-2 rounded-full" style={{ width: '15%' }} />
                      </div>
                    </div>

                    <div className="flex-1 bg-slate-50 border p-4 rounded-2xl text-center space-y-3">
                      <p className="text-[11px] font-bold text-slate-400">توجيه الشركاء</p>
                      <h4 className="text-sm font-black text-slate-800">التحالف مع الهيئة العامة للقوى العاملة</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-bold">
                        نوصي دائماً بتثبيت مخالصات إبراء الذمة وصيغ التنازل باللغتين طبقاً للنص الموحد المحدث بالسيستيم لعدم الطعن أمام دوائر الأجور بالمحكمة الكلية.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* MODULE 2: DOSSIERS CABINET TABLE */}
            {activeModule === 'dossiers' && (
              <div className="space-y-4">
                
                {/* Advanced Multi-Filter controls card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4 text-right">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-50 select-none">
                    <h3 className="text-xs font-black text-slate-800">أدوات الفرز المتقدمة للملفات الكلية</h3>
                    <div className="flex gap-2">
                       <button onClick={() => setSearchTerm('')} className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold h-8 px-3 rounded-lg border-none cursor-pointer">إعادة تعيين</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5 focus-within:border-[#00796B]">
                      <label className="text-[10px] font-extrabold text-slate-400 block">البحث بالاسم أو الرقم المدني</label>
                      <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder={tObj.searchPlaceholder}
                          className="w-full h-10 pr-9 pl-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-700 text-right focus:outline-none focus:border-[#00796B] font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 block">{tObj.classification}</label>
                      <select
                        value={filterClassification}
                        onChange={(e) => setFilterClassification(e.target.value)}
                        className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-Tajawal font-bold text-slate-700 outline-none cursor-pointer focus:border-[#00796B]"
                      >
                        <option value="ALL">{tObj.allClassifications}</option>
                        <option value={TerminationReasonKuwait.RESIGNATION}>الاستقالة المادة 53</option>
                        <option value={TerminationReasonKuwait.DISMISSAL_WITH_NOTICE}>إنهاء جهة العمل مع إخطار</option>
                        <option value={TerminationReasonKuwait.DISMISSAL_WITHOUT_NOTICE_ART_41}>فصل تأديبي مادة 41</option>
                        <option value={TerminationReasonKuwait.CONTRACT_EXPIRY}>انتهاء العقد محدد المدة</option>
                        <option value={TerminationReasonKuwait.ORGANIZATIONAL_REDUNDANCY}>إنهاء لإعادة التنظيم والتقليص</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 block">{tObj.statusFilter}</label>
                      <div className="flex flex-wrap gap-1.5 pt-1 select-none">
                        {statusesCatalog.map(st => {
                          const isSelected = selectedStatuses.includes(st.id);
                          return (
                            <button
                              key={st.id}
                              onClick={() => handleToggleStatusFilter(st.id)}
                              className={`px-2.5 py-1 rounded-lg text-[9px] font-black border transition-all cursor-pointer ${isSelected ? 'bg-[#00796B] text-white border-[#00796B]' : 'bg-slate-50 text-slate-650 border-slate-100'}`}
                            >
                              {isAr ? st.labelAr : st.labelEn}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real interactive table grid */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm text-right">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse select-none text-[11px] font-tajawal text-right">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-100">
                          <th className="p-4">سند التصفية والاسم</th>
                          <th className="p-4">المركبة المالية / الراتب</th>
                          <th className="p-4">أعوام الخدمة</th>
                          <th className="p-4">السبب القانوني للمغادرة</th>
                          <th className="p-4">الحالة والاعتماد</th>
                          <th className="p-4 text-left">التعديل والطباعة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredCases.map(c => {
                          const statusInfo = statusesCatalog.find(s => s.id === c.status) || { labelAr: c.status, color: 'bg-slate-50 text-slate-700' };
                          return (
                            <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4">
                                <span className="font-mono text-[#00796B] font-black block text-[10px]">{c.settlementNumber || c.id}</span>
                                <span className="font-extrabold text-slate-800 block text-xs mt-0.5">{c.employeeName}</span>
                                <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">{c.jobTitle} • {c.nationality}</span>
                              </td>
                              <td className="p-4">
                                <span className="font-mono font-black text-slate-800 text-xs block">{c.netPayable.toLocaleString(undefined, { minimumFractionDigits: 3 })} د.ك</span>
                                <span className="text-[9.5px] text-slate-400 block font-semibold mt-0.5">الأساسي: {c.basicSalary} • البدلات: {c.allowances || 0}</span>
                              </td>
                              <td className="p-4">
                                <span className="font-bold text-slate-800 block">{c.serviceYears} سنة و {c.serviceMonths} شهر</span>
                                <span className="text-[9.5px] text-slate-400 block font-semibold mt-0.5">{c.joiningDate} ➔ {c.lastWorkingDay}</span>
                              </td>
                              <td className="p-4 max-w-[150px] truncate">
                                <span className="text-slate-650 font-bold block">{c.terminationReason}</span>
                                <span className="text-[9px] bg-[#00796B]/5 text-[#00796B] font-extrabold px-1.5 py-0.5 rounded font-mono mt-1 inline-block">مادة {c.legalArticles?.join('، ') || '51'}</span>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex px-2 py-0.5 rounded text-[9.5px] font-black border ${statusInfo.color}`}>
                                  {isAr ? statusInfo.labelAr : c.status}
                                </span>
                              </td>
                              <td className="p-4 text-left font-bold space-x-1 space-x-reverse">
                                <button
                                  onClick={() => { setActiveCaseId(c.id); setActiveModule('calculations'); }}
                                  className="p-1.5 text-slate-500 hover:text-[#00796B] hover:bg-slate-100 rounded-lg cursor-pointer border-none bg-transparent"
                                  title="عرض التصفية والدراسة"
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => { setEditCase(c); setWizardOpen(true); }}
                                  className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-lg cursor-pointer border-none bg-transparent"
                                  title="تعديل السند بالمعالج"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCase(c.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-650 hover:bg-slate-100 rounded-lg cursor-pointer border-none bg-transparent"
                                  title="حذف نهائي"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredCases.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-12 text-center text-slate-400 font-bold font-Tajawal">
                              لا توجد سجلات مطابقة لمعايير البحث والفرز المحددة.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* MODULE 3: CALCULATIONS INTERACTIVE WORKSTATION */}
            {activeModule === 'calculations' && (
              <div className="space-y-6">
                
                {/* Visual Header displaying the active worker */}
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-right flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#00796B] bg-[#00796B]/5 px-2 py-0.5 rounded">{tObj.activeDossier}</span>
                    <h3 className="text-sm font-black text-slate-800 mt-1">{activeCase ? activeCase.employeeName : 'يرجى اختيار ملف'}</h3>
                    <p className="text-[10.5px] text-slate-400 font-bold leading-none">{activeCase ? `${activeCase.jobTitle} • الرقم المدني: ${activeCase.employeeId}` : ''}</p>
                  </div>

                  <div className="flex gap-2 select-none font-Tajawal font-bold text-xs shrink-0 cursor-pointer">
                    <select
                      value={activeCaseId}
                      onChange={(e) => setActiveCaseId(e.target.value)}
                      className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-sans text-slate-700 focus:outline-none"
                    >
                      {savedCases.map(c => (
                        <option key={c.id} value={c.id}>{c.employeeName} ({c.id})</option>
                      ))}
                    </select>
                  </div>
                </div>

                {activeCase ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start text-right">
                    
                    {/* Parameters Sandbox Column */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Financial Inputs adjustment card */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-50 select-none">
                          <button onClick={handleSaveInlineCalculations} className="bg-[#00796B] hover:bg-[#004D40] text-white text-[10px] font-black h-8 px-4 rounded-lg cursor-pointer border-none">
                            {tObj.saveDossier}
                          </button>
                          <h3 className="text-xs font-black text-slate-850">معايير موازنة الراتب وتحسين الأجور</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-tight block">{tObj.basicSalary}</label>
                            <input
                              type="number"
                              value={inlineValues.basicSalary}
                              onChange={(e) => setInlineValues(prev => ({ ...prev, basicSalary: Number(e.target.value) }))}
                              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-left"
                            />
                            <div className="pt-2">
                              <input
                                type="range"
                                min={200}
                                max={3000}
                                step={50}
                                value={inlineValues.basicSalary}
                                onChange={(e) => setInlineValues(prev => ({ ...prev, basicSalary: Number(e.target.value) }))}
                                className="w-full accent-[#00796B] cursor-pointer"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-[#00796B] uppercase tracking-tight block">{tObj.allowances}</label>
                            <input
                              type="number"
                              value={inlineValues.allowances}
                              onChange={(e) => setInlineValues(prev => ({ ...prev, allowances: Number(e.target.value) }))}
                              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-left"
                            />
                            <div className="pt-2">
                              <input
                                type="range"
                                min={0}
                                max={2000}
                                step={50}
                                value={inlineValues.allowances}
                                onChange={(e) => setInlineValues(prev => ({ ...prev, allowances: Number(e.target.value) }))}
                                className="w-full accent-[#00796B] cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-400 block">{tObj.leaveBalance}</label>
                            <input
                              type="number"
                              value={inlineValues.leaveDays}
                              onChange={(e) => setInlineValues(prev => ({ ...prev, leaveDays: Number(e.target.value) }))}
                              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-left"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-block text-slate-400 block">{tObj.absenceDays}</label>
                            <input
                              type="number"
                              value={inlineValues.absenceDays}
                              onChange={(e) => setInlineValues(prev => ({ ...prev, absenceDays: Number(e.target.value) }))}
                              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 text-left"
                            />
                          </div>
                        </div>

                      </div>

                      {/* Collapsible Math Formula & Law references block */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                        <h3 className="text-xs font-black text-slate-800 pb-2 border-b border-slate-50 flex items-center gap-1.5 select-none">
                          <BookOpen className="w-4 h-4 text-[#00796B]" />
                          <span>{tObj.formulasBreakdown}</span>
                        </h3>

                        <div className="space-y-3 text-xs leading-relaxed text-slate-650">
                          
                          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/50">
                            <span className="text-[10px] font-black text-[#00796B] uppercase tracking-wider block mb-1">{tObj.dailyWageBasis}</span>
                            <code className="font-mono text-slate-900 font-extrabold block text-start">{tObj.formulaSample}</code>
                            <div className="font-mono text-[10.5px] font-black text-slate-800 mt-2">
                              {inlineValues.basicSalary} + {inlineValues.allowances} / 26 = {liveCalculations ? liveCalculations.dailyRate.toFixed(3) : 0} {tObj.kwd} معدل الأجر اليومي.
                            </div>
                          </div>

                          <div className="p-3.5 bg-emerald-500/5 rounded-2xl border border-emerald-100">
                            <span className="text-[10px] font-black text-emerald-800 block mb-1">{tObj.mathTransparency}</span>
                            <div className="grid grid-cols-2 gap-4 font-mono select-none text-[10.5px]">
                              <div>
                                <span className="text-slate-400 block text-[9px] font-bold">أول 5 سنوات (١٥ يوماً / سنة):</span>
                                <span className="font-black text-slate-800">
                                  {liveCalculations ? liveCalculations.breakdown.firstFiveYearsAmount.toLocaleString(undefined, { minimumFractionDigits: 3 }) : '0.000'} {tObj.kwd}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400 block text-[9px] font-bold">السنوات التالية (٣٠ يوماً / سنة):</span>
                                <span className="font-black text-slate-800">
                                  {liveCalculations ? liveCalculations.breakdown.subsequentYearsAmount.toLocaleString(undefined, { minimumFractionDigits: 3 }) : '0.000'} {tObj.kwd}
                                </span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                    </div>

                    {/* Financial Summary & AI Compliance Audit Column */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* Live Dues and Net payout receipt card */}
                      <div className="bg-gradient-to-br from-slate-900 to-[#142d2a] text-white border border-slate-950 rounded-3xl p-5 shadow-lg space-y-4">
                        <div className="pb-1.5 border-b border-white/10 select-none flex justify-between items-center">
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded">فوري منجز</span>
                          <h4 className="text-xs font-black text-slate-200">فاتورة الحصاد المالي</h4>
                        </div>

                        <div className="space-y-2.5 font-sans font-bold text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">مكافأة تراكم الخدمة مادة 51:</span>
                            <span className="font-mono">{liveCalculations ? liveCalculations.indemnity.toLocaleString(undefined, { minimumFractionDigits: 3 }) : '0.000'} KWD</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">كاش تسييل الإجازات المتراكمة:</span>
                            <span className="font-mono text-emerald-400">+{liveCalculations ? liveCalculations.leaveCompensation.toLocaleString(undefined, { minimumFractionDigits: 3 }) : '0.000'} KWD</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">رواتب متبقية وعمولات إيجابية:</span>
                            <span className="font-mono text-emerald-400">+{inlineValues.otherAdditions.toLocaleString(undefined, { minimumFractionDigits: 3 })} KWD</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-white/5 pt-2">
                            <span className="text-rose-400 font-extrabold">الخصومات والسلف المعلقة:</span>
                            <span className="font-mono text-rose-450">-{activeCase.loansDeduction.toLocaleString(undefined, { minimumFractionDigits: 3 })} KWD</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-rose-400">عجز الأصول والعهود المفقودة:</span>
                            <span className="font-mono text-rose-450">-{liveCalculations ? liveCalculations.assetDeductions.toLocaleString(undefined, { minimumFractionDigits: 3 }) : '0.000'} KWD</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-rose-400">استقطاع الغيابات والإنقاص اللائحي:</span>
                            <span className="font-mono text-rose-450 text-wrap">-{liveCalculations ? (liveCalculations.absenceDeduct + inlineValues.disciplinaryDeductions).toLocaleString(undefined, { minimumFractionDigits: 3 }) : '0.000'} KWD</span>
                          </div>

                          <div className="pt-3 border-t border-white/10 flex justify-between items-center select-none">
                            <span className="text-xs font-black text-slate-150">{tObj.netPayable}</span>
                            <span className="font-mono text-base font-black text-emerald-300">
                              {liveCalculations ? liveCalculations.netPayout.toLocaleString(undefined, { minimumFractionDigits: 3 }) : '0.000'} د.ك
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 text-[10px] select-none font-bold">
                          <button
                            onClick={handleTransitionToLaborCase}
                            className="h-9 rounded-xl bg-red-600 hover:bg-red-700 text-white cursor-pointer border-none shadow-xs"
                          >
                            تصعيد لنزاع وبلاغ
                          </button>
                          <button
                            onClick={() => setIsPrintModalOpen(true)}
                            className="h-9 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer border-none shadow-xs"
                          >
                            طباعة الصك المروّس
                          </button>
                        </div>
                      </div>

                      {/* Gemini Compliance auditor panel */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-4">
                        <div className="flex justify-between items-center select-none pb-2 border-b border-slate-50">
                          <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                          <h4 className="text-xs font-black text-slate-800">خبير التدقيق والامتثال الذكي (Adala AI)</h4>
                        </div>

                        <p className="text-[10px] text-slate-400 leading-normal font-bold">
                          يتصل هذا المساعد الذاتي بقاعدة التشريعات العمالية بمكافآت الخدمة ومواد فسخ عقود العمل بالدولة. اختر النمط للرد:
                        </p>

                        <div className="grid grid-cols-3 gap-1 select-none font-Tajawal font-bold text-[8.5px] leading-tight">
                          <button
                            onClick={() => triggerLegalAuditAI('audit')}
                            className="px-2 h-9 rounded-lg bg-slate-50 hover:bg-emerald-500/10 border hover:border-emerald-500 hover:text-emerald-800 transition-all cursor-pointer font-bold text-[#00796B]"
                          >
                            تدقيق المواد
                          </button>
                          <button
                            onClick={() => triggerLegalAuditAI('risk')}
                            className="px-2 h-9 rounded-lg bg-slate-50 hover:bg-rose-500/10 border hover:border-rose-500 hover:text-red-800 transition-all cursor-pointer font-bold text-red-650"
                          >
                            تحليل النزاع
                          </button>
                          <button
                            onClick={() => triggerLegalAuditAI('recs')}
                            className="px-2 h-9 rounded-lg bg-slate-50 hover:bg-purple-500/10 border hover:border-purple-500 hover:text-purple-800 transition-all cursor-pointer font-bold text-purple-650"
                          >
                            صياغة مخالصة
                          </button>
                        </div>

                        {aiActive && (
                          <div className="p-4 bg-slate-50 border rounded-2xl min-h-[140px] text-xs font-sans text-slate-700 text-right font-semibold leading-relaxed max-h-[250px] overflow-y-auto">
                            {aiPending ? (
                              <div className="flex flex-col items-center justify-center h-28 space-y-2 select-none">
                                <RefreshCw className="w-5 h-5 text-emerald-600 animate-spin" />
                                <span className="text-[10px] text-slate-400 font-Tajawal">جاري فحص قانون العمل الكويتي ومقارنة المستحقات...</span>
                              </div>
                            ) : (
                              <div className="markdown-body">
                                <ReactMarkdown>{aiReport}</ReactMarkdown>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="bg-white border rounded-3xl p-12 text-center text-slate-400 font- Tajawal font-bold">
                    لا يوجد حالياً أي ملف عمالي نشط بالشرق.
                  </div>
                )}

              </div>
            )}

            {/* MODULE 4: DISPUTES & AMICABLE RESOLUTIONS */}
            {activeModule === 'disputes' && (
              <div className="space-y-6">
                
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-right space-y-4">
                  <h3 className="text-xs font-black text-slate-800 pb-2 border-b border-slate-50">سجل النزاعات وبلاغات الأجور بالمنشأة</h3>
                  <p className="text-[10.5px] text-slate-400 font-bold leading-normal">
                    بموجب المادة 146 من قانون 6/2010، يلتزم مكتب الشؤون الإدارية بإبلاغ الهيئة العامة للقوى العاملة بأي رفض أو خلاف يقع بخصوص تسييل مخالصة إبراء العامل للذمة في السندات كخطوة تجنّب النزاع القضائي.
                  </p>

                  <div className="space-y-3">
                    {savedCases.filter(c => c.status === 'UnderHRReview').map(c => (
                      <div key={c.id} className="p-4 bg-rose-500/5 border border-red-150 rounded-2xl text-right space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] bg-red-100 text-red-850 px-2 py-0.5 rounded font-mono font-black">نزاع متصاعد</span>
                          <h4 className="text-xs font-black text-slate-800">{c.employeeName}</h4>
                        </div>
                        <p className="text-[10.5px] text-slate-600 font-semibold leading-relaxed">
                          {c.notes}
                        </p>
                        <div className="pt-2 border-t border-red-200/50 flex justify-between items-center text-[10px] font-bold text-slate-400">
                          <span>المطالبات: {c.netPayable.toLocaleString()} KWD</span>
                          <span>الرقم المدني: {c.employeeId}</span>
                        </div>
                      </div>
                    ))}
                    {savedCases.filter(c => c.status === 'UnderHRReview').length === 0 && (
                      <div className="p-8 text-center text-slate-400 font-Tajawal font-bold">
                        لا توجد حالياً أي ملفات متنازع عليها أو بلاغات مرفوعة ومستخرجة للوزارة.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* MODULE 5: STAKEHOLDERS STAMPS & APPROVALS CLEARANCES */}
            {activeModule === 'clearance' && (
              <div className="space-y-6">
                
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-right space-y-4">
                  <div className="flex justify-between items-center select-none pb-2 border-b border-slate-50">
                    <div className="flex gap-1.5 leading-none">
                      {(['hr', 'legal', 'finance', 'gm'] as const).map(role => (
                        <button
                          key={role}
                          onClick={() => setActiveRole(role)}
                          className={`px-3 py-1 rounded-lg text-[9.5px] font-bold border transition-all cursor-pointer ${activeRole === role ? 'bg-[#00796B] text-white border-[#00796B] shadow-xs' : 'bg-white text-slate-650 border-slate-150'}`}
                        >
                          {role.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <h3 className="text-xs font-black text-slate-800">مصفوفة توقيع المخالصة واعتمادات الشؤون</h3>
                  </div>

                  <p className="text-[10.5px] text-slate-400 font-semibold leading-normal">
                    لتفادي عقبات المفتش بوزارة القوى العاملة، يجب أن يُصادَق على السند الدائري للموظف بأعمدة التوقيع الأربعة. انقر على التبويبات أعلاه لتمثيل الصفة وإضافة تعليق توثيق بالسيستيم.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between text-right">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">الشؤون الإدارية (HR Specialist)</span>
                        <h4 className="text-xs font-black text-slate-800 mt-1">توقيع تدقيق شؤون الموظفين</h4>
                        <p className="text-[10px] text-slate-500 mt-1.5 font-semibold">
                          {activeCase?.signatures?.hr || 'بانتظار مصادقة الرصيد من المستلم المعتمد.'}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-200 mt-4 flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">الحالة:</span>
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">مكتمل</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between text-right">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">الدراسات والعقود (Legal Counsel)</span>
                        <h4 className="text-xs font-black text-slate-800 mt-1">المصادقة القانونية لمكتب صبري شطا</h4>
                        <p className="text-[10px] text-slate-500 mt-1.5 font-semibold">
                          {activeCase?.signatures?.legal || 'بانتظار تدقيق المواد الدستورية بدقة.'}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-slate-200 mt-4 flex justify-between items-center text-[10px]">
                        <span className="text-slate-400">الحالة:</span>
                        <span className="text-[#00796B] bg-[#00796B]/5 px-2 py-0.5 rounded font-bold">معتمد شطا ✔</span>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* MODULE 6: PHYSICAL ASSETS HANDOVER TRACKER */}
            {activeModule === 'assets' && (
              <div className="space-y-6">
                
                <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm text-right space-y-4">
                  <h3 className="text-xs font-black text-slate-800 pb-2 border-b border-slate-50">تصفية ومقاصة العهد العينية والتأمينية</h3>
                  <p className="text-[10.5px] text-slate-400 font-bold leading-normal">
                    تحوّل العهود غير الملتزمة والمستلمة لموظفين المنشأة إلى مبالغ عجز وعقوبات إدارية تفصيلية تخصم فورياً بالدينار الكويتي من الشيك النهائي أو التحويل البنكي المقاصي.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between hover:border-[#00796B] transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${checkedAssets.laptop === 'returned' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {checkedAssets.laptop === 'returned' ? 'مستلمة ✔' : 'مفقودة - خصم ٤٥٠ د.ك'}
                        </span>
                        <h4 className="text-xs font-black text-slate-850">لابتوب العمل المحمول</h4>
                      </div>
                      <div className="flex gap-2 select-none font-bold text-[9.5px]">
                        <button onClick={() => setCheckedAssets(prev => ({ ...prev, laptop: 'returned' }))} className={`flex-1 h-8 rounded-lg cursor-pointer ${checkedAssets.laptop === 'returned' ? 'bg-[#00796B] text-white border-none' : 'bg-white border text-slate-600'}`}>تم تسليمه</button>
                        <button onClick={() => setCheckedAssets(prev => ({ ...prev, laptop: 'lost' }))} className={`flex-1 h-8 rounded-lg cursor-pointer ${checkedAssets.laptop === 'lost' ? 'bg-red-600 text-white border-none' : 'bg-white border text-slate-600'}`}>مفقود وعقوبة</button>
                      </div>
                    </div>

                    <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between hover:border-[#00796B] transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${checkedAssets.badge === 'returned' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {checkedAssets.badge === 'returned' ? 'مستردة ✔' : 'مفقودة - خصم ١٥ د.ك'}
                        </span>
                        <h4 className="text-xs font-black text-slate-850">بطاقة المرور والدخول الذكي</h4>
                      </div>
                      <div className="flex gap-2 select-none font-bold text-[9.5px]">
                        <button onClick={() => setCheckedAssets(prev => ({ ...prev, badge: 'returned' }))} className={`flex-1 h-8 rounded-lg cursor-pointer ${checkedAssets.badge === 'returned' ? 'bg-[#00796B] text-white border-none' : 'bg-white border text-slate-600'}`}>تم تسليمها</button>
                        <button onClick={() => setCheckedAssets(prev => ({ ...prev, badge: 'lost' }))} className={`flex-1 h-8 rounded-lg cursor-pointer ${checkedAssets.badge === 'lost' ? 'bg-red-600 text-white border-none' : 'bg-white border text-slate-600'}`}>مفقودة وخصم</button>
                      </div>
                    </div>

                    <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between hover:border-[#00796B] transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${checkedAssets.keys === 'returned' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {checkedAssets.keys === 'returned' ? 'مستودعة وعقارية ✔' : 'مفقودة - خصم ٢٥ د.ك'}
                        </span>
                        <h4 className="text-xs font-black text-slate-850">مفاتيح المكاتب والخزائن العينية</h4>
                      </div>
                      <div className="flex gap-2 select-none font-bold text-[9.5px]">
                        <button onClick={() => setCheckedAssets(prev => ({ ...prev, keys: 'returned' }))} className={`flex-1 h-8 rounded-lg cursor-pointer ${checkedAssets.keys === 'returned' ? 'bg-[#00796B] text-white border-none' : 'bg-white border text-slate-600'}`}>تم استلامها</button>
                        <button onClick={() => setCheckedAssets(prev => ({ ...prev, keys: 'lost' }))} className={`flex-1 h-8 rounded-lg cursor-pointer ${checkedAssets.keys === 'lost' ? 'bg-red-600 text-white border-none' : 'bg-white border text-slate-600'}`}>مفقودة خصم</button>
                      </div>
                    </div>

                    <div className="bg-slate-50 border rounded-2xl p-4 flex flex-col justify-between hover:border-[#00796B] transition-colors">
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded ${checkedAssets.car === 'returned' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                          {checkedAssets.car === 'returned' ? 'فحص سليم مسترد ✔' : 'غرامات وفقد - خصم ٢٨٠٠ د.ك'}
                        </span>
                        <h4 className="text-xs font-black text-slate-850">سيارة المنشأة والعهد والآليات</h4>
                      </div>
                      <div className="flex gap-2 select-none font-bold text-[9.5px]">
                        <button onClick={() => setCheckedAssets(prev => ({ ...prev, car: 'returned' }))} className={`flex-1 h-8 rounded-lg cursor-pointer ${checkedAssets.car === 'returned' ? 'bg-[#00796B] text-white border-none' : 'bg-white border text-slate-600'}`}>تم تسليمها</button>
                        <button onClick={() => setCheckedAssets(prev => ({ ...prev, car: 'lost' }))} className={`flex-1 h-8 rounded-lg cursor-pointer ${checkedAssets.car === 'lost' ? 'bg-red-600 text-white border-none' : 'bg-white border text-slate-600'}`}>أعطال وقضايا خصم</button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            )}

            {/* MODULE 7: 10 CERTIFICATE DOCUMENT CABINET TEMPLATES */}
            {activeModule === 'documents' && activeCase && (
              <div className="space-y-4">
                <div className="flex items-center justify-between font-sans mb-1 text-right select-none">
                  <button
                    onClick={() => setIsPrintModalOpen(true)}
                    className="bg-[#00796B] text-white text-[10.5px] font-black h-8 px-4 rounded-lg hover:bg-[#004D40] border-none cursor-pointer flex items-center gap-1 shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة النموذج مروّس</span>
                  </button>
                  <h4 className="font-black text-xs text-[#00796B]">سندات وعقود تصفية الخدمة (الموثق الموحد)</h4>
                </div>

                <EndOfServiceDocumentViewer 
                  activeCase={{
                    ...activeCase,
                    netPayable: liveCalculations ? liveCalculations.netPayout : activeCase.netPayable,
                    indemnityAmount: liveCalculations ? liveCalculations.indemnity : activeCase.indemnityAmount,
                    leaveBalanceAmount: liveCalculations ? liveCalculations.leaveCompensation : activeCase.leaveBalanceAmount,
                    loansDeduction: activeCase.loansDeduction + (liveCalculations ? liveCalculations.assetDeductions : 0),
                    basicSalary: inlineValues.basicSalary,
                    allowances: inlineValues.allowances
                  }}
                  activeRole={activeRole}
                  onSignOff={handleDocumentSignOff}
                />
              </div>
            )}

            {/* MODULE 8: PUBLIC AUTHORITY FOR MANPOWER (PAM) MINISTRY FILINGS */}
            {activeModule === 'reports' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-right space-y-4">
                <div className="pb-3 border-b border-slate-50 flex justify-between items-center leading-none">
                  <span className="text-[9px] bg-emerald-50 text-[#00796B] px-2 py-0.5 rounded font-bold border">قالب موحد</span>
                  <h3 className="text-xs font-black text-slate-800">صيغ ونماذج الهيئة العامة للقوى العاملة بدولة الكويت</h3>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed font-bold">
                  تتوافق هذه التنماذج مع الأنظمة الإلكترونية لوزارة الشؤون الاجتماعية وبوابات ميكنة الأجور. يقر محامي مكتب صبري شطا للتحكيم مطابقتها التامة للقرارات الرسمية:
                </p>

                <div className="p-4 bg-slate-50 rounded-2xl border border-dashed text-xs space-y-4 font-sans font-semibold leading-relaxed">
                  <div className="flex justify-between items-center text-[#00796B] font-bold">
                    <span>وزارة الشؤون الاجتماعية والعمل - إدارة علاقات العمل</span>
                    <span>الفرع: حولي / شرق الكبرى</span>
                  </div>
                  <hr className="border-slate-200" />
                  <p>
                    <strong>الموضوع:</strong> إشعار وإخطار تسوية ودية بانتهاء عقد العمل وتسليم الرواتب.
                  </p>
                  <p>
                    بموجب أحكام المادة (51) من قانون العمل في قطاع الأعمال الأهلي رقم 6 لسنة 2010، نود إخطار سيادتكم في إدارة علاقات العمل بأن المنشأة قد قامت باستيفاء الرصيد الكامل والحساب المعد لنهو الخدمة لجميع كوادرها بدون أي مطالبات عمالية معلقة.
                  </p>
                  <div className="pt-2 border-t text-left">
                    <span className="text-[10px] text-slate-400">مكتب صبري شطا للمحاماة - وكيل المنشأة الوطني</span>
                  </div>
                </div>
              </div>
            )}

            {/* MODULE 9: SABRI SHATTA AMICABLE MUTUAL DISCHARGES */}
            {activeModule === 'amicable' && (
               <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm text-right space-y-4">
                  <h3 className="text-xs font-black text-slate-800 pb-2 border-b border-slate-50">نماذج صبري شطا الودية للتسويات الرضائية</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-bold">
                     تطبيقات تسويات الصلح الودي لتلافي اللجوء لإدارة علاقات العمل بالوزارة. تشتمل على بنود حماية المنشأة وإقرار الوفاء المطلق:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none font-bold text-xs text-[#0a4d44]">
                     <div className="p-4 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-100 rounded-2xl flex flex-col justify-between h-32 transition-colors cursor-pointer text-right">
                        <div>
                           <h4 className="font-black text-slate-800">١. مخالصة إقرار الوفاء النهائي</h4>
                           <p className="text-[10px] text-slate-400 mt-1 font-bold">صيغة مبرمة ومحدثة لتفادي نزاع المادة 53 للرواتب.</p>
                        </div>
                        <span className="text-[10px] underline hover:text-[#00796B] block">نسخ ونقل القالب</span>
                     </div>

                     <div className="p-4 bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-100 rounded-2xl flex flex-col justify-between h-32 transition-colors cursor-pointer text-right">
                        <div>
                           <h4 className="font-black text-slate-800">٢. محضر تصافي وفض النزاع ودياً</h4>
                           <p className="text-[10px] text-slate-400 mt-1 font-bold">صياغة بليغة لمكتب شطا تم فحصها بمحاكم التمييز بهول.</p>
                        </div>
                        <span className="text-[10px] underline hover:text-[#00796B] block">نسخ ونقل القالب</span>
                     </div>
                  </div>
               </div>
            )}

          </div>

        </div>
      </main>

      {/* 4. PRINTING DIRECT MODAL PANEL (NAWAFIZ AL-TABA'A STATIONERY) */}
      <AnimatePresence>
        {isPrintModalOpen && activeCase && liveCalculations && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden text-right font-sans my-8"
            >
              
              {/* Header inside print config modal */}
              <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-center justify-between select-none">
                <button 
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer border-none bg-transparent focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-xs sm:text-sm font-black text-slate-800">معاينة وتصدير مستند براءة الذمة</h3>
              </div>

              {/* Printable Station Layout (Sabri Shatta Stationery Design) */}
              <div className="p-8 max-h-[500px] overflow-y-auto bg-slate-50" id="adalah-printable-form">
                <div className="bg-white border-2 border-double border-slate-200 rounded-2xl p-8 relative shadow-sm min-h-[750px] font-sans text-xs">
                  
                  {/* Outer border & golden visual header */}
                  <div className="flex justify-between items-center border-b-2 border-slate-900 pb-5 mb-6 text-[10px] text-slate-500 font-bold">
                    <div className="text-right">
                      <span className="text-[#00796B] font-black block text-[13px] tracking-tight">{translations.ar.officeName}</span>
                      <span className="block mt-1 font-semibold">{translations.ar.phone}</span>
                      <span className="block font-semibold">{translations.ar.email}</span>
                      <span className="block font-semibold">{translations.ar.address}</span>
                    </div>

                    {/* Central Golden Round seal insignia */}
                    <div className="text-center">
                      <div className="w-12 h-12 bg-[#00796B]/5 text-[#00796B] rounded-full border-2 border-[#00796B]/50 flex items-center justify-center mx-auto mb-1.5 animate-pulse">
                        <Scale className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] text-slate-900 font-extrabold block">ختم الاعتماد صبري شطا</span>
                    </div>

                    <div className="text-left font-sans text-[10px] font-semibold">
                      <span className="text-[#00796B] font-black block text-[13px] tracking-tight">SABRI SHATTA LAW FIRM</span>
                      <span className="block mt-1">Kuwait Private Sector Affairs</span>
                      <span className="block">State of Kuwait, Sharq</span>
                    </div>
                  </div>

                  {/* Document principal title */}
                  <div className="text-center mb-8">
                    <h2 className="text-base font-black text-slate-950 underline leading-normal">
                      سند الإقرار والتسوية العمالية وبراءة الذمة الكلية الموحدة
                    </h2>
                    <span className="text-[9.5px] text-slate-400 font-bold mt-1 block">رقم السند: {activeCase?.settlementNumber || activeCase?.id} • تاريخ الإصدار: {printPrintDate}</span>
                  </div>

                  {/* Context of contract */}
                  <div className="space-y-4 leading-relaxed text-right font-sans text-[11px] text-slate-800">
                    <p>بموجب حضور ممثلي الإدارة العامة بمكتب <strong className="text-slate-950">صبري شطا للمحاماة والاستشارات القانونية والتحكيم</strong> بدولة الكويت، والطرف المتنازل المبرأ ذمته الموظف أدناه، تم موازنة وتصفية عقد العمل الفردي المبرم كقيد نهائي لا نزاع فيه:</p>
                    
                    {/* Compact layout card with borders */}
                    <div className="border border-slate-200 rounded-xl p-4 grid grid-cols-2 gap-4 font-sans bg-slate-50/50">
                      <div><strong className="text-slate-900">الأستاذ / العامل:</strong> {activeCase?.employeeName}</div>
                      <div><strong className="text-slate-900">الرقم المدني / البطاقة:</strong> {activeCase?.employeeId}</div>
                      <div><strong className="text-slate-900">المسمى والوظيفة:</strong> {activeCase?.jobTitle}</div>
                      <div><strong className="text-slate-900">القسم المعين به:</strong> {activeCase?.department}</div>
                      <div><strong className="text-slate-900">تاريخ المباشرة:</strong> {activeCase?.joiningDate}</div>
                      <div><strong className="text-slate-900">تاريخ المغادرة:</strong> {activeCase?.lastWorkingDay}</div>
                      <div><strong className="text-slate-900">مدة الخدمة الإجمالية:</strong> {activeCase?.serviceYears} سنة، {activeCase?.serviceMonths} شهر، {activeCase?.serviceDays} يوماً</div>
                      <div><strong className="text-slate-900">نمط إنهاء العقد:</strong> {activeCase?.terminationReason}</div>
                    </div>

                    {/* Financial detailed balance sheet */}
                    <div className="space-y-4">
                      <h4 className="font-black text-xs text-slate-950 underline pt-2">جدول العمليات المالية وميزانية التصفية الكلية:</h4>
                      
                      <table className="w-full border-collapse border border-slate-350 select-none text-[10px]">
                        <thead>
                          <tr className="bg-slate-100 text-slate-950 font-black">
                            <th className="border border-slate-350 p-2 text-right">أولاً: المستحقات والامتيازات الإيجابية (+)</th>
                            <th className="border border-slate-350 p-2 text-left">قيمة البند (د.ك)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="border border-slate-350 p-2 font-semibold">مكافأة نهاية الخدمة المتراصة (مادة 51)</td>
                            <td className="border border-slate-350 p-2 font-mono text-left">{liveCalculations.indemnity.toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-350 p-2 font-semibold">تعويض كاش تسييل كسر الإجازات ({inlineValues.leaveDays} يوماً)</td>
                            <td className="border border-slate-350 p-2 font-mono text-left">{liveCalculations.leaveCompensation.toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-350 p-2 font-semibold font-sans">راتب الأيام الفعلية من الشهر الأخير وعمولات إضافية</td>
                            <td className="border border-slate-350 p-2 font-mono text-left">{(inlineValues.otherAdditions + (activeCase.accruedSalaryAmount || 0)).toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                          </tr>
                          <tr className="bg-slate-100 text-slate-950 font-black">
                            <th className="border border-slate-350 p-2 text-right">ثانياً: الخصومات والمقتطعات العكسية (-)</th>
                            <th className="border border-slate-350 p-2 text-left">قيمة البند (د.ك)</th>
                          </tr>
                          <tr>
                            <td className="border border-slate-350 p-2 font-semibold">أثر مقاصة القروض الشخصية والسلف المصرفية المعلقة للشركة</td>
                            <td className="border border-slate-350 p-2 font-mono text-left">{(activeCase.loansDeduction).toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-350 p-2 font-semibold font-sans">عجز الأصول والعهود العينية غير المستردة</td>
                            <td className="border border-slate-350 p-2 font-mono text-left">{(liveCalculations.assetDeductions).toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-350 p-2 font-semibold font-sans">استقطاعات الغياب اللائحي مادة 42 والجرائم التأديبية</td>
                            <td className="border border-slate-350 p-2 font-mono text-left">{(liveCalculations.absenceDeduct + inlineValues.disciplinaryDeductions).toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                          </tr>
                          <tr>
                            <td className="border border-slate-350 p-2 font-semibold">استقطاع اشتراكات التأمينات الاجتماعية والتقاعد</td>
                            <td className="border border-slate-350 p-2 font-mono text-left">{(activeCase.socialInsuranceDeduction || 0).toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                          </tr>
                          <tr className="bg-[#00796B]/10 font-bold text-[#00796B] text-[11px]">
                            <td className="border border-slate-350 p-2">الصافي المالي المعد المحول على حساب الأيبان المصرفي</td>
                            <td className="border border-slate-350 p-2 font-mono text-left">{liveCalculations.netPayout.toLocaleString(undefined, { minimumFractionDigits: 3 })}</td>
                          </tr>
                        </tbody>
                      </table>

                    </div>

                    {/* Waiver text */}
                    <div className="pt-2 text-[10.5px] leading-relaxed select-none">
                      <p><strong className="text-slate-900">إقرار الإبراء المطلق:</strong> أقر أنا الموقع أدناه بكامل الأهلية الشرعية والقانونية بأنني استلمت كامل غلة مستحقات نهاية خدمتي وصافي التسوية المبينة بالجدول أعلاه بدون نقصان، ولا يحق لي الطعن أو النزاع أو تقديم شكوى عمالية أمام الهيئة العامة للقوى العاملة بدولة الكويت أو القضاء الكويتي طوعاً وتنازلاً رضائياً.</p>
                    </div>

                    {/* Official Signatures Row */}
                    <div className="pt-6 border-t border-slate-200 grid grid-cols-3 gap-4 text-[10px] font-bold text-center animate-pulse">
                      <div>
                        <span className="block underline underline-offset-4 font-extrabold text-slate-800">العامل المقر بالاستلام</span>
                        <span className="block mt-5 text-slate-400 font-sans">توقيع: ..........................</span>
                      </div>
                      <div>
                        <span className="block underline underline-offset-4 font-extrabold text-slate-800">تدقيق شؤون الموظفين</span>
                        <span className="block mt-5 text-[#00796B] font-sans">أخصائي بيرول معتمد</span>
                      </div>
                      <div>
                        <span className="block underline underline-offset-4 font-extrabold text-slate-800">المصادقة بمكتب صبري شطا</span>
                        <div className="mt-2.5 mx-auto w-10 h-10 bg-[#00796B]/5 text-[#00796B] rounded-full border border-[#00796B]/30 flex items-center justify-center font-black text-[9px] scale-90">
                          معتمد
                        </div>
                      </div>
                    </div>

                    {/* Digital validation seal code footer */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between border-t border-slate-100 pt-2 text-[8px] text-slate-400 font-bold">
                      <span>{translations.ar.verificationAr}</span>
                      <span className="font-mono">Ref: {activeCase?.settlementNumber || activeCase?.id} / DT-99827</span>
                    </div>

                  </div>
                </div>
              </div>

              {/* Action operations in modal bottom */}
              <div className="bg-slate-50 border-t border-slate-100 p-5 flex items-center justify-end gap-3 font-sans">
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="h-10 px-5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer focus:outline-none"
                >
                  إغلاق النافذة
                </button>
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="h-10 px-5 rounded-xl text-xs font-black bg-[#00796B] text-white hover:bg-[#004D40] cursor-pointer border-none shadow-xs flex items-center gap-1 focus:outline-none"
                >
                  <Printer className="w-4 h-4 font-black" />
                  <span>بدء أمر الطباعة المخطط</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. DISPUTE TRANSITION MODAL PANEL */}
      <AnimatePresence>
        {disputeModalOpen && activeCase && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden text-right font-sans"
            >
              
              <div className="bg-slate-50 border-b border-slate-100 p-5 flex items-center justify-between select-none">
                <button 
                  onClick={() => setDisputeModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer border-none bg-transparent focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-xs sm:text-sm font-black text-slate-800 flex items-center gap-1">
                  <AlertOctagon className="w-4 h-4 text-red-500" />
                  <span>تصدير ملف نزاع للمحاكم الكويتية</span>
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="p-4 bg-red-500/5 border border-red-100 rounded-2xl text-red-950 font-semibold text-xs leading-relaxed">
                  بمجرد تأكيد تصعيد هذا الملف، سيتحول تصنيف براءة الذمة إلى "متنازع عليه" وسيتم وضع حظر على الصرف المالي التلقائي في البيرول، تمهيداً لتداول الخلاف أمام ممثل الهيئة العامة للقوى العاملة.
                </div>

                <div className="space-y-1.5 text-right font-sans">
                  <label className="text-[10px] font-extrabold text-slate-450 block">مذكر السند وأسباب التنازع المالي</label>
                  <textarea
                    value={disputeMemo}
                    onChange={(e) => setDisputeMemo(e.target.value)}
                    rows={4}
                    className="w-full p-4 bg-slate-50 border border-slate-250 rounded-xl text-xs font-sans text-slate-700 text-right focus:outline-none focus:border-red-500 font-semibold leading-relaxed"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-100 p-5 flex items-center justify-end gap-3 font-sans">
                <button
                  onClick={() => setDisputeModalOpen(false)}
                  className="h-10 px-5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer focus:outline-none"
                >
                  تراجع
                </button>
                <button
                  onClick={confirmDisputeTransition}
                  className="h-10 px-5 rounded-xl text-xs font-black bg-red-600 text-white hover:bg-red-700 cursor-pointer border-none shadow-xs flex items-center gap-1 focus:outline-none"
                >
                  <Play className="w-4 h-4" />
                  <span>تأكيد تصعيد النزاع وتسجيله</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MULTI-STEP WIZARD (EndOfServiceWizard) */}
      {wizardOpen && (
        <EndOfServiceWizard 
          onClose={() => { setWizardOpen(false); setEditCase(null); }}
          onSave={handleSaveCase}
          editCase={editCase}
        />
      )}

    </div>
  );
}
