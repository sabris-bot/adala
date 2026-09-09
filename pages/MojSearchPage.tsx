import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Modal from '../components/ui/Modal';
import { initialCases } from '../data/caseData';
import { initialEmployees } from './EmployeeProfilePage';
import { Employee, Case } from '../types';

// Import beautiful icons directly from lucide-react as requested
import {
    Search,
    Scale,
    Building2,
    Users,
    Folder,
    Calendar,
    Clock,
    ArrowUpRight,
    FileText,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Printer,
    Download,
    History,
    UserCheck,
    RefreshCw,
    FileSpreadsheet,
    BookOpen,
    Filter,
    Sparkles,
    BookMarked,
    HelpCircle,
    Info,
    ShieldCheck,
    UserX,
    TrendingUp,
    FileCode
} from 'lucide-react';

// --- TYPES ---
type SearchCategory = 'moj' | 'kla' | 'internal';
type UserRole = 'manager' | 'partner' | 'advocate' | 'assistant';

interface AuditLogEntry {
    id: string;
    timestamp: string;
    operator: string;
    role: string;
    targetSource: string;
    query: string;
    status: 'AUTHORIZED' | 'RESTRICTED';
}

interface MojCaseRecord {
    id: string;
    automatedNumber: string; // الرقم الآلي الموحد (11 خانة)
    caseNumber: string; // رقم القضية الكلية
    year: string;
    courtName: string;
    courtBranch: string;
    circuit: string;
    caseType: string;
    status: 'متداولة' | 'محكومة' | 'حجز للحكم' | 'أمر أداء' | 'قيد التنفيذ' | 'طلب مستعجل';
    parties: { name: string; role: 'مدعي' | 'مدعى عليه' | 'طالب تنفيذ' | 'منفذ ضده' | 'مستأنف' | 'مستأنف ضده'; civilId?: string; lawyer?: string }[];
    lastAction: string;
    lastActionDate: string;
    nextHearingDate?: string;
    nextHearingLocation?: string;
    judge?: string;
    isLinkedToAdalah: boolean;
}

interface KlaRecord {
    id: string;
    lawyerName: string;
    enrollId: string;
    civilId: string;
    grade: 'محام مقبول أمام التمييز والدستورية' | 'محام مقبول أمام الاستئناف العالي' | 'محام جدول (ب) أمام الكلية' | 'محام جدول (أ) مشتغلون';
    status: 'فعال ونشط' | 'موقوف للتسوية السنوية' | 'تحت التدريب الفني';
    joinedDate: string;
    outstandingDues: number; // د.ك
    proBonoAssigned: number; // عدد ملفات المعونة المتكفل بها
    poaValidated: boolean; // توثيق الوكالات القضائية
}

interface KlaProBonoRecord {
    id: string;
    caseNumber: string;
    beneficiaryName: string;
    designatedLawyer: string;
    courtName: string;
    assignmentDate: string;
    proBonoStatus: 'قيد المرافعة' | 'منجزة بالكامل' | 'معلقة لعدم الحضور';
}

interface LegalAnnouncement {
    id: string;
    title: string;
    date: string;
    category: 'تعميم إداري' | 'قرار تنظيمي' | 'إعلان خدمة';
    summary: string;
    filePath: string;
}

// --- MOCK DATABASE ---
const mockMojCases: MojCaseRecord[] = [
    {
        id: 'moj-001',
        caseNumber: '1012/2025 تجاري كلي/5',
        automatedNumber: '20250011982',
        year: '2025',
        courtName: 'قصر العدل - المحكمة الكلية',
        courtBranch: 'العاصمة',
        circuit: 'تجاري كلي / 5',
        status: 'متداولة',
        caseType: 'تجاري مدني كلي',
        parties: [
            { name: 'ناصر فهد العتيبي', role: 'مدعي', civilId: '288041100912', lawyer: 'أ. صبري الأنصاري' },
            { name: 'شركة الخليج للتأمين التكافلي', role: 'مدعى عليه' }
        ],
        lastAction: 'إيداع تقرير خبير الإثبات الحسابي المعتمد',
        lastActionDate: '2026-05-10',
        nextHearingDate: '2026-06-15',
        nextHearingLocation: 'قاعة 12 - الدور الثالث',
        judge: 'المستشار بدر الصرعاوي',
        isLinkedToAdalah: true
    },
    {
        id: 'moj-002',
        caseNumber: '948/2024 عمالي/3',
        automatedNumber: '20240098210',
        year: '2024',
        courtName: 'مجمع محاكم حولي - الدائرة العمالية',
        courtBranch: 'حولي',
        circuit: 'عمالي كلي / 3',
        status: 'حجز للحكم',
        caseType: 'مستحقات عمالية',
        parties: [
            { name: 'شركة الإسناد للخدمات اللوجستية', role: 'مدعي', civilId: '102930491022', lawyer: 'أ. أحمد مبارك الأنصاري' },
            { name: 'عبد الله أحمد الشمري', role: 'مدعى عليه', civilId: '292101004551' }
        ],
        lastAction: 'حجز الدعوى لإصدار الحكم الختامي وتعيين مستحقات العطل والضرر',
        lastActionDate: '2026-05-20',
        nextHearingDate: '2026-06-02',
        nextHearingLocation: 'قاعة تجاري 7 - الدور الأرضي',
        judge: 'المستشار خالد الفهد',
        isLinkedToAdalah: false
    },
    {
        id: 'moj-003',
        caseNumber: '1402/2026 أحوال فرع العاصمة',
        automatedNumber: '20260029318',
        year: '2026',
        courtName: 'محكمة الأسرة - العاصمة',
        courtBranch: 'العاصمة',
        circuit: 'جعفري أحوال شخصية / 7',
        status: 'متداولة',
        caseType: 'حضانة ونفقة زوجية',
        parties: [
            { name: 'سحر خالد البنا', role: 'مدعي', civilId: '295111200551' },
            { name: 'غانم يوسف العيسى', role: 'مدعى عليه', civilId: '286022300452', lawyer: 'أ. فاطمة علي السيد' }
        ],
        lastAction: 'إحالة الملف إلى مكتب الرعاية لتفادي الشقاق الزوجي',
        lastActionDate: '2026-05-18',
        nextHearingDate: '2026-06-20',
        nextHearingLocation: 'مكتب تسوية الاستشارات - الفروانية',
        judge: 'المستشار فيصل الرشيدي',
        isLinkedToAdalah: false
    },
    {
        id: 'moj-004',
        caseNumber: '551/2025 جنايات كلي',
        automatedNumber: '20250085421',
        year: '2025',
        courtName: 'قصر العدل - الدائرة الجنائية',
        courtBranch: 'العاصمة',
        circuit: 'جنايات جنح مجمع / 12',
        status: 'محكومة',
        caseType: 'تزوير محرر رسمي',
        parties: [
            { name: 'بدر ناصر السبيعي', role: 'مدعي', civilId: '280050512345' },
            { name: 'النيابة العامة الكويتية', role: 'مدعى عليه' }
        ],
        lastAction: 'إصدار الحكم بالبراءة لانتفاء الركن المادي الجنائي للمحررات والنزاع المستقر',
        lastActionDate: '2026-04-18',
        judge: 'المستشار علي الشمري',
        isLinkedToAdalah: false
    },
    {
        id: 'moj-005',
        caseNumber: '341/2024 تنفيذ الفروانية',
        automatedNumber: '20240019280',
        year: '2024',
        courtName: 'إدارة التنفيذ الكلية - الفروانية',
        courtBranch: 'الفروانية',
        circuit: 'تنفيذ مدني كلي / 2',
        status: 'قيد التنفيذ',
        caseType: 'إجراءات تنفيذ حكم مالي',
        parties: [
            { name: 'شركة المواد الأساسية للخرسانة', role: 'طالب تنفيذ', civilId: '300948920192' },
            { name: 'مؤسسة المقاول العام للإنشاءات', role: 'منفذ ضده', civilId: '400591029311', lawyer: 'أ. خالد الأحمد' }
        ],
        lastAction: 'توجيه أمر حجز سيارات الخصم من حوزة المرور وتعميم منع سفر الخصم المدني ومخاوف مغادرته',
        lastActionDate: '2026-05-22',
        nextHearingDate: '2026-06-10',
        nextHearingLocation: 'قسم التنفيذ الجبري - الفروانية',
        judge: 'المستشار أحمد المطيري',
        isLinkedToAdalah: true
    }
];

const mockKlaRegistry: KlaRecord[] = [
    {
        id: 'kla-001',
        lawyerName: 'أ. صبري أحمد الأنصاري',
        enrollId: '12345',
        civilId: '288041100912',
        grade: 'محام مقبول أمام التمييز والدستورية',
        status: 'فعال ونشط',
        joinedDate: '2010-04-11',
        outstandingDues: 0,
        proBonoAssigned: 14,
        poaValidated: true
    },
    {
        id: 'kla-002',
        lawyerName: 'أ. مريم صالح العتيبي',
        enrollId: '21890',
        civilId: '291090500812',
        grade: 'محام مقبول أمام الاستئناف العالي',
        status: 'فعال ونشط',
        joinedDate: '2016-09-05',
        outstandingDues: 0,
        proBonoAssigned: 8,
        poaValidated: true
    },
    {
        id: 'kla-003',
        lawyerName: 'أ. خالد جاسم الأحمد',
        enrollId: '15620',
        civilId: '294011500712',
        grade: 'محام جدول (ب) أمام الكلية',
        status: 'موقوف للتسوية السنوية',
        joinedDate: '2020-01-15',
        outstandingDues: 75,
        proBonoAssigned: 2,
        poaValidated: false
    },
    {
        id: 'kla-004',
        lawyerName: 'أ. فاطمة علي السيد حسين',
        enrollId: '18933',
        civilId: '287112200556',
        grade: 'محام جدول (أ) مشتغلون',
        status: 'فعال ونشط',
        joinedDate: '2014-11-22',
        outstandingDues: 0,
        proBonoAssigned: 19,
        poaValidated: true
    }
];

const mockKlaProBono: KlaProBonoRecord[] = [
    {
        id: 'pb-101',
        caseNumber: '2025/112 عمالي كلي معونة',
        beneficiaryName: 'أمار بروشاد (عامل متضرر)',
        designatedLawyer: 'أ. فاطمة علي السيد حسين',
        courtName: 'محكمة الرقعي الكلية',
        assignmentDate: '2025-09-12',
        proBonoStatus: 'قيد المرافعة'
    },
    {
        id: 'pb-102',
        caseNumber: '2026/89 أسرة نفقة معونة',
        beneficiaryName: 'نوراة عواد المطيري (أرملة تطلب نفقة)',
        designatedLawyer: 'أ. مريم صالح العتيبي',
        courtName: 'محكمة حولي للأحوال شخصية',
        assignmentDate: '2026-02-05',
        proBonoStatus: 'منجزة بالكامل'
    }
];

const mockKlaAnnouncements: LegalAnnouncement[] = [
    {
        id: 'ann-1',
        title: 'تنظيم قيد الترخيص للاحتفاظ بعضوية مجمع التمييز لعام 2026',
        date: '2026-05-01',
        category: 'قرار تنظيمي',
        summary: 'يستبقى تسجيل المحامين المترافعين إجباراً مع سداد الدورة الإجرائية السنوية الفنية في المحاكم.',
        filePath: 'kla_reg_dec_2026.pdf'
    },
    {
        id: 'ann-2',
        title: 'إطلاق الربط الإلكتروني المباشر للاستعلام عن الوكالات مع وزارة العدل وشؤون التوثيق',
        date: '2026-04-22',
        category: 'إعلان خدمة',
        summary: 'خدمة إلكترونية للتحقق اللحظي عبر البطاقة المدنية للزملاء المشهر في جمعية المحامين.',
        filePath: 'moj_kla_interconnect_api.pdf'
    }
];

const mockSearchTrends = [
    { label: 'استعلام بالرقم الآلي قصر العدل', relevance: 'مرتفع' },
    { label: 'إشكال تنفيذ مدني أول درجة', relevance: 'شائع' },
    { label: 'سداد الاشتراك السنوي لجمعية المحامين', relevance: 'عاجل' },
    { label: 'صحف دعاوي مجمع محاكم الرقعي', relevance: 'شائع' }
];

const mockAuditLogs: AuditLogEntry[] = [
    { id: 'aud-498', timestamp: '2026-05-26 08:30:11', operator: 'المشرف الرئيسي', role: 'مدير النظام', targetSource: 'وزارة العدل', query: 'الرقم الآلي: 20250011982', status: 'AUTHORIZED' },
    { id: 'aud-499', timestamp: '2026-05-26 08:55:04', operator: 'مساعد قضائي فرعي', role: 'مساعد فني', targetSource: 'جمعية المحامين', query: 'مدفوعات الاشتراك السنوي للرواد', status: 'RESTRICTED' },
];

const mockLegalSuggestions: { [key: string]: string } = {
    'حداه': 'حضانة',
    'حكوه': 'محكومة',
    'الالعاب': 'الأمل',
    'تنفيد': 'تنفيذ',
    'عماله': 'عمالي',
    'مدنيه': 'مدني كلي'
};

const mockRelatedSearches: { [key: string]: string[] } = {
    '20250011982': ['أحمد محمود الهاجري كلي', 'إيداع تقرير خبير مالي', 'رابط سداد رسوم القضية رقم 1012'],
    'عمالي': ['نموذج مخالصة نهائية للوزارة', 'قضايا التعويض العمالي الرقعي', 'قرار وزارة الشؤون فصل تعسفي'],
    'حضانة': ['مستندات الرعاية في محكمة الأسرة', 'نموذج إقرار تنازل عن حضانة كويتي', 'أحكام تمييز للزواج من أجنبية']
};

const legalTermExplanations: { [key: string]: string } = {
    'متداولة': 'القضية لا تزال حية وتمر في دورات جلسات المرافعة، تقديم مذكرات الرد والطعون، أو الاستدعاء من قبل سلطات التحقيق وهي في مرحلة نظر موضوع الدعوى.',
    'محكومة': 'صدر في الدعوى حكم ختامي فاصل في الموضوع يسدل به الستار على هذه المرحلة من مجمع الدوائر القضائية الكلية.',
    'حجز للحكم': 'استنفذ الأطراف كافة الدفوع الشفهية والمكتوبة وصارت الدعوى مستعدة للمداولة والمراجعة القضائية المغلقة من القضاة تمهيداً للنطق بالحكم في الجلسة المقبلة.',
    'قيد التنفيذ': 'النزاع حسم قانونياً والملف الآن في عهدة مأموري ورؤساء إدارة التنفيذ الجبري لوزارة العدل لاسترداد الحق المالي أو طرد المستأجر بالقوة والولاية الجبرية.',
    'أمر أداء': 'طلب يقدم مباشرة لرئيس الدائرة المدني أو التجاري لاستصدار أمر سريع للتنفيذ بمديونية ثابتة بالكتابة وحالّة الأداء دون حاجة لعقد مرافعة تقليدية.'
};

const formatCurrency = (amount: number) => {
    return `${amount} د.ك`;
};

const translateSource = (source: string) => {
    switch (source) {
        case 'moj': return 'وزارة العدل كويت';
        case 'kla': return 'جمعية المحامين';
        case 'internal': return 'عدالة الداخلية';
        default: return source;
    }
};

// --- MAIN PAGE LAYOUT ---
const MojSearchPage: React.FC = () => {
    const { addToast } = useToast();

    // App Navigation and Search Target States
    const [searchTab, setSearchTab] = useState<SearchCategory>('moj');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeRole, setActiveRole] = useState<UserRole>('partner');

    // Advanced Filter toggles
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [filterCourtName, setFilterCourtName] = useState('all');
    const [filterCaseType, setFilterCaseType] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCivilId, setFilterCivilId] = useState('');

    // Search History State
    const [searchHistory, setSearchHistory] = useState<string[]>([
        '20250011982', 'أ. صبري الأنصاري', 'حضانة عادية', '948/2024'
    ]);

    // AI Semantic Parser and AI status
    const [aiInputLine, setAiInputLine] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [spellCorrection, setSpellCorrection] = useState<string | null>(null);

    // Audit trail logger state
    const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(mockAuditLogs);

    // Filtered search results dynamic triggers
    const [performedQuery, setPerformedQuery] = useState<string | null>(null);
    const [isLoadingResults, setIsLoadingResults] = useState(false);

    // Detail view Modals
    const [selectedMojCase, setSelectedMojCase] = useState<MojCaseRecord | null>(null);
    const [selectedKlaLawyer, setSelectedKlaLawyer] = useState<KlaRecord | null>(null);
    const [selectedInternalCase, setSelectedInternalCase] = useState<any | null>(null);
    const [statusToExplain, setStatusToExplain] = useState<{ name: string; text: string } | null>(null);

    // Print & Export Modals
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [printTargetResult, setPrintTargetResult] = useState<any | null>(null);

    // Linked status mapping
    const [linkedMojIds, setLinkedMojIds] = useState<string[]>(['moj-001', 'moj-005']);

    // Auto-update suggestions and spellchecker based on query text
    useEffect(() => {
        if (searchQuery.trim().length > 1) {
            // Check for potential typos in Arabic legal terms
            const queryWords = searchQuery.toLowerCase().split(/\s+/);
            let correctionFound = null;
            for (const word of queryWords) {
                if (mockLegalSuggestions[word]) {
                    correctionFound = mockLegalSuggestions[word];
                    break;
                }
            }
            setSpellCorrection(correctionFound);
        } else {
            setSpellCorrection(null);
        }
    }, [searchQuery]);

    // Audit Logger Trigger Helper
    const logAuditActivity = (targetSource: string, query: string, status: 'AUTHORIZED' | 'RESTRICTED') => {
        const operators: Record<UserRole, string> = {
            manager: 'المستشار القانوني العام (Manager)',
            partner: 'شريك فني بالمكتب (Partner)',
            advocate: 'محامي فني مترافع (Advocate)',
            assistant: 'مساعد إداري بالقسم (Assistant)'
        };

        const newLog: AuditLogEntry = {
            id: `aud-${Date.now().toString().slice(-3)}`,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
            operator: operators[activeRole],
            role: activeRole,
            targetSource,
            query: query || 'استعلام عام فارغ',
            status
        };
        setAuditLogs(prev => [newLog, ...prev]);
    };

    // Role restrictions checks: Assistants can't view sensitive legal details
    const isAccessAuthorized = (action: 'view_financials' | 'view_audit_logs' | 'export_data') => {
        if (action === 'view_audit_logs' || action === 'view_financials') {
            return activeRole === 'manager' || activeRole === 'partner';
        }
        return true; // Simple actions allowed for advocacy and assistant
    };

    // Natural Language Parser invoking server-side Gemini endpoint !
    const handleAiParseCommand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiInputLine.trim()) return;

        setIsAiLoading(true);
        addToast({
            type: 'info',
            title: 'الفلترة الذكية نشطة',
            message: 'جاري تمرير المعطيات اللغوية لنموذج Gemini لاستخراج الفواصل الفنية...'
        });

        const promptTemplate = `
        أنتم المساعد البرمجي الفني لمنظومة "عدالة" للمحاماة في الكويت.
        قم بتحليل وتحويل العبارة اللغوية البسيطة التالية إلى معطيات تصفية دقيقة للمحاكم الكويتية:
        "${aiInputLine}"

        استخرج ناتج التحليل ككائن JSON نظيف تماماً بالخصائص التالية فقط:
        - classification: "moj" (إذا كانت العبارة تدل على قضايا ومحاكم واستعلام آلي)، "kla" (جمعية المحامين، انتساب، ملف محامي)، "internal" (ملفات قضايا داخل منظومة المكتب، الموكلين، المهام).
        - searchKeyword: (الكلمة المفتاحية للبحث مثل موضوع النزاع أو الاسم).
        - courtBranch: (محافظة المحكمة مثل "حولي"، "الجهراء"، "العاصمة"، "الفروانية"، "الأحمدي").
        - caseType: (تصنيف الدعوى مثل "عمالي"، "تجاري"، "أحوال شخصية"، "جنايات"، "إيجارات").
        - caseNumber: (رقم قضية كلي أو الرقم الآلي المستخرج لربط الملفات إن كتب رقمياً).

        أعد JSON خام فقط بدون أي مقدمات أو علامات كود أو تغليفات ماركداون.
        `;

        try {
            // Hit our full-stack server-side route
            const response = await fetch('/api/gemini/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: promptTemplate,
                    systemInstruction: "You are a legal data parser returning strictly raw JSON strings representing Kuwait legal fields. Do not explain your output."
                })
            });

            if (response.ok) {
                const data = await response.json();
                try {
                    // Normalize standard JSON formatting response markers from some LLM outputs
                    let pureJsonText = data.text.trim();
                    if (pureJsonText.startsWith('```json')) {
                        pureJsonText = pureJsonText.replace(/^```json/, '').replace(/```$/, '').trim();
                    } else if (pureJsonText.startsWith('```')) {
                        pureJsonText = pureJsonText.replace(/^```/, '').replace(/```$/, '').trim();
                    }

                    const parsedResult = JSON.parse(pureJsonText);
                    
                    // Populate extracted filters directly into input states of Unified search
                    if (parsedResult.classification) {
                        setSearchTab(parsedResult.classification as SearchCategory);
                    }
                    if (parsedResult.searchKeyword) {
                        setSearchQuery(parsedResult.searchKeyword);
                    }
                    if (parsedResult.courtBranch && parsedResult.courtBranch !== '') {
                        setFilterCourtName(parsedResult.courtBranch);
                        setShowAdvancedFilters(true);
                    }
                    if (parsedResult.caseType && parsedResult.caseType !== '') {
                        setFilterCaseType(parsedResult.caseType);
                        setShowAdvancedFilters(true);
                    }
                    if (parsedResult.caseNumber && parsedResult.caseNumber !== '') {
                        setSearchQuery(parsedResult.caseNumber);
                    }

                    addToast({
                        type: 'success',
                        title: 'تم استخراج الصياغة',
                        message: `تم تفسير الطلب: [تصنيف: ${translateSource(parsedResult.classification)}, النطاق: ${parsedResult.searchKeyword || 'عام'}]`
                    });
                    
                    // Execute automatic execution search matching based on parsed AI response
                    setPerformedQuery(parsedResult.searchKeyword || parsedResult.caseNumber || 'AI_PARSE');
                    logAuditActivity('AI Semantic Extract', aiInputLine, 'AUTHORIZED');

                } catch (e) {
                    // Fallback to client extraction heuristics if JSON parsing failed
                    executeLocalAiFallback(aiInputLine);
                }
            } else {
                executeLocalAiFallback(aiInputLine);
            }
        } catch (error) {
            executeLocalAiFallback(aiInputLine);
        } finally {
            setIsAiLoading(false);
            setAiInputLine('');
        }
    };

    // Fast, local string parsing algorithm to guarantee 100% operation even if backend key is missing
    const executeLocalAiFallback = (input: string) => {
        let keyword = input;
        let source: SearchCategory = 'moj';
        let court = 'all';
        let type = 'all';

        const text = input.toLowerCase();

        if (text.includes('جمعية') || text.includes('محامين') || text.includes('كادر') || text.includes('اشتراك')) {
            source = 'kla';
        } else if (text.includes('مكتبنا') || text.includes('داخلي') || text.includes('ملف الموكل') || text.includes('القضايا المثبتة')) {
            source = 'internal';
        }

        if (text.includes('حولي')) court = 'حولي';
        else if (text.includes('الرقعي') || text.includes('الفروانية')) court = 'الفروانية';
        else if (text.includes('العاصمة') || text.includes('العدل')) court = 'العاصمة';

        if (text.includes('عمالي') || text.includes('رواتب') || text.includes('مستحقات')) type = 'عمالي';
        else if (text.includes('تجاري') || text.includes('شركات') || text.includes('شيك')) type = 'تجاري';
        else if (text.includes('حضانة') || text.includes('أسرة') || text.includes('نفقة')) type = 'أحوال شخصية';
        else if (text.includes('جناية') || text.includes('تزوير') || text.includes('سرقة') || text.includes('حبس')) type = 'جنايات';

        // Set inputs
        setSearchTab(source);
        // Stripping out common stop words to keep pure keywords
        const cleanQuery = input.replace(/(ابحث عن|أبي|قضية|فولدر|قضايا|ملف|مكتب|البحث بـ)/gi, '').trim();
        setSearchQuery(cleanQuery);
        
        if (court !== 'all') setFilterCourtName(court);
        if (type !== 'all') setFilterCaseType(type);
        if (court !== 'all' || type !== 'all') {
            setShowAdvancedFilters(true);
        }

        setPerformedQuery(cleanQuery);
        logAuditActivity('Heuristic Local AI Parse', input, 'AUTHORIZED');
        
        addToast({
            type: 'success',
            title: 'تمت الفلترة محلياً',
            message: 'تم تصفية المعطيات وإدراج الفلاتر موضوعياً بالاعتماد على التحليل الإشاري المدمج.'
        });
    };

    // Submitting general search trigger
    const handleGeneralSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingResults(true);
        
        // Simulating robust portal ping
        setTimeout(() => {
            setIsLoadingResults(false);
            setPerformedQuery(searchQuery);

            // Keep query tracked in Search History
            if (searchQuery.trim() && !searchHistory.includes(searchQuery.trim())) {
                setSearchHistory(prev => [searchQuery.trim(), ...prev.slice(0, 5)]);
            }

            logAuditActivity(translateSource(searchTab), searchQuery, 'AUTHORIZED');
            
            addToast({
                type: 'success',
                title: 'تحديث سجل الاستعلام',
                message: `تم جلب المتطابقات المتصلة بـ (${searchQuery || 'الكل'}) لتبويب ${translateSource(searchTab)}`
            });
        }, 650);
    };

    // Import a case record from MOJ to internal Adalah database dynamically
    const handleImportMojCase = (record: MojCaseRecord) => {
        if (!isAccessAuthorized('export_data')) {
            addToast({ type: 'warning', title: 'صلاحيات منقوصة', message: 'عفواً، لا يملك دورك الفني ترخيص دمج ملفات وزارة العدل.' });
            logAuditActivity('Demanded Import', record.caseNumber, 'RESTRICTED');
            return;
        }

        if (linkedMojIds.includes(record.id)) {
            addToast({ type: 'info', title: 'مرتبط مسبقاً', message: 'هذا السند القضائي الكلي مسجل ومؤرشف بالفعل بقاعدة مكاتب عدالة.' });
            return;
        }

        setLinkedMojIds(prev => [...prev, record.id]);
        logAuditActivity('Link MOJ Case To Vault', `${record.caseNumber} - ${record.automatedNumber}`, 'AUTHORIZED');

        addToast({
            type: 'success',
            title: 'تم الربط والأرشفة الإلكترونية',
            message: `تم إنشاء فولدر جديد للمشهد القضائي رقم ${record.caseNumber} بقسم المطالبات بنجاح.`
        });
    };

    // Break down filtered records across active tabs
    const filteredMojResults = useMemo(() => {
        if (!performedQuery && searchQuery === '') return mockMojCases;

        return mockMojCases.filter(item => {
            const term = searchQuery.toLowerCase();
            const matchesSearch = item.caseNumber.toLowerCase().includes(term) ||
                item.automatedNumber.includes(term) ||
                item.caseType.toLowerCase().includes(term) ||
                item.courtName.toLowerCase().includes(term) ||
                item.parties.some(p => p.name.toLowerCase().includes(term)) ||
                (item.judge && item.judge.toLowerCase().includes(term));

            const matchesCourt = filterCourtName === 'all' || item.courtBranch.includes(filterCourtName);
            const matchesType = filterCaseType === 'all' || item.caseType.includes(filterCaseType);
            const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
            const matchesCivilId = !filterCivilId || item.parties.some(p => p.civilId && p.civilId.includes(filterCivilId));

            return matchesSearch && matchesCourt && matchesType && matchesStatus && matchesCivilId;
        });
    }, [mockMojCases, performedQuery, searchQuery, filterCourtName, filterCaseType, filterStatus, filterCivilId]);

    const filteredKlaResults = useMemo(() => {
        if (!performedQuery && searchQuery === '') return mockKlaRegistry;

        return mockKlaRegistry.filter(item => {
            const term = searchQuery.toLowerCase();
            const matchesSearch = item.lawyerName.toLowerCase().includes(term) ||
                item.enrollId.includes(term) ||
                item.grade.toLowerCase().includes(term) ||
                item.civilId.includes(term);

            const matchesStatus = filterStatus === 'all' || 
                (filterStatus === 'متداولة' && item.status === 'فعال ونشط') ||
                (filterStatus === 'حجز للحكم' && item.status === 'موقوف للتسوية السنوية');

            return matchesSearch && matchesStatus;
        });
    }, [mockKlaRegistry, performedQuery, searchQuery, filterStatus]);

    const filteredInternalResults = useMemo(() => {
        // Querying caseData cases
        const sourceList = initialCases;
        if (!performedQuery && searchQuery === '') return sourceList;

        return sourceList.filter(item => {
            const term = searchQuery.toLowerCase();
            const matchesSearch = item.title.toLowerCase().includes(term) ||
                item.caseNumber.toLowerCase().includes(term) ||
                item.internalCaseNumber.toLowerCase().includes(term) ||
                item.clientName.toLowerCase().includes(term) ||
                item.assignedLawyer.toLowerCase().includes(term) ||
                (item.courtName && item.courtName.toLowerCase().includes(term)) ||
                (item.circuit && item.circuit.toLowerCase().includes(term));

            const matchesType = filterCaseType === 'all' || item.caseMainType?.toString().toLowerCase().includes(filterCaseType.toLowerCase());
            
            return matchesSearch && matchesType;
        });
    }, [initialCases, performedQuery, searchQuery, filterCaseType]);

    // Fast status description trigger
    const triggerStatusExplanation = (statusName: string) => {
        const desc = legalTermExplanations[statusName] || 'تصنيف قضائي خاضع للمراجعة في قانون المرافعات الكويتي.';
        setStatusToExplain({ name: statusName, text: desc });
    };

    // Simulated download reports format
    const executeExportOfSearchData = (format: 'xlsx' | 'docx' | 'pdf') => {
        if (format === 'pdf') {
            setIsPrintModalOpen(true);
            setPrintTargetResult(searchTab === 'moj' ? filteredMojResults : searchTab === 'kla' ? filteredKlaResults : filteredInternalResults);
            return;
        }

        // Clean headers alignment and CSV format construction
        let content = '';
        let title = '';

        if (searchTab === 'moj') {
            title = 'استعلامات_بوابة_العدل';
            content = 'رقم القضية,الرقم الآلي,درجة التقاضي,المحكمة,آخر إجراء,الحالة\n' +
                filteredMojResults.map(r => `"${r.caseNumber}","${r.automatedNumber}","${r.caseType}","${r.courtBranch}","${r.lastAction}","${r.status}"`).join('\n');
        } else if (searchTab === 'kla') {
            title = 'رول_جمعية_المحامين';
            content = 'الاسم,رقم القيد,المستوى المهني,الحالة,الوكالات الموثقة\n' +
                filteredKlaResults.map(r => `"${r.lawyerName}","${r.enrollId}","${r.grade}","${r.status}","${r.poaValidated ? 'نعم' : 'لا'}"`).join('\n');
        } else {
            title = 'سجلات_عدالة_الداخلية';
            content = 'القضية,الرقم,الموكل,المحام المشرف,المحكمة\n' +
                filteredInternalResults.map(r => `"${r.title}","${r.caseNumber}","${r.clientName}","${r.assignedLawyer}","${r.courtName}"`).join('\n');
        }

        const mimeType = format === 'xlsx' ? 'text/csv;charset=utf-8;' : 'application/msword;charset=utf-8;';
        const rawBlob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), content], { type: mimeType }); // Add Byte Order Mark (BOM) for Excel Arabic rendering support
        const tempLink = document.createElement('a');
        tempLink.href = URL.createObjectURL(rawBlob);
        tempLink.setAttribute('download', `${title}_${format === 'xlsx' ? 'جدول' : 'مستند'}_${new Date().toISOString().slice(0,10)}.${format === 'xlsx' ? 'csv' : 'doc'}`);
        document.body.appendChild(tempLink);
        tempLink.click();
        document.body.removeChild(tempLink);

        addToast({
            type: 'success',
            title: 'بدء التنزيل الرقمي',
            message: `تم تحضير وبث التقرير المحوسب المعتمد لـ ${translateSource(searchTab)} بترميز آمن.`
        });
        logAuditActivity(`Export report as ${format.toUpperCase()}`, `${translateSource(searchTab)} Tab Data`, 'AUTHORIZED');
    };

    return (
        <div id="legal-search-hub" className="space-y-8 max-w-7xl mx-auto pb-44 animate-fadeIn">

            {/* Custom Interactive Floating Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl border border-slate-800">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl" />
                <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-emerald-500/5 rounded-full blur-2xl" />

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6 text-center lg:text-right flex-col md:flex-row">
                        <div className="p-4 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/10 shadow-inner">
                            <Scale className="w-10 h-10 text-amber-400 rotate-12" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white font-sans">
                                    بوابة الاستعلام القانوني الموحد
                                </h1>
                                <span className="bg-amber-400 text-slate-950 text-[10px] px-3 py-1 rounded-full font-black font-mono tracking-wider uppercase">
                                    Adalah Search Engine v3
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-2 font-bold max-w-xl leading-relaxed">
                                واجهة اتصال ذكية لربط السجلات المركزية لوزارة العدل الكويتية ورول القيود بجمعية المحامين، مدمجة مباشرة مع قاعدة المستندات والقضايا الداخلية للمكتب
                            </p>
                        </div>
                    </div>

                    {/* Role Controller simulator showcasing security and logs features */}
                    <div className="bg-slate-950/60 backdrop-blur-md p-4 rounded-3xl border border-slate-800 w-full lg:w-auto">
                        <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 block mb-2 text-center lg:text-right">
                            صلاحية ومرونة العرض النشط (RBAC Visualizer)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            {[
                                { id: 'manager', label: 'مستشار مشرف', icon: ShieldCheck },
                                { id: 'partner', label: 'محامي شريك', icon: UserCheck },
                                { id: 'advocate', label: 'محامي مترافع', icon: Scale },
                                { id: 'assistant', label: 'مساعد إداري', icon: Users }
                            ].map(role => (
                                <button
                                    key={role.id}
                                    onClick={() => {
                                        setActiveRole(role.id as UserRole);
                                        addToast({
                                            type: 'info',
                                            title: 'تغيير رتبة المستخدم',
                                            message: `تم تحويل الهوية الفاعلة الآن إلى: [${role.label}]`
                                        });
                                        logAuditActivity('Changed active session role', `Shifted to ${role.label}`, 'AUTHORIZED');
                                    }}
                                    className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-bold transition-all ${activeRole === role.id ? 'bg-amber-400 text-slate-950 shadow-md scale-105' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
                                >
                                    <role.icon className="w-3.5 h-3.5" />
                                    <span>{role.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Smart central AI Natural language parser widget */}
            <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-emerald-500/5 p-6 rounded-3xl border border-indigo-500/20 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                        <h4 className="text-xs font-black text-slate-350 tracking-wide uppercase">مترجم البحث الدلالي بالذكاء الاصطناعي (Gemini Arabic Semantic Parser)</h4>
                        <p className="text-[10px] text-gray-500 font-bold mt-0.5">اكتب جملة طبيعية بسيطة عما تريد لكي يفهمها محرك البحث ويضبط التصنيفات تلقائياً</p>
                    </div>
                </div>

                <form onSubmit={handleAiParseCommand} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            value={aiInputLine}
                            onChange={(e) => setAiInputLine(e.target.value)}
                            placeholder="مثال: أبي قضايا الحضانة الزوجية مال ناصر العتيبي في قصر العدل فرع العاصمة..."
                            className="w-full text-xs bg-white dark:bg-dm-card border-gray-100 dark:border-gray-850 focus:border-indigo-500 rounded-2xl pr-4 pl-10 py-3.5 shadow-sm font-bold placeholder-slate-400 text-slate-800"
                        />
                        <Sparkles className="w-4 h-4 text-slate-300 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <Button
                        type="submit"
                        isLoading={isAiLoading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold px-6 rounded-2xl shadow-lg border-none shrink-0"
                    >
                        ترجمة بالذكاء الاصطناعي
                    </Button>
                </form>

                {/* Popular Kuwaiti Legal Inquiries recommended cards */}
                <div className="flex flex-wrap items-center gap-2 mt-4 text-[10px]">
                    <span className="text-indigo-400 font-black flex items-center gap-1 leading-none"><TrendingUp className="w-3.5 h-3.5" /> المقترحات الرائجة البحثية:</span>
                    {mockSearchTrends.map((trend, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setAiInputLine(trend.label);
                                addToast({ type: 'info', title: 'تم تعيين المقترح', message: 'انقر على "ترجمة بالذكاء الاصطناعي" لتحويل الصياغة.' });
                            }}
                            className="bg-white/40 dark:bg-dm-background hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-500/10 font-bold text-gray-650 flex items-center gap-1 transition-colors"
                        >
                            <span>{trend.label}</span>
                            <span className="text-[7.5px] bg-indigo-500/15 text-indigo-650 px-1 rounded-sm font-black">{trend.relevance}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main search execution section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Input, tabs navigation, and matching lists */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        
                        {/* Three primary Target Datastore Tabs */}
                        <div className="flex bg-gray-50/50 p-2 gap-2 border-b border-gray-100">
                            {[
                                { id: 'moj', label: 'بوابة وزارة العدل', description: 'وزارة العدل (Case/Experts/Exec)', icon: Building2 },
                                { id: 'kla', label: 'سجلات جمعية المحامين', description: 'جمعية المحامين (Advocates/POAs)', icon: BookMarked },
                                { id: 'internal', label: 'قاعدة البيانات الداخلية', description: 'ملفات عدالة (CRM/In-house)', icon: Folder }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setSearchTab(tab.id as SearchCategory);
                                        setPerformedQuery(null);
                                        setSpellCorrection(null);
                                        // Reset specific filter tabs
                                        setFilterCourtName('all');
                                        setFilterCaseType('all');
                                    }}
                                    className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 px-4 rounded-2xl text-xs font-black transition-all ${searchTab === tab.id ? 'bg-white text-indigo-650 shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-650'}`}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <tab.icon className={`w-4 h-4 ${searchTab === tab.id ? 'text-indigo-650' : 'text-gray-300'}`} />
                                        <span>{tab.label}</span>
                                    </div>
                                    <span className="text-[8px] font-mono tracking-tighter opacity-60 font-bold hidden sm:inline">{tab.description}</span>
                                </button>
                            ))}
                        </div>

                        {/* Search controls form */}
                        <div className="p-6 md:p-8">
                            <form onSubmit={handleGeneralSearchSubmit} className="space-y-6">
                                
                                <div className="flex gap-3">
                                    <div className="relative flex-grow">
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder={
                                                searchTab === 'moj' ? "البحث برقم القضية، الرقم الآلي، اسم طرف الخصام، المستشار الطبي..." :
                                                searchTab === 'kla' ? "البحث باسم المحامي، رقم القيد الوطني، الهوية، أو المستوى الاستئنافي..." :
                                                "البحث بملفات القضايا المسجلة، اسم موكل عدالة، المحامي الكفيل..."
                                            }
                                            className="w-full text-xs bg-slate-50 border-none rounded-2xl pr-4 pl-10 py-3.5 shadow-sm focus:bg-white focus:ring-1 focus:ring-indigo-500 font-extrabold text-slate-800 placeholder-slate-400"
                                        />
                                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    </div>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                        className={`rounded-2xl shrink-0 ${showAdvancedFilters ? 'bg-indigo-50/50 border-indigo-200 text-indigo-650' : ''}`}
                                        leftIcon={<Filter className="w-4 h-4" />}
                                    >
                                        التصفية المتقدمة {showAdvancedFilters ? '▲' : '▼'}
                                    </Button>
                                </div>

                                {/* Custom Typos Spell correction notification badge */}
                                {spellCorrection && (
                                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] font-bold flex items-center justify-between animate-fadeIn">
                                        <div className="flex items-center gap-1.5">
                                            <Info className="w-4 h-4 text-amber-500" />
                                            <span>هل كتبت كلمة خطأ؟ هل تقصد تصفية موضوعية بـ: <strong>{spellCorrection}</strong>؟</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery(spellCorrection);
                                                setSpellCorrection(null);
                                            }}
                                            className="text-xs text-indigo-600 hover:underline font-black"
                                        >
                                            تطبيق التصحيح
                                        </button>
                                    </div>
                                )}

                                {/* Advanced slide drawers */}
                                <AnimatePresence>
                                    {showAdvancedFilters && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-4 bg-gray-50 dark:bg-dm-background border dark:border-gray-850 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold pt-3 mt-2 pr-1">
                                                <div>
                                                    <label className="text-slate-400 mb-1.5 block">المجمع القضائي المعني:</label>
                                                    <select
                                                        value={filterCourtName}
                                                        onChange={(e) => setFilterCourtName(e.target.value)}
                                                        className="w-full border-none bg-white p-2 text-xs font-extrabold shadow-sm rounded-xl"
                                                    >
                                                        <option value="all">كافة مجمعات المحاكم الكلية</option>
                                                        <option value="العاصمة">مجمع قصر العدل - العاصمة</option>
                                                        <option value="حولي">محكمة حولي للأفراد</option>
                                                        <option value="الفروانية">مجمع محاكم الرقعي - الفروانية</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-slate-400 mb-1.5 block">التصنيف الإجرائي للدعوى:</label>
                                                    <select
                                                        value={filterCaseType}
                                                        onChange={(e) => setFilterCaseType(e.target.value)}
                                                        className="w-full border-none bg-white p-2 text-xs font-extrabold shadow-sm rounded-xl"
                                                    >
                                                        <option value="all">كافة نطاق تصانيف النزاع</option>
                                                        <option value="تجاري">نزاعات تجارية ومدنية مدمجة</option>
                                                        <option value="عمالي">مستحقات ورواتب عمالية</option>
                                                        <option value="حضانة">أحوال شخصية وشؤون أسرة</option>
                                                        <option value="جنايات">مجموعة الجنايات والحدود</option>
                                                        <option value="تنفيذ">إدارة كتاب التنفيذ</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-slate-400 mb-1.5 block">وضع الاستئناف الحالي:</label>
                                                    <select
                                                        value={filterStatus}
                                                        onChange={(e) => setFilterStatus(e.target.value)}
                                                        className="w-full border-none bg-white p-2 text-xs font-extrabold shadow-sm rounded-xl"
                                                    >
                                                        <option value="all">كافة حالات السند</option>
                                                        <option value="متداولة">متداولة جلسات مرافعة</option>
                                                        <option value="حجز للحكم">حجز للحكم والمراجعة</option>
                                                        <option value="محكومة">محكومة بالرفض أو القبول</option>
                                                        <option value="قيد التنفيذ">قيد التنفيذ الجبري</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-slate-400 mb-1.5 block">البطاقة المدنية لطرف الخصومة:</label>
                                                    <input
                                                        type="text"
                                                        value={filterCivilId}
                                                        onChange={(e) => setFilterCivilId(e.target.value)}
                                                        placeholder="أدخل 12 رقم للتحقق..."
                                                        maxLength={12}
                                                        className="w-full border-none bg-white p-2 text-xs font-extrabold shadow-sm rounded-xl text-center"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Footer submit row with security visual indicators */}
                                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                        <span>حالة اتصال الربط: وزارة العدل (متصل بالكامل ✅)</span>
                                    </div>
                                    <div className="w-full md:w-auto flex gap-2">
                                        <Button
                                            type="submit"
                                            isLoading={isLoadingResults}
                                            className="bg-indigo-650 hover:bg-slate-800 text-white font-extrabold px-10 py-3.5 rounded-2xl shadow-lg border-none"
                                            leftIcon={<Search className="w-4 h-4" />}
                                        >
                                            إجراء استعلام مفصل
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* RESULTS OUTPUT MATRIX */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <span>سجلات النتائج المتطابقة لحقيبة البحث</span>
                                    <span className="bg-slate-1050 bg-slate-100 text-indigo-650 px-2 py-0.5 rounded text-xs font-black">
                                        {searchTab === 'moj' ? filteredMojResults.length : searchTab === 'kla' ? filteredKlaResults.length : filteredInternalResults.length}
                                    </span>
                                </h3>
                                <p className="text-[10px] text-gray-400 font-bold mt-0.5">البحث المجرى يشمل أرشيف بوابة الكويت ومخططات الدوائر</p>
                            </div>

                            {/* Export / Report button groups */}
                            <div className="flex items-center gap-2.5">
                                <span className="text-[9px] text-slate-400 font-black tracking-wider block">تصدير الفهرس الماثل: </span>
                                <button
                                    onClick={() => executeExportOfSearchData('xlsx')}
                                    className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-500/10 transition-all font-bold text-[10px] flex items-center gap-1.5"
                                >
                                    <FileSpreadsheet className="w-3.5 h-3.5" />
                                    <span>Excel</span>
                                </button>
                                <button
                                    onClick={() => executeExportOfSearchData('docx')}
                                    className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-500/10 transition-all font-bold text-[10px] flex items-center gap-1.5"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Word</span>
                                </button>
                                <button
                                    onClick={() => executeExportOfSearchData('pdf')}
                                    className="p-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-500/10 transition-all font-bold text-[10px] flex items-center gap-1.5"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>طباعة PDF</span>
                                </button>
                            </div>
                        </div>

                        {/* --- CASE 1: MOJ RESULTS CONTAINER --- */}
                        {searchTab === 'moj' && (
                            <div className="space-y-4">
                                {filteredMojResults.length === 0 ? (
                                    <div className="bg-white rounded-3xl p-16 text-center borderBorder border border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-red-50/50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <AlertTriangle className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-sm font-black text-slate-800">لا توجد تطابقات في سجلات وزارة العدل</h4>
                                        <p className="text-[11px] text-gray-400 font-bold mt-1 max-w-sm mx-auto leading-relaxed">
                                            تأكد من كتابة الرقم الـ 11 الآلي الموحد القضائي بصيغة رقمية صحيحة أو حذف فلاتر التصفية الجانبية وتجربة البحث مجدداً.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {filteredMojResults.map(item => (
                                            <div
                                                key={item.id}
                                                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all group"
                                            >
                                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                                    <div className="flex-grow space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black">
                                                            <span className="bg-slate-105 bg-slate-100 text-gray-500 px-2 py-0.5 rounded leading-none uppercase">بوابة وزارة العدل الكويتية</span>
                                                            <span className="text-gray-400 font-mono tracking-tight leading-none">رقم آلي: {item.automatedNumber}</span>
                                                        </div>
                                                        <h4 className="font-black text-base text-indigo-700 tracking-tight mt-1.5">
                                                            {item.caseNumber}
                                                        </h4>
                                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-bold text-gray-550 pt-1">
                                                            <span className="flex items-center gap-1 text-slate-700"><Building2 className="w-3.5 h-3.5 text-gray-400" /> {item.courtName}</span>
                                                            <span className="flex items-center gap-1"><Scale className="w-3.5 h-3.5 text-gray-400" /> دائرة: {item.circuit}</span>
                                                            <span className="flex items-center gap-1 text-indigo-600 font-mono">({item.caseType})</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex select-none gap-2 shrink-0">
                                                        <button 
                                                            onClick={() => triggerStatusExplanation(item.status)}
                                                            className="text-xs font-black cursor-pointer bg-slate-50 border hover:bg-slate-100 rounded-full px-3 py-1 flex items-center gap-1 text-slate-600"
                                                        >
                                                            <span>الحالة:</span>
                                                            <span className="text-indigo-650 underline">{item.status}</span>
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="p-3.5 bg-slate-50 max-h-36 overflow-y-auto leading-relaxed text-[11px] font-black text-slate-700 rounded-2xl border border-gray-100 mt-4">
                                                    <span className="text-indigo-500 block text-[9px] font-black uppercase mb-0.5">آخر إجراء رسمي مسجل:</span>
                                                    {item.lastAction}
                                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 text-[9px] font-bold text-slate-400">
                                                        <span className="flex items-center gap-1"><Clock className="w-3" /> جرى التدوين في بوابة العدل: {item.lastActionDate}</span>
                                                        {item.nextHearingDate && (
                                                            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded font-black">📅 الجلسة القادمة بملخص الأجندة: {item.nextHearingDate}</span>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                                                    <div className="flex flex-wrap gap-2 text-[10px] font-black text-slate-500">
                                                        <span>👥 طرفي النزاع:</span>
                                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">المدعي: {item.parties[0].name}</span>
                                                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded">ضده: {item.parties[1]?.name || '...'}</span>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedMojCase(item)}
                                                            className="rounded-xl"
                                                            leftIcon={<FileText className="w-3.5 h-3.5" />}
                                                        >
                                                            معاينة الملف الكلي
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleImportMojCase(item)}
                                                            className={`rounded-xl px-4 ${linkedMojIds.includes(item.id) ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-slate-900 text-white'}`}
                                                            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                                                        >
                                                            {linkedMojIds.includes(item.id) ? 'مرتبط بعدالة (مؤرشف) ✓' : 'أرشفة واستيراد القضية'}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- CASE 2: KLA RESULTS CONTAINER --- */}
                        {searchTab === 'kla' && (
                            <div className="space-y-4">
                                {filteredKlaResults.length === 0 ? (
                                    <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-red-50/50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <AlertTriangle className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-sm font-black text-slate-800">لا توجد سجلات للمحامين المتطابقة بجمعية المحامين</h4>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {filteredKlaResults.map(item => (
                                            <div
                                                key={item.id}
                                                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-500/30 transition-all"
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-450">
                                                            <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded leading-none">عضوية جمعية المحامين الكويتية</span>
                                                            <span className="text-gray-400 font-mono block">رقم القيد المركزي: #{item.enrollId}</span>
                                                        </div>
                                                        <h4 className="font-black text-base text-slate-900 mt-1.5">{item.lawyerName}</h4>
                                                        <p className="text-[11px] font-bold text-gray-500">{item.grade}</p>
                                                    </div>
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full ${item.status === 'فعال ونشط' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                                        {item.status}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 rounded-2xl pr-3 p-4 mt-4 text-xs font-bold font-mono">
                                                    <div>
                                                        <span className="text-gray-400 block text-[9.5px] uppercase mb-0.5">البطاقة المدنية:</span>
                                                        <span className="text-slate-800">{item.civilId}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block text-[9.5px] uppercase mb-0.5">مستحقات الاشتراك لتجديد الكادر:</span>
                                                        <span className={item.outstandingDues > 0 ? 'text-red-650' : 'text-emerald-700'}>
                                                            {item.outstandingDues > 0 ? formatCurrency(item.outstandingDues) : 'تم السداد المالي ✓'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block text-[9.5px] uppercase mb-0.5">قضايا المعونة المتكفل بها:</span>
                                                        <span className="text-indigo-600 font-black">{item.proBonoAssigned} ملف دفاع مجاني معونة</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400 block text-[9.5px] uppercase mb-0.5">توثيق الوكالات القضائية:</span>
                                                        <span className={item.poaValidated ? 'text-emerald-700' : 'text-amber-700'}>
                                                            {item.poaValidated ? 'معتمد ومصدق بالعدل ✓' : 'معطل بانتظار البصمة'}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                                                    <span className="text-[10px] text-gray-400 font-bold block">تاريخ الانتساب والاعتماد الرسمي المكتظ: {item.joinedDate}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedKlaLawyer(item)}
                                                            className="rounded-xl"
                                                            leftIcon={<Info className="w-3.5 h-3.5" />}
                                                        >
                                                            مراجعة الانتساب والملف الفني
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => {
                                                                setIsPrintModalOpen(true);
                                                                setPrintTargetResult(item);
                                                            }}
                                                            className="bg-indigo-650 text-white rounded-xl px-4"
                                                            leftIcon={<Printer className="w-3.5 h-3.5" />}
                                                        >
                                                            صرف شهادة الكفاءة لجمعية المحامين
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {/* KLA Pro-Bono Assignments lists */}
                                        <div className="mt-8 bg-purple-500/5 p-6 rounded-3xl border border-purple-500/10">
                                            <h4 className="text-sm font-black text-purple-950 flex items-center gap-2 mb-3">
                                                <Users className="w-4 h-4 text-purple-600" />
                                                سجل ملفات المعونة والخدمات المجانية النشطة (KLA Legal Aid Roster)
                                            </h4>
                                            <p className="text-[11px] text-purple-800 font-semibold mb-4 leading-relaxed">
                                                جدول الموكلين المسندين بمقر جمعية المحامين بقصر العدل لدعم الأسر المتعففة والعمال الكرام الذين لا يملكون أجور الدفاع الجنائي والنزاع المدني.
                                            </p>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full text-right text-xs">
                                                    <thead>
                                                        <tr className="border-b border-purple-500/10 text-purple-800 font-extrabold">
                                                            <th className="pb-3 pl-4">رقم ملف المعونة والنزاع</th>
                                                            <th className="pb-3 text-center">المستفيد المتعفف</th>
                                                            <th className="pb-3">المحامي الكفيل المسند له</th>
                                                            <th className="pb-3 text-center">المحكمة المختصة</th>
                                                            <th className="pb-3 text-left">حالة المرافعة الحيوية</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-purple-500/5 text-purple-900 font-bold">
                                                        {mockKlaProBono.map(entry => (
                                                            <tr key={entry.id} className="hover:bg-purple-1050/20">
                                                                <td className="py-2.5 pl-4 font-mono">{entry.caseNumber}</td>
                                                                <td className="py-2.5 text-center">{entry.beneficiaryName}</td>
                                                                <td className="py-2.5 text-indigo-700">{entry.designatedLawyer}</td>
                                                                <td className="py-2.5 text-center">{entry.courtName}</td>
                                                                <td className="py-2.5 text-left">
                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${entry.proBonoStatus === 'منجزة بالكامل' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                                                        {entry.proBonoStatus}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* KLA Circulars & Announcements list */}
                                        <div className="mt-6 bg-slate-50 p-6 rounded-3xl border border-slate-250">
                                            <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-3">
                                                <FileText className="w-4 h-4 text-indigo-650" />
                                                التعاميم والتحديثات القانونية الصادرة عن جمعية المحامين الكويتية
                                            </h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {mockKlaAnnouncements.map(ann => (
                                                    <div key={ann.id} className="bg-white p-4 rounded-2xl border border-gray-150 relative">
                                                        <span className="absolute top-4 left-4 text-[9px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black font-mono">{ann.category}</span>
                                                        <h5 className="font-extrabold text-xs text-slate-900 pr-1 max-w-[80%]">{ann.title}</h5>
                                                        <p className="text-[10px] text-slate-500 mt-2 font-semibold leading-relaxed">{ann.summary}</p>
                                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-150 text-[9px] font-bold text-gray-400">
                                                            <span>تاريخ الإشهار: {ann.date}</span>
                                                            <button 
                                                                onClick={() => addToast({ type: 'success', title: 'تم فتح الملف المتصل', message: `جاري تحميل ${ann.filePath}...` })}
                                                                className="text-indigo-650 hover:underline flex items-center gap-1 font-black"
                                                            >
                                                                <Download className="w-3.5 h-3.5" /> تحميل تفريد التعميم (PDF)
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* --- CASE 3: ADALAH INTERNAL CASE RESULTS CONTAINER --- */}
                        {searchTab === 'internal' && (
                            <div className="space-y-4">
                                {filteredInternalResults.length === 0 ? (
                                    <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-200">
                                        <div className="w-16 h-16 bg-red-50/50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <AlertTriangle className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-sm font-black text-slate-800">لا توجد تطابقات لملفات القضايا الداخلية للمكتب</h4>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        {filteredInternalResults.map(item => (
                                            <div
                                                key={item.id}
                                                className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all"
                                            >
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-455">
                                                            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded leading-none">ملف أرشيف عدالة الداخلي</span>
                                                            <span className="text-slate-400 font-mono">رقم القضية الداخلي: {item.internalCaseNumber || 'EX-C--'}</span>
                                                        </div>
                                                        <h4 className="font-black text-base text-slate-900 mt-1.5">{item.title}</h4>
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 pt-1">
                                                            <span>👤 الموكل الأصيل: <strong className="text-indigo-600">{item.clientName}</strong></span>
                                                            <span>•</span>
                                                            <span>رقم السند: {item.caseNumber}</span>
                                                        </div>
                                                    </div>
                                                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full shrink-0">
                                                        {item.status || 'مفتوحة'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 rounded-2xl pr-3 p-4 mt-4 text-xs font-bold leading-relaxed text-slate-700">
                                                    <div>
                                                        <span className="text-slate-400 block text-[9px] uppercase font-black">المحام المشرف من المكتب:</span>
                                                        <strong className="text-slate-800">{item.assignedLawyer || 'مستشار مشرف أول'}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[9px] uppercase font-black">المحكمة المعينة للجلسة:</span>
                                                        <strong className="text-slate-800">{item.courtName || 'مجمع محاكم الكويت'}</strong>
                                                    </div>
                                                    <div>
                                                        <span className="text-slate-400 block text-[9px] uppercase font-black">الدائرة والخصم الفني:</span>
                                                        <strong className="text-slate-800 truncate block">{item.opposingPartyName || '---'}</strong>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-3 mt-4 pt-4 border-t border-gray-100">
                                                    <span className="text-[10px] text-gray-400 font-bold block">تاريخ التسجيل الإداري في النظام: {item.registrationDate || item. filingDate || '2024-01-10'}</span>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => setSelectedInternalCase(item)}
                                                            className="rounded-xl"
                                                            leftIcon={<Info className="w-3.5 h-3.5" />}
                                                        >
                                                            مراجعة الملحقات وتفاصيل القضية
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            onClick={() => addToast({ type: 'success', title: 'تم فتح فولدر القضية', message: 'جاري فتح صفحة المتابعة...' })}
                                                            className="bg-emerald-600 text-white rounded-xl px-4"
                                                            leftIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
                                                        >
                                                            الانتقال لنمط المتابعة
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right columns: Search context metadata, history list, and security live audits log */}
                <div className="lg:col-span-4 space-y-8">
                    
                    {/* Clear visual search guidelines card */}
                    <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-xl translate-x-1/3 -translate-y-1/3" />
                        <BookOpen className="absolute -bottom-8 -left-8 w-48 h-48 opacity-10 rotate-12 text-white" />
                        
                        <h4 className="text-lg font-black mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-amber-400" /> دليل الاستلام والمطابقة
                        </h4>
                        
                        <div className="space-y-4 text-xs font-bold leading-relaxed opacity-95">
                            <div className="flex gap-3">
                                <span className="bg-white/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">1</span>
                                <p>البحث بـ <strong>رقم آلي قضائي</strong> يربط لك ملفات الدعوى بكافة الهيئات المتتالية بالصيغة الفورية بضم الملف لـ (Adalah).</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="bg-white/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">2</span>
                                <p>بوابة جمعية المحامين الكويتية تضمن تحليلاً لكفاءة تراخيص القيود، تواريخ الانتهاء والمستحقات السنوية.</p>
                            </div>
                            <div className="flex gap-3">
                                <span className="bg-white/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0">3</span>
                                <p>لحماية سرية القضايا والنزاعات، تم تسجيل رتل تدقيق أمان كامل (Dynamic Logs) لكافة عمليات الاستخدام بالهويات الممثلة.</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 text-[10px] text-indigo-200 mt-2 font-bold flex items-center gap-1.5 justify-center">
                            <span>آخر فحص ربط: {new Date().toLocaleDateString('ar-EG')}</span>
                            <span>•</span>
                            <span>المنفذ: آمن ومحمي 🔒</span>
                        </div>
                    </div>

                    {/* Dynamic search history container */}
                    <Card title="سجل الاستعلامات السابقة للمدقق" icon={<History className="w-5 h-5 text-gray-400" />}>
                        <div className="space-y-4">
                            {searchHistory.length === 0 ? (
                                <p className="text-xs text-gray-400 font-bold block text-center">السجل فارغ حالياً.</p>
                            ) : (
                                <div className="space-y-3.5 pr-1">
                                    {searchHistory.map((queryText, index) => (
                                        <div key={index} className="flex justify-between items-center group">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all font-black">
                                                    <Search className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-700 group-hover:text-indigo-600 transition-colors cursor-pointer"
                                                       onClick={() => {
                                                            setSearchQuery(queryText);
                                                            setPerformedQuery(queryText);
                                                       }}
                                                    >
                                                        {queryText}
                                                    </p>
                                                    <span className="text-[8px] text-slate-400 block mt-0.5">منذ عينة قصيرة</span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery(queryText);
                                                    setPerformedQuery(queryText);
                                                }}
                                                className="text-[9.5px] text-indigo-650 hover:underline font-extrabold"
                                            >
                                                تكرار
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* LIVE SECURITY AUDIT LOGS - Crucial Security constraint of Legal Systems */}
                    <Card 
                        title="سجلات تدقيق الأمان والامتثال للقضايا" 
                        icon={<FileCode className="w-5 h-5 text-slate-400" />}
                        className="border-slate-100 bg-slate-50/50"
                    >
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            <span className="text-[9px] text-slate-400 block leading-relaxed mb-1 font-bold">
                                * رتوق المعاملات الأمنية المنعقدة تلقائياً لضبط تدفق وقراءة البيانات والمدعومة بنطاق الصلاحيات الشرفي:
                            </span>

                            {auditLogs.map(log => (
                                <div 
                                    key={log.id} 
                                    className={`p-3 rounded-xl border text-[10px] leading-relaxed transition-colors ${log.status === 'AUTHORIZED' ? 'bg-white border-slate-100' : 'bg-red-50/70 border-red-100'}`}
                                >
                                    <div className="flex justify-between items-center mb-1 font-black">
                                        <span className={log.status === 'AUTHORIZED' ? 'text-slate-800' : 'text-red-700'}>
                                            {log.status === 'AUTHORIZED' ? '✓ تم الترخيص' : '❌ حظر الصلاحية'}
                                        </span>
                                        <span className="font-mono text-slate-400 text-[8px]">{log.timestamp}</span>
                                    </div>
                                    <p className="font-extrabold text-slate-700">{log.operator} [{log.role}]</p>
                                    <div className="pt-1 text-[9.5px] font-mono mt-1 border-t border-dashed border-slate-100 text-slate-500">
                                        المستهدف: {log.targetSource} • البحث: "{log.query}"
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* --- SEARCH MODAL 1: MINISTRY OF JUSTICE CASE DETAIL VIEW --- */}
            <Modal
                isOpen={!!selectedMojCase}
                onClose={() => setSelectedMojCase(null)}
                title="بطاقة الاستعلام القضائي لوزارة العدل"
                size="lg"
            >
                {selectedMojCase && (
                    <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
                        
                        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 p-8 opacity-5">
                                <Building2 className="w-32 h-32 text-indigo-700" />
                            </div>
                            <div className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-6 text-xs">
                                <div>
                                    <span className="text-[10px] block text-slate-400 font-black">الرقم الآلي (Automated #)</span>
                                    <strong className="text-lg font-black text-indigo-700 font-mono tracking-tight">{selectedMojCase.automatedNumber}</strong>
                                </div>
                                <div>
                                    <span className="text-[10px] block text-slate-400 font-black">رقم القضية الكلية</span>
                                    <strong className="text-sm font-black text-slate-800 font-mono">{selectedMojCase.caseNumber}</strong>
                                </div>
                                <div>
                                    <span className="text-[10px] block text-slate-400 font-black">الحالة الإجرائية</span>
                                    <span className="inline-block mt-1 font-bold text-slate-900 bg-amber-500/10 text-amber-700 rounded-full px-2.5 py-0.5 leading-none">
                                        الحالة الحالية: {selectedMojCase.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold font-sans">
                            <Card title="بيانات الدائرة والمستشار" icon={<Scale className="w-4 h-4 text-indigo-650" />}>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                        <span className="text-slate-450 dark:text-gray-400 font-bold">المجمع القضائي المعين</span>
                                        <span className="text-slate-900 dark:text-gray-200">{selectedMojCase.courtName}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                        <span className="text-slate-450 dark:text-gray-400 font-bold">الموسم القضائي التأسيسي</span>
                                        <span className="text-slate-900 dark:text-gray-200">{selectedMojCase.year}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                                        <span className="text-slate-450 dark:text-gray-400 font-bold">جهة الخبرة والاستشاري</span>
                                        <span className="text-slate-905 text-indigo-700">{selectedMojCase.courtBranch}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-1.5">
                                        <span className="text-slate-450 dark:text-gray-400 font-bold">المستشار رئيس الدائرة</span>
                                        <span className="text-slate-900 dark:text-gray-200">{selectedMojCase.judge || 'غير مسمى'}</span>
                                    </div>
                                </div>
                            </Card>

                            <Card title="المرافعة والجلسات القادمة" icon={<Calendar className="w-4 h-4 text-indigo-650" />}>
                                {selectedMojCase.nextHearingDate ? (
                                    <div className="space-y-3">
                                        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-900">
                                            <span className="text-[10px] block font-black text-indigo-600">موعد الجلسة المثبّتة القادمة:</span>
                                            <p className="text-sm font-black font-mono mt-1">{selectedMojCase.nextHearingDate}</p>
                                        </div>
                                        <div className="flex justify-between items-center text-xs pt-1.5">
                                            <span className="text-slate-400">قاعة المرافعة:</span>
                                            <span className="text-slate-800">{selectedMojCase.nextHearingLocation}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-5 text-center text-slate-400">
                                        <p>لا توجد أي جلسة قادمة مبرمجة حالياً بجدول الدائرة لهذا الملف.</p>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Expandable parties list */}
                        <div className="bg-slate-50 border rounded-2xl p-4 font-sans font-bold">
                            <h5 className="text-xs font-black text-slate-800 mb-3 flex items-center gap-1.5">
                                <Users className="w-4 h-4 text-slate-500" /> أطراف الخصومة والتمثيل المسجل الكلي
                            </h5>
                            <div className="overflow-x-auto text-xs">
                                <table className="min-w-full text-right text-slate-700">
                                    <thead>
                                        <tr className="border-b uppercase font-black text-[10px] text-slate-400">
                                            <th className="pb-2">اسم الفرد أو المنشأة التجارية</th>
                                            <th className="pb-2 text-center">البطاقة المدنية للطرف</th>
                                            <th className="pb-2 text-center">الخصوم والصفة</th>
                                            <th className="pb-2 text-left">الوكيل المترافع التابع له</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {selectedMojCase.parties.map((p, idx) => (
                                            <tr key={idx} className="hover:bg-gray-100/50">
                                                <td className="py-2.5 font-black text-slate-900">{p.name}</td>
                                                <td className="py-2.5 text-center font-mono">{p.civilId || '---'}</td>
                                                <td className="py-2.5 text-center">{p.role}</td>
                                                <td className="py-2.5 text-left text-indigo-600 font-extrabold">{p.lawyer || 'بدون محامي وكالة'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t border-gray-150">
                            <Button variant="outline" className="rounded-xl" onClick={() => setSelectedMojCase(null)}>إغلاق المعاينة</Button>
                            <Button
                                onClick={() => {
                                    handleImportMojCase(selectedMojCase);
                                    setSelectedMojCase(null);
                                }}
                                className="bg-slate-900 text-white rounded-xl"
                            >
                                {linkedMojIds.includes(selectedMojCase.id) ? 'مرتبط بقاعدة البيانات الداخلية ✓' : 'أرشفة واستيراد القضية لـ عدالة'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- SEARCH MODAL 2: KLA LAWYER MEMBER PROFILE DETAIL VIEW --- */}
            <Modal
                isOpen={!!selectedKlaLawyer}
                onClose={() => setSelectedKlaLawyer(null)}
                title="تفاصيل ترخيص جمعية المحامين الكويتية"
                size="md"
            >
                {selectedKlaLawyer && (
                    <div className="space-y-6 text-xs text-slate-800 font-bold p-1">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-black text-base">
                                {selectedKlaLawyer.lawyerName[3]}
                            </div>
                            <div>
                                <h4 className="text-base font-black text-slate-900">{selectedKlaLawyer.lawyerName}</h4>
                                <p className="text-slate-450 mt-1">{selectedKlaLawyer.grade}</p>
                            </div>
                        </div>

                        <div className="space-y-3 border-y border-gray-100 py-4 font-mono">
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-400 font-sans">رقم القيد المركزي للانتساب:</span>
                                <strong>#{selectedKlaLawyer.enrollId}</strong>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-400 font-sans">البطاقة المدنية الكويتية:</span>
                                <strong>{selectedKlaLawyer.civilId}</strong>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-400 font-sans">تاريخ التوثيق والقبول بالسجلات:</span>
                                <strong className="text-slate-900 font-sans">{selectedKlaLawyer.joinedDate}</strong>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-400 font-sans">مستحقات الاشتراك لتجديد الكادر السنوي:</span>
                                <strong className={selectedKlaLawyer.outstandingDues > 0 ? 'text-red-650' : 'text-emerald-700'}>
                                    {selectedKlaLawyer.outstandingDues > 0 ? formatCurrency(selectedKlaLawyer.outstandingDues) : 'تم سداد الاشتراك السنوي بالكامل ✓'}
                                </strong>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-400 font-sans">عدد قضايا المعونة المتكفل بالترافع بها:</span>
                                <strong className="text-indigo-650 font-sans">{selectedKlaLawyer.proBonoAssigned} قضية مجانية معونة</strong>
                            </div>
                        </div>

                        <div className="bg-yellow-50 text-yellow-800 border p-3 rounded-xl flex items-center gap-2 leading-relaxed">
                            <ShieldCheck className="w-5 h-5 text-yellow-600 shrink-0" />
                            <span>عضوية مرخصة خاضعة لتدوين وبصمة وزارة العدل لتوثيق الحضور والطعن الكلي.</span>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" className="rounded-xl" onClick={() => setSelectedKlaLawyer(null)}>إلغاء</Button>
                            <Button className="bg-indigo-650 text-white rounded-xl" onClick={() => {
                                setIsPrintModalOpen(true);
                                setPrintTargetResult(selectedKlaLawyer);
                                setSelectedKlaLawyer(null);
                            }}>
                                طباعة شهادة انتساب رسمية
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- SEARCH MODAL 3: ADALAH INTERNAL CASE FILE DETAIL VIEW --- */}
            <Modal
                isOpen={!!selectedInternalCase}
                onClose={() => setSelectedInternalCase(null)}
                title="مراجعة بطاقة پرونده عدالة الداخلية"
                size="md"
            >
                {selectedInternalCase && (
                    <div className="space-y-6 text-xs text-slate-800 font-bold p-1 leading-relaxed">
                        
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
                                <Folder className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-base font-black text-slate-900">{selectedInternalCase.title}</h4>
                                <p className="text-slate-400">الملف القضائي رقم: {selectedInternalCase.caseNumber}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border rounded-2xl space-y-3 font-sans">
                            <div className="flex justify-between items-center py-1 border-b border-gray-150">
                                <span className="text-slate-450">الموكل الأصيل للمجموع:</span>
                                <strong className="text-slate-900">{selectedInternalCase.clientName}</strong>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-gray-150">
                                <span className="text-slate-450">الخصم الفني والمدعى عليه:</span>
                                <strong className="text-slate-900">{selectedInternalCase.opposingPartyName}</strong>
                            </div>
                            <div className="flex justify-between items-center py-1 border-b border-gray-150">
                                <span className="text-slate-450">المستشار والمجمع المكلف:</span>
                                <strong className="text-slate-900">{selectedInternalCase.courtName}</strong>
                            </div>
                            <div className="flex justify-between items-center py-1">
                                <span className="text-slate-450">خصائص المطالبة المالية:</span>
                                <strong className="text-emerald-700">{selectedInternalCase.financials?.totalFees ? formatCurrency(selectedInternalCase.financials.totalFees) : 'خاضع لجدول التوريد السنوي'}</strong>
                            </div>
                        </div>

                        {/* Related notes */}
                        <div className="text-slate-600 leading-relaxed bg-gray-50/50 p-3 rounded-xl border">
                            <strong className="text-slate-800 text-[10.5px] block mb-1">الملاحظات القانونية والجوهر الإرشادي:</strong>
                            <p>{selectedInternalCase.description || selectedInternalCase.legalNotes || 'لا توجد ملاحظات سرية إضافية مضافة.'}</p>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" className="rounded-xl" onClick={() => setSelectedInternalCase(null)}>إغلاق النافذة</Button>
                            <Button className="bg-emerald-600 text-white rounded-xl" onClick={() => {
                                setSelectedInternalCase(null);
                                addToast({ type: 'success', title: 'تحميل كامل الأوراق', message: 'جاري جرد الملاحق التأسيسية وتفاصيل الدفاع الكلي.' });
                            }}>
                                فتح شاشة الدفاع المتكاملة
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- LEGAL STATUS SUMMARY EXPLAINER POPUP --- */}
            <Modal
                isOpen={!!statusToExplain}
                onClose={() => setStatusToExplain(null)}
                title={`الوضع القضائي: [ ${statusToExplain?.name} ]`}
                size="md"
            >
                {statusToExplain && (
                    <div className="space-y-4 text-xs font-bold leading-relaxed text-slate-700 font-sans p-1">
                        <div className="p-4 bg-indigo-50 text-indigo-900 rounded-2xl border border-indigo-150 relative">
                            <h5 className="font-exterabold text-sm mb-2 text-indigo-950 flex items-center gap-1.5">
                                <Scale className="w-5 h-5 text-indigo-700" /> تفسير قانون المرافعات الكويتي المعتمد
                            </h5>
                            <p className="leading-relaxed font-bold">{statusToExplain.text}</p>
                        </div>

                        <span className="text-[10px] text-slate-400 block font-normal leading-relaxed text-justify">
                            * هذا التفسير مندرج كحقيبة دليل رقمي ذكي بقوانين الإجراءات المدنية والتجارية الكويتية ويتسع للشروحات وتحديد مواعيد نفاذ الطعن والاستئناف.
                        </span>

                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setStatusToExplain(null)} className="rounded-xl px-5">أدركت ذلك</Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* --- BRANDED PRINT-READY REPORT MODAL --- */}
            <AnimatePresence>
                {isPrintModalOpen && (
                    <Modal
                        isOpen={isPrintModalOpen}
                        onClose={() => {
                            setIsPrintModalOpen(false);
                            setPrintTargetResult(null);
                        }}
                        title="معاينة التقرير ومستند الطباعة المعتمد"
                        size="lg"
                    >
                        <div className="space-y-6">
                            
                            {/* Branded Paper body */}
                            <div id="legal-print-sheet" className="p-10 bg-white text-slate-950 border rounded shadow-md aspect-[1/1.414] relative max-w-full font-serif text-[11px] leading-relaxed">
                                <div className="text-center border-b-2 border-slate-950 pb-4 mb-6">
                                    <h3 className="text-lg font-black text-slate-950 uppercase tracking-tight">مكتب العدالة للمحاماة والاستشارات القانونية والشركات</h3>
                                    <p className="text-[9.5px] font-mono tracking-wider mt-1 text-slate-600 font-bold">Adalah Unified Corporate Legal Suite - Kuwait</p>
                                </div>

                                <div className="flex justify-between items-center text-slate-500 font-sans text-[10px] mb-8 font-mono font-bold">
                                    <span>رمز التدقيق التصديري: AUTH-SEARCH-{Date.now().toString().slice(-4)}</span>
                                    <span>تاريخ الطباعة: 2026-05-26 09:11:06</span>
                                </div>

                                <h4 className="text-center text-base font-black underline mb-6">سجل تدقيق الاستعلام والشهادات الرسمية الموثقة</h4>

                                <p className="text-justify mb-5 font-sans font-bold leading-relaxed text-slate-800">
                                    بناءً على الصلاحيات القانونية الفاعلة الممنوحة لـ {activeRole === 'manager' ? 'المستشار القانوني العام' : activeRole === 'partner' ? 'المحامي الشريك العام' : 'المترافع القانوني المختص'}، تم سحب وفهرسة البيانات التوزيعية المدققة لـ <strong>{translateSource(searchTab)}</strong> من الأرشيف السحابي لعدلة ووزارة العدل كما في السجل التالي:
                                </p>

                                {/* Simple lists printing format */}
                                <div className="border border-slate-950 rounded-xl my-6 p-4 bg-slate-50 text-slate-800 font-sans">
                                    <span className="font-extrabold text-[12px] block mb-2 underline">جدول البيانات المستعلم عنها والمنتجة:</span>
                                    {searchTab === 'moj' ? (
                                        <div className="space-y-3 font-bold text-[10.5px]">
                                            {filteredMojResults.map((r, idx) => (
                                                <div key={idx} className="border-b pb-2 last:border-0">
                                                    <p>🔘 القضية: <strong>{r.caseNumber}</strong></p>
                                                    <p className="text-slate-600 font-mono text-[9px]">الرقم الآلي: {r.automatedNumber} • الدائرة: {r.circuit}</p>
                                                    <p className="text-slate-600">آخر مرافعة: [{r.lastActionDate}] {r.lastAction}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : searchTab === 'kla' ? (
                                        <div className="space-y-3 font-bold text-[10.5px]">
                                            {filteredKlaResults.map((r, idx) => (
                                                <div key={idx} className="border-b pb-2 last:border-0">
                                                    <p>🔘 المحامي المقيد: <strong>{r.lawyerName}</strong> (قيد #{r.enrollId})</p>
                                                    <p className="text-slate-600 text-[9px]">الدرجة: {r.grade} • تاريخ الانتساب: {r.joinedDate}</p>
                                                    <p className="text-slate-600">الحالة: {r.status} • الوكالات المدققة: {r.poaValidated ? 'نعم معتمدة' : 'بانتظار التحقق والمراجعة'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-3 font-bold text-[10.5px]">
                                            {filteredInternalResults.map((r, idx) => (
                                                <div key={idx} className="border-b pb-2 last:border-0">
                                                    <p>🔘 ملف القضية: <strong>{r.title}</strong></p>
                                                    <p className="text-slate-600 text-[9px]">الموكل المرتبط: {r.clientName} • المشرف الفني: {r.assignedLawyer}</p>
                                                    <p className="text-slate-600">المحكمة المعينة: {r.courtName || 'مجمع محاكم العاصمة الكلية'}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <p className="text-[10px] text-justify text-slate-500 font-semibold mb-10 leading-relaxed font-sans">
                                    تنوه السكرتارية القانونية العامة أن هذه المعاملات الاستقصائية تخضع للمراجعة الدورية ولا تجزي عن الشهادات الرسمية الورقية الصادرة والموجهة والممهورة بختم جمعية المحامين أو وزارة التنفيذ الفعلي في حين صدورها.
                                </p>

                                <div className="grid grid-cols-2 gap-8 text-center text-xs font-sans mt-12 font-bold text-slate-900">
                                    <div>
                                        <p className="underline mb-12">توقيع المستشار مصدر التقرير</p>
                                        <p className="mt-2 text-[10px] text-slate-500">مكتب العدالة للمحاماة والاستشارات</p>
                                    </div>
                                    <div>
                                        <p className="underline mb-12">قفل وتوثيق خادم عدالة الفني</p>
                                        <div className="w-12 h-12 bg-slate-100 rounded border border-slate-300 mx-auto flex items-center justify-center text-[10px] text-slate-400 font-mono tracking-tight font-black">QR</div>
                                    </div>
                                </div>

                                <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center text-[8.5px] text-slate-400 font-sans border-t pt-2 font-bold">
                                    <span>عدالة - منظومة متكاملة لحوكمة وإدارة ملفات الاسترجاع الكويتية</span>
                                    <span>شفرة المشغل: AD-REG-2026</span>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 bg-slate-50 p-4 rounded-b-2xl">
                                <Button
                                    variant="outline"
                                    className="rounded-xl"
                                    onClick={() => {
                                        setIsPrintModalOpen(false);
                                        setPrintTargetResult(null);
                                    }}
                                >
                                    إلغاء المعاينة
                                </Button>
                                <Button
                                    onClick={() => window.print()}
                                    className="bg-indigo-650 text-white rounded-xl px-6"
                                    leftIcon={<Printer className="w-4 h-4" />}
                                >
                                    بث أمر الطباعة الورقي / حفظ كـ PDF
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MojSearchPage;
