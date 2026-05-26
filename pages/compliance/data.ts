import { RiskLevel } from '../../types';
import { 
  PolicyProfile, ObligationProfile, RiskRegisterProfile, ViolationProfile, 
  AuditProfile, InvestigationProfile, CorrectiveActionProfile, RegulatoryReport, 
  FollowupProfile, ComplianceCategoryExtended 
} from './types';

export const initialPolicies: PolicyProfile[] = [
  {
    id: 'pol1',
    title: 'سياسة مكافحة غسيل الأموال وتمويل الإرهاب الكويتي',
    code: 'POL-AML-2025-V2',
    category: ComplianceCategoryExtended.AML_CFT,
    riskLevel: RiskLevel.CRITICAL,
    status: 'Approved',
    statusAr: 'معتمد',
    effectiveDate: '2025-01-01',
    expiryDate: '2026-01-01',
    owner: 'د. صبري شطا',
    version: '2.4',
    attachments: ['aml_policy_full_signed.pdf'],
    notes: 'تمت مراجعة هذه السياسة للتناسب تماماً مع تعديلات وحدة التحريات المالية الكويتية وقانون رقم 106 لسنة 2013.',
    approvals: [
      { id: 'app1', title: 'مراجعة المستشار القانوني', approver: 'المستشار القانوني صبري شطا', role: 'رئيس الشؤون القانونية', status: 'Approved', statusAr: 'موافق عليه', date: '2024-12-15' },
      { id: 'app2', title: 'اعتماد مجلس الإدارة', approver: 'أحمد محمود العتيبي', role: 'رئيس مجلس الإدارة', status: 'Approved', statusAr: 'موافق عليه', date: '2024-12-20' }
    ],
    history: [
      { id: 'h1', date: '2024-12-15 10:30', user: 'أميرة الجاسم', action: 'تعديل المسودة', details: 'تحديث النصوص لتشمل غرامات الأجانب التنفيذية.' },
      { id: 'h2', date: '2024-12-20 14:00', user: 'صبري شطا', action: 'موافقة نهائية', details: 'التحقق من الدليل القانوني المرفق.' }
    ]
  },
  {
    id: 'pol2',
    title: 'ميثاق السلوك المهني والنزاهة ومحاربة الفساد - نزاهة',
    code: 'POL-ETHICS-2026',
    category: ComplianceCategoryExtended.GOVERNANCE,
    riskLevel: RiskLevel.HIGH,
    status: 'Approved',
    statusAr: 'معتمد',
    effectiveDate: '2026-02-15',
    expiryDate: '2028-02-15',
    owner: 'أحمد محمود',
    version: '1.0',
    attachments: ['nazaha_ethics_guidelines.pdf'],
    notes: 'متوافق مع تعليمات الهيئة العامة لمكافحة الفساد في الكويت (نزاهة) ومعايير القطاع الخاص الاستثمارية.',
    approvals: [
      { id: 'app3', title: 'موافقة لجنة الحوكمة', approver: 'مريم الجابر', role: 'مدير الامتثال والحوكمة', status: 'Approved', statusAr: 'موافق عليه', date: '2026-02-10' }
    ],
    history: [
      { id: 'h3', date: '2026-02-10 09:15', user: 'مريم الجابر', action: 'إنشاء الوثيقة', details: 'إقرار اللائحة الأساسية للسلوك المهني وتعميمها للموظفين.' }
    ]
  },
  {
    id: 'pol3',
    title: 'لائحة تنظيم إفصاحات كبار المساهمين والمعلومات الجوهرية',
    code: 'POL-CMA-DISCL',
    category: ComplianceCategoryExtended.CMA_REGS,
    riskLevel: RiskLevel.HIGH,
    status: 'Under Review',
    statusAr: 'تحت المراجعة',
    effectiveDate: '2026-06-01',
    owner: 'مريم الجابر',
    version: '3.1',
    attachments: ['cma_disclosure_template.docx'],
    notes: 'تحديث شامل لتجنب مخالفات هيئة أسواق المال الكويتية الخاصة بتملك نسب كبار المساهمين.',
    approvals: [
      { id: 'app4', title: 'موافقة رئيس الامتثال', approver: 'مريم الجابر', role: 'مدير الامتثال', status: 'Pending', statusAr: 'معلق' }
    ],
    history: [
      { id: 'h4', date: '2026-05-18 11:00', user: 'ليلى إبراهيم', action: 'رفع المراجعة الاستباقية', details: 'تحويل الملف للجنة لمطابقته مع اللائحة التنفيذية للهيئة.' }
    ]
  },
  {
    id: 'pol4',
    title: 'لائحة خصوصية البيانات وسرية المعلومات للعملاء',
    code: 'POL-DATAPRIV-V1',
    category: ComplianceCategoryExtended.DATA_PRIVACY,
    riskLevel: RiskLevel.MEDIUM,
    status: 'Approved',
    statusAr: 'معتمد',
    effectiveDate: '2024-05-10',
    owner: 'سعد العتيبي',
    version: '1.2',
    attachments: ['privacy_policy_adala_digital.pdf'],
    notes: 'تختص بحماية البيانات الشخصية ورقم الهوية المدنية وعقود الإيجار وعقارات العملاء.',
    approvals: [],
    history: []
  }
];

export const initialObligations: ObligationProfile[] = [
  {
    id: 'comp1',
    title: 'تجديد الترخيص التجاري السنوي للشركة العقارية القابضة',
    description: 'تجديد السجل والترخيص التجاري لشركة عدالة القابضة للاستشارات والعقارات لمنع فرض غرامات من قبل وزارة التجارة والصناعة وتجنب توقف المعاملات البنكية.',
    authority: 'وزارة التجارة والصناعة (MOCI)',
    category: ComplianceCategoryExtended.MOCI_LICENSES,
    riskLevel: RiskLevel.HIGH,
    frequency: 'Annual',
    dueDate: '2026-07-15',
    status: 'In Progress',
    statusAr: 'قيد التنفيذ',
    assignedTo: 'أحمد محمود',
    attachments: [],
    notes: 'تم البدء في دفع الرسوم الجمركية ومراجعة إدارة تسجيل الشركات بالوزارة.',
    correctiveActions: ['دفع رسوم الترخيص فورا'],
    history: [
      { id: 'hc1', date: '2026-05-10', user: 'أحمد محمود', action: 'تغيير الحالة', details: 'تحديث الحالة إلى "قيد التنفيذ" والبدء بتدقيق المستندات.' }
    ]
  },
  {
    id: 'comp2',
    title: 'تقديم التقرير السنوي لتقييم الالتزام في غسيل الأموال',
    description: 'إجراء فحص سنوي داخلي ورفع تقرير التقييم المالي إلى وحدة التحريات المالية الكويتية امتثالاً للتعاميم الصادرة عن وزارة المالية والبنك المركزي.',
    authority: 'وحدة التحريات المالية الكويتية (KFIU)',
    category: ComplianceCategoryExtended.AML_CFT,
    riskLevel: RiskLevel.CRITICAL,
    frequency: 'Annual',
    dueDate: '2026-06-30',
    status: 'Compliant',
    statusAr: 'ملتزم',
    assignedTo: 'ليلى إبراهيم',
    evidenceLink: 'https://kfiu_portal.gov.kw/e-service/submit-rep2026',
    attachments: ['kfiu_compliance_sub_receipt.pdf'],
    notes: 'تمت تعبئة كشوفات غسيل الأموال ورفع الملف وتلقينا إشعار الاستلام بنجاح.',
    correctiveActions: [],
    history: [
      { id: 'hc2', date: '2026-05-15', user: 'ليلى إبراهيم', action: 'تصدير التقرير والرفع', details: 'تم الرفع عبر المنصة الإلكترونية واستلام الرمز م20.' }
    ]
  },
  {
    id: 'comp3',
    title: 'دفع الرسوم السنوية والجمعية العمومية لهيئة أسواق المال',
    description: 'تقديم كشوفات المحاضر السنوية ودفع فواتير الرسوم والجمعية العمومية لضمان الاستمرارية في بورصة الأسهم.',
    authority: 'هيئة أسواق المال الكويتية (CMA)',
    category: ComplianceCategoryExtended.CMA_REGS,
    riskLevel: RiskLevel.HIGH,
    frequency: 'Annual',
    dueDate: '2026-04-30',
    status: 'Overdue',
    statusAr: 'متأخر',
    assignedTo: 'مريم الجابر',
    attachments: [],
    notes: 'تأخر الرد المالي بسبب عدم مطابقة الفواتير من قبل المدقق الخارجي ويجب الإسراع للتسوية.',
    correctiveActions: ['تقديم التماس تمديد مهلة الدفع لتفادي الغرامة التنفيذية'],
    history: [
      { id: 'hc3', date: '2026-05-01', user: 'مريم الجابر', action: 'مراجعة الموعد المتأخر', details: 'تم تجاوز تاريخ الاستحقاق الفعلي وتم تنبيه مجلس الإدارة بالخطر.' }
    ]
  },
  {
    id: 'comp4',
    title: 'تقديم كشوف الرواتب الشهرية والاشتراكات لـ التأمينات',
    description: 'تسجيل الاشتراكات الشهرية ودفع المبالغ المستقطعة من رواتب الموظفين الكويتيين لحساب المؤسسة العامة للتأمينات الاجتماعية.',
    authority: 'المؤسسة العامة للتأمينات الاجتماعية الكويتية',
    category: ComplianceCategoryExtended.LABOR_SOCIAL,
    riskLevel: RiskLevel.MEDIUM,
    frequency: 'Monthly',
    dueDate: '2026-05-25',
    status: 'In Progress',
    statusAr: 'قيد التنفيذ',
    assignedTo: 'سعد العتيبي',
    attachments: [],
    notes: 'تتم المراجعة بالتوافق مع كشوفات الرواتب الصادرة من شؤون الموظفين.',
    correctiveActions: [],
    history: []
  }
];

export const initialRisks: RiskRegisterProfile[] = [
  {
    id: 'rsk1',
    title: 'خطر عدم التوافق الفني مع شروط حماية البيانات المدنية والمعلومات الشخصية',
    description: 'احتمالية تسريب بيانات المستأجرين أو الملاّك القانونية وعقودهم بسب عدم تطبيق صلاحيات التشفير وجدار الحماية الكافي.',
    category: ComplianceCategoryExtended.DATA_PRIVACY,
    riskLevel: RiskLevel.CRITICAL,
    impactScore: 5,
    likelihoodScore: 2,
    status: 'Mitigation Pending',
    statusAr: 'بانتظار الإجراء التصحيحي',
    owner: 'سعد العتيبي',
    mitigationPlan: 'تنفيذ أنظمة صلاحيات جديدة وتحديث التشفير السحابي بواسطة فريق تكنولوجيا المعلومات وإدراج سجل دخول.',
    residualRisk: RiskLevel.MEDIUM,
    targetDate: '2026-06-15',
    approvals: [],
    history: []
  },
  {
    id: 'rsk2',
    title: 'عقوبات تأخير تحديث تراخيص وزارة التجارة لشركات المجموعة المعطّلة',
    description: 'وجود شركة تابعة منتهية ترخيصها التجاري منذ أكثر من 6 أشهر مما قد يؤدي لإجراءات تجميد قضائية أو غرامات على الشركة الأم.',
    category: ComplianceCategoryExtended.MOCI_LICENSES,
    riskLevel: RiskLevel.HIGH,
    impactScore: 4,
    likelihoodScore: 4,
    status: 'Identified',
    statusAr: 'محدد للمرة الأولى',
    owner: 'أحمد محمود',
    mitigationPlan: 'فحص فوري للشركات المعطلة وتجديدها أو شطبها بالتنسيق مع وزارة التجارة وبورصة الكويت ومستشاري عدالة.',
    residualRisk: RiskLevel.LOW,
    targetDate: '2026-06-30',
    approvals: [],
    history: []
  },
  {
    id: 'rsk3',
    title: 'تعارض المصالح في ملكيات الأسهم واستشارات العقارات ذات الصلة للمدراء',
    description: 'شراء بعض المسؤولين أسهم وحصص في شركات عميلة لعدالة للاستشارات القانونية دون تقديم إفصاح مسبق للجنة الامتثال.',
    category: ComplianceCategoryExtended.GOVERNANCE,
    riskLevel: RiskLevel.MEDIUM,
    impactScore: 3,
    likelihoodScore: 3,
    status: 'Mitigated',
    statusAr: 'تم تداركه بنجاح',
    owner: 'مريم الجابر',
    mitigationPlan: 'إصدار نموذج إفصاح سنوي إلزامي لكافة الأعضاء وإقرار توقيع عهدة الحفاظ على سرية المعلومات وتضارب المصالح.',
    residualRisk: RiskLevel.LOW,
    targetDate: '2026-04-10',
    approvals: [
      { id: 'rap1', title: 'إقرار الاستلام والتنفيذ بالكامل', approver: 'مريم الجابر', role: 'رئيس الامتثال المعتمد', status: 'Approved', statusAr: 'موافق عليه', date: '2026-04-12' }
    ],
    history: []
  }
];

export const initialViolations: ViolationProfile[] = [
  {
    id: 'vio1',
    title: 'مخالفة تأخير تقديم التغير في السجل التجاري لفرع حولي المكتبي',
    authority: 'وزارة التجارة والصناعة (MOCI)',
    penaltyAmount: 1500,
    penaltyAmountAr: 'ألف وخمسمائة دينار كويتي لا غير',
    riskLevel: RiskLevel.HIGH,
    incidentDate: '2026-04-10',
    status: 'Under Appeal',
    statusAr: 'قيد الاستئناف والمطالبة',
    assignedTo: 'أحمد محمود',
    description: 'تم توقيع المخالفة التنفيذية من قبل مفتش وزارة التجارة بدعوى انتقال عنوان الشركة بدون الانتهاء الكامل من تحديث الترخيص الجغرافي.',
    notes: 'تمت صياغة مذكرة رد ومراجعة قانونية لإدارة التظلمات بالوزارة لإثبات أن الانتقال اضطراري بداعي صيانة العقار المأجور.',
    correctiveActions: ['ACT-CORR-012: تسجيل العقد لعنوان الجديد فورا وصياغة مذكرة الاستئناف.'],
    attachments: ['moci_violation_notice_102.pdf'],
    approvals: [],
    history: []
  },
  {
    id: 'vio2',
    title: 'غرامة تأخر تقديم الإحصاء ربع السنوي لهيئة أسواق المال',
    authority: 'هيئة أسواق المال (CMA)',
    penaltyAmount: 3000,
    penaltyAmountAr: 'ثلاثة آلاف دينار كويتي',
    riskLevel: RiskLevel.HIGH,
    incidentDate: '2026-01-15',
    status: 'Closed_Paid',
    statusAr: 'مغلقة وتم سداد الغرامة المترتبة',
    assignedTo: 'مريم الجابر',
    description: 'عدم توفير الردود الكافية على استفسارات البورصة بشأن حجم التداولات لشركة عدالة القابضة في موعدها الأقصى.',
    notes: 'تم الدفع والتحويل المالي لتخفيف القيد والمحافظة على الثقة المؤسسية.',
    correctiveActions: ['تدريب فريق المحاسبة وحوكمة تتبع الفترات الزمنية للجمعيات العمومية'],
    attachments: ['payment_receipt_cma_3000.pdf'],
    approvals: [
      { id: 'vapp1', title: 'إقرار سداد الغرامة من قطاع المالية', approver: 'ليلى إبراهيم', role: 'المدير المالي التنفيذي', status: 'Approved', statusAr: 'معتمد', date: '2026-02-01' }
    ],
    history: []
  }
];

export const initialAudits: AuditProfile[] = [
  {
    id: 'aud1',
    title: 'التدقيق الخارجي للامتثال لقواعد الحوكمة وقوانين البورصة لعام 2025',
    auditor: 'مكتب البزيع وشركاه للاستشارات والتدقيق المالي',
    auditorTitle: 'مراقب حسابات خارجي مرخص',
    department: 'قسم المطابقة والامتثال والإدارة التنفيذية المالية',
    startDate: '2026-02-10',
    endDate: '2026-03-05',
    status: 'Completed',
    statusAr: 'تم الانتهاء بنجاح',
    score: 94,
    scope: 'فحص مالي وحوكمي شامل لكافة قرارات الجمعية المعتمدة وتصاريح مجلس الإدارة وعلاقات الصفقات ذات الصلة.',
    findings: [
      'عدم وجود تأريخ دقيق لإمضاءات حضور مجلس الإدارة في محضر رقم 4 لعام 2025.',
      'تحديث كفيل الحماية للبيانات الرقمية بانتظار الاعتماد.'
    ],
    recommendations: [
      'اعتماد نظام بصمة إلكتروني أو توقيع رقمي للمجلس لتوثيق الحضور والقرارات المصيرية.',
      'إنشاء أرشيف للقرارات الهامة وإيداع المحاضر لوزارة التجارة بانتظام.'
    ],
    attachments: ['al_bazie_audit_report_full_v3.pdf'],
    notes: 'الامتثال مرتفع بشكل عام والشركة مهيأة لإدراج نشاطات إضافية مرخصة بالكامل.',
    approvals: [
      { id: 'aup1', title: 'موافقة المستشار صبري شطا', approver: 'صبري شطا', role: 'رئيس الشؤون القانونية والمستشار الرئيسي', status: 'Approved', statusAr: 'تم الاعتماد', date: '2026-03-08' }
    ],
    history: []
  },
  {
    id: 'aud2',
    title: 'المراجعة الاستباقية لالتزامات مكافحة غسيل الأموال وسلامة الكشوفات',
    auditor: 'مريم الجابر بالتعاون مع لجنة الرقابة والتدقيق الداخلي',
    auditorTitle: 'مستشار الامتثال والتفتيش',
    department: 'لجنة الحوكمة الرقابية',
    startDate: '2026-05-15',
    status: 'In Progress',
    statusAr: 'تحت التنفيذ حالياً',
    scope: 'التحقق الاستباقي من كشوفات غسيل الأموال للكويت (KFIU) وتدقيق هوية العملاء (KYC) لكافة ملاك العقارات التي نديرها.',
    findings: [],
    recommendations: [],
    attachments: [],
    notes: 'تمت تصفية الكشوفات والتحقق من صحة 120 سجلاً عقارياً استثمارياً.',
    approvals: [],
    history: []
  }
];

export const initialInvestigations: InvestigationProfile[] = [
  {
    id: 'inv1',
    idNumber: 'INV-KW-2026-004',
    subject: 'التحقيق بشأن الشكوى العمالية لشركة تابعة وتسريب تفاصيل عقود الإيجار',
    parties: ['سما العجمي (موظفة)', 'خالد عبدالله (مدير العقارات المستندات)'],
    investigator: 'أ. صبري شطا شريك الامتثال الرئيسي',
    startDate: '2026-05-10',
    status: 'Under Investigation',
    statusAr: 'قيد التحقيق والدراسة',
    notes: 'تم تشكيل مجلس تأديبي فوري بعد مراجعة شكوى مكتوبة ومذكرة موثقة تفصيلية.',
    findings: 'الاستماع لأقوال المتهمين المذكورين حول تحويل ملف بيانات الإيجارات بدون تشفير للبريد الخارجي الشخصي.',
    recommendedPenalty: 'خصم 5 أيام كحد أقصى للائحة وزارة الشؤون والعمل في الكويت وتنبيه كتابي صارم.',
    attachments: ['investigation_record_004_draft.docx'],
    history: [
      { id: 'ih1', date: '2026-05-12 11:30', user: 'صبري شطا', action: 'الاستماع للأقوال', details: 'تحرير ضبط الجلسة الأولى للتحقيق بحضور ممثل شؤون الموظفين.' }
    ]
  }
];

export const initialCorrectiveActions: CorrectiveActionProfile[] = [
  {
    id: 'act1',
    title: 'تشفير قاعدة البيانات السحابية الحامية لمعلومات ملاّك العقارات وقانونيتهم',
    description: 'ترقية نظام الصلاحيات وجدر الحماية وتشفير ملفات الهوية الوطنية للعملاء لمنع تكرار خطر تسريب البيانات الشخصية وتضارب اللوائح.',
    assignedTo: 'مدير قطاع تقنية المعلومات والخدمات الرقمية',
    dueDate: '2026-06-15',
    status: 'In Progress',
    statusAr: 'قيد التنفيذ حالياً',
    priority: 'High',
    relatedViolationId: 'v2',
    notes: 'يتم التطوير تدريجياً لضمان عدم حدوث بطء في سرعة فتح لوحة الإدارة القانونية "عدالة".',
    attachments: [],
    history: []
  },
  {
    id: 'act2',
    title: 'تقديم السجل التجاري المعدل لعنوان هاتف وترخيص فرع حولي',
    description: 'الانتهاء من إصدار المخطط الكروكي والمطابقة مع وزارة التجارة لإنهاء مخالفة انتقال عنوان حولي.',
    assignedTo: 'أحمد محمود العتيبي',
    dueDate: '2026-05-30',
    status: 'Pending',
    statusAr: 'بانتظار موافقة مجلس الإدارة على الرسوم المالية',
    priority: 'High',
    relatedViolationId: 'vio1',
    notes: 'الملخص في انتظار تسوية الرسوم البالغة 100 دينار للوزارة.',
    attachments: [],
    history: []
  }
];

export const initialReports: RegulatoryReport[] = [
  {
    id: 'rep1',
    title: 'تقرير المطابقة والحوكمة السنوي المقدم لبورصة الكويت والجمعية',
    referenceNumber: 'CMA-GR-2026-7712',
    authority: 'هيئة أسواق المال والبورصة الكويتيّة',
    reviewer: 'المستشار القانوني صبري شطا',
    role: 'رئيس الشؤون القانونية وشريك الامتثال الحوكمي',
    submissionDate: '2026-01-30',
    status: 'Approved',
    statusAr: 'معتمد ومصدق',
    qrCodeSeed: 'https://verify.adala-compliance.gov.kw/report/CMA-GR-2026-7712'
  },
  {
    id: 'rep2',
    title: 'تقرير التدقيق الجنائي المالي الخاص بمكافحة غسل الأموال ومكافحة تمويل الإرهاب',
    referenceNumber: 'CBK-AML-2026-0033',
    authority: 'بنك الكويت المركزي ووحدة التحريات',
    reviewer: 'مريم الجابر',
    role: 'مسؤول الامتثال وقوانين غسيل الأموال المعتمد',
    submissionDate: '2026-05-18',
    status: 'Submitted',
    statusAr: 'تم تعبئته وتقديمه',
    qrCodeSeed: 'https://verify.adala-compliance.gov.kw/report/CBK-AML-2026-0033'
  }
];

export const initialFollowups: FollowupProfile[] = [
  {
    id: 'fol1',
    title: 'فحص تجديد كروت شارات العمال الوافدين والشركاء مع الموارد البحرية',
    frequency: 'Monthly',
    frequencyAr: 'شهري',
    dueDate: '2026-06-01',
    status: 'Pending',
    statusAr: 'معلق',
    responsible: 'سعد العتيبي'
  },
  {
    id: 'fol2',
    title: 'تحديث اللوائح ومراجعة تعديلات قانون الإيجار والعقارات الجديد',
    frequency: 'Quarterly',
    frequencyAr: 'ربع سنوي',
    dueDate: '2026-06-30',
    status: 'Completed',
    statusAr: 'مكتمل بنجاح',
    responsible: 'صبري شطا'
  }
];

export const initialTasks: any[] = [
  {
    id: 'tsk1',
    title: 'مراجعة تحديث قانون الشركات الكويتي الجديد لعام 2026',
    description: 'تحليل أثر تعديلات قانون الشركات الكويتي على اللائحة الداخلية للبنود والعقود وعقد الملاّك وتنسيق اللوائح الحوكمية.',
    assignedTo: 'أ. صبري شطا',
    dueDate: '2026-06-15',
    completionRate: 65,
    priority: 'High',
    priorityAr: 'مرتفعة للغاية',
    status: 'In Progress',
    statusAr: 'قيد التنفيذ',
    reminderSent: true,
    history: [
      { id: 'lh1', date: '2026-05-10', user: 'صبري شطا', action: 'تغيير نسبة الإنجاز', details: 'تمت قراءة 50% من وثيقة المذكرة القانونية وإضافة الملاحظات.' }
    ]
  },
  {
    id: 'tsk2',
    title: 'فحص ملفات الموظفين للتأمينات الاجتماعية بمستند حولي',
    description: 'التحقق من صحة واكتمال المستندات لجميع عمال الفرع الجدد ورفع البيانات لمنظومة الرواتب المركزية.',
    assignedTo: 'سعد العتيبي',
    dueDate: '2026-05-28',
    completionRate: 100,
    priority: 'Medium',
    priorityAr: 'متوسطة',
    status: 'Completed',
    statusAr: 'مكتمل',
    reminderSent: false,
    history: [
      { id: 'lh2', date: '2026-05-20', user: 'سعد العتيبي', action: 'إنهاء المهمة', details: 'تم رفع النسخ الرقمية لخدمة التأمينات دون ملاحظات إيقاف.' }
    ]
  },
  {
    id: 'tsk3',
    title: 'طلب مهلة تمديد وتظلم لهيئة أسواق المال بشأن كشوف الغرامة',
    description: 'إعداد كتاب استئناف مستعجل وإرساله لإدارة الحوكمة بالهيئة لتلافي تضاعف قيمة غرامة الإفصاح.',
    assignedTo: 'مريم الجابر',
    dueDate: '2026-05-25',
    completionRate: 20,
    priority: 'High',
    priorityAr: 'مرتفع',
    status: 'Overdue',
    statusAr: 'متأخر',
    reminderSent: true,
    history: [
      { id: 'lh3', date: '2026-05-23', user: 'مريم الجابر', action: 'إنشاء مسودة تظلم', details: 'صياغة المربط القانوني المبدأي في انتظار توقيع المستشار العام شطا.' }
    ]
  }
];

export const initialAuditLogs: any[] = [
  {
    id: 'log1',
    timestamp: '2026-05-24 10:15:32',
    user: 'صبري شطا',
    role: 'المستشار القانوني العام',
    action: 'توقيع واعتماد إلكتروني',
    details: 'تم ترخيص وتوقيع تقرير غسيل الأموال السنوي المالي KFIU رقم ص-2012 وعزمه بالختم الرسمي.',
    module: 'إدارة الاعتمادات والتواقيع',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'log2',
    timestamp: '2026-05-24 11:22:11',
    user: 'أميرة الجاسم',
    role: 'ضابط المطابقة والامتثال',
    action: 'إضافة التزام تعاقدي جديد',
    details: 'إدراج بند تجديد السجل التجاري لـ "عدالة العقارية" برعوية وزارة التجارة والصناعة.',
    module: 'سجل الالتزامات المؤسسية',
    ipAddress: '192.168.1.112'
  },
  {
    id: 'log3',
    timestamp: '2026-05-23 14:05:40',
    user: 'أحمد محمود',
    role: 'المدير العام للمجموعة',
    action: 'أرشفة سياسة قديمة',
    details: 'نقل اللائحة الأمنية لفرع الجهراء القديم V1.2 إلى قسم المحفوظات المؤرشفة خارجياً لتحديث النطاقات الجغرافية.',
    module: 'السياسات واللوائح',
    ipAddress: '192.168.2.14'
  }
];

