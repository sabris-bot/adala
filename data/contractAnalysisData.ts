import { 
    AnalyzedContract, 
    AnalyzedContractStatus, 
    ContractCategory, 
    RiskLevel 
} from '../types';

export const mockAnalyzedContracts: AnalyzedContract[] = [
    {
        id: 'cnt-1',
        referenceNumber: 'QA-2024-LE-001',
        title: 'عقد إيجار تجاري - مجمع الحمراء',
        category: ContractCategory.LEASE,
        parties: {
            firstParty: 'شركة الحمراء العقارية',
            secondParty: 'شركة الحلول الذكية للتجارة العامة'
        },
        dates: {
            effectiveDate: '2024-01-01',
            expiryDate: '2025-12-31',
            signedDate: '2023-12-15',
            renewalDate: '2025-11-01'
        },
        financials: {
            value: 24000,
            currency: 'KWD',
            paymentTerms: 'دفعات ربع سنوية (3000 د.ك)',
            penalties: 'غرامة 10% عند التأخير لأكثر من 15 يوم'
        },
        duration: 'سنتان',
        status: AnalyzedContractStatus.APPROVED,
        overallRisk: RiskLevel.LOW,
        summary: 'عقد إيجار تجاري لمكتب في الدور 32 بمجمع الحمراء، يتضمن كافة الشروط المعيارية مع التزام الطرفين باللوائح الداخلية للمجمع.',
        keywords: ['إيجار تجاري', 'عقار', 'الكويت', 'مكتب'],
        clauses: [
            {
                id: 'cl-1',
                title: 'الغرض من الإيجار',
                content: 'يستخدم العين المؤجرة لأغراض إدارية فقط ولا يجوز تغيير النشاط إلا بموافقة خطية.',
                risk: RiskLevel.LOW,
                aiRecommendation: 'البند سليم ومتوافق مع الممارسات التجارية.'
            },
            {
                id: 'cl-2',
                title: 'الإخلاء المبكر',
                content: 'في حال رغبة المستأجر في الإخلاء قبل نهاية المدة، يلتزم بدفع كامل القيمة المتبقية من العقد.',
                risk: RiskLevel.MEDIUM,
                aiRecommendation: 'يفضل تعديل هذا البند ليكون التعويض لمدة 3 أشهر فقط كحد أقصى تماشياً مع العرف السائد.'
            }
        ],
        risks: {
            overallRiskScore: 15,
            riskLevel: RiskLevel.LOW,
            criticalIssues: [],
            complianceCheck: {
                isCompliant: true,
                missingMandatoryClauses: [],
                conflictingClauses: []
            },
            securityPercentage: 92
        },
        recommendations: [
            'إضافة بند يوضح مسؤولية الصيانة للأجهزة التكييف المركزية.',
            'تحديد سقف لزيادة الإيجار عند التجديد.'
        ],
        legalAdvice: 'العقد متوازن بشكل جيد ويحمي حقوق المالك والمستأجر، يوصى فقط بتوضيح آلية تسوية النزاعات عبر التحكيم.',
        fileType: 'pdf',
        uploadedBy: 'صبري شطا',
        createdAt: '2024-01-02T10:00:00Z',
        qrCodeData: 'https://qanooni.pro/verify/QA-2024-LE-001',
        tags: ['تجاري', 'مهم'],
        linkedEntities: {
             propertyId: 'prop-1'
        }
    },
    {
        id: 'cnt-2',
        referenceNumber: 'QA-2024-EM-045',
        title: 'عقد عمل - مدير مشاريع',
        category: ContractCategory.EMPLOYMENT,
        parties: {
            firstParty: 'مجموعة الصناعات الوطنية',
            secondParty: 'أحمد محمود العبدالله'
        },
        dates: {
            effectiveDate: '2024-03-01',
            expiryDate: '2025-02-28',
            signedDate: '2024-02-15'
        },
        financials: {
            value: 18000,
            currency: 'KWD',
            paymentTerms: 'راتب شهري (1500 د.ك)',
            penalties: 'تطبق لوائح الجزاءات المعتمدة من وزارة الشؤون'
        },
        duration: 'سنة واحدة (محددة)',
        status: AnalyzedContractStatus.ANALYZED,
        overallRisk: RiskLevel.MEDIUM,
        summary: 'عقد عمل لموظف في منصب قيادي، يشمل حوافز أداء وبنود سرية معلومات صارمة.',
        keywords: ['توظيف', 'مدير', 'قانون العمل الكويت'],
        clauses: [
            {
                id: 'cl-3',
                title: 'عدم المنافسة',
                content: 'يحظر على الموظف العمل لدى أي منافس داخل دولة الكويت لمدة 5 سنوات من ترك الخدمة.',
                risk: RiskLevel.HIGH,
                aiRecommendation: 'فترة 5 سنوات تعتبر تعسفية وغير قابلة للتنفيذ قانوناً في الكويت. الحد الأقصى المقبول عادة هو سنتان وبشرط تحديد النطاق الجغرافي والنشاط بدقة.',
                legalBasis: 'المادة 42 من قانون العمل الكويتي'
            }
        ],
        risks: {
            overallRiskScore: 45,
            riskLevel: RiskLevel.MEDIUM,
            criticalIssues: ['بند عدم المنافسة غير قانوني بوضعه الحالي'],
            complianceCheck: {
                isCompliant: false,
                missingMandatoryClauses: ['بند تحديد الإجازات السنوية بدقة'],
                conflictingClauses: []
            },
            securityPercentage: 75
        },
        recommendations: [
            'تقليص مدة عدم المنافسة لسنتين.',
            'إضافة تفاصيل البدلات (بدل سكن، بدل انتقال).'
        ],
        fileType: 'docx',
        uploadedBy: 'نوال الكندري',
        createdAt: '2024-02-16T14:30:00Z',
        qrCodeData: 'https://qanooni.pro/verify/QA-2024-EM-045',
        linkedEntities: {
            employeeId: 'EMP001'
        }
    },
    {
        id: 'cnt-3',
        referenceNumber: 'QA-2024-SH-012',
        title: 'اتفاقية شراكة - مشروع تطبيق جوال',
        category: ContractCategory.PARTNERSHIP,
        parties: {
            firstParty: 'خالد جاسم محمد',
            secondParty: 'يوسف العتيبي'
        },
        dates: {
            effectiveDate: '2024-05-10',
            signedDate: '2024-05-10'
        },
        financials: {
            value: 50000,
            currency: 'KWD',
            paymentTerms: 'مساهمة رأس مال'
        },
        duration: 'مستمر',
        status: AnalyzedContractStatus.UNDER_REVIEW,
        overallRisk: RiskLevel.HIGH,
        summary: 'اتفاقية بين شريكين تقني ومالي، تفتقر لآلية فك الشراكة أو توزيع المسؤوليات بوضوح.',
        keywords: ['شراكة', 'ستارتب', 'تقنية'],
        clauses: [
            {
                id: 'cl-4',
                title: 'توزيع الأرباح',
                content: 'يتم توزيع الأرباح بنسبة 50% لكل طرف.',
                risk: RiskLevel.MEDIUM,
                aiRecommendation: 'يجب توضيح ما إذا كان التوزيع من الإيرادات أم من صافي الربح، وتحديد تواريخ التوزيع (ربع سنوي، سنوي).'
            }
        ],
        risks: {
            overallRiskScore: 78,
            riskLevel: RiskLevel.HIGH,
            criticalIssues: ['غياب آلية التخارج', 'عدم تحديد شروط تصفية الشراكة'],
            complianceCheck: {
                isCompliant: false,
                missingMandatoryClauses: ['بند القوة القاهرة', 'بند القانون الواجب التطبيق'],
                conflictingClauses: []
            },
            securityPercentage: 40
        },
        recommendations: [
            'إضافة اتفاقية مستوى الخدمة (SLA) للشريك التقني.',
            'تحديد آلية لزيادة رأس المال مستقبلاً.'
        ],
        fileType: 'pdf',
        uploadedBy: 'صبري شطا',
        createdAt: '2024-05-11T09:00:00Z'
    }
];
