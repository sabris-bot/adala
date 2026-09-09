import { Case, CaseStatus, CaseMainType, CasePriority, CourtLevel, LitigationStage, RiskLevel } from '../types';

export const initialCases: Case[] = [
  {
    id: 'case-1',
    title: 'دعوى مطالبة مالية وتعويض عن إخلال تعاقدي بتوريد أجهزة ومعدات',
    caseNumber: 'COM-2026-0412',
    internalCaseNumber: 'INT-2026-001',
    fileNumber: 'FL-2026-44',
    clientName: 'شركة الفنار للتجارة والمقاولات',
    clientRole: 'مدعي',
    group: 'مجموعة أ - قضايا تجارية كبرى',
    caseMainType: CaseMainType.COMMERCIAL,
    status: CaseStatus.OPEN,
    priority: CasePriority.HIGH,
    riskLevel: RiskLevel.MEDIUM,
    assignedLawyer: 'أ. صبري أحمد شطا',
    courtName: 'قصر العدل - الدائرة التجارية الكلية',
    courtLevel: CourtLevel.FIRST_INSTANCE,
    litigationStage: LitigationStage.FIRST_INSTANCE,
    circuit: 'الدائرة ٣ تجاري كلي',
    opposingPartyName: 'مينا هومز للاستيراد والتصدير',
    opponentRole: 'مدعى عليه',
    filingDate: '2026-03-05',
    description: 'دعوى مطالبة مالية بقيمة 85,000 د.ك تعويضاً عن الإخلال ببنود التعاقد وتوريد شحنة تالفة وغير مطابقة للمواصفات الفنية المتفق عليها.',
    financials: {
      totalFees: 3500,
      paid: 1500,
      remaining: 2000,
      currency: 'د.ك'
    },
    nextHearingDate: '2026-06-12',
    caseFiles: [
      { id: 'f-1-1', fileName: 'عقد_توريد_المعدات_الموقع.pdf', fileType: 'Contract', fileUrl: '#', uploadedAt: '2026-03-06' },
      { id: 'f-1-2', fileName: 'تقرير_الخبير_الفني_النهائي.pdf', fileType: 'Expert Report', fileUrl: '#', uploadedAt: '2026-05-16' },
      { id: 'f-1-3', fileName: 'صحيفة_الدعوى_التجارية_الكلية.pdf', fileType: 'Pleading', fileUrl: '#', uploadedAt: '2026-03-05' },
      { id: 'f-1-4', fileName: 'كشف_حركات_الحساب_البنكي.xlsx', fileType: 'Evidence', fileUrl: '#', uploadedAt: '2026-04-12' }
    ],
    hearings: [
      {
        id: 'h-1-1',
        date: '2026-06-12',
        time: '09:30',
        courtRoomOrLocation: 'قصر العدل - قاعة ١٢ تجاري كلي',
        type: 'جلسة دفاع ومرافعة شفهية',
        status: 'Scheduled',
        notes: 'تقديم مذكرة الرد على تقرير الخبير وإيداع حوافظ مستندات جديدة.'
      },
      {
        id: 'h-1-2',
        date: '2026-05-15',
        time: '10:00',
        courtRoomOrLocation: 'مكتب الخبير الحسابي المندوب',
        type: 'حضور أمام إدارة الخبراء',
        status: 'Completed',
        notes: 'تم تقديم كشوف الحساب ومراجعة مستحقات الموكل وتثبيت حق الامتياز.'
      }
    ],
    createdDate: '2026-03-05T08:00:00Z'
  },
  {
    id: 'case-2',
    title: 'منازعة عمالية بشأن مستحقات مالية متأخرة ومكافأة نهاية الخدمة',
    caseNumber: 'LAB-2026-9210',
    internalCaseNumber: 'INT-2026-002',
    fileNumber: 'FL-2026-12',
    clientName: 'م. أحمد خالد العتيبي',
    clientRole: 'مدعي',
    group: 'مجموعة ب - الشؤون العمالية',
    caseMainType: CaseMainType.LABOR,
    status: CaseStatus.IN_PROGRESS,
    priority: CasePriority.NORMAL,
    riskLevel: RiskLevel.LOW,
    assignedLawyer: 'أ. صبري أحمد شطا',
    courtName: 'مجمع محاكم الرقعي - المحكمة العمالية',
    courtLevel: CourtLevel.LABOR_COURT,
    litigationStage: LitigationStage.FIRST_INSTANCE,
    circuit: 'الدائرة ٥ عمالي جزئي',
    opposingPartyName: 'الشركة العربية الموحدة للمقاولات العامة',
    opponentRole: 'مدعى عليه',
    filingDate: '2026-04-10',
    description: 'دعوى عمالية للمطالبة ببدل إجازات ومكافأة نهاية الخدمة والتعويض عن الفصل التعسفي حسب قانون العمل الكويتي رقم 6 لسنة 2010.',
    financials: {
      totalFees: 1200,
      paid: 600,
      remaining: 600,
      currency: 'د.ك'
    },
    nextHearingDate: '2026-06-18',
    caseFiles: [
      { id: 'f-2-1', fileName: 'عقد_العمل_المبرم.pdf', fileType: 'Contract', fileUrl: '#', uploadedAt: '2026-04-11' },
      { id: 'f-2-2', fileName: 'مذكرة_حساب_مكافأة_نهاية_الخدمة_التفصيلية.pdf', fileType: 'Evidence', fileUrl: '#', uploadedAt: '2026-05-20' },
      { id: 'f-2-3', fileName: 'كشف_الحضور_والانصراف_البصمة.xlsx', fileType: 'Evidence', fileUrl: '#', uploadedAt: '2026-05-15' },
      { id: 'f-2-4', fileName: 'صحيفة_افتتاح_الدعوى_العمالية.pdf', fileType: 'Pleading', fileUrl: '#', uploadedAt: '2026-04-10' }
    ],
    hearings: [
      {
        id: 'h-2-1',
        date: '2026-06-18',
        time: '11:00',
        courtRoomOrLocation: 'مجمع محاكم الرقعي - قاعة ٧ عمالي',
        type: 'جلسة تمهيدية لتقديم الدفوع',
        status: 'Scheduled',
        notes: 'بانتظار رد جهة العمل على تقرير الرواتب وبدل السكن.'
      }
    ],
    createdDate: '2026-04-10T09:00:00Z'
  },
  {
    id: 'case-3',
    title: 'دعوى بطلان عقد إيجار وإخلاء عقار تجاري للاستغلال السكني والمخالفة',
    caseNumber: 'RNT-2025-0105',
    internalCaseNumber: 'INT-2025-081',
    fileNumber: 'FL-2025-103',
    clientName: 'شركة النخيل لإدارة العقارات',
    clientRole: 'مدعي',
    group: 'مجموعة ج - النزاعات الإيجارية والعقارية',
    caseMainType: CaseMainType.REAL_ESTATE,
    status: CaseStatus.CLOSED,
    priority: CasePriority.NORMAL,
    riskLevel: RiskLevel.LOW,
    assignedLawyer: 'أ. صبري أحمد شطا',
    courtName: 'محكمة حولي - محكمة الإيجارات والإنذارات',
    courtLevel: CourtLevel.RENT_COURT,
    litigationStage: LitigationStage.FIRST_INSTANCE,
    circuit: 'الدائرة ٢ إيجارات كلي حولي',
    opposingPartyName: 'سعد بدر الحربي',
    opponentRole: 'مدعى عليه',
    filingDate: '2025-11-12',
    description: 'المطالبة بإخلاء المحل التجاري المؤجر لعدم سداد الأجرة الشهرية المتأخرة وإحداث تلفيات جسيمة بأساسات المبنى.',
    financials: {
      totalFees: 2000,
      paid: 2000,
      remaining: 0,
      currency: 'د.ك'
    },
    hearings: [
      {
        id: 'h-3-1',
        date: '2026-01-20',
        time: '08:30',
        courtRoomOrLocation: 'محكمة حولي - قاعة ١ مستأجرين',
        type: 'جلسة الحكم النهائي',
        status: 'Completed',
        notes: 'صدر حكم بالفسخ والإخلاء الفوري وتسليم العقار خالياً من الشواغل لصالح موكلنا.'
      }
    ],
    createdDate: '2025-11-12T10:00:00Z',
    closedDate: '2026-01-25T14:00:00Z'
  },
  {
    id: 'case-4',
    title: 'دعوى تعويض عن أضرار مادية وتعدي فكري على برمجيات المحاسبة السحابية',
    caseNumber: 'IP-2026-7788',
    internalCaseNumber: 'INT-2026-033',
    fileNumber: 'FL-2026-91',
    clientName: 'بوابة الخليج لتقنية المعلومات',
    clientRole: 'مدعي',
    group: 'مجموعة أ - قضايا تجارية كبرى',
    caseMainType: CaseMainType.INTELLECTUAL_PROPERTY,
    status: CaseStatus.PENDING,
    priority: CasePriority.HIGH,
    riskLevel: RiskLevel.HIGH,
    assignedLawyer: 'أ. صبري أحمد شطا',
    courtName: 'قصر العدل - دائرة الملكية الفكرية الكلية',
    courtLevel: CourtLevel.FIRST_INSTANCE,
    litigationStage: LitigationStage.FIRST_INSTANCE,
    circuit: 'الدائرة الأولى تمييز وملكية فكرية كبرى',
    opposingPartyName: 'مؤسسة السحاب الرقمي للمقاولات البرمجية',
    opponentRole: 'مدعى عليه',
    filingDate: '2026-05-02',
    description: 'قضية تعدي على حقوق الملكية الفكرية والعلامة التجارية لنظام مالي وإعادة توزيعه دون إذن كتابي من المالك الحصري.',
    financials: {
      totalFees: 5000,
      paid: 1000,
      remaining: 4000,
      currency: 'د.ك'
    },
    nextHearingDate: '2026-06-30',
    hearings: [
      {
        id: 'h-4-1',
        date: '2026-06-30',
        time: '10:00',
        courtRoomOrLocation: 'قصر العدل - قاعة ١ إداري استئنافي كبار',
        type: 'جلسة تمهيدية لتبادل الدفوع',
        status: 'Scheduled',
        notes: 'تجهيز صحيفة الدعوى والشهادات الفنية المثبتة لنسب النظام وقاعدة البيانات.'
      },
      {
        id: 'h-4-2',
        date: '2026-05-10',
        time: '09:00',
        courtRoomOrLocation: 'إدارة السجل والتحقيق الفني بوزارة التجارة الكويتية',
        type: 'جلسة معاينة ومعايرة فنية',
        status: 'Cancelled',
        notes: 'تم إلغاء الجلسة بطلب من المدعي لدراسة عرض الصلح الودي المقدم.'
      }
    ],
    createdDate: '2026-05-02T11:00:00Z'
  },
  {
    id: 'case-5',
    title: 'استئناف حكم تصفية أموال شركة مكي وشركاه للمقاولات والخرسانة جاهزة الخلط',
    caseNumber: 'APP-2026-1049',
    internalCaseNumber: 'INT-2026-015',
    fileNumber: 'FL-2026-18',
    clientName: 'أبناء فهد جاسم الغانم',
    clientRole: 'مستأنف',
    group: 'مجموعة أ - قضايا تجارية كبرى',
    caseMainType: CaseMainType.COMMERCIAL,
    status: CaseStatus.APPEALED,
    priority: CasePriority.URGENT,
    riskLevel: RiskLevel.HIGH,
    assignedLawyer: 'أ. صبري أحمد شطا',
    courtName: 'قصر العدل - محكمة الاستئناف العليا',
    courtLevel: CourtLevel.APPEALS_COURT,
    litigationStage: LitigationStage.APPEAL,
    circuit: 'الدائرة ٣ استئناف تجاري عاجل',
    opposingPartyName: 'البنك التجاري الكويتي للتسهيلات',
    opponentRole: 'مستأنف ضده',
    filingDate: '2026-02-18',
    description: 'استئناف الحكم الصادر بالتصفية الجبرية لصالح الدائنين والطعن على تقرير المصفي القضائي لوجود أصول عقارية كافية للسداد.',
    financials: {
      totalFees: 6000,
      paid: 3000,
      remaining: 3000,
      currency: 'د.ك'
    },
    nextHearingDate: '2026-06-25',
    hearings: [
      {
        id: 'h-5-1',
        date: '2026-06-25',
        time: '10:30',
        courtRoomOrLocation: 'قصر العدل - قاعة ٢ استئناف عالي',
        type: 'جلسة تداول وتقديم مستندات',
        status: 'Scheduled',
        notes: 'المطالبة بوقف نفاذ التصفية مؤقتاً لحين الفصل النهائي بالاستئناف.'
      },
      {
        id: 'h-5-2',
        date: '2026-06-02',
        time: '09:00',
        courtRoomOrLocation: 'قصر العدل - قاعة ٢ استئناف عالي',
        type: 'جلسة مرافعة وتقرير المقدر البنكي',
        status: 'Postponed',
        notes: 'تم تأجيل الجلسة لإشعار البنك بالرد النهائي وبسبب عدم حضور ممثل الخبير العقاري.'
      }
    ],
    createdDate: '2026-02-18T12:00:00Z'
  },
  {
    id: 'case-6',
    title: 'طعن بالتمييز الإداري ضد قرار بلدية الكويت بإغلاق الهنغار المركزي للتوريد',
    caseNumber: 'CAS-2026-8801',
    internalCaseNumber: 'INT-2026-054',
    fileNumber: 'FL-2026-72',
    clientName: 'مؤسسة الشعلة للاستيراد الغذائي المبرد',
    clientRole: 'طاعن',
    group: 'مجموعة د - القضايا الإدارية ومنازعات الدولة',
    caseMainType: CaseMainType.ADMINISTRATIVE,
    status: CaseStatus.ON_HOLD,
    priority: CasePriority.HIGH,
    riskLevel: RiskLevel.MEDIUM,
    assignedLawyer: 'أ. صبري أحمد شطا',
    courtName: 'قصر العدل - محكمة التمييز العليا',
    courtLevel: CourtLevel.CASSATION_COURT,
    litigationStage: LitigationStage.CASSATION,
    circuit: 'الدائرة الإدارية الثالثة عشرة تمييز',
    opposingPartyName: 'مدير عام بلدية الكويت بصفته',
    opponentRole: 'مطعون ضده',
    filingDate: '2026-01-08',
    description: 'الطعن بالتمييز الإداري لتجاوز بلدية الكويت سلطة استعمال الحق وإصدار قرار إغلاق إداري تعسفي يهدد سلامة المواد الغذائية المستوردة ذات الصلاحية المحدودة بملايين الدنانير.',
    financials: {
      totalFees: 4500,
      paid: 2500,
      remaining: 2000,
      currency: 'د.ك'
    },
    createdDate: '2026-01-08T14:30:00Z'
  }
];
