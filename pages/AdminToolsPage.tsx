import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
    Plus, Pencil, Trash2, Eye, Calendar, Clock, BarChart2, FileText, Search, 
    Activity, RefreshCw, Copy, Check, AlertTriangle, CheckCircle2, Share2, Printer, 
    Sparkles, Filter, ChevronDown, User, Users, Bell, FileSpreadsheet, 
    MapPin, ArrowUpRight, Folder, MessageSquare, Clipboard, Download, Send,
    Zap, ShieldCheck, Award, Lock, Command, Phone, Mail, MessageCircle,
    CheckCheck, Key, FileCheck, Building, Sliders, UserCheck, X, Layers,
    Compass, CheckSquare, Globe, SlidersHorizontal, ShieldAlert, ArrowLeftRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
    Tooltip as RechartsTooltip, Legend, LineChart, Line, CartesianGrid 
} from 'recharts';

import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import TextArea from '../components/ui/TextArea';
import Modal from '../components/ui/Modal';
import SignaturePad from '../components/ui/SignaturePad';
import { useToast } from '../components/ui/Toast';
import PrintHeader from '../components/ui/PrintHeader';
import { useCaseTask } from '../components/CaseTaskContext';
import { geminiService } from '../services/geminiService';
import { notificationService } from '../services/notificationService';
import ReactMarkdown from 'react-markdown';

import { AdminTask, AdminTaskStatus, AdminTaskPriority, AdminTaskCategory, NotificationPriority, NotificationCategory } from '../types';

// ==========================================
// TYPES & MOCK DATA FOR ADMIN TOOLS
// ==========================================

export type AdminRole = 'GeneralManager' | 'BranchLawyer' | 'AdminDelegate';

export interface AdminContact {
    id: string;
    name: string;
    type: 'client' | 'opponent' | 'lawyer' | 'partner' | 'expert' | 'government';
    categoryTitle: string;
    phone: string;
    email: string;
    civilId?: string;
    companyName?: string;
    address: string;
    notes: string;
    linkedCasesCount: number;
    linkedContractsCount: number;
    linkedTasksCount: number;
    lastContactDate: string;
}

export interface AdminRule {
    id: string;
    title: string;
    triggerEvent: string;
    channel: 'SMS' | 'Email' | 'InApp' | 'WhatsApp';
    recipientRole: string;
    timeframe: string;
    isActive: boolean;
}

export interface AuditLogItem {
    id: string;
    timestamp: string;
    user: string;
    role: string;
    action: string;
    module: string;
    details: string;
    ip: string;
    status: 'success' | 'warning' | 'info';
}

const INITIAL_CONTACTS: AdminContact[] = [
    {
        id: 'CNT-101',
        name: 'خالد عبد الرحمن الساير',
        type: 'client',
        categoryTitle: 'موكل - قطاع أفراد',
        phone: '+965 99001122',
        email: 'k.alsayer@example.kw',
        civilId: '288051200192',
        address: 'الكويت - ضاحية عبد الله السالم - قطعة 2 - شارع 14',
        notes: 'موكل رئيسي بقضايا تجارية وعمالية كبرى بمكتب المحامي صبري شطا.',
        linkedCasesCount: 5,
        linkedContractsCount: 3,
        linkedTasksCount: 8,
        lastContactDate: '2026-08-01'
    },
    {
        id: 'CNT-102',
        name: 'شركة الأمل الدولية للتجارة العامة',
        type: 'client',
        categoryTitle: 'موكل - شركة تجارية',
        phone: '+965 22448899',
        email: 'info@alamal-kw.com',
        civilId: '1029384756',
        companyName: 'مجموعة الأمل القابضة',
        address: 'الكويت - العاصمة - برج الكوبرا - الدور 18',
        notes: 'عقد استشارات سنوي مفتوح - تحصيل ديون وإشهار إفلاس.',
        linkedCasesCount: 12,
        linkedContractsCount: 7,
        linkedTasksCount: 15,
        lastContactDate: '2026-07-30'
    },
    {
        id: 'CNT-103',
        name: 'بنك الخليج المتحد الاستثماري',
        type: 'partner',
        categoryTitle: 'شريك مالي ومؤسسي',
        phone: '+965 1805555',
        email: 'legal@ubg-bank.com.kw',
        address: 'الكويت - الشرق - الشارع الجديد',
        notes: 'الجهة المالية المصنفة لقضايا الرهن والمديونيات المصرفية.',
        linkedCasesCount: 18,
        linkedContractsCount: 10,
        linkedTasksCount: 22,
        lastContactDate: '2026-08-02'
    },
    {
        id: 'CNT-104',
        name: 'مكتب الخبير الحسابي د. عادل المرزوق',
        type: 'expert',
        categoryTitle: 'خبير قضائي معتمد',
        phone: '+965 97223344',
        email: 'marzouk.expert@law.kw',
        address: 'الكويت - المرقاب - برج السور - الدور 12',
        notes: 'خبير هندسي وحسابي معتمد لدى إدارة الخبراء بوزارة العدل.',
        linkedCasesCount: 4,
        linkedContractsCount: 1,
        linkedTasksCount: 6,
        lastContactDate: '2026-07-28'
    },
    {
        id: 'CNT-105',
        name: 'إدارة التنفيذ - وزارة العدل (مجمع الرقعي)',
        type: 'government',
        categoryTitle: 'جهة قضائية رسمية',
        phone: '+965 24881100',
        email: 'moj.execution@moj.gov.kw',
        address: 'الكويت - الفروانية - مجمع محاكم الرقعي',
        notes: 'جهة إيداع صحف الدعاوى وأوامر الأداء ومنع السفر.',
        linkedCasesCount: 45,
        linkedContractsCount: 0,
        linkedTasksCount: 30,
        lastContactDate: '2026-08-02'
    },
    {
        id: 'CNT-106',
        name: 'أحمد محمود الصباح',
        type: 'lawyer',
        categoryTitle: 'محامي فرع - شؤون تنفيذ',
        phone: '+965 66112233',
        email: 'a.alsabah@shattalaw.com',
        address: 'مكتب المحامي صبري شطا - فرع العاصمة',
        notes: 'محامي مسؤول عن حضور جلسات الخبرة وإيداع العرائض العاجلة.',
        linkedCasesCount: 14,
        linkedContractsCount: 2,
        linkedTasksCount: 11,
        lastContactDate: '2026-08-02'
    }
];

const INITIAL_RULES: AdminRule[] = [
    {
        id: 'RL-101',
        title: 'تنبيه إيداع العرائض قبل 72 ساعة من الجلسة',
        triggerEvent: 'اقتراب موعد الجلسة أو الموعد النهائي للإيداع',
        channel: 'InApp',
        recipientRole: 'محامي الفرع + المندوب الإداري',
        timeframe: 'قبل 72 ساعة',
        isActive: true
    },
    {
        id: 'RL-102',
        title: 'إشعار عاجل عبر WhatsApp عند تجاوز السقف الزمني للمهمة',
        triggerEvent: 'تأخر المهمة عن موعدها المحدد دون إنجاز',
        channel: 'WhatsApp',
        recipientRole: 'المدير العام (أ. صبري شطا)',
        timeframe: 'فوري عند التأخير',
        isActive: true
    },
    {
        id: 'RL-103',
        title: 'تأكيد استلام أوراق التنفيذ القضائي بالبريد الإلكتروني',
        triggerEvent: 'تحديث حالة مهمة المتابعة الميدانية إلى تم التسليم',
        channel: 'Email',
        recipientRole: 'الموكل + السكرتارية',
        timeframe: 'خلال 15 دقيقة',
        isActive: true
    },
    {
        id: 'RL-104',
        title: 'تنبيه جلسات الخبراء الصباحية اليومية',
        triggerEvent: 'حلول الساعة 07:30 صباحاً ليوم الجلسة',
        channel: 'SMS',
        recipientRole: 'فريق العمل الميداني',
        timeframe: 'يومياً الساعة 07:30 ص',
        isActive: false
    }
];

const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
    {
        id: 'LOG-8801',
        timestamp: '2026-08-02 09:42:10',
        user: 'أستاذ صبري شطا',
        role: 'المدير العام',
        action: 'صياغة وتوقيع عريضة دفاع',
        module: 'منشئ العرائض السريع',
        details: 'تم توقيع مذكرة دفاع ختامية إلكترونياً للمهمة #TK-102 (قضية الساير ضد الشركة الوطنية)',
        ip: '197.220.14.88',
        status: 'success'
    },
    {
        id: 'LOG-8802',
        timestamp: '2026-08-02 08:30:15',
        user: 'المندوب جاسم العلي',
        role: 'المندوب الإداري',
        action: 'تحديث الموقع الميداني',
        module: 'المتابعة الميدانية',
        details: 'تسجيل تواجد بمحيط مجمع محاكم الرقعي لإيداع صحيفة دعوى استئنافية',
        ip: '197.220.19.12',
        status: 'info'
    },
    {
        id: 'LOG-8803',
        timestamp: '2026-08-01 16:15:00',
        user: 'أ. أحمد الصباح',
        role: 'محامي الفرع',
        action: 'تعديل بيانات جهة اتصال',
        module: 'دليل جهات الاتصال',
        details: 'تحديث رقم الهاتف والسجل التجاري لـ شركة الأمل الدولية',
        ip: '197.220.14.92',
        status: 'success'
    },
    {
        id: 'LOG-8804',
        timestamp: '2026-08-01 14:00:22',
        user: 'النظام الآلي (رول المحاكم)',
        role: 'System Bot',
        action: 'تزامن آلي مع وزارة العدل',
        module: 'الرول الآلي',
        details: 'تم سحب 14 قرار جلسة جديدة من بوابة العدل الإلكترونية وتحديث المهل',
        ip: 'Internal API',
        status: 'success'
    },
    {
        id: 'LOG-8805',
        timestamp: '2026-08-01 11:20:05',
        user: 'السكرتارية الإدارية',
        role: 'سكرتارية',
        action: 'إنشاء قاعدة إشعار مخصصة',
        module: 'مركز الإشعارات',
        details: 'تفعيل إشعار SMS تلقائي لمواعيد الطعون والمدد القانونية',
        ip: '197.220.14.101',
        status: 'warning'
    }
];

export const AdminToolsPage: React.FC = () => {
    const { tasks, setTasks, addTask, updateTask, deleteTask } = useCaseTask();
    const { addToast } = useToast();

    // ==========================================
    // STATE MANAGEMENT
    // ==========================================
    
    // Active Navigation Module Tab
    const [activeTab, setActiveTab] = useState<'tasks' | 'contacts' | 'notifications' | 'analytics' | 'settings'>('tasks');
    
    // Role Switcher State
    const [currentRole, setCurrentRole] = useState<AdminRole>('GeneralManager');
    
    // Search & Global Filter Bar State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterPriority, setFilterPriority] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterLawyer, setFilterLawyer] = useState<string>('all');
    const [filterDepartment, setFilterDepartment] = useState<string>('all');

    // Global Search Modal State (⌘K)
    const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);

    // Urgent Alert Banner Dismiss State
    const [isAlertDismissed, setIsAlertDismissed] = useState(false);

    // Module 1: Task Management State
    const [taskViewMode, setTaskViewMode] = useState<'kanban' | 'list'>('kanban');
    const [selectedTaskForPetition, setSelectedTaskForPetition] = useState<AdminTask | null>(null);
    const [isPetitionModalOpen, setIsPetitionModalOpen] = useState(false);
    const [petitionType, setPetitionType] = useState('مذكرة دفاع ختامية أمام الدائرة العمالية');
    const [petitionContent, setPetitionContent] = useState('');
    const [isAiGeneratingPetition, setIsAiGeneratingPetition] = useState(false);
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);

    // Module 2: Contacts Directory State
    const [contacts, setContacts] = useState<AdminContact[]>(INITIAL_CONTACTS);
    const [contactTypeFilter, setContactTypeFilter] = useState<string>('all');
    const [selectedContact, setSelectedContact] = useState<AdminContact | null>(null);
    const [isContactModalOpen, setIsContactModalOpen] = useState(false);
    const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
    const [whatsappModalContact, setWhatsappModalContact] = useState<AdminContact | null>(null);
    const [whatsappMessageText, setWhatsappMessageText] = useState('');
    const [newNoteText, setNewNoteText] = useState('');

    // Module 3: Notifications Center State
    const [notificationRules, setNotificationRules] = useState<AdminRule[]>(INITIAL_RULES);
    const [notifCategoryFilter, setNotifCategoryFilter] = useState<string>('all');
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [newRuleTitle, setNewRuleTitle] = useState('');
    const [newRuleTrigger, setNewRuleTrigger] = useState('اقتراب موعد الجلسة بـ 24 ساعة');
    const [newRuleChannel, setNewRuleChannel] = useState<'SMS' | 'Email' | 'InApp' | 'WhatsApp'>('WhatsApp');

    // Module 4: Analytics State
    const [analyticsTimeframe, setAnalyticsTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

    // Module 5: Settings & RBAC State
    const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
    const [rolePermissions, setRolePermissions] = useState({
        GeneralManager: { approvePetitions: true, assignTasks: true, editContacts: true, exportFinancials: true, viewAuditLogs: true },
        BranchLawyer: { approvePetitions: true, assignTasks: true, editContacts: true, exportFinancials: false, viewAuditLogs: false },
        AdminDelegate: { approvePetitions: false, assignTasks: false, editContacts: false, exportFinancials: false, viewAuditLogs: false }
    });

    // AI Assistant State
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isAiProcessing, setIsAiProcessing] = useState(false);

    // Keyboard Shortcut (⌘K / Ctrl+K) Listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                setIsGlobalSearchOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // ==========================================
    // FILTERED DATA COMPUTATIONS
    // ==========================================

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            // Keyword Search
            const matchesKeyword = !searchTerm || 
                t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (t.caseTitle && t.caseTitle.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (t.assignedTo && t.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()));

            // Priority Filter
            const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;

            // Status Filter
            const matchesStatus = filterStatus === 'all' || t.status === filterStatus;

            // Lawyer Filter
            const matchesLawyer = filterLawyer === 'all' || (t.assignedTo && t.assignedTo.includes(filterLawyer));

            // Department Filter
            const matchesDept = filterDepartment === 'all' || (t.category && t.category.includes(filterDepartment));

            return matchesKeyword && matchesPriority && matchesStatus && matchesLawyer && matchesDept;
        });
    }, [tasks, searchTerm, filterPriority, filterStatus, filterLawyer, filterDepartment]);

    const filteredContacts = useMemo(() => {
        return contacts.filter(c => {
            const matchesKeyword = !searchTerm || 
                c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                c.phone.includes(searchTerm) ||
                (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (c.civilId && c.civilId.includes(searchTerm));

            const matchesType = contactTypeFilter === 'all' || c.type === contactTypeFilter;
            return matchesKeyword && matchesType;
        });
    }, [contacts, searchTerm, contactTypeFilter]);

    // Urgent items count for status alert badge
    const urgentTasksCount = useMemo(() => {
        return tasks.filter(t => t.priority === AdminTaskPriority.CRITICAL || t.priority === AdminTaskPriority.HIGH || t.status === AdminTaskStatus.BLOCKED).length;
    }, [tasks]);

    // ==========================================
    // ACTION HANDLERS
    // ==========================================

    // Quick Petition Generation with AI / Templates
    const handleOpenPetitionBuilder = (task: AdminTask) => {
        setSelectedTaskForPetition(task);
        setPetitionType('مذكرة دفاع ختامية أمام الدائرة العمالية - محكمة الكلية');
        setPetitionContent(`إلى رئيس وأعضاء الدائرة الموقرين،\n\nبصفتنا وكلاء الموكل / ${task.clientName || 'خالد الساير'}، في قضية المشفوعة بالرقم / ${task.caseTitle || 'قضية رقم 882/2026'}.\n\nالوقائع والأسانيد القانونية:\n1. طبقاً لنص المادة (115) من قانون العمل الكويتي رقم 6 لسنة 2010.\n2. ثابت بالأوراق انتفاء أي تقصير نسبي ومن ثم يمتنع توقيع الجزاء الحاط بالكرامة.\n\nالطلبات:\nأولاً: قبول الدفاع شكلاً وتبرئة ساحة الموكل.\nثانياً: إلغاء القرار الإداري وبطلان الآثار المترتبة عليه.`);
        setIsPetitionModalOpen(true);
    };

    const handleGenerateAiPetition = async () => {
        if (!selectedTaskForPetition) return;
        setIsAiGeneratingPetition(true);
        try {
            const prompt = `أنت مستشار قانوني كويتي متمرس بمكتب المحامي صبري شطا. قم بصياغة عريضة ومذكرة دفاع قانونية محكمة متكاملة وشاملة للمهمة: "${selectedTaskForPetition.title}". اسم الموكل: "${selectedTaskForPetition.clientName || 'الموكل'}". القضية: "${selectedTaskForPetition.caseTitle || 'قضية عمالية تجارية'}". استخدم أسلوب الصياغة القضائية الكويتية المعتمدة أمام القضاء الكويتي.`;
            const text = await geminiService.generateContent(prompt);
            if (text) {
                setPetitionContent(text);
                addToast({ type: 'success', title: 'تمت الصياغة الذكية', message: 'تم إنشاء نص العريضة بنجاح باستخدام الذكاء الاصطناعي' });
            }
        } catch (err) {
            addToast({ type: 'error', title: 'خطأ بالصياغة', message: 'تعذر الاتصال بـ Gemini AI، تم الحفاظ على النموذج الحالي' });
        } finally {
            setIsAiGeneratingPetition(false);
        }
    };

    const handleSaveAndSignPetition = () => {
        if (!selectedTaskForPetition) return;
        
        // Update task status to completed or ready for submission
        updateTask({
            ...selectedTaskForPetition,
            status: AdminTaskStatus.COMPLETED,
            notes: (selectedTaskForPetition.notes || '') + '\n[تم إرفاق وتوقيع العريضة إلكترونياً بواسطة أ. صبري شطا]'
        });

        // Add to audit log
        const newAuditItem: AuditLogItem = {
            id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: currentRole === 'GeneralManager' ? 'أستاذ صبري شطا' : currentRole === 'BranchLawyer' ? 'أ. أحمد الصباح' : 'المندوب الإداري',
            role: currentRole === 'GeneralManager' ? 'المدير العام' : currentRole === 'BranchLawyer' ? 'محامي الفرع' : 'المندوب الإداري',
            action: 'صياغة وتوقيع عريضة إلكترونية',
            module: 'منشئ العرائض السريع',
            details: `تم توقيع العريضة للمهمة ${selectedTaskForPetition.id} - ${selectedTaskForPetition.title}`,
            ip: '197.220.14.88',
            status: 'success'
        };
        setAuditLogs(prev => [newAuditItem, ...prev]);

        addToast({
            type: 'success',
            title: 'تم التوقيع والحفظ',
            message: 'تم اعتماد وتوقيع العريضة إلكترونياً وإدراجها بملف المهمة بنجاح.'
        });

        setIsPetitionModalOpen(false);
    };

    // Quick WhatsApp message trigger
    const handleOpenWhatsappModal = (contact: AdminContact) => {
        setWhatsappModalContact(contact);
        setWhatsappMessageText(`السلام عليكم ورحمة الله وبركاته،\nالأفاضل / ${contact.name}\nتحية طيبة وبعد،\n\nنفيدكم علماً بمستجدات معاملتكم القانونية لدى مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية.\nلأي استفسار يرجى التواصل معنا عبر هذا الرقم المعتمد.\n\nشاكرين لكم حسن تعاونكم.`);
    };

    const handleSendWhatsappMessage = () => {
        if (!whatsappModalContact) return;
        const encoded = encodeURIComponent(whatsappMessageText);
        const cleanPhone = whatsappModalContact.phone.replace(/[^0-9]/g, '');
        window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
        
        // Log contact note
        const updatedContacts = contacts.map(c => {
            if (c.id === whatsappModalContact.id) {
                return {
                    ...c,
                    lastContactDate: new Date().toISOString().substring(0, 10),
                    notes: c.notes + `\n[تم توثيق مراسلة WhatsApp في ${new Date().toLocaleDateString('ar-KW')}]`
                };
            }
            return c;
        });
        setContacts(updatedContacts);
        setWhatsappModalContact(null);
        addToast({ type: 'success', title: 'تم التوجيه لـ WhatsApp', message: 'تم فتح رابط المراسلة وتوثيق العملية بسجل الموكل.' });
    };

    // Toggle notification rule active state
    const handleToggleRule = (id: string) => {
        setNotificationRules(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r));
        addToast({ type: 'info', title: 'تحديث قواعد التنبيهات', message: 'تم تغيير حالة التفعيل لقاعدة الإشعارات المختارة.' });
    };

    // AI Assistant Workload Rebalancing Simulation
    const handleAiRebalanceWorkload = async () => {
        setIsAiProcessing(true);
        try {
            const prompt = `أنت المساعد الذكي الإداري لمكتب المحامي صبري شطا. لدينا ${tasks.length} مهمة قانونية. حلل ضغط العمل والمهل العاجلة وقدم توصية فورية بكلمات موجزة مع الخطوات.`;
            const text = await geminiService.generateContent(prompt);
            setAiResponse(text || 'توصية الذكاء الاصطناعي: يوصى بنقل 3 مهام إيداع عاجلة بمحكمة الرقعي من المحامي أحمد إلى المندوب الميداني جاسم لتفادي تفويت المهل.');
        } catch {
            setAiResponse('توصية الذكاء الاصطناعي: يوصى بنقل 3 مهام إيداع عاجلة بمحكمة الرقعي إلى المندوب الميداني جاسم لتسريع المتابعة الميدانية وقصر الوقت إلى 45 دقيقة.');
        } finally {
            setIsAiProcessing(false);
        }
    };

    // Export PDF Report function simulation
    const handleExportPdfReport = () => {
        window.print();
        addToast({ type: 'success', title: 'جاهزية الطباعة والـ PDF', message: 'تم تجهيز التقرير بهوية مكتب المحامي صبري شطا الرسمية.' });
    };

    // Export Excel / CSV function simulation
    const handleExportExcelReport = () => {
        const headers = "ID,Title,Priority,Status,Assignee,Client,DueDate\n";
        const rows = tasks.map(t => `"${t.id}","${t.title}","${t.priority}","${t.status}","${t.assignedTo || ''}","${t.clientName || ''}","${t.dueDate || ''}"`).join("\n");
        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `ADALA_Admin_Tasks_Report_${new Date().toISOString().substring(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast({ type: 'success', title: 'تم تصدير ملف Excel/CSV', message: 'تم تحميل ملف البيانات الموحد بنجاح.' });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-28 text-right font-sans" dir="rtl">
            {/* Header Print Layout */}
            <PrintHeader title="قسم أدوات الإدارة والحوكمة المركزية - عدالة" subtitle="مكتب المحامي صبري شطا للمحاماة والاستشارات القانونية" />

            {/* ==========================================
                1️⃣ TOP HEADER & SYSTEM BANNER
               ========================================== */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
                <div className="space-y-1.5 z-10">
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xs">
                            <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-black text-slate-900 tracking-tight">مركز أدوات الإدارة والحوكمة المركزية</h1>
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-100/80 text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-3xs">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    متزامن آلياً
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-bold mt-0.5">
                                مكتب المحامي صبري شطا • منظومة التكليفات القانونية، دليل الأطراف، التنبيهات المدرسية، وتقارير الأداء الميداني
                            </p>
                        </div>
                    </div>
                </div>

                {/* Role Switcher & Quick Actions */}
                <div className="flex items-center gap-3 flex-wrap z-10">
                    {/* Role View Toggle */}
                    <div className="bg-slate-50 p-1 border border-slate-200/80 rounded-xl flex items-center gap-1 shadow-3xs">
                        <span className="text-[10px] font-black text-slate-400 px-2">عرض بصفة:</span>
                        <button
                            onClick={() => setCurrentRole('GeneralManager')}
                            className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer ${
                                currentRole === 'GeneralManager' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            👑 المدير العام
                        </button>
                        <button
                            onClick={() => setCurrentRole('BranchLawyer')}
                            className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer ${
                                currentRole === 'BranchLawyer' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            ⚖️ محامي الفرع
                        </button>
                        <button
                            onClick={() => setCurrentRole('AdminDelegate')}
                            className={`text-[11px] font-extrabold px-3 py-1.5 rounded-lg transition-all border-none cursor-pointer ${
                                currentRole === 'AdminDelegate' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            🏃 المندوب الإداري
                        </button>
                    </div>

                    {/* Quick Search Shortcut Trigger Button */}
                    <Button
                        variant="outline"
                        onClick={() => setIsGlobalSearchOpen(true)}
                        className="bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-3xs"
                    >
                        <Search className="w-3.5 h-3.5 text-slate-500" />
                        <span>بحث مباشر</span>
                        <kbd className="bg-white border border-slate-200 text-slate-500 text-[9px] font-mono px-1.5 py-0.5 rounded shadow-3xs">⌘K</kbd>
                    </Button>
                </div>
            </div>

            {/* ==========================================
                URGENT LIVE NOTIFICATION ALERT BANNER
               ========================================== */}
            {!isAlertDismissed && urgentTasksCount > 0 && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-500/10 border border-amber-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs shadow-3xs"
                >
                    <div className="flex items-center gap-3">
                        <span className="p-2 bg-amber-500 text-white rounded-xl shrink-0 shadow-xs">
                            <Bell className="w-4 h-4 animate-bounce" />
                        </span>
                        <div>
                            <p className="font-black text-amber-950">
                                تنبيه حرج مباشر ({urgentTasksCount} تكليفات تتطلب الإجراء الفوري):
                            </p>
                            <p className="text-amber-900 font-bold text-[11px]">
                                توجد مهام إيداع عريضة وجلسات بمحاكم الرقعي وقصر العدل يفصلها أقل من 72 ساعة عن السقف الزمني. يرجى المباشرة الفورية.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => { setActiveTab('tasks'); setFilterPriority('URGENT'); }}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[11px] px-3.5 py-1.5 rounded-xl transition-all shadow-3xs cursor-pointer border-none"
                        >
                            عرض التكليفات العاجلة
                        </button>
                        <button
                            onClick={() => setIsAlertDismissed(true)}
                            className="p-1.5 text-amber-800 hover:text-amber-950 transition-colors cursor-pointer border-none bg-transparent"
                            title="إغلاق التنبيه"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* ==========================================
                2️⃣ SMART INTERACTIVE CONTROL BAR (SEARCH & FILTERS)
               ========================================== */}
            <Card className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    
                    {/* Keyword Search Input */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="ابحث بالكلمات المفتاحية (اسم المهمة، الموكل، رقم القضية، المحامي، جهة الاتصال)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-xs font-semibold pr-10 pl-4 py-2.5 bg-slate-50/60 border border-slate-200 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400 focus:outline-none rounded-xl transition-all shadow-3xs"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 border-none bg-transparent cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Filter Select Dropdowns */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Priority Filter */}
                        <div className="w-36">
                            <select
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="w-full text-xs font-bold bg-slate-50/60 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:bg-white focus:outline-none focus:border-slate-400 shadow-3xs"
                            >
                                <option value="all">الأولوية: الكل</option>
                                <option value="URGENT">🔥 عاجلة وحرجة</option>
                                <option value="HIGH">🔴 عالية</option>
                                <option value="MEDIUM">🟡 متوسطة</option>
                                <option value="LOW">🟢 منخفضة</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div className="w-40">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full text-xs font-bold bg-slate-50/60 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:bg-white focus:outline-none focus:border-slate-400 shadow-3xs"
                            >
                                <option value="all">الحالة: جميع الحالات</option>
                                <option value="PENDING">🕒 قيد التوجيه</option>
                                <option value="IN_PROGRESS">⚡ قيد التنفيذ الميداني</option>
                                <option value="FILING_72H">⏱️ إيداع خلال 72 ساعة</option>
                                <option value="OVERDUE">⚠️ تجاوزت السقف الزمني</option>
                                <option value="COMPLETED">✅ تم الأرشفة والإنجاز</option>
                            </select>
                        </div>

                        {/* Assignee / Lawyer Filter */}
                        <div className="w-40">
                            <select
                                value={filterLawyer}
                                onChange={(e) => setFilterLawyer(e.target.value)}
                                className="w-full text-xs font-bold bg-slate-50/60 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:bg-white focus:outline-none focus:border-slate-400 shadow-3xs"
                            >
                                <option value="all">المسؤول: جميع الطاقم</option>
                                <option value="صبري">أستاذ صبري شطا</option>
                                <option value="الصباح">أ. أحمد الصباح</option>
                                <option value="حسين">فاطمة علي حسين</option>
                                <option value="المرزوق">عمر خالد المرزوق</option>
                                <option value="ميداني">المندوب الميداني</option>
                            </select>
                        </div>

                        {/* Department Filter */}
                        <div className="w-36">
                            <select
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                                className="w-full text-xs font-bold bg-slate-50/60 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:bg-white focus:outline-none focus:border-slate-400 shadow-3xs"
                            >
                                <option value="all">القسم: كافة الأقسام</option>
                                <option value="قضائية">الشؤون القضائية</option>
                                <option value="ميداني">المتابعة الميدانية</option>
                                <option value="استشارات">الاستشارات والعقود</option>
                                <option value="تنفيذ">إدارة التنفيذ</option>
                            </select>
                        </div>

                        {/* Reset Filters */}
                        {(filterPriority !== 'all' || filterStatus !== 'all' || filterLawyer !== 'all' || filterDepartment !== 'all' || searchTerm !== '') && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterPriority('all');
                                    setFilterStatus('all');
                                    setFilterLawyer('all');
                                    setFilterDepartment('all');
                                }}
                                className="p-2.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all cursor-pointer border-none shadow-3xs"
                                title="إعادة ضبط الفلاتر"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            {/* ==========================================
                3️⃣ NAVIGATION TABS FOR THE 5 MODULES
               ========================================== */}
            <div className="bg-white border border-slate-100 rounded-2xl p-2 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center gap-1.5 min-w-max">
                    <button
                        onClick={() => setActiveTab('tasks')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer border-none ${
                            activeTab === 'tasks'
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <CheckSquare className="w-4 h-4 text-emerald-400" />
                        <span>إدارة المهام والتكليفات</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${activeTab === 'tasks' ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'}`}>
                            {filteredTasks.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('contacts')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer border-none ${
                            activeTab === 'contacts'
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <Users className="w-4 h-4 text-amber-400" />
                        <span>دليل جهات الاتصال والأطراف</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${activeTab === 'contacts' ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'}`}>
                            {filteredContacts.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('notifications')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer border-none ${
                            activeTab === 'notifications'
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <Bell className="w-4 h-4 text-sky-400" />
                        <span>مركّز التنبيهات والقواعد</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md ${activeTab === 'notifications' ? 'bg-slate-800 text-amber-400' : 'bg-slate-100 text-slate-600'}`}>
                            {notificationRules.length}
                        </span>
                    </button>

                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer border-none ${
                            activeTab === 'analytics'
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <BarChart2 className="w-4 h-4 text-indigo-400" />
                        <span>التقارير ومؤشرات الأداء</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-black transition-all cursor-pointer border-none ${
                            activeTab === 'settings'
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                    >
                        <ShieldCheck className="w-4 h-4 text-rose-400" />
                        <span>الإعدادات والأنشطة (RBAC)</span>
                    </button>
                </div>

                {/* AI Workload Advisor Trigger */}
                <button
                    onClick={handleAiRebalanceWorkload}
                    disabled={isAiProcessing}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-200/80 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer shadow-3xs"
                >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                    <span>{isAiProcessing ? 'جاري التحليل...' : 'مستشار الذكاء الاصطناعي'}</span>
                </button>
            </div>

            {/* AI Advisor Modal / Panel Response */}
            {aiResponse && (
                <Card className="p-5 bg-gradient-to-r from-amber-50/80 via-white to-slate-50 border border-amber-200/80 rounded-2xl shadow-sm text-right space-y-2">
                    <div className="flex items-center justify-between border-b border-amber-100 pb-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
                            <h4 className="text-xs font-black text-amber-950">توصيات المساعد الذكي لموازنة أعباء العمل</h4>
                        </div>
                        <button onClick={() => setAiResponse('')} className="text-slate-400 hover:text-slate-700 text-xs border-none bg-transparent cursor-pointer">إغلاق</button>
                    </div>
                    <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans">{aiResponse}</p>
                </Card>
            )}

            {/* ==========================================
                MODULE 1: 🟢 TASKS & ASSIGNMENTS TAB
               ========================================== */}
            {activeTab === 'tasks' && (
                <div className="space-y-6">
                    {/* Sub-Header Bar: View Switcher & Quick Add Task */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900">طريقة العرض:</span>
                            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200/60 shadow-3xs">
                                <button
                                    onClick={() => setTaskViewMode('kanban')}
                                    className={`px-3 py-1 rounded-lg text-xs font-black border-none cursor-pointer ${
                                        taskViewMode === 'kanban' ? 'bg-slate-900 text-white shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    لوحة كانبان (Kanban)
                                </button>
                                <button
                                    onClick={() => setTaskViewMode('list')}
                                    className={`px-3 py-1 rounded-lg text-xs font-black border-none cursor-pointer ${
                                        taskViewMode === 'list' ? 'bg-slate-900 text-white shadow-3xs' : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    القائمة التفصيلية (List)
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="primary"
                                onClick={() => setIsTaskFormOpen(true)}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer border-none"
                            >
                                <Plus className="w-4 h-4 text-amber-400" />
                                <span>إسناد مهمة جديدة</span>
                            </Button>
                        </div>
                    </div>

                    {/* KANBAN VIEW MODE */}
                    {taskViewMode === 'kanban' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {[
                                { id: 'PENDING', title: 'قيد التوجيه', bg: 'bg-slate-100/70', border: 'border-slate-200' },
                                { id: 'IN_PROGRESS', title: 'عاجلة وحرجة المتابعة', bg: 'bg-amber-50/60', border: 'border-amber-200/80' },
                                { id: 'FILING_72H', title: 'إيداع خلال 72 ساعة', bg: 'bg-sky-50/60', border: 'border-sky-200/80' },
                                { id: 'OVERDUE', title: 'تجاوزت السقف الزمني', bg: 'bg-rose-50/60', border: 'border-rose-200/80' },
                                { id: 'COMPLETED', title: 'تم الأرشفة والإنجاز', bg: 'bg-emerald-50/60', border: 'border-emerald-200/80' }
                            ].map(col => {
                                const colTasks = filteredTasks.filter(t => {
                                    if (col.id === 'PENDING') return t.status === AdminTaskStatus.TODO || t.status === AdminTaskStatus.PENDING_REVIEW;
                                    if (col.id === 'IN_PROGRESS') return t.status === AdminTaskStatus.IN_PROGRESS || t.priority === AdminTaskPriority.CRITICAL;
                                    if (col.id === 'FILING_72H') return t.status === AdminTaskStatus.PENDING_REVIEW || t.priority === AdminTaskPriority.HIGH;
                                    if (col.id === 'OVERDUE') return t.status === AdminTaskStatus.BLOCKED || (t.dueDate && new Date(t.dueDate) < new Date() && t.status !== AdminTaskStatus.COMPLETED);
                                    if (col.id === 'COMPLETED') return t.status === AdminTaskStatus.COMPLETED || t.status === AdminTaskStatus.CANCELLED;
                                    return false;
                                });

                                return (
                                    <div key={col.id} className={`${col.bg} border ${col.border} p-3.5 rounded-2xl space-y-3 min-h-[420px]`}>
                                        <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                            <h3 className="text-xs font-black text-slate-900">{col.title}</h3>
                                            <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-black text-slate-700 shadow-3xs">
                                                {colTasks.length}
                                            </span>
                                        </div>

                                        <div className="space-y-3">
                                            {colTasks.map(task => (
                                                <Card key={task.id} className="p-4 bg-white border border-slate-100 rounded-xl shadow-3xs space-y-3 hover:shadow-sm transition-all text-right">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md ${
                                                            task.priority === AdminTaskPriority.CRITICAL ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                                            task.priority === AdminTaskPriority.HIGH ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                                                        }`}>
                                                            {task.priority === AdminTaskPriority.CRITICAL ? '🔥 عاجل جداً' : task.priority === AdminTaskPriority.HIGH ? '🔴 أولوية عالية' : '🟢 عادي'}
                                                        </span>
                                                        <span className="text-[9px] font-mono font-bold text-slate-400">#{task.id}</span>
                                                    </div>

                                                    <h4 className="text-xs font-extrabold text-slate-900 leading-snug">{task.title}</h4>

                                                    {task.caseTitle && (
                                                        <p className="text-[10px] text-slate-500 font-bold bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                            📁 {task.caseTitle}
                                                        </p>
                                                    )}

                                                    {/* Field Geolocation Status */}
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-bold">
                                                        <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                        <span className="truncate">{task.venue || 'قصر العدل - العاصمة'}</span>
                                                    </div>

                                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                                                        <div className="flex items-center gap-1 font-bold text-slate-600">
                                                            <User className="w-3 h-3 text-slate-400" />
                                                            <span className="truncate">{task.assignedTo || 'أ. صبري شطا'}</span>
                                                        </div>

                                                        {/* Quick Petition Builder Button */}
                                                        <button
                                                            onClick={() => handleOpenPetitionBuilder(task)}
                                                            className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-extrabold text-[9.5px] px-2.5 py-1 rounded-lg border-none cursor-pointer shadow-3xs flex items-center gap-1"
                                                            title="صياغة عريضة متكاملة وتوقيع رقمي"
                                                        >
                                                            <FileText className="w-3 h-3 text-amber-400" />
                                                            <span>عريضة + توقيع</span>
                                                        </button>
                                                    </div>
                                                </Card>
                                            ))}

                                            {colTasks.length === 0 && (
                                                <div className="p-6 text-center text-slate-400 text-xs font-bold italic">
                                                    لا توجد مهام
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* LIST VIEW MODE */}
                    {taskViewMode === 'list' && (
                        <Card className="p-0 bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-right text-xs">
                                    <thead className="bg-slate-50 text-slate-500 font-black border-b border-slate-100">
                                        <tr>
                                            <th className="p-3.5">المعرف</th>
                                            <th className="p-3.5">عنوان المهمة والتكليف</th>
                                            <th className="p-3.5">الموكل والقضية</th>
                                            <th className="p-3.5">المسؤول والموقع</th>
                                            <th className="p-3.5">الأولوية والحالة</th>
                                            <th className="p-3.5">السقف الزمني</th>
                                            <th className="p-3.5 text-center">الإجراءات السريعة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                                        {filteredTasks.map(task => (
                                            <tr key={task.id} className="hover:bg-slate-50/60 transition-colors">
                                                <td className="p-3.5 font-mono text-[11px] font-bold text-slate-500">#{task.id}</td>
                                                <td className="p-3.5 font-extrabold text-slate-900">{task.title}</td>
                                                <td className="p-3.5">
                                                    <span className="block font-extrabold text-slate-850">{task.clientName || 'خالد الساير'}</span>
                                                    <span className="text-[10px] text-slate-400 block">{task.caseTitle || 'قضية عمالية كبرى'}</span>
                                                </td>
                                                <td className="p-3.5">
                                                    <span className="block font-bold">{task.assignedTo || 'أستاذ صبري شطا'}</span>
                                                    <span className="text-[10px] text-amber-700 flex items-center gap-1 mt-0.5">
                                                        <MapPin className="w-3 h-3 text-amber-500" />
                                                        {task.venue || 'محكمة الرقعي'}
                                                    </span>
                                                </td>
                                                <td className="p-3.5">
                                                    <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-black ${
                                                        task.priority === AdminTaskPriority.CRITICAL ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                                                    }`}>
                                                        {task.priority === AdminTaskPriority.CRITICAL ? '🔥 عاجل' : 'عادي'}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 font-mono text-[11px] font-extrabold text-amber-800">
                                                    {task.dueDate || '2026-08-05'}
                                                </td>
                                                <td className="p-3.5 text-center">
                                                    <button
                                                        onClick={() => handleOpenPetitionBuilder(task)}
                                                        className="bg-slate-900 hover:bg-slate-800 text-amber-400 text-[10px] font-extrabold px-3 py-1.5 rounded-lg border-none cursor-pointer shadow-3xs inline-flex items-center gap-1.5"
                                                    >
                                                        <FileText className="w-3.5 h-3.5" />
                                                        <span>صياغة وتوقيع عريضة</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}
                </div>
            )}

            {/* ==========================================
                MODULE 2: 🟡 CONTACTS DIRECTORY TAB
               ========================================== */}
            {activeTab === 'contacts' && (
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-slate-100 rounded-2xl shadow-sm">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-900">تصفية الفئة:</span>
                            {[
                                { id: 'all', title: 'الكل' },
                                { id: 'client', title: 'الموكلين' },
                                { id: 'opponent', title: 'الخصوم' },
                                { id: 'lawyer', title: 'المحامين والشركاء' },
                                { id: 'expert', title: 'الخبراء المعينون' },
                                { id: 'government', title: 'الجهات القضائية' }
                            ].map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setContactTypeFilter(cat.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border-none cursor-pointer ${
                                        contactTypeFilter === cat.id ? 'bg-slate-900 text-white shadow-3xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat.title}
                                </button>
                            ))}
                        </div>

                        <Button
                            variant="primary"
                            onClick={() => setIsNewContactModalOpen(true)}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer border-none shrink-0"
                        >
                            <Plus className="w-4 h-4 text-amber-400" />
                            <span>إضافة جهة اتصال جديدة</span>
                        </Button>
                    </div>

                    {/* Contacts Directory Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredContacts.map(contact => (
                            <Card key={contact.id} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-right space-y-4 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between border-b border-slate-100/80 pb-3">
                                    <div className="space-y-0.5">
                                        <span className="text-[9px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200/60 inline-block">
                                            {contact.categoryTitle}
                                        </span>
                                        <h3 className="text-sm font-black text-slate-900 mt-1">{contact.name}</h3>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400 font-bold">#{contact.id}</span>
                                </div>

                                <div className="space-y-2 text-xs font-bold text-slate-700">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="font-mono text-slate-900 dir-ltr text-right">{contact.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="text-slate-600 truncate">{contact.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                        <span className="text-slate-500 text-[11px] truncate">{contact.address}</span>
                                    </div>
                                </div>

                                {/* Linked Transaction Counters */}
                                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">القضايا</span>
                                        <span className="text-slate-900 font-black text-xs">{contact.linkedCasesCount}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">العقود</span>
                                        <span className="text-slate-900 font-black text-xs">{contact.linkedContractsCount}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400 block text-[9px]">التكليفات</span>
                                        <span className="text-slate-900 font-black text-xs">{contact.linkedTasksCount}</span>
                                    </div>
                                </div>

                                {/* Direct Action Buttons */}
                                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                                    <button
                                        onClick={() => { setSelectedContact(contact); setIsContactModalOpen(true); }}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-extrabold px-3 py-1.5 rounded-xl border-none cursor-pointer transition-all flex-1"
                                    >
                                        سجل المعاملات
                                    </button>
                                    <button
                                        onClick={() => handleOpenWhatsappModal(contact)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-xl border-none cursor-pointer transition-all flex items-center justify-center gap-1 shadow-3xs"
                                        title="إرسال رسالة WhatsApp موثوقة"
                                    >
                                        <MessageCircle className="w-3.5 h-3.5" />
                                        <span>WhatsApp</span>
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* ==========================================
                MODULE 3: 🔵 SMART NOTIFICATIONS CENTER TAB
               ========================================== */}
            {activeTab === 'notifications' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left 2 Cols: Real-Time Notification Feed */}
                    <div className="lg:col-span-2 space-y-4">
                        <Card className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm text-right space-y-5">
                            <div className="flex justify-between items-center border-b border-slate-100/80 pb-3">
                                <div>
                                    <h3 className="text-xs font-extrabold text-slate-900">سجل الإشعارات والتنبيهات المباشرة</h3>
                                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">تتبع الجلسات، مهل الاستئناف، والمهام المتأخرة لحظة بلحظة</p>
                                </div>
                                <span className="bg-slate-900 text-white font-mono text-[10px] px-2.5 py-1 rounded-lg font-bold">
                                    LIVE FEED
                                </span>
                            </div>

                            <div className="space-y-3">
                                {[
                                    { id: 'NT-1', title: 'جلسة خبرة عاجلة غداً ببرج المرقاب', time: 'منذ 10 دقائق', priority: 'URGENT', desc: 'محكمة العاصمة - قضية رقم 1092/2026 - إيداع المستندات الحسابية.' },
                                    { id: 'NT-2', title: 'انقضاء مهلة استئناف قرار إداري خلال 48 ساعة', time: 'منذ ساعة', priority: 'HIGH', desc: 'موكل: شركة الأمل - الدائرة العمالية الأولى.' },
                                    { id: 'NT-3', title: 'تم توقيع عقد الاستشارات القانونية إلكترونياً', time: 'أمس الساعة 4 م', priority: 'INFO', desc: 'تم اعتماد عقد بنك الخليج المتحد بواسطة أستاذ صبري شطا.' },
                                    { id: 'NT-4', title: 'إيداع صحيفة دعوى بمجمع محاكم الرقعي', time: 'أمس الساعة 11 ص', priority: 'SUCCESS', desc: 'تم تسليم الأوراق للإدارة بواسطة المندوب جاسم العلي.' }
                                ].map(notif => (
                                    <div key={notif.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3 shadow-3xs">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${notif.priority === 'URGENT' ? 'bg-rose-500 animate-ping' : 'bg-sky-500'}`}></span>
                                                <h4 className="text-xs font-extrabold text-slate-900">{notif.title}</h4>
                                                <span className="text-[9px] font-mono text-slate-400">{notif.time}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-600 font-bold leading-relaxed">{notif.desc}</p>
                                        </div>
                                        <button
                                            onClick={() => addToast({ type: 'success', title: 'تأكيد الاطلاع', message: 'تم إحالة وتوثيق الإشعار بسجل الإجراءات.' })}
                                            className="bg-white hover:bg-slate-100 text-slate-800 text-[10px] font-extrabold px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer shrink-0 shadow-3xs"
                                        >
                                            تأكيد ومباشرة
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Right Col: Notification Rules Configurator */}
                    <div className="space-y-4">
                        <Card className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm text-right space-y-4">
                            <div className="border-b border-slate-100/80 pb-3 flex justify-between items-center">
                                <div>
                                    <h3 className="text-xs font-extrabold text-slate-900">قواعد التنبيهات المخصصة</h3>
                                    <p className="text-[10px] text-slate-400 font-bold">ضبط قواعد الإشعار التلقائي بالـ SMS و WhatsApp</p>
                                </div>
                                <button
                                    onClick={() => setIsRuleModalOpen(true)}
                                    className="p-1.5 bg-slate-900 text-amber-400 rounded-lg hover:bg-slate-800 cursor-pointer border-none"
                                    title="إضافة قاعدة جديدة"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-3">
                                {notificationRules.map(rule => (
                                    <div key={rule.id} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 space-y-2 shadow-3xs">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black bg-slate-200/80 text-slate-800 px-2 py-0.5 rounded-md">
                                                قناة: {rule.channel}
                                            </span>
                                            <button
                                                onClick={() => handleToggleRule(rule.id)}
                                                className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg cursor-pointer border-none ${
                                                    rule.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                                                }`}
                                            >
                                                {rule.isActive ? 'مفعلة ✓' : 'معطلة'}
                                            </button>
                                        </div>
                                        <h4 className="text-xs font-extrabold text-slate-900">{rule.title}</h4>
                                        <div className="text-[10px] text-slate-500 font-bold space-y-0.5">
                                            <p>📌 الحدث: {rule.triggerEvent}</p>
                                            <p>👤 المستلم: {rule.recipientRole}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* ==========================================
                MODULE 4: 🟣 ANALYTICS & KPI REPORTS TAB
               ========================================== */}
            {activeTab === 'analytics' && (
                <div className="space-y-6">
                    {/* Top KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'معدل إنجاز المهام', value: '88.5%', sub: '+4.2% مقارنة بالشهر السابق', color: 'emerald' },
                            { title: 'متوسط سرعة التنفيذ الميداني', value: '4.2 ساعة', sub: 'أداء عالي المتابعة بالمحاكم', color: 'blue' },
                            { title: 'العرائض المعتمدة والموقعة', value: '42 عريضة', sub: 'توقيع إلكتروني موثق', color: 'amber' },
                            { title: 'الالتزام بالسقف الزمني', value: '99.1%', sub: 'انعدام تفويت مواعيد الطعون', color: 'purple' }
                        ].map((stat, i) => (
                            <Card key={i} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm text-right space-y-2">
                                <span className="text-[10px] font-black text-slate-400 block">{stat.title}</span>
                                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                <span className="text-[10px] text-slate-500 font-bold block">{stat.sub}</span>
                            </Card>
                        ))}
                    </div>

                    {/* Chart & Field Performance Table */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <Card className="lg:col-span-2 p-6 bg-white border border-slate-100 rounded-2xl shadow-sm text-right space-y-5">
                            <div className="flex justify-between items-center border-b border-slate-100/80 pb-3">
                                <div>
                                    <h3 className="text-xs font-extrabold text-slate-900">مخطط توزيع أداء التكليفات الميدانية</h3>
                                    <p className="text-[10px] text-slate-400 font-bold">مقارنة المهام المنجزة العاجلة والاعتيادية حسب المحامين والمندوبين</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleExportPdfReport} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer border-none">
                                        <Printer className="w-4 h-4" />
                                    </button>
                                    <button onClick={handleExportExcelReport} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer border-none">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="h-64 w-full pt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={[
                                        { name: 'أ. صبري شطا', urgent: 12, normal: 18 },
                                        { name: 'أ. أحمد الصباح', urgent: 15, normal: 10 },
                                        { name: 'فاطمة حسين', urgent: 8, normal: 14 },
                                        { name: 'المندوب جاسم', urgent: 22, normal: 8 }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 'bold' }} />
                                        <YAxis tick={{ fontSize: 11 }} />
                                        <RechartsTooltip />
                                        <Legend />
                                        <Bar dataKey="urgent" name="تكليفات عاجلة" fill="#0f172a" radius={[6, 6, 0, 0]} />
                                        <Bar dataKey="normal" name="تكليفات اعتيادية" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Export & Print Branding Panel */}
                        <Card className="p-6 bg-slate-900 text-white rounded-2xl shadow-sm text-right space-y-5 flex flex-col justify-between">
                            <div className="space-y-3">
                                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-md inline-block">
                                    تصدير معتمد
                                </span>
                                <h3 className="text-sm font-black">طباعة التقرير الموحد بهوية المكتب</h3>
                                <p className="text-xs text-slate-300 leading-relaxed font-bold">
                                    إصدار وثيقة تقرير الأداء الميداني والإداري الشامل مختومة بختم مكتب المحامي صبري شطا ورقم التوثيق المالي والقضائي.
                                </p>
                            </div>

                            <div className="space-y-2 pt-4 border-t border-slate-800">
                                <Button
                                    variant="primary"
                                    onClick={handleExportPdfReport}
                                    className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 border-none cursor-pointer"
                                >
                                    <Printer className="w-4 h-4" />
                                    <span>طباعة تقرير PDF بهوية المكتب</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleExportExcelReport}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-xl border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                                    <span>تصدير لجدول Excel البيانات الكاملة</span>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* ==========================================
                MODULE 5: 🟠 SETTINGS & RBAC AUDIT LOG TAB
               ========================================== */}
            {activeTab === 'settings' && (
                <div className="space-y-6">
                    {/* RBAC Matrix */}
                    <Card className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm text-right space-y-5">
                        <div className="border-b border-slate-100/80 pb-3 flex justify-between items-center">
                            <div>
                                <h3 className="text-xs font-extrabold text-slate-900">إدارة المستخدمين والصلاحيات (RBAC)</h3>
                                <p className="text-[10px] text-slate-400 font-bold">تحديد أدوار المنظومة: المدير العام، محامي الفرع، والمندوب الإداري</p>
                            </div>
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px] font-black px-2.5 py-1 rounded-lg">
                                الحوكمة الأمنية نشطة
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-black border-b border-slate-100">
                                    <tr>
                                        <th className="p-3">الصلاحية والنشاط المتاح</th>
                                        <th className="p-3 text-center">👑 المدير العام</th>
                                        <th className="p-3 text-center">⚖️ محامي الفرع</th>
                                        <th className="p-3 text-center">🏃 المندوب الإداري</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-bold text-slate-800">
                                    {[
                                        { key: 'approvePetitions', label: 'اعتماد وتوقيع العرائض إلكترونياً' },
                                        { key: 'assignTasks', label: 'إسناد وتوجيه المهام والمتابعة الميدانية' },
                                        { key: 'editContacts', label: 'تعديل وحذف دليل جهات الاتصال والأطراف' },
                                        { key: 'exportFinancials', label: 'تصدير التقارير المالية والإدارية الشاملة' },
                                        { key: 'viewAuditLogs', label: 'رؤية وتدقيق سجل الأنشطة والأمان الكامل' }
                                    ].map(row => (
                                        <tr key={row.key} className="hover:bg-slate-50/50">
                                            <td className="p-3.5 font-extrabold text-slate-900">{row.label}</td>
                                            <td className="p-3.5 text-center text-emerald-600 font-black">✓ كامل الصلاحية</td>
                                            <td className="p-3.5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={rolePermissions.BranchLawyer[row.key as keyof typeof rolePermissions.BranchLawyer]}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setRolePermissions(prev => ({
                                                            ...prev,
                                                            BranchLawyer: { ...prev.BranchLawyer, [row.key]: checked }
                                                        }));
                                                        addToast({ type: 'info', title: 'تحديث الصلاحيات', message: 'تم تحديث مصفوفة الصلاحيات لمحامي الفرع.' });
                                                    }}
                                                    className="w-4 h-4 cursor-pointer accent-slate-900"
                                                />
                                            </td>
                                            <td className="p-3.5 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={rolePermissions.AdminDelegate[row.key as keyof typeof rolePermissions.AdminDelegate]}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setRolePermissions(prev => ({
                                                            ...prev,
                                                            AdminDelegate: { ...prev.AdminDelegate, [row.key]: checked }
                                                        }));
                                                        addToast({ type: 'info', title: 'تحديث الصلاحيات', message: 'تم تحديث مصفوفة الصلاحيات للمندوب الإداري.' });
                                                    }}
                                                    className="w-4 h-4 cursor-pointer accent-slate-900"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>

                    {/* Audit Log Table */}
                    <Card className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm text-right space-y-4">
                        <div className="border-b border-slate-100/80 pb-3 flex justify-between items-center">
                            <div>
                                <h3 className="text-xs font-extrabold text-slate-900">سجل الأنشطة والتدقيق الأمني (Audit Log)</h3>
                                <p className="text-[10px] text-slate-400 font-bold">تسجيل زمني كامل لجميع التغييرات والعمليات الصادرة بالنظام</p>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 font-bold">{auditLogs.length} سجل مسجل</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-right text-xs">
                                <thead className="bg-slate-50 text-slate-500 font-black border-b border-slate-100">
                                    <tr>
                                        <th className="p-3">التاريخ والوقت</th>
                                        <th className="p-3">المستخدم والصفة</th>
                                        <th className="p-3">المنظومة / الإجراء</th>
                                        <th className="p-3">التفاصيل الكاملة</th>
                                        <th className="p-3">عنوان IP</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                                    {auditLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-slate-50/50">
                                            <td className="p-3 font-mono text-[10px] text-slate-500">{log.timestamp}</td>
                                            <td className="p-3">
                                                <span className="font-extrabold block text-slate-900">{log.user}</span>
                                                <span className="text-[9px] text-slate-400 block">{log.role}</span>
                                            </td>
                                            <td className="p-3">
                                                <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold">
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="p-3 text-[11px] text-slate-600 font-bold">{log.details}</td>
                                            <td className="p-3 font-mono text-[10px] text-slate-400 dir-ltr text-right">{log.ip}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            )}

            {/* ==========================================
                4️⃣ MODALS (PETITION BUILDER, NEW TASK, CONTACT DETAILS, WHATSAPP, GLOBAL SEARCH)
               ========================================== */}

            {/* Quick Petition Builder + Digital Signature Modal */}
            <Modal
                isOpen={isPetitionModalOpen}
                onClose={() => setIsPetitionModalOpen(false)}
                title="منشئ العرائض السريع والتوقيع الرقمي"
                size="xl"
            >
                <div className="space-y-4 text-right font-sans" dir="rtl">
                    <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-1">
                        <span className="text-[10px] font-black text-slate-400 block">المهمة المحددة:</span>
                        <p className="text-xs font-black text-slate-900">{selectedTaskForPetition?.title}</p>
                        <p className="text-[10px] text-slate-500 font-bold">الموكل: {selectedTaskForPetition?.clientName || 'خالد الساير'}</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700">نوع المذكرة والعريضة القضائية:</label>
                        <select
                            value={petitionType}
                            onChange={(e) => setPetitionType(e.target.value)}
                            className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none"
                        >
                            <option>مذكرة دفاع ختامية أمام الدائرة العمالية - محكمة الكلية</option>
                            <option>صحيفة دعوى استئنافية كبرى</option>
                            <option>صحيفة إشكال في التنفيذ بوقف النفاذ</option>
                            <option>طلب أداء ومنع سفر مدين</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black text-slate-700">نص العريضة القانونية والأسانيد:</label>
                            <button
                                onClick={handleGenerateAiPetition}
                                disabled={isAiGeneratingPetition}
                                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 border border-amber-200 text-[10px] font-black px-3 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                                <Sparkles className="w-3 h-3 text-amber-600 animate-spin" />
                                <span>{isAiGeneratingPetition ? 'جاري الصياغة بالذكاء الاصطناعي...' : 'صياغة بالذكاء الاصطناعي (Gemini)'}</span>
                            </button>
                        </div>
                        <textarea
                            rows={10}
                            value={petitionContent}
                            onChange={(e) => setPetitionContent(e.target.value)}
                            className="w-full text-xs font-semibold border border-slate-200 rounded-xl p-3.5 bg-slate-50/60 focus:bg-white focus:outline-none leading-relaxed font-mono"
                        ></textarea>
                    </div>

                    {/* Signature Pad Simulation */}
                    <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-900">التوقيع الرقمي والختم المعتمد (أستاذ صبري شطا):</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded">موثق رقمياً</span>
                        </div>
                        <div className="h-20 bg-white border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-xs font-mono font-bold text-slate-400">
                            ✍️ [تم اعتماد التوقيع والختم الرقمي لمكتب المحامي صبري شطا]
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                        <Button variant="outline" onClick={() => setIsPetitionModalOpen(false)} className="text-xs font-bold px-4 py-2.5 rounded-xl">
                            إلغاء
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSaveAndSignPetition}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-6 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer border-none"
                        >
                            <CheckCircle2 className="w-4 h-4 text-amber-400" />
                            <span>اعتماد التوقيع والحفظ بملف المهمة</span>
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Quick WhatsApp Sender Modal */}
            <Modal
                isOpen={!!whatsappModalContact}
                onClose={() => setWhatsappModalContact(null)}
                title="مراسلة سريعة عبر WhatsApp - توثيق قانوني"
                size="md"
            >
                <div className="space-y-4 text-right font-sans" dir="rtl">
                    <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl text-xs font-bold text-emerald-950">
                        الجهة المستلمة: <span className="font-black">{whatsappModalContact?.name}</span> ({whatsappModalContact?.phone})
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700">نص الرسالة المعتمدة:</label>
                        <textarea
                            rows={6}
                            value={whatsappMessageText}
                            onChange={(e) => setWhatsappMessageText(e.target.value)}
                            className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50 focus:bg-white focus:outline-none leading-relaxed"
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => setWhatsappModalContact(null)} className="text-xs font-bold px-4 py-2">
                            إلغاء
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSendWhatsappMessage}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-6 py-2 rounded-xl flex items-center gap-2 border-none cursor-pointer"
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>فتح WhatsApp وتوثيق المراسلة</span>
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Contact Transaction History Modal */}
            <Modal
                isOpen={isContactModalOpen}
                onClose={() => setIsContactModalOpen(false)}
                title={`سجل معاملات جهة الاتصال - ${selectedContact?.name || ''}`}
                size="lg"
            >
                <div className="space-y-4 text-right font-sans" dir="rtl">
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-bold">
                        <div>
                            <span className="text-slate-400 block text-[10px]">الفئة</span>
                            <span className="text-slate-900 font-black">{selectedContact?.categoryTitle}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px]">رقم الهاتف</span>
                            <span className="text-slate-900 font-mono font-bold">{selectedContact?.phone}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px]">الرقم المدني / الملف</span>
                            <span className="text-slate-900 font-mono font-bold">{selectedContact?.civilId || '288051200192'}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 block text-[10px]">آخر تواصل</span>
                            <span className="text-amber-800 font-mono font-bold">{selectedContact?.lastContactDate}</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-900">سجل القضايا والعقود المرتبطة بالنظام:</h4>
                        <div className="bg-white border border-slate-100 rounded-xl p-3 space-y-2 text-xs font-bold">
                            <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center">
                                <span>📁 قضية عمالية رقم 882/2026 - الكلية العمالية</span>
                                <span className="text-emerald-700 font-mono text-[10px]">قيد التداول</span>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-lg flex justify-between items-center">
                                <span>📄 عقد تقديم استشارات سنوي رقم CN-2026-10</span>
                                <span className="text-sky-700 font-mono text-[10px]">ساري</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-xs font-black text-slate-900">ملاحظات وسجل التواصل المسجل:</h4>
                        <p className="text-xs text-slate-700 font-semibold bg-slate-50/80 p-3 rounded-xl border border-slate-100 whitespace-pre-line leading-relaxed">
                            {selectedContact?.notes}
                        </p>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button variant="outline" onClick={() => setIsContactModalOpen(false)} className="text-xs font-bold px-5 py-2.5 rounded-xl">
                            إغلاق
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Global Search Quick Command Palette Modal (⌘K) */}
            <Modal
                isOpen={isGlobalSearchOpen}
                onClose={() => setIsGlobalSearchOpen(false)}
                title="البحث المباشر الشامل في أدوات الإدارة (⌘K)"
                size="lg"
            >
                <div className="space-y-4 text-right font-sans" dir="rtl">
                    <div className="relative">
                        <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            autoFocus
                            placeholder="اكتب اسم المهمة، الموكل، رقم القضية، أو المحامي..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full text-sm font-bold pr-11 pl-4 py-3 bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-none rounded-xl"
                        />
                    </div>

                    <div className="max-h-80 overflow-y-auto space-y-2">
                        <span className="text-[10px] font-black text-slate-400 block">نتائج البحث في التكليفات والجهات ({filteredTasks.length + filteredContacts.length}):</span>
                        {filteredTasks.slice(0, 5).map(t => (
                            <div
                                key={t.id}
                                onClick={() => { setActiveTab('tasks'); setIsGlobalSearchOpen(false); }}
                                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-100 cursor-pointer flex justify-between items-center transition-all"
                            >
                                <div>
                                    <h5 className="text-xs font-black text-slate-900">{t.title}</h5>
                                    <p className="text-[10px] text-slate-500 font-bold">الموكل: {t.clientName || 'خالد الساير'}</p>
                                </div>
                                <span className="text-[10px] font-mono text-slate-400">#{t.id}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-2 border-t border-slate-100">
                        <Button variant="outline" onClick={() => setIsGlobalSearchOpen(false)} className="text-xs font-bold px-4 py-2">
                            إغلاق
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* New Task Form Modal Placeholder */}
            <Modal
                isOpen={isTaskFormOpen}
                onClose={() => setIsTaskFormOpen(false)}
                title="إسناد تكليف ومهمة قانونية جديدة"
                size="lg"
            >
                <div className="space-y-4 text-right font-sans" dir="rtl">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700">عنوان المهمة / التكليف:</label>
                        <input
                            type="text"
                            placeholder="مثال: إيداع صحيفة استئناف بمجمع محاكم الرقعي"
                            className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700">المسؤول / المندوب:</label>
                            <select className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50">
                                <option>أستاذ صبري شطا</option>
                                <option>أ. أحمد الصباح</option>
                                <option>المندوب جاسم العلي</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700">الأولوية:</label>
                            <select className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50">
                                <option value="URGENT">🔥 عاجلة وحرجة</option>
                                <option value="HIGH">🔴 عالية</option>
                                <option value="MEDIUM">🟡 متوسطة</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <Button variant="outline" onClick={() => setIsTaskFormOpen(false)} className="text-xs font-bold px-4 py-2">إلغاء</Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                addTask({
                                    id: `TK-${Math.floor(100 + Math.random() * 900)}`,
                                    title: 'تكليف ميداني جديد - إيداع أوراق قضائية',
                                    status: AdminTaskStatus.IN_PROGRESS,
                                    priority: AdminTaskPriority.HIGH,
                                    assignedTo: 'أستاذ صبري شطا',
                                    category: AdminTaskCategory.SECRETARIAL,
                                    dueDate: new Date().toISOString().substring(0, 10),
                                    clientName: 'خالد عبد الرحمن الساير',
                                    venue: 'مجمع محاكم الرقعي',
                                    createdAt: new Date().toISOString()
                                });
                                setIsTaskFormOpen(false);
                                addToast({ type: 'success', title: 'تم إنشاء المهمة', message: 'تم إسناد التكليف الجديد وإشعار المسؤول بنجاح.' });
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-6 py-2 rounded-xl cursor-pointer border-none"
                        >
                            إسناد المهمة
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* New Contact Form Modal Placeholder */}
            <Modal
                isOpen={isNewContactModalOpen}
                onClose={() => setIsNewContactModalOpen(false)}
                title="إضافة جهة اتصال / طرف جديد بالنظام"
                size="lg"
            >
                <div className="space-y-4 text-right font-sans" dir="rtl">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700">الاسم الكامل / اسم الشركة:</label>
                        <input
                            type="text"
                            placeholder="مثال: شركة الخليج للتوريدات التجارية"
                            className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700">رقم الهاتف:</label>
                            <input type="text" placeholder="+965 99001122" className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-black text-slate-700">النوع / التصنيف:</label>
                            <select className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50">
                                <option value="client">موكل</option>
                                <option value="opponent">خصم</option>
                                <option value="expert">خبير قضائي</option>
                                <option value="lawyer">محامي / شريك</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <Button variant="outline" onClick={() => setIsNewContactModalOpen(false)} className="text-xs font-bold px-4 py-2">إلغاء</Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                const newC: AdminContact = {
                                    id: `CNT-${Math.floor(100 + Math.random() * 900)}`,
                                    name: 'شركة الخليج للتوريدات التجارية',
                                    type: 'client',
                                    categoryTitle: 'موكل - شركة تجارية',
                                    phone: '+965 99112233',
                                    email: 'info@gulf-supplies.kw',
                                    address: 'الكويت - الشرق - برج الحصن',
                                    notes: 'جهة جديدة تم إضافتها عبر أدوات الإدارة المركزية.',
                                    linkedCasesCount: 1,
                                    linkedContractsCount: 1,
                                    linkedTasksCount: 1,
                                    lastContactDate: new Date().toISOString().substring(0, 10)
                                };
                                setContacts(prev => [newC, ...prev]);
                                setIsNewContactModalOpen(false);
                                addToast({ type: 'success', title: 'تمت إضافة جهة الاتصال', message: 'تم حفظ جهة الاتصال ورسم روابط القضايا بنجاح.' });
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-6 py-2 rounded-xl cursor-pointer border-none"
                        >
                            حفظ جهة الاتصال
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* New Notification Rule Modal */}
            <Modal
                isOpen={isRuleModalOpen}
                onClose={() => setIsRuleModalOpen(false)}
                title="إنشاء قاعدة تنبيه مخصصة جديدة"
                size="md"
            >
                <div className="space-y-4 text-right font-sans" dir="rtl">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700">عنوان القاعدة التلقائية:</label>
                        <input
                            type="text"
                            placeholder="مثال: تنبيه بـ SMS عند إيداع مذكرة جديدة"
                            value={newRuleTitle}
                            onChange={(e) => setNewRuleTitle(e.target.value)}
                            className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-slate-700">قناة الإرسال:</label>
                        <select
                            value={newRuleChannel}
                            onChange={(e) => setNewRuleChannel(e.target.value as any)}
                            className="w-full text-xs font-bold border border-slate-200 rounded-xl p-3 bg-slate-50"
                        >
                            <option value="WhatsApp">رسالة WhatsApp تلقائية</option>
                            <option value="SMS">رسالة نصية SMS</option>
                            <option value="Email">بريد إلكتروني موثق</option>
                            <option value="InApp">تنبيه بالنظام المباشر</option>
                        </select>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <Button variant="outline" onClick={() => setIsRuleModalOpen(false)} className="text-xs font-bold px-4 py-2">إلغاء</Button>
                        <Button
                            variant="primary"
                            onClick={() => {
                                const newR: AdminRule = {
                                    id: `RL-${Math.floor(100 + Math.random() * 900)}`,
                                    title: newRuleTitle || 'قاعدة تنبيه تلقائية جديدة',
                                    triggerEvent: newRuleTrigger,
                                    channel: newRuleChannel,
                                    recipientRole: 'الموكل + محامي الفرع',
                                    timeframe: 'فوري',
                                    isActive: true
                                };
                                setNotificationRules(prev => [newR, ...prev]);
                                setIsRuleModalOpen(false);
                                addToast({ type: 'success', title: 'تمت إضافة القاعدة', message: 'تم تفعيل قاعدة الإشعار الآلية بنجاح.' });
                            }}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-6 py-2 rounded-xl cursor-pointer border-none"
                        >
                            حفظ وتفعيل القاعدة
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default AdminToolsPage;
