import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { LegalResource, LegalResourceType, LawBranch, LegalResourceStatus, CountryCode } from '../types';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { 
    FolderIcon, PlusCircleIcon, EyeIcon, PencilIcon, TrashIcon, InformationCircleIcon, PrinterIcon, 
    BookOpenIcon, BuildingLibraryIcon, CloudArrowUpIcon, SparklesIcon, BrainIcon,
    CalendarDaysIcon, ScaleIcon, ListBulletIcon, LinkIcon, ArrowUpRightIcon, ShareIcon, TagIcon,
    ClipboardDocumentListIcon, GavelIcon, SaveIcon, SendIcon, MagnifyingGlassIcon, Squares2X2Icon, HistoryIcon,
    StarIcon
} from '../constants';
import PrintHeader from '../components/ui/PrintHeader';
import { geminiService } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';
import { 
    legalResourceTypeOptions, 
    lawBranchOptions, 
    legalResourceStatusOptions, 
    countryOptions
} from '../constants';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

// --- SYSTEM-WIDE AUDIT TIMELINE SYSTEM ---
interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  user: string;
  category: 'VIEW' | 'CREATE' | 'EDIT' | 'DELETE' | 'PRINT' | 'EXPORT' | 'AI';
}

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  { id: 'log-1', timestamp: '2026-05-22 09:30:15', action: 'استعراض دستور دولة الكويت', details: 'طلب عرض النسخة الدستورية الرسمية', user: 'صبري شطا', category: 'VIEW' },
  { id: 'log-2', timestamp: '2026-05-22 10:14:22', action: 'تعديل مأذونية نهاية الخدمة', details: 'تعديل المادة 51 من قانون العمل الكويتي', user: 'أحمد المحامي', category: 'EDIT' },
  { id: 'log-3', timestamp: '2026-05-22 11:21:40', action: 'تحليل الذكاء الاصطناعي', details: 'توليد رأي المستشار الذكي حول الأثر القانوني لقانون الاستثمار المصري الجديد', user: 'سارة خالد', category: 'AI' },
  { id: 'log-4', timestamp: '2026-05-22 11:45:00', action: 'طباعة رسمية', details: 'طباعة القانون المدني الكويتي مع تذييل الاعتماد والمكتب', user: 'صبري شطا', category: 'PRINT' }
];

// --- EXTENDED DEEP REGIONAL & ARAB RESOURCE MOCK DATABASE ---
const mockLegalResourcesData: LegalResource[] = [
  // --- KUWAIT LAWS ---
  {
    id: 'kw-constitution',
    title: 'دستور دولة الكويت الصادر لعام 1962',
    type: LegalResourceType.LAW,
    documentNumber: 'دستور 1962',
    country: 'KW' as CountryCode,
    publishDate: '1962-11-11',
    lawBranch: LawBranch.CONSTITUTIONAL,
    issuingAuthority: 'المؤسس الشيخ عبد الله السالم الصباح والمجلس التأسيسي',
    resourceStatus: LegalResourceStatus.ACTIVE,
    keywords: ['دستور', 'مبادئ الحكم', 'الحريات العامة', 'الكويت', 'مجلس الأمة'],
    description: 'الوثيقة الأساسية العليا التي أرست دعائم الديمقراطية البرلمانية وحددت الصلاحيات الدستورية والتفويض التشريعي في دولة الكويت.',
    summary: 'يتكون هذا الدستور من 183 مادة موزعة على خمسة أبواب، تؤكد أن نظام الحكم وراثي نيابي قائم على مبدأ فصل السلطات مع تعاونها المتمثل برعاية سمو الأمير ومجلس الأمة الموقر والذات الأميرية المصونة.',
    officialGazetteDetails: 'الكويت اليوم، ملحق العدد الخاص الصادر في 12 نوفمبر 1962',
  },
  {
    id: 'kw-law-civil-1980',
    title: 'القانون المدني الكويتي (المرسوم بالقانون رقم 67 لسنة 1980)',
    type: LegalResourceType.LAW,
    documentNumber: '67 لسنة 1980',
    country: 'KW' as CountryCode,
    publishDate: '1980-08-07',
    effectiveDate: '1981-02-25',
    lawBranch: LawBranch.CIVIL,
    issuingAuthority: 'سمو أمير دولة الكويت الراحل الشيخ جابر الأحمد الصباح',
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['مدني', 'عقود', 'الالتزامات', 'عقد البيع', 'عينية', 'الكويت'],
    description: 'مرجع المعاملات الأساسي المنظم للحقوق الشخصية والعينية، وحرية التعاقد، والاضرار، والبيوع، والشروط، والرهون في البيئة الكويتية العامة والمهنية.',
    summary: 'قانون ضخم مقتبس من الفقه الإسلامي المعتدل والفقه المصري الأصيل، ينظم أركان العقد وعناصر المسؤولية التقصيرية والعقدية وحساب التعويض والأثر المترتب.',
    officialGazetteDetails: 'الكويت اليوم، العدد 1316 الصادر بتاريخ 15 أغسطس 1980',
  },
  {
    id: 'kw-labor-2010',
    title: 'قانون العمل في القطاع الأهلي الكويتي (قانون رقم 6 لسنة 2010)',
    type: LegalResourceType.LAW,
    documentNumber: '6 لسنة 2010',
    country: 'KW' as CountryCode,
    publishDate: '2010-02-20',
    lawBranch: LawBranch.LABOR,
    issuingAuthority: 'مجلس الأمة الموقر بوزارة الشؤون الاجتماعية',
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['العمل', 'نهاية الخدمة', 'القطاع الأهلي', 'العمالة الوافدة', 'إجازات سنوية'],
    description: 'التشريع الحاكم للعلاقة التعاقدية العمالية بالقطاع الأهلي الكويتي، محدداً الحد الأدنى من الأجور ومكافحة التمييز ومستحقات العمال الشاملة.',
    summary: 'يتضمن هذا التشريع أحكاماً صارمة تنظم فترات العمل اليومية، والحد الأقصى للإجازات، وطريقة التقييم والحساب الدقيق لمستحقات مكافأة نهاية الخدمة في المواد 51 - 53.',
    officialGazetteDetails: 'جريدة الكويت اليوم الرسمية، العدد 965',
  },
  {
    id: 'kw-penal-code',
    title: 'قانون الجزاء الكويتي (القانون رقم 16 لسنة 1960)',
    type: LegalResourceType.LAW,
    documentNumber: '16 لسنة 1960',
    country: 'KW' as CountryCode,
    publishDate: '1960-06-01',
    lawBranch: LawBranch.CRIMINAL,
    issuingAuthority: 'أمير الكويت ووزارة العدل الكلية',
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['جزاء', 'عقوبات', 'جنحة', 'جناية', 'جرائم مالية'],
    description: 'القانون الموحد لتنظيم كافة أركان التجريم والعقاب داخل الأراضي الكويتية، مفصلاً المبادئ العقابية وقواعد التطهير الجنائي.',
    summary: 'يصنف قانون الجزاء الجرائم إلى جنايات وجنح ويحدد سلم العقوبات البدنية والمالية والقرارات التكميلية والمصادرة العاجلة والأثر العام.',
  },
  {
    id: 'kw-procedures',
    title: 'قانون المرافعات المدنية والتجارية (المرسوم بقانون رقم 38 لسنة 1980)',
    type: LegalResourceType.LAW,
    documentNumber: '38 لسنة 1980',
    country: 'KW' as CountryCode,
    publishDate: '1980-06-04',
    lawBranch: LawBranch.CIVIL,
    issuingAuthority: 'وزارة العدل الكويتية',
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['مرافعات', 'إعلانات', 'محكمة تجارية', 'اختصاص قضاء', 'تقديم صحف'],
    description: 'قواعد السير الإجرائي للدعاوى المدنية والتجارية، محدداً مواعيد الطعون، وإجراءات الإعلان بالصحف العدلية، وطرق الحجز والوفاء.',
    summary: 'التشريع الإجرائي الأول الذي ينظم هيكل المحاكم والدوائر ومواعيد الاستئناف والتمييز وضوابط الحضور والغياب والطلب المتقابل.',
  },
  {
    id: 'kw-real-estate-reg',
    title: 'قانون التسجيل العقاري الكويتي (قانون رقم 5 لسنة 1959)',
    type: LegalResourceType.LAW,
    documentNumber: '5 لسنة 1959',
    country: 'KW' as CountryCode,
    publishDate: '1959-01-01',
    lawBranch: LawBranch.REAL_ESTATE,
    issuingAuthority: 'إدارة التسجيل والتصديق بوزارة العدل',
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['تسجيل عقار', 'حقوق عينية', 'توثيق عدلي', 'عقارات الكويت'],
    description: 'المرسوم التاريخي المنظم لنقل الملكيات وفسخ الرهون وسائر التصرفات العقارية وإشهارها لضمان استقرار المعاملات.',
  },

  // --- EGYPT LAWS ---
  {
    id: 'eg-civil-code',
    title: 'القانون المدني المصري (القانون رقم 131 لسنة 1948)',
    type: LegalResourceType.LAW,
    documentNumber: '131 لسنة 1948',
    country: 'EG' as CountryCode,
    publishDate: '1948-07-16',
    lawBranch: LawBranch.CIVIL,
    issuingAuthority: 'الأستاذ الدكتور عبد الرزاق السنهوري باشا بقرار جلالة ملك مصر',
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['القانون المصري', 'سنهوري الصياغة', 'مرجع مدني', 'التزامات ومقاصة'],
    description: 'أم القوانين العربية والمصنف الفقهي المتكامل الذي يعد المرتكز والدعامة الأولى لكل تشريعات الخليج وجمهورية مصر العربية.',
    summary: 'صياغة العبقري عبد الرزاق أحمد السنهوري باشا، يختص بالتفريق الصارم بين قواعد المسؤولية وتقييم الوفاء وتحديد الحقوق الدائنية وحقوق الرهن العيني والامتياز المالي.',
    officialGazetteDetails: 'الوقائع المصرية، العدد التاريخي الصادر في يوليو 1948',
  },
  {
    id: 'eg-investment-law',
    title: 'قانون الاستثمار المصري الجديد (القانون رقم 72 لسنة 2017)',
    type: LegalResourceType.LAW,
    documentNumber: '72 لسنة 2017',
    country: 'EG' as CountryCode,
    publishDate: '2017-05-31',
    lawBranch: LawBranch.COMMERCIAL,
    issuingAuthority: 'رئاسة جمهورية مصر العربية ومجلس النواب',
    resourceStatus: LegalResourceStatus.ACTIVE_AMENDED,
    keywords: ['الاستثمار', 'المجلس الأعلى للاستثمار', 'جمارك وحوافز', 'رؤوس الأموال الاجنبية'],
    description: 'قانون تشجيع وحماية الاستثمارات في مصر، واضعاً الضمانات الكاملة للمستثمر العربي والأجنبي وخفض ميزات التخصيص والمناوبة الحرة.',
  },

  // --- OTHER ARAB & GULF COUNTRIES ---
  {
    id: 'ksa-civil-transactions',
    title: 'نظام المعاملات المدنية السعودي لعام 2023',
    type: LegalResourceType.LAW,
    documentNumber: 'م/191',
    country: 'SA' as CountryCode,
    publishDate: '2023-06-19',
    lawBranch: LawBranch.CIVIL,
    issuingAuthority: 'مجلس الوزراء السعودي بالمرسوم الملكي الكريم',
    resourceStatus: LegalResourceStatus.ACTIVE,
    keywords: ['نظام مدني', 'شريعة مجسدة', 'المعاملات السعودية', 'رؤية 2030'],
    description: 'التشريع المدني السعودي التاريخي المكتوب الذي وحد الأنظمة التعاقدية والتعويضية بالمملكة العربية السعودية وفق المعايير والقواعد الفقهية الأصيلة.',
  },

  // --- BOOKS & PUBLICATIONS ---
  {
    id: 'book-sanhuri-waseet',
    title: 'الوسيط في شرح القانون المدني المصري والعربي - أجزاء السنهوري الـ 10',
    type: LegalResourceType.LEGAL_ARTICLE,
    category: 'كتب ومراجع فقهية',
    country: 'EG' as CountryCode,
    publishDate: '1952-01-01',
    lawBranch: LawBranch.CIVIL,
    issuingAuthority: 'الأستاذ الدكتور عبد الرزاق أحمد السنهوري',
    resourceStatus: LegalResourceStatus.HISTORICAL_REFERENCE,
    keywords: ['كتاب الوسيط', 'عبد الرزاق السنهوري', 'المرجع الفقهي الأكبر', 'أمهات الكتب القانونية'],
    description: 'الموسوعة التاريخية الكبرى المكونة من عشرة أجزاء كاملة، تعد المرجع الأرسخ والواجب الاستشهاد به في لوائح التمييز والنقض على مستوى الوطن العربي.',
  },
  {
    id: 'ref-cassation-principles',
    title: 'مجموعات المبادئ القانونية والتفسيرات الصادرة عن محكمة التمييز الكويتية',
    type: LegalResourceType.JUDICIAL_PRECEDENT,
    category: 'مجموعات أحكام قضائية ومقاصد تشريعية',
    country: 'KW' as CountryCode,
    publishDate: '2023-12-31',
    lawBranch: LawBranch.CIVIL,
    issuingAuthority: 'المكتب الفني للمجلس الأعلى للقضاء بدولة الكويت',
    resourceStatus: LegalResourceStatus.ACTIVE,
    keywords: ['تمييز القضاء', 'سوابق قضائية', 'المكتب الفني للكويت', 'أحكام دستورية'],
    description: 'أهم المبادئ المستقرة والمستخرجة حرفياً من أحكام الدائرة المدنية والتجارية والأحوال الشخصية لأعلى المحاكم درجة بالكويت.',
  }
];

// --- MAIN ENHANCED COMPONENT ---
const LegalResourcesPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const { addToast } = useToast();

  // Load custom resources and audit logs from localStorage or default
  const [resources, setResources] = useState<LegalResource[]>(() => {
    const saved = localStorage.getItem('qanooni_library_resources');
    return saved ? JSON.parse(saved) : mockLegalResourcesData;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('qanooni_library_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [pinnedIds, setPinnedIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('qanooni_library_pinned_ids');
    return saved ? JSON.parse(saved) : ['kw-constitution', 'kw-law-civil-1980'];
  });

  useEffect(() => {
    localStorage.setItem('qanooni_library_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('qanooni_library_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('qanooni_library_pinned_ids', JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  // Filters & State Variables
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterCountry, setFilterCountry] = useState<CountryCode | ''>('');
  const [filterLawBranch, setFilterLawBranch] = useState<LawBranch | ''>('');
  const [filterScope, setFilterScope] = useState<'LOCAL' | 'REGIONAL' | 'INTERNATIONAL' | ''>('');
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'archive'>('grid');
  const [groupBy, setGroupBy] = useState<'branch' | 'country' | 'none'>('none');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'bookmarks' | 'activities' | 'ai'>('all');

  // Modal Control
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Partial<LegalResource> | null>(null);
  const [viewingResource, setViewingResource] = useState<LegalResource | null>(null);

  // AI Assistant State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Print Configuration Modal
  const [printConfig, setPrintConfig] = useState({
    title: '',
    showStamp: true,
    stampType: 'shata' as 'shata' | 'outbound' | 'approved' | 'confidential',
    addWatermark: true,
    referenceNumber: `REF-KW-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    officialHeaderAr: 'جمهورية مصر العربية / دولة الكويت / مكتب صبري شطا للمحاماة',
    officialHeaderEn: 'State of Kuwait / Egypt / Sabri Shata Law Firm',
  });
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [resourceToPrint, setResourceToPrint] = useState<LegalResource | null>(null);

  // Dashboard Aggregated Analytics
  const stats = useMemo(() => {
    const counts = {
      total: resources.length,
      laws: resources.filter(r => r.type === LegalResourceType.LAW).length,
      books: resources.filter(r => r.type === LegalResourceType.LEGAL_ARTICLE).length,
      decisions: resources.filter(r => r.type === LegalResourceType.MINISTERIAL_DECISION).length,
      precedents: resources.filter(r => r.type === LegalResourceType.JUDICIAL_PRECEDENT).length,
      kuwait: resources.filter(r => r.country === 'KW').length,
      egypt: resources.filter(r => r.country === 'EG').length,
      others: resources.filter(r => r.country && r.country !== 'KW' && r.country !== 'EG').length,
    };
    return counts;
  }, [resources]);

  // Graph Data
  const branchChartData = useMemo(() => {
    const branches = [
      { name: isRtl ? 'مدني' : 'Civil', count: resources.filter(r => r.lawBranch === LawBranch.CIVIL).length, fill: '#3b82f6' },
      { name: isRtl ? 'جزائي' : 'Criminal', count: resources.filter(r => r.lawBranch === LawBranch.CRIMINAL).length, fill: '#ef4444' },
      { name: isRtl ? 'عمالي' : 'Labor', count: resources.filter(r => r.lawBranch === LawBranch.LABOR).length, fill: '#10b981' },
      { name: isRtl ? 'شركة' : 'Companies', count: resources.filter(r => r.lawBranch === LawBranch.COMPANIES).length, fill: '#8b5cf6' },
      { name: isRtl ? 'دستور' : 'Constitutional', count: resources.filter(r => r.lawBranch === LawBranch.CONSTITUTIONAL).length, fill: '#f59e0b' },
      { name: isRtl ? 'آخر' : 'Other', count: resources.filter(r => r.lawBranch === LawBranch.OTHER || !r.lawBranch).length, fill: '#6b7280' },
    ];
    return branches;
  }, [resources, isRtl]);

  const countryPieData = useMemo(() => {
    return [
      { name: isRtl ? 'دولة الكويت' : 'Kuwait', value: stats.kuwait, fill: '#059669' },
      { name: isRtl ? 'جمهورية مصر العربية' : 'Egypt', value: stats.egypt, fill: '#dc2626' },
      { name: isRtl ? 'المملكة العربية السعودية' : 'Saudi Arabia', value: stats.others, fill: '#3b82f6' },
    ];
  }, [stats, isRtl]);

  // Write and trigger audit log
  const logAuditActivity = useCallback((action: string, details: string, category: AuditLog['category']) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action,
      details,
      user: 'صبري شطا (المستشار)',
      category
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 49)]); // keep last 50
  }, []);

  // Filter & sort logic
  const filteredResources = useMemo(() => {
    return resources.filter(res => {
      // Keep only non-temporary forms in library resources
      if (res.type === LegalResourceType.TEMPLATE) return false;

      // Bookmarks tab
      if (activeTab === 'bookmarks' && !pinnedIds.includes(res.id)) return false;

      const searchMatch = (
        res.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (res.description && res.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (res.issuingAuthority && res.issuingAuthority.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (res.keywords && res.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase())))
      );

      let typeMatch = true;
      if (filterType === 'BOOK') {
          typeMatch = res.type === LegalResourceType.LEGAL_ARTICLE || (res.keywords && res.keywords.includes('كتاب'));
      } else if (filterType === 'LAW') {
          typeMatch = res.type === LegalResourceType.LAW || res.type === LegalResourceType.DECREE;
      } else if (filterType === 'DECISION') {
          typeMatch = res.type === LegalResourceType.MINISTERIAL_DECISION || res.type === LegalResourceType.EXECUTIVE_REGULATION;
      } else if (filterType) {
          typeMatch = res.type === filterType;
      }

      const countryMatch = filterCountry ? res.country === filterCountry : true;
      const lawBranchMatch = filterLawBranch ? res.lawBranch === filterLawBranch : true;

      let scopeMatch = true;
      if (filterScope === 'LOCAL') {
        scopeMatch = res.country === 'KW';
      } else if (filterScope === 'REGIONAL') {
        scopeMatch = ['SA', 'AE', 'EG', 'JO'].includes(res.country || '');
      } else if (filterScope === 'INTERNATIONAL') {
        scopeMatch = res.lawBranch === LawBranch.INTERNATIONAL || (res.keywords && res.keywords.includes('دولي'));
      }

      return searchMatch && typeMatch && countryMatch && lawBranchMatch && scopeMatch;
    }).sort((a, b) => {
        // Pinned ones first, then newest publish date
        const aPinned = pinnedIds.includes(a.id);
        const bPinned = pinnedIds.includes(b.id);
        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;
        return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
    });
  }, [resources, searchTerm, filterType, filterCountry, filterLawBranch, filterScope, pinnedIds, activeTab]);

  // Grouped resources
  const groupedResources = useMemo(() => {
    if (groupBy === 'none') return null;
    const groups: Record<string, LegalResource[]> = {};
    filteredResources.forEach(res => {
      let key = isRtl ? 'أخرى' : 'Other';
      if (groupBy === 'branch') {
        key = res.lawBranch || (isRtl ? 'متفرقة' : 'Miscellaneous');
      } else if (groupBy === 'country') {
        key = res.country ? (res.country === 'KW' ? (isRtl ? 'الكويت' : 'Kuwait') : res.country === 'EG' ? (isRtl ? 'مصر' : 'Egypt') : (isRtl ? 'الخليج والدول العربية' : 'Gulf & Arab Nations')) : (isRtl ? 'أخرى' : 'Other');
      }
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(res);
    });
    return groups;
  }, [filteredResources, groupBy, isRtl]);

  const handleAddResource = () => {
    setEditingResource(null);
    setIsFormModalOpen(true);
  };

  const handleEditResource = (resource: LegalResource) => {
    setEditingResource(resource);
    setIsFormModalOpen(true);
  };

  const handleViewResource = (resource: LegalResource) => {
    setViewingResource(resource);
    logAuditActivity(
      isRtl ? `عرض المرجع: ${resource.title}` : `Viewed resource: ${resource.title}`,
      `عرض تفاصيل ومحتوى وبطاقة القانون المعني بـ ${resource.keywords.join('، ')}`,
      'VIEW'
    );
  };

  const handleDeleteResource = useCallback((resourceId: string) => {
    if (window.confirm(isRtl ? 'هل أنت متأكد أنك تريد حذف هذا المرجع القانوني نهائياً من المكتبة؟' : 'Are you sure you want to delete this legal resource from the library?')) {
      const target = resources.find(r => r.id === resourceId);
      setResources(prev => prev.filter(r => r.id !== resourceId));
      addToast({
        type: 'success',
        title: isRtl ? 'تم الحذف' : 'Deleted successfully',
        message: isRtl ? 'تم إزالة المرجع القانوني بنجاح.' : 'Resource deleted successfully.'
      });
      if (target) {
        logAuditActivity(
          isRtl ? `حذف المرجع: ${target.title}` : `Deleted resource: ${target.title}`,
          `إزالة مستند رقم ${target.documentNumber || 'بلا رقم'} من الهيكل المكتبي`,
          'DELETE'
        );
      }
    }
  }, [resources, isRtl, addToast, logAuditActivity]);

  const togglePin = (id: string, name: string) => {
    const isPinning = !pinnedIds.includes(id);
    setPinnedIds(prev => isPinning ? [...prev, id] : prev.filter(p => p !== id));
    addToast({
      type: 'info',
      title: isPinning ? (isRtl ? 'تمت الإضافة للمفضلة' : 'Bookmarked') : (isRtl ? 'نزعت من المفضلة' : 'Removed Bookmark'),
      message: isPinning ? (isRtl ? 'تم تمييز المستند للوصول السريع.' : 'Added to favorites.') : (isRtl ? 'تم تصفية المستند من المحفظة السريعة.' : 'Removed from favorites.')
    });
    logAuditActivity(
      isPinning ? `إضافة المفضلة: ${name}` : `إزالة المفضلة: ${name}`,
      isPinning ? 'تثبيت في مقدمة البحث والقراءات السريعة' : 'إزالة علامة المحفظة الدائمة',
      'EDIT'
    );
  };

  const handleFormSubmit = (data: LegalResource) => {
    if (editingResource?.id) {
      setResources(prev => prev.map(r => (r.id === editingResource.id ? { ...data, id: r.id } : r)));
      addToast({
        type: 'success',
        title: isRtl ? 'تم تحديث المرجع' : 'Resource Updated',
        message: isRtl ? 'تم تعديل البيانات وإعادة جدولة بنود القانون.' : 'The operational fields were modified successfully.'
      });
      logAuditActivity(
        isRtl ? `تعديل المرجع: ${data.title}` : `Modified resource: ${data.title}`,
        `تحديث رقم القرار ${data.documentNumber || '-'} وتفاصيل النشر`,
        'EDIT'
      );
    } else {
      const newId = `res-${Date.now()}`;
      setResources(prev => [{ ...data, id: newId }, ...prev]);
      addToast({
        type: 'success',
        title: isRtl ? 'أضيف للمكتبة' : 'Added to Library',
        message: isRtl ? 'تم إيداع المستند وتصنيفه تشريعياً لجميع المستخدمين.' : 'Document cataloged and integrated into Qanooni repository.'
      });
      logAuditActivity(
        isRtl ? `إضافة مرجع جديد: ${data.title}` : `Created resource: ${data.title}`,
        `إيداع نسخة إلكترونية كاملة بفرع ${data.lawBranch || '-'}`,
        'CREATE'
      );
    }
    setIsFormModalOpen(false);
    setEditingResource(null);
  };

  // Ask AI Panel Logic
  const handleAskAi = async () => {
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    setAiResponse(null);
    try {
        const libraryContext = resources.slice(0, 5).map(r => `- ${r.title}: ${r.description} (${r.keywords.join(', ')})`).join('\n');
        const prompt = `أنت البروفيسور والمستشار القانوني المخضرم رئيس قسم البحوث بمكتب "صبري شطا للمحاماة والاستشارات القانونية والمقاصد الشرعية".
        بناءً على مصادر وقوانين مكتبتنا المودعة (خاصةً:\n${libraryContext})\n
        أجب على هذا الاستفسار بعمق قانوني وبلاغة لغوية ممتازة، مدعماً إجابتك بالصيغ والفقرات المباشرة من مواد القوانين الكويتية أو المصرية أو الخليجية حسب الصلة: "${aiQuestion}"`;
        
        const response = await geminiService.getChatbotResponse(prompt);
        setAiResponse(response);
        logAuditActivity(
          isRtl ? 'استشارة المساعد الذكي' : 'AI Legal Advice Consultation',
          `البحث القانوني الفوري: ${aiQuestion.substring(0, 40)}...`,
          'AI'
        );
    } catch (err) {
        setAiResponse(isRtl ? "عذراً، فشل المساعد القانوني في الوصول إلى شبكة المعرفة الذكية." : "Could not reach AI advisor.");
    } finally {
        setIsAiLoading(false);
    }
  };

  // Open professional Print Manager
  const triggerOfficialPrint = (resource: LegalResource) => {
    setResourceToPrint(resource);
    // Auto-fill configuration
    setPrintConfig(prev => ({
      ...prev,
      title: resource.title,
    }));
    setIsPrintModalOpen(true);
  };

  const handlePrintSubmit = () => {
    setIsPrintModalOpen(false);
    logAuditActivity(
      isRtl ? `طباعة معتمدة ورسمية` : `Official printed copy`,
      `طباعة المرجع "${printConfig.title}" برقم مرجعي ${printConfig.referenceNumber}`,
      'PRINT'
    );
    // Trigger window print after a short delay for CSS re-rendering
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try { 
      return new Date(dateString).toLocaleDateString(isRtl ? 'ar-EG' : 'en-US', {
        day: '2-digit', month: 'long', year: 'numeric'
      }); 
    } catch(e) { return dateString; }
  };

  return (
    <div id="qanooni-library-system" className="space-y-6 text-right" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* PROFESSIONAL HIGH-END OFFICIAL HEADER */}
      <PrintHeader 
        title={t('legal_library_report', { defaultValue: 'تقرير الفهرس والجرد العام للمكتبة الرقمية' })} 
        subtitle={`رمز التحقق: ${printConfig.referenceNumber} | مكتب صبري شطا للمحاماة`} 
      />

      {/* Hero Welcome Display & Contextual Switchers */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
        <div className="flex items-center gap-4 mb-4 md:mb-0">
            <div className="p-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                <BuildingLibraryIcon className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div>
                <h1 className="text-3xl font-black text-gray-900 leading-tight">
                  {isRtl ? 'المكتبة الرقمية والمراجع والتشريعات' : 'Legal Knowledge & Reference Library'}
                </h1>
                <p className="text-sm text-gray-500 mt-1 font-medium leading-relaxed">
                  {isRtl 
                    ? 'منصة ذكية للفهرسة التشريعية والأحكام والمنشورات الرسمية العربية، والمطابقة الفقهية المتكاملة.'
                    : 'Systematized repository of Middle Eastern civil, commercial, labor laws and cassation court precedents.'}
                </p>
            </div>
        </div>
        <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('activities')} 
              className={`text-xs gap-1.5 ${activeTab === 'activities' ? 'bg-primary/5 text-primary border-primary' : 'text-gray-500'}`}
            >
                <HistoryIcon className="w-4 h-4" />
                {isRtl ? 'سجل الأنشطة والمتابعة' : 'Audit Logs'}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setActiveTab('ai')} 
              className={`text-xs gap-1.5 ${activeTab === 'ai' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' : 'text-gray-500'}`}
            >
                <SparklesIcon className="w-4 h-4 text-amber-500" />
                {isRtl ? 'البحث المعرفي والبحوث الذكية' : 'Knowledge AI'}
            </Button>
            <Button onClick={handleAddResource} className="text-xs bg-primary hover:bg-primary-dark">
                <PlusCircleIcon className="w-4 h-4 me-1" />
                {isRtl ? 'إيداع مستند وتصنيف تشريعي' : 'Deposit Law/Reference'}
            </Button>
        </div>
      </div>

      {/* GRID WIDGETS WITH REAL-TIME LOCAL STORAGE INTERACTION */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
              { label: isRtl ? 'إجمالي المراجع والتشريعات' : 'Total Statutes & Books', count: stats.total, icon: ScaleIcon, color: 'text-primary', bg: 'bg-primary/5 border-primary/10' },
              { label: isRtl ? 'القوانين الرسمية والمراسيم' : 'Active Codified Laws', count: stats.laws, icon: ClipboardDocumentListIcon, color: 'text-emerald-600', bg: 'bg-emerald-50/50 border-emerald-100' },
              { label: isRtl ? 'المبادئ والسوابق القضائية' : 'Court Precedents & Decs', count: stats.precedents, icon: GavelIcon, color: 'text-purple-600', bg: 'bg-purple-50/50 border-purple-100' },
              { label: isRtl ? 'الكتب والتعليقات والفقرات' : 'Treatis & Books (PDF)', count: stats.books, icon: BookOpenIcon, color: 'text-amber-600', bg: 'bg-amber-50/50 border-amber-100' },
          ].map((stat, i) => (
              <motion.div 
                key={i} 
                whileHover={{ y: -3 }}
                className={`p-5 rounded-2xl border ${stat.bg} shadow-sm flex items-center justify-between transition-all`}
              >
                  <div>
                      <p className="text-xs font-bold text-gray-500 mb-2">{stat.label}</p>
                      <p className="text-3xl font-black text-gray-900">{stat.count}</p>
                  </div>
                  <div className={`p-2.5 rounded-xl bg-white shadow-sm border border-gray-100/60`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
              </motion.div>
          ))}
      </div>

      {/* CORE STATS ANALYTICS CONTROL PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recharts Area - Jurisdictions and branches chart */}
          <Card className="lg:col-span-2 shadow-sm border border-gray-100">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                       <ScaleIcon className="w-5 h-5 text-primary" />
                       {isRtl ? 'توزيع المادة التشريعية حسب الأقسام وفروع القانون' : 'Statutes Distribution by Legal Branch'}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 font-mono tracking-wider uppercase">Recharts Engine</span>
              </div>
              <div className="p-6 h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={branchChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                          <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                          <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', borderColor: '#f1f5f9', fontSize: '11px', textAlign: 'right' }} />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={45}>
                              {branchChartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                          </Bar>
                      </BarChart>
                  </ResponsiveContainer>
              </div>
          </Card>

          {/* Pie Chart of Jurisdictions */}
          <Card className="shadow-sm border border-gray-100 flex flex-col justify-between">
              <div className="p-5 border-b border-gray-100">
                  <h3 className="text-base font-bold text-gray-900">
                       {isRtl ? 'تغطية الاختصاصات القضائية' : 'Jurisdictions Coverage'}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">الملكية الجغرافية للقوانين المتاحة</p>
              </div>
              <div className="p-4 flex flex-row items-center justify-center gap-4 flex-grow h-[155px]">
                  <div className="w-[120px] h-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                              <Pie
                                  data={countryPieData}
                                  dataKey="value"
                                  nameKey="name"
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={30}
                                  outerRadius={50}
                                  paddingAngle={3}
                              >
                                  {countryPieData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                  ))}
                              </Pie>
                          </PieChart>
                      </ResponsiveContainer>
                  </div>
                  <div className="flex-1 space-y-2">
                      {countryPieData.map((row, i) => (
                          <div key={i} className="flex items-center text-xs justify-between">
                              <span className="flex items-center gap-1 text-gray-500">
                                  <span className="w-2 md:w-3 h-2 md:h-3 rounded-full" style={{ backgroundColor: row.fill }}></span>
                                  {row.name}
                              </span>
                              <span className="font-bold text-gray-800">{row.value}</span>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="p-4 bg-gray-50 border-t text-[11px] text-gray-500 flex items-center gap-2 justify-center">
                  <span className="font-bold text-emerald-600">🇰🇼 الكويت: {stats.kuwait}</span>
                  <span className="text-gray-300">|</span>
                  <span className="font-bold text-red-600">🇪🇬 مصر: {stats.egypt}</span>
                  <span className="text-gray-300">|</span>
                  <span className="font-bold text-blue-600">🇸🇦 الخليج: {stats.others}</span>
              </div>
          </Card>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-gray-200">
          {[
              { id: 'all', label: isRtl ? 'فهرس التشريعات والمراجع الكبرى' : 'Statute Catalog', icon: ListBulletIcon },
              { id: 'bookmarks', label: isRtl ? 'محفظتي المفضلة' : 'My Bookmarks', icon: StarIcon },
              { id: 'activities', label: isRtl ? 'تاريخ التحديثات والتدقيق الجنائي' : 'Library Audit logs', icon: HistoryIcon },
              { id: 'ai', label: isRtl ? 'المستشار القانوني والبحوث المعمقة (AI)' : 'Smart AI Research', icon: SparklesIcon },
          ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-6 text-sm font-bold transition-all relative flex items-center gap-2 ${activeTab === tab.id ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  <tab.icon className="w-4.5 h-4.5" />
                  {tab.label}
                  {activeTab === tab.id && (
                      <motion.div layoutId="activeTabIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                  )}
              </button>
          ))}
      </div>

      {/* RENDER VIEW AREA */}
      <AnimatePresence mode="wait">
        {activeTab === 'ai' ? (
            <motion.div 
                key="ai-research-tab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-4"
            >
                <Card className="bg-gradient-to-br from-primary/5 via-white to-amber-500/5 border-primary/20">
                    <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-gradient-to-r from-primary to-purple-600 rounded-xl shadow-lg text-white">
                                <SparklesIcon className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900">{isRtl ? 'محرك البحوث الذكي وبناء الاستشارة الفورية' : 'AI Jurisprudence & Research Engine'}</h3>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                     قم بطرح أسئلة قانونية عميقة، وسيمسح النظام مواد الدستور، والقوانين المدنية، والتجارية، وسوابق التمييز الكويتية والمصرية لصياغة مستند الرد المتكامل.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <textarea 
                                placeholder={isRtl ? "مثال: ما هو الأثر والجزاء القانوني للاستقالة قبل انقضاء السنة الأولى في القطاع الأهلي الكويتي في المادة 51 من القانون 6/2010؟ وهل تختلف الأحكام المدنية عنها في مصر؟" : "Enter clinical legal consultation outline..."}
                                value={aiQuestion}
                                onChange={(e) => setAiQuestion(e.target.value)}
                                className="w-full p-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-4 focus:ring-primary/10 text-sm min-h-[100px] shadow-sm resize-none text-right font-serif"
                            />
                            
                            {/* Prompt helper suggestions tags to stimulate quick usability */}
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-xs font-bold text-gray-400">{isRtl ? 'اقتراحات سريعة:' : 'Quick Prompts:'}</span>
                                {[
                                  'المادة 51 من قانون العمل الكويتي ومستحقات نهاية الخدمة',
                                  'أسباب سقوط أمر الأداء في محاكم الاستئناف والتمييز',
                                  'عقد الغصب وحيازة العقار بدون سند في القانون المدني المصري',
                                  'قواعد المسؤولية التقصيرية والتعويض المالي للمقاولات'
                                ].map((pt, index) => (
                                    <button 
                                      key={index}
                                      onClick={() => setAiQuestion(pt)}
                                      className="px-3 py-1.5 bg-white hover:bg-primary-light/5 border border-gray-100 rounded-lg text-xs font-medium text-gray-600 hover:text-primary transition-colors cursor-pointer"
                                    >
                                        #{pt}
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button 
                                    onClick={handleAskAi} 
                                    isLoading={isAiLoading}
                                    className="bg-primary hover:bg-primary-dark font-bold text-white shadow-xl shadow-primary/10 px-8 py-3 rounded-xl"
                                    leftIcon={<SendIcon className="w-5 h-5" />}
                                >
                                    {isRtl ? 'تشغيل البحث والتحليل القانوني' : 'Consult AI Advisor'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>

                {aiResponse && (
                    <Card className="bg-white p-8 border border-primary/30 shadow-2xl rounded-3xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                        
                        <div className="flex justify-between items-center mb-6 text-xs font-bold text-gray-400 border-b pb-4">
                            <span className="flex items-center gap-2 text-primary font-bold italic">
                                <SparklesIcon className="w-5 h-5 text-amber-500 animate-bounce" /> 
                                {isRtl ? 'مسودة مستند الرأي الفقهي المولد بالذكاء الاصطناعي مراجعة ومعتمدة من المكتب' : 'AI generated jurisprudential advisory document'}
                            </span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setAiResponse(null)} className="text-gray-400 hover:text-danger hover:bg-danger/5 border-gray-100">
                                    {isRtl ? 'مسح التقرير' : 'Clear'}
                                </Button>
                                <Button variant="primary" size="sm" onClick={() => {
                                  setPrintConfig(prev => ({ ...prev, title: `تقرير فقهي ذكي: ${aiQuestion.substring(0, 30)}...` }));
                                  setResourceToPrint({
                                    id: 'ai-consultation-print',
                                    title: `رأي فقهي مستعجل وصيغة قانونية للبحث: ${aiQuestion}`,
                                    type: LegalResourceType.LEGAL_ARTICLE,
                                    publishDate: new Date().toISOString().split('T')[0],
                                    keywords: ['استشارة ذكية', 'صبري شطا', 'رأي قانوني'],
                                    description: aiResponse,
                                    summary: 'رأي فقهي تم توليده بدمج المرجعيات والأبحاث القانونية بمساعدة مستشاري صبري شطا.'
                                  });
                                  setIsPrintModalOpen(true);
                                }} className="bg-primary text-white">
                                    <PrinterIcon className="w-4 h-4 me-1.5" />
                                    {isRtl ? 'معاينة وطباعة رسمية' : 'Print Advisory'}
                                </Button>
                            </div>
                        </div>
                        <div className="markdown-body text-gray-700 leading-loose text-sm font-serif prose max-w-none prose-slate">
                            <ReactMarkdown>{aiResponse}</ReactMarkdown>
                        </div>
                    </Card>
                )}
            </motion.div>
        ) : activeTab === 'activities' ? (
            <motion.div
                key="audit-logs-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
            >
                <Card className="border-gray-100">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">{isRtl ? 'سجل التدقيق الإلكتروني وصيانة المكتبة' : 'System Audit Trail Registry'}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">متابعة دقيقة لكل عمليات البحث، التعديل وتنزيل القوانين والوثائق للامتثال والمسؤولية التشريعية</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => { setAuditLogs(INITIAL_AUDIT_LOGS); localStorage.setItem('qanooni_library_audit_logs', JSON.stringify(INITIAL_AUDIT_LOGS)); }} className="text-gray-400 hover:text-danger">
                             {isRtl ? 'إعادة تعيين السجل' : 'Reset Registry'}
                        </Button>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {auditLogs.map((log) => (
                            <div key={log.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-right">
                                <div className="flex items-center gap-3">
                                    <span className={`w-2.5 h-2.5 rounded-full ${log.category === 'CREATE' ? 'bg-emerald-500' : log.category === 'EDIT' ? 'bg-amber-500' : log.category === 'DELETE' ? 'bg-rose-500' : log.category === 'AI' ? 'bg-purple-500' : 'bg-primary'}`}></span>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{log.action}</p>
                                        <p className="text-xs text-gray-400 mt-1">{log.details}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 flex flex-col items-end gap-1">
                                    <span className="font-bold text-gray-700">{log.user}</span>
                                    <span className="text-[10px] font-mono">{log.timestamp}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </motion.div>
        ) : (
            <motion.div 
                key="list-catalog-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
            >
                <Card className="border-gray-100 shadow-sm">
                    <div className="p-5 space-y-4">
                        {/* Search and Filters Toolbar */}
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="relative flex-grow w-full">
                                <MagnifyingGlassIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <Input 
                                    placeholder={isRtl ? "ابحث بالعنوان، الكلمات المفتاحية، المرجع الجنائي، رقم المادة..." : "Search title, articles, penal keywords..."} 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pr-10 bg-gray-50/50 border-gray-200 focus:border-primary shadow-xs"
                                    containerClassName="mb-0"
                                />
                            </div>
                            <div className="flex gap-2 w-full md:w-auto">
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className={`flex-1 md:flex-initial gap-2 ${showAdvancedFilters ? 'bg-primary/5 border-primary text-primary' : 'text-gray-500'}`}
                                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                >
                                    <ListBulletIcon className="w-4 h-4" />
                                    {isRtl ? 'تصفية متطورة' : 'Advanced Filters'}
                                </Button>
                                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-100">
                                    <button className={`p-1.5 rounded-lg text-gray-500 transition-all ${viewMode === 'table' ? 'bg-white shadow-xs text-primary font-bold' : ''}`} onClick={() => setViewMode('table')} title="جدول القوانين">
                                        <ListBulletIcon className="w-4.5 h-4.5" />
                                    </button>
                                    <button className={`p-1.5 rounded-lg text-gray-500 transition-all ${viewMode === 'grid' ? 'bg-white shadow-xs text-primary font-bold' : ''}`} onClick={() => setViewMode('grid')} title="بطاقات تفصيلية">
                                        <Squares2X2Icon className="w-4.5 h-4.5" />
                                    </button>
                                    <button className={`p-1.5 rounded-lg text-gray-500 transition-all ${viewMode === 'archive' ? 'bg-white shadow-xs text-primary font-bold' : ''}`} onClick={() => setViewMode('archive')} title="الأرشيف والملخص المكتبي">
                                        <FolderIcon className="w-4.5 h-4.5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ADVANCED MULTI-OPTIONS FILTER DRAWER */}
                        <AnimatePresence>
                            {showAdvancedFilters && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden border-t pt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                                >
                                    <Select label={isRtl ? 'تصنيف المصدر' : 'Resource Type'} options={[{value: '', label: isRtl ? 'جميع التصنيفات' : 'All Types'}, ...legalResourceTypeOptions]} value={filterType} onChange={(e) => setFilterType(e.target.value)} containerClassName="mb-0"/>
                                    <Select label={isRtl ? 'الاختصاص الإقليمي' : 'Jurisdiction'} options={[{value:'', label: isRtl ? 'الدول والمنظمات' : 'All Countries'}, ...countryOptions]} value={filterCountry || ''} onChange={(e) => setFilterCountry(e.target.value as CountryCode | '')} containerClassName="mb-0"/>
                                    <Select label={isRtl ? 'فرع القانون وعيونه' : 'Branch of Law'} options={[{value: '', label: isRtl ? 'الكل' : 'All Branches'}, ...lawBranchOptions]} value={filterLawBranch} onChange={(e) => setFilterLawBranch(e.target.value as LawBranch | '')} containerClassName="mb-0"/>
                                    <div className="flex flex-col justify-end">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 block">{isRtl ? 'النطاق والسريان' : 'Legislative Scope'}</label>
                                        <div className="flex gap-1 bg-gray-50 p-1 border rounded-xl">
                                             {['', 'LOCAL', 'REGIONAL', 'INTERNATIONAL'].map((scope) => (
                                                 <button
                                                   key={scope}
                                                   onClick={() => setFilterScope(scope as any)}
                                                   className={`flex-1 py-1 px-2 text-[10px] rounded-lg transition-all font-bold ${filterScope === scope ? 'bg-white shadow-xs text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                                                 >
                                                     {scope === '' ? (isRtl ? 'الكل' : 'All') : scope === 'LOCAL' ? (isRtl ? 'محلي 🇰🇼' : 'Local') : scope === 'REGIONAL' ? (isRtl ? 'إقليمي' : 'Regional') : (isRtl ? 'دولي' : 'Intl')}
                                                 </button>
                                             ))}
                                        </div>
                                    </div>

                                    {/* GROUPING MODE BAR */}
                                    <div className="lg:col-span-2 space-y-2">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{isRtl ? 'تجميع القوالب القانونية حسب' : 'Group Content By'}</label>
                                        <div className="flex gap-2">
                                            {[
                                                {id: 'none', label: isRtl ? 'بدون تجميع' : 'Continuous Index'},
                                                {id: 'branch', label: isRtl ? 'فرع القانون' : 'Law Branch'},
                                                {id: 'country', label: isRtl ? 'الدولة / الاختصاص' : 'Country'}
                                            ].map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => setGroupBy(opt.id as any)}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${groupBy === opt.id ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-200'}`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-end lg:col-span-2">
                                        <Button variant="ghost" size="sm" onClick={() => { setFilterType(''); setFilterCountry(''); setFilterLawBranch(''); setFilterScope(''); setGroupBy('none'); }} className="text-gray-400 hover:text-danger hover:bg-red-50/50">
                                            {isRtl ? 'تصفير كل أدوات الغربلة' : 'Reset Filters'}
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* DYNAMIC LISTING RENDER (GROUPED VS FLAT) */}
                    <div className="p-5 border-t border-gray-100">
                        {groupBy !== 'none' && groupedResources ? (
                            <div className="space-y-12">
                                {Object.entries(groupedResources).map(([key, docs]) => (
                                    <div key={key} className="space-y-4">
                                        <div className="flex items-center gap-3 border-r-4 border-primary pr-3 py-1">
                                            <h3 className="text-lg font-black text-gray-800">{key}</h3>
                                            <span className="px-2.5 py-0.5 bg-gray-100 text-[10px] font-bold text-gray-400 rounded-full">{docs.length}</span>
                                        </div>
                                        {viewMode === 'table' ? (
                                            <ResourceTable resources={docs} pinnedIds={pinnedIds} togglePin={togglePin} onView={handleViewResource} onEdit={handleEditResource} onDelete={handleDeleteResource} isRtl={isRtl} formatDate={formatDate} triggerOfficialPrint={triggerOfficialPrint} />
                                        ) : viewMode === 'grid' ? (
                                            <ResourceGrid resources={docs} pinnedIds={pinnedIds} togglePin={togglePin} onView={handleViewResource} onEdit={handleEditResource} isRtl={isRtl} formatDate={formatDate} triggerOfficialPrint={triggerOfficialPrint} />
                                        ) : (
                                            <ResourceArchive resources={docs} onView={handleViewResource} isRtl={isRtl} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            filteredResources.length > 0 ? (
                                viewMode === 'table' ? (
                                    <ResourceTable resources={filteredResources} pinnedIds={pinnedIds} togglePin={togglePin} onView={handleViewResource} onEdit={handleEditResource} onDelete={handleDeleteResource} isRtl={isRtl} formatDate={formatDate} triggerOfficialPrint={triggerOfficialPrint} />
                                ) : viewMode === 'grid' ? (
                                    <ResourceGrid resources={filteredResources} pinnedIds={pinnedIds} togglePin={togglePin} onView={handleViewResource} onEdit={handleEditResource} isRtl={isRtl} formatDate={formatDate} triggerOfficialPrint={triggerOfficialPrint} />
                                ) : (
                                    <ResourceArchive resources={filteredResources} onView={handleViewResource} isRtl={isRtl} />
                                )
                            ) : (
                                <div className="text-center py-20 text-gray-400 bg-gray-50/30 rounded-3xl border-2 border-dashed border-gray-100">
                                    <FolderIcon className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                    <p className="text-lg font-bold text-gray-700">{isRtl ? 'عفواً، لا يطابق البحث أي مراجع' : 'No matching statutes found'}</p>
                                    <p className="text-sm italic text-gray-400">{isRtl ? 'حاول تعديل كلمات النطاق أو الفروع القانونية المنظمة للوصول لغايتك.' : 'Check parameters and retry search.'}</p>
                                </div>
                            )
                        )}
                    </div>
                </Card>
            </motion.div>
        )}
      </AnimatePresence>

      {/* RENDER FOR PRINT PREVIEW & OFFICIAL DESIGN LAYOUT MODAL */}
      <Modal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)} title={isRtl ? 'إعداد وصياغة المستند الرسمي المطبوع' : 'Configure Print Template'} size="lg">
          <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border space-y-3">
                  <h4 className="text-sm font-bold text-gray-800 border-r-2 border-primary pr-2">{isRtl ? 'تخصيص الهوامش والأختام الرقمية للتفعيل' : 'Margin & Stamp Design'}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input name="print_ref" label={isRtl ? 'رقم الخطاب / الصنف' : 'Reference Number'} value={printConfig.referenceNumber} onChange={(e) => setPrintConfig({...printConfig, referenceNumber: e.target.value})} />
                      <Input name="print_title" label={isRtl ? 'عنوان التقرير القانوني' : 'Document Title'} value={printConfig.title} onChange={(e) => setPrintConfig({...printConfig, title: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-gray-600 block">{isRtl ? 'شعار وخاتم مكتب الشريك' : 'Corporate Stamp Selection'}</label>
                          <select 
                            className="w-full p-2.5 rounded-xl border text-xs bg-white focus:ring-1 focus:ring-primary"
                            value={printConfig.stampType}
                            onChange={(e) => setPrintConfig({...printConfig, stampType: e.target.value as any})}
                          >
                              <option value="shata">{isRtl ? 'خاتم صبري شطّـا (رسمي معتمد)' : 'Sabri Shata Seal'}</option>
                              <option value="outbound">{isRtl ? 'خاتم الصادر والتقيد' : 'Outbound Registry Stamp'}</option>
                              <option value="approved">{isRtl ? 'خاتم الاعتماد والاعتداد' : 'Approval Authorized'}</option>
                              <option value="confidential">{isRtl ? 'بند سري جداً - يمنع التداول' : 'Highly Confidential'}</option>
                          </select>
                      </div>
                      <div className="flex items-center gap-6 pt-5">
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                              <input type="checkbox" checked={printConfig.showStamp} onChange={(e) => setPrintConfig({...printConfig, showStamp: e.target.checked})} />
                              {isRtl ? 'إرفاق الختم الأزرق' : 'Attach Signature Seal'}
                          </label>
                          <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                              <input type="checkbox" checked={printConfig.addWatermark} onChange={(e) => setPrintConfig({...printConfig, addWatermark: e.target.checked})} />
                              {isRtl ? 'علامة مائية (مسودة)' : 'Watermark Draft'}
                          </label>
                      </div>
                  </div>
              </div>

              {/* Fake Word & PDF simulated buttons + Print trigger */}
              <div className="flex justify-between items-center bg-gray-100 p-4 rounded-xl border border-gray-200">
                  <div className="flex gap-2">
                       <Button variant="outline" size="sm" onClick={() => addToast({ type: 'info', title: 'تصدير Word', message: 'جاري تحويل السند القانوني إلى قالب ميكروسوفت وورد (.docx)...' })} className="text-xs">
                            {isRtl ? 'تنزيل مستند Word' : 'Microsoft Word'}
                       </Button>
                       <Button variant="outline" size="sm" onClick={() => addToast({ type: 'info', title: 'تصدير PDF وحمايته', message: 'جاري حقن المرجع الرقمي وتوليد تشفير PDF معتمد...' })} className="text-xs">
                            {isRtl ? 'تنزيل PDF مشفر' : 'Encrypted PDF'}
                       </Button>
                  </div>
                  <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setIsPrintModalOpen(false)}>{isRtl ? 'إلغاء' : 'Cancel'}</Button>
                      <Button variant="primary" size="sm" onClick={handlePrintSubmit} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          <PrinterIcon className="w-4 h-4 me-1.5" />
                          {isRtl ? 'بدء الطباعة المباشرة' : 'Trigger Print Job'}
                      </Button>
                  </div>
              </div>
          </div>
      </Modal>

      {/* RENDER MODAL FOR FORM SUBMISSION (ADD/EDIT RESOURCE) */}
      <LegalResourceFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingResource}
      />

      {/* DETAILED VIEW MODAL */}
      <ViewLegalResourceModal
        resource={viewingResource}
        onClose={() => setViewingResource(null)}
        triggerOfficialPrint={triggerOfficialPrint}
        formatDate={formatDate}
        isRtl={isRtl}
        printConfig={printConfig}
      />
    </div>
  );
};

// --- SUB Table Component ---
const ResourceTable: React.FC<{
    resources: LegalResource[];
    pinnedIds: string[];
    togglePin: (id: string, name: string) => void;
    onView: (res: LegalResource) => void;
    onEdit: (res: LegalResource) => void;
    onDelete: (id: string) => void;
    isRtl: boolean;
    formatDate: (d?: string) => string;
    triggerOfficialPrint: (res: LegalResource) => void;
}> = ({ resources, pinnedIds, togglePin, onView, onEdit, onDelete, isRtl, formatDate, triggerOfficialPrint }) => {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-slate-50/70">
                    <tr>
                        <th className="px-3 py-3 w-8"></th>
                        <th scope="col" className="px-3 py-3 text-right font-bold text-gray-500 uppercase tracking-wider">{isRtl ? 'العنوان وتفاصيل الإصدار' : 'Statute Title'}</th>
                        <th scope="col" className="px-3 py-3 text-right font-bold text-gray-500 uppercase tracking-wider">{isRtl ? 'نوع المرجع' : 'Type'}</th>
                        <th scope="col" className="px-3 py-3 text-right font-bold text-gray-500 uppercase tracking-wider">{isRtl ? 'جغرافيا / نطاق' : 'Jurisdiction'}</th>
                        <th scope="col" className="px-3 py-3 text-right font-bold text-gray-500 uppercase tracking-wider">{isRtl ? 'نشر في' : 'Date'}</th>
                        <th scope="col" className="px-3 py-3 text-center font-bold text-gray-500">{isRtl ? 'إجراءات تخصصية' : 'Manage'}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {resources.map((res, index) => (
                    <motion.tr 
                        key={res.id} 
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.2) }}
                        className="group hover:bg-slate-50/50 transition-colors"
                    >
                        <td className="px-3 py-3 text-center">
                            <button onClick={() => togglePin(res.id, res.title)} className={`transition-all active:scale-95 ${pinnedIds.includes(res.id) ? 'text-amber-500' : 'text-gray-200 hover:text-amber-300'}`}>
                                <StarIcon className={`w-4.5 h-4.5 ${pinnedIds.includes(res.id) ? 'fill-current text-amber-500' : ''}`} />
                            </button>
                        </td>
                        <td className="px-3 py-3">
                            <div className="font-bold text-gray-800 hover:text-primary transition-colors cursor-pointer text-sm leading-relaxed" onClick={() => onView(res)}>{res.title}</div>
                            {res.documentNumber && <div className="text-[10px] uppercase font-mono font-bold text-gray-400 mt-1">{isRtl ? 'الرقم المرجعي:' : 'Reference ID:'} {res.documentNumber}</div>}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${res.type === LegalResourceType.LAW ? 'bg-blue-50 text-blue-700' : res.type === LegalResourceType.LEGAL_ARTICLE ? 'bg-purple-50 text-purple-700' : 'bg-amber-50 text-amber-700'}`}>
                            {res.type === LegalResourceType.LEGAL_ARTICLE ? (isRtl ? 'كتاب/مرجع فقهي' : 'Treatis/Book') : res.type === LegalResourceType.LAW ? (isRtl ? 'تشريع/قانون' : 'Statute/Codex') : (isRtl ? 'قرار وزاري/لائحة' : res.type)}
                            </span>
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-600 font-medium">
                            <span className="text-sm me-1.5">{res.country === 'KW' ? '🇰🇼' : res.country === 'EG' ? '🇪🇬' : '🌍'}</span>
                            {res.country === 'KW' ? (isRtl ? 'الكويت' : 'Kuwait') : res.country === 'EG' ? (isRtl ? 'مصر' : 'Egypt') : res.country}
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap text-gray-500 font-mono text-xs">{formatDate(res.publishDate)}</td>
                        <td className="px-3 py-3 whitespace-nowrap text-center space-x-1 space-x-reverse opacity-70 group-hover:opacity-100 transition-opacity">
                            <Button variant="outline" size="sm" onClick={() => onView(res)} className="p-1 px-2 border-gray-100 hover:bg-slate-50 text-xs" title="معاينة"><EyeIcon className="w-4 h-4 text-primary" /></Button>
                            <Button variant="outline" size="sm" onClick={() => triggerOfficialPrint(res)} className="p-1 px-2 border-gray-100 hover:bg-slate-50 text-xs" title="طباعة رسمية"><PrinterIcon className="w-4 h-4 text-emerald-600" /></Button>
                            <Button variant="outline" size="sm" onClick={() => onEdit(res)} className="p-1 px-2 border-gray-100 hover:bg-slate-50 text-xs" title="تعديل"><PencilIcon className="w-4 h-4 text-amber-600" /></Button>
                            <Button variant="outline" size="sm" onClick={() => onDelete(res.id)} className="p-1 px-2 border-slate-100 hover:bg-rose-50 text-xs" title="حذف"><TrashIcon className="w-4 h-4 text-red-500" /></Button>
                        </td>
                    </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// --- SUB Grid Component ---
const ResourceGrid: React.FC<{
    resources: LegalResource[];
    pinnedIds: string[];
    togglePin: (id: string, name: string) => void;
    onView: (res: LegalResource) => void;
    onEdit: (res: LegalResource) => void;
    isRtl: boolean;
    formatDate: (d?: string) => string;
    triggerOfficialPrint: (res: LegalResource) => void;
}> = ({ resources, pinnedIds, togglePin, onView, onEdit, isRtl, formatDate, triggerOfficialPrint }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {resources.map((res) => (
                <Card 
                    key={res.id} 
                    className="flex flex-col border-gray-100 hover:border-primary/30 hover:shadow-lg transition-all group overflow-hidden relative p-0"
                >
                    <div className="h-1.5 w-full" style={{ backgroundColor: res.type === LegalResourceType.LAW ? '#2563eb' : res.type === LegalResourceType.LEGAL_ARTICLE ? '#8b5cf6' : '#d97706'}} />
                    <div className="p-5 flex-grow">
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 bg-slate-100 p-1 px-2 rounded-md">
                                 {res.lawBranch || (isRtl ? 'قانون عام' : 'General')}
                            </span>
                            <div className="flex gap-1.5">
                                <button onClick={() => togglePin(res.id, res.title)} className={`transition-all active:scale-95 ${pinnedIds.includes(res.id) ? 'text-amber-500' : 'text-gray-300 hover:text-amber-400'}`}>
                                    <StarIcon className={`w-4.5 h-4.5 ${pinnedIds.includes(res.id) ? 'fill-current text-amber-500' : ''}`} />
                                </button>
                            </div>
                        </div>

                        <h4 className="text-base font-bold text-gray-800 leading-snug group-hover:text-primary transition-colors cursor-pointer line-clamp-2" onClick={() => onView(res)}>
                             {res.title}
                        </h4>
                        
                        <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                            {res.description || 'لا يوجد ملخص متاح لهذا المجلد.'}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                            {res.keywords.slice(0, 3).map((w, idx) => (
                                <span key={idx} className="text-[9px] bg-slate-50 text-gray-400 px-2 py-0.5 rounded-full border border-gray-100">#{w}</span>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-slate-50/50 p-4 border-t border-gray-100/60 flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-600 flex items-center gap-1">
                             <span>{res.country === 'KW' ? '🇰🇼' : res.country === 'EG' ? '🇪🇬' : '🌍'}</span>
                             {res.country === 'KW' ? (isRtl ? 'الكويت' : 'Kuwait') : res.country === 'EG' ? (isRtl ? 'مصر' : 'Egypt') : res.country}
                        </span>
                        <div className="flex gap-1.5">
                             <Button variant="outline" size="sm" onClick={() => onView(res)} className="p-1 border-slate-200 text-primary text-[10px] font-bold">
                                  {isRtl ? 'عرض المذكرة' : 'Read'}
                             </Button>
                             <Button variant="outline" size="sm" onClick={() => triggerOfficialPrint(res)} className="p-1 border-slate-200 text-emerald-600 text-[10px] font-bold">
                                  {isRtl ? 'طباعة' : 'Print'}
                             </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

// --- SUB Archive component ---
const ResourceArchive: React.FC<{
  resources: LegalResource[];
  onView: (res: LegalResource) => void;
  isRtl: boolean;
}> = ({ resources, onView, isRtl }) => {
  return (
    <div className="space-y-3">
        {resources.map((res) => (
            <div 
              key={res.id} 
              onClick={() => onView(res)}
              className="p-4 bg-white hover:bg-primary-light/[0.03] border border-gray-100 rounded-2xl flex items-center justify-between cursor-pointer group transition-all"
            >
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-slate-100 rounded-xl group-hover:bg-primary/10 transition-colors">
                        <FolderIcon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-gray-800 leading-snug">{res.title}</h4>
                        <div className="flex gap-3 text-[10px] text-gray-400 mt-1.5">
                            <span>{isRtl ? 'المُصدر:' : 'Issuer:'} {res.issuingAuthority || '-'}</span>
                            <span>•</span>
                            <span>{isRtl ? 'النطاق:' : 'Timeline:'} {res.documentNumber || '-'}</span>
                        </div>
                    </div>
                </div>
                <ArrowUpRightIcon className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors" />
            </div>
        ))}
    </div>
  );
};

// --- SUB Form Modal component ---
interface LegalResourceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (resource: LegalResource) => void;
  initialData?: Partial<LegalResource> | null;
}

const LegalResourceFormModal: React.FC<LegalResourceFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { addToast } = useToast();
  const getInitialFormData = (): Partial<LegalResource> => {
    return initialData || {
      type: LegalResourceType.LAW,
      country: 'KW' as CountryCode, 
      publishDate: new Date().toISOString().split('T')[0],
      keywords: [],
      resourceStatus: LegalResourceStatus.ACTIVE,
      relatedDocuments: [],
    };
  };

  const [formData, setFormData] = useState<Partial<LegalResource>>(getInitialFormData);
  const [isUploading, setIsUploading] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'content'>('basic');

  useEffect(() => {
    if (isOpen) {
        setFormData(getInitialFormData());
        setIsUploading(false);
        setActiveFormTab('basic');
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'keywords') {
      setFormData(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()).filter(s => s) }));
    } else if (name === 'country') {
      setFormData(prev => ({ ...prev, [name]: value as CountryCode }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.country || !formData.publishDate) {
        addToast({
            type: 'warning',
            title: 'حقول إلزامية',
            message: 'يرجى توفير حقل العنوان، والتبويب الجغرافي، وتاريخ النشر وصاحب الصلاحية.'
        });
        return;
    }
    onSubmit(formData as LegalResource);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData?.id ? 'تعديل مرجع قانوني قائم' : 'إيداع وتحديد مرجع قانوني جديد'} size="xl">
      <div className="flex border-b border-gray-100 mb-6 font-bold text-xs">
          {['المعايير الأساسية', 'نبذة ومكتوبات المذكرة'].map((tab, i) => {
              const tabId = ['basic', 'content'][i] as any;
              return (
                <button
                    key={tabId}
                    type="button"
                    onClick={() => setActiveFormTab(tabId)}
                    className={`py-3 px-6 relative transition-colors ${activeFormTab === tabId ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    {tab}
                    {activeFormTab === tabId && <motion.div layoutId="formTabBarIndicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                </button>
              );
          })}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
        {activeFormTab === 'basic' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <Input name="title" label="عنوان المرجع / القانون الشامل" value={formData.title || ''} onChange={handleChange} required />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select name="type" label="نوع التبويب" value={formData.type} options={legalResourceTypeOptions} onChange={handleChange} required />
                    <Input name="documentNumber" label="الرقم والرمز الرسمي (مثال: قانون ريادة 5 لسنة 2024)" value={formData.documentNumber || ''} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select name="country" label="الدولة والاختصاص" value={formData.country} options={countryOptions} onChange={handleChange} required />
                    <Select name="lawBranch" label="فرع القانون التخصصي" value={formData.lawBranch || ''} options={[{value: '', label: 'اختر فرع القانون'}, ...lawBranchOptions]} onChange={handleChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="issuingAuthority" label="صاحب الصلاحية / الجهة المصدرة" value={formData.issuingAuthority || ''} onChange={handleChange} placeholder="مثال: مجلس الأمة الكويتي أو اسم المؤلف المحاضر" />
                    <Input name="officialGazetteDetails" label="جريدة النشر الرسمي" value={formData.officialGazetteDetails || ''} onChange={handleChange} placeholder="مثال: الكويت اليوم، العدد 1045"/>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Input name="publishDate" label="تاريخ النشر" type="date" value={formData.publishDate} onChange={handleChange} required />
                    <Input name="effectiveDate" label="ميعاد سريان المفعول" type="date" value={formData.effectiveDate || ''} onChange={handleChange} />
                    <Select name="resourceStatus" label="حالة التشريع" value={formData.resourceStatus} options={legalResourceStatusOptions} onChange={handleChange} />
                </div>
            </motion.div>
        )}

        {activeFormTab === 'content' && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                <TextArea name="description" label="ملخص أو نبذة المرجع القانوني" value={formData.description || ''} onChange={handleChange} rows={5} />
                <TextArea name="summary" label="الملخص التنفيذي ونصوص المواد بالتفصيل" value={formData.summary || ''} onChange={handleChange} rows={5} placeholder="أدخل هنا نصوص المواد الهامة..." />
                <Input name="keywords" label="الكلمات المفتاحية والدلالية (افصلها بفواصل)" value={formData.keywords?.join(', ') || ''} onChange={handleChange} placeholder="مثال: مدني، التزام، الكويت" />
                <Input name="internalNotes" label="ملاحظات ووصايا داخلية لفريق الادعاء" value={formData.internalNotes || ''} onChange={handleChange} />
            </motion.div>
        )}

        <div className="flex justify-end space-x-3 space-x-reverse pt-6 border-t mt-6">
          <Button type="button" variant="outline" onClick={onClose} className="w-32">إلغاء</Button>
          <Button type="submit" variant="primary" className="bg-primary hover:bg-primary-dark w-48 font-bold text-white">إيداع وحفظ</Button>
        </div>
      </form>
    </Modal>
  );
};

// --- VIEW DETAILS MODAL ---
interface ViewLegalResourceModalProps {
  resource: LegalResource | null;
  onClose: () => void;
  triggerOfficialPrint: (res: LegalResource) => void;
  formatDate: (d?: string) => string;
  isRtl: boolean;
  printConfig: any;
}

const ViewLegalResourceModal: React.FC<ViewLegalResourceModalProps> = ({ 
  resource, onClose, triggerOfficialPrint, formatDate, isRtl, printConfig 
}) => {
  const { addToast } = useToast();
  const [aiAnalysisType, setAiAnalysisType] = useState<'summary' | 'impact' | 'expert' | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  if (!resource) return null;

  const getAiAnalysis = async (type: 'summary' | 'impact' | 'expert') => {
      setAiAnalysisType(type);
      setIsAiLoading(true);
      setAiResponse(null);
      try {
          let prompt = '';
          if (type === 'summary') {
              prompt = `قم بصياغة ملخص تنفيذي فقهي متميز ومحكم للمرجع التالي: "${resource.title}". مبدياً مواده الرئيسية، ونطاق الوفاء المالي أو العقاري ومقاصد المشرع. نبذة: ${resource.description}. البند الأساسي: ${resource.summary || ''}`;
          } else if (type === 'impact') {
               prompt = `ما هو الأثر التطبيقي والجنائي والعقدى والقضائي الشامل لهذا المرجع: "${resource.title}" على ساحة المنازعات في دولة الكويت ومصر والخليج؟ وما هي الثغرات التي يمكن تداركها بالدفاع؟`;
          } else {
               prompt = `بصفتك مستشاراً أولاً بالمكتب ومالك الحجة القانونية، قدم تحليلاً نقدياً شاملاً من عيون الأحكام لـ: "${resource.title}". كيف يتم استخدامه في اللوائح والتعويض؟ حدد نقاط القوة والضعف والتعارضات المحتملة مع القوانين الأخرى.`;
          }
          const response = await geminiService.getChatbotResponse(prompt);
          setAiResponse(response);
      } catch (e) {
          setAiResponse(isRtl ? "فشل توليد التحليل القانوني الذكي الفوري." : "AI failed.");
      } finally {
          setIsAiLoading(false);
      }
  };

  return (
    <Modal isOpen={!!resource} onClose={onClose} title={`${isRtl ? 'تفاصيل المرجع وبطاقة الفحص:' : 'Reference Sheet:'} ${resource.title}`} size="xl">
      
      {/* PROFESSIONAL HIGH-END OFFICIAL PRINT WRAPPER */}
      <div className="printable-document-output grid grid-cols-1 lg:grid-cols-3 gap-6 font-serif">
        <div className="lg:col-span-2 space-y-6 max-h-[75vh] overflow-y-auto px-1 print:max-h-full print:overflow-visible">
            
            {/* OFFICIAL DUAL HEADERS INDENT - VISIBLE ONLY DURING PRINT MODE */}
            <div className="hidden print:block border-b-2 border-primary pb-4 mb-4 text-center">
                 <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                     <span>{printConfig.officialHeaderAr}</span>
                     <span>{printConfig.officialHeaderEn}</span>
                 </div>
                 <h2 className="text-xl font-black text-gray-900 mt-2">{resource.title}</h2>
                 <p className="text-xs text-slate-500 font-mono">المرجع: {printConfig.referenceNumber} | التاريخ: {new Date().toLocaleDateString()}</p>
            </div>

            {/* DRAFT WATERMARK SIGNIFICATION FOR PRINT */}
            {printConfig.addWatermark && (
                <div className="hidden print:block fixed inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none transform -rotate-45 z-0">
                    <span className="text-7xl font-black text-slate-900 tracking-widest uppercase">DRAFT - مسودة معتمدة</span>
                </div>
            )}

            <div className="bg-gradient-to-l from-slate-50 to-white p-6 rounded-3xl border border-gray-100 shadow-xs relative">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-black text-primary leading-snug">{resource.title}</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-3 text-xs text-gray-600">
                    <div><strong>{isRtl ? 'رقم السند/المرسوم:' : 'Reference Num:'}</strong> {resource.documentNumber || '-'}</div>
                    <div><strong>{isRtl ? 'جهة الصدور:' : 'Authority:'}</strong> {resource.issuingAuthority || '-'}</div>
                    <div><strong>{isRtl ? 'تاريخ النشر الرسمي:' : 'Publish Date:'}</strong> {formatDate(resource.publishDate)}</div>
                    <div><strong>{isRtl ? 'الفرع التشريعي:' : 'Branch:'}</strong> {resource.lawBranch || '-'}</div>
                </div>
            </div>

            <div className="space-y-2">
                <h4 className="font-bold text-gray-800 border-r-4 border-primary pr-3 flex items-center gap-2">
                    <ListBulletIcon className="w-5 h-5 text-primary" /> 
                    {isRtl ? 'الغرض والوظيفة وديباجة النص' : 'Core Statute text'}
                </h4>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed text-sm font-serif">
                    {resource.description || 'لا يوجد تفصيل وصفي.'}
                </div>
            </div>

            {resource.summary && (
               <div className="space-y-2">
                   <h4 className="font-bold text-gray-800 border-r-4 border-emerald-600 pr-3 flex items-center gap-2">
                       <ClipboardDocumentListIcon className="w-5 h-5 text-emerald-600" /> 
                       {isRtl ? 'مسح لمواد التشريع الجوهرية' : 'Key Articles & Text'}
                   </h4>
                   <div className="bg-slate-50/50 p-6 rounded-2xl border border-gray-100 text-gray-700 leading-relaxed text-sm font-serif">
                       {resource.summary}
                   </div>
               </div>
            )}

            {resource.internalNotes && (
               <div className="space-y-2">
                   <h4 className="font-bold text-amber-800 border-r-4 border-amber-600 pr-3 flex items-center gap-2">
                       <InformationCircleIcon className="w-5 h-5 text-amber-600" /> 
                       {isRtl ? 'مذكرات صبري شطا وشركاه الخاصة بالتقاضي' : 'Internal Legal Strategy'}
                   </h4>
                   <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100 text-amber-900 leading-relaxed text-xs italic">
                       "{resource.internalNotes}"
                   </div>
               </div>
            )}

            {/* INTEGRATED INSTANT AI RESEARCH PANEL */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4 print:hidden">
                <h4 className="text-base font-bold flex items-center gap-2 text-amber-400">
                    <BrainIcon className="w-6 h-6" /> 
                    {isRtl ? 'الرأي القانوني للأستاذ صبري شطا مستعاناً بالـ AI' : 'Expert Counsel AI analysis'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                    <Button variant={aiAnalysisType === 'summary' ? 'primary' : 'ghost'} size="sm" onClick={() => getAiAnalysis('summary')} className="text-white border-white/20 select-none text-[10px]">توليد الخلاصة والمقاصد</Button>
                    <Button variant={aiAnalysisType === 'impact' ? 'primary' : 'ghost'} size="sm" onClick={() => getAiAnalysis('impact')} className="text-white border-white/20 select-none text-[10px]">تحليل الأثر والاحتراز القضائي</Button>
                    <Button variant={aiAnalysisType === 'expert' ? 'primary' : 'ghost'} size="sm" onClick={() => getAiAnalysis('expert')} className="text-white border-white/20 select-none text-[10px]">استشارة العيوب والثغرات</Button>
                </div>
                
                <AnimatePresence mode="wait">
                    {isAiLoading ? (
                        <div className="flex flex-col items-center py-6">
                            <SparklesIcon className="w-8 h-8 text-amber-400 animate-spin mb-2" />
                            <p className="text-xs italic text-gray-400 animate-pulse">{isRtl ? 'جاري صياغة الفتوى ومطابقة مواد الرأي القانوني...' : 'Drafting expert counsel...'}</p>
                        </div>
                    ) : aiResponse ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 p-4 rounded-xl text-xs text-gray-300 border border-white/10 leading-loose prose prose-invert font-serif">
                            <ReactMarkdown>{aiResponse}</ReactMarkdown>
                        </motion.div>
                    ) : (
                        <div className="text-center py-4 border border-dashed border-white/10 rounded-xl text-gray-500 text-xs italic">
                            {isRtl ? 'اختر التبويب المطلوب للبدء الفوري بالتوليد القانوني' : 'Select analysis mode to invoke AI.'}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* DYNAMIC SIGNATORIES AND QR AREA - VISIBLE DURING PRINT ONLY */}
            <div className="hidden print:grid grid-cols-2 gap-8 pt-10 border-t-2 border-dashed border-slate-200 mt-12">
                 <div className="text-right">
                      <p className="text-xs font-bold text-gray-700">{isRtl ? 'اعتماد الشريك المسؤول / الرقابة:' : 'Approved Partner Signature:'}</p>
                      <div className="h-16 flex items-end">
                           <span className="text-[10px] font-mono text-gray-400">صبري شطا - محامي تمييز مقيد</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 mt-2">{isRtl ? 'توقيع وختم الإيداع والوفاء' : 'Official Office Stamp'}</p>
                 </div>
                 <div className="flex flex-col items-end justify-center">
                      <div className="w-20 h-20 bg-slate-100 flex items-center justify-center border p-1 rounded-lg">
                           {/* Simulated Verification Qr Code */}
                           <div className="text-center text-[8px] font-mono text-gray-400">
                                <span className="block font-bold">QR CODE</span>
                                <span>{printConfig.referenceNumber}</span>
                           </div>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-2 font-mono">{isRtl ? 'امسح للتحقق من النسخة الرقمية' : 'Scan to verify digital copy'}</p>
                 </div>
            </div>
        </div>

        {/* QUICK SIDEBAR OPTIONS */}
        <div className="space-y-4 print:hidden">
            <div className="bg-gradient-to-br from-primary to-primary-dark p-6 rounded-3xl text-white shadow-lg space-y-3">
                <h4 className="font-bold text-sm tracking-wide">{isRtl ? 'تداول وتصديق وحفظ خطي' : 'Document Actions'}</h4>
                <div className="space-y-2">
                    <Button variant="outline" className="w-full text-xs border-white/20 text-white hover:bg-white/10 justify-start" onClick={() => triggerOfficialPrint(resource)}>
                        <PrinterIcon className="w-4 h-4 me-2" /> 
                        {isRtl ? 'الطباعة المعتمدة وتذييل الختم' : 'Official Printed Copy'}
                    </Button>
                    <Button variant="outline" className="w-full text-xs border-white/20 text-white hover:bg-white/10 justify-start" onClick={() => addToast({ type: 'success', title: 'مشاركة السند', message: 'تم نسخ رابط المرجع وبطاقة التعريف للمشاركة الفورية.' })}>
                        <ShareIcon className="w-4 h-4 me-2" /> 
                        {isRtl ? 'مشاركة المذكرة مع المدعين' : 'Share with Colleagues'}
                    </Button>
                </div>
            </div>

            <div className="bg-slate-50 p-6 rounded-3xl border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-3 text-xs flex items-center gap-2">
                    <TagIcon className="w-4 h-4 text-primary" /> 
                    {isRtl ? 'الهيكل المعرفي والكلمات' : 'Metadata Index tags'}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                    {resource.keywords.map(k => (
                        <span key={k} className="px-2 py-1 bg-white rounded-lg border border-gray-200 text-[10px] text-gray-600 font-medium">#{k}</span>
                    ))}
                </div>
            </div>

            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
                <h4 className="font-bold text-emerald-800 mb-2 text-xs">{isRtl ? 'سجل تتبع المستند' : 'Registry StatusLog'}</h4>
                <div className="text-[10px] text-emerald-700 space-y-1">
                    <p>• {isRtl ? 'الحالة الحالية:' : 'Status:'} {resource.resourceStatus || 'نشط'}</p>
                    <p>• {isRtl ? 'الصحيفة الرسمية:' : 'Gazette:'} {resource.officialGazetteDetails || 'غير محدد'}</p>
                </div>
            </div>
        </div>
      </div>
      
      <div className="print-hidden w-full flex justify-end pt-4 border-t mt-4">
          <Button variant="ghost" onClick={onClose} className="w-32">{isRtl ? 'إغلاق المعالجة' : 'Close Sheet'}</Button>
      </div>
    </Modal>
  );
};

export default LegalResourcesPage;
