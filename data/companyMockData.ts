import { 
    CompanyProfile, ShareholderInfo, BoardMemberInfo, AuthorizedSignatoryInfo, 
    CompanyMeeting, CorporateAction, CompanyDocument, CorporateCommittee,
    CompanyLegalFormKuwait, CompanyMeetingType, BoardMemberPosition, 
    CorporateActionType, CorporateActionStatus, CompanyDocumentType, CompanyDocumentStatus
} from '../types';

export interface CompanyProfileExt extends CompanyProfile {
    archived?: boolean;
}

export interface TimelineEvent {
    id: string;
    companyId: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    date: string;
    type: 'registration' | 'meeting' | 'action' | 'document' | 'other';
}

export interface SystemCorporateReminder {
    id: string;
    companyId: string;
    titleAr: string;
    titleEn: string;
    messageAr: string;
    messageEn: string;
    dueDate: string;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high';
}

// Default initial corporate profiles representing Kuwaiti corporate environment
export const initialMockCompanies: CompanyProfileExt[] = [
    {
        id: 'comp-001',
        companyNameAr: 'شركة الاستثمارات الخليجية القابضة (ش.م.ك.ق)',
        companyNameEn: 'Gulf Investments Holding Company (K.S.C.P)',
        legalForm: CompanyLegalFormKuwait.KUWAITI_SHAREHOLDING_PUBLIC,
        registrationNumber: '654321',
        tradeLicenseNumber: 'MOCI-2022/9871',
        chamberOfCommerceNumber: '76543',
        establishmentDate: '2012-04-18',
        capital: 15000000, // 15M KWD
        paidUpCapital: 15000000,
        headOfficeAddress: 'مدينة الكويت، شارع أحمد الجابر، برج الخليج، الدور 22',
        contactInfo: { phone: '+965 22003300', email: 'corporate@gulfinvest.com.kw', website: 'www.gulfinvest.com.kw' },
        fiscalYearEnd: '12-31',
        auditorName: 'دلويت (البزيع وشركاهم)',
        archived: false,
        shareholders: [
            { id: 'sh-1-1', name: 'الهيئة العامة للاستثمار (الكويت)', nationality: 'كويتي', civilIdOrRegNumber: 'KIA-REG-001', sharePercentage: 35, numberOfShares: 5250000, shareClass: 'عادية', votingRights: true },
            { id: 'sh-1-2', name: 'مجموعة المرزوق الاستثمارية', nationality: 'كويتي', civilIdOrRegNumber: '11223344', sharePercentage: 30, numberOfShares: 4500000, shareClass: 'فئة أ', votingRights: true },
            { id: 'sh-1-3', name: 'شركة دبي للاستثمارات المالية', nationality: 'إماراتي', civilIdOrRegNumber: 'UAE-REG-987', sharePercentage: 20, numberOfShares: 3000000, shareClass: 'عادية', votingRights: true },
            { id: 'sh-1-4', name: 'المساهمون العامون (تداول)', nationality: 'شخصيات متعددة', civilIdOrRegNumber: 'PUBLIC-001', sharePercentage: 15, numberOfShares: 2250000, shareClass: 'عادية', votingRights: false }
        ],
        boardMembers: [
            { id: 'bm-1-1', name: 'الشيخ/ خالد ناصر الصباح', position: BoardMemberPosition.CHAIRMAN, appointmentDate: '2023-05-10', termEndDate: '2026-05-09', isAuthorizedSignatory: true },
            { id: 'bm-1-2', name: 'السيد/ عبد الوهاب المرزوق', position: BoardMemberPosition.VICE_CHAIRMAN, appointmentDate: '2023-05-10', termEndDate: '2026-05-09', isAuthorizedSignatory: true },
            { id: 'bm-1-3', name: 'د./ يوسف المنصور', position: BoardMemberPosition.MANAGING_DIRECTOR, appointmentDate: '2023-05-10', termEndDate: '2026-05-09', isAuthorizedSignatory: true },
            { id: 'bm-1-4', name: 'السيدة/ نورة جاسم الحميد', position: BoardMemberPosition.MEMBER, appointmentDate: '2024-02-15', termEndDate: '2027-02-14', isAuthorizedSignatory: false },
            { id: 'bm-1-5', name: 'السيد/ غانم علي الكندري', position: BoardMemberPosition.SECRETARY, appointmentDate: '2023-05-10', termEndDate: '2026-05-09', isAuthorizedSignatory: false }
        ],
        authorizedSignatories: [
            { id: 'as-1-1', name: 'الشيخ/ خالد ناصر الصباح', title: 'رئيس مجلس الإدارة', signatureScope: 'منفرداً في كافة المعاملات المالية والإدارية والتوقيع على العقود الحكومية وتمثيل الشركة أمام القضاء دون حد أقصى.', authorityLimit: 0, jointSignatureRequired: false },
            { id: 'as-1-2', name: 'د./ يوسف المنصور', title: 'العضو المنتدب والتنفيذي', signatureScope: 'منفرداً للتوقيعات المالية والإدارية حتى قيمة 150,000 د.ك، ومجتمعاً مع نائب الرئيس فيما يتجاوز ذلك.', authorityLimit: 150000, jointSignatureRequired: false }
        ],
        committees: [
            { id: 'com-1-1', name: 'لجنة التدقيق والحوكمة والامتثال', description: 'مراجعة التقارير المالية الدورية والإشراف على مكاتب التدقيق الداخلي والخارجي للتأكد من موافقة تعليمات هيئة أسواق المال وهيئة الاستثمار.', membersIds: ['bm-1-3', 'bm-1-4'], chairpersonId: 'bm-1-3', frequency: 'ربع سنوي' },
            { id: 'com-1-2', name: 'لجنة مكافآت وترشيحات مجلس الإدارة', description: 'تخطيط الترشيحات لأعضاء مجلس الإدارة وصياغة المكافآت والحوافز.', membersIds: ['bm-1-1', 'bm-1-2', 'bm-1-4'], chairpersonId: 'bm-1-1', frequency: 'سنوي' }
        ]
    },
    {
        id: 'comp-002',
        companyNameAr: 'شركة الصالحية العقارية والمقاولات (ذ.م.م)',
        companyNameEn: 'Al-Salhiya Real Estate & Contracting Co. (W.L.L)',
        legalForm: CompanyLegalFormKuwait.LIMITED_LIABILITY,
        registrationNumber: '321098',
        tradeLicenseNumber: 'MOCI-2023/5431',
        chamberOfCommerceNumber: '43210',
        establishmentDate: '2015-08-22',
        capital: 5000000, // 5M KWD
        paidUpCapital: 5000000,
        headOfficeAddress: 'مدينة الكويت، السالمية، شارع سالم المبارك، مجمع دلال، الدور 5',
        contactInfo: { phone: '+965 25776655', email: 'salhiya@salhiyaco.com', website: 'www.salhiyaco.com' },
        fiscalYearEnd: '12-31',
        auditorName: 'البزيع وشركاهم RSG',
        archived: false,
        shareholders: [
            { id: 'sh-2-1', name: 'السيد/ فهد مشاري الصانع', nationality: 'كويتي', civilIdOrRegNumber: '286051500987', sharePercentage: 60, numberOfShares: 30000, shareClass: 'حصص نقدية', votingRights: true },
            { id: 'sh-2-2', name: 'السيدة/ فاطمة عبد الله العجمي', nationality: 'كويتي', civilIdOrRegNumber: '290110300432', sharePercentage: 40, numberOfShares: 20000, shareClass: 'حصص عينية', votingRights: true }
        ],
        boardMembers: [
            { id: 'bm-2-1', name: 'السيد/ فهد مشاري الصانع', position: BoardMemberPosition.MANAGING_DIRECTOR, appointmentDate: '2023-01-01', termEndDate: '2028-01-01', isAuthorizedSignatory: true }
        ],
        authorizedSignatories: [
            { id: 'as-2-1', name: 'السيد/ فهد مشاري الصانع', title: 'المدير العام والشريك المدير', signatureScope: 'مفوض بإدارة كافة أعمال الشركة والبيع والشراء وتأسيس الفروع وتعيين الموظفين والمثول أمام القضاء والتحكيم وإبرام التمويلات البنكية باسم الشركة.', authorityLimit: 0, jointSignatureRequired: false }
        ],
        committees: []
    },
    {
        id: 'comp-003',
        companyNameAr: 'شركة حمد الغانم للتجارة والاستيراد (مؤسسة فردية)',
        companyNameEn: 'Hamad Al-Ghanim Trading & Import (Sole Proprietorship)',
        legalForm: CompanyLegalFormKuwait.SOLE_PROPRIETORSHIP,
        registrationNumber: '95421',
        tradeLicenseNumber: 'MOCI-2024/0981',
        chamberOfCommerceNumber: '12450',
        establishmentDate: '2020-11-12',
        capital: 200000, // 200K KWD
        paidUpCapital: 200000,
        headOfficeAddress: 'الشويخ الصناعية، شارع كندا دراي، قسيمة 44',
        contactInfo: { phone: '+965 24889900', email: 'info@alghanimtrade.com' },
        fiscalYearEnd: '12-31',
        auditorName: 'مكتب العثمان لتدقيق الحسابات',
        archived: false,
        shareholders: [
            { id: 'sh-3-1', name: 'السيد/ حمد جاسم الغانم', nationality: 'كويتي', civilIdOrRegNumber: '277102000124', sharePercentage: 100, numberOfShares: 200000, shareClass: 'رأس مال كامل', votingRights: true }
        ],
        boardMembers: [],
        authorizedSignatories: [
            { id: 'as-3-1', name: 'السيد/ حمد جاسم الغانم', title: 'المالك والمدير العام', signatureScope: 'صلاحيات مطلقة غير مشروطة لإدارة وتصريف كافة شؤون المؤسسة المالية والقانونية والإدارية.', authorityLimit: 0, jointSignatureRequired: false }
        ],
        committees: []
    }
];

export const initialMockMeetings: CompanyMeeting[] = [
    {
        id: 'meet-101',
        meetingType: CompanyMeetingType.ORDINARY_GENERAL_ASSEMBLY,
        meetingDate: '2024-03-22',
        meetingTime: '11:00',
        meetingLocation: 'قاعة الأندلس، فندق سيمفوني ستايل، السالمية، الكويت',
        attendees: ['الشيخ خالد ناصر الصباح', 'السيد عبد الوهاب المرزوق', 'د. يوسف المنصور', 'ممثلو الهيئة العامة للاستثمار كشخصية اعتبارية', 'مراقب حسابات الشركة عيبان والعصيمي'],
        agendaItems: '1. مناقشة والموافقة على تقرير مجلس الإدارة عن السنة المالية المنتهية في 31 ديسمبر 2023.\n2. المصادقة على الميزانية العمومية وحساب الأرباح والخسائر.\n3. الموافقة على اقتراح توزيع أرباح نقدية بنسبة 7% للمساهمين.\n4. إبراء ذمة أعضاء مجلس الإدارة عن كافة تعاملاتهم القانونية لعام 2023.',
        resolutionsPassed: '1. تم اعتماد تقرير مجلس الإدارة والبيانات المالية بالإجماع.\n2. تمت الموافقة على توزيع أرباح نقدية بنسبة 7% من القيمة الاسمية للسهم.\n3. تمت إعادة تعيين السادة عيبان والعصيمي كمراقب حركي للحسابات للعام 2024.\n4. إبراء ذمة أعضاء مجلس الإدارة وإطلاق صراح عهدهم المالي.',
        minutesDocumentId: 'doc-004'
    },
    {
        id: 'meet-102',
        meetingType: CompanyMeetingType.BOARD_OF_DIRECTORS,
        meetingDate: '2024-01-15',
        meetingTime: '09:30',
        meetingLocation: 'المقر الرئيسي للشركة - قاعة الاجتماعات الكبرى',
        attendees: ['الشيخ خالد ناصر الصباح', 'السيد عبد الوهاب المرزوق', 'د. يوسف المنصور', 'السيدة نورة جاسم الحميد', 'السيد غانم علي الكندري'],
        agendaItems: '1. مراجعة واستعراض الميزانية التقديرية المقترحة للربع الأول من عام 2024.\n2. مناقشة فرص الاستحواذ العقاري المعروضة في منطقة المهبولة.\n3. تحديث صلاحيات التوقيع البنكي للرئيس التنفيذي.',
        resolutionsPassed: '1. اعتماد خطة الموازنة للربع الأول للعام الجديد.\n2. الموافقة على تقديم عرض شراء مبدئي لإحدى القسائم الاستثمارية بالمهبولة بقيمة لا تزيد عن 2.3 مليون د.ك.\n3. منح الرئيس التنفيذي صلاحية سحب وتحويل حتى 50,000 د.ك بشكل منفرد.',
        minutesDocumentId: 'doc-003'
    },
    {
        id: 'meet-201',
        meetingType: CompanyMeetingType.EXTRAORDINARY_GENERAL_ASSEMBLY,
        meetingDate: '2024-05-02',
        meetingTime: '13:00',
        meetingLocation: 'وزارة التجارة والصناعة (نظام حجز الجمعيات الإلكتروني)',
        attendees: ['السيد فهد مشاري الصانع', 'السيدة فاطمة عبد الله العجمي', 'ممثلو وزارة التجارة والصناعة قسم الشركات'],
        agendaItems: '1. مناقشة زيادة رأس مال الشركة من 2 مليون د.ك إلى 5 مليون د.ك.\n2. تعديل المادة (6) من عقد التأسيس الخاصة برأس المال.\n3. إضافة أنشطة المقاولات وبناء المجمعات إلى الرخصة التجارية.',
        resolutionsPassed: '1. الموافقة الكلية للشركاء على زيادة رأس المال لـ 5,000,000 د.ك تودع بحل نقدي وعيني.\n2. تعديل البنود القانونية في العقد الأساسي لتواكب الزيادة الجديدة وفق الإجراءات المتبعة بوزارة العدل قسم التوثيقات والشركات.\n3. إضافة الأنشطة المستهدفة ومباشرة استخراج رخص البلدية وإطفاء الحرائق.',
        minutesDocumentId: 'doc-001'
    }
];

export const initialMockActions: CorporateAction[] = [
    {
        id: 'act-301',
        actionType: CorporateActionType.CAPITAL_INCREASE,
        description: 'زيادة رأس المال الإجمالي لشركة الصالحية العقارية',
        actionDate: '2024-05-02',
        status: CorporateActionStatus.COMPLETED,
        details: 'تم زيادة رأس المال من 2,000,000 د.ك إلى 5,000,000 د.ك بهدف التوسع الإنشائي العقاري في مكاتب الفروانية وتم قيد الزيادة بسجلات السجل التجاري لدى وزارة التجارة وصادق عليها التوثيق العقاري والشركات في وزارة العدل الكويتية.',
        relatedDocumentsIds: ['doc-001']
    },
    {
        id: 'act-302',
        actionType: CorporateActionType.AMEND_ARTICLES_OF_ASSOCIATION,
        description: 'إضافة وتثبيت أنشطة مهنية وتكنولوجيا ومقاولات',
        actionDate: '2024-05-18',
        status: CorporateActionStatus.IN_PROGRESS,
        details: 'تقديم طلب مراجعة العقد للتوثيق بوزارة العدل لإضافة بنود التحكيم الاختياري وحقوق الأقلية، قيد التوقيع لدى كاتب العدل ببرج التحرير من قبل جميع الشركاء.',
        relatedDocumentsIds: []
    }
];

export const initialMockDocuments: CompanyDocument[] = [
    {
        id: 'doc-001',
        title: 'عقد التأسيس المعدل لزيادة رأس المال والتعديل التجاري لشركة الصالحية',
        documentType: CompanyDocumentType.FOUNDING_DOCUMENT,
        documentDate: '2024-05-05',
        status: CompanyDocumentStatus.ACTIVE,
        keywords: ['عقد تأسيس', 'تعديل', 'وزارة العدل', 'الصالحية', 'رأس مال'],
        createdAt: '2024-05-05',
        notes: 'موقّع رسمي بكاتب العدل وموثق من وزارة العدل وإدارة الشركات بوزارة التجارة والصناعة بدولة الكويت.'
    },
    {
        id: 'doc-002',
        title: 'الترخيص التجاري لعام 2024-2025 (رخصة بلدية الكويت لشركة الاستثمارات)',
        documentType: CompanyDocumentType.TRADE_LICENSE,
        documentDate: '2024-02-10',
        status: CompanyDocumentStatus.ACTIVE,
        keywords: ['رخصة تجارية', 'رخصة بلدية', 'وزارة التجارة', 'شركة الاستثمارات'],
        createdAt: '2024-02-10',
        notes: 'الرخصة سارية المفعول وتنتهي في 2025-02-09. يلزم البدء في تجديدها في يناير 2025.'
    },
    {
        id: 'doc-003',
        title: 'محضر اجتماع مجلس الإدارة رقم 1 لعام 2024 لشركة الاستثمارات الخليجية',
        documentType: CompanyDocumentType.MEETING_MINUTES_BOD,
        documentDate: '2024-01-15',
        status: CompanyDocumentStatus.SIGNED,
        keywords: ['محضر مجلس إدارة', 'ميزانية الربع الأول', 'صلاحيات رئيس مجلس الإدارة'],
        createdAt: '2024-01-16'
    },
    {
        id: 'doc-004',
        title: 'محضر اجتماع الجمعية العمومية العادية لشركة الاستثمارات الخليجية القابضة',
        documentType: CompanyDocumentType.MEETING_MINUTES_GA,
        documentDate: '2024-03-22',
        status: CompanyDocumentStatus.APPROVED,
        keywords: ['جمعية عمومية عادية', 'أرباح نقدية 7%', 'إبراء ذمة'],
        createdAt: '2024-03-23'
    }
];

export const initialMockTimeline: TimelineEvent[] = [
    {
        id: 'time-001',
        companyId: 'comp-001',
        titleAr: 'تأسيس الشركة وقيد السجل التجاري',
        titleEn: 'Establishment and Commerce Registry',
        descriptionAr: 'قيد شركة الاستثمارات الخليجية القابضة في السجل التجاري كشركة مساهمة كويتية عامة.',
        descriptionEn: 'Gulf Investments Holding Co was officially established and registered at MOCI.',
        date: '2012-04-18',
        type: 'registration'
    },
    {
        id: 'time-002',
        companyId: 'comp-002',
        titleAr: 'زيادة رأس المال الرسمي',
        titleEn: 'Capital Increase Approved',
        descriptionAr: 'تمت المصادقة على زيادة رأس المال لشركة الصالحية في جمعية عامة غير عادية.',
        descriptionEn: 'EGA approved the capital increase to 5,000,000 KWD and deposited at central and local banking channels.',
        date: '2024-05-02',
        type: 'action'
    },
    {
        id: 'time-003',
        companyId: 'comp-001',
        titleAr: 'اجتماع الجمعية العمومية السنوي والموافقة على الأرباح والبيانات المالية لشركة الاستثمارات',
        titleEn: 'Annual General Assembly',
        descriptionAr: 'انعقاد الجمعية العمومية والموافقة على توزيع أرباح نقدية بنسبة 7% وإعادة تعيين مراقب الحسابات.',
        descriptionEn: 'Ordinary General Assembly convened successfully at Symphony Style Hotel, distributing cash dividend of 7%.',
        date: '2024-03-22',
        type: 'meeting'
    }
];

export const initialMockReminders: SystemCorporateReminder[] = [
    {
        id: 'rem-101',
        companyId: 'comp-001',
        titleAr: 'تجديد الترخيص التجاري',
        titleEn: 'Renew Operational Trade License',
        messageAr: 'رخصة البلدية لشركة الاستثمارات تنتهي في 2026-06-10. يرجى تجهيز الأوراق والميزانيات لوزارة التجارة والصناعة لتفادي فرض غرامات والتجميد المؤقت للسجل.',
        messageEn: 'Municipal commercial license expires on 2026-06-10. Prepare audit balance sheet to submit at MOCI platform.',
        dueDate: '2026-06-10',
        isRead: false,
        priority: 'high'
    },
    {
        id: 'rem-102',
        companyId: 'comp-001',
        titleAr: 'تعديل وتحديث عضوية مجلس الإدارة',
        titleEn: 'Board Members Tenure Renewal',
        messageAr: 'صلاحية مجلس الإدارة الحالي المنتخب تنتهي في 2026-05-09. يلزم إعلان موعد لانتخابات مجلس الإدارة الجديد بالجمعية العامة العادية خلال 3 أشهر.',
        messageEn: 'The current board members tenure expires on 2026-05-09. Ordinary general assembly election process must be initiated.',
        dueDate: '2026-05-09',
        isRead: false,
        priority: 'high'
    },
    {
        id: 'rem-201',
        companyId: 'comp-002',
        titleAr: 'تجديد شهادة السجل وغرفة التجارة والصناعة',
        titleEn: 'Renew Kuwait Chamber Certificate',
        messageAr: 'يلزم تجديد شهادة التسجيل السنوية في غرفة التجارة والصناعة الكويتية وتحديث بيانات الضمان المالي.',
        messageEn: 'Kuwait Chamber of Commerce and Industry registration annual certificate is coming up for renewal.',
        dueDate: '2026-08-30',
        isRead: false,
        priority: 'medium'
    }
];
