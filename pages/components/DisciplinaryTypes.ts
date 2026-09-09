export enum DisciplinaryActionStatus {
    PENDING = 'قيد التحقيق والدراسة',
    APPROVED = 'معتمد وساري التنفيذ',
    APPEALED = 'تظلم قائم قيد النظر',
    REDUCED = 'تخفيض العقوبة بقرار التظلم',
    CANCELLED = 'مُلغى بقرار تظلم تصحيحي'
}

export interface InvestigationQuestion {
    id: string;
    question: string;
    answer: string;
}

export interface InvestigationTranscript {
    hearingDate: string;
    hearingTime: string;
    investigatorName: string;
    subjectName: string;
    civilId: string;
    subjectRole: 'مشكو بحقه' | 'شاهد';
    oathTaken: boolean;
    questions: InvestigationQuestion[];
    legalAdaptation: string;
    complianceCheck: {
        article35Passed: boolean; // سماع الأقوال والإبلاغ الكتابي
        article102Passed: boolean; // عدم تجاوز حد الـ 5 أيام
        article41Match: boolean; // هل تتضمن أسباب فصل مباشر
    };
    investigatorSignature?: string;
    subjectSignature?: string;
}

export interface DisciplinaryRecord {
    id: string;
    recordNumber: string;
    employeeId: string;
    employeeName: string;
    civilId: string;
    employeeJobTitle: string;
    employeeDepartment: string;
    violationType: string;
    violationDate: string;
    notificationDate: string; // تاريخ الإبلاغ للموظف
    relatedInvestigationNo: string;
    sanctionType: string; // عقوبة المادة 102
    deductionDays?: number;
    details: string;
    evidenceNotes?: string; // القرائن والأحراز
    status: DisciplinaryActionStatus;
    issueDate: string;
    appealDeadlineDate: string; // 20-day legal window
    appealsLogs?: {
        appealDate: string;
        reason: string;
        status: 'pending' | 'accepted' | 'reduced' | 'rejected';
        evidenceNote?: string;
        comments?: string;
    };
    investigationTranscript?: InvestigationTranscript;
    createdAt: string;
    customDocTemplateContent?: string;
}

export interface KuwaitLawViolation {
    type: string;
    category: 'مسلكي' | 'إداري' | 'مالي' | 'أمن معلومات' | 'جسيم';
    progressiveLadder: string[];
    article102Match: string;
    maxDays: number;
    text: string;
    articleReference: string;
}

export const KUWAIT_LABOR_LAW_DISCIPLINARY_LIMITS = {
    maxDeductionDaysPerViolation: 5, // الحد الأقصى للمخالفة الواحدة 5 أيام (المادة 102)
    maxDeductionDaysPerMonth: 5,     // الخصم لا يتجاوز أجر 5 أيام في الشهر الواحد
    maxMonthlyCeilingOverall: 12,    // لا يجوز أن تزيد الاستقطاعات الكلية عن أجر 12 يوماً بالسنة/الشهر المجمع
    appealPeriodDays: 20,            // مهلة التظلم 20 يوماً من تاريخ الإبلاغ الرسمي
    investigationRequiredBeforeDeduction: true // المادة 35: حظر توقيع جزاء قبل التحقيق الكتابي
};

// Comprehensive Violations Catalog mapped to Kuwait Labor Law No. 6/2010
export const VIOLATIONS_LAW_CATALOG: KuwaitLawViolation[] = [
    { 
        type: 'تأخير متكرر عن الدوام الرسمي', 
        category: 'إداري',
        progressiveLadder: ['تنبيه شفهي/كتابي أول', 'إنذار كتابي ثانٍ', 'خصم نصف يوم إلى يوم', 'خصم يومين إلى 3 أيام', 'خصم 5 أيام'],
        article102Match: 'تنبيه -> إنذار -> خصم متدرج حتى 5 أيام',
        maxDays: 3, 
        text: 'بموجب لائحة الانضباط والمادة 102، يتدرج الجزاء من التنبيه الكتابي الأول، مروراً بالإنذار، وصولاً إلى خصم الأجر التدريجي لغاية 5 أيام.',
        articleReference: 'المادة 102 من قانون العمل 6/2010'
    },
    { 
        type: 'غياب بدون عذر مقبول', 
        category: 'إداري',
        progressiveLadder: ['خصم أجر أيام الغياب الفعلية', 'إنذار كتابي شديد اللهجة', 'خصم 3 إلى 5 أيام جزائية', 'الحرمان من الترقية الدورية', 'الفصل بموجب المادة 41'],
        article102Match: 'خصم أجر الغياب + خصم جزائي أو فصل للمادة 41',
        maxDays: 5, 
        text: 'يتم خصم أجر أيام الغياب الفعلية مع توجيه إنذار كتابي. وفي حال الانقطاع لـ 7 أيام متتالية أو 20 يوماً متفرقة بدون إذن، يجوز الفصل وفق المادة 41.',
        articleReference: 'المادتان 102 و 41 من قانون العمل 6/2010'
    },
    { 
        type: 'إهمال وتلف في الممتلكات والعهد والآليات', 
        category: 'مالي',
        progressiveLadder: ['إنذار كتابي + تحمّل قيمة التلفيات', 'خصم 3 أيام من الأجر', 'خصم 5 أيام كحد أقصى', 'الحرمان من العلاوة والترقية', 'إحالة للتحقيق والمساءلة القضائية'],
        article102Match: 'تحميل الخسائر الفعلية + خصم لا يتجاوز أجر 5 أيام شهرياً',
        maxDays: 5, 
        text: 'تنص المادة 102 على إمكانية الخصم بما لا يتجاوز أجر 5 أيام شهرياً، مع إلزام العامل بسداد قيمة التلفيات الناتجة عن إهماله الجسيم وفق المادة 39.',
        articleReference: 'المواد 39 و 102 من قانون العمل 6/2010'
    },
    { 
        type: 'مشادات كلامية ومخالفة السلوك وقواعد اللياقة', 
        category: 'مسلكي',
        progressiveLadder: ['تنبيه مسلكي خطي أول', 'إنذار كتابي رسمي بالملف', 'خصم من يوم إلى 3 أيام', 'خصم 5 أيام مع وقف مؤقت', 'نقل إداري لفرع آخر أو فصل تأديبي'],
        article102Match: 'إنذار -> خصم 1-5 أيام -> إيقاف مؤقت',
        maxDays: 3, 
        text: 'الإخلال بسلوكيات مرفق العمل يوجب التنبيه الخطي والخصم المباشر للحفاظ على وقار المنشأة وانضباط العاملين وحسن سير المرفق.',
        articleReference: 'المادة 102 من قانون العمل 6/2010'
    },
    { 
        type: 'إفشاء أسرار المنشأة وتسريب البيانات والعقود', 
        category: 'أمن معلومات',
        progressiveLadder: ['إيقاف فوري عن العمل للتحقيق', 'خصم 5 أيام بقرار مسبب', 'الحرمان من الترقية السنوية', 'الفصل المباشر دون مكافأة (المادة 41/د)', 'بلاغ رسمي لنيابة شؤون الإعلام والمعلومات'],
        article102Match: 'فصل تأديبي فوري وفق المادة 41 البند (د)',
        maxDays: 5, 
        text: 'يعتبر إفشاء أسرار العمل والمناقصات خطأً جسيماً يتيح لصاحب العمل الفصل الفوري دون إخطار ودون التزام بمكافأة نهاية الخدمة بموجب المادة 41 البند (د).',
        articleReference: 'المادة 41 (بند د) والمادة 35'
    },
    { 
        type: 'مخالفة نظم المعلومات والتلاعب بالحسابات والعهدة', 
        category: 'مالي',
        progressiveLadder: ['إيقاف تحفظي عاجل عن العمل', 'خصم 5 أيام من الراتب', 'حرمان من المكافأة السنوية', 'الفصل التأديبي المباشر مع استرداد الأموال'],
        article102Match: 'إيقاف + خصم 5 أيام + إنهاء خدمة عند ثبوت الاختلاس',
        maxDays: 5, 
        text: 'الولوج غير المصرح به أو التلاعب بالسجلات المالية يوجب الإيقاف التحفظي والخصم المالي مع إمكانية إنهاء الخدمة لائحياً وحفظ حق المنشأة في الرجوع المالي.',
        articleReference: 'المواد 35 و 41 و 102 من قانون العمل 6/2010'
    },
    {
        type: 'الامتناع عن تنفيذ أوامر العمل المشروعة والتعليمات',
        category: 'مسلكي',
        progressiveLadder: ['تنبيه كتابي أول', 'إنذار رسمي بخصم الأجر', 'خصم يومين إلى 3 أيام', 'خصم 5 أيام', 'الفصل بعد تكرار الإنذارات'],
        article102Match: 'إنذار -> خصم متدرج حتى 5 أيام',
        maxDays: 3,
        text: 'الامتناع غير المبرر عن أداء الواجبات المنوطة بالعامل يوجب التدرج في الجزاءات وفق اللائحة المعتمدة لضمان انتظام الإنتاجية.',
        articleReference: 'المادة 102 من قانون العمل 6/2010'
    }
];

// Helper: 20-Day Legal Countdown Calculation
export const calculate20DayCountdown = (notificationDate: string, appealDeadlineDate?: string) => {
    const notifyDate = new Date(notificationDate);
    const deadline = appealDeadlineDate 
        ? new Date(appealDeadlineDate)
        : new Date(notifyDate.getTime() + 20 * 24 * 60 * 60 * 1000);
    
    const now = new Date();
    const diffMs = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    const remainingDays = Math.max(0, diffDays);
    const elapsedDays = Math.min(20, Math.max(0, 20 - remainingDays));
    const progressPercent = Math.round((elapsedDays / 20) * 100);

    let statusSeverity: 'safe' | 'warning' | 'urgent' | 'expired' = 'safe';
    let labelAr = 'سارية ضمن المهلة القانونية';

    if (diffDays <= 0) {
        statusSeverity = 'expired';
        labelAr = 'انتهت مهلة التظلم (20 يوماً)';
    } else if (diffDays <= 3) {
        statusSeverity = 'urgent';
        labelAr = 'عاجل جداً - وشكت على الانقضاء';
    } else if (diffDays <= 8) {
        statusSeverity = 'warning';
        labelAr = 'تنبيه - أقل من 8 أيام متبقية';
    } else {
        statusSeverity = 'safe';
        labelAr = 'آمن - قيد المهلة القانونية المعتمدة';
    }

    return {
        remainingDays,
        elapsedDays,
        deadlineFormatted: deadline.toISOString().split('T')[0],
        progressPercent,
        statusSeverity,
        labelAr
    };
};

export const INITIAL_DISCIPLINARY_SEED: DisciplinaryRecord[] = [
    {
        id: 'da-101',
        recordNumber: 'QA-DISC-2026-001',
        employeeId: 'emp-101',
        employeeName: 'فاطمة علي حسين السيد',
        civilId: '292081501234',
        employeeJobTitle: 'مهندس تنفيذ وبناء أول',
        employeeDepartment: 'قسم الاستشارات والشركات',
        violationType: 'إفشاء أسرار المنشأة وتسريب البيانات والعقود',
        violationDate: '2026-08-10',
        notificationDate: '2026-08-12',
        relatedInvestigationNo: 'QA-INV-2026-001',
        sanctionType: 'خصم من الراتب (3 أيام)',
        deductionDays: 3,
        details: 'تسريب مسودة مخطط مشروع برج العاصمة لمكتب استشاري منافس قبل اعتماد المناقصة رسمياً من إدارة المنشأة.',
        evidenceNotes: 'مراسلات بريد إلكتروني موثقة من قسم أمن المعلومات والشبكات بتاريخ 2026-08-10.',
        status: DisciplinaryActionStatus.APPEALED,
        issueDate: '2026-08-12',
        appealDeadlineDate: '2026-09-01',
        appealsLogs: {
            appealDate: '2026-08-14',
            reason: 'أقدم اعتراضي على قرار الخصم نظراً لأن المخطط المرسل كان النموذج الأولي العام المعلن مسبقاً في الموقع الإلكتروني وليس المخطط النهائي المغلق.',
            status: 'pending',
            evidenceNote: 'نسخة مرفقة من الإعلان العام لمشروع برج العاصمة بتاريخ 2026-08-01.',
            comments: 'بانتظار دراسة عريضة الدفاع المرفقة ومراجعة قسم أمن المعلومات بواسطة المستشار القانوني صبري شطا.'
        },
        investigationTranscript: {
            hearingDate: '2026-08-11',
            hearingTime: '10:30 صباحاً',
            investigatorName: 'المستشار/ صبري شطا',
            subjectName: 'فاطمة علي حسين السيد',
            civilId: '292081501234',
            subjectRole: 'مشكو بحقه',
            oathTaken: true,
            questions: [
                { id: 'q1', question: 'س: ما قولك فيما نسب إليك من تسريب مخطط برج العاصمة؟', answer: 'ج: المخطط المرسل كان نسخة ترويجية منشورة ولم أقم بتسريب أية أسعار أو بيانات سرية.' },
                { id: 'q2', question: 'س: هل حصلتِ على إذن كتابي من مدير الإدارة قبل المراسلة؟', answer: 'ج: كانت المراسلة استجابة لاستفسار فني عاجل بناءً على توجيه شفهي سابق.' }
            ],
            legalAdaptation: 'المخالفة ثابته وتستوجب الخصم المالي بموجب المادة 102 لعدم الاتباع الدقيق للتعليمات.',
            complianceCheck: { article35Passed: true, article102Passed: true, article41Match: false }
        },
        createdAt: '2026-08-12'
    },
    {
        id: 'da-102',
        recordNumber: 'QA-DISC-2026-002',
        employeeId: 'emp-103',
        employeeName: 'بدر فهد المطيري',
        civilId: '288110405678',
        employeeJobTitle: 'مندوب ومتابع قضايا المحاكم',
        employeeDepartment: 'قسم التقاضي والمحاكم',
        violationType: 'تأخير متكرر عن الدوام الرسمي',
        violationDate: '2026-08-14',
        notificationDate: '2026-08-16',
        relatedInvestigationNo: 'QA-INV-2026-004',
        sanctionType: 'إنذار كتابي أول',
        details: 'التأخر عن حضور جلسة إثبات حالة بقصر العدل لمدة 45 دقيقة مما ترتب عليه تأجيل قيد صحيفة الاستئناف.',
        evidenceNotes: 'سجل البصمة الإلكترونية ومحضر حضور جلسة قصر العدل المرفق بملف الدعوى.',
        status: DisciplinaryActionStatus.APPROVED,
        issueDate: '2026-08-16',
        appealDeadlineDate: '2026-09-05',
        appealsLogs: {
            appealDate: '2026-08-18',
            reason: 'تأخر استلام المعاملة كان بسبب عطل شامل لنظم التسجيل الإلكتروني بوزارة العدل وصبرت بالمحكمة لتسجيله يدوياً بقوة القانون وهو عذر قاهر مثبت بإفادة المحكمة.',
            status: 'pending',
            comments: 'جاري تأكيد عطل النظم من وزارة العدل عبر البوابة الذكية لوزارة الشؤون.'
        },
        investigationTranscript: {
            hearingDate: '2026-08-15',
            hearingTime: '01:15 ظهراً',
            investigatorName: 'المستشار/ خالد المنصور',
            subjectName: 'بدر فهد المطيري',
            civilId: '288110405678',
            subjectRole: 'مشكو بحقه',
            oathTaken: true,
            questions: [
                { id: 'q1', question: 'س: ما سبب تأخرك في قيد الإعلانات بمحكمة الفروانية في الموعد المحدد؟', answer: 'ج: كان هناك تعطل في شبكة وزارة العدل وقمت بانتظار المدير الكاتب لقيدها يدوياً.' }
            ],
            legalAdaptation: 'تأخير وظيفي يستوجب توجيه إنذار كتابي لضمان حسن سير المرفق القضائي.',
            complianceCheck: { article35Passed: true, article102Passed: true, article41Match: false }
        },
        createdAt: '2026-08-16'
    },
    {
        id: 'da-103',
        recordNumber: 'QA-DISC-2026-003',
        employeeId: 'emp-102',
        employeeName: 'أحمد محمود مبارك',
        civilId: '295031209876',
        employeeJobTitle: 'محاسب الخزانة والعهدة الرئيسية',
        employeeDepartment: 'الإدارة المالية',
        violationType: 'مخالفة نظم المعلومات والتلاعب بالحسابات والعهدة',
        violationDate: '2026-08-18',
        notificationDate: '2026-08-20',
        relatedInvestigationNo: 'QA-INV-2026-002',
        sanctionType: 'خصم من الراتب (4 أيام)',
        deductionDays: 4,
        details: 'رصد عجز نقدي بالصندوق أثناء الجرد الميداني المقدر بـ 150 د.ك، وتأخر الموظف في تسويتها رقمياً ودفترياً وفقاً للوائح.',
        evidenceNotes: 'تقرير لجنة الجرد المفاجئ للخزينة المرفق بملف المحاسبة المؤرخ 2026-08-18.',
        status: DisciplinaryActionStatus.PENDING,
        issueDate: '2026-08-20',
        appealDeadlineDate: '2026-09-09',
        createdAt: '2026-08-20'
    },
    {
        id: 'da-104',
        recordNumber: 'QA-DISC-2026-004',
        employeeId: 'emp-104',
        employeeName: 'سارة عبد الرحمن الدوسري',
        civilId: '294120803456',
        employeeJobTitle: 'أخصائي شؤون قانونية وعقود',
        employeeDepartment: 'قسم العقود والتوثيق',
        violationType: 'مشادات كلامية ومخالفة السلوك وقواعد اللياقة',
        violationDate: '2026-08-21',
        notificationDate: '2026-08-22',
        relatedInvestigationNo: 'QA-INV-2026-005',
        sanctionType: 'تنبيه مسلكي خطي أول',
        details: 'وقوع ملاسنة لفظية مع أحد المراجعين في صالة الاستقبال وتم احتواء الموقف وتوجيه تنبيه للموظفة بالحفاظ على الهدوء المهني.',
        evidenceNotes: 'تسجيل كاميرات المراقبة الداخلية بصالة الاستقبال الرئيسية.',
        status: DisciplinaryActionStatus.APPROVED,
        issueDate: '2026-08-22',
        appealDeadlineDate: '2026-09-11',
        createdAt: '2026-08-22'
    }
];
