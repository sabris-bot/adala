import { AnalyzedContract, ContractCategory, AnalyzedContractStatus, RiskLevel } from '../types';

export const mockAnalyzedContracts: AnalyzedContract[] = [
    {
        id: 'c-1',
        referenceNumber: 'QA-2026-EM-301',
        title: 'عقد توظيف قياسي - أحمد محمود العبدالله',
        category: ContractCategory.EMPLOYMENT,
        parties: {
            firstParty: 'شركة مجموعة الصناعات الوطنية بالعارضية',
            secondParty: 'أحمد محمود العبدالله'
        },
        dates: {
            effectiveDate: '2026-05-25',
            expiryDate: '2027-05-24',
            signedDate: '2026-05-25'
        },
        financials: {
            value: 19200,
            currency: 'KWD',
            paymentTerms: 'تحويل مصرفي كويتي مباشر شهرياً بقيمة 1,600 د.ك',
            penalties: 'تخضع للشروط الجزائية لمخالفة المادة 41 من قانون العمل الكويتي'
        },
        duration: 'سنة واحدة متصلة',
        status: AnalyzedContractStatus.UNDER_REVIEW,
        overallRisk: RiskLevel.LOW,
        summary: 'عقد عمل أهلي كويتي محدد المدة ومطابق لشروط وزارة الشؤون الاجتماعية والعمل بدولة الكويت لشغل منصب مدير مشاريع إنشائية. تم فحص الالتزام ببنود فترة التجربة (90 يوماً)، وساعات العمل (45 ساعة)، والإجازات السنوية بدقة تامة.',
        keywords: ['عمل أهلي', 'فترة التجربة', 'مدير مشاريع', 'صناعات وطنية'],
        clauses: [
            {
                id: 'cl-1-1',
                title: 'البند الأول: فترة التجربة والاختيار',
                content: 'يخضع الطرف الثاني لفترة تجربة واختبار قدرها 90 يوماً عمل مأجورة بالكامل.',
                risk: RiskLevel.LOW,
                category: 'فترة التجربة',
                aiRecommendation: 'شرط فترة التجربة صحيح ومتوافق تماماً مع السقف القانوني البالغ 100 يوم بموجب المادة 17 من قانون العمل الكويتي.',
                legalBasis: 'المادة 17 من قانون العمل الأهلي الكويتي (6/2010)'
            },
            {
                id: 'cl-1-2',
                title: 'البند الثاني: الراتب والبدلات المالية',
                content: 'يستحق الموظف راتباً أساسياً قدره 1,600 د.ك دينار كويتي شهرياً يشمل كافة البدلات المعتادة.',
                risk: RiskLevel.LOW,
                category: 'الأجور والرواتب',
                aiRecommendation: 'الالتزام المالي واضح ويتطابق مع تدرج الرواتب المصنفة، يوصى بمطابقتها مع الحسابات البنكية.',
                legalBasis: 'المادة 57 من قانون العمل الكويتي'
            },
            {
                id: 'cl-1-3',
                title: 'البند الثالث: ساعات العمل والإجازة',
                content: 'يعمل الطرف الثاني بمعدل 45 ساعة عمل أسبوعياً، ويستحق إجازة سنوية مدفوعة الأجر قدرها 35 يوماً بالكامل.',
                risk: RiskLevel.LOW,
                category: 'ساعات العمل والإجازات',
                aiRecommendation: 'ساعات العمل في الإطار السليم (الحد الأقصى 48 ساعة أسبوعياً)، والإجازة البالغة 35 يوماً تتجاوز الحد الأدنى البالغ 30 يوماً وهي ميزة ممتازة للعامل.',
                legalBasis: 'المادتين 64 و 70 من قانون العمل الأهلي'
            }
        ],
        risks: {
            overallRiskScore: 10,
            riskLevel: RiskLevel.LOW,
            criticalIssues: [],
            complianceCheck: {
                isCompliant: true,
                missingMandatoryClauses: [],
                conflictingClauses: []
            },
            securityPercentage: 90
        },
        recommendations: [
            'العقد سليم تماماً ومستحب أرشفته وإصدار ختم الموافقة.',
            'تأكيد ربط الباقة التأمينية للعامل مع حوافز شؤون الموظفين عمالياً.'
        ],
        fileType: 'DOCX',
        uploadedBy: 'صبري شطا',
        createdAt: '2026-05-25T10:12:00Z'
    },
    {
        id: 'c-2',
        referenceNumber: 'QA-2026-LE-099',
        title: 'عقد إيجار مجمع الحمراء العقاري - مكتب دور 32',
        category: ContractCategory.LEASE,
        parties: {
            firstParty: 'شركة مجمع الحمراء العقارية الاستثمارية',
            secondParty: 'شركة الحلول الفنية والبرمجية الذكية'
        },
        dates: {
            effectiveDate: '2026-06-01',
            expiryDate: '2028-05-31',
            signedDate: '2026-05-20'
        },
        financials: {
            value: 24000,
            currency: 'KWD',
            paymentTerms: 'دفعة شهرية مقدماً بقيمة 2,000 د.ك في الأسبوع الأول من كل شهر ميلادي',
            penalties: 'غرامة تأخير قدرها 15% من القيمة الشهرية في حال فوات مواعيد السداد الإلزامية'
        },
        duration: 'سنتان متتاليتان ويبدأ سريانه من 2026-06-01',
        status: AnalyzedContractStatus.APPROVED,
        overallRisk: RiskLevel.MEDIUM,
        summary: 'عقد إيجار تجاري واستثماري معتمد لمكتب مجمع الحمراء العقاري بالمنطقة التجارية في مدينة الكويت. يتضمن التزامات صيانة العين المؤجرة ومبالغ الضمين وغرامات التأخر في دفع الأجور.',
        keywords: ['إيجار تجاري', 'برج الحمراء', 'قيمة استثمارية', 'تأمين شهري'],
        clauses: [
            {
                id: 'cl-2-1',
                title: 'العين المؤجرة والغرض من الاستغلال',
                content: 'يؤجر الطرف الأول للطرف الثاني مكتب رقم 32 بمجمع الحمراء التجاري لاستعماله كمقر إداري للشركة.',
                risk: RiskLevel.LOW,
                category: 'محل العين',
                aiRecommendation: 'البند سليم وصيغة المجمع الإداري واضحة، يوصى بالتحقق من رخصة البلدية قبل المباشرة.'
            },
            {
                id: 'cl-2-2',
                title: 'غرامات وتأخر سداد الدفعات الإيجارية',
                content: 'يلتزم المستأجر بسداد الأجر في الأسبوع الأول، وفي حال التأخر يستحق غرامة قدرها 15% من القيمة الأسبوعية بالإضافة لحق الإجلاء.',
                risk: RiskLevel.MEDIUM,
                category: 'شروط السداد والجزاءات',
                aiRecommendation: 'نسبة 15% تعتبر مرتفعة نسبياً للغرامة الجزائية، والقانون الكويتي يعطي مهلة تصل إلى 20 يوماً من تاريخ المطالبة قبل سلك الإخلاء قضائياً.',
                legalBasis: 'قانون الإيجارات وتعديلاته بالمرسوم رقم 35 لسنة 1978'
            }
        ],
        risks: {
            overallRiskScore: 35,
            riskLevel: RiskLevel.MEDIUM,
            criticalIssues: ['غرامة تأخير السداد بقيمة 15% مرتفعة وقد يحكم القاضي ببطلان الجزء التعسفي منها.'],
            complianceCheck: {
                isCompliant: true,
                missingMandatoryClauses: [],
                conflictingClauses: []
            },
            securityPercentage: 65
        },
        recommendations: [
            'التفاوض على تقليص غرامة تأخير السداد لتبلغ 5% إلى 10% كحد أقصى مألوف.',
            'توثيق ملحق العقد لتحديد سقف سداد فواتير الصيانة والخدمات المشتركة بالبرج.'
        ],
        fileType: 'PDF',
        uploadedBy: 'صبري شطا',
        createdAt: '2026-05-20T08:30:00Z'
    }
];
