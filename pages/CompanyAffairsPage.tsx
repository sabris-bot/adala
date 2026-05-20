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
    Edit3
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
        tabProfile: "ملف الشركة والتفتيش",
        tabStructure: "الملاك وهيكل رأس المال",
        tabBoard: "مجلس الإدارة واللجان",
        tabSignatories: "التوقيعات والمفوضين",
        tabMeetings: "الجمعيات وفهرس المحاضر",
        tabActions: "التعديلات والمرئيات الرياضية",
        tabDocuments: "السداد والمستندات والخطابات",
        tabTimeline: "سجل العمليات التاريخية",
        tabCopilot: "مستشار الحوكمة الذكي",
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
        tabProfile: "Profile & Site License",
        tabStructure: "Partners & Cap Table",
        tabBoard: "Board & Committees",
        tabSignatories: "Signatories & Scope",
        tabMeetings: "Assemblies & Minutes",
        tabActions: "Amendments & Restruct",
        tabDocuments: "Document Safe & Files",
        tabTimeline: "Milestone Audit Log",
        tabCopilot: "Governance AI Copilot",
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
    const [activeTab, setActiveTab] = useState<string>('profile');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [filterLegalForm, setFilterLegalForm] = useState<string>('ALL');
    const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
    const [showArchivedCompanies, setShowArchivedCompanies] = useState<boolean>(false);
    const [showNotificationList, setShowNotificationList] = useState<boolean>(false);

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

            {/* Active Company Workspace Selector */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
                <div className="lg:col-span-8">
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-white dark:bg-dm-card p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-[1.7rem] bg-indigo-500/5 text-indigo-600 flex items-center justify-center font-black shadow-lg shadow-indigo-500/5">
                                    <Building2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1 rounded-full">
                                        {tLocal.activeCompany}
                                    </span>
                                    <h2 className="text-lg md:text-xl font-black mt-1.5 text-slate-900 dark:text-white">
                                        {lang === 'ar' ? activeCompany?.companyNameAr : (activeCompany?.companyNameEn || activeCompany?.companyNameAr)}
                                    </h2>
                                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                        <span>{activeCompany?.legalForm}</span> • 
                                        <span>{tLocal.regNumber}: <span className="font-mono text-indigo-600 font-bold">{activeCompany?.registrationNumber}</span></span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] text-slate-400">{tLocal.changeCompany}</span>
                                    <select
                                        value={selectedCompanyId}
                                        onChange={(e) => setSelectedCompanyId(e.target.value)}
                                        className="mt-1 block w-48 md:w-60 bg-slate-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 py-1.5 px-3 rounded-full text-xs font-black focus:outline-none focus:ring-2 focus:ring-primary text-slate-800 dark:text-white"
                                    >
                                        {companies.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {lang === 'ar' ? c.companyNameAr : (c.companyNameEn || c.companyNameAr)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Button
                                    variant="ghost"
                                    onClick={() => { setEditingCompany(activeCompany); setIsCompanyModalOpen(true); }}
                                    className="p-3 hover:bg-slate-100 rounded-full mt-4 flex items-center justify-center cursor-pointer"
                                >
                                    <Edit3 className="w-4 h-4 text-gray-500" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4">
                    <Card className="rounded-[2.5rem] border-none shadow-xl bg-slate-900 dark:bg-dm-card p-6 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/15 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                        <div className="relative z-10">
                            <span className="text-[9px] uppercase tracking-wider font-black text-indigo-300">{tLocal.complianceStatus}</span>
                            <div className="flex items-center gap-2.5 mt-3">
                                <CheckCircle className="w-8 h-8 text-emerald-400" />
                                <div>
                                    <p className="text-xl font-black">94% (امتثال ممتاز)</p>
                                    <p className="text-[10px] text-slate-300">مطابق لقرارات الهيئات الرقابية ووزارة التجارة</p>
                                </div>
                            </div>
                            <div className="mt-5 text-right">
                                <button
                                    onClick={() => setShowArchivedCompanies(!showArchivedCompanies)}
                                    className="text-[10px] font-black underline hover:text-indigo-200 cursor-pointer"
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
                    { key: 'profile', label: tLocal.tabProfile, icon: Building2 },
                    { key: 'structure', label: tLocal.tabStructure, icon: Users },
                    { key: 'board', label: tLocal.tabBoard, icon: ShieldCheck },
                    { key: 'signatories', label: tLocal.tabSignatories, icon: Key },
                    { key: 'meetings', label: tLocal.tabMeetings, icon: BookOpen },
                    { key: 'actions', label: tLocal.tabActions, icon: Scale },
                    { key: 'documents', label: tLocal.tabDocuments, icon: FileText },
                    { key: 'timeline', label: tLocal.tabTimeline, icon: History },
                    { key: 'copilot', label: tLocal.tabCopilot, icon: Sparkles }
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

            {/* TAB CONTENT AREA */}
            <main className="min-h-96">
                {/* 1. Profile Tab */}
                {activeTab === 'profile' && (
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
                {activeTab === 'structure' && (
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
                {activeTab === 'board' && (
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
                {activeTab === 'signatories' && (
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
                {activeTab === 'meetings' && (
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
                {activeTab === 'actions' && (
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
                {activeTab === 'documents' && (
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
