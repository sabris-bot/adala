// Global Enums and Interfaces for Qanooni Pro

// --- FIX START ---
// Added React import to solve "Cannot find namespace 'React'" error.
import React from 'react';
// --- FIX END ---


// --- GENERAL ---
export interface NavItem {
  name: string;
  translationKey?: string;
  path: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  children?: NavItem[];
  sectionHeader?: string; // Optional header text to display before this item in the sidebar
  sectionTranslationKey?: string;
}

export interface FinancialItem {
  id: string;
  name: string;
  amount: number;
  currency?: string; // Added currency
}

// --- COUNTRY CONTEXT ---
export type CountryCode = 'KW' | 'SA' | 'AE' | 'EG' | 'JO' | 'BH' | 'QA' | 'OM';

export interface LaborLawConfig {
  indemnityRules: {
    firstPeriodYears: number;
    firstPeriodDaysPerYear: number;
    subsequentPeriodDaysPerYear: number;
    maxIndemnityMonths?: number; 
    resignationAdjustment: {
      under3Years: number; // multiplier (0 to 1)
      threeToFiveYears: number;
      fiveToTenYears: number;
      overTenYears: number;
    };
  };
  annualLeaveDays: number;
  sickLeaveRules: {
    fullPayDays: number;
    threeQuarterPayDays: number;
    halfPayDays: number;
    quarterPayDays: number;
    noPayDays: number;
  };
  references?: {
    annualLeaveArticle?: string;
    sickLeaveArticle?: string;
    indemnityArticle?: string;
    disciplinaryArticle?: string;
    lawNameAr?: string;
  };
  disciplinaryRules?: {
    maxDeductionDaysPerMonth: number;
    investigationRequired: boolean;
    appealPeriodDays: number;
    rules: {
        article: string;
        text: string;
    }[];
  };
}

export interface Jurisdiction {
  code: CountryCode;
  name: string;
  nameEn: string;
  currencyCode: string;
  currencySymbol: string;
  currencyNameAr: string;
  flag: string;
  laborLaw: LaborLawConfig;
  legalInterest: {
    civilRate: number;
    commercialRate: number;
    isCappedAtPrincipal: boolean;
    defaultAttorneyFeesPercent?: number;
    defaultAttorneyFeesMin?: number;
  };
  courtFeesConfig: {
    fixedFees: {
      totalCourt: number;
      partialCourt: number;
      appeal: number;
      cassation: number;
      petition: number;
      expert: number;
    };
    proportionalRules: {
      minFee: number;
      tiers: { limit: number; rate: number }[];
    };
  };
}

// --- CASE MANAGEMENT ---
export enum CaseStatus {
  OPEN = "مفتوحة",
  CLOSED = "مغلقة",
  PENDING = "قيد الانتظار",
  IN_PROGRESS = "قيد التنفيذ",
  ON_HOLD = "معلقة",
  APPEALED = "مستأنفة",
}

export enum CaseMainType {
  COMMERCIAL = "تجاري",
  LABOR = "عمالي",
  REAL_ESTATE = "عقاري",
  CRIMINAL = "جنائي",
  CIVIL = "مدني",
  ADMINISTRATIVE = "إداري",
  PERSONAL_STATUS = "أحوال شخصية",
  INTELLECTUAL_PROPERTY = "ملكية فكرية",
  MARITIME = "بحري",
  OTHER = "أخرى",
}

export enum CasePriority {
  LOW = "منخفضة",
  NORMAL = "عادية",
  HIGH = "عالية",
  URGENT = "عاجلة",
}

export enum CourtLevel {
  FIRST_INSTANCE = "المحكمة الكلية (أول درجة)",
  APPEALS_COURT = "محكمة الاستئناف",
  CASSATION_COURT = "محكمة التمييز",
  CONSTITUTIONAL_COURT = "المحكمة الدستورية",
  SPECIALIZED_COURT = "محكمة الأسرة",
  ADMINISTRATIVE_COURT = "المحكمة الكلية - الدائرة الإدارية",
  LABOR_COURT = "المحكمة العمالية",
  RENT_COURT = "محكمة الإيجارات",
}

export enum LitigationStage {
  FIRST_INSTANCE = "أول درجة",
  APPEAL = "استئناف",
  CASSATION = "تمييز",
  EXECUTION = "تنفيذ",
}

export enum NotificationStatus {
  NOT_SUBMITTED = "لم يتم تقديم الإعلان",
  IN_PROCESS = "قيد الإعلان",
  COMPLETED = "تم الإعلان",
  FAILED = "فشل الإعلان (لم يستدل)",
  POSTPONED = "مؤجل للإعلان",
}

export enum RiskLevel {
  LOW = "منخفض",
  MEDIUM = "متوسط",
  HIGH = "مرتفع",
  CRITICAL = "حرج",
}

export enum JudgmentOutcome {
  WON = "فوز",
  LOST = "خسارة",
  SETTLED = "تسوية",
  PARTIAL_WIN = "فوز جزئي",
  PENDING = "انتظار",
  DISMISSED = "شطب/رفض",
  REFERRED_TO_EXPERT = "إحالة للخبراء",
}

export interface Hearing {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:MM
  courtRoomOrLocation?: string;
  type?: string; // e.g., "First Hearing", "Pleading", "Judgment"
  status: 'Scheduled' | 'Completed' | 'Postponed' | 'Cancelled';
  notes?: string;
  attendedBy?: string[]; // Names of attendees
  nextHearingDate?: string;
  nextHearingNotes?: string;
  caseId?: string; 
  caseTitle?: string; 
  clientName?: string; 
  lawyerSignature?: string; // Signature of the attending lawyer
}

export interface CaseFile {
  id: string;
  fileName: string;
  fileType: string; // e.g., "Contract", "Pleading", "Evidence"
  fileUrl?: string; // Link to the file
  uploadedAt: string; // ISO Date string
  description?: string;
}

export interface CaseNote {
  id: string;
  date: string; // ISO Date string
  author: string;
  note: string;
}

// --- EXECUTION ACTIONS (NEW) ---
export enum ExecutionActionType {
  TRAVEL_BAN = "منع السفر",
  BANK_ACCOUNT_FREEZE = "حجز على الحسابات البنكية",
  VEHICLE_SEIZURE = "حجز مركبات",
  PROPERTY_SEIZURE = "حجز عقارات",
  SALARY_DEDUCTION_ORDER = "أمر استقطاع من الراتب",
  ARREST_ORDER_DEBT = "أمر ضبط وإحضار لمديونية",
  AUCTION_SALE_ORDER = "أمر بيع بالمزاد العلني",
  DISCLOSURE_OF_ASSETS_ORDER = "أمر كشف الذمة المالية للمدين",
  PAYMENT_ORDER = "أمر أداء",
  OTHER_EXECUTION_ACTION = "إجراء تنفيذي آخر",
}

export enum ExecutionActionStatus {
  PENDING_SUBMISSION = "بانتظار التقديم لإدارة التنفيذ",
  SUBMITTED_PENDING_DECISION = "مقدم وبانتظار قرار التنفيذ",
  ACTIVE = "فعال/ساري المفعول",
  PARTIALLY_COMPLETED = "منفذ جزئيًا",
  COMPLETED = "منفذ بالكامل/مكتمل",
  LIFTED = "تم رفعه/إلغاؤه بعد السريان",
  REJECTED_BY_COURT = "مرفوض من قاضي التنفيذ",
  CANCELLED_BY_APPLICANT = "ملغى من قبل طالب التنفيذ",
}

export interface ExecutionAction {
  id: string;
  actionType: ExecutionActionType;
  applicationDate: string; // تاريخ تقديم الطلب لإدارة التنفيذ
  decisionDate?: string; // تاريخ صدور قرار قاضي التنفيذ
  effectiveDate?: string; // تاريخ بدء سريان الإجراء
  expiryDate?: string; // تاريخ انتهاء صلاحية الإجراء، إن وجد
  referenceNumber?: string; // رقم ملف التنفيذ أو رقم الأمر
  status: ExecutionActionStatus;
  amountInvolved?: number; // المبلغ المرتبط بالإجراء (مثل قيمة الحجز)
  targetDetails?: string; // تفاصيل الهدف من الإجراء (رقم حساب، بيانات مركبة، إلخ)
  courtOrderReference?: string; // مرجع أمر المحكمة أو قرار قاضي التنفيذ
  notes?: string;
  lawyerSignature?: string; // توقيع المحامي القائم بالإجراء
}
// --- END OF EXECUTION ACTIONS ---

// --- NEW: EXPERT ACTIONS ---
export enum ExpertField {
    ACCOUNTING = "محاسبي",
    ENGINEERING = "هندسي",
    REAL_ESTATE_APPRAISAL = "تقييم عقاري",
    IT_FORENSICS = "خبرة فنية (تقنية معلومات)",
    MEDICAL_FORENSICS = "طب شرعي",
    HANDWRITING_ANALYSIS = "أبحاث التزييف والتزوير",
    OTHER = "مجال آخر",
}

export enum ExpertActionStatus {
  PENDING_ASSIGNMENT = "بانتظار ندب الخبير",
  IN_PROGRESS = "قيد مباشرة المهمة",
  REPORT_SUBMITTED = "تم إيداع التقرير",
  AWAITING_DISCUSSION = "بانتظار جلسة مناقشة التقرير",
  COMPLETED = "اكتملت مهمة الخبير",
}

export interface ExpertAction {
  id: string;
  referralDate: string; // تاريخ الإحالة للخبرة
  expertName?: string; // اسم الخبير المنتدب
  expertField?: ExpertField; // مجال خبرته
  assignedTask: string; // المهمة الموكلة إليه من المحكمة
  status: ExpertActionStatus;
  reportSubmissionDate?: string; // تاريخ إيداع التقرير
  reportDiscussionDate?: string; // تاريخ جلسة مناقشة التقرير
  notes?: string;
  lawyerSignature?: string; // توقيع المحامي المتابع لمهمة الخبير
}
// --- END OF EXPERT ACTIONS ---

export interface Case {
  id: string;
  title: string;
  caseNumber: string; 
  internalCaseNumber?: string;
  fileNumber?: string; // رقم الملف بالمكتب
  clientName: string;
  clientId?: string;
  clientRole?: string | string[]; // e.g. 'مدعي', 'مدعى عليه'
  group?: string; // e.g. 'مجموعة أ', 'قضايا هامة'
  caseMainType: CaseMainType;
  caseSubType?: string; 
  status: CaseStatus;
  priority: CasePriority;
  riskLevel: RiskLevel;
  assignedLawyer: string;
  assignedLegalTeam?: string[]; // Added: Team of lawyers
  courtName: string;
  courtLevel: CourtLevel;
  litigationStage?: LitigationStage; // درجة التقاضي
  circuit?: string; // Added: Circuit (الدائرة)
  judgeName?: string; // اسم القاضي
  opposingPartyName?: string;
  opponentRole?: string | string[]; // e.g. 'مدعي', 'مدعى عليه'
  opposingCounsel?: string;
  plaintiffs?: string[]; 
  defendants?: string[]; 
  filingDate: string; 
  registrationDate?: string; 
  description?: string;
  caseObjective?: string; 
  legalDemands?: string; // Added: Legal Demands (الطلبات القانونية)
  legalNotes?: string; // الملاحظات القانونية
  poaNumbers?: string[]; // أرقام التوكيلات
  statuteOfLimitationsDate?: string; // مدة التقادم (تاريخ)
  notificationStatus?: NotificationStatus;
  notificationData?: {
    date: string;
    notes: string;
  }[];
  budget?: number;
  financials?: {
    totalFees: number;
    paid: number;
    remaining: number;
    currency: string;
    expenses?: FinancialItem[]; // المصروفات
  }; // Added: Fees and Payments
  nextHearingDate?: string;
  hearings?: Hearing[];
  caseFiles?: CaseFile[];
  caseNotes?: CaseNote[];
  relatedCases?: string[]; 
  executionActions?: ExecutionAction[]; 
  expertActions?: ExpertAction[]; 
  reminders?: { id: string; date: string; message: string; isRead: boolean }[]; // Added: Reminders
  createdDate: string;
  lastModifiedDate?: string;
  closedDate?: string;
  judgmentDate?: string;
  judgmentSummary?: string;
  judgmentOutcome?: JudgmentOutcome;
  executionStatus?: string; // Added: Overall execution status
  isArchived?: boolean; // Added: Archive status
  archiveDate?: string; // Added: Archive date
  tasks?: string[]; // Added: Linked tasks
}

// --- CONTRACT ANALYSIS (AI) ---
export enum AnalyzedContractStatus {
  DRAFT = "مسودة",
  PENDING_UPLOAD = "بانتظار الرفع",
  IN_ANALYSIS = "قيد التحليل",
  ANALYZED = "تم التحليل",
  UNDER_REVIEW = "تحت المراجعة القانونية",
  APPROVED = "معتمد",
  REJECTED = "مرفوض",
  EXPIRED = "منتهي",
}

export enum ContractCategory {
  EMPLOYMENT = "عقد عمل",
  LEASE = "عقد إيجار",
  PARTNERSHIP = "عقد شراكة",
  SALES = "عقد بيع",
  SERVICES = "عقد خدمات",
  NDA = "اتفاقية سرية",
  INVESTMENT = "عقد استثمار",
  CONSTRUCTION = "عقد مقاولات",
  OTHER = "آخر",
}

export interface ExtractedClause {
  id: string;
  title: string;
  content: string;
  risk: RiskLevel;
  category?: string;
  aiRecommendation?: string;
  legalBasis?: string; // References to laws
}

export interface ContractRiskReport {
  overallRiskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  criticalIssues: string[];
  complianceCheck: {
    isCompliant: boolean;
    missingMandatoryClauses: string[];
    conflictingClauses: string[];
  };
  securityPercentage: number; // 0 to 100
}

export interface ContractComparisonResult {
  similarityPercentage: number;
  differences: {
    clauseTitle: string;
    originalContent: string;
    targetContent: string;
    changeType: 'Added' | 'Modified' | 'Removed';
  }[];
}

export interface AnalyzedContract {
  id: string;
  referenceNumber: string;
  title: string;
  category: ContractCategory;
  parties: {
    firstParty: string;
    secondParty: string;
    otherParties?: string[];
  };
  dates: {
    effectiveDate?: string;
    expiryDate?: string;
    signedDate?: string;
    renewalDate?: string;
  };
  financials?: {
    value: number;
    currency: string;
    paymentTerms?: string;
    penalties?: string;
  };
  duration?: string;
  status: AnalyzedContractStatus;
  overallRisk: RiskLevel;
  summary: string;
  keywords: string[];
  clauses: ExtractedClause[];
  risks: ContractRiskReport;
  recommendations: string[];
  legalAdvice?: string;
  ocrText?: string;
  fileUrl?: string;
  fileType: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt?: string;
  linkedEntities?: {
    employeeId?: string;
    caseId?: string;
    propertyId?: string;
    caseNumber?: string;
  };
  qrCodeData?: string;
  tags?: string[];
  notes?: string[];
}

export interface GeminiAnalysisResult {
  summary: string;
  extractedClauses: ExtractedClause[];
  overallRiskAssessment: RiskLevel;
  recommendations: string[];
  legalAdvice?: string;
}


// --- TASK MANAGEMENT (Used by general dashboard, distinct from AdminTask) ---
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO Date string
  assignee: string; // User ID or name
  status: 'Pending' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  relatedCaseId?: string; 
  relatedDocumentId?: string; 
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
}

// --- LEGAL RESOURCES ---
export enum LegalResourceType {
  LAW = "قانون",
  DECREE = "مرسوم",
  MINISTERIAL_DECISION = "قرار وزاري",
  EXECUTIVE_REGULATION = "لائحة تنفيذية",
  JUDICIAL_PRECEDENT = "سابقة قضائية/حكم محكمة",
  LEGAL_ARTICLE = "مقال قانوني/بحث",
  OFFICIAL_GAZETTE_PUBLICATION = "منشور الجريدة الرسمية",
  TEMPLATE = "نموذج/صيغة قانونية", 
  OTHER = "مصدر آخر",
}

export enum LawBranch {
  CONSTITUTIONAL = "دستوري",
  CIVIL = "مدني",
  COMMERCIAL = "تجاري",
  CRIMINAL = "جزائي",
  ADMINISTRATIVE = "إداري",
  LABOR = "عمل",
  PERSONAL_STATUS = "أحوال شخصية",
  INTERNATIONAL = "دولي",
  INTELLECTUAL_PROPERTY = "ملكية فكرية",
  TAX = "ضرائب",
  COMPANIES = "شركات",
  REAL_ESTATE = "عقاري",
  MARITIME = "بحري",
  ENVIRONMENTAL = "بيئي",
  TRAFFIC = "مرور",
  OTHER = "فروع أخرى",
}

export enum LegalResourceStatus {
    ACTIVE = "ساري",
    ACTIVE_AMENDED = "ساري (مع تعديلات)",
    REPEALED = "ملغى",
    AMENDED_BY_OTHER = "مُعدَّل بموجب مستند آخر", 
    DRAFT = "مسودة/مشروع",
    SUPERSEDED = "تم استبداله",
    HISTORICAL_REFERENCE = "مرجع تاريخي",
}
export interface RelatedDocument {
    title: string;
    number?: string;
    relationType: string; 
}
export interface LegalResource {
  id: string;
  title: string;
  type: LegalResourceType;
  category?: string; 
  documentNumber?: string; 
  country?: CountryCode; // Updated to CountryCode
  publishDate: string; 
  effectiveDate?: string; 
  lawBranch?: LawBranch;
  issuingAuthority?: string;
  resourceStatus?: LegalResourceStatus;
  keywords: string[];
  description?: string;
  summary?: string;
  filePathOrLink?: string; 
  officialGazetteDetails?: string; 
  relatedDocuments?: RelatedDocument[]; 
  internalNotes?: string; 
  propertyId?: string; // Link to a property for grouping
  contentTemplate?: string; 
  variables?: string[]; 
  instructions?: string; 
}


// --- COMPLIANCE MANAGEMENT ---
export enum ComplianceCategory {
  LICENSES = "تراخيص وتصاريح",
  TAX = "ضرائب وزكاة",
  LABOR_LAW = "قوانين العمل",
  DATA_PROTECTION = "حماية البيانات والخصوصية",
  COMMERCIAL_REG = "السجل التجاري والشركات",
  ENVIRONMENTAL = "بيئي",
  FINANCIAL_REPORTING = "تقارير مالية وتدقيق",
  HEALTH_SAFETY = "صحة وسلامة مهنية",
  ANTI_MONEY_LAUNDERING = "مكافحة غسيل الأموال",
  INTELLECTUAL_PROPERTY = "ملكية فكرية", 
  CONTRACTUAL_OBLIGATIONS = "التزامات تعاقدية", 
  OTHER = "متطلبات أخرى",
}

export enum ComplianceStatus {
  COMPLIANT = "ملتزم",
  IN_PROGRESS = "قيد التنفيذ",
  OVERDUE = "متأخر",
  UNDER_REVIEW = "تحت المراجعة",
  SCHEDULED = "مجدول",
  NOT_APPLICABLE = "غير منطبق",
  CANCELLED = "ملغى",
}

export enum ComplianceFrequency {
  ANNUAL = "سنوي",
  SEMI_ANNUAL = "نصف سنوي",
  QUARTERLY = "ربع سنوي",
  MONTHLY = "شهري",
  AS_NEEDED = "حسب الحاجة",
  ONE_TIME = "مرة واحدة",
}

export enum CompliancePriority {
  LOW = "منخفضة",
  MEDIUM = "متوسطة",
  HIGH = "عالية",
  CRITICAL = "حرجة",
}

export interface ComplianceRequirement {
  id: string;
  title: string;
  description?: string;
  category: ComplianceCategory;
  authority: string; 
  frequency: ComplianceFrequency;
  dueDate?: string; 
  status: ComplianceStatus;
  priority: CompliancePriority; // Added Priority
  assignedTo?: string; 
  lastReviewDate?: string; 
  nextReviewDate?: string; 
  evidenceLink?: string; 
  notes?: string;
  createdAt: string; 
  updatedAt?: string; 
  country?: CountryCode; // For country-specific compliance items
}

// --- EMPLOYEE AFFAIRS ---
export enum Gender {
  MALE = "ذكر",
  FEMALE = "أنثى",
  OTHER = "آخر",
}

export enum EmployeeStatus {
  ACTIVE = "نشط",
  ON_LEAVE = "في إجازة",
  TERMINATED = "منتهية خدمته",
  SUSPENDED = "موقوف عن العمل",
}

export interface Allowance {
  name: string;
  value: number;
  subjectToIndemnity?: boolean; 
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface EmployeeAsset {
  id: string;
  assetName: string;
  serialNumber?: string;
  assignedDate: string;
  returnedDate?: string;
  notes?: string;
}

export interface EmployeeTraining {
  id: string;
  courseName: string;
  provider?: string;
  completionDate: string;
  expiryDate?: string;
  certificateUrl?: string;
}

export interface EducationalQualification {
  degree: string;
  major: string;
  university: string;
  graduationYear: string;
}

export interface Employee {
  id: string;
  employeeId: string; 
  fullNameAr: string;
  fullNameEn?: string;
  civilId: string; 
  nationality: string;
  jobTitle: string;
  department: string;
  joiningDate: string; 
  contractType: ContractTypeKuwait; // This might need to be country-specific later
  basicSalary: number;
  allowances?: Allowance[];
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string; 
  gender?: 'Male' | 'Female' | 'Other' | string; 
  status: 'Active' | 'OnLeave' | 'Terminated' | 'Suspended' | string;
  terminationDate?: string; 
  photoUrl?: string; 
  annualLeaveEntitlement?: number; 
  leaveTakenThisYear?: number; 
  monthlySalaryForLeaveCalc?: number; 
  serviceYears?: number; 
  notes?: string; 
  specializations?: CaseMainType[]; // For lawyer list in Legal Representation
  frequentedCourts?: CourtLevel[]; // For lawyer list in Legal Representation
  
  // Kuwait Documentation & Finance Integration
  civilIdExpiry?: string;
  passportNumber?: string;
  passportExpiry?: string;
  residencyExpiry?: string;
  bankIban?: string;
  bankName?: string;
  bankAccount?: string; // Added Bank Account

  // New Comprehensive Fields
  managerId?: string;
  managerName?: string;
  emergencyContact?: EmergencyContact;
  assets?: EmployeeAsset[];
  trainings?: EmployeeTraining[];
  qualifications?: EducationalQualification[];
  skills?: string[];
  bloodType?: string;

  // HR Specific Extensions
  socialStatus?: 'Single' | 'Married' | 'Divorced' | 'Widowed' | string;
  jobGrade?: string;
  branch?: string;
  contractDuration?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  workHoursPerDay?: number;
  workSystem?: string;
  restDays?: string[];
  healthInsuranceNumber?: string;
  residencyFileNumber?: string;
  residencyStatus?: string;
  workPermitNumber?: string;
  workPermitExpiry?: string;
  socialSecurityNumber?: string; 
  lastAppraisalScore?: number;
  lastAppraisalDate?: string;
}

// -- End of Service (Kuwait Specific for now) --
export enum ContractTypeKuwait {
  LIMITED = "محدد المدة",
  UNLIMITED = "غير محدد المدة",
}
export enum TerminationReasonKuwait {
  // Employer Actions (Dismissal)
  DISMISSAL_WITH_NOTICE = "إنهاء العقد من قبل صاحب العمل (مع مهلة إخطار) - استحقاق كامل",
  DISMISSAL_WITHOUT_NOTICE_ART_41 = "فصل العامل للأسباب الواردة بالمادة 41 (خطأ جسيم/غياب) - حرمان من المكافأة",
  DISMISSAL_ART_41_LOSS = "فصل (المادة 41): خطأ جسيم تسبب في خسارة كبيرة للمعدات/الخامات",
  DISMISSAL_ART_41_FRAUD = "فصل (المادة 41): الحصول على العمل بطريق الغش أو التدليس",
  DISMISSAL_ART_41_SECRETS = "فصل (المادة 41): إفشاء أسرار المنشأة مما أدى لخسارة مؤكدة",
  DISMISSAL_ART_41_MORALS = "فصل (المادة 41): ارتكاب فعل مخل بالآداب العامة أو جريمة مخلة بالشرف",
  DISMISSAL_ART_41_ASSAULT = "فصل (المادة 41): الاعتداء على صاحب العمل أو الزملاء",
  DISMISSAL_ART_41_OBLIGATIONS = "فصل (المادة 41): الإخلال بالالتزامات العقدية أو القانونية أو تعليمات السلامة",
  CLOSURE_OR_BANKRUPTCY = "إغلاق المنشأة أو إفلاسها - استحقاق كامل",
  ORGANIZATIONAL_REDUNDANCY = "إنهاء لأسباب تنظيمية / تقليص العمالة",
  TERMINATION_FOR_ABSENCE = "إنهاء الخدمة بسبب الانقطاع عن العمل (المادة 42)",

  // Contract Status
  CONTRACT_EXPIRY = "انتهاء مدة العقد (للعقود المحددة) - استحقاق كامل",
  PROBATION_TERMINATION = "إنهاء الخدمة خلال فترة التجربة - لا مكافأة عادة",

  // Resignation (Employee Actions)
  RESIGNATION = "استقالة (سيتم تطبيق النسب حسب مدة الخدمة)",
  RESIGNATION_UNDER_3_YEARS = "استقالة (خدمة أقل من 3 سنوات) - لا مكافأة (المادة 53)",
  RESIGNATION_3_TO_5_YEARS = "استقالة (خدمة 3 - 5 سنوات) - نصف المكافأة (المادة 53)",
  RESIGNATION_5_TO_10_YEARS = "استقالة (خدمة 5 - 10 سنوات) - ثلثي المكافأة (المادة 53)",
  RESIGNATION_10_PLUS_YEARS = "استقالة (خدمة 10 سنوات فأكثر) - مكافأة كاملة",
  PROBATION_RESIGNATION = "استقالة خلال فترة التجربة",

  // Special Conditions
  RETIREMENT = "تقاعد الموظف",
  DEATH = "وفاة الموظف (المكافأة لورثته)",
  TOTAL_DISABILITY = "عجز كلي أو جزئي مانع عن العمل",
  CONSENSUAL_TERMINATION = "إنهاء العقد بالتراضي بين الطرفين",
  MARRIAGE_RESIGNATION_WOMEN = "استقالة المرأة بسبب الزواج (المادة 54) - مكافأة كاملة",
  RESIGNATION_ART_48_EMPLOYER_FAULT = "ترك العمل لخطأ صاحب العمل أو اعتداء (مادة 48) - استحقاق كامل",
  RESIGNATION_ART_48_NON_COMPLIANCE = "ترك العمل (المادة 48): عدم التزام صاحب العمل بنصوص العقد/القانون",
  RESIGNATION_ART_48_ASSAULT = "ترك العمل (المادة 48): الاعتداء على العامل من قبل صاحب العمل أو وكيله",
  RESIGNATION_ART_48_HEALTH_SAFETY = "ترك العمل (المادة 48): وجود تهديد لسلامة أو صحة العامل بالمنشأة",
  RESIGNATION_ART_48_FRAUD_CONDITIONS = "ترك العمل (المادة 48): وقع غش من صاحب العمل عند التعاقد بشأن شروط العمل",
}

export type EOS_SettlementStatus = 'UnderReview' | 'FinanciallyApproved' | 'LegallyApproved' | 'Completed' | 'Disbursed' | 'Cancelled';

export interface EOS_Settlement {
  id: string;
  employeeId: string;
  employeeName: string;
  settlementDate: string;
  lastWorkingDay: string;
  terminationReason: TerminationReasonKuwait;
  status: EOS_SettlementStatus;
  
  // Financial Details
  basicSalary: number;
  allowances: number;
  grossSalary: number;
  serviceYears: number;
  serviceMonths: number;
  serviceDays: number;
  
  // Calculated Assets
  indemnityAmount: number;
  leaveBalanceAmount: number;
  accruedSalaryAmount: number;
  noticePeriodAmount: number;
  otherBonuses: number;
  
  // Deductions
  loansDeduction: number;
  absenceDeduction: number;
  otherDeductions: number;
  
  netPayable: number;
  
  // Metadata/Legal
  legalArticles: string[];
  notes?: string;
  attachments?: string[];
  preparedBy: string;
  approvedBy?: string;
}

export interface EndOfServiceInputs {
  companyName: string;
  employeeName: string;
  employeeCivilId: string;
  employeeJobTitle: string;
  joiningDate: string;
  lastWorkDate: string;
  basicSalary: number;
  allowancesSubjectToIndemnity: number;
  contractType: ContractTypeKuwait; // To be country-specific
  terminationReason: TerminationReasonKuwait; // To be country-specific
  
  annualLeaveEntitlementPerYear: number; 
  totalAccruedLeaveDays: number;
  leaveDaysAlreadyTaken: number;
  otherDues: FinancialItem[];
  deductions: FinancialItem[];
}
export interface EndOfServiceResult extends EndOfServiceInputs {
  serviceYears: number;
  serviceMonths: number;
  serviceDays: number;
  calculationSalary: number;
  
  indemnityForFirst5Years: number;
  indemnityForSubsequentYears: number;
  grossIndemnityBeforeCap: number;
  appliedCapAmount?: number; 
  grossIndemnityAfterCap: number;
  terminationAdjustmentFactor: number;
  adjustedIndemnity: number;
  
  netLeaveBalanceDays: number;
  leaveDayValue: number;
  leaveEncashmentValue: number;
  
  totalOtherDuesValue: number;
  totalDeductionsValue: number;
  
  netPayableAmount: number;
  
  warnings: string[];
  notesOnCalculation?: string[];
}

// -- Leave Management (Kuwait Specific for now) --
export enum LeaveTypeKuwait {
  ANNUAL = "إجازة سنوية",
  SICK = "إجازة مرضية",
  HAJJ = "إجازة حج",
  MATERNITY = "إجازة أمومة (وضع)",
  IDDAH = "إجازة عدة (للمرأة المسلمة المتوفى زوجها)",
  UNPAID = "إجازة بدون راتب",
  EMERGENCY = "إجازة طارئة",
  STUDY = "إجازة دراسية",
  MARRIAGE = "إجازة زواج",
  PATERNITY = "إجازة أبوة (مرافقة زوجة)",
  COMPASSIONATE = "إجازة وفاة قريب (تعزية)",
  OFFICIAL_HOLIDAY = "عطلة رسمية",
  OTHER = "إجازة أخرى",
}
export interface RequestAttachment {
  id: string;
  name: string;
  fileType?: string;
  fileUrl?: string; // For actual file links in future
  uploadedAt: string;
}
export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveTypeKuwait; // To be country-specific
  startDate: string;
  endDate: string;
  numberOfDays: number;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  requestedAt: string;
  managerComments?: string;
  approvedAt?: string;
  rejectionReason?: string;
  attachments?: RequestAttachment[];
  updatedAt?: string;
  employeeSignature?: string;
  managerSignature?: string;
}

// -- Loan Management --
export enum LoanType {
  PERSONAL = "قرض شخصي",
  SALARY_ADVANCE = "سلفة على الراتب",
  HOUSING = "سلفة إسكانية",
  CAR = "سلفة سيارة",
  EMERGENCY = "سلفة طارئة",
  MARRIAGE = "منحة/قرض زواج",
  SOCIAL = "قرض اجتماعي",
  FURNITURE = "سلفة أثاث",
  EDUCATION = "سلفة دراسية",
  OTHER = "أخرى",
}
export enum LoanStatus {
  PENDING_APPROVAL = "بانتظار الموافقة",
  APPROVED = "موافق عليه",
  ACTIVE = "نشط (جاري السداد)",
  PAID_IN_FULL = "مسدد بالكامل",
  REJECTED = "مرفوض",
  CANCELLED = "ملغى",
  DEFAULTED = "متعثر",
}
export enum InstallmentStatus {
  PENDING = "مستحق",
  PAID = "مدفوع",
  PARTIALLY_PAID = "مدفوع جزئياً",
  OVERDUE = "متأخر",
  UPCOMING = "قادم",
  WAIVED = "معفى منه",
}
export interface Installment {
  id: string;
  installmentNumber: number;
  dueDate: string;
  amountDue: number;
  status: InstallmentStatus;
  amountPaid?: number;
  paymentDate?: string;
  notes?: string;
}
export interface Loan {
    id: string;
    employeeId: string;
    employeeName: string;
    loanType: LoanType;
    loanAmount: number;
    purpose?: string;
    requestDate: string;
    approvalDate?: string;
    disbursementDate?: string;
    repaymentStartDate: string;
    numberOfInstallments: number;
    monthlyInstallment: number;
    status: LoanStatus;
    installments: Installment[];
    totalPaidAmount?: number;
    remainingBalance?: number;
    guarantorName?: string;
    guarantorCivilId?: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}

// -- Disciplinary Actions --
export enum ViolationTypeKuwait {
    ATTENDANCE_LATENESS = "تأخير متكرر عن الحضور",
    PERFORMANCE_NEGLIGENCE = "إهمال أو تقصير في الأداء",
    ATTENDANCE_ABSENCE = "غياب بدون إذن",
    POLICY_CODE_OF_CONDUCT = "مخالفة لائحة وسياسات الشركة",
    CONFIDENTIALITY_BREACH = "إفشاء أسرار العمل",
    INSUBORDINATION = "عدم تنفيذ الأوامر (عصيان إداري)",
    PROPERTY_DAMAGE = "إتلاف ممتلكات المنشأة",
    MISCONDUCT_HARASSMENT = "التطاول أو الاعتداء على الزملاء أو الرؤساء",
    SAFETY_VIOLATION = "مخالفة تعليمات الأمن والسلامة المهنية",
    FORGERY_TAMPARING = "التزوير في المحررات أو التلاعب في البصمة",
    ALCOHOL_DRUGS = "الحضور تحت تأثير المسكرات أو العقاقير",
    SOCIAL_MEDIA_MISUSE = "إساءة استخدام وسائل التواصل الاجتماعي بما يضر المنشأة",
    CONFLICT_OF_INTEREST = "تضارب المصالح / العمل لدى مجهز أو عميل",
    OFFICE_ETIQUETTE = "الإخلال بآداب العمل والوقار المهني",
    BRIBERY_CORRUPTION = "الرشوة أو استغلال النفوذ الوظيفي",
    SEXUAL_HARASSMENT = "التحرش الجنسي أو التنمر في بيئة العمل",
    FRAUDULENT_EXPENSES = "تقديم مطالبات مالية أو فواتير وهمية",
    OTHER = "مخالفات أخرى",
}
export enum DisciplinaryPenaltyKuwait {
    VERBAL_WARNING = "تنبيه شفوي",
    WRITTEN_WARNING = "إنذار كتابي",
    DEDUCTION_FROM_WAGE_1 = "خصم من الأجر (يوم واحد)",
    DEDUCTION_FROM_WAGE_3 = "خصم من الأجر (3 أيام)",
    DEDUCTION_FROM_WAGE_5 = "خصم من الأجر (5 أيام - الحد الأقصى الشهري)",
    SUSPENSION_WITHOUT_PAY_5 = "إيقاف عن العمل بدون أجر (5 أيام)",
    SUSPENSION_WITHOUT_PAY_10 = "إيقاف عن العمل بدون أجر (10 أيام)",
    DELAY_ANNUAL_INCREMENT = "تأجيل موعد العلاوة السنوية (بحد أقصى 3 أشهر)",
    DENIAL_OF_ANNUAL_INCREMENT = "الحرمان من العلاوة السنوية",
    DELAY_PROMOTION = "تأجيل الترقية (بحد أقصى سنة واحدة)",
    DENIAL_OF_PROMOTION = "الحرمان من الترقية",
    TERMINATION_WITH_NOTICE = "فصل من الخدمة مع صرف المكافأة ومهلة إخطار",
    TERMINATION_WITHOUT_NOTICE = "فصل من الخدمة (تحت المادة 41 - بدون مكافأة)",
    DEMOTION = "خفض الدرجة الوظيفية",
    REPRIMAND = "توبيخ رسمي موثق",
}
export enum DisciplinaryActionStatus {
    PENDING_INVESTIGATION = "بانتظار التحقيق",
    INVESTIGATION_IN_PROGRESS = "التحقيق جارٍ",
    INVESTIGATION_COMPLETE = "اكتمل التحقيق",
    ACTION_TAKEN = "تم اتخاذ الإجراء",
    CLOSED = "مغلق",
    APPEALED = "تم الاستئناف عليه",
    CANCELLED = "ملغى",
}
export interface InvestigationDetails {
    investigator: string;
    investigationStartDate?: string;
    investigationEndDate?: string;
    investigationSummary?: string;
    witnesses?: string[];
    evidence?: string[];
}
export interface DisciplinaryAction {
    id: string;
    employeeId: string;
    employeeName: string;
    violationDate: string;
    reportDate: string;
    reportedBy: string;
    violationType: ViolationTypeKuwait;
    violationDetails: string;
    investigation?: InvestigationDetails;
    linkedInvestigationId?: string;
    legalOpinionNotes?: string;
    actionTaken?: DisciplinaryPenaltyKuwait;
    penaltyDetails?: string;
    actionEffectiveDate?: string;
    status: DisciplinaryActionStatus;
    attachments?: RequestAttachment[];
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}

// -- Employee Requests --
export enum EmployeeRequestType {
    SALARY_CERTIFICATE = "طلب شهادة راتب",
    EXPERIENCE_LETTER = "طلب شهادة خبرة",
    LEAVE_ENCASHMENT = "طلب تسييل رصيد إجازات",
    GRIEVANCE_FORM = "تقديم تظلم/شكوى",
    TRANSFER_REQUEST = "طلب نقل",
    DOCUMENT_REQUEST = "طلب مستند رسمي",
    DATA_UPDATE_REQUEST = "طلب تعديل بيانات",
    OTHER = "طلب آخر",
}
export enum EmployeeRequestStatus {
    PENDING = "معلق",
    PROCESSING = "قيد المعالجة",
    APPROVED = "موافق عليه",
    COMPLETED = "مكتمل",
    REJECTED = "مرفوض",
    CANCELLED = "ملغى",
    INFO_REQUIRED = "مطلوب معلومات إضافية",
}
export interface SalaryCertificateRequestDetails {
    purposeType: 'general' | 'bank' | 'embassy' | 'other';
    specificRecipient?: string;
    includeSalaryDetails: boolean;
    language: 'ar' | 'en';
}
export interface ExperienceLetterRequestDetails {
    language: 'ar' | 'en';
    specificPeriodFrom?: string;
    specificPeriodTo?: string;
    highlightResponsibilities?: string;
}
export interface LeaveEncashmentRequestDetails {
    numberOfDays: number;
    currentLeaveBalance: number;
    calculatedAmount: number;
}
export interface GrievanceFormDetails {
    grievanceNature: string;
    detailedDescription: string;
    desiredOutcome?: string;
}
export interface TransferRequestDetails {
    currentDepartment: string;
    currentPosition: string;
    requestedDepartment: string;
    requestedPosition: string;
    reasonForTransfer: string;
}
export interface DocumentRequestDetails {
    documentNeeded: string;
    reasonForRequest?: string;
}
export interface DataUpdateRequestDetails {
    fieldToUpdate: string;
    oldValue?: string;
    newValue: string;
    reasonForUpdate?: string;
}
export interface EmployeeRequest {
    id: string;
    employeeId: string;
    employeeName: string;
    requestType: EmployeeRequestType;
    requestDate: string;
    status: EmployeeRequestStatus;
    details: SalaryCertificateRequestDetails | ExperienceLetterRequestDetails | LeaveEncashmentRequestDetails | GrievanceFormDetails | TransferRequestDetails | DocumentRequestDetails | DataUpdateRequestDetails | { typeNote: string };
    notes?: string;
    hrAdminNotes?: string;
    completionDate?: string;
    attachments?: RequestAttachment[];
    createdAt: string;
    updatedAt?: string;
    signatureUrl?: string; // Digital Signature
    signedBy?: string;
    signedAt?: string;
}

// -- Performance Appraisal --
export enum PerformanceAppraisalStatus {
    DRAFT = "مسودة",
    UNDER_REVIEW = "قيد المراجعة",
    PENDING_APPROVAL = "بانتظار الاعتماد",
    COMPLETED = "مكتملة ومعتمدة",
    REJECTED = "مرفوضة",
    CANCELLED = "ملغاة",
}

export interface PerformanceCriterion {
    name: string;
    score: number; // Usually 1 to 5
    weight?: number;
    notes?: string;
}

export enum PerformanceGoalPriority {
    LOW = "منخفضة",
    MEDIUM = "متوسطة",
    HIGH = "عالية",
}

export enum PerformanceGoalStatus {
    NOT_STARTED = "لم يبدأ",
    IN_PROGRESS = "قيد التنفيذ",
    COMPLETED = "مكتمل",
    CANCELLED = "ملغى",
    OVERDUE = "متأخر",
}

export interface PerformanceGoal {
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    progress: number; // 0 to 100
    priority: PerformanceGoalPriority;
    status: PerformanceGoalStatus;
    kpiMarkers?: string;
    managerNotes?: string;
}

export interface PeriodicReview {
    id: string;
    date: string;
    type: 'Monthly' | 'Quarterly' | 'Annual' | string;
    managerNotes: string;
    employeeNotes?: string;
    developmentRecommendations?: string;
}

export interface PerformanceAppraisal {
    id: string;
    employeeId: string;
    employeeName: string;
    employeePhotoUrl?: string;
    employeeJobTitle?: string;
    employeeDepartment?: string;
    employeeIdNumber?: string; 
    managerId: string;
    managerName: string;
    appraisalDate: string;
    appraisalPeriod: string; 
    status: PerformanceAppraisalStatus;
    
    // Snapshots
    experienceYears?: number;
    joiningDate?: string;

    // Criteria 
    criteria: {
        attendance: PerformanceCriterion;
        workQuality: PerformanceCriterion;
        speedOfDelivery: PerformanceCriterion;
        teamwork: PerformanceCriterion;
        communication: PerformanceCriterion;
        responsibility: PerformanceCriterion;
        problemSolving: PerformanceCriterion;
        leadership: PerformanceCriterion;
        creativity: PerformanceCriterion;
        policyCompliance: PerformanceCriterion;
    };
    
    overallScore: number; // Average or weighted
    overallGrade: string; 
    generalNotes?: string;

    goals: PerformanceGoal[];
    reviews: PeriodicReview[];

    recommendations?: {
        promotion: boolean;
        salaryIncrease: boolean;
        bonus: boolean;
        trainingNeeded?: string;
        warning: boolean;
        developmentPlan?: string;
    };

    signatures?: {
        manager?: { name: string; signedAt?: string; signatureUrl?: string };
        hr?: { name: string; signedAt?: string; signatureUrl?: string };
        employee?: { name: string; signedAt?: string; signatureUrl?: string };
    };

    referenceNumber: string;
    qrCodeData?: string;
    createdAt: string;
    updatedAt?: string;
}

// --- PROPERTY MANAGEMENT ---
export enum PropertyType {
    BUILDING = "بناية/عمارة",
    VILLA = "فيلا",
    SHOP = "محل تجاري",
    OFFICE = "مكتب",
    LAND = "أرض فضاء",
    OTHER = "أخرى",
}
export enum PropertyUnitStatus {
    VACANT = "شاغر",
    RENTED = "مؤجر",
    UNDER_MAINTENANCE = "تحت الصيانة",
    UNAVAILABLE = "غير متاح",
    SOLD = "مباع",
}
export enum LeaseAgreementStatus {
    DRAFT = "مسودة",
    ACTIVE = "ساري",
    EXPIRED = "منتهي",
    TERMINATED = "منتهي (تم إنهاؤه)",
    PENDING_START = "بانتظار بدء سريانه",
    PENDING_RENEWAL = "بانتظار التجديد",
    RENEWED = "مجدد",
}
export enum RentPaymentFrequency {
    MONTHLY = "شهري",
    QUARTERLY = "ربع سنوي",
    SEMI_ANNUAL = "نصف سنوي",
    ANNUAL = "سنوي",
}
export enum RentPaymentStatus {
    PAID = "مدفوع",
    PENDING = "مستحق",
    OVERDUE = "متأخر",
    PARTIALLY_PAID = "مدفوع جزئياً",
    CANCELLED = "ملغى",
    WAIVED = "معفى منه",
}
export enum PropertyCategoryKuwait {
    PRIVATE_RESIDENTIAL = "سكن خاص",
    INVESTMENT_RESIDENTIAL = "استثماري (سكني)",
    COMMERCIAL = "تجاري",
    INDUSTRIAL = "صناعي",
    AGRICULTURAL = "زراعي",
    OTHER = "أخرى",
}
export enum PropertyUnitTypeKuwait {
    APARTMENT = "شقة",
    FLOOR = "دور كامل",
    DUPLEX = "دوبلكس",
    STUDIO = "استوديو",
    SHOP = "محل",
    OFFICE = "مكتب",
    WAREHOUSE = "مخزن/قسيمة صناعية",
    CHALET = "شاليه",
    VILLA = "فيلا",
    OTHER = "أخرى",
}
export enum PropertyIntendedUseKuwait {
    RESIDENTIAL = "سكني",
    COMMERCIAL_ACTIVITY = "نشاط تجاري",
    ADMINISTRATIVE_OFFICE = "مكتب إداري",
    STORAGE = "تخزين",
    INDUSTRIAL_ACTIVITY = "نشاط صناعي",
    OTHER = "استخدام آخر",
}

export interface PropertyUnit {
    id: string;
    propertyId: string;
    unitNumber: string;
    floor?: string;
    areaSqM?: number;
    bedrooms?: number;
    bathrooms?: number;
    rentAmount?: number;
    status: PropertyUnitStatus;
    currentLeaseId?: string;
    unitType?: PropertyUnitTypeKuwait;
    intendedUse?: PropertyIntendedUseKuwait;
    amenities?: string;
}

export interface Property {
    id: string;
    name: string;
    type: PropertyType;
    address: string;
    ownerName?: string;
    paciNumber?: string;
    description?: string;
    imageUrl?: string;
    generalNotes?: string;
    propertyCategory?: PropertyCategoryKuwait;
    units?: PropertyUnit[];
    status?: PropertyUnitStatus; // For single-unit properties like a Villa or Shop
    currentLeaseId?: string; // For single-unit properties
    createdAt: string;
    updatedAt?: string;
}

export interface Tenant {
    id: string;
    fullNameAr: string;
    civilIdOrPassport: string;
    nationality: string;
    phone: string;
    email?: string;
    address?: string;
    occupation?: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
    status?: 'Current' | 'Past';
    emergencyContact?: {
        name: string;
        phone: string;
        relation: string;
    };
    previousLandlord?: {
        name: string;
        phone: string;
        rentalPeriod?: string;
        notes?: string;
    };
}

export enum LeaseTermType {
    FIXED = "محدد المدة",
    RENEWABLE = "محدد المدة (قابل للتجديد)",
    OPEN_ENDED = "غير محدد المدة (بعد انتهاء المدة الأولى)",
}

export interface LeaseAgreement {
    id: string;
    contractNumber: string;
    propertyId: string;
    unitId?: string; // Optional if property is single-unit
    tenantId: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
    rentFrequency: RentPaymentFrequency;
    paymentDueDateDay?: number;
    depositAmount?: number;
    status: LeaseAgreementStatus;
    leaseTermType?: LeaseTermType;
    purposeOfLease?: string;
    rentIncludes?: string[];
    termsAndConditions?: string;
    additionalClauses?: string[];
    latePaymentFee?: number;
    noticePeriodDays?: number;
    attachments?: RequestAttachment[];
    notes?: string;
    createdAt: string;
    updatedAt?: string;
    relatedCaseIds?: string[];
    debtSettlementId?: string;
}

export enum PaymentMethod {
    CASH = "نقدي",
    KNET = "كي-نت",
    BANK_TRANSFER = "تحويل بنكي",
    CHEQUE = "شيك",
    CREDIT_CARD = "بطاقة ائتمان",
    ONLINE_PAYMENT = "دفع إلكتروني",
    OTHER = "أخرى",
}

export interface RentPayment {
    id: string;
    leaseAgreementId: string;
    paymentDate: string;
    dueDate: string;
    amountDue: number;
    amountPaid: number;
    status: RentPaymentStatus;
    paymentMethod?: PaymentMethod;
    referenceNumber?: string;
    paymentForPeriod: string;
    notes?: string;
    recordedAt: string;
    partOfSettlementId?: string;
    isSettlement?: boolean;
}

// --- PROPERTY MANAGEMENT SUB-MODULES ---

export enum SettlementStatus {
    ACTIVE = "نشط (جاري السداد)",
    PAID_IN_FULL = "مسدد بالكامل",
    DEFAULTED = "متعثر",
    LEGAL_ACTION_PENDING = "قيد الإجراء القانوني",
    CANCELLED = "ملغى"
}

export enum PropertyDocumentType {
    DEED = "وثيقة ملكية",
    PACI_MAP = "مخطط معلومات مدنية",
    BUILDING_PERMIT = "رخصة بناء",
    SERVICE_CONTRACT_ELEVATOR = "عقد صيانة مصاعد",
    INSURANCE_POLICY = "وثيقة تأمين",
    PROPERTY_PHOTOS = "صور العقار",
    OTHER = "أخرى"
}

export interface PropertyDocument {
    id: string;
    propertyId: string;
    unitId?: string;
    documentName: string;
    documentType: PropertyDocumentType;
    issueDate?: string;
    expiryDate?: string;
    referenceNumber?: string;
    filePathOrLink?: string;
    description?: string;
    uploadedBy?: string;
    uploadedAt: string;
    tags?: string[];
    relatedCaseIds?: string[];
}

export interface EvictionNoticeRecord {
    id: string;
    leaseAgreementId: string;
    propertyId: string;
    unitId?: string;
    tenantId: string;
    noticeDate: string;
    reason: string;
    status: 'Draft' | 'Sent' | 'Delivered' | 'Received' | 'CourtCaseFiled' | 'Executed' | 'Cancelled' | 'LegalActionInProgress';
    notes?: string;
}

export interface ClearanceCertificateRecord {
    id: string;
    leaseAgreementId: string;
    propertyId: string;
    tenantId: string;
    issueDate: string;
    notes?: string;
}

export interface SettlementInstallment {
    id: string;
    installmentNumber: number;
    dueDate: string;
    amountDue: number;
    amountPaid?: number;
    paymentDate?: string;
    status: InstallmentStatus;
}

export interface DebtSettlementRecord {
    id: string;
    tenantId: string;
    tenantName: string;
    leaseAgreementId: string;
    leaseContractNumber?: string;
    propertyId?: string;
    propertyName?: string;
    originalDebtAmount: number;
    settlementDate: string;
    settledAmount: number;
    amountCollectedViaLegal?: number;
    status: SettlementStatus;
    relatedCaseId?: string;
    relatedCaseNumber?: string;
    installmentPlan?: SettlementInstallment[];
    totalInstallmentsPaidAmount?: number;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}

// --- PROPERTY MAINTENANCE ---
export enum MaintenanceCategory {
    PLUMBING = "سباكة",
    ELECTRICAL = "كهرباء",
    HVAC = "تكييف وتبريد",
    STRUCTURAL = "إنشائي/مباني",
    ELEVATOR = "مصاعد",
    PAINTING = "أصباغ",
    GENERAL = "صيانة عامة",
    OTHER = "أخرى",
}
export enum MaintenancePriority {
    URGENT = "عاجلة",
    HIGH = "عالية",
    MEDIUM = "متوسطة",
    LOW = "منخفضة",
}
export enum MaintenanceStatus {
    PENDING_APPROVAL = "بانتظار الموافقة",
    APPROVED_PENDING_ASSIGNMENT = "موافق عليها/بانتظار الإسناد",
    ASSIGNED_TO_VENDOR = "مسندة للمقاول",
    IN_PROGRESS = "قيد التنفيذ",
    ON_HOLD_PARTS_NEEDED = "معلقة (بانتظار قطع غيار)",
    ON_HOLD_TENANT_UNAVAILABLE = "معلقة (المستأجر غير متوفر)",
    COMPLETED_PENDING_REVIEW = "مكتملة (بانتظار المراجعة)",
    COMPLETED_CLOSED = "مكتملة ومغلقة",
    REJECTED = "مرفوضة",
    CANCELLED = "ملغاة",
}
export interface MaintenanceRequest {
    id: string;
    propertyId: string;
    propertyName?: string;
    unitId?: string;
    propertyUnitName?: string;
    reportedBy: string;
    reporterContact?: string;
    requestDate: string;
    description: string;
    category: MaintenanceCategory;
    priority: MaintenancePriority;
    status: MaintenanceStatus;
    assignedToVendorName?: string;
    scheduledDate?: string;
    completionDate?: string;
    estimatedCost?: number;
    cost?: number;
    invoiceNumber?: string;
    completionNotes?: string;
    attachments?: RequestAttachment[];
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}

// --- COMPANY AFFAIRS ---
export enum CompanyLegalFormKuwait {
    SOLE_PROPRIETORSHIP = "مؤسسة فردية",
    GENERAL_PARTNERSHIP = "شركة تضامن",
    LIMITED_PARTNERSHIP = "شركة توصية بسيطة",
    JOINT_VENTURE = "شركة محاصة",
    KUWAITI_SHAREHOLDING_PUBLIC = "شركة مساهمة كويتية (عامة)",
    KUWAITI_SHAREHOLDING_CLOSED = "شركة مساهمة كويتية (مقفلة)",
    LIMITED_LIABILITY = "شركة ذات مسؤولية محدودة (ذ.م.م)",
    SINGLE_PERSON_COMPANY = "شركة الشخص الواحد (ش.ش.و)",
    PROFESSIONAL_COMPANY = "شركة مهنية",
    HOLDING_COMPANY = "شركة قابضة",
}
export interface CorporateCommittee {
    id: string;
    name: string;
    description?: string;
    membersIds: string[];
    chairpersonId: string;
    frequency: string;
}

export interface CompanyProfile {
    id: string;
    companyNameAr: string;
    companyNameEn?: string;
    legalForm: CompanyLegalFormKuwait;
    registrationNumber: string;
    tradeLicenseNumber?: string;
    chamberOfCommerceNumber?: string;
    establishmentDate: string;
    capital?: number;
    paidUpCapital?: number;
    headOfficeAddress: string;
    contactInfo?: { phone?: string; email?: string; website?: string; };
    fiscalYearEnd?: string; // MM-DD
    auditorName?: string;
    shareholders?: ShareholderInfo[];
    boardMembers?: BoardMemberInfo[];
    authorizedSignatories?: AuthorizedSignatoryInfo[];
    committees?: CorporateCommittee[];
}
export interface ShareholderInfo {
    id: string;
    name: string;
    nationality: string;
    civilIdOrRegNumber: string;
    sharePercentage: number;
    numberOfShares: number;
    shareClass: string; // e.g., 'عادية', 'ممتازة', 'فئة أ'
    votingRights: boolean;
}
export enum BoardMemberPosition {
    CHAIRMAN = "رئيس مجلس الإدارة",
    VICE_CHAIRMAN = "نائب رئيس مجلس الإدارة",
    MEMBER = "عضو مجلس إدارة",
    MANAGING_DIRECTOR = "العضو المنتدب",
    SECRETARY = "مقرر المجلس",
}
export interface BoardMemberInfo {
    id: string;
    name: string;
    position: BoardMemberPosition;
    appointmentDate: string;
    termEndDate: string;
    isAuthorizedSignatory?: boolean;
}
export interface AuthorizedSignatoryInfo {
    id: string;
    name: string;
    title: string;
    signatureScope: string;
    authorityLimit?: number;
    jointSignatureRequired?: boolean;
    authorizedUntil?: string;
}
export enum CompanyMeetingType {
    FOUNDERS_ASSEMBLY = "جمعية تأسيسية",
    ORDINARY_GENERAL_ASSEMBLY = "جمعية عمومية عادية",
    EXTRAORDINARY_GENERAL_ASSEMBLY = "جمعية عمومية غير عادية",
    BOARD_OF_DIRECTORS = "اجتماع مجلس الإدارة",
    COMMITTEE = "اجتماع لجنة",
}
export interface CompanyMeeting {
    id: string;
    meetingType: CompanyMeetingType;
    meetingDate: string;
    meetingTime?: string;
    meetingLocation?: string;
    attendees?: string[];
    agendaItems?: string;
    resolutionsPassed?: string;
    minutesDocumentId?: string; // Link to a CompanyDocument
}

export enum CorporateActionType {
    CAPITAL_INCREASE = "زيادة رأس المال",
    CAPITAL_DECREASE = "تخفيض رأس المال",
    MERGER_ACQUISITION = "اندماج أو استحواذ",
    AMEND_ARTICLES_OF_ASSOCIATION = "تعديل عقد التأسيس/النظام الأساسي",
    APPOINT_BOARD_MEMBER = "تعيين عضو مجلس إدارة",
    REMOVE_BOARD_MEMBER = "عزل عضو مجلس إدارة",
    DIVIDEND_DISTRIBUTION = "توزيع أرباح",
    LIQUIDATION = "تصفية الشركة",
    OTHER = "إجراء آخر",
}

export enum CorporateActionStatus {
    PENDING_APPROVAL = "بانتظار الموافقة",
    APPROVED = "موافق عليه",
    IN_PROGRESS = "قيد التنفيذ",
    COMPLETED = "مكتمل",
    CANCELLED = "ملغى",
}

export interface CorporateAction {
    id: string;
    actionType: CorporateActionType;
    description: string;
    actionDate: string;
    status: CorporateActionStatus;
    details?: string;
    relatedDocumentsIds?: string[]; // Links to CompanyDocument
}

export enum CompanyDocumentType {
    FOUNDING_DOCUMENT = "عقد تأسيس/نظام أساسي",
    TRADE_LICENSE = "رخصة تجارية",
    MEETING_MINUTES_GA = "محضر اجتماع جمعية عمومية",
    MEETING_MINUTES_BOD = "محضر اجتماع مجلس إدارة",
    GA_RESOLUTION = "قرار جمعية عمومية",
    BOD_RESOLUTION = "قرار مجلس إدارة",
    FINANCIAL_STATEMENT = "بيان مالي",
    OTHER = "مستند آخر",
}

export enum CompanyDocumentStatus {
    DRAFT = "مسودة",
    UNDER_REVIEW = "قيد المراجعة",
    APPROVED = "معتمد",
    SIGNED = "موقع",
    SENT = "مرسل",
    RECEIVED = "مستلم",
    ACTIVE = "ساري",
    EXPIRED = "منتهي الصلاحية",
    SUPERSEDED = "تم استبداله",
    ARCHIVED = "مؤرشف",
    CANCELLED = "ملغى",
}

export interface CompanyDocument {
    id: string;
    title: string;
    documentType: CompanyDocumentType;
    documentDate: string;
    status: CompanyDocumentStatus;
    filePathOrLink?: string;
    keywords?: string[];
    notes?: string;
    meetingId?: string;
    corporateActionId?: string;
    createdAt: string;
    updatedAt?: string;
}

// --- ADMIN TOOLS ---
// Tasks specific to administrative work (distinct from general 'Task')
export enum AdminTaskStatus {
    TODO = "مطلوب",
    IN_PROGRESS = "قيد التنفيذ",
    COMPLETED = "مكتملة",
    BLOCKED = "معلقة",
    CANCELLED = "ملغاة",
    PENDING_REVIEW = "قيد المراجعة",
}
export enum AdminTaskPriority {
    LOW = "منخفضة",
    MEDIUM = "متوسطة",
    HIGH = "عالية",
    CRITICAL = "حرجة",
}
export enum AdminTaskCategory {
    FINANCE = "شؤون مالية",
    HR = "موارد بشرية",
    SECRETARIAL = "سكرتارية ومتابعة",
    IT = "تقنية معلومات",
    MARKETING = "تسويق وعلاقات عامة",
    MAINTENANCE = "صيانة وخدمات",
    STRATEGIC = "تطوير استراتيجي",
    LEGAL_ADMIN = "إدارة قانونية",
    OTHER = "أخرى"
}
export interface AdminTask {
    id: string;
    title: string;
    description?: string;
    dueDate: string;
    assignedTo: string;
    status: AdminTaskStatus;
    priority: AdminTaskPriority;
    category: AdminTaskCategory;
    progress?: number; // 0 to 100
    recurring?: boolean;
    recurrenceInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    tags?: string[];
    attachments?: string[];
    dependencyId?: string;
    relatedCaseId?: string;
    projectOrModule?: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
    completedAt?: string;
    assignerSignature?: string;
}

// Contacts
export enum ContactType {
    CLIENT = "موكل",
    OPPOSING_PARTY = "خصم",
    OPPOSING_COUNSEL = "محامي الخصم",
    JUDGE = "قاضي",
    COURT_CLERK = "أمين سر/كاتب محكمة",
    FACT_WITNESS = "شاهد واقعة",
    EXPERT_WITNESS = "شاهد خبير/خبير",
    GOVERNMENT_ENTITY = "جهة حكومية",
    SERVICE_PROVIDER = "مقدم خدمة/مورد",
    COLLEAGUE = "زميل عمل",
    PROCESS_SERVER = "مندوب إعلان",
    ADMIN_STAFF = "موظف إداري خارجي",
    OTHER = "أخرى",
}

export interface Contact {
    id: string;
    fullName: string;
    contactType: ContactType[];
    organization?: string;
    jobTitle?: string;
    phonePrimary?: string;
    phoneSecondary?: string;
    whatsapp?: string; // Add WhatsApp
    emailPrimary?: string;
    emailSecondary?: string;
    address?: string;
    city?: string;
    country?: string;
    notes?: string;
    relatedCaseIds?: string[];
    tags?: string[]; // Add tags
    isFavorite?: boolean; // Add favorite flag
    createdAt: string;
    updatedAt?: string;
    idCardPhotoUrl?: string;
    profileColor?: string; // Hex color for avatar fallback
}

// --- SMART MIND MAPS ---
export enum MindMapLayoutType {
    TREE_HORIZONTAL = 'tree_horizontal',
    ORGANIZATION_CHART = 'organization_chart',
    FLOWCHART_HORIZONTAL = 'flowchart_horizontal',
    FLOWCHART_VERTICAL = 'flowchart_vertical',
    RADIAL = 'radial',
    MINDMAP = 'mindmap',
}

export enum MindMapShape {
    ROUNDED = 'rounded',
    RECTANGLE = 'rectangle',
    PILL = 'pill',
    OVAL = 'oval',
    DIAMOND = 'diamond',
    PARALLELOGRAM = 'parallelogram',
}

export interface MindMapNode {
    id: string;
    label: string;
    content?: string;
    parentId: string | null;
    childrenIds: string[];
    color?: string; // e.g., 'bg-blue-500'
    iconName?: string; // Key for an icon component
    shape?: MindMapShape;
    position?: { x: number; y: number };
    style?: any;
    data?: any;
}
export interface MindMapEdge {
    id: string;
    sourceId: string;
    targetId: string;
    label?: string;
}
export interface MindMapData {
    id: string;
    title: string;
    layoutType: MindMapLayoutType;
    nodes: MindMapNode[];
    edges: MindMapEdge[];
    createdAt: string;
    updatedAt?: string;
    data?: any;
}
export interface AISuggestedNode {
    label: string;
    content?: string;
    children?: AISuggestedNode[];
}


// --- FINANCIAL MANAGEMENT ---
export enum FinancialTransactionType {
    REVENUE = "إيراد",
    EXPENSE = "مصروف",
    PURCHASE = "شراء أصل",
    SALARY_PAYMENT = "دفعة راتب",
    OTHER_INCOME = "إيراد آخر",
    OTHER_OUTGOING = "مصروف آخر",
}
export enum ExpenseCategory {
    RENT = "إيجار",
    UTILITIES = "فواتير وخدمات",
    SALARIES = "رواتب",
    GOVERNMENT_FEES = "رسوم حكومية",
    OFFICE_SUPPLIES = "مستلزمات مكتبية",
    MARKETING_ADVERTISING = "تسويق وإعلان",
    TRAVEL_TRANSPORTATION = "سفر وانتقالات",
    HOSPITALITY_ENTERTAINMENT = "ضيافة وترفيه",
    OTHER = "مصروفات أخرى",
}
export enum PurchaseCategory {
    OFFICE_FURNITURE = "أثاث مكتبي",
    OFFICE_EQUIPMENT = "أجهزة ومعدات مكتبية",
    VEHICLES = "مركبات",
    SOFTWARE_LICENSES = "برامج وتراخيص",
    OTHER = "أصول أخرى",
}

export interface FinancialTransaction {
    id: string;
    transactionDate: string;
    type: FinancialTransactionType;
    description: string;
    amount: number; // Positive for income, negative for expense
    currency: string;
    paymentMethod?: PaymentMethod; // Already defined in Property Management
    category?: ExpenseCategory | PurchaseCategory | string;
    vendorOrPayee?: string;
    invoiceNumber?: string;
    relatedToEntity?: 'case' | 'employee' | 'vendor' | 'client' | 'property' | 'company_profile' | 'other';
    relatedEntityId?: string;
    relatedEntityName?: string; // For display purposes
    employeeId?: string; // Specifically for salary payments
    accountCode?: string; // For accounting integration
    isRecurring?: boolean;
    recurrenceDetails?: string;
    attachments?: RequestAttachment[];
    notes?: string;
    recordedBy: string; // User who recorded it
    createdAt: string;
    updatedAt?: string;
}

// --- SETTINGS & USER MANAGEMENT ---
export enum UserStatus {
    ACTIVE = "نشط",
    INACTIVE = "غير نشط",
    PENDING_VERIFICATION = "بانتظار التفعيل",
}
export enum UserRole {
    ADMIN = "مدير النظام",
    LAWYER = "محامي",
    ASSISTANT = "مساعد قانوني/سكرتير",
    ACCOUNTANT = "محاسب",
    GUEST = "ضيف",
}
export enum Permission {
    MANAGE_USERS = "MANAGE_USERS",
    MANAGE_SETTINGS = "MANAGE_SETTINGS",
    VIEW_FINANCIALS = "VIEW_FINANCIALS",
    EDIT_FINANCIALS = "EDIT_FINANCIALS",
    VIEW_EMPLOYEE_AFFAIRS = "VIEW_EMPLOYEE_AFFAIRS",
    EDIT_EMPLOYEE_AFFAIRS = "EDIT_EMPLOYEE_AFFAIRS",
    ACCESS_AI_FEATURES = "ACCESS_AI_FEATURES",
    EXPORT_REPORTS = "EXPORT_REPORTS",
    DELETE_MASTER_RECORDS = "DELETE_MASTER_RECORDS",
    MANAGE_COMPANY_AFFAIRS = "MANAGE_COMPANY_AFFAIRS",
    USE_CAMERA = "USE_CAMERA",
    USE_MICROPHONE = "USE_MICROPHONE",
}
export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    permissions?: Permission[]; // Can override role permissions
}
export type RolePermissions = {
    [key in UserRole]: Permission[];
};

// --- KUWAIT BAR ASSOCIATION (KBA) MODULE ---
export enum KBALawyerEnrollmentStatus {
    ACTIVE = "ساري",
    EXPIRED = "منتهي",
    SUSPENDED = "موقوف",
    UNDER_REVIEW = "قيد المراجعة",
    NEW_APPLICATION = "طلب جديد",
}
export interface KBALawyerEnrollment {
    id: string;
    employeeId: string; // Link to Employee
    lawyerName: string;
    kbaEnrollmentId: string; // رقم القيد بالجمعية
    enrollmentDate: string; // تاريخ أول قيد
    lastRenewalDate: string;
    expiryDate: string;
    status: KBALawyerEnrollmentStatus;
    membershipType: string; // e.g. "مقبول أمام التمييز والدستورية"
    notes?: string;
    kbaCardCopyUrl?: string; // Link to scanned card
    createdAt: string;
    updatedAt?: string;
}

export enum KBAPublicationType {
    CIRCULAR = "تعميم",
    REGULATION_UPDATE = "تحديث لائحة",
    JOURNAL = "مجلة المحامي",
    ANNOUNCEMENT = "إعلان",
    OTHER = "إصدار آخر",
}
export interface KBAPublication {
    id: string;
    title: string;
    type: KBAPublicationType;
    documentNumber?: string;
    publishDate: string;
    summary?: string;
    filePathOrLink?: string;
    tags?: string[];
    createdAt: string;
}

export enum KBASeminarStatus {
    UPCOMING = "قادمة",
    ONGOING = "جارية الآن",
    COMPLETED = "مكتملة",
    CANCELLED = "ملغاة",
}
export enum KBASeminarRegistrationStatus {
    REGISTERED = "مسجل",
    ATTENDED = "حضر",
    ABSENT = "لم يحضر",
    NOT_REGISTERED = "غير مسجل",
}
export interface KBASeminar {
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    time?: string;
    location: string;
    organizer?: string;
    status: KBASeminarStatus;
    accreditedHours?: number;
    registrationLink?: string;
    topics?: string[];
    speakers?: string[];
    employeeAttendance?: {
        employeeId: string;
        employeeName: string;
        registrationStatus: KBASeminarRegistrationStatus;
        attendanceCertificateUrl?: string;
    }[];
    createdAt: string;
}

export interface KBAAlert {
    id: string;
    title: string;
    message: string;
    type: 'ENROLLMENT_EXPIRY' | 'SEMINAR_REMINDER' | 'NEW_PUBLICATION';
    relatedEntityId: string; // ID of the Enrollment, Seminar, or Publication
    date: string;
    isRead: boolean;
}

export enum KBAProBonoStatus {
    ACTIVE = "نشطة",
    COMPLETED = "مكتملة",
    CANCELLED = "ملغاة",
    UNDER_REVIEW = "قيد المراجعة",
}

export interface KBAProBonoAssignment {
    id: string;
    lawyerId: string;
    lawyerName: string;
    caseNumber: string;
    clientName: string;
    courtName: string;
    assignmentDate: string;
    completionDate?: string;
    status: KBAProBonoStatus;
    notes?: string;
    attachmentUrl?: string;
    createdAt: string;
}

export interface KBAMembershipFee {
    id: string;
    employeeId: string;
    employeeName: string;
    year: number;
    amount: number;
    dueDate: string;
    paymentDate?: string;
    receiptNumber?: string;
    isPaid: boolean;
    notes?: string;
    createdAt: string;
}

// --- LEGAL FORMS ---
export enum LegalFormCategoryOptions {
    CONTRACTS = "عقود واتفاقيات",
    POWERS_OF_ATTORNEY = "توكيلات",
    LEGAL_MEMOS = "مذكرات قانونية",
    LAWSUITS = "صيغ دعاوى وطلبات",
    NOTICES = "إنذارات وإخطارات",
    CORPORATE = "نماذج شركات",
    OTHER = "نماذج أخرى",
}

// --- LEGAL REPRESENTATION ---
export enum RepresentationPriority {
    NORMAL = "عادية",
    HIGH = "عالية",
    URGENT = "عاجلة",
}
export enum RepresentationRequestStatus {
    PENDING = "معلق",
    ACCEPTED = "مقبول",
    REJECTED = "مرفوض",
    COMPLETED = "مكتمل",
    CANCELLED = "ملغى",
}
export interface SubstituteLawyerProfile extends Employee {
    specializations: CaseMainType[];
    frequentedCourts: CourtLevel[];
    availabilityStatus: 'Available' | 'Busy' | 'OnLeave';
}
export interface LegalRepresentationRequest {
    id: string;
    caseId?: string;
    caseNumber?: string;
    clientName?: string;
    caseType?: CaseMainType;
    courtName: string;
    courtLevel?: CourtLevel;
    hearingRoom?: string; // Added
    judgeName?: string; // Added
    priority: RepresentationPriority; // Added
    hearingDate: string;
    hearingTime?: string;
    sessionObjective: string;
    primaryLawyerId: string;
    primaryLawyerName: string;
    substituteLawyerId?: string;
    substituteLawyerName?: string;
    status: RepresentationRequestStatus;
    requestDate: string;
    acceptanceRejectionDate?: string;
    completionDate?: string;
    notesForSubstitute?: string;
    feedbackFromSubstitute?: string;
    attachedFileNames?: string[];
    createdAt: string;
    updatedAt?: string;
    // E-Signature additions
    signatureUrl?: string;
    signedBy?: string;
    signedAt?: string;
}

// --- NOTIFICATIONS MANAGEMENT ---
export enum NotificationChannel {
    EMAIL = "بريد إلكتروني",
    WHATSAPP = "واتساب",
    SYSTEM = "إشعار بالنظام",
    SMS = "رسالة نصية SMS",
}

export enum SystemNotificationStatus {
    PENDING = "قيد الإرسال",
    SENT = "مرسل",
    FAILED = "فشل الإرسال",
    VIEWED = "تم الاطلاع",
}

export enum NotificationPriority {
    LOW = "منخفض",
    NORMAL = "عادي",
    HIGH = "عالي",
    URGENT = "عاجل",
}

export enum NotificationCategory {
    REMINDER = "تذكير",
    URGENT = "عاجل",
    IMPORTANT = "هام",
    ADMINISTRATIVE = "إداري",
    INFORMATIONAL = "معلوماتي",
}

export enum NotificationType {
    // Cases
    NEW_CASE_ASSIGNED = "إسناد قضية جديدة",
    HEARING_REMINDER = "تذكير بموعد جلسة",
    CASE_STATUS_UPDATED = "تحديث حالة قضية",
    CASE_DEADLINE_APPROACHING = "اقتراب موعد هام في قضية",
    // Contracts
    CONTRACT_ANALYSIS_COMPLETED = "اكتمال تحليل عقد",
    CONTRACT_RENEWAL_DUE = "استحقاق تجديد عقد",
    // Compliance
    COMPLIANCE_DUE_SOON = "اقتراب استحقاق متطلب امتثال",
    COMPLIANCE_OVERDUE = "تجاوز استحقاق متطلب امتثال",
    // Employees
    NEW_LEAVE_REQUEST_FOR_APPROVAL = "طلب إجازة جديد للموافقة",
    LEAVE_REQUEST_STATUS_CHANGED = "تحديث حالة طلب إجازة",
    NEW_LOAN_REQUEST_FOR_APPROVAL = "طلب قرض جديد للموافقة",
    LOAN_REQUEST_STATUS_CHANGED = "تحديث حالة طلب قرض",
    LOAN_INSTALLMENT_DUE = "استحقاق قسط قرض",
    DISCIPLINARY_ACTION_UPDATE = "تحديث إجراء تأديبي",
    NEW_EMPLOYEE_REQUEST = "طلب موظف جديد",
    EMPLOYEE_REQUEST_PROCESSED = "معالجة طلب موظف",
    // Legal Rep
    NEW_LEGAL_REPRESENTATION_REQUEST = "طلب إنابة قانونية جديد",
    LEGAL_REPRESENTATION_STATUS_UPDATE = "تحديث حالة طلب إنابة",
    // Tasks
    TASK_ASSIGNED_TO_YOU = "إسناد مهمة جديدة لك",
    TASK_DUE_REMINDER = "تذكير بموعد استحقاق مهمة",
    TASK_OVERDUE_ALERT = "تنبيه بتأخر مهمة",
    TASK_STATUS_UPDATED = "تحديث حالة مهمة",
    // Documents/Leases
    IMPORTANT_DOCUMENT_EXPIRY_WARNING = "تحذير بانتهاء صلاحية مستند هام",
    LEASE_EXPIRY_APPROACHING = "اقتراب انتهاء عقد إيجار",
    // Financial
    PAYMENT_DUE_REMINDER = "تذكير بدفعة مستحقة",
    // System
    SYSTEM_MAINTENANCE_NOTICE = "إشعار صيانة للنظام",
    GENERAL_ANNOUNCEMENT = "إعلان عام",
}

export interface SystemNotification {
    id: string;
    type: NotificationType;
    category: NotificationCategory;
    priority: NotificationPriority;
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    isSnoozed?: boolean;
    snoozedUntil?: string; // ISO string
    isMuted?: boolean;
    relatedEntityId?: string; // e.g. caseId, taskId
    actionUrl?: string;
    assignedTo?: string; // User ID
}

export interface NotificationSettingItem {
    id: string; // Same as NotificationType enum key
    type: NotificationType;
    description: string;
    emailEnabled: boolean;
    whatsappEnabled: boolean;
    smsEnabled?: boolean;
    systemEnabled: boolean;
    managerAlertEnabled?: boolean;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    reminderIntervals?: number[]; // e.g. [5, 15, 60, 1440, 10080] minutes
}
export interface NotificationModuleSettings {
    senderEmail: string;
    managerEmailForAlerts: string;
    whatsappBusinessNumber: string;
    smsGatewayKey?: string; // New
    notificationSettings: NotificationSettingItem[];
    isPaused?: boolean; // New: System-wide master switch
    quietHours?: { // New: DND mode
        enabled: boolean;
        start: string; // HH:mm
        end: string; // HH:mm
        timezone: string;
    };
    digestFrequency?: 'instant' | 'daily' | 'weekly'; // New
}
export interface NotificationLogEntry {
    id: string;
    notificationType: NotificationType;
    channel: NotificationChannel;
    recipient: string; // email, phone, or user name
    dateTime: string;
    status: SystemNotificationStatus;
    subject?: string; // for email
    messagePreview?: string;
}

// --- PARTY TRACKING ---
export enum PartyRelationshipType {
    DELEGATE = "مندوب",
    CASE_FOLLOWER = "معقب قضايا",
    CLIENT = "موكل",
    OPPOSING_PARTY = "خصم",
    WITNESS = "شاهد",
    OTHER = "أخرى",
}
export enum TrackingStatus {
    PREPARING_TO_LEAVE = "يستعد للخروج",
    ON_THE_WAY = "في الطريق",
    ARRIVED_AT_LOCATION = "وصل إلى الموقع العام",
    AT_SPECIFIC_DEPARTMENT = "في القسم المختص",
    MET_WITH_ASSIGNED_LAWYER = "اجتمع مع المحامي المسؤول",
    TASK_IN_PROGRESS = "قيد إنجاز المهمة",
    TASK_COMPLETED = "أنجز المهمة",
    RETURNED_TO_OFFICE = "عاد إلى المكتب",
    DELAYED = "متأخر",
    UNABLE_TO_COMPLETE = "تعذر إنجاز المهمة",
}
export enum FieldTaskCategory {
    JUDICIAL_NOTIFICATION = "إعلان قضائي",
    DOCUMENT_FILING = "إيداع مستندات/صحف",
    COURT_RESEARCH = "استعلام/بحوث قضائية",
    DEBT_COLLECTION = "تحصيل مديونيات",
    FIELD_VISIT = "زيارة ميدانية/معاينة",
    ADMIN_FOLLOWUP = "متابعة إدارية",
    OTHER = "أخرى",
}
export interface TrackingLocationDetails {
    courtOrDepartmentName: string;
    floor?: string;
    sectionOrOffice?: string;
    gpsCoordinates?: { lat: number, lon: number };
}
export interface TrackingEntry {
    id: string;
    timestamp: string;
    status: TrackingStatus;
    locationDetails?: TrackingLocationDetails;
    recordedBy: string; // User name or 'System'
    notes?: string;
    attachmentUrls?: string[]; // Added: photos or document scans
}
export interface TrackableParty {
    id: string;
    fullName: string;
    phone: string;
    email?: string;
    relationshipType: PartyRelationshipType;
    organizationOrOffice?: string;
    idCardPhotoUrl?: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
}
export interface PartyAssignment {
    id: string;
    trackablePartyId: string;
    trackablePartyName: string;
    caseId?: string;
    caseNumber?: string;
    taskCategory: FieldTaskCategory; // Added
    taskDescription: string;
    destination: TrackingLocationDetails;
    assignedByLawyerId: string;
    assignedByLawyerName: string;
    expectedStartTime?: string;
    expectedEndTime?: string;
    currentStatus: TrackingStatus;
    lastLocationUpdate?: TrackingLocationDetails;
    trackingLog: TrackingEntry[];
    lastUpdateTimestamp: string;
    createdAt: string;
    updatedAt?: string;
    // E-Signature
    signatureUrl?: string;
    signedBy?: string;
    signedAt?: string;
    mainAttachmentUrl?: string; // Added: primary document scan
}

// --- INVESTIGATIONS ---
export enum InvestigationStatus {
    ONGOING = 'جارٍ',
    CLOSED = 'مغلق',
    ON_HOLD = 'معلق',
}
export enum InvestigationPartyType {
    EMPLOYEE_UNDER_COMPLAINT = 'موظف (مشكو بحقه)',
    WITNESS = 'شاهد',
    COMPLAINANT = 'مقدم الشكوى',
    EXPERT = 'خبير فني',
    OTHER = 'طرف آخر',
}
export interface InvestigationQuestion {
    id: string;
    questionText: string;
    answerText?: string;
    timestamp: string;
}
export interface InvestigationSession {
    id: string;
    sessionDate: string;
    partyName: string;
    partyType: InvestigationPartyType;
    questions: InvestigationQuestion[];
    partySignature?: string;
    investigatorSignature?: string;
}
export interface Investigation {
    id: string;
    investigationNumber: string;
    subject: string;
    investigator: string;
    status: InvestigationStatus;
    startDate: string;
    endDate?: string;
    summary?: string;
    recommendation?: string;
    sessions: InvestigationSession[];
    relatedDisciplinaryActionId?: string;
    relatedCaseIds?: string[];
    createdAt: string;
    updatedAt?: string;
}