import React, { useState, useMemo, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import PrintHeader from '../components/ui/PrintHeader';
import { geminiService } from '../services/geminiService';
import { Badge, CompanyDocumentStatusBadge } from '../components/ui/Badge';
import { useTranslation } from 'react-i18next';
import { useToast } from '../components/ui/Toast';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// Lucide Icons
import {
    Building2,
    Users,
    Scale,
    FileText,
    CheckCircle,
    AlertTriangle,
    Clock,
    Coins,
    Download,
    Upload,
    Plus,
    Trash2,
    Printer,
    Search,
    Filter,
    ChevronRight,
    Sparkles,
    Send,
    Bell,
    BookOpen,
    ShieldCheck,
    History,
    Globe,
    Calendar,
    Archive,
    FolderOpen,
    FileCheck,
    AlertCircle,
    Briefcase,
    Key,
    MousePointerClick,
    Activity,
    FileSpreadsheet,
    BookMarked,
    Edit3,
    TrendingUp,
    BarChart2
} from 'lucide-react';

import {
    CompanyProfile,
    ShareholderInfo,
    BoardMemberInfo,
    AuthorizedSignatoryInfo,
    CompanyMeeting,
    CorporateAction,
    CompanyDocument,
    CorporateCommittee,
    CompanyLegalFormKuwait,
    CompanyMeetingType,
    BoardMemberPosition,
    CorporateActionType,
    CorporateActionStatus,
    CompanyDocumentType,
    CompanyDocumentStatus
} from '../types';

import {
    initialMockCompanies,
    initialMockMeetings,
    initialMockActions,
    initialMockDocuments,
    initialMockTimeline,
    initialMockReminders,
    CompanyProfileExt,
    TimelineEvent,
    SystemCorporateReminder
} from '../data/companyMockData';

// Translate dictionary for Corporate Affairs Module
const DICT = {
    ar: {
        title: "إدارة شؤون الشركات والحوكمة",
        subtitle: "المنظومة القانونية المتكاملة للامتثال وإدارة الشركات بدولة الكويت",
        allCompanies: "عرض قائمة الشركات",
        activeCompany: "الشركة النشطة حالياً",
        selectCompany: "اختر الشركة",
        changeCompany: "تبديل الشركة",
        allTypes: "كل الأشكال القانونية",
        addCompany: "تسجيل شركة جديدة",
        editCompany: "تعديل بيانات الشركة",
        companyNameAr: "اسم الشركة (عربي)",
        companyNameEn: "اسم الشركة (إنجليزي)",
        legalForm: "الشكل القانوني",
        regNumber: "رقم السجل التجاري",
        licenseNumber: "رقم الترخيص الموحد (MOCI)",
        chamberNumber: "رقم غرفة التجارة والصناعة",
        estDate: "تاريخ التأسيس",
        capital: "رأس المال المصرح به",
        paidCapital: "رأس المال المدفوع",
        fiscalEnd: "نهاية السنة المالية (شهر-يوم)",
        auditor: "مكتب تدقيق الحسابات",
        address: "العنوان والمقر الرئيسي",
        phone: "رقم الهاتف",
        email: "البريد الإلكتروني",
        website: "الموقع الإلكتروني",
        searchPlaceholder: "البحث في القوائم والمستندات بكلمات مفتاحية...",
        complianceStatus: "مستوى الامتثال القانوني",
        active: "نشط",
        archived: "مؤرشف",
        archiveBtn: "أرشفة",
        restoreBtn: "استعادة",
        deleteBtn: "حذف نهائي",
        saveBtn: "حفظ البيانات",
        cancelBtn: "إلغاء",
        remindersTitle: "الإشعارات والتنبيهات والآجال",
        upcomingExpirations: "مواعيد التجديد القريبة",
        noReminders: "لا توجد تنبيهات عاجلة حالياً.",
        tabDashboard: "لوحة الرقابة والامتثال",
        tabEditor: "محرر السندات والقرارات",
        tabProfile: "ملف الشركة والتفتيش",
        tabStructure: "الملاك وهيكل رأس المال",
        tabBoard: "مجلس الإدارة واللجان",
        tabSignatories: "التوقيعات والمفوضين",
        tabMeetings: "الجمعيات وفهرس المحاضر",
        tabActions: "التعديلات والمرئيات الرياضية",
        tabDocuments: "السداد والمستندات والخطابات",
        tabTimeline: "سجل العمليات التاريخية",
        tabCopilot: "مساعد الشركات الذكي",
        tabReports: "التقارير السنوية للشركة",
        shareholderName: "اسم الشريك / المساهم",
        shareholderNationality: "الجنسية",
        civilId: "الرقم المدني / رقم السجل التجاري للشخص المعنوي",
        sharePercentage: "نسبة الملكية (%)",
        numberOfShares: "عدد الأسهم / الحصص",
        shareClass: "فئة السهم / طبيعة المساهمة",
        votingRights: "حقوق التصويت بالجمعيات",
        boardPosition: "الصفة بالمجلس",
        appointmentDate: "تاريخ التعيين / الانتخاب",
        termEndDate: "تاريخ انتهاء المفعول",
        isAuthorized: "مخول بالتوقيع",
        scopeOfAuthority: "صلاحيات التوقيع وحدودها المالية",
        notLimited: "غير محدود مالياً",
        limitedTo: "محدود بحد أقصى د.ك:",
        jointRequired: "يتطلب توقيعاً مشتركاً (مزدوجاً)",
        meetingType: "نوع الجمعية / الاجتماع",
        meetingDate: "تاريخ الاجتماع",
        meetingTime: "توقيت الجلسة",
        location: "المقر / القاعة",
        attendees: "الحضور والجهات المراقبة",
        agenda: "جدول الأعمال",
        resolutions: "القرارات المعتمدة والتصويت",
        exportToCsv: "تصدير الملف CSV",
        printDoc: "طباعة التقرير",
        uploadFile: "اسحب أو اختر الملف لربطه كعقد أو ترخيص",
        fileTypes: "مسموح بملفات Word, PDF, Excel والمستندات المصورة حتى 25 ميجابايت",
        timelineTitle: "موجز الأنشطة التاريخية والامتثال",
        copilotWelcome: "مرحباً بك في مساعد الحوكمة والامتثال الذكي. يمكنني صياغة دعوات الجمعيات العمومية، إعداد محاضر مجالس الإدارة بالصيغة القانونية المتبعة بوزارة التجارة الكويتية، وفحص مدى توافق شروط التوقيع القانوني الخاص بكم مع البنوك.",
        copilotAskPrompt: "اكتب طلبك للمستشار القانوني الآلي (مثال: صياغة محضر اجتماع مجلس إدارة بزيادة غرض الشركة...)",
        sendBtn: "إرسال",
        copilotPresets: "نماذج صياغة سريعة",
        presetMinutes: "صياغة محضر مجلس إدارة",
        presetExtraordinary: "دعوة جمعية عمومية غير عادية لزيادة رأس المال",
        presetResolution: "صياغة قرار شريك وحيد بنقل ملكية حصص",
        validationCapitalMatch: "تنبيه: مجموع ملكيات المساهمين المسجلة لا يتطابق مع النسبة الكاملة (100%)!",
        validationDuplicateCompany: "هذه الشركة متواجدة بالفعل بنفس السجل التجاري!",
        archiveAlert: "هل أنت متأكد من أرشفة هذه الشركة؟"
    },
    en: {
        title: "Corporate Affairs & Governance",
        subtitle: "Integrated legal framework compliance and corporate law suite in Kuwait",
        allCompanies: "Show All Companies",
        activeCompany: "Current Active Company",
        selectCompany: "Select Company",
        changeCompany: "Switch Workspace",
        allTypes: "All Legal Structs",
        addCompany: "Register New Company",
        editCompany: "Edit Corporate Profile",
        companyNameAr: "Arabic Name",
        companyNameEn: "English Name",
        legalForm: "Legal Structure",
        regNumber: "Commercial Registry No.",
        licenseNumber: "Unified Licensing Code (MOCI)",
        chamberNumber: "Chamber of Commerce Cert No.",
        estDate: "Establishment Date",
        capital: "Authorized Capital",
        paidCapital: "Paid-up Capital",
        fiscalEnd: "Fiscal Year End (MM-DD)",
        auditor: "Chartered Auditor Office",
        address: "Headquarters Address",
        phone: "Phone Number",
        email: "Official Email",
        website: "Website",
        searchPlaceholder: "Search files, records or shareholders...",
        complianceStatus: "Governance Compliance Rating",
        active: "Active",
        archived: "Archived",
        archiveBtn: "Archive Account",
        restoreBtn: "Restore Profile",
        deleteBtn: "Purge Record",
        saveBtn: "Save Profile Info",
        cancelBtn: "Cancel",
        remindersTitle: "Reminders & Regulatory Deadlines",
        upcomingExpirations: "Pending Renewals",
        noReminders: "No urgent compliance alerts.",
        tabDashboard: "Compliance Dashboard & Radar",
        tabEditor: "Minutes & Resolution Editor",
        tabProfile: "Profile & Site License",
        tabStructure: "Partners & Cap Table",
        tabBoard: "Board & Committees",
        tabSignatories: "Signatories & Scope",
        tabMeetings: "Assemblies & Minutes",
        tabActions: "Amendments & Restruct",
        tabDocuments: "Document Safe & Files",
        tabTimeline: "Milestone Audit Log",
        tabCopilot: "Governance AI Copilot",
        tabReports: "Annual Corporate Reports",
        shareholderName: "Shareholder Name",
        shareholderNationality: "Nationality",
        civilId: "Civil ID / Legal Entity Registry",
        sharePercentage: "Equity Stake (%)",
        numberOfShares: "Shares Allocated",
        shareClass: "Share Structure Class",
        votingRights: "Has Assembly Voting Rights",
        boardPosition: "Board Designation",
        appointmentDate: "Elected/Assigned Date",
        termEndDate: "Mandate Expiry Date",
        isAuthorized: "Signatory Authorized",
        scopeOfAuthority: "Signature Authority Scope",
        notLimited: "Unrestricted Financial Scope",
        limitedTo: "Restricted up to KWD:",
        jointRequired: "Requires Joint (Dual) Signature",
        meetingType: "Assembly/Meeting Type",
        meetingDate: "Session Date",
        meetingTime: "Session Time",
        location: "Meeting Room/Hall",
        attendees: "Attendees & Regulators",
        agenda: "Agenda Docket",
        resolutions: "Resolutions Passed & Votes",
        exportToCsv: "Export Data to CSV",
        printDoc: "Print Legal Copy",
        uploadFile: "Drag & drop legal papers (Contracts, MOCI licenses)",
        fileTypes: "Supported formats: Word, PDF, Excel, and Images up to 25MB",
        timelineTitle: "Historical Milestones & Compliance Audit",
        copilotWelcome: "Welcome to your AI Governance Copilot. I can draft General Assembly notices, compile Board of Directors minutes under MOCI Kuwait standards, and parse bank signature authorizations for compatibility.",
        copilotAskPrompt: "Acknowledge query here (e.g., Draft resolution for LLC ownership transfer...)",
        sendBtn: "Inquire",
        copilotPresets: "Pragmatic Legal Presets",
        presetMinutes: "Draft Board Minutes",
        presetExtraordinary: "Draft Capital Increase EGA Docket",
        presetResolution: "LLC Share Sale Consent Resolution",
        validationCapitalMatch: "Warning: Share percentages do not add up to 100%!",
        validationDuplicateCompany: "A company with this Commercial Registry already exists!",
        archiveAlert: "Are you sure you want to archive this corporate profile?"
    }
};

export default function CompanyAffairsPage() {
    const { i18n } = useTranslation();
    const { addToast } = useToast();
    const lang = i18n.language === 'ar' ? 'ar' : 'en';
    const tLocal = DICT[lang];

    // State declarations with localStorage hydration
    const [companies, setCompanies] = useState<CompanyProfileExt[]>(() => {
        const saved = localStorage.getItem('qanooni_companies_list');
        return saved ? JSON.parse(saved) : initialMockCompanies;
    });

    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(() => {
        const saved = localStorage.getItem('qanooni_active_company_id');
        if (saved) return saved;
        return initialMockCompanies[0]?.id || '';
    });

    const [meetings, setMeetings] = useState<CompanyMeeting[]>(() => {
        const saved = localStorage.getItem('qanooni_company_meetings_list');
        return saved ? JSON.parse(saved) : initialMockMeetings;
    });

    const [actions, setActions] = useState<CorporateAction[]>(() => {
        const saved = localStorage.getItem('qanooni_company_actions_list');
        return saved ? JSON.parse(saved) : initialMockActions;
    });

    const [documents, setDocuments] = useState<CompanyDocument[]>(() => {
        const saved = localStorage.getItem('qanooni_company_documents_list');
        return saved ? JSON.parse(saved) : initialMockDocuments;
    });

    const [reminders, setReminders] = useState<SystemCorporateReminder[]>(() => {
        const saved = localStorage.getItem('qanooni_company_reminders_list');
        return saved ? JSON.parse(saved) : initialMockReminders;
    });

    const [timeline, setTimeline] = useState<TimelineEvent[]>(() => {
        const saved = localStorage.getItem('qanooni_company_timeline_list');
        return saved ? JSON.parse(saved) : initialMockTimeline;
    });

    // Navigation and Visual Preferences
    const [activeTab, setActiveTab] = useState<string>('dashboard');
    const [dashboardSubTab, setDashboardSubTab] = useState<string>('profile');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterLegalForm, setFilterLegalForm] = useState<string>('ALL');
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [showArchivedCompanies, setShowArchivedCompanies] = useState<boolean>(false);
    const [showNotificationList, setShowNotificationList] = useState<boolean>(false);

    // Integrated Resolution and Minutes Editor States
    const [docTitle, setDocTitle] = useState<string>('محضر اجتماع الجمعية العامة العادية لزيادة رأس المال');
    const [docContent, setDocContent] = useState<string>('');

    // AI Copilot State
    const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model', content: string }[]>([
        { role: 'model', content: tLocal.copilotWelcome }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Modal Control States
    const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
    const [isShareholderModalOpen, setIsShareholderModalOpen] = useState(false);
    const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
    const [isSignatoryModalOpen, setIsSignatoryModalOpen] = useState(false);
    const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);

    // Editing Target references
    const [editingCompany, setEditingCompany] = useState<CompanyProfileExt | null>(null);
    const [editingShareholder, setEditingShareholder] = useState<ShareholderInfo | null>(null);
    const [editingBoard, setEditingBoard] = useState<BoardMemberInfo | null>(null);
    const [editingSignatory, setEditingSignatory] = useState<AuthorizedSignatoryInfo | null>(null);
    const [editingMeeting, setEditingMeeting] = useState<CompanyMeeting | null>(null);
    const [editingAction, setEditingAction] = useState<CorporateAction | null>(null);
    const [editingDoc, setEditingDoc] = useState<CompanyDocument | null>(null);

    // Simulated File upload state
    const [dragging, setDragging] = useState(false);

    // Auto-save Synchronization triggers
    useEffect(() => {
        localStorage.setItem('qanooni_companies_list', JSON.stringify(companies));
    }, [companies]);

    useEffect(() => {
        localStorage.setItem('qanooni_active_company_id', selectedCompanyId);
    }, [selectedCompanyId]);

    useEffect(() => {
        localStorage.setItem('qanooni_company_meetings_list', JSON.stringify(meetings));
    }, [meetings]);

    useEffect(() => {
        localStorage.setItem('qanooni_company_actions_list', JSON.stringify(actions));
    }, [actions]);

    useEffect(() => {
        localStorage.setItem('qanooni_company_documents_list', JSON.stringify(documents));
    }, [documents]);

    useEffect(() => {
        localStorage.setItem('qanooni_company_reminders_list', JSON.stringify(reminders));
    }, [reminders]);

    useEffect(() => {
        localStorage.setItem('qanooni_company_timeline_list', JSON.stringify(timeline));
    }, [timeline]);

    // Active workspace reference
    const activeCompany = useMemo(() => {
        return companies.find(c => c.id === selectedCompanyId) || companies[0];
    }, [companies, selectedCompanyId]);

    // Notification counters
    const activeCompanyReminders = useMemo(() => {
        return reminders.filter(r => r.companyId === selectedCompanyId && !r.isRead);
    }, [reminders, selectedCompanyId]);

    // Lazy load default document text based on active company
    useEffect(() => {
        if (!docContent && activeCompany) {
            setDocContent(`بسم الله الرحمن الرحيم

دولة الكويت
وزارة التجارة والصناعة (MOCI)
محضر اجتماع الجمعية العامة العادية لشركة ${activeCompany?.companyNameAr || 'الشاهين العقارية ذ.م.م'}

إنه في تاريخه أعلاه، وبموجب موافقة وزارة التجارة والصناعة المسبقة، انعقدت الجمعية العامة العادية لشركاء شركة ${activeCompany?.companyNameAr || 'الشاهين العقارية ذ.م.م'} في مقرها الرئيسي، بحضور شركاء يمثلون 100% من رأس المال البالغ ${activeCompany?.capital ? activeCompany.capital.toLocaleString() : '100,000'} د.ك.

رئيس الجلسة: السيد/ ${activeCompany?.boardMembers?.[0]?.name || 'خالد عبد الله الشاهين'} (رئيس مجلس الإدارة)

جدول الأعمال والقرارات المعتمدة:
أولاً: الموافقة بالإجماع على زيادة رأس المال المصرح به والمدفوع إلى ${activeCompany?.capital ? (activeCompany.capital * 1.5).toLocaleString() : '150,000'} د.ك عن طريق إدخال شركاء ومستثمرين جدد.
ثانياً: تفويض السيد/ ${activeCompany?.authorizedSignatories?.[0]?.name || 'خالد عبد الله الشاهين'}، بصفته مفوضاً بالتوقيع، بتمثيل الشركة أمام الجهات الرسمية، وتحديداً وزارة التجارة والصناعة، وكاتب العدل التابع لوزارة العدل للتوقيع على الملحق التعديلي لعقد التأسيس.
ثالثاً: تفويض رئيس الجلسة بإنشاء وتوطين حساب التوفير لزيادة رأس المال لدى البنك التجاري الكويتي.

القسم القانوني والمطابقة - مكتب الحوكمة والامتثال
توقيع رئيس الجلسة:                             توقيع كاتب المحضر المعتمد:
.........................                            .........................`);
        }
    }, [activeCompany, docContent]);

    // Format utility helpers
    const formatKWD = (value?: number) => {
        if (value === undefined || value === null) return '-';
        return new Intl.NumberFormat('ar-KW', { style: 'currency', currency: 'KWD', minimumFractionDigits: 0 }).format(value);
    };

    const formatDateString = (str?: string) => {
        if (!str) return '-';
        try {
            return new Date(str).toLocaleDateString(lang === 'ar' ? 'ar-KW' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch {
            return str;
        }
    };

    // Scroll chat bottom
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // CSV exporter helper
    const handleExportCSV = (data: any[], title: string) => {
        if (!data.length) {
            addToast({ type: 'warning', title: lang === 'ar' ? 'لا توجد بيانات' : 'Empty list', message: lang === 'ar' ? 'لا توجد بيانات متاحة للتصدير' : 'No entries found.' });
            return;
        }
        let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
        const keys = Object.keys(data[0]);
        csvContent += keys.join(",") + "\n";

        data.forEach(item => {
            const row = keys.map(k => {
                let val = item[k];
                if (typeof val === 'object') val = JSON.stringify(val).replace(/"/g, '""');
                else if (typeof val === 'string') val = `"${val.replace(/"/g, '""')}"`;
                return val;
            });
            csvContent += row.join(",") + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${title}_export.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addToast({ type: 'success', title: lang === 'ar' ? 'تم التصدير' : 'Exported', message: lang === 'ar' ? 'تم حفظ جدول البيانات بنجاح' : 'Table exported successfully.' });
    };

    // Printing Trigger
    const handlePrintWorkspace = () => {
        window.print();
    };

    // --- CRUD OPERATIONS ---

    // 1. Company Profiles
    const handleSaveCompany = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const nameAr = fd.get('companyNameAr') as string;
        const regNum = fd.get('registrationNumber') as string;

        if (!nameAr || !regNum) return;

        // Duplicate Check
        if (!editingCompany && companies.some(c => c.registrationNumber === regNum)) {
            addToast({ type: 'error', title: 'خطأ إدخال', message: tLocal.validationDuplicateCompany });
            return;
        }

        if (editingCompany) {
            setCompanies(prev => prev.map(c => c.id === editingCompany.id ? {
                ...c,
                companyNameAr: nameAr,
                companyNameEn: fd.get('companyNameEn') as string,
                legalForm: fd.get('legalForm') as CompanyLegalFormKuwait,
                registrationNumber: regNum,
                tradeLicenseNumber: fd.get('tradeLicenseNumber') as string,
                chamberOfCommerceNumber: fd.get('chamberOfCommerceNumber') as string,
                establishmentDate: fd.get('establishmentDate') as string,
                capital: Number(fd.get('capital') || 0),
                paidUpCapital: Number(fd.get('paidUpCapital') || 0),
                headOfficeAddress: fd.get('headOfficeAddress') as string,
                contactInfo: {
                    phone: fd.get('phone') as string,
                    email: fd.get('email') as string,
                    website: fd.get('website') as string
                },
                fiscalYearEnd: fd.get('fiscalYearEnd') as string,
                auditorName: fd.get('auditorName') as string
            } : c));

            // Log event to timeline
            const evId = `time-${Date.now()}`;
            setTimeline(prev => [
                {
                    id: evId,
                    companyId: editingCompany.id,
                    titleAr: 'تحديث الملف القانوني للشركة',
                    titleEn: 'Corporate profile revised',
                    descriptionAr: 'تم تحديث البيانات والسجلات التجارية والمالية بملف الإدارة.',
                    descriptionEn: 'Registry and financial parameters were updated on the digital file.',
                    date: new Date().toISOString().split('T')[0],
                    type: 'other'
                },
                ...prev
            ]);

            addToast({ type: 'success', title: lang === 'ar' ? 'تم التعديل' : 'Company Updated', message: lang === 'ar' ? 'تم تحديث بيانات الشركة بنجاح' : 'Success.' });
        } else {
            const newId = `comp-${Date.now()}`;
            const newComp: CompanyProfileExt = {
                id: newId,
                companyNameAr: nameAr,
                companyNameEn: fd.get('companyNameEn') as string,
                legalForm: fd.get('legalForm') as CompanyLegalFormKuwait,
                registrationNumber: regNum,
                tradeLicenseNumber: fd.get('tradeLicenseNumber') as string,
                chamberOfCommerceNumber: fd.get('chamberOfCommerceNumber') as string,
                establishmentDate: fd.get('establishmentDate') as string,
                capital: Number(fd.get('capital') || 0),
                paidUpCapital: Number(fd.get('paidUpCapital') || 0),
                headOfficeAddress: fd.get('headOfficeAddress') as string,
                contactInfo: {
                    phone: fd.get('phone') as string,
                    email: fd.get('email') as string,
                    website: fd.get('website') as string
                },
                fiscalYearEnd: fd.get('fiscalYearEnd') as string,
                auditorName: fd.get('auditorName') as string,
                archived: false,
                shareholders: [],
                boardMembers: [],
                authorizedSignatories: [],
                committees: []
            };

            setCompanies(prev => [...prev, newComp]);
            setSelectedCompanyId(newId);

            // Log event
            setTimeline(prev => [
                {
                    id: `time-${Date.now()}`,
                    companyId: newId,
                    titleAr: 'تأسيس وقيد السلف التأسيسية للملف',
                    titleEn: 'Record creation on platform',
                    descriptionAr: 'تم قيد وتسجيل ملف الشركة ومباشرة تتبع الامتثال بنظام شؤون الشركات القانونية.',
                    descriptionEn: 'Company profile created in structural database tracker.',
                    date: new Date().toISOString().split('T')[0],
                    type: 'registration'
                },
                ...prev
            ]);

            addToast({ type: 'success', title: lang === 'ar' ? 'تم التسجيل' : 'Registered', message: lang === 'ar' ? 'تم إدراج الشركة الجديدة بمهام الحوكمة' : 'Registered successfully.' });
        }

        setIsCompanyModalOpen(false);
        setEditingCompany(null);
    };

    const handleArchiveCompany = (id: string) => {
        if (confirm(tLocal.archiveAlert)) {
            setCompanies(prev => prev.map(c => c.id === id ? { ...c, archived: !c.archived } : c));
            addToast({ type: 'info', title: lang === 'ar' ? 'تعديل حالة القيد' : 'Status Modified', message: lang === 'ar' ? 'تم تغيير حالة أرشفة الشركة بنجاح' : 'Archive attribute updated.' });
        }
    };

    const handleDeleteCompany = (id: string) => {
        if (confirm(lang === 'ar' ? 'هل أنت متأكد تماماً من حذف هذا الملف نهائياً؟ لا يمكن الاستعادة بعد الحذف.' : 'Delete company permanently? This is irreversible.')) {
            setCompanies(prev => prev.filter(c => c.id !== id));
            if (selectedCompanyId === id) {
                const remains = companies.filter(c => c.id !== id);
                setSelectedCompanyId(remains[0]?.id || '');
            }
            addToast({ type: 'error', title: lang === 'ar' ? 'تم الحذف' : 'Purged', message: lang === 'ar' ? 'تم التخلص من ملف الشركة من قاعدة البيانات' : 'Company profile eradicated.' });
        }
    };

    // 2. Shareholders / Partners
    const handleSaveShareholderObj = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = fd.get('shName') as string;
        if (!name) return;

        const shObj: ShareholderInfo = {
            id: editingShareholder?.id || `sh-${Date.now()}`,
            name,
            nationality: fd.get('shNationality') as string || 'كويتي',
            civilIdOrRegNumber: fd.get('shCivilId') as string || '',
            sharePercentage: Number(fd.get('shPercentage') || 0),
            numberOfShares: Number(fd.get('shShares') || 0),
            shareClass: fd.get('shClass') as string || 'عادية',
            votingRights: fd.get('shVoting') === 'true'
        };

        setCompanies(prev => prev.map(c => {
            if (c.id === selectedCompanyId) {
                const currentList = c.shareholders || [];
                const updatedList = editingShareholder
                    ? currentList.map(s => s.id === editingShareholder.id ? shObj : s)
                    : [...currentList, shObj];
                return { ...c, shareholders: updatedList };
            }
            return c;
        }));

        setIsShareholderModalOpen(false);
        setEditingShareholder(null);
        addToast({ type: 'success', title: lang === 'ar' ? 'تم الحفظ' : 'Saved', message: lang === 'ar' ? 'تم تحديث قائمة الملاك والحصص بنجاح' : 'Cap table changed.' });
    };

    const handleDeleteShareholder = (id: string) => {
        if (confirm(lang === 'ar' ? 'حذف الشريك من قائمة المساهمين؟' : 'Remove shareholder?')) {
            setCompanies(prev => prev.map(c => {
                if (c.id === selectedCompanyId) {
                    return { ...c, shareholders: (c.shareholders || []).filter(s => s.id !== id) };
                }
                return c;
            }));
            addToast({ type: 'info', title: lang === 'ar' ? 'تم الحذف' : 'Removed', message: lang === 'ar' ? 'تم إلغاء قيد الشريك بنجاح' : 'Eradicated.' });
        }
    };

    // Calculate sum of active company shareholders % to validate capital
    const shareholdersSumPercent = useMemo(() => {
        if (!activeCompany?.shareholders) return 0;
        return activeCompany.shareholders.reduce((sum, sh) => sum + sh.sharePercentage, 0);
    }, [activeCompany]);

    // 3. Board & Officers
    const handleSaveBoardMemberObj = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = fd.get('bmName') as string;
        if (!name) return;

        const bmObj: BoardMemberInfo = {
            id: editingBoard?.id || `bm-${Date.now()}`,
            name,
            position: fd.get('bmPosition') as BoardMemberPosition,
            appointmentDate: fd.get('bmAppointmentDate') as string || '',
            termEndDate: fd.get('bmTermEndDate') as string || '',
            isAuthorizedSignatory: fd.get('bmIsSignatory') === 'true'
        };

        setCompanies(prev => prev.map(c => {
            if (c.id === selectedCompanyId) {
                const currentList = c.boardMembers || [];
                const updatedList = editingBoard
                    ? currentList.map(b => b.id === editingBoard.id ? bmObj : b)
                    : [...currentList, bmObj];
                return { ...c, boardMembers: updatedList };
            }
            return c;
        }));

        setIsBoardModalOpen(false);
        setEditingBoard(null);
        addToast({ type: 'success', title: lang === 'ar' ? 'تم الحفظ' : 'Saved', message: lang === 'ar' ? 'تم تحديث رتبة مجلس الإدارة والتمثيل القانوني' : 'Board updated.' });
    };

    const handleDeleteBoardMember = (id: string) => {
        if (confirm(lang === 'ar' ? 'عزل أو إلغاء قيد عضو مجلس الإدارة؟' : 'Remove board member?')) {
            setCompanies(prev => prev.map(c => {
                if (c.id === selectedCompanyId) {
                    return { ...c, boardMembers: (c.boardMembers || []).filter(b => b.id !== id) };
                }
                return c;
            }));
            addToast({ type: 'info', title: lang === 'ar' ? 'تم الحذف' : 'Removed', message: lang === 'ar' ? 'تم إلغاء عضوية العضو بنجاح' : 'Eradicated.' });
        }
    };

    // 4. Signatories
    const handleSaveSignatoryObj = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const name = fd.get('asName') as string;
        if (!name) return;

        const sigObj: AuthorizedSignatoryInfo = {
            id: editingSignatory?.id || `as-${Date.now()}`,
            name,
            title: fd.get('asTitle') as string || '',
            signatureScope: fd.get('asScope') as string || '',
            authorityLimit: Number(fd.get('asLimit') || 0),
            jointSignatureRequired: fd.get('asJoint') === 'true',
            authorizedUntil: fd.get('asUntil') as string || ''
        };

        setCompanies(prev => prev.map(c => {
            if (c.id === selectedCompanyId) {
                const currentList = c.authorizedSignatories || [];
                const updatedList = editingSignatory
                    ? currentList.map(s => s.id === editingSignatory.id ? sigObj : s)
                    : [...currentList, sigObj];
                return { ...c, authorizedSignatories: updatedList };
            }
            return c;
        }));

        setIsSignatoryModalOpen(false);
        setEditingSignatory(null);
        addToast({ type: 'success', title: lang === 'ar' ? 'تم الحفظ' : 'Saved', message: lang === 'ar' ? 'تم إدراج صلاحيات المخولين بالتوقيع بملف الشركة' : 'Signators updated.' });
    };

    const handleDeleteSignatory = (id: string) => {
        if (confirm(lang === 'ar' ? 'إسقاط صلاحية التوقيع للمفوض؟' : 'Remove signatory credentials?')) {
            setCompanies(prev => prev.map(c => {
                if (c.id === selectedCompanyId) {
                    return { ...c, authorizedSignatories: (c.authorizedSignatories || []).filter(s => s.id !== id) };
                }
                return c;
            }));
            addToast({ type: 'info', title: lang === 'ar' ? 'تم الإلغاء' : 'Canceled', message: lang === 'ar' ? 'تم إسقاط صلاحية التوقيع بالملفات' : 'Signatory credentials revoked.' });
        }
    };

    // 5. Assemblies & Board Meetings
    const handleSaveMeetingObj = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const type = fd.get('meetType') as CompanyMeetingType;
        const date = fd.get('meetDate') as string;
        if (!type || !date) return;

        const meetObj: CompanyMeeting = {
            id: editingMeeting?.id || `meet-${Date.now()}`,
            meetingType: type,
            meetingDate: date,
            meetingTime: fd.get('meetTime') as string || '10:00',
            meetingLocation: fd.get('meetLocation') as string || '',
            attendees: (fd.get('meetAttendees') as string)?.split(',').map(x => x.trim()) || [],
            agendaItems: fd.get('meetAgenda') as string || '',
            resolutionsPassed: fd.get('meetResolutions') as string || '',
            minutesDocumentId: fd.get('meetDocId') as string || ''
        };

        if (editingMeeting) {
            setMeetings(prev => prev.map(m => m.id === editingMeeting.id ? meetObj : m));
        } else {
            setMeetings(prev => [meetObj, ...prev]);

            // Add events to history timeline
            setTimeline(prev => [
                {
                    id: `time-${Date.now()}`,
                    companyId: selectedCompanyId,
                    titleAr: `انعقاد ${type}`,
                    titleEn: `${type} Convened`,
                    descriptionAr: `تم توثيق محضر وقرارات الاجتماع بتاريخ ${date}.`,
                    descriptionEn: `Official resolutions and minutes recorded on the workspace timeline.`,
                    date: date,
                    type: 'meeting'
                },
                ...prev
            ]);
        }

        setIsMeetingModalOpen(false);
        setEditingMeeting(null);
        addToast({ type: 'success', title: lang === 'ar' ? 'تم التدوين' : 'Meeting Saved', message: lang === 'ar' ? 'تم تسجيل محضر وقرارات الجلسة بنجاح' : 'Success.' });
    };

    const handleDeleteMeeting = (id: string) => {
        if (confirm(lang === 'ar' ? 'حذف سجل الاجتماع الموقر ومحاضر الجلسات؟' : 'Delete meeting minutes?')) {
            setMeetings(prev => prev.filter(m => m.id !== id));
            addToast({ type: 'error', title: lang === 'ar' ? 'تم الحذف' : 'Deleted', message: lang === 'ar' ? 'تم محو اجتماع وجدول الحوكمة الخاص به' : 'Deleted successfully.' });
        }
    };

    // 6. Corporate Actions
    const handleSaveActionObj = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const type = fd.get('actType') as CorporateActionType;
        const desc = fd.get('actDesc') as string;
        if (!type || !desc) return;

        const actObj: CorporateAction = {
            id: editingAction?.id || `act-${Date.now()}`,
            actionType: type,
            description: desc,
            actionDate: fd.get('actDate') as string || new Date().toISOString().split('T')[0],
            status: fd.get('actStatus') as CorporateActionStatus,
            details: fd.get('actDetails') as string || '',
            relatedDocumentsIds: editingAction?.relatedDocumentsIds || []
        };

        if (editingAction) {
            setActions(prev => prev.map(a => a.id === editingAction.id ? actObj : a));
        } else {
            setActions(prev => [actObj, ...prev]);

            // Write into timeline
            setTimeline(prev => [
                {
                    id: `time-${Date.now()}`,
                    companyId: selectedCompanyId,
                    titleAr: `بدء إجراء: ${type}`,
                    titleEn: `Initiated corporate action: ${type}`,
                    descriptionAr: desc,
                    descriptionEn: desc,
                    date: actObj.actionDate,
                    type: 'action'
                },
                ...prev
            ]);
        }

        setIsActionModalOpen(false);
        setEditingAction(null);
        addToast({ type: 'success', title: lang === 'ar' ? 'تم التوثيق' : 'Saved', message: lang === 'ar' ? 'تم حفظ القرار أو التعديل القانوني' : 'Action updated.' });
    };

    const handleDeleteAction = (id: string) => {
        if (confirm(lang === 'ar' ? 'حذف هذا الإجراء القانوني المعمل به؟' : 'Remove this corporate action?')) {
            setActions(prev => prev.filter(a => a.id !== id));
            addToast({ type: 'error', title: lang === 'ar' ? 'تم الحذف' : 'Deleted', message: lang === 'ar' ? 'تم التخلص من الإجراء المسجل بنجاح' : 'Success.' });
        }
    };

    // 7. General Legal Documents Repo
    const handleSaveDocObj = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const title = fd.get('docTitle') as string;
        const type = fd.get('docType') as CompanyDocumentType;
        if (!title || !type) return;

        const docObj: CompanyDocument = {
            id: editingDoc?.id || `doc-${Date.now()}`,
            title,
            documentType: type,
            documentDate: fd.get('docDate') as string || new Date().toISOString().split('T')[0],
            status: fd.get('docStatus') as CompanyDocumentStatus,
            keywords: (fd.get('docKeywords') as string)?.split(',').map(x => x.trim()) || [],
            notes: fd.get('docNotes') as string || '',
            createdAt: editingDoc?.createdAt || new Date().toISOString().split('T')[0]
        };

        if (editingDoc) {
            setDocuments(prev => prev.map(d => d.id === editingDoc.id ? docObj : d));
        } else {
            setDocuments(prev => [docObj, ...prev]);

            setTimeline(prev => [
                {
                    id: `time-${Date.now()}`,
                    companyId: selectedCompanyId,
                    titleAr: `أرشفة مستند: ${title}`,
                    titleEn: `Archived document: ${title}`,
                    descriptionAr: `تم إدراج مستند قانوني مصنف بملف التراخيص.`,
                    descriptionEn: `A legal document classified under operational licensing was uploaded.`,
                    date: docObj.documentDate,
                    type: 'document'
                },
                ...prev
            ]);
        }

        setIsDocModalOpen(false);
        setEditingDoc(null);
        addToast({ type: 'success', title: lang === 'ar' ? 'تم الأرشفة' : 'Archived', message: lang === 'ar' ? 'تم إيداع الوثيقة بنجاح بخزنة الشركة' : 'Document registered.' });
    };

    const handleDeleteDoc = (id: string) => {
        if (confirm(lang === 'ar' ? 'هل تود حذف المستند المختار كلياً؟' : 'Delete document permanently?')) {
            setDocuments(prev => prev.filter(d => d.id !== id));
            addToast({ type: 'error', title: lang === 'ar' ? 'تم الحذف' : 'Erased', message: lang === 'ar' ? 'تم محو الوثيقة من السجلات الرقمية' : 'Erased.' });
        }
    };

    // Simulated Drag Over File Drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => {
        setDragging(false);
    };

    const handleDropFile = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        const files = e.dataTransfer.files;
        if (!files.length) return;

        const file = files[0];
        // Create an automatic document record safely
        const newDoc: CompanyDocument = {
            id: `doc-${Date.now()}`,
            title: `ملف مرفق: ${file.name}`,
            documentType: CompanyDocumentType.OTHER,
            documentDate: new Date().toISOString().split('T')[0],
            status: CompanyDocumentStatus.ACTIVE,
            keywords: ['مرفوع باليد', file.name.split('.').pop() || 'file'],
            notes: `حجم الملف المرفوع: ${(file.size / (1024 * 1024)).toFixed(2)} ميجابايت`,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setDocuments(prev => [newDoc, ...prev]);
        addToast({ type: 'success', title: lang === 'ar' ? 'تم رفع الملف' : 'File Uploaded', message: `${file.name} - تم التقاطه وتدشينه بخزنة الملفات` });
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || !files.length) return;

        const file = files[0];
        const newDoc: CompanyDocument = {
            id: `doc-${Date.now()}`,
            title: `مرفق: ${file.name}`,
            documentType: CompanyDocumentType.OTHER,
            documentDate: new Date().toISOString().split('T')[0],
            status: CompanyDocumentStatus.ACTIVE,
            keywords: ['مستند موظف', file.name.split('.').pop() || 'file'],
            notes: `سعة المرفق: ${(file.size / (1024 * 1024)).toFixed(2)} ميجابايت`,
            createdAt: new Date().toISOString().split('T')[0]
        };

        setDocuments(prev => [newDoc, ...prev]);
        addToast({ type: 'success', title: lang === 'ar' ? 'تم تضمين الملف' : 'Document Bound', message: `${file.name}` });
    };

    // Reminder dismissed
    const handleDismissReminder = (id: string) => {
        setReminders(prev => prev.map(r => r.id === id ? { ...r, isRead: true } : r));
        addToast({ type: 'info', title: lang === 'ar' ? 'تم الاستبعاد' : 'Reminded Checked', message: lang === 'ar' ? 'تم غلق وتصفية التنبيه الحالي' : 'Alert finalized.' });
    };

    // --- GEMINI CO-PILOT ASSISTANT PROMPT FORMULATORS ---
    const handleTriggerCopilotPreset = async (presetType: 'minutes' | 'extraordinary' | 'resolution') => {
        setIsAiLoading(true);
        let userMsg = '';
        if (presetType === 'minutes') {
            userMsg = `يرجى صياغة محضر اجتماع مجلس إدارة نموذجي لشركة ${activeCompany?.companyNameAr} بصفتها شركة من نوع ${activeCompany?.legalForm}، وذلك للموافقة على اعتماد الميزانية الختامية السنوية وتوصية توزيع الأرباح وتحديد موعد الجمعية العمومية القادمة، مع مراعاة كافة الضوابط المتبعة لدى وزارة التجارة والصناعة بدولة الكويت.`;
        } else if (presetType === 'extraordinary') {
            userMsg = `يرجى إعداد نموذج مشروع جدول أعمال ودعوة لانعقاد الجمعية العمومية غير العادية (EGA) لشركة ${activeCompany?.companyNameAr} للمصادقة على القرار الإستراتيجي بزيادة رأس مال الشركة المرخص به من ${formatKWD(activeCompany?.capital)} د.ك إلى رأس مال مرخص ومستهدف يربو على 1.6 ضعف رأس المال الحالي وتعديل المواد ذات الصلة بعقد التأسيس.`;
        } else {
            userMsg = `يرجى صياغة قرار الشريك الوحيد أو الشركاء لشركة ${activeCompany?.companyNameAr} بالموافقة بتبديل ملكيات الحصص ونقل ملكية حصص الشريك المنسحب إلى شريك جديد متنازل له بالكامل مع الصياغة الاحترافية لباب التنازل والتوثيق المكتبي في دولة الكويت.`;
        }

        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);

        try {
            const history = chatMessages.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            }));

            const result = await geminiService.getChatbotResponse(userMsg, history);
            setChatMessages(prev => [...prev, { role: 'model', content: result }]);
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'model', content: 'نأسف، يبدو أن خادم الاستشارية الآلية يواجه عطلاً مؤقتاً. يرجى مراجعة إعدادات مفتاح API أو المحاولة لاحقاً.' }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    const handleSendCustomCopilotMessage = async () => {
        if (!chatInput.trim() || isAiLoading) return;

        const msgStr = chatInput.trim();
        setChatInput('');
        setChatMessages(prev => [...prev, { role: 'user', content: msgStr }]);
        setIsAiLoading(true);

        try {
            const context = `
                أنت خبير قانوني في شؤون ونظم حوكمة الشركات في دولة الكويت.
                الشركة الحالية النشطة:
                - الاسم (عربي): ${activeCompany?.companyNameAr}
                - الاسم (إنجليزي): ${activeCompany?.companyNameEn || 'غير مدون'}
                - الشكل القانوني: ${activeCompany?.legalForm}
                - رأس المال: ${formatKWD(activeCompany?.capital)}
                - السجل التجاري: ${activeCompany?.registrationNumber}
                
                الطلب المستهدف: ${msgStr}
            `;

            const history = chatMessages.map(m => ({
                role: m.role,
                parts: [{ text: m.content }]
            }));

            const response = await geminiService.getChatbotResponse(context, history);
            setChatMessages(prev => [...prev, { role: 'model', content: response }]);
        } catch (error) {
            setChatMessages(prev => [...prev, { role: 'model', content: 'حدث خطأ أثناء فحص البيانات من الخادم الذكي.' }]);
        } finally {
            setIsAiLoading(false);
        }
    };

    // --- GOVERNANCE RADAR VULNERABILITIES LIST ---
    const vulnerabilityList = useMemo(() => {
        const list = [
            {
                id: 'CORP-VULN-001',
                title: activeCompany?.companyNameAr || 'الملف السجلي للشركة',
                type: 'تأخر اجتماع الجمعية العمومية السنوية (AGM)',
                issue: 'مرور أكثر من 3 أشهر عمالية مالية على نهاية السنة دون جدولة أو انعقاد الجمعية العمومية للشركاء لاعتماد البيانات المالية وتوصية الأرباح، مما ينتهك المادة 134 من قانون الشركات الكويتي رقم 1/2016.',
                rec: 'أمر فوري: صياغة مسودة عاجلة لدعوة الجمعية وبنود القرار وإعلام قصر العدل ووزارة التجارة.',
                severity: 'critical'
            },
            {
                id: 'CORP-VULN-002',
                title: 'هيكل صلاحيات البنوك والمعاملات',
                type: 'أمن التواقيع وحدود الصلاحية المنفردة العالية',
                issue: 'سجل الصلاحيات الحالي يظهر تفويضاً منفرداً لبعض أفراد الإدارة والاتصال بحدود تفوق 50,000 د.ك دون اشتراط للتصديق أو التوقيع المزدوج المشترك (Dual Joint Signature) مما يعرض الشركة لمطالبات بالغة الحرج.',
                rec: 'شريعة التحوط: تعديل جدول المفوضين بوزارة التجارة لإدراج فئة المسؤولية المزدوجة المشتركة.',
                severity: 'high'
            }
        ];

        if (shareholdersSumPercent !== 100) {
            list.push({
                id: 'CORP-VULN-003',
                title: 'سلاسل التأسيس وقيد الحصص',
                type: 'عدم توازن نسب كشف الشركاء والملاك (Cap Table)',
                issue: `مجموع الحصص والنسب الموزعة للشركاء بمستند الملاك الحالي يعادل %${shareholdersSumPercent}، مما يظهر فارقاً حسابياً يعطل قيد واعتماد أي تعديل أساسي أو زيادة لرأس مال الشركة لدى وزارة التجارة (MOCI).`,
                rec: 'تصحيح عاجل: تعديل جدول الشركاء ومراجعة كاتب لضبط الأوزان النسبية وجمع الحصص لتساوي 100% تماماً.',
                severity: 'critical'
            });
        }

        return list;
    }, [activeCompany, shareholdersSumPercent]);

    // --- GOVERNANCE VULNERABILITIES DISCUSS & ACCLAIM ACTIONS ---
    const handleDiscussVulnerability = (v: any) => {
        setActiveTab('copilot');
        const q = `بصفتك مستشار حوكمة الشركات والخبير بقوانين الشركات الكويتية، أريد مناقشة المخالفة أو الثغرة القانونية التالية لشركة ${activeCompany?.companyNameAr}:
- النوع: ${v.type}
- الوصف والثغرة المرصودة: ${v.issue}
- المعالجة والتوصية: ${v.rec}
يرجى تقديم شرح مفصل للمخاطر المترتبة على هذه الثغرة بموجب قانون الشركات الكويتي رقم 1 لسنة 2016، وكيفية اتخاذ الخطوات الإجرائية اللازمة مع وزارة التجارة والصناعة (MOCI) فوراً لتجنب أي عقوبات أو وقف التراخيص أو بطلان القرارات.`;
        
        setChatMessages(prev => [...prev, { role: 'user', content: q }]);
        setIsAiLoading(true);
        
        geminiService.getChatbotResponse(q, []).then(res => {
            setChatMessages(prev => [...prev, { role: 'model', content: res }]);
        }).catch(() => {
            setChatMessages(prev => [...prev, { role: 'model', content: 'حدث خطأ أثناء فحص البيانات من مستشار الحوكمة الذكي.' }]);
        }).finally(() => {
            setIsAiLoading(false);
        });
    };

    const handleFixVulnerability = (v: any) => {
        let titleTemplate = '';
        let bodyTemplate = '';
        
        if (v.id === 'CORP-VULN-001') {
            titleTemplate = 'عقد ودعوة اجتماع الجمعية العامة العادية السنوية لتدارك مغبة التأخر';
            bodyTemplate = `بسم الله الرحمن الرحيم
دولة الكويت
بموافقة وزارة التجارة والصناعة (MOCI)

الموضوع: دعوة عاجلة لانعقاد الجمعية العامة العادية لشركة ${activeCompany?.companyNameAr || 'الشاهين العقارية ذ.م.م'}

يسر مجلس إدارة / مدير شركة ${activeCompany?.companyNameAr || 'الشاهين العقارية ذ.م.م'} دعوة السادة الشركاء الكرام لحضور اجتماع الجمعية العامة العادية المقرر انعقاده في المقر الرئيسي للشركة، وذلك لمناقشة جدول الأعمال التالي وتفادي المخالفات والجزاءات المنصوص عليها في المادة 134 من قانون الشركات الكويتي رقم 1/2016:

جدول الأعمال:
1. مناقشة تقرير الإدارة والمديرين عن نشاط الشركة وإقرار البيانات المالية للحسابات الختامية السنوية.
2. مناقشة تقرير مراقب الإيرادات والحسابات والمصادقة التامة عليه.
3. إبراء ذمة أعضاء مجلس الإدارة والمدير عن السنة المنصرمة، وتعيين أو إعادة تعيين مراقب الحسابات.

وتفضلوا بقبول فائق الاحترام والتقدير.
إمضاء واعتماد الجهة المصدرة:
........................................`;
        } else if (v.id === 'CORP-VULN-002') {
            titleTemplate = 'محضر مجلس إدارة بتقييد رخص التوقيع والاعتمادات البنكية المشتركة';
            bodyTemplate = `بسم الله الرحمن الرحيم
دولة الكويت
محضر اجتماع مجلس إدارة شركة ${activeCompany?.companyNameAr || 'الشاهين العقارية ذ.م.م'}

الموضوع: تعديل واعتماد حدود رخص التوقيع ومطابقة البنوك بنظام ثنائي مشترك

اجتمع مجلس إدارة شركة ${activeCompany?.companyNameAr || 'الشاهين العقارية ذ.م.م'} وقرر بالإجماع وتفادياً لمخاطر التواقيع الفردية المفتوحة المالي اعتماد الضوابط الرقابية التالية:
أولاً: تحديد وتأسيس فئات التوقيع على ألا يتعدى في أي حال التوقيع المالي الفردي لأي مفوض أو مدير للشركة قيمة 50,000 د.ك (خمسون ألف دينار كويتي).
ثانياً: العمليات التي تزيد قيمتها عن 50,050 د.ك تتطلب توقيعاً مشتركاً مزدوجاً (Dual Joint Signature) من الفئة الأولى أ مع أي من الشركاء أو أعضاء الإدارة الماليين المعتمدين.
ثالثاً: يفوض رئيس الجلسة بتسليم هذا القرار الموثق للبنك المركزي وكافة البنوك المحلية الفعالة لاعتماد ضوابط براءات السداد.

إمضاءات وتوقيع أعضاء مجلس الإدارت:
........................................`;
        } else {
            titleTemplate = 'قرار الشركاء بمراجعة وإعادة توزيع الأنصبة والحصص لتساوي 100%';
            bodyTemplate = `بسم الله الرحمن الرحيم
دولة الكويت
وزارة التجارة والصناعة (MOCI) - كشف قيد حصص الملاك الشركاء

الموضوع: قرار تعديل وإعادة هيكلة جدول الحصص والأنصبة لشركة ${activeCompany?.companyNameAr || 'الشاهين العقارية ذ.م.م'}

اجتمع الشركاء الملاك لشركة ${activeCompany?.companyNameAr || 'الشاهين العقارية ذ.م.م'} ذ.م.م، وقرروا بالإجماع تصحيح وإعادة معايرة قيم وأوزان كشف توزيع الحصص الرأس مالية لتطابق نسبة 100% تماماً وبصورة تضمن حماية السجلات الرسمية كالتالي:
- الشريك الأول: نسبة ملكية عادلة وموازية تعادل 60% من إجمالي رأس المال المكتتب به.
- الشريك الثاني: نسبة ملكية عادلة وموازية تعادل 40% من إجمالي رأس المال المكتتب به.
- المجموع الإجمالي: يعادل نسبة 100% مطابقة تامة تامة ومؤكدة لسجلات السجل التجاري المعتمد بوزارة التجارة.

يفوض الشركاء الممثل القانوني للشركة بتسجيل الملحق بالتنسيق مع كاتب العدل.

توقيعات الشركاء والمدير المسؤول:
........................................`;
        }
        
        setDocTitle(titleTemplate);
        setDocContent(bodyTemplate);
        setActiveTab('editor');
        addToast({ type: 'success', title: 'تم فتح المسودة بالمحرر القانوني', message: 'المستند جاهز الآن للتعديل المباشر في تبويب المحرر وتصديره فوراً.' });
    };

    // Exporters for document editor (HTML-based downloads & trigger prints)
    const handleExportDoc = (formatType: 'pdf' | 'doc' | 'xls') => {
        if (formatType === 'doc') {
            const htmlContent = `
                <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
                <head><meta charset="utf-8"><title>${docTitle}</title></head>
                <body style="direction: rtl; font-family: Arial, sans-serif; padding: 25px; line-height: 1.6;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2>دولة الكويت</h2>
                        <h3>نموذج صادر من نظام حوكمة شؤون الشركات وقصر العدل الذكي</h3>
                    </div>
                    <hr style="border: 2px solid #4f46e5;"/>
                    <h2 style="color: #4f46e5; text-align: center; margin-top: 20px;">${docTitle}</h2>
                    <br/>
                    <p style="white-space: pre-wrap; font-size: 14px; text-align: right;">${docContent}</p>
                    <br/>
                    <hr/>
                    <p style="text-align: center; font-size: 10px; color: #888;">تم التوليد والصياغة بمطابقة أوتوماتيكية للفرائض وقوانين الشركات الكويتية عبر منظومة عدالة الممتثلة</p>
                </body>
                </html>
            `;
            const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${docTitle}.doc`;
            link.click();
            addToast({ type: 'success', title: 'تصدير مستند Word', message: 'بدأ تحميل الملف بصيغة صالحة للتعديل المباشر.' });
        } else if (formatType === 'xls') {
            const rows = [
                ["المستند وصنف الحوكمة القانونية", docTitle],
                ["المنشأة والشركة المستهدفة", activeCompany?.companyNameAr || 'الشاهين العقارية ذ.م.م'],
                ["تاريخ تدوين وتعمير المعاملة", new Date().toLocaleDateString('ar-KW')],
                ["محتويات ومسودة السند المصدق", docContent]
            ];
            const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
                + rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(",")).join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${docTitle}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            addToast({ type: 'success', title: 'تصدير جدول البيانات الإحصائية', message: 'تم تحميل ملف البيانات بصيغة CSV المتوافقة مع Excel.' });
        } else if (formatType === 'pdf') {
            window.print();
        }
    };

    // Filter systems depending on query
    const filteredCompaniesList = useMemo(() => {
        return companies.filter(c => {
            const matchesArchived = showArchivedCompanies ? c.archived === true : c.archived !== true;
            const matchesLegalForm = filterLegalForm === 'ALL' || c.legalForm === filterLegalForm;
            const matchesSearch = !searchQuery ||
                c.companyNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (c.companyNameEn && c.companyNameEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
                c.registrationNumber.includes(searchQuery);

            return matchesArchived && matchesLegalForm && matchesSearch;
        });
    }, [companies, showArchivedCompanies, filterLegalForm, searchQuery]);

    const activeCompanyMeetings = useMemo(() => {
        // Since mockMeetings don't store companyId directly (the original stub model assumed one company workspace),
        // we associate general meetings to active layout dynamically, or filter based on query.
        return meetings.filter(m => {
            if (searchQuery) {
                return m.meetingType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (m.agendaItems && m.agendaItems.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (m.resolutionsPassed && m.resolutionsPassed.toLowerCase().includes(searchQuery.toLowerCase()));
            }
            return true;
        });
    }, [meetings, searchQuery]);

    const activeCompanyActions = useMemo(() => {
        return actions.filter(a => {
            if (searchQuery) {
                return a.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    a.description.toLowerCase().includes(searchQuery.toLowerCase());
            }
            return true;
        });
    }, [actions, searchQuery]);

    const activeCompanyDocs = useMemo(() => {
        return documents.filter(d => {
            if (searchQuery) {
                return d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (d.notes && d.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (d.keywords && d.keywords.some(k => k.toLowerCase().includes(searchQuery.toLowerCase())));
            }
            return true;
        });
    }, [documents, searchQuery]);

    const activeTimeline = useMemo(() => {
        return timeline.filter(t => t.companyId === selectedCompanyId);
    }, [timeline, selectedCompanyId]);

    return (
        <div className="space-y-6 pt-5 pb-12 px-2 md:px-6 relative text-slate-800 dark:text-neutral-light min-h-screen">
            {/* Printing Header Decoration */}
            <div className="hidden print:block">
                <PrintHeader title={activeCompany?.companyNameAr || tLocal.title} subtitle={tLocal.subtitle} />
            </div>

            {/* Section Title Header & Language Toggle */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5 no-print">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black tracking-tight text-primary flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-primary" />
                        <span>{tLocal.title}</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">{tLocal.subtitle}</p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-center">
                    {/* Expirations and Reminders Bell Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowNotificationList(!showNotificationList)}
                            className="relative p-3 rounded-full bg-white dark:bg-dm-card hover:bg-neutral-light dark:hover:bg-slate-800 transition-all border border-gray-100 dark:border-gray-800 shadow-md flex items-center justify-center cursor-pointer"
                        >
                            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                            {activeCompanyReminders.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                                    {activeCompanyReminders.length}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {showNotificationList && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute left-0 mt-3 w-80 md:w-96 bg-white dark:bg-dm-card border border-neutral-light border-opacity-10 rounded-2xl shadow-xl z-50 p-4 max-h-96 overflow-y-auto"
                                >
                                    <div className="flex justify-between items-center pb-2 border-b">
                                        <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                            <span>{tLocal.remindersTitle}</span>
                                        </h3>
                                        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full font-bold">
                                            {activeCompanyReminders.length} {lang === 'ar' ? 'تنبيه' : 'Alerts'}
                                        </span>
                                    </div>

                                    <div className="mt-3 space-y-2.5">
                                        {activeCompanyReminders.length ? (
                                            activeCompanyReminders.map(rem => (
                                                <div key={rem.id} className="p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 bg-amber-500/5 text-xs relative group">
                                                    <div className="flex justify-between font-black text-amber-800 dark:text-amber-400 mb-1">
                                                        <span>{lang === 'ar' ? rem.titleAr : rem.titleEn}</span>
                                                        <span className="text-[9px] bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded text-neutral-dark">
                                                            {formatDateString(rem.dueDate)}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                                                        {lang === 'ar' ? rem.messageAr : rem.messageEn}
                                                    </p>
                                                    <button
                                                        onClick={() => handleDismissReminder(rem.id)}
                                                        className="mt-2 text-[10px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                                                    >
                                                        <CheckCircle className="w-3 h-3" />
                                                        <span>{lang === 'ar' ? 'تعليم كمقروء' : 'Mark as Read'}</span>
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-center py-6 text-slate-400 text-xs">{tLocal.noReminders}</p>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Button
                        variant="ghost"
                        onClick={() => i18n.changeLanguage(lang === 'ar' ? 'en' : 'ar')}
                        className="py-2.5 px-3 rounded-full hover:bg-neutral-light dark:hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                        <Globe className="w-5 h-5 text-gray-500" />
                        <span className="text-xs font-black">{lang === 'ar' ? 'English' : 'العربية'}</span>
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => { setEditingCompany(null); setIsCompanyModalOpen(true); }}
                        className="font-black text-xs py-3 px-5 rounded-full flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{tLocal.addCompany}</span>
                    </Button>
                </div>
            </header>

            {/* Active Company Workspace Selector & Quick AI Bar */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
                <div className="lg:col-span-8">
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-gradient-to-r from-[#032B24] via-[#134D41] to-[#00796B] p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-[1.7rem] bg-white/10 text-amber-300 flex items-center justify-center font-black shadow-lg border border-white/20 backdrop-blur-md">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black uppercase text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
                                            {tLocal.activeCompany}
                                        </span>
                                        <span className="text-[10px] font-black text-emerald-200 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
                                            96% {lang === 'ar' ? 'درجة الامتثال' : 'Compliance Rate'}
                                        </span>
                                    </div>
                                    <h2 className="text-lg md:text-xl font-black mt-2 text-white">
                                        {lang === 'ar' ? activeCompany?.companyNameAr : (activeCompany?.companyNameEn || activeCompany?.companyNameAr)}
                                    </h2>
                                    <p className="text-xs text-slate-200/80 mt-1 flex flex-wrap items-center gap-2 font-medium">
                                        <span>{activeCompany?.legalForm}</span> • 
                                        <span>{tLocal.regNumber}: <span className="font-mono text-amber-300 font-bold">{activeCompany?.registrationNumber}</span></span> • 
                                        <span>الترخيص: <span className="font-mono text-emerald-200 font-bold">{activeCompany?.tradeLicenseNumber || '987654/MOCI'}</span></span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] text-slate-300 font-bold">{tLocal.changeCompany}</span>
                                    <select
                                        value={selectedCompanyId}
                                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                                        className="mt-1 block w-48 md:w-56 bg-white/10 dark:bg-slate-900 border border-white/20 py-1.5 px-3 rounded-full text-xs font-black focus:outline-none focus:ring-2 focus:ring-amber-400 text-white cursor-pointer"
                                    >
                                        {companies.map(c => (
                                            <option key={c.id} value={c.id} className="text-slate-900 bg-white">
                                                {lang === 'ar' ? c.companyNameAr : (c.companyNameEn || c.companyNameAr)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Button
                                    variant="ghost"
                                    onClick={() => { setEditingCompany(activeCompany); setIsCompanyModalOpen(true); }}
                                    className="p-3 hover:bg-white/10 text-white rounded-full mt-4 flex items-center justify-center cursor-pointer border border-white/20"
                                >
                                    <Edit3 className="w-4 h-4 text-amber-300" />
                                </Button>
                            </div>
                        </div>

                        {/* Quick Prompt Input Bar for Contract/Governance Analysis */}
                        <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2">
                            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                                <Sparkles className="w-4 h-4 animate-pulse" />
                            </div>
                            <input
                                type="text"
                                placeholder={lang === 'ar' ? "فحص سريع لعقد تأسيس، نقل حصص، أو كشف ثغرة حوكمة بالذكاء الاصطناعي..." : "Quick AI analysis for articles of association, share transfers, or governance gap..."}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                        const promptVal = e.currentTarget.value.trim();
                                        e.currentTarget.value = '';
                                        setActiveTab('copilot');
                                        setChatInput(promptVal);
                                        setTimeout(() => {
                                            handleSendCustomCopilotMessage();
                                        }, 100);
                                    }
                                }}
                                className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs text-white placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                            <button
                                onClick={() => setActiveTab('copilot')}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-full transition-all shadow-md cursor-pointer whitespace-nowrap"
                            >
                                {lang === 'ar' ? 'استشارة الـ AI' : 'Consult AI'}
                            </button>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4">
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-[#0F2027] dark:bg-dm-card p-6 text-white overflow-hidden relative group border border-amber-500/20">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] uppercase tracking-wider font-black text-amber-400">{tLocal.complianceStatus}</span>
                                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                                    معتمد - MOCI & CMA
                                </span>
                            </div>
                            <div className="flex items-center gap-2.5 mt-3">
                                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                <div>
                                    <p className="text-xl font-black text-white">96% (درجة حوكمة AAA)</p>
                                    <p className="text-[10px] text-slate-300 mt-0.5">مطابق لقرارات وزارة التجارة وهيئة أسواق المال</p>
                                </div>
                            </div>
                            <div className="mt-5 flex justify-between items-center text-right border-t border-slate-800 pt-3">
                                <span className="text-[10px] text-slate-400 font-bold">المقر: مكتب المحامي صبري شطا</span>
                                <button
                                    onClick={() => setShowArchivedCompanies(!showArchivedCompanies)}
                                    className="text-[10px] font-black text-amber-300 underline hover:text-amber-200 cursor-pointer"
                                >
                                    {showArchivedCompanies ? (lang === 'ar' ? 'عرض النشطة' : 'Show Active') : (lang === 'ar' ? 'إظهار الملفات المؤرشفة' : 'Show Archived')}
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>

            {/* Interactive Tab Navigation */}
            <nav className="flex items-center border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-print">
                {[
                    { key: 'dashboard', label: tLocal.tabDashboard, icon: Building2 },
                    { key: 'resolutions_generator', label: lang === 'ar' ? 'مولد القرارات والجمعيات العمومية' : 'Resolutions Generator', icon: BookMarked },
                    { key: 'reports', label: tLocal.tabReports, icon: FileSpreadsheet },
                    { key: 'copilot', label: tLocal.tabCopilot, icon: Sparkles },
                    { key: 'editor', label: tLocal.tabEditor, icon: FileText },
                    { key: 'timeline', label: tLocal.tabTimeline, icon: History }
                ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveTab(tab.key); setSearchQuery(''); }}
                            className={`flex items-center gap-2 py-4 px-5 border-b-2 font-black text-xs whitespace-nowrap transition-all cursor-pointer ${
                                isActive 
                                ? 'border-primary text-primary bg-primary/5 rounded-t-xl' 
                                : 'border-transparent text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <Icon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </nav>

            {/* SEARCH AND FILTERS */}
            {activeTab === 'dashboard' && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 no-print border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute right-3.5 top-3 w-4.5 h-4.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder={tLocal.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-10 pl-4 py-2.5 bg-white dark:bg-dm-card border border-neutral-light border-opacity-30 rounded-full text-xs focus:ring-2 focus:ring-primary focus:outline-none text-slate-800 dark:text-neutral-light"
                        />
                    </div>

                    <div className="flex items-center gap-2 self-stretch md:self-auto justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Filter className="w-4 h-4" />
                            <span>{lang === 'ar' ? 'عرض كـ:' : 'View:'}</span>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full flex gap-1">
                            <button
                                onClick={() => setViewMode('card')}
                                className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer ${viewMode === 'card' ? 'bg-white dark:bg-dm-card text-primary shadow' : 'text-slate-400'}`}
                            >
                                {lang === 'ar' ? 'بطاقات' : 'Cards'}
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer ${viewMode === 'table' ? 'bg-white dark:bg-dm-card text-primary shadow' : 'text-slate-400'}`}
                            >
                                {lang === 'ar' ? 'جداول' : 'Table'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT AREA */}
            <main className="min-h-96">
                
                {/* Dashboard Specific Elements */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6 mb-8 no-print">
                        {/* 1. Bento Statistics Cards & Circular Compliance Gauge */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            
                            {/* Circular Compliance Progress Gauge */}
                            <Card className="rounded-[2.5rem] p-6 bg-white dark:bg-dm-card border-none shadow-xl flex flex-col items-center justify-center text-center">
                                <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full mb-3">
                                    {lang === 'ar' ? 'مؤشر أمان الشركة' : 'Company Safety Indicator'}
                                </span>
                                <div className="relative w-28 h-28 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle 
                                            cx="56" 
                                            cy="56" 
                                            r="48" 
                                            className="stroke-slate-100 dark:stroke-slate-800" 
                                            strokeWidth="10" 
                                            fill="transparent" 
                                        />
                                        <circle 
                                            cx="56" 
                                            cy="56" 
                                            r="48" 
                                            className="stroke-primary" 
                                            strokeWidth="10" 
                                            fill="transparent" 
                                            strokeDasharray={2 * Math.PI * 48}
                                            strokeDashoffset={2 * Math.PI * 48 * (1 - (shareholdersSumPercent === 100 ? 0.94 : 0.72))}
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute text-center">
                                        <span className="text-2xl font-black text-slate-800 dark:text-white">
                                            {shareholdersSumPercent === 100 ? '94%' : '72%'}
                                        </span>
                                        <span className="text-[9px] text-slate-400 block font-bold">
                                            {shareholdersSumPercent === 100 ? (lang === 'ar' ? 'امتثال تام' : 'Strong Safe') : (lang === 'ar' ? 'ثغرات معلقة' : 'Action Required')}
                                        </span>
                                    </div>
                                </div>
                            </Card>

                            {/* Total Capitalization Card */}
                            <Card className="rounded-[2.5rem] p-6 bg-white dark:bg-dm-card border-none shadow-xl flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold block">{tLocal.capital}</span>
                                        <p className="text-xl font-black mt-2 text-slate-800 dark:text-white">{formatKWD(activeCompany?.capital)}</p>
                                    </div>
                                    <div className="p-3.5 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl text-primary">
                                        <Coins className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-4">
                                    {lang === 'ar' ? 'رأس المال المدفوع بالكامل المقيد رسمياً' : 'Official paid-up registered equity'}
                                </p>
                            </Card>

                            {/* Total Partners Card */}
                            <Card className="rounded-[2.5rem] p-6 bg-white dark:bg-dm-card border-none shadow-xl flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold block">{lang === 'ar' ? 'عدد الشركاء الملاك' : 'Shareholders'}</span>
                                        <p className="text-2xl font-black mt-2 text-slate-800 dark:text-white">{activeCompany?.shareholders?.length || 0}</p>
                                    </div>
                                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl text-emerald-600">
                                        <Users className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-emerald-500 font-bold mt-4">
                                    {lang === 'ar' ? `مجموع ملكية الحصص: ${shareholdersSumPercent}%` : `Equity total matching: ${shareholdersSumPercent}%`}
                                </p>
                            </Card>

                            {/* Boards & Signatories info */}
                            <Card className="rounded-[2.5rem] p-6 bg-white dark:bg-dm-card border-none shadow-xl flex flex-col justify-between">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[10px] text-slate-400 font-bold block">{lang === 'ar' ? 'إداريون ومفوضون بالتوقيع' : 'Boards & Signatories'}</span>
                                        <p className="text-2xl font-black mt-2 text-slate-800 dark:text-white">
                                            {(activeCompany?.boardMembers?.length || 0) + (activeCompany?.authorizedSignatories?.length || 0)}
                                        </p>
                                    </div>
                                    <div className="p-3.5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl text-amber-600">
                                        <ShieldCheck className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-4">
                                    {lang === 'ar' ? `تحديث التراخيص: ${activeCompany?.tradeLicenseNumber ? 'ساري وصالح' : 'غير مكتمل'}` : 'All business trade licenses verified'}
                                </p>
                            </Card>

                        </div>

                        {/* 2. Kuwait Corporate Governance & Loophole Radar table */}
                        <Card className="rounded-[2.5rem] p-6 bg-white dark:bg-dm-card border-none shadow-xl">
                            <div className="flex items-center justify-between border-b pb-4 mb-4">
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                                        <span>{lang === 'ar' ? 'مرصد الامتثال والثغرات القانونية النشطة' : 'Governance Gaps & Compliance Evaluation'}</span>
                                    </h3>
                                    <p className="text-xs text-slate-400 mt-1">
                                        {lang === 'ar' ? 'تحديد المخالفات الرقابية بموجب قانون الشركات الكويتي وإجراء المعالجات فحصاً واقتراحاً' : 'Automated tracking of regulatory loopholes with instant corrective models'}
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-800 text-slate-400 font-bold">
                                            <th className="py-3 px-4">{lang === 'ar' ? 'تصنيف الثغرة' : 'Gap Category'}</th>
                                            <th className="py-3 px-4">{lang === 'ar' ? 'الوصف والنص الحرج' : 'Issue Description'}</th>
                                            <th className="py-3 px-4">{lang === 'ar' ? 'المعالجة المعتمدة' : 'Corrective Action'}</th>
                                            <th className="py-3 px-4 text-center">{lang === 'ar' ? 'حالة المخاطر' : 'Risk Severity'}</th>
                                            <th className="py-3 px-4 text-left">{lang === 'ar' ? 'الإجراء الذكي' : 'Smart Remediation'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800/40">
                                        {vulnerabilityList.map(v => (
                                            <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                                                <td className="py-4 px-4 font-black text-slate-800 dark:text-neutral-light">
                                                    {v.type}
                                                </td>
                                                <td className="py-4 px-4 text-slate-500 max-w-xs leading-relaxed">
                                                    {v.issue}
                                                </td>
                                                <td className="py-4 px-4 text-indigo-600 dark:text-indigo-400 font-bold max-w-xs">
                                                    {v.rec}
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black ${
                                                        v.severity === 'critical' ? 'bg-red-50 dark:bg-red-950/20 text-red-600' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'
                                                    }`}>
                                                        {v.severity === 'critical' ? (lang === 'ar' ? 'خطير جداً' : 'Critical') : (lang === 'ar' ? 'متوسط الأهمية' : 'High Alert')}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex gap-2 justify-end">
                                                        <Button 
                                                            size="sm" 
                                                            variant="secondary" 
                                                            onClick={() => handleDiscussVulnerability(v)}
                                                            className="flex items-center gap-1 text-[10px] py-1.5 px-3 rounded-full hover:bg-primary hover:text-white cursor-pointer"
                                                        >
                                                            <Sparkles className="w-3 h-3" />
                                                            <span>{lang === 'ar' ? 'استقصاء ومناقشة' : 'Discuss'}</span>
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="primary" 
                                                            onClick={() => handleFixVulnerability(v)}
                                                            className="flex items-center gap-1 text-[10px] py-1.5 px-3 rounded-full cursor-pointer"
                                                        >
                                                            <FileCheck className="w-3 h-3" />
                                                            <span>{lang === 'ar' ? 'إصلاح فوري دقيق' : 'Auto Remedy'}</span>
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* 3. Re-introduced Secondary Sub-tabs workspace controller pills bar */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 no-print border-b border-gray-200 dark:border-gray-800 pb-3 mb-2">
                            <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
                            <span>{lang === 'ar' ? 'تنقل في ملفات وقرارات الشركة النشطة:' : 'Navigate active workspace records:'}</span>
                        </div>
                        <div className="no-print flex overflow-x-auto gap-2 bg-slate-50 dark:bg-slate-850/10 p-2 rounded-[2rem] border border-gray-150 dark:border-gray-800">
                            {[
                                { key: 'profile', label: tLocal.tabProfile },
                                { key: 'structure', label: tLocal.tabStructure },
                                { key: 'board', label: tLocal.tabBoard },
                                { key: 'signatories', label: tLocal.tabSignatories },
                                { key: 'meetings', label: tLocal.tabMeetings },
                                { key: 'actions', label: tLocal.tabActions },
                                { key: 'documents', label: tLocal.tabDocuments }
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setDashboardSubTab(tab.key)}
                                    className={`px-5 py-2.5 text-[11px] font-black rounded-full whitespace-nowrap cursor-pointer transition-all ${
                                        dashboardSubTab === tab.key 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/30'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                    </div>
                )}

                {/* 1. Profile Tab */}
                {activeTab === 'dashboard' && dashboardSubTab === 'profile' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-2 rounded-3xl p-6 bg-white dark:bg-dm-card border-none shadow-lg">
                                <div className="flex justify-between border-b pb-4 mb-4">
                                    <h3 className="font-black text-slate-900 dark:text-white text-base">
                                        {lang === 'ar' ? 'المعلومات السجلية والمصادرات' : 'Registry Records'}
                                    </h3>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="ghost" className="rounded-xl" onClick={handlePrintWorkspace}>
                                            <Printer className="w-4 h-4 text-gray-500" />
                                        </Button>
                                        <Button size="sm" variant="secondary" className="font-black" onClick={() => { setEditingCompany(activeCompany); setIsCompanyModalOpen(true); }}>
                                            {tLocal.editCompany}
                                        </Button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                        <span className="text-slate-400">{tLocal.companyNameAr}</span>
                                        <p className="font-black mt-1 text-slate-800 dark:text-white">{activeCompany?.companyNameAr || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                        <span className="text-slate-400">{tLocal.companyNameEn}</span>
                                        <p className="font-black mt-1 text-indigo-600 dark:text-indigo-400">{activeCompany?.companyNameEn || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                        <span className="text-slate-400">{tLocal.legalForm}</span>
                                        <p className="font-bold mt-1 text-slate-800 dark:text-white">{activeCompany?.legalForm || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                        <span className="text-slate-400">{tLocal.estDate}</span>
                                        <p className="font-medium mt-1 text-slate-800 dark:text-white">{formatDateString(activeCompany?.establishmentDate)}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                        <span className="text-slate-400">{tLocal.regNumber}</span>
                                        <p className="font-mono mt-1 text-slate-800 dark:text-white">{activeCompany?.registrationNumber || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                        <span className="text-slate-400">{tLocal.licenseNumber}</span>
                                        <p className="font-mono mt-1 text-slate-800 dark:text-white">{activeCompany?.tradeLicenseNumber || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                        <span className="text-slate-400">{tLocal.chamberNumber}</span>
                                        <p className="font-mono mt-1 text-slate-800 dark:text-white">{activeCompany?.chamberOfCommerceNumber || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                        <span className="text-slate-400">{tLocal.auditor}</span>
                                        <p className="font-serif mt-1 text-slate-800 dark:text-white">{activeCompany?.auditorName || '-'}</p>
                                    </div>
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl md:col-span-2">
                                        <span className="text-slate-400">{tLocal.address}</span>
                                        <p className="font-medium mt-1 text-slate-800 dark:text-white">{activeCompany?.headOfficeAddress || '-'}</p>
                                    </div>
                                </div>
                            </Card>

                            <Card className="rounded-3xl p-6 bg-white dark:bg-dm-card border-none shadow-lg">
                                <h3 className="font-black text-slate-900 dark:text-white text-sm border-b pb-3 mb-4">
                                    {lang === 'ar' ? 'المؤشرات رأس المال والاتصال' : 'Capitalization Details'}
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center bg-indigo-500/5 p-4 rounded-2xl">
                                        <div>
                                            <span className="text-slate-400 text-[10px] font-bold block">{tLocal.capital}</span>
                                            <p className="text-lg font-black text-slate-900 dark:text-white">{formatKWD(activeCompany?.capital)}</p>
                                        </div>
                                        <Coins className="w-8 h-8 text-primary" />
                                    </div>

                                    <div className="flex justify-between items-center bg-emerald-500/5 p-4 rounded-2xl">
                                        <div>
                                            <span className="text-slate-400 text-[10px] font-bold block">{tLocal.paidCapital}</span>
                                            <p className="text-lg font-black text-slate-900 dark:text-white">{formatKWD(activeCompany?.paidUpCapital)}</p>
                                        </div>
                                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                                    </div>

                                    <div className="space-y-2 text-xs pt-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">{tLocal.phone}:</span>
                                            <span className="font-bold">{activeCompany?.contactInfo?.phone || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">{tLocal.email}:</span>
                                            <span className="font-bold hover:underline">{activeCompany?.contactInfo?.email || '-'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">{tLocal.website}:</span>
                                            <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeCompany?.contactInfo?.website || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* 2. Shareholders & Partner List Tab */}
                {activeTab === 'dashboard' && dashboardSubTab === 'structure' && (
                    <div className="space-y-6">
                        {shareholdersSumPercent !== 100 && (
                            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-200 text-amber-800 dark:text-amber-400 flex items-center gap-3 text-xs">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                <div>
                                    <p className="font-black">{tLocal.validationCapitalMatch}</p>
                                    <p>{lang === 'ar' ? `المجموع الفعلي للملاك المقيدين: %${shareholdersSumPercent}` : `Summed recorded equity percentage: ${shareholdersSumPercent}%`}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm">{lang === 'ar' ? 'سجل توزيع الحصص والشركاء' : 'Equity Structure Table'}</h3>
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" className="font-black" onClick={() => handleExportCSV(activeCompany?.shareholders || [], activeCompany?.companyNameAr + "_shareholders")}>
                                    {tLocal.exportToCsv}
                                </Button>
                                <Button variant="primary" size="sm" className="font-black" onClick={() => { setEditingShareholder(null); setIsShareholderModalOpen(true); }} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                                    {lang === 'ar' ? 'إدخال شريك / مساهم جديد' : 'Add Shareholder'}
                                </Button>
                            </div>
                        </div>

                        {viewMode === 'card' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {activeCompany?.shareholders?.map(sh => (
                                    <Card key={sh.id} className="bg-white dark:bg-dm-card p-5 rounded-[2rem] border-none shadow-md hover:scale-[1.01] transition-transform">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-primary font-black">
                                                    {sh.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-sm text-slate-900 dark:text-white leading-tight">{sh.name}</h4>
                                                    <span className="text-[10px] text-slate-400">{sh.nationality}</span>
                                                </div>
                                            </div>
                                            <span className="bg-primary/10 text-primary text-xs font-black px-2.5 py-1 rounded-full border border-primary/20">
                                                {sh.sharePercentage}%
                                            </span>
                                        </div>

                                        <div className="mt-4 grid grid-cols-2 gap-3 text-xs pt-4 border-t">
                                            <div>
                                                <span className="text-slate-400 block">{tLocal.civilId}</span>
                                                <p className="font-bold">{sh.civilIdOrRegNumber || '-'}</p>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block">{tLocal.numberOfShares}</span>
                                                <p className="font-mono font-black">{sh.numberOfShares.toLocaleString()}</p>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block">{tLocal.shareClass}</span>
                                                <p className="font-medium text-indigo-600 dark:text-indigo-400">{sh.shareClass}</p>
                                            </div>
                                            <div>
                                                <span className="text-slate-400 block">{tLocal.votingRights}</span>
                                                <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${sh.votingRights ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                    {sh.votingRights ? (lang === 'ar' ? 'تصويت معتمد' : 'Authorized') : (lang === 'ar' ? 'معطل' : 'No')}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-2 mt-4 pt-3 border-t">
                                            <Button variant="ghost" size="sm" onClick={() => { setEditingShareholder(sh); setIsShareholderModalOpen(true); }} className="p-2">
                                                <Edit3 className="w-4.5 h-4.5 text-gray-400" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteShareholder(sh.id)} className="p-2">
                                                <Trash2 className="w-4.5 h-4.5 text-rose-500" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-dm-card rounded-2xl overflow-hidden shadow">
                                <table className="w-full text-xs text-right">
                                    <thead className="bg-slate-55 bg-indigo-50/20 text-slate-500 font-bold">
                                        <tr>
                                            <th className="p-3">{tLocal.shareholderName}</th>
                                            <th className="p-3">{tLocal.shareholderNationality}</th>
                                            <th className="p-3">{tLocal.civilId}</th>
                                            <th className="p-3">{tLocal.sharePercentage}</th>
                                            <th className="p-3">{tLocal.numberOfShares}</th>
                                            <th className="p-3">{tLocal.shareClass}</th>
                                            <th className="p-3">{tLocal.votingRights}</th>
                                            <th className="p-3 text-center">{lang === 'ar' ? 'خيارات' : 'Options'}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {activeCompany?.shareholders?.map(sh => (
                                            <tr key={sh.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                                                <td className="p-3 font-black">{sh.name}</td>
                                                <td className="p-3">{sh.nationality}</td>
                                                <td className="p-3 font-mono">{sh.civilIdOrRegNumber}</td>
                                                <td className="p-3 font-black text-indigo-600">{sh.sharePercentage}%</td>
                                                <td className="p-3 font-mono">{sh.numberOfShares.toLocaleString()}</td>
                                                <td className="p-3">{sh.shareClass}</td>
                                                <td className="p-3">
                                                    {sh.votingRights ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')}
                                                </td>
                                                <td className="p-3 text-center flex justify-center gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => { setEditingShareholder(sh); setIsShareholderModalOpen(true); }}>
                                                        <Edit3 className="w-4 h-4 text-gray-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteShareholder(sh.id)}>
                                                        <Trash2 className="w-4 h-4 text-rose-500" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* 3. Board of Directors and committees */}
                {activeTab === 'dashboard' && dashboardSubTab === 'board' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm">{lang === 'ar' ? 'تاريخ وسجل عضوية مجلس الإدارة واللجان' : 'Board Members & Committees Directory'}</h3>
                            <Button variant="primary" size="sm" className="font-black" onClick={() => { setEditingBoard(null); setIsBoardModalOpen(true); }} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                                {lang === 'ar' ? 'إضافة عضو مجلس إدارة ممثل' : 'Assign Board Member'}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-8 space-y-4">
                                {activeCompany?.boardMembers?.length ? (
                                    activeCompany.boardMembers.map(bm => (
                                        <div key={bm.id} className="p-5 rounded-2xl bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row justify-between md:items-center gap-4 hover:shadow-md transition-shadow">
                                            <div className="flex gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center font-bold">
                                                    BM
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-slate-900 dark:text-white text-sm">{bm.name}</h4>
                                                        {bm.isAuthorizedSignatory && (
                                                            <span className="text-[9px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-black">
                                                                {lang === 'ar' ? 'مخول توقيع' : 'Signatory Approved'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        <span>{bm.position}</span> • <span>{tLocal.appointmentDate}: {formatDateString(bm.appointmentDate)}</span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-none">
                                                <div className="text-right text-xs">
                                                    <span className="text-slate-400 text-[10px] block">{lang === 'ar' ? 'نهاية التفويض والولاية' : 'Tenure expiry'}</span>
                                                    <span className="font-bold text-rose-600 font-mono">{formatDateString(bm.termEndDate)}</span>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button variant="ghost" size="sm" onClick={() => { setEditingBoard(bm); setIsBoardModalOpen(true); }} className="p-1.5 shadow-sm">
                                                        <Edit3 className="w-4 h-4 text-gray-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteBoardMember(bm.id)} className="p-1.5 shadow-sm">
                                                        <Trash2 className="w-4 h-4 text-rose-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center py-12 text-slate-400 text-xs">لا يوجد أعضاء مجلس إدارة مسجلين حالياً لهذه الشركة.</p>
                                )}
                            </div>

                            <div className="lg:col-span-4 space-y-4">
                                <Card className="p-5 bg-stone-50 dark:bg-slate-800 rounded-2xl border-none">
                                    <h4 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-3">
                                        {lang === 'ar' ? 'اللجان الرقابية الفعالة' : 'Active Regulatory Committees'}
                                    </h4>
                                    {activeCompany?.committees?.length ? (
                                        activeCompany.committees.map(com => (
                                            <div key={com.id} className="p-3 bg-white dark:bg-dm-card rounded-xl border border-gray-100 dark:border-gray-700 text-xs mb-2">
                                                <span className="text-[10px] font-black text-indigo-600 uppercase block">{com.frequency}</span>
                                                <p className="font-black text-slate-800 dark:text-white mt-1 leading-tight">{com.name}</p>
                                                <p className="text-slate-500 text-[11px] mt-1 leading-relaxed">{com.description}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-slate-400 text-[11px] leading-relaxed">
                                            {lang === 'ar' ? 'لم يتم تشكيل لجان بمجلس الإدارة للتطبيق والامتثال.' : 'No compliance board committees established yet.'}
                                        </p>
                                    )}
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                {/* 4. Authorized Signatories Tab */}
                {activeTab === 'dashboard' && dashboardSubTab === 'signatories' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm">{lang === 'ar' ? 'المفوضين بالتوقيع ونطاق الصلاحيات القانونية' : 'Authorized Signatories Registry'}</h3>
                            <Button variant="primary" size="sm" className="font-black" onClick={() => { setEditingSignatory(null); setIsSignatoryModalOpen(true); }} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                                {lang === 'ar' ? 'إسناد وتفويض توقيع' : 'Add Signatory Scope'}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeCompany?.authorizedSignatories?.map(sig => (
                                <Card key={sig.id} className="p-5 rounded-[2rem] bg-white dark:bg-dm-card border-none shadow-md">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                                <span>{sig.name}</span>
                                            </h4>
                                            <span className="text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{sig.title}</span>
                                        </div>

                                        <span className="text-xs font-mono font-black text-indigo-700 bg-indigo-50/40 border px-3 py-1 rounded-full">
                                            {sig.authorityLimit === 0 ? tLocal.notLimited : `${tLocal.limitedTo} ${sig.authorityLimit.toLocaleString()}`}
                                        </span>
                                    </div>

                                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-16">
                                        {sig.signatureScope}
                                    </div>

                                    <div className="mt-4 flex justify-between items-center border-t pt-4 text-[10px]">
                                        <div className="text-slate-400">
                                            <span>{lang === 'ar' ? 'مسؤولية مزدوجة؟' : 'Joint Required?'}</span>
                                            <span className={`mr-2.5 font-bold ${sig.jointSignatureRequired ? 'text-amber-600' : 'text-slate-500'}`}>
                                                {sig.jointSignatureRequired ? (lang === 'ar' ? 'توقيع مشترك' : 'Joint') : (lang === 'ar' ? 'منفرد' : 'Independent')}
                                            </span>
                                        </div>

                                        <div className="flex gap-1.5">
                                            <Button variant="ghost" size="sm" onClick={() => { setEditingSignatory(sig); setIsSignatoryModalOpen(true); }} className="p-1.5">
                                                <Edit3 className="w-4 h-4 text-gray-500" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSignatory(sig.id)} className="p-1.5">
                                                <Trash2 className="w-4 h-4 text-rose-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. Assemblies & Minutes Index */}
                {activeTab === 'dashboard' && dashboardSubTab === 'meetings' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm">{lang === 'ar' ? 'سجل تدوين جلسات ومقترحات الجمعيات والمجالس' : 'Commercial Assemblies & Board Meetings Log'}</h3>
                            <Button variant="primary" size="sm" className="font-black" onClick={() => { setEditingMeeting(null); setIsMeetingModalOpen(true); }} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                                {lang === 'ar' ? 'توثيق جلسة / محضر جديد' : 'Log New Assembly'}
                            </Button>
                        </div>

                        <div className="space-y-6">
                            {activeCompanyMeetings.length ? (
                                activeCompanyMeetings.map(meet => (
                                    <div key={meet.id} className="p-6 rounded-[2rem] bg-white dark:bg-dm-card border border-transparent hover:border-gray-200 dark:hover:border-gray-800 transition-all shadow-md relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-2.5 h-full bg-indigo-600" />
                                        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                            <div className="space-y-2 flex-grow pr-3">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-2.5 py-1 rounded-full border border-indigo-200">
                                                        {meet.meetingType}
                                                    </span>
                                                    <span className="text-slate-400 font-mono text-xs flex items-center gap-1">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {formatDateString(meet.meetingDate)} ({meet.meetingTime})
                                                    </span>
                                                </div>

                                                <h4 className="text-sm font-black text-slate-900 dark:text-white pt-1">
                                                    {meet.meetingLocation}
                                                </h4>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3">
                                                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl">
                                                        <span className="text-slate-400 text-[10px] font-black block mb-1">{tLocal.agenda}</span>
                                                        <p className="text-slate-700 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">{meet.agendaItems}</p>
                                                    </div>
                                                    <div className="bg-emerald-500/5 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/10">
                                                        <span className="text-emerald-700 text-[10px] font-black block mb-1">{tLocal.resolutions}</span>
                                                        <p className="text-slate-700 dark:text-slate-350 leading-relaxed whitespace-pre-wrap">{meet.resolutionsPassed}</p>
                                                    </div>
                                                </div>

                                                <p className="text-[10px] text-slate-400 mt-2">
                                                    <strong>الجهات المراقبة والحضور:</strong> {meet.attendees?.join(' • ')}
                                                </p>
                                            </div>

                                            <div className="flex flex-row md:flex-col justify-end gap-2.5 border-t md:border-none pt-3 md:pt-0">
                                                <Button size="sm" variant="secondary" className="font-bold flex items-center gap-1" onClick={() => handleExportCSV([meet], `${meet.meetingType}`)}>
                                                    <Printer className="w-3.5 h-3.5" />
                                                    <span>طباعة مسودة</span>
                                                </Button>

                                                <Button size="sm" variant="ghost" onClick={() => { setEditingMeeting(meet); setIsMeetingModalOpen(true); }} className="p-2 shadow-sm">
                                                    <Edit3 className="w-4 h-4 text-gray-500" />
                                                </Button>

                                                <Button size="sm" variant="ghost" onClick={() => handleDeleteMeeting(meet.id)} className="p-2 shadow-sm">
                                                    <Trash2 className="w-4 h-4 text-rose-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-12 text-slate-400 text-xs">لا توجد محاضر اجتماعات أو جمعيات مدونة في الأرشيف المتاح.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* 6. Corporate Actions / Capital revisions */}
                {activeTab === 'dashboard' && dashboardSubTab === 'actions' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm">{lang === 'ar' ? 'سجل التعديلات الأساسية على عقد التأسيس وزيادات رأس المال' : 'Key Articles Amendments & Structural Revisions'}</h3>
                            <Button variant="primary" size="sm" className="font-black" onClick={() => { setEditingAction(null); setIsActionModalOpen(true); }} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                                {lang === 'ar' ? 'جدولة رخصة تعديل' : 'Record Action'}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeCompanyActions.length ? (
                                activeCompanyActions.map(act => (
                                    <div key={act.id} className="p-5 rounded-[2rem] bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-850 shadow-md">
                                        <div className="flex justify-between items-start">
                                            <span className="bg-amber-500/10 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-full">
                                                {act.actionType}
                                            </span>
                                            <span className="text-slate-400 font-mono text-[10px]">{formatDateString(act.actionDate)}</span>
                                        </div>

                                        <h4 className="font-black text-sm text-slate-900 mt-3 dark:text-white leading-tight">
                                            {act.description}
                                        </h4>

                                        <p className="text-xs text-slate-500 mt-2.5 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl min-h-16">
                                            {act.details}
                                        </p>

                                        <div className="mt-4 flex justify-between items-center border-t pt-4">
                                            <span className={`inline-block px-2 py-0.5 rounded text-[10.5px] font-black ${
                                                act.status === CorporateActionStatus.COMPLETED ? 'bg-green-100 text-green-700' :
                                                act.status === CorporateActionStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {act.status}
                                            </span>

                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => { setEditingAction(act); setIsActionModalOpen(true); }} className="p-1.5">
                                                    <Edit3 className="w-4 h-4 text-gray-500" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDeleteAction(act.id)} className="p-1.5">
                                                    <Trash2 className="w-4 h-4 text-rose-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-12 text-slate-400 text-xs md:col-span-2">لا توجد عمليات هيكلة جارية أو تمت في هذه الأثناء.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* 7. Files Safe & Correspondence */}
                {activeTab === 'dashboard' && dashboardSubTab === 'documents' && (
                    <div className="space-y-6">
                        {/* Drag and Drop simulate panel */}
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDropFile}
                            className={`p-8 rounded-[2.5rem] border-2 border-dashed text-center transition-all ${
                                dragging 
                                ? 'border-primary bg-primary/5' 
                                : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-dm-card'
                            }`}
                        >
                            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                            <p className="font-black text-sm text-slate-800 dark:text-white">{tLocal.uploadFile}</p>
                            <p className="text-slate-400 text-[11px] mt-1">{tLocal.fileTypes}</p>

                            <div className="mt-4 flex justify-center">
                                <label className="bg-primary text-white text-xs font-black py-2.5 px-6 rounded-full cursor-pointer hover:bg-opacity-90 shadow-md">
                                    <span>{lang === 'ar' ? 'تصفح الملفات' : 'Browse Files'}</span>
                                    <input type="file" onChange={handleFileSelect} className="hidden" />
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-sm">{lang === 'ar' ? 'خزنة وثائق الشركة وقرارات الاعتماد' : 'Document Safekeeping Vault'}</h3>
                            <Button variant="primary" size="sm" className="font-black" onClick={() => { setEditingDoc(null); setIsDocModalOpen(true); }} leftIcon={<Plus className="w-3.5 h-3.5" />}>
                                {lang === 'ar' ? 'إدخال وثيقة للامتثال' : 'Record Document'}
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeCompanyDocs.length ? (
                                activeCompanyDocs.map(doc => (
                                    <Card key={doc.id} className="p-5 rounded-[2rem] bg-white dark:bg-dm-card border-none shadow-md">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-primary">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-black uppercase text-slate-400">{doc.documentType}</span>
                                                    <h4 className="font-black text-xs text-slate-900 dark:text-white leading-snug mt-0.5">{doc.title}</h4>
                                                </div>
                                            </div>

                                            <CompanyDocumentStatusBadge status={doc.status} size="xs" />
                                        </div>

                                        <p className="text-[11px] text-slate-500 mt-3 leading-relaxed min-h-11">
                                            {doc.notes || 'لا توجد ملاحظات إضافية مرفقة مع هذا السند.'}
                                        </p>

                                        <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between gap-2 text-[10px]">
                                            <div className="flex gap-1 flex-wrap">
                                                {doc.keywords?.map((k, idx) => (
                                                    <span key={idx} className="bg-stone-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[9px] text-slate-500">
                                                        #{k}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="flex gap-1.5 self-end">
                                                <Button size="sm" variant="ghost" onClick={() => { setEditingDoc(doc); setIsDocModalOpen(true); }} className="p-1">
                                                    <Edit3 className="w-4 h-4 text-gray-400" />
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={() => handleDeleteDoc(doc.id)} className="p-1">
                                                    <Trash2 className="w-4 h-4 text-rose-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <p className="text-center py-12 text-slate-400 text-xs md:col-span-2">لا توجد مستندات قانونية مؤرشفة.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Integrated Documents & Resolutions Editor */}
                {activeTab === 'editor' && (
                    <div className="space-y-6">
                        {/* Quick Presets Bar for Legal Documents */}
                        <Card className="p-4 bg-gradient-to-r from-emerald-900/10 via-teal-900/10 to-indigo-900/10 dark:bg-slate-900 rounded-3xl border border-emerald-500/20 no-print">
                            <div className="flex items-center gap-2 mb-3">
                                <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                <h4 className="font-black text-sm text-slate-900 dark:text-white">
                                    {lang === 'ar' ? 'نماذج وقوالب المحاضر والقرارات الجاهزة' : 'Pre-configured Minutes & Resolutions Templates'}
                                </h4>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                                <button
                                    onClick={() => {
                                        setDocTitle(`محضر اجتماع الجمعية العامة العادية للسنة المالية - ${activeCompany?.companyNameAr}`);
                                        setDocContent(`محضر اجتماع الجمعية العامة العادية\nلشركة ${activeCompany?.companyNameAr || '...'}\nالشكل القانوني: ${activeCompany?.legalForm}\nرقم السجل التجاري: ${activeCompany?.registrationNumber}\nرأس المال المصرح به: ${formatKWD(activeCompany?.capital)}\n\nإنه في يوم .......... الموافق .../.../2026، اجتمعت الجمعية العامة العادية لمساهمي/شركاء الشركة بمقرها الرئيس برئاسة رئيس مجلس الإدارة وبحضور الشركاء الممثلين لنسبة ...% من رأس المال.\n\nجدول الأعمال والقرارات المتخذة:\n1. اعتماد تقرير مجلس الإدارة عن نشاط الشركة وحساباتها الختامية.\n2. المصادقة على الميزانية العمومية وحساب الأرباح والخسائر عن السنة المالية المنتهية.\n3. إبراء ذمة أعضاء مجلس الإدارة/المدراء عن إدارتهم للشركة خلال السنة المالية.\n4. تعيين/إعادة تعيين مراقب الحسابات للشركة وتفويض الإدارة بتحديد أتعابه.\n\nوقد صودق على هذا المحضر للرفع لوزارة التجارة والصناعة (MOCI) والتأشير بالسجل التجاري.\n\nتوقيع رئيس الجلسة / المدير العام:\n.........................................`);
                                        addToast({ type: 'success', title: 'تم تحميل النموذج', message: 'محضر الجمعية العامة العادية جاهز للتعديل.' });
                                    }}
                                    className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-emerald-500 text-right text-xs font-bold transition-all shadow-sm cursor-pointer hover:shadow-md"
                                >
                                    <div className="text-emerald-600 dark:text-emerald-400 font-black mb-1">1. جمعية عامة عادية (AGM)</div>
                                    <div className="text-[10px] text-slate-500">اعتماد الميزانية السنوية وإبراء الذمة</div>
                                </button>

                                <button
                                    onClick={() => {
                                        setDocTitle(`محضر اجتماع الجمعية العامة غير العادية (زيادة رأس المال) - ${activeCompany?.companyNameAr}`);
                                        setDocContent(`محضر اجتماع الجمعية العامة غير العادية (EGA)\nلشركة ${activeCompany?.companyNameAr || '...'}\n\nإنه في يوم .......... الموافق .../.../2026، وافقت الجمعية العامة غير العادية بالإجماع على القرار الإستراتيجي التالي:\n\n1. زيادة رأس مال الشركة المرخص به والمصدق من ${formatKWD(activeCompany?.capital)} د.ك إلى رأس مال جديد بقيمة ${formatKWD((activeCompany?.capital || 100000) * 1.5)} د.ك.\n2. تعديل المادة رقم (...) من عقد التأسيس والنظام الأساسي للشركة بما يتوافق مع رأس المال الجديد.\n3. تفويض السيد/ ......................... بالتوقيع أمام موثق وزارة العدل بالإدارة العامة للتوثيق ولدى وزارة التجارة والصناعة.\n\nحرر هذا المحضر لإتمام إجراءات التوثيق والتأشير بالسجل التجاري.\n\nتوقيع الشركاء والمفوضين:\n.........................................`);
                                        addToast({ type: 'success', title: 'تم تحميل النموذج', message: 'محضر الجمعية غير العادية لزيادة رأس المال جاهز.' });
                                    }}
                                    className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-emerald-500 text-right text-xs font-bold transition-all shadow-sm cursor-pointer hover:shadow-md"
                                >
                                    <div className="text-teal-600 dark:text-teal-400 font-black mb-1">2. جمعية غير عادية (EGM)</div>
                                    <div className="text-[10px] text-slate-500">زيادة رأس المال وتعديل عقد التأسيس</div>
                                </button>

                                <button
                                    onClick={() => {
                                        setDocTitle(`قرار مجلس الإدارة بالتمثيل والاعتماد البنكي - ${activeCompany?.companyNameAr}`);
                                        setDocContent(`قرار مجلس الإدارة / الشركاء رقم (2026/01)\nلشركة ${activeCompany?.companyNameAr || '...'}\n\nقرر مجلس الإدارة في جلسته المنعقدة بتاريخ .../.../2026 ما يلي:\n\nأولاً: تفويض السيد/ ......................... (بطاقة مدنية رقم: ....................) بتمثيل الشركة بصفته مفوضاً بالتوقيع أمام كافة البنوك والمؤسسات المالية داخل وخارج دولة الكويت.\nثانياً: تحديد سقف صلاحية التوقيع المنفرد بـ (${formatKWD(50000)}) د.ك وما زاد عن ذلك يتطلب التوقيع المشترك مع المفوض الثاني.\nثالثاً: فتح وتفعيل الحسابات البنكية وإصدار الاعتمادات والتسهيلات المصرفية باسم الشركة.\n\nالتواقيع المعتمدة:\n1- المفوض الأول: ............................\n2- المفوض الثاني: ............................`);
                                        addToast({ type: 'success', title: 'تم تحميل النموذج', message: 'قرار الاعتماد البنكي جاهز للتعديل.' });
                                    }}
                                    className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-emerald-500 text-right text-xs font-bold transition-all shadow-sm cursor-pointer hover:shadow-md"
                                >
                                    <div className="text-indigo-600 dark:text-indigo-400 font-black mb-1">3. قرار الاعتماد البنكي</div>
                                    <div className="text-[10px] text-slate-500">تحديد صلاحيات التوقيع البنكي والمفوضين</div>
                                </button>

                                <button
                                    onClick={() => {
                                        setDocTitle(`قرار تعديل ملكية وقيد الحصص وتنازل الشركاء - ${activeCompany?.companyNameAr}`);
                                        setDocContent(`إقرار وتنازل عن حصص بشركة ${activeCompany?.companyNameAr || '...'}\nرقم السجل التجاري: ${activeCompany?.registrationNumber}\n\nأقر أنا الشريك المتنازل/ ......................... بالبيع والتنازل عن عدد (...) حصة بقيمة اسمية قدرها (...) د.ك لصالح الشريك المتنازل له/ .........................\n\nوبذلك تتغير هيكلة حصص رأس المال بالشركة لتصبح على النحو التالي:\n1. الشريك الأول: نسبة ...%\n2. الشريك الثاني: نسبة ...%\n\nوقد صدر هذا القرار للتأشير به أمام الإدارة العامة للتوثيق بوزارة العدل وتعديل السجل التجاري بوزارة التجارة والصناعة.\n\nتوقيع المتنازل: ....................     توقيع المتنازل له: ....................`);
                                        addToast({ type: 'success', title: 'تم تحميل النموذج', message: 'قرار تنازل ونقل ملكية الحصص جاهز.' });
                                    }}
                                    className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:border-emerald-500 text-right text-xs font-bold transition-all shadow-sm cursor-pointer hover:shadow-md"
                                >
                                    <div className="text-amber-600 dark:text-amber-400 font-black mb-1">4. تنازل ونقل ملكية حصص</div>
                                    <div className="text-[10px] text-slate-500">تعديل هيكل ملكية الشركاء الملاك</div>
                                </button>
                            </div>
                        </Card>

                        <div className="flex flex-col lg:flex-row gap-6">
                            
                            {/* Variable Insertion Sidebar Wrapper */}
                            <div className="lg:col-span-1 lg:w-80 space-y-4 no-print flex-shrink-0">
                                <Card className="p-5 bg-indigo-500/5 rounded-2xl border-none">
                                    <h4 className="font-black text-xs text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                        <span>{lang === 'ar' ? 'مساعِد ومتغيرات الصياغة' : 'Draft variables'}</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                                        {lang === 'ar' ? 'انقر على أي متغير لتوطين قيم ملف المنشأة وإضافتها فوراً بمكان مؤشر المحرر:' : 'Click any variable to append official entity records directly into the active draft area:'}
                                    </p>
                                    <div className="space-y-2 text-xs">
                                        <button 
                                            onClick={() => setDocContent(prev => prev + `\nشريك ومدير شركة ${activeCompany?.companyNameAr || 'الشاهين العقارية'}`)}
                                            className="w-full text-right p-2 border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-xl hover:border-primary cursor-pointer text-slate-700 dark:text-neutral-light hover:text-primary transition-all font-bold"
                                        >
                                            {lang === 'ar' ? '+ اسم الشركة (عربي)' : '+ Company Name (AR)'}
                                        </button>
                                        <button 
                                            onClick={() => setDocContent(prev => prev + `\nالشكل القانوني: ${activeCompany?.legalForm || 'شركة ذات مسؤولية محدودة'}`)}
                                            className="w-full text-right p-2 border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-xl hover:border-primary cursor-pointer text-slate-700 dark:text-neutral-light hover:text-primary transition-all font-bold"
                                        >
                                            {lang === 'ar' ? '+ نوع الهيكل القانوني' : '+ Legal form'}
                                        </button>
                                        <button 
                                            onClick={() => setDocContent(prev => prev + `\nرأس مال الشركة الإجمالي: ${activeCompany?.capital ? formatKWD(activeCompany.capital) : '100,000 د.ك'}`)}
                                            className="w-full text-right p-2 border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-xl hover:border-primary cursor-pointer text-slate-700 dark:text-neutral-light hover:text-primary transition-all font-bold"
                                        >
                                            {lang === 'ar' ? '+ قيم رأس المال الدفتري' : '+ Authorized Capital'}
                                        </button>
                                        <button 
                                            onClick={() => setDocContent(prev => prev + `\nرقم السجل التجاري: ${activeCompany?.registrationNumber || '12345/أ'}`)}
                                            className="w-full text-right p-2 border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-xl hover:border-primary cursor-pointer text-slate-700 dark:text-neutral-light hover:text-primary transition-all font-bold"
                                        >
                                            {lang === 'ar' ? '+ رقم القيد والسجل التجاري' : '+ Commercial registry'}
                                        </button>
                                        <button 
                                            onClick={() => setDocContent(prev => prev + `\nرقم الموحد (MOCI): ${activeCompany?.tradeLicenseNumber || '987654'}`)}
                                            className="w-full text-right p-2 border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-xl hover:border-primary cursor-pointer text-slate-700 dark:text-neutral-light hover:text-primary transition-all font-bold"
                                        >
                                            {lang === 'ar' ? '+ رقم الترخيص الموحد (MOCI)' : '+ MOCI license number'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const list = activeCompany?.shareholders?.map(s => `- الشريك: ${s.name} (حصة بنسبة ${s.sharePercentage}%)`).join('\n') || '';
                                                setDocContent(prev => prev + `\nكشف قيد المساهمين الملاك:\n${list}`);
                                            }}
                                            className="w-full text-right p-2 border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-xl hover:border-primary cursor-pointer text-slate-700 dark:text-neutral-light hover:text-primary transition-all font-bold"
                                        >
                                            {lang === 'ar' ? '+ قائمة وجدول كشف الشركاء' : '+ Shareholders distribution list'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const list = activeCompany?.authorizedSignatories?.map(s => `- المفوض: ${s.name} (الصلاحية: ${s.signatureScope})`).join('\n') || '';
                                                setDocContent(prev => prev + `\nجدول رخص التواقيع للمفوضين البنكيين:\n${list}`);
                                            }}
                                            className="w-full text-right p-2 border border-gray-100 dark:border-gray-800 bg-white dark:bg-slate-900 rounded-xl hover:border-primary cursor-pointer text-slate-700 dark:text-neutral-light hover:text-primary transition-all font-bold"
                                        >
                                            {lang === 'ar' ? '+ جدول المفوضين بالتوقيع الكويتي' : '+ Signatory rights table'}
                                        </button>
                                    </div>
                                </Card>

                                <Card className="p-4 bg-slate-100 dark:bg-slate-805/30 rounded-2xl border-none">
                                    <h4 className="font-bold text-xs text-slate-400 mb-2">{lang === 'ar' ? 'إرشادات الإيداع والمطابقة' : 'Filing guidelines'}</h4>
                                    <p className="text-[10px] text-slate-400 leading-relaxed">
                                        {lang === 'ar' 
                                            ? 'بموجب قانون التجارة الكويتي، يتعين مصادقة كاتب العدل لوزارة العدل وتوثيق القرارات خلال 15 يوماً من الجمعية لتكون سارية بالكامل.' 
                                            : 'Kuwaiti corporate law requires public registry approval and electronic filings within 15 working days from general assembly consensus.'}
                                    </p>
                                </Card>
                            </div>

                            {/* Main Document Workspace Paper Canvas */}
                            <div className="flex-1 flex flex-col gap-4">
                                <Card className="flex-1 rounded-[2rem] p-8 bg-white dark:bg-dm-card border-none shadow-xl flex flex-col gap-6">
                                    
                                    {/* Action Bar */}
                                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-4 no-print">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                {lang === 'ar' ? 'وضع الصياغة والمصادقة المباشرة' : 'Active draft compliance mode'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button 
                                                size="sm" 
                                                variant="secondary" 
                                                onClick={() => handleExportDoc('doc')}
                                                className="flex items-center gap-1.5 text-xs py-2 px-3 rounded-full cursor-pointer"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>{lang === 'ar' ? 'Word' : 'Word doc'}</span>
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="secondary" 
                                                onClick={() => handleExportDoc('xls')}
                                                className="flex items-center gap-1.5 text-xs py-2 px-3 rounded-full cursor-pointer"
                                            >
                                                <FileSpreadsheet className="w-4 h-4" />
                                                <span>Excel / CSV</span>
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="primary" 
                                                onClick={() => handleExportDoc('pdf')}
                                                className="flex items-center gap-1.5 text-xs py-2 px-4 rounded-full cursor-pointer"
                                            >
                                                <Printer className="w-4 h-4" />
                                                <span>{lang === 'ar' ? 'الطباعة السريعة' : 'Print PDF'}</span>
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Document Title input */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-slate-400 font-bold px-1">{lang === 'ar' ? 'موضوع / عنوان القرار أو المحضر:' : 'Document / Resolution Topic Title:'}</label>
                                        <input 
                                            type="text" 
                                            value={docTitle} 
                                            onChange={(e) => setDocTitle(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 py-3 px-4 rounded-2xl text-xs md:text-sm font-black focus:ring-2 focus:ring-primary focus:outline-none text-slate-900 dark:text-white"
                                            placeholder={lang === 'ar' ? 'أدخل عنوان السند...' : 'Document title...'}
                                        />
                                    </div>

                                    {/* Rich Text Resolution content area */}
                                    <div className="flex-1 flex flex-col gap-1">
                                        <label className="text-xs text-slate-400 font-bold px-1">{lang === 'ar' ? 'مسودة النص الأساسي والمصادرات القانونية:' : 'Draft legal body content:'}</label>
                                        <textarea
                                            value={docContent}
                                            onChange={(e) => setDocContent(e.target.value)}
                                            rows={18}
                                            className="w-full flex-1 bg-slate-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 p-6 rounded-2xl text-xs leading-relaxed focus:ring-2 focus:ring-primary focus:outline-none focus:bg-white dark:focus:bg-slate-950 font-mono text-slate-800 dark:text-neutral-light min-h-[400px]"
                                            style={{ direction: 'rtl' }}
                                        />
                                    </div>

                                    {/* Official Sabri Shatta Law Office Approved Seal Stamp (Renders on Print) */}
                                    <div className="mt-6 pt-6 border-t border-dashed border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                            <p className="font-bold text-slate-800 dark:text-slate-200">ملاحظة التوثيق:</p>
                                            <p>تم إعداد هذا المستند عبر المنظومة الرقمية بحوكمة معتمدة لمكتب المحامي صبري شطا.</p>
                                        </div>

                                        {/* Official Approved Circular Stamp Component */}
                                        <div className="flex items-center gap-3 border-2 border-[#134D41] dark:border-emerald-500 rounded-full px-5 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/30">
                                            <div className="w-10 h-10 rounded-full border border-amber-500 flex items-center justify-center bg-white dark:bg-slate-900 shadow-inner">
                                                <ShieldCheck className="w-6 h-6 text-[#134D41] dark:text-emerald-400" />
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[11px] font-black text-[#134D41] dark:text-emerald-400">مكتب المحامي صبري شطا</div>
                                                <div className="text-[9px] font-bold text-amber-600 dark:text-amber-400">ختم توثيق وحوكمة الشركات - معتمد</div>
                                            </div>
                                        </div>
                                    </div>

                                </Card>
                            </div>

                        </div>
                    </div>
                )}

                {/* 8. Interactive Timeline Events tracking */}
                {activeTab === 'timeline' && (
                    <div className="space-y-6">
                        <h3 className="font-black text-sm">{tLocal.timelineTitle}</h3>

                        <div className="relative border-r-2 border-indigo-100 dark:border-indigo-900/30 mr-4 pr-6 space-y-8">
                            {activeTimeline.length ? (
                                activeTimeline.map(evt => (
                                    <div key={evt.id} className="relative group">
                                        {/* Colored Dot bullet */}
                                        <div className={`absolute -right-[31px] top-1 w-4 h-4 rounded-full border-4 border-white dark:border-dm-card ${
                                            evt.type === 'registration' ? 'bg-indigo-600' :
                                            evt.type === 'meeting' ? 'bg-emerald-500' :
                                            evt.type === 'action' ? 'bg-amber-500' :
                                            'bg-slate-400'
                                        }`} />

                                        <div className="text-xs text-indigo-500 font-mono font-black">{formatDateString(evt.date)}</div>
                                        <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1">
                                            {lang === 'ar' ? evt.titleAr : evt.titleEn}
                                        </h4>
                                        <p className="text-xs text-slate-550 dark:text-slate-400 mt-1 leading-relaxed">
                                            {lang === 'ar' ? evt.descriptionAr : evt.descriptionEn}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-12 text-slate-400 text-xs">لا توجد فعاليات مسجلة للأرشفة في هذه الشركة.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* -------------------- GENERAL ASSEMBLY & BOARD RESOLUTION GENERATOR -------------------- */}
                {activeTab === 'resolutions_generator' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                        <div className="bg-gradient-to-r from-[#032B24] via-[#134D41] to-[#0A4136] p-6 rounded-3xl text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                                    <BookMarked className="w-5 h-5" />
                                    <span>{lang === 'ar' ? 'مولد قرارات الجمعيات العمومية ومجالس الإدارة (قانون الشركات الكويتي 1/2016)' : 'MOCI Resolution Generator'}</span>
                                </div>
                                <h3 className="text-xl font-black text-white mt-1">
                                    {lang === 'ar' ? `صياغة قرار رسمي موثق لشركة: ${activeCompany?.companyNameAr}` : `Resolution Generator for ${activeCompany?.companyNameAr}`}
                                </h3>
                                <p className="text-xs text-slate-200/80 mt-1">
                                    {lang === 'ar' ? 'إنشاء قرارات محكمة قانونياً وجاهزة للتسجيل والإيداع لدى وزارة التجارة والصناعة (MOCI) والسجل التجاري' : 'Generate legally sound resolutions ready for MOCI registry filing'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            
                            {/* Generator Controls */}
                            <div className="lg:col-span-5 space-y-4">
                                <Card className="p-5 space-y-4 bg-white dark:bg-dm-card border-none shadow-md">
                                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3">
                                        <FileCheck className="w-4 h-4 text-emerald-500" />
                                        <span>{lang === 'ar' ? 'إعدادات القرار والجمعية' : 'Resolution Parameters'}</span>
                                    </h4>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-1">{lang === 'ar' ? 'نوع الاجتماع / القرار:' : 'Meeting Category:'}</label>
                                        <select 
                                            id="res-type-select"
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white"
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === 'agm') {
                                                    setDocTitle(`محضر اجتماع الجمعية العامة العادية - ${activeCompany?.companyNameAr}`);
                                                    setDocContent(`محضر اجتماع الجمعية العامة العادية\nلشركة: ${activeCompany?.companyNameAr}\nالسجل التجاري: ${activeCompany?.registrationNumber}\nرأس المال: ${formatKWD(activeCompany?.capital)}\n\nإنه في يوم .......... الموافق .../.../2026، اجتمعت الجمعية العامة العادية لمساهمي/شركاء الشركة بمقرها الرئيس بتمام الساعة 10:00 صباحاً بحضور نسبة حضور تعادل %92 من رأس المال.\n\nقرارات الجمعية العادية:\n1. المصادقة التامة على تقرير مجلس الإدارة عن السنة المالية المنتهية والحسابات الختامية.\n2. اعتماد تقرير مراقب الحسابات والمصادقة على الميزانية العمومية.\n3. إبراء ذمة أعضاء مجلس الإدارة والمديرين عن إدارتهم للشركة خلال السنة المالية.\n4. تعيين مراقب الحسابات وتفويض مجلس الإدارة بتحديد أتعابه.`);
                                                } else if (val === 'egm') {
                                                    setDocTitle(`محضر اجتماع الجمعية العامة غير العادية (زيادة رأس المال) - ${activeCompany?.companyNameAr}`);
                                                    setDocContent(`محضر اجتماع الجمعية العامة غير العادية\nلشركة: ${activeCompany?.companyNameAr}\nالسجل التجاري: ${activeCompany?.registrationNumber}\n\nقرارات الجمعية غير العادية بالإجماع:\n1. زيادة رأس مال الشركة من ${formatKWD(activeCompany?.capital)} د.ك إلى ${formatKWD((activeCompany?.capital || 100000) * 1.5)} د.ك.\n2. تعديل المادة رقم (6) من عقد التأسيس والنظام الأساسي للشركة بما يطابق رأس المال الجديد.\n3. تفويض المدير العام بالتوقيع أمام التوثيق العقاري بوزارة العدل والسجل التجاري بوزارة التجارة والصناعة (MOCI).`);
                                                } else {
                                                    setDocTitle(`قرار مجلس الإدارة بتفويض التوقيع والاعتمادات البنكية - ${activeCompany?.companyNameAr}`);
                                                    setDocContent(`قرار مجلس الإدارة رقم (2026/02)\nلشركة: ${activeCompany?.companyNameAr}\n\nاجتمع مجلس الإدارة وقرر ما يلي:\n1. تفويض المفوض المعتمد بتمثيل الشركة بصفة فردية حتى سقف 50,000 د.ك لدى كافة البنوك الكويتي.\n2. المخولون بالتوقيع يتطلب توقيعهم الثنائي المزدوج لأي مبالغ تجاوز 50,000 د.ك.\n3. تقديم هذا القرار للبنوك والجهات الرسمية فوراً.`);
                                                }
                                            }}
                                        >
                                            <option value="agm">1. جمعية عامة عادية (AGM) - اعتماد الميزانية وإبراء الذمة</option>
                                            <option value="egm">2. جمعية عامة غير عادية (EGM) - زيادة رأس المال وتعديل العقود</option>
                                            <option value="board">3. قرار مجلس إدارة (Board Resolution) - صلاحيات البنوك والإدارة</option>
                                            <option value="managers">4. قرار هيئة المديرين - عزل/تعيين مدير وتعديل الأغراض</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-1">{lang === 'ar' ? 'تاريخ عقد الاجتماع:' : 'Meeting Date:'}</label>
                                        <input type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white" />
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-500 block mb-1">{lang === 'ar' ? 'نسبة النصاب وحضور الشركاء:' : 'Quorum Attendance:'}</label>
                                        <input type="text" defaultValue="92.5% من إجمالي الحصص المكتتب بها" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-white" />
                                    </div>

                                    <div className="pt-2 flex gap-2">
                                        <Button 
                                            size="sm" 
                                            variant="primary" 
                                            onClick={() => {
                                                window.print();
                                            }} 
                                            className="flex-1 font-black"
                                            leftIcon={<Printer className="w-4 h-4" />}
                                        >
                                            {lang === 'ar' ? 'طباعة القرار مع التوثيق' : 'Print Resolution'}
                                        </Button>

                                        <Button 
                                            size="sm" 
                                            variant="secondary" 
                                            onClick={() => {
                                                setActiveTab('editor');
                                                addToast({ type: 'info', title: 'تم فتح المحرر', message: 'يمكنك الآن إضافة تعديلات وصياغات مخصصة للمستند.' });
                                            }} 
                                            className="flex-1 font-black"
                                            leftIcon={<Edit3 className="w-4 h-4" />}
                                        >
                                            {lang === 'ar' ? 'تعديل بالمحرر' : 'Edit in Canvas'}
                                        </Button>
                                    </div>
                                </Card>
                            </div>

                            {/* Live Draft Preview Canvas */}
                            <div className="lg:col-span-7">
                                <Card className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg font-serif space-y-6 text-slate-900 dark:text-slate-100 relative">
                                    <div className="text-center border-b pb-4 space-y-1">
                                        <div className="text-xs font-black text-amber-600 dark:text-amber-400">دولة الكويت - وزارة التجارة والصناعة (MOCI)</div>
                                        <h2 className="text-lg font-black text-slate-900 dark:text-white">{docTitle}</h2>
                                        <p className="text-[10px] text-slate-400 font-sans">مسجلة بموجب أحكام قانون الشركات رقم 1 لسنة 2016 ولائحته التنفيذية</p>
                                    </div>

                                    <div className="text-xs leading-relaxed whitespace-pre-wrap font-sans bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        {docContent || `محضر اجتماع الجمعية العامة العادية
لشركة: ${activeCompany?.companyNameAr}
السجل التجاري: ${activeCompany?.registrationNumber}

قرارات الجمعية العادية:
1. المصادقة التامة على تقرير مجلس الإدارة عن السنة المالية المنتهية والحسابات الختامية.
2. اعتماد تقرير مراقب الحسابات والمصادقة على الميزانية العمومية.
3. إبراء ذمة أعضاء مجلس الإدارة والمديرين عن إدارتهم للشركة خلال السنة المالية.`}
                                    </div>

                                    <div className="pt-6 border-t grid grid-cols-2 text-center text-xs font-bold font-sans">
                                        <div>
                                            <p className="text-slate-400 text-[10px]">توقيع رئيس الجلسة / رئيس مجلس الإدارة</p>
                                            <p className="mt-8 text-slate-800 dark:text-white font-black">....................................................</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-400 text-[10px]">خاتم ومصادقة الإدارة القانونية (مكتب صبري شطا)</p>
                                            <p className="mt-8 text-emerald-600 font-mono font-black">[معتمد وموثق بالسجل الرقمي]</p>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                        </div>
                    </div>
                )}

                {/* Annual Corporate Reports & Performance Dashboard */}
                {activeTab === 'reports' && (
                    <div className="space-y-6">
                        
                        {/* MOCI REGULATORY DEADLINES & BUDGET SUBMISSION ALERT ENGINE */}
                        <Card className="p-5 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/50 dark:from-slate-900 dark:to-slate-900 border-2 border-amber-300 rounded-3xl shadow-sm space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-black text-sm">
                                    <Bell className="w-5 h-5 text-amber-600 animate-bounce" />
                                    <span>{lang === 'ar' ? 'التنبيه الآلي لمواعيد تقديم الميزانيات والمتطلبات التنظيمية لوزارة التجارة (MOCI)' : 'Automated MOCI Budget & Regulatory Alert Engine'}</span>
                                </div>
                                <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full">
                                    {lang === 'ar' ? 'تحديث حي' : 'Live MOCI Sync'}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                                    <div className="text-[10px] font-black text-rose-600">🚨 الميزانية السنوية (MOCI)</div>
                                    <p className="text-xs font-black text-slate-800 dark:text-white mt-1">تقديم البيانات المالية 2025</p>
                                    <p className="text-[10px] text-rose-500 font-bold mt-1">باقي 28 يوماً قبل انتهاء المهلة</p>
                                </div>

                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-amber-200 dark:border-slate-700">
                                    <div className="text-[10px] font-black text-amber-600">⚠️ الترخيص التجاري</div>
                                    <p className="text-xs font-black text-slate-800 dark:text-white mt-1">تجديد رخصة وزارة التجارة</p>
                                    <p className="text-[10px] text-amber-600 font-bold mt-1">باقي 42 يوماً (الرخصة سارية)</p>
                                </div>

                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="text-[10px] font-black text-emerald-600">✅ غرفة التجارة والصناعة</div>
                                    <p className="text-xs font-black text-slate-800 dark:text-white mt-1">شهادة الانتساب السنوية</p>
                                    <p className="text-[10px] text-emerald-600 font-bold mt-1">مجددة ومستوفاة بالكامل</p>
                                </div>

                                <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="text-[10px] font-black text-indigo-600">ℹ️ اعتماد التوقيع (PACI)</div>
                                    <p className="text-xs font-black text-slate-800 dark:text-white mt-1">اعتماد المفوضين بالسجل</p>
                                    <p className="text-[10px] text-indigo-600 font-bold mt-1">ساري حتى ديسمبر 2026</p>
                                </div>
                            </div>
                        </Card>


                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5 text-indigo-500" />
                                    <span>{lang === 'ar' ? 'التقارير السنوية للشركة' : 'Annual Corporate Reports'}</span>
                                    <span className="text-xs bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-bold">
                                        {activeCompany?.companyNameAr || 'الشركة المحددة'}
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {lang === 'ar' 
                                        ? 'تحليل شامل لمعدلات الربحية والأداء السنوي ومؤشرات الامتثال للقوانين الكويتية' 
                                        : 'Comprehensive analysis of annual performance, profitability rates, and Kuwaiti corporate law compliance index'}
                                </p>
                            </div>

                            {/* Export / Print Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => {
                                        const capitalVal = activeCompany?.capital || 150000;
                                        const headers = ["Year", "Revenue (KWD)", "Expenses (KWD)", "Net Profit (KWD)", "Profitability Rate (%)", "Compliance Index (%)"];
                                        const rows = [
                                            ["2021", (capitalVal * 1.5).toFixed(0), (capitalVal * 1.2).toFixed(0), (capitalVal * 0.3).toFixed(0), "15", "82"],
                                            ["2022", (capitalVal * 1.8).toFixed(0), (capitalVal * 1.35).toFixed(0), (capitalVal * 0.45).toFixed(0), "18", "85"],
                                            ["2023", (capitalVal * 2.2).toFixed(0), (capitalVal * 1.6).toFixed(0), (capitalVal * 0.6).toFixed(0), "20", "89"],
                                            ["2024", (capitalVal * 2.6).toFixed(0), (capitalVal * 1.85).toFixed(0), (capitalVal * 0.75).toFixed(0), "22", "92"],
                                            ["2025", (capitalVal * 3.1).toFixed(0), (capitalVal * 2.1).toFixed(0), (capitalVal * 1.0).toFixed(0), "24", "96"]
                                        ];
                                        const csvContent = "data:text/csv;charset=utf-8," 
                                            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
                                        const encodedUri = encodeURI(csvContent);
                                        const link = document.createElement("a");
                                        link.setAttribute("href", encodedUri);
                                        link.setAttribute("download", `Annual_Report_${activeCompany?.companyNameAr || 'Company'}.csv`);
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                    }}
                                    className="flex items-center gap-1.5 text-xs py-2 px-3 rounded-full cursor-pointer"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{lang === 'ar' ? 'تصدير البيانات CSV' : 'Export CSV'}</span>
                                </Button>
                                <Button
                                    size="sm"
                                    variant="primary"
                                    onClick={() => window.print()}
                                    className="flex items-center gap-1.5 text-xs py-2 px-3 rounded-full cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>{lang === 'ar' ? 'طباعة التقرير المالي' : 'Print Report'}</span>
                                </Button>
                            </div>
                        </div>

                        {/* Summary KPI Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <Card className="p-4 bg-gradient-to-br from-indigo-500/5 to-indigo-500/10 border-none rounded-2xl flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">
                                        {lang === 'ar' ? 'إجمالي أرباح السنوات (5 سنوات)' : 'Total Cumulative Profits (5Y)'}
                                    </span>
                                    <div className="p-1 bg-indigo-500 text-white rounded-lg">
                                        <Coins className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                        {formatKWD((activeCompany?.capital || 150000) * 3.1)}
                                    </h3>
                                    <p className="text-[10px] text-emerald-500 font-bold mt-1 flex items-center gap-1">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        <span>+32% {lang === 'ar' ? 'نمو تراكمي مستمر' : 'cumulative growth'}</span>
                                    </p>
                                </div>
                            </Card>

                            <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 border-none rounded-2xl flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">
                                        {lang === 'ar' ? 'معدل الربحية التشغيلي' : 'Average Operating Profitability'}
                                    </span>
                                    <div className="p-1 bg-emerald-500 text-white rounded-lg">
                                        <TrendingUp className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                        24.2%
                                    </h3>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        {lang === 'ar' ? 'أعلى بنسبة 4.2% من متوسط السوق' : '4.2% higher than market avg'}
                                    </p>
                                </div>
                            </Card>

                            <Card className="p-4 bg-gradient-to-br from-amber-500/5 to-amber-500/10 border-none rounded-2xl flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">
                                        {lang === 'ar' ? 'معدل تسوية القضايا المغلقة' : 'Closed Cases Rate'}
                                    </span>
                                    <div className="p-1 bg-amber-500 text-white rounded-lg">
                                        <Scale className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                        94.1%
                                    </h3>
                                    <p className="text-[10px] text-amber-600 font-bold mt-1">
                                        {lang === 'ar' ? 'تم تسوية 32 قضية من أصل 34' : '32 out of 34 cases resolved'}
                                    </p>
                                </div>
                            </Card>

                            <Card className="p-4 bg-gradient-to-br from-teal-500/5 to-teal-500/10 border-none rounded-2xl flex flex-col justify-between">
                                <div className="flex justify-between items-start">
                                    <span className="text-[10px] uppercase font-bold text-slate-400">
                                        {lang === 'ar' ? 'مؤشر الامتثال لقانون العمل والشركات' : 'Kuwaiti Law Compliance Index'}
                                    </span>
                                    <div className="p-1 bg-teal-500 text-white rounded-lg">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                        96.0%
                                    </h3>
                                    <p className="text-[10px] text-teal-600 font-bold mt-1 flex items-center gap-1">
                                        <span>{lang === 'ar' ? 'درجة حوكمة ممتازة (AAA)' : 'Excellent Governance Rating'}</span>
                                    </p>
                                </div>
                            </Card>
                        </div>

                        {/* Detailed Reports and Charts Panel */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            
                            {/* Card 1: Annual Financial Performance */}
                            <Card className="p-6 bg-white dark:bg-dm-card rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                                <div>
                                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <BarChart2 className="w-4 h-4 text-indigo-500" />
                                        <span>{lang === 'ar' ? 'إحصائيات الأداء السنوي والمالي (د.ك)' : 'Annual Financial Performance (KWD)'}</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                                        {lang === 'ar' 
                                            ? 'مقارنة الإيرادات السنوية، المصروفات التشغيلية وصافي الأرباح التراكمية بناءً على رأس المال الدفتري' 
                                            : 'Comparison of annual revenues, operating expenses, and net profit based on company capital'}
                                    </p>
                                </div>

                                <div className="h-64 w-full text-xs">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={[
                                                { year: '2021', revenue: Math.round((activeCompany?.capital || 150000) * 1.5), expenses: Math.round((activeCompany?.capital || 150000) * 1.2), profit: Math.round((activeCompany?.capital || 150000) * 0.3) },
                                                { year: '2022', revenue: Math.round((activeCompany?.capital || 150000) * 1.8), expenses: Math.round((activeCompany?.capital || 150000) * 1.35), profit: Math.round((activeCompany?.capital || 150000) * 0.45) },
                                                { year: '2023', revenue: Math.round((activeCompany?.capital || 150000) * 2.2), expenses: Math.round((activeCompany?.capital || 150000) * 1.6), profit: Math.round((activeCompany?.capital || 150000) * 0.6) },
                                                { year: '2024', revenue: Math.round((activeCompany?.capital || 150000) * 2.6), expenses: Math.round((activeCompany?.capital || 150000) * 1.85), profit: Math.round((activeCompany?.capital || 150000) * 0.75) },
                                                { year: '2025', revenue: Math.round((activeCompany?.capital || 150000) * 3.1), expenses: Math.round((activeCompany?.capital || 150000) * 2.1), profit: Math.round((activeCompany?.capital || 150000) * 1.0) }
                                            ]}
                                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="opacity-40" />
                                            <XAxis dataKey="year" stroke="#94A3B8" fontSize={11} />
                                            <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(val) => `${val / 1000}k`} />
                                            <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} د.ك`, '']} />
                                            <Legend verticalAlign="top" height={36} iconType="circle" />
                                            <Bar name={lang === 'ar' ? 'الإيرادات' : 'Revenue'} dataKey="revenue" fill="#6366F1" radius={[4, 4, 0, 0]} />
                                            <Bar name={lang === 'ar' ? 'المصروفات' : 'Expenses'} dataKey="expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                                            <Bar name={lang === 'ar' ? 'الأرباح الصافية' : 'Net Profits'} dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* Card 2: Profitability and Compliance Trends */}
                            <Card className="p-6 bg-white dark:bg-dm-card rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                                <div>
                                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <TrendingUp className="w-4 h-4 text-teal-500" />
                                        <span>{lang === 'ar' ? 'علاقة معدلات الربحية ومؤشر الامتثال القانوني (%)' : 'Profitability Rates & Legal Compliance Index Correlation (%)'}</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                                        {lang === 'ar' 
                                            ? 'يوضح هذا الرسم البياني التفاعلي كيف يسهم تعزيز الامتثال لقوانين العمل والشركات الكويتية في زيادة الربحية وتجنب المخالفات والغرامات' 
                                            : 'This interactive chart demonstrates how tightening legal compliance positively correlates with profitability growth'}
                                    </p>
                                </div>

                                <div className="h-64 w-full text-xs">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart
                                            data={[
                                                { year: '2021', profitability: 15, compliance: 82 },
                                                { year: '2022', profitability: 18, compliance: 85 },
                                                { year: '2023', profitability: 20, compliance: 89 },
                                                { year: '2024', profitability: 22, compliance: 92 },
                                                { year: '2025', profitability: 24, compliance: 96 }
                                            ]}
                                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="opacity-40" />
                                            <XAxis dataKey="year" stroke="#94A3B8" fontSize={11} />
                                            <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
                                            <Tooltip formatter={(value: any) => [`${value}%`, '']} />
                                            <Legend verticalAlign="top" height={36} iconType="circle" />
                                            <Line name={lang === 'ar' ? 'معدل الربحية السنوي' : 'Profitability Rate'} type="monotone" dataKey="profitability" stroke="#10B981" strokeWidth={3} activeDot={{ r: 8 }} />
                                            <Line name={lang === 'ar' ? 'مؤشر الامتثال القانوني' : 'Compliance Index'} type="monotone" dataKey="compliance" stroke="#06B6D4" strokeWidth={3} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* Card 3: Closed Legal Disputes & Cases (Pie Chart) */}
                            <Card className="p-6 bg-white dark:bg-dm-card rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                                <div>
                                    <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                                        <Scale className="w-4 h-4 text-amber-500" />
                                        <span>{lang === 'ar' ? 'توزيع ملف القضايا والنزاعات المغلقة والمحسومة' : 'Governance & Closed Legal Disputes Breakdown'}</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                                        {lang === 'ar' 
                                            ? 'تصنيف الملفات والنزاعات القانونية والعمالية التي تمت تسويتها بنجاح طبقاً لقوانين التجارة والعمل بدولة الكويت' 
                                            : 'Classification of corporate & labor disputes settled in full compliance with Kuwaiti regulations'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                    <div className="h-56 w-full text-xs">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: lang === 'ar' ? 'قضايا عمالية (مستحقات ونهاية خدمة)' : 'Labor & Indemnity Cases', value: 15 },
                                                        { name: lang === 'ar' ? 'نزاعات عقود وموردين' : 'Supplier Contract Disputes', value: 9 },
                                                        { name: lang === 'ar' ? 'تحكيم ومطالبات تجارية' : 'Commercial Arbitration Claims', value: 6 },
                                                        { name: lang === 'ar' ? 'شؤون حماية الملكية والترخيص' : 'IP & MOCI License Compliance', value: 4 }
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    <Cell fill="#6366F1" />
                                                    <Cell fill="#3B82F6" />
                                                    <Cell fill="#F59E0B" />
                                                    <Cell fill="#10B981" />
                                                </Pie>
                                                <Tooltip formatter={(value: any) => [`${value} ${lang === 'ar' ? 'قضايا' : 'cases'}`, '']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>

                                    {/* Custom Legend */}
                                    <div className="space-y-3 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-neutral-light">{lang === 'ar' ? 'قضايا عمالية ونهاية خدمة' : 'Labor & Indemnity'}</p>
                                                <p className="text-[10px] text-slate-400">15 {lang === 'ar' ? 'ملف مغلق ومسوى (44%)' : 'cases closed (44%)'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-neutral-light">{lang === 'ar' ? 'نزاعات عقود وموردين' : 'Supplier Contract'}</p>
                                                <p className="text-[10px] text-slate-400">9 {lang === 'ar' ? 'ملفات مغلقة ومسواة (26%)' : 'cases closed (26%)'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-neutral-light">{lang === 'ar' ? 'تحكيم ومطالبات تجارية' : 'Commercial Claims'}</p>
                                                <p className="text-[10px] text-slate-400">6 {lang === 'ar' ? 'جلسات تسوية نهائية (18%)' : 'cases closed (18%)'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-neutral-light">{lang === 'ar' ? 'حماية الملكية والتراخيص' : 'IP & License Compliance'}</p>
                                                <p className="text-[10px] text-slate-400">4 {lang === 'ar' ? 'قضايا وتراخيص بلدية (12%)' : 'cases closed (12%)'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            {/* Card 4: Executive Compliance Recommendations */}
                            <Card className="p-6 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 dark:bg-dm-card rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-indigo-500 text-white rounded-xl">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-slate-900 dark:text-white">{lang === 'ar' ? 'التوصيات القانونية لحوكمة وامتثال الشركة' : 'Executive Legal Advisory & Governance Insights'}</h4>
                                        <p className="text-[10px] text-slate-400">{lang === 'ar' ? 'توصيات صادرة بناءً على لوائح وزارة التجارة وقانون العمل الكويتي' : 'Automated governance advisory backed by Kuwaiti statutory laws'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-950 flex gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-black text-emerald-600 dark:text-emerald-400">{lang === 'ar' ? 'قانونية محاضر الجمعيات العمومية' : 'General Assembly Legal Validation'}</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                {lang === 'ar' 
                                                    ? 'تم توثيق كافة محاضر الجمعيات العادية والغير عادية وإيداعها بنجاح في وزارة التجارة والصناعة (MOCI) ضمن الآجال القانونية الـ 15 يوماً.' 
                                                    : 'All ordinary and extraordinary general assemblies are recorded and registered at MOCI within the 15-day statutory limit.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-950 flex gap-3">
                                        <CheckCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-black text-indigo-600 dark:text-indigo-400">{lang === 'ar' ? 'هيكلة العقود وتواقيع المفوضين' : 'Signatory Threshold Compliance'}</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                {lang === 'ar' 
                                                    ? 'حدود المفوضين بالتوقيع متطابقة بالكامل مع السجلات التجارية المصادق عليها، ولا توجد ثغرات تعاقدية نشطة.' 
                                                    : 'Signatory limits are perfectly aligned with commercial registries; no corporate liability exposure detected.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-amber-100 dark:border-amber-950 flex gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-black text-amber-600 dark:text-amber-500">{lang === 'ar' ? 'توصيات قانون العمل الكويتي (تحديث 2026)' : 'Kuwait Labor Law Compliance Alert (2026)'}</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                {lang === 'ar' 
                                                    ? 'نوصي بجدولة الإجازات الدورية للموظفين بانتظام لتفادي تراكم رصيد الإجازات السنوية بما يزيد عن 60 يوماً وتجنب الالتزام المالي بالتعويض النقدي عند انتهاء الخدمة.' 
                                                    : 'Active recommendation to clear accrued annual leaves regularly, capping them to avoid significant cash-out liabilities under Kuwaiti Eos.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Card>

                        </div>
                    </div>
                )}

                {/* 9. AI Governance Copilot Assistant */}
                {activeTab === 'copilot' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-1 space-y-4">
                                <Card className="p-4 bg-indigo-500/5 rounded-2xl border-none">
                                    <h4 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-3">
                                        {tLocal.copilotPresets}
                                    </h4>
                                    <p className="text-[11px] text-slate-500 mb-4">اضغط على زر النموذج ليقوم المساعد بصياغته بناءً على بيانات الشركة المتاحة:</p>
                                    <div className="space-y-2">
                                        <Button
                                            onClick={() => handleTriggerCopilotPreset('minutes')}
                                            disabled={isAiLoading}
                                            variant="secondary"
                                            className="w-full text-right text-xs justify-start font-black py-2.5"
                                        >
                                            <span>{tLocal.presetMinutes}</span>
                                        </Button>
                                        <Button
                                            onClick={() => handleTriggerCopilotPreset('extraordinary')}
                                            disabled={isAiLoading}
                                            variant="secondary"
                                            className="w-full text-right text-xs justify-start font-black py-2.5"
                                        >
                                            <span>{tLocal.presetExtraordinary}</span>
                                        </Button>
                                        <Button
                                            onClick={() => handleTriggerCopilotPreset('resolution')}
                                            disabled={isAiLoading}
                                            variant="secondary"
                                            className="w-full text-right text-xs justify-start font-black py-2.5"
                                        >
                                            <span>{tLocal.presetResolution}</span>
                                        </Button>
                                    </div>
                                </Card>
                            </div>

                            <div className="lg:col-span-3 flex flex-col h-[500px] bg-white dark:bg-dm-card rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md">
                                <div className="p-4 border-b flex gap-3 items-center bg-indigo-500/5 rounded-t-3xl">
                                    <div className="p-2 bg-indigo-500 text-white rounded-xl">
                                        <Sparkles className="w-5 h-5 flex-shrink-0 animate-pulse" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-sm text-slate-900 dark:text-white">{lang === 'ar' ? 'المستشار والحوكمة الآلي' : 'AI Advisor'}</h4>
                                        <p className="text-[10px] text-slate-400">تحليل فوري لصلاحية ونصوص الجمعيات العمومية</p>
                                    </div>
                                </div>

                                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                                    {chatMessages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`p-4 rounded-3xl max-w-xl text-xs leading-relaxed whitespace-pre-wrap ${
                                                msg.role === 'user' 
                                                ? 'bg-primary text-white' 
                                                : 'bg-stone-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                            }`}>
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                    ))}
                                    {isAiLoading && (
                                        <div className="flex justify-start">
                                            <div className="bg-stone-50 dark:bg-slate-800 p-3.5 rounded-2xl text-xs text-slate-400 animate-pulse">
                                                جاري استشارة وتجميع نصوص الهياكل...
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <div className="p-3 border-t flex gap-2">
                                    <input
                                        type="text"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendCustomCopilotMessage()}
                                        placeholder={tLocal.copilotAskPrompt}
                                        className="flex-grow border px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 dark:border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-slate-850 dark:text-white"
                                    />
                                    <Button
                                        onClick={handleSendCustomCopilotMessage}
                                        disabled={!chatInput.trim() || isAiLoading}
                                        className="rounded-full px-5 py-2.5 font-bold flex items-center justify-center cursor-pointer"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* --- DIALOG MODALS --- */}

            {/* 1. Company Profile Create / Edit Modal */}
            <Modal isOpen={isCompanyModalOpen} onClose={() => setIsCompanyModalOpen(false)} title={editingCompany ? tLocal.editCompany : tLocal.addCompany} size="lg">
                <form onSubmit={handleSaveCompany} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label={tLocal.companyNameAr} name="companyNameAr" defaultValue={editingCompany?.companyNameAr || ''} required />
                        <Input label={tLocal.companyNameEn} name="companyNameEn" defaultValue={editingCompany?.companyNameEn || ''} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label={tLocal.legalForm}
                            name="legalForm"
                            defaultValue={editingCompany?.legalForm || CompanyLegalFormKuwait.LIMITED_LIABILITY}
                            options={Object.values(CompanyLegalFormKuwait).map(v => ({ value: v, label: v }))}
                        />

                        <Input label={tLocal.regNumber} name="registrationNumber" defaultValue={editingCompany?.registrationNumber || ''} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label={tLocal.licenseNumber} name="tradeLicenseNumber" defaultValue={editingCompany?.tradeLicenseNumber || ''} />
                        <Input label={tLocal.chamberNumber} name="chamberOfCommerceNumber" defaultValue={editingCompany?.chamberOfCommerceNumber || ''} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label={tLocal.estDate} name="establishmentDate" type="date" defaultValue={editingCompany?.establishmentDate || ''} />
                        <Input label={tLocal.auditor} name="auditorName" defaultValue={editingCompany?.auditorName || ''} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label={tLocal.capital} name="capital" type="number" defaultValue={editingCompany?.capital?.toString() || ''} />
                        <Input label={tLocal.paidCapital} name="paidUpCapital" type="number" defaultValue={editingCompany?.paidUpCapital?.toString() || ''} />
                    </div>

                    <Input label={tLocal.address} name="headOfficeAddress" defaultValue={editingCompany?.headOfficeAddress || ''} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label={tLocal.phone} name="phone" defaultValue={editingCompany?.contactInfo?.phone || ''} />
                        <Input label={tLocal.email} name="email" type="email" defaultValue={editingCompany?.contactInfo?.email || ''} />
                        <Input label={tLocal.website} name="website" defaultValue={editingCompany?.contactInfo?.website || ''} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label={tLocal.fiscalEnd} name="fiscalYearEnd" placeholder="12-31" defaultValue={editingCompany?.fiscalYearEnd || '12-31'} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setIsCompanyModalOpen(false)}>{tLocal.cancelBtn}</Button>
                        <Button type="submit" variant="primary" className="font-bold">{tLocal.saveBtn}</Button>
                    </div>
                </form>
            </Modal>

            {/* 2. Shareholder / Partner Modal */}
            <Modal isOpen={isShareholderModalOpen} onClose={() => setIsShareholderModalOpen(false)} title={editingShareholder ? "تعديل بيانات الشريك" : "قيد شريك جديد"} size="md">
                <form onSubmit={handleSaveShareholderObj} className="space-y-4">
                    <Input label={tLocal.shareholderName} name="shName" defaultValue={editingShareholder?.name || ''} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label={tLocal.shareholderNationality} name="shNationality" defaultValue={editingShareholder?.nationality || ''} />
                        <Input label={tLocal.civilId} name="shCivilId" defaultValue={editingShareholder?.civilIdOrRegNumber || ''} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label={tLocal.sharePercentage} name="shPercentage" type="number" step="0.01" defaultValue={editingShareholder?.sharePercentage || ''} />
                        <Input label={tLocal.numberOfShares} name="shShares" type="number" defaultValue={editingShareholder?.numberOfShares || ''} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label={tLocal.shareClass} name="shClass" placeholder="حصص نقدية / عادية / ممتازة" defaultValue={editingShareholder?.shareClass || ''} />
                        <Select
                            label={tLocal.votingRights}
                            name="shVoting"
                            defaultValue={editingShareholder?.votingRights ? 'true' : 'false'}
                            options={[
                                { value: 'true', label: lang === 'ar' ? 'مسموح بالتصويت' : 'Allowed' },
                                { value: 'false', label: lang === 'ar' ? 'غير مصرح' : 'Deauthorized' }
                            ]}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setIsShareholderModalOpen(false)}>{tLocal.cancelBtn}</Button>
                        <Button type="submit" variant="primary" className="font-bold">{tLocal.saveBtn}</Button>
                    </div>
                </form>
            </Modal>

            {/* 3. Board Member Modal */}
            <Modal isOpen={isBoardModalOpen} onClose={() => setIsBoardModalOpen(false)} title="إضافة رتبة بمجلس الإدارة" size="md">
                <form onSubmit={handleSaveBoardMemberObj} className="space-y-4">
                    <Input label="اسم عضو مجلس الإدارة" name="bmName" defaultValue={editingBoard?.name || ''} required />
                    <Select
                        label={tLocal.boardPosition}
                        name="bmPosition"
                        defaultValue={editingBoard?.position || BoardMemberPosition.MEMBER}
                        options={Object.values(BoardMemberPosition).map(p => ({ value: p, label: p }))}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label={tLocal.appointmentDate} name="bmAppointmentDate" type="date" defaultValue={editingBoard?.appointmentDate || ''} />
                        <Input label={tLocal.termEndDate} name="bmTermEndDate" type="date" defaultValue={editingBoard?.termEndDate || ''} />
                    </div>

                    <Select
                        label={tLocal.isAuthorized}
                        name="bmIsSignatory"
                        defaultValue={editingBoard?.isAuthorizedSignatory ? 'true' : 'false'}
                        options={[
                            { value: 'true', label: 'نعم' },
                            { value: 'false', label: 'لا' }
                        ]}
                    />

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setIsBoardModalOpen(false)}>{tLocal.cancelBtn}</Button>
                        <Button type="submit" variant="primary" className="font-bold">{tLocal.saveBtn}</Button>
                    </div>
                </form>
            </Modal>

            {/* 4. Authorized Signatory Modal */}
            <Modal isOpen={isSignatoryModalOpen} onClose={() => setIsSignatoryModalOpen(false)} title="إدارة توقيعات المفوضين" size="md">
                <form onSubmit={handleSaveSignatoryObj} className="space-y-4">
                    <Input label="اسم المفوض بالتوقيع" name="asName" defaultValue={editingSignatory?.name || ''} required />
                    <Input label="الصفة الوظيفية (مثل: مدير عام)" name="asTitle" defaultValue={editingSignatory?.title || ''} />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="الحد الأقصى المالي (د.ك)" name="asLimit" type="number" placeholder="0 = غير محدود" defaultValue={editingSignatory?.authorityLimit || ''} />
                        <Input label="صالح لغاية تاريخ" name="asUntil" type="date" defaultValue={editingSignatory?.authorizedUntil || ''} />
                    </div>

                    <Select
                        label="توقيع مشترك؟"
                        name="asJoint"
                        defaultValue={editingSignatory?.jointSignatureRequired ? 'true' : 'false'}
                        options={[
                            { value: 'true', label: 'يشترط توقيع مشترك' },
                            { value: 'false', label: 'منفرد ومستقل' }
                        ]}
                    />

                    <TextArea label={tLocal.scopeOfAuthority} name="asScope" defaultValue={editingSignatory?.signatureScope || ''} rows={4} required />

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setIsSignatoryModalOpen(false)}>{tLocal.cancelBtn}</Button>
                        <Button type="submit" variant="primary" className="font-bold">{tLocal.saveBtn}</Button>
                    </div>
                </form>
            </Modal>

            {/* 5. Assembly & Board Meetings Modal */}
            <Modal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} title="توثيق جلسة / محضر اجتماع" size="lg">
                <form onSubmit={handleSaveMeetingObj} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label={tLocal.meetingType}
                            name="meetType"
                            defaultValue={editingMeeting?.meetingType || CompanyMeetingType.ORDINARY_GENERAL_ASSEMBLY}
                            options={Object.values(CompanyMeetingType).map(v => ({ value: v, label: v }))}
                        />

                        <Input label={tLocal.meetingDate} name="meetDate" type="date" defaultValue={editingMeeting?.meetingDate || ''} required />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label={tLocal.meetingTime} name="meetTime" placeholder="10:00" defaultValue={editingMeeting?.meetingTime || ''} />
                        <Input label={tLocal.location} name="meetLocation" defaultValue={editingMeeting?.meetingLocation || ''} />
                    </div>

                    <Input label={tLocal.attendees} name="meetAttendees" placeholder="تفصل بين الأسماء بفاصلة" defaultValue={editingMeeting?.attendees?.join(', ') || ''} />

                    <TextArea label={tLocal.agenda} name="meetAgenda" defaultValue={editingMeeting?.agendaItems || ''} rows={4} required />
                    <TextArea label={tLocal.resolutions} name="meetResolutions" defaultValue={editingMeeting?.resolutionsPassed || ''} rows={4} />

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setIsMeetingModalOpen(false)}>{tLocal.cancelBtn}</Button>
                        <Button type="submit" variant="primary" className="font-bold">{tLocal.saveBtn}</Button>
                    </div>
                </form>
            </Modal>

            {/* 6. Corporate Action / Structural Revision Modal */}
            <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} title="توثيق إجراء وهيكلة قانونية" size="md">
                <form onSubmit={handleSaveActionObj} className="space-y-4">
                    <Select
                        label="نوع الإجراء"
                        name="actType"
                        defaultValue={editingAction?.actionType || CorporateActionType.OTHER}
                        options={Object.values(CorporateActionType).map(v => ({ value: v, label: v }))}
                    />

                    <Input label="الوصف السريع" name="actDesc" defaultValue={editingAction?.description || ''} required />
                    <Input label="التاريخ" name="actDate" type="date" defaultValue={editingAction?.actionDate || ''} />

                    <Select
                        label="الحالة"
                        name="actStatus"
                        defaultValue={editingAction?.status || CorporateActionStatus.IN_PROGRESS}
                        options={Object.values(CorporateActionStatus).map(v => ({ value: v, label: v }))}
                    />

                    <TextArea label="تفاصيل وخطوات الإجراء والامتثال" name="actDetails" defaultValue={editingAction?.details || ''} rows={4} />

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setIsActionModalOpen(false)}>{tLocal.cancelBtn}</Button>
                        <Button type="submit" variant="primary" className="font-bold">{tLocal.saveBtn}</Button>
                    </div>
                </form>
            </Modal>

            {/* 7. Legal Document Repository Modal */}
            <Modal isOpen={isDocModalOpen} onClose={() => setIsDocModalOpen(false)} title="إيداع مستند وتراخيص بالخزنة" size="md">
                <form onSubmit={handleSaveDocObj} className="space-y-4">
                    <Input label="عنوان المستند" name="docTitle" defaultValue={editingDoc?.title || ''} required />

                    <Select
                        label="نوع المستند"
                        name="docType"
                        defaultValue={editingDoc?.documentType || CompanyDocumentType.FOUNDING_DOCUMENT}
                        options={Object.values(CompanyDocumentType).map(v => ({ value: v, label: v }))}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="تاريخ المستند" name="docDate" type="date" defaultValue={editingDoc?.documentDate || ''} />
                        <Select
                            label="الحالة"
                            name="docStatus"
                            defaultValue={editingDoc?.status || CompanyDocumentStatus.ACTIVE}
                            options={Object.values(CompanyDocumentStatus).map(v => ({ value: v, label: v }))}
                        />
                    </div>

                    <Input label="كلمات مفتاحية (تفصل بفاصلة كـ: رخصة، بلدية)" name="docKeywords" defaultValue={editingDoc?.keywords?.join(', ') || ''} />

                    <TextArea label="ملاحظات توثيقية" name="docNotes" defaultValue={editingDoc?.notes || ''} rows={3} />

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={() => setIsDocModalOpen(false)}>{tLocal.cancelBtn}</Button>
                        <Button type="submit" variant="primary" className="font-bold">{tLocal.saveBtn}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
