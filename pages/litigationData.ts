import { CaseStatus, RiskLevel, CaseMainType, CasePriority, CourtLevel, LitigationStage } from '../types';

export interface LitigationCase {
    id: string;
    title: string;
    caseNumber: string;
    automatedNo: string;
    clientName: string;
    clientRole: string;
    opponentName: string;
    opponentRole: string;
    court: string;
    circuit: string;
    status: CaseStatus;
    priority: CasePriority;
    risk: RiskLevel;
    assignedLawyer: string;
    filingDate: string;
    nextHearingDate?: string;
    financials: {
        totalFees: number;
        paid: number;
        remaining: number;
    };
    notes?: string;
}

export interface LitigationHearing {
    id: string;
    caseNumber: string;
    caseTitle: string;
    court: string;
    room: string;
    date: string;
    time: string;
    type: string;
    status: 'Scheduled' | 'Completed' | 'Postponed' | 'Cancelled';
    assignedLawyer: string;
    outcome?: string;
}

export interface EnforcementAction {
    id: string;
    executionNo: string;
    caseNumber: string;
    clientName: string;
    debtorName: string;
    awardedAmount: number;
    paidAmount: number;
    status: 'Open' | 'Travel_Ban_Issued' | 'Seizure_Active' | 'Bank_Freeze' | 'Settled';
    actionsTaken: string[];
    lastUpdateDate: string;
    notes?: string;
}

export interface JudgmentEntry {
    id: string;
    caseNumber: string;
    caseTitle: string;
    courtLevel: CourtLevel;
    issueDate: string;
    judgeName: string;
    verdictSummary: string;
    legalGrounds: string;
    status: 'Final' | 'Appealed' | 'Enforcing' | 'Suspended';
}

export interface AppealEntry {
    id: string;
    caseNumber: string;
    originalJudgmentDate: string;
    deadlineDate: string;
    remainingDays: number;
    status: 'Drafting' | 'Filed' | 'Expired' | 'Rejected';
    courtBranch: string;
    appealGrounds: string;
}

export interface CassationEntry {
    id: string;
    caseNumber: string;
    appealJudgmentDate: string;
    cassationNo: string;
    deadlineDate: string;
    remainingDays: number;
    status: 'Preparing' | 'In_Consultation' | 'Scheduled' | 'Decided';
    grounds: string;
}

export interface MemoEntry {
    id: string;
    title: string;
    category: 'مرافعة ختامية' | 'جوابية دفاعية' | 'صحيفة استئناف' | 'عريضة تمييز' | 'تظلم إداري';
    caseType: string;
    authorName: string;
    content: string;
    lastModified: string;
    tags: string[];
}

export interface FollowupTask {
    id: string;
    delegateName: string;
    caseNumber: string;
    category: string;
    description: string;
    court: string;
    status: 'PREPARING' | 'ON_WAY' | 'EXECUTING' | 'COMPLETED' | 'FAILED';
    notes?: string;
    reportedAt?: string;
}

export interface CourtEntry {
    id: string;
    name: string;
    location: string;
    phone: string;
    workingHours: string;
    activeStatus: 'Active' | 'Maintenance';
}

export interface CircuitEntry {
    id: string;
    name: string;
    courtName: string;
    headJudge: string;
    type: string;
    sessionDay: string;
}

export interface ClientProfile {
    id: string;
    name: string;
    type: 'Corporate' | 'Individual';
    civilOrRegId: string;
    phone: string;
    email: string;
    activeCasesCount: number;
    trustScore: 'Excellent' | 'Good' | 'Risky';
}

export interface OpposingParty {
    id: string;
    name: string;
    legalRepName: string;
    phone: string;
    activeCasesCount: number;
    riskStatus: 'Aggressive' | 'Cooperative' | 'Hostile';
}

export interface LawyerEntry {
    id: string;
    name: string;
    membershipNo: string;
    degree: 'أ' | 'ب' | 'ج' | 'دستورية وتمييز';
    status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
    activeCasesCount: number;
    email: string;
}

export interface NotificationNotice {
    id: string;
    recipientName: string;
    caseNumber: string;
    type: 'صحيفة دعوى' | 'إنذار رسمي' | 'إقرار حكم' | 'تنفيذ جبري';
    deliveryMethod: 'سهل الحكومي' | 'مندوب محكمة' | 'بريد مسجل';
    sentDate: string;
    status: 'Delivered' | 'Pending' | 'Refused' | 'Returned';
}

export interface LegalReport {
    id: string;
    title: string;
    period: string;
    generatedAt: string;
    winRatio: number;
    collectedAmounts: number;
    activeCasesCount: number;
    creator: string;
}

export interface DocumentAttachment {
    id: string;
    title: string;
    caseNumber: string;
    fileSize: string;
    fileType: 'PDF' | 'Word' | 'Image';
    category: 'توكيل رسمي' | 'صحيفة دعوى' | 'تقرير خبير' | 'سند دين';
    uploadedAt: string;
}

export interface ScheduleAppointment {
    id: string;
    title: string;
    date: string;
    time: string;
    category: 'جلسة خبراء' | 'اجتماع موكل' | 'إجراء قلم كتاب' | 'تسوية ودية';
    location: string;
    assignedLawyer: string;
}

export interface LegalTask {
    id: string;
    title: string;
    caseNumber: string;
    assignedTo: string;
    priority: 'High' | 'Medium' | 'Low';
    dueDate: string;
    status: 'Pending' | 'In_Progress' | 'Completed' | 'Overdue';
}

// --- Dynamic Kuwait-specific Seed Data ---
export const initialCases: LitigationCase[] = [
    {
        id: 'case-1',
        title: 'مطالبة بتعويض مادي وأدبي عن إخلال ببنود تصفية مقاولة تجارية بقطاع النفط',
        caseNumber: '988221054',
        automatedNo: '20261109924',
        clientName: 'ناصر فهد العتيبي (شركة الأمل العقارية)',
        clientRole: 'مدعي',
        opponentName: 'شركة الخليج للخدمات البترولية',
        opponentRole: 'مدعى عليه',
        court: 'قصر العدل (محكمة العاصمة)',
        circuit: 'الدائرة التجارية السادسة كلي / 15',
        status: CaseStatus.IN_PROGRESS,
        priority: CasePriority.HIGH,
        risk: RiskLevel.MEDIUM,
        assignedLawyer: 'أ. صبري أحمد شطا',
        filingDate: '2025-11-12',
        nextHearingDate: '2026-05-24',
        financials: { totalFees: 12000, paid: 5500, remaining: 6500 },
        notes: 'المستندات مدعمة بتقرير فني صادر عن مكتب المهندسين الاستشاريين المعتمد بالهيئة النفطية.'
    },
    {
        id: 'case-2',
        title: 'بطلان قرار جمعية عمومية غير عادية لشركة الصناعات الوطنية والشركاء',
        caseNumber: '445/2026 تجاري',
        automatedNo: '20260049911',
        clientName: 'مصنع الخليج للبلاستيك والمشتقات الإنشائية',
        clientRole: 'مدعي (طالب بطلان)',
        opponentName: 'مجموعة الصناعات الوطنية القابضة بصفته رئيسها',
        opponentRole: 'مدعى عليه',
        court: 'مجمع محاكم الرقعي (الفروانية)',
        circuit: 'الدائرة التجارية الكلية لأسواق المال / 2',
        status: CaseStatus.OPEN,
        priority: CasePriority.URGENT,
        risk: RiskLevel.HIGH,
        assignedLawyer: 'أ. فاطمة علي الكندري',
        filingDate: '2026-01-15',
        nextHearingDate: '2026-05-28',
        financials: { totalFees: 25000, paid: 15000, remaining: 10000 },
        notes: 'الاستناد لنصوص قانون الشركات رقم 1/2016 لعدم اكتمال النصاب المحدد للتصويت.'
    },
    {
        id: 'case-3',
        title: 'دعوى عمالية للمطالبة ببدل إضافي ومكافأة نهاية خدمة وطرد تعسفي',
        caseNumber: '112/2026 عمالي',
        automatedNo: '20260081234',
        clientName: 'المهندس ناصر العجمي',
        clientRole: 'مدعي (عامل)',
        opponentName: 'شركة الكيماويات البترولية الوطنية الكبرى',
        opponentRole: 'مدعى عليه (مستخدِم)',
        court: 'مجمع محاكم مجمع الرقعي',
        circuit: 'الدائرة العمالية الكلية / 3',
        status: CaseStatus.PENDING,
        priority: CasePriority.NORMAL,
        risk: RiskLevel.LOW,
        assignedLawyer: 'أ. صبري أحمد شطا',
        filingDate: '2025-08-10',
        nextHearingDate: '2026-05-25',
        financials: { totalFees: 4500, paid: 2000, remaining: 2500 },
        notes: 'تمت مباشرة الاجتماع أمام الخبير الحسابي لوزارة العدل وتحديد مستحقات الأجور الإضافية بموجب قانون العمل 6/2010.'
    },
    {
        id: 'case-4',
        title: 'طرد للغصب وإخلاء سكن استثماري مع المطالبة بالقيمة الإيجارية المتأخرة',
        caseNumber: '992/2025 إيجارات',
        automatedNo: '20250031120',
        clientName: 'مجموعة الأنوار العقارية والإنشاءات',
        clientRole: 'مدعي (مؤجر)',
        opponentName: 'خالد جاسم المحمد',
        opponentRole: 'مدعى عليه (مستأجر ممتنع)',
        court: 'مجمع محاكم حولي',
        circuit: 'دائرة إعسار وإخلاء عقارات حولي الدائرة 5',
        status: CaseStatus.CLOSED,
        priority: CasePriority.HIGH,
        risk: RiskLevel.LOW,
        assignedLawyer: 'أ. أحمد محمود الهاجري',
        filingDate: '2025-05-04',
        financials: { totalFees: 3200, paid: 3200, remaining: 0 },
        notes: 'صدر حكم نهائي بالإخلاء والتسليم واستصدار أمر تنفيذ منع السفر تم تسويته لاحقاً.'
    },
    {
        id: 'case-5',
        title: 'تظلم إداري ضد قرار إنهاء خدمة مهندس وظيفي بوزارة الأوقاف والكهرباء',
        caseNumber: '110223948 الطعن',
        automatedNo: '20260012999',
        clientName: 'أحمد سالم الرشيدي',
        clientRole: 'مدعي (طاعن إداري)',
        opponentName: 'وكيل وزارة الأوقاف والكهرباء بصفته',
        opponentRole: 'مدعى عليه (الإدارة الحكومية)',
        court: 'قصر العدل - الدائرة الإدارية السادسة',
        circuit: 'دائرية التظلمات والموظفين الحكوميين',
        status: CaseStatus.IN_PROGRESS,
        priority: CasePriority.URGENT,
        risk: RiskLevel.HIGH,
        assignedLawyer: 'أ. مريم العتيبي',
        filingDate: '2026-02-18',
        nextHearingDate: '2026-06-02',
        financials: { totalFees: 8000, paid: 4000, remaining: 4000 },
        notes: 'تقديم التظلم الإداري في المواعيد القانونية. الدفع بتجاوز الصلاحيات الإدارية والتعسف الوظيفي.'
    }
];

export const initialHearings: LitigationHearing[] = [
    {
        id: 'hr-1',
        caseNumber: '988221054',
        caseTitle: 'مطالبة بتعويض مادي وأدبي عن أضرار مقاولة نفطية',
        court: 'قصر العدل (محكمة العاصمة)',
        room: 'الدور الثالث - قاعة 14',
        date: '2026-05-24',
        time: '09:30',
        type: 'مرافعة ختامية وحجز لحكم',
        status: 'Scheduled',
        assignedLawyer: 'أ. صبري أحمد شطا',
        outcome: ''
    },
    {
        id: 'hr-2',
        caseNumber: '112/2026 عمالي',
        caseTitle: 'دعوى عمالية للمهندس ناصر العجمي',
        court: 'مجمع محاكم مجمع الرقعي',
        room: 'الطابق الأرضي - قاعة 5',
        date: '2026-05-25',
        time: '10:15',
        type: 'بحث تقرير محاسبة الأجور أمام الخبير الحسابي',
        status: 'Scheduled',
        assignedLawyer: 'أ. صبري أحمد شطا',
        outcome: ''
    },
    {
        id: 'hr-3',
        caseNumber: '992/2025 إيجارات',
        caseTitle: 'إخلاء سكن استثماري لمجموعة الأنوار',
        court: 'مجمع محاكم حولي',
        room: 'قاعة الإيجارات 12',
        date: '2026-05-21',
        time: '08:45',
        type: 'النطق بالحكم النهائي',
        status: 'Completed',
        assignedLawyer: 'أ. أحمد محمود الهاجري',
        outcome: 'حكم قطعي بالإخلاء وإلزام المستأجر بدفع الأجور المتراكمة والبالغة 4,200 د.ك.'
    },
    {
        id: 'hr-4',
        caseNumber: '110223948 الطعن',
        caseTitle: 'تظلم إداري لأحمد الرشيدي ضد وزارة الأوقاف',
        court: 'قصر العدل (العاصمة)',
        room: 'مبنى الاستئناف - قاعة 202',
        date: '2026-06-02',
        time: '11:00',
        type: 'تقديم المستندات الفاصلة وشهادة ديوان الخدمة المدنية',
        status: 'Scheduled',
        assignedLawyer: 'أ. مريم العتيبي',
        outcome: ''
    }
];

export const initialEnforcements: EnforcementAction[] = [
    {
        id: 'enf-1',
        executionNo: '2026/19924 تنفيذ',
        caseNumber: '992/2025 إيجارات',
        clientName: 'مجموعة الأنوار العقارية والإنشاءات',
        debtorName: 'خالد جاسم المحمد',
        awardedAmount: 4200,
        paidAmount: 1200,
        status: 'Travel_Ban_Issued',
        actionsTaken: ['توجيه إنذار رسمي بالدفع خلال ٧ أيام', 'استخراج أمر منع سفر من قاضي التنفيذ', 'طلب حجز سيارة المدين'],
        lastUpdateDate: '2026-05-18',
        notes: 'تم تجميد بعض المستحقات وجاري سداد دفعات جزئية لرفع منع السفر.'
    },
    {
        id: 'enf-2',
        executionNo: '2025/11022 تنفيذ',
        caseNumber: '772/2024 تجاري شيكات',
        clientName: 'مصنع الخليج للبلاستيك والمشتقات الإنشائية',
        debtorName: 'صلاح فرج الخالدي',
        awardedAmount: 18500,
        paidAmount: 18500,
        status: 'Settled',
        actionsTaken: ['توجيه كتاب منع سفر', 'حجز أرصدة البنوك لدى بيت التمويل الكويتي', 'الحصول على شيك سداد نهائي من دفاع الخصم'],
        lastUpdateDate: '2026-04-30',
        notes: 'اكتمال السداد وحفظ وإنهاء المعاملة وإلغاء كافة القيود المصرفية والشخصية.'
    }
];

export const initialJudgments: JudgmentEntry[] = [
    {
        id: 'jud-1',
        caseNumber: '992/2025 إيجارات',
        caseTitle: 'طرد للغصب وإخلاء سكن استثماري ضد خالد جاسم المحمد',
        courtLevel: CourtLevel.FIRST_INSTANCE,
        issueDate: '2026-05-21',
        judgeName: 'المستشار علي حسين المطيري',
        verdictSummary: 'حكمت المحكمة بإخلاء العين المؤجرة وتسليمها للمدعية خالية من الشواغل، وإلزام المدعى عليه بدفع الأجور المتراكمة بقيمة 4200 د.ك والمصاريف وأتعاب المحاماة الفعلية.',
        legalGrounds: 'المادة ٢٠ من قانون الإيجارات الكويتي: إخلال المستأجر بسداد أجرة أكثر من قسط يمنح المؤجر سلطة المطالبة بالطرد المستعجل وإلغاء العقد.',
        status: 'Final'
    },
    {
        id: 'jud-2',
        caseNumber: '772/2024 تجاري شيكات',
        caseTitle: 'شركة الخليج للتوريدات ضد صلاح الخالدي',
        courtLevel: CourtLevel.FIRST_INSTANCE,
        issueDate: '2025-03-10',
        judgeName: 'القاضي بدر الصرعاوي',
        verdictSummary: 'إلزام المدعى عليه بسداد كامل قيمة الكمبيالات البالغة ١٨٥٠٠ د.ك مضافاً إليها الرسوم والفوائد القانونية بواقع ٧٪ سنوياً.',
        legalGrounds: 'القانون التجاري الكويتي: السندات الإذنية والكمبيالات واجبة الأداء بمجرد العرض لدى البنك والتعنت يجر فوائد تأخيرية.',
        status: 'Enforcing'
    }
];

export const initialAppeals: AppealEntry[] = [
    {
        id: 'app-1',
        caseNumber: '988221054',
        originalJudgmentDate: '2026-05-10',
        deadlineDate: '2026-06-09',
        remainingDays: 19,
        status: 'Drafting',
        courtBranch: 'قصر العدل - محكمة الاستئناف العليا',
        appealGrounds: 'مخالفة القانون، الخطأ في تطبيق قواعد المسؤولية العقدية، والقصور الواضح في تسبيب رفض الاستعجال الحسابي.'
    },
    {
        id: 'app-2',
        caseNumber: '99112992/2024',
        originalJudgmentDate: '2026-04-12',
        deadlineDate: '2026-05-12',
        remainingDays: 0,
        status: 'Expired',
        courtBranch: 'محكمة الاستئناف - دائرة الأفراد والمؤسسات حولي',
        appealGrounds: 'انقضاء ميعاد الاستئناف الرسمي البالغ ٣٠ يوماً، وتم الاكتفاء بمصالحة ودية لرفع المنع.'
    }
];

export const initialCassations: CassationEntry[] = [
    {
        id: 'cas-1',
        caseNumber: '445/2026 تجاري',
        appealJudgmentDate: '2026-04-15',
        cassationNo: '998/2026 تمييز تجاري',
        deadlineDate: '2026-06-14',
        remainingDays: 24,
        status: 'Preparing',
        grounds: 'بطلان الإعلان بطريق التخاطب الخاطئ، ومخالفة ما توجبه المادة ٥٥ من اللائحة التنظيمية لجمعيات المساهمين.'
    }
];

export const initialMemos: MemoEntry[] = [
    {
        id: 'mem-1',
        title: 'مذكرة دفاع جوابية في قضية تصفية شركة الأمل للمقاولات',
        category: 'جوابية دفاعية',
        caseType: 'تجاري كلي مقاولات وعقود',
        authorName: 'أ. صبري أحمد شطا',
        content: 'أولاً: الدفع بانتفاء المسؤولية التقصيرية لعيب في تركيب عوارض الارتكاز لعدم مطابقتها للمواصفات.\nثانياً: الدفع ببطلان الملحق العقدي لمخالفته أحكام المادة ٨٨ من قانون العقود الكويتي.\nبناء عليه نلتمس رفض الدعوى الأصلية وإلزام رافعها بالمصاريف ومقابل أتعاب المحاماة الفعلية.',
        lastModified: '2026-05-19',
        tags: ['تجاري', 'مقاولات', 'إبطال عقد']
    },
    {
        id: 'mem-2',
        title: 'صحيفة طعن بالاستئناف في حكم الإهمال والتعويض الطبي',
        category: 'صحيفة استئناف',
        caseType: 'مدني كلي تعويضات أفراد',
        authorName: 'أ. صبري أحمد شطا',
        content: 'الأسباب:\n1. القصور في التسائب والفساد في الاستدلال من جانب محكمة أول درجة لعدم بحث قرارات الأطباء الشرعيين.\n2. الخطأ في احتساب نسبة التعويض الفعلي دون تبرير نسبة العجز المروي.\nالطلبات: قبول الاستئناف شكلاً وفي الموضوع بإلغاء الحكم المستأنف والقضاء مجدداً بالطلبات الأصلية للتعويض.',
        lastModified: '2026-05-15',
        tags: ['استئناف', 'تعويض', 'مسؤولية']
    }
];

export const initialFollowups: FollowupTask[] = [
    {
        id: 'flw-1',
        delegateName: 'محمد علي (مندوب العاصمة)',
        caseNumber: '988221054',
        category: 'إيداع صحيفة ومذكرة دفاع',
        description: 'إيداع اللائحة الجوابية الختامية في مكتب كتاب الدائرة السادسة تجاري كلي قصر العدل واستلام إيصال الإيداع.',
        court: 'قصر العدل (العاصمة)',
        status: 'COMPLETED',
        notes: 'تم تسليم السجل وحفظه بالناقل الآلي وتثبيته في رول المحكمة.',
        reportedAt: '2026-05-20T11:30:00Z'
    },
    {
        id: 'flw-2',
        delegateName: 'سالم أحمد (معقب الفروانية)',
        caseNumber: '445/2026 تجاري',
        category: 'إعلان الخصوم بجدول الدعاوى',
        description: 'إرسال الإعلان القضائي بالموطن المختار للخصم في منطقة الرقعي والتأشير بالاستلام لدى مسؤول الإعلانات.',
        court: 'محكمة الفروانية (الرقعي)',
        status: 'EXECUTING',
        notes: 'الزملاء في الشؤون الإدارية رفضوا في الجولة الأولى وجاري مراجعة المندوب القانوني مجدداً.'
    }
];

export const initialCourts: CourtEntry[] = [
    { id: 'crt-1', name: 'قصر العدل (محكمة العاصمة)', location: 'شارع الهلالي، شرق المدينة، الكويت', phone: '22480000', workingHours: '08:00 ص - 01:30 م', activeStatus: 'Active' },
    { id: 'crt-2', name: 'مجمع محاكم الرقعي (محكمة الفروانية)', location: 'منطقة الرقعي، الدائري الخامس', phone: '24891111', workingHours: '08:00 ص - 01:30 م', activeStatus: 'Active' },
    { id: 'crt-3', name: 'مجمع محاكم حولي', location: 'شارع تونس، حولي المدينة', phone: '25712222', workingHours: '08:00 ص - 01:30 م', activeStatus: 'Active' },
    { id: 'crt-4', name: 'مجمع محاكم الأحمدي', location: 'المنقف، جنوب الصباحية الفاضلة', phone: '23913333', workingHours: '08:00 ص - 01:30 م', activeStatus: 'Active' }
];

export const initialCircuits: CircuitEntry[] = [
    { id: 'cir-1', name: 'التجارية كلي الدائرة 15', courtName: 'قصر العدل (محكمة العاصمة)', headJudge: 'المستشار فهد الشريف', type: 'نزاعات الشركات الكبرى والمقاولات', sessionDay: 'الأحد تداول' },
    { id: 'cir-2', name: 'الاستئنافية مدني الدائرة 4', courtName: 'قصر العدل (محكمة العاصمة)', headJudge: 'المستشار غازي العجمي', type: 'طعون الفرد ومنازعات العقود', sessionDay: 'الثلاثاء تداول' },
    { id: 'cir-3', name: 'العمالية الكلية الدائرة 3', courtName: 'مجمع محاكم الرقعي (محكمة الفروانية)', headJudge: 'المستشار محمد المطيري', type: 'نزاعات عقود العمل وتصفية مكافآت القطاعات', sessionDay: 'الاثنين تداول' }
];

export const initialClients: ClientProfile[] = [
    { id: 'cli-1', name: 'ناصر فهد العتيبي (شركة الأمل العقارية)', type: 'Corporate', civilOrRegId: '109923849921', phone: '99039123', email: 'al-amal@co.kw', activeCasesCount: 2, trustScore: 'Excellent' },
    { id: 'cli-2', name: 'مصنع الخليج للبلاستيك والمشتقات الإنشائية', type: 'Corporate', civilOrRegId: '2026110998', phone: '94021234', email: 'gulf-plast@contact.kw', activeCasesCount: 1, trustScore: 'Excellent' },
    { id: 'cli-3', name: 'المهندس ناصر العجمي', type: 'Individual', civilOrRegId: '290101502394', phone: '66019922', email: 'n.ajmi@gmail.com', activeCasesCount: 1, trustScore: 'Good' }
];

export const initialOpponents: OpposingParty[] = [
    { id: 'opp-1', name: 'شركة الخليج للخدمات البترولية', legalRepName: 'مكتب الرشيد للمحاماة', phone: '22411222', activeCasesCount: 1, riskStatus: 'Aggressive' },
    { id: 'opp-2', name: 'مجموعة الصناعات الوطنية القابضة', legalRepName: 'أ. خالد الأثري', phone: '24899990', activeCasesCount: 1, riskStatus: 'Hostile' },
    { id: 'opp-3', name: 'خالد جاسم المحمد', legalRepName: 'بلا تمثيل قانوني (حضور شخصي)', phone: '55011224', activeCasesCount: 1, riskStatus: 'Cooperative' }
];

export const initialLawyers: LawyerEntry[] = [
    { id: 'law-1', name: 'أحمد محمود مبارك الأنصاري', membershipNo: '12345/أ', degree: 'أ', status: 'ACTIVE', activeCasesCount: 3, email: 'al-ansari@adalsh.kw' },
    { id: 'law-2', name: 'فاطمة علي حسين السيد', membershipNo: '67890/ب', degree: 'ب', status: 'ACTIVE', activeCasesCount: 2, email: 'fatima@adalsh.kw' },
    { id: 'law-3', name: 'مريم العتيبي (الباحثة القانونية لجمع التمييز)', membershipNo: '99201/ج', degree: 'دستورية وتمييز', status: 'ACTIVE', activeCasesCount: 1, email: 'maryam@adalsh.kw' }
];

export const initialNotifications: NotificationNotice[] = [
    { id: 'not-1', recipientName: 'شركة الخليج للخدمات البترولية', caseNumber: '988221054', type: 'صحيفة دعوى', deliveryMethod: 'سهل الحكومي', sentDate: '2025-11-14', status: 'Delivered' },
    { id: 'not-2', recipientName: 'خالد جاسم المحمد', caseNumber: '992/2025 إيجارات', type: 'إنذار رسمي', deliveryMethod: 'مندوب محكمة', sentDate: '2025-05-10', status: 'Delivered' },
    { id: 'not-3', recipientName: 'وزارة الأوقاف والأجهزة التابعة', caseNumber: '110223948 الطعن', type: 'إقرار حكم', deliveryMethod: 'بريد مسجل', sentDate: '2026-03-01', status: 'Pending' }
];

export const initialReports: LegalReport[] = [
    { id: 'rep-1', title: 'تقرير قيد الأرباح والمبالغ المحكوم بها الربع السنوي', period: 'الربع الأول لعام ٢٠٢٦', generatedAt: '2026-04-01', winRatio: 88.5, collectedAmounts: 22700, activeCasesCount: 5, creator: 'المستشار شطا' },
    { id: 'rep-2', title: 'تقرير حصر القضايا الإيجارية والتسويات العقدية المنقضية', period: 'النصف السنوي لعام ٢٠٢٥', generatedAt: '2025-12-25', winRatio: 100, collectedAmounts: 4200, activeCasesCount: 1, creator: 'أحمد الأنصاري' }
];

export const initialDocuments: DocumentAttachment[] = [
    { id: 'doc-1', title: 'عقد المقاولة والتحكيم الأصلي لشركة الأمل', caseNumber: '988221054', fileSize: '4.8 MB', fileType: 'PDF', category: 'توكيل رسمي', uploadedAt: '2025-11-12' },
    { id: 'doc-2', title: 'تقرير الطبيب الفني الموثق بوزارة الصحة', caseNumber: '112/2026 عمالي', fileSize: '1.2 MB', fileType: 'PDF', category: 'تقرير خبير', uploadedAt: '2025-08-15' },
    { id: 'doc-3', title: 'توكيل عام رسمي رقم 5542 قضايا', caseNumber: '988221054', fileSize: '850 KB', fileType: 'PDF', category: 'توكيل رسمي', uploadedAt: '2025-11-10' }
];

export const initialAppointments: ScheduleAppointment[] = [
    { id: 'apt-1', title: 'اجتماع موكل - ناصر العتيبي لتوضيح الدفوع المكملة لشركة الأمل', date: '2026-05-23', time: '17:00', category: 'اجتماع موكل', location: 'الشؤون القانونية بالمكتب الرئيسي', assignedLawyer: 'أ. صبري أحمد شطا' },
    { id: 'apt-2', title: 'جلسة خبراء حسابية لمحاكمة ملف المهندس ناصر العجمي', date: '2026-05-25', time: '10:15', category: 'جلسة خبراء', location: 'إدارة الخبراء بالرقعي الطابق الثاني غرب', assignedLawyer: 'أ. صبري أحمد شطا' }
];

export const initialTasks: LegalTask[] = [
    { id: 'tsk-1', title: 'صياغة اللائحة الختامية لقضية تصفية شركة الأمل', caseNumber: '988221054', assignedTo: 'أحمد الأنصاري', priority: 'High', dueDate: '2026-05-23', status: 'In_Progress' },
    { id: 'tsk-2', title: 'استخراج وتوثيق صورة رسمية من حظر السفر لخالد جاسم', caseNumber: '992/2025 إيجارات', assignedTo: 'سالم أحمد (مندوب)', priority: 'Medium', dueDate: '2026-05-22', status: 'Pending' }
];
